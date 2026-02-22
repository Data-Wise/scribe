# SPEC: Smart Icons - Permanent Type-Based Folders

**Status:** Implemented (in v1.16.0, 2026-01-10)
**Created:** 2026-01-08
**From Brainstorm:** `BRAINSTORM-smart-icons-2026-01-08.md`
**Version:** 1.0.0
**Priority:** P1
**Estimated Effort:** 8.5h (MVP Phases 1-3)

---

## 📋 Metadata

| Field | Value |
|-------|-------|
| **Feature Name** | Smart Icons - Permanent Type-Based Folders |
| **Type** | Feature Enhancement |
| **Affects** | Left Sidebar (Icon Mode) |
| **Branch** | `feat/sidebar-v2` |
| **Depends On** | Phase 3 (Vault Pinning) ✅ Complete |
| **Blocks** | N/A |
| **Target Release** | v1.16 |

---

## 🎯 Overview

Add 4 permanent "smart icons" to the left sidebar that act as intelligent project type filters, similar to how Inbox is implemented. These icons (Research 📖, Teaching 🎓, R pkg 📦, Dev tools ⚙️) expand in-place to show child projects of that type, providing quick access to projects without manual pinning.

### Problem Statement

Currently, users with many projects of the same type (e.g., 6 R packages, 5 teaching courses) must:
- Manually pin each one (limited to 4 slots)
- Or expand to Compact mode to see full project list (takes space)
- Or use Command Palette every time (friction)

This creates cognitive load and slows down project switching for academic users with many projects.

### Solution

Add permanent smart icons that automatically group projects by type and expand on-demand to show filtered lists. This combines the benefits of:
- **Minimal UI** (icons only when collapsed)
- **Intelligent grouping** (auto-detect by project type)
- **Quick access** (one click to see all research projects)
- **Zero configuration** (works out of the box)

---

## 👤 Primary User Story

> **As an academic researcher using Scribe,**
> I want to quickly access all my research projects without manually pinning each one,
> So that I can jump between research notes while keeping my sidebar uncluttered.

**Acceptance Criteria:**
- [ ] Click Research icon → expands to show all research-type projects (indented list)
- [ ] Child projects display below smart icon with proper indentation
- [ ] Expanding one smart icon collapses others (accordion mode)
- [ ] Keyboard shortcut ⌘⇧1 jumps to Research icon and expands it
- [ ] Expansion state persists across browser refresh
- [ ] Settings panel allows hiding individual smart icons
- [ ] No badges on smart icons (clean design)

---

## 👥 Secondary User Stories

### Teaching Workflow
> **As a statistics professor,**
> I want a dedicated Teaching icon that shows all my course projects,
> So that I can quickly switch between STAT 440, STAT 579, etc.

**Acceptance Criteria:**
- [ ] ⌘⇧2 keyboard shortcut jumps to Teaching icon
- [ ] Shows all projects where `type === 'teaching'`
- [ ] Course projects sorted alphabetically by name

### R Package Development
> **As an R package maintainer,**
> I want to group all my mediationverse packages under one icon,
> So that I don't need to manually pin 6+ packages individually.

**Acceptance Criteria:**
- [ ] ⌘⇧3 keyboard shortcut jumps to R pkg icon
- [ ] Shows all projects where `type === 'r-package'`
- [ ] Package projects sorted alphabetically

### Dev Tools Organization
> **As a developer maintaining multiple tools,**
> I want a Dev tools icon for Scribe, flow-cli, MCP servers, etc.,
> So that my workflow tools are one click away.

**Acceptance Criteria:**
- [ ] ⌘⇧4 keyboard shortcut jumps to Dev tools icon
- [ ] Shows all projects where `type === 'generic'` (dev tools use generic type)
- [ ] Tool projects sorted alphabetically

---

## 🏗️ Technical Requirements

### Architecture

#### 1. State Management

**Extend Zustand Store:** `useAppViewStore.ts`

```typescript
// Add to AppViewState interface
interface AppViewState {
  // ... existing state

  // Smart Icons State
  smartIcons: SmartIcon[]
  expandedSmartIconId: string | null  // Accordion: only one expanded

  // Smart Icons Actions
  toggleSmartIcon: (iconId: string) => void
  setSmartIconExpanded: (iconId: string, expanded: boolean) => void
  setSmartIconVisibility: (iconId: string, visible: boolean) => void
  reorderSmartIcons: (fromIndex: number, toIndex: number) => void
}

// Smart Icon Data Model
export interface SmartIcon {
  id: 'research' | 'teaching' | 'r-package' | 'dev-tools'
  label: string
  icon: string  // emoji: 📖, 🎓, 📦, ⚙️
  color: string  // hex color for hover/expanded states
  projectType: ProjectType  // maps to Project['type']
  isVisible: boolean  // for customization in Settings
  isExpanded: boolean  // expansion state
  order: number  // display order (0-3)
}

// Default Configuration
const DEFAULT_SMART_ICONS: SmartIcon[] = [
  {
    id: 'research',
    label: 'Research',
    icon: '📖',
    color: '#8B5CF6',  // purple-500
    projectType: 'research',
    isVisible: true,
    isExpanded: false,
    order: 0
  },
  {
    id: 'teaching',
    label: 'Teaching',
    icon: '🎓',
    color: '#10B981',  // green-500
    projectType: 'teaching',
    isVisible: true,
    isExpanded: false,
    order: 1
  },
  {
    id: 'r-package',
    label: 'R Packages',
    icon: '📦',
    color: '#3B82F6',  // blue-500
    projectType: 'r-package',
    isVisible: true,
    isExpanded: false,
    order: 2
  },
  {
    id: 'dev-tools',
    label: 'Dev Tools',
    icon: '⚙️',
    color: '#F59E0B',  // amber-500
    projectType: 'generic',
    isVisible: true,
    isExpanded: false,
    order: 3
  }
]
```

#### 2. Component Tree

```
IconBarMode.tsx
├── SmartIconButton (new) × 4
│   ├── Tooltip
│   └── ExpandedChildProjects (new)
│       └── ChildProjectIcon (new) × N
├── InboxButton (existing)
├── ProjectIconButton (existing - hidden when smart icon expanded)
└── ActivityBar (existing)
```

**New Components:**

1. **SmartIconButton** (`components/sidebar/SmartIconButton.tsx`)
   - Renders smart icon with emoji and color
   - Handles click to toggle expansion
   - Shows expanded indicator when active
   - Integrates Tooltip for project count

2. **ExpandedChildProjects** (part of SmartIconButton)
   - Renders indented list of child projects
   - Each child is a smaller project icon
   - Slide-in animation (150ms ease-out)
   - Virtualized if > 20 projects (performance)

3. **ChildProjectIcon** (internal to ExpandedChildProjects)
   - Mini version of ProjectIconButton
   - 28px height (vs 32px for regular icons)
   - Left-indented 12px
   - Click to select project

#### 3. Data Flow

```
User Action → State Update → UI Render
────────────────────────────────────────

1. Click Research Icon
   ↓
2. toggleSmartIcon('research')
   ↓
3. Zustand: Set expandedSmartIconId = 'research'
           Collapse other smart icons
           Save to localStorage
   ↓
4. React re-render:
   - SmartIconButton shows expanded state
   - ExpandedChildProjects renders (filter projects by type)
   - Pinned projects hidden (conditional render)
```

#### 4. Filtering Logic

```typescript
// Memoized filtering for performance
const expandedProjects = useMemo(() => {
  if (!expandedSmartIconId) return []

  const icon = smartIcons.find(i => i.id === expandedSmartIconId)
  if (!icon) return []

  // Filter projects by type
  return projects
    .filter(p => p.type === icon.projectType)
    .sort((a, b) => a.name.localeCompare(b.name))  // Alphabetical
}, [expandedSmartIconId, smartIcons, projects])
```

#### 5. localStorage Schema

```typescript
// Key: 'scribe:smartIcons'
{
  "expandedIconId": "research" | null,
  "icons": [
    {
      "id": "research",
      "isVisible": true,
      "order": 0
    },
    {
      "id": "teaching",
      "isVisible": false,  // Hidden in Settings
      "order": 1
    },
    // ... other icons
  ]
}
```

**Persistence Strategy:**
- Debounce saves (500ms) to avoid excessive localStorage writes
- Merge with defaults on load (handle missing fields)
- Clear stale data on version mismatch

#### 6. Keyboard Shortcuts

**Implementation:** `App.tsx` (global shortcuts)

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // ⌘⇧1-4 for smart icons
    if (e.metaKey && e.shiftKey && !e.altKey && !e.ctrlKey) {
      const shortcuts: Record<string, string> = {
        '1': 'research',
        '2': 'teaching',
        '3': 'r-package',
        '4': 'dev-tools'
      }

      const iconId = shortcuts[e.key]
      if (iconId) {
        e.preventDefault()
        setSmartIconExpanded(iconId, true)
        setSidebarMode('icon')  // Jump to icon mode if not already
      }
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [setSmartIconExpanded, setSidebarMode])
```

**Shortcuts:**
- ⌘⇧1: Research
- ⌘⇧2: Teaching
- ⌘⇧3: R Packages
- ⌘⇧4: Dev Tools

**Conflict Check:**
- ⌘1-9: Editor tabs (existing)
- ⌘⇧P: New project (existing)
- ⌘⇧C: Quick capture (existing)
- ⌘⇧1-4: **New** - no conflicts ✅

#### 7. Settings Integration

**New Component:** `SmartIconsSettings.tsx`

```tsx
export function SmartIconsSettings() {
  const smartIcons = useAppViewStore(state => state.smartIcons)
  const setSmartIconVisibility = useAppViewStore(state => state.setSmartIconVisibility)
  const reorderSmartIcons = useAppViewStore(state => state.reorderSmartIcons)

  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <h3>Smart Icons</h3>
        <span className="settings-description">
          Show/hide project type filters in sidebar
        </span>
      </div>

      {/* Toggle switches for each icon */}
      {smartIcons.map(icon => (
        <div key={icon.id} className="setting-row">
          <label>
            <span className="smart-icon-label">
              {icon.icon} {icon.label}
            </span>
            <input
              type="checkbox"
              checked={icon.isVisible}
              onChange={(e) => setSmartIconVisibility(icon.id, e.target.checked)}
            />
          </label>
        </div>
      ))}

      {/* Drag-to-reorder (using @dnd-kit like Quick Actions) */}
      <DragDropContext onDragEnd={handleReorder}>
        {/* ... drag handles */}
      </DragDropContext>
    </div>
  )
}
```

**Settings Location:** Settings Modal → Sidebar tab → Smart Icons section

---

## 🎨 UI/UX Specifications

### Visual Hierarchy

```
Icon Mode (48px width) - Visual Layers:

Level 1: CRITICAL (Always Visible)
├── Inbox (amber, permanent)
└── Activity Bar (bottom)

Level 2: SMART ICONS (New - Below Inbox)
├── Research 📖 (purple hover)
├── Teaching 🎓 (green hover)
├── R pkg 📦 (blue hover)
└── Dev tools ⚙️ (amber hover)

Level 3: PINNED PROJECTS (Hidden when smart icon expanded)
├── Pinned project 1
├── Pinned project 2
└── ...

Level 4: ACTIVITY BAR (Always visible)
```

### Wireframes

**Icon Mode - Collapsed State (Default)**

```
┌────┐
│ ☰  │  ← Expand button
├────┤
│ 📥 │  ← INBOX (amber)
├────┤
│ 📖 │  ← Research (collapsed)
│ 🎓 │  ← Teaching (collapsed)
│ 📦 │  ← R pkg (collapsed)
│ ⚙️ │  ← Dev tools (collapsed)
├────┤
│ 🔵 │  ← Pinned projects (visible)
│ 🟣 │
│ ➕ │  ← Add project
├────┤
│ 🔍 │  ← Activity Bar
│ 📅 │
│ ⚙️ │
└────┘
```

**Icon Mode - Expanded State (Research Clicked)**

```
┌────┐
│ ☰  │  ← Expand button
├────┤
│ 📥 │  ← INBOX
├────┤
│ 📖 │  ← Research (EXPANDED - highlighted)
│  🔵│  ← Child: Mediation Analysis
│  🔵│  ← Child: Collider Bias
│  🔵│  ← Child: Product of Three
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

INTERACTION:
• Click Research → Expands, others collapse
• Click child project → Selects that project
• Click Research again → Collapses (back to default)
• ⌘⇧1 → Expands Research
```

### Color Palette

| Smart Icon | Color | Hex | Usage |
|------------|-------|-----|-------|
| Research 📖 | Purple-500 | #8B5CF6 | Hover bg (10% opacity), expanded indicator |
| Teaching 🎓 | Green-500 | #10B981 | Hover bg (10% opacity), expanded indicator |
| R pkg 📦 | Blue-500 | #3B82F6 | Hover bg (10% opacity), expanded indicator |
| Dev tools ⚙️ | Amber-500 | #F59E0B | Hover bg (10% opacity), expanded indicator |

### Interaction States

| State | Visual Feedback | Duration |
|-------|----------------|----------|
| **Default** | Gray icon, 90% opacity | - |
| **Hover** | Icon color tint (10% opacity), scale 1.05 | 100ms |
| **Expanded** | Icon color tint (15% opacity), left border accent (3px) | - |
| **Click** | Scale 0.95 → 1.0 (bounce) | 100ms |
| **Keyboard focus** | 2px outline in icon color | - |

### Animation Timing

| Action | Duration | Easing |
|--------|----------|--------|
| Expand/collapse | 200ms | ease-out |
| Child project slide-in | 150ms (stagger 30ms per item) | ease-out |
| Hover scale | 100ms | ease-in-out |
| Pinned projects hide/show | 200ms | ease-out |

### Accessibility

| Requirement | Implementation |
|-------------|----------------|
| **ARIA labels** | `aria-label="Research projects, 3 items"` |
| **Keyboard nav** | Tab focuses each icon, Enter/Space toggles expansion |
| **Screen reader** | Announce "Research expanded, showing 3 projects" |
| **Focus visible** | 2px outline on keyboard focus |
| **Color contrast** | WCAG AA: 4.5:1 minimum for all colors |
| **Reduced motion** | Respect `prefers-reduced-motion` (disable animations) |

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)

**File:** `src/renderer/src/__tests__/SmartIcons.test.tsx`

**Test Cases (25 tests, ~2h to write):**

```typescript
describe('SmartIconButton', () => {
  it('renders icon and label', () => {})
  it('shows project count in tooltip', () => {})
  it('applies expanded state correctly', () => {})
  it('calls onClick when clicked', () => {})
  it('applies custom color via CSS variable', () => {})
  it('shows expanded indicator when active', () => {})
  it('renders child projects when expanded', () => {})
})

describe('useAppViewStore - Smart Icons', () => {
  it('initializes with default smart icons', () => {})
  it('toggleSmartIcon expands/collapses', () => {})
  it('accordion mode: expanding one collapses others', () => {})
  it('setSmartIconVisibility hides/shows icons', () => {})
  it('reorderSmartIcons updates order', () => {})
  it('persists to localStorage on state change', () => {})
  it('loads from localStorage on mount', () => {})
  it('merges with defaults if localStorage is stale', () => {})
  it('handles missing localStorage gracefully', () => {})
})

describe('Smart Icon Filtering', () => {
  it('filters projects by research type', () => {})
  it('filters projects by teaching type', () => {})
  it('sorts filtered projects alphabetically', () => {})
  it('handles 0 projects of a type (empty state)', () => {})
  it('handles 20+ projects (performance)', () => {})
})
```

### E2E Tests (Playwright)

**File:** `e2e/smart-icons.spec.ts`

**Test Cases (10 tests, ~1.5h to write):**

```typescript
test.describe('Smart Icons', () => {
  test('SI-01: Click Research icon expands child projects', async ({ page }) => {})
  test('SI-02: Accordion mode - expanding Teaching collapses Research', async ({ page }) => {})
  test('SI-03: Child project click selects that project', async ({ page }) => {})
  test('SI-04: Pinned projects hidden when smart icon expanded', async ({ page }) => {})
  test('SI-05: Keyboard shortcut ⌘⇧1 expands Research', async ({ page }) => {})
  test('SI-06: Keyboard shortcut ⌘⇧2 expands Teaching', async ({ page }) => {})
  test('SI-07: Expansion state persists after page reload', async ({ page }) => {})
  test('SI-08: Settings - Hide Research icon removes it from sidebar', async ({ page }) => {})
  test('SI-09: Empty state - 0 projects shows "No research projects"', async ({ page }) => {})
  test('SI-10: Tooltip shows project count on hover', async ({ page }) => {})
})
```

---

## 📦 Dependencies

**No new dependencies required!** ✅

Uses existing packages:
- `zustand` - State management (already installed)
- `@dnd-kit/core`, `@dnd-kit/sortable` - Drag-to-reorder in Settings (already installed)
- `lucide-react` - Icons (already installed)
- `react-window` - Optional virtualization for 20+ projects (already installed)

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Quick Wins 1-4) - 1.5h

**Goal:** Data model + basic UI

| Task | Time | Priority | Dependencies |
|------|------|----------|--------------|
| Define SmartIcon TypeScript interfaces | 15m | P1 | None |
| Add smart icons to Zustand store | 20m | P1 | Types |
| Create SmartIconButton component | 30m | P1 | Store |
| Add CSS for smart icons | 15m | P1 | Component |
| Unit tests for store + component | 20m | P1 | All above |

**Deliverable:** Smart icons render (no interaction yet)

**Files Created:**
- `src/renderer/src/types/smartIcons.ts` (50 lines)
- `src/renderer/src/components/sidebar/SmartIconButton.tsx` (120 lines)

**Files Modified:**
- `src/renderer/src/store/useAppViewStore.ts` (+150 lines)
- `src/renderer/src/index.css` (+80 lines)

---

### Phase 2: Core Interaction (Items 5-6) - 3h

**Goal:** Functional smart icons in Icon mode

| Task | Time | Priority | Dependencies |
|------|------|----------|--------------|
| Integrate into IconBarMode | 2h | P1 | Phase 1 |
| Add keyboard shortcuts ⌘⇧1-4 | 1h | P1 | Phase 1 |
| E2E tests (SI-01 to SI-06) | 1h | P1 | Implementation |

**Deliverable:** Click to expand/collapse, keyboard shortcuts work

**Files Modified:**
- `src/renderer/src/components/sidebar/IconBarMode.tsx` (+80 lines)
- `src/renderer/src/App.tsx` (+30 lines for shortcuts)

**Files Created:**
- `e2e/smart-icons.spec.ts` (200 lines)

---

### Phase 3: Customization + Persistence (Items 7-8) - 4h

**Goal:** Settings panel + state persistence

| Task | Time | Priority | Dependencies |
|------|------|----------|--------------|
| Create SmartIconsSettings component | 2h | P2 | Phase 2 |
| Add localStorage persistence | 1h | P1 | Phase 2 |
| Drag-to-reorder in Settings | 1h | P2 | Settings component |
| E2E tests (SI-07 to SI-10) | 30m | P1 | Implementation |

**Deliverable:** User can customize + state persists

**Files Created:**
- `src/renderer/src/components/settings/SmartIconsSettings.tsx` (200 lines)

**Files Modified:**
- `src/renderer/src/components/SettingsModal.tsx` (+20 lines - add Smart Icons tab)

---

### Phase 4: Polish + Edge Cases (Future) - 2h

**Goal:** Animations, empty states, loading states

| Task | Time | Priority | Dependencies |
|------|------|----------|--------------|
| Expand/collapse animation | 30m | P3 | Phase 2 |
| Empty state when 0 projects | 30m | P2 | Phase 2 |
| Loading state during project fetch | 30m | P3 | Phase 2 |
| Accessibility audit (ARIA, keyboard nav) | 30m | P2 | Phase 2 |

**Deliverable:** Production-ready feature

---

## ❓ Open Questions

1. **Project Type Mismatch**
   - Q: What if a user has 10 "generic" projects? Should "Dev tools" show all generics or have sub-filtering?
   - **Decision:** Show all generic projects. If needed, user can create more specific project types in v2.

2. **Multi-Type Projects**
   - Q: What if a project is both Research AND Teaching (e.g., STAT 579 - statistical research course)?
   - **Decision:** Projects have ONE type only. User chooses primary type. If needed, use tags for cross-referencing.

3. **Smart Icon Overflow**
   - Q: What if user has 50 R packages? Virtualize the child list? Add search?
   - **Decision:**
     - If < 20 projects: Render all
     - If ≥ 20 projects: Virtualize with `react-window` (already installed)
     - Future: Add inline search (v1.17+)

4. **Migration Path**
   - Q: Existing pinned projects - should we auto-hide them if they appear in an expanded smart icon?
   - **Decision:** Yes, hide temporarily while smart icon expanded. Restore when smart icon collapses.

5. **Tauri vs Browser**
   - Q: Do smart icons work the same in both modes? Any localStorage differences?
   - **Decision:** Identical behavior. Both use localStorage, no differences.

6. **Mobile Compatibility**
   - Q: If Scribe goes mobile, how do smart icons translate to smaller screen?
   - **Decision:** Deferred to v2. Mobile not in current scope.

---

## 🔗 Related Features

| Feature | Relationship | Impact |
|---------|-------------|--------|
| **Inbox** | Smart icons follow same permanent pattern | Template for implementation |
| **Pinned Projects** | Hidden when smart icon expanded (non-overlapping) | Conditional rendering logic |
| **Activity Bar** | Same bottom position regardless of smart icon state | No changes needed |
| **Project Types** | Smart icons map directly to existing `project.type` field | No database changes |
| **Settings Modal** | Add SmartIconsSettings panel | New settings section |
| **Keyboard Shortcuts** | ⌘⇧1-4 added to existing shortcut system | No conflicts |

---

## 📊 Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Adoption Rate** | 80% of users use smart icons | Track localStorage `smartIcons.expandedIconId` |
| **Reduced Pinning** | 30% fewer manually pinned projects | Compare pinned count before/after |
| **Keyboard Usage** | 20% of smart icon clicks via ⌘⇧1-4 | Track shortcut key events |
| **Customization** | 40% of users hide at least 1 icon | Track `smartIcons.icons[].isVisible` |
| **Session Persistence** | 90% of sessions restore expansion state | localStorage load success rate |
| **Performance** | No lag with 50+ projects | Measure expand/collapse duration < 200ms |

---

## 🎯 Recommended Implementation Path

**Start with Phase 1** to validate the approach (1.5h):

1. ✅ Define data model (15 min) - `smartIcons.ts`
2. ✅ Add to Zustand store (20 min) - `useAppViewStore.ts`
3. ✅ Create SmartIconButton component (30 min) - `SmartIconButton.tsx`
4. ✅ Add CSS (15 min) - `index.css`
5. 🧪 Test in browser mode (manual QA)
6. 📝 Get user feedback on visual design

**If validated, proceed to Phase 2 for core interaction (3h).**

**Total MVP:** 8.5h (Phases 1-3)

**Why this path?**
- **Low risk:** Uses existing patterns (InboxButton, ActivityBar)
- **Fast feedback:** See results in < 2h
- **Iterative:** Can pause after Phase 1 if design needs adjustment
- **ADHD-friendly:** Small, focused tasks with clear outcomes

---

## 📝 Review Checklist

### Before Implementation
- [ ] User story acceptance criteria clear
- [ ] Technical approach approved
- [ ] No conflicts with existing features
- [ ] All open questions resolved
- [ ] Wireframes reviewed by UX

### During Implementation
- [ ] Types defined in `types/index.ts`
- [ ] State management in Zustand
- [ ] Components follow existing patterns
- [ ] CSS uses existing design tokens
- [ ] Unit tests written (25 tests)
- [ ] E2E tests written (10 tests)

### Before Merge
- [ ] All tests passing (2015 unit + 10 new E2E)
- [ ] TypeScript: 0 errors
- [ ] Manual QA in browser mode
- [ ] Manual QA in Tauri mode
- [ ] Keyboard shortcuts tested
- [ ] localStorage persistence verified
- [ ] Settings panel functional
- [ ] Performance tested with 50+ projects
- [ ] Accessibility audit passed

---

## 🔄 Implementation Notes

### Key Considerations

1. **Accordion Mode:** Only one smart icon expanded at a time
   - Expanding Research → collapses Teaching/R pkg/Dev tools
   - User can click same icon to collapse (toggle behavior)

2. **No Badges:** Keep icons clean
   - No project count badges on smart icons
   - Project count shown in tooltip on hover

3. **Backward Compatible:**
   - Existing pinned projects work unchanged
   - Smart icons are additive (no breaking changes)

4. **Performance:**
   - Memoize filtered project lists
   - Virtualize if > 20 projects
   - Debounce localStorage saves (500ms)

5. **ADHD-Friendly:**
   - Fast animations (< 200ms)
   - Clear visual feedback
   - Keyboard shortcuts for power users
   - No forced interactions (can ignore smart icons)

---

## 📚 History

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-08 | 1.0.0 | Initial spec from brainstorm (max mode with 2 agents) |

---

**Status:** Ready for Phase 1 implementation 🚀

**Next Steps:**
1. Review spec with team
2. Get approval for Phase 1 (1.5h)
3. Start implementation
4. Test + iterate
5. Proceed to Phase 2
