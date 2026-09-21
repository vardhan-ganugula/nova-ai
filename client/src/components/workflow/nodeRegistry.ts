import type { NodeRegistryEntry, NodeType, HttpNodeData, WebhookNodeData } from "./types";

function makeWebhookUrl() {
  const id = Math.random().toString(36).slice(2, 10);
  return `https://nova.ai/webhook/${id}`;
}

export const NODE_REGISTRY: Record<NodeType, NodeRegistryEntry> = {
  "image-asset": {
    type: "image-asset",
    label: "Image Library",
    description: "Browse and select images from your generated asset library",
    accentColor: "#06b6d4",
    iconColor: "text-cyan-400",
    category: "source",
    defaultSize: { w: 240, h: 64 },
    defaultData: () => ({ selectedImage: null }),
  },

  "ai-image-generator": {
    type: "ai-image-generator",
    label: "AI Image Generator",
    description: "Generate AI artwork from prompt input or text wires",
    accentColor: "#ec4899",
    iconColor: "text-pink-400",
    category: "source",
    defaultSize: { w: 240, h: 64 },
    defaultData: () => ({
      prompt: "Cyberpunk iridescent android portrait, volumetric neon lighting",
      model: "Flux Schnell",
      aspectRatio: "1:1",
      stylePreset: "photorealistic",
      negativePrompt: "blurry, low quality, distorted",
      generatedImage: null,
      isGenerating: false,
    }),
  },

  "ai-text-generator": {
    type: "ai-text-generator",
    label: "AI Text Generator",
    description: "Generate copy, captions, or transform text using LLMs (Nemotron, Llama, Gemma, GPT OSS)",
    accentColor: "#8b5cf6",
    iconColor: "text-violet-400",
    category: "source",
    defaultSize: { w: 240, h: 64 },
    defaultData: () => ({
      prompt: "Write a viral Instagram caption for a futuristic cyberpunk artwork with hashtags",
      systemPrompt: "You are a professional social media marketing copywriter. The output should be in JSON format and there should only be alphanumeric characters and emojis, no special characters.",
      model: "NVIDIA Nemotron 3.5 Lightning",
      temperature: 0.7,
      maxTokens: 500,
      generatedText: "",
      isGenerating: false,
    }),
  },

  "if-condition": {
    type: "if-condition",
    label: "If (Condition)",
    description: "Branch workflow conditionally to True or False outputs",
    accentColor: "#10b981",
    iconColor: "text-emerald-400",
    category: "control",
    defaultSize: { w: 240, h: 64 },
    defaultData: () => ({
      condition: { field: "status", operator: "equals" as const, value: "success" },
    }),
  },

  "for-loop": {
    type: "for-loop",
    label: "For (Loop)",
    description: "Iterate over array items or split into batches",
    accentColor: "#3b82f6",
    iconColor: "text-blue-400",
    category: "control",
    defaultSize: { w: 240, h: 64 },
    defaultData: () => ({
      batchSize: 1,
      fieldPath: "items",
      maxIterations: 10,
      currentIteration: 0,
    }),
  },

  "code-javascript": {
    type: "code-javascript",
    label: "Code (JavaScript)",
    description: "Run custom JavaScript code to transform or filter data",
    accentColor: "#f59e0b",
    iconColor: "text-amber-400",
    category: "transform",
    defaultSize: { w: 240, h: 64 },
    defaultData: () => ({
      code: "// Transform payload\nreturn {\n  ...data,\n  processedAt: new Date().toISOString()\n};",
      language: "javascript" as const,
    }),
  },

  "set-fields": {
    type: "set-fields",
    label: "Set (Edit Fields)",
    description: "Assign, update, or append variable fields to payload",
    accentColor: "#8b5cf6",
    iconColor: "text-purple-400",
    category: "transform",
    defaultSize: { w: 240, h: 64 },
    defaultData: () => ({
      fields: [{ key: "status", value: "active", type: "string" as const }],
      mode: "append" as const,
    }),
  },

  "delay-wait": {
    type: "delay-wait",
    label: "Delay / Wait",
    description: "Pause workflow execution for a specified duration",
    accentColor: "#06b6d4",
    iconColor: "text-cyan-400",
    category: "control",
    defaultSize: { w: 240, h: 64 },
    defaultData: () => ({
      duration: 3,
      unit: "seconds" as const,
    }),
  },

  "debug-print": {
    type: "debug-print",
    label: "Print / Debug",
    description: "Inspect and log incoming data payload to the workflow console",
    accentColor: "#64748b",
    iconColor: "text-slate-400",
    category: "transform",
    defaultSize: { w: 240, h: 64 },
    defaultData: () => ({
      label: "Debug Output",
      logLevel: "info" as const,
      format: "json" as const,
    }),
  },

  "http-request": {
    type: "http-request",
    label: "HTTP Request",
    description: "Make API calls — GET, POST, PUT, PATCH or DELETE any endpoint",
    accentColor: "#f97316",
    iconColor: "text-orange-400",
    category: "trigger",
    defaultSize: { w: 240, h: 64 },
    defaultData: (): HttpNodeData => ({
      method: "GET",
      url: "",
      headers: [{ key: "Content-Type", value: "application/json" }],
      queryParams: [],
      body: "",
      response: null,
      statusCode: null,
      latencyMs: null,
      isExecuting: false,
    }),
  },

  "webhook": {
    type: "webhook",
    label: "Webhook / Transform",
    description: "Receive webhook events or transform JSON payloads between nodes",
    accentColor: "#a855f7",
    iconColor: "text-violet-400",
    category: "trigger",
    defaultSize: { w: 240, h: 64 },
    defaultData: (): WebhookNodeData => ({
      mode: "trigger",
      webhookUrl: makeWebhookUrl(),
      eventFilter: "nova.*",
      lastTriggeredAt: null,
      payloadPreview: "",
      mappings: [{ from: "$.data.imageId", to: "payload.id" }],
      outputPreview: "",
    }),
  },

  "social-instagram": {
    type: "social-instagram",
    label: "Instagram",
    description: "Publish to Instagram — stories, reels, and feed posts",
    accentColor: "#E1306C",
    iconColor: "text-pink-400",
    category: "destination",
    defaultSize: { w: 240, h: 64 },
    defaultData: () => ({ platform: "instagram" as const, caption: "", scheduledFor: null }),
  },

  "social-x": {
    type: "social-x",
    label: "X (Twitter)",
    description: "Tweet or thread content on X (Twitter), up to 280 chars",
    accentColor: "#ffffff",
    iconColor: "text-white",
    category: "destination",
    defaultSize: { w: 240, h: 64 },
    defaultData: () => ({ platform: "x" as const, caption: "", scheduledFor: null }),
  },

  "social-facebook": {
    type: "social-facebook",
    label: "Facebook",
    description: "Publish posts and media to your Facebook pages",
    accentColor: "#1877F2",
    iconColor: "text-blue-400",
    category: "destination",
    defaultSize: { w: 240, h: 64 },
    defaultData: () => ({ platform: "facebook" as const, caption: "", scheduledFor: null }),
  },

  "social-linkedin": {
    type: "social-linkedin",
    label: "LinkedIn",
    description: "Share professional content to LinkedIn profiles and pages",
    accentColor: "#0A66C2",
    iconColor: "text-sky-400",
    category: "destination",
    defaultSize: { w: 240, h: 64 },
    defaultData: () => ({ platform: "linkedin" as const, caption: "", scheduledFor: null }),
  },

  "social-youtube": {
    type: "social-youtube",
    label: "YouTube",
    description: "Upload Shorts or schedule video content to YouTube",
    accentColor: "#FF0000",
    iconColor: "text-red-400",
    category: "destination",
    defaultSize: { w: 240, h: 64 },
    defaultData: () => ({ platform: "youtube" as const, caption: "", scheduledFor: null }),
  },

  "social-tiktok": {
    type: "social-tiktok",
    label: "TikTok",
    description: "Publish short-form video and image content to TikTok",
    accentColor: "#00F2FE",
    iconColor: "text-teal-300",
    category: "destination",
    defaultSize: { w: 240, h: 64 },
    defaultData: () => ({ platform: "tiktok" as const, caption: "", scheduledFor: null }),
  },

  "socials-aggregator": {
    type: "socials-aggregator",
    label: "Multi-Channel Publisher",
    description: "Fan-out aggregator — broadcast to Instagram, X, and Facebook simultaneously",
    accentColor: "#ec4899",
    iconColor: "text-pink-400",
    category: "destination",
    defaultSize: { w: 240, h: 64 },
    defaultData: () => ({
      targets: { instagram: true, x: true, facebook: true },
      caption: "",
    }),
  },
};

/** All node types, grouped by category for the Add Node menu */
export const NODE_CATEGORIES = {
  source: Object.values(NODE_REGISTRY).filter((n) => n.category === "source"),
  trigger: Object.values(NODE_REGISTRY).filter((n) => n.category === "trigger"),
  control: Object.values(NODE_REGISTRY).filter((n) => n.category === "control"),
  transform: Object.values(NODE_REGISTRY).filter((n) => n.category === "transform"),
  destination: Object.values(NODE_REGISTRY).filter((n) => n.category === "destination"),
};

/** Width of each node type in px — used for SVG wire endpoint calculation */
export const NODE_WIDTHS: Partial<Record<NodeType, number>> = {
  "image-asset": 240,
  "ai-image-generator": 240,
  "ai-text-generator": 240,
  "http-request": 240,
  webhook: 240,
  "if-condition": 240,
  "for-loop": 240,
  "code-javascript": 240,
  "set-fields": 240,
  "delay-wait": 240,
  "debug-print": 240,
  "socials-aggregator": 240,
  "social-instagram": 240,
  "social-x": 240,
  "social-facebook": 240,
  "social-linkedin": 240,
  "social-youtube": 240,
  "social-tiktok": 240,
};

