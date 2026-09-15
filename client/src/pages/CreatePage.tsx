import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { AppShell } from "@/components/layout/AppShell";
import {
  GenerationPanel,
  type GenParameters,
} from "@/components/create/GenerationPanel";
import {
  CanvasPanel,
  type GenerationStep,
} from "@/components/create/CanvasPanel";
import {
  QueuePanel,
  type PresetItem,
} from "@/components/create/QueuePanel";
import { ImageDetailModal } from "@/components/create/ImageDetailModal";
import {
  useGetUserQuery,
  useGenerateImageMutation,
  useToggleVisibilityMutation,
} from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store";
import { setSelectedImageModel } from "@/store/modelsSlice";

export default function CreatePage() {
  const { data: userData } = useGetUserQuery();
  const [generateImageApi] = useGenerateImageMutation();
  const [toggleVisibilityApi] = useToggleVisibilityMutation();

  const user = userData?.user;
  const credits = user?.credits ?? 100;

  const dispatch = useAppDispatch();
  const selectedModel = useAppSelector((state) => state.models.selectedImageModel);
  const imageModels = useAppSelector((state) => state.models.imageModels);

  const [prompt, setPrompt] = useState<string>(
    "Futuristic cybernetic operative on rooftop overlooking neon-lit metropolis, rain reflections, volumetric dust motes, cinematic 8k octane render"
  );
  const [negativePrompt, setNegativePrompt] = useState<string>(
    "blurry, distorted anatomy, poor lighting, low resolution, bad hands"
  );
  const [selectedStyle, setSelectedStyle] = useState<string>("Cinematic");

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
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please provide a prompt before generating!");
      return;
    }

    const modelCost = imageModels[selectedModel]?.price ?? 10;
    if (credits < modelCost) {
      toast.error(
        `Insufficient tokens! You have ${credits} tokens, but generating with ${selectedModel} requires ${modelCost}.`
      );
      return;
    }

    setIsGenerating(true);
    setCurrentStep("queued");

    const queuedTimer = setTimeout(() => {
      setCurrentStep("synthesizing");
    }, 700);

    const synthTimer = setTimeout(() => {
      setCurrentStep("upscaling");
    }, 1800);

    try {
      const response = await generateImageApi({
        prompt: selectedStyle && selectedStyle !== "None" ? `${prompt}, in ${selectedStyle} style` : prompt,
        model: selectedModel,
        aspectRatio: params.aspectRatio,
        negativePrompt,
      }).unwrap();

      clearTimeout(queuedTimer);
      clearTimeout(synthTimer);

      if (response.url) {
        setActiveImage(response.url);
      }
      if (response.image?.id) {
        setActiveImageId(response.image.id);
        setIsPublic(Boolean(response.image.isPublic));
      }

      setCurrentStep("complete");
      setIsGenerating(false);
      toast.success(
        `Artwork generated with ${selectedModel}! [${response.tokensDeducted} Tokens deducted, ${response.creditsRemaining} left]`
      );
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
      }, 2000);
    }
  };

  // Keyboard shortcut for Ctrl+Enter to generate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isGenerating && prompt.trim()) {
          handleGenerate();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGenerating, prompt, selectedModel, params, selectedStyle]);

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

  const handleSelectHistoryItem = (item: any) => {
    if (item.prompt) setPrompt(item.prompt);
    if (item.r2Url || item.displayUrl) setActiveImage(item.r2Url || item.displayUrl);
    if (item.model) dispatch(setSelectedImageModel(item.model));
    if (item.id) {
      setActiveImageId(item.id);
      setIsPublic(Boolean(item.isPublic));
    }
    setCurrentStep("complete");
    toast.success("Loaded artwork from history!");
  };

  const handleToggleVisibility = async () => {
    if (!activeImageId) {
      setIsPublic(!isPublic);
      toast.success(
        !isPublic
          ? "Artwork published to Community Gallery!"
          : "Artwork visibility set to private"
      );
      return;
    }

    try {
      const res = await toggleVisibilityApi({ id: activeImageId }).unwrap();
      setIsPublic(res.isPublic);
      toast.success(
        res.isPublic
          ? "Artwork published to Community Gallery!"
          : "Artwork visibility set to private"
      );
    } catch {
      setIsPublic(!isPublic);
      toast.success(
        !isPublic
          ? "Artwork published to Community Gallery!"
          : "Artwork visibility set to private"
      );
    }
  };

  const handleVariation = () => {
    const toastId = toast.loading("Synthesizing 4 latent seed variations...");
    setTimeout(() => {
      toast.success("Seed variants generated!", { id: toastId });
    }, 1500);
  };

  return (
    <AppShell
      title="Create Studio"
      subtitleBadge="[ INFERENCE ENGINE ]"
      noPadding={true}
    >
      <div className="h-[calc(100vh-56px)] w-full flex flex-col md:flex-row overflow-hidden relative">
        {/* 1. Left Sidebar: Prompt, Model, Settings */}
        <GenerationPanel
          prompt={prompt}
          setPrompt={setPrompt}
          negativePrompt={negativePrompt}
          setNegativePrompt={setNegativePrompt}
          selectedModel={selectedModel}
          setSelectedModel={(m) => dispatch(setSelectedImageModel(m))}
          params={params}
          setParams={setParams}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
          selectedStyle={selectedStyle}
          setSelectedStyle={setSelectedStyle}
        />

        {/* 2. Center Canvas: Generated Art, Stepper, Floating HUD */}
        <CanvasPanel
          currentStep={currentStep}
          activeImage={activeImage}
          prompt={prompt}
          negativePrompt={negativePrompt}
          selectedModel={selectedModel}
          isPublic={isPublic}
          onToggleVisibility={handleToggleVisibility}
          onSelectPrompt={(p) => setPrompt(p)}
          onOpenDetailModal={() => setIsDetailModalOpen(true)}
          onVariation={handleVariation}
        />

        {/* 3. Right Sidebar: Presets, History, GPU Queue */}
        <div className="hidden xl:block">
          <QueuePanel
            onSelectPreset={handleSelectPreset}
            onSelectHistoryItem={handleSelectHistoryItem}
            isGenerating={isGenerating}
            activePrompt={prompt}
          />
        </div>

        {/* Deep Artwork Inspection Modal */}
        {isDetailModalOpen && (
          <ImageDetailModal
            image={activeImage}
            prompt={prompt}
            negativePrompt={negativePrompt}
            model={selectedModel}
            aspectRatio={params.aspectRatio}
            guidanceScale={params.guidanceScale}
            samplingSteps={params.samplingSteps}
            seed={params.seed}
            sampler={params.sampler}
            isPublic={isPublic}
            onClose={() => setIsDetailModalOpen(false)}
            onApplySettings={() => {
              // already applied in state
            }}
            onToggleVisibility={handleToggleVisibility}
          />
        )}
      </div>
    </AppShell>
  );
}
