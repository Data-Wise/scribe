# Sprint 24: Three-State Sidebar - Core

> **Goal:** Implement the collapsible Mission Control sidebar with Icon (48px) and Compact (240px) modes

---

## Overview

| Field | Value |
|-------|-------|
| **Sprint** | 24 |
| **Focus** | Collapsible Sidebar Core |
| **Version** | v1.3.0 |
| **Status** | 🔄 Not Started |
| **Estimated** | 28 hours (~3.5 days) |

---

## Background

Replace the current toggle between Dashboard/Editor views with a **persistent collapsible sidebar** that scales from minimal (48px) to detailed (320px+).

**Why This Approach:**
- Always accessible project context
- User controls information density
- ADHD-friendly: choose your distraction level
- Familiar pattern (VS Code, Slack, Obsidian)

---

## Three Sidebar States

```
State 1: Icon (48px)     State 2: Compact (240px)     State 3: Card (320px+)
┌───┬────────────────┐   ┌──────────┬───────────────┐   ┌────────────┬─────────┐
│ ☰ │                │   │ Projects │               │   │ ┌────────┐ │         │
│ ●─│    Editor      │   │ ● STAT   │    Editor     │   │ │ STAT   │ │ Editor  │
│ ● │                │   │ ● P_med  │               │   │ │ 12 pgs │ │         │
│ ○ │                │   │ Recent   │               │   │ └────────┘ │         │
│ ➕│                │   │ [+ New]  │               │   │ ┌────────┐ │         │
└───┴────────────────┘   └──────────┴───────────────┘   └────────────┴─────────┘
```

**This sprint:** Icon + Compact modes (Card mode in Sprint 25)

---

## Tasks

### 1. Create MissionSidebar Container

**File:** `src/renderer/src/components/MissionSidebar.tsx`

```tsx
interface MissionSidebarProps {
  mode: 'icon' | 'compact' | 'card'
  width: number
  projects: Project[]
  currentProjectId: string | null
  onSelectProject: (id: string) => void
  onCreateProject: () => void
  onModeChange: (mode: SidebarMode) => void
  onWidthChange: (width: number) => void
}

function MissionSidebar(props) {
  switch (props.mode) {
    case 'icon': return <IconBarMode {...props} />
    case 'compact': return <CompactListMode {...props} />
    case 'card': return <CardViewMode {...props} />
  }
}
```

| Subtask | Effort |
|---------|--------|
| Create component structure | 1h |
| Mode switching logic | 1h |
| CSS container styles | 1h |

---

### 2. Implement Icon Bar Mode (48px)

**File:** `src/renderer/src/components/sidebar/IconBarMode.tsx`

**Features:**
- Menu toggle button (☰)
- Project color dots (8 max)
- Active indicator (─ line on left)
- Add project button (➕)
- Tooltips on hover

| Subtask | Effort |
|---------|--------|
| Component structure | 1h |
| Project icon buttons | 1h |
| Tooltip implementation | 1h |
| Active indicator styles | 0.5h |
| Add button | 0.5h |

---

### 3. Implement Compact List Mode (240px)

**File:** `src/renderer/src/components/sidebar/CompactListMode.tsx`

**Features:**
- Header with toggle + count
- Project list with:
  - Status dot + name + note count
  - Mini progress bar
  - Last modified time
- Recent pages section (5 items)
- Add project button

| Subtask | Effort |
|---------|--------|
| Component structure | 1h |
| Project list items | 2h |
| Progress bar mini | 1h |
| Recent pages widget | 1.5h |
| Scroll handling | 0.5h |

---

### 4. Project Switching

**All modes:** Click project → switch context

| Subtask | Effort |
|---------|--------|
| Wire onSelectProject | 0.5h |
| Update current project indicator | 0.5h |
| Animate transition | 0.5h |
| Test all modes | 0.5h |

---

### 5. Collapse/Expand Toggle

**Shortcut:** ⌘0 cycles through modes

| Subtask | Effort |
|---------|--------|
| Wire ⌘0 shortcut | 0.5h |
| Cycle logic (icon→compact→card→icon) | 0.5h |
| Animation between modes | 1h |
| Toggle button in header | 0.5h |
| Test keyboard + click | 0.5h |

---

### 6. Active Project Indicator

**Visual feedback for current project**

| Subtask | Effort |
|---------|--------|
| Icon mode: left edge line | 0.5h |
| Compact mode: left border + highlight | 0.5h |
| Status color coding | 1h |

---

### 7. Status Color Coding

| Status | Color |
|--------|-------|
| active | Green (#22c55e) |
| planning | Yellow (#eab308) |
| archive | Gray (#6b7280) |
| complete | Blue (#3b82f6) |

| Subtask | Effort |
|---------|--------|
| StatusDot component | 0.5h |
| getStatusColor helper | 0.5h |
| Apply to all modes | 1h |
| Accessibility (aria-label) | 0.5h |
| Test all statuses | 0.5h |

---

### 8. Resize Handle

**File:** `src/renderer/src/components/sidebar/ResizeHandle.tsx`

**Behavior:**
- Drag right edge to resize (Compact: 200-300px, Card: 320-500px)
- Visual feedback on hover
- Persist width

| Subtask | Effort |
|---------|--------|
| ResizeHandle component | 1h |
| Mouse event handling | 1h |
| Width constraints | 0.5h |
| Visual feedback | 0.5h |

---

### 9. State Persistence

**Store:** `useAppViewStore.ts`

```typescript
interface SidebarState {
  mode: 'icon' | 'compact' | 'card'
  width: number
}
```

| Subtask | Effort |
|---------|--------|
| Add sidebar state to store | 0.5h |
| Persist to localStorage | 0.5h |
| Restore on app load | 0.5h |
| Test persistence | 0.5h |

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/renderer/src/components/MissionSidebar.tsx` | Main container |
| `src/renderer/src/components/sidebar/IconBarMode.tsx` | 48px view |
| `src/renderer/src/components/sidebar/CompactListMode.tsx` | 240px view |
| `src/renderer/src/components/sidebar/ResizeHandle.tsx` | Drag handle |
| `src/renderer/src/components/sidebar/StatusDot.tsx` | Status indicator |

## Files to Modify

| File | Changes |
|------|---------|
| `src/renderer/src/App.tsx` | Replace DashboardShell with MissionSidebar |
| `src/renderer/src/store/useAppViewStore.ts` | Add sidebar state |
| `src/renderer/src/index.css` | Sidebar styles |

## Files to Deprecate

| File | Action |
|------|--------|
| `src/renderer/src/components/MissionControl.tsx` | Remove or deprecate |
| Toggle view logic in useAppViewStore | Remove viewMode: 'dashboard' \| 'editor' |

---

## CSS Variables

```css
:root {
  /* Sidebar widths */
  --sidebar-icon-width: 48px;
  --sidebar-compact-width: 240px;
  --sidebar-compact-min: 200px;
  --sidebar-compact-max: 300px;

  /* Status colors */
  --status-active: #22c55e;
  --status-planning: #eab308;
  --status-archive: #6b7280;
  --status-complete: #3b82f6;
}
```

---

## Acceptance Criteria

- [ ] Icon mode shows project dots (8 max)
- [ ] Compact mode shows project list with stats
- [ ] ⌘0 cycles through modes
- [ ] Click project switches context
- [ ] Active project has visual indicator
- [ ] Status colors applied correctly
- [ ] Resize handle works (Compact: 200-300px)
- [ ] State persists across sessions
- [ ] Tooltips appear on hover (Icon mode)
- [ ] All tests passing

---

## Sprint 25 Preview (Advanced)

After Core is complete:
- Card view mode (320px+)
- Progress bars
- Recent pages widget
- Keyboard navigation (⌘1-9)
- Search/filter
