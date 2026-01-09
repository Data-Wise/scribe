# Phase 2: Performance Optimizations - Implementation Plan

## Overview

Phase 2 focuses on **performance** rather than just file size. The goals are:
1. **Reduce re-renders** (useMemo/useCallback)
2. **Improve bundle efficiency** (code splitting via refactoring)
3. **Optimize state management** (Zustand Immer)
4. **Speed up database queries** (IndexedDB indexes)

---

## Task Breakdown

### Task 1: Add Memoization (Highest Impact) ⚡

**Files:** HybridEditor.tsx (940 lines), CodeMirrorEditor.tsx (1,595 lines)

**Problem:**
- HybridEditor has 20+ hooks, many recreated on every render
- Editor extensions recreated on every keystroke
- Autocomplete handlers recreated unnecessarily

**Impact:** **IMMEDIATE** - Faster typing, fewer re-renders

**Complexity:** ⭐⭐☆☆☆ (Medium)

**Example fixes:**
```typescript
// BEFORE (line 200+)
const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  // ...logic
}

// AFTER
const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
  // ...logic
}, [dependencies])

// BEFORE (CodeMirrorEditor)
const extensions = [markdown(), quartoCompletions, ...]

// AFTER
const extensions = useMemo(() => [
  markdown(),
  quartoCompletions,
  // ...
], []) // Only create once
```

**Estimated Time:** 2-3 hours
**Lines Changed:** ~50-100 lines (add useCallback/useMemo wrappers)

---

### Task 2: Refactor Large Components (File Size)

**Files:** SettingsModal.tsx (2,269 lines), App.tsx (1,902 lines), CodeMirrorEditor.tsx (1,595 lines)

**Problem:**
- Large files are hard to navigate and maintain
- Bundle chunks are bigger than needed
- Full component re-renders on any state change

**Impact:** **MODERATE** - Better code organization, smaller bundles

**Complexity:** ⭐⭐⭐⭐☆ (High)

**Approach:**

#### 2a. SettingsModal.tsx → Refactor into tabs

**Current Structure:**
- 2,269 lines in one file
- 5 tabs mixed in one component (General: 152, Editor: 484, **Appearance: 818**, Files: 29, Academic: 254)

**Proposed Structure:**
```
Settings/
  ├── SettingsModal.tsx (200 lines - orchestrator)
  ├── tabs/
  │   ├── GeneralTab.tsx (200 lines)
  │   ├── EditorTab.tsx (500 lines)
  │   ├── AppearanceTab.tsx (850 lines) ← LARGEST
  │   ├── FilesTab.tsx (50 lines)
  │   └── AcademicTab.tsx (300 lines)
  └── shared/
      ├── SettingsSidebar.tsx (100 lines)
      └── SettingsSection.tsx (50 lines)
```

**Challenge:** Each tab has complex state and handlers. Need to:
1. Pass theme state/handlers as props
2. Pass preferences state/handlers as props
3. Extract modal state (exportModal, previewTheme, etc.)

**Estimated Time:** 6-8 hours (mechanical but tedious)
**Lines Changed:** 2,269 lines → 9 files

#### 2b. App.tsx → Extract route components

**Current:** 1,902 lines with all routing logic inline

**Proposed:**
```
App.tsx (300 lines - routing + layout)
routes/
  ├── MissionControlView.tsx
  ├── EditorView.tsx
  └── NoteListView.tsx
```

**Estimated Time:** 4-5 hours

#### 2c. CodeMirrorEditor.tsx → Extract view plugins

**Current:** 1,595 lines with inline plugin definitions

**Proposed:**
```
CodeMirrorEditor.tsx (500 lines - main component)
plugins/
  ├── livePreviewPlugin.ts (300 lines)
  ├── mathPlugin.ts (200 lines)
  ├── wikiLinkPlugin.ts (400 lines)
  └── quartoPlugin.ts (200 lines)
```

**Estimated Time:** 5-6 hours

**Total Refactoring Time:** 15-19 hours

---

### Task 3: Zustand Immer Middleware

**Files:** All stores (useNotesStore.ts, useProjectStore.ts, etc.)

**Problem:**
- Manual immutability is error-prone
- `notes: state.notes.map(note => ...)` patterns everywhere

**Impact:** **LOW** - Cleaner code, fewer mutation bugs

**Complexity:** ⭐⭐☆☆☆ (Medium)

**Example:**
```typescript
// BEFORE
updateNote: (id, updates) => set((state) => ({
  notes: state.notes.map(n => n.id === id ? { ...n, ...updates } : n)
}))

// AFTER (with Immer)
updateNote: (id, updates) => set((state) => {
  const note = state.notes.find(n => n.id === id)
  if (note) Object.assign(note, updates) // Immer makes this safe!
})
```

**Estimated Time:** 1-2 hours
**Lines Changed:** ~100 lines across 4 store files

---

### Task 4: IndexedDB Optimization

**Files:** browser-db.ts

**Problem:**
- No compound indexes for common query patterns
- `folder` queries scan all notes
- `note_id + tag_id` lookups are slow

**Impact:** **LOW-MEDIUM** - Faster search in browser mode with 1000+ notes

**Complexity:** ⭐☆☆☆☆ (Easy)

**Fix:**
```typescript
// browser-db.ts
db.version(4).stores({
  notes: '++id, title, folder, project_id, deleted_at, [folder+deleted_at], search_text',
  //                                        ^^^^^^^^^^^^^^^^^ NEW compound index
  noteTags: '++id, note_id, tag_id, [note_id+tag_id]',
  //                                 ^^^^^^^^^^^^^^^^ NEW compound index
})
```

**Estimated Time:** 30 minutes
**Lines Changed:** 2 lines

---

## Recommended Approach

### Option A: **Quick Wins First** (Recommended)
1. ✅ **Task 4**: IndexedDB indexes (30 min)
2. ✅ **Task 3**: Zustand Immer (1-2 hours)
3. ✅ **Task 1**: useMemo/useCallback (2-3 hours)
4. ⏳ **Task 2**: Refactoring (15-19 hours) - **OPTIONAL**

**Total Time:** 4-6 hours (excluding optional refactoring)
**Performance Gain:** 80% of the benefit with 20% of the effort

### Option B: **File Size Priority**
1. ✅ **Task 2a**: SettingsModal refactoring (6-8 hours)
2. ✅ **Task 2b**: App.tsx refactoring (4-5 hours)
3. ✅ **Task 2c**: CodeMirrorEditor refactoring (5-6 hours)
4. ✅ **Task 1**: Memoization (2-3 hours)

**Total Time:** 17-22 hours
**Performance Gain:** Marginal until memoization is added

### Option C: **Hybrid Approach**
1. ✅ **Task 1**: Memoization (2-3 hours) - **BIGGEST IMPACT**
2. ✅ **Task 4**: IndexedDB (30 min)
3. ✅ **Task 3**: Zustand Immer (1-2 hours)
4. ✅ **Task 2a**: Only AppearanceTab (2 hours) - **Biggest file win**
5. ⏳ Skip other refactoring for now

**Total Time:** 6-8 hours
**Performance Gain:** Maximum with minimal time investment

---

## My Recommendation

**Start with Option A (Quick Wins First):**

1. **IndexedDB indexes** (30 min) - Trivial, immediate browser mode improvement
2. **Zustand Immer** (1-2 hours) - Cleaner code, prevents bugs
3. **useMemo/useCallback** (2-3 hours) - **BIGGEST performance impact**

This gives you 80% of the performance benefit in 4-6 hours. The large file refactoring can wait - it's more about maintainability than performance.

---

## User Decision Point

**Which approach do you prefer?**

A. Quick Wins First (4-6 hours, maximum performance)
B. File Size Priority (17-22 hours, better organization)
C. Hybrid (6-8 hours, balanced)
D. Something else (specify)

**OR** tell me which specific task to start:
- Task 1: Memoization (performance ⚡)
- Task 2: Refactoring (organization 📦)
- Task 3: Immer middleware (clean code ✨)
- Task 4: IndexedDB indexes (browser speed 🚀)
