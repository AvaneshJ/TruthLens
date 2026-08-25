"use client";

import {
  ShieldCheck,
  Globe,
  Info,
  ShieldAlert,
  Repeat,
  CheckCircle2,
  History,
  Bookmark,
  BookmarkCheck,
  Download,
} from "lucide-react";
import BiasMeter from "./BiasMeter";
import VerificationChart from "./VerificationCharts";
import StreamingText from "./StreamingText";
import {
  sanitizeHttpUrl,
  normalizeVerdict,
  VERDICT_META,
} from "../utils/helpers";

type Props = {
  result: any;
  viewMode: "consensus" | "alternative";
  onViewModeChange: (mode: "consensus" | "alternative") => void;
  isSaved?: boolean;
  saveError?: string | null;
  onSave?: () => void;
  onExport?: () => void;
  cardId?: string;
  streamingText?: string | null;
  phase?: string | null;
};

const getBadgeStyles = (category: string) => {
  if (!category)
    return "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-dim)]";

  switch (category) {
    case "Govt of India":
    case "State Government":
    case "Constitutional Body":
    case "Central Bank":
      return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
    case "IFCN Certified":
    case "Independent Fact-Check":
    case "Global Authority":
      return "bg-[var(--accent-blue-dim)] text-[var(--accent-blue)] border-[var(--border-mid)]";
    case "Newspaper of Record":
    case "National Wire":
    case "Public Broadcaster":
      return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
    default:
      return "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-dim)]";
  }
};

function AnalyticsCard({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="bg-[var(--bg-elevated)] backdrop-blur-lg p-4 sm:p-8 rounded-2xl sm:rounded-[28px] border border-[var(--border-dim)] shadow-[var(--shadow-card)] flex flex-col hover:border-[var(--border-mid)] transition-colors">
      <div className="flex items-center gap-2 mb-4 sm:mb-8 text-[var(--text-muted)]">
        <Info size={14} />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

export default function VerificationResultCard({
  result,
  viewMode,
  onViewModeChange,
  isSaved = false,
  saveError = null,
  onSave,
  onExport,
  cardId = "truth-card-content",
  streamingText = null,
  phase = null,
}: Props) {
  const displayVerdict = result ? normalizeVerdict(result) : null;
  const verdictMeta = displayVerdict ? VERDICT_META[displayVerdict] : null;

  const summaryText =
    viewMode === "consensus" ? result?.summary : result?.counter_summary;
  const showStreaming =
    streamingText != null && streamingText !== "" && !summaryText;

  return (
    <div className="space-y-4 tl-result-reveal">
      {phase && (
        <span className="text-xs text-[var(--text-muted)] block mb-2">{phase}</span>
      )}

      {(onExport || onSave) && (
        <div className="flex flex-wrap justify-end gap-2 mb-4">
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent-blue)] text-white rounded-xl text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-md"
            >
              <Download size={14} />
              <span>Export Card</span>
            </button>
          )}
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={isSaved}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isSaved
                  ? "bg-[var(--real-bg)] text-[var(--real)] cursor-default"
                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:bg-[var(--real-bg)] hover:text-[var(--real)] active:scale-95"
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
          )}
        </div>
      )}
      {saveError && (
        <p role="alert" className="text-xs text-[var(--fake)] text-right">
          {saveError}
        </p>
      )}

      <div
        id={cardId}
        className="bg-[var(--bg-elevated)] backdrop-blur-xl rounded-[24px] sm:rounded-[32px] border border-[var(--border-dim)] shadow-[var(--shadow-card)] p-5 sm:p-8 md:p-12 relative"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 mt-2 md:mt-0">
          <div className="flex items-center gap-3 flex-wrap">
            <ShieldCheck className="text-[var(--accent-blue)]" size={24} />
            <h2 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
              Verified Verdict
            </h2>
            {verdictMeta && (
              <span
                className="text-xs font-bold px-3 py-1 rounded-lg border"
                style={{
                  color: verdictMeta.color,
                  background: verdictMeta.bg,
                  borderColor: verdictMeta.border,
                }}
              >
                {verdictMeta.icon} {verdictMeta.label}
              </span>
            )}
          </div>
          <div className="flex items-center bg-[var(--bg-surface)] p-1 rounded-2xl border border-[var(--border-dim)] shadow-sm">
            <button
              type="button"
              onClick={() => onViewModeChange("consensus")}
              className={`px-5 py-2 rounded-xl text-[10px] font-bold transition-all ${
                viewMode === "consensus"
                  ? "bg-[var(--bg-elevated)] shadow-md text-[var(--accent-blue)]"
                  : "text-[var(--text-muted)]"
              }`}
            >
              Consensus
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("alternative")}
              className={`px-5 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center gap-2 ${
                viewMode === "alternative"
                  ? "bg-[var(--bg-elevated)] shadow-md text-amber-600"
                  : "text-[var(--text-muted)]"
              }`}
            >
              <Repeat size={12} /> Alternative
            </button>
          </div>

          <div className="flex items-center gap-3 bg-[var(--bg-surface)] px-4 py-2 rounded-2xl border border-[var(--border-dim)]">
            <div className="text-right leading-none">
              <p className="text-[8px] font-black uppercase text-[var(--text-muted)] mb-1">
                AI Certainty
              </p>
              <p className="text-xs font-bold text-[var(--accent-blue)]">
                {result?.certainty || 0}%
              </p>
            </div>
            <div className="w-10 h-10 relative">
              <svg className="w-full h-full -rotate-90" aria-hidden>
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  className="text-[var(--border-mid)]"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="text-[var(--accent-blue)] transition-all duration-1000"
                  strokeDasharray={100}
                  strokeDashoffset={100 - (result?.certainty || 0)}
                />
              </svg>
            </div>
          </div>
        </div>

        <p
          className={`text-lg md:text-xl leading-relaxed font-medium mb-12 ${
            viewMode === "alternative"
              ? "text-amber-800 dark:text-amber-400 italic"
              : "text-[var(--text-primary)]"
          }`}
        >
          {showStreaming ? (
            <StreamingText text={streamingText!} active />
          ) : (
            summaryText
          )}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-[var(--border-dim)] pt-10">
          <div className="bg-[var(--accent-blue-dim)] p-6 rounded-[24px] border border-[var(--border-dim)]">
            <h4 className="text-[10px] font-black uppercase text-[var(--accent-blue)] mb-4 tracking-widest">
              Key Clarifications
            </h4>
            {(result?.clarifications || []).length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] italic">
                No clarifications returned for this claim.
              </p>
            ) : (
              <ul className="text-[13px] space-y-4">
                {(result?.clarifications || []).map((p: string, i: number) => (
                  <li
                    key={i}
                    className="flex gap-3 text-[var(--text-secondary)]"
                  >
                    <span className="text-[var(--accent-blue)] font-bold">
                      0{i + 1}
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-[var(--real-bg)] p-6 rounded-[24px] border border-[var(--real-border)]">
            <h4 className="text-[10px] font-black uppercase text-[var(--real)] mb-4 tracking-widest">
              Audit Trail
            </h4>
            {(result?.audit_history || []).length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] italic">
                No audit steps returned.
              </p>
            ) : (
              <ul className="text-[13px] space-y-4">
                {(result?.audit_history || []).map((p: string, i: number) => (
                  <li
                    key={i}
                    className="flex gap-3 text-[var(--text-secondary)]"
                  >
                    <CheckCircle2
                      size={14}
                      className="text-[var(--real)] mt-0.5"
                    />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--border-dim)] pt-8">
          <p className="text-[10px] font-black uppercase text-[var(--text-muted)] mb-4 tracking-widest">
            Ground Truth Sources
          </p>
          <div className="flex flex-wrap gap-3">
            {(result?.sources || []).map((srcObj: any, i: number) => {
              const safeUrl = sanitizeHttpUrl(srcObj?.url);
              if (!safeUrl) return null;
              return (
                <div key={i} className="group relative">
                  <a
                    href={safeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-dim)] text-[11px] font-bold hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]"
                  >
                    <Globe size={12} />
                    <span>{srcObj?.meta?.name || "Verified Source"}</span>
                    <ShieldCheck
                      size={10}
                      className="text-[var(--accent-blue)]"
                    />
                  </a>
                  <div className="absolute bottom-full mb-3 left-0 w-72 p-5 bg-[var(--bg-elevated)] rounded-3xl border border-[var(--border-dim)] shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto transition-all z-50">
                    <div className="flex justify-between items-start mb-3">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${getBadgeStyles(srcObj?.meta?.category)}`}
                      >
                        {srcObj?.meta?.category || "Standard Source"}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-[var(--text-muted)]">
                          Trust:
                        </span>
                        <span className="text-[10px] font-black text-[var(--accent-blue)]">
                          {srcObj?.meta?.trust_score || 50}%
                        </span>
                      </div>
                    </div>
                    <h5 className="text-sm font-bold mb-1">
                      {srcObj?.meta?.name}
                    </h5>
                    <p className="text-[10px] text-[var(--text-muted)] truncate mt-2">
                      {safeUrl}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <AnalyticsCard title="Sentiment Bias">
          <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
            <BiasMeter score={result?.bias_score || 0} />
            {result?.bias_reason && (
              <p className="text-[11px] text-center text-[var(--text-muted)] mt-4 max-w-[80%] leading-relaxed">
                &quot;{result.bias_reason}&quot;
              </p>
            )}
          </div>
        </AnalyticsCard>

        <AnalyticsCard title="Source Integrity">
          <div className="w-full h-full min-h-[220px]">
            <VerificationChart data={result?.verification_audit} />
          </div>
        </AnalyticsCard>

        <AnalyticsCard title="Chronological Timeline">
          <div className="flex flex-col h-full min-h-[220px] overflow-y-auto pr-2">
            {result?.evidence_timeline &&
            result.evidence_timeline.length > 0 ? (
              <div className="border-l-2 border-[var(--border-mid)] ml-2 space-y-6 mt-2 pb-4">
                {result.evidence_timeline.map((item: any, index: number) => {
                  const src = sanitizeHttpUrl(item.source);
                  return (
                    <div key={index} className="relative pl-5">
                      <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-[var(--accent-blue)] ring-4 ring-[var(--bg-base)]" />
                      <span className="text-[10px] font-black text-[var(--accent-blue)] uppercase tracking-wider">
                        {item.date}
                      </span>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                        {item.event}
                      </p>
                      {src && (
                        <a
                          href={src}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent-blue)] underline truncate block mt-2 transition-colors"
                        >
                          Verify Source ↗
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] text-xs italic text-center p-4">
                <History size={24} className="mb-2 opacity-20" />
                <p>No historical timeline data detected for this claim.</p>
              </div>
            )}
          </div>
        </AnalyticsCard>

        <AnalyticsCard title="Logic Health">
          <div className="flex flex-col h-full justify-between min-h-[220px]">
            <p className="text-[12px] italic text-[var(--text-secondary)]">
              &quot;
              {result?.logic_audit || "Audit performed."}
              &quot;
            </p>
            <div className="mt-auto pt-4 border-t border-[var(--border-dim)] flex items-center gap-2">
              <ShieldAlert size={12} className="text-[var(--real)]" />
              <span className="text-[10px] font-bold text-[var(--real)] uppercase tracking-tighter">
                Analysis Complete
              </span>
            </div>
          </div>
        </AnalyticsCard>
      </div>
    </div>
  );
}
