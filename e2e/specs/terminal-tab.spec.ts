import { test, expect } from '../fixtures'

/**
 * Terminal Tab Tests (P3)
 *
 * Tests for the Terminal tab in the right sidebar.
 * Tests the xterm.js integration and browser shell emulation.
 *
 * Tests: TM-01 to TM-15
 */

test.describe('Terminal Tab', () => {
  test.beforeEach(async ({ basePage }) => {
    await basePage.goto()
    // Open an existing note so right sidebar is visible
    const recentNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
    await recentNote.click()
    await basePage.page.waitForTimeout(500)
  })

  test.describe('Tab Navigation', () => {
    test('TM-01: Terminal tab visible in right sidebar', async ({ basePage }) => {
      const terminalTab = basePage.page.locator('[data-testid="terminal-tab"]')
      await expect(terminalTab).toBeVisible()
    })

    test('TM-02: Terminal tab has correct label', async ({ basePage }) => {
      // In expanded mode, tab shows "Terminal" or truncated "Term"
      const terminalTab = basePage.page.locator('[data-testid="terminal-tab"]')
      // Check that it contains at least "Term" (may be truncated in narrow views)
      await expect(terminalTab).toContainText('Term')
    })

    test('TM-03: Click opens Terminal panel', async ({ basePage }) => {
      const terminalTab = basePage.page.locator('[data-testid="terminal-tab"]')
      await terminalTab.click()
      await basePage.page.waitForTimeout(200)

      const terminalPanel = basePage.page.locator('[data-testid="terminal-panel"]')
      await expect(terminalPanel).toBeVisible()
    })

    test('TM-04: ⌘] cycles to Terminal tab from Claude', async ({ basePage }) => {
      // First go to Claude tab
      const claudeTab = basePage.page.locator('[data-testid="claude-tab"]')
      await claudeTab.click()
      await basePage.page.waitForTimeout(200)

      // Cycle to next tab (should be Terminal)
      await basePage.pressShortcut(']')
      await basePage.page.waitForTimeout(200)

      // Terminal panel should be visible
      const terminalPanel = basePage.page.locator('[data-testid="terminal-panel"]')
      const isVisible = await terminalPanel.isVisible().catch(() => false)
      expect(isVisible).toBe(true)
    })

    test('TM-05: ⌘[ cycles to Claude from Terminal', async ({ basePage }) => {
      // First go to Terminal tab
      const terminalTab = basePage.page.locator('[data-testid="terminal-tab"]')
      await terminalTab.click()
      await basePage.page.waitForTimeout(200)

      // Cycle to previous tab (should be Claude)
      await basePage.pressShortcut('[')
      await basePage.page.waitForTimeout(200)

      // Claude panel should be visible
      const claudePanel = basePage.page.locator('[data-testid="claude-chat-panel"]')
      const isVisible = await claudePanel.isVisible().catch(() => false)
      expect(isVisible).toBe(true)
    })
  })

  test.describe('Collapsed Mode', () => {
    test('TM-06: Terminal icon visible in collapsed sidebar', async ({ basePage }) => {
      // Collapse the sidebar
      const collapseBtn = basePage.page.locator('button[title*="Collapse"]').last()
      await collapseBtn.click()
      await basePage.page.waitForTimeout(200)

      // Check Terminal icon exists
      const terminalIcon = basePage.page.locator('[data-testid="terminal-tab-icon"]')
      const isVisible = await terminalIcon.isVisible()
      expect(isVisible).toBe(true)
    })

    test('TM-07: Click Terminal icon expands to Terminal panel', async ({ basePage }) => {
      // Collapse the sidebar
      const collapseBtn = basePage.page.locator('button[title*="Collapse"]').last()
      await collapseBtn.click()
      await basePage.page.waitForTimeout(200)

      // Click the Terminal icon
      const terminalIcon = basePage.page.locator('[data-testid="terminal-tab-icon"]')
      await terminalIcon.click()
      await basePage.page.waitForTimeout(200)

      // Should be expanded now
      const rightSidebar = basePage.page.locator('[data-testid="right-sidebar"]')
      const box = await rightSidebar.boundingBox()
      expect(box?.width).toBeGreaterThan(100)

      // Terminal panel should be visible
      const terminalPanel = basePage.page.locator('[data-testid="terminal-panel"]')
      await expect(terminalPanel).toBeVisible()
    })
  })

  test.describe('Panel Content', () => {
    test('TM-08: Panel shows Terminal header', async ({ basePage }) => {
      const terminalTab = basePage.page.locator('[data-testid="terminal-tab"]')
      await terminalTab.click()
      await basePage.page.waitForTimeout(200)

      const header = basePage.page.locator('[data-testid="terminal-panel"]').locator('text=Terminal').first()
      await expect(header).toBeVisible()
    })

    test('TM-09: Panel shows Browser badge in browser mode', async ({ basePage }) => {
      const terminalTab = basePage.page.locator('[data-testid="terminal-tab"]')
      await terminalTab.click()
      await basePage.page.waitForTimeout(200)

      // In browser mode (e2e tests), should show Browser badge in header
      // Use .first() to avoid strict mode violation (terminal output also contains "Browser")
      const browserBadge = basePage.page.locator('[data-testid="terminal-panel"]').getByText('Browser', { exact: true }).first()
      await expect(browserBadge).toBeVisible()
    })

    test('TM-10: Terminal container is rendered', async ({ basePage }) => {
      const terminalTab = basePage.page.locator('[data-testid="terminal-tab"]')
      await terminalTab.click()
      await basePage.page.waitForTimeout(300)

      const terminalContainer = basePage.page.locator('[data-testid="terminal-container"]')
      await expect(terminalContainer).toBeVisible()
    })

    test('TM-11: Clear button is visible', async ({ basePage }) => {
      const terminalTab = basePage.page.locator('[data-testid="terminal-tab"]')
      await terminalTab.click()
      await basePage.page.waitForTimeout(200)

      const clearButton = basePage.page.locator('[data-testid="clear-terminal-button"]')
      await expect(clearButton).toBeVisible()
    })

    test('TM-12: Connection status indicator is visible', async ({ basePage }) => {
      const terminalTab = basePage.page.locator('[data-testid="terminal-tab"]')
      await terminalTab.click()
      await basePage.page.waitForTimeout(300)

      // The connection status dot should be present
      const statusDot = basePage.page.locator('[data-testid="terminal-panel"]').locator('[title*="Connected"], [title*="Disconnected"]')
      await expect(statusDot).toBeVisible()
    })
  })

  test.describe('Status Bar & Shortcuts', () => {
    test('TM-13: Terminal button visible in status bar', async ({ basePage }) => {
      const terminalButton = basePage.page.locator('[data-testid="terminal-status-button"]')
      await expect(terminalButton).toBeVisible()
    })

    test('TM-14: Status bar button toggles Terminal panel', async ({ basePage }) => {
      const terminalButton = basePage.page.locator('[data-testid="terminal-status-button"]')

      // Click to open Terminal
      await terminalButton.click()
      await basePage.page.waitForTimeout(200)

      const terminalPanel = basePage.page.locator('[data-testid="terminal-panel"]')
      await expect(terminalPanel).toBeVisible()

      // Click again to close
      await terminalButton.click()
      await basePage.page.waitForTimeout(200)

      // Sidebar should be collapsed
      const rightSidebar = basePage.page.locator('[data-testid="right-sidebar"]')
      const box = await rightSidebar.boundingBox()
      expect(box?.width).toBeLessThan(100) // Collapsed width is 48px
    })

    test('TM-15: ⌘` keyboard shortcut toggles Terminal', async ({ basePage }) => {
      // First verify Terminal is not visible
      const terminalPanel = basePage.page.locator('[data-testid="terminal-panel"]')
      const isInitiallyVisible = await terminalPanel.isVisible().catch(() => false)

      // Press ⌘` to toggle Terminal
      await basePage.page.keyboard.press('Meta+`')
      await basePage.page.waitForTimeout(200)

      // Terminal should now be visible
      await expect(terminalPanel).toBeVisible()

      // Press ⌘` again to close
      await basePage.page.keyboard.press('Meta+`')
      await basePage.page.waitForTimeout(200)

      // Sidebar should be collapsed
      const rightSidebar = basePage.page.locator('[data-testid="right-sidebar"]')
      const box = await rightSidebar.boundingBox()
      expect(box?.width).toBeLessThan(100)
    })
  })
})
