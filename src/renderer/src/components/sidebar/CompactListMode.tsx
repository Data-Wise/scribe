import { useState, useMemo } from 'react'
import { Menu, Plus, Search, ChevronRight, FileText, GripVertical } from 'lucide-react'
import { Project, Note } from '../../types'
import { StatusDot } from './StatusDot'
import { DragRegion } from '../DragRegion'
import { PillTabs, LEFT_SIDEBAR_TABS } from './SidebarTabs'
import { NotesListPanel } from './NotesListPanel'
import { InboxPanel } from './InboxPanel'
import { GraphPanel } from './GraphPanel'
import { TrashPanel } from './TrashPanel'
import { useDropTarget, useDraggableNote } from './DraggableNote'
import { NoteContextMenu, useNoteContextMenu } from './NoteContextMenu'
import { ProjectContextMenu, useProjectContextMenu } from './ProjectContextMenu'
import { useAppViewStore, type LeftSidebarTab } from '../../store/useAppViewStore'

interface CompactListModeProps {
  projects: Project[]
  notes: Note[]
  currentProjectId: string | null
  onSelectProject: (id: string | null) => void
  onSelectNote: (id: string) => void
  onCreateProject: () => void
  onNewNoteInProject?: (projectId: string) => void
  onEditProject?: (projectId: string) => void
  onArchiveProject?: (projectId: string) => void
  onUnarchiveProject?: (projectId: string) => void
  onDeleteProject?: (projectId: string) => void
  onCollapse: () => void
  onOpenQuickCapture?: () => void
  onMarkInboxProcessed?: (noteId: string) => void
  onDeleteNote?: (noteId: string) => void
  onAssignNoteToProject?: (noteId: string, projectId: string | null) => void
  onMoveNoteToInbox?: (noteId: string) => void
  onOpenFullGraph?: () => void
  width: number
}

// Helper functions (must be before component that uses them)
function countWords(content: string): number {
  if (!content) return 0
  const text = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_~>\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.split(/\s+/).filter(Boolean).length
}

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
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Draggable project note item (must be before CompactListMode)
interface DraggableProjectNoteItemProps {
  note: Note
  currentProjectId: string | null
  onClick: () => void
  onContextMenu: (e: React.MouseEvent) => void
}

function DraggableProjectNoteItem({ note, currentProjectId, onClick, onContextMenu }: DraggableProjectNoteItemProps) {
  const { isDragging, dragProps } = useDraggableNote(note, currentProjectId || undefined)

  return (
    <button
      className={`project-note-item ${isDragging ? 'dragging' : ''}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      {...dragProps}
    >
      <GripVertical size={10} className="drag-handle" />
      <FileText size={12} className="note-icon" />
      <span className="note-title">{note.title || 'Untitled'}</span>
      <span className="note-time">{formatTimeAgo(note.updated_at)}</span>
    </button>
  )
}

export function CompactListMode({
  projects,
  notes,
  currentProjectId,
  onSelectProject,
  onSelectNote,
  onCreateProject,
  onNewNoteInProject,
  onEditProject,
  onArchiveProject,
  onUnarchiveProject,
  onDeleteProject,
  onCollapse,
  onOpenQuickCapture,
  onMarkInboxProcessed,
  onDeleteNote,
  onAssignNoteToProject,
  onMoveNoteToInbox,
  onOpenFullGraph,
  width
}: CompactListModeProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { leftSidebarTab, setLeftSidebarTab } = useAppViewStore()
  const { contextMenu: noteContextMenu, showContextMenu: showNoteContextMenu, hideContextMenu: hideNoteContextMenu } = useNoteContextMenu()
  const { contextMenu: projectContextMenu, showContextMenu: showProjectContextMenu, hideContextMenu: hideProjectContextMenu } = useProjectContextMenu()

  // Count inbox items for badge
  const inboxCount = useMemo(() => {
    return notes.filter(n => n.folder === 'inbox' && !n.deleted_at).length
  }, [notes])

  // Count trash items for badge
  const trashCount = useMemo(() => {
    return notes.filter(n => n.deleted_at).length
  }, [notes])

  // Create tabs with dynamic badges
  const tabsWithBadge = useMemo(() => {
    return LEFT_SIDEBAR_TABS.map(tab => ({
      ...tab,
      badge: tab.id === 'inbox' ? inboxCount : tab.id === 'trash' ? trashCount : undefined
    }))
  }, [inboxCount, trashCount])

  // Filter projects by search (treat undefined status as 'active')
  const filteredProjects = useMemo(() => {
    const activeProjects = projects.filter(p => (p.status || 'active') !== 'archive')
    if (!searchQuery.trim()) return activeProjects

    return activeProjects.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [projects, searchQuery])

  // Sort projects: current first, then by updated_at
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (a.id === currentProjectId) return -1
    if (b.id === currentProjectId) return 1
    return b.updated_at - a.updated_at
  })

  // Compute project stats
  const projectStats = useMemo(() => {
    const stats: Record<string, { noteCount: number; wordCount: number }> = {}
    projects.forEach(p => {
      stats[p.id] = { noteCount: 0, wordCount: 0 }
    })
    notes.filter(n => !n.deleted_at).forEach(note => {
      if (note.project_id && stats[note.project_id]) {
        stats[note.project_id].noteCount++
        stats[note.project_id].wordCount += countWords(note.content)
      }
    })
    return stats
  }, [projects, notes])

  // Get notes for the selected project
  const projectNotes = useMemo(() => {
    if (!currentProjectId) return []
    return notes
      .filter(n => !n.deleted_at && n.project_id === currentProjectId)
      .sort((a, b) => b.updated_at - a.updated_at)
  }, [notes, currentProjectId])

  return (
    <div className="mission-sidebar-compact" style={{ width }}>
      {/* Draggable header region for macOS window dragging */}
      <DragRegion className="sidebar-drag-header" />

      {/* Header */}
      <div className="sidebar-header">
        <button
          className="sidebar-toggle-btn"
          onClick={onCollapse}
          title="Collapse sidebar (⌘0)"
        >
          <Menu size={16} />
        </button>
        <h3 className="sidebar-title">Mission Control</h3>
      </div>

      {/* Pill tabs navigation */}
      <div className="sidebar-tabs-container">
        <PillTabs
          tabs={tabsWithBadge}
          activeTab={leftSidebarTab}
          onTabChange={(tab) => setLeftSidebarTab(tab as LeftSidebarTab)}
          size="sm"
        />
      </div>

      {/* Tab content */}
      {leftSidebarTab === 'projects' && (
        <>
          {/* Search (if >5 projects) */}
          {projects.length > 5 && (
            <div className="sidebar-search">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Find project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          )}

          {/* Project list */}
          <div className="project-list-compact">
            {sortedProjects.map(project => {
              const stats = projectStats[project.id]
              const isActive = project.id === currentProjectId
              return (
                <CompactProjectItem
                  key={project.id}
                  project={project}
                  isActive={isActive}
                  noteCount={stats?.noteCount || 0}
                  onClick={() => onSelectProject(isActive ? null : project.id)}
                  onContextMenu={(e) => showProjectContextMenu(e, project)}
                  onDropNote={onAssignNoteToProject ? (noteId) => onAssignNoteToProject(noteId, project.id) : undefined}
                />
              )
            })}

            {sortedProjects.length === 0 && searchQuery && (
              <div className="no-results">No projects match "{searchQuery}"</div>
            )}
          </div>

          {/* Project Notes - show when a project is selected */}
          {currentProjectId && (
            <div className="project-notes-section">
              <div className="project-notes-header">
                <FileText size={12} />
                <span>Notes ({projectNotes.length})</span>
              </div>
              <div className="project-notes-list">
                {projectNotes.length === 0 ? (
                  <div className="project-notes-empty">
                    No notes in this project
                  </div>
                ) : (
                  projectNotes.map(note => (
                    <DraggableProjectNoteItem
                      key={note.id}
                      note={note}
                      currentProjectId={currentProjectId}
                      onClick={() => onSelectNote(note.id)}
                      onContextMenu={(e) => showNoteContextMenu(e, note.id, currentProjectId)}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Context Menu for Notes */}
          {noteContextMenu && (
            <NoteContextMenu
              x={noteContextMenu.x}
              y={noteContextMenu.y}
              noteId={noteContextMenu.noteId}
              currentProjectId={noteContextMenu.currentProjectId}
              projects={projects}
              onClose={hideNoteContextMenu}
              onAssignToProject={onAssignNoteToProject || (() => {})}
              onMoveToInbox={onMoveNoteToInbox}
              onDelete={onDeleteNote}
            />
          )}

          {/* Context Menu for Projects */}
          {projectContextMenu && (
            <ProjectContextMenu
              x={projectContextMenu.x}
              y={projectContextMenu.y}
              project={projectContextMenu.project}
              isCurrentProject={projectContextMenu.project.id === currentProjectId}
              onClose={hideProjectContextMenu}
              onNewNote={onNewNoteInProject}
              onEdit={onEditProject}
              onSetActive={onSelectProject}
              onArchive={onArchiveProject}
              onUnarchive={onUnarchiveProject}
              onDelete={onDeleteProject}
            />
          )}

          {/* Add project button */}
          <button
            className="add-project-btn-compact"
            onClick={onCreateProject}
          >
            <Plus size={14} />
            <span>New Project</span>
          </button>
        </>
      )}

      {leftSidebarTab === 'notes' && (
        <NotesListPanel
          notes={notes}
          projects={projects}
          onSelectNote={onSelectNote}
          onAssignToProject={onAssignNoteToProject}
          onMoveToInbox={onMoveNoteToInbox}
          onDelete={onDeleteNote}
          variant="compact"
        />
      )}

      {leftSidebarTab === 'inbox' && (
        <InboxPanel
          notes={notes}
          onSelectNote={onSelectNote}
          onMarkProcessed={onMarkInboxProcessed}
          onDelete={onDeleteNote}
          onOpenQuickCapture={onOpenQuickCapture}
          variant="compact"
        />
      )}

      {leftSidebarTab === 'graph' && (
        <GraphPanel
          notes={notes}
          projects={projects}
          onSelectNote={onSelectNote}
          onOpenFullGraph={onOpenFullGraph}
          variant="compact"
        />
      )}

      {leftSidebarTab === 'trash' && (
        <TrashPanel notes={notes} />
      )}
    </div>
  )
}

interface CompactProjectItemProps {
  project: Project
  isActive: boolean
  noteCount: number
  onClick: () => void
  onContextMenu?: (e: React.MouseEvent) => void
  onDropNote?: (noteId: string) => void
}

function CompactProjectItem({ project, isActive, noteCount, onClick, onContextMenu, onDropNote }: CompactProjectItemProps) {
  const status = project.status || 'active'

  // Drop target hook
  const { isOver, canAccept, dropProps } = useDropTarget(
    (noteId) => onDropNote?.(noteId),
    (data) => data.currentProjectId !== project.id // Can't drop on same project
  )

  const dropClass = isOver
    ? canAccept
      ? 'drop-target-active'
      : 'drop-target-reject'
    : ''

  return (
    <button
      className={`compact-project-item ${isActive ? 'active' : ''} ${dropClass}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      data-status={status}
      {...(onDropNote ? dropProps : {})}
    >
      {/* Top row: status + name + count */}
      <div className="item-row">
        <StatusDot status={status} size="sm" />
        <span className="project-name">{project.name}</span>
        <span className="note-count">{noteCount}</span>
        <ChevronRight size={12} className="chevron" />
      </div>

      {/* Progress bar (if project has progress) */}
      {project.progress !== undefined && project.progress > 0 && (
        <div className="progress-mini" title={`${project.progress}% complete`}>
          <div
            className="progress-fill"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      )}

      {/* Footer: time */}
      <div className="item-footer">
        {formatTimeAgo(project.updated_at)}
      </div>
    </button>
  )
}


