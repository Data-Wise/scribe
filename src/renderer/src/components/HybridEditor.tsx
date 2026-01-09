import React, { useState, useCallback, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Sparkles, Terminal } from 'lucide-react'
import { SimpleWikiLinkAutocomplete } from './SimpleWikiLinkAutocomplete'
import { SimpleTagAutocomplete } from './SimpleTagAutocomplete'
import { CitationAutocomplete } from './CitationAutocomplete'
import { WritingProgress } from './WritingProgress'
import { QuickChatPopover } from './QuickChatPopover'
import { CodeMirrorEditor } from './CodeMirrorEditor'
import { processMathInContent } from '../lib/mathjax'
import { isBrowser } from '../lib/platform'
import { Note, Tag } from '../types'
import { EditorMode } from '../lib/preferences'

interface HybridEditorProps {
  content: string
  onChange: (content: string) => void
  onWikiLinkClick?: (title: string) => void
  onTagClick?: (tagName: string) => void
  onSearchNotes?: (query: string) => Promise<Note[]>
  onSearchTags?: (query: string) => Promise<Tag[]>
  placeholder?: string
  editorMode?: EditorMode // source, live-preview, or reading
  onEditorModeChange?: (mode: EditorMode) => void // Callback when mode changes
  focusMode?: boolean // When true, enables typewriter scrolling
  wordGoal?: number // Daily word goal for progress visualization
  sessionStartWords?: number // Words at session start for tracking session progress
  streak?: number // Current writing streak in days
  sessionStartTime?: number // Timestamp when session started (for timer display)
  onToggleTerminal?: () => void // Callback to toggle Terminal panel
}

/**
 * HybridEditor - ADHD-friendly distraction-free editor
 *
 * Three modes (Obsidian-style):
 * - Source: Plain textarea, raw markdown
 * - Live Preview: WYSIWYG-like with inline rendering (current line shows raw)
 * - Reading: Fully rendered, read-only
 *
 * Shortcuts: ⌘1 Source, ⌘2 Live Preview, ⌘3 Reading, ⌘E cycles modes
 */
export function HybridEditor({
  content,
  onChange,
  onWikiLinkClick,
  onTagClick,
  onSearchNotes = async () => [],
  onSearchTags = async () => [],
  editorMode = 'source',
  onEditorModeChange,
  focusMode = false,
  wordGoal = 500,
  sessionStartWords = 0,
  streak = 0,
  sessionStartTime,
  onToggleTerminal
}: HybridEditorProps) {
  const [mode, setMode] = useState<EditorMode>(editorMode)

  // LOCAL STATE FIX: Use local state for immediate UI response to prevent race conditions
  // During rapid typing, React may not re-render fast enough with prop updates,
  // causing characters to be lost. Local state ensures immediate feedback.
  const [localContent, setLocalContent] = useState(content)
  const isTypingRef = useRef(false)

  // Sync from props only when NOT typing (e.g., note switch, external AI edit)
  useEffect(() => {
    if (!isTypingRef.current) {
      setLocalContent(content)
    }
  }, [content])

  // Update mode when editorMode prop changes
  useEffect(() => {
    setMode(editorMode)
  }, [editorMode])

  // Notify parent when mode changes
  const handleModeChange = useCallback((newMode: EditorMode) => {
    setMode(newMode)
    onEditorModeChange?.(newMode)
  }, [onEditorModeChange])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)

  // Autocomplete state with cursor position
  const [wikiLinkTrigger, setWikiLinkTrigger] = useState<{ query: string; position: { top: number; left: number } } | null>(null)
  const [tagTrigger, setTagTrigger] = useState<{ query: string; position: { top: number; left: number } } | null>(null)
  const [citationTrigger, setCitationTrigger] = useState<{ query: string; position: { top: number; left: number } } | null>(null)

  // Quick chat popover state
  const [quickChatOpen, setQuickChatOpen] = useState(false)
  const quickChatButtonRef = useRef<HTMLButtonElement>(null)

  // Cycle between modes: source → live-preview → reading → source
  const cycleMode = useCallback(() => {
    const modes: EditorMode[] = ['source', 'live-preview', 'reading']
    const currentIndex = modes.indexOf(mode)
    const nextMode = modes[(currentIndex + 1) % modes.length]
    handleModeChange(nextMode)
  }, [mode, handleModeChange])

  // Keyboard shortcuts for editor modes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+E or Ctrl+E to cycle modes
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault()
        cycleMode()
      }
      // Cmd+1/2/3 to switch to specific mode
      if ((e.metaKey || e.ctrlKey) && e.key === '1') {
        e.preventDefault()
        handleModeChange('source')
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '2') {
        e.preventDefault()
        handleModeChange('live-preview')
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '3') {
        e.preventDefault()
        handleModeChange('reading')
      }
      // Escape in reading mode returns to source mode
      if (e.key === 'Escape' && mode === 'reading') {
        e.preventDefault()
        handleModeChange('source')
      }
      // Cmd+J or Ctrl+J to toggle quick chat
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault()
        setQuickChatOpen(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mode, cycleMode, handleModeChange])

  // Focus editor when entering source or live-preview mode
  useEffect(() => {
    if ((mode === 'source' || mode === 'live-preview') && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [mode])

  // Typewriter scrolling - keeps cursor centered in viewport during focus mode
  const scrollToCursor = useCallback(() => {
    if (!focusMode || mode === 'reading') return

    const textarea = textareaRef.current
    const container = editorContainerRef.current
    if (!textarea || !container) return

    // Get cursor position
    const cursorPos = textarea.selectionStart

    // Create a temporary element to measure cursor position
    const textBeforeCursor = localContent.substring(0, cursorPos)
    const lines = textBeforeCursor.split('\n')
    const currentLineIndex = lines.length - 1

    // Calculate approximate cursor Y position
    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 28
    const cursorY = currentLineIndex * lineHeight

    // Calculate center of viewport
    const containerHeight = container.clientHeight
    const targetScroll = cursorY - (containerHeight / 2) + lineHeight

    // Smooth scroll to center cursor
    container.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: 'smooth'
    })
  }, [focusMode, mode, localContent])

  // Handle textarea input and check for autocomplete triggers
  // @ts-expect-error - Unused function kept for potential future use
  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target
    const text = textarea.value
    const cursorPos = textarea.selectionStart ?? text.length

    // LOCAL STATE FIX: Update local state immediately for instant UI feedback
    isTypingRef.current = true
    setLocalContent(text)
    onChange(text)

    // Reset typing flag after brief delay to allow prop sync when done typing
    setTimeout(() => {
      isTypingRef.current = false
    }, 150)

    // Get text before cursor for trigger detection
    const textBeforeCursor = text.substring(0, cursorPos)
    
    // Debug log
    console.log('[HybridEditor] Input:', { cursorPos, textBeforeCursor: textBeforeCursor.slice(-10) })

    // Check for wiki-link trigger [[
    const wikiMatch = textBeforeCursor.match(/\[\[([^\]]*)$/)
    if (wikiMatch) {
      const query = wikiMatch[1]
      console.log('[HybridEditor] Wiki-link trigger detected:', query)
      
      // Calculate position near cursor
      const rect = textarea.getBoundingClientRect()
      const position = {
        top: rect.top + 30,
        left: rect.left + 50
      }
      
      setWikiLinkTrigger({ query, position })
      setTagTrigger(null)
      return
    }

    // Check for tag trigger # (but not ## headings)
    const tagMatch = textBeforeCursor.match(/(?:^|[^#\w])#([a-zA-Z][a-zA-Z0-9_-]*)$/)
    if (tagMatch) {
      const query = tagMatch[1]
      console.log('[HybridEditor] Tag trigger detected:', query)

      const rect = textarea.getBoundingClientRect()
      const position = {
        top: rect.top + 30,
        left: rect.left + 50
      }

      setTagTrigger({ query, position })
      setWikiLinkTrigger(null)
      setCitationTrigger(null)
      return
    }

    // Check for citation trigger @
    const citeMatch = textBeforeCursor.match(/@([a-zA-Z0-9_:-]*)$/)
    if (citeMatch) {
      const query = citeMatch[1]
      console.log('[HybridEditor] Citation trigger detected:', query)

      const rect = textarea.getBoundingClientRect()
      const position = {
        top: rect.top + 30,
        left: rect.left + 50
      }

      setCitationTrigger({ query, position })
      setWikiLinkTrigger(null)
      setTagTrigger(null)
      return
    }

    // No triggers active
    setWikiLinkTrigger(null)
    setTagTrigger(null)
    setCitationTrigger(null)

    // Typewriter scroll in focus mode
    if (focusMode) {
      requestAnimationFrame(scrollToCursor)
    }
  }, [onChange, focusMode, scrollToCursor])

  // Handle wiki-link selection from autocomplete
  const handleWikiLinkSelect = useCallback((title: string) => {
    console.log('[HybridEditor] Wiki-link selected:', title)
    
    const textarea = textareaRef.current
    if (!textarea) {
      console.log('[HybridEditor] No textarea ref')
      return
    }

    const text = localContent  // Use localContent for current state

    // Find the last [[ position in the entire text (since cursor might have moved)
    const triggerPos = text.lastIndexOf('[[')
    console.log('[HybridEditor] Trigger position:', triggerPos, 'in text:', text)

    if (triggerPos !== -1) {
      // Find where the partial query ends (could be at end of text or before next space/bracket)
      let endPos = text.length
      for (let i = triggerPos + 2; i < text.length; i++) {
        if (text[i] === ']' || text[i] === '\n') {
          endPos = i
          break
        }
      }

      const newText = text.substring(0, triggerPos) + `[[${title}]]` + text.substring(endPos)
      console.log('[HybridEditor] New text:', newText)
      setLocalContent(newText)  // Update local state
      onChange(newText)

      // Set cursor position after the inserted link
      const newCursorPos = triggerPos + title.length + 4 // [[title]]
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }, 10)
    } else {
      console.log('[HybridEditor] No [[ found, appending')
      // Fallback: just append
      const newText = localContent + `[[${title}]]`
      setLocalContent(newText)  // Update local state
      onChange(newText)
    }

    setWikiLinkTrigger(null)
  }, [localContent, onChange])

  // Handle tag selection from autocomplete
  const handleTagSelect = useCallback((name: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const cursorPos = textarea.selectionStart
    const text = localContent  // Use localContent for current state

    // Find the last # position before cursor (that's part of a tag)
    const textBeforeCursor = text.substring(0, cursorPos)
    const tagMatch = textBeforeCursor.match(/(?:^|[^#\w])#([a-zA-Z][a-zA-Z0-9_-]*)$/)

    if (tagMatch) {
      // Find the position of the # that triggered this
      const triggerPos = textBeforeCursor.length - tagMatch[0].length + (tagMatch[0].startsWith('#') ? 0 : 1)
      const newText = text.substring(0, triggerPos) + `#${name} ` + text.substring(cursorPos)
      setLocalContent(newText)  // Update local state
      onChange(newText)

      // Set cursor position after the inserted tag
      const newCursorPos = triggerPos + name.length + 2 // #name + space
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
    }

    setTagTrigger(null)
  }, [localContent, onChange])

  // Handle citation selection from autocomplete
  const handleCitationSelect = useCallback((key: string) => {
    console.log('[HybridEditor] Citation selected:', key)

    const textarea = textareaRef.current
    if (!textarea) return

    const text = localContent  // Use localContent for current state
    const cursorPos = textarea.selectionStart

    // Find the @ position before cursor
    const textBeforeCursor = text.substring(0, cursorPos)
    const atPos = textBeforeCursor.lastIndexOf('@')

    if (atPos !== -1) {
      // Replace @query with [@key] (Pandoc citation format)
      const newText = text.substring(0, atPos) + `[@${key}]` + text.substring(cursorPos)
      setLocalContent(newText)  // Update local state
      onChange(newText)

      // Set cursor position after the inserted citation
      const newCursorPos = atPos + key.length + 4 // [@key]
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }, 10)
    }

    setCitationTrigger(null)
  }, [localContent, onChange])

  // Handle keyboard navigation in autocomplete
  // @ts-expect-error - Unused function kept for potential future use
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Close autocomplete on Escape
    if (e.key === 'Escape') {
      if (wikiLinkTrigger || tagTrigger || citationTrigger) {
        e.preventDefault()
        setWikiLinkTrigger(null)
        setTagTrigger(null)
        setCitationTrigger(null)
      }
    }
  }, [wikiLinkTrigger, tagTrigger, citationTrigger])

  // Word count - use localContent for immediate feedback during typing
  const wordCount = localContent.trim() ? localContent.trim().split(/\s+/).length : 0

  // Handle quick chat submit
  const handleQuickChatSubmit = useCallback(async (message: string): Promise<string> => {
    // In browser mode, AI is not available
    if (isBrowser()) {
      return 'AI features are only available in the desktop app.'
    }
    // TODO: Implement actual AI call via Tauri
    // For now, return a placeholder response
    return `AI response to: "${message}" (Not yet implemented)`
  }, [])

  return (
    <div className="h-full flex flex-col relative" style={{ backgroundColor: 'var(--nexus-bg-primary)' }} data-testid="hybrid-editor" data-mode={mode}>
      {/* Mode toggle - pill style, top-right */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-3 text-xs" style={{ color: 'var(--nexus-text-muted)' }}>
        <span className="tabular-nums">{wordCount} words</span>
        <div
          className="flex rounded-full p-0.5"
          style={{ backgroundColor: 'var(--nexus-bg-tertiary)' }}
          title="⌘1 Source, ⌘2 Live Preview, ⌘3 Reading, ⌘E cycle"
        >
          <button
            onClick={() => handleModeChange('source')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
              mode === 'source'
                ? 'bg-nexus-accent text-white shadow-sm'
                : 'text-nexus-text-muted hover:text-nexus-text-primary'
            }`}
            title="Source mode (⌘1)"
          >
            Source
          </button>
          <button
            onClick={() => handleModeChange('live-preview')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
              mode === 'live-preview'
                ? 'bg-nexus-accent text-white shadow-sm'
                : 'text-nexus-text-muted hover:text-nexus-text-primary'
            }`}
            title="Live Preview mode (⌘2)"
          >
            Live
          </button>
          <button
            onClick={() => handleModeChange('reading')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
              mode === 'reading'
                ? 'bg-nexus-accent text-white shadow-sm'
                : 'text-nexus-text-muted hover:text-nexus-text-primary'
            }`}
            title="Reading mode (⌘3)"
          >
            Reading
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div
        ref={editorContainerRef}
        className={`flex-1 overflow-auto p-8 pt-16 ${focusMode ? 'typewriter-mode' : ''}`}
        style={{ backgroundColor: 'var(--nexus-bg-primary)' }}
      >
        {/* Source mode: CodeMirror with visible syntax markers */}
        {mode === 'source' && (
          <div
            style={{
              backgroundColor: 'var(--nexus-bg-primary)',
              color: 'var(--nexus-text-primary)',
            }}
          >
            <CodeMirrorEditor
              content={localContent}
              onChange={(newContent) => {
                setLocalContent(newContent)
                onChange(newContent)
              }}
              placeholder="Start writing... [[ wiki-links, # tags, @ citations, $math$"
              editorMode="source"  // Source mode shows syntax markers
              onWikiLinkClick={onWikiLinkClick}  // Pass WikiLink navigation callback
            />
          </div>
        )}

        {/* Live Preview mode: Obsidian-style editing with CodeMirror */}
        {mode === 'live-preview' && (
          <div
            style={{
              backgroundColor: 'var(--nexus-bg-primary)',
              color: 'var(--nexus-text-primary)',
            }}
          >
            <CodeMirrorEditor
              content={localContent}
              onChange={(newContent) => {
                setLocalContent(newContent)
                onChange(newContent)
              }}
              placeholder="Start writing..."
              editorMode={mode}  // Pass mode to control syntax hiding
              onWikiLinkClick={onWikiLinkClick}  // Pass WikiLink navigation callback
            />
          </div>
        )}

        {/* Reading mode: fully rendered, read-only */}
        {mode === 'reading' && (
          <div
            className="prose max-w-none"
            style={{
              fontFamily: 'var(--editor-font-family)',
              fontSize: 'var(--editor-font-size)',
              lineHeight: 'var(--editor-line-height)',
              color: 'var(--nexus-text-primary)',
            }}
          >
            <MarkdownPreview
              content={localContent}
              onWikiLinkClick={onWikiLinkClick}
              onTagClick={onTagClick}
            />
          </div>
        )}
      </div>

      {/* Wiki-link autocomplete */}
      {wikiLinkTrigger && (
        <SimpleWikiLinkAutocomplete
          query={wikiLinkTrigger.query}
          position={wikiLinkTrigger.position}
          onSelect={handleWikiLinkSelect}
          onClose={() => setWikiLinkTrigger(null)}
          onSearch={onSearchNotes}
        />
      )}

      {/* Tag autocomplete */}
      {tagTrigger && (
        <SimpleTagAutocomplete
          query={tagTrigger.query}
          position={tagTrigger.position}
          onSelect={handleTagSelect}
          onClose={() => setTagTrigger(null)}
          onSearch={onSearchTags}
        />
      )}

      {/* Citation autocomplete */}
      {citationTrigger && (
        <CitationAutocomplete
          query={citationTrigger.query}
          position={citationTrigger.position}
          onSelect={handleCitationSelect}
          onClose={() => setCitationTrigger(null)}
        />
      )}

      {/* Status bar - with writing progress */}
      <div
        className="px-4 py-2 text-xs flex items-center justify-between gap-4"
        style={{
          color: 'var(--nexus-text-muted)',
          borderTop: '1px solid var(--nexus-bg-tertiary)',
          backgroundColor: 'var(--nexus-bg-secondary)'
        }}
      >
        <span className="flex items-center gap-2">
          {mode === 'source' && 'Source'}
          {mode === 'live-preview' && 'Live Preview'}
          {mode === 'reading' && 'Reading'}
          <span style={{ opacity: 0.6 }}>⌘E</span>
        </span>

        {/* Writing progress */}
        <WritingProgress
          wordCount={wordCount}
          wordGoal={wordGoal}
          sessionStartWords={sessionStartWords}
          streak={streak}
          sessionStartTime={sessionStartTime}
        />

        {/* Quick Chat AI button */}
        <div className="relative">
          <button
            ref={quickChatButtonRef}
            onClick={() => setQuickChatOpen(prev => !prev)}
            className={`p-1 rounded transition-colors ${
              quickChatOpen
                ? 'bg-nexus-accent/20 text-nexus-accent'
                : 'hover:bg-nexus-bg-tertiary/50 text-nexus-text-muted hover:text-nexus-accent'
            }`}
            title="Quick Chat (⌘J)"
            data-testid="quick-chat-button"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
          <QuickChatPopover
            isOpen={quickChatOpen}
            onClose={() => setQuickChatOpen(false)}
            onSubmit={handleQuickChatSubmit}
            anchorRef={quickChatButtonRef}
          />
        </div>

        {/* Terminal button */}
        {onToggleTerminal && (
          <button
            onClick={onToggleTerminal}
            className="p-1 rounded transition-colors hover:bg-nexus-bg-tertiary/50 text-nexus-text-muted hover:text-nexus-accent"
            title="Toggle Terminal (⌘⌥T)"
            data-testid="terminal-status-button"
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>
        )}

        <span className="flex items-center gap-3">
          <span className="tabular-nums">{wordCount} words</span>
          {focusMode && (
            <span className="text-nexus-accent">Focus Mode</span>
          )}
          {isBrowser() && (
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{
                backgroundColor: 'rgba(251, 146, 60, 0.2)',
                color: 'rgb(251, 146, 60)',
                border: '1px solid rgba(251, 146, 60, 0.3)'
              }}
              title="Running in browser mode with IndexedDB storage"
              data-testid="browser-mode-badge"
            >
              Browser Mode
            </span>
          )}
        </span>
      </div>
    </div>
  )
}

/**
 * MarkdownPreview - Renders markdown with custom wiki-link and tag support
 */
function MarkdownPreview({
  content,
  onWikiLinkClick,
  onTagClick
}: {
  content: string
  onWikiLinkClick?: (title: string) => void
  onTagClick?: (tagName: string) => void
}) {
  // Process wiki-links [[Title]] and tags #tag before rendering
  const processedContent = processWikiLinksAndTags(content)

  // Process math expressions in content (converts $...$ and $$...$$ to SVG)
  const contentWithMath = processMathInContent(processedContent)

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}  // Allow raw HTML for rendered math SVG
      components={{
        // Headings with theme-aware styling
        h1: ({ children }) => (
          <h1 className="text-3xl font-bold mb-4 mt-6" style={{ color: 'var(--nexus-text-primary)' }}>{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl font-bold mb-3 mt-5" style={{ color: 'var(--nexus-text-primary)' }}>{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: 'var(--nexus-text-primary)' }}>{children}</h3>
        ),
        // Paragraphs
        p: ({ children }) => (
          <p className="mb-4 leading-relaxed" style={{ color: 'var(--nexus-text-primary)' }}>{children}</p>
        ),
        // Lists
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-4 space-y-1" style={{ color: 'var(--nexus-text-primary)' }}>{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-4 space-y-1" style={{ color: 'var(--nexus-text-primary)' }}>{children}</ol>
        ),
        // Custom rendering for links (handles wiki-links)
        a: (props) => {
          const href = props.href || ''
          const children = props.children

          // Check for wiki-link (https://wikilink.internal/Title)
          if (href?.includes('wikilink.internal/')) {
            const titleEncoded = href.split('wikilink.internal/')[1]
            const title = decodeURIComponent(titleEncoded || '')
            return (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onWikiLinkClick?.(title)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onWikiLinkClick?.(title)
                  }
                }}
                className="underline cursor-pointer"
                style={{ color: 'var(--nexus-accent)', pointerEvents: 'auto' }}
              >
                {children}
              </span>
            )
          }
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: 'var(--nexus-accent)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </a>
          )
        },
        // Custom rendering for code (handles tags)
        code: ({ children, className }) => {
          const text = String(children)
          if (text.startsWith('#') && !className) {
            return (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onTagClick?.(text.substring(1))
                }}
                className="inline-block px-2 py-0.5 rounded text-sm cursor-pointer"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--nexus-accent) 20%, transparent)',
                  color: 'var(--nexus-accent)'
                }}
              >
                {text}
              </button>
            )
          }
          return (
            <code 
              className={`${className || ''} px-1 py-0.5 rounded text-sm`}
              style={{ backgroundColor: 'var(--nexus-bg-tertiary)' }}
            >
              {children}
            </code>
          )
        },
        // Blockquotes (with callout detection)
        blockquote: ({ children }) => {
          // Extract text from first child to detect callout syntax
          const firstChild = React.Children.toArray(children)[0]
          const text = extractTextFromReactNode(firstChild)

          // Check for callout pattern: [!type] optional title
          const calloutMatch = text?.match(/^\[!(\w+)\](?:\s+(.*))?/)

          if (calloutMatch) {
            const type = calloutMatch[1].toLowerCase()
            const title = calloutMatch[2]?.trim() || capitalizeFirst(type)
            const config = getCalloutConfig(type)

            // Filter out the callout header from children
            const contentChildren = filterCalloutHeader(children)

            return (
              <div
                className="callout-box rounded-lg p-4 my-4"
                style={{
                  borderLeft: `4px solid ${config.color}`,
                  backgroundColor: config.bgColor
                }}
              >
                <div className="callout-header flex items-center gap-2 mb-2">
                  <span className="callout-icon text-xl">{config.icon}</span>
                  <span
                    className="callout-title font-semibold"
                    style={{ color: config.color }}
                  >
                    {title}
                  </span>
                </div>
                <div className="callout-content" style={{ fontStyle: 'normal', color: 'var(--nexus-text-primary)' }}>
                  {contentChildren}
                </div>
              </div>
            )
          }

          // Regular blockquote
          return (
            <blockquote
              className="border-l-4 pl-4 italic my-4"
              style={{
                borderColor: 'var(--nexus-bg-tertiary)',
                color: 'var(--nexus-text-muted)'
              }}
            >
              {children}
            </blockquote>
          )
        },
        // Bold and italic
        strong: ({ children }) => (
          <strong className="font-bold" style={{ color: 'var(--nexus-text-primary)' }}>{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic">{children}</em>
        ),
        // Strikethrough (~~text~~)
        del: ({ children }) => (
          <del className="line-through" style={{ color: 'var(--nexus-text-muted)' }}>{children}</del>
        )
      }}
    >
      {contentWithMath}
    </ReactMarkdown>
  )
}

/**
 * Helper: Extract text content from a React node
 */
function extractTextFromReactNode(node: React.ReactNode): string | null {
  if (typeof node === 'string') {
    return node
  }
  if (typeof node === 'number') {
    return String(node)
  }
  if (React.isValidElement(node)) {
    return extractTextFromReactNode(node.props.children)
  }
  if (Array.isArray(node)) {
    return node.map(extractTextFromReactNode).filter(Boolean).join('')
  }
  return null
}

/**
 * Helper: Filter out callout header ([!type] Title) from children
 */
function filterCalloutHeader(children: React.ReactNode): React.ReactNode {
  const childArray = React.Children.toArray(children)
  if (childArray.length === 0) return children

  // Check if first child contains [!type]
  const firstChild = childArray[0]
  const text = extractTextFromReactNode(firstChild)

  if (text?.match(/^\[!\w+\]/)) {
    // If it's a paragraph containing ONLY the [!type] line, remove it entirely
    if (React.isValidElement(firstChild) && firstChild.props?.children) {
      const childText = extractTextFromReactNode(firstChild.props.children)
      if (childText?.match(/^\[!\w+\](?:\s+.*)?$/)) {
        return childArray.slice(1)
      }
    }
  }

  return children
}

/**
 * Helper: Capitalize first letter of a string
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Callout type definitions with colors and icons
 */
const CALLOUT_TYPES: Record<string, { color: string; bgColor: string; icon: string; aliases?: string[] }> = {
  note: { color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)', icon: '📝' },
  info: { color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)', icon: 'ℹ️' },
  tip: { color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)', icon: '💡', aliases: ['hint', 'important'] },
  success: { color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)', icon: '✅', aliases: ['check', 'done'] },
  warning: { color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)', icon: '⚠️', aliases: ['caution', 'attention'] },
  danger: { color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)', icon: '🔴', aliases: ['error'] },
  bug: { color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)', icon: '🐛' },
  question: { color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.1)', icon: '❓', aliases: ['help', 'faq'] },
  example: { color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.1)', icon: '📋' },
  quote: { color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.1)', icon: '💬', aliases: ['cite'] },
  abstract: { color: '#06B6D4', bgColor: 'rgba(6, 182, 212, 0.1)', icon: '📄', aliases: ['summary', 'tldr'] },
}

/**
 * Get callout config by type (including aliases)
 */
function getCalloutConfig(type: string): { color: string; bgColor: string; icon: string } {
  const normalizedType = type.toLowerCase()

  // Direct match
  if (CALLOUT_TYPES[normalizedType]) {
    return CALLOUT_TYPES[normalizedType]
  }

  // Check aliases
  for (const [, config] of Object.entries(CALLOUT_TYPES)) {
    if (config.aliases?.includes(normalizedType)) {
      return config
    }
  }

  // Default to note
  return CALLOUT_TYPES.note
}

/**
 * Process [[wiki-links]], #tags, and callouts into markdown-compatible format
 * Using https scheme with special host to avoid URL sanitization
 */
function processWikiLinksAndTags(content: string): string {
  // Convert [[Title]] to [Title](https://wikilink/Title)
  // Using https:// to avoid URL sanitization by react-markdown
  let processed = content.replace(
    /\[\[([^\]]+)\]\]/g,
    (_, title) => `[${title}](https://wikilink.internal/${encodeURIComponent(title.trim())})`
  )

  // Convert #tag to inline code (but not ## headings)
  processed = processed.replace(
    /(?<![#\w])#([a-zA-Z][a-zA-Z0-9_-]*)/g,
    '`#$1`'
  )

  // NOTE: Callouts are now handled by the blockquote renderer in ReactMarkdown
  // No preprocessing needed - let ReactMarkdown parse > blockquotes naturally

  return processed
}

export default HybridEditor
