import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-dim)',
      padding: '1.5rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem',
    }}>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text-muted)' }}>
        Truth<span style={{ color: 'var(--accent-blue)' }}>Lens</span>
      </span>
      <div style={{ display: 'flex', gap: '1.25rem' }}>
        {([['/', 'Home'], ['/analyze', 'Analyze'], ['/about', 'About'], ['/login', 'Login']] as [string, string][]).map(([href, label]) => (
          <Link key={href} href={href} style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>
            {label}
          </Link>
        ))}
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
        © 2025 TruthLens · AI-powered news verification
      </span>
    </footer>
  )
}
