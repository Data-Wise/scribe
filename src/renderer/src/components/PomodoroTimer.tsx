import { useEffect, useRef, useMemo, useCallback } from 'react'
import { usePomodoroStore } from '../store/usePomodoroStore'

interface PomodoroTimerProps {
  onPomodoroComplete?: () => void
  onBreakComplete?: () => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * PomodoroTimer — Status bar timer with click-to-toggle and right-click-to-reset.
 *
 * Subscribes to usePomodoroStore (Zustand). Manages the 1s tick interval internally.
 * Calls onPomodoroComplete when a work session finishes (for auto-save + toast).
 * Calls onBreakComplete when a break session finishes (for toast).
 */
export function PomodoroTimer({ onPomodoroComplete, onBreakComplete }: PomodoroTimerProps) {
  const status = usePomodoroStore(s => s.status)
  const secondsRemaining = usePomodoroStore(s => s.secondsRemaining)
  const isPaused = usePomodoroStore(s => s.isPaused)
  const completedToday = usePomodoroStore(s => s.completedToday)
  const longBreakInterval = usePomodoroStore(s => s.longBreakInterval)

  const start = usePomodoroStore(s => s.start)
  const pause = usePomodoroStore(s => s.pause)
  const reset = usePomodoroStore(s => s.reset)
  const tick = usePomodoroStore(s => s.tick)

  // Stable refs for callbacks to avoid interval recreation
  const onCompleteRef = useRef(onPomodoroComplete)
  const onBreakCompleteRef = useRef(onBreakComplete)
  onCompleteRef.current = onPomodoroComplete
  onBreakCompleteRef.current = onBreakComplete

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Tick interval — runs only when timer is active and not paused.
  // Both callbacks are passed symmetrically: work→break fires onComplete,
  // break→idle fires onBreakComplete. No effect-based detection needed.
  useEffect(() => {
    if (status === 'idle' || isPaused) return

    const interval = setInterval(() => {
      tick(
        () => onCompleteRef.current?.(),
        () => onBreakCompleteRef.current?.(),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [status, isPaused, tick])

  const handleClick = useCallback(() => {
    if (status === 'idle') {
      start()
    } else if (isPaused) {
      start()
    } else {
      pause()
    }
  }, [status, isPaused, start, pause])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    reset()
  }, [reset])

  // Count display: "2/4", "5/8" etc. — shows progress toward next long break.
  // Rounds up to the next multiple of longBreakInterval (e.g., 5 completed → target 8).
  const nextTarget = Math.ceil((completedToday + 1) / longBreakInterval) * longBreakInterval
  const countDisplay = `${completedToday}/${nextTarget}`

  // Visual state
  const isBreak = status === 'short-break' || status === 'long-break'
  const icon = isBreak ? '☕' : '🍅'
  const isActive = status !== 'idle'

  // Color based on state
  const colorStyle = useMemo(() => {
    if (status === 'idle') return { color: 'var(--nexus-text-muted)' }
    if (isBreak) return { color: 'var(--nexus-success, #22c55e)' }
    if (isPaused) return { color: 'var(--nexus-text-muted)' }
    return { color: 'var(--nexus-accent)' }
  }, [status, isBreak, isPaused])

  // Pause blink animation (respects reduced motion)
  const pauseClass = isPaused && !prefersReducedMotion ? 'animate-pulse' : ''

  return (
    <button
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors hover:bg-nexus-bg-tertiary/50 ${pauseClass}`}
      style={colorStyle}
      title={
        status === 'idle'
          ? 'Start Pomodoro'
          : isPaused
            ? 'Resume · Right-click to reset'
            : 'Pause · Right-click to reset'
      }
      data-testid="pomodoro-timer"
      aria-live="polite"
      aria-label={
        status === 'idle'
          ? `Pomodoro timer: idle. ${completedToday} completed today.`
          : isPaused
            ? `Pomodoro paused: ${formatTime(secondsRemaining)} remaining.`
            : `Pomodoro ${isBreak ? 'break' : 'working'}: ${formatTime(secondsRemaining)} remaining. ${completedToday} completed today.`
      }
    >
      <span className="text-xs" aria-hidden="true">{icon}</span>
      {isActive ? (
        <>
          {isPaused && <span className="text-xs" aria-hidden="true">⏸</span>}
          <span className="text-xs font-mono tabular-nums">{formatTime(secondsRemaining)}</span>
        </>
      ) : (
        <span className="text-xs">Start</span>
      )}
      {completedToday > 0 && (
        <span className="text-xs opacity-60" aria-hidden="true">({countDisplay})</span>
      )}
    </button>
  )
}
