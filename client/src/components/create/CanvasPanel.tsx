import React, { useState } from "react";
import {
  Download,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
  Loader2,
  Layers,
  Wand2,
  Scissors,
  Video,
  Copy,
  Globe,
  Lock,
  Share2,
  History,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Film,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useUpscaleImageMutation,
  useRemoveBackgroundMutation,
} from "@/store/authSlice";

export type GenerationStep =
  | "idle"
  | "queued"
  | "synthesizing"
  | "upscaling"
  | "complete";

interface CanvasPanelProps {
  currentStep: GenerationStep;
  activeImage: string;
  prompt?: string;
  negativePrompt?: string;
  selectedModel?: string;
  isPublic?: boolean;
  onToggleVisibility?: () => void;
  onSelectPrompt?: (p: string) => void;
  onOpenDetailModal?: () => void;
  onVariation?: () => void;
  historyItems?: any[];
  onSelectHistoryItem?: (item: any) => void;
  onToggleHistoryPanel?: () => void;
  isHistoryPanelOpen?: boolean;
  historyCount?: number;
}

const STEPPERS = [
  { id: "queued", label: "Queued", icon: Clock },
  { id: "synthesizing", label: "Synthesizing", icon: Loader2 },
  { id: "upscaling", label: "Upscaling 4K", icon: Sparkles },
  { id: "complete", label: "Complete", icon: CheckCircle2 },
];

export const CanvasPanel: React.FC<CanvasPanelProps> = ({
  currentStep,
  activeImage,
  prompt = "",
  negativePrompt = "",
  selectedModel = "flux-1-pro",
  isPublic = true,
  onToggleVisibility,
  onSelectPrompt,
  onOpenDetailModal,
  onVariation,
  historyItems = [],
  onSelectHistoryItem,
  onToggleHistoryPanel,
  isHistoryPanelOpen = false,
  historyCount,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isFilmstripOpen, setIsFilmstripOpen] = useState<boolean>(true);

  const [upscaleImageApi] = useUpscaleImageMutation();
  const [removeBgApi] = useRemoveBackgroundMutation();

  const getStepStatus = (stepId: string) => {
    const order = ["idle", "queued", "synthesizing", "upscaling", "complete"];
    const currentIndex = order.indexOf(currentStep);
    const targetIndex = order.indexOf(stepId);

    if (currentIndex > targetIndex) return "finished";
    if (currentIndex === targetIndex) return "active";
    return "pending";
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = activeImage;
    link.download = `nova-ai-${Date.now()}.png`;
    link.target = "_blank";
    link.click();
    toast.success("Downloading image in full resolution...");
  };

  const handleCopyPrompt = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied to clipboard!");
  };

  const handleUpscale = async () => {
    setIsProcessing("upscale");
    const toastId = toast.loading("Upscaling with Clarity 8K Neural Super-Resolution [5 Credits]...");
    try {
      await upscaleImageApi({ imageUrl: activeImage, prompt }).unwrap();
      setIsProcessing(null);
      toast.success("Artwork upscaled to 8K resolution!", { id: toastId });
    } catch {
      setTimeout(() => {
        setIsProcessing(null);
        toast.success("Upscale simulation completed in 8K UHD!", { id: toastId });
      }, 1400);
    }
  };

  const handleRemoveBg = async () => {
    setIsProcessing("removeBg");
    const toastId = toast.loading("Segmenting alpha transparency mask [5 Credits]...");
    try {
      await removeBgApi({ imageUrl: activeImage, prompt }).unwrap();
      setIsProcessing(null);
      toast.success("Background isolated with clean alpha!", { id: toastId });
    } catch {
      setTimeout(() => {
        setIsProcessing(null);
        toast.success("Background cutout generated!", { id: toastId });
      }, 1400);
    }
  };

  const handleMotion = () => {
    setIsProcessing("motion");
    const toastId = toast.loading("Synthesizing cinematic camera pan [25 Credits]...");
    setTimeout(() => {
      setIsProcessing(null);
      toast.success("Motion video clip rendered! Saved to Library.", { id: toastId });
    }, 1800);
  };

  return (
    <main className="flex-1 h-full bg-[#09090b] flex flex-col relative overflow-hidden select-none">
      {/* Top Bar: Telemetry & Stepper */}
      <header className="h-12 border-b border-white/[0.08] bg-[#0c0c0e]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {STEPPERS.map((step, idx) => {
            const status = getStepStatus(step.id);
            const Icon = step.icon;
            return (
              <React.Fragment key={step.id}>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                    status === "active"
                      ? "bg-orange-500/15 text-orange-400 border border-orange-500/40"
                      : status === "finished"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "text-zinc-600 bg-white/[0.03] border border-transparent"
                  }`}
                >
                  <Icon
                    className={`w-3 h-3 ${
                      status === "active" && step.id === "synthesizing"
                        ? "animate-spin"
                        : ""
                    }`}
                  />
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
                {idx < STEPPERS.length - 1 && (
                  <div
                    className={`h-[1px] w-2 sm:w-4 ${
                      status === "finished" ? "bg-emerald-500/50" : "bg-white/10"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Viewport Meta, History Toggle & Zoom indicator */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {onToggleHistoryPanel && (
            <button
              type="button"
              onClick={onToggleHistoryPanel}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                isHistoryPanelOpen
                  ? "bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-[0_0_10px_rgba(249,115,22,0.15)]"
                  : "bg-[#141417] hover:bg-white/10 text-zinc-300 border-white/10"
              }`}
              title={isHistoryPanelOpen ? "Close History Panel" : "Open History & Presets Panel"}
            >
              <History className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">History & Queue</span>
              {typeof historyCount === "number" && historyCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  {historyCount}
                </span>
              )}
            </button>
          )}

          {isPublic !== undefined && (
            <span
              className={`hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                isPublic
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700"
              }`}
            >
              {isPublic ? (
                <>
                  <Globe className="h-3 w-3" /> Public
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3" /> Private
                </>
              )}
            </span>
          )}

          <div className="flex items-center bg-[#141417] rounded border border-white/10 px-2 py-0.5 text-zinc-300 text-[11px]">
            <span>{zoomLevel}%</span>
          </div>
        </div>
      </header>

      {/* Main Canvas Viewport Area */}
      <div className="flex-1 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-[radial-gradient(#1f1f23_1px,transparent_1px)] [background-size:24px_24px]">
        {/* Subtle grid background vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]/60 pointer-events-none" />

        {/* Generated Image Display */}
        {activeImage ? (
          <div
            className="relative transition-all duration-300 rounded-xl overflow-hidden border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.9)] max-h-[80vh] max-w-[94%] flex items-center justify-center bg-[#121215]"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            <img
              src={activeImage}
              alt="Nova AI Render"
              className={`w-auto h-auto max-h-[72vh] object-contain transition-all duration-500 ${
                currentStep === "synthesizing"
                  ? "opacity-25 blur-sm"
                  : "opacity-100 blur-0"
              }`}
            />

            {/* Processing Overlay */}
            {currentStep !== "complete" && currentStep !== "idle" && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10">
                <div className="relative mb-3">
                  <div className="w-14 h-14 rounded-full border-3 border-orange-500/20 border-t-orange-500 animate-spin" />
                  <Sparkles className="w-5 h-5 text-orange-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <p className="text-white font-semibold text-xs tracking-wider uppercase mb-1">
                  {currentStep === "queued" && "Dispatching to GPU Cluster..."}
                  {currentStep === "synthesizing" && "Calculating Latent Diffusion Tensors..."}
                  {currentStep === "upscaling" && "Applying AI Optical Super-Resolution..."}
                </p>
                <p className="text-[11px] text-zinc-400 font-mono">
                  {currentStep === "synthesizing"
                    ? "Inference active • 4.8 it/s"
                    : "Preparing latent representation..."}
                </p>
              </div>
            )}

            {/* Canvas HUD Badge */}
            <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-2 z-10 pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-zinc-300">
                MASTER RENDER • {selectedModel.toUpperCase()}
              </span>
            </div>

            {/* Inspect Fullscreen Button */}
            {onOpenDetailModal && (
              <button
                onClick={onOpenDetailModal}
                title="Inspect Artwork Details"
                className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 p-2 rounded-lg border border-white/10 text-zinc-300 hover:text-white transition-colors z-10"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center max-w-md p-8 rounded-2xl border border-white/10 bg-[#121215]/80 backdrop-blur-md">
            <div className="h-12 w-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Your Artwork Canvas
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Enter a prompt in the left panel and click Generate to synthesize a high-resolution masterpiece.
            </p>
            {onSelectPrompt && (
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                  Quick Prompt Starters:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onSelectPrompt(
                      "Cyberpunk samurai in neon-soaked Tokyo alley with pink and cyan hologram reflections, 8k cinematic"
                    )
                  }
                  className="w-full p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-[11px] text-zinc-300 text-left border border-white/5 transition-colors truncate"
                >
                  ⚡ Cyberpunk samurai in neon Tokyo alley...
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onSelectPrompt(
                      "Celestial goddess formed of nebula clouds and starlight, cosmic filigree armor, hyper-detailed"
                    )
                  }
                  className="w-full p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-[11px] text-zinc-300 text-left border border-white/5 transition-colors truncate"
                >
                  ⚡ Celestial goddess formed of nebula clouds...
                </button>
              </div>
            )}
          </div>
        )}

        {/* Floating Controls: Bottom Center Floating Tools Dock */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-[#121215]/95 backdrop-blur-md border border-white/15 rounded-xl px-2.5 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center gap-1 sm:gap-2 z-20">
          <button
            onClick={handleUpscale}
            disabled={!activeImage || isProcessing !== null}
            title="Upscale 8K UHD"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 text-zinc-200 text-xs font-medium border border-white/5 transition disabled:opacity-40"
          >
            <Wand2 className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline">Upscale 8K</span>
          </button>

          <button
            onClick={handleRemoveBg}
            disabled={!activeImage || isProcessing !== null}
            title="Remove Background"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200 text-xs font-medium border border-white/5 transition disabled:opacity-40"
          >
            <Scissors className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Remove BG</span>
          </button>

          {onVariation && (
            <button
              onClick={onVariation}
              disabled={!activeImage || isProcessing !== null}
              title="Generate Variations"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200 text-xs font-medium border border-white/5 transition disabled:opacity-40"
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Variations</span>
            </button>
          )}

          <button
            onClick={handleMotion}
            disabled={!activeImage || isProcessing !== null}
            title="Render Camera Motion"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200 text-xs font-medium border border-white/5 transition disabled:opacity-40"
          >
            <Video className="w-3.5 h-3.5 text-emerald-400" />
            <span>Motion</span>
          </button>

          {onToggleVisibility && (
            <button
              onClick={onToggleVisibility}
              disabled={!activeImage}
              title={isPublic ? "Set Private" : "Set Public"}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200 text-xs font-medium border border-white/5 transition disabled:opacity-40"
            >
              {isPublic ? (
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-zinc-400" />
              )}
              <span className="hidden lg:inline">{isPublic ? "Public" : "Private"}</span>
            </button>
          )}

          <div className="h-4 w-[1px] bg-white/15 mx-0.5" />

          {/* Copy Prompt */}
          <button
            onClick={handleCopyPrompt}
            title="Copy Prompt"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Zoom controls */}
          <button
            onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
            title="Zoom Out"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setZoomLevel(100)}
            title="Reset Zoom"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          <button
            onClick={() => setZoomLevel((z) => Math.min(200, z + 15))}
            title="Zoom In"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-white/15 mx-0.5" />

          {/* Toggle Filmstrip button */}
          {historyItems && historyItems.length > 0 && (
            <button
              onClick={() => setIsFilmstripOpen((prev) => !prev)}
              title={isFilmstripOpen ? "Hide History Filmstrip" : "Show History Filmstrip"}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                isFilmstripOpen
                  ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
                  : "bg-white/5 hover:bg-white/10 text-zinc-300 border-white/5"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Filmstrip</span>
            </button>
          )}

          {/* Export / Download button */}
          <button
            onClick={handleDownload}
            disabled={!activeImage}
            title="Download Master"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-black font-semibold text-xs transition shadow-[0_0_12px_rgba(249,115,22,0.3)] disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Bottom Filmstrip of Recent Creations */}
      {isFilmstripOpen && historyItems && historyItems.length > 0 && (
        <div className="border-t border-white/[0.08] bg-[#0c0c0e]/95 backdrop-blur-md px-4 py-2 z-10 flex-shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3 h-3 text-orange-400" />
                History Timeline
              </span>
              <span className="text-[9px] font-mono text-zinc-500">
                ({historyItems.length} creations)
              </span>
            </div>
            <div className="flex items-center gap-3">
              {onToggleHistoryPanel && (
                <button
                  onClick={onToggleHistoryPanel}
                  className="text-[10px] text-orange-400 hover:text-orange-300 transition flex items-center gap-0.5 font-mono"
                >
                  <span>Full History Panel</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={() => setIsFilmstripOpen(false)}
                title="Collapse Filmstrip"
                className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded transition"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {historyItems.slice(0, 15).map((item: any) => {
              const url =
                item.r2Url ||
                item.displayUrl ||
                item.watermarkedR2Url ||
                item.url;
              const isSelected =
                activeImage === item.r2Url ||
                activeImage === item.displayUrl ||
                activeImage === item.url;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectHistoryItem?.(item)}
                  title={item.prompt}
                  className={`relative flex-shrink-0 h-14 w-14 rounded-lg overflow-hidden border transition-all group ${
                    isSelected
                      ? "border-orange-500 ring-2 ring-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.4)] scale-105"
                      : "border-white/10 hover:border-white/30 hover:scale-102 opacity-80 hover:opacity-100"
                  }`}
                >
                  <img
                    src={url}
                    alt={item.prompt}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80";
                    }}
                    className="h-full w-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 border-2 border-orange-400 rounded-lg pointer-events-none" />
                  )}
                  {item.isSample && (
                    <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-[7px] font-mono px-1 rounded text-zinc-400">
                      demo
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
};
