# Features Overview

> Every feature follows **minimal friction** and **maximum focus**

---

## Core Features

<div class="grid cards" markdown>

-   :material-pencil:{ .lg .middle } **CodeMirror 6 Editor**

    ---

    Three modes: Source (`⌘1`), Live Preview (`⌘2`), Reading (`⌘3`). Cycle with `⌘E`.

-   :material-eye-off:{ .lg .middle } **Focus Mode**

    ---

    Distraction-free writing. Sidebars collapse. ⌘⇧F to toggle.

-   :material-link-variant:{ .lg .middle } **Wiki Links**

    ---

    Connect notes with `[[double brackets]]`. Autocomplete included.

-   :material-tag:{ .lg .middle } **Tags**

    ---

    Organize with `#hashtags`. Hierarchical support (`#research/stats`).

-   :material-timer-outline:{ .lg .middle } **Pomodoro Timer**

    ---

    25-minute focus sessions with break reminders. Auto-saves your work.

</div>

---

## Editor

### CodeMirror 6 Editor

| Mode | Shortcut | Description |
|------|----------|-------------|
| **Source** | `⌘1` | Raw markdown with syntax highlighting |
| **Live Preview** | `⌘2` | Obsidian-style: syntax hides away from cursor, LaTeX renders inline |
| **Reading** | `⌘3` | Fully rendered view with clickable links |

Press `⌘E` to cycle between modes.

### Focus Mode

!!! tip "Enter Focus Mode"
    Press `⌘⇧F` to hide sidebars and center your writing.

- Sidebars collapse
- Editor centers on screen
- Only your words remain
- Press `⌘⇧F` or `Escape` to exit

### Word Count

Always visible in the status bar. No clicks required.

### Pomodoro Focus Timer

!!! tip "ADHD-Friendly Time Boxing"
    Work in focused 25-minute bursts with automatic break reminders.

A minimal timer lives in the status bar, between Word Count and Quick Chat:

| Action | How |
|--------|-----|
| **Start/Pause** | Click the timer |
| **Reset** | Right-click the timer |
| **View progress** | Session count shows (e.g., 2/4) |

**What happens automatically:**

- **Work complete** → Note auto-saves + "Time for a break! ☕" toast
- **Break complete** → "Break's over — ready to write?" toast
- **Midnight** → Session count resets

Configure durations in **Settings → General → Focus Timer**.

---

## Wiki Links

Connect your notes with wiki-style links:

```markdown
See [[My Other Note]] for more details.
```

| Feature | How |
|---------|-----|
| Autocomplete | Type `[[` |
| Navigate | Click links in preview |
| Backlinks | View in right sidebar |

---

## Tags

Organize notes with tags:

```markdown
This is about #research and #causal-inference.
```

### Tags Panel

Access via right sidebar → "Tags" tab.

| View | Description |
|------|-------------|
| **Tree View** | Hierarchical display for nested tags |
| **Flat View** | Alphabetical list |
| **Compact** | Reduced padding for more tags |

**Tag Management:**

- Right-click to **Rename** or **Delete**
- **Orphan Detection** highlights unregistered tags
- One-click to register orphan tags

### Hierarchical Tags

```markdown
#research/statistics/mediation
#teaching/stat-440
```

---

## Daily Notes

!!! tip "Quick Access"
    Press `⌘D` to open/create today's note.

**5 Built-in Templates:**

| Template | Use Case |
|----------|----------|
| **Minimal** | Just the date heading |
| **Journaling** | Gratitude, focus, reflections |
| **Research** | Notes, papers, ideas sections |
| **Meeting** | Attendees, agenda, action items |
| **Focus** | Single priority with blockers |

Configure in Settings → Writing → Daily Note Template.

---

## Settings

!!! tip "Quick Access"
    Press `⌘,` (Command-Comma) to open Settings.

**ADHD-optimized settings system** with fuzzy search, visual theme gallery, and Quick Actions customization.

### 6 Settings Categories

| Category | Contents |
|----------|----------|
| **General** | Focus Timer (Pomodoro), startup behavior, streak display, ADHD features |
| **Editor** | Font, spacing, readable line length, spellcheck |
| **Appearance** | UI style, dark/light theme galleries (10 themes) |
| **Files** | File management settings |
| **Academic** | Citations, Zotero, export formats |
| **Icon Bar** | Sidebar icon configuration |

### Fuzzy Search

Search all settings instantly:

- Type to search (300ms debounce for smooth typing)
- Results show breadcrumb navigation (e.g., "Editor › Font & Spacing › Font Size")
- Click result to jump to that setting

### Theme Gallery

**10 built-in themes** with visual previews:

**Dark:** Oxford Dark, Forest Night, Warm Cocoa, Midnight Purple, Deep Ocean
**Light:** Soft Paper, Morning Fog, Sage Garden, Lavender Mist, Sand Dune

- **3-column grid** with hover effects
- **Instant preview** - click to apply
- **Visual indicator** - blue border + checkmark on selected theme

### Quick Actions Customization

Customize your AI Quick Actions:

| Feature | How |
|---------|-----|
| **Drag-to-reorder** | Click ⋮⋮ handle, drag row |
| **Toggle visibility** | Checkbox to show/hide |
| **Edit prompts** | Click ✏️ pencil icon |
| **Assign shortcuts** | Click ⌨️ for ⌘⌥1-9 |
| **Choose AI model** | Claude or Gemini per action |
| **Add custom** | Up to 5 custom actions |
| **Remove custom** | Click 🗑️ trash icon |

**Limits:** 5 default + 5 custom = 10 Quick Actions max (prevents choice paralysis)

### Project Templates

**5 preconfigured templates:**

| Template | Icon | Quick Actions | Use Case |
|----------|------|---------------|----------|
| **Research+** | 🔬 | Summarize, Explain, Research | Papers, lit reviews |
| **Teaching+** | 📚 | Explain, Expand, Summarize | Lesson plans |
| **Dev+** | 💻 | Explain, Improve, Research | Code docs |
| **Writing+** | ✍️ | Improve, Expand, Summarize | Creative writing |
| **Minimal** | ⚪ | None | Clean slate |

Templates apply preconfigured settings for Quick Actions, daily note templates, and default properties.

### Export/Import

- **Export:** Copy all settings as JSON to clipboard
- **Import:** Paste JSON to restore settings
- **Reset:** Revert all settings to defaults (cannot be undone)

**Full tutorial:** [Settings Enhancement Guide](../tutorials/settings.md)

---

## Quarto Support

First-class support for [Quarto](https://quarto.org/) academic documents (`.qmd` files):

### Autocompletion

| Context | Trigger | What You Get |
|---------|---------|--------------|
| **YAML frontmatter** | Type key name | 40+ keys with nested values |
| **Chunk options** | Type `#\|` | 25+ options (`echo`, `fig-width`, etc.) |
| **Cross-references** | Type `@fig-`, `@tbl-` | Labels scanned from document |
| **Code chunks** | Type `` ``` `` | R, Python, Julia, OJS, Mermaid, Graphviz |
| **LaTeX math** | Type `\` inside `$...$` | 80+ commands and snippets |

### Code Block Styling

Quarto code blocks get distinct visual treatment:

- Monospace font with accent-colored left border
- Chunk option lines (`#|`) styled as subdued metadata
- Opening fence line highlighted
- Dark mode support

### Smart Completion Scoping

LaTeX completions are context-aware:

- **Suppressed** inside code blocks (```` ```{r} ````) — no `\alpha` popups in R code
- **Snippet completions** only in math mode (`$...$` or `$$...$$`) — no erratic popups in prose
- **Escaped `\$`** handled correctly for literal dollar signs in text

---

## Terminal

Embedded terminal in the right sidebar with smart working directory:

| Feature | Description |
|---------|-------------|
| **Full PTY** | Real shell via portable-pty |
| **Smart CWD** | Opens in project folder |
| **Themed** | Matches Scribe dark mode |
| **Clickable URLs** | WebLinksAddon enabled |

### Working Directory

Terminal intelligently opens in the right folder:

| Project Type | Inferred Path |
|--------------|---------------|
| Research | `~/projects/research/[name]` |
| Teaching | `~/projects/teaching/[name]` |
| R Package | `~/projects/r-packages/[name]` |
| R Dev | `~/projects/dev-tools/[name]` |
| Generic | `~/projects/[name]` |

!!! tip "Fallback"
    If the folder doesn't exist, terminal opens in your home directory.

---

## Knowledge Graph

Visualize connections between your notes:

- Interactive D3 force-directed graph
- Notes as nodes, links as edges
- Pan, zoom, and click to navigate
- See clusters of related ideas

---

## Command Palette

Press `⌘K` for quick access:

| Command | Action |
|---------|--------|
| New Note | Create note |
| Daily Note | Open today's note |
| Focus Mode | Toggle distraction-free |
| Ask Claude | AI assistance |
| Ask Gemini | AI assistance |

---

## AI Integration

Use your existing CLI subscriptions (no API keys needed):

| Action | What it does |
|--------|--------------|
| **Improve** | Enhance clarity and flow |
| **Expand** | Develop the idea further |
| **Summarize** | Condense to key points |
| **Explain** | Simplify complex text |
| **Research** | Find related information |

!!! note "CLI Required"
    Install [Claude CLI](https://claude.ai/cli) or [Gemini CLI](https://ai.google.dev/gemini-api/docs/cli) first.

---

## Global Hotkey

Open Scribe from anywhere: **⌘⇧N**

Works even when Scribe is minimized or closed.

---

## Math Support

Write math using LaTeX syntax:

=== "Inline Math"

    ```markdown
    The formula $E = mc^2$ is famous.
    ```

=== "Display Math"

    ```markdown
    $$
    \int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
    $$
    ```

Powered by KaTeX for fast, native rendering.

---

## Accessibility

!!! tip "ADHD-Friendly Design"
    Scribe respects your system preferences and cognitive needs.

| Feature | Behavior |
|---------|----------|
| **Reduced motion** | Animations disabled when system preference set |
| **Screen readers** | Proper ARIA labels |
| **Keyboard navigation** | Full support |
| **Auto-save** | Never lose work |

---

## Next Steps

[Keyboard Shortcuts :material-arrow-right:](shortcuts.md){ .md-button .md-button--primary }
[Themes Guide](themes.md){ .md-button }
