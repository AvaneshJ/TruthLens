import type { AnalysisResult } from '../utils/helpers'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export async function analyzeNews(data: {
  type: 'headline' | 'url' | 'image'
  value: string
  imageBase64?: string
}): Promise<AnalysisResult> {
  const res = await fetch(`${BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string }
    throw new Error(err.message || `Server error ${res.status}`)
  }
  return res.json()
}

export async function fetchHistory(token: string): Promise<AnalysisResult[]> {
  const res = await fetch(`${BASE_URL}/history`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch history')
  return res.json()
}

export async function loginUser(credentials: {
  email: string
  password: string
}): Promise<{ token: string; user: { email: string; name: string } }> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })
  if (!res.ok) throw new Error('Invalid credentials')
  return res.json()
}
