# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

---

## What is Scribe?

**Scribe** is a lightweight desktop app for quick knowledge capture, designed to complement Obsidian-based knowledge management workflows.

**Purpose:** Fast, frictionless note capture that syncs to your Obsidian vault.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Electron + React |
| Language | TypeScript |
| Build | Vite + electron-vite |
| Database | SQLite (better-sqlite3) + FTS5 |
| Editor | TipTap |
| Styling | Tailwind CSS |
| State | Zustand |
| Testing | Vitest |

---

## Project Structure

```
scribe/
├── src/
│   ├── main/           # Electron main process
│   │   ├── index.ts
│   │   └── database/
│   │       └── DatabaseService.ts
│   ├── preload/        # Preload scripts
│   │   └── index.ts
│   └── renderer/       # React UI
│       └── src/
│           ├── App.tsx
│           ├── components/
│           ├── extensions/    # TipTap extensions
│           ├── store/
│           └── utils/
├── package.json
├── electron.vite.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build production
npm run build

# Run tests
npm test

# Package for distribution
npm run package
```

---

## Current Status

**Progress:** 7/12 sprints complete (58%)

### Completed Features
- Electron + React + TypeScript setup
- SQLite database with FTS5 full-text search
- TipTap rich markdown editor
- Wiki-style [[links]] with autocomplete
- Backlinks panel
- #tags with colored badges
- Tags panel with filtering (AND logic)
- PARA folder organization
- Security hardening (XSS, SQL injection protection)

### Remaining Sprints (Paused)
- Sprint 8: Search & Filter Enhancements
- Sprint 9-12: Daily notes, templates, sync

---

## Key Files

| File | Purpose |
|------|---------|
| `src/main/database/DatabaseService.ts` | SQLite operations, migrations |
| `src/renderer/src/App.tsx` | Main React component |
| `src/renderer/src/store/useNotesStore.ts` | Zustand state management |
| `src/renderer/src/extensions/WikiLink.ts` | TipTap [[link]] extension |
| `src/renderer/src/utils/sanitize.ts` | DOMPurify XSS protection |

---

## Security Considerations

This app has been security-hardened:
- **XSS Protection:** DOMPurify sanitization
- **SQL Injection:** Input validation, parameterized queries
- **Input Limits:** Title 500 chars, content 10MB
- **Path Traversal:** Folder whitelist validation

See `SECURITY-IMPROVEMENTS.md` for details.

---

## Relationship to Nexus

Scribe was originally part of the Nexus project (`nexus/nexus-desktop/`). It has been split out as a standalone app that can:

1. Run independently as a quick capture tool
2. Sync with Obsidian vaults (future feature)
3. Integrate with Claude via MCP (future feature)

The main Nexus project focuses on knowledge management architecture and Claude integration.
