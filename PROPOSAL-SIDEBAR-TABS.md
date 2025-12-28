# Proposal: Modern Sidebar Tabs

**Generated:** 2025-12-28
**Context:** Scribe - wonderful-wilson branch

## Overview

Add modern, ADHD-friendly tabbed navigation to both left and right sidebars, replacing the current single-purpose panels with flexible multi-panel systems.

---

## Current State

### Left Sidebar (MissionSidebar)
- Single purpose: Project list + recent notes
- Three modes: icon (48px), compact (240px), card (320px+)
- No tabs, all content stacked vertically

### Right Sidebar
- Three tabs: Properties, Backlinks, Tags
- Uses old `.sidebar-tab` CSS styling
- Only visible when editing a note

---

## Options

### Option A: Pill-Style Tabs (Recommended)

**Effort:** Medium (1-2 days)
**Look:** Modern, rounded pill buttons that slide/animate

```
┌─────────────────────────────────────────┐
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ Projects │ │  Notes   │ │ Capture  │ │
│ └──────────┘ └──────────┘ └──────────┘ │
│   ●●○                                   │
└─────────────────────────────────────────┘
```

**Pros:**
- Touch-friendly (good for trackpad gestures)
- Clear visual distinction between active/inactive
- Works well in all sidebar widths

**Cons:**
- Takes more vertical space than icons

---

### Option B: Icon Tabs with Underline

**Effort:** Quick (< 1 day)
**Look:** Minimal icons with animated underline indicator

```
┌─────────────────────────────────────────┐
│   📁      📝      📥      ⚙️           │
│   ▬▬                                    │
└─────────────────────────────────────────┘
```

**Pros:**
- Minimal vertical footprint
- Clean, modern aesthetic
- Works in icon mode (48px width)

**Cons:**
- Requires tooltips for discoverability
- Less accessible for new users

---

### Option C: Segmented Control (macOS Style)

**Effort:** Medium (1-2 days)
**Look:** Connected buttons with sliding highlight

```
┌─────────────────────────────────────────┐
│ ┌────────────────────────────────────┐  │
│ │ Projects │ Notes │ Inbox │ Graph  │  │
│ └────────────────────────────────────┘  │
│     ▀▀▀▀▀▀▀▀                            │
└─────────────────────────────────────────┘
```

**Pros:**
- Native macOS feel
- Compact and elegant
- Clear active state

**Cons:**
- May feel cramped with many tabs
- Requires minimum sidebar width

---

## Recommended Implementation: Option A + B Hybrid

Use **pill tabs** for compact/card modes, **icon tabs** for icon mode.

### Left Sidebar Tabs

| Tab | Icon | Purpose | Content |
|-----|------|---------|---------|
| Projects | `FolderKanban` | Project management | Project list, search, create |
| Notes | `FileText` | All notes | Note list, filters, sort |
| Inbox | `Inbox` | Quick capture queue | Unprocessed captures |
| Graph | `GitBranch` | Knowledge graph | Mini graph view |

### Right Sidebar Tabs (Enhanced)

| Tab | Icon | Purpose | Content |
|-----|------|---------|---------|
| Properties | `Settings` | Note metadata | Status, type, dates, word count |
| Links | `Link` | Connections | Backlinks + outgoing links |
| Tags | `Tag` | Categorization | Tag cloud, add/remove |
| AI | `Sparkles` | AI assistance | Claude/Gemini actions |
| TOC | `List` | Table of contents | Heading outline |

---

## Visual Design

### Tab Bar Component

```tsx
interface TabBarProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (id: string) => void
  variant: 'pill' | 'icon' | 'segment'
  size: 'sm' | 'md' | 'lg'
}

interface Tab {
  id: string
  label: string
  icon: LucideIcon
  badge?: number  // For inbox count, etc.
}
```

### Styling (Tailwind + CSS Variables)

```css
/* Tab container */
.sidebar-tabs-modern {
  display: flex;
  gap: 4px;
  padding: 8px;
  background: var(--nexus-bg-secondary);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* Pill variant */
.tab-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  color: var(--nexus-text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 150ms ease;
}

.tab-pill:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--nexus-text-primary);
}

.tab-pill.active {
  background: var(--nexus-accent);
  color: var(--nexus-bg-primary);
}

/* Icon variant */
.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: var(--nexus-text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 150ms ease;
  position: relative;
}

.tab-icon.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 2px;
  background: var(--nexus-accent);
  border-radius: 1px;
}

/* Badge for counts */
.tab-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 14px;
  height: 14px;
  padding: 0 4px;
  font-size: 9px;
  font-weight: 600;
  color: white;
  background: #ef4444;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## Animation Details

### Tab Switch Animation

```css
/* Slide-in content */
@keyframes tabContentSlideIn {
  from {
    opacity: 0;
    transform: translateX(8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.tab-content-enter {
  animation: tabContentSlideIn 200ms ease-out;
}

/* Pill active indicator animation */
.tab-pill.active {
  animation: pillActivate 200ms ease-out;
}

@keyframes pillActivate {
  0% { transform: scale(0.95); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  .tab-content-enter,
  .tab-pill.active {
    animation: none;
  }
}
```

---

## Keyboard Navigation

| Shortcut | Action |
|----------|--------|
| `⌘1` - `⌘4` | Switch left sidebar tab |
| `⌘⇧1` - `⌘⇧5` | Switch right sidebar tab |
| `Tab` | Cycle through tabs (when focused) |
| `←` / `→` | Navigate tabs (when focused) |

---

## State Persistence

```typescript
// Add to preferences.ts
interface SidebarPreferences {
  leftActiveTab: 'projects' | 'notes' | 'inbox' | 'graph'
  rightActiveTab: 'properties' | 'links' | 'tags' | 'ai' | 'toc'
}
```

---

## Implementation Plan

### Phase 1: Create Tab Components

1. [ ] Create `SidebarTabs.tsx` component
2. [ ] Create `TabButton.tsx` (pill, icon, segment variants)
3. [ ] Add CSS/Tailwind styles
4. [ ] Add keyboard navigation hook

### Phase 2: Left Sidebar Integration

5. [ ] Add tab state to `useAppViewStore`
6. [ ] Update `MissionSidebar` to use tabs
7. [ ] Create `NotesPanel` component
8. [ ] Create `InboxPanel` component (move from MissionControl)
9. [ ] Create `MiniGraphPanel` component

### Phase 3: Right Sidebar Enhancement

10. [ ] Refactor right sidebar to use new tab component
11. [ ] Add `AIPanel` component
12. [ ] Add `TOCPanel` component (table of contents)
13. [ ] Update keyboard shortcuts

### Phase 4: Polish

14. [ ] Add animations
15. [ ] Add tooltips for icon mode
16. [ ] Add badge support (inbox count)
17. [ ] Test reduced motion
18. [ ] Write tests

---

## Quick Wins

1. **Inbox badge** - Show unprocessed capture count on Inbox tab
2. **Tab memory** - Remember last active tab per session
3. **Swipe gestures** - Swipe left/right on trackpad to switch tabs
4. **Double-click** - Double-click tab to maximize/minimize sidebar

---

## Long-term Enhancements

- [ ] Draggable tab reordering
- [ ] Customizable tabs (hide/show specific tabs)
- [ ] Tab groups (collapsible sections)
- [ ] Floating tabs (detachable panels)
- [ ] Context-aware tabs (show relevant tabs based on note type)

---

## Recommended Path

**Start with Phase 1-2** focusing on the left sidebar:
1. Create the tab component system
2. Add tabs to left sidebar only
3. Gather feedback before enhancing right sidebar

This keeps the scope manageable while delivering visible value quickly.

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/renderer/src/components/SidebarTabs.tsx` | **Create** |
| `src/renderer/src/components/TabButton.tsx` | **Create** |
| `src/renderer/src/components/sidebar/NotesPanel.tsx` | **Create** |
| `src/renderer/src/components/sidebar/InboxPanel.tsx` | **Create** |
| `src/renderer/src/components/sidebar/MiniGraphPanel.tsx` | **Create** |
| `src/renderer/src/components/sidebar/AIPanel.tsx` | **Create** |
| `src/renderer/src/components/sidebar/TOCPanel.tsx` | **Create** |
| `src/renderer/src/store/useAppViewStore.ts` | **Modify** |
| `src/renderer/src/components/sidebar/MissionSidebar.tsx` | **Modify** |
| `src/renderer/src/components/sidebar/CompactListMode.tsx` | **Modify** |
| `src/renderer/src/components/sidebar/CardViewMode.tsx` | **Modify** |
| `src/renderer/src/index.css` | **Modify** |
| `src/renderer/src/App.tsx` | **Modify** |

---

## Next Steps

1. [ ] Review and approve this proposal
2. [ ] Decide on pill vs icon vs hybrid approach
3. [ ] Decide which tabs to include in v1
4. [ ] Begin Phase 1 implementation
