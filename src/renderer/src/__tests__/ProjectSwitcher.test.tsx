import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProjectSwitcher, Project } from '../components/ProjectSwitcher'

const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Research Project',
    type: 'research',
    description: 'My research',
    color: '#38bdf8',
    createdAt: Date.now() - 10000,
    updatedAt: Date.now() - 5000,
  },
  {
    id: 'proj-2',
    name: 'Teaching Course',
    type: 'teaching',
    color: '#4ade80',
    createdAt: Date.now() - 20000,
    updatedAt: Date.now() - 1000,
  },
  {
    id: 'proj-3',
    name: 'R Package',
    type: 'r-package',
    color: '#f472b6',
    createdAt: Date.now() - 30000,
    updatedAt: Date.now() - 2000,
  },
]

describe('ProjectSwitcher Component', () => {
  const defaultProps = {
    projects: mockProjects,
    currentProjectId: null,
    onSelectProject: vi.fn(),
    onCreateProject: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Trigger Button', () => {
    it('renders trigger button', () => {
      render(<ProjectSwitcher {...defaultProps} />)
      expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument()
    })

    it('shows "All Notes" when no project selected', () => {
      render(<ProjectSwitcher {...defaultProps} />)
      expect(screen.getByText('All Notes')).toBeInTheDocument()
    })

    it('shows current project name when project selected', () => {
      render(<ProjectSwitcher {...defaultProps} currentProjectId="proj-1" />)
      expect(screen.getByText('Research Project')).toBeInTheDocument()
    })

    it('shows FolderOpen icon when no project selected', () => {
      const { container } = render(<ProjectSwitcher {...defaultProps} />)
      // Lucide renders SVG
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('shows color dot when project selected', () => {
      const { container } = render(<ProjectSwitcher {...defaultProps} currentProjectId="proj-1" />)
      const colorDot = container.querySelector('.w-3.h-3.rounded-full')
      expect(colorDot).toBeInTheDocument()
      expect(colorDot).toHaveStyle({ backgroundColor: '#38bdf8' })
    })

    it('toggles dropdown on click', () => {
      render(<ProjectSwitcher {...defaultProps} />)
      const button = screen.getByRole('button')

      // Initially closed
      expect(button).toHaveAttribute('aria-expanded', 'false')

      // Click to open
      fireEvent.click(button)
      expect(button).toHaveAttribute('aria-expanded', 'true')

      // Click to close
      fireEvent.click(button)
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })

    it('rotates chevron when open', () => {
      const { container } = render(<ProjectSwitcher {...defaultProps} />)
      const button = screen.getByRole('button')

      // Find chevron (it has rotate class)
      const chevron = container.querySelector('.transition-transform')
      expect(chevron).not.toHaveClass('rotate-180')

      // Open dropdown
      fireEvent.click(button)
      expect(chevron).toHaveClass('rotate-180')
    })
  })

  describe('Dropdown Menu', () => {
    it('does not render dropdown initially', () => {
      render(<ProjectSwitcher {...defaultProps} />)
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('renders dropdown when opened', () => {
      render(<ProjectSwitcher {...defaultProps} />)
      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('renders All Notes option', () => {
      render(<ProjectSwitcher {...defaultProps} />)
      fireEvent.click(screen.getByRole('button'))

      const allNotesOption = screen.getAllByText('All Notes')[1] // Second one is in dropdown
      expect(allNotesOption).toBeInTheDocument()
    })

    it('renders all projects in dropdown', () => {
      render(<ProjectSwitcher {...defaultProps} />)
      fireEvent.click(screen.getByRole('button'))

      expect(screen.getByText('Research Project')).toBeInTheDocument()
      expect(screen.getByText('Teaching Course')).toBeInTheDocument()
      expect(screen.getByText('R Package')).toBeInTheDocument()
    })

    it('shows project types in dropdown', () => {
      render(<ProjectSwitcher {...defaultProps} />)
      fireEvent.click(screen.getByRole('button'))

      expect(screen.getByText('research')).toBeInTheDocument()
      expect(screen.getByText('teaching')).toBeInTheDocument()
      expect(screen.getByText('r package')).toBeInTheDocument() // Type is formatted with space
    })

    it('shows Create New Project option', () => {
      render(<ProjectSwitcher {...defaultProps} />)
      fireEvent.click(screen.getByRole('button'))

      expect(screen.getByText('Create New Project')).toBeInTheDocument()
    })

    it('shows color dots for each project', () => {
      const { container } = render(<ProjectSwitcher {...defaultProps} />)
      fireEvent.click(screen.getByRole('button'))

      const colorDots = container.querySelectorAll('.rounded-full')
      expect(colorDots.length).toBeGreaterThan(0)
    })
  })

  describe('Project Selection', () => {
    it('calls onSelectProject with null when All Notes clicked', () => {
      render(<ProjectSwitcher {...defaultProps} currentProjectId="proj-1" />)
      fireEvent.click(screen.getByRole('button'))

      // Find the "All Notes" option button in the dropdown
      const options = screen.getAllByRole('option')
      const allNotesOption = options.find(opt => opt.textContent?.includes('All Notes'))
      expect(allNotesOption).toBeTruthy()
      fireEvent.click(allNotesOption!)

      expect(defaultProps.onSelectProject).toHaveBeenCalledWith(null)
    })

    it('calls onSelectProject with project id when project clicked', () => {
      render(<ProjectSwitcher {...defaultProps} />)
      fireEvent.click(screen.getByRole('button'))

      fireEvent.click(screen.getByText('Teaching Course'))

      expect(defaultProps.onSelectProject).toHaveBeenCalledWith('proj-2')
    })

    it('closes dropdown after selecting project', () => {
      render(<ProjectSwitcher {...defaultProps} />)
      fireEvent.click(screen.getByRole('button'))

      expect(screen.getByRole('listbox')).toBeInTheDocument()

      fireEvent.click(screen.getByText('Teaching Course'))

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('shows check mark on selected project', () => {
      render(<ProjectSwitcher {...defaultProps} currentProjectId="proj-1" />)
      fireEvent.click(screen.getByRole('button'))

      // Check icon should be present (Lucide Check)
      const options = screen.getAllByRole('option')
      const selectedOption = options.find(opt => opt.getAttribute('aria-selected') === 'true')
      expect(selectedOption).toBeTruthy()
    })

    it('shows check mark on All Notes when selected', () => {
      render(<ProjectSwitcher {...defaultProps} currentProjectId={null} />)
      fireEvent.click(screen.getByRole('button'))

      const allNotesOption = screen.getAllByRole('option')[0] // First option
      expect(allNotesOption).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('Create Project', () => {
    it('calls onCreateProject when Create New Project clicked', () => {
      render(<ProjectSwitcher {...defaultProps} />)
      fireEvent.click(screen.getByRole('button'))

      fireEvent.click(screen.getByText('Create New Project'))

      expect(defaultProps.onCreateProject).toHaveBeenCalled()
    })

    it('closes dropdown after clicking Create New Project', () => {
      render(<ProjectSwitcher {...defaultProps} />)
      fireEvent.click(screen.getByRole('button'))

      expect(screen.getByRole('listbox')).toBeInTheDocument()

      fireEvent.click(screen.getByText('Create New Project'))

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    it('closes dropdown on Escape key', () => {
      render(<ProjectSwitcher {...defaultProps} />)
      fireEvent.click(screen.getByRole('button'))

      expect(screen.getByRole('listbox')).toBeInTheDocument()

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('does not close on Escape when already closed', () => {
      render(<ProjectSwitcher {...defaultProps} />)

      // Should not throw
      fireEvent.keyDown(document, { key: 'Escape' })

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  describe('Click Outside', () => {
    it('closes dropdown when clicking outside', () => {
      render(
        <div>
          <ProjectSwitcher {...defaultProps} />
          <div data-testid="outside">Outside</div>
        </div>
      )

      fireEvent.click(screen.getByRole('button'))
      expect(screen.getByRole('listbox')).toBeInTheDocument()

      fireEvent.mouseDown(screen.getByTestId('outside'))

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('does not close when clicking inside dropdown', () => {
      render(<ProjectSwitcher {...defaultProps} />)
      fireEvent.click(screen.getByRole('button'))

      const listbox = screen.getByRole('listbox')
      fireEvent.mouseDown(listbox)

      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
  })

  describe('Empty Projects List', () => {
    it('renders with empty projects array', () => {
      render(<ProjectSwitcher {...defaultProps} projects={[]} />)
      expect(screen.getByText('All Notes')).toBeInTheDocument()
    })

    it('shows All Notes and Create New Project with empty projects', () => {
      render(<ProjectSwitcher {...defaultProps} projects={[]} />)
      fireEvent.click(screen.getByRole('button'))

      expect(screen.getAllByText('All Notes')).toHaveLength(2) // Trigger + dropdown
      expect(screen.getByText('Create New Project')).toBeInTheDocument()
    })

    it('does not show divider with empty projects', () => {
      const { container } = render(<ProjectSwitcher {...defaultProps} projects={[]} />)
      fireEvent.click(screen.getByRole('button'))

      // Divider only shows if projects.length > 0
      const dividers = container.querySelectorAll('[style*="height: 1px"]')
      // Should only have the divider before Create New Project
      expect(dividers.length).toBe(0)
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes on trigger', () => {
      render(<ProjectSwitcher {...defaultProps} />)
      const button = screen.getByRole('button')

      expect(button).toHaveAttribute('aria-expanded')
      expect(button).toHaveAttribute('aria-haspopup', 'listbox')
    })

    it('has proper ARIA attributes on dropdown', () => {
      render(<ProjectSwitcher {...defaultProps} />)
      fireEvent.click(screen.getByRole('button'))

      const listbox = screen.getByRole('listbox')
      expect(listbox).toHaveAttribute('aria-label', 'Select project')
    })

    it('has proper ARIA attributes on options', () => {
      render(<ProjectSwitcher {...defaultProps} currentProjectId="proj-1" />)
      fireEvent.click(screen.getByRole('button'))

      const options = screen.getAllByRole('option')
      expect(options.length).toBeGreaterThan(0)

      options.forEach(option => {
        expect(option).toHaveAttribute('aria-selected')
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles project not found in list', () => {
      render(<ProjectSwitcher {...defaultProps} currentProjectId="nonexistent" />)
      // Should fallback to "All Notes" behavior
      expect(screen.getByText('All Notes')).toBeInTheDocument()
    })

    it('handles very long project names', () => {
      const longNameProjects: Project[] = [{
        id: 'long',
        name: 'This is a very long project name that should be truncated in the UI',
        type: 'generic',
        color: '#38bdf8',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }]

      render(<ProjectSwitcher {...defaultProps} projects={longNameProjects} />)
      fireEvent.click(screen.getByRole('button'))

      expect(screen.getByText('This is a very long project name that should be truncated in the UI')).toBeInTheDocument()
    })

    it('handles project type with hyphen', () => {
      render(<ProjectSwitcher {...defaultProps} />)
      fireEvent.click(screen.getByRole('button'))

      // r-package should display as "r package"
      expect(screen.getByText('r package')).toBeInTheDocument()
    })
  })
})
