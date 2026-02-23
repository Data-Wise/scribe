import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePomodoroStore } from '../store/usePomodoroStore'

// Helper to get fresh store state and actions
function getStore() {
  return usePomodoroStore.getState()
}

describe('usePomodoroStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    usePomodoroStore.setState({
      status: 'idle',
      secondsRemaining: 1500,
      isPaused: false,
      completedToday: 0,
      lastResetDate: new Date().toISOString().split('T')[0],
      workDuration: 1500,
      shortBreakDuration: 300,
      longBreakDuration: 900,
      longBreakInterval: 4,
    })
    localStorage.clear()
  })

  describe('initial state', () => {
    it('starts in idle status', () => {
      expect(getStore().status).toBe('idle')
    })

    it('has 25 minutes (1500s) as default work duration', () => {
      expect(getStore().secondsRemaining).toBe(1500)
    })

    it('has zero completed today', () => {
      expect(getStore().completedToday).toBe(0)
    })

    it('is not paused', () => {
      expect(getStore().isPaused).toBe(false)
    })
  })

  describe('start()', () => {
    it('transitions from idle to work status', () => {
      getStore().start()
      expect(getStore().status).toBe('work')
    })

    it('sets secondsRemaining to workDuration on fresh start', () => {
      getStore().start()
      expect(getStore().secondsRemaining).toBe(1500)
    })

    it('sets isPaused to false', () => {
      getStore().start()
      expect(getStore().isPaused).toBe(false)
    })

    it('resumes from pause without resetting time', () => {
      getStore().start()
      // Tick a few times
      getStore().tick()
      getStore().tick()
      getStore().tick()
      expect(getStore().secondsRemaining).toBe(1497)

      // Pause then resume
      getStore().pause()
      getStore().start()
      expect(getStore().secondsRemaining).toBe(1497)
      expect(getStore().isPaused).toBe(false)
    })

    it('resets completedToday on midnight (date change)', () => {
      // Set up: pretend we had 3 completed yesterday
      usePomodoroStore.setState({
        completedToday: 3,
        lastResetDate: '2026-02-22', // yesterday
      })

      getStore().start()
      expect(getStore().completedToday).toBe(0)
      expect(getStore().lastResetDate).toBe(new Date().toISOString().split('T')[0])
    })

    it('does not reset count if same day', () => {
      usePomodoroStore.setState({
        completedToday: 3,
        lastResetDate: new Date().toISOString().split('T')[0],
      })

      getStore().start()
      expect(getStore().completedToday).toBe(3)
    })
  })

  describe('pause()', () => {
    it('pauses a running work session', () => {
      getStore().start()
      getStore().pause()
      expect(getStore().isPaused).toBe(true)
      expect(getStore().status).toBe('work')
    })

    it('preserves secondsRemaining when paused', () => {
      getStore().start()
      getStore().tick()
      getStore().tick()
      const remaining = getStore().secondsRemaining
      getStore().pause()
      expect(getStore().secondsRemaining).toBe(remaining)
    })

    it('does nothing when idle', () => {
      getStore().pause()
      expect(getStore().isPaused).toBe(false)
      expect(getStore().status).toBe('idle')
    })

    it('does nothing when already paused', () => {
      getStore().start()
      getStore().pause()
      expect(getStore().isPaused).toBe(true)
      getStore().pause()
      expect(getStore().isPaused).toBe(true)
    })
  })

  describe('reset()', () => {
    it('returns to idle from work', () => {
      getStore().start()
      getStore().reset()
      expect(getStore().status).toBe('idle')
      expect(getStore().secondsRemaining).toBe(1500)
      expect(getStore().isPaused).toBe(false)
    })

    it('returns to idle from break', () => {
      // Simulate completing a pomodoro to get to break
      usePomodoroStore.setState({
        status: 'short-break',
        secondsRemaining: 200,
      })
      getStore().reset()
      expect(getStore().status).toBe('idle')
      expect(getStore().secondsRemaining).toBe(1500)
    })

    it('preserves completedToday on reset', () => {
      usePomodoroStore.setState({ completedToday: 2 })
      getStore().start()
      getStore().reset()
      expect(getStore().completedToday).toBe(2)
    })
  })

  describe('tick()', () => {
    it('decrements secondsRemaining by 1', () => {
      getStore().start()
      getStore().tick()
      expect(getStore().secondsRemaining).toBe(1499)
    })

    it('does nothing when idle', () => {
      getStore().tick()
      expect(getStore().secondsRemaining).toBe(1500)
    })

    it('does nothing when paused', () => {
      getStore().start()
      getStore().tick()
      getStore().pause()
      const remaining = getStore().secondsRemaining
      getStore().tick()
      expect(getStore().secondsRemaining).toBe(remaining)
    })

    it('transitions to short-break when work timer hits 0', () => {
      getStore().start()
      usePomodoroStore.setState({ secondsRemaining: 1 })
      getStore().tick()

      expect(getStore().status).toBe('short-break')
      expect(getStore().secondsRemaining).toBe(300) // 5 min short break
      expect(getStore().completedToday).toBe(1)
    })

    it('transitions to long-break on every Nth pomodoro', () => {
      usePomodoroStore.setState({ completedToday: 3 }) // Next will be 4th
      getStore().start()
      usePomodoroStore.setState({ secondsRemaining: 1 })
      getStore().tick()

      expect(getStore().status).toBe('long-break')
      expect(getStore().secondsRemaining).toBe(900) // 15 min long break
      expect(getStore().completedToday).toBe(4)
    })

    it('transitions to idle when break timer hits 0', () => {
      usePomodoroStore.setState({
        status: 'short-break',
        secondsRemaining: 1,
      })
      getStore().tick()

      expect(getStore().status).toBe('idle')
      expect(getStore().secondsRemaining).toBe(1500)
    })

    it('calls onComplete when work session finishes', () => {
      const onComplete = vi.fn()
      getStore().start()
      usePomodoroStore.setState({ secondsRemaining: 1 })
      getStore().tick(onComplete)

      expect(onComplete).toHaveBeenCalledOnce()
    })

    it('does not call onComplete when break finishes', () => {
      const onComplete = vi.fn()
      usePomodoroStore.setState({
        status: 'short-break',
        secondsRemaining: 1,
      })
      getStore().tick(onComplete)

      expect(onComplete).not.toHaveBeenCalled()
    })

    it('does not call onComplete during normal countdown', () => {
      const onComplete = vi.fn()
      getStore().start()
      getStore().tick(onComplete)
      getStore().tick(onComplete)

      expect(onComplete).not.toHaveBeenCalled()
    })
  })

  describe('long break interval logic', () => {
    it('gives short break after 1st, 2nd, 3rd pomodoros', () => {
      for (let i = 0; i < 3; i++) {
        getStore().start()
        usePomodoroStore.setState({ secondsRemaining: 1 })
        getStore().tick()
        expect(getStore().status).toBe('short-break')
        // Finish break to go back to idle
        usePomodoroStore.setState({ secondsRemaining: 1 })
        getStore().tick()
      }
      expect(getStore().completedToday).toBe(3)
    })

    it('gives long break after 4th pomodoro', () => {
      usePomodoroStore.setState({ completedToday: 3 })
      getStore().start()
      usePomodoroStore.setState({ secondsRemaining: 1 })
      getStore().tick()

      expect(getStore().status).toBe('long-break')
      expect(getStore().completedToday).toBe(4)
    })

    it('gives long break after 8th pomodoro', () => {
      usePomodoroStore.setState({ completedToday: 7 })
      getStore().start()
      usePomodoroStore.setState({ secondsRemaining: 1 })
      getStore().tick()

      expect(getStore().status).toBe('long-break')
      expect(getStore().completedToday).toBe(8)
    })

    it('gives short break after 5th pomodoro (not multiple of 4)', () => {
      usePomodoroStore.setState({ completedToday: 4 })
      getStore().start()
      usePomodoroStore.setState({ secondsRemaining: 1 })
      getStore().tick()

      expect(getStore().status).toBe('short-break')
      expect(getStore().completedToday).toBe(5)
    })
  })

  describe('syncPreferences()', () => {
    it('updates durations from preferences', () => {
      // Simulate changed preferences in localStorage
      localStorage.setItem('scribe-preferences', JSON.stringify({
        pomodoroWorkMinutes: 30,
        pomodoroShortBreakMinutes: 10,
        pomodoroLongBreakMinutes: 20,
        pomodoroLongBreakInterval: 3,
      }))

      getStore().syncPreferences()

      expect(getStore().workDuration).toBe(1800) // 30 * 60
      expect(getStore().shortBreakDuration).toBe(600)
      expect(getStore().longBreakDuration).toBe(1200)
      expect(getStore().longBreakInterval).toBe(3)
    })

    it('updates secondsRemaining when idle', () => {
      localStorage.setItem('scribe-preferences', JSON.stringify({
        pomodoroWorkMinutes: 30,
        pomodoroShortBreakMinutes: 10,
        pomodoroLongBreakMinutes: 20,
        pomodoroLongBreakInterval: 3,
      }))

      getStore().syncPreferences()
      expect(getStore().secondsRemaining).toBe(1800)
    })

    it('does not change secondsRemaining when running', () => {
      getStore().start()
      getStore().tick()
      getStore().tick()
      const remaining = getStore().secondsRemaining

      localStorage.setItem('scribe-preferences', JSON.stringify({
        pomodoroWorkMinutes: 30,
      }))

      getStore().syncPreferences()
      expect(getStore().secondsRemaining).toBe(remaining) // unchanged
      expect(getStore().workDuration).toBe(1800) // config updated for next session
    })
  })

  describe('today count display', () => {
    it('tracks count as X/longBreakInterval format data', () => {
      const state = getStore()
      expect(state.completedToday).toBe(0)
      expect(state.longBreakInterval).toBe(4)
      // Component renders as "0/4"
    })

    it('continues counting beyond one cycle', () => {
      usePomodoroStore.setState({ completedToday: 5 })
      expect(getStore().completedToday).toBe(5)
      // Component renders as "5/8" (next multiple of 4)
    })
  })
})
