import React from "react";
import { Heart, Copy, Download, ArrowRight, Layers } from "lucide-react";
import toast from "react-hot-toast";

export interface CreationItem {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  tag: string;
  likes: number;
  image: string;
  isLiked?: boolean;
  aspect: string;
}

interface PopularCreationsProps {
  creations: CreationItem[];
  onLikeToggle: (id: string) => void;
  onUsePrompt: (prompt: string) => void;
}

export function PopularCreations({
  creations,
  onLikeToggle,
  onUsePrompt,
}: PopularCreationsProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600">
            <Heart className="h-3.5 w-3.5 fill-rose-500/20" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground">Popular Creations</h2>
            <p className="text-xs text-muted-foreground">Top trending artworks generated across the community today</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">Updated live 4m ago</span>
        </div>
      </div>

      {/* Horizontal Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {creations.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:border-primary/40 hover:shadow-card-hover hover:-translate-y-0.5"
          >
            {/* Image Container with Aspect Ratio */}
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80" />

              {/* Top Badges */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md border border-white/20">
                  {item.tag}
                </span>

                {/* Interactive Like Counter Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLikeToggle(item.id);
                  }}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-md border transition-all ${
                    item.isLiked
                      ? "bg-rose-600/80 text-white border-rose-500"
                      : "bg-black/60 text-white border-white/20 hover:bg-black/80"
                  }`}
                >
                  <Heart
                    className={`h-3 w-3 ${
                      item.isLiked ? "fill-white text-white" : "text-white"
                    }`}
                  />
                  <span>{item.likes}</span>
                </button>
              </div>

              {/* Floating Quick Action Icons on Hover */}
              <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <button
                  onClick={() => {
                    onUsePrompt(item.title);
                    toast.success("Loaded prompt from creation");
                  }}
                  title="Copy Prompt"
                  className="rounded-lg bg-black/80 p-1.5 text-zinc-200 hover:text-white backdrop-blur border border-white/20"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => toast.success("HD Image downloaded")}
                  title="Download"
                  className="rounded-lg bg-black/80 p-1.5 text-zinc-200 hover:text-white backdrop-blur border border-white/20"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Card Content Details */}
            <div className="flex flex-1 flex-col justify-between p-3">
              <h3 className="text-xs font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              
              <div className="flex items-center gap-2 pt-2 mt-1 border-t border-border">
                <img
                  src={item.authorAvatar}
                  alt={item.author}
                  className="h-5 w-5 rounded-full object-cover border border-border"
                />
                <span className="text-[11px] font-medium text-muted-foreground truncate">
                  {item.author}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Prominent Featured Card Button: "Go to Image Gallery →" */}
        <div className="group relative flex flex-col items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/20 to-card p-6 text-center shadow-card transition-all duration-300 hover:border-primary/40 hover:shadow-card-hover hover:scale-[1.01]">
          {/* Radial Glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.06),transparent_70%)]" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary shadow-sm group-hover:scale-105 transition-transform">
              <Layers className="h-6 w-6 text-white" />
            </div>

            <h3 className="text-sm font-bold text-foreground tracking-tight">Explore 50K+</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-[130px]">
              Browse community prompts & curated styles
            </p>

            <button
              onClick={() => toast("Opening full 8K Image Gallery", { icon: "🎨" })}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:opacity-95 group-hover:gap-2"
            >
              <span>Go to Image Gallery</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
