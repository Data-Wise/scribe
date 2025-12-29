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
      const title = await tab.locator('.tab-title, span').first().textContent()
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
}
