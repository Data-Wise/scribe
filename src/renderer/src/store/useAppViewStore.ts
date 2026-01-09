import { create } from 'zustand'
import type { PinnedVault, SidebarMode, SmartIcon, SmartIconId } from '../types'

/**
 * App View Store - Manages sidebar state, tabs, and session tracking
 *
 * Sidebar modes:
 * - icon: 48px, project dots only
 * - compact: 240px, project list with stats
 * - card: 320px+, full project cards
 */

export type { SidebarMode } from '../types'

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
  pinnedVaults: PinnedVault[]  // Max 5 (Inbox + 4 custom)
  smartIcons: SmartIcon[]  // 4 permanent smart folders
  expandedSmartIconId: SmartIconId | null  // Accordion: only one expanded at a time

  // Editor tabs state
  openTabs: EditorTab[]
  activeTabId: string | null
  closedTabsHistory: EditorTab[]

  // Session tracking
  lastActiveNoteId: string | null

  // Sidebar actions
  setSidebarMode: (mode: SidebarMode) => void
  cycleSidebarMode: () => void
  toggleSidebarCollapsed: () => void
  setSidebarWidth: (width: number) => void

  // Pinned vaults actions
  addPinnedVault: (projectId: string, label: string, color?: string) => boolean
  removePinnedVault: (vaultId: string) => void
  reorderPinnedVaults: (fromIndex: number, toIndex: number) => void
  isPinned: (projectId: string) => boolean

  // Smart icon actions
  toggleSmartIcon: (iconId: SmartIconId) => void
  setSmartIconExpanded: (iconId: SmartIconId, expanded: boolean) => void
  setSmartIconVisibility: (iconId: SmartIconId, visible: boolean) => void
  reorderSmartIcons: (fromIndex: number, toIndex: number) => void

  // Tab actions
  openTab: (tab: Omit<EditorTab, 'id'>) => string
  openNoteTab: (noteId: string, title: string) => void
  closeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  reorderTabs: (fromIndex: number, toIndex: number) => void
  pinTab: (tabId: string) => void
  unpinTab: (tabId: string) => void
  updateTabTitle: (tabId: string, title: string) => void
  reopenLastClosedTab: () => void

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
const PINNED_VAULTS_KEY = 'scribe:pinnedVaults'
const SMART_ICONS_KEY = 'scribe:smartIcons'
const EXPANDED_SMART_ICON_KEY = 'scribe:expandedSmartIconId'

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

const saveActiveTabId = (tabId: string | null): void => {
  try {
    if (tabId) {
      localStorage.setItem(ACTIVE_TAB_KEY, tabId)
    } else {
      localStorage.removeItem(ACTIVE_TAB_KEY)
    }
  } catch {
    // Ignore localStorage errors
  }
}

// Default Inbox vault (always pinned, always first)
const INBOX_VAULT: PinnedVault = {
  id: 'inbox',
  label: 'Inbox',
  order: 0,
  isPermanent: true
}

// Default Smart Icons configuration
const DEFAULT_SMART_ICONS: SmartIcon[] = [
  {
    id: 'research',
    label: 'Research',
    icon: '📖',
    color: '#8B5CF6',  // purple-500
    projectType: 'research',
    isVisible: true,
    isExpanded: false,
    order: 0
  },
  {
    id: 'teaching',
    label: 'Teaching',
    icon: '🎓',
    color: '#10B981',  // green-500
    projectType: 'teaching',
    isVisible: true,
    isExpanded: false,
    order: 1
  },
  {
    id: 'r-package',
    label: 'R Packages',
    icon: '📦',
    color: '#3B82F6',  // blue-500
    projectType: 'r-package',
    isVisible: true,
    isExpanded: false,
    order: 2
  },
  {
    id: 'dev-tools',
    label: 'Dev Tools',
    icon: '⚙️',
    color: '#F59E0B',  // amber-500
    projectType: 'r-dev',  // Maps to r-dev project type
    isVisible: true,
    isExpanded: false,
    order: 3
  }
]

const getSavedPinnedVaults = (): PinnedVault[] => {
  try {
    const saved = localStorage.getItem(PINNED_VAULTS_KEY)
    if (saved) {
      const vaults = JSON.parse(saved) as PinnedVault[]
      // Ensure Inbox is always first and present
      const hasInbox = vaults.some(v => v.id === 'inbox')
      if (!hasInbox) {
        return [INBOX_VAULT, ...vaults.filter(v => v.id !== 'inbox')]
      }
      // Sort by order
      return vaults.sort((a, b) => a.order - b.order)
    }
    return [INBOX_VAULT]
  } catch {
    return [INBOX_VAULT]
  }
}

const savePinnedVaults = (vaults: PinnedVault[]): void => {
  try {
    localStorage.setItem(PINNED_VAULTS_KEY, JSON.stringify(vaults))
  } catch {
    // Ignore localStorage errors
  }
}

const getSavedSmartIcons = (): SmartIcon[] => {
  try {
    const saved = localStorage.getItem(SMART_ICONS_KEY)
    if (saved) {
      const icons = JSON.parse(saved) as SmartIcon[]
      // Merge with defaults to ensure all icons exist with correct schema
      return DEFAULT_SMART_ICONS.map(defaultIcon => {
        const savedIcon = icons.find(i => i.id === defaultIcon.id)
        return savedIcon ? { ...defaultIcon, ...savedIcon } : defaultIcon
      }).sort((a, b) => a.order - b.order)
    }
    return DEFAULT_SMART_ICONS
  } catch {
    return DEFAULT_SMART_ICONS
  }
}

const saveSmartIcons = (icons: SmartIcon[]): void => {
  try {
    localStorage.setItem(SMART_ICONS_KEY, JSON.stringify(icons))
  } catch {
    // Ignore localStorage errors
  }
}

const getSavedExpandedSmartIconId = (): SmartIconId | null => {
  try {
    const saved = localStorage.getItem(EXPANDED_SMART_ICON_KEY)
    if (saved && ['research', 'teaching', 'r-package', 'dev-tools'].includes(saved)) {
      return saved as SmartIconId
    }
    return null
  } catch {
    return null
  }
}

const saveExpandedSmartIconId = (iconId: SmartIconId | null): void => {
  try {
    if (iconId) {
      localStorage.setItem(EXPANDED_SMART_ICON_KEY, iconId)
    } else {
      localStorage.removeItem(EXPANDED_SMART_ICON_KEY)
    }
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
  pinnedVaults: getSavedPinnedVaults(),
  smartIcons: getSavedSmartIcons(),
  expandedSmartIconId: getSavedExpandedSmartIconId(),
  lastActiveNoteId: getLastActiveNoteId(),
  openTabs: getSavedTabs(),
  activeTabId: getSavedActiveTabId(),
  closedTabsHistory: [],

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

  toggleSidebarCollapsed: () => {
    const current = get().sidebarMode
    // Toggle between 'icon' (collapsed) and 'compact' (expanded)
    const next: SidebarMode = current === 'icon' ? 'compact' : 'icon'
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

  // Pinned vaults actions
  addPinnedVault: (projectId, label, color) => {
    const { pinnedVaults } = get()

    // Check if already pinned
    if (pinnedVaults.some(v => v.id === projectId)) {
      return false
    }

    // Max 5 vaults (Inbox + 4 custom)
    const customVaults = pinnedVaults.filter(v => v.id !== 'inbox')
    if (customVaults.length >= 4) {
      return false
    }

    // Find next available order number
    const maxOrder = pinnedVaults.reduce((max, v) => Math.max(max, v.order), 0)

    const newVault: PinnedVault = {
      id: projectId,
      label,
      color,
      order: maxOrder + 1,
      isPermanent: false
    }

    const newVaults = [...pinnedVaults, newVault].sort((a, b) => a.order - b.order)
    set({ pinnedVaults: newVaults })
    savePinnedVaults(newVaults)
    return true
  },

  removePinnedVault: (vaultId) => {
    const { pinnedVaults } = get()

    // Cannot remove Inbox
    if (vaultId === 'inbox') {
      return
    }

    const newVaults = pinnedVaults.filter(v => v.id !== vaultId)
    // Reorder remaining vaults
    const reordered = newVaults.map((v, index) => ({ ...v, order: index }))
    set({ pinnedVaults: reordered })
    savePinnedVaults(reordered)
  },

  reorderPinnedVaults: (fromIndex, toIndex) => {
    const { pinnedVaults } = get()

    // Cannot move Inbox (always order 0)
    if (fromIndex === 0 || toIndex === 0) {
      return
    }

    const newVaults = [...pinnedVaults]
    const [moved] = newVaults.splice(fromIndex, 1)
    newVaults.splice(toIndex, 0, moved)

    // Update order numbers
    const reordered = newVaults.map((v, index) => ({ ...v, order: index }))
    set({ pinnedVaults: reordered })
    savePinnedVaults(reordered)
  },

  isPinned: (projectId) => {
    const { pinnedVaults } = get()
    return pinnedVaults.some(v => v.id === projectId)
  },

  // Smart icon actions
  toggleSmartIcon: (iconId) => {
    const { expandedSmartIconId, smartIcons } = get()

    // Toggle: if already expanded, collapse it; otherwise expand it
    const newExpandedId = expandedSmartIconId === iconId ? null : iconId

    // Update expansion state in smartIcons array
    const newIcons = smartIcons.map(icon => ({
      ...icon,
      isExpanded: icon.id === newExpandedId
    }))

    set({
      expandedSmartIconId: newExpandedId,
      smartIcons: newIcons
    })
    saveExpandedSmartIconId(newExpandedId)
    saveSmartIcons(newIcons)
  },

  setSmartIconExpanded: (iconId, expanded) => {
    const { smartIcons } = get()

    // Accordion mode: only one expanded at a time
    const newExpandedId = expanded ? iconId : null

    const newIcons = smartIcons.map(icon => ({
      ...icon,
      isExpanded: icon.id === newExpandedId
    }))

    set({
      expandedSmartIconId: newExpandedId,
      smartIcons: newIcons
    })
    saveExpandedSmartIconId(newExpandedId)
    saveSmartIcons(newIcons)
  },

  setSmartIconVisibility: (iconId, visible) => {
    const { smartIcons } = get()

    const newIcons = smartIcons.map(icon =>
      icon.id === iconId ? { ...icon, isVisible: visible } : icon
    )

    set({ smartIcons: newIcons })
    saveSmartIcons(newIcons)
  },

  reorderSmartIcons: (fromIndex, toIndex) => {
    const { smartIcons } = get()

    const newIcons = [...smartIcons]
    const [moved] = newIcons.splice(fromIndex, 1)
    newIcons.splice(toIndex, 0, moved)

    // Update order numbers
    const reordered = newIcons.map((icon, index) => ({ ...icon, order: index }))

    set({ smartIcons: reordered })
    saveSmartIcons(reordered)
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
    const { openTabs, activeTabId, closedTabsHistory } = get()
    const tab = openTabs.find(t => t.id === tabId)

    // Cannot close pinned tabs
    if (!tab || tab.isPinned) return

    // Save tab to history before removing (max 10)
    const newHistory = [tab, ...closedTabsHistory].slice(0, 10)

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

    set({ openTabs: newTabs, activeTabId: newActiveId, closedTabsHistory: newHistory })
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

  reopenLastClosedTab: () => {
    const { closedTabsHistory, openTabs } = get()
    if (closedTabsHistory.length === 0) return

    const [tabToReopen, ...remainingHistory] = closedTabsHistory

    // Check if tab is already open (by noteId for note tabs)
    const existingTab = tabToReopen.type === 'note' && tabToReopen.noteId
      ? openTabs.find(t => t.type === 'note' && t.noteId === tabToReopen.noteId)
      : openTabs.find(t => t.id === tabToReopen.id)

    if (existingTab) {
      // Just activate it and remove from history
      set({ activeTabId: existingTab.id, closedTabsHistory: remainingHistory })
      saveActiveTabId(existingTab.id)
      return
    }

    // Add tab after pinned tabs
    const pinnedCount = openTabs.filter(t => t.isPinned).length
    const newTabs = [
      ...openTabs.slice(0, pinnedCount),
      tabToReopen,
      ...openTabs.slice(pinnedCount)
    ]

    set({
      openTabs: newTabs,
      activeTabId: tabToReopen.id,
      closedTabsHistory: remainingHistory
    })
    saveTabs(newTabs)
    saveActiveTabId(tabToReopen.id)
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
