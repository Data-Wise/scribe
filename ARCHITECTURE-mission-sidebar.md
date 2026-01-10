# Mission Sidebar Technical Architecture

**Version:** v2.0 (Left Sidebar)
**Date:** 2026-01-08
**Status:** Design Specification

---

## Executive Summary

This document defines the technical architecture for Scribe's left Mission Sidebar—a context-switching interface with three modes (Icon, Compact, Card) and integrated Activity Bar. The design prioritizes **instant state transitions (< 100ms)** for ADHD users, persistent state across sessions, and dual runtime support (Tauri + Browser).

---

## 1. State Management Design

### 1.1 Zustand Store Architecture

**Decision:** Split state management between **global** (Zustand) and **ephemeral** (component state).

#### Global State (Zustand): `useMissionSidebarStore.ts`

**Rationale:** Persist across sessions, shared across components, and needs to survive hot reloads.

```typescript
// src/renderer/src/store/useMissionSidebarStore.ts

import { create } from 'zustand'

// ---------- Types ----------

export type SidebarMode = 'icon' | 'compact' | 'card'

export interface PinnedVault {
  id: string              // 'inbox' | project ID
  label: string           // Display name
  icon?: string           // Optional icon override
  order: number           // Sort order (0-indexed)
  isPermanent: boolean    // Cannot be unpinned (only Inbox)
}

export interface SidebarUIState {
  expandedProjects: Set<string>    // Which projects show note lists
  scrollPosition: number           // Scroll offset for state restoration
  lastActiveSection: 'vaults' | 'activity-bar' | null
}

interface MissionSidebarState {
  // Mode & Layout
  mode: SidebarMode
  width: number

  // Pinned Vaults
  pinnedVaults: PinnedVault[]

  // UI State (persisted)
  uiState: SidebarUIState

  // Actions
  setMode: (mode: SidebarMode) => void
  cycleMode: () => void
  setWidth: (width: number) => void

  // Pinned Vaults Management
  addPinnedVault: (projectId: string, label: string) => void
  removePinnedVault: (id: string) => void  // Throws if isPermanent
  reorderPinnedVaults: (fromIndex: number, toIndex: number) => void

  // UI State Management
  toggleProjectExpansion: (projectId: string) => void
  setScrollPosition: (position: number) => void
  setLastActiveSection: (section: 'vaults' | 'activity-bar' | null) => void

  // Bulk Actions
  collapseAll: () => void
  expandAll: () => void
  resetToDefaults: () => void
}

// ---------- Constants ----------

const STORAGE_KEY = 'scribe:missionSidebar'

export const SIDEBAR_WIDTHS = {
  icon: 48,
  compact: { default: 240, min: 200, max: 300 },
  card: { default: 380, min: 350, max: 500 }
}

// Default pinned vaults: Inbox + 4 custom slots
const DEFAULT_PINNED_VAULTS: PinnedVault[] = [
  { id: 'inbox', label: 'Inbox', icon: '📥', order: 0, isPermanent: true }
  // User adds up to 4 more via settings
]

// ---------- Persistence ----------

interface PersistedState {
  mode: SidebarMode
  width: number
  pinnedVaults: PinnedVault[]
  uiState: SidebarUIState
}

const loadPersistedState = (): Partial<PersistedState> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return {}

    const parsed = JSON.parse(stored) as PersistedState

    // Convert serialized Set back to Set
    if (parsed.uiState?.expandedProjects) {
      parsed.uiState.expandedProjects = new Set(
        Array.isArray(parsed.uiState.expandedProjects)
          ? parsed.uiState.expandedProjects
          : []
      )
    }

    return parsed
  } catch {
    return {}
  }
}

const persistState = (state: PersistedState): void => {
  try {
    // Convert Set to Array for JSON serialization
    const serializable = {
      ...state,
      uiState: {
        ...state.uiState,
        expandedProjects: Array.from(state.uiState.expandedProjects)
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable))
  } catch (err) {
    console.warn('Failed to persist Mission Sidebar state:', err)
  }
}

// ---------- Store Implementation ----------

export const useMissionSidebarStore = create<MissionSidebarState>((set, get) => {
  const persisted = loadPersistedState()

  return {
    // Initial state (defaults + persisted overrides)
    mode: persisted.mode || 'compact',
    width: persisted.width || SIDEBAR_WIDTHS.compact.default,
    pinnedVaults: persisted.pinnedVaults || DEFAULT_PINNED_VAULTS,
    uiState: {
      expandedProjects: persisted.uiState?.expandedProjects || new Set(),
      scrollPosition: persisted.uiState?.scrollPosition || 0,
      lastActiveSection: persisted.uiState?.lastActiveSection || null
    },

    // Mode actions
    setMode: (mode) => {
      const state = get()

      // Auto-adjust width for new mode
      let newWidth = state.width
      if (mode === 'icon') {
        newWidth = SIDEBAR_WIDTHS.icon
      } else if (mode === 'compact' && state.width < SIDEBAR_WIDTHS.compact.min) {
        newWidth = SIDEBAR_WIDTHS.compact.default
      } else if (mode === 'card' && state.width < SIDEBAR_WIDTHS.card.min) {
        newWidth = SIDEBAR_WIDTHS.card.default
      }

      set({ mode, width: newWidth })
      persistState({ ...state, mode, width: newWidth })
    },

    cycleMode: () => {
      const modes: SidebarMode[] = ['icon', 'compact', 'card']
      const current = get().mode
      const nextIndex = (modes.indexOf(current) + 1) % modes.length
      get().setMode(modes[nextIndex])
    },

    setWidth: (width) => {
      const state = get()
      const { mode } = state

      // Constrain width by mode
      let constrained = width
      if (mode === 'compact') {
        constrained = Math.max(
          SIDEBAR_WIDTHS.compact.min,
          Math.min(SIDEBAR_WIDTHS.compact.max, width)
        )
      } else if (mode === 'card') {
        constrained = Math.max(
          SIDEBAR_WIDTHS.card.min,
          Math.min(SIDEBAR_WIDTHS.card.max, width)
        )
      }

      set({ width: constrained })
      persistState({ ...state, width: constrained })
    },

    // Pinned Vaults
    addPinnedVault: (projectId, label) => {
      const state = get()

      // Check if already pinned
      if (state.pinnedVaults.some(v => v.id === projectId)) {
        console.warn(`Vault ${projectId} is already pinned`)
        return
      }

      // Max 5 vaults (Inbox + 4 custom)
      if (state.pinnedVaults.length >= 5) {
        throw new Error('Maximum 5 pinned vaults allowed (including Inbox)')
      }

      const newVault: PinnedVault = {
        id: projectId,
        label,
        order: state.pinnedVaults.length,
        isPermanent: false
      }

      const pinnedVaults = [...state.pinnedVaults, newVault]
      set({ pinnedVaults })
      persistState({ ...state, pinnedVaults })
    },

    removePinnedVault: (id) => {
      const state = get()
      const vault = state.pinnedVaults.find(v => v.id === id)

      if (!vault) return
      if (vault.isPermanent) {
        throw new Error('Cannot unpin Inbox (permanent vault)')
      }

      const pinnedVaults = state.pinnedVaults
        .filter(v => v.id !== id)
        .map((v, index) => ({ ...v, order: index }))  // Re-index

      set({ pinnedVaults })
      persistState({ ...state, pinnedVaults })
    },

    reorderPinnedVaults: (fromIndex, toIndex) => {
      const state = get()

      // Cannot move Inbox (always first)
      if (fromIndex === 0 || toIndex === 0) {
        console.warn('Cannot reorder Inbox (permanent position)')
        return
      }

      const pinnedVaults = [...state.pinnedVaults]
      const [moved] = pinnedVaults.splice(fromIndex, 1)
      pinnedVaults.splice(toIndex, 0, moved)

      // Update order property
      const reordered = pinnedVaults.map((v, index) => ({ ...v, order: index }))

      set({ pinnedVaults: reordered })
      persistState({ ...state, pinnedVaults: reordered })
    },

    // UI State
    toggleProjectExpansion: (projectId) => {
      const state = get()
      const { uiState } = state
      const expanded = new Set(uiState.expandedProjects)

      if (expanded.has(projectId)) {
        expanded.delete(projectId)
      } else {
        expanded.add(projectId)
      }

      const newUIState = { ...uiState, expandedProjects: expanded }
      set({ uiState: newUIState })
      persistState({ ...state, uiState: newUIState })
    },

    setScrollPosition: (position) => {
      const state = get()
      const newUIState = { ...state.uiState, scrollPosition: position }
      set({ uiState: newUIState })
      persistState({ ...state, uiState: newUIState })
    },

    setLastActiveSection: (section) => {
      const state = get()
      const newUIState = { ...state.uiState, lastActiveSection: section }
      set({ uiState: newUIState })
      persistState({ ...state, uiState: newUIState })
    },

    // Bulk actions
    collapseAll: () => {
      const state = get()
      const newUIState = { ...state.uiState, expandedProjects: new Set() }
      set({ uiState: newUIState })
      persistState({ ...state, uiState: newUIState })
    },

    expandAll: () => {
      const state = get()
      const allProjectIds = new Set(
        state.pinnedVaults.filter(v => v.id !== 'inbox').map(v => v.id)
      )
      const newUIState = { ...state.uiState, expandedProjects: allProjectIds }
      set({ uiState: newUIState })
      persistState({ ...state, uiState: newUIState })
    },

    resetToDefaults: () => {
      const defaults: PersistedState = {
        mode: 'compact',
        width: SIDEBAR_WIDTHS.compact.default,
        pinnedVaults: DEFAULT_PINNED_VAULTS,
        uiState: {
          expandedProjects: new Set(),
          scrollPosition: 0,
          lastActiveSection: null
        }
      }
      set(defaults)
      persistState(defaults)
    }
  }
})
```

#### Component State (Ephemeral)

**Use for:** Transient UI that doesn't need persistence.

```typescript
// Example: CompactListMode.tsx
const [searchQuery, setSearchQuery] = useState('')           // Filter input
const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null)  // Right-click menu
const [hoveredProject, setHoveredProject] = useState<string | null>(null) // Hover effects
```

**Rule of Thumb:**
- **Zustand:** User preferences, view state, expanded/collapsed state
- **useState:** Search filters, hover states, modals, context menus

---

## 2. Component Hierarchy & Data Flow

### 2.1 Component Tree

```
MissionSidebar (Container)
├── IconBarMode (mode === 'icon')
│   ├── ExpandButton
│   ├── VaultIconList
│   │   └── VaultIcon × pinnedVaults.length
│   └── ActivityBar
│       ├── SearchButton
│       ├── DailyNoteButton
│       └── SettingsButton
│
├── CompactListMode (mode === 'compact')
│   ├── SidebarHeader
│   │   ├── CollapseButton
│   │   └── VaultCounter
│   ├── SearchInput (if >5 vaults)
│   ├── PinnedVaultsList
│   │   └── CompactVaultItem × pinnedVaults.length
│   │       ├── VaultHeader (collapsible)
│   │       ├── ProjectContextCard (if expanded)
│   │       └── NotesList (if expanded, max 5)
│   └── ActivityBar
│       ├── SearchButton
│       ├── DailyNoteButton
│       └── SettingsButton
│
├── CardViewMode (mode === 'card')
│   ├── SidebarHeader
│   ├── SearchInput
│   ├── PinnedVaultsList
│   │   └── CardVaultItem × pinnedVaults.length
│   │       ├── VaultCard (rich preview)
│   │       ├── StatsRow (notes, words, activity)
│   │       └── RecentNotesList (top 5)
│   └── ActivityBar
│
└── ResizeHandle (if mode !== 'icon')
```

### 2.2 Data Flow Pattern

**Props down, callbacks up** (React best practice):

```typescript
// Parent → Child (props)
<MissionSidebar
  projects={projects}          // From useProjectStore
  notes={notes}                // From useNotesStore
  onSelectProject={(id) => {}} // Callback to parent
  onSelectNote={(id) => {}}
/>

// Child → Parent (callbacks)
// Child invokes callback when user clicks
<VaultItem
  vault={vault}
  onClick={() => onSelectProject(vault.id)}
/>
```

**Store access:**
- Modes read from `useMissionSidebarStore()` for UI state
- Avoid prop drilling—import store directly in leaf components when needed

---

## 3. Settings Schema for Pinned Vaults

### 3.1 Integration with `useSettingsStore.ts`

Add new category to settings schema:

```typescript
// src/renderer/src/lib/settingsSchema.ts

export const settingsCategories: SettingsCategoryData[] = [
  // ... existing categories ...
  {
    id: 'sidebar',
    label: 'Sidebar',
    icon: 'PanelLeft',
    sections: [
      {
        id: 'pinned-vaults',
        title: 'Pinned Vaults',
        description: 'Customize which projects appear in the sidebar. Inbox is always visible.',
        collapsed: false,
        settings: [
          {
            id: 'sidebar.pinnedVaults',
            type: 'custom',  // Custom component for drag-to-reorder UI
            label: 'Pinned Vaults',
            description: 'Pin up to 4 projects for quick access (Inbox + 4 custom)',
            defaultValue: []
          },
          {
            id: 'sidebar.showInboxFirst',
            type: 'toggle',
            label: 'Always Show Inbox First',
            description: 'Keep Inbox at the top of the sidebar',
            defaultValue: true
          }
        ]
      },
      {
        id: 'sidebar-appearance',
        title: 'Appearance',
        collapsed: false,
        settings: [
          {
            id: 'sidebar.defaultMode',
            type: 'select',
            label: 'Default Mode',
            description: 'Sidebar mode on fresh launch',
            defaultValue: 'compact',
            options: [
              { label: 'Icon Bar', value: 'icon' },
              { label: 'Compact List', value: 'compact' },
              { label: 'Card View', value: 'card' }
            ]
          },
          {
            id: 'sidebar.rememberExpandedProjects',
            type: 'toggle',
            label: 'Remember Expanded Projects',
            description: 'Restore which projects were expanded across sessions',
            defaultValue: true
          },
          {
            id: 'sidebar.showProjectStats',
            type: 'toggle',
            label: 'Show Project Statistics',
            description: 'Display note count, word count, and activity in compact/card modes',
            defaultValue: true
          }
        ]
      }
    ]
  }
]
```

### 3.2 Custom Settings Component: Vault Reordering

```typescript
// src/renderer/src/components/Settings/PinnedVaultsSettings.tsx

import { useMissionSidebarStore } from '../../store/useMissionSidebarStore'
import { useProjectStore } from '../../store/useProjectStore'
import { GripVertical, X, Plus } from 'lucide-react'

export function PinnedVaultsSettings() {
  const { pinnedVaults, removePinnedVault, reorderPinnedVaults, addPinnedVault } =
    useMissionSidebarStore()
  const { projects } = useProjectStore()

  // Available projects to pin (not already pinned)
  const availableProjects = projects.filter(
    (p) => !pinnedVaults.some((v) => v.id === p.id)
  )

  const handleDragEnd = (fromIndex: number, toIndex: number) => {
    reorderPinnedVaults(fromIndex, toIndex)
  }

  return (
    <div className="pinned-vaults-settings">
      <div className="vaults-list">
        {pinnedVaults.map((vault, index) => (
          <div
            key={vault.id}
            className={`vault-item ${vault.isPermanent ? 'permanent' : ''}`}
            draggable={!vault.isPermanent}
            onDragEnd={(e) => {
              // Handle drag-to-reorder
            }}
          >
            {!vault.isPermanent && <GripVertical className="drag-handle" />}
            <span className="vault-icon">{vault.icon || '📁'}</span>
            <span className="vault-label">{vault.label}</span>
            {!vault.isPermanent && (
              <button
                className="remove-btn"
                onClick={() => removePinnedVault(vault.id)}
                title="Unpin"
              >
                <X size={14} />
              </button>
            )}
            {vault.isPermanent && (
              <span className="permanent-badge">Permanent</span>
            )}
          </div>
        ))}
      </div>

      {pinnedVaults.length < 5 && (
        <div className="add-vault">
          <select
            onChange={(e) => {
              const projectId = e.target.value
              const project = projects.find((p) => p.id === projectId)
              if (project) {
                addPinnedVault(project.id, project.name)
              }
              e.target.value = '' // Reset select
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Add vault...
            </option>
            {availableProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {pinnedVaults.length >= 5 && (
        <div className="max-vaults-notice">
          Maximum 5 pinned vaults (Inbox + 4 custom)
        </div>
      )}
    </div>
  )
}
```

---

## 4. Animation & Transition Strategy

### 4.1 Performance Budget: < 100ms

**Target:** Mode switching must complete in **< 100ms** for ADHD focus retention.

### 4.2 CSS Transitions (Preferred)

Use hardware-accelerated CSS transforms instead of JavaScript animations:

```css
/* src/renderer/src/styles/mission-sidebar.css */

.mission-sidebar {
  /* Width transition */
  width: var(--sidebar-width);
  transition: width 120ms cubic-bezier(0.4, 0, 0.2, 1); /* Material Design easing */
  will-change: width; /* GPU acceleration hint */
}

/* Mode-specific styles */
.mission-sidebar[data-mode='icon'] {
  --sidebar-width: 48px;
}

.mission-sidebar[data-mode='compact'] {
  --sidebar-width: var(--sidebar-width-compact, 240px);
}

.mission-sidebar[data-mode='card'] {
  --sidebar-width: var(--sidebar-width-card, 380px);
}

/* Fade in/out mode components */
.sidebar-mode-enter {
  opacity: 0;
  transform: translateX(-8px);
}

.sidebar-mode-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: opacity 100ms ease-out, transform 100ms ease-out;
}

.sidebar-mode-exit {
  opacity: 1;
}

.sidebar-mode-exit-active {
  opacity: 0;
  transition: opacity 80ms ease-in;
}
```

### 4.3 Conditional Rendering (No Animations for Hidden Modes)

**Anti-pattern:** Render all 3 modes and toggle `display: none`
**Better:** Render only active mode to avoid wasted DOM updates

```tsx
// MissionSidebar.tsx
{sidebarMode === 'icon' && <IconBarMode {...props} />}
{sidebarMode === 'compact' && <CompactListMode {...props} />}
{sidebarMode === 'card' && <CardViewMode {...props} />}
```

### 4.4 Optimistic UI Updates

Don't wait for Zustand persistence before updating UI:

```typescript
// Immediate UI update
setMode('card')

// Persistence happens async (non-blocking)
persistState({ mode: 'card' })  // localStorage write queued
```

### 4.5 Transition Choreography

**Sequence for mode switch (Icon → Compact):**

| Time | Action |
|------|--------|
| 0ms | User clicks expand button |
| 0ms | `setMode('compact')` called (Zustand update) |
| 0ms | IconBarMode unmounts, CompactListMode mounts |
| 0-100ms | Width animates from 48px → 240px (CSS transition) |
| 0-100ms | CompactListMode fades in (opacity 0 → 1) |
| 100ms | Animation complete, UI stable |

**Total duration:** 100ms (budget met ✅)

---

## 5. Performance Considerations

### 5.1 Virtualization for Long Note Lists

**When to virtualize:**
- Card mode: Projects with >20 notes
- Compact mode: Projects with >10 notes

**Library:** `react-window` or `@tanstack/react-virtual`

```tsx
// Example: Virtualized note list in CompactListMode

import { useVirtualizer } from '@tanstack/react-virtual'

function CompactVaultItem({ projectNotes }: { projectNotes: Note[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: projectNotes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32, // Estimated row height
    overscan: 5 // Render 5 items above/below viewport
  })

  return (
    <div ref={parentRef} className="notes-list" style={{ height: '200px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const note = projectNotes[virtualItem.index]
          return (
            <div
              key={note.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`
              }}
            >
              <NoteListItem note={note} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

### 5.2 Memoization for Expensive Computations

**Use `useMemo` for:**
- Filtering/sorting project lists
- Computing note counts per project
- Generating search results

```typescript
// CompactListMode.tsx
const sortedVaults = useMemo(() => {
  return pinnedVaults
    .filter((v) => v.label.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.order - b.order)
}, [pinnedVaults, searchQuery])

const noteCountsByProject = useMemo(() => {
  const counts: Record<string, number> = {}
  notes.forEach((note) => {
    if (note.project_id) {
      counts[note.project_id] = (counts[note.project_id] || 0) + 1
    }
  })
  return counts
}, [notes])
```

### 5.3 Debounced Scroll Position Saves

**Problem:** Saving scroll position on every scroll event hammers localStorage.

**Solution:** Debounce with `lodash.debounce` or custom hook:

```typescript
import { useCallback } from 'react'
import { debounce } from 'lodash'

function CompactListMode() {
  const { setScrollPosition } = useMissionSidebarStore()

  // Save scroll position max once per 300ms
  const handleScroll = useCallback(
    debounce((e: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = e.currentTarget.scrollTop
      setScrollPosition(scrollTop)
    }, 300),
    []
  )

  return <div className="vaults-list" onScroll={handleScroll}>...</div>
}
```

### 5.4 Lazy Loading Project Stats

**Optimization:** Don't compute word counts for collapsed projects.

```typescript
// Only compute stats for expanded projects
const expandedProjectStats = useMemo(() => {
  const stats: Record<string, { noteCount: number; wordCount: number }> = {}

  uiState.expandedProjects.forEach((projectId) => {
    const projectNotes = notes.filter((n) => n.project_id === projectId)
    stats[projectId] = {
      noteCount: projectNotes.length,
      wordCount: projectNotes.reduce((sum, n) => sum + countWords(n.content), 0)
    }
  })

  return stats
}, [notes, uiState.expandedProjects])
```

---

## 6. Migration Path from Current Implementation

### 6.1 Current State (As-Is)

**Existing Components:**
- `MissionSidebar.tsx` (container)
- `IconBarMode.tsx`
- `CompactListMode.tsx`
- `CardViewMode.tsx`
- `useAppViewStore.ts` (manages `sidebarMode`, `sidebarWidth`)

**Existing Issues:**
1. No pinned vaults system
2. Expanded project state not persisted
3. Activity Bar not integrated
4. No settings for sidebar customization

### 6.2 Migration Strategy (Phased Rollout)

#### Phase 1: Create New Store (Non-Breaking)

**Goal:** Add `useMissionSidebarStore.ts` alongside existing store.

**Tasks:**
1. Create `useMissionSidebarStore.ts` with schema above
2. Migrate `sidebarMode` and `sidebarWidth` from `useAppViewStore`
3. Add new fields: `pinnedVaults`, `uiState`
4. Keep both stores in sync during migration

**Duration:** 1 session (2-3 hours)

#### Phase 2: Add Pinned Vaults UI (Additive)

**Goal:** Show pinned vaults in Compact/Card modes.

**Tasks:**
1. Add "Pin Project" action to ProjectContextMenu
2. Update CompactListMode to render `pinnedVaults` instead of all projects
3. Add visual indicator (📌) for pinned vaults
4. Default: Inbox (permanent) + 4 most recent projects (auto-pinned)

**Duration:** 1 session (3-4 hours)

#### Phase 3: Persist Expanded State (Enhancement)

**Goal:** Remember which projects were expanded across sessions.

**Tasks:**
1. Wire `toggleProjectExpansion()` to CompactVaultItem click handler
2. Restore `expandedProjects` from store on mount
3. Add "Collapse All" / "Expand All" buttons to sidebar header

**Duration:** 1 session (2 hours)

#### Phase 4: Integrate Activity Bar (New Feature)

**Goal:** Add Search, Daily, Settings buttons to bottom of sidebar.

**Tasks:**
1. Create `ActivityBar.tsx` component
2. Add to bottom of IconBarMode, CompactListMode, CardViewMode
3. Wire up existing handlers (onOpenSettings, onDailyNote, onSearch)

**Duration:** 1 session (2-3 hours)

#### Phase 5: Add Settings Panel (Polish)

**Goal:** Let users customize pinned vaults in Settings modal.

**Tasks:**
1. Add `sidebar` category to `settingsSchema.ts`
2. Create `PinnedVaultsSettings.tsx` component (drag-to-reorder)
3. Wire up to SettingsModal

**Duration:** 1 session (3-4 hours)

#### Phase 6: Deprecate Old Store (Cleanup)

**Goal:** Remove `sidebarMode` / `sidebarWidth` from `useAppViewStore`.

**Tasks:**
1. Migrate remaining references to `useMissionSidebarStore`
2. Remove old fields from `useAppViewStore`
3. Run tests, update snapshots

**Duration:** 1 session (1-2 hours)

**Total Migration Time:** 6 sessions (~15-20 hours)

### 6.3 Backward Compatibility

**Data Migration:** Auto-migrate localStorage on first load.

```typescript
// useMissionSidebarStore.ts

const migrateFromOldStore = (): Partial<PersistedState> => {
  try {
    // Check if old store exists
    const oldMode = localStorage.getItem('scribe:sidebarMode')
    const oldWidth = localStorage.getItem('scribe:sidebarWidth')

    if (!oldMode && !oldWidth) return {}

    // Migrate to new schema
    const migrated: Partial<PersistedState> = {
      mode: (oldMode as SidebarMode) || 'compact',
      width: oldWidth ? parseInt(oldWidth, 10) : SIDEBAR_WIDTHS.compact.default,
      pinnedVaults: DEFAULT_PINNED_VAULTS, // Start fresh
      uiState: {
        expandedProjects: new Set(),
        scrollPosition: 0,
        lastActiveSection: null
      }
    }

    // Clean up old keys
    localStorage.removeItem('scribe:sidebarMode')
    localStorage.removeItem('scribe:sidebarWidth')

    return migrated
  } catch {
    return {}
  }
}

// Use in store initialization
const persisted = loadPersistedState()
const migrated = migrateFromOldStore()

return {
  mode: persisted.mode || migrated.mode || 'compact',
  // ... etc
}
```

---

## 7. Testing Strategy for Mode Switching

### 7.1 Unit Tests (Zustand Store)

**Test file:** `useMissionSidebarStore.test.ts`

**Coverage:**
- ✅ Mode cycling: icon → compact → card → icon
- ✅ Width constraints per mode
- ✅ Pinned vaults CRUD (add, remove, reorder)
- ✅ Inbox permanence (cannot unpin)
- ✅ Max 5 vaults enforcement
- ✅ Expanded projects persistence
- ✅ Scroll position save/restore
- ✅ localStorage persistence

```typescript
import { renderHook, act } from '@testing-library/react'
import { useMissionSidebarStore } from '../useMissionSidebarStore'

describe('useMissionSidebarStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('cycles through modes in order', () => {
    const { result } = renderHook(() => useMissionSidebarStore())

    expect(result.current.mode).toBe('compact') // Default

    act(() => result.current.cycleMode())
    expect(result.current.mode).toBe('card')

    act(() => result.current.cycleMode())
    expect(result.current.mode).toBe('icon')

    act(() => result.current.cycleMode())
    expect(result.current.mode).toBe('compact') // Loops back
  })

  it('auto-adjusts width when switching to icon mode', () => {
    const { result } = renderHook(() => useMissionSidebarStore())

    act(() => result.current.setMode('icon'))
    expect(result.current.width).toBe(48)
  })

  it('prevents unpinning Inbox', () => {
    const { result } = renderHook(() => useMissionSidebarStore())

    expect(() => {
      act(() => result.current.removePinnedVault('inbox'))
    }).toThrow('Cannot unpin Inbox')
  })

  it('enforces max 5 pinned vaults', () => {
    const { result } = renderHook(() => useMissionSidebarStore())

    // Add 4 custom vaults (Inbox already exists)
    act(() => {
      result.current.addPinnedVault('proj-1', 'Project 1')
      result.current.addPinnedVault('proj-2', 'Project 2')
      result.current.addPinnedVault('proj-3', 'Project 3')
      result.current.addPinnedVault('proj-4', 'Project 4')
    })

    expect(result.current.pinnedVaults.length).toBe(5)

    // Try to add 6th
    expect(() => {
      act(() => result.current.addPinnedVault('proj-5', 'Project 5'))
    }).toThrow('Maximum 5 pinned vaults')
  })

  it('persists expanded projects to localStorage', () => {
    const { result } = renderHook(() => useMissionSidebarStore())

    act(() => result.current.toggleProjectExpansion('proj-1'))

    // Check localStorage
    const stored = JSON.parse(localStorage.getItem('scribe:missionSidebar')!)
    expect(stored.uiState.expandedProjects).toContain('proj-1')
  })
})
```

### 7.2 Component Tests (React Testing Library)

**Test file:** `MissionSidebar.test.tsx`

**Coverage:**
- ✅ Renders correct mode component based on store state
- ✅ Expand/collapse button toggles mode
- ✅ Resize handle appears in compact/card modes (not icon)
- ✅ Activity Bar renders in all modes
- ✅ Click project → expands note list
- ✅ Click note → triggers `onSelectNote` callback

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { MissionSidebar } from '../MissionSidebar'
import { useMissionSidebarStore } from '../../store/useMissionSidebarStore'

// Mock store
jest.mock('../../store/useMissionSidebarStore')

describe('MissionSidebar', () => {
  const mockProps = {
    projects: [
      { id: 'proj-1', name: 'Research', type: 'research', created_at: Date.now(), updated_at: Date.now() }
    ],
    notes: [],
    currentProjectId: null,
    onSelectProject: jest.fn(),
    onSelectNote: jest.fn(),
    onCreateProject: jest.fn(),
    onNewNote: jest.fn()
  }

  it('renders IconBarMode when mode is "icon"', () => {
    ;(useMissionSidebarStore as any).mockReturnValue({ mode: 'icon', width: 48 })

    render(<MissionSidebar {...mockProps} />)

    expect(screen.getByTestId('icon-bar-mode')).toBeInTheDocument()
    expect(screen.queryByTestId('compact-list-mode')).not.toBeInTheDocument()
  })

  it('expands to compact mode on expand button click', () => {
    const setMode = jest.fn()
    ;(useMissionSidebarStore as any).mockReturnValue({ mode: 'icon', width: 48, setMode })

    render(<MissionSidebar {...mockProps} />)

    const expandBtn = screen.getByTitle(/expand sidebar/i)
    fireEvent.click(expandBtn)

    expect(setMode).toHaveBeenCalledWith('compact')
  })

  it('shows resize handle in compact mode', () => {
    ;(useMissionSidebarStore as any).mockReturnValue({ mode: 'compact', width: 240 })

    render(<MissionSidebar {...mockProps} />)

    expect(screen.getByTestId('resize-handle')).toBeInTheDocument()
  })

  it('does not show resize handle in icon mode', () => {
    ;(useMissionSidebarStore as any).mockReturnValue({ mode: 'icon', width: 48 })

    render(<MissionSidebar {...mockProps} />)

    expect(screen.queryByTestId('resize-handle')).not.toBeInTheDocument()
  })
})
```

### 7.3 E2E Tests (Playwright)

**Test file:** `mission-sidebar.spec.ts`

**Coverage:**
- ✅ Mode cycling with keyboard shortcut (⌘0)
- ✅ Click project in compact mode → expands note list
- ✅ Resize sidebar by dragging handle
- ✅ Pinned vault order persists across page reload
- ✅ Search filter works in compact/card modes

```typescript
import { test, expect } from '@playwright/test'

test.describe('Mission Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('cycles through modes with keyboard shortcut', async ({ page }) => {
    const sidebar = page.locator('[data-testid="left-sidebar"]')

    // Initial mode: compact
    await expect(sidebar).toHaveAttribute('data-mode', 'compact')

    // Press ⌘0
    await page.keyboard.press('Meta+0')
    await expect(sidebar).toHaveAttribute('data-mode', 'icon')

    await page.keyboard.press('Meta+0')
    await expect(sidebar).toHaveAttribute('data-mode', 'compact')
  })

  test('expands project on click in compact mode', async ({ page }) => {
    const projectItem = page.locator('.compact-project-item').first()
    await projectItem.click()

    // Check if notes list is visible
    const notesList = page.locator('.project-notes-list')
    await expect(notesList).toBeVisible()
  })

  test('persists pinned vaults after reload', async ({ page }) => {
    // Pin a project via context menu
    const project = page.locator('[data-testid="project-icon-proj-1"]')
    await project.click({ button: 'right' })
    await page.locator('text=Pin to Sidebar').click()

    // Reload page
    await page.reload()

    // Check if project is still pinned
    const pinnedVaults = page.locator('.pinned-vault-item')
    await expect(pinnedVaults).toHaveCount(2) // Inbox + pinned project
  })

  test('resize handle adjusts sidebar width', async ({ page }) => {
    const sidebar = page.locator('[data-testid="left-sidebar"]')
    const resizeHandle = page.locator('[data-testid="resize-handle"]')

    const initialWidth = await sidebar.evaluate((el) => el.offsetWidth)

    // Drag resize handle 50px to the right
    await resizeHandle.hover()
    await page.mouse.down()
    await page.mouse.move(initialWidth + 50, 100)
    await page.mouse.up()

    const newWidth = await sidebar.evaluate((el) => el.offsetWidth)
    expect(newWidth).toBeGreaterThan(initialWidth)
  })
})
```

### 7.4 Performance Tests

**Test file:** `sidebar-performance.test.ts`

**Metric:** Mode switch latency must be < 100ms.

```typescript
import { renderHook, act } from '@testing-library/react'
import { useMissionSidebarStore } from '../useMissionSidebarStore'

describe('Mission Sidebar Performance', () => {
  it('mode switch completes in < 100ms', () => {
    const { result } = renderHook(() => useMissionSidebarStore())

    const start = performance.now()

    act(() => {
      result.current.setMode('card')
    })

    const end = performance.now()
    const duration = end - start

    expect(duration).toBeLessThan(100) // ADHD-friendly threshold
  })

  it('handles 100 projects without lag', () => {
    const { result } = renderHook(() => useMissionSidebarStore())

    // Add 100 projects to expanded set
    const start = performance.now()

    act(() => {
      for (let i = 0; i < 100; i++) {
        result.current.toggleProjectExpansion(`proj-${i}`)
      }
    })

    const end = performance.now()
    const duration = end - start

    expect(duration).toBeLessThan(500) // Batch operations threshold
  })
})
```

---

## 8. Browser + Tauri Dual Runtime Support

### 8.1 Platform Detection

**Already implemented in:** `src/renderer/src/lib/platform.ts`

```typescript
export const isTauri = (): boolean => {
  return typeof window !== 'undefined' && window.__TAURI__ !== undefined
}

export const isBrowser = (): boolean => {
  return !isTauri()
}
```

### 8.2 Runtime-Specific Behavior

**Mission Sidebar** has no runtime-specific logic—it's pure UI state management.

**Platform differences handled elsewhere:**
- API calls: `src/renderer/src/lib/api.ts` (Tauri invoke vs. IndexedDB)
- Dialogs: `src/renderer/src/lib/browser-dialogs.ts` (native vs. custom modals)

**Sidebar works identically in both runtimes** ✅

### 8.3 Testing Both Runtimes

**Test matrix:**

| Test Type | Tauri | Browser |
|-----------|-------|---------|
| Unit Tests (Zustand) | ✅ | ✅ |
| Component Tests | ✅ | ✅ |
| E2E (Playwright) | ✅ | ✅ |

**E2E test commands:**
```bash
npm run test:e2e:tauri    # Tests Tauri app
npm run test:e2e:browser  # Tests Vite dev server
```

---

## 9. Accessibility Considerations

### 9.1 Keyboard Navigation

**Requirements:**
- ⌘0: Cycle sidebar modes
- Tab: Navigate between vaults
- Enter/Space: Expand/collapse vault
- Arrow keys: Navigate note list
- Escape: Close context menu

**Implementation:**
```tsx
// CompactVaultItem.tsx
<div
  className="vault-item"
  role="button"
  tabIndex={0}
  aria-expanded={isExpanded}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClick()
    }
  }}
>
  {vault.label}
</div>
```

### 9.2 ARIA Labels

```tsx
<button
  className="sidebar-toggle-btn"
  onClick={onExpand}
  aria-label="Expand sidebar to compact mode"
  aria-pressed={mode !== 'icon'}
>
  <Menu size={18} />
</button>
```

### 9.3 Screen Reader Announcements

```tsx
// Announce mode change
import { announce } from '../../lib/a11y'

const handleModeChange = (newMode: SidebarMode) => {
  setMode(newMode)
  announce(`Sidebar changed to ${newMode} mode`)
}
```

---

## 10. Future Enhancements (Post-v2.0)

### 10.1 Drag-and-Drop Note Organization

**Feature:** Drag notes between projects in sidebar.

**Implementation:** Use `react-dnd` or `@dnd-kit/core`:

```tsx
import { useSortable } from '@dnd-kit/sortable'

function DraggableNoteItem({ note }: { note: Note }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: note.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform, transition }}
      {...attributes}
      {...listeners}
    >
      {note.title}
    </div>
  )
}
```

### 10.2 Customizable Activity Bar

**Feature:** Users add/remove Activity Bar icons (e.g., Graph, Tags, Export).

**Settings Schema:**
```typescript
{
  id: 'sidebar.activityBarItems',
  type: 'multi-select',
  label: 'Activity Bar Items',
  options: [
    { label: 'Search', value: 'search' },
    { label: 'Daily Note', value: 'daily' },
    { label: 'Graph View', value: 'graph' },
    { label: 'Tags', value: 'tags' },
    { label: 'Settings', value: 'settings' }
  ],
  defaultValue: ['search', 'daily', 'settings']
}
```

### 10.3 Smart Vault Suggestions

**Feature:** AI-powered vault recommendations based on usage patterns.

**Example:** "You access Research 3x more than Teaching. Pin it?"

---

## 11. Summary & Next Steps

### ✅ Deliverables

This architecture provides:
1. **Zustand store schema** for sidebar state management
2. **Component hierarchy** with clear data flow
3. **Settings integration** for pinned vaults customization
4. **CSS transition strategy** to meet < 100ms budget
5. **Performance optimizations** (virtualization, memoization, debouncing)
6. **Phased migration plan** (6 sessions, ~15-20 hours)
7. **Comprehensive test strategy** (unit, component, E2E, performance)

### 🚀 Implementation Order

**Recommended sequence:**
1. **Phase 1:** Create `useMissionSidebarStore.ts` (non-breaking)
2. **Phase 2:** Add pinned vaults UI to Compact/Card modes
3. **Phase 3:** Persist expanded project state
4. **Phase 4:** Integrate Activity Bar at bottom
5. **Phase 5:** Add Settings panel for customization
6. **Phase 6:** Deprecate old store fields

**Start with:** Phase 1 (store creation) in next work session.

---

## 12. Open Questions for DT

1. **Inbox behavior:** Should Inbox always show all unassigned notes, or only recent 5 (like other vaults)?
2. **Activity Bar position:** Bottom of sidebar (as spec'd) or top header?
3. **Max pinned vaults:** Keep at 5, or allow user to configure (e.g., 3-10)?
4. **Default mode on fresh install:** Compact (current) or Icon (minimalist)?
5. **Search scope in sidebar:** Search only pinned vaults, or all projects?

**Action:** Review and approve before starting Phase 1 implementation.

---

**Document Version:** 1.0
**Last Updated:** 2026-01-08
**Author:** Claude Sonnet 4.5 (Backend Architect)
**Review Status:** Pending DT approval
