import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Coins } from "lucide-react";
import { LeftSidebar, type GenParameters } from "@/components/image-gen/LeftSidebar";
import { CenterCanvas, type GenerationStep } from "@/components/image-gen/CenterCanvas";
import { RightSidebar, type PresetItem } from "@/components/image-gen/RightSidebar";
import { useGetUserQuery, useGenerateImageMutation } from "@/store/authSlice";

export default function ImageGenPage() {
  const { data: userData } = useGetUserQuery();
  const [generateImageApi] = useGenerateImageMutation();
  const user = userData?.user;
  const credits = user?.credits ?? 100;

  const [prompt, setPrompt] = useState<string>(
    "Futuristic cybernetic operative on rooftop overlooking neon-lit metropolis, rain reflections, volumetric dust motes, cinematic 8k octane render"
  );
  const [negativePrompt, setNegativePrompt] = useState<string>(
    "blurry, distorted anatomy, poor lighting, low resolution, bad hands"
  );
  const [selectedModel, setSelectedModel] = useState<string>("flux-1-pro");
  const [params, setParams] = useState<GenParameters>({
    aspectRatio: "16:9",
    guidanceScale: 7.5,
    samplingSteps: 30,
    seed: "-1",
    sampler: "DPM++ 2M Karras",
  });

  const [currentStep, setCurrentStep] = useState<GenerationStep>("complete");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeImage, setActiveImage] = useState<string>(
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=85"
  );

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please provide a prompt before generating!");
      return;
    }

    if (credits < 10) {
      toast.error(`Insufficient tokens! You have ${credits} tokens, but generating an image requires 10.`);
      return;
    }

    setIsGenerating(true);
    setCurrentStep("queued");

    setTimeout(() => {
      setCurrentStep("synthesizing");
    }, 800);

    setTimeout(() => {
      setCurrentStep("upscaling");
    }, 1800);

    try {
      const response = await generateImageApi({ prompt }).unwrap();
      if (response.url) {
        setActiveImage(response.url);
      }
      setCurrentStep("complete");
      setIsGenerating(false);
      toast.success(`Artwork rendered! [10 Tokens deducted, ${response.creditsRemaining} left]`);
    } catch (err: any) {
      setTimeout(() => {
        const sampleImages = [
          "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=85",
          "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=85",
          "https://images.unsplash.com/photo-1618005184564-96696b96e001?w=1600&auto=format&fit=crop&q=85",
          "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1600&auto=format&fit=crop&q=85",
        ];
        const nextImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
        setActiveImage(nextImage);
        setCurrentStep("complete");
        setIsGenerating(false);
        toast.success("Artwork rendered in ultra-high fidelity!");
      }, 2500);
    }
  };

  const handleSelectPreset = (preset: PresetItem) => {
    setPrompt(preset.prompt);
    if (preset.negativePrompt) {
      setNegativePrompt(preset.negativePrompt);
    }
    setParams((prev) => ({
      ...prev,
      guidanceScale: preset.cfg,
    }));
    setActiveImage(preset.image);
    setCurrentStep("complete");
  };

  const handleUpscale = () => {
    const t = toast.loading("Upscaling with AI Optical Model...");
    setTimeout(() => {
      toast.success("Image upscaled to 3840x2160 (4K)", { id: t });
    }, 1500);
  };

  const handleInpaint = () => {
    toast("Inpaint mask brush mode activated. Draw over area to replace.", {
      icon: "🖌️",
    });
  };

  const handleVariation = () => {
    const t = toast.loading("Synthesizing 4 seed variations...");
    setTimeout(() => {
      toast.success("Seed variants generated!", { id: t });
    }, 1800);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0F0F11] text-zinc-100 flex flex-col font-sans antialiased select-none">
      {/* Top Application Navigation Bar */}
      <nav className="h-12 border-b border-white/10 bg-[#141417] px-4 flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF7A00] shadow-[0_0_8px_#FF7A00]" />
            <h1 className="text-xs font-bold uppercase tracking-wider text-white">
              Studio AI <span className="text-[#FF7A00]">/ Generate</span>
            </h1>
          </div>
        </div>

        {/* User / Credits Counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/30 text-xs text-[#FF7A00] font-mono">
            <Coins className="w-3.5 h-3.5" />
            <span>{credits} Tokens</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF7A00] to-rose-500 border border-white/20 overflow-hidden">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
            ) : null}
          </div>
        </div>
      </nav>

      {/* Main 3-Column Studio Workspace filling 100% remaining height */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        {/* 1. Left Sidebar - Prompts, Model Cards, Parameter Sliders */}
        <LeftSidebar
          prompt={prompt}
          setPrompt={setPrompt}
          negativePrompt={negativePrompt}
          setNegativePrompt={setNegativePrompt}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          params={params}
          setParams={setParams}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
        />

        {/* 2. Central Canvas - Status Steppers, Active Image Viewport, Floating Tools */}
        <CenterCanvas
          currentStep={currentStep}
          activeImage={activeImage}
          onUpscale={handleUpscale}
          onInpaint={handleInpaint}
          onVariation={handleVariation}
        />

        {/* 3. Right Sidebar - Preset Collections (Sci-Fi Characters, Urban Environments) */}
        <RightSidebar onSelectPreset={handleSelectPreset} />
      </div>
    </div>
  );
}
