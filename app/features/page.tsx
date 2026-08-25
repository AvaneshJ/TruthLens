"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Search,
  Image as ImageIcon,
  MessageSquare,
  Gauge,
  History,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Network,
  ScanText,
} from "lucide-react";
import SiteHeader from "../components/SiteHeader";

const SECTIONS = [
  {
    id: "pipeline",
    icon: Network,
    title: "Agentic verification pipeline",
    body: "TruthLens does not guess from keywords alone. A planning model drafts three investigation queries, evidence is gathered from golden, consensus, and alternative domains in parallel, then a synthesis model returns a structured audit.",
    points: [
      "Planning agent → factual / official / alternative queries",
      "Parallel Tavily retrieval across trusted domain lists",
      "Tagged synthesis: summary, counter-view, clarifications, audit, bias, timeline",
    ],
  },
  {
    id: "streaming",
    icon: Sparkles,
    title: "Token streaming, same response contract",
    body: "While evidence is synthesized you see tokens appear live. When generation finishes, the UI hydrates the full result card—verdict, sources, charts—without changing the core JSON schema the product already relies on.",
    points: [
      "Progress phases: planning → searching → synthesizing",
      "Live summary tokens in the chat thread",
      "Final payload keeps SUCCESS/FAIL field structure intact",
    ],
  },
  {
    id: "chat",
    icon: MessageSquare,
    title: "Conversational follow-ups",
    body: "Previous questions and answers stay in a scrollable thread. Ask a counter-question and TruthLens can use recent context so you do not restate the entire claim every time.",
    points: [
      "Persistent in-session message history",
      "Scroll back through earlier audits",
      "Optional context forwarded with each new query",
    ],
  },
    {
      id: "media",
      icon: ScanText,
      title: "Image & audio verification",
      body: "Screenshots and share cards are read with vision OCR. Voice notes and clips are transcribed, then both run through the same evidence pipeline. Attach optional text context when media is ambiguous.",
      points: [
        "OCR text + primary claim extraction for images",
        "Mic dictation, in-app recording, and audio file upload",
        "Supports JPEG/PNG/WebP/GIF and MP3/WAV/M4A/WEBM (≤ limits)",
      ],
    },
  {
    id: "integrity",
    icon: Gauge,
    title: "Integrity surfaces",
    body: "Every successful audit exposes certainty, source mix, bias meter, chronological timeline, and openable citations so analysts can challenge the machine—not just accept a badge.",
    points: [
      "Supported / Disputed / Unclear verdicts",
      "Golden vs consensus vs raw source counts",
      "Exportable result cards and optional history save",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <SiteHeader />

      <section className="pt-28 sm:pt-32 px-6 pb-12">
        <div className="max-w-4xl mx-auto tl-fade-in">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--accent-blue)] mb-3">
            Product guide
          </p>
          <h1
            className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Features built for professional claim review
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl leading-relaxed mb-8">
            From landing to verification workspace, TruthLens is designed like an
            analyst desk: clear navigation, streaming generation, durable chat
            context, and evidence you can inspect.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--accent-blue)] text-white font-bold shadow-md hover:opacity-95"
          >
            Open verify workspace <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto space-y-6">
          {SECTIONS.map((section, i) => (
            <article
              key={section.id}
              id={section.id}
              className="rounded-3xl border border-[var(--border-dim)] bg-[var(--bg-elevated)] p-6 sm:p-8 shadow-[var(--shadow-card)] tl-fade-in"
              style={{ animationDelay: `${0.05 * i}s` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--accent-blue-dim)] text-[var(--accent-blue)] flex items-center justify-center shrink-0">
                  <section.icon size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
                    {section.title}
                  </h2>
                  <p className="text-[var(--text-secondary)] leading-relaxed">{section.body}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 pl-0 sm:pl-16">
                {section.points.map((point) => (
                  <li key={point} className="flex gap-2 text-sm text-[var(--text-secondary)]">
                    <CheckCircle2 size={16} className="text-[var(--real)] mt-0.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Search, label: "Text claims", href: "/dashboard" },
            { icon: ImageIcon, label: "Screenshot audits", href: "/dashboard" },
            { icon: History, label: "Saved history", href: "/history" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-2xl border border-[var(--border-dim)] bg-[var(--bg-surface)] p-5 hover:border-[var(--accent-blue)] transition-colors"
            >
              <item.icon className="text-[var(--accent-blue)] mb-3" size={22} />
              <p className="font-semibold">{item.label}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Jump in →</p>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--border-dim)] px-6 py-8 text-center text-sm text-[var(--text-muted)]">
        <ShieldCheck className="inline mr-1 mb-0.5" size={14} />
        TruthLens · Evidence before amplification
      </footer>
    </main>
  );
}
