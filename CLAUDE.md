# CLAUDE.md

> **AI Assistant Guidance for Scribe**

---

## 🎯 Project Identity

**Scribe** = ADHD-friendly distraction-free writer + projects + academic features + CLI-based AI

**NOT** an IDE. **NOT** an Obsidian replacement. A focused writing companion.

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

# Create feature branch with worktree
git worktree add ~/.git-worktrees/scribe/feat-name -b feat/feature-name dev

# Work in the worktree directory
cd ~/.git-worktrees/scribe/feat-name

# When done, create PR to dev
gh pr create --base dev --head feat/feature-name

# After PR merged, clean up worktree
git worktree remove ~/.git-worktrees/scribe/feat-name
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
| Editor | BlockNote |
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

## 🎯 Current Status: v1.7.0 Released ✅

**Branch:** `main` (v1.7.0 tagged and released)
**Release:** https://github.com/Data-Wise/scribe/releases/tag/v1.7.0
**Documentation:** https://data-wise.github.io/scribe

**Sprint 27 P1: Backend Foundation - Complete (2025-12-31)**
- ✅ Chat History Persistence (Migration 009)
  - `chat_sessions` and `chat_messages` tables with CASCADE
  - Auto-save/load conversations per note
  - Session switching on note navigation
- ✅ Quick Actions (5 one-click AI prompts)
  - ✨ Improve, 📝 Expand, 📋 Summarize, 💡 Explain, 🔍 Research
  - Auto-includes full note context
- ✅ @ References (autocomplete note inclusion)
- ✅ Comprehensive Testing (911 tests total)
  - 829 unit tests (Vitest)
  - 82 E2E tests (Playwright)
  - Full test coverage for new features
- ✅ Complete Documentation
  - Chat persistence guide (523 lines)
  - Quick Actions reference card (390 lines)
  - 7 comprehensive tutorials (3,256 lines)
  - Tutorial index with learning paths
- ✅ CI/CD Fixed
  - Release workflow bug fix (rust-toolchain)
  - Automated site deployment working
  - Automated builds for future releases

**Sprint 26 - Complete (2025-12-30)**
- ✅ Terminal PTY shell (portable-pty + xterm.js)
- ✅ Smart terminal working directory (project type inference)
- ✅ Mission Control sidebar with Icon/Compact/Card modes
- ✅ Browser mode with full IndexedDB persistence

**Next: Sprint 27 P2 - Frontend Polish**
- [ ] Browser mode indicator in UI
- [ ] Wiki link backlink tracking in browser
- [ ] Quick Actions customization UI
- [ ] Chat session management UI

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
