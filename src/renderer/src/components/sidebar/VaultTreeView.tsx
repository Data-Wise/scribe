import { useState, useMemo, useCallback } from 'react'
import { ChevronRight, FileText, FolderKanban, FolderOpen, Inbox } from 'lucide-react'
import { Note, Project } from '../../types'
import { NoteContextMenu, useNoteContextMenu } from './NoteContextMenu'

/**
 * VaultTreeView - Obsidian-style file tree for notes
 *
 * Displays notes organized hierarchically by project with expand/collapse.
 * Part of Sprint 25 Phase 2 - Plan B UI Redesign.
 */

interface VaultTreeViewProps {
  notes: Note[]
  projects: Project[]
  onSelectNote: (id: string) => void
  onAssignToProject?: (noteId: string, projectId: string | null) => void
  onMoveToInbox?: (noteId: string) => void
  onDelete?: (noteId: string) => void
  expandedProjects: Set<string>
  onToggleExpand: (projectId: string) => void
}

interface TreeProjectNode {
  type: 'project'
  id: string
  title: string
  project?: Project
  noteCount: number
  notes: Note[]
}

export function VaultTreeView({
  notes,
  projects,
  onSelectNote,
  onAssignToProject,
  onMoveToInbox,
  onDelete,
  expandedProjects,
  onToggleExpand
}: VaultTreeViewProps) {
  const { contextMenu, showContextMenu, hideContextMenu } = useNoteContextMenu()
  const [focusedId, setFocusedId] = useState<string | null>(null)

  // Build tree structure: group notes by project
  const treeNodes = useMemo(() => {
    const projectMap = new Map<string, Note[]>()
    const unassigned: Note[] = []

    // Group notes by project (exclude deleted)
    notes.filter(n => !n.deleted_at).forEach(note => {
      if (note.project_id) {
        if (!projectMap.has(note.project_id)) {
          projectMap.set(note.project_id, [])
        }
        projectMap.get(note.project_id)!.push(note)
      } else {
        unassigned.push(note)
      }
    })

    // Sort notes within each group by updated_at (most recent first)
    const sortNotes = (noteList: Note[]) =>
      [...noteList].sort((a, b) => b.updated_at - a.updated_at)

    // Create project nodes (only projects with notes or active projects)
    const nodes: TreeProjectNode[] = projects
      .filter(p => !p.archived_at)
      .map(project => ({
        type: 'project' as const,
        id: project.id,
        title: project.name,
        project,
        noteCount: projectMap.get(project.id)?.length || 0,
        notes: sortNotes(projectMap.get(project.id) || [])
      }))
      // Sort projects: those with notes first, then alphabetically
      .sort((a, b) => {
        if (a.noteCount > 0 && b.noteCount === 0) return -1
        if (a.noteCount === 0 && b.noteCount > 0) return 1
        return a.title.localeCompare(b.title)
      })

    // Add unassigned section at the bottom if there are unassigned notes
    if (unassigned.length > 0) {
      nodes.push({
        type: 'project',
        id: '__unassigned__',
        title: 'Unassigned',
        project: undefined,
        noteCount: unassigned.length,
        notes: sortNotes(unassigned)
      })
    }

    return nodes
  }, [notes, projects])

  // Total note count
  const totalNotes = useMemo(() =>
    notes.filter(n => !n.deleted_at).length,
    [notes]
  )

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // TODO: Implement full keyboard navigation in future iteration
    if (e.key === 'Escape') {
      setFocusedId(null)
    }
  }, [])

  return (
    <div
      className="vault-tree-view"
      onKeyDown={handleKeyDown}
      role="tree"
      aria-label="Notes organized by project"
    >
      {/* Tree header */}
      <div className="vault-tree-header">
        <FolderOpen size={14} />
        <span className="vault-tree-title">All Notes</span>
        <span className="vault-tree-count">{totalNotes}</span>
      </div>

      {/* Tree content */}
      <div className="vault-tree-content">
        {treeNodes.length === 0 ? (
          <div className="vault-tree-empty">
            <FileText size={20} className="empty-icon" />
            <span>No notes yet</span>
          </div>
        ) : (
          treeNodes.map(node => (
            <ProjectTreeNode
              key={node.id}
              node={node}
              isExpanded={expandedProjects.has(node.id)}
              onToggleExpand={() => onToggleExpand(node.id)}
              onSelectNote={onSelectNote}
              onNoteContextMenu={(e, noteId, projectId) => showContextMenu(e, noteId, projectId)}
              focusedId={focusedId}
              onFocus={setFocusedId}
              projects={projects}
            />
          ))
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <NoteContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          noteId={contextMenu.noteId}
          currentProjectId={contextMenu.currentProjectId}
          projects={projects}
          onClose={hideContextMenu}
          onAssignToProject={onAssignToProject || (() => {})}
          onMoveToInbox={onMoveToInbox}
          onDelete={onDelete}
        />
      )}
    </div>
  )
}

// =============================================================================
// Project Tree Node
// =============================================================================

interface ProjectTreeNodeProps {
  node: TreeProjectNode
  isExpanded: boolean
  onToggleExpand: () => void
  onSelectNote: (id: string) => void
  onNoteContextMenu: (e: React.MouseEvent, noteId: string, projectId?: string) => void
  focusedId: string | null
  onFocus: (id: string | null) => void
  projects: Project[]
}

function ProjectTreeNode({
  node,
  isExpanded,
  onToggleExpand,
  onSelectNote,
  onNoteContextMenu,
  focusedId,
  onFocus,
  projects
}: ProjectTreeNodeProps) {
  const isUnassigned = node.id === '__unassigned__'
  const hasNotes = node.noteCount > 0
  const projectColor = node.project?.color || '#888'

  return (
    <div className="tree-project-node" role="treeitem" aria-expanded={isExpanded}>
      {/* Project header */}
      <button
        className={`tree-project-header ${isExpanded ? 'expanded' : ''} ${!hasNotes ? 'empty' : ''}`}
        onClick={onToggleExpand}
        onFocus={() => onFocus(node.id)}
        aria-label={`${node.title}, ${node.noteCount} notes`}
        style={{
          '--project-color': projectColor
        } as React.CSSProperties}
      >
        <ChevronRight
          size={14}
          className={`tree-chevron ${isExpanded ? 'rotated' : ''} ${!hasNotes ? 'hidden' : ''}`}
        />
        {isUnassigned ? (
          <Inbox size={14} className="tree-project-icon unassigned" />
        ) : (
          <FolderKanban size={14} className="tree-project-icon" />
        )}
        <span className="tree-project-name">{node.title}</span>
        <span className="tree-project-count">{node.noteCount}</span>
      </button>

      {/* Notes list (expanded) */}
      {isExpanded && hasNotes && (
        <div className="tree-notes-list" role="group">
          {node.notes.map(note => (
            <NoteTreeItem
              key={note.id}
              note={note}
              projectId={node.project?.id}
              onClick={() => onSelectNote(note.id)}
              onContextMenu={(e) => onNoteContextMenu(e, note.id, node.project?.id)}
              isFocused={focusedId === note.id}
              onFocus={() => onFocus(note.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// Note Tree Item
// =============================================================================

interface NoteTreeItemProps {
  note: Note
  projectId?: string
  onClick: () => void
  onContextMenu: (e: React.MouseEvent) => void
  isFocused: boolean
  onFocus: () => void
}

function NoteTreeItem({
  note,
  onClick,
  onContextMenu,
  isFocused,
  onFocus
}: NoteTreeItemProps) {
  const title = note.title || 'Untitled'
  const timeAgo = formatTimeAgo(note.updated_at)

  return (
    <button
      className={`tree-note-item ${isFocused ? 'focused' : ''}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onFocus={onFocus}
      role="treeitem"
      aria-label={`${title}, updated ${timeAgo}`}
    >
      <FileText size={12} className="tree-note-icon" />
      <span className="tree-note-title">{title}</span>
      <span className="tree-note-time">{timeAgo}</span>
    </button>
  )
}

// =============================================================================
// Helpers
// =============================================================================

function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`

  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}
