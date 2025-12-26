import { useState, useCallback, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { SimpleWikiLinkAutocomplete } from './SimpleWikiLinkAutocomplete'
import { SimpleTagAutocomplete } from './SimpleTagAutocomplete'
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
  initialMode = 'write'
}: HybridEditorProps) {
  const [mode, setMode] = useState<EditorMode>(initialMode)
  
  // Update mode when initialMode prop changes (e.g., when navigating via wiki-link)
  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Autocomplete state with cursor position
  const [wikiLinkTrigger, setWikiLinkTrigger] = useState<{ query: string; position: { top: number; left: number } } | null>(null)
  const [tagTrigger, setTagTrigger] = useState<{ query: string; position: { top: number; left: number } } | null>(null)

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
      return
    }

    // No triggers active
    setWikiLinkTrigger(null)
    setTagTrigger(null)
  }, [onChange])

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

  // Handle keyboard navigation in autocomplete
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Close autocomplete on Escape
    if (e.key === 'Escape') {
      if (wikiLinkTrigger || tagTrigger) {
        e.preventDefault()
        setWikiLinkTrigger(null)
        setTagTrigger(null)
      }
    }
  }, [wikiLinkTrigger, tagTrigger])

  // Word count
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  return (
    <div className="h-full flex flex-col bg-neutral-900 relative">
      {/* Mode indicator - minimal, top-right */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-3 text-xs text-neutral-500">
        <span>{wordCount} words</span>
        <button
          onClick={toggleMode}
          className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors"
          title="Toggle mode (Cmd+E)"
        >
          {mode === 'write' ? 'Preview' : 'Edit'}
        </button>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-auto p-8 pt-16">
        {mode === 'write' ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Start writing... Type [[ for wiki-links, # for tags"
            className="w-full h-full min-h-[calc(100vh-200px)] bg-transparent text-neutral-100
                       focus:outline-none font-mono text-lg leading-relaxed resize-none
                       placeholder:text-neutral-600"
            spellCheck={false}
          />
        ) : (
          <div className="prose prose-invert prose-lg max-w-none">
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

      {/* Status bar - minimal */}
      <div className="px-4 py-2 text-xs text-neutral-600 border-t border-neutral-800 flex justify-between">
        <span>
          {mode === 'write' ? 'Writing' : 'Preview'}
          <span className="text-neutral-700 ml-2">Cmd+E to toggle</span>
        </span>
        <span>Markdown supported</span>
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
  
  console.log('[MarkdownPreview] Rendering:', { original: content.slice(0, 50), processed: processedContent.slice(0, 50) })

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Headings with explicit styling
        h1: ({ children }) => (
          <h1 className="text-3xl font-bold text-white mb-4 mt-6">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl font-bold text-white mb-3 mt-5">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-bold text-white mb-2 mt-4">{children}</h3>
        ),
        // Paragraphs
        p: ({ children }) => (
          <p className="text-neutral-200 mb-4 leading-relaxed">{children}</p>
        ),
        // Lists
        ul: ({ children }) => (
          <ul className="list-disc list-inside text-neutral-200 mb-4 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside text-neutral-200 mb-4 space-y-1">{children}</ol>
        ),
        // Custom rendering for links (handles wiki-links)
        a: (props) => {
          const href = props.href || ''
          const children = props.children
          
          console.log('[MarkdownPreview] Link href:', href)
          
          // Check for wiki-link (https://wikilink.internal/Title)
          if (href?.includes('wikilink.internal/')) {
            const titleEncoded = href.split('wikilink.internal/')[1]
            const title = decodeURIComponent(titleEncoded || '')
            console.log('[MarkdownPreview] Wiki-link detected:', title)
            return (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('[MarkdownPreview] Wiki-link clicked:', title)
                  onWikiLinkClick?.(title)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onWikiLinkClick?.(title)
                  }
                }}
                className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
                style={{ pointerEvents: 'auto' }}
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
              className="text-blue-400 hover:text-blue-300 underline"
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
                  console.log('[MarkdownPreview] Tag clicked:', text)
                  onTagClick?.(text.substring(1))
                }}
                className="inline-block px-2 py-0.5 rounded bg-purple-900/50 text-purple-300 text-sm cursor-pointer hover:bg-purple-900/70"
              >
                {text}
              </button>
            )
          }
          return (
            <code className={`${className || ''} bg-neutral-800 px-1 py-0.5 rounded text-sm`}>
              {children}
            </code>
          )
        },
        // Blockquotes
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-neutral-600 pl-4 italic text-neutral-400 my-4">
            {children}
          </blockquote>
        ),
        // Bold and italic
        strong: ({ children }) => (
          <strong className="font-bold text-white">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic">{children}</em>
        )
      }}
    >
      {processedContent}
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
