/**
 * History Store - Undo/Redo functionality for editor
 *
 * Phase 3 Task 10: Undo/Redo History
 *
 * Tracks content changes with undo/redo stack.
 * Keyboard shortcuts: ⌘Z (undo), ⌘⇧Z (redo)
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface HistoryEntry {
  content: string
  timestamp: number
  cursorPosition?: number
}

interface HistoryState {
  // History stack
  past: HistoryEntry[]
  present: HistoryEntry | null
  future: HistoryEntry[]

  // Configuration
  maxHistorySize: number

  // Actions
  push: (content: string, cursorPosition?: number) => void
  undo: () => string | null
  redo: () => string | null
  clear: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  // Getters
  getHistorySize: () => { past: number; future: number }
}

const MAX_HISTORY_SIZE = 100 // Keep last 100 changes

export const useHistoryStore = create<HistoryState>()(
  immer((set, get) => ({
    past: [],
    present: null,
    future: [],
    maxHistorySize: MAX_HISTORY_SIZE,

    /**
     * Push a new history entry
     * Called when content changes (debounced in editor)
     */
    push: (content: string, cursorPosition?: number) => {
      set((state) => {
        // If present exists, move it to past
        if (state.present) {
          state.past.push(state.present)

          // Limit history size
          if (state.past.length > state.maxHistorySize) {
            state.past.shift() // Remove oldest entry
          }
        }

        // Set new present
        state.present = {
          content,
          timestamp: Date.now(),
          cursorPosition
        }

        // Clear future (new change invalidates redo stack)
        state.future = []
      })
    },

    /**
     * Undo - move current to future, restore from past
     * Returns the content to restore, or null if nothing to undo
     */
    undo: () => {
      const state = get()

      if (state.past.length === 0) {
        return null // Nothing to undo
      }

      let restoredContent: string | null = null

      set((draft) => {
        // Move present to future
        if (draft.present) {
          draft.future.unshift(draft.present)
        }

        // Pop from past and make it present
        const previousEntry = draft.past.pop()!
        draft.present = previousEntry
        restoredContent = previousEntry.content
      })

      return restoredContent
    },

    /**
     * Redo - move current to past, restore from future
     * Returns the content to restore, or null if nothing to redo
     */
    redo: () => {
      const state = get()

      if (state.future.length === 0) {
        return null // Nothing to redo
      }

      let restoredContent: string | null = null

      set((draft) => {
        // Move present to past
        if (draft.present) {
          draft.past.push(draft.present)
        }

        // Pop from future and make it present
        const nextEntry = draft.future.shift()!
        draft.present = nextEntry
        restoredContent = nextEntry.content
      })

      return restoredContent
    },

    /**
     * Clear history (e.g., when switching notes)
     */
    clear: () => {
      set((state) => {
        state.past = []
        state.present = null
        state.future = []
      })
    },

    /**
     * Check if undo is available
     */
    canUndo: () => {
      return get().past.length > 0
    },

    /**
     * Check if redo is available
     */
    canRedo: () => {
      return get().future.length > 0
    },

    /**
     * Get history stack sizes (for debugging/UI)
     */
    getHistorySize: () => {
      const state = get()
      return {
        past: state.past.length,
        future: state.future.length
      }
    }
  }))
)
