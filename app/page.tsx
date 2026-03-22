'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import styles from './page.module.css'

const PHRASES = [
  'Verify before you testify...',
  "Don't share what you can't verify...",
  'The truth deserves a second look...',
  'Real news. Verified. Every time.',
]

const FEATURES = [
  {
    title: 'Analyze any headline instantly',
    desc: 'Paste a news headline and get a Real, Fake, or Uncertain verdict with a confidence score in under 2 seconds.',
    dir: 'right',
  },
  {
    title: 'Verify URLs from any news source',
    desc: 'Drop in a link to any article — TruthLens checks source reputation and cross-references fact-checking databases.',
    dir: 'left',
  },
  {
    title: 'Read screenshots of news articles',
    desc: 'Upload a screenshot from WhatsApp, Twitter, or anywhere — AI extracts and analyzes the text for you.',
    dir: 'right',
  },
  {
    title: 'Full explanation with every verdict',
    desc: 'Every result includes signal-by-signal reasoning and suggested credible sources so you can dig deeper.',
    dir: 'left',
  },
]

function TypewriterText() {
  const [display, setDisplay] = useState('')
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const phrase = PHRASES[phraseIdx]
    let timeout: ReturnType<typeof setTimeout>

    if (!deleting) {
      if (charIdx < phrase.length) {
        timeout = setTimeout(() => {
          setDisplay(phrase.slice(0, charIdx + 1))
          setCharIdx(c => c + 1)
        }, 55)
      } else {
        timeout = setTimeout(() => setDeleting(true), 1800)
      }
    } else {
      if (charIdx > 0) {
        timeout = setTimeout(() => {
          setDisplay(phrase.slice(0, charIdx - 1))
          setCharIdx(c => c - 1)
        }, 30)
      } else {
        setDeleting(false)
        setPhraseIdx(i => (i + 1) % PHRASES.length)
      }
    }
    return () => clearTimeout(timeout)
  }, [charIdx, deleting, phraseIdx])

  return (
    <div className={styles.twWrap}>
      <span className={styles.twText}>{display}</span>
      <span className={styles.cursor} />
    </div>
  )
}

function FeatureItem({ title, desc, dir, index }: { title: string; desc: string; dir: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`${styles.featItem} ${dir === 'right' ? styles.fromRight : styles.fromLeft} ${visible ? styles.visible : ''}`}
      style={{ transitionDelay: visible ? `${index * 0.5}s` : '0s' }}
    >
      <div className={styles.featBullet} />
      <div>
        <div className={styles.featTitle}>{title}</div>
        <div className={styles.featDesc}>{desc}</div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()

  return (
    <div style={{width:"100%"}}>

      {/* ── HERO ── */}
      <section style={{width:"100%", background:"var(--bg-base)"}}>
      <div className={styles.hero}>

        {/* Newspaper background */}
        <div className={styles.npBg} aria-hidden>
          {([
            { h: 60,  head: 'World news —',           sym: '§',  symPos: { top: 4, right: 8 },  lines: ['w9','w7','w8'] },
            { h: 55,  img: 28, head: null,             sym: '!',  symPos: { top: 4, right: 8 },  lines: ['w8','w6'] },
            { h: 58,  head: 'Fact check —',            sym: '?',  symPos: { top: 4, right: 8 },  lines: ['w9','w5','w7'] },
            { h: 52,  img: 24, head: null,             sym: '#',  symPos: { top: 4, right: 8 },  lines: ['w8','w9'] },
            { h: 110, head: 'Breaking — officials warn', sym: '§', symPos: { top: 6, right: 10 }, lines: ['w9','w7','w8','w5'], byline: true },
            { h: 130, img: 52, head: null,             sym: '©',  symPos: { bottom: 8, right: 8 }, lines: ['w8','w6'] },
            { h: 80,  head: 'Sources say —',           sym: '?!', symPos: { top: 4, right: 10 }, lines: ['w9','w7','w8'] },
            { h: 80,  head: null,                      sym: '#',  symPos: { top: 5, right: 8 },  lines: ['w8','w9'] },
            { h: 140, img: 64, head: 'Study finds new —', sym: '★', symPos: { bottom: 6, left: 8 }, lines: ['w9','w7','w5'] },
            { h: 70,  head: null,                      sym: '!',  symPos: { top: 6, right: 8 },  lines: ['w8','w9','w6'] },
            { h: 95,  head: 'Report — experts claim',  sym: '%',  symPos: { top: 4, right: 8 },  lines: ['w9','w8','w7'] },
            { h: 110, img: 44, head: null,             sym: '@',  symPos: { bottom: 6, right: 8 }, lines: ['w8','w6'] },
            { h: 85,  head: 'Viral post claims —',     sym: '??', symPos: { top: 5, right: 8 },  lines: ['w9','w7','w8','w5'] },
            { h: 150, img: 80, head: 'Officials deny —', sym: '†', symPos: { top: 6, right: 8 }, lines: ['w8','w9'] },
            { h: 90,  head: null,                      sym: '#',  symPos: { bottom: 6, left: 8 }, lines: ['w8','w9','w6','w7'] },
            { h: 50,  head: 'Unverified —',            sym: '!',  symPos: { top: 4, right: 8 },  lines: ['w7','w5'] },
          ] as { h:number; img?:number; head:string|null; sym:string; symPos:React.CSSProperties; lines:string[]; byline?:boolean }[]).map((b, i) => (
            <div key={i} className={styles.npBlock} style={{ height: b.h }}>
              {b.img && <div className={styles.npImg} style={{ height: b.img }} />}
              {b.head && <div className={styles.npBighead}>{b.head}</div>}
              <div className={styles.npRule} />
              <div className={styles.npBody}>
                {b.lines.map((w, j) => <div key={j} className={`${styles.npLine} ${styles[w]}`} />)}
              </div>
              {b.byline && <div className={styles.npByline} />}
              <span className={styles.npSym} style={b.symPos}>{b.sym}</span>
            </div>
          ))}
        </div>

        <div className={styles.npFade} aria-hidden />
        <div className={styles.heroGlow} aria-hidden />

        <div className={styles.heroContent}>
          <div className={styles.heroPill}>AI · News · Verification</div>
          <h1 className={styles.heroTitle}>
            Don&apos;t just read.<br />
            <span className={styles.heroAccent}>Verify.</span>
          </h1>
          <TypewriterText />
          <button className={styles.heroBtn} onClick={() => router.push('/analyze')}>
            Start verifying
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      </section>

      <div className={styles.sectDiv} />

      {/* ── FEATURES ── */}
      <section className={styles.features}>
        <div className={styles.bgLines} aria-hidden>
          {[68,112,156,200,244,288,332].map(top => <div key={top} className={styles.bgLine} style={{ top }} />)}
        </div>
        <div className={styles.bgSymbols} aria-hidden>
          {[
            { t:18,l:28,v:'##' }, { t:40,r:44,v:'!' }, { t:80,l:60,v:'?' }, { t:70,r:80,v:'§' },
            { t:130,l:32,v:'!!' }, { t:150,r:36,v:'#' }, { t:200,l:52,v:'?!' }, { t:185,r:60,v:'@' },
            { t:240,l:24,v:'§' }, { t:255,r:42,v:'??' }, { t:290,l:66,v:'#!' }, { t:310,r:28,v:'★' },
            { t:340,l:36,v:'!' }, { t:355,r:64,v:'%' },
          ].map((s, i) => (
            <span key={i} className={styles.bgSym} style={{ top: s.t, left: s.l, right: s.r } as React.CSSProperties}>{s.v}</span>
          ))}
        </div>

        <div className={styles.featLabel}>What TruthLens does</div>
        <div className={styles.featList}>
          {FEATURES.map((f, i) => (
            <FeatureItem key={i} title={f.title} desc={f.desc} dir={f.dir} index={i} />
          ))}
        </div>
      </section>

      {/* ── BARE CTA ── */}
      <section className={styles.ctaBare}>
        <div className={styles.ctaDivider} />
        <div className={styles.ctaQ}>Seen a suspicious headline today?</div>
        <div className={styles.ctaRow}>
          <span className={styles.ctaText}>
            Don&apos;t scroll past it. <span className={styles.ctaAccent}>Verify it.</span>
          </span>
          <button className={styles.ctaBtn} onClick={() => router.push('/analyze')}>
            Analyze it now
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </section>

    </div>
  )
}
