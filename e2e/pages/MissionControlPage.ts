import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

/**
 * Page Object for Mission Control Dashboard
 *
 * Handles:
 * - Dashboard content and stats
 * - Quick action buttons
 * - Project cards
 * - Recent notes
 */
export class MissionControlPage extends BasePage {
  readonly dashboard: Locator
  readonly projectCards: Locator
  readonly recentNotes: Locator
  readonly totalStats: Locator
  readonly newNoteButton: Locator
  readonly dailyNoteButton: Locator
  readonly quickCaptureButton: Locator
  readonly settingsButton: Locator

  constructor(page: Page) {
    super(page)

    this.dashboard = page.locator('.mission-control, [data-view="mission-control"]')
    this.projectCards = page.locator('.project-card, .dashboard-project')
    this.recentNotes = page.locator('.recent-notes, .recent-note-item')
    this.totalStats = page.locator('.total-stats, .dashboard-stats')
    this.newNoteButton = page.locator('button:has-text("New Note"), button[title*="New Note"]')
    this.dailyNoteButton = page.locator('button:has-text("Daily"), button[title*="Daily"]')
    this.quickCaptureButton = page.locator('button:has-text("Capture"), button[title*="Capture"]')
    this.settingsButton = page.locator('button:has-text("Settings"), button[title*="Settings"]')
  }

  /**
   * Check if Mission Control dashboard is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.dashboard.isVisible()
  }

  /**
   * Navigate to Mission Control tab
   */
  async goToMissionControl(): Promise<void> {
    await this.missionControlTab.click()
    await expect(this.dashboard).toBeVisible({ timeout: 5000 })
  }

  /**
   * Get total notes count from stats
   */
  async getTotalNotesCount(): Promise<number> {
    const statsText = await this.totalStats.textContent()
    const match = statsText?.match(/(\d+)\s*notes?/i)
    return match ? parseInt(match[1]) : 0
  }

  /**
   * Get total words count from stats
   */
  async getTotalWordsCount(): Promise<number> {
    const statsText = await this.totalStats.textContent()
    const match = statsText?.match(/(\d+)\s*words?/i)
    return match ? parseInt(match[1]) : 0
  }

  /**
   * Get project count from stats
   */
  async getProjectsCount(): Promise<number> {
    const statsText = await this.totalStats.textContent()
    const match = statsText?.match(/(\d+)\s*projects?/i)
    return match ? parseInt(match[1]) : 0
  }

  /**
   * Get all project card names
   */
  async getProjectCardNames(): Promise<string[]> {
    const cards = await this.projectCards.all()
    const names: string[] = []
    for (const card of cards) {
      const name = await card.locator('.project-name, h3').first().textContent()
      if (name) names.push(name.trim())
    }
    return names
  }

  /**
   * Click on a project card
   */
  async clickProjectCard(projectName: string): Promise<void> {
    const card = this.page.locator(`.project-card:has-text("${projectName}"), .dashboard-project:has-text("${projectName}")`)
    await card.click()
  }

  /**
   * Get recent note titles
   */
  async getRecentNoteTitles(): Promise<string[]> {
    const notes = await this.recentNotes.all()
    const titles: string[] = []
    for (const note of notes) {
      const title = await note.textContent()
      if (title) titles.push(title.trim())
    }
    return titles
  }

  /**
   * Click on a recent note
   */
  async clickRecentNote(noteTitle: string): Promise<void> {
    const note = this.page.locator(`.recent-note-item:has-text("${noteTitle}"), .recent-notes button:has-text("${noteTitle}")`)
    await note.first().click()
  }

  /**
   * Click New Note button
   */
  async clickNewNote(): Promise<void> {
    await this.newNoteButton.first().click()
  }

  /**
   * Click Daily Note button
   */
  async clickDailyNote(): Promise<void> {
    await this.dailyNoteButton.first().click()
  }

  /**
   * Click Quick Capture button
   */
  async clickQuickCapture(): Promise<void> {
    await this.quickCaptureButton.first().click()
  }

  /**
   * Click Settings button
   */
  async clickSettings(): Promise<void> {
    await this.settingsButton.first().click()
  }

  /**
   * Check if quick action buttons are visible
   */
  async areQuickActionsVisible(): Promise<boolean> {
    const newNote = await this.newNoteButton.isVisible()
    const daily = await this.dailyNoteButton.isVisible()
    return newNote || daily
  }
}
