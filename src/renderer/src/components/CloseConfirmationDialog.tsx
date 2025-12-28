import { useTabStore } from '../store/useTabStore'

interface CloseConfirmationDialogProps {
  /** Callback to save the note before closing */
  onSave?: () => Promise<void>
}

/**
 * Dialog shown when user tries to close a tab with unsaved changes
 * ADHD Principle: Escape hatches - prevent accidental data loss
 */
export function CloseConfirmationDialog({ onSave }: CloseConfirmationDialogProps) {
  const {
    showCloseConfirmation,
    pendingCloseTabId,
    tabs,
    confirmCloseTab,
    cancelCloseTab,
  } = useTabStore()

  if (!showCloseConfirmation || !pendingCloseTabId) return null

  // Get the tab being closed
  const tab = tabs.find(t => t.id === pendingCloseTabId)
  const noteTitle = tab?.title || 'Untitled'

  const handleDiscard = () => {
    confirmCloseTab(false)
  }

  const handleSaveAndClose = async () => {
    if (onSave) {
      await onSave()
    }
    confirmCloseTab(true)
  }

  const handleCancel = () => {
    cancelCloseTab()
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel()
    } else if (e.key === 'Enter') {
      handleSaveAndClose()
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="close-dialog-title"
        aria-describedby="close-dialog-description"
      >
        {/* Header */}
        <h2
          id="close-dialog-title"
          className="text-lg font-semibold text-nexus-text-primary mb-2"
        >
          Unsaved Changes
        </h2>

        {/* Description */}
        <p
          id="close-dialog-description"
          className="text-sm text-nexus-text-muted mb-6"
        >
          <span className="font-medium text-nexus-text-secondary">"{noteTitle}"</span> has unsaved changes.
          Would you like to save before closing?
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-nexus-text-muted hover:text-nexus-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDiscard}
            className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            Discard
          </button>
          <button
            onClick={handleSaveAndClose}
            className="px-4 py-2 text-sm font-medium bg-nexus-accent text-white rounded-lg hover:bg-nexus-accent/90 transition-colors"
            autoFocus
          >
            Save & Close
          </button>
        </div>

        {/* Keyboard hint */}
        <div className="mt-4 pt-3 border-t border-white/5 text-xs text-nexus-text-muted text-center">
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono">Enter</kbd> to save
          <span className="mx-2 opacity-50">•</span>
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono">Esc</kbd> to cancel
        </div>
      </div>
    </div>
  )
}
