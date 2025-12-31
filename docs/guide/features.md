# Features Overview

> Every feature follows **minimal friction** and **maximum focus**

---

## Core Features

<div class="grid cards" markdown>

-   :material-pencil:{ .lg .middle } **HybridEditor**

    ---

    Write in markdown, preview rendered. Toggle with ⌘E.

-   :material-eye-off:{ .lg .middle } **Focus Mode**

    ---

    Distraction-free writing. Sidebars collapse. ⌘⇧F to toggle.

-   :material-link-variant:{ .lg .middle } **Wiki Links**

    ---

    Connect notes with `[[double brackets]]`. Autocomplete included.

-   :material-tag:{ .lg .middle } **Tags**

    ---

    Organize with `#hashtags`. Hierarchical support (`#research/stats`).

</div>

---

## Editor

### HybridEditor

| Mode | Description |
|------|-------------|
| **Write** | Plain textarea for reliable input |
| **Preview** | Rendered markdown with clickable links |

Press `⌘E` to toggle between modes.

### Focus Mode

!!! tip "Enter Focus Mode"
    Press `⌘⇧F` to hide sidebars and center your writing.

- Sidebars collapse
- Editor centers on screen
- Only your words remain
- Press `⌘⇧F` or `Escape` to exit

### Word Count

Always visible in the status bar. No clicks required.

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
