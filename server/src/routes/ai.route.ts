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
import { eq, and, desc, ne } from "drizzle-orm";
import { uploadFromFalToR2, uploadFromFalToR2WithWatermark } from "@/utils/storage.util.js";
import { inngest } from "@/inngest/client.js";
import { aiImageModels, aiChatModels, aiAudioModels, aiVideoModels } from "@/utils/ai.util.js";
import { DOWNLOAD_WATERMARK_FREE_TOKEN_COST } from "@/utils/config.util.js";
import { deductUserTokens, calculateActiveUserTokens } from "@/utils/credit.util.js";


const aiRouter = Router(); 

// Get all available AI models
aiRouter.get("/models", (req, res) => {
    res.json({
        imageModels: aiImageModels,
        chatModels: aiChatModels,
        audioModels: aiAudioModels,
        videoModels: aiVideoModels,
    });
});

const IMAGE_TOKEN_COST = 10;
const UPSCALE_TOKEN_COST = 5;
const REMOVE_BG_TOKEN_COST = 5;
const VIDEO_TOKEN_COST = 25;
const TEXT_TOKEN_COST = 2;

// Generate Text
aiRouter.post("/generate-text", requireAuth, async (req: any, res: Response) => {
    const { prompt, model } = req.body;
    const user = req.user;

    const deduction = await deductUserTokens(user.id, TEXT_TOKEN_COST);
    if (!deduction.success) {
        return res.status(403).json({
            error: deduction.error,
            credits: deduction.creditsRemaining,
        });
    }

    try {
        const generatedText = await generateTextWithOpenRouter(prompt, model);

        res.json({
            text: generatedText,
            creditsRemaining: deduction.creditsRemaining,
            tokensDeducted: TEXT_TOKEN_COST,
        });
    } catch (error: any) {
        console.error("Error generating text:", error);
        res.status(500).json({ error: error.message || "Failed to generate text" });
    }
});


// Generate Image (Inngest async event + direct Fal AI & R2 persistence)
aiRouter.post("/generate-image", requireAuth, async (req: any, res: Response) => {
    const { prompt, negativePrompt, style, aspectRatio, model, guidanceScale, steps, seed, sampler } = req.body;
    const user = req.user;
    const modelConfig = model ? (aiImageModels as any)[model] : null;
    const tokenCost = modelConfig?.price || IMAGE_TOKEN_COST;

    const deduction = await deductUserTokens(user.id, tokenCost);
    if (!deduction.success) {
        return res.status(403).json({
            error: deduction.error,
            credits: deduction.creditsRemaining,
        });
    }

    try {
        // Generate image via Fal AI with selected options
        const falImageUrl = await generateImageWithFalAI(prompt, {
            aspectRatio,
            style,
            negativePrompt,
            model,
            guidanceScale: guidanceScale ? Number(guidanceScale) : undefined,
            steps: steps ? Number(steps) : undefined,
            seed: seed ? Number(seed) : undefined,
            sampler,
        });

        // Upload to Cloudflare R2 (Original Master + Watermarked Copy)
        const filename = `img_${user.id}_${Date.now()}.jpg`;
        const storageResult = await uploadFromFalToR2WithWatermark(falImageUrl, `users/${user.id}/images`, filename);

        // Store into DB as public by default
        const [savedImage] = await db.insert(images).values({
            userId: user.id,
            prompt,
            negativePrompt: negativePrompt || null,
            style: style || null,
            aspectRatio: aspectRatio || "16:9",
            model: model || "Flux Schnell",
            r2Url: storageResult.original.presignedUrl,
            r2Key: storageResult.original.key,
            watermarkedR2Url: storageResult.watermarked.presignedUrl,
            watermarkedR2Key: storageResult.watermarked.key,
            isPublic: true, // public by default
            status: "completed",
            generationType: "generate",
        }).returning();

        // Also save to user collections
        await db.insert(collections).values({
            userId: user.id,
            imageId: savedImage.id,
        }).onConflictDoNothing();

        // Send observability event (ai/image.completed) rather than triggering a second generation
        try {
            await inngest.send({
                name: "ai/image.completed",
                data: {
                    userId: user.id,
                    imageId: savedImage.id,
                    prompt,
                    model: model || "Flux Schnell",
                },
            });
        } catch (inngestErr: any) {
            console.warn("⚠️ [Inngest Warning]:", inngestErr?.message || inngestErr);
        }

        res.json({
            message: "Image generated successfully and saved to public gallery",
            url: storageResult.original.presignedUrl,
            image: savedImage,
            creditsRemaining: deduction.creditsRemaining,
            tokensDeducted: tokenCost,
        });
    } catch (error: any) {
        console.error("Error generating image:", error);
        res.status(500).json({ error: error.message || "Failed to generate image" });
    }   
});


// Upscale Image (Fal AI clarity upscaler + Cloudflare R2)
// Upscale Image (Fal AI clarity upscaler + Cloudflare R2)
aiRouter.post("/upscale-image", requireAuth, async (req: any, res: Response) => {
    const { imageUrl, prompt } = req.body;
    const user = req.user;

    const deduction = await deductUserTokens(user.id, UPSCALE_TOKEN_COST);
    if (!deduction.success) {
        return res.status(403).json({
            error: deduction.error,
            credits: deduction.creditsRemaining,
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
            isPublic: true, // public by default
            status: "completed",
            generationType: "upscale",
        }).returning();

        await db.insert(collections).values({
            userId: user.id,
            imageId: savedImage.id,
        }).onConflictDoNothing();

        res.json({
            message: "Image upscaled to 8K UHD successfully",
            url: storageResult.original.presignedUrl,
            image: savedImage,
            creditsRemaining: deduction.creditsRemaining,
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

    const deduction = await deductUserTokens(user.id, REMOVE_BG_TOKEN_COST);
    if (!deduction.success) {
        return res.status(403).json({
            error: deduction.error,
            credits: deduction.creditsRemaining,
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
            isPublic: true, // public by default
            status: "completed",
            generationType: "remove-bg",
        }).returning();

        await db.insert(collections).values({
            userId: user.id,
            imageId: savedImage.id,
        }).onConflictDoNothing();

        res.json({
            message: "Background removed with high-fidelity alpha",
            url: storageResult.original.presignedUrl,
            image: savedImage,
            creditsRemaining: deduction.creditsRemaining,
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

    const deduction = await deductUserTokens(user.id, VIDEO_TOKEN_COST);
    if (!deduction.success) {
        return res.status(403).json({
            error: deduction.error,
            credits: deduction.creditsRemaining,
        });
    }

    try {
        const videoUrl = await generateVideoWithFalAI(prompt);

        let finalUrl = videoUrl;
        let savedVideo: any = null;
        try {
            const filename = `vid_${user.id}_${Date.now()}.mp4`;
            const storageResult = await uploadFromFalToR2(videoUrl, `users/${user.id}/videos`, filename);
            finalUrl = storageResult.presignedUrl;

            const [videoRecord] = await db.insert(images).values({
                userId: user.id,
                prompt,
                aspectRatio: "16:9",
                model: "Kling Video",
                r2Url: storageResult.presignedUrl,
                r2Key: storageResult.key,
                isPublic: true, // public by default
                status: "completed",
                generationType: "video",
            }).returning();

            savedVideo = videoRecord;

            await db.insert(collections).values({
                userId: user.id,
                imageId: videoRecord.id,
            }).onConflictDoNothing();
        } catch (storageErr) {
            console.warn("Could not upload video to R2, saving direct fal url:", storageErr);
            const [videoRecord] = await db.insert(images).values({
                userId: user.id,
                prompt,
                aspectRatio: "16:9",
                model: "Kling Video",
                r2Url: videoUrl,
                r2Key: `direct_${Date.now()}`,
                isPublic: true, // public by default
                status: "completed",
                generationType: "video",
            }).returning();
            savedVideo = videoRecord;

            await db.insert(collections).values({
                userId: user.id,
                imageId: videoRecord.id,
            }).onConflictDoNothing();
        }

        res.json({
            message: "Video generated successfully and published to public gallery",
            url: finalUrl,
            image: savedVideo,
            video: savedVideo,
            creditsRemaining: deduction.creditsRemaining,
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

        res.json({ images: userImages, history: userImages });
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

// Get Public Community Gallery (returns watermarked copies, sanitizing original r2Url)
aiRouter.get("/public-gallery", async (_req, res: Response) => {
    try {
        const publicImages = await db
            .select({
                id: images.id,
                prompt: images.prompt,
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
            .where(
                and(
                    eq(images.isPublic, true),
                    ne(images.generationType, "download")
                )
            )
            .orderBy(desc(images.createdAt))
            .limit(100);

        // Deduplicate by watermarkedR2Url so the exact same image creation never appears twice in public gallery
        const seenImageKeys = new Set<string>();
        const uniqueGalleryItems: typeof publicImages = [];

        for (const img of publicImages) {
            const key = img.watermarkedR2Url || img.id;
            if (!seenImageKeys.has(key)) {
                seenImageKeys.add(key);
                uniqueGalleryItems.push(img);
            }
        }

        // Map displayUrl to the watermarked copy for public visitors and search indexers
        const galleryWithWatermarks = uniqueGalleryItems.slice(0, 60).map((img) => ({
            id: img.id,
            prompt: img.prompt,
            watermarkedR2Url: img.watermarkedR2Url,
            displayUrl: img.watermarkedR2Url,
            aspectRatio: img.aspectRatio,
            style: img.style,
            likesCount: img.likesCount,
            createdAt: img.createdAt,
            userId: img.userId,
            author: img.author,
            authorAvatar: img.authorAvatar,
        }));

        res.json({ images: galleryWithWatermarks });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch public gallery" });
    }
});

// Download Clean Artwork Without Watermark (Requires Login, Token-Gated, Free for Owner & Already Acquired)
aiRouter.post("/images/:id/download-clean", requireAuth, async (req: any, res: Response) => {
    const user = req.user;
    const { id } = req.params;

    try {
        const targetImageResult = await db
            .select()
            .from(images)
            .where(eq(images.id, id))
            .limit(1);

        const targetImage = targetImageResult[0];
        if (!targetImage) {
            return res.status(404).json({ error: "Artwork not found" });
        }

        const isOwner = targetImage.userId === user.id;

        // Check if user has already acquired this artwork into their generations (same r2Url)
        const existingCopy = isOwner ? [] : await db
            .select()
            .from(images)
            .where(
                and(
                    eq(images.userId, user.id),
                    eq(images.r2Url, targetImage.r2Url)
                )
            )
            .limit(1);

        const alreadyInGenerations = isOwner || existingCopy.length > 0;
        const tokensDeducted = alreadyInGenerations ? 0 : DOWNLOAD_WATERMARK_FREE_TOKEN_COST;

        let newCredits = user.credits;
        if (!alreadyInGenerations && tokensDeducted > 0) {
            const deduction = await deductUserTokens(user.id, tokensDeducted);
            if (!deduction.success) {
                return res.status(403).json({
                    error: deduction.error,
                    credits: deduction.creditsRemaining,
                });
            }
            newCredits = deduction.creditsRemaining;


            // Move/copy this image to user's generations without re-uploading (same R2 storage address)
            // isPublic is FALSE so it belongs to the user's personal generations/library and never duplicates on Explore
            const [copiedGeneration] = await db.insert(images).values({
                userId: user.id,
                prompt: targetImage.prompt,
                negativePrompt: targetImage.negativePrompt,
                style: targetImage.style,
                aspectRatio: targetImage.aspectRatio,
                model: targetImage.model || "Community Download",
                r2Url: targetImage.r2Url, // Same storage address! Do not delete or re-upload!
                r2Key: targetImage.r2Key,
                watermarkedR2Url: targetImage.watermarkedR2Url,
                watermarkedR2Key: targetImage.watermarkedR2Key,
                isPublic: false, // Must be FALSE: user's personal generation copy
                status: "completed",
                generationType: "download",
            }).returning();

            // Also add to user collections for easy library management
            await db.insert(collections).values({
                userId: user.id,
                imageId: copiedGeneration.id,
            }).onConflictDoNothing();
        }

        res.json({
            message: alreadyInGenerations
                ? "Original artwork ready for download (In your generations - 0 tokens)"
                : `Clean artwork downloaded and added to your generations (${tokensDeducted} Token deducted)`,
            downloadUrl: targetImage.r2Url,
            isOwner: alreadyInGenerations,
            tokensDeducted,
            creditsRemaining: newCredits,
        });
    } catch (error: any) {
        console.error("Error processing clean download:", error);
        res.status(500).json({ error: error.message || "Failed to process download" });
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

        const active = calculateActiveUserTokens(user);

        res.json({
            credits: active.totalActive,
            dailyCredits: active.activeDaily,
            dailyCreditsExpiresAt: active.dailyExpiresAt,
            purchasedCredits: active.activePurchased,
            purchasedCreditsExpiresAt: active.purchasedExpiresAt,
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