# Mission Sidebar: Phase 1 Implementation Guide

**Goal:** Create `useMissionSidebarStore.ts` without breaking existing functionality.

**Duration:** 1 session (2-3 hours)

**Status:** Ready to implement

---

## Checklist

```markdown
## Phase 1: Create New Store (Non-Breaking)

### Setup
- [ ] Create `src/renderer/src/store/useMissionSidebarStore.ts`
- [ ] Add types to `src/renderer/src/types/index.ts` (if needed)
- [ ] Copy localStorage helpers from existing store

### Core Implementation
- [ ] Define `SidebarMode` type (icon | compact | card)
- [ ] Define `PinnedVault` interface
- [ ] Define `SidebarUIState` interface
- [ ] Implement `loadPersistedState()` helper
- [ ] Implement `persistState()` helper
- [ ] Create Zustand store with initial state

### State Actions
- [ ] Implement `setMode()`
- [ ] Implement `cycleMode()`
- [ ] Implement `setWidth()`
- [ ] Implement `addPinnedVault()`
- [ ] Implement `removePinnedVault()`
- [ ] Implement `reorderPinnedVaults()`
- [ ] Implement `toggleProjectExpansion()`
- [ ] Implement `setScrollPosition()`
- [ ] Implement `collapseAll()` / `expandAll()`
- [ ] Implement `resetToDefaults()`

### Migration Logic
- [ ] Add `migrateFromOldStore()` function
- [ ] Auto-migrate localStorage keys on first load
- [ ] Keep both stores in sync (temporary)

### Testing
- [ ] Write unit tests for store (useMissionSidebarStore.test.ts)
- [ ] Test mode cycling
- [ ] Test width constraints
- [ ] Test pinned vaults CRUD
- [ ] Test localStorage persistence
- [ ] Test migration from old store

### Documentation
- [ ] Add JSDoc comments to all functions
- [ ] Update CHANGELOG.md
- [ ] Add to .STATUS file
```

---

## File Structure

```
src/renderer/src/store/
├── useAppViewStore.ts          # Existing (keep for now)
├── useMissionSidebarStore.ts   # NEW - Phase 1
├── useNotesStore.ts
├── useProjectStore.ts
└── useSettingsStore.ts

tests/
└── useMissionSidebarStore.test.ts  # NEW - Phase 1
```

---

## Implementation Template

**File:** `src/renderer/src/store/useMissionSidebarStore.ts`

**Lines of code:** ~400-500

**Key sections:**
1. Type definitions (50 lines)
2. Constants (20 lines)
3. Persistence helpers (100 lines)
4. Migration logic (50 lines)
5. Zustand store (200 lines)

---

## Testing Template

**File:** `tests/useMissionSidebarStore.test.ts`

**Test cases:** 15-20

**Coverage targets:**
- Mode management: 5 tests
- Pinned vaults: 6 tests
- UI state: 4 tests
- Persistence: 3 tests
- Migration: 2 tests

---

## Integration Points (Defer to Phase 2+)

**DO NOT touch in Phase 1:**
- ❌ MissionSidebar.tsx (still uses useAppViewStore)
- ❌ Mode components (IconBarMode, CompactListMode, CardViewMode)
- ❌ Settings UI (no sidebar settings yet)

**Only create:**
- ✅ Store file
- ✅ Unit tests
- ✅ Migration logic

---

## Success Criteria

Phase 1 is complete when:
1. ✅ `useMissionSidebarStore.ts` exists and exports all actions
2. ✅ All unit tests pass (100% store coverage)
3. ✅ Migration from old store works (test with localStorage dump)
4. ✅ No breaking changes to existing UI
5. ✅ TypeScript compiles with 0 errors

---

## Next Steps After Phase 1

**Phase 2 Preview:**
- Wire CompactListMode to use new store
- Add "Pin Vault" button to ProjectContextMenu
- Render `pinnedVaults` instead of all projects
- Add visual indicator for pinned vaults (📌 icon)

**Estimated:** 1 session (3-4 hours)

---

## Common Pitfalls

### Pitfall 1: Set Serialization
**Problem:** `Set<string>` doesn't JSON.stringify() correctly.

**Solution:**
```typescript
// Before saving
const serializable = {
  ...state,
  uiState: {
    ...state.uiState,
    expandedProjects: Array.from(state.uiState.expandedProjects)
  }
}
localStorage.setItem(KEY, JSON.stringify(serializable))

// After loading
const parsed = JSON.parse(stored)
parsed.uiState.expandedProjects = new Set(parsed.uiState.expandedProjects || [])
```

### Pitfall 2: Width Auto-Adjustment
**Problem:** Switching to icon mode should force width to 48px, not keep previous width.

**Solution:**
```typescript
setMode: (mode) => {
  let newWidth = get().width

  if (mode === 'icon') {
    newWidth = SIDEBAR_WIDTHS.icon  // Force 48px
  } else if (mode === 'compact' && newWidth < SIDEBAR_WIDTHS.compact.min) {
    newWidth = SIDEBAR_WIDTHS.compact.default  // Restore to 240px
  }

  set({ mode, width: newWidth })
}
```

### Pitfall 3: Inbox Permanence
**Problem:** User tries to unpin Inbox, breaks UI.

**Solution:**
```typescript
removePinnedVault: (id) => {
  const vault = get().pinnedVaults.find(v => v.id === id)
  if (vault?.isPermanent) {
    throw new Error('Cannot unpin Inbox (permanent vault)')
  }
  // ... proceed with removal
}
```

### Pitfall 4: Migration Timing
**Problem:** Migration runs every time, not just on first load.

**Solution:**
```typescript
const migrateFromOldStore = (): Partial<PersistedState> => {
  // Only migrate if new store is empty AND old store exists
  const hasNewStore = localStorage.getItem('scribe:missionSidebar')
  if (hasNewStore) return {}  // Already migrated

  const oldMode = localStorage.getItem('scribe:sidebarMode')
  if (!oldMode) return {}  // Nothing to migrate

  // ... perform migration
}
```

---

## Example Test (Copy-Paste Ready)

```typescript
import { renderHook, act } from '@testing-library/react'
import { useMissionSidebarStore } from '../useMissionSidebarStore'

describe('useMissionSidebarStore - Mode Management', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('defaults to compact mode', () => {
    const { result } = renderHook(() => useMissionSidebarStore())
    expect(result.current.mode).toBe('compact')
  })

  it('cycles through modes in order', () => {
    const { result } = renderHook(() => useMissionSidebarStore())

    act(() => result.current.cycleMode())
    expect(result.current.mode).toBe('card')

    act(() => result.current.cycleMode())
    expect(result.current.mode).toBe('icon')

    act(() => result.current.cycleMode())
    expect(result.current.mode).toBe('compact')
  })

  it('auto-adjusts width when switching to icon mode', () => {
    const { result } = renderHook(() => useMissionSidebarStore())

    act(() => result.current.setMode('icon'))

    expect(result.current.mode).toBe('icon')
    expect(result.current.width).toBe(48)
  })

  it('restores custom width when switching from icon to compact', () => {
    const { result } = renderHook(() => useMissionSidebarStore())

    // Set custom width in compact mode
    act(() => {
      result.current.setMode('compact')
      result.current.setWidth(280)
    })

    // Switch to icon (width forced to 48)
    act(() => result.current.setMode('icon'))
    expect(result.current.width).toBe(48)

    // Switch back to compact (should restore 280)
    act(() => result.current.setMode('compact'))
    expect(result.current.width).toBe(280)
  })
})
```

---

## Git Workflow for Phase 1

```bash
# Current branch: feat/sidebar-v2 (from worktree)
cd ~/.git-worktrees/scribe/sidebar-v2

# Create store file
touch src/renderer/src/store/useMissionSidebarStore.ts

# Create test file
touch tests/useMissionSidebarStore.test.ts

# Implement store (2 hours)
# ... code ...

# Run tests
npm run test -- useMissionSidebarStore

# Commit when all tests pass
git add src/renderer/src/store/useMissionSidebarStore.ts
git add tests/useMissionSidebarStore.test.ts
git commit -m "feat(sidebar): Phase 1 - Create useMissionSidebarStore

- Add useMissionSidebarStore.ts with full state management
- Implement pinned vaults, expanded projects, scroll position
- Add localStorage persistence with Set serialization
- Add migration from old useAppViewStore sidebar state
- Add 15 unit tests with 100% store coverage

Ref: ARCHITECTURE-mission-sidebar.md Phase 1"

# Push to remote
git push origin feat/sidebar-v2
```

---

## Time Breakdown

| Task | Duration |
|------|----------|
| Create store skeleton | 30 min |
| Implement mode/width actions | 20 min |
| Implement pinned vaults CRUD | 30 min |
| Implement UI state actions | 20 min |
| Add persistence helpers | 20 min |
| Add migration logic | 15 min |
| Write unit tests | 45 min |
| Fix test failures | 15 min |
| Documentation & commit | 10 min |
| **Total** | **3 hours** |

---

## Ready to Start?

**Prerequisites:**
- ✅ Architecture reviewed and approved
- ✅ Current branch: `feat/sidebar-v2`
- ✅ Tests passing: `npm run test`
- ✅ TypeScript clean: `npm run typecheck`

**Command to begin:**
```bash
cd ~/.git-worktrees/scribe/sidebar-v2
code src/renderer/src/store/useMissionSidebarStore.ts  # Create file in VSCode
```

**When stuck:** Refer to `ARCHITECTURE-mission-sidebar.md` Section 1.1 for full store implementation.

---

**Phase 1 Status:** ⏳ Ready to implement
**Next Review:** After unit tests pass
