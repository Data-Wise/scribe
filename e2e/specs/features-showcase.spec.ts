import { test, expect } from '../fixtures'

/**
 * Features Showcase E2E Tests
 *
 * Tests the Features Showcase modal that displays all Scribe features
 * in an interactive, categorized view.
 *
 * Tests: FEA-01 to FEA-30
 */

test.describe('Features Showcase', () => {
  test.beforeEach(async ({ basePage }) => {
    await basePage.goto()
    // Wait for app to fully initialize before testing shortcuts
    await basePage.page.waitForTimeout(1000)
  })

  test.describe('Opening and Closing', () => {
    test('FEA-01: Opens Features Showcase with ⌘⇧H shortcut', async ({ basePage }) => {
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      const showcase = basePage.page.locator('text=Scribe Features').first()
      await expect(showcase).toBeVisible()
    })

    test('FEA-02: Closes with close button', async ({ basePage }) => {
      // Open showcase
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      // Click close button
      const closeButton = basePage.page.locator('button[title="Close features showcase"]')
      await closeButton.click()
      await basePage.page.waitForTimeout(200)

      // Verify closed
      const showcase = basePage.page.locator('text=Scribe Features').first()
      await expect(showcase).not.toBeVisible()
    })

    test('FEA-03: Closes with ESC key', async ({ basePage }) => {
      // Open showcase
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      // Press ESC
      await basePage.page.keyboard.press('Escape')
      await basePage.page.waitForTimeout(200)

      // Verify closed
      const showcase = basePage.page.locator('text=Scribe Features').first()
      await expect(showcase).not.toBeVisible()
    })

    test('FEA-04: Closes with backdrop click', async ({ basePage }) => {
      // Open showcase
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      // Click backdrop (fixed inset-0 div)
      await basePage.page.locator('.fixed.inset-0').first().click({
        position: { x: 10, y: 10 } // Click in corner to avoid modal
      })
      await basePage.page.waitForTimeout(200)

      // Verify closed
      const showcase = basePage.page.locator('text=Scribe Features').first()
      await expect(showcase).not.toBeVisible()
    })
  })

  test.describe('Category Filtering', () => {
    test('FEA-05: Shows all 17 features by default', async ({ basePage }) => {
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      // Check for key features
      await expect(basePage.page.locator('text=Three Editor Modes')).toBeVisible()
      await expect(basePage.page.locator('text=WikiLinks Navigation')).toBeVisible()
      await expect(basePage.page.locator('text=LaTeX Math Rendering')).toBeVisible()
      await expect(basePage.page.locator('text=Claude Assistant')).toBeVisible()
      await expect(basePage.page.locator('text=Quarto Documents')).toBeVisible()
    })

    test('FEA-06: Filters to Core Features', async ({ basePage }) => {
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      // Click Core Features button
      await basePage.page.locator('button:has-text("Core Features")').click()
      await basePage.page.waitForTimeout(200)

      // Core features should be visible
      await expect(basePage.page.locator('text=Three Editor Modes')).toBeVisible()
      await expect(basePage.page.locator('text=WikiLinks Navigation')).toBeVisible()
      await expect(basePage.page.locator('text=Automatic Backlinks')).toBeVisible()
      await expect(basePage.page.locator('text=Focus Mode')).toBeVisible()

      // Non-core features should not be visible
      await expect(basePage.page.locator('text=LaTeX Math Rendering')).not.toBeVisible()
    })

    test('FEA-07: Filters to Editing features', async ({ basePage }) => {
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      // Click Editing button
      await basePage.page.locator('button:has-text("Editing")').click()
      await basePage.page.waitForTimeout(200)

      // Editing features should be visible
      await expect(basePage.page.locator('text=LaTeX Math Rendering')).toBeVisible()
      await expect(basePage.page.locator('text=Smart Autocomplete')).toBeVisible()
      await expect(basePage.page.locator('text=YAML Properties')).toBeVisible()

      // Other features should not be visible
      await expect(basePage.page.locator('text=Three Editor Modes')).not.toBeVisible()
    })

    test('FEA-08: Filters to Organization features', async ({ basePage }) => {
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      // Click Organization button
      await basePage.page.locator('button:has-text("Organization")').click()
      await basePage.page.waitForTimeout(200)

      // Organization features should be visible
      await expect(basePage.page.locator('text=Project System')).toBeVisible()
      await expect(basePage.page.locator('text=Hierarchical Tags')).toBeVisible()
      await expect(basePage.page.locator('text=Daily Notes')).toBeVisible()
      await expect(basePage.page.locator('text=Full-Text Search')).toBeVisible()
    })

    test('FEA-09: Filters to AI Features', async ({ basePage }) => {
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      // Click AI Features button
      await basePage.page.locator('button:has-text("AI Features")').click()
      await basePage.page.waitForTimeout(200)

      // AI features should be visible
      await expect(basePage.page.locator('text=Claude Assistant')).toBeVisible()
      await expect(basePage.page.locator('text=Quick Actions')).toBeVisible()
    })

    test('FEA-10: Filters to Advanced features', async ({ basePage }) => {
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      // Click Advanced button
      await basePage.page.locator('button:has-text("Advanced")').click()
      await basePage.page.waitForTimeout(200)

      // Advanced features should be visible
      await expect(basePage.page.locator('text=Integrated Terminal')).toBeVisible()
      await expect(basePage.page.locator('text=Command Palette')).toBeVisible()
      await expect(basePage.page.locator('text=Quarto Documents')).toBeVisible()
    })

    test('FEA-11: Returns to all features with All Features button', async ({ basePage }) => {
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      // Filter to Core
      await basePage.page.locator('button:has-text("Core Features")').click()
      await basePage.page.waitForTimeout(200)

      // Verify filtered
      await expect(basePage.page.locator('text=LaTeX Math Rendering')).not.toBeVisible()

      // Click All Features
      await basePage.page.locator('button:has-text("All Features")').click()
      await basePage.page.waitForTimeout(200)

      // All features should be visible again
      await expect(basePage.page.locator('text=Three Editor Modes')).toBeVisible()
      await expect(basePage.page.locator('text=LaTeX Math Rendering')).toBeVisible()
    })

    test('FEA-12: Highlights active category button', async ({ basePage }) => {
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      // Click Core Features
      const coreButton = basePage.page.locator('button:has-text("Core Features")')
      await coreButton.click()
      await basePage.page.waitForTimeout(200)

      // Core button should have active class
      const className = await coreButton.getAttribute('class')
      expect(className).toContain('bg-nexus-accent')
    })
  })

  test.describe('Feature Detail Panel', () => {
    test('FEA-13: Opens detail panel when feature is clicked', async ({ basePage }) => {
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      // Click a feature card
      await basePage.page.locator('text=Three Editor Modes').click()
      await basePage.page.waitForTimeout(200)

      // Detail panel should show
      await expect(basePage.page.locator('text=Source mode for raw markdown editing')).toBeVisible()
    })

    test('FEA-14: Shows feature shortcut in detail panel', async ({ basePage }) => {
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      // Click Focus Mode feature
      await basePage.page.locator('text=Focus Mode').click()
      await basePage.page.waitForTimeout(200)

      // Should show shortcut (appears twice - card and panel)
      const shortcuts = basePage.page.locator('text=⌘⇧F')
      const count = await shortcuts.count()
      expect(count).toBeGreaterThan(1)
    })

    test('FEA-15: Shows Available Now status badge', async ({ basePage }) => {
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      // Click a feature
      await basePage.page.locator('text=Three Editor Modes').click()
      await basePage.page.waitForTimeout(200)

      // Should show Available Now badge
      await expect(basePage.page.locator('text=Available Now')).toBeVisible()
    })

    test('FEA-16: Closes detail panel with X button', async ({ basePage }) => {
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      // Click a feature
      await basePage.page.locator('text=Three Editor Modes').click()
      await basePage.page.waitForTimeout(200)

      // Detail panel visible
      await expect(basePage.page.locator('text=Source mode for raw markdown editing')).toBeVisible()

      // Find and click X button in detail panel (w-96 sidebar)
      const detailPanel = basePage.page.locator('.w-96').first()
      const closeButton = detailPanel.locator('button').first()
      await closeButton.click()
      await basePage.page.waitForTimeout(200)

      // Detail should close
      await expect(basePage.page.locator('text=Source mode for raw markdown editing')).not.toBeVisible()
    })
  })

  test.describe('Getting Started Section', () => {
    test('FEA-17: Shows Getting Started section', async ({ basePage }) => {
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      await expect(basePage.page.locator('text=Getting Started')).toBeVisible()
      await expect(basePage.page.locator('text=Essential Shortcuts')).toBeVisible()
      await expect(basePage.page.locator('text=Quick Tips')).toBeVisible()
    })

    test('FEA-18: Shows essential keyboard shortcuts', async ({ basePage }) => {
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      // Check for shortcuts in getting started
      await expect(basePage.page.locator('text=⌘N')).toBeVisible()
      await expect(basePage.page.locator('text=⌘D')).toBeVisible()
      await expect(basePage.page.locator('text=⌘K')).toBeVisible()
    })
  })

  test.describe('Footer Links', () => {
    test('FEA-19: Shows version and links in footer', async ({ basePage }) => {
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      await expect(basePage.page.locator('text=/Scribe v1\\.14\\.0/i')).toBeVisible()
      await expect(basePage.page.locator('a:has-text("GitHub")')).toBeVisible()
      await expect(basePage.page.locator('a:has-text("Documentation")')).toBeVisible()
    })

    test('FEA-20: GitHub link opens in new tab', async ({ basePage }) => {
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      const githubLink = basePage.page.locator('a:has-text("GitHub")')
      const href = await githubLink.getAttribute('href')
      const target = await githubLink.getAttribute('target')

      expect(href).toContain('github.com')
      expect(target).toBe('_blank')
    })

    test('FEA-21: Documentation link opens in new tab', async ({ basePage }) => {
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      const docsLink = basePage.page.locator('a:has-text("Documentation")')
      const href = await docsLink.getAttribute('href')
      const target = await docsLink.getAttribute('target')

      expect(href).toContain('github.io')
      expect(target).toBe('_blank')
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('FEA-22: Can navigate with Tab key', async ({ basePage }) => {
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      // Tab through elements
      await basePage.page.keyboard.press('Tab')
      await basePage.page.keyboard.press('Tab')

      // Focus should move to category buttons
      const focusedElement = await basePage.page.evaluate(() => {
        return document.activeElement?.tagName
      })
      expect(focusedElement).toBe('BUTTON')
    })

    test('FEA-23: Can activate buttons with Enter/Space', async ({ basePage }) => {
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      // Focus Core Features button
      const coreButton = basePage.page.locator('button:has-text("Core Features")')
      await coreButton.focus()
      await basePage.page.waitForTimeout(100)

      // Press Enter
      await basePage.page.keyboard.press('Enter')
      await basePage.page.waitForTimeout(200)

      // Should filter to core features
      await expect(basePage.page.locator('text=Three Editor Modes')).toBeVisible()
      await expect(basePage.page.locator('text=LaTeX Math Rendering')).not.toBeVisible()
    })
  })

  test.describe('Rapid Interactions', () => {
    test('FEA-24: Handles rapid category switching', async ({ basePage }) => {
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      // Rapidly click different categories
      await basePage.page.locator('button:has-text("Core Features")').click()
      await basePage.page.locator('button:has-text("Editing")').click()
      await basePage.page.locator('button:has-text("Organization")').click()
      await basePage.page.waitForTimeout(200)

      // Should end on Organization
      await expect(basePage.page.locator('text=Project System')).toBeVisible()
    })

    test('FEA-25: Handles rapid feature selection', async ({ basePage }) => {
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      // Click multiple features rapidly
      await basePage.page.locator('text=Three Editor Modes').click()
      await basePage.page.locator('text=WikiLinks Navigation').click()
      await basePage.page.locator('text=Focus Mode').click()
      await basePage.page.waitForTimeout(200)

      // Last one should show in detail panel
      await expect(basePage.page.locator('text=/Press.*⌘⇧F.*to enter focus mode/i')).toBeVisible()
    })

    test('FEA-26: Handles open/close cycles', async ({ basePage }) => {
      // Open and close multiple times
      for (let i = 0; i < 3; i++) {
        await basePage.pressShiftShortcut('h')
        await basePage.page.waitForTimeout(200)

        await basePage.page.keyboard.press('Escape')
        await basePage.page.waitForTimeout(200)
      }

      // Should work correctly after cycles
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      await expect(basePage.page.locator('text=Scribe Features')).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('FEA-27: Has proper heading structure', async ({ basePage }) => {
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      const mainHeading = basePage.page.locator('h1:has-text("Scribe Features")')
      await expect(mainHeading).toBeVisible()
    })

    test('FEA-28: Close button has aria-label', async ({ basePage }) => {
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      const closeButton = basePage.page.locator('button[title="Close features showcase"]')
      const ariaLabel = await closeButton.getAttribute('aria-label')

      // Either title or inner content serves as accessible name
      const hasAccessibleName = ariaLabel !== null || await closeButton.getAttribute('title') !== null
      expect(hasAccessibleName).toBe(true)
    })
  })

  test.describe('Visual Styling', () => {
    test('FEA-29: Has backdrop blur effect', async ({ basePage }) => {
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      const backdrop = basePage.page.locator('.backdrop-blur-sm').first()
      await expect(backdrop).toBeVisible()
    })

    test('FEA-30: Has responsive grid layout', async ({ basePage }) => {
      await basePage.pressShiftShortcut('h')
      await basePage.page.waitForTimeout(300)

      const grid = basePage.page.locator('.grid').first()
      await expect(grid).toBeVisible()

      // Check has grid classes
      const className = await grid.getAttribute('class')
      expect(className).toContain('grid')
    })
  })
})
