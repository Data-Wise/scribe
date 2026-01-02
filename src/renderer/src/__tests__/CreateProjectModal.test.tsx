import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreateProjectModal } from '../components/CreateProjectModal'
import { ProjectType, PROJECT_COLORS } from '../components/ProjectSwitcher'

describe('CreateProjectModal Component', () => {
  const mockOnClose = vi.fn()
  const mockOnCreateProject = vi.fn()

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onCreateProject: mockOnCreateProject,
    existingProjectNames: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders modal when open', () => {
      render(<CreateProjectModal {...defaultProps} />)
      expect(screen.getByText('Create New Project')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      render(<CreateProjectModal {...defaultProps} isOpen={false} />)
      expect(screen.queryByText('Create New Project')).not.toBeInTheDocument()
    })

    it('renders name input field', () => {
      render(<CreateProjectModal {...defaultProps} />)
      expect(screen.getByLabelText(/Project Name/i)).toBeInTheDocument()
    })

    it('renders type dropdown', () => {
      render(<CreateProjectModal {...defaultProps} />)
      expect(screen.getByLabelText(/Project Type/i)).toBeInTheDocument()
    })

    it('renders description textarea', () => {
      render(<CreateProjectModal {...defaultProps} />)
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
    })

    it('renders color picker', () => {
      render(<CreateProjectModal {...defaultProps} />)
      expect(screen.getByText(/^Color$/)).toBeInTheDocument()
    })

    it('renders all 8 color options', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const colorButtons = screen.getAllByRole('button', { name: /Select color/i })
      expect(colorButtons.length).toBe(PROJECT_COLORS.length)
    })

    it('renders create and cancel buttons', () => {
      render(<CreateProjectModal {...defaultProps} />)
      expect(screen.getByRole('button', { name: /Create Project/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
    })

    it('renders close icon button', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const closeButtons = screen.getAllByRole('button', { name: /close/i })
      expect(closeButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Form Initialization', () => {
    it('initializes with empty name', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const nameInput = screen.getByLabelText(/Project Name/i) as HTMLInputElement
      expect(nameInput.value).toBe('')
    })

    it('initializes with generic type selected', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const typeSelect = screen.getByLabelText(/Project Type/i) as HTMLSelectElement
      expect(typeSelect.value).toBe('generic')
    })

    it('initializes with empty description', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const descTextarea = screen.getByLabelText(/Description/i) as HTMLTextAreaElement
      expect(descTextarea.value).toBe('')
    })

    it('initializes with first color selected', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const colorButtons = screen.getAllByRole('button', { name: /Select color/i })
      expect(colorButtons[0]).toHaveAttribute('aria-pressed', 'true')
    })

    it('resets form when reopened', () => {
      const { rerender } = render(<CreateProjectModal {...defaultProps} isOpen={false} />)

      rerender(<CreateProjectModal {...defaultProps} isOpen={true} />)

      const nameInput = screen.getByLabelText(/Project Name/i) as HTMLInputElement
      expect(nameInput.value).toBe('')
    })
  })

  describe('Project Type Selection', () => {
    const projectTypes: ProjectType[] = ['research', 'teaching', 'r-package', 'r-dev', 'generic']

    projectTypes.forEach((type) => {
      it(`allows selecting ${type} project type`, () => {
        render(<CreateProjectModal {...defaultProps} />)
        const typeSelect = screen.getByLabelText(/Project Type/i) as HTMLSelectElement

        fireEvent.change(typeSelect, { target: { value: type } })

        expect(typeSelect.value).toBe(type)
      })
    })

    it('shows correct label for research type', () => {
      render(<CreateProjectModal {...defaultProps} />)
      expect(screen.getByText('Research')).toBeInTheDocument()
    })

    it('shows correct label for teaching type', () => {
      render(<CreateProjectModal {...defaultProps} />)
      expect(screen.getByText('Teaching')).toBeInTheDocument()
    })

    it('shows correct label for r-package type', () => {
      render(<CreateProjectModal {...defaultProps} />)
      expect(screen.getByText('R Package')).toBeInTheDocument()
    })

    it('shows correct label for r-dev type', () => {
      render(<CreateProjectModal {...defaultProps} />)
      expect(screen.getByText('R Development')).toBeInTheDocument()
    })

    it('shows correct label for generic type', () => {
      render(<CreateProjectModal {...defaultProps} />)
      expect(screen.getByText('Generic')).toBeInTheDocument()
    })

    it('shows description for selected type', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const typeSelect = screen.getByLabelText(/Project Type/i) as HTMLSelectElement

      fireEvent.change(typeSelect, { target: { value: 'research' } })

      expect(screen.getByText(/Academic research papers/i)).toBeInTheDocument()
    })
  })

  describe('Color Selection', () => {
    it('marks first color as selected by default', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const colorButtons = screen.getAllByRole('button', { name: /Select color/i })
      expect(colorButtons[0]).toHaveAttribute('aria-pressed', 'true')
    })

    it('changes selected color when clicked', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const colorButtons = screen.getAllByRole('button', { name: /Select color/i })

      fireEvent.click(colorButtons[2])

      // Need to re-query to get updated state
      const updatedButtons = screen.getAllByRole('button', { name: /Select color/i })
      expect(updatedButtons[2]).toHaveAttribute('aria-pressed', 'true')
      expect(updatedButtons[0]).toHaveAttribute('aria-pressed', 'false')
    })

    it('allows selecting all color options', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const colorButtons = screen.getAllByRole('button', { name: /Select color/i })

      colorButtons.forEach((button, index) => {
        fireEvent.click(button)
        const updatedButtons = screen.getAllByRole('button', { name: /Select color/i })
        expect(updatedButtons[index]).toHaveAttribute('aria-pressed', 'true')
      })
    })

    it('displays check icon on selected color', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const colorButtons = screen.getAllByRole('button', { name: /Select color/i })

      fireEvent.click(colorButtons[1])

      // Should have a check icon (Lucide Check component renders as SVG)
      const selectedButton = screen.getAllByRole('button', { name: /Select color/i })[1]
      expect(selectedButton.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('shows error when name is empty', async () => {
      render(<CreateProjectModal {...defaultProps} />)
      const createButton = screen.getByRole('button', { name: /Create Project/i })

      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText(/Project name is required/i)).toBeInTheDocument()
      })
    })

    it('shows error when name is only whitespace', async () => {
      render(<CreateProjectModal {...defaultProps} />)
      const nameInput = screen.getByLabelText(/Project Name/i)
      const createButton = screen.getByRole('button', { name: /Create Project/i })

      fireEvent.change(nameInput, { target: { value: '   ' } })
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText(/Project name is required/i)).toBeInTheDocument()
      })
    })

    it('shows error when name exceeds 50 characters', async () => {
      render(<CreateProjectModal {...defaultProps} />)
      const nameInput = screen.getByLabelText(/Project Name/i)
      const createButton = screen.getByRole('button', { name: /Create Project/i })

      const longName = 'a'.repeat(51)
      fireEvent.change(nameInput, { target: { value: longName } })
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText(/must be 50 characters or less/i)).toBeInTheDocument()
      })
    })

    it('shows error when name already exists', async () => {
      const existingNames = ['existing project', 'another project']
      render(<CreateProjectModal {...defaultProps} existingProjectNames={existingNames} />)
      const nameInput = screen.getByLabelText(/Project Name/i)
      const createButton = screen.getByRole('button', { name: /Create Project/i })

      fireEvent.change(nameInput, { target: { value: 'Existing Project' } })
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText(/project with this name already exists/i)).toBeInTheDocument()
      })
    })

    it('validation is case-insensitive for existing names', async () => {
      const existingNames = ['my project']
      render(<CreateProjectModal {...defaultProps} existingProjectNames={existingNames} />)
      const nameInput = screen.getByLabelText(/Project Name/i)
      const createButton = screen.getByRole('button', { name: /Create Project/i })

      fireEvent.change(nameInput, { target: { value: 'MY PROJECT' } })
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText(/project with this name already exists/i)).toBeInTheDocument()
      })
    })

    it('accepts name with exactly 50 characters', async () => {
      render(<CreateProjectModal {...defaultProps} />)
      const nameInput = screen.getByLabelText(/Project Name/i)
      const createButton = screen.getByRole('button', { name: /Create Project/i })

      const exactName = 'a'.repeat(50)
      fireEvent.change(nameInput, { target: { value: exactName } })
      fireEvent.click(createButton)

      expect(mockOnCreateProject).toHaveBeenCalled()
    })

    it('clears error when valid name is entered', async () => {
      render(<CreateProjectModal {...defaultProps} />)
      const nameInput = screen.getByLabelText(/Project Name/i)
      const createButton = screen.getByRole('button', { name: /Create Project/i })

      // First trigger error
      fireEvent.click(createButton)
      await waitFor(() => {
        expect(screen.getByText(/Project name is required/i)).toBeInTheDocument()
      })

      // Then enter valid name
      fireEvent.change(nameInput, { target: { value: 'Valid Project' } })
      fireEvent.click(createButton)

      expect(screen.queryByText(/Project name is required/i)).not.toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('calls onCreateProject with correct data', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const nameInput = screen.getByLabelText(/Project Name/i)
      const typeSelect = screen.getByLabelText(/Project Type/i)
      const descTextarea = screen.getByLabelText(/Description/i)
      const createButton = screen.getByRole('button', { name: /Create Project/i })

      fireEvent.change(nameInput, { target: { value: 'My Project' } })
      fireEvent.change(typeSelect, { target: { value: 'research' } })
      fireEvent.change(descTextarea, { target: { value: 'A research project' } })
      fireEvent.click(createButton)

      expect(mockOnCreateProject).toHaveBeenCalledWith({
        name: 'My Project',
        type: 'research',
        description: 'A research project',
        color: PROJECT_COLORS[0],
      })
    })

    it('trims name before submission', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const nameInput = screen.getByLabelText(/Project Name/i)
      const createButton = screen.getByRole('button', { name: /Create Project/i })

      fireEvent.change(nameInput, { target: { value: '  My Project  ' } })
      fireEvent.click(createButton)

      expect(mockOnCreateProject).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'My Project' })
      )
    })

    it('trims description before submission', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const nameInput = screen.getByLabelText(/Project Name/i)
      const descTextarea = screen.getByLabelText(/Description/i)
      const createButton = screen.getByRole('button', { name: /Create Project/i })

      fireEvent.change(nameInput, { target: { value: 'My Project' } })
      fireEvent.change(descTextarea, { target: { value: '  Description  ' } })
      fireEvent.click(createButton)

      expect(mockOnCreateProject).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Description' })
      )
    })

    it('omits description if empty', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const nameInput = screen.getByLabelText(/Project Name/i)
      const createButton = screen.getByRole('button', { name: /Create Project/i })

      fireEvent.change(nameInput, { target: { value: 'My Project' } })
      fireEvent.click(createButton)

      expect(mockOnCreateProject).toHaveBeenCalledWith(
        expect.objectContaining({ description: undefined })
      )
    })

    it('includes selected color in submission', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const nameInput = screen.getByLabelText(/Project Name/i)
      const colorButtons = screen.getAllByRole('button', { name: /Select color/i })
      const createButton = screen.getByRole('button', { name: /Create Project/i })

      fireEvent.change(nameInput, { target: { value: 'My Project' } })
      fireEvent.click(colorButtons[2])
      fireEvent.click(createButton)

      expect(mockOnCreateProject).toHaveBeenCalledWith(
        expect.objectContaining({ color: PROJECT_COLORS[2] })
      )
    })

    it('calls onClose after successful submission', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const nameInput = screen.getByLabelText(/Project Name/i)
      const createButton = screen.getByRole('button', { name: /Create Project/i })

      fireEvent.change(nameInput, { target: { value: 'My Project' } })
      fireEvent.click(createButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('does not call onClose if validation fails', async () => {
      render(<CreateProjectModal {...defaultProps} />)
      const createButton = screen.getByRole('button', { name: /Create Project/i })

      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText(/Project name is required/i)).toBeInTheDocument()
      })

      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('prevents default form submission', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const nameInput = screen.getByLabelText(/Project Name/i)
      const form = screen.getByRole('button', { name: /Create Project/i }).closest('form')

      fireEvent.change(nameInput, { target: { value: 'My Project' } })

      const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
      const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault')

      form?.dispatchEvent(submitEvent)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('Cancel Functionality', () => {
    it('calls onClose when cancel button clicked', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const cancelButton = screen.getByRole('button', { name: /Cancel/i })

      fireEvent.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('calls onClose when close icon clicked', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const closeButtons = screen.getAllByRole('button', { name: /close/i })

      fireEvent.click(closeButtons[0])

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('does not submit form when canceling', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const nameInput = screen.getByLabelText(/Project Name/i)
      const cancelButton = screen.getByRole('button', { name: /Cancel/i })

      fireEvent.change(nameInput, { target: { value: 'My Project' } })
      fireEvent.click(cancelButton)

      expect(mockOnCreateProject).not.toHaveBeenCalled()
    })
  })

  describe('User Input', () => {
    it('allows typing in name field', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const nameInput = screen.getByLabelText(/Project Name/i) as HTMLInputElement

      fireEvent.change(nameInput, { target: { value: 'Test Project' } })

      expect(nameInput.value).toBe('Test Project')
    })

    it('allows typing in description field', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const descTextarea = screen.getByLabelText(/Description/i) as HTMLTextAreaElement

      fireEvent.change(descTextarea, { target: { value: 'This is a description' } })

      expect(descTextarea.value).toBe('This is a description')
    })

    it('allows multiline text in description', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const descTextarea = screen.getByLabelText(/Description/i) as HTMLTextAreaElement

      const multilineText = 'Line 1\nLine 2\nLine 3'
      fireEvent.change(descTextarea, { target: { value: multilineText } })

      expect(descTextarea.value).toBe(multilineText)
    })

    it('handles special characters in name', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const nameInput = screen.getByLabelText(/Project Name/i) as HTMLInputElement

      fireEvent.change(nameInput, { target: { value: 'Project #1 (2024)' } })

      expect(nameInput.value).toBe('Project #1 (2024)')
    })
  })

  describe('Accessibility', () => {
    it('has proper dialog role', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('has accessible title', () => {
      render(<CreateProjectModal {...defaultProps} />)
      expect(screen.getByText('Create New Project')).toBeInTheDocument()
    })

    it('labels are associated with inputs', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const nameInput = screen.getByLabelText(/Project Name/i)
      const typeSelect = screen.getByLabelText(/Project Type/i)
      const descTextarea = screen.getByLabelText(/Description/i)

      expect(nameInput).toBeInTheDocument()
      expect(typeSelect).toBeInTheDocument()
      expect(descTextarea).toBeInTheDocument()
    })

    it('color buttons have aria-label', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const colorButtons = screen.getAllByRole('button', { name: /Select color/i })

      colorButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label')
      })
    })

    it('color buttons have aria-pressed state', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const colorButtons = screen.getAllByRole('button', { name: /Select color/i })

      colorButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-pressed')
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles empty existingProjectNames array', () => {
      render(<CreateProjectModal {...defaultProps} existingProjectNames={[]} />)
      const nameInput = screen.getByLabelText(/Project Name/i)
      const createButton = screen.getByRole('button', { name: /Create Project/i })

      fireEvent.change(nameInput, { target: { value: 'Any Name' } })
      fireEvent.click(createButton)

      expect(mockOnCreateProject).toHaveBeenCalled()
    })

    it('handles undefined existingProjectNames', () => {
      const { existingProjectNames, ...propsWithoutExisting } = defaultProps
      render(<CreateProjectModal {...propsWithoutExisting} />)
      const nameInput = screen.getByLabelText(/Project Name/i)
      const createButton = screen.getByRole('button', { name: /Create Project/i })

      fireEvent.change(nameInput, { target: { value: 'Any Name' } })
      fireEvent.click(createButton)

      expect(mockOnCreateProject).toHaveBeenCalled()
    })

    it('handles very long description', () => {
      render(<CreateProjectModal {...defaultProps} />)
      const nameInput = screen.getByLabelText(/Project Name/i)
      const descTextarea = screen.getByLabelText(/Description/i)
      const createButton = screen.getByRole('button', { name: /Create Project/i })

      const longDesc = 'a'.repeat(1000)
      fireEvent.change(nameInput, { target: { value: 'Project' } })
      fireEvent.change(descTextarea, { target: { value: longDesc } })
      fireEvent.click(createButton)

      expect(mockOnCreateProject).toHaveBeenCalledWith(
        expect.objectContaining({ description: longDesc })
      )
    })
  })
})
