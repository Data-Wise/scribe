# Brainstorm: Child Project Identification in Smart Icons

**Generated:** 2026-01-09
**Context:** Scribe Mission Sidebar v2 - Smart Icons feature
**Focus:** UX Design (Deep Analysis)
**Duration:** < 10 min

---

## Executive Summary

Improve visual identification of child projects displayed under expanded smart icons by:
1. **Expanding sidebar** to 200px+ when smart icon opens (vs current 48px)
2. **Adding first-letter icons** + project names (vs current status dots only)
3. **Showing rich metadata** (note count, last edited, progress %)
4. **Grouping by status** when 10+ projects (active/paused/complete)
5. **Quick preview on hover** (recent notes, project stats)

**Current Pain Point:** All child projects look identical (just colored status dots) - impossible to distinguish without clicking each one.

---

## User Requirements (From 8-Question Interview)

| Requirement | Decision |
|-------------|----------|
| **Primary ID** | Icon (first letter) + text label |
| **Pain Point** | Can't tell projects apart (all dots look same) |
| **Space** | Expand sidebar to 200px+ when smart icon opens |
| **Scalability** | Group by status (active/paused) for 10+ projects |
| **Icon Style** | First letter of project name ("M", "S", "L") |
| **Expanded Info** | Note count, last edited, progress % |
| **Hierarchy** | Indent children (clear parent-child) |
| **Hover State** | Highlight + quick preview |

---

## Current Implementation (Just Built)

```tsx
// ExpandedChildProjects.tsx - Current (Minimal)
{sortedProjects.map((project) => (
  <button className="child-project-btn">
    <StatusDot status={status} size="sm" />  {/* Just a dot! */}
    {noteCount > 0 && <span className="badge">{noteCount}</span>}
  </button>
))}
```

**CSS (Current):**
```css
.child-project-btn {
  width: 28px;   /* Very constrained */
  height: 28px;
  margin-left: 4px;  /* Slight indent */
}
```

**Problems:**
- ❌ No project name visible
- ❌ No custom icon (all look same)
- ❌ No last edited info
- ❌ No progress indicator
- ❌ No status grouping
- ❌ 28px width can't show any detail

---

## Quick Wins (< 1 hour each)

### 1. ⚡ Expand Sidebar Width on Smart Icon Open

**What:** When smart icon expands, animate sidebar from 48px → 200px

**Why:** Creates space for project names + metadata

**How:**
```tsx
// IconBarMode.tsx
const sidebarWidth = expandedSmartIconId ? 200 : 48

<div className="mission-sidebar-icon" style={{ width: sidebarWidth }}>
  {/* Smart icons */}
</div>
```

**CSS:**
```css
.mission-sidebar-icon {
  width: 48px;
  transition: width 200ms ease-out;
}

.mission-sidebar-icon.expanded {
  width: 200px;
}
```

**Benefit:** Immediate visual breathing room for child projects

**Time:** 20 min

---

### 2. ⚡ Add First-Letter Icon Component

**What:** Create `<FirstLetterIcon letter="M" color="#8B5CF6" />` component

**Why:** Visual distinction between projects (better than all dots)

**How:**
```tsx
// components/sidebar/FirstLetterIcon.tsx
export function FirstLetterIcon({ letter, color, size = 'md' }: Props) {
  return (
    <div
      className={`first-letter-icon ${size}`}
      style={{ backgroundColor: color }}
    >
      {letter.toUpperCase()}
    </div>
  )
}
```

**CSS:**
```css
.first-letter-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 13px;
  color: #fff;
}

.first-letter-icon.sm {
  width: 20px;
  height: 20px;
  font-size: 11px;
}
```

**Benefit:** Instant visual recognition (M vs S vs L)

**Time:** 30 min

---

### 3. ⚡ Show Project Name (Truncated)

**What:** Display project name next to first-letter icon

**How:**
```tsx
// ExpandedChildProjects.tsx
<button className="child-project-btn">
  <FirstLetterIcon letter={project.name[0]} color={project.color} />
  <span className="project-name">{truncate(project.name, 18)}</span>
  {noteCount > 0 && <span className="note-count">{noteCount}</span>}
</button>
```

**CSS:**
```css
.child-project-btn {
  width: 180px;  /* Expanded from 28px */
  height: 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  text-align: left;
}

.project-name {
  flex: 1;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-count {
  font-size: 11px;
  color: var(--text-secondary);
}
```

**Benefit:** Clear project identification without hover

**Time:** 15 min

---

### 4. ⚡ Add Metadata Row (Note Count, Last Edited)

**What:** Show `12 notes • 2h ago` below project name

**How:**
```tsx
<button className="child-project-btn">
  <FirstLetterIcon letter={project.name[0]} color={project.color} />
  <div className="project-info">
    <span className="project-name">{truncate(project.name, 16)}</span>
    <span className="project-meta">
      {noteCount} {noteCount === 1 ? 'note' : 'notes'} • {formatRelativeTime(project.updated_at)}
    </span>
  </div>
  {project.progress && (
    <ProgressRing percent={project.progress} size={20} />
  )}
</button>
```

**CSS:**
```css
.child-project-btn {
  height: 44px;  /* Taller for 2 lines */
}

.project-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.project-meta {
  font-size: 11px;
  color: var(--text-tertiary);
}
```

**Benefit:** Rich context at a glance (recency + size)

**Time:** 25 min

---

## Medium Effort (2-4 hours each)

### 5. 🔧 Status Grouping (10+ Projects)

**What:** When smart icon has 10+ children, group by status

**Why:** Reduces cognitive load, shows structure

**Design:**
```
📖 Research (12)              [×]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━
  ACTIVE (8)                  ▼
    M  Mediation Analysis
       12 notes • today
    S  Sensitivity Study
       8 notes • 2h ago
    ...

  PAUSED (3)                  ▶
  COMPLETE (1)                ▶
```

**Implementation:**
```tsx
// ExpandedChildProjects.tsx
const groupedProjects = useMemo(() => {
  if (projects.length < 10) return { ungrouped: projects }

  return {
    active: projects.filter(p => p.status === 'active'),
    paused: projects.filter(p => p.status === 'paused'),
    complete: projects.filter(p => p.status === 'complete')
  }
}, [projects])

return (
  <div className="expanded-child-projects">
    {projects.length >= 10 ? (
      <>
        <StatusGroup
          label="ACTIVE"
          count={groupedProjects.active.length}
          projects={groupedProjects.active}
          defaultExpanded={true}
        />
        <StatusGroup
          label="PAUSED"
          count={groupedProjects.paused.length}
          projects={groupedProjects.paused}
        />
        {/* ... */}
      </>
    ) : (
      projects.map(project => <ChildProjectCard {...project} />)
    )}
  </div>
)
```

**Benefit:** Organized, scannable list even with 20+ projects

**Time:** 3h (component + logic + styling)

---

### 6. 🔧 Quick Preview on Hover

**What:** Hovering a child project shows tooltip with recent notes

**Design:**
```
┌──────────────────────────────────┐
│ Mediation Analysis               │
│ ────────────────────────────────│
│ Status: Active • 60% complete    │
│ 12 notes • 4,200 words           │
│                                  │
│ Recent notes:                    │
│ • Week 3 Results (today)         │
│ • Literature Review (2d ago)     │
│ • Hypothesis Testing (1w ago)    │
│                                  │
│ Click to open                    │
└──────────────────────────────────┘
```

**Implementation:**
```tsx
// ChildProjectCard.tsx
const [hoverData, setHoverData] = useState<HoverData | null>(null)

const handleMouseEnter = async () => {
  const recentNotes = await api.getProjectNotes(project.id)
    .then(notes => notes.slice(0, 3))

  setHoverData({
    recentNotes,
    totalWords: notes.reduce((sum, n) => sum + (n.word_count || 0), 0)
  })
}

return (
  <Tooltip
    content={<QuickPreview project={project} hoverData={hoverData} />}
    delay={500}
  >
    <button onMouseEnter={handleMouseEnter}>
      {/* Project card */}
    </button>
  </Tooltip>
)
```

**Benefit:** Preview without clicking (faster workflow)

**Time:** 2.5h (tooltip component + data fetching + design)

---

### 7. 🔧 Smooth Expand/Collapse Animation

**What:** Animate sidebar width + child project stagger

**Design:**
- Sidebar: 48px → 200px in 200ms ease-out
- Child projects: Fade in with 30ms stagger
- Status groups: Expand/collapse with height animation

**Implementation:**
```css
/* Sidebar expansion */
.mission-sidebar-icon {
  width: 48px;
  transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.mission-sidebar-icon.expanded {
  width: 200px;
}

/* Child project stagger */
.child-project-btn {
  opacity: 0;
  transform: translateX(-8px);
  animation: slideIn 150ms ease-out forwards;
}

.child-project-btn:nth-child(1) { animation-delay: 0ms; }
.child-project-btn:nth-child(2) { animation-delay: 30ms; }
.child-project-btn:nth-child(3) { animation-delay: 60ms; }
/* ... */

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Status group expand */
.status-group-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 200ms ease-out;
}

.status-group.expanded .status-group-content {
  max-height: 500px;
}
```

**Benefit:** Polished, professional feel (not jarring)

**Time:** 1.5h (CSS + testing)

---

### 8. 🔧 Keyboard Navigation for Child Projects

**What:** Arrow keys navigate through child projects

**Design:**
- ↓ / ↑: Navigate between child projects
- Enter: Open selected project
- Esc: Collapse smart icon
- Tab: Move to next smart icon

**Implementation:**
```tsx
// ExpandedChildProjects.tsx
const [focusedIndex, setFocusedIndex] = useState(0)

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isExpanded) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(i => Math.min(i + 1, projects.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(i => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        onSelectProject(projects[focusedIndex].id)
        break
      case 'Escape':
        e.preventDefault()
        onCollapse()
        break
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [isExpanded, focusedIndex, projects])

return (
  <>
    {projects.map((project, index) => (
      <ChildProjectCard
        {...project}
        isFocused={index === focusedIndex}
        onClick={() => onSelectProject(project.id)}
      />
    ))}
  </>
)
```

**Benefit:** Power users navigate without mouse

**Time:** 2h (keyboard handling + focus management)

---

## Long-term Enhancements (Future Sprints)

### 9. 📋 Search/Filter Within Children

**What:** When 20+ child projects, add mini-search box

**Design:**
```
📖 Research (24)              [×]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━
  [🔍 Search projects...]

  M  Mediation Analysis
     12 notes • today
  S  Sensitivity Study
     8 notes • 2h ago
```

**Implementation:** Fuzzy search with Fuse.js, filter as user types

**Benefit:** Fast access even with 50+ projects

**Complexity:** 4h

---

### 10. 📋 Custom Icons (Beyond First Letter)

**What:** Allow users to set custom emoji per project

**Design:** Right-click project → "Set Icon" → Emoji picker

**Benefit:** More visual variety (🧬 for bio project, 📊 for stats)

**Complexity:** 6h (emoji picker + persistence)

---

### 11. 📋 Progress Ring Visualization

**What:** Show circular progress ring for projects with progress %

**Design:**
```
┌────────────────────────────┐
│ ┌──┐                       │
│ │ M│ Mediation Analysis    │
│ └──┘ 12 notes • 2h ago  60%│  ← Ring at 60%
└────────────────────────────┘
```

**Implementation:** SVG circle with `stroke-dasharray` animation

**Benefit:** Instant visual of project completion

**Complexity:** 3h

---

### 12. 📋 Drag-to-Reorder Child Projects

**What:** Manually reorder child projects within smart icon

**Design:** Drag handle appears on hover

**Benefit:** Custom sorting (beyond alphabetical)

**Complexity:** 5h (drag-drop + persistence)

---

## Recommended Implementation Path

### Phase 1: Foundation (2h - Quick Wins 1-4)

**Goal:** Make child projects identifiable

**Tasks:**
1. Expand sidebar width on smart icon open (20 min)
2. Create FirstLetterIcon component (30 min)
3. Show project name (truncated) (15 min)
4. Add metadata row (note count, last edited) (25 min)
5. CSS polish + responsive (30 min)

**Outcome:** Child projects now show `[M] Mediation • 12 notes • 2h ago`

---

### Phase 2: Rich Interactions (6h - Medium Effort 5-8)

**Goal:** Scalability + smooth UX

**Tasks:**
1. Status grouping for 10+ projects (3h)
2. Quick preview on hover (2.5h)
3. Smooth expand/collapse animations (1.5h)
4. Keyboard navigation (2h)
5. Testing + edge cases (2h)

**Outcome:** Polished, professional child project display

---

### Phase 3: Advanced Features (18h - Long-term 9-12)

**Goal:** Power user features

**Tasks:**
1. Mini-search for 20+ projects (4h)
2. Custom emoji icons (6h)
3. Progress ring visualization (3h)
4. Drag-to-reorder (5h)

**Outcome:** Feature-complete child project management

---

## Wireframes (ASCII)

### Current State (48px sidebar, status dots only)

```
┌────┐
│ ≡  │  Menu
├────┤
│ 📥 │  Inbox
├────┤
│ 📖 │  Research (expanded)
│ ├──┤
│ │🔵│  ← Active project (just a dot!)
│ │⚪│  ← Paused project (just a dot!)
│ │⚪│  ← Paused project (just a dot!)
│ └──┘
└────┘

Problem: Can't tell projects apart!
```

---

### Proposed: Phase 1 (200px sidebar, icon + name + metadata)

```
┌──────────────────────────────┐
│  ≡ Scribe            [◀]     │  Menu
├──────────────────────────────┤
│ 📥 INBOX (3)                 │  Inbox
├──────────────────────────────┤
│ 📖 Research (3)       [×]    │  Smart icon (expanded)
│  ━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  ┌──┐                        │
│  │ M│ Mediation Analysis     │  ← First letter icon
│  └──┘ 12 notes • today    ●  │  ← Name + metadata + active
│                               │
│  ┌──┐                        │
│  │ S│ Sensitivity Study      │
│  └──┘ 8 notes • 2h ago       │
│                               │
│  ┌──┐                        │
│  │ L│ Literature Review      │
│  └──┘ 24 notes • 1w ago      │
│                               │
├──────────────────────────────┤
│ 🎓 Teaching           [>]    │  Other smart icons (collapsed)
│ 📦 R pkg              [>]    │
│ ⚙️ Dev tools          [>]    │
└──────────────────────────────┘

✅ Can now identify projects!
✅ Rich metadata visible
✅ First-letter icons for distinction
```

---

### Proposed: Phase 2 (Status groups + hover preview)

```
┌──────────────────────────────────┐
│  ≡ Scribe                [◀]     │
├──────────────────────────────────┤
│ 📖 Research (12)          [×]    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  ACTIVE (8)               ▼      │  ← Status group (expanded)
│                                  │
│  ┌──┐                            │
│  │ M│ Mediation Analysis      ●  │ ← Hovering shows tooltip →
│  └──┘ 12 notes • today           │
│                                  │
│  ┌──┐                            │
│  │ S│ Sensitivity Study          │
│  └──┘ 8 notes • 2h ago           │
│                                  │
│  PAUSED (3)               ▶      │  ← Status group (collapsed)
│  COMPLETE (1)             ▶      │
│                                  │
├──────────────────────────────────┤

┌──────────────────────────────┐
│ Mediation Analysis           │  ← Hover tooltip (rich preview)
│ ────────────────────────────│
│ Status: Active • 60% complete│
│ 12 notes • 4,200 words       │
│                              │
│ Recent notes:                │
│ • Week 3 Results (today)     │
│ • Literature Review (2d ago) │
│ • Hypothesis Testing (1w ago)│
│                              │
│ Click to open                │
└──────────────────────────────┘
```

---

## Component Architecture

```
IconBarMode
├── InboxButton
├── SmartIconButton (4x)
│   └── ExpandedChildProjects ⭐ NEW DESIGN
│       ├── SearchBox (if 20+ projects)
│       ├── StatusGroup (if 10+ projects)
│       │   ├── GroupHeader
│       │   └── ChildProjectCard[] (grouped)
│       └── ChildProjectCard[] (ungrouped)
│           ├── FirstLetterIcon ⭐ NEW
│           ├── ProjectInfo
│           │   ├── ProjectName
│           │   └── ProjectMeta (notes, time, progress)
│           └── ProgressRing (if project.progress)
└── ActivityBar

QuickPreviewTooltip ⭐ NEW
├── ProjectHeader (name, status, progress)
├── ProjectStats (notes, words, last edited)
├── RecentNotesList (3 most recent)
└── ActionHint ("Click to open")
```

---

## CSS Architecture

```css
/* Child Project Card - Expanded State */
.child-project-btn {
  width: 180px;      /* Expanded from 28px */
  height: 44px;      /* Taller for 2 lines of text */
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  margin-left: 8px;  /* Indent from smart icon */
  border-radius: 6px;
  cursor: pointer;
  background: transparent;
  transition: background 150ms ease;
}

.child-project-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.child-project-btn.active {
  background: rgba(255, 255, 255, 0.08);
}

.child-project-btn.focused {
  outline: 2px solid var(--accent-color);
  outline-offset: -2px;
}

/* First Letter Icon */
.first-letter-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 13px;
  color: #fff;
  background: var(--project-color);  /* Per-project color */
  flex-shrink: 0;
}

/* Project Info (2-line layout) */
.project-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;  /* Allow text truncation */
}

.project-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-meta {
  font-size: 11px;
  color: var(--text-tertiary);
  white-space: nowrap;
}

/* Status Groups */
.status-group {
  margin-bottom: 8px;
}

.status-group-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  cursor: pointer;
  user-select: none;
}

.status-group-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 200ms ease-out;
}

.status-group.expanded .status-group-content {
  max-height: 500px;  /* Enough for 10 projects */
}

/* Progress Ring */
.progress-ring {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Quick Preview Tooltip */
.quick-preview-tooltip {
  width: 280px;
  padding: 12px;
  background: var(--tooltip-bg);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.quick-preview-tooltip .project-header {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
}

.quick-preview-tooltip .project-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.quick-preview-tooltip .recent-notes-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.quick-preview-tooltip .recent-note-item {
  font-size: 12px;
  color: var(--text-tertiary);
  display: flex;
  justify-content: space-between;
}

/* Sidebar Width Animation */
.mission-sidebar-icon {
  width: 48px;
  transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.mission-sidebar-icon.has-expanded-smart-icon {
  width: 200px;
}

/* Child Project Stagger Animation */
@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.child-project-btn {
  animation: slideInFromLeft 150ms ease-out forwards;
}

.child-project-btn:nth-child(1) { animation-delay: 0ms; }
.child-project-btn:nth-child(2) { animation-delay: 30ms; }
.child-project-btn:nth-child(3) { animation-delay: 60ms; }
.child-project-btn:nth-child(4) { animation-delay: 90ms; }
.child-project-btn:nth-child(5) { animation-delay: 120ms; }
/* ... */
```

---

## Accessibility Checklist

### ARIA Labels

```tsx
<button
  className="child-project-btn"
  aria-label={`${project.name}, ${noteCount} notes, last edited ${formatRelativeTime(project.updated_at)}`}
  aria-current={isActive ? 'page' : undefined}
  role="button"
>
  {/* ... */}
</button>

<div className="status-group" role="group" aria-labelledby="active-group">
  <button
    className="status-group-header"
    id="active-group"
    aria-expanded={isExpanded}
    aria-controls="active-group-content"
  >
    ACTIVE ({count})
  </button>
  <div
    id="active-group-content"
    className="status-group-content"
    role="list"
  >
    {projects.map(p => (
      <div role="listitem">
        <ChildProjectCard {...p} />
      </div>
    ))}
  </div>
</div>
```

### Keyboard Navigation

| Key | Action | ARIA |
|-----|--------|------|
| Tab | Focus next child project | `tabindex="0"` |
| ↓ / ↑ | Navigate between children | `aria-activedescendant` |
| Enter | Open focused project | - |
| Space | Toggle status group | `aria-expanded` |
| Esc | Collapse smart icon | - |

### Screen Reader Announcements

```tsx
// When smart icon expands
announceToScreenReader(`Research projects expanded, ${count} items`)

// When navigating children
announceToScreenReader(`Mediation Analysis, 12 notes, last edited today, active`)

// When status group expands
announceToScreenReader(`Active projects expanded, 8 items`)
```

### Color Contrast

| Element | Foreground | Background | Ratio | WCAG |
|---------|-----------|-----------|-------|------|
| Project name | #E2E8F0 | #1E293B | 12.6:1 | AAA |
| Project meta | #94A3B8 | #1E293B | 6.1:1 | AA |
| First letter icon | #FFFFFF | (project color) | 4.5:1+ | AA |
| Status group header | #CBD5E1 | #1E293B | 9.8:1 | AAA |

### Focus Indicators

```css
.child-project-btn:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: -2px;
  border-radius: 6px;
}
```

---

## Edge Cases

### 1. Projects with Same First Letter

**Problem:** "Mediation" and "Meta-analysis" both start with "M"

**Solution:** Add letter index as subscript

```
┌──┐
│M₁│ Mediation Analysis
└──┘

┌──┐
│M₂│ Meta-analysis Study
└──┘
```

**Implementation:**
```tsx
const letterCounts = projects.reduce((acc, p) => {
  const letter = p.name[0].toUpperCase()
  acc[letter] = (acc[letter] || 0) + 1
  return acc
}, {})

const getLetterIndex = (project, allProjects) => {
  const letter = project.name[0].toUpperCase()
  if (letterCounts[letter] === 1) return null

  const sameLetterProjects = allProjects
    .filter(p => p.name[0].toUpperCase() === letter)
    .sort((a, b) => a.name.localeCompare(b.name))

  return sameLetterProjects.indexOf(project) + 1
}
```

---

### 2. Very Long Project Names

**Problem:** "Advanced Statistical Mediation Analysis with Sensitivity Testing" truncates badly

**Solution:** Smart truncation at word boundaries

```tsx
function truncateProjectName(name: string, maxChars: number): string {
  if (name.length <= maxChars) return name

  // Find last space before maxChars
  const truncated = name.slice(0, maxChars)
  const lastSpace = truncated.lastIndexOf(' ')

  return lastSpace > maxChars * 0.6
    ? truncated.slice(0, lastSpace) + '…'
    : truncated.slice(0, maxChars - 1) + '…'
}

// Input: "Advanced Statistical Mediation Analysis"
// Output: "Advanced Statistical…"
```

---

### 3. Empty Status Groups

**Problem:** No paused projects, group header looks empty

**Solution:** Show count + hide if zero

```tsx
{groupedProjects.paused.length > 0 && (
  <StatusGroup
    label="PAUSED"
    count={groupedProjects.paused.length}
    projects={groupedProjects.paused}
  />
)}
```

---

### 4. Loading State (Fetching Hover Preview)

**Problem:** Hover preview data takes 200ms to fetch

**Solution:** Show skeleton while loading

```tsx
{hoverData ? (
  <QuickPreview project={project} data={hoverData} />
) : (
  <div className="quick-preview-skeleton">
    <div className="skeleton-line" />
    <div className="skeleton-line short" />
    <div className="skeleton-line medium" />
  </div>
)}
```

---

### 5. No Projects in Smart Icon

**Problem:** Smart icon has 0 projects (empty state)

**Current behavior:** Shows "No projects yet. [Create]"

**Keep this!** Already implemented in our ExpandedChildProjects component

---

## Performance Considerations

### 1. Virtualization for 50+ Child Projects

**When to use:** If a smart icon has 50+ child projects

**Library:** `react-window` or `react-virtual`

```tsx
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={400}
  itemCount={projects.length}
  itemSize={44}  // Height of each child project card
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <ChildProjectCard {...projects[index]} />
    </div>
  )}
</FixedSizeList>
```

**Benefit:** Render only visible items, smooth with 200+ projects

---

### 2. Debounce Hover Preview Fetch

**Problem:** Rapid mouse movement triggers many API calls

**Solution:** Debounce fetch by 500ms

```tsx
const debouncedFetchPreview = useMemo(
  () => debounce(async (projectId: string) => {
    const preview = await fetchQuickPreview(projectId)
    setHoverData(preview)
  }, 500),
  []
)

const handleMouseEnter = () => {
  debouncedFetchPreview(project.id)
}

const handleMouseLeave = () => {
  debouncedFetchPreview.cancel()
  setHoverData(null)
}
```

---

### 3. Memoize Project Filtering

**Problem:** Re-filtering 100 projects on every render

**Solution:** useMemo with stable dependencies

```tsx
const filteredProjects = useMemo(() => {
  return projects
    .filter(p => p.type === smartIcon.projectType)
    .sort((a, b) => a.name.localeCompare(b.name))
}, [projects, smartIcon.projectType])
```

---

## Success Metrics

### Quantitative

| Metric | Current | Target | How to Measure |
|--------|---------|--------|----------------|
| **Time to identify project** | 3-5s (must hover/click) | < 1s | User testing |
| **Clicks to open project** | 2 (expand + click dot) | 1 (click card) | Analytics |
| **Child projects visible** | 1 at a time | 5-10 at once | UI measurement |
| **Metadata visible** | 0 (just dot) | 3 fields | Feature count |

### Qualitative

| Question | Expected Response |
|----------|------------------|
| "Can you distinguish between child projects?" | "Yes, I can see names and recent activity" |
| "How does the expanded view feel?" | "Much more informative than before" |
| "Does the sidebar expansion feel smooth?" | "Yes, 200ms animation is fast" |
| "Can you find a specific project quickly?" | "Yes, alphabetical + status grouping helps" |

---

## Testing Strategy

### Unit Tests (20 tests)

```typescript
// FirstLetterIcon.test.tsx
describe('FirstLetterIcon', () => {
  it('renders first letter uppercase', () => {
    render(<FirstLetterIcon letter="m" color="#8B5CF6" />)
    expect(screen.getByText('M')).toBeInTheDocument()
  })

  it('applies background color', () => {
    const { container } = render(<FirstLetterIcon letter="M" color="#8B5CF6" />)
    expect(container.firstChild).toHaveStyle({ backgroundColor: '#8B5CF6' })
  })
})

// ExpandedChildProjects.test.tsx
describe('ExpandedChildProjects', () => {
  it('shows all projects when < 10', () => {
    const projects = createMockProjects(5)
    render(<ExpandedChildProjects projects={projects} />)
    expect(screen.getAllByRole('button')).toHaveLength(5)
  })

  it('groups by status when >= 10', () => {
    const projects = createMockProjects(12)
    render(<ExpandedChildProjects projects={projects} />)
    expect(screen.getByText(/ACTIVE/)).toBeInTheDocument()
    expect(screen.getByText(/PAUSED/)).toBeInTheDocument()
  })

  it('truncates long project names', () => {
    const projects = [{ name: 'Advanced Statistical Mediation Analysis', ... }]
    render(<ExpandedChildProjects projects={projects} />)
    expect(screen.getByText(/Advanced Statistical…/)).toBeInTheDocument()
  })
})

// QuickPreviewTooltip.test.tsx
describe('QuickPreviewTooltip', () => {
  it('shows project stats', async () => {
    render(<QuickPreviewTooltip project={mockProject} />)
    await waitFor(() => {
      expect(screen.getByText('12 notes')).toBeInTheDocument()
      expect(screen.getByText('4,200 words')).toBeInTheDocument()
    })
  })

  it('shows recent notes', async () => {
    render(<QuickPreviewTooltip project={mockProject} />)
    await waitFor(() => {
      expect(screen.getByText('Week 3 Results')).toBeInTheDocument()
    })
  })
})
```

### E2E Tests (8 tests)

```typescript
// child-project-identification.spec.ts
describe('Child Project Identification', () => {
  it('expands sidebar when smart icon opens', async () => {
    await page.click('[data-testid="smart-icon-research"]')

    const sidebar = await page.$('.mission-sidebar-icon')
    const width = await sidebar.evaluate(el => el.offsetWidth)
    expect(width).toBe(200)  // Expanded from 48px
  })

  it('shows project names and metadata', async () => {
    await page.click('[data-testid="smart-icon-research"]')

    expect(await page.textContent('.project-name')).toContain('Mediation')
    expect(await page.textContent('.project-meta')).toMatch(/\d+ notes • \d+h? ago/)
  })

  it('navigates with keyboard', async () => {
    await page.click('[data-testid="smart-icon-research"]')
    await page.keyboard.press('ArrowDown')

    const focused = await page.$('.child-project-btn:focus-visible')
    expect(focused).toBeTruthy()
  })

  it('shows quick preview on hover', async () => {
    await page.click('[data-testid="smart-icon-research"]')
    await page.hover('.child-project-btn:first-child')

    await page.waitForSelector('.quick-preview-tooltip', { timeout: 1000 })
    expect(await page.textContent('.quick-preview-tooltip')).toContain('Recent notes')
  })
})
```

---

## Trade-offs Analysis

### Sidebar Width: Fixed 48px vs Dynamic 200px

| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| **Keep 48px** | Consistent width, more screen space | Can't show project names | ❌ Rejected |
| **Always 200px** | Always readable, no animation | Wastes space when collapsed | ❌ Rejected |
| **Dynamic 48→200** | Best of both worlds | Animation complexity | ✅ **Selected** |

**Rationale:** User explicitly requested expanding sidebar, animation is smooth at 200ms

---

### Icon Style: Emoji vs First Letter vs Status Color

| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| **Custom emoji** | Most visual variety | User must set manually | Phase 3 |
| **First letter** | Auto-generated, clear | Duplicates if same letter | ✅ **Phase 1** |
| **Status color** | Shows project state | Doesn't distinguish projects | Current (inadequate) |

**Rationale:** First letter is best balance of auto + visual distinction

---

### Grouping: Always vs 10+ Projects

| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| **Always group** | Consistent UI | Overkill for 3 projects | ❌ Rejected |
| **Never group** | Simpler code | Overwhelming with 20+ | ❌ Rejected |
| **Group if 10+** | Scales gracefully | Slight complexity | ✅ **Selected** |

**Rationale:** User requested grouping "when 10+ projects", honors their requirement

---

## Open Questions

1. **Should collapsed state show "3" badge or just remain icon-only?**
   - Option A: Show badge count on collapsed smart icon ✅
   - Option B: Keep clean (no badge until expanded)

   **Recommendation:** Show badge (helpful at-a-glance info)

2. **Should projects within a status group be alphabetical or by last edited?**
   - Option A: Alphabetical (consistent, scannable)
   - Option B: Last edited (shows activity)

   **Recommendation:** Alphabetical default, add sort toggle in Phase 3

3. **Should first-letter icons use project color or smart icon color?**
   - Option A: Project color (if set by user)
   - Option B: Inherit smart icon color (purple for Research, etc.)

   **Recommendation:** Smart icon color (more cohesive)

4. **Should hover preview fetch data immediately or wait 500ms?**
   - Option A: Immediate (faster perceived)
   - Option B: Debounced 500ms (fewer API calls)

   **Recommendation:** Debounce 500ms (better performance)

---

## Related Features

### 1. Smart Icon Settings (Future)

**What:** Per-smart-icon settings in Settings panel

**Options:**
- Show/hide individual smart icons
- Customize smart icon order
- Set default expanded state
- Choose sort order for children (alphabetical vs last edited)

**Complexity:** 4h

---

### 2. Project Quick Actions (Future)

**What:** Right-click child project → context menu

**Actions:**
- Pin to sidebar (promote to pinned vault)
- Move to different smart icon (change project type)
- Archive project
- Set custom icon

**Complexity:** 3h

---

### 3. Bulk Selection (Future)

**What:** Checkbox mode to select multiple child projects

**Actions:**
- Archive selected (bulk)
- Move to different smart icon (bulk)
- Export selected

**Complexity:** 6h

---

## Next Steps

1. **Review this brainstorm** with stakeholders ✅
2. **Approve Phase 1 implementation** (2h Quick Wins)
3. **UX agent feedback** (wait for expert analysis) ← In progress
4. **Begin development** with FirstLetterIcon component
5. **Test with real projects** (regression check existing smart icons)

---

## Files to Create/Modify

### New Files

```
src/renderer/src/components/sidebar/
├── FirstLetterIcon.tsx          ← NEW (Phase 1)
├── QuickPreviewTooltip.tsx      ← NEW (Phase 2)
├── StatusGroup.tsx              ← NEW (Phase 2)
└── ProgressRing.tsx             ← NEW (Phase 3)
```

### Modified Files

```
src/renderer/src/components/sidebar/
├── ExpandedChildProjects.tsx    ← MAJOR UPDATE (all phases)
├── IconBarMode.tsx              ← Update sidebar width logic
└── SmartIconButton.tsx          ← Pass expanded state

src/renderer/src/index.css       ← Add new styles

src/renderer/src/types/index.ts  ← Add QuickPreviewData type
```

---

## Time Estimates

| Phase | Tasks | Duration | Cumulative |
|-------|-------|----------|------------|
| **Phase 1: Foundation** | Quick wins 1-4 + CSS | 2h | 2h |
| **Phase 2: Rich UX** | Medium effort 5-8 | 9h | 11h |
| **Phase 3: Advanced** | Long-term 9-12 | 18h | 29h |

**Phase 1 MVP:** 2 hours ← Recommended starting point

---

## Conclusion

The proposed design addresses the core pain point ("can't tell projects apart") with:

1. **Visual distinction:** First-letter icons + project names
2. **Rich context:** Note count, last edited, progress %
3. **Scalability:** Status grouping for 10+ projects
4. **Smooth UX:** 200ms sidebar expansion, staggered animations
5. **Accessibility:** Full ARIA labels, keyboard navigation

**Phase 1 (2h) delivers immediate value:** Icon + name + metadata = 80% of the benefit

**Phase 2 (9h) adds polish:** Status groups, hover previews, animations

**Phase 3 (18h) is optional:** Search, custom icons, progress rings

---

**Recommendation:** Start with Phase 1 (2h) to validate approach, then reassess before Phase 2.

**Next:** Wait for UX expert agent analysis, then synthesize comprehensive plan.
