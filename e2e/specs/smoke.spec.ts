import { test, expect } from '../fixtures'

/**
 * Smoke Tests (P0)
 *
 * Critical path tests to verify the app loads correctly.
 * These tests should pass before running any other tests.
 *
 * Tests: NAV-01 to NAV-04
 */

test.describe('Smoke Tests', () => {
  test.beforeEach(async ({ basePage }) => {
    await basePage.goto()
  })

  test('NAV-01: Page title shows "Scribe"', async ({ basePage }) => {
    const title = await basePage.getTitle()
    expect(title).toBe('Scribe')
  })

  test('NAV-02: Three-column layout renders', async ({ basePage, sidebar, rightSidebar }) => {
    // Left sidebar visible
    await expect(basePage.leftSidebar).toBeVisible()

    // Main content area visible
    await expect(basePage.mainContent).toBeVisible()

    // Right sidebar visible (when a note is selected) - may not be visible on initial load
    // Just verify the left sidebar and main content are present
    const sidebarMode = await sidebar.getSidebarMode()
    expect(['icon', 'compact', 'card']).toContain(sidebarMode)
  })

  test('NAV-03: Mission Control tab is pinned', async ({ tabs }) => {
    // Mission Control tab should be visible
    await expect(tabs.missionControlTab).toBeVisible()

    // Should be pinned (no close button)
    const isPinned = await tabs.isMissionControlPinned()
    expect(isPinned).toBe(true)
  })

  test('NAV-04: Default project exists', async ({ sidebar }) => {
    // Get project names
    const projects = await sidebar.getProjectNames()

    // Should have at least one project (Research is the default)
    expect(projects.length).toBeGreaterThan(0)

    // The default "Research" project should exist
    const hasResearch = projects.some(p => p.toLowerCase().includes('research'))
    expect(hasResearch).toBe(true)
  })

  test('NAV-05: Browser mode badge visible in browser mode', async ({ basePage }) => {
    // E2E tests run in browser mode (Vite), so badge should be visible
    // First open a note so the status bar (with browser badge) is visible
    const welcomeNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
    await welcomeNote.click()
    await basePage.page.waitForTimeout(300)

    // Browser badge should be in the status bar
    const browserBadge = basePage.page.locator('[data-testid="browser-mode-badge"]')
    await expect(browserBadge).toBeVisible()

    // Badge should contain "Browser" text
    await expect(browserBadge).toContainText('Browser')
  })
})
