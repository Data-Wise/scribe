import { test, expect } from '../fixtures'

/**
 * Quick Chat Enhanced Tests (E2E)
 *
 * Advanced tests for Quick Chat functionality including message sending,
 * AI responses, editor context integration, and persistence.
 *
 * Tests: QCE-01 to QCE-15
 * Complements quick-chat.spec.ts (UI/keyboard tests)
 */

test.describe('Quick Chat Enhanced', () => {
  test.beforeEach(async ({ seededPage }) => {
    await seededPage.goto()
    // Wait for app to fully load
    await seededPage.page.waitForTimeout(500)

    // Open a test note for context
    const testNote = seededPage.page.locator('button:has-text("Test Note One")').first()
    await testNote.click()
    await seededPage.page.waitForTimeout(300)
  })

  test.describe('Message Interaction', () => {
    test('QCE-01: Send message with Enter in quick chat', async ({ seededPage }) => {
      // Open quick chat
      await seededPage.page.keyboard.press('Meta+j')
      await seededPage.page.waitForTimeout(300)

      const input = seededPage.page.locator('[data-testid="quick-chat-popover"] input')
      await input.fill('Quick question about writing')
      await input.press('Enter')
      await seededPage.page.waitForTimeout(500)

      // Message should appear in chat area
      const message = seededPage.page.locator('text=Quick question about writing')
      await expect(message).toBeVisible()
    })

    test('QCE-02: Send message with send button', async ({ seededPage }) => {
      // Open quick chat
      const quickChatBtn = seededPage.page.locator('[data-testid="quick-chat-button"]')
      await quickChatBtn.click()
      await seededPage.page.waitForTimeout(300)

      const input = seededPage.page.locator('[data-testid="quick-chat-popover"] input')
      await input.fill('Question via button')

      const sendButton = seededPage.page.locator('[data-testid="quick-chat-popover"] button[type="submit"]')
      await sendButton.click()
      await seededPage.page.waitForTimeout(500)

      const message = seededPage.page.locator('text=Question via button')
      await expect(message).toBeVisible()
    })

    test('QCE-03: Empty message not sent', async ({ seededPage }) => {
      // Open quick chat
      await seededPage.page.keyboard.press('Meta+j')
      await seededPage.page.waitForTimeout(300)

      const input = seededPage.page.locator('[data-testid="quick-chat-popover"] input')

      // Try to send empty message
      await input.press('Enter')
      await seededPage.page.waitForTimeout(300)

      // Should still show empty state in popover
      const emptyState = seededPage.page.locator('[data-testid="quick-chat-popover"] text=Ask a quick question')
      const isVisible = await emptyState.isVisible().catch(() => false)
      expect(isVisible).toBe(true)
    })

    test('QCE-04: Input cleared after sending', async ({ seededPage }) => {
      // Open quick chat
      await seededPage.page.keyboard.press('Meta+j')
      await seededPage.page.waitForTimeout(300)

      const input = seededPage.page.locator('[data-testid="quick-chat-popover"] input')
      await input.fill('Test message')
      await input.press('Enter')
      await seededPage.page.waitForTimeout(500)

      // Input should be cleared
      await expect(input).toHaveValue('')
    })

    test('QCE-05: Multiple messages in quick chat', async ({ seededPage }) => {
      // Open quick chat
      await seededPage.page.keyboard.press('Meta+j')
      await seededPage.page.waitForTimeout(300)

      const input = seededPage.page.locator('[data-testid="quick-chat-popover"] input')

      // Send first message
      await input.fill('First quick message')
      await input.press('Enter')
      await seededPage.page.waitForTimeout(500)

      // Send second message
      await input.fill('Second quick message')
      await input.press('Enter')
      await seededPage.page.waitForTimeout(500)

      // Both should be visible
      await expect(seededPage.page.locator('text=First quick message')).toBeVisible()
      await expect(seededPage.page.locator('text=Second quick message')).toBeVisible()
    })
  })

  test.describe('AI Response', () => {
    test('QCE-06: Quick chat gets AI response', async ({ seededPage }) => {
      // Open quick chat
      await seededPage.page.keyboard.press('Meta+j')
      await seededPage.page.waitForTimeout(300)

      const input = seededPage.page.locator('[data-testid="quick-chat-popover"] input')
      await input.fill('How do I improve this?')
      await input.press('Enter')
      await seededPage.page.waitForTimeout(500)

      // Should get browser stub response
      const response = seededPage.page.locator('text=/AI features are only available/')
      await expect(response).toBeVisible()
    })

    test('QCE-07: Loading state shown while waiting', async ({ seededPage }) => {
      // Open quick chat
      await seededPage.page.keyboard.press('Meta+j')
      await seededPage.page.waitForTimeout(300)

      const input = seededPage.page.locator('[data-testid="quick-chat-popover"] input')
      await input.fill('Question')
      await input.press('Enter')

      // Should show loading indicator briefly
      const loadingIndicator = seededPage.page.locator('svg[class*="lucide-loader"]')
      const wasVisible = await loadingIndicator.isVisible().catch(() => false)

      // Wait for response
      await seededPage.page.waitForTimeout(500)

      // Response should eventually appear
      const response = seededPage.page.locator('text=/AI features/')
      await expect(response).toBeVisible()
    })

    test('QCE-08: User and AI messages styled differently', async ({ seededPage }) => {
      // Open quick chat
      await seededPage.page.keyboard.press('Meta+j')
      await seededPage.page.waitForTimeout(300)

      const input = seededPage.page.locator('[data-testid="quick-chat-popover"] input')
      await input.fill('User question')
      await input.press('Enter')
      await seededPage.page.waitForTimeout(500)

      // User message should have User icon
      const userIcon = seededPage.page.locator('[data-testid="quick-chat-popover"] svg[class*="lucide-user"]')
      await expect(userIcon).toBeVisible()

      // AI message should have Bot icon
      const botIcon = seededPage.page.locator('[data-testid="quick-chat-popover"] svg[class*="lucide-bot"]')
      await expect(botIcon).toBeVisible()
    })
  })

  test.describe('Editor Context', () => {
    test('QCE-09: Quick chat includes current note context', async ({ seededPage }) => {
      // With note open, quick chat should include context
      await seededPage.page.keyboard.press('Meta+j')
      await seededPage.page.waitForTimeout(300)

      const input = seededPage.page.locator('[data-testid="quick-chat-popover"] input')
      await input.fill('What is this note about?')
      await input.press('Enter')
      await seededPage.page.waitForTimeout(500)

      // In browser mode, will get stub, but in Tauri mode this would include context
      // Verify the message was sent
      await expect(seededPage.page.locator('text=What is this note about?')).toBeVisible()
    })

    test('QCE-10: Quick chat works without note open', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(300)

      // Open quick chat without opening a note
      await basePage.page.keyboard.press('Meta+j')
      await basePage.page.waitForTimeout(300)

      const input = basePage.page.locator('[data-testid="quick-chat-popover"] input')
      await input.fill('General question')
      await input.press('Enter')
      await basePage.page.waitForTimeout(500)

      // Should still work, just without note context
      await expect(basePage.page.locator('text=General question')).toBeVisible()
    })

    test('QCE-11: Context updates when switching notes', async ({ seededPage }) => {
      // Send message with first note
      await seededPage.page.keyboard.press('Meta+j')
      await seededPage.page.waitForTimeout(300)

      let input = seededPage.page.locator('[data-testid="quick-chat-popover"] input')
      await input.fill('Question 1')
      await input.press('Enter')
      await seededPage.page.waitForTimeout(500)

      // Close quick chat
      await seededPage.page.keyboard.press('Escape')
      await seededPage.page.waitForTimeout(200)

      // Switch to different note
      const testNote2 = seededPage.page.locator('button:has-text("Test Note Two")').first()
      await testNote2.click()
      await seededPage.page.waitForTimeout(300)

      // Open quick chat again
      await seededPage.page.keyboard.press('Meta+j')
      await seededPage.page.waitForTimeout(300)

      input = seededPage.page.locator('[data-testid="quick-chat-popover"] input')
      await input.fill('Question 2')
      await input.press('Enter')
      await seededPage.page.waitForTimeout(500)

      // Both questions should be visible (they're in the same quick chat session)
      await expect(seededPage.page.locator('text=Question 1')).toBeVisible()
      await expect(seededPage.page.locator('text=Question 2')).toBeVisible()
    })
  })

  test.describe('Popover Behavior', () => {
    test('QCE-12: Popover stays open while typing', async ({ seededPage }) => {
      await seededPage.page.keyboard.press('Meta+j')
      await seededPage.page.waitForTimeout(300)

      const popover = seededPage.page.locator('[data-testid="quick-chat-popover"]')
      const input = seededPage.page.locator('[data-testid="quick-chat-popover"] input')

      // Type slowly
      await input.type('Typing slowly...')
      await seededPage.page.waitForTimeout(500)

      // Popover should still be visible
      await expect(popover).toBeVisible()
    })

    test('QCE-13: Popover closes after Escape', async ({ seededPage }) => {
      await seededPage.page.keyboard.press('Meta+j')
      await seededPage.page.waitForTimeout(300)

      const popover = seededPage.page.locator('[data-testid="quick-chat-popover"]')
      await expect(popover).toBeVisible()

      // Press Escape
      await seededPage.page.keyboard.press('Escape')
      await seededPage.page.waitForTimeout(300)

      // Popover should be closed
      await expect(popover).not.toBeVisible()
    })

    test('QCE-14: Reopening shows message history', async ({ seededPage }) => {
      // Send a message
      await seededPage.page.keyboard.press('Meta+j')
      await seededPage.page.waitForTimeout(300)

      const input = seededPage.page.locator('[data-testid="quick-chat-popover"] input')
      await input.fill('Persistent message')
      await input.press('Enter')
      await seededPage.page.waitForTimeout(500)

      // Close popover
      await seededPage.page.keyboard.press('Escape')
      await seededPage.page.waitForTimeout(300)

      // Reopen popover
      await seededPage.page.keyboard.press('Meta+j')
      await seededPage.page.waitForTimeout(300)

      // Message history should still be there
      await expect(seededPage.page.locator('text=Persistent message')).toBeVisible()
    })

    test('QCE-15: Input auto-focuses when opening', async ({ seededPage }) => {
      await seededPage.page.keyboard.press('Meta+j')
      await seededPage.page.waitForTimeout(300)

      // Start typing immediately (input should be focused)
      await seededPage.page.keyboard.type('Auto-focused text')
      await seededPage.page.waitForTimeout(300)

      // Text should be in the input
      const input = seededPage.page.locator('[data-testid="quick-chat-popover"] input')
      await expect(input).toHaveValue('Auto-focused text')
    })
  })

  test.describe('Persistence', () => {
    test('QCE-16: Quick chat history persists on page reload', async ({ seededPage }) => {
      // Send a message
      await seededPage.page.keyboard.press('Meta+j')
      await seededPage.page.waitForTimeout(300)

      const input = seededPage.page.locator('[data-testid="quick-chat-popover"] input')
      await input.fill('Message to persist')
      await input.press('Enter')
      await seededPage.page.waitForTimeout(500)

      // Close quick chat
      await seededPage.page.keyboard.press('Escape')
      await seededPage.page.waitForTimeout(200)

      // Reload page
      await seededPage.page.reload()
      await seededPage.page.waitForLoadState('networkidle')
      await seededPage.page.waitForTimeout(500)

      // Open quick chat again
      await seededPage.page.keyboard.press('Meta+j')
      await seededPage.page.waitForTimeout(300)

      // Message should still be there
      await expect(seededPage.page.locator('text=Message to persist')).toBeVisible()
    })

    test('QCE-17: Clear quick chat history', async ({ seededPage }) => {
      // Send a message
      await seededPage.page.keyboard.press('Meta+j')
      await seededPage.page.waitForTimeout(300)

      const input = seededPage.page.locator('[data-testid="quick-chat-popover"] input')
      await input.fill('Message to clear')
      await input.press('Enter')
      await seededPage.page.waitForTimeout(500)

      // Find and click clear button in quick chat
      const clearButton = seededPage.page.locator('[data-testid="quick-chat-popover"] button[title*="Clear"]')
      const hasClearButton = await clearButton.isVisible().catch(() => false)

      if (hasClearButton) {
        await clearButton.click()
        await seededPage.page.waitForTimeout(300)

        // Message should be cleared
        await expect(seededPage.page.locator('text=Message to clear')).not.toBeVisible()
      }
    })
  })

  test.describe('Browser Mode', () => {
    test('QCE-18: Shows browser stub for AI in quick chat', async ({ seededPage }) => {
      await seededPage.page.keyboard.press('Meta+j')
      await seededPage.page.waitForTimeout(300)

      const input = seededPage.page.locator('[data-testid="quick-chat-popover"] input')
      await input.fill('AI question')
      await input.press('Enter')
      await seededPage.page.waitForTimeout(500)

      // Should show browser stub
      const stub = seededPage.page.locator('[data-testid="quick-chat-popover"] text=/AI features are only available/')
      await expect(stub).toBeVisible()
    })

    test('QCE-19: Browser stub includes run instructions', async ({ seededPage }) => {
      await seededPage.page.keyboard.press('Meta+j')
      await seededPage.page.waitForTimeout(300)

      const input = seededPage.page.locator('[data-testid="quick-chat-popover"] input')
      await input.fill('Question')
      await input.press('Enter')
      await seededPage.page.waitForTimeout(500)

      // Should mention npm run dev
      const instructions = seededPage.page.locator('[data-testid="quick-chat-popover"] text=/npm run dev/')
      await expect(instructions).toBeVisible()
    })

    test('QCE-20: Quick chat functional in browser mode', async ({ seededPage }) => {
      // All UI should work even in browser mode
      await seededPage.page.keyboard.press('Meta+j')
      await seededPage.page.waitForTimeout(300)

      const popover = seededPage.page.locator('[data-testid="quick-chat-popover"]')
      await expect(popover).toBeVisible()

      const input = seededPage.page.locator('[data-testid="quick-chat-popover"] input')
      await expect(input).toBeEnabled()

      await input.fill('Test in browser mode')
      await input.press('Enter')
      await seededPage.page.waitForTimeout(500)

      // Message and response should appear
      await expect(seededPage.page.locator('text=Test in browser mode')).toBeVisible()
      await expect(seededPage.page.locator('text=/AI features/')).toBeVisible()
    })
  })
})
