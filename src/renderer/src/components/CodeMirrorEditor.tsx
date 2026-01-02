import { useCallback, useMemo, useRef, useEffect } from 'react'
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { Strikethrough } from '@lezer/markdown'
import { EditorView, Decoration, ViewPlugin, ViewUpdate, WidgetType } from '@codemirror/view'
import { syntaxTree } from '@codemirror/language'
import type { DecorationSet } from '@codemirror/view'
import type { Range } from '@codemirror/state'
import katex from 'katex'
import 'katex/dist/katex.min.css'

/**
 * Empty widget that replaces hidden syntax
 */
class HiddenWidget extends WidgetType {
  toDOM() {
    const span = document.createElement('span')
    span.className = 'cm-hidden-syntax'
    return span
  }
}

/**
 * Bullet widget that replaces list markers
 */
class BulletWidget extends WidgetType {
  toDOM() {
    const span = document.createElement('span')
    span.className = 'cm-bullet'
    span.textContent = '•'
    return span
  }
}

/**
 * Math widget that renders LaTeX using KaTeX
 * Supports both inline ($...$) and display ($$...$$) math
 */
class MathWidget extends WidgetType {
  constructor(readonly formula: string, readonly displayMode: boolean = false) {
    super()
  }

  eq(other: MathWidget) {
    return other.formula === this.formula && other.displayMode === this.displayMode
  }

  toDOM() {
    const span = document.createElement('span')
    span.className = this.displayMode ? 'cm-math-display' : 'cm-math-inline'
    try {
      katex.render(this.formula, span, {
        displayMode: this.displayMode,
        throwOnError: false,
        output: 'html'
      })
    } catch {
      // Show formula as-is on error
      span.textContent = this.displayMode ? `$$${this.formula}$$` : `$${this.formula}$`
      span.className += ' cm-math-error'
    }
    return span
  }

  ignoreEvent() { return false }
}

const hiddenWidget = new HiddenWidget()
const bulletWidget = new BulletWidget()

/**
 * Plugin that hides markdown syntax when cursor is outside formatted elements
 * Reveals syntax when cursor is inside (Obsidian/Typora style)
 */
class RichMarkdownPlugin {
  decorations: DecorationSet

  constructor(view: EditorView) {
    this.decorations = this.computeDecorations(view)
  }

  update(update: ViewUpdate): void {
    if (update.docChanged || update.viewportChanged || update.selectionSet) {
      this.decorations = this.computeDecorations(update.view)
    }
  }

  computeDecorations(view: EditorView): DecorationSet {
    const widgets: Range<Decoration>[] = []
    const cursor = view.state.selection.main
    const doc = view.state.doc

    // Elements that contain marks we want to hide
    const formattedElements = [
      'Emphasis',
      'StrongEmphasis',
      'InlineCode',
      'Link',
      'Image',
      'Strikethrough',
    ]

    for (const { from, to } of view.visibleRanges) {
      syntaxTree(view.state).iterate({
        from,
        to,
        enter: (node) => {
          // For formatted elements (bold, italic, code, links),
          // skip processing children if cursor is inside the element
          // This prevents hiding syntax when actively editing that element
          if (formattedElements.includes(node.name)) {
            const cursorInElement = cursor.from >= node.from && cursor.to <= node.to
            if (cursorInElement) {
              return false // Don't process children - syntax stays visible
            }
          }

          // For headings, check if cursor is on the same line
          if (node.name.startsWith('ATXHeading')) {
            const cursorLine = doc.lineAt(cursor.head).number
            const nodeLine = doc.lineAt(node.from).number
            if (cursorLine === nodeLine) {
              return false // Don't hide header marks when editing heading
            }
          }

          // Hide header marks (# ## ### etc.)
          // IMPORTANT: Don't include trailing space if it would cross line boundary
          if (node.name === 'HeaderMark') {
            const line = doc.lineAt(node.from)
            // Only extend to include space if we're still on the same line
            const endPos = Math.min(node.to + 1, line.to)
            widgets.push(
              Decoration.replace({ widget: hiddenWidget }).range(node.from, endPos)
            )
          }

          // Hide emphasis marks (* _ for italic/bold)
          if (node.name === 'EmphasisMark') {
            widgets.push(
              Decoration.replace({ widget: hiddenWidget }).range(node.from, node.to)
            )
          }

          // Hide code marks (`)
          if (node.name === 'CodeMark') {
            widgets.push(
              Decoration.replace({ widget: hiddenWidget }).range(node.from, node.to)
            )
          }

          // Replace list markers with bullets (unless cursor is on that line)
          if (node.name === 'ListMark') {
            const cursorLine = doc.lineAt(cursor.head).number
            const nodeLine = doc.lineAt(node.from).number
            if (cursorLine !== nodeLine) {
              widgets.push(
                Decoration.replace({ widget: bulletWidget }).range(node.from, node.to)
              )
            }
          }

          // Hide link marks and URLs
          if (node.name === 'LinkMark' || node.name === 'URL') {
            widgets.push(
              Decoration.replace({ widget: hiddenWidget }).range(node.from, node.to)
            )
          }

          // Hide strikethrough marks (~~)
          if (node.name === 'StrikethroughMark') {
            widgets.push(
              Decoration.replace({ widget: hiddenWidget }).range(node.from, node.to)
            )
          }
        }
      })

      // Process math using regex (markdown parser doesn't recognize $...$ syntax)
      const text = doc.sliceString(from, to)

      // First, find display math ($$...$$) on single lines
      // Must process before inline math to avoid partial matches
      const displayMathRegex = /\$\$([^$]+)\$\$/g
      let match
      while ((match = displayMathRegex.exec(text)) !== null) {
        const matchFrom = from + match.index
        const matchTo = matchFrom + match[0].length
        const formula = match[1].trim()

        // Skip if contains newlines (multi-line needs StateField)
        if (formula.includes('\n')) continue

        // Skip if cursor is inside this math expression
        if (cursor.from >= matchFrom && cursor.to <= matchTo) continue

        widgets.push(
          Decoration.replace({
            widget: new MathWidget(formula, true) // displayMode = true
          }).range(matchFrom, matchTo)
        )
      }

      // Then process inline math ($...$)
      // Negative lookbehind/ahead to avoid matching $$
      const inlineMathRegex = /(?<!\$)\$([^$\n]+)\$(?!\$)/g
      while ((match = inlineMathRegex.exec(text)) !== null) {
        const matchFrom = from + match.index
        const matchTo = matchFrom + match[0].length
        const formula = match[1]

        // Skip if cursor is inside this math expression
        if (cursor.from >= matchFrom && cursor.to <= matchTo) continue

        widgets.push(
          Decoration.replace({
            widget: new MathWidget(formula, false) // displayMode = false
          }).range(matchFrom, matchTo)
        )
      }
    }

    // Sort decorations by position (required for Decoration.set)
    // Also filter out any overlapping ranges
    widgets.sort((a, b) => a.from - b.from)

    return Decoration.set(widgets)
  }
}

const richMarkdownPlugin = ViewPlugin.fromClass(RichMarkdownPlugin, {
  decorations: v => v.decorations
})

/**
 * Custom theme for the rich markdown editor
 * Matches the Reading mode styling for consistency
 */
const editorTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent',
    fontSize: 'var(--editor-font-size, 16px)',
    fontFamily: 'var(--editor-font-family, system-ui)',
  },
  '.cm-content': {
    caretColor: 'var(--nexus-text-primary, #1a1a1a)',
    lineHeight: 'var(--editor-line-height, 1.6)',
    padding: '0',
  },
  '.cm-line': {
    padding: '2px 0',
  },
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: 'inherit',
  },
  '.cm-focused': {
    outline: 'none',
  },
  // Hidden syntax placeholder (empty)
  '.cm-hidden-syntax': {
    display: 'none',
  },
  // Bullet style
  '.cm-bullet': {
    color: 'var(--nexus-accent, #22c55e)',
    marginRight: '0.5em',
    fontSize: '1.2em',
  },
  // Heading styles - match Reading mode
  '.tok-heading1': {
    fontSize: '2em',
    fontWeight: '700',
    lineHeight: '1.4',
    color: 'var(--nexus-text-primary, #1a1a1a)',
  },
  '.tok-heading2': {
    fontSize: '1.5em',
    fontWeight: '600',
    lineHeight: '1.4',
    color: 'var(--nexus-text-primary, #1a1a1a)',
  },
  '.tok-heading3': {
    fontSize: '1.25em',
    fontWeight: '600',
    lineHeight: '1.4',
    color: 'var(--nexus-text-primary, #1a1a1a)',
  },
  '.tok-heading4, .tok-heading5, .tok-heading6': {
    fontSize: '1.1em',
    fontWeight: '600',
    color: 'var(--nexus-text-primary, #1a1a1a)',
  },
  // Emphasis styles
  '.tok-emphasis': {
    fontStyle: 'italic',
  },
  '.tok-strong': {
    fontWeight: '600',
    color: 'var(--nexus-text-primary, #1a1a1a)',
  },
  // Strikethrough styles
  '.tok-strikethrough': {
    textDecoration: 'line-through',
    color: 'var(--nexus-text-muted, #666)',
  },
  // Code styles - match Reading mode
  '.tok-monospace': {
    fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
    backgroundColor: 'var(--nexus-bg-tertiary, rgba(0, 0, 0, 0.06))',
    padding: '0.2em 0.4em',
    borderRadius: '4px',
    fontSize: '0.9em',
  },
  // Link styles
  '.tok-link': {
    color: 'var(--nexus-accent, #22c55e)',
    textDecoration: 'none',
  },
  '.tok-link:hover': {
    textDecoration: 'underline',
  },
  '.tok-url': {
    color: 'var(--nexus-accent, #22c55e)',
    opacity: '0.6',
    fontSize: '0.9em',
  },
  // Meta (like ### marks when visible)
  '.tok-meta': {
    color: 'var(--nexus-text-muted, #999)',
    fontWeight: '400',
  },
  // Quote styles
  '.tok-quote': {
    color: 'var(--nexus-text-secondary, #666)',
    fontStyle: 'italic',
    borderLeft: '3px solid var(--nexus-accent, #22c55e)',
    paddingLeft: '1em',
  },
  // Math styles - inline
  '.cm-math-inline': {
    padding: '0 2px',
  },
  '.cm-math-inline .katex': {
    fontSize: '1.1em',
  },
  // Math styles - display (block)
  '.cm-math-display': {
    display: 'block',
    textAlign: 'center',
    margin: '0.5em 0',
    padding: '0.5em',
  },
  '.cm-math-display .katex': {
    fontSize: '1.2em',
  },
  // Math error state
  '.cm-math-error': {
    color: 'var(--nexus-error, #ef4444)',
    fontFamily: 'monospace',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: '2px 4px',
    borderRadius: '2px',
  },
})

interface CodeMirrorEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

/**
 * CodeMirrorEditor - Obsidian-style Live Preview Editor
 *
 * Uses CodeMirror 6 with a custom plugin that:
 * - Hides markdown syntax when cursor is on a different line
 * - Reveals syntax when cursor is on the same line (for editing)
 * - Provides true WYSIWYG-like experience with source access
 */
export function CodeMirrorEditor({
  content,
  onChange,
  placeholder,
  className,
}: CodeMirrorEditorProps) {
  const editorRef = useRef<ReactCodeMirrorRef>(null)
  const isInternalChange = useRef(false)

  // Memoize extensions to prevent recreation on every render
  const extensions = useMemo(() => [
    markdown({
      codeLanguages: languages,
      extensions: [Strikethrough]  // Enable GFM strikethrough (~~text~~)
    }),
    richMarkdownPlugin,
    editorTheme,
    EditorView.lineWrapping,
    placeholder ? EditorView.contentAttributes.of({ 'aria-placeholder': placeholder }) : [],
  ], [placeholder])

  const handleChange = useCallback((value: string) => {
    isInternalChange.current = true
    onChange(value)
    // Reset flag after a brief delay
    setTimeout(() => {
      isInternalChange.current = false
    }, 50)
  }, [onChange])

  // Sync external content changes
  useEffect(() => {
    if (editorRef.current?.view && !isInternalChange.current) {
      const currentContent = editorRef.current.view.state.doc.toString()
      if (content !== currentContent) {
        editorRef.current.view.dispatch({
          changes: {
            from: 0,
            to: currentContent.length,
            insert: content,
          },
        })
      }
    }
  }, [content])

  return (
    <div className={`codemirror-editor-wrapper ${className || ''}`}>
      <CodeMirror
        ref={editorRef}
        value={content}
        onChange={handleChange}
        extensions={extensions}
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
          highlightActiveLine: false,
          highlightSelectionMatches: false,
          autocompletion: false,
        }}
      />
    </div>
  )
}

export default CodeMirrorEditor
