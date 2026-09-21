import type React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Canvas View State
// ─────────────────────────────────────────────────────────────────────────────
export interface CanvasViewState {
  zoom: number;          // 0.25 – 2.5
  panX: number;
  panY: number;
  showMiniMap: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Node Port
// ─────────────────────────────────────────────────────────────────────────────
export type PortDataType =
  | "image"
  | "json"
  | "text"
  | "http-response"
  | "webhook-payload"
  | "any";

export interface NodePort {
  id: string;
  label: string;
  dataType: PortDataType;
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-Node Data Shapes
// ─────────────────────────────────────────────────────────────────────────────
export interface WorkflowImageItem {
  id: string;
  url: string;
  prompt: string;
  createdAt?: string;
  aspectRatio?: string;
  model?: string;
  width?: number;
  height?: number;
}

export interface ImageAssetNodeData {
  selectedImage: WorkflowImageItem | null;
}

export interface HttpNodeData {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  url: string;
  headers: Array<{ key: string; value: string }>;
  queryParams: Array<{ key: string; value: string }>;
  body: string;
  response: string | null;
  statusCode: number | null;
  latencyMs: number | null;
  isExecuting: boolean;
}

export type WebhookMode = "trigger" | "transform";
export interface WebhookNodeData {
  mode: WebhookMode;
  webhookUrl: string;
  eventFilter: string;
  lastTriggeredAt: string | null;
  payloadPreview: string;
  // transform mode
  mappings: Array<{ from: string; to: string }>;
  outputPreview: string;
}

export type PlatformId =
  | "instagram"
  | "x"
  | "facebook"
  | "linkedin"
  | "youtube"
  | "tiktok";

export interface SocialAccountNodeData {
  platform: PlatformId;
  caption: string;
  scheduledFor: string | null;
}

// Fan-out aggregator (3-in-one)
export interface SocialTargetState {
  instagram: boolean;
  x: boolean;
  facebook: boolean;
}
export interface SocialsAggregatorData {
  targets: SocialTargetState;
  caption: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Universal CanvasNode
// ─────────────────────────────────────────────────────────────────────────────
export type NodeType =
  | "image-asset"
  | "http-request"
  | "webhook"
  | "social-instagram"
  | "social-x"
  | "social-facebook"
  | "social-linkedin"
  | "social-youtube"
  | "social-tiktok"
  | "socials-aggregator";

export interface WorkflowPosition {
  x: number;
  y: number;
}

export interface CanvasNode {
  id: string;
  type: NodeType;
  position: WorkflowPosition;
  data:
    | ImageAssetNodeData
    | HttpNodeData
    | WebhookNodeData
    | SocialAccountNodeData
    | SocialsAggregatorData;
  selected?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Edge (wire between nodes)
// ─────────────────────────────────────────────────────────────────────────────
export interface NodeEdge {
  id: string;
  sourceNodeId: string;
  sourcePort: string;     // e.g. "IMAGE_OUT"
  targetNodeId: string;
  targetPort: string;     // e.g. "MEDIA_IN"
  dataType: PortDataType;
  animated?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Node Registry entry
// ─────────────────────────────────────────────────────────────────────────────
export interface NodeRegistryEntry {
  type: NodeType;
  label: string;
  description: string;
  accentColor: string;       // tailwind color string for glow / border
  iconColor: string;
  category: "source" | "transform" | "destination" | "trigger";
  defaultData: () => CanvasNode["data"];
  defaultSize: { w: number; h: number };
}
