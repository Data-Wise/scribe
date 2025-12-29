import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CompactListMode } from '../components/sidebar/CompactListMode'
import { Project, Note } from '../types'

describe('CompactListMode', () => {
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
      const { container } = render(
        <CompactListMode
          projects={[]}
          notes={[]}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      // Should show (0) count
      expect(screen.getByText('(0)')).toBeInTheDocument()
      // Should have the project list container (empty)
      expect(container.querySelector('.project-list-compact')).toBeInTheDocument()
    })

    it('renders project items', () => {
      const projects = [
        createProject({ id: '1', name: 'Research Project' }),
        createProject({ id: '2', name: 'Teaching Project' }),
      ]

      render(
        <CompactListMode
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
        <CompactListMode
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

    it('excludes archived projects from list', () => {
      const projects = [
        createProject({ id: '1', name: 'Active Project', status: 'active' }),
        createProject({ id: '2', name: 'Archived Project', status: 'archive' }),
      ]

      render(
        <CompactListMode
          projects={projects}
          notes={[]}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      expect(screen.getByText('Active Project')).toBeInTheDocument()
      expect(screen.queryByText('Archived Project')).not.toBeInTheDocument()
    })
  })

  describe('Search Behavior', () => {
    it('hides search when <= 5 projects', () => {
      const projects = Array.from({ length: 5 }, (_, i) =>
        createProject({ id: `${i}`, name: `Project ${i}` })
      )

      render(
        <CompactListMode
          projects={projects}
          notes={[]}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      expect(screen.queryByPlaceholderText('Find project...')).not.toBeInTheDocument()
    })

    it('shows search when > 5 projects', () => {
      const projects = Array.from({ length: 6 }, (_, i) =>
        createProject({ id: `${i}`, name: `Project ${i}` })
      )

      render(
        <CompactListMode
          projects={projects}
          notes={[]}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      expect(screen.getByPlaceholderText('Find project...')).toBeInTheDocument()
    })

    it('filters projects by name', () => {
      const projects = Array.from({ length: 6 }, (_, i) =>
        createProject({ id: `${i}`, name: i === 0 ? 'Research Paper' : `Project ${i}` })
      )

      render(
        <CompactListMode
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
      expect(screen.queryByText('Project 1')).not.toBeInTheDocument()
    })

    it('shows no results message when filter matches nothing', () => {
      const projects = Array.from({ length: 6 }, (_, i) =>
        createProject({ id: `${i}`, name: `Project ${i}` })
      )

      render(
        <CompactListMode
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

  describe('Expand/Collapse Behavior', () => {
    it('expands project when currentProjectId matches', () => {
      const project = createProject({ id: 'p1', name: 'My Project' })

      const { container } = render(
        <CompactListMode
          projects={[project]}
          notes={[]}
          currentProjectId="p1" // Expanded
          width={280}
          {...defaultHandlers}
        />
      )

      const expandedWrapper = container.querySelector('.compact-project-wrapper.expanded')
      expect(expandedWrapper).toBeInTheDocument()
    })

    it('shows ProjectContextCard when expanded', () => {
      const project = createProject({ id: 'p1', name: 'My Project', progress: 50 })

      render(
        <CompactListMode
          projects={[project]}
          notes={[]}
          currentProjectId="p1"
          width={280}
          {...defaultHandlers}
        />
      )

      // ProjectContextCard shows project details
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('shows notes list when expanded with notes', () => {
      const project = createProject({ id: 'p1' })
      const notes = [
        createNote({ id: 'n1', project_id: 'p1', title: 'First Note' }),
        createNote({ id: 'n2', project_id: 'p1', title: 'Second Note' }),
      ]

      render(
        <CompactListMode
          projects={[project]}
          notes={notes}
          currentProjectId="p1"
          width={280}
          {...defaultHandlers}
        />
      )

      expect(screen.getByText('First Note')).toBeInTheDocument()
      expect(screen.getByText('Second Note')).toBeInTheDocument()
    })

    it('limits visible notes to 5 and shows "+X more"', () => {
      const project = createProject({ id: 'p1' })
      const notes = Array.from({ length: 8 }, (_, i) =>
        createNote({
          id: `n${i}`,
          project_id: 'p1',
          title: `Note ${i + 1}`,
          updated_at: Date.now() - i * 1000,
        })
      )

      render(
        <CompactListMode
          projects={[project]}
          notes={notes}
          currentProjectId="p1"
          width={280}
          {...defaultHandlers}
        />
      )

      // Should show first 5
      expect(screen.getByText('Note 1')).toBeInTheDocument()
      expect(screen.getByText('Note 5')).toBeInTheDocument()
      // Should NOT show 6th
      expect(screen.queryByText('Note 6')).not.toBeInTheDocument()
      // Should show "+3 more"
      expect(screen.getByText('+3 more')).toBeInTheDocument()
    })

    it('collapses when clicking expanded project header', () => {
      const project = createProject({ id: 'p1', name: 'My Project' })

      const { container } = render(
        <CompactListMode
          projects={[project]}
          notes={[]}
          currentProjectId="p1"
          width={280}
          {...defaultHandlers}
        />
      )

      // Click on the expanded project item (header button) to collapse
      const expandedItem = container.querySelector('.compact-project-item.expanded')
      if (expandedItem) fireEvent.click(expandedItem)

      // Should call with null to deselect
      expect(defaultHandlers.onSelectProject).toHaveBeenCalledWith(null)
    })

    it('expands when clicking collapsed project', () => {
      const project = createProject({ id: 'p1', name: 'My Project' })

      render(
        <CompactListMode
          projects={[project]}
          notes={[]}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      fireEvent.click(screen.getByText('My Project'))

      expect(defaultHandlers.onSelectProject).toHaveBeenCalledWith('p1')
    })
  })

  describe('User Interactions', () => {
    it('calls onSelectNote when clicking note item', () => {
      const project = createProject({ id: 'p1' })
      const notes = [createNote({ id: 'note-123', project_id: 'p1', title: 'Click Me' })]

      render(
        <CompactListMode
          projects={[project]}
          notes={notes}
          currentProjectId="p1"
          width={280}
          {...defaultHandlers}
        />
      )

      fireEvent.click(screen.getByText('Click Me'))

      expect(defaultHandlers.onSelectNote).toHaveBeenCalledWith('note-123')
    })

    it('calls onCreateProject when clicking New Project button', () => {
      render(
        <CompactListMode
          projects={[]}
          notes={[]}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      fireEvent.click(screen.getByText('New Project'))

      expect(defaultHandlers.onCreateProject).toHaveBeenCalled()
    })

    it('calls onCollapse when clicking menu button', () => {
      render(
        <CompactListMode
          projects={[]}
          notes={[]}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      fireEvent.click(screen.getByTitle('Collapse sidebar (⌘0)'))

      expect(defaultHandlers.onCollapse).toHaveBeenCalled()
    })
  })

  describe('Sorting', () => {
    it('sorts selected project first', () => {
      const projects = [
        createProject({ id: 'p1', name: 'Alpha', updated_at: Date.now() }),
        createProject({ id: 'p2', name: 'Beta', updated_at: Date.now() - 1000 }),
        createProject({ id: 'p3', name: 'Gamma', updated_at: Date.now() - 2000 }),
      ]

      const { container } = render(
        <CompactListMode
          projects={projects}
          notes={[]}
          currentProjectId="p3" // Select Gamma (oldest)
          width={280}
          {...defaultHandlers}
        />
      )

      // Gamma should be first because it's selected
      const projectNames = container.querySelectorAll('.project-name')
      expect(projectNames[0].textContent).toBe('Gamma')
    })

    it('sorts by updated_at (most recent first) for non-selected', () => {
      const now = Date.now()
      const projects = [
        createProject({ id: 'p1', name: 'Old', updated_at: now - 10000 }),
        createProject({ id: 'p2', name: 'New', updated_at: now }),
        createProject({ id: 'p3', name: 'Middle', updated_at: now - 5000 }),
      ]

      const { container } = render(
        <CompactListMode
          projects={projects}
          notes={[]}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      const projectNames = container.querySelectorAll('.project-name')
      expect(projectNames[0].textContent).toBe('New')
      expect(projectNames[1].textContent).toBe('Middle')
      expect(projectNames[2].textContent).toBe('Old')
    })
  })

  describe('Note Stats', () => {
    it('calculates correct note count per project', () => {
      const projects = [
        createProject({ id: 'p1', name: 'Project 1' }),
        createProject({ id: 'p2', name: 'Project 2' }),
      ]
      const notes = [
        createNote({ id: 'n1', project_id: 'p1' }),
        createNote({ id: 'n2', project_id: 'p1' }),
        createNote({ id: 'n3', project_id: 'p2' }),
      ]

      render(
        <CompactListMode
          projects={projects}
          notes={notes}
          currentProjectId="p1"
          width={280}
          {...defaultHandlers}
        />
      )

      // ProjectContextCard should show note count
      expect(screen.getByText('2 notes')).toBeInTheDocument()
    })

    it('excludes deleted notes from count', () => {
      const project = createProject({ id: 'p1' })
      const notes = [
        createNote({ id: 'n1', project_id: 'p1', deleted_at: null }),
        createNote({ id: 'n2', project_id: 'p1', deleted_at: Date.now() }), // Deleted
      ]

      render(
        <CompactListMode
          projects={[project]}
          notes={notes}
          currentProjectId="p1"
          width={280}
          {...defaultHandlers}
        />
      )

      // Should show 1 note (excluding deleted)
      expect(screen.getByText('1 note')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles project with empty name', () => {
      const project = createProject({ id: '1', name: '' })

      render(
        <CompactListMode
          projects={[project]}
          notes={[]}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      // Should render without crashing
      expect(screen.getByText('(1)')).toBeInTheDocument()
    })

    it('handles note with empty title showing "Untitled"', () => {
      const project = createProject({ id: 'p1' })
      const notes = [createNote({ project_id: 'p1', title: '' })]

      render(
        <CompactListMode
          projects={[project]}
          notes={notes}
          currentProjectId="p1"
          width={280}
          {...defaultHandlers}
        />
      )

      expect(screen.getByText('Untitled')).toBeInTheDocument()
    })

    it('handles notes with no project_id gracefully', () => {
      const project = createProject({ id: 'p1' })
      const notes = [
        createNote({ id: 'n1', project_id: 'p1', title: 'With Project' }),
        createNote({ id: 'n2', project_id: undefined as any, title: 'No Project' }),
      ]

      render(
        <CompactListMode
          projects={[project]}
          notes={notes}
          currentProjectId="p1"
          width={280}
          {...defaultHandlers}
        />
      )

      // Should only show notes belonging to the project
      expect(screen.getByText('With Project')).toBeInTheDocument()
      expect(screen.queryByText('No Project')).not.toBeInTheDocument()
    })

    it('sorts notes by updated_at (most recent first)', () => {
      const project = createProject({ id: 'p1' })
      const now = Date.now()
      const notes = [
        createNote({ id: 'n1', project_id: 'p1', title: 'Old Note', updated_at: now - 10000 }),
        createNote({ id: 'n2', project_id: 'p1', title: 'New Note', updated_at: now }),
        createNote({ id: 'n3', project_id: 'p1', title: 'Middle Note', updated_at: now - 5000 }),
      ]

      const { container } = render(
        <CompactListMode
          projects={[project]}
          notes={notes}
          currentProjectId="p1"
          width={280}
          {...defaultHandlers}
        />
      )

      const noteTitles = container.querySelectorAll('.note-title')
      expect(noteTitles[0].textContent).toBe('New Note')
      expect(noteTitles[1].textContent).toBe('Middle Note')
      expect(noteTitles[2].textContent).toBe('Old Note')
    })
  })

  describe('Visual States', () => {
    it('shows chevron right for collapsed project', () => {
      const project = createProject({ id: 'p1' })

      const { container } = render(
        <CompactListMode
          projects={[project]}
          notes={[]}
          currentProjectId={null}
          width={280}
          {...defaultHandlers}
        />
      )

      // ChevronRight is used for collapsed (class "chevron" without "open")
      const chevron = container.querySelector('.chevron:not(.open)')
      expect(chevron).toBeInTheDocument()
    })

    it('shows chevron down for expanded project', () => {
      const project = createProject({ id: 'p1' })

      const { container } = render(
        <CompactListMode
          projects={[project]}
          notes={[]}
          currentProjectId="p1"
          width={280}
          {...defaultHandlers}
        />
      )

      // ChevronDown is used for expanded (class "chevron open")
      const chevron = container.querySelector('.chevron.open')
      expect(chevron).toBeInTheDocument()
    })

    it('shows folder-open icon for expanded project', () => {
      const project = createProject({ id: 'p1' })

      const { container } = render(
        <CompactListMode
          projects={[project]}
          notes={[]}
          currentProjectId="p1"
          width={280}
          {...defaultHandlers}
        />
      )

      // Expanded shows folder-open (check by presence of expanded wrapper)
      const expandedWrapper = container.querySelector('.compact-project-wrapper.expanded')
      expect(expandedWrapper).toBeInTheDocument()
    })
  })

  describe('Activity Dots', () => {
    it('shows ActivityDots for collapsed projects', () => {
      const project = createProject({ id: 'p1' })
      const notes = [
        createNote({ project_id: 'p1', updated_at: Date.now() - 1000 }),
      ]

      const { container } = render(
        <CompactListMode
          projects={[project]}
          notes={notes}
          currentProjectId={null} // Not expanded
          width={280}
          {...defaultHandlers}
        />
      )

      // ActivityDots component should be present
      const activityDots = container.querySelector('.activity-dots')
      expect(activityDots).toBeInTheDocument()
    })

    it('shows ProjectContextCard (not ActivityDots) for expanded projects', () => {
      const project = createProject({ id: 'p1', progress: 75 })
      const notes = [createNote({ project_id: 'p1' })]

      const { container } = render(
        <CompactListMode
          projects={[project]}
          notes={notes}
          currentProjectId="p1" // Expanded
          width={280}
          {...defaultHandlers}
        />
      )

      // Expanded view shows ProjectContextCard instead of simple ActivityDots
      const contextCard = container.querySelector('.project-context-card')
      expect(contextCard).toBeInTheDocument()
      // Progress should be shown
      expect(screen.getByText('75%')).toBeInTheDocument()
    })
  })
})
