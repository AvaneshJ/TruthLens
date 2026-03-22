'use client'

import { useEffect, useRef } from 'react'
import { VERDICT_META } from '../utils/helpers'
import type { AnalysisResult } from '../utils/helpers'
import styles from './ResultCard.module.css'

const SIGNAL_DOT: Record<string, string> = {
  ok:   'var(--real)',
  warn: 'var(--uncertain)',
  bad:  'var(--fake)',
  info: 'var(--accent-blue)',
}

interface ResultCardProps {
  result: AnalysisResult
  onDeepDive?: () => void
}

export default function ResultCard({ result, onDeepDive }: ResultCardProps) {
  const meta    = VERDICT_META[result.verdict] || VERDICT_META.UNCERTAIN
  const fillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (fillRef.current) fillRef.current.style.width = result.confidence + '%'
    })
    return () => cancelAnimationFrame(raf)
  }, [result.confidence])

  return (
    <div className={`${styles.card} animate-fade-up`}>
      {/* Verdict Header */}
      <div className={styles.verdictBar} style={{ borderColor: meta.border, background: meta.bg }}>
        <div className={styles.verdictIcon} style={{ color: meta.color, borderColor: meta.border }}>
          {meta.icon}
        </div>
        <div>
          <div className={styles.verdictLabel} style={{ color: meta.color }}>{meta.label}</div>
          <div className={styles.verdictSummary}>{result.summary}</div>
        </div>
      </div>

      {/* Confidence */}
      <div className={styles.section}>
        <div className={styles.confHeader}>
          <span className={styles.sectionLabel}>Confidence score</span>
          <span className={styles.confNum} style={{ color: meta.color }}>{result.confidence}%</span>
        </div>
        <div className={styles.confTrack}>
          <div
            ref={fillRef}
            className={styles.confFill}
            style={{ width: '0%', background: meta.color, transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </div>
      </div>

      {/* Signals */}
      {result.signals?.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Analysis signals</div>
          <div className={styles.signals}>
            {result.signals.map((s, i) => (
              <div key={i} className={styles.signalRow}>
                <div className={styles.signalDot} style={{ background: SIGNAL_DOT[s.type] || SIGNAL_DOT.info }} />
                <span className={styles.signalText}>{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources */}
      {result.sources?.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Suggested sources</div>
          <div className={styles.pills}>
            {result.sources.map((s, i) => (
              <span key={i} className={styles.sourcePill}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        {onDeepDive && (
          <button className={styles.btnPrimary} onClick={onDeepDive}>Deep analysis →</button>
        )}
        <button
          className={styles.btnGhost}
          onClick={() => navigator.clipboard.writeText(
            `TruthLens verdict: ${meta.label} (${result.confidence}% confidence)\n${result.summary}`
          )}
        >
          Copy result
        </button>
      </div>
    </div>
  )
}
