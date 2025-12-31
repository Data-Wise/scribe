# Quick Start

> Get Scribe running in under 2 minutes

!!! tip "What You'll Learn"
    - Install and launch Scribe
    - Create your first note
    - Use essential keyboard shortcuts

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 18+ |
| npm | 9+ |

---

## Install & Run

=== "Homebrew (Recommended)"

    ```bash
    brew install --cask data-wise/tap/scribe
    ```

=== "Build from Source"

    ```bash
    git clone https://github.com/Data-Wise/scribe
    cd scribe
    npm install
    npm run dev
    ```

---

## First Note

| Step | Action |
|------|--------|
| 1 | App opens with sidebar |
| 2 | Click **+ New Note** or press **⌘N** |
| 3 | Start typing |

!!! tip "Auto-Save"
    Your work saves automatically. No save button needed.

---

## Essential Shortcuts

| Action | Shortcut |
|--------|----------|
| **New note** | ⌘N |
| **Daily note** | ⌘D |
| **Command palette** | ⌘K |
| **Focus mode** | ⌘⇧F |
| **Toggle preview** | ⌘E |
| **Close** | ⌘W |

---

## Wiki Links

Connect your notes with `[[double brackets]]`:

```markdown
See [[My Other Note]] for details.
```

- Type `[[` to trigger autocomplete
- Click links in preview to navigate

---

## Tags

Organize with `#hashtags`:

```markdown
This is about #research and #methods.
```

- Type `#` to trigger autocomplete
- Click tags in sidebar to filter

---

## Next Steps

[Full Getting Started Guide :material-arrow-right:](GETTING-STARTED.md){ .md-button .md-button--primary }
[Features Overview](../guide/features.md){ .md-button }
