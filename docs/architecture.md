# Architecture

## Repository layout

```text
nova-ai/
├── client/                 React 19 + TypeScript + Vite application
│   └── src/
│       ├── pages/          Route-level product screens
│       ├── components/     Reusable UI and feature components
│       ├── store/          Redux Toolkit and RTK Query state
│       └── schema/         Client-side Zod schemas
├── server/                 Express 5 + TypeScript API
│   └── src/
│       ├── controllers/    Authentication and AI-provider calls
│       ├── routes/         HTTP route definitions
│       ├── db/             Drizzle/PostgreSQL schema and connection
│       ├── inngest/        Event-driven jobs and cron functions
│       ├── services/       AI, R2, mail, and auth services
│       └── utils/          Config, Redis, tokens, JWT, storage, styles
├── api/index.ts            Vercel serverless entry point
└── vercel.json             Vercel build, routing, and header configuration
```

## Runtime components

| Component | Responsibility |
| --- | --- |
| React client | Marketing, authentication, dashboard, generation studio, gallery, models, history, library, collections, settings, and a workflow prototype. |
| Express API | Authenticates users, accepts generation and asset operations, exposes model metadata, and hosts Inngest. |
| PostgreSQL + Drizzle | Stores users, provider accounts, generated assets, collections, and image likes. |
| Redis / Upstash | Provides an adapter and keys for verification, session, deduplication, and rate-limit data. |
| Inngest | Handles image, video, audio-placeholder, and daily credit jobs. |
| Fal AI / OpenRouter | Image/video and text generation providers. |
| Cloudflare R2 | Stores generated masters and watermarked derivatives; returns presigned URLs. |

## Primary data flow

```text
React + RTK Query → Express API → credits + provider services → R2 → PostgreSQL
                              └→ Inngest event/function → provider + R2 + PostgreSQL
```

The API currently dispatches Inngest image and video events, but it also performs the generation synchronously in the route handler. Since the Inngest functions persist their own output, this can produce duplicate generation and asset records. Before production use, convert each generation request to a single job path: create a pending record, send one event, return a job identifier, then use status polling or a webhook/event notification to update the client.

## Database model

| Table | Purpose |
| --- | --- |
| `users` | Identity, profile, verification, and daily/purchased credit balances. |
| `accounts` | Credentials or OAuth provider identities. |
| `images` | Image and video asset metadata, R2 locations, watermark locations, status, visibility, likes, and generation type. |
| `collections` | User-to-asset library membership. |
| `image_likes` | One like per user and image. |

The `images` table also stores video records. A future asset model should either rename this table or introduce a generalized `assets` table before audio and social publishing become first-class features.

## Security and implementation observations

- JWT authentication protects generation, history, collection, token usage, visibility, and like operations.
- Password hashing, OAuth, mail verification, and Redis adapters exist.
- The API route bodies are not consistently validated with Zod yet. Add request and response schemas to every public endpoint.
- Collection/history endpoints and the public gallery do not currently expose page/cursor parameters. Replace unbounded and fixed-size responses with paginated responses before data volume grows.
- `/api/test` exposes storage and credit-mutating routes without visible authentication. Disable or protect this router outside local development.
- CORS currently accepts all origins in its fallback branch. Restrict it to the explicit client origin(s) before production.

