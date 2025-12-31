import { test, expect, testData } from '../fixtures'

/**
 * Chat History Persistence Tests (E2E)
 *
 * Tests for chat message persistence across app restarts.
 * Validates Migration 009 (chat_sessions and chat_messages tables)
 * and ClaudeChatPanel integration.
 *
 * Tests: CHP-01 to CHP-12
 */

test.describe('Chat History Persistence', () => {
  test.beforeEach(async ({ seededPage }) => {
    await seededPage.goto()
    // Wait for app to fully load
    await seededPage.page.waitForTimeout(500)
  })

  test.describe('Session Creation', () => {
    test('CHP-01: Creates session when opening Claude tab with note', async ({ seededPage }) => {
      // Open a test note
      const testNote = seededPage.page.locator('button:has-text("Test Note One")').first()
      await testNote.click()
      await seededPage.page.waitForTimeout(300)

      // Open Claude tab
      const claudeTab = seededPage.page.locator('[data-testid="claude-tab"]')
      await claudeTab.click()
      await seededPage.page.waitForTimeout(300)

      // Panel should be visible
      const claudePanel = seededPage.page.locator('[data-testid="claude-chat-panel"]')
      await expect(claudePanel).toBeVisible()

      // Should show context of current note
      const contextText = seededPage.page.locator('text=Context: Test Note One')
      await expect(contextText).toBeVisible()
    })

    test('CHP-02: No session created without note context', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(300)

      // Open Claude tab without opening a note
      const claudeTab = basePage.page.locator('[data-testid="claude-tab"]')
      await claudeTab.click()
      await basePage.page.waitForTimeout(300)

      // Panel should be visible but no context shown
      const claudePanel = basePage.page.locator('[data-testid="claude-chat-panel"]')
      await expect(claudePanel).toBeVisible()

      // Should not show context message
      const contextText = basePage.page.locator('text=/Context:/')
      await expect(contextText).not.toBeVisible()
    })
  })

  test.describe('Message Persistence', () => {
    test('CHP-03: Sent message persists after reload', async ({ seededPage }) => {
      // Open note and Claude tab
      const testNote = seededPage.page.locator('button:has-text("Test Note One")').first()
      await testNote.click()
      await seededPage.page.waitForTimeout(300)

      const claudeTab = seededPage.page.locator('[data-testid="claude-tab"]')
      await claudeTab.click()
      await seededPage.page.waitForTimeout(300)

      // Type and send a message
      const input = seededPage.page.locator('[data-testid="chat-input"]')
      await input.fill('What is this note about?')
      await seededPage.page.waitForTimeout(200)

      const sendButton = seededPage.page.locator('[data-testid="send-button"]')
      await sendButton.click()
      await seededPage.page.waitForTimeout(500)

      // Message should appear in chat
      const userMessage = seededPage.page.locator('text=What is this note about?')
      await expect(userMessage).toBeVisible()

      // Wait for potential AI response (will show browser stub)
      await seededPage.page.waitForTimeout(500)

      // Reload the page
      await seededPage.page.reload()
      await seededPage.page.waitForLoadState('networkidle')
      await seededPage.page.waitForTimeout(500)

      // Open same note again
      const testNoteAfterReload = seededPage.page.locator('button:has-text("Test Note One")').first()
      await testNoteAfterReload.click()
      await seededPage.page.waitForTimeout(300)

      // Open Claude tab
      const claudeTabAfterReload = seededPage.page.locator('[data-testid="claude-tab"]')
      await claudeTabAfterReload.click()
      await seededPage.page.waitForTimeout(500)

      // Original message should still be there
      const persistedMessage = seededPage.page.locator('text=What is this note about?')
      await expect(persistedMessage).toBeVisible()
    })

    test('CHP-04: Multiple messages persist in order', async ({ seededPage }) => {
      // Open note and Claude tab
      const testNote = seededPage.page.locator('button:has-text("Test Note One")').first()
      await testNote.click()
      await seededPage.page.waitForTimeout(300)

      const claudeTab = seededPage.page.locator('[data-testid="claude-tab"]')
      await claudeTab.click()
      await seededPage.page.waitForTimeout(300)

      // Send first message
      const input = seededPage.page.locator('[data-testid="chat-input"]')
      await input.fill('First question')
      const sendButton = seededPage.page.locator('[data-testid="send-button"]')
      await sendButton.click()
      await seededPage.page.waitForTimeout(500)

      // Send second message
      await input.fill('Second question')
      await sendButton.click()
      await seededPage.page.waitForTimeout(500)

      // Send third message
      await input.fill('Third question')
      await sendButton.click()
      await seededPage.page.waitForTimeout(500)

      // All messages should be visible
      await expect(seededPage.page.locator('text=First question')).toBeVisible()
      await expect(seededPage.page.locator('text=Second question')).toBeVisible()
      await expect(seededPage.page.locator('text=Third question')).toBeVisible()

      // Reload and verify order is maintained
      await seededPage.page.reload()
      await seededPage.page.waitForLoadState('networkidle')
      await seededPage.page.waitForTimeout(500)

      const testNoteAfterReload = seededPage.page.locator('button:has-text("Test Note One")').first()
      await testNoteAfterReload.click()
      await seededPage.page.waitForTimeout(300)

      const claudeTabAfterReload = seededPage.page.locator('[data-testid="claude-tab"]')
      await claudeTabAfterReload.click()
      await seededPage.page.waitForTimeout(500)

      // Verify messages are still in order
      const messages = seededPage.page.locator('[data-testid="messages-container"] > div')
      const messageTexts = await messages.allTextContents()

      // Filter for our test messages (ignore browser stub messages)
      const hasFirstBeforeSecond = messageTexts.join(' ').indexOf('First question') <
                                     messageTexts.join(' ').indexOf('Second question')
      const hasSecondBeforeThird = messageTexts.join(' ').indexOf('Second question') <
                                      messageTexts.join(' ').indexOf('Third question')

      expect(hasFirstBeforeSecond).toBe(true)
      expect(hasSecondBeforeThird).toBe(true)
    })
  })

  test.describe('Session Switching', () => {
    test('CHP-05: Different notes have different chat sessions', async ({ seededPage }) => {
      // Open first note and send message
      const testNote1 = seededPage.page.locator('button:has-text("Test Note One")').first()
      await testNote1.click()
      await seededPage.page.waitForTimeout(300)

      let claudeTab = seededPage.page.locator('[data-testid="claude-tab"]')
      await claudeTab.click()
      await seededPage.page.waitForTimeout(300)

      const input = seededPage.page.locator('[data-testid="chat-input"]')
      await input.fill('Message for note one')
      const sendButton = seededPage.page.locator('[data-testid="send-button"]')
      await sendButton.click()
      await seededPage.page.waitForTimeout(500)

      // Switch to second note
      const testNote2 = seededPage.page.locator('button:has-text("Test Note Two")').first()
      await testNote2.click()
      await seededPage.page.waitForTimeout(500)

      // Claude tab should show empty state (different session)
      const emptyState = seededPage.page.locator('text=Ask Claude anything about your writing.')
      await expect(emptyState).toBeVisible()

      // First message should NOT be visible
      const firstMessage = seededPage.page.locator('text=Message for note one')
      await expect(firstMessage).not.toBeVisible()

      // Send message in second note
      await input.fill('Message for note two')
      await sendButton.click()
      await seededPage.page.waitForTimeout(500)

      // Switch back to first note
      await testNote1.click()
      await seededPage.page.waitForTimeout(500)

      // Should show original message from first note
      await expect(seededPage.page.locator('text=Message for note one')).toBeVisible()

      // Should NOT show message from second note
      const secondMessage = seededPage.page.locator('text=Message for note two')
      await expect(secondMessage).not.toBeVisible()
    })

    test('CHP-06: Session persists when switching notes and returning', async ({ seededPage }) => {
      // Open first note, send message
      const testNote1 = seededPage.page.locator('button:has-text("Test Note One")').first()
      await testNote1.click()
      await seededPage.page.waitForTimeout(300)

      const claudeTab = seededPage.page.locator('[data-testid="claude-tab"]')
      await claudeTab.click()
      await seededPage.page.waitForTimeout(300)

      const input = seededPage.page.locator('[data-testid="chat-input"]')
      await input.fill('First note message')
      const sendButton = seededPage.page.locator('[data-testid="send-button"]')
      await sendButton.click()
      await seededPage.page.waitForTimeout(500)

      // Switch to second note
      const testNote2 = seededPage.page.locator('button:has-text("Test Note Two")').first()
      await testNote2.click()
      await seededPage.page.waitForTimeout(300)

      // Switch to a different tab temporarily
      const statsTab = seededPage.page.locator('button:has-text("Stats")')
      await statsTab.click()
      await seededPage.page.waitForTimeout(300)

      // Return to first note
      await testNote1.click()
      await seededPage.page.waitForTimeout(300)

      // Return to Claude tab
      await claudeTab.click()
      await seededPage.page.waitForTimeout(300)

      // Original message should still be there
      await expect(seededPage.page.locator('text=First note message')).toBeVisible()
    })
  })

  test.describe('Quick Actions', () => {
    test('CHP-07: Quick action messages persist', async ({ seededPage }) => {
      // Open note and Claude tab
      const testNote = seededPage.page.locator('button:has-text("Test Note One")').first()
      await testNote.click()
      await seededPage.page.waitForTimeout(300)

      const claudeTab = seededPage.page.locator('[data-testid="claude-tab"]')
      await claudeTab.click()
      await seededPage.page.waitForTimeout(300)

      // Click Improve quick action
      const improveBtn = seededPage.page.locator('button:has-text("Improve")')
      await expect(improveBtn).toBeVisible()
      await improveBtn.click()
      await seededPage.page.waitForTimeout(500)

      // Quick action prompt should appear as message
      const quickActionMessage = seededPage.page.locator('text=Improve clarity and flow')
      await expect(quickActionMessage).toBeVisible()

      // Reload and verify persistence
      await seededPage.page.reload()
      await seededPage.page.waitForLoadState('networkidle')
      await seededPage.page.waitForTimeout(500)

      await testNote.click()
      await seededPage.page.waitForTimeout(300)
      await claudeTab.click()
      await seededPage.page.waitForTimeout(500)

      // Quick action message should still be there
      await expect(seededPage.page.locator('text=Improve clarity and flow')).toBeVisible()
    })

    test('CHP-08: All quick actions are available with note context', async ({ seededPage }) => {
      // Open note and Claude tab
      const testNote = seededPage.page.locator('button:has-text("Test Note One")').first()
      await testNote.click()
      await seededPage.page.waitForTimeout(300)

      const claudeTab = seededPage.page.locator('[data-testid="claude-tab"]')
      await claudeTab.click()
      await seededPage.page.waitForTimeout(300)

      // Verify all 5 quick action buttons exist
      const quickActions = seededPage.page.locator('[data-testid="quick-actions"]')
      await expect(quickActions).toBeVisible()

      await expect(seededPage.page.locator('button:has-text("Improve")')).toBeVisible()
      await expect(seededPage.page.locator('button:has-text("Expand")')).toBeVisible()
      await expect(seededPage.page.locator('button:has-text("Summarize")')).toBeVisible()
      await expect(seededPage.page.locator('button:has-text("Explain")')).toBeVisible()
      await expect(seededPage.page.locator('button:has-text("Research")')).toBeVisible()
    })
  })

  test.describe('Clear Chat', () => {
    test('CHP-09: Clear chat removes messages from UI and database', async ({ seededPage }) => {
      // Open note and send message
      const testNote = seededPage.page.locator('button:has-text("Test Note One")').first()
      await testNote.click()
      await seededPage.page.waitForTimeout(300)

      const claudeTab = seededPage.page.locator('[data-testid="claude-tab"]')
      await claudeTab.click()
      await seededPage.page.waitForTimeout(300)

      const input = seededPage.page.locator('[data-testid="chat-input"]')
      await input.fill('Test message to clear')
      const sendButton = seededPage.page.locator('[data-testid="send-button"]')
      await sendButton.click()
      await seededPage.page.waitForTimeout(500)

      // Verify message exists
      await expect(seededPage.page.locator('text=Test message to clear')).toBeVisible()

      // Click clear chat button
      const clearButton = seededPage.page.locator('[data-testid="clear-chat-button"]')
      await clearButton.click()
      await seededPage.page.waitForTimeout(300)

      // Message should be gone
      await expect(seededPage.page.locator('text=Test message to clear')).not.toBeVisible()

      // Empty state should be visible
      const emptyState = seededPage.page.locator('text=Ask Claude anything about your writing.')
      await expect(emptyState).toBeVisible()

      // Reload to verify it was cleared from database
      await seededPage.page.reload()
      await seededPage.page.waitForLoadState('networkidle')
      await seededPage.page.waitForTimeout(500)

      await testNote.click()
      await seededPage.page.waitForTimeout(300)
      await claudeTab.click()
      await seededPage.page.waitForTimeout(300)

      // Message should still not be there
      await expect(seededPage.page.locator('text=Test message to clear')).not.toBeVisible()
      await expect(emptyState).toBeVisible()
    })

    test('CHP-10: Clear chat in one note does not affect other notes', async ({ seededPage }) => {
      // Send message in first note
      const testNote1 = seededPage.page.locator('button:has-text("Test Note One")').first()
      await testNote1.click()
      await seededPage.page.waitForTimeout(300)

      const claudeTab = seededPage.page.locator('[data-testid="claude-tab"]')
      await claudeTab.click()
      await seededPage.page.waitForTimeout(300)

      const input = seededPage.page.locator('[data-testid="chat-input"]')
      await input.fill('Message in note one')
      const sendButton = seededPage.page.locator('[data-testid="send-button"]')
      await sendButton.click()
      await seededPage.page.waitForTimeout(500)

      // Switch to second note and send message
      const testNote2 = seededPage.page.locator('button:has-text("Test Note Two")').first()
      await testNote2.click()
      await seededPage.page.waitForTimeout(500)

      await input.fill('Message in note two')
      await sendButton.click()
      await seededPage.page.waitForTimeout(500)

      // Clear chat in second note
      const clearButton = seededPage.page.locator('[data-testid="clear-chat-button"]')
      await clearButton.click()
      await seededPage.page.waitForTimeout(300)

      // Second note should be empty
      const emptyState = seededPage.page.locator('text=Ask Claude anything about your writing.')
      await expect(emptyState).toBeVisible()

      // Switch back to first note
      await testNote1.click()
      await seededPage.page.waitForTimeout(500)

      // First note message should still be there
      await expect(seededPage.page.locator('text=Message in note one')).toBeVisible()
    })
  })

  test.describe('Error Handling', () => {
    test('CHP-11: Shows empty state if session fails to load', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(300)

      // Open Claude tab without a note (simulates potential error state)
      const claudeTab = basePage.page.locator('[data-testid="claude-tab"]')
      await claudeTab.click()
      await basePage.page.waitForTimeout(300)

      // Should show empty state gracefully
      const emptyState = basePage.page.locator('text=Ask Claude anything about your writing.')
      await expect(emptyState).toBeVisible()

      // Input should still be functional
      const input = basePage.page.locator('[data-testid="chat-input"]')
      await expect(input).toBeEnabled()
    })

    test('CHP-12: UI remains functional after message save fails', async ({ seededPage }) => {
      // Open note and Claude tab
      const testNote = seededPage.page.locator('button:has-text("Test Note One")').first()
      await testNote.click()
      await seededPage.page.waitForTimeout(300)

      const claudeTab = seededPage.page.locator('[data-testid="claude-tab"]')
      await claudeTab.click()
      await seededPage.page.waitForTimeout(300)

      // Send a message (may fail to save in browser mode, but UI should work)
      const input = seededPage.page.locator('[data-testid="chat-input"]')
      await input.fill('Test message')
      const sendButton = seededPage.page.locator('[data-testid="send-button"]')
      await sendButton.click()
      await seededPage.page.waitForTimeout(500)

      // Message should appear in UI even if save fails
      await expect(seededPage.page.locator('text=Test message')).toBeVisible()

      // Input should still be functional for next message
      await expect(input).toBeEnabled()
      await expect(input).toHaveValue('')
    })
  })
})
