# Remove Session Timer Orchestration Plan

> **Branch:** `feature/remove-session-timer`
> **Base:** `dev`
> **Worktree:** `~/.git-worktrees/scribe/feature-remove-session-timer`
> **Brainstorm:** `BRAINSTORM-session-timer-removal-2026-02-24.md`

## Objective

Remove the legacy session timer (top-right breadcrumb area) and consolidate all time-tracking into the Pomodoro timer (status bar). The session timer is confusing (two timers), useless (raw elapsed time), and buggy (localStorage persists forever, showing values like `2296:20`).

## Architecture Overview

**Two timers exist today:**

| Timer | Location | State | Purpose |
|-------|----------|-------|---------|
| Session timer | Top-right breadcrumb bar | `useState` in App.tsx + localStorage | Total elapsed time since app open |
| Pomodoro timer | Status bar | Zustand (`usePomodoroStore`) | Work/break cycle countdown |

**After this change:** Only the Pomodoro timer remains. StatsPanel gets a Pomodoro count card.

## Phase Overview (Bottom-Up Approach)

| Phase | Task | Files | Priority |
|-------|------|-------|----------|
| 1 | Strip `sessionStartTime` from leaf components | WritingProgress.tsx, StatsPanel.tsx | High |
| 2 | Strip prop threading from intermediate components | EditorOrchestrator.tsx, HybridEditor.tsx | High |
| 3 | Remove session timer state + UI from App.tsx | App.tsx | High |
| 4 | Add Pomodoro count to StatsPanel | StatsPanel.tsx | Medium |
| 5 | Update all affected tests | *.test.tsx | High |
| 6 | Clean up localStorage keys | App.tsx (removal already covers this) | Low |

## Phase 1: Strip Leaf Components

### WritingProgress.tsx
- Remove `sessionStartTime` from `WritingProgressProps` interface
- Remove `sessionDuration` state and `useEffect` interval
- Remove Clock icon import (if no longer used)
- Remove session timer JSX block (lines 139-144)
- Keep: word delta, progress bar, streak, milestone celebrations

### StatsPanel.tsx
- Remove `sessionStartTime` from `StatsPanelProps` interface
- Remove `sessionDuration` memo
- Remove the "Duration" card from the Session section grid
- Change grid from `grid-cols-2` to single column for Words card only (or remove Session section header and just show Words)

## Phase 2: Strip Intermediate Components

### EditorOrchestrator.tsx
- Remove `sessionStartTime` from props interface (line 29)
- Remove prop pass-through to HybridEditor and WritingProgress

### HybridEditor.tsx
- Remove `sessionStartTime` from props interface (line 32)
- Remove prop destructuring (line 62)
- Remove prop pass-through to WritingProgress (line 448)

## Phase 3: Remove from App.tsx

### State to delete (~80 lines):
- `sessionStart` useState + localStorage effect (lines 163-179)
- `sessionDuration` useState (line 167)
- `timerPaused` useState + localStorage effect (lines 168-184)
- `pausedDuration` useState + localStorage effect (lines 171-189)
- Timer interval useEffect (lines 191-197)
- `formatSessionTime()` function (lines 199-203)
- `toggleTimerPause()` function (lines 205-220)
- `resetTimer()` function (lines 221-228)

### UI to delete:
- `.focus-timer` div in breadcrumb bar (lines 1290-1309) — the ⏸/▶ + ↺ controls

### Props to remove:
- `sessionStartTime` from EditorOrchestrator calls
- `sessionStartTime` from HybridEditor calls
- Any other pass-throughs

### localStorage keys removed:
- `sessionStart`
- `timerPaused`
- `pausedDuration`
- `pauseStart`

## Phase 4: Add Pomodoro Count to StatsPanel

- Import `usePomodoroStore` in StatsPanel
- Subscribe to `completedToday`
- Replace the removed Duration card with a Pomodoro card showing count + tomato icon
- Format: "3 completed" with 🍅 icon

## Phase 5: Update Tests

### StatsPanel.test.tsx
- Remove `sessionStartTime` from `defaultProps`
- Remove tests that assert session duration display
- Add test for Pomodoro count display (mock `usePomodoroStore`)

### EditorOrchestrator.test.tsx
- Remove `sessionStartTime` from mock props (line 40)

### WritingProgress tests (if they exist)
- Remove `sessionStartTime` from test props
- Remove session timer display assertions

## Acceptance Criteria

- [ ] No session timer visible in breadcrumb bar
- [ ] Pomodoro timer in status bar still works (start/pause/reset)
- [ ] StatsPanel shows Pomodoro count instead of session duration
- [ ] WritingProgress shows word delta + progress bar (no session time)
- [ ] No `sessionStartTime` prop in any component interface
- [ ] No `sessionStart`/`timerPaused`/`pausedDuration`/`pauseStart` in localStorage
- [ ] All tests pass (`npm test`)
- [ ] App renders correctly in browser mode (preview)
- [ ] ~95 net lines removed

## How to Start

```bash
cd ~/.git-worktrees/scribe/feature-remove-session-timer
claude
```

Start with Phase 1 (leaf components), commit after each phase.
