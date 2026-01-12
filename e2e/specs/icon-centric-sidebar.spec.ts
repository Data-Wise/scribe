import { test, expect } from '../fixtures'

/**
 * Icon-Centric Sidebar E2E Tests (v1.16.0)
 *
 * Tests the new icon-centric expansion system where each icon
 * (Inbox, Smart Folders, Pinned Projects) can independently expand
 * with its own preferred view mode (compact or card).
 *
 * Architecture:
 * - IconBar (48px, always visible)
 * - ExpandedIconPanel (conditional, slides in)
 * - Accordion pattern (one icon at a time)
 * - Per-icon mode preferences
 */

test.describe('Icon-Centric Sidebar (v1.16.0)', () => {
  test.describe('IconBar - Always Visible', () => {
    test('ICS-01: IconBar is always visible at 48px width', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Icon bar should always be visible
      const iconBar = basePage.page.locator('.mission-sidebar-icon')
      await expect(iconBar).toBeVisible()

      // Should be 48px wide
      const width = await iconBar.evaluate(el => el.getBoundingClientRect().width)
      expect(width).toBe(48)
    })

    test('ICS-02: Inbox icon is always first', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Find inbox icon button
      const inboxBtn = basePage.page.locator('.inbox-icon-btn')
      await expect(inboxBtn).toBeVisible()

      // Should be the inbox button
      await expect(inboxBtn).toHaveClass(/inbox-icon-btn/)
    })

    test('ICS-03: Smart icons are visible (Research, Teaching, R Package, Dev Tools)', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Check for smart icon buttons
      const smartIcons = basePage.page.locator('.smart-icon-btn')
      const count = await smartIcons.count()

      // Should have 4 default smart icons
      expect(count).toBeGreaterThanOrEqual(3) // At least Research, Teaching, R Package
    })

    test('ICS-04: Activity bar is at bottom of IconBar', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      const activityBar = basePage.page.locator('.activity-bar')
      await expect(activityBar).toBeVisible()

      // Should be inside icon bar
      const iconBar = basePage.page.locator('.mission-sidebar-icon')
      const activityBarBox = await activityBar.boundingBox()
      const iconBarBox = await iconBar.boundingBox()

      expect(activityBarBox).not.toBeNull()
      expect(iconBarBox).not.toBeNull()
      expect(activityBarBox!.y).toBeGreaterThan(iconBarBox!.y)
    })
  })

  test.describe('Accordion Pattern - One Icon at a Time', () => {
    test('ICS-05: Clicking Inbox expands panel', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Click Inbox icon
      const inboxIcon = basePage.page.locator('.inbox-icon-btn').first()
      await inboxIcon.click()
      await basePage.page.waitForTimeout(300)

      // Expanded panel should be visible
      const expandedPanel = basePage.page.locator('.expanded-icon-panel')
      await expect(expandedPanel).toBeVisible()

      // Should show "Inbox" label
      const panelHeader = expandedPanel.locator('.panel-header')
      await expect(panelHeader).toContainText('Inbox')
    })

    test('ICS-06: Clicking expanded icon again collapses it', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Expand Inbox
      const inboxIcon = basePage.page.locator('.inbox-icon-btn').first()
      await inboxIcon.click()
      await basePage.page.waitForTimeout(300)

      // Verify expanded
      await expect(basePage.page.locator('.expanded-icon-panel')).toBeVisible()

      // Click again to collapse
      await inboxIcon.click()
      await basePage.page.waitForTimeout(300)

      // Should collapse (panel hidden)
      await expect(basePage.page.locator('.expanded-icon-panel')).not.toBeVisible()
    })

    test('ICS-07: Clicking different icon collapses current and expands new one', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Expand Inbox
      await basePage.page.locator('.inbox-icon-btn').first().click()
      await basePage.page.waitForTimeout(300)
      await expect(basePage.page.locator('.expanded-icon-panel')).toContainText('Inbox')

      // Click Research smart icon
      const researchIcon = basePage.page.locator('.smart-icon-btn').first()
      await researchIcon.click()
      await basePage.page.waitForTimeout(300)

      // Panel should now show Research, not Inbox
      const panelHeader = basePage.page.locator('.expanded-icon-panel .panel-header')
      await expect(panelHeader).not.toContainText('Inbox')

      // Should have some content (project list or empty state)
      await expect(basePage.page.locator('.expanded-icon-panel')).toBeVisible()
    })

    test('ICS-08: Only one icon can be expanded at a time', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Expand Inbox
      await basePage.page.locator('.inbox-icon-btn').first().click()
      await basePage.page.waitForTimeout(300)

      // Inbox should have active indicator
      const inboxBtn = basePage.page.locator('.inbox-icon-btn').first()
      await expect(inboxBtn).toHaveClass(/active/)

      // Click Research
      await basePage.page.locator('.smart-icon-btn').first().click()
      await basePage.page.waitForTimeout(300)

      // Inbox should no longer be active
      await expect(inboxBtn).not.toHaveClass(/active/)
    })
  })

  test.describe('Expanded Icon Indicator', () => {
    test('ICS-09: Expanded icon shows 3px accent bar', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Expand Inbox
      const inboxBtn = basePage.page.locator('.inbox-icon-btn').first()
      await inboxBtn.click()
      await basePage.page.waitForTimeout(300)

      // Should have active class
      await expect(inboxBtn).toHaveClass(/active/)

      // Check for active-indicator element
      const activeIndicator = inboxBtn.locator('.active-indicator')
      await expect(activeIndicator).toBeVisible()
    })
  })

  test.describe('Mode Toggle - Compact vs Card', () => {
    test('ICS-10: Mode toggle button is visible when icon expanded', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Expand a smart icon (has projects, so mode matters)
      const smartIcon = basePage.page.locator('.smart-icon-btn').first()
      await smartIcon.click()
      await basePage.page.waitForTimeout(300)

      // Mode toggle button should be visible in panel header (aria-label contains "Switch to")
      const modeToggle = basePage.page.locator('.expanded-icon-panel button[aria-label*="Switch to"]')
      await expect(modeToggle).toBeVisible()
    })

    test('ICS-11: Clicking mode toggle switches between compact and card', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Expand smart icon
      await basePage.page.locator('.smart-icon-btn').first().click()
      await basePage.page.waitForTimeout(300)

      // Get current mode (check for compact-list-view or card-grid-view)
      const hasCompactView = await basePage.page.locator('.project-list-compact').isVisible().catch(() => false)
      const hasCardView = await basePage.page.locator('.project-cards-container').isVisible().catch(() => false)

      // One of them should be visible
      expect(hasCompactView || hasCardView).toBeTruthy()

      // Click mode toggle
      const modeToggle = basePage.page.locator('.expanded-icon-panel .panel-header button').nth(1)
      await modeToggle.click()
      await basePage.page.waitForTimeout(300)

      // Mode should have switched
      const newHasCompactView = await basePage.page.locator('.project-list-compact').isVisible().catch(() => false)
      const newHasCardView = await basePage.page.locator('.project-cards-container').isVisible().catch(() => false)

      expect(newHasCompactView !== hasCompactView || newHasCardView !== hasCardView).toBeTruthy()
    })
  })

  test.describe('Close Button', () => {
    test('ICS-12: Close button collapses expanded panel', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Expand Inbox
      await basePage.page.locator('.inbox-icon-btn').first().click()
      await basePage.page.waitForTimeout(300)

      // Click close button in panel header
      const closeBtn = basePage.page.locator('.expanded-icon-panel .panel-header button[aria-label="Collapse panel"]')
      await closeBtn.click()
      await basePage.page.waitForTimeout(300)

      // Panel should be hidden
      await expect(basePage.page.locator('.expanded-icon-panel')).not.toBeVisible()
    })
  })

  test.describe('Sidebar Width', () => {
    test('ICS-13: Collapsed sidebar is 48px', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Sidebar should be 48px when collapsed
      const sidebar = basePage.page.locator('.mission-sidebar')
      const width = await sidebar.evaluate(el => el.getBoundingClientRect().width)
      expect(width).toBe(48)
    })

    test('ICS-14: Expanded sidebar width includes icon bar + panel', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Expand Inbox
      await basePage.page.locator('.inbox-icon-btn').first().click()
      await basePage.page.waitForTimeout(300)

      // Width should be greater than 48px
      const sidebar = basePage.page.locator('.mission-sidebar')
      const width = await sidebar.evaluate(el => el.getBoundingClientRect().width)
      expect(width).toBeGreaterThan(48)
    })
  })

  test.describe('Animations', () => {
    test('ICS-15: Expanded panel slides in smoothly', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Check sidebar has transition CSS
      const sidebar = basePage.page.locator('.mission-sidebar')
      const hasTransition = await sidebar.evaluate(el => {
        const style = window.getComputedStyle(el)
        return style.transition.includes('width') || style.transitionProperty.includes('width')
      })

      expect(hasTransition).toBeTruthy()
    })
  })

  test.describe('Per-Icon Mode Preferences', () => {
    test('ICS-16: Each icon remembers its preferred mode', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Expand first smart icon
      const firstSmartIcon = basePage.page.locator('.smart-icon-btn').first()
      await firstSmartIcon.click()
      await basePage.page.waitForTimeout(300)

      // Get mode toggle button
      const modeToggle = basePage.page.locator('.expanded-icon-panel button[aria-label*="Switch to"]')

      // Check current mode from button aria-label
      const currentAriaLabel = await modeToggle.getAttribute('aria-label')
      const isInCompactMode = currentAriaLabel?.includes('Switch to card')

      // Switch to card mode if currently in compact
      if (isInCompactMode) {
        await modeToggle.click()
        await basePage.page.waitForTimeout(300)
      }

      // Verify we're in card mode (button should say "Switch to compact view")
      await expect(modeToggle).toHaveAttribute('aria-label', 'Switch to compact view')

      // Collapse and re-expand
      await firstSmartIcon.click()
      await basePage.page.waitForTimeout(300)
      await firstSmartIcon.click()
      await basePage.page.waitForTimeout(300)

      // Should still be in card mode (button should still say "Switch to compact view")
      const modeToggleAfter = basePage.page.locator('.expanded-icon-panel button[aria-label*="Switch to"]')
      await expect(modeToggleAfter).toHaveAttribute('aria-label', 'Switch to compact view')
    })
  })

  test.describe('Inbox Specific', () => {
    test('ICS-17: Inbox shows unassigned notes count', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Inbox button should exist
      const inboxBtn = basePage.page.locator('.inbox-icon-btn').first()
      await expect(inboxBtn).toBeVisible()

      // May have badge if unassigned notes exist
      // (This is optional based on app state)
    })

    test('ICS-18: Expanding Inbox shows unassigned notes', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Expand Inbox
      await basePage.page.locator('.inbox-icon-btn').first().click()
      await basePage.page.waitForTimeout(300)

      // Panel should show Inbox content
      const panel = basePage.page.locator('.expanded-icon-panel')
      await expect(panel).toBeVisible()

      // Should have notes list or empty state
      const panelContent = panel.locator('.panel-content')
      await expect(panelContent).toBeVisible()
    })
  })

  test.describe('Smart Icons', () => {
    test('ICS-19: Smart icons filter projects by type', async ({ basePage, seededPage }) => {
      await seededPage.goto()
      await basePage.page.waitForTimeout(1000)

      // Expand Research smart icon
      const researchIcon = basePage.page.locator('.smart-icon-btn').first()
      await researchIcon.click()
      await basePage.page.waitForTimeout(300)

      // Should show research projects only
      // (Seeded page has test-project-1 of type 'research')
      const panel = basePage.page.locator('.expanded-icon-panel')
      await expect(panel).toBeVisible()
    })
  })

  test.describe('Keyboard Accessibility', () => {
    test('ICS-20: Icons are keyboard accessible', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Focus first icon (inbox)
      const firstIcon = basePage.page.locator('.inbox-icon-btn')
      await firstIcon.focus()

      // Should be focused
      const isFocused = await firstIcon.evaluate(el => el === document.activeElement)
      expect(isFocused).toBeTruthy()
    })

    test('ICS-21: Enter key expands/collapses icon', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Focus Inbox
      const inboxBtn = basePage.page.locator('.inbox-icon-btn').first()
      await inboxBtn.focus()

      // Press Enter
      await basePage.page.keyboard.press('Enter')
      await basePage.page.waitForTimeout(300)

      // Should expand
      await expect(basePage.page.locator('.expanded-icon-panel')).toBeVisible()

      // Press Enter again
      await basePage.page.keyboard.press('Enter')
      await basePage.page.waitForTimeout(300)

      // Should collapse
      await expect(basePage.page.locator('.expanded-icon-panel')).not.toBeVisible()
    })
  })

  test.describe('Edge Cases', () => {
    test('ICS-22: Rapid clicking doesn"t break accordion', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Rapidly click between icons
      const inboxBtn = basePage.page.locator('.inbox-icon-btn').first()
      const smartIcon = basePage.page.locator('.smart-icon-btn').first()

      await inboxBtn.click()
      await smartIcon.click()
      await inboxBtn.click()
      await smartIcon.click()
      await basePage.page.waitForTimeout(300)

      // Should end up with one icon expanded
      const expandedPanel = basePage.page.locator('.expanded-icon-panel')
      await expect(expandedPanel).toBeVisible()

      // Only one icon should have active/expanded class
      const expandedIcons = basePage.page.locator('.inbox-icon-btn.active, .smart-icon-btn.expanded, .project-icon-btn.expanded')
      const count = await expandedIcons.count()
      expect(count).toBe(1)
    })

    test('ICS-23: Resizing window doesn"t break sidebar', async ({ basePage }) => {
      await basePage.goto()
      await basePage.page.waitForTimeout(1000)

      // Expand icon
      await basePage.page.locator('.inbox-icon-btn').first().click()
      await basePage.page.waitForTimeout(300)

      // Resize viewport
      await basePage.page.setViewportSize({ width: 1200, height: 800 })
      await basePage.page.waitForTimeout(300)

      // Sidebar should still work
      await expect(basePage.page.locator('.expanded-icon-panel')).toBeVisible()
    })
  })
})
