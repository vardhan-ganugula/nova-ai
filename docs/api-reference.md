# API Reference

Base URL: `/api`. Authenticated routes require an active JWT session token transmitted via HTTP-only cookies or Authorization Bearer header.

---

## 1. Authentication Endpoints (`/auth`)

| Method | Endpoint | Auth | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | No | `{ email, username, password, displayName }` | Register a new user account with initial token credits. |
| `POST` | `/auth/login` | No | `{ email, password }` | Authenticate with credentials and set JWT cookie. |
| `POST` | `/auth/logout` | Yes | None | Invalidate session and clear auth cookies. |
| `GET` | `/auth/user` | Yes | None | Fetch current authenticated user profile and token balance. |
| `GET` | `/auth/verify-email` | No | Query: `token` | Verify user email address. |
| `POST` | `/auth/send-verification-email` | Yes | None | Trigger email verification dispatch. |
| `PATCH` | `/auth/profile` | Yes | `{ displayName?, username? }` | Update account profile fields. |
| `POST` | `/auth/change-password` | Yes | `{ currentPassword, newPassword }` | Change user account password. |
| `GET` | `/auth/google` | No | None | Redirect to Google OAuth consent screen. |
| `GET` | `/auth/google/callback` | No | Query: `code` | Handle Google OAuth callback. |
| `GET` | `/auth/github` | No | None | Redirect to GitHub OAuth consent screen. |
| `GET` | `/auth/github/callback` | No | Query: `code` | Handle GitHub OAuth callback. |

---

## 2. AI Generation Endpoints (`/ai`)

| Method | Endpoint | Auth | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/ai/models` | No | None | List configured AI models for image, text, audio, and video synthesis with token costs. |
| `POST` | `/ai/generate-text` | Yes | `{ prompt, model? }` | Generate text using OpenRouter (Gemini 2.0 Flash, GPT-4o, GPT-4o Mini). Costs 2 tokens. |
| `POST` | `/ai/generate-image` | Yes | `{ prompt, negativePrompt?, style?, aspectRatio?, model? }` | Synthesize artwork via Fal AI (Flux Schnell, Dev, Pro, SDXL 3.5, Ideogram) and save master/watermarked copies to R2. |
| `POST` | `/ai/generate-video` | Yes | `{ prompt }` | Generate short video clip via Fal AI. Costs 25 tokens. |
| `POST` | `/ai/upscale-image` | Yes | `{ imageUrl, prompt? }` | Upscale image resolution via Fal AI. Costs 5 tokens. |
| `POST` | `/ai/remove-bg` | Yes | `{ imageUrl, prompt? }` | Remove image background via Fal AI. Costs 5 tokens. |
| `GET` | `/ai/user-history` | Yes | None | Returns the user's generated image and video assets. |
| `GET` | `/ai/user-collections` | Yes | None | Returns the user's saved collection items. |
| `GET` | `/ai/public-gallery` | No | None | Returns community showcase artworks with watermarked presigned URLs. |
| `POST` | `/ai/images/:id/download-clean`| Yes | None | Deducts watermark-removal tokens and yields a clean master download URL. |
| `GET` | `/ai/token-usage` | Yes | None | Fetch detailed user credit balance (daily, purchased, expiration). |
| `PATCH`| `/ai/images/:id/toggle-visibility` | Yes | None | Toggles public gallery display status for an owned asset. |
| `POST` | `/ai/images/:id/like` | Yes | None | Toggles like status on a public community artwork. |

---

## 3. Social Publishing & Scheduling Endpoints (`/social`)

All social routes require user authentication (`requireAuth`).

### Social Account Connections

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/social/accounts` | List all social accounts connected by the authenticated user (Instagram, X, Facebook, LinkedIn, YouTube, TikTok). |
| `POST` | `/social/accounts/verify` | Test/verify access token validity for a specific platform account. |
| `POST` | `/social/accounts/connect` | Connect a social profile account. Body: `{ platform, platformAccountId, accountUsername, accountName, avatarUrl?, accessToken? }`. |
| `PATCH` | `/social/accounts/:id` | Update metadata/settings for a connected account. |
| `DELETE`| `/social/accounts/:id` | Disconnect and remove a specific social account. |
| `POST` | `/social/accounts/unlink-all` | Unlink all social accounts for the user. |

### Social Posts & Scheduled Queue

All post list queries enforce pagination (10 items per page by default):

| Method | Endpoint | Query / Body | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/social/posts` | Query: `page=1&limit=10&status=scheduled` | Fetch paginated post queue with optional status filtering (`draft`, `scheduled`, `publishing`, `published`, `failed`). |
| `POST` | `/social/posts` | Body: `{ mediaUrl, mediaType?, caption, targetPlatforms, scheduledFor?, imageId? }` | Create a draft or schedule a post. Dispatches an Inngest scheduling event. |
| `POST` | `/social/posts/:id/publish` | None | Trigger immediate live publication of a post via Inngest queue. |
| `DELETE`| `/social/posts/:id` | None | Remove a scheduled or draft post from the queue. |

### n8n Webhook Integration

| Method | Endpoint | Body | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/social/webhook` | None | Get user's configured n8n webhook URL, active status, and subscribed event triggers. |
| `POST` | `/social/webhook` | `{ webhookUrl, secret, isActive, events }` | Save or update the n8n webhook integration settings. |
| `POST` | `/social/webhook/test` | None | Dispatches a test payload to the configured n8n webhook URL to verify connectivity. |

---

## 4. Background Job Serve Endpoint (`/api/inngest`)

* **Path**: `/api/inngest`
* **Method**: `GET`, `POST`, `PUT`
* **Handler**: Inngest SDK serve middleware registering:
  * `imageGenerationFunction`: Event-driven Fal AI image generation and R2 storage.
  * `videoGenerationFunction`: Event-driven video generation.
  * `dailyCreditsResetFunction`: Cron schedule replenishing daily user tokens.
  * `socialPostPublishFunction`: Event & scheduled dispatcher for social media publishing and n8n webhook events.
