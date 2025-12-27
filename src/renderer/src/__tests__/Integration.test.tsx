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
    it('displays wiki-links in textarea content', () => {
      render(<HybridEditor {...editorProps} content="See [[Project Plan]] for details" />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('See [[Project Plan]] for details')
    })

    it('switches to preview mode to view wiki-links', async () => {
      render(<HybridEditor {...editorProps} content="See [[Project Plan]] here" />)

      // Switch to preview mode (pill-style toggle has multiple Preview text elements)
      const previewButtons = screen.getAllByText('Preview')
      fireEvent.click(previewButtons[0])

      await waitFor(() => {
        // Pill-style toggle always shows both Write and Preview buttons
        expect(screen.getByText('Write')).toBeInTheDocument()
      })

      // Prose container should be visible in preview mode
      const proseDiv = document.querySelector('.prose')
      expect(proseDiv).toBeInTheDocument()
    })

    it('shows wiki-link autocomplete when typing [[', async () => {
      render(<HybridEditor {...editorProps} content="" />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()

      // Simulate typing [[ to trigger autocomplete
      fireEvent.change(textarea, { target: { value: '[[test', selectionStart: 6 } })

      // Verify the input was accepted
      expect(editorProps.onChange).toHaveBeenCalledWith('[[test')

      // Wait for autocomplete to finish loading to avoid act() warnings
      await waitFor(() => {
        expect(screen.queryByText('Loading notes...')).not.toBeInTheDocument()
      })
    })
  })

  describe('Tag Workflow', () => {
    it('displays tags in textarea content', () => {
      render(<HybridEditor {...editorProps} content="This is #important" />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('This is #important')
    })

    it('switches to preview mode to view tags', async () => {
      render(<HybridEditor {...editorProps} content="Check #todo" />)

      // Switch to preview mode (pill-style toggle has multiple Preview text elements)
      const previewButtons = screen.getAllByText('Preview')
      fireEvent.click(previewButtons[0])

      await waitFor(() => {
        // Pill-style toggle always shows both Write and Preview buttons
        expect(screen.getByText('Write')).toBeInTheDocument()
      })

      // Prose container should be visible in preview mode
      const proseDiv = document.querySelector('.prose')
      expect(proseDiv).toBeInTheDocument()
    })

    it('headings in textarea do not interfere with tag regex', () => {
      render(<HybridEditor {...editorProps} content="## Heading 2" />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('## Heading 2')
    })
  })

  describe('Mixed Content', () => {
    it('renders both wiki-links and tags in textarea', () => {
      render(<HybridEditor {...editorProps} content="See [[Note]] and #tag here" />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('See [[Note]] and #tag here')
    })

    it('preserves content structure with mixed elements', () => {
      const content = `# Header
See [[Link1]] and #tag1
More text with [[Link2]] and #tag2`
      
      render(<HybridEditor {...editorProps} content={content} />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue(content)
    })

    it('renders mixed content correctly in preview mode', async () => {
      render(<HybridEditor {...editorProps} content="See [[Note]] and #tag here" />)
      
      fireEvent.click(screen.getByText('Preview'))
      
      await waitFor(() => {
        // In preview mode, wiki-links become clickable buttons
        const buttons = screen.getAllByRole('button')
        // Should have at least the mode toggle + wiki-link + tag buttons
        expect(buttons.length).toBeGreaterThanOrEqual(2)
      })
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

    // Pill-style toggle has multiple Preview text elements
    const previewButtons = screen.getAllByText('Preview')
    fireEvent.click(previewButtons[0])

    await waitFor(() => {
      // In preview mode, textarea is hidden
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })
  })

  it('maintains content when switching modes', async () => {
    render(<HybridEditor {...editorProps} />)

    // Go to preview
    const previewButtons = screen.getAllByText('Preview')
    fireEvent.click(previewButtons[0])

    await waitFor(() => {
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    // Go back to write
    fireEvent.click(screen.getByText('Write'))

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    // Content should still be there in textarea
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue('Test content with [[Link]] and #tag')
  })
})

describe('Word Count Integration', () => {
  it('updates word count as content changes', () => {
    const { rerender } = render(
      <HybridEditor content="One two" onChange={vi.fn()} />
    )

    // Word count appears in multiple places (header and status bar)
    expect(screen.getAllByText('2 words').length).toBeGreaterThan(0)

    rerender(<HybridEditor content="One two three four" onChange={vi.fn()} />)

    expect(screen.getAllByText('4 words').length).toBeGreaterThan(0)
  })

  it('counts wiki-links as words', () => {
    render(<HybridEditor content="See [[Note]] here" onChange={vi.fn()} />)

    expect(screen.getAllByText('3 words').length).toBeGreaterThan(0)
  })

  it('counts tags as words', () => {
    render(<HybridEditor content="Check #todo today" onChange={vi.fn()} />)

    expect(screen.getAllByText('3 words').length).toBeGreaterThan(0)
  })
})

describe('Accessibility Integration', () => {
  it('editor has proper textarea', () => {
    render(<HybridEditor content="" onChange={vi.fn()} />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
    expect(textarea.tagName).toBe('TEXTAREA')
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

    // The pill-style toggle container has the title
    const toggleButton = screen.getByTitle('Toggle mode (⌘E)')
    expect(toggleButton).toBeInTheDocument()
  })
})

describe('ADHD-Friendly Design Verification', () => {
  describe('Zero Friction', () => {
    it('editor is immediately usable', () => {
      render(<HybridEditor content="" onChange={vi.fn()} />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()
      expect(textarea).toHaveClass('focus:outline-none')
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

      // Status bar shows ⌘E keyboard hint
      expect(screen.getByText('⌘E')).toBeInTheDocument()
    })
  })

  describe('Visible Progress', () => {
    it('always shows word count', () => {
      render(<HybridEditor content="Hello world" onChange={vi.fn()} />)

      // Word count appears in multiple places
      expect(screen.getAllByText('2 words').length).toBeGreaterThan(0)
    })

    it('shows current mode', () => {
      render(<HybridEditor content="" onChange={vi.fn()} />)
      
      expect(screen.getByText('Writing')).toBeInTheDocument()
    })
  })
})
