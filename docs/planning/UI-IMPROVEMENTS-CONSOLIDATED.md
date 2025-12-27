# Scribe UI Improvements - Consolidated Roadmap

> **Last Updated:** 2025-12-27
> **Current Version:** v1.2.0
> **Status:** Active planning document

---

## Executive Summary

This document consolidates all UI improvement proposals into a single roadmap. It replaces:
- `PROPOSAL-UI-IMPROVEMENTS.md` (archived)
- `docs/UI-IMPROVEMENTS-PROPOSAL.md` (archived)
- `PROPOSAL-TAGS-PANEL-REDESIGN.md` (archived)
- `PROPOSAL-EDITOR-ALTERNATIVES.md` (archived)

---

## Completed Features (v1.0 - v1.2)

### v1.2.0 - Mission Control

| Feature | Component | Status |
|---------|-----------|--------|
| Mission Control Dashboard | `MissionControl.tsx` | Done |
| Project Cards | `ProjectCard.tsx` | Done |
| Quick Capture Overlay | `QuickCaptureOverlay.tsx` | Done |
| Streak Display (opt-in) | `StreakDisplay.tsx` | Done |
| Quick Actions | `QuickActions.tsx` | Done |
| Window Dragging | `DragRegion.tsx` | Done |

### v1.1.0 - Project System

| Feature | Component | Status |
|---------|-----------|--------|
| Project System | `CreateProjectModal.tsx` | Done |
| Project Switcher | `ProjectSwitcher.tsx` | Done |
| Note Search | `SearchPanel.tsx` | Done |

### v1.0.0 - Core UI

| Feature | Component | Status |
|---------|-----------|--------|
| HybridEditor | `HybridEditor.tsx` | Done |
| Focus Mode | Built into HybridEditor | Done |
| Empty State (with quotes) | `EmptyState.tsx` | Done |
| Command Palette | `CommandPalette.tsx` | Done |
| Tags Panel (search, compact, orphan) | `TagsPanel.tsx` | Done |
| Writing Progress | `WritingProgress.tsx` | Done |
| Keyboard Shortcut Cheatsheet | `KeyboardShortcuts.tsx` | Done |
| Mode Toggle (pill style) | Built into HybridEditor | Done |
| Celebration Micro-interactions | CSS animations | Done |
| Enhanced Status Bar | Session timer, word delta | Done |
| Skeleton Loading States | CSS animations | Done |
| 10 Themes | Theme system | Done |
| 14 ADHD-Friendly Fonts | Font system | Done |

---

## Remaining UI Improvements

### Priority 1: High Impact, Low Effort

| Feature | Effort | Impact | Description |
|---------|--------|--------|-------------|
| **Focus Mode Options** | Quick | High | Sentence/paragraph/typewriter modes (iA Writer-style) |
| **Reading Time Estimate** | Quick | Medium | "~5 min read" in status bar |
| **Panel Slide Transitions** | Quick | Medium | 200ms ease-out for panels |
| **Theme Preview Cards** | Quick | Medium | Mini previews in settings |

### Priority 2: Medium Effort, High Value

| Feature | Effort | Impact | Description |
|---------|--------|--------|-------------|
| **File List Preview Snippets** | Medium | High | Title + first line + timestamp |
| **Starter Templates** | Medium | Medium | Research Note, Freewrite, Manuscript Draft |
| **Enhanced Writing Progress** | Medium | High | Daily goal bar, best day stats |
| **Pomodoro Timer** | Medium | High | Optional 25-min focus sessions |

### Priority 3: Larger Efforts

| Feature | Effort | Impact | Description |
|---------|--------|--------|-------------|
| **Syntax Dimming** | Large | Medium | Dim adjectives/adverbs (NLP) |
| **Graph View Enhancement** | Large | Medium | Color by tag, size by word count |
| **Citation Panel Redesign** | Large | Medium | Visual cards with preview |
| **Voice Input** | Large | Medium | macOS speech recognition |
| **Custom CSS Theme Editor** | Large | Low | Live preview, export/import |

### Tags Panel Future

| Feature | Effort | Description |
|---------|--------|-------------|
| Tag Cloud View | Medium | Size-based frequency visualization |
| Tag Icons/Emoji | Low | Optional icon per tag |
| Connecting Lines | Low | Tree view indentation guides |
| Bulk Operations | Medium | Multi-select for batch actions |
| Tag Merging | Medium | Combine multiple tags into one |
| AI Tag Suggestions | High | Suggest tags based on content |

---

## v1.3 Recommended Scope

Based on impact and ADHD-friendliness, recommend for v1.3:

### Must Have

1. **Focus Mode Options** - Sentence/paragraph/typewriter toggle
2. **File List Preview Snippets** - Better note discovery
3. **Global Quick Capture** - `⌘⇧C` works from any app (Tauri global shortcut)

### Nice to Have

4. **Reading Time Estimate** - Simple addition
5. **Panel Transitions** - Polish
6. **Project Stats on Cards** - Word count, note count

### Defer to v1.4+

- Syntax Dimming (requires NLP library)
- Voice Input (macOS integration)
- Custom CSS Editor (low priority)
- AI Tag Suggestions (requires AI integration)

---

## Competitive Position

| Feature | Scribe | iA Writer | Ulysses | Bear | Obsidian |
|---------|--------|-----------|---------|------|----------|
| Focus Mode | Basic | Advanced | Yes | Yes | Plugin |
| Sentence Focus | **No** | Yes | No | No | No |
| Typewriter | Yes | Yes | Yes | Yes | Plugin |
| Word Goals | Yes | Yes | Yes | No | Plugin |
| Citations | **Yes** | No | No | No | Plugin |
| Wiki-links | **Yes** | No | No | No | **Yes** |
| Graph View | **Yes** | No | No | No | **Yes** |
| ADHD Focus | **Core** | Core | Yes | No | No |
| Projects | **Yes** | No | Yes | No | Plugin |
| Dashboard | **Yes** | No | No | No | No |

**Scribe's Unique Position:** Academic features + ADHD design + Dashboard in one app

---

## Implementation Notes

### Focus Mode Enhancement

```typescript
// HybridEditor.tsx
type FocusStyle = 'sentence' | 'paragraph' | 'typewriter' | 'off'

// CSS classes for each mode
.focus-sentence .ProseMirror p:not(.focused) { opacity: 0.3; }
.focus-paragraph .ProseMirror p:not(.focused) { opacity: 0.3; }
.focus-typewriter { scroll-behavior: smooth; }
```

### Global Quick Capture (Tauri 2)

```rust
// src-tauri/src/lib.rs
use tauri_plugin_global_shortcut::GlobalShortcutExt;

app.global_shortcut().on_shortcut("CmdOrCtrl+Shift+C", |app, shortcut, event| {
    if event.state == ShortcutState::Pressed {
        // Emit event to frontend
        app.emit("global-quick-capture", ()).unwrap();
    }
});
```

---

## Files to Archive

Move to `docs/archive/proposals/`:
- `PROPOSAL-UI-IMPROVEMENTS.md`
- `PROPOSAL-TAGS-PANEL-REDESIGN.md`
- `PROPOSAL-EDITOR-ALTERNATIVES.md`
- `docs/UI-IMPROVEMENTS-PROPOSAL.md`

---

## Next Steps

1. [ ] Review this consolidated roadmap
2. [ ] Prioritize v1.3 scope
3. [ ] Create Sprint 22 plan
4. [ ] Implement Focus Mode Options first (highest ADHD impact)

---

*Consolidated from 4 proposal documents on 2025-12-27*
