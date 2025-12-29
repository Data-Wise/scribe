import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

/**
 * Page Object for the Left Sidebar (MissionSidebar)
 *
 * Handles:
 * - Sidebar mode cycling (icon/compact/card)
 * - Project selection and management
 * - Note listing in card mode
 */
export class SidebarPage extends BasePage {
  // Mode-specific elements
  readonly expandButton: Locator
  readonly addProjectButton: Locator
  readonly projectIcons: Locator
  readonly projectList: Locator
  readonly projectCards: Locator
  readonly resizeHandle: Locator

  constructor(page: Page) {
    super(page)

    // Use data-testid selectors for stability
    this.expandButton = page.locator('button[title*="Expand sidebar"]')
    this.addProjectButton = page.getByRole('button', { name: /new project/i }).or(page.locator('button[title*="New project"]'))
    this.projectIcons = page.locator('.project-icon-btn')
    this.projectList = page.locator('.project-list-item')
    this.projectCards = page.locator('.project-card')
    this.resizeHandle = page.locator('.resize-handle')
  }

  /**
   * Cycle through sidebar modes (icon → compact → card → icon)
   */
  async cycleMode(): Promise<void> {
    await this.pressShortcut('0')
    await this.page.waitForTimeout(300) // Wait for transition
  }

  /**
   * Set sidebar to a specific mode
   */
  async setMode(targetMode: 'icon' | 'compact' | 'card'): Promise<void> {
    let currentMode = await this.getSidebarMode()
    let attempts = 0

    while (currentMode !== targetMode && attempts < 4) {
      await this.cycleMode()
      currentMode = await this.getSidebarMode()
      attempts++
    }

    expect(currentMode).toBe(targetMode)
  }

  /**
   * Check if sidebar is in icon mode (48px)
   */
  async isIconMode(): Promise<boolean> {
    return (await this.getSidebarMode()) === 'icon'
  }

  /**
   * Check if sidebar is in compact mode (240px)
   */
  async isCompactMode(): Promise<boolean> {
    return (await this.getSidebarMode()) === 'compact'
  }

  /**
   * Check if sidebar is in card mode (320px+)
   */
  async isCardMode(): Promise<boolean> {
    return (await this.getSidebarMode()) === 'card'
  }

  /**
   * Get all visible project names
   */
  async getProjectNames(): Promise<string[]> {
    const mode = await this.getSidebarMode()

    if (mode === 'icon') {
      // In icon mode, get names from tooltips on project-icon-btn
      const buttons = await this.projectIcons.all()
      const names: string[] = []
      for (const btn of buttons) {
        const title = await btn.getAttribute('title')
        if (title) {
          // Extract project name from tooltip (format: "Project Name - status (X notes)")
          const match = title.match(/^([^-]+)/)
          if (match) names.push(match[1].trim())
        }
      }
      return names
    }

    // In compact/card mode, try multiple selectors to find project names
    // The sidebar structure varies - look for common patterns
    const nameSelectors = [
      // Card mode - project cards have project name in various places
      '.project-card h3',
      '.project-card .card-title',
      // Compact mode - button text
      'button[class*="project"]',
      // The actual structure from error-context: button with project name
      'button:has(img) > div > div:first-child',
    ]

    for (const selector of nameSelectors) {
      const elements = await this.leftSidebar.locator(selector).all()
      if (elements.length > 0) {
        const names: string[] = []
        for (const el of elements) {
          const text = await el.textContent()
          // Filter out common non-project text
          if (text && !text.includes('New Project') && !text.includes('Collapse') && text.trim().length > 0) {
            // Clean up the text - remove extra whitespace and nested text
            const cleaned = text.trim().split('\n')[0].trim()
            if (cleaned.length > 0 && !names.includes(cleaned)) {
              names.push(cleaned)
            }
          }
        }
        if (names.length > 0) return names
      }
    }

    // Fallback: look for any button that seems to be a project (has the project structure)
    const projectButtons = await this.leftSidebar.locator('button').filter({ hasText: /Research|Teaching|Generic|Package/ }).all()
    const names: string[] = []
    for (const btn of projectButtons) {
      const text = await btn.getAttribute('aria-label') || await btn.textContent()
      if (text) {
        // Extract just the project name
        const match = text.match(/(Research|Teaching|Generic|Package|[\w\s]+?)(?:\s+Active|\s+\d|$)/)
        if (match) names.push(match[1].trim())
      }
    }
    return names
  }

  /**
   * Select a project by name
   */
  async selectProject(name: string): Promise<void> {
    const mode = await this.getSidebarMode()

    if (mode === 'icon') {
      // Click project icon by tooltip
      await this.page.locator(`button[title*="${name}"]`).click()
    } else {
      // Click project in list/card
      await this.page.locator(`text=${name}`).first().click()
    }
  }

  /**
   * Check if a project is selected (active)
   */
  async isProjectSelected(name: string): Promise<boolean> {
    const mode = await this.getSidebarMode()

    if (mode === 'icon') {
      const btn = this.page.locator(`button[title*="${name}"]`)
      return await btn.locator('.active').isVisible().catch(() => false)
    }

    const item = this.page.locator(`text=${name}`).first()
    const parent = item.locator('..')
    const classes = await parent.getAttribute('class')
    return classes?.includes('active') || classes?.includes('selected') || false
  }

  /**
   * Click the add project button
   */
  async clickAddProject(): Promise<void> {
    await this.addProjectButton.first().click()
    await this.waitForModal()
  }

  /**
   * Get notes displayed in a project card (card mode only)
   */
  async getProjectNotes(projectName: string): Promise<string[]> {
    await this.setMode('card')

    const card = this.page.locator(`.project-card:has-text("${projectName}")`)
    const noteItems = card.locator('.note-item, .note-tile')
    const elements = await noteItems.all()

    const notes: string[] = []
    for (const el of elements) {
      const text = await el.textContent()
      if (text) notes.push(text.trim())
    }
    return notes
  }

  /**
   * Click a note in a project card
   */
  async clickNoteInCard(noteName: string): Promise<void> {
    await this.page.locator(`.note-item:has-text("${noteName}"), .note-tile:has-text("${noteName}")`).first().click()
  }

  /**
   * Check if status dots are visible (icon mode)
   */
  async areStatusDotsVisible(): Promise<boolean> {
    await this.setMode('icon')
    const dots = this.page.locator('.status-dot, .activity-dot')
    return await dots.first().isVisible()
  }

  /**
   * Hover over a project icon to see tooltip
   */
  async hoverProjectIcon(projectName: string): Promise<string> {
    const icon = this.page.locator(`button[title*="${projectName}"]`)
    await icon.hover()
    const title = await icon.getAttribute('title')
    return title || ''
  }
}
