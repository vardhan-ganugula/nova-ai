import type { CanvasNode, NodeEdge, NodeType, ImageAssetNodeData, HttpNodeData, WebhookNodeData } from "./types";
import { NODE_PORTS } from "./ports";
import { NODE_REGISTRY, NODE_WIDTHS } from "./nodeRegistry";

export type NodeStatus = "idle" | "running" | "success" | "error";

export interface LogEntry {
  id: string;
  ts: string;
  nodeId: string;
  nodeLabel: string;
  message: string;
  level: "info" | "success" | "error" | "data";
}

export interface NodePayload {
  [outputPortId: string]: unknown;
}

// ─── Topological sort (Kahn's algorithm) ─────────────────────────────────────
export function topologicalSort(nodes: CanvasNode[], edges: NodeEdge[]): string[] {
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const n of nodes) {
    inDegree.set(n.id, 0);
    adj.set(n.id, []);
  }
  for (const e of edges) {
    adj.get(e.sourceNodeId)?.push(e.targetNodeId);
    inDegree.set(e.targetNodeId, (inDegree.get(e.targetNodeId) ?? 0) + 1);
  }

  const queue = [...inDegree.entries()]
    .filter(([, deg]) => deg === 0)
    .map(([id]) => id);
  const sorted: string[] = [];

  while (queue.length) {
    const cur = queue.shift()!;
    sorted.push(cur);
    for (const next of adj.get(cur) ?? []) {
      const d = (inDegree.get(next) ?? 1) - 1;
      inDegree.set(next, d);
      if (d === 0) queue.push(next);
    }
  }

  // If not all nodes made it, there's a cycle — return partial order
  return sorted;
}

// ─── Per-node mock executor ───────────────────────────────────────────────────
async function executeNodeLogic(
  node: CanvasNode,
  inputs: NodePayload,
  log: (msg: string, level: LogEntry["level"]) => void,
  callbacks?: ExecutionCallbacks,
  publishedPlatforms?: Set<string>
): Promise<NodePayload> {
  await delay(400 + Math.random() * 400);

  switch (node.type) {
    case "image-asset": {
      const d = node.data as ImageAssetNodeData;
      if (!d.selectedImage) throw new Error("No image selected in Image Library node");
      log(`Emitting image: ${d.selectedImage.url.split("/").pop()}`, "data");
      return { IMAGE_OUT: d.selectedImage };
    }

    case "http-request": {
      const d = node.data as HttpNodeData;
      const url = d.url || "https://api.nova.ai/v1/status";
      log(`${d.method} → ${url}`, "info");
      await delay(300);
      const mock = { status: 200, data: { ok: true, url, method: d.method, ts: new Date().toISOString() } };
      log(`↳ 200 OK · ${JSON.stringify(mock).length} bytes`, "success");
      return { RESPONSE_OUT: mock };
    }

    case "webhook": {
      const incoming = inputs["PAYLOAD_IN"] ?? inputs["IMAGE_OUT"] ?? {};
      log(`Received payload: ${JSON.stringify(incoming).slice(0, 80)}…`, "data");
      const transformed = { ...((incoming as object) ?? {}), _transformed: true, _ts: Date.now() };
      log(`Transform complete → ${Object.keys(transformed).length} keys`, "success");
      return { PAYLOAD_OUT: transformed };
    }

    case "socials-aggregator":
    case "social-instagram":
    case "social-x":
    case "social-facebook":
    case "social-linkedin":
    case "social-youtube":
    case "social-tiktok": {
      const platform = node.type.replace("social-", "").replace("socials-aggregator", "multi-channel");
      const media = inputs["MEDIA_IN"] ?? inputs["IMAGE_OUT"] ?? (node.data as any)?.mediaUrl;
      if (!media) {
        throw new Error(`No media input connected to ${platform}. Drag a connection from the Image Library "Image Out" port to this node's "Media In" port.`);
      }

      // Extract image/media URL
      const mediaUrl = typeof media === "string" ? media : (media as any)?.url || (media as any)?.mediaUrl;
      if (!mediaUrl) {
        throw new Error(`No media URL found for ${platform}`);
      }

      const caption = (node.data as any)?.caption || "Created with Nova AI Studio #NovaAI";
      const imageId = (media as any)?.id || null;
      const rawTargetPlatforms: string[] = platform === "multi-channel"
        ? ((node.data as any)?.platforms || ["instagram", "facebook", "x"])
        : [platform];

      // Deduplicate: avoid posting to the same platform multiple times in a single workflow run
      const targetPlatforms = publishedPlatforms
        ? rawTargetPlatforms.filter((p) => !publishedPlatforms.has(p))
        : rawTargetPlatforms;

      if (targetPlatforms.length === 0) {
        log(`Platform (${rawTargetPlatforms.join(", ")}) already posted by a prior node in this run. Skipping duplicate.`, "info");
        return { PUBLISHED: { platform, mediaUrl, duplicateSkipped: true, ts: new Date().toISOString() } };
      }

      if (callbacks?.onPublishPost) {
        log(`Connecting to backend to publish to ${targetPlatforms.join(", ")}…`, "info");
        try {
          const res = await callbacks.onPublishPost({
            mediaUrl,
            mediaType: "image",
            caption,
            targetPlatforms,
            imageId,
          });
          if (publishedPlatforms) {
            targetPlatforms.forEach((p) => publishedPlatforms.add(p));
          }
          const postId = res?.post?.id ? ` (Post ID: ${res.post.id.slice(0, 8)}…)` : "";
          log(`✓ Live publish dispatched to Inngest queue for ${targetPlatforms.join(", ")}${postId}!`, "success");
          return { PUBLISHED: { platform, mediaUrl, postId: res?.post?.id, ts: new Date().toISOString() } };
        } catch (apiErr: any) {
          const errMsg = apiErr?.data?.error || apiErr?.message || "Failed to publish post via backend";
          throw new Error(`[${platform} API Error]: ${errMsg}`);
        }
      } else {
        if (publishedPlatforms) {
          targetPlatforms.forEach((p) => publishedPlatforms.add(p));
        }
        log(`Simulating publish to ${platform}…`, "info");
        await delay(600);
        log(`✓ Simulated publish to ${platform}`, "success");
        return { PUBLISHED: { platform, mediaUrl, ts: new Date().toISOString() } };
      }
    }

    default:
      return {};
  }
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export interface PublishPayload {
  mediaUrl: string;
  mediaType?: "image" | "video" | "audio";
  caption: string;
  targetPlatforms: string[];
  imageId?: string | null;
}

// ─── Pipeline runner ──────────────────────────────────────────────────────────
export interface ExecutionCallbacks {
  onNodeStatus: (id: string, status: NodeStatus) => void;
  onLog: (entry: Omit<LogEntry, "id" | "ts">) => void;
  onComplete: () => void;
  onPublishPost?: (payload: PublishPayload) => Promise<{ message: string; post?: any }>;
}

export async function runPipeline(
  nodes: CanvasNode[],
  edges: NodeEdge[],
  callbacks: ExecutionCallbacks
): Promise<void> {
  const { onNodeStatus, onLog, onComplete } = callbacks;
  const order = topologicalSort(nodes, edges);
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const registry = NODE_REGISTRY;

  // Track published platforms in this single pipeline execution to prevent duplicate posts
  const publishedPlatforms = new Set<string>();

  // Collected outputs per node
  const outputs = new Map<string, NodePayload>();

  const log = (nodeId: string, msg: string, level: LogEntry["level"] = "info") => {
    const n = nodeMap.get(nodeId);
    onLog({
      nodeId,
      nodeLabel: n ? registry[n.type].label : nodeId,
      message: msg,
      level,
    });
  };

  // Build input payload for a node from its incoming edges
  const getInputs = (nodeId: string): NodePayload => {
    const incoming: NodePayload = {};
    for (const edge of edges) {
      if (edge.targetNodeId !== nodeId) continue;
      const srcOutput = outputs.get(edge.sourceNodeId);
      if (srcOutput) {
        incoming[edge.targetPort] = srcOutput[edge.sourcePort] ?? Object.values(srcOutput)[0];
      }
    }
    return incoming;
  };

  for (const nodeId of order) {
    const node = nodeMap.get(nodeId);
    if (!node) continue;

    // If node requires inputs but has no incoming edges connected on the canvas, skip it
    const nodePorts = NODE_PORTS[node.type];
    const incomingEdges = edges.filter((e) => e.targetNodeId === nodeId);
    if (nodePorts && nodePorts.inputs.length > 0 && incomingEdges.length === 0) {
      onNodeStatus(nodeId, "idle");
      continue;
    }

    onNodeStatus(nodeId, "running");
    log(nodeId, `Starting execution…`);

    try {
      const inputs = getInputs(nodeId);
      const result = await executeNodeLogic(
        node,
        inputs,
        (msg, lvl) => log(nodeId, msg, lvl),
        callbacks,
        publishedPlatforms
      );
      outputs.set(nodeId, result);
      onNodeStatus(nodeId, "success");
    } catch (err: any) {
      log(nodeId, `Error: ${err?.message ?? String(err)}`, "error");
      onNodeStatus(nodeId, "error");
    }
  }

  onComplete();
}

// ── Re-export node widths for edge drawing ────────────────────────────────────
export { NODE_WIDTHS };
