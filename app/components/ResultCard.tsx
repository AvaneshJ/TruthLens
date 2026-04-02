import {
  ShieldCheck,
  Repeat,
  CheckCircle2,
  Globe,
  ShieldAlert,
  Download,
  Bookmark,
  BookmarkCheck,
  Info,
} from "lucide-react";
import BiasMeter from "./BiasMeter";
import VerificationChart from "./VerificationCharts";
import EvidenceTimeline from "./EvidenceTimeline";

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

const getBadgeStyles = (category: string) => {
  if (!category) return "bg-slate-100 text-slate-600 border-slate-200";
  switch (category) {
    case "Govt of India":
    case "State Government":
    case "Constitutional Body":
    case "Central Bank":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "IFCN Certified":
    case "Independent Fact-Check":
    case "Global Authority":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Newspaper of Record":
    case "National Wire":
    case "Public Broadcaster":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

export default function ResultCard({
  result,
  viewMode,
  setViewMode,
  onExport,
  onSave,
  isSaved,
}: any) {
  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full">
      <div className="flex justify-end mb-4">
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
        >
          <Download size={14} /> <span>Export Card</span>
        </button>
        <button
          onClick={onSave}
          disabled={isSaved}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ml-2 ${isSaved ? "bg-emerald-100 text-emerald-700 cursor-default" : "bg-slate-100 text-slate-500 hover:bg-emerald-50 active:scale-95"}`}
        >
          {isSaved ? (
            <>
              <BookmarkCheck size={14} /> <span>Saved</span>
            </>
          ) : (
            <>
              <Bookmark size={14} /> <span>Save to History</span>
            </>
          )}
        </button>
      </div>

      <div
        id="truth-card-content"
        className="bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-[24px] sm:rounded-[40px] border dark:border-slate-800 shadow-2xl p-5 sm:p-8 md:p-12 relative w-full"
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
              className={`px-5 py-2 rounded-xl text-[10px] font-bold transition-all ${viewMode === "consensus" ? "bg-white dark:bg-slate-900 shadow-md text-blue-600" : "text-slate-400"}`}
            >
              Consensus
            </button>
            <button
              onClick={() => setViewMode("alternative")}
              className={`px-5 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center gap-2 ${viewMode === "alternative" ? "bg-white dark:bg-slate-900 shadow-md text-amber-600" : "text-slate-400"}`}
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
            {/* Circle SVG Code here (omitted for brevity) */}
          </div>
        </div>

        <p
          className={`text-lg md:text-xl leading-relaxed font-medium mb-12 ${viewMode === "alternative" ? "text-amber-800 dark:text-amber-400 italic" : "text-slate-800 dark:text-slate-200"}`}
        >
          {viewMode === "consensus" ? result.summary : result.counter_summary}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t dark:border-slate-800 pt-10">
          <div className="bg-blue-50/50 p-6 rounded-[32px] border border-blue-100">
            <h4 className="text-[10px] font-black uppercase text-blue-600 mb-4 tracking-widest">
              Key Clarifications
            </h4>
            <ul className="text-[13px] space-y-4">
              {(result.clarifications || []).map((p: string, i: number) => (
                <li
                  key={i}
                  className="flex gap-3 text-slate-700 dark:text-slate-300"
                >
                  <span className="text-blue-500 font-bold">0{i + 1}</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-emerald-50/50 p-6 rounded-[32px] border border-emerald-100">
            <h4 className="text-[10px] font-black uppercase text-emerald-600 mb-4 tracking-widest">
              Audit Trail
            </h4>
            <ul className="text-[13px] space-y-4">
              {(result.audit_history || []).map((p: string, i: number) => (
                <li
                  key={i}
                  className="flex gap-3 text-slate-700 dark:text-slate-300"
                >
                  <CheckCircle2 size={14} className="text-emerald-500 mt-0.5" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

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
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border text-[11px] font-bold hover:border-blue-500 transition-all"
                >
                  <Globe size={12} />
                  <span>{srcObj?.meta?.name || "Verified Source"}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch w-full">
        <AnalyticsCard title="Sentiment Bias">
          <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
            <BiasMeter score={result.bias_score || 0} />
            {result.bias_reason && (
              <p className="text-[11px] text-center mt-4 max-w-[80%]">
                "{result.bias_reason}"
              </p>
            )}
          </div>
        </AnalyticsCard>
        <AnalyticsCard title="Source Integrity">
          <div className="w-full h-full min-h-[220px]">
            <VerificationChart data={result.verification_audit} />
          </div>
        </AnalyticsCard>
        <AnalyticsCard title="Chronological Timeline">
          <EvidenceTimeline data={result.evidence_timeline || []} />
        </AnalyticsCard>
        <AnalyticsCard title="Logic Health">
          <div className="flex flex-col h-full justify-between min-h-[220px]">
            <p className="text-[12px] italic">
              "{result.logic_audit || "Audit performed."}"
            </p>
            <div className="mt-auto pt-4 border-t flex items-center gap-2">
              <ShieldAlert size={12} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase">
                Analysis Complete
              </span>
            </div>
          </div>
        </AnalyticsCard>
      </div>
    </div>
  );
}
