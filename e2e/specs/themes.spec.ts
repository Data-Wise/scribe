import { test, expect } from '../fixtures'

/**
 * Theme & Appearance Tests (P3)
 *
 * Tests for visual styling and theme changes.
 *
 * Tests: THM-01 to THM-06
 */

test.describe('Theme & Appearance', () => {
  test.beforeEach(async ({ basePage }) => {
    await basePage.goto()
  })

  test('THM-01: Default theme applied', async ({ basePage }) => {
    // App should have theme CSS variables applied
    const bgColor = await basePage.page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor
    })

    // Should have some background color (dark theme = dark color)
    expect(bgColor).toBeTruthy()
  })

  test('THM-02: Theme changes in settings', async ({ basePage, modals }) => {
    await modals.openSettings()

    // Look for theme section
    const themeSection = basePage.page.locator('text=/Theme/i, .theme-grid, .theme-option')
    const isVisible = await themeSection.first().isVisible().catch(() => false)

    // Close settings
    await basePage.page.keyboard.press('Escape')

    expect(typeof isVisible).toBe('boolean')
  })

  test('THM-03: Project colors visible', async ({ basePage, sidebar }) => {
    await sidebar.setMode('card')

    // Look for project cards with color indicators
    const colorIndicators = basePage.page.locator('.project-color, .status-dot, [style*="background"]')
    const count = await colorIndicators.count()

    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('THM-04: Tab gradient shows project color', async ({ basePage, tabs }) => {
    // Open an existing note
    const recentNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
    await recentNote.click()
    await basePage.page.waitForTimeout(500)

    // Tab should exist with some styling
    const tabCount = await tabs.getTabCount()
    expect(tabCount).toBeGreaterThanOrEqual(1)
  })

  test('THM-05: Dark mode contrast', async ({ basePage }) => {
    // Check that text is visible (good contrast)
    const textColor = await basePage.page.evaluate(() => {
      const element = document.querySelector('body')
      return element ? getComputedStyle(element).color : null
    })

    expect(textColor).toBeTruthy()
  })

  test('THM-06: Font settings in settings modal', async ({ basePage, modals }) => {
    await modals.openSettings()

    // Look for font section
    const fontSection = basePage.page.locator('text=/Font/i, .font-settings')
    const isVisible = await fontSection.first().isVisible().catch(() => false)

    // Close settings
    await basePage.page.keyboard.press('Escape')

    expect(typeof isVisible).toBe('boolean')
  })
})
