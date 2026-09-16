import React, { useState } from "react";
import {
  Sparkles,
  Sliders,
  Layers,
  ChevronDown,
  Wand2,
  Dice5,
  ChevronUp,
  Info,
  Ratio,
} from "lucide-react";
import { useAppSelector } from "@/store";

export interface GenParameters {
  aspectRatio: string;
  guidanceScale: number;
  samplingSteps: number;
  seed: string;
  sampler: string;
}

interface GenerationPanelProps {
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
  selectedStyle?: string;
  setSelectedStyle?: (val: string) => void;
}

const ASPECT_RATIOS = [
  { label: "1:1", ratio: "1:1", desc: "Square" },
  { label: "16:9", ratio: "16:9", desc: "Landscape" },
  { label: "9:16", ratio: "9:16", desc: "Portrait" },
  { label: "4:3", ratio: "4:3", desc: "Classic" },
  { label: "21:9", ratio: "21:9", desc: "Cinematic" },
];

const SAMPLERS = [
  "DPM++ 2M Karras",
  "Euler a",
  "DPM++ SDE Karras",
  "DDIM",
  "UniPC",
];

const STYLES = [
  { id: "None", name: "None" },
  { id: "Cinematic", name: "Cinematic" },
  { id: "Photorealistic", name: "Photoreal" },
  { id: "Cyberpunk", name: "Cyberpunk" },
  { id: "Anime", name: "Anime" },
  { id: "Concept Art", name: "Concept" },
  { id: "3D Render", name: "3D Render" },
];

const PROMPT_SUGGESTIONS = [
  "Ethereal crystal celestial guardian in nebula clouds, ultra-detailed raytracing, cinematic lighting, 8k octane render",
  "Neo-Tokyo cybernetic samurai walking through rain-slick neon alley, reflections, anamorphic lens flare",
  "Hyper-realistic portrait of an android geisha with translucent porcelain plates and golden wiring, Hasselblad 80mm",
  "Bioluminescent ancient underwater ruins overgrown with glowing coral, volumetric sun rays through crystal ocean",
];

export const GenerationPanel: React.FC<GenerationPanelProps> = ({
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
  selectedStyle = "None",
  setSelectedStyle,
}) => {
  const imageModels = useAppSelector((state) => state.models.imageModels);
  const activeModel = imageModels[selectedModel];
  const activePrice = activeModel?.price ?? 10;

  const [showNegative, setShowNegative] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleRandomizePrompt = () => {
    const random =
      PROMPT_SUGGESTIONS[Math.floor(Math.random() * PROMPT_SUGGESTIONS.length)];
    setPrompt(random);
  };

  const handleRandomizeSeed = () => {
    const randomSeed = Math.floor(Math.random() * 1000000000).toString();
    setParams((p) => ({ ...p, seed: randomSeed }));
  };

  return (
    <aside className="w-80 lg:w-96 flex-shrink-0 h-full border-r border-white/[0.08] bg-[#0c0c0e] flex flex-col z-20 select-none">
      {/* Panel Header */}
      <div className="h-12 px-4 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-orange-400" />
          <h2 className="text-xs font-semibold tracking-wide text-zinc-100 uppercase">
            Generation Controls
          </h2>
        </div>
        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400 border border-white/10">
          STABLE DIFFUSION
        </span>
      </div>

      {/* Scrollable controls */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
        {/* Prompt Input Area */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-zinc-200 font-medium flex items-center gap-1">
              Prompt
            </label>
            <button
              type="button"
              onClick={handleRandomizePrompt}
              className="text-[11px] text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
            >
              <Wand2 className="h-3 w-3" />
              <span>Surprise me</span>
            </button>
          </div>

          <div className="relative rounded-lg border border-white/10 bg-[#121215] focus-within:border-orange-500/50 transition-colors">
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your imagination in rich sensory detail..."
              className="w-full bg-transparent p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none leading-relaxed"
            />
            <div className="px-3 pb-2 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
              <span>{prompt.length} chars</span>
              <span>~{Math.ceil(prompt.length / 4)} tokens</span>
            </div>
          </div>
        </div>

        {/* Negative Prompt (Collapsible) */}
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => setShowNegative(!showNegative)}
            className="w-full flex items-center justify-between text-zinc-400 hover:text-zinc-200 py-1"
          >
            <span className="font-medium text-xs">Negative Prompt</span>
            <span className="text-[11px] text-zinc-500 flex items-center gap-1">
              {showNegative ? "Hide" : "Show"}
              {showNegative ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </span>
          </button>

          {showNegative && (
            <input
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="blurry, distorted, low quality, bad anatomy, artifacts..."
              className="w-full bg-[#121215] border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500/50 transition-colors"
            />
          )}
        </div>

        {/* Model Selection */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-zinc-200 font-medium flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-orange-400" />
              Model Architecture
            </label>
            <span className="text-[10px] font-mono text-zinc-500">
              {Object.keys(imageModels).length} Available
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-0.5 custom-scrollbar">
            {Object.entries(imageModels).map(([key, model]) => {
              const isSelected = selectedModel === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedModel(key)}
                  className={`p-2 rounded-lg border text-left transition-all ${isSelected
                    ? "bg-orange-500/10 border-orange-500/40 text-white"
                    : "bg-[#121215] border-white/5 hover:border-white/15 text-zinc-400 hover:text-zinc-200"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-zinc-100 flex items-center gap-1.5">
                      {key}
                      {model.version && (
                        <span className="text-[10px] font-mono text-zinc-500">
                          {model.version}
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {model.badge && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${isSelected
                            ? "bg-orange-500 text-black font-bold"
                            : "bg-white/[0.06] text-zinc-400"
                            }`}
                        >
                          {model.badge}
                        </span>
                      )}
                      <span className="font-mono text-[10px] text-orange-400/80">
                        {model.price}T
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                    {model.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Style / Aesthetic Filter Chips */}
        {setSelectedStyle && (
          <div className="space-y-2">
            <label className="text-zinc-200 font-medium my-1">Aesthetic Preset</label>
            <div className="flex flex-wrap gap-1 pt-2">
              {STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setSelectedStyle(style.id)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${selectedStyle === style.id
                    ? "bg-orange-500 text-black font-semibold"
                    : "bg-[#121215] text-zinc-400 border border-white/5 hover:border-white/15"
                    }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Aspect Ratio */}
        <div className="space-y-1.5 pt-2 border-t border-white/[0.08]">
          <div className="flex justify-between text-zinc-400 text-[11px]">
            <span>Aspect Ratio</span>
            <span className="text-zinc-200 font-mono">{params.aspectRatio}</span>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {ASPECT_RATIOS.map((item) => (
              <button
                key={item.ratio}
                type="button"
                onClick={() => setParams((p) => ({ ...p, aspectRatio: item.ratio }))}
                className={`py-1.5 px-1 rounded text-center font-mono text-[11px] transition ${params.aspectRatio === item.ratio
                  ? "bg-orange-500 text-black font-bold"
                  : "bg-[#121215] text-zinc-400 border border-white/5 hover:border-white/20"
                  }`}
                title={item.desc}
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
            <span className="text-zinc-200 font-mono">
              {params.guidanceScale.toFixed(1)}
            </span>
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
            className="modern-range-slider"
          />
        </div>

        {/* Sampling Steps */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-zinc-400 text-[11px]">
            <span>Sampling Steps</span>
            <span className="text-zinc-200 font-mono">{params.samplingSteps}</span>
          </div>
          <input
            type="range"
            min="10"
            max="60"
            step="1"
            value={params.samplingSteps}
            onChange={(e) =>
              setParams((p) => ({
                ...p,
                samplingSteps: parseInt(e.target.value, 10),
              }))
            }
            className="modern-range-slider"
          />
        </div>

        {/* Advanced Settings (Seed & Sampler) */}
        <div className="space-y-2 pt-2 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-zinc-400 hover:text-zinc-200"
          >
            <span className="font-medium text-xs flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-orange-400" />
              Advanced Parameters
            </span>
            <span className="text-[11px] text-zinc-500 flex items-center gap-1">
              {showAdvanced ? "Collapse" : "Expand"}
              {showAdvanced ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </span>
          </button>

          {showAdvanced && (
            <div className="space-y-3 pt-2">
              {/* Seed */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-[11px]">Seed</span>
                  <button
                    type="button"
                    onClick={handleRandomizeSeed}
                    className="text-[10px] text-orange-400 hover:text-orange-300 flex items-center gap-1"
                  >
                    <Dice5 className="h-3 w-3" /> Randomize
                  </button>
                </div>
                <input
                  type="text"
                  value={params.seed}
                  onChange={(e) => setParams((p) => ({ ...p, seed: e.target.value }))}
                  placeholder="-1 for random"
                  className="w-full bg-[#121215] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-orange-500/50"
                />
              </div>

              {/* Sampler Selector */}
              <div className="space-y-1.5">
                <span className="text-zinc-400 text-[11px]">Sampler Algorithm</span>
                <div className="relative">
                  <select
                    value={params.sampler}
                    onChange={(e) =>
                      setParams((p) => ({ ...p, sampler: e.target.value }))
                    }
                    className="w-full bg-[#121215] border border-white/10 rounded-lg px-3 py-1.5 text-zinc-200 appearance-none text-xs focus:outline-none focus:border-orange-500/50"
                  >
                    {SAMPLERS.map((s) => (
                      <option key={s} value={s} className="bg-[#121215] text-zinc-200">
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Generate Button */}
      <div className="p-3 border-t border-white/[0.08] bg-[#0c0c0e]">
        <button
          onClick={onGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-3 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-black font-semibold text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Synthesizing Diffusion...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 fill-black text-black" />
              <span>Generate ({activePrice} Credits)</span>
            </>
          )}
        </button>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-zinc-500 px-1 font-mono">
          <span>Target: {selectedModel}</span>
          <span className="kbd-shortcut">Ctrl+Enter</span>
        </div>
      </div>
    </aside>
  );
};
