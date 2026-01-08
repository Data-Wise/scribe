# E2E Test Setup Fix Guide

## Problem
E2E tests for Quarto autocomplete were failing because:
1. Editor wasn't loading after ⌘N
2. Typing was too fast for CodeMirror to process
3. No delays between keystrokes for auto-trigger to activate

## Solution

### 1. Fixed beforeEach Setup
```typescript
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
```

### 2. Helper Function for Typing
```typescript
async function typeInEditor(p: Page, text: string, options = { delay: 50 }) {
  const editor = p.locator('.cm-content')
  await editor.click()  // Ensure focus
  await p.waitForTimeout(50)
  await p.keyboard.type(text, options)  // Slow typing
}
```

### 3. Test Pattern
```typescript
test('Example test', async () => {
  // Type content with delays
  await typeInEditor(page, '---')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(100)

  // Type to trigger autocomplete
  await typeInEditor(page, 'for')
  await page.waitForTimeout(300)  // Wait for auto-trigger

  // Check autocomplete appeared
  const autocomplete = page.locator('.cm-tooltip-autocomplete')
  await expect(autocomplete).toBeVisible({ timeout: 3000 })
})
```

## Key Points

1. **Always click editor before typing** - ensures focus
2. **Use `delay: 50` option** - simulates human typing speed
3. **Wait 300ms after typing** - gives CodeMirror time to trigger autocomplete
4. **Wait 100ms after Enter** - gives editor time to process newlines
5. **Pass `page` to helper** - works correctly in parallel test execution

## Next Steps

Apply this pattern to all 20 tests:
1. Replace all `page.keyboard.type()` with `typeInEditor(page, ...)`
2. Add `await page.waitForTimeout(300)` before checking for autocomplete menu
3. Add `await page.waitForTimeout(100)` after Enter keypresses

## Status

- ✅ beforeEach setup: Fixed
- ✅ Helper function: Created
- ⏳ Individual tests: Need updating (currently at test file reset)
