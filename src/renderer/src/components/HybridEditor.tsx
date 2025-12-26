import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
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
}

type EditorMode = 'write' | 'preview'

/**
 * HybridEditor - ADHD-friendly distraction-free editor
 *
 * Write mode: Contenteditable with wiki-link/tag highlighting
 * Preview mode: Rendered markdown with clickable links
 * Toggle: Cmd+E (Mac) or Ctrl+E (Windows/Linux)
 */
export function HybridEditor({
  content,
  onChange,
  onWikiLinkClick,
  onTagClick,
  onSearchNotes = async () => [],
  onSearchTags = async () => []
}: HybridEditorProps) {
  const [mode, setMode] = useState<EditorMode>('write')
  const editorRef = useRef<HTMLDivElement>(null)

  // Autocomplete state
  const [wikiLinkTrigger, setWikiLinkTrigger] = useState<{ query: string } | null>(null)
  const [tagTrigger, setTagTrigger] = useState<{ query: string } | null>(null)

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
    if (mode === 'write' && editorRef.current) {
      editorRef.current.focus()
    }
  }, [mode])

  // Handle contenteditable input
  const handleInput = useCallback(async () => {
    const editor = editorRef.current
    if (!editor) return

    const text = editor.innerText
    onChange(text)

    // Get cursor position
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)

      // Check for wiki-link trigger [[
      const textBeforeCursor = text.substring(0, getTextOffset(editor, range.startContainer, range.startOffset))
      const wikiMatch = textBeforeCursor.match(/\[\[([^\]]*)$/)

      if (wikiMatch) {
        const query = wikiMatch[1]
        setWikiLinkTrigger({ query })
        setTagTrigger(null)
      } else if (textBeforeCursor.match(/(?<![#\w])#[a-zA-Z][a-zA-Z0-9_-]*$/)) {
        const tagMatch = textBeforeCursor.match(/(?<![#\w])#([a-zA-Z][a-zA-Z0-9_-]*)$/)
        if (tagMatch) {
          const query = tagMatch[1]
          setTagTrigger({ query })
        }
        setWikiLinkTrigger(null)
      } else {
        setWikiLinkTrigger(null)
        setTagTrigger(null)
      }
    }
  }, [onChange])

  // Get text offset for cursor position
  const getTextOffset = useCallback((root: Node, node: Node, offset: number): number => {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      null
    )

    let currentOffset = 0
    while (walker.nextNode()) {
      if (walker.currentNode === node) {
        return currentOffset + offset
      }
      currentOffset += walker.currentNode.textContent?.length || 0
    }
    return currentOffset
  }, [])

  // Handle wiki-link selection
  const handleWikiLinkSelect = useCallback(async (title: string) => {
    const editor = editorRef.current
    if (!editor) return

    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const cursorOffset = getTextOffset(editor, range.startContainer, range.startOffset)
      const text = editor.innerText

      // Find the last [[ position and replace to cursor
      const beforeMatch = text.substring(0, cursorOffset).lastIndexOf('[[')

      if (beforeMatch !== -1) {
        const newText = text.substring(0, beforeMatch) + `[[${title}]]` + text.substring(cursorOffset)
        onChange(newText)

        // Focus back to editor
        setTimeout(() => editor.focus(), 0)
      }
    }

    setWikiLinkTrigger(null)
    onWikiLinkClick?.(title)
  }, [onChange, onWikiLinkClick])

  // Handle tag selection
  const handleTagSelect = useCallback(async (name: string) => {
    const editor = editorRef.current
    if (!editor) return

    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const cursorOffset = getTextOffset(editor, range.startContainer, range.startOffset)
      const text = editor.innerText

      // Find the last # position (not ## heading)
      const beforeText = text.substring(0, cursorOffset)
      const tagMatch = beforeText.match(/(?<![#\w])#[a-zA-Z][a-zA-Z0-9_-]*$/)

      if (tagMatch) {
        const beforeTagPos = beforeText.lastIndexOf('#')
        const newText = text.substring(0, beforeTagPos) + `#${name} ` + text.substring(cursorOffset)
        onChange(newText)

        // Focus back to editor
        setTimeout(() => editor.focus(), 0)
      }
    }

    setTagTrigger(null)
    onTagClick?.(name)
  }, [onChange, onTagClick])

  // Handle wiki-link click in write mode
  const handleWikiLinkClickInEditor = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('wiki-link')) {
      e.preventDefault()
      const title = target.textContent?.replace(/^\[\[|\]\]$/g, '')
      if (title) {
        onWikiLinkClick?.(title)
      }
    }
  }, [onWikiLinkClick])

  // Handle tag click in write mode
  const handleTagClickInEditor = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('tag')) {
      e.preventDefault()
      const tagName = target.textContent?.substring(1) // Remove #
      if (tagName) {
        onTagClick?.(tagName)
      }
    }
  }, [onTagClick])

  // Highlighted content for write mode
  const highlightedContent = useMemo(() => {
    return content
      // Highlight wiki-links [[...]]
      .replace(/\[\[([^\]]+)\]\]/g, '<span class="wiki-link">[[$1]]</span>')
      // Highlight tags #tag (but not ## headings)
      .replace(/(?<![#\w])#([a-zA-Z][a-zA-Z0-9_-]*)/g, '<span class="tag">#$1</span>')
  }, [content])

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
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onClick={handleWikiLinkClickInEditor}
            onClickCapture={handleTagClickInEditor}
            className="editor-content w-full min-h-full bg-transparent text-neutral-100
                       focus:outline-none font-mono text-lg leading-relaxed"
            suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: highlightedContent }}
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
          onSelect={handleWikiLinkSelect}
          onClose={() => setWikiLinkTrigger(null)}
          onSearch={onSearchNotes}
        />
      )}

      {/* Tag autocomplete */}
      {tagTrigger && (
        <SimpleTagAutocomplete
          query={tagTrigger.query}
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

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Custom rendering for links (handles wiki-links)
        a: ({ href, children }) => {
          if (href?.startsWith('wikilink:')) {
            const title = href.replace('wikilink:', '')
            return (
              <button
                onClick={() => onWikiLinkClick?.(title)}
                className="text-blue-400 hover:text-blue-300 underline cursor-pointer bg-transparent border-none"
              >
                {children}
              </button>
            )
          }
          return (
            <a href={href} className="text-blue-400 hover:text-blue-300">
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
                onClick={() => onTagClick?.(text.substring(1))}
                className="inline-block px-2 py-0.5 rounded bg-purple-900/50 text-purple-300 text-sm cursor-pointer hover:bg-purple-900/70"
              >
                {text}
              </button>
            )
          }
          return (
            <code className={className}>
              {children}
            </code>
          )
        }
      }}
    >
      {processedContent}
    </ReactMarkdown>
  )
}

/**
 * Process [[wiki-links]] and #tags into markdown-compatible format
 */
function processWikiLinksAndTags(content: string): string {
  // Convert [[Title]] to [Title](wikilink:Title)
  let processed = content.replace(
    /\[\[([^\]]+)\]\]/g,
    (_, title) => `[${title}](wikilink:${encodeURIComponent(title.trim())})`
  )

  // Convert #tag to inline code (but not ## headings)
  processed = processed.replace(
    /(?<![#\w])#([a-zA-Z][a-zA-Z0-9_-]*)/g,
    '`#$1`'
  )

  return processed
}

export default HybridEditor
