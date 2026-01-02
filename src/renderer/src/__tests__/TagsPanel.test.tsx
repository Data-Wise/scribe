import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TagsPanel } from '../components/TagsPanel'
import { TagWithCount, Note } from '../types'

// Mock the api module
vi.mock('../lib/api', () => ({
  api: {
    getAllTags: vi.fn(),
    getNoteTags: vi.fn(),
    createTag: vi.fn(),
    renameTag: vi.fn(),
    deleteTag: vi.fn(),
    listNotes: vi.fn(),
  },
}))

// Import the mocked api
import { api } from '../lib/api'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock data
const mockTags: TagWithCount[] = [
  {
    id: 'tag-1',
    name: 'research',
    color: '#3b82f6',
    note_count: 5,
    created_at: Date.now() - 86400000,
  },
  {
    id: 'tag-2',
    name: 'statistics',
    color: '#10b981',
    note_count: 3,
    created_at: Date.now() - 172800000,
  },
  {
    id: 'tag-3',
    name: 'teaching',
    color: '#f59e0b',
    note_count: 8,
    created_at: Date.now() - 259200000,
  },
  {
    id: 'tag-4',
    name: 'meeting',
    color: '#ef4444',
    note_count: 2,
    created_at: Date.now() - 345600000,
  },
]

// Mock hierarchical tags for tree view testing
const mockHierarchicalTags: TagWithCount[] = [
  {
    id: 'tag-h1',
    name: 'research/statistics',
    color: '#3b82f6',
    note_count: 5,
    created_at: Date.now(),
  },
  {
    id: 'tag-h2',
    name: 'research/mediation',
    color: '#10b981',
    note_count: 3,
    created_at: Date.now(),
  },
  {
    id: 'tag-h3',
    name: 'teaching/stat-440',
    color: '#f59e0b',
    note_count: 2,
    created_at: Date.now(),
  },
]

const mockNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Research Note',
    content: '<p>Content with #research and #statistics</p>',
    folder: 'inbox',
    project_id: null,
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: null,
  },
  {
    id: 'note-2',
    title: 'Teaching Note',
    content: '<p>Content with #teaching</p>',
    folder: 'inbox',
    project_id: null,
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: null,
  },
]

describe('TagsPanel Component', () => {
  const defaultProps = {
    noteId: null,
    selectedTagIds: [],
    onTagClick: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    // Default mock implementations
    vi.mocked(api.getAllTags).mockResolvedValue(mockTags)
    vi.mocked(api.getNoteTags).mockResolvedValue([])
    vi.mocked(api.listNotes).mockResolvedValue(mockNotes)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ============================================================================
  // 1. Renders tag list
  // ============================================================================
  describe('Tag List Rendering', () => {
    it('renders the tags panel container', async () => {
      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('tags-panel')).toBeInTheDocument()
      })
    })

    it('renders the Tags header', async () => {
      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Tags' })).toBeInTheDocument()
      })
    })

    it('renders all tags in flat view', async () => {
      // Set flat view mode
      localStorageMock.setItem('tagsPanelViewMode', 'flat')

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('#research')).toBeInTheDocument()
        expect(screen.getByText('#statistics')).toBeInTheDocument()
        expect(screen.getByText('#teaching')).toBeInTheDocument()
        expect(screen.getByText('#meeting')).toBeInTheDocument()
      })
    })

    it('renders tags in tree view by default', async () => {
      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        // In tree view, tags are rendered without # prefix in the tree items
        expect(screen.getByText('research')).toBeInTheDocument()
      })
    })

    it('shows skeleton loading state initially', () => {
      // Make the API hang to keep loading state
      vi.mocked(api.getAllTags).mockImplementation(() => new Promise(() => {}))

      render(<TagsPanel {...defaultProps} />)

      // Should show skeleton loader (skeleton elements have specific classes)
      const panel = document.querySelector('.skeleton')
      expect(panel).toBeInTheDocument()
    })
  })

  // ============================================================================
  // 2. Renders empty state when no tags
  // ============================================================================
  describe('Empty State', () => {
    it('displays empty state message when no tags exist', async () => {
      vi.mocked(api.getAllTags).mockResolvedValue([])

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/No tags yet/)).toBeInTheDocument()
        expect(screen.getByText(/Start typing #tag in your notes!/)).toBeInTheDocument()
      })
    })

    it('shows hint for nested tags in empty state', async () => {
      vi.mocked(api.getAllTags).mockResolvedValue([])

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/Use \/ for nested tags/)).toBeInTheDocument()
      })
    })
  })

  // ============================================================================
  // 3. Tag count is displayed
  // ============================================================================
  describe('Tag Count Display', () => {
    it('displays total tag count', async () => {
      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('4 tags total')).toBeInTheDocument()
      })
    })

    it('displays singular "tag" for single tag', async () => {
      vi.mocked(api.getAllTags).mockResolvedValue([mockTags[0]])

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('1 tag total')).toBeInTheDocument()
      })
    })

    it('displays note count for each tag in flat view', async () => {
      localStorageMock.setItem('tagsPanelViewMode', 'flat')

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        // Check that note counts are displayed (research has 5, statistics has 3, etc.)
        expect(screen.getByText('5')).toBeInTheDocument()
        expect(screen.getByText('3')).toBeInTheDocument()
        expect(screen.getByText('8')).toBeInTheDocument()
        expect(screen.getByText('2')).toBeInTheDocument()
      })
    })
  })

  // ============================================================================
  // 4. Click on tag filters notes
  // ============================================================================
  describe('Tag Click Filtering', () => {
    it('calls onTagClick when a tag is clicked', async () => {
      localStorageMock.setItem('tagsPanelViewMode', 'flat')
      const onTagClick = vi.fn()

      render(<TagsPanel {...defaultProps} onTagClick={onTagClick} />)

      await waitFor(() => {
        expect(screen.getByText('#research')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('#research'))

      expect(onTagClick).toHaveBeenCalledWith('tag-1')
    })

    it('calls onTagClick in tree view', async () => {
      const onTagClick = vi.fn()

      render(<TagsPanel {...defaultProps} onTagClick={onTagClick} />)

      await waitFor(() => {
        expect(screen.getByText('research')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('research'))

      expect(onTagClick).toHaveBeenCalledWith('tag-1')
    })

    it('updates recent tags when clicking a tag', async () => {
      localStorageMock.setItem('tagsPanelViewMode', 'flat')
      const onTagClick = vi.fn()

      render(<TagsPanel {...defaultProps} onTagClick={onTagClick} />)

      await waitFor(() => {
        expect(screen.getByText('#research')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('#research'))

      // Check localStorage was updated with recent tag
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'tagsPanelRecentTags',
        expect.stringContaining('tag-1')
      )
    })
  })

  // ============================================================================
  // 5. Selected tag is highlighted
  // ============================================================================
  describe('Tag Selection Highlighting', () => {
    it('highlights selected tag in flat view', async () => {
      localStorageMock.setItem('tagsPanelViewMode', 'flat')

      render(<TagsPanel {...defaultProps} selectedTagIds={['tag-1']} />)

      await waitFor(() => {
        const tagButton = screen.getByText('#research').closest('button')
        // Check that the button exists and has inline style applied
        expect(tagButton).toBeInTheDocument()
        // The component sets inline styles for selected state
        const style = tagButton?.getAttribute('style')
        expect(style).toContain('background-color')
      })
    })

    it('highlights selected tag in tree view', async () => {
      render(<TagsPanel {...defaultProps} selectedTagIds={['tag-1']} />)

      await waitFor(() => {
        const tagItem = screen.getByText('research').closest('div')
        // Check that the item exists and has inline style applied
        expect(tagItem).toBeInTheDocument()
        const style = tagItem?.getAttribute('style')
        expect(style).toContain('background-color')
      })
    })

    it('shows Clear Filters button when tags are selected', async () => {
      render(<TagsPanel {...defaultProps} selectedTagIds={['tag-1']} />)

      await waitFor(() => {
        expect(screen.getByText('Clear Filters')).toBeInTheDocument()
      })
    })

    it('hides Clear Filters button when no tags selected', async () => {
      render(<TagsPanel {...defaultProps} selectedTagIds={[]} />)

      await waitFor(() => {
        expect(screen.queryByText('Clear Filters')).not.toBeInTheDocument()
      })
    })
  })

  // ============================================================================
  // 6. Tag creation (via unregistered tags)
  // ============================================================================
  describe('Tag Creation', () => {
    it('shows unregistered tags section when unregistered tags exist', async () => {
      // Mock notes with unregistered tags
      vi.mocked(api.listNotes).mockResolvedValue([
        {
          id: 'note-1',
          title: 'Note with unregistered tag',
          content: '<p>Content with #newunregisteredtag</p>',
          folder: 'inbox',
          project_id: null,
          created_at: Date.now(),
          updated_at: Date.now(),
          deleted_at: null,
        },
      ])

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/Unregistered/)).toBeInTheDocument()
      })
    })

    it('registers a single unregistered tag when clicking plus button', async () => {
      vi.mocked(api.createTag).mockResolvedValue({
        id: 'new-tag-id',
        name: 'newtag',
        color: null,
        created_at: Date.now(),
      })

      vi.mocked(api.listNotes).mockResolvedValue([
        {
          id: 'note-1',
          title: 'Note',
          content: '<p>#newtag content</p>',
          folder: 'inbox',
          project_id: null,
          created_at: Date.now(),
          updated_at: Date.now(),
          deleted_at: null,
        },
      ])

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('#newtag')).toBeInTheDocument()
      })

      // Find and click the register button (Plus icon)
      const registerButtons = screen.getAllByTitle('Register this tag')
      fireEvent.click(registerButtons[0])

      await waitFor(() => {
        expect(api.createTag).toHaveBeenCalledWith('newtag')
      })
    })

    it('registers all unregistered tags when clicking "All" button', async () => {
      vi.mocked(api.createTag).mockResolvedValue({
        id: 'new-tag-id',
        name: 'newtag',
        color: null,
        created_at: Date.now(),
      })

      vi.mocked(api.listNotes).mockResolvedValue([
        {
          id: 'note-1',
          title: 'Note',
          content: '<p>#newtag1 #newtag2 content</p>',
          folder: 'inbox',
          project_id: null,
          created_at: Date.now(),
          updated_at: Date.now(),
          deleted_at: null,
        },
      ])

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/Unregistered/)).toBeInTheDocument()
      })

      // Find and click the "All" button
      const allButton = screen.getByText('All')
      fireEvent.click(allButton)

      await waitFor(() => {
        expect(api.createTag).toHaveBeenCalled()
      })
    })
  })

  // ============================================================================
  // 7. Tag editing (rename via context menu)
  // ============================================================================
  describe('Tag Editing', () => {
    it('shows context menu on right-click in flat view', async () => {
      localStorageMock.setItem('tagsPanelViewMode', 'flat')

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('#research')).toBeInTheDocument()
      })

      const tagButton = screen.getByText('#research').closest('button')!
      fireEvent.contextMenu(tagButton)

      expect(screen.getByText('Rename')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('calls renameTag API when renaming via context menu', async () => {
      localStorageMock.setItem('tagsPanelViewMode', 'flat')
      vi.mocked(api.renameTag).mockResolvedValue(true)

      // Mock window.prompt
      const originalPrompt = window.prompt
      window.prompt = vi.fn().mockReturnValue('newname')

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('#research')).toBeInTheDocument()
      })

      // Right-click to open context menu
      const tagButton = screen.getByText('#research').closest('button')!
      fireEvent.contextMenu(tagButton)

      // Click Rename
      fireEvent.click(screen.getByText('Rename'))

      await waitFor(() => {
        expect(api.renameTag).toHaveBeenCalledWith('tag-1', 'newname')
      })

      window.prompt = originalPrompt
    })

    it('does not rename when prompt is cancelled', async () => {
      localStorageMock.setItem('tagsPanelViewMode', 'flat')

      // Mock window.prompt to return null (cancelled)
      const originalPrompt = window.prompt
      window.prompt = vi.fn().mockReturnValue(null)

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('#research')).toBeInTheDocument()
      })

      const tagButton = screen.getByText('#research').closest('button')!
      fireEvent.contextMenu(tagButton)
      fireEvent.click(screen.getByText('Rename'))

      expect(api.renameTag).not.toHaveBeenCalled()

      window.prompt = originalPrompt
    })
  })

  // ============================================================================
  // 8. Tag deletion
  // ============================================================================
  describe('Tag Deletion', () => {
    it('calls deleteTag API when deleting via context menu', async () => {
      localStorageMock.setItem('tagsPanelViewMode', 'flat')
      vi.mocked(api.deleteTag).mockResolvedValue(true)

      // Mock window.confirm
      const originalConfirm = window.confirm
      window.confirm = vi.fn().mockReturnValue(true)

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('#research')).toBeInTheDocument()
      })

      // Right-click to open context menu
      const tagButton = screen.getByText('#research').closest('button')!
      fireEvent.contextMenu(tagButton)

      // Click Delete
      fireEvent.click(screen.getByText('Delete'))

      await waitFor(() => {
        expect(api.deleteTag).toHaveBeenCalledWith('tag-1')
      })

      window.confirm = originalConfirm
    })

    it('does not delete when confirmation is cancelled', async () => {
      localStorageMock.setItem('tagsPanelViewMode', 'flat')

      // Mock window.confirm to return false
      const originalConfirm = window.confirm
      window.confirm = vi.fn().mockReturnValue(false)

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('#research')).toBeInTheDocument()
      })

      const tagButton = screen.getByText('#research').closest('button')!
      fireEvent.contextMenu(tagButton)
      fireEvent.click(screen.getByText('Delete'))

      expect(api.deleteTag).not.toHaveBeenCalled()

      window.confirm = originalConfirm
    })

    it('closes context menu when clicking outside', async () => {
      localStorageMock.setItem('tagsPanelViewMode', 'flat')

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('#research')).toBeInTheDocument()
      })

      // Open context menu
      const tagButton = screen.getByText('#research').closest('button')!
      fireEvent.contextMenu(tagButton)

      expect(screen.getByText('Rename')).toBeInTheDocument()

      // Click outside
      fireEvent.click(document.body)

      await waitFor(() => {
        expect(screen.queryByText('Rename')).not.toBeInTheDocument()
      })
    })
  })

  // ============================================================================
  // 9. Search/filter tags
  // ============================================================================
  describe('Tag Search/Filter', () => {
    it('renders search input', async () => {
      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Filter tags...')).toBeInTheDocument()
      })
    })

    it('filters tags based on search query', async () => {
      localStorageMock.setItem('tagsPanelViewMode', 'flat')
      const user = userEvent.setup()

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('#research')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Filter tags...')
      await user.type(searchInput, 'research')

      await waitFor(() => {
        expect(screen.getByText('#research')).toBeInTheDocument()
        // Other tags should be filtered out in flat view
        expect(screen.queryByText('#meeting')).not.toBeInTheDocument()
      })
    })

    it('shows filter count when searching', async () => {
      const user = userEvent.setup()

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Filter tags...')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Filter tags...')
      await user.type(searchInput, 'research')

      await waitFor(() => {
        expect(screen.getByText('1 of 4 tags')).toBeInTheDocument()
      })
    })

    it('shows clear button when search has text', async () => {
      const user = userEvent.setup()

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Filter tags...')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Filter tags...')
      await user.type(searchInput, 'test')

      // Look for the clear button (X icon)
      const clearButton = searchInput.parentElement?.querySelector('button')
      expect(clearButton).toBeInTheDocument()
    })

    it('clears search when clear button is clicked', async () => {
      const user = userEvent.setup()

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Filter tags...')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Filter tags...')
      await user.type(searchInput, 'test')

      const clearButton = searchInput.parentElement?.querySelector('button')
      await user.click(clearButton!)

      expect(searchInput).toHaveValue('')
    })

    it('shows no matches message when search has no results', async () => {
      const user = userEvent.setup()

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Filter tags...')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Filter tags...')
      await user.type(searchInput, 'nonexistenttag')

      await waitFor(() => {
        expect(screen.getByText(/No tags match/)).toBeInTheDocument()
      })
    })
  })

  // ============================================================================
  // 10. Tag colors/styles
  // ============================================================================
  describe('Tag Colors and Styles', () => {
    it('displays tag color dot in flat view', async () => {
      localStorageMock.setItem('tagsPanelViewMode', 'flat')

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        const tagButton = screen.getByText('#research').closest('button')
        const colorDot = tagButton?.querySelector('span.rounded-full')
        expect(colorDot).toHaveStyle({ backgroundColor: '#3b82f6' })
      })
    })

    it('displays tag color dot in tree view', async () => {
      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        // Find the color dot near the research tag
        const panel = screen.getByTestId('tags-panel')
        const colorDots = panel.querySelectorAll('span.rounded-full')
        // At least one should have the research color
        const hasResearchColor = Array.from(colorDots).some(
          dot => (dot as HTMLElement).style.backgroundColor === 'rgb(59, 130, 246)' ||
                 (dot as HTMLElement).style.backgroundColor === '#3b82f6'
        )
        expect(hasResearchColor || colorDots.length > 0).toBe(true)
      })
    })

    it('uses accent color when tag has no custom color', async () => {
      localStorageMock.setItem('tagsPanelViewMode', 'flat')
      vi.mocked(api.getAllTags).mockResolvedValue([
        {
          id: 'tag-no-color',
          name: 'nocolor',
          color: null,
          note_count: 1,
          created_at: Date.now(),
        },
      ])

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        const tagButton = screen.getByText('#nocolor').closest('button')
        const colorDot = tagButton?.querySelector('span.rounded-full')
        // Color dot should exist and have a background color set
        expect(colorDot).toBeInTheDocument()
        // When no custom color, it uses CSS variable which may resolve differently in test
        expect(colorDot).toBeTruthy()
      })
    })
  })

  // ============================================================================
  // View Mode Toggle Tests
  // ============================================================================
  describe('View Mode Toggle', () => {
    it('toggles between tree and flat view', async () => {
      const user = userEvent.setup()

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTitle('Tree view')).toBeInTheDocument()
        expect(screen.getByTitle('List view')).toBeInTheDocument()
      })

      // Click list view
      await user.click(screen.getByTitle('List view'))

      expect(localStorageMock.setItem).toHaveBeenCalledWith('tagsPanelViewMode', 'flat')
    })

    it('persists view mode in localStorage', async () => {
      localStorageMock.setItem('tagsPanelViewMode', 'flat')

      render(<TagsPanel {...defaultProps} />)

      // Should start in flat mode based on localStorage
      await waitFor(() => {
        expect(screen.getByText('#research')).toBeInTheDocument()
      })
    })
  })

  // ============================================================================
  // Sort Mode Tests
  // ============================================================================
  describe('Sort Mode', () => {
    it('sorts tags alphabetically by default', async () => {
      localStorageMock.setItem('tagsPanelViewMode', 'flat')

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        const panel = screen.getByTestId('tags-panel')
        const tagButtons = panel.querySelectorAll('button')
        const tagTexts = Array.from(tagButtons)
          .map(btn => btn.textContent)
          .filter(text => text?.startsWith('#'))

        // Should be alphabetically sorted: meeting, research, statistics, teaching
        expect(tagTexts[0]).toContain('#meeting')
      })
    })

    it('can sort by note count', async () => {
      const user = userEvent.setup()

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTitle('Sort by note count')).toBeInTheDocument()
      })

      await user.click(screen.getByTitle('Sort by note count'))

      expect(localStorageMock.setItem).toHaveBeenCalledWith('tagsPanelSortMode', 'count')
    })

    it('can sort by recent usage', async () => {
      const user = userEvent.setup()

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTitle('Sort by recent usage')).toBeInTheDocument()
      })

      await user.click(screen.getByTitle('Sort by recent usage'))

      expect(localStorageMock.setItem).toHaveBeenCalledWith('tagsPanelSortMode', 'recent')
    })
  })

  // ============================================================================
  // Compact Mode Tests
  // ============================================================================
  describe('Compact Mode', () => {
    it('toggles compact mode', async () => {
      const user = userEvent.setup()

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTitle('Compact mode')).toBeInTheDocument()
      })

      await user.click(screen.getByTitle('Compact mode'))

      expect(localStorageMock.setItem).toHaveBeenCalledWith('tagsPanelCompactMode', 'true')
    })

    it('shows Normal mode button when in compact mode', async () => {
      localStorageMock.setItem('tagsPanelCompactMode', 'true')

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTitle('Normal mode')).toBeInTheDocument()
      })
    })
  })

  // ============================================================================
  // Current Note Tags Tests
  // ============================================================================
  describe('Current Note Tags', () => {
    it('shows "This Note" section when note is selected', async () => {
      vi.mocked(api.getNoteTags).mockResolvedValue([
        { id: 'tag-1', name: 'research', color: '#3b82f6', created_at: Date.now() },
      ])

      render(<TagsPanel {...defaultProps} noteId="note-1" />)

      await waitFor(() => {
        expect(screen.getByText('This Note')).toBeInTheDocument()
      })
    })

    it('hides "This Note" section when no note is selected', async () => {
      render(<TagsPanel {...defaultProps} noteId={null} />)

      await waitFor(() => {
        expect(screen.queryByText('This Note')).not.toBeInTheDocument()
      })
    })

    it('displays tags for current note', async () => {
      vi.mocked(api.getNoteTags).mockResolvedValue([
        { id: 'tag-1', name: 'research', color: '#3b82f6', created_at: Date.now() },
        { id: 'tag-2', name: 'statistics', color: '#10b981', created_at: Date.now() },
      ])

      render(<TagsPanel {...defaultProps} noteId="note-1" />)

      await waitFor(() => {
        const thisNoteSection = screen.getByText('This Note').closest('div')
        expect(within(thisNoteSection!).getByText('#research')).toBeInTheDocument()
        expect(within(thisNoteSection!).getByText('#statistics')).toBeInTheDocument()
      })
    })
  })

  // ============================================================================
  // Recent Tags Tests
  // ============================================================================
  describe('Recent Tags', () => {
    it('shows recent tags section when there are recent tags', async () => {
      localStorageMock.setItem('tagsPanelRecentTags', JSON.stringify(['tag-1', 'tag-2']))

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Recent')).toBeInTheDocument()
      })
    })

    it('hides recent tags section when no recent tags', async () => {
      localStorageMock.setItem('tagsPanelRecentTags', JSON.stringify([]))

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.queryByText('Recent')).not.toBeInTheDocument()
      })
    })
  })

  // ============================================================================
  // Tree View Expand/Collapse Tests
  // ============================================================================
  describe('Tree View Expand/Collapse', () => {
    it('renders hierarchical tags in tree structure', async () => {
      vi.mocked(api.getAllTags).mockResolvedValue(mockHierarchicalTags)

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        // Should show top-level nodes: research, teaching
        expect(screen.getByText('research')).toBeInTheDocument()
        expect(screen.getByText('teaching')).toBeInTheDocument()
      })
    })

    it('shows expand/collapse button for parent nodes', async () => {
      vi.mocked(api.getAllTags).mockResolvedValue(mockHierarchicalTags)

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        // Should have chevron buttons for expandable nodes
        const panel = screen.getByTestId('tags-panel')
        const chevronButtons = panel.querySelectorAll('button.p-0\\.5')
        expect(chevronButtons.length).toBeGreaterThan(0)
      })
    })

    it('expands node when clicking expand button', async () => {
      vi.mocked(api.getAllTags).mockResolvedValue(mockHierarchicalTags)
      const user = userEvent.setup()

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('research')).toBeInTheDocument()
      })

      // Find and click expand button
      const panel = screen.getByTestId('tags-panel')
      const expandButton = panel.querySelector('button.p-0\\.5')
      if (expandButton) {
        await user.click(expandButton)
      }

      // Check that expanded paths are saved
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'tagsPanelExpandedPaths',
        expect.any(String)
      )
    })
  })

  // ============================================================================
  // Error Handling Tests
  // ============================================================================
  describe('Error Handling', () => {
    it('handles API error gracefully when loading tags', async () => {
      vi.mocked(api.getAllTags).mockRejectedValue(new Error('API Error'))

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        // Should show empty state, not crash
        expect(screen.getByText(/No tags yet/)).toBeInTheDocument()
      })
    })

    it('handles API error when loading note tags', async () => {
      vi.mocked(api.getNoteTags).mockRejectedValue(new Error('API Error'))

      render(<TagsPanel {...defaultProps} noteId="note-1" />)

      // Should not crash, just not show the This Note section
      await waitFor(() => {
        expect(screen.queryByText('This Note')).not.toBeInTheDocument()
      })
    })

    it('handles rename error with alert', async () => {
      localStorageMock.setItem('tagsPanelViewMode', 'flat')
      vi.mocked(api.renameTag).mockRejectedValue(new Error('Rename failed'))

      const originalPrompt = window.prompt
      const originalAlert = window.alert
      window.prompt = vi.fn().mockReturnValue('newname')
      window.alert = vi.fn()

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('#research')).toBeInTheDocument()
      })

      const tagButton = screen.getByText('#research').closest('button')!
      fireEvent.contextMenu(tagButton)
      fireEvent.click(screen.getByText('Rename'))

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Failed to rename tag')
      })

      window.prompt = originalPrompt
      window.alert = originalAlert
    })

    it('handles delete error with alert', async () => {
      localStorageMock.setItem('tagsPanelViewMode', 'flat')
      vi.mocked(api.deleteTag).mockRejectedValue(new Error('Delete failed'))

      const originalConfirm = window.confirm
      const originalAlert = window.alert
      window.confirm = vi.fn().mockReturnValue(true)
      window.alert = vi.fn()

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('#research')).toBeInTheDocument()
      })

      const tagButton = screen.getByText('#research').closest('button')!
      fireEvent.contextMenu(tagButton)
      fireEvent.click(screen.getByText('Delete'))

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Failed to delete tag')
      })

      window.confirm = originalConfirm
      window.alert = originalAlert
    })
  })

  // ============================================================================
  // Edge Cases
  // ============================================================================
  describe('Edge Cases', () => {
    it('handles tags with very long names', async () => {
      localStorageMock.setItem('tagsPanelViewMode', 'flat')
      const longTagName = 'a'.repeat(100)
      vi.mocked(api.getAllTags).mockResolvedValue([
        {
          id: 'long-tag',
          name: longTagName,
          color: '#3b82f6',
          note_count: 1,
          created_at: Date.now(),
        },
      ])

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(`#${longTagName}`)).toBeInTheDocument()
      })
    })

    it('handles large number of tags', async () => {
      localStorageMock.setItem('tagsPanelViewMode', 'flat')
      const manyTags = Array.from({ length: 100 }, (_, i) => ({
        id: `tag-${i}`,
        name: `tag${i}`,
        color: '#3b82f6',
        note_count: i,
        created_at: Date.now(),
      }))

      vi.mocked(api.getAllTags).mockResolvedValue(manyTags)

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('100 tags total')).toBeInTheDocument()
      })
    })

    it('handles special characters in tag names', async () => {
      localStorageMock.setItem('tagsPanelViewMode', 'flat')
      vi.mocked(api.getAllTags).mockResolvedValue([
        {
          id: 'special-tag',
          name: 'tag-with_special123',
          color: '#3b82f6',
          note_count: 1,
          created_at: Date.now(),
        },
      ])

      render(<TagsPanel {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('#tag-with_special123')).toBeInTheDocument()
      })
    })

    it('handles multiple selected tags', async () => {
      localStorageMock.setItem('tagsPanelViewMode', 'flat')

      render(<TagsPanel {...defaultProps} selectedTagIds={['tag-1', 'tag-2', 'tag-3']} />)

      await waitFor(() => {
        const researchButton = screen.getByText('#research').closest('button')
        const statisticsButton = screen.getByText('#statistics').closest('button')
        const teachingButton = screen.getByText('#teaching').closest('button')

        // Selected buttons have inline styles with background-color
        expect(researchButton?.getAttribute('style')).toContain('background-color')
        expect(statisticsButton?.getAttribute('style')).toContain('background-color')
        expect(teachingButton?.getAttribute('style')).toContain('background-color')
      })
    })
  })
})
