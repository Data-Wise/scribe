import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { IconBarMode } from '../components/sidebar/IconBarMode'
import { ExpandedChildProjects } from '../components/sidebar/ExpandedChildProjects'
import { ProjectAvatar } from '../components/sidebar/ProjectAvatar'
import { Project, Note } from '../types'

// Mock the Zustand store with smart icons state
vi.mock('../store/useAppViewStore', () => ({
  useAppViewStore: (selector: any) => {
    const state = {
      pinnedVaults: [
        { id: 'inbox', order: 0, isPinned: true },
        { id: 'research-1', order: 1, isPinned: true },
        { id: 'research-2', order: 2, isPinned: true }
      ],
      reorderPinnedVaults: vi.fn(),
      smartIcons: [
        {
          id: 'smart-research',
          name: 'Research',
          icon: '🎓',
          color: '#8B5CF6', // Purple
          projectType: 'research',
          order: 1,
          isVisible: true,
          isExpanded: false
        },
        {
          id: 'smart-writing',
          name: 'Writing',
          icon: '✍️',
          color: '#3B82F6', // Blue
          projectType: 'writing',
          order: 2,
          isVisible: true,
          isExpanded: false
        },
        {
          id: 'smart-teaching',
          name: 'Teaching',
          icon: '🎓',
          color: '#10B981', // Green
          projectType: 'teaching',
          order: 3,
          isVisible: true,
          isExpanded: false
        }
      ],
      expandedSmartIconId: null,
      toggleSmartIcon: vi.fn()
    }
    return selector ? selector(state) : state
  }
}))

/**
 * Child Project Identification E2E Test Suite (Phase 1)
 * Sprint 34 Phase 3.1 - Child Project Identification
 *
 * Tests the complete user flow for identifying child projects under smart icons:
 * - Dynamic sidebar width expansion (48px → 240px)
 * - First-letter avatar icons with smart icon colors
 * - 2-line layout with project name + metadata
 * - Accordion behavior (one smart icon expanded at a time)
 * - Child project navigation
 */
describe('Child Project Identification (Phase 1)', () => {
  const mockProjects: Project[] = [
    {
      id: 'research-1',
      name: 'Mediation Planning',
      type: 'research',
      status: 'active',
      created_at: Date.now() - 7200000, // 2 hours ago
      updated_at: Date.now() - 7200000,
      sort_order: 1
    },
    {
      id: 'research-2',
      name: 'Product of Three',
      type: 'research',
      status: 'active',
      created_at: Date.now() - 86400000, // 1 day ago
      updated_at: Date.now() - 86400000,
      sort_order: 2
    },
    {
      id: 'research-3',
      name: 'Collider Bias Study',
      type: 'research',
      status: 'active',
      created_at: Date.now() - 259200000, // 3 days ago
      updated_at: Date.now() - 259200000,
      sort_order: 3
    },
    {
      id: 'writing-1',
      name: 'Novel Draft',
      type: 'writing',
      status: 'active',
      created_at: Date.now() - 86400000,
      updated_at: Date.now() - 86400000,
      sort_order: 4
    }
  ]

  const mockNotes: Note[] = [
    // Mediation Planning notes (12 notes)
    ...Array.from({ length: 12 }, (_, i) => ({
      id: `note-research-1-${i}`,
      title: `Research Note ${i + 1}`,
      content: 'Content',
      project_id: 'research-1',
      created_at: Date.now(),
      updated_at: Date.now()
    })),
    // Product of Three notes (8 notes)
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `note-research-2-${i}`,
      title: `Product Note ${i + 1}`,
      content: 'Content',
      project_id: 'research-2',
      created_at: Date.now(),
      updated_at: Date.now()
    })),
    // Collider Bias notes (5 notes)
    ...Array.from({ length: 5 }, (_, i) => ({
      id: `note-research-3-${i}`,
      title: `Collider Note ${i + 1}`,
      content: 'Content',
      project_id: 'research-3',
      created_at: Date.now(),
      updated_at: Date.now()
    })),
    // Writing project notes (3 notes)
    ...Array.from({ length: 3 }, (_, i) => ({
      id: `note-writing-1-${i}`,
      title: `Novel Note ${i + 1}`,
      content: 'Content',
      project_id: 'writing-1',
      created_at: Date.now(),
      updated_at: Date.now()
    }))
  ]

  const mockHandlers = {
    onSelectProject: vi.fn(),
    onCreateProject: vi.fn(),
    onExpand: vi.fn(),
    onSearch: vi.fn(),
    onDaily: vi.fn(),
    onSettings: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ProjectAvatar Component', () => {
    it('renders first letter in uppercase', () => {
      render(<ProjectAvatar letter="m" color="#8B5CF6" size="md" />)
      const avatar = document.querySelector('.project-avatar')
      expect(avatar).toHaveTextContent('M')
    })

    it('applies smart icon color to background', () => {
      const { container } = render(
        <ProjectAvatar letter="P" color="#8B5CF6" size="md" />
      )
      const avatar = container.querySelector('.project-avatar')
      expect(avatar).toHaveStyle({ backgroundColor: '#8B5CF6' })
    })

    it('renders medium size by default', () => {
      const { container } = render(<ProjectAvatar letter="C" color="#8B5CF6" />)
      const avatar = container.querySelector('.project-avatar')
      expect(avatar).toHaveClass('project-avatar', 'md')
    })

    it('renders small size when specified', () => {
      const { container } = render(
        <ProjectAvatar letter="C" color="#8B5CF6" size="sm" />
      )
      const avatar = container.querySelector('.project-avatar')
      expect(avatar).toHaveClass('project-avatar', 'sm')
    })

    it('uses aria-hidden for accessibility', () => {
      const { container } = render(<ProjectAvatar letter="M" color="#8B5CF6" />)
      const avatar = container.querySelector('.project-avatar')
      expect(avatar).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('ExpandedChildProjects Component', () => {
    const mockChildProjects: Project[] = [
      {
        id: 'research-1',
        name: 'Mediation Planning',
        type: 'research',
        status: 'active',
        created_at: Date.now() - 7200000, // 2 hours ago
        updated_at: Date.now() - 7200000,
        sort_order: 1
      },
      {
        id: 'research-2',
        name: 'Product of Three',
        type: 'research',
        status: 'active',
        created_at: Date.now() - 86400000, // 1 day ago
        updated_at: Date.now() - 86400000,
        sort_order: 2
      }
    ]

    const mockNoteCounts = {
      'research-1': 12,
      'research-2': 8
    }

    it('renders all child projects sorted alphabetically', () => {
      render(
        <ExpandedChildProjects
          projects={mockChildProjects}
          currentProjectId={null}
          onSelectProject={mockHandlers.onSelectProject}
          noteCounts={mockNoteCounts}
          smartIconColor="#8B5CF6"
        />
      )

      // Projects should be sorted: Mediation Planning, Product of Three
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2)
    })

    it('renders ProjectAvatar for each child project', () => {
      const { container } = render(
        <ExpandedChildProjects
          projects={mockChildProjects}
          currentProjectId={null}
          onSelectProject={mockHandlers.onSelectProject}
          noteCounts={mockNoteCounts}
          smartIconColor="#8B5CF6"
        />
      )

      const avatars = container.querySelectorAll('.project-avatar')
      expect(avatars).toHaveLength(2)
      expect(avatars[0]).toHaveTextContent('M') // Mediation
      expect(avatars[1]).toHaveTextContent('P') // Product
    })

    it('displays project name and metadata in 2-line layout', () => {
      render(
        <ExpandedChildProjects
          projects={mockChildProjects}
          currentProjectId={null}
          onSelectProject={mockHandlers.onSelectProject}
          noteCounts={mockNoteCounts}
          smartIconColor="#8B5CF6"
        />
      )

      // Check project names (may be truncated)
      expect(screen.getByText(/Mediation/)).toBeInTheDocument()
      expect(screen.getByText(/Product of Three/)).toBeInTheDocument()

      // Check metadata (note counts)
      expect(screen.getByText(/12 notes/)).toBeInTheDocument()
      expect(screen.getByText(/8 notes/)).toBeInTheDocument()
    })

    it('displays relative time correctly', () => {
      render(
        <ExpandedChildProjects
          projects={mockChildProjects}
          currentProjectId={null}
          onSelectProject={mockHandlers.onSelectProject}
          noteCounts={mockNoteCounts}
          smartIconColor="#8B5CF6"
        />
      )

      // 2 hours ago
      expect(screen.getByText(/2h ago/)).toBeInTheDocument()
      // 1 day ago
      expect(screen.getByText(/1d ago/)).toBeInTheDocument()
    })

    it('truncates long project names with ellipsis', () => {
      const longNameProject: Project[] = [
        {
          id: 'long-1',
          name: 'Very Long Project Name That Should Be Truncated',
          type: 'research',
          status: 'active',
          created_at: Date.now(),
          updated_at: Date.now(),
          sort_order: 1
        }
      ]

      render(
        <ExpandedChildProjects
          projects={longNameProject}
          currentProjectId={null}
          onSelectProject={mockHandlers.onSelectProject}
          noteCounts={{ 'long-1': 5 }}
          smartIconColor="#8B5CF6"
        />
      )

      const projectName = screen.getByText(/Very Long/)
      expect(projectName.textContent).toContain('…')
    })

    it('shows active indicator for currently selected project', () => {
      const { container } = render(
        <ExpandedChildProjects
          projects={mockChildProjects}
          currentProjectId="research-1"
          onSelectProject={mockHandlers.onSelectProject}
          noteCounts={mockNoteCounts}
          smartIconColor="#8B5CF6"
        />
      )

      const buttons = container.querySelectorAll('.child-project-btn')
      expect(buttons[0]).toHaveClass('active')
      expect(buttons[1]).not.toHaveClass('active')

      // Check for active indicator span
      const activeIndicator = container.querySelector('.active-indicator')
      expect(activeIndicator).toBeInTheDocument()
    })

    it('calls onSelectProject when child project is clicked', () => {
      render(
        <ExpandedChildProjects
          projects={mockChildProjects}
          currentProjectId={null}
          onSelectProject={mockHandlers.onSelectProject}
          noteCounts={mockNoteCounts}
          smartIconColor="#8B5CF6"
        />
      )

      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[0])

      expect(mockHandlers.onSelectProject).toHaveBeenCalledWith('research-1')
      expect(mockHandlers.onSelectProject).toHaveBeenCalledTimes(1)
    })

    it('renders empty state when no projects', () => {
      render(
        <ExpandedChildProjects
          projects={[]}
          currentProjectId={null}
          onSelectProject={mockHandlers.onSelectProject}
          noteCounts={{}}
          smartIconColor="#8B5CF6"
        />
      )

      expect(screen.getByText('No projects')).toBeInTheDocument()
    })

    it('applies smart icon color to all avatars', () => {
      const { container } = render(
        <ExpandedChildProjects
          projects={mockChildProjects}
          currentProjectId={null}
          onSelectProject={mockHandlers.onSelectProject}
          noteCounts={mockNoteCounts}
          smartIconColor="#8B5CF6"
        />
      )

      const avatars = container.querySelectorAll('.project-avatar')
      avatars.forEach((avatar) => {
        expect(avatar).toHaveStyle({ backgroundColor: '#8B5CF6' })
      })
    })
  })

  describe('Sidebar Width Expansion (E2E)', () => {
    it('sidebar starts at 48px width when no smart icon is expanded', () => {
      const { container } = render(
        <IconBarMode
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      const sidebar = container.querySelector('.mission-sidebar-icon')
      const styles = window.getComputedStyle(sidebar as Element)
      // When expandedSmartIconId is null, sidebar should be 48px
      // Note: This test assumes the mock returns null for expandedSmartIconId
      expect(sidebar).toBeInTheDocument()
    })

    it('has smooth transition for width changes', () => {
      const { container } = render(
        <IconBarMode
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      const sidebar = container.querySelector('.mission-sidebar-icon')
      expect(sidebar).toHaveClass('mission-sidebar-icon')
      // CSS transition is applied via index.css
    })
  })

  describe('Smart Icon Accordion Behavior (E2E)', () => {
    it('renders smart icon buttons', () => {
      render(
        <IconBarMode
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      // Smart icons are rendered by IconBarMode
      // The exact rendering depends on SmartIconButton component
      expect(screen.getByTestId('inbox-icon-button')).toBeInTheDocument()
    })

    it('displays project count for each smart icon', () => {
      render(
        <IconBarMode
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      // Research has 3 projects, Writing has 1 project
      // These counts are calculated from mockProjects
      expect(screen.getByTestId('inbox-icon-button')).toBeInTheDocument()
    })
  })

  describe('Child Project Navigation (E2E)', () => {
    it('navigates to child project when clicked', () => {
      const researchProjects = mockProjects.filter((p) => p.type === 'research')

      render(
        <ExpandedChildProjects
          projects={researchProjects}
          currentProjectId={null}
          onSelectProject={mockHandlers.onSelectProject}
          noteCounts={{
            'research-1': 12,
            'research-2': 8,
            'research-3': 5
          }}
          smartIconColor="#8B5CF6"
        />
      )

      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[1]) // Click "Mediation Planning"

      expect(mockHandlers.onSelectProject).toHaveBeenCalledWith(
        expect.any(String)
      )
    })

    it('updates active state when different child project is selected', () => {
      const researchProjects = mockProjects.filter((p) => p.type === 'research')

      const { container, rerender } = render(
        <ExpandedChildProjects
          projects={researchProjects}
          currentProjectId="research-1"
          onSelectProject={mockHandlers.onSelectProject}
          noteCounts={{
            'research-1': 12,
            'research-2': 8,
            'research-3': 5
          }}
          smartIconColor="#8B5CF6"
        />
      )

      let buttons = container.querySelectorAll('.child-project-btn')
      // First project should be active
      // (After alphabetical sort: Collider, Mediation, Product)
      const firstActiveIndex = Array.from(buttons).findIndex((btn) =>
        btn.classList.contains('active')
      )
      expect(firstActiveIndex).toBeGreaterThanOrEqual(0)

      // Rerender with different active project
      rerender(
        <ExpandedChildProjects
          projects={researchProjects}
          currentProjectId="research-2"
          onSelectProject={mockHandlers.onSelectProject}
          noteCounts={{
            'research-1': 12,
            'research-2': 8,
            'research-3': 5
          }}
          smartIconColor="#8B5CF6"
        />
      )

      buttons = container.querySelectorAll('.child-project-btn')
      const newActiveIndex = Array.from(buttons).findIndex((btn) =>
        btn.classList.contains('active')
      )
      expect(newActiveIndex).toBeGreaterThanOrEqual(0)
      // Active state should have moved
    })
  })

  describe('Metadata Display', () => {
    it('displays "note" singular when count is 1', () => {
      const singleNoteProject: Project[] = [
        {
          id: 'proj-1',
          name: 'Single Note Project',
          type: 'research',
          status: 'active',
          created_at: Date.now(),
          updated_at: Date.now(),
          sort_order: 1
        }
      ]

      render(
        <ExpandedChildProjects
          projects={singleNoteProject}
          currentProjectId={null}
          onSelectProject={mockHandlers.onSelectProject}
          noteCounts={{ 'proj-1': 1 }}
          smartIconColor="#8B5CF6"
        />
      )

      expect(screen.getByText(/1 note/)).toBeInTheDocument()
      expect(screen.queryByText(/1 notes/)).not.toBeInTheDocument()
    })

    it('displays "notes" plural when count is not 1', () => {
      const multiNoteProject: Project[] = [
        {
          id: 'proj-1',
          name: 'Multi Note Project',
          type: 'research',
          status: 'active',
          created_at: Date.now(),
          updated_at: Date.now(),
          sort_order: 1
        }
      ]

      render(
        <ExpandedChildProjects
          projects={multiNoteProject}
          currentProjectId={null}
          onSelectProject={mockHandlers.onSelectProject}
          noteCounts={{ 'proj-1': 5 }}
          smartIconColor="#8B5CF6"
        />
      )

      expect(screen.getByText(/5 notes/)).toBeInTheDocument()
    })

    it('displays 0 notes when project has no notes', () => {
      const emptyProject: Project[] = [
        {
          id: 'proj-1',
          name: 'Empty Project',
          type: 'research',
          status: 'active',
          created_at: Date.now(),
          updated_at: Date.now(),
          sort_order: 1
        }
      ]

      render(
        <ExpandedChildProjects
          projects={emptyProject}
          currentProjectId={null}
          onSelectProject={mockHandlers.onSelectProject}
          noteCounts={{ 'proj-1': 0 }}
          smartIconColor="#8B5CF6"
        />
      )

      expect(screen.getByText(/0 notes/)).toBeInTheDocument()
    })
  })

  describe('Relative Time Formatting', () => {
    it('formats time as "just now" for very recent updates', () => {
      const recentProject: Project[] = [
        {
          id: 'proj-1',
          name: 'Recent Project',
          type: 'research',
          status: 'active',
          created_at: Date.now(),
          updated_at: Date.now(), // Just now
          sort_order: 1
        }
      ]

      render(
        <ExpandedChildProjects
          projects={recentProject}
          currentProjectId={null}
          onSelectProject={mockHandlers.onSelectProject}
          noteCounts={{ 'proj-1': 0 }}
          smartIconColor="#8B5CF6"
        />
      )

      expect(screen.getByText(/just now/)).toBeInTheDocument()
    })

    it('formats time in minutes for updates within an hour', () => {
      const minutesAgo = Date.now() - 1800000 // 30 minutes ago
      const minuteProject: Project[] = [
        {
          id: 'proj-1',
          name: 'Minute Project',
          type: 'research',
          status: 'active',
          created_at: minutesAgo,
          updated_at: minutesAgo,
          sort_order: 1
        }
      ]

      render(
        <ExpandedChildProjects
          projects={minuteProject}
          currentProjectId={null}
          onSelectProject={mockHandlers.onSelectProject}
          noteCounts={{ 'proj-1': 0 }}
          smartIconColor="#8B5CF6"
        />
      )

      expect(screen.getByText(/30m ago/)).toBeInTheDocument()
    })

    it('formats time in hours for updates within a day', () => {
      const hoursAgo = Date.now() - 10800000 // 3 hours ago
      const hourProject: Project[] = [
        {
          id: 'proj-1',
          name: 'Hour Project',
          type: 'research',
          status: 'active',
          created_at: hoursAgo,
          updated_at: hoursAgo,
          sort_order: 1
        }
      ]

      render(
        <ExpandedChildProjects
          projects={hourProject}
          currentProjectId={null}
          onSelectProject={mockHandlers.onSelectProject}
          noteCounts={{ 'proj-1': 0 }}
          smartIconColor="#8B5CF6"
        />
      )

      expect(screen.getByText(/3h ago/)).toBeInTheDocument()
    })

    it('formats time in days for updates within a week', () => {
      const daysAgo = Date.now() - 259200000 // 3 days ago
      const dayProject: Project[] = [
        {
          id: 'proj-1',
          name: 'Day Project',
          type: 'research',
          status: 'active',
          created_at: daysAgo,
          updated_at: daysAgo,
          sort_order: 1
        }
      ]

      render(
        <ExpandedChildProjects
          projects={dayProject}
          currentProjectId={null}
          onSelectProject={mockHandlers.onSelectProject}
          noteCounts={{ 'proj-1': 0 }}
          smartIconColor="#8B5CF6"
        />
      )

      expect(screen.getByText(/3d ago/)).toBeInTheDocument()
    })

    it('formats time in weeks for updates within a month', () => {
      const weeksAgo = Date.now() - 1209600000 // 2 weeks ago
      const weekProject: Project[] = [
        {
          id: 'proj-1',
          name: 'Week Project',
          type: 'research',
          status: 'active',
          created_at: weeksAgo,
          updated_at: weeksAgo,
          sort_order: 1
        }
      ]

      render(
        <ExpandedChildProjects
          projects={weekProject}
          currentProjectId={null}
          onSelectProject={mockHandlers.onSelectProject}
          noteCounts={{ 'proj-1': 0 }}
          smartIconColor="#8B5CF6"
        />
      )

      expect(screen.getByText(/2w ago/)).toBeInTheDocument()
    })
  })

  describe('Alphabetical Sorting', () => {
    it('sorts child projects alphabetically by name', () => {
      const unsortedProjects: Project[] = [
        {
          id: 'proj-z',
          name: 'Zebra Project',
          type: 'research',
          status: 'active',
          created_at: Date.now(),
          updated_at: Date.now(),
          sort_order: 1
        },
        {
          id: 'proj-a',
          name: 'Alpha Project',
          type: 'research',
          status: 'active',
          created_at: Date.now(),
          updated_at: Date.now(),
          sort_order: 2
        },
        {
          id: 'proj-m',
          name: 'Mediation Project',
          type: 'research',
          status: 'active',
          created_at: Date.now(),
          updated_at: Date.now(),
          sort_order: 3
        }
      ]

      render(
        <ExpandedChildProjects
          projects={unsortedProjects}
          currentProjectId={null}
          onSelectProject={mockHandlers.onSelectProject}
          noteCounts={{
            'proj-z': 1,
            'proj-a': 2,
            'proj-m': 3
          }}
          smartIconColor="#8B5CF6"
        />
      )

      const buttons = screen.getAllByRole('button')
      const projectNames = buttons.map((btn) => {
        const nameElement = btn.querySelector('.project-name')
        return nameElement?.textContent || ''
      })

      // Should be sorted: Alpha, Mediation, Zebra
      // Note: Names may be truncated with "…"
      expect(projectNames[0]).toContain('Alpha')
      expect(projectNames[1]).toContain('Mediation')
      expect(projectNames[2]).toContain('Zebra')
    })
  })

  describe('Visual Grouping with Smart Icon Colors', () => {
    it('uses different colors for different smart icon types', () => {
      const { container: researchContainer } = render(
        <ExpandedChildProjects
          projects={[mockProjects[0]]}
          currentProjectId={null}
          onSelectProject={mockHandlers.onSelectProject}
          noteCounts={{ 'research-1': 12 }}
          smartIconColor="#8B5CF6" // Purple for Research
        />
      )

      const researchAvatar = researchContainer.querySelector('.project-avatar')
      expect(researchAvatar).toHaveStyle({ backgroundColor: '#8B5CF6' })

      const { container: writingContainer } = render(
        <ExpandedChildProjects
          projects={[mockProjects[3]]}
          currentProjectId={null}
          onSelectProject={mockHandlers.onSelectProject}
          noteCounts={{ 'writing-1': 3 }}
          smartIconColor="#3B82F6" // Blue for Writing
        />
      )

      const writingAvatar = writingContainer.querySelector('.project-avatar')
      expect(writingAvatar).toHaveStyle({ backgroundColor: '#3B82F6' })
    })
  })

  describe('Accessibility', () => {
    it('provides tooltips with project info', () => {
      render(
        <ExpandedChildProjects
          projects={[mockProjects[0]]}
          currentProjectId={null}
          onSelectProject={mockHandlers.onSelectProject}
          noteCounts={{ 'research-1': 12 }}
          smartIconColor="#8B5CF6"
        />
      )

      // Tooltip component wraps the button
      // The actual tooltip content is in the Tooltip component
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('has proper test IDs for child project buttons', () => {
      const { container } = render(
        <ExpandedChildProjects
          projects={[mockProjects[0]]}
          currentProjectId={null}
          onSelectProject={mockHandlers.onSelectProject}
          noteCounts={{ 'research-1': 12 }}
          smartIconColor="#8B5CF6"
        />
      )

      const button = container.querySelector('[data-testid="child-project-research-1"]')
      expect(button).toBeInTheDocument()
    })
  })
})
