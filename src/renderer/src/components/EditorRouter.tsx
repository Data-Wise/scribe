import { useEffect } from 'react'
import { useEditorStore, getEditorTypeForFile } from '../store/editorStore'
import { MilkdownEditor } from './MilkdownEditor'
import { MonacoCodeEditor } from './MonacoCodeEditor'

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
  const { currentFile, setCurrentFile, updateContent } = useEditorStore()
  const editorType = getEditorTypeForFile(filePath)

  // Update store when file changes
  useEffect(() => {
    if (filePath && (filePath !== currentFile.path || content !== currentFile.content)) {
      setCurrentFile({ path: filePath, content })
    }
  }, [filePath, content, currentFile.path, currentFile.content, setCurrentFile])

  // Handle content changes
  const handleChange = (newContent: string) => {
    updateContent(newContent)
    onChange(newContent)
  }

  // Route to appropriate editor
  if (editorType === 'milkdown') {
    return (
      <MilkdownEditor
        content={content}
        onChange={handleChange}
        filePath={filePath}
      />
    )
  }

  if (editorType === 'monaco') {
    return (
      <MonacoCodeEditor
        content={content}
        onChange={handleChange}
        filePath={filePath}
      />
    )
  }

  // Fallback: plain text editor
  return (
    <PlainTextEditor
      content={content}
      onChange={handleChange}
      filePath={filePath}
    />
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
