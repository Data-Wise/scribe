# Option 2: Create Clean Implementation Branch

## Create New Branch from Feat

```bash
cd /Users/dt/projects/dev-tools/scribe

# Create new branch from feat/mission-control-hud
git checkout -b feat/mission-sidebar-v2

# Verify you're on new branch
git branch --show-current
# Should output: feat/mission-sidebar-v2
```

## Strategy: Cherry-pick Working Code

### 1. Identify What Works

Test current implementation:
```bash
npm run dev
```

Document what works vs what needs fixing.

### 2. Create Clean Commits

```bash
# Reset to feat base (preserves working directory)
git reset feat

# Stage and commit files one feature at a time

# Commit 1: Core sidebar structure
git add src/renderer/src/components/sidebar/MissionSidebar.tsx
git add src/renderer/src/store/useAppViewStore.ts
git commit -m "feat: add Mission Sidebar core structure"

# Commit 2: Icon mode
git add src/renderer/src/components/sidebar/IconBarMode.tsx
git add src/renderer/src/components/sidebar/StatusDot.tsx
git commit -m "feat: add icon mode (48px)"

# Commit 3: Compact mode
git add src/renderer/src/components/sidebar/CompactListMode.tsx
git commit -m "feat: add compact mode (240px)"

# Commit 4: Card mode
git add src/renderer/src/components/sidebar/CardViewMode.tsx
git commit -m "feat: add card mode (320px)"

# Commit 5: Integration
git add src/renderer/src/App.tsx
git commit -m "feat: integrate Mission Sidebar into App"

# Commit 6: Styling
git add src/renderer/src/index.css
git commit -m "style: add Mission Sidebar CSS"

# Commit 7: Settings
git add src/renderer/src/components/SettingsModal.tsx
git commit -m "feat: add sidebar mode controls to Settings"

# Commit remaining files
git add -A
git commit -m "chore: update tests and config"
```

### 3. Push New Branch

```bash
git push origin feat/mission-sidebar-v2
```

## Benefits

✅ Clean git history  
✅ Easier to review  
✅ Can cherry-pick specific commits  
✅ Original branch preserved as backup
