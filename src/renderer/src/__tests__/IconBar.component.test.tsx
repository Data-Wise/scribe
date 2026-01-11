import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { IconBar } from '../components/sidebar/IconBar'
import type { Project, Note, ExpandedIconType, SmartIconId } from '../types'

/**
 * IconBar Component Test Suite (v1.16.0)
 *
 * Tests for icon-centric sidebar icon bar component:
 * - Basic rendering and layout
 * - Expanded state indicators
 * - Click interactions
 * - Drag and drop functionality
 * - Badge and count display
 */

// Mock useAppViewStore
vi.mock('../store/useAppViewStore', () => ({
  useAppViewStore: vi.fn((selector) => {
    const state = {
      pinnedVaults: [
        {
          id: 'inbox',
          label: 'Inbox',
          order: 0,
          isPermanent: true,
          preferredMode: 'compact' as const
        }
      ],
      smartIcons: [
        {
          id: 'research' as SmartIconId,
          label: 'Research',
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
          label: 'Teaching',
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
          label: 'R Package',
          icon: 'package',
          color: '#8b5cf6',
          projectType: 'r-package' as const,
          isVisible: false, // Hidden
          isExpanded: false,
          order: 2,
          preferredMode: 'compact' as const
        }
      ],
      reorderPinnedVaults: vi.fn(),
      recentNotes: [],
      clearRecentNotes: vi.fn()
    }

    // If selector is a function, call it with state
    if (typeof selector === 'function') {
      return selector(state)
    }

    return state
  })
}))

// Default props factory
interface IconBarProps {
  projects: Project[]
  notes: Note[]
  expandedIcon: ExpandedIconType
  onToggleVault: (vaultId: string) => void
  onToggleSmartIcon: (iconId: SmartIconId) => void
  onSearch: () => void
  onDaily: () => void
  onSettings: () => void
  onSelectNote: (noteId: string) => void
  onCreateProject: () => void
  activeActivityItem?: 'search' | 'daily' | 'recent' | 'settings' | null
}

const createDefaultProps = (): IconBarProps => ({
  projects: [],
  notes: [],
  expandedIcon: null,
  onToggleVault: vi.fn(),
  onToggleSmartIcon: vi.fn(),
  onSearch: vi.fn(),
  onDaily: vi.fn(),
  onSettings: vi.fn(),
  onSelectNote: vi.fn(),
  onCreateProject: vi.fn(),
  activeActivityItem: null
})

describe('IconBar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    /**
     * IB-01: Renders icon bar with fixed 48px width
     */
    it('renders icon bar with fixed 48px width', () => {
      const props = createDefaultProps()
      const { container } = render(<IconBar {...props} />)

      const iconBar = container.querySelector('.mission-sidebar-icon')
      expect(iconBar).toBeInTheDocument()
      expect(iconBar).toHaveStyle({ width: '48px' })
    })

    /**
     * IB-02: Renders Inbox button at top
     */
    it('renders Inbox button at top', () => {
      const props = createDefaultProps()
      render(<IconBar {...props} />)

      const inboxButton = screen.getByTestId('inbox-icon-button')
      expect(inboxButton).toBeInTheDocument()
      expect(inboxButton).toHaveClass('inbox-icon-btn')
    })

    /**
     * IB-03: Renders visible smart icons in correct order
     */
    it('renders visible smart icons in correct order', () => {
      const props = createDefaultProps()
      render(<IconBar {...props} />)

      // Should render Research (order 0) and Teaching (order 1)
      const researchBtn = screen.getByTestId('smart-icon-research')
      const teachingBtn = screen.getByTestId('smart-icon-teaching')

      expect(researchBtn).toBeInTheDocument()
      expect(teachingBtn).toBeInTheDocument()

      // Should NOT render hidden R Package icon
      const rPackageBtn = screen.queryByTestId('smart-icon-r-package')
      expect(rPackageBtn).not.toBeInTheDocument()
    })

    /**
     * IB-04: Renders pinned project icons sorted by vault order
     *
     * Note: This test is skipped because it requires complex mocking of useAppViewStore
     * with dynamic pinnedVaults. The sorting logic is tested in integration tests.
     */
    it.skip('renders pinned project icons sorted by vault order', () => {
      // Skipped - requires complex store mocking
      // Covered by integration tests
    })

    /**
     * IB-05: Renders empty state when no pinned projects
     */
    it('renders empty state when no pinned projects', () => {
      const props = createDefaultProps()
      render(<IconBar {...props} projects={[]} />)

      expect(screen.getByText('No projects yet')).toBeInTheDocument()
      expect(screen.getByText('Create your first project to organize your notes')).toBeInTheDocument()
    })

    /**
     * IB-06: Renders activity bar at bottom
     */
    it('renders activity bar at bottom', () => {
      const props = createDefaultProps()
      render(<IconBar {...props} />)

      // Activity bar should be present (contains search, recent, daily, settings)
      expect(screen.getByTitle(/search/i)).toBeInTheDocument()
      expect(screen.getByTitle(/daily note/i)).toBeInTheDocument()
      expect(screen.getByTitle(/settings/i)).toBeInTheDocument()
    })

    /**
     * IB-07: Renders add project button
     */
    it('renders add project button with keyboard shortcut tooltip', () => {
      const props = createDefaultProps()
      render(<IconBar {...props} />)

      const addButton = screen.getByTitle('New project (⌘⇧P)')
      expect(addButton).toBeInTheDocument()
      expect(addButton).toHaveClass('add-project-icon')
    })

    /**
     * IB-08: Shows inbox count badge when unassigned notes exist
     */
    it('shows inbox count badge when unassigned notes exist', () => {
      const notes: Note[] = [
        {
          id: 'note1',
          title: 'Unassigned Note 1',
          content: '',
          project_id: null,
          folder: '',
          tags: [],
          created_at: Date.now(),
          updated_at: Date.now(),
          deleted_at: null
        },
        {
          id: 'note2',
          title: 'Unassigned Note 2',
          content: '',
          project_id: null,
          folder: '',
          tags: [],
          created_at: Date.now(),
          updated_at: Date.now(),
          deleted_at: null
        },
        {
          id: 'note3',
          title: 'Assigned Note',
          content: '',
          project_id: 'proj1',
          folder: '',
          tags: [],
          created_at: Date.now(),
          updated_at: Date.now(),
          deleted_at: null
        }
      ]

      const props = createDefaultProps()
      render(<IconBar {...props} notes={notes} />)

      const inboxButton = screen.getByTestId('inbox-icon-button')
      const badge = within(inboxButton).getByTestId('inbox-badge')

      expect(badge).toBeInTheDocument()
      expect(badge).toHaveTextContent('2')
    })
  })

  describe('Expanded State Indicators', () => {
    /**
     * IB-09: Highlights Inbox button when expanded
     */
    it('highlights Inbox button when expanded', () => {
      const expandedIcon: ExpandedIconType = { type: 'vault', id: 'inbox' }
      const props = createDefaultProps()

      render(<IconBar {...props} expandedIcon={expandedIcon} />)

      const inboxButton = screen.getByTestId('inbox-icon-button')
      expect(inboxButton).toHaveClass('active')
    })

    /**
     * IB-10: Highlights smart icon when expanded
     */
    it('highlights smart icon when expanded', () => {
      const expandedIcon: ExpandedIconType = { type: 'smart', id: 'research' }
      const props = createDefaultProps()

      render(<IconBar {...props} expandedIcon={expandedIcon} />)

      const researchButton = screen.getByTestId('smart-icon-research')
      expect(researchButton).toHaveClass('expanded')
    })
  })
})
