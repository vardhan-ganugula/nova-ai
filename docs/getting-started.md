# Getting Started

This guide explains how to set up and run the Nova AI PERN stack (PostgreSQL, Express, React, Node.js) with Redis, Inngest, Fal AI, OpenRouter, and Cloudflare R2.

---

## 1. Prerequisites

- **Node.js**: v18+ or v20+
- **npm**: v9+
- **PostgreSQL**: v14+ (local instance or managed instance e.g., Supabase, Neon)
- **Redis**: v6+ (local server or Upstash Redis)
- **Inngest CLI**: For local background task processing (`npm run inngest`)

### External API Keys (Optional but recommended for full features)
- **Fal AI**: API key for Flux.1 Pro, Flux Realism, and SDXL generation.
- **OpenRouter**: API key for NVIDIA Nemotron, InclusionAI Ling, Llama 3.3, Google Gemma, and OpenRouter text generation models.
- **Cloudflare R2**: S3-compatible credentials and bucket name for media persistence.
- **OAuth Providers**: Google & GitHub OAuth client IDs and secrets for social logins.

---

## 2. Repository Installation

Install root and workspace dependencies:

```powershell
# Root dependencies
npm install

# Backend server dependencies
npm install --prefix server

# Frontend client dependencies
npm install --prefix client
```

---

## 3. Environment Configuration

### Server Environment (`server/.env`)
Create `server/.env` with the following configuration:

```dotenv
# App Environment
NODE_ENV=development
PORT=8000
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:8000
SESSION_SECRET=super-secret-session-key-minimum-32-chars

# PostgreSQL Database (Drizzle ORM)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres

# Redis Cache & Rate Limiting
REDIS_URL=redis://localhost:6379
USE_UPSTASH=false
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# AI Model Providers
FAL_AI_API_KEY=your_fal_ai_api_key_here
OPEN_ROUTER_API_KEY=your_openrouter_api_key_here

# Cloudflare R2 Media Storage (S3-compatible)
CLOUDFLARE_R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
CLOUDFLARE_ACCESS_KEY_ID=your_r2_access_key_id
CLOUDFLARE_SECRET_ACCESS_KEY=your_r2_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=nova-ai-assets

# Inngest Background Engine
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Token Credits Configuration
DAILY_FREE_TOKENS=50
DOWNLOAD_WATERMARK_FREE_TOKEN_COST=1

# Email / SMTP (Password reset & verification)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=
SMTP_PASS=

# Social Authentication
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

---

## 4. Database Setup (Drizzle ORM)

Initialize and migrate the PostgreSQL database:

```powershell
cd server

# Generate Drizzle migrations from schema
npm run db:generate

# Apply migrations to PostgreSQL
npm run db:migrate
```

*Tip: For rapid local schema iteration, `npm run db:push` can be used to synchronize schema changes directly.*

---

## 5. Running the Application

To run the complete system locally, open three terminal windows:

### Terminal 1: Backend Express Server
```powershell
cd server
npm run dev
```
*Runs at `http://localhost:8000`.*

### Terminal 2: Frontend Vite React Application
```powershell
cd client
npm run dev
```
*Runs at `http://localhost:5173`.*

### Terminal 3: Inngest Dev Server
```powershell
cd server
npm run inngest
```
*Inngest Dev UI runs at `http://localhost:8288` communicating with the backend at `http://localhost:8000/api/inngest`.*

---

## 6. Engineering & Testing Guidelines

As outlined in `AGENTS.md`:
- **Development Testing**: Testing is not a primary concern until the project reaches alpha. **Do not run `npm run build` or `npm run lint`**. Instead, run `npm run dev`.
- **Type Checking**: To verify TypeScript validity without triggering production build bundling, run:
  ```powershell
  # Frontend client check
  cd client; npx tsc --noEmit --project tsconfig.app.json

  # Backend server check
  cd server; npx tsc --noEmit
  ```
- **Strict Pagination**: All listing endpoints must paginate data with 10 items per page by default.
- **Validation**: Every request and response payload must be validated with Zod schemas.
