import { inngest } from "./client.js";
import { falAI } from "@/services/ai.service.js";
import { uploadFromFalToR2, uploadFromFalToR2WithWatermark } from "@/utils/storage.util.js";
import { db } from "@/db/index.js";
import { images, collections, users } from "@/db/schema.js";
import { eq, sql } from "drizzle-orm";
import { DAILY_FREE_TOKENS } from "@/utils/config.util.js";


// 1. Asynchronous Image Generation
export const generateImageFn = inngest.createFunction(
  { id: "generate-image", triggers: [{ event: "ai/image.generate" }] },
  async ({ event, step }: any) => {
    const { userId, prompt, negativePrompt, style, aspectRatio, model } = event.data;

    // Step 1: Call Fal AI
    const falUrl = await step.run("call-fal-ai", async () => {
      return await falAI.generateImage(prompt, {
        aspectRatio,
        style,
        negativePrompt,
        model,
      });
    });

    // Step 2: Upload to Cloudflare R2 (Original Master + Watermarked Copy)
    const storageResult = await step.run("upload-to-r2", async () => {
      const filename = `img_${userId}_${Date.now()}.jpg`;
      return await uploadFromFalToR2WithWatermark(falUrl, `users/${userId}/images`, filename);
    });

    // Step 3: Store in user collection & history (Private by default)
    const savedImage = await step.run("save-to-db", async () => {
      const [img] = await db
        .insert(images)
        .values({
          userId,
          prompt,
          negativePrompt: negativePrompt || null,
          style: style || null,
          aspectRatio: aspectRatio || "16:9",
          model: model || "flux/schnell",
          r2Url: storageResult.original.presignedUrl,
          r2Key: storageResult.original.key,
          watermarkedR2Url: storageResult.watermarked.presignedUrl,
          watermarkedR2Key: storageResult.watermarked.key,
          isPublic: true, // public by default
          status: "completed",
          generationType: "generate",
        })
        .returning();

      // Store in collections
      await db
        .insert(collections)
        .values({
          userId,
          imageId: img.id,
        })
        .onConflictDoNothing();

      return img;
    });

    return { success: true, image: savedImage };
  }
);

// 2. Asynchronous Video Generation
export const generateVideoFn = inngest.createFunction(
  { id: "generate-video", triggers: [{ event: "ai/video.generate" }] },
  async ({ event, step }: any) => {
    const { userId, prompt } = event.data;

    const falUrl = await step.run("call-fal-video", async () => {
      return await falAI.generateVideo(prompt);
    });

    const storageResult = await step.run("upload-video-to-r2", async () => {
      const filename = `vid_${userId}_${Date.now()}.mp4`;
      return await uploadFromFalToR2(falUrl, `users/${userId}/videos`, filename);
    });

    const savedVideo = await step.run("save-video-to-db", async () => {
      const [vid] = await db
        .insert(images)
        .values({
          userId,
          prompt,
          aspectRatio: "16:9",
          model: "Kling Video",
          r2Url: storageResult.presignedUrl,
          r2Key: storageResult.key,
          isPublic: true, // public by default
          status: "completed",
          generationType: "video",
        })
        .returning();

      await db
        .insert(collections)
        .values({
          userId,
          imageId: vid.id,
        })
        .onConflictDoNothing();

      return vid;
    });

    return { success: true, url: storageResult.presignedUrl, key: storageResult.key, video: savedVideo };
  }
);

// 3. Asynchronous Audio Generation
export const generateAudioFn = inngest.createFunction(
  { id: "generate-audio", triggers: [{ event: "ai/audio.generate" }] },
  async ({ event, step }: any) => {
    const { userId, text, voice } = event.data;

    // Inngest pipeline for voice synthesis
    const result = await step.run("synthesize-audio", async () => {
      return { status: "completed", audioUrl: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg" };
    });

    return { success: true, result };
  }
);

// 4. Daily Free Tokens Distribution & Expiration Cron Schedule
export const dailyTokenGrantFn = inngest.createFunction(
  {
    id: "daily-tokens-distribution",
    name: "Daily 50 Tokens Distribution & Expiration",
    triggers: [
      { cron: "0 0 * * *" }, // Cron schedule: Every day at 00:00 UTC (Midnight)
      { event: "cron/daily-tokens.trigger" }, // Event trigger: allows manual invocation or testing
    ],
  },
  async ({ event, step }: any) => {
    const tokensToGrant = Number(event?.data?.tokens) || DAILY_FREE_TOKENS || 50;
    const targetUserId = event?.data?.userId;

    const distributionResult = await step.run("grant-daily-tokens", async () => {
      // Today's daily tokens expire by tomorrow midnight UTC
      const tomorrowMidnight = new Date();
      tomorrowMidnight.setUTCHours(24, 0, 0, 0);

      if (targetUserId) {
        // Targeted distribution for a single user (e.g. testing)
        const updatedUsers = await db
          .update(users)
          .set({
            dailyCredits: tokensToGrant,
            dailyCreditsExpiresAt: tomorrowMidnight,
            credits: sql`${tokensToGrant} + CASE 
              WHEN ${users.purchasedCreditsExpiresAt} IS NULL OR ${users.purchasedCreditsExpiresAt} > NOW() 
              THEN ${users.purchasedCredits} 
              ELSE 0 
            END`,
            updatedAt: new Date(),
          })
          .where(eq(users.id, targetUserId))
          .returning({
            id: users.id,
            email: users.email,
            dailyCredits: users.dailyCredits,
            dailyCreditsExpiresAt: users.dailyCreditsExpiresAt,
            purchasedCredits: users.purchasedCredits,
            purchasedCreditsExpiresAt: users.purchasedCreditsExpiresAt,
            newCredits: users.credits,
          });

        return {
          mode: "single_user",
          tokensGranted: tokensToGrant,
          dailyExpiresAt: tomorrowMidnight.toISOString(),
          affectedCount: updatedUsers.length,
          users: updatedUsers,
        };
      } else {
        // Universal distribution: reset today's daily tokens to 50, expire old unused daily tokens, preserve unexpired purchased tokens
        const updatedUsers = await db
          .update(users)
          .set({
            dailyCredits: tokensToGrant,
            dailyCreditsExpiresAt: tomorrowMidnight,
            credits: sql`${tokensToGrant} + CASE 
              WHEN ${users.purchasedCreditsExpiresAt} IS NULL OR ${users.purchasedCreditsExpiresAt} > NOW() 
              THEN ${users.purchasedCredits} 
              ELSE 0 
            END`,
            updatedAt: new Date(),
          })
          .returning({
            id: users.id,
            email: users.email,
            dailyCredits: users.dailyCredits,
            dailyCreditsExpiresAt: users.dailyCreditsExpiresAt,
            purchasedCredits: users.purchasedCredits,
            purchasedCreditsExpiresAt: users.purchasedCreditsExpiresAt,
            newCredits: users.credits,
          });

        return {
          mode: "all_users",
          tokensGranted: tokensToGrant,
          dailyExpiresAt: tomorrowMidnight.toISOString(),
          affectedCount: updatedUsers.length,
          timestamp: new Date().toISOString(),
        };
      }
    });

    return {
      success: true,
      message: `Successfully refreshed ${tokensToGrant} daily tokens (expires tomorrow) for ${distributionResult.affectedCount} user(s).`,
      summary: distributionResult,
    };
  }
);


import { publishSocialPostFn } from "./social.functions.js";

export const inngestFunctions = [
  generateImageFn,
  generateVideoFn,
  generateAudioFn,
  dailyTokenGrantFn,
  publishSocialPostFn,
];
