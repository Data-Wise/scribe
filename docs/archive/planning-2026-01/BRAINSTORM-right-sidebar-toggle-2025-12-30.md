# Brainstorm: Right Sidebar Toggle Button Placement

**Topic:** Where to place the toggle for showing/hiding right sidebar
**Mode:** design | **Depth:** quick | **Generated:** 2025-12-30

---

## Current State

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  EDITOR TABS (44px)                         RIGHT SIDEBAR TABS (44px)       │
│  ┌────────────────────────────────────────┐ ┌─────────────────────────────┐ │
│  │ (●) Mission  (●) Note 1  (●) Note 2    │ │ Props  Links  Tags  [◀] [⋮]│ │
│  └────────────────────────────────────────┘ └─────────────────────────────┘ │
│                                                     ↑                       │
│                              Toggle button currently at END of tab bar      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Ideas (7 Options)

### Option 1: Keep at End of Tab Bar ✅ Current
```
│ Props  Links  Tags  Claude  Term  [◀]  [⋮] │
```
**Pros:** Discoverable, near related tabs
**Cons:** Takes horizontal space from tabs

---

### Option 2: Edge Button (Right Edge of Screen)
```
                                             [◀]
┌──────────────────────────────────────────┐ │
│         EDITOR                           │ │
│                                          │ │
└──────────────────────────────────────────┘ │
```
**Pros:** Always visible, doesn't take tab space
**Cons:** Far from content, floating UI

---

### Option 3: In Editor Tab Bar (Right Side)
```
│ (●) Mission  (●) Note 1  ───────  [◀] │
```
**Pros:** Unified location, near editor
**Cons:** Mixes editor tabs with sidebar control

---

### Option 4: Status Bar Button
```
┌──────────────────────────────────────────────────────────┐
│ 📝 2,450 words │ Reading: 9 min │ Browser │ [◀] Sidebar  │
└──────────────────────────────────────────────────────────┘
```
**Pros:** Persistent, bottom-level controls
**Cons:** Far from sidebar, may not be noticed

---

### Option 5: Keyboard-Only (⌘⇧])
```
No visible button - rely on ⌘⇧] shortcut only
```
**Pros:** Clean UI, no button clutter
**Cons:** Not discoverable, power-user only

---

### Option 6: Hover Edge Reveal
```
When mouse near right edge → show floating [◀] button
Otherwise → hidden
```
**Pros:** Clean when not needed, appears on intent
**Cons:** Discoverability, accidental triggers

---

### Option 7: Grip Handle (Divider Drag)
```
                                        ║
┌────────────────────────────────────┐  ║  ┌─────────────┐
│         EDITOR                     │  ╠═ │  SIDEBAR    │
│                                    │  ║  │             │
└────────────────────────────────────┘  ║  └─────────────┘
                                        ↑
                              Drag to resize OR double-click to collapse
```
**Pros:** Standard pattern (VS Code, IDEs), intuitive
**Cons:** Requires more implementation work

---

## Recommended: Option 1 + 7 Combo

Keep the current button at end of tab bar **AND** add a draggable divider:
- Button for quick toggle (visible, discoverable)
- Divider for resize + double-click collapse (power users)
- Keyboard shortcut ⌘⇧] for keyboard users

---

## Quick Win

**Keep current placement** - it's already working and matches the pattern. The toggle button at the end of the sidebar tabs is a common UX pattern (VS Code, Notion, etc.).

If you want enhancement, add:
1. ✅ Already done: ⌘⇧] keyboard shortcut
2. 🔧 Future: Draggable divider for resize
