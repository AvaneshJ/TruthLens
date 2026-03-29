"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { toPng } from "html-to-image";
import {
  Search,
  ShieldCheck,
  Globe,
  Info,
  Moon,
  Sun,
  ShieldAlert,
  Repeat,
  CheckCircle2,
  Paperclip,
  X,
  History,
  User,
  LogOut,
  Bookmark,
  FileText,
  BookmarkCheck,
  Download,
  Menu,
} from "lucide-react";
import { useTheme } from "next-themes";
import BiasMeter from "../components/BiasMeter";
import VerificationChart from "../components/VerificationCharts";
import ExampleQueryCards from "../components/ExampleQueryCards";
import TrendChart from "../components/TrendChart";

interface TempHistoryItem {
  id: string;
  query: string;
  result: any;
  createdAt: string;
}

const getBadgeStyles = (category: string) => {
  if (!category)
    return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";

  switch (category) {
    case "Govt of India":
    case "State Government":
    case "Constitutional Body":
    case "Central Bank":
      return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
    case "IFCN Certified":
    case "Independent Fact-Check":
    case "Global Authority":
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
    case "Newspaper of Record":
    case "National Wire":
    case "Public Broadcaster":
      return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
  }
};

export default function TruthLensDashboard() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"consensus" | "alternative">(
    "consensus",
  );
  const [tempHistory, setTempHistory] = useState<TempHistoryItem[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [savedSearchId, setSavedSearchId] = useState<string | null>(null);
  const [language, setLanguage] = useState("English");

  // Chat UI States
  const [activeQuery, setActiveQuery] = useState("");
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);

  // Mobile Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fallback API URL so Vercel doesn't crash if env vars fail
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://fair-gpt-backend.onrender.com";

  useEffect(() => {
    const saved = localStorage.getItem("fairgpt_temp_history");
    if (saved) {
      setTempHistory(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => setMounted(true), []);

  const handleFileSelection = (file: File) => {
    if (!file) return;
    setSelectedFile(file);
    setQuery("");
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const exportAsImage = async () => {
    const element = document.getElementById("truth-card-content");
    if (!element) return;

    try {
      // 🟢 Generates a high-quality PNG of the dashboard
      const dataUrl = await toPng(element, {
        cacheBust: true,
        backgroundColor: theme === "dark" ? "#0f172a" : "#f8fafc",
        style: {
          padding: "20px",
          borderRadius: "40px",
        },
      });

      const link = document.createElement("a");
      link.download = `TruthLens-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const verifyMediaFile = async (file: File, userText?: string) => {
    setLoading(true);
    setResult(null);
    setViewMode("consensus");

    const formData = new FormData();
    formData.append("file", file);
    if (userText) formData.append("query", userText);

    try {
      const res = await fetch(`${API_BASE_URL}/api/verify-media`, {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(60000),
      });

      if (res.status === 429) {
        alert("Rate limit reached. Please wait 60 seconds.");
        return;
      }

      const data = await res.json();
      setResult(data);
      setIsSaved(false);
      setSavedSearchId(null);

      setQuery("");
      setPreviewUrl(null);
      setSelectedFile(null);
    } catch (err: any) {
      alert(
        err.name === "TimeoutError"
          ? "AI took too long."
          : "Verification Error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async (event: React.ClipboardEvent) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) handleFileSelection(file);
      } else if (items[i].kind === "string" && items[i].type === "text/plain") {
        items[i].getAsString((text) => setQuery(text));
      }
    }
  };

  const saveToHistory = async (searchQuery: string, searchResult: any) => {
    if (session?.user) {
      try {
        const res = await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchQuery, result: searchResult }),
        });
        const data = await res.json();
        if (data.saved) {
          setSavedSearchId(data.id);
          setIsSaved(true);
        }
      } catch (error) {
        console.error("Failed to save to history:", error);
      }
    } else {
      const tempItem: TempHistoryItem = {
        id: `temp_${Date.now()}`,
        query: searchQuery,
        result: searchResult,
        createdAt: new Date().toISOString(),
      };
      const updated = [tempItem, ...tempHistory].slice(0, 20);
      setTempHistory(updated);
      localStorage.setItem("fairgpt_temp_history", JSON.stringify(updated));
    }
  };

  const handleSearch = async (forcedQuery?: string) => {
    const q = forcedQuery || query;
    if (!q.trim() && !selectedFile) return;

    setActiveQuery(q);
    setActivePreviewUrl(previewUrl);

    if (selectedFile) {
      verifyMediaFile(selectedFile, q);
      return;
    }

    setLoading(true);
    setResult(null);
    setViewMode("consensus");
    setIsSaved(false);

    try {
      const res = await fetch(`${API_BASE_URL}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, language: language }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setResult(data);
      setQuery("");
    } catch (e) {
      console.error("Search Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResult = () => {
    if (isSaved) return;

    if (result && activeQuery) {
      saveToHistory(activeQuery, result);
    } else if (result) {
      saveToHistory("Search Result", result);
    }
    setIsSaved(true);
  };

  const handleDemoResult = (q: string, mockResult: any) => {
    setActiveQuery(q);
    setActivePreviewUrl(null);
    setResult(mockResult);
    setQuery("");
    setViewMode("consensus");
    setIsSaved(false);
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col transition-all duration-500">
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-2 sm:px-4 py-3 max-w-6xl mx-auto backdrop-blur-md bg-slate-50/80 dark:bg-[#0f172a]/80">
        <button
          onClick={() => {
            setResult(null);
            setQuery("");
            setActiveQuery("");
            setActivePreviewUrl(null);
            setIsSaved(false);
            setViewMode("consensus");
          }}
          className="flex items-center gap-1.5 sm:gap-2 font-bold hover:opacity-80 transition-opacity"
        >
          <div className="relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
              <ShieldCheck className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
            </div>
          </div>
          <span className="font-bold text-base sm:text-xl tracking-tight">TruthLens</span>
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/history"
            className="p-2 sm:px-3 sm:py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl shadow-sm hover:border-blue-500 transition-all"
          >
            <History size={16} className="text-slate-400" />
          </Link>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            {session?.user ? (
              <button
                onClick={() => signOut({ callbackUrl: "/dashboard" })}
                className="p-3 rounded-xl bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm transition-transform hover:scale-105 text-slate-400 hover:text-red-500"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl shadow-sm text-sm font-medium hover:border-blue-500 transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow-sm text-sm font-bold hover:bg-blue-700 transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 sm:p-3 rounded-xl bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm transition-transform hover:scale-105"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-yellow-400" />
            ) : (
              <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-600" />
            )}
          </button>

          {/* Mobile Hamburger Menu */}
          <div className="relative sm:hidden">
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
            
            {mobileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
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
          </div>
        </div>
      </nav>

      <div
        className={`flex-1 flex flex-col items-center px-3 sm:px-6 transition-all duration-700 overflow-y-auto ${
          result || loading || activeQuery || activePreviewUrl ? "pt-20 sm:pt-28 pb-48" : "pt-24 sm:pt-32 justify-center"
        }`}
      >
        {!result && !loading && !activeQuery && !activePreviewUrl && (
          <header className="text-center mb-2 animate-in fade-in zoom-in">
            <Link href="/">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 hover:text-blue-600 transition-colors cursor-pointer">
                Verify the <span className="text-blue-600">Unseen.</span>
              </h1>
            </Link>
            <p className="text-slate-500 mb-4 italic">
              AI-powered news audit using the Golden List.
            </p>
            {!session && (
              <p className="text-slate-400 text-sm mb-6">
                <Link
                  href="/signup"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign up
                </Link>{" "}
                to save your search history permanently.
              </p>
            )}
            <ExampleQueryCards
              onSelect={(q) => {
                setQuery(q);
                handleSearch(q);
              }}
            />
          </header>
        )}

        {/* 🟢 THE CONVERSATIONAL CHAT INTERFACE */}
        {(activeQuery || activePreviewUrl) && (result || loading) && (
          <div className="w-full max-w-4xl flex flex-col gap-10 pb-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
            {/* USER BUBBLE */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                {(session?.user as any)?.image ? (
                  <img src={(session?.user as any).image} alt="User" />
                ) : (
                  <User size={20} className="text-slate-500" />
                )}
              </div>
              <div className="flex flex-col max-w-[85%] pt-1">
                <span className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-2">
                  You
                </span>
                <div className="space-y-4">
                  {activePreviewUrl && (
                    <img
                      src={activePreviewUrl}
                      alt="Uploaded media"
                      className="max-w-xs md:max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md object-contain"
                    />
                  )}
                  {activeQuery && (
                    <p className="text-slate-800 dark:text-slate-100 text-lg md:text-xl leading-relaxed whitespace-pre-wrap">
                      {activeQuery}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* AI BUBBLE */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <span className="font-bold text-sm text-blue-600 mb-4 block">
                  TruthLens AI
                </span>

                {loading && (
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-medium bg-white dark:bg-slate-800/50 w-fit px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-700 animate-pulse">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    Auditing global sources...
                  </div>
                )}

                {result && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={exportAsImage}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
                      >
                        <Download size={14} />
                        <span>Export Card</span>
                      </button>
                      <button
                        onClick={handleSaveResult}
                        disabled={isSaved}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                          isSaved
                            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 cursor-default"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/40 dark:hover:text-emerald-300 active:scale-95"
                        }`}
                      >
                        {isSaved ? (
                          <>
                            <BookmarkCheck size={14} />
                            <span>Saved</span>
                          </>
                        ) : (
                          <>
                            <Bookmark size={14} />
                            <span>Save to History</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div
                      id="truth-card-content"
                      className="bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-[24px] sm:rounded-[40px] border dark:border-slate-800 shadow-2xl p-5 sm:p-8 md:p-12 relative"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 mt-8 md:mt-0">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="text-blue-600" size={24} />
                          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
                            Verified Verdict
                          </h2>
                        </div>
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border dark:border-slate-700 shadow-sm">
                          <button
                            onClick={() => setViewMode("consensus")}
                            className={`px-5 py-2 rounded-xl text-[10px] font-bold transition-all ${
                              viewMode === "consensus"
                                ? "bg-white dark:bg-slate-900 shadow-md text-blue-600"
                                : "text-slate-400"
                            }`}
                          >
                            Consensus
                          </button>
                          <button
                            onClick={() => setViewMode("alternative")}
                            className={`px-5 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center gap-2 ${
                              viewMode === "alternative"
                                ? "bg-white dark:bg-slate-900 shadow-md text-amber-600"
                                : "text-slate-400"
                            }`}
                          >
                            <Repeat size={12} /> Alternative
                          </button>
                        </div>

                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-2xl border dark:border-slate-800">
                          <div className="text-right leading-none">
                            <p className="text-[8px] font-black uppercase text-slate-400 mb-1">
                              AI Certainty
                            </p>
                            <p className="text-xs font-bold text-blue-600">
                              {result.certainty || 0}%
                            </p>
                          </div>
                          <div className="w-10 h-10 relative">
                            <svg className="w-full h-full -rotate-90">
                              <circle
                                cx="20"
                                cy="20"
                                r="16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3.5"
                                className="text-slate-200 dark:text-slate-800"
                              />
                              <circle
                                cx="20"
                                cy="20"
                                r="16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                className="text-blue-600 transition-all duration-1000"
                                strokeDasharray={100}
                                strokeDashoffset={100 - (result.certainty || 0)}
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <p
                        className={`text-lg md:text-xl leading-relaxed font-medium mb-12 ${
                          viewMode === "alternative"
                            ? "text-amber-800 dark:text-amber-400 italic"
                            : "text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {viewMode === "consensus"
                          ? result.summary
                          : result.counter_summary}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t dark:border-slate-800 pt-10">
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-[32px] border border-blue-100 dark:border-blue-900/30">
                          <h4 className="text-[10px] font-black uppercase text-blue-600 mb-4 tracking-widest">
                            Key Clarifications
                          </h4>
                          <ul className="text-[13px] space-y-4">
                            {(result.clarifications || []).map(
                              (p: string, i: number) => (
                                <li
                                  key={i}
                                  className="flex gap-3 text-slate-700 dark:text-slate-300"
                                >
                                  <span className="text-blue-500 font-bold">
                                    0{i + 1}
                                  </span>
                                  <span>{p}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                        <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-[32px] border border-emerald-100 dark:border-emerald-900/30">
                          <h4 className="text-[10px] font-black uppercase text-emerald-600 mb-4 tracking-widest">
                            Audit Trail
                          </h4>
                          <ul className="text-[13px] space-y-4">
                            {(result.audit_history || []).map(
                              (p: string, i: number) => (
                                <li
                                  key={i}
                                  className="flex gap-3 text-slate-700 dark:text-slate-300"
                                >
                                  <CheckCircle2
                                    size={14}
                                    className="text-emerald-500 mt-0.5"
                                  />
                                  <span>{p}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-10 border-t dark:border-slate-800 pt-8">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">
                          Ground Truth Sources
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {(result.sources || []).map(
                            (srcObj: any, i: number) => (
                              <div key={i} className="group relative">
                                <a
                                  href={srcObj?.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-700 text-[11px] font-bold hover:border-blue-500 hover:text-blue-600 transition-all"
                                >
                                  <Globe size={12} />
                                  <span>
                                    {srcObj?.meta?.name || "Verified Source"}
                                  </span>
                                  <ShieldCheck
                                    size={10}
                                    className="text-blue-500 animate-in zoom-in"
                                  />
                                </a>
                                <div className="absolute bottom-full mb-3 left-0 w-72 p-5 bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all z-50">
                                  <div className="flex justify-between items-start mb-3">
                                    <span
                                      className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${getBadgeStyles(srcObj?.meta?.category)}`}
                                    >
                                      {srcObj?.meta?.category ||
                                        "Standard Source"}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] font-bold text-slate-500">
                                        Trust:
                                      </span>
                                      <span className="text-[10px] font-black text-blue-600">
                                        {srcObj?.meta?.trust_score || 50}%
                                      </span>
                                    </div>
                                  </div>
                                  <h5 className="text-sm font-bold mb-1">
                                    {srcObj?.meta?.name}
                                  </h5>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-2">
                                    {srcObj?.url}
                                  </p>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                      <AnalyticsCard title="Sentiment Bias">
                        <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
                          <BiasMeter score={result.bias_score || 0} />
                        </div>
                      </AnalyticsCard>
                      <AnalyticsCard title="Source Integrity">
                        <div className="w-full h-full min-h-[220px]">
                          <VerificationChart data={result.verification_audit} />
                        </div>
                      </AnalyticsCard>
                      <AnalyticsCard title="Temporal Trend">
                        <div className="flex flex-col h-full min-h-[220px]">
                          <TrendChart data={result.trend_history || []} />
                        </div>
                      </AnalyticsCard>
                      <AnalyticsCard title="Logic Health">
                        <div className="flex flex-col h-full justify-between min-h-[220px]">
                          <p className="text-[12px] italic text-slate-600 dark:text-slate-400">
                            "{result.logic_audit || "Audit performed."}"
                          </p>
                          <div className="mt-auto pt-4 border-t dark:border-slate-800 flex items-center gap-2">
                            <ShieldAlert
                              size={12}
                              className="text-emerald-500"
                            />
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">
                              Analysis Complete
                            </span>
                          </div>
                        </div>
                      </AnalyticsCard>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        className={`fixed bottom-0 left-0 right-0 p-2 sm:p-6 z-50 bg-gradient-to-t from-slate-50 dark:from-[#0f172a] transition-all ${
          result || loading || activeQuery || activePreviewUrl ? "translate-y-0" : "relative mt-8 sm:mt-12"
        }`}
      >
        <div className="max-w-3xl mx-auto relative group">
          {previewUrl && (
            <div className="absolute -top-20 sm:-top-24 left-2 sm:left-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="relative group">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-2xl border-2 border-white dark:border-slate-800 shadow-xl"
                />
                <button
                  onClick={() => {
                    setPreviewUrl(null);
                    setSelectedFile(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          {/* 🟢 RESPONSIVE INPUT CONTAINER: Stacks on mobile, inline on desktop */}
          <div className="relative flex flex-col sm:flex-row items-center bg-white dark:bg-slate-900 rounded-[20px] sm:rounded-[32px] border border-slate-200 dark:border-slate-800 p-2 shadow-2xl transition-all focus-within:ring-2 focus-within:ring-blue-500/20 gap-2 sm:gap-0">
            {/* Top Row on Mobile (Attachment + Search + Input) */}
            <div className="flex items-center w-full flex-1">
              <label className="ml-1 p-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full group transition-all shrink-0">
                <Paperclip
                  size={18}
                  className="text-slate-400 group-hover:text-blue-600 sm:w-5 sm:h-5"
                />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileSelection(e.target.files![0])}
                />
              </label>

              <Search
                className="hidden sm:block ml-2 text-slate-400 shrink-0"
                size={20}
              />

              <input
                type="text"
                className="flex-1 w-full p-2 sm:p-3 ml-1 sm:ml-2 outline-none text-[14px] sm:text-[15px] bg-transparent text-slate-800 dark:text-slate-200 placeholder:text-slate-400 min-w-0"
                placeholder={
                  selectedFile
                    ? "Add text context..."
                    : "Enter a claim or paste screenshot..."
                }
                value={query || ""}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                onPaste={handlePaste}
              />
            </div>

            {/* Bottom Row on Mobile (Language + Verify Button) */}
            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-2 sm:pt-0 sm:pl-2 px-1 sm:px-0">
              <div className="relative flex items-center mr-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="appearance-none bg-transparent py-1.5 sm:py-2 pl-2 sm:pl-3 pr-6 sm:pr-8 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-0 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <option
                    className="bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                    value="English"
                  >
                    English
                  </option>
                  <option
                    className="bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                    value="Hindi"
                  >
                    हिंदी
                  </option>
                  <option
                    className="bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                    value="Tamil"
                  >
                    தமிழ்
                  </option>
                  <option
                    className="bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                    value="Telugu"
                  >
                    తెలుగు
                  </option>
                  <option
                    className="bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                    value="Bengali"
                  >
                    বাংলা
                  </option>
                  <option
                    className="bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                    value="Marathi"
                  >
                    मराठी
                  </option>
                  <option
                    className="bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                    value="Gujarati"
                  >
                    ગુજરાતી
                  </option>
                </select>
                <div className="absolute right-1 sm:right-2 pointer-events-none">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>

              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 sm:px-8 sm:py-3.5 rounded-[12px] sm:rounded-[24px] font-bold text-xs sm:text-sm transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center min-w-[80px] sm:min-w-[100px]"
              >
                {loading ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Verify"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function AnalyticsCard({ children, title }: { children: any; title: string }) {
  return (
    <div className="bg-white dark:bg-slate-900/40 backdrop-blur-lg p-4 sm:p-8 rounded-2xl sm:rounded-[40px] border dark:border-slate-800 shadow-xl flex flex-col hover:border-slate-700/50 transition-colors">
      <div className="flex items-center gap-2 mb-4 sm:mb-8 text-slate-400">
        <Info size={14} />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}
