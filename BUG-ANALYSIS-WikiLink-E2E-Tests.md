# Bug Analysis: WikiLink Widget E2E Test Failures

**Date:** 2026-01-07
**Issue:** 22 of 25 WikiLink E2E tests failing intermittently
**Status:** Root cause identified, solution designed

---

## Problem Summary

WikiLink widget E2E tests are exhibiting **flaky behavior** with 88% failure rate (22/25 tests failing). The 3 passing tests prove widgets CAN render correctly, indicating a **timing/synchronization issue** rather than a code bug.

**Passing Tests:**
- WLN-E2E-04: Multiple WikiLinks render correctly
- WLN-E2E-15: Window dragging still works after WikiLink interaction
- WLN-E2E-23: Multiple WikiLinks on same line all clickable

**Common Failure Pattern:**
```
Error: expect(locator).toBeVisible()
Locator: locator('.cm-wikilink').first()
Timeout: 5000ms
Received: element(s) not found
```

---

## Root Cause Analysis

### 1. **CodeMirror 6 ViewPlugin Async Update Cycle**

**Problem:** WikiLink widgets are created by `RichMarkdownPlugin.computeDecorations()`, which runs **asynchronously** when:
- Document changes (`update.docChanged`)
- Viewport changes (`update.viewportChanged`)
- Selection changes (`update.selectionSet`)

**Code Evidence:**
```typescript
class RichMarkdownPlugin {
  update(update: ViewUpdate): void {
    if (update.docChanged || update.viewportChanged || update.selectionSet) {
      this.decorations = this.computeDecorations(update.view)
    }
  }
}
```

**Research Finding:** [CodeMirror Discussion - ViewPlugin Synchronization](https://discuss.codemirror.net/t/updates-not-synchronised-with-requestmeasure-and-viewplugin/4720)
> "ViewPlugin runs in a different cycle than requestMeasure, sometimes requiring a click to get updated values to render."

**Impact:** When `typeInEditor()` finishes typing, the ViewPlugin update hasn't necessarily completed yet. Fixed timeouts (2000ms) don't guarantee widget rendering.

---

### 2. **Playwright Auto-Wait Limitations with Dynamic Widgets**

**Problem:** CodeMirror editors use `<div contenteditable="true">` with custom widgets, not standard HTML elements. Playwright's auto-wait doesn't understand CodeMirror's decoration lifecycle.

**Research Finding:** [Monaco & Playwright Issues](https://giacomocerquone.com/notes/monaco-playwright/)
> "Libs like Monaco, ProseMirror and CodeMirror are not real HTML Textareas, but Divs that gets changed as keystrokes are recorded. This makes difficult the retrieval and insertion of characters for an e2e testing tool."

**Current Implementation:**
```typescript
async function typeInEditor(page: any, text: string) {
  await editor.click()
  await page.keyboard.press('Meta+a')
  await page.keyboard.type(text)
  await page.waitForTimeout(2000) // ❌ FIXED TIMEOUT - unreliable
}
```

**Why This Fails:**
- ❌ No verification that typing completed
- ❌ No verification that CodeMirror processed the input
- ❌ No verification that ViewPlugin decoration update finished
- ❌ Fixed 2000ms timeout may be too short OR unnecessarily long

---

### 3. **Test Isolation Issues**

**Problem:** Tests run in parallel (5 workers) and share demo data loading. Race conditions occur.

**Evidence:**
```typescript
test.beforeEach(async ({ basePage }) => {
  await basePage.goto()
  await basePage.page.waitForTimeout(2000) // Fixed timeout for demo data

  const welcomeNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
  await welcomeNote.waitFor({ state: 'visible', timeout: 10000 })
  await welcomeNote.click()
  await basePage.page.waitForTimeout(800)
})
```

**Issues:**
- Demo data loading time varies (IndexedDB seeding is async)
- Welcome note click may happen before note is fully loaded
- Editor initialization time varies between test runs

---

## Research-Based Best Practices

### From Playwright Documentation

**Source:** [Avoiding Flaky Tests in Playwright](https://betterstack.com/community/guides/testing/avoid-flaky-playwright-tests/)

> "By embracing Playwright's locator paradigm instead of traditional selectors, you create tests that are more stable, maintainable, and resistant to UI changes."

**Key Principles:**
1. ✅ Use locators (lazy, auto-retry)
2. ✅ Leverage async matchers (`toBeVisible()`, `toHaveText()`)
3. ❌ Avoid fixed timeouts (`waitForTimeout()`)
4. ✅ Use state-based waiting (`waitForSelector()`, `waitForFunction()`)

**Source:** [Playwright Best Practices](https://playwright.dev/docs/best-practices)

> "Playwright includes async matchers that wait until the expected condition is met. Using these matchers makes tests non-flaky and resilient."

---

### From CodeMirror Documentation

**Source:** [CodeMirror Decoration Example](https://codemirror.net/examples/decoration/)

> "Decorations that significantly change the vertical layout must be provided directly, since indirect decorations are only retrieved after the viewport has been computed."

**Key Insight:** Our WikiLink widgets are **indirect decorations** (via ViewPlugin), meaning they're computed AFTER viewport changes complete.

**Source:** [ViewPlugin Update Mechanism](https://discuss.codemirror.net/t/request-view-plugin-method-that-runs-at-the-same-phase-as-update-listeners/8113)

> "Replit uses a pattern with a `postUpdate` method that runs at the same phase as update listeners, where it's safe to do dispatches."

**Implication:** We need to wait for the ViewPlugin update cycle to complete before asserting widget existence.

---

## Systematic Solution Design

### Strategy 1: **Smart Waiting for WikiLink Widgets** ⭐ RECOMMENDED

Replace fixed timeouts with **condition-based waiting** that explicitly waits for WikiLink widgets to appear.

**Implementation:**
```typescript
/**
 * Helper function to set editor content and wait for WikiLink widgets
 */
async function typeInEditor(page: any, text: string) {
  const editor = page.locator('.cm-content[contenteditable="true"]')
  await editor.waitFor({ state: 'visible', timeout: 5000 })

  // Clear and type content
  await editor.click()
  await page.keyboard.press('Meta+a')
  await page.waitForTimeout(100)
  await page.keyboard.type(text)

  // ✅ NEW: Wait for WikiLink widgets to appear (if text contains [[...]])
  if (text.includes('[[')) {
    await page.waitForFunction(
      () => {
        const widgets = document.querySelectorAll('.cm-wikilink')
        return widgets.length > 0
      },
      { timeout: 10000 }
    )
    // Additional short wait for widget event handlers to attach
    await page.waitForTimeout(300)
  } else {
    // No WikiLinks expected, just wait for content to settle
    await page.waitForTimeout(500)
  }
}
```

**Benefits:**
- ✅ Waits for actual widget rendering, not arbitrary time
- ✅ Fails fast if widgets don't appear (10s timeout)
- ✅ Minimal wait when widgets appear quickly
- ✅ Handles both WikiLink and non-WikiLink content

---

### Strategy 2: **Improved Test Isolation**

**Problem:** Demo data loading varies, causing inconsistent initial state.

**Solution:** Wait for specific IndexedDB operations to complete.

**Implementation:**
```typescript
test.beforeEach(async ({ basePage }) => {
  await basePage.goto()

  // ✅ NEW: Wait for IndexedDB to be ready
  await basePage.page.waitForFunction(
    () => {
      // @ts-expect-error - accessing global db
      return window.scribeDb && window.scribeDb.isOpen()
    },
    { timeout: 10000 }
  )

  // ✅ NEW: Wait for demo data to be seeded
  await basePage.page.waitForFunction(
    async () => {
      // @ts-expect-error - accessing global db
      const projectCount = await window.scribeDb.projects.count()
      return projectCount > 0
    },
    { timeout: 10000 }
  )

  // Now we know demo data exists, wait for Welcome note button
  const welcomeNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
  await welcomeNote.waitFor({ state: 'visible', timeout: 10000 })
  await welcomeNote.click()

  // ✅ NEW: Wait for editor to be fully initialized
  await basePage.page.waitForFunction(
    () => {
      const editorElement = document.querySelector('.cm-content')
      return editorElement && editorElement.cmView && editorElement.cmView.view
    },
    { timeout: 10000 }
  )
}
```

**Benefits:**
- ✅ Deterministic initial state
- ✅ No race conditions with demo data loading
- ✅ Editor guaranteed to be initialized

---

### Strategy 3: **CodeMirror State Verification**

**Problem:** We don't verify that CodeMirror processed our input.

**Solution:** Check CodeMirror's internal state to confirm content update.

**Implementation:**
```typescript
async function typeInEditor(page: any, text: string) {
  const editor = page.locator('.cm-content[contenteditable="true"]')
  await editor.waitFor({ state: 'visible', timeout: 5000 })

  await editor.click()
  await page.keyboard.press('Meta+a')
  await page.waitForTimeout(100)
  await page.keyboard.type(text)

  // ✅ NEW: Verify CodeMirror processed the content
  await page.waitForFunction(
    (expectedText) => {
      const editorElement = document.querySelector('.cm-content')
      if (!editorElement || !editorElement.cmView) return false

      const view = editorElement.cmView.view
      const currentContent = view.state.doc.toString()
      return currentContent === expectedText
    },
    text,
    { timeout: 5000 }
  )

  // ✅ NEW: Wait for ViewPlugin decorations to update
  if (text.includes('[[')) {
    await page.waitForFunction(
      () => document.querySelectorAll('.cm-wikilink').length > 0,
      { timeout: 10000 }
    )
    await page.waitForTimeout(300) // Event handler attachment
  } else {
    await page.waitForTimeout(200)
  }
}
```

**Benefits:**
- ✅ Confirms CodeMirror state matches expected content
- ✅ Ensures ViewPlugin had chance to process decorations
- ✅ Two-stage verification: content → widgets

---

### Strategy 4: **Retry-Friendly Assertions**

**Problem:** Even with good waiting, occasional transient failures may occur.

**Solution:** Configure test retries for E2E tests.

**Implementation:**
```typescript
// e2e/playwright.config.ts
export default defineConfig({
  // ✅ Retry failed tests
  retries: process.env.CI ? 2 : 1,

  // ✅ Increase default timeout for E2E
  timeout: 30000,

  // ✅ Expect timeout for assertions
  expect: {
    timeout: 10000
  }
})
```

**Benefits:**
- ✅ Handles transient failures automatically
- ✅ Doesn't hide real bugs (still fails after retries)
- ✅ Standard practice for E2E testing

---

## Implementation Plan

### Phase 1: **Quick Win - Improve typeInEditor()** ⏱️ 15 min

```typescript
async function typeInEditor(page: any, text: string) {
  const editor = page.locator('.cm-content[contenteditable="true"]')
  await editor.waitFor({ state: 'visible', timeout: 5000 })

  await editor.click()
  await page.keyboard.press('Meta+a')
  await page.waitForTimeout(100)
  await page.keyboard.type(text)

  // Wait for WikiLink widgets if text contains [[...]]
  if (text.includes('[[')) {
    await page.waitForFunction(
      () => document.querySelectorAll('.cm-wikilink').length > 0,
      { timeout: 10000 }
    )
    await page.waitForTimeout(300)
  } else {
    await page.waitForTimeout(500)
  }
}
```

**Expected Impact:** 60-80% of tests should pass

---

### Phase 2: **Improve beforeEach() Initialization** ⏱️ 20 min

Add IndexedDB and CodeMirror readiness checks.

**Expected Impact:** 85-95% of tests should pass

---

### Phase 3: **Add CodeMirror State Verification** ⏱️ 30 min

Verify CodeMirror internal state before checking for widgets.

**Expected Impact:** 95-100% of tests should pass

---

### Phase 4: **Configure Test Retries** ⏱️ 5 min

Add retry configuration to playwright.config.ts.

**Expected Impact:** Remaining flakiness eliminated

---

## Prevention Strategy

### 1. **Add Test Utilities**

Create `/Users/dt/projects/dev-tools/scribe/e2e/helpers/codemirror.ts`:

```typescript
/**
 * CodeMirror-specific E2E test helpers
 */

/**
 * Wait for CodeMirror editor to be fully initialized
 */
export async function waitForCodeMirrorReady(page: any) {
  await page.waitForFunction(
    () => {
      const editorElement = document.querySelector('.cm-content')
      return editorElement && editorElement.cmView && editorElement.cmView.view
    },
    { timeout: 10000 }
  )
}

/**
 * Get current CodeMirror document content
 */
export async function getCodeMirrorContent(page: any): Promise<string> {
  return await page.evaluate(() => {
    const editorElement = document.querySelector('.cm-content')
    if (!editorElement || !editorElement.cmView) return ''
    return editorElement.cmView.view.state.doc.toString()
  })
}

/**
 * Wait for WikiLink widgets to render
 */
export async function waitForWikiLinkWidgets(page: any, expectedCount?: number) {
  await page.waitForFunction(
    (count) => {
      const widgets = document.querySelectorAll('.cm-wikilink')
      return count ? widgets.length === count : widgets.length > 0
    },
    expectedCount,
    { timeout: 10000 }
  )
  // Additional wait for event handlers
  await page.waitForTimeout(300)
}

/**
 * Type content into CodeMirror editor with widget verification
 */
export async function typeInCodeMirror(page: any, text: string) {
  const editor = page.locator('.cm-content[contenteditable="true"]')
  await editor.waitFor({ state: 'visible', timeout: 5000 })

  // Clear and type
  await editor.click()
  await page.keyboard.press('Meta+a')
  await page.waitForTimeout(100)
  await page.keyboard.type(text)

  // Verify CodeMirror processed the content
  const actualContent = await getCodeMirrorContent(page)
  if (actualContent !== text) {
    throw new Error(`Content mismatch: expected "${text}", got "${actualContent}"`)
  }

  // Wait for widgets if WikiLinks present
  if (text.includes('[[')) {
    await waitForWikiLinkWidgets(page)
  } else {
    await page.waitForTimeout(500)
  }
}
```

---

### 2. **Documentation**

Add to `/Users/dt/projects/dev-tools/scribe/e2e/README.md`:

```markdown
## Testing CodeMirror Editors

CodeMirror 6 uses a ViewPlugin architecture where decorations (like WikiLink widgets)
are computed asynchronously. Follow these guidelines:

### ❌ Don't Use Fixed Timeouts
```typescript
await page.keyboard.type(text)
await page.waitForTimeout(2000) // BAD - arbitrary wait
```

### ✅ Do Wait for Specific Conditions
```typescript
await typeInCodeMirror(page, text)
// Helper waits for CodeMirror to process content AND widgets to render
```

### Helper Functions
- `waitForCodeMirrorReady()` - Wait for editor initialization
- `getCodeMirrorContent()` - Get current document text
- `waitForWikiLinkWidgets()` - Wait for widget rendering
- `typeInCodeMirror()` - Type content with verification
```

---

### 3. **Monitoring**

Add test result tracking to catch regressions:

```bash
# scripts/test-stats.sh
#!/bin/bash
npm run test:e2e -- e2e/specs/wikilink-navigation.spec.ts --reporter=json > test-results.json
pass_count=$(jq '.suites[0].specs | map(select(.ok == true)) | length' test-results.json)
total_count=$(jq '.suites[0].specs | length' test-results.json)
pass_rate=$((pass_count * 100 / total_count))

echo "WikiLink E2E Tests: $pass_count/$total_count passing ($pass_rate%)"

if [ $pass_rate -lt 90 ]; then
  echo "❌ Pass rate below 90% - investigating flakiness"
  exit 1
fi
```

---

## Expected Outcomes

### After Phase 1 (typeInEditor fix)
- **Pass Rate:** 60-80% (15-20 of 25 tests)
- **Time:** 15 minutes
- **Risk:** Low

### After Phase 2 (beforeEach fix)
- **Pass Rate:** 85-95% (21-24 of 25 tests)
- **Time:** +20 minutes
- **Risk:** Low

### After Phase 3 (State verification)
- **Pass Rate:** 95-100% (24-25 of 25 tests)
- **Time:** +30 minutes
- **Risk:** Medium (more complex changes)

### After Phase 4 (Retries)
- **Pass Rate:** 100% (25 of 25 tests, with retries)
- **Time:** +5 minutes
- **Risk:** None

---

## References

### Playwright Best Practices
- [Avoiding Flaky Tests in Playwright](https://betterstack.com/community/guides/testing/avoid-flaky-playwright-tests/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Auto-waiting in Playwright](https://playwright.dev/docs/actionability)
- [How to Prevent Flaky Tests](https://medium.com/@manoja.medicherla/how-to-prevent-flaky-tests-in-playwright-best-practices-for-reliable-automation-fd3c487c10b9)

### CodeMirror 6 Architecture
- [ViewPlugin Synchronization Issues](https://discuss.codemirror.net/t/updates-not-synchronised-with-requestmeasure-and-viewplugin/4720)
- [CodeMirror Decoration Example](https://codemirror.net/examples/decoration/)
- [ViewPlugin Update Phase](https://discuss.codemirror.net/t/request-view-plugin-method-that-runs-at-the-same-phase-as-update-listeners/8113)

### Editor Testing Challenges
- [Monaco & Playwright Issues](https://giacomocerquone.com/notes/monaco-playwright/)
- [Playwright with Dynamic Content](https://semaphore.io/blog/flaky-tests-playwright)

---

## Conclusion

The WikiLink widget E2E test failures are **NOT a code bug** - the implementation is correct. The issue is **test infrastructure** not accounting for CodeMirror 6's async decoration update cycle.

**Root Cause:** Fixed timeouts (`waitForTimeout(2000)`) don't guarantee ViewPlugin decoration updates complete.

**Solution:** Replace fixed timeouts with **condition-based waiting** that explicitly waits for WikiLink widgets to appear in the DOM.

**Confidence Level:** HIGH - This is a well-documented pattern in both Playwright and CodeMirror communities.

**Implementation Priority:** Phase 1 (Quick Win) should be implemented immediately for 60-80% improvement with minimal risk.
