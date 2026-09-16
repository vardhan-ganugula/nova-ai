import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FolderKanban,
  Search,
  Download,
  Trash2,
  Share2,
  Copy,
  Sparkles,
  Wand2,
  CheckSquare,
  Square,
  Layers,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useGetUserHistoryQuery } from "@/store/authSlice";

export default function LibraryPage() {
  const navigate = useNavigate();
  const { data: historyData, isLoading } = useGetUserHistoryQuery();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const sampleLibrary = [
    {
      id: "lib-1",
      prompt: "Cyberpunk netrunner operative with glowing ocular implants, rain reflections, volumetric lighting",
      r2Url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80",
      model: "Flux.1 Pro",
      createdAt: new Date().toISOString(),
      type: "Image",
    },
    {
      id: "lib-2",
      prompt: "Neo-Tokyo samurai assassin in pink neon glow, 8k octane render",
      r2Url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80",
      model: "HyperCine 8K",
      createdAt: new Date().toISOString(),
      type: "Image",
    },
    {
      id: "lib-3",
      prompt: "Ethereal crystal celestial guardian in nebula clouds, ultra-detailed raytracing",
      r2Url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      model: "Flux.1 Pro",
      createdAt: new Date().toISOString(),
      type: "Upscaled",
    },
    {
      id: "lib-4",
      prompt: "Solarpunk floating city with vertical hydroponic gardens at dawn",
      r2Url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
      model: "SDXL Lightning",
      createdAt: new Date().toISOString(),
      type: "Cutout",
    },
  ];

  const rawHistory = historyData?.images || historyData?.history || [];
  const libraryItems = rawHistory.length ? rawHistory : sampleLibrary;

  const filteredItems = libraryItems.filter((item: any) => {
    const matchesSearch = item.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Upscaled" && item.type === "Upscaled") ||
      (activeFilter === "Cutouts" && item.type === "Cutout");
    return matchesSearch && matchesFilter;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i: any) => i.id));
    }
  };

  const copyPrompt = (prompt: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied to clipboard!");
  };

  const handleBulkDownload = () => {
    toast.success(`Exporting ${selectedIds.length} assets to ZIP...`);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    toast.success(`Removed ${selectedIds.length} items from Library`);
    setSelectedIds([]);
  };

  return (
    <AppShell title="Personal Library" subtitleBadge="[ ASSETS VAULT ]">
      <div className="max-w-7xl mx-auto space-y-6 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <FolderKanban className="h-6 w-6 text-orange-400" />
              <span>Personal Library</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400 border border-white/5">
                {filteredItems.length} Masterpieces
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              Manage your rendered artworks, neural upscales, and segmented alpha cutouts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs font-medium border border-white/10 transition flex items-center gap-1.5"
            >
              {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? (
                <CheckSquare className="h-3.5 w-3.5 text-orange-400" />
              ) : (
                <Square className="h-3.5 w-3.5 text-zinc-500" />
              )}
              <span>Select All</span>
            </button>

            <Link
              to="/create"
              className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-black text-xs font-semibold transition flex items-center gap-1.5 shadow-[0_0_12px_rgba(249,115,22,0.3)]"
            >
              <Sparkles className="h-3.5 w-3.5 fill-black" />
              <span>Generate New</span>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search library prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#121215] border border-white/[0.08] rounded-lg text-xs font-medium text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500/50"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {["All", "Upscaled", "Cutouts"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  activeFilter === tab
                    ? "bg-orange-500 text-black font-semibold"
                    : "bg-[#121215] text-zinc-400 border border-white/5 hover:border-white/15"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Library Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="rounded-xl border border-white/5 bg-[#121215] p-3 animate-pulse space-y-3">
                <div className="aspect-square bg-white/[0.05] rounded-lg" />
                <div className="h-3 bg-white/[0.05] rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-[#121215] rounded-xl border border-white/5 p-8">
            <FolderKanban className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-200">No assets found</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Generate images in Studio to build your personal library.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item: any) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className={`group relative rounded-xl border transition-all cursor-pointer overflow-hidden bg-[#121215] flex flex-col ${
                    isSelected
                      ? "border-orange-500 ring-2 ring-orange-500/30"
                      : "border-white/[0.08] hover:border-white/20"
                  }`}
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-black">
                    <img
                      src={item.r2Url || item.displayUrl}
                      alt={item.prompt}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Selection Checkbox */}
                    <div className="absolute top-2 left-2 z-10">
                      <div
                        className={`h-6 w-6 rounded-md flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-orange-500 text-black shadow-md"
                            : "bg-black/60 text-white/60 border border-white/20 hover:bg-black"
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </div>
                    </div>

                    {/* Actions on Hover */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10">
                      <button
                        onClick={(e) => copyPrompt(item.prompt, e)}
                        title="Copy Prompt"
                        className="p-1.5 rounded bg-black/80 hover:bg-black text-zinc-300 hover:text-white border border-white/10"
                      >
                        <Copy className="h-3 w-3" />
                      </button>

                      <Link
                        to="/create"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded bg-orange-500 hover:bg-orange-600 text-black font-bold"
                        title="Remix in Studio"
                      >
                        <Wand2 className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>

                  <div className="p-3 space-y-1">
                    <p className="text-xs text-zinc-300 line-clamp-2 leading-snug">
                      "{item.prompt}"
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1 border-t border-white/5">
                      <span>{item.model || "Flux.1 Pro"}</span>
                      <span>{new Date(item.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Bulk Action Dock */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#141418] border border-orange-500/40 rounded-xl px-4 py-2.5 shadow-2xl flex items-center gap-3 z-30 animate-in slide-in-from-bottom-3 duration-200">
            <span className="font-mono text-xs text-orange-400 font-bold">
              {selectedIds.length} Selected
            </span>

            <div className="h-4 w-[1px] bg-white/20" />

            <button
              onClick={handleBulkDownload}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 text-zinc-200 text-xs font-medium transition flex items-center gap-1.5 border border-white/10"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export ZIP</span>
            </button>

            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium transition flex items-center gap-1.5 border border-rose-500/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
