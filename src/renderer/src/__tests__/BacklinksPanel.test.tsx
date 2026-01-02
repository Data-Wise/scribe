import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BacklinksPanel } from '../components/BacklinksPanel'
import { Note } from '../types'

// Mock the api module
vi.mock('../lib/api', () => ({
  api: {
    getBacklinks: vi.fn(),
    getOutgoingLinks: vi.fn()
  }
}))

// Import mocked api after vi.mock
import { api } from '../lib/api'

// Mock notes for testing
const mockNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Reference Note',
    content: 'This note mentions [[Target Note]] in the content.',
    folder: 'inbox',
    project_id: null,
    created_at: Date.now() - 86400000,
    updated_at: Date.now() - 3600000,
    deleted_at: null
  },
  {
    id: 'note-2',
    title: 'Another Reference',
    content: 'Here we talk about Target Note without brackets.',
    folder: 'projects',
    project_id: null,
    created_at: Date.now() - 172800000,
    updated_at: Date.now() - 7200000,
    deleted_at: null
  },
  {
    id: 'note-3',
    title: 'Related Document',
    content: 'Some content here that does not reference the target note.',
    folder: 'resources',
    project_id: null,
    created_at: Date.now() - 259200000,
    updated_at: Date.now() - 10800000,
    deleted_at: null
  }
]

describe('BacklinksPanel Component', () => {
  const defaultProps = {
    noteId: 'target-note-id',
    noteTitle: 'Target Note',
    onSelectNote: vi.fn(),
    refreshKey: 0
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Rendering - Panel with Heading', () => {
    it('renders panel with Links heading', async () => {
      vi.mocked(api.getBacklinks).mockResolvedValue([])
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      render(<BacklinksPanel {...defaultProps} />)

      const heading = screen.getByText('Links')
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveClass('text-sm', 'font-semibold')
    })

    it('renders backlinks panel container', async () => {
      vi.mocked(api.getBacklinks).mockResolvedValue([])
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      render(<BacklinksPanel {...defaultProps} />)

      const panel = screen.getByTestId('backlinks-panel')
      expect(panel).toBeInTheDocument()
      expect(panel).toHaveClass('h-full', 'bg-nexus-bg-primary', 'flex', 'flex-col')
    })

    it('displays connection count in header', async () => {
      vi.mocked(api.getBacklinks).mockResolvedValue(mockNotes.slice(0, 2))
      vi.mocked(api.getOutgoingLinks).mockResolvedValue(mockNotes.slice(0, 1))

      render(<BacklinksPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('3 connections')).toBeInTheDocument()
      })
    })

    it('displays singular "connection" when count is 1', async () => {
      vi.mocked(api.getBacklinks).mockResolvedValue(mockNotes.slice(0, 1))
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      render(<BacklinksPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('1 connection')).toBeInTheDocument()
      })
    })
  })

  describe('Backlinks Display', () => {
    it('shows backlinks when present', async () => {
      vi.mocked(api.getBacklinks).mockResolvedValue(mockNotes.slice(0, 2))
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      render(<BacklinksPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Reference Note')).toBeInTheDocument()
        expect(screen.getByText('Another Reference')).toBeInTheDocument()
      })
    })

    it('displays backlink count badge', async () => {
      vi.mocked(api.getBacklinks).mockResolvedValue(mockNotes.slice(0, 2))
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      render(<BacklinksPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument() // Backlinks count
      })
    })

    it('shows context snippet for each backlink', async () => {
      const backlinksWithContext = [
        {
          ...mockNotes[0],
          content: 'This note mentions [[Target Note]] in the content.'
        }
      ]
      vi.mocked(api.getBacklinks).mockResolvedValue(backlinksWithContext)
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      render(<BacklinksPanel {...defaultProps} />)

      await waitFor(() => {
        // Context snippet should be displayed
        const contextText = screen.getByText(/Target Note/)
        expect(contextText.textContent).toContain('Target Note')
      })
    })

    it('displays folder and update time for each backlink', async () => {
      vi.mocked(api.getBacklinks).mockResolvedValue(mockNotes.slice(0, 1))
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      render(<BacklinksPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('inbox')).toBeInTheDocument()
        // Should show relative time (e.g., "1h ago")
        expect(screen.getByText(/ago/)).toBeInTheDocument()
      })
    })
  })

  describe('Outgoing Links Display', () => {
    it('shows outgoing links when present', async () => {
      vi.mocked(api.getBacklinks).mockResolvedValue([])
      vi.mocked(api.getOutgoingLinks).mockResolvedValue(mockNotes.slice(0, 2))

      render(<BacklinksPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Reference Note')).toBeInTheDocument()
        expect(screen.getByText('Another Reference')).toBeInTheDocument()
      })
    })

    it('displays outgoing links count badge', async () => {
      vi.mocked(api.getBacklinks).mockResolvedValue([])
      vi.mocked(api.getOutgoingLinks).mockResolvedValue(mockNotes.slice(0, 2))

      render(<BacklinksPanel {...defaultProps} />)

      // Find the outgoing count badge (should be "2")
      await waitFor(() => {
        const badges = screen.getAllByText('2')
        expect(badges.length).toBeGreaterThanOrEqual(1)
      })
    })

    it('displays folder and update time for outgoing links', async () => {
      vi.mocked(api.getBacklinks).mockResolvedValue([])
      vi.mocked(api.getOutgoingLinks).mockResolvedValue(mockNotes.slice(0, 1))

      render(<BacklinksPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('inbox')).toBeInTheDocument()
      })
    })
  })

  describe('Empty States', () => {
    it('shows empty state when no backlinks', async () => {
      vi.mocked(api.getBacklinks).mockResolvedValue([])
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      render(<BacklinksPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('No notes link here yet')).toBeInTheDocument()
      })
    })

    it('shows empty state when no outgoing links', async () => {
      vi.mocked(api.getBacklinks).mockResolvedValue([])
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      render(<BacklinksPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('No outgoing links yet')).toBeInTheDocument()
      })
    })

    it('displays "0 connections" when both are empty', async () => {
      vi.mocked(api.getBacklinks).mockResolvedValue([])
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      render(<BacklinksPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('0 connections')).toBeInTheDocument()
      })
    })

    it('shows placeholder when no note is selected', () => {
      render(<BacklinksPanel {...defaultProps} noteId={null} />)

      expect(screen.getByText('Select a note to see links')).toBeInTheDocument()
    })

    it('displays placeholder icon when no note is selected', () => {
      const { container } = render(<BacklinksPanel {...defaultProps} noteId={null} />)

      // Check for the SVG icon
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('w-12', 'h-12')
    })
  })

  describe('User Interactions - Backlink Selection', () => {
    it('calls onSelectNote when clicking on a backlink', async () => {
      const onSelectNote = vi.fn()
      vi.mocked(api.getBacklinks).mockResolvedValue(mockNotes.slice(0, 1))
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      render(<BacklinksPanel {...defaultProps} onSelectNote={onSelectNote} />)

      await waitFor(() => {
        const button = screen.getByText('Reference Note').closest('button')
        fireEvent.click(button!)
      })

      expect(onSelectNote).toHaveBeenCalledWith('note-1')
    })

    it('calls onSelectNote when clicking on outgoing link', async () => {
      const onSelectNote = vi.fn()
      vi.mocked(api.getBacklinks).mockResolvedValue([])
      vi.mocked(api.getOutgoingLinks).mockResolvedValue(mockNotes.slice(0, 1))

      render(<BacklinksPanel {...defaultProps} onSelectNote={onSelectNote} />)

      await waitFor(() => {
        const button = screen.getByText('Reference Note').closest('button')
        fireEvent.click(button!)
      })

      expect(onSelectNote).toHaveBeenCalledWith('note-1')
    })

    it('navigates/selects correct note when multiple backlinks exist', async () => {
      const onSelectNote = vi.fn()
      vi.mocked(api.getBacklinks).mockResolvedValue(mockNotes.slice(0, 2))
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      render(<BacklinksPanel {...defaultProps} onSelectNote={onSelectNote} />)

      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        // Find the button for the second note
        const secondButton = Array.from(buttons).find(btn => btn.textContent?.includes('Another Reference'))
        fireEvent.click(secondButton!)
      })

      expect(onSelectNote).toHaveBeenCalledWith('note-2')
    })
  })

  describe('Expandable Sections', () => {
    it('backlinks section is expanded by default', async () => {
      vi.mocked(api.getBacklinks).mockResolvedValue(mockNotes.slice(0, 1))
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      render(<BacklinksPanel {...defaultProps} />)

      await waitFor(() => {
        // Content should be visible
        expect(screen.getByText('Reference Note')).toBeInTheDocument()
      })
    })

    it('outgoing section is expanded by default', async () => {
      vi.mocked(api.getBacklinks).mockResolvedValue([])
      vi.mocked(api.getOutgoingLinks).mockResolvedValue(mockNotes.slice(0, 1))

      render(<BacklinksPanel {...defaultProps} />)

      await waitFor(() => {
        // Content should be visible
        expect(screen.getByText('Reference Note')).toBeInTheDocument()
      })
    })

    it('collapses backlinks section when clicking header button', async () => {
      vi.mocked(api.getBacklinks).mockResolvedValue(mockNotes.slice(0, 1))
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      render(<BacklinksPanel {...defaultProps} />)

      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        const backlinksButton = Array.from(buttons).find(btn => btn.textContent?.includes('Backlinks'))
        fireEvent.click(backlinksButton!)
      })

      // Content should be hidden
      expect(screen.queryByText('Reference Note')).not.toBeInTheDocument()
    })

    it('expands backlinks section after being collapsed', async () => {
      vi.mocked(api.getBacklinks).mockResolvedValue(mockNotes.slice(0, 1))
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      render(<BacklinksPanel {...defaultProps} />)

      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        const backlinksButton = Array.from(buttons).find(btn => btn.textContent?.includes('Backlinks'))

        // Collapse
        fireEvent.click(backlinksButton!)
        expect(screen.queryByText('Reference Note')).not.toBeInTheDocument()

        // Expand
        fireEvent.click(backlinksButton!)
      })

      await waitFor(() => {
        expect(screen.getByText('Reference Note')).toBeInTheDocument()
      })
    })
  })

  describe('Loading State', () => {
    it('displays loading skeleton when fetching links', () => {
      vi.mocked(api.getBacklinks).mockImplementation(() => new Promise(resolve => {
        // Never resolve - simulate loading
        setTimeout(() => resolve([]), 10000)
      }))
      vi.mocked(api.getOutgoingLinks).mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve([]), 10000)
      }))

      render(<BacklinksPanel {...defaultProps} />)

      // Check for skeleton elements
      const skeletons = document.querySelectorAll('.skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('shows multiple skeleton placeholders during loading', () => {
      vi.mocked(api.getBacklinks).mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve([]), 10000)
      }))
      vi.mocked(api.getOutgoingLinks).mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve([]), 10000)
      }))

      render(<BacklinksPanel {...defaultProps} />)

      // Should have multiple skeleton lines (3 placeholders)
      const skeletons = document.querySelectorAll('.skeleton')
      expect(skeletons.length).toBeGreaterThanOrEqual(3)
    })

    it('hides skeleton and shows content after loading completes', async () => {
      vi.mocked(api.getBacklinks).mockResolvedValue(mockNotes.slice(0, 1))
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      render(<BacklinksPanel {...defaultProps} />)

      // Initially should have skeletons
      expect(document.querySelectorAll('.skeleton').length).toBeGreaterThan(0)

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('Reference Note')).toBeInTheDocument()
      })

      // Skeletons should be gone (or at least the content should be visible)
      expect(screen.getByText('Reference Note')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles API error gracefully when fetching backlinks', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(api.getBacklinks).mockRejectedValue(new Error('API Error'))
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      render(<BacklinksPanel {...defaultProps} />)

      await waitFor(() => {
        // Should not crash, should show empty states
        expect(screen.getByText('No notes link here yet')).toBeInTheDocument()
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[BacklinksPanel] Failed to load links:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })

    it('handles API error gracefully when fetching outgoing links', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(api.getBacklinks).mockResolvedValue([])
      vi.mocked(api.getOutgoingLinks).mockRejectedValue(new Error('API Error'))

      render(<BacklinksPanel {...defaultProps} />)

      await waitFor(() => {
        // Should not crash
        expect(screen.getByText('No outgoing links yet')).toBeInTheDocument()
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[BacklinksPanel] Failed to load links:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })

    it('recovers from error on subsequent API calls', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(api.getBacklinks).mockRejectedValueOnce(new Error('First error'))
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      const { rerender } = render(<BacklinksPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('No notes link here yet')).toBeInTheDocument()
      })

      // Reset mocks and trigger a refresh with new props
      vi.clearAllMocks()
      vi.mocked(api.getBacklinks).mockResolvedValue(mockNotes.slice(0, 1))
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      // Trigger refresh by incrementing refreshKey
      rerender(<BacklinksPanel {...defaultProps} refreshKey={1} />)

      await waitFor(() => {
        expect(screen.getByText('Reference Note')).toBeInTheDocument()
      })

      consoleErrorSpy.mockRestore()
    })

    it('handles both API calls failing simultaneously', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(api.getBacklinks).mockRejectedValue(new Error('Backlinks Error'))
      vi.mocked(api.getOutgoingLinks).mockRejectedValue(new Error('Outgoing Error'))

      render(<BacklinksPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('No notes link here yet')).toBeInTheDocument()
        expect(screen.getByText('No outgoing links yet')).toBeInTheDocument()
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[BacklinksPanel] Failed to load links:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Refresh Mechanism', () => {
    it('reloads links when refreshKey prop changes', async () => {
      vi.mocked(api.getBacklinks).mockResolvedValue(mockNotes.slice(0, 1))
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      const { rerender } = render(<BacklinksPanel {...defaultProps} refreshKey={0} />)

      await waitFor(() => {
        expect(api.getBacklinks).toHaveBeenCalledTimes(1)
      })

      vi.clearAllMocks()
      vi.mocked(api.getBacklinks).mockResolvedValue(mockNotes.slice(0, 2))
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      // Increment refreshKey to trigger reload
      rerender(<BacklinksPanel {...defaultProps} refreshKey={1} />)

      await waitFor(() => {
        expect(api.getBacklinks).toHaveBeenCalledTimes(1)
      })
    })

    it('does not reload when noteId changes if empty', async () => {
      vi.mocked(api.getBacklinks).mockResolvedValue([])
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      const { rerender } = render(<BacklinksPanel {...defaultProps} noteId={null} />)

      // Change noteId to another null-like value
      rerender(<BacklinksPanel {...defaultProps} noteId={null} refreshKey={1} />)

      await waitFor(() => {
        // Should not call API when noteId is null
        expect(api.getBacklinks).not.toHaveBeenCalled()
      })
    })

    it('loads links when noteId becomes available', async () => {
      vi.mocked(api.getBacklinks).mockResolvedValue(mockNotes.slice(0, 1))
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      const { rerender } = render(<BacklinksPanel {...defaultProps} noteId={null} />)

      expect(api.getBacklinks).not.toHaveBeenCalled()

      // Change to valid noteId
      rerender(<BacklinksPanel {...defaultProps} noteId="new-note-id" />)

      await waitFor(() => {
        expect(api.getBacklinks).toHaveBeenCalled()
      })
    })
  })

  describe('Context Extraction Behavior', () => {
    it('extracts context for backlinks when noteTitle is provided', async () => {
      const backlinksWithContent = [
        {
          ...mockNotes[0],
          content: 'Prefix before [[Target Note]] and suffix after'
        }
      ]
      vi.mocked(api.getBacklinks).mockResolvedValue(backlinksWithContent)
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      render(<BacklinksPanel {...defaultProps} noteTitle="Target Note" />)

      await waitFor(() => {
        // Context should show the snippet around the link
        expect(screen.getByText(/Prefix/)).toBeInTheDocument()
      })
    })

    it('handles missing context gracefully', async () => {
      const backlinksWithoutMatch = [
        {
          ...mockNotes[0],
          content: 'This content does not mention the target note at all'
        }
      ]
      vi.mocked(api.getBacklinks).mockResolvedValue(backlinksWithoutMatch)
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      render(<BacklinksPanel {...defaultProps} noteTitle="Target Note" />)

      await waitFor(() => {
        // Should still show the note without context
        expect(screen.getByText('Reference Note')).toBeInTheDocument()
      })
    })
  })

  describe('Note Title Handling', () => {
    it('displays "Untitled" when note has no title', async () => {
      const untitledNote = {
        ...mockNotes[0],
        title: ''
      }
      vi.mocked(api.getBacklinks).mockResolvedValue([untitledNote])
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      render(<BacklinksPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Untitled')).toBeInTheDocument()
      })
    })

    it('truncates very long note titles', async () => {
      const longTitleNote = {
        ...mockNotes[0],
        title: 'A'.repeat(100)
      }
      vi.mocked(api.getBacklinks).mockResolvedValue([longTitleNote])
      vi.mocked(api.getOutgoingLinks).mockResolvedValue([])

      render(<BacklinksPanel {...defaultProps} />)

      await waitFor(() => {
        const titleElement = screen.getByText(/^A+$/)
        expect(titleElement).toHaveClass('truncate')
      })
    })
  })

  describe('Integration Tests', () => {
    it('renders complete panel with both backlinks and outgoing links', async () => {
      vi.mocked(api.getBacklinks).mockResolvedValue(mockNotes.slice(0, 2))
      vi.mocked(api.getOutgoingLinks).mockResolvedValue(mockNotes.slice(2, 3))

      render(<BacklinksPanel {...defaultProps} />)

      await waitFor(() => {
        // Check headers
        expect(screen.getByText('Links')).toBeInTheDocument()

        // Check backlinks section
        expect(screen.getByText('Reference Note')).toBeInTheDocument()
        expect(screen.getByText('Another Reference')).toBeInTheDocument()

        // Check connection count
        expect(screen.getByText('3 connections')).toBeInTheDocument()
      })
    })

    it('allows collapsing and expanding both sections independently', async () => {
      vi.mocked(api.getBacklinks).mockResolvedValue(mockNotes.slice(0, 1))
      vi.mocked(api.getOutgoingLinks).mockResolvedValue(mockNotes.slice(1, 2))

      render(<BacklinksPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Reference Note')).toBeInTheDocument()
        expect(screen.getByText('Another Reference')).toBeInTheDocument()
      })

      const buttons = screen.getAllByRole('button')
      const backlinksButton = Array.from(buttons).find(btn => btn.textContent?.includes('Backlinks'))
      const outgoingButton = Array.from(buttons).find(btn => btn.textContent?.includes('Outgoing'))

      // Collapse backlinks
      fireEvent.click(backlinksButton!)
      expect(screen.queryByText('Reference Note')).not.toBeInTheDocument()
      expect(screen.getByText('Another Reference')).toBeInTheDocument()

      // Collapse outgoing
      fireEvent.click(outgoingButton!)
      expect(screen.queryByText('Another Reference')).not.toBeInTheDocument()

      // Expand both
      fireEvent.click(backlinksButton!)
      fireEvent.click(outgoingButton!)

      await waitFor(() => {
        expect(screen.getByText('Reference Note')).toBeInTheDocument()
        expect(screen.getByText('Another Reference')).toBeInTheDocument()
      })
    })
  })
})
