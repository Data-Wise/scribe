import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuickCaptureInbox } from '../components/QuickCaptureInbox'
import { Note } from '../types'

// Helper to create mock notes
function createMockNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'note-1',
    title: 'Test Note',
    content: 'Test content',
    folder: 'inbox',
    created_at: Date.now() - 60000, // 1 minute ago
    updated_at: Date.now(),
    deleted_at: null,
    properties: {},
    ...overrides
  }
}

describe('QuickCaptureInbox', () => {
  const mockOnProcess = vi.fn()
  const mockOnMarkProcessed = vi.fn()
  const mockOnDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when inbox is empty', () => {
    it('returns null (hidden)', () => {
      const { container } = render(
        <QuickCaptureInbox
          notes={[]}
          onProcess={mockOnProcess}
        />
      )
      expect(container.firstChild).toBeNull()
    })

    it('hides when no inbox folder notes', () => {
      const notes = [
        createMockNote({ folder: 'notes' }),
        createMockNote({ id: 'note-2', folder: 'daily' })
      ]
      const { container } = render(
        <QuickCaptureInbox
          notes={notes}
          onProcess={mockOnProcess}
        />
      )
      expect(container.firstChild).toBeNull()
    })

    it('hides when inbox notes are deleted', () => {
      const notes = [
        createMockNote({ deleted_at: Date.now() })
      ]
      const { container } = render(
        <QuickCaptureInbox
          notes={notes}
          onProcess={mockOnProcess}
        />
      )
      expect(container.firstChild).toBeNull()
    })
  })

  describe('when inbox has items', () => {
    const inboxNotes = [
      createMockNote({ id: 'inbox-1', title: 'First capture', content: 'First content' }),
      createMockNote({ id: 'inbox-2', title: 'Second capture', content: 'Second content', created_at: Date.now() - 120000 })
    ]

    it('shows inbox header', () => {
      render(
        <QuickCaptureInbox
          notes={inboxNotes}
          onProcess={mockOnProcess}
        />
      )
      expect(screen.getByText('Inbox')).toBeInTheDocument()
    })

    it('shows item count badge', () => {
      render(
        <QuickCaptureInbox
          notes={inboxNotes}
          onProcess={mockOnProcess}
        />
      )
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('shows inbox items', () => {
      render(
        <QuickCaptureInbox
          notes={inboxNotes}
          onProcess={mockOnProcess}
        />
      )
      expect(screen.getByText('First capture')).toBeInTheDocument()
      expect(screen.getByText('Second capture')).toBeInTheDocument()
    })

    it('shows content preview', () => {
      render(
        <QuickCaptureInbox
          notes={inboxNotes}
          onProcess={mockOnProcess}
        />
      )
      expect(screen.getByText('First content')).toBeInTheDocument()
    })

    it('shows relative time', () => {
      render(
        <QuickCaptureInbox
          notes={inboxNotes}
          onProcess={mockOnProcess}
        />
      )
      expect(screen.getByText('1m ago')).toBeInTheDocument()
      expect(screen.getByText('2m ago')).toBeInTheDocument()
    })

    it('shows keyboard hint', () => {
      render(
        <QuickCaptureInbox
          notes={inboxNotes}
          onProcess={mockOnProcess}
        />
      )
      expect(screen.getByText('⌘⇧C')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    const inboxNotes = [
      createMockNote({ id: 'inbox-1', title: 'Test capture' })
    ]

    it('calls onProcess when item clicked', () => {
      render(
        <QuickCaptureInbox
          notes={inboxNotes}
          onProcess={mockOnProcess}
        />
      )
      fireEvent.click(screen.getByText('Test capture'))
      expect(mockOnProcess).toHaveBeenCalledWith('inbox-1')
    })

    it('calls onMarkProcessed when check button clicked', () => {
      render(
        <QuickCaptureInbox
          notes={inboxNotes}
          onProcess={mockOnProcess}
          onMarkProcessed={mockOnMarkProcessed}
        />
      )
      // Hover to show buttons
      const item = screen.getByText('Test capture').closest('.inbox-item')!
      fireEvent.mouseEnter(item)

      const checkButton = screen.getByTitle('Mark as processed')
      fireEvent.click(checkButton)
      expect(mockOnMarkProcessed).toHaveBeenCalledWith('inbox-1')
      expect(mockOnProcess).not.toHaveBeenCalled() // Should not also process
    })

    it('calls onDelete when delete button clicked', () => {
      render(
        <QuickCaptureInbox
          notes={inboxNotes}
          onProcess={mockOnProcess}
          onDelete={mockOnDelete}
        />
      )
      const item = screen.getByText('Test capture').closest('.inbox-item')!
      fireEvent.mouseEnter(item)

      const deleteButton = screen.getByTitle('Delete capture')
      fireEvent.click(deleteButton)
      expect(mockOnDelete).toHaveBeenCalledWith('inbox-1')
      expect(mockOnProcess).not.toHaveBeenCalled()
    })
  })

  describe('limit', () => {
    const manyNotes = Array.from({ length: 10 }, (_, i) =>
      createMockNote({
        id: `inbox-${i}`,
        title: `Capture ${i}`,
        created_at: Date.now() - i * 60000 // Staggered times
      })
    )

    it('shows default 5 items', () => {
      render(
        <QuickCaptureInbox
          notes={manyNotes}
          onProcess={mockOnProcess}
        />
      )
      // Should show first 5 (most recent)
      expect(screen.getByText('Capture 0')).toBeInTheDocument()
      expect(screen.getByText('Capture 4')).toBeInTheDocument()
      expect(screen.queryByText('Capture 5')).not.toBeInTheDocument()
    })

    it('shows "+X more" when exceeding limit', () => {
      render(
        <QuickCaptureInbox
          notes={manyNotes}
          onProcess={mockOnProcess}
        />
      )
      expect(screen.getByText('+5 more')).toBeInTheDocument()
    })

    it('respects custom limit', () => {
      render(
        <QuickCaptureInbox
          notes={manyNotes}
          onProcess={mockOnProcess}
          limit={3}
        />
      )
      expect(screen.getByText('Capture 0')).toBeInTheDocument()
      expect(screen.getByText('Capture 2')).toBeInTheDocument()
      expect(screen.queryByText('Capture 3')).not.toBeInTheDocument()
      expect(screen.getByText('+7 more')).toBeInTheDocument()
    })
  })

  describe('sorting', () => {
    it('shows newest items first', () => {
      const notes = [
        createMockNote({ id: 'old', title: 'Old note', created_at: Date.now() - 3600000 }),
        createMockNote({ id: 'new', title: 'New note', created_at: Date.now() - 60000 })
      ]
      render(
        <QuickCaptureInbox
          notes={notes}
          onProcess={mockOnProcess}
        />
      )
      const items = screen.getAllByText(/note/i)
      expect(items[0]).toHaveTextContent('New note')
    })
  })

  describe('content preview', () => {
    it('truncates long content', () => {
      const notes = [
        createMockNote({
          id: 'long',
          title: 'Long note',
          content: 'A'.repeat(100)
        })
      ]
      render(
        <QuickCaptureInbox
          notes={notes}
          onProcess={mockOnProcess}
        />
      )
      // Should truncate to ~80 chars + ...
      const preview = screen.getByText(/^A+\.\.\.$/i)
      expect(preview.textContent!.length).toBeLessThan(90)
    })

    it('handles notes with no content', () => {
      const notes = [
        createMockNote({ id: 'empty', title: 'Empty note', content: '' })
      ]
      render(
        <QuickCaptureInbox
          notes={notes}
          onProcess={mockOnProcess}
        />
      )
      expect(screen.getByText('Empty note')).toBeInTheDocument()
    })

    it('handles untitled notes', () => {
      const notes = [
        createMockNote({ id: 'untitled', title: '', content: 'Some content' })
      ]
      render(
        <QuickCaptureInbox
          notes={notes}
          onProcess={mockOnProcess}
        />
      )
      expect(screen.getByText('Untitled capture')).toBeInTheDocument()
    })
  })

  describe('time formatting', () => {
    it('shows "just now" for < 1 minute', () => {
      const notes = [
        createMockNote({ created_at: Date.now() - 30000 }) // 30 seconds
      ]
      render(
        <QuickCaptureInbox
          notes={notes}
          onProcess={mockOnProcess}
        />
      )
      expect(screen.getByText('just now')).toBeInTheDocument()
    })

    it('shows hours for older items', () => {
      const notes = [
        createMockNote({ created_at: Date.now() - 7200000 }) // 2 hours
      ]
      render(
        <QuickCaptureInbox
          notes={notes}
          onProcess={mockOnProcess}
        />
      )
      expect(screen.getByText('2h ago')).toBeInTheDocument()
    })

    it('shows "yesterday" for 1 day old', () => {
      const notes = [
        createMockNote({ created_at: Date.now() - 86400000 }) // 24 hours
      ]
      render(
        <QuickCaptureInbox
          notes={notes}
          onProcess={mockOnProcess}
        />
      )
      expect(screen.getByText('yesterday')).toBeInTheDocument()
    })

    it('shows days for older items', () => {
      const notes = [
        createMockNote({ created_at: Date.now() - 172800000 }) // 2 days
      ]
      render(
        <QuickCaptureInbox
          notes={notes}
          onProcess={mockOnProcess}
        />
      )
      expect(screen.getByText('2d ago')).toBeInTheDocument()
    })
  })
})
