import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Copy,
  Check,
  Play,
  SlidersHorizontal,
  Terminal,
  ExternalLink,
  Plus,
  Trash2,
  Sparkles,
  Globe,
  ImageIcon,
  Webhook,
  Share2,
  Clock,
  Lock,
  Edit3,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Code2,
  GitBranch,
  Repeat,
  Sliders,
  Hourglass,
  Wand2,
  Bot,
} from "lucide-react";
import {
  FaInstagram,
  FaXTwitter,
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
  FaTiktok,
} from "react-icons/fa6";
import type {
  CanvasNode,
  NodeType,
  HttpNodeData,
  WebhookNodeData,
  ImageAssetNodeData,
  AiImageGenNodeData,
  AiTextGenNodeData,
  IfNodeData,
  IfCondition,
  ForNodeData,
  CodeNodeData,
  SetFieldsNodeData,
  SetFieldItem,
  DelayNodeData,
  PrintLogNodeData,
  SocialAccountNodeData,
  SocialsAggregatorData,
  WorkflowImageItem,
  PlatformId,
} from "./types";
import { NODE_REGISTRY } from "./nodeRegistry";
import { useGetUserHistoryQuery, useGenerateImageMutation, useGenerateTextMutation } from "@/store/authSlice";
import { useGetSocialAccountsQuery } from "@/store/socialSlice";
import { useAppSelector } from "@/store";
import { AI_IMAGE_MODELS, AI_CHAT_MODELS, type AiModelMeta } from "@/constants/aiModels";
import { ModelSelectDropdown } from "./ModelSelectDropdown";
import toast from "react-hot-toast";

interface NodeConfigDrawerProps {
  node: CanvasNode | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateData: (nodeId: string, patch: any) => void;
  onUpdateLabel: (nodeId: string, label: string) => void;
  selectedPipelineImage?: WorkflowImageItem | null;
}

// Fallback demo images if library is empty
const DEMO_IMAGES: WorkflowImageItem[] = [
  {
    id: "demo-1",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    prompt: "Cyberpunk iridescent android portrait, volumetric neon lighting, 8k octane render",
    aspectRatio: "1:1",
    model: "Flux.1 Pro",
  },
  {
    id: "demo-2",
    url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&auto=format&fit=crop&q=80",
    prompt: "Ethereal crystal cavern with glowing bioluminescent fungi, unreal engine 5",
    aspectRatio: "16:9",
    model: "SDXL Lightning",
  },
  {
    id: "demo-3",
    url: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=600&auto=format&fit=crop&q=80",
    prompt: "Futuristic liquid chrome fluid dynamics in zero gravity, studio lighting",
    aspectRatio: "1:1",
    model: "Midjourney v6",
  },
];

export const NodeConfigDrawer: React.FC<NodeConfigDrawerProps> = ({
  node,
  isOpen,
  onClose,
  onUpdateData,
  onUpdateLabel,
  selectedPipelineImage,
}) => {
  const [activeTab, setActiveTab] = useState<"settings" | "test">("settings");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Backend AI mutations
  const [generateImageApi] = useGenerateImageMutation();
  const [generateTextApi] = useGenerateTextMutation();

  // Test execution state
  const [isExecutingTest, setIsExecutingTest] = useState(false);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<number | null>(null);
  const [testLatency, setTestLatency] = useState<number | null>(null);

  // Synchronize local title when node changes
  useEffect(() => {
    if (node) {
      const reg = NODE_REGISTRY[node.type];
      setTitleInput(node.label || reg?.label || node.type);
      setTestResponse(null);
      setTestStatus(null);
      setTestLatency(null);
      setIsEditingTitle(false);
    }
  }, [node?.id, node?.label]);

  // Keyboard navigation: Escape closes drawer
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !node) return null;

  const registry = NODE_REGISTRY[node.type];

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim() && titleInput !== node.label) {
      onUpdateLabel(node.id, titleInput.trim());
      toast.success("Node renamed");
    }
  };

  const copyNodeId = () => {
    navigator.clipboard.writeText(node.id);
    setCopiedId(true);
    toast.success("Node ID copied");
    setTimeout(() => setCopiedId(false), 1800);
  };

  const copyTestOutput = () => {
    if (!testResponse) return;
    navigator.clipboard.writeText(testResponse);
    setCopiedPayload(true);
    toast.success("Output JSON copied");
    setTimeout(() => setCopiedPayload(false), 1800);
  };

  // Node execution simulation for Test tab
  const handleExecuteTest = async () => {
    setIsExecutingTest(true);
    const start = Date.now();
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    const latency = Date.now() - start;

    switch (node.type) {
      case "http-request": {
        const d = node.data as HttpNodeData;
        const resp = {
          status: 200,
          statusText: "OK",
          headers: {
            "content-type": "application/json; charset=utf-8",
            "x-response-time": `${latency}ms`,
          },
          data: {
            ok: true,
            method: d.method,
            url: d.url || "https://api.nova.ai/v1/sample",
            timestamp: new Date().toISOString(),
            receivedBody: d.body ? (() => { try { return JSON.parse(d.body); } catch { return d.body; } })() : null,
            message: "HTTP node executed successfully via Nova Engine",
          },
        };
        const str = JSON.stringify(resp, null, 2);
        setTestResponse(str);
        setTestStatus(200);
        setTestLatency(latency);
        onUpdateData(node.id, { response: str, statusCode: 200, latencyMs: latency });
        break;
      }

      case "webhook": {
        const d = node.data as WebhookNodeData;
        const resp = {
          event: d.eventFilter || "nova.event.dispatched",
          mode: d.mode,
          timestamp: new Date().toISOString(),
          webhookUrl: d.webhookUrl,
          payload: {
            id: `evt_${Math.random().toString(36).slice(2, 9)}`,
            status: "delivered",
            data: {
              source: "Nova Automation",
              mappingsApplied: d.mappings.length,
            },
          },
        };
        const str = JSON.stringify(resp, null, 2);
        setTestResponse(str);
        setTestStatus(200);
        setTestLatency(latency);
        onUpdateData(node.id, { payloadPreview: str, lastTriggeredAt: new Date().toISOString() });
        break;
      }

      case "image-asset": {
        const d = node.data as ImageAssetNodeData;
        const resp = {
          success: true,
          outputPort: "IMAGE_OUT",
          image: d.selectedImage || {
            status: "unselected",
            hint: "Select an image from the Parameters tab to emit downstream",
          },
        };
        setTestResponse(JSON.stringify(resp, null, 2));
        setTestStatus(d.selectedImage ? 200 : 404);
        setTestLatency(latency);
        break;
      }

      case "ai-image-generator": {
        const d = node.data as AiImageGenNodeData;
        const promptToUse = d.prompt?.trim() || "Cyberpunk iridescent android portrait, volumetric neon lighting";
        const modelToUse = d.model || "Flux Schnell";
        const toastId = toast.loading(`Generating artwork with ${modelToUse}…`);
        try {
          const res = await generateImageApi({
            prompt: promptToUse,
            negativePrompt: d.negativePrompt,
            style: d.stylePreset,
            aspectRatio: d.aspectRatio || "1:1",
            model: modelToUse,
          }).unwrap();

          const realUrl = res.url || res.image?.r2Url || res.image?.watermarkedR2Url;
          const generatedImg: WorkflowImageItem = {
            id: res.image?.id || `gen-${Date.now()}`,
            url: realUrl,
            prompt: promptToUse,
            model: modelToUse,
            aspectRatio: d.aspectRatio || "1:1",
            createdAt: "Just now",
          };
          onUpdateData(node.id, { generatedImage: generatedImg, isGenerating: false });
          const resp = {
            success: true,
            outputPort: "IMAGE_OUT",
            promptUsed: promptToUse,
            model: modelToUse,
            aspectRatio: d.aspectRatio,
            creditsRemaining: res.creditsRemaining,
            tokensDeducted: res.tokensDeducted,
            image: generatedImg,
          };
          setTestResponse(JSON.stringify(resp, null, 2));
          setTestStatus(200);
          setTestLatency(Date.now() - start);
          toast.success("Artwork rendered & saved to R2!", { id: toastId });
        } catch (apiErr: any) {
          const errMsg = apiErr?.data?.error || apiErr?.message || "Failed to generate image via Fal AI";
          const errResp = {
            success: false,
            error: errMsg,
            creditsRemaining: apiErr?.data?.credits,
          };
          setTestResponse(JSON.stringify(errResp, null, 2));
          setTestStatus(apiErr?.status || 500);
          setTestLatency(Date.now() - start);
          toast.error(errMsg, { id: toastId });
        }
        break;
      }

      case "ai-text-generator": {
        const d = node.data as AiTextGenNodeData;
        const promptToUse = d.prompt?.trim() || "Write a viral social media caption with trending hashtags";
        const modelToUse = d.model || "NVIDIA Nemotron 3.5 Lightning";
        const jsonConstraint = "The output should be in JSON format and there should only be alphanumeric characters and emojis, no special characters.";
        const systemInstructions = d.systemPrompt
          ? `${d.systemPrompt}\n${jsonConstraint}`
          : jsonConstraint;
        const fullPrompt = `[System Instructions: ${systemInstructions}]\n\nUser Request: ${promptToUse}`;
        const toastId = toast.loading(`Synthesizing text with ${modelToUse}…`);
        try {
          const res = await generateTextApi({
            prompt: fullPrompt,
            model: modelToUse,
          }).unwrap();

          onUpdateData(node.id, { generatedText: res.text, isGenerating: false });
          const resp = {
            success: true,
            outputPort: "TEXT_OUT",
            model: modelToUse,
            promptUsed: promptToUse,
            systemPromptUsed: d.systemPrompt,
            creditsRemaining: res.creditsRemaining,
            tokensDeducted: res.tokensDeducted,
            generatedText: res.text,
          };
          setTestResponse(JSON.stringify(resp, null, 2));
          setTestStatus(200);
          setTestLatency(Date.now() - start);
          toast.success("Text generated successfully!", { id: toastId });
        } catch (apiErr: any) {
          const errMsg = apiErr?.data?.error || apiErr?.message || "Failed to generate text";
          const errResp = {
            success: false,
            error: errMsg,
            creditsRemaining: apiErr?.data?.credits,
          };
          setTestResponse(JSON.stringify(errResp, null, 2));
          setTestStatus(apiErr?.status || 500);
          setTestLatency(Date.now() - start);
          toast.error(errMsg, { id: toastId });
        }
        break;
      }

      case "if-condition": {
        const d = node.data as IfNodeData;
        const testPayload = { status: "success", count: 12, ok: true };
        const op = d.condition?.operator || "equals";
        const val = d.condition?.value ?? "success";
        const actualVal = (testPayload as any)[d.condition?.field || "status"] ?? "success";
        let isTrue = false;
        if (op === "equals") isTrue = String(actualVal) === String(val);
        else if (op === "not_equals") isTrue = String(actualVal) !== String(val);
        else if (op === "contains") isTrue = String(actualVal).includes(String(val));
        else if (op === "is_empty") isTrue = !actualVal;
        else if (op === "is_not_empty") isTrue = Boolean(actualVal);
        else if (op === "greater_than") isTrue = Number(actualVal) > Number(val);
        else if (op === "less_than") isTrue = Number(actualVal) < Number(val);
        else isTrue = Boolean(actualVal);

        const resp = {
          evaluatedField: d.condition?.field || "status",
          operator: op,
          compareValue: val,
          actualValue: actualVal,
          branchResult: isTrue ? "TRUE_OUT" : "FALSE_OUT",
          isConditionMet: isTrue,
          samplePayload: testPayload,
        };
        setTestResponse(JSON.stringify(resp, null, 2));
        setTestStatus(200);
        setTestLatency(latency);
        break;
      }

      case "for-loop": {
        const d = node.data as ForNodeData;
        const sampleItems = ["Item 1: Cyberpunk Art", "Item 2: Ethereal Landscape", "Item 3: Neon Samurai"];
        const resp = {
          batchSize: d.batchSize || 1,
          totalItems: sampleItems.length,
          currentBatch: sampleItems.slice(0, d.batchSize || 1),
          activePort: "LOOP_ITEM",
          completedPort: "DONE_OUT",
        };
        setTestResponse(JSON.stringify(resp, null, 2));
        setTestStatus(200);
        setTestLatency(latency);
        break;
      }

      case "code-javascript": {
        const d = node.data as CodeNodeData;
        let evalResult: any;
        try {
          const fn = new Function("data", d.code || "return data;");
          evalResult = fn({ status: 200, message: "Sample input data" });
        } catch (err: any) {
          evalResult = { error: err.message };
        }
        const resp = {
          executionSuccess: !evalResult.error,
          transformedPayload: evalResult,
        };
        setTestResponse(JSON.stringify(resp, null, 2));
        setTestStatus(evalResult.error ? 500 : 200);
        setTestLatency(latency);
        break;
      }

      case "set-fields": {
        const d = node.data as SetFieldsNodeData;
        const mergedFields: Record<string, any> = {};
        d.fields?.forEach((f) => {
          mergedFields[f.key] = f.type === "number" ? Number(f.value) : f.type === "boolean" ? f.value === "true" : f.value;
        });
        const resp = {
          mode: d.mode || "append",
          fieldsSet: mergedFields,
          resultingPayload: { id: "req_demo_01", ...mergedFields },
        };
        setTestResponse(JSON.stringify(resp, null, 2));
        setTestStatus(200);
        setTestLatency(latency);
        break;
      }

      case "delay-wait": {
        const d = node.data as DelayNodeData;
        const resp = {
          status: "completed",
          waitedMs: Math.min(latency, 2000),
          configuredDuration: `${d.duration || 3} ${d.unit || "seconds"}`,
          readyForNextNode: true,
        };
        setTestResponse(JSON.stringify(resp, null, 2));
        setTestStatus(200);
        setTestLatency(latency);
        break;
      }

      case "debug-print": {
        const d = node.data as PrintLogNodeData;
        const sampleIncoming = {
          status: 200,
          data: {
            id: "sample-101",
            title: "Cyberpunk Art Collection",
            author: "Nova Artist",
            tags: ["ai", "future", "art"],
          },
          timestamp: new Date().toISOString(),
        };
        const label = d.label || "Debug Output";
        const formatted = d.format === "string" ? JSON.stringify(sampleIncoming) : sampleIncoming;
        onUpdateData(node.id, { lastPrintedData: formatted });
        const resp = {
          node: "debug-print",
          label,
          logLevel: d.logLevel || "info",
          format: d.format || "json",
          capturedPayload: formatted,
          outputPort: "DATA_OUT",
          note: "Incoming data is logged to execution console and passed downstream unchanged",
        };
        setTestResponse(JSON.stringify(resp, null, 2));
        setTestStatus(200);
        setTestLatency(latency);
        break;
      }

      default: {
        const resp = {
          success: true,
          nodeType: node.type,
          timestamp: new Date().toISOString(),
          data: node.data,
          message: "Node test execution completed",
        };
        setTestResponse(JSON.stringify(resp, null, 2));
        setTestStatus(200);
        setTestLatency(latency);
        break;
      }
    }

    setIsExecutingTest(false);
  };

  // Icon component
  const renderIcon = () => {
    switch (node.type) {
      case "http-request":
        return <Globe className="w-5 h-5 text-orange-400" />;
      case "image-asset":
        return <ImageIcon className="w-5 h-5 text-cyan-400" />;
      case "ai-image-generator":
        return <Sparkles className="w-5 h-5 text-pink-400" />;
      case "webhook":
        return <Webhook className="w-5 h-5 text-purple-400" />;
      case "if-condition":
        return <GitBranch className="w-5 h-5 text-emerald-400" />;
      case "for-loop":
        return <Repeat className="w-5 h-5 text-blue-400" />;
      case "code-javascript":
        return <Code2 className="w-5 h-5 text-amber-400" />;
      case "set-fields":
        return <Sliders className="w-5 h-5 text-purple-400" />;
      case "delay-wait":
        return <Hourglass className="w-5 h-5 text-cyan-400" />;
      case "socials-aggregator":
        return <Share2 className="w-5 h-5 text-pink-400" />;
      case "social-instagram":
        return <FaInstagram className="w-5 h-5 text-pink-500" />;
      case "social-x":
        return <FaXTwitter className="w-4 h-4 text-zinc-100" />;
      case "social-facebook":
        return <FaFacebookF className="w-4 h-4 text-blue-500" />;
      case "social-linkedin":
        return <FaLinkedinIn className="w-4 h-4 text-sky-400" />;
      case "social-youtube":
        return <FaYoutube className="w-5 h-5 text-red-500" />;
      case "social-tiktok":
        return <FaTiktok className="w-4 h-4 text-teal-300" />;
      default:
        return <Globe className="w-5 h-5 text-zinc-400" />;
    }
  };

  return (
    <>
      {/* Semi-transparent backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[480px] md:w-[520px] bg-[#121217] border-l border-white/[0.08] shadow-2xl z-[201] flex flex-col transform transition-transform duration-300 ease-out">
        
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="p-4 border-b border-white/[0.08] bg-[#16161D] flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Brand icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border"
              style={{
                background: `${registry?.accentColor || "#f97316"}20`,
                borderColor: `${registry?.accentColor || "#f97316"}40`,
              }}
            >
              {renderIcon()}
            </div>

            {/* Editable Title + ID chip */}
            <div className="min-w-0 flex-1">
              {isEditingTitle ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onBlur={handleTitleSubmit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleTitleSubmit();
                      if (e.key === "Escape") setIsEditingTitle(false);
                    }}
                    autoFocus
                    className="w-full text-sm font-bold bg-[#0e0e12] border border-orange-500/60 rounded px-2 py-1 text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleTitleSubmit}
                    className="p-1 rounded bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group/edit cursor-pointer" onClick={() => setIsEditingTitle(true)}>
                  <h2 className="text-sm font-bold text-white truncate group-hover/edit:text-orange-400 transition-colors">
                    {titleInput}
                  </h2>
                  <Edit3 className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover/edit:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              )}

              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={copyNodeId}
                  className="font-mono text-[10px] text-zinc-400 hover:text-zinc-200 bg-white/[0.04] hover:bg-white/[0.08] px-1.5 py-0.5 rounded border border-white/[0.06] flex items-center gap-1 transition"
                  title="Click to copy Node ID"
                >
                  <span>#{node.id.slice(0, 18)}…</span>
                  {copiedId ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                </button>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  {registry?.category}
                </span>
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            title="Close Drawer (Esc)"
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-transparent hover:border-white/[0.08] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Tab Navigation ────────────────────────────────────────────────── */}
        <div className="flex border-b border-white/[0.07] bg-[#141419] px-4 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "settings"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Parameters & Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("test")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "test"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Test & Execution</span>
            {testStatus && (
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                  testStatus === 200 ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                }`}
              >
                {testStatus}
              </span>
            )}
          </button>
        </div>

        {/* ── Drawer Body ───────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {activeTab === "settings" ? (
            <ParametersSection
              node={node}
              onUpdateData={onUpdateData}
              selectedPipelineImage={selectedPipelineImage}
            />
          ) : (
            <TestExecutionSection
              node={node}
              isExecuting={isExecutingTest}
              onExecute={handleExecuteTest}
              response={testResponse}
              statusCode={testStatus}
              latency={testLatency}
              onCopyResponse={copyTestOutput}
              copied={copiedPayload}
            />
          )}
        </div>

        {/* ── Drawer Footer ─────────────────────────────────────────────────── */}
        <div className="p-3.5 border-t border-white/[0.08] bg-[#141419] flex items-center justify-between text-xs text-zinc-400 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Auto-synced to canvas</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 font-medium transition text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Parameters Section Router
// ─────────────────────────────────────────────────────────────────────────────
interface ParametersSectionProps {
  node: CanvasNode;
  onUpdateData: (nodeId: string, patch: any) => void;
  selectedPipelineImage?: WorkflowImageItem | null;
}

const ParametersSection: React.FC<ParametersSectionProps> = ({
  node,
  onUpdateData,
  selectedPipelineImage,
}) => {
  switch (node.type) {
    case "http-request":
      return <HttpParamsEditor node={node} onUpdateData={onUpdateData} />;
    case "webhook":
      return <WebhookParamsEditor node={node} onUpdateData={onUpdateData} />;
    case "image-asset":
      return <ImageParamsEditor node={node} onUpdateData={onUpdateData} />;
    case "ai-image-generator":
      return <AiImageGenParamsEditor node={node} onUpdateData={onUpdateData} />;
    case "ai-text-generator":
      return <AiTextGenParamsEditor node={node} onUpdateData={onUpdateData} />;
    case "if-condition":
      return <IfParamsEditor node={node} onUpdateData={onUpdateData} />;
    case "for-loop":
      return <ForParamsEditor node={node} onUpdateData={onUpdateData} />;
    case "code-javascript":
      return <CodeParamsEditor node={node} onUpdateData={onUpdateData} />;
    case "set-fields":
      return <SetFieldsParamsEditor node={node} onUpdateData={onUpdateData} />;
    case "delay-wait":
      return <DelayParamsEditor node={node} onUpdateData={onUpdateData} />;
    case "debug-print":
      return <PrintLogParamsEditor node={node} onUpdateData={onUpdateData} />;
    case "social-instagram":
    case "social-x":
    case "social-facebook":
    case "social-linkedin":
    case "social-youtube":
    case "social-tiktok":
      return <SocialAccountParamsEditor node={node} onUpdateData={onUpdateData} selectedPipelineImage={selectedPipelineImage} />;
    case "socials-aggregator":
      return <SocialsAggregatorParamsEditor node={node} onUpdateData={onUpdateData} selectedPipelineImage={selectedPipelineImage} />;
    default:
      return <div className="text-xs text-zinc-500">No specific parameters for this node type.</div>;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. HTTP Request Parameters Editor
// ─────────────────────────────────────────────────────────────────────────────
const HttpParamsEditor: React.FC<{
  node: CanvasNode;
  onUpdateData: (nodeId: string, patch: Partial<HttpNodeData>) => void;
}> = ({ node, onUpdateData }) => {
  const data = node.data as HttpNodeData;
  const methods: HttpNodeData["method"][] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

  const setMethod = (method: HttpNodeData["method"]) => onUpdateData(node.id, { method });
  const setUrl = (url: string) => onUpdateData(node.id, { url });

  const addHeader = () => onUpdateData(node.id, { headers: [...data.headers, { key: "", value: "" }] });
  const removeHeader = (idx: number) => onUpdateData(node.id, { headers: data.headers.filter((_, i) => i !== idx) });
  const updateHeader = (idx: number, field: "key" | "value", val: string) => {
    const next = [...data.headers];
    next[idx] = { ...next[idx], [field]: val };
    onUpdateData(node.id, { headers: next });
  };

  const addParam = () => onUpdateData(node.id, { queryParams: [...data.queryParams, { key: "", value: "" }] });
  const removeParam = (idx: number) => onUpdateData(node.id, { queryParams: data.queryParams.filter((_, i) => i !== idx) });
  const updateParam = (idx: number, field: "key" | "value", val: string) => {
    const next = [...data.queryParams];
    next[idx] = { ...next[idx], [field]: val };
    onUpdateData(node.id, { queryParams: next });
  };

  return (
    <div className="space-y-5">
      {/* Method selector */}
      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-2">HTTP Method</label>
        <div className="flex gap-1.5 flex-wrap">
          {methods.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition ${
                data.method === m
                  ? m === "GET"
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                    : m === "POST"
                    ? "bg-blue-500/20 border-blue-500 text-blue-300"
                    : m === "PUT"
                    ? "bg-amber-500/20 border-amber-500 text-amber-300"
                    : "bg-red-500/20 border-red-500 text-red-300"
                  : "bg-[#181820] border-white/[0.08] text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* URL input */}
      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Endpoint URL</label>
        <input
          type="text"
          value={data.url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.yourdomain.com/v1/resource"
          className="w-full bg-[#181820] border border-white/[0.09] focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition"
        />
      </div>

      {/* Headers table */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-zinc-300">Request Headers ({data.headers.length})</label>
          <button
            type="button"
            onClick={addHeader}
            className="flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300 transition"
          >
            <Plus className="w-3 h-3" />
            <span>Add Header</span>
          </button>
        </div>
        <div className="space-y-2">
          {data.headers.map((h, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={h.key}
                onChange={(e) => updateHeader(i, "key", e.target.value)}
                placeholder="Header Name (e.g. Authorization)"
                className="w-1/2 bg-[#181820] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
              <input
                type="text"
                value={h.value}
                onChange={(e) => updateHeader(i, "value", e.target.value)}
                placeholder="Value"
                className="w-1/2 bg-[#181820] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeHeader(i)}
                className="p-1.5 text-zinc-500 hover:text-red-400 rounded transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {data.headers.length === 0 && (
            <div className="p-3 rounded-lg border border-dashed border-white/[0.08] text-center text-xs text-zinc-500">
              No custom headers configured.
            </div>
          )}
        </div>
      </div>

      {/* Query Params table */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-zinc-300">Query Parameters ({data.queryParams.length})</label>
          <button
            type="button"
            onClick={addParam}
            className="flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300 transition"
          >
            <Plus className="w-3 h-3" />
            <span>Add Param</span>
          </button>
        </div>
        <div className="space-y-2">
          {data.queryParams.map((p, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={p.key}
                onChange={(e) => updateParam(i, "key", e.target.value)}
                placeholder="Key (e.g. limit)"
                className="w-1/2 bg-[#181820] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
              <input
                type="text"
                value={p.value}
                onChange={(e) => updateParam(i, "value", e.target.value)}
                placeholder="Value (e.g. 10)"
                className="w-1/2 bg-[#181820] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeParam(i)}
                className="p-1.5 text-zinc-500 hover:text-red-400 rounded transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {data.queryParams.length === 0 && (
            <div className="p-3 rounded-lg border border-dashed border-white/[0.08] text-center text-xs text-zinc-500">
              No query parameters configured.
            </div>
          )}
        </div>
      </div>

      {/* Request Body (for POST/PUT/PATCH) */}
      {["POST", "PUT", "PATCH"].includes(data.method) && (
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Request Body (JSON)</label>
          <textarea
            value={data.body}
            onChange={(e) => onUpdateData(node.id, { body: e.target.value })}
            rows={5}
            placeholder={`{\n  "key": "value"\n}`}
            className="w-full bg-[#181820] font-mono text-xs border border-white/[0.09] focus:border-orange-500 rounded-xl p-3 text-emerald-300 placeholder:text-zinc-600 focus:outline-none leading-relaxed"
          />
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Webhook / JSON Transform Parameters Editor
// ─────────────────────────────────────────────────────────────────────────────
const WebhookParamsEditor: React.FC<{
  node: CanvasNode;
  onUpdateData: (nodeId: string, patch: Partial<WebhookNodeData>) => void;
}> = ({ node, onUpdateData }) => {
  const data = node.data as WebhookNodeData;
  const isTransform = data.mode === "transform";
  const [copiedUrl, setCopiedUrl] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(data.webhookUrl);
    setCopiedUrl(true);
    toast.success("Webhook URL copied!");
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const addMapping = () => onUpdateData(node.id, { mappings: [...data.mappings, { from: "", to: "" }] });
  const removeMapping = (i: number) => onUpdateData(node.id, { mappings: data.mappings.filter((_, idx) => idx !== i) });
  const setMapping = (i: number, field: "from" | "to", val: string) => {
    const next = [...data.mappings];
    next[i] = { ...next[i], [field]: val };
    onUpdateData(node.id, { mappings: next });
  };

  return (
    <div className="space-y-5">
      {/* Mode Switcher */}
      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-2">Node Mode</label>
        <div className="grid grid-cols-2 gap-2 bg-[#181820] p-1 rounded-xl border border-white/[0.08]">
          <button
            type="button"
            onClick={() => onUpdateData(node.id, { mode: "trigger" })}
            className={`py-2 text-xs font-medium rounded-lg transition ${
              !isTransform ? "bg-purple-600 text-white shadow-md" : "text-zinc-400 hover:text-white"
            }`}
          >
            Webhook Trigger
          </button>
          <button
            type="button"
            onClick={() => onUpdateData(node.id, { mode: "transform" })}
            className={`py-2 text-xs font-medium rounded-lg transition ${
              isTransform ? "bg-purple-600 text-white shadow-md" : "text-zinc-400 hover:text-white"
            }`}
          >
            JSON Transform
          </button>
        </div>
      </div>

      {!isTransform ? (
        <>
          {/* Webhook Endpoint */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Webhook Inbound URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={data.webhookUrl}
                className="w-full bg-[#181820] font-mono text-xs border border-white/[0.09] rounded-xl px-3 py-2 text-zinc-300 select-all"
              />
              <button
                type="button"
                onClick={copyUrl}
                className="px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 flex items-center justify-center transition"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Send POST requests with a JSON payload to this endpoint.</p>
          </div>

          {/* Event Filter */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Event Filter / Topic</label>
            <input
              type="text"
              value={data.eventFilter}
              onChange={(e) => onUpdateData(node.id, { eventFilter: e.target.value })}
              placeholder="e.g. nova.image.ready or github.push"
              className="w-full bg-[#181820] border border-white/[0.09] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </>
      ) : (
        <>
          {/* JSONPath Mappings */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-300">Field Mappings</label>
              <button
                type="button"
                onClick={addMapping}
                className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 transition"
              >
                <Plus className="w-3 h-3" />
                <span>Add Mapping</span>
              </button>
            </div>
            <div className="space-y-2">
              {data.mappings.map((m, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={m.from}
                    onChange={(e) => setMapping(i, "from", e.target.value)}
                    placeholder="Source $.field"
                    className="w-1/2 bg-[#181820] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                  <span className="text-zinc-600 text-xs">→</span>
                  <input
                    type="text"
                    value={m.to}
                    onChange={(e) => setMapping(i, "to", e.target.value)}
                    placeholder="Target field"
                    className="w-1/2 bg-[#181820] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeMapping(i)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Image Library Parameters Editor
// ─────────────────────────────────────────────────────────────────────────────
const ImageParamsEditor: React.FC<{
  node: CanvasNode;
  onUpdateData: (nodeId: string, patch: Partial<ImageAssetNodeData>) => void;
}> = ({ node, onUpdateData }) => {
  const data = node.data as ImageAssetNodeData;
  const { data: userHistory, isLoading } = useGetUserHistoryQuery();
  const [searchQuery, setSearchQuery] = useState("");

  const allImages = useMemo(() => {
    const rawImages = userHistory?.images || (userHistory as any)?.history || [];
    if (!rawImages.length) return DEMO_IMAGES;

    const historyItems: WorkflowImageItem[] = rawImages
      .map((img: any, idx: number) => {
        const url =
          img.r2Url ||
          img.displayUrl ||
          img.watermarkedR2Url ||
          img.url ||
          img.imageUrl ||
          "";
        if (!url) return null;
        return {
          id: img.id || img._id || `img-${idx}`,
          url,
          prompt: img.prompt || "Generative AI Artwork",
          createdAt: img.createdAt ? new Date(img.createdAt).toLocaleDateString() : "Recent",
          aspectRatio: img.aspectRatio || "1:1",
          model: img.model || "Flux.1 Pro",
        };
      })
      .filter(Boolean) as WorkflowImageItem[];

    return historyItems.length > 0 ? historyItems : DEMO_IMAGES;
  }, [userHistory]);

  const filteredImages = useMemo(() => {
    if (!searchQuery.trim()) return allImages;
    return allImages.filter((img) => img.prompt.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allImages, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Currently Selected Preview */}
      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-2">Active Image Payload</label>
        {data.selectedImage && data.selectedImage.url ? (
          <div className="p-3 rounded-xl bg-[#181820] border border-cyan-500/40 flex gap-3 items-center">
            <img
              src={data.selectedImage.url}
              alt={data.selectedImage.prompt || "Selected Image"}
              className="w-16 h-16 rounded-lg object-cover border border-white/[0.1] flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEMO_IMAGES[0].url;
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-white truncate">{data.selectedImage.prompt}</div>
              <div className="flex gap-2 mt-1.5 text-[10px] font-mono text-cyan-400">
                <span>{data.selectedImage.aspectRatio}</span>
                <span>•</span>
                <span>{data.selectedImage.model || "AI Model"}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateData(node.id, { selectedImage: null })}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition"
              title="Deselect image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-dashed border-white/[0.1] text-center text-xs text-zinc-500">
            No image currently selected. Choose one from the library below.
          </div>
        )}
      </div>

      {/* Gallery Selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-zinc-300">Choose from Asset Library</label>
          <a
            href="/library"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition"
          >
            <span>Open Library</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search prompts…"
          className="w-full bg-[#181820] border border-white/[0.08] focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none mb-3"
        />

        <div className="grid grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
          {filteredImages.map((img) => {
            const isSelected = data.selectedImage?.id === img.id;
            const imgSrc = img.url || DEMO_IMAGES[0].url;
            return (
              <div
                key={img.id}
                onClick={() => onUpdateData(node.id, { selectedImage: img })}
                className={`group relative rounded-xl overflow-hidden cursor-pointer border transition-all duration-150 aspect-square ${
                  isSelected
                    ? "border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg scale-95"
                    : "border-white/[0.08] hover:border-white/[0.25]"
                }`}
              >
                <img
                  src={imgSrc}
                  alt={img.prompt || "AI Artwork"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEMO_IMAGES[0].url;
                  }}
                />
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-zinc-950 shadow">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex items-end">
                  <span className="text-[10px] text-white line-clamp-2">{img.prompt}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Standalone Social Account Parameters Editor
// ─────────────────────────────────────────────────────────────────────────────
const SocialAccountParamsEditor: React.FC<{
  node: CanvasNode;
  onUpdateData: (nodeId: string, patch: Partial<SocialAccountNodeData>) => void;
  selectedPipelineImage?: WorkflowImageItem | null;
}> = ({ node, onUpdateData, selectedPipelineImage }) => {
  const data = node.data as SocialAccountNodeData;
  const { data: accountsData } = useGetSocialAccountsQuery();
  const connectedAccount = accountsData?.accounts?.find(
    (a) => a.platform.toLowerCase() === data.platform.toLowerCase()
  );

  const charLimits: Record<PlatformId, number> = {
    instagram: 2200,
    x: 280,
    facebook: 2200,
    linkedin: 3000,
    youtube: 5000,
    tiktok: 2200,
  };

  const limit = charLimits[data.platform] || 2200;
  const charsLeft = limit - (data.caption?.length || 0);

  return (
    <div className="space-y-5">
      {/* Account Connection Status */}
      <div className="p-3.5 rounded-xl bg-[#181820] border border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
            {connectedAccount ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <div>
            <div className="text-xs font-semibold text-white">
              {connectedAccount ? connectedAccount.accountUsername || connectedAccount.accountName || "Account Connected" : "Account Disconnected"}
            </div>
            <div className="text-[10px] text-zinc-500">
              {connectedAccount ? "Ready to publish via API" : "Link your profile in Social Settings"}
            </div>
          </div>
        </div>
        {!connectedAccount && (
          <a
            href="/social"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1"
          >
            <span>Connect</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Caption Editor */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-zinc-300">Post Caption</label>
          <span
            className={`text-[11px] font-mono ${
              charsLeft < 0 ? "text-red-400 font-bold" : "text-zinc-500"
            }`}
          >
            {charsLeft} chars remaining
          </span>
        </div>
        <textarea
          value={data.caption}
          onChange={(e) => onUpdateData(node.id, { caption: e.target.value })}
          rows={4}
          placeholder="Write your post caption here… include #hashtags"
          className="w-full bg-[#181820] border border-white/[0.09] focus:border-orange-500 rounded-xl p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none leading-relaxed"
        />
      </div>

      {/* Media payload indicator */}
      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Media Attachment</label>
        {selectedPipelineImage ? (
          <div className="p-2.5 rounded-xl bg-[#181820] border border-emerald-500/30 flex items-center gap-2.5">
            <img
              src={selectedPipelineImage.url}
              alt="Connected media"
              className="w-10 h-10 rounded-lg object-cover border border-white/[0.1]"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-zinc-200 truncate">{selectedPipelineImage.prompt}</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" />
                <span>Media wired from Image Library</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 text-xs text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>No image connected. Connect an Image Library node wire to this node's Media In port.</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. Multi-Channel Aggregator Parameters Editor
// ─────────────────────────────────────────────────────────────────────────────
const SocialsAggregatorParamsEditor: React.FC<{
  node: CanvasNode;
  onUpdateData: (nodeId: string, patch: Partial<SocialsAggregatorData>) => void;
  selectedPipelineImage?: WorkflowImageItem | null;
}> = ({ node, onUpdateData, selectedPipelineImage }) => {
  const data = node.data as SocialsAggregatorData;

  const toggleTarget = (platform: "instagram" | "x" | "facebook") => {
    onUpdateData(node.id, {
      targets: {
        ...data.targets,
        [platform]: !data.targets[platform],
      },
    });
  };

  return (
    <div className="space-y-5">
      {/* Target Platforms Checkboxes */}
      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-2">Target Broadcast Channels</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "instagram" as const, label: "Instagram", icon: FaInstagram, color: "text-pink-400" },
            { id: "x" as const, label: "X (Twitter)", icon: FaXTwitter, color: "text-white" },
            { id: "facebook" as const, label: "Facebook", icon: FaFacebookF, color: "text-blue-400" },
          ].map((item) => {
            const isChecked = !!data.targets[item.id];
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleTarget(item.id)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                  isChecked
                    ? "bg-pink-500/15 border-pink-500/50 text-white"
                    : "bg-[#181820] border-white/[0.08] text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Icon className={`w-5 h-5 ${isChecked ? item.color : ""}`} />
                <span className="text-[11px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Broadcast Caption */}
      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Broadcast Caption</label>
        <textarea
          value={data.caption}
          onChange={(e) => onUpdateData(node.id, { caption: e.target.value })}
          rows={4}
          placeholder="Multi-platform broadcast text…"
          className="w-full bg-[#181820] border border-white/[0.09] focus:border-pink-500 rounded-xl p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none leading-relaxed"
        />
      </div>

      {/* Media preview */}
      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Image Asset</label>
        {selectedPipelineImage ? (
          <div className="p-2.5 rounded-xl bg-[#181820] border border-emerald-500/30 flex items-center gap-2.5">
            <img
              src={selectedPipelineImage.url}
              alt="Connected media"
              className="w-10 h-10 rounded-lg object-cover border border-white/[0.1]"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-zinc-200 truncate">{selectedPipelineImage.prompt}</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" />
                <span>Ready to fan-out to selected channels</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl border border-dashed border-zinc-700 text-xs text-zinc-500 text-center">
            Connect an Image Library node to attach artwork.
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. AI Image Generator Parameters Editor
// ─────────────────────────────────────────────────────────────────────────────
const AiImageGenParamsEditor: React.FC<{
  node: CanvasNode;
  onUpdateData: (nodeId: string, patch: Partial<AiImageGenNodeData>) => void;
}> = ({ node, onUpdateData }) => {
  const data = node.data as AiImageGenNodeData;
  const [generateImageApi, { isLoading: isGenerating }] = useGenerateImageMutation();
  const serverImageModels = useAppSelector((state) => state.models.imageModels);

  const availableImageModels = useMemo(() => {
    if (!serverImageModels || Object.keys(serverImageModels).length === 0) {
      return AI_IMAGE_MODELS;
    }
    const merged: Record<string, AiModelMeta> = { ...AI_IMAGE_MODELS };
    Object.entries(serverImageModels).forEach(([key, model]: [string, any]) => {
      const existing = merged[key];
      merged[key] = {
        name: model.name,
        price: model.price ?? existing?.price ?? 10,
        provider: model.provider ?? existing?.provider ?? "fal",
        badge: existing?.badge ?? model.badge,
        category: existing?.category ?? "FLUX Series",
        description: model.description ?? existing?.description ?? "",
      };
    });
    return merged;
  }, [serverImageModels]);

  const aspectRatios = ["1:1", "16:9", "9:16", "4:3"];
  const stylePresets = ["photorealistic", "cinematic", "anime", "digital-art", "cyberpunk"];

  const handleGenerateDirect = async () => {
    const promptToUse = data.prompt?.trim() || "Cyberpunk iridescent android portrait, volumetric neon lighting";
    const modelToUse = data.model || "Flux Schnell";
    const toastId = toast.loading(`Synthesizing artwork with ${modelToUse} via Fal AI…`);
    try {
      const res = await generateImageApi({
        prompt: promptToUse,
        negativePrompt: data.negativePrompt,
        style: data.stylePreset,
        aspectRatio: data.aspectRatio || "1:1",
        model: modelToUse,
      }).unwrap();

      const realUrl = res.url || res.image?.r2Url || res.image?.watermarkedR2Url;
      const generatedImg: WorkflowImageItem = {
        id: res.image?.id || `gen-${Date.now()}`,
        url: realUrl,
        prompt: promptToUse,
        model: modelToUse,
        aspectRatio: data.aspectRatio || "1:1",
        createdAt: "Just now",
      };
      onUpdateData(node.id, { generatedImage: generatedImg });
      toast.success("Artwork rendered & saved to storage!", { id: toastId });
    } catch (err: any) {
      const msg = err?.data?.error || err?.message || "Failed to generate image";
      toast.error(msg, { id: toastId });
    }
  };

  return (
    <div className="space-y-5">
      {/* Dynamic input notice */}
      <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/30 text-xs text-pink-300 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-white">Prompt Input Handle: </span>
          You can drag a wire from an upstream node (HTTP Request, Webhook, Code, etc.) to this node's <span className="font-mono text-pink-200 font-bold">Prompt In</span> port, or set a static prompt below.
        </div>
      </div>

      {/* Prompt Textarea */}
      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Default Prompt</label>
        <textarea
          value={data.prompt}
          onChange={(e) => onUpdateData(node.id, { prompt: e.target.value })}
          rows={3}
          placeholder="Describe the image you want to generate in rich detail…"
          className="w-full bg-[#181820] border border-white/[0.09] focus:border-pink-500 rounded-xl p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none leading-relaxed"
        />
      </div>

      {/* Model Dropdown */}
      <ModelSelectDropdown
        value={data.model || "Flux Schnell"}
        onChange={(m) => onUpdateData(node.id, { model: m })}
        models={availableImageModels}
        themeColor="pink"
        label="AI Image Generation Model (Fal AI)"
      />

      {/* Aspect Ratio & Style */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Aspect Ratio</label>
          <div className="grid grid-cols-2 gap-1.5">
            {aspectRatios.map((ar) => (
              <button
                key={ar}
                type="button"
                onClick={() => onUpdateData(node.id, { aspectRatio: ar })}
                className={`py-1.5 text-xs font-mono rounded-lg border transition ${
                  data.aspectRatio === ar
                    ? "bg-pink-500/20 border-pink-500 text-pink-300"
                    : "bg-[#181820] border-white/[0.08] text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {ar}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Style Preset</label>
          <select
            value={data.stylePreset || "photorealistic"}
            onChange={(e) => onUpdateData(node.id, { stylePreset: e.target.value })}
            className="w-full bg-[#181820] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 capitalize"
          >
            {stylePresets.map((s) => (
              <option key={s} value={s} className="bg-[#181820] text-white capitalize">
                {s.replace("-", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Negative Prompt */}
      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Negative Prompt (Optional)</label>
        <input
          type="text"
          value={data.negativePrompt || ""}
          onChange={(e) => onUpdateData(node.id, { negativePrompt: e.target.value })}
          placeholder="blurry, distorted, low quality, watermarks…"
          className="w-full bg-[#181820] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500"
        />
      </div>

      {/* Generated Image Output Preview */}
      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Active Image Output</label>
        {data.generatedImage?.url ? (
          <div className="p-2.5 rounded-xl bg-[#181820] border border-pink-500/40 flex items-center gap-3">
            <img
              src={data.generatedImage.url}
              alt="Generated"
              className="w-14 h-14 rounded-lg object-cover border border-white/[0.1]"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-white truncate">{data.generatedImage.prompt}</div>
              <div className="text-[10px] text-pink-400 font-mono mt-0.5">
                {data.generatedImage.aspectRatio} · Ready for downstream ports
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl border border-dashed border-white/[0.08] text-center text-xs text-zinc-500">
            No artwork generated yet. Click below to generate now.
          </div>
        )}

        <button
          type="button"
          disabled={isGenerating}
          onClick={handleGenerateDirect}
          className="w-full mt-3 py-2.5 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-400 hover:to-violet-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 disabled:opacity-50 transition cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Synthesizing with Fal AI & R2…</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Artwork Now</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 6b. AI Text Generator Parameters Editor
// ─────────────────────────────────────────────────────────────────────────────
const AiTextGenParamsEditor: React.FC<{
  node: CanvasNode;
  onUpdateData: (nodeId: string, patch: Partial<AiTextGenNodeData>) => void;
}> = ({ node, onUpdateData }) => {
  const data = node.data as AiTextGenNodeData;
  const [generateTextApi, { isLoading: isGenerating }] = useGenerateTextMutation();
  const serverChatModels = useAppSelector((state) => state.models.chatModels);

  const availableChatModels = useMemo(() => {
    if (!serverChatModels || Object.keys(serverChatModels).length === 0) {
      return AI_CHAT_MODELS;
    }
    const merged: Record<string, AiModelMeta> = { ...AI_CHAT_MODELS };
    Object.entries(serverChatModels).forEach(([key, model]: [string, any]) => {
      const existing = merged[key];
      const modelNameLower = `${key} ${model.name || ""}`.toLowerCase();
      let category = existing?.category;
      if (!category) {
        if (modelNameLower.includes("nemotron")) category = "Nvidia Nemotron";
        else if (modelNameLower.includes("ling")) category = "InclusionAI Ling";
        else if (modelNameLower.includes("laguna") || modelNameLower.includes("cohere")) category = "Poolside & Cohere";
        else if (modelNameLower.includes("gemma")) category = "Google Gemma";
        else if (modelNameLower.includes("qwen")) category = "Qwen";
        else if (modelNameLower.includes("inkling") || modelNameLower.includes("dots")) category = "Thinking Machines & Dots";
        else if (modelNameLower.includes("nex")) category = "Nex AGI";
        else if (modelNameLower.includes("lfm") || modelNameLower.includes("liquid")) category = "LiquidAI";
        else if (modelNameLower.includes("gpt") || modelNameLower.includes("llama")) category = "OpenAI & Meta";
        else category = "General";
      }
      merged[key] = {
        name: model.name,
        price: model.price ?? existing?.price ?? 10,
        provider: model.provider ?? existing?.provider ?? "openrouter",
        badge: existing?.badge ?? (model.name?.includes(":free") ? "Free" : undefined),
        category,
        description: model.description ?? existing?.description ?? "",
        maxTokens: model.maxTokens ?? existing?.maxTokens,
      };
    });
    return merged;
  }, [serverChatModels]);

  const activeModelName = useMemo(() => {
    if (data.model && availableChatModels[data.model]) return data.model;
    return "NVIDIA Nemotron 3.5 Lightning";
  }, [data.model, availableChatModels]);

  const handleGenerateDirect = async () => {
    const promptToUse = data.prompt?.trim() || "Write a viral social media caption with trending hashtags";
    const modelToUse = activeModelName;
    const jsonConstraint = "The output should be in JSON format and there should only be alphanumeric characters and emojis, no special characters.";
    const systemInstructions = data.systemPrompt
      ? `${data.systemPrompt}\n${jsonConstraint}`
      : jsonConstraint;
    const fullPrompt = `[System Instructions: ${systemInstructions}]\n\nUser Request: ${promptToUse}`;

    const toastId = toast.loading(`Synthesizing text with ${modelToUse}…`);
    try {
      const res = await generateTextApi({
        prompt: fullPrompt,
        model: modelToUse,
      }).unwrap();

      onUpdateData(node.id, { generatedText: res.text, isGenerating: false });
      toast.success("Text generated successfully!", { id: toastId });
    } catch (err: any) {
      const msg = err?.data?.error || err?.message || "Failed to generate text";
      toast.error(msg, { id: toastId });
    }
  };

  return (
    <div className="space-y-5">
      {/* Dynamic input notice */}
      <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/30 text-xs text-violet-300 flex items-start gap-2.5">
        <Bot className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-white">Prompt Input Handle: </span>
          You can drag a wire from an upstream node (HTTP Request, Webhook, Code, etc.) to this node's <span className="font-mono text-violet-200 font-bold">Prompt In</span> port, or set a static prompt below.
        </div>
      </div>

      {/* Prompt Textarea */}
      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">User Prompt</label>
        <textarea
          value={data.prompt}
          onChange={(e) => onUpdateData(node.id, { prompt: e.target.value })}
          rows={3}
          placeholder="Enter prompt instructions for the LLM (e.g. Write a viral caption for an art post)…"
          className="w-full bg-[#181820] border border-white/[0.09] focus:border-violet-500 rounded-xl p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none leading-relaxed"
        />
      </div>

      {/* System Prompt */}
      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">System Prompt / Persona (Optional)</label>
        <textarea
          value={data.systemPrompt || ""}
          onChange={(e) => onUpdateData(node.id, { systemPrompt: e.target.value })}
          rows={2}
          placeholder="You are a professional copywriter. The output should be in JSON format and there should only be alphanumeric characters and emojis, no special characters…"
          className="w-full bg-[#181820] border border-white/[0.09] focus:border-violet-500 rounded-xl p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none leading-relaxed"
        />
      </div>

      {/* Model Dropdown */}
      <ModelSelectDropdown
        value={activeModelName}
        onChange={(m) => onUpdateData(node.id, { model: m })}
        models={availableChatModels}
        themeColor="violet"
        label="AI Language Model (OpenRouter)"
      />

      {/* Generated Text Output Preview */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-zinc-300">Active Text Output</label>
          {data.generatedText && (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(data.generatedText || "");
                toast.success("Text copied to clipboard");
              }}
              className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </button>
          )}
        </div>
        {data.generatedText ? (
          <div className="p-3 rounded-xl bg-[#181820] border border-violet-500/40 text-xs text-zinc-200 leading-relaxed font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
            {data.generatedText}
          </div>
        ) : (
          <div className="p-3.5 rounded-xl border border-dashed border-white/[0.08] text-center text-xs text-zinc-500">
            No text generated yet. Click below to generate now.
          </div>
        )}

        <button
          type="button"
          disabled={isGenerating}
          onClick={handleGenerateDirect}
          className="w-full mt-3 py-2.5 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 disabled:opacity-50 transition cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Generating with AI LLM…</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Text Now</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. If (Condition) Parameters Editor
// ─────────────────────────────────────────────────────────────────────────────
const IfParamsEditor: React.FC<{
  node: CanvasNode;
  onUpdateData: (nodeId: string, patch: Partial<IfNodeData>) => void;
}> = ({ node, onUpdateData }) => {
  const data = node.data as IfNodeData;
  const condition = data.condition || { field: "status", operator: "equals", value: "success" };

  const updateCondition = (patch: Partial<IfCondition>) => {
    onUpdateData(node.id, { condition: { ...condition, ...patch } });
  };

  const operators = [
    { value: "equals", label: "Equals (==)" },
    { value: "not_equals", label: "Not Equals (!=)" },
    { value: "contains", label: "Contains text" },
    { value: "greater_than", label: "Greater than (>)" },
    { value: "less_than", label: "Less than (<)" },
    { value: "is_empty", label: "Is Empty / Null" },
    { value: "is_not_empty", label: "Is Not Empty" },
  ];

  return (
    <div className="space-y-5">
      {/* Branch visual diagram */}
      <div className="p-3.5 rounded-xl bg-[#181820] border border-white/[0.08] space-y-2">
        <div className="text-xs font-semibold text-white flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-emerald-400" />
          <span>Conditional Routing Branches</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            <div className="font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>True Output</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">Routes payload when condition is met.</p>
          </div>
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
            <div className="font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span>False Output</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">Routes payload when condition fails.</p>
          </div>
        </div>
      </div>

      {/* Field Input */}
      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Field / Variable Path</label>
        <input
          type="text"
          value={condition.field}
          onChange={(e) => updateCondition({ field: e.target.value })}
          placeholder="e.g. status or data.ok or statusCode"
          className="w-full bg-[#181820] border border-white/[0.09] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition font-mono"
        />
      </div>

      {/* Operator Selector */}
      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Comparison Operator</label>
        <select
          value={condition.operator}
          onChange={(e) => updateCondition({ operator: e.target.value as any })}
          className="w-full bg-[#181820] border border-white/[0.09] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
        >
          {operators.map((op) => (
            <option key={op.value} value={op.value} className="bg-[#181820] text-white">
              {op.label}
            </option>
          ))}
        </select>
      </div>

      {/* Compare Value */}
      {!["is_empty", "is_not_empty"].includes(condition.operator) && (
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Compare Value</label>
          <input
            type="text"
            value={condition.value}
            onChange={(e) => updateCondition({ value: e.target.value })}
            placeholder="Value to compare against"
            className="w-full bg-[#181820] border border-white/[0.09] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition"
          />
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. For (Loop) Parameters Editor
// ─────────────────────────────────────────────────────────────────────────────
const ForParamsEditor: React.FC<{
  node: CanvasNode;
  onUpdateData: (nodeId: string, patch: Partial<ForNodeData>) => void;
}> = ({ node, onUpdateData }) => {
  const data = node.data as ForNodeData;

  return (
    <div className="space-y-5">
      {/* Explanatory Diagram */}
      <div className="p-3.5 rounded-xl bg-[#181820] border border-white/[0.08] space-y-2">
        <div className="text-xs font-semibold text-white flex items-center gap-2">
          <Repeat className="w-4 h-4 text-blue-400" />
          <span>Batch & Loop Output Flow</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300">
            <div className="font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Loop Item</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">Iterates downstream for each item/batch.</p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            <div className="font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Done</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">Triggers when all items finish.</p>
          </div>
        </div>
      </div>

      {/* Field Path */}
      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Array Field Path</label>
        <input
          type="text"
          value={data.fieldPath}
          onChange={(e) => onUpdateData(node.id, { fieldPath: e.target.value })}
          placeholder="e.g. items, results, or data.records"
          className="w-full bg-[#181820] border border-white/[0.09] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition font-mono"
        />
      </div>

      {/* Batch Size */}
      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Batch Size</label>
        <input
          type="number"
          min={1}
          max={100}
          value={data.batchSize || 1}
          onChange={(e) => onUpdateData(node.id, { batchSize: Math.max(1, parseInt(e.target.value) || 1) })}
          className="w-full bg-[#181820] border border-white/[0.09] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition"
        />
        <p className="text-[11px] text-zinc-500 mt-1">Number of items emitted per iteration loop.</p>
      </div>

      {/* Max Iterations */}
      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Max Iterations Limit</label>
        <input
          type="number"
          min={1}
          max={1000}
          value={data.maxIterations || 10}
          onChange={(e) => onUpdateData(node.id, { maxIterations: Math.max(1, parseInt(e.target.value) || 1) })}
          className="w-full bg-[#181820] border border-white/[0.09] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition"
        />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. Code (JavaScript) Parameters Editor
// ─────────────────────────────────────────────────────────────────────────────
const CodeParamsEditor: React.FC<{
  node: CanvasNode;
  onUpdateData: (nodeId: string, patch: Partial<CodeNodeData>) => void;
}> = ({ node, onUpdateData }) => {
  const data = node.data as CodeNodeData;

  const defaultSnippet = `// Incoming payload is available as "data"\nreturn {\n  ...data,\n  transformed: true,\n  processedAt: new Date().toISOString()\n};`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-zinc-300">JavaScript Transform Code</label>
        <button
          type="button"
          onClick={() => onUpdateData(node.id, { code: defaultSnippet })}
          className="text-[11px] text-amber-400 hover:text-amber-300 transition"
        >
          Reset to Template
        </button>
      </div>

      <p className="text-[11px] text-zinc-400 leading-relaxed">
        Write JavaScript function logic. The incoming node payload is exposed as <code className="text-amber-300 font-mono">data</code>. Return the transformed object.
      </p>

      <textarea
        value={data.code}
        onChange={(e) => onUpdateData(node.id, { code: e.target.value })}
        rows={10}
        className="w-full bg-[#0c0c10] font-mono text-xs border border-white/[0.09] focus:border-amber-500 rounded-xl p-3.5 text-amber-300 focus:outline-none leading-relaxed select-text"
        placeholder={defaultSnippet}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 10. Set (Edit Fields) Parameters Editor
// ─────────────────────────────────────────────────────────────────────────────
const SetFieldsParamsEditor: React.FC<{
  node: CanvasNode;
  onUpdateData: (nodeId: string, patch: Partial<SetFieldsNodeData>) => void;
}> = ({ node, onUpdateData }) => {
  const data = node.data as SetFieldsNodeData;
  const fields = data.fields || [];

  const addField = () => {
    onUpdateData(node.id, {
      fields: [...fields, { key: "", value: "", type: "string" }],
    });
  };

  const removeField = (i: number) => {
    onUpdateData(node.id, {
      fields: fields.filter((_, idx) => idx !== i),
    });
  };

  const updateField = (i: number, patch: Partial<SetFieldItem>) => {
    const next = [...fields];
    next[i] = { ...next[i], ...patch };
    onUpdateData(node.id, { fields: next });
  };

  return (
    <div className="space-y-5">
      {/* Mode Switcher */}
      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-2">Payload Mode</label>
        <div className="grid grid-cols-2 gap-2 bg-[#181820] p-1 rounded-xl border border-white/[0.08]">
          <button
            type="button"
            onClick={() => onUpdateData(node.id, { mode: "append" })}
            className={`py-2 text-xs font-medium rounded-lg transition ${
              data.mode !== "replace" ? "bg-purple-600 text-white shadow" : "text-zinc-400 hover:text-white"
            }`}
          >
            Append to Payload
          </button>
          <button
            type="button"
            onClick={() => onUpdateData(node.id, { mode: "replace" })}
            className={`py-2 text-xs font-medium rounded-lg transition ${
              data.mode === "replace" ? "bg-purple-600 text-white shadow" : "text-zinc-400 hover:text-white"
            }`}
          >
            Replace Payload
          </button>
        </div>
      </div>

      {/* Fields list */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-zinc-300">Fields ({fields.length})</label>
          <button
            type="button"
            onClick={addField}
            className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 transition"
          >
            <Plus className="w-3 h-3" />
            <span>Add Field</span>
          </button>
        </div>

        <div className="space-y-2">
          {fields.map((f, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={f.key}
                onChange={(e) => updateField(i, { key: e.target.value })}
                placeholder="Field name"
                className="w-2/5 bg-[#181820] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
              <input
                type="text"
                value={f.value}
                onChange={(e) => updateField(i, { value: e.target.value })}
                placeholder="Value"
                className="w-2/5 bg-[#181820] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
              <select
                value={f.type}
                onChange={(e) => updateField(i, { type: e.target.value as any })}
                className="w-1/5 bg-[#181820] border border-white/[0.08] rounded-lg px-1 py-1.5 text-xs text-zinc-300 focus:outline-none"
              >
                <option value="string">str</option>
                <option value="number">num</option>
                <option value="boolean">bool</option>
              </select>
              <button
                type="button"
                onClick={() => removeField(i)}
                className="p-1.5 text-zinc-500 hover:text-red-400 rounded transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {fields.length === 0 && (
            <div className="p-3.5 rounded-xl border border-dashed border-white/[0.08] text-center text-xs text-zinc-500">
              No fields configured. Click "Add Field" above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 11. Delay / Wait Parameters Editor
// ─────────────────────────────────────────────────────────────────────────────
const DelayParamsEditor: React.FC<{
  node: CanvasNode;
  onUpdateData: (nodeId: string, patch: Partial<DelayNodeData>) => void;
}> = ({ node, onUpdateData }) => {
  const data = node.data as DelayNodeData;

  return (
    <div className="space-y-5">
      <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 flex items-start gap-2.5">
        <Hourglass className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          The pipeline will pause at this node for the configured duration before delivering the payload downstream.
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Wait Duration</label>
          <input
            type="number"
            min={1}
            max={3600}
            value={data.duration || 3}
            onChange={(e) => onUpdateData(node.id, { duration: Math.max(1, parseInt(e.target.value) || 1) })}
            className="w-full bg-[#181820] border border-white/[0.09] focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Unit</label>
          <select
            value={data.unit || "seconds"}
            onChange={(e) => onUpdateData(node.id, { unit: e.target.value as any })}
            className="w-full bg-[#181820] border border-white/[0.09] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="seconds">Seconds</option>
            <option value="minutes">Minutes</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 12. Print / Debug Parameters Editor
// ─────────────────────────────────────────────────────────────────────────────
const PrintLogParamsEditor: React.FC<{
  node: CanvasNode;
  onUpdateData: (nodeId: string, patch: Partial<PrintLogNodeData>) => void;
}> = ({ node, onUpdateData }) => {
  const data = node.data as PrintLogNodeData;
  const logLevels: Array<"info" | "data" | "success"> = ["info", "data", "success"];
  const formats: Array<"json" | "string"> = ["json", "string"];

  return (
    <div className="space-y-5">
      <div className="p-3 rounded-xl bg-slate-500/10 border border-slate-500/30 text-xs text-slate-300 flex items-start gap-2.5">
        <Terminal className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-white">Debug & Inspection: </span>
          This node inspects incoming data, prints it into the execution log console, and passes it forward unchanged to downstream nodes.
        </div>
      </div>

      {/* Label / Prefix */}
      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Console Log Label</label>
        <input
          type="text"
          value={data.label || ""}
          onChange={(e) => onUpdateData(node.id, { label: e.target.value })}
          placeholder="e.g. Inspect Payload, API Response, Image Data…"
          className="w-full bg-[#181820] border border-white/[0.08] focus:border-slate-400 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
        />
      </div>

      {/* Log Level */}
      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Log Level</label>
        <div className="grid grid-cols-3 gap-2">
          {logLevels.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => onUpdateData(node.id, { logLevel: lvl })}
              className={`py-2 text-xs font-mono capitalize rounded-xl border transition ${
                (data.logLevel || "info") === lvl
                  ? "bg-slate-500/20 border-slate-400 text-slate-200"
                  : "bg-[#181820] border-white/[0.08] text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Output Format */}
      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Print Format</label>
        <div className="grid grid-cols-2 gap-2">
          {formats.map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => onUpdateData(node.id, { format: fmt })}
              className={`py-2 text-xs font-mono uppercase rounded-xl border transition ${
                (data.format || "json") === fmt
                  ? "bg-slate-500/20 border-slate-400 text-slate-200"
                  : "bg-[#181820] border-white/[0.08] text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {fmt === "json" ? "Pretty JSON" : "Raw Text"}
            </button>
          ))}
        </div>
      </div>

      {/* Last Captured Payload */}
      {data.lastPrintedData && (
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Last Captured Payload</label>
          <pre className="p-3 rounded-xl bg-[#101014] border border-white/[0.08] text-[11px] font-mono text-zinc-300 max-h-40 overflow-auto">
            {typeof data.lastPrintedData === "string"
              ? data.lastPrintedData
              : JSON.stringify(data.lastPrintedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Test / Execution Tab Component
// ─────────────────────────────────────────────────────────────────────────────
interface TestExecutionSectionProps {
  node: CanvasNode;
  isExecuting: boolean;
  onExecute: () => void;
  response: string | null;
  statusCode: number | null;
  latency: number | null;
  onCopyResponse: () => void;
  copied: boolean;
}

const TestExecutionSection: React.FC<TestExecutionSectionProps> = ({
  node,
  isExecuting,
  onExecute,
  response,
  statusCode,
  latency,
  onCopyResponse,
  copied,
}) => {
  return (
    <div className="space-y-5">
      {/* Test Execution Trigger Card */}
      <div className="p-4 rounded-xl bg-[#181820] border border-white/[0.08] flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-white">Interactive Node Test</div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            Test this isolated node with its current parameters.
          </div>
        </div>

        <button
          type="button"
          onClick={onExecute}
          disabled={isExecuting}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          {isExecuting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Executing…</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Execute Node</span>
            </>
          )}
        </button>
      </div>

      {/* Output Response Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-300">Execution Output JSON</span>
            {statusCode && (
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  statusCode < 300
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-red-500/20 text-red-300 border border-red-500/30"
                }`}
              >
                {statusCode} {statusCode === 200 ? "OK" : "ERROR"}
              </span>
            )}
            {latency && (
              <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{latency}ms</span>
              </span>
            )}
          </div>

          {response && (
            <button
              type="button"
              onClick={onCopyResponse}
              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied" : "Copy JSON"}</span>
            </button>
          )}
        </div>

        {response ? (
          <pre className="p-4 rounded-xl bg-[#0E0E12] border border-white/[0.08] font-mono text-[11px] text-emerald-400/90 overflow-x-auto max-h-[360px] leading-relaxed select-all">
            {response}
          </pre>
        ) : (
          <div className="p-8 rounded-xl border border-dashed border-white/[0.08] text-center text-xs text-zinc-500 space-y-1">
            <Code2 className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
            <div>No execution output yet.</div>
            <div className="text-[11px] text-zinc-600">Click "Execute Node" above to run a live test.</div>
          </div>
        )}
      </div>
    </div>
  );
};
