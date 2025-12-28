import { create } from 'zustand'

/**
 * Tab Store - Manages editor tabs with pinned Home tab
 *
 * Tab types:
 * - home: Pinned Mission Control tab (always first, cannot close)
 * - editor: Note editor tabs (closable, reorderable)
 */

export type TabType = 'home' | 'editor'

export interface Tab {
  id: string
  type: TabType
  noteId?: string      // For editor tabs
  title: string
  isPinned: boolean
  isDirty: boolean     // Unsaved changes indicator
}

interface TabState {
  tabs: Tab[]
  activeTabId: string
  closedTabs: Tab[]    // For ⌘⇧T reopen (last 10)

  // Actions
  openTab: (noteId: string, title: string) => void
  closeTab: (tabId: string) => void
  closeOtherTabs: (tabId: string) => void
  closeAllEditorTabs: () => void
  setActiveTab: (tabId: string) => void
  updateTabTitle: (tabId: string, title: string) => void
  setTabDirty: (tabId: string, isDirty: boolean) => void
  reorderTabs: (fromIndex: number, toIndex: number) => void
  reopenLastClosed: () => void
  goToHomeTab: () => void
}

// localStorage keys
const TABS_KEY = 'scribe:tabs'
const ACTIVE_TAB_KEY = 'scribe:activeTab'

// Home tab constant
const HOME_TAB: Tab = {
  id: 'home',
  type: 'home',
  title: 'Home',
  isPinned: true,
  isDirty: false,
}

// Load saved tabs from localStorage
const loadSavedTabs = (): Tab[] => {
  try {
    const saved = localStorage.getItem(TABS_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as Tab[]
      // Ensure home tab is always first
      const withoutHome = parsed.filter(t => t.type !== 'home')
      return [HOME_TAB, ...withoutHome]
    }
  } catch {
    // Ignore errors
  }
  return [HOME_TAB]
}

// Load active tab from localStorage
const loadActiveTab = (): string => {
  try {
    const saved = localStorage.getItem(ACTIVE_TAB_KEY)
    if (saved) return saved
  } catch {
    // Ignore errors
  }
  return 'home'
}

// Save tabs to localStorage
const saveTabs = (tabs: Tab[]): void => {
  try {
    localStorage.setItem(TABS_KEY, JSON.stringify(tabs))
  } catch {
    // Ignore errors
  }
}

// Save active tab to localStorage
const saveActiveTab = (tabId: string): void => {
  try {
    localStorage.setItem(ACTIVE_TAB_KEY, tabId)
  } catch {
    // Ignore errors
  }
}

export const useTabStore = create<TabState>((set, get) => ({
  tabs: loadSavedTabs(),
  activeTabId: loadActiveTab(),
  closedTabs: [],

  openTab: (noteId: string, title: string) => {
    const { tabs } = get()

    // Check if tab for this note already exists
    const existingTab = tabs.find(t => t.type === 'editor' && t.noteId === noteId)

    if (existingTab) {
      // Switch to existing tab
      set({ activeTabId: existingTab.id })
      saveActiveTab(existingTab.id)
      return
    }

    // Create new tab
    const newTab: Tab = {
      id: `editor-${noteId}`,
      type: 'editor',
      noteId,
      title,
      isPinned: false,
      isDirty: false,
    }

    const newTabs = [...tabs, newTab]
    set({
      tabs: newTabs,
      activeTabId: newTab.id,
    })
    saveTabs(newTabs)
    saveActiveTab(newTab.id)
  },

  closeTab: (tabId: string) => {
    const { tabs, activeTabId, closedTabs } = get()

    // Cannot close home tab
    const tab = tabs.find(t => t.id === tabId)
    if (!tab || tab.isPinned) return

    // Find index of closing tab
    const closingIndex = tabs.findIndex(t => t.id === tabId)

    // Remove tab
    const newTabs = tabs.filter(t => t.id !== tabId)

    // Add to closed tabs (keep last 10)
    const newClosedTabs = [tab, ...closedTabs].slice(0, 10)

    // Determine new active tab
    let newActiveTabId = activeTabId
    if (activeTabId === tabId) {
      // Go to previous tab, or home if none
      if (closingIndex > 1) {
        newActiveTabId = newTabs[closingIndex - 1].id
      } else {
        newActiveTabId = 'home'
      }
    }

    set({
      tabs: newTabs,
      activeTabId: newActiveTabId,
      closedTabs: newClosedTabs,
    })
    saveTabs(newTabs)
    saveActiveTab(newActiveTabId)
  },

  closeOtherTabs: (tabId: string) => {
    const { tabs, closedTabs } = get()

    // Keep home tab and the specified tab
    const closingTabs = tabs.filter(t => t.id !== tabId && !t.isPinned)
    const newTabs = tabs.filter(t => t.id === tabId || t.isPinned)

    // Add closed tabs to history
    const newClosedTabs = [...closingTabs, ...closedTabs].slice(0, 10)

    set({
      tabs: newTabs,
      activeTabId: tabId,
      closedTabs: newClosedTabs,
    })
    saveTabs(newTabs)
    saveActiveTab(tabId)
  },

  closeAllEditorTabs: () => {
    const { tabs, closedTabs } = get()

    // Keep only home tab
    const closingTabs = tabs.filter(t => !t.isPinned)
    const newTabs = [HOME_TAB]

    // Add closed tabs to history
    const newClosedTabs = [...closingTabs, ...closedTabs].slice(0, 10)

    set({
      tabs: newTabs,
      activeTabId: 'home',
      closedTabs: newClosedTabs,
    })
    saveTabs(newTabs)
    saveActiveTab('home')
  },

  setActiveTab: (tabId: string) => {
    const { tabs } = get()
    const tab = tabs.find(t => t.id === tabId)
    if (tab) {
      set({ activeTabId: tabId })
      saveActiveTab(tabId)
    }
  },

  updateTabTitle: (tabId: string, title: string) => {
    const { tabs } = get()
    const newTabs = tabs.map(t =>
      t.id === tabId ? { ...t, title } : t
    )
    set({ tabs: newTabs })
    saveTabs(newTabs)
  },

  setTabDirty: (tabId: string, isDirty: boolean) => {
    const { tabs } = get()
    const newTabs = tabs.map(t =>
      t.id === tabId ? { ...t, isDirty } : t
    )
    set({ tabs: newTabs })
    // Don't persist dirty state
  },

  reorderTabs: (fromIndex: number, toIndex: number) => {
    const { tabs } = get()

    // Cannot reorder home tab (index 0)
    if (fromIndex === 0 || toIndex === 0) return

    const newTabs = [...tabs]
    const [removed] = newTabs.splice(fromIndex, 1)
    newTabs.splice(toIndex, 0, removed)

    set({ tabs: newTabs })
    saveTabs(newTabs)
  },

  reopenLastClosed: () => {
    const { closedTabs } = get()

    if (closedTabs.length === 0) return

    const [tabToReopen, ...remainingClosed] = closedTabs

    if (tabToReopen.noteId) {
      // Reopen the tab
      get().openTab(tabToReopen.noteId, tabToReopen.title)
    }

    set({ closedTabs: remainingClosed })
  },

  goToHomeTab: () => {
    set({ activeTabId: 'home' })
    saveActiveTab('home')
  },
}))

// Helper to get current active tab
export const getActiveTab = (): Tab | undefined => {
  const state = useTabStore.getState()
  return state.tabs.find(t => t.id === state.activeTabId)
}

// Helper to check if a note has an open tab
export const hasOpenTab = (noteId: string): boolean => {
  const state = useTabStore.getState()
  return state.tabs.some(t => t.type === 'editor' && t.noteId === noteId)
}
