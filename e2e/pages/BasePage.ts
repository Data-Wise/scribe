import { Page, Locator, expect } from '@playwright/test'

/**
 * Base Page Object for Scribe E2E Tests
 *
 * Provides common locators and utilities shared across all page objects.
 * All page objects should extend this class.
 */
export class BasePage {
  readonly page: Page

  // Main layout sections
  readonly leftSidebar: Locator
  readonly mainContent: Locator
  readonly rightSidebar: Locator
  readonly editorTabs: Locator

  // Common buttons
  readonly missionControlTab: Locator
  readonly newProjectButton: Locator
  readonly settingsButton: Locator

  constructor(page: Page) {
    this.page = page

    // Layout locators - prefer data-testid selectors for stability
    this.leftSidebar = page.locator('[data-testid="left-sidebar"]')
    this.mainContent = page.locator('.flex-1.flex.flex-col.min-w-0')
    this.rightSidebar = page.locator('[data-testid="right-sidebar"], .bg-nexus-bg-secondary').last()
    this.editorTabs = page.locator('[data-testid="editor-tabs"]')

    // Common buttons - use role-based selectors where possible
    this.missionControlTab = page.locator('[data-testid="tab-mission-control"]')
    this.newProjectButton = page.getByRole('button', { name: /new project/i }).or(page.locator('button[title*="New project"]'))
    this.settingsButton = page.getByRole('button', { name: /settings/i }).or(page.locator('button[title*="Settings"]'))
  }

  /**
   * Navigate to the app and wait for it to be ready
   */
  async goto(): Promise<void> {
    await this.page.goto('/')
    await this.waitForAppReady()
  }

  /**
   * Wait for the app to be fully loaded
   */
  async waitForAppReady(): Promise<void> {
    await this.page.waitForLoadState('networkidle')
    await expect(this.leftSidebar).toBeVisible({ timeout: 10000 })
  }

  /**
   * Get the page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title()
  }

  /**
   * Press a keyboard shortcut (macOS style with Meta key)
   * @param key - Key combination (e.g., 'n' for ⌘N, 'Shift+f' for ⌘⇧F)
   */
  async pressShortcut(key: string): Promise<void> {
    await this.page.keyboard.press(`Meta+${key}`)
  }

  /**
   * Press a keyboard shortcut with Shift (e.g., ⌘⇧P)
   * Note: Uppercase the key since Shift+f produces 'F' in JavaScript
   */
  async pressShiftShortcut(key: string): Promise<void> {
    await this.page.keyboard.press(`Meta+Shift+${key.toUpperCase()}`)
  }

  /**
   * Wait for a modal/dialog to appear
   */
  async waitForModal(): Promise<Locator> {
    const modal = this.page.locator('[role="dialog"]')
    await expect(modal).toBeVisible({ timeout: 5000 })
    return modal
  }

  /**
   * Close any open modal by pressing Escape
   */
  async closeModal(): Promise<void> {
    await this.page.keyboard.press('Escape')
    await expect(this.page.locator('[role="dialog"]')).not.toBeVisible()
  }

  /**
   * Get the current sidebar mode
   */
  async getSidebarMode(): Promise<string | null> {
    return await this.leftSidebar.getAttribute('data-mode')
  }

  /**
   * Check if focus mode is active
   */
  async isFocusModeActive(): Promise<boolean> {
    const focusHeader = this.page.locator('text=Focus Mode')
    return await focusHeader.isVisible()
  }

  /**
   * Take a screenshot with a descriptive name
   */
  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png` })
  }

  /**
   * Wait for content to save (debounce time + buffer)
   */
  async waitForAutoSave(): Promise<void> {
    await this.page.waitForTimeout(1500) // 1s debounce + 500ms buffer
  }

  /**
   * Get text content from an element, trimmed
   */
  async getText(locator: Locator): Promise<string> {
    const text = await locator.textContent()
    return text?.trim() || ''
  }
}
