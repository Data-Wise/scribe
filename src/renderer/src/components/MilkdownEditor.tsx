import { useEffect, useRef } from 'react'
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { history } from '@milkdown/plugin-history'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react'
import { replaceAll, getMarkdown } from '@milkdown/utils'

interface MilkdownEditorProps {
  content: string
  onChange: (content: string) => void
  onWikiLinkClick?: (title: string) => void
  onTagClick?: (tag: string) => void
  placeholder?: string
  className?: string
}

/**
 * Internal editor component that uses the Milkdown hooks
 */
function MilkdownEditorInner({
  content,
  onChange,
  placeholder,
}: MilkdownEditorProps) {
  const contentRef = useRef(content)
  const isInternalUpdate = useRef(false)

  // Track content changes from parent (e.g., note switch)
  useEffect(() => {
    if (content !== contentRef.current && !isInternalUpdate.current) {
      contentRef.current = content
    }
  }, [content])

  const { get } = useEditor((root) =>
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root)
        ctx.set(defaultValueCtx, content)

        // Set up listener for content changes
        const listenerManager = ctx.get(listenerCtx)
        listenerManager.markdownUpdated((_, markdown) => {
          if (markdown !== contentRef.current) {
            isInternalUpdate.current = true
            contentRef.current = markdown
            onChange(markdown)
            // Reset flag after brief delay
            setTimeout(() => {
              isInternalUpdate.current = false
            }, 50)
          }
        })
      })
      .use(commonmark)
      .use(history)
      .use(listener),
    [placeholder]
  )

  // Sync content from parent when note changes
  useEffect(() => {
    const editor = get()
    if (editor && content !== contentRef.current && !isInternalUpdate.current) {
      editor.action(replaceAll(content))
      contentRef.current = content
    }
  }, [content, get])

  return <Milkdown />
}

/**
 * MilkdownEditor - WYSIWYG Markdown Editor
 *
 * Uses Milkdown (ProseMirror-based) for live preview editing.
 * Renders markdown in real-time while allowing editing.
 */
export function MilkdownEditor(props: MilkdownEditorProps) {
  return (
    <div
      className={`milkdown-editor-wrapper ${props.className || ''}`}
      style={{
        fontFamily: 'var(--editor-font-family)',
        fontSize: 'var(--editor-font-size)',
        lineHeight: 'var(--editor-line-height)',
        color: 'var(--nexus-text-primary)',
      }}
    >
      <MilkdownProvider>
        <MilkdownEditorInner {...props} />
      </MilkdownProvider>
    </div>
  )
}

export default MilkdownEditor
