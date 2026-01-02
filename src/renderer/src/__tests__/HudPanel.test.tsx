import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { HudPanel } from '../components/HudPanel'
import { Project, Note } from '../types'
import { createMockProject, createMockNote } from './testUtils'

/**
 * HudPanel Test Suite
 *
 * Tests for the Mission HQ HUD panel:
 * - Rendering states (open/closed, layered/persistent modes)
 * - Stats calculation (notes, words, recent notes)
 * - Project list display and selection
 * - Recent notes display and selection
 * - Edge cases (empty data, deleted items)
 */

// Mock data
const mockProjects: Project[] = [
  createMockProject({
    id: 'proj-1',
    name: 'Research Project',
    color: '#10b981',
    updated_at: Date.now(),
  }),
  createMockProject({
    id: 'proj-2',
    name: 'Teaching Materials',
    color: '#3b82f6',
    updated_at: Date.now() - 3600000, // 1 hour ago
  }),
  createMockProject({
    id: 'proj-3',
    name: 'Older Project',
    color: '#ef4444',
    updated_at: Date.now() - 86400000, // 1 day ago
  }),
]

const mockNotes: Note[] = [
  createMockNote({
    id: 'note-1',
    title: 'Recent Note',
    content: 'This is some test content with multiple words.',
    project_id: 'proj-1',
    updated_at: Date.now(),
  }),
  createMockNote({
    id: 'note-2',
    title: 'Older Note',
    content: 'More content here for testing word count.',
    project_id: 'proj-1',
    updated_at: Date.now() - 3600000,
  }),
  createMockNote({
    id: 'note-3',
    title: 'Teaching Note',
    content: 'Teaching related content.',
    project_id: 'proj-2',
    updated_at: Date.now() - 7200000,
  }),
]

const defaultHandlers = {
  onSelectProject: vi.fn(),
  onSelectNote: vi.fn(),
  onClose: vi.fn(),
}

describe('HudPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering States', () => {
    it('renders when isOpen is true', () => {
      render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      expect(screen.getByText('Mission HQ')).toBeInTheDocument()
    })

    it('returns null when isOpen is false in layered mode', () => {
      const { container } = render(
        <HudPanel
          isOpen={false}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          mode="layered"
          {...defaultHandlers}
        />
      )

      expect(container.firstChild).toBeNull()
    })

    it('renders in persistent mode even when closed (with zero width)', () => {
      const { container } = render(
        <HudPanel
          isOpen={false}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          mode="persistent"
          {...defaultHandlers}
        />
      )

      const panel = container.querySelector('.hud-panel')
      expect(panel).toBeInTheDocument()
      expect(panel).toHaveClass('w-0')
    })

    it('has full width when open', () => {
      const { container } = render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      const panel = container.querySelector('.hud-panel')
      expect(panel).toHaveClass('w-[360px]')
    })

    it('defaults to layered mode', () => {
      const { container } = render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      const panel = container.querySelector('.hud-panel')
      expect(panel).toHaveClass('fixed')
    })

    it('uses relative positioning in persistent mode', () => {
      const { container } = render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          mode="persistent"
          {...defaultHandlers}
        />
      )

      const panel = container.querySelector('.hud-panel')
      expect(panel).toHaveClass('relative')
    })
  })

  describe('Header Section', () => {
    it('displays Mission HQ title', () => {
      render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      expect(screen.getByText('Mission HQ')).toBeInTheDocument()
    })

    it('renders Zap icon in header', () => {
      const { container } = render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      // Zap icon should be present (Lucide SVG)
      const zapIcon = container.querySelector('svg.lucide-zap')
      expect(zapIcon).toBeInTheDocument()
    })
  })

  describe('Momentum Bento Card', () => {
    it('renders Current Momentum section', () => {
      render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      expect(screen.getByText('Current Momentum')).toBeInTheDocument()
    })

    it('displays progress percentage', () => {
      render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      expect(screen.getByText('85%')).toBeInTheDocument()
      expect(screen.getByText('Complete')).toBeInTheDocument()
    })

    it('shows motivational message', () => {
      render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      expect(screen.getByText(/Almost hit your goal!/)).toBeInTheDocument()
      expect(screen.getByText(/150 words to go/)).toBeInTheDocument()
    })

    it('renders SVG progress ring', () => {
      const { container } = render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      const circles = container.querySelectorAll('circle')
      expect(circles.length).toBeGreaterThanOrEqual(2) // At least background + progress circles
    })
  })

  describe('Project Pulse Section', () => {
    it('renders Project Pulse heading', () => {
      render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      expect(screen.getByText('Project Pulse')).toBeInTheDocument()
    })

    it('displays project names', () => {
      render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      expect(screen.getByText('Research Project')).toBeInTheDocument()
      expect(screen.getByText('Teaching Materials')).toBeInTheDocument()
    })

    it('limits to 4 projects', () => {
      const manyProjects = Array.from({ length: 10 }, (_, i) =>
        createMockProject({
          id: `proj-${i}`,
          name: `Project ${i}`,
          updated_at: Date.now() - i * 1000,
        })
      )

      const { container } = render(
        <HudPanel
          isOpen={true}
          projects={manyProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      // Count project buttons in the grid
      const projectGrid = container.querySelector('.grid')
      const buttons = projectGrid?.querySelectorAll('button')
      expect(buttons?.length).toBe(4)
    })

    it('sorts projects with current project first', () => {
      const { container } = render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId="proj-2"
          {...defaultHandlers}
        />
      )

      const projectGrid = container.querySelector('.grid')
      const firstButton = projectGrid?.querySelector('button')
      expect(firstButton).toHaveTextContent('Teaching Materials')
    })

    it('calls onSelectProject when project clicked', () => {
      render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      const projectButton = screen.getByText('Research Project').closest('button')
      fireEvent.click(projectButton!)
      expect(defaultHandlers.onSelectProject).toHaveBeenCalledWith('proj-1')
    })

    it('highlights current project with accent styling', () => {
      render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId="proj-1"
          {...defaultHandlers}
        />
      )

      const projectButton = screen.getByText('Research Project').closest('button')
      expect(projectButton).toHaveClass('bg-nexus-accent/10')
    })

    it('shows Active label for all projects', () => {
      render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      const activeLabels = screen.getAllByText('Active')
      expect(activeLabels.length).toBeGreaterThan(0)
    })
  })

  describe('Recent Sparks Section', () => {
    it('renders Recent Sparks heading', () => {
      render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      expect(screen.getByText('Recent Sparks')).toBeInTheDocument()
    })

    it('displays recent note titles', () => {
      render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      expect(screen.getByText('Recent Note')).toBeInTheDocument()
      expect(screen.getByText('Older Note')).toBeInTheDocument()
      expect(screen.getByText('Teaching Note')).toBeInTheDocument()
    })

    it('limits to 3 recent notes', () => {
      const manyNotes = Array.from({ length: 10 }, (_, i) =>
        createMockNote({
          id: `note-${i}`,
          title: `Note ${i}`,
          content: 'Content',
          updated_at: Date.now() - i * 1000,
        })
      )

      render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={manyNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      // Should only show 3 notes - the Recent Sparks section is wrapped in a div with space-y-4 containing h3 and buttons
      const recentHeading = screen.getByText('Recent Sparks')
      const recentSectionWrapper = recentHeading.closest('.space-y-4')
      // Find the sibling div that contains the actual note buttons (the div with space-y-2)
      const noteButtonsContainer = recentSectionWrapper?.querySelector('.space-y-2')
      const noteButtons = noteButtonsContainer?.querySelectorAll('button')
      expect(noteButtons?.length).toBe(3)
    })

    it('sorts notes by updated_at descending', () => {
      render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      // Find the Recent Sparks section and get the first note button
      const recentHeading = screen.getByText('Recent Sparks')
      const recentSectionWrapper = recentHeading.closest('.space-y-4')
      const noteButtonsContainer = recentSectionWrapper?.querySelector('.space-y-2')
      const firstButton = noteButtonsContainer?.querySelector('button')
      expect(firstButton).toHaveTextContent('Recent Note')
    })

    it('calls onSelectNote when note clicked', () => {
      render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      const noteButton = screen.getByText('Recent Note').closest('button')
      fireEvent.click(noteButton!)
      expect(defaultHandlers.onSelectNote).toHaveBeenCalledWith('note-1')
    })

    it('shows Untitled for notes without title', () => {
      const notesWithUntitled = [
        createMockNote({
          id: 'note-untitled',
          title: '',
          content: 'Some content',
          updated_at: Date.now(),
        }),
      ]

      render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={notesWithUntitled}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      expect(screen.getByText('Untitled')).toBeInTheDocument()
    })

    it('displays note date', () => {
      render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      // Should show formatted date (multiple notes may have same date)
      const today = new Date().toLocaleDateString()
      expect(screen.getAllByText(today).length).toBeGreaterThan(0)
    })
  })

  describe('Session Stats Widget', () => {
    it('renders session duration', () => {
      render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      expect(screen.getByText(/Session: 45m/)).toBeInTheDocument()
    })

    it('renders pulsing status indicator', () => {
      const { container } = render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      const pulsingDot = container.querySelector('.animate-pulse')
      expect(pulsingDot).toBeInTheDocument()
      expect(pulsingDot).toHaveClass('bg-emerald-500')
    })
  })

  describe('Stats Calculation', () => {
    it('excludes deleted notes from count', () => {
      const notesWithDeleted = [
        ...mockNotes,
        createMockNote({
          id: 'deleted-note',
          title: 'Deleted',
          content: 'Should not count',
          deleted_at: Date.now(),
          updated_at: Date.now(),
        }),
      ]

      render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={notesWithDeleted}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      // Deleted note should not appear in Recent Sparks
      expect(screen.queryByText('Deleted')).not.toBeInTheDocument()
    })

    it('excludes deleted notes from recent sparks', () => {
      const deletedNote = createMockNote({
        id: 'deleted-recent',
        title: 'Deleted Recent',
        content: 'Content',
        deleted_at: Date.now(),
        updated_at: Date.now() + 1000, // Most recent but deleted
      })

      render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={[...mockNotes, deletedNote]}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      expect(screen.queryByText('Deleted Recent')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty projects array', () => {
      render(
        <HudPanel
          isOpen={true}
          projects={[]}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      expect(screen.getByText('Mission HQ')).toBeInTheDocument()
      expect(screen.getByText('Project Pulse')).toBeInTheDocument()
      // Grid should be empty but present
      const grid = screen.getByText('Project Pulse').closest('div')?.parentElement?.querySelector('.grid')
      expect(grid).toBeInTheDocument()
    })

    it('handles empty notes array', () => {
      render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={[]}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      expect(screen.getByText('Mission HQ')).toBeInTheDocument()
      expect(screen.getByText('Recent Sparks')).toBeInTheDocument()
    })

    it('handles notes with null content', () => {
      const nullContentNote = {
        ...createMockNote(),
        id: 'null-content',
        title: 'Null Content',
        content: null as unknown as string,
        updated_at: Date.now(),
      }

      // Should not throw
      expect(() =>
        render(
          <HudPanel
            isOpen={true}
            projects={mockProjects}
            notes={[nullContentNote]}
            currentProjectId={null}
            {...defaultHandlers}
          />
        )
      ).not.toThrow()
    })

    it('handles notes with empty content', () => {
      const emptyContentNote = createMockNote({
        id: 'empty-content',
        title: 'Empty Content',
        content: '',
        updated_at: Date.now(),
      })

      render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={[emptyContentNote]}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      expect(screen.getByText('Empty Content')).toBeInTheDocument()
    })

    it('handles project with null color', () => {
      const projectNoColor = createMockProject({
        id: 'no-color',
        name: 'No Color Project',
        color: undefined,
      })

      render(
        <HudPanel
          isOpen={true}
          projects={[projectNoColor]}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      expect(screen.getByText('No Color Project')).toBeInTheDocument()
    })

    it('handles all notes being deleted', () => {
      const allDeleted = mockNotes.map(n => ({
        ...n,
        deleted_at: Date.now(),
      }))

      render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={allDeleted}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      // Should render without crashing
      expect(screen.getByText('Recent Sparks')).toBeInTheDocument()
    })

    it('handles currentProjectId that does not exist', () => {
      render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId="non-existent-id"
          {...defaultHandlers}
        />
      )

      // Should render normally without errors
      expect(screen.getByText('Mission HQ')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('uses semantic button elements for clickable items', () => {
      const { container } = render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      // All clickable items should be buttons
      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('has proper heading structure', () => {
      render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      // Main heading
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Mission HQ')
      // Section headings
      const h3s = screen.getAllByRole('heading', { level: 3 })
      expect(h3s.length).toBeGreaterThan(0)
    })
  })

  describe('Visual Elements', () => {
    it('renders folder icons for projects', () => {
      const { container } = render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      const folderIcons = container.querySelectorAll('svg.lucide-folder')
      expect(folderIcons.length).toBeGreaterThan(0)
    })

    it('renders chevron icons for notes', () => {
      const { container } = render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      const chevronIcons = container.querySelectorAll('svg.lucide-chevron-right')
      expect(chevronIcons.length).toBeGreaterThan(0)
    })

    it('renders clock icon in session stats', () => {
      const { container } = render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      const clockIcon = container.querySelector('svg.lucide-clock')
      expect(clockIcon).toBeInTheDocument()
    })

    it('renders trending up icon in momentum card', () => {
      const { container } = render(
        <HudPanel
          isOpen={true}
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...defaultHandlers}
        />
      )

      const trendingIcon = container.querySelector('svg.lucide-trending-up')
      expect(trendingIcon).toBeInTheDocument()
    })
  })
})
