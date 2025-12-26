# Scribe

> **ADHD-Friendly Distraction-Free Writer**

[![Status](https://img.shields.io/badge/status-active-brightgreen)]()
[![Version](https://img.shields.io/badge/version-0.4.0--alpha.1-blue)]()
[![Progress](https://img.shields.io/badge/progress-80%25-green)]()
[![Tests](https://img.shields.io/badge/tests-407%20passing-brightgreen)]()

---

## What is Scribe?

Scribe is a **distraction-free writing app** designed for academics and researchers with ADHD. It combines a modern markdown editor with project management, academic writing tools, and CLI-based AI integration.

<div class="grid cards" markdown>

-   :material-pencil:{ .lg .middle } __Distraction-Free Editor__

    ---

    HybridEditor with write/preview mode, focus mode, and live wiki-link highlighting

-   :material-palette:{ .lg .middle } __ADHD-Friendly Themes__

    ---

    10 built-in themes (5 dark, 5 light) with auto-switching by time of day

-   :material-folder-multiple:{ .lg .middle } __Project System__

    ---

    Research, Teaching, R-Package, R-Dev, and Generic project types

-   :material-robot:{ .lg .middle } __CLI-Based AI__

    ---

    Claude + Gemini CLI integration (no API keys needed)

</div>

---

## Quick Start

```bash
# Install via Homebrew
brew install --cask data-wise/tap/scribe

# Or build from source
git clone https://github.com/Data-Wise/scribe
cd scribe
npm install
npm run dev
```

---

## Key Features

| Feature | Description |
|---------|-------------|
| **HybridEditor** | Markdown write mode + rich preview |
| **Focus Mode** | Distraction-free, one note at a time |
| **Themes** | 10 ADHD-friendly themes + custom creator |
| **Fonts** | 14 recommended fonts + Homebrew install |
| **Wiki Links** | `[[link]]` to connect notes |
| **Tags** | `#tag` with colored badges and autocomplete |
| **Daily Notes** | Auto-created with templates |
| **AI** | Claude + Gemini CLI (no API keys) |
| **Export** | LaTeX, PDF, Word, Quarto (planned) |

---

## ADHD Design Principles

!!! tip "Zero Friction"
    < 3 seconds from launch to writing. No dialogs. No choices. Just write.

!!! tip "One Thing at a Time"
    Single note visible. Sidebar collapses in focus mode. No tabs.

!!! tip "Escape Hatches"
    ⌘W closes (auto-saves). ⌘Z always works. No confirmation dialogs.

!!! tip "Visible Progress"
    Word count always visible. Session timer. Streak indicators.

!!! tip "Sensory-Friendly"
    Dark mode default. No distracting animations. Muted colors, high contrast text.

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| **Global: Open Scribe** | ⌘⇧N |
| **Command Palette** | ⌘K |
| **New Note** | ⌘N |
| **Daily Note** | ⌘D |
| **Focus Mode** | ⌘⇧F |
| **Toggle Preview** | ⌘E |
| **Close** | ⌘W |

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

---

## Documentation

- [Quick Start](user/QUICKSTART.md) - Get running in 2 minutes
- [Getting Started](user/GETTING-STARTED.md) - Full user guide
- [Project Definition](reference/PROJECT-DEFINITION.md) - Scope & roadmap
- [Changelog](reference/CHANGELOG.md) - Version history

---

## Links

- [GitHub Repository](https://github.com/Data-Wise/scribe)
- [Homebrew Tap](https://github.com/Data-Wise/homebrew-tap)
- [Issue Tracker](https://github.com/Data-Wise/scribe/issues)
