# Mission Control: Collapsible Sidebar Implementation Plan

**Approach:** Three-state collapsible sidebar (Option B refined)
**Decision Date:** 2025-12-27
**Status:** Approved for implementation

---

## Chosen Design: Three-State Collapsible Sidebar

Instead of toggling between separate Dashboard/Editor views, Mission Control becomes a **persistent sidebar** with three collapse states:

```
State 1: Icon Bar (48px)    State 2: Compact (240px)    State 3: Cards (320px+)
┌───┬─────────────────┐    ┌──────────┬────────────┐    ┌────────────┬─────────┐
│ ☰ │                 │    │ Projects │            │    │ ┌────────┐ │         │
│ ●─│     Editor      │    │ ● STAT   │   Editor   │    │ │ STAT   │ │ Editor  │
│ ● │                 │    │ ● P_med  │            │    │ │ 12 pgs │ │         │
│ ○ │                 │    │ ○ RMed   │            │    │ └────────┘ │         │
│ ➕│                 │    │ Recent   │            │    │ ┌────────┐ │         │
└───┴─────────────────┘    └──────────┴────────────┘    └────────────┴─────────┘
```

### Why This Approach

| Benefit | Description |
|---------|-------------|
| **Always accessible** | Project context never more than one click away |
| **Scalable UI** | From minimal (48px) to rich (320px+) |
| **ADHD-friendly** | Choose your distraction level |
| **Familiar** | Similar to VS Code, Obsidian, Slack |
| **Flexible** | User controls information density |

---

## Component Architecture

### Current State (What Exists)

| Component | Status | Notes |
|-----------|--------|-------|
| `DashboardShell.tsx` | ✅ Built | Wrapper with collapsed/expanded |
| `DashboardHeader.tsx` | ✅ Built | Stats + quick actions |
| `DashboardFooter.tsx` | ✅ Built | Recent pages footer |
| `ProjectsPanel.tsx` | ✅ Built | Project list (needs refactor) |
| `MissionControl.tsx` | ⚠️ Unused | Full-page dashboard (deprecate?) |
| `ProjectCard.tsx` | ✅ Built | Card component |
| `QuickActions.tsx` | ✅ Built | Action buttons |
| `RecentNotes.tsx` | ✅ Built | Recent pages list |

### New Components Needed

| Component | Purpose | Priority |
|-----------|---------|----------|
| `MissionSidebar.tsx` | Main sidebar container with 3 states | P0 |
| `IconBarMode.tsx` | 48px icon-only view | P0 |
| `CompactListMode.tsx` | 240px list view | P0 |
| `CardViewMode.tsx` | 320px+ card grid | P1 |
| `SidebarSearch.tsx` | Search/filter projects | P1 |
| `ResizeHandle.tsx` | Drag to resize | P0 |

### Store Updates

| Store | Changes |
|-------|---------|
| `useAppViewStore.ts` | Add sidebar state (mode, width, collapsed) |

---

## Three States Detailed

### State 1: Icon Bar (48px)

**Purpose:** Maximum editor space, minimal context

```
┌───┐
│ ☰ │  ← Toggle button
├───┤
│ 🟢│  ← Active project (green dot)
│ ●─│  ← Current project (line indicator)
│ 🟡│  ← Planning project (yellow)
│ ○ │  ← Inactive project
├───┤
│ ➕│  ← New project
└───┘
```

**Visible:**
- Menu toggle (☰)
- Project color dots (8 max)
- Active indicator (─ line)
- Add button (➕)

**Interactions:**
- Hover icon → Tooltip with project name + stats
- Click icon → Switch project
- Click ☰ → Expand to Compact

---

### State 2: Compact List (240px)

**Purpose:** Quick scanning, balanced space

```
┌──────────────────┐
│ ☰ Projects (3)   │
├──────────────────┤
│ ● STAT 579  12↗ │
│   ████████░░ 85% │
│   2h ago         │
│                  │
│ ● P_med      8↗ │
│   ████░░░░░░ 42% │
│   1d ago         │
│                  │
│ ○ RMed       5↗ │
│   95%            │
├──────────────────┤
│ 💡 Recent        │
│ • Lec 8      2h │
│ • Sim Study  1d │
├──────────────────┤
│ [+ New Project]  │
└──────────────────┘
```

**Visible:**
- Project name + note count
- Mini progress bar
- Last modified time
- Recent pages (5)
- Add project button

**Interactions:**
- Click project → Switch context
- Click ☰ → Collapse to Icons or expand to Cards
- Drag right edge → Resize (200-300px)

---

### State 3: Card View (320px+)

**Purpose:** Rich context, full metadata

```
┌────────────────────────────┐
│ ☰ Projects (3)    [≡][▦]  │
├────────────────────────────┤
│ ┌────────────────────────┐ │
│ │ 🟢 STAT 579           │ │
│ │ Teaching • Active      │ │
│ │ 12 pages • 3,247 words│ │
│ │ ████████░░ 85%        │ │
│ │ → Next: Lecture 9     │ │
│ │ Modified 2h ago        │ │
│ └────────────────────────┘ │
│                            │
│ ┌────────────────────────┐ │
│ │ 🟡 P_med Paper        │ │
│ │ Research • Planning    │ │
│ │ 8 pages • 5,891 words │ │
│ │ ████░░░░░░ 42%        │ │
│ └────────────────────────┘ │
└────────────────────────────┘
```

**Visible:**
- Full project cards
- Type badge + status
- Note count + word count
- Progress bar with percentage
- Next action (from .STATUS)
- Last modified
- View mode toggles (≡/▦)

---

## Implementation Phases

### Phase 1: Core (Week 1) - 28 hours

| Feature | Hours | File |
|---------|-------|------|
| Icon bar mode | 4h | `IconBarMode.tsx` |
| Compact list mode | 6h | `CompactListMode.tsx` |
| Project switching | 2h | All modes |
| Collapse/expand toggle | 3h | `MissionSidebar.tsx` |
| Active project indicator | 2h | All modes |
| Status color coding | 3h | Shared component |
| Note count display | 1h | Compact+ modes |
| Basic tooltips | 2h | Icon mode |
| Resize handle | 3h | `ResizeHandle.tsx` |
| State persistence | 2h | `useAppViewStore.ts` |

**Deliverable:** Working three-state sidebar

---

### Phase 2: Advanced (Week 2) - 34 hours

| Feature | Hours | File |
|---------|-------|------|
| Card view mode | 8h | `CardViewMode.tsx` |
| Progress bars | 4h | Compact+ modes |
| Recent pages widget | 6h | `RecentPagesWidget.tsx` |
| Next action preview | 3h | Card mode |
| Word count display | 1h | Card mode |
| Last modified time | 2h | All modes |
| View mode toggle | 4h | Card mode |
| Keyboard navigation | 6h | All modes |

**Deliverable:** Feature-complete sidebar

---

### Phase 3: Polish (Week 3) - 20 hours

| Task | Hours |
|------|-------|
| Search/filter | 8h |
| Accessibility (ARIA) | 4h |
| Animations | 4h |
| Testing | 4h |

**Deliverable:** Production-ready

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘0 | Cycle sidebar: Icon → Compact → Card → Icon |
| ⌘1-9 | Jump to project 1-9 |
| ⌘↑/↓ | Navigate projects |
| ⌘[ / ⌘] | Previous/next sidebar mode |

---

## CSS Variables

```css
:root {
  /* Sidebar widths */
  --sidebar-icon-width: 48px;
  --sidebar-compact-width: 240px;
  --sidebar-compact-min: 200px;
  --sidebar-compact-max: 300px;
  --sidebar-card-width: 320px;
  --sidebar-card-max: 500px;

  /* Status colors */
  --status-active: #22c55e;
  --status-planning: #eab308;
  --status-archive: #6b7280;
  --status-complete: #3b82f6;
}
```

---

## Migration from Current Code

1. **Keep:** `DashboardShell.tsx` as outer wrapper
2. **Refactor:** `ProjectsPanel.tsx` → Split into three mode components
3. **Deprecate:** `MissionControl.tsx` (full-page view no longer needed)
4. **Keep:** `ProjectCard.tsx`, `QuickActions.tsx`, `RecentNotes.tsx`
5. **New:** `MissionSidebar.tsx` as the main sidebar container

---

## Testing Checklist

- [ ] Icon mode shows 8 projects max
- [ ] Compact mode resizable (200-300px)
- [ ] Card mode shows full metadata
- [ ] ⌘0 cycles through states
- [ ] State persists across sessions
- [ ] Tooltips on hover (icon mode)
- [ ] Progress bars animate smoothly
- [ ] Recent pages updates live
- [ ] Keyboard navigation works
- [ ] Reduced motion respected

---

## Decision: Deprecate Toggle View?

The original plan had `viewMode: 'dashboard' | 'editor'` for toggling between separate views.

**Recommendation:** Remove toggle view logic. The collapsible sidebar replaces this:
- Icon mode (48px) = "Focus on writing"
- Card mode (320px+) = "Full dashboard context"

No need for separate MissionControl full-page view.

---

## Next Steps

1. [ ] Confirm this plan is approved
2. [ ] Create `MissionSidebar.tsx` container
3. [ ] Implement Icon mode first (simplest)
4. [ ] Add Compact mode
5. [ ] Add Card mode
6. [ ] Wire up keyboard shortcuts
7. [ ] Test and polish
