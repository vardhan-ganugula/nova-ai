import React from "react";
import { Sparkles, ArrowRight, Copy } from "lucide-react";

export interface TemplateCard {
  id: string;
  title: string;
  tag: string;
  prompt: string;
  image: string;
  badgeColor: string;
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground">Prompt Templates Gallery</h2>
            <p className="text-xs text-muted-foreground">Preset signature art styles curated for instant high-yield output</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-primary flex items-center gap-1">
            Hover style to inspect action triggers <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {templates.map((template) => {
          const isHovered = hoveredTemplate === template.id;

          return (
            <div
              key={template.id}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              className={`group relative flex h-72 flex-col justify-end overflow-hidden rounded-2xl border transition-all duration-300 ${
                isHovered
                  ? "border-primary/50 shadow-card-hover scale-[1.01]"
                  : "border-border bg-card shadow-card hover:border-primary/30"
              }`}
            >
              {/* Background Image */}
              <img
                src={template.image}
                alt={template.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Soft Gradient Veil */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

              {/* Top Tag */}
              <div className="absolute top-3.5 left-3.5 z-10">
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${template.badgeColor}`}
                >
                  {template.tag}
                </span>
              </div>

              {/* Default Info Content (Shown when NOT hovered) */}
              <div className={`relative z-10 p-5 transition-opacity duration-300 ${isHovered ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                <h3 className="text-lg font-bold text-white tracking-tight">{template.title}</h3>
                <p className="mt-1 text-xs text-zinc-200 line-clamp-2 leading-relaxed">
                  {template.prompt}
                </p>
              </div>

              {/* Active / Hovered Card Revealing Overlay Buttons */}
              <div
                className={`absolute inset-0 z-20 flex flex-col justify-between bg-card/95 p-5 backdrop-blur-md transition-all duration-300 ${
                  isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">{template.title}</span>
                    <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      Preset Active
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed italic bg-muted/40 p-2.5 rounded-xl border border-border">
                    "{template.prompt}"
                  </p>
                </div>

                {/* Overlay Action Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => onReusePrompt(template.prompt)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-card border border-border px-4 py-2.5 text-xs font-semibold text-foreground transition-all hover:bg-muted hover:border-primary/40 shadow-sm"
                  >
                    <Copy className="h-3.5 w-3.5 text-primary" />
                    <span>Reuse Prompt</span>
                  </button>

                  <button
                    onClick={() => onGenerateSimilar(template)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-xs font-bold text-white shadow-elegant hover:shadow-glow transition-all hover:scale-[1.02]"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    <span>Generate Similar</span>
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
