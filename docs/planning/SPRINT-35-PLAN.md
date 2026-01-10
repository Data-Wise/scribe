# Sprint 35: Quality Foundation - E2E Testing, Store Coverage & Accessibility

> **Focus:** E2E test infrastructure, increased store coverage, and systematic accessibility improvements

**Status:** ✅ Ready to Start (Sprint 34 Complete)
**Started:** 2026-01-10
**Duration:** 2 weeks (10 working days)
**Sprint Goals:**
1. Refactor E2E tests for CodeMirror 6 (4-6 hours) - **NEW PRIORITY**
2. Increase store coverage from 23.58% to 70%+ (6-8 hours)
3. Fix all P1 accessibility violations (6-8 hours)
4. Establish quality metrics and monitoring (2-3 hours)

---

## Sprint Overview

### Sprint 34 Completion ✅

**Delivered:**
- Optimistic UI updates (instant feedback with rollback)
- Request deduplication (concurrent + time-based)
- Coverage reporting (57.78% lines)
- Content Security Policy hardening
- DOMPurify XSS protection tests (60 tests)
- E2E timeout configuration fix

**Quality Metrics Achieved:**
- Unit tests: 2,344/2,345 passing (99.96%)
- TypeScript: 0 errors (100% type-safe)
- Code coverage: 52% → 57.78% (+5.78%)
- Build: 970 KB gzipped

**Release:** v1.14.2-alpha tagged and pushed

---

### Current State (v1.14.2-alpha)

**Test Coverage:**
- Overall: 57.78% lines, 54.9% functions
- **Store (CRITICAL):** 23.58% lines, 3.72% functions ⚠️
- Utilities: 100% (sanitization, deduplication)
- Components: 71.8% lines
- Hooks: 83.33% lines

**Accessibility:**
- 83 violations across 25 components
- All set to warnings (non-blocking)
- P1 (keyboard): 39 violations - High impact
- P2 (forms): 31 violations - Medium impact
- P3 (polish): 13 violations - Low impact

### Sprint Goals

**Goal 1: E2E Test Infrastructure (Target: 650+/674 passing) - NEW PRIORITY**
- Refactor E2E tests for CodeMirror 6 editor
- Create CodeMirrorHelper utility class
- Update 40 spec files with new selectors
- Restore E2E test coverage to validate user workflows
- **Priority:** Critical for test infrastructure
- **Estimated:** 4-6 hours

**Goal 2: Store Coverage (Target: 23.58% → 70%+)**
- Add comprehensive tests for all Zustand stores
- Achieve 70%+ line coverage for store/
- Test state mutations, actions, selectors
- Cover edge cases and error scenarios
- **Estimated:** 6-8 hours

**Goal 3: Accessibility P1 (Target: 39 → 0 violations)**
- Fix all keyboard navigation issues
- Add keyboard event handlers to clickable elements
- Convert divs to buttons where appropriate
- Test with keyboard-only navigation
- **Estimated:** 6-8 hours

**Goal 4: Quality Infrastructure**
- Add coverage gates to CI/CD
- Create accessibility testing guidelines
- Establish quality metrics dashboard
- **Estimated:** 2-3 hours

---

## Phase 0: E2E Test Refactoring (Days 1-2) - NEW

### Task 0.1: Create CodeMirror Test Utilities

**File:** `e2e/utils/codemirror-helpers.ts` (new)
**Estimated:** 1 hour

**Implementation:**
```typescript
import { Page, Locator } from '@playwright/test'

export class CodeMirrorHelper {
  constructor(private page: Page) {}

  getEditor(): Locator {
    return this.page.locator('.cm-editor')
  }

  getContent(): Locator {
    return this.page.locator('.cm-content')
  }

  async fill(content: string): Promise<void> {
    const editor = this.getContent()
    await editor.click()
    await this.page.keyboard.press('Meta+a')
    await this.page.keyboard.type(content)
  }

  async append(text: string): Promise<void> {
    const editor = this.getContent()
    await editor.click()
    await this.page.keyboard.press('Meta+End')
    await this.page.keyboard.type(text)
  }

  async getTextContent(): Promise<string> {
    return await this.getContent().textContent() || ''
  }

  async clear(): Promise<void> {
    const editor = this.getContent()
    await editor.click()
    await this.page.keyboard.press('Meta+a')
    await this.page.keyboard.press('Backspace')
  }
}
```

**Tests to Create:**
- `e2e/utils/__tests__/codemirror-helpers.test.ts`

---

### Task 0.2: Update E2E Fixtures

**File:** `e2e/fixtures.ts`
**Estimated:** 30 minutes

**Add CodeMirror helper to fixtures:**
```typescript
type Fixtures = {
  basePage: BasePage
  editor: CodeMirrorHelper  // NEW
}

export const test = base.extend<Fixtures>({
  basePage: async ({ page }, use) => {
    const basePage = new BasePage(page)
    await use(basePage)
  },
  editor: async ({ page }, use) => {
    const editor = new CodeMirrorHelper(page)
    await use(editor)
  },
})
```

---

### Task 0.3: Update E2E Test Specs

**Files:** 40 spec files in `e2e/specs/`
**Estimated:** 2-3 hours

**Migration Pattern:**

**Before (Textarea-based):**
```typescript
const textarea = basePage.page.locator('textarea.hybrid-editor-textarea')
await expect(textarea).toBeVisible()
await textarea.fill(calloutContent)
```

**After (CodeMirror-based):**
```typescript
await expect(editor.getEditor()).toBeVisible()
await editor.fill(calloutContent)
```

**Files to Update:**
- Priority 1 (Core functionality - 10 files):
  - `callouts.spec.ts` (25 tests)
  - `editor.spec.ts` (18 tests)
  - `editor-modes.spec.ts` (15 tests)
  - `notes.spec.ts` (20 tests)
  - `projects.spec.ts` (15 tests)
  - `wikilink-navigation.spec.ts` (30 tests)
  - `wikilink-rendering.spec.ts` (20 tests)
  - `quarto-autocomplete.spec.ts` (25 tests)
  - `latex-multiline.spec.ts` (12 tests)
  - `syntax-highlighting.spec.ts` (15 tests)

- Priority 2 (Features - 15 files):
  - `claude-features.spec.ts`, `chat-history-persistence.spec.ts`, etc.

- Priority 3 (UI/UX - 15 files):
  - `themes.spec.ts`, `settings.spec.ts`, `sidebar-toggle.spec.ts`, etc.

**Update Strategy:**
1. Start with Priority 1 files (core functionality)
2. Run tests after each file update
3. Fix failures before moving to next file
4. Move to Priority 2 and 3 once core tests pass

---

### Task 0.4: Verification & CI Integration

**Estimated:** 30 minutes

**Verification Checklist:**
- [ ] Run full E2E suite: `npm run test:e2e`
- [ ] Target: 650+/674 tests passing (96%+)
- [ ] Fix remaining failures
- [ ] Update CI/CD workflow to include E2E tests
- [ ] Document E2E testing patterns

**Success Criteria:**
- 96%+ E2E tests passing
- CodeMirrorHelper reusable across all tests
- All critical user flows covered
- CI/CD includes E2E test run

**Documentation:**
- See `E2E_TESTS_REFACTOR_PLAN.md` for full details
- Update `TESTING.md` with CodeMirror patterns

---

## Phase 1: Store Coverage (Days 3-5)

### Task 1: useAppViewStore Tests

**File:** `src/renderer/src/store/useAppViewStore.ts`
**Current Coverage:** 25% lines, 5.33% functions
**Target:** 80% lines, 70% functions

**Test Areas:**
- View mode switching (Icon, Compact, Card)
- Sidebar state (collapsed/expanded)
- Filter state (tag filtering, search)
- Sort order (created_at, updated_at, title)
- Edge cases (invalid modes, empty states)

**Test Structure:**
```typescript
describe('useAppViewStore', () => {
  beforeEach(() => {
    useAppViewStore.setState({ /* reset state */ })
  })

  describe('View Mode', () => {
    it('switches between icon, compact, and card modes')
    it('persists view mode to localStorage')
    it('defaults to compact mode on first load')
  })

  describe('Sidebar State', () => {
    it('toggles sidebar collapsed state')
    it('persists sidebar state to localStorage')
  })

  describe('Filters', () => {
    it('sets active tag filter')
    it('clears tag filter')
    it('sets search query')
    it('combines tag filter and search')
  })

  describe('Sort Order', () => {
    it('changes sort field')
    it('toggles sort direction')
    it('persists sort preferences')
  })
})
```

**Estimated Effort:** 3-4 hours

---

### Task 2: useProjectStore Tests

**File:** `src/renderer/src/store/useProjectStore.ts`
**Current Coverage:** 11.39% lines, 0% functions
**Target:** 70% lines, 60% functions

**Test Areas:**
- Project CRUD operations
- Project selection
- Project type validation (daily, academic, fiction, technical, personal)
- Folder association
- Error handling

**Test Structure:**
```typescript
describe('useProjectStore', () => {
  describe('Project Creation', () => {
    it('creates project with valid data')
    it('validates required fields (name, type)')
    it('assigns unique ID')
    it('sets default folder path')
    it('handles creation errors gracefully')
  })

  describe('Project Updates', () => {
    it('updates project properties')
    it('validates project type')
    it('handles non-existent project')
    it('updates folder association')
  })

  describe('Project Deletion', () => {
    it('deletes project by ID')
    it('clears selected project if deleted')
    it('handles deletion errors')
  })

  describe('Project Selection', () => {
    it('selects project by ID')
    it('deselects when null passed')
    it('loads project notes on selection')
  })

  describe('Project Listing', () => {
    it('loads all projects')
    it('filters by project type')
    it('handles empty project list')
  })
})
```

**Estimated Effort:** 4-5 hours

---

### Task 3: useSettingsStore Tests

**File:** `src/renderer/src/store/useSettingsStore.ts`
**Current Coverage:** 18.89% lines, 0% functions
**Target:** 70% lines, 60% functions

**Test Areas:**
- Settings CRUD (get, set, reset)
- Theme preferences (dark, light, auto)
- Editor settings (font, size, line height)
- AI provider configuration
- Export format preferences
- Settings persistence

**Test Structure:**
```typescript
describe('useSettingsStore', () => {
  describe('Settings Management', () => {
    it('gets setting by key')
    it('sets setting value')
    it('resets setting to default')
    it('resets all settings')
  })

  describe('Theme Settings', () => {
    it('sets theme (dark/light/auto)')
    it('persists theme to localStorage')
    it('applies theme to document')
  })

  describe('Editor Settings', () => {
    it('updates font family')
    it('updates font size')
    it('updates line height')
    it('validates font size range')
  })

  describe('AI Provider', () => {
    it('sets AI provider (claude/gemini)')
    it('updates model selection')
    it('clears API credentials')
  })

  describe('Export Settings', () => {
    it('sets default export format')
    it('updates citation style')
    it('configures PDF options')
  })

  describe('Persistence', () => {
    it('loads settings from localStorage on init')
    it('saves settings to localStorage on change')
    it('handles corrupted localStorage data')
  })
})
```

**Estimated Effort:** 5-6 hours

---

### Task 4: useChatHistoryStore Tests

**File:** `src/renderer/src/store/useChatHistoryStore.ts`
**Current Coverage:** 17.5% lines, 0% functions
**Target:** 70% lines, 60% functions

**Test Areas:**
- Chat message CRUD
- Chat history per note
- Message threading
- Auto-save functionality
- Migration from old format

**Test Structure:**
```typescript
describe('useChatHistoryStore', () => {
  describe('Chat Messages', () => {
    it('adds message to chat')
    it('updates existing message')
    it('deletes message')
    it('clears all messages for note')
  })

  describe('Message Threading', () => {
    it('maintains message order')
    it('groups by note ID')
    it('handles concurrent messages')
  })

  describe('Persistence', () => {
    it('loads chat history from database')
    it('saves chat history on change')
    it('auto-saves after delay')
    it('handles save errors')
  })

  describe('Migration', () => {
    it('migrates old chat format')
    it('preserves message metadata')
    it('handles migration errors')
  })
})
```

**Estimated Effort:** 3-4 hours

---

### Task 5: useNotesStore Optimistic UI Tests

**File:** `src/renderer/src/store/useNotesStore.ts`
**Current Coverage:** 56.52% lines, 25% functions
**Target:** 80% lines, 70% functions

**Test Areas:**
- Optimistic create/update/delete
- Rollback on failure
- Snapshot/restore mechanism
- Pending operations tracking

**Test Structure:**
```typescript
describe('useNotesStore - Optimistic Updates', () => {
  describe('Optimistic Create', () => {
    it('creates note immediately in UI')
    it('assigns temporary ID')
    it('replaces with real note on success')
    it('rolls back on API failure')
    it('tracks pending create operation')
  })

  describe('Optimistic Update', () => {
    it('updates note immediately in UI')
    it('replaces with server response on success')
    it('rolls back on API failure')
    it('preserves original on rollback')
  })

  describe('Optimistic Delete', () => {
    it('removes note immediately from UI')
    it('clears selection if deleted note selected')
    it('rolls back on API failure')
    it('restores note on rollback')
  })

  describe('Snapshot/Rollback', () => {
    it('creates snapshot before optimistic update')
    it('clears snapshot on success')
    it('restores from snapshot on failure')
    it('handles missing snapshot gracefully')
  })

  describe('Pending Operations', () => {
    it('tracks operation type (create/update/delete)')
    it('clears operation on completion')
    it('handles concurrent operations')
  })
})
```

**Estimated Effort:** 4-5 hours

---

## Phase 2: Accessibility P1 - Keyboard Navigation (Week 2)

### Task 6: App.tsx Keyboard Navigation

**File:** `src/renderer/src/App.tsx`
**Current Violations:** 14 (click-events-have-key-events, no-static-element-interactions)
**Target:** 0 violations

**Fixes Required:**
- Convert clickable divs to buttons
- Add `onKeyPress` handlers for Enter/Space
- Add `tabIndex` for keyboard focus
- Test keyboard navigation flow

**Example Fix:**
```typescript
// Before
<div onClick={handleClick} className="...">
  Click me
</div>

// After
<button
  onClick={handleClick}
  className="..."
  aria-label="Descriptive label"
>
  Click me
</button>

// OR if div required for styling
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyPress={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
  aria-label="Descriptive label"
  className="..."
>
  Click me
</div>
```

**Estimated Effort:** 4-5 hours

---

### Task 7: SettingsModal Keyboard Navigation

**File:** `src/renderer/src/components/Settings/SettingsModal.tsx`
**Current Violations:** 8
**Target:** 0 violations

**Fixes Required:**
- Add keyboard handlers to all interactive elements
- Ensure tab order is logical
- Add Escape key to close modal
- Test focus trap within modal

**Estimated Effort:** 3-4 hours

---

### Task 8: ProjectsPanel & TagsPanel Keyboard Navigation

**Files:**
- `src/renderer/src/components/ProjectsPanel.tsx` (3 violations)
- `src/renderer/src/components/TagsPanel.tsx` (2 violations)

**Fixes Required:**
- Add keyboard handlers to project/tag items
- Support arrow key navigation
- Enter to select, Space to toggle
- Test keyboard-only workflow

**Estimated Effort:** 3-4 hours

---

### Task 9: Create Reusable InteractiveDiv Component

**File:** `src/renderer/src/components/InteractiveDiv.tsx` (NEW)

**Purpose:** Reusable component for keyboard-accessible divs

**Interface:**
```typescript
interface InteractiveDivProps extends React.HTMLAttributes<HTMLDivElement> {
  onClick?: () => void
  onActivate?: () => void  // Called on Enter or Space
  role?: string
  ariaLabel?: string
  children: React.ReactNode
}

export function InteractiveDiv({
  onClick,
  onActivate,
  role = 'button',
  ariaLabel,
  children,
  className,
  ...props
}: InteractiveDivProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onActivate?.()
      onClick?.()
    }
  }

  return (
    <div
      role={role}
      tabIndex={0}
      onClick={onClick}
      onKeyPress={handleKeyPress}
      aria-label={ariaLabel}
      className={className}
      {...props}
    >
      {children}
    </div>
  )
}
```

**Benefits:**
- Consistent keyboard handling across app
- Reduces code duplication
- Easy to test and maintain

**Estimated Effort:** 2 hours

---

## Phase 3: Quality Infrastructure

### Task 10: Coverage Gates in CI/CD

**Goal:** Fail build if coverage drops below baseline

**GitHub Actions Workflow:**
```yaml
- name: Run tests with coverage
  run: npm run test:coverage

- name: Check coverage thresholds
  run: |
    # Fail if coverage below thresholds
    # thresholds already in vitest.config.ts
    echo "Coverage thresholds enforced ✅"
```

**Estimated Effort:** 1-2 hours

---

### Task 11: Accessibility Testing Guidelines

**File:** `docs/testing/ACCESSIBILITY-TESTING.md` (NEW)

**Content:**
- Keyboard testing checklist
- Screen reader testing guide
- Contrast checking tools
- WCAG 2.1 compliance levels
- Automated testing with axe-core

**Estimated Effort:** 2-3 hours

---

### Task 12: Quality Metrics Dashboard

**File:** `QUALITY_METRICS.md` (NEW)

**Metrics to Track:**
- Test coverage trends (lines, functions, branches)
- Accessibility violations count
- TypeScript errors
- Bundle size
- Performance metrics

**Estimated Effort:** 2-3 hours

---

## Success Criteria

### Phase 1: Store Coverage
- ✅ All store files have 60%+ line coverage
- ✅ Critical stores (useNotesStore, useProjectStore) have 70%+ coverage
- ✅ All store actions have tests
- ✅ Error scenarios covered

### Phase 2: Accessibility P1
- ✅ Zero P1 accessibility violations
- ✅ All interactive elements keyboard-accessible
- ✅ Logical tab order throughout app
- ✅ Keyboard-only workflow tested

### Phase 3: Quality Infrastructure
- ✅ Coverage gates in CI/CD
- ✅ Accessibility testing guidelines documented
- ✅ Quality metrics dashboard created
- ✅ Baseline metrics established

---

## Estimated Timeline

### Week 1: Store Coverage
- **Day 1-2:** Task 1 (useAppViewStore) + Task 2 (useProjectStore)
- **Day 3-4:** Task 3 (useSettingsStore) + Task 4 (useChatHistoryStore)
- **Day 5:** Task 5 (useNotesStore optimistic UI tests)

### Week 2: Accessibility & Infrastructure
- **Day 1-2:** Task 6 (App.tsx) + Task 7 (SettingsModal)
- **Day 3:** Task 8 (Panels) + Task 9 (InteractiveDiv component)
- **Day 4:** Task 10 (CI/CD gates)
- **Day 5:** Task 11 (Testing guidelines) + Task 12 (Metrics dashboard)

**Total Estimated Effort:** 32-40 hours (2 weeks)

---

## Risks & Mitigation

### Risk 1: Store Tests Complex
**Mitigation:** Focus on critical paths first, defer edge cases to Sprint 36

### Risk 2: Accessibility Fixes Break Layout
**Mitigation:** Test each fix visually before committing, use CSS-only solutions where possible

### Risk 3: Coverage Gates Too Strict
**Mitigation:** Start with baseline thresholds, increase gradually

---

## Deliverables

### Code
- 5 new test files for stores
- InteractiveDiv reusable component
- Accessibility fixes in 4 components
- Coverage gates in GitHub Actions

### Documentation
- ACCESSIBILITY-TESTING.md - Testing guidelines
- QUALITY_METRICS.md - Metrics dashboard
- Updated COVERAGE_TRACKING.md with new baselines

### Metrics
- Store coverage: 23.58% → 70%+
- Overall coverage: 57.78% → 65%+
- P1 accessibility: 39 → 0 violations
- Test count: 2,405 → 2,600+

---

## Sprint 36 Preview

**Focus:** Accessibility P2 & Coverage Expansion

**Goals:**
- Fix all P2 accessibility violations (form labels)
- Increase component coverage to 80%+
- Add visual regression tests
- Performance profiling

---

**Last Updated:** 2026-01-10
**Sprint Start:** TBD
**Sprint End:** TBD +2 weeks
**Owner:** Development Team
