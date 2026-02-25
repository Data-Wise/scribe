# UI Design Review: Scribe Sidebar & Mission Control

**Date:** 2026-01-09
**Reviewer:** Claude (with research from Obsidian, VS Code, Zed, Notion)
**Current Version:** v1.14.0
**Spec Reviewed:** SPEC-left-sidebar-redesign-2026-01-08.md

---

## Executive Summary

Scribe's sidebar design is **solid but has room for improvement** by borrowing proven patterns from leading knowledge tools. The current three-mode system (Icon 48px → Compact 240px → Card 380px) is ADHD-friendly, but lacks some polish and discoverability features found in Obsidian and VS Code.

**Overall Grade:** B+ (Good foundation, needs refinement)

**Quick Wins:** 8 improvements (< 2 hours each)
**Medium Effort:** 5 enhancements (2-6 hours each)
**Long-term:** 3 strategic additions (v2.0 features)

---

## Research Sources

This review draws from:

### Obsidian Plugins (Most Downloaded 2025)
- [Iconic](https://www.obsidianstats.com/plugins/iconic) - Icon customization (1,300+ icons)
- [Rainbow-Colored Sidebar](https://www.obsidianstats.com/tags/sidebar) - Theme-based coloring
- [Auto Hide](https://www.obsidianstats.com/tags/sidebar) - Smart collapsing
- [Recent Files](https://www.obsidianstats.com/tags/sidebar) - Quick access history
- [Sidebar Resizer](https://www.obsidianstats.com/tags/sidebar) - Precision width control

Full list: [Obsidian Sidebar Plugins](https://www.obsidianstats.com/tags/sidebar), [Most Downloaded](https://www.obsidianstats.com/most-downloaded)

### VS Code Design Guidelines
- [UX Guidelines](https://code.visualstudio.com/api/ux-guidelines/overview) - Official design patterns
- [Sidebars API](https://code.visualstudio.com/api/ux-guidelines/sidebars) - Container/item architecture
- [Custom Layout](https://code.visualstudio.com/docs/configure/custom-layout) - View customization

### Zed Editor
- [Settings UI Rebuild](https://zed.dev/blog/settings-ui) - Modern settings design
- [Visual Customization](https://zed.dev/docs/visual-customization) - Theme patterns
- [UI Discussions](https://github.com/zed-industries/zed/discussions/8763) - Community feedback

---

## Current State Analysis

### ✅ What's Working Well

1. **Progressive Disclosure** - Icon → Compact → Card modes reduce cognitive load
2. **Persistent Landmarks** - Inbox always visible, Activity Bar at bottom
3. **Fast Transitions** - 100ms mode switching (Obsidian plugins often lag)
4. **Smart Icons** - Permanent folders for project types (novel approach)
5. **Tooltips** - Fixed positioning works well (recently fixed z-index)
6. **Mission Control Filter** - Click smart icon → filtered card view (clean UX)

### ⚠️ Needs Improvement

1. **Icon Discoverability** - No legend/guide for first-time users
2. **Visual Hierarchy** - All icons same size/weight (hard to scan)
3. **Color System** - Status dots not theme-aware
4. **Resize Handle** - Subtle, hard to find (VS Code has 5px hit area)
5. **Empty States** - No "Add your first project" visual prompts
6. **Keyboard Nav** - Missing arrow key navigation in compact mode
7. **Search** - No inline sidebar search (Obsidian standard)
8. **Drag Feedback** - Reordering lacks visual preview

---

## Improvement Recommendations

### 🚀 Quick Wins (< 2 hours each)

#### 1. Add Icon Legend on First Launch

**Problem:** New users don't know what the colored dots mean.

**Solution:** Show dismissible tooltip panel on first launch:

```
┌────────────────────────────┐
│ 💡 Sidebar Guide           │
│ ──────────────────────────│
│ 🔵 Active project          │
│ ⚪ Inactive project         │
│ 📥 Inbox (quick notes)     │
│ 🔍 Search all notes        │
│ 📅 Today's daily note      │
│ ⚙️ Settings                │
│                            │
│ Tip: Click any dot to      │
│ expand the sidebar.        │
│                            │
│ [Got it] [Don't show]      │
└────────────────────────────┘
```

**Inspiration:** VS Code's "Welcome" panel, Obsidian's first-run tips.

**Implementation:**
- Store `hasSeenSidebarGuide` in localStorage
- Show overlay on first app launch
- Accessible via Help menu later

---

#### 2. Improve Resize Handle Visibility

**Problem:** Current handle is 2px, hard to grab (especially on trackpad).

**Solution:** Match VS Code's approach:

```css
.resize-handle {
  width: 5px; /* Wider hit area */
  cursor: col-resize;
  background: transparent;
  transition: background 150ms;
}

.resize-handle:hover,
.resize-handle:active {
  background: var(--nexus-accent);
  box-shadow: 0 0 4px var(--nexus-accent);
}
```

**Bonus:** Add double-click to reset to default width (Obsidian pattern).

**Files:** `src/renderer/src/components/sidebar/ResizeHandle.tsx`

---

#### 3. Add Theme-Aware Status Dots

**Problem:** Status dots use fixed colors (blue/white), don't adapt to theme.

**Solution:** Use CSS variables with semantic meaning:

```typescript
// In StatusDot.tsx
const statusColors = {
  active: 'var(--status-active)',     // Blue in dark, navy in light
  paused: 'var(--status-paused)',     // Amber
  complete: 'var(--status-complete)', // Green
  archive: 'var(--status-archive)'    // Gray
}
```

**Inspiration:** Obsidian's [Rainbow-Colored Sidebar](https://www.obsidianstats.com/tags/sidebar) plugin (9 color schemes).

**Files:** `src/renderer/src/components/sidebar/StatusDot.tsx`, `src/index.css`

---

#### 4. Add Keyboard Navigation in Compact Mode

**Problem:** Can't use arrow keys to navigate project list.

**Solution:** Implement arrow key handlers:

```typescript
// In CompactListMode.tsx
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    focusNextProject()
  } else if (e.key === 'ArrowUp') {
    focusPreviousProject()
  } else if (e.key === 'Enter') {
    openFocusedProject()
  }
}
```

**Inspiration:** VS Code's file explorer ([UX Guidelines](https://code.visualstudio.com/api/ux-guidelines/overview)).

**Files:** `src/renderer/src/components/sidebar/CompactListMode.tsx`

---

#### 5. Add Empty State Illustrations

**Problem:** Empty sidebar shows nothing (confusing for new users).

**Solution:** Add friendly empty state:

```tsx
{projects.length === 0 && (
  <div className="empty-state">
    <FolderPlus className="icon" />
    <h3>No projects yet</h3>
    <p>Create your first project to get started</p>
    <button onClick={onCreateProject}>
      + New Project
    </button>
  </div>
)}
```

**Inspiration:** Notion's empty database views.

**Files:** `src/renderer/src/components/sidebar/IconBarMode.tsx`

---

#### 6. Improve Drag-and-Drop Feedback

**Problem:** Dragging projects shows no preview or drop zone indicator.

**Solution:** Add visual cues during drag:

```css
/* Show drop zone */
.project-icon-btn.drag-over::before {
  content: '';
  position: absolute;
  top: -4px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--nexus-accent);
}

/* Ghost while dragging */
.project-icon-btn.dragging {
  opacity: 0.5;
  transform: scale(0.95);
}
```

**Inspiration:** Obsidian's drag-to-reorder for files/folders.

**Files:** `src/renderer/src/components/sidebar/IconBarMode.tsx`, `src/index.css`

---

#### 7. Add "Recent Notes" Quick Access

**Problem:** No way to quickly access recently edited notes from sidebar.

**Solution:** Add Recent section in Activity Bar (optional 4th icon):

```
├────┤  ACTIVITY BAR
│ 🔍 │  Search
│ 📅 │  Daily
│ 🕒 │  Recent (NEW)
│ ⚙️ │  Settings
└────┘
```

**Inspiration:** Obsidian's [Recent Files](https://www.obsidianstats.com/tags/sidebar) plugin (highly popular).

**Implementation:**
- Track last 10 opened notes in Zustand store
- Click icon → dropdown with recent list
- Cmd+E shortcut for quick access

**Files:** `src/renderer/src/components/sidebar/ActivityBar.tsx`

---

#### 8. Add Inline Search in Compact Mode

**Problem:** Must open Mission Control to search notes.

**Solution:** Add collapsible search bar at top of compact mode:

```
┌──────────────────────┐
│  🔍 [Search notes...] │  ← Click to expand
├──────────────────────┤
│ 📥 INBOX (3)         │
│ ...
```

**Inspiration:** VS Code's tree view search ([Sidebars](https://code.visualstudio.com/api/ux-guidelines/sidebars)).

**Files:** `src/renderer/src/components/sidebar/CompactListMode.tsx`

---

### 🔧 Medium Effort (2-6 hours each)

#### 9. Add Icon Customization (à la Iconic)

**Problem:** Users can't customize project icons (stuck with status dots).

**Solution:** Allow custom emoji/icon per project via Settings:

```tsx
// In Project Settings
<IconPicker
  value={project.emoji}
  onChange={(emoji) => updateProject({ emoji })}
  icons={lucideIcons}  // 1,300+ icons from lucide-react
/>
```

**Inspiration:** Obsidian's [Iconic](https://www.obsidianstats.com/plugins/iconic) plugin (1,300 icons).

**Effort:** 4 hours (icon picker component + settings integration)

**Files:**
- `src/renderer/src/components/settings/ProjectSettings.tsx`
- `src/renderer/src/components/IconPicker.tsx` (new)

---

#### 10. Add "Collapse Sidebar on Focus" Mode

**Problem:** Some users want sidebar to auto-hide when clicking editor.

**Solution:** Add setting for auto-collapse behavior:

```typescript
// In Settings
{
  label: 'Auto-collapse sidebar when writing',
  type: 'toggle',
  value: preferences.autoCollapseSidebar,
  onChange: (value) => updatePreferences({ autoCollapseSidebar: value })
}
```

**Inspiration:** Obsidian's [Auto Hide](https://www.obsidianstats.com/tags/sidebar) plugin.

**Effort:** 3 hours (event listeners + animation)

**Files:**
- `src/renderer/src/components/sidebar/MissionSidebar.tsx`
- `src/renderer/src/components/Settings/GeneralSettings.tsx`

---

#### 11. Add Contextual Actions in Tooltips

**Problem:** Must right-click to access project actions (rename, archive, etc.).

**Solution:** Add action buttons to hover tooltips:

```
┌────────────────────────┐
│ Research               │
│ Active • 3 notes       │
│ ──────────────────────│
│ [Open] [Pin] [⋮ More] │
└────────────────────────┘
```

**Inspiration:** VS Code's hover tooltips with inline actions.

**Effort:** 5 hours (extend Tooltip component + action handlers)

**Files:** `src/renderer/src/components/sidebar/Tooltip.tsx`

---

#### 12. Add Sidebar Width Presets

**Problem:** Users must manually resize to find preferred width.

**Solution:** Add quick presets in Settings:

```
Sidebar Width:
○ Narrow (180px)
○ Medium (280px)  ← Default
○ Wide (380px)
```

**Inspiration:** Obsidian's [Sidebar Resizer](https://www.obsidianstats.com/tags/sidebar) plugin.

**Effort:** 2 hours (add presets to settings)

**Files:** `src/renderer/src/components/Settings/AppearanceSettings.tsx`

---

#### 13. Add Project Color Customization

**Problem:** Projects only distinguished by status color (limited palette).

**Solution:** Allow custom accent color per project:

```tsx
// In Project Settings
<ColorPicker
  value={project.color}
  onChange={(color) => updateProject({ color })}
  presets={['emerald', 'blue', 'amber', 'purple', 'rose']}
/>
```

**Inspiration:** Obsidian's color customization for folders.

**Effort:** 6 hours (color picker + theme integration)

**Files:**
- `src/renderer/src/components/settings/ProjectSettings.tsx`
- `src/renderer/src/components/ColorPicker.tsx` (new)

---

### 🏗️ Long-term Strategic (v2.0 Features)

#### 14. Add "Workspaces" Concept

**Problem:** No way to save/restore sidebar configurations for different contexts.

**Solution:** Allow saving sidebar state as "Workspaces":

```
Workspaces:
- 📚 Teaching (3 pinned projects)
- 🔬 Research (5 pinned projects)
- 📝 Writing (2 pinned projects)
```

**Inspiration:** VS Code's workspace feature, Notion's workspace switching.

**Effort:** 18 hours (full feature: UI + state management + persistence)

**Deferred to:** v2.0 (out of scope for v1.x ADHD focus)

---

#### 15. Add Sidebar "Views" (List, Kanban, Calendar)

**Problem:** Sidebar only shows list view (no alternative layouts).

**Solution:** Add view switcher in Activity Bar:

```
├────┤  VIEW SWITCHER
│ ☰  │  List (default)
│ ▦  │  Kanban (by status)
│ 📅 │  Calendar (by date)
└────┘
```

**Inspiration:** Notion's database views.

**Effort:** 40+ hours (major feature, needs design spec)

**Deferred to:** v2.0 (violates "One Thing at a Time" ADHD principle)

---

#### 16. Add Graph View in Sidebar

**Problem:** No visual representation of note connections.

**Solution:** Add mini graph view as Activity Bar item:

```
│ 🕸️ │  Graph
```

**Inspiration:** Obsidian's graph view (highly requested feature).

**Effort:** 60+ hours (graph rendering + layout algorithms)

**Deferred to:** v2.0 (already noted in CLAUDE.md as v2.0 feature)

---

## Implementation Priority Matrix

```
┌─────────────────────────────────────────────────────────┐
│                    IMPACT vs EFFORT                     │
│                                                         │
│  High Impact │                                          │
│         ▲    │  ⑨ Custom Icons    ⑭ Workspaces        │
│         │    │  ① Icon Legend     ⑮ Views              │
│         │    │  ⑦ Recent Notes                         │
│         │    │  ④ Kbd Nav                              │
│         │    │                                          │
│  Medium │    │  ③ Theme Colors    ⑬ Color Picker      │
│         │    │  ② Resize Handle   ⑪ Tooltip Actions   │
│         │    │  ⑥ Drag Feedback                        │
│         │    │                                          │
│  Low    │    │  ⑤ Empty States    ⑯ Graph View        │
│         │    │  ⑧ Inline Search   ⑩ Auto-collapse     │
│         │    │  ⑫ Width Presets                        │
│         └────┼─────────────────────────────────────────▶
│              Low              Medium              High   │
│                      EFFORT (hours)                      │
└─────────────────────────────────────────────────────────┘
```

**Recommended Order:**
1. **Quick Wins First** (①-⑧) - Ship in v1.15 (Sprint 31)
2. **Medium Effort** (⑨-⑬) - Spread across v1.16-v1.18
3. **Long-term** (⑭-⑯) - Plan for v2.0

---

## ADHD-Friendly Design Checklist

Scribe's sidebar **passes** most ADHD principles, but has gaps:

| Principle | Current | Grade | Recommendation |
|-----------|---------|-------|----------------|
| **Zero Friction** | Icon mode default | ✅ A | Keep as-is |
| **One Thing at a Time** | No tabs, single note | ✅ A | Keep as-is |
| **Escape Hatches** | Cmd+W closes | ✅ A | Keep as-is |
| **Visible Progress** | Word count in tooltip | ⚠️ B | Add to status bar |
| **Sensory-Friendly** | Dark mode, minimal animations | ✅ A | Keep as-is |
| **Quick Wins** | No milestone celebrations | ❌ C | Add completion toasts |
| **Discoverable** | No legend, hidden features | ⚠️ C | Add ① Icon Legend |
| **Scannable** | All icons same size/weight | ⚠️ B | Add ③ Theme Colors |
| **Forgiving** | No undo for project delete | ❌ D | Add confirmation dialog |

**Overall ADHD Grade:** B (Good, needs refinement)

---

## Accessibility Audit

Based on [VS Code UX Guidelines](https://code.visualstudio.com/api/ux-guidelines/overview):

| Category | Status | Notes |
|----------|--------|-------|
| **Keyboard Nav** | ⚠️ Partial | Missing arrow key support in compact mode |
| **Screen Reader** | ✅ Good | ARIA labels present, but need testing |
| **Focus Indicators** | ✅ Good | 2px accent outline visible |
| **Color Contrast** | ⚠️ Needs audit | Status dots may fail 4.5:1 ratio |
| **Reduced Motion** | ❌ Missing | No `prefers-reduced-motion` support |
| **Touch Targets** | ⚠️ Small | Icon mode buttons are 32px (should be 44px) |

**Action Items:**
- Add `prefers-reduced-motion` media query (Quick Win)
- Increase icon button size to 40px minimum (Touch-friendly)
- Run axe DevTools audit on sidebar components

---

## Visual Hierarchy Analysis

**Current Issues:**

1. **All Icons Same Weight** - Hard to distinguish Inbox from regular projects
2. **No Visual Grouping** - Smart icons mixed with pinned projects
3. **Weak Dividers** - 1px lines blend into background

**Recommendations:**

```css
/* Stronger visual hierarchy */
.inbox-button {
  font-weight: 600;  /* Bolder than projects */
  font-size: 16px;   /* Larger icon */
}

.smart-icon-group {
  background: rgba(255, 255, 255, 0.03);  /* Subtle background */
  border-radius: 8px;
  padding: 8px 0;
}

.sidebar-divider {
  height: 2px;  /* Thicker */
  background: linear-gradient(90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
}
```

**Inspiration:** Notion's nested hierarchy with indentation + backgrounds.

---

## Performance Notes

Current sidebar is **performant** (< 100ms transitions), but watch for:

1. **Large Project Lists** - Currently no virtualization (fine for < 50 projects)
2. **Tooltip Calculations** - `getBoundingClientRect()` on every hover (acceptable)
3. **Drag-and-Drop** - No debouncing on reorder (add if users report lag)

**VS Code Benchmark:**
- Sidebar toggles: 50-80ms (Scribe: ~100ms) ✅
- File tree rendering: < 200ms for 1000 items (Scribe: N/A - using cards)

---

## Competitive Analysis Summary

| Feature | Scribe | Obsidian | VS Code | Notion | Winner |
|---------|--------|----------|---------|--------|--------|
| **Icon Mode** | ✅ 48px | ❌ No | ❌ No | ❌ No | **Scribe** |
| **Custom Icons** | ❌ Status dots only | ✅ 1,300+ icons | ✅ Codicons | ✅ Emoji | Others |
| **Drag Reorder** | ✅ Projects | ✅ Files/folders | ✅ Views | ✅ Pages | Tie |
| **Theme Colors** | ⚠️ Limited | ✅ 9 schemes | ✅ Full customization | ✅ Full | Others |
| **Auto-hide** | ❌ Manual only | ✅ Plugin | ❌ Manual | ✅ Built-in | Obsidian/Notion |
| **Keyboard Nav** | ⚠️ Partial | ✅ Full | ✅ Full | ✅ Full | Others |
| **Recent Files** | ❌ No | ✅ Plugin | ✅ Built-in | ✅ Built-in | Others |
| **Search** | ❌ Must open MC | ✅ Inline | ✅ Inline | ✅ Inline | Others |

**Takeaway:** Scribe **leads** on minimalism (Icon Mode), but **lags** on customization and discoverability.

---

## Recommended Roadmap

### Sprint 31 (v1.15) - Quick Wins
- ① Icon Legend on first launch
- ② Improve resize handle visibility
- ③ Theme-aware status dots
- ④ Keyboard navigation in compact mode
- ⑤ Empty state illustrations

**Effort:** 10 hours total
**Impact:** High (improves discoverability + accessibility)

### Sprint 32 (v1.16) - Customization
- ⑨ Icon customization (emoji/Lucide icons)
- ⑦ Recent Notes quick access
- ⑥ Drag-and-drop feedback

**Effort:** 12 hours total
**Impact:** High (matches Obsidian's customization)

### Sprint 33 (v1.17) - Polish
- ⑧ Inline search in compact mode
- ⑪ Contextual actions in tooltips
- ⑬ Project color customization

**Effort:** 16 hours total
**Impact:** Medium (power user features)

### v2.0 - Strategic Features
- ⑭ Workspaces
- ⑮ Alternative views (Kanban, Calendar)
- ⑯ Graph view in sidebar

**Effort:** 120+ hours
**Impact:** High (differentiates from Obsidian)

---

## Open Questions for User

1. **Icon Customization:** Should we allow custom icons per project, or keep it minimal (status dots only)?
   - **Pro:** Users love customization (Obsidian's Iconic plugin is top-rated)
   - **Con:** Adds complexity, may distract from writing focus

2. **Auto-collapse Sidebar:** Should sidebar auto-hide when clicking editor?
   - **Pro:** Maximizes writing space (Notion-style)
   - **Con:** May feel jarring for ADHD users (unexpected state changes)

3. **Recent Notes:** Should this be built-in or a settings toggle?
   - **Pro:** Useful for quick access (Obsidian standard)
   - **Con:** Adds cognitive load (more icons in Activity Bar)

4. **Keyboard Shortcuts:** Should we add shortcuts for everything, or keep it minimal?
   - **Pro:** Power users love keyboard efficiency (VS Code model)
   - **Con:** Too many shortcuts = hard to remember (ADHD concern)

---

## Conclusion

**Summary:** Scribe's sidebar is **well-designed for focus**, but lacks **customization and discoverability** features that Obsidian users expect. The three-mode system is unique and ADHD-friendly, but needs polish.

**Grade:** B+ (83/100)
- **Strengths:** Minimal, fast, ADHD-friendly
- **Weaknesses:** Limited customization, keyboard nav gaps, no inline search

**Top 3 Recommendations:**
1. Add **Icon Legend** (1 hour) - Biggest bang for buck
2. Add **Recent Notes** (2 hours) - Match industry standard
3. Add **Custom Icons** (4 hours) - Unlock personalization

**Next Steps:**
- Review this document with user
- Get approval on Quick Wins (①-⑧) for Sprint 31
- Create implementation specs for approved features
- Track progress in `.STATUS` file

---

## Sources

### Obsidian Research
- [Iconic Plugin](https://www.obsidianstats.com/plugins/iconic)
- [Sidebar Plugins Category](https://www.obsidianstats.com/tags/sidebar)
- [Most Downloaded Plugins 2025](https://www.obsidianstats.com/most-downloaded)
- [Obsidian Hub - Sidebar Plugins](https://publish.obsidian.md/hub/02+-+Community+Expansions/02.01+Plugins+by+Category/Side+bar+plugins)

### VS Code Documentation
- [UX Guidelines](https://code.visualstudio.com/api/ux-guidelines/overview)
- [Sidebars API](https://code.visualstudio.com/api/ux-guidelines/sidebars)
- [Custom Layout](https://code.visualstudio.com/docs/configure/custom-layout)
- [User Interface](https://code.visualstudio.com/docs/getstarted/userinterface)

### Zed Editor
- [Settings UI Rebuild](https://zed.dev/blog/settings-ui)
- [Visual Customization](https://zed.dev/docs/visual-customization)
- [UI Improvement Discussions](https://github.com/zed-industries/zed/discussions/8763)

---

**Review Status:** Draft - Awaiting user feedback
**Next:** Approve Quick Wins for Sprint 31 implementation
