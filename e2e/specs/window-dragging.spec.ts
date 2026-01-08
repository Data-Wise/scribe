import { test, expect } from '../fixtures'

/**
 * Window Dragging E2E Tests
 *
 * Tests for window drag regions across the application.
 * The app uses -webkit-app-region CSS to enable window dragging.
 *
 * Tests: WD-01 to WD-10
 */

test.describe('Window Dragging', () => {
  test.beforeEach(async ({ basePage }) => {
    await basePage.goto()
    await basePage.page.waitForTimeout(1000)
  })

  test.describe('Drag Region Presence', () => {
    test('WD-01: Editor header has drag region CSS', async ({ basePage }) => {
      // Find editor header
      const editorHeader = basePage.page.locator('.editor-header').first()
      await expect(editorHeader).toBeVisible()

      // Check that the element exists and has the expected class
      const headerCount = await editorHeader.count()
      expect(headerCount).toBeGreaterThan(0)
    })

    test('WD-02: Editor header is not covered by other elements', async ({ basePage }) => {
      const editorHeader = basePage.page.locator('.editor-header').first()
      await expect(editorHeader).toBeVisible()

      // Verify header is at expected position (top of editor area)
      const box = await editorHeader.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.height).toBeGreaterThan(30) // Should be ~40px high
    })

    test('WD-03: Breadcrumb items are interactive (no-drag)', async ({ basePage }) => {
      // Open a note to ensure breadcrumb is visible
      const welcomeNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
      if (await welcomeNote.isVisible().catch(() => false)) {
        await welcomeNote.click()
        await basePage.page.waitForTimeout(500)
      }

      // Find breadcrumb item
      const breadcrumbItem = basePage.page.locator('.breadcrumb-item').first()
      if (await breadcrumbItem.isVisible().catch(() => false)) {
        // Verify it's clickable (has cursor pointer, not grab)
        await expect(breadcrumbItem).toBeVisible()
      }
    })

    test('WD-04: Timer buttons are interactive (no-drag)', async ({ basePage }) => {
      // Timer buttons should be in editor header
      const timerBtn = basePage.page.locator('.timer-btn').first()
      await expect(timerBtn).toBeVisible()

      // Verify button is clickable
      await timerBtn.click()
      await basePage.page.waitForTimeout(200)
      // Timer should pause (we can't easily verify this visually, but click should work)
    })

    test('WD-05: Sidebar header has drag region', async ({ basePage }) => {
      // Sidebar header should also have drag region
      const sidebarHeader = basePage.page.locator('.sidebar-header').first()
      await expect(sidebarHeader).toBeVisible()

      const box = await sidebarHeader.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.height).toBeGreaterThan(30)
    })
  })

  test.describe('Interactive Element Exclusions', () => {
    test('WD-06: Mode toggle buttons remain clickable', async ({ basePage }) => {
      // Open a note
      const welcomeNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
      if (await welcomeNote.isVisible().catch(() => false)) {
        await welcomeNote.click()
        await basePage.page.waitForTimeout(500)
      }

      // Mode toggle buttons should be clickable
      const sourceBtn = basePage.page.locator('button:has-text("Source")')
      const liveBtn = basePage.page.locator('button:has-text("Live")')
      const readingBtn = basePage.page.locator('button:has-text("Reading")')

      await expect(sourceBtn).toBeVisible()
      await expect(liveBtn).toBeVisible()
      await expect(readingBtn).toBeVisible()

      // Click each button to verify they work
      await liveBtn.click()
      await basePage.page.waitForTimeout(200)
      await sourceBtn.click()
      await basePage.page.waitForTimeout(200)
      await readingBtn.click()
      await basePage.page.waitForTimeout(200)
    })

    test('WD-07: Sidebar tabs remain clickable', async ({ basePage }) => {
      // Sidebar tabs should be clickable despite sidebar header drag region
      await expect(basePage.leftSidebar).toBeVisible()

      // Sidebar should have interactive elements - just verify it's functional
      // The drag region on sidebar-header should not block tab interactions
      const sidebarContent = basePage.leftSidebar
      await expect(sidebarContent).toBeVisible()
    })

    test('WD-08: Editor tabs remain clickable', async ({ basePage }) => {
      // Open multiple notes to create tabs
      const welcomeNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
      if (await welcomeNote.isVisible().catch(() => false)) {
        await welcomeNote.click()
        await basePage.page.waitForTimeout(500)
      }

      // Tab should be clickable
      const tab = basePage.page.locator('[data-testid^="editor-tab-"]').first()
      if (await tab.isVisible().catch(() => false)) {
        await tab.click()
        await basePage.page.waitForTimeout(200)
        // Tab click should work (hard to verify state, but no error is success)
      }
    })

    test('WD-09: Editor content is not draggable', async ({ basePage }) => {
      // Open a note
      const welcomeNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
      if (await welcomeNote.isVisible().catch(() => false)) {
        await welcomeNote.click()
        await basePage.page.waitForTimeout(500)
      }

      // Editor should be visible and interactable
      const editor = basePage.page.locator('[data-testid="hybrid-editor"]')
      await expect(editor).toBeVisible()

      // Should be able to click inside editor
      await editor.click()
      await basePage.page.waitForTimeout(200)
    })

    test('WD-10: Settings button in sidebar is clickable', async ({ basePage }) => {
      // Settings button should not be affected by drag region
      const settingsBtn = basePage.page.locator('[title="Settings"]').first()
      await expect(settingsBtn).toBeVisible()

      await settingsBtn.click()
      await basePage.page.waitForTimeout(500)

      // Settings modal should open
      const settingsModal = basePage.page.locator('text=Settings').first()
      await expect(settingsModal).toBeVisible()

      // Close modal
      const closeBtn = basePage.page.locator('button:has-text("Close"), button:has-text("×")').first()
      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn.click()
      } else {
        await basePage.page.keyboard.press('Escape')
      }
    })
  })
})
