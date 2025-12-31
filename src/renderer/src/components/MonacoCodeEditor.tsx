import { useRef } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import type { editor as MonacoEditorType } from 'monaco-editor'
import { useEditorStore, getMonacoLanguage } from '../store/editorStore'
import { FileCode } from 'lucide-react'

/**
 * MonacoCodeEditor - Code editor with syntax highlighting
 *
 * Features:
 * - Syntax highlighting for LaTeX, R, Python, JavaScript, TypeScript, JSON
 * - Auto-completion
 * - Code folding
 * - Minimap (optional)
 * - Line numbers
 *
 * LaTeX-specific features (TODO - Week 2):
 * - PDF preview pane
 * - Auto-compile on save
 * - Error highlighting
 *
 * See: PLAN-HYBRID-EDITOR.md
 */

interface MonacoCodeEditorProps {
  content: string
  onChange: (content: string) => void
  filePath: string | null
}

export function MonacoCodeEditor({ content, onChange, filePath }: MonacoCodeEditorProps) {
  const editorRef = useRef<MonacoEditorType.IStandaloneCodeEditor | null>(null)
  const { setMonacoInstance } = useEditorStore()
  const language = getMonacoLanguage(filePath)

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    setMonacoInstance(editor)

    // Focus editor on mount
    editor.focus()

    // Configure Monaco editor options
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'var(--editor-font-family, "SF Mono", Monaco, monospace)',
      lineHeight: 1.6,
      minimap: {
        enabled: true
      },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      wrappingStrategy: 'advanced',
      folding: true,
      foldingStrategy: 'indentation',
      showFoldingControls: 'always',
      bracketPairColorization: {
        enabled: true
      }
    })

    // LaTeX-specific configuration
    if (language === 'latex') {
      monaco.languages.registerCompletionItemProvider('latex', {
        provideCompletionItems: () => {
          // TODO: Add LaTeX-specific autocomplete suggestions
          return { suggestions: [] }
        }
      })
    }

    // R-specific configuration
    if (language === 'r') {
      monaco.languages.registerCompletionItemProvider('r', {
        provideCompletionItems: () => {
          // TODO: Add R-specific autocomplete suggestions
          return { suggestions: [] }
        }
      })
    }
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-none px-4 py-2 bg-nexus-bg-secondary border-b border-nexus-border">
        <div className="flex items-center gap-2 text-xs text-nexus-text-muted">
          <FileCode className="w-4 h-4" />
          <span>Monaco Editor</span>
          <span>•</span>
          <span className="capitalize">{language}</span>
          {filePath && (
            <>
              <span>•</span>
              <span>{filePath}</span>
            </>
          )}
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={content}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            automaticLayout: true,
            readOnly: false,
            tabSize: 2,
            insertSpaces: true,
            detectIndentation: true
          }}
        />
      </div>

      {/* Footer - LaTeX-specific actions (TODO: Week 2) */}
      {language === 'latex' && (
        <div className="flex-none px-4 py-2 bg-nexus-bg-secondary border-t border-nexus-border">
          <div className="flex items-center gap-4 text-xs text-nexus-text-muted">
            <span>LaTeX features coming in Week 2:</span>
            <span>• PDF Preview</span>
            <span>• Auto-compile (Cmd+B)</span>
            <span>• Error highlighting</span>
          </div>
        </div>
      )}

      {/* Footer - R-specific actions (TODO: Week 3) */}
      {language === 'r' && (
        <div className="flex-none px-4 py-2 bg-nexus-bg-secondary border-t border-nexus-border">
          <div className="flex items-center gap-4 text-xs text-nexus-text-muted">
            <span>R features coming in Week 3:</span>
            <span>• Run chunk (Cmd+Enter)</span>
            <span>• Inline output</span>
            <span>• Plot display</span>
          </div>
        </div>
      )}
    </div>
  )
}
