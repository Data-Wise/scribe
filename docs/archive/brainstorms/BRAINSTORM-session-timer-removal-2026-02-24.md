# Brainstorm: Session Timer Removal & Pomodoro Consolidation

**Date:** 2026-02-24
**Mode:** deep feature
**Decision:** Remove session timer entirely, keep Pomodoro in status bar

## Problem Statement

Two overlapping timers in the UI cause confusion:
- **Session timer** (top-right breadcrumb): Counts up from app open, persists via localStorage, shows absurd values like `2296:20` across restarts
- **Pomodoro timer** (status bar): Countdown work/break cycles, meaningful focus tracking

The session timer is confusing (two timers), useless (raw elapsed time has no value), and buggy (persists forever via localStorage).

## Decisions

1. **Remove all session time tracking** — word count + Pomodoro count are enough context
2. **Keep Pomodoro in status bar only** — subtle, near word count, correct location
3. **Replace StatsPanel "Duration" card** with Pomodoro completed count from store
4. **Full cleanup** of ~80 lines of raw useState/localStorage from App.tsx

## Implementation Plan (Bottom-Up)

### Step 1: Strip Leaf Components

**WritingProgress.tsx:**
- Remove `sessionStartTime` prop
- Remove `sessionDuration` state and interval
- Remove Clock icon + duration display
- Keep: word delta, progress bar, streak, milestones

**StatsPanel.tsx:**
- Remove `sessionStartTime` prop and `sessionDuration` memo
- Remove "Duration" card from Session section
- Add `usePomodoroStore(s => s.completedToday)` subscription
- Replace Duration card with "🍅 X completed" card

### Step 2: Strip Intermediate Components

**EditorOrchestrator.tsx:**
- Remove `sessionStartTime` from props interface
- Remove prop pass-through to children

**HybridEditor.tsx:**
- Remove `sessionStartTime` from props interface
- Remove prop pass-through to WritingProgress

### Step 3: Clean Up App.tsx

Remove from state:
- `sessionStart` + localStorage persistence
- `sessionDuration` + interval
- `timerPaused` + localStorage persistence
- `pausedDuration` + localStorage persistence
- `formatSessionTime()` function
- `toggleTimerPause()` function
- `resetTimer()` function

Remove from UI:
- `.focus-timer` div in breadcrumb bar (⏸/▶ + ↺ controls)

Remove localStorage keys:
- `sessionStart`
- `timerPaused`
- `pausedDuration`
- `pauseStart`

### Step 4: Update Tests

- `StatsPanel.test.tsx` — remove sessionStartTime prop, add Pomodoro count assertions
- `EditorOrchestrator.test.tsx` — remove sessionStartTime from mock props
- Any WritingProgress tests — remove sessionStartTime

## Files Affected

| File | Action | ~Lines |
|------|--------|--------|
| `App.tsx` | Remove state, effects, UI | -80 |
| `WritingProgress.tsx` | Remove session timer section | -25 |
| `StatsPanel.tsx` | Replace Duration with Pomodoro | ±15 |
| `HybridEditor.tsx` | Remove prop pass-through | -5 |
| `EditorOrchestrator.tsx` | Remove prop pass-through | -5 |
| `StatsPanel.test.tsx` | Update props + assertions | ±10 |
| `EditorOrchestrator.test.tsx` | Update mock props | -2 |

**Net:** ~-110 lines removed, ~+15 added = **~-95 lines**
