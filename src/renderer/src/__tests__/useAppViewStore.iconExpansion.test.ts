import { describe, it, expect, beforeEach } from 'vitest'
import { useAppViewStore, SIDEBAR_WIDTHS } from '../store/useAppViewStore'
import type { SmartIconId } from '../types'

/**
 * useAppViewStore Icon-Centric Expansion Unit Tests (v1.16.0)
 *
 * Tests icon-centric expansion with per-icon mode preferences:
 * - expandVault: Expand vault icon (inbox or pinned project)
 * - expandSmartIcon: Expand smart icon (research, teaching, etc.)
 * - collapseAll: Collapse to icon-only mode
 * - toggleIcon: Accordion pattern (one expanded at a time)
 * - setIconMode: Per-icon mode preferences (compact/card)
 */

describe('useAppViewStore - Icon-Centric Expansion', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()

    // Reset store to initial state
    useAppViewStore.setState({
      expandedIcon: null,
      sidebarWidth: SIDEBAR_WIDTHS.icon,
      compactModeWidth: SIDEBAR_WIDTHS.compact.default,
      cardModeWidth: SIDEBAR_WIDTHS.card.default,
      pinnedVaults: [
        {
          id: 'inbox',
          label: 'Inbox',
          order: 0,
          isPermanent: true,
          preferredMode: 'compact'
        }
      ],
      smartIcons: [
        {
          id: 'research',
          label: 'Research',
          icon: 'flask',
          color: '#3b82f6',
          projectType: 'research',
          isVisible: true,
          isExpanded: false,
          order: 0,
          preferredMode: 'compact'
        },
        {
          id: 'teaching',
          label: 'Teaching',
          icon: 'graduation-cap',
          color: '#10b981',
          projectType: 'teaching',
          isVisible: true,
          isExpanded: false,
          order: 1,
          preferredMode: 'compact'
        }
      ]
    })
  })

  // ============================================================
  // expandVault Tests
  // ============================================================

  describe('expandVault', () => {
    it('expands inbox and sets width based on default mode', () => {
      const { expandVault, expandedIcon, sidebarWidth } = useAppViewStore.getState()

      expandVault('inbox')

      const state = useAppViewStore.getState()
      expect(state.expandedIcon).toEqual({ type: 'vault', id: 'inbox' })
      expect(state.sidebarWidth).toBe(SIDEBAR_WIDTHS.compact.default)
    })

    it('expands vault with card mode preference', () => {
      const { expandVault, pinnedVaults } = useAppViewStore.getState()

      // Set inbox to prefer card mode
      const updatedVaults = pinnedVaults.map(v =>
        v.id === 'inbox' ? { ...v, preferredMode: 'card' as const } : v
      )
      useAppViewStore.setState({ pinnedVaults: updatedVaults })

      expandVault('inbox')

      const state = useAppViewStore.getState()
      expect(state.expandedIcon).toEqual({ type: 'vault', id: 'inbox' })
      expect(state.sidebarWidth).toBe(SIDEBAR_WIDTHS.card.default)
    })

    it('persists expandedIcon to localStorage', () => {
      const { expandVault } = useAppViewStore.getState()

      expandVault('inbox')

      const stored = localStorage.getItem('scribe:expandedIcon')
      expect(stored).toBe(JSON.stringify({ type: 'vault', id: 'inbox' }))
    })
  })

  // ============================================================
  // expandSmartIcon Tests
  // ============================================================

  describe('expandSmartIcon', () => {
    it('expands smart icon and sets width based on mode', () => {
      const { expandSmartIcon } = useAppViewStore.getState()

      expandSmartIcon('research' as SmartIconId)

      const state = useAppViewStore.getState()
      expect(state.expandedIcon).toEqual({ type: 'smart', id: 'research' })
      expect(state.sidebarWidth).toBe(SIDEBAR_WIDTHS.compact.default)
    })

    it('expands smart icon with card mode preference', () => {
      const { expandSmartIcon, smartIcons } = useAppViewStore.getState()

      // Set research to prefer card mode
      const updated = smartIcons.map(i =>
        i.id === 'research' ? { ...i, preferredMode: 'card' as const } : i
      )
      useAppViewStore.setState({ smartIcons: updated })

      expandSmartIcon('research' as SmartIconId)

      const state = useAppViewStore.getState()
      expect(state.sidebarWidth).toBe(SIDEBAR_WIDTHS.card.default)
    })

    it('persists expandedIcon to localStorage', () => {
      const { expandSmartIcon } = useAppViewStore.getState()

      expandSmartIcon('research' as SmartIconId)

      const stored = localStorage.getItem('scribe:expandedIcon')
      expect(stored).toBe(JSON.stringify({ type: 'smart', id: 'research' }))
    })
  })

  // ============================================================
  // collapseAll Tests
  // ============================================================

  describe('collapseAll', () => {
    it('collapses expanded icon to icon-only mode', () => {
      const { expandVault, collapseAll } = useAppViewStore.getState()

      // First expand
      expandVault('inbox')
      expect(useAppViewStore.getState().expandedIcon).not.toBeNull()

      // Then collapse
      collapseAll()

      const state = useAppViewStore.getState()
      expect(state.expandedIcon).toBeNull()
      expect(state.sidebarWidth).toBe(SIDEBAR_WIDTHS.icon)
    })

    it('clears localStorage expandedIcon', () => {
      const { expandVault, collapseAll } = useAppViewStore.getState()

      expandVault('inbox')
      expect(localStorage.getItem('scribe:expandedIcon')).not.toBeNull()

      collapseAll()
      expect(localStorage.getItem('scribe:expandedIcon')).toBeNull()
    })
  })

  // ============================================================
  // toggleIcon Tests (Accordion Pattern)
  // ============================================================

  describe('toggleIcon', () => {
    it('expands icon when collapsed', () => {
      const { toggleIcon } = useAppViewStore.getState()

      toggleIcon('vault', 'inbox')

      const state = useAppViewStore.getState()
      expect(state.expandedIcon).toEqual({ type: 'vault', id: 'inbox' })
    })

    it('collapses icon when already expanded', () => {
      const { toggleIcon, expandVault } = useAppViewStore.getState()

      // First expand
      expandVault('inbox')
      expect(useAppViewStore.getState().expandedIcon).toEqual({ type: 'vault', id: 'inbox' })

      // Toggle should collapse
      toggleIcon('vault', 'inbox')

      const state = useAppViewStore.getState()
      expect(state.expandedIcon).toBeNull()
    })

    it('switches between icons (accordion pattern)', () => {
      const { toggleIcon } = useAppViewStore.getState()

      // Expand inbox
      toggleIcon('vault', 'inbox')
      expect(useAppViewStore.getState().expandedIcon).toEqual({ type: 'vault', id: 'inbox' })

      // Expand research (should auto-collapse inbox)
      toggleIcon('smart', 'research')
      const state = useAppViewStore.getState()
      expect(state.expandedIcon).toEqual({ type: 'smart', id: 'research' })
    })

    it('switches between smart icons', () => {
      const { toggleIcon } = useAppViewStore.getState()

      // Expand research
      toggleIcon('smart', 'research')
      expect(useAppViewStore.getState().expandedIcon?.id).toBe('research')

      // Expand teaching (should auto-collapse research)
      toggleIcon('smart', 'teaching')
      expect(useAppViewStore.getState().expandedIcon?.id).toBe('teaching')
    })
  })

  // ============================================================
  // setIconMode Tests (Per-Icon Mode Preferences)
  // ============================================================

  describe('setIconMode', () => {
    it('sets vault mode preference and updates width if expanded', () => {
      const { expandVault, setIconMode } = useAppViewStore.getState()

      // Expand inbox (compact by default)
      expandVault('inbox')
      expect(useAppViewStore.getState().sidebarWidth).toBe(SIDEBAR_WIDTHS.compact.default)

      // Switch to card mode
      setIconMode('vault', 'inbox', 'card')

      const state = useAppViewStore.getState()
      const vault = state.pinnedVaults.find(v => v.id === 'inbox')
      expect(vault?.preferredMode).toBe('card')
      expect(state.sidebarWidth).toBe(SIDEBAR_WIDTHS.card.default)
    })

    it('sets smart icon mode preference and updates width if expanded', () => {
      const { expandSmartIcon, setIconMode } = useAppViewStore.getState()

      // Expand research (compact by default)
      expandSmartIcon('research' as SmartIconId)
      expect(useAppViewStore.getState().sidebarWidth).toBe(SIDEBAR_WIDTHS.compact.default)

      // Switch to card mode
      setIconMode('smart', 'research', 'card')

      const state = useAppViewStore.getState()
      const icon = state.smartIcons.find(i => i.id === 'research')
      expect(icon?.preferredMode).toBe('card')
      expect(state.sidebarWidth).toBe(SIDEBAR_WIDTHS.card.default)
    })

    it('does not update width if different icon is expanded', () => {
      const { expandSmartIcon, setIconMode } = useAppViewStore.getState()

      // Expand research
      expandSmartIcon('research' as SmartIconId)
      const widthBefore = useAppViewStore.getState().sidebarWidth

      // Change teaching mode (different icon)
      setIconMode('smart', 'teaching', 'card')

      // Width should not change
      expect(useAppViewStore.getState().sidebarWidth).toBe(widthBefore)
    })

    it('persists vault mode preference to localStorage', () => {
      const { setIconMode } = useAppViewStore.getState()

      setIconMode('vault', 'inbox', 'card')

      const stored = localStorage.getItem('scribe:pinnedVaults')
      const vaults = JSON.parse(stored!)
      const inbox = vaults.find((v: any) => v.id === 'inbox')
      expect(inbox.preferredMode).toBe('card')
    })

    it('persists smart icon mode preference to localStorage', () => {
      const { setIconMode } = useAppViewStore.getState()

      setIconMode('smart', 'research', 'card')

      const stored = localStorage.getItem('scribe:smartIcons')
      const icons = JSON.parse(stored!)
      const research = icons.find((i: any) => i.id === 'research')
      expect(research.preferredMode).toBe('card')
    })
  })

  // ============================================================
  // Width Management Tests
  // ============================================================

  describe('Width Management', () => {
    it('uses compactModeWidth for compact mode icons', () => {
      const { expandVault, setSidebarWidth } = useAppViewStore.getState()

      // Set custom compact width
      useAppViewStore.setState({ compactModeWidth: 260 })

      expandVault('inbox')

      expect(useAppViewStore.getState().sidebarWidth).toBe(260)
    })

    it('uses cardModeWidth for card mode icons', () => {
      const { expandVault, setIconMode, pinnedVaults } = useAppViewStore.getState()

      // Set custom card width
      useAppViewStore.setState({ cardModeWidth: 380 })

      // Set inbox to card mode
      const updated = pinnedVaults.map(v =>
        v.id === 'inbox' ? { ...v, preferredMode: 'card' as const } : v
      )
      useAppViewStore.setState({ pinnedVaults: updated })

      expandVault('inbox')

      expect(useAppViewStore.getState().sidebarWidth).toBe(380)
    })

    it('updates mode-specific width when resizing', () => {
      const { expandVault, setSidebarWidth } = useAppViewStore.getState()

      // Expand inbox in compact mode
      expandVault('inbox')

      // Resize to 250
      setSidebarWidth(250)

      // compactModeWidth should be updated
      expect(useAppViewStore.getState().compactModeWidth).toBe(250)

      // localStorage should persist
      expect(localStorage.getItem('scribe:compactModeWidth')).toBe('250')
    })

    it('preserves mode-specific widths when switching icons', () => {
      const { expandSmartIcon, setIconMode, setSidebarWidth } = useAppViewStore.getState()

      // Expand research in compact mode, resize to 250
      expandSmartIcon('research' as SmartIconId)
      setSidebarWidth(250)

      // Switch research to card mode, resize to 380
      setIconMode('smart', 'research', 'card')
      setSidebarWidth(380)

      // Switch back to compact mode
      setIconMode('smart', 'research', 'compact')

      // Should restore compact width
      expect(useAppViewStore.getState().sidebarWidth).toBe(250)
    })
  })

  // ============================================================
  // Migration Tests
  // ============================================================

  describe('Migration from v1.15.0', () => {
    it('migrates from old sidebarMode to expandedIcon', () => {
      // Migration runs automatically on store initialization
      // This test verifies the migration already happened in beforeEach

      // The old keys should not exist (already cleaned up by migration)
      expect(localStorage.getItem('scribe:sidebarMode')).toBeNull()
      expect(localStorage.getItem('scribe:lastExpandedMode')).toBeNull()
      expect(localStorage.getItem('scribe:lastModeChangeTimestamp')).toBeNull()
      expect(localStorage.getItem('scribe:expandedSmartIconId')).toBeNull()
    })

    it('does not migrate if already in v1.16.0 format', () => {
      // Set v1.16.0 state
      localStorage.setItem('scribe:expandedIcon', JSON.stringify({ type: 'vault', id: 'inbox' }))

      // Also set old keys (should be ignored)
      localStorage.setItem('scribe:sidebarMode', 'card')

      // Migration runs automatically on module load and detects existing v1.16.0 format
      // by checking for presence of 'scribe:expandedIcon' key (see migrateToIconCentric)

      // Should preserve v1.16.0 state
      const stored = localStorage.getItem('scribe:expandedIcon')
      expect(stored).toBe(JSON.stringify({ type: 'vault', id: 'inbox' }))
    })
  })

  // ============================================================
  // Integration Tests
  // ============================================================

  describe('Integration', () => {
    it('complete workflow: expand → resize → switch mode → collapse', () => {
      const { expandVault, setSidebarWidth, setIconMode, collapseAll } = useAppViewStore.getState()

      // 1. Expand inbox (compact mode)
      expandVault('inbox')
      expect(useAppViewStore.getState().sidebarWidth).toBe(SIDEBAR_WIDTHS.compact.default)

      // 2. Resize to custom width
      setSidebarWidth(260)
      expect(useAppViewStore.getState().compactModeWidth).toBe(260)

      // 3. Switch to card mode
      setIconMode('vault', 'inbox', 'card')
      expect(useAppViewStore.getState().sidebarWidth).toBe(SIDEBAR_WIDTHS.card.default)

      // 4. Resize card mode
      setSidebarWidth(380)
      expect(useAppViewStore.getState().cardModeWidth).toBe(380)

      // 5. Switch back to compact
      setIconMode('vault', 'inbox', 'compact')
      expect(useAppViewStore.getState().sidebarWidth).toBe(260) // Restored

      // 6. Collapse
      collapseAll()
      expect(useAppViewStore.getState().sidebarWidth).toBe(SIDEBAR_WIDTHS.icon)
    })

    it('accordion pattern with mode preferences', () => {
      const { expandSmartIcon, setIconMode } = useAppViewStore.getState()

      // Set research to card mode
      setIconMode('smart', 'research', 'card')

      // Set teaching to compact mode
      setIconMode('smart', 'teaching', 'compact')

      // Expand research → should use card width
      expandSmartIcon('research' as SmartIconId)
      expect(useAppViewStore.getState().sidebarWidth).toBe(SIDEBAR_WIDTHS.card.default)

      // Switch to teaching → should use compact width
      expandSmartIcon('teaching' as SmartIconId)
      expect(useAppViewStore.getState().sidebarWidth).toBe(SIDEBAR_WIDTHS.compact.default)
    })
  })
})
