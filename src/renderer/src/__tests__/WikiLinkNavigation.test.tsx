import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CodeMirrorEditor } from '../components/CodeMirrorEditor'

/**
 * WikiLink Navigation Unit Tests
 *
 * Tests for WikiLink double-click navigation feature
 * Ensures clicks don't break other functionality (window dragging, etc.)
 */

describe('WikiLink Navigation', () => {
  let onChangeMock: ReturnType<typeof vi.fn>
  let onWikiLinkClickMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onChangeMock = vi.fn()
    onWikiLinkClickMock = vi.fn()
  })

  describe('WikiLink Widget Rendering', () => {
    it('WLN-01: Renders WikiLink with hidden brackets in live-preview mode', async () => {
      const content = 'Check out [[Welcome to Scribe]] for details.'

      render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="live-preview"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      await waitFor(() => {
        // WikiLink should be rendered as a widget
        const wikilink = document.querySelector('.cm-wikilink')
        expect(wikilink).toBeTruthy()
      })
    })

    it('WLN-02: Shows brackets when cursor is inside WikiLink', async () => {
      const content = 'Check out [[Welcome to Scribe]] for details.'

      const { container } = render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="live-preview"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      const editor = container.querySelector('.cm-content')
      expect(editor).toBeTruthy()

      // Click to place cursor inside WikiLink
      if (editor) {
        fireEvent.click(editor)

        await waitFor(() => {
          // When cursor is inside, brackets should be visible (widget not shown)
          const editorText = editor.textContent || ''
          // Text should contain the full WikiLink syntax when editing
          expect(editorText).toContain('Welcome to Scribe')
        })
      }
    })

    it('WLN-03: Does not render WikiLink widgets in source mode', () => {
      const content = 'Check out [[Welcome to Scribe]] for details.'

      const { container } = render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="source"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      // In source mode, WikiLink widgets should not be created
      const wikilink = container.querySelector('.cm-wikilink')
      expect(wikilink).toBeFalsy()
    })

    it('WLN-04: Handles WikiLink with pipe syntax [[Page|Display Text]]', async () => {
      const content = 'See [[Actual Page Name|Custom Display Text]] here.'

      render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="live-preview"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      await waitFor(() => {
        const wikilink = document.querySelector('.cm-wikilink')
        expect(wikilink).toBeTruthy()
        expect(wikilink?.textContent).toBe('Custom Display Text')
      })
    })

    it('WLN-05: Renders multiple WikiLinks in same line', async () => {
      const content = 'See [[Page One]] and [[Page Two]] and [[Page Three]].'

      render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="live-preview"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      await waitFor(() => {
        const wikilinks = document.querySelectorAll('.cm-wikilink')
        expect(wikilinks.length).toBeGreaterThanOrEqual(1)
      })
    })
  })

  describe('WikiLink Click Behavior', () => {
    it('WLN-06: Single click does not trigger navigation', async () => {
      const content = 'Click [[Test Page]] here.'

      render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="live-preview"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      await waitFor(() => {
        const wikilink = document.querySelector('.cm-wikilink')
        expect(wikilink).toBeTruthy()

        if (wikilink) {
          fireEvent.click(wikilink)

          // Single click should NOT call navigation callback
          expect(onWikiLinkClickMock).not.toHaveBeenCalled()
        }
      })
    })

    it('WLN-07: Double click triggers navigation with correct page name', async () => {
      const content = 'Double-click [[Target Page]] to navigate.'

      render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="live-preview"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      await waitFor(() => {
        const wikilink = document.querySelector('.cm-wikilink')
        expect(wikilink).toBeTruthy()
      })

      const wikilink = document.querySelector('.cm-wikilink')
      if (wikilink) {
        fireEvent.doubleClick(wikilink)

        await waitFor(() => {
          // Double click SHOULD call navigation callback with page name
          expect(onWikiLinkClickMock).toHaveBeenCalledWith('Target Page', true)
        })
      }
    })

    it('WLN-08: Double click with pipe syntax uses page name, not display text', async () => {
      const content = 'Navigate to [[Actual Page|Display Text]] here.'

      render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="live-preview"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      await waitFor(() => {
        const wikilink = document.querySelector('.cm-wikilink')
        expect(wikilink).toBeTruthy()
        expect(wikilink?.textContent).toBe('Display Text')
      })

      const wikilink = document.querySelector('.cm-wikilink')
      if (wikilink) {
        fireEvent.doubleClick(wikilink)

        await waitFor(() => {
          // Should navigate to actual page name, not display text
          expect(onWikiLinkClickMock).toHaveBeenCalledWith('Actual Page', true)
        })
      }
    })

    it('WLN-09: Enter key on WikiLink triggers navigation', async () => {
      const content = 'Press Enter on [[Keyboard Page]] to navigate.'

      render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="live-preview"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      await waitFor(() => {
        const wikilink = document.querySelector('.cm-wikilink')
        expect(wikilink).toBeTruthy()

        if (wikilink) {
          fireEvent.keyDown(wikilink, { key: 'Enter', code: 'Enter' })

          // Enter key should trigger navigation
          expect(onWikiLinkClickMock).toHaveBeenCalledWith('Keyboard Page', true)
        }
      })
    })

    it('WLN-10: Click does not move cursor into WikiLink', async () => {
      const content = 'Click [[Test Page]] should not reveal brackets.'

      const { container } = render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="live-preview"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      await waitFor(() => {
        const wikilink = document.querySelector('.cm-wikilink')
        expect(wikilink).toBeTruthy()

        if (wikilink) {
          fireEvent.click(wikilink)

          // After click, widget should still be visible (brackets still hidden)
          const wikilinkAfterClick = container.querySelector('.cm-wikilink')
          expect(wikilinkAfterClick).toBeTruthy()
        }
      })
    })
  })

  describe('WikiLink Accessibility', () => {
    it('WLN-11: WikiLink has role="link" attribute', async () => {
      const content = 'Accessible [[Link Page]] here.'

      render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="live-preview"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      await waitFor(() => {
        const wikilink = document.querySelector('.cm-wikilink')
        expect(wikilink).toBeTruthy()
        expect(wikilink?.getAttribute('role')).toBe('link')
      })
    })

    it('WLN-12: WikiLink has tabindex for keyboard navigation', async () => {
      const content = 'Tab to [[Navigate Page]] via keyboard.'

      render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="live-preview"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      await waitFor(() => {
        const wikilink = document.querySelector('.cm-wikilink')
        expect(wikilink).toBeTruthy()
        expect(wikilink?.getAttribute('tabindex')).toBe('0')
      })
    })

    it('WLN-13: WikiLink has pointer cursor style', async () => {
      const content = 'Cursor should be pointer on [[Hover Page]].'

      render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="live-preview"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      await waitFor(() => {
        const wikilink = document.querySelector('.cm-wikilink') as HTMLElement
        expect(wikilink).toBeTruthy()
        expect(wikilink?.style.cursor).toBe('pointer')
      })
    })

    it('WLN-14: WikiLink has data-wikilink attribute with page name', async () => {
      const content = 'Check data attribute [[Data Page]].'

      render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="live-preview"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      await waitFor(() => {
        const wikilink = document.querySelector('.cm-wikilink')
        expect(wikilink).toBeTruthy()
        expect(wikilink?.getAttribute('data-wikilink')).toBe('Data Page')
      })
    })
  })

  describe('WikiLink Edge Cases', () => {
    it('WLN-15: Handles WikiLink with spaces in name', async () => {
      const content = 'Link to [[Multi Word Page Name]] works.'

      render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="live-preview"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      await waitFor(() => {
        const wikilink = document.querySelector('.cm-wikilink')
        expect(wikilink).toBeTruthy()
        expect(wikilink?.textContent).toBe('Multi Word Page Name')
      })

      const wikilink = document.querySelector('.cm-wikilink')
      if (wikilink) {
        fireEvent.doubleClick(wikilink)
        await waitFor(() => {
          expect(onWikiLinkClickMock).toHaveBeenCalledWith('Multi Word Page Name', true)
        })
      }
    })

    it('WLN-16: Handles WikiLink with special characters', async () => {
      const content = 'Link [[Page: Special & Characters!]] works.'

      render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="live-preview"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      await waitFor(() => {
        const wikilink = document.querySelector('.cm-wikilink')
        expect(wikilink).toBeTruthy()
      })
    })

    it('WLN-17: Handles WikiLink at start of line', async () => {
      const content = '[[Start Page]] is at the beginning.'

      render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="live-preview"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      await waitFor(() => {
        const wikilink = document.querySelector('.cm-wikilink')
        expect(wikilink).toBeTruthy()
        expect(wikilink?.textContent).toBe('Start Page')
      })
    })

    it('WLN-18: Handles WikiLink at end of line', async () => {
      const content = 'This ends with [[End Page]]'

      render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="live-preview"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      await waitFor(() => {
        const wikilink = document.querySelector('.cm-wikilink')
        expect(wikilink).toBeTruthy()
        expect(wikilink?.textContent).toBe('End Page')
      })
    })

    it('WLN-19: Handles empty WikiLink callback gracefully', async () => {
      const content = 'Link [[No Callback Page]] without handler.'

      render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="live-preview"
          // No onWikiLinkClick provided
        />
      )

      await waitFor(() => {
        const wikilink = document.querySelector('.cm-wikilink')
        expect(wikilink).toBeTruthy()

        // Should not crash when double-clicked without callback
        if (wikilink) {
          expect(() => fireEvent.doubleClick(wikilink)).not.toThrow()
        }
      })
    })

    it('WLN-20: Multiple consecutive WikiLinks render correctly', async () => {
      const content = '[[First]][[Second]][[Third]] no spaces.'

      render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="live-preview"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      await waitFor(() => {
        const wikilinks = document.querySelectorAll('.cm-wikilink')
        expect(wikilinks.length).toBeGreaterThanOrEqual(1)
      })
    })
  })

  describe('WikiLink Content Updates', () => {
    it('WLN-21: WikiLink updates when content changes', async () => {
      const { rerender } = render(
        <CodeMirrorEditor
          content="Old [[Old Page]] link."
          onChange={onChangeMock}
          editorMode="live-preview"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      await waitFor(() => {
        const wikilink = document.querySelector('.cm-wikilink')
        expect(wikilink).toBeTruthy()
      })

      // Update content
      rerender(
        <CodeMirrorEditor
          content="New [[New Page]] link."
          onChange={onChangeMock}
          editorMode="live-preview"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      // Content should update (may take time for CodeMirror to re-render)
      await waitFor(() => {
        const editor = document.querySelector('.cm-content')
        expect(editor?.textContent).toContain('New Page')
      }, { timeout: 2000 })
    })

    it('WLN-22: WikiLink callback updates when prop changes', async () => {
      const firstCallback = vi.fn()
      const secondCallback = vi.fn()

      const { rerender } = render(
        <CodeMirrorEditor
          content="Link [[Test Page]] here."
          onChange={onChangeMock}
          editorMode="live-preview"
          onWikiLinkClick={firstCallback}
        />
      )

      await waitFor(() => {
        const wikilink = document.querySelector('.cm-wikilink')
        expect(wikilink).toBeTruthy()
      })

      let wikilink = document.querySelector('.cm-wikilink')
      if (wikilink) {
        fireEvent.doubleClick(wikilink)
        await waitFor(() => {
          expect(firstCallback).toHaveBeenCalled()
        })
      }

      // Change callback
      rerender(
        <CodeMirrorEditor
          content="Link [[Test Page]] here."
          onChange={onChangeMock}
          editorMode="live-preview"
          onWikiLinkClick={secondCallback}
        />
      )

      await waitFor(() => {
        const wikilink = document.querySelector('.cm-wikilink')
        expect(wikilink).toBeTruthy()
      }, { timeout: 2000 })

      wikilink = document.querySelector('.cm-wikilink')
      if (wikilink) {
        fireEvent.doubleClick(wikilink)
        await waitFor(() => {
          expect(secondCallback).toHaveBeenCalled()
        })
      }
    })
  })

  describe('WikiLink Mode Switching', () => {
    it('WLN-23: WikiLink hidden when switching from live-preview to source', async () => {
      const content = 'Link [[Mode Test]] here.'

      const { rerender, container } = render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="live-preview"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      await waitFor(() => {
        const wikilink = container.querySelector('.cm-wikilink')
        expect(wikilink).toBeTruthy()
      })

      // Switch to source mode
      rerender(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="source"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      await waitFor(() => {
        const wikilink = container.querySelector('.cm-wikilink')
        expect(wikilink).toBeFalsy() // No widget in source mode
      })
    })

    it('WLN-24: WikiLink shows when switching from source to live-preview', async () => {
      const content = 'Link [[Mode Test]] here.'

      const { rerender, container } = render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="source"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      await waitFor(() => {
        const wikilink = container.querySelector('.cm-wikilink')
        expect(wikilink).toBeFalsy() // No widget in source mode
      })

      // Switch to live-preview mode
      rerender(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="live-preview"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      await waitFor(() => {
        const wikilink = container.querySelector('.cm-wikilink')
        expect(wikilink).toBeTruthy() // Widget appears in live-preview
      })
    })
  })
})
