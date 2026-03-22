'use client'

import { useState, useRef } from 'react'
import { useAnalysis } from '../context/AnalysisContext'
import { fileToBase64, isValidUrl } from '../utils/helpers'
import styles from './InputBox.module.css'

const TABS = ['Headline', 'URL', 'Image'] as const
type Tab = typeof TABS[number]

interface InputBoxProps {
  onAnalyze: () => void
}

export default function InputBox({ onAnalyze }: InputBoxProps) {
  const { inputData, setInputData } = useAnalysis()
  const [activeTab, setActiveTab]   = useState<Tab>('Headline')
  const [dragging, setDragging]     = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    setInputData({ type: tab.toLowerCase() as 'headline' | 'url' | 'image', value: '' })
    setImagePreview(null)
  }

  const handleFileSelect = async (file: File | null | undefined) => {
    if (!file || !file.type.startsWith('image/')) return
    const b64 = await fileToBase64(file)
    setImagePreview(URL.createObjectURL(file))
    setInputData({ type: 'image', value: file.name, imageBase64: b64 })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFileSelect(e.dataTransfer.files[0])
  }

  const handleSubmit = () => {
    const value = inputData.value?.trim()
    if (activeTab === 'URL' && !isValidUrl(value)) {
      alert('Please enter a valid URL (including https://)')
      return
    }
    if (activeTab === 'Image' && !inputData.imageBase64) {
      alert('Please upload an image first')
      return
    }
    if (!value && activeTab !== 'Image') return
    onAnalyze()
  }

  const placeholder: Record<Tab, string> = {
    Headline: 'Paste a news headline…',
    URL: 'https://example.com/news-article',
    Image: '',
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabs}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.body}>
        {activeTab !== 'Image' ? (
          <textarea
            className={styles.textarea}
            placeholder={placeholder[activeTab]}
            value={inputData.value || ''}
            onChange={e => setInputData(d => ({ ...d, value: e.target.value }))}
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleSubmit() }}
            rows={activeTab === 'URL' ? 2 : 4}
          />
        ) : (
          <div
            className={`${styles.dropzone} ${dragging ? styles.dropzoneActive : ''}`}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !imagePreview && fileRef.current?.click()}
          >
            {imagePreview ? (
              <div className={styles.imgPreviewWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} className={styles.imgPreview} alt="preview" />
                <button
                  className={styles.removeBtn}
                  onClick={e => {
                    e.stopPropagation()
                    setImagePreview(null)
                    setInputData(d => ({ ...d, imageBase64: undefined, value: '' }))
                  }}
                >
                  ✕ Remove
                </button>
              </div>
            ) : (
              <div className={styles.dropPlaceholder}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect x="3" y="5" width="26" height="22" rx="3" stroke="var(--text-muted)" strokeWidth="1.5"/>
                  <circle cx="11" cy="13" r="3" stroke="var(--text-muted)" strokeWidth="1.5"/>
                  <path d="M3 22L10 15l5 5 4-4 10 8" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                <span className={styles.dropText}>Drop screenshot here or <span className={styles.browse}>browse</span></span>
                <span className={styles.dropHint}>PNG, JPG, WEBP · max 10 MB</span>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => handleFileSelect(e.target.files?.[0])}
            />
          </div>
        )}

        <div className={styles.footer}>
          <span className={styles.hint}>
            {activeTab === 'Headline' && `${(inputData.value || '').length} / 500 chars · ⌘↵ to analyze`}
            {activeTab === 'URL'      && 'Paste the full article URL'}
            {activeTab === 'Image'    && 'Upload a screenshot of a news article'}
          </span>
          <button className={styles.analyzeBtn} onClick={handleSubmit}>
            Analyze
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
