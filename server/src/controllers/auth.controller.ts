import { type Request, type Response } from "express";
import { authService } from "@services/auth.service.js";
import { CLIENT_URL, REDIS_URL } from "@utils/config.util.js";
import { MailService } from "@/services/mail.service.js";
import { aiImageModels, aiChatModels, aiAudioModels, aiVideoModels } from "@/utils/ai.util.js";

const mailService = new MailService();

export async function register(req: Request, res: Response) {
  try {
    const { email, password, username } = req.body;
    const result = await authService.registerWithPassword(email, password, username);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ status: 'error', message: err.message, error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginWithPassword(email, password);
    res.cookie("session_token", result.sessionId, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
      user: result.user,
      message: 'Login Success',
      models: {
        imageModels: aiImageModels,
        chatModels: aiChatModels,
        audioModels: aiAudioModels,
        videoModels: aiVideoModels,
      },
    });
  } catch (err: any) {
    res.status(401).json({ status: 'error', message: err.message, error: err.message });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const sessionId = req.cookies?.session_token;
    if (sessionId) {
      await authService.destroySession(sessionId);
    }
    res.clearCookie("session_token");
    res.json({ message: "Logged out successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const sessionId = req.cookies?.session_token;
    if (!sessionId) {
      return res.status(401).json({ error: "Not authenticated." });
    }
    const { Redis } = await import("ioredis");
    const redis = new Redis(REDIS_URL);
    const sessionData = await redis.get(`session:${sessionId}`);
    if (!sessionData) {
      return res.status(401).json({ error: "Session expired." });
    }
    const { userId } = JSON.parse(sessionData);
    const user = await authService.getCurrentUser(userId);
    res.json({
      user,
      models: {
        imageModels: aiImageModels,
        chatModels: aiChatModels,
        audioModels: aiAudioModels,
        videoModels: aiVideoModels,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "Verification token is required." });
    }
    const result = await authService.verifyEmailToken(token);
    res.redirect(CLIENT_URL + '/dashboard')
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function googleCallback(req: Request, res: Response) {
  try {
    const { sessionId } = req.user as any;
    res.cookie("session_token", sessionId, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect(`${CLIENT_URL}/dashboard?oauth=success`);
  } catch (err: any) {
    res.redirect(`${CLIENT_URL}/login?oauth=error&message=${encodeURIComponent(err.message)}`);
  }
}

export async function githubCallback(req: Request, res: Response) {
  try {
    const { sessionId } = req.user as any;
    res.cookie("session_token", sessionId, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect(`${CLIENT_URL}/dashboard?oauth=success`);
  } catch (err: any) {
    res.redirect(`${CLIENT_URL}/login?oauth=error&message=${encodeURIComponent(err.message)}`);
  }
}


export async function sendVerificationEmail(req: Request, res: Response) {
  try {
    const { email, name, verificationCode } = req.body;
    if (!email || !name || !verificationCode) {
      return res.status(400).json({ error: "Email, name, and verification code are required." });
    }
    await mailService.sendVerificationMail(email, name, verificationCode);
    res.status(200).json({ message: "Verification email sent successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateProfile(req: any, res: Response) {
  try {
    const user = req.user;
    const { displayName, username } = req.body;
    const updatedUser = await authService.updateProfile(user.id, { displayName, username });
    res.json({ user: updatedUser, message: "Profile updated successfully." });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function changePassword(req: any, res: Response) {
  try {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required." });
    }
    const result = await authService.changePassword(user.id, currentPassword, newPassword);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}