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
| Editors | **Milkdown** (markdown/Quarto) + **Monaco** (LaTeX/R/code) |
| Styling | Tailwind CSS |
| State | Zustand (with persist) |
| Database | SQLite (Tauri) / **IndexedDB** (Browser) |
| AI | Claude/Gemini CLI only (NO API) |
| Citations | Pandoc citeproc |
| Math | KaTeX |
| LaTeX | pdflatex/xelatex (via Tauri) |
| R | Rscript (via Tauri) |

### Dual Runtime Support

Scribe runs in two modes with a unified API:

| Mode | Database | Launch | Use Case |
|------|----------|--------|----------|
| **Tauri** | SQLite (Rust) | `npm run dev` | Full features, desktop app |
| **Browser** | IndexedDB (Dexie.js) | `npm run dev:vite` | Testing, demos, development |

The API factory (`src/renderer/src/lib/api.ts`) auto-switches based on runtime detection.

### Hybrid Editor Architecture

Scribe uses a **dual-editor system** that automatically routes files to the appropriate editor based on extension:

```
┌─────────────────────────────────────────────────────────────┐
│                      EditorRouter                            │
│              (detects file extension)                        │
└─────────────────┬───────────────────────┬───────────────────┘
                  │                       │
      ┌───────────▼──────────┐  ┌────────▼──────────────┐
      │  Milkdown Editor     │  │  Monaco Editor        │
      │  (.md, .qmd)         │  │  (.tex, .R, .py)      │
      └──────────────────────┘  └───────────────────────┘
                  │                       │
      ┌───────────▼──────────┐  ┌────────▼──────────────┐
      │  @milkdown/plugin-   │  │  LaTeX Compilation    │
      │  math (KaTeX)        │  │  - PDF preview        │
      │  @milkdown/plugin-   │  │  - Auto-compile       │
      │  prism (syntax)      │  │  - Error display      │
      │                      │  │                       │
      │  [Future]            │  │  R Execution          │
      │  - R chunk exec      │  │  - Run chunks         │
      │  - Inline output     │  │  - Plot display       │
      └──────────────────────┘  └───────────────────────┘
```

**Editor Routing:**
- `.md`, `.qmd` → **MilkdownEditor** (live markdown preview)
- `.tex` → **MonacoCodeEditor** (LaTeX mode + compilation + PDF preview)
- `.R`, `.py` → **MonacoCodeEditor** (code mode + execution)
- Other → **PlainTextEditor** (fallback)

**Key Features:**
1. **Automatic Routing**: Files open in the correct editor automatically
2. **State Persistence**: Cursor/scroll positions saved via Zustand
3. **Unsaved Changes Protection**: Dialog warns when switching files with unsaved changes
4. **LaTeX Compilation**: Cmd+B compiles, side-by-side PDF preview
5. **R Execution**: Cmd+Enter runs code, inline output with plots
6. **Auto-compile**: Optional 2.5s debounced auto-compile for LaTeX

**Implementation Files:**
- `EditorRouter.tsx` - Routes files to appropriate editor
- `MilkdownEditor.tsx` - Markdown/Quarto editor (live preview)
- `MonacoCodeEditor.tsx` - LaTeX/R/code editor (syntax highlighting)
- `ROutputDisplay.tsx` - R execution results (plots, stdout, stderr)
- `UnsavedChangesDialog.tsx` - Unsaved changes warning
- `editorStore.ts` - Zustand state management
- `src-tauri/src/academic.rs` - Rust backend (LaTeX, R execution)

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
│       │   ├── EditorRouter.tsx   # Hybrid editor routing
│       │   ├── MilkdownEditor.tsx # Markdown/Quarto editor
│       │   ├── MonacoCodeEditor.tsx # LaTeX/R/code editor
│       │   ├── ROutputDisplay.tsx # R execution output
│       │   ├── UnsavedChangesDialog.tsx # Unsaved changes warning
│       │   ├── PdfViewer.tsx      # PDF preview component
│       │   └── ...
│       ├── lib/                   # Core utilities
│       │   ├── api.ts             # API factory (Tauri/Browser)
│       │   ├── platform.ts        # Runtime detection (isTauri/isBrowser)
│       │   ├── browser-api.ts     # IndexedDB API (46 operations)
│       │   ├── browser-db.ts      # Dexie.js schema + seed data
│       │   └── browser-dialogs.ts # Browser dialog fallbacks
│       ├── store/
│       │   ├── editorStore.ts     # Editor state (Milkdown + Monaco)
│       │   └── ...                # Other Zustand stores
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

## 🎯 Current Work: Hybrid Editor Complete

**Branch:** `feat/live-editor-enhancements` (ready for PR to dev)

**Hybrid Editor Implementation (4 weeks):**

**Week 1-2: Core Editors ✅**
- ✅ EditorRouter with automatic file routing (.md/.qmd/.tex/.R/.py)
- ✅ MilkdownEditor for markdown/Quarto files
- ✅ MonacoCodeEditor for LaTeX/R/code files
- ✅ LaTeX compilation backend (pdflatex/xelatex)
- ✅ PDF preview component with side-by-side layout
- ✅ Auto-compile on save (2.5s debounce)
- ✅ Cmd+B keyboard shortcut for LaTeX compilation

**Week 3: R/Quarto Support ✅**
- ✅ R execution backend (Rscript via Tauri)
- ✅ Plot capture mechanism (base64 PNG transport)
- ✅ ROutputDisplay component (plots, stdout, stderr, errors)
- ✅ Cmd+Enter keyboard shortcut for R execution
- ✅ Inline output display below code
- ✅ Clear output button functionality

**Week 4: UX + Testing ✅**
- ✅ Monaco cursor/scroll position persistence (Zustand)
- ✅ UnsavedChangesDialog (Save/Discard/Cancel)
- ✅ File switching protection for unsaved changes
- ✅ EditorRouter tests (21 tests - unsaved changes dialog)
- ✅ MonacoCodeEditor tests (24 tests - LaTeX + R features)
- ✅ All 895 tests passing
- ✅ Documentation (CLAUDE.md updates)

**Test Coverage:**
- EditorRouter: File routing, editor switching, unsaved changes
- MonacoCodeEditor: LaTeX compilation, R execution, state management
- Edge cases: null paths, empty content, error handling

**Ready for Merge:**
- All features implemented and tested
- 895 tests passing
- Documentation complete
- No breaking changes

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

- Terminal (xterm.js)
- Graph view
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
