import { db } from "@/db/index.js";
import { users } from "@/db/schema.js";
import { eq, sql } from "drizzle-orm";
import { DAILY_FREE_TOKENS } from "./config.util.js";

export const PURCHASED_TOKENS_EXPIRY_DAYS = Number(process.env.PURCHASED_TOKENS_EXPIRY_DAYS) || 365;

export interface UserTokenBreakdown {
  totalActive: number;
  activeDaily: number;
  activePurchased: number;
  isDailyExpired: boolean;
  isPurchasedExpired: boolean;
  dailyExpiresAt: Date | null;
  purchasedExpiresAt: Date | null;
}

/**
 * Computes active, non-expired tokens for a user.
 */
export function calculateActiveUserTokens(user: {
  credits?: number | null;
  dailyCredits?: number | null;
  dailyCreditsExpiresAt?: Date | string | null;
  purchasedCredits?: number | null;
  purchasedCreditsExpiresAt?: Date | string | null;
}): UserTokenBreakdown {
  const now = new Date();

  const dailyExpiry = user.dailyCreditsExpiresAt ? new Date(user.dailyCreditsExpiresAt) : null;
  const isDailyExpired = dailyExpiry ? dailyExpiry <= now : false;

  const purchasedExpiry = user.purchasedCreditsExpiresAt ? new Date(user.purchasedCreditsExpiresAt) : null;
  const isPurchasedExpired = purchasedExpiry ? purchasedExpiry <= now : false;

  const activeDaily = isDailyExpired ? 0 : Math.max(0, user.dailyCredits ?? 0);
  const activePurchased = isPurchasedExpired ? 0 : Math.max(0, user.purchasedCredits ?? 0);
  const totalActive = activeDaily + activePurchased;

  return {
    totalActive,
    activeDaily,
    activePurchased,
    isDailyExpired,
    isPurchasedExpired,
    dailyExpiresAt: dailyExpiry,
    purchasedExpiresAt: purchasedExpiry,
  };
}

/**
 * Deducts tokens with strict priority:
 * 1. Expiring daily free tokens are spent FIRST.
 * 2. Long-term purchased tokens are spent only after daily tokens are exhausted.
 */
export async function deductUserTokens(userId: string, cost: number) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) {
    return { success: false, error: "User not found", creditsRemaining: 0, tokensDeducted: 0 };
  }

  const breakdown = calculateActiveUserTokens(user);

  if (breakdown.totalActive < cost) {
    return {
      success: false,
      error: `Insufficient tokens. Operation requires ${cost} tokens, but you only have ${breakdown.totalActive} active tokens (${breakdown.activeDaily} daily + ${breakdown.activePurchased} purchased).`,
      creditsRemaining: breakdown.totalActive,
      dailyCreditsRemaining: breakdown.activeDaily,
      purchasedCreditsRemaining: breakdown.activePurchased,
      tokensDeducted: 0,
    };
  }

  // Deduct from daily expiring tokens first
  const fromDaily = Math.min(breakdown.activeDaily, cost);
  const fromPurchased = cost - fromDaily;

  const newDaily = breakdown.activeDaily - fromDaily;
  const newPurchased = breakdown.activePurchased - fromPurchased;
  const newTotal = newDaily + newPurchased;

  await db
    .update(users)
    .set({
      dailyCredits: newDaily,
      purchasedCredits: newPurchased,
      credits: newTotal,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return {
    success: true,
    tokensDeducted: cost,
    fromDaily,
    fromPurchased,
    creditsRemaining: newTotal,
    dailyCreditsRemaining: newDaily,
    purchasedCreditsRemaining: newPurchased,
  };
}

/**
 * Adds purchased tokens with long-term (negligible) expiry (default: 365 days).
 */
export async function addPurchasedTokens(userId: string, amount: number, validityDays = PURCHASED_TOKENS_EXPIRY_DAYS) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) {
    throw new Error("User not found");
  }

  const breakdown = calculateActiveUserTokens(user);
  const newPurchased = breakdown.activePurchased + amount;
  const newTotal = breakdown.activeDaily + newPurchased;

  const expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);

  const [updated] = await db
    .update(users)
    .set({
      purchasedCredits: newPurchased,
      purchasedCreditsExpiresAt: expiresAt,
      credits: newTotal,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return {
    user: updated,
    added: amount,
    newPurchased,
    newTotal,
    expiresAt,
  };
}

/**
 * Calculates the next UTC midnight timestamp.
 */
export function getNextUtcMidnight(): Date {
  const nextMidnight = new Date();
  nextMidnight.setUTCHours(24, 0, 0, 0);
  return nextMidnight;
}
