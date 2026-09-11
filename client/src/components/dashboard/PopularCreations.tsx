import React from "react";
import { Link } from "react-router-dom";
import { Heart, Copy, ArrowRight, Layers } from "lucide-react";
import toast from "react-hot-toast";

export interface CreationItem {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  tag: string;
  likes: string;
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
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <h2 className="font-serif-heading text-2xl font-bold tracking-tight text-slate-900">
            Popular Creations
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-wider text-purple-700 border border-purple-200 bg-purple-50 px-2 py-0.5 rounded-full font-semibold">
            [ 02 COMMUNITY FEED ]
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/image-gallary"
            className="font-mono text-[11px] uppercase text-purple-600 font-bold hover:underline flex items-center gap-1"
          >
            <span>VIEW ALL IN GALLERY</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Grid of Preview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {creations.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white transition-all duration-300 hover:border-purple-300 hover:-translate-y-1 hover:shadow-md shadow-sm"
          >
            {/* Image Container */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Minimal Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Top Badges */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                <span className="rounded-full bg-white/90 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-800 backdrop-blur-md border border-slate-200 shadow-xs font-semibold">
                  [ {item.tag} ]
                </span>

                {/* Like Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLikeToggle(item.id);
                  }}
                  className={`cursor-pointer flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] backdrop-blur-md border transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs ${item.isLiked
                      ? "border-rose-200 bg-rose-50 text-rose-600 font-bold"
                      : "border-slate-200 bg-white/90 text-slate-600 hover:text-slate-900"
                    }`}
                >
                  <Heart
                    className={`h-3 w-3 transition-transform duration-200 ${item.isLiked ? "fill-rose-500 text-rose-500" : ""
                      }`}
                  />
                  <span>{item.likes}</span>
                </button>
              </div>

              {/* Bottom Quick Action Overlay on Hover */}
              <div className="absolute inset-x-0 bottom-0 p-2.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-between gap-1.5 z-20">
                <button
                  onClick={() => {
                    onUsePrompt(item.title);
                    toast.success("Prompt loaded into creation bar!");
                  }}
                  className="cursor-pointer flex-1 flex items-center justify-center gap-1 rounded-lg bg-white/95 hover:bg-white text-[10px] font-semibold text-slate-800 py-1.5 px-2 border border-slate-200 backdrop-blur-md transition-all active:scale-95 shadow-xs"
                >
                  <Copy className="h-3 w-3 text-purple-600" />
                  <span>Use Prompt</span>
                </button>
              </div>
            </div>

            {/* Card Content Details */}
            <div className="flex flex-1 flex-col justify-between p-3.5 bg-white">
              <h3 className="font-sans text-xs font-medium text-slate-800 line-clamp-1 group-hover:text-purple-600 transition-colors">
                {item.title}
              </h3>

              <div className="flex items-center gap-2 pt-2 mt-1 border-t border-slate-100">
                <img
                  src={item.authorAvatar}
                  alt={item.author}
                  className="h-4.5 w-4.5 rounded-full object-cover border border-slate-200"
                />
                <span className="font-mono text-[10px] text-slate-500 truncate uppercase">
                  {item.author}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Right-aligned Featured CTA Card */}
        <div className="group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-rose-50 p-6 text-center shadow-sm transition-all duration-300 hover:border-purple-300 hover:-translate-y-1 hover:shadow-md">
          <div className="relative z-20 flex flex-col items-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 border border-purple-200 text-purple-700 shadow-xs group-hover:scale-110 transition-transform duration-300">
              <Layers className="h-5 w-5" />
            </div>

            <h3 className="font-serif-heading text-lg font-bold text-slate-900 tracking-tight">Explore 50K+</h3>
            <p className="mt-1 font-mono text-[10px] uppercase text-slate-500 max-w-[130px]">
              [ COMMUNITY GALLERY ]
            </p>

            <Link
              to="/image-gallary"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 px-4 py-2 font-sans text-xs font-bold text-white shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 group-hover:gap-2 cursor-pointer"
            >
              <span>Go to Gallery</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
