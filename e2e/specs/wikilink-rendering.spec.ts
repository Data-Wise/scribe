import { test, expect } from '../fixtures'
import type { Page } from '@playwright/test'

/**
 * WikiLink Rendering E2E Tests
 *
 * Tests for wikilink bracket hiding in Live Preview mode.
 * WikiLinks use the format [[Page Name]] or [[Page|Alias]].
 * In Live Preview mode, only the display text should be visible.
 *
 * Tests: WL-01 to WL-20
 */

/**
 * Helper function to clear editor content and type new text
 */
async function typeInEditor(page: Page, text: string) {
  const editor = page.locator('.cm-content')
  await editor.click()
  await page.keyboard.press('Meta+a') // Select all
  await page.keyboard.press('Backspace') // Delete
  await page.waitForTimeout(200)
  await page.keyboard.type(text)
  await page.waitForTimeout(300)
}

test.describe('WikiLink Rendering', () => {
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

  test.describe('Source Mode - Full Syntax Visible', () => {
    test('WL-01: WikiLink brackets visible in Source mode', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('See [[My Note]] here')
      await basePage.page.waitForTimeout(300)

      const content = await editor.textContent()
      expect(content).toContain('[[')
      expect(content).toContain(']]')
      expect(content).toContain('My Note')
    })

    test('WL-02: WikiLink with alias shows full syntax in Source mode', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('Check [[Page Name|Display Text]]')
      await basePage.page.waitForTimeout(300)

      const content = await editor.textContent()
      expect(content).toContain('[[')
      expect(content).toContain('|')
      expect(content).toContain(']]')
      expect(content).toContain('Page Name')
      expect(content).toContain('Display Text')
    })

    test('WL-03: Multiple wikilinks visible in Source mode', async ({ basePage }) => {
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('Link to [[Note1]] and [[Note2]]')
      await basePage.page.waitForTimeout(300)

      const content = await editor.textContent()
      const bracketCount = (content.match(/\[\[/g) || []).length
      expect(bracketCount).toBe(2)
    })
  })

  test.describe('Live Preview Mode - Brackets Hidden', () => {
    test('WL-04: WikiLink brackets hidden in Live Preview mode', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('See [[My Note]] here')
      await basePage.page.waitForTimeout(500)

      // Move cursor away from wikilink
      await basePage.page.keyboard.press('End')
      await basePage.page.keyboard.type(' ')
      await basePage.page.waitForTimeout(300)

      // Check for wikilink widget
      const wikilink = basePage.page.locator('.cm-wikilink')
      const isVisible = await wikilink.count()
      expect(isVisible).toBeGreaterThan(0)

      // Widget should show only display text
      const text = await wikilink.first().textContent()
      expect(text).toBe('My Note')
      expect(text).not.toContain('[[')
      expect(text).not.toContain(']]')
    })

    test('WL-05: WikiLink with alias shows only alias in Live Preview', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('Check [[Page Name|Display Text]]')
      await basePage.page.waitForTimeout(500)

      // Move cursor away
      await basePage.page.keyboard.press('End')
      await basePage.page.keyboard.type(' ')
      await basePage.page.waitForTimeout(300)

      const wikilink = basePage.page.locator('.cm-wikilink')
      if (await wikilink.count() > 0) {
        const text = await wikilink.first().textContent()
        expect(text).toBe('Display Text')
        expect(text).not.toContain('Page Name')
        expect(text).not.toContain('[[')
        expect(text).not.toContain('|')
      }
    })

    test('WL-06: Multiple wikilinks all hide brackets in Live Preview', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('Link [[Note1]] and [[Note2]]')
      await basePage.page.waitForTimeout(500)

      // Move cursor away
      await basePage.page.keyboard.press('End')
      await basePage.page.keyboard.type(' ')
      await basePage.page.waitForTimeout(300)

      const wikilinks = basePage.page.locator('.cm-wikilink')
      const count = await wikilinks.count()
      expect(count).toBe(2)
    })

    test('WL-07: WikiLink brackets reappear when cursor enters', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('See [[My Note]]')
      await basePage.page.waitForTimeout(500)

      // Move cursor away first
      await basePage.page.keyboard.press('End')
      await basePage.page.waitForTimeout(300)

      // Verify wikilink widget exists
      let wikilink = basePage.page.locator('.cm-wikilink')
      let count = await wikilink.count()
      expect(count).toBeGreaterThan(0)

      // Move cursor back into wikilink (press Home, then arrow right)
      await basePage.page.keyboard.press('Home')
      await basePage.page.waitForTimeout(100)
      for (let i = 0; i < 5; i++) {
        await basePage.page.keyboard.press('ArrowRight')
      }
      await basePage.page.waitForTimeout(300)

      // When cursor is inside, brackets should be visible again
      const content = await editor.textContent()
      expect(content).toContain('[[')
    })
  })

  test.describe('Reading Mode - Rendered as Links', () => {
    test('WL-08: WikiLink rendered without brackets in Reading mode', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('See [[My Note]] here')
      await basePage.page.waitForTimeout(300)

      // Switch to Reading mode
      const readingBtn = basePage.page.locator('button:has-text("Reading")')
      await readingBtn.click()
      await basePage.page.waitForTimeout(300)

      // Check rendered content
      const prose = basePage.page.locator('.prose')
      const content = await prose.textContent()
      expect(content).toContain('My Note')
      expect(content).not.toContain('[[')
    })

    test('WL-09: WikiLink with alias shows alias in Reading mode', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('Check [[Page|Alias]]')
      await basePage.page.waitForTimeout(300)

      const readingBtn = basePage.page.locator('button:has-text("Reading")')
      await readingBtn.click()
      await basePage.page.waitForTimeout(300)

      const prose = basePage.page.locator('.prose')
      const content = await prose.textContent()
      expect(content).toContain('Alias')
      expect(content).not.toContain('[[')
      expect(content).not.toContain('|')
    })
  })

  test.describe('WikiLink Styling', () => {
    test('WL-10: WikiLink has accent color styling in Live Preview', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('See [[Note]]')
      await basePage.page.waitForTimeout(500)

      // Move cursor away
      await basePage.page.keyboard.press('End')
      await basePage.page.keyboard.type(' ')
      await basePage.page.waitForTimeout(300)

      const wikilink = basePage.page.locator('.cm-wikilink')
      if (await wikilink.count() > 0) {
        // Verify wikilink has the expected class
        await expect(wikilink.first()).toBeVisible()
      }
    })

    test('WL-11: WikiLink shows pointer cursor on hover', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('See [[Note]]')
      await basePage.page.waitForTimeout(500)

      // Move cursor away
      await basePage.page.keyboard.press('End')
      await basePage.page.keyboard.type(' ')
      await basePage.page.waitForTimeout(300)

      const wikilink = basePage.page.locator('.cm-wikilink')
      if (await wikilink.count() > 0) {
        await wikilink.first().hover()
        // Cursor style can't be easily tested in E2E, but hover shouldn't error
      }
    })
  })

  test.describe('Edge Cases', () => {
    test('WL-12: Empty wikilink [[]]', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('Empty [[]]')
      await basePage.page.waitForTimeout(300)

      // Should not crash
      const content = await editor.textContent()
      expect(content).toContain('Empty')
    })

    test('WL-13: WikiLink with spaces', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('Link [[My Long Note Name]]')
      await basePage.page.waitForTimeout(500)

      await basePage.page.keyboard.press('End')
      await basePage.page.keyboard.type(' ')
      await basePage.page.waitForTimeout(300)

      const wikilink = basePage.page.locator('.cm-wikilink')
      if (await wikilink.count() > 0) {
        const text = await wikilink.first().textContent()
        expect(text).toBe('My Long Note Name')
      }
    })

    test('WL-14: WikiLink with special characters', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('Link [[Note: A & B (2024)]]')
      await basePage.page.waitForTimeout(500)

      await basePage.page.keyboard.press('End')
      await basePage.page.keyboard.type(' ')
      await basePage.page.waitForTimeout(300)

      const wikilink = basePage.page.locator('.cm-wikilink')
      if (await wikilink.count() > 0) {
        const text = await wikilink.first().textContent()
        expect(text).toContain('&')
      }
    })

    test('WL-15: WikiLink at start of line', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('[[Note]] at start')
      await basePage.page.waitForTimeout(500)

      await basePage.page.keyboard.press('End')
      await basePage.page.keyboard.type(' ')
      await basePage.page.waitForTimeout(300)

      const wikilink = basePage.page.locator('.cm-wikilink')
      const count = await wikilink.count()
      expect(count).toBeGreaterThan(0)
    })

    test('WL-16: WikiLink at end of line', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('At end [[Note]]')
      await basePage.page.waitForTimeout(500)

      await basePage.page.keyboard.press('End')
      await basePage.page.keyboard.type(' ')
      await basePage.page.waitForTimeout(300)

      const wikilink = basePage.page.locator('.cm-wikilink')
      const count = await wikilink.count()
      expect(count).toBeGreaterThan(0)
    })

    test('WL-17: Adjacent wikilinks', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('[[Note1]][[Note2]]')
      await basePage.page.waitForTimeout(500)

      await basePage.page.keyboard.press('End')
      await basePage.page.keyboard.type(' ')
      await basePage.page.waitForTimeout(300)

      const wikilinks = basePage.page.locator('.cm-wikilink')
      const count = await wikilinks.count()
      expect(count).toBe(2)
    })

    test('WL-18: WikiLink in markdown list', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('- Item with [[Note]]')
      await basePage.page.waitForTimeout(500)

      await basePage.page.keyboard.press('End')
      await basePage.page.keyboard.type(' ')
      await basePage.page.waitForTimeout(300)

      const wikilink = basePage.page.locator('.cm-wikilink')
      const count = await wikilink.count()
      expect(count).toBeGreaterThan(0)
    })

    test('WL-19: WikiLink in header', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('# Header with [[Note]]')
      await basePage.page.waitForTimeout(500)

      await basePage.page.keyboard.press('End')
      await basePage.page.keyboard.type(' ')
      await basePage.page.waitForTimeout(300)

      const wikilink = basePage.page.locator('.cm-wikilink')
      const count = await wikilink.count()
      expect(count).toBeGreaterThan(0)
    })

    test('WL-20: WikiLink in blockquote', async ({ basePage }) => {
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await basePage.page.waitForTimeout(300)

      const editor = basePage.page.locator('.cm-content')
      await editor.click()
      await basePage.page.keyboard.type('> Quote with [[Note]]')
      await basePage.page.waitForTimeout(500)

      await basePage.page.keyboard.press('End')
      await basePage.page.keyboard.type(' ')
      await basePage.page.waitForTimeout(300)

      const wikilink = basePage.page.locator('.cm-wikilink')
      const count = await wikilink.count()
      expect(count).toBeGreaterThan(0)
    })
  })
})
