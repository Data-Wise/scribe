# Postponed Tasks - Sprint 35

**Date Postponed:** 2026-01-10
**Reason:** Phase 0 and Phase 1 complete with excellent documentation. Remaining tasks postponed to future sprints.

---

## Overview

Sprint 35 successfully completed Phase 0 (E2E Tests Refactoring) and Phase 1 (Store Coverage Improvements). The following tasks have been postponed to future sprints with comprehensive documentation to enable future implementation.

---

## 1. useSettingsStore Testing

**Priority:** P0 (High)
**Estimated Effort:** 3-4 hours
**Status:** ⏸️ POSTPONED

### Description
Complete test coverage for useSettingsStore (474 lines), the second P0 priority Zustand store managing application settings, Quick Actions, and fuzzy search.

### Why Postponed
- Comprehensive test plan already documented
- Test patterns established in TESTING.md
- Time better spent on other priorities

### Ready for Implementation
✅ **YES** - Complete test plan exists

### Documentation
- `src/renderer/src/store/__tests__/useSettingsStore.test.plan.md` (227 lines)
- Detailed plan for 55 tests across 9 categories
- Special considerations documented (Fuse.js mocking, Set handling, etc.)

### Implementation Guide

**Test Categories (55 tests total):**
1. Settings CRUD Operations (8 tests)
2. Settings Search with Fuse.js (6 tests)
3. Settings Import/Export (6 tests)
4. UI State Management (7 tests)
5. Quick Actions CRUD (10 tests)
6. Quick Actions Reordering (5 tests)
7. Quick Actions Shortcuts (4 tests)
8. localStorage Persistence (6 tests)
9. Initialize Method (3 tests)

**Key Challenges:**
- Requires mocking `require('../lib/settingsSchema')`
- Fuse.js integration testing
- Set type handling (collapsedSections)
- Quick Actions order property management

**Test Pattern to Follow:**
```typescript
// From TESTING.md and useAppViewStore.test.ts
describe('useSettingsStore', () => {
  let localStorageMock: Record<string, string>

  beforeEach(() => {
    // Mock localStorage FIRST
    localStorageMock = {}
    global.localStorage = { /* ... */ }

    // Reset store state
    useSettingsStore.setState({
      settings: {},
      activeCategory: 'editor',
      searchQuery: '',
      collapsedSections: new Set(),
      isOpen: false,
      quickActions: DEFAULT_QUICK_ACTIONS
    })

    // Clear mocks
    vi.clearAllMocks()
  })

  // Tests here...
})
```

**When to Resume:**
- When additional store coverage is prioritized
- When working on settings-related features
- When time permits (estimated 3-4 hours)

---

## 2. E2E Test Suite Completion

**Priority:** P1 (Medium)
**Estimated Effort:** 4-6 hours
**Status:** ⏸️ POSTPONED

### Description
Complete E2E test suite by fixing callouts tests and improving CodeMirror integration.

### Why Postponed
- Infrastructure is complete and ready
- Callouts tests require deeper CodeMirror knowledge
- Known technical limitations need investigation

### Ready for Implementation
⚠️ **PARTIAL** - Requires additional research

### Current Status

**Infrastructure Complete:** ✅
- CodeMirrorHelper utility class (275 lines, 20+ methods)
- Fixtures integration working
- Helper methods for fill, append, clear, type, autocomplete

**Known Issues:**
- EditorView API not accessible from E2E tests in standard way
- `@uiw/react-codemirror` doesn't expose view on DOM elements
- keyboard.type() hangs with long content (500+ chars)
- callouts tests failing due to integration complexity

### Implementation Guide

**Research Needed:**
1. Investigate `@uiw/react-codemirror` internals
2. Understand EditorView access patterns in React wrapper
3. Explore alternative approaches to CodeMirror interaction
4. Study CodeMirror 6 documentation on testing

**Files to Review:**
- `e2e/helpers/codemirror-helpers.ts` - Helper utilities
- `e2e/tests/callouts.spec.ts` - Failing tests
- `src/renderer/src/components/CodeMirrorEditor.tsx` - Implementation

**When to Resume:**
- After gaining CodeMirror 6 expertise
- When working on editor-related features
- When E2E test coverage becomes priority
- Estimated 4-6 hours with proper CodeMirror knowledge

---

## 3. Accessibility P1 Fixes

**Priority:** P1 (Low - may be dropped)
**Estimated Effort:** 6-8 hours
**Status:** ⏸️ POSTPONED (possibly DROPPED)

### Description
Fix 39 identified accessibility violations including keyboard navigation, ARIA labels, and color contrast issues.

### Why Postponed
User indicated to "scrap accessibility check and improvements" - may be permanently dropped from roadmap.

### Ready for Implementation
⚠️ **REQUIRES USER DECISION**

### Current Status

**Issues Identified:** 39 violations
- Keyboard navigation improvements needed
- ARIA labels missing on interactive elements
- Color contrast verification required

**User Feedback:**
> "btw: scrap accessibility check and improvements"

### Next Steps

**Before Implementation:**
1. Confirm with user if this should be permanently dropped
2. If keeping: Re-prioritize based on user needs
3. If dropping: Remove from all future sprint planning

**If Keeping - Implementation Guide:**
1. Install eslint-plugin-jsx-a11y
2. Fix keyboard navigation (highest priority)
3. Add ARIA labels to interactive elements
4. Verify color contrast in all themes
5. Test with screen readers

**When to Resume:**
- Only if user confirms this is still needed
- Estimated 6-8 hours if implemented

---

## 4. System Theme Detection

**Priority:** P2 (Nice to have)
**Estimated Effort:** 2-3 hours
**Status:** ⏸️ POSTPONED

### Description
Auto-detect OS theme preference (dark/light) and add "System (Auto)" theme option.

### Why Postponed
- Not critical for current release
- Good feature for future UX enhancement
- Clear implementation path exists

### Ready for Implementation
✅ **YES** - Clear requirements and implementation approach

### Implementation Guide

**Requirements:**
1. Auto-detect OS theme (dark/light)
2. Add "System (Auto)" theme option to settings
3. Update theme when OS preference changes
4. Persist user's choice (manual vs auto)

**Implementation Steps:**

1. **Create useSystemTheme Hook**
```typescript
// src/renderer/src/hooks/useSystemTheme.ts
export const useSystemTheme = () => {
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return systemTheme
}
```

2. **Update Settings Store**
```typescript
// Add to useSettingsStore
interface Settings {
  // ...
  themeMode: 'light' | 'dark' | 'system' // Add 'system' option
}
```

3. **Update Theme Logic**
```typescript
// In App.tsx or theme provider
const systemTheme = useSystemTheme()
const effectiveTheme = settings.themeMode === 'system'
  ? systemTheme
  : settings.themeMode
```

4. **Update Settings UI**
- Add "System (Auto)" option to theme selector
- Show current detected theme when "System" is selected
- Update theme preview to reflect system preference

**Files to Modify:**
- `src/renderer/src/hooks/useSystemTheme.ts` (new)
- `src/renderer/src/store/useSettingsStore.ts`
- `src/renderer/src/App.tsx`
- `src/renderer/src/components/SettingsModal.tsx`

**When to Resume:**
- When UX enhancements are prioritized
- When working on theme-related features
- Estimated 2-3 hours

---

## 5. CI/CD Setup

**Priority:** P2 (Infrastructure)
**Estimated Effort:** 2-3 hours
**Status:** ⏸️ POSTPONED

### Description
Set up GitHub Actions CI/CD pipeline for automated testing and coverage reporting.

### Why Postponed
- Current manual testing workflow sufficient
- Good infrastructure improvement for future
- Clear implementation path exists

### Ready for Implementation
✅ **YES** - Standard setup, well-documented approach

### Implementation Guide

**Requirements:**
1. GitHub Actions workflow for CI
2. Automated test runs on PR
3. Coverage reporting integration
4. PR status checks

**Implementation Steps:**

1. **Create CI Workflow**
```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main, feat/*]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run typecheck

      - name: Run unit tests
        run: npm test

      - name: Run coverage
        run: npm run test:coverage

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

2. **Add PR Status Checks**
- Configure branch protection rules
- Require CI to pass before merge
- Require code review

3. **Coverage Reporting**
- Integrate with Codecov or Coveralls
- Add coverage badge to README
- Set coverage thresholds

4. **Optional Enhancements**
- E2E tests in CI (when stable)
- Build checks
- Dependency scanning (Dependabot)

**Files to Create:**
- `.github/workflows/ci.yml`
- `.github/workflows/coverage.yml` (optional)

**Files to Modify:**
- `README.md` - Add CI badge
- Branch protection rules in GitHub

**When to Resume:**
- When team collaboration increases
- When PR workflow needs automation
- When coverage tracking becomes critical
- Estimated 2-3 hours

---

## Summary Table

| Task | Priority | Effort | Status | Ready? | When to Resume |
|------|----------|--------|--------|--------|----------------|
| useSettingsStore Testing | P0 | 3-4h | ⏸️ | ✅ Yes | When store coverage prioritized |
| E2E Test Suite | P1 | 4-6h | ⏸️ | ⚠️ Partial | After CodeMirror research |
| Accessibility Fixes | P1 | 6-8h | ⏸️ | ❌ User decision | If user confirms needed |
| System Theme Detection | P2 | 2-3h | ⏸️ | ✅ Yes | When UX enhancements prioritized |
| CI/CD Setup | P2 | 2-3h | ⏸️ | ✅ Yes | When automation prioritized |

**Total Postponed Effort:** 17-25 hours
**Ready to Implement:** 3/5 tasks (8-10 hours of ready work)
**Requires Research:** 1/5 tasks (4-6 hours with research)
**Requires Decision:** 1/5 tasks (6-8 hours if confirmed)

---

## Recommendations

### High Priority (Resume Soon)

1. **useSettingsStore Testing** (P0, 3-4h)
   - Complete test plan exists
   - Test patterns established
   - Ready for implementation
   - **Recommendation:** Resume when time permits

### Medium Priority (Resume When Relevant)

2. **System Theme Detection** (P2, 2-3h)
   - Clear implementation path
   - Good UX enhancement
   - Low complexity
   - **Recommendation:** Resume during UX improvement sprint

3. **CI/CD Setup** (P2, 2-3h)
   - Standard setup
   - Improves workflow
   - Good infrastructure investment
   - **Recommendation:** Resume when team collaboration increases

### Lower Priority (Research First)

4. **E2E Test Suite** (P1, 4-6h)
   - Requires CodeMirror research
   - Infrastructure ready
   - Technical challenges to solve
   - **Recommendation:** Resume after gaining CodeMirror expertise

### Requires Decision

5. **Accessibility Fixes** (P1, 6-8h)
   - User indicated to scrap
   - Clarify if permanently dropped
   - **Recommendation:** Confirm with user before resuming

---

## Future Sprint Planning

### Suggested Sprint 36 Focus

**Option A: Complete Store Testing**
- useSettingsStore testing (3-4h)
- useHistoryStore testing (2-3h)
- Total: 5-7 hours

**Option B: UX Enhancements**
- System Theme Detection (2-3h)
- Additional theme improvements
- Total: 4-6 hours

**Option C: Infrastructure**
- CI/CD Setup (2-3h)
- Dependency updates
- Total: 3-5 hours

### Recommended Approach

1. **Quick Win:** Complete useSettingsStore testing (P0 priority)
2. **Then Choose:** UX enhancements OR infrastructure improvements
3. **Defer:** E2E tests until CodeMirror knowledge gained
4. **Decide:** Accessibility work - keep or drop?

---

## Notes

- All postponed tasks have clear documentation
- 3/5 tasks ready to implement immediately
- Test patterns established in TESTING.md apply to future work
- Sprint 35 provided excellent foundation for future testing
- Documentation-first approach working well

**Last Updated:** 2026-01-10
**Next Review:** During Sprint 36 planning
