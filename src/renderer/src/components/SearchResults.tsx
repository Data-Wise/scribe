import { Note } from '../types'
import { HighlightedText } from './HighlightedText'
import { extractSearchSnippet } from '../utils/search'

const FOLDERS = [
  { path: 'inbox', name: '📥 Inbox' },
  { path: 'projects', name: '📁 Projects' },
  { path: 'areas', name: '🎯 Areas' },
  { path: 'resources', name: '📚 Resources' },
  { path: 'archive', name: '📦 Archive' }
]

interface SearchResultsProps {
  results: Note[]
  query: string
  onSelectNote: (id: string) => void
  selectedNoteId: string | null
  isLoading?: boolean
}

export function SearchResults({
  results,
  query,
  onSelectNote,
  selectedNoteId,
  isLoading = false
}: SearchResultsProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-400">
        <div className="w-8 h-8 border-2 border-nexus-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Searching...</p>
      </div>
    )
  }

  // Empty state
  if (results.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-lg mb-1">No results found</p>
        <p className="text-sm">
          No notes match <span className="text-white font-medium">"{query}"</span>
        </p>
      </div>
    )
  }

  // Results list
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Results count header */}
      <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-700 sticky top-0 bg-nexus-bg-secondary">
        {results.length} result{results.length !== 1 ? 's' : ''} for{' '}
        <span className="text-white font-medium">"{query}"</span>
      </div>

      {/* Results list */}
      {results.map((note) => (
        <SearchResultItem
          key={note.id}
          note={note}
          query={query}
          isSelected={note.id === selectedNoteId}
          onClick={() => onSelectNote(note.id)}
        />
      ))}
    </div>
  )
}

interface SearchResultItemProps {
  note: Note
  query: string
  isSelected: boolean
  onClick: () => void
}

function SearchResultItem({ note, query, isSelected, onClick }: SearchResultItemProps) {
  // Extract snippet with context around match
  const snippet = extractSearchSnippet(note.content, query, 120)

  // Get folder display name
  const folderName =
    FOLDERS.find((f) => f.path === note.folder)?.name.split(' ')[1] || note.folder

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-nexus-bg-primary transition-colors ${
        isSelected ? 'bg-nexus-accent/20 border-l-4 border-l-nexus-accent' : ''
      }`}
    >
      {/* Title with highlighting */}
      <div className="font-medium mb-2 truncate">
        <HighlightedText text={note.title} query={query} />
      </div>

      {/* Content snippet with highlighting */}
      <div className="text-sm text-gray-400 mb-3 line-clamp-2">
        <HighlightedText text={snippet} query={query} />
      </div>

      {/* Metadata: folder and date */}
      <div className="flex items-center gap-2 text-xs">
        <span className="px-2 py-1 bg-gray-700 rounded">{folderName}</span>
        <span className="text-gray-500">
          {new Date(note.updated_at * 1000).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}
