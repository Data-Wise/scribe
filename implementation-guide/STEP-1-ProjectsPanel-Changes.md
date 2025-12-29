# Step 1: Modify ProjectsPanel to Support Three Modes

## Changes to ProjectsPanel.tsx

### 1. Import sidebarMode from store

```typescript
// Add to imports at top of file
import { useAppViewStore, SIDEBAR_WIDTHS } from '../store/useAppViewStore'
```

### 2. Replace width prop with mode-aware width

```typescript
// REMOVE this from props interface:
// width: number

// ADD to component body (after props destructuring):
const { sidebarMode, sidebarWidth } = useAppViewStore()

// Calculate actual width based on mode
const actualWidth = sidebarMode === 'icon' 
  ? SIDEBAR_WIDTHS.icon
  : sidebarWidth
```

### 3. Add conditional rendering based on mode

```typescript
// Replace the entire return statement with this:

if (sidebarMode === 'icon') {
  // Icon mode: 48px, dots only
  return (
    <div
      className="projects-panel-icon flex flex-col items-center border-r border-white/5 bg-nexus-bg-secondary py-4 gap-2"
      style={{ width: SIDEBAR_WIDTHS.icon, minWidth: SIDEBAR_WIDTHS.icon }}
    >
      {sortedProjects.map((project) => (
        <button
          key={project.id}
          onClick={() => onSelectProject(project.id)}
          className={`w-8 h-8 rounded-lg transition-all relative
            ${currentProjectId === project.id
              ? 'ring-2 ring-nexus-accent'
              : 'hover:ring-1 hover:ring-white/20'
            }`}
          style={{ backgroundColor: project.color || '#38bdf8' }}
          title={project.name}
        >
          {currentProjectId === project.id && (
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-nexus-accent rounded-r" />
          )}
        </button>
      ))}
      
      <button
        onClick={onCreateProject}
        className="w-8 h-8 rounded-lg border-2 border-dashed border-white/20 hover:border-nexus-accent transition-colors flex items-center justify-center"
        title="New Project"
      >
        <FolderPlus className="w-4 h-4 text-nexus-text-muted" />
      </button>
    </div>
  )
}

// Compact and Card modes: existing list view
return (
  <div
    className="projects-panel flex flex-col border-r border-white/5 bg-nexus-bg-secondary"
    style={{ width: `${actualWidth}px`, minWidth: `${actualWidth}px` }}
  >
    {/* Existing header and list - NO CHANGES NEEDED */}
    {/* ... rest of existing code ... */}
  </div>
)
```

## Testing

1. Save changes
2. Run `npm run dev`
3. Open Scribe
4. Open browser console
5. Type: `useAppViewStore.getState().setSidebarMode('icon')`
6. Should see 48px sidebar with colored dots
7. Type: `useAppViewStore.getState().setSidebarMode('compact')`
8. Should see normal list view again

## What This Achieves

✅ Icon mode renders correctly (48px with dots)
✅ Compact mode shows existing list
✅ Width controlled by store, not props
✅ Preserves all existing functionality
