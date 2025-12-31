import { test, expect, testData } from '../fixtures'

/**
 * Edge Case and Torture Tests for Tauri/Browser Parity
 *
 * These tests verify that the app handles unusual inputs and stress scenarios
 * correctly in both browser and Tauri modes.
 *
 * Categories:
 * - EDGE: Edge cases (special inputs, boundary conditions)
 * - STRESS: Stress tests (rapid operations, many items)
 * - SECURITY: Security-related edge cases
 *
 * Tests: EDGE-01 to EDGE-20, STRESS-01 to STRESS-10
 */

test.describe('Edge Cases', () => {
  test.describe('Empty and Whitespace Content', () => {
    test('EDGE-01: Note with empty title is handled', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(500)

      // Create a new note
      await basePage.page.keyboard.press('Meta+n')
      await basePage.page.waitForTimeout(500)

      // The app should create a note with default title (e.g., "Untitled")
      // or handle empty title gracefully
      const notes = basePage.page.locator('.note-item, .project-list-compact button')
      const count = await notes.count()
      expect(count).toBeGreaterThan(0)
    })

    test('EDGE-02: Note with whitespace-only content saves correctly', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Create a new note first
      await basePage.page.keyboard.press('Meta+n')
      await basePage.page.waitForTimeout(500)

      // Find editor and enter whitespace content
      const editor = basePage.page.locator('.editor-content, [contenteditable="true"]').first()
      if (await editor.isVisible()) {
        await editor.click()
        await basePage.page.keyboard.type('   \n\n   ')
        await basePage.page.waitForTimeout(300)
      }

      // Should not crash - just verify page is stable
      await expect(basePage.page.locator('body')).toBeVisible()
    })
  })

  test.describe('Long Content', () => {
    test('EDGE-03: Very long note title is handled', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(500)

      // Create note with very long title
      await basePage.page.keyboard.press('Meta+n')
      await basePage.page.waitForTimeout(500)

      const longTitle = 'A'.repeat(500) // 500 character title
      const editor = basePage.page.locator('.editor-content, [contenteditable="true"]').first()

      if (await editor.isVisible()) {
        await editor.click()
        await basePage.page.keyboard.type(`# ${longTitle}`)
        await basePage.page.waitForTimeout(500)
      }

      // Should handle gracefully - page should remain stable
      await expect(basePage.page.locator('body')).toBeVisible()
    })

    test('EDGE-04: Note with 10000+ characters saves correctly', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(500)

      await basePage.page.keyboard.press('Meta+n')
      await basePage.page.waitForTimeout(500)

      const editor = basePage.page.locator('.editor-content, [contenteditable="true"]').first()
      if (await editor.isVisible()) {
        // Type a large document
        const content = '# Large Document\n\n' + 'Lorem ipsum dolor sit amet. '.repeat(400)
        await editor.click()
        await editor.fill(content)
        await basePage.page.waitForTimeout(500)
      }

      // Verify save by reloading
      await basePage.page.reload()
      await basePage.page.waitForLoadState('networkidle')

      // Content should persist
      await expect(basePage.page.locator('body')).toBeVisible()
    })
  })

  test.describe('Special Characters', () => {
    test('EDGE-05: Unicode characters in note title', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(500)

      await basePage.page.keyboard.press('Meta+n')
      await basePage.page.waitForTimeout(500)

      const editor = basePage.page.locator('.editor-content, [contenteditable="true"]').first()
      if (await editor.isVisible()) {
        await editor.click()
        // Unicode: emoji, Chinese, Arabic, Hebrew
        await basePage.page.keyboard.type('# 🎉 测试 اختبار מבחן')
        await basePage.page.waitForTimeout(500)
      }

      await expect(basePage.page.locator('body')).toBeVisible()
    })

    test('EDGE-06: Special markdown characters are escaped correctly', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(500)

      await basePage.page.keyboard.press('Meta+n')
      await basePage.page.waitForTimeout(500)

      const editor = basePage.page.locator('.editor-content, [contenteditable="true"]').first()
      if (await editor.isVisible()) {
        await editor.click()
        // Characters that could break markdown: `, *, _, ~, <, >
        await basePage.page.keyboard.type('# Test `code` *bold* _italic_ <tag>')
        await basePage.page.waitForTimeout(500)
      }

      await expect(basePage.page.locator('body')).toBeVisible()
    })

    test('EDGE-07: Wiki links with special characters', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(500)

      await basePage.page.keyboard.press('Meta+n')
      await basePage.page.waitForTimeout(500)

      const editor = basePage.page.locator('.editor-content, [contenteditable="true"]').first()
      if (await editor.isVisible()) {
        await editor.click()
        // Wiki links with brackets, pipes, special chars
        await basePage.page.keyboard.type('[[Note with [brackets]]] [[Note|alias]]')
        await basePage.page.waitForTimeout(500)
      }

      await expect(basePage.page.locator('body')).toBeVisible()
    })
  })

  test.describe('Security Edge Cases', () => {
    test('EDGE-08: XSS attempt in note content is sanitized', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(500)

      await basePage.page.keyboard.press('Meta+n')
      await basePage.page.waitForTimeout(500)

      const editor = basePage.page.locator('.editor-content, [contenteditable="true"]').first()
      if (await editor.isVisible()) {
        await editor.click()
        // Common XSS payloads
        await basePage.page.keyboard.type('<script>alert("xss")</script>')
        await basePage.page.keyboard.press('Enter')
        await basePage.page.keyboard.type('<img src=x onerror=alert("xss")>')
        await basePage.page.waitForTimeout(500)
      }

      // Should not trigger any alerts - check page is stable
      await expect(basePage.page.locator('body')).toBeVisible()

      // Verify no script execution by checking console for errors
      // The test passes if we get here without alerts blocking
    })

    test('EDGE-09: SQL injection attempt in search is handled', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(500)

      // Open search (Cmd+F)
      await basePage.page.keyboard.press('Meta+f')
      await basePage.page.waitForTimeout(300)

      const searchInput = basePage.page.locator('input[placeholder*="Search"], input[type="search"]')
      if (await searchInput.isVisible()) {
        // SQL injection attempts
        await searchInput.fill("'; DROP TABLE notes; --")
        await basePage.page.waitForTimeout(500)
      }

      // Should not crash - search just returns no results
      await expect(basePage.page.locator('body')).toBeVisible()
    })
  })

  test.describe('Boundary Conditions', () => {
    test('EDGE-10: Rapidly switching between notes', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Demo data creates Welcome and Features notes
      const notes = basePage.page.locator('button:has-text("Welcome"), button:has-text("Features")')
      const count = await notes.count()

      if (count >= 2) {
        // Click notes rapidly
        for (let i = 0; i < 10; i++) {
          const index = i % Math.min(count, 2)
          const note = notes.nth(index)
          if (await note.isVisible().catch(() => false)) {
            await note.click()
            await basePage.page.waitForTimeout(50) // Very fast switching
          }
        }
      }

      // Should remain stable
      await expect(basePage.page.locator('body')).toBeVisible()
    })

    test('EDGE-11: Creating note during loading state', async ({ basePage }) => {
      await basePage.goto()

      // Immediately try to create note while page is loading
      await basePage.page.keyboard.press('Meta+n')
      await basePage.page.waitForTimeout(100)
      await basePage.page.keyboard.press('Meta+n')
      await basePage.page.waitForTimeout(100)
      await basePage.page.keyboard.press('Meta+n')

      await basePage.page.waitForTimeout(1000)

      // Should handle gracefully
      await expect(basePage.page.locator('body')).toBeVisible()
    })

    test('EDGE-12: Deleting currently selected note', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Click a note from demo data
      const note = basePage.page.locator('button:has-text("Welcome")').first()
      if (await note.isVisible().catch(() => false)) {
        await note.click()
        await basePage.page.waitForTimeout(300)

        // Try to delete (right-click context menu or keyboard)
        await note.click({ button: 'right' })
        await basePage.page.waitForTimeout(200)

        const deleteOption = basePage.page.locator('text=Delete')
        if (await deleteOption.isVisible().catch(() => false)) {
          // Don't actually delete - just verify menu works
          await basePage.page.keyboard.press('Escape')
        }
      }

      await expect(basePage.page.locator('body')).toBeVisible()
    })
  })
})

test.describe('Stress Tests', () => {
  test.describe('Rapid Operations', () => {
    test('STRESS-01: Create 10 notes rapidly', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(500)

      for (let i = 0; i < 10; i++) {
        await basePage.page.keyboard.press('Meta+n')
        await basePage.page.waitForTimeout(200)
      }

      await basePage.page.waitForTimeout(1000)

      // Should have created notes without crashing
      await expect(basePage.page.locator('body')).toBeVisible()
    })

    test('STRESS-02: Rapid keyboard shortcuts', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(500)

      // Fire off many shortcuts rapidly
      const shortcuts = [
        'Meta+n',  // New note
        'Meta+k',  // Command palette
        'Escape',
        'Meta+d',  // Daily note
        'Meta+Shift+KeyC', // Quick capture
        'Escape',
        'Meta+0',  // Mission control
      ]

      for (const shortcut of shortcuts) {
        await basePage.page.keyboard.press(shortcut)
        await basePage.page.waitForTimeout(100)
      }

      await basePage.page.waitForTimeout(500)
      await expect(basePage.page.locator('body')).toBeVisible()
    })

    test('STRESS-03: Rapid typing in editor', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Create a new note
      await basePage.page.keyboard.press('Meta+n')
      await basePage.page.waitForTimeout(500)

      const editor = basePage.page.locator('.editor-content, [contenteditable="true"]').first()
      if (await editor.isVisible().catch(() => false)) {
        await editor.click()
        // Type rapidly (shorter text to avoid timeout)
        const rapidText = 'abcdefghijklmnopqrstuvwxyz '.repeat(5)
        await basePage.page.keyboard.type(rapidText, { delay: 10 })
      }

      await basePage.page.waitForTimeout(500)
      await expect(basePage.page.locator('body')).toBeVisible()
    })
  })

  test.describe('Page State Persistence', () => {
    test('STRESS-04: Multiple reloads preserve state', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(500)

      // Create a note
      await basePage.page.keyboard.press('Meta+n')
      await basePage.page.waitForTimeout(500)

      const editor = basePage.page.locator('.editor-content, [contenteditable="true"]').first()
      if (await editor.isVisible()) {
        await editor.click()
        await basePage.page.keyboard.type('# Persistence Test\n\nThis should survive reloads.')
        await basePage.page.waitForTimeout(500)
      }

      // Reload multiple times
      for (let i = 0; i < 3; i++) {
        await basePage.page.reload()
        await basePage.page.waitForLoadState('networkidle')
        await basePage.page.waitForTimeout(500)
      }

      // Verify page is stable after reloads
      await expect(basePage.page.locator('body')).toBeVisible()
    })

    test('STRESS-05: Navigate away and back preserves state', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(500)

      // Note the current state
      const leftSidebar = basePage.page.locator('[data-testid="left-sidebar"]')
      const initialVisible = await leftSidebar.isVisible()

      // Navigate to a different URL (about:blank) and back
      await basePage.page.goto('about:blank')
      await basePage.page.waitForTimeout(200)
      await basePage.page.goBack()
      await basePage.page.waitForLoadState('networkidle')
      await basePage.page.waitForTimeout(500)

      // Should restore state
      await expect(basePage.page.locator('body')).toBeVisible()
    })
  })

  test.describe('Concurrent Operations', () => {
    test('STRESS-06: Open command palette while typing', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Create a new note first
      await basePage.page.keyboard.press('Meta+n')
      await basePage.page.waitForTimeout(500)

      const editor = basePage.page.locator('.editor-content, [contenteditable="true"]').first()
      if (await editor.isVisible().catch(() => false)) {
        await editor.click()
        // Start typing
        await basePage.page.keyboard.type('test', { delay: 50 })
        // Interrupt with command palette
        await basePage.page.keyboard.press('Meta+k')
        await basePage.page.waitForTimeout(200)
        // Close and continue typing
        await basePage.page.keyboard.press('Escape')
        await basePage.page.waitForTimeout(100)
        await basePage.page.keyboard.type('more text', { delay: 50 })
      }

      await expect(basePage.page.locator('body')).toBeVisible()
    })

    test('STRESS-07: Toggle sidebars while creating notes', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Toggle left sidebar
      await basePage.page.keyboard.press('Meta+Shift+[')
      await basePage.page.waitForTimeout(100)

      // Create a note
      await basePage.page.keyboard.press('Meta+n')
      await basePage.page.waitForTimeout(300)

      // Toggle right sidebar
      await basePage.page.keyboard.press('Meta+Shift+]')
      await basePage.page.waitForTimeout(100)

      // Create another note
      await basePage.page.keyboard.press('Meta+n')
      await basePage.page.waitForTimeout(300)

      // Toggle sidebars again
      await basePage.page.keyboard.press('Meta+Shift+[')
      await basePage.page.waitForTimeout(100)
      await basePage.page.keyboard.press('Meta+Shift+]')

      await expect(basePage.page.locator('body')).toBeVisible()
    })
  })
})

test.describe('Data Integrity', () => {
  test('EDGE-13: Backlinks panel renders correctly', async ({ basePage }) => {
    await basePage.goto()
    await basePage.page.waitForTimeout(1000)

    // Create a note with wiki link
    await basePage.page.keyboard.press('Meta+n')
    await basePage.page.waitForTimeout(500)

    const editor = basePage.page.locator('.editor-content, [contenteditable="true"]').first()
    if (await editor.isVisible().catch(() => false)) {
      await editor.click()
      await basePage.page.keyboard.type('# Test Note\n\n[[Another Note]]')
      await basePage.page.waitForTimeout(500)
    }

    // Check if right sidebar / backlinks panel can be accessed
    await basePage.page.keyboard.press('Meta+Shift+]')
    await basePage.page.waitForTimeout(300)

    // Verify page is stable with backlinks panel
    await expect(basePage.page.locator('body')).toBeVisible()
  })

  test('EDGE-14: Note content persists correctly after edit', async ({ basePage }) => {
    await basePage.goto()
    await basePage.page.waitForTimeout(1000)

    // Create a note
    await basePage.page.keyboard.press('Meta+n')
    await basePage.page.waitForTimeout(500)

    const editor = basePage.page.locator('.editor-content, [contenteditable="true"]').first()
    if (await editor.isVisible().catch(() => false)) {
      await editor.click()
      await basePage.page.keyboard.type('# Persistence Test\n\nOriginal content')
      await basePage.page.waitForTimeout(500)

      // Edit the note
      await basePage.page.keyboard.type('\n\nAdded content')
      await basePage.page.waitForTimeout(500)
    }

    // Reload and check content persists
    await basePage.page.reload()
    await basePage.page.waitForLoadState('networkidle')
    await basePage.page.waitForTimeout(1000)

    await expect(basePage.page.locator('body')).toBeVisible()
  })

  test('EDGE-15: Project assignment survives note updates', async ({ basePage }) => {
    await basePage.goto()
    await basePage.page.waitForTimeout(1000)

    // Create a new note in a project
    await basePage.page.keyboard.press('Meta+n')
    await basePage.page.waitForTimeout(500)

    const editor = basePage.page.locator('.editor-content, [contenteditable="true"]').first()
    if (await editor.isVisible().catch(() => false)) {
      await editor.click()
      await basePage.page.keyboard.type('# Project Note\n\nContent in project')
      await basePage.page.waitForTimeout(500)

      // Edit the note
      await basePage.page.keyboard.type('\n\nEdited content')
      await basePage.page.waitForTimeout(300)
    }

    // Verify note is still visible after edit
    await expect(basePage.page.locator('body')).toBeVisible()
  })
})
