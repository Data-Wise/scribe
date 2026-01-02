import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { EditorTabs } from '../components/EditorTabs/EditorTabs'

// Mock the stores
const mockSetActiveTab = vi.fn()
const mockCloseTab = vi.fn()
const mockReorderTabs = vi.fn()
const mockUpdateTabTitle = vi.fn()
const mockPinTab = vi.fn()
const mockUnpinTab = vi.fn()

// Default mock tabs
const createMockTabs = () => [
  {
    id: 'mission-control',
    type: 'mission-control' as const,
    title: 'Mission Control',
    isPinned: true
  },
  {
    id: 'tab-1',
    type: 'note' as const,
    noteId: 'note-1',
    title: 'First Note',
    isPinned: false
  },
  {
    id: 'tab-2',
    type: 'note' as const,
    noteId: 'note-2',
    title: 'Second Note',
    isPinned: false
  }
]

let mockTabs = createMockTabs()
let mockActiveTabId = 'tab-1'

vi.mock('../store/useAppViewStore', () => ({
  useAppViewStore: vi.fn((selector) => {
    const state = {
      openTabs: mockTabs,
      activeTabId: mockActiveTabId,
      setActiveTab: mockSetActiveTab,
      closeTab: mockCloseTab,
      reorderTabs: mockReorderTabs,
      updateTabTitle: mockUpdateTabTitle,
      pinTab: mockPinTab,
      unpinTab: mockUnpinTab
    }
    return selector ? selector(state) : state
  }),
  MISSION_CONTROL_TAB_ID: 'mission-control',
  EditorTab: {}
}))

vi.mock('../store/useSettingsStore', () => ({
  useSettingsStore: vi.fn((selector) => {
    const state = {
      settings: {
        'appearance.tabBarStyle': 'subtle',
        'appearance.activeTabStyle': 'accent-bar'
      }
    }
    return selector ? selector(state) : state
  })
}))

vi.mock('../lib/preferences', () => ({
  loadPreferences: () => ({
    borderStyle: 'soft'
  }),
  TabBarStyle: {},
  BorderStyle: {},
  ActiveTabStyle: {}
}))

// Mock createPortal for context menu
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom')
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children
  }
})

describe('EditorTabs Component', () => {
  beforeEach(() => {
    mockTabs = createMockTabs()
    mockActiveTabId = 'tab-1'
    vi.clearAllMocks()

    // Mock window dimensions for scroll tests
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ====================
  // 1. Renders tabs when provided
  // ====================
  describe('Renders tabs when provided', () => {
    it('renders all tabs from the store', () => {
      render(<EditorTabs />)

      expect(screen.getByTestId('tab-mission-control')).toBeInTheDocument()
      expect(screen.getByTestId('tab-1')).toBeInTheDocument()
      expect(screen.getByTestId('tab-2')).toBeInTheDocument()
    })

    it('renders the correct number of tabs', () => {
      render(<EditorTabs />)

      const tabsContainer = screen.getByTestId('editor-tabs')
      // Should have 3 tab buttons (Mission Control + 2 notes)
      const tabs = tabsContainer.querySelectorAll('.editor-tab')
      expect(tabs).toHaveLength(3)
    })

    it('renders tabs with correct data attributes', () => {
      render(<EditorTabs />)

      const container = screen.getByTestId('editor-tabs')
      expect(container).toHaveAttribute('data-tab-bar-style', 'subtle')
      expect(container).toHaveAttribute('data-border-style', 'soft')
      expect(container).toHaveAttribute('data-active-tab-style', 'accent-bar')
    })
  })

  // ====================
  // 2. Renders empty state when no tabs
  // ====================
  describe('Renders empty state when no tabs', () => {
    it('renders empty container when no tabs', () => {
      mockTabs = []
      render(<EditorTabs />)

      const tabsContainer = screen.getByTestId('editor-tabs')
      const tabs = tabsContainer.querySelectorAll('.editor-tab')
      expect(tabs).toHaveLength(0)
    })
  })

  // ====================
  // 3. Active tab is highlighted
  // ====================
  describe('Active tab is highlighted', () => {
    it('applies active class to the active tab', () => {
      mockActiveTabId = 'tab-1'
      render(<EditorTabs />)

      const activeTab = screen.getByTestId('tab-1')
      expect(activeTab).toHaveClass('active')
    })

    it('does not apply active class to inactive tabs', () => {
      mockActiveTabId = 'tab-1'
      render(<EditorTabs />)

      const inactiveTab = screen.getByTestId('tab-2')
      expect(inactiveTab).not.toHaveClass('active')
    })

    it('shows accent bar on active tab', () => {
      mockActiveTabId = 'tab-1'
      render(<EditorTabs />)

      const activeTab = screen.getByTestId('tab-1')
      const accentBar = activeTab.querySelector('.tab-accent-bar')
      expect(accentBar).toBeInTheDocument()
    })

    it('does not show accent bar on inactive tabs', () => {
      mockActiveTabId = 'tab-1'
      render(<EditorTabs />)

      const inactiveTab = screen.getByTestId('tab-2')
      const accentBar = inactiveTab.querySelector('.tab-accent-bar')
      expect(accentBar).not.toBeInTheDocument()
    })
  })

  // ====================
  // 4. Click on tab calls onSelectTab
  // ====================
  describe('Click on tab calls onSelectTab', () => {
    it('calls setActiveTab when clicking on a tab', async () => {
      const user = userEvent.setup()
      render(<EditorTabs />)

      const tab = screen.getByTestId('tab-2')
      await user.click(tab)

      expect(mockSetActiveTab).toHaveBeenCalledWith('tab-2')
    })

    it('calls setActiveTab when clicking on Mission Control', async () => {
      const user = userEvent.setup()
      render(<EditorTabs />)

      const missionControl = screen.getByTestId('tab-mission-control')
      await user.click(missionControl)

      expect(mockSetActiveTab).toHaveBeenCalledWith('mission-control')
    })
  })

  // ====================
  // 5. Close button calls onCloseTab
  // ====================
  describe('Close button calls onCloseTab', () => {
    it('calls closeTab when clicking close button on unpinned tab', async () => {
      const user = userEvent.setup()
      render(<EditorTabs />)

      const tab = screen.getByTestId('tab-1')
      const closeButton = within(tab).getByTestId('tab-close')
      await user.click(closeButton)

      expect(mockCloseTab).toHaveBeenCalledWith('tab-1')
    })

    it('does not show close button on pinned tabs', () => {
      render(<EditorTabs />)

      const missionControl = screen.getByTestId('tab-mission-control')
      const closeButton = within(missionControl).queryByTestId('tab-close')
      expect(closeButton).not.toBeInTheDocument()
    })

    it('shows pin indicator on pinned tabs', () => {
      render(<EditorTabs />)

      const missionControl = screen.getByTestId('tab-mission-control')
      const pinIndicator = within(missionControl).getByTestId('tab-pinned')
      expect(pinIndicator).toBeInTheDocument()
    })

    it('closes tab on middle click (unpinned tab)', () => {
      render(<EditorTabs />)

      const tab = screen.getByTestId('tab-1')
      fireEvent.mouseDown(tab, { button: 1 })

      expect(mockCloseTab).toHaveBeenCalledWith('tab-1')
    })

    it('does not close pinned tab on middle click', () => {
      render(<EditorTabs />)

      const missionControl = screen.getByTestId('tab-mission-control')
      fireEvent.mouseDown(missionControl, { button: 1 })

      expect(mockCloseTab).not.toHaveBeenCalled()
    })
  })

  // ====================
  // 6. Tab title is displayed
  // ====================
  describe('Tab title is displayed', () => {
    it('displays full title for short titles', () => {
      render(<EditorTabs />)

      expect(screen.getByText('First Note')).toBeInTheDocument()
      expect(screen.getByText('Second Note')).toBeInTheDocument()
    })

    it('shows Mission Control title', () => {
      render(<EditorTabs />)

      expect(screen.getByText('Mission Control')).toBeInTheDocument()
    })

    it('truncates long titles with smart truncation', () => {
      mockTabs = [
        {
          id: 'tab-long',
          type: 'note' as const,
          noteId: 'note-long',
          title: 'This is a very long title that should be truncated',
          isPinned: false
        }
      ]
      render(<EditorTabs />)

      // Smart truncation keeps beginning and end
      // "This is a very long title that should be truncated" (52 chars)
      // Should be truncated to ~18 chars: "This is a v...ated"
      const tab = screen.getByTestId('tab-0')
      const titleSpan = tab.querySelector('.tab-title')
      expect(titleSpan?.textContent).toContain('...')
    })

    it('shows full title in tooltip', () => {
      const longTitle = 'This is a very long title that should be truncated'
      mockTabs = [
        {
          id: 'tab-long',
          type: 'note' as const,
          noteId: 'note-long',
          title: longTitle,
          isPinned: false
        }
      ]
      render(<EditorTabs />)

      const tab = screen.getByTestId('tab-0')
      expect(tab).toHaveAttribute('title', longTitle)
    })
  })

  // ====================
  // 7. Tab shows unsaved indicator when dirty
  // ====================
  describe('Tab shows unsaved indicator when dirty', () => {
    // Note: The EditorTabs component currently does not have a dirty indicator
    // This test documents the expected behavior if it were implemented
    it.skip('shows unsaved indicator for dirty tabs', () => {
      mockTabs = [
        {
          id: 'tab-dirty',
          type: 'note' as const,
          noteId: 'note-dirty',
          title: 'Unsaved Note',
          isPinned: false,
          // isDirty: true // Would need to add this to EditorTab type
        }
      ]
      render(<EditorTabs />)

      // Would expect something like:
      // const tab = screen.getByTestId('tab-0')
      // const dirtyIndicator = within(tab).getByTestId('dirty-indicator')
      // expect(dirtyIndicator).toBeInTheDocument()
    })
  })

  // ====================
  // 8. Tab context menu works
  // ====================
  describe('Tab context menu works', () => {
    it('opens context menu on right-click', async () => {
      const user = userEvent.setup()
      render(<EditorTabs />)

      const tab = screen.getByTestId('tab-1')
      await user.pointer({ keys: '[MouseRight]', target: tab })

      // Context menu should be visible
      expect(screen.getByText('Close')).toBeInTheDocument()
      expect(screen.getByText('Close Others')).toBeInTheDocument()
      expect(screen.getByText('Close to Right')).toBeInTheDocument()
    })

    it('shows Pin Tab option for unpinned tabs', async () => {
      const user = userEvent.setup()
      render(<EditorTabs />)

      const tab = screen.getByTestId('tab-1')
      await user.pointer({ keys: '[MouseRight]', target: tab })

      expect(screen.getByText('Pin Tab')).toBeInTheDocument()
    })

    it('shows Unpin Tab option for pinned tabs', async () => {
      mockTabs = [
        ...createMockTabs(),
        {
          id: 'tab-pinned',
          type: 'note' as const,
          noteId: 'note-pinned',
          title: 'Pinned Note',
          isPinned: true
        }
      ]
      const user = userEvent.setup()
      render(<EditorTabs />)

      // Right-click the pinned note tab (not Mission Control which can't be unpinned)
      const pinnedTab = screen.getByTestId('tab-3')
      await user.pointer({ keys: '[MouseRight]', target: pinnedTab })

      expect(screen.getByText('Unpin Tab')).toBeInTheDocument()
    })

    it('does not show Pin/Unpin for Mission Control', async () => {
      const user = userEvent.setup()
      render(<EditorTabs />)

      const missionControl = screen.getByTestId('tab-mission-control')
      await user.pointer({ keys: '[MouseRight]', target: missionControl })

      // Should not have pin/unpin options for Mission Control
      expect(screen.queryByText('Pin Tab')).not.toBeInTheDocument()
      expect(screen.queryByText('Unpin Tab')).not.toBeInTheDocument()
    })

    it('closes context menu on escape', async () => {
      const user = userEvent.setup()
      render(<EditorTabs />)

      const tab = screen.getByTestId('tab-1')
      await user.pointer({ keys: '[MouseRight]', target: tab })

      expect(screen.getByText('Close')).toBeInTheDocument()

      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(screen.queryByText('Close Others')).not.toBeInTheDocument()
      })
    })

    it('shows Copy Path option', async () => {
      const user = userEvent.setup()
      render(<EditorTabs />)

      const tab = screen.getByTestId('tab-1')
      await user.pointer({ keys: '[MouseRight]', target: tab })

      expect(screen.getByText('Copy Path')).toBeInTheDocument()
    })
  })

  // ====================
  // 9. Drag and drop reordering
  // ====================
  describe('Drag and drop reordering', () => {
    // Helper to create drag event init with proper dataTransfer mock
    const createDragEventInit = () => ({
      dataTransfer: {
        effectAllowed: '',
        dropEffect: '',
        setDragImage: vi.fn()
      } as unknown as DataTransfer
    })

    it('sets draggable attribute on unpinned tabs', () => {
      render(<EditorTabs />)

      const unpinnedTab = screen.getByTestId('tab-1')
      expect(unpinnedTab).toHaveAttribute('draggable', 'true')
    })

    it('sets draggable to false on pinned tabs', () => {
      render(<EditorTabs />)

      const missionControl = screen.getByTestId('tab-mission-control')
      expect(missionControl).toHaveAttribute('draggable', 'false')
    })

    it('applies dragging class during drag', () => {
      render(<EditorTabs />)

      const tab = screen.getByTestId('tab-1')

      fireEvent.dragStart(tab, createDragEventInit())
      expect(tab).toHaveClass('dragging')

      fireEvent.dragEnd(tab)
      expect(tab).not.toHaveClass('dragging')
    })

    it('applies drag-over class when dragging over another tab', () => {
      render(<EditorTabs />)

      const sourceTab = screen.getByTestId('tab-1')
      const targetTab = screen.getByTestId('tab-2')

      fireEvent.dragStart(sourceTab, createDragEventInit())
      fireEvent.dragOver(targetTab, createDragEventInit())

      expect(targetTab).toHaveClass('drag-over')
    })

    it('calls reorderTabs on drop', () => {
      render(<EditorTabs />)

      const sourceTab = screen.getByTestId('tab-1')
      const targetTab = screen.getByTestId('tab-2')

      fireEvent.dragStart(sourceTab, createDragEventInit())
      fireEvent.dragOver(targetTab, createDragEventInit())
      fireEvent.drop(targetTab, createDragEventInit())

      expect(mockReorderTabs).toHaveBeenCalledWith(1, 2)
    })

    it('does not reorder when dropping on same position', () => {
      render(<EditorTabs />)

      const tab = screen.getByTestId('tab-1')

      fireEvent.dragStart(tab, createDragEventInit())
      fireEvent.drop(tab, createDragEventInit())

      expect(mockReorderTabs).not.toHaveBeenCalled()
    })
  })

  // ====================
  // 10. Keyboard navigation
  // ====================
  describe('Keyboard navigation', () => {
    it('tabs can receive focus', () => {
      render(<EditorTabs />)

      const tab = screen.getByTestId('tab-1')
      tab.focus()

      expect(document.activeElement).toBe(tab)
    })

    it('activates tab on Enter key', async () => {
      const user = userEvent.setup()
      render(<EditorTabs />)

      const tab = screen.getByTestId('tab-2')
      tab.focus()
      await user.keyboard('{Enter}')

      expect(mockSetActiveTab).toHaveBeenCalledWith('tab-2')
    })

    it('activates tab on Space key', async () => {
      const user = userEvent.setup()
      render(<EditorTabs />)

      const tab = screen.getByTestId('tab-2')
      tab.focus()
      await user.keyboard(' ')

      expect(mockSetActiveTab).toHaveBeenCalledWith('tab-2')
    })
  })

  // ====================
  // Additional tests
  // ====================
  describe('Inline editing', () => {
    it('enters edit mode on double-click for unpinned tabs', async () => {
      const user = userEvent.setup()
      render(<EditorTabs />)

      const tab = screen.getByTestId('tab-1')
      await user.dblClick(tab)

      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue('First Note')
    })

    it('does not enter edit mode on double-click for pinned tabs', async () => {
      const user = userEvent.setup()
      render(<EditorTabs />)

      const missionControl = screen.getByTestId('tab-mission-control')
      await user.dblClick(missionControl)

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('saves title on Enter key', async () => {
      const user = userEvent.setup()
      render(<EditorTabs />)

      const tab = screen.getByTestId('tab-1')
      await user.dblClick(tab)

      const input = screen.getByRole('textbox')
      await user.clear(input)
      await user.type(input, 'New Title{Enter}')

      expect(mockUpdateTabTitle).toHaveBeenCalledWith('tab-1', 'New Title')
    })

    it('cancels edit on Escape key', async () => {
      const user = userEvent.setup()
      render(<EditorTabs />)

      const tab = screen.getByTestId('tab-1')
      await user.dblClick(tab)

      const input = screen.getByRole('textbox')
      await user.type(input, 'Changed{Escape}')

      expect(mockUpdateTabTitle).not.toHaveBeenCalled()
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('saves title on blur', async () => {
      const user = userEvent.setup()
      render(<EditorTabs />)

      const tab = screen.getByTestId('tab-1')
      await user.dblClick(tab)

      const input = screen.getByRole('textbox')
      await user.clear(input)
      await user.type(input, 'Blurred Title')

      // Blur by clicking elsewhere
      await user.click(document.body)

      expect(mockUpdateTabTitle).toHaveBeenCalledWith('tab-1', 'Blurred Title')
    })

    it('does not update title if empty after trim', async () => {
      const user = userEvent.setup()
      render(<EditorTabs />)

      const tab = screen.getByTestId('tab-1')
      await user.dblClick(tab)

      const input = screen.getByRole('textbox')
      await user.clear(input)
      await user.type(input, '   {Enter}')

      expect(mockUpdateTabTitle).not.toHaveBeenCalled()
    })
  })

  describe('Tab icons', () => {
    it('shows Home icon for Mission Control', () => {
      render(<EditorTabs />)

      const missionControl = screen.getByTestId('tab-mission-control')
      const icon = missionControl.querySelector('.tab-icon svg')
      expect(icon).toBeInTheDocument()
    })

    it('shows FileText icon for note tabs', () => {
      render(<EditorTabs />)

      const noteTab = screen.getByTestId('tab-1')
      const icon = noteTab.querySelector('.tab-icon svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Scroll overflow', () => {
    it('does not show scroll arrows when tabs fit', () => {
      render(<EditorTabs />)

      // With default mock tabs and normal width, arrows should not show
      expect(screen.queryByLabelText('Scroll tabs left')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Scroll tabs right')).not.toBeInTheDocument()
    })

    it('updates scroll state on resize', async () => {
      render(<EditorTabs />)

      await act(async () => {
        window.dispatchEvent(new Event('resize'))
      })

      // Component should handle resize without error
      expect(screen.getByTestId('editor-tabs')).toBeInTheDocument()
    })
  })

  describe('Style props', () => {
    it('applies custom accent color', () => {
      render(<EditorTabs accentColor="#ff0000" />)

      const activeTab = screen.getByTestId('tab-1')
      const style = activeTab.getAttribute('style')
      expect(style).toContain('--tab-accent')
    })

    it('respects tabBarStyle prop override', () => {
      render(<EditorTabs tabBarStyle="glass" />)

      const container = screen.getByTestId('editor-tabs')
      expect(container).toHaveAttribute('data-tab-bar-style', 'glass')
    })

    it('respects borderStyle prop override', () => {
      render(<EditorTabs borderStyle="sharp" />)

      const container = screen.getByTestId('editor-tabs')
      expect(container).toHaveAttribute('data-border-style', 'sharp')
    })

    it('respects activeTabStyle prop override', () => {
      render(<EditorTabs activeTabStyle="elevated" />)

      const container = screen.getByTestId('editor-tabs')
      expect(container).toHaveAttribute('data-active-tab-style', 'elevated')
    })
  })

  describe('Pinned tab behavior', () => {
    it('shows pinned class on pinned tabs', () => {
      render(<EditorTabs />)

      const missionControl = screen.getByTestId('tab-mission-control')
      expect(missionControl).toHaveClass('pinned')
    })

    it('does not show pinned class on unpinned tabs', () => {
      render(<EditorTabs />)

      const unpinnedTab = screen.getByTestId('tab-1')
      expect(unpinnedTab).not.toHaveClass('pinned')
    })
  })
})
