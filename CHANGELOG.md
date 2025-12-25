# Changelog

All notable changes to Scribe will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] - v0.4.0-dev

### Project Redefinition (2024-12-24)

**Major Direction Change:**

- Redefined project scope with PROJECT-DEFINITION.md v1.2.0
- Changed from "paused PKM" to "active ADHD-friendly writer"
- Added project system (5 types: Research, Teaching, R-Package, R-Dev, Generic)
- Added academic stack (Zotero, LaTeX, Quarto, KaTeX)
- Added knowledge features (daily notes, backlinks)
- Selected BlockNote to replace TipTap
- Added CLI-based AI integration (Claude + Gemini)
- Deferred terminal integration to v2
- Created 10-sprint roadmap (64 hours)

**Documentation:**

- Created PROJECT-DEFINITION.md (comprehensive scope control)
- Rewrote README.md
- Rewrote CLAUDE.md
- Updated .STATUS
- Archived Sprint 1-7 files to docs/archive/

**Next:** Sprint 8 - BlockNote + Focus Mode

---

## [0.3.0] - 2024-12-24

### Added - Sprint 7: Tags System

**Tags Features:**

- Tag input with `#` autocomplete
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

- Wiki link input with `[[` autocomplete
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

**Sprint 1: Electron Setup**

- Electron 28 + React 18 + TypeScript
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
