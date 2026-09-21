import { Router } from "express";
import { requireAuth } from "@/middlewares/auth.middleware.js";
import {
  initiateInstagramOAuth,
  handleInstagramOAuthCallback,
} from "@/controllers/instagram.controller.js";

const instagramRouter = Router();

// 1. User-initiated OAuth Redirect
instagramRouter.get("/connect", requireAuth, initiateInstagramOAuth);

// 2. Meta OAuth Callback Redirect (Public URL called by Meta after user approval)
instagramRouter.get("/callback", handleInstagramOAuthCallback);

export default instagramRouter;
