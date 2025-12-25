import { useEffect, useState, useRef } from 'react'
import { Editor } from '@tiptap/react'
import { Note } from '../types'

export interface WikiLinkAutocompleteProps {
  editor: Editor | null
  triggerPosition: number | null
  onClose: () => void
  onSearchNotes: (query: string) => Promise<Note[]>
}

export function WikiLinkAutocomplete({
  editor,
  triggerPosition,
  onClose,
  onSearchNotes
}: WikiLinkAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const isOpen = triggerPosition !== null && editor !== null

  // Load notes when query changes
  useEffect(() => {
    if (!isOpen) return

    const loadNotes = async () => {
      setLoading(true)
      try {
        const results = await onSearchNotes(query)
        setNotes(results)
        setSelectedIndex(0)
      } catch (error) {
        console.error('[WikiLinkAutocomplete] Error loading notes:', error)
        setNotes([])
      } finally {
        setLoading(false)
      }
    }

    loadNotes()
  }, [query, isOpen, onSearchNotes])

  // Track text after [[ to update query
  useEffect(() => {
    if (!isOpen || !editor || triggerPosition === null) return undefined

    const updateHandler = () => {
      const { state } = editor
      const { doc, selection } = state
      const cursorPos = selection.from

      // Get text between [[ and cursor
      const textAfter = doc.textBetween(triggerPosition, cursorPos, '\n')

      console.log('[WikiLinkAutocomplete] Text after [[:', JSON.stringify(textAfter))

      // Check if user deleted the [[
      const textBefore = doc.textBetween(Math.max(0, triggerPosition - 2), triggerPosition, '\n')
      if (!textBefore.endsWith('[[')) {
        console.log('[WikiLinkAutocomplete] [[ deleted, closing')
        onClose()
        return
      }

      // Check if user typed ]] to close
      if (textAfter.includes(']]')) {
        console.log('[WikiLinkAutocomplete] ]] detected, closing')
        onClose()
        return
      }

      setQuery(textAfter)
    }

    editor.on('update', updateHandler)
    return () => { editor.off('update', updateHandler) }
  }, [isOpen, editor, triggerPosition, onClose])

  // Insert selected note title
  const insertWikiLink = (title: string) => {
    console.log('[WikiLinkAutocomplete] Inserting wiki link:', title)
    if (!editor || triggerPosition === null) {
      console.log('[WikiLinkAutocomplete] Cannot insert - editor or triggerPosition is null')
      return
    }

    try {
      const { state } = editor
      const cursorPos = state.selection.from

      console.log('[WikiLinkAutocomplete] Current cursor:', cursorPos, 'Trigger position:', triggerPosition)

      // Replace text from [[ to cursor with [[Title]]
      editor
        .chain()
        .focus()
        .deleteRange({ from: triggerPosition - 2, to: cursorPos })
        .insertContent(`[[${title}]]`)
        .run()

      console.log('[WikiLinkAutocomplete] Wiki link inserted successfully')
      // Don't call onClose() here - the ]] detection will auto-close
    } catch (error) {
      console.error('[WikiLinkAutocomplete] Error inserting wiki link:', error)
    }
  }

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, notes.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (notes[selectedIndex]) {
          insertWikiLink(notes[selectedIndex].title)
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', keyHandler, { capture: true })
    return () => document.removeEventListener('keydown', keyHandler, { capture: true })
  }, [isOpen, selectedIndex, notes, onClose, insertWikiLink])

  // Calculate position for dropdown
  useEffect(() => {
    if (!isOpen || !editor || triggerPosition === null) {
      setPosition(null)
      return
    }

    const { view } = editor
    const pos = view.state.doc.resolve(triggerPosition)
    const coords = view.coordsAtPos(pos.pos)

    setPosition({
      top: coords.bottom + 8,
      left: coords.left
    })
  }, [isOpen, editor, triggerPosition])

  if (!isOpen || !position) return null

  return (
    <div
      ref={listRef}
      className="wiki-link-autocomplete fixed z-50"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        maxWidth: '400px'
      }}
    >
      {loading ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-3 text-gray-400 text-sm">
          Loading notes...
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-3 text-gray-400 text-sm">
          {query ? `No notes found for "${query}"` : 'No notes available'}
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden max-h-80 overflow-y-auto">
          {notes.map((note, index) => (
            <button
              key={note.id}
              className={`
                w-full text-left px-4 py-2.5 border-b border-gray-700 last:border-b-0
                hover:bg-gray-700 transition-colors
                ${index === selectedIndex ? 'bg-gray-700' : 'bg-gray-800'}
              `}
              onClick={() => insertWikiLink(note.title)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{note.title}</div>
                  {note.content && (
                    <div className="text-xs text-gray-400 truncate mt-0.5">
                      {stripHtml(note.content).slice(0, 60)}...
                    </div>
                  )}
                </div>
                <div className="ml-3 flex-shrink-0">
                  <span className="inline-block px-2 py-0.5 text-xs rounded bg-gray-700 text-gray-300">
                    {note.folder}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Helper to strip HTML tags
function stripHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}
