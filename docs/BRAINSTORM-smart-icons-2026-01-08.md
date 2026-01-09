# Smart Icons Brainstorm - Permanent Type-Based Folders

**Generated:** 2026-01-08
**Mode:** max (deep + agents)
**Focus:** Feature + UX
**Context:** Scribe v1.14.0, Left Sidebar Redesign (Phase 3 complete)

---

## 📋 Executive Summary

Add 4 permanent "smart icons" to the left sidebar that act as intelligent project type filters - similar to how Inbox is a permanent fixture. These icons (Research 📖, Teaching 🎓, R pkg 📦, Dev tools ⚙️) sit below Inbox and expand in-place to show child projects of that type.

**Key Design Decisions (from 8 questions):**
- ✅ **Behavior**: Hybrid (auto-suggest by type, user confirms)
- ✅ **Position**: Below Inbox, above pinned projects
- ✅ **Expansion**: Click to show indented child projects (accordion mode)
- ✅ **Visual**: Distinct icons + color scheme (no badges)
- ✅ **Shortcuts**: ⌘⇧1-4 to jump to each type
- ✅ **Persistence**: Remember expansion state across sessions
- ✅ **Customization**: Show/hide toggles in Settings

---

## 🎯 User Stories

### Primary User Story
> **As an academic researcher using Scribe,**
> I want to quickly access all my research projects without manually pinning each one,
> So that I can jump between research notes while keeping my sidebar uncluttered.

**Acceptance Criteria:**
- [ ] Click Research icon → expands to show all research-type projects
- [ ] Child projects display indented below smart icon
- [ ] Expanding one smart icon collapses others (accordion)
- [ ] Keyboard shortcut ⌘⇧1 jumps to Research
- [ ] Expansion state persists across browser refresh

### Secondary User Stories

**Teaching Workflow:**
> **As a statistics professor,**
> I want a dedicated Teaching icon that shows all my course projects,
> So that I can quickly switch between STAT 440, STAT 579, etc.

**R Package Development:**
> **As an R package maintainer,**
> I want to group all my mediationverse packages under one icon,
> So that I don't need to manually pin 6+ packages individually.

**Dev Tools Organization:**
> **As a developer maintaining multiple tools,**
> I want a Dev tools icon for Scribe, flow-cli, MCP servers, etc.,
> So that my workflow tools are one click away.

---

## 🏗️ Architecture Overview

### Visual Hierarchy (Icon Mode - 48px)

```
┌────┐
│ ☰  │  ← Expand button
├────┤
│ 📥 │  ← INBOX (amber, permanent) [Level 1: CRITICAL]
├────┤  ← NEW DIVIDER
│ 📖 │  ← Research (purple) [Level 2: SMART ICONS]
│ 🎓 │  ← Teaching (green)
│ 📦 │  ← R pkg (blue)
│ ⚙️ │  ← Dev tools (orange)
├────┤  ← DIVIDER
│ 🔵 │  ← Pinned projects [Level 3: PINNED]
│ 🟣 │  (hidden when smart icon expanded)
│ ➕ │  ← Add vault
├────┤  ← SPACER
│ 🔍 │  ← Activity Bar [Level 4: ACTIONS]
│ 📅 │
│ ⚙️ │
└────┘
```

### Expanded State (Research Icon Clicked)

```
┌────┐
│ ☰  │  ← Expand button
├────┤
│ 📥 │  ← INBOX
├────┤
│ 📖 │  ← Research (active/highlighted)
│  │ │  ← Indented child projects:
│ 🔵│←   Research project 1
│ 🔵│←   Research project 2
│ 🔵│←   Research project 3
├────┤
│ 🎓 │  ← Teaching (collapsed)
│ 📦 │  ← R pkg (collapsed)
│ ⚙️ │  ← Dev tools (collapsed)
├────┤
│     │  ← Pinned projects HIDDEN
├────┤
│ 🔍 │  ← Activity Bar
│ 📅 │
│ ⚙️ │
└────┘
```

---

## ⚡ Quick Wins (< 1 hour each)

### 1. Define Smart Icon Data Model (15 min)
**What:** Create TypeScript interfaces for smart icons
**Why:** Foundation for all other work
**Where:** `src/renderer/src/types/index.ts`

```typescript
export interface SmartIcon {
  id: 'research' | 'teaching' | 'r-package' | 'dev-tools'
  label: string
  icon: string  // emoji
  color: string  // hex color
  projectType: Project['type']  // maps to existing project types
  isVisible: boolean  // for customization
  isExpanded: boolean  // expansion state
  order: number  // display order
}

export interface SmartIconConfig {
  icons: SmartIcon[]
  expandedIconId: string | null  // accordion: only one expanded
}
```

**Benefit:** Type safety + clear contract

---

### 2. Add Smart Icons to Zustand Store (20 min)
**What:** Extend `useAppViewStore` with smart icon state
**Why:** Centralized state management + localStorage persistence
**Where:** `src/renderer/src/store/useAppViewStore.ts`

```typescript
interface AppViewState {
  // Existing state...
  smartIcons: SmartIcon[]
  expandedSmartIconId: string | null

  // Actions
  toggleSmartIcon: (iconId: string) => void
  setSmartIconExpanded: (iconId: string, expanded: boolean) => void
  setSmartIconVisibility: (iconId: string, visible: boolean) => void
  reorderSmartIcons: (fromIndex: number, toIndex: number) => void
}

// localStorage key: 'scribe:smartIcons'
const SMART_ICONS_KEY = 'scribe:smartIcons'
const DEFAULT_SMART_ICONS: SmartIcon[] = [
  { id: 'research', label: 'Research', icon: '📖', color: '#8B5CF6', projectType: 'research', isVisible: true, isExpanded: false, order: 0 },
  { id: 'teaching', label: 'Teaching', icon: '🎓', color: '#10B981', projectType: 'teaching', isVisible: true, isExpanded: false, order: 1 },
  { id: 'r-package', label: 'R Packages', icon: '📦', color: '#3B82F6', projectType: 'r-package', isVisible: true, isExpanded: false, order: 2 },
  { id: 'dev-tools', label: 'Dev Tools', icon: '⚙️', color: '#F59E0B', projectType: 'generic', isVisible: true, isExpanded: false, order: 3 }
]
```

**Benefit:** State management ready in < 30 min

---

### 3. Create SmartIconButton Component (30 min)
**What:** Reusable smart icon button component
**Why:** Encapsulates icon display + click behavior
**Where:** `src/renderer/src/components/sidebar/SmartIconButton.tsx`

```tsx
interface SmartIconButtonProps {
  smartIcon: SmartIcon
  isExpanded: boolean
  projectCount: number
  onClick: () => void
}

export function SmartIconButton({
  smartIcon,
  isExpanded,
  projectCount,
  onClick
}: SmartIconButtonProps) {
  const tooltipContent = `${smartIcon.label}\n${projectCount} ${projectCount === 1 ? 'project' : 'projects'}`

  return (
    <Tooltip content={tooltipContent}>
      <button
        className={`smart-icon-btn ${isExpanded ? 'expanded' : ''}`}
        onClick={onClick}
        style={{ '--smart-icon-color': smartIcon.color }}
        data-testid={`smart-icon-${smartIcon.id}`}
      >
        <span className="smart-icon-emoji">{smartIcon.icon}</span>
        {isExpanded && <span className="expanded-indicator" />}
      </button>
    </Tooltip>
  )
}
```

**Benefit:** Reusable, testable, follows existing patterns (InboxButton)

---

### 4. Add CSS for Smart Icons (15 min)
**What:** Styling for smart icons + expanded state
**Why:** Visual distinction from Inbox and regular projects
**Where:** `src/renderer/src/index.css`

```css
/* Smart Icon Buttons */
.smart-icon-btn {
  position: relative;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 150ms ease;
}

.smart-icon-btn:hover {
  background: rgba(var(--smart-icon-color-rgb), 0.1);
}

.smart-icon-btn.expanded {
  background: rgba(var(--smart-icon-color-rgb), 0.15);
}

.smart-icon-btn .smart-icon-emoji {
  font-size: 16px;
  flex-shrink: 0;
}

.smart-icon-btn .expanded-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--smart-icon-color);
  border-radius: 0 2px 2px 0;
}

/* Expanded child projects (indented) */
.smart-icon-children {
  padding-left: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.smart-icon-child-project {
  width: 36px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
}
```

**Benefit:** Visual polish + consistency with existing sidebar

---

## 🔧 Medium Effort (2-4 hours each)

### 5. Integrate Smart Icons into IconBarMode (2h)
**What:** Add smart icons section to IconBarMode component
**Why:** Make them visible in the sidebar
**Where:** `src/renderer/src/components/sidebar/IconBarMode.tsx`

**Changes:**
1. Import SmartIconButton component
2. Read smartIcons from useAppViewStore
3. Filter projects by type for each expanded icon
4. Render smart icons between Inbox and pinned projects
5. Handle click → toggle expansion (accordion logic)
6. Conditionally hide pinned projects when smart icon expanded

**Key Logic:**
```tsx
const smartIcons = useAppViewStore(state => state.smartIcons)
const expandedIconId = useAppViewStore(state => state.expandedSmartIconId)
const toggleSmartIcon = useAppViewStore(state => state.toggleSmartIcon)

// Filter projects by type for expanded smart icon
const expandedProjects = useMemo(() => {
  if (!expandedIconId) return []
  const icon = smartIcons.find(i => i.id === expandedIconId)
  if (!icon) return []
  return projects.filter(p => p.type === icon.projectType)
}, [expandedIconId, smartIcons, projects])

// Accordion logic: expanding one collapses others
const handleSmartIconClick = (iconId: string) => {
  toggleSmartIcon(iconId)
}
```

**Benefit:** Smart icons functional in Icon mode

---

### 6. Keyboard Shortcuts ⌘⇧1-4 (1h)
**What:** Wire keyboard shortcuts to jump to smart icons
**Why:** Power user productivity
**Where:** `src/renderer/src/App.tsx` (global shortcuts)

**Implementation:**
```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // ⌘⇧1-4 for smart icons
    if (e.metaKey && e.shiftKey && !e.altKey && !e.ctrlKey) {
      const key = e.key
      const shortcuts: Record<string, string> = {
        '1': 'research',
        '2': 'teaching',
        '3': 'r-package',
        '4': 'dev-tools'
      }

      if (shortcuts[key]) {
        e.preventDefault()
        const iconId = shortcuts[key]
        setSmartIconExpanded(iconId, true)
        setSidebarMode('icon')  // Jump to icon mode if in compact/card
      }
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [setSmartIconExpanded, setSidebarMode])
```

**Benefit:** Instant access via keyboard

---

### 7. Settings Panel for Smart Icon Customization (3h)
**What:** Add "Smart Icons" section to Settings modal
**Why:** Let users show/hide individual icons
**Where:** Create `src/renderer/src/components/settings/SmartIconsSettings.tsx`

**Features:**
- Toggle visibility for each smart icon (4 switches)
- Drag-to-reorder smart icons (uses @dnd-kit like Quick Actions)
- Preview showing current icon order
- Reset to defaults button

**UI Mockup:**
```
┌─────────────────────────────────────────────────┐
│ Smart Icons                                     │
│                                                 │
│ Show/hide smart icons in sidebar:              │
│                                                 │
│ [✓] 📖 Research                    [Reorder ☰] │
│ [✓] 🎓 Teaching                    [Reorder ☰] │
│ [✓] 📦 R Packages                  [Reorder ☰] │
│ [✓] ⚙️  Dev Tools                  [Reorder ☰] │
│                                                 │
│ [Reset to Defaults]                             │
└─────────────────────────────────────────────────┘
```

**Benefit:** User control over which icons appear

---

### 8. Persistence to localStorage (1h)
**What:** Save/load smart icon state from localStorage
**Why:** Remember expansion + visibility across sessions
**Where:** `src/renderer/src/store/useAppViewStore.ts`

**Schema:**
```typescript
// localStorage key: 'scribe:smartIcons'
{
  "expandedIconId": "research",  // or null if none expanded
  "icons": [
    {
      "id": "research",
      "isVisible": true,
      "isExpanded": true,
      "order": 0
    },
    // ... other icons
  ]
}
```

**Logic:**
- On mount: Load from localStorage → hydrate store
- On state change: Debounce 500ms → save to localStorage
- Merge with defaults if localStorage is stale

**Benefit:** Seamless state restoration

---

## 🏗️ Long-term (Future phases)

### 9. Expand to Compact/Card Modes (Phase 4)
**What:** Show smart icons in Compact (240px) and Card (320px) modes
**Why:** Consistency across all sidebar modes
**When:** After Icon mode is stable

**Design Questions:**
- In Compact mode: Show as collapsible sections with project lists?
- In Card mode: Full cards with project stats per type?
- Should smart icons replace the project list entirely in Compact/Card?

**Estimate:** 4-6h

---

### 10. Smart Project Assignment Suggestions (Future)
**What:** Auto-suggest project type when creating new projects
**Why:** Leverage the hybrid model (auto-suggest, user confirms)
**When:** v1.17+

**Behavior:**
- User clicks "New Project"
- Modal shows project type dropdown
- Detects from project name: "STAT 440" → suggests Teaching
- User confirms or overrides
- New project appears under correct smart icon

**Estimate:** 2-3h

---

### 11. Drag Projects Between Smart Icons (Future)
**What:** Drag a project from Research → Teaching to change type
**Why:** Visual project type management
**When:** v1.18+

**Implementation:**
- Drag project icon
- Drop on smart icon
- Prompt: "Change project type to Teaching?"
- Update project.type in database
- Project moves to new smart icon

**Estimate:** 3-4h

---

### 12. Smart Icon Analytics (Future)
**What:** Show stats when hovering smart icon (tooltip)
**Why:** Quick insights without expanding
**When:** v2.0

**Tooltip Content:**
```
Research
────────
3 active projects
47 total notes
12 notes this week
Last activity: 2h ago
```

**Estimate:** 1-2h

---

## 🎨 UI/UX Specifications

### Color Palette

| Smart Icon | Color Name | Hex | RGB | Use Case |
|------------|------------|-----|-----|----------|
| Research 📖 | Purple-500 | #8B5CF6 | 139, 92, 246 | Hover bg, expanded indicator |
| Teaching 🎓 | Green-500 | #10B981 | 16, 185, 129 | Hover bg, expanded indicator |
| R pkg 📦 | Blue-500 | #3B82F6 | 59, 130, 246 | Hover bg, expanded indicator |
| Dev tools ⚙️ | Amber-500 | #F59E0B | 245, 158, 11 | Hover bg, expanded indicator |

### Interaction States

| State | Visual Feedback |
|-------|----------------|
| **Default** | Gray icon, 90% opacity |
| **Hover** | Icon color tint (10% opacity), scale 1.05 |
| **Expanded** | Icon color tint (15% opacity), left border accent |
| **Click** | Scale 0.95, then 1.0 (100ms bounce) |
| **Keyboard focus** | 2px outline in icon color |

### Animation Timing

| Action | Duration | Easing |
|--------|----------|--------|
| Expand/collapse | 200ms | ease-out |
| Child project slide-in | 150ms (stagger 30ms) | ease-out |
| Hover scale | 100ms | ease-in-out |
| Pinned projects hide/show | 200ms | ease-out |

### Accessibility

| Requirement | Implementation |
|-------------|----------------|
| **ARIA labels** | `aria-label="Research projects, 3 items"` |
| **Keyboard nav** | Tab focuses each icon, Enter/Space toggles |
| **Screen reader** | Announce "Research expanded" / "Research collapsed" |
| **Focus visible** | 2px outline on keyboard focus |
| **Color contrast** | WCAG AA: 4.5:1 minimum for all colors |

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)

**File:** `src/renderer/src/__tests__/SmartIcons.test.tsx`

```typescript
describe('SmartIconButton', () => {
  test('renders icon and label', () => {})
  test('shows project count in tooltip', () => {})
  test('applies expanded state correctly', () => {})
  test('calls onClick when clicked', () => {})
  test('applies custom color via CSS variable', () => {})
})

describe('useAppViewStore - Smart Icons', () => {
  test('initializes with default smart icons', () => {})
  test('toggleSmartIcon expands/collapses', () => {})
  test('accordion mode: expanding one collapses others', () => {})
  test('setSmartIconVisibility hides/shows icons', () => {})
  test('reorderSmartIcons updates order', () => {})
  test('persists to localStorage on state change', () => {})
  test('loads from localStorage on mount', () => {})
})
```

**Estimate:** 25 tests, 2h to write

---

### E2E Tests (Playwright)

**File:** `e2e/smart-icons.spec.ts`

```typescript
test.describe('Smart Icons', () => {
  test('SI-01: Click Research icon expands child projects', async ({ page }) => {})
  test('SI-02: Accordion mode: expanding Teaching collapses Research', async ({ page }) => {})
  test('SI-03: Child project click selects that project', async ({ page }) => {})
  test('SI-04: Pinned projects hidden when smart icon expanded', async ({ page }) => {})
  test('SI-05: Keyboard shortcut ⌘⇧1 expands Research', async ({ page }) => {})
  test('SI-06: Keyboard shortcut ⌘⇧2 expands Teaching', async ({ page }) => {})
  test('SI-07: Expansion state persists after page reload', async ({ page }) => {})
  test('SI-08: Settings: Hide Research icon removes it from sidebar', async ({ page }) => {})
  test('SI-09: Empty state: 0 projects shows "No research projects"', async ({ page }) => {})
  test('SI-10: Tooltip shows project count on hover', async ({ page }) => {})
})
```

**Estimate:** 10 tests, 1.5h to write

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Quick Wins 1-4) - 1.5h
**Goal:** Data model + basic UI

| Task | Time | Priority |
|------|------|----------|
| Define SmartIcon TypeScript interfaces | 15m | P1 |
| Add smart icons to Zustand store | 20m | P1 |
| Create SmartIconButton component | 30m | P1 |
| Add CSS for smart icons | 15m | P1 |
| Unit tests for store + component | 20m | P1 |

**Deliverable:** Smart icons render (no interaction yet)

---

### Phase 2: Core Interaction (Items 5-6) - 3h
**Goal:** Functional smart icons in Icon mode

| Task | Time | Priority |
|------|------|----------|
| Integrate into IconBarMode | 2h | P1 |
| Add keyboard shortcuts ⌘⇧1-4 | 1h | P1 |
| E2E tests (SI-01 to SI-06) | 1h | P1 |

**Deliverable:** Click to expand/collapse, keyboard shortcuts work

---

### Phase 3: Customization + Persistence (Items 7-8) - 4h
**Goal:** Settings panel + state persistence

| Task | Time | Priority |
|------|------|----------|
| Create SmartIconsSettings component | 2h | P2 |
| Add localStorage persistence | 1h | P1 |
| Drag-to-reorder in Settings | 1h | P2 |
| E2E tests (SI-07 to SI-10) | 30m | P1 |

**Deliverable:** User can customize + state persists

---

### Phase 4: Polish + Edge Cases (Future) - 2h
**Goal:** Animations, empty states, loading states

| Task | Time | Priority |
|------|------|----------|
| Expand/collapse animation | 30m | P3 |
| Empty state when 0 projects | 30m | P2 |
| Loading state during project fetch | 30m | P3 |
| Accessibility audit (ARIA, keyboard nav) | 30m | P2 |

**Deliverable:** Production-ready feature

---

## 📊 Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Adoption Rate** | 80% of users use smart icons | Track localStorage `smartIcons.expandedIconId` |
| **Reduced Pinning** | 30% fewer manually pinned projects | Compare pinned count before/after |
| **Keyboard Usage** | 20% of smart icon clicks via ⌘⇧1-4 | Track shortcut key events |
| **Customization** | 40% of users hide at least 1 icon | Track `smartIcons.icons[].isVisible` |
| **Session Persistence** | 90% of sessions restore expansion state | localStorage load success rate |

---

## ❓ Open Questions

1. **Project Type Mismatch**: What if a user has 10 "generic" projects? Should "Dev tools" show all generics or have sub-filtering?
2. **Multi-Type Projects**: What if a project is both Research AND Teaching (e.g., STAT 579)? Show in both smart icons?
3. **Smart Icon Overflow**: What if user has 50 R packages? Virtualize the child list? Add search?
4. **Migration Path**: Existing pinned projects - should we auto-hide them if they appear in an expanded smart icon?
5. **Tauri vs Browser**: Do smart icons work the same in both modes? Any localStorage differences?
6. **Mobile Compatibility**: If Scribe goes mobile, how do smart icons translate to a smaller screen?

---

## 🔗 Related Features

| Feature | Relationship |
|---------|-------------|
| **Inbox** | Smart icons follow same permanent pattern |
| **Pinned Projects** | Hidden when smart icon expanded (non-overlapping) |
| **Activity Bar** | Same bottom position regardless of smart icon state |
| **Project Types** | Smart icons map directly to existing project.type field |
| **Settings Modal** | Add SmartIconsSettings panel |
| **Keyboard Shortcuts** | ⌘⇧1-4 added to existing shortcut system |

---

## 🎯 Recommended Implementation Path

**Start with Phase 1 (Quick Wins 1-4) to validate the approach:**

1. ✅ Define data model (15 min)
2. ✅ Add to Zustand store (20 min)
3. ✅ Create SmartIconButton component (30 min)
4. ✅ Add CSS (15 min)
5. 🧪 Test in browser mode
6. 📝 Get user feedback on visual design

**If validated, proceed to Phase 2 for core interaction.**

**Why this path?**
- **Low risk**: Uses existing patterns (InboxButton, ActivityBar)
- **Fast feedback**: See results in < 2h
- **Iterative**: Can pause after Phase 1 if design needs adjustment
- **ADHD-friendly**: Small, focused tasks with clear outcomes

---

## 📝 Notes

- This feature aligns with Scribe's "Focus First" sidebar philosophy (Phase 3 spec)
- Uses existing infrastructure: Zustand, Tooltip, localStorage patterns
- No new dependencies required (uses existing @dnd-kit for reorder)
- Backward compatible: Existing pinned projects + Activity Bar unchanged
- Performance: Filtering projects by type is O(n), memoized for efficiency

---

**⏱️ Total Estimate:**
- Phase 1: 1.5h
- Phase 2: 3h
- Phase 3: 4h
- **Total: 8.5h for MVP** (Phases 1-3)

**Status:** Ready for implementation 🚀

---

**Next Steps:**
1. Review this brainstorm with user
2. Capture as formal spec (if approved)
3. Start Phase 1 (Quick Wins 1-4)
4. Test + iterate
5. Proceed to Phase 2
