import React, { useState, useEffect, useMemo } from "react";
import {
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  CheckCircle2,
  Image as ImgIcon,
  RefreshCw,
  ExternalLink,
  Info,
} from "lucide-react";
import { useGetUserHistoryQuery } from "@/store/authSlice";
import type { WorkflowImageItem } from "./types";

// Fallback demo images for new users
const DEMO_IMAGES: WorkflowImageItem[] = [
  {
    id: "demo-img-1",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    prompt: "Cyberpunk iridescent android portrait, volumetric neon lighting, 8k render, hyper-detailed octane",
    createdAt: "Just now",
    aspectRatio: "1:1",
    model: "Flux.1 Pro",
    width: 1024,
    height: 1024,
  },
  {
    id: "demo-img-2",
    url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&auto=format&fit=crop&q=80",
    prompt: "Ethereal crystal cavern with glowing bioluminescent fungi, unreal engine 5 architecture",
    createdAt: "10 mins ago",
    aspectRatio: "16:9",
    model: "SDXL Lightning",
    width: 1344,
    height: 768,
  },
  {
    id: "demo-img-3",
    url: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=600&auto=format&fit=crop&q=80",
    prompt: "Futuristic liquid chrome fluid dynamics in zero gravity, studio lighting, iridescent reflections",
    createdAt: "1 hour ago",
    aspectRatio: "1:1",
    model: "Midjourney v6",
    width: 1024,
    height: 1024,
  },
  {
    id: "demo-img-4",
    url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80",
    prompt: "Bioluminescent deep-sea creature, macro photography, dark ocean floor",
    createdAt: "2 hours ago",
    aspectRatio: "1:1",
    model: "Stable Diffusion XL",
    width: 1024,
    height: 1024,
  },
  {
    id: "demo-img-5",
    url: "https://images.unsplash.com/photo-1535982330050-f1c2fb79ff78?w=600&auto=format&fit=crop&q=80",
    prompt: "Neon-lit Japanese alley at 3am, light rain reflections on cobblestone, cinematic",
    createdAt: "3 hours ago",
    aspectRatio: "16:9",
    model: "Flux.1 Pro",
    width: 1344,
    height: 768,
  },
  {
    id: "demo-img-6",
    url: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=600&auto=format&fit=crop&q=80",
    prompt: "Cosmic nebula formation, deep space photography, iridescent hydrogen clouds",
    createdAt: "Yesterday",
    aspectRatio: "16:9",
    model: "DALL·E 3",
    width: 1792,
    height: 1024,
  },
];

interface ImageNodeProps {
  selectedImage: WorkflowImageItem | null;
  onSelectImage: (image: WorkflowImageItem) => void;
  isExecuting?: boolean;
}

const GRID_PAGE_SIZE = 6; // 2-column × 3 rows

export const ImageNode: React.FC<ImageNodeProps> = ({
  selectedImage,
  onSelectImage,
  isExecuting = false,
}) => {
  const { data: historyData, isLoading, refetch } = useGetUserHistoryQuery();
  const [currentPage, setCurrentPage] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  // Normalize images
  const userImages: WorkflowImageItem[] = useMemo(() => {
    const rawImages = historyData?.images || (historyData as any)?.history || [];
    if (!rawImages.length) return DEMO_IMAGES;

    const mapped = rawImages
      .map((item: any, index: number) => {
        const url =
          item.r2Url ||
          item.displayUrl ||
          item.watermarkedR2Url ||
          item.url ||
          item.imageUrl ||
          "";
        if (!url) return null;
        return {
          id: item.id || item._id || `gen-${index}`,
          url,
          prompt: item.prompt || "Generative AI Artwork",
          createdAt: item.createdAt
            ? new Date(item.createdAt).toLocaleDateString()
            : "Recent",
          aspectRatio: item.aspectRatio || "1:1",
          model: item.model || "Flux.1 Pro",
          width: item.width || 1024,
          height: item.height || 1024,
        };
      })
      .filter(Boolean) as WorkflowImageItem[];

    return mapped.length ? mapped : DEMO_IMAGES;
  }, [historyData]);

  // Auto-select first image
  useEffect(() => {
    if (!selectedImage && userImages.length > 0) {
      onSelectImage(userImages[0]);
    }
  }, [userImages]);

  const totalPages = Math.ceil(userImages.length / GRID_PAGE_SIZE);
  const pageImages = userImages.slice(
    currentPage * GRID_PAGE_SIZE,
    (currentPage + 1) * GRID_PAGE_SIZE
  );
  const activeItem = selectedImage || userImages[0];

  return (
    <div
      className={`w-[340px] rounded-2xl border bg-[#0f0f13]/95 backdrop-blur-md shadow-2xl transition-all duration-300 ${
        isExecuting
          ? "border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/40"
          : "border-cyan-500/40 hover:border-cyan-500/70"
      } p-4 space-y-3`}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-white/[0.07] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              Image Library
              {isLoading && <RefreshCw className="w-2.5 h-2.5 animate-spin text-cyan-400" />}
            </h3>
            <p className="text-[10px] text-cyan-400/80 font-mono">
              {historyData?.images?.length
                ? `${historyData.images.length} OWNED ASSETS`
                : "DEMO LIBRARY"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => refetch()}
            className="p-1 rounded hover:bg-white/[0.06] text-zinc-500 hover:text-cyan-400 transition"
            title="Refresh library"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
          <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            SOURCE
          </span>
        </div>
      </div>

      {/* ── Selected Image Preview ── */}
      {activeItem ? (
        <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/40 h-40">
          <img
            src={activeItem.url || DEMO_IMAGES[0].url}
            alt={activeItem.prompt || "AI Image"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEMO_IMAGES[0].url;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

          {/* Model badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-[9px] text-zinc-300 font-mono">
            <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
            <span>{activeItem.model || "AI Generated"}</span>
          </div>

          {/* Selected badge */}
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-cyan-500 text-black px-1.5 py-0.5 rounded-md text-[9px] font-bold">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>SELECTED</span>
          </div>

          {/* Info toggle */}
          <button
            type="button"
            onClick={() => setShowInfo((v) => !v)}
            className="absolute bottom-2 right-2 p-1 rounded-md bg-black/60 text-zinc-400 hover:text-white transition"
          >
            <Info className="w-3 h-3" />
          </button>

          {/* Metadata overlay */}
          {showInfo ? (
            <div className="absolute bottom-0 inset-x-0 bg-black/90 p-2.5 space-y-1">
              <p className="text-[10px] text-white font-medium line-clamp-2">{activeItem.prompt}</p>
              <div className="flex gap-3 text-[9px] font-mono text-zinc-400">
                <span>{activeItem.aspectRatio || "1:1"}</span>
                <span>{activeItem.width}×{activeItem.height}</span>
                <span>{activeItem.createdAt}</span>
              </div>
            </div>
          ) : (
            <div className="absolute bottom-2 left-2 right-8 pointer-events-none">
              <p className="text-[11px] text-white font-medium line-clamp-1">{activeItem.prompt}</p>
              <p className="text-[9px] font-mono text-zinc-400 mt-0.5">
                {activeItem.aspectRatio} · {activeItem.width}×{activeItem.height}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="h-40 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 flex flex-col items-center justify-center text-zinc-500 text-xs">
          <ImgIcon className="w-6 h-6 mb-1 text-zinc-600" />
          No images in library yet
        </div>
      )}

      {/* ── Grid Gallery ── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" />
            Gallery ({userImages.length} assets)
          </span>
          <div className="flex items-center gap-2">
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="p-0.5 rounded hover:bg-white/10 disabled:opacity-30"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <span className="text-[9px]">{currentPage + 1}/{totalPages}</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="p-0.5 rounded hover:bg-white/10 disabled:opacity-30"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
            <a
              href="/library"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-0.5 text-[9px] text-cyan-400/70 hover:text-cyan-300 transition"
            >
              Library <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* 2-column grid */}
        <div className="grid grid-cols-3 gap-1.5">
          {pageImages.map((img) => {
            const isActive = activeItem?.id === img.id;
            const isHovered = hoveredId === img.id;
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => onSelectImage(img)}
                onMouseEnter={() => setHoveredId(img.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`relative aspect-square rounded-xl overflow-hidden border transition-all duration-200 ${
                  isActive
                    ? "border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                    : "border-white/10 hover:border-white/30"
                }`}
                title={img.prompt}
              >
                <img
                  src={img.url || DEMO_IMAGES[0].url}
                  alt={img.prompt || "Gallery asset"}
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    isHovered ? "scale-110" : "scale-100"
                  }`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEMO_IMAGES[0].url;
                  }}
                />
                {/* Hover info overlay */}
                <div
                  className={`absolute inset-0 bg-black/80 flex flex-col items-start justify-end p-1.5 transition-opacity duration-200 ${
                    isHovered ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <p className="text-[8px] text-white line-clamp-2 leading-tight">{img.prompt}</p>
                  <p className="text-[7px] text-zinc-400 font-mono mt-0.5">{img.model}</p>
                </div>
                {/* Active checkmark */}
                {isActive && (
                  <div className="absolute inset-0 bg-cyan-500/15 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-cyan-300 drop-shadow" />
                  </div>
                )}
              </button>
            );
          })}
          {/* Placeholder slots */}
          {Array.from({ length: Math.max(0, GRID_PAGE_SIZE - pageImages.length) }).map((_, i) => (
            <div
              key={`placeholder-${i}`}
              className="aspect-square rounded-xl border border-dashed border-zinc-800/60 bg-zinc-900/20"
            />
          ))}
        </div>
      </div>

      {/* ── Selected Asset Output Metadata ── */}
      {activeItem && (
        <div className="bg-black/40 rounded-xl border border-white/[0.06] p-2.5 space-y-1 text-[10px] font-mono">
          <div className="text-zinc-500 uppercase tracking-wider text-[9px] mb-1">
            Output Payload → IMAGE OUT
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
            <span className="text-zinc-600">url:</span>
            <span className="text-cyan-300 truncate">{activeItem.url.split("/").pop()}</span>
            <span className="text-zinc-600">ratio:</span>
            <span className="text-cyan-300">{activeItem.aspectRatio}</span>
            <span className="text-zinc-600">dims:</span>
            <span className="text-cyan-300">{activeItem.width}×{activeItem.height}</span>
            <span className="text-zinc-600">model:</span>
            <span className="text-cyan-300 truncate">{activeItem.model}</span>
          </div>
        </div>
      )}

      {/* ── Port ── */}
      <div className="flex items-center justify-between pt-1 border-t border-white/[0.07] text-[10px] font-mono">
        <span className="text-zinc-600">Asset Source</span>
        <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
          <span>IMAGE OUT</span>
          <span className="w-2.5 h-2.5 rounded-full border border-cyan-400 bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
        </div>
      </div>
    </div>
  );
};
