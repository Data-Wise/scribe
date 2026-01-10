# Code Coverage Tracking - Scribe

> **Phase 5 Task 16:** Comprehensive code coverage reporting

**Status:** Infrastructure complete, baseline established
**Coverage Provider:** Vitest + V8
**Reports:** Text, JSON, HTML, LCOV (for CI/CD)

---

## Current Coverage Summary

| Metric | Current | Threshold | Status |
|--------|---------|-----------|--------|
| **Lines** | 57.78% | 55% | ✅ PASS |
| **Functions** | 54.9% | 50% | ✅ PASS |
| **Branches** | 58.31% | 55% | ✅ PASS |
| **Statements** | 57.14% | 55% | ✅ PASS |

**Total Tests:** 2,263 passing (64 test files)
**Test Duration:** ~10s

---

## Coverage by Directory

### High Coverage (>80%)

| Directory | Lines | Functions | Branches | Statements |
|-----------|-------|-----------|----------|------------|
| **extensions** | 87.5% | 88.23% | 81.81% | 87.5% |
| **hooks** | 83.33% | 81.48% | 83.33% | 83.33% |
| **components/sidebar** | 86.48% | 78.24% | 82.17% | 87.84% |
| **components/EditorTabs** | 84.84% | 79.24% | 77.55% | 84.71% |

### Medium Coverage (50-80%)

| Directory | Lines | Functions | Branches | Statements |
|-----------|-------|-----------|----------|------------|
| **components (main)** | 71.8% | 66.31% | 64.84% | 72.9% |
| **components/Settings** | 68.65% | 63.68% | 71.71% | 69.83% |
| **lib** | 52.66% | 52.46% | 34.17% | 53.45% |

### Low Coverage (<50%)

| Directory | Lines | Functions | Branches | Statements | Priority |
|-----------|-------|-----------|----------|------------|----------|
| **store** | 23.58% | 3.72% | 18.65% | 24.67% | P1 |
| **utils** | 0% | 0% | 0% | 0% | P1 |

---

## Uncovered Files (0% Coverage)

### Critical Priority (Core Functionality)

**store/**
- `useAppViewStore.ts` - 25% lines, 5.33% functions
- `useChatHistoryStore.ts` - 17.5% lines, 0% functions
- `useProjectStore.ts` - 11.39% lines, 0% functions
- `useSettingsStore.ts` - 18.89% lines, 0% functions

**lib/**
- `api.ts` - 0% coverage (586 lines) - Tauri API wrapper
- `settingsSchema.ts` - 0% coverage (537 lines) - Settings validation

**utils/**
- `sanitize.ts` - 0% coverage (114 lines) - Security critical
- `search.ts` - 0% coverage (56 lines) - Search functionality

### Medium Priority (UI Components)

**components/**
- `SettingsModal.tsx` - 0% coverage (198 lines)
- `ProjectsPanel.tsx` - 0% coverage (189 lines)

**components/Settings/**
- `ContextualHint.tsx` - 0% coverage (52 lines)
- `SearchResults.tsx` - 0% coverage (48 lines)

**components/sidebar/**
- `MomentumGauge.tsx` - 0% coverage (12 lines)

**hooks/**
- `useForestTheme.ts` - 0% coverage (10 lines)

---

## Coverage Improvement Roadmap

### Sprint 35: Core Store Coverage
**Goal:** Increase store coverage from 23.58% to 60%

**Tasks:**
1. Add Zustand store tests for:
   - `useAppViewStore.ts` - View state management
   - `useProjectStore.ts` - Project CRUD operations
   - `useSettingsStore.ts` - Settings state
   - `useChatHistoryStore.ts` - Chat history persistence

**Estimated Effort:** 6-8 hours
**Impact:** +15-20% overall coverage

### Sprint 36: Utility & Security Coverage
**Goal:** Cover all utils/, increase lib/ coverage to 70%

**Tasks:**
1. Add tests for `sanitize.ts` (security critical)
2. Add tests for `search.ts` (fuzzy search logic)
3. Increase `api.ts` coverage (currently 0%)
4. Add tests for `settingsSchema.ts` validation

**Estimated Effort:** 4-6 hours
**Impact:** +10-15% overall coverage

### Sprint 37: Component Coverage Polish
**Goal:** Cover remaining 0% components

**Tasks:**
1. Add tests for `SettingsModal.tsx`
2. Add tests for `ProjectsPanel.tsx`
3. Add tests for remaining Settings components
4. Add tests for `useForestTheme.ts`

**Estimated Effort:** 3-4 hours
**Impact:** +5-10% overall coverage

---

## Coverage Gaps by Feature Area

### Well-Covered Features ✅

- **Editor Components** - 71.8% coverage
- **WikiLink Navigation** - 100% E2E coverage
- **Sidebar Views** - 86.48% coverage
- **Editor Tabs** - 84.84% coverage
- **System Theme Detection** - 90.9% coverage

### Needs Coverage ⚠️

- **State Management (Zustand stores)** - 23.58% coverage
- **API Layer** - 0% coverage (api.ts)
- **Security (sanitization)** - 0% coverage
- **Search Utilities** - 0% coverage
- **Settings Modal** - 0% coverage

---

## Test Coverage by Type

### Unit Tests
- **Count:** 2,263 tests
- **Files:** 64 test files
- **Coverage:** 57.78% lines

### E2E Tests
- **WikiLink Navigation:** 30 tests (comprehensive)
- **Editor Modes:** Covered by unit tests
- **AI Chat:** Covered by unit tests

---

## Coverage Commands

```bash
# Run coverage report
npm run test:coverage

# View HTML coverage report
open coverage/index.html

# Generate coverage for CI/CD (LCOV format)
npm run test:coverage -- --reporter=lcov

# Watch mode with coverage
npm run test -- --coverage
```

---

## Coverage Reports Location

- **HTML Report:** `coverage/index.html` (interactive)
- **JSON Report:** `coverage/coverage-final.json`
- **LCOV Report:** `coverage/lcov.info` (for CI/CD)
- **Text Summary:** Console output

---

## Quality Standards

### Current Baseline (v1.14.1-alpha)
- Lines: 55%
- Functions: 50%
- Branches: 55%
- Statements: 55%

### Target for v1.15.0
- Lines: 70%
- Functions: 65%
- Branches: 65%
- Statements: 70%

### Long-term Goal (v2.0)
- Lines: 80%
- Functions: 75%
- Branches: 75%
- Statements: 80%

---

## Integration with CI/CD

### GitHub Actions Setup

```yaml
- name: Run tests with coverage
  run: npm run test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
    flags: unittests
    name: codecov-umbrella
```

---

## Notes

- Coverage thresholds are enforced on every test run
- Thresholds set conservatively to allow for test fluctuation
- HTML reports provide detailed file-by-file coverage
- LCOV format enables integration with external coverage tools
- All source directories included in coverage analysis
- Test files and type definitions excluded from coverage

---

**Last Updated:** 2026-01-10 (Sprint 34 Phase 5)
**Next Review:** Sprint 35 (Store coverage improvement)
**Owner:** Development Team
