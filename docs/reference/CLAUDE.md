# CLAUDE.md

> **AI Assistant Guidance for Scribe**

---

## 🎯 Project Identity

**Scribe** = ADHD-friendly distraction-free writer + projects + academic features + CLI-based AI

**NOT** an IDE. **NOT** an Obsidian replacement. A focused writing companion.

**Location**: `~/projects/dev-tools/scribe/`

---

## ⚠️ Critical: Read First

Before making ANY changes, read:

- **PROJECT-DEFINITION.md** — Complete scope control, feature tiers, anti-drift rules

---

## 🔀 Git Workflow (Protected Main + Worktrees)

**Main branch is protected.** Always work from `dev` or feature branches.

```
main (protected) ← PR from dev only
  └── dev ← PR from feat/* only
       └── feat/* ← worktrees for parallel work
```

### Rules

1. **Never commit directly to main** — PR from dev only
2. **Never commit directly to dev for features** — PR from feat/* branches
3. **Feature branches use git worktree** — Parallel development
4. **PR flow**: feat/* → dev → main
5. **Tag releases on main** after PR merge

### Worktree Commands

```bash
# Worktree location: ~/.git-worktrees/scribe/

# Create feature branch with worktree (descriptive name)
git worktree add ~/.git-worktrees/scribe/feature-name -b feat/feature-name dev

# Example: Settings Enhancement
git worktree add ~/.git-worktrees/scribe/settings -b feat/settings-enhancement dev

# Work in the worktree directory
cd ~/.git-worktrees/scribe/settings

# Commit work as you go
git add -A && git commit -m "feat: description"

# When phase/feature complete, merge to dev
git checkout dev
git merge feat/settings-enhancement --no-ff -m "Merge feat/settings-enhancement: Phase 1"
git push origin dev

# Continue in same worktree for next phase (optional)
cd ~/.git-worktrees/scribe/settings
# OR clean up worktree if done
git worktree remove ~/.git-worktrees/scribe/settings
```

**Naming Convention:**
- **Worktree directory:** Descriptive feature name (e.g., `settings`, `terminal`, `ai-chat`)
- **Git branch:** Prefixed with `feat/` (e.g., `feat/settings-enhancement`)

**Example: Settings Enhancement Workflow**

```bash
# Phase 1: Create worktree
git worktree add ~/.git-worktrees/scribe/settings -b feat/settings-enhancement dev
cd ~/.git-worktrees/scribe/settings

# Phase 1: Implement foundation
# ... work, commit, work, commit ...
git commit -m "feat: Settings Enhancement Phase 1 - Foundation"

# Phase 1: Merge to dev
git checkout dev
git merge feat/settings-enhancement --no-ff
git push origin dev

# Phase 2: Continue in same worktree
cd ~/.git-worktrees/scribe/settings
# Branch still exists, worktree still active
# ... continue Phase 2 work ...
```

### PR Flow

```bash
# Feature complete → PR to dev
gh pr create --base dev --head feat/feature-name
# Review & merge in GitHub

# Ready for release → PR to main
git checkout dev && git pull
gh pr create --base main --head dev
# Review & merge in GitHub

# Tag release on main
git checkout main && git pull
git tag -a v1.x.x -m "Release notes"
git push origin v1.x.x
```

---

## 🧠 ADHD Principles (Override All Decisions)

1. **Zero Friction** — < 3 seconds to start writing
2. **One Thing at a Time** — Single note, no tabs
3. **Escape Hatches** — ⌘W closes, auto-saves
4. **Visible Progress** — Word count, timer
5. **Sensory-Friendly** — Dark mode, no animations
6. **Quick Wins** — Milestone celebrations

---

## 📐 Technical Stack (Locked)

| Layer     | Technology                                  |
| --------- | ------------------------------------------- |
| Shell     | **Tauri 2** (Rust backend)                  |
| UI        | React 18                                    |
| Editor    | CodeMirror 6                                |
| Styling   | Tailwind CSS                                |
| State     | Zustand                                     |
| Database  | SQLite (Tauri) / **IndexedDB** (Browser)    |
| AI        | Claude/Gemini CLI only (NO API)             |
| Citations | Pandoc citeproc                             |
| Math      | KaTeX                                       |

### Dual Runtime Support

Scribe runs in two modes with a unified API:

| Mode        | Database             | Launch             | Use Case                    |
| ----------- | -------------------- | ------------------ | --------------------------- |
| **Tauri**   | SQLite (Rust)        | `npm run dev`      | Full features, desktop app  |
| **Browser** | IndexedDB (Dexie.js) | `npm run dev:vite` | Testing, demos, development |

The API factory (`src/renderer/src/lib/api.ts`) auto-switches based on runtime detection.

---

## 📁 Project Structure

```
scribe/
├── cli/                           # Terminal CLI (ZSH)
│   └── scribe.zsh                 # Main CLI (daily, capture, search, browser)
├── src-tauri/                     # Tauri Rust backend
│   └── src/
│       ├── database/              # SQLite operations
│       ├── ai/                    # Claude/Gemini CLI wrappers
│       └── ...
├── src/
│   └── renderer/src/              # React frontend
│       ├── components/
│       │   ├── MissionControl/    # Mission Control HUD sidebar
│       │   ├── Settings/          # Modular settings components
│       │   │   ├── GeneralSettingsTab.tsx
│       │   │   ├── EditorSettingsTab.tsx
│       │   │   ├── SettingsToggle.tsx    # Reusable toggle (role=switch)
│       │   │   └── SettingsSection.tsx
│       │   ├── PomodoroTimer.tsx       # Focus timer in status bar
│       │   ├── EditorOrchestrator.tsx # Editor rendering logic
│       │   ├── KeyboardShortcutHandler.tsx # Global shortcuts
│       │   ├── CodeMirrorEditor.tsx  # CodeMirror 6 editor
│       │   └── ...
│       ├── hooks/                 # React hooks
│       │   ├── usePreferences.ts  # Cached prefs + event sync
│       │   ├── useResponsiveLayout.ts # Auto-collapse sidebars on resize
│       │   └── useGlobalZoom.ts   # ⌘+/⌘- zoom (0.5–2.0)
│       ├── lib/                   # Core utilities
│       │   ├── api.ts             # API factory (Tauri/Browser)
│       │   ├── shortcuts.ts       # 27-shortcut registry
│       │   ├── platform.ts        # Runtime detection (isTauri/isBrowser)
│       │   ├── browser-api.ts     # IndexedDB API (46 operations)
│       │   ├── browser-db.ts      # Dexie.js schema + seed data
│       │   └── browser-dialogs.ts # Browser dialog fallbacks
│       ├── store/                 # Zustand state
│       │   ├── useAppViewStore.ts # Sidebar + UI state
│       │   └── usePomodoroStore.ts # Pomodoro timer state
│       └── types/                 # TypeScript types
```

---

## 🚀 Commands

### App Development

```bash
npm run dev          # Tauri development (full features)
npm run dev:vite     # Browser-only development (IndexedDB)
npm run build        # Production build
npm run test         # Run tests
npm run typecheck    # TypeScript check
```

### Claude Code Desktop Preview

Scribe supports **in-app preview** inside Claude Code Desktop (Feb 2026+). Claude starts the Vite dev server and renders the running app in an embedded browser — auto-verifying changes by screenshotting, inspecting DOM, and clicking elements.

**Config:** `.claude/launch.json` (already set up)

```json
{
  "name": "scribe-dev",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "dev:vite"],
  "port": 5173
}
```

**Key details:**
- Uses `dev:vite` (not `dev`) — runs Vite only, no Tauri compilation needed
- App auto-detects browser mode via `platform.ts` → uses IndexedDB/Dexie for storage
- Port 5173 matches Vite's default
- No worktree needed — launch.json is config, not feature code
- When opening in Claude Code Desktop, **uncheck worktree isolation** to work on `dev` directly

### Terminal CLI

```bash
# Install CLI
./cli/install.sh

# Quick commands
scribe daily           # Open today's daily note
scribe capture "idea"  # Quick capture to inbox
scribe search "query"  # Full-text search
scribe list            # List recent notes
scribe browser         # Launch in Chrome (browser mode)
scribe help --all      # Full reference
```

**Aliases:** `sd` (daily), `sc` (capture), `ss` (search), `sl` (list)

---

## 🎯 Current Status: v1.22.0 - Responsive UI Enhancements ✅

**Released:** v1.22.0 (stable)
**Install:** `brew install --cask data-wise/tap/scribe`
**Tests:** 2,326 passing (81 files)

### Latest Work: Responsive UI (feature/responsive-ui)

- ✅ Minimum window size (350×350) via `tauri.conf.json`
- ✅ Window position memory via `tauri-plugin-window-state`
- ✅ `useResponsiveLayout` hook — auto-collapse sidebars on resize (right first, then left, 500px editor minimum)
- ✅ `useGlobalZoom` hook — ⌘+/⌘- zoom (0.5–2.0), persists to `scribe:zoomLevel` localStorage
- ✅ Right sidebar `ResizeHandle` with drag + touch support (250–600px range)
- ✅ `.resizing` CSS class during drag (disables transitions)
- ✅ Reduced-motion audit (zoom indicator + right sidebar transitions)
- ✅ 42 new tests (2,326 total)

### Latest Work: Session Timer Removal (PR #48)

- ✅ Removed legacy session timer from breadcrumb bar (⏸/▶/↺ controls)
- ✅ Removed `sessionStartTime` prop chain from 5 components
- ✅ StatsPanel Duration card → Pomodoro count from `usePomodoroStore`
- ✅ Cleaned 4 localStorage keys and ~50 lines orphaned CSS
- ✅ Net: -95 lines, 2 session-duration tests removed (2,280 total)

### Previous: Settings Infrastructure Improvements (PR #47)

- ✅ `SettingsToggle` reusable component with accessibility (`role="switch"`, `aria-checked`, `aria-label`)
- ✅ `usePreferences` hook — cached preferences with event-based cross-component sync
- ✅ `SHORTCUTS` registry (25 shortcuts) with `matchesShortcut()` helper
- ✅ Migrated `SettingsModal.tsx` to `usePreferences` hook
- ✅ 27 new tests (2,282 total)

### Previous: Pomodoro Focus Timer (PR #45)

- ✅ Status bar countdown timer (start/pause click, right-click reset)
- ✅ Zustand store with symmetric callbacks: `tick(onComplete, onBreakComplete)`
- ✅ Auto-save on work completion, gentle break toasts
- ✅ Focus Timer settings in General tab (5 new preferences)
- ✅ Auto-pin new projects to sidebar
- ✅ 62 new tests (2,282 total)

### Previous: Sidebar Vault Expansion Fix (PR #43)

- ✅ Vault dots filter to correct single project (not all projects)
- ✅ Breadcrumb syncs via `onSelectProject` on vault toggle
- ✅ Fixed DexieError2 race condition in browser-mode init
- ✅ 3 new vault toggle wiring tests

### Previous: Quarto Autocomplete Stabilization (PR #40)

- ✅ Context-aware LaTeX completions (math-only scoping, suppressed in code blocks)
- ✅ Code chunk completions (R, Python, Julia, OJS, Mermaid, Graphviz)
- ✅ YAML frontmatter + chunk option + cross-reference completions
- ✅ Fixed 70 TypeScript errors across 22 test files
- ✅ Escaped `\$` handling for academic documents

### Previous: Tech Debt + Quarto Stabilization (v1.16.2)

Extracted `KeyboardShortcutHandler`, `EditorOrchestrator`, `GeneralSettingsTab`, `EditorSettingsTab` from monolithic App.tsx/SettingsModal.tsx (-881 lines, +4 components, +32 tests). Context-aware LaTeX completions (math-only scoping, suppressed in code blocks).

---

### Previous: Icon-Centric Sidebar (v1.16.0)

Per-icon expansion with accordion pattern. `IconBar.tsx` (48px) + `ExpandedIconPanel.tsx` with compact/card modes per icon. State in `useAppViewStore.ts`: `expandedIcon`, `toggleIcon()`, per-icon `preferredMode`. Removed global `sidebarMode` and ⌘B shortcut. 64 tests, auto-migration from v1.15.0 localStorage keys.

---

### Previous Releases

| Version | Highlight |
|---------|-----------|
| v1.18.0 | Sidebar vault expansion fix + DexieError2 race condition |
| v1.16.x | Icon-centric sidebar, tech debt remediation, Quarto autocomplete |
| v1.14.0 | WikiLink single-click navigation |
| v1.10.0 | CodeMirror 6 Live Preview, KaTeX math, three editor modes |
| v1.9.0 | Settings enhancement (⌘, fuzzy search, theme gallery) |
| v1.7.0 | Quick Actions, chat history, @ references |

See [CHANGELOG](CHANGELOG.md) for full details.

---

## ✅ Feature Tiers

### Tier 1-3: Core (Shipped)

- CodeMirror 6 editor (Source / Live Preview / Reading)
- Focus mode
- Global hotkey
- Claude/Gemini CLI
- Pomodoro focus timer (v1.19.0)
- Zotero citations
- LaTeX/PDF/Word export
- Quarto render

### Tier 4: Core (Shipped)

- Project system (5 types)
- Daily notes
- Backlinks

### Deferred to v2

- Graph view enhancements
- Multi-tab editing

### Never Build

- API-based AI
- Plugin system
- Mobile app

---

## 🚫 Scope Creep Prevention

### Before Adding Anything

1. **Does it help ADHD focus?** → If no, reject
2. **Is it in Tiers 1-4?** → If no, defer
3. **Does it need API keys?** → If yes, reject
4. **Does it add UI clutter?** → If yes, reconsider

### Red Flags (Stop)

- "We could also add..."
- "While we're at it..."
- "Other apps have..."

### Green Flags (Proceed)

- "This reduces friction"
- "This helps focus"
- "This removes a step"

---

## 🔧 Key Implementation Details

### Browser Mode Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Components                         │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      api.ts (Factory)                        │
│   export const api = isTauri() ? tauriApi : browserApi      │
└─────────────────────────────┬───────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│     Tauri invoke()      │     │   browser-api.ts        │
│     (46 operations)     │     │   (IndexedDB/Dexie)     │
└─────────────────────────┘     └─────────────────────────┘
```

Key files: `platform.ts` (runtime detection), `browser-db.ts` (Dexie schema), `browser-api.ts` (46 operations), `browser-dialogs.ts` (fallbacks).

### Tauri API Serialization (Critical Pattern)

**Problem:** TypeScript objects don't match Rust types across the Tauri bridge.

**Solution:** Bidirectional serialization in `api.ts`:

```typescript
// Frontend → Rust: Serialize objects to JSON strings
function prepareNoteForTauri(note: Partial<Note>): Record<string, unknown> {
  const prepared = { ...note }
  if (note.properties && typeof note.properties === 'object') {
    prepared.properties = JSON.stringify(note.properties)
  }
  return prepared
}

// Rust → Frontend: Parse JSON strings back to objects
function parseNoteFromTauri(note: Note | null): Note | null {
  if (note?.properties && typeof note.properties === 'string') {
    note.properties = JSON.parse(note.properties)
  }
  return note
}
```

**Apply to:** All Note-returning Tauri commands (`createNote`, `updateNote`, `getNote`, `listNotes`, `searchNotes`, `getOrCreateDailyNote`, etc.)

### Tab-Based Editor Pattern

**To display a note in the editor, BOTH calls are required:**

```typescript
openNoteTab(noteId, title)  // Creates/activates tab in editor
selectNote(noteId)          // Sets note as selected in state
```

- `selectNote()` alone → Note selected but not visible
- `openNoteTab()` alone → Tab opens but state out of sync

### Error Toast Pattern

Error toasts persist until dismissed (defined in `Toast.tsx`):

```typescript
const persistent = type === 'error'  // Errors stay until dismissed
```

Features:
- Copy button for error message
- OK button to dismiss
- Monospace font for technical errors

---

## 📋 Approval Required For

1. New npm packages
2. New features not in Tiers 1-4
3. Any API integrations (rejected by default)
4. New UI panels
5. Database schema changes

---

## 🔗 Related Files

| File                                      | Purpose                           |
| ----------------------------------------- | --------------------------------- |
| PROJECT-DEFINITION.md                     | Complete scope control            |
| README.md                                 | User-facing overview              |
| .STATUS                                   | Progress tracking                 |
| CHANGELOG.md                              | Version history                   |
| cli/scribe.zsh                            | Terminal CLI implementation       |
| BRAINSTORM-browser-fallback-2025-12-28.md | Browser mode implementation notes |

---

## 🌐 Browser Mode Features

**Working in browser:**
- ✅ Project CRUD (create, read, update, delete)
- ✅ Note CRUD with full-text search
- ✅ Tags and tag filtering
- ✅ Backlinks panel (incoming/outgoing)
- ✅ Command palette (⌘K)
- ✅ Properties panel
- ✅ Persistence across refresh

**Tauri-only (stubbed in browser):**
- AI operations (Claude/Gemini CLI)
- Obsidian sync
- Font management (Homebrew)
- Citation/Zotero integration
- Pandoc document export
