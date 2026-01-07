# Window Dragging Debug Guide

**Purpose:** Comprehensive guide to debug, fix, and prevent window dragging regressions

**Date:** 2026-01-07

---

## Overview

Window dragging in Scribe uses CSS `-webkit-app-region: drag` to enable dragging the window from specific header areas. When this breaks, the app feels broken and frustrating to use.

---

## Architecture

### CSS-Based Dragging (Current Implementation)

Scribe uses `-webkit-app-region: drag` CSS property on specific elements to make them draggable:

```css
.editor-header {
  -webkit-app-region: drag;
  cursor: grab;
}
```

**Benefits:**
- Simple, declarative
- No JavaScript required
- Works consistently in Tauri

**Limitations:**
- Interactive elements need `-webkit-app-region: no-drag` to remain clickable
- Can be accidentally overridden by child elements
- Z-index issues can block dragging

### Alternative: JS-Based Dragging (Available but Unused)

The `DragRegion` component exists (src/renderer/src/components/DragRegion.tsx) for JS-based dragging using `window.startDragging()`, but it's currently not used in the main app layout.

---

## Current Drag Regions

### 1. Editor Header (`.editor-header`)

**Location:** `src/renderer/src/App.tsx:1366`
**CSS:** `src/renderer/src/index.css:325-334`

```css
.editor-header {
  height: 40px;
  padding: 8px 12px 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  -webkit-app-region: drag;
  cursor: grab;
}
```

**Non-draggable children:**
- `.breadcrumb-item` - Clickable navigation
- `.timer-btn` - Timer controls

### 2. Mission Control Header (`.mission-control-header`)

**Location:** Mission Control sidebar
**CSS:** `src/renderer/src/index.css:2155-2164`

```css
.mission-control-header {
  padding-top: 2.5rem; /* Extra padding for macOS traffic lights */
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  -webkit-app-region: drag;
  cursor: grab;
}

.mission-control-header button {
  -webkit-app-region: no-drag;
  cursor: pointer;
}
```

### 3. Dashboard Header (`.dashboard-header`)

**Location:** Dashboard views
**CSS:** `src/renderer/src/index.css:2275-2293`

```css
.dashboard-header {
  -webkit-app-region: drag;
}

.dashboard-header button,
.dashboard-header-collapsed button {
  -webkit-app-region: no-drag;
}

.dashboard-header-collapsed {
  -webkit-app-region: drag;
}
```

---

## Common Issues and Fixes

### Issue 1: Overlaying Elements

**Symptom:** Drag region exists but clicking doesn't drag

**Cause:** Another element with higher z-index is covering the drag region

**Debug:**
```css
/* Add to index.css temporarily */
.editor-header {
  background: rgba(255, 0, 0, 0.2) !important; /* Red overlay */
  z-index: 9999 !important;
}
```

If you can't see the red overlay, something is covering it.

**Fix:** Adjust z-index or restructure DOM

---

### Issue 2: Missing `-webkit-app-region: no-drag`

**Symptom:** Buttons in drag region don't click

**Cause:** Child elements inherit `drag` property

**Debug:**
```javascript
// In browser console
document.querySelectorAll('.editor-header *').forEach(el => {
  const style = window.getComputedStyle(el);
  if (style['-webkit-app-region'] === 'drag') {
    console.log('DRAG:', el.className);
  }
});
```

**Fix:** Add `-webkit-app-region: no-drag` to interactive elements

---

### Issue 3: HMR State Corruption (Development Only)

**Symptom:** Dragging stops working during development

**Cause:** Vite HMR doesn't refresh CSS properly

**Fix:**
1. Refresh browser (⌘R)
2. If still broken, restart dev server
3. Not a code issue, just HMR

**Reference:** `docs/HMR-TROUBLESHOOTING.md`

---

### Issue 4: Production Build Issue

**Symptom:** Dragging works in dev but not in production build

**Possible Causes:**
1. **CSS purging** - Build process removed CSS
2. **CSS order** - Production CSS load order differs
3. **Hydration mismatch** - React/Tauri hydration issue

**Debug Steps:**

1. **Check if CSS is present:**
   ```bash
   # Open the built app and check console
   open src-tauri/target/release/bundle/macos/Scribe.app

   # In browser console:
   const header = document.querySelector('.editor-header');
   console.log(window.getComputedStyle(header)['-webkit-app-region']);
   // Should print: "drag"
   ```

2. **Check DOM structure:**
   ```javascript
   // In browser console
   console.log(document.querySelector('.editor-header'));
   // Should exist
   ```

3. **Check for overlays:**
   ```javascript
   // Click on the header area
   document.elementFromPoint(200, 20); // Adjust coordinates
   // Should return .editor-header or child, not something else
   ```

---

## E2E Test Coverage

**File:** `e2e/specs/window-dragging.spec.ts`

**Tests:**
- WD-01: Editor header has drag region CSS
- WD-02: Editor header is not covered by other elements
- WD-03: Breadcrumb items are interactive (no-drag)
- WD-04: Timer buttons are interactive (no-drag)
- WD-05: Sidebar header has drag region
- WD-06-10: Interactive elements remain clickable

**Running Tests:**
```bash
npm run test:e2e -- e2e/specs/window-dragging.spec.ts
```

**✅ If tests pass:** CSS is correct, likely HMR or browser cache issue
**❌ If tests fail:** Actual regression in code

---

## Debugging Checklist

When window dragging is broken:

- [ ] **Step 1:** Verify you're testing the right build
  - [ ] Development: `npm run dev`
  - [ ] Production: Open built DMG/app bundle

- [ ] **Step 2:** Check if it's HMR (dev only)
  - [ ] Refresh browser (⌘R)
  - [ ] Restart dev server
  - [ ] If fixed → HMR issue, not code regression

- [ ] **Step 3:** Run E2E tests
  ```bash
  npm run test:e2e -- e2e/specs/window-dragging.spec.ts
  ```
  - [ ] If pass → Not a code issue
  - [ ] If fail → Code regression

- [ ] **Step 4:** Check CSS in browser DevTools
  ```javascript
  const header = document.querySelector('.editor-header');
  const style = window.getComputedStyle(header);
  console.log({
    appRegion: style['-webkit-app-region'],
    zIndex: style['z-index'],
    pointerEvents: style['pointer-events']
  });
  ```

- [ ] **Step 5:** Check for overlaying elements
  ```javascript
  // Click where you expect to drag
  const clickX = 200, clickY = 20;
  const el = document.elementFromPoint(clickX, clickY);
  console.log('Element at cursor:', el.className, el.tagName);
  ```

- [ ] **Step 6:** Check git history
  ```bash
  # Recent changes to CSS
  git log --oneline --since="3 days ago" -- src/renderer/src/index.css

  # Recent changes to App.tsx
  git log --oneline --since="3 days ago" -- src/renderer/src/App.tsx
  ```

- [ ] **Step 7:** Compare with working version
  ```bash
  # Checkout last known working commit
  git log --oneline --grep="window dragging" | head -1
  git show <commit-hash>
  ```

---

## Prevention Strategies

### 1. **Protected CSS Comments**

Add prominent comments above drag region CSS:

```css
/* ===== CRITICAL: Window Dragging =====
 * DO NOT REMOVE OR MODIFY WITHOUT TESTING
 * Tests: e2e/specs/window-dragging.spec.ts
 * Docs: WINDOW-DRAGGING-DEBUG-GUIDE.md
 */
.editor-header {
  -webkit-app-region: drag;
  cursor: grab;
}
```

### 2. **Pre-commit Hook**

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
# Run window dragging tests before commit
npm run test:e2e -- e2e/specs/window-dragging.spec.ts --reporter=list

if [ $? -ne 0 ]; then
  echo "❌ Window dragging tests failed!"
  echo "Fix window dragging before committing"
  exit 1
fi
```

### 3. **Visual Regression Testing**

Take screenshots of drag regions in E2E tests:

```typescript
test('Visual: Editor header drag region visible', async ({ page }) => {
  const header = page.locator('.editor-header');
  await expect(header).toHaveScreenshot('editor-header.png');
});
```

### 4. **CSS Linting Rule**

Add to `stylelint.config.js`:

```javascript
{
  "rules": {
    "declaration-block-no-duplicate-properties": true,
    "selector-class-pattern": {
      "regex": "^(?!.*-webkit-app-region: drag.*-webkit-app-region: drag).*$",
      "message": "Duplicate -webkit-app-region detected"
    }
  }
}
```

### 5. **Documentation in Code**

Add JSDoc to components that include drag regions:

```typescript
/**
 * Editor header with breadcrumb navigation and focus timer
 *
 * **CRITICAL:** This component has -webkit-app-region: drag CSS.
 * Any changes to layout or z-index may break window dragging.
 * Test with: npm run test:e2e -- e2e/specs/window-dragging.spec.ts
 */
```

---

## Quick Fixes

### HMR Issue (Dev Environment)
```bash
# Just refresh the browser
⌘R
```

### CSS Not Loading (Production)
```bash
# Clear build cache and rebuild
rm -rf src-tauri/target/
npm run build
```

### Tests Passing But Still Broken
```bash
# Check browser cache
# In DevTools: Right-click refresh → Empty Cache and Hard Reload

# Or rebuild without cache
npm run build -- --no-cache
```

---

## Historical Context

### Sprint 29 Regression (2026-01-07)

**Commit:** `c79bc50 - fix: Restore window dragging functionality`

**Problem:** Window dragging broke after recent changes
**Cause:** `.editor-header` missing `-webkit-app-region: drag`
**Fix:** Added CSS back to index.css

**Lesson:** CSS can be accidentally removed during refactoring

### Sprint 27 Implementation (2025-12-30)

**Commit:** Original window dragging implementation

**Decision:** Use CSS-based dragging instead of JS-based `DragRegion` component
**Reason:** Simpler, more declarative, works well for header areas

---

## Related Files

| File | Purpose |
|------|---------|
| `src/renderer/src/index.css` | All drag region CSS |
| `src/renderer/src/App.tsx` | Main layout with `.editor-header` |
| `src/renderer/src/components/DragRegion.tsx` | Alternative JS-based dragging (unused) |
| `e2e/specs/window-dragging.spec.ts` | E2E tests |
| `docs/HMR-TROUBLESHOOTING.md` | HMR-related issues |

---

## Summary

Window dragging is fragile and can break easily. Use this guide to:

1. **Debug quickly** - Follow the checklist
2. **Fix correctly** - Don't just add !important
3. **Prevent regressions** - Run tests, add comments

**Golden Rule:** If you touch `.editor-header`, `.mission-control-header`, or `.dashboard-header` in CSS or JSX, run the window dragging tests immediately.

**Test Command:**
```bash
npm run test:e2e -- e2e/specs/window-dragging.spec.ts
```

If tests pass, window dragging works. If tests fail, you broke it—fix before committing.
