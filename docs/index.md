# Scribe

> **ADHD-Friendly Distraction-Free Writer**

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Version](https://img.shields.io/badge/version-1.16.2-blue)
![Progress](https://img.shields.io/badge/progress-100%25-brightgreen)
![Tests](https://img.shields.io/badge/tests-2187%20passing-brightgreen)

---

## The Problem

| Struggle | How It Hurts |
|----------|--------------|
| **Too Many Choices** | Decision paralysis before you even start |
| **Visual Clutter** | Sidebars, tabs, notifications steal focus |
| **Slow Startup** | 10+ seconds = you've already context-switched |
| **Lost Work** | Forgot to save? Bye-bye, brilliant paragraph |

## The Solution

| Scribe Does | You Get |
|-------------|---------|
| **Zero-config startup** | Writing in < 3 seconds |
| **Single note view** | Deep focus, one thing at a time |
| **Auto-save always** | Never lose a word |
| **⌘W closes** | Instant escape hatch when overwhelmed |

---

## Quick Start

```bash
# Install via Homebrew
brew install --cask data-wise/tap/scribe

# Or build from source
git clone https://github.com/Data-Wise/scribe
cd scribe && npm install && npm run dev
```

[Get Started :material-arrow-right:](user/QUICKSTART.md){ .md-button .md-button--primary }
[View Features](guide/features.md){ .md-button }

---

## Screenshots

### Main Editor
![Main Editor](images/scribe-main.png)
*Mission Control sidebar, editor, and properties panel*

### Focus Mode
![Focus Mode](images/scribe-focus.png)
*Distraction-free writing with sidebars hidden*

---

## Key Features

<div class="grid cards" markdown>

-   :material-pencil:{ .lg .middle } **Distraction-Free Editor**

    ---

    Three-mode editor (Source/Live/Reading), Obsidian-style callouts, focus mode, and live wiki-link highlighting

-   :material-palette:{ .lg .middle } **ADHD-Optimized Settings**

    ---

    Fuzzy search settings (⌘,), visual theme gallery (8 themes), Quick Actions customization, project templates

-   :material-folder-multiple:{ .lg .middle } **Icon-Centric Sidebar**

    ---

    Per-icon expansion with accordion pattern, compact/card views, and smooth animations (v1.16.0)

-   :material-robot:{ .lg .middle } **CLI-Based AI**

    ---

    Claude + Gemini CLI integration (no API keys needed)

-   :material-console:{ .lg .middle } **Embedded Terminal**

    ---

    Full PTY shell with smart project-aware working directory

-   :material-cog:{ .lg .middle } **Modular Architecture**

    ---

    Clean component extraction, 2163 tests passing, 0 TypeScript errors in production (v1.16.2)

</div>

---

## Feature Overview

| Feature | Description |
|---------|-------------|
| **HybridEditor++** | Three modes: Source, Live Preview, Reading |
| **Callouts** | 11 Obsidian-style callout types with color coding |
| **Focus Mode** | Distraction-free, one note at a time |
| **Settings** | Fuzzy search (⌘,), theme gallery, Quick Actions customization |
| **Themes** | 8 built-in themes with visual previews |
| **Fonts** | 14 recommended fonts + Homebrew install |
| **Quick Actions** | 5 default + 5 custom AI actions with drag-to-reorder |
| **Wiki Links** | `[[link]]` to connect notes |
| **Tags** | `#tag` with colored badges and autocomplete |
| **Daily Notes** | Auto-created with templates |
| **AI** | Claude + Gemini CLI (no API keys) |
| **Terminal** | Embedded PTY with project-aware CWD |
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
| **Settings** | ⌘, |
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
| Database | SQLite (Tauri) / IndexedDB (Browser) |
| AI | Claude/Gemini CLI |

---

## Documentation

### User Guides

- [Quick Start](user/QUICKSTART.md) - Get running in 2 minutes
- [Getting Started](user/GETTING-STARTED.md) - Full user guide
- [Installation](installation/install.md) - Detailed installation instructions

### Feature Guides

- [Editor Guide](guide/editor.md) - HybridEditor usage
- [Keyboard Shortcuts](guide/shortcuts.md) - All shortcuts reference
- [Themes](guide/themes.md) - Theme customization
- [Features Overview](guide/features.md) - Complete feature list

### Mission Control

- [Mission Control Walkthrough](archive/completed/MISSION-CONTROL-WALKTHROUGH.md) - Sidebar tutorial

### Technical Reference

- [API Reference](API.md) - Complete API documentation
- [Architecture](ARCHITECTURE.md) - System architecture overview
- [Dual-Mode Architecture](DUAL-MODE-ARCHITECTURE.md) - Tauri/Browser runtime
- [Components](COMPONENTS.md) - React component reference
- [Tests Summary](reference/TESTS_SUMMARY.md) - Test coverage details

### Project

- [Project Definition](reference/PROJECT-DEFINITION.md) - Scope & roadmap
- [Changelog](reference/CHANGELOG.md) - Version history
- [Release Notes](RELEASE.md) - Release information

### Development

- [Contributing](development/contributing.md) - How to contribute
- [Development Architecture](development/architecture.md) - Dev setup
- [Sprint History](development/sprints.md) - Development sprints

---

## Links

- [:material-github: GitHub Repository](https://github.com/Data-Wise/scribe)
- [:material-package: Homebrew Tap](https://github.com/Data-Wise/homebrew-tap)
- [:material-bug: Issue Tracker](https://github.com/Data-Wise/scribe/issues)
