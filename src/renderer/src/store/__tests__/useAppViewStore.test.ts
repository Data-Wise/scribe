import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useAppViewStore, MISSION_CONTROL_TAB_ID, SIDEBAR_WIDTHS } from '../useAppViewStore'
import type { SidebarMode, EditorTab } from '../useAppViewStore'

/**
 * useAppViewStore Test Suite
 *
 * Coverage targets:
 * - Sidebar mode management (set, cycle, toggle)
 * - Sidebar width constraints
 * - Tab CRUD operations (open, close, pin, unpin, reorder)
 * - Mission Control tab enforcement
 * - Closed tabs history (max 10)
 * - Active tab selection
 * - localStorage persistence
 * - Session tracking
 *
 * Test approach:
 * - Mock localStorage to test persistence
 * - Render hook in isolation for each test
 * - Use act() for state updates
 * - Verify state and localStorage calls
 */

describe('useAppViewStore', () => {
  // localStorage mock
  let localStorageMock: Record<string, string>

  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useAppViewStore())
    act(() => {
      // Reset to defaults
      result.current.setSidebarMode('compact')
      result.current.setSidebarWidth(SIDEBAR_WIDTHS.compact.default)
      // Clear all tabs except Mission Control
      result.current.openTabs.forEach(tab => {
        if (tab.id !== MISSION_CONTROL_TAB_ID && !tab.isPinned) {
          result.current.closeTab(tab.id)
        }
      })
    })

    // Mock localStorage
    localStorageMock = {}
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key]
      }),
      clear: vi.fn(() => {
        localStorageMock = {}
      }),
      key: vi.fn(),
      length: 0
    } as Storage
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with compact sidebar mode by default', () => {
      const { result } = renderHook(() => useAppViewStore())
      expect(result.current.sidebarMode).toBe('compact')
    })

    it('should initialize with Mission Control tab open', () => {
      const { result } = renderHook(() => useAppViewStore())
      expect(result.current.openTabs).toHaveLength(1)
      expect(result.current.openTabs[0].id).toBe(MISSION_CONTROL_TAB_ID)
      expect(result.current.openTabs[0].isPinned).toBe(true)
    })

    it('should set Mission Control as active tab initially', () => {
      const { result } = renderHook(() => useAppViewStore())
      expect(result.current.activeTabId).toBe(MISSION_CONTROL_TAB_ID)
    })

    it('should initialize with default sidebar width', () => {
      const { result } = renderHook(() => useAppViewStore())
      expect(result.current.sidebarWidth).toBe(SIDEBAR_WIDTHS.compact.default)
    })

    it('should initialize with empty closed tabs history', () => {
      const { result } = renderHook(() => useAppViewStore())
      expect(result.current.closedTabsHistory).toEqual([])
    })

    it('should initialize with null lastActiveNoteId', () => {
      const { result } = renderHook(() => useAppViewStore())
      expect(result.current.lastActiveNoteId).toBeNull()
    })
  })

  describe('Sidebar Mode Management', () => {
    it('should set sidebar mode and persist to localStorage', () => {
      const { result } = renderHook(() => useAppViewStore())

      act(() => {
        result.current.setSidebarMode('card')
      })

      expect(result.current.sidebarMode).toBe('card')
      expect(localStorage.setItem).toHaveBeenCalledWith('scribe:sidebarMode', 'card')
    })

    it('should cycle sidebar modes in order: icon → compact → card → icon', () => {
      const { result } = renderHook(() => useAppViewStore())

      // Start at compact
      expect(result.current.sidebarMode).toBe('compact')

      // Cycle to card
      act(() => {
        result.current.cycleSidebarMode()
      })
      expect(result.current.sidebarMode).toBe('card')

      // Cycle to icon
      act(() => {
        result.current.cycleSidebarMode()
      })
      expect(result.current.sidebarMode).toBe('icon')

      // Cycle back to compact
      act(() => {
        result.current.cycleSidebarMode()
      })
      expect(result.current.sidebarMode).toBe('compact')
    })

    it('should toggle between icon (collapsed) and compact (expanded)', () => {
      const { result } = renderHook(() => useAppViewStore())

      // Start at compact
      expect(result.current.sidebarMode).toBe('compact')

      // Toggle to icon
      act(() => {
        result.current.toggleSidebarCollapsed()
      })
      expect(result.current.sidebarMode).toBe('icon')

      // Toggle back to compact
      act(() => {
        result.current.toggleSidebarCollapsed()
      })
      expect(result.current.sidebarMode).toBe('compact')
    })

    it('should toggle from card to icon (not compact)', () => {
      const { result } = renderHook(() => useAppViewStore())

      // Set to card first
      act(() => {
        result.current.setSidebarMode('card')
      })

      // Toggle should go to icon
      act(() => {
        result.current.toggleSidebarCollapsed()
      })
      expect(result.current.sidebarMode).toBe('icon')
    })
  })

  describe('Sidebar Width Constraints', () => {
    it('should set sidebar width within compact constraints', () => {
      const { result } = renderHook(() => useAppViewStore())

      act(() => {
        result.current.setSidebarMode('compact')
        result.current.setSidebarWidth(250)
      })

      expect(result.current.sidebarWidth).toBe(250)
    })

    it('should constrain width to compact minimum', () => {
      const { result } = renderHook(() => useAppViewStore())

      act(() => {
        result.current.setSidebarMode('compact')
        result.current.setSidebarWidth(100) // Below minimum
      })

      expect(result.current.sidebarWidth).toBe(SIDEBAR_WIDTHS.compact.min)
    })

    it('should constrain width to compact maximum', () => {
      const { result } = renderHook(() => useAppViewStore())

      act(() => {
        result.current.setSidebarMode('compact')
        result.current.setSidebarWidth(400) // Above maximum
      })

      expect(result.current.sidebarWidth).toBe(SIDEBAR_WIDTHS.compact.max)
    })

    it('should constrain width to card minimum', () => {
      const { result } = renderHook(() => useAppViewStore())

      act(() => {
        result.current.setSidebarMode('card')
        result.current.setSidebarWidth(200) // Below card minimum
      })

      expect(result.current.sidebarWidth).toBe(SIDEBAR_WIDTHS.card.min)
    })

    it('should constrain width to card maximum', () => {
      const { result } = renderHook(() => useAppViewStore())

      act(() => {
        result.current.setSidebarMode('card')
        result.current.setSidebarWidth(600) // Above maximum
      })

      expect(result.current.sidebarWidth).toBe(SIDEBAR_WIDTHS.card.max)
    })

    it('should not constrain width in icon mode', () => {
      const { result } = renderHook(() => useAppViewStore())

      act(() => {
        result.current.setSidebarMode('icon')
        result.current.setSidebarWidth(1000)
      })

      // Icon mode doesn't constrain, so width should be set as-is
      expect(result.current.sidebarWidth).toBe(1000)
    })

    it('should persist sidebar width to localStorage', () => {
      const { result } = renderHook(() => useAppViewStore())

      act(() => {
        result.current.setSidebarWidth(350)
      })

      expect(localStorage.setItem).toHaveBeenCalledWith('scribe:sidebarWidth', '350')
    })
  })

  describe('Tab Management - Opening Tabs', () => {
    it('should open a new tab and return tab ID', () => {
      const { result } = renderHook(() => useAppViewStore())

      let tabId: string = ''
      act(() => {
        tabId = result.current.openTab({
          type: 'note',
          noteId: 'note-1',
          title: 'Test Note',
          isPinned: false
        })
      })

      expect(tabId).toBeTruthy()
      expect(result.current.openTabs).toHaveLength(2) // Mission Control + new tab
      expect(result.current.activeTabId).toBe(tabId)
    })

    it('should add new tabs after pinned tabs', () => {
      const { result } = renderHook(() => useAppViewStore())

      let tabId1: string = ''
      let tabId2: string = ''

      act(() => {
        tabId1 = result.current.openTab({
          type: 'note',
          noteId: 'note-1',
          title: 'Note 1',
          isPinned: false
        })

        // Pin the first tab
        result.current.pinTab(tabId1)

        // Open second tab
        tabId2 = result.current.openTab({
          type: 'note',
          noteId: 'note-2',
          title: 'Note 2',
          isPinned: false
        })
      })

      // Order should be: Mission Control (pinned), Note 1 (pinned), Note 2 (unpinned)
      expect(result.current.openTabs[0].id).toBe(MISSION_CONTROL_TAB_ID)
      expect(result.current.openTabs[1].id).toBe(tabId1)
      expect(result.current.openTabs[2].id).toBe(tabId2)
    })

    it('should not open duplicate note tabs', () => {
      const { result } = renderHook(() => useAppViewStore())

      let tabId: string = ''
      act(() => {
        tabId = result.current.openTab({
          type: 'note',
          noteId: 'note-1',
          title: 'Test Note',
          isPinned: false
        })

        // Try to open same note again
        result.current.openNoteTab('note-1', 'Test Note')
      })

      // Should still only have 2 tabs (Mission Control + note-1)
      expect(result.current.openTabs).toHaveLength(2)
      expect(result.current.activeTabId).toBe(tabId) // Active tab should be the existing one
    })

    it('should activate existing tab when opening duplicate note', () => {
      const { result } = renderHook(() => useAppViewStore())

      let tabId1: string = ''
      let tabId2: string = ''

      act(() => {
        tabId1 = result.current.openTab({
          type: 'note',
          noteId: 'note-1',
          title: 'Note 1',
          isPinned: false
        })

        tabId2 = result.current.openTab({
          type: 'note',
          noteId: 'note-2',
          title: 'Note 2',
          isPinned: false
        })

        // Make tabId2 active
        result.current.setActiveTab(tabId2)

        // Try to open note-1 again (should activate tabId1)
        result.current.openNoteTab('note-1', 'Note 1')
      })

      expect(result.current.activeTabId).toBe(tabId1)
      expect(result.current.openTabs).toHaveLength(3) // No new tab created
    })

    it('should use "Untitled" for note tabs without title', () => {
      const { result } = renderHook(() => useAppViewStore())

      act(() => {
        result.current.openNoteTab('note-1', '')
      })

      const noteTab = result.current.openTabs.find(t => t.noteId === 'note-1')
      expect(noteTab?.title).toBe('Untitled')
    })
  })

  describe('Tab Management - Closing Tabs', () => {
    it('should close unpinned tab', () => {
      const { result } = renderHook(() => useAppViewStore())

      let tabId: string = ''
      act(() => {
        tabId = result.current.openTab({
          type: 'note',
          noteId: 'note-1',
          title: 'Test Note',
          isPinned: false
        })

        result.current.closeTab(tabId)
      })

      expect(result.current.openTabs).toHaveLength(1) // Only Mission Control left
      expect(result.current.openTabs[0].id).toBe(MISSION_CONTROL_TAB_ID)
    })

    it('should not close pinned tabs', () => {
      const { result } = renderHook(() => useAppViewStore())

      // Try to close Mission Control (always pinned)
      act(() => {
        result.current.closeTab(MISSION_CONTROL_TAB_ID)
      })

      expect(result.current.openTabs).toHaveLength(1)
      expect(result.current.openTabs[0].id).toBe(MISSION_CONTROL_TAB_ID)
    })

    it('should add closed tab to history', () => {
      const { result } = renderHook(() => useAppViewStore())

      let tabId: string = ''
      act(() => {
        tabId = result.current.openTab({
          type: 'note',
          noteId: 'note-1',
          title: 'Test Note',
          isPinned: false
        })

        result.current.closeTab(tabId)
      })

      expect(result.current.closedTabsHistory).toHaveLength(1)
      expect(result.current.closedTabsHistory[0].noteId).toBe('note-1')
    })

    it('should limit closed tabs history to 10 items', () => {
      const { result } = renderHook(() => useAppViewStore())

      act(() => {
        // Open and close 15 tabs
        for (let i = 1; i <= 15; i++) {
          const tabId = result.current.openTab({
            type: 'note',
            noteId: `note-${i}`,
            title: `Note ${i}`,
            isPinned: false
          })
          result.current.closeTab(tabId)
        }
      })

      // Should only keep last 10
      expect(result.current.closedTabsHistory).toHaveLength(10)
      // Most recent should be first
      expect(result.current.closedTabsHistory[0].noteId).toBe('note-15')
      expect(result.current.closedTabsHistory[9].noteId).toBe('note-6')
    })

    it('should select previous tab when closing active tab', () => {
      const { result } = renderHook(() => useAppViewStore())

      let tabId1: string = ''
      let tabId2: string = ''

      act(() => {
        tabId1 = result.current.openTab({
          type: 'note',
          noteId: 'note-1',
          title: 'Note 1',
          isPinned: false
        })

        tabId2 = result.current.openTab({
          type: 'note',
          noteId: 'note-2',
          title: 'Note 2',
          isPinned: false
        })

        // tabId2 is now active, close it
        result.current.closeTab(tabId2)
      })

      // Should select tabId1
      expect(result.current.activeTabId).toBe(tabId1)
    })

    it('should select next tab when closing first active tab', () => {
      const { result } = renderHook(() => useAppViewStore())

      let tabId1: string = ''
      let tabId2: string = ''

      act(() => {
        tabId1 = result.current.openTab({
          type: 'note',
          noteId: 'note-1',
          title: 'Note 1',
          isPinned: false
        })

        tabId2 = result.current.openTab({
          type: 'note',
          noteId: 'note-2',
          title: 'Note 2',
          isPinned: false
        })

        // Make tabId1 active
        result.current.setActiveTab(tabId1)

        // Close tabId1
        result.current.closeTab(tabId1)
      })

      // Should select tabId2
      expect(result.current.activeTabId).toBe(tabId2)
    })

    it('should fallback to Mission Control when closing last unpinned tab', () => {
      const { result } = renderHook(() => useAppViewStore())

      let tabId: string = ''

      act(() => {
        tabId = result.current.openTab({
          type: 'note',
          noteId: 'note-1',
          title: 'Note 1',
          isPinned: false
        })

        // Close the only note tab
        result.current.closeTab(tabId)
      })

      expect(result.current.activeTabId).toBe(MISSION_CONTROL_TAB_ID)
    })

    it('should persist tab state to localStorage after closing', () => {
      const { result } = renderHook(() => useAppViewStore())

      let tabId: string = ''

      act(() => {
        tabId = result.current.openTab({
          type: 'note',
          noteId: 'note-1',
          title: 'Test Note',
          isPinned: false
        })

        result.current.closeTab(tabId)
      })

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'scribe:openTabs',
        expect.any(String)
      )
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'scribe:activeTabId',
        MISSION_CONTROL_TAB_ID
      )
    })
  })

  describe('Tab Management - Reopening Closed Tabs', () => {
    it('should reopen last closed tab', () => {
      const { result } = renderHook(() => useAppViewStore())

      let tabId: string = ''

      act(() => {
        tabId = result.current.openTab({
          type: 'note',
          noteId: 'note-1',
          title: 'Test Note',
          isPinned: false
        })

        result.current.closeTab(tabId)
        result.current.reopenLastClosedTab()
      })

      // Tab should be reopened
      expect(result.current.openTabs).toHaveLength(2)
      const reopenedTab = result.current.openTabs.find(t => t.noteId === 'note-1')
      expect(reopenedTab).toBeTruthy()
      expect(result.current.activeTabId).toBe(reopenedTab?.id)
    })

    it('should remove reopened tab from history', () => {
      const { result } = renderHook(() => useAppViewStore())

      act(() => {
        const tabId = result.current.openTab({
          type: 'note',
          noteId: 'note-1',
          title: 'Test Note',
          isPinned: false
        })

        result.current.closeTab(tabId)
        expect(result.current.closedTabsHistory).toHaveLength(1)

        result.current.reopenLastClosedTab()
      })

      expect(result.current.closedTabsHistory).toHaveLength(0)
    })

    it('should do nothing if history is empty', () => {
      const { result } = renderHook(() => useAppViewStore())

      const initialTabCount = result.current.openTabs.length

      act(() => {
        result.current.reopenLastClosedTab()
      })

      expect(result.current.openTabs).toHaveLength(initialTabCount)
    })

    it('should activate existing tab if note is already open', () => {
      const { result } = renderHook(() => useAppViewStore())

      let originalTabId: string = ''

      act(() => {
        // Open note-1
        originalTabId = result.current.openTab({
          type: 'note',
          noteId: 'note-1',
          title: 'Test Note',
          isPinned: false
        })

        // Open note-2
        const tabId2 = result.current.openTab({
          type: 'note',
          noteId: 'note-2',
          title: 'Note 2',
          isPinned: false
        })

        // Close note-2 (adds to history)
        result.current.closeTab(tabId2)

        // Manually open note-2 again (different tab ID)
        result.current.openNoteTab('note-2', 'Note 2')

        // Try to reopen from history - should just activate existing
        result.current.reopenLastClosedTab()
      })

      // Should have 3 tabs: Mission Control, note-1, note-2 (not duplicated)
      expect(result.current.openTabs).toHaveLength(3)

      // Active tab should be the existing note-2 tab
      const note2Tab = result.current.openTabs.find(t => t.noteId === 'note-2')
      expect(result.current.activeTabId).toBe(note2Tab?.id)
    })
  })

  describe('Tab Management - Pinning', () => {
    it('should pin unpinned tab', () => {
      const { result } = renderHook(() => useAppViewStore())

      let tabId: string = ''

      act(() => {
        tabId = result.current.openTab({
          type: 'note',
          noteId: 'note-1',
          title: 'Test Note',
          isPinned: false
        })

        result.current.pinTab(tabId)
      })

      const tab = result.current.openTabs.find(t => t.id === tabId)
      expect(tab?.isPinned).toBe(true)
    })

    it('should move pinned tab to end of pinned section', () => {
      const { result } = renderHook(() => useAppViewStore())

      let tabId1: string = ''
      let tabId2: string = ''

      act(() => {
        tabId1 = result.current.openTab({
          type: 'note',
          noteId: 'note-1',
          title: 'Note 1',
          isPinned: false
        })

        tabId2 = result.current.openTab({
          type: 'note',
          noteId: 'note-2',
          title: 'Note 2',
          isPinned: false
        })

        // Pin tabId2
        result.current.pinTab(tabId2)
      })

      // Order: Mission Control (pinned), Note 2 (pinned), Note 1 (unpinned)
      expect(result.current.openTabs[0].id).toBe(MISSION_CONTROL_TAB_ID)
      expect(result.current.openTabs[1].id).toBe(tabId2)
      expect(result.current.openTabs[2].id).toBe(tabId1)
    })

    it('should unpin tab that is not Mission Control', () => {
      const { result } = renderHook(() => useAppViewStore())

      let tabId: string = ''

      act(() => {
        tabId = result.current.openTab({
          type: 'note',
          noteId: 'note-1',
          title: 'Test Note',
          isPinned: false
        })

        result.current.pinTab(tabId)
        result.current.unpinTab(tabId)
      })

      const tab = result.current.openTabs.find(t => t.id === tabId)
      expect(tab?.isPinned).toBe(false)
    })

    it('should not unpin Mission Control tab', () => {
      const { result } = renderHook(() => useAppViewStore())

      act(() => {
        result.current.unpinTab(MISSION_CONTROL_TAB_ID)
      })

      const missionControl = result.current.openTabs.find(t => t.id === MISSION_CONTROL_TAB_ID)
      expect(missionControl?.isPinned).toBe(true)
    })

    it('should do nothing when pinning already pinned tab', () => {
      const { result } = renderHook(() => useAppViewStore())

      const initialState = [...result.current.openTabs]

      act(() => {
        result.current.pinTab(MISSION_CONTROL_TAB_ID)
      })

      expect(result.current.openTabs).toEqual(initialState)
    })
  })

  describe('Tab Management - Reordering', () => {
    it('should reorder unpinned tabs', () => {
      const { result } = renderHook(() => useAppViewStore())

      let tabId1: string = ''
      let tabId2: string = ''
      let tabId3: string = ''

      act(() => {
        tabId1 = result.current.openTab({
          type: 'note',
          noteId: 'note-1',
          title: 'Note 1',
          isPinned: false
        })

        tabId2 = result.current.openTab({
          type: 'note',
          noteId: 'note-2',
          title: 'Note 2',
          isPinned: false
        })

        tabId3 = result.current.openTab({
          type: 'note',
          noteId: 'note-3',
          title: 'Note 3',
          isPinned: false
        })

        // Move tab at index 2 (tabId2) to index 3 (tabId3 position)
        result.current.reorderTabs(2, 3)
      })

      // Order should now be: Mission Control, tabId1, tabId3, tabId2
      expect(result.current.openTabs[0].id).toBe(MISSION_CONTROL_TAB_ID)
      expect(result.current.openTabs[1].id).toBe(tabId1)
      expect(result.current.openTabs[2].id).toBe(tabId3)
      expect(result.current.openTabs[3].id).toBe(tabId2)
    })

    it('should not allow moving pinned tabs', () => {
      const { result } = renderHook(() => useAppViewStore())

      const initialState = [...result.current.openTabs]

      act(() => {
        // Try to move Mission Control (index 0)
        result.current.reorderTabs(0, 1)
      })

      expect(result.current.openTabs).toEqual(initialState)
    })

    it('should not allow moving tabs before pinned tabs', () => {
      const { result } = renderHook(() => useAppViewStore())

      let tabId: string = ''

      act(() => {
        tabId = result.current.openTab({
          type: 'note',
          noteId: 'note-1',
          title: 'Note 1',
          isPinned: false
        })

        // Try to move unpinned tab (index 1) before Mission Control (index 0)
        result.current.reorderTabs(1, 0)
      })

      // Order should remain: Mission Control, tabId
      expect(result.current.openTabs[0].id).toBe(MISSION_CONTROL_TAB_ID)
      expect(result.current.openTabs[1].id).toBe(tabId)
    })
  })

  describe('Tab Management - Updating', () => {
    it('should update tab title', () => {
      const { result } = renderHook(() => useAppViewStore())

      let tabId: string = ''

      act(() => {
        tabId = result.current.openTab({
          type: 'note',
          noteId: 'note-1',
          title: 'Old Title',
          isPinned: false
        })

        result.current.updateTabTitle(tabId, 'New Title')
      })

      const tab = result.current.openTabs.find(t => t.id === tabId)
      expect(tab?.title).toBe('New Title')
    })

    it('should persist tab title update to localStorage', () => {
      const { result } = renderHook(() => useAppViewStore())

      let tabId: string = ''

      act(() => {
        tabId = result.current.openTab({
          type: 'note',
          noteId: 'note-1',
          title: 'Old Title',
          isPinned: false
        })

        result.current.updateTabTitle(tabId, 'New Title')
      })

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'scribe:openTabs',
        expect.any(String)
      )
    })

    it('should set active tab', () => {
      const { result } = renderHook(() => useAppViewStore())

      let tabId: string = ''

      act(() => {
        tabId = result.current.openTab({
          type: 'note',
          noteId: 'note-1',
          title: 'Test Note',
          isPinned: false
        })

        // Switch back to Mission Control
        result.current.setActiveTab(MISSION_CONTROL_TAB_ID)
      })

      expect(result.current.activeTabId).toBe(MISSION_CONTROL_TAB_ID)
    })

    it('should persist active tab to localStorage', () => {
      const { result } = renderHook(() => useAppViewStore())

      let tabId: string = ''

      act(() => {
        tabId = result.current.openTab({
          type: 'note',
          noteId: 'note-1',
          title: 'Test Note',
          isPinned: false
        })

        result.current.setActiveTab(MISSION_CONTROL_TAB_ID)
      })

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'scribe:activeTabId',
        MISSION_CONTROL_TAB_ID
      )
    })
  })

  describe('Session Tracking', () => {
    it('should set last active note ID', () => {
      const { result } = renderHook(() => useAppViewStore())

      act(() => {
        result.current.setLastActiveNote('note-123')
      })

      expect(result.current.lastActiveNoteId).toBe('note-123')
    })

    it('should persist last active note to localStorage', () => {
      const { result } = renderHook(() => useAppViewStore())

      act(() => {
        result.current.setLastActiveNote('note-123')
      })

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'scribe:lastActiveNoteId',
        'note-123'
      )
    })

    it('should clear last active note when set to null', () => {
      const { result } = renderHook(() => useAppViewStore())

      act(() => {
        result.current.setLastActiveNote('note-123')
        result.current.setLastActiveNote(null)
      })

      expect(result.current.lastActiveNoteId).toBeNull()
      expect(localStorage.removeItem).toHaveBeenCalledWith('scribe:lastActiveNoteId')
    })

    it('should update session timestamp', () => {
      const { result } = renderHook(() => useAppViewStore())

      act(() => {
        result.current.updateSessionTimestamp()
      })

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'scribe:lastSessionTimestamp',
        expect.any(String)
      )
    })
  })

  describe('localStorage Error Handling', () => {
    it('should handle localStorage errors gracefully when saving', () => {
      const { result } = renderHook(() => useAppViewStore())

      // Mock localStorage.setItem to throw
      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      // Should not throw
      expect(() => {
        act(() => {
          result.current.setSidebarMode('card')
        })
      }).not.toThrow()

      // State should still update
      expect(result.current.sidebarMode).toBe('card')
    })

    it('should handle localStorage errors when removing items', () => {
      const { result } = renderHook(() => useAppViewStore())

      // Mock localStorage.removeItem to throw
      vi.mocked(localStorage.removeItem).mockImplementation(() => {
        throw new Error('Storage error')
      })

      // Should not throw
      expect(() => {
        act(() => {
          result.current.setLastActiveNote(null)
        })
      }).not.toThrow()

      // State should still update
      expect(result.current.lastActiveNoteId).toBeNull()
    })
  })

  describe('Mission Control Tab Enforcement', () => {
    it('should always have Mission Control tab first', () => {
      const { result } = renderHook(() => useAppViewStore())

      act(() => {
        result.current.openTab({
          type: 'note',
          noteId: 'note-1',
          title: 'Note 1',
          isPinned: false
        })

        result.current.openTab({
          type: 'note',
          noteId: 'note-2',
          title: 'Note 2',
          isPinned: false
        })
      })

      expect(result.current.openTabs[0].id).toBe(MISSION_CONTROL_TAB_ID)
      expect(result.current.openTabs[0].isPinned).toBe(true)
    })

    it('should keep Mission Control pinned at all times', () => {
      const { result } = renderHook(() => useAppViewStore())

      const missionControl = result.current.openTabs.find(t => t.id === MISSION_CONTROL_TAB_ID)
      expect(missionControl?.isPinned).toBe(true)
    })
  })
})
