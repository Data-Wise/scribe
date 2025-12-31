# Callout Rendering Issue - Debug Plan

**Date:** 2025-12-31
**Issue:** Callouts (Phase 2) not rendering in Reading mode
**Status:** 🔍 Investigating

---

## Problem Summary

Callout markdown syntax (e.g., `> [!note] Title`) is not rendering as styled callout blocks. Instead:
- 0 callout elements found in DOM (`[data-callout]` or `.callout`)
- 0 blockquote elements found in DOM
- Content doesn't persist when added manually in browser mode

---

## Root Cause Analysis

### Issue #1: Missing Official Theme Stylesheet ⚠️

**Finding:** The rehype-callouts package provides official theme CSS that we're NOT importing.

**Evidence:**
```typescript
// Required import (MISSING):
import 'rehype-callouts/theme/obsidian'
```

**Location:** Should be in `HybridEditor.tsx` or `index.css`

**Official Theme Structure:**
- Uses `.callout` base class (not just `[data-callout]`)
- Uses `.callout-title-text` (we have `.callout-title-inner`)
- Uses `.callout-title-icon` for icons
- Uses `.callout-fold-icon` for collapsible callouts
- Includes color variables: `--rc-color-light`, `--rc-color-dark`
- Supports dark mode via `.dark` class

### Issue #2: CSS Class Name Mismatch

**Our CSS** (index.css:4565-4664):
```css
[data-callout] .callout-title-inner {  /* ← WRONG */
  text-transform: capitalize;
}
```

**rehype-callouts generates**:
```html
<div class="callout-title-text">  <!-- ← Should target this -->
  Title text
</div>
```

### Issue #3: Potential ReactMarkdown Compatibility

**Concern:** rehype-callouts processes `<blockquote>` elements in the HTML tree. ReactMarkdown's flow:
1. Parse markdown → AST
2. Convert to HTML (remark-rehype)
3. Run rehype plugins (rehype-raw, rehype-callouts)
4. Render components

**Question:** Does ReactMarkdown preserve blockquotes long enough for rehype-callouts to process them?

---

## Diagnostic Tests

### Test 1: Verify Plugin is Loaded
```typescript
// Check if rehype-callouts is in the plugin chain
console.log(rehypePlugins)
```

### Test 2: Test Plain Blockquotes First
```markdown
> This is a plain blockquote
> Second line
```
**Expected:** Should render as `<blockquote>` in Reading mode
**Result:** Need to test

### Test 3: Test Callout Syntax
```markdown
> [!note] Test Note
> Content here
```
**Expected:** Should transform to `<div class="callout" data-callout="note">`
**Result:** Currently 0 elements found

### Test 4: Check Browser Console for Errors
**Action:** Look for plugin errors or warnings

---

## Proposed Solutions

### Solution A: Import Official Theme (Recommended)

**Pros:**
- Uses official, battle-tested styling
- Includes dark mode support
- Handles all 12+ callout types
- Includes icon SVGs

**Cons:**
- Adds ~6KB CSS
- May conflict with our custom theme variables

**Implementation:**
```typescript
// In HybridEditor.tsx or App.tsx
import 'rehype-callouts/theme/obsidian'
```

OR in `index.css`:
```css
@import 'rehype-callouts/theme/obsidian';
```

**Then remove our custom callout CSS** (lines 4566-4664)

### Solution B: Fix Our Custom CSS

**Keep our custom CSS but fix class names:**

```css
/* Change this: */
[data-callout] .callout-title-inner {

/* To this: */
.callout .callout-title-text {

/* Add missing base class: */
.callout {
  border-left: 4px solid var(--callout-color);
  /* ... rest of styling */
}

/* Add icon support: */
.callout-title-icon {
  display: flex;
  flex-shrink: 0;
}
```

### Solution C: Hybrid Approach (Best)

1. Import official theme for structure and icons
2. Override colors with our theme variables:

```css
/* Import official theme */
@import 'rehype-callouts/theme/obsidian';

/* Override with Scribe theme variables */
[data-callout='note'] {
  --rc-color-light: var(--nexus-accent);
  --rc-color-dark: var(--nexus-accent);
}
```

---

## Action Plan

### Phase 1: Diagnosis (5 min)
1. ✅ Analyze official theme CSS structure
2. ⏳ Test if plain blockquotes render
3. ⏳ Check browser console for errors
4. ⏳ Verify plugin configuration

### Phase 2: Fix Implementation (15 min)
1. **Option 1:** Import official theme + test
2. **Option 2:** Fix custom CSS class names
3. **Option 3:** Hybrid approach (theme + overrides)

### Phase 3: Testing (10 min)
1. Test all 12 callout types
2. Test dark mode support
3. Test collapsible callouts (`> [!note]-`)
4. Test custom titles
5. Test in both browser and Tauri modes

### Phase 4: Commit & PR (5 min)
1. Update testing report
2. Commit fix with clear message
3. Create PR with "fix(callouts)" prefix

---

## Expected Outcomes

After fix:
- ✅ Callouts render with proper styling
- ✅ Icons display correctly
- ✅ All 12 callout types work
- ✅ Dark mode supported
- ✅ Browser and Tauri modes work

---

## Files to Modify

| File | Change | Reason |
|------|--------|--------|
| `HybridEditor.tsx` | Add theme import | Load official CSS |
| `index.css` | Remove/fix callout CSS | Avoid conflicts |
| `TESTING-REPORT-2025-12-30.md` | Update callout status | Document fix |

---

## References

- [rehype-callouts README](https://github.com/lin-stephanie/rehype-callouts)
- [Obsidian Callout Docs](https://help.obsidian.md/Editing+and+formatting/Callouts)
- Official theme: `node_modules/rehype-callouts/dist/themes/obsidian/index.css`

---

**Next Step:** Execute Phase 1 diagnosis tests
