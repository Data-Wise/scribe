# Sprint 22: Editor Modes & Custom CSS

> **Goal:** Obsidian-style editing modes with Live Preview and Custom CSS support

---

## Overview

| Field | Value |
|-------|-------|
| **Sprint** | 22 |
| **Focus** | Editor Modes + Custom CSS |
| **Version** | v1.3.0 |
| **Status** | ✅ Complete |
| **Started** | 2025-12-27 |
| **Completed** | 2025-12-27 |

---

## Background

### Obsidian's Three Modes

| Mode | What You See | Cursor Behavior |
|------|--------------|-----------------|
| **Source** | Raw markdown only | Always see `**bold**`, `[[links]]` |
| **Live Preview** | Rendered + editable | Current line shows raw markdown |
| **Reading** | Fully rendered | Read-only, no editing |

### Current Scribe State

- **Write mode** = Raw markdown (Source-like)
- **Preview mode** = Read-only rendered (Reading-like)
- **Missing** = Live Preview (WYSIWYG hybrid)

---

## Features

### Three-Mode Editor Toggle

```
┌─────────────────────────────────────────┐
│  [Source] [Live Preview] [Reading]      │
│     ⌘1        ⌘2            ⌘3          │
└─────────────────────────────────────────┘
```

**Source Mode (⌘1):**
- Raw markdown textarea
- Syntax highlighting
- Maximum control

**Live Preview Mode (⌘2):**
- Renders markdown inline
- Current block shows raw markdown
- Wiki-links/tags clickable when unfocused

**Reading Mode (⌘3):**
- Full rendered view
- No editing
- Clean reading experience

### Custom CSS Support

```
Settings > Appearance > Custom CSS
┌─────────────────────────────────────────┐
│ ☑ Enable Custom CSS                     │
│ ┌─────────────────────────────────────┐ │
│ │ .editor-content {                   │ │
│ │   font-size: 18px;                  │ │
│ │ }                                   │ │
│ └─────────────────────────────────────┘ │
│ [Reset to Default] [Import] [Export]    │
└─────────────────────────────────────────┘
```

---

## Implementation Plan

### Quick Wins (< 30 min each)

| Task | File | Description |
|------|------|-------------|
| EditorMode type | `types.ts` | `'source' \| 'live-preview' \| 'reading'` |
| Mode toggle UI | `HybridEditor.tsx` | Three-button pill toggle |
| Keyboard shortcuts | `App.tsx` | `⌘1`, `⌘2`, `⌘3` |
| Preferences field | `preferences.ts` | `editorMode`, `customCSS` |

### Medium Effort (1-2 hours each)

| Task | File | Description |
|------|------|-------------|
| Source mode view | `HybridEditor.tsx` | Raw textarea with syntax highlighting |
| Custom CSS injection | `App.tsx` | Inject user CSS into editor |
| CSS settings UI | `SettingsModal.tsx` | Textarea + enable toggle |
| Live Preview cursor | `HybridEditor.tsx` | Track focused block, render others |

### Larger Effort (Defer)

| Task | Description |
|------|-------------|
| Per-block rendering | Only show raw markdown on focused block |
| CSS live preview | Real-time preview as you edit CSS |
| CSS import/export | File-based CSS management |

---

## Technical Design

### Editor Mode Type

```typescript
// src/renderer/src/types.ts
export type EditorMode = 'source' | 'live-preview' | 'reading'
```

### Preferences

```typescript
// src/renderer/src/lib/preferences.ts
interface UserPreferences {
  // ... existing
  editorMode: EditorMode
  customCSS: string
  customCSSEnabled: boolean
}
```

### Mode Toggle Component

```typescript
// In HybridEditor.tsx
<div className="mode-toggle">
  <button
    className={mode === 'source' ? 'active' : ''}
    onClick={() => setMode('source')}
  >
    Source
  </button>
  <button
    className={mode === 'live-preview' ? 'active' : ''}
    onClick={() => setMode('live-preview')}
  >
    Live Preview
  </button>
  <button
    className={mode === 'reading' ? 'active' : ''}
    onClick={() => setMode('reading')}
  >
    Reading
  </button>
</div>
```

### Custom CSS Injection

```typescript
// In App.tsx or HybridEditor.tsx
{preferences.customCSSEnabled && preferences.customCSS && (
  <style id="custom-user-css">{preferences.customCSS}</style>
)}
```

### Keyboard Shortcuts

```typescript
// In App.tsx
// Editor modes (⌘1/2/3)
if ((e.metaKey || e.ctrlKey) && e.key === '1') {
  e.preventDefault()
  setEditorMode('source')
}
if ((e.metaKey || e.ctrlKey) && e.key === '2') {
  e.preventDefault()
  setEditorMode('live-preview')
}
if ((e.metaKey || e.ctrlKey) && e.key === '3') {
  e.preventDefault()
  setEditorMode('reading')
}
```

---

## Files to Create

| File | Purpose |
|------|---------|
| (none - modifications only) | |

## Files to Modify

| File | Changes |
|------|---------|
| `src/renderer/src/components/HybridEditor.tsx` | Mode toggle, source view |
| `src/renderer/src/App.tsx` | Shortcuts, CSS injection |
| `src/renderer/src/lib/preferences.ts` | New preferences |
| `src/renderer/src/components/SettingsModal.tsx` | Custom CSS UI |
| `src/renderer/src/index.css` | Mode toggle styles |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘1` | Source mode |
| `⌘2` | Live Preview mode |
| `⌘3` | Reading mode |

---

## Success Criteria

- [x] Three modes toggle correctly
- [x] Keyboard shortcuts work (⌘1, ⌘2, ⌘3, ⌘E)
- [x] Custom CSS applies to editor
- [x] Preferences persist across sessions
- [x] Mode persists across sessions
- [x] No performance regression

---

## Notes

- Live Preview cursor tracking deferred to v1.4 (complex)
- Start with mode switching, add cursor-aware rendering later
- Custom CSS is independent feature, low risk
