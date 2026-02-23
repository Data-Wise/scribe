# Pomodoro Timer — Scribe Status Bar

**Status:** draft
**Created:** 2026-02-23
**Branch:** `feature/pomodoro`

---

## Overview

A minimal pomodoro timer embedded in Scribe's editor status bar (bottom bar of `HybridEditor.tsx`). It sits alongside the existing word count and WritingProgress components. The timer counts down, auto-saves a snapshot when each pomodoro completes, and gently suggests breaks. No tracking database — just today's count, resetting tomorrow.

---

## Primary User Story

**As a** writer using Scribe for academic/creative work,
**I want** a simple pomodoro countdown in my status bar,
**So that** I can time-box writing sessions without leaving the app or cluttering my menu bar.

### Acceptance Criteria

- [ ] Pomodoro timer visible in status bar (between WritingProgress and Quick Chat button)
- [ ] Click to start/pause, right-click or long-press to reset
- [ ] Default: 25 min work / 5 min short break / 15 min long break (every 4th)
- [ ] Durations configurable in Settings > General
- [ ] Gentle break notification (subtle inline indicator, not a modal)
- [ ] Auto-save current note when a pomodoro completes
- [ ] Show today's completed pomodoro count (e.g., "3/4") — resets at midnight
- [ ] Timer state survives tab switches (changing notes doesn't reset timer)
- [ ] Respects `prefers-reduced-motion` (no animations if set)
- [x] ~~Keyboard shortcut~~ — Removed: `⌘⇧P` conflicted with New Project. Use click to start/pause.

---

## Secondary User Stories

**As a** writer prone to hyperfocus,
**I want** a gentle nudge when my pomodoro ends,
**So that** I remember to take breaks without being forcefully interrupted.

**As a** writer who loses work to crashes,
**I want** auto-save triggered on pomodoro completion,
**So that** I always have a recent save point.

---

## Architecture

### Component Hierarchy

```
HybridEditor (status bar div, line 420-480)
├── Mode indicator (Source/Live Preview/Reading)
├── WritingProgress (existing)
├── PomodoroTimer (NEW) ← sits between progress and Quick Chat
├── Quick Chat button
└── Terminal button
```

### State Management

Timer state lives in a **Zustand store** (`usePomodoroStore`), NOT in component state. This ensures:
- Timer survives note switches (HybridEditor re-renders)
- Timer survives sidebar toggles
- Single source of truth for all status bar instances

```
usePomodoroStore {
  // Timer state
  status: 'idle' | 'work' | 'short-break' | 'long-break'
  secondsRemaining: number
  completedToday: number
  lastResetDate: string  // ISO date — for midnight reset

  // Config (from preferences)
  workDuration: number      // seconds, default 1500 (25 min)
  shortBreakDuration: number // seconds, default 300 (5 min)
  longBreakDuration: number  // seconds, default 900 (15 min)
  longBreakInterval: number  // every N pomodoros, default 4

  // Actions
  start(): void
  pause(): void
  reset(): void
  tick(): void              // called every 1s by setInterval
  completePomodoro(): void  // increment count, trigger save, start break
}
```

### Auto-Save Integration

When a pomodoro completes (`completePomodoro()`):
1. Call `api.updateNote()` on the currently selected note (from App state)
2. Show a subtle toast: "Pomodoro complete — note saved"
3. Transition to break state

This reuses the existing `api.updateNote` — no new API surface needed.

### Settings Integration

Add to `UserPreferences` interface in `preferences.ts`:

```ts
// Pomodoro preferences (v1.19)
pomodoroEnabled: boolean              // Show timer in status bar (default: true)
pomodoroWorkMinutes: number           // Work duration in minutes (default: 25)
pomodoroShortBreakMinutes: number     // Short break in minutes (default: 5)
pomodoroLongBreakMinutes: number      // Long break in minutes (default: 15)
pomodoroLongBreakInterval: number     // Long break every N pomodoros (default: 4)
```

Add a "Focus Timer" section to Settings > General tab.

---

## API Design

N/A — No new API endpoints. Uses existing `api.updateNote()` for auto-save.

---

## Data Models

N/A — No database changes. Timer state is ephemeral (Zustand store). Today's count resets at midnight via date comparison.

---

## Dependencies

- **None new.** Uses existing:
  - `zustand` (already in project for other stores)
  - `lucide-react` (for timer icon — `Timer` or `Clock`)
  - `api.updateNote()` (for auto-save)
  - Toast system (for gentle notifications)

---

## UI/UX Specifications

### Status Bar Layout

```
┌──────────────────────────────────────────────────────────┐
│ Source ⌘E  │  ██▓░░ 67% │ 🍅 22:14 (2/4) │  ✨  │  >_ │
│            │  progress   │  pomodoro       │ chat │ term│
└──────────────────────────────────────────────────────────┘
```

### Timer States (Visual)

| State | Display | Color |
|-------|---------|-------|
| Idle | `🍅 Start` | `--nexus-text-muted` (dim) |
| Work | `🍅 22:14` | `--nexus-accent` (theme accent) |
| Short Break | `☕ 4:32` | `--nexus-success` or green-ish |
| Long Break | `☕ 12:08` | `--nexus-success` or green-ish |
| Paused | `🍅 ⏸ 22:14` | `--nexus-text-muted` (dim, blinking) |

### Today's Count

Shown as `(2/4)` where 4 = `longBreakInterval`. After the 4th pomodoro and long break, counter continues: `(5/8)`, `(6/8)`, etc.

### Break Nudge

When work timer hits 0:
- Status bar text changes to break state with `☕` icon
- Subtle toast: "Time for a break! ☕" (auto-dismisses in 5s)
- No modal, no overlay, no editor lock

### Accessibility

- Timer updates via `aria-live="polite"` region (screen readers announce changes)
- Keyboard shortcut removed (conflicted with `⌘⇧N` New Project) — use click to start/pause
- `prefers-reduced-motion`: no blinking on pause state, just dim text
- All colors inherit from theme variables (works in all themes)

---

## Open Questions

- [ ] Should pomodoro count contribute to the writing streak system?
- [ ] Should the timer be visible when no note is selected (empty editor state)?

---

## Review Checklist

- [ ] Component renders correctly in all themes (dark + light)
- [ ] Timer survives note switches
- [ ] Auto-save fires on pomodoro completion
- [ ] Midnight reset works (change system clock or mock date)
- [ ] Settings changes apply immediately to running timer
- [x] ~~`Cmd+Shift+P` shortcut~~ — Removed (conflicted with New Project)
- [ ] Screen reader announces timer state changes
- [ ] Tests cover: start/pause/reset, tick countdown, completion, midnight reset

---

## Implementation Notes

- The status bar is inside `HybridEditor.tsx` (line 420-480). The pomodoro component slots in at line ~443, between `WritingProgress` and the Quick Chat button.
- Timer interval (`setInterval`) must be managed carefully — clear on unmount, don't leak. Use a `useEffect` in the Zustand store subscriber or in the component.
- `requestAnimationFrame` is NOT needed — 1-second precision is fine for a pomodoro.
- The `completePomodoro` action needs access to the current note ID. Pass it as a callback prop or subscribe to the note store.

---

## History

| Date | Change |
|------|--------|
| 2026-02-23 | Initial spec from brainstorm session |
