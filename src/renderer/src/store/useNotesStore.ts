import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Note } from '../types'
import { api } from '../lib/api'
import { logger } from '../lib/logger'

interface NotesState {
  notes: Note[]
  selectedNoteId: string | null
  isLoading: boolean
  error: string | null

  // Optimistic update state
  pendingOperations: Map<string, 'create' | 'update' | 'delete'>
  snapshotNotes: Note[] | null

  // Actions
  loadNotes: (folder?: string) => Promise<void>
  createNote: (note: Partial<Note>) => Promise<Note | undefined>
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  selectNote: (id: string) => void
  searchNotes: (query: string) => Promise<void>

  // Internal helpers
  _snapshot: () => void
  _rollback: () => void
  _trackOperation: (id: string, operation: 'create' | 'update' | 'delete') => void
  _clearOperation: (id: string) => void
}

export const useNotesStore = create<NotesState>()(
  immer((set, get) => ({
  notes: [],
  selectedNoteId: null,
  isLoading: false,
  error: null,
  pendingOperations: new Map(),
  snapshotNotes: null,

  loadNotes: async (folder?: string) => {
    set({ isLoading: true, error: null })
    try {
      const notes = await api.listNotes(folder)
      set({ notes, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  createNote: async (note: Partial<Note>): Promise<Note | undefined> => {
    // Create temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`
    const now = Date.now()
    const optimisticNote: Note = {
      id: tempId,
      title: note.title || 'Untitled',
      content: note.content || '',
      folder: note.folder || '',
      project_id: note.project_id || null,
      created_at: now,
      updated_at: now,
      deleted_at: null,
      properties: note.properties || {}
    }

    // Snapshot state before optimistic update
    get()._snapshot()

    // Optimistic update: Add note to UI immediately
    set((state) => {
      state.notes.unshift(optimisticNote)
      state.selectedNoteId = tempId
      state.error = null
    })
    get()._trackOperation(tempId, 'create')

    try {
      // Background API call
      const newNote = await api.createNote(note)

      // Success: Replace temp note with real note
      set((state) => {
        const index = state.notes.findIndex((n) => n.id === tempId)
        if (index !== -1) {
          state.notes[index] = newNote
        }
        if (state.selectedNoteId === tempId) {
          state.selectedNoteId = newNote.id
        }
        state.snapshotNotes = null
      })
      get()._clearOperation(tempId)
      logger.info('[NotesStore] Optimistic create confirmed', { id: newNote.id })
      return newNote
    } catch (error) {
      // Failure: Rollback to previous state
      logger.error('[NotesStore] Create failed, rolling back', error)
      get()._rollback()
      set({ error: (error as Error).message })
      get()._clearOperation(tempId)
      return undefined
    }
  },

  updateNote: async (id: string, updates: Partial<Note>) => {
    // Find existing note
    const existingNote = get().notes.find((n) => n.id === id)
    if (!existingNote) {
      logger.warn('[NotesStore] Cannot update: note not found', { id })
      return
    }

    // Snapshot state before optimistic update
    get()._snapshot()

    // Optimistic update: Update note immediately
    set((state) => {
      const index = state.notes.findIndex((n) => n.id === id)
      if (index !== -1) {
        state.notes[index] = {
          ...state.notes[index],
          ...updates,
          updated_at: Date.now()
        }
      }
      state.error = null
    })
    get()._trackOperation(id, 'update')

    try {
      // Background API call
      const updatedNote = await api.updateNote(id, updates)

      if (updatedNote) {
        // Success: Replace optimistic update with server response
        set((state) => {
          const index = state.notes.findIndex((n) => n.id === id)
          if (index !== -1) {
            state.notes[index] = updatedNote
          }
          state.snapshotNotes = null
        })
        get()._clearOperation(id)
        logger.info('[NotesStore] Optimistic update confirmed', { id })
      }
    } catch (error) {
      // Failure: Rollback to previous state
      logger.error('[NotesStore] Update failed, rolling back', error)
      get()._rollback()
      set({ error: (error as Error).message })
      get()._clearOperation(id)
    }
  },

  deleteNote: async (id: string) => {
    // Snapshot state before optimistic update
    get()._snapshot()

    // Optimistic update: Remove note immediately
    set((state) => {
      const index = state.notes.findIndex((n) => n.id === id)
      if (index !== -1) {
        state.notes.splice(index, 1)
      }
      if (state.selectedNoteId === id) {
        state.selectedNoteId = null
      }
      state.error = null
    })
    get()._trackOperation(id, 'delete')

    try {
      // Background API call
      await api.deleteNote(id)

      // Success: Clear snapshot
      set({ snapshotNotes: null })
      get()._clearOperation(id)
      logger.info('[NotesStore] Optimistic delete confirmed', { id })
    } catch (error) {
      // Failure: Rollback to previous state
      logger.error('[NotesStore] Delete failed, rolling back', error)
      get()._rollback()
      set({ error: (error as Error).message })
      get()._clearOperation(id)
    }
  },

  selectNote: (id: string) => {
    set({ selectedNoteId: id })
  },

  searchNotes: async (query: string) => {
    set({ isLoading: true, error: null })
    try {
      const notes = await api.searchNotes(query)
      set({ notes, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  // Internal helper methods for optimistic updates

  _snapshot: () => {
    const currentNotes = get().notes
    set({ snapshotNotes: JSON.parse(JSON.stringify(currentNotes)) })
    logger.debug('[NotesStore] State snapshot created', { count: currentNotes.length })
  },

  _rollback: () => {
    const snapshot = get().snapshotNotes
    if (snapshot) {
      set({
        notes: snapshot,
        snapshotNotes: null
      })
      logger.debug('[NotesStore] State rolled back', { count: snapshot.length })
    } else {
      logger.warn('[NotesStore] Rollback called but no snapshot exists')
    }
  },

  _trackOperation: (id: string, operation: 'create' | 'update' | 'delete') => {
    set((state) => {
      state.pendingOperations.set(id, operation)
    })
    logger.debug('[NotesStore] Operation tracked', { id, operation })
  },

  _clearOperation: (id: string) => {
    set((state) => {
      state.pendingOperations.delete(id)
    })
    logger.debug('[NotesStore] Operation cleared', { id })
  }
  }))
)

