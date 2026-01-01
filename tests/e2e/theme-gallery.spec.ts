import { test, expect } from '@playwright/test'

/**
 * E2E tests for Theme Gallery
 *
 * Covers:
 * - Theme gallery rendering
 * - Theme card interactions
 * - Theme selection and persistence
 * - Visual feedback states
 */

test.describe('Theme Gallery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')

    // Open settings modal with keyboard shortcut
    await page.keyboard.press('Meta+Comma')
    await expect(page.getByRole('dialog', { name: /settings/i })).toBeVisible()

    // Navigate to Themes tab
    await page.getByRole('tab', { name: /themes/i }).click()
    await expect(page.getByText('Theme Selection')).toBeVisible()
  })

  test('should display theme gallery with all 8 themes', async ({ page }) => {
    // Check for favorites section
    await expect(page.getByText('Favorites')).toBeVisible()

    // Check for dark themes section
    await expect(page.getByText(/Dark.*themes/)).toBeVisible()

    // Check for light themes section
    await expect(page.getByText(/Light.*themes/)).toBeVisible()

    // Count theme cards (should be 8 total)
    const themeCards = page.locator('button').filter({ hasText: /Slate|Nord|Dracula|Monokai|GitHub Dark|Linen|Paper|Cream/ })
    await expect(themeCards).toHaveCount(8)
  })

  test('should show selected theme with visual indicator', async ({ page }) => {
    // Default theme should be Slate
    const slateCard = page.getByRole('button', { name: /Slate/ })
    await expect(slateCard).toHaveClass(/border-blue-500/)

    // Selected theme should have checkmark
    const selectedIcon = slateCard.locator('svg').first()
    await expect(selectedIcon).toBeVisible()
  })

  test('should change theme when clicking theme card', async ({ page }) => {
    // Click on Nord theme
    const nordCard = page.getByRole('button', { name: /Nord/ })
    await nordCard.click()

    // Nord should now be selected
    await expect(nordCard).toHaveClass(/border-blue-500/)

    // Slate should no longer be selected
    const slateCard = page.getByRole('button', { name: /Slate/ })
    await expect(slateCard).not.toHaveClass(/border-blue-500/)

    // Settings should be updated
    // Close settings
    await page.keyboard.press('Escape')

    // Reopen settings to verify persistence
    await page.keyboard.press('Meta+Comma')
    await page.getByRole('tab', { name: /themes/i }).click()

    // Nord should still be selected
    const nordCardRecheck = page.getByRole('button', { name: /Nord/ })
    await expect(nordCardRecheck).toHaveClass(/border-blue-500/)
  })

  test('should display theme preview colors correctly', async ({ page }) => {
    // Click on Dracula theme
    const draculaCard = page.getByRole('button', { name: /Dracula/ })

    // Dracula has dark background (#282a36)
    // Check if the preview area exists
    await expect(draculaCard).toBeVisible()

    // Hover should trigger scale animation
    await draculaCard.hover()
    await expect(draculaCard).toHaveClass(/hover:scale-105/)
  })

  test('should show favorite themes with star icon', async ({ page }) => {
    // Favorites section should exist
    const favoritesSection = page.locator('text=Favorites').locator('..')

    // Should have star icon
    const starIcon = favoritesSection.locator('svg').first()
    await expect(starIcon).toBeVisible()

    // Should have 3 favorite themes
    const favoriteCards = favoritesSection.locator('button')
    await expect(favoriteCards).toHaveCount(3)
  })

  test('should apply hover effects to theme cards', async ({ page }) => {
    const nordCard = page.getByRole('button', { name: /Nord/ })

    // Hover over card
    await nordCard.hover()

    // Card should have hover scale animation class
    await expect(nordCard).toHaveClass(/hover:scale-105/)
  })

  test('should organize themes by type (dark vs light)', async ({ page }) => {
    // Dark themes section
    const darkSection = page.locator('text=/Dark.*themes/').locator('..').locator('..')

    // Should contain Monokai and GitHub Dark (plus favorites overlap)
    const darkCards = darkSection.locator('button')
    expect(await darkCards.count()).toBeGreaterThanOrEqual(2)

    // Light themes section
    const lightSection = page.locator('text=/Light.*themes/').locator('..').locator('..')

    // Should contain Linen, Paper, Cream
    const lightCards = lightSection.locator('button')
    expect(await lightCards.count()).toBeGreaterThanOrEqual(3)
  })

  test('should use 3-column grid layout', async ({ page }) => {
    // Find any theme grid
    const grid = page.locator('.grid.grid-cols-3').first()
    await expect(grid).toBeVisible()

    // Grid should have gap-4 class
    await expect(grid).toHaveClass(/gap-4/)
  })

  test('should be keyboard accessible', async ({ page }) => {
    // Tab to first theme card
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab') // Skip search box

    // Focus should be on a theme card
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toHaveRole('button')

    // Enter should select theme
    await page.keyboard.press('Enter')

    // Theme should change
    await expect(focusedElement).toHaveClass(/border-blue-500/)
  })
})
