# Nova AI documentation

Nova AI is a PERN application for generating and managing AI image, video, audio, and text content. The product is evolving toward a creator platform with node-based workflows and scheduled social publishing.

## Documentation map

| Document | Purpose |
| --- | --- |
| [Getting started](./getting-started.md) | Local setup, required services, environment variables, and development commands. |
| [Architecture](./architecture.md) | High-level system architecture, PostgreSQL ER diagrams, Inngest task pipelines, and Redis caching. |
| [API reference](./api-reference.md) | Complete HTTP REST endpoint specifications, Zod validations, and pagination standards. |
| [Workflow automation](./workflow-automation.md) | Visual node canvas, 13 node types, compact card layout, drawer configuration, and topological execution engine. |
| [Social publishing & n8n](./social-publishing.md) | Multi-channel social scheduling, Inngest background publishing, database schemas, and n8n webhook integrations. |
| [Use cases](./use-cases.md) | Creator scenarios covering AI image/video/text synthesis, visual workflow pipelines, and automated social publishing. |

## Current product scope

Nova AI provides a comprehensive SaaS creation and workflow automation platform:
- **Authentication & Credits**: Passwordless/credential auth, Google & GitHub OAuth, session management, and daily credit replenishment at midnight UTC via Inngest.
- **AI Media Generation**: Fal AI integration (Flux.1 Pro, Flux Realism, SDXL) with R2 persistence, background removal, and 8K upscaling.
- **AI Text & Prompt Generation**: OpenRouter integration supporting 29 cutting-edge models including NVIDIA Nemotron 3.5 Lightning, InclusionAI Ling 3.0 Flash, Poolside Laguna, Google Gemma, Qwen, Thinking Machines Inkling, Nex AGI, OpenAI GPT OSS, Meta Llama 3.3, and LiquidAI.
- **Visual Workflow Engine**: Interactive React Flow canvas with 13 modular nodes, compact cards ($240 \times 64\text{ px}$), double-click sliding drawer configuration, isolated testing tabs, topological sort execution engine, conditional branching, batch looping, and real-time execution logging.
- **Social Publishing & n8n Integration**: Multi-channel social account management (Instagram, X/Twitter, YouTube, TikTok, LinkedIn), scheduled and immediate posting, Inngest background event processing, and outward n8n webhook notifications.
- **Library, Collections & Public Gallery**: Paginated asset management (strict 10 items per page), collection curation, community likes, and clean watermark-free downloads.


