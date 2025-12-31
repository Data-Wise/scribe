/**
 * CodeMirror Markdown Live Preview Extension
 *
 * Provides Obsidian-style inline markdown rendering:
 * - Hides markdown syntax markers (**, __, ##, etc.)
 * - Applies visual styling to rendered text
 * - Shows syntax markers where cursor is (cursor-aware)
 */

import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate
} from '@codemirror/view'
import { RangeSetBuilder } from '@codemirror/state'
import { syntaxTree } from '@codemirror/language'

/**
 * Decoration to hide markdown syntax markers
 */
const hideSyntax = Decoration.mark({
  class: 'cm-md-hidden'
})

/**
 * Decorations for styled text
 */
const boldDeco = Decoration.mark({
  class: 'cm-md-bold'
})

const italicDeco = Decoration.mark({
  class: 'cm-md-italic'
})

const header1Deco = Decoration.mark({
  class: 'cm-md-header1'
})

const header2Deco = Decoration.mark({
  class: 'cm-md-header2'
})

const header3Deco = Decoration.mark({
  class: 'cm-md-header3'
})

const codeDeco = Decoration.mark({
  class: 'cm-md-code'
})

/**
 * Build decorations for markdown rendering
 */
function buildDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>()
  const cursorPos = view.state.selection.main.head
  const doc = view.state.doc

  // Get the line with the cursor
  const cursorLine = doc.lineAt(cursorPos)

  // Iterate through syntax tree
  syntaxTree(view.state).iterate({
    enter: (node) => {
      const { from, to, name } = node

      // Don't apply rendering on the cursor's line (show raw syntax)
      if (from >= cursorLine.from && to <= cursorLine.to) {
        return
      }

      // Handle bold text: **text** or __text__
      if (name === 'StrongEmphasis') {
        const text = doc.sliceString(from, to)
        if (text.startsWith('**') && text.endsWith('**')) {
          // Hide opening **
          builder.add(from, from + 2, hideSyntax)
          // Style the content
          builder.add(from + 2, to - 2, boldDeco)
          // Hide closing **
          builder.add(to - 2, to, hideSyntax)
        } else if (text.startsWith('__') && text.endsWith('__')) {
          builder.add(from, from + 2, hideSyntax)
          builder.add(from + 2, to - 2, boldDeco)
          builder.add(to - 2, to, hideSyntax)
        }
      }

      // Handle italic text: *text* or _text_
      if (name === 'Emphasis') {
        const text = doc.sliceString(from, to)
        if ((text.startsWith('*') && text.endsWith('*') && !text.startsWith('**')) ||
            (text.startsWith('_') && text.endsWith('_') && !text.startsWith('__'))) {
          builder.add(from, from + 1, hideSyntax)
          builder.add(from + 1, to - 1, italicDeco)
          builder.add(to - 1, to, hideSyntax)
        }
      }

      // Handle headings: # Header
      if (name === 'ATXHeading1') {
        const text = doc.sliceString(from, to)
        const match = text.match(/^(#+)\s/)
        if (match) {
          const hashCount = match[1].length
          builder.add(from, from + hashCount + 1, hideSyntax)
          builder.add(from + hashCount + 1, to, header1Deco)
        }
      }

      if (name === 'ATXHeading2') {
        const text = doc.sliceString(from, to)
        const match = text.match(/^(#+)\s/)
        if (match) {
          const hashCount = match[1].length
          builder.add(from, from + hashCount + 1, hideSyntax)
          builder.add(from + hashCount + 1, to, header2Deco)
        }
      }

      if (name === 'ATXHeading3') {
        const text = doc.sliceString(from, to)
        const match = text.match(/^(#+)\s/)
        if (match) {
          const hashCount = match[1].length
          builder.add(from, from + hashCount + 1, hideSyntax)
          builder.add(from + hashCount + 1, to, header3Deco)
        }
      }

      // Handle inline code: `code`
      if (name === 'InlineCode') {
        const text = doc.sliceString(from, to)
        if (text.startsWith('`') && text.endsWith('`')) {
          builder.add(from, from + 1, hideSyntax)
          builder.add(from + 1, to - 1, codeDeco)
          builder.add(to - 1, to, hideSyntax)
        }
      }
    }
  })

  return builder.finish()
}

/**
 * View plugin that provides live markdown rendering
 */
export const markdownLivePreview = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = buildDecorations(view)
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.selectionSet || update.viewportChanged) {
        this.decorations = buildDecorations(update.view)
      }
    }
  },
  {
    decorations: (v) => v.decorations
  }
)

/**
 * Theme extension for styled markdown elements
 */
export const markdownTheme = EditorView.theme({
  '.cm-md-hidden': {
    display: 'none'
  },
  '.cm-md-bold': {
    fontWeight: '700',
    color: 'var(--nexus-text-primary, #e5e5e5)'
  },
  '.cm-md-italic': {
    fontStyle: 'italic',
    color: 'var(--nexus-text-primary, #e5e5e5)'
  },
  '.cm-md-header1': {
    fontSize: '2em',
    fontWeight: '700',
    lineHeight: '1.2',
    color: 'var(--nexus-text-primary, #e5e5e5)',
    display: 'block',
    marginTop: '0.67em',
    marginBottom: '0.67em'
  },
  '.cm-md-header2': {
    fontSize: '1.5em',
    fontWeight: '700',
    lineHeight: '1.3',
    color: 'var(--nexus-text-primary, #e5e5e5)',
    display: 'block',
    marginTop: '0.83em',
    marginBottom: '0.83em'
  },
  '.cm-md-header3': {
    fontSize: '1.17em',
    fontWeight: '700',
    lineHeight: '1.4',
    color: 'var(--nexus-text-primary, #e5e5e5)',
    display: 'block',
    marginTop: '1em',
    marginBottom: '1em'
  },
  '.cm-md-code': {
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '0.9em',
    backgroundColor: 'var(--nexus-bg-tertiary, rgba(255, 255, 255, 0.1))',
    padding: '0.2em 0.4em',
    borderRadius: '3px',
    color: 'var(--nexus-accent, #3B82F6)'
  }
})
