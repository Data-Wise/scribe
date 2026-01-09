import { useRef, useEffect } from 'react'
// @ts-expect-error - FixedSizeList exists as class export, tsc vs bundler difference
import { FixedSizeList } from 'react-window'
import { Note } from '../types'
import { HighlightedText } from './HighlightedText'
import { extractSearchSnippet } from '../utils/search'
import { SkeletonSearchResult, SkeletonList } from './Skeleton'

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
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<FixedSizeList>(null)

  // Scroll to selected note when it changes
  useEffect(() => {
    if (selectedNoteId && listRef.current) {
      const index = results.findIndex(n => n.id === selectedNoteId)
      if (index !== -1) {
        listRef.current.scrollToItem(index, 'smart')
      }
    }
  }, [selectedNoteId, results])

  // Loading state - Phase 3 Task 8: Skeleton loaders for better perceived performance
  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-700 sticky top-0 bg-nexus-bg-secondary">
          Searching...
        </div>
        <SkeletonList count={5} component={SkeletonSearchResult} />
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

  // Phase 3 Task 9: Virtual scrolling for large result sets (500+ notes)
  // Item height estimation: title (24px) + snippet (40px) + metadata (24px) + padding (32px) = 120px
  const ITEM_HEIGHT = 120
  const HEADER_HEIGHT = 36

  // Calculate available height (use parent container height)
  const containerHeight = containerRef.current?.clientHeight || 600

  // Row renderer for react-window
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const note = results[index]
    return (
      <div style={style}>
        <SearchResultItem
          note={note}
          query={query}
          isSelected={note.id === selectedNoteId}
          onClick={() => onSelectNote(note.id)}
        />
      </div>
    )
  }

  // Results list with virtual scrolling
  return (
    <div ref={containerRef} className="flex-1 overflow-hidden flex flex-col">
      {/* Results count header */}
      <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-700 bg-nexus-bg-secondary" style={{ height: HEADER_HEIGHT }}>
        {results.length} result{results.length !== 1 ? 's' : ''} for{' '}
        <span className="text-white font-medium">"{query}"</span>
      </div>

      {/* Virtualized results list */}
      <FixedSizeList
        ref={listRef}
        height={containerHeight - HEADER_HEIGHT}
        itemCount={results.length}
        itemSize={ITEM_HEIGHT}
        width="100%"
        overscanCount={3}
      >
        {Row}
      </FixedSizeList>
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
