# Scribe Git Workflow

> **CRITICAL:** Protected main branch + feature branch workflow + git worktrees for parallel development

Last Updated: 2026-01-02

---

## Branch Structure (Protected Main)

```
main (protected) ← PR from dev only ← Tagged releases
  └── dev ← PR from feat/* only ← Integration branch
       └── feat/* ← Feature branches ← Active development
```

---

## Core Principles

1. **NEVER commit directly to main** - All changes via PR from dev
2. **NEVER commit directly to dev for features** - All features via PR from feat/* branches
3. **Always use feature branches** - Create `feat/feature-name` for all work
4. **Use worktrees for complex features** - When feature might interfere with other work
5. **PR flow:** `feat/* → dev → main`
6. **Tag releases** - Only on main after PR merge

---

## When to Use Worktrees

**Use worktrees when:**
- Complex features that take multiple sessions
- Parallel development on multiple features
- Long-running experiments
- When you need to switch contexts without losing work
- Feature might interfere with other ongoing work

**Don't use worktrees when:**
- Quick fixes or small changes
- Single-session features
- Simple bug fixes

---

## Standard Feature Development Workflow

### Option A: Simple Feature Branch (No Worktree)

```bash
# 1. Start new feature from dev
git checkout dev
git pull origin dev

# 2. Create feature branch
git checkout -b feat/feature-name

# 3. Work and commit
git add .
git commit -m "feat: description"

# 4. Push and create PR to dev
git push -u origin feat/feature-name
gh pr create --base dev --head feat/feature-name

# 5. After merge to dev, cleanup
git checkout dev
git pull origin dev
git branch -d feat/feature-name

# 6. When ready for release, PR dev → main
gh pr create --base main --head dev

# 7. Tag release on main
git checkout main && git pull
git tag -a v1.x.x -m "Release notes"
git push origin v1.x.x
```

---

## Worktree Feature Development Workflow

### Option B: Complex Feature with Worktree

```bash
# 1. Create feature branch with worktree
git worktree add ~/.git-worktrees/scribe/feature-name -b feat/feature-name dev

# 2. Work in worktree directory
cd ~/.git-worktrees/scribe/feature-name

# 3. Commit as you go
git add -A && git commit -m "feat: description"
git push -u origin feat/feature-name

# 4. When phase/feature complete, create PR
gh pr create --base dev --head feat/feature-name

# 5. After merge, cleanup OR continue
git checkout dev
git pull origin dev

# Option A: Remove worktree if done
git worktree remove ~/.git-worktrees/scribe/feature-name
git branch -d feat/feature-name

# Option B: Continue in worktree for next phase
cd ~/.git-worktrees/scribe/feature-name
# Branch still exists, worktree still active, continue work

# 6. When ready for release, PR dev → main
gh pr create --base main --head dev

# 7. Tag release on main
git checkout main && git pull
git tag -a v1.x.x -m "Release notes"
git push origin v1.x.x
```

### Worktree Naming Convention

- **Worktree directory:** Descriptive feature name (e.g., `settings`, `terminal`, `ai-chat`)
- **Git branch:** Prefixed with `feat/` (e.g., `feat/settings-enhancement`)

**Example:**
```bash
# Good naming
git worktree add ~/.git-worktrees/scribe/settings -b feat/settings-enhancement dev

# Bad naming (don't do this)
git worktree add ~/.git-worktrees/scribe/feat-settings -b settings-enhancement dev
```

---

## Worktree Management Commands

```bash
# List all worktrees
git worktree list

# Create new worktree with branch
git worktree add <path> -b <branch-name> <start-point>

# Remove worktree
git worktree remove <path>

# Remove worktree forcefully (if there are uncommitted changes)
git worktree remove <path> --force

# Prune stale worktree administrative files
git worktree prune
```

---

## Current Worktree Locations

**Base directory:** `~/.git-worktrees/scribe/`

**Active worktrees (as of 2026-01-02):**
```
/Users/dt/projects/dev-tools/scribe               → main (primary repo)
/Users/dt/.git-worktrees/scribe/settings          → feat/settings-phase-3-polish
/Users/dt/.git-worktrees/scribe/wonderful-wilson  → wonderful-wilson
```

---

## Syncing Branches

### When main gets ahead of dev (workflow violation recovery)

If commits were accidentally made directly to main:

```bash
# 1. Push main to origin (if not already pushed)
git checkout main
git push origin main

# 2. Sync dev with main
git checkout dev
git merge main --no-ff -m "Merge main into dev: sync branches"
git push origin dev

# 3. Create feature branch from synced dev
git checkout -b feat/feature-name dev
```

---

## Stash Management

### When to stash

- Switching branches with uncommitted changes
- Testing something quickly without committing
- Pulling updates with local changes

### Stash commands

```bash
# Stash current changes with message
git stash push -m "WIP: descriptive message"

# List all stashes
git stash list

# Show stash contents
git stash show -p stash@{0}

# Apply stash (keep in stash list)
git stash apply stash@{0}

# Pop stash (apply and remove from list)
git stash pop

# Drop specific stash
git stash drop stash@{2}

# Clear all stashes
git stash clear
```

### Stash cleanup strategy

Regularly review and clean up stale stashes:

```bash
# 1. List all stashes
git stash list

# 2. Check each stash
git stash show -p stash@{N} | head -30

# 3. Drop stale stashes from completed features
git stash drop stash@{N}

# Keep only recent/relevant stashes (< 3)
```

---

## Untracked Files Management

### Adding to .gitignore

Generated files and temporary documentation should be gitignored:

```gitignore
# Build artifacts
node_modules
dist
dist-electron
out
.vite

# Generated reports
coverage/
playwright-report/
test-results/

# Temporary documentation
*-TESTS-*.md
TESTING-GUIDE.md
TEST-SUMMARY-*.md
DELIVERY-SUMMARY.md

# OS files
.DS_Store
```

### Committing test files

Test files should be committed:

```bash
# Stage all test files
git add src/renderer/src/__tests__/

# Commit with descriptive message
git commit -m "test: Add comprehensive test suite (21 component tests)"
```

---

## Release Process

### 1. Prepare Release on dev

```bash
# 1. Ensure dev is up to date
git checkout dev
git pull origin dev

# 2. Update version numbers
# - package.json
# - src-tauri/Cargo.toml
# - src-tauri/tauri.conf.json

# 3. Update CHANGELOG.md

# 4. Commit version bump
git add .
git commit -m "chore: Prepare v1.x.x release"
git push origin dev
```

### 2. PR dev → main

```bash
# Create PR for release
gh pr create --base main --head dev \
  --title "Release v1.x.x" \
  --body "Release notes..."

# After approval, merge in GitHub UI
```

### 3. Tag Release

```bash
# Switch to main and pull
git checkout main
git pull origin main

# Create annotated tag
git tag -a v1.x.x -m "Release v1.x.x

- Feature 1
- Feature 2
- Bug fixes
"

# Push tag
git push origin v1.x.x

# Verify tag
git tag -l -n9 v1.x.x
```

### 4. GitHub Release

```bash
# Create GitHub release from tag
gh release create v1.x.x \
  --title "v1.x.x" \
  --notes-file RELEASE_NOTES.md \
  path/to/artifacts/*.dmg
```

---

## Common Scenarios

### Scenario 1: Start new feature

```bash
git checkout dev
git pull origin dev
git checkout -b feat/new-feature
# ... work ...
git commit -m "feat: implement new feature"
git push -u origin feat/new-feature
gh pr create --base dev --head feat/new-feature
```

### Scenario 2: Emergency hotfix on main

```bash
# Create hotfix branch from main
git checkout main
git checkout -b hotfix/critical-bug

# Fix and commit
git commit -m "fix: critical bug"

# PR to main (not dev!)
gh pr create --base main --head hotfix/critical-bug

# After merge, sync dev with main
git checkout dev
git merge main --no-ff -m "Merge hotfix into dev"
git push origin dev
```

### Scenario 3: Parallel feature development

```bash
# Feature A (worktree)
git worktree add ~/.git-worktrees/scribe/feature-a -b feat/feature-a dev
cd ~/.git-worktrees/scribe/feature-a
# ... work on feature A ...

# Feature B (separate worktree)
git worktree add ~/.git-worktrees/scribe/feature-b -b feat/feature-b dev
cd ~/.git-worktrees/scribe/feature-b
# ... work on feature B ...

# Switch between features by changing directories
cd ~/.git-worktrees/scribe/feature-a  # Work on A
cd ~/.git-worktrees/scribe/feature-b  # Work on B
```

### Scenario 4: Continue work after interruption

```bash
# Stash current work
git stash push -m "WIP: feature X implementation"

# Do other work
git checkout other-branch
# ... make changes ...
git commit -m "fix: other issue"

# Return to original work
git checkout original-branch
git stash pop
# Continue working
```

---

## Best Practices

### Commit Messages

Follow conventional commits:

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
test: Add tests
chore: Update dependencies
refactor: Refactor code
perf: Performance improvement
style: Code style changes
```

### Branch Naming

```
feat/feature-name       # New features
fix/bug-description     # Bug fixes
hotfix/critical-issue   # Emergency fixes
chore/task-description  # Maintenance
docs/documentation      # Documentation
```

### PR Titles

```
feat: Add browser mode polish
fix: Resolve editor theme issue
chore: Bump version to v1.11.0
docs: Update workflow documentation
```

---

## Troubleshooting

### Problem: Can't switch branches (uncommitted changes)

```bash
# Option 1: Commit changes
git commit -m "WIP: work in progress"

# Option 2: Stash changes
git stash push -m "WIP: description"

# Option 3: Force checkout (WARNING: loses changes)
git checkout -f branch-name
```

### Problem: Merge conflicts

```bash
# 1. Try to merge
git merge branch-name

# 2. Resolve conflicts in editor
# Look for <<<<<<< HEAD markers

# 3. Mark as resolved
git add .

# 4. Complete merge
git commit
```

### Problem: Accidentally committed to main

```bash
# If not pushed yet
git reset HEAD~1  # Undo commit, keep changes

# If already pushed (requires force push - use with caution!)
git reset --hard HEAD~1
git push --force origin main  # DANGEROUS - only if no one else has pulled

# Better: Revert the commit
git revert HEAD
git push origin main
```

### Problem: Worktree directory was deleted manually

```bash
# Prune stale worktree references
git worktree prune

# Verify worktrees
git worktree list
```

---

## Summary Checklist

**Before starting work:**
- [ ] Pull latest dev: `git checkout dev && git pull origin dev`
- [ ] Create feature branch: `git checkout -b feat/feature-name`
- [ ] OR create worktree: `git worktree add ~/.git-worktrees/scribe/name -b feat/name dev`

**While working:**
- [ ] Commit regularly with descriptive messages
- [ ] Push to origin to backup work: `git push -u origin feat/feature-name`
- [ ] Keep feature branch updated with dev: `git merge dev`

**When feature complete:**
- [ ] Create PR: `gh pr create --base dev --head feat/feature-name`
- [ ] Review and merge in GitHub
- [ ] Delete feature branch: `git branch -d feat/feature-name`
- [ ] Remove worktree: `git worktree remove ~/.git-worktrees/scribe/name`

**For release:**
- [ ] Update version numbers
- [ ] Update CHANGELOG.md
- [ ] PR dev → main
- [ ] Tag release on main
- [ ] Create GitHub release

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `git worktree list` | List all worktrees |
| `git stash list` | List all stashes |
| `git branch -a` | List all branches |
| `git status` | Check current branch status |
| `gh pr list --author @me` | List my PRs |
| `gh pr create --base dev --head feat/name` | Create PR to dev |

---

**Last Updated:** 2026-01-02
**Author:** DT
**Project:** Scribe v1.11.0+
