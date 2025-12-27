import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StatusDot, getStatusColor } from '../components/sidebar/StatusDot'
import { IconBarMode } from '../components/sidebar/IconBarMode'
import { CompactListMode } from '../components/sidebar/CompactListMode'
import { ResizeHandle } from '../components/sidebar/ResizeHandle'
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
    { id: '1', name: 'Project A', type: 'general', status: 'active', created_at: Date.now(), updated_at: Date.now() },
    { id: '2', name: 'Project B', type: 'research', status: 'planning', created_at: Date.now(), updated_at: Date.now() - 1000 },
    { id: '3', name: 'Project C', type: 'manuscript', status: 'archive', created_at: Date.now(), updated_at: Date.now() - 2000 },
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
        currentProjectId={null}
        {...mockHandlers}
      />
    )

    // Should render Project A and B (active, planning) but not C (archive)
    expect(screen.getByTitle('Project A')).toBeInTheDocument()
    expect(screen.getByTitle('Project B')).toBeInTheDocument()
    expect(screen.queryByTitle('Project C')).not.toBeInTheDocument()
  })

  it('calls onSelectProject when project icon clicked', () => {
    render(
      <IconBarMode
        projects={mockProjects}
        currentProjectId={null}
        {...mockHandlers}
      />
    )

    fireEvent.click(screen.getByTitle('Project A'))
    expect(mockHandlers.onSelectProject).toHaveBeenCalledWith('1')
  })

  it('marks current project as active', () => {
    const { container } = render(
      <IconBarMode
        projects={mockProjects}
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
      type: 'general' as const,
      status: 'active' as const,
      created_at: Date.now(),
      updated_at: Date.now() - i * 1000,
    }))

    const { container } = render(
      <IconBarMode
        projects={manyProjects}
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
    { id: '2', name: 'Blog Post', type: 'general', status: 'planning', created_at: Date.now(), updated_at: Date.now() - 1000 },
  ]

  const mockNotes: Note[] = [
    { id: 'n1', title: 'Note 1', content: 'Some content here', created_at: Date.now(), updated_at: Date.now(), properties: { project_id: { key: 'project_id', value: '1', type: 'text' } } },
    { id: 'n2', title: 'Note 2', content: 'More content', created_at: Date.now(), updated_at: Date.now() - 500, properties: {} },
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

  it('renders header with project count', () => {
    render(
      <CompactListMode
        projects={mockProjects}
        notes={[]}
        currentProjectId={null}
        width={240}
        {...mockHandlers}
      />
    )

    expect(screen.getByText(/Projects/)).toBeInTheDocument()
    expect(screen.getByText('(2)')).toBeInTheDocument()
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
      type: 'general' as const,
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
      { id: '2', name: 'Blog Post', type: 'general', created_at: Date.now(), updated_at: Date.now() },
      { id: '3', name: 'Another Research', type: 'research', created_at: Date.now(), updated_at: Date.now() },
      { id: '4', name: 'Notes', type: 'general', created_at: Date.now(), updated_at: Date.now() },
      { id: '5', name: 'Draft', type: 'general', created_at: Date.now(), updated_at: Date.now() },
      { id: '6', name: 'Final', type: 'general', created_at: Date.now(), updated_at: Date.now() },
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
      type: 'general' as const,
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
      { id: '3', name: 'Archived Project', type: 'general', status: 'archive', created_at: Date.now(), updated_at: Date.now() },
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
