import React from "react";
import { Sparkles, Copy } from "lucide-react";

export interface TemplateCard {
  id: string;
  title: string;
  tag: string;
  prompt: string;
  image: string;
  badgeColor: string;
  meshBg?: string;
}

interface TemplatesGalleryProps {
  templates: TemplateCard[];
  hoveredTemplate: string | null;
  setHoveredTemplate: (id: string | null) => void;
  onReusePrompt: (prompt: string) => void;
  onGenerateSimilar: (template: TemplateCard) => void;
}

export function TemplatesGallery({
  templates,
  hoveredTemplate,
  setHoveredTemplate,
  onReusePrompt,
  onGenerateSimilar,
}: TemplatesGalleryProps) {
  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
        <div className="flex items-center gap-3">
          <h2 className="font-serif-heading text-2xl font-bold tracking-tight text-white">
            Prompt Templates & Preset Styles
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#FF7A00] border border-[#FF7A00]/30 bg-[#FF7A00]/10 px-2 py-0.5 rounded-full font-semibold">
            [ 03 PRESET STYLES ]
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase text-white/30 hidden sm:inline">
            [ HOVER TO EXPAND ACTIONS ]
          </span>
        </div>
      </div>

      {/* Grid of Prompt Presets */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {templates.map((template) => {
          const isHovered = hoveredTemplate === template.id;

          return (
            <div
              key={template.id}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              className={`group relative flex h-72 flex-col justify-end overflow-hidden rounded-2xl border transition-all duration-300 ${
                isHovered
                  ? "border-[#FF7A00]/40 -translate-y-1 scale-[1.01]"
                  : "border-white/[0.07] bg-white/[0.03] hover:border-white/[0.12]"
              }`}
            >
              {/* Background Preset Image */}
              <img
                src={template.image}
                alt={template.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Light Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent" />

              {/* Top Tag Pill */}
              <div className="absolute top-3.5 left-3.5 z-10">
                <span
                  className="rounded-full px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider backdrop-blur-md border border-white/30 bg-black/40 text-white font-semibold"
                >
                  [ {template.tag} ]
                </span>
              </div>

              {/* Default Info Content */}
              <div
                className={`relative z-10 p-5 transition-opacity duration-300 ${
                  isHovered ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
              >
                <h3 className="font-serif-heading text-xl font-bold text-white tracking-wide">
                  {template.title}
                </h3>
                <p className="mt-1 font-sans text-xs text-slate-200 line-clamp-2 leading-relaxed">
                  {template.prompt}
                </p>
              </div>

              {/* Active Hover Overlay with Clean Glassmorphism */}
              <div
                className={`absolute inset-0 z-20 flex flex-col justify-between overflow-hidden bg-[#111114]/95 p-5 backdrop-blur-md transition-all duration-300 border border-white/[0.08] ${
                  isHovered
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 pointer-events-none"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-serif-heading text-lg font-bold text-white">
                      {template.title}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#FF7A00] border border-[#FF7A00]/30 bg-[#FF7A00]/10 px-2 py-0.5 rounded-full font-bold">
                      [ PRESET ]
                    </span>
                  </div>
                  <p className="mt-2 font-sans text-xs text-white/60 leading-relaxed italic bg-white/[0.05] p-3 rounded-xl border border-white/[0.08]">
                    "{template.prompt}"
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReusePrompt(template.prompt);
                    }}
                    className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-[11px] font-semibold text-white/80 py-2 px-3 border border-white/[0.1] transition-all active:scale-95"
                  >
                    <Copy className="h-3 w-3 text-[#FF7A00]" />
                    <span>Use Prompt</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onGenerateSimilar(template);
                    }}
                    className="cursor-pointer flex items-center justify-center gap-1.5 rounded-xl bg-[#FF7A00] hover:bg-[#FF9A3C] text-white text-[11px] font-bold py-2 px-3 transition-all active:scale-95 shadow-[0_0_12px_rgba(255,122,0,0.3)] hover:scale-105"
                  >
                    <Sparkles className="h-3 w-3 text-white" />
                    <span>Remix</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
}
