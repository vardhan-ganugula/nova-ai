import { db } from '@db/index.js';
import { users, accounts } from '@db/schema.js';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { REDIS_URL } from '@/utils/config.util.js';
import {MailService} from './mail.service.js';


const mailService = new MailService();
const redis = new Redis(REDIS_URL);
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

    const [newUser] = await db.insert(users).values({
      email,
      username: username || generateDefaultUsername(),
      isVerified: false,
      credits: 100,
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

    let userResult;
    try {
      userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
    } catch (err: any) {
      console.error('DB Error in handleGoogleSignIn:', err.message, err.detail || '', err.hint || '');
      throw err;
    }
    let user = userResult[0];

    if (user) {
      if (!user.isVerified) {
        await db.update(users).set({ isVerified: true }).where(eq(users.id, user.id));
        user.isVerified = true;
      }

      const existingAccountResult = await db.select().from(accounts).where(and(eq(accounts.userId, user.id), eq(accounts.provider, 'google'))).limit(1);
      const existingAccount = existingAccountResult[0];

      if (!existingAccount) {
        await db.insert(accounts).values({
          userId: user.id,
          provider: 'google',
          providerAccountId: sub,
        });
      }
    } else {
      const userResult = await db.insert(users).values({
        email,
        username: generateDefaultUsername(),
        displayName: name,
        profilePicture: picture,
        isVerified: true,
        credits: 100,
      }).returning();

      user = userResult[0];

      await db.insert(accounts).values({
        userId: user.id,
        provider: 'google',
        providerAccountId: sub,
      });
    }

    const session = await this.createUserSession(user.id);
    return { ...session, user: this.sanitizeUser(user) };
  }

  async handleGithubSignIn(githubPayload: { githubId: string; email: string; name: string; picture: string }) {
    const { githubId, email, name, picture } = githubPayload;

    let userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
    let user = userResult[0];

    if (user) {
      if (!user.isVerified) {
        await db.update(users).set({ isVerified: true }).where(eq(users.id, user.id));
        user.isVerified = true;
      }

      const existingAccountResult = await db.select().from(accounts).where(and(eq(accounts.userId, user.id), eq(accounts.provider, 'github'))).limit(1);
      const existingAccount = existingAccountResult[0];

      if (!existingAccount) {
        await db.insert(accounts).values({
          userId: user.id,
          provider: 'github',
          providerAccountId: githubId,
        });
      }
    } else {
      const userResult = await db.insert(users).values({
        email: email || `${githubId}@github.user`,
        username: generateDefaultUsername(),
        displayName: name,
        profilePicture: picture,
        isVerified: true,
        credits: 100,
      }).returning();

      user = userResult[0];

      await db.insert(accounts).values({
        userId: user.id,
        provider: 'github',
        providerAccountId: githubId,
      });
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
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      profilePicture: user.profilePicture,
      isVerified: user.isVerified,
      credits: user.credits,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
