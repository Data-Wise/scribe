import { test, expect } from '../fixtures'

/**
 * Quick Chat Tests (P2)
 *
 * Tests for the Quick Chat popover in the status bar.
 *
 * Tests: QC-01 to QC-08
 */

test.describe('Quick Chat', () => {
  test.beforeEach(async ({ basePage }) => {
    await basePage.goto()
    // Open an existing note so editor is visible
    const recentNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
    await recentNote.click()
    await basePage.page.waitForTimeout(500)
  })

  test.describe('Button', () => {
    test('QC-01: Quick Chat button visible in status bar', async ({ basePage }) => {
      const quickChatButton = basePage.page.locator('[data-testid="quick-chat-button"]')
      await expect(quickChatButton).toBeVisible()
    })

    test('QC-02: Quick Chat button has correct title', async ({ basePage }) => {
      const quickChatButton = basePage.page.locator('[data-testid="quick-chat-button"]')
      await expect(quickChatButton).toHaveAttribute('title', 'Quick Chat (⌘J)')
    })

    test('QC-03: Click opens popover', async ({ basePage }) => {
      const quickChatButton = basePage.page.locator('[data-testid="quick-chat-button"]')
      await quickChatButton.click()
      await basePage.page.waitForTimeout(200)

      const popover = basePage.page.locator('[data-testid="quick-chat-popover"]')
      await expect(popover).toBeVisible()
    })

    test('QC-04: Click toggles popover closed', async ({ basePage }) => {
      const quickChatButton = basePage.page.locator('[data-testid="quick-chat-button"]')

      // Open
      await quickChatButton.click()
      await basePage.page.waitForTimeout(200)
      let popover = basePage.page.locator('[data-testid="quick-chat-popover"]')
      await expect(popover).toBeVisible()

      // Close
      await quickChatButton.click()
      await basePage.page.waitForTimeout(200)
      popover = basePage.page.locator('[data-testid="quick-chat-popover"]')
      await expect(popover).not.toBeVisible()
    })
  })

  test.describe('Keyboard Shortcuts', () => {
    test('QC-05: ⌘J opens Quick Chat popover', async ({ basePage }) => {
      await basePage.page.keyboard.press('Meta+j')
      await basePage.page.waitForTimeout(200)

      const popover = basePage.page.locator('[data-testid="quick-chat-popover"]')
      await expect(popover).toBeVisible()
    })

    test('QC-06: Escape closes Quick Chat popover', async ({ basePage }) => {
      // Open with button
      const quickChatButton = basePage.page.locator('[data-testid="quick-chat-button"]')
      await quickChatButton.click()
      await basePage.page.waitForTimeout(200)

      // Close with Escape
      await basePage.page.keyboard.press('Escape')
      await basePage.page.waitForTimeout(200)

      const popover = basePage.page.locator('[data-testid="quick-chat-popover"]')
      await expect(popover).not.toBeVisible()
    })
  })

  test.describe('Popover Content', () => {
    test('QC-07: Popover shows Quick Chat header', async ({ basePage }) => {
      const quickChatButton = basePage.page.locator('[data-testid="quick-chat-button"]')
      await quickChatButton.click()
      await basePage.page.waitForTimeout(200)

      const popover = basePage.page.locator('[data-testid="quick-chat-popover"]')
      await expect(popover.locator('text=Quick Chat')).toBeVisible()
    })

    test('QC-08: Input shows browser mode message', async ({ basePage }) => {
      const quickChatButton = basePage.page.locator('[data-testid="quick-chat-button"]')
      await quickChatButton.click()
      await basePage.page.waitForTimeout(200)

      // In E2E tests running in browser mode, should show unavailable message
      const input = basePage.page.locator('[data-testid="quick-chat-popover"] input')
      await expect(input).toHaveAttribute('placeholder', 'AI unavailable in browser mode')
      await expect(input).toBeDisabled()
    })
  })
})
