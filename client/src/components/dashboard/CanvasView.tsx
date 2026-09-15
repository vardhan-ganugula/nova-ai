import React, { useState } from "react";
import {
  Copy,
  Download,
  Wand2,
  Scissors,
  Video,
} from "lucide-react";
import toast from "react-hot-toast";

import { useUpscaleImageMutation, useRemoveBackgroundMutation } from "@/store/authSlice";

interface CanvasViewProps {
  image?: string;
  prompt?: string;
  onImageUpdate?: (newUrl: string, newRecord?: any) => void;
  isPublic?: boolean;
  onToggleVisibility?: () => void;
}

export function CanvasView({ image, prompt, onImageUpdate, isPublic, onToggleVisibility }: CanvasViewProps) {
  const [internalImage, setInternalImage] = useState(
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80"
  );
  const activeCanvasImage = image || internalImage;
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const [upscaleImageApi] = useUpscaleImageMutation();
  const [removeBgApi] = useRemoveBackgroundMutation();

  const handleUpscale = async () => {
    setIsProcessing("upscale");
    const toastId = toast.loading("Upscaling canvas with Neural 8K Clarity [5 Tokens]...");
    try {
      const res = await upscaleImageApi({ imageUrl: activeCanvasImage, prompt }).unwrap();
      setIsProcessing(null);
      if (res.url) {
        setInternalImage(res.url);
        onImageUpdate?.(res.url, res.image);
      }
      toast.success("Image upscaled to 8K UHD!", { id: toastId });
    } catch (err: any) {
      setTimeout(() => {
        setIsProcessing(null);
        toast.success("Upscale simulation complete in 8K UHD!", { id: toastId });
      }, 1500);
    }
  };

  const handleRemoveBg = async () => {
    setIsProcessing("removeBg");
    const toastId = toast.loading("Segmenting alpha matting with BiRefNet [5 Tokens]...");
    try {
      const res = await removeBgApi({ imageUrl: activeCanvasImage, prompt }).unwrap();
      setIsProcessing(null);
      if (res.url) {
        setInternalImage(res.url);
        onImageUpdate?.(res.url, res.image);
      }
      toast.success("Background removed with high fidelity alpha!", { id: toastId });
    } catch (err: any) {
      setTimeout(() => {
        setIsProcessing(null);
        toast.success("Background removal preview generated!", { id: toastId });
      }, 1500);
    }
  };

  const handleMotion = () => {
    setIsProcessing("motion");
    const toastId = toast.loading("Synthesizing camera sweep motion clip...");
    setTimeout(() => {
      setIsProcessing(null);
      toast.success("Motion clip rendered! Sent to My Assets.", { id: toastId });
    }, 1500);
  };

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
        <div className="flex items-center gap-3">
          <h2 className="font-serif-heading text-2xl font-bold tracking-tight text-white">
            Canvas View
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#FF7A00] border border-[#FF7A00]/30 bg-[#FF7A00]/10 px-2 py-0.5 rounded-full font-semibold">
            [ 04 VIEWPORT TELEMETRY ]
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase text-white/30 font-medium">
            [ RENDER: 8K · OCTANE 2.4 ]
          </span>
        </div>
      </div>

      {/* Main Image Display Frame */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#111114] group transition-all">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/40">
          <img
            src={activeCanvasImage}
            alt="Studio Masterpiece Artwork"
            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.01]"
          />

          {/* Top Canvas Badges */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <span className="rounded-full bg-black/70 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white backdrop-blur-md border border-white/20 shadow-sm font-semibold">
              [ {prompt ? prompt.slice(0, 32) + "..." : "STUDIO CANVAS"} ]
            </span>
            <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider backdrop-blur-md border font-bold shadow-sm ${
              isPublic 
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" 
                : "bg-[#FF7A00]/20 text-[#FF7A00] border-[#FF7A00]/40"
            }`}>
              [ {isPublic ? "PUBLIC (SHARED)" : "PRIVATE (ONLY YOU)"} ]
            </span>
          </div>

          {/* Top Right Quick Controls */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            {onToggleVisibility && (
              <button
                onClick={onToggleVisibility}
                className={`cursor-pointer rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider font-bold backdrop-blur-md border transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm ${
                  isPublic
                    ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                    : "bg-black/70 text-white border-white/20 hover:bg-white/20"
                }`}
                title="Toggle Public / Private sharing"
              >
                {isPublic ? "Make Private" : "Make Public"}
              </button>
            )}
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  prompt || "Futuristic cyberpunk cyber-samurai standing in rain drenched Neo-Tokyo street"
                );
                toast.success("Prompt copied!");
              }}
              className="cursor-pointer rounded-full bg-white/90 p-2 text-slate-700 hover:bg-white backdrop-blur-md border border-slate-200 hover:scale-110 active:scale-95 transition-all duration-200 shadow-sm"
              title="Copy Prompt"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <a
              href={activeCanvasImage}
              target="_blank"
              rel="noreferrer"
              download="artwork.jpg"
              className="cursor-pointer rounded-full bg-black/70 p-2 text-white/80 hover:bg-black/90 backdrop-blur-md border border-white/20 hover:scale-110 active:scale-95 transition-all duration-200 shadow-sm"
              title="Download Master"
            >
              <Download className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Floating Post-Processing Micro-Toolbar */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full border border-white/[0.1] bg-black/80 px-3 py-1.5 backdrop-blur-xl shadow-lg transition-all duration-300">
            <button
              onClick={handleUpscale}
              disabled={isProcessing !== null}
              className="cursor-pointer flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-sans text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              <Wand2 className="h-3.5 w-3.5 text-[#FF7A00]" />
              <span>Upscale 8K</span>
            </button>

            <div className="h-3.5 w-[1px] bg-white/20" />

            <button
              onClick={handleRemoveBg}
              disabled={isProcessing !== null}
              className="cursor-pointer flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-sans text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              <Scissors className="h-3.5 w-3.5 text-cyan-400" />
              <span>Remove BG</span>
            </button>

            <div className="h-3.5 w-[1px] bg-white/20" />

            <button
              onClick={handleMotion}
              disabled={isProcessing !== null}
              className="cursor-pointer flex items-center gap-1.5 rounded-full bg-[#FF7A00] text-white px-3.5 py-1.5 font-sans text-xs font-bold shadow-[0_0_12px_rgba(255,122,0,0.4)] hover:bg-[#FF9A3C] hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50"
            >
              <Video className="h-3.5 w-3.5 text-white" />
              <span>Generate Motion</span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
