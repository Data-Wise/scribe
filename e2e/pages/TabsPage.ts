import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

/**
 * Page Object for Editor Tabs
 *
 * Handles:
 * - Tab creation, switching, and closing
 * - Mission Control pinned tab
 * - Keyboard shortcuts for tabs
 */
export class TabsPage extends BasePage {
  readonly tabBar: Locator
  readonly tabs: Locator
  readonly missionControlTab: Locator
  readonly activeTab: Locator

  constructor(page: Page) {
    super(page)

    // Use data-testid for more stable selectors
    this.tabBar = page.locator('[data-testid="editor-tabs"]')
    this.tabs = page.locator('.editor-tab')
    this.missionControlTab = page.locator('[data-testid="tab-mission-control"]')
    this.activeTab = page.locator('.editor-tab.active')
  }

  /**
   * Get all tab titles
   */
  async getTabTitles(): Promise<string[]> {
    const tabElements = await this.tabs.all()
    const titles: string[] = []
    for (const tab of tabElements) {
      const title = await tab.locator('.tab-title').textContent()
      if (title) titles.push(title.trim())
    }
    return titles
  }

  /**
   * Get the active tab title
   */
  async getActiveTabTitle(): Promise<string> {
    // The tab title is in the title attribute of the button
    const title = await this.activeTab.getAttribute('title')
    return title?.trim() || ''
  }

  /**
   * Get the number of open tabs
   */
  async getTabCount(): Promise<number> {
    return await this.tabs.count()
  }

  /**
   * Click on a tab by title
   */
  async clickTab(title: string): Promise<void> {
    const tab = this.page.locator(`.editor-tab:has-text("${title}")`)
    await tab.click()
  }

  /**
   * Close a tab by title (click X button)
   */
  async closeTab(title: string): Promise<void> {
    const tab = this.page.locator(`.editor-tab:has-text("${title}")`)
    const closeButton = tab.locator('[data-testid="tab-close"], .tab-close')
    await closeButton.click()
  }

  /**
   * Close tab by middle-click
   */
  async middleClickTab(title: string): Promise<void> {
    const tab = this.page.locator(`.editor-tab:has-text("${title}")`)
    await tab.click({ button: 'middle' })
  }

  /**
   * Switch to a tab by index (1-based, using ⌘1-9)
   */
  async switchToTabByIndex(index: number): Promise<void> {
    if (index < 1 || index > 9) {
      throw new Error('Tab index must be between 1 and 9')
    }
    await this.pressShortcut(index.toString())
  }

  /**
   * Close the current tab using ⌘W
   */
  async closeCurrentTab(): Promise<void> {
    await this.pressShortcut('w')
  }

  /**
   * Check if Mission Control tab is pinned (has pin icon and no close button)
   */
  async isMissionControlPinned(): Promise<boolean> {
    // Check for pinned indicator
    const pinnedIndicator = this.missionControlTab.locator('[data-testid="tab-pinned"]')
    return await pinnedIndicator.isVisible().catch(() => false)
  }

  /**
   * Check if a tab exists
   */
  async hasTab(title: string): Promise<boolean> {
    const tab = this.page.locator(`.editor-tab:has-text("${title}")`)
    return await tab.isVisible()
  }

  /**
   * Check if a tab is active
   */
  async isTabActive(title: string): Promise<boolean> {
    const tab = this.page.locator(`.editor-tab:has-text("${title}")`)
    const classes = await tab.getAttribute('class')
    return classes?.includes('active') || false
  }

  /**
   * Get the tab's gradient color (for project-colored tabs)
   */
  async getTabGradientColor(title: string): Promise<string | null> {
    const tab = this.page.locator(`.editor-tab:has-text("${title}")`)
    const style = await tab.getAttribute('style')
    // Extract color from gradient or background
    const match = style?.match(/background[^:]*:\s*([^;]+)/)
    return match ? match[1] : null
  }

  /**
   * Wait for a new tab to appear
   */
  async waitForNewTab(expectedTitle: string): Promise<void> {
    const tab = this.page.locator(`.editor-tab:has-text("${expectedTitle}")`)
    await expect(tab).toBeVisible({ timeout: 5000 })
  }

  /**
   * Check that Mission Control cannot be closed with ⌘W
   */
  async verifyMissionControlNotClosable(): Promise<void> {
    // Switch to Mission Control
    await this.missionControlTab.click()
    const countBefore = await this.getTabCount()

    // Try to close with ⌘W
    await this.closeCurrentTab()
    await this.page.waitForTimeout(200)

    // Should still be there
    const countAfter = await this.getTabCount()
    expect(countAfter).toBe(countBefore)
    await expect(this.missionControlTab).toBeVisible()
  }

  /**
   * Drag a tab to reorder it
   * @param fromTitle - Title of the tab to drag
   * @param toTitle - Title of the tab to drop onto (target position)
   */
  async dragTab(fromTitle: string, toTitle: string): Promise<void> {
    const sourceTab = this.page.locator(`.editor-tab:has-text("${fromTitle}")`)
    const targetTab = this.page.locator(`.editor-tab:has-text("${toTitle}")`)

    await sourceTab.dragTo(targetTab, {
      sourcePosition: { x: 10, y: 10 },
      targetPosition: { x: 10, y: 10 },
    })
  }

  /**
   * Get the index of a tab by title (0-based)
   */
  async getTabIndex(title: string): Promise<number> {
    const titles = await this.getTabTitles()
    return titles.findIndex((t) => t.includes(title))
  }

  // ============================================================
  // Context Menu Methods
  // ============================================================

  /**
   * Right-click on a tab to open context menu
   */
  async rightClickTab(title: string): Promise<void> {
    const tab = this.page.locator(`.editor-tab:has-text("${title}")`)
    await tab.click({ button: 'right' })
  }

  /**
   * Get context menu locator
   */
  get contextMenu(): Locator {
    return this.page.locator('.tab-context-menu')
  }

  /**
   * Click a context menu item by text (exact match for button text)
   */
  async clickContextMenuItem(itemText: string): Promise<void> {
    // Use exact span text match to avoid partial matches (e.g., "Close" matching "Close Others")
    const menuItem = this.contextMenu.locator(`.context-menu-item span:text-is("${itemText}")`).locator('..')
    await menuItem.click()
  }

  /**
   * Check if context menu item is disabled
   */
  async isContextMenuItemDisabled(itemText: string): Promise<boolean> {
    const menuItem = this.contextMenu.locator(`.context-menu-item:has-text("${itemText}")`)
    const disabled = await menuItem.getAttribute('disabled')
    return disabled !== null
  }

  /**
   * Close context menu by pressing Escape
   */
  async closeContextMenu(): Promise<void> {
    await this.page.keyboard.press('Escape')
  }

  /**
   * Pin a tab via context menu
   */
  async pinTab(title: string): Promise<void> {
    await this.rightClickTab(title)
    await this.clickContextMenuItem('Pin Tab')
  }

  /**
   * Unpin a tab via context menu
   */
  async unpinTab(title: string): Promise<void> {
    await this.rightClickTab(title)
    await this.clickContextMenuItem('Unpin Tab')
  }

  /**
   * Close other tabs via context menu
   */
  async closeOtherTabs(exceptTitle: string): Promise<void> {
    await this.rightClickTab(exceptTitle)
    await this.clickContextMenuItem('Close Others')
  }

  /**
   * Close tabs to the right via context menu
   */
  async closeTabsToRight(fromTitle: string): Promise<void> {
    await this.rightClickTab(fromTitle)
    await this.clickContextMenuItem('Close to Right')
  }

  /**
   * Check if a tab is pinned
   */
  async isTabPinned(title: string): Promise<boolean> {
    const tab = this.page.locator(`.editor-tab:has-text("${title}")`)
    const classes = await tab.getAttribute('class')
    return classes?.includes('pinned') || false
  }

  // ============================================================
  // Inline Rename Methods
  // ============================================================

  /**
   * Double-click a tab to start inline editing
   */
  async doubleClickTab(title: string): Promise<void> {
    const tab = this.page.locator(`.editor-tab:has-text("${title}")`)
    await tab.dblclick()
  }

  /**
   * Get the inline edit input
   */
  get tabTitleInput(): Locator {
    return this.page.locator('.tab-title-input')
  }

  /**
   * Check if tab is in editing mode
   */
  async isTabEditing(): Promise<boolean> {
    return await this.tabTitleInput.isVisible()
  }

  /**
   * Type new title in inline edit input
   */
  async typeNewTitle(newTitle: string): Promise<void> {
    await this.tabTitleInput.fill(newTitle)
  }

  /**
   * Save inline edit by pressing Enter
   */
  async saveInlineEdit(): Promise<void> {
    await this.page.keyboard.press('Enter')
  }

  /**
   * Cancel inline edit by pressing Escape
   */
  async cancelInlineEdit(): Promise<void> {
    await this.page.keyboard.press('Escape')
  }

  /**
   * Rename a tab (full workflow)
   */
  async renameTab(oldTitle: string, newTitle: string): Promise<void> {
    await this.doubleClickTab(oldTitle)
    await this.page.waitForTimeout(100)
    await this.typeNewTitle(newTitle)
    await this.saveInlineEdit()
  }
}
