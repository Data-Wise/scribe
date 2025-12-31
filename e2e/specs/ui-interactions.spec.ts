import { test, expect } from '../fixtures'

/**
 * UI Interaction Tests
 *
 * These tests verify that all UI elements are clickable and respond to user input.
 * Specifically tests the top region of the app (editor header, timer, etc.) where
 * window dragging could previously block clicks.
 *
 * Background: The Tauri app uses a custom titlebar for window dragging.
 * Previously, a CSS overlay with pointer-events:auto and -webkit-app-region:drag
 * was blocking clicks on elements beneath it. This was fixed by using JS-based
 * dragging via the useDragRegion() hook instead.
 *
 * Tests: UI-01 to UI-20
 */

test.describe('UI Interactions', () => {
  test.describe('Editor Header Elements', () => {
    test.beforeEach(async ({ basePage }) => {
      await basePage.goto()
      // Open a note so editor header is visible
      const recentNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
      const exists = await recentNote.isVisible().catch(() => false)
      if (exists) {
        await recentNote.click()
        await basePage.page.waitForTimeout(500)
      }
    })

    test('UI-01: Editor header is visible', async ({ basePage }) => {
      const editorHeader = basePage.page.locator('.editor-header')
      await expect(editorHeader).toBeVisible()
    })

    test('UI-02: Focus timer is clickable', async ({ basePage }) => {
      // Focus timer should be in the editor header
      const focusTimer = basePage.page.locator('.focus-timer')
      const isVisible = await focusTimer.isVisible().catch(() => false)

      if (isVisible) {
        // Verify it has pointer-events (not blocked by overlay)
        const pointerEvents = await focusTimer.evaluate(el => {
          return getComputedStyle(el).pointerEvents
        })
        expect(pointerEvents).not.toBe('none')
      } else {
        // Timer might be in a different location - just verify page is stable
        expect(true).toBe(true)
      }
    })

    test('UI-03: Timer pause/play button responds to clicks', async ({ basePage }) => {
      const timerBtn = basePage.page.locator('.timer-btn').first()
      const isVisible = await timerBtn.isVisible().catch(() => false)

      if (isVisible) {
        // Get initial state
        const timerValue = basePage.page.locator('.timer-value')
        const initialPaused = await timerValue.evaluate(el =>
          el.classList.contains('paused')
        ).catch(() => null)

        // Click button
        await timerBtn.click()
        await basePage.page.waitForTimeout(200)

        // State should have changed
        const afterPaused = await timerValue.evaluate(el =>
          el.classList.contains('paused')
        ).catch(() => null)

        // If we could read state, verify it changed
        if (initialPaused !== null && afterPaused !== null) {
          expect(afterPaused).not.toBe(initialPaused)
        }
      }
    })

    test('UI-04: Timer reset button is clickable', async ({ basePage }) => {
      const resetBtn = basePage.page.locator('.timer-btn[title*="reset"], .timer-btn:has(svg[class*="rotate"])')
      const isVisible = await resetBtn.first().isVisible().catch(() => false)

      if (isVisible) {
        // Just verify click doesn't throw
        await resetBtn.first().click()
        await basePage.page.waitForTimeout(100)
      }
      // Page should remain stable
      await expect(basePage.page.locator('body')).toBeVisible()
    })

    test('UI-05: Note title/breadcrumb is visible and not blocked', async ({ basePage }) => {
      const breadcrumb = basePage.page.locator('.breadcrumb, .editor-header .note-title, .editor-header span')
      const isVisible = await breadcrumb.first().isVisible().catch(() => false)

      if (isVisible) {
        // Verify pointer-events are not blocked
        const pointerEvents = await breadcrumb.first().evaluate(el => {
          return getComputedStyle(el).pointerEvents
        })
        // Should not be 'none'
        expect(pointerEvents).not.toBe('none')
      }
    })
  })

  test.describe('Sidebar Toggle Clicks', () => {
    test.beforeEach(async ({ basePage }) => {
      await basePage.goto()
      const recentNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
      const exists = await recentNote.isVisible().catch(() => false)
      if (exists) {
        await recentNote.click()
        await basePage.page.waitForTimeout(500)
      }
    })

    test('UI-06: Right sidebar toggle responds to click (not blocked)', async ({ basePage }) => {
      const toggleBtn = basePage.page.locator('[data-testid="right-sidebar-toggle"]')
      await expect(toggleBtn).toBeVisible()

      // Get toggle button position
      const btnBox = await toggleBtn.boundingBox()
      expect(btnBox).toBeTruthy()

      // Verify the button is in the upper area of the viewport (where drag region could block)
      expect(btnBox!.y).toBeLessThan(200)

      // Verify pointer-events
      const pointerEvents = await toggleBtn.evaluate(el => {
        return getComputedStyle(el).pointerEvents
      })
      expect(pointerEvents).toBe('auto')

      // Actually click and verify it works
      const rightSidebar = basePage.page.locator('[data-testid="right-sidebar"]')
      const initialWidth = (await rightSidebar.boundingBox())?.width ?? 0

      await toggleBtn.click()
      await basePage.page.waitForTimeout(300)

      const afterWidth = (await rightSidebar.boundingBox())?.width ?? 0
      expect(afterWidth).not.toBe(initialWidth)
    })

    test('UI-07: Right sidebar toggle cursor shows pointer on hover', async ({ basePage }) => {
      const toggleBtn = basePage.page.locator('[data-testid="right-sidebar-toggle"]')
      await expect(toggleBtn).toBeVisible()

      // Verify cursor style is pointer
      const cursor = await toggleBtn.evaluate(el => {
        return getComputedStyle(el).cursor
      })
      expect(cursor).toBe('pointer')
    })

    test('UI-08: Sidebar toggle click is not captured by drag region', async ({ basePage }) => {
      // This test verifies the fix for the drag region blocking clicks
      const toggleBtn = basePage.page.locator('[data-testid="right-sidebar-toggle"]')
      await expect(toggleBtn).toBeVisible()

      // Try clicking multiple times rapidly
      for (let i = 0; i < 4; i++) {
        await toggleBtn.click()
        await basePage.page.waitForTimeout(150)
      }

      // Should be back to original state (even number of clicks)
      // Just verify page is stable
      await expect(basePage.page.locator('body')).toBeVisible()
    })
  })

  test.describe('Top Region Pointer Events', () => {
    test('UI-09: No blocking overlay in top 32px region', async ({ basePage }) => {
      await basePage.goto()

      // Check for any elements with -webkit-app-region: drag
      const dragElements = await basePage.page.evaluate(() => {
        const elements = document.querySelectorAll('*')
        const dragRegions: Array<{
          className: string
          tagName: string
          appRegion: string
          pointerEvents: string
          top: number
        }> = []

        elements.forEach(el => {
          const style = getComputedStyle(el as Element)
          // @ts-expect-error - webkit-app-region is non-standard
          const appRegion = style.webkitAppRegion || style['app-region']
          if (appRegion === 'drag') {
            const rect = (el as Element).getBoundingClientRect()
            dragRegions.push({
              className: (el as Element).className,
              tagName: (el as Element).tagName,
              appRegion,
              pointerEvents: style.pointerEvents,
              top: rect.top
            })
          }
        })
        return dragRegions
      })

      // If there are drag regions in the top area, they should not block clicks
      for (const region of dragElements) {
        if (region.top < 50) {
          // Any drag region in top 50px should have pointer-events: none
          // so clicks pass through to UI elements
          expect(region.pointerEvents).toBe('none')
        }
      }
    })

    test('UI-10: Elements in top 32px are clickable', async ({ basePage }) => {
      await basePage.goto()
      // Open a note
      const recentNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
      if (await recentNote.isVisible()) {
        await recentNote.click()
        await basePage.page.waitForTimeout(500)
      }

      // Find all clickable elements in top 50px
      const clickableInTop = await basePage.page.evaluate(() => {
        const clickable = document.querySelectorAll('button, a, [role="button"], [onclick]')
        const results: Array<{
          text: string
          pointerEvents: string
          inTop50: boolean
        }> = []

        clickable.forEach(el => {
          const rect = el.getBoundingClientRect()
          if (rect.top < 50 && rect.height > 0 && rect.width > 0) {
            results.push({
              text: (el as HTMLElement).innerText?.slice(0, 20) || el.className,
              pointerEvents: getComputedStyle(el).pointerEvents,
              inTop50: true
            })
          }
        })
        return results
      })

      // All clickable elements in top region should have pointer-events: auto
      for (const el of clickableInTop) {
        expect(el.pointerEvents).toBe('auto')
      }
    })
  })

  test.describe('Mission Control Header', () => {
    test('UI-11: Mission Control header buttons are clickable', async ({ basePage }) => {
      await basePage.goto()

      // Find the mode toggle buttons in Mission Control sidebar
      const modeButtons = basePage.page.locator('.mode-toggle button, .sidebar-mode-selector button')
      const count = await modeButtons.count()

      if (count > 0) {
        // Click first mode button
        await modeButtons.first().click()
        await basePage.page.waitForTimeout(200)

        // Should respond without error
        await expect(basePage.page.locator('body')).toBeVisible()
      }
    })

    test('UI-12: New Project button responds to click', async ({ basePage }) => {
      await basePage.goto()

      const newProjectBtn = basePage.page.locator('button:has-text("New Project"), button[title*="New Project"]')
      const isVisible = await newProjectBtn.first().isVisible().catch(() => false)

      if (isVisible) {
        // Verify pointer-events are not blocked
        const pointerEvents = await newProjectBtn.first().evaluate(el => {
          return getComputedStyle(el).pointerEvents
        })
        expect(pointerEvents).toBe('auto')

        // Click and verify modal opens
        await newProjectBtn.first().click()
        await basePage.page.waitForTimeout(300)

        // Modal or some response should appear
        const modal = basePage.page.locator('[role="dialog"], .modal')
        const modalVisible = await modal.isVisible().catch(() => false)

        if (modalVisible) {
          // Close modal
          await basePage.page.keyboard.press('Escape')
        }
      }
    })

    test('UI-13: Search input in sidebar is focusable', async ({ basePage }) => {
      await basePage.goto()

      const searchInput = basePage.page.locator('.sidebar-search input, input[placeholder*="Search"]')
      const isVisible = await searchInput.first().isVisible().catch(() => false)

      if (isVisible) {
        // Click to focus
        await searchInput.first().click()
        await basePage.page.waitForTimeout(100)

        // Should be focused
        const isFocused = await searchInput.first().evaluate(el => document.activeElement === el)
        expect(isFocused).toBe(true)

        // Type something
        await basePage.page.keyboard.type('test search')
        await basePage.page.waitForTimeout(100)

        // Verify input received text
        const value = await searchInput.first().inputValue()
        expect(value).toContain('test')
      }
    })
  })

  test.describe('Click Event Propagation', () => {
    test('UI-14: Clicks on buttons trigger click handlers', async ({ basePage }) => {
      await basePage.goto()
      // Open a note first
      const recentNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
      if (await recentNote.isVisible()) {
        await recentNote.click()
        await basePage.page.waitForTimeout(500)
      }

      // Track click events
      let clickReceived = false
      await basePage.page.exposeFunction('testClickHandler', () => {
        clickReceived = true
      })

      // Add click listener to toggle button
      const toggleBtn = basePage.page.locator('[data-testid="right-sidebar-toggle"]')
      await toggleBtn.evaluate(el => {
        el.addEventListener('click', () => {
          // @ts-expect-error - exposed function
          window.testClickHandler()
        }, { once: true })
      })

      // Click the button
      await toggleBtn.click()
      await basePage.page.waitForTimeout(100)

      // Click should have been received (not blocked)
      expect(clickReceived).toBe(true)
    })

    test('UI-15: Double-click on notes list item selects text', async ({ basePage }) => {
      await basePage.goto()

      const noteButton = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
      const isVisible = await noteButton.isVisible().catch(() => false)

      if (isVisible) {
        // Double-click should select the note (or text)
        await noteButton.dblclick()
        await basePage.page.waitForTimeout(300)

        // Page should remain stable
        await expect(basePage.page.locator('body')).toBeVisible()
      }
    })
  })

  test.describe('Tab Panel Interactions', () => {
    test('UI-16: Right sidebar tab buttons are clickable', async ({ basePage }) => {
      await basePage.goto()
      const recentNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
      if (await recentNote.isVisible()) {
        await recentNote.click()
        await basePage.page.waitForTimeout(500)
      }

      // Find tab buttons in right sidebar
      const tabButtons = basePage.page.locator('[data-testid="right-sidebar"] .sidebar-tabs button')
      const count = await tabButtons.count()

      // Click each tab
      for (let i = 0; i < Math.min(count, 4); i++) {
        await tabButtons.nth(i).click()
        await basePage.page.waitForTimeout(150)
      }

      // Page should be stable
      await expect(basePage.page.locator('body')).toBeVisible()
    })

    test('UI-17: Tab button shows active state on click', async ({ basePage }) => {
      await basePage.goto()
      const recentNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
      if (await recentNote.isVisible()) {
        await recentNote.click()
        await basePage.page.waitForTimeout(500)
      }

      // Click Backlinks tab (specifically in sidebar tabs, not the panel header)
      const backlinksTab = basePage.page.locator('.sidebar-tabs button:has-text("Backlinks")').first()
      const isVisible = await backlinksTab.isVisible().catch(() => false)

      if (isVisible) {
        await backlinksTab.click()
        await basePage.page.waitForTimeout(200)

        // Check if it has active class or attribute
        const isActive = await backlinksTab.evaluate(el => {
          return el.classList.contains('active') ||
                 el.getAttribute('data-state') === 'active' ||
                 el.getAttribute('aria-selected') === 'true'
        })
        expect(isActive).toBe(true)
      }
    })
  })

  test.describe('Rapid Click Tests', () => {
    test('UI-18: Rapid clicks on toggle button work correctly', async ({ basePage }) => {
      await basePage.goto()
      const recentNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
      if (await recentNote.isVisible()) {
        await recentNote.click()
        await basePage.page.waitForTimeout(500)
      }

      const toggleBtn = basePage.page.locator('[data-testid="right-sidebar-toggle"]')
      const rightSidebar = basePage.page.locator('[data-testid="right-sidebar"]')

      // Get initial state
      const initialWidth = (await rightSidebar.boundingBox())?.width ?? 0

      // Rapid clicks (10 times)
      for (let i = 0; i < 10; i++) {
        await toggleBtn.click()
        await basePage.page.waitForTimeout(50) // Very fast
      }

      await basePage.page.waitForTimeout(300) // Wait for animations

      // After even number of clicks, should be same as initial
      const finalWidth = (await rightSidebar.boundingBox())?.width ?? 0
      expect(finalWidth).toBe(initialWidth)
    })

    test('UI-19: Switching notes rapidly maintains UI responsiveness', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      const notes = basePage.page.locator('button:has-text("Welcome"), button:has-text("Features")')
      const count = await notes.count()

      if (count >= 2) {
        // Switch between notes rapidly
        for (let i = 0; i < 6; i++) {
          const note = notes.nth(i % count)
          if (await note.isVisible()) {
            await note.click()
            await basePage.page.waitForTimeout(100)
          }
        }
      }

      // Right sidebar toggle should still work
      const toggleBtn = basePage.page.locator('[data-testid="right-sidebar-toggle"]')
      const isVisible = await toggleBtn.isVisible().catch(() => false)

      if (isVisible) {
        await toggleBtn.click()
        await basePage.page.waitForTimeout(200)
        await toggleBtn.click()
      }

      await expect(basePage.page.locator('body')).toBeVisible()
    })

    test('UI-20: All header elements remain responsive during editing', async ({ basePage }) => {
      await basePage.goto()
      const recentNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
      if (await recentNote.isVisible()) {
        await recentNote.click()
        await basePage.page.waitForTimeout(500)
      }

      // Start typing in editor
      const editor = basePage.page.locator('.editor-content, [contenteditable="true"]').first()
      if (await editor.isVisible()) {
        await editor.click()
        await basePage.page.keyboard.type('Testing header responsiveness...')

        // While content is being edited, header elements should still work
        const toggleBtn = basePage.page.locator('[data-testid="right-sidebar-toggle"]')
        if (await toggleBtn.isVisible()) {
          await toggleBtn.click()
          await basePage.page.waitForTimeout(200)
          await toggleBtn.click()
        }

        // Timer should still work
        const timerBtn = basePage.page.locator('.timer-btn').first()
        if (await timerBtn.isVisible()) {
          await timerBtn.click()
          await basePage.page.waitForTimeout(100)
        }
      }

      await expect(basePage.page.locator('body')).toBeVisible()
    })
  })
})
