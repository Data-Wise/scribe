# Changelog

All notable changes to Scribe will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] - v0.4.0-dev

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
