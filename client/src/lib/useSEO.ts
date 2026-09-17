import { useEffect } from "react";

interface SEOConfig {
  title: string;
  description: string;
  canonical?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

function setMeta(name: string, content: string, attribute = "name") {
  let el = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attribute, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

const SEO_JSONLD_ID = "vimitron-seo-ld-json";

/**
 * Reusable hook for per-page SEO injection.
 * Sets title, meta description, canonical, OG, Twitter Cards, and JSON-LD.
 */
export function useSEO(config: SEOConfig) {
  useEffect(() => {
    // Title
    document.title = config.title;

    // Meta description
    setMeta("description", config.description);

    // Robots
    if (config.robots) {
      setMeta("robots", config.robots);
    }

    // Canonical
    if (config.canonical) {
      setLink("canonical", config.canonical);
    }

    // Open Graph
    const ogTitle = config.ogTitle || config.title;
    const ogDesc = config.ogDescription || config.description;
    setMeta("og:title", ogTitle, "property");
    setMeta("og:description", ogDesc, "property");
    setMeta("og:type", config.ogType || "website", "property");
    setMeta("og:site_name", "Vimitron", "property");
    if (config.ogUrl) setMeta("og:url", config.ogUrl, "property");
    if (config.ogImage) setMeta("og:image", config.ogImage, "property");

    // Twitter Cards
    setMeta("twitter:card", config.twitterCard || "summary_large_image");
    setMeta("twitter:title", config.twitterTitle || ogTitle);
    setMeta("twitter:description", config.twitterDescription || ogDesc);
    if (config.twitterImage || config.ogImage) {
      setMeta("twitter:image", config.twitterImage || config.ogImage!);
    }

    // JSON-LD structured data
    if (config.jsonLd) {
      let scriptTag = document.getElementById(SEO_JSONLD_ID) as HTMLScriptElement | null;
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = SEO_JSONLD_ID;
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(config.jsonLd);
    }

    // Cleanup JSON-LD on unmount
    return () => {
      const tag = document.getElementById(SEO_JSONLD_ID);
      if (tag) tag.remove();
    };
  }, [config.title, config.description, config.canonical, config.robots,
      config.ogTitle, config.ogDescription, config.ogImage, config.ogUrl, config.ogType,
      config.twitterCard, config.twitterTitle, config.twitterDescription, config.twitterImage,
      config.jsonLd]);
}

/** Default Vimitron Organization schema — reusable across pages */
export const VIMITRON_ORG_SCHEMA = {
  "@type": "Organization",
  "name": "Vimitron",
  "url": "https://vimitron.vercel.app",
  "logo": "https://vimitron.vercel.app/logo.webp",
  "sameAs": [],
};

/** WebSite schema with search action for sitelinks searchbox */
export const VIMITRON_WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Vimitron",
  "url": "https://vimitron.vercel.app",
  "description": "Vimitron is an all-in-one AI creative platform for generating images, videos, music, voices, code, and content.",
  "publisher": VIMITRON_ORG_SCHEMA,
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://vimitron.vercel.app/explore?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};
