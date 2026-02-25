# Getting Started with Scribe

A complete guide to using Scribe for ADHD-friendly writing.

---

## Table of Contents

1. [Installation](#installation)
2. [First Launch](#first-launch)
3. [Writing Notes](#writing-notes)
4. [Projects](#projects)
5. [Daily Notes](#daily-notes)
6. [Wiki Links](#wiki-links)
7. [Tags](#tags)
8. [AI Integration](#ai-integration)
9. [Export](#export)
10. [Keyboard Shortcuts](#keyboard-shortcuts)

---

## Installation

### Homebrew (Recommended)

```bash
brew tap data-wise/tap
brew install --cask data-wise/tap/scribe
```

### Build from Source

```bash
# Node.js 18+ and Rust required
git clone https://github.com/Data-Wise/scribe
cd scribe
npm install
npm run dev
```

---

## First Launch

1. **App Opens** — Default theme, icon sidebar on left
2. **Create Note** — Click **+ New Note** or press `⌘N`
3. **Start Writing** — No setup needed

### Global Hotkey

**⌘⇧N** — Open Scribe from anywhere (requires Accessibility permissions)

---

## Writing Notes

### Three Editor Modes

| Mode | Shortcut | Description |
|------|----------|-------------|
| **Source** | `⌘1` | Raw markdown with syntax highlighting (CodeMirror 6) |
| **Live Preview** | `⌘2` | Obsidian-style: formatting hides near cursor, LaTeX renders inline |
| **Reading** | `⌘3` | Fully rendered view with clickable links |

Press `⌘E` to cycle between modes.

### Focus Mode

Press **⌘⇧F** to enter distraction-free mode:

- Sidebars collapse
- Editor centers on screen
- Only your words remain

Press **⌘⇧F** or `Escape` to exit.

### Word Count

Always visible in the status bar at the bottom.

### Pomodoro Timer

Click the timer in the status bar to start a 25-minute focus session. Right-click to reset. Configure durations in Settings > General > Focus Timer.

---

## Projects

### Project Types

| Type | Use Case |
|------|----------|
| **Research** | Papers, analysis |
| **Teaching** | Courses, lectures |
| **R-Package** | R package docs |
| **R-Dev** | Dev tools |
| **Generic** | Everything else |

### Creating a Project

1. Press **⌘⇧N** to open the Create Project modal
2. Choose project type
3. Name your project
4. Project is automatically pinned to the sidebar

### Switching Projects

Click a project icon in the sidebar icon bar, or use **⌘⇧1** through **⌘⇧4** for quick-switch to typed project slots.

---

## Daily Notes

### Creating Daily Notes

Press **⌘D** to open/create today's note.

### Built-in Templates

| Template | Use Case |
|----------|----------|
| **Minimal** | Just the date heading |
| **Journaling** | Gratitude, focus, reflections |
| **Research** | Notes, papers, ideas sections |
| **Meeting** | Attendees, agenda, action items |
| **Focus** | Single priority with blockers |

Configure in Settings > Writing > Daily Note Template.

---

## Wiki Links

### Creating Links

Type `[[` to trigger autocomplete:

```
See [[My Other Note]] for more details.
```

### Navigation

Click a wiki link in Live Preview or Reading mode to jump to that note.

### Backlinks

The right sidebar Backlinks panel shows notes that link to the current note.

---

## Tags

### Adding Tags

Type `#` to trigger autocomplete:

```
This is about #research and #causal-inference.
```

### Hierarchical Tags

```markdown
#research/statistics/mediation
#teaching/stat-440
```

### Tag Colors

Tags automatically get consistent colors based on their name.

### Filtering by Tag

Click a tag in the Tags panel (right sidebar) to filter notes.

---

## AI Integration

### Using AI

1. Open the Claude panel in the right sidebar
2. Type your question — it automatically has context from your current note
3. Choose a Quick Action from the Command Palette for common tasks

### Quick Actions

| Action | What it does |
|--------|--------------|
| **Improve** | Enhance clarity and flow |
| **Expand** | Develop the idea further |
| **Summarize** | Condense to key points |
| **Explain** | Simplify complex text |
| **Research** | Find related information |

### Requirements

```bash
# Claude CLI
claude --version

# Gemini CLI
gemini --version
```

No API keys needed — uses your CLI subscriptions.

---

## Export

### Supported Formats

| Format | Extension | Requirements |
|--------|-----------|--------------|
| HTML | .html | None |
| LaTeX | .tex | Pandoc |
| PDF | .pdf | Pandoc + LaTeX |
| Word | .docx | Pandoc |

### Exporting

1. Open a note
2. Press **⌘⇧E** to open the Export dialog
3. Choose format and options
4. Select location

### Citations

If you have Zotero configured:

1. Citations auto-link from `@citekey`
2. Bibliography appended to export
3. Citation style based on project settings

---

## Keyboard Shortcuts

### Essential

| Action | Shortcut |
|--------|----------|
| New note | ⌘N |
| Daily note | ⌘D |
| New project | ⌘⇧N |
| Quick capture | ⌘⇧C |
| Focus mode | ⌘⇧F |
| Command palette | ⌘K |
| Settings | ⌘, |
| Close tab | ⌘W |

### Editor

| Action | Shortcut |
|--------|----------|
| Source mode | ⌘1 |
| Live Preview | ⌘2 |
| Reading mode | ⌘3 |
| Cycle modes | ⌘E |
| Export | ⌘⇧E |

### Navigation

| Action | Shortcut |
|--------|----------|
| Search notes | ⌘F |
| Knowledge graph | ⌘⇧G |
| Left sidebar toggle | ⌘B |
| Right sidebar toggle | ⌘⇧B |
| Terminal | ⌘⌥T |

### Tabs

| Action | Shortcut |
|--------|----------|
| Switch to tab N | ⌘1–⌘9 |
| Close tab | ⌘W |
| Reopen closed tab | ⌘⇧T |

---

## Troubleshooting

### App Won't Start

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm run dev
```

### "App is damaged" Error

```bash
xattr -cr /Applications/Scribe.app
```

### Export Fails

```bash
# Check Pandoc
pandoc --version

# Check LaTeX (for PDF)
pdflatex --version
```

---

## Getting Help

- **Quick Start:** [QUICKSTART.md](QUICKSTART.md)
- **Features Guide:** [Features Overview](../guide/features.md)
- **Changelog:** [CHANGELOG.md](../reference/CHANGELOG.md)
