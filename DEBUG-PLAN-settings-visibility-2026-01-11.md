# DEBUG PLAN: Settings Visibility Issue

**Date:** 2026-01-11
**Issue:** "Icon Bar (Left Sidebar)" settings section not appearing in Tauri desktop app
**Severity:** Critical - Blocks v1.16.0 feature testing
**Status:** Investigation required before proceeding

---

## Problem Statement

Despite correct code changes to `src/renderer/src/lib/settingsSchema.ts` creating the "Icon Bar (Left Sidebar)" section (lines 459-487), this section does NOT appear in the Settings UI of the Tauri desktop app. User has confirmed this persists after:

- Multiple dev server restarts
- Cache clears (`rm -rf .vite node_modules/.vite`)
- Hard browser reloads
- Complete Tauri app quit/reopen

**Code verification confirms:**
- ✅ Settings section exists in settingsSchema.ts
- ✅ Appearance category has unique 🖼️ icon (changed from 🎨)
- ✅ appearanceCategory correctly exported
- ✅ SettingsModal iterates through sections correctly
- ✅ Dev server compiles without errors
- ✅ All changes committed to git

---

## Investigation Plan

### Phase 1: Verify What User Actually Sees (5 minutes)

**Goal:** Confirm current state of Settings UI in Tauri app

**Steps:**
1. Open Tauri desktop app
2. Click Settings (⌘,)
3. Click the 🖼️ (picture frame) icon in left sidebar
4. **Document:** Take screenshot or list exact sections visible
5. **Document:** Check if "Icon Bar (Left Sidebar)" section appears anywhere
6. **Document:** Check if old settings sections are still present

**Expected Outcome:** Confirmation of which sections are visible vs. missing

---

### Phase 2: Browser DevTools Investigation (10 minutes)

**Goal:** Inspect actual React state and DOM to see what's being rendered

**Steps:**

1. **Open browser version** (`npm run dev:vite`)
2. Open Chrome DevTools (⌘⌥I)
3. **Check localStorage:**
   ```javascript
   // In Console tab:
   localStorage.getItem('settings-storage')
   ```
   - Does it contain old settings schema?
   - Does it have `appearance.iconGlowEffect` key?

4. **Check React DevTools:**
   - Install React DevTools extension if needed
   - Navigate to Components tab
   - Find `SettingsModal` component
   - Inspect `currentCategory.sections` array
   - **Document:** How many sections are in Appearance category?
   - **Document:** Are the icon-bar settings present?

5. **Check rendered DOM:**
   - Navigate to Elements tab
   - Find `.settings-content` div
   - Count how many `.settings-section` divs are rendered
   - **Document:** Are there hidden sections (display: none)?

**Expected Outcome:** Identify if the issue is in state, rendering, or styling

---

### Phase 3: Source Code Verification (10 minutes)

**Goal:** Ensure the schema file is actually being used by the running app

**Steps:**

1. **Check if settingsSchema.ts is being imported:**
   ```bash
   grep -r "settingsSchema" src/renderer/src/components/Settings/
   ```

2. **Verify import path in SettingsModal.tsx:**
   ```bash
   head -30 src/renderer/src/components/Settings/SettingsModal.tsx | grep import
   ```
   - Confirm it imports from `../../lib/settingsSchema`

3. **Check if file was actually saved:**
   ```bash
   git diff src/renderer/src/lib/settingsSchema.ts
   ```
   - Should show "nothing to commit" (already committed)

4. **Verify the exact line numbers:**
   ```bash
   sed -n '459,487p' src/renderer/src/lib/settingsSchema.ts
   ```
   - Confirm icon-bar section exists

5. **Check export order:**
   ```bash
   grep -A 20 "export const settingsCategories" src/renderer/src/lib/settingsSchema.ts
   ```
   - Confirm appearanceCategory is in the array

**Expected Outcome:** Confirm source code matches expectations

---

### Phase 4: Build Process Investigation (15 minutes)

**Goal:** Determine if Tauri app needs full rebuild vs. dev server hot reload

**Hypothesis:** Tauri may be using a cached/built version of settingsSchema that doesn't include new changes

**Steps:**

1. **Stop all dev processes:**
   ```bash
   lsof -ti:5173 | xargs kill -9
   pkill -f "tauri dev"
   ```

2. **Full clean rebuild:**
   ```bash
   # Clean all build artifacts
   rm -rf dist
   rm -rf src-tauri/target
   rm -rf node_modules/.vite
   rm -rf .vite

   # Reinstall dependencies (if needed)
   npm install

   # Full rebuild
   npm run build
   ```

3. **Start fresh dev server:**
   ```bash
   npm run dev
   ```

4. **Test in Tauri app:**
   - Open Settings → Appearance
   - Check if icon-bar section now appears

**Expected Outcome:** If this works, it confirms Tauri caching issue

---

### Phase 5: Category ID Conflict Check (5 minutes)

**Goal:** Verify the 🖼️ icon is actually showing Appearance category, not Themes

**Steps:**

1. **Add debug logging to SettingsModal.tsx:**
   ```typescript
   // In handleCategoryClick function (around line 87):
   const handleCategoryClick = (categoryId: string) => {
     console.log('📊 Category clicked:', categoryId)
     console.log('📊 Current category:', currentCategoryId)
     setCurrentCategoryId(categoryId)
   }

   // In render (around line 176):
   console.log('📊 Rendering category:', currentCategory.id)
   console.log('📊 Sections count:', currentCategory.sections?.length)
   console.log('📊 Sections:', currentCategory.sections?.map(s => s.id))
   ```

2. **Restart dev server and check console:**
   - Click 🖼️ icon
   - **Document:** What category ID is logged?
   - **Document:** How many sections are logged?
   - **Document:** Are section IDs correct?

**Expected Outcome:** Confirm which category is actually being rendered

---

### Phase 6: Component Rendering Logic Check (10 minutes)

**Goal:** Verify SettingsModal doesn't have conditional logic skipping sections

**Steps:**

1. **Read SettingsModal.tsx section rendering code:**
   ```bash
   sed -n '176,220p' src/renderer/src/components/Settings/SettingsModal.tsx
   ```

2. **Check for conditional rendering:**
   - Are there any `if` statements filtering sections?
   - Are there any `.filter()` calls on sections array?
   - Is `collapsed` property being used to hide sections?

3. **Verify all sections are rendered:**
   ```typescript
   // Check if this pattern exists:
   {currentCategory.sections?.map((section) => (
     // Does this render ALL sections or skip some?
   ))}
   ```

**Expected Outcome:** Identify if sections are being filtered/skipped

---

## Hypotheses Ranked by Likelihood

| # | Hypothesis | Likelihood | Test Phase |
|---|------------|------------|------------|
| 1 | Tauri app using cached build, needs full rebuild | **HIGH** | Phase 4 |
| 2 | Category ID conflict - showing wrong category | **MEDIUM** | Phase 5 |
| 3 | localStorage overriding new schema | **MEDIUM** | Phase 2 |
| 4 | Section conditionally hidden by rendering logic | **LOW** | Phase 6 |
| 5 | Source file not actually saved/imported | **VERY LOW** | Phase 3 |

---

## Execution Order

**Recommended sequence:**

1. **Phase 1** (5 min) - Verify current state
2. **Phase 2** (10 min) - Browser DevTools inspection
3. **Phase 5** (5 min) - Add debug logging (quick win)
4. **Phase 4** (15 min) - Full rebuild attempt
5. **Phase 3** (10 min) - Source verification (if still failing)
6. **Phase 6** (10 min) - Component logic check (if still failing)

**Total estimated time:** 55 minutes

---

## Success Criteria

✅ **Plan succeeds if:**
- "Icon Bar (Left Sidebar)" section appears in Settings → Appearance
- Toggle for "Enable Icon Glow" is visible and functional
- Dropdown for "Glow Intensity" is visible and functional
- Settings persist after app restart

---

## Rollback Plan

If investigation reveals the changes are fundamentally incompatible with current architecture:

1. Revert all settingsSchema.ts changes
2. Implement settings as hardcoded defaults in useIconGlowEffect hook
3. Document limitation for future refactor

---

## Next Steps After Resolution

Once settings appear correctly:

1. Test all three glow intensities (subtle, medium, prominent)
2. Test enable/disable toggle
3. Test settings persistence across app restarts
4. Complete Phase 2-4 testing (hover, pulse, context menu)
5. Update CHANGELOG.md
6. Create PR to dev branch

---

## Questions for User

Before executing this plan:

1. **Are you willing to do a full rebuild** (Phase 4)? This takes ~15 minutes and stops all dev work.
2. **Can you take a screenshot** of what you currently see in Settings → Appearance?
3. **Which phases should I prioritize** if time is limited?
4. **Should I add the debug logging** (Phase 5) or is that too invasive?

---

**Ready to proceed?** Please approve this plan or suggest modifications before I begin execution.
