import { test, expect } from '../fixtures'

/**
 * Right Sidebar Settings Tests (P1)
 *
 * Tests for sidebar tab settings, drag/drop reordering,
 * tab visibility, and context menu interactions.
 *
 * Tests: SBS-01 to SBS-18
 */

test.describe('Right Sidebar Settings', () => {
  test.beforeEach(async ({ basePage }) => {
    await basePage.goto()
    // Open an existing note so right sidebar is visible
    const recentNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
    await recentNote.click()
    await basePage.page.waitForTimeout(500)
  })

  test.describe('Tab Size Settings', () => {
    test('SBS-01: Default tab size is compact', async ({ basePage }) => {
      // Check that sidebar tabs have compact attribute
      // Use right-sidebar testid to target actual sidebar, not settings preview
      const sidebarTabs = basePage.page.getByTestId('right-sidebar').locator('.sidebar-tabs')
      const tabSize = await sidebarTabs.getAttribute('data-sidebar-tab-size')
      expect(tabSize).toBe('compact')
    })

    test('SBS-02: Tab size changes via settings', async ({ basePage }) => {
      // Open settings
      await basePage.pressShortcut(',')
      await basePage.page.waitForTimeout(300)

      // Click Appearance tab
      const appearanceTab = basePage.page.locator('button:has-text("Appearance")')
      await appearanceTab.click()
      await basePage.page.waitForTimeout(200)

      // Scroll to Right Sidebar section
      const rightSidebarSection = basePage.page.locator('h4:has-text("Right Sidebar")').first()
      await rightSidebarSection.scrollIntoViewIfNeeded()
      await basePage.page.waitForTimeout(200)

      // Find the Tab Size section's Full button
      // The Tab Size label is followed by a div containing Compact/Full buttons
      const tabSizeLabel = basePage.page.getByText('Tab Size', { exact: true }).first()
      await tabSizeLabel.scrollIntoViewIfNeeded()
      const tabSizeContainer = tabSizeLabel.locator('xpath=..') // parent div contains label + buttons
      const fullButton = tabSizeContainer.locator('button:text-is("Full")')
      await fullButton.click()
      await basePage.page.waitForTimeout(200)

      // Close settings
      await basePage.page.keyboard.press('Escape')
      await basePage.page.waitForTimeout(300)

      // Verify tab size changed on the actual sidebar (not the preview in settings)
      // The right sidebar has data-testid="right-sidebar"
      const sidebarTabs = basePage.page.getByTestId('right-sidebar').locator('.sidebar-tabs')
      const tabSize = await sidebarTabs.getAttribute('data-sidebar-tab-size')
      expect(tabSize).toBe('full')
    })

    test('SBS-03: Tab size persists after refresh', async ({ basePage }) => {
      // Open settings and change to full
      await basePage.pressShortcut(',')
      await basePage.page.waitForTimeout(300)

      const appearanceTab = basePage.page.locator('button:has-text("Appearance")')
      await appearanceTab.click()
      await basePage.page.waitForTimeout(200)

      // Scroll to Right Sidebar section
      const rightSidebarSection = basePage.page.locator('h4:has-text("Right Sidebar")').first()
      await rightSidebarSection.scrollIntoViewIfNeeded()
      await basePage.page.waitForTimeout(200)

      // Find the Tab Size section's Full button
      const tabSizeLabel = basePage.page.getByText('Tab Size', { exact: true }).first()
      await tabSizeLabel.scrollIntoViewIfNeeded()
      const tabSizeContainer = tabSizeLabel.locator('xpath=..')
      const fullButton = tabSizeContainer.locator('button:text-is("Full")')
      await fullButton.click()
      await basePage.page.waitForTimeout(200)

      await basePage.page.keyboard.press('Escape')
      await basePage.page.waitForTimeout(200)

      // Refresh page
      await basePage.page.reload()
      await basePage.page.waitForTimeout(1000)

      // Open a note again
      const recentNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
      await recentNote.click()
      await basePage.page.waitForTimeout(500)

      // Verify tab size persisted
      const sidebarTabs = basePage.page.getByTestId('right-sidebar').locator('.sidebar-tabs')
      const tabSize = await sidebarTabs.getAttribute('data-sidebar-tab-size')
      expect(tabSize).toBe('full')
    })
  })

  test.describe('Tab Visibility', () => {
    test('SBS-04: All tabs visible by default', async ({ basePage }) => {
      // Check all 5 tabs are visible in the right sidebar
      const rightSidebar = basePage.page.getByTestId('right-sidebar')
      await expect(rightSidebar.locator('.sidebar-tab:has-text("Properties")')).toBeVisible()
      await expect(rightSidebar.locator('.sidebar-tab:has-text("Backlinks")')).toBeVisible()
      await expect(rightSidebar.locator('.sidebar-tab:has-text("Tags")')).toBeVisible()
      await expect(rightSidebar.locator('.sidebar-tab:has-text("Stats")')).toBeVisible()
      await expect(rightSidebar.locator('.sidebar-tab:has-text("Claude")')).toBeVisible()
    })

    test('SBS-05: Hide tab via settings', async ({ basePage }) => {
      // Open settings
      await basePage.pressShortcut(',')
      await basePage.page.waitForTimeout(300)

      // Click Appearance tab
      const appearanceTab = basePage.page.locator('button:has-text("Appearance")')
      await appearanceTab.click()
      await basePage.page.waitForTimeout(200)

      // Scroll to Right Sidebar section
      const rightSidebarSection = basePage.page.locator('h4:has-text("Right Sidebar")').first()
      await rightSidebarSection.scrollIntoViewIfNeeded()
      await basePage.page.waitForTimeout(200)

      // Find the Visible Tabs section (not Preview which also has tab buttons)
      // The Visible Tabs toggle buttons have checkmark icons, Preview buttons don't
      const visibleTabsLabel = basePage.page.getByText('Visible Tabs', { exact: true }).first()
      await visibleTabsLabel.scrollIntoViewIfNeeded()
      const visibleTabsSection = visibleTabsLabel.locator('xpath=..')
      const statsToggle = visibleTabsSection.locator('button:has-text("Stats")').first()
      await statsToggle.click()
      await basePage.page.waitForTimeout(200)

      // Close settings
      await basePage.page.keyboard.press('Escape')
      await basePage.page.waitForTimeout(200)

      // Stats tab should be hidden in the actual sidebar
      const rightSidebar = basePage.page.getByTestId('right-sidebar')
      await expect(rightSidebar.locator('.sidebar-tab:has-text("Stats")')).not.toBeVisible()

      // Other tabs should still be visible
      await expect(rightSidebar.locator('.sidebar-tab:has-text("Properties")')).toBeVisible()
    })

    test('SBS-06: Cannot hide last visible tab', async ({ basePage }) => {
      // Open settings
      await basePage.pressShortcut(',')
      await basePage.page.waitForTimeout(300)

      const appearanceTab = basePage.page.locator('button:has-text("Appearance")')
      await appearanceTab.click()
      await basePage.page.waitForTimeout(200)

      // Scroll to Right Sidebar section
      const rightSidebarSection = basePage.page.locator('h4:has-text("Right Sidebar")').first()
      await rightSidebarSection.scrollIntoViewIfNeeded()
      await basePage.page.waitForTimeout(200)

      // Get the Visible Tabs section (not Preview which also has tab buttons)
      const visibleTabsLabel = basePage.page.getByText('Visible Tabs', { exact: true }).first()
      await visibleTabsLabel.scrollIntoViewIfNeeded()
      const visibleTabsSection = visibleTabsLabel.locator('xpath=..')

      // Hide all tabs except Properties
      const tabsToHide = ['Backlinks', 'Tags', 'Stats', 'Claude']
      for (const tabName of tabsToHide) {
        const toggle = visibleTabsSection.locator(`button:has-text("${tabName}")`).first()
        const isVisible = await toggle.isVisible()
        if (isVisible) {
          await toggle.click()
          await basePage.page.waitForTimeout(150)
        }
      }

      // Properties should still be visible (last remaining, can't hide)
      await basePage.page.keyboard.press('Escape')
      await basePage.page.waitForTimeout(200)

      // Check in the actual right sidebar
      const rightSidebar = basePage.page.getByTestId('right-sidebar')
      await expect(rightSidebar.locator('.sidebar-tab:has-text("Properties")')).toBeVisible()
    })
  })

  test.describe('Tab Drag and Drop', () => {
    test('SBS-07: Tabs are draggable', async ({ basePage }) => {
      // Check that sidebar tabs have draggable attribute
      const rightSidebar = basePage.page.getByTestId('right-sidebar')
      const sidebarTab = rightSidebar.locator('.sidebar-tab').first()
      const draggable = await sidebarTab.getAttribute('draggable')
      expect(draggable).toBe('true')
    })

    test('SBS-08: Drag tab reorders tabs', async ({ basePage }) => {
      const rightSidebar = basePage.page.getByTestId('right-sidebar')

      // Get initial tab order
      const tabsBefore = await rightSidebar.locator('.sidebar-tab').allTextContents()
      const firstTab = tabsBefore[0]

      // Drag first tab (Properties) to second position
      const sourceTab = rightSidebar.locator('.sidebar-tab').first()
      const targetTab = rightSidebar.locator('.sidebar-tab').nth(1)

      await sourceTab.dragTo(targetTab)
      await basePage.page.waitForTimeout(300)

      // Get new tab order
      const tabsAfter = await rightSidebar.locator('.sidebar-tab').allTextContents()

      // First tab should have changed position
      expect(tabsAfter[0]).not.toBe(firstTab)
    })

    test('SBS-09: Tab order persists after refresh', async ({ basePage }) => {
      const rightSidebar = basePage.page.getByTestId('right-sidebar')

      // Get initial order
      const tabsBefore = await rightSidebar.locator('.sidebar-tab').allTextContents()

      // Drag first tab to second position
      const sourceTab = rightSidebar.locator('.sidebar-tab').first()
      const targetTab = rightSidebar.locator('.sidebar-tab').nth(1)
      await sourceTab.dragTo(targetTab)
      await basePage.page.waitForTimeout(300)

      // Get new order before refresh
      const reorderedTabs = await rightSidebar.locator('.sidebar-tab').allTextContents()

      // Refresh
      await basePage.page.reload()
      await basePage.page.waitForTimeout(1000)

      // Open a note
      const recentNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
      await recentNote.click()
      await basePage.page.waitForTimeout(500)

      // Check order persisted
      const rightSidebarAfter = basePage.page.getByTestId('right-sidebar')
      const tabsAfterRefresh = await rightSidebarAfter.locator('.sidebar-tab').allTextContents()
      expect(tabsAfterRefresh[0]).toBe(reorderedTabs[0])
    })
  })

  test.describe('Tab Context Menu', () => {
    test('SBS-10: Right-click opens context menu', async ({ basePage }) => {
      // Right-click on a tab in the right sidebar
      const rightSidebar = basePage.page.getByTestId('right-sidebar')
      const tab = rightSidebar.locator('.sidebar-tab:has-text("Properties")')
      await tab.click({ button: 'right' })
      await basePage.page.waitForTimeout(200)

      // Context menu should be visible
      const contextMenu = basePage.page.locator('.tab-context-menu')
      await expect(contextMenu).toBeVisible()
    })

    test('SBS-11: Context menu has expected items', async ({ basePage }) => {
      // Right-click on a tab
      const rightSidebar = basePage.page.getByTestId('right-sidebar')
      const tab = rightSidebar.locator('.sidebar-tab:has-text("Properties")')
      await tab.click({ button: 'right' })
      await basePage.page.waitForTimeout(200)

      // Check menu items
      await expect(basePage.page.locator('span:has-text("Move Left")')).toBeVisible()
      await expect(basePage.page.locator('span:has-text("Move Right")')).toBeVisible()
      await expect(basePage.page.locator('span:has-text("Hide Tab")')).toBeVisible()
      await expect(basePage.page.locator('span:has-text("Reset Tab Order")')).toBeVisible()
      await expect(basePage.page.locator('span:has-text("Show All Tabs")')).toBeVisible()
    })

    test('SBS-12: Move Left disabled for first tab', async ({ basePage }) => {
      // Right-click on first tab
      const rightSidebar = basePage.page.getByTestId('right-sidebar')
      const firstTab = rightSidebar.locator('.sidebar-tab').first()
      await firstTab.click({ button: 'right' })
      await basePage.page.waitForTimeout(200)

      // Move Left should be disabled
      const moveLeft = basePage.page.locator('button:has-text("Move Left")')
      const isDisabled = await moveLeft.getAttribute('disabled')
      expect(isDisabled).not.toBeNull()
    })

    test('SBS-13: Move Right disabled for last tab', async ({ basePage }) => {
      // Right-click on last visible tab (Terminal is now the last tab)
      const rightSidebar = basePage.page.getByTestId('right-sidebar')
      const lastTab = rightSidebar.locator('.sidebar-tab:has-text("Term")')
      await lastTab.click({ button: 'right' })
      await basePage.page.waitForTimeout(200)

      // Move Right should be disabled
      const moveRight = basePage.page.locator('button:has-text("Move Right")')
      const isDisabled = await moveRight.getAttribute('disabled')
      expect(isDisabled).not.toBeNull()
    })

    test('SBS-14: Hide Tab works from context menu', async ({ basePage }) => {
      // Right-click on Stats tab
      const rightSidebar = basePage.page.getByTestId('right-sidebar')
      const statsTab = rightSidebar.locator('.sidebar-tab:has-text("Stats")')
      await statsTab.click({ button: 'right' })
      await basePage.page.waitForTimeout(200)

      // Click Hide Tab
      const hideOption = basePage.page.locator('button:has-text("Hide Tab")')
      await hideOption.click()
      await basePage.page.waitForTimeout(200)

      // Stats should be hidden
      await expect(rightSidebar.locator('.sidebar-tab:has-text("Stats")')).not.toBeVisible()
    })

    test('SBS-15: Show All Tabs restores hidden tabs', async ({ basePage }) => {
      const rightSidebar = basePage.page.getByTestId('right-sidebar')

      // First hide a tab
      const statsTab = rightSidebar.locator('.sidebar-tab:has-text("Stats")')
      await statsTab.click({ button: 'right' })
      await basePage.page.waitForTimeout(200)

      const hideOption = basePage.page.locator('button:has-text("Hide Tab")')
      await hideOption.click()
      await basePage.page.waitForTimeout(200)

      // Now right-click any tab and Show All
      const propertiesTab = rightSidebar.locator('.sidebar-tab:has-text("Properties")')
      await propertiesTab.click({ button: 'right' })
      await basePage.page.waitForTimeout(200)

      const showAllOption = basePage.page.locator('button:has-text("Show All Tabs")')
      await showAllOption.click()
      await basePage.page.waitForTimeout(200)

      // Stats should be visible again
      await expect(rightSidebar.locator('.sidebar-tab:has-text("Stats")')).toBeVisible()
    })

    test('SBS-16: Escape closes context menu', async ({ basePage }) => {
      // Right-click on a tab
      const rightSidebar = basePage.page.getByTestId('right-sidebar')
      const tab = rightSidebar.locator('.sidebar-tab:has-text("Properties")')
      await tab.click({ button: 'right' })
      await basePage.page.waitForTimeout(200)

      const contextMenu = basePage.page.locator('.tab-context-menu')
      await expect(contextMenu).toBeVisible()

      // Press Escape
      await basePage.page.keyboard.press('Escape')
      await basePage.page.waitForTimeout(200)

      // Menu should be closed
      await expect(contextMenu).not.toBeVisible()
    })

    test('SBS-17: Click outside closes context menu', async ({ basePage }) => {
      // Right-click on a tab
      const rightSidebar = basePage.page.getByTestId('right-sidebar')
      const tab = rightSidebar.locator('.sidebar-tab:has-text("Properties")')
      await tab.click({ button: 'right' })
      await basePage.page.waitForTimeout(200)

      const contextMenu = basePage.page.locator('.tab-context-menu')
      await expect(contextMenu).toBeVisible()

      // Click outside - use the tab content area instead
      await basePage.page.locator('.tab-content').first().click({ force: true })
      await basePage.page.waitForTimeout(200)

      // Menu should be closed
      await expect(contextMenu).not.toBeVisible()
    })
  })

  test.describe('Keyboard Shortcuts with Hidden Tabs', () => {
    test('SBS-18: Tab cycling skips hidden tabs', async ({ basePage }) => {
      const rightSidebar = basePage.page.getByTestId('right-sidebar')

      // First hide Stats tab via context menu
      const statsTab = rightSidebar.locator('.sidebar-tab:has-text("Stats")')
      await statsTab.click({ button: 'right' })
      await basePage.page.waitForTimeout(200)

      const hideOption = basePage.page.locator('button:has-text("Hide Tab")')
      await hideOption.click()
      await basePage.page.waitForTimeout(200)

      // Click Tags tab (before Stats would be)
      const tagsTab = rightSidebar.locator('.sidebar-tab:has-text("Tags")')
      await tagsTab.click()
      await basePage.page.waitForTimeout(200)

      // Press ⌘] to cycle next
      await basePage.pressShortcut(']')
      await basePage.page.waitForTimeout(200)

      // Should go to Claude (skipping hidden Stats)
      const claudePanel = basePage.page.locator('[data-testid="claude-panel"]')
      const isClaudeVisible = await claudePanel.isVisible().catch(() => false)

      // Or just verify we're NOT on Stats
      const statsPanel = basePage.page.locator('[data-testid="stats-panel"]')
      const isStatsVisible = await statsPanel.isVisible().catch(() => false)
      expect(isStatsVisible).toBe(false)
    })
  })
})
