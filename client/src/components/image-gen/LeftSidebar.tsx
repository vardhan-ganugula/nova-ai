import React from "react";
import { Sparkles, Sliders, Layers, ChevronDown, Wand2 } from "lucide-react";
import { useAppSelector } from "@/store";

export interface GenParameters {
  aspectRatio: string;
  guidanceScale: number;
  samplingSteps: number;
  seed: string;
  sampler: string;
}

interface LeftSidebarProps {
  prompt: string;
  setPrompt: (val: string) => void;
  negativePrompt: string;
  setNegativePrompt: (val: string) => void;
  selectedModel: string;
  setSelectedModel: (val: string) => void;
  params: GenParameters;
  setParams: React.Dispatch<React.SetStateAction<GenParameters>>;
  isGenerating: boolean;
  onGenerate: () => void;
}

const MODELS = [
  {
    id: "flux-1-pro",
    name: "Flux.1 Pro",
    badge: "Fast & Sharp",
    desc: "State of the art detail and text rendering",
    version: "v1.4",
  },
  {
    id: "sdxl-turbo",
    name: "SDXL Lightning",
    badge: "Realtime",
    desc: "Sub-second 4-step generation engine",
    version: "v2.1",
  },
  {
    id: "cyber-anime-v4",
    name: "CyberAnime Engine",
    badge: "Stylized",
    desc: "Vibrant cel-shading & luminous volumetric glows",
    version: "v4.0",
  },
  {
    id: "photoreal-cine",
    name: "HyperCine 8K",
    badge: "Photoreal",
    desc: "Anamorphic bokeh & rich dynamic range",
    version: "v3.2",
  },
];

const SAMPLERS = [
  "DPM++ 2M Karras",
  "Euler a",
  "DPM++ SDE Karras",
  "DDIM",
];

const ASPECT_RATIOS = [
  { label: "1:1", ratio: "1:1", icon: "square" },
  { label: "16:9", ratio: "16:9", icon: "wide" },
  { label: "9:16", ratio: "9:16", icon: "tall" },
  { label: "4:3", ratio: "4:3", icon: "standard" },
];

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  prompt,
  setPrompt,
  negativePrompt,
  setNegativePrompt,
  selectedModel,
  setSelectedModel,
  params,
  setParams,
  isGenerating,
  onGenerate,
}) => {
  const imageModels = useAppSelector((state) => state.models.imageModels);
  const activeModelPrice = imageModels[selectedModel]?.price ?? 10;
  return (
    <aside className="w-80 sm:w-96 flex-shrink-0 h-full border-r border-white/10 bg-[#141417] flex flex-col z-20 select-none">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#FF7A00]/10 border border-[#FF7A00]/30 flex items-center justify-center text-[#FF7A00]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide">Studio Engine</h2>
            <p className="text-[11px] text-zinc-400">Prompt & Inference Controls</p>
          </div>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/20">
          PRO
        </span>
      </div>

      {/* Scrollable Configuration Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar text-xs">
        {/* Main Prompt */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-zinc-200 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
              Positive Prompt
            </label>
            <button
              onClick={() =>
                setPrompt(
                  "Futuristic cybernetic operative on rooftop overlooking neon-lit metropolis, rain reflections, volumetric dust motes, cinematic 8k octane render"
                )
              }
              className="text-[10px] text-[#FF7A00] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Wand2 className="w-3 h-3" /> Surprise me
            </button>
          </div>
          <div className="relative rounded-xl border border-white/10 bg-[#18181B] focus-within:border-[#FF7A00]/60 transition-all">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to synthesize in rich detail..."
              className="w-full bg-transparent p-3 text-xs text-white placeholder-zinc-500 focus:outline-none resize-none leading-relaxed"
            />
            <div className="px-3 pb-2 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
              <span>Chars: {prompt.length}</span>
              <span>Tokens ~ {Math.ceil(prompt.length / 4)}</span>
            </div>
          </div>
        </div>

        {/* Negative Prompt */}
        <div className="space-y-1.5">
          <label className="text-zinc-300 font-medium flex items-center justify-between">
            <span>Negative Prompt</span>
            <span className="text-[10px] text-zinc-500">Excluded artifacts</span>
          </label>
          <input
            type="text"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="blurry, distorted anatomy, low quality, noise..."
            className="w-full bg-[#18181B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF7A00]/50 transition-all"
          />
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <label className="text-zinc-200 font-medium flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#FF7A00]" />
            Inference Model
          </label>
          <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
            {Object.entries(imageModels).map(([key, model]) => {
              const isSelected = selectedModel === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedModel(key)}
                  className={`relative p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#FF7A00]/10 border-[#FF7A00] shadow-[0_0_15px_rgba(255,122,0,0.15)]"
                      : "bg-[#18181B] border-white/5 hover:border-white/20 hover:bg-[#1E1E22]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      {key}
                      {model.version && (
                        <span className="text-[10px] font-mono text-zinc-400">({model.version})</span>
                      )}
                    </span>
                    <div className="flex items-center gap-1">
                      {model.badge && (
                        <span
                          className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                            isSelected
                              ? "bg-[#FF7A00] text-black font-bold"
                              : "bg-white/5 text-zinc-400"
                          }`}
                        >
                          {model.badge}
                        </span>
                      )}
                      <span className="text-[9px] font-mono text-zinc-500 font-semibold">
                        {model.price}T
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug line-clamp-1">{model.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Parameter Sliders */}
        <div className="space-y-4 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-zinc-200 font-medium flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#FF7A00]" />
              Parameters
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">Fine-Tuning</span>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-zinc-400 text-[11px]">
              <span>Aspect Ratio</span>
              <span className="text-white font-mono">{params.aspectRatio}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {ASPECT_RATIOS.map((item) => (
                <button
                  key={item.ratio}
                  type="button"
                  onClick={() => setParams((p) => ({ ...p, aspectRatio: item.ratio }))}
                  className={`py-1.5 px-2 rounded-lg text-center font-mono text-[11px] transition cursor-pointer ${
                    params.aspectRatio === item.ratio
                      ? "bg-[#FF7A00] text-black font-bold"
                      : "bg-[#18181B] text-zinc-300 border border-white/5 hover:border-white/20"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Guidance Scale (CFG) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-zinc-400 text-[11px]">
              <span>Guidance Scale (CFG)</span>
              <span className="text-white font-mono">{params.guidanceScale.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={params.guidanceScale}
              onChange={(e) =>
                setParams((p) => ({ ...p, guidanceScale: parseFloat(e.target.value) }))
              }
              className="w-full accent-[#FF7A00] bg-zinc-800 rounded-lg cursor-pointer h-1.5"
            />
          </div>

          {/* Sampling Steps */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-zinc-400 text-[11px]">
              <span>Sampling Steps</span>
              <span className="text-white font-mono">{params.samplingSteps}</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="1"
              value={params.samplingSteps}
              onChange={(e) =>
                setParams((p) => ({ ...p, samplingSteps: parseInt(e.target.value, 10) }))
              }
              className="w-full accent-[#FF7A00] bg-zinc-800 rounded-lg cursor-pointer h-1.5"
            />
          </div>

          {/* Sampler Selector */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 text-[11px]">Sampler</label>
            <div className="relative">
              <select
                value={params.sampler}
                onChange={(e) => setParams((p) => ({ ...p, sampler: e.target.value }))}
                className="w-full bg-[#18181B] border border-white/10 rounded-lg px-3 py-2 text-white appearance-none text-xs focus:outline-none focus:border-[#FF7A00]/50 cursor-pointer"
              >
                {SAMPLERS.map((s) => (
                  <option key={s} value={s} className="bg-[#18181B] text-white">
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Generate Action Button Footer */}
      <div className="p-4 border-t border-white/10 bg-[#111114]">
        <button
          onClick={onGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9E3D] hover:brightness-110 text-black font-semibold text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,122,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Synthesizing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-black text-black" />
              <span>Generate Art ({activeModelPrice} Tokens)</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
