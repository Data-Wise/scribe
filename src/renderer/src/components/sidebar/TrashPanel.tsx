import { useMemo, useState } from 'react'
import { Trash2, RotateCcw, AlertTriangle, Clock } from 'lucide-react'
import { Note } from '../../types'
import { useNotesStore } from '../../store/useNotesStore'

interface TrashPanelProps {
  notes: Note[]
}

/**
 * TrashPanel - Shows deleted notes with restore/permanent delete options
 *
 * ADHD Principle: Escape hatches - always allow recovery from mistakes
 *
 * Features:
 * - List of soft-deleted notes
 * - One-click restore
 * - Permanent delete with confirmation
 * - Shows when note was deleted
 */
export function TrashPanel({ notes }: TrashPanelProps) {
  const { restoreNote, permanentlyDeleteNote } = useNotesStore()
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)

  // Filter to only show deleted notes
  const trashedNotes = useMemo(() => {
    return notes
      .filter(n => n.deleted_at)
      .sort((a, b) => (b.deleted_at || 0) - (a.deleted_at || 0)) // Most recently deleted first
  }, [notes])

  const handleRestore = async (noteId: string) => {
    await restoreNote(noteId)
  }

  const handlePermanentDelete = async (noteId: string) => {
    if (confirmingDeleteId === noteId) {
      await permanentlyDeleteNote(noteId)
      setConfirmingDeleteId(null)
    } else {
      setConfirmingDeleteId(noteId)
      // Auto-cancel after 3 seconds
      setTimeout(() => setConfirmingDeleteId(null), 3000)
    }
  }

  // Format relative time since deletion
  const formatDeletedAt = (timestamp: number): string => {
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
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (trashedNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
          <Trash2 className="w-6 h-6 text-nexus-text-muted" />
        </div>
        <p className="text-sm text-nexus-text-muted">Trash is empty</p>
        <p className="text-xs text-nexus-text-muted/60 mt-1">
          Deleted notes will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <span className="text-xs font-medium text-nexus-text-muted uppercase tracking-wide">
          Trash ({trashedNotes.length})
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {trashedNotes.map(note => (
          <div
            key={note.id}
            className="group px-3 py-2 hover:bg-white/5 border-b border-white/5 last:border-b-0"
          >
            {/* Note info */}
            <div className="flex items-start gap-2 mb-2">
              <Trash2 className="w-4 h-4 text-nexus-text-muted/50 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-nexus-text-secondary truncate">
                  {note.title || 'Untitled'}
                </p>
                <p className="text-xs text-nexus-text-muted/60 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  Deleted {formatDeletedAt(note.deleted_at!)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pl-6">
              <button
                onClick={() => handleRestore(note.id)}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-nexus-accent hover:bg-nexus-accent/10 rounded transition-colors"
                title="Restore note"
              >
                <RotateCcw className="w-3 h-3" />
                Restore
              </button>

              <button
                onClick={() => handlePermanentDelete(note.id)}
                className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                  confirmingDeleteId === note.id
                    ? 'bg-red-500/20 text-red-400'
                    : 'text-nexus-text-muted hover:text-red-400 hover:bg-red-500/10'
                }`}
                title={confirmingDeleteId === note.id ? 'Click again to confirm' : 'Delete permanently'}
              >
                <AlertTriangle className="w-3 h-3" />
                {confirmingDeleteId === note.id ? 'Confirm?' : 'Delete forever'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2 border-t border-white/5 text-xs text-nexus-text-muted/60 text-center">
        Restore notes to recover them
      </div>
    </div>
  )
}
