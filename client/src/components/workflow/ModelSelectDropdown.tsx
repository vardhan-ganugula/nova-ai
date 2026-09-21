import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Check, Sparkles, Coins, Info } from "lucide-react";
import type { AiModelMeta } from "@/constants/aiModels";

interface ModelSelectDropdownProps {
  value: string;
  onChange: (modelName: string) => void;
  models: Record<string, AiModelMeta>;
  placeholder?: string;
  themeColor?: "pink" | "violet" | "cyan" | "emerald";
  label?: string;
}

export const ModelSelectDropdown: React.FC<ModelSelectDropdownProps> = ({
  value,
  onChange,
  models,
  placeholder = "Select AI Model…",
  themeColor = "pink",
  label = "AI Generation Model",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus search input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearch("");
    }
  }, [isOpen]);

  // Find active selected model metadata (matching key or model name)
  const currentModelMeta: AiModelMeta | undefined = useMemo(() => {
    if (models[value]) return models[value];
    const match = Object.entries(models).find(
      ([k, v]) => k.toLowerCase() === value?.toLowerCase() || v.name.toLowerCase() === value?.toLowerCase()
    );
    return match ? match[1] : undefined;
  }, [models, value]);

  // Group models by category
  const categories = useMemo(() => {
    const map = new Map<string, { key: string; meta: AiModelMeta }[]>();
    const query = search.trim().toLowerCase();

    Object.entries(models).forEach(([key, meta]) => {
      const category = meta.category || "General";
      const matchesSearch =
        !query ||
        key.toLowerCase().includes(query) ||
        meta.name.toLowerCase().includes(query) ||
        meta.badge?.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query) ||
        meta.description.toLowerCase().includes(query);

      if (matchesSearch) {
        if (!map.has(category)) {
          map.set(category, []);
        }
        map.get(category)!.push({ key, meta });
      }
    });

    return Array.from(map.entries());
  }, [models, search]);

  const totalFilteredCount = useMemo(() => {
    return categories.reduce((acc, [, items]) => acc + items.length, 0);
  }, [categories]);

  const colorStyles = {
    pink: {
      borderFocus: "focus:border-pink-500",
      activeRing: "border-pink-500 ring-1 ring-pink-500/30",
      badge: "bg-pink-500/15 text-pink-300 border-pink-500/30",
      icon: "text-pink-400",
      itemActive: "bg-pink-500/15 text-pink-200 border border-pink-500/30",
      itemHover: "hover:bg-pink-500/10",
      checkIcon: "text-pink-400",
      glow: "hover:border-pink-500/50",
    },
    violet: {
      borderFocus: "focus:border-violet-500",
      activeRing: "border-violet-500 ring-1 ring-violet-500/30",
      badge: "bg-violet-500/15 text-violet-300 border-violet-500/30",
      icon: "text-violet-400",
      itemActive: "bg-violet-500/15 text-violet-200 border border-violet-500/30",
      itemHover: "hover:bg-violet-500/10",
      checkIcon: "text-violet-400",
      glow: "hover:border-violet-500/50",
    },
    cyan: {
      borderFocus: "focus:border-cyan-500",
      activeRing: "border-cyan-500 ring-1 ring-cyan-500/30",
      badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
      icon: "text-cyan-400",
      itemActive: "bg-cyan-500/15 text-cyan-200 border border-cyan-500/30",
      itemHover: "hover:bg-cyan-500/10",
      checkIcon: "text-cyan-400",
      glow: "hover:border-cyan-500/50",
    },
    emerald: {
      borderFocus: "focus:border-emerald-500",
      activeRing: "border-emerald-500 ring-1 ring-emerald-500/30",
      badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      icon: "text-emerald-400",
      itemActive: "bg-emerald-500/15 text-emerald-200 border border-emerald-500/30",
      itemHover: "hover:bg-emerald-500/10",
      checkIcon: "text-emerald-400",
      glow: "hover:border-emerald-500/50",
    },
  }[themeColor];

  return (
    <div className="space-y-1.5" ref={dropdownRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-zinc-300">{label}</label>
          {currentModelMeta && (
            <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
              <Coins className="w-3 h-3 text-amber-400" />
              <span>{currentModelMeta.price} credits</span>
            </span>
          )}
        </div>
      )}

      {/* Selected Box / Toggle Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-[#181820] border rounded-xl px-3.5 py-2.5 text-left text-xs transition flex items-center justify-between gap-2 shadow-sm ${
            isOpen ? colorStyles.activeRing : `border-white/[0.1] ${colorStyles.glow}`
          }`}
        >
          <div className="min-w-0 flex-1 flex items-center gap-2">
            <Sparkles className={`w-3.5 h-3.5 flex-shrink-0 ${colorStyles.icon}`} />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-white truncate">
                {value || placeholder}
              </div>
            </div>
            {currentModelMeta?.badge && (
              <span
                className={`px-1.5 py-0.5 text-[10px] font-mono font-medium rounded border ${colorStyles.badge} flex-shrink-0`}
              >
                {currentModelMeta.badge}
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-zinc-400 transition-transform duration-200 flex-shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1.5 bg-[#14141c] border border-white/[0.12] rounded-xl shadow-2xl backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Search filter input */}
            <div className="p-2 border-b border-white/[0.08] bg-[#1a1a24] flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 ml-1" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search models by name, category, or badge…"
                className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-[10px] text-zinc-400 hover:text-white px-1.5 py-0.5 rounded bg-white/[0.05]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Models list grouped by category */}
            <div className="max-h-64 overflow-y-auto p-1.5 space-y-2 divide-y divide-white/[0.04]">
              {totalFilteredCount === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-500">
                  No AI models matching "{search}"
                </div>
              ) : (
                categories.map(([category, items]) => (
                  <div key={category} className="pt-1.5 first:pt-0">
                    <div className="px-2 py-1 text-[10px] font-semibold text-zinc-400 tracking-wider uppercase">
                      {category}
                    </div>
                    <div className="space-y-0.5 mt-0.5">
                      {items.map(({ key, meta }) => {
                        const isSelected =
                          value === key ||
                          value?.toLowerCase() === key.toLowerCase() ||
                          value?.toLowerCase() === meta.name.toLowerCase();

                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              onChange(key);
                              setIsOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition flex items-center justify-between gap-2 group ${
                              isSelected
                                ? colorStyles.itemActive
                                : `text-zinc-300 ${colorStyles.itemHover} hover:text-white`
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-white truncate">{key}</span>
                                {meta.badge && (
                                  <span className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-white/[0.06] text-zinc-300 border border-white/[0.08] flex-shrink-0">
                                    {meta.badge}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                                {meta.description}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-[10px] text-zinc-400 font-mono">
                                {meta.price}c
                              </span>
                              {isSelected ? (
                                <Check className={`w-3.5 h-3.5 ${colorStyles.checkIcon}`} />
                              ) : (
                                <div className="w-3.5 h-3.5" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Model Description Box */}
      {currentModelMeta && (
        <div className="p-2.5 rounded-lg bg-[#14141c] border border-white/[0.06] text-[11px] text-zinc-400 flex items-start gap-2 leading-relaxed">
          <Info className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="text-zinc-300 font-medium">{currentModelMeta.description}</span>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500 font-mono">
              <span>Endpoint: {currentModelMeta.name}</span>
              {currentModelMeta.maxTokens && (
                <>
                  <span>•</span>
                  <span>Context: {currentModelMeta.maxTokens.toLocaleString()} tokens</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ModelSelectDropdown;
