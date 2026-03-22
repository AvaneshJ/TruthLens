import styles from './Loader.module.css'

const STEPS = ['NLP analysis', 'Source lookup', 'Fact matching', 'Generating verdict']

export default function Loader({ step = 0 }: { step?: number }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.spinner} />
      <div className={styles.label}>Analyzing credibility…</div>
      <div className={styles.steps}>
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`${styles.step} ${i < step ? styles.done : ''} ${i === step ? styles.active : ''}`}
          >
            <div className={styles.dot} />
            <span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
