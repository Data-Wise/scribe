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
   * @param timeout - Timeout in milliseconds (default: 10000)
   */
  async waitForEditor(timeout: number = 10000): Promise<void> {
    try {
      await this.getEditor().waitFor({ state: 'visible', timeout })
      await this.getContent().waitFor({ state: 'visible', timeout })
      // Extra wait for editor to be fully interactive
      await this.page.waitForTimeout(200)
    } catch (error) {
      throw new Error(
        `CodeMirror editor not ready after ${timeout}ms. ` +
        `Make sure the editor is visible before calling editor methods. ` +
        `Original error: ${error}`
      )
    }
  }

  /**
   * Fill CodeMirror editor with content (replaces all existing content)
   * @param content - Text content to insert
   */
  async fill(content: string): Promise<void> {
    await this.waitForEditor()
    const editor = this.getContent()
    await editor.click()

    // Try direct API access for speed, fall back to keyboard if needed
    const apiSuccess = await this.page.evaluate((text) => {
      try {
        // Find the .cm-editor element (root CodeMirror container)
        const editorElement = document.querySelector('.cm-editor')
        if (!editorElement) return false

        // @uiw/react-codemirror stores the EditorView on the .cm-editor element
        // Check multiple possible property names
        const possibleViews = [
          (editorElement as any).view,
          (editorElement as any).cmView,
          (editorElement as any).CodeMirror,
          // Also check .cm-content as fallback
          ...(editorElement.querySelector('.cm-content') ?
            [(editorElement.querySelector('.cm-content') as any)?.cmView] : [])
        ].filter(Boolean)

        for (const cmView of possibleViews) {
          if (cmView && cmView.dispatch && cmView.state) {
            // Found valid EditorView - use transaction API
            cmView.dispatch({
              changes: {
                from: 0,
                to: cmView.state.doc.length,
                insert: text
              }
            })
            return true
          }
        }

        return false
      } catch {
        return false
      }
    }, content)

    if (!apiSuccess) {
      // Fallback to keyboard typing (slower but reliable)
      await this.page.keyboard.press('Meta+a')
      await this.page.keyboard.press('Backspace')
      // Type without delay for setup - we don't need realistic typing
      await this.page.keyboard.type(content)
    }

    // Wait for content to settle
    await this.page.waitForTimeout(150)
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
