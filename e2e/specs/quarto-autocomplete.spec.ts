/**
 * E2E Tests for Quarto Autocomplete
 *
 * Tests Quarto YAML, chunk options, and cross-reference autocomplete
 * in the CodeMirror editor with real user interactions.
 */

import { test, expect, Page } from '@playwright/test'

test.describe('Quarto Autocomplete E2E', () => {
  let page: Page

  // Helper function for typing in editor with delays
  async function typeInEditor(p: Page, text: string, options = { delay: 50 }) {
    const editor = p.locator('.cm-content')
    await editor.click()  // Ensure focus
    await p.waitForTimeout(50)
    await p.keyboard.type(text, options)  // Slow typing
  }

  // Helper to ensure editor has focus before keyboard operations
  async function focusEditor(p: Page) {
    const editor = p.locator('.cm-content')
    await editor.click()
    await p.waitForTimeout(50)
  }

  // Helper to press Enter with extended wait (fixes Enter key reliability)
  async function pressEnterWithReset(p: Page) {
    await p.keyboard.press('Enter')
    // Extended wait to ensure CodeMirror fully processes the newline
    await p.waitForTimeout(300)
  }

  test.beforeEach(async ({ page: p }) => {
    page = p
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')

    // Create a new note
    await page.keyboard.press('Meta+n')

    // Wait for Source mode button (indicates editor loaded)
    const sourceButton = page.locator('button', { hasText: 'Source' })
    await expect(sourceButton).toBeVisible({ timeout: 5000 })

    // Ensure Source mode is active
    const isSourceActive = await sourceButton.getAttribute('class')
    if (!isSourceActive?.includes('active') && !isSourceActive?.includes('selected')) {
      await sourceButton.click()
      await page.waitForTimeout(200)
    }

    // Wait for CodeMirror editor
    const editor = page.locator('.cm-content')
    await expect(editor).toBeVisible({ timeout: 3000 })
  })

  test('QAC-01: YAML frontmatter autocomplete - format key', async () => {
    // Type YAML frontmatter - use page.type to include Enter
    const editor = page.locator('.cm-content')
    await editor.click()
    await page.waitForTimeout(50)
    await page.keyboard.type('---', { delay: 50 })
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100)

    // DIAGNOSTIC: Check content after Enter
    const contentAfterEnter = await editor.textContent()
    console.log('QAC-01 DEBUG: Content after Enter:', JSON.stringify(contentAfterEnter))

    await page.keyboard.type('for', { delay: 50 })
    await page.waitForTimeout(300)  // Wait for auto-trigger

    // Wait for autocomplete menu
    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    // Verify "format:" is in suggestions
    const formatOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("format:")')
    await expect(formatOption).toBeVisible()

    // Accept suggestion
    await page.keyboard.press('Enter')

    // Verify insertion
    const content = await editor.textContent()
    console.log('QAC-01 DEBUG: Final content:', JSON.stringify(content))
    expect(content).toContain('format:')
  })

  test('QAC-02: YAML frontmatter autocomplete - format values', async () => {
    // Type YAML with format key
    const editor = page.locator('.cm-content')
    await editor.click()
    await page.waitForTimeout(50)
    await page.keyboard.type('---', { delay: 50 })
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100)
    await page.keyboard.type('format: ht', { delay: 50 })
    await page.waitForTimeout(300)

    // Wait for value autocomplete
    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    // Verify "html" is suggested
    const htmlOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("html")')
    await expect(htmlOption).toBeVisible()

    // Accept
    await page.keyboard.press('Enter')

    // Verify
    const content = await editor.textContent()
    expect(content).toContain('html')
  })

  test('QAC-03: YAML multiple keys autocomplete', async () => {
    const editor = page.locator('.cm-content')
    await editor.click()
    await page.waitForTimeout(50)
    await page.keyboard.type('---', { delay: 50 })
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100)

    // Type first key
    await page.keyboard.type('title', { delay: 50 })
    await page.keyboard.press('Tab')
    await page.keyboard.type(' "Test Document"', { delay: 50 })
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100)

    // Type second key
    await page.keyboard.type('auth', { delay: 50 })
    await page.waitForTimeout(300)

    // Should suggest "author:"
    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    const authorOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("author:")')
    await expect(authorOption).toBeVisible()
  })

  test('QAC-04: Chunk options autocomplete in code block', async () => {
    // Create code block
    await typeInEditor(page, '```r')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100)

    await typeInEditor(page, '#| ')
    await page.waitForTimeout(300)

    // Wait for chunk option autocomplete
    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    // Verify chunk options appear
    const echoOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("#| echo:")')
    await expect(echoOption).toBeVisible()

    const evalOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("#| eval:")')
    await expect(evalOption).toBeVisible()
  })

  test('QAC-05: Chunk option value completion', async () => {
    await typeInEditor(page, '```r')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100)

    await typeInEditor(page, '#| echo: f')
    await page.waitForTimeout(300)

    // Should suggest "false"
    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    const falseOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("false")')
    await expect(falseOption).toBeVisible()

    // Accept
    await page.keyboard.press('Enter')

    // Verify
    const editor = page.locator('.cm-content')
    const content = await editor.textContent()
    expect(content).toContain('#| echo: false')
  })

  test('QAC-06: Multiple chunk options', async () => {
    await typeInEditor(page, '```python')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100)

    // First option
    await typeInEditor(page, '#| echo: false')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100)

    // Second option
    await typeInEditor(page, '#| warning')
    await page.waitForTimeout(300)

    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    // Should show #| warning:
    const warningOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("#| warning:")')
    await expect(warningOption).toBeVisible()
  })

  test('QAC-07: Cross-reference autocomplete with label detection', async () => {
    // Create a figure with label
    const editor = page.locator('.cm-content')
    await editor.click()
    await page.waitForTimeout(50)
    await page.keyboard.type('![My Plot](plot.png){#fig-myplot}', { delay: 50 })
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100)

    // Type cross-reference
    await page.keyboard.type('See @fig', { delay: 50 })
    await page.waitForTimeout(300)

    // Wait for cross-ref autocomplete
    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    // Verify label appears
    const figOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("@fig-myplot")')
    await expect(figOption).toBeVisible()

    // Accept
    await page.keyboard.press('Enter')

    // Verify
    const content = await editor.textContent()
    expect(content).toContain('@fig-myplot')
  })

  test('QAC-08: Multiple cross-references with different types', async () => {
    // Create multiple labeled elements
    const editor = page.locator('.cm-content')
    await editor.click()
    await page.waitForTimeout(50)
    await page.keyboard.type('## Methods {#sec-methods}', { delay: 50 })
    await pressEnterWithReset(page)

    await page.keyboard.type('![Plot](a.png){#fig-scatter}', { delay: 50 })
    await pressEnterWithReset(page)

    await page.keyboard.type('| Data | Value |', { delay: 50 })
    await pressEnterWithReset(page)

    await page.keyboard.type('|------|-------|', { delay: 50 })
    await pressEnterWithReset(page)

    await page.keyboard.type('{#tbl-results}', { delay: 50 })
    await pressEnterWithReset(page)
    await pressEnterWithReset(page)

    // Type @ to trigger cross-ref
    await page.keyboard.type('Refs: @', { delay: 50 })
    await page.waitForTimeout(300)

    // Wait for autocomplete
    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    // All three labels should be available
    const secOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("@sec-methods")')
    const figOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("@fig-scatter")')
    const tblOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("@tbl-results")')

    await expect(secOption).toBeVisible()
    await expect(figOption).toBeVisible()
    await expect(tblOption).toBeVisible()
  })

  test('QAC-09: Autocomplete dismisses on Escape', async () => {
    const editor = page.locator('.cm-content')
    await editor.click()
    await page.waitForTimeout(50)
    await page.keyboard.type('---', { delay: 50 })
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100)

    await page.keyboard.type('for', { delay: 50 })
    await page.waitForTimeout(300)

    // Wait for autocomplete
    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    // Dismiss with Escape
    await page.keyboard.press('Escape')

    // Verify menu is gone
    await expect(autocomplete).not.toBeVisible()
  })

  test('QAC-10: Arrow keys navigate autocomplete options', async () => {
    await typeInEditor(page, '---')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100)

    await typeInEditor(page, 'f')
    await page.waitForTimeout(300)

    // Wait for autocomplete
    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    // Press down arrow to select next option
    await page.keyboard.press('ArrowDown')

    // Verify selection changed (aria-selected attribute)
    const selected = page.locator('.cm-tooltip-autocomplete [aria-selected="true"]')
    await expect(selected).toBeVisible()

    // Press down again
    await page.keyboard.press('ArrowDown')

    // Should still have a selection
    await expect(selected).toBeVisible()
  })

  test('QAC-11: Tab key accepts autocomplete suggestion', async () => {
    // EXACT COPY of QAC-01 pattern + diagnostics
    const editor = page.locator('.cm-content')
    await editor.click()
    await page.waitForTimeout(50)
    await page.keyboard.type('---', { delay: 50 })
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100)

    // DIAGNOSTIC: Check content after Enter
    const contentAfterEnter = await editor.textContent()
    console.log('QAC-11 DEBUG: Content after Enter:', JSON.stringify(contentAfterEnter))

    await page.keyboard.type('for', { delay: 50 })
    await page.waitForTimeout(300)

    // DIAGNOSTIC: Check content after typing "for"
    const contentAfterFor = await editor.textContent()
    console.log('QAC-11 DEBUG: Content after typing for:', JSON.stringify(contentAfterFor))

    // Wait for autocomplete menu
    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    const isAutocompleteVisible = await autocomplete.isVisible().catch(() => false)
    console.log('QAC-11 DEBUG: Autocomplete visible:', isAutocompleteVisible)
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    // Verify "format:" is in suggestions
    const formatOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("format:")')
    await expect(formatOption).toBeVisible()

    // FIXME: Tab should accept autocomplete but currently inserts spaces instead
    // This is an application bug in CodeMirror configuration
    await page.keyboard.press('Tab')

    // Verify insertion
    const content = await editor.textContent()
    console.log('QAC-11 DEBUG: Final content:', JSON.stringify(content))
    expect(content).toContain('format:')
  })

  test('QAC-12: Autocomplete in Live Preview mode', async () => {
    // Switch to Live Preview mode
    await page.keyboard.press('Meta+2')
    await page.waitForTimeout(300)

    // YAML autocomplete should still work
    const editor = page.locator('.cm-content')
    await editor.click()
    await page.waitForTimeout(50)
    await page.keyboard.type('---', { delay: 50 })
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100)

    await page.keyboard.type('tit', { delay: 50 })
    await page.waitForTimeout(300)

    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    const titleOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("title:")')
    await expect(titleOption).toBeVisible()
  })

  test('QAC-13: Chunk option label with fig-cap', async () => {
    const editor = page.locator('.cm-content')
    await editor.click()
    await page.waitForTimeout(50)
    await page.keyboard.type('```{r}', { delay: 50 })
    await pressEnterWithReset(page)

    await page.keyboard.type('#| label: fig-scatter', { delay: 50 })
    await pressEnterWithReset(page)

    await page.keyboard.type('#| fig-cap: "Scatter plot"', { delay: 50 })
    await pressEnterWithReset(page)

    await page.keyboard.type('plot(x, y)', { delay: 50 })
    await pressEnterWithReset(page)

    await page.keyboard.type('```', { delay: 50 })
    await pressEnterWithReset(page)
    await pressEnterWithReset(page)

    // Now reference it
    await page.keyboard.type('@fig-s', { delay: 50 })
    await page.waitForTimeout(300)

    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    // Should show the label with caption context
    const figOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("@fig-scatter")')
    await expect(figOption).toBeVisible()

    // Detail should show the caption
    const detail = page.locator('.cm-tooltip-autocomplete .cm-completionDetail:has-text("Scatter plot")')
    await expect(detail).toBeVisible()
  })

  test('QAC-14: YAML bibliography and cite-method', async () => {
    const editor = page.locator('.cm-content')
    await editor.click()
    await page.waitForTimeout(50)
    await page.keyboard.type('---', { delay: 50 })
    await pressEnterWithReset(page)  // Use helper for reliable Enter

    await page.keyboard.type('bib', { delay: 50 })
    await page.waitForTimeout(300)

    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    // Should suggest bibliography:
    const bibOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("bibliography:")')
    await expect(bibOption).toBeVisible()

    // Accept and add value
    await page.keyboard.press('Enter')
    await page.keyboard.type(' refs.bib', { delay: 50 })
    await pressEnterWithReset(page)  // Use helper for reliable Enter

    // Try cite-method
    await page.keyboard.type('cite', { delay: 50 })
    await page.waitForTimeout(300)

    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    const citeOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("cite-method:")')
    await expect(citeOption).toBeVisible()
  })

  test('QAC-15: Complete Quarto document workflow', async () => {
    // Build a complete Quarto document with autocomplete
    const editor = page.locator('.cm-content')
    await editor.click()
    await page.waitForTimeout(50)
    await page.keyboard.type('---', { delay: 50 })
    await pressEnterWithReset(page)

    await page.keyboard.type('title: "Analysis"', { delay: 50 })
    await pressEnterWithReset(page)

    await page.keyboard.type('format: html', { delay: 50 })
    await pressEnterWithReset(page)

    await page.keyboard.type('---', { delay: 50 })
    await pressEnterWithReset(page)
    await pressEnterWithReset(page)

    // Add section
    await page.keyboard.type('## Results {#sec-results}', { delay: 50 })
    await pressEnterWithReset(page)
    await pressEnterWithReset(page)

    // Add code block
    await page.keyboard.type('```{r}', { delay: 50 })
    await pressEnterWithReset(page)

    await page.keyboard.type('#| label: fig-plot', { delay: 50 })
    await pressEnterWithReset(page)

    await page.keyboard.type('#| echo: false', { delay: 50 })
    await pressEnterWithReset(page)

    await page.keyboard.type('plot(data)', { delay: 50 })
    await pressEnterWithReset(page)

    await page.keyboard.type('```', { delay: 50 })
    await pressEnterWithReset(page)
    await pressEnterWithReset(page)

    // Reference section and figure
    await page.keyboard.type('See @sec-re', { delay: 50 })
    await page.waitForTimeout(300)

    // Should autocomplete section
    let autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })
    await page.keyboard.press('Enter')

    await page.keyboard.type(' and @fig-', { delay: 50 })
    await page.waitForTimeout(300)

    // Should autocomplete figure
    await expect(autocomplete).toBeVisible({ timeout: 3000 })
    await page.keyboard.press('Enter')

    // Verify complete document
    const content = await editor.textContent()
    expect(content).toContain('title: "Analysis"')
    expect(content).toContain('format: html')
    expect(content).toContain('#sec-results')
    expect(content).toContain('#| label: fig-plot')
    expect(content).toContain('@sec-results')
    expect(content).toContain('@fig-plot')
  })

  test('QAC-16: Autocomplete persistence across mode switches', async () => {
    // Type in Source mode
    await page.keyboard.press('Meta+1')

    const editor = page.locator('.cm-content')
    await editor.click()
    await page.waitForTimeout(50)
    await page.keyboard.type('![Plot](a.png){#fig-test}', { delay: 50 })
    await pressEnterWithReset(page)  // Use helper for reliable Enter

    // Switch to Live Preview
    await page.keyboard.press('Meta+2')
    await page.waitForTimeout(300)

    // Type cross-ref
    await editor.click()
    await page.waitForTimeout(50)
    await page.keyboard.type('@fig', { delay: 50 })
    await page.waitForTimeout(300)

    // Should still work
    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    const figOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("@fig-test")')
    await expect(figOption).toBeVisible()
  })

  test('QAC-17: No autocomplete outside YAML/code/refs', async () => {
    // Type regular prose
    await typeInEditor(page, 'This is regular text')

    // Autocomplete should not appear
    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).not.toBeVisible({ timeout: 1000 })
  })

  test('QAC-18: Chunk option fig-width with numeric values', async () => {
    const editor = page.locator('.cm-content')
    await editor.click()
    await page.waitForTimeout(50)
    await page.keyboard.type('```r', { delay: 50 })
    await pressEnterWithReset(page)

    await page.keyboard.type('#| fig-w', { delay: 50 })
    await page.waitForTimeout(300)

    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    // Should show fig-width option
    const figWidthOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("#| fig-width:")')
    await expect(figWidthOption).toBeVisible()

    // Accept
    await page.keyboard.press('Enter')

    // Type value
    await page.keyboard.type(' 8', { delay: 50 })

    // Verify
    const content = await editor.textContent()
    expect(content).toContain('#| fig-width: 8')
  })

  test('QAC-19: YAML execute block options', async () => {
    const editor = page.locator('.cm-content')
    await editor.click()
    await page.waitForTimeout(50)
    await page.keyboard.type('---', { delay: 50 })
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100)

    await page.keyboard.type('exec', { delay: 50 })
    await page.waitForTimeout(300)

    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    // Should show execute:
    const executeOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("execute:")')
    await expect(executeOption).toBeVisible()
  })

  test('QAC-20: Cross-ref in parentheses', async () => {
    // Create label
    await typeInEditor(page, '{#fig-test}')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100)

    // Type cross-ref in parentheses
    await typeInEditor(page, 'As shown (@fig')
    await page.waitForTimeout(300)

    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    const figOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("@fig-test")')
    await expect(figOption).toBeVisible()
  })
})
