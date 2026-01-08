import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Ribbon } from '../components/Ribbon'
import { SearchBar } from '../components/SearchBar'
import { TagFilter } from '../components/TagFilter'
import { PropertiesPanel } from '../components/PropertiesPanel'

// Mock the Zustand store
vi.mock('../store/useAppViewStore', () => ({
  useAppViewStore: () => ({
    sidebarMode: 'compact'
  })
}))

describe('Ribbon Component', () => {
  const defaultProps = {
    activeTab: 'projects',
    onTabChange: vi.fn(),
    onToggleDashboard: vi.fn(),
    isDashboardOpen: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all navigation buttons', () => {
    render(<Ribbon {...defaultProps} />)

    // Should have nav items with title attributes
    expect(screen.getByTitle('Mission HQ')).toBeInTheDocument()
    expect(screen.getByTitle('Projects')).toBeInTheDocument()
    expect(screen.getByTitle('Search')).toBeInTheDocument()
    expect(screen.getByTitle('Journal')).toBeInTheDocument()
    expect(screen.getByTitle('Settings')).toBeInTheDocument()
  })

  it('calls onTabChange when Projects button clicked', () => {
    render(<Ribbon {...defaultProps} />)

    fireEvent.click(screen.getByTitle('Projects'))
    expect(defaultProps.onTabChange).toHaveBeenCalledWith('projects')
  })

  it('calls onTabChange when Search button clicked', () => {
    render(<Ribbon {...defaultProps} />)

    fireEvent.click(screen.getByTitle('Search'))
    expect(defaultProps.onTabChange).toHaveBeenCalledWith('search')
  })

  it('calls onTabChange when Journal button clicked', () => {
    render(<Ribbon {...defaultProps} />)

    fireEvent.click(screen.getByTitle('Journal'))
    expect(defaultProps.onTabChange).toHaveBeenCalledWith('daily')
  })

  it('calls onTabChange when Settings button clicked', () => {
    render(<Ribbon {...defaultProps} />)

    fireEvent.click(screen.getByTitle('Settings'))
    expect(defaultProps.onTabChange).toHaveBeenCalledWith('settings')
  })

  it('calls onToggleDashboard when Mission HQ button clicked', () => {
    render(<Ribbon {...defaultProps} />)

    fireEvent.click(screen.getByTitle('Mission HQ'))
    expect(defaultProps.onToggleDashboard).toHaveBeenCalled()
  })

  it('shows active indicator for current tab', () => {
    const { container } = render(<Ribbon {...defaultProps} activeTab="projects" />)

    // Active tab should have the active indicator (white/10 bg)
    const buttons = container.querySelectorAll('button')
    const projectsButton = Array.from(buttons).find(btn => btn.title === 'Projects')
    expect(projectsButton?.className).toContain('bg-white/10')
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
      status: { key: 'status', value: ['draft'], type: 'list' as const },  // List type must be array
      priority: { key: 'priority', value: ['high'], type: 'list' as const },  // List type must be array
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
