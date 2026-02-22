# Sidebar v2 Enhancement Plan

> **Branch:** `feat/sidebar-v2`
> **Worktree:** `~/.git-worktrees/scribe/sidebar-v2`
> **Base:** `dev` branch
> **Created:** 2026-01-08
> **Status:** Ready to start

---

## Overview

**Goal:** Complete left sidebar redesign (Plan B) with Obsidian-style vault navigation and enhanced UX.

**Current State:**
- ✅ Phase 1 Complete: Editor Tabs with gradient accent
- ⏳ Phase 2-4 Pending: Vault Sidebar, Status Bar, Mission Control updates

**Design Document:** `docs/SCHEMATIC-LEFT-SIDEBAR-REDESIGN.md`

---

## Phase 2: Vault Sidebar (4-6 hours)

**Status:** 📋 Ready to implement

### Terminology Changes

**Rename Throughout Codebase:**
- "Projects" → "Vaults"
- "Project Switcher" → "Vault Navigator"
- `useProjectStore` → Keep internal name, update UI labels
- Database: Keep `projects` table, update UI only

### Component Architecture

**New Component:** `VaultSidebar.tsx` (300-400 lines)

```typescript
interface VaultSidebarProps {
  mode: 'icon' | 'compact' | 'card'
  width: number
  onWidthChange: (width: number) => void
}

// Obsidian-style tree structure:
<VaultSidebar mode={sidebarMode} width={sidebarWidth}>
  <VaultTree>
    <PermanentVault name="Inbox" icon="📥" />
    <VaultSection title="My Vaults">
      <Vault name="Research" icon="🔬" expanded>
        <Folder name="Methods" />
        <Folder name="Literature" />
        <Note title="Draft.md" />
      </Vault>
      <Vault name="Teaching" icon="📚" collapsed />
      <Vault name="Writing" icon="📝" collapsed />
    </VaultSection>
  </VaultTree>
</VaultSidebar>
```

### Features to Implement

**1. Permanent Inbox Vault (1 hour)**
- [ ] Special vault type that cannot be deleted
- [ ] Always appears first in vault list
- [ ] Default vault for quick capture notes
- [ ] Badge showing unprocessed note count

**2. Collapsible Vault Sections (1-2 hours)**
- [ ] Click vault name to expand/collapse
- [ ] Persist expansion state in localStorage
- [ ] Accordion behavior (one vault expanded at a time) - Optional
- [ ] Smooth CSS transitions

**3. Folder Tree (1-2 hours)**
- [ ] Database: Add `folders` table and `note.folder_id`
- [ ] Nested folder support (unlimited depth)
- [ ] Create/rename/delete folders
- [ ] Drag notes between folders
- [ ] Folder icons and colors

**4. Vault Actions (30 minutes)**
- [ ] Right-click context menu on vaults
- [ ] Actions: Rename, Change Icon, Change Color, Delete
- [ ] Confirmation dialogs for destructive actions
- [ ] Edit Vault modal (reuse EditProjectModal, rename to EditVaultModal)

**5. Note Management (30 minutes)**
- [ ] Click note to open in editor
- [ ] Right-click note for actions (Open, Rename, Move, Delete)
- [ ] Drag-and-drop notes between folders/vaults
- [ ] Visual indicator for currently open note

**6. Search & Filter (30 minutes)**
- [ ] Search bar at top of sidebar (⌘⇧F)
- [ ] Filter notes by vault, folder, tag
- [ ] Recent notes quick access

### Database Schema Changes

**Migration 010: Folders Support**

```sql
-- Add folders table
CREATE TABLE IF NOT EXISTS folders (
    id TEXT PRIMARY KEY,
    vault_id TEXT NOT NULL,
    parent_folder_id TEXT,  -- NULL for root folders
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (vault_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_folder_id) REFERENCES folders(id) ON DELETE CASCADE
);

-- Add folder support to notes
ALTER TABLE notes ADD COLUMN folder_id TEXT REFERENCES folders(id) ON DELETE SET NULL;
```

### UI Modes

**Icon Mode (48px):**
```
┌────┐
│ 📥 │  ← Inbox
│ 🔬 │  ← Research (active)
│ 📚 │  ← Teaching
│ 📝 │  ← Writing
│ +  │  ← New Vault
└────┘
```

**Compact Mode (240px):**
```
┌──────────────┐
│ 📥 Inbox (3) │
│ ▼ 🔬 Research │
│   📁 Methods │
│   📄 Draft   │
│ ▶ 📚 Teaching │
│ ▶ 📝 Writing │
│ + New Vault  │
└──────────────┘
```

**Card Mode (320px+):**
```
┌────────────────────┐
│ 📥 Inbox           │
│ 3 unprocessed      │
├────────────────────┤
│ ▼ 🔬 Research      │
│    5 notes, 2.4k   │
│   📁 Methods       │
│     📄 Draft.md    │
│     📄 Stats.md    │
│   📁 Literature    │
│ ▶ 📚 Teaching      │
│    12 notes        │
│ ▶ 📝 Writing       │
│    8 notes         │
├────────────────────┤
│ + New Vault        │
└────────────────────┘
```

### Tests

**Unit Tests (30-40 tests):**
- VaultSidebar component rendering
- Expand/collapse behavior
- Folder tree traversal
- Drag-and-drop logic
- Search and filter

**E2E Tests (15-20 tests):**
- Create/rename/delete vaults
- Create/rename/delete folders
- Move notes between folders
- Vault expansion state persistence
- Search functionality

---

## Phase 3: Status Bar (2-3 hours)

**Status:** 📋 Planned after Phase 2

### Component Architecture

**New Component:** `StatusBar.tsx` (150-200 lines)

```typescript
<StatusBar position="bottom">
  <StatusLeft>
    <SyncStatus />      {/* ● Online / ○ Offline */}
    <Streak />          {/* 🔥 5 days */}
    <WordsToday />      {/* 📊 347 words */}
  </StatusLeft>

  <StatusCenter>
    <SessionTimer />    {/* ⏱️ 24:15 */}
  </StatusCenter>

  <StatusRight>
    <EditorMode />      {/* Source | Live | Reading */}
    <WordCount />       {/* 2,450 words */}
    <ZoomLevel />       {/* 100% */}
  </StatusRight>
</StatusBar>
```

### Features

**1. Sync Status Indicator (30 minutes)**
- [ ] Green dot (●) when online
- [ ] Gray dot (○) when offline
- [ ] Tooltip shows last sync time
- [ ] Click to force sync (if Obsidian sync enabled)

**2. Streak Display (30 minutes)**
- [ ] Fire emoji 🔥 + number of days
- [ ] Tooltip shows streak history
- [ ] Click to view detailed stats
- [ ] Celebration animation on milestone

**3. Words Today (30 minutes)**
- [ ] Chart emoji 📊 + word count
- [ ] Only counts words added today
- [ ] Tooltip shows daily goal progress
- [ ] Color changes based on goal (red < 50%, yellow 50-99%, green 100%+)

**4. Session Timer (existing)**
- [ ] Already implemented in top status bar
- [ ] Move to bottom center for better visibility
- [ ] Keep pause/resume functionality

**5. Editor Mode Indicator (15 minutes)**
- [ ] Shows current mode: Source | Live | Reading
- [ ] Click to cycle modes (⌘E)
- [ ] Visual indicator (icon + text)

**6. Word Count (existing)**
- [ ] Already implemented
- [ ] Move to bottom right
- [ ] Keep current formatting

**7. Zoom Level (15 minutes)**
- [ ] Shows current zoom percentage
- [ ] Click to adjust (90%, 100%, 110%, 125%, 150%)
- [ ] Keyboard shortcuts: ⌘+ / ⌘- / ⌘0

### Layout

**Bottom Horizontal Bar (30px height):**
```
┌─────────────────────────────────────────────────────────────┐
│ ● 🔥 5   📊 347   │   ⏱️ 24:15   │   Source   2,450 words   100% │
└─────────────────────────────────────────────────────────────┘
```

**Draggable Resize Handle:** Top edge of status bar

---

## Phase 4: Mission Control Updates (3-4 hours)

**Status:** 📋 Planned after Phase 3

### Updates to Mission Control Dashboard

**Goal:** Adapt dashboard for new vault-based navigation

**1. Quick Actions Row (1 hour)**
```
┌─────────────────────────────────────────────────────────────┐
│  [📅 Today]  [📝 New Page]  [⚡ Capture]  [📁 New Vault]     │
└─────────────────────────────────────────────────────────────┘
```

- [ ] Replace "New Project" with "New Vault"
- [ ] Add keyboard shortcuts to buttons (⌘D, ⌘N, ⌘⇧C, ⌘⇧V)
- [ ] Hover states and tooltips

**2. Inbox Preview (1-2 hours)**
```
┌─────────────────────────────────────────────────────────────┐
│  📥 Inbox (3 unprocessed)                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Quick thought about research design                  │   │
│  │ Meeting notes - Friday                               │   │
│  │ Todo: Follow up with collaborator                    │   │
│  └──────────────────────────────────────────────────────┘   │
│  [Process Inbox →]                                           │
└─────────────────────────────────────────────────────────────┘
```

- [ ] Show first 3-5 unprocessed inbox notes
- [ ] Click note to open
- [ ] "Process Inbox" button opens inbox vault
- [ ] Badge shows total unprocessed count

**3. Active Vaults Section (1 hour)**
```
┌─────────────────────────────────────────────────────────────┐
│  Active Vaults                                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ 🔬 Research │  │ 📚 Teaching │  │ 📝 Writing │            │
│  │ 5 notes    │  │ 12 notes   │  │ 8 notes    │            │
│  │ Modified 2h│  │ Modified 1d│  │ Modified 3d│            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

- [ ] Show vaults with recent activity
- [ ] Click vault card to navigate
- [ ] Visual indicator for active vault
- [ ] Last modified time

**4. Recent Notes (existing)**
- [ ] Keep existing Recent Notes section
- [ ] Add vault badges to each note
- [ ] Filter by vault dropdown

**5. Writing Stats Panel (30 minutes)**
```
┌─────────────────────────────────────────────────────────────┐
│  Today: 347 words  │  This Week: 1,842 words  │  Streak: 🔥 5│
│  Goal: 500 words   │  Avg: 263 words/day      │  Total: 12.4k│
└─────────────────────────────────────────────────────────────┘
```

- [ ] Daily/weekly/monthly stats
- [ ] Progress towards goals
- [ ] Visual progress bars

---

## Implementation Order

**Recommended Sequence:**

1. **Phase 2: Vault Sidebar** (4-6 hours)
   - Most impactful change
   - Foundation for other phases
   - Start: Rename Projects → Vaults UI
   - Then: Implement folder tree
   - Finally: Inbox vault + actions

2. **Phase 3: Status Bar** (2-3 hours)
   - Independent of Phase 2
   - Can be implemented in parallel
   - Move existing components to bottom
   - Add new indicators

3. **Phase 4: Mission Control** (3-4 hours)
   - Depends on Phase 2 (vault terminology)
   - Polish and integration
   - Inbox preview requires Phase 2 complete

**Total Effort:** 9-13 hours across 3 phases

---

## Testing Strategy

**Unit Tests (~70-80 tests):**
- VaultSidebar: 30-40 tests
- StatusBar: 20-25 tests
- Mission Control updates: 20-25 tests

**E2E Tests (~40-50 tests):**
- Vault navigation: 15-20 tests
- Folder management: 10-15 tests
- Status bar interactions: 5-10 tests
- Mission Control workflows: 10-15 tests

**Visual Regression:** Playwright screenshots before/after

---

## Release Strategy

**When All Phases Complete:**

1. **Merge to dev:**
   ```bash
   cd ~/.git-worktrees/scribe/sidebar-v2
   git checkout dev
   git merge feat/sidebar-v2 --no-ff -m "Merge Sidebar v2 Enhancement"
   git push origin dev
   ```

2. **Create PR to main:**
   ```bash
   gh pr create --base main --head dev --title "v1.16.0: Sidebar v2 Enhancement"
   ```

3. **After merge:**
   ```bash
   git checkout main && git pull
   git tag -a v1.16.0 -m "v1.16.0 - Sidebar v2 Enhancement"
   git push origin v1.16.0
   ```

4. **Update Homebrew formula**

---

## Design References

- **Plan B Schematic:** `docs/SCHEMATIC-LEFT-SIDEBAR-REDESIGN.md`
- **Activity Bar Proposal:** `docs/planning/PROPOSAL-activity-bar.md`
- **Mission Control Layouts:** `docs/MISSION-CONTROL-LAYOUTS.md`

---

## Notes

**ADHD Considerations:**
- Clear visual hierarchy (vaults → folders → notes)
- One thing at a time (accordion-style expansion)
- Quick access to Inbox (always visible)
- Visual progress indicators (badges, stats)
- Keyboard-first navigation

**Browser Mode:**
- All features work in browser (IndexedDB)
- No Tauri-specific dependencies
- Folder tree uses IndexedDB nested structure

---

**Created:** 2026-01-08
**Last Updated:** 2026-01-08
**Next Review:** After Phase 2 completion
