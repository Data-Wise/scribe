import { describe, it, expect, beforeEach } from 'vitest'
import { useTabStore } from '../store/useTabStore'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('useTabStore', () => {
  beforeEach(() => {
    localStorageMock.clear()
    // Reset store state
    useTabStore.setState({
      tabs: [{ id: 'home', type: 'home', title: 'Home', isPinned: true, isDirty: false }],
      activeTabId: 'home',
      closedTabs: [],
    })
  })

  describe('Initial State', () => {
    it('starts with home tab', () => {
      const state = useTabStore.getState()
      expect(state.tabs).toHaveLength(1)
      expect(state.tabs[0].type).toBe('home')
      expect(state.tabs[0].isPinned).toBe(true)
    })

    it('home tab is active by default', () => {
      const state = useTabStore.getState()
      expect(state.activeTabId).toBe('home')
    })
  })

  describe('openTab', () => {
    it('opens a new editor tab', () => {
      const { openTab } = useTabStore.getState()
      openTab('note-1', 'Test Note')

      const state = useTabStore.getState()
      expect(state.tabs).toHaveLength(2)
      expect(state.tabs[1].type).toBe('editor')
      expect(state.tabs[1].noteId).toBe('note-1')
      expect(state.tabs[1].title).toBe('Test Note')
    })

    it('switches to existing tab if note is already open', () => {
      const { openTab } = useTabStore.getState()
      openTab('note-1', 'Test Note')
      openTab('note-2', 'Another Note')
      openTab('note-1', 'Test Note') // Open same note again

      const state = useTabStore.getState()
      expect(state.tabs).toHaveLength(3)
      expect(state.activeTabId).toBe('editor-note-1')
    })

    it('sets new tab as active', () => {
      const { openTab } = useTabStore.getState()
      openTab('note-1', 'Test Note')

      const state = useTabStore.getState()
      expect(state.activeTabId).toBe('editor-note-1')
    })
  })

  describe('closeTab', () => {
    it('closes an editor tab', () => {
      const { openTab, closeTab } = useTabStore.getState()
      openTab('note-1', 'Test Note')
      closeTab('editor-note-1')

      const state = useTabStore.getState()
      expect(state.tabs).toHaveLength(1)
      expect(state.tabs[0].type).toBe('home')
    })

    it('cannot close home tab', () => {
      const { closeTab } = useTabStore.getState()
      closeTab('home')

      const state = useTabStore.getState()
      expect(state.tabs).toHaveLength(1)
      expect(state.tabs[0].id).toBe('home')
    })

    it('switches to previous tab when closing active tab', () => {
      const { openTab, closeTab } = useTabStore.getState()
      openTab('note-1', 'Note 1')
      openTab('note-2', 'Note 2')
      closeTab('editor-note-2')

      const state = useTabStore.getState()
      expect(state.activeTabId).toBe('editor-note-1')
    })

    it('switches to home when closing last editor tab', () => {
      const { openTab, closeTab } = useTabStore.getState()
      openTab('note-1', 'Note 1')
      closeTab('editor-note-1')

      const state = useTabStore.getState()
      expect(state.activeTabId).toBe('home')
    })

    it('adds closed tab to history', () => {
      const { openTab, closeTab } = useTabStore.getState()
      openTab('note-1', 'Test Note')
      closeTab('editor-note-1')

      const state = useTabStore.getState()
      expect(state.closedTabs).toHaveLength(1)
      expect(state.closedTabs[0].noteId).toBe('note-1')
    })
  })

  describe('closeOtherTabs', () => {
    it('closes all tabs except specified and home', () => {
      const { openTab, closeOtherTabs } = useTabStore.getState()
      openTab('note-1', 'Note 1')
      openTab('note-2', 'Note 2')
      openTab('note-3', 'Note 3')
      closeOtherTabs('editor-note-2')

      const state = useTabStore.getState()
      expect(state.tabs).toHaveLength(2)
      expect(state.tabs[0].id).toBe('home')
      expect(state.tabs[1].id).toBe('editor-note-2')
    })
  })

  describe('closeAllEditorTabs', () => {
    it('closes all editor tabs, keeps home', () => {
      const { openTab, closeAllEditorTabs } = useTabStore.getState()
      openTab('note-1', 'Note 1')
      openTab('note-2', 'Note 2')
      closeAllEditorTabs()

      const state = useTabStore.getState()
      expect(state.tabs).toHaveLength(1)
      expect(state.tabs[0].id).toBe('home')
      expect(state.activeTabId).toBe('home')
    })
  })

  describe('setActiveTab', () => {
    it('switches to specified tab', () => {
      const { openTab, setActiveTab } = useTabStore.getState()
      openTab('note-1', 'Note 1')
      openTab('note-2', 'Note 2')
      setActiveTab('editor-note-1')

      const state = useTabStore.getState()
      expect(state.activeTabId).toBe('editor-note-1')
    })

    it('ignores invalid tab id', () => {
      const { setActiveTab } = useTabStore.getState()
      setActiveTab('nonexistent')

      const state = useTabStore.getState()
      expect(state.activeTabId).toBe('home')
    })
  })

  describe('updateTabTitle', () => {
    it('updates tab title', () => {
      const { openTab, updateTabTitle } = useTabStore.getState()
      openTab('note-1', 'Original Title')
      updateTabTitle('editor-note-1', 'New Title')

      const state = useTabStore.getState()
      expect(state.tabs[1].title).toBe('New Title')
    })
  })

  describe('setTabDirty', () => {
    it('sets tab dirty state', () => {
      const { openTab, setTabDirty } = useTabStore.getState()
      openTab('note-1', 'Test Note')
      setTabDirty('editor-note-1', true)

      const state = useTabStore.getState()
      expect(state.tabs[1].isDirty).toBe(true)
    })
  })

  describe('reopenLastClosed', () => {
    it('reopens last closed tab', () => {
      const { openTab, closeTab, reopenLastClosed } = useTabStore.getState()
      openTab('note-1', 'Test Note')
      closeTab('editor-note-1')
      reopenLastClosed()

      const state = useTabStore.getState()
      expect(state.tabs).toHaveLength(2)
      expect(state.tabs[1].noteId).toBe('note-1')
    })

    it('does nothing if no closed tabs', () => {
      const { reopenLastClosed } = useTabStore.getState()
      reopenLastClosed()

      const state = useTabStore.getState()
      expect(state.tabs).toHaveLength(1)
    })
  })

  describe('goToHomeTab', () => {
    it('switches to home tab', () => {
      const { openTab, goToHomeTab } = useTabStore.getState()
      openTab('note-1', 'Test Note')
      goToHomeTab()

      const state = useTabStore.getState()
      expect(state.activeTabId).toBe('home')
    })
  })

  describe('reorderTabs', () => {
    it('reorders editor tabs', () => {
      const { openTab, reorderTabs } = useTabStore.getState()
      openTab('note-1', 'Note 1')
      openTab('note-2', 'Note 2')
      openTab('note-3', 'Note 3')
      reorderTabs(1, 3) // Move Note 1 to end

      const state = useTabStore.getState()
      expect(state.tabs[1].noteId).toBe('note-2')
      expect(state.tabs[2].noteId).toBe('note-3')
      expect(state.tabs[3].noteId).toBe('note-1')
    })

    it('cannot move home tab', () => {
      const { openTab, reorderTabs } = useTabStore.getState()
      openTab('note-1', 'Note 1')
      reorderTabs(0, 1) // Try to move home tab

      const state = useTabStore.getState()
      expect(state.tabs[0].id).toBe('home')
    })

    it('cannot move tab to home position', () => {
      const { openTab, reorderTabs } = useTabStore.getState()
      openTab('note-1', 'Note 1')
      reorderTabs(1, 0) // Try to move to home position

      const state = useTabStore.getState()
      expect(state.tabs[0].id).toBe('home')
      expect(state.tabs[1].noteId).toBe('note-1')
    })
  })
})
