import React from "react";
import { Sparkles, Wand2, RefreshCw, Zap, ArrowRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";

interface PromptStudioCardProps {
  prompt: string;
  setPrompt: (value: string) => void;
  aspectRatio: "16:9" | "1:1" | "4:3";
  setAspectRatio: (value: "16:9" | "1:1" | "4:3") => void;
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
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-sm backdrop-blur-xl">
      {/* Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-secondary/30 blur-[90px]" />

      {/* Prompt Input Bar */}
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20">
              <Wand2 className="h-3 w-3" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Nova Prompt Studio
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono text-[11px]">Engine:</span>
            <Select value={modelEngine} onValueChange={setModelEngine}>
              <SelectTrigger className="h-8 w-[205px] rounded-xl border-border bg-card text-xs font-medium shadow-sm hover:border-primary/40">
                <SelectValue placeholder="Select engine" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border bg-card/95 backdrop-blur-xl">
                <SelectItem value="Nova Flux Pro v2.4">Nova Flux Pro v2.4 (Ultra)</SelectItem>
                <SelectItem value="SDXL Turbo v3.0">SDXL Turbo v3.0</SelectItem>
                <SelectItem value="Midjourney API v6.1">Midjourney Core v6.1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Text Input Container with Action Button */}
        <div className="relative flex flex-col md:flex-row items-stretch md:items-center rounded-2xl border border-border bg-muted/30 p-2 transition-all focus-within:border-primary/50 focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/20 shadow-inner">
          <div className="flex flex-1 items-center px-3 py-2">
            <Sparkles className="h-5 w-5 text-primary mr-3 flex-shrink-0 animate-pulse" />
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to imagine with high resolution details..."
              className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none leading-relaxed font-sans"
            />
          </div>

          {/* Vibrant Neon Purple-to-Blue Gradient Generate Button */}
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-primary px-8 py-4 font-semibold text-white shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 md:self-stretch"
          >
            {/* Light Sheen Sweep */}
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
                <span className="text-sm font-bold tracking-wide">Synthesizing...</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 text-amber-300 group-hover:animate-bounce" />
                <span className="text-sm font-bold tracking-wide">Generate 8K</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>

        {/* Parameter Controls Underneath */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border">
          {/* Aspect Ratio Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Aspect Ratio:</span>
            <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1">
              {(["16:9", "1:1", "4:3"] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                    aspectRatio === ratio
                      ? "bg-card text-foreground border border-border shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Resolution Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Resolution:</span>
            <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1">
              {(["1024x1024", "1920x1080", "4K UHD"] as const).map((res) => (
                <button
                  key={res}
                  onClick={() => setResolution(res)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                    resolution === res
                      ? "bg-card text-foreground border border-border shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          {/* Style Dropdown using shadcn Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Style:</span>
            <Select value={selectedStyle} onValueChange={setSelectedStyle}>
              <SelectTrigger className="h-8 w-[190px] rounded-xl border-border bg-card text-xs font-medium shadow-sm hover:border-primary/40">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border bg-card/95 backdrop-blur-xl">
                <SelectItem value="Cyberpunk Neo">Cyberpunk Neo</SelectItem>
                <SelectItem value="Cinematic Photoreal">Cinematic Photoreal</SelectItem>
                <SelectItem value="Baroque Oil Painting">Baroque Oil Painting</SelectItem>
                <SelectItem value="Vintage 35mm Film">Vintage 35mm Film</SelectItem>
                <SelectItem value="Anime Pastel Studio">Anime Pastel Studio</SelectItem>
                <SelectItem value="Isometric 3D Octane">Isometric 3D Octane</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Actions (Clear / Seed) */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => {
                setPrompt("");
                toast.success("Prompt cleared");
              }}
              className="rounded-lg px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              Clear
            </button>
            <button
              onClick={() => {
                const seed = Math.floor(Math.random() * 9999999);
                toast.success(`Random Seed #${seed} applied`);
              }}
              className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:border-primary/40 transition-all shadow-sm"
            >
              <RefreshCw className="h-3 w-3 text-primary" /> Random Seed
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
