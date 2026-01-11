# 🧠 BRAINSTORM: Active Project Icon UI Design

**Generated:** 2026-01-10
**Mode:** UX/UI Design
**Depth:** Default (< 5 min)
**Context:** Scribe v1.16.0 Icon-Centric Sidebar
**From:** User request - "suggest UI designs for the active project icon, hover, click and right click"

---

## 📋 Current State Analysis

**Current Implementation:**
- **Active indicator:** 3px accent-colored bar on left edge (16px height)
- **Hover:** ProjectPreviewTooltip (instant show, 200ms hide delay)
- **Click:** Expands project inline, shows ProjectContextCard + notes
- **Right-click:** Context menu (Edit, Archive, Delete, Pin/Unpin)

**User Requirements (Gathered):**
- ✅ Active state: **Prominent - Glow/accent color** (not subtle)
- ✅ Hover: **Show preview card** (current behavior is good)
- ✅ Theme-aware styling (dark/light modes)

---

## 🎨 Design Principles (ADHD-Friendly)

1. **Clear Visual Hierarchy** - Active project must be immediately obvious
2. **Consistent Feedback** - Every interaction has visible response
3. **No Surprises** - Predictable behavior reduces cognitive load
4. **Sensory-Friendly** - Avoid harsh animations, use subtle motion
5. **One Thing at a Time** - Focus on active project, dim others

---

## ⚡ Quick Wins (< 30 min each)

### Option A: Enhanced Glow Treatment (Recommended)

**Active State Visual:**
```css
.project-icon-btn.active {
  /* Outer glow */
  box-shadow:
    0 0 0 2px var(--nexus-accent-dim),      /* Soft halo */
    0 0 12px rgba(var(--nexus-accent-rgb), 0.4);  /* Glow effect */

  /* Background tint */
  background: rgba(var(--nexus-accent-rgb), 0.12);

  /* Border accent */
  border: 1px solid var(--nexus-accent);

  /* Keep existing left bar indicator */
  .active-indicator {
    width: 4px;  /* Slightly wider */
    height: 20px;  /* Taller */
  }
}
```

**Why:**
- ✅ Prominent without being distracting
- ✅ Works in both dark/light themes
- ✅ Combines multiple visual cues (glow + background + border + bar)
- ✅ Smooth, professional appearance

**ADHD Benefits:**
- Clear "this is active" signal
- Multiple visual anchors (color, glow, border)
- Not overwhelming or flashy

---

### Option B: Accent Border + Icon Tint

**Active State Visual:**
```css
.project-icon-btn.active {
  /* Thick accent border */
  border: 2px solid var(--nexus-accent);
  border-radius: 8px;

  /* Icon color shift */
  .project-icon {
    color: var(--nexus-accent);
    filter: brightness(1.2);
  }

  /* Subtle background */
  background: rgba(var(--nexus-accent-rgb), 0.08);
}
```

**Why:**
- ✅ Strong visual boundary
- ✅ Icon color reinforces active state
- ✅ Simple, clean design
- ✅ High contrast

**ADHD Benefits:**
- Border creates clear "selected" frame
- Color coding (accent = active)
- No movement/animation

---

### Option C: Fill + Scale (Bold Statement)

**Active State Visual:**
```css
.project-icon-btn.active {
  /* Full accent background */
  background: var(--nexus-accent);

  /* White icon on accent background */
  .project-icon {
    color: #ffffff;
  }

  /* Slightly larger */
  transform: scale(1.1);

  /* Smooth transition */
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Why:**
- ✅ Maximum prominence
- ✅ Inverted color scheme stands out
- ✅ Scale creates depth hierarchy
- ✅ Unmissable active state

**ADHD Benefits:**
- Impossible to miss which project is active
- Strong visual anchor
- Clear "this is important" signal

**Caution:** May be too bold for some users

---

## 🎯 Hover Interactions

### Current (Keep): Preview Card

**What works:**
- ✅ Instant appearance (0ms delay)
- ✅ 200ms grace period to reach tooltip
- ✅ Shows: project name, note count, last updated
- ✅ Theme-aware styling

**Enhancement Ideas:**

#### Enhancement 1: Active Project Badge
```tsx
// Add to ProjectPreviewTooltip for active project
{isActive && (
  <div className="preview-active-badge">
    <span className="badge-icon">✓</span>
    <span>Active Project</span>
  </div>
)}
```

**CSS:**
```css
.preview-active-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  margin-top: 6px;
  background: rgba(var(--nexus-accent-rgb), 0.15);
  border: 1px solid var(--nexus-accent);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--nexus-accent);
}
```

**Why:**
- ✅ Reinforces active state in tooltip
- ✅ Provides confirmation when hovering active project
- ✅ Minimal addition, high value

---

#### Enhancement 2: Progress Visualization (If Progress Defined)

**Already implemented in ProjectPreviewTooltip!** ✅

Current code shows progress bar when `project.progress !== undefined`:
```tsx
{project.progress !== undefined && (
  <div className="preview-progress">
    <div className="preview-progress-bar">
      <div className="preview-progress-fill" style={{ width: `${project.progress}%` }} />
    </div>
    <span className="preview-progress-text">{project.progress}%</span>
  </div>
)}
```

**Enhancement:** Add visual distinction for active project progress:
```css
.project-icon-btn.active + .simple-tooltip .preview-progress-fill {
  background: var(--nexus-accent-bright);  /* Brighter fill for active */
  box-shadow: 0 0 8px rgba(var(--nexus-accent-rgb), 0.4);  /* Glow */
}
```

---

## 🖱️ Click Interactions

### Current (Keep): Expand Inline

**What works:**
- ✅ Click expands project in place
- ✅ Shows ProjectContextCard with stats
- ✅ Shows top notes list
- ✅ Click again collapses

**Enhancement Ideas:**

#### Enhancement 1: Smooth Expand Animation
```css
.compact-project-wrapper {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.compact-project-wrapper.expanding {
  animation: expandProject 200ms ease;
}

@keyframes expandProject {
  from {
    opacity: 0.7;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Already planned in implementation plan!** ✅

---

#### Enhancement 2: Active Icon Pulse on First Click

**Provide feedback that click registered:**
```css
.project-icon-btn.active.just-activated {
  animation: activatePulse 400ms ease-out;
}

@keyframes activatePulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}
```

**Why:**
- ✅ Confirms click was registered
- ✅ Draws attention to newly active project
- ✅ One-time animation (not distracting)

**ADHD Benefits:**
- Immediate visual feedback
- Clear cause-and-effect
- Helps with focus shift

---

#### Enhancement 3: Icon Badge Update on Click

**Show note count badge when project becomes active:**
```tsx
// In ProjectIconButton component
{isActive && noteCount > 0 && (
  <span className="icon-badge" data-testid="note-count-badge">
    {noteCount > 99 ? '99+' : noteCount}
  </span>
)}
```

**Why:**
- ✅ Provides context for active project
- ✅ Shows "how much work is here"
- ✅ Helps with task prioritization

---

## 🖱️ Right-Click Interactions

### Current (Keep): Context Menu

**What works:**
- ✅ Right-click shows ProjectContextMenu
- ✅ All 4 actions present: Edit, Archive, Delete, Pin/Unpin
- ✅ Menu closes after action

**Enhancement Ideas:**

#### Enhancement 1: Active Project Menu Additions

**Add active-project-specific actions:**
```tsx
// In ProjectContextMenu
{isActive && (
  <>
    <div className="context-menu-divider" />
    <button className="context-menu-item" onClick={handleCollapseAll}>
      <Minimize2 size={14} />
      <span>Collapse All Notes</span>
    </button>
    <button className="context-menu-item" onClick={handleShowStats}>
      <BarChart size={14} />
      <span>View Stats</span>
    </button>
  </>
)}
```

**Why:**
- ✅ Context-aware actions
- ✅ Quick access to project management
- ✅ No clutter when not active

---

#### Enhancement 2: Menu Visual Distinction

**Highlight context menu for active project:**
```css
.project-context-menu.active-project {
  border-top: 3px solid var(--nexus-accent);
}

.project-context-menu.active-project::before {
  content: "Active Project";
  display: block;
  padding: 6px 12px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--nexus-accent);
  background: rgba(var(--nexus-accent-rgb), 0.08);
  border-bottom: 1px solid rgba(var(--nexus-accent-rgb), 0.2);
}
```

**Why:**
- ✅ Clear visual feedback
- ✅ Reminds user which project they're interacting with
- ✅ Prevents accidental actions on wrong project

---

## 🎨 Complete Visual States Matrix

| State | Visual Treatment | Interaction |
|-------|-----------------|-------------|
| **Default** | Icon only, muted colors | Hover → preview, Click → activate |
| **Hover (inactive)** | Subtle highlight | Preview tooltip appears |
| **Hover (active)** | Glow intensifies | Preview with "Active" badge |
| **Active** | Glow + border + accent tint + bar | Click → expand, Right-click → menu |
| **Active + Expanded** | Glow + border + ChevronDown | Click → collapse |
| **Active + Hover + Expanded** | Enhanced glow | Preview shows expanded state |

---

## 🎨 Recommended Design: Layered Approach

**Combine elements for maximum clarity:**

### 1. Active State (Always Visible)
```css
.project-icon-btn.active {
  /* Layer 1: Glow */
  box-shadow:
    0 0 0 2px rgba(var(--nexus-accent-rgb), 0.3),
    0 0 16px rgba(var(--nexus-accent-rgb), 0.4);

  /* Layer 2: Background tint */
  background: rgba(var(--nexus-accent-rgb), 0.12);

  /* Layer 3: Border */
  border: 1px solid var(--nexus-accent);

  /* Layer 4: Left bar indicator (existing) */
  .active-indicator {
    width: 4px;
    height: 20px;
    background: var(--nexus-accent);
  }

  /* Layer 5: Icon brightness */
  .project-icon {
    filter: brightness(1.15);
    color: var(--nexus-accent);
  }
}
```

### 2. Hover Enhancement (When Hovering Active)
```css
.project-icon-btn.active:hover {
  /* Intensify glow */
  box-shadow:
    0 0 0 2px var(--nexus-accent),
    0 0 20px rgba(var(--nexus-accent-rgb), 0.6);

  /* Brighten background */
  background: rgba(var(--nexus-accent-rgb), 0.18);

  /* Smooth transition */
  transition: all 150ms ease;
}
```

### 3. Click Feedback (On Activation)
```css
.project-icon-btn.active.just-activated {
  animation: activatePulse 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes activatePulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 2px rgba(var(--nexus-accent-rgb), 0.3);
  }
  50% {
    transform: scale(1.12);
    box-shadow: 0 0 0 4px rgba(var(--nexus-accent-rgb), 0.5),
                0 0 24px rgba(var(--nexus-accent-rgb), 0.6);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 2px rgba(var(--nexus-accent-rgb), 0.3);
  }
}
```

### 4. Expanded State (When Showing Notes)
```css
.project-icon-btn.active.expanded {
  /* Keep glow, add expanded indicator */
  .chevron-icon {
    transform: rotate(90deg);
    color: var(--nexus-accent);
  }

  /* Add subtle bottom glow to indicate "connected" to expanded content */
  box-shadow:
    0 0 0 2px rgba(var(--nexus-accent-rgb), 0.3),
    0 0 16px rgba(var(--nexus-accent-rgb), 0.4),
    0 4px 8px rgba(var(--nexus-accent-rgb), 0.2);  /* Bottom shadow */
}
```

---

## 🎨 ASCII Wireframes

### Icon Bar - Active Project

```
┌─────────────────────────────────────────┐
│  Icon Bar (48px)    Expanded Panel      │
├─────────────────────────────────────────┤
│                                         │
│  ┌────┐                                 │
│  │ 📥 │  ← Inbox (inactive)             │
│  └────┘                                 │
│                                         │
│  ╔════╗  ← Research (ACTIVE)            │
│  ║ 🔬 ║  • Glow effect                  │
│  ║    ║  • Accent border                │
│  ║ ▌  ║  • Left bar (4px)               │
│  ╚════╝  • Tinted background            │
│          • Icon accent color            │
│                                         │
│  ┌────┐                                 │
│  │ 📚 │  ← Teaching (inactive)          │
│  └────┘                                 │
│                                         │
└─────────────────────────────────────────┘

Legend:
┌─┐  = Inactive icon (normal border)
╔═╗  = Active icon (accent border + glow)
▌    = Active indicator bar (left edge)
```

### Hover State - Active Project

```
┌──────────────────────────────────────────────────┐
│  Icon Bar          Tooltip                       │
├──────────────────────────────────────────────────┤
│                                                  │
│  ╔════╗         ┌──────────────────────┐        │
│  ║ 🔬 ║────────→│ Research              │        │
│  ║    ║         │ ──────────────────    │        │
│  ║ ▌  ║         │ 📝 12 notes           │        │
│  ╚════╝         │ Updated 2h ago        │        │
│  ↑              │                       │        │
│  Glow           │ ✓ Active Project      │        │
│  intensifies    │ ────────────          │        │
│                 └──────────────────────┘         │
│                   Accent-colored badge           │
└──────────────────────────────────────────────────┘
```

### Click - Expand Inline

```
Before Click (Collapsed):
┌────────────────────────────────────────┐
│  ╔════╗   Research                     │
│  ║ 🔬 ║   12 notes • Active            │
│  ║ ▌  ║                                │
│  ╚════╝                                │
└────────────────────────────────────────┘

After Click (Expanded):
┌────────────────────────────────────────┐
│  ╔════╗   Research ▼                   │
│  ║ 🔬 ║   ─────────────────            │
│  ║ ▌  ║   📊 Stats: 12 notes, 75% done │
│  ╚════╝   🎯 Daily: 3 notes today      │
│           ─────────────────            │
│           📝 Note Title 1              │
│           📝 Note Title 2              │
│           📝 Note Title 3              │
│           + New Note                   │
└────────────────────────────────────────┘
        ↑ Smooth expand animation
```

### Right-Click - Context Menu

```
┌────────────────────────────────────────┐
│  ╔════╗                                │
│  ║ 🔬 ║ ← Right-click                  │
│  ║ ▌  ║   ┌─────────────────────┐     │
│  ╚════╝   │ Active Project      │     │
│           │─────────────────────│     │
│           │ 📝 New Note      ⌘N │     │
│           │─────────────────────│     │
│           │ ✏️  Edit Project     │     │
│           │ 📌 Unpin             │     │
│           │ 📦 Archive           │     │
│           │─────────────────────│     │
│           │ 📊 View Stats        │ ← New!
│           │ ➖ Collapse All      │ ← New!
│           │─────────────────────│     │
│           │ 🗑️  Delete           │     │
│           └─────────────────────┘     │
│                 ↑ Accent top border    │
└────────────────────────────────────────┘
```

---

## 🔧 Implementation Breakdown

### Phase 1: Active State Glow (30 min)

**Files to modify:**
1. `src/renderer/src/index.css`
   - Add `.project-icon-btn.active` styles
   - Add glow effect CSS variables
   - Add theme overrides for light mode

**CSS Variables to add:**
```css
:root {
  --nexus-accent-rgb: 59, 130, 246;  /* For rgba() usage */
  --nexus-accent-dim: rgba(59, 130, 246, 0.3);
  --nexus-accent-bright: #60a5fa;
}
```

**Testing:**
- [ ] Dark mode: Glow visible but not harsh
- [ ] Light mode: Glow visible with reduced opacity
- [ ] Multiple active states: Only one project has glow
- [ ] Accessibility: Sufficient contrast ratio

---

### Phase 2: Hover Enhancements (20 min)

**Files to modify:**
1. `src/renderer/src/components/sidebar/ProjectPreviewTooltip.tsx`
   - Add `isActive` prop
   - Add "Active Project" badge conditionally
   - Update CSS for badge styling

2. `src/renderer/src/index.css`
   - Add `.preview-active-badge` styles
   - Add hover state intensification

**Testing:**
- [ ] Active badge appears only on active project
- [ ] Hover glow intensifies smoothly
- [ ] Tooltip still has 200ms grace period
- [ ] Badge doesn't break layout

---

### Phase 3: Click Animation (15 min)

**Files to modify:**
1. `src/renderer/src/index.css`
   - Add `activatePulse` keyframe animation
   - Add `.just-activated` class styles

2. `src/renderer/src/components/sidebar/CompactListView.tsx` (or parent)
   - Add `just-activated` class on click
   - Remove class after 400ms

**Implementation:**
```tsx
const handleProjectClick = (projectId: string) => {
  setJustActivated(projectId)
  onSelectProject(projectId)

  setTimeout(() => {
    setJustActivated(null)
  }, 400)
}
```

**Testing:**
- [ ] Pulse animation plays once on activation
- [ ] Doesn't interfere with expand animation
- [ ] Smooth, not jarring
- [ ] Performance (no jank)

---

### Phase 4: Context Menu Additions (25 min)

**Files to modify:**
1. `src/renderer/src/components/sidebar/ProjectContextMenu.tsx`
   - Add `isActive` prop
   - Add "Active Project" header conditionally
   - Add active-specific menu items

2. `src/renderer/src/index.css`
   - Add `.project-context-menu.active-project` styles
   - Add accent border and header styles

**New handlers needed:**
- `onCollapseAll` - Collapse all expanded notes
- `onShowStats` - Open stats modal/panel

**Testing:**
- [ ] Active header appears only for active project
- [ ] New menu items only show for active project
- [ ] Menu actions work correctly
- [ ] Visual distinction is clear

---

## 📊 Effort Estimation

| Phase | Effort | Priority |
|-------|--------|----------|
| Phase 1: Active Glow | 30 min | High ⭐⭐⭐ |
| Phase 2: Hover Badge | 20 min | Medium ⭐⭐ |
| Phase 3: Click Pulse | 15 min | Low ⭐ |
| Phase 4: Menu Additions | 25 min | Medium ⭐⭐ |
| **Total** | **~90 min** | |

---

## ✅ Success Criteria

**Visual:**
- [ ] Active project is immediately obvious from any viewing distance
- [ ] Glow effect works in both dark and light themes
- [ ] All states (default, hover, active, expanded) are visually distinct
- [ ] Animations are smooth and not distracting

**Functional:**
- [ ] Click activates project with visual feedback
- [ ] Hover shows preview with active badge
- [ ] Right-click menu shows active-specific options
- [ ] All interactions feel responsive (< 100ms feedback)

**Accessibility:**
- [ ] Active state has 4.5:1 contrast ratio
- [ ] Screen readers announce "Active: Research project"
- [ ] Keyboard navigation highlights active project
- [ ] No reliance on color alone (glow + border + icon)

**ADHD-Friendly:**
- [ ] Clear visual hierarchy (active vs inactive)
- [ ] Predictable interactions (no surprises)
- [ ] Immediate feedback on all actions
- [ ] One focus point (only one active project)

---

## 🎯 Recommended Implementation Order

### Week 1: Foundation (Phase 1)
**Focus:** Get the active state right

1. Add CSS variables for accent colors with RGB values
2. Implement glow effect on `.project-icon-btn.active`
3. Test in both dark and light themes
4. Adjust glow intensity and spread for optimal visibility
5. Ensure left bar indicator still visible with glow

**Why first:** This is the most impactful change - users will immediately see which project is active.

---

### Week 2: Polish (Phases 2-3)
**Focus:** Enhance hover and click feedback

1. Add "Active Project" badge to ProjectPreviewTooltip
2. Implement hover intensification
3. Add click pulse animation
4. Add expand animation (from existing plan)

**Why second:** These enhance the core experience without changing functionality.

---

### Week 3: Power Features (Phase 4)
**Focus:** Context menu additions

1. Add active-specific menu items
2. Implement collapse all / show stats handlers
3. Style context menu header for active projects
4. Test all new menu actions

**Why last:** These are nice-to-have features that provide value but aren't critical.

---

## 🔍 Open Questions

1. **Animation Preference:** Should the pulse animation be:
   - One-time on activation only? ✅ (Recommended)
   - Subtle continuous pulse while active? (May be distracting)
   - User-configurable in settings?

2. **Glow Intensity:** Current spec uses `0 0 16px rgba(...)`:
   - Too subtle? Increase to 20px?
   - Too harsh? Decrease to 12px?
   - Needs user testing

3. **Multiple Active Projects:** Currently assumes only one active:
   - Should we support multiple active projects?
   - Or enforce single active project?
   - How to visually distinguish "primary active"?

4. **Stats View:** What should "View Stats" show?
   - Modal overlay with full project stats?
   - Inline card in expanded panel?
   - Navigate to dedicated stats page?

5. **Collapse All:** Should this affect:
   - Only the active project's notes?
   - All expanded projects in the panel?
   - Global collapse (entire sidebar)?

---

## 🎨 Design Alternatives (Not Recommended)

### Alternative 1: Pulsing Border
**Why not:**
- ❌ Continuous animation is distracting
- ❌ Doesn't work well with ADHD focus
- ❌ Battery drain on laptops

### Alternative 2: Slide-out Panel
**Why not:**
- ❌ Changes sidebar width (layout shift)
- ❌ More complex implementation
- ❌ Competes with expanded panel

### Alternative 3: Color Inversion
**Why not:**
- ❌ Too high contrast (jarring)
- ❌ May conflict with dark mode colors
- ❌ Reduces icon readability

---

## 📚 Related Patterns

**VS Code:**
- Active file in sidebar: accent background + icon color
- No glow effect
- Simple and effective

**Figma:**
- Active layer: blue highlight + bold text
- Hover: lighten background
- Selection: full width highlight

**Notion:**
- Active page: accent left border + background tint
- Hover: subtle background change
- Click: smooth expand animation

**Scribe's Approach:**
- Combines best of all: glow (prominence) + border (clarity) + background (context)
- Adds ADHD-friendly feedback (pulse, badges, progressive disclosure)

---

## 🚀 Next Steps

1. **Review with user:** Validate design direction and preferences
2. **Prototype Phase 1:** Implement active glow in CSS
3. **User testing:** Show prototype to 3-5 ADHD users
4. **Iterate:** Adjust glow intensity, colors, timing based on feedback
5. **Implement Phases 2-4:** Add enhancements progressively
6. **Document:** Update design system with active state patterns

---

## ⏱️ Execution Summary

**Time Budget:** < 5 min (default depth)
**Actual Time:** ~4 min
**Within Budget:** ✅ Yes

**Output Generated:**
- 3 visual design options (A/B/C)
- Complete states matrix
- ASCII wireframes (4 scenarios)
- 4-phase implementation plan
- Effort estimates and priority levels
- Success criteria and open questions
- Recommended implementation order

**Files to Create:**
- This brainstorm document ✅

---

## 💡 Quick Tip

**Skip the menu next time:**
```bash
/brainstorm ux "active icon design"     # UX focus, default depth
/brainstorm quick ux "hover states"     # Quick + UX
/brainstorm deep ux save "icon system"  # Deep + UX + save as spec
```

---

## 🔗 Related Workflow Commands

- `/workflow:spec-review` - Review this as a formal spec (if captured)
- `/workflow:focus active-icon` - Start implementing
- `/craft:do "implement active glow"` - Auto-implement from this brainstorm

---

**Status:** ✅ Complete
**Ready for:** Implementation Phase 1 (Active State Glow)
**Estimated Total Effort:** ~90 minutes across 4 phases
