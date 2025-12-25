import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Placeholder from '@tiptap/extension-placeholder'
import { common, createLowlight } from 'lowlight'
import { useEffect, useState } from 'react'
import { WikiLink } from '../extensions/WikiLink'
import { WikiLinkInputRule } from '../extensions/WikiLinkInputRule'
import { TagMark } from '../extensions/TagMark'
import { TagInputRule } from '../extensions/TagInputRule'
import { WikiLinkAutocomplete } from './WikiLinkAutocomplete'
import { TagAutocomplete } from './TagAutocomplete'
import { Note, Tag } from '../types'

const lowlight = createLowlight(common)

interface EditorProps {
  content: string
  onChange: (content: string) => void
  editable?: boolean
  onLinkClick?: (title: string) => void
  onSearchNotes?: (query: string) => Promise<Note[]>
  onSearchTags?: (query: string) => Promise<Tag[]>
  onTagClick?: (tagName: string) => void
}

export function Editor({
  content,
  onChange,
  editable = true,
  onLinkClick = () => {},
  onSearchNotes = async () => [],
  onSearchTags = async () => [],
  onTagClick = () => {}
}: EditorProps) {
  const [wikiLinkAutocompletePosition, setWikiLinkAutocompletePosition] = useState<number | null>(null)
  const [tagAutocompletePosition, setTagAutocompletePosition] = useState<number | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
        link: false // We'll configure Link extension separately
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 underline hover:text-blue-300'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg'
        }
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'typescript'
      }),
      Placeholder.configure({
        placeholder: 'Start writing...'
      }),
      WikiLink.configure({
        onLinkClick
      }),
      WikiLinkInputRule.configure({
        onTrigger: (position) => {
          console.log('[Editor] WikiLink autocomplete triggered at position:', position)
          setWikiLinkAutocompletePosition(position)
        }
      }),
      TagMark.configure({
        onTagClick
      }),
      TagInputRule.configure({
        onTrigger: (position) => {
          console.log('[Editor] Tag autocomplete triggered at position:', position)
          setTagAutocompletePosition(position)
        }
      })
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] p-4'
      }
    }
  })

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  return (
    <div className="editor-wrapper flex flex-col h-full">
      {editable && <EditorToolbar editor={editor} />}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
      <WikiLinkAutocomplete
        editor={editor}
        triggerPosition={wikiLinkAutocompletePosition}
        onClose={() => setWikiLinkAutocompletePosition(null)}
        onSearchNotes={onSearchNotes}
      />
      <TagAutocomplete
        editor={editor}
        triggerPosition={tagAutocompletePosition}
        onClose={() => setTagAutocompletePosition(null)}
        onSearchTags={onSearchTags}
      />
    </div>
  )
}

function EditorToolbar({ editor }: { editor: any }) {
  return (
    <div className="border-b border-gray-700 p-2 flex items-center gap-1 flex-wrap bg-nexus-bg-secondary">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-nexus-bg-primary ${
          editor.isActive('bold') ? 'bg-nexus-accent' : ''
        }`}
        title="Bold (Cmd+B)"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M12.5 6.5a2.5 2.5 0 100 5h-5v-5h5zM11 13v5H6v-5h5zm1 0h.5a2.5 2.5 0 110 5H12v-5zM6 4h5.5a2.5 2.5 0 010 5H6V4z"/>
        </svg>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-nexus-bg-primary ${
          editor.isActive('italic') ? 'bg-nexus-accent' : ''
        }`}
        title="Italic (Cmd+I)"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 2h8v2h-2.5l-3 12H13v2H5v-2h2.5l3-12H8V2z"/>
        </svg>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-2 rounded hover:bg-nexus-bg-primary ${
          editor.isActive('strike') ? 'bg-nexus-accent' : ''
        }`}
        title="Strikethrough"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM5 9h10v2H5V9z"/>
        </svg>
      </button>

      <div className="w-px h-6 bg-gray-600 mx-1" />

      <select
        value={
          editor.isActive('heading', { level: 1 }) ? '1' :
          editor.isActive('heading', { level: 2 }) ? '2' :
          editor.isActive('heading', { level: 3 }) ? '3' :
          '0'
        }
        onChange={(e) => {
          const level = parseInt(e.target.value)
          if (level === 0) {
            editor.chain().focus().setParagraph().run()
          } else {
            editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run()
          }
        }}
        className="bg-nexus-bg-primary border border-gray-600 rounded px-2 py-1 text-sm"
      >
        <option value="0">Paragraph</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
      </select>

      <div className="w-px h-6 bg-gray-600 mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-nexus-bg-primary ${
          editor.isActive('bulletList') ? 'bg-nexus-accent' : ''
        }`}
        title="Bullet List"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
        </svg>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-nexus-bg-primary ${
          editor.isActive('orderedList') ? 'bg-nexus-accent' : ''
        }`}
        title="Numbered List"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
        </svg>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded hover:bg-nexus-bg-primary ${
          editor.isActive('codeBlock') ? 'bg-nexus-accent' : ''
        }`}
        title="Code Block"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
        </svg>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-nexus-bg-primary ${
          editor.isActive('blockquote') ? 'bg-nexus-accent' : ''
        }`}
        title="Blockquote"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
        </svg>
      </button>

      <div className="w-px h-6 bg-gray-600 mx-1" />

      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-2 rounded hover:bg-nexus-bg-primary disabled:opacity-30"
        title="Undo (Cmd+Z)"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a2 2 0 012 2v4a1 1 0 11-2 0v-4H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd"/>
        </svg>
      </button>

      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-2 rounded hover:bg-nexus-bg-primary disabled:opacity-30"
        title="Redo (Cmd+Shift+Z)"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10.293 14.707a1 1 0 001.414 0l4-4a1 1 0 000-1.414l-4-4a1 1 0 00-1.414 1.414L12.586 9H5a2 2 0 00-2 2v4a1 1 0 102 0v-4h7.586l-2.293 2.293a1 1 0 000 1.414z" clipRule="evenodd"/>
        </svg>
      </button>
    </div>
  )
}
