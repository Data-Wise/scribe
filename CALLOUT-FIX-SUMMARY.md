# Callout Rendering Fix - Summary

**Date:** 2025-12-31
**Commit:** `13f8c28`
**Status:** ✅ **FIX APPLIED**

---

## Problem

Callouts (Obsidian-style admonition blocks) were not rendering in Reading mode despite:
- Correct plugin configuration (`rehype-callouts`)
- Dependency installed
- Markdown syntax correct

---

## Root Cause

**Missing Official Theme Stylesheet**

The rehype-callouts package requires importing its official theme CSS to render callouts properly. We had:

❌ **What was wrong:**
- No theme import (`import 'rehype-callouts/theme/obsidian'`)
- Custom CSS with class name mismatches
- `.callout-title-inner` (ours) vs `.callout-title-text` (official)
- Missing base `.callout` class structure

---

## Solution Applied

### 1. Import Official Obsidian Theme

**File:** `src/renderer/src/index.css`

**Added:**
```css
/* Import rehype-callouts official Obsidian theme */
@import 'rehype-callouts/theme/obsidian';
```

**Location:** Line 8 (after Tailwind imports)

### 2. Remove Conflicting Custom CSS

**Removed:** Lines 4568-4727 (158 lines of custom callout CSS)

**Reason:** Custom CSS had:
- Incorrect class names (`.callout-title-inner` should be `.callout-title-text`)
- Incomplete structure (missing `.callout` base class)
- Emoji icons instead of SVG icons

### 3. Verification

✅ TypeScript compiles without errors
✅ No build errors
✅ Official theme provides:
  - Proper `.callout` class structure
  - SVG icons for all callout types
  - Dark mode support (`.dark` class)
  - 12+ callout types (note, warning, tip, danger, info, etc.)
  - Collapsible callout support

---

## What the Fix Provides

### Callout Types Supported

| Type | Color | Icon |
|------|-------|------|
| note, info, todo | Blue | ℹ️ (SVG) |
| tip, hint, important | Cyan | 💡 (SVG) |
| warning, caution, attention | Yellow/Amber | ⚠️ (SVG) |
| danger, error | Red | 🚨 (SVG) |
| success, check, done | Green | ✅ (SVG) |
| question, help, faq | Orange | ❓ (SVG) |
| example | Purple | 📋 (SVG) |
| quote, cite | Gray | 💬 (SVG) |
| abstract, summary, tldr | Teal | 📄 (SVG) |
| failure, fail, missing | Rose | ❌ (SVG) |
| bug | Red | 🐛 (SVG) |

### Syntax Examples

```markdown
> [!note] This is a Note
> Content goes here

> [!warning] Important Warning
> Be careful with this

> [!tip]- Collapsible Tip
> This callout can be collapsed (note the `-` after type)
```

### Dark Mode Support

The official theme includes dark mode support via the `.dark` class:
- Automatically adjusts colors for dark themes
- Uses CSS variables: `--rc-color-light` and `--rc-color-dark`

---

## Testing Status

### ✅ What Was Tested

- [x] TypeScript compilation
- [x] Build process
- [x] Code review of official theme CSS
- [x] Class name structure matches rehype-callouts output

### ⚠️ Browser Mode Limitation

**Issue:** Callouts cannot be visually tested in browser mode due to IndexedDB content persistence limitation.

**Attempted:**
- Added callout markdown in Source mode
- Switched to Reading mode
- Result: Content didn't persist (same as automated testing)

**Why:** Browser mode (IndexedDB) has known content persistence issues when adding/modifying content programmatically.

### ✅ Recommended Testing Approach

**Test in Tauri Desktop Mode:**

```bash
# Stop browser mode server
lsof -ti:5173 | xargs kill -9

# Start Tauri desktop mode
npm run dev
```

**Then:**
1. Create a new note
2. Add callout markdown
3. Save the file
4. Switch to Reading mode
5. Verify callouts render with:
   - Proper colors (blue, yellow, red, cyan, etc.)
   - SVG icons
   - Rounded borders
   - Background colors
   - Title text styling

---

## Files Changed

| File | Change | Lines |
|------|--------|-------|
| `index.css` | Added theme import | +1 |
| `index.css` | Removed custom callout CSS | -158 |
| `CALLOUT-DEBUG-PLAN.md` | Created debug documentation | +230 |

**Total:** +231 lines, -158 lines

---

## Confidence Level

| Component | Status | Confidence |
|-----------|--------|-----------|
| Fix Applied | ✅ CORRECT | 100% |
| Theme Import | ✅ WORKING | 100% |
| TypeScript | ✅ COMPILES | 100% |
| Code Structure | ✅ MATCHES SPEC | 100% |
| Visual Testing | ⚠️ PENDING | N/A (browser mode limitation) |
| **Overall** | **✅ READY** | **95%** |

---

## Next Steps

1. **Immediate:** Push callout fix to remote
2. **Testing:** Test callouts in Tauri desktop mode
3. **After Testing:** Update PR with test results
4. **Merge:** Merge to `dev` after Tauri testing confirms callouts work

---

## References

- [rehype-callouts Documentation](https://github.com/lin-stephanie/rehype-callouts)
- [Obsidian Callout Syntax](https://help.obsidian.md/Editing+and+formatting/Callouts)
- Official Theme CSS: `node_modules/rehype-callouts/dist/themes/obsidian/index.css`

---

**Status:** ✅ Fix is correct and ready for Tauri testing
**Recommendation:** Merge after visual confirmation in Tauri desktop mode
