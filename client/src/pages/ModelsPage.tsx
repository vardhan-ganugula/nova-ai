import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Cpu,
  Search,
  Sparkles,
  Zap,
  Sliders,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAppDispatch, useAppSelector } from "@/store";
import { setSelectedImageModel } from "@/store/modelsSlice";

export default function ModelsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const imageModels = useAppSelector((state) => state.models.imageModels);
  const selectedModel = useAppSelector((state) => state.models.selectedImageModel);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Text-to-Image", "Photorealism", "Anime & Cel", "Hyper-Fast", "Upscaling"];

  // Merge Redux models with rich metadata
  const modelsCatalog = [
    {
      id: "flux-1-pro",
      name: "Flux.1 Pro",
      version: "v1.4",
      provider: "Black Forest Labs",
      badge: "SOTA DETAIL",
      category: "Text-to-Image",
      price: 10,
      steps: "28-40",
      speed: "4.2 it/s",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      description: "Next-generation 12B parameter flow matching model with premier anatomical fidelity and exceptional prompt adherence.",
      tags: ["Commercial", "Photoreal", "High Resolution"],
    },
    {
      id: "sdxl-turbo",
      name: "SDXL Lightning",
      version: "v2.1",
      provider: "Stability AI / ByteDance",
      badge: "REALTIME",
      category: "Hyper-Fast",
      price: 8,
      steps: "4-8",
      speed: "9.5 it/s",
      image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
      description: "Distilled progressive 4-step diffusion pipeline designed for ultra-low latency real-time generation and rapid prototyping.",
      tags: ["Realtime", "Low Cost", "Fast Iteration"],
    },
    {
      id: "photoreal-cine",
      name: "HyperCine 8K",
      version: "v3.2",
      provider: "Vimitron Labs",
      badge: "PHOTOREAL",
      category: "Photorealism",
      price: 12,
      steps: "35-50",
      speed: "3.5 it/s",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
      description: "Tuned specifically on high dynamic range medium format photography with natural skin textures, bokeh, and volumetric haze.",
      tags: ["Portraiture", "Anamorphic", "Cinematic"],
    },
    {
      id: "cyber-anime-v4",
      name: "CyberAnime Engine",
      version: "v4.0",
      provider: "Vimitron Community",
      badge: "STYLIZED",
      category: "Anime & Cel",
      price: 10,
      steps: "25-35",
      speed: "5.2 it/s",
      image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
      description: "Fine-tuned checkpoint for luminous cyber aesthetics, dynamic action angles, and vibrant Japanese modern animation styles.",
      tags: ["Cel Shading", "Manga", "Illustrative"],
    },
    {
      id: "clarity-upscaler-8k",
      name: "Clarity Neural Upscaler",
      version: "v2.0",
      provider: "Fal AI",
      badge: "SUPER-RES",
      category: "Upscaling",
      price: 5,
      steps: "15",
      speed: "12.0 it/s",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
      description: "Blind super-resolution reconstruction network capable of enhancing micro-textures and removing compression artifacts up to 8K.",
      tags: ["Post-Processing", "Sharpening", "4X Factor"],
    },
  ];

  const filteredModels = modelsCatalog.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      activeCategory === "All" || m.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLaunchModel = (modelId: string) => {
    dispatch(setSelectedImageModel(modelId));
    toast.success(`Selected model: ${modelId}`);
    navigate("/create");
  };

  return (
    <AppShell title="Models Marketplace" subtitleBadge="[ CHECKPOINTS & LORAS ]">
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#16161a] to-[#0c0c0e] p-6 sm:p-8">
          <div className="max-w-2xl space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded font-semibold">
              WEIGHTS & ARCHITECTURES
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Neural Checkpoint Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Explore state-of-the-art diffusion backbones, distilled turbo engines, and curated aesthetic checkpoints. Select any model to launch directly into the Studio Workspace.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search models, tags, providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#121215] border border-white/[0.08] rounded-lg text-xs font-medium text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-orange-500 text-black font-semibold shadow-xs"
                    : "bg-[#121215] text-zinc-400 border border-white/5 hover:border-white/15 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredModels.map((m) => {
            const isCurrentlySelected = selectedModel === m.id;
            return (
              <div
                key={m.id}
                className={`group rounded-xl border transition-all overflow-hidden flex flex-col bg-[#121215] ${
                  isCurrentlySelected
                    ? "border-orange-500/60 ring-1 ring-orange-500/40"
                    : "border-white/[0.08] hover:border-white/20"
                }`}
              >
                {/* Image Banner */}
                <div className="relative h-44 w-full overflow-hidden bg-black">
                  <img
                    src={m.image}
                    alt={m.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-transparent" />

                  {/* Top badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-black/80 text-orange-400 font-bold border border-orange-500/30">
                      {m.badge}
                    </span>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-black/70 text-zinc-300 border border-white/10">
                      {m.version}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-black/80 text-white font-semibold border border-white/15">
                      {m.price} TOKENS
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors">
                          {m.name}
                        </h3>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          by {m.provider}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                      {m.description}
                    </p>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px] font-mono">
                      <div className="p-1.5 rounded bg-white/[0.02] border border-white/5">
                        <span className="text-zinc-500 block text-[9px]">SPEED</span>
                        <span className="text-zinc-200">{m.speed}</span>
                      </div>
                      <div className="p-1.5 rounded bg-white/[0.02] border border-white/5">
                        <span className="text-zinc-500 block text-[9px]">STEPS</span>
                        <span className="text-zinc-200">{m.steps} steps</span>
                      </div>
                    </div>

                    {/* Tag chips */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {m.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.04] text-zinc-400 border border-white/5"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-white/5">
                    <button
                      onClick={() => handleLaunchModel(m.id)}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                        isCurrentlySelected
                          ? "bg-orange-500 text-black shadow-[0_0_12px_rgba(249,115,22,0.3)]"
                          : "bg-white/[0.06] hover:bg-orange-500 hover:text-black text-zinc-200 border border-white/10"
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{isCurrentlySelected ? "Active in Studio" : "Launch in Studio"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
