'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { useThemeToggle } from '../context/ThemeContext'
import styles from './Navbar.module.css'

const links = [
  { href: '/',        label: 'Home'    },
  { href: '/analyze', label: 'Analyze' },
  { href: '/history', label: 'History' },
  { href: '/about',   label: 'About'   },
]

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4"/>
      <line x1="8" y1="1" x2="8" y2="3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="8" y1="13" x2="8" y2="15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="1" y1="8" x2="3" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="13" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="2.9" y1="2.9" x2="4.3" y2="4.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="11.7" y1="11.7" x2="13.1" y2="13.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="2.9" y1="13.1" x2="4.3" y2="11.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="11.7" y1="4.3" x2="13.1" y2="2.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M13 9.5A6 6 0 015.5 2a6 6 0 100 11A6 6 0 0013 9.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useThemeToggle()
  const router   = useRouter()
  const pathname = usePathname()
  const isHome   = pathname === "/"

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.brand}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="9" cy="9" r="6" stroke="var(--accent-blue)" strokeWidth="1.8"/>
          <line x1="13.5" y1="13.5" x2="19" y2="19" stroke="var(--accent-blue)" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="6.5" y1="9" x2="11.5" y2="9" stroke="var(--accent-blue)" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="9" y1="6.5" x2="9" y2="11.5" stroke="var(--accent-blue)" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <span className={styles.brandText}>Truth<span>Lens</span></span>
      </Link>

      <div className={styles.links}>
        {links.map(l => {
          const isActive = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href)
          return (
            <Link key={l.href} href={l.href}
              className={`${styles.link} ${isActive ? styles.active : ''}`}>
              {l.label}
            </Link>
          )
        })}
      </div>

      <div className={styles.right}>
        {/* Theme toggle — hidden on home page */}
        {!isHome && (
          <button className={styles.themeBtn} onClick={toggle} title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        )}

        {user ? (
          <>
            <span className={styles.userPill}>{user.name}</span>
            <button className={styles.btnGhost} onClick={logout}>Log out</button>
          </>
        ) : (
          <>
            <button className={styles.btnGhost} onClick={() => router.push('/login')}>Sign in</button>
            <button className={styles.btnPrimary} onClick={() => router.push('/signup')}>Sign up</button>
          </>
        )}
      </div>
    </nav>
  )
}
