import { create } from 'zustand'
import type { PinnedVault, SmartIcon, SmartIconId, ProjectType, ExpandedIconType } from '../types'

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

export interface RecentNote {
  id: string
  title: string
  projectId: string | null
  openedAt: number  // timestamp
}

interface AppViewState {
  // Sidebar state (v1.16.0 - Icon-Centric Expansion)
  expandedIcon: ExpandedIconType  // Which icon is expanded (vault/smart/null)
  sidebarWidth: number
  pinnedVaults: PinnedVault[]  // Max 5 (Inbox + 4 custom), each with preferredMode
  smartIcons: SmartIcon[]  // 4 permanent smart folders, each with preferredMode
  projectTypeFilter: ProjectType | null  // Active project type filter for Mission Control

  // Width memory per mode (v1.16.0)
  compactModeWidth: number  // Global width for all icons in compact mode
  cardModeWidth: number  // Global width for all icons in card mode

  // Editor tabs state
  openTabs: EditorTab[]
  activeTabId: string | null
  closedTabsHistory: EditorTab[]

  // Recent notes tracking
  recentNotes: RecentNote[]  // Last 10 opened notes

  // Responsive layout: tracks whether sidebars were collapsed by resize (not user)
  autoCollapsedLeft: boolean
  autoCollapsedRight: boolean

  // Session tracking
  lastActiveNoteId: string | null

  // Sidebar actions (v1.16.0 - Icon-Centric)
  expandVault: (vaultId: string) => void
  expandSmartIcon: (iconId: SmartIconId) => void
  collapseAll: () => void
  toggleIcon: (type: 'vault' | 'smart', id: string) => void
  setIconMode: (type: 'vault' | 'smart', id: string, mode: 'compact' | 'card') => void
  setSidebarWidth: (width: number) => void

  // Pinned vaults actions
  addPinnedVault: (projectId: string, label: string, color?: string) => boolean
  removePinnedVault: (vaultId: string) => void
  reorderPinnedVaults: (fromIndex: number, toIndex: number) => void
  isPinned: (projectId: string) => boolean

  // Smart icon actions
  setSmartIconVisibility: (iconId: SmartIconId, visible: boolean) => void
  reorderSmartIcons: (fromIndex: number, toIndex: number) => void
  setProjectTypeFilter: (projectType: ProjectType | null) => void

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

  // Recent notes actions
  addRecentNote: (noteId: string, noteTitle: string, projectId: string | null) => void
  clearRecentNotes: () => void

  // Responsive layout actions
  setAutoCollapsedLeft: (v: boolean) => void
  setAutoCollapsedRight: (v: boolean) => void

  // Session actions
  setLastActiveNote: (noteId: string | null) => void
  updateSessionTimestamp: () => void
}

// localStorage keys
const SESSION_KEY = 'scribe:lastSessionTimestamp'
const LAST_NOTE_KEY = 'scribe:lastActiveNoteId'
const SIDEBAR_WIDTH_KEY = 'scribe:sidebarWidth'
const OPEN_TABS_KEY = 'scribe:openTabs'
const ACTIVE_TAB_KEY = 'scribe:activeTabId'
const PINNED_VAULTS_KEY = 'scribe:pinnedVaults'
const SMART_ICONS_KEY = 'scribe:smartIcons'
const RECENT_NOTES_KEY = 'scribe:recentNotes'

// v1.16.0 Icon-Centric Expansion keys
const EXPANDED_ICON_KEY = 'scribe:expandedIcon'
const COMPACT_WIDTH_KEY = 'scribe:compactModeWidth'
const CARD_WIDTH_KEY = 'scribe:cardModeWidth'

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

// Right sidebar width constraints
export const RIGHT_SIDEBAR_WIDTHS = {
  icon: 48,
  expanded: { default: 320, min: 250, max: 600 }
}

// Helper functions for localStorage
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

// v1.16.0: Get saved expanded icon
const getSavedExpandedIcon = (): ExpandedIconType => {
  try {
    const saved = localStorage.getItem(EXPANDED_ICON_KEY)
    if (saved) {
      return JSON.parse(saved) as ExpandedIconType
    }
    return null
  } catch {
    return null
  }
}

// v1.16.0: Save expanded icon
const saveExpandedIcon = (icon: ExpandedIconType): void => {
  try {
    if (icon) {
      localStorage.setItem(EXPANDED_ICON_KEY, JSON.stringify(icon))
    } else {
      localStorage.removeItem(EXPANDED_ICON_KEY)
    }
  } catch {
    // Ignore localStorage errors
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


const getSavedRecentNotes = (): RecentNote[] => {
  try {
    const saved = localStorage.getItem(RECENT_NOTES_KEY)
    if (saved) {
      return JSON.parse(saved) as RecentNote[]
    }
    return []
  } catch {
    return []
  }
}

const saveRecentNotes = (notes: RecentNote[]): void => {
  try {
    localStorage.setItem(RECENT_NOTES_KEY, JSON.stringify(notes))
  } catch {
    // Ignore localStorage errors
  }
}


const getCompactModeWidth = (): number => {
  try {
    const saved = localStorage.getItem(COMPACT_WIDTH_KEY)
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

const saveCompactModeWidth = (width: number): void => {
  try {
    localStorage.setItem(COMPACT_WIDTH_KEY, width.toString())
  } catch {
    // Ignore localStorage errors
  }
}

const getCardModeWidth = (): number => {
  try {
    const saved = localStorage.getItem(CARD_WIDTH_KEY)
    if (saved) {
      const width = parseInt(saved, 10)
      if (!isNaN(width) && width >= SIDEBAR_WIDTHS.card.min) {
        return width
      }
    }
    return SIDEBAR_WIDTHS.card.default
  } catch {
    return SIDEBAR_WIDTHS.card.default
  }
}

const saveCardModeWidth = (width: number): void => {
  try {
    localStorage.setItem(CARD_WIDTH_KEY, width.toString())
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * v1.16.0 Migration: Convert v1.15.0 localStorage to icon-centric format
 * Automatically runs once on first load after upgrade
 */
const migrateToIconCentric = (): void => {
  try {
    // Check if migration already complete using dedicated version key
    const MIGRATION_VERSION_KEY = 'scribe:migrationVersion'
    const currentVersion = localStorage.getItem(MIGRATION_VERSION_KEY)
    if (currentVersion === 'v1.16.0') return // Already migrated

    // Read v1.15.0 keys
    const oldMode = localStorage.getItem('scribe:sidebarMode') // v1.15.0
    const oldExpandedSmartIconId = localStorage.getItem('scribe:expandedSmartIconId') // v1.15.0

    // If sidebar was expanded (not icon mode) and a smart icon was expanded, restore it
    if (oldMode && oldMode !== 'icon' && oldExpandedSmartIconId) {
      const expandedIcon: ExpandedIconType = {
        type: 'smart',
        id: oldExpandedSmartIconId as SmartIconId
      }
      localStorage.setItem(EXPANDED_ICON_KEY, JSON.stringify(expandedIcon))
    }

    // Clean up deprecated keys
    localStorage.removeItem('scribe:sidebarMode')
    localStorage.removeItem('scribe:lastExpandedMode')
    localStorage.removeItem('scribe:lastModeChangeTimestamp')
    localStorage.removeItem('scribe:expandedSmartIconId')

    console.log('[Migration] v1.15.0 → v1.16.0 icon-centric migration complete')
    localStorage.setItem('scribe:migrationVersion', 'v1.16.0')
  } catch (error) {
    console.warn('[Migration] Failed to migrate localStorage:', error)
  }
}

// Run migration before initialization
migrateToIconCentric()

export const useAppViewStore = create<AppViewState>((set, get) => {
  // Initialize state
  const expandedIcon = getSavedExpandedIcon()
  const compactWidth = getCompactModeWidth()
  const cardWidth = getCardModeWidth()

  // Determine initial sidebar width based on expanded icon's mode
  let initialWidth = SIDEBAR_WIDTHS.icon // Default to icon mode (collapsed)
  if (expandedIcon) {
    // Get the expanded icon's preferred mode
    const pinnedVaults = getSavedPinnedVaults()
    const smartIcons = getSavedSmartIcons()

    if (expandedIcon.type === 'vault') {
      const vault = pinnedVaults.find(v => v.id === expandedIcon.id)
      const mode = vault?.preferredMode || 'compact'
      initialWidth = mode === 'compact' ? compactWidth : cardWidth
    } else {
      const icon = smartIcons.find(i => i.id === expandedIcon.id)
      const mode = icon?.preferredMode || 'compact'
      initialWidth = mode === 'compact' ? compactWidth : cardWidth
    }
  }

  return {
    expandedIcon,
    sidebarWidth: initialWidth,
    pinnedVaults: getSavedPinnedVaults(),
    smartIcons: getSavedSmartIcons(),
    projectTypeFilter: null,

    // Width memory per mode (v1.16.0)
    compactModeWidth: compactWidth,
    cardModeWidth: cardWidth,

    autoCollapsedLeft: false,
    autoCollapsedRight: false,

    lastActiveNoteId: getLastActiveNoteId(),
    openTabs: getSavedTabs(),
    activeTabId: getSavedActiveTabId(),
    closedTabsHistory: [],
    recentNotes: getSavedRecentNotes(),

    // v1.16.0 Icon-Centric Sidebar Actions

    expandVault: (vaultId) => {
      const { pinnedVaults, compactModeWidth, cardModeWidth } = get()
      const vault = pinnedVaults.find(v => v.id === vaultId)
      const mode = vault?.preferredMode || 'compact'
      const width = mode === 'compact' ? compactModeWidth : cardModeWidth

      const expandedIcon: ExpandedIconType = { type: 'vault', id: vaultId }
      set({ expandedIcon, sidebarWidth: width })
      saveExpandedIcon(expandedIcon)
      saveSidebarWidth(width)
    },

    expandSmartIcon: (iconId) => {
      const { smartIcons, compactModeWidth, cardModeWidth } = get()
      const icon = smartIcons.find(i => i.id === iconId)
      const mode = icon?.preferredMode || 'compact'
      const width = mode === 'compact' ? compactModeWidth : cardModeWidth

      const expandedIcon: ExpandedIconType = { type: 'smart', id: iconId }
      set({ expandedIcon, sidebarWidth: width })
      saveExpandedIcon(expandedIcon)
      saveSidebarWidth(width)
    },

    collapseAll: () => {
      set({ expandedIcon: null, sidebarWidth: SIDEBAR_WIDTHS.icon })
      saveExpandedIcon(null)
      saveSidebarWidth(SIDEBAR_WIDTHS.icon)
    },

    toggleIcon: (type, id) => {
      const { expandedIcon, expandVault, expandSmartIcon, collapseAll } = get()

      // If clicking already expanded icon, collapse it
      if (expandedIcon?.type === type && expandedIcon?.id === id) {
        collapseAll()
        return
      }

      // Otherwise expand this icon (auto-collapses others)
      if (type === 'vault') {
        expandVault(id)
      } else {
        expandSmartIcon(id as SmartIconId)
      }
    },

    setIconMode: (type, id, mode) => {
      const { pinnedVaults, smartIcons, expandedIcon, compactModeWidth, cardModeWidth } = get()

      // Update icon's preferred mode
      if (type === 'vault') {
        const newVaults = pinnedVaults.map(v =>
          v.id === id ? { ...v, preferredMode: mode } : v
        )
        set({ pinnedVaults: newVaults })
        savePinnedVaults(newVaults)
      } else {
        const newIcons = smartIcons.map(i =>
          i.id === id ? { ...i, preferredMode: mode } : i
        )
        set({ smartIcons: newIcons })
        saveSmartIcons(newIcons)
      }

      // Update width if this icon is currently expanded
      if (expandedIcon?.type === type && expandedIcon?.id === id) {
        const width = mode === 'compact' ? compactModeWidth : cardModeWidth
        set({ sidebarWidth: width })
        saveSidebarWidth(width)
      }
    },

    setSidebarWidth: (width: number) => {
      const { expandedIcon, pinnedVaults, smartIcons } = get()

      // If sidebar collapsed, do nothing
      if (!expandedIcon) return

      // Get current icon's mode
      let mode: 'compact' | 'card' = 'compact'
      if (expandedIcon.type === 'vault') {
        const vault = pinnedVaults.find(v => v.id === expandedIcon.id)
        mode = vault?.preferredMode || 'compact'
      } else {
        const icon = smartIcons.find(i => i.id === expandedIcon.id)
        mode = icon?.preferredMode || 'compact'
      }

      // Constrain width based on mode
      let constrainedWidth = width
      if (mode === 'compact') {
        constrainedWidth = Math.max(SIDEBAR_WIDTHS.compact.min, Math.min(SIDEBAR_WIDTHS.compact.max, width))
        set({ sidebarWidth: constrainedWidth, compactModeWidth: constrainedWidth })
        saveSidebarWidth(constrainedWidth)
        saveCompactModeWidth(constrainedWidth)
      } else {
        constrainedWidth = Math.max(SIDEBAR_WIDTHS.card.min, Math.min(SIDEBAR_WIDTHS.card.max, width))
        set({ sidebarWidth: constrainedWidth, cardModeWidth: constrainedWidth })
        saveSidebarWidth(constrainedWidth)
        saveCardModeWidth(constrainedWidth)
      }
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

    setProjectTypeFilter: (projectType) => {
      set({ projectTypeFilter: projectType })
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

    setAutoCollapsedLeft: (v: boolean) => set({ autoCollapsedLeft: v }),
    setAutoCollapsedRight: (v: boolean) => set({ autoCollapsedRight: v }),

    setLastActiveNote: (noteId: string | null) => {
      set({ lastActiveNoteId: noteId })
      saveLastActiveNoteId(noteId)
    },

    updateSessionTimestamp: () => {
      saveSessionTimestamp()
    },

    // Recent notes actions
    addRecentNote: (noteId: string, noteTitle: string, projectId: string | null) => {
      const { recentNotes } = get()
      const existingIndex = recentNotes.findIndex(n => n.id === noteId)

      let updated: RecentNote[]
      if (existingIndex >= 0) {
        // Move to front
        updated = [...recentNotes]
        updated.splice(existingIndex, 1)
        updated.unshift({ id: noteId, title: noteTitle, projectId, openedAt: Date.now() })
      } else {
        // Add to front, keep max 10
        updated = [
          { id: noteId, title: noteTitle, projectId, openedAt: Date.now() },
          ...recentNotes
        ].slice(0, 10)
      }

      set({ recentNotes: updated })
      saveRecentNotes(updated)
    },

    clearRecentNotes: () => {
      set({ recentNotes: [] })
      saveRecentNotes([])
    }
  }
})

// Initialize session timestamp on first load
saveSessionTimestamp()
