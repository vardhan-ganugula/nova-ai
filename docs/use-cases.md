# Use cases

## Current creator workflows

### Generate a social-ready image

A creator enters a prompt, model, style, aspect ratio, seed, and sampling controls in Create Studio. Nova AI checks available credits, generates the image, stores the master and a watermarked derivative in R2, saves asset metadata, and adds it to the creator's history and collection.

### Improve an existing generated visual

A creator selects an asset for 8K upscaling or background removal. The derivative is stored as another asset, allowing it to be inspected, reused, shared, or downloaded without overwriting the source.

### Explore community work safely

A visitor browses the public gallery. The gallery returns the watermarked derivative rather than the master asset. Signed-in creators can like work and control whether their own assets are public.

### Manage a credit-based creation account

A user signs up using credentials, Google, or GitHub; verifies their email; and sees a daily and purchased credit balance. Inngest refreshes daily credits at midnight UTC while preserving valid purchased credits.

### Prepare a repeatable generation flow

A creator uses the Workflows screen to understand a prompt-to-upscale pipeline. Today this is a visual prototype; persistence, validation, graph execution, and reusable templates remain future work.

## Planned social publishing workflows

### Schedule a campaign from a generated asset

1. A creator opens an asset in Library or Create Studio and chooses **Schedule post**.
2. They select a connected social account, customize caption, hashtags, link, and platform-specific crop or asset variant.
3. They choose an immediate or timezone-aware future time and save the draft.
4. The frontend shows a queued post, local validation, and the provider-specific preview.
5. After backend approval, an Inngest job publishes the post, records the provider result, and surfaces success or failure in the schedule timeline.

### Repurpose one master asset for multiple channels

A marketing team selects an image or video once, then prepares independent posts for Instagram, LinkedIn, X, Facebook, TikTok, or YouTube. Each post can have a channel-specific caption, account, asset rendition, schedule, and approval state, while referring back to the same Nova asset.

### Build a scheduled content queue

A solo creator batches a week's outputs after a generation session. They arrange them in a calendar/list queue, check conflicts and account limits, and schedule posts in their local timezone. Failed posts are retried safely and remain visible with a clear resolution action.

### Require review before a post can publish

An agency contributor prepares drafts, while an approver reviews media, text, target account, and timing. Only approved posts become eligible for the publishing scheduler. Every transition is recorded for auditability.

### Use generated content inside an automated workflow

A workflow completes image generation, optional background removal/upscaling, caption generation, and a scheduled-post draft. The user remains in control: an explicit publish/schedule node and confirmation state are required before external publication.

