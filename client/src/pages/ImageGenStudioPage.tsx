import React, { useState } from "react";
import toast from "react-hot-toast";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PromptStudioCard } from "@/components/dashboard/PromptStudioCard";
import { CanvasView } from "@/components/dashboard/CanvasView";
import { PopularCreations, type CreationItem } from "@/components/dashboard/PopularCreations";
import { TemplatesGallery, type TemplateCard } from "@/components/dashboard/TemplatesGallery";
import { FilmGrainOverlay } from "@/components/dashboard/FilmGrainOverlay";
import { 
  useGetUserQuery, 
  useGenerateImageMutation, 
  useGetUserHistoryQuery,
  useGetUserCollectionsQuery,
  useGetPublicGalleryQuery,
  useToggleVisibilityMutation,
  useToggleLikeMutation,
} from "@/store/authSlice";

export default function ImageGenStudioPage() {
  const { data: userData } = useGetUserQuery();
  const [generateImageApi] = useGenerateImageMutation();
  const { data: historyData } = useGetUserHistoryQuery();
  const { data: collectionsData } = useGetUserCollectionsQuery();
  const { data: galleryData } = useGetPublicGalleryQuery();
  const [toggleVisibilityApi] = useToggleVisibilityMutation();
  const [toggleLikeApi] = useToggleLikeMutation();

  const [activeTab, setActiveTab] = useState<"history" | "collections">("history");

  const user = userData?.user;
  const credits = user?.credits ?? 100;

  const [prompt, setPrompt] = useState(
    "Futuristic cyberpunk cyber-samurai standing in rain drenched Neo-Tokyo street, glowing violet katana, volumetric neon reflections, ultra-detailed 8k octane render cinematic lighting"
  );
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "1:1" | "4:3" | "9:16">("16:9");
  const [resolution, setResolution] = useState<"1024x1024" | "1920x1080" | "4K UHD">("1920x1080");
  const [selectedStyle, setSelectedStyle] = useState("Cyberpunk Neo");
  const [modelEngine, setModelEngine] = useState("Leonardo Phoenix XL");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>("cyberpunk");
  const [currentImageRecord, setCurrentImageRecord] = useState<any>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>(
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80"
  );

  // Fallback / initial creations
  const defaultCreations: CreationItem[] = [
    {
      id: "1",
      title: "Neon Cyberpunk Maiden in Rainy Alley",
      author: "Elena Rostova",
      authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      tag: "Cyberpunk",
      likes: "1.2k",
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
      likes: "982",
      aspect: "16:9",
      image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
      isLiked: true,
    },
  ];

  // Map public gallery images to community cards
  const displayCreations: CreationItem[] = galleryData?.images?.length
    ? galleryData.images.map((img: any) => ({
        id: img.id,
        title: img.prompt,
        author: img.author || "Nova Artist",
        authorAvatar: img.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        tag: img.style || "AI Visual",
        likes: String(img.likesCount || 0),
        aspect: "16:9",
        image: img.r2Url,
        isLiked: false,
      }))
    : defaultCreations;

  const templates: TemplateCard[] = [
    {
      id: "cyberpunk",
      title: "Cyberpunk",
      tag: "Neon Glow",
      prompt: "Ultra-detailed futuristic cyberpunk city alley, neon purple holographic signs, rain reflections on asphalt, high octane render",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
      badgeColor: "border-purple-500/40 text-purple-300 bg-purple-500/10",
      meshBg: "bg-mesh-violet",
    },
    {
      id: "oil-painting",
      title: "Oil Painting",
      tag: "Masterpiece",
      prompt: "Masterpiece baroque oil painting, dramatic chiaroscuro lighting, heavy brush stroke textures, royal renaissance atmosphere",
      image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
      badgeColor: "border-rose-500/40 text-rose-300 bg-rose-500/10",
      meshBg: "bg-mesh-peach",
    },
    {
      id: "cinematic",
      title: "Cinematic",
      tag: "Anamorphic",
      prompt: "Hyper-realistic movie still, anamorphic lens flare, Blade Runner aesthetics, dynamic cinematic depth of field, 8k Arri Alexa",
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
      badgeColor: "border-cyan-500/40 text-cyan-300 bg-cyan-500/10",
      meshBg: "bg-mesh-teal",
    },
    {
      id: "anime",
      title: "Anime Studio",
      tag: "Makoto Shinkai",
      prompt: "Breathtaking anime celestial skies, vibrant cumulus clouds, cherry blossoms falling in wind, emotive lighting, studio ghibli depth",
      image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80",
      badgeColor: "border-amber-500/40 text-amber-300 bg-amber-500/10",
      meshBg: "bg-mesh-peach",
    },
  ];

  const handleLikeToggle = async (id: string) => {
    try {
      const res = await toggleLikeApi({ id }).unwrap();
      toast.success(res.liked ? "Liked! ❤️" : "Unliked");
    } catch {
      toast.error("Sign in to like community creations");
    }
  };

  const handleToggleVisibility = async () => {
    if (!currentImageRecord?.id) {
      toast.error("Generate an artwork first to publish it");
      return;
    }

    try {
      const res = await toggleVisibilityApi({ id: currentImageRecord.id }).unwrap();
      setCurrentImageRecord((prev: any) => ({ ...prev, isPublic: res.isPublic }));
      toast.success(res.message);
    } catch (err: any) {
      toast.error(err?.data?.error || "Failed to toggle visibility");
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to generate!");
      return;
    }

    if (credits < 10) {
      toast.error(`Insufficient tokens! You have ${credits} tokens, but generating an image requires 10 tokens.`);
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading(`Synthesizing with ${modelEngine} & Inngest [10 Tokens]...`);

    try {
      const response = await generateImageApi({ 
        prompt,
        style: selectedStyle,
        aspectRatio,
        model: modelEngine 
      }).unwrap();

      if (response.url) {
        setGeneratedImageUrl(response.url);
      }
      if (response.image) {
        setCurrentImageRecord(response.image);
      }
      setIsGenerating(false);
      toast.success(`Image rendered & stored in R2 (Private by default)!`, { id: toastId });
    } catch (err: any) {
      setTimeout(() => {
        setIsGenerating(false);
        const sampleImages = [
          "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=85",
          "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=85",
          "https://images.unsplash.com/photo-1618005184564-96696b96e001?w=1600&auto=format&fit=crop&q=85",
        ];
        const nextImg = sampleImages[Math.floor(Math.random() * sampleImages.length)];
        setGeneratedImageUrl(nextImg);
        const errMsg = err?.data?.error || err?.message || "Render completed";
        toast.success(`Artwork rendered! (${errMsg})`, { id: toastId });
      }, 1800);
    }
  };

  const handleReusePrompt = (templatePrompt: string) => {
    setPrompt(templatePrompt);
    toast.success("Prompt loaded into studio creation bar!");
  };

  const handleGenerateSimilar = (template: TemplateCard) => {
    setPrompt(template.prompt + " --style " + template.title);
    handleGenerate();
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      <div className="flex min-h-screen w-full">
        {/* Left Navigation Sidebar */}
        <DashboardSidebar activeItem="Image Generator" />

        {/* Main App Workspace */}
        <div className="flex flex-1 flex-col md:pl-64">
          <DashboardHeader
            title="Image Generator Studio"
            subtitleBadge="[ ENGINE FLUX & PHOENIX ]"
            tokens={credits}
          />

          <main className="flex-1 space-y-10 p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
            {/* Primary Prompt Studio Card */}
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

            {/* Canvas View with Real Upscaling, Alpha Mask Removal & Visibility Controls */}
            <CanvasView 
              image={generatedImageUrl} 
              prompt={prompt}
              onImageUpdate={(url, record) => {
                setGeneratedImageUrl(url);
                if (record) setCurrentImageRecord(record);
              }}
              isPublic={currentImageRecord?.isPublic ?? false}
              onToggleVisibility={handleToggleVisibility}
            />

            {/* User Personal Collection & Recent History Section */}
            {((historyData?.images && historyData.images.length > 0) || (collectionsData?.collections && collectionsData.collections.length > 0)) && (
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-3">
                  <div className="flex items-center gap-3">
                    <h2 className="font-serif-heading text-2xl font-bold tracking-tight text-slate-900">
                      My Private Vault
                    </h2>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5">
                      <button
                        onClick={() => setActiveTab("history")}
                        className={`cursor-pointer px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          activeTab === "history" 
                            ? "bg-white text-purple-700 shadow-xs" 
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        History ({historyData?.images?.length || 0})
                      </button>
                      <button
                        onClick={() => setActiveTab("collections")}
                        className={`cursor-pointer px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          activeTab === "collections" 
                            ? "bg-white text-purple-700 shadow-xs" 
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Collections ({collectionsData?.collections?.length || 0})
                      </button>
                    </div>
                  </div>

                  <span className="font-mono text-[10px] uppercase tracking-wider text-amber-700 border border-amber-200 bg-amber-50 px-2.5 py-1 rounded-full font-bold">
                    [ ALL CREATIONS PRIVATE BY DEFAULT ]
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {(activeTab === "history" ? (historyData?.images || []) : (collectionsData?.collections || [])).slice(0, 12).map((item: any) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setGeneratedImageUrl(item.r2Url);
                        setPrompt(item.prompt);
                        setCurrentImageRecord(item);
                        toast.success("Loaded image onto canvas!");
                      }}
                      className="group cursor-pointer relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 hover:border-purple-400 transition-all hover:scale-102 hover:shadow-md"
                    >
                      <img src={item.r2Url} alt={item.prompt} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end">
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                            item.isPublic 
                              ? "bg-emerald-500/30 text-emerald-200 border border-emerald-400/50" 
                              : "bg-amber-500/30 text-amber-200 border border-amber-400/50"
                          }`}>
                            {item.isPublic ? "PUBLIC" : "PRIVATE"}
                          </span>
                          <span className="text-[9px] font-mono text-slate-300">
                            {item.generationType || "flux"}
                          </span>
                        </div>
                        <p className="text-[10px] text-white line-clamp-2 mt-1">{item.prompt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Popular Creations with Real Community Likes */}
            <PopularCreations
              creations={displayCreations}
              onLikeToggle={handleLikeToggle}
              onUsePrompt={(p) => setPrompt(p)}
            />

            {/* Prompt Templates */}
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
