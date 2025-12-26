import { useEffect, useState, useRef } from 'react'
import { Command } from 'cmdk'
import { Note } from '../types'
import { api } from '../lib/api'

interface SimpleWikiLinkAutocompleteProps {
  query: string
  onSelect: (title: string) => void
  onClose: () => void
  onSearch?: (query: string) => Promise<Note[]>
}

export function SimpleWikiLinkAutocomplete({
  query,
  onSelect,
  onClose,
  onSearch
}: SimpleWikiLinkAutocompleteProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadNotes = async () => {
      setLoading(true)
      try {
        const results = onSearch ? await onSearch(query) : await api.listNotes()
        const filtered = query
          ? results.filter(n => n.title.toLowerCase().includes(query.toLowerCase()))
          : results
        setNotes(filtered)
        setSelectedIndex(0)
      } catch (error) {
        console.error('[WikiLinkAutocomplete] Error loading notes:', error)
        setNotes([])
      } finally {
        setLoading(false)
      }
    }

    loadNotes()
  }, [query, onSearch])

  // Handle keyboard navigation
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(i => Math.min(i + 1, notes.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && notes[selectedIndex]) {
        e.preventDefault()
        onSelect(notes[selectedIndex].title)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', keyHandler, { capture: true })
    return () => document.removeEventListener('keydown', keyHandler, { capture: true })
  }, [notes, selectedIndex, onSelect, onClose])

  if (!query && notes.length === 0) return null

  return (
    <div
      ref={listRef}
      className="wiki-link-autocomplete fixed z-50 w-96 max-h-80 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg shadow-xl"
      style={{ top: '100px', left: '100px' }}
    >
      {loading ? (
        <div className="p-3 text-gray-400 text-sm">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="p-3 text-gray-400 text-sm">
          {query ? `No notes found for "${query}"` : 'No notes available'}
        </div>
      ) : (
        <div>
          {notes.map((note, index) => (
            <button
              key={note.id}
              className={`w-full text-left px-4 py-2.5 border-b border-gray-700 last:border-b-0
                hover:bg-gray-700 transition-colors
                ${index === selectedIndex ? 'bg-gray-700' : 'bg-gray-800'}`}
              onClick={() => onSelect(note.title)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{note.title}</div>
                  {note.content && (
                    <div className="text-xs text-gray-400 truncate mt-0.5">
                      {stripHtml(note.content).slice(0, 60)}...
                    </div>
                  )}
                </div>
                <div className="ml-3 flex-shrink-0">
                  <span className="inline-block px-2 py-0.5 text-xs rounded bg-gray-700 text-gray-300">
                    {note.folder}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function stripHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}
