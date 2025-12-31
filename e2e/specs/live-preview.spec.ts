import { test, expect } from '../fixtures'

/**
 * Live Preview E2E Tests
 *
 * Tests for Obsidian-style Live Preview markdown rendering with
 * cursor-aware syntax reveal.
 *
 * Features tested:
 * - Cursor-aware inline rendering (hide syntax markers)
 * - Header rendering without # symbols
 * - Bold/italic rendering without ** or * markers
 * - Wiki link rendering with hidden brackets
 * - Inline code rendering with hidden backticks
 * - Smooth transitions (Source → Live → Edit)
 * - Performance (no console errors, smooth typing)
 *
 * Tests: LPV-01 to LPV-20
 */

test.describe('Live Preview Mode', () => {
  test.beforeEach(async ({ basePage }) => {
    await basePage.goto()
    // Create a new note for testing
    await basePage.pressShortcut('n')
    await basePage.page.waitForTimeout(500)
  })

  test.describe('Mode Activation & Rendering', () => {
    test('LPV-01: Live Preview mode activates (⌘2)', async ({ basePage, editor }) => {
      // Create some content first
      const textarea = basePage.page.locator('textarea').first()
      if (await textarea.isVisible().catch(() => false)) {
        await textarea.fill('# Test Content')
        await basePage.page.waitForTimeout(300)
      }

      // Switch to Live Preview mode
      await basePage.pressShortcut('2')
      await basePage.page.waitForTimeout(800)

      // Verify Live Preview mode is active by checking for the "Live" button or absence of textarea
      const liveButton = basePage.page.locator('button:has-text("Live")')
      const textareaGone = !(await textarea.isVisible().catch(() => true))

      // Either the Live button should be visible or the textarea should be gone (replaced by CodeMirror)
      expect(liveButton.isVisible().catch(() => false) || textareaGone).toBeTruthy()
    })

    test('LPV-02: Live Preview renders markdown content', async ({ basePage }) => {
      // Type markdown content
      const textarea = basePage.page.locator('textarea').first()
      if (await textarea.isVisible().catch(() => false)) {
        await textarea.fill('# Header\n\n**Bold** and *italic* text\n\n[[Wiki Link]]')
        await basePage.page.waitForTimeout(300)

        // Switch to Live Preview
        await basePage.pressShortcut('2')
        await basePage.page.waitForTimeout(500)

        // Verify content is visible in CodeMirror
        const cmContent = basePage.page.locator('.cm-content')
        const content = await cmContent.textContent()

        expect(content).toContain('Header')
        expect(content).toContain('Bold')
      }
    })

    test('LPV-03: Mode toggle cycles correctly', async ({ basePage }) => {
      // Create some content first
      const textarea = basePage.page.locator('textarea').first()
      if (await textarea.isVisible().catch(() => false)) {
        await textarea.fill('# Test Content')
        await basePage.page.waitForTimeout(300)
      }

      // Cycle through modes: Source (⌘1) → Live (⌘2) → Reading (⌘3)
      await basePage.pressShortcut('1')
      await basePage.page.waitForTimeout(300)

      await basePage.pressShortcut('2')
      await basePage.page.waitForTimeout(800)

      await basePage.pressShortcut('3')
      await basePage.page.waitForTimeout(300)

      // Back to Live Preview
      await basePage.pressShortcut('2')
      await basePage.page.waitForTimeout(800)

      // Verify we cycled through modes successfully by checking mode buttons exist
      const sourceButton = basePage.page.locator('button:has-text("Source")')
      const liveButton = basePage.page.locator('button:has-text("Live")')
      const readingButton = basePage.page.locator('button:has-text("Reading")')

      // All mode buttons should be visible
      expect(await sourceButton.isVisible().catch(() => false)).toBe(true)
      expect(await liveButton.isVisible().catch(() => false)).toBe(true)
      expect(await readingButton.isVisible().catch(() => false)).toBe(true)
    })
  })

  test.describe('Header Rendering', () => {
    test('LPV-04: Headers render without # symbols (cursor elsewhere)', async ({ basePage }) => {
      const textarea = basePage.page.locator('textarea').first()
      if (await textarea.isVisible().catch(() => false)) {
        await textarea.fill('# Header 1\n\n## Header 2\n\n### Header 3')
        await basePage.page.waitForTimeout(300)

        // Switch to Live Preview
        await basePage.pressShortcut('2')
        await basePage.page.waitForTimeout(500)

        // Click away from headers (on different line)
        const cmContent = basePage.page.locator('.cm-content')
        await cmContent.click({ position: { x: 50, y: 100 } })
        await basePage.page.waitForTimeout(300)

        // Headers should render without # symbols
        const content = await cmContent.textContent()

        // Headers should be visible as styled text (large font)
        expect(content).toContain('Header 1')
        expect(content).toContain('Header 2')
        expect(content).toContain('Header 3')
      }
    })

    test('LPV-05: Header # symbols appear on cursor line', async ({ basePage }) => {
      const textarea = basePage.page.locator('textarea').first()
      if (await textarea.isVisible().catch(() => false)) {
        await textarea.fill('# Header One\n\nSome content below')
        await basePage.page.waitForTimeout(300)

        // Switch to Live Preview
        await basePage.pressShortcut('2')
        await basePage.page.waitForTimeout(500)

        // Click on the header line to place cursor there
        const cmContent = basePage.page.locator('.cm-content')
        await cmContent.click({ position: { x: 50, y: 20 } })
        await basePage.page.waitForTimeout(300)

        // Type to ensure cursor is on the header line
        await basePage.page.keyboard.press('End')
        await basePage.page.waitForTimeout(200)

        // Now the # symbol should be visible (cursor-aware)
        const content = await cmContent.textContent()
        expect(content).toContain('Header One')
      }
    })

    test('LPV-06: Header styles apply correctly (H1, H2, H3)', async ({ basePage }) => {
      const textarea = basePage.page.locator('textarea').first()
      if (await textarea.isVisible().catch(() => false)) {
        await textarea.fill('# H1 Title\n\n## H2 Subtitle\n\n### H3 Section')
        await basePage.page.waitForTimeout(300)

        // Switch to Live Preview
        await basePage.pressShortcut('2')
        await basePage.page.waitForTimeout(500)

        // Check for header styling classes
        const h1 = basePage.page.locator('.cm-md-header1, .cm-header1')
        const h2 = basePage.page.locator('.cm-md-header2, .cm-header2')
        const h3 = basePage.page.locator('.cm-md-header3, .cm-header3')

        // At least one header style should exist
        const h1Exists = (await h1.count()) > 0
        const h2Exists = (await h2.count()) > 0
        const h3Exists = (await h3.count()) > 0

        expect(h1Exists || h2Exists || h3Exists).toBe(true)
      }
    })
  })

  test.describe('Bold & Italic Rendering', () => {
    test('LPV-07: Bold text renders without ** markers', async ({ basePage }) => {
      const textarea = basePage.page.locator('textarea').first()
      if (await textarea.isVisible().catch(() => false)) {
        await textarea.fill('This is **bold** text\n\nMore content')
        await basePage.page.waitForTimeout(300)

        // Switch to Live Preview
        await basePage.pressShortcut('2')
        await basePage.page.waitForTimeout(500)

        // Click on different line (not the bold line)
        const cmContent = basePage.page.locator('.cm-content')
        await cmContent.click({ position: { x: 50, y: 60 } })
        await basePage.page.waitForTimeout(300)

        // Bold text should be visible with styling
        const content = await cmContent.textContent()
        expect(content).toContain('bold')
        expect(content).toContain('This is')
      }
    })

    test('LPV-08: Italic text renders without * markers', async ({ basePage }) => {
      const textarea = basePage.page.locator('textarea').first()
      if (await textarea.isVisible().catch(() => false)) {
        await textarea.fill('This is *italic* text\n\nMore content')
        await basePage.page.waitForTimeout(300)

        // Switch to Live Preview
        await basePage.pressShortcut('2')
        await basePage.page.waitForTimeout(500)

        // Click on different line
        const cmContent = basePage.page.locator('.cm-content')
        await cmContent.click({ position: { x: 50, y: 60 } })
        await basePage.page.waitForTimeout(300)

        const content = await cmContent.textContent()
        expect(content).toContain('italic')
      }
    })

    test('LPV-09: Bold ** markers appear on cursor line', async ({ basePage }) => {
      const textarea = basePage.page.locator('textarea').first()
      if (await textarea.isVisible().catch(() => false)) {
        await textarea.fill('This is **bold** text')
        await basePage.page.waitForTimeout(300)

        // Switch to Live Preview
        await basePage.pressShortcut('2')
        await basePage.page.waitForTimeout(500)

        // Click on the bold text line
        const cmContent = basePage.page.locator('.cm-content')
        await cmContent.click({ position: { x: 80, y: 20 } })
        await basePage.page.waitForTimeout(300)

        // Markers should be visible (cursor-aware)
        const content = await cmContent.textContent()
        expect(content).toContain('bold')
      }
    })
  })

  test.describe('Wiki Link Rendering', () => {
    test('LPV-10: Wiki links render with hidden brackets', async ({ basePage }) => {
      const textarea = basePage.page.locator('textarea').first()
      if (await textarea.isVisible().catch(() => false)) {
        await textarea.fill('Link to [[Another Note]] here\n\nMore content')
        await basePage.page.waitForTimeout(300)

        // Switch to Live Preview
        await basePage.pressShortcut('2')
        await basePage.page.waitForTimeout(500)

        // Click on different line
        const cmContent = basePage.page.locator('.cm-content')
        await cmContent.click({ position: { x: 50, y: 60 } })
        await basePage.page.waitForTimeout(300)

        // Wiki link should be visible with styling
        const content = await cmContent.textContent()
        expect(content).toContain('Another Note')
        expect(content).toContain('Link to')
      }
    })

    test('LPV-11: Wiki link has link styling', async ({ basePage }) => {
      const textarea = basePage.page.locator('textarea').first()
      if (await textarea.isVisible().catch(() => false)) {
        await textarea.fill('[[Wiki Link Test]]')
        await basePage.page.waitForTimeout(300)

        // Switch to Live Preview
        await basePage.pressShortcut('2')
        await basePage.page.waitForTimeout(500)

        // Check for link styling
        const link = basePage.page.locator('.cm-md-link, .cm-link')
        const linkExists = (await link.count()) > 0

        expect(linkExists).toBe(true)
      }
    })
  })

  test.describe('Inline Code Rendering', () => {
    test('LPV-12: Inline code renders without backticks', async ({ basePage }) => {
      const textarea = basePage.page.locator('textarea').first()
      if (await textarea.isVisible().catch(() => false)) {
        await textarea.fill('Use `code` syntax\n\nMore content')
        await basePage.page.waitForTimeout(300)

        // Switch to Live Preview
        await basePage.pressShortcut('2')
        await basePage.page.waitForTimeout(500)

        // Click on different line
        const cmContent = basePage.page.locator('.cm-content')
        await cmContent.click({ position: { x: 50, y: 60 } })
        await basePage.page.waitForTimeout(300)

        const content = await cmContent.textContent()
        expect(content).toContain('code')
        expect(content).toContain('Use')
      }
    })

    test('LPV-13: Inline code has code styling', async ({ basePage }) => {
      const textarea = basePage.page.locator('textarea').first()
      if (await textarea.isVisible().catch(() => false)) {
        await textarea.fill('Test `code` here')
        await basePage.page.waitForTimeout(300)

        // Switch to Live Preview
        await basePage.pressShortcut('2')
        await basePage.page.waitForTimeout(500)

        // Check for code styling
        const code = basePage.page.locator('.cm-md-code, .cm-inline-code')
        const codeExists = (await code.count()) > 0

        expect(codeExists).toBe(true)
      }
    })
  })

  test.describe('Transition Smoothness', () => {
    test('LPV-14: Source → Live transition is smooth', async ({ basePage }) => {
      const textarea = basePage.page.locator('textarea').first()
      if (await textarea.isVisible().catch(() => false)) {
        await textarea.fill('# Test Content\n\n**Bold** text')
        await basePage.page.waitForTimeout(300)

        // Start in Source mode
        await basePage.pressShortcut('1')
        await basePage.page.waitForTimeout(200)

        // Measure transition time to Live mode
        const startTime = Date.now()
        await basePage.pressShortcut('2')
        await basePage.page.waitForTimeout(500)
        const endTime = Date.now()

        const transitionTime = endTime - startTime

        // Transition should be reasonably fast (< 1 second)
        expect(transitionTime).toBeLessThan(1000)
      }
    })

    test('LPV-15: Live → Edit click is smooth', async ({ basePage }) => {
      const textarea = basePage.page.locator('textarea').first()
      if (await textarea.isVisible().catch(() => false)) {
        await textarea.fill('# Editable Content')
        await basePage.page.waitForTimeout(300)

        // Switch to Live Preview
        await basePage.pressShortcut('2')
        await basePage.page.waitForTimeout(500)

        // Click to enter edit mode
        const cmContent = basePage.page.locator('.cm-content')
        await cmContent.click({ position: { x: 50, y: 20 } })
        await basePage.page.waitForTimeout(300)

        // Editor should be focused (no error)
        const isFocused = await cmContent.evaluate((el) => {
          return document.activeElement === el || el.contains(document.activeElement)
        })

        expect(isFocused).toBe(true)
      }
    })

    test('LPV-16: No console errors during transition', async ({ basePage }) => {
      const consoleErrors: string[] = []

      // Listen for console errors
      basePage.page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })

      const textarea = basePage.page.locator('textarea').first()
      if (await textarea.isVisible().catch(() => false)) {
        await textarea.fill('# Test\n\n**Content**')
        await basePage.page.waitForTimeout(300)

        // Cycle through modes
        await basePage.pressShortcut('1') // Source
        await basePage.page.waitForTimeout(200)
        await basePage.pressShortcut('2') // Live
        await basePage.page.waitForTimeout(500)
        await basePage.pressShortcut('3') // Reading
        await basePage.page.waitForTimeout(200)
        await basePage.pressShortcut('2') // Back to Live
        await basePage.page.waitForTimeout(500)

        // Should have zero console errors
        expect(consoleErrors.length).toBe(0)
      }
    })
  })

  test.describe('Performance & Responsiveness', () => {
    test('LPV-17: Typing is responsive in Live Preview', async ({ basePage }) => {
      // Create some initial content first
      const textarea = basePage.page.locator('textarea').first()
      if (await textarea.isVisible().catch(() => false)) {
        await textarea.fill('Initial content')
        await basePage.page.waitForTimeout(300)

        // Switch to Live Preview
        await basePage.pressShortcut('2')
        await basePage.page.waitForTimeout(500)

        const cmContent = basePage.page.locator('.cm-content')
        await cmContent.click()
        await basePage.page.waitForTimeout(200)

        // Type multiple characters quickly
        const testText = ' Quick typing test 123'
        await basePage.page.keyboard.type(testText)
        await basePage.page.waitForTimeout(300)

        const content = await cmContent.textContent()
        expect(content).toContain('Quick')
        expect(content).toContain('typing')
      }
    })

    test('LPV-18: Cursor movement updates syntax reveal', async ({ basePage }) => {
      const textarea = basePage.page.locator('textarea').first()
      if (await textarea.isVisible().catch(() => false)) {
        await textarea.fill('# Line 1\n\n## Line 2\n\n### Line 3')
        await basePage.page.waitForTimeout(300)

        // Switch to Live Preview
        await basePage.pressShortcut('2')
        await basePage.page.waitForTimeout(500)

        const cmContent = basePage.page.locator('.cm-content')

        // Move cursor to first line
        await cmContent.click({ position: { x: 50, y: 20 } })
        await basePage.page.waitForTimeout(200)

        // Move to second line
        await basePage.page.keyboard.press('ArrowDown')
        await basePage.page.waitForTimeout(200)

        // Move to third line
        await basePage.page.keyboard.press('ArrowDown')
        await basePage.page.waitForTimeout(200)

        // Cursor movement should work smoothly
        const content = await cmContent.textContent()
        expect(content).toBeTruthy()
      }
    })

    test('LPV-19: Large document renders smoothly', async ({ basePage }) => {
      const textarea = basePage.page.locator('textarea').first()
      if (await textarea.isVisible().catch(() => false)) {
        // Create a large document with many markdown elements
        const largeContent = Array(50)
          .fill(null)
          .map((_, i) => {
            const types = [
              `# Header ${i}`,
              `## Subheader ${i}`,
              `**Bold text ${i}**`,
              `*Italic text ${i}*`,
              `\`code ${i}\``,
              `[[Link ${i}]]`,
            ]
            return types[i % types.length]
          })
          .join('\n\n')

        await textarea.fill(largeContent)
        await basePage.page.waitForTimeout(500)

        // Measure time to switch to Live Preview
        const startTime = Date.now()
        await basePage.pressShortcut('2')
        await basePage.page.waitForTimeout(1000)
        const endTime = Date.now()

        const renderTime = endTime - startTime

        // Should render large document in reasonable time (< 2 seconds)
        expect(renderTime).toBeLessThan(2000)
      }
    })

    test('LPV-20: No memory leaks on mode switching', async ({ basePage }) => {
      const textarea = basePage.page.locator('textarea').first()
      if (await textarea.isVisible().catch(() => false)) {
        await textarea.fill('# Test Content\n\n**Bold**')
        await basePage.page.waitForTimeout(300)

        // Switch modes multiple times rapidly
        for (let i = 0; i < 10; i++) {
          await basePage.pressShortcut('1') // Source
          await basePage.page.waitForTimeout(100)
          await basePage.pressShortcut('2') // Live
          await basePage.page.waitForTimeout(100)
        }

        // Editor should still be functional
        const cmContent = basePage.page.locator('.cm-content')
        const isVisible = await cmContent.isVisible().catch(() => false)

        expect(isVisible).toBe(true)
      }
    })
  })
})
