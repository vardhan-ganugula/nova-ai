import React from "react";
import {
  X,
  Copy,
  Download,
  Sparkles,
  Layers,
  Sliders,
  Ratio,
  ShieldCheck,
  Zap,
  Globe,
  Lock,
  Wand2,
} from "lucide-react";
import toast from "react-hot-toast";

interface ImageDetailModalProps {
  image: string;
  prompt: string;
  negativePrompt?: string;
  model?: string;
  aspectRatio?: string;
  guidanceScale?: number;
  samplingSteps?: number;
  seed?: string;
  sampler?: string;
  isPublic?: boolean;
  onClose: () => void;
  onApplySettings?: () => void;
  onToggleVisibility?: () => void;
}

export const ImageDetailModal: React.FC<ImageDetailModalProps> = ({
  image,
  prompt,
  negativePrompt,
  model = "flux-1-pro",
  aspectRatio = "16:9",
  guidanceScale = 7.5,
  samplingSteps = 30,
  seed = "-1",
  sampler = "DPM++ 2M Karras",
  isPublic = true,
  onClose,
  onApplySettings,
  onToggleVisibility,
}) => {
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied to clipboard!");
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = image;
    link.download = `vimitron-artwork-${Date.now()}.png`;
    link.target = "_blank";
    link.click();
    toast.success("Downloading master render...");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-[#101014] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 rounded-lg bg-black/60 hover:bg-white/10 p-2 text-zinc-400 hover:text-white transition-all"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Left: Artwork Viewport */}
        <div className="relative flex-1 bg-black flex items-center justify-center p-4 min-h-[360px] overflow-hidden">
          <img
            src={image}
            alt={prompt}
            className="max-h-[82vh] w-auto max-w-full object-contain rounded-lg"
          />

          {/* Watermark badge */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-md bg-black/80 px-2.5 py-1 border border-white/15 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-300">
            <Zap className="h-3 w-3 text-orange-400 fill-orange-400" />
            <span>VIMITRON • 8K RESOLUTION</span>
          </div>
        </div>

        {/* Right: Technical Parameters Inspector */}
        <div className="w-full md:w-96 p-6 flex flex-col justify-between space-y-4 bg-[#0c0c0e] border-t md:border-t-0 md:border-l border-white/[0.08] overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded font-semibold">
                  GENERATION METADATA
                </span>
              </div>
              <span className="font-mono text-[10px] text-zinc-400">{model}</span>
            </div>

            {/* Prompt */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-zinc-400 mb-1">
                <span>Prompt</span>
                <button
                  onClick={handleCopyPrompt}
                  className="text-orange-400 hover:text-orange-300 flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" /> Copy
                </button>
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed bg-[#121215] p-3 rounded-lg border border-white/5 font-sans select-text">
                "{prompt}"
              </p>
            </div>

            {/* Negative Prompt */}
            {negativePrompt && (
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                  Negative Prompt
                </span>
                <p className="text-xs text-zinc-400 leading-relaxed bg-[#121215] p-2.5 rounded-lg border border-white/5 font-sans select-text">
                  {negativePrompt}
                </p>
              </div>
            )}

            {/* Parameter Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                <span className="text-[10px] font-mono text-zinc-500 block">
                  ASPECT RATIO
                </span>
                <span className="font-mono font-medium text-zinc-200">
                  {aspectRatio}
                </span>
              </div>

              <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                <span className="text-[10px] font-mono text-zinc-500 block">
                  GUIDANCE (CFG)
                </span>
                <span className="font-mono font-medium text-zinc-200">
                  {guidanceScale}
                </span>
              </div>

              <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                <span className="text-[10px] font-mono text-zinc-500 block">
                  STEPS
                </span>
                <span className="font-mono font-medium text-zinc-200">
                  {samplingSteps}
                </span>
              </div>

              <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                <span className="text-[10px] font-mono text-zinc-500 block">
                  SEED
                </span>
                <span className="font-mono font-medium text-zinc-200 truncate block">
                  {seed}
                </span>
              </div>
            </div>

            {/* Sampler Algorithm */}
            <div className="p-2 rounded bg-white/[0.02] border border-white/5">
              <span className="text-[10px] font-mono text-zinc-500 block">
                SAMPLER ALGORITHM
              </span>
              <span className="font-mono font-medium text-zinc-200 text-xs">
                {sampler}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-3 border-t border-white/[0.08]">
            {onApplySettings && (
              <button
                onClick={() => {
                  onApplySettings();
                  onClose();
                  toast.success("Applied settings to Generation Studio!");
                }}
                className="w-full py-2 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-black font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(249,115,22,0.25)]"
              >
                <Wand2 className="h-3.5 w-3.5" />
                <span>Use These Settings in Studio</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex-1 py-2 px-3 rounded-lg bg-white/[0.06] hover:bg-white/10 text-zinc-200 font-medium text-xs transition flex items-center justify-center gap-1.5 border border-white/10"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </button>

              {onToggleVisibility && (
                <button
                  onClick={onToggleVisibility}
                  className={`py-2 px-3 rounded-lg font-medium text-xs transition flex items-center justify-center gap-1.5 border ${
                    isPublic
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                      : "bg-white/[0.06] text-zinc-300 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {isPublic ? (
                    <>
                      <Globe className="h-3.5 w-3.5" />
                      <span>Public</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5" />
                      <span>Private</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
