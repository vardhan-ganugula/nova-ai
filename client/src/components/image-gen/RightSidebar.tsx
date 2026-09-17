import React, { useState } from "react";
import { Bookmark, Sparkles, Building2, User, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

export interface PresetItem {
  id: string;
  name: string;
  category: "Sci-Fi Characters" | "Urban Environments";
  tag: string;
  image: string;
  prompt: string;
  negativePrompt?: string;
  cfg: number;
}

const PRESET_COLLECTIONS: PresetItem[] = [
  // Sci-Fi Characters
  {
    id: "char-1",
    name: "Cyber Netrunner Operative",
    category: "Sci-Fi Characters",
    tag: "Augmented",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80",
    prompt:
      "Female cyber netrunner with glowing ocular implants, sleek obsidian tactical bodysuit with fiber-optic wiring, chrome katana, standing in misty neon alley, 8k raytraced render",
    cfg: 7.5,
  },
  {
    id: "char-2",
    name: "Void Mech Vanguard",
    category: "Sci-Fi Characters",
    tag: "Exosuit",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80",
    prompt:
      "Armored space mech pilot in high-tech carbon-fiber suit, gold reflective visor, zero gravity particle aura, cinematic sci-fi concept art, volumetric rim lighting",
    cfg: 8.0,
  },
  {
    id: "char-3",
    name: "Android Geisha Priestess",
    category: "Sci-Fi Characters",
    tag: "Synth",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    prompt:
      "Porcelain synthetic android geisha with holographic origami butterflies circling, gold filigree seams, soft pastel neon halo, ethereal ambient glow",
    cfg: 7.0,
  },

  // Urban Environments
  {
    id: "env-1",
    name: "Neo-Shinjuku Rainscape",
    category: "Urban Environments",
    tag: "Cyber City",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
    prompt:
      "Drenched high-tech Shinjuku avenue at midnight, towering holographic kanji billboards, flying taxi trails, wet asphalt neon reflections, photorealistic 8k octane render",
    cfg: 8.5,
  },
  {
    id: "env-2",
    name: "Solarpunk Sky Citadel",
    category: "Urban Environments",
    tag: "Ecotecture",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80",
    prompt:
      "Lush Solarpunk floating city towers covered in vertical hydroponic gardens, glistening glass domes, clean solar monorails, clear golden sunrise sky",
    cfg: 7.0,
  },
  {
    id: "env-3",
    name: "Underground Dystopian Bazaar",
    category: "Urban Environments",
    tag: "Subterranean",
    image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=80",
    prompt:
      "Deep underground cyberpunk night market, steam vents, tangled fiber cables, flickering crimson neon lantern stalls, atmospheric volumetric fog",
    cfg: 9.0,
  },
];

interface RightSidebarProps {
  onSelectPreset: (preset: PresetItem) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ onSelectPreset }) => {
  const [activeTab, setActiveTab] = useState<"All" | "Sci-Fi Characters" | "Urban Environments">(
    "All"
  );

  const filteredPresets =
    activeTab === "All"
      ? PRESET_COLLECTIONS
      : PRESET_COLLECTIONS.filter((p) => p.category === activeTab);

  return (
    <aside className="w-80 flex-shrink-0 h-full border-l border-white/10 bg-[#141417] flex flex-col z-20 select-none">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 shrink-0 rounded-lg bg-[#FF7A00]/10 border border-[#FF7A00]/30 flex items-center justify-center text-[#FF7A00]">
            <Bookmark className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide">Preset Assets</h2>
            <p className="text-[11px] text-zinc-400">Curated Style Collections</p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-zinc-400">
          {filteredPresets.length} presets
        </span>
      </div>

      {/* Categories Switcher */}
      <div className="px-3 py-2 border-b border-white/10 flex items-center gap-1.5 bg-[#111114]">
        {(["All", "Sci-Fi Characters", "Urban Environments"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`h-8 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center justify-center ${
              activeTab === tab
                ? "bg-[#FF7A00] text-black font-semibold shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab === "Sci-Fi Characters" ? "Characters" : tab === "Urban Environments" ? "Environments" : "All"}
          </button>
        ))}
      </div>

      {/* Preset Cards List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
        {filteredPresets.map((preset) => {
          const isCharacter = preset.category === "Sci-Fi Characters";
          return (
            <div
              key={preset.id}
              onClick={() => {
                onSelectPreset(preset);
                toast.success(`Loaded preset: ${preset.name}`);
              }}
              className="group relative rounded-xl border border-white/10 bg-[#18181B] hover:border-[#FF7A00]/60 hover:bg-[#1E1E23] transition-all cursor-pointer overflow-hidden p-2 flex flex-col gap-2"
            >
              {/* Image thumbnail with hover zoom */}
              <div className="relative h-28 w-full rounded-lg overflow-hidden bg-black">
                <img
                  src={preset.image}
                  alt={preset.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Tag pill */}
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-[10px] text-zinc-300">
                  {isCharacter ? (
                    <User className="w-3 h-3 text-[#FF7A00]" />
                  ) : (
                    <Building2 className="w-3 h-3 text-cyan-400" />
                  )}
                  <span>{preset.tag}</span>
                </div>

                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#FF7A00] text-black text-[10px] font-semibold px-2 py-0.5 rounded">
                  <span>Apply</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>

              {/* Title & Preview info */}
              <div>
                <h3 className="text-xs font-semibold text-white group-hover:text-[#FF7A00] transition-colors">
                  {preset.name}
                </h3>
                <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                  {preset.prompt}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preset Footer Info */}
      <div className="p-3 border-t border-white/10 bg-[#111114] text-center">
        <span className="text-[11px] text-zinc-500 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-[#FF7A00]" /> Click any preset to load prompt & parameters
        </span>
      </div>
    </aside>
  );
};
