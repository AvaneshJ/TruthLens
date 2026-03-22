"use client";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useTheme } from "next-themes";
import BiasMeter from "../components/BiasMeter";
import VerificationChart from "../components/VerificationCharts";
import ExampleQueryCards from "../components/ExampleQueryCards";
import TrendChart from "../components/TrendChart";

export default function FairGPTDashboard() {
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"consensus" | "alternative">(
    "consensus"
  );

  // 🟢 Media States
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
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
    }
  };

  const verifyMediaFile = async (file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/verify-media`, {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(45000),
      });

      if (res.status === 429) {
        alert("Rate limit reached. Please wait 60 seconds.");
        return;
      }

      const data = await res.json();
      setResult(data);
      // 🟢 Clear search bar and preview after image query
      setQuery("");
      setPreviewUrl(null);
      setSelectedFile(null);
    } catch (err: any) {
      alert(
        err.name === "TimeoutError" ? "AI took too long." : "Verification Error"
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

  const handleSearch = async (forcedQuery?: string) => {
    if (selectedFile && !query && !forcedQuery) {
      verifyMediaFile(selectedFile);
      return;
    }

    const q = forcedQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setResult(null);
    setViewMode("consensus");
    try {
      const res = await fetch(`${API_BASE_URL}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server Error:", errorText);
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
      // 🟢 Clear search bar after text query
      setQuery("");
    } catch (e) {
      console.error("Search Error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col transition-all duration-500">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-6 max-w-6xl mx-auto backdrop-blur-md">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
            F
          </div>
          <span>FairGPT</span>
        </div>
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
      </nav>

      <div
        className={`flex-1 flex flex-col items-center px-6 transition-all duration-700 overflow-y-auto ${
          result ? "pt-28 pb-48" : "justify-center"
        }`}
      >
        {!result && !loading && (
          <header className="text-center mb-10 animate-in fade-in zoom-in">
            <h1 className="text-5xl font-black mb-4">
              Verify the <span className="text-blue-600">Unseen.</span>
            </h1>
            <p className="text-slate-500 mb-10 italic">
              AI-powered news audit using the Golden List.
            </p>
            <ExampleQueryCards
              onSelect={(q) => {
                setQuery(q);
                handleSearch(q);
              }}
            />
          </header>
        )}

        {loading && (
          <div className="animate-pulse text-blue-600 font-black uppercase text-sm">
            Auditing Integrity...
          </div>
        )}

        {result && (
          <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
            {/* Verdict Card */}
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-[40px] border dark:border-slate-800 shadow-2xl p-8 md:p-12 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
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

                {/* 🟢 AI CERTAINTY METER RESTORED */}
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

              {/* Restored Clarifications & Audit Trail */}
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
                      )
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
                      )
                    )}
                  </ul>
                </div>
              </div>

              {/* 🟢 GROUND TRUTH SOURCES RESTORED */}
              <div className="mt-10 border-t dark:border-slate-800 pt-8">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">
                  Ground Truth Sources
                </p>
                <div className="flex flex-wrap gap-3">
                  {(result.sources || []).map((srcObj: any, i: number) => (
                    <div key={i} className="group relative">
                      <a
                        href={srcObj?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-700 text-[11px] font-bold hover:border-blue-500 hover:text-blue-600 transition-all"
                      >
                        <Globe size={12} />
                        <span>{srcObj?.meta?.name || "Verified Source"}</span>
                        {/* 🟢 THE TICK MARK: Shown if the source is certified */}
                        {srcObj?.meta?.certified && (
                          <ShieldCheck
                            size={10}
                            className="text-blue-500 animate-in zoom-in"
                          />
                        )}
                      </a>
                      {/* 🟢 HOVER TOOLTIP CARD */}
                      <div className="absolute bottom-full mb-3 left-0 w-72 p-5 bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all z-50">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[9px] font-black uppercase text-blue-600 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            {srcObj?.meta?.type || "Standard Source"}
                          </span>
                          {srcObj?.meta?.badge && (
                            <span className="text-[8px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 px-2 py-1 rounded-lg font-bold">
                              {srcObj.meta.badge}
                            </span>
                          )}
                        </div>
                        <h5 className="text-sm font-bold mb-1">
                          {srcObj?.meta?.name}
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                          {srcObj?.meta?.focus}
                        </p>
                        <div className="flex items-center gap-2 pt-3 border-t dark:border-slate-800">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            Reliability:{" "}
                            {srcObj?.meta?.reliability || "Verified"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Analytics Grid */}
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
                    <ShieldAlert size={12} className="text-emerald-500" />
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

      <div
        className={`fixed bottom-0 left-0 right-0 p-6 z-50 bg-gradient-to-t from-slate-50 dark:from-[#0f172a] transition-all ${
          result ? "translate-y-0" : "relative mt-12"
        }`}
      >
        <div className="max-w-3xl mx-auto relative group">
          {/* Floating Image Preview */}
          {previewUrl && (
            <div className="absolute -top-24 left-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="relative group">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-2xl border-2 border-white dark:border-slate-800 shadow-xl"
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

          <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-[28px] border dark:border-slate-800 p-2 shadow-2xl">
            <label className="ml-4 p-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl group transition-all">
              <Paperclip
                size={18}
                className="text-slate-400 group-hover:text-blue-600"
              />
              <input
                type="file"
                className="hidden"
                accept="image/*,application/pdf"
                onChange={(e) => handleFileSelection(e.target.files![0])}
              />
            </label>

            <Search className="ml-5 text-slate-400" size={20} />
            <input
              type="text"
              className="w-full p-4 outline-none text-sm bg-transparent"
              placeholder={
                selectedFile
                  ? "Click verify to analyze image..."
                  : "Enter a claim or paste screenshot..."
              }
              value={query || ""}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              onPaste={handlePaste}
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="bg-blue-600 text-white px-10 py-4 rounded-[22px] font-bold transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Verify"
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function AnalyticsCard({ children, title }: { children: any; title: string }) {
  return (
    <div className="bg-white dark:bg-slate-900/40 backdrop-blur-lg p-8 rounded-[40px] border dark:border-slate-800 shadow-xl flex flex-col hover:border-slate-700/50 transition-colors">
      <div className="flex items-center gap-2 mb-8 text-slate-400">
        <Info size={14} />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}
