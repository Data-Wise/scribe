import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TrashPanel } from '../components/sidebar/TrashPanel'
import { useNotesStore } from '../store/useNotesStore'
import { Note } from '../types'

// Mock the notes store
vi.mock('../store/useNotesStore', () => ({
  useNotesStore: vi.fn()
}))

const mockUseNotesStore = useNotesStore as unknown as ReturnType<typeof vi.fn>

describe('TrashPanel', () => {
  const mockRestoreNote = vi.fn()
  const mockPermanentlyDeleteNote = vi.fn()
  const mockEmptyTrash = vi.fn()

  const createMockNote = (overrides: Partial<Note> = {}): Note => ({
    id: `note-${Math.random().toString(36).substr(2, 9)}`,
    title: 'Test Note',
    content: 'Test content',
    folder: 'notes',
    created_at: Date.now() - 86400000,
    updated_at: Date.now() - 3600000,
    deleted_at: Date.now() - 1800000, // 30 minutes ago
    ...overrides
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseNotesStore.mockReturnValue({
      restoreNote: mockRestoreNote,
      permanentlyDeleteNote: mockPermanentlyDeleteNote,
      emptyTrash: mockEmptyTrash
    })
  })

  describe('Empty State', () => {
    it('shows empty state when no trashed notes', () => {
      render(<TrashPanel notes={[]} />)

      expect(screen.getByText('Trash is empty')).toBeInTheDocument()
      expect(screen.getByText('Deleted notes will appear here')).toBeInTheDocument()
    })

    it('shows empty state when all notes are not deleted', () => {
      const notes = [
        createMockNote({ deleted_at: undefined }),
        createMockNote({ deleted_at: undefined })
      ]

      render(<TrashPanel notes={notes} />)

      expect(screen.getByText('Trash is empty')).toBeInTheDocument()
    })
  })

  describe('Trashed Notes List', () => {
    it('displays trashed notes', () => {
      const notes = [
        createMockNote({ id: '1', title: 'Deleted Note 1', deleted_at: Date.now() }),
        createMockNote({ id: '2', title: 'Deleted Note 2', deleted_at: Date.now() })
      ]

      render(<TrashPanel notes={notes} />)

      expect(screen.getByText('Deleted Note 1')).toBeInTheDocument()
      expect(screen.getByText('Deleted Note 2')).toBeInTheDocument()
    })

    it('shows trash count in header', () => {
      const notes = [
        createMockNote({ deleted_at: Date.now() }),
        createMockNote({ deleted_at: Date.now() }),
        createMockNote({ deleted_at: Date.now() })
      ]

      render(<TrashPanel notes={notes} />)

      expect(screen.getByText('Trash (3)')).toBeInTheDocument()
    })

    it('filters out non-deleted notes', () => {
      const notes = [
        createMockNote({ id: '1', title: 'Active Note', deleted_at: undefined }),
        createMockNote({ id: '2', title: 'Deleted Note', deleted_at: Date.now() })
      ]

      render(<TrashPanel notes={notes} />)

      expect(screen.queryByText('Active Note')).not.toBeInTheDocument()
      expect(screen.getByText('Deleted Note')).toBeInTheDocument()
      expect(screen.getByText('Trash (1)')).toBeInTheDocument()
    })

    it('sorts notes by deletion time (most recent first)', () => {
      const now = Date.now()
      const notes = [
        createMockNote({ id: '1', title: 'Older', deleted_at: now - 3600000 }),
        createMockNote({ id: '2', title: 'Newest', deleted_at: now }),
        createMockNote({ id: '3', title: 'Middle', deleted_at: now - 1800000 })
      ]

      render(<TrashPanel notes={notes} />)

      const noteElements = screen.getAllByText(/Older|Newest|Middle/)
      expect(noteElements[0]).toHaveTextContent('Newest')
      expect(noteElements[1]).toHaveTextContent('Middle')
      expect(noteElements[2]).toHaveTextContent('Older')
    })

    it('shows "Untitled" for notes without title', () => {
      const notes = [
        createMockNote({ title: '', deleted_at: Date.now() })
      ]

      render(<TrashPanel notes={notes} />)

      expect(screen.getByText('Untitled')).toBeInTheDocument()
    })
  })

  describe('Restore Action', () => {
    it('calls restoreNote when restore button clicked', async () => {
      const notes = [
        createMockNote({ id: 'note-to-restore', title: 'Test', deleted_at: Date.now() })
      ]

      render(<TrashPanel notes={notes} />)

      const restoreButton = screen.getByRole('button', { name: /restore/i })
      fireEvent.click(restoreButton)

      expect(mockRestoreNote).toHaveBeenCalledWith('note-to-restore')
    })
  })

  describe('Permanent Delete Action', () => {
    it('requires double click to permanently delete', async () => {
      const notes = [
        createMockNote({ id: 'note-to-delete', title: 'Test', deleted_at: Date.now() })
      ]

      render(<TrashPanel notes={notes} />)

      // First click should show confirmation
      const deleteButton = screen.getByRole('button', { name: /delete forever/i })
      fireEvent.click(deleteButton)

      // Button should now show "Confirm?"
      expect(screen.getByText('Confirm?')).toBeInTheDocument()

      // Second click should actually delete
      fireEvent.click(deleteButton)

      expect(mockPermanentlyDeleteNote).toHaveBeenCalledWith('note-to-delete')
    })

    it('does not delete on single click', () => {
      const notes = [
        createMockNote({ id: 'note-to-delete', title: 'Test', deleted_at: Date.now() })
      ]

      render(<TrashPanel notes={notes} />)

      const deleteButton = screen.getByRole('button', { name: /delete forever/i })
      fireEvent.click(deleteButton)

      // Should not have called delete yet
      expect(mockPermanentlyDeleteNote).not.toHaveBeenCalled()
    })
  })

  describe('Empty Trash Action', () => {
    it('shows empty button in header', () => {
      const notes = [
        createMockNote({ deleted_at: Date.now() })
      ]

      render(<TrashPanel notes={notes} />)

      expect(screen.getByRole('button', { name: /empty/i })).toBeInTheDocument()
    })

    it('requires double click to empty trash', async () => {
      const notes = [
        createMockNote({ deleted_at: Date.now() })
      ]

      render(<TrashPanel notes={notes} />)

      const emptyButton = screen.getByRole('button', { name: /empty/i })
      fireEvent.click(emptyButton)

      // Should show confirmation
      expect(screen.getByText('Confirm?')).toBeInTheDocument()

      // Second click should empty trash
      fireEvent.click(emptyButton)

      expect(mockEmptyTrash).toHaveBeenCalled()
    })

    it('does not empty trash on single click', () => {
      const notes = [
        createMockNote({ deleted_at: Date.now() })
      ]

      render(<TrashPanel notes={notes} />)

      const emptyButton = screen.getByRole('button', { name: /empty/i })
      fireEvent.click(emptyButton)

      expect(mockEmptyTrash).not.toHaveBeenCalled()
    })
  })

  describe('Time Formatting', () => {
    it('shows "just now" for very recent deletions', () => {
      const notes = [
        createMockNote({ deleted_at: Date.now() - 30000 }) // 30 seconds ago
      ]

      render(<TrashPanel notes={notes} />)

      expect(screen.getByText(/just now/i)).toBeInTheDocument()
    })

    it('shows minutes ago for recent deletions', () => {
      const notes = [
        createMockNote({ deleted_at: Date.now() - 300000 }) // 5 minutes ago
      ]

      render(<TrashPanel notes={notes} />)

      expect(screen.getByText(/5m ago/i)).toBeInTheDocument()
    })

    it('shows hours ago for older deletions', () => {
      const notes = [
        createMockNote({ deleted_at: Date.now() - 7200000 }) // 2 hours ago
      ]

      render(<TrashPanel notes={notes} />)

      expect(screen.getByText(/2h ago/i)).toBeInTheDocument()
    })

    it('shows "yesterday" for deletions from yesterday', () => {
      const notes = [
        createMockNote({ deleted_at: Date.now() - 86400000 }) // 1 day ago
      ]

      render(<TrashPanel notes={notes} />)

      expect(screen.getByText(/yesterday/i)).toBeInTheDocument()
    })

    it('shows days ago for deletions within a week', () => {
      const notes = [
        createMockNote({ deleted_at: Date.now() - 259200000 }) // 3 days ago
      ]

      render(<TrashPanel notes={notes} />)

      expect(screen.getByText(/3d ago/i)).toBeInTheDocument()
    })
  })

  describe('Footer', () => {
    it('shows restore hint in footer', () => {
      const notes = [
        createMockNote({ deleted_at: Date.now() })
      ]

      render(<TrashPanel notes={notes} />)

      expect(screen.getByText('Restore notes to recover them')).toBeInTheDocument()
    })
  })
})
