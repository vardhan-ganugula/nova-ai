import { db } from '@db/index.js';
import { users, accounts } from '@db/schema.js';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import redis from '@/utils/redis.util.js';
import { v4 as uuidv4 } from 'uuid';
import { getNextUtcMidnight, calculateActiveUserTokens, PURCHASED_TOKENS_EXPIRY_DAYS } from '@/utils/credit.util.js';

import {MailService} from './mail.service.js';


const mailService = new MailService();
const SALT_ROUNDS = 10;

function generateDefaultUsername(): string {
  return `vandron_${Math.random().toString(36).substring(2, 8)}`;
}

export class AuthService {

  async registerWithPassword(email: string, password: string, username?: string) {
    let existingUser;
    try {
      existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    }catch(err: any) {
      console.dir(err, { depth: null });
      throw err;
    }
    if (existingUser.length > 0) throw new Error('Email already registered.');

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const tomorrowMidnight = getNextUtcMidnight();
    const purchasedExpiry = new Date(Date.now() + PURCHASED_TOKENS_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const [newUser] = await db.insert(users).values({
      email,
      username: username || generateDefaultUsername(),
      isVerified: false,
      credits: 100,
      dailyCredits: 50,
      dailyCreditsExpiresAt: tomorrowMidnight,
      purchasedCredits: 50,
      purchasedCreditsExpiresAt: purchasedExpiry,
    }).returning();


    await db.insert(accounts).values({
      userId: newUser.id,
      provider: 'credentials',
      providerAccountId: email,
      passwordHash: hashedPassword,
    });

    const verificationToken = uuidv4();
    await redis.set(`verify:${verificationToken}`, newUser.id, 'EX', 86400);
    await mailService.sendVerificationMail(email, newUser.username, verificationToken);

    return { message: "Registration successful. Please check your email to verify your account." };
  }

  async loginWithPassword(email: string, password: string) {
    const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = userResult[0];
    if (!user) throw new Error('Invalid email or password.');

    if (!user.isVerified) throw new Error('Account not verified. Please check your email.');

    const accountResult = await db.select().from(accounts).where(and(eq(accounts.userId, user.id), eq(accounts.provider, 'credentials'))).limit(1);
    const account = accountResult[0];
    if (!account || !account.passwordHash) throw new Error('Invalid credentials setup.');

    const isMatch = await bcrypt.compare(password, account.passwordHash);
    if (!isMatch) throw new Error('Invalid email or password.');

    const session = await this.createUserSession(user.id);
    return { ...session, user: this.sanitizeUser(user) };
  }

  async handleGoogleSignIn(googlePayload: { sub: string; email: string; name: string; picture: string }) {
    const { sub, email, name, picture } = googlePayload;
    const normalizedEmail = email ? email.trim().toLowerCase() : '';

    // 1. Check if an account already exists with provider 'google' and providerAccountId 'sub'
    const existingAccountResult = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.provider, 'google'), eq(accounts.providerAccountId, sub)))
      .limit(1);

    let user: any = null;

    if (existingAccountResult.length > 0) {
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, existingAccountResult[0].userId))
        .limit(1);
      user = userResult[0];
    }

    // 2. If not found by account, check by email
    if (!user && normalizedEmail) {
      const userByEmail = await db
        .select()
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);

      if (userByEmail.length > 0) {
        user = userByEmail[0];

        // Link Google account to this user if not yet linked
        if (existingAccountResult.length === 0) {
          await db.insert(accounts).values({
            userId: user.id,
            provider: 'google',
            providerAccountId: sub,
          });
        }
      }
    }

    // 3. If user still does not exist, create new user and link account
    if (!user) {
      const tomorrowMidnight = getNextUtcMidnight();

      const purchasedExpiry = new Date(Date.now() + PURCHASED_TOKENS_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

      const [newUser] = await db
        .insert(users)
        .values({
          email: normalizedEmail,
          username: generateDefaultUsername(),
          displayName: name || 'vandron',
          profilePicture: picture || null,
          isVerified: true,
          credits: 100,
          dailyCredits: 50,
          dailyCreditsExpiresAt: tomorrowMidnight,
          purchasedCredits: 50,
          purchasedCreditsExpiresAt: purchasedExpiry,
        })
        .returning();


      user = newUser;

      await db.insert(accounts).values({
        userId: user.id,
        provider: 'google',
        providerAccountId: sub,
      });
    } else {
      const updates: any = {};
      if (!user.isVerified) updates.isVerified = true;
      if (!user.profilePicture && picture) updates.profilePicture = picture;
      if ((!user.displayName || user.displayName === 'vandron') && name) updates.displayName = name;

      if (Object.keys(updates).length > 0) {
        await db.update(users).set(updates).where(eq(users.id, user.id));
        user = { ...user, ...updates };
      }
    }

    const session = await this.createUserSession(user.id);
    return { ...session, user: this.sanitizeUser(user) };
  }

  async handleGithubSignIn(githubPayload: { githubId: string; email: string; name: string; picture: string }) {
    const { githubId, email, name, picture } = githubPayload;
    const resolvedEmail = (email && email.trim().length > 0) ? email.trim().toLowerCase() : `${githubId}@github.user`;

    // 1. First, check if an existing account link exists for this GitHub ID
    const existingAccountResult = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.provider, 'github'), eq(accounts.providerAccountId, githubId)))
      .limit(1);

    let user: any = null;

    if (existingAccountResult.length > 0) {
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, existingAccountResult[0].userId))
        .limit(1);
      user = userResult[0];
    }

    // 2. If no account linked yet, check if a user exists with resolvedEmail
    if (!user) {
      const userByEmail = await db
        .select()
        .from(users)
        .where(eq(users.email, resolvedEmail))
        .limit(1);

      if (userByEmail.length > 0) {
        user = userByEmail[0];

        // Link GitHub account to this existing user if not yet linked
        if (existingAccountResult.length === 0) {
          await db.insert(accounts).values({
            userId: user.id,
            provider: 'github',
            providerAccountId: githubId,
          });
        }
      }
    }

    // 3. If user still does not exist, create new user and link account
    if (!user) {
      const tomorrowMidnight = getNextUtcMidnight();

      const purchasedExpiry = new Date(Date.now() + PURCHASED_TOKENS_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

      const [newUser] = await db
        .insert(users)
        .values({
          email: resolvedEmail,
          username: generateDefaultUsername(),
          displayName: name || 'vandron',
          profilePicture: picture || null,
          isVerified: true,
          credits: 100,
          dailyCredits: 50,
          dailyCreditsExpiresAt: tomorrowMidnight,
          purchasedCredits: 50,
          purchasedCreditsExpiresAt: purchasedExpiry,
        })
        .returning();


      user = newUser;

      await db.insert(accounts).values({
        userId: user.id,
        provider: 'github',
        providerAccountId: githubId,
      });
    } else {
      const updates: any = {};
      if (!user.isVerified) updates.isVerified = true;
      if (!user.profilePicture && picture) updates.profilePicture = picture;
      if ((!user.displayName || user.displayName === 'vandron') && name) updates.displayName = name;

      if (Object.keys(updates).length > 0) {
        await db.update(users).set(updates).where(eq(users.id, user.id));
        user = { ...user, ...updates };
      }
    }

    const session = await this.createUserSession(user.id);
    return { ...session, user: this.sanitizeUser(user) };
  }

  async verifyEmailToken(token: string) {
    const userId = await redis.get(`verify:${token}`);
    if (!userId) throw new Error('Invalid or expired verification token.');

    await db.update(users).set({ isVerified: true }).where(eq(users.id, userId));
    await redis.del(`verify:${token}`);

    return { message: "Account successfully verified!" };
  }

  async getCurrentUser(userId: string) {
    const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = userResult[0];
    if (!user) throw new Error('User not found.');
    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, data: { displayName?: string; username?: string }) {
    const updateData: any = { updatedAt: new Date() };
    if (data.displayName !== undefined) updateData.displayName = data.displayName;
    if (data.username !== undefined) updateData.username = data.username;

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) throw new Error("User not found.");
    return this.sanitizeUser(updatedUser);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters long.");
    }

    const [account] = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.provider, 'credentials')))
      .limit(1);

    if (!account || !account.passwordHash) {
      throw new Error("Password cannot be changed for OAuth-linked accounts (Google/GitHub).");
    }

    const isMatch = await bcrypt.compare(currentPassword, account.passwordHash);
    if (!isMatch) {
      throw new Error("Current password is incorrect.");
    }

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db
      .update(accounts)
      .set({ passwordHash: newHash })
      .where(eq(accounts.id, account.id));

    return { message: "Password updated successfully." };
  }

  async destroySession(sessionId: string) {
    await redis.del(`session:${sessionId}`);
  }

  private async createUserSession(userId: string) {
    const sessionId = uuidv4();
    await redis.set(`session:${sessionId}`, JSON.stringify({ userId }), 'EX', 604800);
    return { sessionId, userId };
  }

  private sanitizeUser(user: any) {
    const active = calculateActiveUserTokens(user);
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      profilePicture: user.profilePicture,
      isVerified: user.isVerified,
      credits: active.totalActive,
      dailyCredits: active.activeDaily,
      dailyCreditsExpiresAt: user.dailyCreditsExpiresAt,
      purchasedCredits: active.activePurchased,
      purchasedCreditsExpiresAt: user.purchasedCreditsExpiresAt,
      createdAt: user.createdAt,
    };
  }
}


export const authService = new AuthService();
