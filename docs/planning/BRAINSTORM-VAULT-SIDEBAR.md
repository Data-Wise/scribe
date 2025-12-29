# Brainstorm: Vault Sidebar (Obsidian-style File Tree)

**Generated:** 2025-12-28
**Context:** Sprint 25 Phase 2 - Plan B UI Redesign
**Status:** Planning → Implementation

---

## Overview

Add an Obsidian-style file tree view to the "Notes" tab that displays notes organized hierarchically by project, with expand/collapse functionality.

---

## Current State

### NotesListPanel.tsx
- Flat list of all notes
- Search and sort (Recent/Created/A-Z)
- Right-click context menu
- Drag-and-drop support
- Note preview snippets

### What's Missing
- **No project grouping** - all notes shown flat
- **No folder structure** - no visual hierarchy
- **No expand/collapse** - can't hide/show project contents
- **No tree view** - not Obsidian-like

---

## Design Goals

1. **Obsidian-like UX** - Familiar file tree pattern
2. **Progressive disclosure** - Expand projects to see notes
3. **Quick navigation** - Click to open, right-click for actions
4. **ADHD-friendly** - Visual hierarchy reduces cognitive load
5. **Consistent with left sidebar** - Use same expand/collapse pattern

---

## Proposed Design

### Tree Structure

```
📁 All Notes (42)
├─ 📁 Research (12)
│  ├─ 📄 Paper draft
│  ├─ 📄 Literature review
│  └─ 📄 Methods notes
├─ 📁 Teaching (8)
│  ├─ 📄 Lecture 1
│  └─ 📄 Syllabus
├─ 📁 Personal (5)
│  └─ 📄 Ideas
└─ 📄 Unassigned (17)
   ├─ 📄 Quick note
   └─ 📄 Meeting notes
```

### Visual Elements

| Element | Appearance |
|---------|------------|
| Project folder | 📁 with chevron (▶/▼) |
| Note item | 📄 with title |
| Active note | Highlighted background |
| Note count | Badge in parentheses |
| Indent | 16px per level |

### Interactions

| Action | Result |
|--------|--------|
| Click chevron | Expand/collapse project |
| Click note | Open in editor |
| Right-click note | Context menu |
| Right-click project | Project context menu |
| Double-click note | Open in new tab |
| Drag note | Move to different project |

### View Toggle

Add toggle between:
- **List View** (current) - Flat list with search/sort
- **Tree View** (new) - Hierarchical by project

```
[🗂️ Tree] [≡ List]  🔍 Search...
```

---

## Implementation Plan

### Phase 1: VaultTreeView Component

```typescript
// src/renderer/src/components/sidebar/VaultTreeView.tsx

interface VaultTreeViewProps {
  notes: Note[]
  projects: Project[]
  onSelectNote: (id: string) => void
  onAssignToProject?: (noteId: string, projectId: string | null) => void
  onContextMenu?: (e: React.MouseEvent, noteId: string, projectId?: string) => void
}

interface TreeNode {
  type: 'project' | 'note'
  id: string
  title: string
  children?: TreeNode[]
  note?: Note
  project?: Project
}
```

### Phase 2: State Management

```typescript
// Add to useAppViewStore.ts

interface AppViewState {
  // ... existing
  notesViewMode: 'list' | 'tree'
  expandedProjects: Set<string> // Track which projects are expanded
}
```

### Phase 3: Integration

1. Add view toggle to NotesListPanel header
2. Conditionally render VaultTreeView or flat list
3. Sync expanded state with localStorage
4. Add keyboard navigation (arrow keys)

---

## Technical Details

### Building the Tree Structure

```typescript
function buildTreeStructure(notes: Note[], projects: Project[]): TreeNode[] {
  const tree: TreeNode[] = []
  const projectMap = new Map<string, Note[]>()
  const unassigned: Note[] = []

  // Group notes by project
  notes.forEach(note => {
    if (note.project_id) {
      if (!projectMap.has(note.project_id)) {
        projectMap.set(note.project_id, [])
      }
      projectMap.get(note.project_id)!.push(note)
    } else {
      unassigned.push(note)
    }
  })

  // Create project nodes
  projects.forEach(project => {
    const projectNotes = projectMap.get(project.id) || []
    tree.push({
      type: 'project',
      id: project.id,
      title: project.name,
      project,
      children: projectNotes.map(note => ({
        type: 'note',
        id: note.id,
        title: note.title || 'Untitled',
        note
      }))
    })
  })

  // Add unassigned notes
  if (unassigned.length > 0) {
    tree.push({
      type: 'project',
      id: '__unassigned__',
      title: 'Unassigned',
      children: unassigned.map(note => ({
        type: 'note',
        id: note.id,
        title: note.title || 'Untitled',
        note
      }))
    })
  }

  return tree
}
```

### CSS Classes

```css
.vault-tree {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tree-node {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
}

.tree-node:hover {
  background: rgba(255, 255, 255, 0.05);
}

.tree-node.active {
  background: rgba(var(--accent-rgb), 0.2);
}

.tree-indent {
  width: 16px;
  display: inline-block;
}

.tree-chevron {
  width: 16px;
  transition: transform 150ms ease;
}

.tree-chevron.expanded {
  transform: rotate(90deg);
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `VaultTreeView.tsx` | NEW - Tree view component |
| `NotesListPanel.tsx` | Add view toggle, conditionally render |
| `useAppViewStore.ts` | Add `notesViewMode`, `expandedProjects` |
| `index.css` | Add tree view styles |
| `Sidebar.test.tsx` | Add tests for tree view |

---

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `↓` | Move to next item |
| `↑` | Move to previous item |
| `→` | Expand project / Enter project |
| `←` | Collapse project / Go to parent |
| `Enter` | Open selected note |
| `Space` | Toggle expand/collapse |

---

## Quick Wins

1. ⚡ **View toggle** - Add List/Tree switch (30 min)
2. ⚡ **Basic tree** - Group notes by project (1 hour)
3. ⚡ **Expand/collapse** - Chevron toggle (30 min)
4. 🔧 **Keyboard nav** - Arrow key navigation (1 hour)
5. 🔧 **Persistence** - Remember expanded state (30 min)

---

## Decision Points

1. **Default view**: List (current) or Tree (new)?
   - Recommend: List (preserves existing UX)

2. **Show empty projects**: Yes or hide?
   - Recommend: Show (consistent with sidebar)

3. **Sort within projects**: By title or by date?
   - Recommend: By date (most recent first)

4. **Unassigned section**: At top or bottom?
   - Recommend: Bottom (projects are primary)

---

## Next Steps

1. [ ] Create VaultTreeView.tsx component
2. [ ] Add view toggle to NotesListPanel
3. [ ] Add state for expanded projects
4. [ ] Style the tree view
5. [ ] Add keyboard navigation
6. [ ] Add tests

---

*Created: 2025-12-28*
