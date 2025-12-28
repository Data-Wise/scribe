# Scribe Project Definition

> **Version:** 1.7.0 | **Updated:** 2025-12-28 | **Status:** Active Development (Sprint 26 Complete)

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

| Feature | Reason |
|---------|--------|
| **Terminal (xterm.js)** | Complexity, external works |
| **Graph View** | Use Obsidian |
| **Multi-tab Editing** | Breaks ADHD focus |
| **File Tree Browser** | Complexity |
| **Git Integration** | Use external |
| **Code Execution** | Use RStudio/Positron |

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

### ✅ Completed Sprints (v1.0 - v1.7)

| Sprint | Version | Focus | Status |
|--------|---------|-------|--------|
| 8-10 | v1.0 | Editor Foundation, Enhancement, Commands | ✅ |
| 10.5-11 | v1.0 | Theme System, Academic Features | ✅ |
| 14-16 | v1.0 | Knowledge Graph, Tags Panel | ✅ |
| 17-20 | v1.1 | ADHD Enhancements, Projects, Search, CLI | ✅ |
| 22-23 | v1.3-1.4 | Editor Modes, Mission Control, Native Menu | ✅ |
| 24 | v1.5 | Three-State Collapsible Sidebar | ✅ |
| 25 | v1.6 | Tab System, Quick Capture, Writing Goals | ✅ |
| 26 | v1.7 | Data Safety & UX Polish (Trash, Undo, Auto-cleanup) | ✅ |

### 🚧 Sprint 27: PWA/Browser Support (Next)

**Goal:** Enable Scribe to run in the browser without Tauri, using IndexedDB for storage.

#### Core Storage (P1)
| Task | Description |
|------|-------------|
| IStorage interface | Abstract storage operations (CRUD for notes, projects, tags) |
| IndexedDB adapter | Implement IStorage using IndexedDB + Dexie.js |
| Storage factory | Auto-detect environment (Tauri vs Browser) |
| Migration support | Import/export data between storage backends |

#### PWA Infrastructure (P2)
| Task | Description |
|------|-------------|
| manifest.json | App name, icons, theme color, display mode |
| Service worker | Cache app shell, static assets |
| Install prompt | "Add to Home Screen" support |
| Update flow | Notify user of new versions |

#### Offline Support (P3)
| Task | Description |
|------|-------------|
| Offline indicator | Show connection status in UI |
| Sync queue | Queue changes when offline |
| Conflict resolution | Last-write-wins or merge strategy |
| Background sync | Sync when connection restored |

### 📋 Future Sprints

| Sprint | Focus | Features |
|--------|-------|----------|
| 28 | Cloud Sync | Optional Supabase/Firebase backup, cross-device sync |
| 29 | Mobile PWA | Responsive design, touch gestures, swipe navigation |
| 30 | Collaboration | Real-time co-editing via CRDT (stretch goal) |

**Progress: 677 tests passing — 26 sprints complete**

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
| 2025-12-28 | 1.7.0 | Sprint 26: Data Safety (Trash, Undo Toast, Auto-cleanup) |
| 2025-12-28 | 1.6.0 | Sprint 25: Tab System, Quick Capture, Writing Goals |
| 2025-12-27 | 1.5.0 | Sprint 24: Three-State Collapsible Sidebar |
| 2025-12-27 | 1.4.0 | Sprint 23: Mission Control, Native Menu |
| 2025-12-27 | 1.3.0 | Sprint 22: Editor Modes, Custom CSS |
| 2025-12-27 | 1.2.0 | Mission Control dashboard |
| 2025-12-27 | 1.1.0 | Projects, Note Search, CLI |
| 2024-12-25 | 1.0.0 | Initial release, 300 tests |

---

## 🎯 Summary

```
Scribe v1.7 =
  HybridEditor (markdown + preview)
  + Mission Control Dashboard
  + Tab System (multi-note editing)
  + Three-State Sidebar
  + Focus Mode + Writing Goals
  + Projects (Research, Teaching, R-Package, R-Dev, Generic)
  + Daily Notes + Quick Capture
  + Wiki Links + Tags + Backlinks
  + Trash System + Undo Toast
  + Zotero + LaTeX + Quarto
  + Claude/Gemini CLI
  + Obsidian Sync

Next: PWA/Browser Support (Sprint 27)
677 tests. 26 sprints. ADHD-first.
```
