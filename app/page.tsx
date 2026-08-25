"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Newspaper,
  BookOpen,
  Lock,
  Sparkles,
  Search,
  Layers,
  Zap,
  CheckCircle2,
  Globe,
  Mic,
} from "lucide-react";
import SiteHeader from "./components/SiteHeader";

const highlights = [
  {
    icon: ShieldCheck,
    title: "Evidence-first verdicts",
    description:
      "Supported, Disputed, or Unclear—backed by golden-list domains, wires, and certified fact-checkers.",
  },
  {
    icon: Layers,
    title: "Multi-source audit",
    description:
      "Three targeted searches run in parallel: official records, consensus coverage, and alternative context.",
  },
  {
    icon: Zap,
    title: "Live generation",
    description:
      "Watch synthesis stream token-by-token while the full structured audit card stays intact.",
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: "AI-Powered Verification",
    description:
      "Cross-checks claims against official and fact-checked sources to surface what evidence supports.",
  },
  {
    icon: FileText,
    title: "Deep Source Analysis",
    description:
      "Ranks evidence using a Golden List of government, wire, and certified fact-check domains.",
  },
  {
    icon: AlertTriangle,
    title: "Bias Detection",
    description:
      "Flags sensational framing and shows consensus alongside alternative perspectives.",
  },
  {
    icon: Newspaper,
    title: "Media Verification",
    description:
      "Reads screenshots and images, extracts the claim, then runs the same audit pipeline.",
  },
  {
    icon: BookOpen,
    title: "Temporal Tracking",
    description:
      "Rebuilds a chronological evidence timeline when dated sources are available.",
  },
  {
    icon: Lock,
    title: "Private by Design",
    description:
      "Signed-in history stays in your account. Guest history stays on this device only.",
  },
];

const TRUST_STRIP = [
  "PIB & government sources",
  "IFCN fact-checkers",
  "Wire & newspaper consensus",
  "Bias & certainty meters",
  "Streaming synthesis",
  "Image + audio intake",
  "Scrollable audit threads",
];

function useReveal<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const reveal = () => el.classList.add("is-visible");

    // Always show — never leave sections stuck invisible
    reveal();
  }, [enabled]);
  return ref;
}

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const highlightsRef = useReveal<HTMLElement>(mounted);
  const featuresRef = useReveal<HTMLElement>(mounted);
  const ctaRef = useReveal<HTMLElement>(mounted);

  useEffect(() => setMounted(true), []);

  const handleAnalyze = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => router.push("/dashboard"), 420);
  }, [router]);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[var(--bg-base)]">
        <div className="max-w-3xl mx-auto px-6 pt-32 space-y-4 animate-pulse">
          <div className="h-12 w-56 mx-auto rounded-xl bg-[var(--bg-elevated)]" />
          <div className="h-8 w-80 mx-auto rounded-lg bg-[var(--bg-elevated)]" />
          <div className="h-14 w-40 mx-auto rounded-2xl bg-[var(--bg-elevated)]" />
        </div>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden transition-all duration-500 ${
        isTransitioning ? "opacity-0 scale-[1.015]" : "opacity-100 scale-100"
      }`}
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 tl-grid-bg opacity-60" />
        <div className="tl-orb absolute -top-24 left-1/2 -translate-x-1/2 w-[820px] h-[480px] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--accent-blue-dim),_transparent_68%)] tl-glow-pulse" />
        <div className="tl-orb-delayed absolute top-48 -right-20 w-80 h-80 rounded-full bg-[radial-gradient(circle,_rgba(16,185,129,0.14),_transparent_70%)]" />
        <div className="tl-orb absolute top-[58%] -left-24 w-72 h-72 rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.1),_transparent_70%)]" />
      </div>

      <SiteHeader />

      {/* Hero */}
      <section className="relative pt-28 sm:pt-32 pb-10 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-10 items-center">
          <div className="text-center lg:text-left">
            <div className="tl-hero-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-dim)] bg-[var(--bg-elevated)]/90 backdrop-blur text-xs font-semibold text-[var(--accent-blue)] mb-6 shadow-sm">
              <Sparkles size={14} className="tl-float" />
              Enterprise-grade claim verification
            </div>
            <h1
              className="tl-hero-title text-4xl sm:text-5xl md:text-[3.4rem] font-extrabold tracking-tight leading-[1.08] mb-5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Verify news before
              <span className="block tl-shimmer-text mt-1">you amplify it</span>
            </h1>
            <p className="tl-hero-sub text-[var(--text-secondary)] text-base sm:text-lg max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              TruthLens audits headlines, screenshots, and audio against official
              records and certified fact-checkers—then streams a clear verdict
              with sources, bias, and a full audit trail.
            </p>
            <div className="tl-hero-cta flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
              <button
                type="button"
                onClick={handleAnalyze}
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-[var(--accent-blue)] text-white rounded-2xl font-bold text-base shadow-lg hover:opacity-95 hover:-translate-y-0.5 active:scale-95 transition-all tl-cta-pulse"
              >
                Start verifying
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
              <Link
                href="/features"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-base border border-[var(--border-mid)] bg-[var(--bg-elevated)]/80 backdrop-blur hover:border-[var(--accent-blue)] hover:-translate-y-0.5 transition-all"
              >
                Explore features
              </Link>
            </div>
            <div className="tl-hero-cta mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[var(--real)]" /> Streaming audits
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mic size={14} className="text-[var(--accent-blue)]" /> Voice & audio
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Globe size={14} className="text-emerald-500" /> Trusted domains
              </span>
            </div>
          </div>

          {/* Floating preview card */}
          <div className="tl-hero-preview relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 rounded-[36px] bg-[radial-gradient(circle_at_30%_20%,_var(--accent-blue-glow),_transparent_55%)] tl-glow-pulse" />
            <div className="tl-float relative rounded-[28px] border border-[var(--border-dim)] bg-[var(--bg-elevated)]/95 backdrop-blur-xl shadow-[var(--shadow-card)] p-5 sm:p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[var(--accent-blue)] text-white flex items-center justify-center shadow-md">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold">TruthLens audit</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Live preview</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-[var(--real-border)] bg-[var(--real-bg)] text-[var(--real)]">
                  ✓ Supported
                </span>
              </div>
              <div className="space-y-3 mb-5">
                <div className="h-2.5 w-full rounded-full bg-[var(--bg-surface)] overflow-hidden">
                  <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-[var(--accent-blue)] to-emerald-400 animate-pulse" />
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Consensus across golden-list and wire sources supports the claim,
                  with low sensational framing detected.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: "Golden", value: "3" },
                  { label: "Consensus", value: "4" },
                  { label: "Certainty", value: "82%" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-[var(--border-dim)] bg-[var(--bg-surface)] px-2 py-3 text-center"
                  >
                    <p className="text-sm font-extrabold text-[var(--accent-blue)]">
                      {stat.value}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="tl-float-slow flex flex-wrap gap-2">
                {["PIB", "Reuters", "Factly"].map((src) => (
                  <span
                    key={src}
                    className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border border-[var(--border-dim)] bg-[var(--bg-base)]"
                  >
                    <Globe size={10} className="text-[var(--accent-blue)]" />
                    {src}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee trust strip */}
      <section className="relative py-6 border-y border-[var(--border-dim)] bg-[var(--bg-surface)]/60 backdrop-blur-sm overflow-hidden">
        <div className="tl-marquee gap-10 px-6">
          {[...TRUST_STRIP, ...TRUST_STRIP].map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--text-secondary)] whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)]" />
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section ref={highlightsRef} className="relative px-6 py-20 tl-reveal">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {highlights.map((item, i) => (
            <div
              key={item.title}
              className="tl-card-hover rounded-3xl border border-[var(--border-dim)] bg-[var(--bg-elevated)]/80 p-6 shadow-[var(--shadow-card)]"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="tl-icon-pop w-11 h-11 rounded-2xl bg-[var(--accent-blue-dim)] text-[var(--accent-blue)] flex items-center justify-center mb-4">
                <item.icon size={22} />
              </div>
              <h3
                className="font-bold text-lg mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {item.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section
        ref={featuresRef}
        className="relative px-6 py-20 border-t border-[var(--border-dim)] bg-[var(--bg-surface)] tl-reveal"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[var(--accent-blue)] mb-2">
                Product capabilities
              </p>
              <h2
                className="text-3xl font-extrabold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Built for serious verification work
              </h2>
            </div>
            <Link
              href="/features"
              className="group text-sm font-semibold text-[var(--accent-blue)] inline-flex items-center gap-1"
            >
              See the full feature guide
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="tl-card-hover p-5 rounded-2xl border border-[var(--border-dim)] bg-[var(--bg-base)]"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                <div className="tl-icon-pop w-10 h-10 rounded-xl bg-[var(--accent-blue-dim)] text-[var(--accent-blue)] flex items-center justify-center mb-3">
                  <feature.icon size={20} />
                </div>
                <h3 className="font-bold text-base mb-1.5">{feature.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} className="relative px-6 py-20 tl-reveal">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute -inset-1 rounded-[30px] bg-gradient-to-r from-[var(--accent-blue)] via-emerald-400 to-[var(--accent-blue)] opacity-20 blur-sm tl-glow-pulse" />
          <div className="relative rounded-[28px] border border-[var(--border-dim)] bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-surface)] p-8 sm:p-12 text-center shadow-[var(--shadow-card)] overflow-hidden">
            <div className="pointer-events-none absolute inset-0 tl-grid-bg opacity-40" />
            <Search className="relative mx-auto mb-4 text-[var(--accent-blue)] tl-float" size={28} />
            <h2
              className="relative text-2xl sm:text-3xl font-extrabold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ready to audit a claim?
            </h2>
            <p className="relative text-[var(--text-secondary)] mb-7 max-w-xl mx-auto">
              Paste a headline, attach a screenshot or audio clip, or continue the
              conversation with follow-ups—all in one thread.
            </p>
            <button
              type="button"
              onClick={handleAnalyze}
              className="relative group inline-flex items-center gap-2 px-7 py-3.5 bg-[var(--accent-blue)] text-white rounded-2xl font-bold shadow-lg hover:opacity-95 hover:-translate-y-0.5 transition-all"
            >
              Open TruthLens
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-[var(--border-dim)] px-6 py-8 text-center text-sm text-[var(--text-muted)]">
        © {new Date().getFullYear()} TruthLens ·{" "}
        <Link href="/about" className="hover:text-[var(--accent-blue)]">
          About
        </Link>{" "}
        ·{" "}
        <Link href="/features" className="hover:text-[var(--accent-blue)]">
          Features
        </Link>
      </footer>
    </main>
  );
}
