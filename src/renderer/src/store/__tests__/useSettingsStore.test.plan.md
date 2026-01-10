# useSettingsStore Test Plan

**Status:** Planned (not yet implemented)
**Priority:** P0 (Critical for production quality)
**Estimated Effort:** 3-4 hours
**Target Coverage:** 80%+

## Store Overview

- **File:** `src/renderer/src/store/useSettingsStore.ts`
- **Lines:** 474 lines
- **Complexity:** High (settings CRUD, Quick Actions, fuzzy search, import/export)
- **Dependencies:** Fuse.js (fuzzy search), localStorage

## Test Coverage Areas

### 1. Settings CRUD Operations (8 tests)
- [ ] Update single setting and persist to localStorage
- [ ] Update multiple settings sequentially
- [ ] Reset all settings to defaults
- [ ] Reset also clears Quick Actions to defaults
- [ ] Handle invalid setting IDs gracefully
- [ ] Persist settings on every update
- [ ] Handle localStorage errors when saving
- [ ] Handle localStorage errors when loading

### 2. Settings Search (6 tests)
- [ ] Return empty array for empty query
- [ ] Return empty array for whitespace-only query
- [ ] Search by setting label (highest weight)
- [ ] Search by description (medium weight)
- [ ] Search by breadcrumb (lowest weight)
- [ ] Return results sorted by relevance score
- [ ] Fuzzy matching (typos, partial matches)

**Note:** Search requires mocking `require('../lib/settingsSchema')` which returns `settingsCategories`

### 3. Settings Import/Export (6 tests)
- [ ] Export settings as JSON with version
- [ ] Export includes Quick Actions
- [ ] Import valid settings JSON
- [ ] Import only settings (no Quick Actions)
- [ ] Import only Quick Actions (no settings)
- [ ] Throw error for invalid JSON format
- [ ] Handle import errors gracefully

### 4. UI State Management (7 tests)
- [ ] Set active category
- [ ] Open settings with default category
- [ ] Open settings with specific category
- [ ] Close settings
- [ ] Set search query
- [ ] Toggle section collapse (add to Set)
- [ ] Toggle section collapse (remove from Set)
- [ ] Persist collapsed sections to localStorage

### 5. Quick Actions - CRUD (10 tests)
- [ ] Load default Quick Actions on init
- [ ] Add custom Quick Action
- [ ] Add custom action with generated ID and order
- [ ] Throw error when adding 11th action (max 10)
- [ ] Remove custom Quick Action
- [ ] Throw error when removing default action
- [ ] Update Quick Action order on removal
- [ ] Toggle Quick Action enabled/disabled
- [ ] Update Quick Action prompt
- [ ] Update Quick Action model (claude/gemini)

### 6. Quick Actions - Reordering (5 tests)
- [ ] Reorder Quick Actions (drag and drop)
- [ ] Update order property after reordering
- [ ] Persist reordered actions to localStorage
- [ ] Handle edge case: reorder to same position
- [ ] Handle edge case: reorder first to last

### 7. Quick Actions - Shortcuts (4 tests)
- [ ] Assign shortcut to Quick Action
- [ ] Clear existing shortcut when reassigning
- [ ] Assign same shortcut to different action (clears previous)
- [ ] Persist shortcuts to localStorage

### 8. localStorage Persistence (6 tests)
- [ ] Load persisted settings on init
- [ ] Load persisted Quick Actions on init
- [ ] Load persisted collapsed sections on init
- [ ] Fallback to defaults when localStorage is empty
- [ ] Fallback to defaults when localStorage has invalid JSON
- [ ] Handle localStorage.getItem errors gracefully

### 9. Initialize Method (3 tests)
- [ ] Load all persisted data on initialize()
- [ ] Set state with loaded data
- [ ] Handle async initialization properly

## Test Patterns to Use

Based on useAppViewStore test suite:

```typescript
describe('useSettingsStore', () => {
  let localStorageMock: Record<string, string>

  beforeEach(() => {
    // Mock localStorage FIRST
    localStorageMock = {}
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key]
      }),
      clear: vi.fn(() => { localStorageMock = {} }),
      key: vi.fn(),
      length: 0
    } as Storage

    // Reset store state
    useSettingsStore.setState({
      settings: {},
      activeCategory: 'editor',
      searchQuery: '',
      collapsedSections: new Set(),
      isOpen: false,
      quickActions: DEFAULT_QUICK_ACTIONS
    })

    // Clear mock calls
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Tests here...
})
```

## Special Considerations

### 1. Mocking settingsSchema
The `searchSettings` function requires mocking:
```typescript
vi.mock('../lib/settingsSchema', () => ({
  settingsCategories: [
    {
      id: 'editor',
      label: 'Editor',
      sections: [
        {
          id: 'general',
          title: 'General',
          settings: [
            { id: 'fontSize', label: 'Font Size', description: 'Editor font size' }
          ]
        }
      ]
    }
  ]
}))
```

### 2. Fuse.js Integration
- Search tests require valid mock data for Fuse.js
- Test fuzzy matching behavior (typos, partial matches)
- Verify score-based sorting

### 3. Set Handling
- `collapsedSections` is a Set, not Array
- Convert to Array for localStorage persistence
- Convert back to Set on load

### 4. Quick Actions Order Property
- `order` must be updated when:
  - Reordering actions
  - Removing actions
  - Adding new actions
- Always sequential: 0, 1, 2, 3...

## Estimated Test Count

| Category | Tests |
|----------|-------|
| Settings CRUD | 8 |
| Search | 6 |
| Import/Export | 6 |
| UI State | 7 |
| Quick Actions CRUD | 10 |
| Quick Actions Reordering | 5 |
| Quick Actions Shortcuts | 4 |
| localStorage | 6 |
| Initialize | 3 |
| **Total** | **55 tests** |

## Test File Structure

```
src/renderer/src/store/__tests__/
├── useAppViewStore.test.ts     (1,030 lines, 54 tests) ✅ COMPLETE
└── useSettingsStore.test.ts    (est. 1,100 lines, 55 tests) 📋 PLANNED
```

## Success Criteria

- [ ] All 55 tests passing (100%)
- [ ] Coverage: 80%+ lines, 80%+ branches
- [ ] localStorage errors handled gracefully
- [ ] Set type properly tested (add/remove)
- [ ] Quick Actions max limit enforced (10)
- [ ] Default actions cannot be removed
- [ ] Shortcut reassignment works correctly
- [ ] Import/export round-trip works
- [ ] Search returns relevant results

## Next Steps

When implementing:
1. Copy test patterns from useAppViewStore.test.ts
2. Create mock settingsSchema module
3. Test each category independently
4. Verify localStorage persistence for each action
5. Test error handling for all edge cases
6. Run coverage report to verify 80%+ target
