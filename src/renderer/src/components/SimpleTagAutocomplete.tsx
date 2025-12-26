import { useEffect, useState, useRef } from 'react'
import { Tag } from '../types'
import { api } from '../lib/api'

interface SimpleTagAutocompleteProps {
  query: string
  onSelect: (name: string) => void
  onClose: () => void
  onSearch?: (query: string) => Promise<Tag[]>
}

function generateTagColor(name: string): string {
  const hash = name.split('').reduce((acc, char) =>
    char.charCodeAt(0) + ((acc << 5) - acc), 0)
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 50%)`
}

export function SimpleTagAutocomplete({
  query,
  onSelect,
  onClose,
  onSearch
}: SimpleTagAutocompleteProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadTags = async () => {
      setLoading(true)
      try {
        const results = onSearch ? await onSearch(query) : await api.getAllTags()
        const filtered = query
          ? results.filter(t => t.name.toLowerCase().includes(query.toLowerCase()))
          : results
        setTags(filtered)
        setSelectedIndex(0)
      } catch (error) {
        console.error('[TagAutocomplete] Error loading tags:', error)
        setTags([])
      } finally {
        setLoading(false)
      }
    }

    loadTags()
  }, [query, onSearch])

  // Handle keyboard navigation
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      const totalOptions = query.trim() ? tags.length + 1 : tags.length

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(i => Math.min(i + 1, totalOptions - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (query.trim() && selectedIndex === tags.length) {
          onSelect(query)
        } else if (tags[selectedIndex]) {
          onSelect(tags[selectedIndex].name)
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', keyHandler, { capture: true })
    return () => document.removeEventListener('keydown', keyHandler, { capture: true })
  }, [tags, selectedIndex, query, onSelect, onClose])

  return (
    <div
      ref={listRef}
      className="tag-autocomplete fixed z-50 w-80 max-h-80 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg shadow-xl"
      style={{ top: '100px', left: '100px' }}
    >
      {loading ? (
        <div className="p-3 text-gray-400 text-sm">Loading tags...</div>
      ) : tags.length === 0 && !query.trim() ? (
        <div className="p-3 text-gray-400 text-sm">No tags available</div>
      ) : (
        <div>
          {tags.map((tag, index) => (
            <button
              key={tag.id}
              className={`w-full text-left px-4 py-2.5 border-b border-gray-700
                hover:bg-gray-700 transition-colors
                ${index === selectedIndex ? 'bg-gray-700' : 'bg-gray-800'}`}
              onClick={() => onSelect(tag.name)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span
                    className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color || generateTagColor(tag.name) }}
                  />
                  <span className="text-sm font-medium text-white truncate">#{tag.name}</span>
                </div>
                <div className="ml-3 flex-shrink-0">
                  <span className="inline-block px-2 py-0.5 text-xs rounded bg-gray-700 text-gray-300">
                    {(tag as any).note_count || 0} notes
                  </span>
                </div>
              </div>
            </button>
          ))}
          {query.trim() && (
            <button
              className={`w-full text-left px-4 py-2.5
                hover:bg-gray-700 transition-colors
                ${selectedIndex === tags.length ? 'bg-gray-700' : 'bg-gray-800'}`}
              onClick={() => onSelect(query)}
              onMouseEnter={() => setSelectedIndex(tags.length)}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Create new tag:</span>
                <span className="text-sm font-medium text-blue-400">#{query}</span>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
