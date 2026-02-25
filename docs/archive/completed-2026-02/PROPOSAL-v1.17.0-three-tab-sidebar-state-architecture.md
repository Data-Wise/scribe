# v1.17.0 Three-Tab Sidebar State Architecture

**Generated:** 2026-01-10
**Context:** Scribe state management - Icon expansion to three-tab panel
**Version:** v1.16.0 → v1.17.0

---

## Overview

Extend the v1.16.0 icon-centric sidebar architecture to support three tabs per expanded icon: Compact, Card, and Explorer. Each icon remembers its last active tab independently.

---

## 1. State Schema Evolution

### Current v1.16.0 Schema

```typescript
interface PinnedVault {
  id: string
  label: string
  color?: string
  order: number
  isPermanent: boolean
  preferredMode?: 'compact' | 'card'  // Per-icon mode preference
}

interface SmartIcon {
  id: SmartIconId
  label: string
  icon: string
  color: string
  projectType: ProjectType
  isVisible: boolean
  isExpanded: boolean  // DEPRECATED
  order: number
  preferredMode?: 'compact' | 'card'  // Per-icon mode preference
}

interface AppViewState {
  expandedIcon: ExpandedIconType  // { type: 'vault' | 'smart', id: string } | null
  sidebarWidth: number
  compactModeWidth: number  // Global width for compact mode
  cardModeWidth: number     // Global width for card mode
}
```

### Proposed v1.17.0 Schema

```typescript
// NEW: Tab type with 3 options
type IconTabType = 'compact' | 'card' | 'explorer'

interface PinnedVault {
  id: string
  label: string
  color?: string
  order: number
  isPermanent: boolean
  activeTab: IconTabType  // NEW: Replaces preferredMode (which tab is active)
}

interface SmartIcon {
  id: SmartIconId
  label: string
  icon: string
  color: string
  projectType: ProjectType
  isVisible: boolean
  isExpanded: boolean  // DEPRECATED (kept for backwards compat)
  order: number
  activeTab: IconTabType  // NEW: Replaces preferredMode (which tab is active)
}

// Explorer tree state (NEW)
interface ExplorerTreeState {
  expandedNodes: Set<string>  // Node IDs (project IDs) that are expanded
}

interface AppViewState {
  expandedIcon: ExpandedIconType  // { type: 'vault' | 'smart', id: string } | null
  sidebarWidth: number
  compactModeWidth: number   // Global width for compact mode (240px)
  cardModeWidth: number      // Global width for card mode (360px)
  explorerModeWidth: number  // NEW: Global width for explorer mode (320px)

  // Explorer state
  explorerTreeState: ExplorerTreeState  // NEW: Tree expand/collapse state

  // Actions (updated)
  switchIconTab: (type: 'vault' | 'smart', id: string, tab: IconTabType) => void
  toggleExplorerNode: (projectId: string) => void
  expandExplorerNode: (projectId: string) => void
  collapseExplorerNode: (projectId: string) => void
  collapseAllExplorerNodes: () => void
}
```

---

## 2. Key Design Decisions

### Decision 1: `activeTab` vs `preferredMode`

**Rename `preferredMode` → `activeTab`**

- **Rationale:** "Mode" implies UI display density (compact vs card), but now we have 3 tabs with different content, not just display modes. "Active tab" is clearer.
- **Migration:** Auto-convert `preferredMode: 'compact'` → `activeTab: 'compact'`, etc.

### Decision 2: Global Width Per Tab Type

**Keep 3 global widths: `compactModeWidth`, `cardModeWidth`, `explorerModeWidth`**

- **Rationale:** All icons share the same width when in the same tab (consistent UX). User can resize once and all icons adopt that width for that tab.
- **Defaults:**
  - Compact: 240px (unchanged)
  - Card: 360px (increased from 320px for better card layout)
  - Explorer: 320px (new, good for tree hierarchy)

### Decision 3: Tree State Persistence

**Store expanded project IDs in `explorerTreeState.expandedNodes` (Set)**

- **Rationale:** Tree state should persist across icon switches (UX: collapsing a project folder shouldn't reset when switching icons).
- **Scope:** Global across all icons (not per-icon). This keeps tree state consistent.
- **Alternative considered:** Per-icon tree state → Rejected (confusing UX, higher complexity).

### Decision 4: Tab Switching Does Not Change Width

**Switching tabs keeps current width, then snaps to tab's global width**

- **Rationale:** Width is tied to tab type, not icon. Switching from Compact (240px) → Explorer (320px) auto-adjusts width to Explorer's global width.
- **Behavior:**
  - Click icon → Expand to last active tab (e.g., Compact at 240px)
  - Click "Explorer" tab → Switch to Explorer view, width becomes 320px (Explorer global width)
  - Resize Explorer → Updates `explorerModeWidth`, affects all icons in Explorer tab

---

## 3. State Transition Diagram

### Icon Click (Collapsed → Expanded)

```
User: Click icon (vault or smart)
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
UI: Render panel with active tab (tab bar shows Compact | Card | Explorer)
```

### Tab Click (Switch Tab)

```
User: Click "Explorer" tab in panel header
  ↓
Zustand: switchIconTab('vault', vaultId, 'explorer')
  ↓
Update: vault.activeTab = 'explorer'
        sidebarWidth = explorerModeWidth
  ↓
Persist: localStorage (pinnedVaults, sidebarWidth)
  ↓
UI: Re-render with Explorer tree view, width = 320px
```

### Resize Panel (Updates Global Width)

```
User: Drag resize handle in Explorer tab
  ↓
Zustand: setSidebarWidth(newWidth)
  ↓
Detect: Current tab = 'explorer' (from expandedIcon + icon.activeTab)
  ↓
Update: sidebarWidth = constrained(newWidth, 200, 500)
        explorerModeWidth = sidebarWidth
  ↓
Persist: localStorage (sidebarWidth, explorerModeWidth)
  ↓
Effect: All icons will use 320px+ when expanded in Explorer tab
```

### Explorer Tree: Toggle Node

```
User: Click expand/collapse arrow on project node
  ↓
Zustand: toggleExplorerNode(projectId)
  ↓
Update: explorerTreeState.expandedNodes.toggle(projectId)
  ↓
Persist: localStorage (explorerTreeState)
  ↓
UI: Re-render tree with expanded/collapsed project
```

---

## 4. localStorage Schema

### v1.17.0 Keys

| Key | Type | Example | Migration |
|-----|------|---------|-----------|
| `scribe:expandedIcon` | `ExpandedIconType` | `{"type":"vault","id":"inbox"}` | No change |
| `scribe:compactModeWidth` | `number` | `240` | No change |
| `scribe:cardModeWidth` | `number` | `360` | Update default from 320 |
| `scribe:explorerModeWidth` | `number` | `320` | NEW |
| `scribe:pinnedVaults` | `PinnedVault[]` | See below | Rename `preferredMode` → `activeTab` |
| `scribe:smartIcons` | `SmartIcon[]` | See below | Rename `preferredMode` → `activeTab` |
| `scribe:explorerTreeState` | `ExplorerTreeState` | `{"expandedNodes":["proj-1","proj-2"]}` | NEW |

### Example localStorage Data (v1.17.0)

```json
{
  "scribe:expandedIcon": {
    "type": "vault",
    "id": "inbox"
  },
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
    },
    {
      "id": "proj-abc",
      "label": "Research",
      "color": "#3b82f6",
      "order": 1,
      "isPermanent": false,
      "activeTab": "explorer"
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

## 5. Migration Strategy (v1.16.0 → v1.17.0)

### Migration Function

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
        // Remove old field (optional, but cleaner)
        preferredMode: undefined
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
        // Remove old field (optional, but cleaner)
        preferredMode: undefined
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

### Migration Test Cases

| Scenario | v1.16.0 State | v1.17.0 State | Expected Result |
|----------|---------------|---------------|-----------------|
| Inbox with compact mode | `preferredMode: 'compact'` | `activeTab: 'compact'` | Opens to Compact tab at 240px |
| Research smart icon with card mode | `preferredMode: 'card'` | `activeTab: 'card'` | Opens to Card tab at 360px |
| New user (no localStorage) | N/A | `activeTab: 'compact'` (default) | All icons default to Compact tab |
| User had 320px card width | `cardModeWidth: 320` | `cardModeWidth: 360` | Auto-increase to 360px for better layout |

---

## 6. New Zustand Actions

### `switchIconTab(type, id, tab)`

**Purpose:** Switch active tab for an icon (updates width and persistence)

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

### `toggleExplorerNode(projectId)`

**Purpose:** Toggle expand/collapse state for a project in Explorer tree

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

### `expandExplorerNode(projectId)`, `collapseExplorerNode(projectId)`

**Purpose:** Explicit expand/collapse actions for programmatic control

```typescript
expandExplorerNode: (projectId: string) => {
  const { explorerTreeState } = get()
  const newExpandedNodes = new Set(explorerTreeState.expandedNodes)
  newExpandedNodes.add(projectId)

  const newState = { expandedNodes: newExpandedNodes }
  set({ explorerTreeState: newState })
  saveExplorerTreeState(newState)
}

collapseExplorerNode: (projectId: string) => {
  const { explorerTreeState } = get()
  const newExpandedNodes = new Set(explorerTreeState.expandedNodes)
  newExpandedNodes.delete(projectId)

  const newState = { expandedNodes: newExpandedNodes }
  set({ explorerTreeState: newState })
  saveExplorerTreeState(newState)
}
```

### `collapseAllExplorerNodes()`

**Purpose:** Collapse all project nodes in Explorer tree (reset state)

```typescript
collapseAllExplorerNodes: () => {
  const newState = { expandedNodes: new Set<string>() }
  set({ explorerTreeState: newState })
  saveExplorerTreeState(newState)
}
```

### Updated `setSidebarWidth(width)`

**Purpose:** Update width and sync with current tab's global width

```typescript
setSidebarWidth: (width: number) => {
  const { expandedIcon, pinnedVaults, smartIcons } = get()

  // If sidebar collapsed, do nothing
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

  // Constrain width based on active tab
  let constrainedWidth = width
  let updatedState: Partial<AppViewState> = {}

  switch (activeTab) {
    case 'compact':
      constrainedWidth = Math.max(SIDEBAR_WIDTHS.compact.min, Math.min(SIDEBAR_WIDTHS.compact.max, width))
      updatedState = { sidebarWidth: constrainedWidth, compactModeWidth: constrainedWidth }
      saveCompactModeWidth(constrainedWidth)
      break
    case 'card':
      constrainedWidth = Math.max(SIDEBAR_WIDTHS.card.min, Math.min(SIDEBAR_WIDTHS.card.max, width))
      updatedState = { sidebarWidth: constrainedWidth, cardModeWidth: constrainedWidth }
      saveCardModeWidth(constrainedWidth)
      break
    case 'explorer':
      constrainedWidth = Math.max(SIDEBAR_WIDTHS.explorer.min, Math.min(SIDEBAR_WIDTHS.explorer.max, width))
      updatedState = { sidebarWidth: constrainedWidth, explorerModeWidth: constrainedWidth }
      saveExplorerModeWidth(constrainedWidth)
      break
  }

  set(updatedState)
  saveSidebarWidth(constrainedWidth)
}
```

---

## 7. Performance Considerations

### Memoization Strategy

**Problem:** Switching tabs causes full panel re-render (expensive for large note lists)

**Solution:** Memoize panel content components

```typescript
// Compact panel content
const CompactPanelContent = React.memo(({
  notes,
  selectedNoteId,
  onNoteSelect
}: CompactPanelProps) => {
  // Render compact note list
})

// Card panel content
const CardPanelContent = React.memo(({
  notes,
  selectedNoteId,
  onNoteSelect
}: CardPanelProps) => {
  // Render card grid
})

// Explorer panel content
const ExplorerPanelContent = React.memo(({
  projects,
  expandedNodes,
  onToggleNode,
  onNoteSelect
}: ExplorerPanelProps) => {
  // Render tree view
})

// Tab container (parent)
const IconPanel = () => {
  const { expandedIcon, switchIconTab } = useAppViewStore()
  const activeTab = getCurrentActiveTab(expandedIcon) // Helper function

  return (
    <div>
      <TabBar activeTab={activeTab} onTabSwitch={switchIconTab} />
      {activeTab === 'compact' && <CompactPanelContent {...compactProps} />}
      {activeTab === 'card' && <CardPanelContent {...cardProps} />}
      {activeTab === 'explorer' && <ExplorerPanelContent {...explorerProps} />}
    </div>
  )
}
```

### Batched State Updates

**Problem:** Multiple state updates during tab switch cause multiple re-renders

**Solution:** Use Zustand's `set()` with object merge (already atomic)

```typescript
// ✅ Good: Single set() call with multiple updates
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

### Explorer Tree Virtualization (Future Enhancement)

**Problem:** Large project trees with 100+ notes cause performance issues

**Solution:** Implement virtualized list (defer to v1.18.0+)

- Use `react-window` or `react-virtual` for tree nodes
- Only render visible nodes + 10 buffer above/below
- Estimate node height: 32px (project) + 28px * note_count

---

## 8. Edge Case Handling

### Edge Case 1: Deleted Project While in Explorer

**Scenario:** User deletes a project while Explorer tab is viewing it

**Solution:**

```typescript
// In ProjectStore.deleteProject()
deleteProject: async (id: string) => {
  await api.deleteProject(id)

  // Update projects list
  set((state) => ({
    projects: state.projects.filter((project) => project.id !== id),
    currentProjectId: wasCurrentProject ? null : state.currentProjectId
  }))

  // Clean up explorer tree state
  const { explorerTreeState } = useAppViewStore.getState()
  if (explorerTreeState.expandedNodes.has(id)) {
    useAppViewStore.getState().collapseExplorerNode(id)
  }
}
```

**Behavior:** Deleted project auto-collapses in Explorer tree, notes disappear from list

### Edge Case 2: Inbox Expanded in Explorer (No Projects)

**Scenario:** Inbox has no project association, Explorer shows "Projects > Notes" hierarchy

**Solution:**

```typescript
// Inbox special case in Explorer tree
const ExplorerTree = () => {
  const { expandedIcon } = useAppViewStore()
  const isInbox = expandedIcon?.type === 'vault' && expandedIcon.id === 'inbox'

  if (isInbox) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Inbox notes are not organized by project. Use Compact or Card tabs to view them.
      </div>
    )
  }

  // Render normal project tree
}
```

**Behavior:** Inbox Explorer tab shows helpful message instead of empty tree

### Edge Case 3: Smart Icon (Research) in Explorer with 0 Projects

**Scenario:** User has no research projects, clicks Research smart icon → Explorer tab

**Solution:**

```typescript
const ExplorerTree = () => {
  const { expandedIcon, projectTypeFilter } = useAppViewStore()
  const projects = useProjectStore(s => s.projects).filter(p =>
    p.type === projectTypeFilter
  )

  if (projects.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-gray-500 mb-3">
          No {projectTypeFilter} projects yet
        </p>
        <button
          className="btn-primary"
          onClick={() => openCreateProjectModal(projectTypeFilter)}
        >
          Create {projectTypeFilter} project
        </button>
      </div>
    )
  }

  // Render project tree
}
```

**Behavior:** Show empty state with "Create project" CTA

### Edge Case 4: Switching Tabs While Resizing

**Scenario:** User drags resize handle then clicks a different tab before releasing

**Solution:**

```typescript
// ResizeHandle component tracks drag state
const [isDragging, setIsDragging] = useState(false)

// Tab button disables click during resize drag
const TabButton = ({ onClick }) => (
  <button
    onClick={onClick}
    disabled={isDragging}
    className={isDragging ? 'pointer-events-none' : ''}
  >
    Tab
  </button>
)
```

**Behavior:** Tab clicks ignored during active resize drag

### Edge Case 5: localStorage Quota Exceeded

**Scenario:** `explorerTreeState.expandedNodes` grows too large (100+ projects), exceeds 5MB localStorage limit

**Solution:**

```typescript
const saveExplorerTreeState = (state: ExplorerTreeState): void => {
  try {
    // Limit to 100 most recently expanded nodes
    const nodeArray = Array.from(state.expandedNodes)
    const limited = nodeArray.slice(-100)

    localStorage.setItem('scribe:explorerTreeState', JSON.stringify({
      expandedNodes: limited
    }))
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.warn('[Storage] localStorage quota exceeded, clearing old tree state')
      // Fallback: Save only 50 nodes
      const nodeArray = Array.from(state.expandedNodes)
      localStorage.setItem('scribe:explorerTreeState', JSON.stringify({
        expandedNodes: nodeArray.slice(-50)
      }))
    }
  }
}
```

**Behavior:** Auto-limit to 100 expanded nodes max, graceful degradation on quota error

---

## 9. Complete TypeScript Interfaces

```typescript
// ============================================================
// v1.17.0 Three-Tab Sidebar - Complete Type Definitions
// ============================================================

// Tab types
type IconTabType = 'compact' | 'card' | 'explorer'

// Pinned vaults with activeTab
interface PinnedVault {
  id: string  // 'inbox' or project ID
  label: string
  color?: string
  order: number
  isPermanent: boolean
  activeTab: IconTabType  // Which tab is active for this vault
}

// Smart icons with activeTab
export type SmartIconId = 'research' | 'teaching' | 'r-package' | 'dev-tools'

interface SmartIcon {
  id: SmartIconId
  label: string
  icon: string  // emoji
  color: string  // hex color
  projectType: ProjectType
  isVisible: boolean
  isExpanded: boolean  // DEPRECATED (kept for backwards compat)
  order: number
  activeTab: IconTabType  // Which tab is active for this icon
}

// Expanded icon type (unchanged from v1.16.0)
export type ExpandedIconType =
  | { type: 'vault'; id: string }
  | { type: 'smart'; id: SmartIconId }
  | null

// Explorer tree state
interface ExplorerTreeState {
  expandedNodes: Set<string>  // Project IDs that are expanded in tree
}

// Sidebar width constraints
export const SIDEBAR_WIDTHS = {
  icon: 48,
  compact: { default: 240, min: 200, max: 300 },
  card: { default: 360, min: 320, max: 500 },
  explorer: { default: 320, min: 200, max: 500 }  // NEW
}

// App View Store (v1.17.0)
interface AppViewState {
  // Sidebar state
  expandedIcon: ExpandedIconType
  sidebarWidth: number
  pinnedVaults: PinnedVault[]
  smartIcons: SmartIcon[]
  projectTypeFilter: ProjectType | null

  // Width memory per tab type
  compactModeWidth: number   // Global width for all icons in Compact tab
  cardModeWidth: number      // Global width for all icons in Card tab
  explorerModeWidth: number  // NEW: Global width for all icons in Explorer tab

  // Explorer state
  explorerTreeState: ExplorerTreeState  // NEW: Tree expand/collapse state

  // Editor tabs state (unchanged)
  openTabs: EditorTab[]
  activeTabId: string | null
  closedTabsHistory: EditorTab[]

  // Recent notes tracking (unchanged)
  recentNotes: RecentNote[]
  lastActiveNoteId: string | null

  // Sidebar actions (v1.17.0)
  expandVault: (vaultId: string) => void
  expandSmartIcon: (iconId: SmartIconId) => void
  collapseAll: () => void
  toggleIcon: (type: 'vault' | 'smart', id: string) => void

  // NEW: Tab switching
  switchIconTab: (type: 'vault' | 'smart', id: string, tab: IconTabType) => void

  setSidebarWidth: (width: number) => void

  // Pinned vaults actions (unchanged)
  addPinnedVault: (projectId: string, label: string, color?: string) => boolean
  removePinnedVault: (vaultId: string) => void
  reorderPinnedVaults: (fromIndex: number, toIndex: number) => void
  isPinned: (projectId: string) => boolean

  // Smart icon actions (unchanged)
  setSmartIconVisibility: (iconId: SmartIconId, visible: boolean) => void
  reorderSmartIcons: (fromIndex: number, toIndex: number) => void
  setProjectTypeFilter: (projectType: ProjectType | null) => void

  // NEW: Explorer tree actions
  toggleExplorerNode: (projectId: string) => void
  expandExplorerNode: (projectId: string) => void
  collapseExplorerNode: (projectId: string) => void
  collapseAllExplorerNodes: () => void

  // Tab actions (unchanged)
  openTab: (tab: Omit<EditorTab, 'id'>) => string
  openNoteTab: (noteId: string, title: string) => void
  closeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  reorderTabs: (fromIndex: number, toIndex: number) => void
  pinTab: (tabId: string) => void
  unpinTab: (tabId: string) => void
  updateTabTitle: (tabId: string, title: string) => void
  reopenLastClosedTab: () => void

  // Recent notes actions (unchanged)
  addRecentNote: (noteId: string, noteTitle: string, projectId: string | null) => void
  clearRecentNotes: () => void

  // Session actions (unchanged)
  setLastActiveNote: (noteId: string | null) => void
  updateSessionTimestamp: () => void
}
```

---

## 10. Implementation Checklist

### Phase 1: State Schema Update

- [ ] Update `types/index.ts`: Add `IconTabType`, rename `preferredMode` → `activeTab`
- [ ] Add `ExplorerTreeState` interface with `expandedNodes: Set<string>`
- [ ] Update `SIDEBAR_WIDTHS` constant with `explorer: { default: 320, min: 200, max: 500 }`

### Phase 2: Migration

- [ ] Write `migrateToThreeTabSidebar()` function in `useAppViewStore.ts`
- [ ] Add new localStorage keys: `explorerModeWidth`, `explorerTreeState`
- [ ] Test migration with v1.16.0 localStorage data
- [ ] Verify backwards compatibility (old keys auto-migrate)

### Phase 3: Zustand Actions

- [ ] Implement `switchIconTab(type, id, tab)`
- [ ] Update `setSidebarWidth()` to handle Explorer tab
- [ ] Implement `toggleExplorerNode(projectId)`
- [ ] Implement `expandExplorerNode(projectId)` and `collapseExplorerNode(projectId)`
- [ ] Implement `collapseAllExplorerNodes()`
- [ ] Update `expandVault()` and `expandSmartIcon()` to use `activeTab` instead of `preferredMode`

### Phase 4: UI Components

- [ ] Create `<IconTabBar>` component (3 pill tabs: Compact | Card | Explorer)
- [ ] Create `<ExplorerTreeView>` component (Projects > Notes hierarchy)
- [ ] Implement drag-to-reorder notes between projects in Explorer
- [ ] Add expand/collapse arrow buttons to project nodes
- [ ] Handle empty states (Inbox, no projects, etc.)

### Phase 5: Testing

- [ ] Write unit tests for new Zustand actions (9 new actions)
- [ ] Write E2E tests for tab switching (icon click, tab click, resize)
- [ ] Test migration from v1.16.0 → v1.17.0 (5 scenarios)
- [ ] Test edge cases (deleted project, localStorage quota, resize during tab switch)
- [ ] Performance test: Switching tabs with 100+ notes
- [ ] Performance test: Explorer tree with 50+ projects

### Phase 6: Documentation

- [ ] Update CHANGELOG.md with v1.17.0 features
- [ ] Update README.md with Explorer tab screenshots
- [ ] Document keyboard shortcuts (if any) for Explorer tree
- [ ] Update .STATUS to reflect v1.17.0 completion

---

## 11. Performance Benchmarks (Target)

| Operation | Target | Measurement |
|-----------|--------|-------------|
| Switch tab (Compact → Card) | < 50ms | `performance.mark()` |
| Switch tab (Card → Explorer) | < 100ms | `performance.mark()` |
| Render Explorer tree (50 projects) | < 200ms | React Profiler |
| Toggle project node | < 16ms | Must stay 60fps |
| Resize panel | < 16ms | Must stay 60fps during drag |
| localStorage save (tree state) | < 10ms | `performance.measure()` |

---

## 12. Future Enhancements (v1.18.0+)

- **Drag-to-move notes between projects** in Explorer tree (v1.17.0 or v1.18.0)
- **Virtualized tree rendering** for 100+ projects (v1.18.0)
- **Search within Explorer** (filter projects/notes in tree) (v1.18.0)
- **Bulk operations** in Explorer (multi-select notes, move all to project) (v1.19.0)
- **Context menu on tree nodes** (rename project, create note, etc.) (v1.18.0)
- **Keyboard navigation** in Explorer tree (arrow keys, Enter to open) (v1.18.0)

---

## 13. Recommended Next Steps

1. ✅ **Review this proposal** - Approve state schema and migration plan
2. **Phase 1: Update types** - Modify TypeScript interfaces (1 hour)
3. **Phase 2: Write migration** - Implement `migrateToThreeTabSidebar()` (2 hours)
4. **Phase 3: Implement actions** - Add new Zustand actions (4 hours)
5. **Phase 4: Build UI** - Create tab bar and Explorer tree components (8 hours)
6. **Phase 5: Test** - Write tests and verify edge cases (4 hours)
7. **Phase 6: Document** - Update docs and release v1.17.0 (1 hour)

**Total Estimate:** ~20 hours over 3-4 days

---

## Approval Required

- [ ] State schema design (Section 1)
- [ ] Design decisions (Section 2)
- [ ] Migration strategy (Section 5)
- [ ] New Zustand actions (Section 6)
- [ ] Performance targets (Section 11)

**Once approved, proceed with Phase 1 implementation.**
