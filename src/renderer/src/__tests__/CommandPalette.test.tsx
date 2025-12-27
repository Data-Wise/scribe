import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommandPalette } from '../components/CommandPalette'

// Mock notes
const mockNotes = [
  { id: '1', title: 'Project Plan', content: '', folder: 'projects', created_at: Date.now(), updated_at: Date.now() },
  { id: '2', title: 'Meeting Notes', content: '', folder: 'inbox', created_at: Date.now(), updated_at: Date.now() },
  { id: '3', title: 'Research Paper', content: '', folder: 'resources', created_at: Date.now(), updated_at: Date.now() }
]

describe('CommandPalette Component', () => {
  const defaultProps = {
    open: true,
    setOpen: vi.fn(),
    notes: mockNotes,
    onSelectNote: vi.fn(),
    onCreateNote: vi.fn(),
    onDailyNote: vi.fn(),
    onToggleFocus: vi.fn(),
    onObsidianSync: vi.fn(),
    onRunClaude: vi.fn(),
    onRunGemini: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders when open is true', () => {
      render(<CommandPalette {...defaultProps} />)
      
      expect(screen.getByPlaceholderText('Search everything...')).toBeInTheDocument()
    })

    it('does not render when open is false', () => {
      render(<CommandPalette {...defaultProps} open={false} />)
      
      expect(screen.queryByPlaceholderText('Search everything...')).not.toBeInTheDocument()
    })

    it('renders all main action items', () => {
      render(<CommandPalette {...defaultProps} />)
      
      expect(screen.getByText('Create New Page')).toBeInTheDocument()
      expect(screen.getByText("Open Today's Journal")).toBeInTheDocument()
      expect(screen.getByText('Sync to Obsidian Vault')).toBeInTheDocument()
      expect(screen.getByText('Ask Claude (Refactor Notes)')).toBeInTheDocument()
      expect(screen.getByText('Ask Gemini (Brainstorming)')).toBeInTheDocument()
      expect(screen.getByText('Toggle Focus Mode')).toBeInTheDocument()
    })

    it('shows keyboard shortcuts', () => {
      render(<CommandPalette {...defaultProps} />)
      
      expect(screen.getByText('⌘N')).toBeInTheDocument()
      expect(screen.getByText('⌘D')).toBeInTheDocument()
      expect(screen.getByText('⌘⇧F')).toBeInTheDocument()
    })

    it('renders recent notes section', () => {
      render(<CommandPalette {...defaultProps} />)
      
      expect(screen.getByText('Recent Pages')).toBeInTheDocument()
      expect(screen.getByText('Project Plan')).toBeInTheDocument()
      expect(screen.getByText('Meeting Notes')).toBeInTheDocument()
      expect(screen.getByText('Research Paper')).toBeInTheDocument()
    })

    it('does not show recent notes section when no notes', () => {
      render(<CommandPalette {...defaultProps} notes={[]} />)
      
      expect(screen.queryByText('Recent Pages')).not.toBeInTheDocument()
    })

    it('shows "Main Actions" group heading', () => {
      render(<CommandPalette {...defaultProps} />)
      
      expect(screen.getByText('Main Actions')).toBeInTheDocument()
    })
  })

  describe('Actions', () => {
    it('calls onCreateNote and closes palette when clicking Create New Page', async () => {
      render(<CommandPalette {...defaultProps} />)
      
      fireEvent.click(screen.getByText('Create New Page'))
      
      expect(defaultProps.onCreateNote).toHaveBeenCalled()
      expect(defaultProps.setOpen).toHaveBeenCalledWith(false)
    })

    it('calls onDailyNote and closes palette when clicking Daily Note', async () => {
      render(<CommandPalette {...defaultProps} />)
      
      fireEvent.click(screen.getByText("Open Today's Journal"))
      
      expect(defaultProps.onDailyNote).toHaveBeenCalled()
      expect(defaultProps.setOpen).toHaveBeenCalledWith(false)
    })

    it('calls onToggleFocus and closes palette when clicking Toggle Focus Mode', async () => {
      render(<CommandPalette {...defaultProps} />)
      
      fireEvent.click(screen.getByText('Toggle Focus Mode'))
      
      expect(defaultProps.onToggleFocus).toHaveBeenCalled()
      expect(defaultProps.setOpen).toHaveBeenCalledWith(false)
    })

    it('calls onObsidianSync and closes palette when clicking Sync', async () => {
      render(<CommandPalette {...defaultProps} />)
      
      fireEvent.click(screen.getByText('Sync to Obsidian Vault'))
      
      expect(defaultProps.onObsidianSync).toHaveBeenCalled()
      expect(defaultProps.setOpen).toHaveBeenCalledWith(false)
    })

    it('calls onRunClaude and closes palette when clicking Ask Claude', async () => {
      render(<CommandPalette {...defaultProps} />)
      
      fireEvent.click(screen.getByText('Ask Claude (Refactor Notes)'))
      
      expect(defaultProps.onRunClaude).toHaveBeenCalled()
      expect(defaultProps.setOpen).toHaveBeenCalledWith(false)
    })

    it('calls onRunGemini and closes palette when clicking Ask Gemini', async () => {
      render(<CommandPalette {...defaultProps} />)
      
      fireEvent.click(screen.getByText('Ask Gemini (Brainstorming)'))
      
      expect(defaultProps.onRunGemini).toHaveBeenCalled()
      expect(defaultProps.setOpen).toHaveBeenCalledWith(false)
    })

    it('calls onSelectNote with correct id when clicking a note', async () => {
      render(<CommandPalette {...defaultProps} />)
      
      fireEvent.click(screen.getByText('Project Plan'))
      
      expect(defaultProps.onSelectNote).toHaveBeenCalledWith('1')
      expect(defaultProps.setOpen).toHaveBeenCalledWith(false)
    })
  })

  describe('Search Input', () => {
    it('has a search input with placeholder', () => {
      render(<CommandPalette {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search everything...')
      expect(searchInput).toBeInTheDocument()
    })

    it('shows "No results found" for non-matching search', async () => {
      render(<CommandPalette {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search everything...')
      fireEvent.change(searchInput, { target: { value: 'xyznonexistent' } })
      
      await waitFor(() => {
        expect(screen.getByText('No results found.')).toBeInTheDocument()
      })
    })
  })

  describe('Keyboard Shortcut (Cmd+K)', () => {
    it('toggles palette with Cmd+K', () => {
      const setOpen = vi.fn()
      render(<CommandPalette {...defaultProps} open={false} setOpen={setOpen} />)
      
      fireEvent.keyDown(document, { key: 'k', metaKey: true })
      
      expect(setOpen).toHaveBeenCalledWith(true)
    })

    it('toggles palette with Ctrl+K', () => {
      const setOpen = vi.fn()
      render(<CommandPalette {...defaultProps} open={false} setOpen={setOpen} />)
      
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
      
      expect(setOpen).toHaveBeenCalledWith(true)
    })
  })

  describe('Icons', () => {
    it('renders icons for actions', () => {
      render(<CommandPalette {...defaultProps} />)
      
      // Check that SVG icons are rendered (Lucide icons)
      const svgIcons = document.querySelectorAll('svg')
      expect(svgIcons.length).toBeGreaterThan(0)
    })
  })

  describe('Note Display', () => {
    it('limits displayed notes to 10', () => {
      const manyNotes = Array.from({ length: 15 }, (_, i) => ({
        id: String(i + 1),
        title: `Note ${i + 1}`,
        content: '',
        folder: 'inbox',
        created_at: Date.now(),
        updated_at: Date.now()
      }))

      render(<CommandPalette {...defaultProps} notes={manyNotes} />)
      
      // Should only show 10 notes
      expect(screen.getByText('Note 1')).toBeInTheDocument()
      expect(screen.getByText('Note 10')).toBeInTheDocument()
      expect(screen.queryByText('Note 11')).not.toBeInTheDocument()
    })

    it('shows "Untitled" for notes without title', () => {
      const noteWithoutTitle = [
        { id: '1', title: '', content: '', folder: 'inbox', created_at: Date.now(), updated_at: Date.now() }
      ]

      render(<CommandPalette {...defaultProps} notes={noteWithoutTitle} />)

      expect(screen.getByText('Untitled')).toBeInTheDocument()
    })
  })
})

describe('CommandPalette Integration', () => {
  describe('ADHD-Friendly Design', () => {
    it('has clear visual hierarchy with group headings', () => {
      render(
        <CommandPalette
          open={true}
          setOpen={vi.fn()}
          notes={mockNotes}
          onSelectNote={vi.fn()}
          onCreateNote={vi.fn()}
          onDailyNote={vi.fn()}
          onToggleFocus={vi.fn()}
          onObsidianSync={vi.fn()}
          onRunClaude={vi.fn()}
          onRunGemini={vi.fn()}
        />
      )
      
      expect(screen.getByText('Main Actions')).toBeInTheDocument()
      expect(screen.getByText('Recent Pages')).toBeInTheDocument()
    })

    it('provides quick access to common actions', () => {
      render(
        <CommandPalette
          open={true}
          setOpen={vi.fn()}
          notes={[]}
          onSelectNote={vi.fn()}
          onCreateNote={vi.fn()}
          onDailyNote={vi.fn()}
          onToggleFocus={vi.fn()}
          onObsidianSync={vi.fn()}
          onRunClaude={vi.fn()}
          onRunGemini={vi.fn()}
        />
      )
      
      // All main actions should be visible immediately
      expect(screen.getByText('Create New Page')).toBeInTheDocument()
      expect(screen.getByText("Open Today's Journal")).toBeInTheDocument()
      expect(screen.getByText('Toggle Focus Mode')).toBeInTheDocument()
    })

    it('shows keyboard shortcuts for muscle memory', () => {
      render(
        <CommandPalette
          open={true}
          setOpen={vi.fn()}
          notes={[]}
          onSelectNote={vi.fn()}
          onCreateNote={vi.fn()}
          onDailyNote={vi.fn()}
          onToggleFocus={vi.fn()}
          onObsidianSync={vi.fn()}
          onRunClaude={vi.fn()}
          onRunGemini={vi.fn()}
        />
      )
      
      // Keyboard shortcuts visible
      expect(screen.getByText('⌘N')).toBeInTheDocument()
      expect(screen.getByText('⌘D')).toBeInTheDocument()
      expect(screen.getByText('⌘⇧F')).toBeInTheDocument()
    })
  })
})
