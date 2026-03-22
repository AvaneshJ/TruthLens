export interface VerdictMeta {
  label: string
  color: string
  bg: string
  border: string
  icon: string
}

export const VERDICT_META: Record<string, VerdictMeta> = {
  REAL: {
    label: 'Likely Real',
    color: 'var(--real)',
    bg: 'var(--real-bg)',
    border: 'var(--real-border)',
    icon: '✓',
  },
  FAKE: {
    label: 'Likely Fake',
    color: 'var(--fake)',
    bg: 'var(--fake-bg)',
    border: 'var(--fake-border)',
    icon: '✕',
  },
  UNCERTAIN: {
    label: 'Uncertain',
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
  try { new URL(str); return true } catch { return false }
}

export interface AnalysisResult {
  verdict: 'REAL' | 'FAKE' | 'UNCERTAIN'
  confidence: number
  summary: string
  signals: { type: 'ok' | 'warn' | 'bad' | 'info'; text: string }[]
  sources: string[]
  input: string
  timestamp: string
  type: string
}
