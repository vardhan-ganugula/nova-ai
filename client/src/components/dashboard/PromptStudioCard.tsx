import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  SlidersHorizontal,
  Upload,
  Layers,
  Wand2,
  RefreshCw,
  ArrowRight,
  Camera,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import toast from "react-hot-toast";

interface PromptStudioCardProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  aspectRatio: "16:9" | "1:1" | "4:3" | "9:16";
  setAspectRatio: (value: "16:9" | "1:1" | "4:3" | "9:16") => void;
  resolution: "1024x1024" | "1920x1080" | "4K UHD";
  setResolution: (value: "1024x1024" | "1920x1080" | "4K UHD") => void;
  selectedStyle: string;
  setSelectedStyle: (value: string) => void;
  modelEngine: string;
  setModelEngine: (value: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

export function PromptStudioCard({
  prompt,
  setPrompt,
  aspectRatio,
  setAspectRatio,
  resolution,
  setResolution,
  selectedStyle,
  setSelectedStyle,
  modelEngine,
  setModelEngine,
  isGenerating,
  onGenerate,
}: PromptStudioCardProps) {
  const [alchemyV2, setAlchemyV2] = useState(true);
  const [photoRealMode, setPhotoRealMode] = useState(false);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [samplingSteps, setSamplingSteps] = useState(30);
  const [negativePrompt, setNegativePrompt] = useState(
    "blurry, bad anatomy, lowres, distorted fingers, watermark, cropped"
  );
  const [guidanceWeight, setGuidanceWeight] = useState(0.65);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleMagicEnhance = () => {
    setIsEnhancing(true);
    const toastId = toast.loading("Magic Enhancing prompt...");

    setTimeout(() => {
      setIsEnhancing(false);
      const additions = [
        ", 8k resolution, dramatic cinematic lighting, volumetric render, raytracing reflections, tactile textures, octane aesthetic",
        ", fine art chiaroscuro details, award winning composition, moody volumetric shadows, cinematic color grading, 35mm photograph, bokeh depth",
        ", cyberpunk neon rain aesthetic, highly intricate mechanical cybernetic details, synthwave rim lighting, sharp focus",
      ];
      const randomAddition = additions[Math.floor(Math.random() * additions.length)];
      setPrompt((prev) => prev.trim() + randomAddition);
      toast.success("Prompt enriched with high-fidelity descriptors!", { id: toastId });
    }, 900);
  };

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-300 ${
        isGenerating
          ? "ring-2 ring-purple-500/40 border-purple-400"
          : "hover:border-slate-300"
      }`}
    >
      <div className="relative z-20 space-y-5">
        
        {/* Top Header Row with Model & Style Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-purple-700 border border-purple-200 bg-purple-50 px-2.5 py-1 rounded-full font-semibold">
              [ 01 STUDIO PROMPT CANVAS ]
            </span>

            {/* Model Selection Dropdown */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-medium">MODEL:</span>
              <Select value={modelEngine} onValueChange={setModelEngine}>
                <SelectTrigger className="h-8.5 w-[215px] rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-800 shadow-xs hover:border-purple-300 hover:bg-slate-50 focus:ring-purple-500/20">
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-slate-200 bg-white text-slate-800 shadow-xl">
                  <SelectItem value="Leonardo Phoenix XL">Leonardo Phoenix XL</SelectItem>
                  <SelectItem value="Leonardo Lightning XL">Leonardo Lightning XL</SelectItem>
                  <SelectItem value="Leonardo Anime Pastel XL">Leonardo Anime Pastel XL</SelectItem>
                  <SelectItem value="Leonardo Diffusion XL">Leonardo Diffusion XL</SelectItem>
                  <SelectItem value="Flux Pro v2.4">Flux Pro v2.4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Style Selector */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-medium">STYLE:</span>
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger className="h-8.5 w-[180px] rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-800 shadow-xs hover:border-purple-300 hover:bg-slate-50 focus:ring-purple-500/20">
                  <SelectValue placeholder="Preset Style" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-slate-200 bg-white text-slate-800 shadow-xl">
                  <SelectItem value="Cyberpunk Neo">Cyberpunk Neo</SelectItem>
                  <SelectItem value="Cinematic Photoreal">Cinematic Photoreal</SelectItem>
                  <SelectItem value="Baroque Oil Painting">Baroque Oil Painting</SelectItem>
                  <SelectItem value="Vintage 35mm Film">Vintage 35mm Film</SelectItem>
                  <SelectItem value="Anime Pastel Studio">Anime Pastel Studio</SelectItem>
                  <SelectItem value="Isometric 3D Octane">Isometric 3D Octane</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          {/* Mode Toggles: Alchemy v2 & PhotoReal Mode */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setAlchemyV2(!alchemyV2);
                toast.success(alchemyV2 ? "Alchemy v2 disabled" : "Alchemy v2 enabled");
              }}
              className={`cursor-pointer flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
                alchemyV2
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 shadow-xs"
                  : "border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  alchemyV2 ? "bg-emerald-500 animate-ping" : "bg-slate-400"
                }`}
              />
              <span>ALCHEMY V2</span>
            </button>

            <button
              onClick={() => {
                setPhotoRealMode(!photoRealMode);
                toast.success(photoRealMode ? "PhotoReal Mode OFF" : "PhotoReal Mode ON");
              }}
              className={`cursor-pointer flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
                photoRealMode
                  ? "border-rose-300 bg-rose-50 text-rose-700 shadow-xs"
                  : "border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800"
              }`}
            >
              <Camera className="h-3 w-3" />
              <span>PHOTOREAL</span>
            </button>
          </div>
        </div>

        {/* Main Prompt Field */}
        <div className="relative rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition-all focus-within:border-purple-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-500/15">
          <div className="flex items-start gap-3 pt-1 pb-12 sm:pb-3">
            <Sparkles className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Envision an artwork, style aesthetic, or detailed scene..."
              className="w-full resize-none bg-transparent font-sans text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Magic Enhance Button */}
          <button
            onClick={handleMagicEnhance}
            disabled={isEnhancing}
            title="Expand prompt into rich descriptors"
            className="cursor-pointer absolute bottom-3 right-3 flex items-center gap-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3.5 py-1.5 font-sans text-xs font-semibold text-purple-800 shadow-xs hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Sparkles className={`h-3.5 w-3.5 text-purple-600 ${isEnhancing ? "animate-spin" : ""}`} />
            <span>Magic Enhance</span>
          </button>
        </div>

        {/* Collapsible Accordion: Negative Prompt & Image Guidance */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 px-4 shadow-xs">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="advanced-control" className="border-none">
              <AccordionTrigger className="cursor-pointer py-3 font-mono text-[11px] uppercase tracking-wider text-slate-700 hover:no-underline">
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-purple-600" />
                  [ 02 ADVANCED PARAMETERS: NEGATIVE PROMPT & IMAGE GUIDANCE ]
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-2">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 pt-2 border-t border-slate-200">
                  
                  {/* Negative Prompt Input */}
                  <div className="lg:col-span-6 space-y-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                      [ NEGATIVE PROMPT FILTER ]
                    </span>
                    <textarea
                      rows={3}
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="e.g. blurry, deformed, lowres, watermark, cropped..."
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-sans text-xs text-slate-800 placeholder:text-slate-400 focus:border-purple-400 focus:outline-none leading-relaxed shadow-xs transition-all"
                    />
                  </div>

                  {/* Image Guidance Tile */}
                  <div className="lg:col-span-6 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-slate-600 flex items-center gap-1.5 font-medium">
                        <Layers className="h-3 w-3 text-purple-600" /> [ IMAGE GUIDANCE / CONTROLNET ]
                      </span>
                      <span className="font-mono text-[10px] text-purple-700 font-bold">[ {(guidanceWeight * 100).toFixed(0)}% WEIGHT ]</span>
                    </div>

                    <div
                      onClick={() => toast.success("Image Guidance slot active. Select pose or depth reference")}
                      className="group cursor-pointer flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white p-2.5 hover:border-purple-400 transition-all shadow-xs"
                    >
                      <div className="relative h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        <img
                          src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=100&auto=format&fit=crop&q=80"
                          alt="Depth Map Preview"
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-purple-900/10" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Upload className="h-4 w-4 text-white drop-shadow" />
                        </div>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-sans text-xs font-semibold text-slate-800 truncate">depth_pose_ref_01.png</span>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">CLICK TO REPLACE REFERENCE</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between font-mono text-[9px] uppercase text-slate-500">
                        <span>[ INFLUENCE STRENGTH ]</span>
                        <span className="bg-purple-50 border border-purple-200 text-purple-700 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                          {(guidanceWeight * 100).toFixed(0)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={guidanceWeight}
                        onChange={(e) => setGuidanceWeight(parseFloat(e.target.value))}
                        className="w-full accent-purple-600 cursor-pointer"
                      />
                    </div>

                  </div>

                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Parameter Bar: Aspect Ratio & Resolution */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Aspect Ratio Selector Pills */}
            <div className="space-y-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                [ ASPECT RATIO ]
              </span>
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
                {(["16:9", "1:1", "4:3", "9:16"] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`cursor-pointer rounded-lg px-3 py-1 font-mono text-[10px] uppercase font-bold transition-all duration-200 hover:scale-105 active:scale-95 ${
                      aspectRatio === ratio
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution Selector Pills */}
            <div className="space-y-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                [ RESOLUTION ]
              </span>
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
                {(["1024x1024", "1920x1080", "4K UHD"] as const).map((res) => (
                  <button
                    key={res}
                    onClick={() => setResolution(res)}
                    className={`cursor-pointer rounded-lg px-3 py-1 font-mono text-[10px] uppercase font-bold transition-all duration-200 hover:scale-105 active:scale-95 ${
                      resolution === res
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            {/* CFG Guidance Scale Slider */}
            <div className="space-y-1.5 min-w-[170px]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  [ CFG SCALE ]
                </span>
                <span className="bg-purple-50 border border-purple-200 text-purple-700 text-xs px-2 py-0.5 rounded-md font-mono font-bold shadow-xs">
                  {guidanceScale.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={guidanceScale}
                onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            {/* Sampling Steps Counter Slider */}
            <div className="space-y-1.5 min-w-[170px]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  [ STEPS ]
                </span>
                <span className="bg-purple-50 border border-purple-200 text-purple-700 text-xs px-2 py-0.5 rounded-md font-mono font-bold shadow-xs">
                  {samplingSteps}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="150"
                step="1"
                value={samplingSteps}
                onChange={(e) => setSamplingSteps(parseInt(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

          </div>

          {/* Primary CTA Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-purple-700 font-bold">
              <Zap className="h-3.5 w-3.5 fill-purple-600" />
              <span>[ GENERATION COST: 10 TOKENS ]</span>
            </div>

            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="cursor-pointer group relative inline-flex items-center justify-center gap-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 px-8 py-3 font-sans text-xs font-bold text-white shadow-sm hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  <span>Synthesizing Canvas...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>Generate Artwork</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
