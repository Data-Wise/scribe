import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StatsPanel } from '../components/StatsPanel'
import { Project, Note } from '../types'

// Mock data
const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Research Project',
    type: 'research',
    status: 'active',
    color: '#3b82f6',
    created_at: Date.now() - 86400000,
    updated_at: Date.now(),
  },
  {
    id: 'proj-2',
    name: 'Teaching Notes',
    type: 'teaching',
    status: 'active',
    color: '#10b981',
    created_at: Date.now() - 172800000,
    updated_at: Date.now() - 3600000,
  },
  {
    id: 'proj-3',
    name: 'Archived Project',
    type: 'generic',
    status: 'archive',
    color: '#6b7280',
    created_at: Date.now() - 604800000,
    updated_at: Date.now() - 604800000,
  },
]

const mockNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Welcome Note',
    content: 'This is a welcome note with some content for testing purposes.',
    folder: 'inbox',
    project_id: 'proj-1',
    created_at: Date.now() - 86400000,
    updated_at: Date.now(),
  },
  {
    id: 'note-2',
    title: 'Research Methods',
    content: 'Research methods and methodology discussion.',
    folder: 'inbox',
    project_id: 'proj-1',
    created_at: Date.now() - 172800000,
    updated_at: Date.now() - 3600000,
  },
  {
    id: 'note-3',
    title: 'Lecture Notes',
    content: 'Statistics lecture notes for week one.',
    folder: 'inbox',
    project_id: 'proj-2',
    created_at: Date.now() - 259200000,
    updated_at: Date.now() - 7200000,
  },
]

describe('StatsPanel Component', () => {
  const defaultProps = {
    projects: mockProjects,
    notes: mockNotes,
    currentProjectId: 'proj-1',
    wordCount: 150,
    wordGoal: 500,
    sessionStartTime: Date.now() - 1800000, // 30 minutes ago
    onSelectProject: vi.fn(),
    onSelectNote: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Session Stats', () => {
    it('renders session section', () => {
      render(<StatsPanel {...defaultProps} />)
      expect(screen.getByText('Session')).toBeInTheDocument()
    })

    it('displays session duration', () => {
      render(<StatsPanel {...defaultProps} />)
      expect(screen.getByText('Duration')).toBeInTheDocument()
      // 30 minutes ago should show "30m"
      expect(screen.getByText('30m')).toBeInTheDocument()
    })

    it('displays word count', () => {
      render(<StatsPanel {...defaultProps} />)
      expect(screen.getByText('Words')).toBeInTheDocument()
      expect(screen.getByText('150')).toBeInTheDocument()
    })

    it('shows -- when no session started', () => {
      render(<StatsPanel {...defaultProps} sessionStartTime={undefined} />)
      expect(screen.getByText('--')).toBeInTheDocument()
    })

    it('shows hours and minutes for long sessions', () => {
      const twoHoursAgo = Date.now() - 7500000 // 2h 5m
      render(<StatsPanel {...defaultProps} sessionStartTime={twoHoursAgo} />)
      expect(screen.getByText('2h 5m')).toBeInTheDocument()
    })
  })

  describe('Daily Goal Progress', () => {
    it('renders daily goal section', () => {
      render(<StatsPanel {...defaultProps} />)
      expect(screen.getByText('Daily Goal')).toBeInTheDocument()
    })

    it('calculates goal percentage', () => {
      render(<StatsPanel {...defaultProps} wordCount={250} wordGoal={500} />)
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('shows words remaining', () => {
      render(<StatsPanel {...defaultProps} wordCount={150} wordGoal={500} />)
      expect(screen.getByText('350 words to go')).toBeInTheDocument()
    })

    it('shows goal reached message at 100%', () => {
      render(<StatsPanel {...defaultProps} wordCount={600} wordGoal={500} />)
      expect(screen.getByText('Goal reached!')).toBeInTheDocument()
    })

    it('caps progress at 100%', () => {
      render(<StatsPanel {...defaultProps} wordCount={1000} wordGoal={500} />)
      expect(screen.getByText('100%')).toBeInTheDocument()
    })
  })

  describe('Current Project Stats', () => {
    it('renders current project section', () => {
      render(<StatsPanel {...defaultProps} />)
      expect(screen.getByText('Current Project')).toBeInTheDocument()
    })

    it('displays project name in current project section', () => {
      render(<StatsPanel {...defaultProps} />)
      const currentProjectSection = screen.getByText('Current Project').closest('section')
      expect(currentProjectSection).toHaveTextContent('Research Project')
    })

    it('shows project note count', () => {
      render(<StatsPanel {...defaultProps} />)
      // Research Project has 2 notes
      expect(screen.getByText('2 notes')).toBeInTheDocument()
    })

    it('hides section when no project selected', () => {
      render(<StatsPanel {...defaultProps} currentProjectId={null} />)
      expect(screen.queryByText('Current Project')).not.toBeInTheDocument()
    })
  })

  describe('All Notes Stats', () => {
    it('renders all notes section', () => {
      render(<StatsPanel {...defaultProps} />)
      expect(screen.getByText('All Notes')).toBeInTheDocument()
    })

    it('displays total note count', () => {
      render(<StatsPanel {...defaultProps} />)
      expect(screen.getByText('Notes')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument() // 3 mock notes
    })

    it('displays active project count', () => {
      render(<StatsPanel {...defaultProps} />)
      // Check the All Notes section has a Projects counter
      const allNotesSection = screen.getByText('All Notes').closest('section')
      expect(allNotesSection).toHaveTextContent('Projects')
      // 2 active projects (1 is archived)
      expect(allNotesSection).toHaveTextContent('2')
    })

    it('excludes deleted notes from count', () => {
      const notesWithDeleted = [
        ...mockNotes,
        { ...mockNotes[0], id: 'deleted-1', deleted_at: Date.now() },
      ]
      render(<StatsPanel {...defaultProps} notes={notesWithDeleted} />)
      // Should still show 3, not 4
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })

  describe('Recent Activity', () => {
    it('renders recent activity section', () => {
      render(<StatsPanel {...defaultProps} />)
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    })

    it('shows recent notes sorted by update date', () => {
      render(<StatsPanel {...defaultProps} />)
      // Most recent note should be first
      expect(screen.getByText('Welcome Note')).toBeInTheDocument()
      expect(screen.getByText('Research Methods')).toBeInTheDocument()
      expect(screen.getByText('Lecture Notes')).toBeInTheDocument()
    })

    it('calls onSelectNote when clicking a note', () => {
      render(<StatsPanel {...defaultProps} />)
      const noteButton = screen.getByText('Welcome Note').closest('button')
      fireEvent.click(noteButton!)
      expect(defaultProps.onSelectNote).toHaveBeenCalledWith('note-1')
    })

    it('limits to 5 recent notes', () => {
      const manyNotes = Array.from({ length: 10 }, (_, i) => ({
        id: `note-${i}`,
        title: `Note ${i}`,
        content: 'Content',
        folder: 'inbox',
        created_at: Date.now() - i * 86400000,
        updated_at: Date.now() - i * 3600000,
      }))
      render(<StatsPanel {...defaultProps} notes={manyNotes} />)
      // Should only show 5 notes
      const recentSection = screen.getByText('Recent Activity').closest('section')
      const buttons = recentSection?.querySelectorAll('button')
      expect(buttons?.length).toBe(5)
    })
  })

  describe('Projects Quick Access', () => {
    it('renders projects section', () => {
      render(<StatsPanel {...defaultProps} />)
      // Should be under "Projects" heading
      const projectsHeading = screen.getAllByText('Projects').find(el =>
        el.classList.contains('text-nexus-text-muted')
      )
      expect(projectsHeading).toBeInTheDocument()
    })

    it('shows active projects only', () => {
      render(<StatsPanel {...defaultProps} />)
      // Find the Projects quick access section (has header with muted text class)
      const projectsHeading = screen.getAllByText('Projects').find(el =>
        el.classList.contains('text-nexus-text-muted')
      )
      const projectsSection = projectsHeading?.closest('section')
      expect(projectsSection).toHaveTextContent('Research Project')
      expect(projectsSection).toHaveTextContent('Teaching Notes')
      // Archived project should not be in quick access
      expect(projectsSection?.textContent).not.toContain('Archived Project')
    })

    it('highlights current project', () => {
      render(<StatsPanel {...defaultProps} />)
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('calls onSelectProject when clicking a project', () => {
      render(<StatsPanel {...defaultProps} />)
      // Find the Projects quick access section
      const projectsHeading = screen.getAllByText('Projects').find(el =>
        el.classList.contains('text-nexus-text-muted')
      )
      const projectsSection = projectsHeading?.closest('section')
      const projectButton = projectsSection?.querySelector('button:has-text("Teaching Notes")') ||
        Array.from(projectsSection?.querySelectorAll('button') || []).find(btn =>
          btn.textContent?.includes('Teaching Notes')
        )
      fireEvent.click(projectButton!)
      expect(defaultProps.onSelectProject).toHaveBeenCalledWith('proj-2')
    })

    it('limits to 4 projects', () => {
      const manyProjects = Array.from({ length: 10 }, (_, i) => ({
        id: `proj-${i}`,
        name: `Project ${i}`,
        type: 'generic' as const,
        status: 'active' as const,
        color: '#3b82f6',
        created_at: Date.now(),
        updated_at: Date.now(),
      }))
      render(<StatsPanel {...defaultProps} projects={manyProjects} />)
      // Should only show 4 projects in quick access
      const projectsSection = screen.getAllByText('Projects').find(el =>
        el.classList.contains('text-nexus-text-muted')
      )?.closest('section')
      const buttons = projectsSection?.querySelectorAll('button')
      expect(buttons?.length).toBe(4)
    })
  })

  describe('Edge Cases', () => {
    it('handles empty notes array', () => {
      render(<StatsPanel {...defaultProps} notes={[]} />)
      expect(screen.getByText('0')).toBeInTheDocument() // 0 notes
    })

    it('handles empty projects array', () => {
      render(<StatsPanel {...defaultProps} projects={[]} currentProjectId={null} />)
      // Should not crash
      expect(screen.getByText('Session')).toBeInTheDocument()
    })

    it('handles zero word count', () => {
      render(<StatsPanel {...defaultProps} wordCount={0} />)
      expect(screen.getByText('0')).toBeInTheDocument()
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('handles undefined wordGoal with default', () => {
      render(<StatsPanel {...defaultProps} wordGoal={undefined} />)
      // Should use default goal (500)
      expect(screen.getByText('30%')).toBeInTheDocument() // 150/500
    })
  })
})
