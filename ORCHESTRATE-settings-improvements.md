# Settings Improvements Orchestration Plan

> **Branch:** `feature/settings-improvements`
> **Base:** `dev`
> **Worktree:** `~/.git-worktrees/scribe/settings-improvements`

## Objective

Extract reusable settings components, add a shortcut registry, and harden preferences reactivity patterns discovered during the PR #45 Pomodoro review. These improvements reduce code duplication, prevent label drift, and establish patterns for future settings tabs.

## Phase Overview

| Phase | Task | Priority | Status | Effort |
| ----- | ---- | -------- | ------ | ------ |
| 1 | Extract `SettingsToggle` component | High | Pending | 30 min |
| 2 | Add shortcut registry constant | High | Pending | 20 min |
| 3 | Pre-commit grep guard for ORCHESTRATE files | High | Pending | 15 min |
| 4 | Preferences subscription hook (`usePreferences`) | Medium | Pending | 1.5h |
| 5 | Audit existing settings tabs for `loadPreferences()` anti-pattern | Medium | Pending | 1h |

## Phase Details

### Phase 1: Extract `SettingsToggle` Component (Quick Win)

**Problem:** Toggle switches are copy-pasted across settings tabs with identical markup (~8 lines each). The pattern was repeated 6+ times in GeneralSettingsTab alone.

**Solution:** Extract a reusable `SettingsToggle` component.

**Files to create/modify:**
- `src/renderer/src/components/Settings/SettingsToggle.tsx` (NEW)
- `src/renderer/src/components/Settings/GeneralSettingsTab.tsx` (refactor toggles)
- `src/renderer/src/__tests__/SettingsToggle.test.tsx` (NEW)

**Component API:**
```tsx
interface SettingsToggleProps {
  label: string
  description: string
  checked: boolean
  onChange: () => void
  testId?: string
}
```

**Acceptance:**
- [ ] All existing toggles in GeneralSettingsTab use SettingsToggle
- [ ] Visual appearance unchanged
- [ ] Tests pass (existing + new component tests)

---

### Phase 2: Shortcut Registry Constant (Quick Win)

**Problem:** Keyboard shortcut labels live in 3+ places (handler, IconBar tooltip, QuickActions, tests). When a shortcut changes, labels drift silently.

**Solution:** Create a `SHORTCUTS` registry object. All UI labels and test assertions reference it.

**Files to create/modify:**
- `src/renderer/src/lib/shortcuts.ts` (NEW)
- `src/renderer/src/components/sidebar/IconBar.tsx` (use registry)
- `src/renderer/src/components/QuickActions.tsx` (use registry)
- `src/renderer/src/components/KeyboardShortcutHandler.tsx` (use registry)
- `src/renderer/src/__tests__/IconBar.component.test.tsx` (use registry)
- `src/renderer/src/__tests__/shortcuts.test.ts` (NEW — validates all labels match)

**Registry shape:**
```tsx
export const SHORTCUTS = {
  newNote: { key: 'n', mod: 'cmd', label: '⌘N' },
  newProject: { key: 'n', mod: 'cmd+shift', label: '⌘⇧N' },
  search: { key: 'k', mod: 'cmd', label: '⌘K' },
  settings: { key: ',', mod: 'cmd', label: '⌘,' },
  pomodoro: { key: 'p', mod: 'cmd+shift', label: '⌘⇧P' },
  // ...
} as const
```

**Acceptance:**
- [ ] No hardcoded shortcut strings in UI components
- [ ] Test validates registry completeness
- [ ] All existing tests pass

---

### Phase 3: Pre-commit ORCHESTRATE Guard (Quick Win)

**Problem:** ORCHESTRATE files are working artifacts that must be deleted before merging to dev. Easy to forget.

**Solution:** Add a pre-commit hook that warns if ORCHESTRATE-*.md files are staged.

**Files to create/modify:**
- `.husky/pre-commit` or equivalent hook (MODIFY)
- Document in MEMORY.md

**Logic:**
```bash
# Warn if ORCHESTRATE files are staged for commit on dev branch
if git diff --cached --name-only | grep -q '^ORCHESTRATE-'; then
  branch=$(git branch --show-current)
  if [ "$branch" = "dev" ] || [ "$branch" = "main" ]; then
    echo "⚠️  ORCHESTRATE files should not be committed to $branch"
    echo "   Remove with: git rm ORCHESTRATE-*.md"
    exit 1
  fi
fi
```

**Acceptance:**
- [ ] Hook blocks ORCHESTRATE commits on dev/main
- [ ] Hook allows ORCHESTRATE commits on feature branches
- [ ] Documented in MEMORY.md

---

### Phase 4: Preferences Subscription Hook (Medium Effort)

**Problem:** Settings components call `loadPreferences()` (localStorage read) per-render or per-interaction. The PR #45 fix cached in `useState`, but this pattern needs to be standardized.

**Solution:** Create a `usePreferences()` hook that:
1. Reads from localStorage once on mount
2. Provides `updatePref(key, value)` that writes + refreshes cached state
3. Auto-syncs Zustand stores (pomodoro, etc.) when relevant prefs change

**Files to create/modify:**
- `src/renderer/src/hooks/usePreferences.ts` (NEW)
- `src/renderer/src/components/Settings/GeneralSettingsTab.tsx` (migrate to hook)
- `src/renderer/src/__tests__/usePreferences.test.ts` (NEW)

**Hook API:**
```tsx
function usePreferences() {
  return {
    prefs: PreferencesState,           // cached snapshot
    updatePref: (key, value) => void,  // write + refresh
    togglePref: (key) => void,         // boolean toggle shorthand
  }
}
```

**Acceptance:**
- [ ] GeneralSettingsTab uses `usePreferences()` instead of raw `loadPreferences()`
- [ ] No direct `loadPreferences()` calls in settings components
- [ ] Tests for hook: read, update, toggle, zustand sync

---

### Phase 5: Audit Existing Settings Tabs (Medium Effort)

**Problem:** Other settings tabs may have the same `loadPreferences()` anti-pattern. Need a systematic audit.

**Solution:** Grep all settings files for `loadPreferences()` calls. Migrate any per-render or per-interaction calls to use the `usePreferences()` hook from Phase 4.

**Files to audit:**
- `src/renderer/src/components/Settings/AppearanceSettingsTab.tsx`
- `src/renderer/src/components/Settings/EditorSettingsTab.tsx`
- `src/renderer/src/components/Settings/ShortcutsSettingsTab.tsx`
- `src/renderer/src/components/Settings/AISettingsTab.tsx`
- `src/renderer/src/components/Settings/PluginsSettingsTab.tsx`
- Any other files importing `loadPreferences`

**Acceptance:**
- [ ] All settings tabs audited
- [ ] Any per-render `loadPreferences()` calls migrated to `usePreferences()`
- [ ] No regressions in existing settings behavior

---

## Sequence

```
Phase 1 (SettingsToggle) ─┐
Phase 2 (Shortcut Registry)├── Can run in parallel
Phase 3 (Pre-commit Guard) ┘
         │
         ▼
Phase 4 (usePreferences hook) ── depends on understanding from Phase 1
         │
         ▼
Phase 5 (Audit) ── depends on Phase 4 hook being ready
```

## How to Start

```bash
cd ~/.git-worktrees/scribe/settings-improvements
claude
# Start with Phase 1 (SettingsToggle extraction)
```
