# Sprint 23: Mission Control & Native Menu Improvements

> **Goal:** Fix Mission Control usability issues and add native macOS menu

---

## Overview

| Field | Value |
|-------|-------|
| **Sprint** | 23 |
| **Focus** | Mission Control UX + Native Menu |
| **Version** | v1.4.0 |
| **Status** | Planning |
| **Created** | 2025-12-27 |

---

## Current Issues

### Issue 1: No "New Project" Button

**Problem:** Users can't create a new project from Mission Control. The only way is via ProjectSwitcher dropdown in the sidebar (hidden, hard to discover).

**Impact:** Major friction for new users, violates ADHD principle of "zero friction"

### Issue 2: No Native macOS Menu

**Problem:** The app has no File/Edit/View/Window/Help menus. Users can't:
- See available keyboard shortcuts in menus
- Access commands via menu bar
- Use standard macOS patterns (Edit → Undo, etc.)

**Impact:** Feels non-native, accessibility issues

### Issue 3: QuickActions Missing Key Actions

**Problem:** QuickActions only has: Daily Note, New Note, Quick Capture
**Missing:** New Project, Settings, Search, Focus Mode

### Issue 4: No Project Stats in Dashboard

**Problem:** ProjectCard doesn't show note count or word count per project

### Issue 5: Empty State is Weak

**Problem:** "No projects yet" message doesn't guide users to create one

---

## Proposals

### Proposal A: Quick Fixes Only (< 2 hours)

**Minimal changes to fix critical issues:**

| Task | Effort | Priority |
|------|--------|----------|
| Add "New Project" button to QuickActions | 15 min | P0 |
| Add "New Project" card in empty state | 15 min | P0 |
| Pass `onCreateProject` prop to MissionControl | 10 min | P0 |

**Pros:**
- Fastest path to usable
- Low risk
- No Rust changes

**Cons:**
- Doesn't address menu bar
- Doesn't add project stats

---

### Proposal B: Mission Control + Tauri Menu (4-6 hours)

**Fix Mission Control AND add native macOS menu:**

| Task | Effort | Priority |
|------|--------|----------|
| Add "New Project" to QuickActions | 15 min | P0 |
| Add Tauri menu system (File/Edit/View/Help) | 2 hours | P1 |
| Wire menu events to frontend | 1 hour | P1 |
| Add note/word count to ProjectCard | 30 min | P2 |
| Add "All Notes" pseudo-project | 30 min | P2 |

**Native Menu Structure:**
```
Scribe
├── About Scribe
├── Preferences... (⌘,)
├── Quit Scribe (⌘Q)

File
├── New Note (⌘N)
├── New Project (⌘⇧P) ← NEW
├── Daily Note (⌘D)
├── Open... (⌘O)
├── Search Notes (⌘F)
├── Export... (⌘E)

Edit
├── Undo (⌘Z)
├── Redo (⌘⇧Z)
├── Cut/Copy/Paste

View
├── Mission Control (⌘0)
├── Focus Mode (⌘⇧F)
├── Source Mode (⌘1)
├── Live Preview (⌘2)
├── Reading Mode (⌘3)
├── Toggle Sidebar (⌘\)

Window
├── Minimize (⌘M)
├── Close (⌘W)

Help
├── Keyboard Shortcuts (⌘?)
├── Documentation
├── GitHub Repository
```

**Pros:**
- Professional native feel
- Discoverable shortcuts
- Standard macOS patterns

**Cons:**
- Requires Rust changes
- More testing

---

### Proposal C: Full Dashboard Redesign (8-12 hours)

**Complete Mission Control overhaul with enhanced features:**

| Task | Effort | Priority |
|------|--------|----------|
| Everything from Proposal B | 4-6 hours | P0-P1 |
| Recent Notes section | 1 hour | P2 |
| Project stats (notes, words, last active) | 1 hour | P2 |
| Quick filters (Active/Archived/All) | 1 hour | P3 |
| Project search | 30 min | P3 |
| Drag-to-reorder projects | 2 hours | P4 |

**New Dashboard Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Mission Control                              [Settings] │
│ 5 projects • 42 notes                                   │
├─────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ │ Daily    │ │ New Note │ │ New      │ │ Quick    │    │
│ │ Note ⌘D  │ │    ⌘N    │ │ Project  │ │ Capture  │    │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
├─────────────────────────────────────────────────────────┤
│ Recent Notes                                            │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Daily 2025-12-27 • Research Project • 5m ago       │ │
│ │ Sprint 23 Planning • R Dev • 1h ago                │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Projects      [All ▾] [Search...]                       │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐  │
│ │ Research      │ │ Teaching      │ │ R Package     │  │
│ │ ● Research    │ │ ● Teaching    │ │ ● R Package   │  │
│ │ 12 notes      │ │ 8 notes       │ │ 5 notes       │  │
│ │ 4,521 words   │ │ 2,100 words   │ │ 890 words     │  │
│ │ 2h ago        │ │ 1d ago        │ │ 3d ago        │  │
│ └───────────────┘ └───────────────┘ └───────────────┘  │
│                                                         │
│ ┌───────────────────────────────────────────────────┐  │
│ │     + Create New Project                          │  │
│ │       Start organizing your notes                 │  │
│ └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Pros:**
- Complete, polished experience
- Stats help ADHD users see progress
- Recent notes reduce friction

**Cons:**
- Largest scope
- Needs backend for stats

---

## Recommended Path

**Start with Proposal B → Then Proposal C** (Full Implementation)

### Rationale:

1. **New Project button** is critical - users are stuck without it
2. **Native menu** makes app feel professional and discoverable
3. **Stats and Recent Notes** complete the dashboard experience
4. **8-12 hours total** - comprehensive improvement

### Implementation Order:

1. **Phase 1:** Quick Wins (New Project button) - 30 min
2. **Phase 2:** Tauri Menu System - 2-3 hours
3. **Phase 3:** Frontend Menu Handlers - 1 hour
4. **Phase 4:** Recent Notes section - 1 hour
5. **Phase 5:** Project Stats (notes, words) - 1 hour
6. **Phase 6:** Quick Filters & Polish - 1-2 hours

---

## Implementation Plan

### Phase 1: Quick Wins (30 min) ✅

1. **Add `onCreateProject` prop to MissionControl**
2. **Add "New Project" button to QuickActions**
3. **Add "Create Project" card to empty state**
4. **Add ⌘⇧P shortcut for New Project**

### Phase 2: Tauri Menu (2-3 hours)

1. **Add menu plugin to Cargo.toml**
2. **Build menu structure in lib.rs:**
   - Scribe menu (About, Preferences, Quit)
   - File menu (New Note, New Project, Daily Note, Search, Export)
   - Edit menu (Undo, Redo, Cut, Copy, Paste, Select All)
   - View menu (Mission Control, Focus Mode, Editor Modes, Sidebar)
   - Window menu (Minimize, Close)
   - Help menu (Shortcuts, Docs, GitHub)
3. **Register menu event handlers**
4. **Wire events to frontend via Tauri events**

### Phase 3: Frontend Menu Handlers (1 hour)

1. **Listen for Tauri menu events in App.tsx**
2. **Map events to existing actions**
3. **Test all menu items**

### Phase 4: Recent Notes Section (1 hour)

1. **Create RecentNotes component**
2. **Query last 5 modified notes**
3. **Show note title, project, time ago**
4. **Click to open note**

### Phase 5: Project Stats (1 hour)

1. **Add `get_project_stats` Rust command**
2. **Return note count, word count per project**
3. **Update ProjectCard to show stats**
4. **Add total stats to dashboard header**

### Phase 6: Quick Filters & Polish (1-2 hours)

1. **Add filter dropdown (All/Active/Archived)**
2. **Add project search input**
3. **Polish CSS animations**
4. **Update documentation**

---

## Files to Modify

| File | Changes |
|------|---------|
| `src-tauri/Cargo.toml` | Add `tauri-plugin-menu` |
| `src-tauri/src/lib.rs` | Build menu, register handlers |
| `src/renderer/src/components/MissionControl.tsx` | Add `onCreateProject` prop |
| `src/renderer/src/components/QuickActions.tsx` | Add "New Project" button |
| `src/renderer/src/App.tsx` | Pass prop, listen for menu events |

---

## New Files to Create

| File | Purpose |
|------|---------|
| (none for Phase 1-3) | |

---

## Keyboard Shortcuts Reference

| Action | Current | After |
|--------|---------|-------|
| New Note | ⌘N | ⌘N |
| New Project | (none) | ⌘⇧P |
| Daily Note | ⌘D | ⌘D |
| Search | ⌘F | ⌘F |
| Mission Control | ⌘0 | ⌘0 |
| Focus Mode | ⌘⇧F | ⌘⇧F |
| Settings | (sidebar) | ⌘, |
| Quit | ⌘Q | ⌘Q |

---

## Success Criteria

- [ ] "New Project" button visible in Mission Control
- [ ] Empty state guides user to create project
- [ ] Native macOS menu bar works
- [ ] All keyboard shortcuts accessible via menu
- [ ] Menu events trigger correct actions
- [ ] Feels native on macOS

---

## Dependencies

- `tauri-plugin-menu` (Tauri 2 menu system)

---

## Notes

- Tauri 2 uses `tauri-plugin-menu` instead of `tauri::Menu`
- Menu events use `app.on_menu_event()` pattern
- Frontend listens via `listen()` from `@tauri-apps/api/event`

---

## Quick Win Implementation Details

### QuickActions.tsx Changes

```tsx
// Add FolderPlus icon import
import { Calendar, FilePlus, Zap, FolderPlus } from 'lucide-react'

interface QuickActionsProps {
  onDailyNote: () => void
  onNewNote: () => void
  onQuickCapture: () => void
  onNewProject: () => void  // NEW
}

// Add New Project button after Quick Capture
<button
  onClick={onNewProject}
  className="quick-action-btn ..."
>
  <span className="quick-action-icon p-2 rounded-lg bg-emerald-500/10 text-emerald-500 ...">
    <FolderPlus className="w-5 h-5" />
  </span>
  <div className="text-left">
    <div className="font-medium text-nexus-text-primary">New Project</div>
    <div className="text-xs text-nexus-text-muted">⌘⇧P</div>
  </div>
</button>
```

### MissionControl.tsx Changes

```tsx
interface MissionControlProps {
  // ... existing
  onCreateProject: () => void  // NEW
}

// Pass to QuickActions
<QuickActions
  onDailyNote={onDailyNote}
  onNewNote={onCreateNote}
  onQuickCapture={onQuickCapture}
  onNewProject={onCreateProject}  // NEW
/>

// Better empty state
{projects.length === 0 ? (
  <div className="text-center py-12">
    <FolderPlus className="w-12 h-12 mx-auto text-nexus-text-muted mb-4" />
    <p className="text-nexus-text-primary font-medium mb-2">No projects yet</p>
    <p className="text-sm text-nexus-text-muted mb-4">
      Projects help you organize notes by topic
    </p>
    <button
      onClick={onCreateProject}
      className="px-4 py-2 bg-nexus-accent text-white rounded-lg hover:bg-nexus-accent/90"
    >
      Create Your First Project
    </button>
  </div>
) : (
  // ... existing grid
)}
```

### App.tsx Changes

```tsx
<MissionControl
  projects={projects}
  currentProjectId={currentProjectId}
  onSelectProject={handleSelectProject}
  onCreateNote={handleCreateNote}
  onDailyNote={handleDailyNote}
  onQuickCapture={handleQuickCapture}
  onSettings={() => setIsSettingsModalOpen(true)}
  onCreateProject={() => setIsCreateProjectModalOpen(true)}  // NEW
/>
```
