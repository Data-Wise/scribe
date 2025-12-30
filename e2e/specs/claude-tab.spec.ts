import { test, expect } from '../fixtures'

/**
 * Claude Tab Tests (P2)
 *
 * Tests for the Claude AI chat tab in the right sidebar.
 *
 * Tests: CL-01 to CL-10
 */

test.describe('Claude Tab', () => {
  test.beforeEach(async ({ basePage }) => {
    await basePage.goto()
    // Open an existing note so right sidebar is visible
    const recentNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
    await recentNote.click()
    await basePage.page.waitForTimeout(500)
  })

  test.describe('Tab Navigation', () => {
    test('CL-01: Claude tab visible in right sidebar', async ({ basePage }) => {
      const claudeTab = basePage.page.locator('[data-testid="claude-tab"]')
      await expect(claudeTab).toBeVisible()
    })

    test('CL-02: Claude tab has correct label', async ({ basePage }) => {
      const claudeTab = basePage.page.locator('[data-testid="claude-tab"]')
      await expect(claudeTab).toContainText('Claude')
    })

    test('CL-03: Click opens Claude panel', async ({ basePage }) => {
      const claudeTab = basePage.page.locator('[data-testid="claude-tab"]')
      await claudeTab.click()
      await basePage.page.waitForTimeout(200)

      const claudePanel = basePage.page.locator('[data-testid="claude-chat-panel"]')
      await expect(claudePanel).toBeVisible()
    })

    test('CL-04: ⌘] cycles to Claude tab from Stats', async ({ basePage }) => {
      // First go to Stats tab
      const statsTab = basePage.page.locator('button:has-text("Stats")')
      await statsTab.click()
      await basePage.page.waitForTimeout(200)

      // Cycle to next tab (should be Claude)
      await basePage.pressShortcut(']')
      await basePage.page.waitForTimeout(200)

      // Claude panel should be visible
      const claudePanel = basePage.page.locator('[data-testid="claude-chat-panel"]')
      const isVisible = await claudePanel.isVisible().catch(() => false)
      expect(isVisible).toBe(true)
    })

    test('CL-05: ⌘[ cycles to Stats from Claude', async ({ basePage }) => {
      // First go to Claude tab
      const claudeTab = basePage.page.locator('[data-testid="claude-tab"]')
      await claudeTab.click()
      await basePage.page.waitForTimeout(200)

      // Cycle to previous tab (should be Stats)
      await basePage.pressShortcut('[')
      await basePage.page.waitForTimeout(200)

      // Stats panel should be visible
      const statsPanel = basePage.page.locator('[data-testid="stats-panel"]')
      const isVisible = await statsPanel.isVisible().catch(() => false)
      expect(isVisible).toBe(true)
    })
  })

  test.describe('Collapsed Mode', () => {
    test('CL-06: Claude icon visible in collapsed sidebar', async ({ basePage }) => {
      // Collapse the sidebar
      const collapseBtn = basePage.page.locator('button[title*="Collapse"]').last()
      await collapseBtn.click()
      await basePage.page.waitForTimeout(200)

      // Check Claude icon exists
      const claudeIcon = basePage.page.locator('[data-testid="claude-tab-icon"]')
      const isVisible = await claudeIcon.isVisible()
      expect(isVisible).toBe(true)
    })

    test('CL-07: Click Claude icon expands to Claude panel', async ({ basePage }) => {
      // Collapse the sidebar
      const collapseBtn = basePage.page.locator('button[title*="Collapse"]').last()
      await collapseBtn.click()
      await basePage.page.waitForTimeout(200)

      // Click the Claude icon
      const claudeIcon = basePage.page.locator('[data-testid="claude-tab-icon"]')
      await claudeIcon.click()
      await basePage.page.waitForTimeout(200)

      // Should be expanded now
      const rightSidebar = basePage.page.locator('[data-testid="right-sidebar"]')
      const box = await rightSidebar.boundingBox()
      expect(box?.width).toBeGreaterThan(100)

      // Claude panel should be visible
      const claudePanel = basePage.page.locator('[data-testid="claude-chat-panel"]')
      await expect(claudePanel).toBeVisible()
    })
  })

  test.describe('Panel Content', () => {
    test('CL-08: Panel shows Claude Assistant header', async ({ basePage }) => {
      const claudeTab = basePage.page.locator('[data-testid="claude-tab"]')
      await claudeTab.click()
      await basePage.page.waitForTimeout(200)

      const header = basePage.page.locator('text=Claude Assistant')
      await expect(header).toBeVisible()
    })

    test('CL-09: Panel shows empty state message', async ({ basePage }) => {
      const claudeTab = basePage.page.locator('[data-testid="claude-tab"]')
      await claudeTab.click()
      await basePage.page.waitForTimeout(200)

      const emptyState = basePage.page.locator('text=Ask Claude anything about your writing.')
      await expect(emptyState).toBeVisible()
    })

    test('CL-10: Input is enabled and can type', async ({ basePage }) => {
      const claudeTab = basePage.page.locator('[data-testid="claude-tab"]')
      await claudeTab.click()
      await basePage.page.waitForTimeout(200)

      const input = basePage.page.locator('[data-testid="chat-input"]')
      await expect(input).toBeVisible()
      await expect(input).toBeEnabled()

      // Can type into input
      await input.fill('test question')
      await expect(input).toHaveValue('test question')
    })
  })
})
