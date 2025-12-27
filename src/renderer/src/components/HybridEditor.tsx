import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { SimpleWikiLinkAutocomplete } from './SimpleWikiLinkAutocomplete'
import { SimpleTagAutocomplete } from './SimpleTagAutocomplete'
import { CitationAutocomplete } from './CitationAutocomplete'
import { WritingProgressCompact } from './WritingProgress'
import { processMathInContent } from '../lib/mathjax'
import { Note, Tag } from '../types'

interface HybridEditorProps {
  content: string
  onChange: (content: string) => void
  onWikiLinkClick?: (title: string) => void
  onTagClick?: (tagName: string) => void
  onSearchNotes?: (query: string) => Promise<Note[]>
  onSearchTags?: (query: string) => Promise<Tag[]>
  placeholder?: string
  initialMode?: 'write' | 'preview'
  focusMode?: boolean // When true, enables typewriter scrolling
  wordGoal?: number // Daily word goal for progress visualization
}

type EditorMode = 'write' | 'preview'

/**
 * HybridEditor - ADHD-friendly distraction-free editor
 *
 * Write mode: Plain textarea for reliable input
 * Preview mode: Rendered markdown with clickable links
 * Toggle: Cmd+E (Mac) or Ctrl+E (Windows/Linux)
 */
export function HybridEditor({
  content,
  onChange,
  onWikiLinkClick,
  onTagClick,
  onSearchNotes = async () => [],
  onSearchTags = async () => [],
  initialMode = 'write',
  focusMode = false,
  wordGoal = 500
}: HybridEditorProps) {
  const [mode, setMode] = useState<EditorMode>(initialMode)

  // Update mode when initialMode prop changes (e.g., when navigating via wiki-link)
  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)

  // Autocomplete state with cursor position
  const [wikiLinkTrigger, setWikiLinkTrigger] = useState<{ query: string; position: { top: number; left: number } } | null>(null)
  const [tagTrigger, setTagTrigger] = useState<{ query: string; position: { top: number; left: number } } | null>(null)
  const [citationTrigger, setCitationTrigger] = useState<{ query: string; position: { top: number; left: number } } | null>(null)

  // Toggle between write and preview modes
  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'write' ? 'preview' : 'write')
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+E or Ctrl+E to toggle mode
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault()
        toggleMode()
      }
      // Escape in preview mode returns to write mode
      if (e.key === 'Escape' && mode === 'preview') {
        e.preventDefault()
        setMode('write')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mode, toggleMode])

  // Focus editor when entering write mode
  useEffect(() => {
    if (mode === 'write' && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [mode])

  // Typewriter scrolling - keeps cursor centered in viewport during focus mode
  const scrollToCursor = useCallback(() => {
    if (!focusMode || mode !== 'write') return

    const textarea = textareaRef.current
    const container = editorContainerRef.current
    if (!textarea || !container) return

    // Get cursor position
    const cursorPos = textarea.selectionStart

    // Create a temporary element to measure cursor position
    const textBeforeCursor = content.substring(0, cursorPos)
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
  }, [focusMode, mode, content])

  // Handle textarea input and check for autocomplete triggers
  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target
    const text = textarea.value
    const cursorPos = textarea.selectionStart ?? text.length
    
    // Update content first
    onChange(text)

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

    const text = content
    
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
      const newText = content + `[[${title}]]`
      onChange(newText)
    }

    setWikiLinkTrigger(null)
  }, [content, onChange])

  // Handle tag selection from autocomplete
  const handleTagSelect = useCallback((name: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const cursorPos = textarea.selectionStart
    const text = content

    // Find the last # position before cursor (that's part of a tag)
    const textBeforeCursor = text.substring(0, cursorPos)
    const tagMatch = textBeforeCursor.match(/(?:^|[^#\w])#([a-zA-Z][a-zA-Z0-9_-]*)$/)

    if (tagMatch) {
      // Find the position of the # that triggered this
      const triggerPos = textBeforeCursor.length - tagMatch[0].length + (tagMatch[0].startsWith('#') ? 0 : 1)
      const newText = text.substring(0, triggerPos) + `#${name} ` + text.substring(cursorPos)
      onChange(newText)

      // Set cursor position after the inserted tag
      const newCursorPos = triggerPos + name.length + 2 // #name + space
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
    }

    setTagTrigger(null)
  }, [content, onChange])

  // Handle citation selection from autocomplete
  const handleCitationSelect = useCallback((key: string) => {
    console.log('[HybridEditor] Citation selected:', key)

    const textarea = textareaRef.current
    if (!textarea) return

    const text = content
    const cursorPos = textarea.selectionStart

    // Find the @ position before cursor
    const textBeforeCursor = text.substring(0, cursorPos)
    const atPos = textBeforeCursor.lastIndexOf('@')

    if (atPos !== -1) {
      // Replace @query with [@key] (Pandoc citation format)
      const newText = text.substring(0, atPos) + `[@${key}]` + text.substring(cursorPos)
      onChange(newText)

      // Set cursor position after the inserted citation
      const newCursorPos = atPos + key.length + 4 // [@key]
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }, 10)
    }

    setCitationTrigger(null)
  }, [content, onChange])

  // Handle keyboard navigation in autocomplete
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

  // Word count
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  return (
    <div className="h-full flex flex-col relative" style={{ backgroundColor: 'var(--nexus-bg-primary)' }}>
      {/* Mode indicator - minimal, top-right */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-3 text-xs" style={{ color: 'var(--nexus-text-muted)' }}>
        <span>{wordCount} words</span>
        <button
          onClick={toggleMode}
          className="px-2 py-1 rounded transition-colors"
          style={{ 
            backgroundColor: 'var(--nexus-bg-tertiary)',
            color: 'var(--nexus-text-primary)'
          }}
          title="Toggle mode (Cmd+E)"
        >
          {mode === 'write' ? 'Preview' : 'Edit'}
        </button>
      </div>

      {/* Editor area */}
      <div
        ref={editorContainerRef}
        className={`flex-1 overflow-auto p-8 pt-16 ${focusMode ? 'typewriter-mode' : ''}`}
        style={{ backgroundColor: 'var(--nexus-bg-primary)' }}
      >
        {mode === 'write' ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Start writing... [[ wiki-links, # tags, @ citations, $math$"
            className="hybrid-editor-textarea w-full h-full min-h-[calc(100vh-200px)] bg-transparent focus:outline-none resize-none"
            style={{
              fontFamily: 'var(--editor-font-family)',
              fontSize: 'var(--editor-font-size)',
              lineHeight: 'var(--editor-line-height)',
              color: 'var(--nexus-text-primary)',
            }}
            spellCheck={false}
          />
        ) : (
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
              content={content}
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
          {mode === 'write' ? 'Writing' : 'Preview'}
          <span style={{ opacity: 0.6 }}>⌘E</span>
        </span>

        {/* Writing progress */}
        <WritingProgressCompact wordCount={wordCount} wordGoal={wordGoal} />

        <span className="flex items-center gap-3">
          <span className="tabular-nums">{wordCount} words</span>
          {focusMode && (
            <span className="text-nexus-accent">Focus Mode</span>
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
        // Blockquotes
        blockquote: ({ children }) => (
          <blockquote 
            className="border-l-4 pl-4 italic my-4"
            style={{ 
              borderColor: 'var(--nexus-bg-tertiary)',
              color: 'var(--nexus-text-muted)'
            }}
          >
            {children}
          </blockquote>
        ),
        // Bold and italic
        strong: ({ children }) => (
          <strong className="font-bold" style={{ color: 'var(--nexus-text-primary)' }}>{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic">{children}</em>
        )
      }}
    >
      {contentWithMath}
    </ReactMarkdown>
  )
}

/**
 * Process [[wiki-links]] and #tags into markdown-compatible format
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

  return processed
}

export default HybridEditor
