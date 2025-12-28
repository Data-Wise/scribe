import { useState, useMemo } from 'react'
import { Search, FileText, Calendar, FolderKanban, GripVertical } from 'lucide-react'
import { Note, Project } from '../../types'
import { NoteContextMenu, useNoteContextMenu } from './NoteContextMenu'
import { useDraggableNote } from './DraggableNote'

/**
 * NotesListPanel - Displays all notes with search and sorting
 *
 * Used in the "Notes" tab of the left sidebar across all modes.
 * Shows notes with project association and last updated time.
 */

interface NotesListPanelProps {
  notes: Note[]
  projects: Project[]
  onSelectNote: (id: string) => void
  onAssignToProject?: (noteId: string, projectId: string | null) => void
  onMoveToInbox?: (noteId: string) => void
  onDelete?: (noteId: string) => void
  variant: 'compact' | 'card'
}

type SortOption = 'updated' | 'created' | 'title'

export function NotesListPanel({
  notes,
  projects,
  onSelectNote,
  onAssignToProject,
  onMoveToInbox,
  onDelete,
  variant
}: NotesListPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('updated')
  const { contextMenu, showContextMenu, hideContextMenu } = useNoteContextMenu()

  // Create project lookup map
  const projectMap = useMemo(() => {
    const map: Record<string, Project> = {}
    projects.forEach(p => { map[p.id] = p })
    return map
  }, [projects])

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let result = notes.filter(n => !n.deleted_at)

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(n =>
        (n.title || 'Untitled').toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return (a.title || 'Untitled').localeCompare(b.title || 'Untitled')
        case 'created':
          return b.created_at - a.created_at
        case 'updated':
        default:
          return b.updated_at - a.updated_at
      }
    })

    return result
  }, [notes, searchQuery, sortBy])

  const isCompact = variant === 'compact'

  return (
    <div className="notes-list-panel">
      {/* Search bar */}
      <div className="sidebar-search">
        <Search size={14} className="search-icon" />
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Sort options */}
      <div className="notes-sort-bar">
        <span className="sort-label">Sort:</span>
        <button
          className={`sort-btn ${sortBy === 'updated' ? 'active' : ''}`}
          onClick={() => setSortBy('updated')}
          title="Sort by last updated"
        >
          Recent
        </button>
        <button
          className={`sort-btn ${sortBy === 'created' ? 'active' : ''}`}
          onClick={() => setSortBy('created')}
          title="Sort by creation date"
        >
          Created
        </button>
        <button
          className={`sort-btn ${sortBy === 'title' ? 'active' : ''}`}
          onClick={() => setSortBy('title')}
          title="Sort alphabetically"
        >
          A-Z
        </button>
      </div>

      {/* Notes list */}
      <div className="notes-list-scroll">
        {filteredNotes.length === 0 ? (
          <div className="notes-empty-state">
            {searchQuery ? (
              <>
                <Search size={20} className="empty-icon" />
                <span>No notes match "{searchQuery}"</span>
              </>
            ) : (
              <>
                <FileText size={20} className="empty-icon" />
                <span>No notes yet</span>
              </>
            )}
          </div>
        ) : (
          filteredNotes.map(note => {
            const projectId = note.project_id
            return (
              <NoteItem
                key={note.id}
                note={note}
                project={projectMap[projectId || '']}
                onClick={() => onSelectNote(note.id)}
                onContextMenu={(e) => showContextMenu(e, note.id, projectId)}
                isCompact={isCompact}
              />
            )
          })
        )}
      </div>

      {/* Notes count */}
      <div className="notes-count">
        {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
        {searchQuery && ` matching "${searchQuery}"`}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <NoteContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          noteId={contextMenu.noteId}
          currentProjectId={contextMenu.currentProjectId}
          projects={projects}
          onClose={hideContextMenu}
          onAssignToProject={onAssignToProject || (() => {})}
          onMoveToInbox={onMoveToInbox}
          onDelete={onDelete}
        />
      )}
    </div>
  )
}

interface NoteItemProps {
  note: Note
  project?: Project
  onClick: () => void
  onContextMenu?: (e: React.MouseEvent) => void
  isCompact: boolean
  enableDrag?: boolean
}

function NoteItem({ note, project, onClick, onContextMenu, isCompact, enableDrag = true }: NoteItemProps) {
  const title = note.title || 'Untitled'
  const timeAgo = formatTimeAgo(note.updated_at)
  const preview = getPreview(note.content, isCompact ? 40 : 60)
  const projectId = project?.id

  const { isDragging, dragProps } = useDraggableNote(note, projectId)

  return (
    <button
      className={`note-list-item ${isDragging ? 'dragging' : ''}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      {...(enableDrag ? dragProps : {})}
    >
      <div className="note-item-header">
        {enableDrag && (
          <GripVertical size={12} className="drag-handle" />
        )}
        <FileText size={14} className="note-item-icon" />
        <span className="note-item-title">{title}</span>
      </div>

      {preview && (
        <p className="note-item-preview">{preview}</p>
      )}

      <div className="note-item-meta">
        {project && (
          <span className="note-item-project" title={project.name}>
            <FolderKanban size={10} />
            {project.name}
          </span>
        )}
        <span className="note-item-time">
          <Calendar size={10} />
          {timeAgo}
        </span>
      </div>
    </button>
  )
}

// Helper: Format relative time
function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

// Helper: Get content preview (first line of text, stripped of markdown)
function getPreview(content: string, maxLength: number): string {
  if (!content) return ''

  // Remove common markdown syntax
  let text = content
    .replace(/^#+\s*/gm, '') // Headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/\*([^*]+)\*/g, '$1') // Italic
    .replace(/`[^`]+`/g, '') // Inline code
    .replace(/```[\s\S]*?```/g, '') // Code blocks
    .replace(/\[\[([^\]]+)\]\]/g, '$1') // Wiki links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Markdown links
    .replace(/^\s*[-*+]\s*/gm, '') // List items
    .replace(/^\s*\d+\.\s*/gm, '') // Numbered lists
    .trim()

  // Get first non-empty line
  const lines = text.split('\n').filter(l => l.trim())
  const firstLine = lines[0] || ''

  if (firstLine.length <= maxLength) return firstLine
  return firstLine.slice(0, maxLength).trim() + '...'
}
