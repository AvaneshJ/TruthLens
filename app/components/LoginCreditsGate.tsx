"use client";

import Link from "next/link";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { GUEST_FREE_GENERATIONS } from "@/lib/guestCredits";

type Props = {
  open: boolean;
  onClose?: () => void;
};

export default function LoginCreditsGate({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="credits-gate-title"
    >
      <div className="w-full max-w-md rounded-3xl border border-[var(--border-dim)] bg-[var(--bg-elevated)] shadow-2xl p-7 sm:p-8 tl-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-blue-dim)] text-[var(--accent-blue)] flex items-center justify-center mb-5">
          <Lock size={26} />
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-[var(--accent-blue)] mb-2 flex items-center gap-1.5">
          <Sparkles size={12} /> Free credits used
        </p>
        <h2
          id="credits-gate-title"
          className="text-2xl font-extrabold mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Log in to keep verifying
        </h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
          Guests get {GUEST_FREE_GENERATIONS} free generations. Create a free
          account or sign in to unlock more credits and save your audit history.
        </p>
        <div className="flex flex-col gap-2.5">
          <Link
            href="/signup?next=/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[var(--accent-blue)] text-white font-bold hover:opacity-95"
          >
            Sign up free <ArrowRight size={16} />
          </Link>
          <Link
            href="/login?next=/dashboard"
            className="inline-flex items-center justify-center w-full py-3.5 rounded-2xl border border-[var(--border-mid)] bg-[var(--bg-surface)] font-semibold text-sm hover:border-[var(--accent-blue)]"
          >
            Log in
          </Link>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="mt-1 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              Dismiss and review previous results
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
