import { Page, expect } from '@playwright/test'

/**
 * Test Utilities for Scribe E2E Tests
 *
 * Common helper functions to reduce test boilerplate and improve readability
 */

/**
 * Wait for the app to be fully loaded and ready
 */
export async function waitForAppReady(page: Page): Promise<void> {
  await page.waitForSelector('[data-testid="editor-tabs"]', { timeout: 10000 })
  await page.waitForLoadState('networkidle')
}

/**
 * Create a new note using keyboard shortcut
 */
export async function createNewNote(page: Page, content?: string): Promise<void> {
  await page.keyboard.press('Meta+N')
  await page.waitForSelector('textarea', { timeout: 5000 })

  if (content) {
    await page.locator('textarea').fill(content)
    await page.waitForTimeout(300) // Wait for save debounce
  }
}

/**
 * Open Command Palette
 */
export async function openCommandPalette(page: Page): Promise<void> {
  await page.keyboard.press('Meta+K')
  await expect(page.locator('[data-testid="command-palette"]')).toBeVisible()
}

/**
 * Close Command Palette
 */
export async function closeCommandPalette(page: Page): Promise<void> {
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-testid="command-palette"]')).not.toBeVisible()
}

/**
 * Switch to a specific editor mode
 */
export async function switchEditorMode(
  page: Page,
  mode: 'Source' | 'Live' | 'Reading'
): Promise<void> {
  await page.click(`button:has-text("${mode}")`)
  await page.waitForTimeout(200) // Wait for mode transition
}

/**
 * Get the current word count from the UI
 */
export async function getWordCount(page: Page): Promise<number> {
  const wordCountText = await page.locator('[data-testid="word-count"]').textContent()
  const match = wordCountText?.match(/(\d+)\s+word/)
  return match ? parseInt(match[1], 10) : 0
}

/**
 * Verify textarea content matches expected value
 */
export async function verifyTextareaContent(page: Page, expected: string): Promise<void> {
  const textarea = page.locator('textarea')
  await expect(textarea).toHaveValue(expected)
}

/**
 * Get all tab titles
 */
export async function getTabTitles(page: Page): Promise<string[]> {
  return await page.locator('[data-testid="editor-tab"]').allTextContents()
}

/**
 * Switch to tab by index (0-based)
 */
export async function switchToTab(page: Page, index: number): Promise<void> {
  const tabs = page.locator('[data-testid="editor-tab"]')
  await tabs.nth(index).click()
  await page.waitForTimeout(200) // Wait for tab switch
}

/**
 * Switch to tab by title
 */
export async function switchToTabByTitle(page: Page, title: string): Promise<void> {
  await page.click(`[data-testid="editor-tab"]:has-text("${title}")`)
  await page.waitForTimeout(200) // Wait for tab switch
}

/**
 * Close tab by index
 */
export async function closeTab(page: Page, index: number): Promise<void> {
  const tabs = page.locator('[data-testid="editor-tab"]')
  const closeButton = tabs.nth(index).locator('[data-testid="close-tab"]')
  await closeButton.click()
}

/**
 * Verify Mission Control is NOT visible
 */
export async function verifyNotOnMissionControl(page: Page): Promise<void> {
  await expect(page.locator('[data-testid="mission-control"]')).not.toBeVisible()
}

/**
 * Verify Mission Control IS visible
 */
export async function verifyOnMissionControl(page: Page): Promise<void> {
  await expect(page.locator('[data-testid="mission-control"]')).toBeVisible()
}

/**
 * Clear all localStorage data (useful for clean test state)
 */
export async function clearLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear()
  })
}

/**
 * Clear IndexedDB (useful for clean test state)
 */
export async function clearIndexedDB(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const dbs = await indexedDB.databases()
    await Promise.all(
      dbs.map(db => {
        return new Promise<void>((resolve, reject) => {
          if (!db.name) {
            resolve()
            return
          }
          const request = indexedDB.deleteDatabase(db.name)
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })
      })
    )
  })
}

/**
 * Get all notes from IndexedDB
 */
export async function getNotesFromDB(page: Page): Promise<any[]> {
  return await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('scribe-browser')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    const transaction = db.transaction(['notes'], 'readonly')
    const store = transaction.objectStore('notes')

    return await new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  })
}

/**
 * Get tabs from localStorage
 */
export async function getTabsFromLocalStorage(page: Page): Promise<any[]> {
  return await page.evaluate(() => {
    const tabs = localStorage.getItem('scribe:openTabs')
    return tabs ? JSON.parse(tabs) : []
  })
}

/**
 * Verify no error toasts are shown
 */
export async function verifyNoErrors(page: Page): Promise<void> {
  await expect(page.locator('[data-testid="error-toast"]')).not.toBeVisible()
}

/**
 * Type text with realistic typing speed (useful for race condition tests)
 */
export async function typeRealistic(
  page: Page,
  selector: string,
  text: string,
  delayMs: number = 50
): Promise<void> {
  const element = page.locator(selector)
  await element.click()

  for (const char of text) {
    await element.type(char, { delay: delayMs })
  }
}

/**
 * Type text very rapidly (simulates paste or very fast typing)
 */
export async function typeRapidly(
  page: Page,
  selector: string,
  text: string
): Promise<void> {
  const element = page.locator(selector)
  await element.fill(text) // Instant fill simulates very rapid typing
}

/**
 * Wait for debounce (useful after typing to wait for save)
 */
export async function waitForDebounce(page: Page, ms: number = 500): Promise<void> {
  await page.waitForTimeout(ms)
}

/**
 * Verify markdown rendering in Reading mode
 */
export async function verifyMarkdownRendered(
  page: Page,
  selector: string
): Promise<void> {
  await expect(page.locator(selector)).toBeVisible()
}

/**
 * Get note properties from Properties panel
 */
export interface NoteProperties {
  created?: string
  modified?: string
  wordCount?: number
}

export async function getNoteProperties(page: Page): Promise<NoteProperties> {
  const properties: NoteProperties = {}

  try {
    const created = await page.locator('[data-testid="property-created"]').textContent()
    if (created) properties.created = created

    const modified = await page.locator('[data-testid="property-modified"]').textContent()
    if (modified) properties.modified = modified

    const wordCount = await page.locator('[data-testid="property-word-count"]').textContent()
    if (wordCount) {
      const match = wordCount.match(/(\d+)/)
      if (match) properties.wordCount = parseInt(match[1], 10)
    }
  } catch (error) {
    // Properties might not be available in all contexts
  }

  return properties
}

/**
 * Simulate network offline/online (for testing offline behavior)
 */
export async function setNetworkOffline(page: Page, offline: boolean): Promise<void> {
  await page.context().setOffline(offline)
}

/**
 * Take screenshot for debugging (saves to test-results/)
 */
export async function debugScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `test-results/${name}-${Date.now()}.png` })
}
