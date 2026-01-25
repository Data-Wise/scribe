import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { KeyboardShortcutHandler } from '../components/KeyboardShortcutHandler'
import type { SidebarTabId } from '../types'

// Mock the platform check
vi.mock('../lib/platform', () => ({
  isTauri: () => false
}))

describe('KeyboardShortcutHandler', () => {
  const mockProps = {
    focusMode: false,
    onFocusModeChange: vi.fn(),
    onCreateNote: vi.fn(),
    onDailyNote: vi.fn(),
    selectedNote: undefined,
    onExportDialogOpen: vi.fn(),
    onGraphViewOpen: vi.fn(),
    onSearchPanelOpen: vi.fn(),
    onQuickCaptureOpen: vi.fn(),
    onCreateProjectOpen: vi.fn(),
    onKeyboardShortcutsOpen: vi.fn(),
    onSettingsOpen: vi.fn(),
    onLeftSidebarToggle: vi.fn(),
    onRightSidebarToggle: vi.fn(),
    onCollapseAll: vi.fn(),
    rightSidebarCollapsed: false,
    openTabs: [
      { id: 'tab1', isPinned: false },
      { id: 'tab2', isPinned: true },
    ],
    activeTabId: 'tab1',
    onSetActiveTab: vi.fn(),
    onCloseTab: vi.fn(),
    onReopenLastClosedTab: vi.fn(),
    rightActiveTab: 'properties' as SidebarTabId,
    onRightActiveTabChange: vi.fn(),
    sidebarTabSettings: {
      tabOrder: ['properties', 'backlinks', 'tags', 'stats', 'claude', 'terminal'] as SidebarTabId[],
      hiddenTabs: [] as SidebarTabId[],
    },
    onExpandSmartIcon: vi.fn(),
    editorMode: 'source' as const,
    onEditorModeChange: vi.fn(),
    themeShortcuts: [],
    allThemes: {},
    onThemeChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing (headless component)', () => {
    const { container } = render(<KeyboardShortcutHandler {...mockProps} />)
    expect(container.firstChild).toBeNull()
  })

  it('handles focus mode toggle (Cmd+Shift+F)', () => {
    render(<KeyboardShortcutHandler {...mockProps} />)
    
    const event = new KeyboardEvent('keydown', {
      key: 'F',
      metaKey: true,
      shiftKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)
    
    expect(mockProps.onFocusModeChange).toHaveBeenCalledWith(true)
  })

  it('handles new note shortcut (Cmd+N)', () => {
    render(<KeyboardShortcutHandler {...mockProps} />)
    
    const event = new KeyboardEvent('keydown', {
      key: 'n',
      metaKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)
    
    expect(mockProps.onCreateNote).toHaveBeenCalled()
  })

  it('handles daily note shortcut (Cmd+D)', () => {
    render(<KeyboardShortcutHandler {...mockProps} />)
    
    const event = new KeyboardEvent('keydown', {
      key: 'd',
      metaKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)
    
    expect(mockProps.onDailyNote).toHaveBeenCalled()
  })

  it('handles search panel shortcut (Cmd+F)', () => {
    render(<KeyboardShortcutHandler {...mockProps} />)
    
    const event = new KeyboardEvent('keydown', {
      key: 'f',
      metaKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)
    
    expect(mockProps.onSearchPanelOpen).toHaveBeenCalled()
  })

  it('handles settings shortcut (Cmd+,)', () => {
    render(<KeyboardShortcutHandler {...mockProps} />)
    
    const event = new KeyboardEvent('keydown', {
      key: ',',
      metaKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)
    
    expect(mockProps.onSettingsOpen).toHaveBeenCalled()
  })

  it('handles tab switching (Cmd+1)', () => {
    render(<KeyboardShortcutHandler {...mockProps} />)
    
    const event = new KeyboardEvent('keydown', {
      key: '1',
      metaKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)
    
    expect(mockProps.onSetActiveTab).toHaveBeenCalledWith('tab1')
  })

  it('handles close tab shortcut (Cmd+W) - only closes non-pinned tabs', () => {
    render(<KeyboardShortcutHandler {...mockProps} />)
    
    const event = new KeyboardEvent('keydown', {
      key: 'w',
      metaKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)
    
    expect(mockProps.onCloseTab).toHaveBeenCalledWith('tab1')
  })

  it('does not close pinned tabs (Cmd+W)', () => {
    const propsWithPinnedTab = {
      ...mockProps,
      activeTabId: 'tab2', // tab2 is pinned
    }
    render(<KeyboardShortcutHandler {...propsWithPinnedTab} />)
    
    const event = new KeyboardEvent('keydown', {
      key: 'w',
      metaKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)
    
    expect(mockProps.onCloseTab).not.toHaveBeenCalled()
  })

  it('handles right sidebar tab navigation (Cmd+])', () => {
    render(<KeyboardShortcutHandler {...mockProps} />)
    
    const event = new KeyboardEvent('keydown', {
      key: ']',
      metaKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)
    
    expect(mockProps.onRightActiveTabChange).toHaveBeenCalledWith('backlinks')
  })

  it('handles right sidebar toggle (Cmd+Shift+])', () => {
    render(<KeyboardShortcutHandler {...mockProps} />)
    
    const event = new KeyboardEvent('keydown', {
      key: ']',
      metaKey: true,
      shiftKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)
    
    expect(mockProps.onRightSidebarToggle).toHaveBeenCalled()
  })

  it('handles left sidebar collapse (Cmd+Shift+[)', () => {
    render(<KeyboardShortcutHandler {...mockProps} />)
    
    const event = new KeyboardEvent('keydown', {
      key: '[',
      metaKey: true,
      shiftKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)
    
    expect(mockProps.onCollapseAll).toHaveBeenCalled()
  })

  it('exits focus mode on Escape key', () => {
    const propsInFocusMode = {
      ...mockProps,
      focusMode: true,
    }
    render(<KeyboardShortcutHandler {...propsInFocusMode} />)
    
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    })
    window.dispatchEvent(event)
    
    expect(mockProps.onFocusModeChange).toHaveBeenCalledWith(false)
  })
})
