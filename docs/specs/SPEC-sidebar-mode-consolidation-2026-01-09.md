# SPEC: Sidebar Mode Consolidation & Persistence

**Status:** ✅ Approved for Implementation
**Created:** 2026-01-09
**Approved:** 2026-01-10
**From Brainstorm:** BRAINSTORM-sidebar-mode-consolidation-2026-01-09.md
**Target Version:** v1.15.0 (Mega Release)
**Sprint:** Sprint 36 (Late Work)
**Effort:** ~10 hours (7h core + 3h testing)

---

## Approval Decisions (2026-01-10)

| Decision | Choice |
|----------|--------|
| **Release Strategy** | Combine with Sprint 35/36 into mega v1.15.0 |
| **Settings Count** | 2 toggles (removed auto-update preset) |
| **Testing Scope** | Focused (30-40 E2E tests) |
| **Sprint Number** | Late Sprint 36 work (not new sprint) |

**Key Simplification:** Removed `appearance.alwaysUpdatePreset` toggle. Replaced with "Don't ask again" checkbox in PresetUpdateDialog stored in localStorage.

---

## Metadata

| Field | Value |
|-------|-------|
| **Feature Name** | Sidebar Mode Consolidation & Persistence |
| **Priority** | P1 - High Impact |
| **Type** | Enhancement |
| **Sprint** | Sprint 36 (Late Work) |
| **Dependencies** | Width presets (completed Task ⑫) |
| **Breaking Changes** | None (backward compatible) |
| **New Settings** | 2 toggles (Appearance › Sidebar Settings) |
| **New Tests** | 30-40 E2E tests (focused coverage) |

---

## Overview

Consolidate the separate icon/expanded sidebar modes into a unified system with smart persistence. Currently, only Projects can expand (Compact/Card modes), while Inbox and Smart Folders are stuck in icon-only mode. This spec defines a complete expansion system where:

1. **All items expand** - Inbox, Smart Folders, and Projects all support Compact/Card modes
2. **Smart persistence** - Width preset determines default mode, optional "remember last mode" setting
3. **Cycle behavior** - Click cycles through modes based on width preset (narrow: C↔I, wide: C→W→I)
4. **Preview animation** - Hover shows expand target mode after system tooltip delay
5. **Settings integration** - New toggle in Appearance › Sidebar Settings

**Key Insight:** The width preset (narrow/medium/wide) is the source of truth for determining which modes are available in the cycle. This creates a consistent UX where the preset not only sets width, but also controls mode behavior.

---

## Primary User Story

**As a** Scribe user managing multiple project types
**I want** the sidebar to remember my preferred expanded mode (Compact vs Card)
**So that** I don't have to manually adjust it every time I expand/collapse

### Acceptance Criteria

- ✅ Clicking any icon (Project/Inbox/Smart Folder) expands to consistent mode
- ✅ Mode persists across collapse/expand cycles within session
- ✅ Width preset (narrow/medium/wide) determines available modes in cycle
- ✅ Optional "Remember sidebar mode on collapse" setting overrides preset
- ✅ Hover animation previews expand mode after system tooltip delay
- ✅ Manual resize prompts to update preset
- ✅ Empty states for Inbox and Smart Folders with action buttons
- ✅ Mode indicator in ActivityBar footer
- ✅ Debounced clicks (200ms cooldown) prevent rapid cycling spam

---

## Secondary User Stories

### Story 2: Inbox Power User

**As a** user with 50+ inbox notes
**I want** Inbox to expand to Card mode with full metadata
**So that** I can browse inbox notes with the same rich interface as projects

**Acceptance:** Inbox expands to Compact or Card based on width preset, shows notes in appropriate layout

### Story 3: Keyboard Navigator

**As a** keyboard-first user
**I want** ⌘⇧[ to cycle through available modes
**So that** I can switch modes without touching the mouse

**Acceptance:** Keyboard shortcut cycles through preset-determined modes (narrow: C↔I, wide: C→W→I)

### Story 4: Width Preset User

**As a** user who just set "Wide" preset in Settings
**I expect** the sidebar to expand to Card mode
**So that** my preference is immediately reflected in expand behavior

**Acceptance:** Changing preset while expanded triggers immediate resize + mode change

### Story 5: Manual Resizer

**As a** user who manually resizes the sidebar via drag handle
**I want** to be asked if I want to save this as my new preset
**So that** my custom width becomes the new default

**Acceptance:** Resize drag end → prompt "Update preset to this width?" with "Don't ask again" checkbox (stores preference in localStorage, not Settings)

---

## Technical Requirements

### Architecture

#### State Schema

```typescript
// src/renderer/src/store/useAppViewStore.ts

interface AppViewState {
  // Existing
  sidebarMode: 'icon' | 'compact' | 'card'
  sidebarWidth: number

  // NEW: Last expanded mode memory
  lastExpandedMode: 'compact' | 'card' | null  // null = never expanded

  // NEW: Timestamp for session tracking
  lastModeChangeTimestamp: number

  // NEW: Manual resize memory (per mode)
  compactModeWidth: number  // Last manual width in Compact
  cardModeWidth: number     // Last manual width in Card
}

// localStorage keys
const LAST_EXPANDED_MODE_KEY = 'scribe:lastExpandedMode'
const LAST_MODE_CHANGE_KEY = 'scribe:lastModeChangeTimestamp'
const COMPACT_WIDTH_KEY = 'scribe:compactModeWidth'
const CARD_WIDTH_KEY = 'scribe:cardModeWidth'
```

#### Priority Logic

```typescript
function determineExpandMode(): 'compact' | 'card' {
  const settings = useSettingsStore.getState().settings
  const rememberMode = settings['appearance.rememberSidebarMode'] ?? true  // Default ON
  const widthPreset = settings['appearance.sidebarWidth'] ?? 'medium'
  const lastMode = getLastExpandedMode()

  // Priority 1: Setting ON → use last mode (if available)
  if (rememberMode && lastMode) {
    return lastMode
  }

  // Priority 2: Setting OFF or no last mode → use preset
  const presetModes: Record<string, 'compact' | 'card'> = {
    'narrow': 'compact',   // 200px
    'medium': 'compact',   // 280px
    'wide': 'card'         // 360px
  }

  return presetModes[widthPreset] || 'compact'
}
```

#### Cycle Logic

```typescript
function getCyclePattern(widthPreset: string): SidebarMode[] {
  const cycleMap: Record<string, SidebarMode[]> = {
    'narrow': ['icon', 'compact'],                    // C ↔ Icon
    'medium': ['icon', 'compact'],                    // C ↔ Icon
    'wide': ['icon', 'compact', 'card']               // C → W → Icon
  }

  return cycleMap[widthPreset] || cycleMap['medium']
}

function handleIconClick(currentMode: SidebarMode, widthPreset: string) {
  const cycle = getCyclePattern(widthPreset)
  const currentIndex = cycle.indexOf(currentMode)
  const nextMode = cycle[(currentIndex + 1) % cycle.length]

  // Debounce: ignore if within 200ms of last change
  const now = Date.now()
  const lastChange = get().lastModeChangeTimestamp
  if (now - lastChange < 200) return

  setSidebarMode(nextMode)
  set({ lastModeChangeTimestamp: now })

  // Remember expanded mode (if not icon)
  if (nextMode !== 'icon') {
    saveLastExpandedMode(nextMode)
  }

  // Apply appropriate width for mode
  if (nextMode === 'compact') {
    setSidebarWidth(get().compactModeWidth || SIDEBAR_WIDTHS.compact.default)
  } else if (nextMode === 'card') {
    setSidebarWidth(get().cardModeWidth || SIDEBAR_WIDTHS.card.default)
  }
}
```

#### Width Per Mode

```typescript
function setSidebarMode(mode: SidebarMode) {
  set({ sidebarMode: mode })
  saveSidebarMode(mode)

  // Each mode has its own width
  if (mode === 'compact') {
    const width = get().compactModeWidth || SIDEBAR_WIDTHS.compact.default
    set({ sidebarWidth: width })
  } else if (mode === 'card') {
    const width = get().cardModeWidth || SIDEBAR_WIDTHS.card.default
    set({ sidebarWidth: width })
  } else if (mode === 'icon') {
    set({ sidebarWidth: SIDEBAR_WIDTHS.icon })
  }
}

function setSidebarWidth(width: number) {
  const mode = get().sidebarMode

  // Save width to mode-specific memory
  if (mode === 'compact') {
    set({ compactModeWidth: width })
    localStorage.setItem(COMPACT_WIDTH_KEY, width.toString())
  } else if (mode === 'card') {
    set({ cardModeWidth: width })
    localStorage.setItem(CARD_WIDTH_KEY, width.toString())
  }

  set({ sidebarWidth: width })
  saveSidebarWidth(width)
}
```

---

### API Design

#### New Store Actions

| Action | Signature | Description |
|--------|-----------|-------------|
| `cycleSidebarMode()` | `() => void` | Cycle through preset-determined modes |
| `saveLastExpandedMode()` | `(mode: 'compact' \| 'card') => void` | Persist last expanded mode |
| `getLastExpandedMode()` | `() => 'compact' \| 'card' \| null` | Retrieve last expanded mode |
| `determineExpandMode()` | `() => 'compact' \| 'card'` | Calculate expand target mode |
| `getCyclePattern()` | `(preset: string) => SidebarMode[]` | Get cycle sequence for preset |
| `promptUpdatePreset()` | `(newWidth: number) => void` | Show "Update preset?" dialog |

#### Modified Store Actions

| Action | Changes |
|--------|---------|
| `setSidebarMode()` | Save to mode-specific width memory |
| `setSidebarWidth()` | Trigger "Update preset?" prompt |

---

### Data Models

#### Settings Schema

```typescript
// src/renderer/src/lib/settingsSchema.ts

{
  id: 'appearance.rememberSidebarMode',
  type: 'toggle',
  label: 'Remember sidebar mode on collapse',
  description: 'Restore previous mode (Compact/Card) when expanding. If off, uses width preset.',
  defaultValue: true,  // NEW USERS: ON by default
  addedInVersion: 'v1.15.0'
}

{
  id: 'appearance.enableExpandPreview',
  type: 'toggle',
  label: 'Show expand preview on hover',
  description: 'Brief animation preview when hovering over icons. Honors system motion preferences.',
  defaultValue: true,
  addedInVersion: 'v1.15.0'
}

// NOTE: Auto-update preset preference removed from Settings
// Instead, "Don't ask again" checkbox in PresetUpdateDialog stores in localStorage
// This reduces Settings complexity (11 settings instead of 12)
```

#### localStorage Keys

| Key | Type | Purpose |
|-----|------|---------|
| `scribe:lastExpandedMode` | `'compact' \| 'card' \| null` | Last expanded mode |
| `scribe:lastModeChangeTimestamp` | `number` | Timestamp of last mode change |
| `scribe:compactModeWidth` | `number` | Last manual width in Compact |
| `scribe:cardModeWidth` | `number` | Last manual width in Card |
| `scribe:autoUpdatePreset` | `boolean` | "Don't ask again" preference for preset updates |

---

## Dependencies

### Required

- ✅ Width presets (completed in Task ⑫)
- ✅ useAppViewStore with sidebarMode/sidebarWidth
- ✅ Settings store with appearance category

### Optional

- ActivityBar component (for mode indicator)
- Toast component (for preset update notifications)
- AskUserQuestion tool (for "Update preset?" dialog)

---

## UI/UX Specifications

### Expand Animation Preview

**Trigger:** Hover over any icon (Project/Inbox/Smart Folder) for system tooltip delay
**Animation:** 150ms width increase preview (10-20px) showing target mode
**Visual:** Semi-transparent overlay (opacity: 0.6)
**Cancellation:** Click immediately expands (skips preview animation)

```css
/* src/renderer/src/index.css */

.sidebar-icon-preview {
  position: absolute;
  top: 0;
  left: 48px;
  height: 100%;
  background: var(--preview-bg);
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms ease-out, width 150ms ease-out;
}

.sidebar-icon-preview.active {
  opacity: 0.6;
}

.sidebar-icon-preview.compact {
  width: 192px;  /* Preview Compact: 240px - 48px icon */
}

.sidebar-icon-preview.card {
  width: 272px;  /* Preview Card: 320px - 48px icon */
}

/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .sidebar-icon-preview {
    transition: none;
  }
}
```

**Implementation:**
1. `onMouseEnter` → start timer for system tooltip delay
2. Timer fires → add `.active` class, set width based on target mode
3. `onMouseLeave` → remove `.active` class, clear timer
4. `onClick` → immediately expand (no preview animation)

**System Tooltip Delay Detection:**
```typescript
function getSystemTooltipDelay(): number {
  // macOS: typically 700-1000ms
  // Windows: typically 400-500ms
  // Fallback: 300ms

  // Could use `matchMedia` or platform detection
  const isMac = navigator.platform.toLowerCase().includes('mac')
  return isMac ? 700 : 300
}
```

---

### Settings UI

**Location:** Appearance › Sidebar Settings
**Position:** After "Sidebar Width" setting (newly added in Task ⑫)

```
┌────────────────────────────────────────────────────────┐
│ Sidebar Settings                                       │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Sidebar Width                                          │
│ ○ Narrow - 200px (Minimal)                            │
│ ● Medium - 280px (Balanced)                           │
│ ○ Wide - 360px (Spacious)                             │
│                                                        │
│ ────────────────────────────────────────────────────  │
│                                                        │
│ ☑ Remember sidebar mode on collapse                   │
│   Restore previous mode (Compact/Card) when expanding.│
│   If off, uses width preset.                          │
│                                                        │
│ ☑ Show expand preview on hover                        │
│   Brief animation preview when hovering over icons.   │
│   Honors system motion preferences.                   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Note:** Manual resize behavior is controlled by "Don't ask again" checkbox in the PresetUpdateDialog (not a Settings toggle). This keeps Settings count at 11 instead of 12.

---

### Mode Indicator (ActivityBar Footer)

**Location:** Bottom of ActivityBar (below Settings button)
**Visual:** Small text label showing current mode

```
┌─────────────────┐
│                 │
│  Sidebar        │
│  Content        │
│                 │
├─────────────────┤
│                 │
│    🔍 Search    │
│    📅 Daily     │
│    ⚙️ Settings  │
│                 │
├─────────────────┤ ← New divider
│  Compact Mode   │ ← Mode indicator
└─────────────────┘
```

**States:**
- "Compact Mode" when `sidebarMode === 'compact'`
- "Card Mode" when `sidebarMode === 'card'`
- Hidden when `sidebarMode === 'icon'`

**Styling:**
```css
.mode-indicator {
  padding: 8px;
  text-align: center;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-tertiary);
  border-top: 1px solid var(--border-subtle);
}
```

---

### "Update Preset?" Dialog

**Trigger:** User releases resize drag handle (manual resize)
**Condition:** Only if `localStorage.getItem('scribe:autoUpdatePreset')` is not `'true'`

```
┌────────────────────────────────────────────────────────┐
│ Update Width Preset?                                   │
├────────────────────────────────────────────────────────┤
│                                                        │
│ You manually resized the sidebar to 255px.            │
│                                                        │
│ Update your width preset to remember this size?       │
│                                                        │
│ Current preset: Medium (280px)                         │
│ New width: 255px                                       │
│                                                        │
│ ☐ Don't ask again (always update automatically)       │
│                                                        │
│              [Cancel]  [Update Preset]                 │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Behavior:**
- "Cancel" → keep custom width for session, don't update preset
- "Update Preset" → save to Settings, becomes new default
- "Don't ask again" checkbox → store `true` in `localStorage.getItem('scribe:autoUpdatePreset')` (not Settings)

**Implementation:**
```typescript
function handleResizeEnd(newWidth: number) {
  const autoUpdate = localStorage.getItem('scribe:autoUpdatePreset') === 'true'
  const settings = useSettingsStore.getState().settings
  const currentPreset = settings['appearance.sidebarWidth'] ?? 'medium'

  if (autoUpdate) {
    // Auto-update preset silently (user checked "Don't ask again")
    updatePresetForWidth(newWidth)
    showToast('Width preset updated', 'info')
  } else {
    // Show dialog with "Don't ask again" checkbox
    showPresetUpdateDialog({
      currentWidth: newWidth,
      currentPreset,
      onUpdate: (dontAskAgain: boolean) => {
        updatePresetForWidth(newWidth)
        if (dontAskAgain) {
          localStorage.setItem('scribe:autoUpdatePreset', 'true')
        }
      }
    })
  }
}

function updatePresetForWidth(width: number): string {
  // Map width to closest preset
  if (width < 240) return 'narrow'   // < 240px → narrow
  if (width < 320) return 'medium'   // 240-319px → medium
  return 'wide'                      // >= 320px → wide
}
```

---

### Empty States

#### Empty Inbox

```
┌────────────────────────────────────────────────────────┐
│ 📥 Inbox                                                │
├────────────────────────────────────────────────────────┤
│                                                        │
│                    📭                                  │
│                                                        │
│              Inbox is empty                            │
│                                                        │
│    Capture quick thoughts and fleeting ideas           │
│                                                        │
│              [⌘⇧C Quick Capture]                       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

#### Empty Smart Folder (e.g., Research)

```
┌────────────────────────────────────────────────────────┐
│ 🔬 Research Projects                                    │
├────────────────────────────────────────────────────────┤
│                                                        │
│                    📂                                  │
│                                                        │
│          No research projects yet                      │
│                                                        │
│    Create your first research project to get started  │
│                                                        │
│            [+ New Research Project]                    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: State Management (2h)

**Files:**
- `src/renderer/src/store/useAppViewStore.ts`

**Tasks:**
- [ ] Add `lastExpandedMode`, `lastModeChangeTimestamp` to state
- [ ] Add `compactModeWidth`, `cardModeWidth` to state
- [ ] Implement `saveLastExpandedMode()` and `getLastExpandedMode()`
- [ ] Implement `determineExpandMode()` with priority logic
- [ ] Implement `getCyclePattern()` for preset-based cycles
- [ ] Update `setSidebarMode()` to save mode-specific widths
- [ ] Add timestamp tracking and 200ms debounce
- [ ] Write unit tests for state transitions

**Acceptance:**
```typescript
test('remembers last expanded mode when setting ON', () => {
  setRememberMode(true)
  setSidebarMode('card')
  setSidebarMode('icon')
  const nextMode = determineExpandMode()
  expect(nextMode).toBe('card')
})

test('uses width preset when setting OFF', () => {
  setRememberMode(false)
  setWidthPreset('wide')
  const nextMode = determineExpandMode()
  expect(nextMode).toBe('card')
})
```

---

### Phase 2: Cycle Behavior (2h)

**Files:**
- `src/renderer/src/store/useAppViewStore.ts`
- `src/renderer/src/App.tsx`

**Tasks:**
- [ ] Replace `toggleSidebarCollapsed()` with `cycleSidebarMode()`
- [ ] Implement preset-aware cycling (narrow: C↔I, wide: C→W→I)
- [ ] Add 200ms debounce to prevent rapid clicking
- [ ] Update keyboard shortcut (⌘⇧[) to use cycle handler
- [ ] Each mode remembers its own width (compactModeWidth, cardModeWidth)
- [ ] Save last mode on each transition (if not icon)
- [ ] Write unit tests for cycle patterns

**Acceptance:**
```typescript
test('narrow preset cycles: Icon → Compact → Icon', () => {
  setWidthPreset('narrow')
  cycleSidebarMode() // icon → compact
  expect(getSidebarMode()).toBe('compact')
  cycleSidebarMode() // compact → icon
  expect(getSidebarMode()).toBe('icon')
})

test('wide preset cycles: Icon → Compact → Card → Icon', () => {
  setWidthPreset('wide')
  cycleSidebarMode() // icon → compact
  expect(getSidebarMode()).toBe('compact')
  cycleSidebarMode() // compact → card
  expect(getSidebarMode()).toBe('card')
  cycleSidebarMode() // card → icon
  expect(getSidebarMode()).toBe('icon')
})
```

---

### Phase 3: Universal Expand (2h)

**Files:**
- `src/renderer/src/components/sidebar/IconBarMode.tsx`
- `src/renderer/src/components/sidebar/CompactListMode.tsx`
- `src/renderer/src/components/sidebar/CardViewMode.tsx`

**Tasks:**
- [ ] Add expand capability to Inbox icon (click handler)
- [ ] Add expand capability to Smart Folder icons (click handler)
- [ ] Update `CompactListMode` to render Inbox notes
- [ ] Update `CompactListMode` to render Smart Folder filtered projects
- [ ] Update `CardViewMode` to render Inbox notes
- [ ] Update `CardViewMode` to render Smart Folder filtered projects
- [ ] Add empty states for Inbox (with Quick Capture button)
- [ ] Add empty states for Smart Folders (with Create Project button)
- [ ] Unified expand handler for all icon types

**Acceptance:**
```typescript
test('Inbox expands to Compact mode with notes visible', async () => {
  await clickIcon('inbox')
  expect(getSidebarMode()).toBe('compact')
  expect(screen.getByText('Inbox Notes')).toBeInTheDocument()
})

test('Smart Folder expands showing filtered projects', async () => {
  await clickIcon('research')
  expect(getSidebarMode()).toBe('compact')
  const projects = screen.getAllByTestId('project-item')
  projects.forEach(project => {
    expect(project).toHaveAttribute('data-type', 'research')
  })
})

test('Empty Inbox shows capture button', async () => {
  // Clear all inbox notes
  await clickIcon('inbox')
  expect(screen.getByText('Inbox is empty')).toBeInTheDocument()
  expect(screen.getByText('Quick Capture')).toBeInTheDocument()
})
```

---

### Phase 4: Preview Animation (2h) - DEFERRED TO v1.16.0

**Status:** Phase 4 deferred to future version (not in v1.15.0 scope)

**Reason:** Focus on core functionality (persistence + universal expand) first. Preview animation is polish, not critical path.

**Implementation notes for v1.16.0:**
- Detect system tooltip delay via platform
- Add hover timer with system delay
- Render semi-transparent preview overlay
- Respect `prefers-reduced-motion`
- Honor `appearance.enableExpandPreview` setting

---

### Phase 5: Settings Integration (1h)

**Files:**
- `src/renderer/src/lib/settingsSchema.ts`
- `src/renderer/src/components/Settings/SettingControl.tsx` (no changes, uses existing controls)

**Tasks:**
- [ ] Add `appearance.rememberSidebarMode` toggle to schema (default: true)
- [ ] Add `appearance.enableExpandPreview` toggle to schema (default: true, deferred Phase 4)
- [ ] Update Appearance category badge count to 11 (was 9, adding 2 toggles)
- [ ] Connect `rememberSidebarMode` to `determineExpandMode()` priority logic
- [ ] Add tooltips explaining each setting
- [ ] Test both ON and OFF states

**Note:** Removed `appearance.alwaysUpdatePreset` toggle - replaced with "Don't ask again" checkbox in dialog (localStorage)

**Acceptance:**
```typescript
test('remember mode toggle controls expand behavior', () => {
  setSetting('appearance.rememberSidebarMode', true)
  setSidebarMode('card')
  setSidebarMode('icon')
  cycleSidebarMode()
  expect(getSidebarMode()).toBe('card') // restored

  setSetting('appearance.rememberSidebarMode', false)
  setSidebarMode('icon')
  setWidthPreset('medium')
  cycleSidebarMode()
  expect(getSidebarMode()).toBe('compact') // preset wins
})
```

---

### Phase 6: Preset Update Dialog (1h)

**Files:**
- `src/renderer/src/components/sidebar/MissionSidebar.tsx`
- `src/renderer/src/components/PresetUpdateDialog.tsx` (new)

**Tasks:**
- [ ] Implement `handleResizeEnd()` with localStorage-based auto-update check
- [ ] Create `PresetUpdateDialog` component with "Don't ask again" checkbox
- [ ] Connect checkbox to `scribe:autoUpdatePreset` localStorage key (NOT Settings)
- [ ] Show current preset and new width in dialog
- [ ] Map width to closest preset (< 240 → narrow, < 320 → medium, >= 320 → wide)
- [ ] Show toast notification on auto-update

**Acceptance:**
```typescript
test('manual resize prompts to update preset', async () => {
  localStorage.removeItem('scribe:autoUpdatePreset')
  await resizeSidebar(255)
  expect(screen.getByText(/Update Width Preset/i)).toBeInTheDocument()
})

test('auto-update skips dialog when localStorage flag set', async () => {
  localStorage.setItem('scribe:autoUpdatePreset', 'true')
  await resizeSidebar(255)
  expect(screen.queryByText(/Update Width Preset/i)).not.toBeInTheDocument()
  expect(getWidthPreset()).toBe('medium') // auto-updated
})

test('"Don\'t ask again" checkbox sets localStorage', async () => {
  await resizeSidebar(255)
  await clickCheckbox('Don\'t ask again')
  await clickButton('Update Preset')
  expect(localStorage.getItem('scribe:autoUpdatePreset')).toBe('true')
})
```

---

### Phase 7: Mode Indicator (30min)

**Files:**
- `src/renderer/src/components/sidebar/ActivityBar.tsx`
- `src/renderer/src/index.css`

**Tasks:**
- [ ] Add mode indicator div below Settings button
- [ ] Display "Compact Mode" or "Card Mode" text
- [ ] Hide when `sidebarMode === 'icon'`
- [ ] Style with subtle border and tertiary text color
- [ ] Ensure consistent spacing with ActivityBar buttons

**Acceptance:**
```typescript
test('mode indicator shows current mode', () => {
  setSidebarMode('compact')
  expect(screen.getByText('Compact Mode')).toBeInTheDocument()

  setSidebarMode('card')
  expect(screen.getByText('Card Mode')).toBeInTheDocument()

  setSidebarMode('icon')
  expect(screen.queryByText(/Mode/)).not.toBeInTheDocument()
})
```

---

### Phase 8: Migration & Polish (30min)

**Files:**
- `src/renderer/src/App.tsx`
- `src/renderer/src/lib/settingsSchema.ts`

**Tasks:**
- [ ] Set `appearance.rememberSidebarMode` default to `true`
- [ ] Migrate existing users: detect if they've used expanded mode before
- [ ] If no history, set default expand mode to `compact` (safe default)
- [ ] Add version check for migration (v1.14.0 → v1.15.0)
- [ ] Update CHANGELOG.md with feature description
- [ ] Update UI-DESIGN-REVIEW-2026-01-09.md (mark Task ⑫ complete)

**Acceptance:**
```typescript
test('new users have remember mode ON by default', () => {
  // Fresh install
  const setting = getSetting('appearance.rememberSidebarMode')
  expect(setting).toBe(true)
})

test('existing users migrate smoothly', () => {
  // Simulate v1.14.0 user with no expand history
  const mode = determineExpandMode()
  expect(mode).toBe('compact') // safe default
})
```

---

## Open Questions

### Resolved

✅ **Q1:** Manual resize behavior → Ask user to update preset
✅ **Q2:** Preset switch while expanded → Immediate resize + mode change
✅ **Q3:** Width per mode → Yes, each mode has its own width
✅ **Q4:** Preview timing → System tooltip delay (honors OS preferences)
✅ **Q5:** Empty Inbox → Show "Inbox is empty" + Quick Capture button
✅ **Q6:** Empty Smart Folder → Show "No [type] projects" + Create button
✅ **Q7:** Update prompt timing → Immediately on resize drag end
✅ **Q8:** Migration strategy → Default ON for all users
✅ **Q9:** Keyboard shortcuts → Keep ⌘⇧[ for cycling only
✅ **Q10:** Reduced motion → User choice in Settings
✅ **Q11:** First hover → Works immediately (discoverable)
✅ **Q12:** Rapid clicking → Debounce 200ms between cycles
✅ **Q13:** Multi-window sync → No, each window independent
✅ **Q14:** Mode indicator → Status in ActivityBar footer
✅ **Q15:** Dialog memory → "Always update" checkbox
✅ **Q16:** Testing scope → All 4 selected options

### Remaining

❓ **Q17:** Should clicking on an icon in expanded mode (same item) do anything special?
**Current:** Cycles to next mode (C→W→I). If already on that item, still cycles.
**Alternative:** Clicking same item = no-op (only cycle via keyboard or different icon)
**Decision:** Keep current (cycle always happens on click)

❓ **Q18:** Should the preview animation show actual content (notes/projects) or just width?
**Current:** Width preview only (overlay with no content)
**Alternative:** Render actual CompactListMode/CardViewMode in preview (more resource-intensive)
**Decision:** Width only for v1.15.0, content preview in v2.0 if requested

---

## Review Checklist

- [ ] **User Stories Complete:** All 5 user stories have acceptance criteria
- [ ] **State Schema Defined:** All new state variables documented
- [ ] **Priority Logic Clear:** determineExpandMode() logic specified
- [ ] **Cycle Patterns Defined:** narrow/medium/wide behavior documented
- [ ] **UI Mockups Included:** Empty states, mode indicator, dialog
- [ ] **Animation Specs:** Preview timing, debounce, reduced-motion
- [ ] **Settings Integration:** 3 new toggles in Appearance › Sidebar Settings
- [ ] **Testing Strategy:** Unit tests + E2E tests defined
- [ ] **Migration Plan:** v1.14.0 → v1.15.0 default ON strategy
- [ ] **Effort Estimated:** 6-7 hours (Hybrid Path, Phase 4 deferred)
- [ ] **Dependencies Clear:** Width presets (completed), useAppViewStore, Settings
- [ ] **Edge Cases Covered:** Empty states, rapid clicking, preset updates
- [ ] **Accessibility:** Reduced motion, keyboard nav, ARIA labels
- [ ] **Performance:** 200ms debounce, localStorage caching
- [ ] **Breaking Changes:** None (backward compatible)

---

## Implementation Notes

### Design Patterns

1. **Source of Truth:** Width preset determines available modes in cycle
2. **Priority Hierarchy:** Remember mode (if ON) > Preset > Compact default
3. **Mode-Specific Width:** Each mode (Compact/Card) remembers its own manual width
4. **Debouncing:** 200ms cooldown prevents animation spam
5. **Progressive Enhancement:** Preview animation disabled for reduced-motion users

### Performance Considerations

- localStorage reads cached in memory (no repeated disk I/O)
- Preview animation skipped on immediate click (no wasted render)
- Cycle pattern computed once per preset change (not per click)
- Mode indicator only renders when expanded (hidden for icon mode)

### Accessibility

- Keyboard shortcut (⌘⇧[) mirrors click behavior (cycle)
- Preview animation respects `prefers-reduced-motion`
- Mode indicator provides context for screen readers
- Empty states have clear calls-to-action
- All interactive elements have ARIA labels

### Browser Compatibility

- Feature uses standard Web APIs (localStorage, matchMedia)
- No vendor-specific CSS (works in Chromium, Firefox, Safari)
- Animation uses CSS transitions (GPU-accelerated)

---

## History

| Date | Event | Author |
|------|-------|--------|
| 2026-01-09 | Initial spec creation from brainstorm | Claude Sonnet 4.5 |
| 2026-01-09 | Added 16 clarifying Q&A details | Claude Sonnet 4.5 |
| 2026-01-10 | ✅ Spec approved with simplifications | DT |
| 2026-01-10 | Updated: Removed 3rd toggle, 2 settings instead of 3 | Claude Sonnet 4.5 |
| 2026-01-10 | Updated: Target version v1.15.0 (mega release) | Claude Sonnet 4.5 |
| 2026-01-10 | Updated: Testing scope 30-40 E2E tests (focused) | Claude Sonnet 4.5 |
| 2026-01-10 | Implementation start - Phase 1 | Claude Sonnet 4.5 |

---

**Next Steps:**
1. Review spec for accuracy and completeness
2. Approve or request changes
3. Begin Phase 1 implementation (State Management)
4. Ship v1.15.0 with core feature (defer Phase 4 preview to v1.16.0)
