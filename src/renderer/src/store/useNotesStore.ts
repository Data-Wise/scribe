import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Note } from '../types'
import { api } from '../lib/api'

interface NotesState {
  notes: Note[]
  selectedNoteId: string | null
  isLoading: boolean
  error: string | null

  // Actions
  loadNotes: (folder?: string) => Promise<void>
  createNote: (note: Partial<Note>) => Promise<Note | undefined>
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  selectNote: (id: string) => void
  searchNotes: (query: string) => Promise<void>
}

export const useNotesStore = create<NotesState>()(
  immer((set) => ({
  notes: [],
  selectedNoteId: null,
  isLoading: false,
  error: null,

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
    set({ isLoading: true, error: null })
    try {
      // For markdown content, skip HTML sanitization
      // react-markdown handles escaping during render
      const newNote = await api.createNote(note)
      set((state) => {
        // Immer allows direct mutations
        state.notes.unshift(newNote)
        state.selectedNoteId = newNote.id
        state.isLoading = false
      })
      return newNote
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      return undefined
    }
  },

  updateNote: async (id: string, updates: Partial<Note>) => {
    set({ isLoading: true, error: null })
    try {
      // For markdown content, skip HTML sanitization
      // react-markdown handles escaping during render
      const updatedNote = await api.updateNote(id, updates)
      if (updatedNote) {
        set((state) => {
          // Immer allows direct mutations
          const index = state.notes.findIndex((note) => note.id === id)
          if (index !== -1) {
            state.notes[index] = updatedNote
          }
          state.isLoading = false
        })
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  deleteNote: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await api.deleteNote(id)
      set((state) => {
        // Immer allows direct mutations
        const index = state.notes.findIndex((note) => note.id === id)
        if (index !== -1) {
          state.notes.splice(index, 1)
        }
        if (state.selectedNoteId === id) {
          state.selectedNoteId = null
        }
        state.isLoading = false
      })
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
  }
  }))
)

