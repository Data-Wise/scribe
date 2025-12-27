# Sprint 21: Mission Control v1.2

> **Goal:** Dashboard-first experience with ADHD-friendly project overview

---

## Overview

| Field | Value |
|-------|-------|
| **Sprint** | 21 |
| **Focus** | Mission Control Dashboard |
| **Version** | v1.2.0 |
| **Status** | ✅ Complete |
| **Started** | 2025-12-27 |
| **Completed** | 2025-12-27 |

---

## Features Delivered

### Mission Control Dashboard

- [x] **Dashboard-first experience** - Card-based project overview
- [x] **Smart startup behavior** - >4 hours away → Dashboard, else resume editor
- [x] **View mode toggle** - `⌘0` (zero) toggles Dashboard ↔ Editor
- [x] **Project cards grid** - Type icons, status dots, timestamps
- [x] **Quick Actions bar** - Daily Note (⌘D), New Note (⌘N), Quick Capture (⌘⇧C)

### Quick Capture Overlay

- [x] **Quick Capture modal** - `⌘⇧C` opens overlay
- [x] **Keyboard shortcuts** - Cmd+Enter to save, Escape to cancel
- [x] **Auto-title generation** - First line becomes title
- [x] **Saves to inbox** - Creates new note without project assignment

### Streak Display (Opt-in)

- [x] **Milestone celebrations** - 7/30/100/365 days
- [x] **Default OFF** - ADHD-friendly, avoids anxiety
- [x] **Settings toggle** - General → "Show streak milestones"

### Window Dragging Fix

- [x] **DragRegion component** - Uses Tauri 2 `startDragging()` API
- [x] **Permission added** - `core:window:allow-start-dragging`
- [x] **Header draggable** - Mission Control header enables window movement

---

## Files Created

| File | Purpose |
|------|---------|
| `src/renderer/src/components/MissionControl.tsx` | Dashboard container |
| `src/renderer/src/components/ProjectCard.tsx` | Project display cards |
| `src/renderer/src/components/QuickActions.tsx` | Action buttons |
| `src/renderer/src/components/QuickCaptureOverlay.tsx` | Capture modal |
| `src/renderer/src/components/StreakDisplay.tsx` | Milestone display |
| `src/renderer/src/components/DragRegion.tsx` | Window dragging |
| `src/renderer/src/store/useAppViewStore.ts` | View mode state |
| `docs/MISSION-CONTROL-WALKTHROUGH.md` | Feature walkthrough |

## Files Modified

| File | Changes |
|------|---------|
| `src/renderer/src/App.tsx` | View mode, shortcuts, DragRegion |
| `src/renderer/src/components/SettingsModal.tsx` | Streak toggle |
| `src/renderer/src/lib/preferences.ts` | `streakDisplayOptIn` field |
| `src/renderer/src/index.css` | Dashboard CSS styles |
| `src-tauri/capabilities/default.json` | Drag permission |
| `package.json` | Version 1.2.0 |
| `src-tauri/tauri.conf.json` | Version 1.2.0 |
| `CHANGELOG.md` | v1.2.0 release notes |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘0` | Toggle Dashboard ↔ Editor |
| `⌘⇧C` | Quick Capture overlay |
| `⌘D` | Daily Note |
| `⌘N` | New Note |

---

## Technical Details

### Smart Startup Logic

```typescript
const SESSION_TIMEOUT_MS = 4 * 60 * 60 * 1000 // 4 hours

const determineInitialViewMode = (): ViewMode => {
  const lastTimestamp = getLastSessionTimestamp()
  if (!lastTimestamp) return 'dashboard'
  const timeSinceLastSession = Date.now() - lastTimestamp
  if (timeSinceLastSession > SESSION_TIMEOUT_MS) return 'dashboard'
  if (lastNoteId) return 'editor'
  return 'dashboard'
}
```

### Window Dragging (Tauri 2)

```typescript
// DragRegion.tsx - uses Tauri 2 API
import { getCurrentWindow } from '@tauri-apps/api/window'

const handleMouseDown = async (e: React.MouseEvent) => {
  if (e.button !== 0) return
  await getCurrentWindow().startDragging()
}
```

Required permission in `capabilities/default.json`:
```json
"permissions": ["core:default", "core:window:allow-start-dragging"]
```

---

## Deferred to v1.3

- [ ] **Global ⌘⇧C shortcut** - Works from any app (Tauri global shortcut API)
- [ ] **Project stats on cards** - Word count, note count
- [ ] **Progress bars per project** - Visual completion indicators

---

## Notes

- Changed `⌘H` to `⌘0` because `⌘H` is macOS "Hide Window"
- Streak display default OFF to avoid ADHD anxiety
- Smart startup eliminates "resume session?" modal dialogs
