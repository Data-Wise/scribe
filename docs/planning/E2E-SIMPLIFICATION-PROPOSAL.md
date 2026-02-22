# E2E Test Simplification Proposal

**Date:** 2026-01-11
**Context:** Sprint 35 completed, 624 E2E tests with 82.5% failure rate
**Goal:** Simplify tests, reduce duplication, improve reliability

---

## 📊 Current State Analysis

### Test Suite Statistics
```
Total test files:     39 spec files
Total lines of code:  ~12,025 lines
Total tests:          624 tests
Pass rate:            17.5% (109 passing, 515 failing)
Test duration:        ~22 minutes
```

### Critical Issues Identified

#### 1. **998 Hardcoded Timeouts** ⚠️ CRITICAL
```typescript
// Anti-pattern found 998 times:
await basePage.page.waitForTimeout(200)
await basePage.page.waitForTimeout(500)
await basePage.page.waitForTimeout(1000)
```

**Problem:**
- Flaky tests (race conditions)
- Unnecessarily slow tests
- Hard to maintain

**Solution:**
- Replace with proper wait conditions
- Use `waitForSelector`, `waitForFunction`, `toBeVisible`

#### 2. **Inconsistent Page Object Usage**
```typescript
// Current anti-pattern (found in 446 places):
const contentArea = basePage.page.locator('[contenteditable="true"], .ProseMirror, textarea').first()
await contentArea.click()
await basePage.page.keyboard.press('Meta+A')
await basePage.page.keyboard.press('Backspace')
await basePage.page.keyboard.type('content')

// Should be:
await editor.setContent('content')
```

**Problem:**
- Direct DOM manipulation in tests
- Locator duplication
- Brittle selectors
- No abstraction

**Solution:**
- Enforce Page Object pattern
- Move all interactions to page objects
- Tests should only call high-level actions

#### 3. **Repetitive Test Patterns**
```typescript
// Repeated in every test file:
test.beforeEach(async ({ basePage }) => {
  await basePage.goto()
  await basePage.page.waitForTimeout(1000)
  const welcomeNote = basePage.page.locator('button:has-text("Welcome to Scribe")').first()
  await expect(welcomeNote).toBeVisible({ timeout: 5000 })
  await welcomeNote.click()
  await basePage.page.waitForTimeout(500)
})
```

**Problem:**
- Duplicated setup across 39 files
- Inconsistent implementations
- Hard to maintain

**Solution:**
- Create shared test utilities
- Standardize common operations
- Reduce boilerplate

#### 4. **Complex Locator Strings**
```typescript
// Found 315 times:
basePage.page.locator('button:has-text("...")')
basePage.page.locator('[contenteditable="true"], .ProseMirror, textarea')
basePage.page.locator('.px-4.py-2.text-xs')
```

**Problem:**
- Fragile selectors
- Hard to update
- No semantic meaning

**Solution:**
- Move to Page Objects
- Use data-testid attributes
- Semantic selector methods

---

## 🎯 Simplification Strategy

### Phase 1: Critical Infrastructure (Week 1)

#### 1.1 Remove All Hardcoded Timeouts
**Target:** 998 → 0 hardcoded timeouts

```typescript
// Before:
await button.click()
await page.waitForTimeout(500)
await expect(modal).toBeVisible()

// After:
await button.click()
await expect(modal).toBeVisible({ timeout: 5000 })
```

**Implementation:**
1. Create ESLint rule to ban `waitForTimeout`
2. Replace with proper wait conditions:
   - `toBeVisible()` for element appearance
   - `toHaveAttribute()` for state changes
   - `waitForFunction()` for complex conditions
3. Only allow in exceptional cases with comments

**Estimated savings:** ~500 lines removed, 30% faster tests

#### 1.2 Enhance Page Objects
**Target:** All interactions go through page objects

Create enhanced page object methods:
```typescript
// EditorPage enhancements:
class EditorPage {
  // High-level actions
  async clearAndType(text: string): Promise<void>
  async selectAll(): Promise<void>
  async deleteContent(): Promise<void>
  async waitForContent(text: string): Promise<void>
  async waitForMode(mode: EditorMode): Promise<void>

  // Replace hardcoded waits
  async switchMode(mode: EditorMode): Promise<void> {
    await this.modeButton(mode).click()
    await expect(this.editor).toHaveAttribute('data-mode', mode)
  }
}

// SidebarPage enhancements:
class SidebarPage {
  async expandIcon(iconType: string): Promise<void>
  async collapseIcon(iconType: string): Promise<void>
  async waitForExpanded(iconType: string): Promise<void>
  async selectProject(name: string): Promise<void>
}
```

**Estimated savings:** ~3,000 lines removed

#### 1.3 Test Utilities Module
**Target:** Eliminate repetitive setup code

```typescript
// e2e/helpers/test-utils.ts
export class TestUtils {
  static async openWelcomeNote(page: BasePage): Promise<void> {
    await page.goto()
    const note = page.page.locator('[data-testid="note-welcome"]')
    await expect(note).toBeVisible()
    await note.click()
    await expect(page.page.locator('[data-testid="editor"]')).toBeVisible()
  }

  static async createTestNote(page: BasePage, title: string): Promise<void> {
    await page.pressShortcut('n')
    await expect(page.page.locator('[data-testid="editor"]')).toBeVisible()
    const editor = new EditorPage(page.page)
    await editor.setTitle(title)
  }

  static async switchToMode(page: Page, mode: EditorMode): Promise<void> {
    const editor = new EditorPage(page)
    await editor.switchMode(mode)
  }
}
```

**Estimated savings:** ~1,500 lines removed

### Phase 2: Test Consolidation (Week 2)

#### 2.1 Identify Duplicate Tests
**Analysis needed:** Compare test scenarios across files

Example duplicates found:
- `editor-modes.spec.ts` and `comprehensive-bug-fixes.spec.ts` both test mode switching
- `tabs.spec.ts` and `ui-interactions.spec.ts` overlap on tab interactions
- Multiple files test sidebar toggle

**Action:**
1. Audit all 624 tests
2. Identify overlaps
3. Merge or remove duplicates
4. **Target:** Reduce to ~400 essential tests

#### 2.2 Simplify Test Structure
**Current structure:** 39 spec files, many with overlapping concerns

**Proposed structure:**
```
e2e/specs/
├── core/
│   ├── editor.spec.ts          # All editor tests (modes, content, shortcuts)
│   ├── navigation.spec.ts      # Tabs, sidebar, panels
│   └── projects-notes.spec.ts  # CRUD operations
├── features/
│   ├── wikilinks.spec.ts       # WikiLink rendering + navigation
│   ├── callouts.spec.ts        # Callout rendering
│   ├── latex.spec.ts           # LaTeX + math
│   └── claude-integration.spec.ts # AI features
├── ui/
│   ├── theme-appearance.spec.ts
│   ├── keyboard-shortcuts.spec.ts
│   └── settings.spec.ts
└── regression/
    └── critical-bugs.spec.ts    # Only critical regressions
```

**Consolidate:**
- `editor-modes.spec.ts` + `syntax-highlighting.spec.ts` → `core/editor.spec.ts`
- `wikilink-navigation.spec.ts` + `wikilink-rendering.spec.ts` → `features/wikilinks.spec.ts`
- `comprehensive-bug-fixes.spec.ts` → Remove (tests should be in feature files)

**Estimated savings:** 39 → 15 files, easier navigation

#### 2.3 Test Naming Convention
**Current:** Inconsistent IDs (EDM-01, WL-12, ICS-19, etc.)

**Proposed:** Semantic names
```typescript
// Before:
test('EDM-06: Click Source button switches to Source mode', ...)

// After:
test('should switch to source mode when clicking source button', ...)
test('should preserve content when switching editor modes', ...)
```

**Benefits:**
- Self-documenting
- No ID management overhead
- Easier to search/filter

### Phase 3: Advanced Patterns (Week 3)

#### 3.1 Test Data Builders
**Target:** Eliminate inline test data

```typescript
// e2e/helpers/builders.ts
export class NoteBuilder {
  private note: Partial<Note> = {}

  withTitle(title: string): this {
    this.note.title = title
    return this
  }

  withContent(content: string): this {
    this.note.content = content
    return this
  }

  withProject(projectId: string): this {
    this.note.projectId = projectId
    return this
  }

  async create(page: BasePage): Promise<Note> {
    // Use API or UI to create
  }
}

// Usage:
const testNote = await new NoteBuilder()
  .withTitle('Test Note')
  .withContent('# Hello\nTest content')
  .withProject('research')
  .create(basePage)
```

**Estimated savings:** ~800 lines, more maintainable test data

#### 3.2 Custom Assertions
**Target:** Readable, semantic assertions

```typescript
// e2e/helpers/assertions.ts
export async function expectEditorMode(page: Page, mode: EditorMode) {
  const editor = page.locator('[data-testid="hybrid-editor"]')
  await expect(editor).toHaveAttribute('data-mode', mode)

  // Also verify visual state
  if (mode === 'source') {
    await expect(page.locator('textarea.hybrid-editor-textarea')).toBeVisible()
  } else if (mode === 'live-preview') {
    await expect(page.locator('.cm-editor')).toBeVisible()
  } else {
    await expect(page.locator('.prose')).toBeVisible()
  }
}

// Usage:
await expectEditorMode(page, 'source')
```

**Estimated savings:** ~600 lines

#### 3.3 Visual Regression Testing (Optional)
**Consider:** Percy or Playwright screenshots

Only for critical UI:
- Theme gallery
- Editor modes
- Callout rendering

**Benefit:** Catch visual bugs automatically

---

## 📈 Expected Outcomes

### Metrics
| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| Total lines | 12,025 | ~6,000 | -50% |
| Spec files | 39 | ~15 | -61% |
| Test count | 624 | ~400 | -36% |
| Hardcoded timeouts | 998 | 0 | -100% |
| Test duration | 22 min | ~12 min | -45% |
| Pass rate | 17.5% | 85%+ | +67.5% |

### Code Quality
- ✅ Consistent Page Object usage
- ✅ No hardcoded waits
- ✅ Self-documenting tests
- ✅ Easy to maintain
- ✅ Fast and reliable

### Developer Experience
- Faster test runs
- Easier to add new tests
- Clear test organization
- Better failure messages

---

## 🚀 Implementation Plan

### Week 1: Critical Infrastructure
- [ ] Day 1: ESLint rule for waitForTimeout ban
- [ ] Day 2-3: Enhance Page Objects (EditorPage, SidebarPage)
- [ ] Day 4-5: Create TestUtils module
- [ ] Day 5: Remove first 100 hardcoded timeouts

### Week 2: Test Consolidation
- [ ] Day 1-2: Audit all tests, identify duplicates
- [ ] Day 3-4: Merge overlapping tests
- [ ] Day 5: Reorganize into new folder structure

### Week 3: Advanced Patterns
- [ ] Day 1-2: Test Data Builders
- [ ] Day 3: Custom Assertions
- [ ] Day 4-5: Remove remaining hardcoded timeouts

### Week 4: Validation
- [ ] Run full suite, fix any failures
- [ ] Document patterns in TESTING.md
- [ ] Update CLAUDE.md with new structure

---

## 🎓 Example Refactoring

### Before: editor-modes.spec.ts
```typescript
test('EDM-06: Click Source button switches to Source mode', async ({ basePage }) => {
  const sourceBtn = basePage.page.locator('button:has-text("Source")')
  await sourceBtn.click()
  await basePage.page.waitForTimeout(200)  // ❌ Hardcoded wait

  const editor = basePage.page.locator('[data-testid="hybrid-editor"]')
  await expect(editor).toHaveAttribute('data-mode', 'source')

  const textarea = basePage.page.locator('textarea.hybrid-editor-textarea')
  await expect(textarea).toBeVisible()
})
```

### After: core/editor.spec.ts
```typescript
test('should switch to source mode when clicking source button', async ({ basePage, editor }) => {
  await editor.switchMode('source')  // ✅ Page Object method
  await expectEditorMode(basePage.page, 'source')  // ✅ Custom assertion
})
```

**Lines reduced:** 10 → 3 (70% reduction)
**Maintainability:** ⬆️ Much better
**Reliability:** ⬆️ No race conditions

---

## 💡 Quick Wins (Can Start Today)

### 1. ESLint Rule
```json
// .eslintrc.js
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "CallExpression[callee.property.name='waitForTimeout']",
        "message": "Use proper wait conditions instead of waitForTimeout. See TESTING.md for patterns."
      }
    ]
  }
}
```

### 2. Enhanced EditorPage (PR Ready)
- Add `clearAndType`, `selectAll`, `deleteContent` methods
- Remove hardcoded waits from existing methods
- ~50 lines of code, saves ~500 lines in tests

### 3. Consolidate WikiLink Tests
- Merge `wikilink-navigation.spec.ts` + `wikilink-rendering.spec.ts`
- Remove duplicate scenarios
- ~300 lines removed

---

## ❓ Questions for Review

1. **Priority:** Which phase should we start with?
   - Recommendation: Phase 1 (infrastructure) - biggest impact

2. **Scope:** Should we fix all 515 failing tests or focus on simplification?
   - Recommendation: Simplify first, then fix failures

3. **Breaking changes:** Can we remove duplicate tests or should we keep for now?
   - Recommendation: Remove duplicates, keep only essential tests

4. **Timeline:** 3 weeks realistic?
   - Recommendation: Yes, but can extend to 4 weeks if needed

---

## 📚 References

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Test Fixtures](https://playwright.dev/docs/test-fixtures)
- Current E2E structure: `e2e/` directory

---

**Next Step:** Review this proposal and approve Phase 1 implementation
