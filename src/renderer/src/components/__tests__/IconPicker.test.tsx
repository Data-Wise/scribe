import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { IconPicker, getIconByName, getAvailableIcons } from '../IconPicker'
import { Folder } from 'lucide-react'

describe('IconPicker Component', () => {
  const mockOnSelectIcon = vi.fn()
  const mockOnClose = vi.fn()

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders with title and search input', () => {
    render(
      <IconPicker
        selectedIcon={undefined}
        onSelectIcon={mockOnSelectIcon}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Choose an Icon')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search icons...')).toBeInTheDocument()
  })

  it('shows all categories', () => {
    render(
      <IconPicker
        selectedIcon={undefined}
        onSelectIcon={mockOnSelectIcon}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('Education')).toBeInTheDocument()
    expect(screen.getByText('Development')).toBeInTheDocument()
    expect(screen.getByText('Writing')).toBeInTheDocument()
  })

  it('displays icon grid with buttons', () => {
    const { container } = render(
      <IconPicker
        selectedIcon={undefined}
        onSelectIcon={mockOnSelectIcon}
        onClose={mockOnClose}
      />
    )

    const iconGrid = container.querySelector('.icon-picker-grid')
    expect(iconGrid).toBeInTheDocument()

    const iconButtons = container.querySelectorAll('.icon-option')
    expect(iconButtons.length).toBeGreaterThan(0)
  })

  it('calls onSelectIcon when icon clicked', () => {
    render(
      <IconPicker
        selectedIcon={undefined}
        onSelectIcon={mockOnSelectIcon}
        onClose={mockOnClose}
      />
    )

    const folderButton = screen.getByLabelText(/Select Folder icon/i)
    fireEvent.click(folderButton)

    expect(mockOnSelectIcon).toHaveBeenCalledWith('Folder')
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('highlights selected icon', () => {
    const { container } = render(
      <IconPicker
        selectedIcon="Folder"
        onSelectIcon={mockOnSelectIcon}
        onClose={mockOnClose}
      />
    )

    const selectedButton = screen.getByLabelText(/Select Folder icon/i)
    expect(selectedButton).toHaveClass('selected')
  })

  it('filters icons by search query', () => {
    render(
      <IconPicker
        selectedIcon={undefined}
        onSelectIcon={mockOnSelectIcon}
        onClose={mockOnClose}
      />
    )

    const searchInput = screen.getByPlaceholderText('Search icons...')
    fireEvent.change(searchInput, { target: { value: 'Code' } })

    // Should show Code2 icon
    expect(screen.getByLabelText(/Select Code2 icon/i)).toBeInTheDocument()
    // Should not show Folder icon
    expect(screen.queryByLabelText(/Select Folder icon/i)).not.toBeInTheDocument()
  })

  it('shows no results message when search matches nothing', () => {
    render(
      <IconPicker
        selectedIcon={undefined}
        onSelectIcon={mockOnSelectIcon}
        onClose={mockOnClose}
      />
    )

    const searchInput = screen.getByPlaceholderText('Search icons...')
    fireEvent.change(searchInput, { target: { value: 'xyz123nonexistent' } })

    expect(screen.getByText(/No icons found/i)).toBeInTheDocument()
  })

  it('filters icons by category', () => {
    const { container } = render(
      <IconPicker
        selectedIcon={undefined}
        onSelectIcon={mockOnSelectIcon}
        onClose={mockOnClose}
      />
    )

    const developmentTab = screen.getByText('Development')
    fireEvent.click(developmentTab)

    expect(developmentTab).toHaveClass('active')

    // Should show Development icons
    const iconButtons = container.querySelectorAll('.icon-option')
    expect(iconButtons.length).toBeLessThan(68) // Less than total
  })

  it('shows correct icon count', () => {
    render(
      <IconPicker
        selectedIcon={undefined}
        onSelectIcon={mockOnSelectIcon}
        onClose={mockOnClose}
      />
    )

    // Should show total count initially
    expect(screen.getByText(/68 icons/i)).toBeInTheDocument()
  })

  it('closes when overlay clicked', () => {
    const { container } = render(
      <IconPicker
        selectedIcon={undefined}
        onSelectIcon={mockOnSelectIcon}
        onClose={mockOnClose}
      />
    )

    const overlay = container.querySelector('.icon-picker-overlay')
    if (overlay) {
      fireEvent.click(overlay)
      expect(mockOnClose).toHaveBeenCalled()
    }
  })

  it('closes when close button clicked', () => {
    render(
      <IconPicker
        selectedIcon={undefined}
        onSelectIcon={mockOnSelectIcon}
        onClose={mockOnClose}
      />
    )

    const closeButton = screen.getByLabelText('Close icon picker')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('closes when cancel button clicked', () => {
    render(
      <IconPicker
        selectedIcon={undefined}
        onSelectIcon={mockOnSelectIcon}
        onClose={mockOnClose}
      />
    )

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('auto-focuses search input', () => {
    render(
      <IconPicker
        selectedIcon={undefined}
        onSelectIcon={mockOnSelectIcon}
        onClose={mockOnClose}
      />
    )

    const searchInput = screen.getByPlaceholderText('Search icons...') as HTMLInputElement
    expect(document.activeElement).toBe(searchInput)
  })
})

describe('Icon Helper Functions', () => {
  it('getIconByName returns correct icon component', () => {
    const FolderIcon = getIconByName('Folder')
    expect(FolderIcon).toBeDefined()
    // LucideIcon components are objects (React components)
    expect(typeof FolderIcon).toBe('object')
  })

  it('getIconByName returns Folder as default for unknown icon', () => {
    const UnknownIcon = getIconByName('NonExistentIcon')
    const FolderIcon = getIconByName('Folder')
    expect(UnknownIcon).toBe(FolderIcon)
  })

  it('getIconByName returns Folder for undefined', () => {
    const DefaultIcon = getIconByName(undefined)
    expect(DefaultIcon).toBe(Folder)
  })

  it('getAvailableIcons returns array of icon names', () => {
    const icons = getAvailableIcons()
    expect(Array.isArray(icons)).toBe(true)
    expect(icons.length).toBe(68)
    expect(icons).toContain('Folder')
    expect(icons).toContain('Code2')
    expect(icons).toContain('GraduationCap')
  })
})
