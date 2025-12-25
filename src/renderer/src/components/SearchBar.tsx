import { useState, useEffect, useRef } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  onClear: () => void
}

export function SearchBar({ onSearch, onClear }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Cmd+K shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to focus
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      // Escape to clear and blur
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        handleClear()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)
    if (value.trim()) {
      onSearch(value.trim())
    } else {
      onClear()
    }
  }

  const handleClear = () => {
    setQuery('')
    onClear()
    inputRef.current?.blur()
  }

  return (
    <div className="relative mb-3">
      {/* Search Icon */}
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      {/* Search Input */}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search notes... (⌘K)"
        className="w-full px-4 py-2 pl-10 pr-8 bg-nexus-bg-primary border border-gray-600 rounded-lg
                   focus:outline-none focus:border-nexus-accent transition-colors
                   text-nexus-text-primary placeholder-gray-500"
      />

      {/* Clear Button */}
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          title="Clear search (Esc)"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
