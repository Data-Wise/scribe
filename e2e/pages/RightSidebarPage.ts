import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

/**
 * Page Object for the Right Sidebar (Properties/Backlinks/Tags)
 *
 * Handles:
 * - Tab switching
 * - Collapse/expand
 * - Properties panel
 * - Backlinks panel
 * - Tags panel
 */
export class RightSidebarPage extends BasePage {
  readonly sidebar: Locator
  readonly propertiesTab: Locator
  readonly backlinksTab: Locator
  readonly tagsTab: Locator
  readonly collapseButton: Locator
  readonly expandButton: Locator
  readonly propertiesPanel: Locator
  readonly backlinksPanel: Locator
  readonly tagsPanel: Locator

  constructor(page: Page) {
    super(page)

    // Use data-testid selectors for stability
    this.sidebar = page.locator('[data-testid="right-sidebar"], .bg-nexus-bg-secondary').last()
    this.propertiesTab = page.getByRole('tab', { name: /properties/i }).or(page.locator('button:has-text("Properties")'))
    this.backlinksTab = page.getByRole('tab', { name: /backlinks/i }).or(page.locator('button:has-text("Backlinks")'))
    this.tagsTab = page.getByRole('tab', { name: /tags/i }).or(page.locator('button:has-text("Tags")'))
    this.collapseButton = page.locator('.sidebar-collapse-btn, button[title*="Collapse"]')
    this.expandButton = page.locator('button[title*="Expand"]')
    this.propertiesPanel = page.locator('[data-testid="properties-panel"]')
    this.backlinksPanel = page.locator('[data-testid="backlinks-panel"]')
    this.tagsPanel = page.locator('[data-testid="tags-panel"]')
  }

  /**
   * Check if right sidebar is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.sidebar.isVisible()
  }

  /**
   * Check if right sidebar is collapsed (icon-only mode)
   */
  async isCollapsed(): Promise<boolean> {
    const classes = await this.sidebar.getAttribute('class')
    return classes?.includes('right-sidebar-collapsed') || false
  }

  /**
   * Collapse the right sidebar
   */
  async collapse(): Promise<void> {
    if (!(await this.isCollapsed())) {
      await this.collapseButton.click()
      await this.page.waitForTimeout(200)
    }
  }

  /**
   * Expand the right sidebar
   */
  async expand(): Promise<void> {
    if (await this.isCollapsed()) {
      await this.expandButton.first().click()
      await this.page.waitForTimeout(200)
    }
  }

  /**
   * Toggle right sidebar visibility using ⌘⇧B
   */
  async toggle(): Promise<void> {
    await this.pressShiftShortcut('b')
    await this.page.waitForTimeout(200)
  }

  /**
   * Switch to Properties tab
   */
  async switchToProperties(): Promise<void> {
    await this.expand()
    await this.propertiesTab.click()
  }

  /**
   * Switch to Backlinks tab
   */
  async switchToBacklinks(): Promise<void> {
    await this.expand()
    await this.backlinksTab.click()
  }

  /**
   * Switch to Tags tab
   */
  async switchToTags(): Promise<void> {
    await this.expand()
    await this.tagsTab.click()
  }

  /**
   * Navigate to next tab using ⌘]
   */
  async nextTab(): Promise<void> {
    await this.pressShortcut(']')
    await this.page.waitForTimeout(200)
  }

  /**
   * Navigate to previous tab using ⌘[
   */
  async previousTab(): Promise<void> {
    await this.pressShortcut('[')
    await this.page.waitForTimeout(200)
  }

  /**
   * Get the active tab name
   */
  async getActiveTab(): Promise<'properties' | 'backlinks' | 'tags' | null> {
    if (await this.propertiesTab.locator('.active').isVisible().catch(() => false)) return 'properties'
    if (await this.backlinksTab.locator('.active').isVisible().catch(() => false)) return 'backlinks'
    if (await this.tagsTab.locator('.active').isVisible().catch(() => false)) return 'tags'

    // Check by class on the tab itself
    const propClasses = await this.propertiesTab.getAttribute('class')
    const backClasses = await this.backlinksTab.getAttribute('class')
    const tagClasses = await this.tagsTab.getAttribute('class')

    if (propClasses?.includes('active')) return 'properties'
    if (backClasses?.includes('active')) return 'backlinks'
    if (tagClasses?.includes('active')) return 'tags'

    return null
  }

  /**
   * Get word count from properties panel
   */
  async getWordCount(): Promise<number> {
    await this.switchToProperties()
    const wordText = await this.propertiesPanel.locator('text=/\\d+ words?/').textContent()
    const match = wordText?.match(/(\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  /**
   * Get backlinks (incoming links)
   */
  async getBacklinks(): Promise<string[]> {
    await this.switchToBacklinks()
    const links = this.backlinksPanel.locator('.backlink-item, .incoming-link')
    const elements = await links.all()
    const titles: string[] = []
    for (const el of elements) {
      const text = await el.textContent()
      if (text) titles.push(text.trim())
    }
    return titles
  }

  /**
   * Get outgoing links
   */
  async getOutgoingLinks(): Promise<string[]> {
    await this.switchToBacklinks()
    const links = this.backlinksPanel.locator('.outgoing-link')
    const elements = await links.all()
    const titles: string[] = []
    for (const el of elements) {
      const text = await el.textContent()
      if (text) titles.push(text.trim())
    }
    return titles
  }

  /**
   * Get tags from tags panel
   */
  async getTags(): Promise<string[]> {
    await this.switchToTags()
    const tags = this.tagsPanel.locator('.tag-item, .tag')
    const elements = await tags.all()
    const tagNames: string[] = []
    for (const el of elements) {
      const text = await el.textContent()
      if (text) tagNames.push(text.replace('#', '').trim())
    }
    return tagNames
  }

  /**
   * Check if collapsed mode shows icon buttons
   */
  async hasCollapsedIcons(): Promise<boolean> {
    await this.collapse()
    const icons = this.sidebar.locator('.right-sidebar-icon-btn')
    return (await icons.count()) >= 3
  }

  /**
   * Click an icon in collapsed mode
   */
  async clickCollapsedIcon(tab: 'properties' | 'backlinks' | 'tags'): Promise<void> {
    await this.collapse()
    const titleMap = {
      properties: 'Properties',
      backlinks: 'Backlinks',
      tags: 'Tags',
    }
    const icon = this.sidebar.locator(`button[title="${titleMap[tab]}"]`)
    await icon.click()
    // Should expand and switch to that tab
    await this.page.waitForTimeout(200)
  }
}
