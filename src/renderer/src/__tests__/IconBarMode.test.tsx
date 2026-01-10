import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { IconBarMode } from '../components/sidebar/IconBarMode'
import { Project, Note } from '../types'

/**
 * IconBarMode Component Integration Test Suite
 *
 * Tests the Icon Mode sidebar with InboxButton, project icons, and Activity Bar
 */
describe('IconBarMode Component', () => {
  const mockProjects: Project[] = [
    {
      id: 'proj-1',
      name: 'Research Project',
      status: 'active',
      created_at: Date.now() - 86400000,
      updated_at: Date.now(),
      sort_order: 1
    },
    {
      id: 'proj-2',
      name: 'Writing Project',
      status: 'active',
      created_at: Date.now() - 172800000,
      updated_at: Date.now() - 43200000,
      sort_order: 2
    }
  ]

  const mockNotes: Note[] = [
    {
      id: 'note-1',
      title: 'Assigned Note',
      content: 'Content',
      project_id: 'proj-1',
      created_at: Date.now(),
      updated_at: Date.now()
    },
    {
      id: 'note-2',
      title: 'Unassigned Note 1',
      content: 'Content',
      project_id: null, // Inbox note
      created_at: Date.now(),
      updated_at: Date.now()
    },
    {
      id: 'note-3',
      title: 'Unassigned Note 2',
      content: 'Content',
      project_id: null, // Inbox note
      created_at: Date.now(),
      updated_at: Date.now()
    }
  ]

  const mockHandlers = {
    onSelectProject: vi.fn(),
    onCreateProject: vi.fn(),
    onExpand: vi.fn(),
    onSearch: vi.fn(),
    onDaily: vi.fn(),
    onSettings: vi.fn(),
    onSelectNote: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Structure', () => {
    it('renders all major sections', () => {
      render(
        <IconBarMode
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      // Expand button
      expect(screen.getByTitle('Expand sidebar (⌘0)')).toBeInTheDocument()

      // Inbox button
      expect(screen.getByTestId('inbox-icon-button')).toBeInTheDocument()

      // Activity Bar
      expect(screen.getByTestId('activity-bar')).toBeInTheDocument()
    })

    it('renders expand/collapse button at top', () => {
      render(
        <IconBarMode
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      const expandButton = screen.getByTitle('Expand sidebar (⌘0)')
      expect(expandButton).toBeInTheDocument()
    })

    it('renders Activity Bar at bottom', () => {
      render(
        <IconBarMode
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('activity-bar')).toBeInTheDocument()
    })
  })

  describe('InboxButton Integration', () => {
    it('renders InboxButton at top of sidebar', () => {
      render(
        <IconBarMode
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('inbox-icon-button')).toBeInTheDocument()
    })

    it('shows correct unread count for unassigned notes', () => {
      render(
        <IconBarMode
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      // mockNotes has 2 unassigned notes (note-2, note-3)
      const badge = screen.getByTestId('inbox-badge')
      expect(badge).toHaveTextContent('2')
    })

    it('shows no badge when all notes are assigned', () => {
      const assignedNotes: Note[] = [
        {
          id: 'note-1',
          title: 'Assigned Note',
          content: 'Content',
          project_id: 'proj-1',
          created_at: Date.now(),
          updated_at: Date.now()
        }
      ]

      render(
        <IconBarMode
          projects={mockProjects}
          notes={assignedNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      expect(screen.queryByTestId('inbox-badge')).not.toBeInTheDocument()
    })

    it('excludes deleted notes from inbox count', () => {
      const notesWithDeleted: Note[] = [
        ...mockNotes,
        {
          id: 'note-deleted',
          title: 'Deleted Unassigned Note',
          content: 'Content',
          project_id: null,
          created_at: Date.now(),
          updated_at: Date.now(),
          deleted_at: Date.now() // Deleted
        }
      ]

      render(
        <IconBarMode
          projects={mockProjects}
          notes={notesWithDeleted}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      // Should still show 2 (not 3)
      const badge = screen.getByTestId('inbox-badge')
      expect(badge).toHaveTextContent('2')
    })

    it('shows active state when Inbox is selected (currentProjectId is null)', () => {
      render(
        <IconBarMode
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null} // Inbox is active
          {...mockHandlers}
        />
      )

      const inboxButton = screen.getByTestId('inbox-icon-button')
      expect(inboxButton).toHaveClass('active')
    })

    it('does not show active state when a project is selected', () => {
      render(
        <IconBarMode
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId="proj-1" // Project is active
          {...mockHandlers}
        />
      )

      const inboxButton = screen.getByTestId('inbox-icon-button')
      expect(inboxButton).not.toHaveClass('active')
    })

    it('calls onSelectProject(null) when InboxButton is clicked', () => {
      render(
        <IconBarMode
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId="proj-1"
          {...mockHandlers}
        />
      )

      const inboxButton = screen.getByTestId('inbox-icon-button')
      fireEvent.click(inboxButton)

      expect(mockHandlers.onSelectProject).toHaveBeenCalledWith(null)
      expect(mockHandlers.onSelectProject).toHaveBeenCalledTimes(1)
    })

    it('deselects current project when InboxButton is clicked', () => {
      render(
        <IconBarMode
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId="proj-1" // Currently on a project
          {...mockHandlers}
        />
      )

      const inboxButton = screen.getByTestId('inbox-icon-button')
      fireEvent.click(inboxButton)

      // Should call with null to show inbox view
      expect(mockHandlers.onSelectProject).toHaveBeenCalledWith(null)
    })
  })

  describe('Project Icons', () => {
    // TODO: Update for new IconBarMode structure (Sprint 35/36 refactor)
    it.skip('renders project icons', () => {
      render(
        <IconBarMode
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('project-icon-proj-1')).toBeInTheDocument()
      expect(screen.getByTestId('project-icon-proj-2')).toBeInTheDocument()
    })

    // TODO: Update for new IconBarMode structure
    it.skip('limits visible projects to MAX_VISIBLE_PROJECTS (8)', () => {
      const manyProjects: Project[] = Array.from({ length: 12 }, (_, i) => ({
        id: `proj-${i}`,
        name: `Project ${i}`,
        status: 'active' as const,
        created_at: Date.now() - i * 1000,
        updated_at: Date.now() - i * 1000,
        sort_order: i
      }))

      render(
        <IconBarMode
          projects={manyProjects}
          notes={[]}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      // Should show max 8 projects
      const projectIcons = screen.getAllByTestId(/^project-icon-/)
      expect(projectIcons).toHaveLength(8)
    })

    // TODO: Update for new IconBarMode structure
    it.skip('shows active project first in list', () => {
      render(
        <IconBarMode
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId="proj-2"
          {...mockHandlers}
        />
      )

      const projectIcons = screen.getAllByTestId(/^project-icon-/)

      // First icon should be the active project (proj-2)
      expect(projectIcons[0]).toHaveAttribute('data-testid', 'project-icon-proj-2')
    })

    it('filters out archived projects', () => {
      const projectsWithArchived: Project[] = [
        ...mockProjects,
        {
          id: 'proj-archived',
          name: 'Archived Project',
          status: 'archive',
          created_at: Date.now(),
          updated_at: Date.now(),
          sort_order: 3
        }
      ]

      render(
        <IconBarMode
          projects={projectsWithArchived}
          notes={[]}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      // Should not show archived project
      expect(screen.queryByTestId('project-icon-proj-archived')).not.toBeInTheDocument()
    })
  })

  describe('Expand/Collapse Button', () => {
    it('calls onExpand when expand button is clicked', () => {
      render(
        <IconBarMode
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      const expandButton = screen.getByTitle('Expand sidebar (⌘0)')
      fireEvent.click(expandButton)

      expect(mockHandlers.onExpand).toHaveBeenCalledTimes(1)
    })
  })

  describe('Activity Bar Integration', () => {
    it('renders Activity Bar with all three buttons', () => {
      render(
        <IconBarMode
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('activity-bar-search')).toBeInTheDocument()
      expect(screen.getByTestId('activity-bar-daily')).toBeInTheDocument()
      expect(screen.getByTestId('activity-bar-settings')).toBeInTheDocument()
    })

    it('calls onSearch when search button is clicked', () => {
      render(
        <IconBarMode
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      const searchButton = screen.getByTestId('activity-bar-search')
      fireEvent.click(searchButton)

      expect(mockHandlers.onSearch).toHaveBeenCalledTimes(1)
    })

    it('calls onDaily when daily button is clicked', () => {
      render(
        <IconBarMode
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      const dailyButton = screen.getByTestId('activity-bar-daily')
      fireEvent.click(dailyButton)

      expect(mockHandlers.onDaily).toHaveBeenCalledTimes(1)
    })

    it('calls onSettings when settings button is clicked', () => {
      render(
        <IconBarMode
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      const settingsButton = screen.getByTestId('activity-bar-settings')
      fireEvent.click(settingsButton)

      expect(mockHandlers.onSettings).toHaveBeenCalledTimes(1)
    })

    it('highlights active activity item', () => {
      render(
        <IconBarMode
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          activeActivityItem="search"
          {...mockHandlers}
        />
      )

      const searchButton = screen.getByTestId('activity-bar-search')
      expect(searchButton).toHaveClass('active')
    })
  })

  describe('Add Project Button', () => {
    it('renders add project button', () => {
      render(
        <IconBarMode
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByTitle('New project (⌘⇧P)')).toBeInTheDocument()
    })

    it('calls onCreateProject when add button is clicked', () => {
      render(
        <IconBarMode
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      const addButton = screen.getByTitle('New project (⌘⇧P)')
      fireEvent.click(addButton)

      expect(mockHandlers.onCreateProject).toHaveBeenCalledTimes(1)
    })
  })

  describe('Layout Order', () => {
    // TODO: Update for new IconBarMode structure
    it.skip('maintains correct top-to-bottom order', () => {
      const { container } = render(
        <IconBarMode
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      const sidebar = container.querySelector('.mission-sidebar-icon')
      const children = Array.from(sidebar?.children || [])

      // Verify order: expand, divider, inbox, divider, projects, spacer, add, activity-bar
      expect(children[0]).toHaveClass('sidebar-toggle-btn') // Expand button
      expect(children[1]).toHaveClass('sidebar-divider')
      // InboxButton is wrapped in Tooltip, so we check for its presence
      expect(children[3]).toHaveClass('sidebar-divider')
      expect(children[4]).toHaveClass('project-icons')
    })
  })

  describe('Empty States', () => {
    it('renders correctly with no projects', () => {
      render(
        <IconBarMode
          projects={[]}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('inbox-icon-button')).toBeInTheDocument()
      expect(screen.getByTestId('activity-bar')).toBeInTheDocument()
    })

    it('renders correctly with no notes', () => {
      render(
        <IconBarMode
          projects={mockProjects}
          notes={[]}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('inbox-icon-button')).toBeInTheDocument()
      expect(screen.queryByTestId('inbox-badge')).not.toBeInTheDocument()
    })

    it('renders correctly with no projects and no notes', () => {
      render(
        <IconBarMode
          projects={[]}
          notes={[]}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('inbox-icon-button')).toBeInTheDocument()
      expect(screen.getByTestId('activity-bar')).toBeInTheDocument()
      expect(screen.getByTitle('New project (⌘⇧P)')).toBeInTheDocument()
    })
  })

  describe('Note Count Calculation', () => {
    // TODO: Update for new IconBarMode structure
    it.skip('calculates note counts per project correctly', () => {
      const notesForCounting: Note[] = [
        { id: 'n1', title: 'N1', content: '', project_id: 'proj-1', created_at: Date.now(), updated_at: Date.now() },
        { id: 'n2', title: 'N2', content: '', project_id: 'proj-1', created_at: Date.now(), updated_at: Date.now() },
        { id: 'n3', title: 'N3', content: '', project_id: 'proj-2', created_at: Date.now(), updated_at: Date.now() }
      ]

      render(
        <IconBarMode
          projects={mockProjects}
          notes={notesForCounting}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      // Project 1 should have badge with "2"
      const proj1Badge = screen.getByTestId('project-badge-proj-1')
      expect(proj1Badge).toHaveTextContent('2')

      // Project 2 should have badge with "1"
      const proj2Badge = screen.getByTestId('project-badge-proj-2')
      expect(proj2Badge).toHaveTextContent('1')
    })

    // TODO: Update for new IconBarMode structure
    it.skip('excludes deleted notes from project counts', () => {
      const notesWithDeleted: Note[] = [
        { id: 'n1', title: 'N1', content: '', project_id: 'proj-1', created_at: Date.now(), updated_at: Date.now() },
        {
          id: 'n2',
          title: 'N2',
          content: '',
          project_id: 'proj-1',
          created_at: Date.now(),
          updated_at: Date.now(),
          deleted_at: Date.now() // Deleted
        }
      ]

      render(
        <IconBarMode
          projects={mockProjects}
          notes={notesWithDeleted}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      // Should only count 1 (not 2)
      const proj1Badge = screen.getByTestId('project-badge-proj-1')
      expect(proj1Badge).toHaveTextContent('1')
    })
  })
})
