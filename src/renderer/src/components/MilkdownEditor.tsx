import { useEffect, useRef } from 'react'
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { nord } from '@milkdown/theme-nord'
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import 'katex/dist/katex.min.css'
import '@milkdown/theme-nord/style.css'

/**
 * MilkdownEditor - Markdown editor with live preview
 *
 * Features:
 * - CommonMark markdown support
 * - Math support (KaTeX) - TODO: Add math plugin when available
 * - Syntax highlighting (Prism) - TODO: Add prism plugin
 * - Live preview mode
 *
 * See: PLAN-HYBRID-EDITOR.md
 */

interface MilkdownEditorProps {
  content: string
  onChange: (content: string) => void
  filePath: string | null
}

export function MilkdownEditor({ content, onChange, filePath }: MilkdownEditorProps) {
  return (
    <MilkdownProvider>
      <MilkdownEditorInner content={content} onChange={onChange} filePath={filePath} />
    </MilkdownProvider>
  )
}

function MilkdownEditorInner({ content, onChange, filePath }: MilkdownEditorProps) {
  const editorRef = useRef<Editor | null>(null)

  const { get } = useEditor((root) => {
    const editor = Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root)
        ctx.set(defaultValueCtx, content)

        // Listen to markdown changes
        ctx.get(listenerCtx).markdownUpdated((_ctx, markdown) => {
          onChange(markdown)
        })
      })
      .config(nord)
      .use(commonmark)
      .use(listener)
      // TODO: Add math plugin when non-deprecated version is available
      // .use(math)
      // TODO: Add prism plugin for code syntax highlighting
      // .use(prism)

    editorRef.current = editor
    return editor
  })

  // Update editor content when prop changes from outside
  useEffect(() => {
    const editor = get()
    if (editor && content !== undefined) {
      const currentContent = editor.action((ctx) => {
        return ctx.get(defaultValueCtx)
      })

      // Only update if content is different to avoid infinite loops
      if (currentContent !== content) {
        editor.action((ctx) => {
          ctx.set(defaultValueCtx, content)
        })
      }
    }
  }, [content, get])

  return (
    <div className="h-full overflow-auto">
      <div className="milkdown-container p-4">
        <Milkdown />
      </div>

      {/* File info footer */}
      {filePath && (
        <div className="fixed bottom-0 left-0 right-0 px-4 py-2 bg-nexus-bg-secondary border-t border-nexus-border text-xs text-nexus-text-muted">
          <span>Milkdown Editor • {filePath}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Custom styles for Milkdown editor
 *
 * Note: Nord theme is used as base, but we'll customize it to match Scribe's theme
 */
export const milkdownStyles = `
  .milkdown-container {
    font-family: var(--editor-font-family);
    font-size: var(--editor-font-size);
    line-height: var(--editor-line-height);
    color: var(--nexus-text-primary);
  }

  .milkdown .editor {
    outline: none;
    padding: 1rem;
  }

  /* Customize Nord theme colors to match Scribe */
  .milkdown {
    --nord0: var(--nexus-bg-primary);
    --nord1: var(--nexus-bg-secondary);
    --nord2: var(--nexus-bg-tertiary);
    --nord3: var(--nexus-border);
    --nord4: var(--nexus-text-muted);
    --nord5: var(--nexus-text-secondary);
    --nord6: var(--nexus-text-primary);
    --nord8: var(--nexus-accent);
  }
`
