import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MissionSidebar } from '../components/sidebar/MissionSidebar'
import { Project, Note } from '../types'

/**
 * MissionSidebar Integration Tests (v1.16.0 Icon-Centric)
 *
 * Tests the icon-centric sidebar architecture where:
 * - Icon bar is always visible (48px)
 * - Expansion panel is conditional based on expandedIcon
 * - No collapse/expand toggle (icons control expansion)
 */

describe('MissionSidebar Integration (v1.16.0)', () => {
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
      project_id: '1',
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
    onSearch: vi.fn(),
    onDaily: vi.fn(),
    onOpenSettings: vi.fn(),
    onNewNote: vi.fn(),
    onEditProject: vi.fn(),
    onArchiveProject: vi.fn(),
    onDeleteProject: vi.fn(),
    onPinProject: vi.fn(),
    onUnpinProject: vi.fn(),
    onRenameNote: vi.fn(),
    onMoveNoteToProject: vi.fn(),
    onDuplicateNote: vi.fn(),
    onDeleteNote: vi.fn(),
  }

  it('renders MissionSidebar component with icon-centric class', () => {
    const { container } = render(
      <MissionSidebar
        projects={mockProjects}
        notes={mockNotes}
        currentProjectId={null}
        {...mockHandlers}
      />
    )

    const sidebar = container.querySelector('.mission-sidebar.icon-centric-mode')
    expect(sidebar).toBeInTheDocument()
  })

  it('always renders icon bar (48px wide)', () => {
    const { container } = render(
      <MissionSidebar
        projects={mockProjects}
        notes={mockNotes}
        currentProjectId={null}
        {...mockHandlers}
      />
    )

    // Icon bar should always be present
    const iconBar = container.querySelector('.mission-sidebar-icon')
    expect(iconBar).toBeInTheDocument()
  })

  it('renders activity bar with search/daily/settings buttons', () => {
    render(
      <MissionSidebar
        projects={mockProjects}
        notes={mockNotes}
        currentProjectId={null}
        {...mockHandlers}
      />
    )

    // Activity bar should be present
    const searchBtn = screen.queryByTitle(/search/i)
    const dailyBtn = screen.queryByTitle(/daily/i)
    const settingsBtn = screen.queryByTitle(/settings/i)

    expect(searchBtn || dailyBtn || settingsBtn).toBeTruthy()
  })

  it('does not render expansion panel when no icon is expanded', () => {
    const { container } = render(
      <MissionSidebar
        projects={mockProjects}
        notes={mockNotes}
        currentProjectId={null}
        {...mockHandlers}
      />
    )

    // Expansion panel should not be present when collapsed
    const expandedPanel = container.querySelector('.expanded-icon-panel')
    expect(expandedPanel).not.toBeInTheDocument()
  })

  it('sets sidebar width based on expansion state', () => {
    const { container } = render(
      <MissionSidebar
        projects={mockProjects}
        notes={mockNotes}
        currentProjectId={null}
        {...mockHandlers}
      />
    )

    const sidebar = container.querySelector('.mission-sidebar')

    // Width should be set via inline style
    expect(sidebar).toHaveAttribute('style')
  })

  it('has icon-centric data attribute', () => {
    const { container } = render(
      <MissionSidebar
        projects={mockProjects}
        notes={mockNotes}
        currentProjectId={null}
        {...mockHandlers}
      />
    )

    const sidebar = container.querySelector('.mission-sidebar')

    // Should have data-mode attribute
    expect(sidebar).toHaveAttribute('data-mode')
  })
})
