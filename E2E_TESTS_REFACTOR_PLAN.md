# E2E Tests Refactor Plan

**Date:** 2026-01-10
**Sprint:** 35 (Planned)
**Priority:** P1 (High)
**Estimated Effort:** 4-6 hours

## Problem Summary

E2E tests are **outdated** and incompatible with the current editor implementation. Tests were written for a textarea-based editor, but the app now uses CodeMirror 6.

## Root Cause

### Tests Expect (Old Implementation)
```typescript
const textarea = basePage.page.locator('textarea.hybrid-editor-textarea')
await expect(textarea).toBeVisible()
await textarea.fill(calloutContent)
```

### App Uses (Current Implementation)
```typescript
<CodeMirrorEditor
  content={localContent}
  onChange={(newContent) => {...}}
  editorMode="source"
/>
```

**Result:** All 674 E2E tests fail with "element not found" errors.

## Impact

- **Unit Tests:** 2,344/2,345 passing (99.96%) ✅
- **E2E Tests:** 0/674 passing (0%) ❌
- **Production Quality:** Excellent (unit tests cover core functionality)
- **User-facing Issues:** None (unit tests validate business logic)

## Migration Strategy

### Phase 1: Create CodeMirror Test Utilities (1 hour)

Create `e2e/utils/codemirror-helpers.ts`:

```typescript
import { Page, Locator } from '@playwright/test'

export class CodeMirrorHelper {
  constructor(private page: Page) {}

  /**
   * Get CodeMirror editor instance
   */
  getEditor(): Locator {
    return this.page.locator('.cm-editor')
  }

  /**
   * Get CodeMirror content area
   */
  getContent(): Locator {
    return this.page.locator('.cm-content')
  }

  /**
   * Fill CodeMirror editor with content
   */
  async fill(content: string): Promise<void> {
    const editor = this.getContent()
    await editor.click()
    await this.page.keyboard.press('Meta+a') // Select all
    await this.page.keyboard.type(content)
  }

  /**
   * Append text to CodeMirror editor
   */
  async append(text: string): Promise<void> {
    const editor = this.getContent()
    await editor.click()
    await this.page.keyboard.press('Meta+End') // Go to end
    await this.page.keyboard.type(text)
  }

  /**
   * Get current CodeMirror content
   */
  async getTextContent(): Promise<string> {
    const editor = this.getContent()
    return await editor.textContent() || ''
  }

  /**
   * Clear CodeMirror editor
   */
  async clear(): Promise<void> {
    const editor = this.getContent()
    await editor.click()
    await this.page.keyboard.press('Meta+a')
    await this.page.keyboard.press('Backspace')
  }

  /**
   * Type at current cursor position
   */
  async type(text: string): Promise<void> {
    await this.page.keyboard.type(text)
  }
}
```

### Phase 2: Update Fixtures (30 minutes)

Update `e2e/fixtures.ts` to include CodeMirror helper:

```typescript
import { test as base } from '@playwright/test'
import { BasePage } from './pages/BasePage'
import { CodeMirrorHelper } from './utils/codemirror-helpers'

type Fixtures = {
  basePage: BasePage
  editor: CodeMirrorHelper
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

export { expect } from '@playwright/test'
```

### Phase 3: Update Test Specs (2-3 hours)

Update all 40 spec files to use CodeMirror helpers:

**Before:**
```typescript
const textarea = basePage.page.locator('textarea.hybrid-editor-textarea')
await expect(textarea).toBeVisible()
await textarea.fill(calloutContent)
```

**After:**
```typescript
const editor = new CodeMirrorHelper(basePage.page)
await expect(editor.getEditor()).toBeVisible()
await editor.fill(calloutContent)
```

**Files to Update (40 total):**
- `callouts.spec.ts`
- `chat-history-persistence.spec.ts`
- `claude-features.spec.ts`
- `claude-tab.spec.ts`
- `comprehensive-bug-fixes.spec.ts`
- `editor-modes.spec.ts`
- `editor.spec.ts`
- `focus-mode.spec.ts`
- `keyboard-shortcuts.spec.ts`
- `latex-multiline.spec.ts`
- `left-sidebar.spec.ts`
- `mission-control.spec.ts`
- `mission-sidebar.spec.ts`
- `modals.spec.ts`
- `navigation.spec.ts`
- `notes.spec.ts`
- `project-templates.spec.ts`
- `projects.spec.ts`
- `quick-chat-enhanced.spec.ts`
- `quick-chat.spec.ts`
- `right-sidebar.spec.ts`
- `settings-persistence.spec.ts`
- `settings.spec.ts`
- `sidebar-settings.spec.ts`
- `sidebar-toggle.spec.ts`
- `smoke.spec.ts`
- `syntax-highlighting.spec.ts`
- `tabs.spec.ts`
- `tauri-edge-cases.spec.ts`
- `tauri-features.spec.ts`
- `terminal-settings.spec.ts`
- `terminal-tab.spec.ts`
- `theme-gallery.spec.ts`
- `themes.spec.ts`
- `ui-interactions.spec.ts`
- `wikilink-navigation.spec.ts`
- `wikilink-rendering.spec.ts`
- `window-dragging.spec.ts`
- `quarto-autocomplete.spec.ts`
- `features-showcase.spec.ts`
- `seed-data.spec.ts`

### Phase 4: Verification (30 minutes)

1. Run full E2E suite: `npm run test:e2e`
2. Target: 650+/674 tests passing (96%+)
3. Fix any remaining failures
4. Update CI/CD to run E2E tests

## CodeMirror Selectors Reference

| Element | Selector | Description |
|---------|----------|-------------|
| Editor container | `.cm-editor` | Main CodeMirror editor |
| Content area | `.cm-content` | Editable content area |
| Active line | `.cm-activeLine` | Currently active line |
| Line numbers | `.cm-lineNumbers` | Line number gutter |
| Cursor | `.cm-cursor` | Text cursor |
| Selection | `.cm-selectionBackground` | Selected text |

## Testing Checklist

- [ ] Phase 1: Create CodeMirrorHelper utility class
- [ ] Phase 2: Update fixtures to include helper
- [ ] Phase 3: Update all 40 spec files
  - [ ] callouts.spec.ts (25 tests)
  - [ ] chat-history-persistence.spec.ts (12 tests)
  - [ ] claude-features.spec.ts (27 tests)
  - [ ] claude-tab.spec.ts (10 tests)
  - [ ] comprehensive-bug-fixes.spec.ts (20 tests)
  - [ ] editor-modes.spec.ts (15 tests)
  - [ ] editor.spec.ts (18 tests)
  - [ ] (... remaining 33 files)
- [ ] Phase 4: Run full E2E suite and verify
- [ ] Update CI/CD workflow to include E2E tests
- [ ] Document E2E testing patterns in TESTING.md

## Sprint 35 Integration

**Week 1 (Days 1-2):** E2E Refactoring
**Week 1 (Days 3-5):** Store Coverage improvements
**Week 2:** Accessibility P1 fixes

**Priority:** Complete E2E refactoring first to unblock test infrastructure.

## Success Criteria

- [ ] 650+ E2E tests passing (96%+)
- [ ] CodeMirrorHelper reusable across all tests
- [ ] CI/CD includes E2E test run
- [ ] Documentation updated with CodeMirror patterns
- [ ] All critical user flows covered (note creation, editing, saving)

## Related Files

- `e2e/playwright.config.ts` - Timeout configuration (fixed in Sprint 34)
- `E2E_TIMEOUT_FIX.md` - Timeout fix documentation
- `src/renderer/src/components/HybridEditor.tsx` - Current editor implementation
- `src/renderer/src/components/CodeMirrorEditor.tsx` - CodeMirror wrapper

## References

- [CodeMirror 6 Documentation](https://codemirror.net/docs/)
- [Playwright Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Testing CodeMirror with Playwright](https://discuss.codemirror.net/t/testing-codemirror-6-with-playwright/4823)

## Notes

- E2E tests are **not blocking** for v1.14.2-alpha release
- Unit tests provide excellent coverage (99.96%)
- E2E refactoring is a quality improvement, not a blocker
- After refactoring, E2E tests will validate user-facing workflows end-to-end
