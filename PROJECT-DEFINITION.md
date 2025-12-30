# Scribe Project Definition

> **Version:** 1.3.0 | **Updated:** 2024-12-25 | **Status:** Active Development (70% Complete)

---

## 🎯 One Sentence

**Scribe = ADHD-friendly distraction-free writer + projects + academic features + CLI-based AI.**

---

## ⚡ TL;DR (30 seconds)

| What | How |
|------|-----|
 | **Editor** | HybridEditor (markdown + preview) |
| **Focus** | Distraction-free mode, global hotkey |
| **Projects** | Research, Teaching, R-Package, R-Dev, Generic |
| **Citations** | Zotero via Better BibTeX |
| **Export** | Markdown, LaTeX, PDF, Word, Quarto |
| **AI** | Claude + Gemini CLI (no API keys) |
| **Notes** | Wiki links, tags, daily notes |
| **Storage** | Local project folders + Obsidian sync |
| **Design** | ADHD-first, minimal friction |

---

## 🧠 ADHD Design Principles

> **These override ALL feature decisions.**

### 1. Zero Friction (< 3 seconds)

```
⌘⇧N → Window appears → Start typing
No dialogs. No choices. Just write.
```

### 2. One Thing at a Time

- Single note visible
- Sidebar collapses in focus mode
- No tabs, no split views

### 3. Escape Hatches

- ⌘W = Close (auto-saves)
- ⌘Z = Undo (always works)
- No "Are you sure?" dialogs

### 4. Visible Progress

- Word count (always visible)
- Session timer
- Streak indicator (optional)

### 5. Sensory-Friendly

- Dark mode default
- No distracting animations
- Muted colors, high contrast text

### 6. Quick Wins

- Milestone celebrations (100, 500, 1000 words)
- "Win" logging
- Daily goal progress bar

---

## ✅ What Scribe IS

 | Principle | Implementation |
|-----------|----------------|
| **Distraction-Free Writer** | Focus mode, minimal UI |
| **Markdown Editor** | Write/Preview mode with live markdown rendering |
| **Project Manager** | Local folders, project settings |
| **Academic Writing Tool** | Zotero + LaTeX + Quarto |
| **Knowledge Notes** | Wiki links, tags, daily notes |
| **ADHD-Friendly** | Quick capture, low friction |
| **CLI-Based AI** | `claude` and `gemini` CLI |
| **Obsidian Companion** | Sync notes to vault |

---

## ❌ What Scribe IS NOT

| Avoid | Why |
|-------|-----|
| Full IDE | Use VS Code / Positron |
| Terminal emulator | Defer to v2 (use iTerm/Wezterm) |
| Code editor | Use VS Code / RStudio |
| Full PKM system | Obsidian does this |
| Graph view | Too complex, use Obsidian |
| API-based AI | Requires keys, costs money |
| Plugin system | Scope creep |
| Multi-tab editor | Breaks "one thing at a time" |

---

## 📁 Project System

### Project Types

| Type | Use Case | Default Template |
|------|----------|------------------|
| **Research** | Papers, analysis | Academic paper |
| **Teaching** | Courses, lectures | Lecture notes |
| **R-Package** | R package docs | Vignette |
| **R-Dev** | Dev tools projects | README-first |
| **Generic** | Everything else | Blank |

### Folder Structure

```
~/Projects/
├── research-mediation/
│   ├── .scribe/
│   │   ├── project.json      # Settings
│   │   └── templates/        # Custom templates
│   ├── paper-draft.md
│   ├── literature-notes.md
│   └── daily/
│       ├── 2024-12-24.md
│       └── 2024-12-25.md
│
├── teaching-stats-101/
│   ├── .scribe/
│   │   └── project.json
│   ├── lecture-01.md
│   └── assignments/
│
├── r-package-medfit/
│   ├── .scribe/
│   │   └── project.json
│   └── vignettes/
│
└── r-dev-aiterm/
    ├── .scribe/
    │   └── project.json
    └── docs/
```

### project.json Schema

```json
{
  "name": "Mediation Paper",
  "type": "research",
  "created": "2024-12-24",
  "bibliography": "~/Zotero/research.bib",
  "obsidianVault": "~/vaults/research",
  "exportDefaults": {
    "format": "pdf",
    "template": "academic",
    "citationStyle": "apa7"
  },
  "aiContext": "Causal inference, mediation analysis, sensitivity analysis",
  "dailyNotes": {
    "enabled": true,
    "folder": "daily",
    "template": "## {{date}}\n\n### Progress\n\n### Notes\n"
  }
}
```

### Project Switcher UI

```
┌─────────────────────────────────────┐
│ 📁 Projects                    [+]  │
├─────────────────────────────────────┤
│ 🔬 research-mediation      ← Active │
│ 📚 teaching-stats-101               │
│ 📦 r-package-medfit                 │
│ 🔧 r-dev-aiterm                     │
│ ─────────────────────────────       │
│ ⚙️ New Project...                   │
└─────────────────────────────────────┘
```

---

## 📝 Knowledge Management

### Included (v1.0)

| Feature | Description |
|---------|-------------|
| **Wiki Links** | `[[Note Title]]` with autocomplete |
| **Tags** | `#tag` with colored badges |
| **Backlinks** | Show notes linking to current |
| **Daily Notes** | Auto-create with template |
| **Note Search** | Search within project |

### Excluded (Use Obsidian)

| Feature | Why Exclude |
|---------|-------------|
| Graph view | Complex, Obsidian does better |
| Full-text search across projects | Use Obsidian |
| Spaced repetition | Use Obsidian plugin |
| Canvas/mind map | Use Obsidian |
| MOC auto-generation | Use Obsidian |

### Daily Notes

```
Template: daily/{{date}}.md

## 2024-12-24

### Progress
- [x] Reviewed VanderWeele paper
- [ ] Run sensitivity analysis

### Notes
Working on [[Sensitivity Analysis]] section...

### Tags
#research #mediation
```

**Hotkey:** ⌘D = Open/create today's daily note

---

## 📦 Feature Tiers

### Tier 1: MVP (Must Have)

| Feature | Sprint |
|---------|--------|
| HybridEditor (markdown + preview) | 8 |
| Focus Mode | 8 |
| Dark Mode | 8 |
| Auto-Save | 8 |
| Wiki Links | 9 |
| Tags | 9 |
| Word Count | 8 |
| Global Hotkey (⌘⇧N) | 10 |

### Tier 2: Core Features

| Feature | Sprint |
|---------|--------|
| Claude CLI | 9 |
| Gemini CLI | 9 |
| Ecosystem Panel | 9 |
| Command Palette (⌘K) | 10 |
| Obsidian Sync | 11 |
| Session Timer | 9 |

### Tier 3: Academic Features

| Feature | Sprint |
|---------|--------|
| Zotero Integration | 12 |
| Citation Autocomplete | 12 |
| Equation Blocks (KaTeX) | 12 |
| LaTeX Export | 13 |
| PDF Export | 13 |
| Word Export | 13 |
| Quarto Render | 14 |

### Tier 4: Project System

| Feature | Sprint |
|---------|--------|
| Project Switcher | 15 |
| Project Settings | 15 |
| Project Templates | 16 |
| Local Folder Save | 15 |
| Daily Notes | 16 |
| Backlinks Panel | 16 |

### Tier 5: Polish (v1.0)

| Feature | Sprint |
|---------|--------|
| Writing Goals | 17 |
| Streak Tracking | 17 |
| Note Search | 17 |

### Deferred to v2

| Feature | Reason | Status |
|---------|--------|--------|
| **Terminal (xterm.js)** | Phase 3 power feature | ✅ Feasibility HIGH (react-xtermjs) |
| **Graph View** | Use Obsidian | Permanent defer |
| **Multi-tab Editing** | Breaks ADHD focus | Permanent defer |
| **File Tree Browser** | Complexity | Evaluate |
| **Git Integration** | Use external | Permanent defer |
| **Code Execution** | Use RStudio/Positron | Permanent defer |

### Sidebar Consolidation (v2 Evolution Path)

**Design Doc:** `BRAINSTORM-sidebar-consolidation-2025-12-29.md`

```
Phase 1: Foundation
├── Option A: Stats tab (merge HudPanel into right sidebar)
└── Option I: Status bar quick chat icon

Phase 2: AI Integration (Choose ONE)
├── Option H: Claude as full sidebar tab (VS Code style)
├── Option F: Split-pane with docked Claude → evolves to G if cramped
└── Option K: OpenCode-style AI Workspace (rich UI)

Phase 3: Power Features
├── Option J: Terminal tab (xterm.js) - Feasibility: ✅ HIGH
└── Option G: Ambient AI (⌘K everywhere, inline suggestions)
```

**Research Sources:**
- OpenCode TUI patterns (github.com/opencode-ai/opencode)
- Cursor 2.0 agent-centric UI (cursor.com/features)
- xterm.js React integration (react-xtermjs)

### Never Build

| Feature | Reason |
|---------|--------|
| API-based AI | Keys + cost |
| Plugin system | Scope creep |
| Mobile app | Different product |
| Cloud sync (proprietary) | Use Obsidian |
| Real-time collaboration | Out of scope |

---

## 🤖 AI Integration

### Why CLI, Not API?

| CLI | API |
|-----|-----|
| Free (your subscription) | Pay per token |
| Already installed | Need API keys |
| Auto-updates | SDK management |
| Zero config | Setup friction |

### AI Actions (5)

| Action | Prompt |
|--------|--------|
| **Improve** | "Improve clarity and flow" |
| **Expand** | "Expand on this idea" |
| **Summarize** | "Summarize in 2-3 sentences" |
| **Explain** | "Explain this simply" |
| **Research** | "What does research say about..." |

---

## 📚 Academic Stack

### Citation Workflow

```
Zotero → Better BibTeX → .bib → Scribe → @cite autocomplete
```

### Export Pipeline

```bash
# All via Pandoc
pandoc input.md -o output.{tex,pdf,docx} --citeproc --bibliography=refs.bib

# Quarto
quarto render input.qmd
```

---

## 🔌 Ecosystem Integration

### Read-Only Status

| Project | What Scribe Reads |
|---------|------------------|
| flow-cli | Session, duration |
| aiterm | Claude quota |
| obs | Vault stats |
| mcp-servers | Server status |

---

## 📐 Technical Stack

### Locked

 | Layer | Technology |
|-------|------------|
| Shell | Tauri 2 |
| UI | React 18 |
| Editor | HybridEditor (ReactMarkdown) |
| Styling | Tailwind CSS |
| State | Zustand |
| Database | SQLite |
| AI | CLI only |
| Citations | Pandoc citeproc |
| Math | KaTeX |

### Dependencies

```bash
# User must have:
- Zotero + Better BibTeX
- Pandoc
- LaTeX (for PDF)
- Quarto (optional)
- claude CLI
- gemini CLI
```

---

## 🛤️ Sprint Roadmap

### Phase 1: Editor (Weeks 1-2) ✅ COMPLETE

| Sprint | Focus | Hours | Status |
|--------|-------|-------|--------|
| 8 | Editor Foundation | 4h | ✅ Complete |
| 9 | Editor Enhancement | 4h | ✅ Complete |
| 10 | Hotkey + Commands | 6h | ✅ Complete |

### Phase 2: Integration (Weeks 3-4) ← CURRENT

| Sprint | Focus | Hours | Status |
|--------|-------|-------|--------|
| 11 | Academic Features | 8h | 🔄 Next |
| 12 | Obsidian Sync | 8h | Pending |

### Phase 3: Export (Week 5)

| Sprint | Focus | Hours | Status |
|--------|-------|-------|--------|
| 13 | LaTeX/PDF/Word | 6h | Pending |
| 14 | Quarto | 6h | Pending |

### Phase 4: Projects (Weeks 6-7)

| Sprint | Focus | Hours | Status |
|--------|-------|-------|--------|
| 15 | Project System | 8h | Pending |
| 16 | Templates + Daily | 4h | Pending |

### Phase 5: Polish (Week 8)

| Sprint | Focus | Hours | Status |
|--------|-------|-------|--------|
| 17 | Search + Goals | 4h | Pending |

**Progress: 42h / 60h (70%) — 300 tests passing**

---

## 🚫 Scope Creep Prevention

### Before Adding Anything

1. **Does it help ADHD focus?** → If no, reject
2. **Is it in Tiers 1-5?** → If no, defer
3. **Does it need API keys?** → If yes, reject
4. **Does it add UI clutter?** → If yes, reconsider
5. **Can existing tools do it?** → If yes, integrate

### Red Flags (Stop)

- "We could also add..."
- "While we're at it..."
- "Other apps have..."
- "It would be cool if..."

### Green Flags (Proceed)

- "This reduces friction"
- "This helps focus"
- "This removes a step"
- "This uses existing CLI"

---

## 📁 Target Structure

 ```
 scribe/
 ├── src/
 │   ├── src-tauri/
 │   │   ├── src/
 │   │   │   ├── lib.rs
 │   │   │   ├── main.rs
 │   │   │   ├── database.rs
 │   │   │   ├── commands.rs
 │   │   │   ├── ai/
 │   │   │   │   ├── claude.rs
 │   │   │   │   └── gemini.rs
 │   │   │   ├── academic/
 │   │   │   │   ├── zotero.rs
 │   │   │   │   ├── pandoc.rs
 │   │   │   │   └── quarto.rs
 │   │   │   ├── projects/
 │   │   │   │   ├── manager.rs       # Project CRUD
 │   │   │   │   ├── templates.rs     # Project templates
 │   │   │   │   └── settings.rs      # project.json
 │   │   │   ├── knowledge/
 │   │   │   │   ├── daily.rs         # Daily notes
 │   │   │   │   ├── backlinks.rs     # Backlink tracking
 │   │   │   │   └── search.rs        # Note search
 │   │   │   ├── ecosystem/
 │   │   │   │   ├── flow.rs
 │   │   │   │   ├── obs.rs
 │   │   │   │   └── aiterm.rs
 │   │   │   └── sync/
 │   │   │       └── obsidian.rs
 │   │
 │   └── renderer/
 │       └── src/
 │           ├── App.tsx
 │           ├── components/
 │           │   ├── HybridEditor.tsx
 │           │   ├── Sidebar/
 │           │   │   ├── ProjectSwitcher.tsx
 │           │   │   ├── NoteList.tsx
 │           │   │   ├── BacklinksPanel.tsx
 │           │   │   └── EcosystemPanel.tsx
 │           │   ├── AIPanel/
 │           │   ├── FocusMode/
 │           │   ├── DailyNotes/
 │           │   └── ExportDialog/
 │           │   ├── blocks/
 │           │   │   ├── WikiLink.tsx
 │           │   │   ├── Tag.tsx
 │           │   │   ├── Citation.tsx
 │           │   │   └── Equation.tsx
 │           │   └── store/
 │
 ├── PROJECT-DEFINITION.md
 ├── README.md
 └── package.json
 ```

---

## 📊 Success Metrics

### v1.0 Release

| Metric | Target | Current |
|--------|--------|---------|
| Time to capture | < 3 seconds | ✅ Achieved |
| All Tier 1-5 features | Complete | 70% |
| Tests | 80+ passing | **300 passing** |
| App launch | < 2 seconds | ✅ Achieved |

### v2.0 Consideration (Terminal)

Only after v1.0 is stable:

- Evaluate xterm.js integration
- User feedback on external terminal
- ADHD impact assessment

---

## 📝 Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-29 | 1.6.0 | Sprint 25 complete, 795 tests, sidebar consolidation planned |
| 2024-12-25 | 1.3.0 | Sprint 10 complete, 300 tests, 70% progress |
| 2024-12-24 | 1.2.0 | Added project system, daily notes, backlinks |
| 2024-12-24 | 1.1.0 | Added academic features |
| 2024-12-24 | 1.0.0 | Initial definition |

---

 ## 🎯 Summary

 ```
 Scribe v1.0 =
   HybridEditor (markdown + preview)
   + Focus Mode
   + Projects (Research, Teaching, R-Package, R-Dev, Generic)
   + Daily Notes
   + Wiki Links + Tags + Backlinks
   + Zotero + LaTeX + Quarto
   + Claude/Gemini CLI
   + Obsidian Sync

 Terminal = v2 (deferred)
 Graph View = Never (use Obsidian)
 BlockNote = Optional (deferred if HybridEditor works well)

 64 hours. 10 sprints. ADHD-first.
 ```
