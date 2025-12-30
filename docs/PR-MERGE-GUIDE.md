# PR Merge Guide: Mission Control HUD

> **Document Created:** 2025-12-30
> **Branch:** `feat/mission-control-hud`
> **Target:** `dev` (never merge directly to `main`)

---

## Executive Summary

| PR | Branch | Status | Action |
|----|--------|--------|--------|
| **#4** | `feat/mission-control-hud` | ✅ Ready | Merge first |
| **#3** | `wonderful-wilson` | ❌ 20 conflicts | Cherry-pick after #4 |

**Key Rule:** All PRs target `dev` branch. Never merge directly to `main`.

---

## Part 1: Merge PR #4 (Mission Control HUD)

### Pre-Merge Checklist

- [x] All 207 E2E tests passing
- [x] All 26 unit tests passing
- [x] No merge conflicts with `dev`
- [x] Documentation updated
- [x] PR targets `dev` branch

### Merge Instructions

```bash
# 1. Ensure you're on dev branch
git checkout dev
git pull origin dev

# 2. Merge PR #4
git merge --no-ff feat/mission-control-hud -m "Merge PR #4: Mission Control HUD - Tab System & Right Sidebar"

# 3. Push to remote
git push origin dev

# 4. Verify tests still pass
npm test
npm run test:e2e
```

### Alternative: Merge via GitHub

```bash
gh pr merge 4 --merge --delete-branch
```

### Post-Merge Verification

```bash
# Run full test suite
npm test && npm run test:e2e

# Check for TypeScript errors
npm run typecheck

# Verify app runs
npm run dev:vite
```

---

## Part 2: Handle PR #3 (VaultTreeView)

### Why Not Direct Merge?

PR #3 has **20 conflicting files** with `dev` after PR #4 is merged:

```
.STATUS                              CHANGELOG.md
CLAUDE.md                            App.tsx
Sidebar.test.tsx                     ClaudePanel.tsx
SettingsModal.tsx                    CardViewMode.tsx
CompactListMode.tsx                  MissionSidebar.tsx
index.css                            api.ts
useAppViewStore.ts                   types/index.ts
+ 6 more files
```

### Recommended Approach: Cherry-Pick Useful Components

Instead of rebasing (complex), cherry-pick the unique valuable components.

---

## Part 3: Cherry-Pick Plan

### Components to Extract from PR #3

| Component | File | Priority | Reason |
|-----------|------|----------|--------|
| VaultTreeView | `components/sidebar/VaultTreeView.tsx` | ⭐ High | Unique Obsidian-style tree |
| NotesListPanel | `components/sidebar/NotesListPanel.tsx` | ⭐ High | List/tree toggle |
| InboxPanel | `components/sidebar/InboxPanel.tsx` | ⭐ High | Quick capture inbox |
| TrashPanel | `components/sidebar/TrashPanel.tsx` | Medium | Trash management |
| PinnedNotes | `components/PinnedNotes.tsx` | Medium | Pinned notes feature |
| QuickCaptureInbox | `components/QuickCaptureInbox.tsx` | Medium | Capture UI |

### Components to Skip (Superseded by PR #4)

| Component | Reason |
|-----------|--------|
| `tabs/Tab.tsx`, `TabBar.tsx` | PR #4 has better `EditorTabs` |
| `RightSidebarTabs.tsx` | PR #4 has configurable sidebar tabs |
| `ClaudePanel.tsx` | PR #4 has enhanced version + chat |

### Cherry-Pick Instructions

After PR #4 is merged:

```bash
# 1. Create new branch from dev
git checkout dev
git pull origin dev
git checkout -b feat/vault-tree-view

# 2. Cherry-pick VaultTreeView commit
git cherry-pick 00824ff --no-commit

# 3. If conflicts, resolve manually:
#    - Keep PR #4's version of shared files
#    - Only add new VaultTreeView files

# 4. Add only the new component files
git add src/renderer/src/components/sidebar/VaultTreeView.tsx
git add src/renderer/src/__tests__/VaultTreeView.test.tsx

# 5. Commit
git commit -m "feat: Add VaultTreeView from PR #3 (cherry-picked)"

# 6. Push and create PR
git push -u origin feat/vault-tree-view
gh pr create --base dev --title "feat: Add VaultTreeView component"
```

### Integration Steps After Cherry-Pick

1. **Import VaultTreeView** in NotesListPanel or sidebar
2. **Add toggle** for List/Tree view
3. **Update tests** to cover integration
4. **Update CHANGELOG**

---

## Part 4: Feature Comparison Reference

### What PR #4 Provides (Merged First)

| Category | Features |
|----------|----------|
| **Tab System** | Pill tabs, drag reorder, context menu, smart truncation |
| **Tab Styling** | 3 bar styles, 3 border styles, 3 emphasis styles |
| **Right Sidebar** | 5 tabs (Properties, Backlinks, Tags, Stats, Claude) |
| **Sidebar Settings** | Tab size, visibility, drag reorder, context menu |
| **Claude Integration** | Claude tab, Quick Chat popover (⌘I) |
| **Stats** | Word count, reading time, Flesch readability |
| **Persistence** | All settings persist via localStorage |
| **Tests** | 207 E2E + 26 unit tests |

### What PR #3 Would Add (Cherry-Pick)

| Category | Features |
|----------|----------|
| **VaultTreeView** | Obsidian-style hierarchical file tree |
| **Tree/List Toggle** | Switch between tree and list views |
| **Inbox Panel** | Quick capture inbox |
| **Trash Panel** | View and restore deleted notes |
| **Pinned Notes** | Pin notes for quick access |

---

## Part 5: Conflict Resolution Guide

If you choose to rebase PR #3 instead of cherry-picking:

### Files to Keep from PR #4 (dev)

```
src/renderer/src/App.tsx                    → Keep PR #4
src/renderer/src/components/SettingsModal.tsx → Keep PR #4
src/renderer/src/components/ClaudePanel.tsx  → Keep PR #4
src/renderer/src/store/useAppViewStore.ts   → Keep PR #4
src/renderer/src/lib/preferences.ts         → Keep PR #4
src/renderer/src/index.css                  → Merge carefully
```

### Files to Keep from PR #3

```
src/renderer/src/components/sidebar/VaultTreeView.tsx → Keep PR #3
src/renderer/src/components/sidebar/NotesListPanel.tsx → Keep PR #3
src/renderer/src/components/sidebar/InboxPanel.tsx    → Keep PR #3
src/renderer/src/components/sidebar/TrashPanel.tsx    → Keep PR #3
```

### Rebase Commands (Advanced)

```bash
git checkout wonderful-wilson
git fetch origin dev
git rebase origin/dev

# Resolve each conflict:
# - Accept "theirs" for shared infrastructure files
# - Accept "ours" for unique VaultTreeView files

git rebase --continue
# Repeat until complete

git push --force-with-lease origin wonderful-wilson
```

---

## Part 6: Post-Merge Checklist

After all merges complete:

- [ ] All tests pass (`npm test && npm run test:e2e`)
- [ ] App launches correctly (`npm run dev:vite`)
- [ ] Settings persist after refresh
- [ ] Tab system works (drag, context menu, styles)
- [ ] Right sidebar works (all 5 tabs)
- [ ] VaultTreeView displays (if cherry-picked)
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] Update CHANGELOG.md
- [ ] Update version in package.json if needed

---

## Part 7: Branch Workflow

```
main (production - protected)
  │
  └── dev (integration)
        │
        ├── feat/mission-control-hud (PR #4) ──► Merge to dev ✓
        │
        ├── wonderful-wilson (PR #3) ──► Close or cherry-pick
        │
        └── feat/vault-tree-view (new) ──► Cherry-picked components
```

### Golden Rules

1. **Never merge to main directly** - All PRs go through `dev`
2. **Always rebase/update from dev** before creating PR
3. **Run tests before merging** - 233 tests must pass
4. **Update documentation** - CHANGELOG, README badges

---

## Appendix: Quick Commands

```bash
# Check PR status
gh pr list --state open

# View PR details
gh pr view 4
gh pr view 3

# Merge PR #4 via CLI
gh pr merge 4 --merge

# Close PR #3 (if superseded)
gh pr close 3 --comment "Superseded by PR #4. Useful components will be cherry-picked."

# Create new PR for cherry-picked features
gh pr create --base dev --title "feat: Add VaultTreeView" --body "Cherry-picked from PR #3"
```

---

*Document generated by Claude Code on 2025-12-30*
