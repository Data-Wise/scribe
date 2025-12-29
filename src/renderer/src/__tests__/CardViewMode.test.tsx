import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CardViewMode } from '../components/sidebar/CardViewMode'
import { Project, Note } from '../types'

describe('CardViewMode', () => {
  // Test data factories
  const createProject = (overrides: Partial<Project> = {}): Project => ({
    id: `project-${Math.random().toString(36).slice(2)}`,
    name: 'Test Project',
    type: 'research',
    status: 'active',
    progress: 0,
    created_at: Date.now(),
    updated_at: Date.now(),
    ...overrides,
  })

  const createNote = (overrides: Partial<Note> = {}): Note => ({
    id: `note-${Math.random().toString(36).slice(2)}`,
    title: 'Test Note',
    content: 'Test content with some words',
    folder: '/',
    project_id: 'project-1',
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: null,
    ...overrides,
  })

  const defaultHandlers = {
    onSelectProject: vi.fn(),
    onSelectNote: vi.fn(),
    onCreateProject: vi.fn(),
    onNewNote: vi.fn(),
    onCollapse: vi.fn(),
    onEditProject: vi.fn(),
    onArchiveProject: vi.fn(),
    onDeleteProject: vi.fn(),
    onRenameNote: vi.fn(),
    onMoveNoteToProject: vi.fn(),
    onDuplicateNote: vi.fn(),
    onDeleteNote: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders with no projects', () => {
      render(
        <CardViewMode
          projects={[]}
          notes={[]}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      expect(screen.getByText('No projects yet')).toBeInTheDocument()
      expect(screen.getByText('Create your first project')).toBeInTheDocument()
    })

    it('renders project cards', () => {
      const projects = [
        createProject({ id: '1', name: 'Research Project' }),
        createProject({ id: '2', name: 'Teaching Project' }),
      ]

      render(
        <CardViewMode
          projects={projects}
          notes={[]}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      expect(screen.getByText('Research Project')).toBeInTheDocument()
      expect(screen.getByText('Teaching Project')).toBeInTheDocument()
    })

    it('shows correct project count in header', () => {
      const projects = [
        createProject({ id: '1' }),
        createProject({ id: '2' }),
        createProject({ id: '3', status: 'archive' }), // Should not count archived
      ]

      render(
        <CardViewMode
          projects={projects}
          notes={[]}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      // Should show (2) since archived is excluded
      expect(screen.getByText('(2)')).toBeInTheDocument()
    })
  })

  describe('Note Stats', () => {
    it('displays correct note count', () => {
      const project = createProject({ id: 'p1', name: 'My Project' })
      const notes = [
        createNote({ id: 'n1', project_id: 'p1' }),
        createNote({ id: 'n2', project_id: 'p1' }),
        createNote({ id: 'n3', project_id: 'p1' }),
      ]

      render(
        <CardViewMode
          projects={[project]}
          notes={notes}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      expect(screen.getByText('3 notes')).toBeInTheDocument()
    })

    it('displays singular "note" for single note', () => {
      const project = createProject({ id: 'p1' })
      const notes = [createNote({ project_id: 'p1' })]

      render(
        <CardViewMode
          projects={[project]}
          notes={notes}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      expect(screen.getByText('1 note')).toBeInTheDocument()
    })

    it('excludes deleted notes from count', () => {
      const project = createProject({ id: 'p1' })
      const notes = [
        createNote({ id: 'n1', project_id: 'p1', deleted_at: null }),
        createNote({ id: 'n2', project_id: 'p1', deleted_at: Date.now() }), // Deleted
      ]

      render(
        <CardViewMode
          projects={[project]}
          notes={notes}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      expect(screen.getByText('1 note')).toBeInTheDocument()
    })

    it('calculates word count correctly', () => {
      const project = createProject({ id: 'p1' })
      const notes = [
        createNote({
          project_id: 'p1',
          content: 'One two three four five' // 5 words
        }),
      ]

      render(
        <CardViewMode
          projects={[project]}
          notes={notes}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      expect(screen.getByText('5 words')).toBeInTheDocument()
    })

    it('formats large word counts with k suffix', () => {
      const project = createProject({ id: 'p1' })
      const longContent = Array(1500).fill('word').join(' ') // 1500 words
      const notes = [
        createNote({ project_id: 'p1', content: longContent }),
      ]

      render(
        <CardViewMode
          projects={[project]}
          notes={notes}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      expect(screen.getByText('1.5k words')).toBeInTheDocument()
    })
  })

  describe('Expand/Collapse Behavior', () => {
    it('shows note tiles when expanded', () => {
      const project = createProject({ id: 'p1' })
      const notes = [
        createNote({ id: 'n1', project_id: 'p1', title: 'My First Note' }),
      ]

      render(
        <CardViewMode
          projects={[project]}
          notes={notes}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      // Click stats row to expand
      const statsBtn = screen.getByTitle('Show notes')
      fireEvent.click(statsBtn)

      // Note tile should appear
      expect(screen.getByText('My First Note')).toBeInTheDocument()
    })

    it('collapses when clicking stats row again', () => {
      const project = createProject({ id: 'p1' })
      const notes = [
        createNote({ id: 'n1', project_id: 'p1', title: 'My Note' }),
      ]

      render(
        <CardViewMode
          projects={[project]}
          notes={notes}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      // Expand
      const statsBtn = screen.getByTitle('Show notes')
      fireEvent.click(statsBtn)
      expect(screen.getByText('My Note')).toBeInTheDocument()

      // Collapse
      const collapseBtn = screen.getByTitle('Collapse notes')
      fireEvent.click(collapseBtn)

      // Note should be hidden (not in DOM or hidden)
      const noteTile = screen.queryByRole('button', { name: /My Note/i })
      expect(noteTile).not.toBeInTheDocument()
    })

    it('limits note tiles to 6 per project', () => {
      const project = createProject({ id: 'p1' })
      const notes = Array.from({ length: 10 }, (_, i) =>
        createNote({
          id: `n${i}`,
          project_id: 'p1',
          title: `Note ${i + 1}`,
          updated_at: Date.now() - i * 1000, // Newer first
        })
      )

      render(
        <CardViewMode
          projects={[project]}
          notes={notes}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      // Expand
      fireEvent.click(screen.getByTitle('Show notes'))

      // Should show only first 6 (most recent)
      expect(screen.getByText('Note 1')).toBeInTheDocument()
      expect(screen.getByText('Note 6')).toBeInTheDocument()
      expect(screen.queryByText('Note 7')).not.toBeInTheDocument()
    })

    it('shows empty state for project with no notes', () => {
      const project = createProject({ id: 'p1' })

      render(
        <CardViewMode
          projects={[project]}
          notes={[]}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      // Expand
      fireEvent.click(screen.getByTitle('Show notes'))

      expect(screen.getByText('No notes yet')).toBeInTheDocument()
      expect(screen.getByText('Create first note')).toBeInTheDocument()
    })
  })

  describe('Accordion Behavior', () => {
    it('only allows one project expanded at a time', () => {
      const projects = [
        createProject({ id: 'p1', name: 'Project 1' }),
        createProject({ id: 'p2', name: 'Project 2' }),
      ]
      const notes = [
        createNote({ id: 'n1', project_id: 'p1', title: 'Note in P1' }),
        createNote({ id: 'n2', project_id: 'p2', title: 'Note in P2' }),
      ]

      render(
        <CardViewMode
          projects={projects}
          notes={notes}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      const expandButtons = screen.getAllByTitle('Show notes')

      // Expand first project
      fireEvent.click(expandButtons[0])
      expect(screen.getByText('Note in P1')).toBeInTheDocument()
      expect(screen.queryByText('Note in P2')).not.toBeInTheDocument()

      // Expand second project (should collapse first)
      const newExpandButtons = screen.getAllByTitle('Show notes')
      fireEvent.click(newExpandButtons[0]) // First "Show notes" is now Project 2

      expect(screen.queryByText('Note in P1')).not.toBeInTheDocument()
      expect(screen.getByText('Note in P2')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('calls onSelectNote when clicking note tile', () => {
      const project = createProject({ id: 'p1' })
      const notes = [
        createNote({ id: 'note-123', project_id: 'p1', title: 'Click Me' }),
      ]

      render(
        <CardViewMode
          projects={[project]}
          notes={notes}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      // Expand and click note
      fireEvent.click(screen.getByTitle('Show notes'))
      fireEvent.click(screen.getByText('Click Me'))

      expect(defaultHandlers.onSelectNote).toHaveBeenCalledWith('note-123')
    })

    it('calls onNewNote when clicking Create first note', () => {
      const project = createProject({ id: 'p1' })

      render(
        <CardViewMode
          projects={[project]}
          notes={[]}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      // Expand and click create button
      fireEvent.click(screen.getByTitle('Show notes'))
      fireEvent.click(screen.getByText('Create first note'))

      expect(defaultHandlers.onNewNote).toHaveBeenCalledWith('p1')
    })

    it('calls onSelectProject when clicking card header', () => {
      const project = createProject({ id: 'p1', name: 'My Project' })

      render(
        <CardViewMode
          projects={[project]}
          notes={[]}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      // Click on the project header (div with role="button")
      const header = screen.getByText('My Project').closest('.card-header')
      if (header) fireEvent.click(header)

      expect(defaultHandlers.onSelectProject).toHaveBeenCalledWith('p1')
    })

    it('deselects project when clicking already selected project', () => {
      const project = createProject({ id: 'p1', name: 'My Project' })

      render(
        <CardViewMode
          projects={[project]}
          notes={[]}
          currentProjectId="p1" // Already selected
          width={280}
          {...defaultHandlers}
        />
      )

      const header = screen.getByText('My Project').closest('.card-header')
      if (header) fireEvent.click(header)

      expect(defaultHandlers.onSelectProject).toHaveBeenCalledWith(null)
    })
  })

  describe('Search Filtering', () => {
    it('filters projects by name', () => {
      const projects = [
        createProject({ id: '1', name: 'Research Paper' }),
        createProject({ id: '2', name: 'Teaching Course' }),
      ]

      render(
        <CardViewMode
          projects={projects}
          notes={[]}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      const searchInput = screen.getByPlaceholderText('Find project...')
      fireEvent.change(searchInput, { target: { value: 'Research' } })

      expect(screen.getByText('Research Paper')).toBeInTheDocument()
      expect(screen.queryByText('Teaching Course')).not.toBeInTheDocument()
    })

    it('filters by description', () => {
      const projects = [
        createProject({ id: '1', name: 'Project A', description: 'About statistics' }),
        createProject({ id: '2', name: 'Project B', description: 'About cooking' }),
      ]

      render(
        <CardViewMode
          projects={projects}
          notes={[]}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      const searchInput = screen.getByPlaceholderText('Find project...')
      fireEvent.change(searchInput, { target: { value: 'statistics' } })

      expect(screen.getByText('Project A')).toBeInTheDocument()
      expect(screen.queryByText('Project B')).not.toBeInTheDocument()
    })

    it('shows no results message when filter matches nothing', () => {
      const projects = [createProject({ id: '1', name: 'My Project' })]

      render(
        <CardViewMode
          projects={projects}
          notes={[]}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      const searchInput = screen.getByPlaceholderText('Find project...')
      fireEvent.change(searchInput, { target: { value: 'xyz123' } })

      expect(screen.getByText(/No projects match/)).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles project with empty name', () => {
      const project = createProject({ id: '1', name: '' })

      render(
        <CardViewMode
          projects={[project]}
          notes={[]}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      // Should render without crashing
      expect(screen.getByText('0 notes')).toBeInTheDocument()
    })

    it('handles note with empty title', () => {
      const project = createProject({ id: 'p1' })
      const notes = [createNote({ project_id: 'p1', title: '' })]

      render(
        <CardViewMode
          projects={[project]}
          notes={notes}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      fireEvent.click(screen.getByTitle('Show notes'))

      // Should show "Untitled" for empty title
      expect(screen.getByText('Untitled')).toBeInTheDocument()
    })

    it('handles note with null content', () => {
      const project = createProject({ id: 'p1' })
      const notes = [createNote({ project_id: 'p1', content: '' })]

      render(
        <CardViewMode
          projects={[project]}
          notes={notes}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      // Word count should be 0
      expect(screen.getByText('0 words')).toBeInTheDocument()
    })

    it('handles very long project name', () => {
      const longName = 'A'.repeat(100)
      const project = createProject({ id: '1', name: longName })

      render(
        <CardViewMode
          projects={[project]}
          notes={[]}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      // Should render without breaking layout
      expect(screen.getByText(longName)).toBeInTheDocument()
    })

    it('sorts notes by updated_at (most recent first)', () => {
      const project = createProject({ id: 'p1' })
      const now = Date.now()
      const notes = [
        createNote({ id: 'n1', project_id: 'p1', title: 'Old Note', updated_at: now - 10000 }),
        createNote({ id: 'n2', project_id: 'p1', title: 'New Note', updated_at: now }),
        createNote({ id: 'n3', project_id: 'p1', title: 'Middle Note', updated_at: now - 5000 }),
      ]

      render(
        <CardViewMode
          projects={[project]}
          notes={notes}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      fireEvent.click(screen.getByTitle('Show notes'))

      const noteTitles = screen.getAllByRole('button', { name: /Note/ })
        .map(btn => btn.textContent)
        .filter(text => text?.includes('Note'))

      // New Note should appear first
      expect(noteTitles[0]).toContain('New Note')
    })
  })

  describe('Visual States', () => {
    it('applies active class to selected project', () => {
      const project = createProject({ id: 'p1' })

      const { container } = render(
        <CardViewMode
          projects={[project]}
          notes={[]}
          currentProjectId="p1"
          width={280}
          {...defaultHandlers}
        />
      )

      const card = container.querySelector('.project-card.active')
      expect(card).toBeInTheDocument()
    })

    it('applies expanded class when project is expanded', () => {
      const project = createProject({ id: 'p1' })
      const notes = [createNote({ project_id: 'p1' })]

      const { container } = render(
        <CardViewMode
          projects={[project]}
          notes={notes}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      fireEvent.click(screen.getByTitle('Show notes'))

      const card = container.querySelector('.project-card.expanded')
      expect(card).toBeInTheDocument()
    })
  })
})
