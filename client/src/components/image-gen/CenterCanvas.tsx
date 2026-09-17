import React, { useState } from "react";
import {
  Download,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  Loader2,
  Layers,
  Wand2,
} from "lucide-react";
import toast from "react-hot-toast";

export type GenerationStep = "idle" | "queued" | "synthesizing" | "upscaling" | "complete";

interface CenterCanvasProps {
  currentStep: GenerationStep;
  activeImage: string;
  onUpscale: () => void;
  onInpaint: () => void;
  onVariation: () => void;
}

const STEPPERS = [
  { id: "queued", label: "Queued", icon: Clock },
  { id: "synthesizing", label: "Synthesizing", icon: Loader2 },
  { id: "upscaling", label: "Upscaling 4K", icon: Sparkles },
  { id: "complete", label: "Render Complete", icon: CheckCircle2 },
];

export const CenterCanvas: React.FC<CenterCanvasProps> = ({
  currentStep,
  activeImage,
  onUpscale,
  onInpaint,
  onVariation,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

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
    link.download = `ai-render-${Date.now()}.png`;
    link.target = "_blank";
    link.click();
    toast.success("Downloading master render...");
  };

  return (
    <main className="flex-1 h-full bg-[#0F0F11] flex flex-col relative overflow-hidden select-none">
      {/* Top Bar: Workflow Status Stepper */}
      <header className="h-14 border-b border-white/10 bg-[#141417]/80 backdrop-blur-md px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-1 sm:gap-2">
          {STEPPERS.map((step, idx) => {
            const status = getStepStatus(step.id);
            const Icon = step.icon;
            return (
              <React.Fragment key={step.id}>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    status === "active"
                      ? "bg-[#FF7A00]/15 text-[#FF7A00] border border-[#FF7A00]/40"
                      : status === "finished"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "text-zinc-500 bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      status === "active" && step.id === "synthesizing" ? "animate-spin" : ""
                    }`}
                  />
                  <span className="hidden md:inline">{step.label}</span>
                </div>
                {idx < STEPPERS.length - 1 && (
                  <div
                    className={`h-[1px] w-3 sm:w-6 transition-colors ${
                      status === "finished" ? "bg-emerald-500/50" : "bg-white/10"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Viewport Scale Indicator */}
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span className="hidden sm:inline text-[11px] text-zinc-500">ZOOM</span>
          <span className="bg-[#18181B] px-2 py-0.5 rounded border border-white/10 text-white">
            {zoomLevel}%
          </span>
        </div>
      </header>

      {/* Main Canvas Viewport Area */}
      <div className="flex-1 min-h-0 relative flex flex-col items-center justify-between p-2 sm:p-4 md:py-3 md:px-6 overflow-hidden bg-[radial-gradient(#1f1f23_1px,transparent_1px)] [background-size:24px_24px]">
        {/* Subtle grid background vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F11] via-transparent to-[#0F0F11]/60 pointer-events-none" />

        {/* Image Canvas Container - flex-1 min-h-0 so it resizes dynamically to fit remaining space */}
        <div className="relative flex items-center justify-center w-full max-w-5xl flex-1 min-h-0 my-1 sm:my-2 z-10">
          {/* Active Render Display / Processing State */}
          <div
            className={`relative transition-all duration-300 rounded-2xl overflow-hidden border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.8)] max-h-full max-w-full flex items-center justify-center bg-[#18181B]`}
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            <img
              src={activeImage}
              alt="AI Render Viewport"
              className={`w-auto h-auto max-h-[calc(100vh-230px)] object-contain transition-opacity duration-500 ${
                currentStep === "synthesizing" ? "opacity-30 blur-sm" : "opacity-100 blur-0"
              }`}
            />

            {/* Processing Overlay when Active */}
            {currentStep !== "complete" && currentStep !== "idle" && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full border-4 border-[#FF7A00]/20 border-t-[#FF7A00] animate-spin" />
                  <Sparkles className="w-6 h-6 text-[#FF7A00] absolute inset-0 m-auto animate-pulse" />
                </div>
                <p className="text-white font-semibold text-sm tracking-wide mb-1">
                  {currentStep === "queued" && "Dispatching to GPU Cluster..."}
                  {currentStep === "synthesizing" && "Calculating Latent Diffusion Tensors..."}
                  {currentStep === "upscaling" && "Applying AI Optical Super-Resolution..."}
                </p>
                <p className="text-xs text-zinc-400 font-mono">
                  {currentStep === "synthesizing" ? "Step 28 / 40 • 4.2 it/s" : "Please hold..."}
                </p>
              </div>
            )}

            {/* Canvas HUD Overlay Badge */}
            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono text-zinc-300">8K MASTER RENDER • DCI-P3</span>
            </div>
          </div>
        </div>

        {/* Action Toolbar: Placed directly below image canvas in normal flow with dedicated vertical space */}
        <div className="w-auto max-w-[calc(100%-1rem)] flex items-center justify-center gap-1.5 sm:gap-2 bg-[#18181B]/95 backdrop-blur-md border border-white/15 rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 shadow-[0_10px_30px_rgba(0,0,0,0.6)] overflow-x-auto custom-scrollbar my-1 sm:my-2 shrink-0 z-10">
          <button
            onClick={onUpscale}
            title="Upscale 4X"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#FF7A00]/20 hover:text-[#FF7A00] text-zinc-200 text-xs font-medium border border-white/5 transition cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
            <span>Upscale 4x</span>
          </button>

          <button
            onClick={onInpaint}
            title="Inpaint / Edit Mask"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 text-xs font-medium border border-white/5 transition cursor-pointer shrink-0"
          >
            <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Inpaint</span>
          </button>

          <button
            onClick={onVariation}
            title="Generate Variations"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 text-xs font-medium border border-white/5 transition cursor-pointer shrink-0"
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Variations</span>
          </button>

          <div className="h-5 w-[1px] bg-white/15 mx-1 shrink-0" />

          {/* Zoom controls */}
          <button
            onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
            title="Zoom Out"
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={() => setZoomLevel(100)}
            title="Reset Zoom"
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setZoomLevel((z) => Math.min(200, z + 15))}
            title="Zoom In"
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-white/15 mx-1" />

          {/* Download button */}
          <button
            onClick={handleDownload}
            title="Download Full Resolution"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FF7A00] hover:bg-[#FF8F26] text-black font-semibold text-xs transition cursor-pointer shadow-[0_0_15px_rgba(255,122,0,0.3)]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </main>
  );
};
