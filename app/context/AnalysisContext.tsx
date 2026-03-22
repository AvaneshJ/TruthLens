'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { AnalysisResult } from '../utils/helpers'

interface InputData {
  type: 'headline' | 'url' | 'image'
  value: string
  imageBase64?: string
}

interface AnalysisContextType {
  inputData: InputData
  setInputData: React.Dispatch<React.SetStateAction<InputData>>
  result: AnalysisResult | null
  setResult: React.Dispatch<React.SetStateAction<AnalysisResult | null>>
  loading: boolean
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  error: string | null
  setError: React.Dispatch<React.SetStateAction<string | null>>
  history: AnalysisResult[]
  addToHistory: (entry: AnalysisResult) => void
  clearHistory: () => void
}

const STORAGE_KEY = 'tl_history'

const AnalysisContext = createContext<AnalysisContextType | null>(null)

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [inputData, setInputData] = useState<InputData>({ type: 'headline', value: '' })
  const [result, setResult]       = useState<AnalysisResult | null>(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [history, setHistory]     = useState<AnalysisResult[]>([])

  // Load history from localStorage only on client
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setHistory(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    } catch { /* ignore */ }
  }, [history])

  const addToHistory = (entry: AnalysisResult) =>
    setHistory(prev => [entry, ...prev].slice(0, 20))

  const clearHistory = () => setHistory([])

  return (
    <AnalysisContext.Provider value={{
      inputData, setInputData,
      result, setResult,
      loading, setLoading,
      error, setError,
      history, addToHistory, clearHistory,
    }}>
      {children}
    </AnalysisContext.Provider>
  )
}

export const useAnalysis = () => {
  const ctx = useContext(AnalysisContext)
  if (!ctx) throw new Error('useAnalysis must be used within AnalysisProvider')
  return ctx
}
