import React, { useState, useMemo, useEffect } from "react";
import {
  Bookmark,
  Sparkles,
  History as HistoryIcon,
  ListOrdered,
  ChevronRight,
  ChevronLeft,
  Copy,
  Clock,
  Search,
  X,
  Image as ImageIcon,
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

export const PRESETS: PresetItem[] = [
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

export const DEFAULT_SAMPLE_HISTORY = [
  {
    id: "sample-1",
    prompt:
      "Futuristic cybernetic operative on rooftop overlooking neon-lit metropolis, rain reflections, volumetric dust motes, cinematic 8k octane render",
    r2Url:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=85",
    model: "flux-1-pro",
    tokensDeducted: 10,
    aspectRatio: "16:9",
    createdAt: new Date().toISOString(),
    isSample: true,
  },
  {
    id: "sample-2",
    prompt:
      "Neo-Tokyo cyber samurai reflected on rain drenched asphalt with pink neon signs, hyper-detailed raytracing",
    r2Url:
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80",
    model: "photoreal-cine",
    tokensDeducted: 12,
    aspectRatio: "16:9",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    isSample: true,
  },
  {
    id: "sample-3",
    prompt:
      "Porcelain android geisha with holographic origami butterflies, ambient gold glow, intricate filigree",
    r2Url:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80",
    model: "cyber-anime-v4",
    tokensDeducted: 10,
    aspectRatio: "1:1",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    isSample: true,
  },
  {
    id: "sample-4",
    prompt:
      "Ancient overgrown solarpunk sky towers with vertical hydroponic gardens at dawn, clean solar monorails",
    r2Url:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
    model: "sdxl-turbo",
    tokensDeducted: 8,
    aspectRatio: "16:9",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isSample: true,
  },
  {
    id: "sample-5",
    prompt:
      "Cosmic astral entity weaving starlight constellations in deep interstellar void, iridescent nebulae ribbons",
    r2Url:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
    model: "flux-1-pro",
    tokensDeducted: 10,
    aspectRatio: "16:9",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    isSample: true,
  },
  {
    id: "sample-6",
    prompt:
      "Armored space mech vanguard in high-tech carbon-fiber suit, gold reflective visor, cinematic sci-fi concept art",
    r2Url:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&auto=format&fit=crop&q=80",
    model: "midjourney-v6",
    tokensDeducted: 15,
    aspectRatio: "16:9",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    isSample: true,
  },
];

function formatTimeAgo(dateString?: string): string {
  if (!dateString) return "Recent";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (isNaN(diffMs) || diffMs < 0) return "Recent";
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  return `${diffDays}d ago`;
}

export interface QueuePanelProps {
  onSelectPreset: (preset: PresetItem) => void;
  onSelectHistoryItem?: (item: any) => void;
  isGenerating?: boolean;
  activePrompt?: string;
  sessionHistory?: any[];
  onClose?: () => void;
  isDrawer?: boolean;
}

export const QueuePanel: React.FC<QueuePanelProps> = ({
  onSelectPreset,
  onSelectHistoryItem,
  isGenerating = false,
  activePrompt = "",
  sessionHistory = [],
  onClose,
  isDrawer = false,
}) => {
  const [activeTab, setActiveTab] = useState<"history" | "presets" | "queue">("history");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "mine" | "samples">("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PAGE_SIZE = 10;

  const { data: historyData, isLoading: isHistoryLoading } = useGetUserHistoryQuery();

  // Support both `images` (actual server response) and `history`
  const apiHistory = useMemo(() => {
    return (historyData as any)?.images || (historyData as any)?.history || [];
  }, [historyData]);

  // Combine session history with api images, deduplicating by id
  const allHistoryItems = useMemo(() => {
    const map = new Map<string, any>();
    sessionHistory.forEach((item) => {
      if (item?.id) map.set(item.id, item);
    });
    apiHistory.forEach((item: any) => {
      if (item?.id && !map.has(item.id)) {
        map.set(item.id, item);
      }
    });

    const list = Array.from(map.values());
    if (list.length === 0) {
      return DEFAULT_SAMPLE_HISTORY;
    }
    return list;
  }, [sessionHistory, apiHistory]);

  // Filter items by type and search query
  const filteredHistoryItems = useMemo(() => {
    let list = allHistoryItems;

    if (filterType === "mine") {
      list = list.filter((item) => !item.isSample);
    } else if (filterType === "samples") {
      list = list.filter((item) => Boolean(item.isSample));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.prompt?.toLowerCase().includes(q) ||
          item.model?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allHistoryItems, filterType, searchQuery]);

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType]);

  // Pagination (10 items per page)
  const totalPages = Math.max(1, Math.ceil(filteredHistoryItems.length / PAGE_SIZE));
  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredHistoryItems.slice(start, start + PAGE_SIZE);
  }, [filteredHistoryItems, currentPage]);

  const handleCopyPrompt = (promptText: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(promptText);
    toast.success("Prompt copied to clipboard!");
  };

  return (
    <aside className="w-80 flex-shrink-0 h-full border-l border-white/[0.08] bg-[#0c0c0e] flex flex-col z-20 select-none">
      {/* Header with Tabs & Close button */}
      <div className="h-12 border-b border-white/[0.08] px-2.5 flex items-center justify-between bg-[#0c0c0e]">
        <div className="flex items-center gap-1 flex-1 min-w-0 mr-1">
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "history"
                ? "bg-white/[0.08] text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
            }`}
          >
            <HistoryIcon className="w-3.5 h-3.5 text-orange-400" />
            <span>History</span>
            <span className="text-[10px] font-mono px-1 rounded bg-white/10 text-zinc-300">
              {allHistoryItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("presets")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "presets"
                ? "bg-white/[0.08] text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-purple-400" />
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
            <ListOrdered className="w-3.5 h-3.5 text-cyan-400" />
            <span>Queue</span>
            {isGenerating && (
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Optional close button for drawer or panel */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/10 transition"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar text-xs flex flex-col">
        {/* TAB 1: HISTORY */}
        {activeTab === "history" && (
          <div className="flex-1 flex flex-col space-y-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history prompts..."
                className="w-full bg-[#141417] border border-white/10 rounded-lg pl-8 pr-7 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter pills: All, Mine, Samples */}
            <div className="flex items-center gap-1 bg-white/[0.03] p-0.5 rounded-lg border border-white/5 text-[11px]">
              <button
                onClick={() => setFilterType("all")}
                className={`flex-1 py-1 rounded text-center font-medium transition ${
                  filterType === "all"
                    ? "bg-white/10 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                All ({allHistoryItems.length})
              </button>
              <button
                onClick={() => setFilterType("mine")}
                className={`flex-1 py-1 rounded text-center font-medium transition ${
                  filterType === "mine"
                    ? "bg-white/10 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Mine ({allHistoryItems.filter((i) => !i.isSample).length})
              </button>
              <button
                onClick={() => setFilterType("samples")}
                className={`flex-1 py-1 rounded text-center font-medium transition ${
                  filterType === "samples"
                    ? "bg-white/10 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Starters
              </button>
            </div>

            {/* History List */}
            {isHistoryLoading && allHistoryItems.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 font-mono text-xs">
                Loading history records...
              </div>
            ) : paginatedHistory.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 space-y-2">
                <HistoryIcon className="h-8 w-8 mx-auto opacity-30 text-zinc-400" />
                <p className="font-medium text-zinc-400">No creations found</p>
                <p className="text-[11px] text-zinc-600">
                  {searchQuery
                    ? "No prompts match your search query."
                    : "Your generated artworks will appear here."}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-[11px] text-orange-400 hover:underline pt-1"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2 flex-1">
                {paginatedHistory.map((item: any) => {
                  const imageUrl =
                    item.r2Url ||
                    item.displayUrl ||
                    item.watermarkedR2Url ||
                    item.url ||
                    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80";

                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectHistoryItem?.(item)}
                      className="group p-2 rounded-lg border border-white/5 bg-[#121215] hover:border-orange-500/40 hover:bg-[#16161a] transition-all cursor-pointer flex gap-2.5 items-start relative overflow-hidden"
                    >
                      {/* Thumbnail with fallback */}
                      <div className="h-16 w-16 rounded-md overflow-hidden bg-black flex-shrink-0 border border-white/10 relative group-hover:border-orange-500/30">
                        <img
                          src={imageUrl}
                          alt={item.prompt}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80";
                          }}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        {item.isSample && (
                          <span className="absolute top-0.5 left-0.5 bg-black/80 text-[8px] font-mono uppercase px-1 py-0.2 rounded text-zinc-400 border border-white/10">
                            Demo
                          </span>
                        )}
                      </div>

                      {/* Info & Metadata */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-zinc-200 line-clamp-2 text-[11px] leading-snug group-hover:text-white transition-colors"
                          title={item.prompt}
                        >
                          "{item.prompt}"
                        </p>
                        <div className="flex items-center justify-between mt-1.5 text-[10px] text-zinc-500 font-mono">
                          <span className="truncate max-w-[85px]">
                            {item.model || "flux-1-pro"}
                          </span>
                          <span className="text-orange-400/80 font-semibold">
                            -{item.tokensDeducted || 10}T
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[9px] text-zinc-600 font-mono">
                          <span>{item.aspectRatio || "16:9"}</span>
                          <span>{formatTimeAgo(item.createdAt)}</span>
                        </div>
                      </div>

                      {/* Quick copy prompt action */}
                      <button
                        onClick={(e) => handleCopyPrompt(item.prompt, e)}
                        title="Copy Prompt"
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition self-start"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls (10 items per page) */}
            {totalPages > 1 && (
              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] text-zinc-400">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 transition flex items-center gap-1"
                >
                  <ChevronLeft className="w-3 h-3" /> Prev
                </button>
                <span className="font-mono text-zinc-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 transition flex items-center gap-1"
                >
                  Next <ChevronRight className="w-3 h-3" />
                </button>
              </div>
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
          Click any history item to load onto canvas
        </span>
      </div>
    </aside>
  );
};
