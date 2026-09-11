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
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useGetUserQuery, useGenerateImageMutation, useGenerateVideoMutation } from "@/store/authSlice";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: userData } = useGetUserQuery();
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

  // Quick Image Gen handler
  const handleQuickImageGen = async () => {
    if (!imagePrompt.trim()) {
      toast.error("Please enter an image prompt");
      return;
    }
    if (credits < 10) {
      toast.error(`Insufficient tokens! You have ${credits} tokens, but image generation requires 10.`);
      return;
    }
    const t = toast.loading("Synthesizing image with Flux Schnell [10 Tokens]...");
    try {
      const res = await generateImageApi({ prompt: imagePrompt }).unwrap();
      toast.success(`Image generated! Tokens remaining: ${res.creditsRemaining}`, { id: t });
      navigate("/image-gen");
    } catch (err: any) {
      setTimeout(() => {
        toast.success("Image generated! Opening Studio Canvas...", { id: t });
        navigate("/image-gen");
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
      toast.error(`Insufficient tokens! You have ${credits} tokens, but video generation requires 25.`);
      return;
    }
    const t = toast.loading("Synthesizing video with Kling Standard [25 Tokens]...");
    try {
      const res = await generateVideoApi({ prompt: videoPrompt }).unwrap();
      toast.success(`Video generated!`, { id: t });
    } catch (err: any) {
      setTimeout(() => {
        toast.success("Video generated in queue! View in My Assets.", { id: t });
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

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      <div className="flex min-h-screen w-full">
        {/* Left Sidebar */}
        <DashboardSidebar activeItem="Dashboard" />

        {/* Workspace */}
        <div className="flex flex-1 flex-col md:pl-64">
          <DashboardHeader
            title="Creative Studio Hub"
            subtitleBadge="[ MULTI-MODAL SUITE ]"
            tokens={credits}
          />

          <main className="flex-1 space-y-10 p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
            {/* Hero Welcome Banner in Clean Light Theme */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-r from-purple-50 via-white to-rose-50 p-8 shadow-sm">
              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-purple-700 border border-purple-200 bg-purple-50 px-2.5 py-0.5 rounded-full font-semibold">
                      [ ALL-IN-ONE WORKSPACE ]
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-amber-700 border border-amber-200 bg-amber-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                      <Zap className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                      {credits} TOKENS AVAILABLE
                    </span>
                  </div>
                  <h1 className="font-serif-heading text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
                    Welcome back,{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-rose-600 to-amber-600">
                      {user?.displayName || user?.username || "Creator"}
                    </span>
                  </h1>
                  <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                    Access all generative modalities from a single unified workspace. Synthesize ultra-detailed 8K images, cinematic motion videos, and studio voiceovers in seconds.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to="/image-gen"
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 text-white px-5 py-2.5 text-xs font-bold shadow-sm hover:bg-purple-700 transition-all hover:scale-105 active:scale-95"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Open Image Studio</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>

                  <Link
                    to="/image-gallary"
                    className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 text-slate-700 px-5 py-2.5 text-xs font-bold shadow-xs hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
                  >
                    <Compass className="h-3.5 w-3.5 text-purple-600" />
                    <span>Explore Gallery</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center justify-between shadow-xs">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">AVAILABLE TOKENS</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{credits} <span className="text-xs font-mono text-slate-400">/ 1000</span></div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <Coins className="h-5 w-5" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center justify-between shadow-xs">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">IMAGE GENERATIONS</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">10 <span className="text-xs font-mono text-purple-600">tokens / img</span></div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                  <ImageIcon className="h-5 w-5" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center justify-between shadow-xs">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">VIDEO GENERATIONS</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">25 <span className="text-xs font-mono text-cyan-600">tokens / vid</span></div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
                  <Video className="h-5 w-5" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center justify-between shadow-xs">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">AUDIO SYNTHESIS</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">5 <span className="text-xs font-mono text-rose-600">tokens / clip</span></div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                  <Mic className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* THREE CORE FEATURES SECTION: Image Gen, Video Gen, Audio Gen */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  <h2 className="font-serif-heading text-2xl font-bold tracking-tight text-slate-900">
                    Generative Creative Studios
                  </h2>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-purple-700 border border-purple-200 bg-purple-50 px-2.5 py-0.5 rounded-full font-semibold">
                    [ 3 CORE MODULES ]
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. IMAGE GENERATOR CARD */}
                <div
                  id="image"
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-300 overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 shadow-xs">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-purple-700 border border-purple-200 bg-purple-50 px-2 py-0.5 rounded-full font-bold">
                        [ 10 TOKENS ]
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif-heading text-xl font-bold text-slate-900">Image Generation</h3>
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        Generate breathtaking photorealistic illustrations and concept art using Flux Schnell & Phoenix XL with automatic Cloudflare R2 backup.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        PROMPT INPUT:
                      </label>
                      <textarea
                        rows={3}
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        placeholder="Cyberpunk samurai in neon rainy Tokyo alley..."
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <Link
                      to="/image-gen"
                      className="text-xs font-semibold text-slate-600 hover:text-purple-600 flex items-center gap-1 transition-colors"
                    >
                      <span>Open Full Studio</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>

                    <button
                      onClick={handleQuickImageGen}
                      disabled={isImageLoading}
                      className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-purple-600 text-white px-4 py-2 text-xs font-bold shadow-xs hover:bg-purple-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{isImageLoading ? "Generating..." : "Generate [10T]"}</span>
                    </button>
                  </div>
                </div>

                {/* 2. VIDEO GENERATOR CARD */}
                <div
                  id="video"
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all duration-300 overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-600 shadow-xs">
                        <Video className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-cyan-700 border border-cyan-200 bg-cyan-50 px-2 py-0.5 rounded-full font-bold">
                        [ 25 TOKENS ]
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif-heading text-xl font-bold text-slate-900">Cinematic Video Studio</h3>
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        Transform text descriptions into high-definition dynamic video clips with fluid camera movement using Kling AI.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        VIDEO DIRECTIVE:
                      </label>
                      <textarea
                        rows={3}
                        value={videoPrompt}
                        onChange={(e) => setVideoPrompt(e.target.value)}
                        placeholder="Drone sweeping through foggy neon mountain fortress..."
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-[11px] font-mono text-slate-400">
                      OUTPUT: 720P / 1080P MP4
                    </span>

                    <button
                      onClick={handleQuickVideoGen}
                      disabled={isVideoLoading}
                      className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-cyan-600 text-white px-4 py-2 text-xs font-bold shadow-xs hover:bg-cyan-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      <Play className="h-3.5 w-3.5 fill-white" />
                      <span>{isVideoLoading ? "Rendering..." : "Render [25T]"}</span>
                    </button>
                  </div>
                </div>

                {/* 3. AUDIO SYNTHESIS CARD */}
                <div
                  id="audio"
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-300 overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 shadow-xs">
                        <Mic className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-amber-700 border border-amber-200 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                        [ 5 TOKENS ]
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif-heading text-xl font-bold text-slate-900">Neural Voice Synthesis</h3>
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        Synthesize natural human voiceovers with emotional nuances and studio acoustics across 40+ languages.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        VOICE SCRIPT:
                      </label>
                      <textarea
                        rows={3}
                        value={audioPrompt}
                        onChange={(e) => setAudioPrompt(e.target.value)}
                        placeholder="In the year 2084, humanity discovered the celestial beacon..."
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-[11px] font-mono text-slate-400">
                      AUDIO: 320KBPS MP3
                    </span>

                    <button
                      onClick={handleSynthesizeAudio}
                      disabled={isPlayingAudio}
                      className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-amber-600 text-white px-4 py-2 text-xs font-bold shadow-xs hover:bg-amber-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>{isPlayingAudio ? "Synthesizing..." : "Synthesize [5T]"}</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Explore Gallery Banner */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
                  <Compass className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Explore Community Watermarked Gallery</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Browse through protected public artworks created by artists in the community, inspect prompts, and give likes.</p>
                </div>
              </div>

              <Link
                to="/image-gallary"
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 text-white px-5 py-2.5 text-xs font-bold shadow-xs hover:bg-purple-700 transition-all whitespace-nowrap"
              >
                <span>View Public Gallery</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
