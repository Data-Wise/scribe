/**
 * CodeMirror Live Preview Component
 *
 * Provides Obsidian-style live markdown preview using CodeMirror 6.
 * Features inline rendering of markdown with syntax highlighting and
 * live preview extensions.
 */

import React, { useEffect, useRef } from 'react'
import { EditorView, keymap, ViewUpdate } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import { autocompletion } from '@codemirror/autocomplete'
import { lintKeymap } from '@codemirror/lint'
import { searchKeymap } from '@codemirror/search'

interface CodeMirrorLivePreviewProps {
  content: string
  onChange: (newContent: string) => void
  className?: string
  style?: React.CSSProperties
  readOnly?: boolean
}

export const CodeMirrorLivePreview: React.FC<CodeMirrorLivePreviewProps> = ({
  content,
  onChange,
  className = '',
  style = {},
  readOnly = false
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!editorRef.current) return

    // Create editor state
    const startState = EditorState.create({
      doc: content,
      extensions: [
        // Markdown language support
        markdown({ base: markdownLanguage }),

        // Syntax highlighting
        syntaxHighlighting(defaultHighlightStyle),

        // History (undo/redo)
        history(),

        // Autocompletion
        autocompletion(),

        // Keymaps
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...lintKeymap,
          ...searchKeymap,
        ]),

        // Update listener
        EditorView.updateListener.of((update: ViewUpdate) => {
          if (update.docChanged) {
            const newContent = update.state.doc.toString()
            onChange(newContent)
          }
        }),

        // Read-only mode
        ...(readOnly ? [EditorView.editable.of(false)] : []),

        // Base theme customization
        EditorView.theme({
          '&': {
            fontSize: 'var(--editor-font-size, 16px)',
            fontFamily: 'var(--editor-font-family, monospace)',
            backgroundColor: 'transparent',
            height: '100%',
          },
          '.cm-content': {
            fontFamily: 'var(--editor-font-family, monospace)',
            fontSize: 'var(--editor-font-size, 16px)',
            lineHeight: 'var(--editor-line-height, 1.6)',
            color: 'var(--nexus-text-primary, #e5e5e5)',
            padding: '0',
            caretColor: 'var(--nexus-accent, #3B82F6)',
          },
          '.cm-line': {
            padding: '0',
          },
          '.cm-cursor': {
            borderLeftColor: 'var(--nexus-accent, #3B82F6)',
          },
          '&.cm-focused .cm-cursor': {
            borderLeftWidth: '2px',
          },
          '.cm-selectionBackground': {
            backgroundColor: 'var(--nexus-accent-alpha, rgba(59, 130, 246, 0.2))',
          },
          '&.cm-focused .cm-selectionBackground': {
            backgroundColor: 'var(--nexus-accent-alpha, rgba(59, 130, 246, 0.3))',
          },
          '.cm-activeLine': {
            backgroundColor: 'transparent',
          },
          '.cm-gutters': {
            display: 'none', // Hide line numbers for cleaner look
          },
          // Markdown syntax highlighting
          '.cm-header': {
            fontWeight: '600',
            color: 'var(--nexus-text-primary, #e5e5e5)',
          },
          '.cm-strong': {
            fontWeight: '700',
            color: 'var(--nexus-text-primary, #e5e5e5)',
          },
          '.cm-em': {
            fontStyle: 'italic',
            color: 'var(--nexus-text-primary, #e5e5e5)',
          },
          '.cm-link': {
            color: 'var(--nexus-accent, #3B82F6)',
            textDecoration: 'underline',
          },
          '.cm-url': {
            color: 'var(--nexus-text-muted, #9CA3AF)',
          },
          '.cm-comment': {
            color: 'var(--nexus-text-muted, #9CA3AF)',
            fontStyle: 'italic',
          },
        }),
      ],
    })

    // Create editor view
    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    })

    viewRef.current = view

    // Cleanup
    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, []) // Only run once on mount

  // Update content when it changes externally
  useEffect(() => {
    if (!viewRef.current) return

    const currentContent = viewRef.current.state.doc.toString()
    if (currentContent !== content) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: currentContent.length,
          insert: content,
        },
      })
    }
  }, [content])

  return (
    <div
      ref={editorRef}
      className={`codemirror-live-preview ${className}`}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 'calc(100vh - 200px)',
        ...style,
      }}
    />
  )
}
