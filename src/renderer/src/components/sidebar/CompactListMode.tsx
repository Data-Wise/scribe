import { useState, useMemo } from 'react'
import { Menu, Plus, Search, Clock, FileText, ChevronRight, GripVertical } from 'lucide-react'
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
import { useAppViewStore, type LeftSidebarTab } from '../../store/useAppViewStore'

interface CompactListModeProps {
  projects: Project[]
  notes: Note[]
  currentProjectId: string | null
  onSelectProject: (id: string | null) => void
  onSelectNote: (id: string) => void
  onCreateProject: () => void
  onCollapse: () => void
  onOpenQuickCapture?: () => void
  onMarkInboxProcessed?: (noteId: string) => void
  onDeleteNote?: (noteId: string) => void
  onAssignNoteToProject?: (noteId: string, projectId: string | null) => void
  onMoveNoteToInbox?: (noteId: string) => void
  onOpenFullGraph?: () => void
  width: number
}

export function CompactListMode({
  projects,
  notes,
  currentProjectId,
  onSelectProject,
  onSelectNote,
  onCreateProject,
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
  const { contextMenu, showContextMenu, hideContextMenu } = useNoteContextMenu()

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

  // Get recent notes (last 5) - filtered by project if one is selected
  const recentNotes = useMemo(() => {
    return [...notes]
      .filter(n => {
        if (n.deleted_at) return false
        // If a project is selected, only show notes from that project
        if (currentProjectId) {
          const noteProjectId = n.properties?.project_id?.value as string | undefined
          return noteProjectId === currentProjectId
        }
        return true
      })
      .sort((a, b) => b.updated_at - a.updated_at)
      .slice(0, 5)
  }, [notes, currentProjectId])

  // Compute project stats
  const projectStats = useMemo(() => {
    const stats: Record<string, { noteCount: number; wordCount: number }> = {}
    projects.forEach(p => {
      stats[p.id] = { noteCount: 0, wordCount: 0 }
    })
    notes.filter(n => !n.deleted_at).forEach(note => {
      const projectId = note.properties?.project_id?.value as string | undefined
      if (projectId && stats[projectId]) {
        stats[projectId].noteCount++
        stats[projectId].wordCount += countWords(note.content)
      }
    })
    return stats
  }, [projects, notes])

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
                  onDropNote={onAssignNoteToProject ? (noteId) => onAssignNoteToProject(noteId, project.id) : undefined}
                />
              )
            })}

            {sortedProjects.length === 0 && searchQuery && (
              <div className="no-results">No projects match "{searchQuery}"</div>
            )}
          </div>

          {/* Recent notes section */}
          {recentNotes.length > 0 && (
            <div className="sidebar-section">
              <h4 className="section-header">
                <Clock size={12} />
                <span>{currentProjectId ? 'Recent Notes' : 'Recent'}</span>
              </h4>
              <div className="recent-notes-list">
                {recentNotes.map(note => {
                  const noteProjectId = note.properties?.project_id?.value as string | undefined
                  return (
                    <DraggableRecentNoteItem
                      key={note.id}
                      note={note}
                      currentProjectId={noteProjectId}
                      onClick={() => onSelectNote(note.id)}
                      onContextMenu={(e) => showContextMenu(e, note.id, noteProjectId)}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Context Menu for Recent Notes */}
          {contextMenu && onAssignNoteToProject && (
            <NoteContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              noteId={contextMenu.noteId}
              currentProjectId={contextMenu.currentProjectId}
              projects={projects}
              onClose={hideContextMenu}
              onAssignToProject={onAssignNoteToProject}
              onMoveToInbox={onMoveNoteToInbox}
              onDelete={onDeleteNote}
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
  onDropNote?: (noteId: string) => void
}

function CompactProjectItem({ project, isActive, noteCount, onClick, onDropNote }: CompactProjectItemProps) {
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

// Helper functions
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

// Draggable recent note item
interface DraggableRecentNoteItemProps {
  note: Note
  currentProjectId?: string
  onClick: () => void
  onContextMenu?: (e: React.MouseEvent) => void
}

function DraggableRecentNoteItem({ note, currentProjectId, onClick, onContextMenu }: DraggableRecentNoteItemProps) {
  const { isDragging, dragProps } = useDraggableNote(note, currentProjectId)

  return (
    <button
      className={`recent-note-item ${isDragging ? 'dragging' : ''}`}
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
