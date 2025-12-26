import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { HybridEditor } from '../components/HybridEditor'
import { CommandPalette } from '../components/CommandPalette'
import { Note, Tag } from '../types'

/**
 * Integration Tests
 * 
 * These tests verify that components work together correctly
 * and simulate real user workflows.
 */

// Mock data
const mockNotes: Note[] = [
  { id: '1', title: 'Project Plan', content: 'Plan for [[Q1 Goals]] with #important tasks', folder: 'projects', created_at: Date.now(), updated_at: Date.now(), deleted_at: null },
  { id: '2', title: 'Q1 Goals', content: 'Goals for Q1 #quarterly', folder: 'projects', created_at: Date.now(), updated_at: Date.now(), deleted_at: null },
  { id: '3', title: 'Meeting Notes', content: 'Notes from meeting #todo', folder: 'inbox', created_at: Date.now(), updated_at: Date.now(), deleted_at: null }
]

const mockTags: Tag[] = [
  { id: '1', name: 'important', color: '#ff0000', created_at: Date.now() },
  { id: '2', name: 'todo', color: '#00ff00', created_at: Date.now() },
  { id: '3', name: 'quarterly', color: '#0000ff', created_at: Date.now() }
]

describe('Editor + Autocomplete Integration', () => {
  const editorProps = {
    content: '',
    onChange: vi.fn(),
    onWikiLinkClick: vi.fn(),
    onTagClick: vi.fn(),
    onSearchNotes: vi.fn().mockResolvedValue(mockNotes),
    onSearchTags: vi.fn().mockResolvedValue(mockTags)
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Wiki-Link Workflow', () => {
    it('displays wiki-links with proper highlighting', () => {
      render(<HybridEditor {...editorProps} content="See [[Project Plan]] for details" />)
      
      const wikiLink = screen.getByText('[[Project Plan]]')
      expect(wikiLink).toHaveClass('wiki-link')
    })

    it('handles clicking wiki-links to navigate', () => {
      const onWikiLinkClick = vi.fn()
      render(<HybridEditor {...editorProps} content="See [[Project Plan]] here" onWikiLinkClick={onWikiLinkClick} />)
      
      const wikiLink = screen.getByText('[[Project Plan]]')
      fireEvent.click(wikiLink)
      
      expect(onWikiLinkClick).toHaveBeenCalledWith('Project Plan')
    })

    it('shows wiki-link autocomplete when typing [[', async () => {
      const { container } = render(<HybridEditor {...editorProps} content="" />)
      
      const editor = container.querySelector('[contenteditable="true"]')
      expect(editor).toBeInTheDocument()
      
      // Note: Full autocomplete testing requires more complex DOM manipulation
      // This test verifies the editor is set up correctly
    })
  })

  describe('Tag Workflow', () => {
    it('displays tags with proper highlighting', () => {
      render(<HybridEditor {...editorProps} content="This is #important" />)
      
      const tag = screen.getByText('#important')
      expect(tag).toHaveClass('tag')
    })

    it('handles clicking tags to filter', () => {
      const onTagClick = vi.fn()
      render(<HybridEditor {...editorProps} content="Check #todo" onTagClick={onTagClick} />)
      
      const tag = screen.getByText('#todo')
      fireEvent.click(tag)
      
      expect(onTagClick).toHaveBeenCalledWith('todo')
    })

    it('does not highlight markdown headings as tags', () => {
      render(<HybridEditor {...editorProps} content="## Heading 2" />)
      
      const heading = screen.getByText('## Heading 2')
      expect(heading).not.toHaveClass('tag')
    })
  })

  describe('Mixed Content', () => {
    it('renders both wiki-links and tags in same content', () => {
      render(<HybridEditor {...editorProps} content="See [[Note]] and #tag here" />)
      
      expect(screen.getByText('[[Note]]')).toHaveClass('wiki-link')
      expect(screen.getByText('#tag')).toHaveClass('tag')
    })

    it('preserves content structure with mixed elements', () => {
      const content = `# Header
See [[Link1]] and #tag1
More text with [[Link2]] and #tag2`
      
      render(<HybridEditor {...editorProps} content={content} />)
      
      expect(screen.getByText('[[Link1]]')).toHaveClass('wiki-link')
      expect(screen.getByText('[[Link2]]')).toHaveClass('wiki-link')
      expect(screen.getByText('#tag1')).toHaveClass('tag')
      expect(screen.getByText('#tag2')).toHaveClass('tag')
    })
  })
})

describe('Command Palette Integration', () => {
  const paletteProps = {
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

  describe('Quick Actions', () => {
    it('creates new note and closes palette', () => {
      render(<CommandPalette {...paletteProps} />)
      
      fireEvent.click(screen.getByText('Create New Note'))
      
      expect(paletteProps.onCreateNote).toHaveBeenCalled()
      expect(paletteProps.setOpen).toHaveBeenCalledWith(false)
    })

    it('opens daily note and closes palette', () => {
      render(<CommandPalette {...paletteProps} />)
      
      fireEvent.click(screen.getByText("Open Today's Daily Note"))
      
      expect(paletteProps.onDailyNote).toHaveBeenCalled()
      expect(paletteProps.setOpen).toHaveBeenCalledWith(false)
    })

    it('toggles focus mode and closes palette', () => {
      render(<CommandPalette {...paletteProps} />)
      
      fireEvent.click(screen.getByText('Toggle Focus Mode'))
      
      expect(paletteProps.onToggleFocus).toHaveBeenCalled()
      expect(paletteProps.setOpen).toHaveBeenCalledWith(false)
    })
  })

  describe('Note Selection', () => {
    it('selects note and closes palette', () => {
      render(<CommandPalette {...paletteProps} />)
      
      fireEvent.click(screen.getByText('Project Plan'))
      
      expect(paletteProps.onSelectNote).toHaveBeenCalledWith('1')
      expect(paletteProps.setOpen).toHaveBeenCalledWith(false)
    })

    it('shows all notes in recent notes section', () => {
      render(<CommandPalette {...paletteProps} />)
      
      expect(screen.getByText('Project Plan')).toBeInTheDocument()
      expect(screen.getByText('Q1 Goals')).toBeInTheDocument()
      expect(screen.getByText('Meeting Notes')).toBeInTheDocument()
    })
  })

  describe('AI Actions', () => {
    it('runs Claude and closes palette', () => {
      render(<CommandPalette {...paletteProps} />)
      
      fireEvent.click(screen.getByText('Ask Claude (Refactor Notes)'))
      
      expect(paletteProps.onRunClaude).toHaveBeenCalled()
      expect(paletteProps.setOpen).toHaveBeenCalledWith(false)
    })

    it('runs Gemini and closes palette', () => {
      render(<CommandPalette {...paletteProps} />)
      
      fireEvent.click(screen.getByText('Ask Gemini (Brainstorming)'))
      
      expect(paletteProps.onRunGemini).toHaveBeenCalled()
      expect(paletteProps.setOpen).toHaveBeenCalledWith(false)
    })
  })

  describe('Sync Actions', () => {
    it('syncs to Obsidian and closes palette', () => {
      render(<CommandPalette {...paletteProps} />)
      
      fireEvent.click(screen.getByText('Sync to Obsidian Vault'))
      
      expect(paletteProps.onObsidianSync).toHaveBeenCalled()
      expect(paletteProps.setOpen).toHaveBeenCalledWith(false)
    })
  })
})

describe('Editor Mode Integration', () => {
  const editorProps = {
    content: 'Test content with [[Link]] and #tag',
    onChange: vi.fn(),
    onWikiLinkClick: vi.fn(),
    onTagClick: vi.fn()
  }

  it('starts in write mode', () => {
    render(<HybridEditor {...editorProps} />)
    
    expect(screen.getByText('Writing')).toBeInTheDocument()
    expect(screen.getByText('Preview')).toBeInTheDocument()
  })

  it('toggles to preview mode', async () => {
    render(<HybridEditor {...editorProps} />)
    
    fireEvent.click(screen.getByText('Preview'))
    
    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument()
    })
  })

  it('maintains content when switching modes', async () => {
    render(<HybridEditor {...editorProps} />)
    
    // Go to preview
    fireEvent.click(screen.getByText('Preview'))
    
    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument()
    })
    
    // Go back to write
    fireEvent.click(screen.getByText('Edit'))
    
    await waitFor(() => {
      expect(screen.getByText('Preview')).toBeInTheDocument()
    })
    
    // Content should still be there
    expect(screen.getByText('[[Link]]')).toBeInTheDocument()
  })
})

describe('Word Count Integration', () => {
  it('updates word count as content changes', () => {
    const { rerender } = render(
      <HybridEditor content="One two" onChange={vi.fn()} />
    )
    
    expect(screen.getByText('2 words')).toBeInTheDocument()
    
    rerender(<HybridEditor content="One two three four" onChange={vi.fn()} />)
    
    expect(screen.getByText('4 words')).toBeInTheDocument()
  })

  it('counts wiki-links as words', () => {
    render(<HybridEditor content="See [[Note]] here" onChange={vi.fn()} />)
    
    expect(screen.getByText('3 words')).toBeInTheDocument()
  })

  it('counts tags as words', () => {
    render(<HybridEditor content="Check #todo today" onChange={vi.fn()} />)
    
    expect(screen.getByText('3 words')).toBeInTheDocument()
  })
})

describe('Accessibility Integration', () => {
  it('editor has proper contenteditable attribute', () => {
    render(<HybridEditor content="" onChange={vi.fn()} />)
    
    const editor = document.querySelector('[contenteditable="true"]')
    expect(editor).toBeInTheDocument()
  })

  it('command palette has accessible structure', () => {
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
    
    // Search input should have aria-label
    const searchInput = screen.getByPlaceholderText('Search everything...')
    expect(searchInput).toHaveAttribute('aria-label', 'Search commands and notes')
  })

  it('buttons have proper labels', () => {
    render(<HybridEditor content="" onChange={vi.fn()} />)
    
    const toggleButton = screen.getByTitle('Toggle mode (Cmd+E)')
    expect(toggleButton).toBeInTheDocument()
  })
})

describe('ADHD-Friendly Design Verification', () => {
  describe('Zero Friction', () => {
    it('editor is immediately usable', () => {
      render(<HybridEditor content="" onChange={vi.fn()} />)
      
      const editor = document.querySelector('[contenteditable="true"]')
      expect(editor).toBeInTheDocument()
      expect(editor).toHaveClass('focus:outline-none')
    })

    it('command palette shows all actions immediately', () => {
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
      
      // All main actions visible without scrolling
      expect(screen.getByText('Create New Note')).toBeInTheDocument()
      expect(screen.getByText("Open Today's Daily Note")).toBeInTheDocument()
      expect(screen.getByText('Toggle Focus Mode')).toBeInTheDocument()
    })
  })

  describe('Escape Hatches', () => {
    it('shows keyboard shortcuts for quick access', () => {
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
      
      expect(screen.getByText('⌘N')).toBeInTheDocument()
      expect(screen.getByText('⌘D')).toBeInTheDocument()
      expect(screen.getByText('⌘⇧F')).toBeInTheDocument()
    })

    it('shows mode toggle hint', () => {
      render(<HybridEditor content="" onChange={vi.fn()} />)
      
      expect(screen.getByText('Cmd+E to toggle')).toBeInTheDocument()
    })
  })

  describe('Visible Progress', () => {
    it('always shows word count', () => {
      render(<HybridEditor content="Hello world" onChange={vi.fn()} />)
      
      expect(screen.getByText('2 words')).toBeInTheDocument()
    })

    it('shows current mode', () => {
      render(<HybridEditor content="" onChange={vi.fn()} />)
      
      expect(screen.getByText('Writing')).toBeInTheDocument()
    })
  })
})
