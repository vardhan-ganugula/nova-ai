import React, { useState } from "react";
// Icon imports removed
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import toast from "react-hot-toast";
import { useAppSelector } from "@/store";

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
  negativePrompt?: string;
  setNegativePrompt?: (value: string) => void;
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
  negativePrompt: controlledNegativePrompt,
  setNegativePrompt: controlledSetNegativePrompt,
}: PromptStudioCardProps) {
  const [alchemyV2, setAlchemyV2] = useState(true);
  const [photoRealMode, setPhotoRealMode] = useState(false);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [samplingSteps, setSamplingSteps] = useState(30);
  const [internalNegativePrompt, setInternalNegativePrompt] = useState(
    "blurry, bad anatomy, lowres, distorted fingers, watermark, cropped"
  );
  const negativePrompt = controlledNegativePrompt !== undefined ? controlledNegativePrompt : internalNegativePrompt;
  const setNegativePrompt = controlledSetNegativePrompt || setInternalNegativePrompt;
  const [guidanceWeight, setGuidanceWeight] = useState(0.65);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const imageModels = useAppSelector((state) => state.models.imageModels);
  const activeModelPrice = imageModels[modelEngine]?.price ?? 10;

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
      className={`relative overflow-hidden rounded-3xl border bg-[#111114] p-6 transition-all duration-300 ${isGenerating
        ? "ring-2 ring-[#FF7A00]/40 border-[#FF7A00]/40"
        : "border-white/[0.07] hover:border-white/[0.12]"
        }`}
    >
      <div className="relative z-20 space-y-5">

        {/* Top Header Row with Model & Style Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#FF7A00] border border-[#FF7A00]/30 bg-[#FF7A00]/10 px-2.5 py-1 rounded-full font-semibold">
              [ 01 STUDIO PROMPT CANVAS ]
            </span>

            {/* Model Selection Dropdown */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-white/40 font-medium">MODEL:</span>
              <Select value={modelEngine} onValueChange={setModelEngine}>
                <SelectTrigger className="h-8.5 min-w-[215px] rounded-xl border-white/[0.08] bg-white/[0.05] text-xs font-semibold text-white/80 hover:border-[#FF7A00]/40 hover:bg-white/[0.08] focus:ring-[#FF7A00]/20">
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent className="max-h-[320px] rounded-xl border border-white/[0.1] bg-[#1A1A1F] text-white shadow-xl">
                  {Object.entries(imageModels).map(([key, model]) => (
                    <SelectItem key={key} value={key} className="cursor-pointer py-2">
                      <div className="flex items-center justify-between gap-3 w-full">
                        <span className="font-medium text-white/80">{key}</span>
                        <div className="flex items-center gap-1.5">
                          {model.badge && (
                            <span className="rounded bg-[#FF7A00]/10 border border-[#FF7A00]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#FF7A00] font-mono">
                              {model.badge}
                            </span>
                          )}
                          <span className="font-mono text-[10px] text-white/30">
                            {model.price}T
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Style Selector */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-white/40 font-medium">STYLE:</span>
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger className="h-8.5 w-[180px] rounded-xl border-white/[0.08] bg-white/[0.05] text-xs font-semibold text-white/80 hover:border-[#FF7A00]/40 hover:bg-white/[0.08] focus:ring-[#FF7A00]/20">
                  <SelectValue placeholder="Preset Style" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-white/[0.1] bg-[#1A1A1F] text-white shadow-xl max-h-80 overflow-y-auto">
                  <SelectGroup>
                    <SelectLabel>Artistic & Illustrated</SelectLabel>
                    <SelectItem value="comic book">Comic Book</SelectItem>
                    <SelectItem value="Anime Pastel Studio">Anime Pastel Studio</SelectItem>
                    <SelectItem value="cartoon">Cartoon / Animation</SelectItem>
                    <SelectItem value="watercolor">Watercolor</SelectItem>
                    <SelectItem value="Baroque Oil Painting">Baroque Oil Painting</SelectItem>
                    <SelectItem value="pencil sketch">Pencil Sketch</SelectItem>
                  </SelectGroup>

                  <SelectSeparator />

                  <SelectGroup>
                    <SelectLabel>Digital & 3D</SelectLabel>
                    <SelectItem value="Isometric 3D Octane">Isometric 3D Octane</SelectItem>
                    <SelectItem value="3d_render">3D Render / CGI</SelectItem>
                    <SelectItem value="Cyberpunk Neo">Cyberpunk Neo</SelectItem>
                  </SelectGroup>

                  <SelectSeparator />

                  <SelectGroup>
                    <SelectLabel>Photographic & Cinema</SelectLabel>
                    <SelectItem value="Cinematic">Cinematic Film</SelectItem>
                    <SelectItem value="Cinematic Photoreal">Cinematic Photoreal</SelectItem>
                    <SelectItem value="Vintage 35mm Film">Vintage 35mm Film</SelectItem>
                    <SelectItem value="Portrait">Studio Portrait</SelectItem>
                    <SelectItem value="Stock Photo">Commercial Stock Photo</SelectItem>
                  </SelectGroup>

                  <SelectSeparator />

                  <SelectGroup>
                    <SelectLabel>Thematic & Concept</SelectLabel>
                    <SelectItem value="fantasy">Epic Fantasy</SelectItem>
                    <SelectItem value="sci-fi">Hard Sci-Fi</SelectItem>
                    <SelectItem value="horror">Gothic Horror</SelectItem>
                    <SelectItem value="Vibrant">Vibrant Pop Art</SelectItem>
                  </SelectGroup>
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
              className={`cursor-pointer flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${alchemyV2
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-xs"
                : "border-white/[0.08] bg-white/[0.04] text-white/40 hover:text-white/70"
                }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${alchemyV2 ? "bg-emerald-400 animate-ping" : "bg-white/20"
                  }`}
              />
              <span>ALCHEMY V2</span>
            </button>

            <button
              onClick={() => {
                setPhotoRealMode(!photoRealMode);
                toast.success(photoRealMode ? "PhotoReal Mode OFF" : "PhotoReal Mode ON");
              }}
              className={`cursor-pointer flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${photoRealMode
                ? "border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-xs"
                : "border-white/[0.08] bg-white/[0.04] text-white/40 hover:text-white/70"
                }`}
            >
              <span>PHOTOREAL</span>
            </button>
          </div>
        </div>

        {/* Main Prompt Field */}
        <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 transition-all focus-within:border-[#FF7A00]/40 focus-within:bg-[#FF7A00]/5 focus-within:ring-2 focus-within:ring-[#FF7A00]/10">
          <div className="flex items-start gap-3 pt-1 pb-12 sm:pb-3">
            
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Envision an artwork, style aesthetic, or detailed scene..."
              className="w-full resize-none bg-transparent font-sans text-sm text-white/80 placeholder:text-white/20 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Magic Enhance Button */}
          <button
            onClick={handleMagicEnhance}
            disabled={isEnhancing}
            title="Expand prompt into rich descriptors"
            className="cursor-pointer absolute bottom-3 right-3 flex items-center gap-2 rounded-xl bg-[#FF7A00]/10 hover:bg-[#FF7A00]/20 border border-[#FF7A00]/30 px-3.5 py-1.5 font-sans text-xs font-semibold text-[#FF7A00] hover:scale-105 active:scale-95 transition-all duration-200"
          >
            
            <span>Magic Enhance</span>
          </button>
        </div>

        {/* Collapsible Accordion: Negative Prompt & Image Guidance */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="advanced-control" className="border-none">
              <AccordionTrigger className="cursor-pointer py-3 font-mono text-[11px] uppercase tracking-wider text-white/40 hover:no-underline">
                <span className="flex items-center gap-2">
                  
                  [ 02 ADVANCED PARAMETERS: NEGATIVE PROMPT & IMAGE GUIDANCE ]
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-2">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 pt-2 border-t border-white/[0.07]">

                  {/* Negative Prompt Input */}
                  <div className="lg:col-span-6 space-y-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-white/30">
                      [ NEGATIVE PROMPT FILTER ]
                    </span>
                    <textarea
                      rows={3}
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="e.g. blurry, deformed, lowres, watermark, cropped..."
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 font-sans text-xs text-white/70 placeholder:text-white/20 focus:border-[#FF7A00]/40 focus:outline-none leading-relaxed transition-all"
                    />
                  </div>

                  {/* Image Guidance Tile */}
                  <div className="lg:col-span-6 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-white/40 flex items-center gap-1.5 font-medium">
                         [ IMAGE GUIDANCE / CONTROLNET ]
                      </span>
                      <span className="font-mono text-[10px] text-[#FF7A00] font-bold">[ {(guidanceWeight * 100).toFixed(0)}% WEIGHT ]</span>
                    </div>

                    <div
                      onClick={() => toast.success("Image Guidance slot active. Select pose or depth reference")}
                      className="group cursor-pointer flex items-center gap-3 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.03] p-2.5 hover:border-[#FF7A00]/40 transition-all"
                    >
                      <div className="relative h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden border border-white/10 bg-white/[0.05]">
                        <img
                          src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=100&auto=format&fit=crop&q=80"
                          alt="Depth Map Preview"
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          
                        </div>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-sans text-xs font-semibold text-white/70 truncate">depth_pose_ref_01.png</span>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-white/30">CLICK TO REPLACE REFERENCE</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between font-mono text-[9px] uppercase text-white/30">
                        <span>[ INFLUENCE STRENGTH ]</span>
                        <span className="bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF7A00] text-[10px] px-2 py-0.5 rounded font-mono font-bold">
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
                        className="w-full accent-[#FF7A00] cursor-pointer"
                      />
                    </div>

                  </div>

                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Parameter Bar: Aspect Ratio & Resolution */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">

            {/* Aspect Ratio Selector Pills */}
            <div className="space-y-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                [ ASPECT RATIO ]
              </span>
              <div className="flex items-center gap-1 rounded-xl border border-white/[0.07] bg-white/[0.04] p-1">
                {(["16:9", "1:1", "4:3", "9:16"] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`cursor-pointer rounded-lg px-3 py-1 font-mono text-[10px] uppercase font-bold transition-all duration-200 hover:scale-105 active:scale-95 ${aspectRatio === ratio
                      ? "bg-[#FF7A00] text-white shadow-[0_0_8px_rgba(255,122,0,0.4)]"
                      : "text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
                      }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution Selector Pills */}
            <div className="space-y-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                [ RESOLUTION ]
              </span>
              <div className="flex items-center gap-1 rounded-xl border border-white/[0.07] bg-white/[0.04] p-1">
                {(["1024x1024", "1920x1080", "4K UHD"] as const).map((res) => (
                  <button
                    key={res}
                    onClick={() => setResolution(res)}
                    className={`cursor-pointer rounded-lg px-3 py-1 font-mono text-[10px] uppercase font-bold transition-all duration-200 hover:scale-105 active:scale-95 ${resolution === res
                      ? "bg-[#FF7A00] text-white shadow-[0_0_8px_rgba(255,122,0,0.4)]"
                      : "text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
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
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                  [ CFG SCALE ]
                </span>
                <span className="bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF7A00] text-xs px-2 py-0.5 rounded-md font-mono font-bold">
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
                className="w-full accent-[#FF7A00] cursor-pointer"
              />
            </div>

            {/* Sampling Steps Counter Slider */}
            <div className="space-y-1.5 min-w-[170px]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                  [ STEPS ]
                </span>
                <span className="bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF7A00] text-xs px-2 py-0.5 rounded-md font-mono font-bold">
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
              
              <span>[ GENERATION COST: {activeModelPrice} TOKENS ]</span>
            </div>

            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="cursor-pointer group relative inline-flex items-center justify-center gap-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 px-8 py-3 font-sans text-xs font-bold text-white shadow-sm hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  
                  <span>Synthesizing Canvas...</span>
                </>
              ) : (
                <>
                  
                  <span>Generate Artwork</span>
                  
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
