import { useEffect, useRef } from 'react'
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { nord } from '@milkdown/theme-nord'
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { math } from '@milkdown/plugin-math'
import { prism } from '@milkdown/plugin-prism'
import 'katex/dist/katex.min.css'
import '@milkdown/theme-nord/style.css'
import 'prismjs/themes/prism.css'

/**
 * MilkdownEditor - Markdown editor with live preview
 *
 * Features:
 * - CommonMark markdown support
 * - Math support (KaTeX) via @milkdown/plugin-math
 * - Syntax highlighting (Prism) via @milkdown/plugin-prism
 * - Live preview mode
 * - Change detection via listener plugin
 *
 * Note: @milkdown/plugin-math shows deprecation warning but is functional
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
      .use(math)
      .use(prism)

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

// Inject custom styles for Milkdown that match Scribe's theme
if (typeof document !== 'undefined' && !document.getElementById('milkdown-custom-styles')) {
  const style = document.createElement('style')
  style.id = 'milkdown-custom-styles'
  style.textContent = `
    /* Milkdown container - match Scribe editor font settings */
    .milkdown-container {
      font-family: var(--editor-font-family, 'Inter', sans-serif);
      font-size: var(--editor-font-size, 1.125rem);
      line-height: var(--editor-line-height, 1.8);
      color: var(--nexus-text-primary);
      background: var(--nexus-bg-primary);
    }

    /* Editor area */
    .milkdown .editor {
      outline: none;
      padding: 2rem 1rem;
      min-height: 100%;
      background: var(--nexus-bg-primary);
      color: var(--nexus-text-primary);
    }

    /* Override Nord theme colors to match Scribe's Nexus theme */
    .milkdown {
      --nord0: var(--nexus-bg-primary);
      --nord1: var(--nexus-bg-secondary);
      --nord2: var(--nexus-bg-tertiary);
      --nord3: var(--nexus-text-muted);
      --nord4: var(--nexus-text-muted);
      --nord5: var(--nexus-text-primary);
      --nord6: var(--nexus-text-primary);
      --nord8: var(--nexus-accent);
      --nord9: var(--nexus-accent);
      --nord10: var(--nexus-accent-hover);
      background-color: var(--nexus-bg-primary);
    }

    /* Headings */
    .milkdown h1,
    .milkdown h2,
    .milkdown h3,
    .milkdown h4,
    .milkdown h5,
    .milkdown h6 {
      color: var(--nexus-text-primary);
      font-weight: 600;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
    }

    /* Code blocks */
    .milkdown pre {
      background: var(--nexus-bg-secondary);
      border: 1px solid var(--nexus-bg-tertiary);
      border-radius: 0.375rem;
      padding: 1rem;
      overflow-x: auto;
    }

    .milkdown code {
      background: var(--nexus-bg-secondary);
      color: var(--nexus-accent);
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      font-size: 0.9em;
    }

    .milkdown pre code {
      background: transparent;
      padding: 0;
    }

    /* Links */
    .milkdown a {
      color: var(--nexus-accent);
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: border-color 0.2s;
    }

    .milkdown a:hover {
      border-bottom-color: var(--nexus-accent);
    }

    /* Lists */
    .milkdown ul,
    .milkdown ol {
      color: var(--nexus-text-primary);
    }

    /* Blockquotes */
    .milkdown blockquote {
      border-left: 3px solid var(--nexus-accent);
      padding-left: 1rem;
      color: var(--nexus-text-muted);
      font-style: italic;
    }

    /* Math (KaTeX) */
    .milkdown .katex {
      color: var(--nexus-text-primary);
    }

    /* Tables */
    .milkdown table {
      border-collapse: collapse;
      width: 100%;
      margin: 1rem 0;
    }

    .milkdown th,
    .milkdown td {
      border: 1px solid var(--nexus-bg-tertiary);
      padding: 0.5rem 1rem;
      text-align: left;
    }

    .milkdown th {
      background: var(--nexus-bg-secondary);
      font-weight: 600;
    }

    /* Selection */
    .milkdown ::selection {
      background: var(--nexus-accent);
      color: var(--nexus-bg-primary);
    }

    /* Placeholder */
    .milkdown .placeholder {
      color: var(--nexus-text-muted);
      opacity: 0.5;
    }
  `
  document.head.appendChild(style)
}
