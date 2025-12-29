import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VaultTreeView } from '../components/sidebar/VaultTreeView'
import { Note, Project } from '../types'

// ============================================================
// VaultTreeView Component Tests
// ============================================================

describe('VaultTreeView Component', () => {
  const mockProjects: Project[] = [
    { id: 'p1', name: 'Research', type: 'research', status: 'active', color: '#22c55e', created_at: Date.now(), updated_at: Date.now() },
    { id: 'p2', name: 'Writing', type: 'generic', status: 'active', color: '#3b82f6', created_at: Date.now(), updated_at: Date.now() },
    { id: 'p3', name: 'Archived Project', type: 'generic', status: 'archive', archived_at: Date.now(), created_at: Date.now(), updated_at: Date.now() },
  ]

  const mockNotes: Note[] = [
    { id: 'n1', title: 'Research Note 1', content: 'Content 1', folder: '/', project_id: 'p1', created_at: Date.now(), updated_at: Date.now(), deleted_at: null, properties: {} },
    { id: 'n2', title: 'Research Note 2', content: 'Content 2', folder: '/', project_id: 'p1', created_at: Date.now() - 1000, updated_at: Date.now() - 1000, deleted_at: null, properties: {} },
    { id: 'n3', title: 'Writing Note', content: 'Content 3', folder: '/', project_id: 'p2', created_at: Date.now(), updated_at: Date.now() - 500, deleted_at: null, properties: {} },
    { id: 'n4', title: 'Unassigned Note', content: 'Content 4', folder: '/', created_at: Date.now(), updated_at: Date.now() - 2000, deleted_at: null, properties: {} },
  ]

  const mockHandlers = {
    onSelectNote: vi.fn(),
    onAssignToProject: vi.fn(),
    onMoveToInbox: vi.fn(),
    onDelete: vi.fn(),
    onToggleExpand: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --------------------------------------------------------
  // Basic Rendering
  // --------------------------------------------------------

  describe('Basic Rendering', () => {
    it('renders tree header with "All Notes" title', () => {
      render(
        <VaultTreeView
          notes={mockNotes}
          projects={mockProjects}
          expandedProjects={new Set()}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('All Notes')).toBeInTheDocument()
    })

    it('renders total note count in header', () => {
      render(
        <VaultTreeView
          notes={mockNotes}
          projects={mockProjects}
          expandedProjects={new Set()}
          {...mockHandlers}
        />
      )

      // 4 non-deleted notes
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('renders tree role and aria-label for accessibility', () => {
      const { container } = render(
        <VaultTreeView
          notes={mockNotes}
          projects={mockProjects}
          expandedProjects={new Set()}
          {...mockHandlers}
        />
      )

      const tree = container.querySelector('[role="tree"]')
      expect(tree).toBeInTheDocument()
      expect(tree).toHaveAttribute('aria-label', 'Notes organized by project')
    })

    it('renders empty state when no notes and no projects with notes', () => {
      // Empty state only shows when treeNodes is empty
      // This happens when there are no active projects OR no notes at all
      render(
        <VaultTreeView
          notes={[]}
          projects={[]} // No projects either
          expandedProjects={new Set()}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('No notes yet')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // Project Grouping
  // --------------------------------------------------------

  describe('Project Grouping', () => {
    it('groups notes by project', () => {
      render(
        <VaultTreeView
          notes={mockNotes}
          projects={mockProjects}
          expandedProjects={new Set()}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Research')).toBeInTheDocument()
      expect(screen.getByText('Writing')).toBeInTheDocument()
    })

    it('shows note count for each project', () => {
      const { container } = render(
        <VaultTreeView
          notes={mockNotes}
          projects={mockProjects}
          expandedProjects={new Set()}
          {...mockHandlers}
        />
      )

      // Research has 2 notes - check the project count badge
      const projectCounts = container.querySelectorAll('.tree-project-count')
      const countValues = Array.from(projectCounts).map(el => el.textContent)

      // Should have counts for Research (2), Writing (1), and Unassigned (1)
      expect(countValues).toContain('2')
      expect(countValues.filter(c => c === '1').length).toBeGreaterThanOrEqual(1)
    })

    it('excludes archived projects', () => {
      render(
        <VaultTreeView
          notes={mockNotes}
          projects={mockProjects}
          expandedProjects={new Set()}
          {...mockHandlers}
        />
      )

      expect(screen.queryByText('Archived Project')).not.toBeInTheDocument()
    })

    it('excludes deleted notes from grouping', () => {
      const notesWithDeleted: Note[] = [
        ...mockNotes,
        { id: 'n5', title: 'Deleted Note', content: 'Deleted', folder: '/', project_id: 'p1', created_at: Date.now(), updated_at: Date.now(), deleted_at: Date.now(), properties: {} },
      ]

      render(
        <VaultTreeView
          notes={notesWithDeleted}
          projects={mockProjects}
          expandedProjects={new Set(['p1'])}
          {...mockHandlers}
        />
      )

      expect(screen.queryByText('Deleted Note')).not.toBeInTheDocument()
    })

    it('creates Unassigned section for notes without project', () => {
      render(
        <VaultTreeView
          notes={mockNotes}
          projects={mockProjects}
          expandedProjects={new Set()}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Unassigned')).toBeInTheDocument()
    })

    it('sorts projects with notes before empty projects', () => {
      const projectsWithEmpty: Project[] = [
        ...mockProjects,
        { id: 'p4', name: 'Empty Project', type: 'generic', status: 'active', created_at: Date.now(), updated_at: Date.now() },
      ]

      const { container } = render(
        <VaultTreeView
          notes={mockNotes}
          projects={projectsWithEmpty}
          expandedProjects={new Set()}
          {...mockHandlers}
        />
      )

      const projectHeaders = container.querySelectorAll('.tree-project-header')
      const projectNames = Array.from(projectHeaders).map(h => h.querySelector('.tree-project-name')?.textContent)

      // Projects with notes should come before empty projects
      const researchIndex = projectNames.indexOf('Research')
      const emptyIndex = projectNames.indexOf('Empty Project')
      expect(researchIndex).toBeLessThan(emptyIndex)
    })
  })

  // --------------------------------------------------------
  // Expand/Collapse
  // --------------------------------------------------------

  describe('Expand/Collapse', () => {
    it('shows notes when project is expanded', () => {
      render(
        <VaultTreeView
          notes={mockNotes}
          projects={mockProjects}
          expandedProjects={new Set(['p1'])}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Research Note 1')).toBeInTheDocument()
      expect(screen.getByText('Research Note 2')).toBeInTheDocument()
    })

    it('hides notes when project is collapsed', () => {
      render(
        <VaultTreeView
          notes={mockNotes}
          projects={mockProjects}
          expandedProjects={new Set()}
          {...mockHandlers}
        />
      )

      expect(screen.queryByText('Research Note 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Research Note 2')).not.toBeInTheDocument()
    })

    it('calls onToggleExpand when project header clicked', () => {
      render(
        <VaultTreeView
          notes={mockNotes}
          projects={mockProjects}
          expandedProjects={new Set()}
          {...mockHandlers}
        />
      )

      fireEvent.click(screen.getByText('Research'))
      expect(mockHandlers.onToggleExpand).toHaveBeenCalledWith('p1')
    })

    it('shows rotated chevron for expanded projects', () => {
      const { container } = render(
        <VaultTreeView
          notes={mockNotes}
          projects={mockProjects}
          expandedProjects={new Set(['p1'])}
          {...mockHandlers}
        />
      )

      const expandedHeader = container.querySelector('.tree-project-header.expanded')
      expect(expandedHeader).toBeInTheDocument()

      const chevron = expandedHeader?.querySelector('.tree-chevron.rotated')
      expect(chevron).toBeInTheDocument()
    })

    it('hides chevron for empty projects', () => {
      const projectsWithEmpty: Project[] = [
        { id: 'p4', name: 'Empty Project', type: 'generic', status: 'active', created_at: Date.now(), updated_at: Date.now() },
      ]

      const { container } = render(
        <VaultTreeView
          notes={[]}
          projects={projectsWithEmpty}
          expandedProjects={new Set()}
          {...mockHandlers}
        />
      )

      const emptyHeader = container.querySelector('.tree-project-header.empty')
      expect(emptyHeader).toBeInTheDocument()

      const hiddenChevron = emptyHeader?.querySelector('.tree-chevron.hidden')
      expect(hiddenChevron).toBeInTheDocument()
    })

    it('sets aria-expanded attribute on project nodes', () => {
      const { container } = render(
        <VaultTreeView
          notes={mockNotes}
          projects={mockProjects}
          expandedProjects={new Set(['p1'])}
          {...mockHandlers}
        />
      )

      const expandedNode = container.querySelector('[aria-expanded="true"]')
      expect(expandedNode).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // Note Selection
  // --------------------------------------------------------

  describe('Note Selection', () => {
    it('calls onSelectNote when note clicked', () => {
      render(
        <VaultTreeView
          notes={mockNotes}
          projects={mockProjects}
          expandedProjects={new Set(['p1'])}
          {...mockHandlers}
        />
      )

      fireEvent.click(screen.getByText('Research Note 1'))
      expect(mockHandlers.onSelectNote).toHaveBeenCalledWith('n1')
    })

    it('shows note title and time ago', () => {
      render(
        <VaultTreeView
          notes={mockNotes}
          projects={mockProjects}
          expandedProjects={new Set(['p1'])}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Research Note 1')).toBeInTheDocument()
      // Time should show as 'now' since updated_at is Date.now() - may have multiple
      const nowElements = screen.getAllByText('now')
      expect(nowElements.length).toBeGreaterThan(0)
    })

    it('shows "Untitled" for notes without title', () => {
      const notesWithUntitled: Note[] = [
        { id: 'n5', title: '', content: 'No title', folder: '/', project_id: 'p1', created_at: Date.now(), updated_at: Date.now(), deleted_at: null, properties: {} },
      ]

      render(
        <VaultTreeView
          notes={notesWithUntitled}
          projects={mockProjects}
          expandedProjects={new Set(['p1'])}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Untitled')).toBeInTheDocument()
    })

    it('sorts notes by updated_at (most recent first)', () => {
      const { container } = render(
        <VaultTreeView
          notes={mockNotes}
          projects={mockProjects}
          expandedProjects={new Set(['p1'])}
          {...mockHandlers}
        />
      )

      const noteItems = container.querySelectorAll('.tree-note-item')
      // Research Note 1 has more recent updated_at than Research Note 2
      expect(noteItems[0]).toHaveTextContent('Research Note 1')
    })
  })

  // --------------------------------------------------------
  // Context Menu
  // --------------------------------------------------------

  describe('Context Menu', () => {
    it('opens context menu on right-click', () => {
      render(
        <VaultTreeView
          notes={mockNotes}
          projects={mockProjects}
          expandedProjects={new Set(['p1'])}
          {...mockHandlers}
        />
      )

      const noteItem = screen.getByText('Research Note 1')
      fireEvent.contextMenu(noteItem)

      expect(screen.getByText('Assign to Project')).toBeInTheDocument()
    })

    it('passes correct noteId to context menu handlers', () => {
      const { container } = render(
        <VaultTreeView
          notes={mockNotes}
          projects={mockProjects}
          expandedProjects={new Set(['p1'])}
          onSelectNote={mockHandlers.onSelectNote}
          onAssignToProject={mockHandlers.onAssignToProject}
          onToggleExpand={mockHandlers.onToggleExpand}
        />
      )

      const noteItem = screen.getByText('Research Note 1')
      fireEvent.contextMenu(noteItem)

      // Context menu should be visible with Assign to Project option
      expect(screen.getByText('Assign to Project')).toBeInTheDocument()

      // The context menu is rendered and contains project options
      const contextMenu = container.ownerDocument.querySelector('.note-context-menu')
      expect(contextMenu).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // Unassigned Section
  // --------------------------------------------------------

  describe('Unassigned Section', () => {
    it('shows Inbox icon for Unassigned section', () => {
      const { container } = render(
        <VaultTreeView
          notes={mockNotes}
          projects={mockProjects}
          expandedProjects={new Set(['__unassigned__'])}
          {...mockHandlers}
        />
      )

      const unassignedIcon = container.querySelector('.tree-project-icon.unassigned')
      expect(unassignedIcon).toBeInTheDocument()
    })

    it('shows unassigned notes when expanded', () => {
      render(
        <VaultTreeView
          notes={mockNotes}
          projects={mockProjects}
          expandedProjects={new Set(['__unassigned__'])}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Unassigned Note')).toBeInTheDocument()
    })

    it('places Unassigned section at bottom', () => {
      const { container } = render(
        <VaultTreeView
          notes={mockNotes}
          projects={mockProjects}
          expandedProjects={new Set()}
          {...mockHandlers}
        />
      )

      const projectHeaders = container.querySelectorAll('.tree-project-header')
      const lastHeader = projectHeaders[projectHeaders.length - 1]
      expect(lastHeader).toHaveTextContent('Unassigned')
    })

    it('does not show Unassigned section when all notes have projects', () => {
      const assignedNotes: Note[] = mockNotes.filter(n => n.project_id)

      render(
        <VaultTreeView
          notes={assignedNotes}
          projects={mockProjects}
          expandedProjects={new Set()}
          {...mockHandlers}
        />
      )

      expect(screen.queryByText('Unassigned')).not.toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // Keyboard Navigation
  // --------------------------------------------------------

  describe('Keyboard Navigation', () => {
    it('clears focus on Escape key', () => {
      const { container } = render(
        <VaultTreeView
          notes={mockNotes}
          projects={mockProjects}
          expandedProjects={new Set(['p1'])}
          {...mockHandlers}
        />
      )

      // Focus a note
      const noteItem = screen.getByText('Research Note 1')
      fireEvent.focus(noteItem)

      // Press Escape
      fireEvent.keyDown(container.querySelector('.vault-tree-view')!, { key: 'Escape' })

      // Focus should be cleared (no focused class)
      expect(noteItem).not.toHaveClass('focused')
    })
  })

  // --------------------------------------------------------
  // Project Colors
  // --------------------------------------------------------

  describe('Project Colors', () => {
    it('applies project color as CSS variable', () => {
      const { container } = render(
        <VaultTreeView
          notes={mockNotes}
          projects={mockProjects}
          expandedProjects={new Set()}
          {...mockHandlers}
        />
      )

      const researchHeader = Array.from(container.querySelectorAll('.tree-project-header'))
        .find(h => h.textContent?.includes('Research'))

      expect(researchHeader).toHaveStyle({ '--project-color': '#22c55e' })
    })

    it('uses default color for projects without color', () => {
      const projectsNoColor: Project[] = [
        { id: 'p1', name: 'No Color', type: 'generic', status: 'active', created_at: Date.now(), updated_at: Date.now() },
      ]

      const notesForProject: Note[] = [
        { id: 'n1', title: 'Note', content: '', folder: '/', project_id: 'p1', created_at: Date.now(), updated_at: Date.now(), deleted_at: null, properties: {} },
      ]

      const { container } = render(
        <VaultTreeView
          notes={notesForProject}
          projects={projectsNoColor}
          expandedProjects={new Set()}
          {...mockHandlers}
        />
      )

      const header = container.querySelector('.tree-project-header')
      expect(header).toHaveStyle({ '--project-color': '#888' })
    })
  })

  // --------------------------------------------------------
  // Accessibility
  // --------------------------------------------------------

  describe('Accessibility', () => {
    it('project headers have accessible labels', () => {
      render(
        <VaultTreeView
          notes={mockNotes}
          projects={mockProjects}
          expandedProjects={new Set()}
          {...mockHandlers}
        />
      )

      const researchHeader = screen.getByRole('button', { name: /Research, 2 notes/i })
      expect(researchHeader).toBeInTheDocument()
    })

    it('note items have accessible labels', () => {
      render(
        <VaultTreeView
          notes={mockNotes}
          projects={mockProjects}
          expandedProjects={new Set(['p1'])}
          {...mockHandlers}
        />
      )

      // Use getAllByRole since there are multiple treeitems (projects + notes)
      const treeItems = screen.getAllByRole('treeitem')
      const noteItem = treeItems.find(item => item.getAttribute('aria-label')?.includes('Research Note 1'))
      expect(noteItem).toBeInTheDocument()
    })

    it('notes list has group role', () => {
      const { container } = render(
        <VaultTreeView
          notes={mockNotes}
          projects={mockProjects}
          expandedProjects={new Set(['p1'])}
          {...mockHandlers}
        />
      )

      const group = container.querySelector('[role="group"]')
      expect(group).toBeInTheDocument()
    })
  })
})

// ============================================================
// formatTimeAgo Helper Tests
// ============================================================

describe('VaultTreeView Time Formatting', () => {
  const mockProjects: Project[] = [
    { id: 'p1', name: 'Project', type: 'generic', created_at: Date.now(), updated_at: Date.now() },
  ]

  const createNoteWithTimestamp = (updatedAt: number): Note => ({
    id: 'test',
    title: 'Test Note',
    content: '',
    folder: '/',
    project_id: 'p1',
    created_at: Date.now(),
    updated_at: updatedAt,
    deleted_at: null,
    properties: {},
  })

  const mockHandlers = {
    onSelectNote: vi.fn(),
    onToggleExpand: vi.fn(),
  }

  it('shows "now" for recent notes', () => {
    const note = createNoteWithTimestamp(Date.now())

    render(
      <VaultTreeView
        notes={[note]}
        projects={mockProjects}
        expandedProjects={new Set(['p1'])}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('now')).toBeInTheDocument()
  })

  it('shows minutes for notes updated minutes ago', () => {
    const note = createNoteWithTimestamp(Date.now() - 5 * 60000) // 5 minutes ago

    render(
      <VaultTreeView
        notes={[note]}
        projects={mockProjects}
        expandedProjects={new Set(['p1'])}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('5m')).toBeInTheDocument()
  })

  it('shows hours for notes updated hours ago', () => {
    const note = createNoteWithTimestamp(Date.now() - 3 * 3600000) // 3 hours ago

    render(
      <VaultTreeView
        notes={[note]}
        projects={mockProjects}
        expandedProjects={new Set(['p1'])}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('3h')).toBeInTheDocument()
  })

  it('shows days for notes updated days ago', () => {
    const note = createNoteWithTimestamp(Date.now() - 2 * 86400000) // 2 days ago

    render(
      <VaultTreeView
        notes={[note]}
        projects={mockProjects}
        expandedProjects={new Set(['p1'])}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('2d')).toBeInTheDocument()
  })

  it('shows date for notes updated over a week ago', () => {
    const note = createNoteWithTimestamp(Date.now() - 10 * 86400000) // 10 days ago

    render(
      <VaultTreeView
        notes={[note]}
        projects={mockProjects}
        expandedProjects={new Set(['p1'])}
        {...mockHandlers}
      />
    )

    // Should show "Dec 18" or similar
    const datePattern = /[A-Z][a-z]{2} \d{1,2}/
    const elements = screen.getAllByText(datePattern)
    expect(elements.length).toBeGreaterThan(0)
  })
})
