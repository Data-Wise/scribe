import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  loadPreferences,
  savePreferences,
  updatePreferences,
  updateStreak,
  getStreakInfo,
  resetStreak,
  UserPreferences
} from '../lib/preferences'

describe('User Preferences & Gamification Validation', () => {
  
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Persistence', () => {
    it('loads default preferences when storage is empty', () => {
      const prefs = loadPreferences()
      expect(prefs.defaultWordGoal).toBe(500)
      expect(prefs.focusModeEnabled).toBe(false)
      expect(prefs.currentStreak).toBe(0)
    })

    it('saves and loads preferences correctly', () => {
      const newPrefs: UserPreferences = {
        ...loadPreferences(),
        defaultWordGoal: 1000,
        focusModeEnabled: true
      }
      
      savePreferences(newPrefs)
      
      const loaded = loadPreferences()
      expect(loaded.defaultWordGoal).toBe(1000)
      expect(loaded.focusModeEnabled).toBe(true)
    })

    it('updates specific preferences without overwriting others', () => {
      updatePreferences({ defaultWordGoal: 750 })
      
      const loaded = loadPreferences()
      expect(loaded.defaultWordGoal).toBe(750)
      expect(loaded.celebrateMilestones).toBe(true) // Default preserved
    })
  })

  describe('Streak Calculation (Validation)', () => {
    it('increments streak on consecutive days', () => {
      // Day 1: Write some words
      vi.setSystemTime(new Date('2025-01-01T12:00:00'))
      updateStreak(100)
      
      let info = getStreakInfo()
      expect(info.streak).toBe(1) 
      
      expect(loadPreferences().currentStreak).toBe(1)
      expect(getStreakInfo().isActiveToday).toBe(true)

      // Day 2: Write more words
      vi.setSystemTime(new Date('2025-01-02T12:00:00'))
      updateStreak(50)
      
      expect(loadPreferences().currentStreak).toBe(2)
    })

    it('resets streak if a day is skipped', () => {
      // Day 1
      vi.setSystemTime(new Date('2025-01-01T12:00:00'))
      updateStreak(100)
      expect(loadPreferences().currentStreak).toBe(1)

      // Day 3 (Skipped Jan 2)
      vi.setSystemTime(new Date('2025-01-03T12:00:00'))
      updateStreak(50)
      
      expect(loadPreferences().currentStreak).toBe(1) // Reset to 1 (new streak)
    })

    it('does not increment streak multiple times in same day', () => {
      vi.setSystemTime(new Date('2025-01-01T10:00:00'))
      updateStreak(100)
      expect(loadPreferences().currentStreak).toBe(1)

      vi.setSystemTime(new Date('2025-01-01T14:00:00'))
      updateStreak(100)
      expect(loadPreferences().currentStreak).toBe(1) // Still 1
    })

    it('maintains streak info correctly', () => {
      vi.setSystemTime(new Date('2025-01-01T12:00:00'))
      updateStreak(100)
      
      const info = getStreakInfo()
      expect(info.streak).toBe(1)
      expect(info.isActiveToday).toBe(true)
    })
    
    it('resets streak manually', () => {
      updateStreak(100)
      expect(loadPreferences().currentStreak).toBe(1)
      
      resetStreak()
      expect(loadPreferences().currentStreak).toBe(0)
    })
  })
})
