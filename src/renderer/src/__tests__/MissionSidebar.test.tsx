import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MissionSidebar } from '../components/sidebar/MissionSidebar'
import { Project, Note, SmartIconId } from '../types'

/**
 * MissionSidebar Integration Tests (v1.16.0 Icon-Centric)
 *
 * Tests the icon-centric sidebar architecture where:
 * - Icon bar is always visible (48px)
 * - Expansion panel is conditional based on expandedIcon
 * - No collapse/expand toggle (icons control expansion)
 */

// Hoisted mocks for store state — can be mutated per test
const { mockToggleIcon, mockExpandedIcon, mockPinnedVaults } = vi.hoisted(() => ({
  mockToggleIcon: vi.fn(),
  mockExpandedIcon: { current: null as { type: 'vault' | 'smart'; id: string } | null },
  mockPinnedVaults: {
    current: [
      { id: 'inbox', label: 'Inbox', order: 0, isPermanent: true, preferredMode: 'compact' as const },
      { id: '1', label: 'Test Research Project', order: 1, isPermanent: false, preferredMode: 'compact' as const },
    ]
  }
}))

vi.mock('../store/useAppViewStore', () => ({
  useAppViewStore: vi.fn((selector?: (state: any) => any) => {
    const state = {
      expandedIcon: mockExpandedIcon.current,
      sidebarWidth: 280,
      pinnedVaults: mockPinnedVaults.current,
      smartIcons: [
        { id: 'research' as SmartIconId, label: 'Research', icon: 'flask', color: '#3b82f6', projectType: 'research' as const, isVisible: true, isExpanded: false, order: 0, preferredMode: 'compact' as const },
        { id: 'teaching' as SmartIconId, label: 'Teaching', icon: 'graduation-cap', color: '#f59e0b', projectType: 'teaching' as const, isVisible: true, isExpanded: false, order: 1, preferredMode: 'compact' as const },
        { id: 'packages' as SmartIconId, label: 'R Packages', icon: 'package', color: '#10b981', projectType: 'package' as const, isVisible: true, isExpanded: false, order: 2, preferredMode: 'compact' as const },
        { id: 'devtools' as SmartIconId, label: 'Dev Tools', icon: 'wrench', color: '#8b5cf6', projectType: 'development' as const, isVisible: true, isExpanded: false, order: 3, preferredMode: 'compact' as const },
      ],
      toggleIcon: mockToggleIcon,
      setIconMode: vi.fn(),
      collapseAll: vi.fn(),
      setSidebarWidth: vi.fn(),
      reorderPinnedVaults: vi.fn(),
      recentNotes: [],
      clearRecentNotes: vi.fn(),
      compactModeWidth: 280,
      cardModeWidth: 360,
    }
    return selector ? selector(state) : state
  }),
  SIDEBAR_WIDTHS: {
    icon: 48,
    compact: { min: 180, default: 280, max: 400 },
    card: { min: 280, default: 360, max: 500 },
  }
}))

vi.mock('../store/useSettingsStore', () => ({
  useSettingsStore: vi.fn((selector?: (state: any) => any) => {
    const state = {
      settings: { 'appearance.sidebarWidth': 'medium' },
      updateSetting: vi.fn(),
    }
    return selector ? selector(state) : state
  })
}))

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

  const createMockHandlers = () => ({
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
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockExpandedIcon.current = null
  })

  it('renders MissionSidebar component with icon-centric class', () => {
    const { container } = render(
      <MissionSidebar
        projects={mockProjects}
        notes={mockNotes}
        currentProjectId={null}
        {...createMockHandlers()}
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
        {...createMockHandlers()}
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
        {...createMockHandlers()}
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
        {...createMockHandlers()}
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
        {...createMockHandlers()}
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
        {...createMockHandlers()}
      />
    )

    const sidebar = container.querySelector('.mission-sidebar')

    // Should have data-mode attribute
    expect(sidebar).toHaveAttribute('data-mode')
  })

  /**
   * Vault toggle → onSelectProject wiring tests
   *
   * When a vault dot is clicked to expand, onSelectProject should be called
   * so the breadcrumb and search scope update to match the expanded project.
   * When collapsing, onSelectProject should NOT be called.
   */
  describe('vault toggle updates currentProject', () => {
    it('calls onSelectProject when vault dot is expanded', () => {
      // expandedIcon is null → clicking vault '1' is an expansion
      mockExpandedIcon.current = null
      const handlers = createMockHandlers()

      render(
        <MissionSidebar
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...handlers}
        />
      )

      // Click the pinned project vault dot
      const vaultDot = screen.getByTestId('project-icon-1')
      fireEvent.click(vaultDot)

      // Should call toggleIcon (store action)
      expect(mockToggleIcon).toHaveBeenCalledWith('vault', '1')
      // Should call onSelectProject with the project ID (breadcrumb update)
      expect(handlers.onSelectProject).toHaveBeenCalledWith('1')
    })

    it('does not call onSelectProject when vault dot is collapsed', () => {
      // expandedIcon already pointing to vault '1' → clicking it is a collapse
      mockExpandedIcon.current = { type: 'vault', id: '1' }
      const handlers = createMockHandlers()

      render(
        <MissionSidebar
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={'1'}
          {...handlers}
        />
      )

      // Click the same vault dot (collapsing it)
      const vaultDot = screen.getByTestId('project-icon-1')
      fireEvent.click(vaultDot)

      // Should still call toggleIcon (to collapse)
      expect(mockToggleIcon).toHaveBeenCalledWith('vault', '1')
      // Should NOT call onSelectProject (we're collapsing, not selecting)
      expect(handlers.onSelectProject).not.toHaveBeenCalled()
    })

    it('calls onSelectProject(null) when inbox vault is expanded', () => {
      mockExpandedIcon.current = null
      const handlers = createMockHandlers()

      render(
        <MissionSidebar
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={'1'}
          {...handlers}
        />
      )

      // Click the inbox button
      const inboxBtn = screen.getByTestId('inbox-icon-button')
      fireEvent.click(inboxBtn)

      // Should call onSelectProject(null) — inbox has no project
      expect(handlers.onSelectProject).toHaveBeenCalledWith(null)
    })
  })
})
