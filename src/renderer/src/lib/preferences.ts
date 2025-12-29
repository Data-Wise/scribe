/**
 * User Preferences - Persistent settings for Scribe
 *
 * Stores user preferences in localStorage for persistence across sessions.
 * All preferences have sensible defaults for ADHD-friendly experience.
 */

const PREFERENCES_KEY = 'scribe-preferences'

// Editor modes: Source (raw markdown), Live Preview (WYSIWYG), Reading (rendered, read-only)
export type EditorMode = 'source' | 'live-preview' | 'reading'

// UI Style types (v1.7)
export type TabBarStyle = 'subtle' | 'elevated' | 'glass' | 'borderless'
export type BorderStyle = 'sharp' | 'soft' | 'glow' | 'none'
export type ActiveTabStyle = 'elevated' | 'accent-bar' | 'background' | 'bold' | 'full'

export interface UserPreferences {
  // Writing settings
  defaultWordGoal: number        // Default daily word goal (500)
  focusModeEnabled: boolean      // Last focus mode state

  // Session tracking
  lastSessionDate: string | null // ISO date of last writing session
  currentStreak: number          // Consecutive days writing streak
  totalWordsWritten: number      // Lifetime words written

  // UI preferences
  showWordGoalProgress: boolean  // Show progress bar in editor
  celebrateMilestones: boolean   // Show milestone celebrations
  streakDisplayOptIn: boolean    // Show streak milestones (7/30/100/365) - default OFF

  // Editor preferences (v1.3)
  editorMode: EditorMode         // Source, Live Preview, or Reading mode
  customCSS: string              // User's custom CSS for editor
  customCSSEnabled: boolean      // Whether custom CSS is active

  // HUD / Mission Control preferences (v1.4)
  hudMode: 'layered' | 'persistent' // Layered (overlay) or Persistent (docked)
  hudSide: 'left' | 'right'         // Which side the HQ appears on
  hudRibbonVisible: boolean         // Whether the ribbon is visible

  // UI Style preferences (v1.7)
  tabBarStyle: TabBarStyle          // Tab bar background style
  borderStyle: BorderStyle          // Border treatment for UI zones
  activeTabStyle: ActiveTabStyle    // How active tab is emphasized
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultWordGoal: 500,
  focusModeEnabled: false,
  lastSessionDate: null,
  currentStreak: 0,
  totalWordsWritten: 0,
  showWordGoalProgress: true,
  celebrateMilestones: true,
  streakDisplayOptIn: false, // OFF by default - avoids ADHD anxiety
  // Editor preferences (v1.3)
  editorMode: 'source',      // Start with source mode (familiar)
  customCSS: '',             // No custom CSS by default
  customCSSEnabled: false,   // Disabled by default
  // HUD preferences (v1.4)
  hudMode: 'layered',        // Layered by default for max focus
  hudSide: 'left',
  hudRibbonVisible: true,

  // UI Style defaults (v1.7)
  tabBarStyle: 'elevated',      // Modern, clear hierarchy
  borderStyle: 'soft',          // ADHD-friendly, not harsh
  activeTabStyle: 'elevated',   // Clear distinction
}

/**
 * Load user preferences from localStorage
 */
export function loadPreferences(): UserPreferences {
  try {
    const saved = localStorage.getItem(PREFERENCES_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Merge with defaults to handle new preference fields
      return { ...DEFAULT_PREFERENCES, ...parsed }
    }
  } catch (e) {
    console.warn('Failed to load preferences:', e)
  }
  return { ...DEFAULT_PREFERENCES }
}

/**
 * Save user preferences to localStorage
 */
export function savePreferences(preferences: UserPreferences): void {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
    // Dispatch custom event for same-tab reactivity
    window.dispatchEvent(new CustomEvent('preferences-changed'))
  } catch (e) {
    console.warn('Failed to save preferences:', e)
  }
}

/**
 * Update specific preferences while preserving others
 */
export function updatePreferences(updates: Partial<UserPreferences>): UserPreferences {
  const current = loadPreferences()
  const updated = { ...current, ...updates }
  savePreferences(updated)
  return updated
}

/**
 * Get the current date in ISO format (YYYY-MM-DD)
 */
function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Update streak based on writing activity
 * Called when user writes any words
 */
export function updateStreak(wordsWritten: number): UserPreferences {
  const prefs = loadPreferences()
  const today = getToday()

  if (wordsWritten <= 0) return prefs

  // Update total words
  prefs.totalWordsWritten += wordsWritten

  // Check if this is a new day
  if (prefs.lastSessionDate !== today) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (prefs.lastSessionDate === yesterdayStr) {
      // Consecutive day - increment streak
      prefs.currentStreak += 1
    } else if (prefs.lastSessionDate !== today) {
      // Streak broken - reset to 1
      prefs.currentStreak = 1
    }

    prefs.lastSessionDate = today
  }

  savePreferences(prefs)
  return prefs
}

/**
 * Get current streak information
 */
export function getStreakInfo(): { streak: number; isActiveToday: boolean } {
  const prefs = loadPreferences()
  const today = getToday()

  return {
    streak: prefs.currentStreak,
    isActiveToday: prefs.lastSessionDate === today
  }
}

/**
 * Reset streak (for testing or user request)
 */
export function resetStreak(): UserPreferences {
  return updatePreferences({
    currentStreak: 0,
    lastSessionDate: null
  })
}
