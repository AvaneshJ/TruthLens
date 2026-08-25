export interface VerdictMeta {
  label: string
  color: string
  bg: string
  border: string
  icon: string
}

export const VERDICT_META: Record<string, VerdictMeta> = {
  Supported: {
    label: 'Supported',
    color: 'var(--real)',
    bg: 'var(--real-bg)',
    border: 'var(--real-border)',
    icon: '✓',
  },
  Disputed: {
    label: 'Disputed',
    color: 'var(--fake)',
    bg: 'var(--fake-bg)',
    border: 'var(--fake-border)',
    icon: '✕',
  },
  Unclear: {
    label: 'Unclear',
    color: 'var(--uncertain)',
    bg: 'var(--uncertain-bg)',
    border: 'var(--uncertain-border)',
    icon: '?',
  },
  // Legacy aliases
  REAL: {
    label: 'Supported',
    color: 'var(--real)',
    bg: 'var(--real-bg)',
    border: 'var(--real-border)',
    icon: '✓',
  },
  FAKE: {
    label: 'Disputed',
    color: 'var(--fake)',
    bg: 'var(--fake-bg)',
    border: 'var(--fake-border)',
    icon: '✕',
  },
  UNCERTAIN: {
    label: 'Unclear',
    color: 'var(--uncertain)',
    bg: 'var(--uncertain-bg)',
    border: 'var(--uncertain-border)',
    icon: '?',
  },
}

export function truncate(str: string, n = 80): string {
  return str && str.length > n ? str.slice(0, n - 1) + '…' : str
}

export function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader()
    reader.onload  = () => res((reader.result as string).split(',')[1])
    reader.onerror = () => rej(new Error('File read failed'))
    reader.readAsDataURL(file)
  })
}

export function isValidUrl(str: string): boolean {
  try {
    const u = new URL(str)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

/** Allow only http(s) URLs for hrefs; returns null if unsafe. */
export function sanitizeHttpUrl(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.trim()) return null
  try {
    const u = new URL(raw.trim())
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    return u.toString()
  } catch {
    return null
  }
}

export function normalizeVerdict(
  result: { verdict?: string; certainty?: number; status?: string } | null | undefined
): 'Supported' | 'Disputed' | 'Unclear' {
  const v = result?.verdict
  if (v === 'Supported' || v === 'Disputed' || v === 'Unclear') return v
  if (v === 'Verified' || v === 'REAL') return 'Supported'
  if (v === 'Misleading' || v === 'FAKE') return 'Disputed'
  if (result?.status === 'FAIL') return 'Unclear'
  const c = typeof result?.certainty === 'number' ? result.certainty : null
  if (c === null) return 'Unclear'
  if (c >= 70) return 'Supported'
  if (c <= 40) return 'Disputed'
  return 'Unclear'
}

export interface AnalysisResult {
  verdict: 'Supported' | 'Disputed' | 'Unclear' | 'REAL' | 'FAKE' | 'UNCERTAIN'
  confidence: number
  summary: string
  signals: { type: 'ok' | 'warn' | 'bad' | 'info'; text: string }[]
  sources: string[]
  input: string
  timestamp: string
  type: string
}
