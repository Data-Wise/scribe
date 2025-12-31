import { test, expect } from '../fixtures'

/**
 * Claude Features Tests (E2E)
 *
 * Tests for Claude AI chat panel features including Quick Actions,
 * @ References, message interaction, and export functionality.
 *
 * Tests: CF-01 to CF-20
 */

test.describe('Claude Features', () => {
  test.beforeEach(async ({ seededPage }) => {
    await seededPage.goto()
    // Wait for app to fully load
    await seededPage.page.waitForTimeout(500)

    // Open a test note
    const testNote = seededPage.page.locator('button:has-text("Test Note One")').first()
    await testNote.click()
    await seededPage.page.waitForTimeout(300)

    // Open Claude tab
    const claudeTab = seededPage.page.locator('[data-testid="claude-tab"]')
    await claudeTab.click()
    await seededPage.page.waitForTimeout(300)
  })

  test.describe('Quick Actions', () => {
    test('CF-01: All 5 quick action buttons visible with note context', async ({ seededPage }) => {
      const quickActions = seededPage.page.locator('[data-testid="quick-actions"]')
      await expect(quickActions).toBeVisible()

      // Verify all 5 buttons with emoji icons
      await expect(seededPage.page.locator('button:has-text("✨"):has-text("Improve")')).toBeVisible()
      await expect(seededPage.page.locator('button:has-text("📝"):has-text("Expand")')).toBeVisible()
      await expect(seededPage.page.locator('button:has-text("📋"):has-text("Summarize")')).toBeVisible()
      await expect(seededPage.page.locator('button:has-text("💡"):has-text("Explain")')).toBeVisible()
      await expect(seededPage.page.locator('button:has-text("🔍"):has-text("Research")')).toBeVisible()
    })

    test('CF-02: Quick actions not visible without note context', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(300)

      // Open Claude tab without opening a note
      const claudeTab = basePage.page.locator('[data-testid="claude-tab"]')
      await claudeTab.click()
      await basePage.page.waitForTimeout(300)

      // Quick actions should not be visible
      const quickActions = basePage.page.locator('[data-testid="quick-actions"]')
      await expect(quickActions).not.toBeVisible()
    })

    test('CF-03: Clicking Improve sends message', async ({ seededPage }) => {
      const improveBtn = seededPage.page.locator('button:has-text("Improve")')
      await improveBtn.click()
      await seededPage.page.waitForTimeout(500)

      // Should see the prompt in messages
      const message = seededPage.page.locator('text=Improve clarity and flow')
      await expect(message).toBeVisible()
    })

    test('CF-04: Clicking Expand sends message', async ({ seededPage }) => {
      const expandBtn = seededPage.page.locator('button:has-text("Expand")')
      await expandBtn.click()
      await seededPage.page.waitForTimeout(500)

      const message = seededPage.page.locator('text=Expand on this idea')
      await expect(message).toBeVisible()
    })

    test('CF-05: Clicking Summarize sends message', async ({ seededPage }) => {
      const summarizeBtn = seededPage.page.locator('button:has-text("Summarize")')
      await summarizeBtn.click()
      await seededPage.page.waitForTimeout(500)

      const message = seededPage.page.locator('text=Summarize in 2-3 sentences')
      await expect(message).toBeVisible()
    })

    test('CF-06: Clicking Explain sends message', async ({ seededPage }) => {
      const explainBtn = seededPage.page.locator('button:has-text("Explain")')
      await explainBtn.click()
      await seededPage.page.waitForTimeout(500)

      const message = seededPage.page.locator('text=Explain this simply')
      await expect(message).toBeVisible()
    })

    test('CF-07: Clicking Research sends message', async ({ seededPage }) => {
      const researchBtn = seededPage.page.locator('button:has-text("Research")')
      await researchBtn.click()
      await seededPage.page.waitForTimeout(500)

      const message = seededPage.page.locator('text=What does research say about this?')
      await expect(message).toBeVisible()
    })

    test('CF-08: Quick action gets AI response', async ({ seededPage }) => {
      const improveBtn = seededPage.page.locator('button:has-text("Improve")')
      await improveBtn.click()
      await seededPage.page.waitForTimeout(500)

      // Should get browser stub response
      const response = seededPage.page.locator('text=/AI features are only available/')
      await expect(response).toBeVisible()
    })

    test('CF-09: Input clears after quick action', async ({ seededPage }) => {
      // Type something in input first
      const input = seededPage.page.locator('[data-testid="chat-input"]')
      await input.fill('Some text')
      await seededPage.page.waitForTimeout(200)

      // Click quick action
      const improveBtn = seededPage.page.locator('button:has-text("Improve")')
      await improveBtn.click()
      await seededPage.page.waitForTimeout(500)

      // Input should be cleared
      await expect(input).toHaveValue('')
    })
  })

  test.describe('Message Interaction', () => {
    test('CF-10: Send message with Enter key', async ({ seededPage }) => {
      const input = seededPage.page.locator('[data-testid="chat-input"]')
      await input.fill('Test message via Enter')
      await input.press('Enter')
      await seededPage.page.waitForTimeout(500)

      // Message should appear
      const message = seededPage.page.locator('text=Test message via Enter')
      await expect(message).toBeVisible()
    })

    test('CF-11: Send message with send button', async ({ seededPage }) => {
      const input = seededPage.page.locator('[data-testid="chat-input"]')
      await input.fill('Test message via button')

      const sendButton = seededPage.page.locator('[data-testid="send-button"]')
      await sendButton.click()
      await seededPage.page.waitForTimeout(500)

      const message = seededPage.page.locator('text=Test message via button')
      await expect(message).toBeVisible()
    })

    test('CF-12: Empty message not sent', async ({ seededPage }) => {
      const input = seededPage.page.locator('[data-testid="chat-input"]')
      const sendButton = seededPage.page.locator('[data-testid="send-button"]')

      // Try to send empty message
      await sendButton.click()
      await seededPage.page.waitForTimeout(300)

      // Empty state should still be visible (no messages sent)
      const emptyState = seededPage.page.locator('text=Ask Claude anything about your writing.')
      await expect(emptyState).toBeVisible()
    })

    test('CF-13: User message shows correct styling', async ({ seededPage }) => {
      const input = seededPage.page.locator('[data-testid="chat-input"]')
      await input.fill('User test message')
      await input.press('Enter')
      await seededPage.page.waitForTimeout(500)

      // Find user message container
      const messageContainer = seededPage.page.locator('[data-testid="messages-container"]')
      const userMessage = messageContainer.locator('text=User test message').locator('..')

      // User messages should have User icon
      const userIcon = userMessage.locator('svg[class*="lucide-user"]')
      await expect(userIcon).toBeVisible()
    })

    test('CF-14: AI response shows correct styling', async ({ seededPage }) => {
      const input = seededPage.page.locator('[data-testid="chat-input"]')
      await input.fill('Question for AI')
      await input.press('Enter')
      await seededPage.page.waitForTimeout(500)

      // Find AI message container
      const messageContainer = seededPage.page.locator('[data-testid="messages-container"]')
      const aiMessage = messageContainer.locator('text=/AI features are only available/').locator('..')

      // AI messages should have Bot icon
      const botIcon = aiMessage.locator('svg[class*="lucide-bot"]')
      await expect(botIcon).toBeVisible()
    })

    test('CF-15: Messages auto-scroll to bottom', async ({ seededPage }) => {
      const input = seededPage.page.locator('[data-testid="chat-input"]')

      // Send multiple messages
      for (let i = 1; i <= 5; i++) {
        await input.fill(`Message ${i}`)
        await input.press('Enter')
        await seededPage.page.waitForTimeout(300)
      }

      // Latest message should be visible (scrolled to bottom)
      const lastMessage = seededPage.page.locator('text=Message 5')
      await expect(lastMessage).toBeVisible()
    })
  })

  test.describe('@ References', () => {
    test('CF-16: @ symbol triggers autocomplete menu', async ({ seededPage }) => {
      const input = seededPage.page.locator('[data-testid="chat-input"]')

      // Type @ to trigger autocomplete
      await input.fill('@')
      await seededPage.page.waitForTimeout(300)

      // Autocomplete menu should appear
      const autocompleteMenu = seededPage.page.locator('[data-testid="at-menu"]')
      await expect(autocompleteMenu).toBeVisible()
    })

    test('CF-17: Autocomplete shows available notes', async ({ seededPage }) => {
      const input = seededPage.page.locator('[data-testid="chat-input"]')
      await input.fill('@')
      await seededPage.page.waitForTimeout(300)

      // Should show test notes in autocomplete
      const menu = seededPage.page.locator('[data-testid="at-menu"]')
      await expect(menu.locator('text=Test Note Two')).toBeVisible()
    })

    test('CF-18: Autocomplete filters by search query', async ({ seededPage }) => {
      const input = seededPage.page.locator('[data-testid="chat-input"]')

      // Type @ with search query
      await input.fill('@Two')
      await seededPage.page.waitForTimeout(300)

      const menu = seededPage.page.locator('[data-testid="at-menu"]')

      // Should show matching note
      await expect(menu.locator('text=Test Note Two')).toBeVisible()

      // Should not show non-matching notes
      const searchTarget = menu.locator('text=Search Target Note')
      const isVisible = await searchTarget.isVisible().catch(() => false)
      expect(isVisible).toBe(false)
    })

    test('CF-19: Selecting note adds reference badge', async ({ seededPage }) => {
      const input = seededPage.page.locator('[data-testid="chat-input"]')
      await input.fill('@')
      await seededPage.page.waitForTimeout(300)

      // Click on a note in autocomplete
      const noteOption = seededPage.page.locator('[data-testid="at-menu"] button:has-text("Test Note Two")').first()
      await noteOption.click()
      await seededPage.page.waitForTimeout(300)

      // Reference badge should appear
      const referenceBadge = seededPage.page.locator('[data-testid="note-reference-badge"]:has-text("Test Note Two")')
      await expect(referenceBadge).toBeVisible()
    })

    test('CF-20: Can remove reference badge', async ({ seededPage }) => {
      const input = seededPage.page.locator('[data-testid="chat-input"]')
      await input.fill('@')
      await seededPage.page.waitForTimeout(300)

      // Add reference
      const noteOption = seededPage.page.locator('[data-testid="at-menu"] button:has-text("Test Note Two")').first()
      await noteOption.click()
      await seededPage.page.waitForTimeout(300)

      // Click remove button on badge
      const removeBadgeBtn = seededPage.page.locator('[data-testid="note-reference-badge"]:has-text("Test Note Two") button')
      await removeBadgeBtn.click()
      await seededPage.page.waitForTimeout(200)

      // Badge should be gone
      const referenceBadge = seededPage.page.locator('[data-testid="note-reference-badge"]:has-text("Test Note Two")')
      await expect(referenceBadge).not.toBeVisible()
    })
  })

  test.describe('Chat Management', () => {
    test('CF-21: Clear chat button removes all messages', async ({ seededPage }) => {
      const input = seededPage.page.locator('[data-testid="chat-input"]')

      // Send a message
      await input.fill('Message to clear')
      await input.press('Enter')
      await seededPage.page.waitForTimeout(500)

      // Verify message exists
      await expect(seededPage.page.locator('text=Message to clear')).toBeVisible()

      // Click clear button
      const clearButton = seededPage.page.locator('[data-testid="clear-chat-button"]')
      await clearButton.click()
      await seededPage.page.waitForTimeout(300)

      // Message should be gone
      await expect(seededPage.page.locator('text=Message to clear')).not.toBeVisible()

      // Empty state should be visible
      const emptyState = seededPage.page.locator('text=Ask Claude anything about your writing.')
      await expect(emptyState).toBeVisible()
    })

    test('CF-22: Export chat button visible when messages exist', async ({ seededPage }) => {
      // Send a message first
      const input = seededPage.page.locator('[data-testid="chat-input"]')
      await input.fill('Test message')
      await input.press('Enter')
      await seededPage.page.waitForTimeout(500)

      // Export button should be visible
      const exportButton = seededPage.page.locator('button[title*="Export"]')
      await expect(exportButton).toBeVisible()
    })

    test('CF-23: Note context shown in panel', async ({ seededPage }) => {
      // Should show context of current note
      const contextText = seededPage.page.locator('text=Context: Test Note One')
      await expect(contextText).toBeVisible()
    })

    test('CF-24: Context updates when switching notes', async ({ seededPage }) => {
      // Verify initial context
      await expect(seededPage.page.locator('text=Context: Test Note One')).toBeVisible()

      // Switch to different note
      const testNote2 = seededPage.page.locator('button:has-text("Test Note Two")').first()
      await testNote2.click()
      await seededPage.page.waitForTimeout(500)

      // Context should update
      await expect(seededPage.page.locator('text=Context: Test Note Two')).toBeVisible()
      await expect(seededPage.page.locator('text=Context: Test Note One')).not.toBeVisible()
    })
  })

  test.describe('Browser Mode Behavior', () => {
    test('CF-25: Shows browser stub message for AI requests', async ({ seededPage }) => {
      const input = seededPage.page.locator('[data-testid="chat-input"]')
      await input.fill('Test AI request')
      await input.press('Enter')
      await seededPage.page.waitForTimeout(500)

      // Should show browser stub message
      const stubMessage = seededPage.page.locator('text=/AI features are only available in the desktop app/')
      await expect(stubMessage).toBeVisible()
    })

    test('CF-26: Browser stub includes helpful instructions', async ({ seededPage }) => {
      const input = seededPage.page.locator('[data-testid="chat-input"]')
      await input.fill('Question')
      await input.press('Enter')
      await seededPage.page.waitForTimeout(500)

      // Should mention running in Tauri mode
      const instructions = seededPage.page.locator('text=/npm run dev/')
      await expect(instructions).toBeVisible()
    })

    test('CF-27: Quick actions work in browser mode', async ({ seededPage }) => {
      // Quick actions should trigger in browser mode (show stub)
      const improveBtn = seededPage.page.locator('button:has-text("Improve")')
      await improveBtn.click()
      await seededPage.page.waitForTimeout(500)

      // Should see prompt
      await expect(seededPage.page.locator('text=Improve clarity and flow')).toBeVisible()

      // Should get browser stub response
      await expect(seededPage.page.locator('text=/AI features are only available/')).toBeVisible()
    })
  })
})
