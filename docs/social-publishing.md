# Social publishing: proposed implementation

## Goal

Enable creators to schedule generated images, videos, and eventually audio-derived content to their connected social accounts. This feature is not implemented yet.

## Phase 1: frontend only, pending approval

Build the frontend without live OAuth, database writes, or publishing calls.

### Screens and entry points

- Add a **Publishing** area to the application navigation with Calendar, Queue, Drafts, and Connected accounts views.
- Add **Schedule post** actions to generated-asset detail views, Library, Collections, and History.
- Create a post composer with account selector, platform-specific media preview, caption, hashtags, link, schedule date/time/timezone, and approval state.
- Present a calendar and paginated queue (10 items per page) using local/mock data behind a repository interface.
- Show deterministic states: draft, pending approval, scheduled, publishing, published, failed, cancelled, and retrying.
- Validate the composer form with Zod and prevent a schedule time in the past.

### Frontend acceptance criteria

- A user can create, edit, duplicate, cancel, and locally mark a scheduled-post draft as approved.
- Each target has its own caption, account, rendition, and schedule.
- The UI makes no claim that a provider account is live until backend OAuth exists.
- List and calendar queries follow the same `page`/`limit` contract, with a default and maximum page size of 10.
- The client can replace the mock repository with RTK Query endpoints without changing page components.

## Phase 2: backend and API, after frontend approval

### Data model

Introduce a generalized `assets` direction or keep temporary references to `images.id`, then add:

| Table | Key fields |
| --- | --- |
| `social_connections` | `id`, `user_id`, `platform`, encrypted OAuth tokens, scopes, provider account ID/name, expiry, status, timestamps. |
| `social_posts` | `id`, `user_id`, `asset_id`, platform, connection ID, caption, link, scheduled-for UTC, timezone, status, provider post ID, error, timestamps. |
| `social_post_media` | `id`, post ID, asset/rendition reference, display order, provider media ID. |
| `social_post_events` | `id`, post ID, event type, actor/system, safe payload, created at. |
| `workflow_runs` (later) | workflow ID, user ID, input/output asset IDs, status, Inngest run ID, timestamps. |

Store OAuth refresh/access tokens encrypted at rest. Never return tokens to the browser, logs, event payloads, or API response.

### API shape

All request and response payloads must use Zod schemas. List endpoints use cursor/page pagination and return at most 10 records by default.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/social/connections` | Paginated connected-account list. |
| `POST` | `/api/social/connections/:platform/connect` | Begin provider OAuth. |
| `GET` | `/api/social/connections/:platform/callback` | Complete provider OAuth server-side. |
| `DELETE` | `/api/social/connections/:id` | Disconnect an owned account. |
| `GET` | `/api/social/posts` | Paginated queue/calendar list with date and status filters. |
| `POST` | `/api/social/posts` | Create a validated draft or scheduled post. |
| `GET` | `/api/social/posts/:id` | Get an owned post and its events. |
| `PATCH` | `/api/social/posts/:id` | Update only while draft/scheduled rules permit. |
| `POST` | `/api/social/posts/:id/approve` | Transition an eligible post to scheduled. |
| `POST` | `/api/social/posts/:id/cancel` | Cancel a post before publishing. |
| `POST` | `/api/social/posts/:id/retry` | Explicitly retry an eligible failed post. |

### Scheduling and publishing flow

```text
User schedules post
  → API validates ownership, platform limits, media, and time
  → PostgreSQL stores post as scheduled
  → Inngest schedules or receives an event with post ID
  → worker fetches/decrypts connection and uploads/publishes media
  → provider webhook or worker result updates post/event status
  → Redis publishes invalidation/notification signal
  → client refreshes the affected paginated queue and post detail
```

The worker must be idempotent. Use the post ID as an idempotency key; acquire a short Redis lock before publishing; persist provider request IDs; and treat retry behavior as provider-specific. Provider webhooks must verify signatures before changing any data.

### Security and product constraints

- Limit OAuth scopes to the minimum that supports publishing.
- Encrypt provider tokens, rotate encryption material carefully, and refresh only server-side.
- Confirm account ownership and asset ownership on every mutation.
- Enforce per-user and per-connection Redis rate limits; respect platform API quotas.
- Validate file type, size, duration, aspect ratio, caption length, hashtag limits, URL rules, and schedule time for each platform.
- Use UTC for execution and retain the user-selected IANA timezone for display/audit.
- Provide failure reasons, manual retry, cancellation, and an immutable event trail.
- Require an explicit approval/publish state; generation alone must never create an externally published post.

## Platform rollout recommendation

Begin with one provider whose publishing API and review requirements match the product's target users, then add platforms behind a common provider adapter. Do not expose a platform in the UI as connectable until its OAuth flow, media restrictions, webhook verification, retry behavior, and terms-compliance requirements are implemented.

