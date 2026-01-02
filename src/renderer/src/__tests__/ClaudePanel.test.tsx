import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ClaudePanel } from '../components/ClaudePanel'
import { Note, Project } from '../types'

// Mock platform detection
vi.mock('../lib/platform', () => ({
  isBrowser: vi.fn(() => true),
  isTauri: vi.fn(() => false)
}))

// Helper to create mock notes
const createMockNote = (overrides: Partial<Note> = {}): Note => ({
  id: 'note-1',
  title: 'Test Note',
  content: 'This is test content with some words.',
  folder: '/',
  project_id: null,
  created_at: Date.now(),
  updated_at: Date.now(),
  deleted_at: null,
  ...overrides
})

// Helper to create mock projects
const createMockProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'project-1',
  name: 'Test Project',
  type: 'generic',
  created_at: Date.now(),
  updated_at: Date.now(),
  ...overrides
})

// Helper to advance timers and wait for thinking state to complete
const waitForThinkingComplete = () => {
  act(() => {
    vi.advanceTimersByTime(1300) // 1200ms + buffer
  })
}

describe('ClaudePanel Component', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('renders the claude panel container', () => {
      render(
        <ClaudePanel
          currentNote={null}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )
      expect(screen.getByText('Claude Assistant')).toBeInTheDocument()
    })

    it('renders header with sparkle icon and title', () => {
      render(
        <ClaudePanel
          currentNote={null}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )
      expect(screen.getByText('Claude Assistant')).toBeInTheDocument()
      expect(screen.getByTitle('Close panel')).toBeInTheDocument()
    })

    it('renders close button', () => {
      render(
        <ClaudePanel
          currentNote={null}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )
      const closeButton = screen.getByTitle('Close panel')
      expect(closeButton).toBeInTheDocument()
    })

    it('renders all three tab buttons', () => {
      render(
        <ClaudePanel
          currentNote={null}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )
      expect(screen.getByText('Insights')).toBeInTheDocument()
      expect(screen.getByText('Suggestions')).toBeInTheDocument()
      expect(screen.getByText('Connections')).toBeInTheDocument()
    })

    it('insights tab is active by default', () => {
      render(
        <ClaudePanel
          currentNote={null}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )
      const insightsTab = screen.getByText('Insights').closest('button')
      expect(insightsTab).toHaveClass('active')
    })

    it('renders forest accent decorative element', () => {
      const { container } = render(
        <ClaudePanel
          currentNote={null}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )
      expect(container.querySelector('.forest-accent')).toBeInTheDocument()
      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Close Button', () => {
    it('calls onClose when close button is clicked', () => {
      render(
        <ClaudePanel
          currentNote={null}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )
      const closeButton = screen.getByTitle('Close panel')
      fireEvent.click(closeButton)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Tab Navigation', () => {
    it('switches to Suggestions tab when clicked', () => {
      render(
        <ClaudePanel
          currentNote={null}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )
      const suggestionsTab = screen.getByText('Suggestions').closest('button')
      fireEvent.click(suggestionsTab!)
      expect(suggestionsTab).toHaveClass('active')
    })

    it('switches to Connections tab when clicked', () => {
      render(
        <ClaudePanel
          currentNote={null}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )
      const connectionsTab = screen.getByText('Connections').closest('button')
      fireEvent.click(connectionsTab!)
      expect(connectionsTab).toHaveClass('active')
    })

    it('removes active class from previous tab when switching', () => {
      render(
        <ClaudePanel
          currentNote={null}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )
      const insightsTab = screen.getByText('Insights').closest('button')
      const suggestionsTab = screen.getByText('Suggestions').closest('button')

      expect(insightsTab).toHaveClass('active')

      fireEvent.click(suggestionsTab!)

      expect(suggestionsTab).toHaveClass('active')
      expect(insightsTab).not.toHaveClass('active')
    })

    it('switches back to Insights tab when clicked', () => {
      render(
        <ClaudePanel
          currentNote={null}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )
      const insightsTab = screen.getByText('Insights').closest('button')
      const suggestionsTab = screen.getByText('Suggestions').closest('button')

      fireEvent.click(suggestionsTab!)
      fireEvent.click(insightsTab!)

      expect(insightsTab).toHaveClass('active')
    })
  })

  describe('Thinking State', () => {
    it('shows thinking state when note is provided', () => {
      const mockNote = createMockNote()
      render(
        <ClaudePanel
          currentNote={mockNote}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )
      expect(screen.getByText('Analyzing...')).toBeInTheDocument()
    })

    it('shows thinking state when project is provided', () => {
      const mockProject = createMockProject()
      render(
        <ClaudePanel
          currentNote={null}
          currentProject={mockProject}
          notes={[]}
          onClose={mockOnClose}
        />
      )
      expect(screen.getByText('Analyzing...')).toBeInTheDocument()
    })

    it('shows thinking dots animation container', () => {
      const mockNote = createMockNote()
      const { container } = render(
        <ClaudePanel
          currentNote={mockNote}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )
      expect(container.querySelector('.thinking-dots')).toBeInTheDocument()
    })

    it('hides thinking state after timeout', () => {
      const mockNote = createMockNote()
      render(
        <ClaudePanel
          currentNote={mockNote}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Analyzing...')).toBeInTheDocument()

      waitForThinkingComplete()

      expect(screen.queryByText('Analyzing...')).not.toBeInTheDocument()
    })

    it('does not show thinking state when no note or project', () => {
      render(
        <ClaudePanel
          currentNote={null}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )
      expect(screen.queryByText('Analyzing...')).not.toBeInTheDocument()
    })
  })

  describe('Empty State Insights', () => {
    it('shows info insight when no note or project selected', () => {
      render(
        <ClaudePanel
          currentNote={null}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Select a note or project to see AI insights')).toBeInTheDocument()
    })
  })

  describe('Note Insights', () => {
    it('shows word count metric for note', () => {
      const mockNote = createMockNote({ content: 'word1 word2 word3 word4 word5' })
      render(
        <ClaudePanel
          currentNote={mockNote}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      expect(screen.getByText(/Note has 5 words/)).toBeInTheDocument()
    })

    it('shows "Room to expand" for notes under 500 words', () => {
      const mockNote = createMockNote({ content: 'Short content' })
      render(
        <ClaudePanel
          currentNote={mockNote}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      expect(screen.getByText(/Room to expand/)).toBeInTheDocument()
    })

    it('shows "Well developed" for notes over 500 words', () => {
      const longContent = Array(501).fill('word').join(' ')
      const mockNote = createMockNote({ content: longContent })
      render(
        <ClaudePanel
          currentNote={mockNote}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      expect(screen.getByText(/Well developed!/)).toBeInTheDocument()
    })

    it('shows positive feedback for notes with backlinks', () => {
      const mockNote = createMockNote({ content: 'This note has [[a link]] to another note' })
      render(
        <ClaudePanel
          currentNote={mockNote}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      expect(screen.getByText('Good use of backlinks for context')).toBeInTheDocument()
    })

    it('suggests adding backlinks for notes without links', () => {
      const mockNote = createMockNote({ content: 'This note has no links' })
      render(
        <ClaudePanel
          currentNote={mockNote}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      expect(screen.getByText('Consider adding backlinks to related notes')).toBeInTheDocument()
    })

    it('shows positive feedback for notes with tags', () => {
      const mockNote = createMockNote({ content: 'This note has #tags inside' })
      render(
        <ClaudePanel
          currentNote={mockNote}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      expect(screen.getByText('Tags help with organization')).toBeInTheDocument()
    })

    it('suggests adding tags for notes without tags', () => {
      const mockNote = createMockNote({ content: 'This note has no tags' })
      render(
        <ClaudePanel
          currentNote={mockNote}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      expect(screen.getByText('Add tags to improve discoverability')).toBeInTheDocument()
    })
  })

  describe('Project Insights', () => {
    it('shows note count and word count for project', () => {
      const mockProject = createMockProject()
      const mockNotes = [
        createMockNote({ id: 'n1', project_id: 'project-1', content: 'word1 word2' }),
        createMockNote({ id: 'n2', project_id: 'project-1', content: 'word3 word4 word5' })
      ]

      render(
        <ClaudePanel
          currentNote={null}
          currentProject={mockProject}
          notes={mockNotes}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      expect(screen.getByText(/Project contains 2 notes with 5 total words/)).toBeInTheDocument()
    })

    it('shows good note density for projects with more than 5 notes', () => {
      const mockProject = createMockProject()
      const mockNotes = Array(6).fill(null).map((_, i) =>
        createMockNote({ id: `n${i}`, project_id: 'project-1', content: 'word' })
      )

      render(
        <ClaudePanel
          currentNote={null}
          currentProject={mockProject}
          notes={mockNotes}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      expect(screen.getByText('Good note density')).toBeInTheDocument()
    })

    it('suggests adding more notes for projects with 5 or fewer notes', () => {
      const mockProject = createMockProject()
      const mockNotes = [
        createMockNote({ id: 'n1', project_id: 'project-1', content: 'word' })
      ]

      render(
        <ClaudePanel
          currentNote={null}
          currentProject={mockProject}
          notes={mockNotes}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      expect(screen.getByText('Add more notes to build context')).toBeInTheDocument()
    })

    it('shows progress percentage when project has progress', () => {
      const mockProject = createMockProject({ progress: 75 })
      render(
        <ClaudePanel
          currentNote={null}
          currentProject={mockProject}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      expect(screen.getByText('Project is 75% complete')).toBeInTheDocument()
    })

    it('shows progress at 0% when progress is 0', () => {
      const mockProject = createMockProject({ progress: 0 })
      render(
        <ClaudePanel
          currentNote={null}
          currentProject={mockProject}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      expect(screen.getByText('Project is 0% complete')).toBeInTheDocument()
    })

    it('suggests setting progress when project has no progress', () => {
      const mockProject = createMockProject() // No progress set
      render(
        <ClaudePanel
          currentNote={null}
          currentProject={mockProject}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      expect(screen.getByText('Set progress tracking for better visibility')).toBeInTheDocument()
    })

    it('only counts notes belonging to the current project', () => {
      const mockProject = createMockProject()
      const mockNotes = [
        createMockNote({ id: 'n1', project_id: 'project-1', content: 'word1' }),
        createMockNote({ id: 'n2', project_id: 'other-project', content: 'word2 word3' }),
        createMockNote({ id: 'n3', project_id: null, content: 'word4 word5 word6' })
      ]

      render(
        <ClaudePanel
          currentNote={null}
          currentProject={mockProject}
          notes={mockNotes}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      // Only n1 belongs to project-1, so 1 note with 1 word
      expect(screen.getByText(/Project contains 1 notes with 1 total words/)).toBeInTheDocument()
    })
  })

  describe('Insight Types and Styling', () => {
    it('renders insights with correct CSS class based on type', () => {
      const mockNote = createMockNote({ content: 'Short content without links or tags' })
      const { container } = render(
        <ClaudePanel
          currentNote={mockNote}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      const insightItems = container.querySelectorAll('.insight-item')
      expect(insightItems.length).toBeGreaterThan(0)
      // Should have metric and suggestion types
      expect(container.querySelector('.insight-item.metric')).toBeInTheDocument()
      expect(container.querySelector('.insight-item.suggestion')).toBeInTheDocument()
    })
  })

  describe('Re-analysis on Context Change', () => {
    it('triggers thinking state when note changes', () => {
      const note1 = createMockNote({ id: 'note-1', content: 'First note' })
      const note2 = createMockNote({ id: 'note-2', content: 'Second note' })

      const { rerender } = render(
        <ClaudePanel
          currentNote={note1}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      // Wait for initial thinking to complete
      waitForThinkingComplete()

      expect(screen.queryByText('Analyzing...')).not.toBeInTheDocument()

      // Change the note
      rerender(
        <ClaudePanel
          currentNote={note2}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      // Should show thinking state again
      expect(screen.getByText('Analyzing...')).toBeInTheDocument()
    })

    it('triggers thinking state when project changes', () => {
      const project1 = createMockProject({ id: 'project-1' })
      const project2 = createMockProject({ id: 'project-2' })

      const { rerender } = render(
        <ClaudePanel
          currentNote={null}
          currentProject={project1}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      // Wait for initial thinking to complete
      waitForThinkingComplete()

      expect(screen.queryByText('Analyzing...')).not.toBeInTheDocument()

      // Change the project
      rerender(
        <ClaudePanel
          currentNote={null}
          currentProject={project2}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      // Should show thinking state again
      expect(screen.getByText('Analyzing...')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles note with empty content', () => {
      const mockNote = createMockNote({ content: '' })
      render(
        <ClaudePanel
          currentNote={mockNote}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      expect(screen.getByText(/Note has 0 words/)).toBeInTheDocument()
    })

    it('handles note with only whitespace', () => {
      const mockNote = createMockNote({ content: '   \n\t  ' })
      render(
        <ClaudePanel
          currentNote={mockNote}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      expect(screen.getByText(/Note has 0 words/)).toBeInTheDocument()
    })

    it('handles project with empty notes array', () => {
      const mockProject = createMockProject()
      render(
        <ClaudePanel
          currentNote={null}
          currentProject={mockProject}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      expect(screen.getByText(/Project contains 0 notes with 0 total words/)).toBeInTheDocument()
    })

    it('handles complex wiki links with special characters', () => {
      const mockNote = createMockNote({ content: 'Link to [[my-note#heading]] and [[another one|alias]]' })
      render(
        <ClaudePanel
          currentNote={mockNote}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      expect(screen.getByText('Good use of backlinks for context')).toBeInTheDocument()
    })

    it('handles multiple hash tags correctly', () => {
      const mockNote = createMockNote({ content: 'This has #tag1 and #tag2 and #another' })
      render(
        <ClaudePanel
          currentNote={mockNote}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      expect(screen.getByText('Tags help with organization')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('close button has accessible title', () => {
      render(
        <ClaudePanel
          currentNote={null}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )
      expect(screen.getByTitle('Close panel')).toBeInTheDocument()
    })

    it('tab buttons are focusable', () => {
      render(
        <ClaudePanel
          currentNote={null}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )
      const tabs = screen.getAllByRole('button')
      tabs.forEach(tab => {
        expect(tab).not.toHaveAttribute('tabindex', '-1')
      })
    })
  })

  describe('Multiple Insights Display', () => {
    it('displays all three insights for a note', () => {
      const mockNote = createMockNote({ content: 'Some content' })
      const { container } = render(
        <ClaudePanel
          currentNote={mockNote}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      const insightItems = container.querySelectorAll('.insight-item')
      expect(insightItems.length).toBe(3) // word count, backlinks, tags
    })

    it('displays all three insights for a project', () => {
      const mockProject = createMockProject()
      const { container } = render(
        <ClaudePanel
          currentNote={null}
          currentProject={mockProject}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      const insightItems = container.querySelectorAll('.insight-item')
      expect(insightItems.length).toBe(3) // note count, density, progress
    })
  })

  describe('Content Analysis', () => {
    it('correctly counts words in multi-line content', () => {
      // "one two three four" = 4 words
      const mockNote = createMockNote({
        content: 'one two\nthree four'
      })
      render(
        <ClaudePanel
          currentNote={mockNote}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      expect(screen.getByText(/Note has 4 words/)).toBeInTheDocument()
    })

    it('detects wiki links with hyphens and underscores', () => {
      const mockNote = createMockNote({ content: 'See [[my_note-name]]' })
      render(
        <ClaudePanel
          currentNote={mockNote}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      expect(screen.getByText('Good use of backlinks for context')).toBeInTheDocument()
    })

    it('does not detect markdown headings as tags', () => {
      // The regex /#\w+/ requires a word character immediately after #
      // "# Heading" has a space, so it won't match
      const mockNote = createMockNote({ content: '# Heading in markdown' })
      render(
        <ClaudePanel
          currentNote={mockNote}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      // Should suggest adding tags since "# Heading" doesn't match /#\w+/
      expect(screen.getByText('Add tags to improve discoverability')).toBeInTheDocument()
    })

    it('detects inline tags without spaces', () => {
      // #tag (no space) should match /#\w+/
      const mockNote = createMockNote({ content: 'This has #important tag' })
      render(
        <ClaudePanel
          currentNote={mockNote}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      expect(screen.getByText('Tags help with organization')).toBeInTheDocument()
    })
  })

  describe('Project Word Count Aggregation', () => {
    it('correctly sums words across all project notes', () => {
      const mockProject = createMockProject()
      const mockNotes = [
        createMockNote({ id: 'n1', project_id: 'project-1', content: 'one two three' }),
        createMockNote({ id: 'n2', project_id: 'project-1', content: 'four five' }),
        createMockNote({ id: 'n3', project_id: 'project-1', content: 'six' })
      ]

      render(
        <ClaudePanel
          currentNote={null}
          currentProject={mockProject}
          notes={mockNotes}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      expect(screen.getByText(/Project contains 3 notes with 6 total words/)).toBeInTheDocument()
    })

    it('shows exactly 5 notes as low density', () => {
      const mockProject = createMockProject()
      const mockNotes = Array(5).fill(null).map((_, i) =>
        createMockNote({ id: `n${i}`, project_id: 'project-1', content: 'word' })
      )

      render(
        <ClaudePanel
          currentNote={null}
          currentProject={mockProject}
          notes={mockNotes}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      expect(screen.getByText('Add more notes to build context')).toBeInTheDocument()
    })
  })

  describe('Word Count Boundary', () => {
    it('shows "Room to expand" for exactly 500 words', () => {
      const content = Array(500).fill('word').join(' ')
      const mockNote = createMockNote({ content })
      render(
        <ClaudePanel
          currentNote={mockNote}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      expect(screen.getByText(/Note has 500 words. Room to expand./)).toBeInTheDocument()
    })

    it('shows "Well developed" for exactly 501 words', () => {
      const content = Array(501).fill('word').join(' ')
      const mockNote = createMockNote({ content })
      render(
        <ClaudePanel
          currentNote={mockNote}
          currentProject={null}
          notes={[]}
          onClose={mockOnClose}
        />
      )

      waitForThinkingComplete()

      expect(screen.getByText(/Note has 501 words. Well developed!/)).toBeInTheDocument()
    })
  })
})
