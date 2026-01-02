import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { useEffect, useCallback, useState } from 'react'

interface TipTapEditorProps {
  content: string
  onChange: (content: string) => void
  editable?: boolean
  onLinkClick?: (title: string) => void
}

export function TipTapEditor({
  content,
  onChange,
  editable = true,
  onLinkClick
}: TipTapEditorProps) {
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)

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
        placeholder: 'Start writing...',
        emptyEditorClass: 'is-editor-empty'
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'wiki-link'
        }
      })
    ],
    content: content || '<p></p>',
    editable,
    editorProps: {
      attributes: {
        class: 'tiptap-editor prose prose-invert max-w-none focus:outline-none'
      },
      handleClick: (view, pos, event) => {
        const target = event.target as HTMLElement
        
        // Handle wiki link clicks [[Note Title]]
        if (target.classList.contains('wiki-link') && onLinkClick) {
          const text = target.textContent || ''
          const match = text.match(/\[\[(.+?)\]\]/)
          if (match) {
            onLinkClick(match[1])
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
    }
  })

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
    <div className="tiptap-wrapper h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <EditorContent editor={editor} />
      </div>
      
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
