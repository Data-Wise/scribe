# Nexus Desktop

Desktop application for personal knowledge management - built with Electron, React, and TypeScript.

**Version**: 0.3.0 (Sprint 7 Complete)

## Features

### ✅ Implemented (Sprints 1-7)

- **PARA Organization** - Inbox, Projects, Areas, Resources, Archive folders
- **Rich Text Editor** - TipTap editor with formatting toolbar
- **Code Blocks** - Syntax highlighting with VS Code dark theme
- **Wiki Links** - `[[wiki-style]]` linking with autocomplete
  - Type `[[` to link to existing notes or create new ones
  - Backlinks panel showing incoming/outgoing connections
  - Real-time link updates
- **Tags System** - `#tag` support with filtering
  - Type `#` for tag autocomplete
  - Colored badges with hash-based consistent colors
  - Multi-tag filtering (AND logic)
  - Tags panel with note counts
- **Full-Text Search** - SQLite FTS5 search across all notes
- **Database** - Better-sqlite3 with migrations
- **Testing** - Vitest + React Testing Library (52/52 tests passing)

## Quick Start

### 🚀 Easy Installation & Launch

**First time? Run the install script:**
```bash
./install.sh        # One command - installs everything
```

**Launch Nexus:**
```bash
npm start           # From project directory
# OR
./nexus             # Using launcher script
# OR
nexus               # From anywhere (after running ./setup-alias.sh)
```

**See [QUICKSTART.md](QUICKSTART.md)** for 2-minute setup guide.

### 📚 Full Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - 2-minute setup (start here!)
- **[GETTING-STARTED.md](GETTING-STARTED.md)** - Complete user guide
- **[CHANGELOG.md](CHANGELOG.md)** - Version history

## Documentation

- **[GETTING-STARTED.md](GETTING-STARTED.md)** - Complete user guide with features walkthrough
- **[SPRINT-6-COMPLETE.md](SPRINT-6-COMPLETE.md)** - Wiki Links implementation
- **[SPRINT-7-COMPLETE.md](SPRINT-7-COMPLETE.md)** - Tags System implementation
- **[DOCS-CHECK-REPORT.md](DOCS-CHECK-REPORT.md)** - Documentation validation report

## Tech Stack

- **Electron** 28+ - Desktop application framework
- **React** 18 - UI framework with hooks
- **TypeScript** 5 - Type safety
- **Vite** 5 - Build tool via electron-vite
- **Tailwind CSS** 3 - Styling
- **Zustand** 4 - State management
- **TipTap** 3 - Rich text editor (ProseMirror-based)
- **better-sqlite3** 12 - SQLite database with FTS5
- **Vitest** 4 - Testing framework

## Project Structure

```
nexus-desktop/
├── src/
│   ├── main/                      # Electron main process
│   │   ├── index.ts              # App lifecycle, IPC handlers
│   │   └── database/
│   │       └── DatabaseService.ts # SQLite operations
│   │
│   ├── renderer/                  # React app
│   │   └── src/
│   │       ├── App.tsx           # Main component
│   │       ├── components/       # UI components
│   │       │   ├── Editor.tsx    # TipTap editor
│   │       │   ├── WikiLinkAutocomplete.tsx
│   │       │   ├── TagAutocomplete.tsx
│   │       │   ├── BacklinksPanel.tsx
│   │       │   └── TagsPanel.tsx
│   │       ├── extensions/       # TipTap extensions
│   │       │   ├── WikiLink.ts
│   │       │   ├── WikiLinkInputRule.ts
│   │       │   ├── TagMark.ts
│   │       │   └── TagInputRule.ts
│   │       ├── store/
│   │       │   └── useNotesStore.ts  # Zustand state
│   │       └── __tests__/        # Test files
│   │
│   └── preload/
│       └── index.ts               # IPC bridge (main ↔ renderer)
│
├── dist-electron/                 # Build output
├── GETTING-STARTED.md            # User guide
└── package.json
```

## Development

### Running Tests

```bash
npm test              # Watch mode
npm run test:run      # Run once
npm run test:ui       # Vitest UI
npm run test:coverage # Coverage report
```

**Current Test Status**: 52/52 passing (100%)
- 52 Tags system tests (Sprint 7)
- 8 Wiki Links unit tests (Sprint 6)

### Type Checking

```bash
npm run typecheck
```

### Building

```bash
npm run build         # Vite build + Electron Builder
npm run build:mac     # macOS .app bundle
npm run build:linux   # Linux AppImage
npm run build:win     # Windows installer
```

## Sprint Progress

**Completed**:
- ✅ Sprint 1-3: Foundation, PARA folders, basic editor
- ✅ Sprint 4: Database layer with migrations
- ✅ Sprint 5: Full-text search (FTS5)
- ✅ Sprint 6: Wiki Links with autocomplete and backlinks
- ✅ Sprint 7: Tags System with filtering

**Next**:
- 🔜 Sprint 8: Search & Filter Enhancements

See parent directory for sprint planning documents.

## Database

**Location**: `~/Library/Application Support/nexus-desktop/data/nexus.db`

**Schema**:
- `notes` - Note content and metadata
- `links` - Wiki link relationships (many-to-many)
- `tags` - Tag metadata
- `note_tags` - Note-tag relationships (many-to-many)
- FTS5 virtual table for full-text search

**Reset**:
```bash
rm -rf ~/Library/Application\ Support/nexus-desktop/
```

## Contributing

This is currently a development project. For sprint planning and task breakdown, see the parent `nexus/` directory.

## License

MIT License - See LICENSE file for details

---

**Last Updated**: 2024-12-24
**Status**: Active Development (Sprint 7 Complete)
**Next Sprint**: Sprint 8 - Search & Filter Enhancements
