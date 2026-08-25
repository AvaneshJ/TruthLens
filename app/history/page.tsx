"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  Moon,
  Sun,
  Search,
  Clock,
  Trash2,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  AlertCircle,
  History,
  LogOut,
  User,
  Info,
  FileText,
  Menu,
  X,
  HelpCircle,
} from "lucide-react";
import { useTheme } from "next-themes";
import { normalizeVerdict, VERDICT_META } from "../utils/helpers";

interface SearchHistoryResult {
  verdict?: string;
  certainty?: number;
  summary?: string;
  status?: string;
  [key: string]: unknown;
}

interface SearchHistoryItem {
  id: string;
  query: string;
  result: SearchHistoryResult;
  createdAt: string;
}

const STORAGE_KEY = "fairgpt_temp_history";

function VerdictBadge({ result }: { result: SearchHistoryResult }) {
  const verdict = normalizeVerdict(result);
  const meta = VERDICT_META[verdict];
  const Icon =
    verdict === "Supported"
      ? ShieldCheck
      : verdict === "Disputed"
        ? AlertCircle
        : HelpCircle;
  return (
    <span
      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-bold border"
      style={{
        color: meta.color,
        background: meta.bg,
        borderColor: meta.border,
      }}
    >
      <Icon size={10} />
      {meta.label}
    </span>
  );
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<SearchHistoryItem[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingResult, setViewingResult] = useState<SearchHistoryItem | null>(
    null,
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && status !== "loading") {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, session, status]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredHistory(
        history.filter(
          (item) =>
            item.query.toLowerCase().includes(query) ||
            item.result?.summary?.toLowerCase().includes(query) ||
            normalizeVerdict(item.result).toLowerCase().includes(query),
        ),
      );
    } else {
      setFilteredHistory(history);
    }
  }, [searchQuery, history]);

  const loadHistory = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      if (session?.user) {
        const res = await fetch("/api/history");
        if (res.status === 401) {
          setHistory([]);
          setFilteredHistory([]);
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          setLoadError(data.error || "Failed to load history.");
          setHistory([]);
          setFilteredHistory([]);
          return;
        }
        setHistory(data.searches || []);
        setFilteredHistory(data.searches || []);
      } else {
        const stored = localStorage.getItem(STORAGE_KEY);
        const items = stored ? JSON.parse(stored) : [];
        setHistory(items);
        setFilteredHistory(items);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
      setLoadError("Failed to load history.");
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const items = stored ? JSON.parse(stored) : [];
        setHistory(items);
        setFilteredHistory(items);
      } catch {
        setHistory([]);
        setFilteredHistory([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      if (session?.user) {
        const res = await fetch("/api/history", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ searchId: id }),
        });
        if (!res.ok) return;
        const updated = history.filter((item) => item.id !== id);
        setHistory(updated);
        setFilteredHistory(filteredHistory.filter((item) => item.id !== id));
      } else {
        const updated = history.filter((item) => item.id !== id);
        setHistory(updated);
        setFilteredHistory(filteredHistory.filter((item) => item.id !== id));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--accent-blue)]" size={32} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-2 sm:px-4 py-3 max-w-6xl mx-auto backdrop-blur-md bg-[var(--nav-bg)] border-b border-[var(--nav-border)]">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 sm:gap-2 font-bold"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <div className="relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[var(--accent-blue)] rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-md">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-2 h-2 text-white" />
            </div>
          </div>
          <span className="font-bold text-base sm:text-xl tracking-tight">
            TruthLens
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:block relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <label htmlFor="history-search" className="sr-only">
              Search history
            </label>
            <input
              id="history-search"
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-48 lg:w-64 bg-[var(--bg-elevated)] border border-[var(--border-dim)] rounded-2xl text-sm outline-none focus:border-[var(--accent-blue)] transition-colors"
            />
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-dim)] shadow-sm transition-transform hover:scale-105"
            >
              {theme === "dark" ? (
                <Sun size={18} className="text-yellow-400" />
              ) : (
                <Moon size={18} className="text-[var(--accent-blue)]" />
              )}
            </button>
            {session?.user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 bg-[var(--accent-blue-dim)] rounded-2xl border border-[var(--border-dim)]">
                  <User size={14} className="text-[var(--accent-blue)]" />
                  <span className="text-sm font-medium text-[var(--accent-blue)] hidden md:inline">
                    {session.user.name || session.user.email?.split("@")[0]}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Log out"
                  onClick={() => signOut({ callbackUrl: "/dashboard" })}
                  className="p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-dim)] shadow-sm text-[var(--text-muted)] hover:text-red-500"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-dim)] rounded-2xl shadow-sm text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-2 bg-[var(--accent-blue)] text-white rounded-2xl shadow-sm text-sm font-bold"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <div className="flex sm:hidden items-center gap-1">
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-dim)] shadow-sm"
            >
              {theme === "dark" ? (
                <Sun size={16} className="text-yellow-400" />
              ) : (
                <Moon size={16} className="text-[var(--accent-blue)]" />
              )}
            </button>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-dim)] shadow-sm"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden absolute top-full left-0 right-0 mx-2 mt-2 bg-[var(--bg-elevated)] border border-[var(--border-dim)] rounded-xl shadow-xl overflow-hidden z-50">
            <div className="relative p-3 border-b border-[var(--border-dim)]">
              <Search
                size={14}
                className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="text"
                placeholder="Search history..."
                aria-label="Search history"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[var(--bg-surface)] border-0 rounded-xl text-sm outline-none"
              />
            </div>
            {session?.user ? (
              <button
                type="button"
                onClick={() => {
                  signOut({ callbackUrl: "/dashboard" });
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm font-medium flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            ) : (
              <div className="flex">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 px-4 py-3 text-center text-sm font-medium border-r border-[var(--border-dim)]"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 px-4 py-3 text-center text-sm font-bold text-[var(--accent-blue)]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="flex-1 px-3 sm:px-6 pt-20 sm:pt-28 pb-12 max-w-4xl mx-auto w-full">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 mb-4 text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs sm:text-sm">Back to Dashboard</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <History className="w-5 h-5 sm:w-7 sm:h-7 text-[var(--accent-blue)]" />
            <h1
              className="text-2xl sm:text-3xl font-black"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Search History
            </h1>
          </div>
          {!session && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[var(--uncertain-bg)] rounded-xl sm:rounded-2xl border border-[var(--uncertain-border)]">
              <Info className="w-3 h-3 text-[var(--uncertain)]" />
              <span className="text-xs font-medium text-[var(--uncertain)]">
                Stored on this device only
              </span>
            </div>
          )}
        </div>

        {loadError && (
          <p role="alert" className="mb-4 text-sm text-[var(--fake)]">
            {loadError}
          </p>
        )}

        {!session && history.length > 0 && (
          <div className="mb-6 p-4 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-dim)]">
            <p className="text-sm text-[var(--text-secondary)]">
              <Link
                href="/signup"
                className="text-[var(--accent-blue)] hover:underline font-medium"
              >
                Sign up
              </Link>{" "}
              to keep history across devices. Guest history is stored in this
              browser only (not encrypted).
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2
              className="animate-spin text-[var(--accent-blue)]"
              size={32}
            />
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="bg-[var(--bg-elevated)] rounded-[32px] border border-[var(--border-dim)] shadow-[var(--shadow-card)] p-12 text-center">
            <Clock
              size={48}
              className="mx-auto text-[var(--text-muted)] mb-4 opacity-40"
            />
            <h2 className="text-xl font-bold mb-2">
              {searchQuery ? "No Results Found" : "No Search History"}
            </h2>
            <p className="text-[var(--text-muted)] mb-6">
              {searchQuery
                ? `No searches matching "${searchQuery}"`
                : session
                  ? "Your verified searches will appear here once you start using TruthLens."
                  : "Your verified searches will appear here on this device. Sign up to save them across devices."}
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-[var(--accent-blue)] text-white px-6 py-3 rounded-2xl font-bold hover:opacity-90 transition-colors"
            >
              <Search size={16} />
              {searchQuery ? "Back to Search" : "Start Searching"}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {searchQuery && (
              <p className="text-sm text-[var(--text-muted)] mb-2">
                Showing {filteredHistory.length} of {history.length} results for
                &quot;{searchQuery}&quot;
              </p>
            )}
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="bg-[var(--bg-elevated)] rounded-[28px] border border-[var(--border-dim)] shadow-[var(--shadow-card)] p-6 md:p-8 transition-all hover:border-[var(--border-mid)]"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={12} className="text-[var(--text-muted)]" />
                      <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 truncate">
                      {item.query}
                    </h3>
                    <div className="flex items-center gap-3 flex-wrap">
                      <VerdictBadge result={item.result || {}} />
                      {item.result?.certainty !== undefined && (
                        <span className="text-[10px] text-[var(--text-muted)] font-bold">
                          {item.result.certainty}% certain
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewingResult(item)}
                      className="px-4 py-2 bg-[var(--accent-blue-dim)] text-[var(--accent-blue)] rounded-xl text-xs font-bold hover:opacity-90 transition-colors"
                    >
                      View Result
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete search: ${item.query}`}
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                    >
                      {deletingId === item.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {viewingResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
          onClick={() => setViewingResult(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-result-title"
        >
          <div
            className="bg-[var(--bg-elevated)] rounded-[32px] border border-[var(--border-dim)] shadow-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 id="history-result-title" className="text-xl font-bold">
                Search Result
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setViewingResult(null)}
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ×
              </button>
            </div>
            <div className="mb-4">
              <VerdictBadge result={viewingResult.result || {}} />
            </div>
            <p className="text-sm font-bold text-[var(--accent-blue)] mb-4">
              &quot;{viewingResult.query}&quot;
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {viewingResult.result?.summary ||
                "No summary available for this result."}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
