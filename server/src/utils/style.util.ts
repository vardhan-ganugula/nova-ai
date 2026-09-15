export interface StylePreset {
  id: string;
  label: string;
  category: "Artistic" | "Digital 3D" | "Photographic" | "Thematic";
  promptPrefix: string;
  promptSuffix: string;
  negativePrompt: string;
  isArtistic: boolean;
  conflictingNegativeTerms?: string[];
  photographicTermsToRemove?: RegExp[];
}

export const STYLE_PRESETS: Record<string, StylePreset> = {
  comic_book: {
    id: "comic_book",
    label: "Comic Book",
    category: "Artistic",
    promptPrefix: "Comic book graphic novel illustration of ",
    promptSuffix:
      ", bold black ink linework, dynamic cel-shaded coloring, vibrant comic book palette, halftone Ben-Day dot shading, dramatic comic panel lighting, classic comic book art style, master comic illustrator, graphic novel aesthetic",
    negativePrompt:
      "photograph, photorealistic, 35mm photo, raw photo, realistic skin texture, DSLR, camera capture, real life photo",
    isArtistic: true,
    conflictingNegativeTerms: [
      "cartoon shading",
      "cartoon",
      "illustration",
      "drawing",
      "sketch",
      "cel shading",
      "comic",
      "chibi",
      "line art",
      "animated",
    ],
    photographicTermsToRemove: [
      /analog grain[,\s]*/gi,
      /fashion-magazine makeup[,\s]*/gi,
      /35mm photo(graph)?([,\s]*)/gi,
      /raw photo([,\s]*)/gi,
      /dslr([,\s]*)/gi,
      /photorealistic([,\s]*)/gi,
    ],
  },
  anime: {
    id: "anime",
    label: "Anime Pastel Studio",
    category: "Artistic",
    promptPrefix: "Anime aesthetic, Japanese animation studio key visual art of ",
    promptSuffix:
      ", vibrant anime illustration, clean distinct linework, Makoto Shinkai and Studio Ghibli inspired, pastel color harmony, atmospheric lighting, detailed anime background art",
    negativePrompt:
      "photograph, realistic 3D, western comic, live action, photorealistic, raw photo, DSLR",
    isArtistic: true,
    conflictingNegativeTerms: [
      "anime",
      "cartoon",
      "illustration",
      "drawing",
      "chibi",
      "cel shading",
      "anime smoothness",
      "sparkle-eye",
    ],
    photographicTermsToRemove: [
      /analog grain[,\s]*/gi,
      /35mm photo(graph)?([,\s]*)/gi,
      /raw photo([,\s]*)/gi,
    ],
  },
  cartoon: {
    id: "cartoon",
    label: "Cartoon",
    category: "Artistic",
    promptPrefix: "Vibrant cartoon animation illustration of ",
    promptSuffix:
      ", stylized character design, bold cheerful colors, clean vector line art, modern animated series visual style, cel shaded art",
    negativePrompt:
      "photograph, photorealistic, realistic 3d, dark gritty, raw photo, DSLR",
    isArtistic: true,
    conflictingNegativeTerms: [
      "cartoon",
      "cartoon shading",
      "illustration",
      "drawing",
      "cel shading",
      "animated",
    ],
    photographicTermsToRemove: [
      /analog grain[,\s]*/gi,
      /photorealistic([,\s]*)/gi,
      /35mm photo(graph)?([,\s]*)/gi,
    ],
  },
  watercolor: {
    id: "watercolor",
    label: "Watercolor",
    category: "Artistic",
    promptPrefix: "Fine art watercolor painting of ",
    promptSuffix:
      ", authentic fluid watercolor on textured cold-press cotton paper, soft wet-on-wet color bleeds, delicate artistic pigment blooms, expressive brushstrokes, fine art watercolor masterpiece",
    negativePrompt:
      "photograph, 3d render, CGI, digital smoothness, plastic skin, flat vector, sharp photo",
    isArtistic: true,
    conflictingNegativeTerms: [
      "painting",
      "watercolor",
      "illustration",
      "drawing",
      "artistic",
    ],
    photographicTermsToRemove: [
      /analog grain[,\s]*/gi,
      /35mm photo(graph)?([,\s]*)/gi,
      /raw photo([,\s]*)/gi,
    ],
  },
  oil_painting: {
    id: "oil_painting",
    label: "Baroque Oil Painting",
    category: "Artistic",
    promptPrefix: "Classical Baroque oil painting, museum fine art masterpiece of ",
    promptSuffix:
      ", textured oil on canvas, heavy impasto brushwork, dramatic chiaroscuro lighting, deep umber and golden hues, Rembrandt and Caravaggio lighting, timeless fine art",
    negativePrompt:
      "photograph, modern digital art, flat vector, 3d render, smooth plastic",
    isArtistic: true,
    conflictingNegativeTerms: ["painting", "oil painting", "canvas", "brushstrokes"],
    photographicTermsToRemove: [
      /analog grain[,\s]*/gi,
      /35mm photo(graph)?([,\s]*)/gi,
      /raw photo([,\s]*)/gi,
    ],
  },
  pencil_sketch: {
    id: "pencil_sketch",
    label: "Pencil Sketch",
    category: "Artistic",
    promptPrefix: "Detailed graphite pencil sketch and fine line art drawing of ",
    promptSuffix:
      ", intricate hand-drawn cross-hatching, graphite pencil shading, textured charcoal paper, classical anatomical drawing study, monochrome black and white fine art",
    negativePrompt:
      "color, colored, saturated, photograph, 3d render, CGI, digital paint",
    isArtistic: true,
    conflictingNegativeTerms: ["sketch", "drawing", "pencil", "line art", "black and white"],
    photographicTermsToRemove: [
      /analog grain[,\s]*/gi,
      /35mm photo(graph)?([,\s]*)/gi,
      /raw photo([,\s]*)/gi,
    ],
  },
  isometric_3d: {
    id: "isometric_3d",
    label: "Isometric 3D Octane",
    category: "Digital 3D",
    promptPrefix: "Isometric 3D digital render, Octane render 3D artwork of ",
    promptSuffix:
      ", isometric view, raytraced reflections, smooth clay and subsurface scattering materials, volumetric studio rim lighting, Blender 3D showcase, 8k render, tilt-shift miniature depth",
    negativePrompt: "flat 2d, hand-drawn sketch, paper drawing, flat illustration",
    isArtistic: false,
    conflictingNegativeTerms: ["3d", "3d render", "cgi", "render"],
  },
  render_3d: {
    id: "render_3d",
    label: "3D Render",
    category: "Digital 3D",
    promptPrefix: "3D CGI digital animation render of ",
    promptSuffix:
      ", Pixar and Dreamworks quality 3D render, subsurface scattering, tactile textures, studio key lighting, raytracing reflections, Octane render 8k",
    negativePrompt: "flat 2d, sketch, paper, flat illustration, painting",
    isArtistic: false,
    conflictingNegativeTerms: ["3d", "3d render", "cgi", "render"],
  },
  cyberpunk: {
    id: "cyberpunk",
    label: "Cyberpunk Neo",
    category: "Thematic",
    promptPrefix: "Cyberpunk neo-noir visual of ",
    promptSuffix:
      ", glowing neon magenta and cyan lighting, rain-slicked asphalt with chromatic reflections, holographic HUD overlays, dystopian high-tech futuristic atmosphere, cinematic 8k octane render",
    negativePrompt: "vintage pastoral, desaturated, bland lighting, daylight countryside",
    isArtistic: false,
  },
  vintage_film: {
    id: "vintage_film",
    label: "Vintage 35mm Film",
    category: "Photographic",
    promptPrefix: "Authentic vintage 1970s 35mm film photograph of ",
    promptSuffix:
      ", organic analog film grain, Kodak Portra 400 color science, warm nostalgic tones, subtle lens flare and chromatic aberration, vintage cinematic film still",
    negativePrompt:
      "digital 3d render, CGI, cartoon, anime, illustration, plastic smoothness, hyper-digital HDR",
    isArtistic: false,
    conflictingNegativeTerms: ["analog grain", "grain", "film", "vintage"],
  },
  cinematic: {
    id: "cinematic",
    label: "Cinematic",
    category: "Photographic",
    promptPrefix: "Cinematic 70mm movie still of ",
    promptSuffix:
      ", dramatic theatrical lighting, shallow depth of field, anamorphic lens bokeh, blockbuster cinematography, rich color grading, award-winning film still",
    negativePrompt:
      "cartoon, anime, 3d render, drawing, sketch, oversaturated, amateur snapshot",
    isArtistic: false,
  },
  cinematic_photoreal: {
    id: "cinematic_photoreal",
    label: "Cinematic Photoreal",
    category: "Photographic",
    promptPrefix: "Hyperrealistic 8k raw photograph of ",
    promptSuffix:
      ", authentic realistic lighting, sharp focus, natural skin texture and micro-details, shot on 50mm f/1.2 lens, award-winning national geographic photography",
    negativePrompt:
      "cartoon, anime, painting, 3d render, CGI, drawing, sketch, blurry, plastic skin, doll face",
    isArtistic: false,
  },
  portrait: {
    id: "portrait",
    label: "Portrait",
    category: "Photographic",
    promptPrefix: "High-end studio portrait photography of ",
    promptSuffix:
      ", professional beauty softbox lighting, shallow depth of field with creamy bokeh, sharp eye detail, natural authentic skin texture, shot on 85mm f/1.4 lens, Vogue magazine cover aesthetic",
    negativePrompt:
      "cartoon, anime, 3d render, illustration, drawing, oversaturated, deformed eyes",
    isArtistic: false,
  },
  stock_photo: {
    id: "stock_photo",
    label: "Stock Photo",
    category: "Photographic",
    promptPrefix: "Professional commercial stock photography of ",
    promptSuffix:
      ", clean studio lighting, sharp focus, high-key commercial clarity, neutral modern environment, 85mm lens, high resolution commercial photo",
    negativePrompt:
      "cartoon, anime, 3d render, illustration, dark gothic, moody shadow",
    isArtistic: false,
  },
  fantasy: {
    id: "fantasy",
    label: "Fantasy",
    category: "Thematic",
    promptPrefix: "Epic high fantasy artwork of ",
    promptSuffix:
      ", ethereal magical glow, mythical atmospheric lighting, intricate fantasy worldbuilding, dramatic composition, ArtStation trending digital fantasy masterpiece",
    negativePrompt: "modern industrial, urban concrete, sci-fi tech, contemporary photo",
    isArtistic: false,
  },
  scifi: {
    id: "scifi",
    label: "Sci-Fi",
    category: "Thematic",
    promptPrefix: "Futuristic science fiction visual of ",
    promptSuffix:
      ", advanced industrial spacecraft technology, sleek speculative design, interstellar atmosphere, high-tech speculative realism, cinematic sci-fi concept art",
    negativePrompt: "medieval fantasy, swords, retro vintage, low quality",
    isArtistic: false,
  },
  horror: {
    id: "horror",
    label: "Horror",
    category: "Thematic",
    promptPrefix: "Dark gothic horror visual of ",
    promptSuffix:
      ", eerie chilling atmosphere, shadowy macabre composition, desaturated grim tones, psychological horror aesthetic, haunting volumetric fog",
    negativePrompt: "cheerful bright, sunny, cartoon, playful, vibrant colors",
    isArtistic: false,
  },
  vibrant: {
    id: "vibrant",
    label: "Vibrant Pop Art",
    category: "Thematic",
    promptPrefix: "Vibrant high-contrast pop art style visual of ",
    promptSuffix:
      ", rich saturated electric color palette, striking visual contrast, dynamic lighting, eye-catching contemporary visual punch",
    negativePrompt: "desaturated, monochrome, washed out, dull, grayscale",
    isArtistic: false,
  },
};

/**
 * Normalizes any style string (e.g. "comic book", "Comic Book", "oil painting", "3d_render")
 * to its corresponding StylePreset if found.
 */
export function resolveStylePreset(styleName?: string): StylePreset | null {
  if (!styleName) return null;
  const trimmed = styleName.trim().toLowerCase();
  if (trimmed === "default" || trimmed === "none" || trimmed === "") return null;

  // Direct ID check
  if (STYLE_PRESETS[trimmed]) {
    return STYLE_PRESETS[trimmed];
  }

  // Alias / normalized mapping
  const normalized = trimmed.replace(/[\s\-_]+/g, "");

  for (const [key, preset] of Object.entries(STYLE_PRESETS)) {
    const keyNorm = key.replace(/[\s\-_]+/g, "");
    const labelNorm = preset.label.toLowerCase().replace(/[\s\-_]+/g, "");
    if (normalized === keyNorm || normalized === labelNorm) {
      return preset;
    }
  }

  // Substring / keyword matching
  if (normalized.includes("comic")) return STYLE_PRESETS.comic_book;
  if (normalized.includes("anime")) return STYLE_PRESETS.anime;
  if (normalized.includes("cartoon")) return STYLE_PRESETS.cartoon;
  if (normalized.includes("watercolor")) return STYLE_PRESETS.watercolor;
  if (normalized.includes("oil") || normalized.includes("baroque")) return STYLE_PRESETS.oil_painting;
  if (normalized.includes("sketch") || normalized.includes("pencil")) return STYLE_PRESETS.pencil_sketch;
  if (normalized.includes("isometric") || normalized.includes("octane")) return STYLE_PRESETS.isometric_3d;
  if (normalized.includes("3d") || normalized.includes("render")) return STYLE_PRESETS.render_3d;
  if (normalized.includes("cyberpunk")) return STYLE_PRESETS.cyberpunk;
  if (normalized.includes("35mm") || normalized.includes("vintage")) return STYLE_PRESETS.vintage_film;
  if (normalized.includes("photoreal")) return STYLE_PRESETS.cinematic_photoreal;
  if (normalized.includes("cinematic")) return STYLE_PRESETS.cinematic;
  if (normalized.includes("portrait")) return STYLE_PRESETS.portrait;
  if (normalized.includes("stock")) return STYLE_PRESETS.stock_photo;
  if (normalized.includes("fantasy")) return STYLE_PRESETS.fantasy;
  if (normalized.includes("scifi") || normalized.includes("sci-fi")) return STYLE_PRESETS.scifi;
  if (normalized.includes("horror")) return STYLE_PRESETS.horror;
  if (
    normalized.includes("vibrant") ||
    normalized.includes("popart") ||
    normalized.includes("creative") ||
    normalized.includes("dynamic") ||
    normalized.includes("fusion")
  ) {
    return STYLE_PRESETS.vibrant;
  }

  return null;
}

/**
 * Extracts any embedded "Avoid: ..." or "Negative: ..." or "--no ..." from the prompt text
 * so it doesn't pollute or contradict the positive prompt.
 */
export function extractEmbeddedNegativePrompt(promptText: string): {
  cleanPrompt: string;
  extractedNegative: string | null;
} {
  if (!promptText) return { cleanPrompt: "", extractedNegative: null };

  let text = promptText.trim();
  let extracted: string[] = [];

  // Match newline followed by Avoid: or Negative prompt: or Negative:
  const avoidMatch = text.match(
    /(?:\r?\n|^)\s*(?:Avoid|avoid|Negative prompt|negative prompt|Negative|negative)\s*:\s*([\s\S]+)$/i
  );
  if (avoidMatch && avoidMatch[1]) {
    extracted.push(avoidMatch[1].trim());
    text = text.substring(0, avoidMatch.index).trim();
  }

  // Match --no <words>
  const noMatch = text.match(/--no\s+([^\n\-]+)/i);
  if (noMatch && noMatch[1]) {
    extracted.push(noMatch[1].trim());
    text = text.replace(/--no\s+[^\n\-]+/gi, "").trim();
  }

  return {
    cleanPrompt: text,
    extractedNegative: extracted.length > 0 ? extracted.join(", ") : null,
  };
}

/**
 * Compiles a rich styled prompt and clean negative prompt.
 * Resolves style conflicts (e.g. removing "cartoon shading" from negative prompt when user selects Comic Book style).
 */
export function applyStyleToPrompt(
  prompt: string,
  styleName?: string,
  explicitNegative?: string
): {
  styledPrompt: string;
  finalNegativePrompt: string;
  matchedPreset: StylePreset | null;
} {
  const { cleanPrompt, extractedNegative } = extractEmbeddedNegativePrompt(prompt);

  // Combine explicit negative and extracted negative
  const negativeParts: string[] = [];
  if (explicitNegative && explicitNegative.trim()) negativeParts.push(explicitNegative.trim());
  if (extractedNegative && extractedNegative.trim()) negativeParts.push(extractedNegative.trim());

  let mergedNegative = negativeParts.join(", ");
  const preset = resolveStylePreset(styleName);

  if (!preset) {
    // If an unknown custom style string was provided, wrap it with a substantial modifier
    if (styleName && styleName !== "Default" && styleName !== "None") {
      const customStyled = `${styleName} style, artistic visual aesthetic of ${styleName}, ${cleanPrompt}, distinct ${styleName} styling`;
      return {
        styledPrompt: customStyled,
        finalNegativePrompt: mergedNegative,
        matchedPreset: null,
      };
    }
    return {
      styledPrompt: cleanPrompt,
      finalNegativePrompt: mergedNegative,
      matchedPreset: null,
    };
  }

  let finalCleanPrompt = cleanPrompt;

  // If the preset has photographic terms to remove (for artistic / comic / painterly styles), remove them
  if (preset.photographicTermsToRemove) {
    for (const regex of preset.photographicTermsToRemove) {
      finalCleanPrompt = finalCleanPrompt.replace(regex, " ").replace(/\s{2,}/g, " ").trim();
    }
  }

  // Filter out any conflicting negative keywords (e.g. "cartoon shading" when user wants Comic Book style!)
  if (preset.conflictingNegativeTerms && preset.conflictingNegativeTerms.length > 0 && mergedNegative) {
    let sanitized = mergedNegative;
    for (const term of preset.conflictingNegativeTerms) {
      const regex = new RegExp(`\\b${term}\\b[\\s,]*`, "gi");
      sanitized = sanitized.replace(regex, "");
    }
    // Clean up trailing/duplicate commas
    sanitized = sanitized
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(", ");
    mergedNegative = sanitized;
  }

  // Append preset's recommended negative keywords
  if (preset.negativePrompt) {
    mergedNegative = mergedNegative
      ? `${preset.negativePrompt}, ${mergedNegative}`
      : preset.negativePrompt;
  }

  // Compile final styled prompt
  const styledPrompt = `${preset.promptPrefix}${finalCleanPrompt}${preset.promptSuffix}`;

  return {
    styledPrompt,
    finalNegativePrompt: mergedNegative,
    matchedPreset: preset,
  };
}
