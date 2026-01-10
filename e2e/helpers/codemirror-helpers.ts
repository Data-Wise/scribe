import { Page, Locator } from '@playwright/test'

/**
 * CodeMirror 6 Test Helper
 *
 * Provides utilities for interacting with CodeMirror 6 editor in E2E tests.
 * Replaces old textarea-based interactions with CodeMirror-specific methods.
 *
 * Usage:
 * ```typescript
 * const editor = new CodeMirrorHelper(page)
 * await editor.fill('# Hello World')
 * const content = await editor.getTextContent()
 * ```
 */
export class CodeMirrorHelper {
  constructor(private page: Page) {}

  /**
   * Get CodeMirror editor root element
   * @returns The .cm-editor element
   */
  getEditor(): Locator {
    return this.page.locator('.cm-editor')
  }

  /**
   * Get CodeMirror content area (editable region)
   * @returns The .cm-content element
   */
  getContent(): Locator {
    return this.page.locator('.cm-content')
  }

  /**
   * Get a specific line in the editor
   * @param lineNumber - 1-based line number
   * @returns The .cm-line element for that line
   */
  getLine(lineNumber: number): Locator {
    return this.page.locator(`.cm-line >> nth=${lineNumber - 1}`)
  }

  /**
   * Wait for CodeMirror editor to be ready
   */
  async waitForEditor(): Promise<void> {
    await this.getEditor().waitFor({ state: 'visible' })
    await this.getContent().waitFor({ state: 'visible' })
  }

  /**
   * Fill CodeMirror editor with content (replaces all existing content)
   * @param content - Text content to insert
   */
  async fill(content: string): Promise<void> {
    await this.waitForEditor()
    const editor = this.getContent()
    await editor.click()

    // Select all and replace
    await this.page.keyboard.press('Meta+a')
    await this.page.keyboard.type(content, { delay: 10 })
  }

  /**
   * Append text to the end of the editor
   * @param text - Text to append
   */
  async append(text: string): Promise<void> {
    await this.waitForEditor()
    const editor = this.getContent()
    await editor.click()

    // Move to end and type
    await this.page.keyboard.press('Meta+End')
    await this.page.keyboard.type(text, { delay: 10 })
  }

  /**
   * Insert text at the beginning of the editor
   * @param text - Text to prepend
   */
  async prepend(text: string): Promise<void> {
    await this.waitForEditor()
    const editor = this.getContent()
    await editor.click()

    // Move to beginning and type
    await this.page.keyboard.press('Meta+Home')
    await this.page.keyboard.type(text, { delay: 10 })
  }

  /**
   * Get current text content from CodeMirror editor
   * @returns The editor's text content
   */
  async getTextContent(): Promise<string> {
    await this.waitForEditor()
    const editor = this.getContent()
    return (await editor.textContent()) || ''
  }

  /**
   * Clear all content from the editor
   */
  async clear(): Promise<void> {
    await this.waitForEditor()
    const editor = this.getContent()
    await editor.click()
    await this.page.keyboard.press('Meta+a')
    await this.page.keyboard.press('Backspace')
  }

  /**
   * Type at current cursor position
   * @param text - Text to type
   */
  async type(text: string): Promise<void> {
    await this.page.keyboard.type(text, { delay: 10 })
  }

  /**
   * Press keyboard shortcut
   * @param shortcut - Keyboard shortcut (e.g., 'Meta+b' for bold)
   */
  async pressShortcut(shortcut: string): Promise<void> {
    await this.page.keyboard.press(shortcut)
  }

  /**
   * Select all text in the editor
   */
  async selectAll(): Promise<void> {
    await this.waitForEditor()
    const editor = this.getContent()
    await editor.click()
    await this.page.keyboard.press('Meta+a')
  }

  /**
   * Move cursor to specific line and column
   * @param line - 1-based line number
   * @param column - 1-based column number (optional, defaults to start of line)
   */
  async moveCursorTo(line: number, column: number = 1): Promise<void> {
    await this.waitForEditor()

    // Move to start of document
    await this.page.keyboard.press('Meta+Home')

    // Move down to target line
    for (let i = 1; i < line; i++) {
      await this.page.keyboard.press('ArrowDown')
    }

    // Move right to target column
    for (let i = 1; i < column; i++) {
      await this.page.keyboard.press('ArrowRight')
    }
  }

  /**
   * Check if editor is focused
   * @returns true if editor has focus
   */
  async isFocused(): Promise<boolean> {
    const editor = this.getContent()
    return await editor.evaluate((el) => el === document.activeElement)
  }

  /**
   * Focus the editor
   */
  async focus(): Promise<void> {
    await this.waitForEditor()
    const editor = this.getContent()
    await editor.click()
  }

  /**
   * Get line count
   * @returns Number of lines in the editor
   */
  async getLineCount(): Promise<number> {
    const lines = this.page.locator('.cm-line')
    return await lines.count()
  }

  /**
   * Wait for specific text to appear in editor
   * @param text - Text to wait for
   * @param timeout - Timeout in milliseconds (default: 5000)
   */
  async waitForText(text: string, timeout: number = 5000): Promise<void> {
    await this.page.waitForFunction(
      ({ selector, expectedText }) => {
        const editor = document.querySelector(selector)
        return editor?.textContent?.includes(expectedText) || false
      },
      { selector: '.cm-content', expectedText: text },
      { timeout }
    )
  }

  /**
   * Check if text exists in editor
   * @param text - Text to search for
   * @returns true if text exists
   */
  async hasText(text: string): Promise<boolean> {
    const content = await this.getTextContent()
    return content.includes(text)
  }

  /**
   * Get syntax highlighting classes at cursor position
   * Useful for testing syntax highlighting
   * @returns Array of CSS classes
   */
  async getSyntaxHighlightingAt(line: number, column: number): Promise<string[]> {
    await this.moveCursorTo(line, column)

    return await this.page.evaluate(() => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return []

      const range = selection.getRangeAt(0)
      const node = range.startContainer.parentElement

      return node ? Array.from(node.classList) : []
    })
  }

  /**
   * Trigger autocomplete at current cursor position
   */
  async triggerAutocomplete(): Promise<void> {
    await this.page.keyboard.press('Control+Space')
    // Wait for autocomplete panel
    await this.page.locator('.cm-tooltip-autocomplete').waitFor({ state: 'visible' })
  }

  /**
   * Select autocomplete option by text
   * @param optionText - Text of the option to select
   */
  async selectAutocompleteOption(optionText: string): Promise<void> {
    const option = this.page.locator('.cm-completionLabel', { hasText: optionText })
    await option.click()
  }

  /**
   * Get all autocomplete options
   * @returns Array of autocomplete option texts
   */
  async getAutocompleteOptions(): Promise<string[]> {
    const options = this.page.locator('.cm-completionLabel')
    return await options.allTextContents()
  }

  /**
   * Dismiss autocomplete panel
   */
  async dismissAutocomplete(): Promise<void> {
    await this.page.keyboard.press('Escape')
  }
}
