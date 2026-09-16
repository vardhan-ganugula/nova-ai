import { Request, Response, NextFunction } from 'express';
import redis from '@/utils/redis.util.js';
import { db } from '@db/index.js';
import { users } from '@db/schema.js';
import { eq } from 'drizzle-orm';
interface AuthenticatedRequest extends Request {
  user?: any;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const sessionId = req.cookies?.session_token;

  if (!sessionId) {
    return res.status(401).json({ error: 'Unauthorized. Missing authentication cookie.' });
  }

  try {
    // 2. Fast Session Lookup via Redis
    const sessionData = await redis.get(`session:${sessionId}`);
    if (!sessionData) {
      return res.status(401).json({ error: 'Session expired or invalid.' });
    }

    const { userId } = JSON.parse(sessionData);

    // 3. Fetch User profile to ensure they exist and check verification status
    const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = userResult[0];
    if (!user) {
      return res.status(404).json({ error: 'User no longer exists.' });
    }

    // 4. Strict Verification Guard: No verification, no access
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Access Denied. Account is not verified.' });
    }

    // Attach user payload to the request context for downstream route handlers
    req.user = user; 
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error during authorization.' });
  }
}