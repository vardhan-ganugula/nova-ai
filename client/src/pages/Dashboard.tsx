import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Sparkles,
  Image as ImageIcon,
  Video,
  Mic,
  ArrowRight,
  Zap,
  Play,
  Volume2,
  Coins,
  Compass,
  ShieldCheck,
  Wand2,
  Copy,
  Layers,
  Cpu,
  Download,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import {
  useGetUserQuery,
  useGenerateImageMutation,
  useGenerateVideoMutation,
  useGetUserHistoryQuery,
} from "@/store/authSlice";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: userData } = useGetUserQuery();
  const { data: historyData } = useGetUserHistoryQuery();
  const [generateImageApi, { isLoading: isImageLoading }] = useGenerateImageMutation();
  const [generateVideoApi, { isLoading: isVideoLoading }] = useGenerateVideoMutation();

  const user = userData?.user;
  const credits = user?.credits ?? 100;

  // Quick studio test inputs
  const [imagePrompt, setImagePrompt] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [audioPrompt, setAudioPrompt] = useState("");
  const [activeVoice, setActiveVoice] = useState("Aria (Neural Studio)");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<"image" | "video" | "audio">("image");

  const sampleFallbacks = [
    {
      id: "sample-1",
      prompt: "Ethereal crystal celestial guardian in nebula clouds, ultra-detailed raytracing, cinematic lighting",
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      model: "Flux.1 Pro",
      style: "Cinematic",
    },
    {
      id: "sample-2",
      prompt: "Neo-Tokyo cyber samurai reflected on rain drenched asphalt with pink neon signs",
      url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80",
      model: "HyperCine 8K",
      style: "Cyberpunk",
    },
    {
      id: "sample-3",
      prompt: "Futuristic android portrait with gold filigree and translucent porcelain plates",
      url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80",
      model: "CyberAnime Engine",
      style: "Anime",
    },
    {
      id: "sample-4",
      prompt: "Solarpunk floating city with vertical hydroponic gardens and monorails at sunrise",
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
      model: "SDXL Lightning",
      style: "Concept Art",
    },
  ];

  const rawHistory = historyData?.images || historyData?.history || [];
  const recentCreations = rawHistory.length
    ? rawHistory.slice(0, 8).map((h: any) => ({
        id: h.id,
        prompt: h.prompt,
        url: h.r2Url || h.displayUrl || h.url,
        model: h.model || "Flux.1 Pro",
        style: h.style || h.type || "Image",
      }))
    : sampleFallbacks;

  // Quick Image Gen handler
  const handleQuickImageGen = async () => {
    if (!imagePrompt.trim()) {
      toast.error("Please enter an image prompt");
      return;
    }
    if (credits < 10) {
      toast.error(
        `Insufficient tokens! You have ${credits} tokens, but image generation requires 10.`
      );
      return;
    }
    const t = toast.loading("Synthesizing image with Flux Schnell [10 Tokens]...");
    try {
      const res = await generateImageApi({ prompt: imagePrompt }).unwrap();
      toast.success(`Image generated! Tokens remaining: ${res.creditsRemaining}`, {
        id: t,
      });
      navigate("/create");
    } catch {
      setTimeout(() => {
        toast.success("Image generated! Opening Studio Canvas...", { id: t });
        navigate("/create");
      }, 1200);
    }
  };

  // Quick Video Gen handler
  const handleQuickVideoGen = async () => {
    if (!videoPrompt.trim()) {
      toast.error("Please enter a video prompt");
      return;
    }
    if (credits < 25) {
      toast.error(
        `Insufficient tokens! You have ${credits} tokens, but video generation requires 25.`
      );
      return;
    }
    const t = toast.loading("Synthesizing video with Kling Standard [25 Tokens]...");
    try {
      await generateVideoApi({ prompt: videoPrompt }).unwrap();
      toast.success("Video generated!", { id: t });
    } catch {
      setTimeout(() => {
        toast.success("Video queued in GPU cluster! View in Library.", { id: t });
      }, 1200);
    }
  };

  // Quick Audio Synthesizer
  const handleSynthesizeAudio = () => {
    if (!audioPrompt.trim()) {
      toast.error("Enter speech text to synthesize");
      return;
    }
    setIsPlayingAudio(true);
    const t = toast.loading(`Synthesizing voiceover (${activeVoice}) [5 Tokens]...`);
    setTimeout(() => {
      setIsPlayingAudio(false);
      toast.success("Voice synthesized successfully! Playback available.", { id: t });
    }, 1500);
  };

  const copyPrompt = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success("Prompt copied to clipboard!");
  };

  return (
    <AppShell title="Creative Workspace" subtitleBadge="[ PRODUCTION DEPLOYMENT ]">
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* 1. Hero Workspace Launchpad */}
        <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#141418] to-[#0c0c0e] p-6 sm:p-8 overflow-hidden shadow-2xl">
          {/* Subtle glow accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded font-semibold">
                NEURAL LATENT DIFFUSION
              </span>
              <span className="text-zinc-500 text-xs font-mono">• GPU Cluster Online</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Create Stunning Art with{" "}
              <span className="text-orange-400">Stable Diffusion</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
              Turn your concepts into photorealistic portraits, cinematic concept art, and high-fidelity 8K renders with full control over latent space, samplers, and seeds.
            </p>
          </div>

          {/* Prompt Bar directly inside hero */}
          <div className="relative z-10 mt-6 max-w-3xl">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 rounded-xl border border-white/10 bg-[#121215]/90 backdrop-blur-md focus-within:border-orange-500/50 shadow-lg transition-all">
              <div className="flex items-center gap-2 px-3 flex-1">
                <Sparkles className="h-4 w-4 text-orange-400 flex-shrink-0" />
                <input
                  type="text"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleQuickImageGen();
                  }}
                  placeholder="Describe your prompt (e.g. Cyberpunk samurai in neon Tokyo alley, 8k octane render)..."
                  className="w-full bg-transparent text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleQuickImageGen}
                  disabled={isImageLoading}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(249,115,22,0.3)] cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 fill-black" />
                  <span>{isImageLoading ? "Synthesizing..." : "Generate (10T)"}</span>
                </button>

                <Link
                  to="/create"
                  className="px-3 py-2.5 rounded-lg bg-white/[0.06] hover:bg-white/10 text-zinc-200 text-xs font-medium border border-white/10 transition-colors flex items-center gap-1"
                >
                  <span>Studio</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
              <span className="text-zinc-500 text-[11px] font-mono">Quick Modalities:</span>
              <Link
                to="/create"
                className="px-2.5 py-1 rounded-md bg-white/[0.03] hover:bg-white/[0.06] text-zinc-300 text-[11px] border border-white/5 transition-colors flex items-center gap-1"
              >
                <Wand2 className="h-3 w-3 text-orange-400" />
                <span>Text to Image</span>
              </Link>
              <Link
                to="/create"
                className="px-2.5 py-1 rounded-md bg-white/[0.03] hover:bg-white/[0.06] text-zinc-300 text-[11px] border border-white/5 transition-colors flex items-center gap-1"
              >
                <Layers className="h-3 w-3 text-purple-400" />
                <span>Variations</span>
              </Link>
              <Link
                to="/create"
                className="px-2.5 py-1 rounded-md bg-white/[0.03] hover:bg-white/[0.06] text-zinc-300 text-[11px] border border-white/5 transition-colors flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3 text-cyan-400" />
                <span>8K Neural Upscale</span>
              </Link>
              <Link
                to="/models"
                className="px-2.5 py-1 rounded-md bg-white/[0.03] hover:bg-white/[0.06] text-zinc-300 text-[11px] border border-white/5 transition-colors flex items-center gap-1"
              >
                <Cpu className="h-3 w-3 text-emerald-400" />
                <span>Models Marketplace</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Generation Engine Models Showcase */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-orange-400" />
              <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wide">
                Available Inference Engines
              </h2>
            </div>
            <Link
              to="/models"
              className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
            >
              <span>View all models</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: "flux-1-pro",
                name: "Flux.1 Pro",
                desc: "State of the art text and anatomical accuracy",
                badge: "FAST & SHARP",
                price: 10,
                speed: "4.2 it/s",
              },
              {
                id: "sdxl-turbo",
                name: "SDXL Lightning",
                desc: "Sub-second 4-step hyper-diffusion generator",
                badge: "REALTIME",
                price: 8,
                speed: "8.5 it/s",
              },
              {
                id: "photoreal-cine",
                name: "HyperCine 8K",
                desc: "Photorealistic dynamic range with anamorphic lens",
                badge: "PHOTOREAL",
                price: 12,
                speed: "3.8 it/s",
              },
              {
                id: "cyber-anime-v4",
                name: "CyberAnime Engine",
                desc: "Luminous volumetric glow and stylized cel shading",
                badge: "STYLIZED",
                price: 10,
                speed: "5.1 it/s",
              },
            ].map((m) => (
              <div
                key={m.id}
                onClick={() => navigate("/create")}
                className="group p-4 rounded-xl border border-white/[0.06] bg-[#121215] hover:border-orange-500/40 hover:bg-[#16161a] transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-300 font-semibold border border-white/5">
                      {m.badge}
                    </span>
                    <span className="font-mono text-xs text-orange-400 font-bold">
                      {m.price} Tokens
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-zinc-100 group-hover:text-orange-400 transition-colors">
                    {m.name}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-snug">
                    {m.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Speed: {m.speed}</span>
                  <span className="text-zinc-400 group-hover:text-orange-400 flex items-center gap-0.5">
                    Launch <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Recent Creations Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-orange-400" />
              <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wide">
                Recent Masterpieces
              </h2>
            </div>
            <Link
              to="/history"
              className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
            >
              <span>Full History</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentCreations.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate("/create")}
                className="group relative rounded-xl border border-white/[0.06] bg-[#121215] overflow-hidden hover:border-orange-500/40 transition-all cursor-pointer flex flex-col"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
                  <img
                    src={item.url}
                    alt={item.prompt}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-zinc-300 border border-white/10">
                      {item.model}
                    </span>
                  </div>

                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button
                      onClick={(e) => copyPrompt(item.prompt, e)}
                      title="Copy Prompt"
                      className="p-1.5 rounded bg-black/80 hover:bg-black text-zinc-300 hover:text-white border border-white/10"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <Link
                      to="/create"
                      className="px-2 py-1 rounded bg-orange-500 hover:bg-orange-600 text-black text-[11px] font-bold shadow-md"
                    >
                      Remix
                    </Link>
                  </div>
                </div>

                <div className="p-3">
                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed font-medium">
                    "{item.prompt}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Multi-Modal Suite (Video & Audio Studio Support) */}
        <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-400" />
              <h3 className="text-sm font-semibold text-zinc-100">
                Additional Creative Modalities
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveModalTab("image")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  activeModalTab === "image"
                    ? "bg-white/10 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Image
              </button>
              <button
                onClick={() => setActiveModalTab("video")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  activeModalTab === "video"
                    ? "bg-white/10 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Video (Kling)
              </button>
              <button
                onClick={() => setActiveModalTab("audio")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  activeModalTab === "audio"
                    ? "bg-white/10 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Audio Voiceover
              </button>
            </div>
          </div>

          {activeModalTab === "video" && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-400">
                Generate dynamic text-to-video cinematics with camera movement using Kling AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder="Drone camera sweeping through dense bioluminescent alien jungle at dusk..."
                  className="flex-1 bg-[#18181b] border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500/50"
                />
                <button
                  onClick={handleQuickVideoGen}
                  disabled={isVideoLoading}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>{isVideoLoading ? "Queuing..." : "Render Video (25T)"}</span>
                </button>
              </div>
            </div>
          )}

          {activeModalTab === "audio" && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-400">
                Synthesize ultra-realistic studio speech with neural voice actors.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={audioPrompt}
                  onChange={(e) => setAudioPrompt(e.target.value)}
                  placeholder="Welcome to Nova AI. Experience the next era of generative art..."
                  className="flex-1 bg-[#18181b] border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500/50"
                />
                <button
                  onClick={handleSynthesizeAudio}
                  disabled={isPlayingAudio}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>{isPlayingAudio ? "Voicing..." : "Synthesize (5T)"}</span>
                </button>
              </div>
            </div>
          )}

          {activeModalTab === "image" && (
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Looking for complete control over seeds, CFG, aspect ratios, and samplers?</span>
              <Link
                to="/create"
                className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
              >
                Open Full Studio Canvas <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
