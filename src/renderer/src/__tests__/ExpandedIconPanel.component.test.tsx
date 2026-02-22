import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExpandedIconPanel } from '../components/sidebar/ExpandedIconPanel'
import { Project, Note, ExpandedIconType, SmartIconId } from '../types'

/**
 * ExpandedIconPanel Component Tests
 *
 * Tests the unified content renderer for icon expansion in v1.16.0.
 * Covers conditional rendering, content type detection, and mode toggle.
 *
 * Test Plan: docs/testing/ICON-CENTRIC-TEST-GENERATION.md
 * Total Tests: 20 (implementing first 10 in this file)
 */

// Mock useAppViewStore
vi.mock('../store/useAppViewStore', () => ({
  useAppViewStore: vi.fn((selector) => {
    const state = {
      smartIcons: [
        {
          id: 'research' as SmartIconId,
          label: 'Research Projects',
          icon: 'flask',
          color: '#3b82f6',
          projectType: 'research' as const,
          isVisible: true,
          isExpanded: false,
          order: 0,
          preferredMode: 'compact' as const
        },
        {
          id: 'teaching' as SmartIconId,
          label: 'Teaching Projects',
          icon: 'graduation-cap',
          color: '#10b981',
          projectType: 'teaching' as const,
          isVisible: true,
          isExpanded: false,
          order: 1,
          preferredMode: 'compact' as const
        },
        {
          id: 'r-package' as SmartIconId,
          label: 'R Packages',
          icon: 'package',
          color: '#8b5cf6',
          projectType: 'r-package' as const,
          isVisible: true,
          isExpanded: false,
          order: 2,
          preferredMode: 'compact' as const
        }
      ],
      pinnedVaults: [
        {
          id: 'inbox',
          label: 'Inbox',
          order: 0,
          isPermanent: true,
          preferredMode: 'compact' as const
        }
      ],
      reorderPinnedVaults: vi.fn(),
      recentNotes: [],
      clearRecentNotes: vi.fn()
    }

    if (typeof selector === 'function') {
      return selector(state)
    }
    return state
  })
}))

// Mock child components to simplify testing
vi.mock('../components/sidebar/CompactListView', () => ({
  CompactListView: ({ showInboxNotes, projects }: { showInboxNotes?: boolean; projects: Project[] }) => (
    <div
      data-testid="compact-list-view"
      data-show-inbox={showInboxNotes ? 'true' : 'false'}
      data-project-count={projects.length}
    >
      Compact List View
    </div>
  )
}))

vi.mock('../components/sidebar/CardGridView', () => ({
  CardGridView: ({ showInboxNotes, projects }: { showInboxNotes?: boolean; projects: Project[] }) => (
    <div
      data-testid="card-grid-view"
      data-show-inbox={showInboxNotes ? 'true' : 'false'}
      data-project-count={projects.length}
    >
      Card Grid View
    </div>
  )
}))

// Test data factory
function createDefaultProps() {
  const projects: Project[] = []
  const notes: Note[] = []

  return {
    projects,
    notes,
    expandedIcon: null as ExpandedIconType,
    currentProjectId: null as string | null,
    mode: 'compact' as const,
    width: 288, // 240 compact + 48 icon bar
    onToggleMode: vi.fn(),
    onClose: vi.fn(),
    onSelectProject: vi.fn(),
    onSelectNote: vi.fn(),
    onNewNote: vi.fn(),
    onCreateProject: vi.fn(),
    onEditProject: vi.fn(),
    onArchiveProject: vi.fn(),
    onDeleteProject: vi.fn(),
    onPinProject: vi.fn(),
    onUnpinProject: vi.fn(),
    onRenameNote: vi.fn(),
    onMoveNoteToProject: vi.fn(),
    onDuplicateNote: vi.fn(),
    onDeleteNote: vi.fn()
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ExpandedIconPanel Component', () => {
  describe('Conditional Rendering', () => {
    /**
     * EIP-01: Returns null when expandedIcon is null
     */
    it('returns null when expandedIcon is null', () => {
      const props = createDefaultProps()
      const { container } = render(<ExpandedIconPanel {...props} expandedIcon={null} />)

      expect(container).toBeEmptyDOMElement()
    })

    /**
     * EIP-02: Renders panel when expandedIcon is set
     */
    it('renders panel when expandedIcon is set', () => {
      const props = createDefaultProps()
      const expandedIcon: ExpandedIconType = { type: 'vault', id: 'inbox' }

      render(<ExpandedIconPanel {...props} expandedIcon={expandedIcon} />)

      expect(screen.getByTestId('expanded-icon-panel')).toBeInTheDocument()
    })

    /**
     * EIP-03: Calculates panel width correctly (sidebarWidth - 48)
     */
    it('calculates panel width as sidebarWidth minus 48px', () => {
      const props = createDefaultProps()
      const expandedIcon: ExpandedIconType = { type: 'vault', id: 'inbox' }
      const width = 288 // 240 compact + 48 icon bar

      const { container } = render(
        <ExpandedIconPanel {...props} expandedIcon={expandedIcon} width={width} />
      )

      const panel = container.querySelector('.expanded-icon-panel')
      expect(panel).toBeInTheDocument()
      expect(panel).toHaveStyle({ width: '240px' }) // 288 - 48
    })

    /**
     * EIP-04: Updates width reactively when prop changes
     */
    it('updates panel width when width prop changes', () => {
      const props = createDefaultProps()
      const expandedIcon: ExpandedIconType = { type: 'vault', id: 'inbox' }

      const { container, rerender } = render(
        <ExpandedIconPanel {...props} expandedIcon={expandedIcon} width={288} />
      )

      let panel = container.querySelector('.expanded-icon-panel')
      expect(panel).toHaveStyle({ width: '240px' })

      rerender(<ExpandedIconPanel {...props} expandedIcon={expandedIcon} width={368} />)

      panel = container.querySelector('.expanded-icon-panel')
      expect(panel).toHaveStyle({ width: '320px' })
    })
  })

  describe('Content Type Detection', () => {
    /**
     * EIP-05: Shows Inbox label when expandedIcon is inbox vault
     */
    it('shows "Inbox" label when expanded icon is inbox', () => {
      const props = createDefaultProps()
      const expandedIcon: ExpandedIconType = { type: 'vault', id: 'inbox' }

      render(<ExpandedIconPanel {...props} expandedIcon={expandedIcon} />)

      expect(screen.getByText('Inbox')).toBeInTheDocument()
    })

    /**
     * EIP-06: Shows project name when expandedIcon is pinned project
     */
    it('shows project name when expanded icon is pinned project', () => {
      const props = createDefaultProps()
      const projects: Project[] = [
        {
          id: 'proj1',
          name: 'Research Project',
          description: '',
          type: 'research',
          color: '#3b82f6',
          icon: 'flask',
          created_at: Date.now(),
          updated_at: Date.now()
        }
      ]
      const expandedIcon: ExpandedIconType = { type: 'vault', id: 'proj1' }

      render(<ExpandedIconPanel {...props} projects={projects} expandedIcon={expandedIcon} />)

      expect(screen.getByText('Research Project')).toBeInTheDocument()
    })

    /**
     * EIP-07: Shows smart icon label when expandedIcon is smart icon
     */
    it('shows smart icon label when expanded icon is smart icon', () => {
      const props = createDefaultProps()
      const expandedIcon: ExpandedIconType = { type: 'smart', id: 'research' }

      render(<ExpandedIconPanel {...props} expandedIcon={expandedIcon} />)

      expect(screen.getByText('Research Projects')).toBeInTheDocument()
    })

    /**
     * EIP-08: Filters projects by type for smart icons
     */
    it('filters projects by project type for smart icons', () => {
      const props = createDefaultProps()
      const projects: Project[] = [
        {
          id: 'proj1',
          name: 'Research 1',
          description: '',
          type: 'research',
          color: '#3b82f6',
          icon: 'flask',
          created_at: Date.now(),
          updated_at: Date.now()
        },
        {
          id: 'proj2',
          name: 'Teaching 1',
          description: '',
          type: 'teaching',
          color: '#10b981',
          icon: 'graduation-cap',
          created_at: Date.now(),
          updated_at: Date.now()
        },
        {
          id: 'proj3',
          name: 'Research 2',
          description: '',
          type: 'research',
          color: '#3b82f6',
          icon: 'flask',
          created_at: Date.now(),
          updated_at: Date.now()
        }
      ]
      const expandedIcon: ExpandedIconType = { type: 'smart', id: 'research' }

      render(<ExpandedIconPanel {...props} projects={projects} expandedIcon={expandedIcon} />)

      // CompactListView should receive only 2 research projects (filtered)
      const compactView = screen.getByTestId('compact-list-view')
      expect(compactView).toHaveAttribute('data-project-count', '2')
    })

    /**
     * EIP-09: Shows all projects for pinned project vault
     */
    it('shows all projects when expanded icon is pinned project', () => {
      const props = createDefaultProps()
      const projects: Project[] = [
        {
          id: 'proj1',
          name: 'Research 1',
          description: '',
          type: 'research',
          color: '#3b82f6',
          icon: 'flask',
          created_at: Date.now(),
          updated_at: Date.now()
        },
        {
          id: 'proj2',
          name: 'Teaching 1',
          description: '',
          type: 'teaching',
          color: '#10b981',
          icon: 'graduation-cap',
          created_at: Date.now(),
          updated_at: Date.now()
        }
      ]
      const expandedIcon: ExpandedIconType = { type: 'vault', id: 'proj1' }

      render(<ExpandedIconPanel {...props} projects={projects} expandedIcon={expandedIcon} />)

      // CompactListView should receive all projects (not filtered)
      const compactView = screen.getByTestId('compact-list-view')
      expect(compactView).toHaveAttribute('data-project-count', '2')
    })

    /**
     * EIP-10: Sets showInboxNotes flag only for inbox
     */
    it('sets showInboxNotes true only when expanded icon is inbox', () => {
      const props = createDefaultProps()

      // Test inbox
      const inboxIcon: ExpandedIconType = { type: 'vault', id: 'inbox' }
      const { rerender } = render(<ExpandedIconPanel {...props} expandedIcon={inboxIcon} />)

      let compactView = screen.getByTestId('compact-list-view')
      expect(compactView).toHaveAttribute('data-show-inbox', 'true')

      // Test pinned project
      const projectIcon: ExpandedIconType = { type: 'vault', id: 'proj1' }
      rerender(<ExpandedIconPanel {...props} expandedIcon={projectIcon} />)

      compactView = screen.getByTestId('compact-list-view')
      expect(compactView).toHaveAttribute('data-show-inbox', 'false')
    })
  })

  describe('Mode Toggle', () => {
    /**
     * EIP-11: Renders LayoutGrid icon in compact mode
     * Note: We test for the button with correct tooltip instead of icon component
     */
    it('renders mode toggle button with "card view" tooltip in compact mode', () => {
      const props = createDefaultProps()
      const expandedIcon: ExpandedIconType = { type: 'vault', id: 'inbox' }

      render(<ExpandedIconPanel {...props} expandedIcon={expandedIcon} mode="compact" />)

      const toggleButton = screen.getByTitle('Switch to card view')
      expect(toggleButton).toBeInTheDocument()
      expect(toggleButton).toHaveAttribute('aria-label', 'Switch to card view')
    })

    /**
     * EIP-12: Renders LayoutList icon in card mode
     * Note: We test for the button with correct tooltip instead of icon component
     */
    it('renders mode toggle button with "compact view" tooltip in card mode', () => {
      const props = createDefaultProps()
      const expandedIcon: ExpandedIconType = { type: 'vault', id: 'inbox' }

      render(<ExpandedIconPanel {...props} expandedIcon={expandedIcon} mode="card" />)

      const toggleButton = screen.getByTitle('Switch to compact view')
      expect(toggleButton).toBeInTheDocument()
      expect(toggleButton).toHaveAttribute('aria-label', 'Switch to compact view')
    })

    /**
     * EIP-13: Calls onToggleMode when mode toggle clicked
     */
    it('calls onToggleMode when mode toggle button clicked', () => {
      const props = createDefaultProps()
      const expandedIcon: ExpandedIconType = { type: 'vault', id: 'inbox' }

      render(<ExpandedIconPanel {...props} expandedIcon={expandedIcon} />)

      const toggleButton = screen.getByTitle(/switch to/i)
      toggleButton.click()

      expect(props.onToggleMode).toHaveBeenCalledTimes(1)
    })

    /**
     * EIP-14: Shows correct tooltip for current mode
     */
    it('shows "Switch to card view" in compact mode', () => {
      const props = createDefaultProps()
      const expandedIcon: ExpandedIconType = { type: 'vault', id: 'inbox' }

      render(<ExpandedIconPanel {...props} expandedIcon={expandedIcon} mode="compact" />)

      expect(screen.getByTitle('Switch to card view')).toBeInTheDocument()
    })

    it('shows "Switch to compact view" in card mode', () => {
      const props = createDefaultProps()
      const expandedIcon: ExpandedIconType = { type: 'vault', id: 'inbox' }

      render(<ExpandedIconPanel {...props} expandedIcon={expandedIcon} mode="card" />)

      expect(screen.getByTitle('Switch to compact view')).toBeInTheDocument()
    })
  })

  describe('View Switching', () => {
    /**
     * EIP-15: Renders CompactListView in compact mode
     */
    it('renders CompactListView when mode is compact', () => {
      const props = createDefaultProps()
      const expandedIcon: ExpandedIconType = { type: 'vault', id: 'inbox' }

      render(<ExpandedIconPanel {...props} expandedIcon={expandedIcon} mode="compact" />)

      expect(screen.getByTestId('compact-list-view')).toBeInTheDocument()
      expect(screen.queryByTestId('card-grid-view')).not.toBeInTheDocument()
    })

    /**
     * EIP-16: Renders CardGridView in card mode
     */
    it('renders CardGridView when mode is card', () => {
      const props = createDefaultProps()
      const expandedIcon: ExpandedIconType = { type: 'vault', id: 'inbox' }

      render(<ExpandedIconPanel {...props} expandedIcon={expandedIcon} mode="card" />)

      expect(screen.getByTestId('card-grid-view')).toBeInTheDocument()
      expect(screen.queryByTestId('compact-list-view')).not.toBeInTheDocument()
    })

    /**
     * EIP-17: Switches from CompactListView to CardGridView on mode change
     */
    it('switches views when mode prop changes', () => {
      const props = createDefaultProps()
      const expandedIcon: ExpandedIconType = { type: 'vault', id: 'inbox' }

      const { rerender } = render(
        <ExpandedIconPanel {...props} expandedIcon={expandedIcon} mode="compact" />
      )

      expect(screen.getByTestId('compact-list-view')).toBeInTheDocument()

      rerender(<ExpandedIconPanel {...props} expandedIcon={expandedIcon} mode="card" />)

      expect(screen.queryByTestId('compact-list-view')).not.toBeInTheDocument()
      expect(screen.getByTestId('card-grid-view')).toBeInTheDocument()
    })

    /**
     * EIP-18: Preserves scroll position when switching modes
     * Note: Skipped - scroll preservation is managed by parent container,
     * not by ExpandedIconPanel component itself.
     */
    it.skip('preserves scroll position when switching between modes', () => {
      // Skipped - scroll state managed by parent MissionSidebar component
      // This would require testing the parent container's scroll behavior
    })
  })

  describe('Close Button', () => {
    /**
     * EIP-19: Renders close button
     */
    it('renders close button with correct tooltip', () => {
      const props = createDefaultProps()
      const expandedIcon: ExpandedIconType = { type: 'vault', id: 'inbox' }

      render(<ExpandedIconPanel {...props} expandedIcon={expandedIcon} />)

      expect(screen.getByTitle('Collapse')).toBeInTheDocument()
      expect(screen.getByLabelText('Collapse panel')).toBeInTheDocument()
    })

    /**
     * EIP-20: Calls onClose when close button clicked
     */
    it('calls onClose when close button clicked', () => {
      const props = createDefaultProps()
      const expandedIcon: ExpandedIconType = { type: 'vault', id: 'inbox' }

      render(<ExpandedIconPanel {...props} expandedIcon={expandedIcon} />)

      const closeButton = screen.getByTitle('Collapse')
      closeButton.click()

      expect(props.onClose).toHaveBeenCalledTimes(1)
    })
  })
})
