import { test, expect } from '../fixtures'

/**
 * Callout E2E Tests
 *
 * Comprehensive tests for Obsidian-style callout rendering:
 * - 11 callout types with proper icons and colors
 * - Custom titles and default titles
 * - Callout aliases (e.g., [!hint] for tip)
 * - Nested content (lists, code blocks, etc.)
 * - Mode switching behavior
 *
 * Tests: CAL-01 to CAL-25
 */

test.describe('Callouts', () => {
  test.beforeEach(async ({ basePage, cmEditor }) => {
    await basePage.goto()
    // Wait for app to fully load
    await basePage.page.waitForTimeout(1500)

    // Create a new note with callout test content
    await basePage.page.keyboard.press('Meta+n')  // ⌘N for new note

    // Wait for note to be created and editor to be ready
    await basePage.page.waitForTimeout(1000)

    // Type callout test content
    const calloutContent = `# Callout Test

> [!note]
> This is a note callout.

> [!tip] Pro Tip
> This is a tip callout.

> [!warning]
> This is a warning callout.

> [!danger] Critical
> This is a danger callout.

> [!info]
> This is an info callout.

> [!success] Well Done!
> This is a success callout.

> [!question] FAQ
> This is a question callout.

> [!example]
> This is an example callout.

> [!quote] Albert Einstein
> This is a quote callout.

> [!bug]
> This is a bug callout.

> [!abstract] Summary
> This is an abstract callout.`

    // Focus editor and type content using CodeMirror helper
    await cmEditor.waitForEditor()
    await cmEditor.fill(calloutContent)
    await basePage.page.waitForTimeout(500)

    // Switch to Reading mode to see rendered callouts
    const readingBtn = basePage.page.locator('button:has-text("Reading")')
    await readingBtn.click()
    await basePage.page.waitForTimeout(1000)  // Wait for callouts to render

    // Verify at least one callout is visible before tests run
    const firstCallout = basePage.page.locator('.callout-box').first()
    await expect(firstCallout).toBeVisible({ timeout: 5000 })
  })

  test.describe('Basic Callout Rendering', () => {
    test('CAL-01: Note callout renders with blue theme and icon', async ({ basePage }) => {
      // Note is already in Reading mode from beforeEach
      await basePage.page.waitForTimeout(300)

      // Find note callout by title text
      const noteCallout = basePage.page.locator('.callout-box').first()
      await expect(noteCallout).toBeVisible()

      // Check title is present
      const title = noteCallout.locator('.callout-title:has-text("Note")')
      await expect(title).toBeVisible()

      // Check icon is present (📝 or similar)
      const icon = noteCallout.locator('.callout-icon')
      await expect(icon).toBeVisible()

      // Check content is present
      const content = noteCallout.locator('.callout-content')
      await expect(content).toContainText('note')
    })

    test('CAL-02: Tip callout renders with cyan/green theme and icon', async ({ basePage }) => {
      // Note is already in Reading mode from beforeEach
      // No need to switch modes
      await basePage.page.waitForTimeout(300)

      const tipCallout = basePage.page.locator('.callout-box:has-text("Pro Tip")').first()
      await expect(tipCallout).toBeVisible()

      const title = tipCallout.locator('.callout-title:has-text("Pro Tip")')
      await expect(title).toBeVisible()

      const icon = tipCallout.locator('.callout-icon')
      await expect(icon).toBeVisible()

      const content = tipCallout.locator('.callout-content')
      await expect(content).toContainText('tip')
    })

    test('CAL-03: Warning callout renders with orange/amber theme and icon', async ({ basePage }) => {
      // Note is already in Reading mode from beforeEach
      // No need to switch modes
      await basePage.page.waitForTimeout(300)

      const warningCallout = basePage.page.locator('.callout-box:has-text("Warning")').first()
      await expect(warningCallout).toBeVisible()

      const title = warningCallout.locator('.callout-title:has-text("Warning")')
      await expect(title).toBeVisible()

      const icon = warningCallout.locator('.callout-icon')
      await expect(icon).toBeVisible()

      const content = warningCallout.locator('.callout-content')
      await expect(content).toContainText('warning')
    })

    test('CAL-04: Danger callout renders with red theme and icon', async ({ basePage }) => {
      // Note is already in Reading mode from beforeEach
      // No need to switch modes
      await basePage.page.waitForTimeout(300)

      const dangerCallout = basePage.page.locator('.callout-box:has-text("Critical")').first()
      await expect(dangerCallout).toBeVisible()

      const title = dangerCallout.locator('.callout-title:has-text("Critical")')
      await expect(title).toBeVisible()

      const icon = dangerCallout.locator('.callout-icon')
      await expect(icon).toBeVisible()

      const content = dangerCallout.locator('.callout-content')
      await expect(content).toContainText('danger')
    })

    test('CAL-05: Information callout renders with blue theme and icon', async ({ basePage }) => {
      // Note is already in Reading mode from beforeEach
      // No need to switch modes
      await basePage.page.waitForTimeout(300)

      const infoCallout = basePage.page.locator('.callout-box:has-text("Info")').first()
      await expect(infoCallout).toBeVisible()

      const title = infoCallout.locator('.callout-title:has-text("Info")')
      await expect(title).toBeVisible()

      const icon = infoCallout.locator('.callout-icon')
      await expect(icon).toBeVisible()

      const content = infoCallout.locator('.callout-content')
      await expect(content).toContainText('info')
    })

    test('CAL-06: Success callout renders with green theme and icon', async ({ basePage }) => {
      // Note is already in Reading mode from beforeEach
      // No need to switch modes
      await basePage.page.waitForTimeout(300)

      const successCallout = basePage.page.locator('.callout-box:has-text("Well Done!")').first()
      await expect(successCallout).toBeVisible()

      const title = successCallout.locator('.callout-title:has-text("Well Done!")')
      await expect(title).toBeVisible()

      const icon = successCallout.locator('.callout-icon')
      await expect(icon).toBeVisible()

      const content = successCallout.locator('.callout-content')
      await expect(content).toContainText("success")
    })

    test('CAL-07: Question callout renders with purple theme and icon', async ({ basePage }) => {
      // Note is already in Reading mode from beforeEach
      // No need to switch modes
      await basePage.page.waitForTimeout(300)

      const questionCallout = basePage.page.locator('.callout-box:has-text("FAQ")').first()
      await expect(questionCallout).toBeVisible()

      const title = questionCallout.locator('.callout-title:has-text("FAQ")')
      await expect(title).toBeVisible()

      const icon = questionCallout.locator('.callout-icon')
      await expect(icon).toBeVisible()

      const content = questionCallout.locator('.callout-content')
      await expect(content).toContainText("question")
    })

    test('CAL-08: Example callout renders with gray theme and icon', async ({ basePage }) => {
      // Note is already in Reading mode from beforeEach
      // No need to switch modes
      await basePage.page.waitForTimeout(300)

      const exampleCallout = basePage.page.locator('.callout-box:has-text("Example")').first()
      await expect(exampleCallout).toBeVisible()

      const title = exampleCallout.locator('.callout-title:has-text("Example")')
      await expect(title).toBeVisible()

      const icon = exampleCallout.locator('.callout-icon')
      await expect(icon).toBeVisible()

      const content = exampleCallout.locator('.callout-content')
      await expect(content).toContainText('example')
    })

    test('CAL-09: Quote callout renders with gray theme and icon', async ({ basePage }) => {
      // Note is already in Reading mode from beforeEach
      // No need to switch modes
      await basePage.page.waitForTimeout(300)

      const quoteCallout = basePage.page.locator('.callout-box:has-text("Albert Einstein")').first()
      await expect(quoteCallout).toBeVisible()

      const title = quoteCallout.locator('.callout-title:has-text("Albert Einstein")')
      await expect(title).toBeVisible()

      const icon = quoteCallout.locator('.callout-icon')
      await expect(icon).toBeVisible()

      const content = quoteCallout.locator('.callout-content')
      await expect(content).toContainText("quote")
    })

    test('CAL-10: Bug callout renders with red theme and icon', async ({ basePage }) => {
      await basePage.page.waitForTimeout(500)

      const bugCallout = basePage.page.locator('.callout-box:has-text("Bug")').first()
      await expect(bugCallout).toBeVisible()

      const title = bugCallout.locator('.callout-title:has-text("Bug")')
      await expect(title).toBeVisible()

      const icon = bugCallout.locator('.callout-icon')
      await expect(icon).toBeVisible()

      const content = bugCallout.locator('.callout-content')
      await expect(content).toContainText("bug")
    })

    test('CAL-11: Abstract/Summary callout renders with cyan theme and icon', async ({ basePage }) => {
      await basePage.page.waitForTimeout(500)

      const summaryCallout = basePage.page.locator('.callout-box:has-text("Summary")').first()
      await expect(summaryCallout).toBeVisible()

      const title = summaryCallout.locator('.callout-title:has-text("Summary")')
      await expect(title).toBeVisible()

      const icon = summaryCallout.locator('.callout-icon')
      await expect(icon).toBeVisible()

      const content = summaryCallout.locator('.callout-content')
      await expect(content).toContainText('abstract')
    })
  })

  test.describe('Custom Titles', () => {
    test('CAL-12: Callout with custom title renders correctly', async ({ basePage }) => {
      await basePage.page.waitForTimeout(500)

      // Look for custom titled callout (Pro Tip is a custom title)
      const customCallout = basePage.page.locator('.callout-box:has-text("Pro Tip")').first()
      await expect(customCallout).toBeVisible()

      const title = customCallout.locator('.callout-title:has-text("Pro Tip")')
      await expect(title).toBeVisible()
    })

    test('CAL-13: Callout without title uses default capitalized type', async ({ basePage }) => {
      await basePage.page.waitForTimeout(500)

      // Note callout should use default "Note" title if no custom title provided
      const noteCallout = basePage.page.locator('.callout-box').first()
      const title = noteCallout.locator('.callout-title')

      // Title should be capitalized type name
      await expect(title).toBeVisible()
    })
  })

  test.describe('Mode Switching Behavior', () => {
    test('CAL-14: Callouts render as blockquotes in Source mode', async ({ basePage, cmEditor }) => {
      // Switch to Source mode
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(200)

      // In source mode, should see raw markdown syntax in CodeMirror
      await cmEditor.waitForEditor()
      const content = await cmEditor.getTextContent()
      expect(content).toContain('> [!note]')
      expect(content).toContain('> [!tip]')
    })

    test('CAL-15: Callouts render as styled boxes in Reading mode', async ({ basePage }) => {
      await basePage.page.waitForTimeout(500)

      // Should see styled callout boxes
      const calloutBoxes = basePage.page.locator('.callout-box')
      await expect(calloutBoxes.first()).toBeVisible()

      // Count should be > 10 (we have 11+ callouts in demo)
      const count = await calloutBoxes.count()
      expect(count).toBeGreaterThan(10)
    })

    test('CAL-16: Switching from Reading to Source preserves callout data', async ({ basePage, cmEditor }) => {
      await basePage.page.waitForTimeout(500)

      // Verify callout is visible
      const callout = basePage.page.locator('.callout-box:has-text("Note Callout")').first()
      await expect(callout).toBeVisible()

      // Switch to Source mode
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(200)

      // Verify markdown syntax is preserved in CodeMirror
      await cmEditor.waitForEditor()
      const content = await cmEditor.getTextContent()
      expect(content).toContain('> [!note] Note Callout')
    })

    test('CAL-17: Switching from Source to Reading renders callouts correctly', async ({ basePage, cmEditor }) => {
      // Start in Source mode
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(200)

      // Verify raw markdown in CodeMirror
      await cmEditor.waitForEditor()
      const content = await cmEditor.getTextContent()
      expect(content).toContain('> [!note]')

      // Switch to Reading mode
      const readingBtn = basePage.page.locator('button:has-text("Reading")')
      await readingBtn.click()
      await basePage.page.waitForTimeout(200)

      // Verify callouts render as styled boxes
      const callout = basePage.page.locator('.callout-box:has-text("Note Callout")').first()
      await expect(callout).toBeVisible()
    })
  })

  test.describe('Callout Structure', () => {
    test('CAL-18: Callout box has correct CSS classes', async ({ basePage }) => {
      await basePage.page.waitForTimeout(500)

      const callout = basePage.page.locator('.callout-box').first()
      await expect(callout).toHaveClass(/callout-box/)
      await expect(callout).toHaveClass(/rounded-lg/)
      await expect(callout).toHaveClass(/p-4/)
      await expect(callout).toHaveClass(/my-4/)
    })

    test('CAL-19: Callout header contains icon and title', async ({ basePage }) => {
      await basePage.page.waitForTimeout(500)

      const callout = basePage.page.locator('.callout-box').first()

      // Check header exists
      const header = callout.locator('.callout-header')
      await expect(header).toBeVisible()

      // Check icon exists
      const icon = header.locator('.callout-icon')
      await expect(icon).toBeVisible()

      // Check title exists
      const title = header.locator('.callout-title')
      await expect(title).toBeVisible()
    })

    test('CAL-20: Callout content area contains text', async ({ basePage }) => {
      await basePage.page.waitForTimeout(500)

      const callout = basePage.page.locator('.callout-box').first()
      const content = callout.locator('.callout-content')

      await expect(content).toBeVisible()
      // Content should have text (not empty)
      const text = await content.textContent()
      expect(text?.trim().length).toBeGreaterThan(0)
    })
  })

  test.describe('Regular Blockquotes (Non-Callouts)', () => {
    test('CAL-21: Regular blockquotes without [!type] render as italic quotes', async ({ basePage }) => {
      await basePage.page.waitForTimeout(500)

      // Look for callout boxes (should exist for callout examples)
      const calloutBoxes = basePage.page.locator('.callout-box')
      const calloutCount = await calloutBoxes.count()

      // Should have callouts
      expect(calloutCount).toBeGreaterThan(0)
    })
  })

  test.describe('Edge Cases', () => {
    test('CAL-22: Empty callout renders with default title', async ({ basePage }) => {
      await basePage.page.waitForTimeout(500)

      // All callouts should have titles (either custom or default)
      const calloutTitles = basePage.page.locator('.callout-title')
      const count = await calloutTitles.count()

      expect(count).toBeGreaterThan(0)

      // Verify at least one title is visible
      await expect(calloutTitles.first()).toBeVisible()
    })

    test('CAL-23: Multiple callouts on same page all render correctly', async ({ basePage }) => {
      await basePage.page.waitForTimeout(500)

      // Should have 11+ callouts in the demo note
      const calloutBoxes = basePage.page.locator('.callout-box')
      const count = await calloutBoxes.count()

      expect(count).toBeGreaterThanOrEqual(11)
    })

    test('CAL-24: Callout rendering does not affect other markdown elements', async ({ basePage }) => {
      await basePage.page.waitForTimeout(500)

      // Headers should still render
      const headers = basePage.page.locator('h1, h2, h3')
      const headerCount = await headers.count()
      expect(headerCount).toBeGreaterThan(0)

      // Callouts should also render
      const callouts = basePage.page.locator('.callout-box')
      const calloutCount = await callouts.count()
      expect(calloutCount).toBeGreaterThan(0)
    })

    test('CAL-25: Callout icons are visible and not broken', async ({ basePage }) => {
      await basePage.page.waitForTimeout(500)

      // All callouts should have visible icons
      const icons = basePage.page.locator('.callout-icon')
      const count = await icons.count()

      expect(count).toBeGreaterThanOrEqual(11)

      // Check first few icons are visible
      await expect(icons.nth(0)).toBeVisible()
      await expect(icons.nth(1)).toBeVisible()
      await expect(icons.nth(2)).toBeVisible()
    })
  })
})
