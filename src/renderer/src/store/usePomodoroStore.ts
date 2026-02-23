import { create } from 'zustand'
import { loadPreferences } from '../lib/preferences'

export type PomodoroStatus = 'idle' | 'work' | 'short-break' | 'long-break'

export interface PomodoroState {
  // Timer state
  status: PomodoroStatus
  secondsRemaining: number
  isPaused: boolean
  completedToday: number
  lastResetDate: string // ISO date (YYYY-MM-DD)

  // Config (loaded from preferences)
  workDuration: number       // seconds
  shortBreakDuration: number // seconds
  longBreakDuration: number  // seconds
  longBreakInterval: number  // every N pomodoros

  // Actions
  start: () => void
  pause: () => void
  reset: () => void
  tick: (onComplete?: () => void, onBreakComplete?: () => void) => void
  syncPreferences: () => void
}

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function loadDurationsFromPrefs() {
  const prefs = loadPreferences()
  return {
    workDuration: prefs.pomodoroWorkMinutes * 60,
    shortBreakDuration: prefs.pomodoroShortBreakMinutes * 60,
    longBreakDuration: prefs.pomodoroLongBreakMinutes * 60,
    longBreakInterval: prefs.pomodoroLongBreakInterval,
  }
}

export const usePomodoroStore = create<PomodoroState>((set, get) => {
  const durations = loadDurationsFromPrefs()

  return {
    status: 'idle',
    secondsRemaining: durations.workDuration,
    isPaused: false,
    completedToday: 0,
    lastResetDate: getToday(),
    ...durations,

    start: () => {
      const state = get()
      const today = getToday()

      // Midnight reset: if date changed, reset count
      if (state.lastResetDate !== today) {
        set({ completedToday: 0, lastResetDate: today })
      }

      if (state.status === 'idle') {
        // Fresh start — begin work session
        set({
          status: 'work',
          isPaused: false,
          secondsRemaining: state.workDuration,
        })
      } else if (state.isPaused) {
        // Resume from pause
        set({ isPaused: false })
      }
    },

    pause: () => {
      const state = get()
      if ((state.status === 'work' || state.status === 'short-break' || state.status === 'long-break') && !state.isPaused) {
        set({ isPaused: true })
      }
    },

    reset: () => {
      const state = get()
      set({
        status: 'idle',
        isPaused: false,
        secondsRemaining: state.workDuration,
      })
    },

    tick: (onComplete?: () => void, onBreakComplete?: () => void) => {
      const state = get()

      // Don't tick if idle or paused
      if (state.status === 'idle' || state.isPaused) return

      const next = state.secondsRemaining - 1

      if (next <= 0) {
        if (state.status === 'work') {
          // Work session complete — transition to break
          const newCount = state.completedToday + 1
          const isLongBreak = newCount % state.longBreakInterval === 0
          const breakDuration = isLongBreak ? state.longBreakDuration : state.shortBreakDuration
          const breakStatus: PomodoroStatus = isLongBreak ? 'long-break' : 'short-break'

          set({
            status: breakStatus,
            secondsRemaining: breakDuration,
            completedToday: newCount,
            isPaused: false,
          })

          // Notify component for auto-save and toast
          onComplete?.()
        } else {
          // Break complete — go back to idle
          set({
            status: 'idle',
            secondsRemaining: state.workDuration,
            isPaused: false,
          })

          // Notify component for break-over toast
          onBreakComplete?.()
        }
      } else {
        set({ secondsRemaining: next })
      }
    },

    syncPreferences: () => {
      const state = get()
      const durations = loadDurationsFromPrefs()

      // Always update config values
      const updates: Partial<PomodoroState> = { ...durations }

      // If idle, also reset the display to new work duration
      if (state.status === 'idle') {
        updates.secondsRemaining = durations.workDuration
      }

      set(updates)
    },
  }
})
