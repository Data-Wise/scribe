import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

/**
 * Page Object for Modals and Dialogs
 *
 * Handles:
 * - Command Palette
 * - Settings Modal
 * - Create Project Modal
 * - Search Panel
 * - Quick Capture
 * - Export Dialog
 * - Keyboard Shortcuts
 */
export class ModalsPage extends BasePage {
  readonly commandPalette: Locator
  readonly settingsModal: Locator
  readonly createProjectModal: Locator
  readonly searchPanel: Locator
  readonly quickCaptureOverlay: Locator
  readonly exportDialog: Locator
  readonly keyboardShortcuts: Locator
  readonly graphView: Locator

  constructor(page: Page) {
    super(page)

    // Command palette - use data-testid
    this.commandPalette = page.locator('[data-testid="command-palette"]')

    // Settings modal - use data-testid
    this.settingsModal = page.locator('[data-testid="settings-modal"]')

    // Create Project modal - use data-testid
    this.createProjectModal = page.locator('[data-testid="create-project-modal"]')

    // Search panel - typically a slide-in panel
    this.searchPanel = page.locator('.search-panel, [data-testid="search-panel"]')

    // Quick capture overlay
    this.quickCaptureOverlay = page.locator('.quick-capture-overlay, [data-testid="quick-capture"]')

    // Export dialog
    this.exportDialog = page.locator('.export-dialog, [data-testid="export-dialog"]')

    // Keyboard shortcuts panel
    this.keyboardShortcuts = page.locator('.keyboard-shortcuts, [data-testid="keyboard-shortcuts"]')

    // Graph view
    this.graphView = page.locator('.graph-view, [data-testid="graph-view"]')
  }

  // ===== Command Palette (⌘K) =====

  /**
   * Open command palette with ⌘K
   */
  async openCommandPalette(): Promise<void> {
    await this.pressShortcut('k')
    await expect(this.commandPalette).toBeVisible({ timeout: 3000 })
  }

  /**
   * Check if command palette is open
   */
  async isCommandPaletteOpen(): Promise<boolean> {
    return await this.commandPalette.isVisible()
  }

  /**
   * Search in command palette
   */
  async searchCommandPalette(query: string): Promise<void> {
    const input = this.commandPalette.locator('input')
    await input.fill(query)
  }

  /**
   * Select a command palette item by text or data-testid
   */
  async selectCommandItem(text: string): Promise<void> {
    // Try data-testid first for reliability, fall back to text matching
    const testIdMap: Record<string, string> = {
      'new note': 'cmd-new-note',
      'create new page': 'cmd-new-note',
      'daily note': 'cmd-daily-note',
      'open today': 'cmd-daily-note',
    }
    const lowered = text.toLowerCase()
    const testId = Object.entries(testIdMap).find(([key]) => lowered.includes(key))?.[1]

    if (testId) {
      await this.commandPalette.locator(`[data-testid="${testId}"]`).click()
    } else {
      const item = this.commandPalette.locator(`.command-palette-item:has-text("${text}")`)
      await item.click()
    }
  }

  /**
   * Get command palette results
   */
  async getCommandResults(): Promise<string[]> {
    const items = this.commandPalette.locator('.command-palette-item')
    const elements = await items.all()
    const results: string[] = []
    for (const el of elements) {
      const text = await el.textContent()
      if (text) results.push(text.trim())
    }
    return results
  }

  // ===== Settings Modal (⌘,) =====

  /**
   * Open settings modal with ⌘,
   */
  async openSettings(): Promise<void> {
    await this.pressShortcut(',')
    await expect(this.settingsModal).toBeVisible({ timeout: 3000 })
  }

  /**
   * Check if settings modal is open
   */
  async isSettingsOpen(): Promise<boolean> {
    return await this.settingsModal.isVisible()
  }

  /**
   * Close settings modal
   */
  async closeSettings(): Promise<void> {
    const closeButton = this.settingsModal.locator('button[aria-label="Close"], .close-button')
    await closeButton.click()
  }

  /**
   * Select a theme by name
   */
  async selectTheme(themeName: string): Promise<void> {
    const themeButton = this.settingsModal.locator(`.theme-option:has-text("${themeName}")`)
    await themeButton.click()
  }

  // ===== Create Project Modal (⌘⇧P) =====

  /**
   * Open create project modal with ⌘⇧P
   */
  async openCreateProject(): Promise<void> {
    await this.pressShiftShortcut('p')
    await expect(this.createProjectModal).toBeVisible({ timeout: 3000 })
  }

  /**
   * Check if create project modal is open
   */
  async isCreateProjectOpen(): Promise<boolean> {
    return await this.createProjectModal.isVisible()
  }

  /**
   * Fill and submit create project form
   */
  async createProject(name: string, type: string = 'research'): Promise<void> {
    await this.openCreateProject()

    // Fill name
    const nameInput = this.createProjectModal.locator('input[name="name"]')
    await nameInput.fill(name)

    // Select type if dropdown exists
    const typeSelect = this.createProjectModal.locator('select[name="type"]')
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption(type)
    }

    // Submit
    const submitButton = this.createProjectModal.locator('button[type="submit"]')
    await submitButton.click()

    // Wait for modal to close
    await expect(this.createProjectModal).not.toBeVisible({ timeout: 3000 })
  }

  // ===== Search Panel (⌘F) =====

  /**
   * Open search panel with ⌘F
   */
  async openSearch(): Promise<void> {
    await this.pressShortcut('f')
    await expect(this.searchPanel).toBeVisible({ timeout: 3000 })
  }

  /**
   * Check if search panel is open
   */
  async isSearchOpen(): Promise<boolean> {
    return await this.searchPanel.isVisible()
  }

  /**
   * Search for notes
   */
  async searchNotes(query: string): Promise<void> {
    const input = this.searchPanel.locator('input')
    await input.fill(query)
    await this.page.waitForTimeout(300) // Debounce
  }

  /**
   * Get search results
   */
  async getSearchResults(): Promise<string[]> {
    const results = this.searchPanel.locator('.search-result, .result-item')
    const elements = await results.all()
    const titles: string[] = []
    for (const el of elements) {
      const text = await el.textContent()
      if (text) titles.push(text.trim())
    }
    return titles
  }

  /**
   * Click a search result
   */
  async clickSearchResult(title: string): Promise<void> {
    const result = this.searchPanel.locator(`.search-result:has-text("${title}")`)
    await result.click()
  }

  // ===== Quick Capture (⌘⇧C) =====

  /**
   * Open quick capture with ⌘⇧C
   */
  async openQuickCapture(): Promise<void> {
    await this.pressShiftShortcut('c')
    await expect(this.quickCaptureOverlay).toBeVisible({ timeout: 3000 })
  }

  /**
   * Check if quick capture is open
   */
  async isQuickCaptureOpen(): Promise<boolean> {
    return await this.quickCaptureOverlay.isVisible()
  }

  /**
   * Submit quick capture
   */
  async submitQuickCapture(content: string, title?: string): Promise<void> {
    await this.openQuickCapture()

    if (title) {
      const titleInput = this.quickCaptureOverlay.locator('input[name="title"]')
      await titleInput.fill(title)
    }

    const contentInput = this.quickCaptureOverlay.locator('textarea, [contenteditable="true"]')
    await contentInput.fill(content)

    const submitButton = this.quickCaptureOverlay.locator('button[type="submit"], button:has-text("Capture")')
    await submitButton.click()
  }

  // ===== Export Dialog (⌘⇧E) =====

  /**
   * Open export dialog with ⌘⇧E
   */
  async openExport(): Promise<void> {
    await this.pressShiftShortcut('e')
    await expect(this.exportDialog).toBeVisible({ timeout: 3000 })
  }

  // ===== Keyboard Shortcuts (⌘?) =====

  /**
   * Open keyboard shortcuts panel with ⌘?
   */
  async openKeyboardShortcuts(): Promise<void> {
    await this.pressShortcut('?')
    await expect(this.keyboardShortcuts).toBeVisible({ timeout: 3000 })
  }

  /**
   * Check if keyboard shortcuts panel is open
   */
  async isKeyboardShortcutsOpen(): Promise<boolean> {
    return await this.keyboardShortcuts.isVisible()
  }

  // ===== Graph View (⌘⇧G) =====

  /**
   * Open graph view with ⌘⇧G
   */
  async openGraphView(): Promise<void> {
    await this.pressShiftShortcut('g')
    await expect(this.graphView).toBeVisible({ timeout: 3000 })
  }

  /**
   * Check if graph view is open
   */
  async isGraphViewOpen(): Promise<boolean> {
    return await this.graphView.isVisible()
  }
}
