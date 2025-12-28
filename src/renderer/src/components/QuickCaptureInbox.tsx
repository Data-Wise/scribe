import { useMemo } from 'react'
import { Inbox, ArrowRight, Check, Trash2 } from 'lucide-react'
import { Note } from '../types'

interface QuickCaptureInboxProps {
  notes: Note[]
  /** Open note for processing */
  onProcess: (noteId: string) => void
  /** Mark as processed (move out of inbox) */
  onMarkProcessed?: (noteId: string) => void
  /** Delete capture */
  onDelete?: (noteId: string) => void
  /** Max items to show (default 5) */
  limit?: number
}

/**
 * QuickCaptureInbox - Shows captured items awaiting processing
 *
 * GTD-style inbox for quick captures that need to be:
 * - Expanded into full notes
 * - Filed into projects
 * - Converted to tasks
 * - Or simply reviewed
 *
 * ADHD-friendly: Clear call-to-action, visible count, easy processing
 */
export function QuickCaptureInbox({
  notes,
  onProcess,
  onMarkProcessed,
  onDelete,
  limit = 5
}: QuickCaptureInboxProps) {
  // Filter to only inbox notes (folder === 'inbox')
  const inboxNotes = useMemo(() => {
    return notes
      .filter(n => n.folder === 'inbox' && !n.deleted_at)
      .sort((a, b) => b.created_at - a.created_at)
      .slice(0, limit)
  }, [notes, limit])

  const totalInbox = useMemo(() => {
    return notes.filter(n => n.folder === 'inbox' && !n.deleted_at).length
  }, [notes])

  // No inbox items
  if (inboxNotes.length === 0) {
    return null // Don't show component if inbox is empty
  }

  // Format relative time
  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return 'yesterday'
    return `${days}d ago`
  }

  // Truncate preview text
  const getPreview = (content: string, maxLength = 80): string => {
    if (!content) return ''
    // Remove markdown and newlines
    const text = content
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[#*_`~>\-]/g, '')
      .replace(/\n+/g, ' ')
      .trim()
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  return (
    <div className="quick-capture-inbox">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Inbox className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm font-medium text-nexus-text-primary">
            Inbox
          </h3>
          <span className="px-1.5 py-0.5 text-xs font-medium bg-purple-500/20 text-purple-400 rounded-full">
            {totalInbox}
          </span>
        </div>
        {totalInbox > limit && (
          <span className="text-xs text-nexus-text-muted">
            +{totalInbox - limit} more
          </span>
        )}
      </div>

      {/* Inbox items */}
      <div className="space-y-2">
        {inboxNotes.map((note) => (
          <div
            key={note.id}
            className="inbox-item group flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-purple-500/20 transition-all cursor-pointer"
            onClick={() => onProcess(note.id)}
          >
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="text-sm text-nexus-text-primary font-medium truncate">
                {note.title || 'Untitled capture'}
              </div>
              <div className="text-xs text-nexus-text-muted mt-0.5 line-clamp-2">
                {getPreview(note.content)}
              </div>
              <div className="text-xs text-nexus-text-muted/70 mt-1">
                {formatRelativeTime(note.created_at)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onMarkProcessed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onMarkProcessed(note.id)
                  }}
                  className="p-1.5 rounded hover:bg-emerald-500/20 text-nexus-text-muted hover:text-emerald-400 transition-colors"
                  title="Mark as processed"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(note.id)
                  }}
                  className="p-1.5 rounded hover:bg-red-500/20 text-nexus-text-muted hover:text-red-400 transition-colors"
                  title="Delete capture"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onProcess(note.id)
                }}
                className="p-1.5 rounded hover:bg-purple-500/20 text-nexus-text-muted hover:text-purple-400 transition-colors"
                title="Process"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Hint */}
      <div className="mt-3 text-xs text-nexus-text-muted/70 text-center">
        <kbd className="px-1 py-0.5 bg-white/5 rounded">⌘⇧C</kbd> to add more
      </div>
    </div>
  )
}
