import { create } from 'zustand'

/**
 * App View Store - Manages sidebar state, tabs, and session tracking
 *
 * Sidebar modes:
 * - icon: 48px, project dots only
 * - compact: 240px, project list with stats
 * - card: 320px+, full project cards
 */

export type SidebarMode = 'icon' | 'compact' | 'card'

/** Editor tab types */
export type TabType = 'mission-control' | 'note'

export interface EditorTab {
  id: string
  type: TabType
  noteId?: string  // Only for 'note' type
  title: string
  isPinned: boolean
}

interface AppViewState {
  // Sidebar state
  sidebarMode: SidebarMode
  sidebarWidth: number

  // Editor tabs state
  openTabs: EditorTab[]
  activeTabId: string | null

  // Session tracking
  lastActiveNoteId: string | null

  // Sidebar actions
  setSidebarMode: (mode: SidebarMode) => void
  cycleSidebarMode: () => void
  setSidebarWidth: (width: number) => void

  // Tab actions
  openTab: (tab: Omit<EditorTab, 'id'>) => string
  openNoteTab: (noteId: string, title: string) => void
  closeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  reorderTabs: (fromIndex: number, toIndex: number) => void
  pinTab: (tabId: string) => void
  unpinTab: (tabId: string) => void
  updateTabTitle: (tabId: string, title: string) => void

  // Session actions
  setLastActiveNote: (noteId: string | null) => void
  updateSessionTimestamp: () => void
}

// localStorage keys
const SESSION_KEY = 'scribe:lastSessionTimestamp'
const LAST_NOTE_KEY = 'scribe:lastActiveNoteId'
const SIDEBAR_MODE_KEY = 'scribe:sidebarMode'
const SIDEBAR_WIDTH_KEY = 'scribe:sidebarWidth'
const OPEN_TABS_KEY = 'scribe:openTabs'
const ACTIVE_TAB_KEY = 'scribe:activeTabId'

// Mission Control tab ID (constant, always pinned)
export const MISSION_CONTROL_TAB_ID = 'mission-control'

// Default Mission Control tab
const MISSION_CONTROL_TAB: EditorTab = {
  id: MISSION_CONTROL_TAB_ID,
  type: 'mission-control',
  title: 'Mission Control',
  isPinned: true
}

// Generate unique tab ID
const generateTabId = (): string => `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Sidebar width constraints
export const SIDEBAR_WIDTHS = {
  icon: 48,
  compact: { default: 240, min: 200, max: 300 },
  card: { default: 320, min: 320, max: 500 }
}

// Helper functions for localStorage
const getLastSessionTimestamp = (): number | null => {
  try {
    const saved = localStorage.getItem(SESSION_KEY)
    return saved ? parseInt(saved, 10) : null
  } catch {
    return null
  }
}

const saveSessionTimestamp = (): void => {
  try {
    localStorage.setItem(SESSION_KEY, Date.now().toString())
  } catch {
    // Ignore localStorage errors
  }
}

const getLastActiveNoteId = (): string | null => {
  try {
    return localStorage.getItem(LAST_NOTE_KEY)
  } catch {
    return null
  }
}

const saveLastActiveNoteId = (noteId: string | null): void => {
  try {
    if (noteId) {
      localStorage.setItem(LAST_NOTE_KEY, noteId)
    } else {
      localStorage.removeItem(LAST_NOTE_KEY)
    }
  } catch {
    // Ignore localStorage errors
  }
}

const getSavedSidebarMode = (): SidebarMode => {
  try {
    const saved = localStorage.getItem(SIDEBAR_MODE_KEY)
    if (saved === 'icon' || saved === 'compact' || saved === 'card') {
      return saved
    }
    return 'compact' // default
  } catch {
    return 'compact'
  }
}

const saveSidebarMode = (mode: SidebarMode): void => {
  try {
    localStorage.setItem(SIDEBAR_MODE_KEY, mode)
  } catch {
    // Ignore localStorage errors
  }
}

const getSavedSidebarWidth = (): number => {
  try {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY)
    if (saved) {
      const width = parseInt(saved, 10)
      if (!isNaN(width) && width >= SIDEBAR_WIDTHS.compact.min) {
        return width
      }
    }
    return SIDEBAR_WIDTHS.compact.default
  } catch {
    return SIDEBAR_WIDTHS.compact.default
  }
}

const saveSidebarWidth = (width: number): void => {
  try {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, width.toString())
  } catch {
    // Ignore localStorage errors
  }
}

const getSavedTabs = (): EditorTab[] => {
  try {
    const saved = localStorage.getItem(OPEN_TABS_KEY)
    if (saved) {
      const tabs = JSON.parse(saved) as EditorTab[]
      // Ensure Mission Control is always first and pinned
      const hasMissionControl = tabs.some(t => t.id === MISSION_CONTROL_TAB_ID)
      if (!hasMissionControl) {
        return [MISSION_CONTROL_TAB, ...tabs]
      }
      // Move Mission Control to first if it's not
      const filtered = tabs.filter(t => t.id !== MISSION_CONTROL_TAB_ID)
      return [{ ...MISSION_CONTROL_TAB, isPinned: true }, ...filtered]
    }
    return [MISSION_CONTROL_TAB]
  } catch {
    return [MISSION_CONTROL_TAB]
  }
}

const saveTabs = (tabs: EditorTab[]): void => {
  try {
    localStorage.setItem(OPEN_TABS_KEY, JSON.stringify(tabs))
  } catch {
    // Ignore localStorage errors
  }
}

const getSavedActiveTabId = (): string => {
  try {
    return localStorage.getItem(ACTIVE_TAB_KEY) || MISSION_CONTROL_TAB_ID
  } catch {
    return MISSION_CONTROL_TAB_ID
  }
}

const saveActiveTabId = (tabId: string): void => {
  try {
    localStorage.setItem(ACTIVE_TAB_KEY, tabId)
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Determine initial sidebar mode based on session context
 * - Fresh start or > 4 hours → compact (get bearings)
 * - Recent session → restore saved mode
 */
const determineInitialSidebarMode = (): SidebarMode => {
  const lastTimestamp = getLastSessionTimestamp()
  const now = Date.now()
  const SESSION_TIMEOUT_MS = 4 * 60 * 60 * 1000 // 4 hours

  // Fresh start - show compact to get oriented
  if (!lastTimestamp) {
    return 'compact'
  }

  const timeSinceLastSession = now - lastTimestamp

  // Long break (> 4 hours) - show compact
  if (timeSinceLastSession > SESSION_TIMEOUT_MS) {
    return 'compact'
  }

  // Recent session - restore saved mode
  return getSavedSidebarMode()
}

export const useAppViewStore = create<AppViewState>((set, get) => ({
  sidebarMode: determineInitialSidebarMode(),
  sidebarWidth: getSavedSidebarWidth(),
  lastActiveNoteId: getLastActiveNoteId(),
  openTabs: getSavedTabs(),
  activeTabId: getSavedActiveTabId(),

  setSidebarMode: (mode: SidebarMode) => {
    set({ sidebarMode: mode })
    saveSidebarMode(mode)
  },

  cycleSidebarMode: () => {
    const current = get().sidebarMode
    const modes: SidebarMode[] = ['icon', 'compact', 'card']
    const currentIndex = modes.indexOf(current)
    const nextIndex = (currentIndex + 1) % modes.length
    const next = modes[nextIndex]
    set({ sidebarMode: next })
    saveSidebarMode(next)
  },

  setSidebarWidth: (width: number) => {
    const mode = get().sidebarMode
    let constrainedWidth = width

    if (mode === 'compact') {
      constrainedWidth = Math.max(SIDEBAR_WIDTHS.compact.min, Math.min(SIDEBAR_WIDTHS.compact.max, width))
    } else if (mode === 'card') {
      constrainedWidth = Math.max(SIDEBAR_WIDTHS.card.min, Math.min(SIDEBAR_WIDTHS.card.max, width))
    }

    set({ sidebarWidth: constrainedWidth })
    saveSidebarWidth(constrainedWidth)
  },

  // Tab actions
  openTab: (tabData) => {
    const id = generateTabId()
    const newTab: EditorTab = { ...tabData, id }
    const { openTabs } = get()

    // Add after pinned tabs
    const pinnedCount = openTabs.filter(t => t.isPinned).length
    const newTabs = [
      ...openTabs.slice(0, pinnedCount),
      newTab,
      ...openTabs.slice(pinnedCount)
    ]

    set({ openTabs: newTabs, activeTabId: id })
    saveTabs(newTabs)
    saveActiveTabId(id)
    return id
  },

  openNoteTab: (noteId, title) => {
    const { openTabs, openTab, setActiveTab } = get()

    // Check if note is already open
    const existingTab = openTabs.find(t => t.type === 'note' && t.noteId === noteId)
    if (existingTab) {
      setActiveTab(existingTab.id)
      return
    }

    // Open new tab
    openTab({
      type: 'note',
      noteId,
      title: title || 'Untitled',
      isPinned: false
    })
  },

  closeTab: (tabId) => {
    const { openTabs, activeTabId } = get()
    const tab = openTabs.find(t => t.id === tabId)

    // Cannot close pinned tabs
    if (!tab || tab.isPinned) return

    const tabIndex = openTabs.findIndex(t => t.id === tabId)
    const newTabs = openTabs.filter(t => t.id !== tabId)

    // If closing active tab, select adjacent
    let newActiveId = activeTabId
    if (activeTabId === tabId) {
      if (tabIndex > 0) {
        newActiveId = newTabs[tabIndex - 1]?.id || MISSION_CONTROL_TAB_ID
      } else {
        newActiveId = newTabs[0]?.id || MISSION_CONTROL_TAB_ID
      }
    }

    set({ openTabs: newTabs, activeTabId: newActiveId })
    saveTabs(newTabs)
    saveActiveTabId(newActiveId)
  },

  setActiveTab: (tabId) => {
    set({ activeTabId: tabId })
    saveActiveTabId(tabId)
  },

  reorderTabs: (fromIndex, toIndex) => {
    const { openTabs } = get()

    // Don't allow moving pinned tabs or moving before pinned tabs
    const pinnedCount = openTabs.filter(t => t.isPinned).length
    if (fromIndex < pinnedCount || toIndex < pinnedCount) return

    const newTabs = [...openTabs]
    const [removed] = newTabs.splice(fromIndex, 1)
    newTabs.splice(toIndex, 0, removed)

    set({ openTabs: newTabs })
    saveTabs(newTabs)
  },

  pinTab: (tabId) => {
    const { openTabs } = get()
    const tabIndex = openTabs.findIndex(t => t.id === tabId)
    if (tabIndex === -1) return

    const tab = openTabs[tabIndex]
    if (tab.isPinned) return

    // Pin and move to end of pinned section
    const newTabs = openTabs.filter(t => t.id !== tabId)
    const pinnedCount = newTabs.filter(t => t.isPinned).length
    newTabs.splice(pinnedCount, 0, { ...tab, isPinned: true })

    set({ openTabs: newTabs })
    saveTabs(newTabs)
  },

  unpinTab: (tabId) => {
    const { openTabs } = get()

    // Cannot unpin Mission Control
    if (tabId === MISSION_CONTROL_TAB_ID) return

    const newTabs = openTabs.map(t =>
      t.id === tabId ? { ...t, isPinned: false } : t
    )

    set({ openTabs: newTabs })
    saveTabs(newTabs)
  },

  updateTabTitle: (tabId, title) => {
    const { openTabs } = get()
    const newTabs = openTabs.map(t =>
      t.id === tabId ? { ...t, title } : t
    )
    set({ openTabs: newTabs })
    saveTabs(newTabs)
  },

  setLastActiveNote: (noteId: string | null) => {
    set({ lastActiveNoteId: noteId })
    saveLastActiveNoteId(noteId)
  },

  updateSessionTimestamp: () => {
    saveSessionTimestamp()
  }
}))

// Initialize session timestamp on first load
saveSessionTimestamp()
