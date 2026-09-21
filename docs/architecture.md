# System Architecture

Nova AI is a full-stack PERN application (PostgreSQL, Express, React, Node.js) with TypeScript, Redis, Inngest, Cloudflare R2, and external AI providers (Fal.ai and OpenRouter).

---

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph ClientLayer ["Client Layer (React 19 + TypeScript + Vite)"]
        UI["Web App (Tailwind CSS, Lucide, Redux Toolkit)"]
        Studio["Studio Pages (Image, Video, Text Gen)"]
        WorkflowUI["Workflow Automation Canvas (n8n style)"]
        PublisherUI["Social Publishing & Queue Management"]
    end

    subgraph APILayer ["API & Middleware Layer (Express 5 + TypeScript)"]
        API["Express API Server (:8000)"]
        AuthMiddleware["JWT & Session Auth Middleware"]
        RouterAI["/api/ai Router"]
        RouterSocial["/api/social Router"]
        RouterAuth["/api/auth Router"]
    end

    subgraph DataCache ["Data & Caching Layer"]
        Postgres[(PostgreSQL + Drizzle ORM)]
        Redis[(Redis / Upstash - Cache, Rate-Limits, Pub/Sub)]
    end

    subgraph BackgroundProcessing ["Async Task & Event Processing"]
        InngestServer["Inngest Dev Server / Cloud (:8288)"]
        InngestFuncs["Inngest Background Functions (Publish, Generation, Daily Credits)"]
    end

    subgraph ExternalServices ["External Services & Storage"]
        FalAI["Fal.ai (Flux Schnell/Dev/Pro, SDXL, Ideogram)"]
        OpenRouter["OpenRouter (Gemini 2.0, GPT-4o, Claude)"]
        R2["Cloudflare R2 Object Storage (Master & Watermarked Assets)"]
        n8nWebhook["n8n Webhook Endpoint"]
        SocialPlatforms["Social Media APIs (Instagram, X, Facebook, LinkedIn, TikTok)"]
    end

    UI --> API
    Studio --> RouterAI
    WorkflowUI --> RouterAI
    WorkflowUI --> RouterSocial
    PublisherUI --> RouterSocial

    API --> AuthMiddleware
    AuthMiddleware --> Postgres
    AuthMiddleware --> Redis

    RouterAI --> Postgres
    RouterAI --> FalAI
    RouterAI --> OpenRouter
    RouterAI --> R2

    RouterSocial --> Postgres
    RouterSocial --> InngestServer
    InngestServer --> InngestFuncs

    InngestFuncs --> SocialPlatforms
    InngestFuncs --> n8nWebhook
    InngestFuncs --> Postgres
    InngestFuncs --> Redis
```

---

## 2. Repository Layout

```text
nova-ai/
├── client/                     # React 19 + TypeScript + Vite application
│   ├── src/
│   │   ├── components/
│   │   │   ├── workflow/       # Visual workflow canvas, compact cards, drawer, engine
│   │   │   ├── dashboard/      # Studio, gallery, creation modals, sidebar
│   │   │   └── social/         # Publishing calendar, scheduler, queue
│   │   ├── pages/              # Route views (WorkflowsPage, ImageGenStudioPage, etc.)
│   │   ├── store/              # Redux Toolkit & RTK Query slices (authSlice, socialSlice)
│   │   └── schema/             # Client-side Zod validation schemas
├── server/                     # Node.js Express 5 + TypeScript backend
│   ├── src/
│   │   ├── controllers/        # Route controllers (ai, auth, social, instagram)
│   │   ├── db/                 # Drizzle ORM schema and PostgreSQL pool connection
│   │   ├── inngest/            # Event-driven jobs, background publisher, and crons
│   │   ├── middlewares/        # Authentication and authorization guards
│   │   ├── routes/             # Express route definitions
│   │   ├── services/           # Fal AI, OpenRouter, R2, email, and social services
│   │   └── utils/              # Redis client, credits calculator, watermark storage
├── docs/                       # Project engineering & architecture documentation
└── AGENTS.md                   # Core development rules and repository guidelines
```

---

## 3. Database Schema (PostgreSQL + Drizzle ORM)

```mermaid
erDiagram
    users ||--o{ accounts : "has"
    users ||--o{ images : "generates"
    users ||--o{ collections : "saves"
    users ||--o{ image_likes : "likes"
    users ||--o{ social_accounts : "connects"
    users ||--o{ social_posts : "schedules"
    users ||--o| social_webhooks : "configures"
    images ||--o{ social_posts : "attached to"

    users {
        uuid id PK
        text email
        text username
        text display_name
        boolean is_verified
        integer credits
        integer daily_credits
        timestamp daily_credits_expires_at
        integer purchased_credits
    }

    accounts {
        uuid id PK
        uuid user_id FK
        text provider
        text provider_account_id
        text password_hash
    }

    images {
        uuid id PK
        uuid user_id FK
        text prompt
        text style
        text aspect_ratio
        text model
        text r2_url
        text r2_key
        text watermarked_r2_url
        boolean is_public
        integer likes_count
        text status
        text generation_type
    }

    social_accounts {
        uuid id PK
        uuid user_id FK
        text platform
        text platform_account_id
        text account_username
        text account_name
        text avatar_url
        text access_token
        text status
    }

    social_posts {
        uuid id PK
        uuid user_id FK
        uuid image_id FK
        text media_url
        text media_type
        text caption
        jsonb target_platforms
        text status
        timestamp scheduled_for
        timestamp published_at
        jsonb platform_post_ids
    }

    social_webhooks {
        uuid id PK
        uuid user_id FK
        text webhook_url
        text secret
        boolean is_active
        jsonb events
    }
```

---

## 4. Asynchronous Task Processing with Inngest

Inngest decouples high-latency AI generation, social publishing, and cron credit renewals from HTTP request cycles:

```mermaid
sequenceDiagram
    autonumber
    participant Client as React Client
    participant Express as Express API
    participant InngestQueue as Inngest Queue
    participant Worker as Inngest Function Handler
    participant SocialAPI as Platform API (e.g. Instagram)
    participant Webhook as n8n Webhook Endpoint
    participant DB as PostgreSQL

    Client->>Express: POST /api/social/posts (Create scheduled post)
    Express->>DB: INSERT into social_posts (status: "scheduled")
    Express->>InngestQueue: inngest.send("social/post.scheduled", { postId, scheduledFor })
    Express-->>Client: 201 Created (Post object)

    Note over InngestQueue,Worker: Inngest waits until scheduledFor timestamp (or fires immediately for "publish now")
    InngestQueue->>Worker: Execute socialPostPublishFunction
    Worker->>DB: UPDATE social_posts SET status = "publishing"
    Worker->>SocialAPI: Upload media and publish post
    SocialAPI-->>Worker: Return platform post ID

    Worker->>DB: UPDATE social_posts SET status = "published", publishedAt = NOW()
    
    alt n8n Webhook is Configured
        Worker->>Webhook: POST n8n Webhook (event: "post.published", payload)
        Webhook-->>Worker: 200 OK
    end
```

---

## 5. Caching, Rate Limiting & Storage

* **Redis**:
  * Used for token rate limiting, verification code caching with TTL, session deduplication, and pub/sub broadcast notifications.
* **Cloudflare R2**:
  * Original high-resolution master assets and watermarked community copies are stored in Cloudflare R2 object storage.
  * Assets are served via presigned URLs, avoiding unauthorized direct bucket access.
* **Pagination Standard**:
  * In alignment with project rules, all list endpoints enforce pagination (default: 10 items per page).
