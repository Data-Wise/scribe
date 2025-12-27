# Changelog

All notable changes to Scribe will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
