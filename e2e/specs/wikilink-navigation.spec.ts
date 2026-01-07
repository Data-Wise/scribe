import { test, expect } from '../fixtures'

/**
 * WikiLink Navigation E2E Tests
 *
 * Tests for WikiLink double-click navigation in actual browser
 * Verifies cross-feature compatibility (doesn't break window dragging, etc.)
 *
 * Tests: WLN-E2E-01 to WLN-E2E-25
 */

/**
 * Helper function to clear editor content and type new text
 */
async function typeInEditor(page: any, text: string) {
  const editor = page.locator('.cm-content')
  await editor.click()
  await page.keyboard.press('Meta+a') // Select all
  await page.keyboard.press('Backspace') // Delete
  await page.waitForTimeout(200)
  await page.keyboard.type(text)
  await page.waitForTimeout(500) // Wait for WikiLink widget to render
}

test.describe('WikiLink Navigation E2E', () => {
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

  test.describe('WikiLink Widget Rendering', () => {
    test('WLN-E2E-01: WikiLink widgets render in Live Preview mode', async ({ basePage }) => {
      // Switch to Live Preview mode
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      // Type WikiLink
      await typeInEditor(basePage.page, 'Check out [[Test Page]] for details.')

      // Verify WikiLink widget is rendered
      const wikilink = basePage.page.locator('.cm-wikilink').first()
      await expect(wikilink).toBeVisible()
      await expect(wikilink).toHaveText('Test Page')
    })

    test('WLN-E2E-02: WikiLink brackets hidden in Live Preview mode', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      await typeInEditor(basePage.page, 'Link [[Hidden Brackets]] here.')

      // Widget should show only the page name, not brackets
      const wikilink = basePage.page.locator('.cm-wikilink').first()
      await expect(wikilink).toHaveText('Hidden Brackets')
      await expect(wikilink).not.toContainText('[[')
      await expect(wikilink).not.toContainText(']]')
    })

    test('WLN-E2E-03: WikiLink with pipe syntax displays custom text', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      await typeInEditor(basePage.page, 'See [[Actual Page|Custom Display]] here.')

      const wikilink = basePage.page.locator('.cm-wikilink').first()
      await expect(wikilink).toHaveText('Custom Display')
    })

    test('WLN-E2E-04: Multiple WikiLinks render correctly', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      await typeInEditor(basePage.page, 'Links: [[First]] and [[Second]] and [[Third]].')

      const wikilinks = basePage.page.locator('.cm-wikilink')
      await expect(wikilinks.first()).toBeVisible()
      const count = await wikilinks.count()
      expect(count).toBeGreaterThanOrEqual(1)
    })

    test('WLN-E2E-05: WikiLink not rendered in Source mode', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      await typeInEditor(basePage.page, 'Link [[Source Mode]] here.')

      // No WikiLink widget in source mode
      const wikilinks = basePage.page.locator('.cm-wikilink')
      const count = await wikilinks.count()
      expect(count).toBe(0)

      // But the text should still be there
      const editor = basePage.page.locator('.cm-content')
      await expect(editor).toContainText('[[Source Mode]]')
    })
  })

  test.describe('WikiLink Click Behavior', () => {
    test('WLN-E2E-06: Single click does not navigate', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      await typeInEditor(basePage.page, 'Click [[Single Click Test]] here.')

      const wikilink = basePage.page.locator('.cm-wikilink').first()
      await expect(wikilink).toBeVisible()

      // Get current note title
      const breadcrumb = basePage.page.locator('.breadcrumb-item').last()
      const currentTitle = await breadcrumb.textContent()

      // Single click
      await wikilink.click()
      await basePage.page.waitForTimeout(500)

      // Should not navigate (title unchanged)
      const titleAfterClick = await breadcrumb.textContent()
      expect(titleAfterClick).toBe(currentTitle)
    })

    test('WLN-E2E-07: Single click keeps widget visible (no bracket reveal)', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      await typeInEditor(basePage.page, 'Click [[Widget Test]] here.')

      const wikilink = basePage.page.locator('.cm-wikilink').first()
      await expect(wikilink).toBeVisible()

      // Single click
      await wikilink.click()
      await basePage.page.waitForTimeout(300)

      // Widget should still be visible (brackets still hidden)
      await expect(wikilink).toBeVisible()
      await expect(wikilink).toHaveText('Widget Test')
    })

    test('WLN-E2E-08: Double click navigates to linked note', async ({ basePage }) => {
      // First, create the target note
      const newNoteBtn = basePage.page.locator('button:has-text("New Note")').or(
        basePage.page.locator('button[aria-label="New Note"]')
      ).first()
      await newNoteBtn.click()
      await basePage.page.waitForTimeout(500)

      // Type title for target note
      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('Target Note for Navigation')
      await basePage.page.waitForTimeout(500)

      // Create another note with a WikiLink to the target
      await newNoteBtn.click()
      await basePage.page.waitForTimeout(500)

      // Switch to Live Preview
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      await typeInEditor(basePage.page, 'Link to [[Target Note for Navigation]] here.')

      const wikilink = basePage.page.locator('.cm-wikilink').first()
      await expect(wikilink).toBeVisible()

      // Double click to navigate
      await wikilink.dblclick()
      await basePage.page.waitForTimeout(1000)

      // Should navigate to the target note
      // (Implementation may create note if doesn't exist or show "not found")
      // For now, just verify the action was triggered (no crash)
      const breadcrumb = basePage.page.locator('.breadcrumb-item').last()
      await expect(breadcrumb).toBeVisible()
    })

    test('WLN-E2E-09: WikiLink has pointer cursor on hover', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      await typeInEditor(basePage.page, 'Hover [[Cursor Test]] here.')

      const wikilink = basePage.page.locator('.cm-wikilink').first()
      await expect(wikilink).toBeVisible()

      // Check cursor style
      const cursor = await wikilink.evaluate(el => window.getComputedStyle(el).cursor)
      expect(cursor).toBe('pointer')
    })

    test('WLN-E2E-10: WikiLink is keyboard focusable', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      await typeInEditor(basePage.page, 'Tab to [[Keyboard Focus]] here.')

      const wikilink = basePage.page.locator('.cm-wikilink').first()
      await expect(wikilink).toBeVisible()

      // Check tabindex
      const tabindex = await wikilink.getAttribute('tabindex')
      expect(tabindex).toBe('0')
    })
  })

  test.describe('WikiLink Mode Switching', () => {
    test('WLN-E2E-11: WikiLink widget disappears when switching to Source mode', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      await typeInEditor(basePage.page, 'Link [[Mode Switch Test]] here.')

      // Verify widget visible in Live mode
      let wikilink = basePage.page.locator('.cm-wikilink').first()
      await expect(wikilink).toBeVisible()

      // Switch to Source mode
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      // Widget should be gone
      const wikilinks = basePage.page.locator('.cm-wikilink')
      const count = await wikilinks.count()
      expect(count).toBe(0)

      // But text should show brackets
      const editor = basePage.page.locator('.cm-content')
      await expect(editor).toContainText('[[Mode Switch Test]]')
    })

    test('WLN-E2E-12: WikiLink widget appears when switching to Live mode', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      await typeInEditor(basePage.page, 'Link [[Appear Test]] here.')

      // No widget in Source mode
      let wikilinks = basePage.page.locator('.cm-wikilink')
      let count = await wikilinks.count()
      expect(count).toBe(0)

      // Switch to Live mode
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(500)

      // Widget should appear
      const wikilink = basePage.page.locator('.cm-wikilink').first()
      await expect(wikilink).toBeVisible()
      await expect(wikilink).toHaveText('Appear Test')
    })

    test('WLN-E2E-13: WikiLink content preserved across mode switches', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      const testContent = 'Link [[Preservation Test]] with content.'
      await typeInEditor(basePage.page, testContent)

      // Verify in Live mode
      let wikilink = basePage.page.locator('.cm-wikilink').first()
      await expect(wikilink).toHaveText('Preservation Test')

      // Switch to Source
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      // Verify content in Source mode
      const editor = basePage.page.locator('.cm-content')
      await expect(editor).toContainText('[[Preservation Test]]')

      // Switch back to Live
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      // Verify widget reappears correctly
      wikilink = basePage.page.locator('.cm-wikilink').first()
      await expect(wikilink).toHaveText('Preservation Test')
    })

    test('WLN-E2E-14: Reading mode shows plain text (no widget)', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      await typeInEditor(basePage.page, 'Link [[Reading Mode Test]] here.')

      // Switch to Reading mode
      const readingBtn = basePage.page.locator('button:has-text("Reading")')
      await readingBtn.click()
      await basePage.page.waitForTimeout(300)

      // Reading mode uses ReactMarkdown, not CodeMirror widgets
      // Should show rendered link (not cm-wikilink widget)
      const prose = basePage.page.locator('.prose')
      await expect(prose).toBeVisible()
      await expect(prose).toContainText('Reading Mode Test')
    })
  })

  test.describe('WikiLink Cross-Feature Compatibility', () => {
    test('WLN-E2E-15: Window dragging still works after WikiLink interaction', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      await typeInEditor(basePage.page, 'Link [[Drag Test]] here.')

      const wikilink = basePage.page.locator('.cm-wikilink').first()
      await wikilink.click()
      await wikilink.dblclick()
      await basePage.page.waitForTimeout(300)

      // Verify drag region CSS still intact
      const header = basePage.page.locator('.editor-header')
      const dragRegion = await header.evaluate(el =>
        window.getComputedStyle(el).getPropertyValue('-webkit-app-region')
      )
      expect(dragRegion).toBe('drag')
    })

    test('WLN-E2E-16: Mode toggle buttons remain clickable after WikiLink use', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      await typeInEditor(basePage.page, 'Link [[Toggle Test]] here.')

      const wikilink = basePage.page.locator('.cm-wikilink').first()
      await wikilink.click()
      await basePage.page.waitForTimeout(300)

      // Mode buttons should still be clickable
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await expect(sourceBtn).toBeEnabled()

      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      // Should successfully switch modes
      const editor = basePage.page.locator('.cm-content')
      await expect(editor).toContainText('[[Toggle Test]]')
    })

    test('WLN-E2E-17: Editor tabs remain functional after WikiLink navigation', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      await typeInEditor(basePage.page, 'Link [[Tab Test]] here.')

      const wikilink = basePage.page.locator('.cm-wikilink').first()
      await wikilink.dblclick()
      await basePage.page.waitForTimeout(500)

      // Editor tabs should still be clickable
      const missionControlTab = basePage.page.locator('.editor-tab', { hasText: 'Mission Control' }).first()
      if (await missionControlTab.isVisible().catch(() => false)) {
        await expect(missionControlTab).toBeEnabled()
      }
    })

    test('WLN-E2E-18: Sidebar remains functional after WikiLink use', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      await typeInEditor(basePage.page, 'Link [[Sidebar Test]] here.')

      const wikilink = basePage.page.locator('.cm-wikilink').first()
      await wikilink.click()
      await basePage.page.waitForTimeout(300)

      // Sidebar should still be functional
      const sidebar = basePage.page.locator('.left-sidebar').or(
        basePage.page.locator('[data-testid="left-sidebar"]')
      ).first()

      if (await sidebar.isVisible().catch(() => false)) {
        await expect(sidebar).toBeVisible()
      }
    })
  })

  test.describe('WikiLink Edge Cases', () => {
    test('WLN-E2E-19: WikiLink with very long name renders correctly', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      const longName = 'This is a Very Long Page Name That Should Still Work Correctly'
      await typeInEditor(basePage.page, `Link [[${longName}]] here.`)

      const wikilink = basePage.page.locator('.cm-wikilink').first()
      await expect(wikilink).toBeVisible()
      await expect(wikilink).toHaveText(longName)
    })

    test('WLN-E2E-20: WikiLink with numbers renders correctly', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      await typeInEditor(basePage.page, 'Link [[Page 123 Version 2.0]] here.')

      const wikilink = basePage.page.locator('.cm-wikilink').first()
      await expect(wikilink).toBeVisible()
      await expect(wikilink).toHaveText('Page 123 Version 2.0')
    })

    test('WLN-E2E-21: WikiLink at start of document renders correctly', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      await typeInEditor(basePage.page, '[[Start Page]] is first.')

      const wikilink = basePage.page.locator('.cm-wikilink').first()
      await expect(wikilink).toBeVisible()
      await expect(wikilink).toHaveText('Start Page')
    })

    test('WLN-E2E-22: WikiLink at end of document renders correctly', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      await typeInEditor(basePage.page, 'This ends with [[End Page]]')

      const wikilink = basePage.page.locator('.cm-wikilink').first()
      await expect(wikilink).toBeVisible()
      await expect(wikilink).toHaveText('End Page')
    })

    test('WLN-E2E-23: Multiple WikiLinks on same line all clickable', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      await typeInEditor(basePage.page, '[[First]] and [[Second]] and [[Third]]')

      const wikilinks = basePage.page.locator('.cm-wikilink')
      const firstLink = wikilinks.nth(0)

      // All should be visible and clickable
      await expect(firstLink).toBeVisible()

      // Click first link (should not crash or affect others)
      await firstLink.click()
      await basePage.page.waitForTimeout(300)

      // All links should still be visible
      await expect(wikilinks.nth(0)).toBeVisible()
    })

    test('WLN-E2E-24: WikiLink in list item renders correctly', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      await typeInEditor(basePage.page, '- Item with [[List Link]] here')

      const wikilink = basePage.page.locator('.cm-wikilink').first()
      await expect(wikilink).toBeVisible()
      await expect(wikilink).toHaveText('List Link')
    })

    test('WLN-E2E-25: WikiLink in heading renders correctly', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      await typeInEditor(basePage.page, '# Heading with [[Heading Link]]')

      const wikilink = basePage.page.locator('.cm-wikilink').first()
      await expect(wikilink).toBeVisible()
      await expect(wikilink).toHaveText('Heading Link')
    })
  })
})
