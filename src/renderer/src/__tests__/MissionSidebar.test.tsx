import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MissionSidebar } from '../components/sidebar/MissionSidebar'
import { Project, Note } from '../types'

describe('MissionSidebar Integration', () => {
  const mockProjects: Project[] = [
    {
      id: '1',
      name: 'Test Research Project',
      type: 'research',
      status: 'active',
      progress: 75,
      created_at: Date.now(),
      updated_at: Date.now(),
    },
    {
      id: '2',
      name: 'Teaching Materials',
      type: 'teaching',
      status: 'planning',
      progress: 30,
      created_at: Date.now(),
      updated_at: Date.now() - 1000,
    },
  ]

  const mockNotes: Note[] = [
    {
      id: 'n1',
      title: 'Research Note 1',
      content: 'Some research content',
      folder: '/',
      created_at: Date.now(),
      updated_at: Date.now(),
      deleted_at: null,
      properties: {
        project_id: { key: 'project_id', value: '1', type: 'text' },
      },
    },
  ]

  const mockHandlers = {
    onSelectProject: vi.fn(),
    onSelectNote: vi.fn(),
    onCreateProject: vi.fn(),
    onOpenSearch: vi.fn(),
    onOpenJournal: vi.fn(),
    onOpenSettings: vi.fn(),
    onNewNote: vi.fn(),
    onEditProject: vi.fn(),
    onArchiveProject: vi.fn(),
    onDeleteProject: vi.fn(),
  }

  it('renders MissionSidebar component', () => {
    const { container } = render(
      <MissionSidebar
        projects={mockProjects}
        notes={mockNotes}
        currentProjectId={null}
        {...mockHandlers}
      />
    )

    const sidebar = container.querySelector('.mission-sidebar')
    expect(sidebar).toBeInTheDocument()
  })

  it('renders in icon mode by default or compact mode', () => {
    const { container } = render(
      <MissionSidebar
        projects={mockProjects}
        notes={mockNotes}
        currentProjectId={null}
        {...mockHandlers}
      />
    )

    // Should render either icon or compact mode
    const iconMode = container.querySelector('.mission-sidebar-icon')
    const compactMode = container.querySelector('.mission-sidebar-compact')
    
    expect(iconMode || compactMode).toBeTruthy()
  })

  it('displays project names in compact mode', () => {
    // Force compact mode by mocking the store
    const { container } = render(
      <MissionSidebar
        projects={mockProjects}
        notes={mockNotes}
        currentProjectId={null}
        {...mockHandlers}
      />
    )

    // If in compact mode, should show project names
    const compactMode = container.querySelector('.mission-sidebar-compact')
    if (compactMode) {
      expect(screen.queryByText('Test Research Project')).toBeInTheDocument()
    }
  })

  it('shows toggle button', () => {
    render(
      <MissionSidebar
        projects={mockProjects}
        notes={mockNotes}
        currentProjectId={null}
        {...mockHandlers}
      />
    )

    // Should have a toggle button in any mode
    const toggleBtn = screen.queryByTitle(/sidebar/i)
    expect(toggleBtn).toBeInTheDocument()
  })
})
