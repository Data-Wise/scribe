import { create } from 'zustand'
import { Note } from '../types'
import { sanitizeHTML, sanitizeText } from '../utils/sanitize'

interface NotesState {
  notes: Note[]
  selectedNoteId: string | null
  isLoading: boolean
  error: string | null

  // Actions
  loadNotes: (folder?: string) => Promise<void>
  createNote: (note: Partial<Note>) => Promise<void>
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  selectNote: (id: string) => void
  searchNotes: (query: string) => Promise<void>
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  selectedNoteId: null,
  isLoading: false,
  error: null,

  loadNotes: async (folder?: string) => {
    set({ isLoading: true, error: null })
    try {
      const notes = await window.api.listNotes(folder)
      set({ notes, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  createNote: async (note: Partial<Note>) => {
    set({ isLoading: true, error: null })
    try {
      // Sanitize inputs before sending to backend
      const sanitizedNote = {
        ...note,
        title: note.title ? sanitizeText(note.title) : undefined,
        content: note.content ? sanitizeHTML(note.content) : undefined
      }

      const newNote = await window.api.createNote(sanitizedNote)
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
      // Sanitize inputs before sending to backend
      const sanitizedUpdates = {
        ...updates,
        title: updates.title ? sanitizeText(updates.title) : undefined,
        content: updates.content ? sanitizeHTML(updates.content) : undefined
      }

      const updatedNote = await window.api.updateNote(id, sanitizedUpdates)
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
      await window.api.deleteNote(id)
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
      const notes = await window.api.searchNotes(query)
      set({ notes, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  }
}))
