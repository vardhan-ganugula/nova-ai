# Nova AI documentation

Nova AI is a PERN application for generating and managing AI image, video, audio, and text content. The product is evolving toward a creator platform with node-based workflows and scheduled social publishing.

## Documentation map

| Document | Purpose |
| --- | --- |
| [Getting started](./getting-started.md) | Local setup, required services, and development commands. |
| [Architecture](./architecture.md) | Current application structure, data flow, storage, and asynchronous processing. |
| [API reference](./api-reference.md) | Implemented HTTP endpoints and authentication expectations. |
| [Use cases](./use-cases.md) | User-facing scenarios for the current product and the planned publishing feature. |
| [Social publishing](./social-publishing.md) | Proposed, frontend-first scope and backend design for scheduling generated content. |

## Current product scope

Implemented or partially implemented capabilities include credential and OAuth authentication, token credits, image and video generation, image upscaling, background removal, generated-asset history, collections, public-gallery visibility, likes, clean-download token gating, Cloudflare R2 storage, and Inngest jobs.

The `/workflows` route currently presents a static, client-side workflow demonstration. It does not yet persist nodes, execute a graph, or schedule social posts. The social-publishing proposal is intentionally separated from current functionality.

## Product delivery rule

For the social publishing feature, deliver the frontend user experience and obtain approval before implementing backend routes, database tables, OAuth connections, and scheduling jobs. The design in [Social publishing](./social-publishing.md) follows that sequence.

