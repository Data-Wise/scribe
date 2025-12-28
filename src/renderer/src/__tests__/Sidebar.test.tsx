import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StatusDot, getStatusColor } from '../components/sidebar/StatusDot'
import { IconBarMode } from '../components/sidebar/IconBarMode'
import { CompactListMode } from '../components/sidebar/CompactListMode'
import { ResizeHandle } from '../components/sidebar/ResizeHandle'
import { PillTabs, IconTabs, LEFT_SIDEBAR_TABS, type TabDefinition } from '../components/sidebar/SidebarTabs'
import { NotesListPanel } from '../components/sidebar/NotesListPanel'
import { InboxPanel } from '../components/sidebar/InboxPanel'
import { GraphPanel } from '../components/sidebar/GraphPanel'
import { NoteContextMenu } from '../components/sidebar/NoteContextMenu'
import { Project, Note, ProjectStatus } from '../types'

// ============================================================
// StatusDot Component Tests
// ============================================================

describe('StatusDot Component', () => {
  it('renders with default active status', () => {
    render(<StatusDot />)
    const dot = screen.getByLabelText(/Status: active/i)
    expect(dot).toBeInTheDocument()
  })

  it('renders correct color for each status', () => {
    const statuses: ProjectStatus[] = ['active', 'planning', 'complete', 'archive']
    const expectedColors: Record<ProjectStatus, string> = {
      active: '#22c55e',    // Green
      planning: '#eab308',  // Yellow
      complete: '#3b82f6',  // Blue
      archive: '#6b7280',   // Gray
    }

    statuses.forEach(status => {
      const { container } = render(<StatusDot status={status} />)
      const dot = container.querySelector('span')
      expect(dot).toHaveStyle({ backgroundColor: expectedColors[status] })
    })
  })

  it('renders different sizes', () => {
    const { rerender, container } = render(<StatusDot size="sm" />)
    let dot = container.querySelector('span')
    expect(dot).toHaveStyle({ width: '6px', height: '6px' })

    rerender(<StatusDot size="md" />)
    dot = container.querySelector('span')
    expect(dot).toHaveStyle({ width: '8px', height: '8px' })

    rerender(<StatusDot size="lg" />)
    dot = container.querySelector('span')
    expect(dot).toHaveStyle({ width: '10px', height: '10px' })
  })

  it('getStatusColor returns correct colors', () => {
    expect(getStatusColor('active')).toBe('#22c55e')
    expect(getStatusColor('planning')).toBe('#eab308')
    expect(getStatusColor('complete')).toBe('#3b82f6')
    expect(getStatusColor('archive')).toBe('#6b7280')
  })

  it('applies custom className', () => {
    const { container } = render(<StatusDot className="custom-class" />)
    const dot = container.querySelector('span')
    expect(dot).toHaveClass('custom-class')
  })
})

// ============================================================
// IconBarMode Component Tests
// ============================================================

describe('IconBarMode Component', () => {
  const mockProjects: Project[] = [
    { id: '1', name: 'Project A', type: 'generic', status: 'active', created_at: Date.now(), updated_at: Date.now() },
    { id: '2', name: 'Project B', type: 'research', status: 'planning', created_at: Date.now(), updated_at: Date.now() - 1000 },
    { id: '3', name: 'Project C', type: 'teaching', status: 'archive', created_at: Date.now(), updated_at: Date.now() - 2000 },
  ]

  const mockHandlers = {
    onSelectProject: vi.fn(),
    onCreateProject: vi.fn(),
    onExpand: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders expand button', () => {
    render(
      <IconBarMode
        projects={[]}
        notes={[]}
        currentProjectId={null}
        {...mockHandlers}
      />
    )

    const expandBtn = screen.getByTitle(/Expand sidebar/i)
    expect(expandBtn).toBeInTheDocument()
  })

  it('calls onExpand when expand button clicked', () => {
    render(
      <IconBarMode
        projects={[]}
        notes={[]}
        currentProjectId={null}
        {...mockHandlers}
      />
    )

    fireEvent.click(screen.getByTitle(/Expand sidebar/i))
    expect(mockHandlers.onExpand).toHaveBeenCalled()
  })

  it('renders add project button', () => {
    render(
      <IconBarMode
        projects={[]}
        notes={[]}
        currentProjectId={null}
        {...mockHandlers}
      />
    )

    const addBtn = screen.getByTitle(/New project/i)
    expect(addBtn).toBeInTheDocument()
  })

  it('calls onCreateProject when add button clicked', () => {
    render(
      <IconBarMode
        projects={[]}
        notes={[]}
        currentProjectId={null}
        {...mockHandlers}
      />
    )

    fireEvent.click(screen.getByTitle(/New project/i))
    expect(mockHandlers.onCreateProject).toHaveBeenCalled()
  })

  it('renders project icons for non-archived projects', () => {
    render(
      <IconBarMode
        projects={mockProjects}
        notes={[]}
        currentProjectId={null}
        {...mockHandlers}
      />
    )

    // Should render Project A and B (active, planning) but not C (archive)
    // Tooltips now show: "Name\nStatus • N notes"
    expect(screen.getByTitle(/Project A/)).toBeInTheDocument()
    expect(screen.getByTitle(/Project B/)).toBeInTheDocument()
    expect(screen.queryByTitle(/Project C/)).not.toBeInTheDocument()
  })

  it('calls onSelectProject when project icon clicked', () => {
    render(
      <IconBarMode
        projects={mockProjects}
        notes={[]}
        currentProjectId={null}
        {...mockHandlers}
      />
    )

    fireEvent.click(screen.getByTitle(/Project A/))
    expect(mockHandlers.onSelectProject).toHaveBeenCalledWith('1')
  })

  it('marks current project as active', () => {
    const { container } = render(
      <IconBarMode
        projects={mockProjects}
        notes={[]}
        currentProjectId="1"
        {...mockHandlers}
      />
    )

    const activeBtn = container.querySelector('.project-icon-btn.active')
    expect(activeBtn).toBeInTheDocument()
  })

  it('limits visible projects to MAX_VISIBLE_PROJECTS (8)', () => {
    const manyProjects: Project[] = Array.from({ length: 15 }, (_, i) => ({
      id: `${i}`,
      name: `Project ${i}`,
      type: 'generic' as const,
      status: 'active' as const,
      created_at: Date.now(),
      updated_at: Date.now() - i * 1000,
    }))

    const { container } = render(
      <IconBarMode
        projects={manyProjects}
        notes={[]}
        currentProjectId={null}
        {...mockHandlers}
      />
    )

    const projectBtns = container.querySelectorAll('.project-icon-btn')
    expect(projectBtns.length).toBeLessThanOrEqual(8)
  })
})

// ============================================================
// CompactListMode Component Tests
// ============================================================

describe('CompactListMode Component', () => {
  const mockProjects: Project[] = [
    { id: '1', name: 'Research Paper', type: 'research', status: 'active', progress: 75, created_at: Date.now(), updated_at: Date.now() },
    { id: '2', name: 'Blog Post', type: 'generic', status: 'planning', created_at: Date.now(), updated_at: Date.now() - 1000 },
  ]

  const mockNotes: Note[] = [
    { id: 'n1', title: 'Note 1', content: 'Some content here', folder: '/', created_at: Date.now(), updated_at: Date.now(), deleted_at: null, properties: { project_id: { key: 'project_id', value: '1', type: 'text' } } },
    { id: 'n2', title: 'Note 2', content: 'More content', folder: '/', created_at: Date.now(), updated_at: Date.now() - 500, deleted_at: null, properties: {} },
  ]

  const mockHandlers = {
    onSelectProject: vi.fn(),
    onSelectNote: vi.fn(),
    onCreateProject: vi.fn(),
    onCollapse: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders header with Mission Control title', () => {
    render(
      <CompactListMode
        projects={mockProjects}
        notes={[]}
        currentProjectId={null}
        width={240}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('Mission Control')).toBeInTheDocument()
    // Projects tab should show by default with projects listed
    expect(screen.getByText('Projects')).toBeInTheDocument()
  })

  it('renders collapse button', () => {
    render(
      <CompactListMode
        projects={[]}
        notes={[]}
        currentProjectId={null}
        width={240}
        {...mockHandlers}
      />
    )

    const collapseBtn = screen.getByTitle(/Collapse sidebar/i)
    expect(collapseBtn).toBeInTheDocument()
  })

  it('calls onCollapse when collapse button clicked', () => {
    render(
      <CompactListMode
        projects={[]}
        notes={[]}
        currentProjectId={null}
        width={240}
        {...mockHandlers}
      />
    )

    fireEvent.click(screen.getByTitle(/Collapse sidebar/i))
    expect(mockHandlers.onCollapse).toHaveBeenCalled()
  })

  it('renders project list', () => {
    render(
      <CompactListMode
        projects={mockProjects}
        notes={[]}
        currentProjectId={null}
        width={240}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('Research Paper')).toBeInTheDocument()
    expect(screen.getByText('Blog Post')).toBeInTheDocument()
  })

  it('calls onSelectProject when project clicked', () => {
    render(
      <CompactListMode
        projects={mockProjects}
        notes={[]}
        currentProjectId={null}
        width={240}
        {...mockHandlers}
      />
    )

    fireEvent.click(screen.getByText('Research Paper'))
    expect(mockHandlers.onSelectProject).toHaveBeenCalledWith('1')
  })

  it('shows search when more than 5 projects', () => {
    const manyProjects: Project[] = Array.from({ length: 6 }, (_, i) => ({
      id: `${i}`,
      name: `Project ${i}`,
      type: 'generic' as const,
      status: 'active' as const,
      created_at: Date.now(),
      updated_at: Date.now(),
    }))

    render(
      <CompactListMode
        projects={manyProjects}
        notes={[]}
        currentProjectId={null}
        width={240}
        {...mockHandlers}
      />
    )

    expect(screen.getByPlaceholderText(/Find project/i)).toBeInTheDocument()
  })

  it('hides search when 5 or fewer projects', () => {
    render(
      <CompactListMode
        projects={mockProjects}
        notes={[]}
        currentProjectId={null}
        width={240}
        {...mockHandlers}
      />
    )

    expect(screen.queryByPlaceholderText(/Find project/i)).not.toBeInTheDocument()
  })

  it('filters projects by search query', () => {
    const manyProjects: Project[] = [
      { id: '1', name: 'Research Paper', type: 'research', created_at: Date.now(), updated_at: Date.now() },
      { id: '2', name: 'Blog Post', type: 'generic', created_at: Date.now(), updated_at: Date.now() },
      { id: '3', name: 'Another Research', type: 'research', created_at: Date.now(), updated_at: Date.now() },
      { id: '4', name: 'Notes', type: 'generic', created_at: Date.now(), updated_at: Date.now() },
      { id: '5', name: 'Draft', type: 'generic', created_at: Date.now(), updated_at: Date.now() },
      { id: '6', name: 'Final', type: 'generic', created_at: Date.now(), updated_at: Date.now() },
    ]

    render(
      <CompactListMode
        projects={manyProjects}
        notes={[]}
        currentProjectId={null}
        width={240}
        {...mockHandlers}
      />
    )

    const searchInput = screen.getByPlaceholderText(/Find project/i)
    fireEvent.change(searchInput, { target: { value: 'Research' } })

    expect(screen.getByText('Research Paper')).toBeInTheDocument()
    expect(screen.getByText('Another Research')).toBeInTheDocument()
    expect(screen.queryByText('Blog Post')).not.toBeInTheDocument()
  })

  it('shows no results message when search matches nothing', () => {
    const manyProjects: Project[] = Array.from({ length: 6 }, (_, i) => ({
      id: `${i}`,
      name: `Project ${i}`,
      type: 'generic' as const,
      created_at: Date.now(),
      updated_at: Date.now(),
    }))

    render(
      <CompactListMode
        projects={manyProjects}
        notes={[]}
        currentProjectId={null}
        width={240}
        {...mockHandlers}
      />
    )

    const searchInput = screen.getByPlaceholderText(/Find project/i)
    fireEvent.change(searchInput, { target: { value: 'xyz123' } })

    expect(screen.getByText(/No projects match/i)).toBeInTheDocument()
  })

  it('renders recent notes section when notes exist', () => {
    render(
      <CompactListMode
        projects={mockProjects}
        notes={mockNotes}
        currentProjectId={null}
        width={240}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('Recent')).toBeInTheDocument()
    expect(screen.getByText('Note 1')).toBeInTheDocument()
    expect(screen.getByText('Note 2')).toBeInTheDocument()
  })

  it('calls onSelectNote when recent note clicked', () => {
    render(
      <CompactListMode
        projects={mockProjects}
        notes={mockNotes}
        currentProjectId={null}
        width={240}
        {...mockHandlers}
      />
    )

    fireEvent.click(screen.getByText('Note 1'))
    expect(mockHandlers.onSelectNote).toHaveBeenCalledWith('n1')
  })

  it('renders new project button', () => {
    render(
      <CompactListMode
        projects={[]}
        notes={[]}
        currentProjectId={null}
        width={240}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('New Project')).toBeInTheDocument()
  })

  it('calls onCreateProject when new project button clicked', () => {
    render(
      <CompactListMode
        projects={[]}
        notes={[]}
        currentProjectId={null}
        width={240}
        {...mockHandlers}
      />
    )

    fireEvent.click(screen.getByText('New Project'))
    expect(mockHandlers.onCreateProject).toHaveBeenCalled()
  })

  it('shows progress bar for projects with progress', () => {
    const { container } = render(
      <CompactListMode
        projects={mockProjects}
        notes={[]}
        currentProjectId={null}
        width={240}
        {...mockHandlers}
      />
    )

    // Research Paper has 75% progress
    const progressBar = container.querySelector('.progress-mini')
    expect(progressBar).toBeInTheDocument()
    expect(progressBar).toHaveAttribute('title', '75% complete')
  })

  it('excludes archived projects from display', () => {
    const projectsWithArchived: Project[] = [
      ...mockProjects,
      { id: '3', name: 'Archived Project', type: 'generic', status: 'archive', created_at: Date.now(), updated_at: Date.now() },
    ]

    render(
      <CompactListMode
        projects={projectsWithArchived}
        notes={[]}
        currentProjectId={null}
        width={240}
        {...mockHandlers}
      />
    )

    expect(screen.queryByText('Archived Project')).not.toBeInTheDocument()
  })
})

// ============================================================
// ResizeHandle Component Tests
// ============================================================

describe('ResizeHandle Component', () => {
  const mockHandlers = {
    onResize: vi.fn(),
    onResizeEnd: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders resize handle', () => {
    const { container } = render(<ResizeHandle {...mockHandlers} />)
    const handle = container.querySelector('.resize-handle')
    expect(handle).toBeInTheDocument()
  })

  it('does not render when disabled', () => {
    const { container } = render(<ResizeHandle {...mockHandlers} disabled />)
    const handle = container.querySelector('.resize-handle')
    expect(handle).not.toBeInTheDocument()
  })

  it('adds dragging class on mousedown', () => {
    const { container } = render(<ResizeHandle {...mockHandlers} />)
    const handle = container.querySelector('.resize-handle')!

    fireEvent.mouseDown(handle)
    expect(handle).toHaveClass('dragging')
  })

  it('calls onResize during drag', () => {
    const { container } = render(<ResizeHandle {...mockHandlers} />)
    const handle = container.querySelector('.resize-handle')!

    // Start drag
    fireEvent.mouseDown(handle, { clientX: 100 })

    // Move mouse
    fireEvent.mouseMove(document, { clientX: 150 })

    expect(mockHandlers.onResize).toHaveBeenCalledWith(50)
  })

  it('calls onResizeEnd on mouseup', () => {
    const { container } = render(<ResizeHandle {...mockHandlers} />)
    const handle = container.querySelector('.resize-handle')!

    fireEvent.mouseDown(handle)
    fireEvent.mouseUp(document)

    expect(mockHandlers.onResizeEnd).toHaveBeenCalled()
  })

  it('removes dragging class after mouseup', () => {
    const { container } = render(<ResizeHandle {...mockHandlers} />)
    const handle = container.querySelector('.resize-handle')!

    fireEvent.mouseDown(handle)
    expect(handle).toHaveClass('dragging')

    fireEvent.mouseUp(document)
    expect(handle).not.toHaveClass('dragging')
  })
})

// ============================================================
// SidebarTabs Component Tests
// ============================================================

describe('SidebarTabs Components', () => {
  const mockOnTabChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('PillTabs', () => {
    it('renders all tabs', () => {
      render(
        <PillTabs
          tabs={LEFT_SIDEBAR_TABS}
          activeTab="projects"
          onTabChange={mockOnTabChange}
        />
      )

      expect(screen.getByText('Projects')).toBeInTheDocument()
      expect(screen.getByText('Notes')).toBeInTheDocument()
      expect(screen.getByText('Inbox')).toBeInTheDocument()
      expect(screen.getByText('Graph')).toBeInTheDocument()
    })

    it('marks active tab as selected', () => {
      render(
        <PillTabs
          tabs={LEFT_SIDEBAR_TABS}
          activeTab="notes"
          onTabChange={mockOnTabChange}
        />
      )

      const notesTab = screen.getByRole('tab', { name: /Notes/i })
      expect(notesTab).toHaveAttribute('aria-selected', 'true')
    })

    it('calls onTabChange when tab clicked', () => {
      render(
        <PillTabs
          tabs={LEFT_SIDEBAR_TABS}
          activeTab="projects"
          onTabChange={mockOnTabChange}
        />
      )

      fireEvent.click(screen.getByText('Notes'))
      expect(mockOnTabChange).toHaveBeenCalledWith('notes')
    })

    it('renders badge when present', () => {
      const tabsWithBadge: TabDefinition[] = LEFT_SIDEBAR_TABS.map(tab => ({
        ...tab,
        badge: tab.id === 'inbox' ? 5 : undefined
      }))

      render(
        <PillTabs
          tabs={tabsWithBadge}
          activeTab="projects"
          onTabChange={mockOnTabChange}
        />
      )

      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('renders different sizes', () => {
      const { rerender, container } = render(
        <PillTabs
          tabs={LEFT_SIDEBAR_TABS}
          activeTab="projects"
          onTabChange={mockOnTabChange}
          size="sm"
        />
      )

      expect(container.querySelector('.tab-pill-sm')).toBeInTheDocument()

      rerender(
        <PillTabs
          tabs={LEFT_SIDEBAR_TABS}
          activeTab="projects"
          onTabChange={mockOnTabChange}
          size="lg"
        />
      )

      expect(container.querySelector('.tab-pill-lg')).toBeInTheDocument()
    })
  })

  describe('IconTabs', () => {
    it('renders all tab icons', () => {
      render(
        <IconTabs
          tabs={LEFT_SIDEBAR_TABS}
          activeTab="projects"
          onTabChange={mockOnTabChange}
        />
      )

      // Check for all tab buttons by aria-label
      expect(screen.getByRole('tab', { name: 'Projects' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Notes' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Inbox' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Graph' })).toBeInTheDocument()
    })

    it('marks active tab', () => {
      const { container } = render(
        <IconTabs
          tabs={LEFT_SIDEBAR_TABS}
          activeTab="inbox"
          onTabChange={mockOnTabChange}
        />
      )

      const activeTab = container.querySelector('.tab-icon.active')
      expect(activeTab).toBeInTheDocument()
    })

    it('calls onTabChange when icon clicked', () => {
      render(
        <IconTabs
          tabs={LEFT_SIDEBAR_TABS}
          activeTab="projects"
          onTabChange={mockOnTabChange}
        />
      )

      fireEvent.click(screen.getByRole('tab', { name: 'Graph' }))
      expect(mockOnTabChange).toHaveBeenCalledWith('graph')
    })

    it('shows badge on icon tabs', () => {
      const tabsWithBadge: TabDefinition[] = LEFT_SIDEBAR_TABS.map(tab => ({
        ...tab,
        badge: tab.id === 'inbox' ? 3 : undefined
      }))

      render(
        <IconTabs
          tabs={tabsWithBadge}
          activeTab="projects"
          onTabChange={mockOnTabChange}
        />
      )

      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })

  describe('LEFT_SIDEBAR_TABS constant', () => {
    it('has exactly 5 tabs', () => {
      expect(LEFT_SIDEBAR_TABS).toHaveLength(5)
    })

    it('has correct tab IDs', () => {
      const ids = LEFT_SIDEBAR_TABS.map(t => t.id)
      expect(ids).toEqual(['projects', 'notes', 'inbox', 'graph', 'trash'])
    })
  })
})

// ============================================================
// NotesListPanel Component Tests
// ============================================================

describe('NotesListPanel Component', () => {
  const mockProjects: Project[] = [
    { id: 'p1', name: 'Research', type: 'research', created_at: Date.now(), updated_at: Date.now() },
    { id: 'p2', name: 'Writing', type: 'generic', created_at: Date.now(), updated_at: Date.now() },
  ]

  const mockNotes: Note[] = [
    { id: 'n1', title: 'First Note', content: 'Content of first note', folder: '/', created_at: Date.now() - 2000, updated_at: Date.now(), deleted_at: null, properties: { project_id: { key: 'project_id', value: 'p1', type: 'text' } } },
    { id: 'n2', title: 'Second Note', content: 'Content of second', folder: '/', created_at: Date.now() - 1000, updated_at: Date.now() - 500, deleted_at: null, properties: {} },
    { id: 'n3', title: 'Alpha Note', content: 'Alphabetically first', folder: '/', created_at: Date.now(), updated_at: Date.now() - 1000, deleted_at: null, properties: {} },
  ]

  const mockOnSelectNote = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders search input', () => {
    render(
      <NotesListPanel
        notes={mockNotes}
        projects={mockProjects}
        onSelectNote={mockOnSelectNote}
        variant="compact"
      />
    )

    expect(screen.getByPlaceholderText(/Search notes/i)).toBeInTheDocument()
  })

  it('renders all non-deleted notes', () => {
    render(
      <NotesListPanel
        notes={mockNotes}
        projects={mockProjects}
        onSelectNote={mockOnSelectNote}
        variant="compact"
      />
    )

    expect(screen.getByText('First Note')).toBeInTheDocument()
    expect(screen.getByText('Second Note')).toBeInTheDocument()
    expect(screen.getByText('Alpha Note')).toBeInTheDocument()
  })

  it('filters notes by search query', () => {
    render(
      <NotesListPanel
        notes={mockNotes}
        projects={mockProjects}
        onSelectNote={mockOnSelectNote}
        variant="compact"
      />
    )

    fireEvent.change(screen.getByPlaceholderText(/Search notes/i), {
      target: { value: 'First' }
    })

    expect(screen.getByText('First Note')).toBeInTheDocument()
    expect(screen.queryByText('Second Note')).not.toBeInTheDocument()
  })

  it('sorts by updated by default', () => {
    const { container } = render(
      <NotesListPanel
        notes={mockNotes}
        projects={mockProjects}
        onSelectNote={mockOnSelectNote}
        variant="compact"
      />
    )

    const noteItems = container.querySelectorAll('.note-list-item')
    // First Note has latest updated_at, should be first
    expect(noteItems[0]).toHaveTextContent('First Note')
  })

  it('sorts alphabetically when A-Z clicked', () => {
    const { container } = render(
      <NotesListPanel
        notes={mockNotes}
        projects={mockProjects}
        onSelectNote={mockOnSelectNote}
        variant="compact"
      />
    )

    fireEvent.click(screen.getByText('A-Z'))

    const noteItems = container.querySelectorAll('.note-list-item')
    expect(noteItems[0]).toHaveTextContent('Alpha Note')
  })

  it('calls onSelectNote when note clicked', () => {
    render(
      <NotesListPanel
        notes={mockNotes}
        projects={mockProjects}
        onSelectNote={mockOnSelectNote}
        variant="compact"
      />
    )

    fireEvent.click(screen.getByText('First Note'))
    expect(mockOnSelectNote).toHaveBeenCalledWith('n1')
  })

  it('shows project name for notes with project', () => {
    render(
      <NotesListPanel
        notes={mockNotes}
        projects={mockProjects}
        onSelectNote={mockOnSelectNote}
        variant="card"
      />
    )

    expect(screen.getByText('Research')).toBeInTheDocument()
  })

  it('shows notes count', () => {
    render(
      <NotesListPanel
        notes={mockNotes}
        projects={mockProjects}
        onSelectNote={mockOnSelectNote}
        variant="compact"
      />
    )

    expect(screen.getByText('3 notes')).toBeInTheDocument()
  })

  it('shows empty state when no notes', () => {
    render(
      <NotesListPanel
        notes={[]}
        projects={mockProjects}
        onSelectNote={mockOnSelectNote}
        variant="compact"
      />
    )

    expect(screen.getByText('No notes yet')).toBeInTheDocument()
  })
})

// ============================================================
// InboxPanel Component Tests
// ============================================================

describe('InboxPanel Component', () => {
  const mockInboxNotes: Note[] = [
    { id: 'i1', title: 'Quick idea', content: 'Capture this thought', folder: 'inbox', created_at: Date.now(), updated_at: Date.now(), deleted_at: null, properties: {} },
    { id: 'i2', title: 'Meeting note', content: 'Remember to follow up', folder: 'inbox', created_at: Date.now() - 1000, updated_at: Date.now() - 1000, deleted_at: null, properties: {} },
  ]

  const mockRegularNotes: Note[] = [
    { id: 'r1', title: 'Regular note', content: 'Not in inbox', folder: '/', created_at: Date.now(), updated_at: Date.now(), deleted_at: null, properties: {} },
  ]

  const mockHandlers = {
    onSelectNote: vi.fn(),
    onMarkProcessed: vi.fn(),
    onDelete: vi.fn(),
    onOpenQuickCapture: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders inbox header with count', () => {
    render(
      <InboxPanel
        notes={[...mockInboxNotes, ...mockRegularNotes]}
        onSelectNote={mockHandlers.onSelectNote}
        onMarkProcessed={mockHandlers.onMarkProcessed}
        onDelete={mockHandlers.onDelete}
        onOpenQuickCapture={mockHandlers.onOpenQuickCapture}
        variant="compact"
      />
    )

    expect(screen.getByText('Quick Capture')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument() // Badge with count
  })

  it('only shows notes from inbox folder', () => {
    render(
      <InboxPanel
        notes={[...mockInboxNotes, ...mockRegularNotes]}
        onSelectNote={mockHandlers.onSelectNote}
        variant="compact"
      />
    )

    expect(screen.getByText('Quick idea')).toBeInTheDocument()
    expect(screen.getByText('Meeting note')).toBeInTheDocument()
    expect(screen.queryByText('Regular note')).not.toBeInTheDocument()
  })

  it('shows empty state when inbox is empty', () => {
    render(
      <InboxPanel
        notes={mockRegularNotes}
        onSelectNote={mockHandlers.onSelectNote}
        variant="compact"
      />
    )

    expect(screen.getByText('Inbox Zero!')).toBeInTheDocument()
  })

  it('calls onSelectNote when item clicked', () => {
    render(
      <InboxPanel
        notes={mockInboxNotes}
        onSelectNote={mockHandlers.onSelectNote}
        variant="compact"
      />
    )

    fireEvent.click(screen.getByText('Quick idea'))
    expect(mockHandlers.onSelectNote).toHaveBeenCalledWith('i1')
  })

  it('calls onMarkProcessed when check button clicked', () => {
    render(
      <InboxPanel
        notes={mockInboxNotes}
        onSelectNote={mockHandlers.onSelectNote}
        onMarkProcessed={mockHandlers.onMarkProcessed}
        variant="compact"
      />
    )

    const processButtons = screen.getAllByTitle('Mark as processed')
    fireEvent.click(processButtons[0])
    expect(mockHandlers.onMarkProcessed).toHaveBeenCalledWith('i1')
  })

  it('calls onDelete when delete button clicked', () => {
    render(
      <InboxPanel
        notes={mockInboxNotes}
        onSelectNote={mockHandlers.onSelectNote}
        onDelete={mockHandlers.onDelete}
        variant="compact"
      />
    )

    const deleteButtons = screen.getAllByTitle('Delete')
    fireEvent.click(deleteButtons[0])
    expect(mockHandlers.onDelete).toHaveBeenCalledWith('i1')
  })

  it('renders add button when onOpenQuickCapture provided', () => {
    render(
      <InboxPanel
        notes={mockInboxNotes}
        onSelectNote={mockHandlers.onSelectNote}
        onOpenQuickCapture={mockHandlers.onOpenQuickCapture}
        variant="compact"
      />
    )

    const addButton = screen.getByTitle(/New capture/i)
    expect(addButton).toBeInTheDocument()

    fireEvent.click(addButton)
    expect(mockHandlers.onOpenQuickCapture).toHaveBeenCalled()
  })
})

// ============================================================
// GraphPanel Component Tests
// ============================================================

describe('GraphPanel Component', () => {
  const mockNotesWithLinks: Note[] = [
    { id: 'g1', title: 'Hub Note', content: 'Links to [[Connected Note]] and [[Another Note]]', folder: '/', created_at: Date.now(), updated_at: Date.now(), deleted_at: null, properties: {} },
    { id: 'g2', title: 'Connected Note', content: 'Links back to [[Hub Note]]', folder: '/', created_at: Date.now(), updated_at: Date.now(), deleted_at: null, properties: {} },
    { id: 'g3', title: 'Another Note', content: 'No outgoing links', folder: '/', created_at: Date.now(), updated_at: Date.now(), deleted_at: null, properties: {} },
    { id: 'g4', title: 'Orphan Note', content: 'Not linked anywhere', folder: '/', created_at: Date.now(), updated_at: Date.now(), deleted_at: null, properties: {} },
  ]

  const mockHandlers = {
    onSelectNote: vi.fn(),
    onOpenFullGraph: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders graph panel header', () => {
    render(
      <GraphPanel
        notes={mockNotesWithLinks}
        projects={[]}
        onSelectNote={mockHandlers.onSelectNote}
        onOpenFullGraph={mockHandlers.onOpenFullGraph}
        variant="compact"
      />
    )

    expect(screen.getByText('Knowledge Graph')).toBeInTheDocument()
  })

  it('shows graph statistics', () => {
    render(
      <GraphPanel
        notes={mockNotesWithLinks}
        projects={[]}
        onSelectNote={mockHandlers.onSelectNote}
        variant="compact"
      />
    )

    expect(screen.getByText('4')).toBeInTheDocument() // Total notes
    expect(screen.getByText('Notes')).toBeInTheDocument()
    expect(screen.getByText('Links')).toBeInTheDocument()
    expect(screen.getByText('Orphans')).toBeInTheDocument()
  })

  it('shows most connected notes', () => {
    render(
      <GraphPanel
        notes={mockNotesWithLinks}
        projects={[]}
        onSelectNote={mockHandlers.onSelectNote}
        variant="compact"
      />
    )

    expect(screen.getByText('Most Connected')).toBeInTheDocument()
    expect(screen.getByText('Hub Note')).toBeInTheDocument()
  })

  it('calls onSelectNote when connected note clicked', () => {
    render(
      <GraphPanel
        notes={mockNotesWithLinks}
        projects={[]}
        onSelectNote={mockHandlers.onSelectNote}
        variant="compact"
      />
    )

    fireEvent.click(screen.getByText('Hub Note'))
    expect(mockHandlers.onSelectNote).toHaveBeenCalledWith('g1')
  })

  it('renders expand button when onOpenFullGraph provided', () => {
    render(
      <GraphPanel
        notes={mockNotesWithLinks}
        projects={[]}
        onSelectNote={mockHandlers.onSelectNote}
        onOpenFullGraph={mockHandlers.onOpenFullGraph}
        variant="compact"
      />
    )

    const expandButton = screen.getByTitle(/Open full graph/i)
    expect(expandButton).toBeInTheDocument()

    fireEvent.click(expandButton)
    expect(mockHandlers.onOpenFullGraph).toHaveBeenCalled()
  })

  it('shows empty state when no notes', () => {
    render(
      <GraphPanel
        notes={[]}
        projects={[]}
        onSelectNote={mockHandlers.onSelectNote}
        variant="compact"
      />
    )

    expect(screen.getByText('No notes yet')).toBeInTheDocument()
  })

  it('shows hint when notes exist but no links', () => {
    const unlinkedNotes: Note[] = [
      { id: 'u1', title: 'Note 1', content: 'No wiki links', folder: '/', created_at: Date.now(), updated_at: Date.now(), deleted_at: null, properties: {} },
      { id: 'u2', title: 'Note 2', content: 'Also no links', folder: '/', created_at: Date.now(), updated_at: Date.now(), deleted_at: null, properties: {} },
    ]

    render(
      <GraphPanel
        notes={unlinkedNotes}
        projects={[]}
        onSelectNote={mockHandlers.onSelectNote}
        variant="compact"
      />
    )

    expect(screen.getByText(/wiki links/i)).toBeInTheDocument()
  })

  it('renders canvas for graph visualization', () => {
    const { container } = render(
      <GraphPanel
        notes={mockNotesWithLinks}
        projects={[]}
        onSelectNote={mockHandlers.onSelectNote}
        variant="compact"
      />
    )

    expect(container.querySelector('canvas')).toBeInTheDocument()
  })

  it('renders open full graph button at bottom', () => {
    render(
      <GraphPanel
        notes={mockNotesWithLinks}
        projects={[]}
        onSelectNote={mockHandlers.onSelectNote}
        onOpenFullGraph={mockHandlers.onOpenFullGraph}
        variant="card"
      />
    )

    const openButton = screen.getByText('Open Full Graph')
    expect(openButton).toBeInTheDocument()

    fireEvent.click(openButton)
    expect(mockHandlers.onOpenFullGraph).toHaveBeenCalled()
  })
})

// ============================================================
// NoteContextMenu Component Tests
// ============================================================

describe('NoteContextMenu Component', () => {
  const mockProjects: Project[] = [
    { id: 'proj1', name: 'Research Project', type: 'research', created_at: Date.now(), updated_at: Date.now() },
    { id: 'proj2', name: 'Teaching Course', type: 'teaching', created_at: Date.now(), updated_at: Date.now() },
    { id: 'proj3', name: 'Archived Project', type: 'generic', status: 'archive', created_at: Date.now(), updated_at: Date.now() },
  ]

  const mockHandlers = {
    onClose: vi.fn(),
    onAssignToProject: vi.fn(),
    onMoveToInbox: vi.fn(),
    onMoveToNotes: vi.fn(),
    onDelete: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders context menu at specified position', () => {
    const { container } = render(
      <NoteContextMenu
        x={100}
        y={200}
        noteId="note1"
        projects={mockProjects}
        onClose={mockHandlers.onClose}
        onAssignToProject={mockHandlers.onAssignToProject}
      />
    )

    const menu = container.querySelector('.note-context-menu')
    expect(menu).toHaveStyle({ left: '100px', top: '200px' })
  })

  it('shows project assignment option', () => {
    render(
      <NoteContextMenu
        x={0}
        y={0}
        noteId="note1"
        projects={mockProjects}
        onClose={mockHandlers.onClose}
        onAssignToProject={mockHandlers.onAssignToProject}
      />
    )

    expect(screen.getByText('Assign to Project')).toBeInTheDocument()
  })

  it('filters out archived projects from submenu', async () => {
    render(
      <NoteContextMenu
        x={0}
        y={0}
        noteId="note1"
        projects={mockProjects}
        onClose={mockHandlers.onClose}
        onAssignToProject={mockHandlers.onAssignToProject}
      />
    )

    // Hover to show submenu
    const assignItem = screen.getByText('Assign to Project').closest('.context-menu-item')
    if (assignItem) {
      fireEvent.mouseEnter(assignItem)
    }

    // Active projects should be visible
    expect(screen.getByText('Research Project')).toBeInTheDocument()
    expect(screen.getByText('Teaching Course')).toBeInTheDocument()

    // Archived project should not be visible
    expect(screen.queryByText('Archived Project')).not.toBeInTheDocument()
  })

  it('calls onAssignToProject when project is selected', () => {
    render(
      <NoteContextMenu
        x={0}
        y={0}
        noteId="note1"
        projects={mockProjects}
        onClose={mockHandlers.onClose}
        onAssignToProject={mockHandlers.onAssignToProject}
      />
    )

    // Hover to show submenu
    const assignItem = screen.getByText('Assign to Project').closest('.context-menu-item')
    if (assignItem) {
      fireEvent.mouseEnter(assignItem)
    }

    // Click on a project
    fireEvent.click(screen.getByText('Research Project'))

    expect(mockHandlers.onAssignToProject).toHaveBeenCalledWith('note1', 'proj1')
    expect(mockHandlers.onClose).toHaveBeenCalled()
  })

  it('calls onAssignToProject with null when None is selected', () => {
    render(
      <NoteContextMenu
        x={0}
        y={0}
        noteId="note1"
        currentProjectId="proj1"
        projects={mockProjects}
        onClose={mockHandlers.onClose}
        onAssignToProject={mockHandlers.onAssignToProject}
      />
    )

    // Hover to show submenu
    const assignItem = screen.getByText('Assign to Project').closest('.context-menu-item')
    if (assignItem) {
      fireEvent.mouseEnter(assignItem)
    }

    // Click on None
    fireEvent.click(screen.getByText('None'))

    expect(mockHandlers.onAssignToProject).toHaveBeenCalledWith('note1', null)
  })

  it('shows checkmark on currently assigned project', () => {
    render(
      <NoteContextMenu
        x={0}
        y={0}
        noteId="note1"
        currentProjectId="proj1"
        projects={mockProjects}
        onClose={mockHandlers.onClose}
        onAssignToProject={mockHandlers.onAssignToProject}
      />
    )

    // Hover to show submenu
    const assignItem = screen.getByText('Assign to Project').closest('.context-menu-item')
    if (assignItem) {
      fireEvent.mouseEnter(assignItem)
    }

    // Research Project should have active class
    const researchItem = screen.getByText('Research Project').closest('.submenu-item')
    expect(researchItem).toHaveClass('active')
  })

  it('shows Move to Inbox option when handler provided', () => {
    render(
      <NoteContextMenu
        x={0}
        y={0}
        noteId="note1"
        projects={mockProjects}
        onClose={mockHandlers.onClose}
        onAssignToProject={mockHandlers.onAssignToProject}
        onMoveToInbox={mockHandlers.onMoveToInbox}
      />
    )

    const moveButton = screen.getByText('Move to Inbox')
    expect(moveButton).toBeInTheDocument()

    fireEvent.click(moveButton)
    expect(mockHandlers.onMoveToInbox).toHaveBeenCalledWith('note1')
    expect(mockHandlers.onClose).toHaveBeenCalled()
  })

  it('shows Delete option when handler provided', () => {
    render(
      <NoteContextMenu
        x={0}
        y={0}
        noteId="note1"
        projects={mockProjects}
        onClose={mockHandlers.onClose}
        onAssignToProject={mockHandlers.onAssignToProject}
        onDelete={mockHandlers.onDelete}
      />
    )

    const deleteButton = screen.getByText('Delete')
    expect(deleteButton).toBeInTheDocument()
    expect(deleteButton.closest('.context-menu-item')).toHaveClass('danger')

    fireEvent.click(deleteButton)
    expect(mockHandlers.onDelete).toHaveBeenCalledWith('note1')
    expect(mockHandlers.onClose).toHaveBeenCalled()
  })

  it('closes on Escape key', () => {
    render(
      <NoteContextMenu
        x={0}
        y={0}
        noteId="note1"
        projects={mockProjects}
        onClose={mockHandlers.onClose}
        onAssignToProject={mockHandlers.onAssignToProject}
      />
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(mockHandlers.onClose).toHaveBeenCalled()
  })

  it('does not show Move to Inbox when handler not provided', () => {
    render(
      <NoteContextMenu
        x={0}
        y={0}
        noteId="note1"
        projects={mockProjects}
        onClose={mockHandlers.onClose}
        onAssignToProject={mockHandlers.onAssignToProject}
      />
    )

    expect(screen.queryByText('Move to Inbox')).not.toBeInTheDocument()
  })
})

// ============================================================
// NotesListPanel with Context Menu Tests
// ============================================================

describe('NotesListPanel with Context Menu', () => {
  const mockNotes: Note[] = [
    { id: 'n1', title: 'Note 1', content: 'Content 1', folder: '/', created_at: Date.now(), updated_at: Date.now(), deleted_at: null, properties: {} },
    { id: 'n2', title: 'Note 2', content: 'Content 2', folder: '/', created_at: Date.now(), updated_at: Date.now(), deleted_at: null, properties: { project_id: { key: 'project_id', value: 'proj1', type: 'text' } } },
  ]

  const mockProjects: Project[] = [
    { id: 'proj1', name: 'Test Project', type: 'research', created_at: Date.now(), updated_at: Date.now() },
  ]

  const mockHandlers = {
    onSelectNote: vi.fn(),
    onAssignToProject: vi.fn(),
    onMoveToInbox: vi.fn(),
    onDelete: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('opens context menu on right-click', () => {
    render(
      <NotesListPanel
        notes={mockNotes}
        projects={mockProjects}
        onSelectNote={mockHandlers.onSelectNote}
        onAssignToProject={mockHandlers.onAssignToProject}
        variant="compact"
      />
    )

    const noteItem = screen.getByText('Note 1').closest('button')
    if (noteItem) {
      fireEvent.contextMenu(noteItem)
    }

    // Context menu should appear
    expect(screen.getByText('Assign to Project')).toBeInTheDocument()
  })

  it('shows current project in context menu for assigned note', () => {
    render(
      <NotesListPanel
        notes={mockNotes}
        projects={mockProjects}
        onSelectNote={mockHandlers.onSelectNote}
        onAssignToProject={mockHandlers.onAssignToProject}
        variant="compact"
      />
    )

    // Right-click on note that has a project assigned
    const noteItem = screen.getByText('Note 2').closest('button')
    if (noteItem) {
      fireEvent.contextMenu(noteItem)
    }

    // Hover to show submenu
    const assignItem = screen.getByText('Assign to Project').closest('.context-menu-item')
    if (assignItem) {
      fireEvent.mouseEnter(assignItem)
    }

    // Test Project should be checked - get all matching, find the one in submenu
    const projectItems = screen.getAllByText('Test Project')
    const submenuItem = projectItems.find(el => el.closest('.submenu-item'))
    expect(submenuItem?.closest('.submenu-item')).toHaveClass('active')
  })
})
