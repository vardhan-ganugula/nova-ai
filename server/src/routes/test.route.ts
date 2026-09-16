import {Router} from "express";
import { 
    generatePresignedURL, 
    uploadFromFalToR2, 
    deleteObjectFromR2
} from "@utils/storage.util.js";
import { inngest } from "@/inngest/client.js";
import { db } from "@/db/index.js";
import { users } from "@/db/schema.js";

const router = Router();



router.post('/image-upload', async (req, res) => {
    const { url, path } = req.body;
    if(!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        await uploadFromFalToR2(url, path);
        res.status(200).json({ message: 'Image uploaded successfully' });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ error: 'Failed to upload image' });
    }

})

router.post('/generate-presigned-url', async (req, res) => {
    const { path, expiresIn } = req.body;
    try {
        const presignedURL = await generatePresignedURL(path, expiresIn);
        res.status(200).json({ presignedURL });
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        res.status(500).json({ error: 'Failed to generate presigned URL' });
    }
});


router.delete('/delete-object', async (req, res) => {
    const { path } = req.body; 
    try {
        await deleteObjectFromR2(path);
        res.status(200).json({ message: 'Object deleted successfully' });
    } catch (error) {
        console.error("Error deleting object:", error);
        res.status(500).json({ error: 'Failed to delete object' });
    }
});

import { addPurchasedTokens, calculateActiveUserTokens, deductUserTokens } from "@/utils/credit.util.js";
import { eq } from "drizzle-orm";

// Trigger daily token distribution cron job event manually for testing
router.post('/trigger-daily-tokens', async (req, res) => {
    const { userId, tokens } = req.body;
    try {
        const sendResult = await inngest.send({
            name: "cron/daily-tokens.trigger",
            data: {
                userId,
                tokens: Number(tokens) || 50,
            },
        });

        res.status(200).json({
            message: "Daily tokens distribution event successfully dispatched to Inngest",
            sendResult,
        });
    } catch (error: any) {
        console.error("Error triggering daily tokens event:", error);
        res.status(500).json({ error: error.message || "Failed to trigger daily tokens" });
    }
});

// Add purchased tokens with long-term (negligible) expiry (default: 365 days)
router.post('/add-purchased-tokens', async (req, res) => {
    const { userId, tokens, validityDays } = req.body;
    if (!userId || !tokens) {
        return res.status(400).json({ error: "userId and tokens are required" });
    }

    try {
        const result = await addPurchasedTokens(userId, Number(tokens), validityDays ? Number(validityDays) : 365);
        res.status(200).json({
            message: `Successfully added ${tokens} purchased tokens (valid for ${validityDays || 365} days)`,
            result,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to add purchased tokens" });
    }
});

// Simulate daily tokens expiration for testing
router.post('/expire-daily-tokens', async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: "userId is required" });
    }

    try {
        // Set dailyCreditsExpiresAt to 1 hour ago
        const pastDate = new Date(Date.now() - 3600 * 1000);
        await db.update(users).set({ dailyCreditsExpiresAt: pastDate }).where(eq(users.id, userId));
        const [updatedUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        const active = calculateActiveUserTokens(updatedUser);

        res.status(200).json({
            message: "Simulated daily token expiration (set to past timestamp)",
            user: updatedUser,
            activeTokens: active,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to expire daily tokens" });
    }
});

// Test priority token deduction
router.post('/deduct-tokens', async (req, res) => {
    const { userId, amount } = req.body;
    if (!userId || !amount) {
        return res.status(400).json({ error: "userId and amount are required" });
    }

    try {
        const result = await deductUserTokens(userId, Number(amount));
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to deduct tokens" });
    }
});

// Inspect users and current token/credit balances with full breakdown
router.get('/users-credits', async (req, res) => {
    try {
        const userList = await db
            .select({
                id: users.id,
                email: users.email,
                username: users.username,
                credits: users.credits,
                dailyCredits: users.dailyCredits,
                dailyCreditsExpiresAt: users.dailyCreditsExpiresAt,
                purchasedCredits: users.purchasedCredits,
                purchasedCreditsExpiresAt: users.purchasedCreditsExpiresAt,
                updatedAt: users.updatedAt,
            })
            .from(users);

        const usersWithActive = userList.map((u) => {
            const active = calculateActiveUserTokens(u);
            return {
                ...u,
                active,
            };
        });

        res.status(200).json({ users: usersWithActive });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch user credits" });
    }
});

export default router;
