# ORCHESTRATE: Pomodoro Timer

**Branch:** `feature/pomodoro`
**Spec:** `docs/specs/SPEC-pomodoro-2026-02-23.md`
**Estimated:** 3-4 increments

---

## Pre-flight

- [ ] Read the spec: `docs/specs/SPEC-pomodoro-2026-02-23.md`
- [ ] Read status bar layout: `src/renderer/src/components/HybridEditor.tsx` (lines 420-480)
- [ ] Read preferences: `src/renderer/src/lib/preferences.ts`
- [ ] Read Zustand store pattern: `src/renderer/src/stores/` (any existing store for reference)
- [ ] Run tests to confirm green baseline: `npx vitest run`

---

## Increment 1: Zustand Store + Preferences (~1.5h)

**Goal:** Timer logic works headlessly (no UI yet). Tests prove it.

### Tasks

1. **Add pomodoro preferences** to `src/renderer/src/lib/preferences.ts`:
   - Add 5 new fields to `UserPreferences` interface
   - Add defaults to `DEFAULT_PREFERENCES`
   - Fields: `pomodoroEnabled`, `pomodoroWorkMinutes`, `pomodoroShortBreakMinutes`, `pomodoroLongBreakMinutes`, `pomodoroLongBreakInterval`

2. **Create Zustand store** at `src/renderer/src/stores/usePomodoroStore.ts`:
   - State: `status`, `secondsRemaining`, `completedToday`, `lastResetDate`
   - Actions: `start()`, `pause()`, `reset()`, `tick()`, `completePomodoro()`
   - `tick()` decrements `secondsRemaining`; when 0, calls `completePomodoro()` or ends break
   - `completePomodoro()` increments `completedToday`, determines break type
   - Midnight reset: compare `lastResetDate` to today on each `start()`

3. **Write tests** at `src/renderer/src/__tests__/usePomodoroStore.test.ts`:
   - Test start/pause/reset transitions
   - Test tick countdown to zero triggers completion
   - Test short break vs long break selection (every Nth)
   - Test midnight reset (mock date)
   - Test pause preserves remaining time

### Commit

```
feat: add pomodoro Zustand store and preferences
```

---

## Increment 2: PomodoroTimer Component + Status Bar Integration (~1.5h)

**Goal:** Timer visible and interactive in the status bar.

### Tasks

1. **Create component** at `src/renderer/src/components/PomodoroTimer.tsx`:
   - Subscribe to `usePomodoroStore`
   - Render timer display: icon + MM:SS + count
   - Click handler: start/pause toggle
   - Right-click handler: reset
   - `useEffect` for `setInterval` tick (1s) — only when status is `work` or `*-break`
   - Cleanup interval on unmount
   - `aria-live="polite"` for accessibility
   - Respect `prefers-reduced-motion` for pause blink

2. **Integrate into HybridEditor.tsx**:
   - Import `PomodoroTimer`
   - Insert between `WritingProgress` (line 442) and Quick Chat button (line 444)
   - Pass `onAutoSave` callback prop (calls `api.updateNote` with current note)

3. **Wire auto-save** in `HybridEditor.tsx` or `App.tsx`:
   - `PomodoroTimer` receives `onPomodoroComplete` prop
   - When pomodoro completes, save the current note content via existing `handleContentChange` or direct `api.updateNote`

4. **Write tests** at `src/renderer/src/__tests__/PomodoroTimer.test.tsx`:
   - Renders idle state with "Start" text
   - Click starts timer, shows countdown
   - Click again pauses
   - Right-click resets to idle
   - Shows count badge after completion
   - Auto-save callback fires on completion

### Commit

```
feat: add PomodoroTimer component to editor status bar
```

---

## Increment 3: Settings UI + Keyboard Shortcut (~1h)

**Goal:** User can configure durations. Cmd+Shift+P works.

### Tasks

1. **Add Settings section** in `src/renderer/src/components/SettingsModal.tsx`:
   - In General tab, add "Focus Timer" section after existing writing settings
   - Toggle: Enable/disable pomodoro in status bar
   - Number inputs: Work duration, short break, long break (in minutes)
   - Number input: Long break interval
   - Use existing settings UI patterns (labels, inputs, descriptions)

2. **Register keyboard shortcut** `Cmd+Shift+P`:
   - Add to existing keyboard handler in `App.tsx` or `HybridEditor.tsx`
   - Toggle start/pause on the pomodoro store
   - Verify no conflict with existing shortcuts

3. **Connect preferences to store**:
   - When settings change, update the store's durations
   - If timer is idle, apply immediately
   - If timer is running, apply on next pomodoro (don't disrupt current)

4. **Write tests**:
   - Settings render with correct defaults
   - Changing work duration updates preference
   - Keyboard shortcut triggers start/pause
   - Disabling pomodoro hides the timer in status bar

### Commit

```
feat: add pomodoro settings and Cmd+Shift+P shortcut
```

---

## Increment 4: Polish + Break Nudge + Final Tests (~45min)

**Goal:** Gentle break notification. Full test coverage. PR-ready.

### Tasks

1. **Break nudge toast**:
   - When work timer completes, show toast: "Time for a break! ☕" (5s auto-dismiss)
   - When break timer completes, show toast: "Break's over — ready to write?" (5s auto-dismiss)
   - Use existing `showGlobalToast` from Toast system

2. **Theme compatibility**:
   - Test timer in Forest Night, Midnight Purple, and a light theme
   - Ensure all colors use CSS variables, no hardcoded colors

3. **Edge cases**:
   - Timer with no note selected (should still work, just skip auto-save)
   - Timer when switching between notes (shouldn't reset)
   - Multiple rapid start/pause clicks (debounce or ignore)

4. **Update docs**:
   - Add pomodoro to CHANGELOG
   - Update test counts in standard 5 locations

5. **Run full test suite**, confirm all pass

### Commit

```
feat: add break nudge toasts and polish pomodoro timer

chore: update changelog and test counts for pomodoro feature
```

---

## PR Checklist

- [ ] All 4 increments committed with conventional commits
- [ ] Full test suite green (target: ~2,210+ tests)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Timer works in Desktop Preview (browser mode)
- [ ] Timer works in Tauri build (if available)
- [ ] Settings persist across app restart
- [ ] CHANGELOG updated
- [ ] `gh pr create --base dev`

---

## Key Files

| File | Action |
|------|--------|
| `src/renderer/src/stores/usePomodoroStore.ts` | **CREATE** — Zustand store |
| `src/renderer/src/components/PomodoroTimer.tsx` | **CREATE** — UI component |
| `src/renderer/src/lib/preferences.ts` | **EDIT** — add 5 prefs |
| `src/renderer/src/components/HybridEditor.tsx` | **EDIT** — insert timer at line ~443 |
| `src/renderer/src/components/SettingsModal.tsx` | **EDIT** — add Focus Timer section |
| `src/renderer/src/App.tsx` | **EDIT** — wire auto-save + keyboard shortcut |
| `src/renderer/src/__tests__/usePomodoroStore.test.ts` | **CREATE** — store tests |
| `src/renderer/src/__tests__/PomodoroTimer.test.tsx` | **CREATE** — component tests |
