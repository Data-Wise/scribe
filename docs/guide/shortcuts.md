# Keyboard Shortcuts

> Scribe is designed to be fully keyboard-driven

!!! tip "Symbol Legend"
    | Symbol | Key |
    |--------|-----|
    | ⌘ | Command |
    | ⌥ | Option/Alt |
    | ⇧ | Shift |
    | ⌃ | Control |

---

## Essential Shortcuts

<div class="grid cards" markdown>

-   :material-rocket-launch:{ .lg .middle } **⌘⇧N**

    ---

    Open Scribe from anywhere (global hotkey)

-   :material-magnify:{ .lg .middle } **⌘K**

    ---

    Command palette - quick access to everything

-   :material-file-plus:{ .lg .middle } **⌘N**

    ---

    Create new note

-   :material-calendar-today:{ .lg .middle } **⌘D**

    ---

    Open/create today's daily note

</div>

---

## Global

| Action | Shortcut |
|--------|----------|
| **Open Scribe** (from anywhere) | `⌘⇧N` |
| **Command Palette** | `⌘K` |
| **Settings** | `⌘,` |
| **Close Window** | `⌘W` |
| **Quit** | `⌘Q` |

---

## Navigation

| Action | Shortcut |
|--------|----------|
| **New Note** | `⌘N` |
| **New Project** | `⌘⇧N` |
| **Daily Note** | `⌘D` |
| **Search Notes** | `⌘F` |
| **Quick Capture** | `⌘⇧C` |
| **Toggle Right Sidebar** | `⌘⇧B` |
| **Toggle Terminal** | `⌘⌥T` |
| **Back** | `⌘[` |
| **Forward** | `⌘]` |

---

## Editor

| Action | Shortcut |
|--------|----------|
| **Toggle Write/Preview** | `⌘E` |
| **Focus Mode** | `⌘⇧F` |
| **Bold** | `⌘B` |
| **Italic** | `⌘I` |
| **Undo** | `⌘Z` |
| **Redo** | `⌘⇧Z` |

---

## Themes

!!! tip "Quick Theme Switching"
    Use `⌘⌥` + number (0-9) to switch themes instantly.

| Shortcut | Theme |
|----------|-------|
| `⌘⌥1` | Oxford Dark |
| `⌘⌥2` | Forest Night |
| `⌘⌥3` | Warm Cocoa |
| `⌘⌥4` | Midnight Purple |
| `⌘⌥5` | Deep Ocean |
| `⌘⌥6` | Soft Paper |
| `⌘⌥7` | Morning Fog |
| `⌘⌥8` | Sage Garden |
| `⌘⌥9` | Lavender Mist |
| `⌘⌥0` | Sand Dune |

---

## Command Palette

Press `⌘K` then type:

| Command | Action |
|---------|--------|
| `new` | Create new note |
| `daily` | Open today's daily note |
| `focus` | Toggle focus mode |
| `sync` | Sync to Obsidian |
| `claude` | Ask Claude |
| `gemini` | Ask Gemini |
| `settings` | Open settings |

---

## AI (Planned)

| Action | Shortcut |
|--------|----------|
| **AI Panel** | `⌘⇧A` |

---

## Developer Notes

All keyboard shortcuts are defined in a single registry file:

**File:** `src/renderer/src/lib/shortcuts.ts`

### SHORTCUTS Registry

The `SHORTCUTS` object is the single source of truth for key bindings,
modifier keys, and display labels. There are currently **27 registered
shortcuts** covering notes, navigation, editor modes, sidebars, and
system actions.

**Display labels:** Use `SHORTCUTS.xxx.label` to render the human-readable
shortcut string (e.g., `SHORTCUTS.focusMode.label` returns `"⌘⇧F"`).

**Event matching:** Use `matchesShortcut(event, shortcutId)` in keyboard
event handlers instead of manual `event.metaKey && event.key === '...'`
checks. The function handles `cmd`, `shift`, and `alt` modifier
combinations automatically.

```typescript
import { SHORTCUTS, matchesShortcut } from '../lib/shortcuts'

// Display
<span>{SHORTCUTS.focusMode.label}</span>  // "⌘⇧F"

// Match
function handleKeyDown(e: KeyboardEvent) {
  if (matchesShortcut(e, 'focusMode')) {
    toggleFocusMode()
  }
}
```

When a shortcut keybinding changes, update it in `shortcuts.ts` and both
UI labels and event matching update automatically.

---

## Next Steps

[Editor Guide :material-arrow-right:](editor.md){ .md-button .md-button--primary }
[Themes Guide](themes.md){ .md-button }
