/**
 * E2E Tests for Quarto Autocomplete
 *
 * Tests Quarto YAML, chunk options, and cross-reference autocomplete
 * in the CodeMirror editor with real user interactions.
 */

import { test, expect, Page } from '@playwright/test'

test.describe('Quarto Autocomplete E2E', () => {
  let page: Page

  test.beforeEach(async ({ page: p }) => {
    page = p
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')

    // Create a new note
    await page.keyboard.press('Meta+n')
    await page.waitForTimeout(500)

    // Switch to Source mode (CodeMirror) for autocomplete testing
    await page.keyboard.press('Meta+1')
    await page.waitForTimeout(300)
  })

  test('QAC-01: YAML frontmatter autocomplete - format key', async () => {
    // Click in the editor to ensure focus
    const editor = page.locator('.cm-content')
    await editor.click()
    await page.waitForTimeout(100)

    // Type YAML frontmatter
    await page.keyboard.type('---')
    await page.keyboard.press('Enter')
    await page.keyboard.type('for')

    // Give CodeMirror time to trigger autocomplete
    await page.waitForTimeout(200)

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
    expect(content).toContain('format:')
  })

  test('QAC-02: YAML frontmatter autocomplete - format values', async () => {
    // Type YAML with format key
    await page.keyboard.type('---')
    await page.keyboard.press('Enter')
    await page.keyboard.type('format: ht')

    // Wait for value autocomplete
    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    // Verify "html" is suggested
    const htmlOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("html")')
    await expect(htmlOption).toBeVisible()

    // Accept
    await page.keyboard.press('Enter')

    // Verify
    const editor = page.locator('.cm-content')
    const content = await editor.textContent()
    expect(content).toContain('html')
  })

  test('QAC-03: YAML multiple keys autocomplete', async () => {
    await page.keyboard.type('---')
    await page.keyboard.press('Enter')

    // Type first key
    await page.keyboard.type('title')
    await page.keyboard.press('Tab') // Complete
    await page.keyboard.type(' "Test Document"')
    await page.keyboard.press('Enter')

    // Type second key
    await page.keyboard.type('auth')

    // Should suggest "author:"
    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    const authorOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("author:")')
    await expect(authorOption).toBeVisible()
  })

  test('QAC-04: Chunk options autocomplete in code block', async () => {
    // Create code block
    await page.keyboard.type('```r')
    await page.keyboard.press('Enter')
    await page.keyboard.type('#| ')

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
    await page.keyboard.type('```r')
    await page.keyboard.press('Enter')
    await page.keyboard.type('#| echo: f')

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
    await page.keyboard.type('```python')
    await page.keyboard.press('Enter')

    // First option
    await page.keyboard.type('#| echo: false')
    await page.keyboard.press('Enter')

    // Second option
    await page.keyboard.type('#| warning')
    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    // Should show #| warning:
    const warningOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("#| warning:")')
    await expect(warningOption).toBeVisible()
  })

  test('QAC-07: Cross-reference autocomplete with label detection', async () => {
    // Create a figure with label
    await page.keyboard.type('![My Plot](plot.png){#fig-myplot}')
    await page.keyboard.press('Enter')
    await page.keyboard.press('Enter')

    // Type cross-reference
    await page.keyboard.type('See @fig')

    // Wait for cross-ref autocomplete
    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    // Verify label appears
    const figOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("@fig-myplot")')
    await expect(figOption).toBeVisible()

    // Accept
    await page.keyboard.press('Enter')

    // Verify
    const editor = page.locator('.cm-content')
    const content = await editor.textContent()
    expect(content).toContain('@fig-myplot')
  })

  test('QAC-08: Multiple cross-references with different types', async () => {
    // Create multiple labeled elements
    await page.keyboard.type('## Methods {#sec-methods}')
    await page.keyboard.press('Enter')
    await page.keyboard.type('![Plot](a.png){#fig-scatter}')
    await page.keyboard.press('Enter')
    await page.keyboard.type('| Data | Value |')
    await page.keyboard.press('Enter')
    await page.keyboard.type('|------|-------|')
    await page.keyboard.press('Enter')
    await page.keyboard.type('{#tbl-results}')
    await page.keyboard.press('Enter')
    await page.keyboard.press('Enter')

    // Type @ to trigger cross-ref
    await page.keyboard.type('Refs: @')

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
    await page.keyboard.type('---')
    await page.keyboard.press('Enter')
    await page.keyboard.type('for')

    // Wait for autocomplete
    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    // Dismiss with Escape
    await page.keyboard.press('Escape')

    // Verify menu is gone
    await expect(autocomplete).not.toBeVisible()
  })

  test('QAC-10: Arrow keys navigate autocomplete options', async () => {
    await page.keyboard.type('---')
    await page.keyboard.press('Enter')
    await page.keyboard.type('f')

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
    await page.keyboard.type('---')
    await page.keyboard.press('Enter')
    await page.keyboard.type('format')

    // Wait for autocomplete
    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    // Accept with Tab
    await page.keyboard.press('Tab')

    // Verify "format:" was inserted
    const editor = page.locator('.cm-content')
    const content = await editor.textContent()
    expect(content).toContain('format:')
  })

  test('QAC-12: Autocomplete in Live Preview mode', async () => {
    // Switch to Live Preview mode
    await page.keyboard.press('Meta+2')
    await page.waitForTimeout(300)

    // YAML autocomplete should still work
    await page.keyboard.type('---')
    await page.keyboard.press('Enter')
    await page.keyboard.type('tit')

    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    const titleOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("title:")')
    await expect(titleOption).toBeVisible()
  })

  test('QAC-13: Chunk option label with fig-cap', async () => {
    await page.keyboard.type('```{r}')
    await page.keyboard.press('Enter')
    await page.keyboard.type('#| label: fig-scatter')
    await page.keyboard.press('Enter')
    await page.keyboard.type('#| fig-cap: "Scatter plot"')
    await page.keyboard.press('Enter')
    await page.keyboard.type('plot(x, y)')
    await page.keyboard.press('Enter')
    await page.keyboard.type('```')
    await page.keyboard.press('Enter')
    await page.keyboard.press('Enter')

    // Now reference it
    await page.keyboard.type('@fig-s')

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
    await page.keyboard.type('---')
    await page.keyboard.press('Enter')
    await page.keyboard.type('bib')

    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    // Should suggest bibliography:
    const bibOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("bibliography:")')
    await expect(bibOption).toBeVisible()

    // Accept and add value
    await page.keyboard.press('Enter')
    await page.keyboard.type(' refs.bib')
    await page.keyboard.press('Enter')

    // Try cite-method
    await page.keyboard.type('cite')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    const citeOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("cite-method:")')
    await expect(citeOption).toBeVisible()
  })

  test('QAC-15: Complete Quarto document workflow', async () => {
    // Build a complete Quarto document with autocomplete
    await page.keyboard.type('---')
    await page.keyboard.press('Enter')
    await page.keyboard.type('title: "Analysis"')
    await page.keyboard.press('Enter')
    await page.keyboard.type('format: html')
    await page.keyboard.press('Enter')
    await page.keyboard.type('---')
    await page.keyboard.press('Enter')
    await page.keyboard.press('Enter')

    // Add section
    await page.keyboard.type('## Results {#sec-results}')
    await page.keyboard.press('Enter')
    await page.keyboard.press('Enter')

    // Add code block
    await page.keyboard.type('```{r}')
    await page.keyboard.press('Enter')
    await page.keyboard.type('#| label: fig-plot')
    await page.keyboard.press('Enter')
    await page.keyboard.type('#| echo: false')
    await page.keyboard.press('Enter')
    await page.keyboard.type('plot(data)')
    await page.keyboard.press('Enter')
    await page.keyboard.type('```')
    await page.keyboard.press('Enter')
    await page.keyboard.press('Enter')

    // Reference section and figure
    await page.keyboard.type('See @sec-re')

    // Should autocomplete section
    let autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })
    await page.keyboard.press('Enter')

    await page.keyboard.type(' and @fig-')

    // Should autocomplete figure
    await expect(autocomplete).toBeVisible({ timeout: 3000 })
    await page.keyboard.press('Enter')

    // Verify complete document
    const editor = page.locator('.cm-content')
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
    await page.keyboard.type('![Plot](a.png){#fig-test}')
    await page.keyboard.press('Enter')

    // Switch to Live Preview
    await page.keyboard.press('Meta+2')
    await page.waitForTimeout(300)

    // Type cross-ref
    await page.keyboard.type('@fig')

    // Should still work
    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    const figOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("@fig-test")')
    await expect(figOption).toBeVisible()
  })

  test('QAC-17: No autocomplete outside YAML/code/refs', async () => {
    // Type regular prose
    await page.keyboard.type('This is regular text')

    // Autocomplete should not appear
    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).not.toBeVisible({ timeout: 1000 })
  })

  test('QAC-18: Chunk option fig-width with numeric values', async () => {
    await page.keyboard.type('```r')
    await page.keyboard.press('Enter')
    await page.keyboard.type('#| fig-w')

    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    // Should show fig-width option
    const figWidthOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("#| fig-width:")')
    await expect(figWidthOption).toBeVisible()

    // Accept
    await page.keyboard.press('Enter')

    // Type value
    await page.keyboard.type(' 8')

    // Verify
    const editor = page.locator('.cm-content')
    const content = await editor.textContent()
    expect(content).toContain('#| fig-width: 8')
  })

  test('QAC-19: YAML execute block options', async () => {
    await page.keyboard.type('---')
    await page.keyboard.press('Enter')
    await page.keyboard.type('exec')

    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    // Should show execute:
    const executeOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("execute:")')
    await expect(executeOption).toBeVisible()
  })

  test('QAC-20: Cross-ref in parentheses', async () => {
    // Create label
    await page.keyboard.type('{#fig-test}')
    await page.keyboard.press('Enter')
    await page.keyboard.press('Enter')

    // Type cross-ref in parentheses
    await page.keyboard.type('As shown (@fig')

    const autocomplete = page.locator('.cm-tooltip-autocomplete')
    await expect(autocomplete).toBeVisible({ timeout: 3000 })

    const figOption = page.locator('.cm-tooltip-autocomplete .cm-completionLabel:has-text("@fig-test")')
    await expect(figOption).toBeVisible()
  })
})
