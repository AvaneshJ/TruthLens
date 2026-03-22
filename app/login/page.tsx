'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import styles from './login.module.css'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setError('')
    setLoading(true)

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError('Invalid email or password. Please try again.')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="12" cy="12" r="8" stroke="var(--accent-blue)" strokeWidth="2"/>
            <line x1="17.5" y1="17.5" x2="24" y2="24" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round"/>
            <line x1="8.5" y1="12" x2="15.5" y2="12" stroke="var(--accent-blue)" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="12" y1="8.5" x2="12" y2="15.5" stroke="var(--accent-blue)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.sub}>Sign in to save and sync your analysis history</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <div className={styles.divider}><span>don&apos;t have an account?</span></div>

        <Link href="/signup" className={styles.guestBtn} style={{ display: 'block', textDecoration: 'none', textAlign: 'center', padding: '10px' }}>
          Create an account →
        </Link>

        <button className={styles.guestBtn} style={{ marginTop: '8px' }} onClick={() => router.push('/analyze')}>
          Continue as guest
        </button>
      </div>
    </div>
  )
}

