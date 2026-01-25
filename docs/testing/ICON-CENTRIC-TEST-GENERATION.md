# Icon-Centric Sidebar Test Generation

**Version:** v1.16.0
**Date:** 2026-01-10
**Status:** Test plan for additional coverage beyond existing 64 tests

---

## Executive Summary

This document identifies **gaps in test coverage** for the v1.16.0 icon-centric sidebar implementation and provides comprehensive test cases to achieve 100% coverage across all components and edge cases.

**Current Coverage:** 64 tests (25 core + 23 edge cases + 16 E2E)
**Proposed Additional Tests:** 42 tests
**Target Total:** 106 tests

---

## Test Coverage Analysis

### Currently Covered ✅

**State Management (48 tests):**
- ✅ Core expansion (expandVault, expandSmartIcon, toggleIcon, collapseAll)
- ✅ Edge cases (invalid state, boundaries, race conditions)
- ✅ localStorage persistence and migration

**E2E Integration (16 tests):**
- ✅ User click interactions
- ✅ Accordion pattern enforcement
- ✅ Mode toggle persistence

### Missing Coverage ❌

**Component Rendering (0 tests):**
- ❌ IconBar component rendering
- ❌ ExpandedIconPanel component rendering
- ❌ Mode toggle button behavior
- ❌ Panel width calculations
- ❌ Content switching (CompactListView ⇄ CardGridView)

**Visual States (0 tests):**
- ❌ Expanded icon indicators (3px accent bar)
- ❌ CSS animations (slideInFromLeft, indicatorFadeIn)
- ❌ Drag-and-drop reordering
- ❌ Tooltip behavior

**Accessibility (0 tests):**
- ❌ ARIA labels
- ❌ Keyboard navigation
- ❌ Screen reader support

**Performance (0 tests):**
- ❌ Re-render optimization
- ❌ useMemo dependencies
- ❌ Large dataset handling (100+ projects/notes)

---

## Test Plan for IconBar Component

### Component Signature

```typescript
function IconBar({
  projects: Project[]
  notes: Note[]
  expandedIcon: ExpandedIconType
  onToggleVault: (vaultId: string) => void
  onToggleSmartIcon: (iconId: SmartIconId) => void
  onSearch: () => void
  onDaily: () => void
  onSettings: () => void
  onSelectNote: (noteId: string) => void
  onCreateProject: () => void
  activeActivityItem?: 'search' | 'daily' | 'recent' | 'settings' | null
}): JSX.Element
```

### Test Categories

#### 1. Basic Rendering (8 tests)

**IB-01: Renders icon bar with fixed 48px width**
```typescript
it('renders icon bar with fixed 48px width', () => {
  const { container } = render(<IconBar {...defaultProps} />)
  const iconBar = container.querySelector('.mission-sidebar-icon')

  expect(iconBar).toBeInTheDocument()
  expect(iconBar).toHaveStyle({ width: '48px' })
})
```

**IB-02: Renders Inbox button at top**
```typescript
it('renders Inbox button at top', () => {
  render(<IconBar {...defaultProps} />)
  const inboxButton = screen.getByTestId('inbox-btn')

  expect(inboxButton).toBeInTheDocument()
  expect(inboxButton).toHaveClass('inbox-btn')
})
```

**IB-03: Renders visible smart icons in correct order**
```typescript
it('renders visible smart icons in correct order', () => {
  const smartIcons = [
    { id: 'research', label: 'Research', order: 0, isVisible: true },
    { id: 'teaching', label: 'Teaching', order: 1, isVisible: true },
    { id: 'hidden', label: 'Hidden', order: 2, isVisible: false }
  ]

  // Mock useAppViewStore to return smartIcons
  render(<IconBar {...defaultProps} />)

  const researchBtn = screen.getByTestId('smart-icon-research')
  const teachingBtn = screen.getByTestId('smart-icon-teaching')
  const hiddenBtn = screen.queryByTestId('smart-icon-hidden')

  expect(researchBtn).toBeInTheDocument()
  expect(teachingBtn).toBeInTheDocument()
  expect(hiddenBtn).not.toBeInTheDocument()
})
```

**IB-04: Renders pinned project icons sorted by vault order**
```typescript
it('renders pinned project icons sorted by vault order', () => {
  const projects = [
    { id: 'proj1', name: 'First', type: 'research' },
    { id: 'proj2', name: 'Second', type: 'teaching' }
  ]
  const pinnedVaults = [
    { id: 'inbox', order: 0 },
    { id: 'proj2', order: 1 },  // Second should appear first
    { id: 'proj1', order: 2 }
  ]

  // Mock useAppViewStore
  render(<IconBar {...defaultProps} projects={projects} />)

  const projectIcons = screen.getAllByTestId(/^project-icon-/)
  expect(projectIcons[0]).toHaveAttribute('data-testid', 'project-icon-proj2')
  expect(projectIcons[1]).toHaveAttribute('data-testid', 'project-icon-proj1')
})
```

**IB-05: Renders empty state when no pinned projects**
```typescript
it('renders empty state when no pinned projects', () => {
  render(<IconBar {...defaultProps} projects={[]} />)

  expect(screen.getByText('No projects yet')).toBeInTheDocument()
  expect(screen.getByText('Create your first project')).toBeInTheDocument()
})
```

**IB-06: Renders activity bar at bottom**
```typescript
it('renders activity bar at bottom', () => {
  render(<IconBar {...defaultProps} />)

  const activityBar = screen.getByTestId('activity-bar')
  expect(activityBar).toBeInTheDocument()
})
```

**IB-07: Renders add project button**
```typescript
it('renders add project button with keyboard shortcut tooltip', () => {
  render(<IconBar {...defaultProps} />)

  const addButton = screen.getByTitle('New project (⌘⇧P)')
  expect(addButton).toBeInTheDocument()
  expect(addButton).toHaveClass('add-project-icon')
})
```

**IB-08: Shows inbox count badge when unassigned notes exist**
```typescript
it('shows inbox count badge when unassigned notes exist', () => {
  const notes = [
    { id: 'note1', project_id: null, deleted_at: null },
    { id: 'note2', project_id: null, deleted_at: null },
    { id: 'note3', project_id: 'proj1', deleted_at: null }
  ]

  render(<IconBar {...defaultProps} notes={notes} />)

  const inboxButton = screen.getByTestId('inbox-btn')
  expect(within(inboxButton).getByText('2')).toBeInTheDocument()
})
```

---

#### 2. Expanded State Indicators (6 tests)

**IB-09: Highlights Inbox button when expanded**
```typescript
it('highlights Inbox button when expanded', () => {
  const expandedIcon = { type: 'vault' as const, id: 'inbox' }

  render(<IconBar {...defaultProps} expandedIcon={expandedIcon} />)

  const inboxButton = screen.getByTestId('inbox-btn')
  expect(inboxButton).toHaveClass('expanded')
})
```

**IB-10: Highlights smart icon when expanded**
```typescript
it('highlights smart icon when expanded', () => {
  const expandedIcon = { type: 'smart' as const, id: 'research' }

  render(<IconBar {...defaultProps} expandedIcon={expandedIcon} />)

  const researchButton = screen.getByTestId('smart-icon-research')
  expect(researchButton).toHaveClass('expanded')
})
```

**IB-11: Highlights pinned project icon when expanded**
```typescript
it('highlights pinned project icon when expanded', () => {
  const projects = [{ id: 'proj1', name: 'Project 1', type: 'research' }]
  const expandedIcon = { type: 'vault' as const, id: 'proj1' }

  render(<IconBar {...defaultProps} projects={projects} expandedIcon={expandedIcon} />)

  const projectButton = screen.getByTestId('project-icon-proj1')
  expect(projectButton).toHaveClass('expanded')
})
```

**IB-12: Shows 3px accent indicator on expanded icon**
```typescript
it('shows 3px accent indicator on expanded icon', () => {
  const expandedIcon = { type: 'vault' as const, id: 'inbox' }

  render(<IconBar {...defaultProps} expandedIcon={expandedIcon} />)

  const inboxButton = screen.getByTestId('inbox-btn')
  const indicator = inboxButton.querySelector('.active-indicator')

  expect(indicator).toBeInTheDocument()
})
```

**IB-13: Only one icon has expanded state at a time**
```typescript
it('only one icon has expanded state at a time', () => {
  const projects = [{ id: 'proj1', name: 'Project 1', type: 'research' }]
  const expandedIcon = { type: 'smart' as const, id: 'research' }

  render(<IconBar {...defaultProps} projects={projects} expandedIcon={expandedIcon} />)

  const inboxButton = screen.getByTestId('inbox-btn')
  const researchButton = screen.getByTestId('smart-icon-research')
  const projectButton = screen.getByTestId('project-icon-proj1')

  expect(inboxButton).not.toHaveClass('expanded')
  expect(researchButton).toHaveClass('expanded')
  expect(projectButton).not.toHaveClass('expanded')
})
```

**IB-14: Removes expanded state when expandedIcon is null**
```typescript
it('removes expanded state when expandedIcon is null', () => {
  const { rerender } = render(<IconBar {...defaultProps} expandedIcon={{ type: 'vault', id: 'inbox' }} />)

  expect(screen.getByTestId('inbox-btn')).toHaveClass('expanded')

  rerender(<IconBar {...defaultProps} expandedIcon={null} />)

  expect(screen.getByTestId('inbox-btn')).not.toHaveClass('expanded')
})
```

---

#### 3. Click Interactions (6 tests)

**IB-15: Calls onToggleVault when Inbox clicked**
```typescript
it('calls onToggleVault with "inbox" when Inbox clicked', () => {
  const onToggleVault = vi.fn()

  render(<IconBar {...defaultProps} onToggleVault={onToggleVault} />)

  fireEvent.click(screen.getByTestId('inbox-btn'))

  expect(onToggleVault).toHaveBeenCalledWith('inbox')
  expect(onToggleVault).toHaveBeenCalledTimes(1)
})
```

**IB-16: Calls onToggleSmartIcon when smart icon clicked**
```typescript
it('calls onToggleSmartIcon with icon id when smart icon clicked', () => {
  const onToggleSmartIcon = vi.fn()

  render(<IconBar {...defaultProps} onToggleSmartIcon={onToggleSmartIcon} />)

  fireEvent.click(screen.getByTestId('smart-icon-research'))

  expect(onToggleSmartIcon).toHaveBeenCalledWith('research')
  expect(onToggleSmartIcon).toHaveBeenCalledTimes(1)
})
```

**IB-17: Calls onToggleVault when pinned project icon clicked**
```typescript
it('calls onToggleVault with project id when pinned project clicked', () => {
  const projects = [{ id: 'proj1', name: 'Project 1', type: 'research' }]
  const onToggleVault = vi.fn()

  render(<IconBar {...defaultProps} projects={projects} onToggleVault={onToggleVault} />)

  fireEvent.click(screen.getByTestId('project-icon-proj1'))

  expect(onToggleVault).toHaveBeenCalledWith('proj1')
  expect(onToggleVault).toHaveBeenCalledTimes(1)
})
```

**IB-18: Calls onCreateProject when add project button clicked**
```typescript
it('calls onCreateProject when add project button clicked', () => {
  const onCreateProject = vi.fn()

  render(<IconBar {...defaultProps} onCreateProject={onCreateProject} />)

  fireEvent.click(screen.getByTitle('New project (⌘⇧P)'))

  expect(onCreateProject).toHaveBeenCalledTimes(1)
})
```

**IB-19: Calls onCreateProject when empty state action clicked**
```typescript
it('calls onCreateProject when empty state action clicked', () => {
  const onCreateProject = vi.fn()

  render(<IconBar {...defaultProps} projects={[]} onCreateProject={onCreateProject} />)

  fireEvent.click(screen.getByText('Create Project'))

  expect(onCreateProject).toHaveBeenCalledTimes(1)
})
```

**IB-20: Activity bar click handlers work correctly**
```typescript
it('forwards activity bar click handlers correctly', () => {
  const onSearch = vi.fn()
  const onDaily = vi.fn()
  const onSettings = vi.fn()

  render(<IconBar {...defaultProps} onSearch={onSearch} onDaily={onDaily} onSettings={onSettings} />)

  // Click each activity bar item
  fireEvent.click(screen.getByTitle(/search/i))
  expect(onSearch).toHaveBeenCalledTimes(1)

  fireEvent.click(screen.getByTitle(/daily/i))
  expect(onDaily).toHaveBeenCalledTimes(1)

  fireEvent.click(screen.getByTitle(/settings/i))
  expect(onSettings).toHaveBeenCalledTimes(1)
})
```

---

#### 4. Drag and Drop (6 tests)

**IB-21: Pinned project icons are draggable**
```typescript
it('pinned project icons have draggable attribute', () => {
  const projects = [{ id: 'proj1', name: 'Project 1', type: 'research' }]

  render(<IconBar {...defaultProps} projects={projects} />)

  const projectButton = screen.getByTestId('project-icon-proj1')
  expect(projectButton).toHaveAttribute('draggable', 'true')
})
```

**IB-22: Adds dragging class during drag**
```typescript
it('adds dragging class to project icon during drag', () => {
  const projects = [
    { id: 'proj1', name: 'First', type: 'research' },
    { id: 'proj2', name: 'Second', type: 'teaching' }
  ]

  render(<IconBar {...defaultProps} projects={projects} />)

  const proj1Button = screen.getByTestId('project-icon-proj1')

  fireEvent.dragStart(proj1Button)

  expect(proj1Button).toHaveClass('dragging')
})
```

**IB-23: Adds drag-over class to drop target**
```typescript
it('adds drag-over class to drop target during drag over', () => {
  const projects = [
    { id: 'proj1', name: 'First', type: 'research' },
    { id: 'proj2', name: 'Second', type: 'teaching' }
  ]

  render(<IconBar {...defaultProps} projects={projects} />)

  const proj1Button = screen.getByTestId('project-icon-proj1')
  const proj2Button = screen.getByTestId('project-icon-proj2')

  fireEvent.dragStart(proj1Button)
  fireEvent.dragOver(proj2Button)

  expect(proj2Button).toHaveClass('drag-over')
})
```

**IB-24: Reorders pinned vaults on successful drop**
```typescript
it('calls reorderPinnedVaults with correct indices on drop', async () => {
  const projects = [
    { id: 'proj1', name: 'First', type: 'research' },
    { id: 'proj2', name: 'Second', type: 'teaching' }
  ]

  const mockReorder = vi.fn()
  // Mock useAppViewStore.reorderPinnedVaults

  render(<IconBar {...defaultProps} projects={projects} />)

  const proj1Button = screen.getByTestId('project-icon-proj1')
  const proj2Button = screen.getByTestId('project-icon-proj2')

  fireEvent.dragStart(proj1Button)
  fireEvent.dragOver(proj2Button)
  fireEvent.drop(proj2Button)

  expect(mockReorder).toHaveBeenCalledWith(1, 2) // +1 offset for Inbox
})
```

**IB-25: Adds drop-success animation on successful drop**
```typescript
it('adds drop-success animation class on successful drop', async () => {
  const projects = [
    { id: 'proj1', name: 'First', type: 'research' },
    { id: 'proj2', name: 'Second', type: 'teaching' }
  ]

  render(<IconBar {...defaultProps} projects={projects} />)

  const proj1Button = screen.getByTestId('project-icon-proj1')
  const proj2Button = screen.getByTestId('project-icon-proj2')

  fireEvent.dragStart(proj1Button)
  fireEvent.drop(proj2Button)

  expect(proj2Button).toHaveClass('drop-success')

  // Should remove after 300ms
  await waitFor(() => {
    expect(proj2Button).not.toHaveClass('drop-success')
  }, { timeout: 400 })
})
```

**IB-26: Clears drag state on drag end**
```typescript
it('removes dragging and drag-over classes on drag end', () => {
  const projects = [
    { id: 'proj1', name: 'First', type: 'research' },
    { id: 'proj2', name: 'Second', type: 'teaching' }
  ]

  render(<IconBar {...defaultProps} projects={projects} />)

  const proj1Button = screen.getByTestId('project-icon-proj1')
  const proj2Button = screen.getByTestId('project-icon-proj2')

  fireEvent.dragStart(proj1Button)
  fireEvent.dragOver(proj2Button)

  expect(proj1Button).toHaveClass('dragging')
  expect(proj2Button).toHaveClass('drag-over')

  fireEvent.dragEnd(proj1Button)

  expect(proj1Button).not.toHaveClass('dragging')
  expect(proj2Button).not.toHaveClass('drag-over')
})
```

---

#### 5. Badge and Count Display (4 tests)

**IB-27: Shows note count badge on project icons**
```typescript
it('shows note count badge on project icons with notes', () => {
  const projects = [{ id: 'proj1', name: 'Project 1', type: 'research' }]
  const notes = [
    { id: 'note1', project_id: 'proj1', deleted_at: null },
    { id: 'note2', project_id: 'proj1', deleted_at: null },
    { id: 'note3', project_id: 'proj2', deleted_at: null }
  ]

  render(<IconBar {...defaultProps} projects={projects} notes={notes} />)

  const badge = screen.getByTestId('project-badge-proj1')
  expect(badge).toHaveTextContent('2')
})
```

**IB-28: Shows "99+" for note counts over 99**
```typescript
it('shows "99+" for note counts exceeding 99', () => {
  const projects = [{ id: 'proj1', name: 'Project 1', type: 'research' }]
  const notes = Array.from({ length: 150 }, (_, i) => ({
    id: `note${i}`,
    project_id: 'proj1',
    deleted_at: null
  }))

  render(<IconBar {...defaultProps} projects={projects} notes={notes} />)

  const badge = screen.getByTestId('project-badge-proj1')
  expect(badge).toHaveTextContent('99+')
})
```

**IB-29: Does not show badge when note count is zero**
```typescript
it('does not show badge when project has zero notes', () => {
  const projects = [{ id: 'proj1', name: 'Project 1', type: 'research' }]
  const notes = []

  render(<IconBar {...defaultProps} projects={projects} notes={notes} />)

  const badge = screen.queryByTestId('project-badge-proj1')
  expect(badge).not.toBeInTheDocument()
})
```

**IB-30: Excludes deleted notes from count**
```typescript
it('excludes deleted notes from badge count', () => {
  const projects = [{ id: 'proj1', name: 'Project 1', type: 'research' }]
  const notes = [
    { id: 'note1', project_id: 'proj1', deleted_at: null },
    { id: 'note2', project_id: 'proj1', deleted_at: Date.now() }, // deleted
    { id: 'note3', project_id: 'proj1', deleted_at: null }
  ]

  render(<IconBar {...defaultProps} projects={projects} notes={notes} />)

  const badge = screen.getByTestId('project-badge-proj1')
  expect(badge).toHaveTextContent('2') // Only counts 2 non-deleted notes
})
```

---

## Test Plan for ExpandedIconPanel Component

### Component Signature

```typescript
function ExpandedIconPanel({
  projects: Project[]
  notes: Note[]
  expandedIcon: ExpandedIconType
  mode: 'compact' | 'card'
  width: number
  onToggleMode: () => void
  onClose: () => void
  onSelectProject: (id: string | null) => void
  onSelectNote: (id: string) => void
  onNewNote: (projectId: string) => void
  onCreateProject?: () => void
  // ... context menu handlers
}): JSX.Element | null
```

### Test Categories

#### 1. Conditional Rendering (4 tests)

**EIP-01: Returns null when expandedIcon is null**
```typescript
it('returns null when expandedIcon is null', () => {
  const { container } = render(<ExpandedIconPanel {...defaultProps} expandedIcon={null} />)

  expect(container).toBeEmptyDOMElement()
})
```

**EIP-02: Renders panel when expandedIcon is set**
```typescript
it('renders panel when expandedIcon is set', () => {
  const expandedIcon = { type: 'vault' as const, id: 'inbox' }

  render(<ExpandedIconPanel {...defaultProps} expandedIcon={expandedIcon} />)

  expect(screen.getByTestId('expanded-icon-panel')).toBeInTheDocument()
})
```

**EIP-03: Calculates panel width correctly (sidebarWidth - 48)**
```typescript
it('calculates panel width as sidebarWidth minus 48px', () => {
  const expandedIcon = { type: 'vault' as const, id: 'inbox' }
  const width = 288 // 240 compact + 48 icon bar

  const { container } = render(
    <ExpandedIconPanel {...defaultProps} expandedIcon={expandedIcon} width={width} />
  )

  const panel = container.querySelector('.expanded-icon-panel')
  expect(panel).toHaveStyle({ width: '240px' }) // 288 - 48
})
```

**EIP-04: Updates width reactively when prop changes**
```typescript
it('updates panel width when width prop changes', () => {
  const expandedIcon = { type: 'vault' as const, id: 'inbox' }

  const { container, rerender } = render(
    <ExpandedIconPanel {...defaultProps} expandedIcon={expandedIcon} width={288} />
  )

  let panel = container.querySelector('.expanded-icon-panel')
  expect(panel).toHaveStyle({ width: '240px' })

  rerender(<ExpandedIconPanel {...defaultProps} expandedIcon={expandedIcon} width={368} />)

  panel = container.querySelector('.expanded-icon-panel')
  expect(panel).toHaveStyle({ width: '320px' })
})
```

---

#### 2. Content Type Detection (6 tests)

**EIP-05: Shows Inbox label when expandedIcon is inbox vault**
```typescript
it('shows "Inbox" label when expanded icon is inbox', () => {
  const expandedIcon = { type: 'vault' as const, id: 'inbox' }

  render(<ExpandedIconPanel {...defaultProps} expandedIcon={expandedIcon} />)

  expect(screen.getByText('Inbox')).toBeInTheDocument()
})
```

**EIP-06: Shows project name when expandedIcon is pinned project**
```typescript
it('shows project name when expanded icon is pinned project', () => {
  const projects = [{ id: 'proj1', name: 'Research Project', type: 'research' }]
  const expandedIcon = { type: 'vault' as const, id: 'proj1' }

  render(<ExpandedIconPanel {...defaultProps} projects={projects} expandedIcon={expandedIcon} />)

  expect(screen.getByText('Research Project')).toBeInTheDocument()
})
```

**EIP-07: Shows smart icon label when expandedIcon is smart icon**
```typescript
it('shows smart icon label when expanded icon is smart icon', () => {
  const expandedIcon = { type: 'smart' as const, id: 'research' }

  // Mock smartIcons in useAppViewStore
  const smartIcons = [{ id: 'research', label: 'Research Projects', projectType: 'research' }]

  render(<ExpandedIconPanel {...defaultProps} expandedIcon={expandedIcon} />)

  expect(screen.getByText('Research Projects')).toBeInTheDocument()
})
```

**EIP-08: Filters projects by type for smart icons**
```typescript
it('filters projects by project type for smart icons', () => {
  const projects = [
    { id: 'proj1', name: 'Research 1', type: 'research' },
    { id: 'proj2', name: 'Teaching 1', type: 'teaching' },
    { id: 'proj3', name: 'Research 2', type: 'research' }
  ]
  const expandedIcon = { type: 'smart' as const, id: 'research' }

  // Mock smartIcons
  const smartIcons = [{ id: 'research', projectType: 'research' }]

  render(<ExpandedIconPanel {...defaultProps} projects={projects} expandedIcon={expandedIcon} />)

  // CompactListView should receive only research projects
  expect(screen.getByText('Research 1')).toBeInTheDocument()
  expect(screen.getByText('Research 2')).toBeInTheDocument()
  expect(screen.queryByText('Teaching 1')).not.toBeInTheDocument()
})
```

**EIP-09: Shows all projects for pinned project vault**
```typescript
it('shows all projects when expanded icon is pinned project', () => {
  const projects = [
    { id: 'proj1', name: 'Research 1', type: 'research' },
    { id: 'proj2', name: 'Teaching 1', type: 'teaching' }
  ]
  const expandedIcon = { type: 'vault' as const, id: 'proj1' }

  render(<ExpandedIconPanel {...defaultProps} projects={projects} expandedIcon={expandedIcon} />)

  // Should show all projects, not filtered
  expect(screen.getByText('Research 1')).toBeInTheDocument()
  expect(screen.getByText('Teaching 1')).toBeInTheDocument()
})
```

**EIP-10: Sets showInboxNotes flag only for inbox**
```typescript
it('sets showInboxNotes true only when expanded icon is inbox', () => {
  // Test inbox
  const inboxProps = {
    ...defaultProps,
    expandedIcon: { type: 'vault' as const, id: 'inbox' }
  }

  const { rerender } = render(<ExpandedIconPanel {...inboxProps} />)

  // CompactListView should receive showInboxNotes=true
  expect(screen.getByTestId('compact-list-view')).toHaveAttribute('data-show-inbox', 'true')

  // Test pinned project
  rerender(<ExpandedIconPanel {...defaultProps} expandedIcon={{ type: 'vault', id: 'proj1' }} />)

  expect(screen.getByTestId('compact-list-view')).toHaveAttribute('data-show-inbox', 'false')
})
```

---

#### 3. Mode Toggle (4 tests)

**EIP-11: Renders LayoutGrid icon in compact mode**
```typescript
it('renders LayoutGrid icon when mode is compact', () => {
  const expandedIcon = { type: 'vault' as const, id: 'inbox' }

  render(<ExpandedIconPanel {...defaultProps} expandedIcon={expandedIcon} mode="compact" />)

  const toggleButton = screen.getByTitle('Switch to card view')
  const icon = within(toggleButton).getByTestId('layout-grid-icon')

  expect(icon).toBeInTheDocument()
})
```

**EIP-12: Renders LayoutList icon in card mode**
```typescript
it('renders LayoutList icon when mode is card', () => {
  const expandedIcon = { type: 'vault' as const, id: 'inbox' }

  render(<ExpandedIconPanel {...defaultProps} expandedIcon={expandedIcon} mode="card" />)

  const toggleButton = screen.getByTitle('Switch to compact view')
  const icon = within(toggleButton).getByTestId('layout-list-icon')

  expect(icon).toBeInTheDocument()
})
```

**EIP-13: Calls onToggleMode when mode toggle clicked**
```typescript
it('calls onToggleMode when mode toggle button clicked', () => {
  const onToggleMode = vi.fn()
  const expandedIcon = { type: 'vault' as const, id: 'inbox' }

  render(<ExpandedIconPanel {...defaultProps} expandedIcon={expandedIcon} onToggleMode={onToggleMode} />)

  fireEvent.click(screen.getByTitle(/switch to/i))

  expect(onToggleMode).toHaveBeenCalledTimes(1)
})
```

**EIP-14: Shows correct tooltip for current mode**
```typescript
it('shows "Switch to card view" in compact mode', () => {
  const expandedIcon = { type: 'vault' as const, id: 'inbox' }

  render(<ExpandedIconPanel {...defaultProps} expandedIcon={expandedIcon} mode="compact" />)

  expect(screen.getByTitle('Switch to card view')).toBeInTheDocument()
})

it('shows "Switch to compact view" in card mode', () => {
  const expandedIcon = { type: 'vault' as const, id: 'inbox' }

  render(<ExpandedIconPanel {...defaultProps} expandedIcon={expandedIcon} mode="card" />)

  expect(screen.getByTitle('Switch to compact view')).toBeInTheDocument()
})
```

---

#### 4. View Switching (4 tests)

**EIP-15: Renders CompactListView in compact mode**
```typescript
it('renders CompactListView when mode is compact', () => {
  const expandedIcon = { type: 'vault' as const, id: 'inbox' }

  render(<ExpandedIconPanel {...defaultProps} expandedIcon={expandedIcon} mode="compact" />)

  expect(screen.getByTestId('compact-list-view')).toBeInTheDocument()
  expect(screen.queryByTestId('card-grid-view')).not.toBeInTheDocument()
})
```

**EIP-16: Renders CardGridView in card mode**
```typescript
it('renders CardGridView when mode is card', () => {
  const expandedIcon = { type: 'vault' as const, id: 'inbox' }

  render(<ExpandedIconPanel {...defaultProps} expandedIcon={expandedIcon} mode="card" />)

  expect(screen.getByTestId('card-grid-view')).toBeInTheDocument()
  expect(screen.queryByTestId('compact-list-view')).not.toBeInTheDocument()
})
```

**EIP-17: Switches from CompactListView to CardGridView on mode change**
```typescript
it('switches views when mode prop changes', () => {
  const expandedIcon = { type: 'vault' as const, id: 'inbox' }

  const { rerender } = render(
    <ExpandedIconPanel {...defaultProps} expandedIcon={expandedIcon} mode="compact" />
  )

  expect(screen.getByTestId('compact-list-view')).toBeInTheDocument()

  rerender(<ExpandedIconPanel {...defaultProps} expandedIcon={expandedIcon} mode="card" />)

  expect(screen.queryByTestId('compact-list-view')).not.toBeInTheDocument()
  expect(screen.getByTestId('card-grid-view')).toBeInTheDocument()
})
```

**EIP-18: Preserves scroll position when switching modes**
```typescript
it('preserves scroll position when switching between modes', async () => {
  const expandedIcon = { type: 'vault' as const, id: 'inbox' }
  const notes = Array.from({ length: 50 }, (_, i) => ({
    id: `note${i}`,
    title: `Note ${i}`,
    project_id: null
  }))

  const { rerender } = render(
    <ExpandedIconPanel {...defaultProps} expandedIcon={expandedIcon} mode="compact" notes={notes} />
  )

  // Scroll to bottom
  const panel = screen.getByTestId('expanded-icon-panel')
  fireEvent.scroll(panel, { target: { scrollTop: 500 } })

  const scrollTop = panel.scrollTop

  // Switch to card mode
  rerender(<ExpandedIconPanel {...defaultProps} expandedIcon={expandedIcon} mode="card" notes={notes} />)

  // Scroll position should be preserved
  await waitFor(() => {
    expect(panel.scrollTop).toBe(scrollTop)
  })
})
```

---

#### 5. Close Button (2 tests)

**EIP-19: Renders close button**
```typescript
it('renders close button with correct tooltip', () => {
  const expandedIcon = { type: 'vault' as const, id: 'inbox' }

  render(<ExpandedIconPanel {...defaultProps} expandedIcon={expandedIcon} />)

  expect(screen.getByTitle('Collapse')).toBeInTheDocument()
  expect(screen.getByLabelText('Collapse panel')).toBeInTheDocument()
})
```

**EIP-20: Calls onClose when close button clicked**
```typescript
it('calls onClose when close button clicked', () => {
  const onClose = vi.fn()
  const expandedIcon = { type: 'vault' as const, id: 'inbox' }

  render(<ExpandedIconPanel {...defaultProps} expandedIcon={expandedIcon} onClose={onClose} />)

  fireEvent.click(screen.getByTitle('Collapse'))

  expect(onClose).toHaveBeenCalledTimes(1)
})
```

---

## Performance Tests

### Test Categories

#### 1. Re-render Optimization (4 tests)

**PERF-01: useMemo prevents unnecessary re-computation of content**
```typescript
it('does not recompute content when unrelated props change', () => {
  const computeSpy = vi.fn()

  // Mock useMemo to track calls
  const { rerender } = render(<ExpandedIconPanel {...defaultProps} />)

  // Change unrelated prop (width)
  rerender(<ExpandedIconPanel {...defaultProps} width={320} />)

  // Content computation should not run (useMemo dependency check)
  expect(computeSpy).toHaveBeenCalledTimes(1) // Initial render only
})
```

**PERF-02: Only re-renders when expandedIcon changes**
```typescript
it('only re-renders when expandedIcon prop changes', () => {
  const renderSpy = vi.fn()

  const { rerender } = render(<ExpandedIconPanel {...defaultProps} />)

  // Change mode (should re-render for view switch)
  rerender(<ExpandedIconPanel {...defaultProps} mode="card" />)

  // Change expandedIcon (should re-render for content change)
  rerender(<ExpandedIconPanel {...defaultProps} expandedIcon={{ type: 'smart', id: 'research' }} />)

  expect(renderSpy).toHaveBeenCalledTimes(3) // Initial + mode + expandedIcon
})
```

**PERF-03: Handles large project lists efficiently (100+ projects)**
```typescript
it('renders 100+ projects without performance degradation', async () => {
  const projects = Array.from({ length: 150 }, (_, i) => ({
    id: `proj${i}`,
    name: `Project ${i}`,
    type: 'research'
  }))

  const expandedIcon = { type: 'smart' as const, id: 'research' }

  const start = performance.now()

  render(<ExpandedIconPanel {...defaultProps} projects={projects} expandedIcon={expandedIcon} />)

  const renderTime = performance.now() - start

  // Should render in under 500ms
  expect(renderTime).toBeLessThan(500)
})
```

**PERF-04: Handles large note lists efficiently (500+ notes)**
```typescript
it('renders 500+ notes without performance degradation', async () => {
  const notes = Array.from({ length: 600 }, (_, i) => ({
    id: `note${i}`,
    title: `Note ${i}`,
    project_id: null,
    deleted_at: null
  }))

  const expandedIcon = { type: 'vault' as const, id: 'inbox' }

  const start = performance.now()

  render(<ExpandedIconPanel {...defaultProps} notes={notes} expandedIcon={expandedIcon} />)

  const renderTime = performance.now() - start

  // Should render in under 1 second
  expect(renderTime).toBeLessThan(1000)
})
```

---

## Accessibility Tests

### Test Categories

#### 1. ARIA Labels (4 tests)

**A11Y-01: Mode toggle button has aria-label**
```typescript
it('mode toggle button has descriptive aria-label', () => {
  const expandedIcon = { type: 'vault' as const, id: 'inbox' }

  render(<ExpandedIconPanel {...defaultProps} expandedIcon={expandedIcon} mode="compact" />)

  const toggleButton = screen.getByLabelText('Switch to card view')
  expect(toggleButton).toBeInTheDocument()
})
```

**A11Y-02: Close button has aria-label**
```typescript
it('close button has descriptive aria-label', () => {
  const expandedIcon = { type: 'vault' as const, id: 'inbox' }

  render(<ExpandedIconPanel {...defaultProps} expandedIcon={expandedIcon} />)

  const closeButton = screen.getByLabelText('Collapse panel')
  expect(closeButton).toBeInTheDocument()
})
```

**A11Y-03: Icon buttons have aria-labels**
```typescript
it('all icon buttons have descriptive aria-labels', () => {
  const projects = [{ id: 'proj1', name: 'Project 1', type: 'research' }]

  render(<IconBar {...defaultProps} projects={projects} />)

  // Check Inbox
  expect(screen.getByLabelText(/inbox/i)).toBeInTheDocument()

  // Check smart icons
  expect(screen.getByLabelText(/research projects/i)).toBeInTheDocument()

  // Check pinned project
  expect(screen.getByLabelText(/project 1/i)).toBeInTheDocument()
})
```

**A11Y-04: Activity bar items have aria-labels**
```typescript
it('activity bar items have descriptive aria-labels', () => {
  render(<IconBar {...defaultProps} />)

  expect(screen.getByLabelText(/search/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/recent notes/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/daily note/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/settings/i)).toBeInTheDocument()
})
```

---

## Summary

### Proposed Test Suite Structure

```
src/renderer/src/__tests__/
├── IconBar.component.test.tsx (30 tests)
│   ├── Basic Rendering (8 tests)
│   ├── Expanded State Indicators (6 tests)
│   ├── Click Interactions (6 tests)
│   ├── Drag and Drop (6 tests)
│   └── Badge and Count Display (4 tests)
│
├── ExpandedIconPanel.component.test.tsx (20 tests)
│   ├── Conditional Rendering (4 tests)
│   ├── Content Type Detection (6 tests)
│   ├── Mode Toggle (4 tests)
│   ├── View Switching (4 tests)
│   └── Close Button (2 tests)
│
├── IconCentric.performance.test.tsx (4 tests)
│   └── Re-render Optimization (4 tests)
│
└── IconCentric.accessibility.test.tsx (4 tests)
    └── ARIA Labels (4 tests)
```

### Coverage Summary

| Category | Current | Proposed | Total |
|----------|---------|----------|-------|
| State Management | 48 | +0 | 48 |
| E2E Integration | 16 | +0 | 16 |
| Component Rendering | 0 | +30 | 30 |
| Component Behavior | 0 | +20 | 20 |
| Performance | 0 | +4 | 4 |
| Accessibility | 0 | +4 | 4 |
| **TOTAL** | **64** | **+58** | **122** |

### Implementation Priority

**High Priority (Must Have):**
1. IconBar component tests (30 tests) - Core UI component
2. ExpandedIconPanel component tests (20 tests) - Core UI component

**Medium Priority (Should Have):**
3. Performance tests (4 tests) - Ensure scalability
4. Accessibility tests (4 tests) - Ensure usability

**Low Priority (Nice to Have):**
5. Visual regression tests (CSS animations)
6. Integration tests with MissionSidebar parent

---

## Implementation Guide

### Step 1: Create Test Files

```bash
# Create new test files
touch src/renderer/src/__tests__/IconBar.component.test.tsx
touch src/renderer/src/__tests__/ExpandedIconPanel.component.test.tsx
touch src/renderer/src/__tests__/IconCentric.performance.test.tsx
touch src/renderer/src/__tests__/IconCentric.accessibility.test.tsx
```

### Step 2: Set Up Test Utilities

```typescript
// Test utilities for icon-centric tests
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { vi } from 'vitest'
import { useAppViewStore } from '../store/useAppViewStore'

// Mock useAppViewStore
vi.mock('../store/useAppViewStore', () => ({
  useAppViewStore: vi.fn()
}))

// Default props factory
const createDefaultProps = () => ({
  projects: [],
  notes: [],
  expandedIcon: null,
  onToggleVault: vi.fn(),
  onToggleSmartIcon: vi.fn(),
  onSearch: vi.fn(),
  onDaily: vi.fn(),
  onSettings: vi.fn(),
  onSelectNote: vi.fn(),
  onCreateProject: vi.fn()
})
```

### Step 3: Implement Tests Incrementally

**Phase 1:** Basic rendering and interactions (38 tests)
**Phase 2:** Advanced behaviors (drag-drop, performance) (8 tests)
**Phase 3:** Accessibility and polish (4 tests)

### Step 4: Run and Verify

```bash
# Run all tests
npm test

# Run only icon-centric tests
npm test -- IconBar IconCentric ExpandedIconPanel

# Coverage report
npm test -- --coverage
```

---

## Acceptance Criteria

✅ All 58 new tests pass
✅ Zero regressions in existing 64 tests
✅ Code coverage > 95% for IconBar and ExpandedIconPanel
✅ All accessibility tests pass with axe-core
✅ Performance tests complete under threshold

---

**Total Proposed Tests:** 58 additional tests
**Estimated Implementation Time:** 4-6 hours
**Benefits:** Complete coverage of v1.16.0 icon-centric sidebar UI
