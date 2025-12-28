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

  describe('Trash Actions (Sprint 26)', () => {
    describe('softDeleteNote', () => {
      it('sets deleted_at timestamp on note', async () => {
        const initialNotes = [
          { id: '1', title: 'To Delete', content: '', folder: 'notes', created_at: 1000, updated_at: 1000, deleted_at: null },
        ]
        const deletedNote = { ...initialNotes[0], deleted_at: Date.now() }

        mockApi.updateNote.mockResolvedValue(deletedNote)

        // Set initial state
        useNotesStore.setState({ notes: initialNotes })

        const { result } = renderHook(() => useNotesStore())

        await act(async () => {
          await result.current.softDeleteNote('1')
        })

        expect(mockApi.updateNote).toHaveBeenCalledWith('1', expect.objectContaining({
          deleted_at: expect.any(Number)
        }))
      })
    })

    describe('restoreNote', () => {
      it('clears deleted_at timestamp on note', async () => {
        const initialNotes = [
          { id: '1', title: 'Deleted Note', content: '', folder: 'notes', created_at: 1000, updated_at: 1000, deleted_at: Date.now() },
        ]
        const restoredNote = { ...initialNotes[0], deleted_at: null }

        mockApi.updateNote.mockResolvedValue(restoredNote)

        // Set initial state with deleted note
        useNotesStore.setState({ notes: initialNotes })

        const { result } = renderHook(() => useNotesStore())

        await act(async () => {
          await result.current.restoreNote('1')
        })

        expect(mockApi.updateNote).toHaveBeenCalledWith('1', { deleted_at: null })
      })
    })

    describe('permanentlyDeleteNote', () => {
      it('removes note from store permanently', async () => {
        const initialNotes = [
          { id: '1', title: 'To Delete', content: '', folder: 'notes', created_at: 1000, updated_at: 1000, deleted_at: Date.now() },
          { id: '2', title: 'Keep', content: '', folder: 'notes', created_at: 1000, updated_at: 1000, deleted_at: null },
        ]

        mockApi.deleteNote.mockResolvedValue(undefined)

        // Set initial state
        useNotesStore.setState({ notes: initialNotes })

        const { result } = renderHook(() => useNotesStore())

        await act(async () => {
          await result.current.permanentlyDeleteNote('1')
        })

        expect(mockApi.deleteNote).toHaveBeenCalledWith('1')
        expect(result.current.notes).toHaveLength(1)
        expect(result.current.notes[0].id).toBe('2')
      })

      it('clears selection if deleted note was selected', async () => {
        const initialNotes = [
          { id: '1', title: 'Selected & Deleted', content: '', folder: 'notes', created_at: 1000, updated_at: 1000, deleted_at: Date.now() },
        ]

        mockApi.deleteNote.mockResolvedValue(undefined)

        // Set initial state with selected note
        useNotesStore.setState({ notes: initialNotes, selectedNoteId: '1' })

        const { result } = renderHook(() => useNotesStore())

        await act(async () => {
          await result.current.permanentlyDeleteNote('1')
        })

        expect(result.current.selectedNoteId).toBeNull()
      })
    })

    describe('emptyTrash', () => {
      it('deletes all trashed notes', async () => {
        const initialNotes = [
          { id: '1', title: 'Trashed 1', content: '', folder: 'notes', created_at: 1000, updated_at: 1000, deleted_at: Date.now() },
          { id: '2', title: 'Active', content: '', folder: 'notes', created_at: 1000, updated_at: 1000, deleted_at: null },
          { id: '3', title: 'Trashed 2', content: '', folder: 'notes', created_at: 1000, updated_at: 1000, deleted_at: Date.now() },
        ]

        mockApi.deleteNote.mockResolvedValue(undefined)

        // Set initial state
        useNotesStore.setState({ notes: initialNotes })

        const { result } = renderHook(() => useNotesStore())

        await act(async () => {
          await result.current.emptyTrash()
        })

        // Should have called deleteNote for each trashed note
        expect(mockApi.deleteNote).toHaveBeenCalledTimes(2)
        expect(mockApi.deleteNote).toHaveBeenCalledWith('1')
        expect(mockApi.deleteNote).toHaveBeenCalledWith('3')

        // Only active note should remain
        expect(result.current.notes).toHaveLength(1)
        expect(result.current.notes[0].id).toBe('2')
      })

      it('does nothing when trash is empty', async () => {
        const initialNotes = [
          { id: '1', title: 'Active 1', content: '', folder: 'notes', created_at: 1000, updated_at: 1000, deleted_at: null },
          { id: '2', title: 'Active 2', content: '', folder: 'notes', created_at: 1000, updated_at: 1000, deleted_at: null },
        ]

        // Set initial state with no trashed notes
        useNotesStore.setState({ notes: initialNotes })

        const { result } = renderHook(() => useNotesStore())

        await act(async () => {
          await result.current.emptyTrash()
        })

        expect(mockApi.deleteNote).not.toHaveBeenCalled()
        expect(result.current.notes).toHaveLength(2)
      })
    })

    describe('cleanupOldTrash', () => {
      it('deletes notes older than specified days', async () => {
        const now = Date.now()
        const thirtyOneDaysAgo = now - (31 * 24 * 60 * 60 * 1000)
        const twentyNineDaysAgo = now - (29 * 24 * 60 * 60 * 1000)

        const initialNotes = [
          { id: '1', title: 'Old Trash', content: '', folder: 'notes', created_at: 1000, updated_at: 1000, deleted_at: thirtyOneDaysAgo },
          { id: '2', title: 'Recent Trash', content: '', folder: 'notes', created_at: 1000, updated_at: 1000, deleted_at: twentyNineDaysAgo },
          { id: '3', title: 'Active', content: '', folder: 'notes', created_at: 1000, updated_at: 1000, deleted_at: null },
        ]

        mockApi.deleteNote.mockResolvedValue(undefined)

        // Set initial state
        useNotesStore.setState({ notes: initialNotes })

        const { result } = renderHook(() => useNotesStore())

        let deletedCount: number = 0
        await act(async () => {
          deletedCount = await result.current.cleanupOldTrash(30)
        })

        // Should only delete the 31-day-old note
        expect(mockApi.deleteNote).toHaveBeenCalledTimes(1)
        expect(mockApi.deleteNote).toHaveBeenCalledWith('1')
        expect(deletedCount).toBe(1)

        // Recent trash and active note should remain
        expect(result.current.notes).toHaveLength(2)
        expect(result.current.notes.map(n => n.id)).toContain('2')
        expect(result.current.notes.map(n => n.id)).toContain('3')
      })

      it('returns 0 when no old trash exists', async () => {
        const now = Date.now()
        const recentDeletion = now - (10 * 24 * 60 * 60 * 1000) // 10 days ago

        const initialNotes = [
          { id: '1', title: 'Recent Trash', content: '', folder: 'notes', created_at: 1000, updated_at: 1000, deleted_at: recentDeletion },
          { id: '2', title: 'Active', content: '', folder: 'notes', created_at: 1000, updated_at: 1000, deleted_at: null },
        ]

        // Set initial state
        useNotesStore.setState({ notes: initialNotes })

        const { result } = renderHook(() => useNotesStore())

        let deletedCount: number = 0
        await act(async () => {
          deletedCount = await result.current.cleanupOldTrash(30)
        })

        expect(mockApi.deleteNote).not.toHaveBeenCalled()
        expect(deletedCount).toBe(0)
        expect(result.current.notes).toHaveLength(2)
      })

      it('uses default 30 days when no argument provided', async () => {
        const now = Date.now()
        const thirtyOneDaysAgo = now - (31 * 24 * 60 * 60 * 1000)

        const initialNotes = [
          { id: '1', title: 'Old Trash', content: '', folder: 'notes', created_at: 1000, updated_at: 1000, deleted_at: thirtyOneDaysAgo },
        ]

        mockApi.deleteNote.mockResolvedValue(undefined)
        useNotesStore.setState({ notes: initialNotes })

        const { result } = renderHook(() => useNotesStore())

        await act(async () => {
          await result.current.cleanupOldTrash() // No argument = 30 days default
        })

        expect(mockApi.deleteNote).toHaveBeenCalledWith('1')
      })
    })

    describe('Delete Confirmation Flow', () => {
      it('requestDeleteNote sets pending state', () => {
        const { result } = renderHook(() => useNotesStore())

        act(() => {
          result.current.requestDeleteNote('note-to-delete')
        })

        expect(useNotesStore.getState().pendingDeleteNoteId).toBe('note-to-delete')
        expect(useNotesStore.getState().showDeleteConfirmation).toBe(true)
      })

      it('cancelDeleteNote clears pending state', () => {
        useNotesStore.setState({ pendingDeleteNoteId: 'note-123', showDeleteConfirmation: true })

        const { result } = renderHook(() => useNotesStore())

        act(() => {
          result.current.cancelDeleteNote()
        })

        expect(useNotesStore.getState().pendingDeleteNoteId).toBeNull()
        expect(useNotesStore.getState().showDeleteConfirmation).toBe(false)
      })

      it('confirmDeleteNote soft deletes and clears pending state', async () => {
        const initialNotes = [
          { id: 'note-123', title: 'To Delete', content: '', folder: 'notes', created_at: 1000, updated_at: 1000, deleted_at: null },
        ]
        const deletedNote = { ...initialNotes[0], deleted_at: Date.now() }

        mockApi.updateNote.mockResolvedValue(deletedNote)
        useNotesStore.setState({
          notes: initialNotes,
          pendingDeleteNoteId: 'note-123',
          showDeleteConfirmation: true
        })

        const { result } = renderHook(() => useNotesStore())

        act(() => {
          result.current.confirmDeleteNote()
        })

        // Wait for async operations
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 100))
        })

        expect(useNotesStore.getState().pendingDeleteNoteId).toBeNull()
        expect(useNotesStore.getState().showDeleteConfirmation).toBe(false)
      })
    })
  })
})
