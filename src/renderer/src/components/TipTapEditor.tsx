import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Note } from '../types'

interface TipTapEditorProps {
  content: string
  onChange: (content: string) => void
  editable?: boolean
  onLinkClick?: (title: string) => void
  onSearchNotes?: (query: string) => Promise<Note[]>
}

export function TipTapEditor({
  content,
  onChange,
  editable = true,
  onLinkClick,
  onSearchNotes
}: TipTapEditorProps) {
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  
  // Wiki link autocomplete state
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [autocompleteResults, setAutocompleteResults] = useState<Note[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [wikiQuery, setWikiQuery] = useState('')
  const editorRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4]
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'code-block'
          }
        }
      }),
      Placeholder.configure({
        placeholder: 'Start writing... (Use [[ to link notes)',
        emptyEditorClass: 'is-editor-empty'
      })
    ],
    content: content || '<p></p>',
    editable,
    editorProps: {
      attributes: {
        class: 'tiptap-editor prose prose-invert max-w-none focus:outline-none'
      },
      handleClick: (view, pos, event) => {
        // Handle wiki link clicks [[Note Title]]
        // Get the text around the click position
        const { state } = view
        const { doc } = state
        
        // Find the text at click position
        const resolvedPos = doc.resolve(pos)
        const textNode = resolvedPos.parent
        
        if (textNode.isText) {
          const text = textNode.text || ''
          // Check if clicking inside a wiki link
          const wikiLinkRegex = /\[\[([^\]]+)\]\]/g
          let match
          while ((match = wikiLinkRegex.exec(text)) !== null) {
            const startOffset = match.index
            const endOffset = startOffset + match[0].length
            const clickOffset = pos - resolvedPos.start()
            
            if (clickOffset >= startOffset && clickOffset <= endOffset) {
              // Clicked inside a wiki link
              if (onLinkClick) {
                onLinkClick(match[1])
                return true
              }
            }
          }
        }
        return false
      },
      handleKeyDown: (view, event) => {
        // Handle autocomplete navigation
        if (showAutocomplete) {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setSelectedIndex(i => Math.min(i + 1, autocompleteResults.length - 1))
            return true
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault()
            setSelectedIndex(i => Math.max(i - 1, 0))
            return true
          }
          if (event.key === 'Enter' && autocompleteResults.length > 0) {
            event.preventDefault()
            insertWikiLink(autocompleteResults[selectedIndex].title)
            return true
          }
          if (event.key === 'Escape') {
            event.preventDefault()
            setShowAutocomplete(false)
            return true
          }
        }
        return false
      }
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
      
      // Update word/char count
      const text = editor.getText()
      const words = text.trim().split(/\s+/).filter(w => w.length > 0)
      setWordCount(words.length)
      setCharCount(text.length)
      
      // Check for wiki link trigger [[
      checkForWikiTrigger(text)
    }
  })

  // Check for [[ trigger and update autocomplete
  const checkForWikiTrigger = useCallback(async (text: string) => {
    const match = text.match(/\[\[([^\]]*?)$/)
    
    if (match && onSearchNotes) {
      const query = match[1]
      setWikiQuery(query)
      setShowAutocomplete(true)
      setSelectedIndex(0)
      
      const results = await onSearchNotes(query)
      setAutocompleteResults(results.slice(0, 10))
    } else {
      setShowAutocomplete(false)
      setAutocompleteResults([])
    }
  }, [onSearchNotes])

  // Insert wiki link into editor
  const insertWikiLink = useCallback((title: string) => {
    if (!editor) return
    
    // Get current text and find the [[ position
    const text = editor.getText()
    const match = text.match(/\[\[([^\]]*?)$/)
    
    if (match) {
      // Delete the partial wiki link and insert the complete one as plain text
      const deleteCount = match[0].length
      
      editor.chain()
        .focus()
        .deleteRange({
          from: editor.state.selection.from - deleteCount,
          to: editor.state.selection.from
        })
        .insertContent(`[[${title}]] `)
        .run()
    }
    
    setShowAutocomplete(false)
    setAutocompleteResults([])
    
    // Navigate to the linked note
    if (onLinkClick) {
      onLinkClick(title)
    }
  }, [editor, onLinkClick])

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '<p></p>')
    }
  }, [content, editor])

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable)
    }
  }, [editable, editor])

  if (!editor) {
    return <div className="p-4 text-gray-500">Loading editor...</div>
  }

  return (
    <div ref={editorRef} className="tiptap-wrapper h-full flex flex-col relative">
      <div className="flex-1 overflow-y-auto p-6">
        <EditorContent editor={editor} />
      </div>
      
      {/* Wiki Link Autocomplete Dropdown */}
      {showAutocomplete && autocompleteResults.length > 0 && (
        <div className="autocomplete-dropdown absolute z-50 left-6 top-20 bg-nexus-bg-tertiary border border-white/10 rounded-lg shadow-xl max-h-64 overflow-y-auto min-w-64">
          <div className="px-3 py-2 text-xs text-nexus-text-muted border-b border-white/10 flex items-center gap-2">
            <span>📝</span> Link to note {wikiQuery && `"${wikiQuery}"`}
          </div>
          {autocompleteResults.map((note, index) => (
            <div
              key={note.id}
              className={`px-3 py-2 cursor-pointer flex items-center justify-between ${
                index === selectedIndex ? 'bg-nexus-accent/20 text-nexus-accent' : 'hover:bg-white/5'
              }`}
              onClick={() => insertWikiLink(note.title)}
            >
              <span className="font-medium">{note.title}</span>
              {index === selectedIndex && (
                <span className="text-xs text-nexus-text-muted bg-white/10 px-1.5 py-0.5 rounded">↵</span>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Word count footer */}
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
    </div>
  )
}
