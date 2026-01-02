import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

import { NoteContextMenu } from '../components/sidebar/NoteContextMenu'
import { ProjectContextMenu } from '../components/sidebar/ProjectContextMenu'
import { Note, Project } from '../types'
import { SidebarTabId, DEFAULT_SIDEBAR_TAB_ORDER } from '../lib/preferences'

// Mock preferences module
vi.mock('../lib/preferences', async () => {
  const actual = await vi.importActual('../lib/preferences')
  return {
    ...actual,
    updatePreferences: vi.fn()
  }
})

// Sample test data
const mockNote: Note = {
  id: 'note-1',
  title: 'Test Note',
  content: 'Test content',
  project_id: 'project-1',
  created_at: Date.now(),
  updated_at: Date.now()
}

const mockNoteWithoutProject: Note = {
  id: 'note-2',
  title: 'Orphan Note',
  content: 'No project',
  project_id: null,
  created_at: Date.now(),
  updated_at: Date.now()
}

const mockProjects: Project[] = [
  { id: 'project-1', name: 'Project Alpha', color: '#3b82f6', status: 'active', created_at: Date.now(), updated_at: Date.now() },
  { id: 'project-2', name: 'Project Beta', color: '#10b981', status: 'active', created_at: Date.now(), updated_at: Date.now() },
  { id: 'project-3', name: 'Archived Project', color: '#f59e0b', status: 'archive', created_at: Date.now(), updated_at: Date.now() }
]

const mockProject: Project = mockProjects[0]

const defaultPosition = { x: 100, y: 200 }

describe('NoteContextMenu', () => {
  const defaultProps = {
    note: mockNote,
    projects: mockProjects,
    position: defaultPosition,
    onClose: vi.fn(),
    onOpenNote: vi.fn(),
    onRenameNote: vi.fn(),
    onMoveToProject: vi.fn(),
    onDuplicateNote: vi.fn(),
    onDeleteNote: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders when visible', () => {
      render(<NoteContextMenu {...defaultProps} />)

      expect(screen.getByText('Open Note')).toBeInTheDocument()
      expect(screen.getByText('Rename')).toBeInTheDocument()
      expect(screen.getByText('Duplicate')).toBeInTheDocument()
      expect(screen.getByText('Delete Note')).toBeInTheDocument()
    })

    it('displays all menu items', () => {
      render(<NoteContextMenu {...defaultProps} />)

      expect(screen.getByText('Open Note')).toBeInTheDocument()
      expect(screen.getByText('Rename')).toBeInTheDocument()
      expect(screen.getByText('Move to Project')).toBeInTheDocument()
      expect(screen.getByText('Duplicate')).toBeInTheDocument()
      expect(screen.getByText('Delete Note')).toBeInTheDocument()
    })

    it('shows keyboard shortcut for Open Note', () => {
      render(<NoteContextMenu {...defaultProps} />)

      expect(screen.getByText('Enter')).toBeInTheDocument()
    })

    it('is positioned at the specified coordinates', () => {
      render(<NoteContextMenu {...defaultProps} />)

      const menu = document.querySelector('.note-context-menu')
      expect(menu).toBeInTheDocument()
      expect(menu).toHaveStyle({ position: 'fixed' })
    })
  })

  describe('Actions', () => {
    it('calls onOpenNote and onClose when clicking Open Note', () => {
      render(<NoteContextMenu {...defaultProps} />)

      fireEvent.click(screen.getByText('Open Note'))

      expect(defaultProps.onOpenNote).toHaveBeenCalledWith('note-1')
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('calls onRenameNote and onClose when clicking Rename', () => {
      render(<NoteContextMenu {...defaultProps} />)

      fireEvent.click(screen.getByText('Rename'))

      expect(defaultProps.onRenameNote).toHaveBeenCalledWith('note-1')
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('calls onDuplicateNote and onClose when clicking Duplicate', () => {
      render(<NoteContextMenu {...defaultProps} />)

      fireEvent.click(screen.getByText('Duplicate'))

      expect(defaultProps.onDuplicateNote).toHaveBeenCalledWith('note-1')
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('calls onDeleteNote and onClose when clicking Delete Note', () => {
      render(<NoteContextMenu {...defaultProps} />)

      fireEvent.click(screen.getByText('Delete Note'))

      expect(defaultProps.onDeleteNote).toHaveBeenCalledWith('note-1')
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('Escape key closes menu', () => {
    it('calls onClose when Escape key is pressed', () => {
      render(<NoteContextMenu {...defaultProps} />)

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('Click outside closes menu', () => {
    it('calls onClose when clicking outside the menu', () => {
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <NoteContextMenu {...defaultProps} />
        </div>
      )

      fireEvent.mouseDown(screen.getByTestId('outside'))

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('does not call onClose when clicking inside the menu', () => {
      render(<NoteContextMenu {...defaultProps} />)

      const menu = document.querySelector('.note-context-menu')
      fireEvent.mouseDown(menu!)

      expect(defaultProps.onClose).not.toHaveBeenCalled()
    })
  })

  describe('Move to Project submenu', () => {
    it('shows submenu on hover over Move to Project', async () => {
      render(<NoteContextMenu {...defaultProps} />)

      const moveButton = screen.getByText('Move to Project').closest('.context-menu-item-wrapper')
      fireEvent.mouseEnter(moveButton!)

      await waitFor(() => {
        expect(screen.getByText('No Project')).toBeInTheDocument()
        // Should show available projects (not current project, not archived)
        expect(screen.getByText('Project Beta')).toBeInTheDocument()
      })
    })

    it('filters out current project from submenu', async () => {
      render(<NoteContextMenu {...defaultProps} />)

      const moveButton = screen.getByText('Move to Project').closest('.context-menu-item-wrapper')
      fireEvent.mouseEnter(moveButton!)

      await waitFor(() => {
        // Project Alpha is the current project, should not appear
        expect(screen.queryByText('Project Alpha')).not.toBeInTheDocument()
        // Project Beta should appear
        expect(screen.getByText('Project Beta')).toBeInTheDocument()
      })
    })

    it('filters out archived projects from submenu', async () => {
      render(<NoteContextMenu {...defaultProps} />)

      const moveButton = screen.getByText('Move to Project').closest('.context-menu-item-wrapper')
      fireEvent.mouseEnter(moveButton!)

      await waitFor(() => {
        expect(screen.queryByText('Archived Project')).not.toBeInTheDocument()
      })
    })

    it('calls onMoveToProject with null when clicking No Project', async () => {
      render(<NoteContextMenu {...defaultProps} />)

      const moveButton = screen.getByText('Move to Project').closest('.context-menu-item-wrapper')
      fireEvent.mouseEnter(moveButton!)

      await waitFor(() => {
        expect(screen.getByText('No Project')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('No Project'))

      expect(defaultProps.onMoveToProject).toHaveBeenCalledWith('note-1', null)
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('calls onMoveToProject with project id when clicking a project', async () => {
      render(<NoteContextMenu {...defaultProps} />)

      const moveButton = screen.getByText('Move to Project').closest('.context-menu-item-wrapper')
      fireEvent.mouseEnter(moveButton!)

      await waitFor(() => {
        expect(screen.getByText('Project Beta')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Project Beta'))

      expect(defaultProps.onMoveToProject).toHaveBeenCalledWith('note-1', 'project-2')
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('disables No Project option for notes without a project', async () => {
      render(<NoteContextMenu {...defaultProps} note={mockNoteWithoutProject} />)

      const moveButton = screen.getByText('Move to Project').closest('.context-menu-item-wrapper')
      fireEvent.mouseEnter(moveButton!)

      await waitFor(() => {
        const noProjectBtn = screen.getByText('No Project').closest('button')
        expect(noProjectBtn).toBeDisabled()
      })
    })
  })
})

describe('ProjectContextMenu', () => {
  const defaultProps = {
    project: mockProject,
    position: defaultPosition,
    onClose: vi.fn(),
    onNewNote: vi.fn(),
    onEditProject: vi.fn(),
    onArchiveProject: vi.fn(),
    onDeleteProject: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders when visible', () => {
      render(<ProjectContextMenu {...defaultProps} />)

      expect(screen.getByText('New Note')).toBeInTheDocument()
      expect(screen.getByText('Edit Project')).toBeInTheDocument()
      expect(screen.getByText('Archive')).toBeInTheDocument()
      expect(screen.getByText('Delete Project')).toBeInTheDocument()
    })

    it('displays all menu items', () => {
      render(<ProjectContextMenu {...defaultProps} />)

      expect(screen.getByText('New Note')).toBeInTheDocument()
      expect(screen.getByText('Edit Project')).toBeInTheDocument()
      expect(screen.getByText('Archive')).toBeInTheDocument()
      expect(screen.getByText('Delete Project')).toBeInTheDocument()
    })

    it('shows keyboard shortcut for New Note', () => {
      render(<ProjectContextMenu {...defaultProps} />)

      // Command+N shortcut shown as special character
      const shortcut = document.querySelector('.shortcut')
      expect(shortcut?.textContent).toContain('N')
    })

    it('shows "Unarchive" for archived projects', () => {
      const archivedProject = { ...mockProject, status: 'archive' as const }
      render(<ProjectContextMenu {...defaultProps} project={archivedProject} />)

      expect(screen.getByText('Unarchive')).toBeInTheDocument()
      expect(screen.queryByText('Archive')).not.toBeInTheDocument()
    })
  })

  describe('Actions', () => {
    it('calls onNewNote and onClose when clicking New Note', () => {
      render(<ProjectContextMenu {...defaultProps} />)

      fireEvent.click(screen.getByText('New Note'))

      expect(defaultProps.onNewNote).toHaveBeenCalledWith('project-1')
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('calls onEditProject and onClose when clicking Edit Project', () => {
      render(<ProjectContextMenu {...defaultProps} />)

      fireEvent.click(screen.getByText('Edit Project'))

      expect(defaultProps.onEditProject).toHaveBeenCalledWith('project-1')
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('calls onArchiveProject and onClose when clicking Archive', () => {
      render(<ProjectContextMenu {...defaultProps} />)

      fireEvent.click(screen.getByText('Archive'))

      expect(defaultProps.onArchiveProject).toHaveBeenCalledWith('project-1')
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('calls onDeleteProject and onClose when clicking Delete Project', () => {
      render(<ProjectContextMenu {...defaultProps} />)

      fireEvent.click(screen.getByText('Delete Project'))

      expect(defaultProps.onDeleteProject).toHaveBeenCalledWith('project-1')
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('Escape key closes menu', () => {
    it('calls onClose when Escape key is pressed', () => {
      render(<ProjectContextMenu {...defaultProps} />)

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('Click outside closes menu', () => {
    it('calls onClose when clicking outside the menu', () => {
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <ProjectContextMenu {...defaultProps} />
        </div>
      )

      fireEvent.mouseDown(screen.getByTestId('outside'))

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('does not call onClose when clicking inside the menu', () => {
      render(<ProjectContextMenu {...defaultProps} />)

      const menu = document.querySelector('.project-context-menu')
      fireEvent.mouseDown(menu!)

      expect(defaultProps.onClose).not.toHaveBeenCalled()
    })
  })
})

describe('Context Menu Accessibility', () => {
  describe('NoteContextMenu', () => {
    it('contains interactive button elements', () => {
      const props = {
        note: mockNote,
        projects: mockProjects,
        position: defaultPosition,
        onClose: vi.fn(),
        onOpenNote: vi.fn(),
        onRenameNote: vi.fn(),
        onMoveToProject: vi.fn(),
        onDuplicateNote: vi.fn(),
        onDeleteNote: vi.fn()
      }
      render(<NoteContextMenu {...props} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('ProjectContextMenu', () => {
    it('contains interactive button elements', () => {
      const props = {
        project: mockProject,
        position: defaultPosition,
        onClose: vi.fn(),
        onNewNote: vi.fn(),
        onEditProject: vi.fn(),
        onArchiveProject: vi.fn(),
        onDeleteProject: vi.fn()
      }
      render(<ProjectContextMenu {...props} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('NoteContextMenu icons', () => {
    it('renders icons for menu items', () => {
      const props = {
        note: mockNote,
        projects: mockProjects,
        position: defaultPosition,
        onClose: vi.fn(),
        onOpenNote: vi.fn(),
        onRenameNote: vi.fn(),
        onMoveToProject: vi.fn(),
        onDuplicateNote: vi.fn(),
        onDeleteNote: vi.fn()
      }
      render(<NoteContextMenu {...props} />)

      // Check that SVG icons are rendered (Lucide icons)
      const svgIcons = document.querySelectorAll('svg')
      expect(svgIcons.length).toBeGreaterThan(0)
    })
  })

  describe('ProjectContextMenu icons', () => {
    it('renders icons for menu items', () => {
      const props = {
        project: mockProject,
        position: defaultPosition,
        onClose: vi.fn(),
        onNewNote: vi.fn(),
        onEditProject: vi.fn(),
        onArchiveProject: vi.fn(),
        onDeleteProject: vi.fn()
      }
      render(<ProjectContextMenu {...props} />)

      // Check that SVG icons are rendered (Lucide icons)
      const svgIcons = document.querySelectorAll('svg')
      expect(svgIcons.length).toBeGreaterThan(0)
    })
  })
})

describe('NoteContextMenu edge cases', () => {
  const defaultPosition = { x: 100, y: 200 }

  it('handles note with empty title', () => {
    const noteWithEmptyTitle: Note = {
      ...mockNote,
      title: ''
    }
    const props = {
      note: noteWithEmptyTitle,
      projects: mockProjects,
      position: defaultPosition,
      onClose: vi.fn(),
      onOpenNote: vi.fn(),
      onRenameNote: vi.fn(),
      onMoveToProject: vi.fn(),
      onDuplicateNote: vi.fn(),
      onDeleteNote: vi.fn()
    }
    render(<NoteContextMenu {...props} />)

    // Menu should still render
    expect(screen.getByText('Open Note')).toBeInTheDocument()
  })

  it('handles empty projects array', async () => {
    const props = {
      note: mockNote,
      projects: [],
      position: defaultPosition,
      onClose: vi.fn(),
      onOpenNote: vi.fn(),
      onRenameNote: vi.fn(),
      onMoveToProject: vi.fn(),
      onDuplicateNote: vi.fn(),
      onDeleteNote: vi.fn()
    }
    render(<NoteContextMenu {...props} />)

    // Menu should still render
    expect(screen.getByText('Move to Project')).toBeInTheDocument()

    // Hover to show submenu
    const moveButton = screen.getByText('Move to Project').closest('.context-menu-item-wrapper')
    fireEvent.mouseEnter(moveButton!)

    await waitFor(() => {
      expect(screen.getByText('No Project')).toBeInTheDocument()
    })
  })
})

describe('ProjectContextMenu edge cases', () => {
  const defaultPosition = { x: 100, y: 200 }

  it('handles project with empty name', () => {
    const projectWithEmptyName: Project = {
      ...mockProject,
      name: ''
    }
    const props = {
      project: projectWithEmptyName,
      position: defaultPosition,
      onClose: vi.fn(),
      onNewNote: vi.fn(),
      onEditProject: vi.fn(),
      onArchiveProject: vi.fn(),
      onDeleteProject: vi.fn()
    }
    render(<ProjectContextMenu {...props} />)

    // Menu should still render
    expect(screen.getByText('New Note')).toBeInTheDocument()
  })

  it('handles project without color', () => {
    const projectWithoutColor: Project = {
      ...mockProject,
      color: undefined as unknown as string
    }
    const props = {
      project: projectWithoutColor,
      position: defaultPosition,
      onClose: vi.fn(),
      onNewNote: vi.fn(),
      onEditProject: vi.fn(),
      onArchiveProject: vi.fn(),
      onDeleteProject: vi.fn()
    }
    render(<ProjectContextMenu {...props} />)

    // Menu should still render
    expect(screen.getByText('Edit Project')).toBeInTheDocument()
  })

  it('handles project without status', () => {
    const projectWithoutStatus: Project = {
      ...mockProject,
      status: undefined as unknown as 'active' | 'archive'
    }
    const props = {
      project: projectWithoutStatus,
      position: defaultPosition,
      onClose: vi.fn(),
      onNewNote: vi.fn(),
      onEditProject: vi.fn(),
      onArchiveProject: vi.fn(),
      onDeleteProject: vi.fn()
    }
    render(<ProjectContextMenu {...props} />)

    // Should default to showing "Archive" (not "Unarchive")
    expect(screen.getByText('Archive')).toBeInTheDocument()
  })
})
