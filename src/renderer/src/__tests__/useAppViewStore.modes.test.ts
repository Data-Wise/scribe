import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAppViewStore, SIDEBAR_WIDTHS } from '../store/useAppViewStore'
import { useSettingsStore } from '../store/useSettingsStore'
import type { SidebarMode } from '../types'

/**
 * useAppViewStore Mode Management Unit Tests
 *
 * Tests Phase 1-3: Store functions for Mode Consolidation
 * - setSidebarMode: Mode changes and width restoration
 * - setSidebarWidth: Mode-specific width persistence
 * - cycleSidebarMode: Preset-aware cycling with debounce
 * - determineExpandMode: Priority logic (remember mode > preset > default)
 * - getCyclePattern: Preset-to-pattern mapping
 */

describe('useAppViewStore - Mode Management', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()

    // Reset store to initial state
    useAppViewStore.setState({
      sidebarMode: 'compact',
      sidebarWidth: 280,
      lastExpandedMode: null,
      lastModeChangeTimestamp: 0,
      compactModeWidth: SIDEBAR_WIDTHS.compact.default,
      cardModeWidth: SIDEBAR_WIDTHS.card.default
    })

    // Reset settings store
    useSettingsStore.setState({
      settings: {
        'appearance.sidebarWidth': 'medium',
        'appearance.rememberSidebarMode': true
      }
    })

    // Clear all mocks
    vi.clearAllMocks()
  })

  // ============================================================
  // setSidebarMode Tests
  // ============================================================

  describe('setSidebarMode', () => {
    it('updates mode and persists to localStorage', () => {
      const { setSidebarMode } = useAppViewStore.getState()

      setSidebarMode('card')

      // Check store state
      expect(useAppViewStore.getState().sidebarMode).toBe('card')

      // Check localStorage
      expect(localStorage.getItem('scribe:sidebarMode')).toBe('card')
    })

    it('saves lastExpandedMode when switching to compact', () => {
      const { setSidebarMode } = useAppViewStore.getState()

      setSidebarMode('compact')

      // Check store state
      expect(useAppViewStore.getState().lastExpandedMode).toBe('compact')

      // Check localStorage
      expect(localStorage.getItem('scribe:lastExpandedMode')).toBe('compact')
    })

    it('saves lastExpandedMode when switching to card', () => {
      const { setSidebarMode } = useAppViewStore.getState()

      setSidebarMode('card')

      expect(useAppViewStore.getState().lastExpandedMode).toBe('card')
      expect(localStorage.getItem('scribe:lastExpandedMode')).toBe('card')
    })

    it('does not save lastExpandedMode when switching to icon', () => {
      const { setSidebarMode } = useAppViewStore.getState()

      // First set to compact
      setSidebarMode('compact')
      expect(useAppViewStore.getState().lastExpandedMode).toBe('compact')

      // Then switch to icon
      setSidebarMode('icon')

      // lastExpandedMode should still be 'compact' (not updated to icon)
      expect(useAppViewStore.getState().lastExpandedMode).toBe('compact')
    })

    it('restores mode-specific width when switching modes', () => {
      const { setSidebarMode, setSidebarWidth } = useAppViewStore.getState()

      // Set compact mode with custom width
      setSidebarMode('compact')
      setSidebarWidth(250)

      // Set card mode with custom width
      setSidebarMode('card')
      setSidebarWidth(380)

      // Switch back to compact - should restore 250px
      setSidebarMode('compact')
      expect(useAppViewStore.getState().sidebarWidth).toBe(250)

      // Switch to card - should restore 380px
      setSidebarMode('card')
      expect(useAppViewStore.getState().sidebarWidth).toBe(380)
    })

    it('uses default width when mode-specific width not set', () => {
      const { setSidebarMode } = useAppViewStore.getState()

      // Start fresh
      useAppViewStore.setState({
        compactModeWidth: SIDEBAR_WIDTHS.compact.default,
        cardModeWidth: SIDEBAR_WIDTHS.card.default
      })

      setSidebarMode('compact')
      expect(useAppViewStore.getState().sidebarWidth).toBe(SIDEBAR_WIDTHS.compact.default)

      setSidebarMode('card')
      expect(useAppViewStore.getState().sidebarWidth).toBe(SIDEBAR_WIDTHS.card.default)
    })

    it('sets icon mode width to fixed 48px', () => {
      const { setSidebarMode } = useAppViewStore.getState()

      setSidebarMode('icon')

      expect(useAppViewStore.getState().sidebarWidth).toBe(SIDEBAR_WIDTHS.icon)
    })
  })

  // ============================================================
  // setSidebarWidth Tests
  // ============================================================

  describe('setSidebarWidth', () => {
    it('persists width to localStorage', () => {
      const { setSidebarWidth } = useAppViewStore.getState()

      setSidebarWidth(300)

      expect(localStorage.getItem('scribe:sidebarWidth')).toBe('300')
    })

    it('saves to compactModeWidth when in compact mode', () => {
      const { setSidebarMode, setSidebarWidth } = useAppViewStore.getState()

      setSidebarMode('compact')
      setSidebarWidth(250)

      // Check store state
      expect(useAppViewStore.getState().compactModeWidth).toBe(250)

      // Check localStorage
      expect(localStorage.getItem('scribe:compactModeWidth')).toBe('250')
    })

    it('saves to cardModeWidth when in card mode', () => {
      const { setSidebarMode, setSidebarWidth } = useAppViewStore.getState()

      setSidebarMode('card')
      setSidebarWidth(380)

      // Check store state
      expect(useAppViewStore.getState().cardModeWidth).toBe(380)

      // Check localStorage
      expect(localStorage.getItem('scribe:cardModeWidth')).toBe('380')
    })

    it('does not mix compact and card widths', () => {
      const { setSidebarMode, setSidebarWidth } = useAppViewStore.getState()

      // Set compact width
      setSidebarMode('compact')
      setSidebarWidth(250)

      // Set card width
      setSidebarMode('card')
      setSidebarWidth(400)

      // Verify both are stored separately
      expect(localStorage.getItem('scribe:compactModeWidth')).toBe('250')
      expect(localStorage.getItem('scribe:cardModeWidth')).toBe('400')
    })
  })

  // ============================================================
  // cycleSidebarMode Tests
  // ============================================================

  describe('cycleSidebarMode', () => {
    it('cycles through modes based on preset', () => {
      const { cycleSidebarMode } = useAppViewStore.getState()

      // Set medium preset (icon ↔ compact)
      useSettingsStore.setState({
        settings: { 'appearance.sidebarWidth': 'medium' }
      })

      // Start at compact with old timestamp (allow cycle)
      useAppViewStore.setState({
        sidebarMode: 'compact',
        lastModeChangeTimestamp: 0
      })

      // Cycle should go to icon
      cycleSidebarMode()
      expect(useAppViewStore.getState().sidebarMode).toBe('icon')

      // Reset timestamp to allow next cycle
      useAppViewStore.setState({ lastModeChangeTimestamp: 0 })

      // Cycle again should go back to compact
      cycleSidebarMode()
      expect(useAppViewStore.getState().sidebarMode).toBe('compact')
    })

    it('enforces 200ms debounce', () => {
      const { cycleSidebarMode } = useAppViewStore.getState()
      const now = Date.now()

      // Set initial timestamp
      useAppViewStore.setState({ lastModeChangeTimestamp: now })

      // Immediate cycle should be blocked (within 200ms)
      const beforeMode = useAppViewStore.getState().sidebarMode
      cycleSidebarMode()
      const afterMode = useAppViewStore.getState().sidebarMode

      // Mode should not have changed
      expect(afterMode).toBe(beforeMode)
    })

    it('allows cycle after 200ms debounce window', async () => {
      const { cycleSidebarMode } = useAppViewStore.getState()

      // Set timestamp to 300ms ago (beyond debounce window)
      const pastTimestamp = Date.now() - 300
      useAppViewStore.setState({
        sidebarMode: 'compact',
        lastModeChangeTimestamp: pastTimestamp
      })

      // Set medium preset for simple 2-state cycle
      useSettingsStore.setState({
        settings: { 'appearance.sidebarWidth': 'medium' }
      })

      // Cycle should work
      cycleSidebarMode()

      // Mode should have changed
      expect(useAppViewStore.getState().sidebarMode).toBe('icon')
    })

    it('updates debounce timestamp on successful cycle', () => {
      const { cycleSidebarMode } = useAppViewStore.getState()

      // Set old timestamp
      useAppViewStore.setState({
        sidebarMode: 'compact',
        lastModeChangeTimestamp: 0
      })

      const beforeTimestamp = Date.now()
      cycleSidebarMode()
      const afterTimestamp = useAppViewStore.getState().lastModeChangeTimestamp

      // Timestamp should be updated to now
      expect(afterTimestamp).toBeGreaterThanOrEqual(beforeTimestamp)
      expect(afterTimestamp).toBeLessThanOrEqual(Date.now())
    })

    it('respects wide preset 3-state cycle', () => {
      const { cycleSidebarMode } = useAppViewStore.getState()

      // Set wide preset (icon → compact → card → icon)
      useSettingsStore.setState({
        settings: { 'appearance.sidebarWidth': 'wide' }
      })

      // Start at icon
      useAppViewStore.setState({
        sidebarMode: 'icon',
        lastModeChangeTimestamp: 0
      })

      // Cycle: icon → compact
      cycleSidebarMode()
      expect(useAppViewStore.getState().sidebarMode).toBe('compact')

      // Reset timestamp
      useAppViewStore.setState({ lastModeChangeTimestamp: 0 })

      // Cycle: compact → card
      cycleSidebarMode()
      expect(useAppViewStore.getState().sidebarMode).toBe('card')

      // Reset timestamp
      useAppViewStore.setState({ lastModeChangeTimestamp: 0 })

      // Cycle: card → icon
      cycleSidebarMode()
      expect(useAppViewStore.getState().sidebarMode).toBe('icon')
    })
  })

  // ============================================================
  // determineExpandMode Tests
  // ============================================================

  describe('determineExpandMode', () => {
    it('uses remembered mode when setting is ON and mode exists', () => {
      const { determineExpandMode } = useAppViewStore.getState()

      // Set remember mode ON
      useSettingsStore.setState({
        settings: { 'appearance.rememberSidebarMode': true }
      })

      // Set last expanded mode to card
      useAppViewStore.setState({ lastExpandedMode: 'card' })

      expect(determineExpandMode()).toBe('card')
    })

    it('falls back to preset when remember mode is OFF', () => {
      const { determineExpandMode } = useAppViewStore.getState()

      // Set remember mode OFF
      useSettingsStore.setState({
        settings: {
          'appearance.rememberSidebarMode': false,
          'appearance.sidebarWidth': 'wide'
        }
      })

      // Even with lastExpandedMode set, should use preset
      useAppViewStore.setState({ lastExpandedMode: 'compact' })

      expect(determineExpandMode()).toBe('card') // wide → card
    })

    it('defaults to compact when no localStorage data exists', () => {
      const { determineExpandMode } = useAppViewStore.getState()

      // Clear last expanded mode
      useAppViewStore.setState({ lastExpandedMode: null })

      // Set remember mode OFF
      useSettingsStore.setState({
        settings: { 'appearance.rememberSidebarMode': false }
      })

      expect(determineExpandMode()).toBe('compact')
    })

    it('maps narrow preset to compact mode', () => {
      const { determineExpandMode } = useAppViewStore.getState()

      useSettingsStore.setState({
        settings: {
          'appearance.rememberSidebarMode': false,
          'appearance.sidebarWidth': 'narrow'
        }
      })

      expect(determineExpandMode()).toBe('compact')
    })

    it('maps medium preset to compact mode', () => {
      const { determineExpandMode } = useAppViewStore.getState()

      useSettingsStore.setState({
        settings: {
          'appearance.rememberSidebarMode': false,
          'appearance.sidebarWidth': 'medium'
        }
      })

      expect(determineExpandMode()).toBe('compact')
    })

    it('maps wide preset to card mode', () => {
      const { determineExpandMode } = useAppViewStore.getState()

      useSettingsStore.setState({
        settings: {
          'appearance.rememberSidebarMode': false,
          'appearance.sidebarWidth': 'wide'
        }
      })

      expect(determineExpandMode()).toBe('card')
    })
  })

  // ============================================================
  // getCyclePattern Tests
  // ============================================================

  describe('getCyclePattern', () => {
    it('returns 2-state pattern for narrow preset', () => {
      const { getCyclePattern } = useAppViewStore.getState()

      const pattern = getCyclePattern('narrow')

      expect(pattern).toEqual(['icon', 'compact'])
    })

    it('returns 2-state pattern for medium preset', () => {
      const { getCyclePattern } = useAppViewStore.getState()

      const pattern = getCyclePattern('medium')

      expect(pattern).toEqual(['icon', 'compact'])
    })

    it('returns 3-state pattern for wide preset', () => {
      const { getCyclePattern } = useAppViewStore.getState()

      const pattern = getCyclePattern('wide')

      expect(pattern).toEqual(['icon', 'compact', 'card'])
    })

    it('defaults to medium pattern for unknown preset', () => {
      const { getCyclePattern } = useAppViewStore.getState()

      const pattern = getCyclePattern('unknown')

      expect(pattern).toEqual(['icon', 'compact'])
    })

    it('pattern contains only valid SidebarMode values', () => {
      const { getCyclePattern } = useAppViewStore.getState()

      const presets = ['narrow', 'medium', 'wide']
      const validModes: SidebarMode[] = ['icon', 'compact', 'card']

      presets.forEach(preset => {
        const pattern = getCyclePattern(preset)

        pattern.forEach(mode => {
          expect(validModes).toContain(mode)
        })
      })
    })
  })

  // ============================================================
  // Integration Tests
  // ============================================================

  describe('Mode Management Integration', () => {
    it('complete cycle workflow maintains width consistency', () => {
      const { setSidebarMode, setSidebarWidth, cycleSidebarMode } = useAppViewStore.getState()

      // Set medium preset for 2-state cycle
      useSettingsStore.setState({
        settings: { 'appearance.sidebarWidth': 'medium' }
      })

      // Set custom compact width
      setSidebarMode('compact')
      setSidebarWidth(260)

      // Cycle to icon
      useAppViewStore.setState({ lastModeChangeTimestamp: 0 })
      cycleSidebarMode()
      expect(useAppViewStore.getState().sidebarMode).toBe('icon')

      // Cycle back to compact
      useAppViewStore.setState({ lastModeChangeTimestamp: 0 })
      cycleSidebarMode()

      // Should restore custom width
      expect(useAppViewStore.getState().sidebarMode).toBe('compact')
      expect(useAppViewStore.getState().sidebarWidth).toBe(260)
    })

    it('mode-specific widths persist across cycles', () => {
      const { setSidebarMode, setSidebarWidth } = useAppViewStore.getState()

      // Set custom widths for both modes
      setSidebarMode('compact')
      setSidebarWidth(250)

      setSidebarMode('card')
      setSidebarWidth(400)

      // Cycle through modes multiple times
      setSidebarMode('icon')
      setSidebarMode('compact')

      expect(useAppViewStore.getState().sidebarWidth).toBe(250)

      setSidebarMode('card')
      expect(useAppViewStore.getState().sidebarWidth).toBe(400)
    })

    it('priority logic works end-to-end', () => {
      const { determineExpandMode, setSidebarMode } = useAppViewStore.getState()

      // Test Priority 1: Remember mode ON + last mode exists
      useSettingsStore.setState({
        settings: {
          'appearance.rememberSidebarMode': true,
          'appearance.sidebarWidth': 'narrow' // Would suggest compact
        }
      })

      setSidebarMode('card')
      expect(determineExpandMode()).toBe('card') // Uses remembered card, not preset

      // Test Priority 2: Remember mode OFF + use preset
      useSettingsStore.setState({
        settings: {
          'appearance.rememberSidebarMode': false,
          'appearance.sidebarWidth': 'wide'
        }
      })

      expect(determineExpandMode()).toBe('card') // Uses preset (wide → card)
    })
  })
})
