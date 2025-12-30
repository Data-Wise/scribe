import { test, expect } from '../fixtures'

/**
 * Sidebar Toggle Tests
 *
 * Tests for the sidebar toggle button in the editor tab bar
 * and keyboard shortcuts for collapsing/expanding sidebars.
 *
 * Tests: STG-01 to STG-12
 */

test.describe('Sidebar Toggle Button', () => {
  test.beforeEach(async ({ basePage }) => {
    await basePage.goto()
    // Open a note so the right sidebar is visible
    const recentNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
    await recentNote.click()
    await basePage.page.waitForTimeout(500)
  })

  test.describe('Toggle Button Visibility', () => {
    test('STG-01: Toggle button exists in editor tab bar', async ({ basePage }) => {
      const toggleBtn = basePage.page.locator('[data-testid="right-sidebar-toggle"]')
      await expect(toggleBtn).toBeVisible()
    })

    test('STG-02: Toggle button is inside right sidebar', async ({ basePage }) => {
      const toggleBtn = basePage.page.locator('[data-testid="right-sidebar-toggle"]')
      // Check that toggle button is somewhere inside the right sidebar
      const isInRightSidebar = await toggleBtn.evaluate(el => {
        let parent = el.parentElement
        while (parent) {
          if (parent.getAttribute('data-testid') === 'right-sidebar') return true
          parent = parent.parentElement
        }
        return false
      })
      expect(isInRightSidebar).toBe(true)
    })

    test('STG-03: Toggle button has correct aria-label', async ({ basePage }) => {
      const toggleBtn = basePage.page.locator('[data-testid="right-sidebar-toggle"]')
      const ariaLabel = await toggleBtn.getAttribute('aria-label')
      expect(ariaLabel).toMatch(/right sidebar/i)
    })

    test('STG-04: Toggle button shows tooltip on hover', async ({ basePage }) => {
      const toggleBtn = basePage.page.locator('[data-testid="right-sidebar-toggle"]')
      const title = await toggleBtn.getAttribute('title')
      expect(title).toMatch(/sidebar.*⌘⇧\]/i)
    })
  })

  test.describe('Toggle Button Click Behavior', () => {
    test('STG-05: Clicking toggle collapses right sidebar', async ({ basePage }) => {
      // Get initial sidebar width
      const rightSidebar = basePage.page.locator('[data-testid="right-sidebar"]')
      const initialBox = await rightSidebar.boundingBox()
      expect(initialBox?.width).toBeGreaterThan(100) // Should be expanded

      // Click toggle button
      const toggleBtn = basePage.page.locator('[data-testid="right-sidebar-toggle"]')
      await toggleBtn.click()
      await basePage.page.waitForTimeout(300)

      // Sidebar should now be collapsed
      const collapsedBox = await rightSidebar.boundingBox()
      expect(collapsedBox?.width).toBeLessThan(100) // Should be ~48px
    })

    test('STG-06: Clicking toggle again expands right sidebar', async ({ basePage }) => {
      const toggleBtn = basePage.page.locator('[data-testid="right-sidebar-toggle"]')
      const rightSidebar = basePage.page.locator('[data-testid="right-sidebar"]')

      // First click - collapse
      await toggleBtn.click()
      await basePage.page.waitForTimeout(300)
      const collapsedBox = await rightSidebar.boundingBox()
      expect(collapsedBox?.width).toBeLessThan(100)

      // Second click - expand
      await toggleBtn.click()
      await basePage.page.waitForTimeout(300)
      const expandedBox = await rightSidebar.boundingBox()
      expect(expandedBox?.width).toBeGreaterThan(100)
    })

    test('STG-07: Toggle button icon changes based on state', async ({ basePage }) => {
      const toggleBtn = basePage.page.locator('[data-testid="right-sidebar-toggle"]')

      // When expanded, should show "Hide" in title
      const expandedTitle = await toggleBtn.getAttribute('title')
      expect(expandedTitle).toMatch(/hide/i)

      // Collapse
      await toggleBtn.click()
      await basePage.page.waitForTimeout(300)

      // When collapsed, should show "Show" in title
      const collapsedTitle = await toggleBtn.getAttribute('title')
      expect(collapsedTitle).toMatch(/show/i)
    })

    test('STG-08: Toggle state persists after page reload', async ({ basePage }) => {
      const toggleBtn = basePage.page.locator('[data-testid="right-sidebar-toggle"]')
      const rightSidebar = basePage.page.locator('[data-testid="right-sidebar"]')

      // Collapse sidebar
      await toggleBtn.click()
      await basePage.page.waitForTimeout(300)

      // Reload page
      await basePage.page.reload()
      await basePage.page.waitForLoadState('networkidle')
      await basePage.page.waitForTimeout(500)

      // Open a note again
      const recentNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
      await recentNote.click()
      await basePage.page.waitForTimeout(500)

      // Sidebar should still be collapsed
      const box = await rightSidebar.boundingBox()
      expect(box?.width).toBeLessThan(100)
    })
  })

  test.describe('Keyboard Shortcuts', () => {
    test('STG-09: ⌘⇧] toggles right sidebar', async ({ basePage }) => {
      const rightSidebar = basePage.page.locator('[data-testid="right-sidebar"]')

      // Initial state - expanded
      const initialBox = await rightSidebar.boundingBox()
      expect(initialBox?.width).toBeGreaterThan(100)

      // Press ⌘⇧]
      await basePage.page.keyboard.press('Meta+Shift+]')
      await basePage.page.waitForTimeout(300)

      // Should be collapsed
      const collapsedBox = await rightSidebar.boundingBox()
      expect(collapsedBox?.width).toBeLessThan(100)

      // Press ⌘⇧] again
      await basePage.page.keyboard.press('Meta+Shift+]')
      await basePage.page.waitForTimeout(300)

      // Should be expanded again
      const expandedBox = await rightSidebar.boundingBox()
      expect(expandedBox?.width).toBeGreaterThan(100)
    })

    test('STG-10: ⌘⇧[ toggles left sidebar', async ({ basePage }) => {
      // Get left sidebar
      const leftSidebar = basePage.page.locator('[data-testid="left-sidebar"]')
      const initialBox = await leftSidebar.boundingBox()
      const initialWidth = initialBox?.width || 0

      // Press ⌘⇧[
      await basePage.page.keyboard.press('Meta+Shift+[')
      await basePage.page.waitForTimeout(300)

      // Width should change (collapsed to icon mode ~64px or expanded ~300px)
      const afterBox = await leftSidebar.boundingBox()
      const afterWidth = afterBox?.width || 0

      // Verify the width changed (toggle between compact and icon mode)
      expect(afterWidth).not.toBe(initialWidth)
    })
  })

  test.describe('Toggle Button Position', () => {
    test('STG-11: Toggle button is in right sidebar tab bar', async ({ basePage }) => {
      const toggleBtn = basePage.page.locator('[data-testid="right-sidebar-toggle"]')
      const rightSidebar = basePage.page.locator('[data-testid="right-sidebar"]')
      const sidebarTabs = basePage.page.locator('.sidebar-tabs')

      const btnBox = await toggleBtn.boundingBox()
      const sidebarBox = await rightSidebar.boundingBox()
      const tabsBox = await sidebarTabs.boundingBox()

      // Button should be within the right sidebar
      expect(btnBox!.x).toBeGreaterThanOrEqual(sidebarBox!.x)
      expect(btnBox!.x + btnBox!.width).toBeLessThanOrEqual(sidebarBox!.x + sidebarBox!.width)

      // Button should be within the sidebar tabs bar
      expect(btnBox!.y).toBeGreaterThanOrEqual(tabsBox!.y)
      expect(btnBox!.y + btnBox!.height).toBeLessThanOrEqual(tabsBox!.y + tabsBox!.height)
    })

    test('STG-12: Toggle button is always visible when sidebar open or closed', async ({ basePage }) => {
      const toggleBtn = basePage.page.locator('[data-testid="right-sidebar-toggle"]')

      // Visible when expanded
      await expect(toggleBtn).toBeVisible()

      // Collapse sidebar
      await toggleBtn.click()
      await basePage.page.waitForTimeout(300)

      // Still visible when collapsed
      await expect(toggleBtn).toBeVisible()
    })
  })
})
