import { Router } from "express";
import { requireAuth } from "@/middlewares/auth.middleware.js";
import {
  verifySocialToken,
  getSocialAccounts,
  connectSocialAccount,
  unlinkAllSocialAccounts,
  updateSocialAccount,
  disconnectSocialAccount,
  getSocialPosts,
  createSocialPost,
  publishSocialPostNow,
  deleteSocialPost,
  getN8nWebhook,
  saveN8nWebhook,
  testN8nWebhook,
} from "@/controllers/social.controller.js";

const socialRouter = Router();

// All social routes are user-protected
socialRouter.use(requireAuth);

// Social Accounts Management
socialRouter.get("/accounts", getSocialAccounts);
socialRouter.post("/accounts/verify", verifySocialToken);
socialRouter.post("/accounts/connect", connectSocialAccount);
socialRouter.post("/accounts/unlink-all", unlinkAllSocialAccounts);
socialRouter.patch("/accounts/:id", updateSocialAccount);
socialRouter.delete("/accounts/:id", disconnectSocialAccount);

// Social Posts & Queue (with 10-item pagination)
socialRouter.get("/posts", getSocialPosts);
socialRouter.post("/posts", createSocialPost);
socialRouter.post("/posts/:id/publish", publishSocialPostNow);
socialRouter.delete("/posts/:id", deleteSocialPost);

// n8n Webhook Management
socialRouter.get("/webhook", getN8nWebhook);
socialRouter.post("/webhook", saveN8nWebhook);
socialRouter.post("/webhook/test", testN8nWebhook);

export default socialRouter;
