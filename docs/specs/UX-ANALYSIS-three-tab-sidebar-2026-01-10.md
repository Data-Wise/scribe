# UX Analysis: Three-Tab Sidebar System (v1.17.0)

**Project:** Scribe
**Version:** v1.17.0 (Post Icon-Centric Refactor)
**Created:** 2026-01-10
**Type:** UX Design Analysis

---

## Executive Summary

This document analyzes the proposed three-tab sidebar system for Scribe v1.17.0, where each icon (Inbox, Smart Folders, Pinned Projects) can expand to show content in one of three view tabs: **Compact**, **Card**, or **Explorer**.

**Current Architecture (v1.16.0):** Icon bar (48px) + two-mode expansion (Compact 240px / Card 360px)

**Proposed Architecture (v1.17.0):** Icon bar (48px) + three-tab expansion (Compact / Card / Explorer)

**Design Constraint:** Tab bar lives inside the expanded panel header, not as a separate layer.

---

## 1. User Flow Analysis

### 1.1 First-Time Discovery Journey

**Scenario:** New user launches Scribe for the first time

```
Step 1: User sees icon bar (48px) with icons
├─ Visual cues: Icon Legend overlay (if first launch)
├─ Affordance: Icons are clearly clickable
└─ Mental model: "These are folders I can open"

Step 2: User clicks Research icon
├─ Action: Icon expands to 240px (Compact tab by default)
├─ Visual feedback: Smooth width transition (200ms)
├─ Tab bar appears in header: [Compact] [Card] [Explorer]
└─ Mental model: "The folder opened and now I can switch views"

Step 3: User notices tabs in header
├─ Visual: Three pill-style tabs, Compact selected
├─ Affordance: Other tabs are clearly clickable
└─ Curiosity: "What's in Card? What's in Explorer?"

Step 4: User clicks Card tab
├─ Action: Panel stays same width, switches to card grid
├─ Visual feedback: Content fade transition
├─ Learning: "Same items, different layout"
└─ Mental model: "Tabs change how I view the items"

Step 5: User clicks Explorer tab
├─ Action: Panel stays same width, switches to tree view
├─ Visual feedback: Tree structure appears
├─ Learning: "This shows hierarchy"
└─ Mental model: "Explorer is for organizing"

Step 6: User clicks different icon
├─ Action: Panel switches to Teaching projects
├─ Tab selection: Stays on Explorer (last used)
├─ Learning: "Tab choice persists across icons"
└─ Mental model: "Each icon remembers which tab I prefer"
```

**UX Insight:** First discovery requires clear visual hierarchy. Tab bar must be prominent enough to discover but not overwhelming. Icon Legend should explain tabs exist.

---

### 1.2 Power User Flow

**Scenario:** Experienced user managing 15 research projects

```
User Goal: Find a specific research project and drag it to Teaching
├─ Click Research icon → Expands to Explorer tab (remembered preference)
├─ Tree shows: "Projects > Mediation (12 notes) > Product of Three (8 notes)"
├─ Drag "Mediation" project to Teaching icon
├─ Drop feedback: Teaching icon highlights
└─ Result: Project moved, tree updates

Alternative Flow:
├─ User prefers Card view for visual recognition
├─ Switches to Card tab (⌘2 shortcut)
├─ Sees project cards with descriptions and activity dots
└─ Finds project visually by thumbnail/color
```

**UX Insight:** Power users need keyboard shortcuts (⌘1/2/3) and drag-drop across tabs. Tab selection should be instant (no waiting for content to load).

---

## 2. Information Architecture

### 2.1 When to Use Each Tab

| Tab | Purpose | Best For | Visual Density | Interaction |
|-----|---------|----------|----------------|-------------|
| **Compact** | Quick scanning, minimal detail | Lists, finding items by name | Low (text-only) | Click to open |
| **Card** | Rich preview, visual browsing | Discovery, metadata review | Medium (cards with stats) | Click, view details |
| **Explorer** | Hierarchy, organization, bulk operations | Drag-to-move, nesting | Medium-High (tree + indent) | Drag-drop, expand/collapse |

**Default Tab per Icon Type:**

```typescript
const DEFAULT_TABS: Record<IconType, TabId> = {
  // Inbox: Linear list, no hierarchy
  'inbox': 'compact',  // Default: Quick capture review

  // Smart Folders: Filtered projects
  'research': 'card',    // Default: Browse research visually
  'teaching': 'card',    // Default: Browse courses visually
  'r-package': 'compact', // Default: Fewer items, name-based
  'r-dev': 'compact',    // Default: Fewer items, name-based

  // Pinned Projects: Individual project view
  'vault': 'compact'     // Default: Note list (no hierarchy in single project)
}
```

**Rationale:**
- **Inbox:** Always flat list, no hierarchy → Compact is sufficient
- **Smart Folders (Research/Teaching):** Many items, benefit from visual cards
- **Smart Folders (R-Package/R-Dev):** Fewer items, name recognition → Compact
- **Pinned Projects:** Single project's notes → Compact list

**UX Insight:** Default tab should match the icon's primary use case. Don't force all icons to the same default.

---

### 2.2 Tab Content Specifications

#### Compact Tab

```
┌─────────────────────────────────────────┐
│ Research Projects          [●][○][○]    │ ← Tab pills in header
├─────────────────────────────────────────┤
│ □ Mediation Planning      📝 12 • 2h    │ ← Checkbox, name, count, time
│ □ Product of Three        📝  8 • 1d    │
│ □ Collider Bias           📝  5 • 3d    │
│ □ Sensitivity Analysis    📝  3 • 5d    │
└─────────────────────────────────────────┘
```

**Features:**
- Checkbox for bulk selection
- Project name (truncated if needed)
- Note count + last edited time
- Status dot (color-coded)
- Keyboard navigation (↑↓)

**Optimized For:** Scanning 20+ items quickly

---

#### Card Tab

```
┌─────────────────────────────────────────┐
│ Research Projects          [○][●][○]    │
├─────────────────────────────────────────┤
│ ┌─────────────────┐ ┌────────────────┐ │
│ │ Mediation       │ │ Product of 3   │ │
│ │ Planning        │ │                │ │
│ ├─────────────────┤ ├────────────────┤ │
│ │ 📝 12 notes     │ │ 📝 8 notes     │ │
│ │ 🟢 Active       │ │ 🟢 Active      │ │
│ │ ●●●●○○ 4/6 wks  │ │ ●●●○○○ 3/6 wks │ │ ← Activity dots
│ │ Last: 2h ago    │ │ Last: 1d ago   │ │
│ └─────────────────┘ └────────────────┘ │
└─────────────────────────────────────────┘
```

**Features:**
- 2-column grid (responsive)
- Project description (first line)
- Note count, status, activity dots
- Visual hierarchy with borders
- Hover preview

**Optimized For:** Visual recognition, 5-15 items

---

#### Explorer Tab

```
┌─────────────────────────────────────────┐
│ Research Projects          [○][○][●]    │
├─────────────────────────────────────────┤
│ ▼ Active (3)                            │ ← Grouping by status
│   ├─ 📁 Mediation Planning      12      │ ← Drag handle
│   ├─ 📁 Product of Three         8      │
│   └─ 📁 Collider Bias            5      │
│ ▼ Paused (1)                            │
│   └─ 📁 Sensitivity Analysis     3      │
│                                         │
│ [+ New Research Project]                │ ← Quick action
└─────────────────────────────────────────┘
```

**Features:**
- Tree structure with expand/collapse
- Drag handles for reordering
- Status grouping (if 10+ projects)
- Indent levels for hierarchy
- Quick actions at bottom

**Optimized For:** Organization, bulk moves, 15+ items

---

## 3. Interaction Patterns

### 3.1 Tab Switching

**Click Interaction:**
```typescript
onClick(tabId: 'compact' | 'card' | 'explorer') {
  // 1. Update tab selection immediately (no delay)
  setActiveTab(tabId)

  // 2. Fade out old content (100ms)
  // 3. Fade in new content (100ms)
  // Total: 200ms smooth transition

  // 4. Save preference for this icon
  saveIconTabPreference(expandedIcon.id, tabId)

  // 5. Width stays constant (no resize)
}
```

**Keyboard Shortcuts:**
```
⌘1 → Switch to Compact tab
⌘2 → Switch to Card tab
⌘3 → Switch to Explorer tab
```

**Visual Feedback:**
- Selected tab: Solid background, bold text
- Unselected tabs: Transparent background, normal text
- Hover: Subtle background color
- Focus indicator: Blue outline (accessibility)

**UX Principle:** Tabs are instant switches, not navigation. Content belongs to the same context (the expanded icon), just viewed differently.

---

### 3.2 Tab Bar Design (macOS Pill Style)

```css
/* Tab Bar Structure */
.tab-bar {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--surface-secondary);
  border-radius: 8px;
  width: fit-content;
}

.tab {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
}

.tab.active {
  background: var(--surface-elevated);
  color: var(--text-primary);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.tab:not(.active) {
  background: transparent;
  color: var(--text-tertiary);
}

.tab:not(.active):hover {
  background: var(--surface-hover);
  color: var(--text-secondary);
}
```

**Visual Example:**

```
┌──────────────────────────────────────────┐
│ Research Projects   [Compact][Card][Explorer] │ ← Pill tabs
├──────────────────────────────────────────┤
│ Content area...                          │
└──────────────────────────────────────────┘

Selected State:
┌────────────────────────────────────────────────┐
│ Research    [Compact][░Card░][Explorer]       │ ← Card selected (elevated)
└────────────────────────────────────────────────┘
```

**UX Insight:** Pill design is familiar to macOS users (Finder tabs, System Settings). Connected segments feel cohesive.

---

### 3.3 Drag Operations in Explorer Tab

**Drag-to-Move Project:**

```typescript
onDragStart(projectId: string) {
  // 1. Visual feedback: Semi-transparent clone follows cursor
  setDraggedProject(projectId)

  // 2. Valid drop zones highlight
  highlightDropZones(['research', 'teaching', 'r-package'])

  // 3. Invalid zones gray out
}

onDrop(targetIconId: string) {
  // 1. Update project type
  updateProject(draggedProject.id, { type: targetIconId })

  // 2. Success animation: Bounce (300ms)
  animateSuccess()

  // 3. Update both trees
  refreshTree(sourceIcon)
  refreshTree(targetIcon)
}
```

**Visual Feedback:**
- Dragging: 50% opacity + 0.95 scale
- Drop zone: Pulsing blue outline (2px)
- Success: Green checkmark + bounce
- Invalid: Red X + shake

**UX Principle:** Drag-drop is powerful but requires clear affordances. Only enable in Explorer tab (not Compact/Card).

---

## 4. Accessibility

### 4.1 Keyboard Navigation

| Action | Shortcut | Context |
|--------|----------|---------|
| Switch to Compact | ⌘1 | Any tab active |
| Switch to Card | ⌘2 | Any tab active |
| Switch to Explorer | ⌘3 | Any tab active |
| Next item | ↓ | List/tree focused |
| Previous item | ↑ | List/tree focused |
| Expand tree node | → | Explorer tab, node focused |
| Collapse tree node | ← | Explorer tab, node focused |
| Select item | Enter | Any tab |
| Multi-select | ⇧↑/↓ | Compact/Explorer tabs |
| Select all | ⌘A | Compact/Explorer tabs |

**Focus Management:**

```typescript
onTabSwitch(newTab: TabId) {
  // 1. Switch tab content
  setActiveTab(newTab)

  // 2. Focus first item in new tab
  const firstItem = getFirstItem(newTab)
  firstItem?.focus()

  // 3. Announce to screen reader
  announceToScreenReader(`Switched to ${newTab} view`)
}
```

---

### 4.2 Screen Reader Support

**ARIA Attributes:**

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

**Screen Reader Announcements:**

```
User clicks Research icon:
→ "Research Projects expanded. Compact view. 12 items."

User presses ⌘2:
→ "Switched to Card view. 12 projects."

User presses ↓:
→ "Mediation Planning, Active, 12 notes, last edited 2 hours ago."
```

---

### 4.3 Color Contrast & Focus Indicators

**Color Contrast (WCAG 2.1 AA):**
- Tab text (selected): 7:1 contrast ratio
- Tab text (unselected): 4.5:1 contrast ratio
- Focus outline: 3:1 against background

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

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  .tab,
  .tab-panel {
    transition: none;
  }
}
```

---

## 5. ADHD-Friendly Design

### 5.1 Cognitive Load Reduction

**Principle 1: One Thing at a Time**
- Only ONE icon expanded at a time (accordion pattern)
- Only ONE tab visible at a time
- No nested tabs or sub-navigation

**Principle 2: Clear Visual Hierarchy**
```
Icon Bar (48px)     → Primary navigation
Tab Bar (header)    → Secondary navigation (view mode)
Content Area        → Focus area (no clutter)
```

**Principle 3: Escape Hatches**
- Click icon again → Collapse (quick exit)
- Esc key → Collapse panel
- ⌘1/2/3 → Switch view without scrolling

---

### 5.2 Progressive Disclosure

**Level 1: Icon Bar**
- Minimal: Just icons + status dots
- Zero cognitive load: "What folders exist?"

**Level 2: Compact Tab (Default)**
- Essential: Names + counts
- Low cognitive load: "What's in this folder?"

**Level 3: Card Tab**
- Detailed: Cards with metadata
- Medium cognitive load: "Which one do I need?"

**Level 4: Explorer Tab**
- Organizational: Tree structure
- High cognitive load: "How are things organized?"

**UX Insight:** Default to Compact for most icons. Let users opt-in to richer views (Card/Explorer) when needed.

---

### 5.3 Sensory-Friendly Design

**Visual Noise Reduction:**
- Tabs: Subtle colors, no gradients
- Content: Generous padding (12px+)
- Animations: Smooth but fast (150-200ms)

**Theme-Aware:**
```typescript
const TAB_COLORS = {
  light: {
    active: 'rgba(0,0,0,0.08)',
    hover: 'rgba(0,0,0,0.04)',
    inactive: 'transparent'
  },
  dark: {
    active: 'rgba(255,255,255,0.12)',
    hover: 'rgba(255,255,255,0.06)',
    inactive: 'transparent'
  }
}
```

**No Distracting Animations:**
- Tab switch: Simple fade (no slide/flip)
- Content load: Instant (no skeleton screens)
- Hover: Subtle color shift (no scale/shadow)

---

## 6. Visual Hierarchy

### 6.1 Tab Prominence

**Visual Weight (Descending):**
```
1. Icon Bar Icons         → Primary entry point (large, colorful)
2. Expanded Panel Header  → Context label (medium, bold)
3. Tab Bar                → View switcher (small, subtle)
4. Content Area           → Focus area (large, scrollable)
5. Resize Handle          → Utility (barely visible)
```

**Tab Bar Placement:**
```
┌─────────────────────────────────────────────────┐
│ 🔬 Research Projects     [C][W][E]        [×]  │ ← Header (one line)
├─────────────────────────────────────────────────┤
│ Content area (full height)...                   │
│                                                 │
│                                                 │
└─────────────────────────────────────────────────┘

NOT this (separate layer):
┌─────────────────────────────────────────────────┐
│ 🔬 Research Projects                      [×]  │
├─────────────────────────────────────────────────┤
│ [Compact] [Card] [Explorer]                     │ ← Wastes space
├─────────────────────────────────────────────────┤
│ Content area...                                 │
└─────────────────────────────────────────────────┘
```

**UX Insight:** Tabs in header save vertical space and feel integrated (not like a separate navigation layer).

---

### 6.2 Tab-Content Relationship

**Visual Connection:**
```css
.expanded-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid var(--border-subtle);
}

.tab-bar {
  /* Visually connected to header, not content */
  background: var(--surface-secondary);
  border-radius: 8px;
}

.tab-panel {
  /* Clearly separate from header */
  padding: 12px;
  background: var(--surface-primary);
}
```

**Layout Example:**
```
┌─────────────────────────────────────────────────┐
│ Research Projects     [C][W][E]        [×]      │ ← Header (gray bg)
├─────────────────────────────────────────────────┤ ← Clear divider
│                                                 │
│ Content (white bg)                              │ ← Distinct from header
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 7. Edge Cases

### 7.1 Empty States

**Empty Inbox (Compact Tab):**
```
┌─────────────────────────────────────────────────┐
│ 📥 Inbox             [●][○][○]            [×]  │
├─────────────────────────────────────────────────┤
│                                                 │
│                      📭                         │
│                                                 │
│              Inbox is empty                     │
│                                                 │
│    Capture quick thoughts and fleeting ideas    │
│                                                 │
│              [⌘⇧C Quick Capture]                │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Empty Smart Folder (Card Tab):**
```
┌─────────────────────────────────────────────────┐
│ 🔬 Research          [○][●][○]            [×]  │
├─────────────────────────────────────────────────┤
│                                                 │
│                      📂                         │
│                                                 │
│          No research projects yet               │
│                                                 │
│  Create your first research project to start    │
│                                                 │
│            [+ New Research Project]             │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Empty Explorer Tab:**
```
┌─────────────────────────────────────────────────┐
│ 🔬 Research          [○][○][●]            [×]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  No projects to organize                        │
│                                                 │
│  Create projects to use tree view               │
│                                                 │
│  [Switch to Compact]  [+ New Project]           │
│                                                 │
└─────────────────────────────────────────────────┘
```

**UX Insight:** Empty states should guide users to the next action. Explorer tab is useless when empty → suggest switching tabs.

---

### 7.2 Single Item

**Single Project in Research Folder:**

**Compact Tab:**
```
┌─────────────────────────────────────────────────┐
│ 🔬 Research          [●][○][○]            [×]  │
├─────────────────────────────────────────────────┤
│ □ Mediation Planning      📝 12 • 2h            │
│                                                 │
│ [+ Add Another Project]                         │
└─────────────────────────────────────────────────┘
```

**Card Tab:**
```
┌─────────────────────────────────────────────────┐
│ 🔬 Research          [○][●][○]            [×]  │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────┐             │
│ │ Mediation Planning              │             │
│ ├─────────────────────────────────┤             │
│ │ 📝 12 notes                     │             │
│ │ 🟢 Active                       │             │
│ │ ●●●●○○ 4/6 weeks                │             │
│ │ Last: 2h ago                    │             │
│ └─────────────────────────────────┘             │
│                                                 │
│ [+ Add Another Project]                         │
└─────────────────────────────────────────────────┘
```

**Explorer Tab:**
```
┌─────────────────────────────────────────────────┐
│ 🔬 Research          [○][○][●]            [×]  │
├─────────────────────────────────────────────────┤
│ ▼ Active (1)                                    │
│   └─ 📁 Mediation Planning      12              │
│                                                 │
│ [+ Add Another Project]                         │
└─────────────────────────────────────────────────┘
```

**UX Insight:** Single items still work in all tabs. Card tab shows rich detail, Explorer shows flat structure (no deep nesting).

---

### 7.3 100+ Items

**Compact Tab with 100 Projects:**
```
┌─────────────────────────────────────────────────┐
│ 🔬 Research (100)    [●][○][○]    🔍      [×]  │ ← Search icon added
├─────────────────────────────────────────────────┤
│ [Filter: ▼ All Status] [Sort: ▼ Recent]        │ ← Filters appear
├─────────────────────────────────────────────────┤
│ □ Mediation Planning      📝 12 • 2h            │
│ □ Product of Three        📝  8 • 1d            │
│ □ Collider Bias           📝  5 • 3d            │
│ ...                                             │
│ (Virtual scroll, 50 items visible)              │
└─────────────────────────────────────────────────┘
```

**Card Tab with 100 Projects:**
```
┌─────────────────────────────────────────────────┐
│ 🔬 Research (100)    [○][●][○]    🔍      [×]  │
├─────────────────────────────────────────────────┤
│ [Filter: ▼ All Status] [Sort: ▼ Recent]        │
├─────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│ │ Card 1  │ │ Card 2  │ │ Card 3  │            │
│ └─────────┘ └─────────┘ └─────────┘            │
│ ...                                             │
│ (Virtual grid, 30 cards visible)                │
└─────────────────────────────────────────────────┘
```

**Explorer Tab with 100 Projects:**
```
┌─────────────────────────────────────────────────┐
│ 🔬 Research (100)    [○][○][●]    🔍      [×]  │
├─────────────────────────────────────────────────┤
│ [Filter: ▼ All Status] [Sort: ▼ Alphabetical]  │
├─────────────────────────────────────────────────┤
│ ▼ Active (45)                                   │ ← Status grouping kicks in
│   ├─ 📁 A/B Testing Study       8               │
│   ├─ 📁 Bayesian Methods        5               │
│   └─ ... (43 more)                              │
│ ▼ Paused (30)                                   │
│   └─ ...                                        │
│ ▶ Complete (25)                                 │ ← Collapsed by default
│ (Virtual tree, smooth scroll)                   │
└─────────────────────────────────────────────────┘
```

**Performance Optimizations:**
- Virtual scrolling (only render visible items)
- Lazy load images (Card tab)
- Debounced search (300ms)
- Throttled scroll (60fps)

**UX Insight:** At 100+ items, all tabs need search + filters. Explorer tab benefits most from status grouping (10+ items).

---

## 8. Mobile/Responsive (Future Consideration)

**Current Scope:** Desktop app (Tauri) only

**If Mobile Support Added:**

**Tablet (768px+):**
- Full three-tab system works
- Tabs stack vertically on narrow screens

**Phone (< 768px):**
- Icon bar becomes bottom navigation
- Single tab at a time (no tab bar)
- Swipe between tabs instead of clicking

**Responsive Tab Bar:**
```css
@media (max-width: 320px) {
  .tab-bar {
    /* Switch to icon-only tabs */
    .tab-text { display: none; }
    .tab-icon { display: block; }
  }
}
```

**Out of Scope for v1.17.0:** Mobile is not a priority per PROJECT-DEFINITION.md.

---

## 9. Common UX Pitfalls to Avoid

### 9.1 Tab Overload

**Problem:** Three tabs per icon = 3 × 8 icons = 24 different views
**Solution:** Defaults matter. Most users will use 1-2 tabs consistently.

**Mitigation:**
- Clear defaults (Compact for most)
- Persistence (remember last tab per icon)
- Keyboard shortcuts (quick switching)

---

### 9.2 Tab Confusion

**Problem:** Users forget which tab they're on
**Solution:** Visual reminders

**Mitigation:**
- Selected tab is always highlighted
- Content reflects tab type (list vs cards vs tree)
- Tab name is descriptive (not "View 1", "View 2")

---

### 9.3 Drag-Drop Accidents

**Problem:** Users accidentally drag in Compact/Card tabs
**Solution:** Only enable drag in Explorer tab

```typescript
const isDraggable = currentTab === 'explorer'
```

**Visual Cue:** Drag handles only visible in Explorer tab.

---

### 9.4 Width Jumping

**Problem:** Tabs switch but width changes unexpectedly
**Solution:** Width stays constant when switching tabs

```typescript
onTabSwitch(newTab: TabId) {
  // Width DOES NOT change
  // Only content changes
}
```

**Exception:** If user manually resizes, width updates for current tab only.

---

### 9.5 Empty State Dead Ends

**Problem:** User lands on empty Explorer tab with no guidance
**Solution:** Empty states suggest next action

```
No projects to organize → [Switch to Compact] [+ New Project]
```

---

### 9.6 Tab Persistence Confusion

**Problem:** User switches to Card for Research, expects Teaching to also be Card
**Solution:** Each icon has independent tab preference

**Clarify with Tooltips:**
```
Tab persists per folder. Research → Card, Teaching → Compact.
```

---

## 10. Recommended Design Decisions

### 10.1 Default Tab per Icon Type

```typescript
const RECOMMENDED_DEFAULTS: Record<IconType, TabId> = {
  'inbox': 'compact',      // Linear list, minimal
  'research': 'card',      // Visual browsing, 5-20 items
  'teaching': 'card',      // Visual browsing, courses
  'r-package': 'compact',  // Few items, name-based
  'r-dev': 'compact',      // Few items, name-based
  'vault': 'compact'       // Single project notes
}
```

---

### 10.2 Keyboard Shortcuts

```typescript
const TAB_SHORTCUTS = {
  '⌘1': 'compact',
  '⌘2': 'card',
  '⌘3': 'explorer'
}
```

**Rationale:** Matches Editor modes (⌘1 Source, ⌘2 Live, ⌘3 Reading). Familiar pattern.

---

### 10.3 Visual Mockup Description

**Header Layout:**

```
┌─────────────────────────────────────────────────────────┐
│ [Icon] Label (Count)   [Tab1][Tab2][Tab3]   [Mode][×]  │
└─────────────────────────────────────────────────────────┘
│                                                         │
│ 16px   200px           100px               32px 32px   │
```

**Tab Pills (macOS Style):**

```css
/* Connected segments */
.tab-bar {
  display: flex;
  background: rgba(0,0,0,0.05);
  border-radius: 8px;
  padding: 4px;
  gap: 2px; /* Minimal gap for visual separation */
}

.tab {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: all 150ms ease;
}

.tab.active {
  background: white; /* Or theme surface */
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
}
```

**Visual Hierarchy:**

```
Primary:   Icon + Label          (18px icon, 16px bold text)
Secondary: Tab Bar                (13px normal text)
Tertiary:  Mode Toggle + Close   (16px icons, gray)
```

---

### 10.4 Accessibility Checklist

**Keyboard Navigation:**
- [ ] ⌘1/2/3 switch tabs
- [ ] ↑↓ navigate items in all tabs
- [ ] →← expand/collapse in Explorer tab
- [ ] Enter selects item
- [ ] Esc collapses panel

**Screen Reader:**
- [ ] Tab bar has `role="tablist"`
- [ ] Each tab has `role="tab"` + `aria-selected`
- [ ] Content has `role="tabpanel"` + `aria-labelledby`
- [ ] Status changes announced ("Switched to Card view")

**Visual:**
- [ ] Focus indicators on all interactive elements
- [ ] Color contrast 4.5:1 minimum (text)
- [ ] Color contrast 3:1 minimum (UI components)
- [ ] No color-only information (use icons + text)

**Motion:**
- [ ] Respect `prefers-reduced-motion`
- [ ] Transitions can be disabled in Settings
- [ ] No auto-playing animations

---

## 11. User Journey Diagrams

### 11.1 First-Time User (Compact → Card Discovery)

```
Start: User opens Scribe
│
├─ Sees icon bar with Research icon
│  └─ Tooltip: "Research Projects (3)"
│
Click Research icon
│
├─ Panel expands to 240px (Compact tab)
│  ├─ Header: "Research Projects [●Compact][Card][Explorer]"
│  ├─ Content: List of 3 projects
│  └─ Mental model: "This is a list view"
│
Notices "Card" tab in header
│
├─ Curiosity: "What's Card?"
│  └─ Clicks Card tab
│
Content switches to card grid
│
├─ Visual feedback: Smooth fade transition
│  ├─ Same 3 projects, now as cards
│  ├─ More detail visible (descriptions, stats)
│  └─ Mental model: "Card is for visual browsing"
│
Switches back to Compact
│
└─ Preference saved: Research → Compact (last used)
```

---

### 11.2 Power User (Drag-to-Move via Explorer)

```
Goal: Move "Mediation" project from Research to Teaching
│
Click Research icon
│
├─ Panel expands to Explorer tab (remembered preference)
│  └─ Tree shows: Active (3) / Paused (1)
│
Find "Mediation" project in tree
│
├─ Drag handle visible (Explorer tab only)
│  └─ Click and hold drag handle
│
Drag project to Teaching icon
│
├─ Teaching icon highlights (valid drop zone)
│  └─ Drop feedback: Pulsing blue outline
│
Release mouse
│
├─ Success animation: Green checkmark + bounce
│  ├─ Mediation moves to Teaching
│  ├─ Research tree updates (2 active)
│  └─ Teaching tree updates (1 active)
│
Result: Project moved, no extra clicks needed
```

---

## 12. Implementation Recommendations

### 12.1 Phased Rollout

**Phase 1: Two-Tab System (v1.16.0)**
- Compact + Card tabs (current plan)
- Validate tab switching UX
- Test persistence logic

**Phase 2: Add Explorer Tab (v1.17.0)**
- Introduce third tab
- Implement tree view
- Add drag-drop capability

**Rationale:** Lower risk. Validate tab UX with 2 tabs before adding complexity.

---

### 12.2 A/B Testing Considerations

**Test Hypothesis:** Do users discover and use multiple tabs?

**Metrics to Track:**
- Tab switch frequency (per session)
- Most-used tab (by icon type)
- Time to first tab switch (first session)
- Tab abandonment (users who never switch)

**Instrumentation:**
```typescript
analytics.track('tab_switched', {
  iconType: 'research',
  fromTab: 'compact',
  toTab: 'card',
  method: 'click' | 'keyboard'
})
```

---

### 12.3 Settings Integration

**New Settings (Appearance Category):**

```typescript
{
  id: 'sidebar.defaultTabMode',
  type: 'select',
  label: 'Default tab for new icons',
  description: 'Which tab to show when expanding an icon for the first time',
  options: [
    { value: 'compact', label: 'Compact (List)' },
    { value: 'card', label: 'Card (Grid)' },
    { value: 'explorer', label: 'Explorer (Tree)' },
    { value: 'auto', label: 'Auto (Based on icon type)' }
  ],
  defaultValue: 'auto'
}
```

**UX Insight:** "Auto" mode uses recommended defaults (Compact for most, Card for Research/Teaching). Power users can override.

---

## 13. Summary & Next Steps

### 13.1 Key Takeaways

**Strong UX Foundation:**
- Three-tab system provides flexibility without overwhelming users
- Defaults matter: Compact for most, Card for visual browsing, Explorer for organization
- Tab-per-icon persistence prevents mode confusion

**ADHD-Friendly:**
- Progressive disclosure (start simple, reveal complexity on demand)
- Clear escape hatches (Esc, click icon again)
- No cognitive load spikes (one tab at a time, smooth transitions)

**Accessible:**
- Keyboard shortcuts (⌘1/2/3)
- Screen reader support (ARIA roles)
- Focus indicators and color contrast

**Scalable:**
- Handles empty states, single items, and 100+ items
- Virtual scrolling for performance
- Search + filters at scale

---

### 13.2 Recommended Default Tab Settings

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

---

### 13.3 Critical Success Factors

1. **Tab Discovery:** Icon Legend should mention tabs exist
2. **Tab Clarity:** Visual design makes active tab obvious
3. **Tab Performance:** Switches feel instant (< 200ms)
4. **Tab Persistence:** Each icon remembers last tab independently
5. **Tab Defaults:** Smart defaults reduce decision fatigue

---

### 13.4 Open Questions for User

1. **Should all icons get all 3 tabs?**
   - Alternative: Inbox only gets Compact (no tree view makes sense)
   - Recommendation: Uniform behavior (all icons, all tabs) for simplicity

2. **Should Explorer tab be enabled by default?**
   - Alternative: Hidden until user has 10+ projects
   - Recommendation: Always visible but defaults to Compact/Card

3. **Should tab bar show icons or text?**
   - Text: "Compact" "Card" "Explorer" (clearer but longer)
   - Icons: List/Grid/Tree icons (shorter but less obvious)
   - Recommendation: Text for v1.17.0, icons for v2.0 (space-constrained)

4. **Should width change when switching tabs?**
   - Current plan: No (width stays constant)
   - Alternative: Card tab auto-widens to 360px, Compact stays 240px
   - Recommendation: Keep constant (less jarring)

5. **Should there be a "Cycle Tabs" keyboard shortcut?**
   - Example: ⌘` cycles Compact → Card → Explorer → Compact
   - Recommendation: No, ⌘1/2/3 is clearer (no mental cycling)

---

### 13.5 Next Steps

1. **Design Review:** Share this analysis with DT for approval
2. **Visual Mockups:** Create high-fidelity mockups in Figma (optional)
3. **Prototype:** Build quick React prototype to test tab switching feel
4. **Spec Document:** Convert approved design into technical spec
5. **Implementation:** Phase 1 (State + Components) → Phase 2 (Testing + Polish)

---

## Appendix A: Tab Comparison Matrix

| Aspect | Compact Tab | Card Tab | Explorer Tab |
|--------|-------------|----------|--------------|
| **Use Case** | Quick scanning | Visual browsing | Organization |
| **Visual Density** | Low (text-only) | Medium (cards) | Medium-High (tree) |
| **Best For** | 10-50 items | 5-20 items | 15+ items |
| **Interaction** | Click to open | Click, hover details | Drag-drop, expand/collapse |
| **Cognitive Load** | Low | Medium | High |
| **ADHD-Friendly** | ✅ Minimal | ✅ Visual cues | ⚠️ Complex but optional |
| **Performance** | ✅ Fast | ✅ Fast | ⚠️ Requires virtual tree |
| **Accessibility** | ✅ Simple list | ✅ Grid navigation | ⚠️ Complex tree nav |
| **Default For** | Inbox, Vault, R-Package, R-Dev | Research, Teaching | None (opt-in) |

---

## Appendix B: CSS Transitions Reference

```css
/* Tab Switching Animation */
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

/* Tab Hover (Subtle) */
.tab:hover:not(.active) {
  background: var(--surface-hover);
  transform: scale(1.02);
  transition: all 150ms ease;
}

/* Width Stays Constant */
.expanded-icon-panel {
  width: var(--panel-width);
  /* NO transition on width during tab switch */
}

/* Drag Feedback */
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

---

**Document Version:** 1.0
**Author:** Claude Sonnet 4.5 (UX/UI Designer)
**Status:** Draft for Review
**Next Review:** After DT approval
