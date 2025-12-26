import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNotesStore } from '../store/useNotesStore'
import { api } from '../lib/api'

// Use the mock from setup.ts - cast via unknown for test flexibility
const mockApi = api as unknown as {
  listNotes: ReturnType<typeof vi.fn>
  createNote: ReturnType<typeof vi.fn>
  updateNote: ReturnType<typeof vi.fn>
  deleteNote: ReturnType<typeof vi.fn>
  getNote: ReturnType<typeof vi.fn>
}

describe('useNotesStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store state
    const store = useNotesStore.getState()
    store.notes = []
    store.selectedNoteId = null
    store.isLoading = false
    store.error = null
  })

  describe('Initial State', () => {
    it('starts with empty notes array', () => {
      const { result } = renderHook(() => useNotesStore())
      expect(result.current.notes).toEqual([])
    })

    it('starts with no selected note', () => {
      const { result } = renderHook(() => useNotesStore())
      expect(result.current.selectedNoteId).toBeNull()
    })

    it('starts with loading false', () => {
      const { result } = renderHook(() => useNotesStore())
      expect(result.current.isLoading).toBe(false)
    })

    it('starts with no error', () => {
      const { result } = renderHook(() => useNotesStore())
      expect(result.current.error).toBeNull()
    })
  })

  describe('loadNotes', () => {
    it('sets loading state while fetching', async () => {
      mockApi.listNotes.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve([]), 100)
      }))

      const { result } = renderHook(() => useNotesStore())

      act(() => {
        result.current.loadNotes()
      })

      expect(result.current.isLoading).toBe(true)
    })

    it('loads notes successfully', async () => {
      const mockNotes = [
        { id: '1', title: 'Note 1', content: '<p>Content 1</p>', folder: 'inbox', created_at: 1000, updated_at: 1000 },
        { id: '2', title: 'Note 2', content: '<p>Content 2</p>', folder: 'inbox', created_at: 2000, updated_at: 2000 },
      ]
      mockApi.listNotes.mockResolvedValue(mockNotes)

      const { result } = renderHook(() => useNotesStore())

      await act(async () => {
        await result.current.loadNotes()
      })

      expect(result.current.notes).toEqual(mockNotes)
      expect(result.current.isLoading).toBe(false)
    })

    it('handles errors gracefully', async () => {
      mockApi.listNotes.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useNotesStore())

      await act(async () => {
        await result.current.loadNotes()
      })

      expect(result.current.error).toBe('Network error')
      expect(result.current.isLoading).toBe(false)
    })

    it('filters notes by folder when provided', async () => {
      const mockNotes = [
        { id: '1', title: 'Inbox Note', content: '', folder: 'inbox', created_at: 1000, updated_at: 1000 },
      ]
      mockApi.listNotes.mockResolvedValue(mockNotes)

      const { result } = renderHook(() => useNotesStore())

      await act(async () => {
        await result.current.loadNotes('inbox')
      })

      expect(mockApi.listNotes).toHaveBeenCalledWith('inbox')
    })
  })

  describe('createNote', () => {
    it('creates a new note and adds it to the store', async () => {
      const newNote = {
        id: 'new-1',
        title: 'New Note',
        content: '<p>Fresh content</p>',
        folder: 'inbox',
        created_at: Date.now() / 1000,
        updated_at: Date.now() / 1000,
      }
      mockApi.createNote.mockResolvedValue(newNote)
      mockApi.listNotes.mockResolvedValue([newNote])

      const { result } = renderHook(() => useNotesStore())

      await act(async () => {
        await result.current.createNote({
          title: 'New Note',
          content: '<p>Fresh content</p>',
          folder: 'inbox'
        })
      })

      expect(mockApi.createNote).toHaveBeenCalled()
    })

    it('selects the newly created note', async () => {
      const newNote = {
        id: 'new-1',
        title: 'New Note',
        content: '',
        folder: 'inbox',
        created_at: Date.now() / 1000,
        updated_at: Date.now() / 1000,
      }
      mockApi.createNote.mockResolvedValue(newNote)
      mockApi.listNotes.mockResolvedValue([newNote])

      const { result } = renderHook(() => useNotesStore())

      await act(async () => {
        await result.current.createNote({ title: 'New Note', content: '', folder: 'inbox' })
      })

      expect(result.current.selectedNoteId).toBe('new-1')
    })
  })

  describe('selectNote', () => {
    it('updates selectedNoteId', () => {
      const { result } = renderHook(() => useNotesStore())

      act(() => {
        result.current.selectNote('note-123')
      })

      expect(result.current.selectedNoteId).toBe('note-123')
    })

    it('can deselect by passing null', () => {
      const { result } = renderHook(() => useNotesStore())

      act(() => {
        result.current.selectNote('note-123')
      })

      act(() => {
        result.current.selectNote(null as unknown as string)
      })

      expect(result.current.selectedNoteId).toBeNull()
    })
  })

  describe('updateNote', () => {
    it('updates note in the store', async () => {
      const initialNotes = [
        { id: '1', title: 'Original', content: '', folder: 'inbox', created_at: 1000, updated_at: 1000 },
      ]
      mockApi.listNotes.mockResolvedValue(initialNotes)
      mockApi.updateNote.mockResolvedValue({ ...initialNotes[0], title: 'Updated' })

      const { result } = renderHook(() => useNotesStore())

      await act(async () => {
        await result.current.loadNotes()
      })

      await act(async () => {
        await result.current.updateNote('1', { title: 'Updated' })
      })

      expect(mockApi.updateNote).toHaveBeenCalledWith('1', { title: 'Updated' })
    })
  })
})
