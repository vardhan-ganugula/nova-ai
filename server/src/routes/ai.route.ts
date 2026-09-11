import { Router, type Response } from "express"; 
import { generateTextWithOpenRouter } from "@services/ai.service.js";
import { 
    generateImageWithFalAI, 
    generateVideoWithFalAI,
    upscaleImageWithFalAI,
    removeBackgroundWithFalAI 
} from "@/controllers/ai.controller.js";
import { requireAuth } from "@/middlewares/auth.middleware.js";
import { db } from "@/db/index.js";
import { users, images, collections, imageLikes } from "@/db/schema.js";
import { eq, and, desc } from "drizzle-orm";
import { uploadFromFalToR2, uploadFromFalToR2WithWatermark } from "@/utils/storage.util.js";
import { inngest } from "@/inngest/client.js";

const aiRouter = Router(); 

const IMAGE_TOKEN_COST = 10;
const UPSCALE_TOKEN_COST = 5;
const REMOVE_BG_TOKEN_COST = 5;
const VIDEO_TOKEN_COST = 25;
const TEXT_TOKEN_COST = 2;

// Generate Text
aiRouter.post("/generate-text", requireAuth, async (req: any, res: Response) => {
    const { prompt, model } = req.body;
    const user = req.user;

    if (user.credits < TEXT_TOKEN_COST) {
        return res.status(403).json({
            error: `Insufficient tokens. Text generation requires ${TEXT_TOKEN_COST} tokens, but you only have ${user.credits} tokens.`,
            credits: user.credits,
        });
    }

    try {
        const generatedText = await generateTextWithOpenRouter(prompt, model);

        const newCredits = user.credits - TEXT_TOKEN_COST;
        await db.update(users).set({ credits: newCredits }).where(eq(users.id, user.id));

        res.json({
            text: generatedText,
            creditsRemaining: newCredits,
            tokensDeducted: TEXT_TOKEN_COST,
        });
    } catch (error: any) {
        console.error("Error generating text:", error);
        res.status(500).json({ error: error.message || "Failed to generate text" });
    }
});

// Generate Image (Inngest async event + direct Fal AI & R2 persistence)
aiRouter.post("/generate-image", requireAuth, async (req: any, res: Response) => {
    const { prompt, negativePrompt, style, aspectRatio, model } = req.body;
    const user = req.user;

    if (user.credits < IMAGE_TOKEN_COST) {
        return res.status(403).json({
            error: `Insufficient tokens. Image generation requires ${IMAGE_TOKEN_COST} tokens, but you only have ${user.credits} tokens.`,
            credits: user.credits,
        });
    }

    try {
        // Trigger Inngest event for background observability & workflow handling
        await inngest.send({
            name: "ai/image.generate",
            data: {
                userId: user.id,
                prompt,
                negativePrompt,
                style,
                aspectRatio,
                model,
            },
        });

        // Generate image via Fal AI with selected options
        const falImageUrl = await generateImageWithFalAI(prompt, {
            aspectRatio,
            style,
            negativePrompt,
            model,
        });

        // Upload to Cloudflare R2 (Original Master + Watermarked Copy)
        const filename = `img_${user.id}_${Date.now()}.jpg`;
        const storageResult = await uploadFromFalToR2WithWatermark(falImageUrl, `users/${user.id}/images`, filename);

        // Store into DB as private by default
        const [savedImage] = await db.insert(images).values({
            userId: user.id,
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
        }).returning();

        // Also save to user collections
        await db.insert(collections).values({
            userId: user.id,
            imageId: savedImage.id,
        }).onConflictDoNothing();

        // Deduct user tokens
        const newCredits = user.credits - IMAGE_TOKEN_COST;
        await db.update(users).set({ credits: newCredits }).where(eq(users.id, user.id));

        res.json({
            message: "Image generated successfully and saved to private collection",
            url: storageResult.original.presignedUrl,
            image: savedImage,
            creditsRemaining: newCredits,
            tokensDeducted: IMAGE_TOKEN_COST,
        });
    } catch (error: any) {
        console.error("Error generating image:", error);
        res.status(500).json({ error: error.message || "Failed to generate image" });
    }   
});

// Upscale Image (Fal AI clarity upscaler + Cloudflare R2)
aiRouter.post("/upscale-image", requireAuth, async (req: any, res: Response) => {
    const { imageUrl, prompt } = req.body;
    const user = req.user;

    if (user.credits < UPSCALE_TOKEN_COST) {
        return res.status(403).json({
            error: `Insufficient tokens. Upscaling requires ${UPSCALE_TOKEN_COST} tokens, but you only have ${user.credits} tokens.`,
            credits: user.credits,
        });
    }

    try {
        const falUpscaledUrl = await upscaleImageWithFalAI(imageUrl);
        const filename = `upscale_${user.id}_${Date.now()}.jpg`;
        const storageResult = await uploadFromFalToR2WithWatermark(falUpscaledUrl, `users/${user.id}/upscaled`, filename);

        const [savedImage] = await db.insert(images).values({
            userId: user.id,
            prompt: prompt || "Upscaled artwork",
            r2Url: storageResult.original.presignedUrl,
            r2Key: storageResult.original.key,
            watermarkedR2Url: storageResult.watermarked.presignedUrl,
            watermarkedR2Key: storageResult.watermarked.key,
            isPublic: false,
            status: "completed",
            generationType: "upscale",
        }).returning();

        await db.insert(collections).values({
            userId: user.id,
            imageId: savedImage.id,
        }).onConflictDoNothing();

        const newCredits = user.credits - UPSCALE_TOKEN_COST;
        await db.update(users).set({ credits: newCredits }).where(eq(users.id, user.id));

        res.json({
            message: "Image upscaled to 8K UHD successfully",
            url: storageResult.original.presignedUrl,
            image: savedImage,
            creditsRemaining: newCredits,
            tokensDeducted: UPSCALE_TOKEN_COST,
        });
    } catch (error: any) {
        console.error("Error upscaling image:", error);
        res.status(500).json({ error: error.message || "Failed to upscale image" });
    }
});

// Remove Background (Fal AI BiRefNet + Cloudflare R2)
aiRouter.post("/remove-bg", requireAuth, async (req: any, res: Response) => {
    const { imageUrl, prompt } = req.body;
    const user = req.user;

    if (user.credits < REMOVE_BG_TOKEN_COST) {
        return res.status(403).json({
            error: `Insufficient tokens. Background removal requires ${REMOVE_BG_TOKEN_COST} tokens, but you only have ${user.credits} tokens.`,
            credits: user.credits,
        });
    }

    try {
        const falNoBgUrl = await removeBackgroundWithFalAI(imageUrl);
        const filename = `nobg_${user.id}_${Date.now()}.png`;
        const storageResult = await uploadFromFalToR2WithWatermark(falNoBgUrl, `users/${user.id}/nobg`, filename);

        const [savedImage] = await db.insert(images).values({
            userId: user.id,
            prompt: prompt || "Alpha mask background removal",
            r2Url: storageResult.original.presignedUrl,
            r2Key: storageResult.original.key,
            watermarkedR2Url: storageResult.watermarked.presignedUrl,
            watermarkedR2Key: storageResult.watermarked.key,
            isPublic: false,
            status: "completed",
            generationType: "remove-bg",
        }).returning();

        await db.insert(collections).values({
            userId: user.id,
            imageId: savedImage.id,
        }).onConflictDoNothing();

        const newCredits = user.credits - REMOVE_BG_TOKEN_COST;
        await db.update(users).set({ credits: newCredits }).where(eq(users.id, user.id));

        res.json({
            message: "Background removed with high-fidelity alpha",
            url: storageResult.original.presignedUrl,
            image: savedImage,
            creditsRemaining: newCredits,
            tokensDeducted: REMOVE_BG_TOKEN_COST,
        });
    } catch (error: any) {
        console.error("Error removing background:", error);
        res.status(500).json({ error: error.message || "Failed to remove background" });
    }
});

// Generate Video
aiRouter.post("/generate-video", requireAuth, async (req: any, res: Response) => {
    const { prompt } = req.body;
    const user = req.user;

    if (user.credits < VIDEO_TOKEN_COST) {
        return res.status(403).json({
            error: `Insufficient tokens. Video generation requires ${VIDEO_TOKEN_COST} tokens, but you only have ${user.credits} tokens.`,
            credits: user.credits,
        });
    }

    try {
        await inngest.send({
            name: "ai/video.generate",
            data: { userId: user.id, prompt },
        });

        const videoUrl = await generateVideoWithFalAI(prompt);

        const newCredits = user.credits - VIDEO_TOKEN_COST;
        await db.update(users).set({ credits: newCredits }).where(eq(users.id, user.id));

        res.json({
            message: "Video generated successfully",
            url: videoUrl,
            creditsRemaining: newCredits,
            tokensDeducted: VIDEO_TOKEN_COST,
        });
    } catch (error: any) {
        console.error("Error generating video:", error);
        res.status(500).json({ error: error.message || "Failed to generate video" });
    }   
});

// Get User History
aiRouter.get("/user-history", requireAuth, async (req: any, res: Response) => {
    const user = req.user;
    try {
        const userImages = await db
            .select()
            .from(images)
            .where(eq(images.userId, user.id))
            .orderBy(desc(images.createdAt));

        res.json({ images: userImages });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch user history" });
    }
});

// Get User Collections
aiRouter.get("/user-collections", requireAuth, async (req: any, res: Response) => {
    const user = req.user;
    try {
        const userCollections = await db
            .select({
                id: images.id,
                prompt: images.prompt,
                r2Url: images.r2Url,
                style: images.style,
                aspectRatio: images.aspectRatio,
                isPublic: images.isPublic,
                likesCount: images.likesCount,
                generationType: images.generationType,
                createdAt: images.createdAt,
            })
            .from(collections)
            .innerJoin(images, eq(collections.imageId, images.id))
            .where(eq(collections.userId, user.id))
            .orderBy(desc(collections.createdAt));

        res.json({ collections: userCollections });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch user collections" });
    }
});

// Get Public Community Gallery (returns watermarked copies)
aiRouter.get("/public-gallery", async (_req, res: Response) => {
    try {
        const publicImages = await db
            .select({
                id: images.id,
                prompt: images.prompt,
                r2Url: images.r2Url,
                watermarkedR2Url: images.watermarkedR2Url,
                aspectRatio: images.aspectRatio,
                style: images.style,
                likesCount: images.likesCount,
                createdAt: images.createdAt,
                userId: images.userId,
                author: users.displayName,
                authorAvatar: users.profilePicture,
            })
            .from(images)
            .leftJoin(users, eq(images.userId, users.id))
            .where(eq(images.isPublic, true))
            .orderBy(desc(images.createdAt))
            .limit(60);

        // Map displayUrl to the watermarked copy (fallback to r2Url if watermark not present)
        const galleryWithWatermarks = publicImages.map((img) => ({
            ...img,
            displayUrl: img.watermarkedR2Url || img.r2Url,
        }));

        res.json({ images: galleryWithWatermarks });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch public gallery" });
    }
});

// Get Token Usage & History for Settings Page
aiRouter.get("/token-usage", requireAuth, async (req: any, res: Response) => {
    const user = req.user;
    try {
        const recentGenerations = await db
            .select({
                id: images.id,
                prompt: images.prompt,
                type: images.generationType,
                r2Url: images.r2Url,
                status: images.status,
                isPublic: images.isPublic,
                createdAt: images.createdAt,
            })
            .from(images)
            .where(eq(images.userId, user.id))
            .orderBy(desc(images.createdAt))
            .limit(20);

        const historyWithTokens = recentGenerations.map((item) => {
            let tokensDeducted = 10;
            if (item.type === "upscale") tokensDeducted = 5;
            else if (item.type === "remove-bg") tokensDeducted = 5;
            else if (item.type === "video") tokensDeducted = 25;
            else if (item.type === "text") tokensDeducted = 2;

            return {
                ...item,
                tokensDeducted,
            };
        });

        res.json({
            credits: user.credits,
            tokenCosts: {
                image: IMAGE_TOKEN_COST,
                upscale: UPSCALE_TOKEN_COST,
                removeBg: REMOVE_BG_TOKEN_COST,
                video: VIDEO_TOKEN_COST,
                text: TEXT_TOKEN_COST,
            },
            history: historyWithTokens,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch token usage" });
    }
});

// Toggle Public / Private Visibility
aiRouter.patch("/images/:id/toggle-visibility", requireAuth, async (req: any, res: Response) => {
    const { id } = req.params;
    const user = req.user;

    try {
        const [existing] = await db
            .select()
            .from(images)
            .where(and(eq(images.id, id), eq(images.userId, user.id)))
            .limit(1);

        if (!existing) {
            return res.status(404).json({ error: "Image not found or unauthorized" });
        }

        const updatedPublic = !existing.isPublic;
        const [updated] = await db
            .update(images)
            .set({ isPublic: updatedPublic, updatedAt: new Date() })
            .where(eq(images.id, id))
            .returning();

        res.json({
            message: updatedPublic ? "Image published to community feed" : "Image is now private",
            isPublic: updatedPublic,
            image: updated,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to toggle visibility" });
    }
});

// Toggle Like on Public Image
aiRouter.post("/images/:id/like", requireAuth, async (req: any, res: Response) => {
    const { id } = req.params;
    const user = req.user;

    try {
        const [targetImage] = await db.select().from(images).where(eq(images.id, id)).limit(1);
        if (!targetImage) {
            return res.status(404).json({ error: "Image not found" });
        }

        // Instruction 3: other users can only like if image is public
        if (!targetImage.isPublic) {
            return res.status(403).json({ error: "Cannot like private artwork. The creator must make it public first." });
        }

        const [existingLike] = await db
            .select()
            .from(imageLikes)
            .where(and(eq(imageLikes.userId, user.id), eq(imageLikes.imageId, id)))
            .limit(1);

        let liked = false;
        let newCount = targetImage.likesCount;

        if (existingLike) {
            await db.delete(imageLikes).where(eq(imageLikes.id, existingLike.id));
            newCount = Math.max(0, newCount - 1);
            liked = false;
        } else {
            await db.insert(imageLikes).values({
                userId: user.id,
                imageId: id,
            });
            newCount += 1;
            liked = true;
        }

        await db.update(images).set({ likesCount: newCount }).where(eq(images.id, id));

        res.json({
            liked,
            likesCount: newCount,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to toggle like" });
    }
});

export default aiRouter;