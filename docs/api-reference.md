# API reference

Base URL: `/api`. Authenticated routes expect the JWT/cookie mechanism set by the existing authentication flow. API response shapes below describe the current implementation and are not a versioned contract yet.

## Service and job endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/` | No | Plain service greeting. |
| `GET` | `/api` | No | API health-style response. |
| `ALL` | `/api/inngest` | Provider | Inngest serve endpoint. |

## Authentication

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | No | Register a credential account. |
| `POST` | `/auth/login` | No | Sign in with credentials. |
| `POST` | `/auth/logout` | No | Sign out. |
| `GET` | `/auth/user` | No | Return the current user when authenticated. |
| `GET` | `/auth/verify-email` | No | Verify an email token. |
| `POST` | `/auth/send-verification-email` | No | Send an email verification message. |
| `PATCH` | `/auth/profile` | Yes | Update profile fields. |
| `POST` | `/auth/change-password` | Yes | Change the current user's password. |
| `GET` | `/auth/google` | No | Begin Google OAuth. |
| `GET` | `/auth/google/callback` | No | Complete Google OAuth. |
| `GET` | `/auth/github` | No | Begin GitHub OAuth. |
| `GET` | `/auth/github/callback` | No | Complete GitHub OAuth. |

## AI and assets

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/ai/models` | No | List configured image, chat, audio, and video models. |
| `POST` | `/ai/generate-text` | Yes | Generate text through OpenRouter; costs credits. |
| `POST` | `/ai/generate-image` | Yes | Generate and persist an image; costs model credits. |
| `POST` | `/ai/upscale-image` | Yes | Upscale an image and save the result. |
| `POST` | `/ai/remove-bg` | Yes | Remove an image background and save the result. |
| `POST` | `/ai/generate-video` | Yes | Generate and persist a video; costs credits. |
| `GET` | `/ai/user-history` | Yes | Return the user's generated assets. Pagination is not implemented. |
| `GET` | `/ai/user-collections` | Yes | Return the user's collection assets. Pagination is not implemented. |
| `GET` | `/ai/public-gallery` | No | Return a deduplicated, watermarked gallery, capped in code. |
| `POST` | `/ai/images/:id/download-clean` | Yes | Obtain a clean asset; ownership/acquisition and credits apply. |
| `GET` | `/ai/token-usage` | Yes | Return active token/credit details. |
| `PATCH` | `/ai/images/:id/toggle-visibility` | Yes | Toggle an owned asset's public visibility. |
| `POST` | `/ai/images/:id/like` | Yes | Like or unlike a public image. |

## Development-only test routes

`/api/test` contains direct R2 and token/credit test operations. These endpoints should not be exposed in production until they are authenticated, authorized, validated, and rate limited. They are intentionally omitted from public client integration documentation.

## API hardening backlog

1. Define Zod request and response schemas at the route boundary.
2. Add a standard error envelope and stable API versioning.
3. Require `page` and `limit` (maximum 10 by default) or cursor pagination for every list endpoint.
4. Apply Redis-backed rate limits, especially to auth, generation, likes, and downloads.
5. Return asynchronous generation job IDs instead of waiting for provider work in HTTP requests.

