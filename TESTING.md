# Testing Guide

**Project:** Scribe v1.14+
**Test Framework:** Vitest + @testing-library/react
**Last Updated:** 2026-01-10

## Overview

This guide documents testing patterns and best practices for Scribe, based on comprehensive test suites developed during Sprint 35.

**Current Test Coverage:**
- **Unit Tests:** 2,344/2,345 passing (99.96%)
- **Store Tests:** useAppViewStore (54/54 tests, ~90% coverage)
- **E2E Tests:** Deferred (CodeMirror integration complexity)

## Table of Contents

1. [Test Setup Patterns](#test-setup-patterns)
2. [Zustand Store Testing](#zustand-store-testing)
3. [localStorage Mocking](#localstorage-mocking)
4. [React Testing Library Patterns](#react-testing-library-patterns)
5. [Common Pitfalls](#common-pitfalls)
6. [Running Tests](#running-tests)
7. [Coverage Reporting](#coverage-reporting)

---

## Test Setup Patterns

### Standard Test Structure

```typescript
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useYourStore } from '../useYourStore'

describe('useYourStore', () => {
  let localStorageMock: Record<string, string>

  beforeEach(() => {
    // 1. Mock localStorage FIRST (before any store operations)
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

    // 2. Reset store state using setState
    useYourStore.setState({
      // Reset to initial/default state
    })

    // 3. Clear mock calls from setup
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Tests here...
})
```

**Key Principles:**
1. Mock localStorage **before** store operations
2. Use `setState()` for test isolation
3. Clear mocks to avoid cross-test pollution
4. Restore mocks in `afterEach`

---

## Zustand Store Testing

### Test Isolation with setState

**❌ Bad:** Don't rely on store cleanup between tests
```typescript
// Tests will interfere with each other!
it('test 1', () => {
  const { result } = renderHook(() => useStore())
  // Modifies store state...
})

it('test 2', () => {
  const { result } = renderHook(() => useStore())
  // Previous test state still present!
})
```

**✅ Good:** Reset store in beforeEach
```typescript
beforeEach(() => {
  useAppViewStore.setState({
    sidebarMode: 'compact',
    sidebarWidth: SIDEBAR_WIDTHS.compact.default,
    openTabs: [MISSION_CONTROL_TAB],
    activeTabId: MISSION_CONTROL_TAB_ID,
    closedTabsHistory: [],
    lastActiveNoteId: null
  })
  vi.clearAllMocks()
})
```

### Testing State Mutations

**Pattern:** Use `act()` for state updates, verify both state and side effects

```typescript
it('should update setting and persist to localStorage', () => {
  const { result } = renderHook(() => useSettingsStore())

  act(() => {
    result.current.updateSetting('fontSize', 16)
  })

  // Verify state change
  expect(result.current.settings.fontSize).toBe(16)

  // Verify persistence
  expect(localStorage.setItem).toHaveBeenCalledWith(
    'scribe:settings',
    expect.stringContaining('"fontSize":16')
  )
})
```

### Testing Complex Operations

**Pattern:** Split complex operations into separate `act()` calls

```typescript
it('should select previous tab when closing active tab', () => {
  const { result } = renderHook(() => useAppViewStore())

  let tabId1: string = ''
  let tabId2: string = ''

  // Step 1: Open first tab
  act(() => {
    tabId1 = result.current.openTab({
      type: 'note',
      noteId: 'note-1',
      title: 'Note 1',
      isPinned: false
    })
  })

  // Step 2: Open second tab
  act(() => {
    tabId2 = result.current.openTab({
      type: 'note',
      noteId: 'note-2',
      title: 'Note 2',
      isPinned: false
    })
  })

  // Step 3: Close second tab
  act(() => {
    result.current.closeTab(tabId2)
  })

  // Verify result
  expect(result.current.activeTabId).toBe(tabId1)
})
```

**Why?** Each `act()` ensures state updates complete before the next operation.

---

## localStorage Mocking

### Basic Mock Setup

```typescript
let localStorageMock: Record<string, string>

beforeEach(() => {
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
})
```

### Testing localStorage Persistence

**Pattern:** Verify both the call and the value

```typescript
it('should persist sidebar width to localStorage', () => {
  const { result } = renderHook(() => useAppViewStore())

  act(() => {
    result.current.setSidebarMode('card') // card mode allows wider widths
    result.current.setSidebarWidth(350)
  })

  // Verify call was made
  expect(localStorage.setItem).toHaveBeenCalledWith('scribe:sidebarWidth', '350')

  // Verify value is actually stored
  expect(localStorageMock['scribe:sidebarWidth']).toBe('350')
})
```

### Testing localStorage Error Handling

```typescript
it('should handle localStorage errors gracefully when saving', () => {
  const { result } = renderHook(() => useAppViewStore())

  // Mock localStorage.setItem to throw
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Storage full')
  })

  act(() => {
    // Should not throw, just fail silently
    result.current.setSidebarMode('card')
  })

  // State should still update even if persistence fails
  expect(result.current.sidebarMode).toBe('card')
})
```

### Testing localStorage Loading

```typescript
it('should load persisted settings on init', () => {
  // Pre-populate localStorage
  localStorageMock['scribe:settings'] = JSON.stringify({ fontSize: 18 })

  const { result } = renderHook(() => useSettingsStore())

  // Should load from localStorage
  expect(result.current.settings.fontSize).toBe(18)
})
```

---

## React Testing Library Patterns

### Dual Verification Pattern

**Always verify BOTH state changes AND side effects:**

```typescript
it('should toggle Quick Action and persist', () => {
  const { result } = renderHook(() => useSettingsStore())

  act(() => {
    result.current.toggleQuickAction('improve', false)
  })

  // 1. Verify state change
  const action = result.current.quickActions.find(a => a.id === 'improve')
  expect(action?.enabled).toBe(false)

  // 2. Verify persistence
  expect(localStorage.setItem).toHaveBeenCalledWith(
    'scribe:quickActions',
    expect.any(String)
  )

  // 3. Verify persisted value (optional, but thorough)
  const stored = JSON.parse(localStorageMock['scribe:quickActions'])
  const storedAction = stored.find((a: any) => a.id === 'improve')
  expect(storedAction.enabled).toBe(false)
})
```

### Testing Arrays and Collections

```typescript
it('should limit closed tabs history to 10 items', () => {
  const { result } = renderHook(() => useAppViewStore())

  act(() => {
    // Open and close 15 tabs
    for (let i = 1; i <= 15; i++) {
      const tabId = result.current.openTab({
        type: 'note',
        noteId: `note-${i}`,
        title: `Note ${i}`,
        isPinned: false
      })
      result.current.closeTab(tabId)
    }
  })

  // Should only keep last 10
  expect(result.current.closedTabsHistory).toHaveLength(10)

  // Most recent should be first (LIFO)
  expect(result.current.closedTabsHistory[0].noteId).toBe('note-15')
  expect(result.current.closedTabsHistory[9].noteId).toBe('note-6')
})
```

### Testing Sets

```typescript
it('should toggle section collapse (add to Set)', () => {
  const { result } = renderHook(() => useSettingsStore())

  act(() => {
    result.current.toggleSection('editor-general')
  })

  // Verify Set contains item
  expect(result.current.collapsedSections.has('editor-general')).toBe(true)

  // Verify persisted as Array
  expect(localStorage.setItem).toHaveBeenCalledWith(
    'scribe:collapsedSections',
    JSON.stringify(['editor-general'])
  )
})

it('should toggle section collapse (remove from Set)', () => {
  const { result } = renderHook(() => useSettingsStore())

  // Add to Set first
  act(() => {
    result.current.toggleSection('editor-general')
  })

  // Remove from Set
  act(() => {
    result.current.toggleSection('editor-general')
  })

  // Verify Set is empty
  expect(result.current.collapsedSections.has('editor-general')).toBe(false)
  expect(result.current.collapsedSections.size).toBe(0)
})
```

---

## Common Pitfalls

### ❌ Pitfall 1: Not Clearing Mocks

```typescript
// Bad: Mock calls accumulate across tests
it('test 1', () => {
  act(() => result.current.updateSetting('a', 1))
  expect(localStorage.setItem).toHaveBeenCalledTimes(1) // ✅ Passes
})

it('test 2', () => {
  act(() => result.current.updateSetting('b', 2))
  expect(localStorage.setItem).toHaveBeenCalledTimes(1) // ❌ Fails! Count is 2
})
```

**Fix:** Clear mocks in `beforeEach`
```typescript
beforeEach(() => {
  vi.clearAllMocks() // ✅ Resets all mock call counts
})
```

### ❌ Pitfall 2: Testing Implementation Instead of Behavior

```typescript
// Bad: Testing internal state structure
it('should have correct internal state shape', () => {
  expect(result.current._internalState).toEqual({ /* ... */ })
})

// Good: Testing observable behavior
it('should open tab and make it active', () => {
  const tabId = result.current.openTab({ /* ... */ })
  expect(result.current.activeTabId).toBe(tabId)
})
```

### ❌ Pitfall 3: Not Using act() for State Updates

```typescript
// Bad: State updates outside act()
it('should update state', () => {
  result.current.updateSetting('fontSize', 16) // ❌ Warning!
  expect(result.current.settings.fontSize).toBe(16)
})

// Good: Wrap in act()
it('should update state', () => {
  act(() => {
    result.current.updateSetting('fontSize', 16) // ✅ No warning
  })
  expect(result.current.settings.fontSize).toBe(16)
})
```

### ❌ Pitfall 4: Batching Unrelated Operations in One act()

```typescript
// Bad: Makes debugging harder when test fails
act(() => {
  result.current.openTab(tab1)
  result.current.openTab(tab2)
  result.current.closeTab(tab1)
  result.current.pinTab(tab2)
  result.current.reorderTabs(0, 1)
})

// Good: Split into logical steps
act(() => {
  result.current.openTab(tab1)
})
act(() => {
  result.current.openTab(tab2)
})
act(() => {
  result.current.closeTab(tab1)
})
// Easier to identify which operation failed
```

---

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test -- useAppViewStore.test.ts
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests Without Watch
```bash
npm test -- --run
```

---

## Coverage Reporting

### Generate Coverage Report
```bash
npm run test:coverage
```

**Output:**
- Terminal: Summary by file
- HTML: `coverage/index.html` (detailed interactive report)

### Coverage Thresholds

**Current targets (vitest.config.ts):**
```typescript
coverage: {
  lines: 55,
  functions: 50,
  branches: 55,
  statements: 55
}
```

**Sprint 35 Goals:**
- Increase to 60/55/60/60
- Focus on critical stores (useAppViewStore, useSettingsStore)

### View HTML Report
```bash
open coverage/index.html
```

---

## Test Examples by Type

### 1. Testing State Initialization

```typescript
describe('Initial State', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAppViewStore())

    expect(result.current.sidebarMode).toBe('compact')
    expect(result.current.sidebarWidth).toBe(SIDEBAR_WIDTHS.compact.default)
    expect(result.current.openTabs).toHaveLength(1)
    expect(result.current.openTabs[0].id).toBe(MISSION_CONTROL_TAB_ID)
  })
})
```

### 2. Testing CRUD Operations

```typescript
describe('Settings CRUD', () => {
  it('should create/update setting', () => {
    const { result } = renderHook(() => useSettingsStore())

    act(() => {
      result.current.updateSetting('theme', 'dark')
    })

    expect(result.current.settings.theme).toBe('dark')
  })

  it('should delete setting (reset to default)', () => {
    const { result } = renderHook(() => useSettingsStore())

    act(() => {
      result.current.updateSetting('theme', 'dark')
      result.current.resetToDefaults()
    })

    expect(result.current.settings).toEqual({})
  })
})
```

### 3. Testing Validation and Constraints

```typescript
describe('Constraints', () => {
  it('should enforce maximum Quick Actions limit', () => {
    const { result } = renderHook(() => useSettingsStore())

    act(() => {
      // Add 10 actions (5 default + 5 custom)
      for (let i = 0; i < 5; i++) {
        result.current.addCustomQuickAction({
          emoji: '🎯',
          label: `Custom ${i}`,
          prompt: 'Test',
          enabled: true,
          model: 'claude',
          isCustom: true
        })
      }
    })

    expect(result.current.quickActions).toHaveLength(10)

    // Try to add 11th action
    expect(() => {
      act(() => {
        result.current.addCustomQuickAction({
          emoji: '🎯',
          label: 'Too Many',
          prompt: 'Test',
          enabled: true,
          model: 'claude',
          isCustom: true
        })
      })
    }).toThrow('Maximum 10 Quick Actions allowed')
  })
})
```

### 4. Testing Import/Export

```typescript
describe('Import/Export', () => {
  it('should export settings as JSON', () => {
    const { result } = renderHook(() => useSettingsStore())

    act(() => {
      result.current.updateSetting('theme', 'dark')
    })

    const exported = result.current.exportSettings()
    const parsed = JSON.parse(exported)

    expect(parsed.settings.theme).toBe('dark')
    expect(parsed.version).toBe('1.7.0')
    expect(parsed.quickActions).toBeDefined()
  })

  it('should import valid settings', () => {
    const { result } = renderHook(() => useSettingsStore())

    const importData = JSON.stringify({
      settings: { theme: 'light', fontSize: 14 },
      quickActions: [],
      version: '1.7.0'
    })

    act(() => {
      result.current.importSettings(importData)
    })

    expect(result.current.settings.theme).toBe('light')
    expect(result.current.settings.fontSize).toBe(14)
  })

  it('should throw error for invalid JSON', () => {
    const { result } = renderHook(() => useSettingsStore())

    expect(() => {
      act(() => {
        result.current.importSettings('invalid json')
      })
    }).toThrow('Invalid settings file format')
  })
})
```

---

## Best Practices Summary

✅ **DO:**
- Mock localStorage before store operations
- Use `setState()` for test isolation
- Clear mocks in `beforeEach`
- Use `act()` for all state updates
- Split complex operations into separate `act()` calls
- Test both state AND side effects (dual verification)
- Test error handling and edge cases
- Use descriptive test names
- Group related tests with `describe` blocks

❌ **DON'T:**
- Rely on test execution order
- Test implementation details
- Skip `act()` wrappers
- Forget to clear mocks between tests
- Test too many things in one test
- Ignore localStorage persistence
- Skip error handling tests

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Zustand Testing Guide](https://github.com/pmndrs/zustand#testing)
- [COVERAGE_TRACKING.md](./COVERAGE_TRACKING.md) - Coverage goals and tracking

---

## Test Suites Reference

### Completed Test Suites

#### useAppViewStore (54 tests, ~90% coverage)
- **File:** `src/renderer/src/store/__tests__/useAppViewStore.test.ts`
- **Lines:** 1,030 lines
- **Status:** ✅ Complete (54/54 passing)
- **Coverage:** Initial State (6), Sidebar Modes (4), Width Constraints (7), Tab CRUD (22), Session Tracking (4), Error Handling (2), Enforcement (2)

### Planned Test Suites

#### useSettingsStore (55 tests planned)
- **File:** `src/renderer/src/store/__tests__/useSettingsStore.test.plan.md`
- **Lines:** ~1,100 lines estimated
- **Status:** 📋 Planned (postponed)
- **Coverage:** Settings CRUD (8), Search (6), Import/Export (6), UI State (7), Quick Actions CRUD (10), Reordering (5), Shortcuts (4), localStorage (6), Initialize (3)

---

**Last Updated:** 2026-01-10
**Contributors:** Claude Sonnet 4.5, DT
**Sprint:** 35 Phase 1
