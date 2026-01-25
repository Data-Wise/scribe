# Test File TypeScript Errors - Non-Blocking

**Generated:** 2026-01-24
**Status:** Documented for future cleanup
**Count:** 67 errors across 20 test files
**Impact:** Non-blocking (tests still pass, production code clean)

## Summary by Category

| Category | Count | Priority |
|----------|-------|----------|
| Unused variables (TS6133) | 24 | P3 |
| Missing type properties (TS2739, TS2741, TS2322) | 26 | P2 |
| Invalid property on type (TS2353) | 11 | P2 |
| Other (imports, comparisons) | 6 | P3 |

## Files Affected (20)

| File | Errors | Primary Issue |
|------|--------|---------------|
| ContextMenus.test.tsx | 8 | Note/Project mock missing properties |
| EditorOrchestrator.test.tsx | 6 | preferences mock incomplete |
| ExpandedIconPanel.component.test.tsx | 6 | 'folder' not in Project type |
| IconBar.component.test.tsx | 7 | 'tags' not in Note type |
| SearchPanel.test.tsx | 6 | Note mock missing properties |
| SettingsModal.test.tsx | 7 | Theme mock incomplete |
| DragRegion.test.tsx | 3 | Mock type mismatch |
| useAppViewStore.iconExpansion.test.ts | 4 | Unused destructured vars |
| ExportDialog.test.tsx | 2 | Mock type mismatch |
| ActivityBar.test.tsx | 3 | Unused mock declarations |
| CodeMirrorMultiLineLaTeX.test.tsx | 3 | Unused imports |
| EmptyState.test.tsx | 2 | Unused 'rerender' |
| Preferences.test.ts | 1 | Missing new preference fields |
| KeyboardShortcutHandler.test.tsx | 1 | SidebarTabId import location |
| GeneralSettingsTab.test.tsx | 1 | Missing beforeEach import |
| GraphView.test.tsx | 1 | Unused waitFor import |
| CodeMirrorEditor.test.tsx | 1 | Impossible string comparison |
| InboxButton.test.tsx | 1 | Unused 'container' |
| IconExpansion.e2e.test.tsx | 1 | Unused 'container' |
| ProjectSwitcher.test.tsx | 2 | Unused 'container' |
| useAppViewStore.iconExpansion.edgeCases.test.ts | 1 | Unused destructured var |

## Detailed Error List

### High Priority (P2) - Type Mismatches

These require updating mock data to match current type definitions.

#### Note Type Missing Properties

```typescript
// Error: Type missing folder, deleted_at, project_id
// Fix: Add these to mock Note objects

const mockNote: Note = {
  id: 'note-1',
  title: 'Test',
  content: 'Content',
  folder: 'inbox',          // ADD
  project_id: null,         // ADD
  created_at: Date.now(),
  updated_at: Date.now(),
  deleted_at: null,         // ADD
}
```

**Affected files:**
- ContextMenus.test.tsx (lines 20, 29)
- SearchPanel.test.tsx (lines 30, 38, 46, 872)

#### Project Type Missing Properties

```typescript
// Error: Type missing 'type' property
// Fix: Add type to mock Project objects

const mockProject: Project = {
  id: 'proj-1',
  name: 'Test Project',
  type: 'research',         // ADD (required)
  color: '#000',
  status: 'active',
  created_at: Date.now(),
  updated_at: Date.now(),
}
```

**Affected files:**
- ContextMenus.test.tsx (lines 39, 40, 41)
- SearchPanel.test.tsx (line 59) - 'academic' is not a valid ProjectType

#### UserPreferences Missing Properties

```typescript
// Error: Missing iconGlowEffect, iconGlowIntensity
// Fix: Add new v1.16 preference fields

const mockPreferences: UserPreferences = {
  // ... existing fields ...
  iconGlowEffect: true,           // ADD
  iconGlowIntensity: 'subtle',    // ADD
}
```

**Affected files:**
- Preferences.test.ts (line 123)
- EditorOrchestrator.test.tsx (lines 70, 78, 86, 93, 99, 107)

#### Theme Missing Properties

```typescript
// Error: Theme missing 'description', 'textSecondary' not in ThemeColors
// Fix: Update mock Theme objects

const mockTheme: Theme = {
  id: 'test-theme',
  name: 'Test Theme',
  description: 'A test theme',  // ADD (required)
  type: 'dark',
  colors: {
    // Remove 'textSecondary' - not in ThemeColors type
  }
}
```

**Affected files:**
- SettingsModal.test.tsx (lines 122, 138, 154, 170, 958)

#### Invalid Properties on Types

```typescript
// Error: 'folder' does not exist in type 'Project'
// Error: 'tags' does not exist in type 'Note'
// Fix: Remove these invalid properties from mocks
```

**Affected files:**
- ExpandedIconPanel.component.test.tsx (lines 223, 262, 275, 288, 317, 330)
- IconBar.component.test.tsx (lines 216, 227, 238, 563, 574, 585, 596)

### Low Priority (P3) - Unused Variables

These are minor cleanups that don't affect test functionality.

```typescript
// Pattern: Unused destructured variables
const { container } = render(<Component />)  // container unused

// Fix: Remove from destructuring or prefix with _
const { } = render(<Component />)
// or
const { container: _container } = render(<Component />)
```

**Affected files:**
- ActivityBar.test.tsx (mockProjects, mockNotes, mockHandlers)
- CodeMirrorMultiLineLaTeX.test.tsx (EditorState, EditorView, displayMode)
- ContextMenus.test.tsx (afterEach, cleanup)
- DragRegion.test.tsx (container)
- EmptyState.test.tsx (rerender x2)
- GraphView.test.tsx (waitFor)
- IconExpansion.e2e.test.tsx (container)
- InboxButton.test.tsx (container)
- ProjectSwitcher.test.tsx (container x2)
- SearchPanel.test.tsx (waitFor)
- SettingsModal.test.tsx (loadPreferences, isTauri)
- useAppViewStore tests (various destructured state vars)

### Import Fixes

```typescript
// KeyboardShortcutHandler.test.tsx line 4
// Error: SidebarTabId not exported from '../types'
// Fix: Import from '../lib/preferences' instead
import { SidebarTabId } from '../lib/preferences'

// GeneralSettingsTab.test.tsx line 43
// Error: beforeEach is not defined
// Fix: Add import from vitest
import { beforeEach, describe, it, expect, vi } from 'vitest'
```

## Recommended Fix Order

1. **Batch 1: Type updates** (~1 hour)
   - Create shared test mock factories in `testUtils.ts`
   - Add missing Note properties (folder, deleted_at, project_id)
   - Add missing Project properties (type)
   - Add missing UserPreferences properties (iconGlowEffect, iconGlowIntensity)

2. **Batch 2: Theme mocks** (~30 min)
   - Add 'description' to Theme mocks
   - Remove invalid 'textSecondary' from ThemeColors

3. **Batch 3: Remove invalid properties** (~30 min)
   - Remove 'folder' from Project mocks
   - Remove 'tags' from Note mocks

4. **Batch 4: Unused variables** (~30 min)
   - Remove or prefix unused variables
   - Fix import statements

## Why These Are Non-Blocking

1. **Tests still pass** - TypeScript errors in test files don't prevent test execution
2. **Production code is clean** - 0 TypeScript errors in src/renderer/src/components, lib, store
3. **Build succeeds** - Vite build completes successfully
4. **Runtime unaffected** - These are compile-time type checks only

## Target Sprint

**Sprint 37 Backlog Item:** Test file TypeScript cleanup (~2.5 hours)

---

*This document was auto-generated during Phase 1.2 Technical Debt Remediation (2026-01-24)*
