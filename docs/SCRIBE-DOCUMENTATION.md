# Scribe — Comprehensive Technical Documentation

**Version:** 1.19.1 (Settings Infrastructure)
**Last Updated:** 2026-02-24
**Branch:** dev

---

## Table of Contents

1. [Overview](#1-overview)
2. [Getting Started](#2-getting-started)
3. [Features Guide](#3-features-guide)
4. [Keyboard Shortcuts Reference](#4-keyboard-shortcuts-reference)
5. [Editor Modes](#5-editor-modes)
6. [Project Management](#6-project-management)
7. [Sidebar System](#7-sidebar-system)
8. [Pomodoro Timer](#8-pomodoro-timer)
9. [AI Integration](#9-ai-integration)
10. [Themes and Appearance](#10-themes-and-appearance)
11. [Settings Reference](#11-settings-reference)
12. [Architecture Overview](#12-architecture-overview)
13. [API Reference](#13-api-reference)
14. [Development Guide](#14-development-guide)

---

## 1. Overview

Scribe is a desktop knowledge management and writing application built for researchers, academics, and focused writers. It combines a markdown note editor with project organization, a knowledge graph, AI assistants, academic citation management, and — as of v1.19 — a built-in Pomodoro timer.

### What Makes Scribe Different

Scribe is intentionally opinionated. Rather than being a general-purpose note tool, it is designed around the workflows of people doing sustained intellectual work: literature reviews, R package development, course preparation, long-form writing. It ships with five project archetypes (Research, Teaching, R Package, R Dev, Generic) that encode those workflows directly into the UI.

The design philosophy is ADHD-friendly: information is surfaced when needed, not buried in menus. The icon-centric sidebar (introduced in v1.16) keeps the primary workspace uncluttered while making every major function reachable within one click or one keyboard shortcut.

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | Tauri 2.10 (Rust) |
| UI framework | React 18 + TypeScript 5.5 |
| Build toolchain | Vite 5 |
| State management | Zustand 4.5 |
| Source editor | CodeMirror |
| Terminal emulator | xterm.js |
| Knowledge graph | D3.js |
| Math rendering | KaTeX |
| Database (desktop) | SQLite via Tauri |
| Database (browser) | IndexedDB |
| Styling | Tailwind CSS |

Tauri provides the native shell: window management, native menus, file system access, and IPC between the Rust backend and the React frontend. The entire UI is React; Tauri handles only the things a browser cannot.

### At a Glance — Core Capabilities

- **Notes** — Create, edit, tag, link, and search markdown notes
- **Wiki Links** — `[[note name]]` syntax with automatic backlink tracking
- **Projects** — Five typed project archetypes with scoped note collections
- **Knowledge Graph** — Interactive D3 visualization of note connections
- **Three Editor Modes** — Source (raw markdown), Live Preview (split), Reading (rendered)
- **Export** — PDF, DOCX, LaTeX, HTML via Pandoc
- **Focus Mode** — Distraction-free full-screen writing
- **Quick Capture** — Instant note from anywhere in the app
- **Command Palette** — Keyboard-driven command access
- **Tabs** — Pin, reorder, close, reopen tabs
- **10 Built-in Themes** — Plus custom CSS and time-based auto-switching
- **AI Chat** — Claude and Gemini integration
- **Terminal** — Embedded xterm.js shell
- **Academic Citations** — BibTeX bibliography management
- **Writing Streaks** — Daily streak tracking with milestones
- **Word Count Goals** — Per-session targets
- **Pomodoro Timer** (v1.19) — Status bar timer with configurable work/break cycles

---

## 2. Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| macOS | 13 Ventura or later (primary platform) |
| Node.js | 18 or later |
| Rust toolchain | Latest stable (for development builds) |
| Pandoc | Optional — required for PDF/DOCX/LaTeX export |

### Installation

Download the latest `.dmg` from the GitHub releases page and drag Scribe into your Applications folder. On first launch, macOS may prompt you to allow the app from an unidentified developer — open System Settings > Privacy & Security and click "Open Anyway."

For development builds, see [Section 14 — Development Guide](#14-development-guide).

### First Launch

On first launch Scribe will:

1. Create a default **Research** project automatically.
2. Initialize the local SQLite database (on Tauri) or IndexedDB (in browser dev mode).
3. Load the default theme (Sepia).
4. Show the empty editor with the sidebar in icon-only mode.

**Recommended first steps:**

1. Press `⌘N` to create your first note.
2. Press `⌘,` to open Settings and review preferences.
3. Press `⌘⇧G` to see the (empty) knowledge graph — it fills in as you create linked notes.
4. If you write in R or have research projects, press `⌘⇧N` to create a typed project.

---

## 3. Features Guide

### Notes

Notes are the atomic unit of Scribe. Every note is a markdown document stored in the database with associated metadata (tags, project membership, timestamps, word count).

**Creating notes:**
- `⌘N` — new blank note
- `⌘D` — today's daily note (creates one if it does not exist)
- `⌘⇧C` — Quick Capture modal (title + body, saves immediately)

**Organizing notes:**

Tags are extracted automatically from `#hashtag` syntax in the note body and are also manageable from the right sidebar Tags panel. Notes can belong to one project at a time; you change a note's project from the Properties panel in the right sidebar.

**Wiki Links:**

Type `[[` anywhere in a note to start a wiki link. Scribe auto-extracts all `[[note name]]` references on save and updates the backlink index. Backlinks for the current note appear in the right sidebar Backlinks panel.

**Search:**

Press `⌘F` to open the search panel. Search uses SQLite full-text search (FTS) on Tauri or a JavaScript FTS implementation in browser mode. Results are ranked by relevance.

### Quick Capture

`⌘⇧C` opens a lightweight modal overlay usable from any screen in the app. Type a title, add body text, and press Enter to save. The note is created in the current project and appears in the sidebar immediately.

This is intentionally minimal — the goal is to capture an idea before it disappears, not to compose a finished note.

### Command Palette

The Command Palette surfaces frequently-used actions by keyboard. It is filtered by Fuse.js fuzzy search, so you do not need to type exact command names. It includes up to 5 default quick actions plus custom user-defined ones (max 10 total).

### Tabs

Scribe uses a tab bar above the editor. Tabs represent open notes. Behavior:

- **Pin a tab** — right-click the tab
- **Reorder tabs** — drag and drop
- **Close tab** — `⌘W` or click the X
- **Reopen closed tab** — `⌘⇧T` (restores from a history of up to 10 closed tabs)
- **Switch to tab N** — `⌘1` through `⌘9`

Tab state (open tabs, order, pinned state) persists to `localStorage` via `useAppViewStore`.

### Focus Mode

`⌘⇧F` (or View menu) enters Focus Mode: hides both sidebars, maximizes the editor, and removes all UI chrome. Press `Escape` or `⌘⇧F` again to exit. Focus Mode state persists across launches.

### Knowledge Graph

`⌘⇧G` opens the Knowledge Graph — an interactive D3 force-directed graph where nodes are notes and edges are wiki links. You can:

- Click a node to open that note
- Drag nodes to rearrange the layout
- Zoom with scroll/pinch
- Filter by project or tag

The graph updates in real time as you create or delete links.

### Writing Streaks and Word Count Goals

Scribe tracks a daily writing streak (days with at least some editing activity). Opt-in via Settings > Writing > Streak Display. Milestones can trigger celebration animations (also opt-in).

Word count goals are set per-session (default 500 words). Progress appears in the status bar. The goal resets at midnight.

### Export

`⌘⇧E` opens the Export dialog. Scribe uses Pandoc for document conversion. Available formats:

| Format | Requires Pandoc |
|--------|----------------|
| HTML | No |
| PDF | Yes |
| DOCX | Yes |
| LaTeX | Yes |

The app checks for Pandoc availability at startup via `api.isPandocAvailable()`. If Pandoc is not installed, PDF/DOCX/LaTeX options are disabled with a link to install it.

### Academic Citations

Scribe supports BibTeX bibliography files. Set your `.bib` file path in Settings > Academic. Once configured:

- `api.getCitations()` loads all entries
- `api.searchCitations(query)` filters by author, title, year, or key
- Citations can be inserted into notes in standard Pandoc citation format (`[@key]`)

---

## 4. Keyboard Shortcuts Reference

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘N` | New Note |
| `⌘D` | Daily Note |
| `⌘⇧N` | New Project |
| `⌘⇧C` | Quick Capture |
| `⌘F` | Search Notes |
| `⌘⇧E` | Export |
| `⌘⇧G` | Knowledge Graph |
| `⌘⇧F` | Focus Mode toggle |
| `⌘,` | Settings |
| `⌘?` or `⌘/` | Keyboard Shortcuts help dialog |

### Sidebar

| Shortcut | Action |
|----------|--------|
| `⌘B` | Left Sidebar toggle |
| `⌘⇧B` | Right Sidebar toggle |
| `⌘⇧[` | Collapse All (left sidebar) |
| `⌘⇧]` | Right Sidebar toggle (alias) |
| `⌘[` | Right sidebar — previous tab |
| `⌘]` | Right sidebar — next tab |

### Tabs

| Shortcut | Action |
|----------|--------|
| `⌘1`–`⌘9` | Switch to tab N |
| `⌘W` | Close current tab |
| `⌘⇧T` | Reopen last closed tab |

### Editor View Modes

| Shortcut | Action |
|----------|--------|
| `⌘1` (View menu) | Source mode |
| `⌘2` (View menu) | Live Preview mode |
| `⌘3` (View menu) | Reading mode |

### Tools

| Shortcut | Action |
|----------|--------|
| `⌘⌥T` | Terminal tab toggle |

### Smart Icons (Project Quick-Switch)

| Shortcut | Action |
|----------|--------|
| `⌘⇧1` | Research project icon |
| `⌘⇧2` | Teaching project icon |
| `⌘⇧3` | R Packages project icon |
| `⌘⇧4` | Dev Tools project icon |

### Theme Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘⌥0`–`⌘⌥9` | Switch to theme slot 0–9 |

> Note: `⌘⇧N` opens New Project via the native Tauri menu. The pomodoro timer has no keyboard shortcut — use click to start/pause.

---

## 5. Editor Modes

The editor has three distinct rendering modes, switchable from the View menu or via the mode selector in the editor toolbar.

### Source Mode

Raw markdown editing via CodeMirror. This is the default for users who prefer direct control over markup. CodeMirror provides:

- Syntax highlighting for markdown, fenced code blocks (with language tags), and inline code
- Line numbers
- vim/emacs keybindings (if configured)
- KaTeX rendering for `$inline$` and `$$block$$` math expressions (rendered as overlays)

**Best for:** Power users, those who need precise control over formatting, writing documents that will be exported.

### Live Preview Mode

A split view: source on the left, rendered HTML on the right. Changes in the source panel update the preview in real time. This mode uses `ReactMarkdown` for rendering with custom renderers for wiki links, tags, and math.

**Best for:** Users who want to see the output while writing, without leaving the editing surface.

### Reading Mode

Full rendered view with no editing surface. The note is displayed as final HTML with all markdown, math, and wiki links rendered. Click a wiki link to navigate to that note.

**Best for:** Reviewing a finished note, reading reference material, following wiki link trails.

### Switching Modes

Mode is stored in preferences (`editorMode` key) and persists across launches. The current mode appears in the View menu with a checkmark. Modes apply globally — switching mode changes the view for all open tabs.

---

## 6. Project Management

### Project Types

Scribe ships with five project archetypes. Each type customizes the sidebar layout, default tags, and available smart icons.

| Type | Icon | Description |
|------|------|-------------|
| Research | Microscope | Literature reviews, research notes, paper drafts |
| Teaching | Graduation cap | Course materials, lecture notes, syllabi |
| R Package | Package box | R package documentation, vignettes, NEWS |
| R Dev | Code brackets | R scripts, analysis notebooks, data notes |
| Generic | Folder | Any other project structure |

The type is cosmetic in terms of data storage — all projects use the same underlying schema — but it determines which smart icon slot is used and what the default sidebar grouping looks like.

### Creating a Project

Press `⌘⇧N` to open the Create Project modal. You choose:

1. Project name
2. Project type
3. Optional description

On save, `useProjectStore.createProject()` calls `api.createProject()` and the new project is automatically pinned to the sidebar.

### Pinned Vaults

The sidebar supports up to **5 pinned vaults** (projects). They appear as icons in the icon bar. If you have more than 5 projects, older pins are evicted (LRU). You can manually reorder or unpin from the sidebar context menu.

### Switching Projects

Click a project icon in the sidebar to make it the active project. The note list in the expanded sidebar panel updates to show only notes belonging to that project. Smart icon shortcuts (`⌘⇧1`–`⌘⇧4`) jump directly to the four typed project slots.

### Default Project

On first launch, Scribe creates a default **Research** project automatically via `useProjectStore`'s initialization logic. This ensures new notes always have a project to belong to.

---

## 7. Sidebar System

The sidebar was redesigned in v1.16 to use an icon-centric architecture that keeps the writing surface as wide as possible by default.

### Structure

```
App
└── MissionSidebar
    ├── IconBar (48px wide, always visible)
    │   ├── Pinned vault icons (up to 5)
    │   ├── Smart icons (4 typed project shortcuts)
    │   └── System icons (Search, Graph, Terminal, Settings)
    └── ExpandedIconPanel (collapsible, 2 styles)
        ├── Compact view (dense list)
        └── Card view (richer preview)
```

### Icon Bar

The icon bar is always visible at 48px wide. It contains:

- **Pinned vaults** — up to 5 project icons at the top. Click to expand that project's note list.
- **Smart icons** — 4 slots for the four typed project archetypes (Research, Teaching, R Package, R Dev). These are fixed positions; the icon changes to reflect whichever project of that type is active.
- **System icons** — at the bottom: Search, Knowledge Graph, Terminal, Settings.

### Expanded Panel

Clicking an icon in the icon bar expands the panel to the right of the icon bar. The expanded panel shows the note list for that project (or search results, graph preview, etc. depending on which icon was clicked).

Two display styles are available from Settings:

- **Compact** — high-density list, icon + title + date
- **Card** — larger cards with a preview excerpt

### Right Sidebar

The right sidebar (`⌘⇧B`) contains contextual panels for the active note:

| Panel | Contents |
|-------|---------|
| Properties | Note title, project, creation/modified dates |
| Backlinks | Notes that link to the current note |
| Tags | Tags on the current note (add/remove) |
| Stats | Word count, reading time, character count |
| Claude | AI chat panel (context-aware) |
| Terminal | Embedded xterm.js terminal |

Navigate between right sidebar panels with `⌘[` and `⌘]`.

### Sidebar State Persistence

All sidebar state persists via `useAppViewStore` to `localStorage`:

- `expandedIcon` — which icon is currently expanded
- `sidebarWidth` — the user-dragged panel width
- `pinnedVaults` — ordered list of up to 5 pinned project IDs
- `smartIcons` — the 4 typed project slot assignments

---

## 8. Pomodoro Timer

The Pomodoro Timer is new in v1.19. It is a state machine timer embedded in the status bar that implements the classic Pomodoro Technique: 25-minute work sessions separated by short (5 min) and long (15 min) breaks.

### Enabling the Timer

Open Settings (`⌘,`) and navigate to the Pomodoro section. Toggle **Enable Pomodoro Timer** on. The timer icon appears in the status bar at the bottom of the editor.

### Status Bar Display

When enabled, the timer displays in the editor status bar:

- **Idle** — shows a tomato icon and "Pomodoro" label
- **Work** — shows remaining time in `MM:SS` format with a red indicator
- **Short Break** — shows remaining time with a green indicator
- **Long Break** — shows remaining time with a blue indicator
- **Paused** — shows the remaining time with a pause icon overlay

### Interactions

| Interaction | Action |
|-------------|--------|
| Click the timer | Start (if idle) / Pause (if running) / Resume (if paused) |
| Right-click the timer | Reset to idle state |

### State Machine

The Pomodoro timer follows a strict state machine:

```
idle
  → start()
  → work (25 min default)
      → tick() each second
      → onComplete fires at 0
      → if completedToday % longBreakInterval == 0
          → long-break (15 min default)
        else
          → short-break (5 min default)
      → break tick() to 0
      → reset to idle
```

The `completedToday` counter increments each time a work session completes. It resets to zero when the app restarts (it is not persisted — it is a session counter).

The `longBreakInterval` preference (default 4) controls how frequently long breaks occur. After every 4th completed work session, the next break is a long break instead of a short one.

### Auto-Save on Work Complete

When a work session completes (`onComplete` fires), the timer notifies the active note to save. This ensures writing progress is committed before the break begins. The auto-save uses the same code path as the manual save triggered by `useNotesStore.updateNote()`.

### Configuration

All Pomodoro preferences are stored in `localStorage` under the `scribe-preferences` key:

| Preference | Default | Description |
|------------|---------|-------------|
| `pomodoroEnabled` | `true` | Show/hide the timer in the status bar |
| `pomodoroWorkMinutes` | `25` | Duration of a work session in minutes |
| `pomodoroShortBreakMinutes` | `5` | Duration of a short break in minutes |
| `pomodoroLongBreakMinutes` | `15` | Duration of a long break in minutes |
| `pomodoroLongBreakInterval` | `4` | Work sessions between long breaks |

Changes to these preferences take effect on the next timer start. If the timer is currently running when preferences change, `syncPreferences()` is called to update the store without resetting the running session.

### Zustand Store: usePomodoroStore

The timer state lives in `src/renderer/src/store/usePomodoroStore.ts`.

**State shape:**

```typescript
interface PomodoroState {
  status: 'idle' | 'work' | 'short-break' | 'long-break'
  secondsRemaining: number
  isPaused: boolean
  completedToday: number
  lastResetDate: string      // ISO date (YYYY-MM-DD)
  workDuration: number       // seconds, derived from pomodoroWorkMinutes pref
  shortBreakDuration: number // seconds, derived from pomodoroShortBreakMinutes pref
  longBreakDuration: number  // seconds, derived from pomodoroLongBreakMinutes pref
  longBreakInterval: number  // every N pomodoros
}
```

**Actions:**

| Action | Description |
|--------|-------------|
| `start()` | Transition from idle to work phase |
| `pause()` | Toggle isPaused on a running timer |
| `reset()` | Return to idle, clear secondsRemaining |
| `tick(onComplete?, onBreakComplete?)` | Decrement secondsRemaining by 1; fire onComplete on work→break, onBreakComplete on break→work |
| `syncPreferences()` | Re-read preferences and update duration values without resetting phase |

**Rendering:**

`PomodoroTimer` is a React component rendered in the editor status bar. It subscribes to `usePomodoroStore` and sets up a `setInterval` (1000ms) that calls `tick()` when the timer is running and not paused. The interval is cleared on component unmount and whenever `isPaused` becomes true.

### Settings UI

The Pomodoro settings appear as a dedicated section in `Settings > General`. They use the same `SettingsSection` wrapper and toggle pill style as all other settings sections:

- Enable/disable toggle
- Number inputs for each duration (validated: min 1 min, max 60 min for work/break; max 10 for interval)

---

## 9. AI Integration

### Claude Chat

Claude is integrated as a chat panel in the right sidebar. The panel is context-aware: it sends the current note's content along with your message, so Claude can answer questions about what you are writing.

Under the hood, `api.runClaude(prompt, context)` sends an IPC message to the Tauri backend, which calls the Anthropic API and streams the response back to the UI.

**Use cases:**
- "Summarize this note"
- "What sources should I cite for this claim?"
- "Help me restructure this argument"
- "Translate this paragraph to formal academic English"

### Gemini Chat

The same right sidebar panel can switch to Gemini via `api.runGemini(prompt, context)`. The UX is identical to Claude. Gemini is useful as a second opinion or when you prefer its strengths for certain tasks (e.g., code generation).

### Quick Actions

Quick Actions are pre-configured prompts that appear in the command palette. The Settings store manages up to 10 quick actions (5 defaults + 5 user-defined). Each action has:

- A label (shown in command palette)
- A prompt template (can include `{{note}}` to inject current note content)
- A target AI (Claude or Gemini)

Default quick actions include things like "Summarize note," "Extract key ideas," and "Generate outline."

---

## 10. Themes and Appearance

### Built-in Themes

Scribe ships with 10 built-in themes. Themes are implemented as sets of CSS custom properties applied to `:root`.

| Slot | Theme Name |
|------|-----------|
| 0 | Sepia (default) |
| 1 | Dark |
| 2 | Light |
| 3 | Nord |
| 4 | Solarized |
| 5 | Dracula |
| 6 | Gruvbox |
| 7 | Catppuccin |
| 8 | Tokyo Night |
| 9 | Monokai |

Switch themes via `⌘⌥0` through `⌘⌥9` or from the Appearance section in Settings.

### Custom Themes

In Settings > Appearance > Custom CSS, you can write CSS that is injected after the base theme. Enable custom CSS with the toggle in that section. The preference keys are `customCSS` (string) and `customCSSEnabled` (boolean).

Custom CSS can override any CSS variable or add new rules. Example to change the note background:

```css
:root {
  --note-background: #1a1a2e;
  --note-text: #e0e0e0;
}
```

### Auto-Theme (Time-Based Switching)

Scribe can automatically switch themes based on time of day. Configure two themes (day and night) and the transition times in Settings > Appearance > Auto Theme. The app checks the current time every 60 seconds and switches if needed.

This uses a `setInterval` in the theme loader — not a system event — so the switch happens within one minute of the configured time.

### Appearance Preferences

| Preference | Description |
|------------|-------------|
| `tabBarStyle` | Tab bar style: default, minimal, or pill |
| `borderStyle` | Border rendering: sharp, rounded, or none |
| `activeTabStyle` | How the active tab is highlighted |
| `iconGlowEffect` | Enable glow effect on sidebar icons |
| `iconGlowIntensity` | Glow intensity (0–100) |

---

## 11. Settings Reference

All preferences are stored in `localStorage` under the key `scribe-preferences`. On load, stored preferences are merged with defaults:

```typescript
const prefs = { ...DEFAULTS, ...JSON.parse(localStorage.getItem('scribe-preferences') ?? '{}') }
```

This merge-on-load pattern ensures new preference keys added in future versions always have a default value even for existing users.

### Writing Preferences

| Key | Default | Description |
|-----|---------|-------------|
| `defaultWordGoal` | `500` | Daily word count goal |
| `focusModeEnabled` | `false` | Whether Focus Mode is active |
| `streakDisplayOptIn` | `false` | Show writing streak in status bar |
| `celebrateMilestones` | `false` | Animate milestone celebrations |

### Editor Preferences

| Key | Default | Description |
|-----|---------|-------------|
| `editorMode` | `'source'` | Default editor mode: `source`, `live-preview`, or `reading` |
| `customCSS` | `''` | Custom CSS string |
| `customCSSEnabled` | `false` | Whether custom CSS is injected |

### UI Style Preferences

| Key | Default | Description |
|-----|---------|-------------|
| `tabBarStyle` | `'default'` | Tab bar visual style |
| `borderStyle` | `'rounded'` | Border style for panels |
| `activeTabStyle` | `'underline'` | Active tab highlight style |

### Sidebar Preferences

| Key | Default | Description |
|-----|---------|-------------|
| `sidebarTabSize` | `'compact'` | Note list density: `compact` or `card` |
| `sidebarTabOrder` | `[]` | Ordered array of visible sidebar tab IDs |
| `sidebarHiddenTabs` | `[]` | Array of tab IDs to hide |

### Icon Bar Preferences

| Key | Default | Description |
|-----|---------|-------------|
| `iconGlowEffect` | `false` | Glow effect on sidebar icons |
| `iconGlowIntensity` | `50` | Glow intensity 0–100 |

### Pomodoro Preferences

| Key | Default | Description |
|-----|---------|-------------|
| `pomodoroEnabled` | `true` | Show Pomodoro timer in status bar |
| `pomodoroWorkMinutes` | `25` | Work session duration (minutes) |
| `pomodoroShortBreakMinutes` | `5` | Short break duration (minutes) |
| `pomodoroLongBreakMinutes` | `15` | Long break duration (minutes) |
| `pomodoroLongBreakInterval` | `4` | Work sessions per long break cycle |

---

## 12. Architecture Overview

### Component Tree

```
App.tsx
├── KeyboardShortcutHandler (headless — no rendered output)
├── MissionSidebar
│   ├── IconBar (48px, always visible)
│   └── ExpandedIconPanel (collapsible)
│       ├── Note list (compact or card view)
│       └── Search results / Graph preview / etc.
├── EditorTabs (tab bar above editor)
├── EditorOrchestrator
│   └── HybridEditor
│       ├── CodeMirrorEditor (source mode)
│       └── ReactMarkdown renderer (reading / live preview)
├── Right Sidebar
│   ├── PropertiesPanel
│   ├── BacklinksPanel
│   ├── TagsPanel
│   ├── StatsPanel
│   ├── ClaudePanel
│   └── TerminalPanel (xterm.js)
├── PomodoroTimer (status bar)
└── Dialogs (modal overlays)
    ├── SettingsDialog
    ├── CreateProjectModal
    ├── ExportDialog
    ├── GraphDialog (D3)
    └── QuickCaptureModal
```

### Zustand Stores

Scribe uses five Zustand stores. All stores live in `src/renderer/src/store/` (note: singular `store`, not `stores`).

| Store | File | Responsibility |
|-------|------|----------------|
| `usePomodoroStore` | `usePomodoroStore.ts` | Pomodoro timer state machine |
| `useAppViewStore` | `useAppViewStore.ts` | Sidebar state, tabs, pinned vaults |
| `useNotesStore` | `useNotesStore.ts` | Notes list, selected note, CRUD |
| `useProjectStore` | `useProjectStore.ts` | Projects list, current project |
| `useSettingsStore` | `useSettingsStore.ts` | App settings, quick actions, categories |

Stores communicate with the database exclusively through the API layer (`api.ts`). Stores do not call Tauri IPC or IndexedDB directly.

### Data Flow

The canonical data flow for note editing:

```
User types in editor
  → HybridEditor.onChange(newContent)
  → useNotesStore.updateNote(id, { content: newContent })
  → api.updateNote(id, data)
  → Tauri IPC: invoke('update_note', data)   [or IndexedDB.put() in browser]
  → SQLite write (Rust handler)
  → Promise resolves
  → Store state updated
  → React re-render (subscribing components)
```

The flow is deliberately linear and synchronous from the UI's perspective. There is no optimistic update / rollback logic — the store updates only after the API call resolves.

### API Layer (Factory Pattern)

`src/renderer/src/api.ts` exports a single `api` object constructed by a factory function that detects the runtime environment:

```typescript
const api = createApi()  // returns TauriApi or BrowserApi
```

`TauriApi` implements each method via `invoke(commandName, args)` (Tauri IPC to Rust).
`BrowserApi` implements each method via IndexedDB operations (for browser-based development without Tauri).

Both implementations satisfy the same TypeScript interface, so all application code is runtime-agnostic.

### Keyboard Shortcut Handling

`KeyboardShortcutHandler` is a headless React component (renders `null`) that registers a single `keydown` listener on `document` at mount time. It is placed at the top of the component tree (inside `App.tsx`) so it captures all keyboard events.

The handler checks `event.metaKey`, `event.shiftKey`, `event.altKey`, and `event.key` to dispatch actions. Each action calls the appropriate store method or opens the relevant dialog.

**Important:** The native Tauri menu also registers shortcuts (e.g., `⌘N`, `⌘⇧N`). When both the native menu and `KeyboardShortcutHandler` register the same shortcut, the native menu fires first (Tauri intercepts it before the WebView).

### Theme System

Themes are applied by `loadSelectedTheme()`, which:

1. Reads the selected theme name from preferences
2. Loads the theme object (a map of CSS variable names to values)
3. Calls `applyTheme(themeObject)`, which iterates the map and sets each variable on `document.documentElement` (`:root`)

Custom CSS is injected as a `<style>` tag after theme application. Auto-theme runs on a 60-second interval and calls `loadSelectedTheme()` when the current time crosses a threshold.

---

## 13. API Reference

The `api` object is the single interface between the UI and the database. All methods return Promises.

### Notes

| Method | Signature | Description |
|--------|-----------|-------------|
| `createNote` | `(data: NoteCreateInput) => Promise<Note>` | Create a new note |
| `updateNote` | `(id: string, data: Partial<Note>) => Promise<Note>` | Update note fields |
| `deleteNote` | `(id: string) => Promise<void>` | Delete a note permanently |
| `getNote` | `(id: string) => Promise<Note>` | Fetch a single note by ID |
| `listNotes` | `(projectId?: string) => Promise<Note[]>` | List notes, optionally scoped to a project |
| `searchNotes` | `(query: string) => Promise<Note[]>` | Full-text search, returns ranked results |

### Tags

| Method | Signature | Description |
|--------|-----------|-------------|
| `createTag` | `(name: string) => Promise<Tag>` | Create a tag |
| `getAllTags` | `() => Promise<Tag[]>` | List all tags |
| `addTagToNote` | `(noteId: string, tagId: string) => Promise<void>` | Attach tag to note |
| `removeTagFromNote` | `(noteId: string, tagId: string) => Promise<void>` | Detach tag from note |
| `getNoteTags` | `(noteId: string) => Promise<Tag[]>` | Get all tags for a note |
| `filterNotesByTags` | `(tagIds: string[]) => Promise<Note[]>` | Filter notes by tag set |
| `updateNoteTags` | `(noteId: string, content: string) => Promise<void>` | Auto-extract `#tags` from content and sync |

### Links (Wiki Links)

| Method | Signature | Description |
|--------|-----------|-------------|
| `updateNoteLinks` | `(noteId: string, content: string) => Promise<void>` | Auto-extract `[[links]]` and sync backlink index |
| `getBacklinks` | `(noteId: string) => Promise<Note[]>` | Notes that link to `noteId` |
| `getOutgoingLinks` | `(noteId: string) => Promise<Note[]>` | Notes that `noteId` links to |

### Projects

| Method | Signature | Description |
|--------|-----------|-------------|
| `listProjects` | `() => Promise<Project[]>` | List all projects |
| `createProject` | `(data: ProjectCreateInput) => Promise<Project>` | Create a project |
| `updateProject` | `(id: string, data: Partial<Project>) => Promise<Project>` | Update project fields |
| `deleteProject` | `(id: string) => Promise<void>` | Delete a project |
| `getProjectNotes` | `(projectId: string) => Promise<Note[]>` | Notes belonging to project |
| `setNoteProject` | `(noteId: string, projectId: string) => Promise<void>` | Move note to project |

### AI

| Method | Signature | Description |
|--------|-----------|-------------|
| `runClaude` | `(prompt: string, context?: string) => Promise<string>` | Send prompt to Claude API |
| `runGemini` | `(prompt: string, context?: string) => Promise<string>` | Send prompt to Gemini API |

### Export

| Method | Signature | Description |
|--------|-----------|-------------|
| `exportDocument` | `(noteId: string, format: ExportFormat) => Promise<void>` | Export note via Pandoc |
| `isPandocAvailable` | `() => Promise<boolean>` | Check if Pandoc is installed |

### Terminal

| Method | Signature | Description |
|--------|-----------|-------------|
| `spawnShell` | `() => Promise<string>` | Spawn a shell process, returns PTY ID |
| `writeToShell` | `(ptyId: string, data: string) => Promise<void>` | Write input to shell |
| `resizeShell` | `(ptyId: string, cols: number, rows: number) => Promise<void>` | Resize terminal |
| `killShell` | `(ptyId: string) => Promise<void>` | Kill shell process |

### Academic Citations

| Method | Signature | Description |
|--------|-----------|-------------|
| `getCitations` | `() => Promise<Citation[]>` | Load all entries from configured BibTeX file |
| `searchCitations` | `(query: string) => Promise<Citation[]>` | Search citations by author/title/key/year |
| `setBibliographyPath` | `(path: string) => Promise<void>` | Set path to `.bib` file |

---

## 14. Development Guide

### Project Structure

```
pomodoro/                          (worktree root = project root)
├── src/
│   ├── main.ts                    (Tauri main process entry)
│   └── renderer/
│       └── src/
│           ├── App.tsx            (React root)
│           ├── api.ts             (API factory: Tauri/Browser)
│           ├── store/             (Zustand stores — singular, not "stores")
│           │   ├── usePomodoroStore.ts
│           │   ├── useAppViewStore.ts
│           │   ├── useNotesStore.ts
│           │   ├── useProjectStore.ts
│           │   └── useSettingsStore.ts
│           ├── components/
│           │   ├── App.tsx
│           │   ├── KeyboardShortcutHandler.tsx
│           │   ├── EditorOrchestrator.tsx
│           │   ├── HybridEditor/
│           │   │   └── CodeMirrorEditor.tsx
│           │   ├── MissionSidebar/
│           │   │   ├── IconBar.tsx
│           │   │   └── ExpandedIconPanel.tsx
│           │   ├── EditorTabs.tsx
│           │   ├── PomodoroTimer.tsx
│           │   └── Settings/
│           │       ├── GeneralSettingsTab.tsx
│           │       ├── EditorSettingsTab.tsx
│           │       └── SettingsSection.tsx
│           └── __tests__/
│               ├── setup.ts       (vitest + happy-dom setup)
│               └── testUtils.ts   (createMockPreferences and other helpers)
├── src-tauri/                     (Rust Tauri backend)
│   ├── src/
│   │   └── main.rs
│   └── tauri.conf.json
├── docs/
│   └── SCRIBE-DOCUMENTATION.md   (this file)
├── package.json
├── vite.config.ts
└── vitest.config.ts
```

### Dev Setup

```bash
# Install JS dependencies
npm install

# Run in browser development mode (no Tauri, uses IndexedDB)
npm run dev

# Run with Tauri (requires Rust toolchain)
npm run tauri dev

# Build production bundle
npm run tauri build
```

In browser development mode (`npm run dev`), the `createApi()` factory detects the absence of Tauri and returns the `BrowserApi` implementation backed by IndexedDB. All features work except those that require native OS access (terminal, file system export).

### Testing

```bash
# Run the full test suite
npm test

# Run with coverage
npm run test:coverage

# Run a specific test file
npm test -- src/renderer/src/__tests__/usePomodoroStore.test.ts
```

**Test framework:** Vitest + happy-dom + `@testing-library/react`

**Test setup file:** `src/renderer/src/__tests__/setup.ts`

**Test utilities:** `src/renderer/src/__tests__/testUtils.ts`

The `testUtils.ts` file exports `createMockPreferences()`, which returns a complete preferences object with all fields. This is used in tests that need to mock the preferences store. If you add a new preference key, you must also add it to `createMockPreferences()` or tests that use it will fail with missing field errors.

### Vitest Configuration

The `vitest.config.ts` at the project root configures:
- `environment: 'happy-dom'` for DOM simulation
- `setupFiles: ['src/renderer/src/__tests__/setup.ts']` for global test setup
- Path aliases mirroring the Vite config (`@/` → `src/renderer/src/`)

If tests require special VM module flags, document them in `vitest.config.ts`, not as inline comments.

### Writing a New Store

Follow the pattern established by the existing stores:

```typescript
// src/renderer/src/store/useMyFeatureStore.ts
import { create } from 'zustand'

interface MyFeatureState {
  // state fields
}

interface MyFeatureActions {
  // action signatures
}

export const useMyFeatureStore = create<MyFeatureState & MyFeatureActions>((set, get) => ({
  // initial state
  // action implementations
}))
```

Stores should not import from other stores directly. If cross-store coordination is needed, call both stores from the component layer.

### Adding a Preference

1. Add the key and default value to the `DEFAULTS` object in the preferences module.
2. Add the TypeScript type to the `Preferences` interface.
3. Add the UI control in the appropriate Settings tab (`GeneralSettingsTab.tsx` or `EditorSettingsTab.tsx`).
4. Add the key to `createMockPreferences()` in `testUtils.ts`.
5. Use the `SettingsSection` wrapper and toggle pill (`w-10 h-5 rounded-full`) styling for consistency.

### Adding a Keyboard Shortcut

1. Add the handler in `KeyboardShortcutHandler.tsx` inside the `keydown` listener.
2. If the shortcut should also appear in the native Tauri menu, add it to the menu definition in `src-tauri/src/main.rs`.
3. Add it to the keyboard shortcuts table in the Settings help dialog.
4. Add it to the Keyboard Shortcuts Reference in this documentation.

> Caution: The `⌘⇧N` slot is used by the native menu for "New Project." Do not register conflicting shortcuts without checking both the JS handler and `src-tauri/src/lib.rs`.

### Code Style Conventions

- **Conventional commits:** `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- **Settings UI:** Always use `SettingsSection` wrapper; always use the standard toggle pill classes
- **Toast notifications:** Use `showGlobalToast(msg, 'success'|'error'|'info')` for global toasts; use `useToast().showToast()` within components
- **Props flow:** Pass props down through `App.tsx → EditorOrchestrator → HybridEditor → children`; do not skip levels
- **Store access:** Access stores via hooks in components; do not call store methods from other stores

### Implementation Stats (v1.19 Pomodoro Release)

| Metric | Before | After |
|--------|--------|-------|
| Total tests | 2190 | 2252 |
| New tests | — | 62 (35 store + 27 component) |
| Test files | — | 73 |
| New production files | — | 4 |
| Modified production files | — | 9 |
| Lines of production code added | — | 209 |

---

## Appendix A — Glossary

| Term | Definition |
|------|-----------|
| **Wiki link** | A `[[note name]]` reference that Scribe auto-resolves to a note and indexes as a bidirectional link |
| **Backlink** | A link pointing *to* the current note from another note |
| **Pinned vault** | A project pinned to the sidebar icon bar for quick access (max 5) |
| **Smart icon** | A sidebar icon slot pre-assigned to one of the four typed project archetypes |
| **Phase** | The current Pomodoro timer state: `idle`, `work`, `short-break`, or `long-break` |
| **FTS** | Full-text search — the SQLite `fts5` extension (Tauri) or a JS implementation (browser) |
| **PTY** | Pseudo-terminal — the OS interface used by the embedded xterm.js terminal |
| **IPC** | Inter-process communication — the message channel between the Tauri Rust backend and the React WebView frontend |
| **BibTeX** | A reference management file format (`.bib`) used for academic citations |

## Appendix B — Changelog Highlights

| Version | Notable Changes |
|---------|----------------|
| v1.19 | Pomodoro Timer (status bar, state machine, configurable, auto-save); new projects auto-pinned to sidebar |
| v1.16 | Icon-centric sidebar redesign; pinned vaults; smart icons |
| Earlier | Knowledge graph (D3), AI integration (Claude + Gemini), terminal (xterm.js), academic citations (BibTeX) |

---

*This document is the authoritative technical reference for Scribe. For questions not covered here, see the source code in `/Users/dt/.git-worktrees/scribe/pomodoro/src/renderer/src/`.*
