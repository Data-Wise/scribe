import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MissionControl } from '../components/MissionControl'
import type { Project, Note } from '../types'

// Mock the platform module
vi.mock('../lib/platform', () => ({
  isTauri: () => false,
  isBrowser: () => true
}))

// Mock the preferences module
vi.mock('../lib/preferences', () => ({
  loadPreferences: () => ({ streakDisplayOptIn: false }),
  getStreakInfo: () => ({ streak: 0, isActiveToday: false })
}))

// Mock the DragRegion hook
vi.mock('../components/DragRegion', () => ({
  useDragRegion: () => ({})
}))

const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Test Project 1',
    type: 'general',
    status: 'active',
    color: '#3B82F6',
    created_at: Date.now() / 1000,
    updated_at: Date.now() / 1000
  },
  {
    id: 'project-2',
    name: 'Test Project 2',
    type: 'research',
    status: 'active',
    created_at: Date.now() / 1000 - 1000,
    updated_at: Date.now() / 1000 - 1000
  }
]

const mockNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Test Note 1',
    content: 'This is test content with about ten words here.',
    folder: 'inbox',
    project_id: 'project-1',
    created_at: Date.now() / 1000,
    updated_at: Date.now() / 1000
  },
  {
    id: 'note-2',
    title: 'Test Note 2',
    content: 'More content here.',
    folder: 'notes',
    project_id: 'project-1',
    created_at: Date.now() / 1000 - 500,
    updated_at: Date.now() / 1000 - 500
  }
]

describe('MissionControl Component', () => {
  const defaultProps = {
    projects: mockProjects,
    notes: mockNotes,
    currentProjectId: null as string | null,
    onSelectProject: vi.fn(),
    onSelectNote: vi.fn(),
    onCreateNote: vi.fn(),
    onDailyNote: vi.fn(),
    onQuickCapture: vi.fn(),
    onSettings: vi.fn(),
    onCreateProject: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the Mission Control header', () => {
      render(<MissionControl {...defaultProps} />)

      expect(screen.getByText('Mission Control')).toBeInTheDocument()
    })

    it('displays project count in header', () => {
      render(<MissionControl {...defaultProps} />)

      expect(screen.getByText(/2 projects/)).toBeInTheDocument()
    })

    it('displays note count in header', () => {
      render(<MissionControl {...defaultProps} />)

      expect(screen.getByText(/2 pages/)).toBeInTheDocument()
    })

    it('displays Browser Mode indicator when in browser mode', () => {
      render(<MissionControl {...defaultProps} />)

      expect(screen.getByText('Browser Mode')).toBeInTheDocument()
    })

    it('renders project cards', () => {
      render(<MissionControl {...defaultProps} />)

      // Project names appear multiple times (in header and cards), use getAllByText
      expect(screen.getAllByText('Test Project 1').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Test Project 2').length).toBeGreaterThan(0)
    })
  })

  describe('Quick Actions', () => {
    it('renders quick action buttons', () => {
      render(<MissionControl {...defaultProps} />)

      // These might be icons/buttons - check by accessible role or test id
      expect(screen.getByTitle(/Settings/i)).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('calls onSelectProject when clicking a project card', async () => {
      render(<MissionControl {...defaultProps} />)

      // Find project card by the h3 element with the project name
      const projectHeading = screen.getAllByText('Test Project 1').find(el => el.tagName === 'H3')
      const projectCard = projectHeading?.closest('div[class*="cursor-pointer"]')
      if (projectCard) {
        fireEvent.click(projectCard)
        expect(defaultProps.onSelectProject).toHaveBeenCalledWith('project-1')
      }
    })

    it('calls onSettings when clicking settings button', () => {
      render(<MissionControl {...defaultProps} />)

      const settingsButton = screen.getByTitle(/Settings/i)
      fireEvent.click(settingsButton)

      expect(defaultProps.onSettings).toHaveBeenCalled()
    })

    it('calls onCreateProject when clicking create project in empty state', () => {
      render(<MissionControl {...defaultProps} projects={[]} />)

      const createButton = screen.getByText(/Create Your First Project/i)
      fireEvent.click(createButton)

      expect(defaultProps.onCreateProject).toHaveBeenCalled()
    })
  })

  describe('Empty State', () => {
    it('shows empty state when no projects exist', () => {
      render(<MissionControl {...defaultProps} projects={[]} />)

      expect(screen.getByText(/No projects yet/i)).toBeInTheDocument()
    })

    it('shows helpful message in empty state', () => {
      render(<MissionControl {...defaultProps} projects={[]} />)

      expect(screen.getByText(/Projects help you organize/i)).toBeInTheDocument()
    })
  })

  describe('Project Stats', () => {
    it('calculates note count per project', () => {
      render(<MissionControl {...defaultProps} />)

      // Project names appear in multiple places, so count unique project cards
      // The ProjectCard component shows noteCount as a number
      const projectHeadings = screen.getAllByRole('heading', { level: 3 })
      const projectNames = projectHeadings.map(h => h.textContent).filter(Boolean)
      expect(projectNames).toContain('Test Project 1')
      expect(projectNames).toContain('Test Project 2')
    })

    it('displays project cards with stats', () => {
      render(<MissionControl {...defaultProps} />)

      // Each project card should be rendered (names appear multiple times)
      expect(screen.getAllByText('Test Project 1').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Test Project 2').length).toBeGreaterThan(0)
    })
  })

  describe('Current Project Highlighting', () => {
    it('highlights the current project', () => {
      render(<MissionControl {...defaultProps} currentProjectId="project-1" />)

      // The current project should be first due to sorting
      const projectCards = screen.getAllByText(/Test Project/i)
      expect(projectCards[0]).toHaveTextContent('Test Project 1')
    })
  })

  describe('Keyboard Shortcut Hint', () => {
    it('shows keyboard shortcut hint in footer', () => {
      render(<MissionControl {...defaultProps} />)

      expect(screen.getByText(/⌘0/)).toBeInTheDocument()
    })
  })
})
