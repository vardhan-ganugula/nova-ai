import React, { useState } from "react";
import {
  Bookmark,
  Sparkles,
  History as HistoryIcon,
  ListOrdered,
  ChevronRight,
  Copy,
  Wand2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";
import { useGetUserHistoryQuery } from "@/store/authSlice";

export interface PresetItem {
  id: string;
  name: string;
  category: "Characters" | "Environments" | "Artistic";
  tag: string;
  image: string;
  prompt: string;
  negativePrompt?: string;
  cfg: number;
}

const PRESETS: PresetItem[] = [
  {
    id: "preset-1",
    name: "Cyber Netrunner Operative",
    category: "Characters",
    tag: "Sci-Fi",
    image:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80",
    prompt:
      "Female cyber netrunner with glowing ocular implants, sleek obsidian tactical bodysuit with fiber-optic wiring, chrome katana, standing in misty neon alley, 8k raytraced render",
    cfg: 7.5,
  },
  {
    id: "preset-2",
    name: "Void Mech Vanguard",
    category: "Characters",
    tag: "Exosuit",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80",
    prompt:
      "Armored space mech pilot in high-tech carbon-fiber suit, gold reflective visor, zero gravity particle aura, cinematic sci-fi concept art, volumetric rim lighting",
    cfg: 8.0,
  },
  {
    id: "preset-3",
    name: "Neo-Shinjuku Rainscape",
    category: "Environments",
    tag: "Cyber City",
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
    prompt:
      "Drenched high-tech Shinjuku avenue at midnight, towering holographic kanji billboards, flying taxi trails, wet asphalt neon reflections, photorealistic 8k octane render",
    cfg: 8.5,
  },
  {
    id: "preset-4",
    name: "Solarpunk Sky Citadel",
    category: "Environments",
    tag: "Ecotecture",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80",
    prompt:
      "Lush Solarpunk floating city towers covered in vertical hydroponic gardens, glistening glass domes, clean solar monorails, clear golden sunrise sky",
    cfg: 7.0,
  },
  {
    id: "preset-5",
    name: "Astral Nebula Weaver",
    category: "Artistic",
    tag: "Surreal",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80",
    prompt:
      "Cosmic entity weaving constellations from liquid starlight in deep interstellar void, iridescent nebulae ribbons, hyper-detailed fantasy illustration",
    cfg: 9.0,
  },
];

interface QueuePanelProps {
  onSelectPreset: (preset: PresetItem) => void;
  onSelectHistoryItem?: (item: any) => void;
  isGenerating?: boolean;
  activePrompt?: string;
}

export const QueuePanel: React.FC<QueuePanelProps> = ({
  onSelectPreset,
  onSelectHistoryItem,
  isGenerating = false,
  activePrompt = "",
}) => {
  const [activeTab, setActiveTab] = useState<"presets" | "history" | "queue">("history");
  const { data: historyData, isLoading: isHistoryLoading } = useGetUserHistoryQuery();

  const historyItems = historyData?.history || [];

  return (
    <aside className="w-80 flex-shrink-0 h-full border-l border-white/[0.08] bg-[#0c0c0e] flex flex-col z-20 select-none">
      {/* Tab Header */}
      <div className="h-12 border-b border-white/[0.08] px-2 flex items-center justify-between bg-[#0c0c0e]">
        <div className="flex items-center gap-1 w-full">
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "history"
                ? "bg-white/[0.08] text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
            }`}
          >
            <HistoryIcon className="w-3.5 h-3.5" />
            <span>History</span>
          </button>

          <button
            onClick={() => setActiveTab("presets")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "presets"
                ? "bg-white/[0.08] text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Presets</span>
          </button>

          <button
            onClick={() => setActiveTab("queue")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "queue"
                ? "bg-white/[0.08] text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Queue</span>
            {isGenerating && (
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar text-xs">
        {/* TAB 1: HISTORY */}
        {activeTab === "history" && (
          <div className="space-y-2.5">
            {isHistoryLoading ? (
              <div className="py-12 text-center text-zinc-500 font-mono text-xs">
                Loading history records...
              </div>
            ) : historyItems.length === 0 ? (
              <div className="py-12 text-center text-zinc-500">
                <HistoryIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="font-medium text-zinc-400">No generation history</p>
                <p className="text-[11px] text-zinc-600 mt-0.5">
                  Your generated artworks will appear here.
                </p>
              </div>
            ) : (
              historyItems.map((item: any) => (
                <div
                  key={item.id}
                  onClick={() => onSelectHistoryItem?.(item)}
                  className="group p-2 rounded-lg border border-white/5 bg-[#121215] hover:border-orange-500/40 hover:bg-[#16161a] transition-all cursor-pointer flex gap-2.5 items-start"
                >
                  <div className="h-14 w-14 rounded-md overflow-hidden bg-black flex-shrink-0 border border-white/10">
                    <img
                      src={item.r2Url || item.displayUrl}
                      alt={item.prompt}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-200 line-clamp-2 text-[11px] leading-snug">
                      "{item.prompt}"
                    </p>
                    <div className="flex items-center justify-between mt-1.5 text-[10px] text-zinc-500 font-mono">
                      <span>{item.model || "Flux Pro"}</span>
                      <span className="text-orange-400/80">-{item.tokensDeducted || 10}T</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: PRESETS */}
        {activeTab === "presets" && (
          <div className="space-y-3">
            {PRESETS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset);
                  toast.success(`Loaded preset: ${preset.name}`);
                }}
                className="group rounded-lg border border-white/5 bg-[#121215] hover:border-orange-500/40 hover:bg-[#16161a] transition-all cursor-pointer overflow-hidden p-2 flex flex-col gap-2"
              >
                <div className="relative h-24 w-full rounded overflow-hidden bg-black">
                  <img
                    src={preset.image}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-1.5 left-1.5 bg-black/70 px-1.5 py-0.5 rounded text-[9px] font-mono text-zinc-300 border border-white/10">
                    {preset.tag}
                  </div>
                  <div className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-orange-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <span>Use</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-orange-400 transition-colors truncate">
                    {preset.name}
                  </h4>
                  <p className="text-[11px] text-zinc-500 line-clamp-2 mt-0.5 leading-snug">
                    {preset.prompt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: QUEUE */}
        {activeTab === "queue" && (
          <div className="space-y-3">
            {isGenerating ? (
              <div className="p-3 rounded-lg border border-orange-500/30 bg-orange-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-100 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
                    Generating Artwork
                  </span>
                  <span className="font-mono text-[10px] text-orange-400">Processing</span>
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2">
                  "{activePrompt}"
                </p>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-orange-500 animate-pulse rounded-full w-3/4" />
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-zinc-500">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="font-medium text-zinc-400">Queue is empty</p>
                <p className="text-[11px] text-zinc-600 mt-0.5">
                  Tasks dispatched to the GPU cluster will appear here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 border-t border-white/[0.08] bg-[#0c0c0e] text-center">
        <span className="text-[10px] text-zinc-500 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-orange-400" />
          Click any history or preset to load parameters
        </span>
      </div>
    </aside>
  );
};
