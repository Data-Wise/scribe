# Settings Tutorial

> **Learn how to customize Scribe with the Settings system (v1.20.0)**

---

## Opening Settings

The fastest way to access settings is via the keyboard shortcut:

**⌘, (Command-Comma)** - Opens the Settings modal

Alternatively:
- Click the gear icon in the Mission Control sidebar
- Use Command Palette (⌘K) → "Settings"

---

## Settings Overview

Settings are organized into **6 tabs**:

| Tab | What's Inside |
|-----|---------------|
| **General** | Startup, ADHD features, Focus Timer (Pomodoro), identity, pinned vaults, terminal |
| **Editor** | Font, spacing, line height, ligatures, focus mode |
| **Appearance** | Themes (10 built-in), auto-theme, custom themes, tab bar style, sidebar tabs |
| **Files** | Project templates, defaults, daily notes |
| **Academic** | Citations, Quarto, LaTeX, export settings |
| **Icon Bar** | Sidebar icon customization |

---

## 🔍 Fuzzy Search

The Settings modal includes **fuzzy search** to quickly find any setting:

1. Open Settings (⌘,)
2. Start typing in the search box (e.g., "font", "theme", "pomodoro")
3. Results show matching settings with breadcrumb navigation
4. Click a result to jump to that setting's location

**Search is debounced** (300ms delay) for smooth typing without lag.

---

## General Tab

### Startup

| Setting | Description | Default |
|---------|-------------|---------|
| Open last page on startup | Return to exactly where you left off | On |

### ADHD Features

| Setting | Description | Default |
|---------|-------------|---------|
| Show writing streak milestones | Celebrate at 7, 30, 100, and 365 days | Off (to avoid anxiety) |

### Focus Timer (Pomodoro) — *New in v1.19.0*

The Pomodoro timer appears in the status bar. Click to start, right-click to reset.

| Setting | Description | Default | Range |
|---------|-------------|---------|-------|
| Show pomodoro timer | Display focus timer in status bar | On | — |
| Work duration | Minutes per focus session | 25 | 1–120 |
| Short break | Minutes between work sessions | 5 | 1–30 |
| Long break | Minutes after every Nth session | 15 | 1–60 |
| Long break interval | Take a long break every N pomodoros | 4 | 2–10 |

**How it works:**
1. Click the timer in the status bar to start a 25-minute focus session
2. When the timer completes, your word count is auto-saved and a gentle break toast appears
3. After the configured number of sessions, a longer break is suggested
4. Right-click the timer to reset it

### Pinned Vaults

Configure which project vaults appear as dots in the sidebar. Vaults are auto-pinned when you create a new project.

### Terminal (Tauri only)

Set the default terminal folder. Falls back to `~` when a project folder doesn't exist.

### Browser Mode (Browser only)

- View IndexedDB storage status
- Clear all data (notes, projects, tags)
- Restore demo data

---

## Editor Tab

Font and editing preferences. All settings use the reusable `SettingsToggle` component with accessible `role="switch"` controls.

| Setting | Description |
|---------|-------------|
| Font family | Choose from 14 recommended fonts |
| Font size | Editor text size (default: 15px) |
| Line height | Spacing between lines |
| Enable ligatures | Programming ligatures (e.g., Fira Code) |
| Show line numbers | Display line numbers in source mode |
| Word wrap | Wrap long lines |
| Focus mode | Dim everything except current paragraph |

---

## 🎨 Appearance Tab

### Themes

Scribe includes **10 ADHD-friendly themes** designed for extended writing sessions:

**Dark Themes (5):**

| Theme | Description | Accent |
|-------|-------------|--------|
| Oxford Dark | Cool academic blues (default) | Sky blue |
| Forest Night | Calming deep greens | Green |
| Warm Cocoa | Cozy warm browns | Warm tan |
| Midnight Purple | Gentle purples, dreamy | Purple |
| Deep Ocean | Navy blues, stable | Blue |

**Light Themes (5):**

| Theme | Description | Accent |
|-------|-------------|--------|
| Soft Paper | Warm off-white | Orange |
| Morning Fog | Cool grays, minimal | Gray |
| Sage Garden | Gentle greens | Green |
| Lavender Mist | Soft purples | Violet |
| Sand Dune | Warm neutrals | Amber |

Themes apply **instantly** — no lag or reload. The gallery shows a 3-column grid with color preview swatches.

### Auto-Theme

Scribe can automatically switch between light and dark themes:

| Time | Theme Type |
|------|------------|
| 6am – 6pm | Light themes |
| 6pm – 6am | Dark themes |

Enable in **Settings → Appearance → Auto-theme by time**.

### Custom Themes

Create your own theme:
1. Click "Create Custom Theme"
2. Choose colors (background, text, accent) or generate from a single color
3. Preview in real-time
4. Save with a custom name

Import/export themes as JSON or Base16 YAML. Import from URLs (GitHub Gists, raw files).

### Tab Bar Style

Customize how editor tabs appear:
- Tab bar style (standard, compact)
- Border style
- Active tab indicator

### Sidebar Tab Order

Drag-to-reorder sidebar tabs (Properties, Backlinks, Tags, Stats, Claude, Terminal).

---

## ⚡ Quick Actions Customization

Quick Actions are **one-click AI prompts** that auto-include your note context.

### Default Quick Actions

1. **Improve** — Enhance clarity and flow
2. **Expand** — Add more detail
3. **Summarize** — Create concise summary
4. **Explain** — Clarify complex concepts
5. **Research** — Find related information

### Customizing Quick Actions

**Access:** Settings → **Files** tab (AI & Workflow section)

- **Drag-to-reorder** — Click and hold the drag handle to reorder
- **Toggle visibility** — Checkbox to show/hide actions
- **Edit prompts** — Click pencil icon to customize the AI prompt
- **Assign shortcuts** — ⌘⌥1 through ⌘⌥9
- **Choose AI model** — Claude or Gemini per action
- **Add custom** — Up to 5 custom actions (10 total limit)

---

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Settings | ⌘, |
| Close Settings | Esc |
| Search Settings | Just start typing |
| Quick Action 1–9 | ⌘⌥1–9 |

The full keyboard shortcut registry (25 shortcuts) is defined in `src/renderer/src/lib/shortcuts.ts`.

---

## ♿ Accessibility

The Settings system follows accessibility best practices:

- **SettingsToggle** component uses `role="switch"`, `aria-checked`, and `aria-label`
- **Keyboard navigation** — Tab through all controls
- **Focus indicators** — Visible focus states on all interactive elements
- **Reduced motion** — Respects `prefers-reduced-motion` system setting

---

## 💾 Settings Persistence

All settings are **automatically saved** when you make changes:

- **Tauri mode:** SQLite database via preferences system
- **Browser mode:** localStorage with `usePreferences` hook for cached reads and event-based cross-component sync
- **No "Save" button needed** — changes apply immediately
- **Store sync** — Zustand stores (e.g., `usePomodoroStore`) auto-sync via `syncPreferences()` when preferences change

---

## 🐛 Troubleshooting

### Settings not persisting

- Check database write permissions (Tauri) or localStorage availability (browser)
- Open Developer Console (⌘⌥I) and check for errors

### Theme not applying

1. Verify the theme is selected (blue border + checkmark in gallery)
2. Hard refresh (⌘⇧R in browser mode)

### Focus Timer not visible

1. Check **Settings → General → Focus Timer → Show pomodoro timer** is enabled
2. The timer appears in the status bar at the bottom of the window

---

## 🔗 Related Documentation

- [Quick Actions Reference](../reference/REFCARD-QUICK-ACTIONS.md)
- [Settings Reference Card](../reference/REFCARD-SETTINGS.md)
- [Themes Guide](../guide/themes.md)
- [Features Overview](../guide/features.md)
- [Keyboard Shortcuts](../guide/shortcuts.md)

---

**Questions or feedback?** [Open an issue](https://github.com/Data-Wise/scribe/issues)
