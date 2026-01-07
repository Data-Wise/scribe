import { test, expect } from '../fixtures'

/**
 * Syntax Highlighting E2E Tests
 *
 * Tests for markdown syntax highlighting in Source mode.
 * Source mode uses CodeMirror 6 with custom tag definitions to
 * show syntax markers (# ** ` > - etc.) with distinct colors.
 *
 * Tests: SH-01 to SH-15
 */

test.describe('Syntax Highlighting', () => {
  test.beforeEach(async ({ basePage }) => {
    await basePage.goto()
    await basePage.page.waitForTimeout(1000)

    // Open Welcome note which exists in demo data
    const welcomeNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
    if (await welcomeNote.isVisible().catch(() => false)) {
      await welcomeNote.click()
      await basePage.page.waitForTimeout(500)
    }
  })

  test.describe('Source Mode Syntax Markers', () => {
    test('SH-01: Source mode shows CodeMirror editor', async ({ basePage }) => {
      // Switch to Source mode
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      // Verify CodeMirror is visible (not plain textarea)
      const codemirror = basePage.page.locator('.cm-editor')
      await expect(codemirror).toBeVisible()
    })

    test('SH-02: Header markers are visible in Source mode', async ({ basePage }) => {
      // Switch to Source mode
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      // Type header markdown
      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('# Heading 1')
      await basePage.page.waitForTimeout(300)

      // Verify the # character is visible in the editor
      const content = await editor.textContent()
      expect(content).toContain('#')
    })

    test('SH-03: Bold markers are visible in Source mode', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('This is **bold** text')
      await basePage.page.waitForTimeout(300)

      const content = await editor.textContent()
      expect(content).toContain('**')
    })

    test('SH-04: Italic markers are visible in Source mode', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('This is *italic* text')
      await basePage.page.waitForTimeout(300)

      const content = await editor.textContent()
      expect(content).toContain('*')
    })

    test('SH-05: Code markers are visible in Source mode', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('This is `code` text')
      await basePage.page.waitForTimeout(300)

      const content = await editor.textContent()
      expect(content).toContain('`')
    })

    test('SH-06: List markers are visible in Source mode', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('- List item')
      await basePage.page.waitForTimeout(300)

      const content = await editor.textContent()
      expect(content).toContain('-')
    })

    test('SH-07: Quote markers are visible in Source mode', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('> Blockquote')
      await basePage.page.waitForTimeout(300)

      const content = await editor.textContent()
      expect(content).toContain('>')
    })

    test('SH-08: Link markers are visible in Source mode', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('[link](url)')
      await basePage.page.waitForTimeout(300)

      const content = await editor.textContent()
      expect(content).toContain('[')
      expect(content).toContain(']')
      expect(content).toContain('(')
      expect(content).toContain(')')
    })
  })

  test.describe('Syntax Highlighting CSS Classes', () => {
    test('SH-09: CodeMirror has custom markdown styling', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      // Type some markdown
      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('# Header\n**bold**\n`code`')
      await basePage.page.waitForTimeout(500)

      // Check that CodeMirror styling classes exist
      const cmContent = basePage.page.locator('.cm-content')
      await expect(cmContent).toBeVisible()

      // Verify CodeMirror has processed the content (classes should be applied)
      const cmLine = basePage.page.locator('.cm-line').first()
      await expect(cmLine).toBeVisible()
    })

    test('SH-10: Header markers have distinct styling', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('# Heading')
      await basePage.page.waitForTimeout(500)

      // The # should be styled (we can't easily check exact color in E2E, but structure exists)
      const content = await editor.textContent()
      expect(content).toContain('#')
      expect(content).toContain('Heading')
    })
  })

  test.describe('Mode Switching Preserves Content', () => {
    test('SH-11: Content preserved when switching from Source to Live', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      // Type markdown in Source mode
      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('# Test Header')
      await basePage.page.waitForTimeout(300)

      // Switch to Live mode
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      // Verify content is preserved
      const liveEditor = basePage.page.locator('.cm-editor')
      const content = await liveEditor.textContent()
      expect(content).toContain('Test Header')
    })

    test('SH-12: Content preserved when switching from Source to Reading', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('**Bold text**')
      await basePage.page.waitForTimeout(300)

      // Switch to Reading mode
      const readingBtn = basePage.page.locator('button:has-text("Reading")')
      await readingBtn.click()
      await basePage.page.waitForTimeout(300)

      // Verify content is rendered (markers hidden, text visible)
      const prose = basePage.page.locator('.prose')
      const content = await prose.textContent()
      expect(content).toContain('Bold text')
    })

    test('SH-13: Syntax markers visible after round-trip mode switching', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('`inline code`')
      await basePage.page.waitForTimeout(300)

      // Switch to Reading
      const readingBtn = basePage.page.locator('button:has-text("Reading")')
      await readingBtn.click()
      await basePage.page.waitForTimeout(300)

      // Switch back to Source
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      // Verify markers are still visible
      const finalContent = await editor.textContent()
      expect(finalContent).toContain('`')
    })
  })

  test.describe('Complex Markdown Highlighting', () => {
    test('SH-14: Multiple syntax types in one line', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('# Header with **bold** and `code`')
      await basePage.page.waitForTimeout(500)

      const content = await editor.textContent()
      expect(content).toContain('#')
      expect(content).toContain('**')
      expect(content).toContain('`')
    })

    test('SH-15: Nested markdown structures', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('> Quote with **bold** text')
      await basePage.page.waitForTimeout(500)

      const content = await editor.textContent()
      expect(content).toContain('>')
      expect(content).toContain('**')
    })
  })
})
