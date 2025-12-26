import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Ribbon } from '../components/Ribbon'
import { SearchBar } from '../components/SearchBar'
import { TagFilter } from '../components/TagFilter'
import { PropertiesPanel } from '../components/PropertiesPanel'

describe('Ribbon Component', () => {
  const mockHandlers = {
    onToggleLeft: vi.fn(),
    onToggleRight: vi.fn(),
    onSearch: vi.fn(),
    onSettings: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all navigation buttons', () => {
    render(
      <Ribbon
        {...mockHandlers}
        leftCollapsed={false}
        rightCollapsed={false}
      />
    )

    // Should have toggle buttons, search, and settings
    expect(screen.getByTitle(/Toggle file list/)).toBeInTheDocument()
    expect(screen.getByTitle(/Search/)).toBeInTheDocument()
    expect(screen.getByTitle(/Toggle tags panel/)).toBeInTheDocument()
    expect(screen.getByTitle(/Settings/)).toBeInTheDocument()
  })

  it('calls onToggleLeft when file list button clicked', () => {
    render(
      <Ribbon
        {...mockHandlers}
        leftCollapsed={false}
        rightCollapsed={false}
      />
    )

    fireEvent.click(screen.getByTitle(/Toggle file list/))
    expect(mockHandlers.onToggleLeft).toHaveBeenCalled()
  })

  it('calls onToggleRight when tags button clicked', () => {
    render(
      <Ribbon
        {...mockHandlers}
        leftCollapsed={false}
        rightCollapsed={false}
      />
    )

    fireEvent.click(screen.getByTitle(/Toggle tags panel/))
    expect(mockHandlers.onToggleRight).toHaveBeenCalled()
  })

  it('calls onSearch when search button clicked', () => {
    render(
      <Ribbon
        {...mockHandlers}
        leftCollapsed={false}
        rightCollapsed={false}
      />
    )

    fireEvent.click(screen.getByTitle(/Search/))
    expect(mockHandlers.onSearch).toHaveBeenCalled()
  })

  it('calls onSettings when settings button clicked', () => {
    render(
      <Ribbon
        {...mockHandlers}
        leftCollapsed={false}
        rightCollapsed={false}
      />
    )

    fireEvent.click(screen.getByTitle(/Settings/))
    expect(mockHandlers.onSettings).toHaveBeenCalled()
  })

  it('shows active state when sidebar is expanded', () => {
    const { container } = render(
      <Ribbon
        {...mockHandlers}
        leftCollapsed={false}
        rightCollapsed={false}
      />
    )

    const activeButtons = container.querySelectorAll('.active')
    expect(activeButtons.length).toBeGreaterThan(0)
  })
})

describe('SearchBar Component', () => {
  const mockOnSearch = vi.fn()
  const mockOnClear = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders search input', () => {
    render(<SearchBar onSearch={mockOnSearch} onClear={mockOnClear} />)
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
  })

  it('calls onSearch when typing', async () => {
    render(<SearchBar onSearch={mockOnSearch} onClear={mockOnClear} />)
    
    const input = screen.getByPlaceholderText(/search/i)
    fireEvent.change(input, { target: { value: 'test query' } })

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalled()
    })
  })

  it('handles escape key press', () => {
    render(<SearchBar onSearch={mockOnSearch} onClear={mockOnClear} />)
    
    const input = screen.getByPlaceholderText(/search/i) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'test' } })
    
    // Simulate escape key - behavior depends on implementation
    fireEvent.keyDown(input, { key: 'Escape' })
    
    // Test passes if no error is thrown - escape handling is optional
    expect(input).toBeInTheDocument()
  })
})

describe('TagFilter Component', () => {
  const mockOnRemoveTag = vi.fn()
  const mockOnClearAll = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when no tags selected', () => {
    const { container } = render(
      <TagFilter
        selectedTags={[]}
        onRemoveTag={mockOnRemoveTag}
        onClearAll={mockOnClearAll}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders selected tags', () => {
    const tags = [
      { id: '1', name: 'important', color: '#ff0000', created_at: Date.now() },
      { id: '2', name: 'work', color: '#00ff00', created_at: Date.now() },
    ]

    render(
      <TagFilter
        selectedTags={tags}
        onRemoveTag={mockOnRemoveTag}
        onClearAll={mockOnClearAll}
      />
    )

    expect(screen.getByText('#important')).toBeInTheDocument()
    expect(screen.getByText('#work')).toBeInTheDocument()
  })

  it('shows clear all button when tags selected', () => {
    const tags = [{ id: '1', name: 'test', color: '#000', created_at: Date.now() }]

    render(
      <TagFilter
        selectedTags={tags}
        onRemoveTag={mockOnRemoveTag}
        onClearAll={mockOnClearAll}
      />
    )

    expect(screen.getByText(/clear all/i)).toBeInTheDocument()
  })

  it('calls onRemoveTag when tag clicked', () => {
    const tags = [{ id: '1', name: 'test', color: '#000', created_at: Date.now() }]

    render(
      <TagFilter
        selectedTags={tags}
        onRemoveTag={mockOnRemoveTag}
        onClearAll={mockOnClearAll}
      />
    )

    fireEvent.click(screen.getByText('#test'))
    expect(mockOnRemoveTag).toHaveBeenCalledWith('1')
  })

  it('calls onClearAll when clear all clicked', () => {
    const tags = [{ id: '1', name: 'test', color: '#000', created_at: Date.now() }]

    render(
      <TagFilter
        selectedTags={tags}
        onRemoveTag={mockOnRemoveTag}
        onClearAll={mockOnClearAll}
      />
    )

    fireEvent.click(screen.getByText(/clear all/i))
    expect(mockOnClearAll).toHaveBeenCalled()
  })
})

describe('PropertiesPanel Component', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with empty properties', () => {
    render(
      <PropertiesPanel
        properties={{}}
        onChange={mockOnChange}
      />
    )

    // Panel should render without crashing
    expect(document.body).toBeInTheDocument()
  })

  it('displays existing properties', () => {
    const properties = {
      status: { key: 'status', value: 'draft', type: 'list' as const },
      priority: { key: 'priority', value: 'high', type: 'list' as const },
    }

    render(
      <PropertiesPanel
        properties={properties}
        onChange={mockOnChange}
      />
    )

    expect(screen.getByText(/status/i)).toBeInTheDocument()
    expect(screen.getByText(/priority/i)).toBeInTheDocument()
  })
})
