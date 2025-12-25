# Changelog

All notable changes to Nexus Desktop will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

**Documentation:**
- Added Tags feature guide to GETTING-STARTED.md
- Created SPRINT-7-COMPLETE.md (551 lines)
- Created SPRINT-7-PLAN.md
- Created SPRINT-7-IMPLEMENTATION-SUMMARY.md
- Created SPRINT-7-TESTING-COMPLETE.md

### Changed
- Updated README.md to reflect Sprint 7 completion
- Updated package.json version: 1.0.0 → 0.3.0
- Enhanced GETTING-STARTED.md with complete features guide

---

## [0.2.0] - 2024-12-24

### Added - Sprint 6: Wiki Links & Backlinks

**Wiki Links Features:**
- Wiki link input with `[[` autocomplete
- Real-time autocomplete as you type
- Keyboard navigation (arrow keys, enter, escape)
- Click to select or create new notes
- Automatic note creation from broken links
- Backlinks panel showing incoming/outgoing connections

**Components:**
- `WikiLink.ts` - Mark extension for rendering `[[Note]]` as clickable links
- `WikiLinkInputRule.ts` - Custom ProseMirror plugin for `[[` detection
- `WikiLinkAutocomplete.tsx` - Autocomplete dropdown UI
- `BacklinksPanel.tsx` - Backlinks sidebar panel

**Database:**
- Migration 002: `links` table for wiki link relationships
- Automatic link parsing from content
- Bidirectional link tracking
- `getBacklinks()` and `getOutgoingLinks()` methods

**Testing:**
- 16 automated tests (8 passing unit tests)
- 8 integration tests (manual testing required due to jsdom limitations)
- Link pattern detection, autocomplete behavior, navigation

**Documentation:**
- Created SPRINT-6-COMPLETE.md
- Added Wiki Links feature guide to GETTING-STARTED.md

### Changed
- Enhanced Editor component with wiki link extensions
- Updated App.tsx with link navigation handlers

---

## [0.1.0] - 2024-12-23

### Added - Sprints 1-5: Foundation

**Sprint 1: Hello World**
- Electron + React + TypeScript project setup
- Basic window layout with sidebar
- Tailwind CSS styling
- Hot reload development environment

**Sprint 2: Database**
- SQLite integration with better-sqlite3
- DatabaseService with CRUD operations
- IPC handlers for main-renderer communication
- Migration system with schema versioning
- WAL mode for performance

**Sprint 3: Rich Text Editor**
- TipTap editor integration
- Formatting toolbar (bold, italic, headings, lists, code blocks)
- Syntax highlighting with lowlight (VS Code dark theme)
- Real-time auto-save
- Editable note titles

**Sprint 4: PARA Folders**
- 5 PARA folders (Inbox, Projects, Areas, Resources, Archive)
- Folder navigation sidebar with emoji icons
- Folder filtering
- "All Notes" view
- Note counts per folder

**Sprint 5: Full-Text Search**
- FTS5 virtual table for fast full-text search
- SearchBar component with Cmd+K shortcut
- SearchResults component with context snippets
- HighlightedText component for term highlighting
- Real-time search as you type
- Case-insensitive multi-term matching

**Components:**
- `Editor.tsx` - TipTap rich text editor
- `SearchBar.tsx` - Search input with keyboard shortcut
- `SearchResults.tsx` - Search results list
- `HighlightedText.tsx` - Search term highlighting
- `utils/search.ts` - Search utility functions

**Database Schema:**
- `notes` table - Note content and metadata
- `notes_fts` - FTS5 virtual table for search
- `schema_version` - Migration tracking

**Documentation:**
- Created GETTING-STARTED.md (comprehensive user guide)
- Created README.md (project overview)
- Created SPRINT-1.md, SPRINT-2.md, SPRINT-3.md, SPRINT-5.md

### Technical Details
- **Framework**: Electron 28+
- **UI**: React 18, TypeScript 5
- **Editor**: TipTap 3 (ProseMirror-based)
- **Database**: better-sqlite3 12 with FTS5
- **Styling**: Tailwind CSS 3
- **State**: Zustand 4
- **Build**: Vite 5 via electron-vite
- **Testing**: Vitest 4

---

## [Unreleased]

### Planned - Sprint 8: Search & Filter Enhancements

**Features:**
- Search highlighting in titles and snippets
- Advanced filters (folder, date range, tags)
- Search history (last 20 searches, persist across sessions)
- Enhanced result cards with metadata
- Improved keyboard navigation
- Sort options (relevance, date, title)

See [SPRINT-8-PLAN.md](SPRINT-8-PLAN.md) for details.

---

## Version History

- **0.3.0** (2024-12-24) - Tags System (Sprint 7)
- **0.2.0** (2024-12-24) - Wiki Links & Backlinks (Sprint 6)
- **0.1.0** (2024-12-23) - Foundation (Sprints 1-5)

---

## Links

- [GitHub Repository](https://github.com/Data-Wise/nexus)
- [Getting Started Guide](GETTING-STARTED.md)
- [Development Plan](../DEVELOPMENT-PLAN.md)
- [Sprint Documentation](.)
