import { useRef, useState, useEffect } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import type { editor as MonacoEditorType } from 'monaco-editor'
import { useEditorStore, getMonacoLanguage } from '../store/editorStore'
import { FileCode, FileOutput, Loader2, Play } from 'lucide-react'
import { PdfViewer } from './PdfViewer'
import { ROutputDisplay } from './ROutputDisplay'
import { api } from '../lib/api'
import type { LatexCompileResult, RExecutionResult } from '../lib/api'

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
  const { setMonacoInstance, monaco: monacoState, saveMonacoCursorScroll } = useEditorStore()
  const language = getMonacoLanguage(filePath)

  // LaTeX compilation state
  const [isCompiling, setIsCompiling] = useState(false)
  const [pdfPath, setPdfPath] = useState<string | null>(null)
  const [compilationResult, setCompilationResult] = useState<LatexCompileResult | null>(null)
  const [showPdfPreview, setShowPdfPreview] = useState(true)
  const [autoCompile, setAutoCompile] = useState(true)

  // R execution state
  const [isExecutingR, setIsExecutingR] = useState(false)
  const [rExecutionResult, setRExecutionResult] = useState<RExecutionResult | null>(null)

  const isLatexFile = language === 'latex'
  const isRFile = language === 'r'

  // Auto-compile on save (debounced 2.5 seconds)
  useEffect(() => {
    if (!isLatexFile || !autoCompile || !filePath) return

    // Debounce compilation after content changes
    const timer = setTimeout(() => {
      console.log('[LaTeX] Auto-compiling after content change...')
      handleCompileLatex()
    }, 2500) // 2.5 second delay

    return () => clearTimeout(timer)
  }, [content, isLatexFile, autoCompile, filePath])

  // Save cursor/scroll positions when they change
  useEffect(() => {
    if (!editorRef.current) return

    const editor = editorRef.current

    // Save cursor position on change
    const cursorDisposable = editor.onDidChangeCursorPosition(() => {
      const position = editor.getPosition()
      const scrollTop = editor.getScrollTop()
      if (position) {
        saveMonacoCursorScroll(position, scrollTop)
      }
    })

    // Save scroll position on scroll
    const scrollDisposable = editor.onDidScrollChange(() => {
      const position = editor.getPosition()
      const scrollTop = editor.getScrollTop()
      saveMonacoCursorScroll(position, scrollTop)
    })

    return () => {
      cursorDisposable.dispose()
      scrollDisposable.dispose()
    }
  }, [editorRef.current, saveMonacoCursorScroll])

  // Restore cursor/scroll positions on mount
  useEffect(() => {
    if (!editorRef.current || !monacoState.cursorPosition) return

    const editor = editorRef.current

    // Restore cursor position
    editor.setPosition(monacoState.cursorPosition)

    // Restore scroll position
    editor.setScrollTop(monacoState.scrollTop)

    // Focus editor
    editor.focus()
  }, [filePath]) // Run when file changes

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
      // Register Cmd+B (or Ctrl+B on Windows/Linux) for LaTeX compilation
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB, () => {
        console.log('[LaTeX] Cmd+B pressed, triggering compilation...')
        handleCompileLatex()
      })

      monaco.languages.registerCompletionItemProvider('latex', {
        provideCompletionItems: () => {
          // TODO: Add LaTeX-specific autocomplete suggestions
          return { suggestions: [] }
        }
      })
    }

    // R-specific configuration
    if (language === 'r') {
      // Register Cmd+Enter for R chunk execution
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        console.log('[R] Cmd+Enter pressed, triggering execution...')
        handleExecuteR()
      })

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

  const handleCompileLatex = async () => {
    if (!filePath) return

    setIsCompiling(true)
    try {
      const result = await api.compileLatex({
        content,
        filePath,
        engine: 'pdflatex' // Default to pdflatex
      })

      setCompilationResult(result)

      if (result.success && result.pdfPath) {
        setPdfPath(result.pdfPath)
        setShowPdfPreview(true)
      } else {
        // Show errors in console for now (Week 2 Day 4: inline error display)
        console.error('[LaTeX] Compilation failed:', result.errors)
      }
    } catch (error) {
      console.error('[LaTeX] Compilation error:', error)
    } finally {
      setIsCompiling(false)
    }
  }

  const handleExecuteR = async () => {
    if (!content.trim()) return

    setIsExecutingR(true)
    try {
      const result = await api.executeRChunk({
        code: content,
        capturePlots: true
      })

      setRExecutionResult(result)

      if (result.success) {
        console.log('[R] Execution successful:', result)
      } else {
        console.error('[R] Execution failed:', result.error)
      }
    } catch (error) {
      console.error('[R] Execution error:', error)
    } finally {
      setIsExecutingR(false)
    }
  }

  const handleClearROutput = () => {
    setRExecutionResult(null)
  }

  const togglePdfPreview = () => {
    setShowPdfPreview((prev) => !prev)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-none px-4 py-2 bg-nexus-bg-secondary border-b border-nexus-border">
        <div className="flex items-center justify-between">
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

          {/* LaTeX controls */}
          {isLatexFile && (
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-xs text-nexus-text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCompile}
                  onChange={(e) => setAutoCompile(e.target.checked)}
                  className="rounded border-nexus-border"
                />
                <span>Auto-compile</span>
              </label>
              <button
                onClick={handleCompileLatex}
                disabled={isCompiling}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-nexus-accent text-white rounded hover:bg-nexus-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCompiling ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Compiling...</span>
                  </>
                ) : (
                  <>
                    <FileOutput className="w-3 h-3" />
                    <span>Compile (Cmd+B)</span>
                  </>
                )}
              </button>
              {pdfPath && (
                <button
                  onClick={togglePdfPreview}
                  className="px-3 py-1 text-xs bg-nexus-bg-primary text-nexus-text-primary rounded hover:bg-nexus-accent hover:text-white transition-colors"
                >
                  {showPdfPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              )}
            </div>
          )}

          {/* R controls */}
          {isRFile && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExecuteR}
                disabled={isExecutingR}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-nexus-accent text-white rounded hover:bg-nexus-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isExecutingR ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    <span>Run Code (Cmd+Enter)</span>
                  </>
                )}
              </button>
              {rExecutionResult && (
                <button
                  onClick={handleClearROutput}
                  className="px-3 py-1 text-xs bg-nexus-bg-primary text-nexus-text-primary rounded hover:bg-red-500 hover:text-white transition-colors"
                >
                  Clear Output
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content area - side-by-side for LaTeX with PDF */}
      <div className="flex-1 flex overflow-hidden">
        {/* Monaco Editor */}
        <div className={`${isLatexFile && showPdfPreview && pdfPath ? 'w-1/2' : 'w-full'} overflow-hidden`}>
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

        {/* PDF Preview (LaTeX only) */}
        {isLatexFile && showPdfPreview && pdfPath && (
          <div className="w-1/2 border-l border-nexus-border">
            <PdfViewer pdfPath={pdfPath} />
          </div>
        )}
      </div>

      {/* Footer - Compilation errors/warnings */}
      {isLatexFile && compilationResult && (
        <div className="flex-none max-h-32 overflow-auto px-4 py-2 bg-nexus-bg-secondary border-t border-nexus-border">
          {compilationResult.errors.length > 0 && (
            <div className="mb-2">
              <div className="text-xs font-semibold text-red-500 mb-1">Errors:</div>
              {compilationResult.errors.map((error, i) => (
                <div key={i} className="text-xs text-red-400 ml-2">
                  {error.line && <span className="text-nexus-text-muted">Line {error.line}: </span>}
                  {error.message}
                </div>
              ))}
            </div>
          )}
          {compilationResult.warnings.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-yellow-500 mb-1">
                Warnings ({compilationResult.warnings.length}):
              </div>
              {compilationResult.warnings.slice(0, 5).map((warning, i) => (
                <div key={i} className="text-xs text-yellow-400 ml-2 truncate">
                  {warning}
                </div>
              ))}
              {compilationResult.warnings.length > 5 && (
                <div className="text-xs text-nexus-text-muted ml-2">
                  ... and {compilationResult.warnings.length - 5} more
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer - R output display */}
      {isRFile && rExecutionResult && (
        <ROutputDisplay result={rExecutionResult} onClear={handleClearROutput} />
      )}
    </div>
  )
}
