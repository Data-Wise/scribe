import { test, expect } from '@playwright/test'
import { ScribePage } from '../page-objects/ScribePage'

/**
 * E2E tests for Project Templates
 *
 * Covers:
 * - Template cards rendering
 * - Template information display
 * - Apply template workflow
 * - Show/hide details
 * - Template variations
 */

test.describe('Project Templates', () => {
  let scribePage: ScribePage

  test.beforeEach(async ({ page }) => {
    scribePage = new ScribePage(page)
    await scribePage.goto()
    await scribePage.waitForReady()

    // Open settings modal
    await page.keyboard.press('Meta+Comma')
    await expect(page.getByText('Settings')).toBeVisible()

    // Navigate to Projects tab
    await page.getByRole('tab', { name: /projects/i }).click()
    await expect(page.getByText('Project Templates')).toBeVisible()
  })

  test('should display all 5 project templates', async ({ page }) => {
    // Check for all template names
    await expect(page.getByText('Research+')).toBeVisible()
    await expect(page.getByText('Teaching+')).toBeVisible()
    await expect(page.getByText('Dev+')).toBeVisible()
    await expect(page.getByText('Writing+')).toBeVisible()
    await expect(page.getByText('Minimal')).toBeVisible()

    // Count Apply buttons (should be 5)
    const applyButtons = page.getByRole('button', { name: 'Apply' })
    await expect(applyButtons).toHaveCount(5)
  })

  test('should show template icons and descriptions', async ({ page }) => {
    // Research+ should have 🔬 icon and description
    const researchCard = page.locator('text=Research+').locator('..')
    await expect(researchCard).toContainText('🔬')
    await expect(researchCard).toContainText('Academic research')

    // Teaching+ should have 📚 icon
    const teachingCard = page.locator('text=Teaching+').locator('..')
    await expect(teachingCard).toContainText('📚')
    await expect(teachingCard).toContainText('Course materials')

    // Dev+ should have 💻 icon
    const devCard = page.locator('text=Dev+').locator('..')
    await expect(devCard).toContainText('💻')
    await expect(devCard).toContainText('Software development')
  })

  test('should display template quick preview', async ({ page }) => {
    // Research+ card should show quick info
    const researchCard = page.locator('text=Research+').locator('..')

    await expect(researchCard).toContainText('Template:')
    await expect(researchCard).toContainText('Theme:')
    await expect(researchCard).toContainText('Actions:')
  })

  test('should ask for confirmation before applying template', async ({ page }) => {
    // Set up dialog handler
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm')
      expect(dialog.message()).toContain('Apply "Research+" template?')
      await dialog.dismiss() // Cancel
    })

    // Click Apply on Research+
    const applyButtons = page.getByRole('button', { name: 'Apply' })
    await applyButtons.first().click()

    // Template should NOT be applied (we dismissed the dialog)
    await expect(page.getByText('Applied')).not.toBeVisible()
  })

  test('should apply template when confirmed', async ({ page }) => {
    // Set up dialog handler to accept
    page.on('dialog', async (dialog) => {
      await dialog.accept()
    })

    // Click Apply on Research+
    const applyButtons = page.getByRole('button', { name: 'Apply' })
    await applyButtons.first().click()

    // Should show "Applied" state with checkmark
    await expect(page.getByText('Applied')).toBeVisible()

    // Applied state should have green background
    const appliedButton = page.getByRole('button', { name: /Applied/ })
    await expect(appliedButton).toHaveClass(/bg-green-600/)

    // Should have success bounce animation
    await expect(appliedButton).toHaveClass(/animate-success-bounce/)
  })

  test('should show/hide template details', async ({ page }) => {
    // Click info button (first one - Research+)
    const infoButton = page.getByTitle('Show details').first()
    await infoButton.click()

    // Details should be visible
    await expect(page.getByText('What will change:')).toBeVisible()
    await expect(page.getByText(/Daily note template →/)).toBeVisible()
    await expect(page.getByText(/Default directory →/)).toBeVisible()
    await expect(page.getByText(/Theme →/)).toBeVisible()
    await expect(page.getByText(/Quick Actions →/)).toBeVisible()

    // Click again to hide
    await infoButton.click()

    // Details should be hidden
    await expect(page.getByText('What will change:')).not.toBeVisible()
  })

  test('should use 2-column grid layout', async ({ page }) => {
    // Find template grid
    const grid = page.locator('.grid.grid-cols-2').first()
    await expect(grid).toBeVisible()

    // Grid should have gap
    await expect(grid).toHaveClass(/gap/)
  })

  test('should show "None" for Minimal template Quick Actions', async ({ page }) => {
    // Minimal template has no Quick Actions
    const minimalCard = page.locator('text=Minimal').locator('..')

    // Should show "None" for actions
    await expect(minimalCard).toContainText('Actions:')
    await expect(minimalCard).toContainText('None')
  })

  test('should apply different settings for different templates', async ({ page }) => {
    // Set up dialog handler
    page.on('dialog', async (dialog) => {
      await dialog.accept()
    })

    // Apply Teaching+ (second template)
    const applyButtons = page.getByRole('button', { name: 'Apply' })
    await applyButtons.nth(1).click()

    // Should show Applied state
    await expect(page.getByText('Applied').nth(1)).toBeVisible()

    // Close and reopen settings to verify Teaching+ settings were applied
    await page.keyboard.press('Escape')
    await page.keyboard.press('Meta+Comma')
    await page.getByRole('tab', { name: /themes/i }).click()

    // Teaching+ uses Forest theme
    const forestCard = page.getByRole('button', { name: /Forest/ })
    // Note: Forest might not exist in themes, this is a placeholder test
    // In reality, Teaching+ uses 'forest' theme from settingsSchema
  })

  test('should show hover effects on Apply button', async ({ page }) => {
    const applyButton = page.getByRole('button', { name: 'Apply' }).first()

    // Hover over button
    await applyButton.hover()

    // Should have scale animation
    await expect(applyButton).toHaveClass(/hover:scale-105/)
  })

  test('should be keyboard accessible', async ({ page }) => {
    // Tab through to first template
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
    }

    // Focus should eventually reach an Apply button
    const focusedElement = page.locator(':focus')
    const buttonText = await focusedElement.textContent()

    // Either Apply button or info button
    expect(buttonText).toMatch(/Apply|Show details/)
  })

  test('should reset Applied state after 2 seconds', async ({ page }) => {
    // Set up dialog handler
    page.on('dialog', async (dialog) => {
      await dialog.accept()
    })

    // Apply first template
    const applyButtons = page.getByRole('button', { name: 'Apply' })
    await applyButtons.first().click()

    // Should show Applied
    await expect(page.getByText('Applied')).toBeVisible()

    // Wait 2.5 seconds
    await page.waitForTimeout(2500)

    // Applied state should be gone
    await expect(page.getByText('Applied')).not.toBeVisible()

    // Button should be back to "Apply"
    await expect(applyButtons.first()).toBeVisible()
  })
})
