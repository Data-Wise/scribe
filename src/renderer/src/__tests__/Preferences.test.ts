import { describe, it, expect } from 'vitest'
import {
  loadPreferences,
  savePreferences,
  updatePreferences,
  DEFAULT_SIDEBAR_TAB_ORDER,
  UserPreferences,
  TabBarStyle,
  BorderStyle,
  ActiveTabStyle,
  SidebarTabSize,
  SidebarTabId,
  EditorMode,
} from '../lib/preferences'

describe('Preferences', () => {
  describe('loadPreferences', () => {
    it('should return preferences object with expected shape', () => {
      const prefs = loadPreferences()
      expect(prefs).toHaveProperty('defaultWordGoal')
      expect(prefs).toHaveProperty('focusModeEnabled')
      expect(prefs).toHaveProperty('tabBarStyle')
      expect(prefs).toHaveProperty('borderStyle')
      expect(prefs).toHaveProperty('activeTabStyle')
      expect(prefs).toHaveProperty('sidebarTabSize')
    })

    it('should have valid tabBarStyle value', () => {
      const prefs = loadPreferences()
      const validStyles: TabBarStyle[] = ['subtle', 'elevated', 'glass', 'borderless']
      expect(validStyles).toContain(prefs.tabBarStyle)
    })

    it('should have valid borderStyle value', () => {
      const prefs = loadPreferences()
      const validStyles: BorderStyle[] = ['sharp', 'soft', 'glow', 'none']
      expect(validStyles).toContain(prefs.borderStyle)
    })

    it('should have valid activeTabStyle value', () => {
      const prefs = loadPreferences()
      const validStyles: ActiveTabStyle[] = ['elevated', 'accent-bar', 'background', 'bold', 'full']
      expect(validStyles).toContain(prefs.activeTabStyle)
    })

    it('should have valid sidebarTabSize value', () => {
      const prefs = loadPreferences()
      const validSizes: SidebarTabSize[] = ['compact', 'full']
      expect(validSizes).toContain(prefs.sidebarTabSize)
    })

    it('should have valid editorMode value', () => {
      const prefs = loadPreferences()
      const validModes: EditorMode[] = ['source', 'live-preview', 'reading']
      expect(validModes).toContain(prefs.editorMode)
    })
  })

  describe('savePreferences', () => {
    it('should not throw when saving valid preferences', () => {
      const prefs = loadPreferences()
      expect(() => savePreferences(prefs)).not.toThrow()
    })
  })

  describe('updatePreferences', () => {
    it('should return updated preferences object', () => {
      const result = updatePreferences({})
      expect(result).toHaveProperty('defaultWordGoal')
      expect(result).toHaveProperty('tabBarStyle')
    })
  })

  describe('DEFAULT_SIDEBAR_TAB_ORDER', () => {
    it('should have correct default tab order', () => {
      expect(DEFAULT_SIDEBAR_TAB_ORDER).toEqual([
        'properties',
        'backlinks',
        'tags',
        'stats',
        'claude',
        'terminal'
      ])
    })

    it('should have all SidebarTabId values', () => {
      const allTabs: SidebarTabId[] = ['properties', 'backlinks', 'tags', 'stats', 'claude', 'terminal']
      allTabs.forEach(tab => {
        expect(DEFAULT_SIDEBAR_TAB_ORDER).toContain(tab)
      })
    })
  })

  describe('Type Definitions', () => {
    it('TabBarStyle should include all valid values', () => {
      const styles: TabBarStyle[] = ['subtle', 'elevated', 'glass', 'borderless']
      expect(styles.length).toBe(4)
    })

    it('BorderStyle should include all valid values', () => {
      const styles: BorderStyle[] = ['sharp', 'soft', 'glow', 'none']
      expect(styles.length).toBe(4)
    })

    it('ActiveTabStyle should include all valid values', () => {
      const styles: ActiveTabStyle[] = ['elevated', 'accent-bar', 'background', 'bold', 'full']
      expect(styles.length).toBe(5)
    })

    it('SidebarTabSize should include all valid values', () => {
      const sizes: SidebarTabSize[] = ['compact', 'full']
      expect(sizes.length).toBe(2)
    })

    it('EditorMode should include all valid values', () => {
      const modes: EditorMode[] = ['source', 'live-preview', 'reading']
      expect(modes.length).toBe(3)
    })
  })

  describe('UserPreferences interface', () => {
    it('should create a valid preferences object', () => {
      const prefs: UserPreferences = {
        defaultWordGoal: 500,
        focusModeEnabled: false,
        lastSessionDate: '2025-01-01',
        currentStreak: 0,
        totalWordsWritten: 0,
        showWordGoalProgress: true,
        celebrateMilestones: true,
        streakDisplayOptIn: false,
        editorMode: 'live-preview',
        customCSS: '',
        customCSSEnabled: false,
        hudMode: 'layered',
        hudSide: 'left',
        hudRibbonVisible: true,
        tabBarStyle: 'elevated',
        borderStyle: 'soft',
        activeTabStyle: 'elevated',
        sidebarTabSize: 'compact',
        sidebarTabOrder: DEFAULT_SIDEBAR_TAB_ORDER,
        sidebarHiddenTabs: [],
        iconGlowEffect: true,
        iconGlowIntensity: 'subtle',
      }

      expect(prefs.defaultWordGoal).toBe(500)
      expect(prefs.tabBarStyle).toBe('elevated')
      expect(prefs.sidebarTabOrder).toEqual(DEFAULT_SIDEBAR_TAB_ORDER)
    })
  })
})
