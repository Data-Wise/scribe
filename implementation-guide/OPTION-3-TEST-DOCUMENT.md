# Option 3: Test & Document Mission Control

## Step 1: Comprehensive Testing

### Manual Testing Checklist

```bash
cd /Users/dt/projects/dev-tools/scribe
npm run dev
```

#### Icon Mode Tests
- [ ] Sidebar is 48px wide
- [ ] Shows colored dots for projects
- [ ] Active project has visual indicator
- [ ] Hover shows tooltip with project name
- [ ] Click dot switches project
- [ ] "+" button creates new project
- [ ] Expand button switches to compact mode

#### Compact Mode Tests
- [ ] Sidebar is 240px wide (default)
- [ ] Shows project list with names
- [ ] Shows note count and word count
- [ ] Active project highlighted
- [ ] Hover effect on project items
- [ ] Resize handle works (drag right edge)
- [ ] Min width: 200px, Max width: 300px
- [ ] Collapse button switches to icon mode

#### Card Mode Tests
- [ ] Sidebar is 320px wide (default)
- [ ] Shows full project cards
- [ ] Shows progress bars (if implemented)
- [ ] Shows next actions (if implemented)
- [ ] Shows project metadata
- [ ] Resize handle works
- [ ] Min width: 320px, Max width: 500px

#### State Persistence Tests
- [ ] Close and reopen app
- [ ] Sidebar mode is same as before
- [ ] Sidebar width is same as before
- [ ] Active project is same as before

#### Keyboard Shortcuts Tests
- [ ] ⌘0 toggles sidebar (if implemented)
- [ ] ⌘[ cycles mode backward (if implemented)
- [ ] ⌘] cycles mode forward (if implemented)

### Automated Testing

```bash
# Run existing tests
npm test

# Run specific sidebar tests
npm test -- Sidebar.test.tsx
```

## Step 2: Document the Implementation

### Create Architecture Doc

```bash
cat > src/renderer/src/components/sidebar/README.md << 'EOF'
# Mission Sidebar Architecture

## Overview

The Mission Sidebar is a collapsible, mode-switching sidebar that provides quick access to projects.

## Components

### MissionSidebar.tsx
Main container that switches between modes based on `useAppViewStore.sidebarMode`.

### IconBarMode.tsx (48px)
- Minimal view showing only colored dots
- Hover tooltips show project names
- Active project has left indicator bar

### CompactListMode.tsx (240px)
- List view with project names
- Shows note count and word count
- Resizable (200-300px)

### CardViewMode.tsx (320px)
- Rich card view with full metadata
- Shows progress bars and next actions
- Resizable (320-500px)

### StatusDot.tsx
Shared component for colored status indicators.

### ResizeHandle.tsx
Drag handle for resizing compact/card modes.

## State Management

Uses `useAppViewStore` from Zustand:
- `sidebarMode`: 'icon' | 'compact' | 'card'
- `sidebarWidth`: number
- Persisted to localStorage

## Styling

CSS in `src/renderer/src/index.css`:
- `.mission-sidebar` - base styles
- `.mode-icon`, `.mode-compact`, `.mode-card` - mode-specific
- Uses CSS variables from theme system

## Integration

Rendered in `App.tsx` as left sidebar:
```tsx
<MissionSidebar
  projects={projects}
  notes={notes}
  currentProjectId={currentProjectId}
  onSelectProject={selectProject}
  // ... other handlers
/>
```
EOF
```

## Step 3: Create Usage Guide

```bash
cat > docs/MISSION-SIDEBAR-GUIDE.md << 'EOF'
# Mission Sidebar User Guide

## What is Mission Sidebar?

Mission Sidebar gives you three views of your projects:

### Icon Mode (⌘[)
Minimal 48px sidebar showing colored dots. Perfect for maximum writing space.

### Compact Mode (⌘])  
240px sidebar with project list. Balance between context and space.

### Card Mode (⌘])
320px+ sidebar with rich project cards. Full context at a glance.

## Switching Modes

- Click collapse/expand buttons in sidebar
- Use keyboard: ⌘[ (previous mode), ⌘] (next mode)
- Settings → Appearance → Sidebar Mode

## Resizing

In Compact and Card modes:
- Hover over right edge of sidebar
- Drag left/right to resize
- Min/max widths enforced

## State Persistence

Your sidebar mode and width are saved automatically.
Restored when you reopen Scribe.
EOF
```

## Step 4: Report Issues

If you find bugs, create issue tickets:

```bash
cat > MISSION-SIDEBAR-ISSUES.md << 'EOF'
# Known Issues

## Issue 1: [Brief description]
**Severity:** High/Medium/Low
**Steps to reproduce:**
1. Step one
2. Step two
**Expected:** What should happen
**Actual:** What actually happens
**Console output:** [paste errors]

## Issue 2: ...
EOF
```

## Step 5: Create PR Checklist

```bash
cat > MISSION-SIDEBAR-PR-CHECKLIST.md << 'EOF'
# Mission Sidebar PR Checklist

Before merging to main:

## Code Quality
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] All tests passing
- [ ] No linter warnings

## Functionality
- [ ] All 3 modes render correctly
- [ ] Mode switching works
- [ ] Resize works in compact/card
- [ ] State persists across restarts
- [ ] Keyboard shortcuts work

## UX
- [ ] Smooth transitions
- [ ] Clear visual feedback
- [ ] Accessible (ARIA labels)
- [ ] Works on different screen sizes

## Documentation
- [ ] Architecture doc created
- [ ] User guide created
- [ ] Comments in complex code
- [ ] Type definitions clear

## Testing
- [ ] Manual testing complete
- [ ] Automated tests added
- [ ] Edge cases tested
EOF
```
