import styles from "./about.module.css";
import Link from "next/link";

const TECH = [
  { name: "Next.js 16", role: "App frontend", color: "#3b82f6" },
  { name: "TypeScript", role: "Type safety", color: "#3178c6" },
  { name: "FastAPI", role: "Verification API", color: "#009688" },
  { name: "Gemini", role: "Planning + synthesis", color: "#3b82f6" },
  { name: "Tavily", role: "Source retrieval", color: "#0ea5e9" },
  { name: "NextAuth + Prisma", role: "Accounts & history", color: "#6366f1" },
];

const FLOW: [string, string][] = [
  ["User Input", "Headline, claim text, or screenshot"],
  ["Secure Proxy", "Next.js routes forward to FastAPI with a server API key"],
  ["Search Plan", "Gemini builds a 3-part investigation strategy"],
  ["Evidence Gather", "Tavily queries golden, consensus, and alternative domains"],
  ["Verdict", "Supported / Disputed / Unclear with certainty, bias, and sources"],
  ["History", "Optional save to your account or this device"],
];

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.tag}>About this project</div>
        <h1 className={styles.title}>What is TruthLens?</h1>
        <p className={styles.desc}>
          TruthLens is an AI-assisted news verification tool. It does not invent
          a binary &quot;real vs fake&quot; stamp from keywords alone—it gathers
          evidence from official and fact-checked sources, then returns a clear
          verdict with certainty, bias context, and citations you can open.
        </p>
        <p className={styles.desc} style={{ marginTop: "1rem" }}>
          <Link href="/dashboard" style={{ color: "var(--accent-blue)" }}>
            Open the dashboard
          </Link>{" "}
          to verify a claim.
        </p>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Data flow</h2>
        <div className={styles.flow}>
          {FLOW.map(([step, desc], i) => (
            <div key={step} className={styles.flowStep}>
              <div className={styles.flowNum}>
                {String(i + 1).padStart(2, "0")}
              </div>
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
          {TECH.map((t) => (
            <div key={t.name} className={styles.techCard}>
              <div
                className={styles.techDot}
                style={{ background: t.color }}
              />
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
          {(
            [
              [
                "1",
                "Misinformation travels faster than corrections. TruthLens slows that down with source-backed audits.",
              ],
              [
                "2",
                "Official and IFCN-certified domains are prioritized so weak SEO pages do not dominate the answer.",
              ],
              [
                "3",
                "You always see citations and an alternative view—not just a single opaque score.",
              ],
            ] as [string, string][]
          ).map(([icon, text]) => (
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
            TruthLens combines retrieval-augmented generation, source reputation,
            and a modern Next.js frontend to make claim verification usable in
            seconds—without pretending history is encrypted when it is simply
            account- or device-scoped.
          </p>
        </div>
      </section>
    </div>
  );
}
