# Three-Tab Sidebar System Specification

**Version:** v1.17.0
**Date:** 2026-01-10
**Status:** Design Approved, Ready for Implementation
**Author:** Claude Sonnet 4.5 (with UX & Architecture Agents)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Overview](#2-overview)
3. [User Stories](#3-user-stories)
4. [Design Decisions](#4-design-decisions)
5. [Architecture](#5-architecture)
6. [State Management](#6-state-management)
7. [UI Components](#7-ui-components)
8. [User Experience](#8-user-experience)
9. [Accessibility](#9-accessibility)
10. [Performance](#10-performance)
11. [Migration](#11-migration)
12. [Implementation Plan](#12-implementation-plan)
13. [Testing Strategy](#13-testing-strategy)
14. [Review Checklist](#14-review-checklist)

---

## 1. Executive Summary

### What's Changing

**v1.16.0 (Current):** Icon-centric sidebar with 2 view modes per icon
- IconBar (48px) + ExpandedIconPanel (Compact OR Card mode)
- Each icon remembers preferred mode (compact or card)

**v1.17.0 (Proposed):** Add third tab - Explorer tree view
- IconBar (48px) + ExpandedIconPanel with **3 tabs** (Compact | Card | Explorer)
- Each icon remembers which tab was last active
- Explorer tab shows hierarchical tree: Projects > Notes

### Why This Matters

**User Benefits:**
- **Progressive disclosure:** Start simple (Compact), reveal complexity on demand (Explorer)
- **Better organization:** Tree view makes hierarchy visible for 15+ projects
- **Flexible workflows:** Quick scanning (Compact), visual browsing (Card), organizing (Explorer)
- **ADHD-friendly:** One tab at a time, clear escape hatches, minimal cognitive load

**Technical Benefits:**
- Unified architecture across all icons (Inbox, Smart Folders, Pinned Projects)
- Independent tab preferences per icon (Research → Card, Teaching → Compact)
- Smooth transitions with constant width when switching tabs
- Future-proof for drag-to-move notes between projects

---

## 2. Overview

### 2.1 Visual Evolution

**v1.16.0 (Current):**
```
┌──┬─────────────────────┐
│🔬│ Research        [×] │  Header
│  │ ─────────────────── │
│  │ □ Project 1         │  Content (compact OR card)
│  │ □ Project 2         │
└──┴─────────────────────┘
```

**v1.17.0 (Proposed):**
```
┌──┬──────────────────────────────────┐
│🔬│ Research    [C][W][E]        [×] │  Header with tabs
│  │ ───────────────────────────────  │
│  │ [Tab-specific content]           │  Content changes per tab
│  │ • Compact: List view             │
│  │ • Card: Grid view                │
│  │ • Explorer: Tree view            │
└──┴──────────────────────────────────┘
```

### 2.2 Three Tab Types

| Tab | View Type | Use Case | Best For | Cognitive Load |
|-----|-----------|----------|----------|----------------|
| **Compact** | List (vertical) | Quick scanning | 10-50 items | Low ⭐ |
| **Card** | Grid (cards) | Visual browsing | 5-20 items | Medium ⭐⭐ |
| **Explorer** | Tree (hierarchical) | Organization | 15+ projects | High ⭐⭐⭐ |

### 2.3 Key Features

**Per-Icon Tab Memory:**
- Research smart icon → Last used Card tab → Opens to Card view (360px)
- Teaching smart icon → Last used Compact tab → Opens to Compact view (240px)
- Each icon remembers independently (no global tab mode)

**Global Width Per Tab Type:**
- All icons in Compact tab share `compactModeWidth: 240px`
- All icons in Card tab share `cardModeWidth: 360px`
- All icons in Explorer tab share `explorerModeWidth: 320px`
- Resizing updates global width for that tab type

**Explorer Tree Features:**
- Hierarchical display: Status Groups > Projects > Notes
- Expand/collapse project nodes (arrow icons)
- Drag notes between projects (future v1.17.0/v1.18.0)
- Persisted tree state across sessions

---

## 3. User Stories

### 3.1 Primary Stories

**Story 1: First-Time Tab Discovery**
> As a new user, I want to discover different view options without overwhelming clutter, so I can choose the view that fits my workflow.

**Acceptance Criteria:**
- Tab bar visible in expanded panel header
- Three clear labels: "Compact" | "Card" | "Explorer"
- Defaults to Compact (simplest view)
- Clicking a tab switches content instantly (< 100ms)

---

**Story 2: Per-Icon Tab Preferences**
> As a researcher with 20 research projects and 5 teaching courses, I want Research to open in Card view (visual browsing) and Teaching to open in Compact view (name-based scanning).

**Acceptance Criteria:**
- Click Research icon → Opens to Card tab (last used)
- Click Teaching icon → Opens to Compact tab (last used)
- Preferences persist across app restarts (localStorage)
- No cross-icon confusion (Research tab ≠ Teaching tab)

---

**Story 3: Tree Organization**
> As a power user with 30+ projects, I want to see my projects grouped by status (Active, Paused, Complete) with expandable notes, so I can find buried items quickly.

**Acceptance Criteria:**
- Explorer tab shows tree structure:
  ```
  ▼ Active (12)
    ├─ 📁 Mediation Planning (12 notes)
    ├─ 📁 Product of Three (8 notes)
  ▼ Paused (5)
  ▶ Complete (13)
  ```
- Click arrow → Expand/collapse project
- Click project name → Open project details
- Click note → Open note in editor

---

**Story 4: Constant Width Switching**
> As an ADHD user, I want the sidebar width to stay constant when switching tabs, so I don't get distracted by jarring layout shifts.

**Acceptance Criteria:**
- Switch Compact → Card → Width stays 240px (no jump)
- Switch Card → Explorer → Width stays 360px (no jump)
- Only manual resize changes width (not tab switching)

---

### 3.2 Secondary Stories

**Story 5: Keyboard Tab Switching**
> As a keyboard-first user, I want to switch tabs with ⌘1/2/3, matching editor mode shortcuts.

**Acceptance Criteria:**
- ⌘1 → Compact tab
- ⌘2 → Card tab
- ⌘3 → Explorer tab
- Works when sidebar has focus

---

**Story 6: Empty State Guidance**
> As a new user with 0 research projects, I want the Explorer tab to guide me to create my first project, not show an empty void.

**Acceptance Criteria:**
- Empty Explorer shows friendly message + CTA
- Suggests switching to Compact/Card for better UX
- Provides "Create Project" button

---

## 4. Design Decisions

### 4.1 User-Confirmed Decisions

These decisions were confirmed through 8 expert questions:

| Question | User Selection |
|----------|----------------|
| **Tab bar position** | Inside expanded panel header (saves space) |
| **Tab availability** | All icons get 3 tabs (uniform behavior) |
| **Explorer content** | Tree view: Projects > Notes hierarchy |
| **Width on tab switch** | Keep current width (no jump) |
| **Tab persistence** | Remember last tab per icon (independent) |
| **Click to expand** | Opens to last active tab (no cycle) |
| **Explorer actions** | Drag notes between projects (v1.17/18) |
| **Tab visual style** | macOS-style pill tabs (familiar, cohesive) |

### 4.2 Recommended Defaults

**Default Tab per Icon Type:**
```typescript
const ICON_TAB_DEFAULTS = {
  inbox: 'compact',       // Quick capture review
  research: 'card',       // Visual project browsing
  teaching: 'card',       // Visual course browsing
  'r-package': 'compact', // Name-based navigation
  'r-dev': 'compact',     // Name-based navigation
  vault: 'compact'        // Single project notes list
}
```

**Width Defaults:**
- Compact: `240px` (min: 200px, max: 300px)
- Card: `360px` (min: 320px, max: 500px) — Increased from 320px
- Explorer: `320px` (min: 200px, max: 500px) — New

**Keyboard Shortcuts:**
- ⌘1 → Compact tab (matches Editor Source mode)
- ⌘2 → Card tab (matches Editor Live mode)
- ⌘3 → Explorer tab (matches Editor Reading mode)

### 4.3 Why These Decisions

**macOS Pill Tabs:**
- Familiar pattern (Settings app, Music app, etc.)
- Clearly connected segments (one active at a time)
- Clean, minimal design (no gradients or heavy borders)

**Tabs in Header:**
- Saves vertical space (no separate navigation layer)
- Visually integrated with panel (not floating)
- Clear relationship: Tabs control content below

**Independent Tab Memory:**
- Prevents mode confusion ("Why did Teaching switch to Card?")
- Respects different workflows per project type
- Reduces cognitive load (each icon behaves predictably)

**Constant Width:**
- No jarring layout shifts when switching tabs
- Reduces motion distraction (ADHD-friendly)
- Clearer mental model (width = manual resize, not tab change)

---

## 5. Architecture

### 5.1 Component Hierarchy

```
MissionSidebar (container)
│
├─ IconBar (48px, always visible)
│  ├─ InboxButton
│  ├─ SmartIconButton[] (Research, Teaching, etc.)
│  ├─ VaultIconButton[] (Pinned Projects)
│  └─ ActivityBar (Search, Daily, Settings)
│
└─ ExpandedIconPanel (conditional, 240-500px)
   ├─ PanelHeader
   │  ├─ IconLabel ("Research Projects")
   │  ├─ IconTabBar (NEW)
   │  │  ├─ TabButton ("Compact", active)
   │  │  ├─ TabButton ("Card")
   │  │  └─ TabButton ("Explorer")
   │  └─ CloseButton
   │
   └─ TabContent (switches based on activeTab)
      ├─ CompactPanelContent (tab === 'compact')
      ├─ CardPanelContent (tab === 'card')
      └─ ExplorerPanelContent (tab === 'explorer', NEW)
```

### 5.2 Data Flow

```
User clicks icon (vault or smart)
  ↓
Zustand: expandVault(vaultId) or expandSmartIcon(iconId)
  ↓
Read: vault.activeTab or icon.activeTab (default: 'compact')
  ↓
Set: expandedIcon = { type, id }
     sidebarWidth = compactModeWidth | cardModeWidth | explorerModeWidth
  ↓
Persist: localStorage (expandedIcon, sidebarWidth)
  ↓
UI: Render panel with active tab
```

```
User clicks tab button ("Explorer")
  ↓
Zustand: switchIconTab('vault', vaultId, 'explorer')
  ↓
Update: vault.activeTab = 'explorer'
        sidebarWidth = explorerModeWidth
  ↓
Persist: localStorage (pinnedVaults, sidebarWidth)
  ↓
UI: Re-render with ExplorerPanelContent
```

### 5.3 Directory Structure

```
src/renderer/src/components/sidebar/
├─ MissionSidebar.tsx              (Main container)
├─ IconBar.tsx                     (Icon-only navigation bar)
├─ ExpandedIconPanel.tsx           (Panel with tabs)
│
├─ tabs/                           (NEW folder)
│  ├─ IconTabBar.tsx               (NEW: 3 pill tabs)
│  ├─ CompactPanelContent.tsx      (Extract from CompactListMode)
│  ├─ CardPanelContent.tsx         (Extract from CardViewMode)
│  └─ ExplorerPanelContent.tsx     (NEW: Tree view)
│
└─ explorer/                       (NEW folder)
   ├─ ExplorerTree.tsx             (Tree container)
   ├─ ProjectTreeNode.tsx          (Project with expand/collapse)
   ├─ NoteTreeNode.tsx             (Note item in tree)
   └─ EmptyExplorerState.tsx       (Empty state guidance)
```

---

## 6. State Management

### 6.1 Updated TypeScript Interfaces

```typescript
// ============================================================
// v1.17.0 Three-Tab Sidebar - State Schema
// ============================================================

// Tab types
export type IconTabType = 'compact' | 'card' | 'explorer'

// Pinned vaults with activeTab
export interface PinnedVault {
  id: string  // 'inbox' or project ID
  label: string
  color?: string
  order: number
  isPermanent: boolean
  activeTab: IconTabType  // NEW: Renamed from 'preferredMode'
}

// Smart icons with activeTab
export type SmartIconId = 'research' | 'teaching' | 'r-package' | 'dev-tools'

export interface SmartIcon {
  id: SmartIconId
  label: string
  icon: string  // emoji
  color: string  // hex color
  projectType: ProjectType
  isVisible: boolean
  order: number
  activeTab: IconTabType  // NEW: Renamed from 'preferredMode'
}

// Expanded icon type (unchanged)
export type ExpandedIconType =
  | { type: 'vault'; id: string }
  | { type: 'smart'; id: SmartIconId }
  | null

// Explorer tree state (NEW)
export interface ExplorerTreeState {
  expandedNodes: Set<string>  // Project IDs expanded in tree
}

// Sidebar width constraints
export const SIDEBAR_WIDTHS = {
  icon: 48,
  compact: { default: 240, min: 200, max: 300 },
  card: { default: 360, min: 320, max: 500 },
  explorer: { default: 320, min: 200, max: 500 }  // NEW
}

// App View Store (v1.17.0)
export interface AppViewState {
  // Sidebar state
  expandedIcon: ExpandedIconType
  sidebarWidth: number
  pinnedVaults: PinnedVault[]
  smartIcons: SmartIcon[]
  projectTypeFilter: ProjectType | null

  // Width memory per tab type
  compactModeWidth: number   // Global width for Compact tab
  cardModeWidth: number      // Global width for Card tab
  explorerModeWidth: number  // NEW: Global width for Explorer tab

  // Explorer state (NEW)
  explorerTreeState: ExplorerTreeState

  // Sidebar actions
  expandVault: (vaultId: string) => void
  expandSmartIcon: (iconId: SmartIconId) => void
  collapseAll: () => void
  toggleIcon: (type: 'vault' | 'smart', id: string) => void
  setSidebarWidth: (width: number) => void

  // NEW: Tab switching
  switchIconTab: (type: 'vault' | 'smart', id: string, tab: IconTabType) => void

  // NEW: Explorer tree actions
  toggleExplorerNode: (projectId: string) => void
  expandExplorerNode: (projectId: string) => void
  collapseExplorerNode: (projectId: string) => void
  collapseAllExplorerNodes: () => void

  // ... (existing tab/recent notes actions unchanged)
}
```

### 6.2 New Zustand Actions

**`switchIconTab(type, id, tab)` - Switch active tab for an icon**

```typescript
switchIconTab: (type: 'vault' | 'smart', id: string, tab: IconTabType) => {
  const {
    pinnedVaults,
    smartIcons,
    expandedIcon,
    compactModeWidth,
    cardModeWidth,
    explorerModeWidth
  } = get()

  // Determine new width based on tab
  const widthMap = {
    compact: compactModeWidth,
    card: cardModeWidth,
    explorer: explorerModeWidth
  }
  const newWidth = widthMap[tab]

  // Update icon's activeTab
  if (type === 'vault') {
    const newVaults = pinnedVaults.map(v =>
      v.id === id ? { ...v, activeTab: tab } : v
    )
    set({ pinnedVaults: newVaults })
    savePinnedVaults(newVaults)
  } else {
    const newIcons = smartIcons.map(i =>
      i.id === id ? { ...i, activeTab: tab } : i
    )
    set({ smartIcons: newIcons })
    saveSmartIcons(newIcons)
  }

  // Update width if this icon is currently expanded
  if (expandedIcon?.type === type && expandedIcon?.id === id) {
    set({ sidebarWidth: newWidth })
    saveSidebarWidth(newWidth)
  }
}
```

**`toggleExplorerNode(projectId)` - Toggle project expand/collapse**

```typescript
toggleExplorerNode: (projectId: string) => {
  const { explorerTreeState } = get()
  const newExpandedNodes = new Set(explorerTreeState.expandedNodes)

  if (newExpandedNodes.has(projectId)) {
    newExpandedNodes.delete(projectId)
  } else {
    newExpandedNodes.add(projectId)
  }

  const newState = { expandedNodes: newExpandedNodes }
  set({ explorerTreeState: newState })
  saveExplorerTreeState(newState)
}
```

**Updated `setSidebarWidth(width)` - Handles Explorer tab**

```typescript
setSidebarWidth: (width: number) => {
  const { expandedIcon, pinnedVaults, smartIcons } = get()

  if (!expandedIcon) return

  // Get current icon's active tab
  let activeTab: IconTabType = 'compact'
  if (expandedIcon.type === 'vault') {
    const vault = pinnedVaults.find(v => v.id === expandedIcon.id)
    activeTab = vault?.activeTab || 'compact'
  } else {
    const icon = smartIcons.find(i => i.id === expandedIcon.id)
    activeTab = icon?.activeTab || 'compact'
  }

  // Update width based on active tab
  let constrainedWidth = width
  let updatedState: Partial<AppViewState> = {}

  switch (activeTab) {
    case 'compact':
      constrainedWidth = Math.max(200, Math.min(300, width))
      updatedState = { sidebarWidth: constrainedWidth, compactModeWidth: constrainedWidth }
      break
    case 'card':
      constrainedWidth = Math.max(320, Math.min(500, width))
      updatedState = { sidebarWidth: constrainedWidth, cardModeWidth: constrainedWidth }
      break
    case 'explorer':
      constrainedWidth = Math.max(200, Math.min(500, width))
      updatedState = { sidebarWidth: constrainedWidth, explorerModeWidth: constrainedWidth }
      break
  }

  set(updatedState)
  saveSidebarWidth(constrainedWidth)
}
```

### 6.3 localStorage Schema

| Key | Type | Example | Migration |
|-----|------|---------|--------------|
| `scribe:expandedIcon` | `ExpandedIconType` | `{"type":"vault","id":"inbox"}` | No change |
| `scribe:compactModeWidth` | `number` | `240` | No change |
| `scribe:cardModeWidth` | `number` | `360` | Update default 320→360 |
| `scribe:explorerModeWidth` | `number` | `320` | NEW |
| `scribe:pinnedVaults` | `PinnedVault[]` | See JSON below | Rename field |
| `scribe:smartIcons` | `SmartIcon[]` | See JSON below | Rename field |
| `scribe:explorerTreeState` | `ExplorerTreeState` | `{"expandedNodes":["proj-1"]}` | NEW |

**Example localStorage (v1.17.0):**
```json
{
  "scribe:expandedIcon": { "type": "vault", "id": "inbox" },
  "scribe:compactModeWidth": 240,
  "scribe:cardModeWidth": 360,
  "scribe:explorerModeWidth": 320,
  "scribe:pinnedVaults": [
    {
      "id": "inbox",
      "label": "Inbox",
      "order": 0,
      "isPermanent": true,
      "activeTab": "compact"
    }
  ],
  "scribe:smartIcons": [
    {
      "id": "research",
      "label": "Research",
      "icon": "📖",
      "color": "#8B5CF6",
      "projectType": "research",
      "isVisible": true,
      "order": 0,
      "activeTab": "card"
    }
  ],
  "scribe:explorerTreeState": {
    "expandedNodes": ["proj-abc", "proj-xyz"]
  }
}
```

---

## 7. UI Components

### 7.1 IconTabBar Component (NEW)

**File:** `src/renderer/src/components/sidebar/tabs/IconTabBar.tsx`

**Props:**
```typescript
interface IconTabBarProps {
  activeTab: IconTabType
  onTabChange: (tab: IconTabType) => void
}
```

**Visual Design (macOS Pills):**
```
╭─────────────────────────────────╮
│ ●Compact  │  Card   │  Explorer │  ← Pills (rounded, connected)
╰─────────────────────────────────╯
```

**CSS Pattern:**
```css
.tab-bar {
  display: flex;
  background: rgba(0,0,0,0.05);  /* Light gray tint */
  border-radius: 8px;
  padding: 4px;
  gap: 2px;
}

.tab {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: all 150ms ease;
  cursor: pointer;
}

.tab.active {
  background: white;
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
}

.tab:hover:not(.active) {
  background: rgba(0,0,0,0.02);
}
```

### 7.2 ExplorerPanelContent Component (NEW)

**File:** `src/renderer/src/components/sidebar/tabs/ExplorerPanelContent.tsx`

**Props:**
```typescript
interface ExplorerPanelContentProps {
  projects: Project[]
  notes: Note[]
  expandedIcon: ExpandedIconType
  expandedNodes: Set<string>
  onToggleNode: (projectId: string) => void
  onSelectProject: (projectId: string) => void
  onSelectNote: (noteId: string) => void
}
```

**Tree Structure:**
```
▼ Active (12)
  ├─ 📁 Mediation Planning                    12
  │  ├─ 📄 Literature Review
  │  ├─ 📄 Data Analysis
  │  └─ 📄 Draft Manuscript
  ├─ 📁 Product of Three                       8
  └─ ...

▼ Paused (5)
  ├─ 📁 Sensitivity Analysis                   6
  └─ ...

▶ Complete (13)
```

**Key Features:**
- Status grouping (Active, Paused, Complete)
- Expand/collapse arrows (▶/▼)
- Project icons (📁) + note count badge
- Note items (📄) with title
- Drag handles (future v1.17/18)

### 7.3 Panel Header Layout (Updated)

**Before (v1.16.0):**
```
┌─────────────────────────────────────┐
│ 🔬 Research Projects            [×] │  Header only
└─────────────────────────────────────┘
```

**After (v1.17.0):**
```
┌─────────────────────────────────────────────┐
│ 🔬 Research Projects   [C][W][E]      [×]  │  Header + tabs
└─────────────────────────────────────────────┘
```

**Layout Breakdown:**
- Icon (16px) + Label (200px flex-grow)
- Tab bar (120px centered pill group)
- Close button (32px right-aligned)

---

## 8. User Experience

### 8.1 User Journey: First-Time Discovery

```
Start: User opens Scribe, sees icon bar
  ↓
1. Click Research icon
   → Panel expands to Compact tab (default)
   → Shows list of 3 research projects
   → Mental model: "This is a list view"
  ↓
2. Notice "Card" and "Explorer" tabs in header
   → Curiosity: "What do these show?"
  ↓
3. Click "Card" tab
   → Content fades to card grid (same 3 projects)
   → More visual detail (descriptions, stats)
   → Mental model: "Card is for rich browsing"
  ↓
4. Click "Explorer" tab
   → Content fades to tree view
   → Projects grouped by status (Active/Paused/Complete)
   → Mental model: "Explorer is for organization"
  ↓
5. Click different icon (Teaching)
   → Research panel collapses
   → Teaching panel opens to Compact tab (remembered)
   → Mental model: "Each icon remembers my choice"
```

**Discovery Time:** < 30 seconds from first icon click to understanding all 3 tabs

### 8.2 Power User Workflow: Drag-to-Move (Future)

```
Goal: Move "Mediation" project from Research to Teaching
  ↓
1. Click Research icon
   → Expands to Explorer tab (remembered preference)
   → Tree shows Active (3) / Paused (1)
  ↓
2. Find "Mediation" in tree
   → Drag handle visible next to project name
  ↓
3. Click and drag "Mediation" to Teaching icon
   → Teaching icon highlights (valid drop zone)
   → Pulsing blue outline feedback
  ↓
4. Release mouse
   → Success animation (green checkmark + bounce)
   → Mediation moves to Teaching
   → Research tree updates (2 active projects)
   → Teaching tree updates (1 active project)
```

**Efficiency Gain:** Move project in 3 clicks (vs 5+ with context menu)

### 8.3 ADHD-Friendly Design Principles

**1. One Thing at a Time**
- Only ONE icon expanded (accordion pattern)
- Only ONE tab visible at a time
- No nested tabs or sub-navigation

**2. Progressive Disclosure**
- Start simple: Icon bar (zero cognitive load)
- Level 1: Compact tab (low cognitive load)
- Level 2: Card tab (medium cognitive load)
- Level 3: Explorer tab (high cognitive load, opt-in)

**3. Clear Escape Hatches**
- Click icon again → Collapse panel
- Esc key → Collapse panel
- ⌘1/2/3 → Switch tabs without scrolling

**4. Constant Width (No Jarring Shifts)**
- Switching tabs does NOT change width
- Only manual resize changes width
- Reduces motion distraction

**5. Sensory-Friendly**
- Subtle tab colors (no neon highlights)
- Smooth transitions (150-200ms)
- No auto-playing animations
- Respects `prefers-reduced-motion`

---

## 9. Accessibility

### 9.1 Keyboard Navigation

| Shortcut | Action |
|----------|--------|
| **⌘1** | Switch to Compact tab |
| **⌘2** | Switch to Card tab |
| **⌘3** | Switch to Explorer tab |
| **↑↓** | Navigate items in all tabs |
| **→←** | Expand/collapse project nodes (Explorer only) |
| **Enter** | Select item |
| **Esc** | Collapse panel |

### 9.2 Screen Reader Support

**ARIA Roles:**
```html
<!-- Tab Bar -->
<div role="tablist" aria-label="View modes">
  <button
    role="tab"
    aria-selected="true"
    aria-controls="compact-panel"
    id="compact-tab"
  >
    Compact
  </button>
  <button
    role="tab"
    aria-selected="false"
    aria-controls="card-panel"
    id="card-tab"
  >
    Card
  </button>
  <button
    role="tab"
    aria-selected="false"
    aria-controls="explorer-panel"
    id="explorer-tab"
  >
    Explorer
  </button>
</div>

<!-- Tab Panel -->
<div
  role="tabpanel"
  id="compact-panel"
  aria-labelledby="compact-tab"
  tabindex="0"
>
  <!-- Content -->
</div>
```

**Announcements:**
```
User clicks Research icon:
→ "Research Projects expanded. Compact view. 12 items."

User presses ⌘2:
→ "Switched to Card view. 12 projects."

User presses ↓:
→ "Mediation Planning, Active, 12 notes, last edited 2 hours ago."
```

### 9.3 Color Contrast (WCAG 2.1 AA)

- Tab text (selected): **7:1** contrast ratio
- Tab text (unselected): **4.5:1** contrast ratio
- Focus outline: **3:1** against background

**Focus Indicators:**
```css
.tab:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.tree-node:focus-visible {
  box-shadow: 0 0 0 2px var(--focus-ring);
}
```

### 9.4 Accessibility Checklist

- [ ] Tab bar has `role="tablist"`
- [ ] Each tab has `role="tab"` + `aria-selected`
- [ ] Content has `role="tabpanel"` + `aria-labelledby`
- [ ] ⌘1/2/3 keyboard shortcuts work
- [ ] ↑↓ navigate items in all tabs
- [ ] →← expand/collapse in Explorer
- [ ] Focus indicators on all interactive elements
- [ ] Screen reader announces tab switches
- [ ] Color contrast 4.5:1 minimum (text)
- [ ] Respects `prefers-reduced-motion`

---

## 10. Performance

### 10.1 Target Benchmarks

| Operation | Target | Measurement |
|-----------|--------|-------------|
| **Switch tab** (Compact → Card) | < 50ms | `performance.mark()` |
| **Switch tab** (Card → Explorer) | < 100ms | `performance.mark()` |
| **Render Explorer tree** (50 projects) | < 200ms | React Profiler |
| **Toggle project node** | < 16ms | 60fps requirement |
| **Resize panel** | < 16ms | 60fps during drag |
| **localStorage save** (tree state) | < 10ms | `performance.measure()` |

### 10.2 Optimization Strategies

**React.memo for Tab Content:**
```typescript
const CompactPanelContent = React.memo((props: CompactPanelProps) => {
  // Only re-renders when props change
})

const CardPanelContent = React.memo((props: CardPanelProps) => {
  // Only re-renders when props change
})

const ExplorerPanelContent = React.memo((props: ExplorerPanelProps) => {
  // Only re-renders when props change
})
```

**Batched State Updates:**
```typescript
// ✅ Good: Single set() call
switchIconTab: (type, id, tab) => {
  set({
    pinnedVaults: newVaults,
    sidebarWidth: newWidth
  })
}

// ❌ Bad: Multiple set() calls
switchIconTab: (type, id, tab) => {
  set({ pinnedVaults: newVaults })
  set({ sidebarWidth: newWidth })
}
```

**Virtual Tree Rendering (Future v1.18.0):**
- Use `react-window` for large trees (100+ projects)
- Only render visible nodes + 10 buffer above/below
- Estimate node height: 32px (project) + 28px * note_count

### 10.3 Edge Case: 100+ Projects

**Explorer Tab at Scale:**
- Virtual scrolling enabled
- Search filter in header
- Status grouping (collapse complete projects by default)
- Lazy load note children (only when project expanded)

---

## 11. Migration

### 11.1 Migration Strategy (v1.16.0 → v1.17.0)

**Changes Required:**
1. Add `explorerModeWidth: 320` to localStorage
2. Rename `preferredMode` → `activeTab` in vaults/icons
3. Update `cardModeWidth` default 320 → 360
4. Initialize `explorerTreeState` with empty expandedNodes

**Migration Function:**
```typescript
/**
 * v1.17.0 Migration: Convert v1.16.0 to three-tab architecture
 * Runs once on first load after upgrade
 */
const migrateToThreeTabSidebar = (): void => {
  try {
    // Check if migration already complete
    const explorerWidth = localStorage.getItem('scribe:explorerModeWidth')
    if (explorerWidth !== null) return // Already migrated

    console.log('[Migration] Starting v1.16.0 → v1.17.0 three-tab migration')

    // 1. Add explorerModeWidth (default 320px)
    localStorage.setItem('scribe:explorerModeWidth', '320')

    // 2. Update cardModeWidth default (320 → 360 for better card layout)
    const currentCardWidth = localStorage.getItem('scribe:cardModeWidth')
    if (currentCardWidth === '320') {
      localStorage.setItem('scribe:cardModeWidth', '360')
    }

    // 3. Migrate pinnedVaults: preferredMode → activeTab
    const vaults = localStorage.getItem('scribe:pinnedVaults')
    if (vaults) {
      const parsed = JSON.parse(vaults) as Array<any>
      const migrated = parsed.map(v => ({
        ...v,
        activeTab: v.preferredMode || 'compact',
        preferredMode: undefined  // Remove old field
      }))
      localStorage.setItem('scribe:pinnedVaults', JSON.stringify(migrated))
    }

    // 4. Migrate smartIcons: preferredMode → activeTab
    const icons = localStorage.getItem('scribe:smartIcons')
    if (icons) {
      const parsed = JSON.parse(icons) as Array<any>
      const migrated = parsed.map(i => ({
        ...i,
        activeTab: i.preferredMode || 'compact',
        preferredMode: undefined  // Remove old field
      }))
      localStorage.setItem('scribe:smartIcons', JSON.stringify(migrated))
    }

    // 5. Initialize explorerTreeState (empty)
    localStorage.setItem('scribe:explorerTreeState', JSON.stringify({ expandedNodes: [] }))

    console.log('[Migration] v1.16.0 → v1.17.0 three-tab migration complete')
  } catch (error) {
    console.warn('[Migration] Failed to migrate localStorage:', error)
    // Non-blocking: app will use defaults if migration fails
  }
}

// Run migration before Zustand store initialization
migrateToThreeTabSidebar()
```

### 11.2 Migration Test Cases

| Scenario | v1.16.0 State | v1.17.0 State | Expected Result |
|----------|---------------|---------------|-----------------|
| **Inbox compact mode** | `preferredMode: 'compact'` | `activeTab: 'compact'` | Opens to Compact tab at 240px |
| **Research card mode** | `preferredMode: 'card'` | `activeTab: 'card'` | Opens to Card tab at 360px |
| **New user (no localStorage)** | N/A | `activeTab: 'compact'` (default) | All icons default to Compact |
| **User had 320px card width** | `cardModeWidth: 320` | `cardModeWidth: 360` | Auto-increase to 360px |

### 11.3 Backwards Compatibility

**No Breaking Changes:**
- v1.16.0 users upgrade seamlessly
- No data loss during migration
- Fallback to defaults if migration fails
- Old localStorage keys cleaned up automatically

---

## 12. Implementation Plan

### 12.1 Phased Rollout

**Phase 1: State Schema Update (2 hours)**
- Update `types/index.ts`: Add `IconTabType`, rename fields
- Add `ExplorerTreeState` interface
- Update `SIDEBAR_WIDTHS` constant with Explorer defaults

**Phase 2: Migration (2 hours)**
- Write `migrateToThreeTabSidebar()` function
- Add new localStorage keys
- Test migration with v1.16.0 data
- Verify backwards compatibility

**Phase 3: Zustand Actions (4 hours)**
- Implement `switchIconTab(type, id, tab)`
- Update `setSidebarWidth()` for Explorer tab
- Implement `toggleExplorerNode(projectId)`
- Implement `expandExplorerNode()`, `collapseExplorerNode()`
- Implement `collapseAllExplorerNodes()`
- Update `expandVault()` and `expandSmartIcon()` to use `activeTab`

**Phase 4: UI Components (8 hours)**
- Create `<IconTabBar>` component (3 pill tabs)
- Extract `<CompactPanelContent>` from CompactListMode
- Extract `<CardPanelContent>` from CardViewMode
- Create `<ExplorerPanelContent>` (tree view)
- Create `<ExplorerTree>`, `<ProjectTreeNode>`, `<NoteTreeNode>`
- Handle empty states (Inbox, no projects, etc.)

**Phase 5: Testing (4 hours)**
- Write unit tests for 5 new Zustand actions
- Write E2E tests for tab switching
- Test migration scenarios (5 test cases)
- Test edge cases (deleted project, localStorage quota, etc.)
- Performance test: 100+ notes, 50+ projects

**Phase 6: Documentation (1 hour)**
- Update CHANGELOG.md with v1.17.0 features
- Update README.md with Explorer tab screenshots
- Update .STATUS to reflect completion
- Document keyboard shortcuts

**Total Estimate:** ~20 hours over 3-4 days

### 12.2 Critical Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `src/renderer/src/types/index.ts` | MODIFY | Add `IconTabType`, rename fields |
| `src/renderer/src/store/useAppViewStore.ts` | REFACTOR | Add 5 new actions, update 2 existing |
| `src/renderer/src/components/sidebar/MissionSidebar.tsx` | MODIFY | Integrate tab bar, handle tab switching |
| `src/renderer/src/components/sidebar/ExpandedIconPanel.tsx` | MODIFY | Add tab bar to header |
| `src/renderer/src/components/sidebar/tabs/IconTabBar.tsx` | CREATE | macOS pill tab bar |
| `src/renderer/src/components/sidebar/tabs/ExplorerPanelContent.tsx` | CREATE | Tree view renderer |
| `src/renderer/src/components/sidebar/explorer/ExplorerTree.tsx` | CREATE | Tree container |
| `src/renderer/src/components/sidebar/explorer/ProjectTreeNode.tsx` | CREATE | Expandable project node |

---

## 13. Testing Strategy

### 13.1 Unit Tests

**Zustand Actions:**
```typescript
describe('switchIconTab()', () => {
  it('updates vault activeTab and width', () => {
    const { result } = renderHook(() => useAppViewStore())
    act(() => result.current.switchIconTab('vault', 'inbox', 'card'))

    const vault = result.current.pinnedVaults.find(v => v.id === 'inbox')
    expect(vault?.activeTab).toBe('card')
    expect(result.current.sidebarWidth).toBe(360) // cardModeWidth
  })

  it('persists activeTab to localStorage', () => {
    const { result } = renderHook(() => useAppViewStore())
    act(() => result.current.switchIconTab('smart', 'research', 'explorer'))

    const stored = JSON.parse(localStorage.getItem('scribe:smartIcons') || '[]')
    const icon = stored.find((i: any) => i.id === 'research')
    expect(icon?.activeTab).toBe('explorer')
  })
})

describe('toggleExplorerNode()', () => {
  it('adds project to expandedNodes when collapsed', () => {
    const { result } = renderHook(() => useAppViewStore())
    act(() => result.current.toggleExplorerNode('proj-123'))

    expect(result.current.explorerTreeState.expandedNodes.has('proj-123')).toBe(true)
  })

  it('removes project from expandedNodes when expanded', () => {
    const { result } = renderHook(() => useAppViewStore())
    act(() => {
      result.current.expandExplorerNode('proj-123')
      result.current.toggleExplorerNode('proj-123')
    })

    expect(result.current.explorerTreeState.expandedNodes.has('proj-123')).toBe(false)
  })
})
```

### 13.2 E2E Tests

**File:** `src/renderer/src/__tests__/ThreeTabSidebar.e2e.test.tsx`

```typescript
describe('Three-Tab Sidebar E2E', () => {
  it('expands icon to last active tab', async () => {
    // Setup: Set Research to Card tab
    useAppViewStore.getState().switchIconTab('smart', 'research', 'card')

    render(<MissionSidebar {...props} />)

    // Click Research icon
    fireEvent.click(screen.getByTestId('smart-icon-research'))

    await waitFor(() => {
      // Should open to Card tab (remembered)
      expect(screen.getByRole('tab', { name: 'Card', selected: true })).toBeInTheDocument()
      expect(screen.getByTestId('card-panel-content')).toBeInTheDocument()
    })
  })

  it('switches tabs with keyboard shortcuts', async () => {
    render(<MissionSidebar {...props} />)

    // Expand inbox
    useAppViewStore.getState().expandVault('inbox')

    // Press ⌘2 → Switch to Card tab
    fireEvent.keyDown(window, { key: '2', metaKey: true })

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Card', selected: true })).toBeInTheDocument()
    })

    // Press ⌘3 → Switch to Explorer tab
    fireEvent.keyDown(window, { key: '3', metaKey: true })

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Explorer', selected: true })).toBeInTheDocument()
    })
  })

  it('preserves width when switching tabs', async () => {
    render(<MissionSidebar {...props} />)

    // Expand Research to Compact tab (240px)
    useAppViewStore.getState().expandSmartIcon('research')
    const initialWidth = useAppViewStore.getState().sidebarWidth
    expect(initialWidth).toBe(240)

    // Switch to Card tab
    fireEvent.click(screen.getByRole('tab', { name: 'Card' }))

    await waitFor(() => {
      // Width should NOT jump (stays at current width until resize)
      expect(useAppViewStore.getState().sidebarWidth).toBe(initialWidth)
    })
  })

  it('toggles Explorer tree nodes', async () => {
    render(<MissionSidebar {...props} />)

    // Expand Research to Explorer tab
    useAppViewStore.getState().expandSmartIcon('research')
    useAppViewStore.getState().switchIconTab('smart', 'research', 'explorer')

    // Click expand arrow on project
    const expandButton = screen.getByTestId('expand-proj-123')
    fireEvent.click(expandButton)

    await waitFor(() => {
      // Project notes should appear
      expect(screen.getByText('Literature Review')).toBeInTheDocument()
      expect(screen.getByText('Data Analysis')).toBeInTheDocument()
    })

    // Click collapse arrow
    fireEvent.click(expandButton)

    await waitFor(() => {
      // Project notes should disappear
      expect(screen.queryByText('Literature Review')).not.toBeInTheDocument()
    })
  })
})
```

### 13.3 Migration Tests

```typescript
describe('v1.16.0 → v1.17.0 Migration', () => {
  it('migrates preferredMode to activeTab for vaults', () => {
    // Setup: v1.16.0 localStorage
    localStorage.setItem('scribe:pinnedVaults', JSON.stringify([
      { id: 'inbox', preferredMode: 'compact' }
    ]))

    // Run migration
    migrateToThreeTabSidebar()

    // Verify migration
    const vaults = JSON.parse(localStorage.getItem('scribe:pinnedVaults') || '[]')
    expect(vaults[0].activeTab).toBe('compact')
    expect(vaults[0].preferredMode).toBeUndefined()
  })

  it('adds explorerModeWidth default', () => {
    // Setup: v1.16.0 localStorage (no explorerModeWidth)
    localStorage.removeItem('scribe:explorerModeWidth')

    // Run migration
    migrateToThreeTabSidebar()

    // Verify migration
    expect(localStorage.getItem('scribe:explorerModeWidth')).toBe('320')
  })

  it('updates cardModeWidth from 320 to 360', () => {
    // Setup: v1.16.0 localStorage with 320px card width
    localStorage.setItem('scribe:cardModeWidth', '320')

    // Run migration
    migrateToThreeTabSidebar()

    // Verify migration
    expect(localStorage.getItem('scribe:cardModeWidth')).toBe('360')
  })

  it('does not re-migrate if already complete', () => {
    // Setup: v1.17.0 localStorage (migration complete)
    localStorage.setItem('scribe:explorerModeWidth', '320')

    // Run migration again
    const spy = vi.spyOn(console, 'log')
    migrateToThreeTabSidebar()

    // Should skip migration
    expect(spy).not.toHaveBeenCalledWith(expect.stringContaining('Starting'))
  })
})
```

### 13.4 Edge Case Tests

```typescript
describe('Edge Cases', () => {
  it('handles deleted project in Explorer tree', () => {
    const { result } = renderHook(() => useAppViewStore())

    // Expand project in tree
    act(() => result.current.expandExplorerNode('proj-123'))

    // Delete project
    // (ProjectStore.deleteProject should call collapseExplorerNode)

    // Verify project removed from expandedNodes
    expect(result.current.explorerTreeState.expandedNodes.has('proj-123')).toBe(false)
  })

  it('shows empty state for Inbox in Explorer tab', () => {
    render(<MissionSidebar {...props} />)

    // Expand Inbox to Explorer tab
    useAppViewStore.getState().expandVault('inbox')
    useAppViewStore.getState().switchIconTab('vault', 'inbox', 'explorer')

    // Should show helpful message
    expect(screen.getByText(/Inbox notes are not organized by project/i)).toBeInTheDocument()
  })

  it('limits explorerTreeState to 100 nodes on localStorage quota', () => {
    const { result } = renderHook(() => useAppViewStore())

    // Expand 150 projects
    act(() => {
      for (let i = 0; i < 150; i++) {
        result.current.expandExplorerNode(`proj-${i}`)
      }
    })

    // localStorage should only save 100 most recent
    const stored = JSON.parse(localStorage.getItem('scribe:explorerTreeState') || '{}')
    expect(stored.expandedNodes.length).toBeLessThanOrEqual(100)
  })
})
```

---

## 14. Review Checklist

### 14.1 Design Approval

- [ ] Tab bar position approved (in header, not separate layer)
- [ ] Tab types approved (Compact, Card, Explorer)
- [ ] Explorer content approved (tree view with status grouping)
- [ ] Width behavior approved (constant on tab switch, changes on resize)
- [ ] Tab persistence approved (per-icon, independent)
- [ ] Default tabs approved (see Section 4.2)
- [ ] Keyboard shortcuts approved (⌘1/2/3)
- [ ] Visual style approved (macOS pills)

### 14.2 Technical Approval

- [ ] State schema approved (Section 6.1)
- [ ] localStorage schema approved (Section 6.3)
- [ ] Migration strategy approved (Section 11.1)
- [ ] Zustand actions approved (Section 6.2)
- [ ] Performance targets approved (Section 10.1)
- [ ] Component hierarchy approved (Section 5.1)
- [ ] Directory structure approved (Section 5.3)

### 14.3 Implementation Checklist

- [ ] Phase 1: State schema update complete
- [ ] Phase 2: Migration function complete
- [ ] Phase 3: Zustand actions complete
- [ ] Phase 4: UI components complete
- [ ] Phase 5: Tests complete (unit + E2E)
- [ ] Phase 6: Documentation updated
- [ ] All tests passing (0 failures)
- [ ] TypeScript: 0 errors
- [ ] Performance benchmarks met (Section 10.1)

### 14.4 User Testing

- [ ] First-time user discovers tabs easily (< 30 seconds)
- [ ] Per-icon tab memory works correctly (no confusion)
- [ ] Explorer tree expand/collapse is responsive (< 16ms)
- [ ] Width stays constant when switching tabs
- [ ] Keyboard shortcuts work (⌘1/2/3)
- [ ] Screen reader announces tab switches
- [ ] Empty states provide clear guidance
- [ ] Migration from v1.16.0 works seamlessly

### 14.5 Release Criteria

- [ ] All checklist items above complete
- [ ] CHANGELOG.md updated with v1.17.0 features
- [ ] README.md updated with Explorer tab screenshots
- [ ] .STATUS updated to "v1.17.0 Complete"
- [ ] Git branch merged to `dev`
- [ ] PR created for `main` branch
- [ ] Release tagged: `v1.17.0`

---

## Appendix A: Open Questions

These questions were identified during design but not critical for v1.17.0:

1. **Should all icons get all 3 tabs?**
   - **Current decision:** Yes, uniform behavior (simplicity)
   - **Alternative:** Inbox only gets Compact/Card (no tree view)

2. **Should Explorer tab be visible by default?**
   - **Current decision:** Yes, always visible
   - **Alternative:** Hidden until user has 10+ projects

3. **Should tab bar show icons or text?**
   - **Current decision:** Text for v1.17.0 ("Compact", "Card", "Explorer")
   - **Alternative:** Icons in v2.0 if space-constrained (List, Grid, Tree icons)

4. **Should width change when switching tabs?**
   - **Current decision:** No, width stays constant
   - **Alternative:** Card auto-widens to 360px, Compact narrows to 240px

5. **Should there be a "Cycle Tabs" shortcut?**
   - **Current decision:** No, ⌘1/2/3 is clearer
   - **Alternative:** ⌘` cycles Compact → Card → Explorer → Compact

---

## Appendix B: Future Enhancements (v1.18.0+)

**Deferred Features (Not in v1.17.0):**

- **Drag-to-move notes between projects** (Explorer tree)
  - Rationale: UX design complete, implementation deferred to v1.17.0 or v1.18.0
  - Complexity: Medium (requires drag-drop library + Tauri backend updates)

- **Virtual tree rendering** for 100+ projects
  - Rationale: Performance optimization for power users
  - Complexity: Medium (requires `react-window` integration)

- **Search within Explorer tab** (filter projects/notes in tree)
  - Rationale: Improves discoverability at scale
  - Complexity: Low (reuse existing search logic)

- **Context menu on tree nodes** (rename project, create note, etc.)
  - Rationale: Shortcuts for common actions
  - Complexity: Low (reuse existing context menu components)

- **Keyboard navigation in Explorer** (arrow keys, Enter to open)
  - Rationale: Accessibility improvement
  - Complexity: Medium (requires focus management)

- **Bulk operations** (multi-select notes, move all to project)
  - Rationale: Power user efficiency
  - Complexity: High (requires selection state + batch operations)

---

## Appendix C: Tab Comparison Matrix

| Aspect | Compact Tab | Card Tab | Explorer Tab |
|--------|-------------|----------|--------------|
| **Use Case** | Quick scanning | Visual browsing | Organization |
| **Visual Density** | Low (text-only) | Medium (cards) | Medium-High (tree) |
| **Best For** | 10-50 items | 5-20 items | 15+ items |
| **Interaction** | Click to open | Click, hover details | Drag-drop, expand/collapse |
| **Cognitive Load** | Low ⭐ | Medium ⭐⭐ | High ⭐⭐⭐ |
| **ADHD-Friendly** | ✅ Minimal | ✅ Visual cues | ⚠️ Complex but optional |
| **Performance** | ✅ Fast | ✅ Fast | ⚠️ Requires virtual tree |
| **Accessibility** | ✅ Simple list | ✅ Grid navigation | ⚠️ Complex tree nav |
| **Default For** | Inbox, Vault, R-Package, R-Dev | Research, Teaching | None (opt-in) |

---

## Appendix D: CSS Reference

**Tab Switching Animation:**
```css
.tab-panel-enter {
  opacity: 0;
}

.tab-panel-enter-active {
  opacity: 1;
  transition: opacity 150ms ease;
}

.tab-panel-exit {
  opacity: 1;
}

.tab-panel-exit-active {
  opacity: 0;
  transition: opacity 150ms ease;
}
```

**Tab Hover (Subtle):**
```css
.tab:hover:not(.active) {
  background: var(--surface-hover);
  transform: scale(1.02);
  transition: all 150ms ease;
}
```

**Explorer Drag Feedback:**
```css
.tree-node.dragging {
  opacity: 0.5;
  transform: scale(0.95);
  cursor: grabbing;
}

.tree-node.drag-over {
  border-left: 2px solid var(--accent-blue);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { border-color: var(--accent-blue); }
  50% { border-color: var(--accent-blue-light); }
}
```

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  .tab,
  .tab-panel,
  .tree-node {
    transition: none;
    animation: none;
  }
}
```

---

**End of Specification**

**Approval Required:** Review Sections 4 (Design Decisions), 6 (State Management), 11 (Migration), and 12 (Implementation Plan) before proceeding with Phase 1.

**Next Step:** Approve spec → Begin Phase 1 (State Schema Update, 2 hours)
