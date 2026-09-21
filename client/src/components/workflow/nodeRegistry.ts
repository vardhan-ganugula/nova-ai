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
    defaultSize: { w: 340, h: 460 },
    defaultData: () => ({ selectedImage: null }),
  },

  "http-request": {
    type: "http-request",
    label: "HTTP Request",
    description: "Make API calls — GET, POST, PUT, PATCH or DELETE any endpoint",
    accentColor: "#f97316",
    iconColor: "text-orange-400",
    category: "trigger",
    defaultSize: { w: 340, h: 360 },
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
    defaultSize: { w: 320, h: 340 },
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
    defaultSize: { w: 280, h: 420 },
    defaultData: () => ({ platform: "instagram" as const, caption: "", scheduledFor: null }),
  },

  "social-x": {
    type: "social-x",
    label: "X (Twitter)",
    description: "Tweet or thread content on X (Twitter), up to 280 chars",
    accentColor: "#ffffff",
    iconColor: "text-white",
    category: "destination",
    defaultSize: { w: 280, h: 420 },
    defaultData: () => ({ platform: "x" as const, caption: "", scheduledFor: null }),
  },

  "social-facebook": {
    type: "social-facebook",
    label: "Facebook",
    description: "Publish posts and media to your Facebook pages",
    accentColor: "#1877F2",
    iconColor: "text-blue-400",
    category: "destination",
    defaultSize: { w: 280, h: 420 },
    defaultData: () => ({ platform: "facebook" as const, caption: "", scheduledFor: null }),
  },

  "social-linkedin": {
    type: "social-linkedin",
    label: "LinkedIn",
    description: "Share professional content to LinkedIn profiles and pages",
    accentColor: "#0A66C2",
    iconColor: "text-sky-400",
    category: "destination",
    defaultSize: { w: 280, h: 420 },
    defaultData: () => ({ platform: "linkedin" as const, caption: "", scheduledFor: null }),
  },

  "social-youtube": {
    type: "social-youtube",
    label: "YouTube",
    description: "Upload Shorts or schedule video content to YouTube",
    accentColor: "#FF0000",
    iconColor: "text-red-400",
    category: "destination",
    defaultSize: { w: 280, h: 420 },
    defaultData: () => ({ platform: "youtube" as const, caption: "", scheduledFor: null }),
  },

  "social-tiktok": {
    type: "social-tiktok",
    label: "TikTok",
    description: "Publish short-form video and image content to TikTok",
    accentColor: "#00F2FE",
    iconColor: "text-teal-300",
    category: "destination",
    defaultSize: { w: 280, h: 420 },
    defaultData: () => ({ platform: "tiktok" as const, caption: "", scheduledFor: null }),
  },

  "socials-aggregator": {
    type: "socials-aggregator",
    label: "Multi-Channel Publisher",
    description: "Fan-out aggregator — broadcast to Instagram, X, and Facebook simultaneously",
    accentColor: "#ec4899",
    iconColor: "text-pink-400",
    category: "destination",
    defaultSize: { w: 380, h: 500 },
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
  transform: Object.values(NODE_REGISTRY).filter((n) => n.category === "transform"),
  destination: Object.values(NODE_REGISTRY).filter((n) => n.category === "destination"),
};

/** Width of each node type in px — used for SVG wire endpoint calculation */
export const NODE_WIDTHS: Partial<Record<NodeType, number>> = {
  "image-asset": 340,
  "http-request": 340,
  webhook: 320,
  "socials-aggregator": 384,
  "social-instagram": 280,
  "social-x": 280,
  "social-facebook": 280,
  "social-linkedin": 280,
  "social-youtube": 280,
  "social-tiktok": 280,
};

