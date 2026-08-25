"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  FileText,
  ShieldCheck,
  Moon,
  Sun,
  History,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
  { href: "/dashboard", label: "Verify" },
];

type SiteHeaderProps = {
  compact?: boolean;
  onBrandClick?: () => void;
};

export default function SiteHeader({ compact, onBrandClick }: SiteHeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const Brand = (
    <span className="flex items-center gap-2.5 font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
      <span className="relative">
        <span className="w-9 h-9 sm:w-10 sm:h-10 bg-[var(--accent-blue)] rounded-xl flex items-center justify-center text-white shadow-md">
          <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
        </span>
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
          <ShieldCheck className="w-2 h-2 text-white" />
        </span>
      </span>
      <span className="text-lg sm:text-xl">TruthLens</span>
    </span>
  );

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-[var(--nav-border)] bg-[var(--nav-bg)] backdrop-blur-xl">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
        {onBrandClick ? (
          <button type="button" onClick={onBrandClick} className="hover:opacity-90 transition-opacity">
            {Brand}
          </button>
        ) : (
          <Link href="/" className="hover:opacity-90 transition-opacity">
            {Brand}
          </Link>
        )}

        {!compact && (
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-[var(--accent-blue-dim)] text-[var(--accent-blue)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/history"
            aria-label="History"
            className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-dim)] text-[var(--text-muted)] hover:border-[var(--accent-blue)]"
          >
            <History size={16} />
          </Link>

          <div className="hidden sm:flex items-center gap-2">
            {session?.user ? (
              <button
                type="button"
                aria-label="Log out"
                onClick={() => signOut({ callbackUrl: "/dashboard" })}
                className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-dim)] text-[var(--text-muted)] hover:text-red-500"
              >
                <LogOut size={16} />
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-xl text-sm font-medium bg-[var(--bg-elevated)] border border-[var(--border-dim)]"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-2 rounded-xl text-sm font-bold bg-[var(--accent-blue)] text-white"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {mounted && (
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-dim)]"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-yellow-400" />
              ) : (
                <Moon className="w-4 h-4 text-[var(--accent-blue)]" />
              )}
            </button>
          )}

          <button
            type="button"
            className="md:hidden p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-dim)]"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-[var(--border-dim)] bg-[var(--bg-elevated)] px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
            >
              {link.label}
            </Link>
          ))}
          {!session?.user && (
            <div className="flex gap-2 pt-2">
              <Link href="/login" onClick={() => setOpen(false)} className="flex-1 text-center py-2.5 rounded-xl border border-[var(--border-dim)] text-sm">
                Login
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="flex-1 text-center py-2.5 rounded-xl bg-[var(--accent-blue)] text-white text-sm font-bold">
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
