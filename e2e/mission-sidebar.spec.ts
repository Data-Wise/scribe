import { test, expect } from '@playwright/test'

test.describe('Mission Sidebar - Project Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
  })

  test('should display Mission Sidebar on load', async ({ page }) => {
    // Wait for sidebar to render
    const sidebar = page.locator('.mission-sidebar')
    await expect(sidebar).toBeVisible({ timeout: 5000 })

    // Check console for debug logs
    const logs: string[] = []
    page.on('console', msg => {
      if (msg.text().includes('[MissionSidebar]')) {
        logs.push(msg.text())
      }
    })

    // Verify sidebar has a mode
    const mode = await sidebar.getAttribute('data-mode')
    expect(['icon', 'compact', 'card']).toContain(mode)
  })

  test('should show Add Project button', async ({ page }) => {
    // Look for the add project button (+ icon)
    const addButton = page.locator('button[title*="New project"]').or(
      page.locator('button:has-text("New Project")')
    )
    
    await expect(addButton.first()).toBeVisible({ timeout: 5000 })
  })

  test('should open Create Project modal when clicking Add button', async ({ page }) => {
    // Find and click the add project button
    const addButton = page.locator('button[title*="New project"]').or(
      page.locator('button:has-text("New Project")')
    )
    
    await addButton.first().click()

    // Wait for modal to appear
    const modal = page.locator('[role="dialog"]').or(
      page.locator('.modal').or(
        page.locator('text=Create Project')
      )
    )
    
    await expect(modal.first()).toBeVisible({ timeout: 3000 })
  })

  test('should create a new project and display it in sidebar', async ({ page }) => {
    // Click add project button
    const addButton = page.locator('button[title*="New project"]').or(
      page.locator('button:has-text("New Project")')
    )
    await addButton.first().click()

    // Fill in project details
    await page.fill('input[name="name"]', 'Test Research Project')
    
    // Select project type (if dropdown exists)
    const typeSelect = page.locator('select[name="type"]')
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption('research')
    }

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for project to appear in sidebar
    await expect(page.locator('text=Test Research Project')).toBeVisible({ timeout: 5000 })
  })

  test('should toggle between sidebar modes', async ({ page }) => {
    const sidebar = page.locator('.mission-sidebar')
    const toggleButton = page.locator('button[title*="sidebar"]').first()

    // Get initial mode
    const initialMode = await sidebar.getAttribute('data-mode')
    
    // Click toggle
    await toggleButton.click()
    await page.waitForTimeout(300) // Wait for transition

    // Verify mode changed
    const newMode = await sidebar.getAttribute('data-mode')
    expect(newMode).not.toBe(initialMode)
  })

  test('should display system action icons in icon mode', async ({ page }) => {
    const sidebar = page.locator('.mission-sidebar')
    
    // Ensure we're in icon mode
    const toggleButton = page.locator('button[title*="sidebar"]').first()
    let mode = await sidebar.getAttribute('data-mode')
    
    while (mode !== 'icon') {
      await toggleButton.click()
      await page.waitForTimeout(300)
      mode = await sidebar.getAttribute('data-mode')
    }

    // Check for system action icons
    await expect(page.locator('button[title*="Search"]')).toBeVisible()
    await expect(page.locator('button[title*="Journal"]')).toBeVisible()
    await expect(page.locator('button[title*="Settings"]')).toBeVisible()
  })
})
