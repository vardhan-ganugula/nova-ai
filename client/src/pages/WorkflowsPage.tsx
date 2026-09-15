import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  Workflow,
  Play,
  Plus,
  RotateCcw,
  Download,
  Share2,
  Sparkles,
  Sliders,
  Layers,
  FileCode,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

interface WorkflowNode {
  id: string;
  title: string;
  type: string;
  badge: string;
  x: number;
  y: number;
  color: string;
  inputs: string[];
  outputs: string[];
  settings: Record<string, string | number>;
}

export default function WorkflowsPage() {
  const [isRunning, setIsRunning] = useState(false);

  const nodes: WorkflowNode[] = [
    {
      id: "node-1",
      title: "CLIP Text Conditioning",
      type: "Prompt Encoder",
      badge: "INPUT",
      x: 40,
      y: 80,
      color: "border-amber-500/40 text-amber-400",
      inputs: [],
      outputs: ["CONDITIONING"],
      settings: {
        "Positive Prompt": "Neo-Tokyo cyber operative in rain...",
        "Negative Prompt": "blurry, low quality, artifacts...",
        "CLIP Skip": 2,
      },
    },
    {
      id: "node-2",
      title: "Empty Latent Image",
      type: "Latent Tensor",
      badge: "INPUT",
      x: 40,
      y: 380,
      color: "border-cyan-500/40 text-cyan-400",
      inputs: [],
      outputs: ["LATENT"],
      settings: {
        Width: 1024,
        Height: 1024,
        BatchSize: 1,
      },
    },
    {
      id: "node-3",
      title: "KSampler (Neural Inference)",
      type: "Diffusion Engine",
      badge: "PROCESSOR",
      x: 420,
      y: 120,
      color: "border-orange-500/50 text-orange-400",
      inputs: ["MODEL", "CONDITIONING", "LATENT"],
      outputs: ["LATENT"],
      settings: {
        Model: "Flux.1 Pro (BFL)",
        Seed: "847291038",
        Steps: 30,
        "CFG Scale": 7.5,
        Sampler: "DPM++ 2M Karras",
      },
    },
    {
      id: "node-4",
      title: "VAE Decode",
      type: "Latent to Pixel",
      badge: "DECODER",
      x: 780,
      y: 120,
      color: "border-purple-500/40 text-purple-400",
      inputs: ["LATENT", "VAE"],
      outputs: ["IMAGE"],
      settings: {
        "VAE Checkpoint": "vae-ft-mse-840000",
      },
    },
    {
      id: "node-5",
      title: "Clarity 8K Super-Resolution",
      type: "Post-Processing",
      badge: "UPSCALER",
      x: 1080,
      y: 120,
      color: "border-emerald-500/40 text-emerald-400",
      inputs: ["IMAGE"],
      outputs: ["IMAGE_OUT"],
      settings: {
        "Scale Factor": "2.0x (3840x2160)",
        Denoise: 0.15,
        Model: "BiRefNet RealESRGAN",
      },
    },
  ];

  const handleRunWorkflow = () => {
    setIsRunning(true);
    const toastId = toast.loading("Executing Node Graph: [CLIP → KSampler → VAE → Upscale]...");
    setTimeout(() => {
      setIsRunning(false);
      toast.success("Workflow executed successfully! Master render sent to Library.", {
        id: toastId,
      });
    }, 2500);
  };

  return (
    <AppShell
      title="Node Workflows"
      subtitleBadge="[ COMPUTATIONAL GRAPH ]"
      noPadding={true}
    >
      <div className="h-[calc(100vh-56px)] w-full flex flex-col bg-[#09090b] relative overflow-hidden select-none">
        {/* Top Control Bar */}
        <div className="h-12 border-b border-white/[0.08] bg-[#0c0c0e] px-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <Workflow className="h-4 w-4 text-orange-400" />
            <span className="text-xs font-semibold text-white">
              Flux Production Pipeline (v2.4)
            </span>
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
              5 NODES CONNECTED
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toast("Graph configuration saved.")}
              className="px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs font-medium border border-white/5 transition"
            >
              Save Graph
            </button>

            <button
              onClick={() => toast("Node added to canvas.")}
              className="px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs font-medium border border-white/5 transition flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              <span>Add Node</span>
            </button>

            <button
              onClick={handleRunWorkflow}
              disabled={isRunning}
              className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-black font-semibold text-xs transition flex items-center gap-1.5 shadow-[0_0_12px_rgba(249,115,22,0.3)] disabled:opacity-50 cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-black" />
              <span>{isRunning ? "Running Pipeline..." : "Execute Graph"}</span>
            </button>
          </div>
        </div>

        {/* Interactive Node Graph Canvas */}
        <div className="flex-1 relative overflow-auto bg-[radial-gradient(#1f1f23_1px,transparent_1px)] [background-size:24px_24px] p-8">
          {/* Subtle SVG Connection Wires between nodes */}
          <svg className="absolute inset-0 w-[1800px] h-[1000px] pointer-events-none z-0">
            {/* Wire 1: CLIP to KSampler */}
            <path
              d="M 360 210 C 390 210, 390 220, 420 220"
              fill="none"
              stroke="#f97316"
              strokeWidth="2.5"
              strokeDasharray="4 2"
              className={isRunning ? "animate-pulse" : ""}
            />
            {/* Wire 2: Latent Image to KSampler */}
            <path
              d="M 360 440 C 390 440, 390 280, 420 280"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
            />
            {/* Wire 3: KSampler to VAE Decode */}
            <path
              d="M 720 220 C 750 220, 750 190, 780 190"
              fill="none"
              stroke="#f97316"
              strokeWidth="2.5"
            />
            {/* Wire 4: VAE Decode to Upscale */}
            <path
              d="M 1020 190 C 1050 190, 1050 190, 1080 190"
              fill="none"
              stroke="#a855f7"
              strokeWidth="2.5"
            />
          </svg>

          {/* Render Nodes */}
          <div className="relative min-w-[1500px] min-h-[700px] z-10">
            {nodes.map((node) => (
              <div
                key={node.id}
                style={{ left: `${node.x}px`, top: `${node.y}px` }}
                className={`absolute w-72 rounded-xl border bg-[#121215]/95 backdrop-blur-md shadow-2xl transition-all hover:shadow-orange-500/10 ${node.color} p-3.5 space-y-3`}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-current" />
                    <h4 className="text-xs font-bold text-white tracking-wide">
                      {node.title}
                    </h4>
                  </div>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-300 font-semibold border border-white/5">
                    {node.badge}
                  </span>
                </div>

                {/* Subtitle / Type */}
                <div className="text-[10px] text-zinc-500 font-mono">
                  Type: {node.type}
                </div>

                {/* Settings list */}
                <div className="space-y-1.5 bg-[#09090b] p-2.5 rounded-lg border border-white/5 text-[11px] font-mono">
                  {Object.entries(node.settings).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-start gap-2">
                      <span className="text-zinc-500 flex-shrink-0">{k}:</span>
                      <span className="text-zinc-200 truncate font-sans text-right">
                        {String(v)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Ports */}
                <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-zinc-400">
                  <div className="space-y-1">
                    {node.inputs.map((inp) => (
                      <div key={inp} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full border border-orange-400 bg-orange-400/30" />
                        <span>{inp}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1 text-right">
                    {node.outputs.map((out) => (
                      <div key={out} className="flex items-center gap-1 justify-end">
                        <span>{out}</span>
                        <span className="w-2 h-2 rounded-full border border-emerald-400 bg-emerald-400/30" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="h-8 border-t border-white/[0.08] bg-[#0c0c0e] px-4 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Graph Engine: Ready
            </span>
            <span>Zoom: 100%</span>
            <span>Active Target: GPU A100 (80GB)</span>
          </div>

          <div className="flex items-center gap-3">
            <span>Estimated Cost: 15 Tokens</span>
            <span>Latency: ~2.4s</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
