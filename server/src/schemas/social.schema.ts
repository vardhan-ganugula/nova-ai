import { z } from "zod";

export const ConnectAccountSchema = z.object({
  platform: z.enum([
    "instagram",
    "linkedin",
    "x",
    "youtube",
    "tiktok",
    "pinterest",
    "facebook",
    "discord",
  ]),
  platformAccountId: z.string().min(1, "Account ID is required"),
  accountUsername: z.string().min(1, "Username/handle is required"),
  accountName: z.string().min(1, "Display name is required"),
  avatarUrl: z.string().url().optional().or(z.literal("")).or(z.null()),
  accessToken: z.string().min(1, "Access token or webhook URL is required"),
  refreshToken: z.string().optional(),
  tokenExpiresAt: z.string().optional().nullable(),
  metadata: z
    .object({
      defaultHashtags: z.array(z.string()).optional(),
      includeAiDisclaimer: z.boolean().optional(),
      autoPostEnabled: z.boolean().optional(),
      postFormat: z.string().optional(),
    })
    .passthrough()
    .optional(),
});

export const VerifySocialTokenSchema = z.object({
  platform: z.enum([
    "instagram",
    "linkedin",
    "x",
    "youtube",
    "tiktok",
    "pinterest",
    "facebook",
    "discord",
  ]),
  accessToken: z.string().min(1, "Access token is required"),
  accountUsername: z.string().optional(),
  isSandbox: z.boolean().optional(),
});

export const UpdateSocialAccountSchema = z.object({
  accountUsername: z.string().min(1).optional(),
  accountName: z.string().min(1).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  tokenExpiresAt: z.string().optional().nullable(),
  metadata: z
    .object({
      defaultHashtags: z.array(z.string()).optional(),
      includeAiDisclaimer: z.boolean().optional(),
      autoPostEnabled: z.boolean().optional(),
      postFormat: z.string().optional(),
    })
    .passthrough()
    .optional(),
  status: z.enum(["active", "expired", "revoked"]).optional(),
});

export const CreateSocialPostSchema = z.object({
  mediaUrl: z.string().url("Valid media URL is required"),
  mediaType: z.enum(["image", "video", "audio"]).default("image"),
  caption: z.string().min(1, "Caption cannot be empty").max(2200, "Caption exceeds 2200 characters"),
  targetPlatforms: z
    .array(
      z.enum([
        "instagram",
        "linkedin",
        "x",
        "youtube",
        "tiktok",
        "pinterest",
        "facebook",
        "discord",
      ])
    )
    .min(1, "Select at least one social channel"),
  scheduledFor: z.string().optional().nullable(),
  imageId: z.string().uuid().optional().nullable(),
});

export const GetSocialPostsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(20).default(10),
  status: z.enum(["all", "draft", "scheduled", "publishing", "published", "failed"]).default("all"),
});

export const N8nWebhookConfigSchema = z.object({
  webhookUrl: z.string().url("Valid webhook URL is required"),
  secret: z.string().min(6, "Signing secret must be at least 6 characters").default("nova_n8n_secret"),
  isActive: z.boolean().default(true),
  events: z.array(z.string()).min(1, "Select at least one event trigger"),
});

export type ConnectAccountInput = z.infer<typeof ConnectAccountSchema>;
export type VerifySocialTokenInput = z.infer<typeof VerifySocialTokenSchema>;
export type UpdateSocialAccountInput = z.infer<typeof UpdateSocialAccountSchema>;
export type CreateSocialPostInput = z.infer<typeof CreateSocialPostSchema>;
export type GetSocialPostsQuery = z.infer<typeof GetSocialPostsQuerySchema>;
export type N8nWebhookConfigInput = z.infer<typeof N8nWebhookConfigSchema>;
