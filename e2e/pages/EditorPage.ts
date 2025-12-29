import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

/**
 * Page Object for the Editor (HybridEditor)
 *
 * Handles:
 * - Content editing
 * - Title editing
 * - Editor mode switching (source/live-preview/reading)
 * - Wiki links and tags
 */
export class EditorPage extends BasePage {
  // Editor elements
  readonly editorContainer: Locator
  readonly titleInput: Locator
  readonly contentArea: Locator
  readonly wordCount: Locator
  readonly modeToggle: Locator

  constructor(page: Page) {
    super(page)

    // Use data-testid selectors for stability
    this.editorContainer = page.locator('[data-testid="hybrid-editor"]')
    this.titleInput = page.locator('h2.cursor-pointer, input.text-2xl')
    this.contentArea = page.locator('[contenteditable="true"], .ProseMirror, .editor-content')
    this.wordCount = page.locator('.word-count, text=/\\d+ words/')
    this.modeToggle = page.locator('.mode-toggle, button:has-text("Mode")')
  }

  /**
   * Check if editor is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.editorContainer.isVisible()
  }

  /**
   * Type content into the editor
   */
  async typeContent(text: string): Promise<void> {
    await this.contentArea.first().click()
    await this.page.keyboard.type(text)
  }

  /**
   * Clear and replace editor content
   */
  async setContent(text: string): Promise<void> {
    await this.contentArea.first().click()
    await this.pressShortcut('a') // Select all
    await this.page.keyboard.type(text)
  }

  /**
   * Get the current editor content
   */
  async getContent(): Promise<string> {
    return await this.contentArea.first().textContent() || ''
  }

  /**
   * Click the title to edit it
   */
  async clickTitle(): Promise<void> {
    await this.titleInput.first().click()
  }

  /**
   * Get the current note title
   */
  async getTitle(): Promise<string> {
    const title = this.page.locator('h2.cursor-pointer, h2.text-2xl')
    return await title.textContent() || ''
  }

  /**
   * Set a new title
   */
  async setTitle(newTitle: string): Promise<void> {
    await this.clickTitle()
    const input = this.page.locator('input.text-2xl')
    await expect(input).toBeVisible()
    await input.fill(newTitle)
    await this.page.keyboard.press('Enter')
  }

  /**
   * Get the word count
   */
  async getWordCount(): Promise<number> {
    const text = await this.wordCount.textContent()
    const match = text?.match(/(\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  /**
   * Switch editor mode
   */
  async setMode(mode: 'source' | 'live-preview' | 'reading'): Promise<void> {
    const keyMap = {
      'source': '1',
      'live-preview': '2',
      'reading': '3',
    }
    // Note: Editor mode uses Cmd+1/2/3 but tabs also use this
    // Using Cmd+E to cycle modes instead
    await this.pressShortcut('e')
    // May need to cycle multiple times to reach desired mode
  }

  /**
   * Toggle editor mode (cycle)
   */
  async toggleMode(): Promise<void> {
    await this.pressShortcut('e')
    await this.page.waitForTimeout(200)
  }

  /**
   * Check if editor is in reading mode
   */
  async isReadingMode(): Promise<boolean> {
    // In reading mode, contenteditable is false or element has readonly class
    const contentEditable = await this.contentArea.first().getAttribute('contenteditable')
    return contentEditable === 'false' || contentEditable === null
  }

  /**
   * Type a wiki link
   */
  async typeWikiLink(noteName: string): Promise<void> {
    await this.contentArea.first().click()
    await this.page.keyboard.type(`[[${noteName}]]`)
  }

  /**
   * Type a tag
   */
  async typeTag(tagName: string): Promise<void> {
    await this.contentArea.first().click()
    await this.page.keyboard.type(`#${tagName}`)
  }

  /**
   * Check if wiki link autocomplete is visible
   */
  async isWikiLinkAutocompleteVisible(): Promise<boolean> {
    const autocomplete = this.page.locator('.wiki-link-autocomplete, .autocomplete-popup')
    return await autocomplete.isVisible()
  }

  /**
   * Check if tag autocomplete is visible
   */
  async isTagAutocompleteVisible(): Promise<boolean> {
    const autocomplete = this.page.locator('.tag-autocomplete, .autocomplete-popup')
    return await autocomplete.isVisible()
  }

  /**
   * Click a wiki link in the content
   */
  async clickWikiLink(linkText: string): Promise<void> {
    const link = this.page.locator(`.wiki-link:has-text("${linkText}"), a:has-text("${linkText}")`)
    await link.click()
  }

  /**
   * Get all wiki links in the content
   */
  async getWikiLinks(): Promise<string[]> {
    const links = this.page.locator('.wiki-link')
    const elements = await links.all()
    const linkTexts: string[] = []
    for (const el of elements) {
      const text = await el.textContent()
      if (text) linkTexts.push(text.trim())
    }
    return linkTexts
  }

  /**
   * Get all tags in the content
   */
  async getTags(): Promise<string[]> {
    const tags = this.page.locator('.tag-highlight, .tag')
    const elements = await tags.all()
    const tagTexts: string[] = []
    for (const el of elements) {
      const text = await el.textContent()
      if (text) tagTexts.push(text.replace('#', '').trim())
    }
    return tagTexts
  }
}
