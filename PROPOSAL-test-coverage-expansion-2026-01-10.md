# Test Coverage Expansion Proposal

**Date:** 2026-01-10
**Context:** Mode Consolidation v1.15.0 Testing
**Current Coverage:** 60 E2E tests, 2225 total tests
**Goal:** Increase coverage by 25-35 strategic tests (targeting critical gaps)

---

## Executive Summary

While the 60 E2E tests provide comprehensive integration coverage, we have **critical gaps in unit test coverage** for Mode Consolidation components and store functions. This proposal targets **5 high-value areas** that will improve test quality, catch regressions earlier, and provide better debugging capabilities.

**Proposed Addition:** 30 unit tests across 5 test files
**Time Estimate:** 2-3 hours
**Risk Reduction:** High (catches component-level bugs before integration)

---

## Current Coverage Analysis

### ✅ Well-Covered Areas

| Component | Test File | Tests | Coverage |
|-----------|-----------|-------|----------|
| IconBarMode | IconBarMode.test.tsx | 599 lines | ✅ Comprehensive |
| CompactListMode | CompactListMode.test.tsx | Exists | ✅ Good |
| CardViewMode | CardViewMode.test.tsx | Exists | ✅ Good |
| ActivityBar | ActivityBar.test.tsx | Exists | ✅ Good |
| MissionSidebar | MissionSidebar.test.tsx | Basic | ✅ Integration |

### ❌ Coverage Gaps (Critical)

| Component/Module | Status | Impact | Priority |
|-----------------|--------|--------|----------|
| **PresetUpdateDialog** | No unit tests | Dialog logic untested in isolation | 🔴 P1 |
| **ResizeHandle** | No unit tests | Resize/reset behavior untested | 🔴 P1 |
| **useAppViewStore (mode functions)** | No store tests | State management untested | 🔴 P1 |
| **localStorage error handling** | No error tests | Edge cases uncovered | 🟡 P2 |
| **Settings integration** | Partial | Preset logic needs unit tests | 🟡 P2 |

---

## Proposed Test Additions

### 1. PresetUpdateDialog Unit Tests (8 tests) 🔴 P1

**File:** `src/renderer/src/__tests__/PresetUpdateDialog.test.tsx` (NEW)

**Rationale:** The dialog has complex state management (checkbox, button states) that's only tested via integration. Unit tests will catch UI bugs faster.

**Test Coverage:**
```typescript
describe('PresetUpdateDialog Component', () => {
  // Rendering
  it('renders with correct preset names and widths')
  it('shows visual comparison of current vs suggested preset')

  // Checkbox Behavior
  it('checkbox unchecked by default')
  it('checkbox state toggles on click')
  it('passes checkbox state to onUpdate callback')

  // Button Actions
  it('calls onUpdate with dontAskAgain=false when Update clicked without checkbox')
  it('calls onUpdate with dontAskAgain=true when Update clicked with checkbox')
  it('calls onSkip when Skip button clicked')

  // Accessibility
  it('has proper ARIA labels for all interactive elements')
  it('supports keyboard navigation (Tab, Enter, Escape)')

  // Edge Cases
  it('handles same currentPreset and suggestedPreset gracefully')
  it('handles very large width values without layout breaks')
})
```

**Lines:** ~200-250
**Time:** 45 minutes

---

### 2. ResizeHandle Unit Tests (6 tests) 🔴 P1

**File:** `src/renderer/src/__tests__/ResizeHandle.test.tsx` (NEW)

**Rationale:** Resize behavior is complex (drag, double-click reset, boundaries) and currently only tested indirectly.

**Test Coverage:**
```typescript
describe('ResizeHandle Component', () => {
  // Drag Behavior
  it('calls onResize with deltaX on drag')
  it('prevents text selection during drag (user-select: none)')
  it('changes cursor to col-resize on hover')

  // Double-Click Reset
  it('calls onReset when double-clicked')
  it('shows tooltip "Double-click to reset width"')

  // Drag End
  it('calls onResizeEnd when drag ends')

  // Accessibility
  it('has proper ARIA role and label')
  it('supports keyboard resize (Arrow keys)')
})
```

**Lines:** ~150-200
**Time:** 30 minutes

---

### 3. useAppViewStore Mode Functions (8 tests) 🔴 P1

**File:** `src/renderer/src/__tests__/useAppViewStore.test.ts` (NEW)

**Rationale:** Store functions are the heart of Mode Consolidation. Testing them in isolation ensures state management correctness.

**Test Coverage:**
```typescript
describe('useAppViewStore - Mode Management', () => {
  // setSidebarMode
  it('setSidebarMode updates mode and persists to localStorage')
  it('setSidebarMode with "compact" saves to scribe:lastExpandedMode')
  it('setSidebarMode with "card" saves to scribe:lastExpandedMode')
  it('setSidebarMode with "icon" does not update lastExpandedMode')

  // setSidebarWidth
  it('setSidebarWidth persists to mode-specific localStorage key')
  it('setSidebarWidth for compact saves to scribe:compactModeWidth')
  it('setSidebarWidth for card saves to scribe:cardModeWidth')

  // cycleSidebarMode
  it('cycleSidebarMode respects preset-aware cycle pattern')
  it('cycleSidebarMode enforces 200ms debounce')
  it('cycleSidebarMode skips cycle if within debounce window')

  // Priority Logic (determineExpandMode)
  it('uses remembered mode when setting is ON')
  it('falls back to preset mode when setting is OFF')
  it('defaults to compact when no localStorage data exists')
})
```

**Lines:** ~300-350
**Time:** 1 hour

---

### 4. localStorage Error Handling (4 tests) 🟡 P2

**File:** `src/renderer/src/__tests__/LocalStorageErrorHandling.test.ts` (NEW)

**Rationale:** localStorage can throw errors (quota exceeded, disabled in private mode). We need graceful fallbacks.

**Test Coverage:**
```typescript
describe('localStorage Error Handling', () => {
  // Quota Exceeded
  it('handles setItem quota exceeded error gracefully')
  it('falls back to in-memory state when localStorage unavailable')

  // Disabled localStorage
  it('detects localStorage disabled (SecurityError) and uses fallback')

  // Corrupted Data
  it('handles corrupted localStorage data with JSON.parse fallback')
  it('resets to defaults when localStorage contains invalid JSON')
})
```

**Lines:** ~100-150
**Time:** 30 minutes

---

### 5. Settings Preset Integration (4 tests) 🟡 P2

**File:** `src/renderer/src/__tests__/SettingsPresetIntegration.test.tsx` (NEW)

**Rationale:** Preset-to-mode mapping logic is critical for Mode Consolidation. Unit tests ensure correctness.

**Test Coverage:**
```typescript
describe('Settings Preset Integration', () => {
  // Preset Mapping
  it('maps narrow preset (200px) to compact mode only')
  it('maps medium preset (280px) to compact mode only')
  it('maps wide preset (360px) to compact+card modes')

  // Preset Update Flow
  it('updates setting when user accepts preset update dialog')
  it('auto-updates preset when scribe:autoUpdatePreset is true')
  it('preserves current preset when user skips dialog')

  // Default Behavior
  it('uses medium preset for fresh installs')
  it('migrates v1.14.0 users to remember mode ON')
})
```

**Lines:** ~150-200
**Time:** 30 minutes

---

## Test Organization Strategy

### New Test Files (5 files, ~30 tests)

```
src/renderer/src/__tests__/
├── PresetUpdateDialog.test.tsx         (NEW - 8 tests)
├── ResizeHandle.test.tsx               (NEW - 6 tests)
├── useAppViewStore.test.ts             (NEW - 8 tests)
├── LocalStorageErrorHandling.test.ts   (NEW - 4 tests)
└── SettingsPresetIntegration.test.tsx  (NEW - 4 tests)
```

### Total Addition
- **Files:** 5 new test files
- **Tests:** ~30 unit tests
- **Lines:** ~1,100-1,200 lines
- **Time:** 2-3 hours

---

## Coverage Improvement Matrix

| Area | Current | Proposed | Improvement |
|------|---------|----------|-------------|
| **Dialog Components** | 0% (no unit tests) | 100% | +100% |
| **Resize Logic** | 0% (no unit tests) | 100% | +100% |
| **Store Functions** | 0% (no tests) | 80% | +80% |
| **Error Handling** | 20% (basic) | 90% | +70% |
| **Settings Integration** | 40% (E2E only) | 85% | +45% |

**Overall Coverage Gain:** Estimated **+60% for Mode Consolidation modules**

---

## Test Quality Improvements

### 1. Faster Feedback Loop
- **Current:** E2E tests run full component tree (slow)
- **Proposed:** Unit tests catch bugs in <1 second

### 2. Better Debugging
- **Current:** E2E failures require debugging through layers
- **Proposed:** Unit test failures pinpoint exact component/function

### 3. Regression Protection
- **Current:** Integration tests catch high-level regressions
- **Proposed:** Unit tests catch low-level regressions (state, props, events)

### 4. Documentation
- **Current:** Spec docs describe behavior
- **Proposed:** Unit tests serve as executable documentation

---

## Implementation Plan

### Phase 1: Critical Components (P1) - 1.5 hours
1. ✅ PresetUpdateDialog unit tests (8 tests)
2. ✅ ResizeHandle unit tests (6 tests)
3. ✅ useAppViewStore mode functions (8 tests)

**Outcome:** Core Mode Consolidation components fully tested

### Phase 2: Edge Cases (P2) - 1 hour
4. ✅ localStorage error handling (4 tests)
5. ✅ Settings preset integration (4 tests)

**Outcome:** Robust error handling and integration coverage

### Total Time: 2.5-3 hours

---

## Success Metrics

### Quantitative
- ✅ Add 30 unit tests (current: 60 E2E → target: 90 total)
- ✅ Increase Mode Consolidation coverage from ~40% → 90%
- ✅ Test suite runtime <10 seconds (unit tests are fast)

### Qualitative
- ✅ Each component has dedicated unit test file
- ✅ Store functions have isolated tests
- ✅ Error scenarios have explicit coverage
- ✅ Settings integration has unit-level validation

---

## Alternative Approaches Considered

### Option A: More E2E Tests (❌ Rejected)
- **Pros:** Tests full integration flows
- **Cons:** Slow, hard to debug, already have 60 E2E tests
- **Verdict:** E2E coverage is sufficient

### Option B: Visual Regression Tests (⏸️ Deferred)
- **Pros:** Catches UI regressions
- **Cons:** Requires additional tooling (Percy, Chromatic)
- **Verdict:** Good for v2.0, not critical for v1.15.0

### Option C: Property-Based Testing (⏸️ Deferred)
- **Pros:** Finds edge cases automatically
- **Cons:** Complex setup, learning curve
- **Verdict:** Overkill for current scope

### ✅ **Chosen: Targeted Unit Tests**
Best balance of coverage, speed, and debugging value.

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Test maintenance burden** | Medium | Follow existing test patterns, use helpers |
| **False positives** | Low | Proper mocking, realistic test data |
| **Incomplete coverage** | Medium | Prioritize P1 tests first, defer P2 if time-constrained |
| **Test coupling** | Low | Unit tests are isolated, no cross-dependencies |

---

## Recommendation

✅ **APPROVE Phase 1 (P1 tests) immediately**
- High value, low risk
- 22 tests in 3 files
- 1.5 hours implementation
- Critical for v1.15.0 quality

⏸️ **DEFER Phase 2 (P2 tests) to post-release**
- Nice-to-have, not critical
- 8 tests in 2 files
- 1 hour implementation
- Can add after v1.15.0 ships

---

## Next Steps

1. ✅ Approve this proposal
2. ✅ Implement Phase 1 tests (22 tests, 1.5 hours)
3. ✅ Run full test suite to verify no regressions
4. ✅ Update .STATUS with new test counts
5. ✅ Commit with message: "test: Add 22 unit tests for Mode Consolidation components"
6. ⏭️ Proceed with merge to dev branch

---

## Appendix A: Test File Templates

### PresetUpdateDialog.test.tsx Skeleton

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PresetUpdateDialog } from '../components/PresetUpdateDialog'

describe('PresetUpdateDialog Component', () => {
  const defaultProps = {
    currentPreset: 'medium',
    currentWidth: 280,
    suggestedPreset: 'wide',
    suggestedWidth: 360,
    onUpdate: vi.fn(),
    onSkip: vi.fn()
  }

  it('renders with correct preset names and widths', () => {
    render(<PresetUpdateDialog {...defaultProps} />)

    expect(screen.getByText(/Medium \(280px\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Wide \(360px\)/i)).toBeInTheDocument()
  })

  // ... more tests
})
```

### useAppViewStore.test.ts Skeleton

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useAppViewStore } from '../store/useAppViewStore'

describe('useAppViewStore - Mode Management', () => {
  beforeEach(() => {
    localStorage.clear()
    useAppViewStore.setState({
      sidebarMode: 'compact',
      sidebarWidth: 280
    })
  })

  it('setSidebarMode updates mode and persists to localStorage', () => {
    const { setSidebarMode } = useAppViewStore.getState()

    setSidebarMode('card')

    expect(useAppViewStore.getState().sidebarMode).toBe('card')
    expect(localStorage.getItem('scribe:lastExpandedMode')).toBe('card')
  })

  // ... more tests
})
```

---

## Appendix B: Coverage Report Format

After implementation, generate coverage report:

```bash
npm test -- --coverage --reporter=verbose
```

**Expected Output:**
```
File                          | % Stmts | % Branch | % Funcs | % Lines |
------------------------------|---------|----------|---------|---------|
PresetUpdateDialog.tsx        |   100   |   95     |   100   |   100   |
ResizeHandle.tsx              |   100   |   90     |   100   |   100   |
useAppViewStore.ts (modes)    |   85    |   80     |   90    |   85    |
```

---

**Approved By:** _____________
**Date:** 2026-01-10
**Implementation:** Phase 1 (22 tests, 1.5 hours)
