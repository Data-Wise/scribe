# Hot Module Reload (HMR) Troubleshooting

## TL;DR

**If features stop working during development:**
1. Refresh the browser (⌘R) - fixes 95% of cases
2. If still broken, restart dev server
3. If STILL broken, run E2E tests to verify it's not code regression

---

## What is HMR?

Hot Module Reload (HMR) is Vite's feature that updates your code in the browser WITHOUT a full page refresh. It's fast and convenient, but can sometimes cause state corruption.

---

## Common Symptoms

- Window dragging stops working
- Clicks don't register
- Features that worked 5 minutes ago are now broken
- The app just "feels off"

---

## Why Does This Happen?

HMR replaces JavaScript modules while the app is running. Sometimes:

1. **Old event listeners persist** - Multiple handlers accumulate
2. **React hooks retain stale closures** - useCallback/useMemo capture old state
3. **CodeMirror plugins don't dispose** - Old plugin instances remain active
4. **CSS-in-JS duplicates styles** - Same styles injected multiple times

**Key insight:** The code is usually fine. The browser's runtime state is corrupted.

---

## How to Fix

### Step 1: Refresh Browser (⌘R)
This reloads the entire app with fresh state. **Fixes 95% of HMR issues.**

```bash
# In the Scribe window, press:
⌘R  (macOS)
Ctrl+R  (Windows/Linux)
```

### Step 2: Restart Dev Server (if refresh doesn't work)
```bash
# In terminal:
Ctrl+C  (kill dev server)
npm run dev  (restart)
```

### Step 3: Clear Vite Cache (nuclear option)
```bash
rm -rf node_modules/.vite
npm run dev
```

---

## How to Know if It's HMR or Real Bug

**Run the E2E tests:**
```bash
# Test the specific feature that seems broken
npm run test:e2e -- e2e/specs/window-dragging.spec.ts

# If tests PASS → HMR issue, not code issue
# If tests FAIL → Real bug, investigate code
```

**Example:**
```bash
$ npm run test:e2e -- e2e/specs/window-dragging.spec.ts

Running 10 tests using 5 workers
  ✓  10 passed (13.6s)
```
**Result:** Window dragging works fine. Issue was HMR state, not code.

---

## Prevention

### For Developers

**After making changes, run verification:**
```bash
./scripts/verify-change.sh
```

This runs:
1. TypeScript check
2. Critical E2E tests (window dragging, etc.)
3. Unit tests
4. Production build

**Only commit if all checks pass.**

### Pre-Commit Hook (Optional)

Install husky to automatically test before commits:
```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run test:e2e -- e2e/specs/window-dragging.spec.ts"
```

Now git won't let you commit if window dragging is broken.

---

## Understanding the Error

### User Perception vs Reality

| What User Sees | What Actually Happened |
|----------------|------------------------|
| "Window dragging is broken again!" | HMR state corrupted event listeners |
| "The fix broke something else!" | Dev server state issue, not code |
| "This feature worked 5 minutes ago!" | Yes, code is fine. Browser state is not. |

### How to Verify

```bash
# 1. Feature seems broken in dev server
$ open http://localhost:5173  # Broken window dragging

# 2. Run E2E test
$ npm run test:e2e -- e2e/specs/window-dragging.spec.ts
✓ 10 passed  # All tests pass!

# 3. Conclusion: HMR issue, not code issue
$ # Refresh browser → Fixed
```

---

## Real-World Example

**Scenario:** Implementing WikiLink double-click navigation

1. **Code change:** Modified `CodeMirrorEditor.tsx` to add click handlers
2. **HMR reload:** Vite hot-reloaded the changed module
3. **User reports:** "Window dragging is broken!"
4. **Investigation:**
   - CSS: ✅ All `-webkit-app-region` rules present
   - TypeScript: ✅ No compilation errors
   - E2E tests: ✅ 10/10 window dragging tests pass
   - **Conclusion:** HMR state issue, not code regression
5. **Solution:** Refresh browser (⌘R) → window dragging works perfectly

---

## Best Practices

### During Development

1. **Refresh browser after major changes** - Don't wait for issues
2. **Run E2E tests when in doubt** - Verify code is actually working
3. **Don't panic** - HMR issues are common and easily fixed
4. **Document behavior** - Note what broke and how you fixed it

### Before Committing

1. **Run verification script** - `./scripts/verify-change.sh`
2. **Check E2E tests pass** - Especially for critical features
3. **Commit only if all tests pass** - No broken code in git history

### Code Review

1. **Ask for E2E test runs** - "Does window dragging test pass?"
2. **Check for HMR-prone patterns** - Event listeners, plugins, hooks
3. **Verify feature isolation** - Changes to X shouldn't affect Y

---

## Technical Details

### HMR Lifecycle

```
1. Code change detected by Vite
2. Module graph analysis
3. Invalidate changed module
4. Re-execute module
5. Update runtime
6. Trigger React reconciliation
```

**Problem:** Steps 4-5 can leave old state/listeners/plugins active

### Why Refresh Fixes It

```
Fresh page load:
1. Clear ALL browser state
2. Re-initialize React from scratch
3. Re-bind ALL event listeners
4. Re-create ALL plugin instances
5. Clean slate
```

---

## Troubleshooting Checklist

```
□ Feature stopped working in dev server
□ Refreshed browser (⌘R)
  □ Still broken
  □ Restarted dev server
    □ Still broken
    □ Ran E2E tests
      □ Tests PASS → HMR issue (refresh browser)
      □ Tests FAIL → Real bug (investigate code)
```

---

## Further Reading

- [Vite HMR API](https://vitejs.dev/guide/api-hmr.html)
- [React Hot Reload Pitfalls](https://github.com/facebook/react/issues/16604)
- [CodeMirror 6 Extension Lifecycle](https://codemirror.net/docs/ref/#state.Extension)

---

## Summary

**HMR is great** - Fast feedback loop during development

**HMR has limits** - Sometimes corrupts runtime state

**Easy to fix** - Refresh browser or restart dev server

**Easy to verify** - Run E2E tests to know if it's real bug or HMR issue

**Prevent confusion** - Test before committing, document HMR behavior
