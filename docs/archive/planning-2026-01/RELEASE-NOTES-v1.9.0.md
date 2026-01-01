# Release Notes: v1.9.0

**Release Date:** 2025-12-31
**Type:** Minor Release
**Focus:** Settings Enhancement Complete

---

## 🎉 Highlights

### Settings Enhancement - Complete ✅

v1.9.0 delivers a comprehensive, ADHD-optimized settings system designed for focus and accessibility:

**🔍 Fuzzy Search**
- Global settings search activated with ⌘, (Command-Comma)
- Type to search across all settings, descriptions, and categories
- 300ms debounce for responsive typing
- Breadcrumb navigation to setting location

**🎨 Theme Gallery**
- Visual theme previews with color swatches
- 8 themes: 3 favorites (Slate, Nord, Dracula), 2 dark (Monokai, GitHub Dark), 3 light (Linen, Paper, Cream)
- 3-column grid layout with hover effects
- Selected theme indicated with blue border + checkmark
- Smooth scale animations on hover

**⚡ Quick Actions Customization**
- Drag-to-reorder your Quick Actions
- 5 default actions: ✨ Improve, 📝 Expand, 📋 Summarize, 💡 Explain, 🔍 Research
- Add up to 5 custom actions
- Edit prompts for any action
- Assign keyboard shortcuts (⌘⌥1-9)
- Choose AI model per action (Claude/Gemini)
- Toggle visibility (sidebar/context menu)

**📁 Project Templates**
- 5 preconfigured templates:
  - 🔬 **Research+**: Citations, lit review, analysis templates
  - 📚 **Teaching+**: Lesson plans, assignments, rubrics
  - 💻 **Dev+**: Code snippets, documentation, sprint planning
  - ✍️ **Writing+**: Creative writing, blog posts, manuscripts
  - ⚪ **Minimal**: Clean slate for custom workflows
- One-click apply with confirmation
- Expandable details showing what will change
- Success animation with 2-second feedback

**🎯 5 Settings Categories**
1. **Editor** - Font, spacing, focus mode
2. **Themes** - Visual theme selection + customization
3. **AI & Workflow** - Quick Actions, chat history, @ references
4. **Projects** - Templates, defaults, daily notes
5. **Advanced** - Performance, data management

---

## ✨ New Features

### UI Polish & Animations
- **7 new animation keyframes**: fade-in, fade-out, slide-up, slide-down, scale-in, pulse-soft, shimmer, success-bounce
- **Smooth transitions**: Tab switching with fade-in (150ms)
- **Hover effects**: Theme cards scale + shadow on hover
- **Success feedback**: Apply button bounces with green checkmark animation
- **Performance optimized**: 60fps animations, hardware acceleration

### Accessibility (WCAG 2.1 AA)
- Full screen reader support with descriptive ARIA labels
- Modal dialogs with proper role=dialog and aria-modal
- Keyboard navigation throughout settings
- Tab focus indicators
- `prefers-reduced-motion` media query support (5 instances)
- Semantic HTML with proper landmark roles

### Search & Discovery
- **Debounced search**: 300ms delay prevents unnecessary re-renders
- **Breadcrumb navigation**: "Editor › Font & Spacing › Font Size"
- **Fuzzy matching**: Powered by fuse.js for forgiving search
- **Category badges**: "3 new features" badge on AI category

---

## 🐛 Bug Fixes

- Extract `SEARCH_DEBOUNCE_MS` constant (src/renderer/src/components/Settings/SettingsModal.tsx:12)
- Improve E2E timing verification for Applied state reset (e2e/specs/project-templates.spec.ts:192-217)
- Fix Quick Actions toggle in template apply workflow (src/renderer/src/components/Settings/ProjectTemplates.tsx:116)
- Add error logging for unknown setting types (src/renderer/src/components/Settings/SettingControl.tsx:49)
- Fix Toast mock in QuickActionsSettings tests (src/renderer/src/__tests__/QuickActionsSettings.test.tsx:45-50)

---

## 🧪 Testing

### E2E Test Coverage (+21 Tests)
**New in v1.9.0:**
- **Theme Gallery** (9 tests):
  - Display all 8 themes with 3-column grid
  - Show selected theme with visual indicator
  - Change theme on click with persistence
  - Display preview colors correctly
  - Show favorite themes with star icons
  - Apply hover effects to theme cards
  - Organize themes by type (dark vs light)
  - Keyboard accessibility

- **Project Templates** (12 tests):
  - Display all 5 project templates
  - Show template icons and descriptions
  - Display template quick preview
  - Ask for confirmation before applying
  - Apply template when confirmed
  - Show/hide template details
  - Use 2-column grid layout
  - Show "None" for Minimal template Quick Actions
  - Apply different settings for different templates
  - Show hover effects on Apply button
  - Keyboard accessibility
  - Reset Applied state after 2 seconds (with timing verification)

### Test Summary
| Test Type | Count | Status |
|-----------|-------|--------|
| Unit Tests (Vitest) | 930 | ✅ All Passing |
| E2E Tests (Playwright) | 103 | ✅ All Passing |
| TypeScript Errors | 0 | ✅ Clean |
| **Total** | **1,033** | ✅ **100% Passing** |

---

## 📊 Statistics

**Code Changes:**
- **Files Modified:** 14
- **Lines Added:** +981
- **Lines Removed:** -107
- **Net Change:** +874 lines

**New Files:**
- `e2e/specs/theme-gallery.spec.ts` (156 lines)
- `e2e/specs/project-templates.spec.ts` (218 lines)
- `COMPLETION-SUMMARY-v1.8.0.md` (435 lines)

**Test Coverage:**
- Settings components: 91 unit tests
- Theme gallery: 9 E2E tests
- Project templates: 12 E2E tests
- **Total Settings Tests:** 112 tests

---

## 🔄 Migration Guide

No migration required! Settings will be initialized with sensible defaults on first open.

### First-Time Setup
1. Open Settings with ⌘, (Command-Comma)
2. Browse the 5 categories to familiarize yourself
3. Try Quick Actions customization (AI & Workflow tab)
4. Apply a Project Template if desired (Projects tab)
5. Choose your preferred theme (Themes tab)

### Upgrading from v1.8.0
- All existing settings are preserved
- New settings use defaults from `settingsSchema.ts`
- Quick Actions inherit from default configuration
- Themes remain as previously selected

---

## 📚 Documentation

### New Documentation
- **Settings Enhancement Spec** (`docs/specs/SPEC-settings-enhancement-2025-12-31.md`) - Complete 23KB specification
- **Phase 3 Plan** (`docs/PHASE-3-PLAN.md`) - Implementation details with Obsidian/Typora research
- **Completion Summary** (`COMPLETION-SUMMARY-v1.8.0.md`) - Comprehensive Sprint 27 summary

### Updated Documentation
- `.STATUS` - Updated to reflect Settings Enhancement completion
- `CLAUDE.md` - Added Settings Enhancement workflow notes
- Test documentation - 21 new E2E test descriptions

---

## 🔗 Pull Requests

- **PR #19**: Settings Enhancement Phase 3: Polish & Production Ready
  - Merged to `dev` on 2025-12-31 (commit d0d977f)
  - 17 commits, 14 files changed
  - Full code review completed
  - All feedback addressed

---

## 🎯 Breaking Changes

**None** - v1.9.0 is fully backward compatible with v1.8.0.

---

## 📦 Download

**macOS:**
- DMG installer: `Scribe-v1.9.0-macos.dmg` (via Homebrew or direct download)
- Homebrew: `brew install data-wise/tap/scribe`

**Browser Mode:**
- Launch with `scribe browser` or `npm run dev:vite`
- Full feature parity with Tauri (settings work in IndexedDB mode)

---

## 🙏 Acknowledgments

**Settings Enhancement Initiative** (Sprint 27 P2):
- Phase 1: Foundation (store, schema, search)
- Phase 2: Interactive Controls (Quick Actions, themes, templates)
- Phase 3: Polish (animations, accessibility, E2E tests)

**Code Reviews:**
- PR #16: Settings Enhancement Phase 1+2
- PR #19: Settings Enhancement Phase 3

**Testing:**
- 930 unit tests maintained
- 21 new E2E tests added
- 100% passing test suite

---

## 🔮 What's Next?

**Sprint 28 Priorities:**
- Additional P2 features (browser mode indicator, wiki link backlinks, chat session UI)
- Advanced features backlog (Ambient AI, vault sidebar, property validation)
- Performance optimizations
- User feedback integration

See `.STATUS` for detailed Sprint 28 planning.

---

## 📞 Support

**Issues:** https://github.com/Data-Wise/scribe/issues
**Documentation:** https://data-wise.github.io/scribe
**Repository:** https://github.com/Data-Wise/scribe

---

**Full Changelog:** https://github.com/Data-Wise/scribe/compare/v1.8.0...v1.9.0
