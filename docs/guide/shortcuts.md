# Keyboard Shortcuts

Scribe is designed to be fully keyboard-driven. Here are all the shortcuts you need.

> Press `⌘?` or `⌘/` anytime to see this reference in-app.

---

## Symbol Legend

| Symbol | Key |
|--------|-----|
| ⌘ | Command |
| ⌥ | Option/Alt |
| ⇧ | Shift |
| ⌃ | Control |

---

## Reserved macOS Shortcuts (Not Overridden)

These shortcuts are handled by macOS and NOT overridden by Scribe:

| Shortcut | macOS Action | Why Reserved |
|----------|--------------|--------------|
| `⌘H` | Hide Scribe | System standard |
| `⌘M` | Minimize Window | System standard |
| `⌘Q` | Quit Scribe | System standard |
| `⌘Tab` | Switch Apps | System standard |
| `⌘Space` | Spotlight | System standard |
| `⌘C/V/X` | Copy/Paste/Cut | Editor needs these |
| `⌘Z/⇧⌘Z` | Undo/Redo | Editor needs these |
| `⌘A` | Select All | Editor needs this |

---

## Global

| Shortcut | Action |
|----------|--------|
| `⌘⇧N` | Open Scribe (from anywhere) |
| `⌘,` | Settings |
| `⌘?` or `⌘/` | Keyboard Shortcuts Panel |

---

## Notes

| Shortcut | Action |
|----------|--------|
| `⌘N` | New Note |
| `⌘D` | Daily Note |
| `⌘⇧C` | Quick Capture |
| `⌘⇧P` | New Project |
| `⌘F` | Search Notes |

---

## Tabs

| Shortcut | Action |
|----------|--------|
| `⌘1` | Go to Home (Mission Control) |
| `⌘2-9` | Go to Tab 2-9 |
| `⌘W` | Close Current Tab |
| `⌘⇧T` | Reopen Last Closed Tab |
| `⌃Tab` | Next Tab |
| `⌃⇧Tab` | Previous Tab |

---

## Editor

| Shortcut | Action |
|----------|--------|
| `⌘E` | Cycle Editor Mode (Source → Preview → Reading) |
| `⌘⇧F` | Toggle Focus Mode |
| `⌘⇧E` | Export Note |
| `⌘⇧G` | Graph View |
| `ESC` | Exit Reading Mode / Close Modal |

### Text Formatting (Native)

| Shortcut | Action |
|----------|--------|
| `⌘B` | Bold (also: Toggle Left Sidebar when not in editor) |
| `⌘I` | Italic |
| `⌘Z` | Undo |
| `⌘⇧Z` | Redo |

---

## Sidebars

### Left Sidebar

| Shortcut | Action |
|----------|--------|
| `⌘B` | Toggle Left Sidebar |
| `⌘0` | Cycle Sidebar Mode (Icon → Compact → Card) |
| `⌥1` | Projects Tab |
| `⌥2` | Notes Tab |
| `⌥3` | Daily Tab |
| `⌥4` | Tags Tab |
| `⌥5` | Trash Tab |

### Right Sidebar

| Shortcut | Action |
|----------|--------|
| `⌘⇧B` | Toggle Right Sidebar Mode (Expanded ↔ Icon) |
| `⌘⌥1` | Properties Tab |
| `⌘⌥2` | Backlinks Tab |
| `⌘⌥3` | Tags Tab |
| `⌘⌥4` | AI Tab |
| `⌘⇧A` | AI Panel (direct access) |
| `⌘⇧M` | Mission HUD Panel |

---

## Themes

Quick-switch between themes:

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

> **Note:** `⌘⌥1-4` also switch right sidebar tabs. When themes 1-4 are active,
> the right sidebar takes precedence. Use Settings to switch to themes 1-4.

---

## Writing Triggers

These are typed in the editor to trigger autocomplete:

| Trigger | Action |
|---------|--------|
| `[[` | Wiki Link autocomplete |
| `#` | Tag autocomplete |
| `@` | Citation autocomplete |
| `$` | Math (inline, e.g., `$x^2$`) |
| `$$` | Math (block, e.g., `$$\sum_{i=1}^n$$`) |

---

## Command Palette

Press `⌘K` then type:

| Command | What it does |
|---------|--------------|
| `new` | Create new note |
| `daily` | Open today's daily note |
| `focus` | Toggle focus mode |
| `sync` | Sync to Obsidian |
| `claude` | Ask Claude |
| `gemini` | Ask Gemini |
| `settings` | Open settings |

---

## Conflict Prevention Rules

When adding new shortcuts, avoid these patterns:

1. **Never use `⌘H`** - macOS Hide (use `⌘⇧M` for Mission HUD instead)
2. **Never use `⌘M`** - macOS Minimize
3. **`⌘1-9` are reserved** for tab navigation
4. **`⌘⌥1-4` overlap** with both right sidebar tabs and themes (by design)
5. **`⌥1-5`** are left sidebar tabs
6. **`⌘E`** cycles editor modes (don't add `⌘1/2/3` for direct mode switching)

---

## Implementation Notes

**Files with keyboard handlers:**
- `App.tsx` - Main global handlers
- `HybridEditor.tsx` - Editor-specific (⌘E, Escape)
- `QuickCaptureOverlay.tsx` - Quick capture (⌘↵ submit)
- `lib.rs` - Tauri menu accelerators

**Last updated:** 2025-12-28 (Sprint 27)
