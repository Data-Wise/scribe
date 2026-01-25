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

| Layer | Technology |
|-------|------------|
| Shell | **Tauri 2** (Rust backend) |
| UI | React 18 |
| Editor | HybridEditor (CodeMirror 6 + ReactMarkdown) |
| Styling | Tailwind CSS |
| State | Zustand |
| Database | SQLite (Tauri) / **IndexedDB** (Browser) |
| AI | Claude/Gemini CLI only (NO API) |
| Citations | Pandoc citeproc |
| Math | KaTeX |

### Dual Runtime Support

Scribe runs in two modes with a unified API:

| Mode | Database | Launch | Use Case |
|------|----------|--------|----------|
| **Tauri** | SQLite (Rust) | `npm run dev` | Full features, desktop app |
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
│       │   ├── Settings/          # Modular settings components [NEW]
│       │   │   ├── GeneralSettingsTab.tsx
│       │   │   ├── EditorSettingsTab.tsx
│       │   │   └── SettingsSection.tsx
│       │   ├── EditorOrchestrator.tsx # Editor rendering logic [NEW]
│       │   ├── KeyboardShortcutHandler.tsx # Global shortcuts [NEW]
│       │   ├── Editor/            # BlockNote editor
│       │   └── ...
│       ├── lib/                   # Core utilities
│       │   ├── api.ts             # API factory (Tauri/Browser)
│       │   ├── platform.ts        # Runtime detection (isTauri/isBrowser)
│       │   ├── browser-api.ts     # IndexedDB API (46 operations)
│       │   ├── browser-db.ts      # Dexie.js schema + seed data
│       │   └── browser-dialogs.ts # Browser dialog fallbacks
│       ├── store/                 # Zustand state
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

## 🎯 Current Status: v1.16.1 - Technical Debt Remediation Phase 1 Complete ✅

**Released:** v1.14.0 (stable, via Homebrew)
**Dev Branch:** v1.16.1 (Phase 1 Refactoring - ready to merge)
**Install Stable:** `brew install --cask data-wise/tap/scribe` (v1.14.0)
**Tests:** 2,162 passing (98.5%)

### Latest Work: Phase 1 Technical Debt Remediation (2026-01-23)

**Phase 1.1: SettingsModal Refactoring**
- ✅ Extracted `GeneralSettingsTab`, `EditorSettingsTab`, `SettingsSection`
- ✅ Reduced `SettingsModal.tsx` by **26%** (614 lines)
- ✅ Added 13 new unit tests

**Phase 1.2: App.tsx Refactoring**
- ✅ Extracted `KeyboardShortcutHandler` (25+ shortcuts, Tauri menus)
- ✅ Extracted `EditorOrchestrator` (Focus/Normal mode rendering)
- ✅ Reduced `App.tsx` by **13%** (267 lines)
- ✅ Added 19 new unit tests

**Overall Metrics:**
- **-881 lines** from monolithic controllers
- **+4 new components** (well-organized, tested)
- **+32 new tests** (2,161/2,195 passing, 98.5%)
- **0 breaking changes**

---

### Previous: Icon-Centric Sidebar Expansion (v1.16.0)

**Sidebar Architecture Refactor - Complete ✅**

Transitioned from global `sidebarMode` to per-icon expansion where each icon (Inbox, Smart Folders, Pinned Projects) independently expands with its own preferred view mode (compact or card).

**Key Changes:**
- ✅ **Icon-Centric Expansion** - Icon bar always visible (48px), icons control expansion
- ✅ **Per-Icon Mode Preferences** - Each icon remembers compact/card preference
- ✅ **Accordion Pattern** - Only one icon expanded at a time
- ✅ **Global Width Management** - Shared compact/card widths across all icons
- ✅ **Removed Shortcuts** - Deleted ⌘B (toggle sidebar) shortcut, no global mode state
- ✅ **Smooth Animations** - 200ms cubic-bezier transitions, slide-in panels, expanded indicators

**Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│ Icon-Centric Mode (v1.16.0)                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────┐  ┌──────────────────────────────────────────┐     │
│  │  I  │  │ Expanded Icon Panel                       │     │
│  │  N  │  │ ┌──────────────────────────────────────┐ │     │
│  │  B  │  │ │ Panel Header (Title + Mode Toggle)   │ │     │
│  │  O  │  │ └──────────────────────────────────────┘ │     │
│  │  X  │  │                                           │     │
│  └─────┘  │ ┌──────────────────────────────────────┐ │     │
│           │ │                                       │ │     │
│  ┌─────┐  │ │   CompactListView                    │ │     │
│  │  R  │  │ │      OR                               │ │     │
│  │  E  │  │ │   CardGridView                        │ │     │
│  │  S  │  │ │                                       │ │     │
│  └─────┘  │ │   (mode determined by icon's         │ │     │
│           │ │    preferredMode setting)             │ │     │
│  ┌─────┐  │ │                                       │ │     │
│  │ ... │  │ └──────────────────────────────────────┘ │     │
│  └─────┘  └──────────────────────────────────────────┘     │
│           Icon Bar (48px)    Expanded Panel (conditional)   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Component Hierarchy:**

```
MissionSidebar.tsx (icon-centric-mode)
├── IconBar.tsx (48px fixed width, always visible)
│   ├── InboxButton
│   ├── SmartIconButton (Research, Teaching, R Package, R Dev, Generic)
│   ├── VaultIconButton (Pinned Projects)
│   ├── Spacer
│   └── ActivityBar
│
└── ExpandedIconPanel.tsx (conditional, width = sidebarWidth - 48)
    ├── PanelHeader
    │   ├── Icon Label
    │   ├── Mode Toggle Button (compact ⇄ card)
    │   └── Close Button
    │
    └── Content (based on expandedIcon type + mode)
        ├── CompactListView.tsx (if mode === 'compact')
        │   ├── ProjectList (for smart icons)
        │   └── NoteList (for vault icons)
        │
        └── CardGridView.tsx (if mode === 'card')
            ├── ProjectCards (for smart icons)
            └── NoteCards (for vault icons)
```

**State Management (useAppViewStore.ts):**

```typescript
// Removed (v1.15.0 - Global Mode System)
sidebarMode: 'icon' | 'compact' | 'card'  // ❌ REMOVED
lastExpandedMode: 'compact' | 'card' | null  // ❌ REMOVED
lastModeChangeTimestamp: number  // ❌ REMOVED
setSidebarMode(mode)  // ❌ REMOVED
cycleSidebarMode()  // ❌ REMOVED
toggleSidebarCollapsed()  // ❌ REMOVED

// Added (v1.16.0 - Icon-Centric System)
expandedIcon: ExpandedIconType | null  // ✅ Which icon is expanded
  where ExpandedIconType = { type: 'vault', id: string } | { type: 'smart', id: SmartIconId }

// Per-icon mode preferences stored in icon objects:
PinnedVault.preferredMode: 'compact' | 'card'  // ✅ Each vault remembers mode
SmartIcon.preferredMode: 'compact' | 'card'    // ✅ Each smart icon remembers mode

// New Actions:
expandVault(vaultId: string)  // ✅ Expand vault icon, set width from preferredMode
expandSmartIcon(iconId: SmartIconId)  // ✅ Expand smart icon, set width
collapseAll()  // ✅ Collapse to icon-only mode (48px width)
toggleIcon(type: 'vault'|'smart', id: string)  // ✅ Accordion toggle
setIconMode(type, id, mode: 'compact'|'card')  // ✅ Set icon's preferred mode

// Global Width Settings (shared across all icons):
compactModeWidth: number  // Default 240px - applied when icon uses compact mode
cardModeWidth: number     // Default 320px - applied when icon uses card mode
```

**Accordion Pattern Implementation:**

```typescript
toggleIcon: (type, id) => {
  const { expandedIcon, expandVault, expandSmartIcon, collapseAll } = get()

  // If clicking already expanded icon, collapse it
  if (expandedIcon?.type === type && expandedIcon?.id === id) {
    collapseAll()
    return
  }

  // Otherwise expand this icon (auto-collapses others)
  if (type === 'vault') {
    expandVault(id)
  } else {
    expandSmartIcon(id as SmartIconId)
  }
}
```

**CSS Structure (index.css):**

```css
/* Icon-Centric Mode Container */
.mission-sidebar.icon-centric-mode {
  display: flex;
  flex-direction: row;
  transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Icon Bar (Always Visible) */
.icon-bar {
  width: 48px;
  flex-shrink: 0;
  background: var(--nexus-bg-primary);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

/* Expanded Icon Panel (Conditional) */
.expanded-icon-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--nexus-bg-secondary);
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  animation: slideInFromLeft 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Expanded Icon Indicator (3px accent bar) */
.icon-btn.expanded::before,
.smart-icon-btn.expanded::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--nexus-accent);
  border-radius: 0 2px 2px 0;
  animation: indicatorFadeIn 150ms ease;
}

@keyframes indicatorFadeIn {
  from {
    opacity: 0;
    width: 0;
  }
  to {
    opacity: 1;
    width: 3px;
  }
}
```

**Implementation Phases:**
- Phase 1: ✅ State refactor (types, store migration)
- Phase 2: ✅ Component cleanup (removed 5,724 lines deprecated code)
- Phase 3: ✅ Remove deprecated shortcuts (⌘B)
- Phase 4: ✅ Test updates (64 tests passing)
- Phase 5: ✅ CSS transitions + documentation

**Testing:**
- ✅ 64 icon-centric tests passing (25 core + 23 edge cases + 16 E2E)
- ✅ 100% Phase 1/2 state management coverage
- ✅ TypeScript: 0 errors
- ✅ All production code compiles cleanly

**Migration:**
- Automatic v1.15.0 → v1.16.0 localStorage migration
- Old keys cleaned: `sidebarMode`, `lastExpandedMode`, `lastModeChangeTimestamp`
- Preserves user's last expanded smart icon as `expandedIcon`
- Defaults all icons to compact mode on first launch

**Keyboard Shortcuts Removed:**
- ⌘B - Toggle Left Sidebar (no longer needed, click icons instead)
- ⌘0 - Collapse Sidebar (no longer needed, click expanded icon to collapse)

---

### Previous Releases

**Sprint 30 Phase 2: WikiLink Navigation (v1.14.0)**
- ✅ Single-click WikiLink Navigation - Click to navigate in Live/Reading modes
- ✅ Cmd+Click in Source Mode - Navigate WikiLinks with ⌘+Click
- ✅ Mode Preservation - Backlinks panel preserves editor mode
- ✅ 1984 tests passing (30 WikiLink E2E tests)
- Release: <https://github.com/Data-Wise/scribe/releases/tag/v1.14.0>

**Sprint 28: Live Editor Enhancements (v1.10.0)**

- ✅ CodeMirror 6 Live Preview - Obsidian-style syntax hiding
- ✅ KaTeX Math Rendering - Inline `$...$` and display `$$...$$`
- ✅ Three Editor Modes - Source (⌘1), Live (⌘2), Reading (⌘3), cycle with ⌘E

**Sprint 27: Backend Foundation + Settings (v1.7.0 → v1.9.0)**

**v1.9.0 Features (2025-12-31):**
- ✅ Settings Enhancement - ⌘, fuzzy search, theme gallery, project templates
- ✅ Quick Actions Customization - Drag-to-reorder, edit prompts, shortcuts
- ✅ 1033 tests passing (930 unit + 103 E2E)

**v1.7.0 Features (2025-12-31):**
- ✅ Chat History Persistence - Migration 009, auto-save/load per note
- ✅ Quick Actions - 5 one-click AI prompts (Improve, Expand, Summarize, Explain, Research)
- ✅ @ References - Autocomplete note inclusion
- ✅ 911 tests passing (829 unit + 82 E2E)

**Sprint 26 Features (2025-12-30):**
- ✅ Terminal PTY shell (portable-pty + xterm.js)
- ✅ Mission Control sidebar (Icon/Compact/Card modes)
- ✅ Browser mode with IndexedDB persistence

---

## ✅ Feature Tiers

### Tier 1-3: Build Now (v1.0)

- BlockNote editor
- Focus mode
- Global hotkey
- Claude/Gemini CLI
- Zotero citations
- LaTeX/PDF/Word export
- Quarto render

### Tier 4: Build Now (v1.0)

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

**Key files:**
- `platform.ts` - `isTauri()`, `isBrowser()` detection
- `browser-db.ts` - Dexie.js schema, `seedDemoData()`
- `browser-api.ts` - Full 46-operation API for browser
- `browser-dialogs.ts` - `confirm()`, `alert()` fallbacks

### AI Integration (CLI Only)

```typescript
// Uses installed CLI tools, no API keys
async function askClaude(prompt: string, context: string): Promise<string> {
  const result = await execAsync(
    `echo "${escape(context)}" | claude --print "${escape(prompt)}"`
  );
  return result.stdout;
}
```

### Daily Notes

- Shortcut: ⌘D
- Auto-create with template
- Per-project configuration

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

| File | Purpose |
|------|---------|
| PROJECT-DEFINITION.md | Complete scope control |
| README.md | User-facing overview |
| .STATUS | Progress tracking |
| CHANGELOG.md | Version history |
| cli/scribe.zsh | Terminal CLI implementation |
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
