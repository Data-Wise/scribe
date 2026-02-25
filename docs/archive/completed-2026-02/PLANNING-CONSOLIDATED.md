# Scribe Planning Consolidated
> **Updated:** 2026-02-01  
> **Version:** v1.16.3  
> **Status:** Active Development

---

## Current State (Verified)

### ✅ Implemented Features (v1.16.3)

**Core Writing:**
- Notes CRUD (SQLite + IndexedDB dual-runtime)
- Auto-save, word count, reading time
- Dark mode, 10 built-in themes
- Focus mode, distraction-free writing

**Knowledge Management:**
- Wiki links (`[[Note Title]]`) with navigation
- Backlinks panel
- Tags system with colored badges
- Daily notes (⌘D)
- Full-text search (FTS5)

**Projects:**
- Project CRUD (5 types: research, teaching, r-package, r-dev, generic)
- Note-project assignment
- Project settings (JSON blob)
- Custom icons (Migration 010)

**AI Integration:**
- ✅ Claude CLI backend (`run_claude` command)
- ✅ Gemini CLI backend (`run_gemini` command)
- ✅ Chat history database (Migration 009)
- ✅ ClaudeChatPanel UI component
- ⚠️ Frontend-backend wiring needs verification

**Terminal:**
- PTY shell integration (portable-pty)
- xterm.js frontend
- 5 terminal commands (spawn, write, resize, kill, list)

**Academic:**
- Zotero/BibTeX citation support
- Pandoc export (PDF, Word, LaTeX)
- KaTeX equation rendering
- Citation autocomplete

**Infrastructure:**
- Automated CI/CD pipeline (v1.16.3)
- Homebrew distribution
- 10 database migrations
- 2,163 unit tests + 109 E2E tests

---

## Active Development

### Sprint 37: Three-Tab Sidebar System

**Status:** Planned  
**Spec:** `docs/PROPOSAL-v1.17.0-three-tab-sidebar-state-architecture.md`

**Goal:** Unified sidebar state management with 3 tabs (Notes, Projects, AI)

**Key Changes:**
- Consolidate left/right sidebars
- Tab-based navigation
- Persistent state per tab
- Keyboard shortcuts (⌘1, ⌘2, ⌘3)

---

### Quarto Integration (v1.15.0 Target)

**Status:** ❌ NOT IMPLEMENTED (despite "complete" claims)  
**Branch:** `feat/quarto-v115`  
**Spec:** `docs/specs/SPEC-v115-quarto-enhancements-2026-01-07.md`

**Planned Features:**
1. YAML frontmatter autocomplete
2. Chunk options autocomplete (#|)
3. Cross-reference autocomplete (@fig-, @tbl-)
4. Quarto render integration
5. Callout syntax support
6. Single chunk execution (R/Python/Bash)
7. Error panel
8. Zotero + BibTeX integration

**Estimated Effort:** 40-45 hours across 4 sprints

**Reality Check:** Zero code exists. Planning documents claim "Sprint 33 complete" but no implementation found.

---

### AI Integration Completion

**Status:** 80% complete  
**Remaining:** 1-2h frontend verification

**Done:**
- ✅ Backend commands (Claude + Gemini)
- ✅ Chat history database
- ✅ UI components

**TODO:**
- Verify frontend calls Tauri commands
- Test chat history persistence
- Error handling polish

---

### LaTeX Editor v2.0

**Status:** Planned only  
**Spec:** `docs/specs/SPEC-latex-editor-2026-01-07.md`

**Phases:**
1. Multi-format architecture (md/tex/qmd)
2. LaTeX editor component (CodeMirror)
3. TeX Live compilation
4. PDF preview (pdfjs-dist)
5. Template library (6+ templates)
6. Enhanced inline LaTeX

**Estimated Effort:** 7 weeks (~35-40 hours)

---

## Archived Features (Historical)

### Completed Sprints

**Sprint 30-32:** Browser mode polish, callouts, LaTeX  
**Sprint 33-36:** Sidebar enhancements (v1.15.0, v1.16.0)

**Key Milestones:**
- v1.14.0: WikiLink navigation
- v1.15.0: Sidebar mode consolidation
- v1.16.0: Icon-centric sidebar
- v1.16.2: Tech debt cleanup (-881 lines)
- v1.16.3: CI/CD automation

### Deferred to v2.0+

- Graph view (use Obsidian)
- Multi-tab editing (breaks ADHD focus)
- File tree browser
- Git integration
- Code execution (use RStudio/Positron)
- Plugin system

---

## Database Schema

**Current Version:** 10

| Migration | Feature | Lines |
|-----------|---------|-------|
| 001 | Core tables (notes, tags, folders) | ~90 |
| 002 | Wiki links | ~20 |
| 003 | Tag system refactor | ~30 |
| 004 | Projects system | ~30 |
| 005 | Note properties | ~10 |
| 006 | Project settings table | ~10 |
| 007 | Demo data seeding | ~220 |
| 008 | FTS with properties | ~50 |
| 009 | Chat history tables | ~70 |
| 010 | Project icons | ~10 |

**Total:** ~540 lines of migration code

---

## Git Workflow

```
main (v1.16.3) ← PR from dev only
  └── dev ← PR from feature branches
       ├── feat/quarto-v115 (planned, not implemented)
       ├── feat/ai-integration (80% complete)
       └── feat/latex-editor-v2 (planned only)
```

**Merged:**
- `feat/sidebar-v2` → dev (v1.15.0)
- `feat/tech-debt-remediation` → main (v1.16.2)

---

## Priority Backlog

1. **Code signing** (Apple Developer) - Removes Gatekeeper workaround
2. **Test file cleanup** (2.5h) - Fix 67 non-blocking TypeScript errors
3. **Database modularization** (3h) - Extract 600 lines to migrations.rs
4. **Verify AI integration** (1-2h) - Test frontend-backend wiring
5. **Quarto implementation** (40-45h) - Start actual coding if prioritized

---

## Documentation Structure

**Keep (Active):**
- `ROADMAP-CONSOLIDATED-2026-01-08.md` - This file
- `docs/reference/PROJECT-DEFINITION.md` - Core vision
- `docs/specs/SPEC-three-tab-sidebar-2026-01-10.md` - Sprint 37
- `docs/specs/SPEC-v115-quarto-enhancements-2026-01-07.md` - Quarto plan
- `docs/specs/SPEC-latex-editor-2026-01-07.md` - v2.0 plan
- `docs/planning/PLAN-ai-integration.md` - AI completion plan

**Archive (Historical):**
- All BRAINSTORM-* files (move to `docs/archive/brainstorms/`)
- Sprint 30-32 files (move to `docs/archive/sprints/`)
- Completed implementation summaries (move to `docs/archive/completed/`)

---

## Next Steps

1. **Sprint 37:** Decide on three-tab sidebar vs code signing priority
2. **Quarto:** If prioritized, start implementation (not just planning)
3. **AI:** Verify frontend integration (1-2h)
4. **Cleanup:** Archive historical planning docs
5. **Honesty:** Update .STATUS to remove false "complete" claims
