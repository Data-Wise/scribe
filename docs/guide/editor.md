# Editor Guide

> CodeMirror 6 powered editor with three modes for every stage of writing

---

## Editor Modes

<div class="grid cards" markdown>

-   :material-code-tags:{ .lg .middle } **Source Mode** (`⌘1`)

    ---

    Raw markdown with syntax highlighting. Full control over formatting.

-   :material-pencil:{ .lg .middle } **Live Preview** (`⌘2`)

    ---

    Obsidian-style: syntax hides when cursor moves away. LaTeX renders inline.

-   :material-eye:{ .lg .middle } **Reading Mode** (`⌘3`)

    ---

    Fully rendered view. Click wiki links to navigate. Press `Escape` to exit.

</div>

!!! tip "Toggle Modes"
    Press `⌘E` to cycle between modes, or `⌘1`/`⌘2`/`⌘3` to jump directly.

---

## Markdown Support

### Headings

```markdown
# Heading 1
## Heading 2
### Heading 3
```

### Text Formatting

| Syntax | Result |
|--------|--------|
| `**bold**` | **bold** |
| `*italic*` | *italic* |
| `~~strike~~` | ~~strike~~ |
| `` `code` `` | `code` |

### Lists

=== "Bullets"

    ```markdown
    - Bullet item
    - Another item
      - Nested item
    ```

=== "Numbered"

    ```markdown
    1. First item
    2. Second item
    3. Third item
    ```

=== "Tasks"

    ```markdown
    - [ ] Todo item
    - [x] Completed item
    ```

### Links

| Type | Syntax |
|------|--------|
| External | `[text](https://example.com)` |
| Wiki Link | `[[Note Title]]` |

### Code Blocks

````markdown
```javascript
function hello() {
  console.log("Hello, Scribe!");
}
```
````

### Blockquotes

```markdown
> This is a quote.
> It can span multiple lines.
```

---

## Quarto Support

Scribe provides first-class editing support for [Quarto](https://quarto.org/) `.qmd` files:

### Smart Autocompletion

| Context | Trigger | Examples |
|---------|---------|---------|
| YAML frontmatter | Type key name | `title`, `format`, `bibliography` (40+ keys) |
| Chunk options | Type `#\|` | `echo`, `fig-width`, `warning` (25+ options) |
| Cross-references | Type `@fig-`, `@tbl-` | Labels scanned from your document |
| Code chunks | Type `` ``` `` | R, Python, Julia, OJS, Mermaid |
| LaTeX commands | Type `\` in math mode | `\alpha`, `\frac{}{}`, `\begin{}` (80+ commands) |

### Context-Aware LaTeX

LaTeX completions only appear where they make sense:

- **In math mode** (`$...$` or `$$...$$`) — full LaTeX command + snippet completions
- **In code blocks** — LaTeX completions suppressed (no `\alpha` in R code)
- **In prose** — snippet completions suppressed (no erratic popups)

### Code Block Styling

Quarto code blocks get VS Code-style visual treatment. All three Quarto fence syntaxes are supported:

| Syntax | Purpose | Example |
|--------|---------|---------|
| `` `{r}` `` | Executable chunk | Runs code during Quarto render |
| `` `{{r}}` `` | Documentation chunk | Displays chunk syntax without executing |
| `` `{.r}` `` | Static code block | Syntax-highlighted, never executed |

Visual features:

- **Distinct background** — Derived from theme colors, adapts to all 10 themes
- **Monospace code font** — Configurable in Settings > Editor > Code Font (default: JetBrains Mono)
- **Accent-colored left border** — 3px border with rounded corners on opening/closing fences
- **Language badge** — Uppercase label (e.g., `R`, `PYTHON`) on the opening fence line
- **Chunk option styling** — `#|` lines render italic with reduced opacity
- **Plain fences unchanged** — Standard `` ```js `` blocks keep simple monospace styling

---

## Wiki Links

Connect your notes with `[[double brackets]]`:

| Step | Action |
|------|--------|
| 1 | Type `[[` to start |
| 2 | Autocomplete shows matching notes |
| 3 | Select or type note title |
| 4 | Close with `]]` |

Example: `[[My Research Notes]]`

---

## Tags

Organize with `#hashtags`:

| Step | Action |
|------|--------|
| 1 | Type `#` followed by tag name |
| 2 | Autocomplete shows existing tags |
| 3 | Select or create new tag |

Example: `#research #important`

---

## Focus Mode

!!! tip "Ultimate Distraction-Free"
    Press `⌘⇧F` to enter focus mode.

| What Happens | Benefit |
|--------------|---------|
| Sidebars disappear | No visual clutter |
| Editor centers | Full attention on writing |
| Minimal UI | Just your words |

Exit with `⌘⇧F` or `Escape`.

---

## Word Count

Always visible in the status bar:

- Current word count
- Updates in real-time
- No configuration needed

---

## Auto-Save

!!! note "Never Lose Work"
    Your work saves automatically on every change.

- No save button needed
- Works even if app crashes
- Instant, seamless saving

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| **Cycle editor modes** | `⌘E` |
| **Source mode** | `⌘1` |
| **Live Preview** | `⌘2` |
| **Reading mode** | `⌘3` |
| **Focus mode** | `⌘⇧F` |
| **Bold** | `⌘B` |
| **Italic** | `⌘I` |
| **Undo** | `⌘Z` |
| **Redo** | `⌘⇧Z` |

---

## Font Settings

Customize in **Settings → Fonts**:

| Setting | Options |
|---------|---------|
| Font family | 14 ADHD-friendly fonts |
| Font size | Adjustable |
| Line height | Adjustable |

### Recommended Fonts

=== "Sans-Serif"

    Clean, modern fonts:

    - **Inter** - Versatile, readable
    - **Atkinson Hyperlegible** - Accessibility-focused
    - **Lexie Readable** - Dyslexia-friendly

=== "Serif"

    Traditional fonts:

    - **Literata** - Modern serif
    - **EB Garamond** - Classic elegance

=== "Monospace"

    Code-focused fonts:

    - **JetBrains Mono** - Developer favorite
    - **Fira Code** - Ligatures
    - **Berkeley Mono** - Premium quality

---

## Next Steps

[Features Overview :material-arrow-right:](features.md){ .md-button .md-button--primary }
[Themes Guide](themes.md){ .md-button }
