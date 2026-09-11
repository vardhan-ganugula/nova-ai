import React, { useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
  useGetUserQuery,
  useGetPublicGalleryQuery,
  useToggleLikeMutation,
} from "@/store/authSlice";

export default function ImageGalleryPage() {
  const { data: userData } = useGetUserQuery();
  const { data: galleryData, isLoading } = useGetPublicGalleryQuery();
  const [toggleLikeApi] = useToggleLikeMutation();

  const user = userData?.user;
  const credits = user?.credits ?? 100;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedModalImage, setSelectedModalImage] = useState<any>(null);

  const tags = ["All", "Cyberpunk", "Cinematic", "Anime", "Fantasy", "Portrait", "Sci-Fi"];

  // Default fallback items with watermarked badge if database has few records
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
  ];

  const galleryImages = galleryData?.images?.length ? galleryData.images : sampleFallback;

  const filteredImages = galleryImages.filter((img: any) => {
    const matchesSearch = img.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (img.author && img.author.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = selectedTag === "All" || (img.style && img.style.toLowerCase().includes(selectedTag.toLowerCase()));
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
    <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      <div className="flex min-h-screen w-full">
        <DashboardSidebar activeItem="Explore Gallery" />

        <div className="flex flex-1 flex-col md:pl-64">
          <DashboardHeader
            title="Public Watermarked Gallery"
            subtitleBadge="[ COMMUNITY FEED ]"
            tokens={credits}
          />

          <main className="flex-1 space-y-8 p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
            {/* Header Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-purple-700 border border-purple-200 bg-purple-50 px-2.5 py-0.5 rounded-full font-semibold">
                      [ WATERMARKED PUBLIC EXHIBIT ]
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-700 border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                      <ShieldCheck className="h-3 w-3" />
                      PROTECTED PREVIEWS
                    </span>
                  </div>
                  <h1 className="font-serif-heading text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                    Community Creation Gallery
                  </h1>
                  <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                    Explore high-resolution artworks published by creators across the world. All public artworks are automatically stamped with the authentic Nova watermark badge for digital rights protection.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to="/image-gen"
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Create Your Own</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Search & Filtering Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search prompts or creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all shadow-sm"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <span className="text-xs text-slate-500 font-mono flex items-center gap-1 mr-1">
                  <Filter className="h-3 w-3" /> FILTER:
                </span>
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`cursor-pointer px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      selectedTag === tag
                        ? "bg-purple-600 text-white shadow-sm"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse space-y-3">
                    <div className="aspect-[4/3] bg-slate-100 rounded-xl" />
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
                <ImageIcon className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No public artworks found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Be the first to publish an artwork from your Image Studio canvas by clicking "Make Public"!
                </p>
                <Link
                  to="/image-gen"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 text-white px-4 py-2 text-xs font-semibold hover:bg-purple-700 transition-all"
                >
                  Go to Image Studio
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredImages.map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedModalImage(item)}
                    className="group cursor-pointer rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:shadow-md hover:border-purple-300 transition-all overflow-hidden flex flex-col"
                  >
                    {/* Watermarked Image Container */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                      <img
                        src={item.displayUrl || item.watermarkedR2Url || item.r2Url}
                        alt={item.prompt}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Visible Watermark Stamp */}
                      <div className="absolute bottom-2.5 right-2.5 pointer-events-none z-10 flex items-center gap-1 rounded-full bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 border border-white/30 text-[9px] font-mono font-bold uppercase tracking-wider text-white shadow-lg">
                        <Zap className="h-2.5 w-2.5 text-amber-300 fill-amber-300" />
                        <span>NOVA AI</span>
                      </div>

                      {/* Style Tag */}
                      {item.style && (
                        <div className="absolute top-2.5 left-2.5">
                          <span className="rounded-full bg-white/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase text-slate-800 border border-slate-200/80 shadow-sm">
                            {item.style}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Meta Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <p className="text-xs font-medium text-slate-800 line-clamp-2 leading-relaxed">
                        "{item.prompt}"
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={item.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80"}
                            alt={item.author || "Creator"}
                            className="h-6 w-6 rounded-full object-cover border border-slate-200"
                          />
                          <span className="text-[11px] font-semibold text-slate-700">
                            {item.author || "Nova Artist"}
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleLikeToggle(item.id, e)}
                          className="cursor-pointer flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
          </main>
        </div>
      </div>

      {/* Modal View for Watermarked Image Inspection */}
      {selectedModalImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedModalImage(null)}
        >
          <div 
            className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedModalImage(null)}
              className="absolute top-4 right-4 z-20 rounded-full bg-slate-100 hover:bg-slate-200 p-2 text-slate-600 transition-all"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Left Image View */}
            <div className="relative flex-1 bg-slate-100 flex items-center justify-center overflow-hidden min-h-[300px]">
              <img
                src={selectedModalImage.displayUrl || selectedModalImage.watermarkedR2Url || selectedModalImage.r2Url}
                alt={selectedModalImage.prompt}
                className="max-h-[80vh] w-full object-contain"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-slate-900/85 backdrop-blur-md px-3 py-1 border border-white/40 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-xl">
                <Zap className="h-3 w-3 text-amber-300 fill-amber-300" />
                <span>WATERMARKED GALLERY PREVIEW</span>
              </div>
            </div>

            {/* Right Meta Details */}
            <div className="w-full md:w-80 p-6 flex flex-col justify-between space-y-4 bg-white">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
                    PUBLIC EXHIBIT
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full">
                    {selectedModalImage.aspectRatio || "16:9"}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">PROMPT</h3>
                  <p className="text-sm font-medium text-slate-800 mt-1 leading-relaxed">
                    "{selectedModalImage.prompt}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <img
                    src={selectedModalImage.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80"}
                    alt={selectedModalImage.author}
                    className="h-8 w-8 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">{selectedModalImage.author || "Nova Artist"}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Verified Creator</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => copyPrompt(selectedModalImage.prompt)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 py-2.5 text-xs font-semibold text-slate-700 transition-all"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Prompt</span>
                </button>

                <button
                  onClick={(e) => handleLikeToggle(selectedModalImage.id, e)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 py-2.5 text-xs font-bold text-white shadow-sm transition-all"
                >
                  <Heart className="h-3.5 w-3.5 fill-white" />
                  <span>Like ({selectedModalImage.likesCount || 0})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
