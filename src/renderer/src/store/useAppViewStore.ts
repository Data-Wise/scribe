import { create } from 'zustand'

/**
 * App View Store - Manages dashboard vs editor view mode
 *
 * Smart startup behavior:
 * - > 4 hours since last use → show dashboard
 * - < 4 hours with last note → resume editor
 * - Fresh start → show dashboard
 */

type ViewMode = 'dashboard' | 'editor'

interface AppViewState {
  viewMode: ViewMode
  lastActiveNoteId: string | null

  // Actions
  setViewMode: (mode: ViewMode) => void
  toggleViewMode: () => void
  setLastActiveNote: (noteId: string | null) => void
  updateSessionTimestamp: () => void
}

// localStorage keys
const SESSION_KEY = 'scribe:lastSessionTimestamp'
const LAST_NOTE_KEY = 'scribe:lastActiveNoteId'
const VIEW_MODE_KEY = 'scribe:viewMode'

// 4 hours in milliseconds
const SESSION_TIMEOUT_MS = 4 * 60 * 60 * 1000

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

const saveViewMode = (mode: ViewMode): void => {
  try {
    localStorage.setItem(VIEW_MODE_KEY, mode)
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Determine initial view mode based on session context
 * - Fresh start or > 4 hours → dashboard (get bearings)
 * - < 4 hours with last note → editor (resume work)
 */
const determineInitialViewMode = (): ViewMode => {
  const lastTimestamp = getLastSessionTimestamp()
  const lastNoteId = getLastActiveNoteId()
  const now = Date.now()

  // Fresh start - no previous session
  if (!lastTimestamp) {
    return 'dashboard'
  }

  const timeSinceLastSession = now - lastTimestamp

  // Long break (> 4 hours) - show dashboard to get bearings
  if (timeSinceLastSession > SESSION_TIMEOUT_MS) {
    return 'dashboard'
  }

  // Recent session with active note - resume editor
  if (lastNoteId) {
    return 'editor'
  }

  // Recent session but no active note - dashboard
  return 'dashboard'
}

export const useAppViewStore = create<AppViewState>((set, get) => ({
  viewMode: determineInitialViewMode(),
  lastActiveNoteId: getLastActiveNoteId(),

  setViewMode: (mode: ViewMode) => {
    set({ viewMode: mode })
    saveViewMode(mode)
  },

  toggleViewMode: () => {
    const current = get().viewMode
    const next: ViewMode = current === 'dashboard' ? 'editor' : 'dashboard'
    set({ viewMode: next })
    saveViewMode(next)
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
