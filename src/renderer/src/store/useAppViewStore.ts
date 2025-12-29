import { create } from 'zustand'

/**
 * App View Store - Manages sidebar state and session tracking
 *
 * Sidebar modes:
 * - icon: 48px, project dots only
 * - compact: 240px, project list with stats
 * - card: 320px+, full project cards
 */

export type SidebarMode = 'icon' | 'compact' | 'card'
export type LeftSidebarTab = 'projects' | 'notes' | 'inbox' | 'graph' | 'trash'
export type NotesViewMode = 'list' | 'tree'

interface AppViewState {
  // Sidebar state
  sidebarMode: SidebarMode
  sidebarWidth: number
  leftSidebarTab: LeftSidebarTab

  // Notes tab state (Vault Tree View)
  notesViewMode: NotesViewMode
  expandedProjects: Set<string>

  // Session tracking
  lastActiveNoteId: string | null

  // Sidebar actions
  setSidebarMode: (mode: SidebarMode) => void
  cycleSidebarMode: () => void
  setSidebarWidth: (width: number) => void
  setLeftSidebarTab: (tab: LeftSidebarTab) => void

  // Notes view actions
  setNotesViewMode: (mode: NotesViewMode) => void
  toggleProjectExpanded: (projectId: string) => void
  expandAllProjects: (projectIds: string[]) => void
  collapseAllProjects: () => void

  // Session actions
  setLastActiveNote: (noteId: string | null) => void
  updateSessionTimestamp: () => void
}

// localStorage keys (use scribe-dev: prefix to avoid conflicts with main branch)
const SESSION_KEY = 'scribe-dev:lastSessionTimestamp'
const LAST_NOTE_KEY = 'scribe-dev:lastActiveNoteId'
const SIDEBAR_MODE_KEY = 'scribe-dev:sidebarMode'
const SIDEBAR_WIDTH_KEY = 'scribe-dev:sidebarWidth'
const LEFT_SIDEBAR_TAB_KEY = 'scribe-dev:leftSidebarTab'
const NOTES_VIEW_MODE_KEY = 'scribe-dev:notesViewMode'
const EXPANDED_PROJECTS_KEY = 'scribe-dev:expandedProjects'

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

const getSavedLeftSidebarTab = (): LeftSidebarTab => {
  try {
    const saved = localStorage.getItem(LEFT_SIDEBAR_TAB_KEY)
    if (saved === 'projects' || saved === 'notes' || saved === 'inbox' || saved === 'graph' || saved === 'trash') {
      return saved
    }
    return 'projects' // default
  } catch {
    return 'projects'
  }
}

const saveLeftSidebarTab = (tab: LeftSidebarTab): void => {
  try {
    localStorage.setItem(LEFT_SIDEBAR_TAB_KEY, tab)
  } catch {
    // Ignore localStorage errors
  }
}

const getSavedNotesViewMode = (): NotesViewMode => {
  try {
    const saved = localStorage.getItem(NOTES_VIEW_MODE_KEY)
    if (saved === 'list' || saved === 'tree') {
      return saved
    }
    return 'list' // default to list (current behavior)
  } catch {
    return 'list'
  }
}

const saveNotesViewMode = (mode: NotesViewMode): void => {
  try {
    localStorage.setItem(NOTES_VIEW_MODE_KEY, mode)
  } catch {
    // Ignore localStorage errors
  }
}

const getSavedExpandedProjects = (): Set<string> => {
  try {
    const saved = localStorage.getItem(EXPANDED_PROJECTS_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        return new Set(parsed)
      }
    }
    return new Set()
  } catch {
    return new Set()
  }
}

const saveExpandedProjects = (expanded: Set<string>): void => {
  try {
    localStorage.setItem(EXPANDED_PROJECTS_KEY, JSON.stringify([...expanded]))
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
  leftSidebarTab: getSavedLeftSidebarTab(),
  notesViewMode: getSavedNotesViewMode(),
  expandedProjects: getSavedExpandedProjects(),
  lastActiveNoteId: getLastActiveNoteId(),

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

  setLeftSidebarTab: (tab: LeftSidebarTab) => {
    set({ leftSidebarTab: tab })
    saveLeftSidebarTab(tab)
  },

  setNotesViewMode: (mode: NotesViewMode) => {
    set({ notesViewMode: mode })
    saveNotesViewMode(mode)
  },

  toggleProjectExpanded: (projectId: string) => {
    const current = get().expandedProjects
    const next = new Set(current)
    if (next.has(projectId)) {
      next.delete(projectId)
    } else {
      next.add(projectId)
    }
    set({ expandedProjects: next })
    saveExpandedProjects(next)
  },

  expandAllProjects: (projectIds: string[]) => {
    const next = new Set(projectIds)
    set({ expandedProjects: next })
    saveExpandedProjects(next)
  },

  collapseAllProjects: () => {
    const next = new Set<string>()
    set({ expandedProjects: next })
    saveExpandedProjects(next)
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
