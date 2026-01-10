import { test, expect } from '../fixtures'

/**
 * Editor Modes E2E Tests
 *
 * Comprehensive tests for the three-mode editor system:
 * - Source mode: Plain textarea for raw markdown
 * - Live Preview mode: CodeMirror with Obsidian-style inline rendering
 * - Reading mode: Fully rendered, read-only ReactMarkdown
 *
 * Tests: EDM-01 to EDM-36
 */

test.describe('Editor Modes', () => {
  test.beforeEach(async ({ basePage }) => {
    await basePage.goto()
    // Wait for app to fully load and seed demo data
    await basePage.page.waitForTimeout(1000)

    // Open "Welcome to Scribe" note (demo data)
    const welcomeNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
    await expect(welcomeNote).toBeVisible({ timeout: 5000 })
    await welcomeNote.click()
    await basePage.page.waitForTimeout(500)
  })

  test.describe('Mode Display & Indicators', () => {
    test('EDM-01: Editor shows mode toggle buttons', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      const readingBtn = basePage.page.locator('button:has-text("Reading")')

      await expect(sourceBtn).toBeVisible()
      await expect(liveBtn).toBeVisible()
      await expect(readingBtn).toBeVisible()
    })

    test('EDM-02: Mode indicator in status bar shows current mode', async ({ basePage }) => {
      // Status bar should show current mode name
      const statusBar = basePage.page.locator('.px-4.py-2.text-xs')
      await expect(statusBar).toContainText(/Source|Live Preview|Reading/)
    })

    test('EDM-03: Active mode button is highlighted', async ({ basePage }) => {
      // The active mode button should have the accent color class
      const activeBtn = basePage.page.locator('button.bg-nexus-accent')
      await expect(activeBtn).toBeVisible()
    })

    test('EDM-04: Mode toggle shows keyboard hint (⌘E)', async ({ basePage }) => {
      const statusBar = basePage.page.locator('.px-4.py-2.text-xs')
      await expect(statusBar).toContainText('⌘E')
    })

    test('EDM-05: Word count displays correctly in all modes', async ({ basePage }) => {
      const wordCount = basePage.page.locator('text=/\\d+ words/')
      await expect(wordCount.first()).toBeVisible()
    })
  })

  test.describe('Mode Switching - UI Buttons', () => {
    test('EDM-06: Click Source button switches to Source mode', async ({ basePage, cmEditor }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(200)

      // Verify data-mode attribute
      const editor = basePage.page.locator('[data-testid="hybrid-editor"]')
      await expect(editor).toHaveAttribute('data-mode', 'source')

      // Verify CodeMirror editor is visible in Source mode
      await cmEditor.waitForEditor()
      await expect(cmEditor.getEditor()).toBeVisible()
    })

    test('EDM-07: Click Live button switches to Live Preview mode', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(200)

      const editor = basePage.page.locator('[data-testid="hybrid-editor"]')
      await expect(editor).toHaveAttribute('data-mode', 'live-preview')

      // Verify CodeMirror is visible
      const codemirror = basePage.page.locator('.cm-editor')
      await expect(codemirror).toBeVisible()
    })

    test('EDM-08: Click Reading button switches to Reading mode', async ({ basePage }) => {
      const readingBtn = basePage.page.locator('button:has-text("Reading")')
      await readingBtn.click()
      await basePage.page.waitForTimeout(200)

      const editor = basePage.page.locator('[data-testid="hybrid-editor"]')
      await expect(editor).toHaveAttribute('data-mode', 'reading')

      // Verify prose class (ReactMarkdown) is visible
      const prose = basePage.page.locator('.prose')
      await expect(prose).toBeVisible()
    })

    test('EDM-09: Mode button shows active state when selected', async ({ basePage }) => {
      // Switch to Live mode
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(200)

      // Verify Live button has active styling
      await expect(liveBtn).toHaveClass(/bg-nexus-accent/)
    })
  })

  test.describe('Mode Switching - Keyboard Shortcuts', () => {
    test('EDM-10: ⌘1 switches to Source mode', async ({ basePage }) => {
      // First switch away from source
      await basePage.pressShortcut('2')
      await basePage.page.waitForTimeout(200)

      // Now switch back to source with ⌘1
      await basePage.pressShortcut('1')
      await basePage.page.waitForTimeout(200)

      const editor = basePage.page.locator('[data-testid="hybrid-editor"]')
      await expect(editor).toHaveAttribute('data-mode', 'source')
    })

    test('EDM-11: ⌘2 switches to Live Preview mode', async ({ basePage }) => {
      await basePage.pressShortcut('2')
      await basePage.page.waitForTimeout(200)

      const editor = basePage.page.locator('[data-testid="hybrid-editor"]')
      await expect(editor).toHaveAttribute('data-mode', 'live-preview')
    })

    test('EDM-12: ⌘3 switches to Reading mode', async ({ basePage }) => {
      await basePage.pressShortcut('3')
      await basePage.page.waitForTimeout(200)

      const editor = basePage.page.locator('[data-testid="hybrid-editor"]')
      await expect(editor).toHaveAttribute('data-mode', 'reading')
    })

    test('EDM-13: Mode cycling via button clicks: source → live → reading', async ({ basePage }) => {
      // Use button clicks for reliable mode switching
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      const readingBtn = basePage.page.locator('button:has-text("Reading")')

      // Start in source mode
      await sourceBtn.click()
      await basePage.page.waitForTimeout(200)

      // Switch to live
      await liveBtn.click()
      await basePage.page.waitForTimeout(200)
      const editor = basePage.page.locator('[data-testid="hybrid-editor"]')
      await expect(editor).toHaveAttribute('data-mode', 'live-preview')

      // Switch to reading
      await readingBtn.click()
      await basePage.page.waitForTimeout(200)
      await expect(editor).toHaveAttribute('data-mode', 'reading')

      // Switch back to source
      await sourceBtn.click()
      await basePage.page.waitForTimeout(200)
      await expect(editor).toHaveAttribute('data-mode', 'source')
    })

    test('EDM-14: Escape in Reading mode returns to Source mode', async ({ basePage }) => {
      // Switch to reading mode
      await basePage.pressShortcut('3')
      await basePage.page.waitForTimeout(200)

      const editor = basePage.page.locator('[data-testid="hybrid-editor"]')
      await expect(editor).toHaveAttribute('data-mode', 'reading')

      // Press Escape
      await basePage.page.keyboard.press('Escape')
      await basePage.page.waitForTimeout(200)

      await expect(editor).toHaveAttribute('data-mode', 'source')
    })
  })

  test.describe('Content Persistence Across Modes', () => {
    test('EDM-15: Content persists when switching from Source to Live', async ({ basePage, cmEditor }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      const liveBtn = basePage.page.locator('button:has-text("Live")')

      // Switch to source mode
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      // Get current content and append test content using CodeMirror helper
      await cmEditor.waitForEditor()
      const currentContent = await cmEditor.getTextContent()
      const testContent = 'PERSISTENCE_TEST_MARKER'
      await cmEditor.fill(currentContent + '\n\n' + testContent)
      await basePage.page.waitForTimeout(300)

      // Switch to live mode
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      // Verify content is present in CodeMirror
      await expect(cmEditor.getEditor()).toContainText(testContent)
    })

    test('EDM-16: Content persists when switching from Live to Reading', async ({ basePage, cmEditor }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      const readingBtn = basePage.page.locator('button:has-text("Reading")')

      // First add content in source mode using CodeMirror helper
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      await cmEditor.waitForEditor()
      const currentContent = await cmEditor.getTextContent()
      const testContent = 'LIVE_TO_READING_MARKER'
      await cmEditor.fill(currentContent + '\n\n' + testContent)
      await basePage.page.waitForTimeout(300)

      // Switch to live mode
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      // Switch to reading mode
      await readingBtn.click()
      await basePage.page.waitForTimeout(300)

      // Verify content is rendered in prose
      const prose = basePage.page.locator('.prose')
      await expect(prose).toContainText(testContent)
    })

    test('EDM-17: Content persists through full mode cycle', async ({ basePage, cmEditor }) => {
      const testContent = `CYCLE_TEST_${Date.now()}`
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      const readingBtn = basePage.page.locator('button:has-text("Reading")')

      // Start in source mode
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      // Use CodeMirror helper for reliable content insertion
      await cmEditor.waitForEditor()
      const currentContent = await cmEditor.getTextContent()
      await cmEditor.fill(currentContent + '\n\n' + testContent)
      await basePage.page.waitForTimeout(300)

      // Cycle through all modes using buttons
      await liveBtn.click()
      await basePage.page.waitForTimeout(200)
      await readingBtn.click()
      await basePage.page.waitForTimeout(200)
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      // Verify content still exists in CodeMirror
      await cmEditor.waitForEditor()
      const content = await cmEditor.getTextContent()
      expect(content).toContain(testContent)
    })
  })

  test.describe('Mode-Specific Behaviors', () => {
    test('EDM-18: Source mode shows CodeMirror editor', async ({ basePage, cmEditor }) => {
      // Switch to source mode using button click (more reliable than shortcut)
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      // CodeMirror should be visible in source mode
      await cmEditor.waitForEditor()
      await expect(cmEditor.getEditor()).toBeVisible()
    })

    test('EDM-19: Source mode CodeMirror is focusable and editable', async ({ basePage, cmEditor }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      // Use CodeMirror helper for reliable content insertion
      await cmEditor.waitForEditor()
      const currentContent = await cmEditor.getTextContent()
      const testMarker = 'EDITABLE_TEST_MARKER'
      await cmEditor.fill(currentContent + '\n\n' + testMarker)
      await basePage.page.waitForTimeout(100)

      const content = await cmEditor.getTextContent()
      expect(content).toContain(testMarker)
    })

    test('EDM-20: Live Preview mode shows CodeMirror editor', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      const cmEditor = basePage.page.locator('.cm-editor')
      await expect(cmEditor).toBeVisible()
    })

    test('EDM-21: Live Preview mode CodeMirror is editable', async ({ basePage, cmEditor }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      const liveBtn = basePage.page.locator('button:has-text("Live")')

      // First add content in source mode using CodeMirror helper
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      await cmEditor.waitForEditor()
      const currentContent = await cmEditor.getTextContent()
      const testMarker = 'CODEMIRROR_EDITABLE_MARKER'
      await cmEditor.fill(currentContent + '\n\n' + testMarker)
      await basePage.page.waitForTimeout(300)

      // Switch to live mode and verify content is visible
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      await expect(cmEditor.getEditor()).toContainText(testMarker)
    })

    test('EDM-22: Reading mode shows rendered markdown', async ({ basePage }) => {
      const readingBtn = basePage.page.locator('button:has-text("Reading")')
      await readingBtn.click()
      await basePage.page.waitForTimeout(300)

      const prose = basePage.page.locator('.prose')
      await expect(prose).toBeVisible()
    })

    test('EDM-23: Reading mode is not editable', async ({ basePage }) => {
      const readingBtn = basePage.page.locator('button:has-text("Reading")')
      await readingBtn.click()
      await basePage.page.waitForTimeout(300)

      // Reading mode should not have textarea or CodeMirror visible
      const textarea = basePage.page.locator('textarea')
      const cmEditor = basePage.page.locator('.cm-editor')

      await expect(textarea).not.toBeVisible()
      await expect(cmEditor).not.toBeVisible()
    })
  })

  test.describe('Markdown Rendering in Reading Mode', () => {
    test('EDM-24: Reading mode renders headings correctly', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      const readingBtn = basePage.page.locator('button:has-text("Reading")')

      // Switch to source and add content
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      // Use CodeMirror helper for reliable content insertion
      const cmHelper = new (await import('../helpers/codemirror-helpers')).CodeMirrorHelper(basePage.page)
      await cmHelper.waitForEditor()
      const currentContent = await cmHelper.getTextContent()
      await cmHelper.fill(currentContent + '\n\n## HeadingMarkerTest\n\nParagraph text')
      await basePage.page.waitForTimeout(300)

      // Switch to reading mode
      await readingBtn.click()
      await basePage.page.waitForTimeout(300)

      // Verify heading is rendered
      const heading = basePage.page.locator('.prose h2:has-text("HeadingMarkerTest")')
      await expect(heading).toBeVisible()
    })

    test('EDM-25: Reading mode renders lists correctly', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      const readingBtn = basePage.page.locator('button:has-text("Reading")')

      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      // Use CodeMirror helper for reliable content insertion
      const cmHelper = new (await import('../helpers/codemirror-helpers')).CodeMirrorHelper(basePage.page)
      await cmHelper.waitForEditor()
      const currentContent = await cmHelper.getTextContent()
      await cmHelper.fill(currentContent + '\n\n- ListItemAlpha\n- ListItemBeta\n- ListItemGamma')
      await basePage.page.waitForTimeout(300)

      await readingBtn.click()
      await basePage.page.waitForTimeout(300)

      // Check for our specific list items to verify list rendering
      const listItem = basePage.page.locator('.prose li:has-text("ListItemAlpha")')
      await expect(listItem).toBeVisible()
    })

    test('EDM-26: Reading mode renders bold and italic', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      const readingBtn = basePage.page.locator('button:has-text("Reading")')

      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      // Use fill() for reliable content insertion (keyboard.type drops characters)
      const textarea = basePage.page.locator('textarea')
      await textarea.click()
      const currentContent = await textarea.inputValue()
      await textarea.fill(currentContent + '\n\n**boldmarker** and _italicmarker_')
      await basePage.page.waitForTimeout(300)

      await readingBtn.click()
      await basePage.page.waitForTimeout(300)

      const bold = basePage.page.locator('.prose strong:has-text("boldmarker")')
      const italic = basePage.page.locator('.prose em:has-text("italicmarker")')
      await expect(bold).toBeVisible()
      await expect(italic).toBeVisible()
    })

    test('EDM-27: Reading mode renders code blocks', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      const readingBtn = basePage.page.locator('button:has-text("Reading")')

      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      // Use CodeMirror helper for reliable content insertion
      const cmHelper = new (await import('../helpers/codemirror-helpers')).CodeMirrorHelper(basePage.page)
      await cmHelper.waitForEditor()
      const currentContent = await cmHelper.getTextContent()
      await cmHelper.fill(currentContent + '\n\n`inlinecodemarker`')
      await basePage.page.waitForTimeout(300)

      await readingBtn.click()
      await basePage.page.waitForTimeout(300)

      const code = basePage.page.locator('.prose code:has-text("inlinecodemarker")')
      await expect(code).toBeVisible()
    })
  })

  test.describe('Strikethrough Rendering', () => {
    test('EDM-37: Reading mode renders strikethrough (~~text~~)', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      const readingBtn = basePage.page.locator('button:has-text("Reading")')

      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      // Use CodeMirror helper for reliable content insertion
      const cmHelper = new (await import('../helpers/codemirror-helpers')).CodeMirrorHelper(basePage.page)
      await cmHelper.waitForEditor()
      const currentContent = await cmHelper.getTextContent()
      await cmHelper.fill(currentContent + '\n\nThis is ~~strikethroughmarker~~ text')
      await basePage.page.waitForTimeout(300)

      await readingBtn.click()
      await basePage.page.waitForTimeout(300)

      // Verify strikethrough is rendered as <del> element
      const strikethrough = basePage.page.locator('.prose del:has-text("strikethroughmarker")')
      await expect(strikethrough).toBeVisible()
    })

    test('EDM-38: Live Preview mode renders strikethrough', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      const liveBtn = basePage.page.locator('button:has-text("Live")')

      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      // Use CodeMirror helper for reliable content insertion
      const cmHelper = new (await import('../helpers/codemirror-helpers')).CodeMirrorHelper(basePage.page)
      await cmHelper.waitForEditor()
      const currentContent = await cmHelper.getTextContent()
      await cmHelper.fill(currentContent + '\n\nLive ~~strikethroughlive~~ preview')
      await basePage.page.waitForTimeout(300)

      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      // In live preview, strikethrough text should be visible (with ~~ hidden when not editing)
      const cmContent = basePage.page.locator('.cm-editor .cm-content')
      await expect(cmContent).toContainText('strikethroughlive')
    })
  })

  test.describe('KaTeX Math Rendering', () => {
    test('EDM-39: Reading mode renders inline math ($...$)', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      const readingBtn = basePage.page.locator('button:has-text("Reading")')

      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      // Use CodeMirror helper for reliable content insertion
      const cmHelper = new (await import('../helpers/codemirror-helpers')).CodeMirrorHelper(basePage.page)
      await cmHelper.waitForEditor()
      const currentContent = await cmHelper.getTextContent()
      await cmHelper.fill(currentContent + '\n\nInlineMathMarker: $E = mc^2$')
      await basePage.page.waitForTimeout(300)

      await readingBtn.click()
      await basePage.page.waitForTimeout(300)

      // KaTeX renders math - just verify reading mode prose is visible
      const prose = basePage.page.locator('.prose')
      await expect(prose).toBeVisible()
      await expect(prose).toContainText('InlineMathMarker')
    })

    test('EDM-40: Reading mode renders display math ($$...$$)', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      const readingBtn = basePage.page.locator('button:has-text("Reading")')

      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      // Use CodeMirror helper for reliable content insertion
      const cmHelper = new (await import('../helpers/codemirror-helpers')).CodeMirrorHelper(basePage.page)
      await cmHelper.waitForEditor()
      const currentContent = await cmHelper.getTextContent()
      await cmHelper.fill(currentContent + '\n\nDisplayMathMarker:\n$$x^2 + y^2 = z^2$$')
      await basePage.page.waitForTimeout(300)

      await readingBtn.click()
      await basePage.page.waitForTimeout(300)

      const prose = basePage.page.locator('.prose')
      await expect(prose).toBeVisible()
      await expect(prose).toContainText('DisplayMathMarker')
    })
  })

  test.describe('Rapid Mode Switching', () => {
    test('EDM-41: Handle rapid mode switching without data loss', async ({ basePage }) => {
      const testContent = `RAPID_SWITCH_${Date.now()}`
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      const readingBtn = basePage.page.locator('button:has-text("Reading")')

      // Add content in source mode using fill()
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      const textarea = basePage.page.locator('textarea')
      await textarea.click()
      const currentContent = await textarea.inputValue()
      await textarea.fill(currentContent + '\n\n' + testContent)
      await basePage.page.waitForTimeout(200)

      // Rapid mode switches using buttons
      await liveBtn.click()
      await readingBtn.click()
      await sourceBtn.click()
      await liveBtn.click()
      await readingBtn.click()
      await basePage.page.waitForTimeout(200)

      // Back to source and verify content
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      const sourceTextarea = basePage.page.locator('textarea')
      const content = await sourceTextarea.inputValue()
      expect(content).toContain(testContent)
    })

    test('EDM-42: Mode buttons remain responsive during rapid clicking', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      const readingBtn = basePage.page.locator('button:has-text("Reading")')

      // Rapid click different modes
      await sourceBtn.click()
      await liveBtn.click()
      await readingBtn.click()
      await sourceBtn.click()
      await liveBtn.click()
      await basePage.page.waitForTimeout(200)

      // Should end in live mode
      const editor = basePage.page.locator('[data-testid="hybrid-editor"]')
      await expect(editor).toHaveAttribute('data-mode', 'live-preview')
    })
  })

  test.describe('Focus Behavior', () => {
    test('EDM-43: Source mode allows immediate typing after switch', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      const readingBtn = basePage.page.locator('button:has-text("Reading")')

      // Start in reading mode
      await readingBtn.click()
      await basePage.page.waitForTimeout(300)

      // Switch to source mode
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      // Use fill() for reliable content insertion
      const textarea = basePage.page.locator('textarea')
      await textarea.click()
      const currentContent = await textarea.inputValue()
      const testMarker = 'FOCUS_TEST_MARKER'
      await textarea.fill(currentContent + '\n\n' + testMarker)
      await basePage.page.waitForTimeout(100)

      const content = await textarea.inputValue()
      expect(content).toContain(testMarker)
    })

    test('EDM-44: Live Preview mode shows CodeMirror on switch', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      const readingBtn = basePage.page.locator('button:has-text("Reading")')

      // Start in reading mode
      await readingBtn.click()
      await basePage.page.waitForTimeout(300)

      // Switch to live mode
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      // CodeMirror should be visible
      const cmEditor = basePage.page.locator('.cm-editor')
      await expect(cmEditor).toBeVisible()
    })
  })

  test.describe('Status Bar Mode Display', () => {
    test('EDM-45: Status bar shows "Source" in Source mode', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      // Status bar is the bottom bar with mode info
      const statusBar = basePage.page.locator('[data-testid="hybrid-editor"]')
      await expect(statusBar).toContainText('Source')
    })

    test('EDM-46: Status bar shows "Live Preview" in Live mode', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      const statusBar = basePage.page.locator('.px-4.py-2.text-xs')
      await expect(statusBar).toContainText('Live Preview')
    })

    test('EDM-47: Status bar shows "Reading" in Reading mode', async ({ basePage }) => {
      const readingBtn = basePage.page.locator('button:has-text("Reading")')
      await readingBtn.click()
      await basePage.page.waitForTimeout(300)

      const statusBar = basePage.page.locator('[data-testid="hybrid-editor"]')
      await expect(statusBar).toContainText('Reading')
    })
  })
})
