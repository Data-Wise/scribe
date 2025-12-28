import { useNotesStore } from '../store/useNotesStore'
import { Trash2 } from 'lucide-react'

/**
 * Dialog shown when user tries to delete a note
 * ADHD Principle: Escape hatches - prevent accidental data loss
 *
 * Features:
 * - Shows note title being deleted
 * - Clear action buttons (Delete / Cancel)
 * - Keyboard shortcuts (Enter = delete, Escape = cancel)
 * - Destructive action highlighted in red
 */
export function DeleteConfirmationDialog() {
  const {
    showDeleteConfirmation,
    pendingDeleteNoteId,
    notes,
    confirmDeleteNote,
    cancelDeleteNote,
  } = useNotesStore()

  if (!showDeleteConfirmation || !pendingDeleteNoteId) return null

  // Get the note being deleted
  const note = notes.find(n => n.id === pendingDeleteNoteId)
  const noteTitle = note?.title || 'Untitled'

  const handleDelete = () => {
    confirmDeleteNote()
  }

  const handleCancel = () => {
    cancelDeleteNote()
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel()
    } else if (e.key === 'Enter') {
      handleDelete()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleCancel}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-nexus-bg-secondary border border-white/10 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4"
        onClick={e => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10">
          <Trash2 className="w-6 h-6 text-red-400" />
        </div>

        {/* Header */}
        <h2
          id="delete-dialog-title"
          className="text-lg font-semibold text-nexus-text-primary text-center mb-2"
        >
          Delete Note
        </h2>

        {/* Description */}
        <p
          id="delete-dialog-description"
          className="text-sm text-nexus-text-muted text-center mb-6"
        >
          Are you sure you want to delete{' '}
          <span className="font-medium text-nexus-text-secondary">"{noteTitle}"</span>?
          <br />
          <span className="text-xs opacity-75">This action moves the note to trash.</span>
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-nexus-text-muted hover:text-nexus-text-primary hover:bg-white/5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            autoFocus
          >
            Delete
          </button>
        </div>

        {/* Keyboard hint */}
        <div className="mt-4 pt-3 border-t border-white/5 text-xs text-nexus-text-muted text-center">
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono">Enter</kbd> to delete
          <span className="mx-2 opacity-50">•</span>
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono">Esc</kbd> to cancel
        </div>
      </div>
    </div>
  )
}
