/**
 * E2E Tests: Browser Mode - Wiki Link Backlinks
 *
 * Tests wiki link indexing and backlinks panel functionality in browser mode.
 * These tests verify that the critical bug fix (Sprint 30 Phase 1) works correctly.
 */

import { test, expect } from '@playwright/test'
import { BasePage } from './pages/BasePage'

test.describe('Browser Mode: Wiki Link Backlinks', () => {
  test.beforeEach(async ({ page, context }) => {
    // Enable browser mode by navigating to vite dev server
    await page.goto('http://localhost:5173')

    // Wait for IndexedDB initialization
    await page.waitForTimeout(1000)

    // Clear any existing data
    await page.evaluate(() => {
      return window.indexedDB.deleteDatabase('scribe-browser')
    })

    // Reload to reinitialize with clean database
    await page.reload()
    await page.waitForTimeout(1000)
  })

  test('BBL-01: Create note with wiki link - target exists', async ({ page }) => {
    const basePage = new BasePage(page)

    // Step 1: Create target note
    await basePage.clickButton('New Note')
    await page.fill('[data-testid="note-title-input"]', 'Target Note')
    await page.fill('[data-testid="note-content-textarea"]', 'This is the target')
    await page.waitForTimeout(500) // Let it save

    // Step 2: Create source note with wiki link
    await basePage.clickButton('New Note')
    await page.fill('[data-testid="note-title-input"]', 'Source Note')
    await page.fill(
      '[data-testid="note-content-textarea"]',
      'This links to [[Target Note]] in the middle of text.'
    )
    await page.waitForTimeout(500)

    // Step 3: Navigate to target note
    await basePage.clickNoteInList('Target Note')
    await page.waitForTimeout(500)

    // Step 4: Open backlinks panel
    await page.click('[data-testid="right-sidebar-backlinks"]')

    // Step 5: Verify backlink appears
    const backlinksPanel = page.locator('[data-testid="backlinks-panel"]')
    await expect(backlinksPanel).toBeVisible()
    await expect(backlinksPanel.locator('text=Source Note')).toBeVisible()
  })

  test('BBL-02: Update note to add wiki link - backlink appears', async ({ page }) => {
    const basePage = new BasePage(page)

    // Step 1: Create target note
    await basePage.clickButton('New Note')
    await page.fill('[data-testid="note-title-input"]', 'Target Note')
    await page.fill('[data-testid="note-content-textarea"]', 'Target content')
    await page.waitForTimeout(500)

    // Step 2: Create source note WITHOUT link initially
    await basePage.clickButton('New Note')
    await page.fill('[data-testid="note-title-input"]', 'Source Note')
    await page.fill('[data-testid="note-content-textarea"]', 'No links yet')
    await page.waitForTimeout(500)

    // Step 3: Edit source note to ADD wiki link
    await page.fill(
      '[data-testid="note-content-textarea"]',
      'Now has [[Target Note]] link'
    )
    await page.waitForTimeout(500)

    // Step 4: Navigate to target note
    await basePage.clickNoteInList('Target Note')
    await page.waitForTimeout(500)

    // Step 5: Open backlinks panel
    await page.click('[data-testid="right-sidebar-backlinks"]')

    // Step 6: Verify backlink appears after update
    const backlinksPanel = page.locator('[data-testid="backlinks-panel"]')
    await expect(backlinksPanel.locator('text=Source Note')).toBeVisible()
  })

  test('BBL-03: Update note to remove wiki link - backlink disappears', async ({ page }) => {
    const basePage = new BasePage(page)

    // Step 1: Create target note
    await basePage.clickButton('New Note')
    await page.fill('[data-testid="note-title-input"]', 'Target Note')
    await page.fill('[data-testid="note-content-textarea"]', 'Target content')
    await page.waitForTimeout(500)

    // Step 2: Create source note WITH link
    await basePage.clickButton('New Note')
    await page.fill('[data-testid="note-title-input"]', 'Source Note')
    await page.fill(
      '[data-testid="note-content-textarea"]',
      'Has [[Target Note]] link'
    )
    await page.waitForTimeout(500)

    // Step 3: Verify backlink exists
    await basePage.clickNoteInList('Target Note')
    await page.click('[data-testid="right-sidebar-backlinks"]')
    let backlinksPanel = page.locator('[data-testid="backlinks-panel"]')
    await expect(backlinksPanel.locator('text=Source Note')).toBeVisible()

    // Step 4: Edit source note to REMOVE wiki link
    await basePage.clickNoteInList('Source Note')
    await page.fill('[data-testid="note-content-textarea"]', 'No more links')
    await page.waitForTimeout(500)

    // Step 5: Navigate back to target note
    await basePage.clickNoteInList('Target Note')
    await page.waitForTimeout(500)

    // Step 6: Verify backlink is gone
    backlinksPanel = page.locator('[data-testid="backlinks-panel"]')
    await expect(backlinksPanel.locator('text=Source Note')).not.toBeVisible()
  })

  test('BBL-04: Multiple wiki links - multiple backlinks', async ({ page }) => {
    const basePage = new BasePage(page)

    // Step 1: Create target note
    await basePage.clickButton('New Note')
    await page.fill('[data-testid="note-title-input"]', 'Target Note')
    await page.fill('[data-testid="note-content-textarea"]', 'Popular target')
    await page.waitForTimeout(500)

    // Step 2: Create source note 1
    await basePage.clickButton('New Note')
    await page.fill('[data-testid="note-title-input"]', 'Source 1')
    await page.fill(
      '[data-testid="note-content-textarea"]',
      'Links to [[Target Note]]'
    )
    await page.waitForTimeout(500)

    // Step 3: Create source note 2
    await basePage.clickButton('New Note')
    await page.fill('[data-testid="note-title-input"]', 'Source 2')
    await page.fill(
      '[data-testid="note-content-textarea"]',
      'Also links to [[Target Note]]'
    )
    await page.waitForTimeout(500)

    // Step 4: Create source note 3
    await basePage.clickButton('New Note')
    await page.fill('[data-testid="note-title-input"]', 'Source 3')
    await page.fill(
      '[data-testid="note-content-textarea"]',
      'References [[Target Note]] multiple times [[Target Note]]'
    )
    await page.waitForTimeout(500)

    // Step 5: Navigate to target note
    await basePage.clickNoteInList('Target Note')
    await page.waitForTimeout(500)

    // Step 6: Open backlinks panel
    await page.click('[data-testid="right-sidebar-backlinks"]')

    // Step 7: Verify all backlinks appear
    const backlinksPanel = page.locator('[data-testid="backlinks-panel"]')
    await expect(backlinksPanel.locator('text=Source 1')).toBeVisible()
    await expect(backlinksPanel.locator('text=Source 2')).toBeVisible()
    await expect(backlinksPanel.locator('text=Source 3')).toBeVisible()
  })

  test('BBL-05: Wiki link to non-existent note - no backlink', async ({ page }) => {
    const basePage = new BasePage(page)

    // Step 1: Create source note with link to non-existent note
    await basePage.clickButton('New Note')
    await page.fill('[data-testid="note-title-input"]', 'Source Note')
    await page.fill(
      '[data-testid="note-content-textarea"]',
      'Links to [[Non Existent Note]]'
    )
    await page.waitForTimeout(500)

    // Step 2: Verify no errors occur
    const errorToast = page.locator('[data-testid="toast-error"]')
    await expect(errorToast).not.toBeVisible()

    // Step 3: Create the target note NOW
    await basePage.clickButton('New Note')
    await page.fill('[data-testid="note-title-input"]', 'Non Existent Note')
    await page.fill('[data-testid="note-content-textarea"]', 'Now exists')
    await page.waitForTimeout(500)

    // Step 4: Edit source note to re-trigger indexing
    await basePage.clickNoteInList('Source Note')
    await page.fill(
      '[data-testid="note-content-textarea"]',
      'Links to [[Non Existent Note]] - updated'
    )
    await page.waitForTimeout(500)

    // Step 5: Navigate to target note
    await basePage.clickNoteInList('Non Existent Note')
    await page.waitForTimeout(500)

    // Step 6: Verify backlink now appears
    await page.click('[data-testid="right-sidebar-backlinks"]')
    const backlinksPanel = page.locator('[data-testid="backlinks-panel"]')
    await expect(backlinksPanel.locator('text=Source Note')).toBeVisible()
  })

  test('BBL-06: Reindex on app initialization - existing notes indexed', async ({
    page
  }) => {
    // Step 1: Create notes WITHOUT indexing (simulate old data)
    await page.evaluate(async () => {
      const db = (window as any).scribeDb
      if (!db) throw new Error('Database not available')

      // Add notes directly to bypass indexing
      await db.notes.add({
        id: 'target-1',
        title: 'Target Note',
        content: 'Target content',
        folder: 'inbox',
        project_id: null,
        created_at: Date.now(),
        updated_at: Date.now(),
        deleted_at: null,
        search_text: 'target note target content'
      })

      await db.notes.add({
        id: 'source-1',
        title: 'Source Note',
        content: 'Links to [[Target Note]]',
        folder: 'inbox',
        project_id: null,
        created_at: Date.now(),
        updated_at: Date.now(),
        deleted_at: null,
        search_text: 'source note links to target note'
      })
    })

    // Step 2: Reload app to trigger reindexing
    await page.reload()
    await page.waitForTimeout(2000) // Wait for reindexing to complete

    // Step 3: Navigate to target note
    await page.click('text=Target Note')
    await page.waitForTimeout(500)

    // Step 4: Open backlinks panel
    await page.click('[data-testid="right-sidebar-backlinks"]')

    // Step 5: Verify backlink appears after reindexing
    const backlinksPanel = page.locator('[data-testid="backlinks-panel"]')
    await expect(backlinksPanel.locator('text=Source Note')).toBeVisible()
  })
})

test.describe('Browser Mode: Tag Indexing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForTimeout(1000)

    await page.evaluate(() => {
      return window.indexedDB.deleteDatabase('scribe-browser')
    })

    await page.reload()
    await page.waitForTimeout(1000)
  })

  test('TAG-01: Create note with tag - tag appears in panel', async ({ page }) => {
    const basePage = new BasePage(page)

    // Step 1: Create note with tag
    await basePage.clickButton('New Note')
    await page.fill('[data-testid="note-title-input"]', 'Tagged Note')
    await page.fill(
      '[data-testid="note-content-textarea"]',
      'This has #research and #important tags'
    )
    await page.waitForTimeout(500)

    // Step 2: Open tags panel
    await page.click('[data-testid="right-sidebar-tags"]')

    // Step 3: Verify tags appear
    const tagsPanel = page.locator('[data-testid="tags-panel"]')
    await expect(tagsPanel.locator('text=research')).toBeVisible()
    await expect(tagsPanel.locator('text=important')).toBeVisible()
  })

  test('TAG-02: Filter notes by tag', async ({ page }) => {
    const basePage = new BasePage(page)

    // Step 1: Create note with #research tag
    await basePage.clickButton('New Note')
    await page.fill('[data-testid="note-title-input"]', 'Research Note')
    await page.fill(
      '[data-testid="note-content-textarea"]',
      'Content with #research tag'
    )
    await page.waitForTimeout(500)

    // Step 2: Create note without tag
    await basePage.clickButton('New Note')
    await page.fill('[data-testid="note-title-input"]', 'Plain Note')
    await page.fill('[data-testid="note-content-textarea"]', 'No tags here')
    await page.waitForTimeout(500)

    // Step 3: Open tags panel and click #research
    await page.click('[data-testid="right-sidebar-tags"]')
    await page.click('text=research')
    await page.waitForTimeout(500)

    // Step 4: Verify only research note is visible
    await expect(page.locator('text=Research Note')).toBeVisible()
    await expect(page.locator('text=Plain Note')).not.toBeVisible()
  })
})
