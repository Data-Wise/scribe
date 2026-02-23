import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PomodoroTimer } from '../components/PomodoroTimer'
import { usePomodoroStore } from '../store/usePomodoroStore'

// Reset store before each test
beforeEach(() => {
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
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('PomodoroTimer', () => {
  describe('idle state', () => {
    it('renders with "Start" text when idle', () => {
      render(<PomodoroTimer />)
      expect(screen.getByText('Start')).toBeInTheDocument()
    })

    it('renders tomato emoji when idle', () => {
      render(<PomodoroTimer />)
      expect(screen.getByText('🍅')).toBeInTheDocument()
    })

    it('has correct aria-label when idle', () => {
      render(<PomodoroTimer />)
      const button = screen.getByTestId('pomodoro-timer')
      expect(button).toHaveAttribute('aria-label', expect.stringContaining('idle'))
    })

    it('does not show count badge when completedToday is 0', () => {
      render(<PomodoroTimer />)
      expect(screen.queryByText(/\d+\/\d+/)).not.toBeInTheDocument()
    })
  })

  describe('click to start', () => {
    it('transitions to work state on click', () => {
      render(<PomodoroTimer />)
      fireEvent.click(screen.getByTestId('pomodoro-timer'))
      expect(usePomodoroStore.getState().status).toBe('work')
    })

    it('shows countdown timer after starting', () => {
      render(<PomodoroTimer />)
      fireEvent.click(screen.getByTestId('pomodoro-timer'))
      expect(screen.getByText('25:00')).toBeInTheDocument()
    })

    it('counts down each second', () => {
      render(<PomodoroTimer />)
      fireEvent.click(screen.getByTestId('pomodoro-timer'))

      act(() => { vi.advanceTimersByTime(1000) })
      expect(screen.getByText('24:59')).toBeInTheDocument()

      act(() => { vi.advanceTimersByTime(1000) })
      expect(screen.getByText('24:58')).toBeInTheDocument()
    })
  })

  describe('click to pause', () => {
    it('pauses on second click', () => {
      render(<PomodoroTimer />)
      const btn = screen.getByTestId('pomodoro-timer')

      fireEvent.click(btn) // start
      act(() => { vi.advanceTimersByTime(3000) })

      fireEvent.click(btn) // pause
      expect(usePomodoroStore.getState().isPaused).toBe(true)
    })

    it('shows pause icon when paused', () => {
      render(<PomodoroTimer />)
      const btn = screen.getByTestId('pomodoro-timer')

      fireEvent.click(btn) // start
      fireEvent.click(btn) // pause

      expect(screen.getByText('⏸')).toBeInTheDocument()
    })

    it('stops countdown when paused', () => {
      render(<PomodoroTimer />)
      const btn = screen.getByTestId('pomodoro-timer')

      fireEvent.click(btn) // start
      act(() => { vi.advanceTimersByTime(5000) })

      fireEvent.click(btn) // pause
      const timeAfterPause = screen.getByTestId('pomodoro-timer').textContent

      act(() => { vi.advanceTimersByTime(5000) })
      expect(screen.getByTestId('pomodoro-timer').textContent).toBe(timeAfterPause)
    })

    it('resumes on third click', () => {
      render(<PomodoroTimer />)
      const btn = screen.getByTestId('pomodoro-timer')

      fireEvent.click(btn) // start
      act(() => { vi.advanceTimersByTime(3000) })

      fireEvent.click(btn) // pause
      fireEvent.click(btn) // resume

      expect(usePomodoroStore.getState().isPaused).toBe(false)
      expect(usePomodoroStore.getState().status).toBe('work')
    })
  })

  describe('right-click to reset', () => {
    it('resets to idle on right-click', () => {
      render(<PomodoroTimer />)
      const btn = screen.getByTestId('pomodoro-timer')

      fireEvent.click(btn) // start
      act(() => { vi.advanceTimersByTime(5000) })

      fireEvent.contextMenu(btn) // right-click

      expect(usePomodoroStore.getState().status).toBe('idle')
      expect(screen.getByText('Start')).toBeInTheDocument()
    })
  })

  describe('pomodoro completion', () => {
    it('calls onPomodoroComplete when work timer finishes', () => {
      const onComplete = vi.fn()
      render(<PomodoroTimer onPomodoroComplete={onComplete} />)

      fireEvent.click(screen.getByTestId('pomodoro-timer')) // start

      // Fast-forward to completion (25 min = 1500s)
      act(() => { vi.advanceTimersByTime(1500 * 1000) })

      expect(onComplete).toHaveBeenCalledOnce()
    })

    it('transitions to break after work completion', () => {
      render(<PomodoroTimer />)
      fireEvent.click(screen.getByTestId('pomodoro-timer'))

      act(() => { vi.advanceTimersByTime(1500 * 1000) })

      expect(usePomodoroStore.getState().status).toBe('short-break')
    })

    it('shows coffee emoji during break', () => {
      render(<PomodoroTimer />)
      fireEvent.click(screen.getByTestId('pomodoro-timer'))

      act(() => { vi.advanceTimersByTime(1500 * 1000) })

      expect(screen.getByText('☕')).toBeInTheDocument()
    })

    it('shows count badge after completing a pomodoro', () => {
      render(<PomodoroTimer />)
      fireEvent.click(screen.getByTestId('pomodoro-timer'))

      act(() => { vi.advanceTimersByTime(1500 * 1000) })

      expect(screen.getByText('(1/4)')).toBeInTheDocument()
    })
  })

  describe('break completion', () => {
    it('calls onBreakComplete when break timer finishes', () => {
      const onBreakComplete = vi.fn()
      render(<PomodoroTimer onBreakComplete={onBreakComplete} />)

      // Start and complete a work session
      fireEvent.click(screen.getByTestId('pomodoro-timer'))
      act(() => { vi.advanceTimersByTime(1500 * 1000) })

      // Now in short break (300s) — complete it
      act(() => { vi.advanceTimersByTime(300 * 1000) })

      expect(onBreakComplete).toHaveBeenCalledOnce()
    })

    it('returns to idle after break', () => {
      render(<PomodoroTimer />)
      fireEvent.click(screen.getByTestId('pomodoro-timer'))

      // Complete work + break
      act(() => { vi.advanceTimersByTime(1500 * 1000) }) // work done
      act(() => { vi.advanceTimersByTime(300 * 1000) })  // break done

      expect(usePomodoroStore.getState().status).toBe('idle')
      expect(screen.getByText('Start')).toBeInTheDocument()
    })
  })

  describe('count display', () => {
    it('shows count as completed/nextTarget', () => {
      usePomodoroStore.setState({ completedToday: 2 })
      render(<PomodoroTimer />)
      expect(screen.getByText('(2/4)')).toBeInTheDocument()
    })

    it('shows next cycle target after completing 4', () => {
      usePomodoroStore.setState({ completedToday: 5 })
      render(<PomodoroTimer />)
      expect(screen.getByText('(5/8)')).toBeInTheDocument()
    })

    it('hides count when completedToday is 0', () => {
      render(<PomodoroTimer />)
      expect(screen.queryByText(/\(\d+\/\d+\)/)).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has aria-live="polite"', () => {
      render(<PomodoroTimer />)
      expect(screen.getByTestId('pomodoro-timer')).toHaveAttribute('aria-live', 'polite')
    })

    it('has descriptive aria-label during work', () => {
      render(<PomodoroTimer />)
      fireEvent.click(screen.getByTestId('pomodoro-timer'))

      const label = screen.getByTestId('pomodoro-timer').getAttribute('aria-label')
      expect(label).toContain('working')
      expect(label).toContain('remaining')
    })

    it('has descriptive aria-label when paused', () => {
      render(<PomodoroTimer />)
      const btn = screen.getByTestId('pomodoro-timer')
      fireEvent.click(btn)
      fireEvent.click(btn) // pause

      const label = btn.getAttribute('aria-label')
      expect(label).toContain('paused')
    })
  })

  describe('title tooltip', () => {
    it('shows start shortcut when idle', () => {
      render(<PomodoroTimer />)
      expect(screen.getByTestId('pomodoro-timer')).toHaveAttribute('title', expect.stringContaining('Start Pomodoro'))
    })

    it('shows pause instruction when running', () => {
      render(<PomodoroTimer />)
      fireEvent.click(screen.getByTestId('pomodoro-timer'))
      expect(screen.getByTestId('pomodoro-timer')).toHaveAttribute('title', expect.stringContaining('Pause'))
    })

    it('shows resume instruction when paused', () => {
      render(<PomodoroTimer />)
      const btn = screen.getByTestId('pomodoro-timer')
      fireEvent.click(btn)
      fireEvent.click(btn) // pause
      expect(btn).toHaveAttribute('title', expect.stringContaining('Resume'))
    })
  })
})
