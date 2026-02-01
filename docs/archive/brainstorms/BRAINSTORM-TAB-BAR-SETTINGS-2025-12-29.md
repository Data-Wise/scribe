# Tab Bar Style Settings - Design Document

**Generated:** 2025-12-29
**Priority:** P1 - Implement this session

---

## Overview

Add configurable tab bar styles to Settings → Appearance, allowing users to choose:
1. **Tab Bar Background Style** - How the tab bar is visually separated from the editor
2. **Border Style** - Modern border treatments for UI zones
3. **Active Tab Style** - How the selected tab stands out

---

## Tab Bar Background Styles

| Style | Description | CSS Implementation |
|-------|-------------|-------------------|
| **Subtle** | Slightly darker/lighter than editor | `--nexus-bg-tertiary` |
| **Elevated** | Shadow + distinct bg (Arc-like) | `box-shadow + tertiary bg` |
| **Glassmorphism** | Frosted blur effect | `backdrop-filter: blur(12px)` |
| **Borderless** | Same as editor, border only | `--nexus-bg-primary` |

### Visual Preview

```
┌─ SUBTLE ──────────────────────────────────────┐
│ Tab bar uses tertiary bg (slightly different) │
│ Soft 1px border separates from editor         │
└───────────────────────────────────────────────┘

┌─ ELEVATED ────────────────────────────────────┐
│ Tab bar floats above with shadow              │
│ Clear visual hierarchy                        │
└───────────────────────────────────────────────┘

┌─ GLASSMORPHISM ───────────────────────────────┐
│ ▒▒▒▒▒▒▒ Frosted blur effect ▒▒▒▒▒▒▒         │
│ Modern, premium feel                          │
└───────────────────────────────────────────────┘

┌─ BORDERLESS ──────────────────────────────────┐
│ Same background as editor                     │
│ Only thin border/line separates               │
└───────────────────────────────────────────────┘
```

---

## Border Styles

| Style | Description | CSS |
|-------|-------------|-----|
| **Sharp** | Traditional 1px solid | `border: 1px solid rgba(...)` |
| **Soft** | Subtle gradient fade | `border-image: linear-gradient(...)` |
| **Glow** | Accent-colored soft glow | `box-shadow: 0 0 8px accent` |
| **None** | No visible border | `border: none` |

---

## Active Tab Emphasis

| Style | Description | Visual |
|-------|-------------|--------|
| **Elevated** | Shadow + lift | Tab pops forward |
| **Accent Bar** | Gradient bar at bottom | Current style |
| **Background** | Fill color change only | Subtle |
| **Bold** | Bold text + no other effect | Minimal |
| **Full** | All effects combined | Maximum emphasis |

---

## Settings UI Design

Add new section to **Settings → Appearance**:

```
┌─────────────────────────────────────────────────────────────┐
│ 📐 UI STYLE                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Tab Bar Style                                               │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ [Subtle] [Elevated ✓] [Glass] [Borderless]             ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Border Style                                                │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ [Sharp] [Soft ✓] [Glow] [None]                         ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Active Tab Emphasis                                         │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ [Elevated ✓] [Accent Bar] [Background] [Bold]          ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Preview:                                                ││
│ │ ╭────────────────────────────────────────────────────╮ ││
│ │ │  🏠 Mission Control  │  📄 Note 1  │  📄 Note 2   │ ││
│ │ ╰────────────────────────────────────────────────────╯ ││
│ │                                                        ││
│ │        (Live preview of selected styles)               ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Preferences Schema

Add to `preferences.ts`:

```typescript
// UI Style preferences (v1.7)
export type TabBarStyle = 'subtle' | 'elevated' | 'glass' | 'borderless'
export type BorderStyle = 'sharp' | 'soft' | 'glow' | 'none'
export type ActiveTabStyle = 'elevated' | 'accent-bar' | 'background' | 'bold' | 'full'

export interface UserPreferences {
  // ... existing fields ...

  // UI Style (v1.7)
  tabBarStyle: TabBarStyle
  borderStyle: BorderStyle
  activeTabStyle: ActiveTabStyle
}

const DEFAULT_PREFERENCES: UserPreferences = {
  // ... existing defaults ...

  // UI Style defaults
  tabBarStyle: 'elevated',      // Modern default
  borderStyle: 'soft',          // Easy on eyes
  activeTabStyle: 'elevated',   // Clear distinction
}
```

---

## CSS Implementation

### EditorTabs.css Updates

```css
/* ============================================================
   TAB BAR STYLE VARIANTS
   ============================================================ */

/* Base - use theme variables */
.editor-tabs {
  background: var(--nexus-bg-tertiary);
  border-bottom: 1px solid rgba(var(--nexus-text-muted-rgb), 0.1);
}

/* Subtle (default) */
.editor-tabs[data-style="subtle"] {
  background: var(--nexus-bg-tertiary);
  box-shadow: none;
}

/* Elevated */
.editor-tabs[data-style="elevated"] {
  background: var(--nexus-bg-tertiary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Glassmorphism */
.editor-tabs[data-style="glass"] {
  background: rgba(var(--nexus-bg-secondary-rgb), 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Borderless */
.editor-tabs[data-style="borderless"] {
  background: var(--nexus-bg-primary);
  border-bottom: 1px solid rgba(var(--nexus-text-muted-rgb), 0.08);
  box-shadow: none;
}

/* ============================================================
   BORDER STYLE VARIANTS
   ============================================================ */

.editor-tabs[data-border="sharp"] {
  border-bottom: 1px solid rgba(var(--nexus-text-muted-rgb), 0.2);
}

.editor-tabs[data-border="soft"] {
  border-bottom: 1px solid rgba(var(--nexus-text-muted-rgb), 0.08);
}

.editor-tabs[data-border="glow"] {
  border-bottom: none;
  box-shadow: 0 1px 0 0 var(--nexus-accent),
              0 2px 8px rgba(var(--nexus-accent-rgb), 0.15);
}

.editor-tabs[data-border="none"] {
  border-bottom: none;
}

/* ============================================================
   ACTIVE TAB STYLE VARIANTS
   ============================================================ */

/* Elevated (default) */
.editor-tab.active[data-active-style="elevated"] {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
  font-weight: 600;
}

/* Accent Bar */
.editor-tab.active[data-active-style="accent-bar"] {
  box-shadow: none;
  transform: none;
}
.editor-tab.active[data-active-style="accent-bar"] .tab-accent-bar {
  display: block;
}

/* Background only */
.editor-tab.active[data-active-style="background"] {
  background: var(--nexus-accent-subtle, rgba(var(--nexus-accent-rgb), 0.15));
  box-shadow: none;
  transform: none;
}

/* Bold text only */
.editor-tab.active[data-active-style="bold"] {
  font-weight: 700;
  box-shadow: none;
  transform: none;
}

/* Full (all effects) */
.editor-tab.active[data-active-style="full"] {
  background: rgba(var(--nexus-accent-rgb), 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
  font-weight: 600;
}
.editor-tab.active[data-active-style="full"] .tab-accent-bar {
  display: block;
}
```

---

## Implementation Plan

| Step | Task | Effort |
|------|------|--------|
| 1 | Add types to `preferences.ts` | 5 min |
| 2 | Update `EditorTabs.css` with variants | 20 min |
| 3 | Update `EditorTabs.tsx` to read preferences | 10 min |
| 4 | Add UI Style section to `SettingsModal.tsx` | 30 min |
| 5 | Add live preview in settings | 15 min |
| 6 | Test across all 10 themes | 15 min |
| **Total** | | **~1.5 hours** |

---

## Recommended Defaults

| Setting | Default | Reasoning |
|---------|---------|-----------|
| Tab Bar Style | **Elevated** | Clear visual hierarchy, modern |
| Border Style | **Soft** | ADHD-friendly, not harsh |
| Active Tab Style | **Elevated** | Clear distinction without overload |

---

## Decision Points

1. **Include live preview?** → Yes, helps users see changes immediately
2. **Save per-theme?** → No, keep it simple - one global setting
3. **Reset to defaults button?** → Yes, easy recovery

---

*Created: 2025-12-29*
