# Editor Guide

> The HybridEditor - ADHD-friendly, distraction-free writing

---

## Editor Modes

<div class="grid cards" markdown>

-   :material-pencil:{ .lg .middle } **Write Mode**

    ---

    Clean textarea. No distractions. Just you and your words.

-   :material-eye:{ .lg .middle } **Preview Mode**

    ---

    Rendered markdown with clickable links and syntax highlighting.

</div>

!!! tip "Toggle Modes"
    Press `⌘E` to switch between write and preview mode.

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
| **Toggle write/preview** | `⌘E` |
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
