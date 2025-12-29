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
| Shell | Tauri 2 |
| UI | React 18 |
| Editor | HybridEditor++ (custom) |
| Styling | Tailwind CSS |
| State | Zustand |
| Database | SQLite (rusqlite) |
| AI | Claude/Gemini CLI only (NO API) |
| Citations | Pandoc citeproc |
| Math | KaTeX |
| Testing | Vitest + Testing Library |

---

## 📁 Project Structure

```
scribe/
├── cli/                       # Terminal CLI (ZSH)
│   ├── scribe.zsh            # Main CLI implementation
│   ├── install.sh            # CLI installer
│   └── README.md             # CLI documentation
├── src/
│   ├── main/                  # Electron main process
│   │   ├── database/          # SQLite operations
│   │   ├── ai/                # Claude/Gemini CLI wrappers
│   │   ├── academic/          # Zotero, Pandoc, Quarto
│   │   ├── projects/          # Project manager
│   │   ├── knowledge/         # Daily notes, backlinks
│   │   ├── ecosystem/         # flow-cli, obs, aiterm status
│   │   └── sync/              # Obsidian sync
│   │
│   ├── preload/               # IPC bridge
│   │
│   └── renderer/              # React app
│       └── src/
│           ├── components/
│           │   ├── Editor/    # BlockNote
│           │   ├── Sidebar/   # Project switcher, panels
│           │   ├── AIPanel/   # AI actions
│           │   └── FocusMode/ # Distraction-free
│           ├── blocks/        # Custom BlockNote blocks
│           │   ├── WikiLink.tsx
│           │   ├── Tag.tsx
│           │   ├── Citation.tsx
│           │   └── Equation.tsx
│           └── store/         # Zustand
```

---

## 🚀 Commands

### App Development

```bash
npm run dev      # Development
npm run build    # Production build
npm run test     # Run tests
npm run lint     # Lint code
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
scribe help --all      # Full reference
```

**Aliases:** `sd` (daily), `sc` (capture), `ss` (search), `sl` (list)

---

## 🎯 Current Sprint: 27 Complete → Sprint 28 Next

**Sprint 27 Complete:** Right Sidebar Enhancements
- [x] Icons + badge counts for right sidebar tabs
- [x] Keyboard shortcuts ⌘⌥1-4 for tab switching
- [x] Icon-only collapsed mode (⌘⇧B toggle)
- [x] Collapsible sections in Properties panel

**Sprint 28 Focus:** PWA/Browser Support
- [ ] BrowserStorage adapter (IndexedDB)
- [ ] Storage factory with platform detection
- [ ] Service worker for offline support
- [ ] PWA manifest with icons

See: [docs/planning/SPRINT-28-PLAN.md](docs/planning/SPRINT-28-PLAN.md)

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

### Project Structure on Disk

```
~/Projects/{project}/
├── .scribe/
│   ├── project.json     # Settings
│   └── templates/       # Custom templates
├── notes/
└── daily/
    └── 2024-12-24.md
```

### Daily Notes

- Shortcut: ⌘D
- Auto-create with template
- Per-project configuration

---

## 📋 Approval Required For

1. New npm packages
2. New features not in Tiers 1-4
3. Any API integrations (rejected by default)
4. New UI panels
5. Database schema changes

---

## 🏗️ Architecture Decisions

### Storage Abstraction (2025-12-28)

**Decision:** Created `IStorage` interface for platform abstraction.

**Location:** `src/renderer/src/lib/storage.ts`

**Rationale:**
- Future-proofs for PWA/browser deployment
- Current: TauriStorage (SQLite via rusqlite)
- Future: BrowserStorage (IndexedDB)
- Enables sync via PouchDB/CouchDB later

### Tauri ↔ Browser Coordination Options

| Option | Status | Use Case |
|--------|--------|----------|
| **MCP Bridge** | Recommended for v1 | Browser reads Scribe SQLite via MCP server |
| WebSocket Bridge | Deferred | Real-time sync (needs PWA first) |
| Shared Files | Rejected | Loses SQLite benefits |
| **PWA Hybrid** | Future (v2) | Single codebase, multiple targets |

**Current Approach:** Tauri-only desktop. MCP bridge can expose data to browser if needed.

### Data Safety Patterns

1. **Dirty tab confirmation** — Prompt before closing unsaved work
2. **Soft delete** — `deleted_at` timestamp, not hard delete
3. **Auto-save** — Debounced saves on content change
4. **Closed tabs history** — `reopenLastClosed()` for recovery

### SQLite Best Practices

```sql
-- Enable WAL mode for better concurrent access
PRAGMA journal_mode=WAL;

-- Enable foreign keys
PRAGMA foreign_keys=ON;
```

---

## 🔗 Related Files

| File | Purpose |
|------|---------|
| PROJECT-DEFINITION.md | Complete scope control |
| README.md | User-facing overview |
| .STATUS | Progress tracking |
| CHANGELOG.md | Version history |
| cli/scribe.zsh | Terminal CLI implementation |
| cli/README.md | CLI documentation |
| src/renderer/src/lib/storage.ts | IStorage interface |
| docs/ARCHITECTURE.md | System architecture |
