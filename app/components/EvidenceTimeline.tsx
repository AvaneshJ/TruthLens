// components/EvidenceTimeline.tsx
import { History } from "lucide-react";

export interface TimelineItem {
  date: string;
  event: string;
  source: string;
}

interface EvidenceTimelineProps {
  data: TimelineItem[];
}

export default function EvidenceTimeline({ data }: EvidenceTimelineProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs italic text-center p-4 min-h-[220px]">
        <History size={24} className="mb-2 opacity-20" />
        <p>No historical timeline data detected for this claim.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[220px] overflow-y-auto pr-2">
      <div className="border-l-2 border-slate-200 dark:border-slate-700 ml-2 space-y-6 mt-2 pb-4">
        {data.map((item, index) => (
          <div
            key={index}
            className="relative pl-5 animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-blue-500 ring-4 ring-white dark:ring-[#0f172a]" />
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {item.date}
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
              {item.event}
            </p>
            {item.source && (
              <a
                href={item.source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-slate-400 hover:text-blue-500 underline truncate block mt-2 transition-colors"
              >
                Verify Source ↗
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
