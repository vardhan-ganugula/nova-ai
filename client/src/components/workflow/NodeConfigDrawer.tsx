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
  SocialAccountNodeData,
  SocialsAggregatorData,
  WorkflowImageItem,
  PlatformId,
} from "./types";
import { NODE_REGISTRY } from "./nodeRegistry";
import { useGetUserHistoryQuery } from "@/store/authSlice";
import { useGetSocialAccountsQuery } from "@/store/socialSlice";
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
      case "webhook":
        return <Webhook className="w-5 h-5 text-purple-400" />;
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
