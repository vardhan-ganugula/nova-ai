import React, { useState } from "react";
import {
  Sparkles,
  Download,
  Copy,
  Maximize2,
  Sliders,
  Check,
  Zap,
  ExternalLink,
  Layers,
  History,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";

interface RecentJob {
  id: string;
  prompt: string;
  engine: string;
  resolution: string;
  ratio: string;
  timestamp: string;
  image: string;
  seed: number;
}

export function StudioInspector() {
  const [activeTab, setActiveTab] = useState<"preview" | "history">("preview");
  const [cfgScale, setCfgScale] = useState(7.5);
  const [steps, setSteps] = useState(30);
  const [negativePrompt, setNegativePrompt] = useState(
    "blurry, bad anatomy, deformed limbs, low quality, duplicate, watermark"
  );
  const [selectedJob, setSelectedJob] = useState<RecentJob>({
    id: "job-1",
    prompt:
      "Futuristic cyberpunk cyber-samurai standing in rain drenched Neo-Tokyo street, glowing violet katana, volumetric neon reflections, ultra-detailed 8k octane render cinematic lighting",
    engine: "Vimitron Flux Pro v2.4",
    resolution: "1920x1080",
    ratio: "16:9",
    timestamp: "2 mins ago",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    seed: 4819203,
  });

  const recentJobs: RecentJob[] = [
    {
      id: "job-1",
      prompt:
        "Futuristic cyberpunk cyber-samurai in rain drenched Neo-Tokyo street, glowing violet katana",
      engine: "Vimitron Flux Pro v2.4",
      resolution: "1920x1080",
      ratio: "16:9",
      timestamp: "2 mins ago",
      image:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
      seed: 4819203,
    },
    {
      id: "job-2",
      prompt:
        "Astral Nebula Whale soaring through ethereal cosmic galaxies with starlight dust",
      engine: "Vimitron Flux Pro v2.4",
      resolution: "1024x1024",
      ratio: "1:1",
      timestamp: "18 mins ago",
      image:
        "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
      seed: 9210441,
    },
    {
      id: "job-3",
      prompt: "Golden hour dunes explorer looking towards towering crystal monolith",
      engine: "SDXL Turbo v3.0",
      resolution: "1920x1080",
      ratio: "16:9",
      timestamp: "45 mins ago",
      image:
        "https://images.unsplash.com/photo-1618005184564-96696b96e001?w=600&auto=format&fit=crop&q=80",
      seed: 1449012,
    },
  ];

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-card transition-all">
      {/* Header bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight">
              Studio Canvas & Generation Feed
            </h3>
            <p className="text-xs text-muted-foreground">
              Live viewport inspector with real-time prompt telemetry and sampler parameters
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1">
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
              activeTab === "preview"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3 w-3 text-primary" /> Active Canvas
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
              activeTab === "history"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="h-3 w-3" /> Recent Session Feed ({recentJobs.length})
          </button>
        </div>
      </div>

      {activeTab === "preview" ? (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Main Canvas Viewport */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            <div className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
              <img
                src={selectedJob.image}
                alt={selectedJob.prompt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
              />

              {/* Viewport Floating Info Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md border border-white/20">
                  {selectedJob.engine}
                </span>
                <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-mono text-white/90 backdrop-blur-md border border-white/20">
                  {selectedJob.resolution}
                </span>
              </div>

              {/* Overlay Action Toolbar */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedJob.prompt);
                    toast.success("Prompt copied to clipboard");
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-card/90 px-3 py-1.5 text-xs font-semibold text-foreground backdrop-blur-md border border-border shadow-sm hover:bg-card transition-all"
                >
                  <Copy className="h-3.5 w-3.5 text-primary" /> Copy Prompt
                </button>

                <button
                  onClick={() => toast.success("HD Masterfile downloaded")}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-95 transition-all"
                >
                  <Download className="h-3.5 w-3.5" /> Download 8K
                </button>
              </div>
            </div>

            {/* Prompt Telemetry */}
            <div className="rounded-2xl border border-border bg-muted/30 p-3.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span className="font-semibold uppercase tracking-wider text-[10px] text-primary">
                  Synthesized Prompt
                </span>
                <span className="font-mono text-[11px]">Seed: #{selectedJob.seed}</span>
              </div>
              <p className="text-xs text-foreground leading-relaxed italic">
                "{selectedJob.prompt}"
              </p>
            </div>
          </div>

          {/* Side Sampler Fine-tuning Panel */}
          <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-border bg-muted/20 p-5 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Sliders className="h-4 w-4 text-primary" /> Advanced Sampler Tuning
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Adjust guidance scale and sampling iterations
              </p>
            </div>

            {/* CFG Guidance Scale Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Guidance Scale (CFG):</span>
                <span className="font-mono font-bold text-primary">{cfgScale}</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="0.5"
                value={cfgScale}
                onChange={(e) => setCfgScale(parseFloat(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>1.0 (Creative)</span>
                <span>15.0 (Strict)</span>
              </div>
            </div>

            {/* Sampling Steps Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Sampling Steps:</span>
                <span className="font-mono font-bold text-primary">{steps} steps</span>
              </div>
              <input
                type="range"
                min="15"
                max="50"
                step="1"
                value={steps}
                onChange={(e) => setSteps(parseInt(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>15 (Fast Draft)</span>
                <span>50 (High Precision)</span>
              </div>
            </div>

            {/* Negative Prompt input */}
            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                Negative Prompt Filter
              </span>
              <textarea
                rows={2}
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed shadow-sm"
              />
            </div>

            <button
              onClick={() => toast.success("Sampler parameters synchronized with neural engine")}
              className="w-full rounded-xl border border-border bg-card py-2 text-xs font-semibold text-foreground hover:bg-muted hover:border-primary/40 transition-all shadow-sm"
            >
              Apply Tuned Parameters
            </button>
          </div>
        </div>
      ) : (
        /* History Feed Tab */
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {recentJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => {
                setSelectedJob(job);
                setActiveTab("preview");
                toast.success(`Switched active canvas to Job #${job.seed}`);
              }}
              className="group cursor-pointer rounded-2xl border border-border bg-card overflow-hidden shadow-card hover:shadow-card-hover transition-all hover:border-primary/40"
            >
              <div className="relative aspect-video w-full bg-muted">
                <img
                  src={job.image}
                  alt={job.prompt}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-mono text-white">
                  {job.timestamp}
                </span>
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug">
                  {job.prompt}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/60 pt-2">
                  <span>{job.engine}</span>
                  <span className="font-semibold text-primary group-hover:underline">Inspect →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
