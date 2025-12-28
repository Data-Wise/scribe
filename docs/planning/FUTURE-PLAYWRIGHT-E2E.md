# Future: Playwright E2E Testing

**Status:** 📋 Planned (Post Sprint 25)
**Priority:** P2
**Estimated Effort:** 8-10 hours
**Prerequisites:** Complete Plan B UI Redesign (Sprint 25)

---

## Overview

Add Playwright for E2E testing to complement existing 518 unit tests.

**Current State:**
- Unit tests: 518 (Vitest + Testing Library)
- E2E tests: 0

**Target State:**
- Unit tests: 518+
- E2E tests: 20-30 critical user journeys
- Coverage: ~70% E2E (browser mode)

---

## Recommended Approach

### Phase 1: Browser-Mode Foundation
**Effort:** 4 hours

1. Install Playwright
2. Create Page Object Model structure
3. Add 5 critical user journey tests
4. Integrate with npm scripts

### Phase 2: Comprehensive Coverage
**Effort:** 4 hours

1. Context menu tests
2. Keyboard shortcut tests
3. State reactivity tests
4. Visual regression baselines

### Phase 3: Tauri Integration (Optional)
**Effort:** 4+ hours

1. WebDriver setup for desktop app
2. SQLite persistence tests
3. Native menu tests
4. CI matrix for release builds

---

## Critical User Journeys to Test

| Priority | Journey | Complexity |
|----------|---------|------------|
| P1 | Create note → Edit → Save | Medium |
| P1 | Open daily note (⌘D) | Low |
| P1 | Quick capture (⌘⇧C) | Low |
| P1 | Tab switching (⌘1-9) | Low |
| P1 | Search and navigate (⌘F) | Medium |
| P2 | Project creation workflow | High |
| P2 | Wiki-link navigation | Medium |
| P2 | Export workflow | High |
| P3 | Context menu actions | Medium |
| P3 | Sidebar mode cycling | Low |

---

## Proposed Structure

```
e2e/
├── playwright.config.ts
├── pages/
│   ├── BasePage.ts
│   ├── MissionControlPage.ts
│   ├── EditorPage.ts
│   ├── SidebarPage.ts
│   └── TabsPage.ts
├── fixtures/
│   ├── notes.ts
│   └── projects.ts
├── specs/
│   ├── smoke.spec.ts
│   ├── navigation.spec.ts
│   ├── editor.spec.ts
│   ├── tabs.spec.ts
│   └── keyboard-shortcuts.spec.ts
└── utils/
    └── test-helpers.ts
```

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Tool | Playwright | Best DX, cross-browser |
| Initial mode | Browser-only | Fast, simple setup |
| Architecture | Page Object Model | Maintainability |
| CI strategy | Browser always, Tauri on release | Speed vs coverage |

---

## Dependencies

- Complete Sprint 25 (Plan B UI) first
- Stable tab system for tab tests
- Context menus implemented for menu tests

---

## Related Documents

- `BRAINSTORM-PLAYWRIGHT-E2E.md` - Full brainstorm (if saved)
- `TESTS_SUMMARY.md` - Current test coverage

---

*Created: 2025-12-28*
*Target Sprint: 26 or 27*
