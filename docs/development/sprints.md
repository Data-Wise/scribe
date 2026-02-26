# Sprint History

Scribe follows a sprint-based development approach with ~4-8 hour sprints.

## Current Status

**Version:** v1.22.0 (stable release)
**Tests:** 2,326 passing (81 files)
**Architecture:** Tauri 2 + React 18 + CodeMirror 6

## Feature Tiers (All Shipped)

### Tier 1: MVP

- CodeMirror 6 editor (Source / Live Preview / Reading modes)
- Focus mode (`⌘⇧F`)
- Dark/Light themes (10 built-in)
- Auto-save
- Wiki links with autocomplete
- Tags with hierarchical support
- Word count
- Global hotkey (`⌘⇧N`)

### Tier 2: Core

- Claude + Gemini CLI integration
- Command palette (`⌘K`)
- Writing goals and streaks
- Pomodoro focus timer (v1.19)
- Tabs with pin/reorder/close/reopen

### Tier 3: Academic

- Zotero/BibTeX citations
- Citation autocomplete
- KaTeX math rendering
- LaTeX/PDF/Word export via Pandoc
- Quarto document support with completions

### Tier 4: Desktop

- Project system (5 typed archetypes)
- Icon-centric MissionSidebar (v1.16)
- Embedded xterm.js terminal
- D3 knowledge graph
- Daily notes with templates
- Backlinks panel

### Backlog (v2.0+)

- Live LaTeX editor (full TeX Live compilation)
- AI integration via Tauri backend (replacing CLI)

### Never Build

- API-based AI (CLI only, no keys)
- Plugin system
- Mobile app
- Cloud sync (proprietary)

## Release History

| Version | Highlight |
|---------|-----------|
| v1.20.0 | Release cleanup, documentation overhaul |
| v1.19.0 | Pomodoro focus timer, settings infrastructure |
| v1.18.0 | Sidebar vault expansion fix, DexieError2 race condition |
| v1.17.0 | Three-tab sidebar state architecture |
| v1.16.0 | Icon-centric sidebar redesign, tech debt remediation |
| v1.15.0 | Quarto autocomplete, LaTeX completions |
| v1.14.0 | WikiLink single-click navigation |
| v1.10.0 | CodeMirror 6 Live Preview, KaTeX math, three editor modes |
| v1.9.0 | Settings enhancement (fuzzy search, theme gallery) |
| v1.7.0 | Quick Actions, chat history, @ references |

## Sprint Archive

Detailed sprint plans from Sprints 8-36 are archived in `docs/archive/planning/` and `docs/archive/sprints/`.
