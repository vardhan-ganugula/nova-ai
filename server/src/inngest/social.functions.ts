import { inngest } from "./client.js";
import { db } from "@/db/index.js";
import { socialAccounts, socialPosts, socialWebhooks } from "@/db/schema.js";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import axios from "axios";
import { decryptSocialToken } from "@/utils/encryption.util.js";

export const publishSocialPostFn = inngest.createFunction(
  { id: "publish-social-post", triggers: [{ event: "social/post.publish" }] },
  async ({ event, step }: any) => {
    const { postId, userId } = event.data;

    // Step 1: Fetch post and verify existence
    const post = await step.run("fetch-post", async () => {
      const [record] = await db
        .select()
        .from(socialPosts)
        .where(eq(socialPosts.id, postId))
        .limit(1);

      if (!record) {
        throw new Error(`Post ${postId} not found`);
      }
      return record;
    });

    // Step 2: If scheduled for later, sleep until the scheduled time
    if (post.scheduledFor && new Date(post.scheduledFor).getTime() > Date.now()) {
      await step.sleepUntil("wait-for-schedule", new Date(post.scheduledFor));
    }

    // Step 3: Transition status to 'publishing'
    await step.run("mark-publishing", async () => {
      await db
        .update(socialPosts)
        .set({ status: "publishing", updatedAt: new Date() })
        .where(eq(socialPosts.id, postId));
    });

    // Step 4: Dispatch to target social channels using stored auth tokens
    const dispatchResults = await step.run("dispatch-to-platforms", async () => {
      const platforms: string[] = Array.isArray(post.targetPlatforms)
        ? (post.targetPlatforms as string[])
        : [];

      // Query user's connected social accounts and stored tokens
      const connectedAccounts = await db
        .select()
        .from(socialAccounts)
        .where(eq(socialAccounts.userId, userId));

      const platformPostIds: Record<string, string> = {};

      for (const platform of platforms) {
        const matchingAccount = connectedAccounts.find(
          (a) => a.platform === platform && (a.status === "active" || a.status === "connected")
        );

        // 1. Real Instagram Publishing via Meta Graph API
        if (platform === "instagram") {
          try {
            if (!matchingAccount || !matchingAccount.accessToken) {
              throw new Error(
                "Cannot publish to Instagram: No verified Instagram account connected. Please connect via Meta OAuth first."
              );
            }

            const decryptedToken = decryptSocialToken(matchingAccount.accessToken);
            const igUserId = matchingAccount.platformAccountId;

            console.log(`[Instagram Publish Started]: User ${userId}, Post ${postId}, IG User ID ${igUserId}`);

            // Step A: Create Media Container
            const containerUrl = `https://graph.facebook.com/v21.0/${igUserId}/media`;
            const containerParams: Record<string, any> = {
              caption: post.caption,
              access_token: decryptedToken,
            };

            if (post.mediaType === "video") {
              containerParams.video_url = post.mediaUrl;
              containerParams.media_type = "REELS";
            } else {
              containerParams.image_url = post.mediaUrl;
            }

            let creationId: string;
            try {
              const containerRes = await axios.post(containerUrl, null, {
                params: containerParams,
                timeout: 20000,
              });

              if (!containerRes.data?.id) {
                throw new Error("Meta API did not return container creation ID");
              }
              creationId = containerRes.data.id;
              console.log(`[Instagram Container Created]: ID ${creationId}`);
            } catch (containerErr: any) {
              const msg =
                containerErr?.response?.data?.error?.message ||
                containerErr?.message ||
                "Failed to create Instagram media container";
              console.error("[Instagram Container Error]:", msg);
              throw new Error(`Meta Instagram API: ${msg}`);
            }

            // Step B: If video, wait for processing to finish
            if (post.mediaType === "video") {
              let attempts = 0;
              let finished = false;
              while (!finished && attempts < 10) {
                attempts++;
                await new Promise((resolve) => setTimeout(resolve, 3000));
                try {
                  const statusRes = await axios.get(`https://graph.facebook.com/v21.0/${creationId}`, {
                    params: { fields: "status_code", access_token: decryptedToken },
                    timeout: 10000,
                  });
                  const code = statusRes.data?.status_code;
                  if (code === "FINISHED") {
                    finished = true;
                  } else if (code === "ERROR") {
                    throw new Error("Meta reported ERROR during video upload processing.");
                  }
                } catch (pollErr: any) {
                  console.warn("[Instagram Poll Warning]:", pollErr?.message);
                }
              }
            }

            // Step C: Publish Media Container
            const publishUrl = `https://graph.facebook.com/v21.0/${igUserId}/media_publish`;
            let publishedMediaId: string;
            try {
              const publishRes = await axios.post(publishUrl, null, {
                params: {
                  creation_id: creationId,
                  access_token: decryptedToken,
                },
                timeout: 20000,
              });

              if (!publishRes.data?.id) {
                throw new Error("Meta API did not return published media ID");
              }
              publishedMediaId = publishRes.data.id;
              console.log(`[Instagram Publish Succeeded]: Media ID ${publishedMediaId}`);
            } catch (pubErr: any) {
              const msg =
                pubErr?.response?.data?.error?.message ||
                pubErr?.message ||
                "Failed to publish Instagram media container";
              console.error("[Instagram Publish Error]:", msg);
              throw new Error(`Meta Instagram Publish Error: ${msg}`);
            }

            platformPostIds["instagram"] = publishedMediaId;
            continue;
          } catch (igErr: any) {
            const errorMsg = igErr?.message || "Failed to publish to Instagram";
            console.error("[Instagram Publish Failed]:", errorMsg);
            platformPostIds["instagram"] = `failed: ${errorMsg}`;
            await db
              .update(socialPosts)
              .set({
                status: "failed",
                errorMessage: errorMsg,
                updatedAt: new Date(),
              })
              .where(eq(socialPosts.id, postId));
            throw igErr;
          }
        }

        // 2. Real Discord Webhook Delivery
        const rawToken = matchingAccount?.accessToken;
        const decryptedToken = rawToken ? decryptSocialToken(rawToken) : "";
        const handle = matchingAccount?.accountUsername?.replace(/^@/, "") || "creator";

        if (platform === "discord" && decryptedToken && (decryptedToken.startsWith("http://") || decryptedToken.startsWith("https://"))) {
          try {
            await axios.post(
              decryptedToken,
              {
                content: post.caption,
                embeds: [
                  {
                    title: "Nova AI Studio Creation",
                    description: post.caption.substring(0, 200),
                    image: { url: post.mediaUrl },
                    footer: { text: `Posted via Nova Studio for @${handle}` },
                  },
                ],
              },
              { timeout: 8000 }
            );
            platformPostIds["discord"] = "discord_webhook_delivered";
          } catch (err: any) {
            console.warn(`[Discord Webhook Delivery Error]:`, err?.message || err);
            platformPostIds["discord"] = "discord_webhook_failed";
          }
        } else {
          // Unsupported or unconfigured direct publish for other channels
          platformPostIds[platform] = `${platform}_pending_manual`;
        }
      }

      return platformPostIds;
    });

    // Step 5: Mark status as 'published' and record post URLs
    const updatedPost = await step.run("mark-published", async () => {
      const [updated] = await db
        .update(socialPosts)
        .set({
          status: "published",
          publishedAt: new Date(),
          platformPostIds: dispatchResults,
          errorMessage: null,
          updatedAt: new Date(),
        })
        .where(eq(socialPosts.id, postId))
        .returning();

      return updated;
    });

    // Step 6: Dispatch n8n Webhook if configured
    await step.run("dispatch-n8n-webhook", async () => {
      try {
        const [webhookConfig] = await db
          .select()
          .from(socialWebhooks)
          .where(eq(socialWebhooks.userId, userId))
          .limit(1);

        if (webhookConfig && webhookConfig.isActive && webhookConfig.webhookUrl) {
          const events = Array.isArray(webhookConfig.events)
            ? (webhookConfig.events as string[])
            : [];

          if (events.includes("post.published") || events.includes("*")) {
            const payload = {
              event: "post.published",
              timestamp: new Date().toISOString(),
              data: {
                postId: updatedPost.id,
                mediaUrl: updatedPost.mediaUrl,
                mediaType: updatedPost.mediaType,
                caption: updatedPost.caption,
                platforms: updatedPost.targetPlatforms,
                platformUrls: updatedPost.platformPostIds,
                publishedAt: updatedPost.publishedAt,
              },
            };

            const signature = crypto
              .createHmac("sha256", webhookConfig.secret || "nova_secret")
              .update(JSON.stringify(payload))
              .digest("hex");

            await axios.post(webhookConfig.webhookUrl, payload, {
              headers: {
                "Content-Type": "application/json",
                "x-nova-signature": signature,
                "x-nova-event": "post.published",
              },
              timeout: 5000,
            });

            await db
              .update(socialWebhooks)
              .set({ lastTriggeredAt: new Date(), updatedAt: new Date() })
              .where(eq(socialWebhooks.id, webhookConfig.id));
          }
        }
      } catch (err: any) {
        console.warn(`[n8n Webhook Warning] Could not deliver to user webhook:`, err?.message || err);
      }
    });

    return { success: true, post: updatedPost };
  }
);
