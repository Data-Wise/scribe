import { create } from 'zustand'
import { Note } from '../types'
import { api } from '../lib/api'
import { useToastStore } from './useToastStore'

interface NotesState {
  notes: Note[]
  selectedNoteId: string | null
  isLoading: boolean
  error: string | null

  // Delete confirmation state (ADHD: Escape hatches - prevent accidental data loss)
  pendingDeleteNoteId: string | null
  showDeleteConfirmation: boolean

  // Actions
  loadNotes: (folder?: string) => Promise<void>
  createNote: (note: Partial<Note>) => Promise<void>
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  selectNote: (id: string) => void
  searchNotes: (query: string) => Promise<void>

  // Trash actions (soft delete pattern)
  softDeleteNote: (id: string) => Promise<void>
  restoreNote: (id: string) => Promise<void>
  permanentlyDeleteNote: (id: string) => Promise<void>
  emptyTrash: () => Promise<void>
  cleanupOldTrash: (maxAgeDays?: number) => Promise<number>

  // Delete confirmation actions
  requestDeleteNote: (id: string) => void
  confirmDeleteNote: () => void
  cancelDeleteNote: () => void
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  selectedNoteId: null,
  isLoading: false,
  error: null,

  // Delete confirmation state
  pendingDeleteNoteId: null,
  showDeleteConfirmation: false,

  loadNotes: async (folder?: string) => {
    set({ isLoading: true, error: null })
    try {
      const notes = await api.listNotes(folder)
      set({ notes, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  createNote: async (note: Partial<Note>) => {
    set({ isLoading: true, error: null })
    try {
      // For markdown content, skip HTML sanitization
      // react-markdown handles escaping during render
      const newNote = await api.createNote(note)
      set((state) => ({
        notes: [newNote, ...state.notes],
        selectedNoteId: newNote.id,
        isLoading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateNote: async (id: string, updates: Partial<Note>) => {
    set({ isLoading: true, error: null })
    try {
      // For markdown content, skip HTML sanitization
      // react-markdown handles escaping during render
      const updatedNote = await api.updateNote(id, updates)
      if (updatedNote) {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? updatedNote : note
          ),
          isLoading: false
        }))
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  deleteNote: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await api.deleteNote(id)
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
        selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
        isLoading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
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

  // Trash actions (soft delete pattern)
  softDeleteNote: async (id: string) => {
    try {
      console.log('[softDeleteNote] Deleting note:', id)
      // Use the dedicated delete_note command which sets deleted_at
      const success = await api.deleteNote(id)
      console.log('[softDeleteNote] API response:', success)
      if (success) {
        // Update local state - mark as deleted
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, deleted_at: Math.floor(Date.now() / 1000) } : note
          ),
          selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId
        }))
      }
    } catch (error) {
      console.error('[softDeleteNote] Error:', error)
      set({ error: (error as Error).message })
    }
  },

  restoreNote: async (id: string) => {
    try {
      console.log('[restoreNote] Restoring note:', id)
      // Use dedicated restore_note command
      const restoredNote = await api.restoreNote(id)
      console.log('[restoreNote] API response:', restoredNote)
      if (restoredNote) {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? restoredNote : note
          )
        }))
      }
    } catch (error) {
      console.error('[restoreNote] Error:', error)
      set({ error: (error as Error).message })
    }
  },

  permanentlyDeleteNote: async (id: string) => {
    try {
      console.log('[permanentlyDeleteNote] Permanently deleting:', id)
      await api.permanentDeleteNote(id)
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
        selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId
      }))
    } catch (error) {
      console.error('[permanentlyDeleteNote] Error:', error)
      set({ error: (error as Error).message })
    }
  },

  emptyTrash: async () => {
    const { notes } = get()
    const trashedNotes = notes.filter(n => n.deleted_at)
    try {
      console.log('[emptyTrash] Deleting', trashedNotes.length, 'notes')
      // Permanently delete all trashed notes
      await Promise.all(trashedNotes.map(note => api.permanentDeleteNote(note.id)))
      // Remove from local state
      set((state) => ({
        notes: state.notes.filter(n => !n.deleted_at),
        selectedNoteId: trashedNotes.some(n => n.id === state.selectedNoteId)
          ? null
          : state.selectedNoteId
      }))
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  cleanupOldTrash: async (maxAgeDays = 30) => {
    const { notes } = get()
    const now = Date.now()
    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000

    // Find notes in trash older than maxAgeDays
    const oldTrashedNotes = notes.filter(n => {
      if (!n.deleted_at) return false
      const age = now - n.deleted_at
      return age > maxAgeMs
    })

    if (oldTrashedNotes.length === 0) return 0

    try {
      // Permanently delete old trashed notes
      await Promise.all(oldTrashedNotes.map(note => api.deleteNote(note.id)))

      // Remove from local state
      const deletedIds = new Set(oldTrashedNotes.map(n => n.id))
      set((state) => ({
        notes: state.notes.filter(n => !deletedIds.has(n.id)),
        selectedNoteId: deletedIds.has(state.selectedNoteId || '')
          ? null
          : state.selectedNoteId
      }))

      // Show info toast about cleanup
      useToastStore.getState().addToast({
        message: `Cleaned up ${oldTrashedNotes.length} old ${oldTrashedNotes.length === 1 ? 'note' : 'notes'} from trash`,
        type: 'info',
        duration: 4000
      })

      return oldTrashedNotes.length
    } catch (error) {
      set({ error: (error as Error).message })
      return 0
    }
  },

  // Delete confirmation actions (ADHD: Escape hatches)
  requestDeleteNote: (id: string) => {
    set({ pendingDeleteNoteId: id, showDeleteConfirmation: true })
  },

  confirmDeleteNote: () => {
    const { pendingDeleteNoteId, softDeleteNote, restoreNote, notes } = get()
    if (!pendingDeleteNoteId) return

    // Get note title for toast message
    const note = notes.find(n => n.id === pendingDeleteNoteId)
    const noteTitle = note?.title || 'Untitled'
    const noteId = pendingDeleteNoteId

    // Soft delete moves to trash
    softDeleteNote(noteId)
    set({ pendingDeleteNoteId: null, showDeleteConfirmation: false })

    // Show undo toast (ADHD: Escape hatches - allow quick recovery)
    useToastStore.getState().addToast({
      message: `"${noteTitle}" moved to trash`,
      type: 'undo',
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => restoreNote(noteId)
      }
    })
  },

  cancelDeleteNote: () => {
    set({ pendingDeleteNoteId: null, showDeleteConfirmation: false })
  }
}))

