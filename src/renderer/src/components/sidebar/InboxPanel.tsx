import { useMemo } from 'react'
import { Inbox, ArrowRight, Check, Trash2, Plus, Sparkles } from 'lucide-react'
import { Note } from '../../types'

/**
 * InboxPanel - Sidebar panel for quick capture inbox
 *
 * Shows captured items that haven't been processed yet.
 * Integrates with the Notes tab system.
 */

interface InboxPanelProps {
  notes: Note[]
  onSelectNote: (id: string) => void
  onMarkProcessed?: (noteId: string) => void
  onDelete?: (noteId: string) => void
  onOpenQuickCapture?: () => void
  variant: 'compact' | 'card'
}

export function InboxPanel({
  notes,
  onSelectNote,
  onMarkProcessed,
  onDelete,
  onOpenQuickCapture,
  variant
}: InboxPanelProps) {
  // Filter to only inbox notes (folder === 'inbox')
  const inboxNotes = useMemo(() => {
    return notes
      .filter(n => n.folder === 'inbox' && !n.deleted_at)
      .sort((a, b) => b.created_at - a.created_at)
  }, [notes])

  const isCompact = variant === 'compact'

  return (
    <div className="inbox-panel">
      {/* Header with count */}
      <div className="inbox-panel-header">
        <div className="inbox-header-left">
          <Inbox size={16} className="inbox-icon" />
          <span className="inbox-title">Quick Capture</span>
          {inboxNotes.length > 0 && (
            <span className="inbox-badge">{inboxNotes.length}</span>
          )}
        </div>
        {onOpenQuickCapture && (
          <button
            className="inbox-add-btn"
            onClick={onOpenQuickCapture}
            title="New capture (⌘⇧C)"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      {/* Empty state */}
      {inboxNotes.length === 0 ? (
        <div className="inbox-empty">
          <Sparkles size={24} className="empty-icon" />
          <span className="empty-title">Inbox Zero!</span>
          <span className="empty-hint">
            Press <kbd>⌘⇧C</kbd> to capture ideas
          </span>
        </div>
      ) : (
        /* Inbox items list */
        <div className="inbox-list">
          {inboxNotes.map((note) => (
            <InboxItem
              key={note.id}
              note={note}
              onClick={() => onSelectNote(note.id)}
              onMarkProcessed={onMarkProcessed ? () => onMarkProcessed(note.id) : undefined}
              onDelete={onDelete ? () => onDelete(note.id) : undefined}
              isCompact={isCompact}
            />
          ))}
        </div>
      )}

      {/* Footer hint */}
      {inboxNotes.length > 0 && (
        <div className="inbox-footer">
          Click to process • <kbd>⌘⇧C</kbd> to add
        </div>
      )}
    </div>
  )
}

interface InboxItemProps {
  note: Note
  onClick: () => void
  onMarkProcessed?: () => void
  onDelete?: () => void
  isCompact: boolean
}

function InboxItem({ note, onClick, onMarkProcessed, onDelete, isCompact }: InboxItemProps) {
  const preview = getPreview(note.content, isCompact ? 60 : 80)
  const timeAgo = formatRelativeTime(note.created_at)

  return (
    <div className="inbox-item" onClick={onClick}>
      <div className="inbox-item-content">
        <div className="inbox-item-title">
          {note.title || 'Untitled capture'}
        </div>
        {preview && (
          <div className="inbox-item-preview">{preview}</div>
        )}
        <div className="inbox-item-time">{timeAgo}</div>
      </div>

      <div className="inbox-item-actions">
        {onMarkProcessed && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMarkProcessed()
            }}
            className="inbox-action-btn process"
            title="Mark as processed"
          >
            <Check size={14} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="inbox-action-btn delete"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
          className="inbox-action-btn open"
          title="Open & process"
        >
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}

// Helper: Format relative time
function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

// Helper: Get preview text
function getPreview(content: string, maxLength: number): string {
  if (!content) return ''
  const text = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*_`~>\-]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}
