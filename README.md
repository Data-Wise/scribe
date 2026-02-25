# Scribe

> **ADHD-Friendly Distraction-Free Writer**

[![Status](https://img.shields.io/badge/status-active-brightgreen)]()
[![Version](https://img.shields.io/badge/version-1.20.0-blue)]()
[![Progress](https://img.shields.io/badge/progress-100%25-brightgreen)]()
[![Tests](https://img.shields.io/badge/tests-2280%20passing-brightgreen)]()
[![Tauri](https://img.shields.io/badge/tauri-2-blue)]()
[![React](https://img.shields.io/badge/react-18-blue)]()

---

## What is Scribe?

Scribe is a **distraction-free writing app** designed for academics and researchers with ADHD. It combines a custom markdown editor with academic writing tools, themes, and CLI-based AI integration.

### Key Features

| Feature | Description |
|---------|-------------|
| **CodeMirror 6** | Three modes: Source, Live Preview, Reading |
| **Callouts** | 11 Obsidian-style callout types with color coding |
| **Focus Mode** | Distraction-free, one note at a time |
| **Settings** | ⌘, fuzzy search, theme gallery, Quick Actions customization |
| **10 Themes** | Visual theme gallery with dark and light themes |
| **14 Fonts** | Recommended fonts + one-click Homebrew install |
| **Quick Actions** | ✨ Improve, 📝 Expand, 📋 Summarize, 💡 Explain, 🔍 Research (customizable) |
| **Project Templates** | Research+, Teaching+, Dev+, Writing+, Minimal presets |
| **Wiki Links** | `[[link]]` with autocomplete + single-click navigation |
| **Tags** | `#tag` inline with autocomplete |
| **Citations** | `@cite` with BibTeX/Zotero integration |
| **Math** | KaTeX for LaTeX ($...$ and $$...$$) |
| **Export** | PDF, Word, LaTeX, HTML via Pandoc |
| **AI Chat** | Claude + Gemini CLI (no API keys) |
| **Chat Persistence** | Conversations saved per note |
| **@ References** | Include other notes in AI prompts |
| **CLI** | Terminal access via `scribe` command |
| **Command Palette** | ⌘K quick actions |
| **Global Hotkey** | ⌘⇧N opens from anywhere |

---

## Installation

### Homebrew (Recommended)

```bash
# Add the tap
brew tap data-wise/tap

# Install Scribe
brew install --cask data-wise/tap/scribe
```

### Download

Download from [GitHub Releases](https://github.com/Data-Wise/scribe/releases):
- `Scribe_x.x.x_aarch64.dmg` (Apple Silicon)

### Build from Source

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

> See [docs/installation/install.md](docs/installation/install.md) for detailed instructions.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **⌘⇧N** | Open Scribe (global) |
| **⌘,** | Settings (v1.9.0+) |
| **⌘K** | Command palette |
| **⌘N** | New note |
| **⌘D** | Daily note |
| **⌘E** | Toggle edit/preview |
| **⌘⇧F** | Focus mode |
| **⌘⇧B** | Toggle tags panel |
| **⌘⌥1-9** | Quick Actions (v1.9.0+) |
| **⌘Alt+0-9** | Switch themes |
| **⌘+Click** | Navigate WikiLink (Source mode) |

---

## CLI Access

Scribe includes a terminal CLI for quick note access without opening the app:

```bash
# Quick commands
scribe daily              # Open today's daily note
scribe capture "idea"     # Quick capture to inbox
scribe search "query"     # Full-text search (FTS5)
scribe list               # List recent notes

# Aliases
sd  # scribe daily
sc  # scribe capture
ss  # scribe search
sl  # scribe list
```

### Installation

```bash
# Source the CLI (add to .zshrc)
source ~/.config/zsh/functions/scribe.zsh

# View man page
man scribe

# See all commands
scribe help --all
```

> The CLI is part of [flow-cli](https://github.com/Data-Wise/flow-cli) and operates directly on the SQLite database.

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
| Editor | CodeMirror 6 |
| Styling | Tailwind CSS |
| State | Zustand (5 stores) |
| Database | SQLite (Tauri) / IndexedDB (Browser) |
| Terminal | xterm.js |
| Graph | D3.js |
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
| [docs/planning/](docs/planning/) | Active planning |
| [docs/reference/PROJECT-DEFINITION.md](docs/reference/PROJECT-DEFINITION.md) | Scope control |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [CLAUDE.md](CLAUDE.md) | AI assistant guidance |

---

## Development

```bash
# Development
npm run dev          # Start Tauri dev server
npm run dev:vite     # Vite frontend only
npm run test         # Run 2,280+ tests
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
| **2** | 11-12 | Academic + UI Polish | ✅ Complete |
| **3** | 14 | Knowledge Graph + Templates | ✅ Complete |
| **4** | 15-16 | Tags Panel Redesign | ✅ Complete |
| **5** | 17-20 | CLI + Polish | ✅ Complete |

**Progress: 100% complete — v1.11.0 Released**

---

## Test Coverage

**2,280 tests passing** across test files:

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
