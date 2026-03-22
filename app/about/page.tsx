import styles from './about.module.css'

const TECH = [
  { name: 'Next.js 14',   role: 'React framework',    color: '#ffffff' },
  { name: 'TypeScript',   role: 'Type safety',         color: '#3178c6' },
  { name: 'CSS Modules',  role: 'Scoped styling',      color: '#f7df1e' },
  { name: 'Context API',  role: 'State management',    color: '#764abc' },
  { name: 'Claude AI',    role: 'NLP + fact analysis', color: '#3b82f6' },
  { name: 'App Router',   role: 'File-based routing',  color: '#000000' },
]

const FLOW: [string, string][] = [
  ['User Input',   'Headline, URL, or screenshot'],
  ['Input Layer',  'Type detection + validation'],
  ['API Call',     'Anthropic Claude API'],
  ['AI Analysis',  'NLP + credibility reasoning'],
  ['Verdict',      'REAL / FAKE / UNCERTAIN + signals'],
  ['History',      'Saved to localStorage'],
]

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.tag}>About this project</div>
        <h1 className={styles.title}>What is TruthLens?</h1>
        <p className={styles.desc}>
          TruthLens is an AI-powered news authenticator designed to fight misinformation.
          It classifies news content as <strong>Real</strong>, <strong>Fake</strong>, or{' '}
          <strong>Uncertain</strong> by running deep language analysis using large language
          models — no rigid keyword rules, just genuine AI reasoning.
        </p>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Data flow</h2>
        <div className={styles.flow}>
          {FLOW.map(([step, desc], i) => (
            <div key={step} className={styles.flowStep}>
              <div className={styles.flowNum}>{String(i + 1).padStart(2, '0')}</div>
              <div>
                <div className={styles.flowTitle}>{step}</div>
                <div className={styles.flowDesc}>{desc}</div>
              </div>
              {i < FLOW.length - 1 && <div className={styles.flowArrow}>↓</div>}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Tech stack</h2>
        <div className={styles.techGrid}>
          {TECH.map(t => (
            <div key={t.name} className={styles.techCard}>
              <div className={styles.techDot} style={{ background: t.color }} />
              <div>
                <div className={styles.techName}>{t.name}</div>
                <div className={styles.techRole}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Why it matters</h2>
        <div className={styles.cards}>
          {([
            ['📰', 'Fake news spreads 6× faster than real news on social media (MIT study, 2018).'],
            ['🤖', 'AI can detect linguistic patterns used in misinformation before humans can.'],
            ['🔍', 'Fact-checking by hand is slow — TruthLens gives a verdict in under 2 seconds.'],
          ] as [string, string][]).map(([icon, text]) => (
            <div key={text} className={styles.card}>
              <span className={styles.cardIcon}>{icon}</span>
              <p className={styles.cardText}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.builtBy}>
          <div className={styles.builtTag}>Built with purpose</div>
          <p className={styles.builtText}>
            TruthLens was created as a final-year project to demonstrate the practical
            use of AI in combating digital misinformation. It combines NLP, image analysis,
            and modern frontend architecture to deliver a fast, usable verification tool.
          </p>
        </div>
      </section>
    </div>
  )
}
