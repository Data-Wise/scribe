# UX Analysis: Left Mission Sidebar Design

**Generated:** 2026-01-08
**Context:** Scribe v1.14.0 - ADHD-friendly writing app
**Current State:** 3 modes (icon/compact/card), editor tabs implemented
**Goal:** Optimize visual hierarchy and ADHD-friendly information architecture

---

## Executive Summary

This analysis evaluates the left Mission Sidebar design for Scribe, focusing on ADHD-optimized UX patterns. Key recommendations:

1. **Default to Icon mode** (48px) - Minimize visual clutter by default
2. **Integrated Activity Bar at bottom** - Keep 5 pinned vaults + settings accessible
3. **Clear visual hierarchy** - Inbox always visible at top, projects below
4. **Minimal transitions** - Fast mode switches, no distracting animations
5. **Consistent interaction patterns** - Single-click to expand, hover previews

---

## Current Implementation Analysis

### ✅ What's Working Well

1. **Three distinct modes** with clear purposes:
   - Icon (48px): Maximum editor space
   - Compact (240px): Quick project overview
   - Card (320px+): Rich project information

2. **State persistence** via localStorage:
   - Mode preference saved
   - Width saved for compact/card
   - Smart session detection (> 4 hours → compact)

3. **Editor tabs implemented**:
   - Mission Control pinned first
   - Gradient accent on active tab
   - Keyboard shortcuts (⌘1-9, ⌘W)
   - Drag-to-reorder state ready

4. **Context menus** for projects and notes

### ⚠️ Current Pain Points

1. **No Activity Bar integration** - Settings and quick actions scattered
2. **Inbox not prominent** - Should be always visible, pinned at top
3. **Project order not customizable** - Need pinning/favorites
4. **Mode transitions unclear** - Users may not discover all modes
5. **Icon mode too minimal** - No hints about what icons represent
6. **No hover previews** - Miss quick glances without expanding

---

## User Persona: ADHD Academic Writer

**Name:** Dr. Sarah Chen, Assistant Professor
**Challenges:**
- Visual clutter triggers overwhelm
- Forgets which project she was in
- Needs quick context switches
- Loses track of quick capture notes

**Needs:**
1. **Clear visual hierarchy** - "Where do I start?"
2. **Persistent landmarks** - Inbox always visible
3. **Minimal decisions** - Default mode works 90% of the time
4. **Quick escapes** - Collapse sidebar instantly
5. **Status at a glance** - Unread counts, active projects

---

## Proposed Information Architecture

### Hierarchical Priority

```
Level 1: CRITICAL (Always Visible)
├── Inbox (permanent, top position)
└── Activity Bar (bottom, 5 slots)

Level 2: PRIMARY (Visible in Compact/Card)
├── Pinned Projects (user-selected, max 5)
└── Recent Notes (last 3-5 accessed)

Level 3: SECONDARY (Visible in Card mode)
├── All Projects (alphabetical or custom order)
└── Project statistics (word count, note count)

Level 4: TERTIARY (On-demand via Command Palette)
├── Archived Projects
└── Settings/Preferences
```

### Visual Weight by Mode

| Element | Icon Mode | Compact Mode | Card Mode |
|---------|-----------|--------------|-----------|
| Inbox | Icon + badge | Expanded section | Full list |
| Pinned Projects | Colored dots | List + stats | Cards + previews |
| Activity Bar | Icons only | Icons + labels | Icons + labels |
| Scroll | None | Vertical | Vertical |
| Width | 48px fixed | 200-300px | 320-500px |

---

## Wireframes by Mode

### Icon Mode (48px) - Default State

```
┌────┐
│ ⚡ │  ← App logo (Home button → Mission Control)
├────┤
│    │
│ 📥 │  ← INBOX (always visible)
│ •3 │     Badge: unread count
├────┤
│    │  ← SEPARATOR
│ 🔵 │  ← Research (active project - blue dot)
│    │
│ ⚪ │  ← Teaching (inactive - gray dot)
│    │
│ ⚪ │  ← R pkg (inactive)
│    │
│ ⚪ │  ← Dev tools (inactive)
│    │
│ ➕ │  ← Add project (subtle)
│    │
├────┤
│    │  ← SPACER (flexible)
│    │
├────┤  ← ACTIVITY BAR (bottom)
│ 📊 │  ← Stats / Writing metrics
│ 🔍 │  ← Search
│ ⚙️ │  ← Settings
│ 👤 │  ← Profile
└────┘

INTERACTIONS:
- Click project dot → Expand to compact + auto-scroll to project
- Hover dot → Tooltip (project name + stats)
- Click Inbox → Expand to compact + show inbox contents
- Click Activity icon → Toggle relevant panel
- Long-press sidebar edge → Show resize cursor
```

### Compact Mode (240px) - Quick Overview

```
┌──────────────────────┐
│  ⚡ Scribe      [◀]  │  ← Header: Logo + Collapse button
├──────────────────────┤
│                      │
│  📥 INBOX (3)        │  ← Collapsible section
│  └─ Quick note 1     │     Click to expand/collapse
│  └─ Idea capture     │     Badge shows unread
│  └─ Meeting note     │
│                      │
├──────────────────────┤  ← SEPARATOR
│  PINNED              │  ← Section header
│                      │
│  🔬 Research    ●    │  ← Active indicator (right side)
│     3 notes, 2.4k    │     Stats below name
│                      │
│  📚 Teaching         │
│     12 notes, 8.1k   │
│                      │
│  📦 R pkg            │
│     5 notes, 1.2k    │
│                      │
│  🛠️ Dev tools        │
│     8 notes, 3.4k    │
│                      │
│  [+ New Project]     │  ← Action button (subtle)
│                      │
├──────────────────────┤
│  RECENT              │  ← Collapsible section
│  └─ Methods Draft    │
│  └─ Results v2       │
│                      │
├──────────────────────┤  ← ACTIVITY BAR
│  📊 Stats  🔍 Search │
│  ⚙️ Settings  👤 You │
└──────────────────────┘

INTERACTIONS:
- Click project → Open project notes in right panel
- Right-click project → Context menu (Edit, Archive, Delete)
- Click note → Open in editor tab
- Drag note → Move to different project
- Click section header → Collapse/expand section
- [◀] button → Collapse to icon mode
```

### Card Mode (320px+) - Rich Information

```
┌─────────────────────────────┐
│  ⚡ Scribe            [◀] [▣]│  ← Header: + View switcher
├─────────────────────────────┤
│                             │
│  📥 INBOX (3)      [⚡ Capture]│  ← Quick action button
│  ┌─────────────────────────┐│
│  │ • Quick note 1     2h ago││  ← Timestamp
│  │ • Idea capture     1d ago││
│  │ • Meeting note     2d ago││
│  └─────────────────────────┘│
│                             │
├─────────────────────────────┤
│  PINNED PROJECTS            │
│  ┌─────────────────────────┐│
│  │ 🔬 Research        ●    ││  ← Active indicator
│  │ ─────────────────────   ││
│  │ Mediation Analysis      ││  ← Project description
│  │                         ││
│  │ 📄 3 notes  📊 2,447 words││  ← Rich stats
│  │ 🔥 Active today         ││  ← Activity indicator
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │ 📚 Teaching             ││
│  │ ─────────────────────   ││
│  │ STAT 440 Regression     ││
│  │                         ││
│  │ 📄 12 notes  📊 8,123 words││
│  │ 📅 Updated 3 days ago    ││
│  └─────────────────────────┘│
│                             │
│  [+ New Project]            │
│                             │
├─────────────────────────────┤
│  RECENT NOTES               │
│  • Methods Draft      2m ago│
│  • Results Section    1h ago│
│  • Daily Note         3h ago│
│                             │
├─────────────────────────────┤
│  📊 Stats  🔍 Search        │
│  ⚙️ Settings  👤 You        │
└─────────────────────────────┘

INTERACTIONS:
- All compact mode interactions +
- Click card anywhere → Open project
- Hover card → Subtle lift animation
- Project cards sortable (drag handles)
- [▣] button → Toggle card/list view
```

---

## Activity Bar Integration (Bottom)

### Proposed Layout

```
ACTIVITY BAR (48px height in compact/card, icons only in icon mode)

┌─────────────────────────────────────────┐
│ 📊 Stats   🔍 Search   ⚙️ Settings   👤 │
└─────────────────────────────────────────┘
  ↑          ↑           ↑            ↑
  Stats      Global      Preferences  Profile
  panel      search                   menu
```

### Activity Bar Icons (5 slots)

| Slot | Icon | Purpose | Click Action | Badge |
|------|------|---------|--------------|-------|
| 1 | 📊 | Writing Stats | Toggle stats panel (right sidebar) | None |
| 2 | 🔍 | Global Search | Open search modal/panel | None |
| 3 | ⚙️ | Settings | Open settings dialog | None |
| 4 | 👤 | Profile | User menu (sync, account, logout) | Sync status |
| 5 | ➕ | Quick Actions | Context menu (New project, Today, Capture) | None |

### Interaction Patterns

**Hover:**
- Tooltip appears after 500ms
- Shows icon name + keyboard shortcut
- No animation delay (ADHD consideration)

**Click:**
- Immediate visual feedback (pressed state)
- Action executes within 100ms
- No loading spinners for instant actions

**Active State:**
- Accent color underline (matches theme)
- Icon color shifts to accent
- Persists while panel is open

---

## Visual Hierarchy Design Principles

### 1. Scannable F-Pattern

Users scan in F-pattern: top-left → right → down-left

```
Priority Heat Map:
███ Inbox (top-left) ────────────────────▶ HIGH
│
█ Project 1 (pinned) ──────────────────▶ HIGH
│
█ Project 2 (pinned)
│
▓ Project 3
│
▒ Project 4
│
░ Activity Bar (bottom) ────────────────▶ MEDIUM
```

### 2. Size & Weight Hierarchy

| Level | Font Size | Weight | Color |
|-------|-----------|--------|-------|
| Section Headers | 11px | 600 (semibold) | text-secondary |
| Project Names | 14px | 500 (medium) | text-primary |
| Stats/Meta | 12px | 400 (regular) | text-tertiary |
| Badges | 10px | 500 (medium) | accent |

### 3. Color & Contrast

**ADHD Considerations:**
- Avoid pure white/black (use off-white/near-black)
- Limit accent colors to 2-3 per view
- Use color for meaning, not decoration
- Ensure 4.5:1 contrast for text

**Proposed Palette:**

```
LIGHT MODE:
- Background:    #fafafa (off-white)
- Surface:       #ffffff (white cards)
- Border:        #e5e7eb (subtle gray)
- Text Primary:  #1f2937 (near-black)
- Text Secondary:#6b7280 (medium gray)
- Accent:        #3b82f6 (blue - customizable)
- Active:        #10b981 (green)
- Badge:         #f59e0b (amber)

DARK MODE:
- Background:    #1a1a1a (near-black)
- Surface:       #262626 (elevated)
- Border:        #404040 (subtle)
- Text Primary:  #f5f5f5 (off-white)
- Text Secondary:#a3a3a3 (medium gray)
- Accent:        #60a5fa (lighter blue)
- Active:        #34d399 (lighter green)
- Badge:         #fbbf24 (lighter amber)
```

### 4. Spacing & Rhythm

**8px Grid System:**

```
Compact Mode Spacing:
├─ 16px (top padding)
├─ INBOX header
├─ 8px
├─ Inbox items (4px between)
├─ 16px (section gap)
├─ PINNED header
├─ 8px
├─ Project list (8px between)
├─ 16px (section gap)
├─ Activity Bar (48px fixed)
└─ 0px (no bottom padding)

Card Mode Spacing:
├─ 20px (top padding)
├─ Cards (16px between)
├─ 20px (section gaps)
└─ 48px (activity bar)
```

---

## Interaction Patterns & Micro-interactions

### Mode Transitions

**Icon → Compact:**
```
1. Click any project dot or Inbox
2. Sidebar animates: 48px → 240px (150ms ease-out)
3. Content fades in: opacity 0 → 1 (100ms delay)
4. Auto-scroll to clicked element
5. Focus moves to first interactive element

Duration: 250ms total
Easing: cubic-bezier(0.4, 0, 0.2, 1)
```

**Compact → Icon:**
```
1. Click [◀] collapse button
2. Content fades out: opacity 1 → 0 (50ms)
3. Sidebar animates: 240px → 48px (150ms ease-in)
4. Editor expands to fill space

Duration: 200ms total
Easing: cubic-bezier(0.4, 0, 0.2, 1)
```

**Critical ADHD Consideration:**
- Animations should be fast (< 300ms)
- No bounce or elastic effects (distracting)
- Option to disable animations in settings
- Reduced motion respects system preference

### Hover States

**Icon Mode - Project Dot:**
```
Default:      ⚪ (gray, 8px)
Hover:        ⚪ (scale to 10px, accent glow)
Active:       🔵 (accent color, 8px)
Hover+Active: 🔵 (scale to 10px, brighter)

Tooltip appears:
┌─────────────────────┐
│ 🔬 Research         │
│ 3 notes, 2,447 words│
│ Active today        │
└─────────────────────┘
Position: Right of dot, 8px offset
Delay: 500ms (prevent accidental shows)
```

**Compact Mode - Project Row:**
```
Default:
┌──────────────────────┐
│ 🔬 Research          │
│    3 notes, 2.4k     │
└──────────────────────┘

Hover:
┌──────────────────────┐
│ 🔬 Research      [›] │  ← Chevron appears
│    3 notes, 2.4k     │
└──────────────────────┘
Background: +5% lightness
Transition: 100ms

Active:
┌──────────────────────┐
│ 🔬 Research      [↓] │  ← Down chevron (expanded)
│    3 notes, 2.4k     │
│  ┌─────────────────┐ │
│  │ • Methods Draft │ │  ← Note list (slide down)
│  │ • Results v2    │ │
│  └─────────────────┘ │
└──────────────────────┘
```

**Card Mode - Project Card:**
```
Default:
┌─────────────────────────┐
│ 🔬 Research             │
│ ─────────────────────   │
│ Mediation Analysis      │
│ 📄 3 notes  📊 2,447    │
└─────────────────────────┘
Box-shadow: 0 1px 3px rgba(0,0,0,0.1)

Hover:
┌─────────────────────────┐
│ 🔬 Research         [›] │  ← Action indicator
│ ─────────────────────   │
│ Mediation Analysis      │
│ 📄 3 notes  📊 2,447    │
└─────────────────────────┘
Box-shadow: 0 4px 6px rgba(0,0,0,0.15)
Transform: translateY(-2px)
Transition: 150ms
Cursor: pointer
```

### Drag & Drop

**Dragging a Note to Project:**
```
1. Mouse down on note item (150ms threshold)
2. Drag cursor appears, note follows with slight offset
3. Project drop zones highlight:
   ┌──────────────────────┐
   │ 🔬 Research          │  ← Blue border (drop target)
   └──────────────────────┘
4. Drop: Note moves, toast confirms "Moved to Research"
5. Undo option: Toast shows [Undo] button for 5s
```

**Dragging to Reorder Projects:**
```
Icon Mode: Drag dots to reorder
Compact Mode: Drag project rows
Card Mode: Drag cards

Visual Feedback:
- Dragged item: opacity 0.5, cursor grabbing
- Drop indicator: 2px accent line between items
- Snap to grid: 8px intervals
```

---

## ADHD-Specific UX Optimizations

### 1. Reduce Cognitive Load

**Information Chunking:**
- Max 5 pinned projects visible (more requires scroll)
- Collapsible sections (Inbox, Pinned, Recent)
- Progressive disclosure (stats hidden in icon mode)

**Clear Mental Models:**
- Icon mode = "Focus time" (editor primary)
- Compact mode = "Context aware" (see projects)
- Card mode = "Organizing" (rich information)

### 2. Minimize Decisions

**Smart Defaults:**
- Icon mode on fresh start (get oriented)
- Last used mode after recent session
- Auto-collapse after 4 hours idle

**Preset Layouts:**
- "Writing Focus": Icon mode, editor only
- "Project Work": Compact mode, editor + backlinks
- "Organizing": Card mode, editor + properties

### 3. Visual Anchors

**Permanent Landmarks:**
- Inbox always at top (consistent position)
- Activity Bar always at bottom
- Mission Control tab always first
- Current project highlighted with accent

**Orientation Cues:**
- Breadcrumb in editor header
- Active project dot in icon mode
- Scroll position indicator in long lists

### 4. Quick Escapes

**Instant Actions:**
- Cmd+0: Toggle sidebar
- Cmd+1: Mission Control (home base)
- Cmd+Shift+C: Capture to Inbox
- Escape: Close modals/panels

**Undo Everything:**
- Move note: Undo toast (5s)
- Delete: Confirmation required
- Close tab: Cmd+Shift+T to reopen

### 5. Status at a Glance

**Badges & Indicators:**
```
📥 •3   ← Inbox unread count (amber badge)
🔬 ●    ← Active project (green dot)
🔥 7    ← Writing streak (activity bar)
● Sync  ← Connection status (green/red)
```

**Color Coding:**
- Green: Active, success, sync OK
- Amber: Attention needed, inbox unread
- Red: Error, disconnected, action required
- Blue: Selected, focus, navigation

---

## Accessibility Considerations

### Keyboard Navigation

**Tab Order:**
```
1. Sidebar collapse/expand button [◀]
2. Inbox section
3. Inbox items (arrow keys to navigate)
4. Pinned Projects header
5. Project 1 (Enter to expand, arrow keys for notes)
6. Project 2
7. ...
8. Activity Bar icon 1
9. Activity Bar icon 2
10. ...
```

**Shortcuts:**
```
Tab/Shift+Tab: Move focus
Enter: Activate item (open project/note)
Space: Toggle checkbox/expand
Arrow Keys: Navigate within sections
Cmd+0: Toggle sidebar
Escape: Collapse/close current context
```

### Screen Reader Support

**Semantic HTML:**
```html
<aside role="navigation" aria-label="Projects Sidebar">
  <section aria-labelledby="inbox-header">
    <h2 id="inbox-header">Inbox</h2>
    <ul role="list">
      <li role="listitem">
        <button aria-label="Quick note 1, 2 hours ago">
          Quick note 1
        </button>
      </li>
    </ul>
  </section>
</aside>
```

**ARIA Attributes:**
- `aria-expanded` on collapsible sections
- `aria-selected` on active project
- `aria-current="page"` on current note
- `aria-live="polite"` for badge updates
- `aria-describedby` for tooltips

**Focus Management:**
- Visible focus indicators (2px accent outline)
- Focus trapped in modals
- Focus restored after closing dialogs
- Skip links for keyboard users

### Color Blindness

**Redundant Encoding:**
- Don't rely solely on color (use icons + text)
- Active state: color + dot + bold text
- Badges: color + icon + count
- Status: color + icon + text label

**Contrast Ratios:**
- Text: 4.5:1 minimum (WCAG AA)
- UI elements: 3:1 minimum
- Focus indicators: 3:1 minimum
- Test with Deuteranopia/Protanopia filters

### Reduced Motion

**Respect System Preferences:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Fallbacks:**
- Instant sidebar toggle (no slide animation)
- Fade transitions → immediate (no duration)
- Hover effects → immediate (no delay)

---

## Implementation Recommendations

### Phase 1: Icon Mode Enhancements (Priority 1)

**Goal:** Make icon mode more discoverable and useful

**Tasks:**
1. Add tooltip on hover (project name + stats)
2. Implement colored dots for project identity
3. Add badge to Inbox icon (unread count)
4. Improve click target size (16px actual, 32px interactive)
5. Add Activity Bar at bottom (icons only)

**Effort:** 4-6 hours
**Impact:** High (most users start in icon mode)

### Phase 2: Inbox Pinning (Priority 1)

**Goal:** Make Inbox always visible and prominent

**Tasks:**
1. Move Inbox to permanent top position (all modes)
2. Add collapsible section in compact/card modes
3. Implement quick capture shortcut (Cmd+Shift+C)
4. Add badge for unread/unprocessed items
5. Style differently from projects (always amber accent)

**Effort:** 6-8 hours
**Impact:** High (ADHD quick capture workflow)

### Phase 3: Activity Bar Integration (Priority 2)

**Goal:** Centralize common actions at bottom

**Tasks:**
1. Create ActivityBar component (48px height)
2. Implement 5 icon slots (Stats, Search, Settings, Profile, Quick)
3. Add tooltips and keyboard shortcuts
4. Integrate with existing panels (stats, search)
5. Add active state indicators

**Effort:** 8-10 hours
**Impact:** Medium (improves discoverability)

### Phase 4: Project Pinning (Priority 2)

**Goal:** Let users customize sidebar contents

**Tasks:**
1. Add "Pin to Sidebar" option in project context menu
2. Separate pinned section from all projects
3. Allow drag-to-reorder pinned projects
4. Persist order in localStorage
5. Limit to 5 pinned projects (ADHD consideration)

**Effort:** 6-8 hours
**Impact:** Medium (power user feature)

### Phase 5: Visual Polish (Priority 3)

**Goal:** Refine micro-interactions and aesthetics

**Tasks:**
1. Add hover states for all interactive elements
2. Implement smooth transitions (150-200ms)
3. Add drag-and-drop visual feedback
4. Polish spacing/padding per mode
5. Test with ADHD users for feedback

**Effort:** 10-12 hours
**Impact:** Medium (quality of life)

---

## Testing Checklist

### Functional Testing

- [ ] Icon mode: Click dot expands to compact
- [ ] Compact mode: Collapse button returns to icon
- [ ] Card mode: All interactions work (hover, click, drag)
- [ ] Mode persistence: Reloading restores last mode
- [ ] Width persistence: Resizing saves and restores
- [ ] Session timeout: > 4 hours → compact mode
- [ ] Inbox always visible in all modes
- [ ] Activity Bar icons clickable in all modes
- [ ] Context menus work on projects/notes
- [ ] Drag-and-drop reordering works
- [ ] Keyboard navigation (Tab, Enter, Arrow keys)
- [ ] Tooltips appear on hover (500ms delay)
- [ ] Badges update dynamically

### Accessibility Testing

- [ ] Tab order logical and complete
- [ ] All interactive elements focusable
- [ ] Focus indicators visible (2px outline)
- [ ] Screen reader announces all elements
- [ ] ARIA attributes correct (`aria-expanded`, etc.)
- [ ] Keyboard shortcuts work (Cmd+0, etc.)
- [ ] Reduced motion respected
- [ ] Color contrast 4.5:1+ for text
- [ ] Color not sole indicator of state

### ADHD-Specific Testing

- [ ] Icon mode feels minimal (not overwhelming)
- [ ] Compact mode shows just enough info
- [ ] Card mode not too cluttered
- [ ] Inbox easy to find (top position)
- [ ] Quick capture fast (< 2 seconds)
- [ ] Mode switching intuitive (< 3 clicks)
- [ ] Active project obvious (accent + dot)
- [ ] No distracting animations
- [ ] Tooltips helpful (not annoying)
- [ ] Sidebar collapse instant (Escape/Cmd+0)

### Visual Regression Testing

- [ ] Light mode: All elements styled correctly
- [ ] Dark mode: Contrast and colors correct
- [ ] Theme changes apply immediately
- [ ] Sidebar modes render correctly
- [ ] Hover states appear/disappear smoothly
- [ ] Active states highlighted properly
- [ ] Badges positioned correctly
- [ ] Icons aligned and sized consistently
- [ ] Text truncation works (ellipsis)
- [ ] Long project names handled gracefully

---

## Design Tokens

### Sidebar Dimensions

```typescript
export const SIDEBAR = {
  modes: {
    icon: { width: 48, resizable: false },
    compact: { width: 240, min: 200, max: 300 },
    card: { width: 320, min: 320, max: 500 }
  },
  sections: {
    header: 56, // Logo + collapse button
    activityBar: 48, // Bottom toolbar
    itemHeight: 36, // Project row height (compact)
    cardHeight: 120 // Project card height (card mode)
  },
  spacing: {
    padding: { icon: 8, compact: 16, card: 20 },
    gap: { item: 8, section: 16, card: 16 },
    indent: 16 // For nested items (future: folders)
  }
}
```

### Animation Timings

```typescript
export const TRANSITIONS = {
  fast: 100,    // Hover state changes
  normal: 150,  // Most UI transitions
  slow: 250,    // Mode switching (icon ↔ compact)
  easing: {
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
}
```

### Typography Scale

```typescript
export const TYPOGRAPHY = {
  sidebar: {
    sectionHeader: { size: 11, weight: 600, transform: 'uppercase', spacing: 0.5 },
    projectName: { size: 14, weight: 500, lineHeight: 1.4 },
    stats: { size: 12, weight: 400, lineHeight: 1.5 },
    badge: { size: 10, weight: 500 },
    activityLabel: { size: 11, weight: 500 }
  }
}
```

---

## Figma/Design File Specifications

### Component Library Needed

1. **SidebarModes**
   - IconBarMode (48px, vertical)
   - CompactListMode (240px, list view)
   - CardViewMode (320px, card grid)

2. **SidebarSections**
   - InboxSection (collapsible, badge)
   - ProjectsSection (pinned + all)
   - ActivityBar (5 icon slots)

3. **Interactive Elements**
   - ProjectRow (hover, active, expanded states)
   - ProjectCard (hover, active, drag states)
   - ProjectDot (icon mode, 5 colors)
   - NoteItem (compact, hover, active)
   - Badge (count, status, color variants)

4. **Utility Components**
   - CollapseButton (icon ↔ compact)
   - ResizeHandle (drag cursor)
   - Tooltip (4 directions)
   - ContextMenu (portal-based)

---

## Next Steps

### Immediate Actions (This Week)

1. **Review with stakeholder** - Get feedback on icon mode enhancements
2. **Prototype in Figma** - Create high-fidelity mockups for all 3 modes
3. **User testing** - Show to 2-3 ADHD users, observe interactions
4. **Prioritize Phase 1** - Icon mode improvements (highest ROI)

### Short-term (Next Sprint)

1. Implement Phase 1 (Icon mode enhancements)
2. Implement Phase 2 (Inbox pinning)
3. Add unit tests for new interactions
4. Write E2E tests for mode switching
5. Update documentation

### Long-term (Future Sprints)

1. Implement Phase 3 (Activity Bar)
2. Implement Phase 4 (Project pinning)
3. Implement Phase 5 (Visual polish)
4. Conduct ADHD user study (5+ participants)
5. Iterate based on feedback

---

## Appendix: Research & References

### ADHD UX Best Practices

- **Visual Hierarchy:** Use size, color, and spacing to guide attention
- **Minimal Choices:** Default mode works for 80% of use cases
- **Persistent Landmarks:** Key elements always in same position
- **Quick Escapes:** One-key shortcuts to collapse/close
- **Status Visibility:** Badges, dots, and indicators for at-a-glance info

### Inspiration Sources

1. **VS Code Activity Bar** - Icon-based quick access
2. **Obsidian File Tree** - Familiar file navigation
3. **Apple Notes Sidebar** - Clean, minimal project list
4. **Notion Sidebar** - Collapsible sections, drag-and-drop
5. **Arc Browser Tabs** - Vertical, icon-based navigation

### Tools Used

- Figma (wireframes and prototypes)
- Chrome DevTools (accessibility audit)
- Stark Plugin (contrast checking)
- WAVE (screen reader testing)

---

**Document Status:** Ready for review and implementation planning

**Contact:** UX Analysis generated 2026-01-08

**Files Referenced:**
- `/Users/dt/.git-worktrees/scribe/sidebar-v2/src/renderer/src/store/useAppViewStore.ts`
- `/Users/dt/.git-worktrees/scribe/sidebar-v2/src/renderer/src/components/sidebar/MissionSidebar.tsx`
- `/Users/dt/.git-worktrees/scribe/sidebar-v2/docs/UI-IMPROVEMENTS-PROPOSAL.md`
- `/Users/dt/.git-worktrees/scribe/sidebar-v2/docs/planning/BRAINSTORM-RIGHT-SIDEBAR.md`
- `/Users/dt/.git-worktrees/scribe/sidebar-v2/docs/MISSION-CONTROL-LAYOUTS.md`
