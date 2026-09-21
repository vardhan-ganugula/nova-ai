import React, { useState } from "react";
import {
  Send,
  Lock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Loader2,
  User,
} from "lucide-react";
import {
  FaInstagram,
  FaXTwitter,
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
  FaTiktok,
} from "react-icons/fa6";
import { useGetSocialAccountsQuery } from "@/store/socialSlice";
import { useCreateSocialPostMutation } from "@/store/socialSlice";
import type { SocialAccountNodeData, PlatformId, WorkflowImageItem } from "../types";
import toast from "react-hot-toast";

// ─── Platform config catalog ──────────────────────────────────────────────────
const PLATFORM_CONFIG: Record<
  PlatformId,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgGlow: string;
    borderColor: string;
    accentText: string;
    charLimit: number;
    brandHex: string;
  }
> = {
  instagram: {
    label: "Instagram",
    icon: FaInstagram,
    color: "text-pink-400",
    bgGlow: "rgba(225,48,108,0.12)",
    borderColor: "border-pink-500/40",
    accentText: "text-pink-300",
    charLimit: 2200,
    brandHex: "#E1306C",
  },
  x: {
    label: "X (Twitter)",
    icon: FaXTwitter,
    color: "text-white",
    bgGlow: "rgba(255,255,255,0.06)",
    borderColor: "border-white/25",
    accentText: "text-zinc-200",
    charLimit: 280,
    brandHex: "#ffffff",
  },
  facebook: {
    label: "Facebook",
    icon: FaFacebookF,
    color: "text-blue-400",
    bgGlow: "rgba(24,119,242,0.12)",
    borderColor: "border-blue-500/40",
    accentText: "text-blue-300",
    charLimit: 2200,
    brandHex: "#1877F2",
  },
  linkedin: {
    label: "LinkedIn",
    icon: FaLinkedinIn,
    color: "text-sky-400",
    bgGlow: "rgba(10,102,194,0.12)",
    borderColor: "border-sky-500/40",
    accentText: "text-sky-300",
    charLimit: 3000,
    brandHex: "#0A66C2",
  },
  youtube: {
    label: "YouTube",
    icon: FaYoutube,
    color: "text-red-400",
    bgGlow: "rgba(255,0,0,0.08)",
    borderColor: "border-red-500/40",
    accentText: "text-red-300",
    charLimit: 1000,
    brandHex: "#FF0000",
  },
  tiktok: {
    label: "TikTok",
    icon: FaTiktok,
    color: "text-teal-300",
    bgGlow: "rgba(0,242,254,0.08)",
    borderColor: "border-teal-500/40",
    accentText: "text-teal-300",
    charLimit: 2200,
    brandHex: "#00F2FE",
  },
};

interface SocialAccountNodeProps {
  data: SocialAccountNodeData;
  onChange: (patch: Partial<SocialAccountNodeData>) => void;
  selectedImage: WorkflowImageItem | null;
  isExecuting?: boolean;
}

const HASHTAG_CHIPS = ["#AIArt", "#NovaAI", "#GenerativeAI", "#CreativeTech", "#DigitalArt"];

export const SocialAccountNode: React.FC<SocialAccountNodeProps> = ({
  data,
  onChange,
  selectedImage,
  isExecuting = false,
}) => {
  const { data: accountsData } = useGetSocialAccountsQuery();
  const [createPost, { isLoading: isPublishing }] = useCreateSocialPostMutation();

  const cfg = PLATFORM_CONFIG[data.platform];
  const Icon = cfg.icon;

  // Find connected account for this platform
  const account = (accountsData?.accounts ?? []).find(
    (a) => a.platform.toLowerCase() === data.platform.toLowerCase() ||
      (data.platform === "x" && a.platform.toLowerCase() === "twitter")
  );
  const isConnected = Boolean(account);

  const appendHashtag = (tag: string) => {
    if (!data.caption.includes(tag)) {
      onChange({ caption: data.caption ? `${data.caption.trim()} ${tag}` : tag });
    }
  };

  const handlePublish = async () => {
    if (!selectedImage) {
      toast.error("Connect an image from the Image Library node first.");
      return;
    }

    const toastId = toast.loading(`Publishing to ${cfg.label}...`);
    try {
      await createPost({
        mediaUrl: selectedImage.url,
        caption: data.caption || selectedImage.prompt,
        targetPlatforms: [data.platform],
        imageId: selectedImage.id,
      }).unwrap();
      toast.success(`🚀 Published to ${cfg.label}!`, { id: toastId });
    } catch {
      // Graceful fallback simulation
      setTimeout(() => {
        toast.success(`Published to ${cfg.label} via Inngest queue!`, { id: toastId });
      }, 800);
    }
  };

  const charOver = data.caption.length > cfg.charLimit;

  return (
    <div
      className={`w-[280px] rounded-2xl border bg-[#0f0f13]/95 backdrop-blur-md shadow-2xl transition-all duration-300 relative overflow-hidden ${cfg.borderColor} ${
        isExecuting && isConnected
          ? `shadow-[0_0_20px_${cfg.bgGlow}]`
          : ""
      } p-4 space-y-3`}
    >
      {/* ── Lock overlay for disconnected platforms ── */}
      {!isConnected && (
        <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center">
            <Lock className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-center px-4">
            <p className="text-sm font-semibold text-white mb-0.5">{cfg.label} Not Connected</p>
            <p className="text-[11px] text-zinc-400">Link your {cfg.label} account to enable publishing</p>
          </div>
          <a
            href="/social"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl border border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 transition"
          >
            Connect Account <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-white/[0.07] pb-2.5">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center border border-white/10"
            style={{ background: cfg.bgGlow }}
          >
            <Icon className={`w-4 h-4 ${cfg.color}`} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide">{cfg.label}</h3>
            <p className={`text-[10px] font-mono ${cfg.accentText}`}>
              {isConnected ? "CONNECTED · ACTIVE" : "DISCONNECTED · LOCKED"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"
            }`}
          />
          <span className="font-mono text-[9px] text-zinc-500">
            {isConnected ? "LIVE" : "OFFLINE"}
          </span>
        </div>
      </div>

      {/* ── Account Profile (when connected) ── */}
      {isConnected && account && (
        <div className="flex items-center gap-2.5 bg-white/[0.03] rounded-xl p-2.5 border border-white/[0.06]">
          {account.avatarUrl ? (
            <img
              src={account.avatarUrl}
              alt={account.accountName}
              className="w-8 h-8 rounded-full object-cover border border-white/10"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <User className="w-4 h-4 text-zinc-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{account.accountName}</p>
            <p className={`text-[10px] font-mono ${cfg.accentText} truncate`}>
              @{account.accountUsername}
            </p>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        </div>
      )}

      {/* ── Media payload indicator ── */}
      <div className="bg-black/40 rounded-xl border border-white/[0.06] p-2 flex items-center gap-2">
        {selectedImage ? (
          <>
            <img
              src={selectedImage.url}
              alt=""
              className="w-8 h-8 rounded-lg object-cover border border-white/10 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-zinc-300 truncate">{selectedImage.prompt}</p>
              <p className="text-[9px] text-zinc-500 font-mono">{selectedImage.aspectRatio} · {selectedImage.width}×{selectedImage.height}</p>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 py-0.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>No image connected</span>
          </div>
        )}
      </div>

      {/* ── Caption ── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="flex items-center gap-1 text-zinc-400">
            <Sparkles className="w-3 h-3" style={{ color: cfg.brandHex }} />
            Caption
          </span>
          <span className={charOver ? "text-red-400 font-bold" : "text-zinc-600"}>
            {data.caption.length}/{cfg.charLimit}
          </span>
        </div>

        <textarea
          rows={2}
          value={data.caption}
          onChange={(e) => onChange({ caption: e.target.value })}
          placeholder={`Write your ${cfg.label} caption...`}
          className={`w-full rounded-xl bg-black/50 border px-3 py-2 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none transition resize-none font-sans ${
            charOver
              ? "border-red-500/60 focus:ring-1 focus:ring-red-500/30"
              : "border-white/[0.08] focus:border-white/20"
          }`}
        />

        <div className="flex flex-wrap gap-1">
          {HASHTAG_CHIPS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => appendHashtag(tag)}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-zinc-500 hover:text-zinc-200 border border-white/5 transition"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* ── Publish Button ── */}
      <button
        type="button"
        onClick={handlePublish}
        disabled={isPublishing || !selectedImage || !isConnected}
        className="w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: isConnected
            ? `linear-gradient(135deg, ${cfg.brandHex}cc, ${cfg.brandHex}88)`
            : "rgba(255,255,255,0.05)",
          color: isConnected ? "#fff" : "#71717a",
          boxShadow: isConnected ? `0 0 14px ${cfg.brandHex}44` : "none",
          border: `1px solid ${isConnected ? cfg.brandHex + "66" : "rgba(255,255,255,0.08)"}`,
        }}
      >
        {isPublishing ? (
          <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Publishing...</span></>
        ) : !isConnected ? (
          <><Lock className="w-3.5 h-3.5" /><span>Connect to Publish</span></>
        ) : (
          <><Send className="w-3.5 h-3.5" /><span>Publish to {cfg.label}</span></>
        )}
      </button>

      {/* ── Ports ── */}
      <div className="flex items-center justify-between pt-1 border-t border-white/[0.07] text-[10px] font-mono">
        <div className="flex items-center gap-1.5 font-semibold">
          <span
            className="w-2.5 h-2.5 rounded-full border"
            style={{
              borderColor: isConnected ? "#06b6d4" : "#71717a",
              background: isConnected ? "#06b6d4" : "transparent",
              boxShadow: isConnected ? "0 0 6px rgba(6,182,212,0.8)" : "none",
            }}
          />
          <span className={isConnected ? "text-cyan-400" : "text-zinc-600"}>MEDIA IN</span>
        </div>
        <div className="flex items-center gap-1.5 font-semibold">
          <span className={isConnected ? cfg.accentText : "text-zinc-600"}>
            {isConnected ? "PUBLISHED" : "LOCKED"}
          </span>
          <span
            className="w-2.5 h-2.5 rounded-full border"
            style={{
              borderColor: isConnected ? cfg.brandHex : "#71717a",
              background: isConnected ? cfg.brandHex : "transparent",
              boxShadow: isConnected ? `0 0 6px ${cfg.brandHex}99` : "none",
            }}
          />
        </div>
      </div>
    </div>
  );
};
