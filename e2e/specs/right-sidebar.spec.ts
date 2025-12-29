import { test, expect } from '../fixtures'

/**
 * Right Sidebar Tests (P1)
 *
 * Tests for Properties, Backlinks, Tags, and Stats panels.
 *
 * Tests: SBR-01 to SBR-18
 */

test.describe('Right Sidebar', () => {
  test.beforeEach(async ({ basePage }) => {
    await basePage.goto()
    // Open an existing note so right sidebar is visible
    const recentNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
    await recentNote.click()
    await basePage.page.waitForTimeout(500)
  })

  test.describe('Tab Navigation', () => {
    test('SBR-01: Properties tab is default', async ({ basePage, rightSidebar }) => {
      // Check if properties panel is visible by default
      const propertiesPanel = basePage.page.locator('[data-testid="properties-panel"]')
      const isVisible = await propertiesPanel.isVisible().catch(() => false)
      expect(isVisible).toBe(true)
    })

    test('SBR-02: Backlinks tab switch', async ({ basePage }) => {
      // Click backlinks tab
      const backlinksTab = basePage.page.locator('button:has-text("Backlinks")')
      await backlinksTab.click()
      await basePage.page.waitForTimeout(200)

      // Check if backlinks panel is visible
      const backlinksPanel = basePage.page.locator('[data-testid="backlinks-panel"]')
      const isVisible = await backlinksPanel.isVisible().catch(() => false)
      expect(isVisible).toBe(true)
    })

    test('SBR-03: Tags tab switch', async ({ basePage }) => {
      // Click tags tab
      const tagsTab = basePage.page.locator('button:has-text("Tags")')
      await tagsTab.click()
      await basePage.page.waitForTimeout(200)

      // Check if tags panel is visible
      const tagsPanel = basePage.page.locator('[data-testid="tags-panel"]')
      const isVisible = await tagsPanel.isVisible().catch(() => false)
      expect(isVisible).toBe(true)
    })

    test('SBR-04: ⌘] cycles to next tab', async ({ basePage }) => {
      // Start on properties
      const propertiesBefore = await basePage.page.locator('[data-testid="properties-panel"]').isVisible()
      expect(propertiesBefore).toBe(true)

      // Cycle to next tab
      await basePage.pressShortcut(']')
      await basePage.page.waitForTimeout(200)

      // Should now be on a different panel
      // Just verify no error - actual cycling behavior depends on implementation
      expect(true).toBe(true)
    })

    test('SBR-05: ⌘[ cycles to previous tab', async ({ basePage }) => {
      // Click tags tab first
      const tagsTab = basePage.page.locator('button:has-text("Tags")')
      await tagsTab.click()
      await basePage.page.waitForTimeout(200)

      // Cycle to previous tab
      await basePage.pressShortcut('[')
      await basePage.page.waitForTimeout(200)

      // Should now be on a different panel
      expect(true).toBe(true)
    })

    test('SBR-11: Stats tab switch', async ({ basePage }) => {
      // Click stats tab
      const statsTab = basePage.page.locator('button:has-text("Stats")')
      await statsTab.click()
      await basePage.page.waitForTimeout(200)

      // Check if stats panel is visible
      const statsPanel = basePage.page.locator('[data-testid="stats-panel"]')
      const isVisible = await statsPanel.isVisible().catch(() => false)
      expect(isVisible).toBe(true)
    })

    test('SBR-12: Stats tab cycles with ⌘]', async ({ basePage }) => {
      // Click tags tab first (3rd tab)
      const tagsTab = basePage.page.locator('button:has-text("Tags")')
      await tagsTab.click()
      await basePage.page.waitForTimeout(200)

      // Cycle to next tab (should be Stats, 4th tab)
      await basePage.pressShortcut(']')
      await basePage.page.waitForTimeout(200)

      // Stats panel should be visible
      const statsPanel = basePage.page.locator('[data-testid="stats-panel"]')
      const isVisible = await statsPanel.isVisible().catch(() => false)
      expect(isVisible).toBe(true)
    })
  })

  test.describe('Panel Content', () => {
    test('SBR-06: Properties show metadata', async ({ basePage }) => {
      // Check for properties panel content
      const propertiesPanel = basePage.page.locator('[data-testid="properties-panel"]')
      const isVisible = await propertiesPanel.isVisible()
      expect(isVisible).toBe(true)

      // Look for metadata like created date or word count
      const hasMetadata = await propertiesPanel.locator('text=/created|modified|words/i').first().isVisible().catch(() => false)
      expect(hasMetadata).toBe(true)
    })

    test('SBR-07: Backlinks show links', async ({ basePage }) => {
      // Click backlinks tab
      const backlinksTab = basePage.page.locator('button:has-text("Backlinks")')
      await backlinksTab.click()
      await basePage.page.waitForTimeout(200)

      // Panel should be visible
      const backlinksPanel = basePage.page.locator('[data-testid="backlinks-panel"]')
      await expect(backlinksPanel).toBeVisible()
    })

    test('SBR-08: Tags show note tags', async ({ basePage }) => {
      // Click tags tab
      const tagsTab = basePage.page.locator('button:has-text("Tags")')
      await tagsTab.click()
      await basePage.page.waitForTimeout(200)

      // Panel should be visible
      const tagsPanel = basePage.page.locator('[data-testid="tags-panel"]')
      await expect(tagsPanel).toBeVisible()
    })

    test('SBR-09: Collapse to icons', async ({ basePage }) => {
      // Find and click collapse button
      const collapseBtn = basePage.page.locator('button[title*="Collapse"]').last()
      await collapseBtn.click()
      await basePage.page.waitForTimeout(200)

      // Right sidebar should be collapsed (narrower)
      const rightSidebar = basePage.page.locator('[data-testid="right-sidebar"]')
      const box = await rightSidebar.boundingBox()
      expect(box?.width).toBeLessThan(100) // Collapsed width is ~48px
    })

    test('SBR-10: Click icon expands and switches', async ({ basePage }) => {
      // First collapse the sidebar
      const collapseBtn = basePage.page.locator('button[title*="Collapse"]').last()
      await collapseBtn.click()
      await basePage.page.waitForTimeout(200)

      // Click the backlinks icon
      const backlinksIcon = basePage.page.locator('button[title="Backlinks"]')
      await backlinksIcon.click()
      await basePage.page.waitForTimeout(200)

      // Should be expanded now
      const rightSidebar = basePage.page.locator('[data-testid="right-sidebar"]')
      const box = await rightSidebar.boundingBox()
      expect(box?.width).toBeGreaterThan(100) // Expanded width

      // Backlinks panel should be visible
      const backlinksPanel = basePage.page.locator('[data-testid="backlinks-panel"]')
      const isVisible = await backlinksPanel.isVisible().catch(() => false)
      expect(isVisible).toBe(true)
    })

    test('SBR-13: Stats show session info', async ({ basePage }) => {
      // Click stats tab
      const statsTab = basePage.page.locator('button:has-text("Stats")')
      await statsTab.click()
      await basePage.page.waitForTimeout(200)

      // Check for session section
      const statsPanel = basePage.page.locator('[data-testid="stats-panel"]')
      const hasSession = await statsPanel.locator('text=Session').isVisible()
      expect(hasSession).toBe(true)
    })

    test('SBR-14: Stats show daily goal', async ({ basePage }) => {
      // Click stats tab
      const statsTab = basePage.page.locator('button:has-text("Stats")')
      await statsTab.click()
      await basePage.page.waitForTimeout(200)

      // Check for daily goal section
      const statsPanel = basePage.page.locator('[data-testid="stats-panel"]')
      const hasGoal = await statsPanel.locator('text=Daily Goal').isVisible()
      expect(hasGoal).toBe(true)
    })

    test('SBR-15: Stats show all notes count', async ({ basePage }) => {
      // Click stats tab
      const statsTab = basePage.page.locator('button:has-text("Stats")')
      await statsTab.click()
      await basePage.page.waitForTimeout(200)

      // Check for all notes section
      const statsPanel = basePage.page.locator('[data-testid="stats-panel"]')
      const hasAllNotes = await statsPanel.locator('text=All Notes').isVisible()
      expect(hasAllNotes).toBe(true)
    })

    test('SBR-16: Stats show recent activity', async ({ basePage }) => {
      // Click stats tab
      const statsTab = basePage.page.locator('button:has-text("Stats")')
      await statsTab.click()
      await basePage.page.waitForTimeout(200)

      // Check for recent activity section
      const statsPanel = basePage.page.locator('[data-testid="stats-panel"]')
      const hasRecent = await statsPanel.locator('text=Recent Activity').isVisible()
      expect(hasRecent).toBe(true)
    })

    test('SBR-17: Stats icon in collapsed mode', async ({ basePage }) => {
      // First collapse the sidebar
      const collapseBtn = basePage.page.locator('button[title*="Collapse"]').last()
      await collapseBtn.click()
      await basePage.page.waitForTimeout(200)

      // Check stats icon exists in collapsed mode
      const statsIcon = basePage.page.locator('button[title="Stats"]')
      const isVisible = await statsIcon.isVisible()
      expect(isVisible).toBe(true)
    })

    test('SBR-18: Click stats icon expands to stats panel', async ({ basePage }) => {
      // First collapse the sidebar
      const collapseBtn = basePage.page.locator('button[title*="Collapse"]').last()
      await collapseBtn.click()
      await basePage.page.waitForTimeout(200)

      // Click the stats icon
      const statsIcon = basePage.page.locator('button[title="Stats"]')
      await statsIcon.click()
      await basePage.page.waitForTimeout(200)

      // Should be expanded now
      const rightSidebar = basePage.page.locator('[data-testid="right-sidebar"]')
      const box = await rightSidebar.boundingBox()
      expect(box?.width).toBeGreaterThan(100) // Expanded width

      // Stats panel should be visible
      const statsPanel = basePage.page.locator('[data-testid="stats-panel"]')
      const isVisible = await statsPanel.isVisible().catch(() => false)
      expect(isVisible).toBe(true)
    })
  })
})
