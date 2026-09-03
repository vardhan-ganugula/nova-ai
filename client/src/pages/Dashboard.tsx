import React, { useState } from "react";
import toast from "react-hot-toast";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PromptStudioCard } from "@/components/dashboard/PromptStudioCard";
import { StudioInspector } from "@/components/dashboard/StudioInspector";
import { PopularCreations, type CreationItem } from "@/components/dashboard/PopularCreations";
import { TemplatesGallery, type TemplateCard } from "@/components/dashboard/TemplatesGallery";

export default function Dashboard() {
  const [prompt, setPrompt] = useState(
    "Futuristic cyberpunk cyber-samurai standing in rain drenched Neo-Tokyo street, glowing violet katana, volumetric neon reflections, ultra-detailed 8k octane render cinematic lighting"
  );
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "1:1" | "4:3">("16:9");
  const [resolution, setResolution] = useState<"1024x1024" | "1920x1080" | "4K UHD">("1920x1080");
  const [selectedStyle, setSelectedStyle] = useState("Cyberpunk Neo");
  const [modelEngine, setModelEngine] = useState("Nova Flux Pro v2.4");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>("cyberpunk");

  // Community AI creations data
  const [creations, setCreations] = useState<CreationItem[]>([
    {
      id: "1",
      title: "Neon Cyberpunk Maiden in Rainy Alley",
      author: "Elena Rostova",
      authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      tag: "Cyberpunk",
      likes: 1248,
      aspect: "16:9",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      isLiked: false,
    },
    {
      id: "2",
      title: "Astral Nebula Whale in Deep Cosmos",
      author: "Marcus Vance",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      tag: "Cosmic Sci-Fi",
      likes: 982,
      aspect: "16:9",
      image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
      isLiked: true,
    },
    {
      id: "3",
      title: "Vintage Renaissance Portrait in Oil Paint",
      author: "Sophia Laurent",
      authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      tag: "Oil Painting",
      likes: 854,
      aspect: "16:9",
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80",
      isLiked: false,
    },
    {
      id: "4",
      title: "Cinematic Golden Hour Dune Explorer",
      author: "David Chen",
      authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
      tag: "Cinematic",
      likes: 642,
      aspect: "16:9",
      image: "https://images.unsplash.com/photo-1618005184564-96696b96e001?w=800&auto=format&fit=crop&q=80",
      isLiked: false,
    },
  ]);

  // Prompt Templates Gallery
  const templates: TemplateCard[] = [
    {
      id: "vintage",
      title: "Vintage Retro",
      tag: "Analog 35mm",
      prompt: "1970s retro film photography, aesthetic muted warm grain, Kodak Portra 400, vintage cars and sunset glow, nostalgic vibe",
      image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80",
      badgeColor: "border-amber-500/40 text-amber-700 bg-amber-500/10",
    },
    {
      id: "oil-painting",
      title: "Oil Painting",
      tag: "Masterpiece",
      prompt: "Masterpiece baroque oil painting, dramatic chiaroscuro lighting, heavy brush stroke textures, royal renaissance atmosphere",
      image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
      badgeColor: "border-rose-500/40 text-rose-700 bg-rose-500/10",
    },
    {
      id: "cinematic",
      title: "Cinematic",
      tag: "Anamorphic",
      prompt: "Hyper-realistic movie still, anamorphic lens flare, Blade Runner aesthetics, dynamic cinematic depth of field, 8k Arri Alexa",
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
      badgeColor: "border-cyan-500/40 text-cyan-700 bg-cyan-500/10",
    },
    {
      id: "cyberpunk",
      title: "Cyberpunk",
      tag: "Neon Glow",
      prompt: "Ultra-detailed futuristic cyberpunk city alley, neon purple holographic signs, rain reflections on asphalt, high octane render",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
      badgeColor: "border-purple-500/40 text-purple-700 bg-purple-500/10",
    },
  ];

  const handleLikeToggle = (id: string) => {
    setCreations((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              likes: item.isLiked ? item.likes - 1 : item.likes + 1,
              isLiked: !item.isLiked,
            }
          : item
      )
    );
  };

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to generate!");
      return;
    }
    setIsGenerating(true);
    const toastId = toast.loading("Synthesizing prompt with Nova Neural Flux Engine...");

    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Image generated successfully in 8K UHD!", { id: toastId });
    }, 1800);
  };

  const handleReusePrompt = (templatePrompt: string) => {
    setPrompt(templatePrompt);
    toast.success("Prompt loaded into creation bar!");
  };

  const handleGenerateSimilar = (template: TemplateCard) => {
    setPrompt(template.prompt + " --style " + template.title);
    handleGenerate();
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans antialiased selection:bg-primary/20 selection:text-primary">
      {/* Background Animated Atmosphere matching Landingpage */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          }}
        />
        {/* Floating color ambient blooms */}
        <div className="absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute top-[20%] right-0 h-[480px] w-[480px] rounded-full bg-secondary/20 blur-[150px]" />
        <div className="absolute bottom-10 left-1/3 h-[420px] w-[420px] rounded-full bg-accent/15 blur-[160px]" />
      </div>

      <div className="flex min-h-screen w-full">
        {/* 1. Left Navigation Sidebar Component */}
        <DashboardSidebar activeItem="Image Generator" />

        {/* 2. Main App Workspace */}
        <div className="flex flex-1 flex-col md:pl-64">
          {/* Header Component */}
          <DashboardHeader title="Image Generator" versionBadge="Nova Studio v6.0" />

          {/* Scrollable Workspace Content */}
          <main className="flex-1 space-y-8 p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
            {/* Top Creation Card Component */}
            <PromptStudioCard
              prompt={prompt}
              setPrompt={setPrompt}
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
              resolution={resolution}
              setResolution={setResolution}
              selectedStyle={selectedStyle}
              setSelectedStyle={setSelectedStyle}
              modelEngine={modelEngine}
              setModelEngine={setModelEngine}
              isGenerating={isGenerating}
              onGenerate={handleGenerate}
            />

            {/* Studio Canvas & Generation Feed Inspector Feature */}
            <StudioInspector />

            {/* Popular Creations Component */}
            <PopularCreations
              creations={creations}
              onLikeToggle={handleLikeToggle}
              onUsePrompt={(p) => setPrompt(p)}
            />

            {/* Prompt Templates Gallery Component */}
            <TemplatesGallery
              templates={templates}
              hoveredTemplate={hoveredTemplate}
              setHoveredTemplate={setHoveredTemplate}
              onReusePrompt={handleReusePrompt}
              onGenerateSimilar={handleGenerateSimilar}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
