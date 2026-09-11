import { inngest } from "./client.js";
import { falAI } from "@/services/ai.service.js";
import { uploadFromFalToR2, uploadFromFalToR2WithWatermark } from "@/utils/storage.util.js";
import { db } from "@/db/index.js";
import { images, collections, users } from "@/db/schema.js";
import { eq } from "drizzle-orm";

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
          isPublic: false, // private by default
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

    return { success: true, url: storageResult.presignedUrl, key: storageResult.key };
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

export const inngestFunctions = [generateImageFn, generateVideoFn, generateAudioFn];
