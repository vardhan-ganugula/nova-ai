import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Sparkles,
  Heart,
  Search,
  Copy,
  ExternalLink,
  ShieldCheck,
  Filter,
  Image as ImageIcon,
  X,
  Zap,
  Wand2,
  Share2,
  Download,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import {
  useGetUserQuery,
  useGetPublicGalleryQuery,
  useToggleLikeMutation,
  useDownloadCleanImageMutation,
  useGetUserHistoryQuery,
} from "@/store/authSlice";

export default function ImageGalleryPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: userData } = useGetUserQuery();
  const { data: galleryData, isLoading } = useGetPublicGalleryQuery();
  const [toggleLikeApi] = useToggleLikeMutation();
  const [downloadCleanImageApi, { isLoading: isDownloadingClean }] = useDownloadCleanImageMutation();

  const user = userData?.user;
  const credits = user?.credits ?? 0;

  const { data: userHistoryData } = useGetUserHistoryQuery(undefined, { skip: !user });
  const userHistoryImages = userHistoryData?.images || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedModalImage, setSelectedModalImage] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  const tags = ["All", "Cinematic", "Cyberpunk", "Anime", "Fantasy", "Photoreal", "Sci-Fi"];

  const sampleFallback = [
    {
      id: "sample-1",
      prompt: "Ethereal crystal celestial guardian in nebula clouds, ultra-detailed raytracing, cinematic lighting",
      style: "Cinematic",
      displayUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      watermarkedR2Url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      likesCount: 142,
      author: "Nova Creator",
      authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      createdAt: new Date().toISOString(),
    },
    {
      id: "sample-2",
      prompt: "Neo-Tokyo samurai assassin reflected on rain drenched asphalt with pink neon signs",
      style: "Cyberpunk",
      displayUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80",
      watermarkedR2Url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80",
      likesCount: 89,
      author: "Vardhan",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      createdAt: new Date().toISOString(),
    },
    {
      id: "sample-3",
      prompt: "Porcelain android geisha with holographic origami butterflies, ambient gold glow",
      style: "Anime",
      displayUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80",
      watermarkedR2Url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80",
      likesCount: 215,
      author: "Kira",
      authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
      createdAt: new Date().toISOString(),
    },
    {
      id: "sample-4",
      prompt: "Ancient overgrown solarpunk sky towers with vertical hydroponic gardens at dawn",
      style: "Fantasy",
      displayUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
      watermarkedR2Url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
      likesCount: 76,
      author: "Elena",
      authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      createdAt: new Date().toISOString(),
    },
  ];

  const rawGalleryImages = galleryData?.images?.length ? galleryData.images : sampleFallback;

  // Deduplicate gallery images by watermarked URL or ID so no identical creations appear twice
  const seenGalleryKeys = new Set<string>();
  const galleryImages: any[] = [];
  for (const item of rawGalleryImages) {
    const key = item.watermarkedR2Url || item.displayUrl || item.id;
    if (!seenGalleryKeys.has(key)) {
      seenGalleryKeys.add(key);
      galleryImages.push(item);
    }
  }

  // Sync URL parameter ?image=<id> with modal state
  const imageIdFromUrl = searchParams.get("image");

  useEffect(() => {
    if (imageIdFromUrl && galleryImages.length > 0) {
      const match = galleryImages.find((img: any) => String(img.id) === String(imageIdFromUrl));
      if (match) {
        setSelectedModalImage(match);
      }
    } else if (!imageIdFromUrl && selectedModalImage) {
      setSelectedModalImage(null);
    }
  }, [imageIdFromUrl, galleryData]);

  // Open modal and reflect ?image=<id> in URL bar
  const openImageModal = (img: any) => {
    setSelectedModalImage(img);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("image", img.id);
      return next;
    }, { replace: false });
  };

  // Close modal and remove ?image from URL bar
  const closeImageModal = () => {
    setSelectedModalImage(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("image");
      return next;
    }, { replace: true });
  };

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedModalImage) {
        closeImageModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedModalImage]);

  // Copy shareable direct URL
  const handleShareLink = (img: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const shareUrl = `${window.location.origin}/explore?image=${img.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShareId(img.id);
    setTimeout(() => setCopiedShareId(null), 2000);
    toast.success("Artwork link copied to clipboard!");
  };

  const filteredImages = galleryImages.filter((img: any) => {
    const matchesSearch =
      img.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (img.author && img.author.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag =
      selectedTag === "All" ||
      (img.style && img.style.toLowerCase().includes(selectedTag.toLowerCase()));
    return matchesSearch && matchesTag;
  });

  // Google Image Search SEO: JSON-LD Schema injection
  // Strictly exposes watermarkedR2Url / displayUrl to search crawlers, protecting clean master assets
  useEffect(() => {
    document.title = "Explore AI Art & Generations | Nova AI Public Gallery";

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "Discover community-generated AI art synthesized on Nova AI. Browse watermarked previews, examine prompt formulas, and download watermark-free HD creations."
    );

    const schemaId = "nova-gallery-ld-json";
    let scriptTag = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.id = schemaId;
      scriptTag.type = "application/ld+json";
      document.head.appendChild(scriptTag);
    }

    const itemsToExpose = (galleryData?.images?.length ? galleryData.images : sampleFallback).slice(0, 50);
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      "name": "Nova AI Public Art Exhibition",
      "description": "Public exhibition of fine-tuned latent renders synthesized on Nova AI",
      "publisher": {
        "@type": "Organization",
        "name": "Nova AI",
        "url": window.location.origin,
      },
      "image": itemsToExpose.map((img: any) => ({
        "@type": "ImageObject",
        "contentUrl": img.watermarkedR2Url || img.displayUrl,
        "thumbnail": img.watermarkedR2Url || img.displayUrl,
        "name": img.prompt?.slice(0, 100) || "AI Art",
        "description": img.prompt,
        "author": {
          "@type": "Person",
          "name": img.author || "Nova Artist",
        },
        "datePublished": img.createdAt || new Date().toISOString(),
        "acquireLicensePage": `${window.location.origin}/explore`,
      })),
    };

    scriptTag.text = JSON.stringify(structuredData);

    return () => {
      const el = document.getElementById(schemaId);
      if (el) el.remove();
    };
  }, [galleryData]);

  const handleLikeToggle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    try {
      const res = await toggleLikeApi({ id }).unwrap();
      toast.success(res.liked ? "Liked artwork! ❤️" : "Removed like");
    } catch {
      toast.error("Sign in to like community creations");
    }
  };

  const copyPrompt = (text: string, id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
    toast.success("Prompt copied to clipboard!");
  };

  // Browser download helper
  const triggerBrowserDownload = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Network response was not ok");
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Free Watermarked Download (Public for all visitors)
  const handleDownloadWatermarked = async (img: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const targetUrl = img.watermarkedR2Url || img.displayUrl || img.r2Url;
    if (!targetUrl) {
      toast.error("Image file not available");
      return;
    }

    const toastId = toast.loading("Downloading watermarked image...");
    try {
      await triggerBrowserDownload(targetUrl, `nova-ai-${img.id || "creation"}-watermarked.png`);
      toast.dismiss(toastId);

      // Render custom theme-aligned image toast
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
            } transition-all duration-200 max-w-sm w-full bg-[#141419]/95 border border-emerald-500/30 rounded-2xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-xl flex items-center gap-3`}
          >
            <img
              src={targetUrl}
              alt="Artwork preview"
              className="h-12 w-12 rounded-xl object-cover border border-white/10 shrink-0 bg-black"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[9px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                  WATERMARKED
                </span>
                <span className="font-mono text-[9px] text-zinc-400 font-semibold">FREE</span>
              </div>
              <p className="text-xs font-semibold text-white truncate mt-1">
                Preview Downloaded
              </p>
              <p className="text-[11px] text-zinc-400 truncate">
                Saved to your device
              </p>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ),
        { duration: 3500 }
      );
    } catch {
      toast.error("Download failed. Please try again.", { id: toastId });
    }
  };

  const isImageOwnedOrAcquired = (img: any) => {
    if (!user || !img) return false;
    if (img.userId === user.id) return true;
    return userHistoryImages.some(
      (h: any) =>
        (img.r2Url && h.r2Url === img.r2Url) ||
        (img.watermarkedR2Url && h.watermarkedR2Url === img.watermarkedR2Url) ||
        h.id === img.id
    );
  };

  // Clean HD Download (Gated: requires login, 0 tokens for creator/already acquired, 1 token for new acquisition)
  const handleDownloadClean = async (img: any, e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const alreadyAcquired = isImageOwnedOrAcquired(img);
    const targetUrl = img.watermarkedR2Url || img.displayUrl || img.r2Url;

    setIsDownloading(true);
    const toastId = toast.loading(
      alreadyAcquired
        ? "Preparing clean master from your generations (0 tokens)..."
        : "Checking balance & preparing clean HD master (1 token)..."
    );

    try {
      const res = await downloadCleanImageApi({ id: img.id }).unwrap();
      await triggerBrowserDownload(res.downloadUrl, `nova-ai-${img.id}-clean-hd.png`);
      toast.dismiss(toastId);

      const isFree = res.tokensDeducted === 0;

      // Render custom theme-aligned HD image toast
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
            } transition-all duration-200 max-w-md w-full bg-[#141419]/95 border ${
              isFree ? 'border-emerald-500/30' : 'border-orange-500/30'
            } rounded-2xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-xl flex items-center gap-3`}
          >
            <img
              src={res.downloadUrl || targetUrl}
              alt="Artwork preview"
              className="h-12 w-12 rounded-xl object-cover border border-white/10 shrink-0 bg-black"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-mono text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                    isFree
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : 'text-orange-400 bg-orange-500/10 border-orange-500/20'
                  }`}
                >
                  CLEAN HD MASTER
                </span>
                <span className="font-mono text-[9px] text-zinc-400 font-semibold">
                  {isFree ? '0 TOKENS' : `${res.tokensDeducted} TOKEN`}
                </span>
              </div>
              <p className="text-xs font-semibold text-white truncate mt-1">
                Download Complete
              </p>
              <p className="text-[11px] text-zinc-400 truncate">
                {isFree
                  ? 'Re-downloaded from your generations (Free)'
                  : `Added to your generations (${res.creditsRemaining} credits left)`}
              </p>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ),
        { duration: 4500 }
      );
    } catch (err: any) {
      const errMsg =
        err?.data?.error ||
        err?.data?.message ||
        "Failed to download clean asset. Ensure you have at least 1 token.";
      toast.error(errMsg, { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  const isCurrentModalOriginalCreator = user?.id && selectedModalImage?.userId === user?.id;
  const isCurrentModalOwner = isImageOwnedOrAcquired(selectedModalImage);

  return (
    <AppShell title="Explore Community" subtitleBadge="[ PUBLIC EXHIBIT ]">
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#16161a] to-[#0c0c0e] p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 rounded font-semibold">
                  Free Image Gallery
                </span>

              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Explore Community Creations
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                Browse prompt designs and fine-tuned latent renders synthesized by creators worldwide. Public visitors can download watermarked previews for free. Sign in to download pristine HD watermark-free masters (free for creators, 1 token for community members).
              </p>
            </div>

            <div className="flex items-center gap-3">
              {!user && (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition-colors"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </Link>
              )}
              <Link
                to="/create"
                className="inline-flex items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-black px-4 py-2.5 text-xs font-semibold shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 fill-black" />
                <span>Create Your Own</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search prompts or creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#121215] border border-white/[0.08] rounded-lg text-xs font-medium text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <span className="text-xs text-zinc-500 font-mono flex items-center gap-1 mr-1">
              <Filter className="h-3 w-3" /> Filter:
            </span>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`cursor-pointer px-3 py-1 rounded-md text-xs font-medium transition-all ${selectedTag === tag
                  ? "bg-orange-500 text-black font-semibold shadow-xs"
                  : "bg-[#121215] text-zinc-400 border border-white/5 hover:border-white/15 hover:text-white"
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry / Grid Gallery */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="rounded-xl border border-white/5 bg-[#121215] p-3 animate-pulse space-y-3"
              >
                <div className="aspect-[4/3] bg-white/[0.05] rounded-lg" />
                <div className="h-3 bg-white/[0.05] rounded w-3/4" />
                <div className="h-2 bg-white/[0.03] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-16 bg-[#121215] rounded-xl border border-white/5 p-8">
            <ImageIcon className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-200">No artworks found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Be the first to publish an artwork from your Studio canvas!
            </p>
            <Link
              to="/create"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-500 text-black px-4 py-2 text-xs font-semibold hover:bg-orange-600 transition-colors"
            >
              Open Studio Canvas
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((item: any) => (
              <div
                key={item.id}
                onClick={() => openImageModal(item)}
                className="group cursor-pointer rounded-xl border border-white/[0.07] bg-[#121215] hover:border-orange-500/40 hover:bg-[#16161a] transition-all overflow-hidden flex flex-col"
              >
                {/* Artwork Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
                  <img
                    src={item.watermarkedR2Url || item.displayUrl || item.r2Url}
                    alt={item.prompt}
                    title={item.prompt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Watermark stamp */}
                  <div className="absolute bottom-2 right-2 pointer-events-none z-10 flex items-center gap-1.5 rounded bg-black/80 px-2 py-0.5 border border-white/10 text-[9px] font-mono font-bold uppercase text-zinc-300">
                    <Zap className="h-2.5 w-2.5 text-orange-400 fill-orange-400" />
                    <span>NOVA AI</span>
                  </div>

                  {/* Style tag */}
                  {item.style && (
                    <div className="absolute top-2 left-2">
                      <span className="rounded bg-black/70 backdrop-blur-md px-2 py-0.5 text-[9px] font-mono uppercase text-zinc-300 border border-white/10">
                        {item.style}
                      </span>
                    </div>
                  )}

                  {/* Quick Action Overlay on Hover */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleShareLink(item, e)}
                      className="p-1.5 rounded-md bg-black/70 hover:bg-black text-zinc-300 hover:text-white border border-white/10 transition-colors"
                      title="Share Direct Link"
                    >
                      {copiedShareId === item.id ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Share2 className="h-3 w-3" />
                      )}
                    </button>
                    <button
                      onClick={(e) => handleDownloadWatermarked(item, e)}
                      className="p-1.5 rounded-md bg-black/70 hover:bg-black text-zinc-300 hover:text-white border border-white/10 transition-colors"
                      title="Download Free (Watermarked)"
                    >
                      <Download className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => copyPrompt(item.prompt, item.id, e)}
                      className="p-1.5 rounded-md bg-black/70 hover:bg-black text-zinc-300 hover:text-white border border-white/10 transition-colors"
                      title="Copy Prompt"
                    >
                      {copiedPromptId === item.id ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                    "{item.prompt}"
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          item.authorAvatar ||
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80"
                        }
                        alt="Author"
                        className="h-5 w-5 rounded-full object-cover border border-white/10"
                      />
                      <span className="text-[11px] font-medium text-zinc-400">
                        {item.author || "Nova Artist"}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleLikeToggle(item.id, e)}
                      className="flex items-center gap-1 text-zinc-400 hover:text-rose-400 transition-colors"
                    >
                      <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                      <span className="font-mono text-[11px]">{item.likesCount || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Spacious, Elegant Inspection Modal with Direct Shareable URL */}
        {selectedModalImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200"
            onClick={closeImageModal}
          >
            <div
              className="relative w-full max-w-5xl xl:max-w-6xl h-auto max-h-[92vh] md:h-[86vh] bg-[#0e0e12] rounded-2xl border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Column: Generous Image Canvas Preview */}
              <div className="relative flex-1 bg-[#060608] flex items-center justify-center p-4 sm:p-8 min-h-[300px] md:min-h-0 select-none overflow-hidden">
                {/* Mobile close button on image canvas */}
                <button
                  onClick={closeImageModal}
                  className="md:hidden absolute top-3 right-3 z-20 rounded-lg bg-black/80 backdrop-blur-md p-2 text-zinc-400 hover:text-white border border-white/15 cursor-pointer"
                  title="Close preview"
                >
                  <X className="h-4 w-4" />
                </button>

                <img
                  src={
                    selectedModalImage.watermarkedR2Url ||
                    selectedModalImage.displayUrl ||
                    selectedModalImage.r2Url
                  }
                  alt={selectedModalImage.prompt}
                  title={selectedModalImage.prompt}
                  className="max-h-full max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-300"
                />

                {/* Floating Top Tag */}
                {selectedModalImage.style && (
                  <div className="absolute top-4 left-4">
                    <span className="rounded-lg bg-black/80 backdrop-blur-md px-3 py-1 text-[10px] font-mono font-semibold uppercase text-zinc-300 border border-white/10 shadow-lg">
                      {selectedModalImage.style}
                    </span>
                  </div>
                )}

                {/* Floating Bottom Preview Notice */}
                <div className="absolute bottom-4 left-4 right-4 md:right-auto flex items-center gap-2 rounded-xl bg-black/80 backdrop-blur-md px-3 py-1.5 border border-white/10 text-[10px] font-mono text-zinc-300 shadow-lg">
                  <Zap className="h-3 w-3 text-orange-400 fill-orange-400 shrink-0" />
                  <span className="font-semibold text-white">NOVA AI PUBLIC PREVIEW</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-400">Watermarked for Free Public Viewing</span>
                </div>
              </div>

              {/* Right Column: Spacious Meta & Actions Sidebar */}
              <div className="w-full md:w-[440px] lg:w-[480px] shrink-0 bg-[#121216] border-t md:border-t-0 md:border-l border-white/[0.08] flex flex-col justify-between overflow-y-auto">
                <div className="p-5 sm:p-6 space-y-5">
                  {/* Header Row: Badges, Like, Share & Close Button (No Overlap) */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 bg-white/[0.04] border border-white/10 px-2 py-0.5 rounded-md font-medium">
                        PUBLIC EXHIBIT
                      </span>
                      {isCurrentModalOriginalCreator ? (
                        <span className="font-mono text-[10px] uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/25 px-2 py-0.5 rounded-md font-semibold">
                          YOUR ARTWORK
                        </span>
                      ) : isCurrentModalOwner ? (
                        <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          IN GENERATIONS
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => handleShareLink(selectedModalImage, e)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                        title="Copy shareable direct link"
                      >
                        {copiedShareId === selectedModalImage.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-mono text-[11px]">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="h-3.5 w-3.5 text-zinc-400" />
                            <span className="font-mono text-[11px]">Share</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={(e) => handleLikeToggle(selectedModalImage.id, e)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-rose-400 text-xs font-medium transition-colors cursor-pointer"
                        title="Like artwork"
                      >
                        <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                        <span className="font-mono text-[11px]">
                          {selectedModalImage.likesCount || 0}
                        </span>
                      </button>

                      <div className="h-4 w-[1px] bg-white/10 mx-0.5" />

                      <button
                        onClick={closeImageModal}
                        className="hidden md:flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/15 p-1.5 text-zinc-400 hover:text-white transition-all border border-white/10 cursor-pointer"
                        title="Close preview (Esc)"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Creator Info Card */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <img
                      src={
                        selectedModalImage.authorAvatar ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      }
                      alt="Creator"
                      className="h-9 w-9 rounded-full object-cover border border-white/10 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">
                        {selectedModalImage.author || "Nova Artist"}
                      </div>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                        <span className="text-emerald-400 text-[9px]">●</span>
                        <span className="truncate">
                          {isCurrentModalOriginalCreator
                            ? "You (Original Creator)"
                            : isCurrentModalOwner
                              ? "Acquired in your library"
                              : "Verified Creator"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Prompt Box */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                        PROMPT FORMULA
                      </h4>
                      <button
                        onClick={(e) => copyPrompt(selectedModalImage.prompt, selectedModalImage.id, e)}
                        className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedPromptId === selectedModalImage.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="rounded-xl border border-white/[0.07] bg-black/40 p-3 text-xs text-zinc-300 leading-relaxed max-h-28 overflow-y-auto selection:bg-orange-500/30">
                      "{selectedModalImage.prompt}"
                    </div>
                  </div>

                  {/* Download Options */}
                  <div className="space-y-2.5">
                    <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                      DOWNLOAD ASSETS
                    </h4>

                    {/* Option 1: Watermarked (Free for all) */}
                    <button
                      onClick={() => handleDownloadWatermarked(selectedModalImage)}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                        <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors">
                          <Download className="h-4 w-4 text-zinc-300 group-hover:text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-white truncate">
                            Download Watermarked
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono mt-0.5 truncate">
                            Standard preview with watermark
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded-md shrink-0">
                        FREE
                      </span>
                    </button>

                    {/* Option 2: Clean HD Master (Token Gated / In Generations) */}
                    <button
                      onClick={() => handleDownloadClean(selectedModalImage)}
                      disabled={isDownloadingClean || isDownloading}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all group cursor-pointer ${
                        isCurrentModalOwner
                          ? "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20"
                          : "border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            isCurrentModalOwner
                              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                              : "bg-orange-500/20 border-orange-500/30 text-orange-400"
                          }`}
                        >
                          {isDownloadingClean || isDownloading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-white flex items-center gap-1.5 flex-wrap">
                            <span>Download Clean HD</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/60 font-mono font-medium text-zinc-300 border border-white/10 shrink-0">
                              No Watermark
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono mt-0.5 truncate">
                            {isCurrentModalOriginalCreator
                              ? "Original master • Creator Free (0 Tokens)"
                              : isCurrentModalOwner
                                ? "In your generations • Free re-download"
                                : user
                                  ? "Saves to your generations • 1 Token"
                                  : "Sign in required • 1 Token or Free"}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                          isCurrentModalOwner
                            ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/20"
                            : "text-orange-400 border-orange-500/30 bg-orange-500/20"
                        }`}
                      >
                        {isCurrentModalOwner ? "0 TOKENS" : "1 TOKEN"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Bottom Studio Remix Action */}
                <div className="p-5 sm:p-6 pt-3.5 border-t border-white/[0.08] bg-[#0f0f13] space-y-2">
                  <Link
                    to="/create"
                    onClick={() => {
                      copyPrompt(selectedModalImage.prompt, selectedModalImage.id);
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 py-2.5 text-xs font-bold text-black transition-all shadow-[0_0_20px_rgba(249,115,22,0.25)] hover:shadow-[0_0_25px_rgba(249,115,22,0.4)]"
                  >
                    <Wand2 className="h-4 w-4 fill-black" />
                    <span>Remix Prompt in Studio</span>
                  </Link>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1 font-mono">
                    <span className="truncate min-w-0 mr-2">Direct Link: /explore?image={selectedModalImage.id.slice(0, 8)}...</span>
                    <button
                      onClick={(e) => handleShareLink(selectedModalImage, e)}
                      className="text-orange-400 hover:text-orange-300 transition-colors underline cursor-pointer shrink-0"
                    >
                      Copy URL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visitor Login Required Modal */}
        {showAuthModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150"
            onClick={() => setShowAuthModal(false)}
          >
            <div
              className="relative w-full max-w-md bg-[#16161a] rounded-2xl border border-white/15 p-6 shadow-2xl space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 rounded-lg bg-white/5 hover:bg-white/10 p-2 text-zinc-400 hover:text-white transition-all"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-2">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Sign In to Nova AI</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Watermark-free master downloads require a verified account.
                </p>
              </div>

              <div className="space-y-2.5 rounded-xl border border-white/10 bg-black/40 p-3.5 text-xs">
                <div className="flex items-start gap-2 text-zinc-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-white">Creators download for 0 tokens:</strong> Always free to download your own original creations.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-zinc-300">
                  <Zap className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-white">Community creations:</strong> Download pristine HD watermark-free copies for just 1 token.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-zinc-300">
                  <ShieldCheck className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-white">Watermarked preview:</strong> Always 100% free for everyone, no login needed.
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 py-2.5 text-xs font-semibold text-black transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In with Account</span>
                </Link>

                <Link
                  to="/register"
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 py-2.5 text-xs font-semibold text-zinc-200 transition-colors"
                >
                  <span>Create New Account</span>
                </Link>

                {selectedModalImage && (
                  <button
                    onClick={() => {
                      setShowAuthModal(false);
                      handleDownloadWatermarked(selectedModalImage);
                    }}
                    className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 py-1 transition-colors"
                  >
                    Download watermarked preview instead
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
