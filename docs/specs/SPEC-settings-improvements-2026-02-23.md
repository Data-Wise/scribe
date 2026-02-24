# SPEC: Settings Infrastructure Improvements

> **Date:** 2026-02-23
> **Branch:** `feature/settings-improvements`
> **Status:** Draft
> **Origin:** PR #45 (Pomodoro Timer) code review findings

## Summary

Standardize settings patterns discovered during the Pomodoro PR review: extract reusable toggle components, centralize shortcut labels, and create a `usePreferences()` hook that eliminates per-render localStorage reads. Also add a pre-commit guard to prevent ORCHESTRATE files from leaking to dev/main.

## Problem Statement

The PR #45 review revealed several patterns that, while fixed locally for the Pomodoro feature, exist across the settings codebase:

1. **Duplicated toggle markup** — 8+ lines of identical toggle switch JSX copy-pasted per setting
2. **Shortcut label drift** — Labels like `⌘⇧P` vs `⌘⇧N` hardcoded in 3+ locations, easily desynchronized
3. **Per-render localStorage reads** — `loadPreferences()` called in render paths, each call parsing JSON from localStorage
4. **No ORCHESTRATE cleanup guard** — Working artifacts can accidentally ship to dev/main

## Requirements

### Must Have (P0)
- Reusable `SettingsToggle` component with consistent markup and accessibility
- `SHORTCUTS` registry constant used by all UI labels and tests
- `usePreferences()` hook that caches preferences in React state
- Pre-commit hook blocking ORCHESTRATE files on dev/main

### Should Have (P1)
- All existing settings tabs migrated away from direct `loadPreferences()` calls
- Test suite for `usePreferences()` hook (read, update, toggle, zustand sync)
- Test validating shortcut registry completeness

### Won't Have (This Phase)
- Full `usePreferencesStore` Zustand store (future work — see long-term backlog)
- Reactivity across browser tabs (storage events)
- Migration of non-settings code that reads preferences

## Design

### SettingsToggle Component

```tsx
// components/Settings/SettingsToggle.tsx
export function SettingsToggle({
  label, description, checked, onChange, testId
}: SettingsToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5">
      <div>
        <div className="text-sm font-medium text-nexus-text-primary">{label}</div>
        <div className="text-xs text-nexus-text-muted">{description}</div>
      </div>
      <button
        onClick={onChange}
        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
          checked ? 'bg-nexus-accent' : 'bg-white/10'
        }`}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        data-testid={testId}
      >
        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
          checked ? 'right-1' : 'left-1'
        }`} />
      </button>
    </div>
  )
}
```

**Key improvements over current pattern:**
- `role="switch"` and `aria-checked` for accessibility
- Consistent `data-testid` support
- Single source of truth for toggle styling

### Shortcut Registry

```tsx
// lib/shortcuts.ts
export const SHORTCUTS = {
  newNote:    { key: 'n', mod: 'cmd',       label: '⌘N',  description: 'New note' },
  newProject: { key: 'n', mod: 'cmd+shift', label: '⌘⇧N', description: 'New project' },
  search:     { key: 'k', mod: 'cmd',       label: '⌘K',  description: 'Search' },
  settings:   { key: ',', mod: 'cmd',       label: '⌘,',  description: 'Settings' },
  pomodoro:   { key: 'p', mod: 'cmd+shift', label: '⌘⇧P', description: 'Focus timer' },
  save:       { key: 's', mod: 'cmd',       label: '⌘S',  description: 'Save' },
  bold:       { key: 'b', mod: 'cmd',       label: '⌘B',  description: 'Bold' },
  italic:     { key: 'i', mod: 'cmd',       label: '⌘I',  description: 'Italic' },
} as const

export type ShortcutId = keyof typeof SHORTCUTS
```

Usage in components: `SHORTCUTS.newProject.label` instead of `'⌘⇧N'`.

### usePreferences Hook

```tsx
// hooks/usePreferences.ts
export function usePreferences() {
  const [prefs, setPrefs] = useState(() => loadPreferences())

  const updatePref = useCallback(<K extends keyof Preferences>(
    key: K, value: Preferences[K]
  ) => {
    updatePreferences({ [key]: value })
    const newPrefs = loadPreferences()
    setPrefs(newPrefs)
    // Auto-sync zustand stores
    if (String(key).startsWith('pomodoro')) {
      usePomodoroStore.getState().syncPreferences()
    }
  }, [])

  const togglePref = useCallback((key: keyof Preferences) => {
    updatePref(key, !prefs[key] as any)
  }, [prefs, updatePref])

  return { prefs, updatePref, togglePref }
}
```

### Pre-commit Guard

Added to existing `.husky/pre-commit` (or created if absent):

```bash
# Block ORCHESTRATE files on protected branches
staged_orchestrate=$(git diff --cached --name-only | grep '^ORCHESTRATE-' || true)
branch=$(git branch --show-current)
if [ -n "$staged_orchestrate" ] && { [ "$branch" = "dev" ] || [ "$branch" = "main" ]; }; then
  echo "❌ ORCHESTRATE files cannot be committed to $branch"
  echo "   Files: $staged_orchestrate"
  echo "   Fix: git rm ORCHESTRATE-*.md"
  exit 1
fi
```

## Implementation Plan

| Step | Description | Files | Effort |
| ---- | ----------- | ----- | ------ |
| 1 | Extract SettingsToggle component + tests | 3 files | 30 min |
| 2 | Create SHORTCUTS registry, update labels | 6 files | 20 min |
| 3 | Add pre-commit guard | 1 file | 15 min |
| 4 | Create usePreferences hook + tests | 3 files | 1.5h |
| 5 | Audit + migrate all settings tabs | 5-6 files | 1h |

**Total estimated:** ~3.5 hours

## Testing Strategy

- **SettingsToggle:** render tests (checked/unchecked, click handler, aria attributes)
- **SHORTCUTS:** snapshot test ensuring all keys have label + description
- **usePreferences:** unit test with `renderHook` (read, update, toggle, sync)
- **Pre-commit:** manual test on dev branch with staged ORCHESTRATE file
- **Audit:** existing settings tests must continue passing after migration

## Risks

- **Phase 4/5 scope creep:** Other settings tabs may have additional patterns beyond `loadPreferences()`. Limit scope to preference caching only.
- **Shortcut registry completeness:** May miss shortcuts in CodeMirror keymaps (those are editor-level, not app-level). Registry covers app shortcuts only.

## Future Work (Not This Branch)

- **`usePreferencesStore` Zustand store** — Full reactive preferences with `storage` event listener for cross-tab sync. Replaces localStorage entirely. See long-term backlog.
