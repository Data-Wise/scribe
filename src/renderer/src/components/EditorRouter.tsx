import { useEffect, useState } from 'react'
import { useEditorStore, getEditorTypeForFile } from '../store/editorStore'
import { MilkdownEditor } from './MilkdownEditor'
import { MonacoCodeEditor } from './MonacoCodeEditor'
import { UnsavedChangesDialog } from './UnsavedChangesDialog'

/**
 * EditorRouter - Routes files to appropriate editor based on extension
 *
 * Routing:
 * - .md, .qmd → MilkdownEditor (markdown with live preview)
 * - .tex, .R, .py → MonacoEditor (code with syntax highlighting)
 * - Other → PlainTextEditor (fallback)
 *
 * See: PLAN-HYBRID-EDITOR.md
 */

interface EditorRouterProps {
  filePath: string | null
  content: string
  onChange: (content: string) => void
}

export function EditorRouter({ filePath, content, onChange }: EditorRouterProps) {
  const { currentFile, setCurrentFile, updateContent, setDirty } = useEditorStore()
  const editorType = getEditorTypeForFile(filePath)

  // Dialog state
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [pendingFilePath, setPendingFilePath] = useState<string | null>(null)
  const [pendingContent, setPendingContent] = useState<string>('')

  // Check for unsaved changes before switching files
  useEffect(() => {
    // Skip if no file change or first load
    if (!filePath || !currentFile.path || filePath === currentFile.path) {
      // First load - just set the file
      if (filePath && !currentFile.path) {
        setCurrentFile({ path: filePath, content })
      }
      return
    }

    // File is changing - check for unsaved changes
    if (currentFile.isDirty) {
      // Store pending file change
      setPendingFilePath(filePath)
      setPendingContent(content)
      setShowUnsavedDialog(true)
    } else {
      // No unsaved changes - proceed with file change
      setCurrentFile({ path: filePath, content })
    }
  }, [filePath])

  // Handle content changes
  const handleChange = (newContent: string) => {
    updateContent(newContent)
    onChange(newContent)
  }

  // Dialog handlers
  const handleSave = async () => {
    // Save current file (onChange is already called for each edit)
    setDirty(false)
    setShowUnsavedDialog(false)

    // Switch to pending file
    if (pendingFilePath) {
      setCurrentFile({ path: pendingFilePath, content: pendingContent })
      setPendingFilePath(null)
      setPendingContent('')
    }
  }

  const handleDiscard = () => {
    setDirty(false)
    setShowUnsavedDialog(false)

    // Switch to pending file
    if (pendingFilePath) {
      setCurrentFile({ path: pendingFilePath, content: pendingContent })
      setPendingFilePath(null)
      setPendingContent('')
    }
  }

  const handleCancel = () => {
    setShowUnsavedDialog(false)
    setPendingFilePath(null)
    setPendingContent('')
    // Stay on current file - do nothing
  }

  // Route to appropriate editor
  if (editorType === 'milkdown') {
    return (
      <>
        <MilkdownEditor
          content={content}
          onChange={handleChange}
          filePath={filePath}
        />

        {/* Unsaved changes dialog */}
        {showUnsavedDialog && currentFile.path && (
          <UnsavedChangesDialog
            fileName={currentFile.path.split('/').pop() || 'Untitled'}
            onSave={handleSave}
            onDiscard={handleDiscard}
            onCancel={handleCancel}
          />
        )}
      </>
    )
  }

  if (editorType === 'monaco') {
    return (
      <>
        <MonacoCodeEditor
          content={content}
          onChange={handleChange}
          filePath={filePath}
        />

        {/* Unsaved changes dialog */}
        {showUnsavedDialog && currentFile.path && (
          <UnsavedChangesDialog
            fileName={currentFile.path.split('/').pop() || 'Untitled'}
            onSave={handleSave}
            onDiscard={handleDiscard}
            onCancel={handleCancel}
          />
        )}
      </>
    )
  }

  // Fallback: plain text editor
  return (
    <>
      <PlainTextEditor
        content={content}
        onChange={handleChange}
        filePath={filePath}
      />

      {/* Unsaved changes dialog */}
      {showUnsavedDialog && currentFile.path && (
        <UnsavedChangesDialog
          fileName={currentFile.path.split('/').pop() || 'Untitled'}
          onSave={handleSave}
          onDiscard={handleDiscard}
          onCancel={handleCancel}
        />
      )}
    </>
  )
}

/**
 * Plain text editor fallback for unknown file types
 */
function PlainTextEditor({
  content,
  onChange,
  filePath
}: {
  content: string
  onChange: (content: string) => void
  filePath: string | null
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-none px-4 py-2 bg-nexus-bg-secondary border-b border-nexus-border">
        <p className="text-xs text-nexus-text-muted">
          Plain text editor • {filePath || 'No file'}
        </p>
      </div>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 w-full p-4 bg-nexus-bg-primary text-nexus-text-primary font-mono text-sm resize-none focus:outline-none"
        style={{
          fontFamily: 'var(--editor-font-family)',
          fontSize: 'var(--editor-font-size)',
          lineHeight: 'var(--editor-line-height)',
        }}
        placeholder="Start typing..."
        spellCheck={false}
      />
    </div>
  )
}
