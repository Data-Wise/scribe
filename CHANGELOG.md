# Changelog

All notable changes to Scribe will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [v1.10.0] - 2026-01-01

### Sprint 28: Live Editor Enhancements - Complete

**Major editor upgrade with Obsidian-style Live Preview mode, professional LaTeX math rendering, and critical bug fixes.**

### Added

**Live Preview Mode (CodeMirror 6):**
- Three editor modes: Source (⌘1), Live Preview (⌘2), Reading (⌘3)
- ⌘E to cycle between modes
- Obsidian-style syntax hiding (hides when cursor elsewhere, reveals on click)
- Real-time markdown rendering with CodeMirror 6
- Custom ViewPlugin for rich markdown editing
- Headers, emphasis, code, links, lists all render live
- Bullet points replace `-` and `*` list markers

**LaTeX Math Rendering (KaTeX):**
- Inline math support: `$E=mc^2$` renders inline
- Display math support: `$$\int_0^1 x^2 dx$$` renders centered
- Click-to-edit functionality for rendered math
- Professional typesetting quality
- Error handling for invalid LaTeX

**Keyboard Shortcuts:**
- ⌘1 - Switch to Source mode
- ⌘2 - Switch to Live Preview mode
- ⌘3 - Switch to Reading mode
- ⌘E - Cycle through modes
- Escape in Reading mode - Return to Source

**New Dependencies (6 packages):**
- `@codemirror/lang-markdown` ^6.5.0
- `@codemirror/language-data` ^6.5.2
- `@codemirror/state` ^6.5.3
- `@codemirror/view` ^6.39.8
- `@uiw/react-codemirror` ^4.25.4
- `katex` ^0.16.27 + `@types/katex` ^0.16.7

### Fixed

**CRITICAL: Controlled Component Race Condition:**
- Fixed character loss during rapid typing
- Implemented local state with controlled sync patterns
- Location: `HybridEditor.tsx:66-74`
- Impact: No more lost characters during fast typing

**New Notes Not Opening in Tabs:**
- Fixed: Creating new notes (⌘N) now opens editor tabs correctly
- Added `openNoteTab()` call alongside `selectNote()`
- Impact: Consistent tab behavior across all note creation methods

### Changed

**Editor Architecture:**
- Updated editor stack from BlockNote to HybridEditor (CodeMirror 6 + ReactMarkdown)
- Three-mode architecture for flexible editing experience
- Mode switching preserves content across transitions

### Removed

**Dependency Cleanup (8 packages):**
- All 7 `@milkdown/*` packages (unused experiment)
- `codemirror-rich-markdoc` (unused)
- Net change: -64 packages in node_modules

### Documentation

- Added `RELEASE-SUMMARY-v1.10.0.md` (337 lines)
- Added `docs/LIVE-LATEX-RENDERING-RESEARCH.md` (616 lines)
- Added `e2e/README.md` (456 lines)
- Added `e2e/specs/comprehensive-bug-fixes.spec.ts` (630 lines)
- Updated `CLAUDE.md` with Sprint 28 completion status and test results

### Testing

- ✅ TypeScript: Clean compilation (0 errors)
- ✅ Unit Tests: 930/930 passed (34 test files)
- ✅ E2E Tests: 12/12 editor tests passed
- ✅ Build: Successful (5.48s)

### Technical Details

- **PR Merged:** #21 - Live Editor Enhancements with Obsidian-style Preview
- **Files Changed:** 12
- **Lines Added:** 3,807
- **Lines Removed:** 28
- **Release:** https://github.com/Data-Wise/scribe/releases/tag/v1.10.0

---

## [v1.9.0] - 2025-12-31

### Sprint 27 P2: Settings Enhancement - Complete

**ADHD-optimized settings system with fuzzy search, Quick Actions customization, theme gallery, and project templates.**

### Added

**Settings System Foundation:**
- Comprehensive settings modal with 5 categories (Editor, Themes, AI & Workflow, Projects, Advanced)
- Zustand store for settings state management (427 lines)
- Settings schema with 40+ configurable settings (426 lines)
- ⌘, keyboard shortcut to open settings modal
- Export/import functionality for settings backup
- Badge system for new features (shows count on category tabs)

**Fuzzy Search:**
- Global settings search with 300ms debounce
- Search across labels, descriptions, and breadcrumbs
- Powered by fuse.js for forgiving fuzzy matching
- Breadcrumb navigation (e.g., "Editor › Font & Spacing › Font Size")
- Instant results with highlighted matches

**Quick Actions Customization:**
- Drag-to-reorder Quick Actions (@dnd-kit/sortable)
- 5 default actions: ✨ Improve, 📝 Expand, 📋 Summarize, 💡 Explain, 🔍 Research
- Add up to 5 custom actions
- Edit prompts for any action
- Assign keyboard shortcuts (⌘⌥1-9)
- Choose AI model per action (Claude/Gemini)
- Toggle visibility (sidebar/context menu)
- Delete custom actions
- Display options (sidebar/context menu toggles)

**Theme Gallery:**
- Visual theme previews with color swatches
- 8 themes: 3 favorites (Slate, Nord, Dracula), 2 dark (Monokai, GitHub Dark), 3 light (Linen, Paper, Cream)
- 3-column grid layout with 4px gap
- Selected theme indicated with blue border + checkmark icon
- Star icons for favorite themes
- Smooth scale animations on hover (scale-105)
- Dark vs Light theme organization

**Project Templates:**
- 5 preconfigured templates with one-click apply:
  - 🔬 Research+ (citations, lit review, analysis)
  - 📚 Teaching+ (lesson plans, assignments, rubrics)
  - 💻 Dev+ (code snippets, documentation, sprints)
  - ✍️ Writing+ (creative writing, blog posts, manuscripts)
  - ⚪ Minimal (clean slate for custom workflows)
- Template cards with icon, description, and preview
- Confirmation dialog before applying
- Expandable details section ("What will change")
- 2-column grid layout
- Success animation with bounce effect (2s timeout)

**Individual Setting Controls:**
- 7 control types: toggle, select, text, number, color, gallery, keymap
- Universal SettingControl component (418 lines)
- Type-safe rendering based on setting.type
- Auto-wired to settings store
- Error handling for unknown types

**UI Animations:**
- 7 new Tailwind animation keyframes:
  - `fade-in` (150ms) - Tab switching, search results
  - `fade-out` (150ms) - Modal exit
  - `slide-up` (200ms) - Panels
  - `slide-down` (200ms) - Dropdowns
  - `scale-in` (200ms) - Modals
  - `pulse-soft` (2s) - Loading states
  - `shimmer` (2s) - Skeleton screens
  - `success-bounce` (600ms) - Success feedback
- Smooth 60fps transitions
- Hardware-accelerated transforms

**Accessibility (WCAG 2.1 AA):**
- Full screen reader support with ARIA labels
- Modal: `role=dialog`, `aria-modal`, `aria-labelledby`
- Search: `role=searchbox`, `aria-label`
- Tabs: `role=tab`, `aria-selected`, `aria-controls`
- Tab panels: `role=tabpanel` with matching IDs
- Buttons: Descriptive `aria-label` attributes
- Icons: `aria-hidden=true` (decorative)
- `prefers-reduced-motion` media query support (5 instances)

**Testing:**
- 91 new unit tests for Settings components
- 21 new E2E tests:
  - Theme gallery (9 tests): rendering, selection, persistence, hover, favorites, keyboard nav
  - Project templates (12 tests): rendering, apply workflow, confirmation, details, keyboard nav
- Total test coverage: 930 unit + 103 E2E = 1,033 tests

**Documentation:**
- Complete Settings Enhancement spec (23KB, 661 lines)
- Phase 3 implementation plan with Obsidian/Typora research
- Completion summary (435 lines)
- E2E test documentation

### Fixed

- Extract `SEARCH_DEBOUNCE_MS = 300` constant (eliminates magic number)
- Improve E2E timing verification for Applied state reset (validates 2s timeout)
- Fix Quick Actions toggle in template apply workflow (actually toggles actions)
- Add error logging for unknown setting types (console.error with context)
- Fix Toast mock in QuickActionsSettings tests (correct import path)

### Changed

- Search debounce comment updated ("wait for user to stop typing" vs "300ms")
- E2E test for Applied state now verifies timing before AND after 2s
- ProjectTemplates component now properly calls `toggleQuickAction`

### Performance

- Search debounce prevents excessive re-renders (300ms delay)
- Animations optimized for 60fps (GPU acceleration)
- Reduced motion support for accessibility
- Smooth tab transitions with fade-in effect

### Technical

- `src/renderer/src/store/useSettingsStore.ts` - Zustand settings store (474 lines)
- `src/renderer/src/lib/settingsSchema.ts` - Settings schema (426 lines)
- `src/renderer/src/components/Settings/SettingsModal.tsx` - Main modal (300+ lines)
- `src/renderer/src/components/Settings/QuickActionsSettings.tsx` - Quick Actions UI (486 lines)
- `src/renderer/src/components/Settings/ThemeGallery.tsx` - Theme picker (251 lines)
- `src/renderer/src/components/Settings/ProjectTemplates.tsx` - Template picker (269 lines)
- `src/renderer/src/components/Settings/SettingControl.tsx` - Universal control (418 lines)
- `tailwind.config.js` - 7 new animation keyframes
- `e2e/specs/theme-gallery.spec.ts` - E2E tests (156 lines)
- `e2e/specs/project-templates.spec.ts` - E2E tests (218 lines)

---

## [v1.8.0] - 2025-12-31

### Sprint 27 P1: Backend Foundation - Complete (2025-12-31)

**Chat history persistence, Quick Actions, comprehensive testing.**

### Sprint 27 P1: Backend Foundation - Complete (2025-12-31)

**Chat history persistence, Quick Actions, comprehensive testing.**

### Added

**Chat History Persistence (Migration 009):**
- `chat_sessions` and `chat_messages` tables with CASCADE foreign keys
- One persistent session per note (auto-created on first use)
- Auto-save every user and AI message to SQLite/IndexedDB
- Auto-load conversation history when opening note
- Session switching when navigating between notes
- `getOrCreateChatSession`, `saveChatMessage`, `loadChatSession` Tauri commands
- `clearChatSession`, `deleteChatSession` for cleanup

**Quick Actions:**
- 5 one-click AI prompts in Claude chat panel:
  - ✨ Improve - "Improve clarity and flow"
  - 📝 Expand - "Expand on this idea"
  - 📋 Summarize - "Summarize in 2-3 sentences"
  - 💡 Explain - "Explain this simply"
  - 🔍 Research - "What does research say about this?"
- Auto-includes full note context
- Works with @ References for multi-note context

**@ References:**
- Type `@` in chat to autocomplete note titles
- Visual badge UI for referenced notes
- Includes referenced note content in AI context
- Filter autocomplete by typing after `@`
- Remove references with click

**Testing:**
- 12 new backend tests (chat_history_tests.rs)
- 38 new frontend tests (Quick Actions + persistence)
- 67 new E2E tests (3 comprehensive spec files):
  - `chat-history-persistence.spec.ts` (12 tests)
  - `claude-features.spec.ts` (27 tests)
  - `quick-chat-enhanced.spec.ts` (20 tests)
- Total test coverage: Backend (15), Frontend (829), E2E (67)

**Documentation:**
- Complete chat persistence guide (`docs/guide/chat-persistence.md`)
- Quick Actions reference card (`docs/reference/REFCARD-QUICK-ACTIONS.md`)
- Database schema documentation
- Mermaid sequence diagrams

### Fixed

- Tauri API serialization for Note properties (JSON stringify/parse)
- Frontend persistence integration (session/message auto-save)
- Browser mode database exposure for E2E tests (`window.scribeDb`)

### Technical

- `src-tauri/src/database.rs` - Migration 009, chat CRUD operations
- `src-tauri/src/tests/chat_history_tests.rs` - Backend test suite
- `src/renderer/src/components/ClaudeChatPanel.tsx` - Persistence wiring
- `src/renderer/src/lib/browser-db.ts` - IndexedDB chat tables
- `e2e/specs/` - Comprehensive E2E test coverage

---

## [v1.6.0] - 2025-12-31

### Sprint 26: Terminal & Right Sidebar - Complete

**Full PTY terminal with smart working directory, plus UI fixes.**

### Added

**Terminal PTY Shell:**
- Full PTY terminal via portable-pty crate
- xterm.js frontend with Scribe dark theme
- Bidirectional communication (input/output)
- Shell resize events propagated to PTY
- Clickable URLs (WebLinksAddon)
- Terminal icon in right sidebar Activity Bar

**Terminal Working Directory:**
- Smart CWD inference based on project type:
  - Research → `~/projects/research/[name]`
  - Teaching → `~/projects/teaching/[name]`
  - R Package → `~/projects/r-packages/[name]`
  - R Dev → `~/projects/dev-tools/[name]`
  - Generic → `~/projects/[name]`
- Project settings support for custom `workingDirectory`
- App settings for configurable default folder
- Graceful fallback to `~` if path doesn't exist
- Demo projects skip inference (Getting Started, Research)
- Current directory shown in terminal header

**E2E Tests:**
- 20 new Playwright tests for Terminal, Modals, Sidebar Toggle
- Comprehensive UI interaction coverage

### Fixed

- CSS drag region blocking tab/button clicks (removed from titlebar)
- Terminal graceful fallback when PTY not available

### Technical

- `src-tauri/src/terminal.rs` - PTY spawn, resize, write, kill commands
- `src/renderer/src/lib/terminal-utils.ts` - Path inference, app settings
- `src/renderer/src/components/TerminalPanel.tsx` - xterm.js integration
- Tauri events: `shell-output`, `shell-closed` for async communication

---

### Sprint 25: Plan B UI Redesign - Complete (2025-12-28)

**ADHD-friendly sidebar overhaul with expandable project notes and browser mode support.**

### Added

**Phase 1: Editor Tabs** ✅
- EditorTabs component with gradient accent bar (Style 5)
- Tab state management in useAppViewStore with Zustand
- localStorage persistence for open tabs and active tab
- Mission Control pinned as permanent first tab
- Keyboard shortcuts: ⌘1-9 switch tabs, ⌘W close current tab
- Middle-click to close non-pinned tabs

**Phase 2: Note Selection & Project Defaults** ✅
- Note selection from sidebar opens in editor tabs
- Default "Research" project for first-time users
- Proper tab/editor integration throughout

**Phase 3: Sidebar Note Display (Option B)** ✅
- Removed redundant "Recent Notes" section from sidebar
- CardViewMode: Expandable note tiles inside project cards
  - Click stats row to expand/collapse (accordion behavior)
  - Shows up to 6 recent notes per project
  - Note tiles with title + time ago
  - Empty state with "Create first note" CTA
  - Right-click notes for context menu
- CompactListMode: Notes shown when project expanded
  - Shows up to 5 notes per project
  - "+X more" indicator for additional notes

**Phase 4: Browser Mode Indicator** ✅
- Visual badge in EditorTabs when running in browser mode
- Globe icon + "BROWSER" text (subtle blue styling)
- Tooltip explains IndexedDB persistence

**Phase 5: Right Sidebar Enhancements** ✅
- Icon-only collapsed mode (⌘⇧B to toggle)
- Collapse to 48px icon strip with Properties/Backlinks/Tags buttons
- Click icon to expand and switch to that tab
- Keyboard shortcuts: ⌘] next tab, ⌘[ previous tab
- Icons added to expanded tab headers for visual consistency
- Collapse state persisted in localStorage

### Fixed

- Tab clicks not working in browser mode (titlebar drag region blocking)
- Platform class detection (.tauri/.browser) for CSS targeting
- Tab-to-note sync: clicking tabs now updates editor content

**Testing** ✅
- 27 new CardViewMode tests (edge cases, interactions)
- 30 new CompactListMode tests (full coverage)
- Total: 666 tests passing

### Changed

- CardViewMode project cards now expandable (in-place growth)
- Chevron rotates 180° when project expanded
- Active project sorted to top in both view modes

### Technical

- `expandedProjectId` state for accordion behavior
- `notesByProject` computed map for note grouping
- Fixed DOM nesting warning (button inside button → div with role="button")
- Platform detection via `isBrowser()` for conditional rendering

### New Components

- `EditorTabs/EditorTabs.tsx` - Tab bar with gradient accents
- `EditorTabs/EditorTabs.css` - Tab and browser badge styling

### Test Files

- `__tests__/CardViewMode.test.tsx` - 27 tests
- `__tests__/CompactListMode.test.tsx` - 30 tests
- `__tests__/Sidebar.test.tsx` - Updated for CardViewMode

### Documentation

- `docs/planning/BRAINSTORM-PROJECT-NOTE-DISPLAY.md` - Option B design doc

---

## [1.2.1] - 2025-12-30

### Tauri Feature Parity & Error Visibility

**Improvements to Tauri native app experience, error feedback, and test coverage.**

### Added

**Demo Data Seeding (Tauri):**
- New users in Tauri now see demo content on first launch
- Migration 007 seeds: 1 project, 3 notes, 3 tags
- Matches browser experience with "Getting Started" content
- Wiki links between demo notes demonstrate backlinks feature

**Toast Notifications:**
- Visible error feedback for API failures
- Success toasts for CRUD operations (notes, projects, tags)
- Toast component with error/success/info variants
- Auto-dismiss after 4 seconds
- Click to dismiss immediately

**Unified Seed Data:**
- `seed-data.ts` shared constants for browser/Tauri parity
- DEMO_PROJECT, DEMO_TAGS, DEMO_NOTES exports
- browser-db.ts updated to use shared seed data

**Edge Case & Stress Tests (22 tests):**
- EDGE-01 to EDGE-15: Edge cases
  - Empty/whitespace content handling
  - Long titles (500+ chars), large documents (10k+ chars)
  - Unicode, emoji, RTL text support
  - XSS and SQL injection sanitization
  - Rapid note switching, concurrent operations
- STRESS-01 to STRESS-07: Stress tests
  - Rapid note creation (10 notes in quick succession)
  - Rapid keyboard shortcuts
  - Fast typing in editor
  - Multiple page reloads
  - Concurrent sidebar toggles

**Tauri Feature Tests (25 tests):**
- TAU-01 to TAU-25: Feature parity verification
- Demo data seeding tests
- Toast notification tests
- Platform detection tests

**Diagnostics:**
- Enhanced platform detection logging
- First note/project logged on startup
- Better error stack traces in console

### Documentation

- `docs/TAURI-BROWSER-FEATURE-REVIEW.md` - Comprehensive parity audit
  - 43 matched API commands documented
  - Root cause analysis for discrepancies
  - Recommended action plan
- `docs/TAURI-WEBDRIVER-RESEARCH.md` - WebDriver E2E research
  - Platform support analysis (Windows/Linux native, macOS paid only)
  - Setup instructions for tauri-driver
  - Recommendation to defer (macOS limitation)

### Technical

- `src/renderer/src/components/Toast.tsx` - Toast component + context
- `src/renderer/src/lib/api.ts` - `withToast()` wrapper for success/error
- `src/renderer/src/lib/seed-data.ts` - Shared demo data constants
- `src-tauri/src/database.rs` - Migration 007 (demo data)
- `e2e/specs/tauri-features.spec.ts` - 25 feature parity tests
- `e2e/specs/tauri-edge-cases.spec.ts` - 22 edge case/stress tests

---

## [1.2.0] - 2025-12-27

### Mission Control - Dashboard-First Experience

**ADHD-friendly dashboard with quick actions and project overview.**

### Added

**Mission Control Dashboard:**
- Dashboard-first experience with project overview
- Smart startup: >4 hours away → Dashboard, else resume editor
- View mode toggle with `⌘0` (zero key)
- Project cards grid with type icons, status dots, timestamps
- Quick Actions bar: Daily Note (⌘D), New Note (⌘N), Quick Capture (⌘⇧C)

**Quick Capture Overlay:**
- `⌘⇧C` opens quick capture modal
- Cmd+Enter to save, Escape to cancel
- Auto-generates title from first line
- Saves to inbox

**Streak Display (Opt-in):**
- Milestone celebrations at 7/30/100/365 days
- Default OFF (ADHD-friendly, avoids anxiety)
- Toggle in Settings → General → "Show streak milestones"

**New Components:**
- `MissionControl.tsx` - Dashboard container
- `ProjectCard.tsx` - Project display cards
- `QuickActions.tsx` - Action buttons
- `QuickCaptureOverlay.tsx` - Capture modal
- `StreakDisplay.tsx` - Milestone display
- `DragRegion.tsx` - Window dragging component
- `useAppViewStore.ts` - View mode state

### Fixed

- Window dragging now works (added `core:window:allow-start-dragging` permission)
- Changed `⌘H` to `⌘0` (⌘H is macOS "Hide Window")

### Technical

- Tauri 2 `startDragging()` API for reliable window dragging
- Zustand store for view mode with localStorage persistence
- Session timestamp tracking for smart startup

---

## [1.1.0] - 2025-12-27

### v1.1 Feature Release

**Three major features to enhance workflow and productivity:**

### Added

**Project System (Sprint 18):**
- 5 project types: research, teaching, r-package, r-dev, generic
- Project switcher dropdown in left sidebar
- Project-scoped note filtering
- Create Project modal with type selector
- Database migration for projects table (migration_004)
- Zustand store with localStorage persistence
- Rust CRUD commands for project management

**Note Search (Sprint 19):**
- SearchPanel component with ⌘F shortcut
- Scope selector (All Notes / Current Project)
- Debounced 150ms real-time search using FTS5
- Keyboard navigation (↑↓ Navigate, ↵ Open, Esc Close)
- Highlighted search matches with content snippets
- Added to keyboard shortcuts cheatsheet

**Scribe CLI (Sprint 20):**
- Terminal-based note access via `scribe` command
- 10 commands: new, daily, search, capture, list, open, edit, tags, folders, stats
- Quick aliases: sd (daily), sc (capture), ss (search), sl (list), sn (new)
- FTS5 full-text search integration
- Tab completion for commands and folders
- Color-coded output with folder indicators
- Auto-sourced in `.zshrc`
- Location: `~/.config/zsh/functions/scribe.zsh`

### Fixed

- Cleaned 16 TypeScript unused variable warnings (TS6133)
- Rust compilation warnings (unused imports)

### Technical

- New components: SearchPanel.tsx, ProjectSwitcher.tsx, CreateProjectModal.tsx
- New store: useProjectStore.ts
- Database: migration_004 adds projects table and note.project_id
- CSS: Search panel styles with animations
- Tests: 483 passing

---

## [1.0.0] - 2025-12-27

### First Stable Release

**Scribe v1.0 is the first stable release of the ADHD-friendly distraction-free writer.**

### Highlights

- **Zero-friction writing** - Start writing in < 3 seconds with global hotkey (⌘⇧N)
- **ADHD-friendly design** - Minimal UI, focus mode, celebration micro-interactions
- **Academic features** - LaTeX math, citation autocomplete, BibTeX/Zotero integration
- **Knowledge management** - Wiki-links, backlinks, hierarchical tags, daily notes
- **Beautiful themes** - 10 built-in themes (5 dark, 5 light) with auto-switching
- **Comprehensive testing** - 483 tests passing

### Features

**Editor:**
- HybridEditor++ (contenteditable + markdown preview)
- Live wiki-link `[[...]]` highlighting with cursor-following autocomplete
- Live tag `#tag` highlighting with hierarchical support (`#project/research`)
- Pill-style Write/Preview mode toggle (⌘E)
- Focus mode with typewriter scrolling (⌘⇧F)
- Word count with goal tracking and celebration animations

**ADHD-Friendly Enhancements:**
- Celebration micro-interactions at word milestones (100, 250, 500, 750, 1000+)
- Session timer and word delta tracking (+127 ⬆️)
- Keyboard shortcut cheatsheet (⌘?)
- Skeleton loading states (subtle, non-distracting)
- All animations respect `prefers-reduced-motion`

**Tags System:**
- Hierarchical tags with path notation (`#research/statistics`)
- Tag sorting options (alphabetical, by count, by recent)
- Tag color indicators and count badges
- Orphan tag detection and registration
- Recent tags section (tracks last 8, shows top 5)
- Right-click context menu (Rename/Delete)

**Themes & Fonts:**
- 10 built-in ADHD-friendly themes
- Auto-theme by time of day (light 6am-6pm)
- Custom theme creator with live preview
- Import/export themes (JSON, Base16 YAML, URL)
- 14 recommended ADHD-friendly fonts with one-click install

**Knowledge Graph & Templates:**
- D3 force-directed knowledge graph visualization
- Daily notes with 5 built-in templates + custom
- Backlinks panel with link statistics
- Markdown export with frontmatter

**Academic:**
- MathJax 3 for LaTeX rendering ($...$ inline, $$...$$ display)
- Citation autocomplete (@trigger)
- BibTeX/Zotero integration
- Export to PDF, Word, LaTeX, HTML (via Pandoc)
- 5 citation styles (APA, Chicago, MLA, IEEE, Harvard)

**Commands:**
- Global hotkey ⌘⇧N opens app from anywhere
- Command palette ⌘K with 6 quick actions
- Keyboard shortcuts: ⌘N, ⌘D, ⌘B, ⌘⇧B, ⌘⇧E, ⌘⇧G

### Technical Stack

| Layer | Technology |
|-------|------------|
| Shell | Tauri 2 |
| UI | React 18 |
| Editor | HybridEditor++ |
| Styling | Tailwind CSS |
| State | Zustand |
| Database | SQLite (rusqlite) |
| AI | Claude/Gemini CLI |
| Testing | Vitest + Testing Library |

### Test Coverage

- 483 tests passing
- 14 test files covering all major components
- Integration tests for ADHD-friendly design verification

---

## [Unreleased]

### Sprint 10.5: Theme & Font System (2024-12-26)

**Theme System:**
- 10 built-in ADHD-friendly themes (5 dark, 5 light)
  - Dark: Calm Night, Deep Focus, Midnight, Warm Dark, Nord Dark
  - Light: Soft Cream, Morning Light, Sepia, Clean White, Nord Light
- Auto-theme by time of day (light 6am-6pm, dark otherwise)
- Custom theme creator with live preview
- Theme import/export (JSON format)
- Base16 YAML import (256+ community schemes)
- Import themes from URL (GitHub Gists, raw URLs)
- Theme keyboard shortcuts (Cmd+Alt+0-9, editable in Settings)
- Live theme preview on hover

**Font Management:**
- Font settings panel (family, size, line height)
- 14 ADHD-friendly font recommendations with research-backed benefits:
  - Accessibility: Atkinson Hyperlegible, Lexend, OpenDyslexic
  - iA Writer family: Mono, Duo, Quattro
  - Modern coding: Monaspace, Commit Mono, Intel One Mono, Recursive
  - Premium: Berkeley Mono, MonoLisa, Operator Mono, Input
- Font detection via `fc-list` (Tauri backend)
- One-click Homebrew font installation
- Category filter tabs (All/Sans/Serif/Mono)
- Font preview with sample text
- "Use this font" button for quick application
- Groups fonts by: Installed / Available via Homebrew / Premium

**Technical Details:**
- `src-tauri/src/commands.rs` - Font management commands (get_installed_fonts, install_font_via_homebrew)
- `src/renderer/src/lib/themes.ts` - RECOMMENDED_FONTS list, theme definitions
- `src/renderer/src/components/SettingsModal.tsx` - Font UI, theme shortcuts
- CSS variables: `--editor-font-family`, `--editor-font-size`, `--editor-line-height`

**Tests:** 407 passing (101 new Theme & Font unit tests)

---

### Sprint 10 Enhancements (2024-12-25)

**Autocomplete Positioning Fix:**
- Autocomplete dropdowns now follow cursor position
- Uses `getBoundingClientRect()` for accurate positioning
- Clamps horizontal position to prevent viewport overflow
- Position passed from HybridEditor to autocomplete components

**Accessibility Improvements:**
- Added `@radix-ui/react-visually-hidden` for screen reader support
- DialogTitle and DialogDescription for command palette
- Aria-labels on search input and interactive elements
- Removed console warnings about missing accessibility elements

**Comprehensive Test Suite (300 tests):**
- HybridEditor.test.tsx: 32 tests (rendering, modes, highlighting, word count)
- Autocomplete.test.tsx: 34 tests (wiki-link, tag, keyboard nav, edge cases)
- CommandPalette.test.tsx: 24 tests (actions, selection, accessibility)
- Integration.test.tsx: 31 tests (workflows, ADHD-friendly design)
- Validation.test.ts: 54 tests (regex, data, security, performance)
- Total: **300 tests passing** (up from 154)

**Test Categories Added:**
- processWikiLinksAndTags function validation
- generateTagColor algorithm validation
- Word count calculation edge cases
- Editor + Autocomplete integration
- Command Palette quick actions
- ADHD-friendly design verification

---

### Sprint 10: Global Hotkey + Commands - Complete (2024-12-25)

**Global Hotkey Implementation:**
- Global shortcut ⌘⇧N opens/focuses app from anywhere
- Uses tauri_plugin_global_shortcut (SUPER for Command on macOS)
- Zero friction: App appears in < 3 seconds
- Window focus management (show + focus)

**Command Palette Enhancements:**
- Opens with ⌘K shortcut
- Quick actions:
  - Create new note (⌘N)
  - Open daily note (⌘D)
  - Toggle focus mode (⌘⇧F)
  - Sync to Obsidian Vault
  - Ask Claude (Refactor Notes)
  - Ask Gemini (Brainstorming)
- Recent notes display (last 10 notes)
- Real-time search filtering
- Keyboard navigation (↑↓, Enter, Esc)

**Keyboard Shortcuts (App.tsx):**
- ⌘⇧F: Toggle focus mode
- ⌘B: Toggle left sidebar
- ⌘⇧B: Toggle right sidebar
- ⌘N: Create new note
- ⌘D: Open daily note
- Escape: Exit focus mode

**Technical Details:**
- `src-tauri/src/lib.rs` - Global hotkey registration
- `src/renderer/src/components/CommandPalette.tsx` - cmdk-based palette
- Dependencies: `cmdk`, `tauri_plugin_global_shortcut`, `@radix-ui/react-visually-hidden`

**ADHD-Friendly Design:**
- Zero friction: ⌘⇧N → App appears instantly
- Escape hatches: Esc exits focus mode, ⌘W closes
- Quick wins: Command palette shows all actions in one place
- One thing at a time: Focused context (recent notes, quick actions)

**Next:** Sprint 11 - Academic Features

---

### Sprint 9: Editor Enhancement - Complete (2024-12-25)

**HybridEditor++ Implementation:**

**Write Mode Enhancements:**
- Contenteditable editor (replaced textarea)
- Live highlighting for wiki-links `[[...]]`
- Live highlighting for tags `#tag`
- Click handlers for wiki-links in write mode
- Click handlers for tags in write mode
- Autocomplete for wiki-links with cmdk
- Autocomplete for tags with cmdk

**Components:**
- `SimpleWikiLinkAutocomplete.tsx` - New wiki-link autocomplete (TipTap-free)
- `SimpleTagAutocomplete.tsx` - New tag autocomplete (TipTap-free)
- Updated `HybridEditor.tsx` - Contenteditable with highlighting
- Added CSS styles for `.editor-content`, `.wiki-link`, `.tag`

**Dead Code Removed:**
- Removed `BlockNoteEditor.tsx` (362 lines)
- Removed `Editor.tsx` (TipTap, 269 lines)
- Removed `TipTapEditor.tsx` (unused)
- Removed `WikiLinkAutocomplete.tsx` (TipTap version)
- Removed `TagAutocomplete.tsx` (TipTap version)
- Removed `extensions/` directory (TipTap extensions)
- Removed `TipTapEditor.test.tsx`

**Styling:**
- Wiki-link highlighting: Blue background (#93c5fd), cursor pointer, rounded
- Tag highlighting: Purple background (#c4b5fd), cursor pointer, rounded
- Hover effects: Underline for wiki-links, lift effect for tags
- CSS added to `index.css` for contenteditable styling

**Testing:**
- All tests passing (125 tests, 7 todo)
- No console errors

**Technical Details:**
- Used `contentEditable` div instead of textarea
- `dangerouslySetInnerHTML` for highlighted content
- Regex patterns:
  - Wiki-links: `/\[\[([^\]]+)\]\]/g`
  - Tags: `/(?<![#\w])#([a-zA-Z][a-zA-Z0-9_-]*)/g`
- Click handlers detect span elements by class
- Autocomplete positioned fixed, filtering notes/tags by query

**Next:** Sprint 10 - Global hotkey + Commands

---

### Sprint 8 Assessment (2024-12-25)

**Technical Assessment Revealed:**

**Critical Issues:**
- Sprint 8 marked complete but BlockNote migration never happened
- BlockNote packages not installed in package.json
- App using HybridEditor (markdown textarea + preview mode) instead of BlockNote
- Dead code exists: BlockNoteEditor.tsx, Editor.tsx, extensions/
- Wiki-link "[[" only works in preview mode, not write mode
- No inline autocomplete for wiki-links or tags

**What Actually Works:**
- HybridEditor with write/preview mode toggle (⌘E)
- Focus mode (⌘⇧F / Escape)
- Word count footer
- Dark theme default
- PARA folder structure (Inbox, Projects, Areas, Resources, Archive)
- SQLite database with notes, folders, links, tags
- Full-text search (SQLite FTS5)
- ReactMarkdown preview with basic wiki-link and tag rendering

**What Needs Decision (Sprint 9):**
Option A: Fix HybridEditor bugs (2-3h) - quick, stable
Option B: Complete BlockNote migration (6-8h) - as planned, complex
Option C: Switch to TipTap (4-6h) - alternative rich editor
Option D: HybridEditor++ (3-4h) - enhance markdown with autocomplete

**Decision:** Option D (HybridEditor++) implemented ✅

---

### Sprint 8 Partial (2024-12-25)

**Completed:**
- HybridEditor with write/preview toggle
- Focus mode
- Word count
- Dark theme
- PARA folders

**Deferred to Sprint 9:**
- Wiki-link/tag autocomplete
- Write mode highlighting
- BlockNote migration (cancelled in favor of HybridEditor++)

---

### Project Redefinition (2024-12-24)

**Major Direction Change:**

- Redefined project scope with PROJECT-DEFINITION.md v1.2.0
- Changed from "paused PKM" to "active ADHD-friendly writer"
- Added project system (5 types: Research, Teaching, R-Package, R-Dev, Generic)
- Added academic stack (Zotero, LaTeX, Quarto, KaTeX)
- Added knowledge features (daily notes, backlinks)
- Selected BlockNote to replace TipTap (planned but not executed)
- Added CLI-based AI integration (Claude + Gemini)
- Deferred terminal integration to v2
- Created 10-sprint roadmap (64 hours) - actual progress 35h

**Documentation:**

- Created PROJECT-DEFINITION.md (comprehensive scope control)
- Rewrote README.md
- Rewrote CLAUDE.md
- Updated .STATUS
- Archived Sprint 1-7 files to docs/archive/

**Note:** Project originally targeted Electron but uses Tauri 2

---

## [0.3.0] - 2024-12-24

### Added - Sprint 7: Tags System

**Tags Features:**

- Tag input with `#` autocomplete (TipTap editor)
- Colored tag badges with hash-based consistent colors
- Tags panel showing all tags with note counts
- Multi-tag filtering with AND logic
- Auto-parsing tags from note content
- Case-insensitive tag matching

**Components:**

- `TagInputRule.ts` - Detects `#` pattern and triggers autocomplete
- `TagMark.ts` - Renders tags as colored badges in editor
- `TagAutocomplete.tsx` - Autocomplete UI (reused WikiLink pattern)
- `TagsPanel.tsx` - Tag management panel in sidebar
- `TagFilter.tsx` - Active filters display

**Database:**

- Migration 003: `tags` table for tag metadata
- Migration 003: `note_tags` junction table (many-to-many)
- 14 new database methods (CRUD + relationships)
- 14 new IPC handlers

**Testing:**

- 52 automated tests (100% passing)
- Pattern detection, color generation, database operations
- Content parsing, filtering logic, edge cases

---

## [0.2.0] - 2024-12-24

### Added - Sprint 6: Wiki Links & Backlinks

**Wiki Links Features:**

- Wiki link input with `[[` autocomplete (TipTap editor)
- Real-time autocomplete as you type
- Click to navigate to linked note
- Backlinks panel showing incoming links

**Components:**

- `WikiLinkExtension.ts` - TipTap extension
- `WikiLinkAutocomplete.tsx` - Autocomplete UI
- `BacklinksPanel.tsx` - Backlinks display

---

## [0.1.0] - 2024-12-23

### Added - Sprints 1-5: Foundation

**Sprint 1: Tauri Setup**

- Tauri 2 + React 18 + TypeScript
- Vite build system
- Tailwind CSS styling

**Sprint 2: SQLite Database**

- better-sqlite3 integration
- Notes, folders, links tables
- Migration system

**Sprint 3: Rich Editor**

- TipTap editor integration
- Basic formatting (bold, italic, headings)
- Markdown shortcuts

**Sprint 4: PARA Folders**

- Folder hierarchy (Inbox, Projects, Areas, Resources, Archive)
- Folder CRUD operations
- Note organization

**Sprint 5: Full-Text Search**

- SQLite FTS5 integration
- Real-time search
- Search highlighting

---

## Archive

Historical sprint documentation moved to: `docs/archive/sprints-1-7/`
