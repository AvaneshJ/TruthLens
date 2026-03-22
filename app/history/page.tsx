'use client'

import { useRouter } from 'next/navigation'
import { useAnalysis } from '../context/AnalysisContext'
import { VERDICT_META, truncate, timeAgo } from '../utils/helpers'
import styles from './history.module.css'

export default function HistoryPage() {
  const { history, clearHistory, setResult, setInputData } = useAnalysis()
  const router = useRouter()

  const handleReopen = (entry: (typeof history)[number]) => {
    setInputData({ type: (entry.type as 'headline' | 'url' | 'image') || 'headline', value: entry.input })
    setResult(entry)
    router.push('/analyze')
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>History</h1>
          <p className={styles.sub}>
            {history.length} past {history.length === 1 ? 'check' : 'checks'} stored locally
          </p>
        </div>
        {history.length > 0 && (
          <button
            className={styles.clearBtn}
            onClick={() => { if (confirm('Clear all history?')) clearHistory() }}
          >
            Clear all
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🕘</div>
          <div className={styles.emptyTitle}>No history yet</div>
          <p className={styles.emptyDesc}>Your past analyses will appear here. Go analyze something!</p>
          <button className={styles.goBtn} onClick={() => router.push('/analyze')}>
            Go to Analyze →
          </button>
        </div>
      ) : (
        <div className={styles.list}>
          {history.map((entry, i) => {
            const meta = VERDICT_META[entry.verdict] || VERDICT_META.UNCERTAIN
            return (
              <div
                key={i}
                className={styles.item}
                onClick={() => handleReopen(entry)}
                title="Click to reopen"
              >
                <div className={styles.itemLeft}>
                  <div className={styles.dot} style={{ background: meta.color }} />
                  <div>
                    <div className={styles.itemText}>{truncate(entry.input, 90)}</div>
                    <div className={styles.itemMeta}>
                      <span className={styles.typePill}>{entry.type || 'headline'}</span>
                      <span className={styles.timestamp}>{timeAgo(entry.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.itemRight}>
                  <span
                    className={styles.verdict}
                    style={{ color: meta.color, borderColor: meta.border, background: meta.bg }}
                  >
                    {entry.verdict}
                  </span>
                  <span className={styles.confidence}>{entry.confidence}%</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
