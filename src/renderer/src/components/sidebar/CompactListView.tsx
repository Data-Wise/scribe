import React, { useState, useMemo, useRef } from 'react'
import { FileText, ChevronRight, ChevronDown, FolderOpen, Folder, FolderPlus } from 'lucide-react'
import { Project, Note } from '../../types'
import { ActivityDots } from './ActivityDots'
import { ProjectContextCard } from './ProjectContextCard'
import { ProjectContextMenu } from './ProjectContextMenu'
import { NoteContextMenu } from './NoteContextMenu'
import { EmptyState } from './EmptyState'
import { useAppViewStore } from '../../store/useAppViewStore'
import { getIconByName } from '../IconPicker'
import { ProjectTooltip } from './ContextualTooltip'

/**
 * CompactListView - Reusable compact list renderer
 *
 * Extracted from CompactListMode.tsx for use in ExpandedIconPanel.
 * Renders projects OR inbox notes in compact list format.
 */

interface CompactListViewProps {
  // Data
  projects: Project[]
  notes: Note[]

  // Display mode
  showInboxNotes?: boolean  // NEW: Show note list instead of projects
  currentProjectId: string | null

  // Actions
  onSelectProject: (id: string | null) => void
  onSelectNote: (id: string) => void
  onNewNote: (projectId: string) => void
  onCreateProject?: () => void

  // Context menu handlers
  onEditProject?: (projectId: string) => void
  onArchiveProject?: (projectId: string) => void
  onDeleteProject?: (projectId: string) => void
  onPinProject?: (projectId: string) => void
  onUnpinProject?: (projectId: string) => void
  onRenameNote?: (noteId: string) => void
  onMoveNoteToProject?: (noteId: string, projectId: string | null) => void
  onDuplicateNote?: (noteId: string) => void
  onDeleteNote?: (noteId: string) => void
}

export function CompactListView({
  projects,
  notes,
  showInboxNotes = false,
  currentProjectId,
  onSelectProject,
  onSelectNote,
  onNewNote,
  onCreateProject,
  onEditProject,
  onArchiveProject,
  onDeleteProject,
  onPinProject,
  onUnpinProject,
  onRenameNote,
  onMoveNoteToProject,
  onDuplicateNote,
  onDeleteNote
}: CompactListViewProps) {
  const isPinned = useAppViewStore(state => state.isPinned)

  // Context menu state
  const [projectContextMenu, setProjectContextMenu] = useState<{ project: Project; position: { x: number; y: number } } | null>(null)
  const [noteContextMenu, setNoteContextMenu] = useState<{ note: Note; position: { x: number; y: number } } | null>(null)

  // Keyboard navigation state
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const projectRefs = useRef<(HTMLDivElement | null)[]>([])

  // Context menu handlers
  const handleProjectContextMenu = (e: React.MouseEvent, project: Project) => {
    e.preventDefault()
    setProjectContextMenu({ project, position: { x: e.clientX, y: e.clientY } })
  }

  const handleNoteContextMenu = (e: React.MouseEvent, note: Note) => {
    e.preventDefault()
    setNoteContextMenu({ note, position: { x: e.clientX, y: e.clientY } })
  }

  // Filter active projects
  const activeProjects = useMemo(() => {
    return projects.filter(p => (p.status || 'active') !== 'archive')
  }, [projects])

  // Sort projects: current first, then by updated_at
  const sortedProjects = useMemo(() => {
    return [...activeProjects].sort((a, b) => {
      if (a.id === currentProjectId) return -1
      if (b.id === currentProjectId) return 1
      return b.updated_at - a.updated_at
    })
  }, [activeProjects, currentProjectId])

  // Compute project stats
  const projectStats = useMemo(() => {
    const stats: Record<string, { noteCount: number }> = {}
    activeProjects.forEach(p => { stats[p.id] = { noteCount: 0 } })
    notes.filter(n => !n.deleted_at).forEach(note => {
      if (note.project_id && stats[note.project_id]) {
        stats[note.project_id].noteCount++
      }
    })
    return stats
  }, [activeProjects, notes])

  // Inbox notes (sorted by updated_at)
  const inboxNotes = useMemo(() => {
    return notes
      .filter(n => !n.deleted_at && !n.project_id)
      .sort((a, b) => b.updated_at - a.updated_at)
  }, [notes])

  // Format timestamp for inbox notes
  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(timestamp).toLocaleDateString()
  }

  // Render inbox notes mode
  if (showInboxNotes) {
    return (
      <>
        <div className="project-list-compact inbox-notes-mode" role="listbox" aria-label="Inbox notes">
          {inboxNotes.length === 0 ? (
            <EmptyState
              icon={<FileText className="w-12 h-12" />}
              title="No unassigned notes"
              description="Notes you create without a project will appear here"
            />
          ) : (
            inboxNotes.map((note) => (
              <button
                key={note.id}
                className="inbox-note-item-compact"
                onClick={() => onSelectNote(note.id)}
                onContextMenu={(e) => handleNoteContextMenu(e, note)}
              >
                <FileText size={14} className="note-icon" />
                <div className="note-content">
                  <span className="note-title">{note.title || 'Untitled'}</span>
                  <span className="note-timestamp">{formatTimeAgo(note.updated_at)}</span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Note context menu */}
        {noteContextMenu && onRenameNote && onMoveNoteToProject && onDuplicateNote && onDeleteNote && (
          <NoteContextMenu
            note={noteContextMenu.note}
            projects={projects}
            position={noteContextMenu.position}
            onClose={() => setNoteContextMenu(null)}
            onOpenNote={onSelectNote}
            onRenameNote={onRenameNote}
            onMoveToProject={onMoveNoteToProject}
            onDuplicateNote={onDuplicateNote}
            onDeleteNote={onDeleteNote}
          />
        )}
      </>
    )
  }

  // Render projects mode
  return (
    <>
      <div className="project-list-compact" role="listbox" aria-label="Projects">
        {sortedProjects.length === 0 ? (
          <EmptyState
            icon={<FolderPlus className="w-12 h-12" />}
            title="No projects yet"
            description="Create your first project to organize your notes"
            actionLabel={onCreateProject ? "Create Project" : undefined}
            onAction={onCreateProject}
          />
        ) : (
          sortedProjects.map((project, index) => {
            const stats = projectStats[project.id]
            const isExpanded = project.id === currentProjectId
            const isFocused = focusedIndex === index
            const projectNotes = notes
              .filter(n => !n.deleted_at && n.project_id === project.id)
              .sort((a, b) => b.updated_at - a.updated_at)
              .slice(0, 5)

            return (
              <CompactProjectItem
                key={project.id}
                ref={(el) => (projectRefs.current[index] = el)}
                project={project}
                allNotes={notes}
                allProjects={projects}
                isExpanded={isExpanded}
                isFocused={isFocused}
                noteCount={stats?.noteCount || 0}
                projectNotes={projectNotes}
                onClick={() => {
                  setFocusedIndex(index)
                  onSelectProject(isExpanded ? null : project.id)
                }}
                onSelectNote={onSelectNote}
                onQuickAdd={() => onNewNote(project.id)}
                onContextMenu={(e) => handleProjectContextMenu(e, project)}
                onNoteContextMenu={handleNoteContextMenu}
                onPin={isPinned(project.id) ? () => onUnpinProject?.(project.id) : () => onPinProject?.(project.id)}
                isPinned={isPinned(project.id)}
              />
            )
          })
        )}
      </div>

      {/* Project context menu */}
      {projectContextMenu && onEditProject && onArchiveProject && onDeleteProject && (
        <ProjectContextMenu
          project={projectContextMenu.project}
          position={projectContextMenu.position}
          onClose={() => setProjectContextMenu(null)}
          onNewNote={onNewNote}
          onEditProject={onEditProject}
          onArchiveProject={onArchiveProject}
          onDeleteProject={onDeleteProject}
          onPinProject={onPinProject}
          onUnpinProject={onUnpinProject}
          isPinned={isPinned(projectContextMenu.project.id)}
        />
      )}

      {/* Note context menu */}
      {noteContextMenu && onRenameNote && onMoveNoteToProject && onDuplicateNote && onDeleteNote && (
        <NoteContextMenu
          note={noteContextMenu.note}
          projects={projects}
          position={noteContextMenu.position}
          onClose={() => setNoteContextMenu(null)}
          onOpenNote={onSelectNote}
          onRenameNote={onRenameNote}
          onMoveToProject={onMoveNoteToProject}
          onDuplicateNote={onDuplicateNote}
          onDeleteNote={onDeleteNote}
        />
      )}
    </>
  )
}

// CompactProjectItem component (extracted from CompactListMode)
interface CompactProjectItemProps {
  project: Project
  allNotes: Note[]
  allProjects: Project[]
  isExpanded: boolean
  isFocused: boolean
  noteCount: number
  projectNotes: Note[]
  onClick: () => void
  onSelectNote: (id: string) => void
  onQuickAdd: () => void
  onContextMenu: (e: React.MouseEvent) => void
  onNoteContextMenu: (e: React.MouseEvent, note: Note) => void
  onPin?: () => void
  isPinned?: boolean
}

const CompactProjectItem = React.forwardRef<HTMLDivElement, CompactProjectItemProps>(
  ({
    project,
    allNotes,
    allProjects: _allProjects,
    isExpanded,
    isFocused,
    noteCount,
    projectNotes,
    onClick,
    onSelectNote,
    onQuickAdd,
    onContextMenu,
    onNoteContextMenu,
    onPin,
    isPinned = false
  }, ref) => {
    const ChevronIcon = isExpanded ? ChevronDown : ChevronRight
    const ProjectIcon = project.icon
      ? getIconByName(project.icon)
      : (isExpanded ? FolderOpen : Folder)

    // Expanded view with context card + notes list
    if (isExpanded) {
      return (
        <div
          ref={ref}
          className={`compact-project-wrapper expanded ${isFocused ? 'keyboard-focus' : ''}`}
          role="option"
          aria-selected={isExpanded}
          tabIndex={isFocused ? 0 : -1}
        >
          <button
            className="compact-project-item expanded"
            onClick={onClick}
            onContextMenu={onContextMenu}
          >
            <div className="item-row">
              <ChevronIcon size={14} className="chevron open" />
              <ProjectIcon size={14} className="folder-icon" />
              <span className="project-name">{project.name}</span>
            </div>
          </button>

          <ProjectContextCard
            project={project}
            notes={allNotes}
            onNewNote={onQuickAdd}
          />

          {projectNotes.length > 0 && (
            <div className="project-notes-list">
              {projectNotes.map(note => (
                <button
                  key={note.id}
                  className="project-note-item"
                  onClick={() => onSelectNote(note.id)}
                  onContextMenu={(e) => onNoteContextMenu(e, note)}
                >
                  <FileText size={12} className="note-icon" />
                  <span className="note-title">{note.title || 'Untitled'}</span>
                </button>
              ))}
              {noteCount > 5 && (
                <div className="more-notes">+{noteCount - 5} more</div>
              )}
            </div>
          )}
        </div>
      )
    }

    // Collapsed view with tooltip
    const status = project.status || 'active'
    const statusLabel = status.charAt(0).toUpperCase() + status.slice(1)

    return (
      <div
        ref={ref}
        className={`compact-project-wrapper ${isFocused ? 'keyboard-focus' : ''}`}
        role="option"
        aria-selected={false}
        tabIndex={isFocused ? 0 : -1}
      >
        <ProjectTooltip
          projectName={project.name}
          status={statusLabel}
          noteCount={noteCount}
          onOpen={onClick}
          onPin={onPin}
          onMore={onContextMenu}
          isPinned={isPinned}
        >
          <button
            className="compact-project-item"
            onClick={onClick}
            onContextMenu={onContextMenu}
          >
            <div className="item-row">
              <ChevronIcon size={14} className="chevron" />
              <ProjectIcon size={14} className="folder-icon" />
              <span className="project-name">{project.name}</span>
              <ActivityDots noteCount={noteCount} size="compact" />
            </div>
          </button>
        </ProjectTooltip>
      </div>
    )
  }
)

CompactProjectItem.displayName = 'CompactProjectItem'
