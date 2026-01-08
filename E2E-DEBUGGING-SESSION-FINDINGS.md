# E2E Test Debugging Session - Findings

**Date:** 2026-01-08
**Session:** Post-compaction continuation
**Initial Status:** 13/20 passing (65%)
**Final Status:** 13/20 passing (Root cause identified)

---

## Summary

The E2E test failures are NOT caused by `page.keyboard.press('Enter')` unreliability as initially hypothesized. The root causes are:

1. **QAC-11**: Application bug - Tab key doesn't accept autocomplete
2. **Other tests**: Need further investigation (likely missing Quarto features)

---

## Key Discovery: Tab Key Doesn't Accept Autocomplete

### Test: QAC-11 (Tab key accepts autocomplete suggestion)

**Expected Behavior:**
1. Type `---` → Press Enter → Type `for`
2. Autocomplete menu appears with "format:" suggestion
3. Press Tab to accept → Content should be `---\nformat:`

**Actual Behavior:**
1. Type `---` → Press Enter → Type `for` ✅
2. Autocomplete menu appears ✅
3. Press Tab → Content becomes `---  for` ❌ (two spaces inserted instead)

**Diagnostic Output:**
```
QAC-11 DEBUG: Content after Enter: "---"
QAC-11 DEBUG: Content after typing for: "---for"
QAC-11 DEBUG: Autocomplete visible: true
QAC-11 DEBUG: Final content: "---  for"
```

**Root Cause:** Tab key in CodeMirror is NOT configured to accept autocomplete suggestions. Instead, it inserts spaces (indentation).

**This is an APPLICATION BUG, not a test bug.**

---

## False Lead: Enter Key Reliability

### Initial Hypothesis (INCORRECT)

Based on Playwright documentation and research, I hypothesized that:
- `page.keyboard.press('Enter')` was unreliable
- Should use `locator.press('Enter')` instead
- Focus was being lost between operations

### Why This Was Wrong

**Evidence:**
1. Both QAC-01 (passing) and QAC-11 (failing) show identical behavior after Enter
2. Diagnostic output shows `"---"` in both cases after pressing Enter
3. Both tests use the exact same pattern for typing and pressing Enter
4. Extreme wait time increases (1000ms) didn't fix the issue
5. Using `locator.press()` instead of `page.keyboard.press()` didn't fix the issue

**Conclusion:** The Enter key DOES work correctly. The `textContent()` method doesn't show newlines, but they ARE being created.

---

## Debugging Process Timeline

### Phase 1: Apply Locator Pattern (Failed)
- Replaced `page.keyboard.press('Enter')` with `editor.press('Enter')`
- Replaced `page.keyboard.type()` with `editor.pressSequentially()`
- **Result:** QAC-11 still failed with same error

### Phase 2: Try Newline Character (Failed)
- Typed `---\nformat` directly instead of pressing Enter
- **Result:** Still showed `"---  format"` (CodeMirror stripped newline)

### Phase 3: Match QAC-01 Pattern (Failed)
- Made QAC-11 identical to QAC-01 (which passes)
- **Result:** Still failed even with exact same code

### Phase 4: Increase Wait Times (Failed)
- Increased all waits dramatically (50→500ms, 100→1000ms)
- **Result:** Still failed - NOT a timing issue

### Phase 5: Add Diagnostics (SUCCESS!)
- Added `console.log()` statements at key points
- Checked content after Enter, after typing, and autocomplete visibility
- **Result:** Discovered autocomplete appears but Tab doesn't accept it

---

## Remaining Failing Tests

**Tests Still Failing (6 total):**
- QAC-08: Multiple cross-references with different types
- QAC-13: Chunk option label with fig-cap
- QAC-14: YAML bibliography and cite-method
- QAC-15: Complete Quarto document workflow
- QAC-16: Autocomplete persistence across mode switches
- QAC-18: Chunk option fig-width with numeric values

**Common Error:**
```
Error: expect(locator).toBeVisible() failed
Locator: locator('.cm-tooltip-autocomplete')
Expected: visible
Timeout: 3000ms
Error: element(s) not found
```

**Hypothesis:** These tests are failing because they test Quarto autocomplete features that may not be fully implemented or have bugs in the CodeMirror configuration.

**Next Step:** Investigate each test individually with diagnostics to determine root cause.

---

## Code Changes Made During Debugging

**Files Modified:**
- `e2e/specs/quarto-autocomplete.spec.ts` - Added diagnostic logging

**Changes:**
- Added `console.log()` statements to QAC-01 and QAC-11
- Marked QAC-11 with FIXME comment about Tab key bug

**No changes made to application code** - all issues are either:
1. Application bugs (Tab key)
2. Test bugs (testing unimplemented features)
3. Both

---

## Lessons Learned

1. **Don't Trust Initial Hypotheses** - The Playwright research was correct in general, but didn't apply to this specific issue
2. **Use Diagnostics Early** - Could have saved hours by adding `console.log()` from the start
3. **Check Both Passing and Failing Tests** - Comparing QAC-01 and QAC-11 revealed they behave identically until Tab is pressed
4. **textContent() Hides Newlines** - Need to use alternative methods to check for newlines
5. **Test Failures May Reveal Application Bugs** - QAC-11 correctly identified that Tab doesn't work

---

## Recommendations

### For QAC-11 (Tab Key Test)
**Option A:** Fix the application bug
- Configure CodeMirror to accept autocomplete with Tab
- Keep the test as-is
- **Pros:** Tests actual desired behavior
- **Cons:** Requires code changes

**Option B:** Document as known limitation
- Mark test as `.skip()` with explanation
- Add to known issues list
- **Pros:** Documents current behavior
- **Cons:** Tab won't accept autocomplete

**Recommendation:** Option A - Fix the application bug

### For Other Failing Tests
- Add diagnostics to each test
- Determine if autocomplete menu appears
- Check what content is actually generated
- Decide if tests need fixing or application needs fixing

---

## Next Actions

1. **Investigate remaining 6 failing tests** - Add diagnostics to understand root cause
2. **Fix Tab key acceptance** - Update CodeMirror configuration
3. **Update E2E-TEST-FIX-GUIDE.md** - Document correct debugging approach
4. **Commit findings** - Save debugging session results

---

## Research Sources Consulted (For Reference)

1. [Playwright Keyboard API](https://playwright.dev/docs/api/class-keyboard)
2. [Playwright Locator API](https://playwright.dev/docs/api/class-locator)
3. [GitHub Issue #26451: Difference in behavior for page.keyboard.press('Enter')](https://github.com/microsoft/playwright/issues/26451)
4. [CodeMirror Discussion: Enter key capture](https://discuss.codemirror.net/t/why-is-the-enter-key-not-capture-in-codemirror-6/9048)

**Note:** While these sources were helpful for understanding Playwright's keyboard API, they did not directly solve this specific issue. The solution came from systematic debugging with diagnostics.

---

**Status:** Root cause identified for QAC-11. Further investigation needed for remaining 6 tests.
