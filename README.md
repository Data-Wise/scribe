# Scribe

> Fast, frictionless note capture for knowledge workers

Desktop application for personal knowledge management - built with Electron, React, and TypeScript.

**Version**: 0.3.0 (Sprint 7 Complete)

---

## Features

### Implemented (Sprints 1-7 - 58%)

| Feature | Status |
|---------|--------|
| **Rich Text Editor** | TipTap with formatting toolbar |
| **Wiki Links** | `[[wiki-style]]` linking with autocomplete |
| **Backlinks Panel** | See incoming/outgoing connections |
| **#Tags System** | Colored badges, filtering (AND logic) |
| **Full-Text Search** | SQLite FTS5 across all notes |
| **PARA Organization** | Inbox, Projects, Areas, Resources, Archive |
| **Code Blocks** | Syntax highlighting |
| **Security Hardened** | XSS protection, SQL injection prevention |

### Planned

- Sprint 8: Search & Filter Enhancements
- Sprint 9: Daily Notes with Templates
- Sprint 10: Global Hotkey Quick Capture
- Sprint 11: Obsidian Vault Sync
- Sprint 12: Claude MCP Integration

---

## Quick Start

### Easy Installation (macOS)

```bash
./install.sh        # One command - installs everything
```

### Launch

```bash
npm start           # From project directory
./scribe            # Using launcher script
scribe              # From anywhere (after setup-alias.sh)
```

See **[QUICKSTART.md](QUICKSTART.md)** for 2-minute setup guide.

---

## Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](QUICKSTART.md) | 2-minute setup (start here!) |
| [GETTING-STARTED.md](GETTING-STARTED.md) | Complete user guide |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [SECURITY-IMPROVEMENTS.md](SECURITY-IMPROVEMENTS.md) | Security documentation |

---

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

---

## Project Structure

```
scribe/
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
│   │       │   ├── Editor.tsx
│   │       │   ├── WikiLinkAutocomplete.tsx
│   │       │   ├── TagAutocomplete.tsx
│   │       │   ├── BacklinksPanel.tsx
│   │       │   └── TagsPanel.tsx
│   │       ├── extensions/       # TipTap extensions
│   │       │   ├── WikiLink.ts
│   │       │   └── TagMark.ts
│   │       ├── store/
│   │       │   └── useNotesStore.ts
│   │       └── __tests__/
│   │
│   └── preload/
│       └── index.ts               # IPC bridge
│
├── GETTING-STARTED.md
├── QUICKSTART.md
└── package.json
```

---

## Development

### Commands

```bash
npm run dev           # Development mode
npm test              # Run tests (watch mode)
npm run test:run      # Run tests once
npm run test:coverage # Coverage report
npm run typecheck     # Type checking
npm run build         # Production build
```

**Test Status**: 52/52 passing (100%)

---

## Database

**Location**: `~/Library/Application Support/nexus-desktop/data/nexus.db`

**Schema**:
- `notes` - Note content and metadata
- `links` - Wiki link relationships
- `tags` - Tag metadata with colors
- `note_tags` - Note-tag relationships
- FTS5 virtual table for search

**Reset**:
```bash
rm -rf ~/Library/Application\ Support/nexus-desktop/
```

---

## Related Projects

- **[Nexus](https://github.com/Data-Wise/nexus)** - Knowledge management architecture & Claude integration
- **[Statistical Research Plugin](https://github.com/Data-Wise/claude-plugins)** - Claude Code research workflows

---

## Origin

Scribe was originally developed as `nexus-desktop` within the Nexus project. It has been extracted into a standalone repository to:
- Enable independent development
- Clarify product positioning (capture app vs knowledge architecture)
- Allow future pivots (quick capture companion vs full PKM)

---

## License

MIT License

---

**Status**: Paused at Sprint 7 (58% complete)
**Last Updated**: 2024-12-24
