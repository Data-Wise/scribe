import { useCallback, useRef, useEffect } from 'react'
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { Strikethrough } from '@lezer/markdown'
import { EditorView, Decoration, ViewPlugin, ViewUpdate, WidgetType } from '@codemirror/view'
import { syntaxTree } from '@codemirror/language'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import type { DecorationSet } from '@codemirror/view'
import { StateField, StateEffect, RangeSet } from '@codemirror/state'
import type { Range, EditorState } from '@codemirror/state'
import katex from 'katex'
import 'katex/dist/katex.min.css'

/**
 * Custom syntax highlighting that includes strikethrough
 * This ensures formatting styles are maintained even when syntax is visible
 */
const markdownHighlighting = HighlightStyle.define([
  // Strikethrough - the key addition
  { tag: tags.strikethrough, class: 'cm-strikethrough' },
  // Strong/bold
  { tag: tags.strong, class: 'cm-strong' },
  // Emphasis/italic
  { tag: tags.emphasis, class: 'cm-emphasis' },
  // Headings
  { tag: tags.heading1, class: 'cm-heading cm-heading1' },
  { tag: tags.heading2, class: 'cm-heading cm-heading2' },
  { tag: tags.heading3, class: 'cm-heading cm-heading3' },
  { tag: tags.heading4, class: 'cm-heading cm-heading4' },
  { tag: tags.heading5, class: 'cm-heading cm-heading5' },
  { tag: tags.heading6, class: 'cm-heading cm-heading6' },
  // Code
  { tag: tags.monospace, class: 'cm-monospace' },
  // Links
  { tag: tags.link, class: 'cm-link' },
  { tag: tags.url, class: 'cm-url' },
  // Quote
  { tag: tags.quote, class: 'cm-quote' },
  // Meta (markdown syntax characters when visible)
  { tag: tags.processingInstruction, class: 'cm-meta' },
])

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

/**
 * Callout header widget that renders icon + title
 * Replaces > [!type] Title syntax with a styled header
 */
class CalloutHeaderWidget extends WidgetType {
  constructor(readonly type: string, readonly title: string) {
    super()
  }

  eq(other: CalloutHeaderWidget) {
    return other.type === this.type && other.title === this.title
  }

  toDOM() {
    const container = document.createElement('div')
    container.className = 'cm-callout-header'

    // Icon + Title
    const header = document.createElement('div')
    header.className = 'cm-callout-header-content'

    const icon = document.createElement('span')
    icon.className = 'cm-callout-icon'
    icon.textContent = this.getIcon(this.type)

    const titleSpan = document.createElement('span')
    titleSpan.className = `cm-callout-title cm-callout-title-${this.type}`
    titleSpan.textContent = this.title

    header.appendChild(icon)
    header.appendChild(titleSpan)
    container.appendChild(header)

    return container
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      note: '📝',
      info: 'ℹ️',
      tip: '💡',
      hint: '💡',
      important: '💡',
      success: '✅',
      check: '✅',
      done: '✅',
      warning: '⚠️',
      caution: '⚠️',
      attention: '⚠️',
      danger: '🔴',
      error: '🔴',
      bug: '🐛',
      question: '❓',
      help: '❓',
      faq: '❓',
      example: '📋',
      quote: '💬',
      cite: '💬',
      abstract: '📄',
      summary: '📄',
      tldr: '📄',
    }
    return icons[type.toLowerCase()] || '📝'
  }

  ignoreEvent() { return false }
}

const hiddenWidget = new HiddenWidget()
const bulletWidget = new BulletWidget()

/**
 * StateField for multi-line display math ($$...$$) blocks
 * Must use StateField (not ViewPlugin) because block widgets affect vertical layout
 */
const displayMathField = StateField.define<DecorationSet>({
  create(state: EditorState): DecorationSet {
    return buildDisplayMathDecorations(state)
  },
  update(decorations: DecorationSet, tr): DecorationSet {
    if (tr.docChanged || tr.selection) {
      return buildDisplayMathDecorations(tr.state)
    }
    return decorations.map(tr.changes)
  },
  provide: f => EditorView.decorations.from(f)
})

function buildDisplayMathDecorations(state: EditorState): DecorationSet {
  const widgets: Range<Decoration>[] = []
  const doc = state.doc
  const cursor = state.selection.main
  const text = doc.toString()

  // Find all display math blocks ($$...$$) including multi-line
  const displayMathRegex = /\$\$(.+?)\$\$/gs
  let match: RegExpExecArray | null

  while ((match = displayMathRegex.exec(text)) !== null) {
    const from = match.index
    const to = from + match[0].length
    const formula = match[1].trim()

    // Check if cursor is within this block
    const startLine = doc.lineAt(from).number
    const endLine = doc.lineAt(to).number
    const cursorLine = doc.lineAt(cursor.head).number

    // Skip if cursor is inside this block
    if (cursorLine >= startLine && cursorLine <= endLine) {
      continue
    }

    // Create a block widget BEFORE the block
    widgets.push(
      Decoration.widget({
        widget: new MathWidget(formula, true), // displayMode = true
        block: true,
        side: -1 // Position before the block
      }).range(from)
    )

    // Hide each line's content individually (doesn't cross line breaks, so it's allowed)
    for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
      const line = doc.line(lineNum)
      // Replace the entire line content with nothing
      if (line.from < line.to) {
        widgets.push(
          Decoration.replace({}).range(line.from, line.to)
        )
      }
    }
  }

  // Sort by position before creating RangeSet
  widgets.sort((a, b) => a.from - b.from)
  return RangeSet.of(widgets)
}

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

          // Handle blockquotes - hide QuoteMark (>) and add line styling
          if (node.name === 'QuoteMark') {
            const cursorLine = doc.lineAt(cursor.head).number
            const nodeLine = doc.lineAt(node.from).number
            if (cursorLine !== nodeLine) {
              // Hide the > marker and trailing space
              const line = doc.lineAt(node.from)
              const endPos = Math.min(node.to + 1, line.to)
              widgets.push(
                Decoration.replace({ widget: hiddenWidget }).range(node.from, endPos)
              )
            }
          }

          // Add line decoration for blockquote lines with callout type detection
          if (node.name === 'Blockquote') {
            const startLine = doc.lineAt(node.from).number
            const endLine = doc.lineAt(node.to).number

            // Check first line for callout pattern [!type] Optional Title
            const firstLine = doc.line(startLine)
            const firstLineText = firstLine.text
            const calloutMatch = firstLineText.match(/>\s*\[!(\w+)\](?:\s+(.*))?/)
            const calloutType = calloutMatch ? calloutMatch[1].toLowerCase() : null
            const calloutTitle = calloutMatch ? (calloutMatch[2] || calloutMatch[1].charAt(0).toUpperCase() + calloutMatch[1].slice(1)) : null

            // Determine the CSS class based on callout type
            let lineClass = 'cm-blockquote-line'
            if (calloutType) {
              lineClass = `cm-callout-line cm-callout-${calloutType}`
            }

            for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
              const line = doc.line(lineNum)
              widgets.push(
                Decoration.line({ class: lineClass }).range(line.from)
              )
            }

            // For callouts, replace the first line's [!type] Title with a widget
            if (calloutType && calloutTitle) {
              const cursorLine = doc.lineAt(cursor.head).number
              // Only show widget if cursor is NOT on the first line
              if (cursorLine !== startLine) {
                // Find the range of "> [!type] Title" on the first line
                const match = firstLineText.match(/(>\s*\[!\w+\](?:\s+.*)?)/)
                if (match) {
                  const matchStart = firstLine.from + (match.index || 0)
                  const matchEnd = matchStart + match[0].length
                  widgets.push(
                    Decoration.replace({
                      widget: new CalloutHeaderWidget(calloutType, calloutTitle)
                    }).range(matchStart, matchEnd)
                  )
                }
              }
            }
          }
        }
      })

      // Process inline math ($...$) using regex
      // Note: Display math ($$...$$) is handled by displayMathField StateField
      const text = doc.sliceString(from, to)

      // Process inline math ($...$)
      // Negative lookbehind/ahead to avoid matching $$
      const inlineMathRegex = /(?<!\$)\$([^$\n]+)\$(?!\$)/g
      let match
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

      // Callout styling is handled via CSS on blockquote lines
      // The blockquote iteration already excludes callout lines from cm-blockquote-line
      // Callout-specific colors are applied via the cm-quote syntax highlighting class
    }

    // Sort decorations by position (required for Decoration.set)
    widgets.sort((a, b) => a.from - b.from)

    return Decoration.set(widgets)
  }
}

const richMarkdownPlugin = ViewPlugin.fromClass(RichMarkdownPlugin, {
  decorations: v => v.decorations
})

/**
 * Get runtime theme colors from CSS variables
 * This function reads the ACTUAL computed values at runtime
 */
function getThemeColors() {
  const root = document.documentElement
  const styles = getComputedStyle(root)

  return {
    bgPrimary: styles.getPropertyValue('--nexus-bg-primary').trim() || '#0d1210',
    bgSecondary: styles.getPropertyValue('--nexus-bg-secondary').trim() || '#141e1a',
    bgTertiary: styles.getPropertyValue('--nexus-bg-tertiary').trim() || '#1c2922',
    textPrimary: styles.getPropertyValue('--nexus-text-primary').trim() || '#d4e4dc',
    textSecondary: styles.getPropertyValue('--nexus-text-secondary').trim() || '#94a3b8',
    textMuted: styles.getPropertyValue('--nexus-text-muted').trim() || '#8fa89b',
    accent: styles.getPropertyValue('--nexus-accent').trim() || '#4ade80',
    error: styles.getPropertyValue('--nexus-error').trim() || '#ef4444',
  }
}

/**
 * Create custom theme for the rich markdown editor
 * Reads actual theme colors at runtime (called inside component)
 */
function createEditorTheme() {
  const colors = getThemeColors()

  return EditorView.theme({
  '&': {
    backgroundColor: colors.bgPrimary,
    color: colors.textPrimary,
    fontSize: 'var(--editor-font-size, 16px)',
    fontFamily: 'var(--editor-font-family, system-ui)',
  },
  '.cm-content': {
    caretColor: colors.textPrimary,
    color: colors.textPrimary,
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
    color: colors.accent,
    marginRight: '0.5em',
    fontSize: '1.2em',
  },
  // Heading styles - match Reading mode
  '.cm-heading': {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  '.cm-heading1': {
    fontSize: '2em',
    fontWeight: '700',
    lineHeight: '1.4',
  },
  '.cm-heading2': {
    fontSize: '1.5em',
    lineHeight: '1.4',
  },
  '.cm-heading3': {
    fontSize: '1.25em',
    lineHeight: '1.4',
  },
  '.cm-heading4, .cm-heading5, .cm-heading6': {
    fontSize: '1.1em',
  },
  // Emphasis styles - ALWAYS applied regardless of cursor position
  '.cm-emphasis': {
    fontStyle: 'italic',
  },
  '.cm-strong': {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  // Strikethrough styles - ALWAYS applied regardless of cursor position
  '.cm-strikethrough': {
    textDecoration: 'line-through',
    color: colors.textMuted,
  },
  // Code styles - match Reading mode
  '.cm-monospace': {
    fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
    backgroundColor: colors.bgTertiary,
    padding: '0.2em 0.4em',
    borderRadius: '4px',
    fontSize: '0.9em',
  },
  // Link styles
  '.cm-link': {
    color: colors.accent,
    textDecoration: 'none',
  },
  '.cm-link:hover': {
    textDecoration: 'underline',
  },
  '.cm-url': {
    color: colors.accent,
    opacity: '0.6',
    fontSize: '0.9em',
  },
  // Meta (like ### marks when visible)
  '.cm-meta': {
    color: colors.textMuted,
    fontWeight: '400',
  },
  // Quote styles (inline text styling from syntax highlighting)
  '.cm-quote': {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  // Blockquote line decoration (applies to entire line)
  '.cm-blockquote-line': {
    borderLeft: `3px solid ${colors.accent}`,
    paddingLeft: '1em',
    backgroundColor: colors.bgSecondary,
    marginLeft: '0',
  },
  // Callout line decorations (per-type colors)
  '.cm-callout-line': {
    paddingLeft: '1em',
  },
  '.cm-callout-note, .cm-callout-info': {
    borderLeft: '4px solid #3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  '.cm-callout-tip, .cm-callout-hint, .cm-callout-important': {
    borderLeft: '4px solid #10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  '.cm-callout-success, .cm-callout-check, .cm-callout-done': {
    borderLeft: '4px solid #10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  '.cm-callout-warning, .cm-callout-caution, .cm-callout-attention': {
    borderLeft: '4px solid #F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  '.cm-callout-danger, .cm-callout-error': {
    borderLeft: '4px solid #EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  '.cm-callout-bug': {
    borderLeft: '4px solid #EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  '.cm-callout-question, .cm-callout-help, .cm-callout-faq': {
    borderLeft: '4px solid #8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  '.cm-callout-example': {
    borderLeft: '4px solid #6B7280',
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
  },
  '.cm-callout-quote, .cm-callout-cite': {
    borderLeft: '4px solid #6B7280',
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
  },
  '.cm-callout-abstract, .cm-callout-summary, .cm-callout-tldr': {
    borderLeft: '4px solid #06B6D4',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
  },
  // Callout header widget styles
  '.cm-callout-header': {
    display: 'inline-block',
    marginBottom: '0.5em',
  },
  '.cm-callout-header-content': {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  '.cm-callout-icon': {
    fontSize: '1.25rem',
    lineHeight: '1',
    flexShrink: '0',
  },
  '.cm-callout-title': {
    textTransform: 'capitalize',
  },
  '.cm-callout-title-note, .cm-callout-title-info': {
    color: '#3B82F6',
  },
  '.cm-callout-title-tip, .cm-callout-title-hint, .cm-callout-title-important': {
    color: '#10B981',
  },
  '.cm-callout-title-success, .cm-callout-title-check, .cm-callout-title-done': {
    color: '#10B981',
  },
  '.cm-callout-title-warning, .cm-callout-title-caution, .cm-callout-title-attention': {
    color: '#F59E0B',
  },
  '.cm-callout-title-danger, .cm-callout-title-error': {
    color: '#EF4444',
  },
  '.cm-callout-title-bug': {
    color: '#EF4444',
  },
  '.cm-callout-title-question, .cm-callout-title-help, .cm-callout-title-faq': {
    color: '#8B5CF6',
  },
  '.cm-callout-title-example': {
    color: '#6B7280',
  },
  '.cm-callout-title-quote, .cm-callout-title-cite': {
    color: '#6B7280',
  },
  '.cm-callout-title-abstract, .cm-callout-title-summary, .cm-callout-title-tldr': {
    color: '#06B6D4',
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
    color: colors.error,
    fontFamily: 'monospace',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: '2px 4px',
    borderRadius: '2px',
  },
  })
}

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

  // Create theme fresh - @uiw/react-codemirror uses the theme prop for styling
  const editorTheme = createEditorTheme()

  // Extensions for markdown features (not theme)
  const extensions = [
    markdown({
      codeLanguages: languages,
      extensions: [Strikethrough]  // Enable GFM strikethrough (~~text~~)
    }),
    syntaxHighlighting(markdownHighlighting),  // Apply formatting styles (bold, italic, strikethrough)
    displayMathField,  // StateField for multi-line display math blocks
    richMarkdownPlugin,
    EditorView.lineWrapping,
    placeholder ? EditorView.contentAttributes.of({ 'aria-placeholder': placeholder }) : [],
  ]

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
        theme={editorTheme}
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
