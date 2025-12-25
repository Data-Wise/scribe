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

### Prerequisites

```bash
# Required
node --version  # 18+
npm --version   # 9+

# For Academic Features
pandoc --version    # For export
quarto --version    # For .qmd (optional)
```

### Setup

```bash
cd ~/projects/dev-tools/scribe
npm install
npm run dev
```

---

## First Launch

1. **App Opens** — Dark mode, sidebar on left
2. **Create Note** — Click **+ New Note** or ⌘N
3. **Start Writing** — No setup needed

### Global Hotkey (Coming Sprint 10)

**⌘⇧N** — Open Scribe from anywhere

---

## Writing Notes

### Block-Based Editor

Scribe uses a Notion-style block editor:

```
Type / to see block options:
/heading    → Create heading
/list       → Bullet list
/todo       → Checklist
/code       → Code block
/quote      → Blockquote
```

### Focus Mode

Press **⌘.** to enter distraction-free mode:

- Sidebar hides
- Editor centers
- Background dims

Press **⌘.** again to exit.

### Word Count

Always visible in status bar at bottom.

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

1. Click **⚙️ New Project** in sidebar
2. Choose project type
3. Name your project
4. Select folder location

### Project Structure

```
~/Projects/my-research/
├── .scribe/
│   └── project.json    # Settings
├── paper-draft.md
└── daily/
    └── 2024-12-24.md
```

### Project Settings

Edit `.scribe/project.json`:

```json
{
  "name": "My Research",
  "type": "research",
  "bibliography": "~/Zotero/research.bib",
  "obsidianVault": "~/vaults/research",
  "exportDefaults": {
    "format": "pdf",
    "citationStyle": "apa7"
  }
}
```

---

## Daily Notes

### Creating Daily Notes

Press **⌘D** to open/create today's note.

### Daily Note Template

```markdown
## 2024-12-24

### Progress
- [ ] Task 1
- [ ] Task 2

### Notes

### Tags
#daily
```

### Customizing Template

Edit project settings:

```json
{
  "dailyNotes": {
    "enabled": true,
    "folder": "daily",
    "template": "## {{date}}\n\n### Progress\n\n### Notes\n"
  }
}
```

---

## Wiki Links

### Creating Links

Type `[[` to trigger autocomplete:

```
See [[My Other Note]] for more details.
```

### Navigation

Click a wiki link to jump to that note.

### Backlinks

The sidebar shows notes that link to the current note.

---

## Tags

### Adding Tags

Type `#` to trigger autocomplete:

```
This is about #research and #causal-inference.
```

### Tag Colors

Tags automatically get consistent colors based on their name.

### Filtering by Tag

Click a tag in the Tags panel to filter notes.

---

## AI Integration

### Available Actions

| Action | What it does |
|--------|--------------|
| **Improve** | Enhance clarity and flow |
| **Expand** | Develop the idea further |
| **Summarize** | Condense to key points |
| **Explain** | Simplify complex text |
| **Research** | Find related information |

### Using AI

1. Select text
2. Press **⌘⇧A** (or right-click → AI)
3. Choose action
4. Select provider (Claude or Gemini)

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
| Markdown | .md | None |
| LaTeX | .tex | Pandoc |
| PDF | .pdf | Pandoc + LaTeX |
| Word | .docx | Pandoc |
| Quarto | .qmd | Quarto |

### Exporting

1. Open note
2. Press **⌘E** or File → Export
3. Choose format
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
| Focus mode | ⌘. |
| Command palette | ⌘K |
| Close | ⌘W |
| Quit | ⌘Q |

### Editing

| Action | Shortcut |
|--------|----------|
| Bold | ⌘B |
| Italic | ⌘I |
| Link | ⌘K |
| Undo | ⌘Z |
| Redo | ⌘⇧Z |

### Navigation

| Action | Shortcut |
|--------|----------|
| Search notes | ⌘F |
| Back | ⌘[ |
| Forward | ⌘] |

### AI

| Action | Shortcut |
|--------|----------|
| AI panel | ⌘⇧A |

---

## Troubleshooting

### App Won't Start

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm run dev
```

### Database Issues

```bash
# Database location
~/.config/scribe/scribe.db

# Reset (caution: deletes notes)
rm ~/.config/scribe/scribe.db
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

- **Project Definition:** [PROJECT-DEFINITION.md](PROJECT-DEFINITION.md)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)
- **Quick Start:** [QUICKSTART.md](QUICKSTART.md)
