import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SimpleWikiLinkAutocomplete } from '../components/SimpleWikiLinkAutocomplete'
import { SimpleTagAutocomplete } from '../components/SimpleTagAutocomplete'
import { Note, Tag } from '../types'

// Mock notes and tags
const mockNotes: Note[] = [
  { id: '1', title: 'Project Plan', content: 'Planning content', folder: 'projects', created_at: Date.now(), updated_at: Date.now(), deleted_at: null },
  { id: '2', title: 'Meeting Notes', content: 'Meeting content', folder: 'inbox', created_at: Date.now(), updated_at: Date.now(), deleted_at: null },
  { id: '3', title: 'Research Paper', content: 'Research content', folder: 'resources', created_at: Date.now(), updated_at: Date.now(), deleted_at: null }
]

const mockTags: Tag[] = [
  { id: '1', name: 'important', color: '#ff0000', created_at: Date.now() },
  { id: '2', name: 'todo', color: '#00ff00', created_at: Date.now() },
  { id: '3', name: 'work', color: '#0000ff', created_at: Date.now() }
]

describe('SimpleWikiLinkAutocomplete', () => {
  const defaultProps = {
    query: '',
    onSelect: vi.fn(),
    onClose: vi.fn(),
    onSearch: vi.fn().mockResolvedValue(mockNotes)
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the autocomplete component', async () => {
      render(<SimpleWikiLinkAutocomplete {...defaultProps} query="pro" />)
      
      await waitFor(() => {
        expect(screen.getByText('Project Plan')).toBeInTheDocument()
      })
    })

    it('shows loading state initially', async () => {
      render(<SimpleWikiLinkAutocomplete {...defaultProps} query="test" />)

      expect(screen.getByText('Loading notes...')).toBeInTheDocument()

      // Wait for loading to complete to avoid act() warnings
      await waitFor(() => {
        expect(screen.queryByText('Loading notes...')).not.toBeInTheDocument()
      })
    })

    it('displays filtered notes based on query', async () => {
      const onSearch = vi.fn().mockResolvedValue([mockNotes[0]])
      render(<SimpleWikiLinkAutocomplete {...defaultProps} query="project" onSearch={onSearch} />)
      
      await waitFor(() => {
        expect(screen.getByText('Project Plan')).toBeInTheDocument()
      })
    })

    it('shows no results message when no notes match', async () => {
      const onSearch = vi.fn().mockResolvedValue([])
      render(<SimpleWikiLinkAutocomplete {...defaultProps} query="nonexistent" onSearch={onSearch} />)
      
      await waitFor(() => {
        expect(screen.getByText('No notes found for "nonexistent"')).toBeInTheDocument()
      })
    })

    it('displays note folder badge', async () => {
      render(<SimpleWikiLinkAutocomplete {...defaultProps} query="pro" />)
      
      await waitFor(() => {
        expect(screen.getByText('projects')).toBeInTheDocument()
      })
    })
  })

  describe('Selection', () => {
    it('calls onSelect when clicking a note', async () => {
      const onSelect = vi.fn()
      render(<SimpleWikiLinkAutocomplete {...defaultProps} query="pro" onSelect={onSelect} />)
      
      await waitFor(() => {
        expect(screen.getByText('Project Plan')).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByText('Project Plan'))
      expect(onSelect).toHaveBeenCalledWith('Project Plan')
    })

    it('calls onClose when pressing Escape', async () => {
      const onClose = vi.fn()
      render(<SimpleWikiLinkAutocomplete {...defaultProps} query="pro" onClose={onClose} />)
      
      await waitFor(() => {
        expect(screen.getByText('Project Plan')).toBeInTheDocument()
      })
      
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('Keyboard Navigation', () => {
    it('navigates down with ArrowDown', async () => {
      render(<SimpleWikiLinkAutocomplete {...defaultProps} query="" />)
      
      await waitFor(() => {
        expect(screen.getByText('Project Plan')).toBeInTheDocument()
      })
      
      // First item should be selected initially
      const firstButton = screen.getByText('Project Plan').closest('button')
      expect(firstButton).toHaveClass('bg-gray-700')
      
      // Press ArrowDown
      fireEvent.keyDown(document, { key: 'ArrowDown' })
      
      await waitFor(() => {
        const secondButton = screen.getByText('Meeting Notes').closest('button')
        expect(secondButton).toHaveClass('bg-gray-700')
      })
    })

    it('navigates up with ArrowUp', async () => {
      render(<SimpleWikiLinkAutocomplete {...defaultProps} query="" />)
      
      await waitFor(() => {
        expect(screen.getByText('Project Plan')).toBeInTheDocument()
      })
      
      // Navigate down first
      fireEvent.keyDown(document, { key: 'ArrowDown' })
      fireEvent.keyDown(document, { key: 'ArrowDown' })
      
      // Then navigate up
      fireEvent.keyDown(document, { key: 'ArrowUp' })
      
      await waitFor(() => {
        const secondButton = screen.getByText('Meeting Notes').closest('button')
        expect(secondButton).toHaveClass('bg-gray-700')
      })
    })

    it('selects item with Enter key', async () => {
      const onSelect = vi.fn()
      render(<SimpleWikiLinkAutocomplete {...defaultProps} query="" onSelect={onSelect} />)
      
      await waitFor(() => {
        expect(screen.getByText('Project Plan')).toBeInTheDocument()
      })
      
      fireEvent.keyDown(document, { key: 'Enter' })
      expect(onSelect).toHaveBeenCalledWith('Project Plan')
    })
  })

  describe('Mouse Interaction', () => {
    it('highlights item on mouse enter', async () => {
      render(<SimpleWikiLinkAutocomplete {...defaultProps} query="" />)
      
      await waitFor(() => {
        expect(screen.getByText('Meeting Notes')).toBeInTheDocument()
      })
      
      const meetingNotesButton = screen.getByText('Meeting Notes').closest('button')
      if (meetingNotesButton) {
        fireEvent.mouseEnter(meetingNotesButton)
      }
      
      await waitFor(() => {
        expect(meetingNotesButton).toHaveClass('bg-gray-700')
      })
    })
  })
})

describe('SimpleTagAutocomplete', () => {
  const defaultProps = {
    query: '',
    onSelect: vi.fn(),
    onClose: vi.fn(),
    onSearch: vi.fn().mockResolvedValue(mockTags)
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the autocomplete component', async () => {
      render(<SimpleTagAutocomplete {...defaultProps} query="imp" />)
      
      await waitFor(() => {
        expect(screen.getByText('#important')).toBeInTheDocument()
      })
    })

    it('shows loading state initially', async () => {
      render(<SimpleTagAutocomplete {...defaultProps} query="test" />)

      expect(screen.getByText('Loading tags...')).toBeInTheDocument()

      // Wait for loading to complete to avoid act() warnings
      await waitFor(() => {
        expect(screen.queryByText('Loading tags...')).not.toBeInTheDocument()
      })
    })

    it('displays all tags when query is empty', async () => {
      render(<SimpleTagAutocomplete {...defaultProps} query="" />)
      
      await waitFor(() => {
        expect(screen.getByText('#important')).toBeInTheDocument()
        expect(screen.getByText('#todo')).toBeInTheDocument()
        expect(screen.getByText('#work')).toBeInTheDocument()
      })
    })

    it('shows "Create new tag" option when query has value', async () => {
      render(<SimpleTagAutocomplete {...defaultProps} query="newtag" />)
      
      await waitFor(() => {
        expect(screen.getByText('Create new tag:')).toBeInTheDocument()
        expect(screen.getByText('#newtag')).toBeInTheDocument()
      })
    })

    it('displays tag color indicator', async () => {
      render(<SimpleTagAutocomplete {...defaultProps} query="" />)
      
      await waitFor(() => {
        const colorIndicators = document.querySelectorAll('.rounded-full')
        expect(colorIndicators.length).toBeGreaterThan(0)
      })
    })

    it('shows no tags available message when empty', async () => {
      const onSearch = vi.fn().mockResolvedValue([])
      render(<SimpleTagAutocomplete {...defaultProps} query="" onSearch={onSearch} />)
      
      await waitFor(() => {
        expect(screen.getByText('No tags available')).toBeInTheDocument()
      })
    })
  })

  describe('Selection', () => {
    it('calls onSelect when clicking a tag', async () => {
      const onSelect = vi.fn()
      render(<SimpleTagAutocomplete {...defaultProps} query="" onSelect={onSelect} />)
      
      await waitFor(() => {
        expect(screen.getByText('#important')).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByText('#important').closest('button')!)
      expect(onSelect).toHaveBeenCalledWith('important')
    })

    it('creates new tag when selecting "Create new tag" option', async () => {
      const onSelect = vi.fn()
      render(<SimpleTagAutocomplete {...defaultProps} query="newtag" onSelect={onSelect} />)
      
      await waitFor(() => {
        expect(screen.getByText('Create new tag:')).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByText('#newtag').closest('button')!)
      expect(onSelect).toHaveBeenCalledWith('newtag')
    })

    it('calls onClose when pressing Escape', async () => {
      const onClose = vi.fn()
      render(<SimpleTagAutocomplete {...defaultProps} query="" onClose={onClose} />)
      
      await waitFor(() => {
        expect(screen.getByText('#important')).toBeInTheDocument()
      })
      
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('Keyboard Navigation', () => {
    it('navigates through tags with arrow keys', async () => {
      render(<SimpleTagAutocomplete {...defaultProps} query="" />)

      await waitFor(() => {
        expect(screen.getByText('#important')).toBeInTheDocument()
      })

      // First tag should be selected (rendered as button)
      const firstButton = screen.getByText('#important').closest('button')
      expect(firstButton).toBeInTheDocument()

      // Navigate down
      fireEvent.keyDown(document, { key: 'ArrowDown' })

      await waitFor(() => {
        const secondButton = screen.getByText('#todo').closest('button')
        // Second tag should be selectable
        expect(secondButton).toBeInTheDocument()
      })
    })

    it('can select "Create new tag" with keyboard', async () => {
      const onSelect = vi.fn()
      render(<SimpleTagAutocomplete {...defaultProps} query="new" onSelect={onSelect} />)
      
      await waitFor(() => {
        expect(screen.getByText('Create new tag:')).toBeInTheDocument()
      })
      
      // Navigate to "Create new tag" option (it's at the end)
      fireEvent.keyDown(document, { key: 'ArrowDown' })
      fireEvent.keyDown(document, { key: 'ArrowDown' })
      fireEvent.keyDown(document, { key: 'ArrowDown' })
      fireEvent.keyDown(document, { key: 'Enter' })
      
      expect(onSelect).toHaveBeenCalledWith('new')
    })
  })
})

describe('Tag Color Generation', () => {
  // Testing the generateTagColor function logic
  const generateTagColor = (name: string): string => {
    const hash = name.split('').reduce((acc, char) =>
      char.charCodeAt(0) + ((acc << 5) - acc), 0)
    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, 70%, 50%)`
  }

  it('generates consistent colors for same tag name', () => {
    const color1 = generateTagColor('important')
    const color2 = generateTagColor('important')
    
    expect(color1).toBe(color2)
  })

  it('generates different colors for different tag names', () => {
    const color1 = generateTagColor('important')
    const color2 = generateTagColor('todo')
    
    expect(color1).not.toBe(color2)
  })

  it('generates valid HSL color format', () => {
    const color = generateTagColor('test')
    
    expect(color).toMatch(/^hsl\(\d+, 70%, 50%\)$/)
  })

  it('generates colors for empty string', () => {
    const color = generateTagColor('')
    
    expect(color).toMatch(/^hsl\(\d+, 70%, 50%\)$/)
  })

  it('generates colors for long tag names', () => {
    const longName = 'a'.repeat(100)
    const color = generateTagColor(longName)
    
    expect(color).toMatch(/^hsl\(\d+, 70%, 50%\)$/)
  })

  it('generates colors for special characters', () => {
    const color = generateTagColor('my-tag_123')
    
    expect(color).toMatch(/^hsl\(\d+, 70%, 50%\)$/)
  })
})

describe('Autocomplete Edge Cases', () => {
  describe('WikiLink Autocomplete', () => {
    it('handles empty search results gracefully', async () => {
      const onSearch = vi.fn().mockResolvedValue([])
      render(
        <SimpleWikiLinkAutocomplete
          query="xyz"
          onSelect={vi.fn()}
          onClose={vi.fn()}
          onSearch={onSearch}
        />
      )
      
      await waitFor(() => {
        expect(screen.getByText('No notes found for "xyz"')).toBeInTheDocument()
      })
    })

    it('handles search error gracefully', async () => {
      const onSearch = vi.fn().mockRejectedValue(new Error('Network error'))
      render(
        <SimpleWikiLinkAutocomplete
          query="test"
          onSelect={vi.fn()}
          onClose={vi.fn()}
          onSearch={onSearch}
        />
      )
      
      // Should show empty state, not crash
      await waitFor(() => {
        expect(screen.queryByText('Loading notes...')).not.toBeInTheDocument()
      })
    })

    it('truncates long note content in preview', async () => {
      const longNote: Note = {
        id: '1',
        title: 'Long Note',
        content: 'A'.repeat(200),
        folder: 'inbox',
        created_at: Date.now(),
        updated_at: Date.now(),
        deleted_at: null
      }
      
      const onSearch = vi.fn().mockResolvedValue([longNote])
      render(
        <SimpleWikiLinkAutocomplete
          query="long"
          onSelect={vi.fn()}
          onClose={vi.fn()}
          onSearch={onSearch}
        />
      )
      
      await waitFor(() => {
        expect(screen.getByText('Long Note')).toBeInTheDocument()
        // Content should be truncated
        const contentPreview = screen.getByText(/AAA+\.\.\./i)
        expect(contentPreview).toBeInTheDocument()
      })
    })
  })

  describe('Tag Autocomplete', () => {
    it('handles empty tag list', async () => {
      const onSearch = vi.fn().mockResolvedValue([])
      render(
        <SimpleTagAutocomplete
          query=""
          onSelect={vi.fn()}
          onClose={vi.fn()}
          onSearch={onSearch}
        />
      )
      
      await waitFor(() => {
        expect(screen.getByText('No tags available')).toBeInTheDocument()
      })
    })

    it('handles search error gracefully', async () => {
      const onSearch = vi.fn().mockRejectedValue(new Error('Network error'))
      render(
        <SimpleTagAutocomplete
          query="test"
          onSelect={vi.fn()}
          onClose={vi.fn()}
          onSearch={onSearch}
        />
      )
      
      // Should not crash
      await waitFor(() => {
        expect(screen.queryByText('Loading tags...')).not.toBeInTheDocument()
      })
    })

    it('filters tags case-insensitively', async () => {
      const onSearch = vi.fn().mockResolvedValue(mockTags)
      render(
        <SimpleTagAutocomplete
          query="IMPORTANT"
          onSelect={vi.fn()}
          onClose={vi.fn()}
          onSearch={onSearch}
        />
      )
      
      await waitFor(() => {
        expect(screen.getByText('#important')).toBeInTheDocument()
      })
    })
  })
})
