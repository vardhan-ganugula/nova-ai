import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useGetUserQuery } from "@/store/authSlice";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


import {
  Sparkles,
  ArrowRight,
  Play,
  ImageIcon,
  Video,
  Music,
  Mic,
  FileText,
  Code2,
  MessageSquare,
  PenTool,
  Presentation,
  ScanText,
  Wand2,
  ChevronRight,
  Check,
  X,
  Star,
  Zap,
  Cloud,
  Shield,
  Globe,
  Layers,
  BarChart3,
  Cpu,
} from "lucide-react";
import { FaXTwitter as Twitter } from "react-icons/fa6";
import { 
    FaGithub as Github,
    FaLinkedin as Linkedin,
    FaYoutube as Youtube,
    FaInstagram as Instagram} from "react-icons/fa";

/* -------------------------------------------------------------------------- */
/*  Reusable primitives                                                        */
/* -------------------------------------------------------------------------- */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
      <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" />
      {children}
    </div>
  );
}

function GradientButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-primary bg-size-200 px-7 text-sm font-semibold text-white shadow-elegant transition-all duration-300 hover:scale-[1.03] hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
      style={{ backgroundSize: "200% 200%" }}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
    </button>
  );
}

function GhostButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-card/40 px-6 text-sm font-medium text-foreground backdrop-blur transition-all duration-300 hover:border-primary/40 hover:bg-card/70 ${className}`}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Background — animated gradient mesh + particles                            */
/* -------------------------------------------------------------------------- */

function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />
      {/* Floating blobs */}
      <div className="absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full bg-primary/25 blur-[140px] animate-pulse-glow" />
      <div
        className="absolute -top-20 right-0 h-[440px] w-[440px] rounded-full bg-secondary/20 blur-[140px] animate-pulse-glow"
        style={{ animationDelay: "1.5s" }}
      />
      <div
        className="absolute top-[35%] left-1/3 h-[400px] w-[400px] rounded-full bg-accent/15 blur-[160px] animate-pulse-glow"
        style={{ animationDelay: "3s" }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Nav                                                                        */
/* -------------------------------------------------------------------------- */

function Navbar({ onLogin, onSignup }: { onLogin: () => void; onSignup: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/70 backdrop-blur-xl border-b border-border" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <a href="#" className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden shadow-elegant">
            <img src="/logo.webp" alt="Nova AI Logo" className="h-full w-full object-contain" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">Nova AI</span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {["Features", "Models", "Templates", "Pricing", "FAQ"].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground" onClick={onLogin}>
            Sign in
          </Button>
          <button
            onClick={onSignup}
            className="bg-zinc-800 group relative inline-flex h-9 items-center gap-1.5 overflow-hidden rounded-full bg-gradient-primary px-4 text-sm font-semibold text-white shadow-elegant transition-transform hover:scale-105"
          >
            Get started
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </nav>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero                                                                       */
/* -------------------------------------------------------------------------- */

function Hero({ onSignup }: { onSignup: () => void }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setMouse({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section ref={heroRef} className="relative overflow-hidden pt-28 pb-20 sm:pt-40 sm:pb-28 md:pt-44 md:pb-32">
      {/* Mouse-follow glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-500"
        style={{
          background: `radial-gradient(500px circle at ${mouse.x * 100}% ${mouse.y * 100}%, hsl(var(--primary) / 0.18), transparent 60%)`,
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:gap-16 lg:grid-cols-[1.05fr_1fr]">
          {/* Copy */}
          <div className="animate-fade-in text-center lg:text-left">
            <div className="mb-6 flex justify-center lg:justify-start">
              <SectionLabel>
                <Sparkles className="h-3 w-3 text-primary" />
                Introducing Nova AI · v2.0
              </SectionLabel>
            </div>

            <h1 className="text-balance text-3xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[76px]">
              One Platform.
              <br />
              <span className="text-gradient bg-size-200 animate-gradient-shift bg-clip-text">
                Unlimited AI Creativity.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
              Generate images, videos, music, voices, code, presentations, logos, and content
              in seconds with the power of AI.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <GradientButton onClick={onSignup} className="w-full sm:w-auto">
                Start Creating Free
                <ArrowRight className="h-4 w-4" />
              </GradientButton>
              <GhostButton className="w-full sm:w-auto">
                <Play className="h-4 w-4" />
                Watch Demo
              </GhostButton>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 px-2 text-xs text-muted-foreground lg:justify-start">
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-accent shrink-0" /> No credit card required</span>
              <span className="hidden sm:inline text-border">•</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-accent shrink-0" /> Free 100 credits</span>
              <span className="hidden sm:inline text-border">•</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-accent shrink-0" /> Cancel anytime</span>
            </div>
          </div>

          {/* Right — dashboard preview */}
          <div className="w-full max-w-lg mx-auto min-w-0 px-0 sm:px-2">
            <HeroPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="relative w-full max-w-full min-w-0 animate-scale-in [animation-delay:200ms]">
      {/* Glow */}
      <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[3rem] bg-gradient-primary opacity-20 blur-3xl sm:-inset-8" />

      <div className="relative w-full max-w-full min-w-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card/80 p-2 sm:p-4 md:p-6 shadow-elegant backdrop-blur-xl">
        <div className="rounded-xl sm:rounded-2xl bg-background/70 p-2.5 sm:p-4 md:p-5 w-full min-w-0">
          {/* Fake window chrome */}
          <div className="mb-3 flex items-center justify-between sm:mb-4">
            <div className="flex gap-1.5 shrink-0">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30 sm:h-2.5 sm:w-2.5" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30 sm:h-2.5 sm:w-2.5" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30 sm:h-2.5 sm:w-2.5" />
            </div>
            <div className="truncate rounded-full bg-muted/60 px-2.5 py-0.5 text-[9px] font-medium text-muted-foreground sm:px-3 sm:py-1 sm:text-[10px]">
              nova.ai / studio
            </div>
            <div className="h-2.5 w-2.5 shrink-0" />
          </div>

          {/* Prompt row */}
          <div className="mb-3 flex w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-border bg-card px-2.5 py-2 sm:mb-4 sm:rounded-2xl sm:px-4 sm:py-3">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary sm:h-4 sm:w-4" />
            <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground sm:text-sm">
              a futuristic city at golden hour, cinematic lighting…
            </span>
            <button className="shrink-0 rounded-full bg-gradient-primary px-2.5 py-1 text-[10px] font-semibold text-white transition-transform hover:scale-105 sm:px-3 sm:py-1 sm:text-xs">
              Generate
            </button>
          </div>

          {/* Tool tabs */}
          <div className="mb-3 flex w-full min-w-0 items-center gap-1.5 overflow-x-auto no-scrollbar py-1 sm:mb-4 sm:gap-2">
            {[
              { icon: ImageIcon, label: "Image", active: true },
              { icon: Video, label: "Video" },
              { icon: Music, label: "Music" },
              { icon: FileText, label: "Text" },
            ].map((t) => (
              <button
                key={t.label}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] sm:px-3 sm:py-1.5 sm:text-xs ${
                  t.active
                    ? "bg-gradient-primary text-white shadow-elegant"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon className="h-3 w-3 shrink-0" /> {t.label}
              </button>
            ))}
          </div>

          {/* Generated grid: Constrained, auto-fit, no overflow */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full max-w-md mx-auto">
            {[
              "linear-gradient(135deg, #7C3AED, #3B82F6)",
              "linear-gradient(135deg, #06B6D4, #7C3AED)",
              "linear-gradient(135deg, #3B82F6, #06B6D4)",
              "linear-gradient(135deg, #8B5CF6, #EC4899)",
            ].map((bg, i) => (
              <div
                key={i}
                className="group relative aspect-square w-full min-w-0 overflow-hidden rounded-lg sm:rounded-xl"
                style={{ background: bg }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent_50%)]" />
                <div className="absolute bottom-1.5 left-1.5 rounded-md bg-black/50 px-1.5 py-0.5 text-[8px] font-medium text-white backdrop-blur sm:bottom-2 sm:left-2 sm:text-[9px]">
                  4K · v{i + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Analytics row: Responsive grid with flexible columns */}
          <div className="mt-3 grid grid-cols-3 gap-1.5 sm:mt-4 sm:gap-2 w-full text-center">
            {[
              { l: "Generations", v: "1,284", icon: Zap },
              { l: "Credits", v: "8.2K", icon: Sparkles },
              { l: "Queue", v: "Priority", icon: Cpu },
            ].map((s) => (
              <div key={s.l} className="min-w-0 rounded-lg sm:rounded-xl border border-border bg-card/60 p-2 sm:p-3">
                <div className="mb-0.5 flex items-center justify-center gap-1 text-[9px] text-muted-foreground sm:text-[10px]">
                  <s.icon className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{s.l}</span>
                </div>
                <div className="truncate text-xs font-semibold text-foreground sm:text-sm">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating cards */}
      <div className="absolute -left-6 top-16 hidden animate-float rounded-2xl border border-border bg-card/90 p-3 shadow-elegant backdrop-blur-xl md:block">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-accent">
            <Mic className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-foreground">Voice ready</div>
            <div className="text-[10px] text-muted-foreground">02:14 · Studio v3</div>
          </div>
        </div>
      </div>
      <div
        className="absolute -right-4 bottom-10 hidden animate-float rounded-2xl border border-border bg-card/90 p-3 shadow-elegant backdrop-blur-xl md:block"
        style={{ animationDelay: "1.2s" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-foreground">+34% this week</div>
            <div className="text-[10px] text-muted-foreground">Team output</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Trusted By                                                                 */
/* -------------------------------------------------------------------------- */

const brands = ["Microsoft", "Google", "NVIDIA", "OpenAI", "Meta", "Adobe"];

function TrustedBy() {
  return (
    <section className="border-y border-border bg-background/40 py-14 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-8 text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Trusted by teams at world-class companies
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-6 opacity-70">
          {brands.map((b) => (
            <span
              key={b}
              className="select-none text-xl font-bold tracking-tight text-muted-foreground/70 transition-colors hover:text-foreground"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Features                                                                   */
/* -------------------------------------------------------------------------- */

const features = [
  { icon: ImageIcon, title: "AI Image Generation", desc: "Studio-grade visuals from a prompt. Any style, any size, in seconds.", tint: "from-purple-500/20 to-fuchsia-500/10" },
  { icon: Video, title: "AI Video Creation", desc: "Cinematic clips, ads, and short-form video generated automatically.", tint: "from-blue-500/20 to-indigo-500/10" },
  { icon: Music, title: "Music Generator", desc: "Original, royalty-free tracks tuned to your mood, genre, and BPM.", tint: "from-cyan-500/20 to-sky-500/10" },
  { icon: Mic, title: "AI Voice Generator", desc: "Lifelike voices in 30+ languages with emotion and cadence controls.", tint: "from-emerald-500/20 to-teal-500/10" },
  { icon: PenTool, title: "AI Writer", desc: "Long-form articles, ad copy, and social posts that actually sound like you.", tint: "from-pink-500/20 to-rose-500/10" },
  { icon: Code2, title: "Code Assistant", desc: "Ship faster with context-aware code generation, review, and refactors.", tint: "from-violet-500/20 to-purple-500/10" },
  { icon: Wand2, title: "Logo Generator", desc: "Brand-ready logos with vector export and adaptive color systems.", tint: "from-amber-500/20 to-orange-500/10" },
  { icon: Presentation, title: "Presentation Generator", desc: "Investor-grade decks generated from a single prompt or outline.", tint: "from-lime-500/20 to-emerald-500/10" },
  { icon: ScanText, title: "PDF Summarizer", desc: "Turn 200 pages into a two-minute read with cited highlights.", tint: "from-fuchsia-500/20 to-pink-500/10" },
  { icon: Layers, title: "Image Editing", desc: "Upscale, remove backgrounds, and retouch with pixel-level control.", tint: "from-sky-500/20 to-blue-500/10" },
];

function Features() {
  return (
    <section id="features" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>Features</SectionLabel>
          <h2 className="mt-5 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Every AI tool you need,
            <br />
            <span className="text-gradient">in one workspace.</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Thirteen production-grade generators. One elegant workspace. Zero setup.
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article
              key={f.title}
              className="border-glow group relative overflow-hidden rounded-3xl border border-border bg-card/60 p-6 transition-all duration-500 hover:-translate-y-1 hover:bg-card"
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${f.tint} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
              <div className="relative">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background/60 text-primary shadow-inner transition-transform duration-500 group-hover:scale-110">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Explore <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  How it works                                                               */
/* -------------------------------------------------------------------------- */

const steps = [
  { icon: Wand2, title: "Choose an AI Tool", desc: "Pick from 13 specialized generators — image, video, music, voice, code, and more." },
  { icon: MessageSquare, title: "Describe Your Idea", desc: "Write a prompt in plain English. Add references, tone, style — Nova understands." },
  { icon: Sparkles, title: "Generate & Download", desc: "Preview instantly, refine in-context, and export in production-ready formats." },
];

function HowItWorks() {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="mt-5 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            From idea to output in <span className="text-gradient">three steps.</span>
          </h2>
        </div>

        <div className="relative mt-20 grid gap-6 md:grid-cols-3">
          {/* Connector line */}
          <div className="pointer-events-none absolute left-[16%] right-[16%] top-9 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />
          {steps.map((s, i) => (
            <div key={s.title} className="relative text-center">
              <div className="relative mx-auto mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-gradient-primary shadow-elegant">
                <s.icon className="h-8 w-8 text-white" />
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-[10px] font-bold text-foreground">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">{s.title}</h3>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Comparison                                                                 */
/* -------------------------------------------------------------------------- */

function Comparison() {
  const traditional = ["Manual editing", "Multiple software subscriptions", "Hours per asset", "Expensive per-seat pricing", "Local installs & updates", "Fragmented outputs"];
  const platform = ["Everything in one place", "Generate in seconds", "Affordable, transparent pricing", "Latest AI models included", "100% cloud-based", "Zero installation"];

  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>Why Nova</SectionLabel>
          <h2 className="mt-5 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            The old way vs the <span className="text-gradient">Nova way.</span>
          </h2>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {/* Traditional */}
          <div className="rounded-3xl border border-border bg-card/40 p-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
              <X className="h-3.5 w-3.5" /> Traditional Tools
            </div>
            <ul className="space-y-4">
              {traditional.map((t) => (
                <li key={t} className="flex items-start gap-3 text-muted-foreground">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border">
                    <X className="h-3 w-3" />
                  </span>
                  <span className="text-sm">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div className="border-glow relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-elegant">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-elegant">
                <Sparkles className="h-3.5 w-3.5" /> Nova AI Platform
              </div>
              <ul className="space-y-4">
                {platform.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-foreground">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-white">
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-sm">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Models                                                                     */
/* -------------------------------------------------------------------------- */

const models = ["GPT-4", "Claude", "Gemini", "Flux", "Stable Diffusion", "Llama", "Whisper", "ElevenLabs", "Runway", "Ideogram"];

function Models() {
  return (
    <section id="models" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>AI Models</SectionLabel>
          <h2 className="mt-5 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Powered by the <span className="text-gradient">best models on Earth.</span>
          </h2>
          <p className="mt-5 text-muted-foreground">
            Nova routes each request to the strongest model for the job — automatically.
          </p>
        </div>

        <div className="mt-14 flex flex-wrap justify-center gap-3">
          {models.map((m, i) => (
            <div
              key={m}
              className="group flex items-center gap-2 rounded-full border border-border bg-card/60 px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-primary shadow-[0_0_8px_hsl(var(--primary))]" />
              {m}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Templates                                                                  */
/* -------------------------------------------------------------------------- */

const templates = [
  { name: "YouTube Thumbnail", tag: "Design", grad: "from-red-500/40 to-orange-500/20" },
  { name: "Instagram Post", tag: "Social", grad: "from-pink-500/40 to-fuchsia-500/20" },
  { name: "TikTok Video", tag: "Video", grad: "from-cyan-500/40 to-blue-500/20" },
  { name: "LinkedIn Article", tag: "Writing", grad: "from-blue-600/40 to-indigo-500/20" },
  { name: "Podcast Voice", tag: "Audio", grad: "from-purple-500/40 to-violet-500/20" },
  { name: "Product Photography", tag: "Image", grad: "from-amber-500/40 to-yellow-500/20" },
  { name: "Logo Design", tag: "Brand", grad: "from-emerald-500/40 to-teal-500/20" },
  { name: "Marketing Email", tag: "Writing", grad: "from-rose-500/40 to-pink-500/20" },
  { name: "Presentation", tag: "Deck", grad: "from-violet-500/40 to-purple-500/20" },
  { name: "Resume", tag: "Career", grad: "from-slate-500/40 to-gray-500/20" },
];

function Templates() {
  return (
    <section id="templates" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>Templates</SectionLabel>
          <h2 className="mt-5 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Start from a <span className="text-gradient">masterpiece.</span>
          </h2>
          <p className="mt-5 text-muted-foreground">
            Hundreds of pro-designed templates to launch in minutes, not weeks.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {templates.map((t) => (
            <div
              key={t.name}
              className="group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${t.grad}`} />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/80 to-transparent p-4">
                <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{t.tag}</div>
                <div className="mt-0.5 text-sm font-semibold text-foreground">{t.name}</div>
              </div>
              <div className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/30 p-1.5 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                <ArrowRight className="h-3 w-3 text-white" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pricing                                                                    */
/* -------------------------------------------------------------------------- */

const plans = [
  {
    name: "Starter",
    price: "0",
    tagline: "For creators exploring AI.",
    features: ["100 credits / month", "Standard generation queue", "10+ AI tools", "Personal use license", "Community support"],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "29",
    tagline: "For serious creators & freelancers.",
    features: ["5,000 credits / month", "Priority generation queue", "All 13 AI tools", "Commercial license", "4K exports", "20GB cloud storage", "Email support"],
    cta: "Start 14-day trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    tagline: "For teams and agencies.",
    features: ["Unlimited credits", "Dedicated GPU capacity", "Full API access", "SSO & role management", "Unlimited cloud storage", "Custom model fine-tuning", "24/7 dedicated support"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>Pricing</SectionLabel>
          <h2 className="mt-5 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Simple pricing. <span className="text-gradient">Serious value.</span>
          </h2>
          <p className="mt-5 text-muted-foreground">Start free. Upgrade when you're ready. Cancel anytime.</p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-3xl border p-8 transition-all duration-500 hover:-translate-y-1 ${
                p.highlighted
                  ? "border-primary/40 bg-card shadow-elegant"
                  : "border-border bg-card/50"
              }`}
            >
              {p.highlighted && (
                <>
                  <div className="pointer-events-none absolute -inset-px -z-10 rounded-3xl bg-gradient-primary opacity-30 blur-xl" />
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-primary px-3.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-elegant">
                    Most popular
                  </div>
                </>
              )}
              <div className="mb-1 text-sm font-medium text-muted-foreground">{p.name}</div>
              <div className="mb-1 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-foreground">
                  {p.price === "Custom" ? "Custom" : `$${p.price}`}
                </span>
                {p.price !== "Custom" && p.price !== "0" && (
                  <span className="text-sm text-muted-foreground">/ month</span>
                )}
              </div>
              <p className="mb-6 text-sm text-muted-foreground">{p.tagline}</p>

              {p.highlighted ? (
                <GradientButton className="w-full">{p.cta}</GradientButton>
              ) : (
                <GhostButton className="w-full">{p.cta}</GhostButton>
              )}

              <ul className="mt-8 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Testimonials                                                               */
/* -------------------------------------------------------------------------- */

const testimonials = [
  { name: "Elena Ruiz", role: "Creator, 1.2M followers", quote: "Nova replaced five subscriptions. My content workflow is genuinely 10x faster and looks better than ever.", init: "ER", tint: "from-purple-500 to-pink-500" },
  { name: "Marcus Chen", role: "Founder, Vertex Labs", quote: "We shipped our brand identity, launch site, and pitch deck in a single afternoon. Investors thought we hired an agency.", init: "MC", tint: "from-blue-500 to-cyan-500" },
  { name: "Priya Kapoor", role: "Marketing Lead, Northwind", quote: "The output quality is quietly astonishing. Our campaign creative is now generated end-to-end inside Nova.", init: "PK", tint: "from-amber-500 to-rose-500" },
  { name: "David Osei", role: "Product Designer", quote: "Nova feels like tools designed by designers. Every interaction is considered — this is the SaaS I've been waiting for.", init: "DO", tint: "from-emerald-500 to-teal-500" },
];

function Testimonials() {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>Loved by creators</SectionLabel>
          <h2 className="mt-5 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            The creative community's <span className="text-gradient">new favorite tool.</span>
          </h2>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="group flex h-full flex-col rounded-3xl border border-border bg-card/60 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:bg-card"
            >
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="flex-1 text-sm leading-relaxed text-foreground">"{t.quote}"</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.tint} text-xs font-semibold text-white`}>
                  {t.init}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  FAQ                                                                        */
/* -------------------------------------------------------------------------- */

const faqs = [
  { q: "What is Nova AI?", a: "Nova AI is an all-in-one creative platform. Generate images, videos, music, voices, code, presentations, and long-form content — all from one workspace, powered by the best models available." },
  { q: "Do I own what I create?", a: "Yes. On Pro and Enterprise plans, you get full commercial rights to everything you generate. Starter is for personal use only." },
  { q: "Which AI models does Nova use?", a: "Nova intelligently routes to leading models including GPT-4, Claude, Gemini, Flux, Stable Diffusion, Llama, Whisper, ElevenLabs, Runway, and Ideogram — so you always get the best output for the job." },
  { q: "Is there a free plan?", a: "Yes — Starter gives you 100 credits every month, forever, with no credit card required." },
  { q: "Can I cancel anytime?", a: "Absolutely. Cancel with one click from your dashboard. You keep access until the end of your billing cycle." },
  { q: "Do you offer an API?", a: "Yes. Full REST and streaming APIs are included with Enterprise, and available as an add-on for Pro. Documentation is production-grade and typed end-to-end." },
];

function FAQ() {
  return (
    <section id="faq" className="relative py-28">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="mt-5 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Questions, answered.
          </h2>
        </div>

        <Accordion type="single" collapsible className="mt-14 space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="overflow-hidden rounded-2xl border border-border bg-card/50 px-6 data-[state=open]:border-primary/30 data-[state=open]:bg-card"
            >
              <AccordionTrigger className="py-5 text-left text-base font-medium text-foreground hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Final CTA                                                                  */
/* -------------------------------------------------------------------------- */

function FinalCTA({ onSignup }: { onSignup: () => void }) {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-card p-12 text-center sm:p-20">
          {/* Mesh */}
          <div className="pointer-events-none absolute inset-0 bg-mesh opacity-70" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(var(--primary)/0.35),transparent_60%)]" />

          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-balance text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Start Creating with <span className="text-gradient">AI Today.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
              Join a community of creators shipping 10x faster with Nova.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <GradientButton onClick={onSignup} className='bg-zinc-800'>
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </GradientButton>
              <GhostButton>Book a Demo</GhostButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Footer                                                                     */
/* -------------------------------------------------------------------------- */

const footerCols = [
  { title: "Products", links: ["Image AI", "Video AI", "Music AI", "Writing AI", "Voice AI"] },
  { title: "Company", links: ["About", "Pricing", "Blog", "Careers"] },
  { title: "Resources", links: ["API Docs", "Help Center", "Community", "Changelog"] },
  { title: "Legal", links: ["Privacy", "Terms", "Cookies", "Security"] },
];

function Footer() {
  return (
    <footer className="relative border-t border-border py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-6">
          {/* Brand */}
          <div className="md:col-span-2">
            <a href="#" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden shadow-elegant">
                <img src="/logo.webp" alt="Nova AI Logo" className="h-full w-full object-contain" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-foreground">Nova AI</span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The all-in-one AI creative platform. Everything you can imagine, generated in seconds.
            </p>
            <div className="mt-6 flex gap-2">
              {[Twitter, Github, Linkedin, Youtube, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {footerCols.map((c) => (
            <div key={c.title}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">{c.title}</h4>
              <ul className="space-y-3">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Nova AI, Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> SOC 2 Type II</span>
            <span className="flex items-center gap-1.5"><Cloud className="h-3.5 w-3.5" /> 99.99% Uptime</span>
            <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Global CDN</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function Landing() {
  const { data: userData, isLoading } = useGetUserQuery();
  const user = userData?.user;
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <AnimatedBackground />
      <Navbar onLogin={() => navigate("/login")} onSignup={() => navigate("/signup")} />

      <main>
        <Hero onSignup={() => navigate("/signup")} />
        <TrustedBy />
        <Features />
        <HowItWorks />
        <Comparison />
        <Models />
        <Templates />
        <Pricing />
        <Testimonials />
        <FAQ />
        <FinalCTA onSignup={() => navigate("/signup")} />
      </main>

      <Footer />
    </div>
  );
}
