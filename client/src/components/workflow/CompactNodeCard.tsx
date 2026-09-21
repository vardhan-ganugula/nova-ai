import React from "react";
import {
  Globe,
  ImageIcon,
  Webhook,
  Share2,
  SlidersHorizontal,
  Trash2,
  Sparkles,
  GitBranch,
  Repeat,
  Code2,
  Sliders,
  Hourglass,
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
  IfNodeData,
  ForNodeData,
  CodeNodeData,
  SetFieldsNodeData,
  DelayNodeData,
  SocialAccountNodeData,
  SocialsAggregatorData,
} from "./types";
import type { NodeStatus } from "./ExecutionEngine";
import { NODE_REGISTRY } from "./nodeRegistry";

interface CompactNodeCardProps {
  node: CanvasNode;
  status: NodeStatus;
  isSelected?: boolean;
  onOpenConfig: () => void;
  onDelete: () => void;
  onExecuteQuick?: () => void;
}

export const CompactNodeCard: React.FC<CompactNodeCardProps> = ({
  node,
  status,
  isSelected = false,
  onOpenConfig,
  onDelete,
}) => {
  const registry = NODE_REGISTRY[node.type];
  const title = node.label || registry?.label || node.type;

  // Category / Brand icon
  const renderIcon = () => {
    switch (node.type) {
      case "http-request":
        return <Globe className="w-4 h-4 text-orange-400" />;
      case "image-asset":
        return <ImageIcon className="w-4 h-4 text-cyan-400" />;
      case "ai-image-generator":
        return <Sparkles className="w-4 h-4 text-pink-400" />;
      case "webhook":
        return <Webhook className="w-4 h-4 text-purple-400" />;
      case "if-condition":
        return <GitBranch className="w-4 h-4 text-emerald-400" />;
      case "for-loop":
        return <Repeat className="w-4 h-4 text-blue-400" />;
      case "code-javascript":
        return <Code2 className="w-4 h-4 text-amber-400" />;
      case "set-fields":
        return <Sliders className="w-4 h-4 text-purple-400" />;
      case "delay-wait":
        return <Hourglass className="w-4 h-4 text-cyan-400" />;
      case "socials-aggregator":
        return <Share2 className="w-4 h-4 text-pink-400" />;
      case "social-instagram":
        return <FaInstagram className="w-4 h-4 text-pink-500" />;
      case "social-x":
        return <FaXTwitter className="w-3.5 h-3.5 text-zinc-100" />;
      case "social-facebook":
        return <FaFacebookF className="w-3.5 h-3.5 text-blue-500" />;
      case "social-linkedin":
        return <FaLinkedinIn className="w-3.5 h-3.5 text-sky-400" />;
      case "social-youtube":
        return <FaYoutube className="w-4 h-4 text-red-500" />;
      case "social-tiktok":
        return <FaTiktok className="w-3.5 h-3.5 text-teal-300" />;
      default:
        return <Globe className="w-4 h-4 text-zinc-400" />;
    }
  };

  // Subtitle / context badge
  const renderSubtext = () => {
    switch (node.type) {
      case "http-request": {
        const d = node.data as HttpNodeData;
        const methodColor =
          d.method === "GET"
            ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/30"
            : d.method === "POST"
            ? "text-blue-400 bg-blue-500/15 border-blue-500/30"
            : "text-amber-400 bg-amber-500/15 border-amber-500/30";
        let displayUrl = d.url;
        try {
          if (d.url.startsWith("http")) {
            const parsed = new URL(d.url);
            displayUrl = parsed.pathname || parsed.hostname;
          }
        } catch {}
        return (
          <div className="flex items-center gap-1.5 min-w-0 mt-0.5">
            <span
              className={`px-1 py-0.2 text-[9px] font-mono font-bold rounded border ${methodColor}`}
            >
              {d.method}
            </span>
            <span className="text-[11px] text-zinc-400 truncate max-w-[130px]" title={d.url || "/api/endpoint"}>
              {displayUrl || "/api/endpoint"}
            </span>
          </div>
        );
      }

      case "image-asset": {
        const d = node.data as ImageAssetNodeData;
        return (
          <div className="flex items-center gap-1.5 min-w-0 mt-0.5">
            {d.selectedImage?.url ? (
              <>
                <img
                  src={d.selectedImage.url}
                  alt={d.selectedImage.prompt || "Selected"}
                  className="w-3.5 h-3.5 rounded object-cover border border-cyan-500/40 flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <span className="text-[11px] text-zinc-300 truncate max-w-[135px]" title={d.selectedImage.prompt}>
                  {d.selectedImage.prompt || "1 image selected"}
                </span>
              </>
            ) : (
              <span className="text-[11px] text-zinc-500 italic">No image selected</span>
            )}
          </div>
        );
      }

      case "ai-image-generator": {
        const d = node.data as AiImageGenNodeData;
        return (
          <div className="flex items-center gap-1.5 min-w-0 mt-0.5">
            {d.generatedImage?.url ? (
              <img
                src={d.generatedImage.url}
                alt="Gen"
                className="w-4 h-4 rounded object-cover border border-pink-500/40 flex-shrink-0"
              />
            ) : null}
            <span className="px-1 py-0.2 text-[9px] font-mono font-medium rounded border border-pink-500/30 bg-pink-500/10 text-pink-300 flex-shrink-0">
              {d.model ? d.model.replace("Flux.1 Pro", "Flux").replace("Flux Schnell", "Schnell") : "Flux"}
            </span>
            <span className="text-[11px] text-zinc-300 truncate max-w-[120px]" title={d.prompt}>
              {d.prompt || "No prompt"}
            </span>
          </div>
        );
      }

      case "if-condition": {
        const d = node.data as IfNodeData;
        const opSym =
          d.condition?.operator === "equals"
            ? "=="
            : d.condition?.operator === "not_equals"
            ? "!="
            : d.condition?.operator || "==";
        return (
          <div className="flex items-center gap-1.5 min-w-0 mt-0.5">
            <span className="px-1 py-0.2 text-[9px] font-mono font-bold rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              IF
            </span>
            <span className="text-[11px] text-zinc-300 truncate max-w-[140px]" title={`${d.condition?.field} ${opSym} ${d.condition?.value}`}>
              {d.condition?.field || "val"} {opSym} {d.condition?.value || '""'}
            </span>
          </div>
        );
      }

      case "for-loop": {
        const d = node.data as ForNodeData;
        return (
          <div className="flex items-center gap-1.5 min-w-0 mt-0.5">
            <span className="px-1 py-0.2 text-[9px] font-mono font-bold rounded border border-blue-500/30 bg-blue-500/10 text-blue-300">
              LOOP
            </span>
            <span className="text-[11px] text-zinc-400 truncate max-w-[135px]">
              {d.fieldPath || "items"} (batch: {d.batchSize || 1})
            </span>
          </div>
        );
      }

      case "code-javascript": {
        return (
          <div className="flex items-center gap-1.5 min-w-0 mt-0.5">
            <span className="px-1 py-0.2 text-[9px] font-mono font-bold rounded border border-amber-500/30 bg-amber-500/10 text-amber-300">
              JS
            </span>
            <span className="text-[11px] text-zinc-400 truncate max-w-[140px]">
              Execute code
            </span>
          </div>
        );
      }

      case "set-fields": {
        const d = node.data as SetFieldsNodeData;
        const count = d.fields?.length || 0;
        return (
          <div className="flex items-center gap-1.5 min-w-0 mt-0.5">
            <span className="px-1 py-0.2 text-[9px] font-mono font-bold rounded border border-purple-500/30 bg-purple-500/10 text-purple-300">
              SET
            </span>
            <span className="text-[11px] text-zinc-400 truncate max-w-[140px]">
              {count} {count === 1 ? "field" : "fields"}
            </span>
          </div>
        );
      }

      case "delay-wait": {
        const d = node.data as DelayNodeData;
        return (
          <div className="flex items-center gap-1.5 min-w-0 mt-0.5">
            <span className="px-1 py-0.2 text-[9px] font-mono font-bold rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
              WAIT
            </span>
            <span className="text-[11px] text-zinc-400 truncate max-w-[140px]">
              {d.duration} {d.unit}
            </span>
          </div>
        );
      }

      case "webhook": {
        const d = node.data as WebhookNodeData;
        const isTransform = d.mode === "transform";
        return (
          <div className="flex items-center gap-1.5 min-w-0 mt-0.5">
            <span className="px-1 py-0.2 text-[9px] font-mono font-medium rounded border border-purple-500/30 bg-purple-500/10 text-purple-300">
              {isTransform ? "Transform" : "Trigger"}
            </span>
            <span className="text-[11px] text-zinc-400 truncate max-w-[120px]">
              {isTransform ? `${d.mappings?.length || 0} fields` : d.eventFilter || "nova.*"}
            </span>
          </div>
        );
      }

      case "socials-aggregator": {
        const d = node.data as SocialsAggregatorData;
        const count = Object.values(d.targets || {}).filter(Boolean).length;
        return (
          <div className="flex items-center gap-1.5 min-w-0 mt-0.5">
            <span className="px-1 py-0.2 text-[9px] font-mono font-medium rounded border border-pink-500/30 bg-pink-500/10 text-pink-300">
              {count} {count === 1 ? "channel" : "channels"}
            </span>
            <span className="text-[11px] text-zinc-400 truncate max-w-[120px]">
              {d.caption ? `"${d.caption.slice(0, 16)}…"` : "Multi-channel"}
            </span>
          </div>
        );
      }

      case "social-instagram":
      case "social-x":
      case "social-facebook":
      case "social-linkedin":
      case "social-youtube":
      case "social-tiktok": {
        const d = node.data as SocialAccountNodeData;
        return (
          <div className="flex items-center gap-1.5 min-w-0 mt-0.5">
            <span className="text-[11px] text-zinc-400 truncate max-w-[150px]">
              {d.caption ? `"${d.caption.slice(0, 18)}…"` : "Publish post"}
            </span>
          </div>
        );
      }

      default:
        return null;
    }
  };

  // Status indicator dot
  const renderStatusDot = () => {
    switch (status) {
      case "running":
        return (
          <div className="relative flex items-center justify-center flex-shrink-0" title="Running execution…">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping absolute opacity-75" />
            <span className="w-2 h-2 rounded-full bg-amber-400 relative" />
          </div>
        );
      case "success":
        return (
          <div className="flex items-center justify-center flex-shrink-0" title="Success">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
          </div>
        );
      case "error":
        return (
          <div className="flex items-center justify-center flex-shrink-0" title="Error">
            <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_#ef4444]" />
          </div>
        );
      case "idle":
      default:
        return (
          <div className="flex items-center justify-center flex-shrink-0" title="Idle">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
          </div>
        );
    }
  };

  return (
    <div
      onDoubleClick={(e) => {
        e.stopPropagation();
        onOpenConfig();
      }}
      className={`relative w-[240px] h-[64px] rounded-xl bg-[#1A1A22] border transition-all duration-200 select-none cursor-grab active:cursor-grabbing flex items-center px-3 gap-2.5 group/card shadow-lg ${
        isSelected
          ? "border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.25)] ring-1 ring-orange-500/50"
          : "border-white/[0.08] hover:border-white/[0.22] hover:bg-[#1E1E28]"
      }`}
      style={{
        boxShadow:
          status === "running"
            ? `0 0 20px ${registry?.accentColor || "#f97316"}50`
            : status === "success"
            ? "0 0 16px rgba(16,185,129,0.3)"
            : status === "error"
            ? "0 0 16px rgba(239,68,68,0.3)"
            : undefined,
      }}
    >
      {/* Category / Brand Icon Box */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border transition-transform group-hover/card:scale-105"
        style={{
          background: `${registry?.accentColor || "#71717a"}18`,
          borderColor: `${registry?.accentColor || "#71717a"}35`,
        }}
      >
        {renderIcon()}
      </div>

      {/* Center Title + Subtext */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="text-xs font-semibold text-zinc-100 truncate tracking-tight">
          {title}
        </div>
        {renderSubtext()}
      </div>

      {/* Right Side: Status Indicator Dot */}
      <div className="flex items-center justify-center flex-shrink-0 pl-1">
        {renderStatusDot()}
      </div>

      {/* Hover Action Buttons (top-right overlay) */}
      <div className="absolute -top-2.5 right-2 z-30 flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity duration-150">
        {/* Quick Configure Drawer Button */}
        <button
          type="button"
          title="Configure Node (Double-click)"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onOpenConfig();
          }}
          className="w-5 h-5 rounded-full bg-[#111116] border border-zinc-700 text-zinc-400 hover:text-white hover:border-orange-500/70 hover:bg-orange-500/20 flex items-center justify-center shadow transition"
        >
          <SlidersHorizontal className="w-2.5 h-2.5" />
        </button>

        {/* Quick Delete Button */}
        <button
          type="button"
          title="Delete Node"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="w-5 h-5 rounded-full bg-[#111116] border border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500/70 hover:bg-red-500/20 flex items-center justify-center shadow transition"
        >
          <Trash2 className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
};
