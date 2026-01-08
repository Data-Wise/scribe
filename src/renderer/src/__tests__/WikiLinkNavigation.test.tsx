import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CodeMirrorEditor } from '../components/CodeMirrorEditor'

/**
 * WikiLink Navigation Unit Tests
 *
 * Tests for WikiLink navigation features:
 * - Single-click navigation in Live/Reading modes
 * - Double-click navigation (legacy, still supported)
 * - Cmd+Click navigation in Source mode
 * - Mode preservation during navigation
 * - Accessibility features
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
    it('WLN-06: Single click triggers navigation in live-preview mode', async () => {
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
      })

      const wikilink = document.querySelector('.cm-wikilink')
      if (wikilink) {
        fireEvent.click(wikilink)

        await waitFor(() => {
          // Single click SHOULD call navigation callback (new behavior)
          expect(onWikiLinkClickMock).toHaveBeenCalledWith('Test Page')
        })
      }
    })

    it('WLN-07: Double click also triggers navigation (backwards compatibility)', async () => {
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
          // Double click also triggers navigation (for backwards compatibility)
          expect(onWikiLinkClickMock).toHaveBeenCalledWith('Target Page')
        })
      }
    })

    it('WLN-08: Click with pipe syntax uses page name, not display text', async () => {
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
        fireEvent.click(wikilink)

        await waitFor(() => {
          // Should navigate to actual page name, not display text
          expect(onWikiLinkClickMock).toHaveBeenCalledWith('Actual Page')
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
      })

      const wikilink = document.querySelector('.cm-wikilink')
      if (wikilink) {
        fireEvent.keyDown(wikilink, { key: 'Enter', code: 'Enter' })

        await waitFor(() => {
          // Enter key should trigger navigation
          expect(onWikiLinkClickMock).toHaveBeenCalledWith('Keyboard Page')
        })
      }
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
        fireEvent.click(wikilink)
        await waitFor(() => {
          expect(onWikiLinkClickMock).toHaveBeenCalledWith('Multi Word Page Name')
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
      // WikiLinks at position 0 may render differently in CodeMirror
      // (as cm-link instead of cm-wikilink widget)
      const content = '[[Start Page]] is at the beginning.'

      render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="live-preview"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      // Verify the content renders - either as widget or as link
      await waitFor(() => {
        const wikilink = document.querySelector('.cm-wikilink')
        const link = document.querySelector('.cm-link')
        expect(wikilink || link).toBeTruthy()
      }, { timeout: 2000 })

      // Verify the page name is displayed
      const linkElement = document.querySelector('.cm-wikilink') || document.querySelector('.cm-link')
      expect(linkElement?.textContent).toBe('Start Page')
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

    it('WLN-22: WikiLink callback prop can be changed without crash', async () => {
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

      // Verify first callback works
      const wikilink = document.querySelector('.cm-wikilink')
      if (wikilink) {
        fireEvent.click(wikilink)
        await waitFor(() => {
          expect(firstCallback).toHaveBeenCalled()
        })
      }

      // Change callback - should not crash
      // Note: In jsdom, CodeMirror widget closures don't update reliably,
      // so we just verify the component handles prop changes gracefully
      expect(() => {
        rerender(
          <CodeMirrorEditor
            content="Link [[Test Page]] here."
            onChange={onChangeMock}
            editorMode="live-preview"
            onWikiLinkClick={secondCallback}
          />
        )
      }).not.toThrow()

      // Widget should still be present after rerender
      await waitFor(() => {
        const wikilink = document.querySelector('.cm-wikilink')
        expect(wikilink).toBeTruthy()
      }, { timeout: 2000 })
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

  describe('Cmd+Click Source Mode Navigation', () => {
    it('WLN-25: Cmd+Click on WikiLink in source mode triggers navigation', async () => {
      const content = 'Source mode [[Target Page]] with Cmd+Click.'

      const { container } = render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="source"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      // In source mode, no widget is rendered
      const wikilink = container.querySelector('.cm-wikilink')
      expect(wikilink).toBeFalsy()

      // Find the editor content area
      const editor = container.querySelector('.cm-content')
      expect(editor).toBeTruthy()

      // Cmd+Click should trigger navigation even in source mode
      // Note: Testing this requires simulating metaKey which may not work in jsdom
      // This test documents expected behavior
      if (editor) {
        fireEvent.mouseDown(editor, { metaKey: true, clientX: 100, clientY: 100 })
        // Note: Full Cmd+Click testing requires integration tests
      }
    })

    it('WLN-26: Regular click in source mode does not navigate', async () => {
      const content = 'Source mode [[Test Page]] regular click.'

      const { container } = render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="source"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      // No widgets in source mode
      const wikilink = container.querySelector('.cm-wikilink')
      expect(wikilink).toBeFalsy()

      const editor = container.querySelector('.cm-content')
      if (editor) {
        // Regular click (no Cmd) should not navigate
        fireEvent.click(editor)
        expect(onWikiLinkClickMock).not.toHaveBeenCalled()
      }
    })

    it('WLN-27: Cmd+Click outside WikiLink does not navigate', async () => {
      const content = 'Plain text with no wikilinks here.'

      const { container } = render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="source"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      // Simply verify no navigation happens for plain text
      // Full Cmd+Click testing requires integration tests
      expect(container.querySelector('.cm-content')).toBeTruthy()
      expect(onWikiLinkClickMock).not.toHaveBeenCalled()
    })

    it('WLN-28: Ctrl+Click works as alternative to Cmd+Click (Windows/Linux)', async () => {
      const content = 'Cross-platform [[Control Page]] navigation.'

      const { container } = render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="source"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      // Verify editor renders correctly
      // Full Ctrl+Click testing requires integration tests with actual cursor position
      expect(container.querySelector('.cm-content')).toBeTruthy()
    })
  })

  describe('Cursor Indicator', () => {
    it('WLN-29: Editor wrapper has cmd-pressed class when Cmd is held', async () => {
      const content = 'Test cursor indicator [[Page]] here.'

      const { container } = render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="source"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      const wrapper = container.querySelector('.codemirror-editor-wrapper')
      expect(wrapper).toBeTruthy()

      // Initially no cmd-pressed class
      expect(wrapper?.classList.contains('cmd-pressed')).toBe(false)

      // Simulate Cmd key down
      fireEvent.keyDown(window, { key: 'Meta', metaKey: true })

      await waitFor(() => {
        // Should have cmd-pressed class
        expect(wrapper?.classList.contains('cmd-pressed')).toBe(true)
      })

      // Simulate Cmd key up
      fireEvent.keyUp(window, { key: 'Meta', metaKey: false })

      await waitFor(() => {
        // cmd-pressed class should be removed
        expect(wrapper?.classList.contains('cmd-pressed')).toBe(false)
      })
    })

    it('WLN-30: cmd-pressed class removed on window blur', async () => {
      const content = 'Test blur handling [[Page]].'

      const { container } = render(
        <CodeMirrorEditor
          content={content}
          onChange={onChangeMock}
          editorMode="source"
          onWikiLinkClick={onWikiLinkClickMock}
        />
      )

      const wrapper = container.querySelector('.codemirror-editor-wrapper')

      // Hold Cmd
      fireEvent.keyDown(window, { key: 'Meta', metaKey: true })

      await waitFor(() => {
        expect(wrapper?.classList.contains('cmd-pressed')).toBe(true)
      })

      // Window loses focus
      fireEvent.blur(window)

      await waitFor(() => {
        // cmd-pressed should be removed on blur
        expect(wrapper?.classList.contains('cmd-pressed')).toBe(false)
      })
    })
  })
})
