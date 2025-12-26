# Scribe

> **ADHD-Friendly Distraction-Free Writer**

[![Status](https://img.shields.io/badge/status-active-brightgreen)]()
[![Version](https://img.shields.io/badge/version-1.3.0--dev-blue)]()
[![Progress](https://img.shields.io/badge/progress-75%25-green)]()
[![Tests](https://img.shields.io/badge/tests-407%20passing-brightgreen)]()
[![Tauri](https://img.shields.io/badge/tauri-2-blue)]()
[![React](https://img.shields.io/badge/react-18-blue)]()

---

## What is Scribe?

Scribe is a **distraction-free writing app** designed for academics and researchers with ADHD. It combines a modern block-based editor with project management, academic writing tools, and CLI-based AI integration.

### Key Features

 | Feature | Description |
 |---------|-------------|
 | **HybridEditor** | Markdown write mode + rich preview |
 | **Focus Mode** | Distraction-free, one note at a time |
 | **Themes** | 10 ADHD-friendly themes + custom creator |
 | **Fonts** | 14 recommended fonts + Homebrew install |
| **Projects** | Research, Teaching, R-Package, R-Dev, Generic |
| **Daily Notes** | Auto-created with templates |
| **Wiki Links** | `[[link]]` to connect notes |
| **Zotero** | Citations via Better BibTeX |
| **Export** | LaTeX, PDF, Word, Quarto |
| **AI** | Claude + Gemini CLI (no API keys) |
| **Obsidian Sync** | Export notes to vault |

---

## Quick Start

```bash
# Clone and install
cd ~/projects/dev-tools/scribe
npm install

# Run development
npm run dev

# Build for production
npm run build
```

### Global Hotkey

**⌘⇧N** — Open Scribe from anywhere ✅

### Command Palette

**⌘K** — Quick access to all features:
- Create New Note (⌘N)
- Open Daily Note (⌘D)
- Toggle Focus Mode (⌘⇧F)
- Sync to Obsidian
- Ask Claude / Gemini

---

## ADHD Design Principles

1. **Zero Friction** — < 3 seconds to start writing
2. **One Thing at a Time** — Single note visible
3. **Escape Hatches** — ⌘W closes, auto-saves
4. **Visible Progress** — Word count, session timer
5. **Sensory-Friendly** — Dark mode, no animations
6. **Quick Wins** — Milestone celebrations

---

## Project Types

| Type | Use Case |
|------|----------|
| **Research** | Papers, analysis |
| **Teaching** | Courses, lectures |
| **R-Package** | R package documentation |
| **R-Dev** | Dev tools projects |
| **Generic** | Everything else |

---

## Academic Stack

```
Zotero → Better BibTeX → @cite autocomplete → Pandoc → LaTeX/PDF/Word
```

### Supported Exports

- **Markdown** (.md)
- **LaTeX** (.tex)
- **PDF** (via Pandoc + LaTeX)
- **Word** (.docx)
- **Quarto** (.qmd → render)

---

## Tech Stack

 | Component | Technology |
 |-----------|------------|
 | Framework | Tauri 2 + React 18 |
 | Editor | HybridEditor (ReactMarkdown) |
 | Styling | Tailwind CSS |
 | State | Zustand |
 | Database | SQLite |
 | AI | Claude/Gemini CLI |
 | Citations | Pandoc citeproc |
 | Math | KaTeX |

---

## Documentation

| File | Purpose |
|------|---------|
| [PROJECT-DEFINITION.md](PROJECT-DEFINITION.md) | Complete scope, roadmap, anti-drift rules |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [GETTING-STARTED.md](GETTING-STARTED.md) | User guide |

---

## Development

```bash
# Development
npm run dev          # Start dev server
npm run test         # Run tests
npm run lint         # Lint code

# Build
npm run build        # Production build
```

### Project Structure

 ```
 scribe/
 ├── src/
 │   ├── src-tauri/      # Tauri backend (Rust)
 │   │   ├── src/
 │   │   │   ├── database.rs   # SQLite operations
 │   │   │   ├── commands.rs   # IPC handlers
 │   │   │   └── lib.rs
 │   └── renderer/       # React app
 │       └── src/
 │           ├── components/
 │           │   ├── HybridEditor.tsx
 │           │   └── ...
 │           ├── store/      # Zustand state
 │           └── App.tsx
 ├── PROJECT-DEFINITION.md   # Scope control
 ├── README.md
 └── package.json
 ```

---

## Roadmap

| Phase | Sprints | Focus | Hours | Status |
|-------|---------|-------|-------|--------|
| 1 | 8-10.5 | Editor + Hotkey + Themes | 17h | ✅ Complete |
| 2 | 11-12 | Academic + Obsidian | 16h | 🔄 Next |
| 3 | 13-14 | Export | 12h | Pending |
| 4 | 15-16 | Projects + Daily Notes | 12h | Pending |
| 5 | 17 | Polish | 4h | Pending |

**Progress: 45h / 60h (75%) — Sprint 11 Next**

See [PROJECT-DEFINITION.md](PROJECT-DEFINITION.md) for detailed sprint breakdown.

---

## License

MIT

---

## Related Projects

- [aiterm](https://github.com/Data-Wise/aiterm) — Terminal optimizer
- [obsidian-cli-ops](https://github.com/Data-Wise/obsidian-cli-ops) — Obsidian vault manager
- [claude-plugins](https://github.com/Data-Wise/claude-plugins) — Claude Code plugins
