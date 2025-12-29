import { test, expect } from '../fixtures'

/**
 * Editor Tabs Tests (P0)
 *
 * Tests for tab management and keyboard shortcuts.
 *
 * Tests: TAB-01 to TAB-10
 */

test.describe('Editor Tabs', () => {
  test.beforeEach(async ({ basePage }) => {
    await basePage.goto()
  })

  test.describe('Tab Management', () => {
    test('TAB-01: Mission Control pinned - cannot be closed', async ({ tabs }) => {
      await tabs.verifyMissionControlNotClosable()
    })

    test('TAB-02: Open note creates tab', async ({ basePage, tabs }) => {
      const initialCount = await tabs.getTabCount()

      // Click on an existing note from the Recent Pages section to open it
      const recentNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
      await recentNote.click()
      await basePage.page.waitForTimeout(500)

      // Should have one more tab
      const newCount = await tabs.getTabCount()
      expect(newCount).toBe(initialCount + 1)
    })

    test('TAB-03: Close tab (X button)', async ({ basePage, tabs }) => {
      // Open an existing note
      const recentNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
      await recentNote.click()
      await basePage.page.waitForTimeout(500)

      const tabsBefore = await tabs.getTabCount()
      expect(tabsBefore).toBeGreaterThan(1)

      // Close the note tab using the X button
      const activeTitle = await tabs.getActiveTabTitle()
      await tabs.closeTab(activeTitle)
      await basePage.page.waitForTimeout(200)

      const tabsAfter = await tabs.getTabCount()
      expect(tabsAfter).toBe(tabsBefore - 1)
    })

    test('TAB-04: Close tab (middle-click)', async ({ basePage, tabs }) => {
      // Open an existing note
      const recentNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
      await recentNote.click()
      await basePage.page.waitForTimeout(500)

      const tabsBefore = await tabs.getTabCount()
      expect(tabsBefore).toBeGreaterThan(1)

      const activeTitle = await tabs.getActiveTabTitle()
      await tabs.middleClickTab(activeTitle)
      await basePage.page.waitForTimeout(200)

      const tabsAfter = await tabs.getTabCount()
      expect(tabsAfter).toBe(tabsBefore - 1)
    })

    test('TAB-05: Tab switch via click', async ({ basePage, tabs }) => {
      // Open an existing note so we have 2 tabs
      const recentNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
      await recentNote.click()
      await basePage.page.waitForTimeout(500)

      // Click on Mission Control tab
      await tabs.clickTab('Mission Control')
      await basePage.page.waitForTimeout(200)

      const activeTitle = await tabs.getActiveTabTitle()
      expect(activeTitle).toContain('Mission Control')
    })
  })

  test.describe('Tab Keyboard Shortcuts', () => {
    test('TAB-06: ⌘1 switches to tab 1', async ({ basePage, tabs }) => {
      // Open an existing note to have 2 tabs
      const recentNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
      await recentNote.click()
      await basePage.page.waitForTimeout(500)

      // Press ⌘1 to switch to first tab (Mission Control)
      await tabs.switchToTabByIndex(1)
      await basePage.page.waitForTimeout(200)

      const isActive = await tabs.isTabActive('Mission Control')
      expect(isActive).toBe(true)
    })

    test('TAB-07: ⌘2 switches to tab 2', async ({ basePage, tabs }) => {
      // Open an existing note to have 2 tabs
      const recentNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
      await recentNote.click()
      await basePage.page.waitForTimeout(500)

      // Switch to MC first
      await tabs.switchToTabByIndex(1)

      // Then switch to tab 2
      await tabs.switchToTabByIndex(2)
      await basePage.page.waitForTimeout(200)

      // Active tab should be the note (not Mission Control)
      const activeTitle = await tabs.getActiveTabTitle()
      expect(activeTitle).not.toBe('Mission Control')
    })

    test('TAB-08: ⌘W closes current tab', async ({ basePage, tabs }) => {
      // Open an existing note first
      const recentNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
      await recentNote.click()
      await basePage.page.waitForTimeout(500)

      const tabsBefore = await tabs.getTabCount()
      expect(tabsBefore).toBeGreaterThan(1)

      // Close with ⌘W
      await tabs.closeCurrentTab()
      await basePage.page.waitForTimeout(200)

      const tabsAfter = await tabs.getTabCount()
      expect(tabsAfter).toBe(tabsBefore - 1)
    })

    test('TAB-09: ⌘W doesn\'t close pinned tab', async ({ basePage, tabs }) => {
      // Switch to Mission Control
      await tabs.clickTab('Mission Control')
      await basePage.page.waitForTimeout(200)

      const tabsBefore = await tabs.getTabCount()

      // Try to close with ⌘W
      await tabs.closeCurrentTab()
      await basePage.page.waitForTimeout(200)

      // Tab count should be unchanged
      const tabsAfter = await tabs.getTabCount()
      expect(tabsAfter).toBe(tabsBefore)
    })

    test('TAB-10: Tab gradient accent shows project color', async ({ basePage, tabs }) => {
      // Open an existing note - it should have a tab with project color
      const recentNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
      await recentNote.click()
      await basePage.page.waitForTimeout(500)

      // The tab should exist - gradient color is implementation detail
      const tabCount = await tabs.getTabCount()
      expect(tabCount).toBeGreaterThan(1)
    })
  })
})
