import type {
  CanvasNode,
  NodeEdge,
  NodeType,
  ImageAssetNodeData,
  HttpNodeData,
  WebhookNodeData,
  AiImageGenNodeData,
  AiTextGenNodeData,
  IfNodeData,
  ForNodeData,
  CodeNodeData,
  SetFieldsNodeData,
  DelayNodeData,
  PrintLogNodeData,
} from "./types";
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

    case "ai-image-generator": {
      const d = node.data as AiImageGenNodeData;
      const incomingPrompt = inputs["PROMPT_IN"];
      const prompt =
        (typeof incomingPrompt === "string"
          ? incomingPrompt
          : (incomingPrompt as any)?.prompt || (incomingPrompt as any)?.text) ||
        d.prompt ||
        "Cinematic futuristic city at sunset, 8k octane render";
      const model = d.model || "Flux Schnell";
      log(`Calling AI image generation (${model})… Prompt: "${prompt.slice(0, 45)}…"`, "info");

      if (callbacks?.onGenerateImage) {
        try {
          const genRes = await callbacks.onGenerateImage({
            prompt,
            style: d.stylePreset,
            aspectRatio: d.aspectRatio || "1:1",
            model,
            negativePrompt: d.negativePrompt,
          });

          const generatedImg = {
            id: genRes.image?.id || `gen-${Date.now()}`,
            url: genRes.url,
            prompt,
            model,
            aspectRatio: d.aspectRatio || "1:1",
            createdAt: new Date().toISOString(),
          };
          log(`✓ Real AI image generated & stored in R2!`, "success");
          return { IMAGE_OUT: generatedImg };
        } catch (genErr: any) {
          const msg = genErr?.data?.error || genErr?.message || "Failed to generate image";
          log(`AI Image generation failed: ${msg}`, "error");
          throw new Error(`[AI Generation Error]: ${msg}`);
        }
      } else {
        await delay(900);
        const generatedImg = {
          id: `gen-${Date.now()}`,
          url: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80`,
          prompt,
          model,
          aspectRatio: d.aspectRatio || "1:1",
          createdAt: new Date().toISOString(),
        };
        log(`✓ Image generated successfully (${model})`, "success");
        return { IMAGE_OUT: generatedImg };
      }
    }

    case "ai-text-generator": {
      const d = node.data as AiTextGenNodeData;
      const incomingPrompt = inputs["PROMPT_IN"] ?? inputs["DATA_IN"] ?? inputs["PAYLOAD_IN"];
      const prompt =
        (typeof incomingPrompt === "string"
          ? incomingPrompt
          : (incomingPrompt as any)?.text || (incomingPrompt as any)?.prompt) ||
        d.prompt ||
        "Write an engaging viral social media caption with hashtags";
      const model = d.model || "NVIDIA Nemotron 3.5 Lightning";
      log(`Calling AI text generation (${model})… Prompt: "${prompt.slice(0, 45)}…"`, "info");

      if (callbacks?.onGenerateText) {
        try {
          const jsonConstraint = "The output should be in JSON format and there should only be alphanumeric characters and emojis, no special characters.";
          const systemInstructions = d.systemPrompt
            ? `${d.systemPrompt}\n${jsonConstraint}`
            : jsonConstraint;
          const fullPrompt = `[System Instructions: ${systemInstructions}]\n\nUser Request: ${prompt}`;
          const res = await callbacks.onGenerateText({ prompt: fullPrompt, model });
          log(`✓ AI Text generated (${res.text.length} chars)`, "success");

          let parsedPayload: any = { text: res.text, prompt, model };
          try {
            const parsed = JSON.parse(res.text);
            parsedPayload = typeof parsed === "object" && parsed !== null ? { ...parsed, prompt, model } : parsedPayload;
          } catch {
            const match = res.text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (match) {
              try {
                const parsed = JSON.parse(match[1]);
                parsedPayload = typeof parsed === "object" && parsed !== null ? { ...parsed, prompt, model } : parsedPayload;
              } catch {}
            }
          }

          return { TEXT_OUT: res.text, PAYLOAD_OUT: parsedPayload };
        } catch (err: any) {
          const msg = err?.data?.error || err?.message || "Failed to generate text";
          log(`AI text error: ${msg}`, "error");
          throw new Error(`[AI Text Error]: ${msg}`);
        }
      } else {
        await delay(800);
        const mockJson = {
          caption: "Unveiling the future where neon dreams collide with digital consciousness ✨🚀🤖",
          tags: "NovaAI Cyberpunk FutureVibes 🔥🌟"
        };
        const mockText = JSON.stringify(mockJson, null, 2);
        log(`✓ AI text generated (${mockText.length} chars)`, "success");
        return { TEXT_OUT: mockText, PAYLOAD_OUT: { ...mockJson, prompt, model } };
      }
    }

    case "if-condition": {
      const d = node.data as IfNodeData;
      const incoming = inputs["VALUE_IN"] ?? inputs["PAYLOAD_IN"] ?? inputs;
      const field = d.condition?.field;
      let actualValue: any = incoming;
      if (field && typeof incoming === "object" && incoming !== null) {
        actualValue = (incoming as any)[field] ?? incoming;
      }
      const expectedValue = d.condition?.value;
      let isTrue = false;
      switch (d.condition?.operator) {
        case "equals":
          isTrue = String(actualValue) === String(expectedValue);
          break;
        case "not_equals":
          isTrue = String(actualValue) !== String(expectedValue);
          break;
        case "contains":
          isTrue = String(actualValue).toLowerCase().includes(String(expectedValue || "").toLowerCase());
          break;
        case "greater_than":
          isTrue = Number(actualValue) > Number(expectedValue);
          break;
        case "less_than":
          isTrue = Number(actualValue) < Number(expectedValue);
          break;
        case "is_empty":
          isTrue = actualValue === undefined || actualValue === null || actualValue === "" || (Array.isArray(actualValue) && actualValue.length === 0);
          break;
        case "is_not_empty":
          isTrue = actualValue !== undefined && actualValue !== null && actualValue !== "" && (!Array.isArray(actualValue) || actualValue.length > 0);
          break;
        default:
          isTrue = Boolean(actualValue);
      }
      log(`Condition: "${field || "value"}" ${d.condition?.operator} "${expectedValue ?? ""}" → ${isTrue ? "TRUE" : "FALSE"}`, isTrue ? "success" : "info");
      return isTrue ? { TRUE_OUT: incoming } : { FALSE_OUT: incoming };
    }

    case "for-loop": {
      const d = node.data as ForNodeData;
      const incoming = inputs["ARRAY_IN"] ?? inputs["PAYLOAD_IN"] ?? [];
      let items: any[] = [];
      if (Array.isArray(incoming)) {
        items = incoming;
      } else if (typeof incoming === "object" && incoming !== null) {
        const arrayKey = d.fieldPath || "items";
        if (Array.isArray((incoming as any)[arrayKey])) {
          items = (incoming as any)[arrayKey];
        } else {
          items = Object.values(incoming);
        }
      } else {
        items = [incoming];
      }
      const batchSize = Math.max(1, d.batchSize || 1);
      const batch = items.slice(0, batchSize);
      log(`Looping over array of ${items.length} item(s) (batch size: ${batchSize})`, "info");
      return {
        LOOP_ITEM: batchSize === 1 ? batch[0] : batch,
        DONE_OUT: { totalItems: items.length, items },
      };
    }

    case "code-javascript": {
      const d = node.data as CodeNodeData;
      const incoming = inputs["DATA_IN"] ?? inputs["PAYLOAD_IN"] ?? {};
      log(`Executing JavaScript code (${(d.code || "").length} chars)…`, "info");
      try {
        const fn = new Function("data", d.code || "return data;");
        const result = fn(incoming);
        log(`✓ JS code executed successfully`, "success");
        return { PAYLOAD_OUT: result !== undefined ? result : incoming };
      } catch (err: any) {
        throw new Error(`Code execution error: ${err?.message || String(err)}`);
      }
    }

    case "set-fields": {
      const d = node.data as SetFieldsNodeData;
      const incoming = inputs["PAYLOAD_IN"] ?? {};
      const base = d.mode === "replace" ? {} : (typeof incoming === "object" && incoming !== null ? { ...incoming } : { value: incoming });
      const fields = d.fields || [];
      for (const f of fields) {
        if (!f.key) continue;
        let val: any = f.value;
        if (f.type === "number") val = Number(f.value);
        else if (f.type === "boolean") val = f.value === "true";
        (base as any)[f.key] = val;
      }
      log(`Set ${fields.length} field(s) (${d.mode} mode)`, "success");
      return { PAYLOAD_OUT: base };
    }

    case "delay-wait": {
      const d = node.data as DelayNodeData;
      const incoming = inputs["FLOW_IN"] ?? inputs["PAYLOAD_IN"] ?? {};
      const unit = d.unit || "seconds";
      const amount = d.duration || 1;
      const ms = unit === "minutes" ? amount * 60 * 1000 : amount * 1000;
      const actualWait = Math.min(ms, 3000);
      log(`Waiting ${amount} ${unit} (simulating ${actualWait}ms)…`, "info");
      await delay(actualWait);
      log(`✓ Delay completed`, "success");
      return { FLOW_OUT: incoming };
    }

    case "debug-print": {
      const d = node.data as PrintLogNodeData;
      const incoming = inputs["PAYLOAD_IN"] ?? inputs["DATA_IN"] ?? inputs;
      const label = d.label || "Debug Print";
      const lvl = d.logLevel || "info";

      let displayStr = "";
      if (d.format === "string" && typeof incoming === "string") {
        displayStr = incoming;
      } else {
        try {
          displayStr = JSON.stringify(incoming, null, 2);
        } catch {
          displayStr = String(incoming);
        }
      }

      log(`[${label}]: ${displayStr.slice(0, 150)}${displayStr.length > 150 ? "…" : ""}`, lvl);
      return {
        DATA_OUT: incoming,
        PAYLOAD_OUT: incoming,
      };
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
  onGenerateImage?: (params: {
    prompt: string;
    style?: string;
    aspectRatio?: string;
    model?: string;
    negativePrompt?: string;
  }) => Promise<{ url: string; image?: any }>;
  onGenerateText?: (params: {
    prompt: string;
    model?: string;
  }) => Promise<{ text: string }>;
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
        if (edge.sourcePort in srcOutput) {
          incoming[edge.targetPort] = srcOutput[edge.sourcePort];
        } else if (Object.keys(srcOutput).length === 1) {
          incoming[edge.targetPort] = Object.values(srcOutput)[0];
        }
      }
    }
    return incoming;
  };

  for (const nodeId of order) {
    const node = nodeMap.get(nodeId);
    if (!node) continue;

    // If node requires inputs but has no incoming edges connected on the canvas, skip it (unless it's an AI generator configured with a prompt)
    const nodePorts = NODE_PORTS[node.type];
    const incomingEdges = edges.filter((e) => e.targetNodeId === nodeId);
    if (
      nodePorts &&
      nodePorts.inputs.length > 0 &&
      incomingEdges.length === 0 &&
      node.type !== "ai-image-generator" &&
      node.type !== "ai-text-generator"
    ) {
      onNodeStatus(nodeId, "idle");
      continue;
    }

    // Branching check: if node has incoming edges from prior executed nodes, but none produced a value for the connected ports (e.g. inactive If branch), skip execution
    if (incomingEdges.length > 0) {
      const hasActiveInput = incomingEdges.some((e) => {
        const srcOutput = outputs.get(e.sourceNodeId);
        return srcOutput && (e.sourcePort in srcOutput || Object.keys(srcOutput).length === 1);
      });
      if (!hasActiveInput) {
        log(nodeId, `Skipped (inactive conditional branch)`);
        onNodeStatus(nodeId, "idle");
        continue;
      }
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
