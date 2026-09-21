import { type Request, type Response } from "express";
import crypto from "crypto";
import axios from "axios";
import { db } from "@/db/index.js";
import { socialAccounts } from "@/db/schema.js";
import { eq, and } from "drizzle-orm";
import redis from "@/utils/redis.util.js";
import {
  INSTAGRAM_APP_ID,
  INSTAGRAM_APP_SECRET,
  INSTAGRAM_REDIRECT_URI,
  CLIENT_URL,
} from "@/utils/config.util.js";
import { encryptSocialToken } from "@/utils/encryption.util.js";

const SOCIAL_ACCOUNTS_CACHE_KEY = (userId: string) => `social_accounts:${userId}`;

/**
 * 1. Initiates Real Meta/Instagram OAuth 2.0 Flow.
 * Generates cryptographically secure single-use CSRF state and redirects to Meta authorization.
 */
export async function initiateInstagramOAuth(req: any, res: Response) {
  const user = req.user;

  if (!user || !user.id) {
    return res.status(401).json({ error: "Unauthorized. Please log in first." });
  }

  // Verify server configuration
  if (!INSTAGRAM_APP_ID || !INSTAGRAM_APP_SECRET) {
    console.warn("[Instagram OAuth]: Server is missing INSTAGRAM_APP_ID or INSTAGRAM_APP_SECRET.");
    return res.redirect(
      `${CLIENT_URL}/social?instagram=error&reason=INSTAGRAM_NOT_CONFIGURED&message=${encodeURIComponent(
        "Instagram integration is not configured on the server. Please set INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET in server environment variables."
      )}`
    );
  }

  try {
    // Generate cryptographically secure single-use state
    const state = crypto.randomBytes(32).toString("hex");

    // Store state in Redis with 10-minute expiry associated with the authenticated user
    const statePayload = JSON.stringify({
      userId: user.id,
      createdAt: Date.now(),
    });
    await redis.set(`oauth:instagram:${state}`, statePayload, "EX", 600);

    // Permissions required for Instagram Graph API via Facebook Login for Business
    const scopes = [
      "instagram_basic",
      "instagram_content_publish",
      "pages_show_list",
      "pages_read_engagement",
      "business_management",
    ].join(",");

    const metaAuthUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${encodeURIComponent(
      INSTAGRAM_APP_ID
    )}&redirect_uri=${encodeURIComponent(
      INSTAGRAM_REDIRECT_URI
    )}&scope=${encodeURIComponent(scopes)}&response_type=code&state=${state}`;

    console.log(`[Instagram OAuth Started]: User ${user.id} -> redirecting to Meta OAuth dialog`);
    return res.redirect(metaAuthUrl);
  } catch (error: any) {
    console.error("[Instagram OAuth Initiate Error]:", error?.message || error);
    return res.redirect(
      `${CLIENT_URL}/social?instagram=error&reason=CONNECTION_FAILED&message=${encodeURIComponent(
        "Failed to initiate Meta OAuth authorization."
      )}`
    );
  }
}

/**
 * 2. Meta/Instagram OAuth 2.0 Callback Handler.
 * Validates state, exchanges authorization code, retrieves real Instagram account,
 * encrypts token with AES-256-GCM, and persists to PostgreSQL.
 */
export async function handleInstagramOAuthCallback(req: Request, res: Response) {
  const { code, state, error, error_reason, error_description } = req.query as Record<string, string>;

  console.log("[Instagram OAuth Callback Received]");

  // 1. Check if user denied or Meta returned an error
  if (error || error_reason) {
    console.warn("[Instagram OAuth Denied]:", error, error_description);
    return res.redirect(
      `${CLIENT_URL}/social?instagram=error&reason=OAUTH_DENIED&message=${encodeURIComponent(
        error_description || error_reason || "Instagram authorization was denied."
      )}`
    );
  }

  // 2. Validate presence of code and state
  if (!code || !state) {
    console.error("[Instagram OAuth Error]: Missing code or state");
    return res.redirect(
      `${CLIENT_URL}/social?instagram=error&reason=OAUTH_CODE_INVALID&message=${encodeURIComponent(
        "Missing authorization code or state parameter from Meta."
      )}`
    );
  }

  // 3. Validate state against Redis (CSRF Protection)
  const stateKey = `oauth:instagram:${state}`;
  const stateDataStr = await redis.get(stateKey);

  if (!stateDataStr) {
    console.error("[Instagram OAuth Error]: State not found or expired");
    return res.redirect(
      `${CLIENT_URL}/social?instagram=error&reason=OAUTH_STATE_INVALID&message=${encodeURIComponent(
        "OAuth state is invalid or has expired. Please try connecting again."
      )}`
    );
  }

  // Single-use: delete state immediately to prevent replay
  await redis.del(stateKey);

  let stateData: { userId: string; createdAt: number };
  try {
    stateData = JSON.parse(stateDataStr);
  } catch {
    return res.redirect(
      `${CLIENT_URL}/social?instagram=error&reason=OAUTH_STATE_INVALID&message=${encodeURIComponent(
        "Corrupted OAuth state payload."
      )}`
    );
  }

  const userId = stateData.userId;

  // 4. Exchange authorization code for short-lived access token
  let shortLivedToken: string;
  let initialExpiresIn: number;

  try {
    let tokenRes: any;
    try {
      // Primary: Meta standard GET request for access_token exchange
      tokenRes = await axios.get(
        "https://graph.facebook.com/v21.0/oauth/access_token",
        {
          params: {
            client_id: INSTAGRAM_APP_ID.trim(),
            client_secret: INSTAGRAM_APP_SECRET.trim(),
            redirect_uri: INSTAGRAM_REDIRECT_URI.trim(),
            code: (code || "").trim(),
          },
          timeout: 12000,
        }
      );
    } catch (getErr: any) {
      // Fallback: Standard OAuth 2.0 form-urlencoded POST
      const formData = new URLSearchParams({
        client_id: INSTAGRAM_APP_ID.trim(),
        client_secret: INSTAGRAM_APP_SECRET.trim(),
        redirect_uri: INSTAGRAM_REDIRECT_URI.trim(),
        code: (code || "").trim(),
      });
      tokenRes = await axios.post(
        "https://graph.facebook.com/v21.0/oauth/access_token",
        formData.toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 12000,
        }
      );
    }

    if (!tokenRes.data?.access_token) {
      throw new Error("No access_token returned by Meta token endpoint");
    }

    shortLivedToken = tokenRes.data.access_token;
    initialExpiresIn = tokenRes.data.expires_in || 3600;
    console.log("[Instagram Token Exchange Successful]");
  } catch (err: any) {
    const apiError = err?.response?.data?.error?.message || err?.message || "Token exchange failed";
    console.error("[Instagram Token Exchange Error]:", apiError);
    return res.redirect(
      `${CLIENT_URL}/social?instagram=error&reason=TOKEN_EXCHANGE_FAILED&message=${encodeURIComponent(
        `Meta token exchange failed: ${apiError}`
      )}`
    );
  }

  // 5. Exchange short-lived token for long-lived access token (approx 60 days)
  let longLivedToken = shortLivedToken;
  let tokenExpiresSeconds = initialExpiresIn;

  try {
    const longLivedRes = await axios.get("https://graph.facebook.com/v21.0/oauth/access_token", {
      params: {
        grant_type: "fb_exchange_token",
        client_id: INSTAGRAM_APP_ID,
        client_secret: INSTAGRAM_APP_SECRET,
        fb_exchange_token: shortLivedToken,
      },
      timeout: 12000,
    });

    if (longLivedRes.data?.access_token) {
      longLivedToken = longLivedRes.data.access_token;
      tokenExpiresSeconds = longLivedRes.data.expires_in || 5184000; // 60 days default
      console.log(`[Instagram Long-Lived Token Acquired]: Valid for ~${Math.round(tokenExpiresSeconds / 86400)} days`);
    }
  } catch (llErr: any) {
    console.warn("[Instagram Long-Lived Token Warning]: Proceeding with short-lived token", llErr?.message);
  }

  const tokenExpiresAt = new Date(Date.now() + tokenExpiresSeconds * 1000);

  // 6. Retrieve real Instagram Business / Professional Account
  let instagramAccount: {
    id: string;
    username: string;
    name: string;
    avatarUrl?: string | null;
    pageAccessToken?: string;
  } | null = null;

  try {
    // Check Facebook Pages linked to Instagram Professional Account
    const pagesRes = await axios.get("https://graph.facebook.com/v21.0/me/accounts", {
      params: {
        fields: "id,name,access_token,instagram_business_account{id,username,name,profile_picture_url}",
        access_token: longLivedToken,
      },
      timeout: 12000,
    });

    const pages = pagesRes.data?.data || [];
    for (const page of pages) {
      if (page.instagram_business_account) {
        instagramAccount = {
          id: page.instagram_business_account.id,
          username: page.instagram_business_account.username,
          name: page.instagram_business_account.name || page.instagram_business_account.username,
          avatarUrl: page.instagram_business_account.profile_picture_url || null,
          pageAccessToken: page.access_token,
        };
        break;
      }
    }

    // Direct user info lookup fallback
    if (!instagramAccount) {
      try {
        const directRes = await axios.get("https://graph.instagram.com/v21.0/me", {
          params: {
            fields: "user_id,username,name,profile_picture_url",
            access_token: longLivedToken,
          },
          timeout: 10000,
        });

        if (directRes.data && (directRes.data.username || directRes.data.user_id)) {
          instagramAccount = {
            id: directRes.data.user_id || directRes.data.id,
            username: directRes.data.username,
            name: directRes.data.name || directRes.data.username,
            avatarUrl: directRes.data.profile_picture_url || null,
          };
        }
      } catch {
        // Ignored
      }
    }
  } catch (apiErr: any) {
    const errorMsg = apiErr?.response?.data?.error?.message || apiErr?.message || "API request failed";
    console.error("[Instagram Account Lookup Error]:", errorMsg);
    return res.redirect(
      `${CLIENT_URL}/social?instagram=error&reason=INSTAGRAM_API_ERROR&message=${encodeURIComponent(
        `Failed to retrieve Instagram account details: ${errorMsg}`
      )}`
    );
  }

  if (!instagramAccount || !instagramAccount.id || !instagramAccount.username) {
    console.warn("[Instagram OAuth]: No Instagram Professional Account linked to this Meta account.");
    return res.redirect(
      `${CLIENT_URL}/social?instagram=error&reason=ACCOUNT_LOOKUP_FAILED&message=${encodeURIComponent(
        "No Instagram Professional account found. Please switch your Instagram account to Professional (Creator or Business) and link it to a Facebook Page in Meta Business Suite."
      )}`
    );
  }

  console.log(`[Instagram Account Verified]: ID=${instagramAccount.id}, Username=@${instagramAccount.username}`);

  // 7. Securely Encrypt Real Credentials at Rest (AES-256-GCM)
  const encryptedAccessToken = encryptSocialToken(longLivedToken);
  const encryptedPageAccessToken = instagramAccount.pageAccessToken
    ? encryptSocialToken(instagramAccount.pageAccessToken)
    : null;

  const cleanHandle = `@${instagramAccount.username.replace(/^@+/, "")}`;

  // 8. Persist to PostgreSQL social_accounts table
  try {
    await db
      .insert(socialAccounts)
      .values({
        userId,
        platform: "instagram",
        platformAccountId: instagramAccount.id,
        accountUsername: cleanHandle,
        accountName: instagramAccount.name,
        avatarUrl: instagramAccount.avatarUrl || null,
        accessToken: encryptedAccessToken,
        tokenExpiresAt,
        metadata: {
          pageAccessToken: encryptedPageAccessToken,
          scopes: ["instagram_basic", "instagram_content_publish", "pages_show_list"],
          connectedVia: "meta_oauth_v19",
          autoPostEnabled: true,
          includeAiDisclaimer: true,
          postFormat: "1:1 Square",
        },
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [socialAccounts.userId, socialAccounts.platform, socialAccounts.platformAccountId],
        set: {
          accountUsername: cleanHandle,
          accountName: instagramAccount.name,
          avatarUrl: instagramAccount.avatarUrl || null,
          accessToken: encryptedAccessToken,
          tokenExpiresAt,
          status: "active",
          updatedAt: new Date(),
        },
      });

    // 9. Invalidate Redis Cache
    await redis.del(SOCIAL_ACCOUNTS_CACHE_KEY(userId));

    console.log(`[Instagram Connected Successfully]: @${cleanHandle} for user ${userId}`);

    // 10. Redirect back to frontend
    return res.redirect(
      `${CLIENT_URL}/social?instagram=connected&username=${encodeURIComponent(cleanHandle)}`
    );
  } catch (dbError: any) {
    console.error("[Instagram Persistence Error]:", dbError);
    return res.redirect(
      `${CLIENT_URL}/social?instagram=error&reason=CONNECTION_FAILED&message=${encodeURIComponent(
        "Database error while storing verified Instagram connection."
      )}`
    );
  }
}
