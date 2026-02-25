# Scribe Worktree & Branch Summary

> **Last Updated:** 2026-01-08
> **Purpose:** Quick reference for all active feature branches and worktrees

---

## Git Workflow Architecture

```
main (protected) ← PR from dev only
  └── dev (planning/merging) ← PR from feature branches
       ├── feat/quarto-v115 ✅ ACTIVE
       ├── feat/latex-editor-v2 📋 PLANNED
       ├── feat/sidebar-v2 🆕 NEW
       └── feat/ai-integration 🆕 NEW
```

---

## Active Worktrees (6 Total)

```bash
$ git worktree list
```

| # | Path | Branch | Status | Purpose |
|---|------|--------|--------|---------|
| 1 | `/Users/dt/projects/dev-tools/scribe` | `dev` | ✅ Main | Integration branch |
| 2 | `~/.git-worktrees/scribe/quarto-v115` | `feat/quarto-v115` | ✅ Active | v1.15 Quarto Enhancements |
| 3 | `~/.git-worktrees/scribe/latex-v2` | `feat/latex-editor-v2` | 📋 Planned | v2.0 LaTeX Editor Mode |
| 4 | `~/.git-worktrees/scribe/sidebar-v2` | `feat/sidebar-v2` | 🆕 New | Sidebar v2 Enhancement |
| 5 | `~/.git-worktrees/scribe/ai-integration` | `feat/ai-integration` | 🆕 New | AI Backend Integration |
| 6 | `~/.git-worktrees/scribe/settings` | `feat/settings-phase-3-polish` | 🔒 Merged | (Historical) |

---

## Feature Branch Details

### 1. feat/quarto-v115 (v1.15 Quarto Enhancements) ✅

**Worktree:** `~/.git-worktrees/scribe/quarto-v115`
**Status:** Sprint 33 Complete, Sprint 34 Next
**Duration:** 40-45 hours (4 sprints)
**Planning:** `docs/specs/SPEC-v115-quarto-enhancements-2026-01-07.md`

**Sprints:**
- ✅ Sprint 33: Core Autocomplete (YAML, chunk options, cross-refs)
- ⏳ Sprint 34: Integration (cross-refs, render, callouts) - 10-12h
- ⏳ Sprint 35: Execution & Errors (chunk execution, error panel) - 15-18h
- ⏳ Sprint 36: Preview & Polish (live slides, bug fixes) - 8-10h

**Key Files:**
- `src/renderer/src/lib/quarto-completions.ts` (729 lines)
- `src-tauri/src/quarto/` (backend, to be created)

**Tests:** 2,015 total (32 new in Sprint 33)

---

### 2. feat/latex-editor-v2 (v2.0 LaTeX Editor) 📋

**Worktree:** `~/.git-worktrees/scribe/latex-v2`
**Status:** Planning Complete, Implementation Pending
**Duration:** 7 weeks (6 phases)
**Planning:** `docs/planning/PLAN-v2-latex-editor.md`

**Phases:**
- Phase 1: Foundation (2 weeks) - Multi-format architecture
- Phase 2: Editor (1 week) - LaTeXEditor component
- Phase 3: Compile (1 week) - TeX Live integration
- Phase 4: PDF Preview (1 week) - PDF.js split view
- Phase 5: Templates (1 week) - 6+ template library
- Phase 6: Inline (1 week) - Enhanced markdown+LaTeX

**Database:** Add `file_format` column (md/tex/qmd)

**Tests:** ~170 new tests across all phases

---

### 3. feat/sidebar-v2 (Sidebar v2 Enhancement) 🆕

**Worktree:** `~/.git-worktrees/scribe/sidebar-v2`
**Status:** Ready to start
**Duration:** 9-13 hours (3 phases)
**Planning:** `docs/planning/PLAN-sidebar-v2-enhancement.md`

**Phases:**
- ✅ Phase 1: Editor Tabs (gradient accent) - COMPLETE
- ⏳ Phase 2: Vault Sidebar (4-6h) - Obsidian-style file tree
- ⏳ Phase 3: Status Bar (2-3h) - VS Code bottom bar
- ⏳ Phase 4: Mission Control Updates (3-4h) - Vault-based nav

**Features:**
- Permanent Inbox vault
- Collapsible vault sections with accordion
- Nested folder tree (unlimited depth)
- Drag-and-drop notes between folders/vaults
- Bottom status bar (sync, streak, words today)
- Mission Control updates (inbox preview, active vaults)

**Database:** Migration 010 - Add `folders` table

**Tests:** 70-80 unit + 40-50 E2E

---

### 4. feat/ai-integration (AI Backend Integration) 🆕

**Worktree:** `~/.git-worktrees/scribe/ai-integration`
**Status:** Ready to start
**Duration:** 5-7 hours (5 phases)
**Planning:** `docs/planning/PLAN-ai-integration.md`

**Phases:**
- 🎯 Phase 1: Claude CLI Integration (2-3h) - HIGHEST PRIORITY
- Phase 2: Gemini CLI Integration (1-2h)
- Phase 3: Quick Actions Enhancement (1h)
- Phase 4: Chat History Backend (30m)
- Phase 5: Error Handling & UX (1h)

**Backend (NEW):**
- `src-tauri/src/ai/mod.rs` - AI module root
- `src-tauri/src/ai/claude.rs` - Claude CLI wrapper (150-200 lines)
- `src-tauri/src/ai/gemini.rs` - Gemini CLI wrapper (100-150 lines)
- 4 new Tauri commands per provider

**Implementation:**
```rust
async fn run_claude(prompt: &str, context: &str, model: Option<&str>) -> Result<String>
// Executes: echo "$context" | claude --print "$prompt"
```

**Frontend:** Update `api.ts` to invoke Tauri commands (remove browser stub)

**Tests:** 20 Rust unit + 15-20 E2E

**Outcome:** Claude Tab, Quick Chat, Quick Actions fully functional in desktop app

---

## Planning Documentation

| Document | Lines | Purpose |
|----------|-------|---------|
| `ROADMAP-CONSOLIDATED-2026-01-08.md` | 900+ | Master roadmap (all features) |
| `IMPLEMENTATION-STATUS-2026-01-08.md` | 350+ | Current implementation status |
| `SUMMARY-AI-SIDEBAR-STATUS.md` | 280+ | Quick reference (built vs planned) |
| `PLAN-sidebar-v2-enhancement.md` | 550+ | Sidebar v2 detailed plan |
| `PLAN-ai-integration.md` | 650+ | AI integration detailed plan |
| `SPEC-v115-quarto-enhancements-2026-01-07.md` | 800+ | v1.15 Quarto spec |
| `PLAN-v2-latex-editor.md` | 600+ | v2.0 LaTeX plan |

**Total:** 4,180+ lines of comprehensive planning documentation

---

## Quick Commands

### Navigate to Worktrees

```bash
# Quarto (v1.15)
cd ~/.git-worktrees/scribe/quarto-v115

# LaTeX (v2.0)
cd ~/.git-worktrees/scribe/latex-v2

# Sidebar v2
cd ~/.git-worktrees/scribe/sidebar-v2

# AI Integration
cd ~/.git-worktrees/scribe/ai-integration

# Main repo (dev branch)
cd ~/projects/dev-tools/scribe
```

### Check Worktree Status

```bash
# List all worktrees
git worktree list

# Check current branch
git branch --show-current

# View commits since dev
git log dev..HEAD --oneline

# View file changes
git diff dev --stat
```

### Merge to Dev

```bash
# From feature branch worktree:
git checkout dev
git merge feat/feature-name --no-ff -m "Merge Phase X: Description"
git push origin dev

# Create PR to main when ready:
cd ~/projects/dev-tools/scribe
git checkout dev
gh pr create --base main --head dev --title "vX.Y.Z: Release Name"
```

---

## Recommended Work Order

### Option A: Sequential (One Feature at a Time)

**Best for:** Focus, thorough testing, minimal context switching

```
1. AI Integration (5-7h) ← HIGHEST PRIORITY
   └─ Makes Claude Tab/Quick Chat functional

2. Sidebar v2 (9-13h)
   └─ Completes left sidebar redesign

3. Quarto Sprint 34-36 (33-40h)
   └─ v1.15 release

4. LaTeX v2.0 (7 weeks)
   └─ Major feature, separate release
```

### Option B: Parallel (Multiple Features)

**Best for:** Maximize progress, leverage worktrees

```
Week 1-2:
- AI Integration Phase 1-3 (4-5h)
- Sidebar Phase 2 (4-6h)
- Quarto Sprint 34 (10-12h)

Week 3-4:
- AI Integration Phase 4-5 (1.5h)
- Sidebar Phase 3-4 (5-7h)
- Quarto Sprint 35 (15-18h)

Week 5-6:
- Quarto Sprint 36 (8-10h)
- LaTeX Phase 1 start
```

### Option C: Priority-Driven (Impact-First)

**Best for:** Quick wins, user value

```
Priority 1: AI Integration (5-7h)
  → Makes existing UI functional
  → High user impact
  → All UI already complete

Priority 2: Quarto Sprint 34 (10-12h)
  → Project-wide cross-refs (critical)
  → Quarto render integration
  → Enables academic workflows

Priority 3: Sidebar Phase 2 (4-6h)
  → Vault navigation
  → Better organization for large projects

Priority 4: Everything else
```

---

## Branch Lifecycle

### 1. Create Feature Branch (Already Done)

```bash
git worktree add ~/.git-worktrees/scribe/feature-name -b feat/feature-name dev
```

### 2. Work in Worktree

```bash
cd ~/.git-worktrees/scribe/feature-name
# Make changes, commit regularly
git add .
git commit -m "feat: Description"
```

### 3. Merge to Dev (When Phase Complete)

```bash
git checkout dev
git merge feat/feature-name --no-ff -m "Merge Phase X"
git push origin dev
```

### 4. Continue or Clean Up

**Continue:** Stay in worktree for next phase

**Clean Up (when fully done):**
```bash
git worktree remove ~/.git-worktrees/scribe/feature-name
git branch -d feat/feature-name
```

---

## Current Recommendations

**Start This Week:**

1. **AI Integration Phase 1** (2-3h) 🎯
   - Worktree: `~/.git-worktrees/scribe/ai-integration`
   - Highest impact: Makes Claude Tab functional
   - All UI ready, just needs Rust backend

2. **Quarto Sprint 34** (10-12h)
   - Worktree: `~/.git-worktrees/scribe/quarto-v115`
   - Critical: Project-wide cross-references
   - Foundation for Sprints 35-36

**Or:**

**Sidebar Phase 2** (4-6h)
   - Worktree: `~/.git-worktrees/scribe/sidebar-v2`
   - Vault navigation improves UX
   - Independent of other features

---

## Version Targets

| Feature | Version | Release |
|---------|---------|---------|
| Quarto Enhancements | v1.15.0 | After Sprint 36 |
| Sidebar v2 | v1.16.0 | After Phase 4 |
| AI Integration | v1.17.0 | After Phase 5 |
| LaTeX Editor | v2.0.0 | After Phase 6 |

**Or Bundle:**
- v1.15.0: Quarto + Sidebar v2 + AI Integration (mega release)
- v2.0.0: LaTeX Editor

---

**Created:** 2026-01-08
**Last Updated:** 2026-01-08
**Next Review:** Weekly on Mondays
