# Playwright E2E Testing

**Status:** ✅ Implemented (Sprint 25)
**Priority:** P2
**Completed:** 2025-12-29

---

## Overview

Comprehensive Playwright E2E test suite for Scribe browser mode.

**Current State:**
- Unit tests: 666 (Vitest + Testing Library)
- E2E tests: **126 tests** across 14 spec files
- Passing: **50 tests** (40%)
- Remaining: 76 tests need UI data-testid improvements

---

## Test Coverage

| Category | Tests | Passing | Status |
|----------|-------|---------|--------|
| Smoke Tests | 4 | 4 | ✅ |
| Navigation & Layout | 8 | 6 | 🔶 |
| Editor Tabs | 10 | 1 | 🔶 |
| Keyboard Shortcuts | 15 | 8 | 🔶 |
| Left Sidebar | 14 | 10 | 🔶 |
| Right Sidebar | 10 | 0 | 🔶 |
| Editor | 12 | 0 | 🔶 |
| Modals & Dialogs | 10 | 6 | 🔶 |
| Mission Control | 8 | 4 | 🔶 |
| Projects | 8 | 4 | 🔶 |
| Notes | 10 | 3 | 🔶 |
| Focus Mode | 5 | 0 | 🔶 |
| Themes | 6 | 5 | ✅ |
| Mission Sidebar (legacy) | 6 | 0 | 🔶 |
| **Total** | **126** | **50** | 🔶 40% |

Legend: ✅ 100% passing | 🔶 Needs work

---

## Structure

```
e2e/
├── playwright.config.ts          # Playwright configuration
├── pages/                         # Page Object Model
│   ├── index.ts                   # Re-exports
│   ├── BasePage.ts                # Common utilities
│   ├── SidebarPage.ts             # Left sidebar
│   ├── EditorPage.ts              # HybridEditor
│   ├── TabsPage.ts                # Editor tabs
│   ├── MissionControlPage.ts      # Dashboard
│   ├── RightSidebarPage.ts        # Properties/Backlinks/Tags
│   └── ModalsPage.ts              # Dialogs
├── fixtures/                      # Test fixtures
│   └── index.ts                   # Custom fixtures + test data
├── specs/                         # Test specifications
│   ├── smoke.spec.ts              # P0: App loads correctly
│   ├── navigation.spec.ts         # P0: Responsive layout
│   ├── tabs.spec.ts               # P0: Tab management
│   ├── keyboard-shortcuts.spec.ts # P1: All ⌘ shortcuts
│   ├── left-sidebar.spec.ts       # P1: Icon/Compact/Card modes
│   ├── right-sidebar.spec.ts      # P1: Properties/Backlinks/Tags
│   ├── editor.spec.ts             # P1: Content editing
│   ├── modals.spec.ts             # P2: Command palette, settings
│   ├── mission-control.spec.ts    # P2: Dashboard
│   ├── projects.spec.ts           # P2: CRUD operations
│   ├── notes.spec.ts              # P2: CRUD + search
│   ├── focus-mode.spec.ts         # P3: Distraction-free mode
│   ├── themes.spec.ts             # P3: Visual styling
│   └── mission-sidebar.spec.ts    # Legacy: Original tests
└── utils/                         # Helpers (empty)
```

---

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive)
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed

# Run specific test file
npm run test:e2e -- specs/smoke.spec.ts
```

---

## Key Features

### Page Object Model
- All 7 page objects with documented methods
- Common utilities in `BasePage`
- JSDoc comments for all methods

### Custom Fixtures
- Pre-configured page objects
- Test data helpers (`testData.uniqueNoteTitle()`, etc.)
- Fresh browser context per test

### Configuration
- Base URL: `http://localhost:5173`
- Browser: Chromium
- Screenshots on failure
- HTML reporter
- Auto-starts dev server

---

## Test Design Principles

1. **Isolation** - Each test creates its own data
2. **Reliability** - Uses `waitForTimeout` for animations
3. **Maintainability** - Page objects abstract selectors
4. **Graceful failures** - Many tests handle missing elements

---

## Reference Documents

- `CHROME-UI-TESTS.md` - Original test specification (120 tests)
- `SPRINT-25-PLAN-B-UI.md` - Sprint planning

---

## Next Steps

### Potential Improvements
- [ ] Add visual regression testing
- [ ] Add CI/CD integration
- [ ] Add Tauri desktop tests (Phase 3)
- [ ] Add performance benchmarks

### Known Limitations
- Context menu tests need right-click implementation
- Some tests skip when features aren't available
- Tauri-specific features (native menu) not tested in browser mode

### Failing Tests Analysis (76 tests)
Common failure patterns:

1. **Command Palette interactions** - Needs notes to exist first
2. **Editor tests** - Require note to be open in tab
3. **Right sidebar tests** - Requires note selection to show
4. **Focus mode** - Keyboard shortcut not triggering correctly
5. **Tab management** - Needs better selectors for tab elements

### Recommended Fixes
1. Add `data-testid` attributes to key UI elements
2. Create test setup that pre-populates notes
3. Use more resilient selectors (role-based over class-based)

---

*Implemented: 2025-12-29*
*Tests: 126 total, 50 passing*
