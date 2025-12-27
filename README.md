# Scribe

> **ADHD-Friendly Distraction-Free Writer**

[![Status](https://img.shields.io/badge/status-active-brightgreen)]()
[![Version](https://img.shields.io/badge/version-0.4.0--alpha.1-blue)]()
[![Progress](https://img.shields.io/badge/progress-87%25-green)]()
[![Tests](https://img.shields.io/badge/tests-483%20passing-brightgreen)]()
[![Tauri](https://img.shields.io/badge/tauri-2-blue)]()
[![React](https://img.shields.io/badge/react-18-blue)]()

---

## What is Scribe?

Scribe is a **distraction-free writing app** designed for academics and researchers with ADHD. It combines a custom markdown editor with academic writing tools, themes, and CLI-based AI integration.

### Key Features

| Feature | Description |
|---------|-------------|
| **HybridEditor++** | Markdown write mode + rich preview |
| **Focus Mode** | Distraction-free, one note at a time |
| **10 Themes** | 5 dark + 5 light ADHD-friendly themes |
| **14 Fonts** | Recommended fonts + one-click Homebrew install |
| **Wiki Links** | `[[link]]` with autocomplete |
| **Tags** | `#tag` inline with autocomplete |
| **Citations** | `@cite` with BibTeX/Zotero integration |
| **Math** | KaTeX for LaTeX ($...$ and $$...$$) |
| **Export** | PDF, Word, LaTeX, HTML via Pandoc |
| **AI** | Claude + Gemini CLI (no API keys) |
| **Command Palette** | ⌘K quick actions |
| **Global Hotkey** | ⌘⇧N opens from anywhere |

---

## Quick Start

```bash
# Clone and install
git clone https://github.com/Data-Wise/scribe.git
cd scribe
npm install

# Run development
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **⌘⇧N** | Open Scribe (global) |
| **⌘K** | Command palette |
| **⌘N** | New note |
| **⌘D** | Daily note |
| **⌘E** | Toggle edit/preview |
| **⌘⇧F** | Focus mode |
| **⌘B** | Toggle file list |
| **⌘⇧B** | Toggle tags panel |
| **⌘Alt+0-9** | Switch themes |

---

## ADHD Design Principles

1. **Zero Friction** — < 3 seconds to start writing
2. **One Thing at a Time** — Single note visible
3. **Escape Hatches** — ⌘W closes, auto-saves
4. **Visible Progress** — Word count, mode toggle
5. **Sensory-Friendly** — Dark mode default
6. **Reduced Motion** — Respects system preferences

---

## Screenshots

### Empty State
Engaging empty state with animated pen icon, action buttons, and inspirational writing quotes.

### Editor
Clean markdown editor with live wiki-link and tag highlighting.

### Settings
Theme picker, ADHD-friendly font recommendations, and typography controls.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Tauri 2 + React 18 |
| Editor | HybridEditor++ (custom) |
| Styling | Tailwind CSS |
| State | Zustand |
| Database | SQLite (rusqlite) |
| Math | KaTeX |
| AI | Claude/Gemini CLI |
| Citations | Pandoc citeproc |
| Testing | Vitest + Testing Library |

---

## Documentation

| File | Purpose |
|------|---------|
| [docs/API.md](docs/API.md) | Complete API reference |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture |
| [docs/planning/](docs/planning/) | Sprint planning |
| [PROJECT-DEFINITION.md](PROJECT-DEFINITION.md) | Scope control |
| [PROPOSAL-UI-IMPROVEMENTS.md](PROPOSAL-UI-IMPROVEMENTS.md) | UI improvement plan |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [CLAUDE.md](CLAUDE.md) | AI assistant guidance |

---

## Development

```bash
# Development
npm run dev          # Start Tauri dev server
npm run dev:vite     # Vite frontend only
npm run test         # Run 483 tests
npm run lint         # Lint code

# Build
npm run build        # Production build
```

### Project Structure

```
scribe/
├── src/
│   └── renderer/src/          # React frontend
│       ├── components/        # UI components
│       ├── lib/               # API, themes, utils
│       ├── store/             # Zustand state
│       └── __tests__/         # Test files
│
├── src-tauri/src/             # Rust backend
│   ├── commands.rs            # IPC handlers
│   ├── database.rs            # SQLite operations
│   └── academic.rs            # Citations + export
│
└── docs/                      # Documentation
    ├── API.md
    ├── ARCHITECTURE.md
    └── planning/
```

---

## Sprint Progress

| Phase | Sprint | Focus | Status |
|-------|--------|-------|--------|
| **1** | 8-10.5 | Editor + Hotkey + Themes | ✅ Complete |
| **2** | 11 | Academic Features | ✅ Complete |
| **2** | 12 | UI Polish & Micro-interactions | 🚀 80% |
| **3** | 13 | Project System | ○ Next |
| **3** | 14 | Templates + Daily | ○ Pending |
| **4** | 15 | Search + Goals | ○ Pending |

**Progress: 87% complete — Sprint 12 in progress**

---

## Test Coverage

**483 tests passing** across 14 test files:

| Test File | Tests |
|-----------|-------|
| Themes.test.ts | 101 |
| Academic.test.ts | 67 |
| Validation.test.ts | 54 |
| Tags.test.tsx | 52 |
| HybridEditor.test.tsx | 37 |
| Integration.test.tsx | 32 |
| And 8 more... | 140 |

---

## Academic Workflow

```
Zotero → Better BibTeX → @cite autocomplete → Pandoc → PDF/Word/LaTeX
```

### Supported Exports

- **PDF** (via Pandoc + LaTeX)
- **Word** (.docx)
- **LaTeX** (.tex)
- **HTML**

### Citation Styles

- APA
- Chicago
- MLA
- IEEE
- Harvard

---

## Requirements

- **macOS** (primary platform)
- **Node.js** 18+
- **Rust** (for Tauri)
- **Homebrew** (optional, for font installation)
- **Pandoc** (optional, for export)
- **Claude/Gemini CLI** (optional, for AI features)

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

**Note:** Main branch is protected. PRs require review.

---

## License

MIT

---

## Related Projects

- [aiterm](https://github.com/Data-Wise/aiterm) — Terminal optimizer
- [obsidian-cli-ops](https://github.com/Data-Wise/obsidian-cli-ops) — Obsidian vault manager
