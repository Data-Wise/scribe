/**
 * CitationAutocomplete - Autocomplete for Pandoc citations
 *
 * Triggers on @ character and shows citations from BibTeX.
 * Inserts [@key] format for Pandoc citeproc.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../lib/api'

export interface Citation {
  key: string
  title: string
  authors: string[]
  year: number
  journal?: string
  doi?: string
}

interface CitationAutocompleteProps {
  query: string
  position: { top: number; left: number }
  onSelect: (key: string) => void
  onClose: () => void
}

export function CitationAutocomplete({
  query,
  position,
  onSelect,
  onClose,
}: CitationAutocompleteProps) {
  const [citations, setCitations] = useState<Citation[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load citations on mount and when query changes
  useEffect(() => {
    const loadCitations = async () => {
      setLoading(true)
      setError(null)
      try {
        const results = await api.searchCitations(query)
        setCitations(results)
        setSelectedIndex(0)
      } catch (e) {
        console.error('[CitationAutocomplete] Error:', e)
        setError('Failed to load citations')
        setCitations([])
      } finally {
        setLoading(false)
      }
    }

    loadCitations()
  }, [query])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, citations.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && citations.length > 0) {
        e.preventDefault()
        onSelect(citations[selectedIndex].key)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [citations, selectedIndex, onSelect, onClose])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Format author names (last names only for brevity)
  const formatAuthors = (authors: string[]): string => {
    if (authors.length === 0) return 'Unknown'
    if (authors.length === 1) return authors[0]
    if (authors.length === 2) return `${authors[0]} & ${authors[1]}`
    return `${authors[0]} et al.`
  }

  return (
    <div
      ref={containerRef}
      className="fixed z-50 w-80 max-h-64 overflow-y-auto rounded-lg shadow-xl border"
      style={{
        top: position.top,
        left: position.left,
        backgroundColor: 'var(--nexus-bg-tertiary)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
      }}
    >
      {loading ? (
        <div className="p-4 text-center" style={{ color: 'var(--nexus-text-muted)' }}>
          Loading citations...
        </div>
      ) : error ? (
        <div className="p-4 text-center" style={{ color: '#ef4444' }}>
          {error}
          <div className="text-xs mt-2" style={{ color: 'var(--nexus-text-muted)' }}>
            Configure .bib path in Settings
          </div>
        </div>
      ) : citations.length === 0 ? (
        <div className="p-4 text-center" style={{ color: 'var(--nexus-text-muted)' }}>
          No citations found for "{query}"
        </div>
      ) : (
        <div>
          {citations.map((citation, index) => (
            <div
              key={citation.key}
              className="px-3 py-2 cursor-pointer transition-colors"
              style={{
                backgroundColor: index === selectedIndex
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'transparent',
              }}
              onClick={() => onSelect(citation.key)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div
                className="font-mono text-sm font-medium"
                style={{ color: 'var(--nexus-accent)' }}
              >
                @{citation.key}
              </div>
              <div
                className="text-sm truncate mt-0.5"
                style={{ color: 'var(--nexus-text-primary)' }}
              >
                {citation.title}
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ color: 'var(--nexus-text-muted)' }}
              >
                {formatAuthors(citation.authors)} ({citation.year})
                {citation.journal && ` - ${citation.journal}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CitationAutocomplete
