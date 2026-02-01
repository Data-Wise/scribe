import { useCallback, useRef, useEffect, useState, useMemo } from 'react'
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { Strikethrough } from '@lezer/markdown'
import { EditorView, Decoration, ViewPlugin, ViewUpdate, WidgetType } from '@codemirror/view'
import { syntaxTree } from '@codemirror/language'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags, styleTags, Tag } from '@lezer/highlight'
import type { DecorationSet } from '@codemirror/view'
import { StateField, RangeSet } from '@codemirror/state'
import type { Range, EditorState } from '@codemirror/state'
import { autocompletion, CompletionContext } from '@codemirror/autocomplete'
import type { Completion } from '@codemirror/autocomplete'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { yamlCompletions, chunkOptionCompletions, crossRefCompletions, codeChunkCompletions } from '../lib/quarto-completions'

/**
 * Define custom tags for markdown syntax markers
 * This allows us to style each marker type (# ** ` etc.) independently
 */
const customMarkdownTags = {
  headerMark: Tag.define(),       // For # ## ### etc.
  emphasisMark: Tag.define(),     // For ** __ * _
  codeMark: Tag.define(),         // For `
  quoteMark: Tag.define(),        // For >
  listMark: Tag.define(),         // For - * +
  linkMark: Tag.define(),         // For [] ()
}

/**
 * Markdown extension that overrides default syntax marker highlighting
 * Maps marker node types to our custom tags for independent styling
 */
const markdownSyntaxTags = {
  props: [
    styleTags({
      "HeaderMark": customMarkdownTags.headerMark,       // # markers
      "EmphasisMark": customMarkdownTags.emphasisMark,   // ** __ * _ markers
      "CodeMark": customMarkdownTags.codeMark,           // ` markers
      "QuoteMark": customMarkdownTags.quoteMark,         // > markers
      "ListMark": customMarkdownTags.listMark,           // - * + markers
      "LinkMark": customMarkdownTags.linkMark,           // [] () markers
    }),
  ],
}

/**
 * Custom syntax highlighting for markdown
 * Styles both content (bold text, italic text) AND syntax markers (#, **, etc.)
 */
const markdownHighlighting = HighlightStyle.define([
  // === Content styling (formatted text) ===
  { tag: tags.strikethrough, class: 'cm-strikethrough' },
  { tag: tags.strong, class: 'cm-strong' },
  { tag: tags.emphasis, class: 'cm-emphasis' },
  { tag: tags.heading1, class: 'cm-heading cm-heading1' },
  { tag: tags.heading2, class: 'cm-heading cm-heading2' },
  { tag: tags.heading3, class: 'cm-heading cm-heading3' },
  { tag: tags.heading4, class: 'cm-heading cm-heading4' },
  { tag: tags.heading5, class: 'cm-heading cm-heading5' },
  { tag: tags.heading6, class: 'cm-heading cm-heading6' },
  { tag: tags.monospace, class: 'cm-monospace' },
  { tag: tags.link, class: 'cm-link' },
  { tag: tags.url, class: 'cm-url' },
  { tag: tags.quote, class: 'cm-quote' },
  { tag: tags.list, class: 'cm-list' },

  // === Syntax markers (# ** ` > - etc.) using CUSTOM tags ===
  { tag: customMarkdownTags.headerMark, class: 'cm-heading-marker' },
  { tag: customMarkdownTags.emphasisMark, class: 'cm-emphasis-marker' },
  { tag: customMarkdownTags.codeMark, class: 'cm-code-marker' },
  { tag: customMarkdownTags.quoteMark, class: 'cm-quote-marker' },
  { tag: customMarkdownTags.listMark, class: 'cm-list-marker' },
  { tag: customMarkdownTags.linkMark, class: 'cm-link-marker' },
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
    const container = document.createElement('span')
    container.className = this.displayMode ? 'cm-math-display' : 'cm-math-inline'
    container.style.position = 'relative'
    container.style.cursor = 'pointer'

    // Render LaTeX
    const renderSpan = document.createElement('span')
    try {
      // Enable throwOnError to catch actual error messages
      katex.render(this.formula, renderSpan, {
        displayMode: this.displayMode,
        throwOnError: true,
        output: 'html'
      })

      // Create hover preview tooltip showing LaTeX source
      const tooltip = document.createElement('span')
      tooltip.className = 'cm-math-preview-tooltip'
      tooltip.textContent = this.displayMode ? `$$${this.formula}$$` : `$${this.formula}$`

      container.appendChild(renderSpan)
      container.appendChild(tooltip)

      // Note: Clicking on the rendered math will reveal the source inline
      // via Live Preview mode - no modal needed

      return container
    } catch (error) {
      // On error, create error widget with helpful message
      return new LaTeXErrorWidget(this.formula, this.displayMode, error as Error).toDOM()
    }
  }

  ignoreEvent() { return false }
}

/**
 * Error widget for LaTeX rendering errors
 * Shows formula with error indicator and tooltip with error message
 */
class LaTeXErrorWidget extends WidgetType {
  constructor(
    readonly formula: string,
    readonly displayMode: boolean,
    readonly error: Error
  ) {
    super()
  }

  eq(other: LaTeXErrorWidget) {
    return (
      other.formula === this.formula &&
      other.displayMode === this.displayMode &&
      other.error.message === this.error.message
    )
  }

  toDOM() {
    const container = document.createElement('span')
    container.className = this.displayMode
      ? 'cm-math-error cm-math-error-display'
      : 'cm-math-error cm-math-error-inline'

    // Error icon
    const icon = document.createElement('span')
    icon.className = 'cm-math-error-icon'
    icon.textContent = '⚠️'
    icon.setAttribute('aria-label', 'LaTeX Error')

    // Formula text with error styling
    const formulaSpan = document.createElement('span')
    formulaSpan.className = 'cm-math-error-formula'
    formulaSpan.textContent = this.displayMode
      ? `$$${this.formula}$$`
      : `$${this.formula}$`

    // Error message tooltip
    const tooltip = document.createElement('span')
    tooltip.className = 'cm-math-error-tooltip'
    tooltip.textContent = this.getSimplifiedError()

    // Assemble container
    container.appendChild(icon)
    container.appendChild(formulaSpan)
    container.appendChild(tooltip)

    // Log error details to console for debugging
    console.error('LaTeX Error:', {
      formula: this.formula,
      error: this.error.message,
      fullError: this.error
    })

    // Note: Clicking on error widget will reveal source inline
    // via Live Preview mode - no modal needed

    return container
  }

  /**
   * Simplify KaTeX error messages for tooltip display
   */
  private getSimplifiedError(): string {
    const msg = this.error.message

    // Common error patterns with friendly messages
    if (msg.includes('Undefined control sequence')) {
      const match = msg.match(/\\([a-zA-Z]+)/)
      return match ? `Unknown command: \\${match[1]}` : 'Unknown LaTeX command'
    }
    if ((msg.includes('Expected') && msg.includes('got')) || msg.includes('Expected group')) {
      return 'Syntax error: mismatched braces or delimiters'
    }
    if (msg.includes('missing')) {
      return 'Missing delimiter or brace'
    }
    if (msg.includes('Double subscript') || msg.includes('Double superscript')) {
      return 'Double subscript or superscript'
    }

    // Default: show first 80 characters of error
    return msg.length > 80 ? msg.substring(0, 77) + '...' : msg
  }

  ignoreEvent() {
    return false
  }
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

/**
 * WikiLink widget that renders [[Page Name]] or [[Page Name|Display Text]]
 * Hides brackets and shows only the display text in live-preview mode
 * Handles clicks for navigation: single click selects, double click navigates
 */
class WikiLinkWidget extends WidgetType {
  constructor(
    readonly displayText: string,
    readonly pageName: string,
    readonly onClick?: (pageName: string, isDoubleClick: boolean) => void
  ) {
    super()
  }

  eq(other: WikiLinkWidget) {
    return other.displayText === this.displayText && other.pageName === this.pageName
  }

  toDOM() {
    const span = document.createElement('span')
    span.className = 'cm-wikilink'
    span.textContent = this.displayText
    span.style.cursor = 'pointer'
    span.setAttribute('data-wikilink', this.pageName)
    span.setAttribute('role', 'link')
    span.setAttribute('tabindex', '0')

    // Handle single-click for navigation
    span.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.onClick?.(this.pageName, false) // Navigate on single-click
    })

    // Handle double-click for navigation (redundant but kept for compatibility)
    span.addEventListener('dblclick', (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.onClick?.(this.pageName, true)
    })

    // Handle Enter key for accessibility
    span.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        this.onClick?.(this.pageName, true)
      }
    })

    return span
  }

  ignoreEvent() {
    // Return true to prevent CodeMirror from processing clicks (which would position cursor)
    // Our addEventListener handlers still fire because they're attached to the DOM element directly
    return true
  }
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

    // Replace the entire $$...$$ block with the rendered widget
    // This eliminates extra spacing by removing all the source lines
    widgets.push(
      Decoration.replace({
        widget: new MathWidget(formula, true), // displayMode = true
        block: true
      }).range(from, to)
    )
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
  onWikiLinkClick?: (pageName: string) => void

  constructor(view: EditorView, onWikiLinkClick?: (pageName: string) => void) {
    this.onWikiLinkClick = onWikiLinkClick
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

      // Process inline math ($...$) and wikilinks using regex
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

      // Process wikilinks [[Page Name]] or [[Page Name|Display Text]]
      // Hide brackets in live-preview mode, show only the display text
      const wikilinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
      while ((match = wikilinkRegex.exec(text)) !== null) {
        const matchFrom = from + match.index
        const matchTo = matchFrom + match[0].length
        const pageName = match[1]
        const displayText = match[2] || pageName

        // Skip if cursor is inside this wikilink
        if (cursor.from >= matchFrom && cursor.to <= matchTo) continue

        // Replace entire wikilink with just the display text
        // Pass onClick callback to enable navigation
        widgets.push(
          Decoration.replace({
            widget: new WikiLinkWidget(displayText, pageName, (name, _isDoubleClick) => {
              // Navigate on both single-click and double-click
              this.onWikiLinkClick?.(name)
            })
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

/**
 * Factory function to create RichMarkdownPlugin with WikiLink click callback
 */
function createRichMarkdownPlugin(onWikiLinkClick?: (pageName: string) => void) {
  return ViewPlugin.fromClass(
    class extends RichMarkdownPlugin {
      constructor(view: EditorView) {
        super(view, onWikiLinkClick)
      }
    },
    {
      decorations: v => v.decorations
    }
  )
}

/**
 * LaTeX Command Autocompletion
 *
 * Provides autocompletion for LaTeX commands when typing backslash (\)
 * Includes common commands organized by category:
 * - Greek letters (alpha, beta, gamma, etc.)
 * - Math operators (frac, int, sum, sqrt, etc.)
 * - Symbols (infty, partial, nabla, etc.)
 * - Relations (leq, geq, neq, approx, etc.)
 * - Arrows (to, rightarrow, leftarrow, etc.)
 * - Font styles (mathbb, mathcal, mathbf, etc.)
 * - Environments (begin, end, aligned, matrix, etc.)
 */

// LaTeX command definitions with labels and descriptions
const latexCommands: Completion[] = [
  // Greek letters (lowercase)
  { label: '\\alpha', detail: 'α - Greek letter alpha', type: 'keyword' },
  { label: '\\beta', detail: 'β - Greek letter beta', type: 'keyword' },
  { label: '\\gamma', detail: 'γ - Greek letter gamma', type: 'keyword' },
  { label: '\\delta', detail: 'δ - Greek letter delta', type: 'keyword' },
  { label: '\\epsilon', detail: 'ε - Greek letter epsilon', type: 'keyword' },
  { label: '\\zeta', detail: 'ζ - Greek letter zeta', type: 'keyword' },
  { label: '\\eta', detail: 'η - Greek letter eta', type: 'keyword' },
  { label: '\\theta', detail: 'θ - Greek letter theta', type: 'keyword' },
  { label: '\\iota', detail: 'ι - Greek letter iota', type: 'keyword' },
  { label: '\\kappa', detail: 'κ - Greek letter kappa', type: 'keyword' },
  { label: '\\lambda', detail: 'λ - Greek letter lambda', type: 'keyword' },
  { label: '\\mu', detail: 'μ - Greek letter mu', type: 'keyword' },
  { label: '\\nu', detail: 'ν - Greek letter nu', type: 'keyword' },
  { label: '\\xi', detail: 'ξ - Greek letter xi', type: 'keyword' },
  { label: '\\pi', detail: 'π - Greek letter pi', type: 'keyword' },
  { label: '\\rho', detail: 'ρ - Greek letter rho', type: 'keyword' },
  { label: '\\sigma', detail: 'σ - Greek letter sigma', type: 'keyword' },
  { label: '\\tau', detail: 'τ - Greek letter tau', type: 'keyword' },
  { label: '\\upsilon', detail: 'υ - Greek letter upsilon', type: 'keyword' },
  { label: '\\phi', detail: 'φ - Greek letter phi', type: 'keyword' },
  { label: '\\chi', detail: 'χ - Greek letter chi', type: 'keyword' },
  { label: '\\psi', detail: 'ψ - Greek letter psi', type: 'keyword' },
  { label: '\\omega', detail: 'ω - Greek letter omega', type: 'keyword' },

  // Greek letters (uppercase)
  { label: '\\Gamma', detail: 'Γ - Greek letter Gamma', type: 'keyword' },
  { label: '\\Delta', detail: 'Δ - Greek letter Delta', type: 'keyword' },
  { label: '\\Theta', detail: 'Θ - Greek letter Theta', type: 'keyword' },
  { label: '\\Lambda', detail: 'Λ - Greek letter Lambda', type: 'keyword' },
  { label: '\\Xi', detail: 'Ξ - Greek letter Xi', type: 'keyword' },
  { label: '\\Pi', detail: 'Π - Greek letter Pi', type: 'keyword' },
  { label: '\\Sigma', detail: 'Σ - Greek letter Sigma', type: 'keyword' },
  { label: '\\Upsilon', detail: 'Υ - Greek letter Upsilon', type: 'keyword' },
  { label: '\\Phi', detail: 'Φ - Greek letter Phi', type: 'keyword' },
  { label: '\\Psi', detail: 'Ψ - Greek letter Psi', type: 'keyword' },
  { label: '\\Omega', detail: 'Ω - Greek letter Omega', type: 'keyword' },

  // Math operators
  { label: '\\frac', detail: 'Fraction: \\frac{numerator}{denominator}', type: 'function' },
  { label: '\\sqrt', detail: 'Square root: \\sqrt{x}', type: 'function' },
  { label: '\\int', detail: '∫ - Integral', type: 'function' },
  { label: '\\sum', detail: '∑ - Summation', type: 'function' },
  { label: '\\prod', detail: '∏ - Product', type: 'function' },
  { label: '\\lim', detail: 'Limit', type: 'function' },
  { label: '\\log', detail: 'Logarithm', type: 'function' },
  { label: '\\ln', detail: 'Natural logarithm', type: 'function' },
  { label: '\\sin', detail: 'Sine', type: 'function' },
  { label: '\\cos', detail: 'Cosine', type: 'function' },
  { label: '\\tan', detail: 'Tangent', type: 'function' },
  { label: '\\exp', detail: 'Exponential', type: 'function' },
  { label: '\\min', detail: 'Minimum', type: 'function' },
  { label: '\\max', detail: 'Maximum', type: 'function' },

  // Symbols
  { label: '\\infty', detail: '∞ - Infinity', type: 'constant' },
  { label: '\\partial', detail: '∂ - Partial derivative', type: 'constant' },
  { label: '\\nabla', detail: '∇ - Nabla/Del operator', type: 'constant' },
  { label: '\\forall', detail: '∀ - For all', type: 'constant' },
  { label: '\\exists', detail: '∃ - There exists', type: 'constant' },
  { label: '\\emptyset', detail: '∅ - Empty set', type: 'constant' },
  { label: '\\in', detail: '∈ - Element of', type: 'constant' },
  { label: '\\notin', detail: '∉ - Not an element of', type: 'constant' },
  { label: '\\subset', detail: '⊂ - Subset', type: 'constant' },
  { label: '\\supset', detail: '⊃ - Superset', type: 'constant' },
  { label: '\\cup', detail: '∪ - Union', type: 'constant' },
  { label: '\\cap', detail: '∩ - Intersection', type: 'constant' },
  { label: '\\pm', detail: '± - Plus-minus', type: 'constant' },
  { label: '\\times', detail: '× - Multiplication', type: 'constant' },
  { label: '\\cdot', detail: '· - Centered dot', type: 'constant' },
  { label: '\\div', detail: '÷ - Division', type: 'constant' },

  // Relations
  { label: '\\leq', detail: '≤ - Less than or equal', type: 'constant' },
  { label: '\\geq', detail: '≥ - Greater than or equal', type: 'constant' },
  { label: '\\neq', detail: '≠ - Not equal', type: 'constant' },
  { label: '\\approx', detail: '≈ - Approximately equal', type: 'constant' },
  { label: '\\equiv', detail: '≡ - Equivalent', type: 'constant' },
  { label: '\\sim', detail: '∼ - Similar to', type: 'constant' },
  { label: '\\propto', detail: '∝ - Proportional to', type: 'constant' },

  // Arrows
  { label: '\\to', detail: '→ - Right arrow', type: 'constant' },
  { label: '\\rightarrow', detail: '→ - Right arrow', type: 'constant' },
  { label: '\\leftarrow', detail: '← - Left arrow', type: 'constant' },
  { label: '\\leftrightarrow', detail: '↔ - Left-right arrow', type: 'constant' },
  { label: '\\Rightarrow', detail: '⇒ - Double right arrow (implies)', type: 'constant' },
  { label: '\\Leftarrow', detail: '⇐ - Double left arrow', type: 'constant' },
  { label: '\\Leftrightarrow', detail: '⇔ - Double left-right arrow (iff)', type: 'constant' },

  // Font styles
  { label: '\\mathbb', detail: 'Blackboard bold: \\mathbb{R}', type: 'function' },
  { label: '\\mathcal', detail: 'Calligraphic: \\mathcal{L}', type: 'function' },
  { label: '\\mathbf', detail: 'Bold: \\mathbf{x}', type: 'function' },
  { label: '\\mathit', detail: 'Italic: \\mathit{text}', type: 'function' },
  { label: '\\mathrm', detail: 'Roman: \\mathrm{d}', type: 'function' },
  { label: '\\mathsf', detail: 'Sans-serif: \\mathsf{text}', type: 'function' },
  { label: '\\mathtt', detail: 'Typewriter: \\mathtt{code}', type: 'function' },

  // Environments
  { label: '\\begin', detail: 'Begin environment: \\begin{aligned}', type: 'keyword' },
  { label: '\\end', detail: 'End environment: \\end{aligned}', type: 'keyword' },
  { label: '\\aligned', detail: 'Aligned equations environment', type: 'keyword' },
  { label: '\\matrix', detail: 'Matrix environment', type: 'keyword' },
  { label: '\\pmatrix', detail: 'Matrix with parentheses', type: 'keyword' },
  { label: '\\bmatrix', detail: 'Matrix with brackets', type: 'keyword' },
  { label: '\\cases', detail: 'Piecewise functions', type: 'keyword' },

  // Accents
  { label: '\\hat', detail: 'Hat accent: \\hat{x}', type: 'function' },
  { label: '\\bar', detail: 'Bar accent: \\bar{x}', type: 'function' },
  { label: '\\tilde', detail: 'Tilde accent: \\tilde{x}', type: 'function' },
  { label: '\\vec', detail: 'Vector arrow: \\vec{v}', type: 'function' },
  { label: '\\dot', detail: 'Dot accent: \\dot{x}', type: 'function' },
  { label: '\\ddot', detail: 'Double dot accent: \\ddot{x}', type: 'function' },
]

/**
 * Check if cursor is in a math context ($..$ or $$..$) 
 */
function isInMathContext(context: CompletionContext): boolean {
  const pos = context.pos
  const doc = context.state.doc
  const text = doc.toString()
  
  // Look backwards for opening $ or $$
  let inMath = false
  let i = pos - 1
  while (i >= 0) {
    if (text[i] === '$') {
      // Check for $$ (display math)
      if (i > 0 && text[i - 1] === '$') {
        inMath = !inMath
        i -= 2
      } else {
        // Single $ (inline math)
        inMath = !inMath
        i--
      }
    } else {
      i--
    }
  }
  return inMath
}

/**
 * Check if cursor is in a Quarto code block (```{r}, etc)
 */
function isInQuartoCodeBlock(context: CompletionContext): boolean {
  const doc = context.state.doc
  const pos = context.pos
  
  // Scan backwards for opening fence
  let searchPos = pos
  while (searchPos > 0) {
    const line = doc.lineAt(searchPos)
    const trimmed = line.text.trimStart()
    if (trimmed.startsWith('```')) {
      // Is this an opening fence (has language specifier)?
      if (/^```\{?\w/.test(trimmed)) {
        return true  // Found opening fence, we're inside
      }
      // It's a closing fence, we're not in a block
      return false
    }
    searchPos = line.from - 1
  }
  return false
}

/**
 * LaTeX completion source
 * Triggers when user types backslash (\) in math mode or outside code blocks
 */
function latexCompletions(context: CompletionContext) {
  // Don't show LaTeX completions inside Quarto code blocks (R, Python, etc)
  if (isInQuartoCodeBlock(context)) return null
  
  const word = context.matchBefore(/\\[a-zA-Z]*/)
  if (!word || (word.from === word.to && !context.explicit)) {
    return null
  }

  return {
    from: word.from,
    options: latexCommands,
    validFor: /^\\[a-zA-Z]*$/
  }
}

/**
 * LaTeX Snippet Library
 *
 * Provides common LaTeX templates and snippets for quick insertion
 * Includes:
 * - Common fractions (1/2, 1/3, 2/3, etc.)
 * - Integrals with bounds (0 to 1, a to b, etc.)
 * - Sums with bounds (1 to n, n to infinity, etc.)
 * - Limits (x→0, x→∞, etc.)
 * - Derivatives (dy/dx, d²y/dx², etc.)
 * - Matrices (2x2, 3x3, identity, etc.)
 * - Common equations (quadratic formula, etc.)
 */

interface LatexSnippet {
  trigger: string
  template: string
  detail: string
  category: string
}

const latexSnippets: LatexSnippet[] = [
  // Common fractions
  { trigger: 'frac12', template: '\\frac{1}{2}', detail: 'One half (1/2)', category: 'fraction' },
  { trigger: 'frac13', template: '\\frac{1}{3}', detail: 'One third (1/3)', category: 'fraction' },
  { trigger: 'frac23', template: '\\frac{2}{3}', detail: 'Two thirds (2/3)', category: 'fraction' },
  { trigger: 'frac14', template: '\\frac{1}{4}', detail: 'One quarter (1/4)', category: 'fraction' },
  { trigger: 'frac34', template: '\\frac{3}{4}', detail: 'Three quarters (3/4)', category: 'fraction' },

  // Integrals with bounds
  { trigger: 'int01', template: '\\int_0^1 ', detail: 'Integral from 0 to 1', category: 'integral' },
  { trigger: 'intab', template: '\\int_a^b ', detail: 'Integral from a to b', category: 'integral' },
  { trigger: 'intinfty', template: '\\int_{-\\infty}^{\\infty} ', detail: 'Integral from -∞ to +∞', category: 'integral' },
  { trigger: 'oint', template: '\\oint ', detail: 'Contour integral', category: 'integral' },

  // Sums with bounds
  { trigger: 'sum1n', template: '\\sum_{i=1}^{n} ', detail: 'Sum from i=1 to n', category: 'sum' },
  { trigger: 'sum0n', template: '\\sum_{i=0}^{n} ', detail: 'Sum from i=0 to n', category: 'sum' },
  { trigger: 'suminfty', template: '\\sum_{n=1}^{\\infty} ', detail: 'Infinite sum from n=1 to ∞', category: 'sum' },

  // Limits
  { trigger: 'lim0', template: '\\lim_{x \\to 0} ', detail: 'Limit as x approaches 0', category: 'limit' },
  { trigger: 'liminfty', template: '\\lim_{x \\to \\infty} ', detail: 'Limit as x approaches ∞', category: 'limit' },
  { trigger: 'limn', template: '\\lim_{n \\to \\infty} ', detail: 'Limit as n approaches ∞', category: 'limit' },

  // Derivatives
  { trigger: 'dydx', template: '\\frac{dy}{dx}', detail: 'First derivative dy/dx', category: 'derivative' },
  { trigger: 'd2ydx2', template: '\\frac{d^2y}{dx^2}', detail: 'Second derivative d²y/dx²', category: 'derivative' },
  { trigger: 'dfdx', template: '\\frac{df}{dx}', detail: 'Derivative df/dx', category: 'derivative' },
  { trigger: 'partial', template: '\\frac{\\partial f}{\\partial x}', detail: 'Partial derivative ∂f/∂x', category: 'derivative' },

  // Matrices
  { trigger: 'mat22', template: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', detail: '2×2 matrix', category: 'matrix' },
  { trigger: 'mat33', template: '\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}', detail: '3×3 matrix', category: 'matrix' },
  { trigger: 'bmat22', template: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}', detail: '2×2 matrix with brackets', category: 'matrix' },
  { trigger: 'bmat33', template: '\\begin{bmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{bmatrix}', detail: '3×3 matrix with brackets', category: 'matrix' },
  { trigger: 'identity2', template: '\\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}', detail: '2×2 identity matrix', category: 'matrix' },
  { trigger: 'identity3', template: '\\begin{pmatrix} 1 & 0 & 0 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & 1 \\end{pmatrix}', detail: '3×3 identity matrix', category: 'matrix' },

  // Common equations
  { trigger: 'quadratic', template: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', detail: 'Quadratic formula', category: 'equation' },
  { trigger: 'pythagorean', template: 'a^2 + b^2 = c^2', detail: 'Pythagorean theorem', category: 'equation' },
  { trigger: 'euler', template: 'e^{i\\pi} + 1 = 0', detail: "Euler's identity", category: 'equation' },

  // Systems of equations
  { trigger: 'cases2', template: '\\begin{cases} x + y = 5 \\\\ 2x - y = 1 \\end{cases}', detail: 'System of 2 equations', category: 'system' },
  { trigger: 'cases3', template: '\\begin{cases} x + y + z = 6 \\\\ 2x - y + z = 3 \\\\ x + 2y - z = 2 \\end{cases}', detail: 'System of 3 equations', category: 'system' },

  // Aligned equations
  { trigger: 'align2', template: '\\begin{aligned} x + y &= 5 \\\\ 2x - y &= 1 \\end{aligned}', detail: 'Aligned equations (2 lines)', category: 'aligned' },
  { trigger: 'align3', template: '\\begin{aligned} x + y + z &= 6 \\\\ 2x - y + z &= 3 \\\\ x + 2y - z &= 2 \\end{aligned}', detail: 'Aligned equations (3 lines)', category: 'aligned' },

  // Greek letter combinations
  { trigger: 'alphabeta', template: '\\alpha + \\beta', detail: 'Alpha plus beta', category: 'combo' },
  { trigger: 'mupmsigma', template: '\\mu \\pm \\sigma', detail: 'Mu plus-minus sigma', category: 'combo' },

  // Common physics formulas
  { trigger: 'emc2', template: 'E = mc^2', detail: 'Mass-energy equivalence', category: 'physics' },
  { trigger: 'fma', template: 'F = ma', detail: "Newton's second law", category: 'physics' },
]

/**
 * LaTeX snippet completion source
 * Triggers on snippet keywords ONLY in math mode
 * This prevents erratic behavior when typing normal text or code
 */
function latexSnippetCompletions(context: CompletionContext) {
  // ONLY trigger in math contexts - this is critical to prevent
  // snippet popups when typing normal code or text
  if (!isInMathContext(context)) return null
  
  // Match alphanumeric snippet triggers
  const word = context.matchBefore(/[a-z][a-z0-9]*/)
  if (!word || (word.from === word.to && !context.explicit)) {
    return null
  }

  // Convert snippets to completions with apply function
  const snippetCompletions: Completion[] = latexSnippets.map(snippet => ({
    label: snippet.trigger,
    detail: `📋 ${snippet.detail}`,
    type: 'text',
    apply: snippet.template,
    section: snippet.category,
  }))

  return {
    from: word.from,
    options: snippetCompletions,
    validFor: /^[a-z][a-z0-9]*$/
  }
}

/**
 * LaTeX Syntax Highlighting Plugin (Source Mode Only)
 *
 * Highlights LaTeX syntax elements within math blocks:
 * - Commands: \frac, \int, \alpha (blue/purple)
 * - Braces: { } (gray)
 * - Operators: ^, _, =, +, - (orange)
 * - Numbers: 0-9, . (green)
 * - Delimiters: $, $$ (muted)
 */
class LaTeXSyntaxHighlighter {
  decorations: DecorationSet

  constructor(view: EditorView) {
    this.decorations = this.buildDecorations(view)
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view)
    }
  }

  buildDecorations(view: EditorView): DecorationSet {
    const { state } = view
    const { doc } = state
    const decorations: Range<Decoration>[] = []
    const text = doc.toString()

    // Find all inline math ($...$)
    const inlineMathRegex = /(?<!\$)\$([^$\n]+)\$(?!\$)/g
    let match: RegExpExecArray | null

    while ((match = inlineMathRegex.exec(text)) !== null) {
      const start = match.index
      const end = start + match[0].length
      const formula = match[1]

      // Highlight the delimiters ($)
      decorations.push(
        Decoration.mark({ class: 'cm-latex-delimiter' }).range(start, start + 1),
        Decoration.mark({ class: 'cm-latex-delimiter' }).range(end - 1, end)
      )

      // Highlight syntax within the formula
      this.highlightLatexSyntax(formula, start + 1, decorations)
    }

    // Find all display math ($$...$$)
    const displayMathRegex = /\$\$(.+?)\$\$/gs
    while ((match = displayMathRegex.exec(text)) !== null) {
      const start = match.index
      const end = start + match[0].length
      const formula = match[1]

      // Highlight the delimiters ($$)
      decorations.push(
        Decoration.mark({ class: 'cm-latex-delimiter' }).range(start, start + 2),
        Decoration.mark({ class: 'cm-latex-delimiter' }).range(end - 2, end)
      )

      // Highlight syntax within the formula
      this.highlightLatexSyntax(formula, start + 2, decorations)
    }

    return Decoration.set(decorations.sort((a, b) => a.from - b.from))
  }

  highlightLatexSyntax(formula: string, offset: number, decorations: Range<Decoration>[]) {
    // Highlight LaTeX commands (\command)
    const commandRegex = /\\[a-zA-Z]+/g
    let match: RegExpExecArray | null
    while ((match = commandRegex.exec(formula)) !== null) {
      const start = offset + match.index
      const end = start + match[0].length
      decorations.push(
        Decoration.mark({ class: 'cm-latex-command' }).range(start, end)
      )
    }

    // Highlight braces { }
    const braceRegex = /[{}]/g
    while ((match = braceRegex.exec(formula)) !== null) {
      const pos = offset + match.index
      decorations.push(
        Decoration.mark({ class: 'cm-latex-brace' }).range(pos, pos + 1)
      )
    }

    // Highlight operators (^, _, =, +, -, *, /)
    const operatorRegex = /[\^_=+\-*/]/g
    while ((match = operatorRegex.exec(formula)) !== null) {
      const pos = offset + match.index
      decorations.push(
        Decoration.mark({ class: 'cm-latex-operator' }).range(pos, pos + 1)
      )
    }

    // Highlight numbers
    const numberRegex = /\d+\.?\d*/g
    while ((match = numberRegex.exec(formula)) !== null) {
      const start = offset + match.index
      const end = start + match[0].length
      decorations.push(
        Decoration.mark({ class: 'cm-latex-number' }).range(start, end)
      )
    }
  }
}

const latexSyntaxPlugin = ViewPlugin.fromClass(LaTeXSyntaxHighlighter, {
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
    border: styles.getPropertyValue('--nexus-border').trim() || 'rgba(255, 255, 255, 0.1)',
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
  // WikiLink styles (Obsidian-style [[Page Name]])
  '.cm-wikilink': {
    color: colors.accent,
    textDecoration: 'none',
    fontWeight: '500',
    cursor: 'pointer',
  },
  '.cm-wikilink:hover': {
    textDecoration: 'underline',
  },
  // Meta (like ### marks when visible)
  '.cm-meta': {
    color: colors.textMuted,
    fontWeight: '400',
    opacity: '0.7',
  },

  // Markdown Syntax Markers - Visible in Source mode
  '.cm-heading-marker': {
    color: colors.accent,
    fontWeight: '600',
    opacity: '0.6',
  },
  '.cm-strong-marker': {
    color: colors.textMuted,
    fontWeight: '700',
    opacity: '0.5',
  },
  '.cm-emphasis-marker': {
    color: colors.textMuted,
    fontStyle: 'italic',
    opacity: '0.5',
  },
  '.cm-code-marker': {
    color: colors.textMuted,
    fontFamily: 'monospace',
    opacity: '0.5',
  },
  '.cm-link-marker': {
    color: colors.accent,
    opacity: '0.6',
  },
  '.cm-quote-marker': {
    color: colors.textSecondary,
    fontWeight: '600',
    opacity: '0.6',
  },
  '.cm-list-marker': {
    color: colors.accent,
    fontWeight: '600',
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
  // Note: LaTeX error styles are now in index.css as global styles
  // to avoid CodeMirror scope conflicts with hover states

  // LaTeX Syntax Highlighting (applied to raw LaTeX text in source/live modes)
  '.cm-latex-delimiter': {
    color: colors.textMuted,
    opacity: '0.7',
    fontWeight: '400',
  },
  '.cm-latex-command': {
    color: '#8B5CF6',  // Purple for commands like \frac, \int
    fontWeight: '600',
  },
  '.cm-latex-brace': {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  '.cm-latex-operator': {
    color: '#F59E0B',  // Orange for ^, _, =, +, -
    fontWeight: '600',
  },
  '.cm-latex-number': {
    color: '#10B981',  // Green for numbers
    fontWeight: '400',
  },

  // Autocomplete/Tooltip Styling - Theme Integration
  '.cm-tooltip': {
    backgroundColor: colors.bgSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(20px)',
  },
  '.cm-tooltip-autocomplete': {
    backgroundColor: colors.bgSecondary,
    border: `1px solid ${colors.border}`,
    fontFamily: 'inherit',
  },
  '.cm-tooltip-autocomplete > ul': {
    maxHeight: '20em',
    fontFamily: 'inherit',
  },
  '.cm-tooltip-autocomplete > ul > li': {
    padding: '6px 12px',
    color: colors.textPrimary,
    cursor: 'pointer',
    borderLeft: '2px solid transparent',
    transition: 'all 150ms ease',
  },
  '.cm-tooltip-autocomplete > ul > li:hover': {
    backgroundColor: `${colors.accent}15`,  // 8% opacity
  },
  '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
    backgroundColor: `${colors.accent}20`,  // 12% opacity
    borderLeftColor: colors.accent,
    color: colors.textPrimary,
  },
  '.cm-completionIcon': {
    fontSize: '16px',
    padding: '0 8px 0 0',
    opacity: '0.8',
  },
  '.cm-completionLabel': {
    fontFamily: 'monospace',
    color: colors.textPrimary,
  },
  '.cm-completionDetail': {
    marginLeft: 'auto',
    paddingLeft: '1em',
    color: colors.textMuted,
    fontSize: '0.85em',
    fontStyle: 'italic',
  },
  '.cm-completionInfo': {
    padding: '8px 12px',
    backgroundColor: colors.bgTertiary,
    color: colors.textSecondary,
    borderLeft: `3px solid ${colors.accent}`,
    fontSize: '0.9em',
    maxWidth: '30em',
  },
  })
}

interface CodeMirrorEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  editorMode?: 'source' | 'live-preview' | 'reading'  // Controls syntax hiding behavior
  onWikiLinkClick?: (pageName: string) => void  // Callback for WikiLink navigation
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
  editorMode = 'source',  // Default to source mode
  onWikiLinkClick,  // WikiLink navigation callback
}: CodeMirrorEditorProps) {
  const editorRef = useRef<ReactCodeMirrorRef>(null)
  const isInternalChange = useRef(false)
  const [cmdPressed, setCmdPressed] = useState(false)

  // Track Cmd/Ctrl key for cursor change on WikiLinks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        setCmdPressed(true)
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey) {
        setCmdPressed(false)
      }
    }
    // Also reset when window loses focus
    const handleBlur = () => setCmdPressed(false)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  // Create theme fresh - @uiw/react-codemirror uses the theme prop for styling
  const editorTheme = createEditorTheme()

  // Create RichMarkdownPlugin with WikiLink click callback
  // useMemo to recreate plugin when callback changes
  const richMarkdownPluginWithCallback = useMemo(
    () => createRichMarkdownPlugin(onWikiLinkClick),
    [onWikiLinkClick]
  )

  // Cmd+Click handler for Source mode WikiLink navigation
  // Allows clicking [[WikiLinks]] in Source mode while holding Cmd (Mac) or Ctrl (Win/Linux)
  const cmdClickHandler = useMemo(() => {
    if (!onWikiLinkClick) return []

    return EditorView.domEventHandlers({
      mousedown: (event, view) => {
        // Check for Cmd (Mac) or Ctrl (Windows/Linux)
        if (!event.metaKey && !event.ctrlKey) return false

        // Get click position in document
        const pos = view.posAtCoords({ x: event.clientX, y: event.clientY })
        if (pos === null) return false

        // Get the line at click position
        const line = view.state.doc.lineAt(pos)
        const lineText = line.text
        const posInLine = pos - line.from

        // Find WikiLink pattern [[...]] that contains the click position
        const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
        let match
        while ((match = wikiLinkRegex.exec(lineText)) !== null) {
          const matchStart = match.index
          const matchEnd = match.index + match[0].length

          // Check if click is within this WikiLink
          if (posInLine >= matchStart && posInLine <= matchEnd) {
            const pageName = match[1].trim()
            event.preventDefault()
            onWikiLinkClick(pageName)
            return true
          }
        }

        return false
      }
    })
  }, [onWikiLinkClick])

  // Extensions for markdown features (not theme)
  const extensions = [
    markdown({
      codeLanguages: languages,
      extensions: [Strikethrough, markdownSyntaxTags]  // Enable GFM strikethrough + syntax marker highlighting
    }),
    syntaxHighlighting(markdownHighlighting),  // Apply formatting styles (bold, italic, strikethrough)
    displayMathField,  // StateField for multi-line display math blocks
    // Only hide syntax in live-preview mode; show all syntax in source mode
    ...(editorMode === 'live-preview' ? [richMarkdownPluginWithCallback] : []),
    // Cmd+Click navigation works in all modes (especially useful in Source mode)
    cmdClickHandler,
    latexSyntaxPlugin,  // LaTeX syntax highlighting for math blocks
    autocompletion({ override: [latexCompletions, latexSnippetCompletions, yamlCompletions, chunkOptionCompletions, crossRefCompletions, codeChunkCompletions] }),  // LaTeX + Quarto completions
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
    <div className={`codemirror-editor-wrapper ${className || ''} ${cmdPressed ? 'cmd-pressed' : ''}`}>
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
