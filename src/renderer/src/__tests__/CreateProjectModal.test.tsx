import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreateProjectModal } from '../components/CreateProjectModal'
import { PROJECT_COLORS } from '../components/ProjectSwitcher'

// Mock icons
vi.mock('lucide-react', () => ({
  X: () => <span data-testid="icon-close">X</span>,
  FolderPlus: () => <span data-testid="icon-folder">F</span>,
  Check: () => <span data-testid="icon-check">C</span>
}))

describe('CreateProjectModal', () => {
  const mockOnClose = vi.fn()
  const mockOnCreateProject = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly when open', () => {
    render(
      <CreateProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
      />
    )

    expect(screen.getByText('Create New Project')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('My Research Project')).toBeInTheDocument()
    expect(screen.getByText('Research')).toBeInTheDocument() // Dropdown option
  })

  it('does not render when closed', () => {
    render(
      <CreateProjectModal
        isOpen={false}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
      />
    )

    expect(screen.queryByText('Create New Project')).not.toBeInTheDocument()
  })

  it('validates empty project name', async () => {
    render(
      <CreateProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
      />
    )

    const submitBtn = screen.getByText('Create Project')
    fireEvent.click(submitBtn)

    expect(await screen.findByText('Project name is required')).toBeInTheDocument()
    expect(mockOnCreateProject).not.toHaveBeenCalled()
  })

  it('validates duplicate project name', async () => {
    const existing = ['alpha', 'beta']
    render(
      <CreateProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
        existingProjectNames={existing}
      />
    )

    const input = screen.getByPlaceholderText('My Research Project')
    fireEvent.change(input, { target: { value: 'Alpha' } }) // Case insensitive check usually

    const submitBtn = screen.getByText('Create Project')
    fireEvent.click(submitBtn)

    expect(await screen.findByText('A project with this name already exists')).toBeInTheDocument()
    expect(mockOnCreateProject).not.toHaveBeenCalled()
  })

  it('validates name length', async () => {
    render(
      <CreateProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
      />
    )

    const longName = 'A'.repeat(51)
    const input = screen.getByPlaceholderText('My Research Project')
    fireEvent.change(input, { target: { value: longName } })

    const submitBtn = screen.getByText('Create Project')
    fireEvent.click(submitBtn)

    expect(await screen.findByText('Project name must be 50 characters or less')).toBeInTheDocument()
  })

  it('submits valid form data', async () => {
    render(
      <CreateProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
      />
    )

    // Name
    const input = screen.getByPlaceholderText('My Research Project')
    fireEvent.change(input, { target: { value: 'New Project' } })

    // Description
    const descInput = screen.getByPlaceholderText('Brief description of the project...')
    fireEvent.change(descInput, { target: { value: 'My description' } })

    // Type (Select)
    const select = screen.getByLabelText('Project Type')
    fireEvent.change(select, { target: { value: 'research' } })

    // Color
    const targetColor = PROJECT_COLORS[1]
    const colorBtn = screen.getByLabelText(`Select color ${targetColor}`)
    fireEvent.click(colorBtn)

    const submitBtn = screen.getByText('Create Project')
    fireEvent.click(submitBtn)

    expect(mockOnCreateProject).toHaveBeenCalledWith({
      name: 'New Project',
      type: 'research',
      description: 'My description',
      color: targetColor
    })
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('resets form when opened', async () => {
    const { rerender } = render(
      <CreateProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
      />
    )

    // Type something
    const input = screen.getByPlaceholderText('My Research Project')
    fireEvent.change(input, { target: { value: 'Dirty Input' } })

    // Close
    rerender(
      <CreateProjectModal
        isOpen={false}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
      />
    )

    // Re-open
    rerender(
      <CreateProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
      />
    )

    // Re-query input to be safe
    const resetInput = screen.getByPlaceholderText('My Research Project')
    expect((resetInput as HTMLInputElement).value).toBe('')
  })
})
