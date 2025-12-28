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
      const updatedNote = await api.updateNote(id, { deleted_at: Date.now() })
      if (updatedNote) {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? updatedNote : note
          ),
          selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId
        }))
      }
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  restoreNote: async (id: string) => {
    try {
      // Restore by clearing deleted_at
      const updatedNote = await api.updateNote(id, { deleted_at: null })
      if (updatedNote) {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...updatedNote, deleted_at: undefined } : note
          )
        }))
      }
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  permanentlyDeleteNote: async (id: string) => {
    try {
      await api.deleteNote(id)
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
        selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId
      }))
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  emptyTrash: async () => {
    const { notes } = get()
    const trashedNotes = notes.filter(n => n.deleted_at)
    try {
      // Delete all trashed notes
      await Promise.all(trashedNotes.map(note => api.deleteNote(note.id)))
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

