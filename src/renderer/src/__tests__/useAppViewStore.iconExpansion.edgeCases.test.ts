import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAppViewStore, SIDEBAR_WIDTHS } from '../store/useAppViewStore'
import type { SmartIconId } from '../types'

/**
 * Icon-Centric Expansion - Edge Cases and Error Handling (v1.16.0)
 *
 * Comprehensive edge case testing for Phase 1 state refactor:
 * - Invalid state recovery
 * - Boundary value constraints
 * - Race conditions
 * - Missing data handling
 * - localStorage failure scenarios
 */

describe('useAppViewStore Icon Expansion - Edge Cases', () => {
  beforeEach(() => {
    localStorage.clear()

    // Reset to initial state
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
        }
      ],
      projectTypeFilter: null,
      openTabs: [],
      activeTabId: null,
      closedTabsHistory: [],
      recentNotes: [],
      lastActiveNoteId: null
    })
  })

  // ============================================================
  // Invalid State Recovery
  // ============================================================

  describe('Invalid State Recovery', () => {
    it('recovers from corrupted expandedIcon JSON in localStorage', () => {
      // Set invalid JSON
      localStorage.setItem('scribe:expandedIcon', '{invalid json')

      // Re-initialize store by clearing and re-setting
      const { expandVault } = useAppViewStore.getState()

      // Should not crash, defaults to null
      expect(useAppViewStore.getState().expandedIcon).toBeNull()

      // Should still allow expansion
      expandVault('inbox')
      expect(useAppViewStore.getState().expandedIcon).toEqual({
        type: 'vault',
        id: 'inbox'
      })
    })

    it('recovers from invalid compactModeWidth in localStorage', () => {
      localStorage.setItem('scribe:compactModeWidth', 'not-a-number')

      // Should use default
      expect(useAppViewStore.getState().compactModeWidth).toBe(SIDEBAR_WIDTHS.compact.default)
    })

    it('recovers from invalid cardModeWidth in localStorage', () => {
      localStorage.setItem('scribe:cardModeWidth', 'invalid')

      // Should use default
      expect(useAppViewStore.getState().cardModeWidth).toBe(SIDEBAR_WIDTHS.card.default)
    })

    it('recovers from out-of-bounds compactModeWidth', () => {
      // Below minimum
      localStorage.setItem('scribe:compactModeWidth', '50')

      // Should use default instead of invalid value
      const width = useAppViewStore.getState().compactModeWidth
      expect(width).toBeGreaterThanOrEqual(SIDEBAR_WIDTHS.compact.min)
    })
  })

  // ============================================================
  // Boundary Value Constraints
  // ============================================================

  describe('Width Boundary Constraints', () => {
    it('constrains compact mode width to minimum (200px)', () => {
      const { expandVault, setSidebarWidth } = useAppViewStore.getState()

      // Expand inbox in compact mode
      expandVault('inbox')

      // Try to set width below minimum
      setSidebarWidth(100)

      expect(useAppViewStore.getState().sidebarWidth).toBe(SIDEBAR_WIDTHS.compact.min)
      expect(useAppViewStore.getState().compactModeWidth).toBe(SIDEBAR_WIDTHS.compact.min)
    })

    it('constrains compact mode width to maximum (300px)', () => {
      const { expandVault, setSidebarWidth } = useAppViewStore.getState()

      expandVault('inbox')

      // Try to set width above maximum
      setSidebarWidth(500)

      expect(useAppViewStore.getState().sidebarWidth).toBe(SIDEBAR_WIDTHS.compact.max)
      expect(useAppViewStore.getState().compactModeWidth).toBe(SIDEBAR_WIDTHS.compact.max)
    })

    it('constrains card mode width to minimum (320px)', () => {
      const { expandVault, setIconMode, setSidebarWidth } = useAppViewStore.getState()

      // Set inbox to card mode
      setIconMode('vault', 'inbox', 'card')
      expandVault('inbox')

      // Try to set width below minimum
      setSidebarWidth(100)

      expect(useAppViewStore.getState().sidebarWidth).toBe(SIDEBAR_WIDTHS.card.min)
      expect(useAppViewStore.getState().cardModeWidth).toBe(SIDEBAR_WIDTHS.card.min)
    })

    it('constrains card mode width to maximum (500px)', () => {
      const { expandVault, setIconMode, setSidebarWidth } = useAppViewStore.getState()

      setIconMode('vault', 'inbox', 'card')
      expandVault('inbox')

      // Try to set width above maximum
      setSidebarWidth(1000)

      expect(useAppViewStore.getState().sidebarWidth).toBe(SIDEBAR_WIDTHS.card.max)
      expect(useAppViewStore.getState().cardModeWidth).toBe(SIDEBAR_WIDTHS.card.max)
    })

    it('ignores setSidebarWidth when collapsed', () => {
      const { setSidebarWidth } = useAppViewStore.getState()

      // Try to resize while collapsed
      setSidebarWidth(300)

      // Width should remain at icon width (48px)
      expect(useAppViewStore.getState().sidebarWidth).toBe(SIDEBAR_WIDTHS.icon)
    })
  })

  // ============================================================
  // Race Conditions
  // ============================================================

  describe('Rapid State Changes', () => {
    it('handles rapid icon switching gracefully', () => {
      const { toggleIcon } = useAppViewStore.getState()

      // Rapidly toggle multiple icons
      toggleIcon('vault', 'inbox')
      toggleIcon('smart', 'research')
      toggleIcon('vault', 'inbox')
      toggleIcon('smart', 'research')

      // Should end with research expanded (last action)
      expect(useAppViewStore.getState().expandedIcon).toEqual({
        type: 'smart',
        id: 'research'
      })
    })

    it('handles rapid mode switching', () => {
      const { expandVault, setIconMode } = useAppViewStore.getState()

      expandVault('inbox')

      // Rapidly switch modes
      setIconMode('vault', 'inbox', 'card')
      setIconMode('vault', 'inbox', 'compact')
      setIconMode('vault', 'inbox', 'card')

      // Should end in card mode
      const vault = useAppViewStore.getState().pinnedVaults.find(v => v.id === 'inbox')
      expect(vault?.preferredMode).toBe('card')
      expect(useAppViewStore.getState().sidebarWidth).toBe(SIDEBAR_WIDTHS.card.default)
    })

    it('handles expand/collapse cycles', () => {
      const { expandVault, collapseAll } = useAppViewStore.getState()

      // Rapid expand/collapse
      expandVault('inbox')
      collapseAll()
      expandVault('inbox')
      collapseAll()
      expandVault('inbox')

      // Should end expanded
      expect(useAppViewStore.getState().expandedIcon).toEqual({
        type: 'vault',
        id: 'inbox'
      })
      expect(useAppViewStore.getState().sidebarWidth).toBeGreaterThan(SIDEBAR_WIDTHS.icon)
    })
  })

  // ============================================================
  // Missing Data Handling
  // ============================================================

  describe('Missing Data Scenarios', () => {
    it('handles expansion of non-existent vault gracefully', () => {
      const { expandVault } = useAppViewStore.getState()

      // Try to expand vault that doesn't exist
      expandVault('non-existent-vault')

      // Should still set expandedIcon
      expect(useAppViewStore.getState().expandedIcon).toEqual({
        type: 'vault',
        id: 'non-existent-vault'
      })

      // Should default to compact width
      expect(useAppViewStore.getState().sidebarWidth).toBe(SIDEBAR_WIDTHS.compact.default)
    })

    it('handles expansion of non-existent smart icon gracefully', () => {
      const { expandSmartIcon } = useAppViewStore.getState()

      // Try to expand icon that doesn't exist
      expandSmartIcon('non-existent' as SmartIconId)

      // Should still set expandedIcon
      expect(useAppViewStore.getState().expandedIcon).toEqual({
        type: 'smart',
        id: 'non-existent'
      })

      // Should default to compact width
      expect(useAppViewStore.getState().sidebarWidth).toBe(SIDEBAR_WIDTHS.compact.default)
    })

    it('handles missing preferredMode in vault', () => {
      const { expandVault, pinnedVaults } = useAppViewStore.getState()

      // Add vault without preferredMode
      const newVaults = [
        ...pinnedVaults,
        {
          id: 'test-vault',
          label: 'Test',
          order: 1,
          isPermanent: false
          // preferredMode omitted
        }
      ]

      useAppViewStore.setState({ pinnedVaults: newVaults })

      expandVault('test-vault')

      // Should default to compact
      expect(useAppViewStore.getState().sidebarWidth).toBe(SIDEBAR_WIDTHS.compact.default)
    })

    it('handles missing preferredMode in smart icon', () => {
      const { expandSmartIcon, smartIcons } = useAppViewStore.getState()

      // Add icon without preferredMode
      const newIcons = [
        ...smartIcons,
        {
          id: 'teaching' as SmartIconId,
          label: 'Teaching',
          icon: 'graduation-cap',
          color: '#10b981',
          projectType: 'teaching' as const,
          isVisible: true,
          isExpanded: false,
          order: 1
          // preferredMode omitted
        }
      ]

      useAppViewStore.setState({ smartIcons: newIcons })

      expandSmartIcon('teaching')

      // Should default to compact
      expect(useAppViewStore.getState().sidebarWidth).toBe(SIDEBAR_WIDTHS.compact.default)
    })
  })

  // ============================================================
  // localStorage Failure Scenarios
  // ============================================================

  describe('localStorage Failure Handling', () => {
    it('handles localStorage.setItem quota exceeded', () => {
      const { expandVault } = useAppViewStore.getState()

      // Mock quota exceeded error
      const originalSetItem = localStorage.setItem
      localStorage.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError')
      })

      // Should not crash
      expect(() => expandVault('inbox')).not.toThrow()

      // State should still update in memory
      expect(useAppViewStore.getState().expandedIcon).toEqual({
        type: 'vault',
        id: 'inbox'
      })

      localStorage.setItem = originalSetItem
    })

    it('handles localStorage.getItem failure', () => {
      // Mock getItem failure
      const originalGetItem = localStorage.getItem
      localStorage.getItem = vi.fn(() => {
        throw new Error('Storage access denied')
      })

      // Should not crash on store initialization
      expect(() => useAppViewStore.getState()).not.toThrow()

      localStorage.getItem = originalGetItem
    })

    it('continues working when localStorage is disabled', () => {
      const { expandVault, setIconMode, collapseAll } = useAppViewStore.getState()

      // Disable localStorage
      const originalSetItem = localStorage.setItem
      const originalGetItem = localStorage.getItem
      localStorage.setItem = vi.fn(() => {
        throw new Error('localStorage disabled')
      })
      localStorage.getItem = vi.fn(() => {
        throw new Error('localStorage disabled')
      })

      // All operations should work (in-memory only)
      expect(() => {
        expandVault('inbox')
        setIconMode('vault', 'inbox', 'card')
        collapseAll()
      }).not.toThrow()

      // State should be correct in memory
      expect(useAppViewStore.getState().expandedIcon).toBeNull()

      localStorage.setItem = originalSetItem
      localStorage.getItem = originalGetItem
    })
  })

  // ============================================================
  // Accordion Pattern Enforcement
  // ============================================================

  describe('Accordion Pattern Enforcement', () => {
    it('ensures only one icon expanded at a time', () => {
      const { expandVault, expandSmartIcon } = useAppViewStore.getState()

      expandVault('inbox')
      expect(useAppViewStore.getState().expandedIcon?.id).toBe('inbox')

      expandSmartIcon('research')
      expect(useAppViewStore.getState().expandedIcon?.id).toBe('research')

      // Only research should be expanded
      const state = useAppViewStore.getState()
      expect(state.expandedIcon).toEqual({ type: 'smart', id: 'research' })
    })

    it('switching icons auto-collapses previous icon', () => {
      const { toggleIcon } = useAppViewStore.getState()

      // Expand inbox
      toggleIcon('vault', 'inbox')
      expect(useAppViewStore.getState().expandedIcon?.id).toBe('inbox')

      // Expand research (should auto-collapse inbox)
      toggleIcon('smart', 'research')
      expect(useAppViewStore.getState().expandedIcon?.id).toBe('research')

      // localStorage should only have research
      const stored = localStorage.getItem('scribe:expandedIcon')
      expect(stored).toBe(JSON.stringify({ type: 'smart', id: 'research' }))
    })
  })

  // ============================================================
  // Width Memory Independence
  // ============================================================

  describe('Width Memory Per Mode', () => {
    it('maintains separate widths for compact and card modes', () => {
      const { expandVault, setIconMode, setSidebarWidth } = useAppViewStore.getState()

      // Expand in compact mode and resize
      expandVault('inbox')
      setSidebarWidth(280)

      expect(useAppViewStore.getState().compactModeWidth).toBe(280)
      expect(useAppViewStore.getState().cardModeWidth).toBe(SIDEBAR_WIDTHS.card.default) // Unchanged

      // Switch to card mode and resize
      setIconMode('vault', 'inbox', 'card')
      setSidebarWidth(400)

      expect(useAppViewStore.getState().compactModeWidth).toBe(280) // Unchanged
      expect(useAppViewStore.getState().cardModeWidth).toBe(400)

      // Switch back to compact
      setIconMode('vault', 'inbox', 'compact')

      // Should restore compact width (280)
      expect(useAppViewStore.getState().sidebarWidth).toBe(280)
    })

    it('preserves mode widths across icon switches', () => {
      const { expandVault, expandSmartIcon, setIconMode, setSidebarWidth } = useAppViewStore.getState()

      // Set inbox to card mode, resize to 380
      expandVault('inbox')
      setIconMode('vault', 'inbox', 'card')
      setSidebarWidth(380)

      // Switch to research (compact mode by default)
      expandSmartIcon('research')
      expect(useAppViewStore.getState().sidebarWidth).toBe(SIDEBAR_WIDTHS.compact.default) // 240

      // Switch back to inbox
      expandVault('inbox')

      // Should restore card width (380)
      expect(useAppViewStore.getState().sidebarWidth).toBe(380)
    })
  })
})
