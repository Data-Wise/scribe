import { useEffect, useState, useRef } from 'react'
import { Editor } from '@tiptap/react'
import { Tag } from '../types'

export interface TagAutocompleteProps {
  editor: Editor | null
  triggerPosition: number | null
  onClose: () => void
  onSearchTags: (query: string) => Promise<Tag[]>
}

export function TagAutocomplete({
  editor,
  triggerPosition,
  onClose,
  onSearchTags
}: TagAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const isOpen = triggerPosition !== null && editor !== null

  // Load tags when query changes
  useEffect(() => {
    if (!isOpen) return

    const loadTags = async () => {
      setLoading(true)
      try {
        const results = await onSearchTags(query)
        setTags(results)
        setSelectedIndex(0)
      } catch (error) {
        console.error('[TagAutocomplete] Error loading tags:', error)
        setTags([])
      } finally {
        setLoading(false)
      }
    }

    loadTags()
  }, [query, isOpen, onSearchTags])

  // Track text after # to update query
  useEffect(() => {
    if (!isOpen || !editor || triggerPosition === null) return undefined

    const updateHandler = () => {
      const { state } = editor
      const { doc, selection } = state
      const cursorPos = selection.from

      // Get text between # and cursor
      const textAfter = doc.textBetween(triggerPosition, cursorPos, '\n')

      console.log('[TagAutocomplete] Text after #:', JSON.stringify(textAfter))

      // Check if user deleted the #
      const textBefore = doc.textBetween(Math.max(0, triggerPosition - 1), triggerPosition, '\n')
      if (!textBefore.endsWith('#')) {
        console.log('[TagAutocomplete] # deleted, closing')
        onClose()
        return
      }

      // Check if user typed space or special character to close
      if (textAfter.includes(' ') || textAfter.includes('\n')) {
        console.log('[TagAutocomplete] Space/newline detected, closing')
        onClose()
        return
      }

      setQuery(textAfter)
    }

    editor.on('update', updateHandler)
    return () => editor.off('update', updateHandler)
  }, [isOpen, editor, triggerPosition, onClose])

  // Insert selected tag
  const insertTag = (tagName: string) => {
    console.log('[TagAutocomplete] Inserting tag:', tagName)
    if (!editor || triggerPosition === null) {
      console.log('[TagAutocomplete] Cannot insert - editor or triggerPosition is null')
      return
    }

    try {
      const { state } = editor
      const cursorPos = state.selection.from

      console.log('[TagAutocomplete] Current cursor:', cursorPos, 'Trigger position:', triggerPosition)

      // Replace text from # to cursor with #tagname
      editor
        .chain()
        .focus()
        .deleteRange({ from: triggerPosition - 1, to: cursorPos })
        .insertContent(`#${tagName} `)
        .run()

      console.log('[TagAutocomplete] Tag inserted successfully')
      onClose()
    } catch (error) {
      console.error('[TagAutocomplete] Error inserting tag:', error)
    }
  }

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const keyHandler = (e: KeyboardEvent) => {
      // Create new tag option is always at the end if query is not empty
      const totalOptions = query.trim() ? tags.length + 1 : tags.length

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, totalOptions - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        // Check if "Create new" option is selected
        if (query.trim() && selectedIndex === tags.length) {
          insertTag(query)
        } else if (tags[selectedIndex]) {
          insertTag(tags[selectedIndex].name)
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', keyHandler, { capture: true })
    return () => document.removeEventListener('keydown', keyHandler, { capture: true })
  }, [isOpen, selectedIndex, tags, query, onClose])

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
      className="tag-autocomplete fixed z-50"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        maxWidth: '400px'
      }}
    >
      {loading ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-3 text-gray-400 text-sm">
          Loading tags...
        </div>
      ) : tags.length === 0 && !query.trim() ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-3 text-gray-400 text-sm">
          No tags available
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden max-h-80 overflow-y-auto">
          {tags.map((tag, index) => (
            <button
              key={tag.id}
              className={`
                w-full text-left px-4 py-2.5 border-b border-gray-700
                hover:bg-gray-700 transition-colors
                ${index === selectedIndex ? 'bg-gray-700' : 'bg-gray-800'}
              `}
              onClick={() => insertTag(tag.name)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span
                    className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color || '#999' }}
                  />
                  <span className="text-sm font-medium text-white truncate">#{tag.name}</span>
                </div>
                <div className="ml-3 flex-shrink-0">
                  <span className="inline-block px-2 py-0.5 text-xs rounded bg-gray-700 text-gray-300">
                    {(tag as any).note_count || 0} notes
                  </span>
                </div>
              </div>
            </button>
          ))}
          {query.trim() && (
            <button
              className={`
                w-full text-left px-4 py-2.5
                hover:bg-gray-700 transition-colors
                ${selectedIndex === tags.length ? 'bg-gray-700' : 'bg-gray-800'}
              `}
              onClick={() => insertTag(query)}
              onMouseEnter={() => setSelectedIndex(tags.length)}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Create new tag:</span>
                <span className="text-sm font-medium text-blue-400">#{query}</span>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
