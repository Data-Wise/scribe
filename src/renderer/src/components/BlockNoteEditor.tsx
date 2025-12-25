import { useCreateBlockNote, DragHandleButton } from '@blocknote/react'
import { 
  BlockNoteView, 
  SideMenuController, 
  SideMenu 
} from '@blocknote/mantine'
import '@blocknote/mantine/style.css'
import '@blocknote/core/fonts/inter.css'
import { useEffect, useState, useCallback, useRef } from 'react'
import { Note, Tag } from '../types'

interface BlockNoteEditorProps {
  content: string
  onChange: (content: string) => void
  editable?: boolean
  onLinkClick?: (title: string) => void
  onSearchNotes?: (query: string) => Promise<Note[]>
  onSearchTags?: (query: string) => Promise<Tag[]>
  onTagClick?: (tagName: string) => void
}

// Generate consistent color from tag name
function generateTagColor(name: string): string {
  const hash = name.split('').reduce((acc, char) =>
    char.charCodeAt(0) + ((acc << 5) - acc), 0)
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 50%)`
}

interface ContentItem {
  type: string
  text: string
  styles?: Record<string, unknown>
}

interface Block {
  id: string
  type: string
  content?: ContentItem[]
  children?: Block[]
}

export function BlockNoteEditor({
  content,
  onChange,
  editable = true,
  onLinkClick = () => {},
  onSearchNotes = async () => [],
  onSearchTags = async () => [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onTagClick: _onTagClick = () => {}
}: BlockNoteEditorProps) {
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  
  // Autocomplete state
  const [showWikiAutocomplete, setShowWikiAutocomplete] = useState(false)
  const [showTagAutocomplete, setShowTagAutocomplete] = useState(false)
  const [autocompleteResults, setAutocompleteResults] = useState<(Note | Tag)[]>([])
  const [autocompletePosition, setAutocompletePosition] = useState({ x: 0, y: 0 })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const editorContainerRef = useRef<HTMLDivElement>(null)

  // Create editor with dark theme
  const editor = useCreateBlockNote({
    domAttributes: {
      editor: {
        class: 'blocknote-editor-dark'
      }
    }
  })

  // Convert HTML content to blocks on mount
  useEffect(() => {
    if (editor && content) {
      const parseAndSet = async (): Promise<void> => {
        try {
          const blocks = await editor.tryParseHTMLToBlocks(content)
          editor.replaceBlocks(editor.document, blocks)
        } catch (e) {
          console.error('Failed to parse content:', e)
        }
      }
      parseAndSet()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle content changes
  const handleEditorChange = useCallback(async () => {
    if (!editor) return
    
    // Convert blocks to HTML
    const html = await editor.blocksToHTMLLossy(editor.document)
    onChange(html)
    
    // Update word/char count
    const text = (editor.document as Block[])
      .map((block: Block) => {
        if (block.content && Array.isArray(block.content)) {
          return block.content
            .filter((item: ContentItem): item is ContentItem => 
              typeof item === 'object' && 'text' in item)
            .map((item: ContentItem) => item.text)
            .join('')
        }
        return ''
      })
      .join(' ')
    
    const words = text.trim().split(/\s+/).filter((w: string) => w.length > 0)
    setWordCount(words.length)
    setCharCount(text.length)
    
    // Check for wiki link trigger [[
    const selection = editor.getTextCursorPosition()
    if (selection && selection.block) {
      const blockContent = (selection.block as Block).content
      if (Array.isArray(blockContent)) {
        const textContent = blockContent
          .filter((item: ContentItem): item is ContentItem => 
            typeof item === 'object' && 'text' in item)
          .map((item: ContentItem) => item.text)
          .join('')
        
        // Check for [[ trigger
        const wikiLinkMatch = textContent.match(/\[\[([^\]]*?)$/)
        if (wikiLinkMatch) {
          const query = wikiLinkMatch[1]
          setShowWikiAutocomplete(true)
          setShowTagAutocomplete(false)
          const notes = await onSearchNotes(query)
          setAutocompleteResults(notes)
          setSelectedIndex(0)
          
          if (editorContainerRef.current) {
            const rect = editorContainerRef.current.getBoundingClientRect()
            setAutocompletePosition({ x: rect.left + 20, y: rect.top + 100 })
          }
          return
        }
        
        // Check for # trigger
        const tagMatch = textContent.match(/#([a-zA-Z0-9_-]*?)$/)
        if (tagMatch) {
          const query = tagMatch[1]
          setShowTagAutocomplete(true)
          setShowWikiAutocomplete(false)
          const tags = await onSearchTags(query)
          setAutocompleteResults(tags)
          setSelectedIndex(0)
          
          if (editorContainerRef.current) {
            const rect = editorContainerRef.current.getBoundingClientRect()
            setAutocompletePosition({ x: rect.left + 20, y: rect.top + 100 })
          }
          return
        }
      }
    }
    
    // Close autocomplete if no trigger found
    setShowWikiAutocomplete(false)
    setShowTagAutocomplete(false)
  }, [editor, onChange, onSearchNotes, onSearchTags])

  // Subscribe to editor changes
  useEffect(() => {
    if (!editor) return
    
    const unsubscribe = editor.onChange(() => {
      handleEditorChange()
    })
    
    return unsubscribe
  }, [editor, handleEditorChange])

  // Insert wiki link
  const insertWikiLink = useCallback((title: string) => {
    if (!editor) return
    
    const selection = editor.getTextCursorPosition()
    if (!selection) return
    
    const block = selection.block as Block
    if (block && block.content && Array.isArray(block.content)) {
      const textContent = block.content
        .filter((item: ContentItem): item is ContentItem => 
          typeof item === 'object' && 'text' in item)
        .map((item: ContentItem) => item.text)
        .join('')
      
      const newText = textContent.replace(/\[\[[^\]]*?$/, `[[${title}]]`)
      
      editor.updateBlock(block as Parameters<typeof editor.updateBlock>[0], {
        content: [{ type: 'text', text: newText, styles: {} }]
      })
    }
    
    setShowWikiAutocomplete(false)
    onLinkClick(title)
  }, [editor, onLinkClick])

  // Insert tag
  const insertTag = useCallback((name: string) => {
    if (!editor) return
    
    const selection = editor.getTextCursorPosition()
    if (!selection) return
    
    const block = selection.block as Block
    if (block && block.content && Array.isArray(block.content)) {
      const textContent = block.content
        .filter((item: ContentItem): item is ContentItem => 
          typeof item === 'object' && 'text' in item)
        .map((item: ContentItem) => item.text)
        .join('')
      
      const newText = textContent.replace(/#[a-zA-Z0-9_-]*?$/, `#${name}`)
      
      editor.updateBlock(block as Parameters<typeof editor.updateBlock>[0], {
        content: [{ type: 'text', text: newText, styles: {} }]
      })
    }
    
    setShowTagAutocomplete(false)
  }, [editor])

  // Handle keyboard navigation for autocomplete
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showWikiAutocomplete && !showTagAutocomplete) return
    
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      e.stopPropagation()
      setSelectedIndex(i => Math.min(i + 1, autocompleteResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      e.stopPropagation()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && autocompleteResults.length > 0) {
      e.preventDefault()
      e.stopPropagation()
      const selected = autocompleteResults[selectedIndex]
      if (showWikiAutocomplete && 'title' in selected) {
        insertWikiLink(selected.title)
      } else if (showTagAutocomplete && 'name' in selected) {
        insertTag(selected.name)
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      setShowWikiAutocomplete(false)
      setShowTagAutocomplete(false)
    }
  }, [showWikiAutocomplete, showTagAutocomplete, autocompleteResults, selectedIndex, insertWikiLink, insertTag])

  if (!editor) {
    return null
  }

  return (
    <div 
      ref={editorContainerRef}
      className="blocknote-wrapper h-full flex flex-col"
      onKeyDown={handleKeyDown}
    >
      <div className="flex-1 overflow-y-auto">
        <BlockNoteView 
          editor={editor} 
          theme="dark"
          editable={editable}
          sideMenu={false}
        >
          <SideMenuController
            sideMenu={(props) => (
              <SideMenu {...props}>
                {/* Omit AddBlockButton to hide the "+" button */}
                <DragHandleButton {...props} />
              </SideMenu>
            )}
          />
        </BlockNoteView>
      </div>
      
      {/* Word count footer with goal progress */}
      <div className="word-count-footer">
        <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
        <div className="word-goal-progress" title="Daily goal: 500 words">
          <div 
            className="word-goal-bar"
            style={{ width: `${Math.min(wordCount / 500 * 100, 100)}%` }}
          />
        </div>
        <span className="ml-auto">{charCount} chars</span>
      </div>
      
      {/* Wiki Link Autocomplete */}
      {showWikiAutocomplete && autocompleteResults.length > 0 && (
        <div 
          className="autocomplete-dropdown absolute z-50 rounded-lg max-h-64 overflow-y-auto min-w-64"
          style={{ left: autocompletePosition.x, top: autocompletePosition.y }}
        >
          <div className="px-3 py-2 text-xs text-nexus-text-muted border-b border-white/10 flex items-center gap-2">
            <span>📝</span> Link to note
          </div>
          {autocompleteResults.map((note, index) => (
            'title' in note && (
              <div
                key={note.id}
                className={`autocomplete-item px-3 py-2 cursor-pointer flex items-center justify-between ${
                  index === selectedIndex ? 'selected' : ''
                }`}
                onClick={() => insertWikiLink(note.title)}
              >
                <div className="font-medium text-nexus-text-primary">{note.title}</div>
                {index === selectedIndex && (
                  <span className="text-xs text-nexus-text-muted bg-white/10 px-1.5 py-0.5 rounded">↵</span>
                )}
              </div>
            )
          ))}
        </div>
      )}
      
      {/* Tag Autocomplete */}
      {showTagAutocomplete && autocompleteResults.length > 0 && (
        <div 
          className="autocomplete-dropdown absolute z-50 rounded-lg max-h-64 overflow-y-auto min-w-48"
          style={{ left: autocompletePosition.x, top: autocompletePosition.y }}
        >
          <div className="px-3 py-2 text-xs text-nexus-text-muted border-b border-white/10 flex items-center gap-2">
            <span>🏷️</span> Select tag
          </div>
          {autocompleteResults.map((tag, index) => (
            'name' in tag && (
              <div
                key={tag.id}
                className={`autocomplete-item px-3 py-2 cursor-pointer flex items-center justify-between ${
                  index === selectedIndex ? 'selected' : ''
                }`}
                onClick={() => insertTag(tag.name)}
              >
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color || generateTagColor(tag.name) }}
                  />
                  <span className="text-nexus-text-primary">#{tag.name}</span>
                </div>
                {index === selectedIndex && (
                  <span className="text-xs text-nexus-text-muted bg-white/10 px-1.5 py-0.5 rounded">↵</span>
                )}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  )
}
