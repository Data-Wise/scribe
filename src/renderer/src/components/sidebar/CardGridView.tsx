import { useState, useMemo } from 'react'
import { Plus, FileText, MoreHorizontal, ChevronDown, Lightbulb } from 'lucide-react'
import { Project, Note } from '../../types'
import { StatusDot } from './StatusDot'
import { ProjectContextMenu } from './ProjectContextMenu'
import { NoteContextMenu } from './NoteContextMenu'
import { EmptyState } from './EmptyState'
import { useAppViewStore } from '../../store/useAppViewStore'

/**
 * CardGridView - Reusable card grid renderer
 *
 * Extracted from CardViewMode.tsx for use in ExpandedIconPanel.
 * Renders projects OR inbox notes in card grid format.
 */

interface CardGridViewProps {
  // Data
  projects: Project[]
  notes: Note[]

  // Display mode
  showInboxNotes?: boolean  // NEW: Show note cards instead of project cards
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

export function CardGridView({
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
}: CardGridViewProps) {
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null)
  const isPinned = useAppViewStore(state => state.isPinned)

  // Context menu state
  const [projectContextMenu, setProjectContextMenu] = useState<{ project: Project; position: { x: number; y: number } } | null>(null)
  const [noteContextMenu, setNoteContextMenu] = useState<{ note: Note; position: { x: number; y: number } } | null>(null)

  // Context menu handlers
  const handleProjectContextMenu = (e: React.MouseEvent, project: Project) => {
    e.preventDefault()
    setProjectContextMenu({ project, position: { x: e.clientX, y: e.clientY } })
  }

  const handleNoteContextMenu = (e: React.MouseEvent, note: Note) => {
    e.preventDefault()
    setNoteContextMenu({ note, position: { x: e.clientX, y: e.clientY } })
  }

  const handleMenuClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation()
    setProjectContextMenu({ project, position: { x: e.clientX, y: e.clientY } })
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

  // Compute project stats and notes by project
  const { projectStats, notesByProject } = useMemo(() => {
    const stats: Record<string, { noteCount: number; wordCount: number }> = {}
    const noteMap: Record<string, Note[]> = {}

    activeProjects.forEach(p => {
      stats[p.id] = { noteCount: 0, wordCount: 0 }
      noteMap[p.id] = []
    })

    notes.filter(n => !n.deleted_at).forEach(note => {
      if (note.project_id && stats[note.project_id]) {
        stats[note.project_id].noteCount++
        stats[note.project_id].wordCount += note.content?.split(/\s+/).length || 0
        noteMap[note.project_id].push(note)
      }
    })

    // Sort notes by updated_at
    Object.keys(noteMap).forEach(projectId => {
      noteMap[projectId].sort((a, b) => b.updated_at - a.updated_at)
    })

    return { projectStats: stats, notesByProject: noteMap }
  }, [activeProjects, notes])

  // Inbox notes (sorted by updated_at)
  const inboxNotes = useMemo(() => {
    return notes
      .filter(n => !n.deleted_at && !n.project_id)
      .sort((a, b) => b.updated_at - a.updated_at)
  }, [notes])

  // Format helpers
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

  const extractPreview = (content: string, maxLength: number): string => {
    const text = content.replace(/[#*`\[\]]/g, '').trim()
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
  }

  const countWords = (content: string): number => {
    return content.split(/\s+/).filter(w => w.length > 0).length
  }

  // Render inbox notes mode
  if (showInboxNotes) {
    return (
      <>
        <div className="project-cards-container inbox-notes-mode">
          {inboxNotes.length === 0 ? (
            <EmptyState
              icon={<FileText className="w-12 h-12" />}
              title="No unassigned notes"
              description="Notes you create without a project will appear here"
            />
          ) : (
            inboxNotes.map((note) => (
              <div
                key={note.id}
                className="inbox-note-card"
                onClick={() => onSelectNote(note.id)}
                onContextMenu={(e) => handleNoteContextMenu(e, note)}
              >
                <div className="note-card-header">
                  <FileText size={16} />
                  <span className="note-title">{note.title || 'Untitled'}</span>
                </div>
                <div className="note-card-preview">
                  {extractPreview(note.content || '', 100)}
                </div>
                <div className="note-card-footer">
                  <span className="note-timestamp">{formatTimeAgo(note.updated_at)}</span>
                  <span className="note-wordcount">{countWords(note.content || '')} words</span>
                </div>
              </div>
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
      <div className="project-cards-container">
        {sortedProjects.length === 0 ? (
          <EmptyState
            icon={<Lightbulb className="w-12 h-12" />}
            title="Start your knowledge base"
            description="Projects help organize your notes by topic or area"
            actionLabel={onCreateProject ? "Create Project" : undefined}
            onAction={onCreateProject}
          />
        ) : (
          sortedProjects.map(project => {
            const stats = projectStats[project.id]
            const isActive = project.id === currentProjectId
            const isExpanded = expandedProjectId === project.id
            const projectNotes = notesByProject[project.id] || []
            return (
              <ProjectCard
                key={project.id}
                project={project}
                isActive={isActive}
                isExpanded={isExpanded}
                noteCount={stats?.noteCount || 0}
                wordCount={stats?.wordCount || 0}
                projectNotes={projectNotes}
                onClick={() => onSelectProject(isActive ? null : project.id)}
                onToggleExpand={() => setExpandedProjectId(isExpanded ? null : project.id)}
                onQuickAdd={() => onNewNote(project.id)}
                onSelectNote={onSelectNote}
                onNoteContextMenu={handleNoteContextMenu}
                onContextMenu={(e) => handleProjectContextMenu(e, project)}
                onMenuClick={(e) => handleMenuClick(e, project)}
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

// ProjectCard component (extracted from CardViewMode)
interface ProjectCardProps {
  project: Project
  isActive: boolean
  isExpanded: boolean
  noteCount: number
  wordCount: number
  projectNotes: Note[]
  onClick: () => void
  onToggleExpand: () => void
  onQuickAdd: () => void
  onSelectNote: (noteId: string) => void
  onNoteContextMenu: (e: React.MouseEvent, note: Note) => void
  onContextMenu: (e: React.MouseEvent) => void
  onMenuClick: (e: React.MouseEvent) => void
}

function ProjectCard({
  project,
  isActive,
  isExpanded,
  noteCount,
  wordCount,
  projectNotes,
  onClick,
  onToggleExpand,
  onQuickAdd,
  onSelectNote,
  onNoteContextMenu,
  onContextMenu,
  onMenuClick
}: ProjectCardProps) {
  const status = project.status || 'active'
  const progress = project.progress || 0
  const color = project.color || '#3b82f6'

  return (
    <div
      className={`project-card ${isActive ? 'active' : ''} ${isExpanded ? 'expanded' : ''}`}
      onContextMenu={onContextMenu}
      data-status={status}
      style={{ '--project-color': color } as React.CSSProperties}
    >
      {/* Card header */}
      <div className="card-header" onClick={onClick}>
        <div className="card-title-row">
          <StatusDot status={status} />
          <h4 className="card-title">{project.name}</h4>
          <button
            className="card-menu-btn"
            onClick={onMenuClick}
            aria-label="Project menu"
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
        {project.description && (
          <p className="card-description">{project.description}</p>
        )}
      </div>

      {/* Card body - stats */}
      <div className="card-body">
        <div className="card-stats">
          <div className="stat">
            <FileText size={12} />
            <span>{noteCount} {noteCount === 1 ? 'note' : 'notes'}</span>
          </div>
          <div className="stat">
            <span>{wordCount.toLocaleString()} words</span>
          </div>
        </div>

        {progress > 0 && (
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%`, backgroundColor: color }}
            />
          </div>
        )}
      </div>

      {/* Expanded notes list */}
      {isExpanded && projectNotes.length > 0 && (
        <div className="card-notes-list">
          <button
            className="notes-list-toggle"
            onClick={onToggleExpand}
          >
            <ChevronDown size={12} />
            <span>Recent notes</span>
          </button>
          {projectNotes.slice(0, 5).map(note => (
            <button
              key={note.id}
              className="card-note-item"
              onClick={() => onSelectNote(note.id)}
              onContextMenu={(e) => onNoteContextMenu(e, note)}
            >
              <FileText size={12} />
              <span>{note.title || 'Untitled'}</span>
            </button>
          ))}
          {noteCount > 5 && (
            <div className="more-notes">+{noteCount - 5} more</div>
          )}
        </div>
      )}

      {/* Quick add button */}
      {!isExpanded && (
        <button
          className="card-quick-add"
          onClick={(e) => {
            e.stopPropagation()
            onQuickAdd()
          }}
        >
          <Plus size={12} />
          <span>New Note</span>
        </button>
      )}
    </div>
  )
}
