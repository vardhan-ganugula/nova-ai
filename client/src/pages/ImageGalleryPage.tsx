import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import {
  useGetUserQuery,
  useGetPublicGalleryQuery,
  useToggleLikeMutation,
} from "@/store/authSlice";

export default function ImageGalleryPage() {
  const navigate = useNavigate();
  const { data: userData } = useGetUserQuery();
  const { data: galleryData, isLoading } = useGetPublicGalleryQuery();
  const [toggleLikeApi] = useToggleLikeMutation();

  const user = userData?.user;
  const credits = user?.credits ?? 100;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedModalImage, setSelectedModalImage] = useState<any>(null);

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

  const galleryImages = galleryData?.images?.length ? galleryData.images : sampleFallback;

  const filteredImages = galleryImages.filter((img: any) => {
    const matchesSearch =
      img.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (img.author && img.author.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag =
      selectedTag === "All" ||
      (img.style && img.style.toLowerCase().includes(selectedTag.toLowerCase()));
    return matchesSearch && matchesTag;
  });

  const handleLikeToggle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await toggleLikeApi({ id }).unwrap();
      toast.success(res.liked ? "Liked artwork! ❤️" : "Removed like");
    } catch {
      toast.error("Sign in to like community creations");
    }
  };

  const copyPrompt = (text: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success("Prompt copied to clipboard!");
  };

  return (
    <AppShell title="Explore Community" subtitleBadge="[ PUBLIC EXHIBIT ]">
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#16161a] to-[#0c0c0e] p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-orange-400 border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 rounded font-semibold">
                  WATERMARKED COMMUNITY EXHIBIT
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 rounded flex items-center gap-1 font-semibold">
                  <ShieldCheck className="h-3 w-3" />
                  VERIFIED RIGHTS
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Explore Community Creations
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                Browse prompt designs and fine-tuned latent renders synthesized by creators worldwide. Click any artwork to inspect prompts, remix parameters in Studio, or copy prompt tags.
              </p>
            </div>

            <Link
              to="/create"
              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-black px-4 py-2.5 text-xs font-semibold shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 fill-black" />
              <span>Create Your Own</span>
            </Link>
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
                className={`cursor-pointer px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedTag === tag
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
                onClick={() => setSelectedModalImage(item)}
                className="group cursor-pointer rounded-xl border border-white/[0.07] bg-[#121215] hover:border-orange-500/40 hover:bg-[#16161a] transition-all overflow-hidden flex flex-col"
              >
                {/* Artwork Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
                  <img
                    src={item.displayUrl || item.watermarkedR2Url || item.r2Url}
                    alt={item.prompt}
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

                  {/* Quick Remix on Hover */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyPrompt(item.prompt, e);
                      }}
                      className="p-1.5 rounded-md bg-black/70 hover:bg-black text-zinc-300 hover:text-white border border-white/10"
                      title="Copy Prompt"
                    >
                      <Copy className="h-3 w-3" />
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

        {/* Modal View for Inspection */}
        {selectedModalImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150"
            onClick={() => setSelectedModalImage(null)}
          >
            <div
              className="relative w-full max-w-4xl bg-[#121215] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedModalImage(null)}
                className="absolute top-4 right-4 z-20 rounded-lg bg-black/60 hover:bg-white/10 p-2 text-zinc-400 hover:text-white transition-all"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Left Image */}
              <div className="relative flex-1 bg-black flex items-center justify-center min-h-[320px]">
                <img
                  src={
                    selectedModalImage.displayUrl ||
                    selectedModalImage.watermarkedR2Url ||
                    selectedModalImage.r2Url
                  }
                  alt={selectedModalImage.prompt}
                  className="max-h-[80vh] w-full object-contain"
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded bg-black/80 px-2.5 py-1 border border-white/15 text-[10px] font-mono font-bold uppercase text-white">
                  <Zap className="h-3 w-3 text-orange-400 fill-orange-400" />
                  <span>PUBLIC WATERMARKED PREVIEW</span>
                </div>
              </div>

              {/* Right Meta */}
              <div className="w-full md:w-80 p-6 flex flex-col justify-between space-y-4 bg-[#0c0c0e] border-t md:border-t-0 md:border-l border-white/[0.08]">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold">
                      PUBLIC EXHIBIT
                    </span>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-mono uppercase text-zinc-500">PROMPT</h4>
                    <p className="text-xs font-medium text-zinc-200 mt-1 leading-relaxed">
                      "{selectedModalImage.prompt}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <img
                      src={
                        selectedModalImage.authorAvatar ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80"
                      }
                      alt="Creator"
                      className="h-8 w-8 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">
                        {selectedModalImage.author || "Nova Artist"}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        Verified Creator
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-white/[0.08]">
                  <button
                    onClick={() => copyPrompt(selectedModalImage.prompt)}
                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] hover:bg-white/10 py-2.5 text-xs font-medium text-zinc-300 transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Prompt</span>
                  </button>

                  <Link
                    to="/create"
                    onClick={() => {
                      copyPrompt(selectedModalImage.prompt);
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 py-2.5 text-xs font-semibold text-black transition-colors"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    <span>Remix in Studio</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
