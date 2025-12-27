import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, FileText, ChevronDown } from 'lucide-react'
import { Note, Project } from '../types'
import { api } from '../lib/api'
import { extractSearchSnippet } from '../utils/search'
import { HighlightedText } from './HighlightedText'

interface SearchPanelProps {
  isOpen: boolean
  onClose: () => void
  onSelectNote: (noteId: string) => void
  currentProject?: Project | null
  projects: Project[]
}

type SearchScope = 'all' | 'project'

export function SearchPanel({
  isOpen,
  onClose,
  onSelectNote,
  currentProject,
  projects: _projects  // Reserved for future project list in scope dropdown
}: SearchPanelProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scope, setScope] = useState<SearchScope>(currentProject ? 'project' : 'all')
  const [scopeDropdownOpen, setScopeDropdownOpen] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure panel is rendered
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setResults([])
      setSelectedIndex(0)
      // Default to project scope if we have a current project
      setScope(currentProject ? 'project' : 'all')
    }
  }, [isOpen, currentProject])

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      let searchResults = await api.searchNotes(searchQuery)

      // Filter by project if scope is 'project' and we have a current project
      if (scope === 'project' && currentProject) {
        const projectNotes = await api.getProjectNotes(currentProject.id)
        const projectNoteIds = new Set(projectNotes.map(n => n.id))
        searchResults = searchResults.filter(note => projectNoteIds.has(note.id))
      }

      setResults(searchResults)
      setSelectedIndex(0)
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [scope, currentProject])

  // Handle query change with debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!query.trim()) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    debounceRef.current = setTimeout(() => {
      performSearch(query)
    }, 150) // Fast 150ms debounce for real-time feel

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, performSearch])

  // Re-search when scope changes
  useEffect(() => {
    if (query.trim()) {
      performSearch(query)
    }
  }, [scope])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) {
            onSelectNote(results[selectedIndex].id)
            onClose()
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onSelectNote, onClose])

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedItem = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`)
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  // Close scope dropdown when clicking outside
  useEffect(() => {
    if (!scopeDropdownOpen) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.search-scope-dropdown')) {
        setScopeDropdownOpen(false)
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [scopeDropdownOpen])

  if (!isOpen) return null

  const scopeLabel = scope === 'all'
    ? 'All Pages'
    : currentProject
      ? currentProject.name
      : 'Project'

  return (
    <div className="search-panel-overlay" onClick={onClose}>
      <div
        className="search-panel-content glass-effect"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-label="Search pages"
      >
        {/* Search Header */}
        <div className="search-panel-header">
          <div className="search-panel-input-wrapper">
            <Search className="search-panel-icon" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search pages..."
              className="search-panel-input"
              aria-label="Search query"
            />
            {query && (
              <button
                className="search-panel-clear"
                onClick={() => setQuery('')}
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Scope Selector */}
          <div className="search-scope-dropdown">
            <button
              className="search-scope-button"
              onClick={() => setScopeDropdownOpen(!scopeDropdownOpen)}
              aria-expanded={scopeDropdownOpen}
              aria-haspopup="listbox"
            >
              <span className="truncate">{scopeLabel}</span>
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            </button>

            {scopeDropdownOpen && (
              <div className="search-scope-menu" role="listbox">
                <button
                  className={`search-scope-option ${scope === 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setScope('all')
                    setScopeDropdownOpen(false)
                  }}
                  role="option"
                  aria-selected={scope === 'all'}
                >
                  All Pages
                </button>
                {currentProject && (
                  <button
                    className={`search-scope-option ${scope === 'project' ? 'active' : ''}`}
                    onClick={() => {
                      setScope('project')
                      setScopeDropdownOpen(false)
                    }}
                    role="option"
                    aria-selected={scope === 'project'}
                  >
                    {currentProject.name}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results List */}
        <div className="search-panel-results" ref={resultsRef}>
          {isLoading && query.trim() && (
            <div className="search-panel-loading">Searching...</div>
          )}

          {!isLoading && query.trim() && results.length === 0 && (
            <div className="search-panel-empty">
              No pages found for "{query}"
            </div>
          )}

          {!query.trim() && (
            <div className="search-panel-hint">
              Start typing to search across your pages
            </div>
          )}

          {results.map((note, index) => {
            const snippet = extractSearchSnippet(note.content, query, 120)

            return (
              <div
                key={note.id}
                data-index={index}
                className={`search-panel-result ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => {
                  onSelectNote(note.id)
                  onClose()
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <FileText className="search-panel-result-icon" />
                <div className="search-panel-result-content">
                  <div className="search-panel-result-title">
                    <HighlightedText text={note.title || 'Untitled'} query={query} />
                  </div>
                  {snippet && (
                    <div className="search-panel-result-snippet">
                      <HighlightedText text={snippet} query={query} />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer with keyboard hints */}
        <div className="search-panel-footer">
          <span><kbd>↑↓</kbd> Navigate</span>
          <span><kbd>↵</kbd> Open</span>
          <span><kbd>Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  )
}
