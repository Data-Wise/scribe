# Fix: Sidebar Vault Expansion & Breadcrumb Bugs

> **Branch:** `fix/sidebar-vault-expansion`
> **Base:** `dev`
> **Worktree:** `~/.git-worktrees/scribe/fix-sidebar-vault-expansion`

## Objective

Fix two related bugs in the sidebar where clicking a pinned vault dot shows the wrong content and the breadcrumb is stuck on "Research".

## Bugs

### Bug 1: ExpandedIconPanel shows all projects for vault dots

**File:** `src/renderer/src/components/sidebar/ExpandedIconPanel.tsx:92-97`

When a pinned vault dot is clicked, `filteredProjects` is set to ALL projects instead of filtering to just the clicked project. The panel title is correct but the content lists every project, with Research appearing first.

```typescript
// CURRENT (broken) — line 92-97
// Pinned project: Show all projects with this one selected
return {
  label: projects.find(p => p.id === expandedIcon.id)?.name || 'Project',
  showInboxNotes: false,
  filteredProjects: projects  // ← BUG: should filter to just this project
}
```

**Fix:** Filter `filteredProjects` to only the expanded project:
```typescript
filteredProjects: projects.filter(p => p.id === expandedIcon.id)
```

### Bug 2: Breadcrumb stuck on "Research" — vault toggle doesn't update currentProjectId

**File:** `src/renderer/src/components/sidebar/MissionSidebar.tsx` (or wherever `onToggleVault` is handled)

The breadcrumb in `App.tsx:1250-1258` renders `currentProjectId` from `useProjectStore`. When a vault dot is clicked, `onToggleVault` only toggles the sidebar expansion state — it never calls `setCurrentProject()`. So `currentProjectId` stays stuck on whatever was auto-selected on first load (the "Research" project created by `useProjectStore.ts:70`).

**Fix:** When expanding a vault (not collapsing), also call `setCurrentProject(id)` so the breadcrumb, search scope, and new-note assignment all update to match.

### Bug 3 (cosmetic): DexieError2 console errors

**Files:** `browser-db.ts:266-269`, `browser-api.ts:678-680`

Both files auto-initialize on import, racing each other. Non-blocking but noisy.

**Fix:** Guard the second initializer or deduplicate. Lower priority — cosmetic only.

## Implementation Order

| Step | Task | Files | Priority |
|------|------|-------|----------|
| 1 | Filter vault expansion to single project | `ExpandedIconPanel.tsx` | High |
| 2 | Wire vault toggle to setCurrentProject | `MissionSidebar.tsx` or `App.tsx` | High |
| 3 | Add/update tests for both fixes | `ExpandedIconPanel.*.test.tsx`, `MissionSidebar.test.tsx` | High |
| 4 | Deduplicate Dexie init (optional) | `browser-db.ts`, `browser-api.ts` | Low |
| 5 | Verify in Desktop Preview | — | High |

## Acceptance Criteria

- [ ] Clicking a vault dot shows ONLY that project's notes in the expanded panel
- [ ] Clicking a vault dot updates the breadcrumb to show that project's name
- [ ] Search modal scope updates when vault is toggled
- [ ] Smart icons continue to filter correctly (no regression)
- [ ] Inbox continues to show unassigned notes (no regression)
- [ ] Existing tests pass
- [ ] New tests cover vault expansion filtering

## How to Start

```bash
cd ~/.git-worktrees/scribe/fix-sidebar-vault-expansion
claude
```
