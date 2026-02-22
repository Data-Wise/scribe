import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SearchPanel } from '../components/SearchPanel'
import { Note, Project } from '../types'

// Mock the api module
vi.mock('../lib/api', () => ({
  api: {
    searchNotes: vi.fn(),
    getProjectNotes: vi.fn()
  }
}))

// Mock the extractSearchSnippet utility
vi.mock('../utils/search', () => ({
  extractSearchSnippet: vi.fn((content: string, _query: string, _maxLength: number) => {
    if (!content) return ''
    return content.slice(0, 50) + (content.length > 50 ? '...' : '')
  }),
  stripHtml: vi.fn((html: string) => html),
  escapeRegex: vi.fn((str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
}))

// Import mocked api after vi.mock
import { api } from '../lib/api'

// Mock notes
const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Project Plan',
    content: 'This is the project plan content',
    folder: 'projects',
    project_id: null,
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: null
  },
  {
    id: '2',
    title: 'Meeting Notes',
    content: 'Notes from the team meeting',
    folder: 'inbox',
    project_id: null,
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: null
  },
  {
    id: '3',
    title: 'Research Paper',
    content: 'Research findings and analysis',
    folder: 'resources',
    project_id: null,
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: null
  }
]

const mockProject: Project = {
  id: 'proj-1',
  name: 'Test Project',
  type: 'research',
  color: '#4A90D9',
  icon: 'book',
  created_at: Date.now(),
  updated_at: Date.now()
}

const mockProjects: Project[] = [mockProject]

describe('SearchPanel Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSelectNote: vi.fn(),
    currentProject: null as Project | null,
    projects: mockProjects
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.searchNotes).mockResolvedValue([])
    vi.mocked(api.getProjectNotes).mockResolvedValue([])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('renders search input when open', () => {
      render(<SearchPanel {...defaultProps} />)

      expect(screen.getByPlaceholderText('Search pages...')).toBeInTheDocument()
      expect(screen.getByLabelText('Search query')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(<SearchPanel {...defaultProps} isOpen={false} />)

      expect(screen.queryByPlaceholderText('Search pages...')).not.toBeInTheDocument()
    })

    it('renders scope dropdown with All Pages option', () => {
      render(<SearchPanel {...defaultProps} />)

      expect(screen.getByText('All Pages')).toBeInTheDocument()
    })

    it('renders keyboard hints in footer', () => {
      render(<SearchPanel {...defaultProps} />)

      expect(screen.getByText('Navigate')).toBeInTheDocument()
      expect(screen.getByText('Open')).toBeInTheDocument()
      expect(screen.getByText('Close')).toBeInTheDocument()
    })

    it('renders dialog with proper accessibility attributes', () => {
      render(<SearchPanel {...defaultProps} />)

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Search pages')
    })
  })

  describe('Empty State', () => {
    it('renders hint when no query is entered', () => {
      render(<SearchPanel {...defaultProps} />)

      expect(screen.getByText('Start typing to search across your pages')).toBeInTheDocument()
    })

    it('renders empty state when no results found', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      vi.mocked(api.searchNotes).mockResolvedValue([])

      render(<SearchPanel {...defaultProps} />)

      const input = screen.getByPlaceholderText('Search pages...')
      await act(async () => {
        fireEvent.change(input, { target: { value: 'nonexistent' } })
      })

      // Advance past debounce timer and let promises resolve
      await act(async () => {
        await vi.advanceTimersByTimeAsync(200)
      })

      expect(screen.getByText('No pages found for "nonexistent"')).toBeInTheDocument()
    })
  })

  describe('Search Results Display', () => {
    it('displays search results after typing', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      vi.mocked(api.searchNotes).mockResolvedValue(mockNotes)

      render(<SearchPanel {...defaultProps} />)

      const input = screen.getByPlaceholderText('Search pages...')
      await act(async () => {
        fireEvent.change(input, { target: { value: 'notes' } })
      })

      // Advance past debounce timer
      await act(async () => {
        await vi.advanceTimersByTimeAsync(200)
      })

      // Check that result items are rendered (titles may be split by HighlightedText)
      const options = screen.getAllByRole('option')
      expect(options.length).toBe(3)
      // Check for content within results using getAllByText to handle duplicates
      expect(screen.getAllByText(/Project Plan/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Meeting/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Research Paper/i).length).toBeGreaterThan(0)
    })

    it('shows results with proper role attributes', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      vi.mocked(api.searchNotes).mockResolvedValue(mockNotes)

      render(<SearchPanel {...defaultProps} />)

      const input = screen.getByPlaceholderText('Search pages...')
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } })
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(200)
      })

      const options = screen.getAllByRole('option')
      expect(options.length).toBe(3)
    })
  })

  describe('Click Interactions', () => {
    it('calls onSelectNote and onClose when clicking a result', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      vi.mocked(api.searchNotes).mockResolvedValue(mockNotes)

      render(<SearchPanel {...defaultProps} />)

      const input = screen.getByPlaceholderText('Search pages...')
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } })
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(200)
      })

      const options = screen.getAllByRole('option')
      expect(options.length).toBe(3)

      // Click on the first result
      await act(async () => {
        fireEvent.click(options[0])
      })

      expect(defaultProps.onSelectNote).toHaveBeenCalledWith('1')
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('calls onClose when clicking the overlay', () => {
      render(<SearchPanel {...defaultProps} />)

      const overlay = document.querySelector('.search-panel-overlay')
      expect(overlay).toBeInTheDocument()

      fireEvent.click(overlay!)

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('does not close when clicking inside the content area', () => {
      render(<SearchPanel {...defaultProps} />)

      const content = document.querySelector('.search-panel-content')
      expect(content).toBeInTheDocument()

      fireEvent.click(content!)

      expect(defaultProps.onClose).not.toHaveBeenCalled()
    })
  })

  describe('Search Input Triggers', () => {
    it('triggers search on input change', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      vi.mocked(api.searchNotes).mockResolvedValue(mockNotes)

      render(<SearchPanel {...defaultProps} />)

      const input = screen.getByPlaceholderText('Search pages...')
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test query' } })
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(200)
      })

      expect(api.searchNotes).toHaveBeenCalledWith('test query')
    })

    it('does not trigger search for empty query', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })

      render(<SearchPanel {...defaultProps} />)

      const input = screen.getByPlaceholderText('Search pages...')
      await act(async () => {
        fireEvent.change(input, { target: { value: '   ' } })
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(200)
      })

      expect(api.searchNotes).not.toHaveBeenCalled()
    })
  })

  describe('Debouncing', () => {
    it('debounces search calls (150ms)', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      vi.mocked(api.searchNotes).mockResolvedValue(mockNotes)

      render(<SearchPanel {...defaultProps} />)

      const input = screen.getByPlaceholderText('Search pages...')

      // Type rapidly
      await act(async () => {
        fireEvent.change(input, { target: { value: 't' } })
        fireEvent.change(input, { target: { value: 'te' } })
        fireEvent.change(input, { target: { value: 'tes' } })
        fireEvent.change(input, { target: { value: 'test' } })
      })

      // Advance partway through debounce
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100)
      })

      // Search should not have been called yet
      expect(api.searchNotes).not.toHaveBeenCalled()

      // Advance past debounce timer
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100)
      })

      // Now search should be called only once with final value
      expect(api.searchNotes).toHaveBeenCalledTimes(1)
      expect(api.searchNotes).toHaveBeenCalledWith('test')
    })

    it('resets debounce timer on new input', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      vi.mocked(api.searchNotes).mockResolvedValue(mockNotes)

      render(<SearchPanel {...defaultProps} />)

      const input = screen.getByPlaceholderText('Search pages...')

      await act(async () => {
        fireEvent.change(input, { target: { value: 'first' } })
      })

      // Advance 100ms (not enough for debounce)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100)
      })

      // Type again - should reset debounce
      await act(async () => {
        fireEvent.change(input, { target: { value: 'second' } })
      })

      // Advance another 100ms
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100)
      })

      // Still not called
      expect(api.searchNotes).not.toHaveBeenCalled()

      // Advance past full debounce from last input
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100)
      })

      expect(api.searchNotes).toHaveBeenCalledTimes(1)
      expect(api.searchNotes).toHaveBeenCalledWith('second')
    })
  })

  describe('Loading State', () => {
    it('shows loading state during search', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })

      // Create a promise we can control
      let resolveSearch: (value: Note[]) => void
      const searchPromise = new Promise<Note[]>((resolve) => {
        resolveSearch = resolve
      })
      vi.mocked(api.searchNotes).mockReturnValue(searchPromise)

      render(<SearchPanel {...defaultProps} />)

      const input = screen.getByPlaceholderText('Search pages...')
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } })
      })

      // After typing, loading should appear immediately
      expect(screen.getByText('Searching...')).toBeInTheDocument()

      // Advance past debounce
      await act(async () => {
        await vi.advanceTimersByTimeAsync(200)
      })

      // Loading should still be shown while waiting for API
      expect(screen.getByText('Searching...')).toBeInTheDocument()

      // Resolve the search
      await act(async () => {
        resolveSearch!(mockNotes)
      })

      // Loading should disappear
      expect(screen.queryByText('Searching...')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles search API error gracefully', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(api.searchNotes).mockRejectedValue(new Error('API Error'))

      render(<SearchPanel {...defaultProps} />)

      const input = screen.getByPlaceholderText('Search pages...')
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } })
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(200)
      })

      expect(consoleError).toHaveBeenCalledWith('Search failed:', expect.any(Error))

      // Should show empty results, not crash
      expect(screen.getByText('No pages found for "test"')).toBeInTheDocument()

      consoleError.mockRestore()
    })

    it('clears results on error', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      vi.spyOn(console, 'error').mockImplementation(() => {})

      // First search succeeds
      vi.mocked(api.searchNotes).mockResolvedValueOnce(mockNotes)

      render(<SearchPanel {...defaultProps} />)

      const input = screen.getByPlaceholderText('Search pages...')
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } })
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(200)
      })

      expect(screen.getByText('Project Plan')).toBeInTheDocument()

      // Second search fails
      vi.mocked(api.searchNotes).mockRejectedValueOnce(new Error('Network error'))
      await act(async () => {
        fireEvent.change(input, { target: { value: 'another test' } })
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(200)
      })

      expect(screen.queryByText('Project Plan')).not.toBeInTheDocument()
    })
  })

  describe('Clear Button', () => {
    it('shows clear button when query is entered', () => {
      render(<SearchPanel {...defaultProps} />)

      const input = screen.getByPlaceholderText('Search pages...')

      // No clear button initially
      expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument()

      fireEvent.change(input, { target: { value: 'test' } })

      expect(screen.getByLabelText('Clear search')).toBeInTheDocument()
    })

    it('clears search query when clear button is clicked', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      vi.mocked(api.searchNotes).mockResolvedValue(mockNotes)

      render(<SearchPanel {...defaultProps} />)

      const input = screen.getByPlaceholderText('Search pages...')
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } })
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(200)
      })

      expect(screen.getByText('Project Plan')).toBeInTheDocument()

      const clearButton = screen.getByLabelText('Clear search')
      await act(async () => {
        fireEvent.click(clearButton)
      })

      expect(input).toHaveValue('')
      expect(screen.queryByText('Project Plan')).not.toBeInTheDocument()
      expect(screen.getByText('Start typing to search across your pages')).toBeInTheDocument()
    })

    it('hides clear button after clearing', () => {
      render(<SearchPanel {...defaultProps} />)

      const input = screen.getByPlaceholderText('Search pages...')
      fireEvent.change(input, { target: { value: 'test' } })

      const clearButton = screen.getByLabelText('Clear search')
      fireEvent.click(clearButton)

      expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    it('navigates down through results with ArrowDown', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      vi.mocked(api.searchNotes).mockResolvedValue(mockNotes)

      render(<SearchPanel {...defaultProps} />)

      const input = screen.getByPlaceholderText('Search pages...')
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } })
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(200)
      })

      expect(screen.getAllByRole('option').length).toBe(3)

      // First result should be selected initially
      expect(screen.getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true')

      // Press ArrowDown
      await act(async () => {
        fireEvent.keyDown(window, { key: 'ArrowDown' })
      })

      expect(screen.getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true')

      // Press ArrowDown again
      await act(async () => {
        fireEvent.keyDown(window, { key: 'ArrowDown' })
      })

      expect(screen.getAllByRole('option')[2]).toHaveAttribute('aria-selected', 'true')
    })

    it('navigates up through results with ArrowUp', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      vi.mocked(api.searchNotes).mockResolvedValue(mockNotes)

      render(<SearchPanel {...defaultProps} />)

      const input = screen.getByPlaceholderText('Search pages...')
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } })
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(200)
      })

      expect(screen.getAllByRole('option').length).toBe(3)

      // Navigate to last item first
      await act(async () => {
        fireEvent.keyDown(window, { key: 'ArrowDown' })
        fireEvent.keyDown(window, { key: 'ArrowDown' })
      })

      expect(screen.getAllByRole('option')[2]).toHaveAttribute('aria-selected', 'true')

      // Navigate back up
      await act(async () => {
        fireEvent.keyDown(window, { key: 'ArrowUp' })
      })

      expect(screen.getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true')
    })

    it('does not navigate past first result', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      vi.mocked(api.searchNotes).mockResolvedValue(mockNotes)

      render(<SearchPanel {...defaultProps} />)

      const input = screen.getByPlaceholderText('Search pages...')
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } })
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(200)
      })

      expect(screen.getAllByRole('option').length).toBe(3)

      // Try to navigate up from first item
      await act(async () => {
        fireEvent.keyDown(window, { key: 'ArrowUp' })
      })

      // Should still be on first item
      expect(screen.getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true')
    })

    it('does not navigate past last result', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      vi.mocked(api.searchNotes).mockResolvedValue(mockNotes)

      render(<SearchPanel {...defaultProps} />)

      const input = screen.getByPlaceholderText('Search pages...')
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } })
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(200)
      })

      expect(screen.getAllByRole('option').length).toBe(3)

      // Navigate to last item
      await act(async () => {
        fireEvent.keyDown(window, { key: 'ArrowDown' })
        fireEvent.keyDown(window, { key: 'ArrowDown' })
        fireEvent.keyDown(window, { key: 'ArrowDown' }) // Try to go past last
      })

      // Should still be on last item
      expect(screen.getAllByRole('option')[2]).toHaveAttribute('aria-selected', 'true')
    })

    it('selects current result with Enter key', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      vi.mocked(api.searchNotes).mockResolvedValue(mockNotes)

      render(<SearchPanel {...defaultProps} />)

      const input = screen.getByPlaceholderText('Search pages...')
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } })
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(200)
      })

      expect(screen.getAllByRole('option').length).toBe(3)

      // Navigate to second result
      await act(async () => {
        fireEvent.keyDown(window, { key: 'ArrowDown' })
      })

      // Press Enter
      await act(async () => {
        fireEvent.keyDown(window, { key: 'Enter' })
      })

      expect(defaultProps.onSelectNote).toHaveBeenCalledWith('2')
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('closes panel with Escape key', () => {
      render(<SearchPanel {...defaultProps} />)

      fireEvent.keyDown(window, { key: 'Escape' })

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('updates selection on mouse enter', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      vi.mocked(api.searchNotes).mockResolvedValue(mockNotes)

      render(<SearchPanel {...defaultProps} />)

      const input = screen.getByPlaceholderText('Search pages...')
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } })
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(200)
      })

      expect(screen.getAllByRole('option').length).toBe(3)

      // First item is selected
      expect(screen.getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true')

      // Hover over third item
      await act(async () => {
        fireEvent.mouseEnter(screen.getAllByRole('option')[2])
      })

      // Third item should now be selected
      expect(screen.getAllByRole('option')[2]).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('Scope Dropdown', () => {
    it('shows project name in scope dropdown when project is selected', () => {
      render(<SearchPanel {...defaultProps} currentProject={mockProject} />)

      expect(screen.getByText('Test Project')).toBeInTheDocument()
    })

    it('opens scope dropdown on click', () => {
      render(<SearchPanel {...defaultProps} currentProject={mockProject} />)

      const scopeButton = screen.getByRole('button', { expanded: false })
      fireEvent.click(scopeButton)

      expect(screen.getByRole('listbox')).toBeInTheDocument()
      expect(screen.getAllByRole('option').length).toBeGreaterThan(0)
    })

    it('filters results by project scope', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })

      const projectNotes = [mockNotes[0]] // Only first note in project
      vi.mocked(api.searchNotes).mockResolvedValue(mockNotes)
      vi.mocked(api.getProjectNotes).mockResolvedValue(projectNotes)

      render(<SearchPanel {...defaultProps} currentProject={mockProject} />)

      const input = screen.getByPlaceholderText('Search pages...')
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } })
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(200)
      })

      // Should only show the project note
      expect(screen.getByText('Project Plan')).toBeInTheDocument()
      expect(screen.queryByText('Meeting Notes')).not.toBeInTheDocument()
      expect(screen.queryByText('Research Paper')).not.toBeInTheDocument()
    })

    it('switches to All Pages scope when selected', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })

      const projectNotes = [mockNotes[0]]
      vi.mocked(api.searchNotes).mockResolvedValue(mockNotes)
      vi.mocked(api.getProjectNotes).mockResolvedValue(projectNotes)

      render(<SearchPanel {...defaultProps} currentProject={mockProject} />)

      const input = screen.getByPlaceholderText('Search pages...')
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } })
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(200)
      })

      // Open scope dropdown and select All Pages
      const scopeButton = screen.getByRole('button', { expanded: false })
      await act(async () => {
        fireEvent.click(scopeButton)
      })

      const allPagesOption = screen.getByRole('option', { name: 'All Pages' })
      await act(async () => {
        fireEvent.click(allPagesOption)
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(200)
      })

      // Should show all notes now
      expect(screen.getByText('Project Plan')).toBeInTheDocument()
      expect(screen.getByText('Meeting Notes')).toBeInTheDocument()
      expect(screen.getByText('Research Paper')).toBeInTheDocument()
    })
  })

  describe('Panel Reset on Open', () => {
    it('resets query when panel opens', () => {
      const { rerender } = render(<SearchPanel {...defaultProps} isOpen={false} />)

      rerender(<SearchPanel {...defaultProps} isOpen={true} />)

      const input = screen.getByPlaceholderText('Search pages...')
      expect(input).toHaveValue('')
    })

    it('resets results when panel opens', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      vi.mocked(api.searchNotes).mockResolvedValue(mockNotes)

      const { rerender } = render(<SearchPanel {...defaultProps} />)

      const input = screen.getByPlaceholderText('Search pages...')
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } })
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(200)
      })

      expect(screen.getByText('Project Plan')).toBeInTheDocument()

      // Close and reopen
      await act(async () => {
        rerender(<SearchPanel {...defaultProps} isOpen={false} />)
      })
      await act(async () => {
        rerender(<SearchPanel {...defaultProps} isOpen={true} />)
      })

      expect(screen.queryByText('Project Plan')).not.toBeInTheDocument()
      expect(screen.getByText('Start typing to search across your pages')).toBeInTheDocument()
    })

    it('resets selected index when panel opens', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      vi.mocked(api.searchNotes).mockResolvedValue(mockNotes)

      const { rerender } = render(<SearchPanel {...defaultProps} />)

      const input = screen.getByPlaceholderText('Search pages...')
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } })
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(200)
      })

      expect(screen.getAllByRole('option').length).toBe(3)

      // Navigate to second result
      await act(async () => {
        fireEvent.keyDown(window, { key: 'ArrowDown' })
      })
      expect(screen.getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true')

      // Close and reopen
      await act(async () => {
        rerender(<SearchPanel {...defaultProps} isOpen={false} />)
      })
      await act(async () => {
        rerender(<SearchPanel {...defaultProps} isOpen={true} />)
      })

      await act(async () => {
        fireEvent.change(screen.getByPlaceholderText('Search pages...'), { target: { value: 'test' } })
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(200)
      })

      expect(screen.getAllByRole('option').length).toBe(3)

      // First item should be selected again
      expect(screen.getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('Untitled Notes', () => {
    it('displays "Untitled" for notes without title', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const notesWithUntitled: Note[] = [
        {
          id: '1',
          title: '',
          content: 'Some content',
          folder: 'inbox',
          project_id: null,
          created_at: Date.now(),
          updated_at: Date.now(),
          deleted_at: null
        }
      ]
      vi.mocked(api.searchNotes).mockResolvedValue(notesWithUntitled)

      render(<SearchPanel {...defaultProps} />)

      const input = screen.getByPlaceholderText('Search pages...')
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } })
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(200)
      })

      expect(screen.getByText('Untitled')).toBeInTheDocument()
    })
  })
})
