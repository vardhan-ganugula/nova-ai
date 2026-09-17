# Getting started

## Prerequisites

- Node.js compatible with the repository dependencies
- PostgreSQL
- Redis locally, or Upstash Redis for deployment
- An Inngest development server for asynchronous functions
- Optional provider credentials: Fal AI, OpenRouter, Cloudflare R2, SMTP, Google OAuth, and GitHub OAuth

## Install dependencies

Install dependencies at the workspace root and in both applications:

```powershell
npm install
npm install --prefix server
npm install --prefix client
```

## Environment configuration

Create a `server/.env` file. Do not commit secrets. The server reads the following variables:

```dotenv
NODE_ENV=development
PORT=8000
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:8000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
SESSION_SECRET=replace-with-a-long-random-secret

REDIS_URL=redis://localhost:6379
USE_UPSTASH=false
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

OPEN_ROUTER_API_KEY=
FAL_AI_API_KEY=

CLOUDFLARE_R2_ENDPOINT=
CLOUDFLARE_ACCESS_KEY_ID=
CLOUDFLARE_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
DOWNLOAD_WATERMARK_FREE_TOKEN_COST=1
DAILY_FREE_TOKENS=50
```

For a deployed server, set `USE_UPSTASH=true` and provide both Upstash variables. In production, the Redis adapter also selects Upstash when those credentials are available.

## Database

From `server/`, configure `DATABASE_URL`, then create and apply Drizzle migrations as appropriate for the environment:

```powershell
npm run db:generate
npm run db:migrate
```

`npm run db:push` is available for local schema iteration, but use reviewed migrations for shared or production databases.

## Run locally

Open separate terminals:

```powershell
npm run dev:server
npm run dev:client
```

The client defaults to `http://localhost:5173`. The server defaults to port `3000` unless `PORT` is supplied; set `PORT=8000` when using the default Inngest command below.

Start Inngest in a third terminal after the API is running:

```powershell
cd server
npm run inngest
```

Its configured endpoint is `http://localhost:8000/api/inngest`.

## Deployment

Vercel is configured to build the server and client, expose `api/index.ts`, serve `client/dist`, and rewrite `/api/*` to the serverless API. Set every required server environment variable in the deployment environment. Protected application routes are marked `noindex, nofollow` in `vercel.json`.

