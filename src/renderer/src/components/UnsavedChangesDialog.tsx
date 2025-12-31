import { X } from 'lucide-react'

/**
 * UnsavedChangesDialog - Warning for unsaved changes
 *
 * Displays when user tries to:
 * - Close a file with unsaved changes
 * - Switch to a different file with unsaved changes
 * - Close the application with unsaved changes
 *
 * See: PLAN-HYBRID-EDITOR.md (Week 4: UX Improvements)
 */

interface UnsavedChangesDialogProps {
  fileName: string
  onSave: () => void | Promise<void>
  onDiscard: () => void
  onCancel: () => void
}

export function UnsavedChangesDialog({
  fileName,
  onSave,
  onDiscard,
  onCancel
}: UnsavedChangesDialogProps) {
  const handleSave = async () => {
    await onSave()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-nexus-bg-secondary border border-nexus-border rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-nexus-border">
          <h2 className="text-lg font-semibold text-nexus-text-primary">
            Unsaved Changes
          </h2>
          <button
            onClick={onCancel}
            className="text-nexus-text-muted hover:text-nexus-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-nexus-text-primary">
            Do you want to save changes to{' '}
            <span className="font-semibold text-nexus-accent">{fileName}</span>?
          </p>
          <p className="text-sm text-nexus-text-muted mt-2">
            Your changes will be lost if you don't save them.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-nexus-bg-tertiary border-t border-nexus-border rounded-b-lg">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-nexus-text-primary hover:bg-nexus-bg-primary rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onDiscard}
            className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 rounded transition-colors"
          >
            Don't Save
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-nexus-accent text-white hover:bg-nexus-accent-hover rounded transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
