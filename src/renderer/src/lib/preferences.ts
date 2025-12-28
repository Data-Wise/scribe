/**
 * User Preferences - Persistent settings for Scribe
 *
 * Stores user preferences in localStorage for persistence across sessions.
 * All preferences have sensible defaults for ADHD-friendly experience.
 */

const PREFERENCES_KEY = 'scribe-preferences'

// Editor modes: Source (raw markdown), Live Preview (WYSIWYG), Reading (rendered, read-only)
export type EditorMode = 'source' | 'live-preview' | 'reading'

export interface UserPreferences {
  // Writing settings
  defaultWordGoal: number        // Default daily word goal (500)
  focusModeEnabled: boolean      // Last focus mode state

  // Session tracking
  lastSessionDate: string | null // ISO date of last writing session
  currentStreak: number          // Consecutive days writing streak
  totalWordsWritten: number      // Lifetime words written

  // Daily goal tracking
  dailyGoalOptIn: boolean        // Whether to show daily goal on Mission Control
  dailyGoalTarget: number        // Today's word goal (can override default)
  todayWordsWritten: number      // Words written today
  todayDate: string | null       // Date for today's tracking (resets daily)

  // Pinned notes
  pinnedNoteIds: string[]        // Note IDs pinned to Mission Control

  // UI preferences
  showWordGoalProgress: boolean  // Show progress bar in editor
  celebrateMilestones: boolean   // Show milestone celebrations
  streakDisplayOptIn: boolean    // Show streak milestones (7/30/100/365) - default OFF

  // Editor preferences (v1.3)
  editorMode: EditorMode         // Source, Live Preview, or Reading mode
  customCSS: string              // User's custom CSS for editor
  customCSSEnabled: boolean      // Whether custom CSS is active
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultWordGoal: 500,
  focusModeEnabled: false,
  lastSessionDate: null,
  currentStreak: 0,
  totalWordsWritten: 0,
  // Daily goal tracking
  dailyGoalOptIn: false,     // OFF by default - opt-in feature
  dailyGoalTarget: 500,      // Default matches defaultWordGoal
  todayWordsWritten: 0,
  todayDate: null,
  // Pinned notes
  pinnedNoteIds: [],         // No pinned notes by default
  // UI preferences
  showWordGoalProgress: true,
  celebrateMilestones: true,
  streakDisplayOptIn: false, // OFF by default - avoids ADHD anxiety
  // Editor preferences (v1.3)
  editorMode: 'source',      // Start with source mode (familiar)
  customCSS: '',             // No custom CSS by default
  customCSSEnabled: false,   // Disabled by default
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

/**
 * Daily Goal Tracking
 */

export interface DailyGoalInfo {
  isEnabled: boolean
  target: number
  written: number
  progress: number  // 0-100
  isComplete: boolean
  remaining: number
}

/**
 * Get today's writing goal information
 * Automatically resets if it's a new day
 */
export function getDailyGoalInfo(): DailyGoalInfo {
  const prefs = loadPreferences()
  const today = getToday()

  // Reset if new day
  if (prefs.todayDate !== today) {
    updatePreferences({
      todayDate: today,
      todayWordsWritten: 0
    })
    return {
      isEnabled: prefs.dailyGoalOptIn,
      target: prefs.dailyGoalTarget,
      written: 0,
      progress: 0,
      isComplete: false,
      remaining: prefs.dailyGoalTarget
    }
  }

  const progress = Math.min(100, Math.round((prefs.todayWordsWritten / prefs.dailyGoalTarget) * 100))

  return {
    isEnabled: prefs.dailyGoalOptIn,
    target: prefs.dailyGoalTarget,
    written: prefs.todayWordsWritten,
    progress,
    isComplete: prefs.todayWordsWritten >= prefs.dailyGoalTarget,
    remaining: Math.max(0, prefs.dailyGoalTarget - prefs.todayWordsWritten)
  }
}

/**
 * Update today's word count
 */
export function updateDailyProgress(wordsWritten: number): DailyGoalInfo {
  const prefs = loadPreferences()
  const today = getToday()

  // Ensure we're tracking today
  if (prefs.todayDate !== today) {
    updatePreferences({
      todayDate: today,
      todayWordsWritten: wordsWritten
    })
  } else {
    updatePreferences({
      todayWordsWritten: prefs.todayWordsWritten + wordsWritten
    })
  }

  return getDailyGoalInfo()
}

/**
 * Set daily goal target
 */
export function setDailyGoalTarget(target: number): void {
  updatePreferences({ dailyGoalTarget: target })
}

/**
 * Toggle daily goal opt-in
 */
export function toggleDailyGoalOptIn(enabled: boolean): void {
  updatePreferences({ dailyGoalOptIn: enabled })
}

/**
 * Pinned Notes Management
 */

const MAX_PINNED_NOTES = 5

/**
 * Get list of pinned note IDs
 */
export function getPinnedNoteIds(): string[] {
  const prefs = loadPreferences()
  return prefs.pinnedNoteIds || []
}

/**
 * Check if a note is pinned
 */
export function isNotePinned(noteId: string): boolean {
  return getPinnedNoteIds().includes(noteId)
}

/**
 * Pin a note (add to pinned list)
 * Returns false if already at max or already pinned
 */
export function pinNote(noteId: string): boolean {
  const pinned = getPinnedNoteIds()
  if (pinned.includes(noteId)) return false
  if (pinned.length >= MAX_PINNED_NOTES) return false

  updatePreferences({ pinnedNoteIds: [...pinned, noteId] })
  return true
}

/**
 * Unpin a note (remove from pinned list)
 */
export function unpinNote(noteId: string): void {
  const pinned = getPinnedNoteIds()
  updatePreferences({ pinnedNoteIds: pinned.filter(id => id !== noteId) })
}

/**
 * Toggle pin state
 */
export function togglePinNote(noteId: string): boolean {
  if (isNotePinned(noteId)) {
    unpinNote(noteId)
    return false
  } else {
    return pinNote(noteId)
  }
}
