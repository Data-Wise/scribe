# Testing Mode Consolidation Phase 1

**Status:** ✅ Ready for Testing
**Branch:** `feat/sidebar-v2`
**Commits:**
- `c655013` - Phase 1: State Management
- `79fd71d` - Demo testing guide note

---

## 🚀 Quick Start

### Browser Mode (Recommended for Quick Testing)

```bash
# Already running at:
http://localhost:5173

# Or start manually:
npm run dev:vite
```

### Tauri Mode (Full Native App)

```bash
npm run dev
```

---

## 📝 What to Test

### Feature 1: Mode-Specific Width Memory

**Expected Behavior:** Each mode remembers its own custom width

**Test Steps:**
1. Start in Compact mode (240px default)
2. Resize sidebar to **260px** (drag the resize handle)
3. Click sidebar header to cycle to **Card mode**
4. Resize sidebar to **350px**
5. Click sidebar header to cycle to **Icon mode** (48px)
6. Click sidebar header to cycle to **Compact mode**
7. ✅ **VERIFY:** Width should restore to **260px** (not 240px default)
8. Click sidebar header to cycle to **Card mode**
9. ✅ **VERIFY:** Width should restore to **350px** (not 320px default)

**Expected Results:**
- Compact mode remembers 260px
- Card mode remembers 350px
- Icon mode always 48px (no memory needed)

---

### Feature 2: Smart Mode Persistence

**Expected Behavior:** Last expanded mode is remembered when collapsing/expanding

**Test Steps:**
1. Start in Icon mode (48px)
2. Click sidebar to expand → should go to **Compact mode** (default)
3. Click sidebar to cycle to **Card mode**
4. Click sidebar to cycle to **Icon mode** (collapse)
5. ✅ **VERIFY:** `localStorage.getItem('scribe:lastExpandedMode')` = `"card"`
6. Click sidebar to expand again
7. ✅ **VERIFY:** Should expand directly to **Card mode** (not Compact)

**Expected Results:**
- First expand → Compact (default)
- After setting Card → remembers Card
- Subsequent expands → restore last mode (Card)

---

### Feature 3: localStorage Tracking

**Expected Behavior:** All state changes persist to localStorage

**Test Steps:**
1. Open DevTools (F12)
2. Go to **Application** → **Local Storage** → `http://localhost:5173`
3. Find these keys:
   - `scribe:lastExpandedMode`
   - `scribe:compactModeWidth`
   - `scribe:cardModeWidth`
   - `scribe:lastModeChangeTimestamp`
4. Perform mode switches and resize operations
5. ✅ **VERIFY:** Values update in real-time

**Expected localStorage State:**

```json
{
  "scribe:lastExpandedMode": "card",
  "scribe:compactModeWidth": "260",
  "scribe:cardModeWidth": "350",
  "scribe:lastModeChangeTimestamp": "1736524800000"
}
```

---

## 📖 Demo Note

A comprehensive testing guide is included in the app:

**Title:** "v1.15.0: Mode Consolidation Testing"
**Location:** Inbox folder, Getting Started project
**Tags:** tutorial, phase3

The demo note includes:
- ✅ Feature explanations
- ✅ Testing checklists
- ✅ localStorage verification steps
- ✅ Upcoming features roadmap

---

## 🔍 Debugging

### React DevTools (Browser Mode)

1. Install React DevTools extension
2. Open DevTools → **Components** tab
3. Search for `useAppViewStore`
4. Inspect state:
   - `lastExpandedMode`
   - `compactModeWidth`
   - `cardModeWidth`
   - `lastModeChangeTimestamp`

### Console Logging

Add to `useAppViewStore.ts` (temporarily):

```typescript
setSidebarMode: (mode: SidebarMode) => {
  console.log('🔄 Mode change:', { mode, lastExpandedMode: get().lastExpandedMode })
  // ... rest of implementation
}

setSidebarWidth: (width: number) => {
  console.log('📏 Width change:', {
    width,
    mode: get().sidebarMode,
    compactModeWidth: get().compactModeWidth,
    cardModeWidth: get().cardModeWidth
  })
  // ... rest of implementation
}
```

---

## ✅ Success Criteria

Phase 1 is working correctly if:

- [x] Mode-specific widths persist across mode switches
- [x] Last expanded mode is remembered when collapsing/expanding
- [x] localStorage updates correctly on every state change
- [x] No console errors during mode switches
- [x] Width constraints enforced (Compact: 200-300px, Card: 320-500px)

---

## 🐛 Known Issues (Pre-existing)

These are **not** related to Phase 1:

- TypeScript errors in test files (40+ pre-existing)
- Child project identification tests (sort_order property)
- Context menus tests (missing Note properties)

---

## 🚧 Not Yet Implemented

These features are coming in future phases:

- ❌ Preset-aware cycling (Phase 2)
- ❌ 200ms debounce on rapid clicks (Phase 2)
- ❌ Universal expansion for Inbox/Smart Folders (Phase 3)
- ❌ Settings UI toggles (Phase 5)
- ❌ Preset update dialog (Phase 6)
- ❌ Mode indicator in ActivityBar (Phase 7)

---

## 📊 Performance

**Phase 1 Performance Targets:**

- localStorage write: < 1ms
- Mode switch: < 16ms (60fps)
- Width restore: < 16ms (60fps)

**Test in DevTools:**

```javascript
// Performance test
console.time('mode-switch')
useAppViewStore.getState().setSidebarMode('card')
console.timeEnd('mode-switch')
// Should be < 16ms
```

---

## 🎯 Next Steps

After validating Phase 1:

1. ✅ Confirm all tests pass
2. ✅ Report any bugs found
3. 🚀 Proceed to **Phase 2: Cycle Behavior**
   - Preset-aware cycling
   - 200ms debounce
   - Settings integration prep

---

**Happy Testing! 🎉**

For questions or bug reports, check the demo note in the app or review the spec:
- `docs/specs/SPEC-sidebar-mode-consolidation-2026-01-09.md`
