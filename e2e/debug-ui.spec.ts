/**
 * Debug test to inspect browser mode UI structure
 */

import { test } from '@playwright/test'

test.describe('Browser Mode UI Debug', () => {
  test('Take screenshot and dump HTML', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000) // Wait for IndexedDB init + reindexing

    // Take screenshot BEFORE creating note
    await page.screenshot({ path: 'test-results/browser-mode-before-note.png', fullPage: true })

    console.log('\n=== BEFORE CREATING NOTE ===')
    let buttons = await page.locator('button').all()
    console.log(`\nFound ${buttons.length} buttons on page`)

    // Create a note
    console.log('\n=== CREATING FIRST NOTE ===')
    await page.click('button:has-text("New Page")')
    await page.waitForTimeout(2000)

    // Take screenshot AFTER creating note
    await page.screenshot({ path: 'test-results/browser-mode-after-note.png', fullPage: true })

    console.log('\n=== AFTER CREATING NOTE ===')
    buttons = await page.locator('button').all()
    console.log(`\nFound ${buttons.length} buttons on page:`)

    for (let i = 0; i < Math.min(buttons.length, 30); i++) {
      const button = buttons[i]
      const title = await button.getAttribute('title')
      const testId = await button.getAttribute('data-testid')
      const text = await button.textContent()
      const classes = await button.getAttribute('class')

      // Only show buttons with text or test IDs
      if ((text && text.trim()) || testId || title) {
        console.log(`\nButton ${i + 1}:`)
        if (title) console.log(`  title: "${title}"`)
        if (testId) console.log(`  data-testid: "${testId}"`)
        if (text && text.trim()) console.log(`  text: "${text.trim().substring(0, 50)}"`)
      }
    }

    // Check for right sidebar after note creation
    const sidebar = page.locator('[data-testid="right-sidebar"]')
    const hasSidebar = await sidebar.count()
    console.log(`\nRight sidebar found: ${hasSidebar > 0}`)
  })
})
