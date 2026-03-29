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
} from "lucide-react";
import { useTheme } from "next-themes";

interface SearchHistoryResult {
  verdict?: string;
  certainty?: number;
  summary?: string;
  [key: string]: unknown;
}

interface SearchHistoryItem {
  id: string;
  query: string;
  result: SearchHistoryResult;
  createdAt: string;
}

const STORAGE_KEY = "fairgpt_temp_history";

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingResult, setViewingResult] = useState<SearchHistoryItem | null>(
    null,
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadHistory();
    }
  }, [mounted, session]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredHistory(
        history.filter(
          (item) =>
            item.query.toLowerCase().includes(query) ||
            item.result?.summary?.toLowerCase().includes(query) ||
            item.result?.verdict?.toLowerCase().includes(query),
        ),
      );
    } else {
      setFilteredHistory(history);
    }
  }, [searchQuery, history]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      if (session?.user) {
        const res = await fetch("/api/history");
        const data = await res.json();
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
      const stored = localStorage.getItem(STORAGE_KEY);
      const items = stored ? JSON.parse(stored) : [];
      setHistory(items);
      setFilteredHistory(items);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      if (session?.user) {
        await fetch("/api/history", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ searchId: id }),
        });
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
      <main className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-2 sm:px-4 py-3 max-w-6xl mx-auto backdrop-blur-md bg-slate-50/80 dark:bg-[#0f172a]/80">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 sm:gap-2 font-bold"
        >
          <div className="relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
              <ShieldCheck className="w-2 h-2 sm:w-2 sm:h-2 text-white" />
            </div>
          </div>
          <span className="font-bold text-base sm:text-xl tracking-tight">TruthLens</span>
        </Link>
        
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Desktop Search */}
          <div className="hidden sm:block relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-48 lg:w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Desktop Theme & Auth */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-3 rounded-2xl bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm transition-transform hover:scale-105"
            >
              {theme === "dark" ? (
                <Sun size={18} className="text-yellow-400" />
              ) : (
                <Moon size={18} className="text-blue-600" />
              )}
            </button>
            {session?.user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-2xl border border-blue-200 dark:border-blue-800">
                  <User size={14} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-600 hidden md:inline">
                    {session.user.name || session.user.email.split("@")[0]}
                  </span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/dashboard" })}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm transition-transform hover:scale-105 text-slate-400 hover:text-red-500"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl shadow-sm text-sm font-medium hover:border-blue-500 transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-2 bg-blue-600 text-white rounded-2xl shadow-sm text-sm font-bold hover:bg-blue-700 transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Search & Theme */}
          <div className="flex sm:hidden items-center gap-1">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm"
            >
              {theme === "dark" ? (
                <Sun size={16} className="text-yellow-400" />
              ) : (
                <Moon size={16} className="text-blue-600" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm"
            >
              {mobileMenuOpen ? (
                <X size={20} className="text-slate-600 dark:text-slate-300" />
              ) : (
                <Menu size={20} className="text-slate-600 dark:text-slate-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden absolute top-full left-0 right-0 mx-2 mt-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
            {/* Mobile Search */}
            <div className="relative p-3 border-b border-slate-200 dark:border-slate-700">
              <Search
                size={14}
                className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-xl text-sm outline-none"
              />
            </div>
            {session?.user ? (
              <button
                onClick={() => {
                  signOut({ callbackUrl: "/dashboard" });
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            ) : (
              <div className="flex">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 px-4 py-3 text-center text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border-r border-slate-200 dark:border-slate-700"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 px-4 py-3 text-center text-sm font-bold text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="flex-1 px-3 sm:px-6 pt-20 sm:pt-28 pb-12 max-w-4xl mx-auto w-full">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 mb-4 text-slate-400 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span className="text-xs sm:text-sm">Back to Dashboard</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <History className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-black">Search History</h1>
          </div>
          {!session && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl sm:rounded-2xl border border-amber-200 dark:border-amber-800">
              <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600" />
              <span className="text-xs font-medium text-amber-600">
                Temporary
              </span>
            </div>
          )}
        </div>

        {!session && history.length > 0 && (
          <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <Link
                href="/signup"
                className="text-blue-600 hover:underline font-medium"
              >
                Sign up
              </Link>{" "}
              to save your history permanently across all devices.
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-[40px] border dark:border-slate-800 shadow-xl p-12 text-center">
            <Clock
              size={48}
              className="mx-auto text-slate-300 dark:text-slate-600 mb-4"
            />
            <h2 className="text-xl font-bold mb-2">
              {searchQuery ? "No Results Found" : "No Search History"}
            </h2>
            <p className="text-slate-500 mb-6">
              {searchQuery
                ? `No searches matching "${searchQuery}"`
                : session
                  ? "Your verified searches will appear here once you start using TruthLens."
                  : "Your verified searches will appear here temporarily. Sign up to save them permanently."}
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors"
            >
              <Search size={16} />
              {searchQuery ? "Back to Search" : "Start Searching"}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {searchQuery && (
              <p className="text-sm text-slate-500 mb-2">
                Showing {filteredHistory.length} of {history.length} results for
                &quot;{searchQuery}&quot;
              </p>
            )}
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-[32px] border dark:border-slate-800 shadow-xl p-6 md:p-8 group hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={12} className="text-slate-400" />
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
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
                      {item.result?.verdict && (
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-bold ${
                            item.result.verdict === "Verified"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : item.result.verdict === "Misleading"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {item.result.verdict === "Verified" && (
                            <ShieldCheck size={10} />
                          )}
                          {item.result.verdict === "Misleading" && (
                            <AlertCircle size={10} />
                          )}
                          {item.result.verdict}
                        </span>
                      )}
                      {item.result?.certainty !== undefined && (
                        <span className="text-[10px] text-slate-400 font-bold">
                          {item.result.certainty}% certain
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setViewingResult(item)}
                      className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      View Result
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
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
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-[32px] border dark:border-slate-800 shadow-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Search Result</h2>
              <button
                onClick={() => setViewingResult(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ×
              </button>
            </div>
            <p className="text-sm font-bold text-blue-600 mb-4">
              &quot;{viewingResult.query}&quot;
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {viewingResult.result?.summary ||
                JSON.stringify(viewingResult.result)}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
