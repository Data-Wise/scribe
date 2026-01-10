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

## 🎯 Current Status: v1.16.0 In Development 🚧

**Version:** 1.16.0 (Icon-Centric Sidebar Expansion)
**Branch:** `feat/icon-expansion` (in development)
**Target:** v1.16.0 release
**Install:** `brew install --cask data-wise/tap/scribe` (v1.14.0 stable)

### Latest Work: Icon-Centric Sidebar Expansion (v1.16.0)

**Sidebar Architecture Refactor - Complete ✅**

Transition from global `sidebarMode` to per-icon expansion where each icon (Inbox, Smart Folders, Pinned Projects) independently expands with its own preferred view mode (compact or card).

**Key Changes:**
- ✅ **Icon-Centric Expansion** - Icon bar always visible (48px), icons control expansion
- ✅ **Per-Icon Mode Preferences** - Each icon remembers compact/card preference
- ✅ **Accordion Pattern** - Only one icon expanded at a time
- ✅ **Global Width Management** - Shared compact/card widths across all icons
- ✅ **No More Mode Cycling** - Removed ⌘0 shortcut, no global mode state

**Architecture:**
```
┌────────────────────────────────────────┐
│ IconBar (48px) │ ExpandedIconPanel     │
│ - Always visible │ - Conditional         │
│ - Inbox          │ - CompactListView    │
│ - Smart Icons    │   OR                 │
│ - Pinned Vaults  │ - CardGridView       │
└────────────────────────────────────────┘
```

**State Changes:**
- `sidebarMode` → `expandedIcon: { type: 'vault'|'smart', id: string } | null`
- `lastExpandedMode` → Per-icon `preferredMode: 'compact' | 'card'`
- New: `expandVault()`, `expandSmartIcon()`, `collapseAll()`, `toggleIcon()`, `setIconMode()`
- Removed: `cycleSidebarMode()`, `setSidebarMode()`, `toggleSidebarCollapsed()`

**Implementation:**
- Phase 1: ✅ State refactor (types, store migration)
- Phase 2A-D: ✅ Component extraction and refactor
- Phase 3: ✅ Remove deprecated shortcuts
- Phase 4: ✅ Test updates (2234 passing)
- Phase 5: 🚧 Polish & documentation (in progress)

**Testing:**
- ✅ 2234 tests passing
- ✅ 25 new icon-centric expansion unit tests
- ✅ TypeScript: 0 errors
- ✅ All production code compiles cleanly

**Migration:**
- Automatic v1.15.0 → v1.16.0 localStorage migration
- Old `sidebarMode`, `lastExpandedMode` keys cleaned up
- Preserves user's last expanded smart icon

---

### Previous Releases

**Sprint 30 Phase 2: WikiLink Navigation (v1.14.0)**
- ✅ Single-click WikiLink Navigation - Click to navigate in Live/Reading modes
- ✅ Cmd+Click in Source Mode - Navigate WikiLinks with ⌘+Click
- ✅ Mode Preservation - Backlinks panel preserves editor mode
- ✅ 1984 tests passing (30 WikiLink E2E tests)
- Release: https://github.com/Data-Wise/scribe/releases/tag/v1.14.0

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
