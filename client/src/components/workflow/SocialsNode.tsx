import React from "react";
import {
  Share2,
  Check,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Hash,
  Sliders,
  ExternalLink,
} from "lucide-react";
import { FaInstagram, FaXTwitter, FaFacebookF } from "react-icons/fa6";
import { useGetSocialAccountsQuery } from "@/store/socialSlice";
import type { SocialTargetState, WorkflowImageItem } from "./types";

interface SocialsNodeProps {
  selectedImage: WorkflowImageItem | null;
  targets: SocialTargetState;
  onToggleTarget: (platform: keyof SocialTargetState) => void;
  caption: string;
  onChangeCaption: (val: string) => void;
  onPublish: () => void;
  isPublishing: boolean;
}

export const SocialsNode: React.FC<SocialsNodeProps> = ({
  selectedImage,
  targets,
  onToggleTarget,
  caption,
  onChangeCaption,
  onPublish,
  isPublishing,
}) => {
  const { data: accountsData } = useGetSocialAccountsQuery();
  const connectedAccounts = accountsData?.accounts || [];

  const getAccountFor = (platformKey: string) => {
    return connectedAccounts.find(
      (a) => a.platform.toLowerCase() === platformKey.toLowerCase()
    );
  };

  const platformsConfig = [
    {
      id: "instagram" as const,
      name: "Instagram",
      icon: FaInstagram,
      color: "text-pink-400",
      activeBg: "bg-pink-500/15 border-pink-500/40 text-pink-300",
      glowColor: "rgba(225,48,108,0.3)",
      charLimit: 2200,
      account: getAccountFor("instagram"),
    },
    {
      id: "x" as const,
      name: "X (Twitter)",
      icon: FaXTwitter,
      color: "text-white",
      activeBg: "bg-white/15 border-white/40 text-white",
      glowColor: "rgba(255,255,255,0.2)",
      charLimit: 280,
      account: getAccountFor("x") || getAccountFor("twitter"),
    },
    {
      id: "facebook" as const,
      name: "Facebook",
      icon: FaFacebookF,
      color: "text-blue-400",
      activeBg: "bg-blue-500/15 border-blue-500/40 text-blue-300",
      glowColor: "rgba(24,119,242,0.3)",
      charLimit: 2200,
      account: getAccountFor("facebook"),
    },
  ];

  const activeCount = Object.values(targets).filter(Boolean).length;

  const handleAppendHashtags = (tag: string) => {
    if (!caption.includes(tag)) {
      onChangeCaption(caption ? `${caption.trim()} ${tag}` : tag);
    }
  };

  return (
    <div
      className={`w-96 rounded-2xl border bg-[#121215]/95 backdrop-blur-md shadow-2xl transition-all duration-300 ${
        isPublishing
          ? "border-pink-500 shadow-[0_0_25px_rgba(236,72,153,0.3)] ring-1 ring-pink-500/40"
          : "border-pink-500/40 hover:border-pink-500/70 hover:shadow-pink-500/10"
      } p-4 space-y-3.5 relative select-none`}
    >
      {/* Ports Top Header Indicator */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <Share2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide">
              Socials Node
            </h3>
            <p className="text-[10px] text-pink-400/80 font-mono">
              MULTI-CHANNEL PUBLISHER
            </p>
          </div>
        </div>
        <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 font-semibold border border-pink-500/20">
          {activeCount} TARGET{activeCount !== 1 ? "S" : ""} READY
        </span>
      </div>

      {/* Target Platforms Selection (Insta, X, Facebook) */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
          Select Distribution Channels
        </label>
        <div className="grid grid-cols-3 gap-2">
          {platformsConfig.map((p) => {
            const isSelected = targets[p.id];
            const isConnected = Boolean(p.account);
            const Icon = p.icon;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onToggleTarget(p.id)}
                className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? `${p.activeBg} shadow-md`
                    : "bg-white/[0.02] border-white/10 text-zinc-400 hover:border-white/25 hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className={`w-3.5 h-3.5 ${p.color}`} />
                  <span className="text-xs font-semibold">{p.name}</span>
                </div>

                <div className="flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isConnected ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"
                    }`}
                  />
                  <span className="text-[9px] font-mono text-zinc-400 truncate max-w-[70px]">
                    {isConnected ? `@${p.account?.accountUsername || "ready"}` : "ready"}
                  </span>
                </div>

                {isSelected && (
                  <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-pink-500 text-black flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Caption & Metadata Editor */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-pink-400" />
            Social Post Caption
          </span>
          <span
            className={`${
              targets.x && caption.length > 280
                ? "text-red-400 font-bold"
                : "text-zinc-500"
            }`}
          >
            {caption.length} {targets.x ? "/ 280 (X limit)" : "chars"}
          </span>
        </div>

        <textarea
          rows={3}
          value={caption}
          onChange={(e) => onChangeCaption(e.target.value)}
          placeholder="Write compelling social copy or let it sync with image prompt..."
          className="w-full rounded-xl bg-black/50 border border-white/10 px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-pink-500/70 focus:ring-1 focus:ring-pink-500/30 transition resize-none font-sans"
        />

        {/* Quick Hashtag Chips */}
        <div className="flex flex-wrap gap-1 pt-0.5">
          {["#AIArt", "#NovaAI", "#GenerativeAI", "#CreativeTech"].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleAppendHashtags(tag)}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-pink-300 border border-white/5 transition"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Image Reference Ribbon */}
      <div className="bg-[#09090b] p-2 rounded-xl border border-white/5 flex items-center gap-2.5">
        {selectedImage ? (
          <>
            <img
              src={selectedImage.url}
              alt=""
              className="w-9 h-9 rounded-lg object-cover border border-white/10"
            />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-zinc-300 truncate font-medium">
                {selectedImage.prompt}
              </div>
              <div className="text-[9px] text-zinc-500 font-mono flex items-center gap-2">
                <span>Linked Payload</span>
                <span>{selectedImage.aspectRatio || "1:1"}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1.5 py-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Connect image node to supply media</span>
          </div>
        )}
      </div>

      {/* Embedded Action Button inside the Node */}
      <button
        type="button"
        onClick={onPublish}
        disabled={isPublishing || !selectedImage || activeCount === 0}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(236,72,153,0.3)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        {isPublishing ? (
          <>
            <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <span>Broadcasting to {activeCount} Platform{activeCount !== 1 ? "s" : ""}...</span>
          </>
        ) : (
          <>
            <Send className="w-3.5 h-3.5" />
            <span>Publish to {activeCount} Social Channel{activeCount !== 1 ? "s" : ""}</span>
          </>
        )}
      </button>

      {/* Ports Interface */}
      <div className="flex items-center justify-between pt-1 border-t border-white/[0.08] text-[10px] font-mono">
        <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
          <span className="w-2.5 h-2.5 rounded-full border border-cyan-400 bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
          <span>MEDIA IN</span>
        </div>
        <div className="flex items-center gap-1.5 text-pink-400 font-semibold">
          <span>WEBHOOK / API</span>
          <span className="w-2.5 h-2.5 rounded-full border border-pink-400 bg-pink-400 shadow-[0_0_6px_rgba(236,72,153,0.8)]" />
        </div>
      </div>
    </div>
  );
};
