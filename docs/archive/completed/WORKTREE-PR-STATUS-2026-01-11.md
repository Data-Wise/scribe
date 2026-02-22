# Scribe Git Worktree & PR Status

**Generated:** 2026-01-11
**Current Branch:** dev (9183c8d)
**Last Merge:** PR #34 - Icon-Centric Sidebar v1.16.0

---

## 📊 Repository Overview

```
scribe (main repo - dev branch)
├── Worktree 1: quarto-v115     [PR #32 - CONFLICTS]
├── Worktree 2: settings        [STALE - 176 behind]
├── Worktree 3: ai-integration  [Planning/Docs]
└── Worktree 4: latex-v2        [Planning/Docs]
```

---

## 🔴 Open Pull Request

### PR #32: Sprint 35 - Store Coverage & E2E Infrastructure

**Status:** ⚠️ **MERGE CONFLICTS** (cannot auto-merge)

| Metric | Value |
|--------|-------|
| **Branch** | feat/quarto-v115 |
| **Base** | dev |
| **Changes** | +25,341 / -1,145 lines |
| **Commits** | 73 ahead, 93 behind dev |
| **Mergeable** | ❌ NO |
| **Remote** | ✅ Tracked (origin/feat/quarto-v115) |

**Key Deliverables:**
- ✅ CodeMirrorHelper E2E infrastructure (269 lines, 20+ methods)
- ✅ useAppViewStore comprehensive tests (54/54 passing, ~90% coverage)
- ✅ E2E spec file migrations (3 files: callouts, editor-modes, latex-multiline)
- ✅ 2,399 unit tests (+159 from baseline)
- ✅ TypeScript: 0 errors
- ⚠️ E2E pass rate: 30% (25/83 passing - infrastructure works, optimization deferred)

**Conflict Analysis:**
- **Root Cause:** v1.16.0 merged major sidebar architecture rewrite to dev
- **Conflicting Files (9):**
  1. `.STATUS` - Version/sprint metadata
  2. `src-tauri/src/database.rs` - Backend changes
  3. `src/renderer/src/App.tsx` - Sidebar integration
  4. `src/renderer/src/store/useAppViewStore.ts` - **MAJOR** (700+ line conflict)
  5. `src/renderer/src/components/HybridEditor.tsx`
  6. `src/renderer/src/lib/browser-db.ts`
  7. `src/renderer/src/lib/seed-data.ts`
  8. `src/renderer/src/__tests__/BrowserDb.test.ts`
  9. `src/renderer/src/__tests__/WikiLinkNavigation.test.tsx`

**Architecture Incompatibility:**

| Component | feat/quarto-v115 (Sprint 35) | dev (v1.16.0) |
|-----------|------------------------------|---------------|
| Sidebar State | `sidebarMode: 'icon'\|'compact'\|'card'` | `expandedIcon: {type, id} \| null` |
| Mode Control | `cycleSidebarMode()` | `expandVault()`, `expandSmartIcon()` |
| Architecture | Global mode (all icons same) | Per-icon expansion (independent) |

---

## 📂 Active Worktrees

### 1️⃣ quarto-v115 (Sprint 35 - E2E Infrastructure)

| Property | Value |
|----------|-------|
| **Location** | `~/.git-worktrees/scribe/quarto-v115` |
| **Branch** | `feat/quarto-v115` |
| **Commit** | `4c7ffaf` |
| **Remote** | ✅ `origin/feat/quarto-v115` (tracked) |
| **Divergence** | 73 ahead, 93 behind dev |
| **PR** | #32 (open, has conflicts) |
| **Status** | 🔴 **BLOCKED** - Needs cherry-pick strategy |

**Purpose:** E2E testing infrastructure + Zustand store coverage

**Key Commits:**
- `2fd9f66` - E2E Phase 3 infrastructure fixes
- `dff48f4` - useAppViewStore comprehensive test suite
- `4949768` - E2E Phase 3 documentation

---

### 2️⃣ settings (Settings Enhancement - Phase 3)

| Property | Value |
|----------|-------|
| **Location** | `~/.git-worktrees/scribe/settings` |
| **Branch** | `feat/settings-phase-3-polish` |
| **Commit** | `d98efeb` |
| **Remote** | ✅ `origin/feat/settings-phase-3-polish` (tracked) |
| **Divergence** | 0 ahead, 176 behind dev |
| **Status** | 🟡 **STALE** - Very outdated |

**Purpose:** Settings UI polish (appears inactive/abandoned)

**Recommendation:**
- Delete worktree if no longer needed
- OR rebase onto dev if still relevant

---

### 3️⃣ ai-integration (AI Features Planning)

| Property | Value |
|----------|-------|
| **Location** | `~/.git-worktrees/scribe/ai-integration` |
| **Branch** | `feat/ai-integration` |
| **Commit** | `1338134` |
| **Remote** | ❌ Local only (not pushed) |
| **Divergence** | 0 ahead, 91 behind dev |
| **Status** | 🟢 **PLANNING** - Documentation branch |

**Purpose:** AI sidebar/chat implementation planning

**Content:** Documentation, roadmaps, specs for future AI features

---

### 4️⃣ latex-v2 (LaTeX Editor v2.0)

| Property | Value |
|----------|-------|
| **Location** | `~/.git-worktrees/scribe/latex-v2` |
| **Branch** | `feat/latex-editor-v2` |
| **Commit** | `f1f7c48` |
| **Remote** | ❌ Local only (not pushed) |
| **Divergence** | 1 ahead, 93 behind dev |
| **Status** | 🟢 **PLANNING** - Documentation branch |

**Purpose:** v2.0 full LaTeX mode planning (Overleaf-like experience)

**Content:** Specs, roadmap, architecture docs for future v2.0 feature

---

### 5️⃣ Main Repository

| Property | Value |
|----------|-------|
| **Location** | `~/projects/dev-tools/scribe` |
| **Branch** | `dev` |
| **Commit** | `9183c8d` (latest) |
| **Remote** | ✅ `origin/dev` (up to date) |
| **Status** | 🟢 **ACTIVE** - Primary development |

**Recent Merges:**
- PR #34 - v1.16.0 Icon-Centric Sidebar (merged 2026-01-10)
- PR #31 - v1.15.0 Sidebar Mode Consolidation (merged earlier)

---

## 🎯 Recommended Actions

### Priority 1: Resolve PR #32 (Sprint 35)

**Problem:** Cannot merge due to v1.16.0 sidebar architecture conflicts

**Solution:** Cherry-pick strategy (1-2 hours)

```bash
# Step 1: Create fresh branch from dev
cd ~/projects/dev-tools/scribe
git checkout dev
git pull origin dev
git checkout -b feat/sprint-35-e2e

# Step 2: Cherry-pick E2E infrastructure commits
git cherry-pick 2fd9f66  # E2E Phase 3 infrastructure
git cherry-pick dff48f4  # useAppViewStore tests

# Step 3: Fix any conflicts (update for v1.16.0)
# - Update useAppViewStore tests for new icon-centric API
# - Fix any test references to old sidebarMode state

# Step 4: Test
npm test
npm run typecheck

# Step 5: Push and create new PR
git push -u origin feat/sprint-35-e2e
gh pr create --base dev --title "Sprint 35: E2E Infrastructure (Clean Merge)" \
  --body "Cherry-picked from feat/quarto-v115, updated for v1.16.0 architecture"

# Step 6: Close old PR #32
gh pr close 32 --comment "Replaced by new PR with clean v1.16.0 integration"
```

**Why This Works:**
- ✅ Avoids complex merge conflicts
- ✅ Clean separation of E2E work from outdated sidebar code
- ✅ Integrates with v1.16.0 architecture from the start
- ✅ Preserves valuable E2E infrastructure and tests

---

### Priority 2: Clean Up Stale Worktrees

#### Option A: Remove settings worktree (if abandoned)

```bash
# Check if any valuable work exists
cd ~/.git-worktrees/scribe/settings
git log --oneline -10

# If nothing important, remove
git worktree remove ~/.git-worktrees/scribe/settings
git branch -D feat/settings-phase-3-polish

# Delete remote branch if exists
git push origin --delete feat/settings-phase-3-polish
```

#### Option B: Keep planning worktrees

ai-integration and latex-v2 are just documentation - keep as reference.

---

### Priority 3: Update Worktree Documentation

After cleanup:

```bash
# Update worktree list in CLAUDE.md
# Document only active worktrees:
# - quarto-v115 (or sprint-35-e2e after cherry-pick)
# - ai-integration (planning)
# - latex-v2 (planning)
```

---

## 📈 Branch Health Summary

| Branch | Health | Priority | Action |
|--------|--------|----------|--------|
| **dev** | 🟢 Excellent | Active | Keep updated |
| **feat/quarto-v115** | 🔴 Blocked | P0 | Cherry-pick → new PR |
| **feat/settings-phase-3-polish** | 🟡 Stale | P2 | Delete or rebase |
| **feat/ai-integration** | 🟢 Good | P3 | Keep for reference |
| **feat/latex-editor-v2** | 🟢 Good | P3 | Keep for reference |

---

## 🔍 Next Steps

1. **Immediate (Today):**
   - [ ] Execute cherry-pick strategy for Sprint 35 E2E work
   - [ ] Close PR #32
   - [ ] Open new clean PR

2. **Short-term (This Week):**
   - [ ] Decide on settings worktree (keep/delete)
   - [ ] Update CLAUDE.md worktree documentation
   - [ ] Review and merge new E2E PR

3. **Medium-term (Next Sprint):**
   - [ ] Begin Sprint 36 work (Accessibility, Theme Detection, CI/CD)
   - [ ] Consider v1.17.0 Three-Tab Sidebar (spec complete)

---

**Generated with Claude Code** 🤖
