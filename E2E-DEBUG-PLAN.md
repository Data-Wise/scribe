# E2E Test Debugging Plan - Quarto Autocomplete

**Date:** 2026-01-08
**Status:** 13/20 tests passing (65%)
**Target:** Fix remaining 7 failing tests

---

## 🔍 Root Cause Analysis

### Primary Issue: `page.keyboard.press()` Unreliability

**Research Findings:**

1. **Playwright Best Practice Violation** ([Playwright Docs](https://playwright.dev/docs/api/class-keyboard))
   - **Current:** Using `page.keyboard.press('Enter')` after `page.keyboard.type()`
   - **Problem:** Focus can shift between operations, causing keypresses to target wrong element
   - **Solution:** Use `locator.press('Enter')` instead - ensures element focus + actionability checks

2. **CodeMirror 6 Known Issues** ([CodeMirror Discussion](https://discuss.codemirror.net/t/why-is-the-enter-key-not-capture-in-codemirror-6/9048))
   - Enter key capture is problematic in certain CodeMirror 6 configurations
   - CodeMirror may intercept or transform Enter keypresses
   - Race conditions between Playwright and CodeMirror event handlers

3. **Observed Behavior:**
   - QAC-11 error: `"---  format"` (two spaces instead of newline)
   - Inconsistent: Same pattern works in QAC-01 but fails in QAC-11
   - Suggests timing/focus issue, not code pattern issue

---

## 📊 Failing Tests Analysis

| Test | Issue | Pattern |
|------|-------|---------|
| QAC-03 | Autocomplete not appearing | YAML multiple keys |
| QAC-06 | Autocomplete not appearing | Multiple chunk options |
| QAC-07 | Autocomplete not appearing | Cross-reference |
| QAC-08 | Autocomplete not appearing | Multiple cross-refs |
| QAC-11 | Enter creates space not newline | Tab key accept |
| QAC-13 | Autocomplete not appearing | Chunk label + fig-cap |
| QAC-15 | Autocomplete not appearing | Full workflow |
| QAC-16 | Autocomplete not appearing | Mode switch |
| QAC-18 | Content assertion fails | Fig-width numeric |

**Common Pattern:** Most failures = autocomplete menu never appears
**Root:** Text not properly formatted (no newlines) → context detection fails → no autocomplete

---

## 🔧 Debugging Strategy

### Phase 1: Fix Enter Key Reliability (Priority: HIGH)

**Hypothesis:** `page.keyboard.press('Enter')` loses focus between operations

**Solution:** Replace with `locator.press('Enter')` on editor element

**Implementation:**
```typescript
// ❌ CURRENT (Unreliable)
await page.keyboard.type('---', { delay: 50 })
await page.keyboard.press('Enter')  // May lose focus
await page.waitForTimeout(100)

// ✅ PROPOSED (Reliable)
const editor = page.locator('.cm-content')
await editor.click()
await editor.pressSequentially('---', { delay: 50 })  // Types with element focus
await editor.press('Enter')  // Guaranteed focus on editor
await page.waitForTimeout(100)
```

**Test First:** Apply to QAC-11 (currently failing with space issue)

**Expected Outcome:** `"---\nformat:"` instead of `"---  format"`

---

### Phase 2: Increase Timing Safety (Priority: MEDIUM)

**Hypothesis:** CodeMirror needs more time to process Enter in certain states

**Current Waits:**
- After `editor.click()`: 50ms
- After `keyboard.press('Enter')`: 100ms
- After typing before autocomplete check: 300ms

**Proposed Increases:**
```typescript
await editor.click()
await page.waitForTimeout(100)  // ⬆️ 50→100ms (wait for focus)
await editor.press('Enter')
await page.waitForTimeout(200)  // ⬆️ 100→200ms (wait for newline processing)
```

**Rationale:**
- CodeMirror may have async event handlers
- Browser may need time to propagate focus events
- Network idle waits don't catch synchronous JavaScript delays

---

### Phase 3: Add Verification Steps (Priority: MEDIUM)

**Problem:** Tests fail silently when Enter doesn't work

**Solution:** Add intermediate assertions

```typescript
// After typing '---'
await editor.pressSequentially('---', { delay: 50 })
await editor.press('Enter')
await page.waitForTimeout(200)

// ✅ VERIFY newline was created
const lineCount = await page.evaluate(() => {
  const cm = document.querySelector('.cm-content')
  return cm?.textContent?.split('\n').length || 0
})
expect(lineCount).toBeGreaterThan(1)  // Should have at least 2 lines

// Continue with test...
```

**Benefits:**
- Early failure detection
- Clear error messages
- Identifies exactly where test breaks

---

### Phase 4: Alternative Approach - Direct DOM Manipulation (Priority: LOW)

**If above fails:** Bypass Playwright keyboard entirely

```typescript
// Set CodeMirror content directly via editor API
await page.evaluate(() => {
  const cm = document.querySelector('.cm-editor')?.cmView?.view
  if (cm) {
    cm.dispatch({
      changes: { from: 0, insert: '---\n' }
    })
  }
})
```

**Trade-offs:**
- ✅ Guaranteed to work
- ✅ Fast execution
- ❌ Not testing real user interaction
- ❌ May miss timing issues real users experience

**Use only as last resort** for blocking tests

---

## 📋 Implementation Checklist

### Step 1: Update QAC-11 (Test Case)
- [ ] Replace `page.keyboard.press('Enter')` with `editor.press('Enter')`
- [ ] Replace `page.keyboard.type()` with `editor.pressSequentially()`
- [ ] Increase wait times (50→100ms, 100→200ms)
- [ ] Run test individually
- [ ] Verify: Content should be `"---\nformat:"` not `"---  format"`

### Step 2: Apply to All YAML Tests (QAC-01, 02, 03, 09, 11, 12, 14, 19)
- [ ] Update typing/Enter pattern in each test
- [ ] Run all YAML tests together
- [ ] Target: 8/8 YAML tests passing

### Step 3: Apply to Cross-Reference Tests (QAC-07, 08, 13, 15, 16, 20)
- [ ] Update typing/Enter pattern
- [ ] Run cross-ref tests
- [ ] Target: 6/6 cross-ref tests passing

### Step 4: Apply to Chunk Option Tests (QAC-04, 05, 06, 18)
- [ ] Update typing/Enter pattern
- [ ] Run chunk option tests
- [ ] Target: 4/4 chunk tests passing

### Step 5: Full Suite Verification
- [ ] Run all 20 tests together
- [ ] Target: 20/20 passing (100%)
- [ ] Document any remaining failures

---

## 🧪 Testing Commands

```bash
# Test single failing test
npm run test:e2e -- quarto-autocomplete.spec.ts -g "QAC-11"

# Test all YAML tests
npm run test:e2e -- quarto-autocomplete.spec.ts -g "YAML|Escape|Tab|Live|execute"

# Test all cross-ref tests
npm run test:e2e -- quarto-autocomplete.spec.ts -g "Cross-reference|label|workflow|mode|parentheses"

# Full suite
npm run test:e2e -- quarto-autocomplete.spec.ts

# With debug output
DEBUG=pw:api npm run test:e2e -- quarto-autocomplete.spec.ts -g "QAC-11"
```

---

## 📚 Research Sources

1. **Playwright Keyboard API**
   - [Keyboard | Playwright](https://playwright.dev/docs/api/class-keyboard)
   - [Locator | Playwright](https://playwright.dev/docs/api/class-locator)
   - [Actions | Playwright](https://playwright.dev/docs/input)

2. **Known Issues**
   - [Difference in behavior for page.keyboard.press('Enter') - Issue #26451](https://github.com/microsoft/playwright/issues/26451)
   - [Pressing Enter key is not working - Issue #6637](https://github.com/microsoft/playwright/issues/6637)

3. **CodeMirror 6 Issues**
   - [Why is the Enter key not capture in CodeMirror 6?](https://discuss.codemirror.net/t/why-is-the-enter-key-not-capture-in-codemirror-6/9048)
   - [Enter key should run insertNewline - discuss.CodeMirror](https://discuss.codemirror.net/t/v6-enter-key-should-run-insertnewline/7773)

4. **Best Practices**
   - [Guide to Playwright's Typing and Filling Methods](https://runebook.dev/en/docs/playwright/api/class-locator/locator-press-sequentially)
   - [Master Playwright Basics - Medium](https://medium.com/@divyakandpal93/master-playwright-basics-handling-inputs-clicks-and-keyboard-actions-made-super-simple-b032b9f61633)

---

## 🎯 Success Criteria

1. **All 20 tests passing** (100% pass rate)
2. **No flaky tests** (3 consecutive successful runs)
3. **Execution time** < 60 seconds for full suite
4. **Clear error messages** when tests fail
5. **Pattern documented** in E2E-TEST-FIX-GUIDE.md

---

## 💡 Key Insights

1. **`locator.press()` > `page.keyboard.press()`** for element-specific keypresses
2. **Focus management** is critical in CodeMirror testing
3. **Timing matters** - CodeMirror async handlers need wait time
4. **One pattern for all** - consistency reduces maintenance
5. **Verify intermediate state** - don't assume Enter worked

---

## 🚀 Expected Timeline

- **Phase 1:** 30 minutes (test QAC-11, validate approach)
- **Phase 2:** 1 hour (apply to all tests)
- **Phase 3:** 30 minutes (add verification, handle edge cases)
- **Total:** ~2 hours to 20/20 passing

---

**Next Action:** Apply Phase 1 fix to QAC-11 and verify it resolves the Enter key issue.
