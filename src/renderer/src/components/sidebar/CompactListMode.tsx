import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Menu, Plus, Search, FileText, ChevronRight, ChevronDown, FolderOpen, Folder, Settings, FolderPlus } from 'lucide-react'
import { Project, Note } from '../../types'
import { ActivityDots } from './ActivityDots'
import { ProjectContextCard } from './ProjectContextCard'
import { ProjectContextMenu } from './ProjectContextMenu'
import { NoteContextMenu } from './NoteContextMenu'
import { EmptyState } from './EmptyState'
import { useAppViewStore } from '../../store/useAppViewStore'

interface CompactListModeProps {
  projects: Project[]
  notes: Note[]
  currentProjectId: string | null
  onSelectProject: (id: string | null) => void
  onSelectNote: (id: string) => void
  onCreateProject: () => void
  onNewNote: (projectId: string) => void
  onCollapse: () => void
  width: number
  // Context menu handlers (optional)
  onEditProject?: (projectId: string) => void
  onArchiveProject?: (projectId: string) => void
  onDeleteProject?: (projectId: string) => void
  onPinProject?: (projectId: string) => void
  onUnpinProject?: (projectId: string) => void
  onRenameNote?: (noteId: string) => void
  onMoveNoteToProject?: (noteId: string, projectId: string | null) => void
  onDuplicateNote?: (noteId: string) => void
  onDeleteNote?: (noteId: string) => void
  onOpenSettings?: () => void
}

export function CompactListMode({
  projects,
  notes,
  currentProjectId,
  onSelectProject,
  onSelectNote,
  onCreateProject,
  onNewNote,
  onCollapse,
  width,
  onEditProject,
  onArchiveProject,
  onDeleteProject,
  onPinProject,
  onUnpinProject,
  onRenameNote,
  onMoveNoteToProject,
  onDuplicateNote,
  onDeleteNote,
  onOpenSettings
}: CompactListModeProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const isPinned = useAppViewStore(state => state.isPinned)

  // Context menu state
  const [projectContextMenu, setProjectContextMenu] = useState<{ project: Project; position: { x: number; y: number } } | null>(null)
  const [noteContextMenu, setNoteContextMenu] = useState<{ note: Note; position: { x: number; y: number } } | null>(null)

  // Keyboard navigation state
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const projectRefs = useRef<(HTMLDivElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  // Context menu handlers
  const handleProjectContextMenu = (e: React.MouseEvent, project: Project) => {
    e.preventDefault()
    setProjectContextMenu({ project, position: { x: e.clientX, y: e.clientY } })
  }

  const handleNoteContextMenu = (e: React.MouseEvent, note: Note) => {
    e.preventDefault()
    setNoteContextMenu({ note, position: { x: e.clientX, y: e.clientY } })
  }

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

  // Count inbox notes
  const inboxCount = useMemo(() => {
    return notes.filter(n => !n.deleted_at && !n.project_id).length
  }, [notes])

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const projectCount = sortedProjects.length

      // Don't handle keyboard navigation if there are no projects
      if (projectCount === 0) return

      // Don't handle keyboard navigation if user is typing in search
      if (document.activeElement?.tagName === 'INPUT') return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setFocusedIndex((prev) => (prev + 1) % projectCount)
          break

        case 'ArrowUp':
          e.preventDefault()
          setFocusedIndex((prev) =>
            prev <= 0 ? projectCount - 1 : prev - 1
          )
          break

        case 'Enter':
          if (focusedIndex >= 0 && focusedIndex < projectCount) {
            e.preventDefault()
            const project = sortedProjects[focusedIndex]
            const isExpanded = project.id === currentProjectId
            onSelectProject(isExpanded ? null : project.id)
          }
          break

        case 'Escape':
          e.preventDefault()
          setFocusedIndex(-1)
          break
      }
    }

    // Add event listener to the container
    const container = containerRef.current
    if (container) {
      container.addEventListener('keydown', handleKeyDown)
      return () => container.removeEventListener('keydown', handleKeyDown)
    }
  }, [sortedProjects, focusedIndex, currentProjectId, onSelectProject])

  // Auto-scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && projectRefs.current[focusedIndex]) {
      projectRefs.current[focusedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      })
    }
  }, [focusedIndex])

  // Reset focus when search changes or projects change
  useEffect(() => {
    setFocusedIndex(-1)
  }, [searchQuery, projects.length])

  return (
    <div
      className="mission-sidebar-compact"
      style={{ width }}
      ref={containerRef}
      tabIndex={0}
      role="navigation"
      aria-label="Projects navigation"
    >
      {/* Header */}
      <div className="sidebar-header">
        <button
          className="sidebar-toggle-btn"
          onClick={onCollapse}
          title="Collapse sidebar (⌘0)"
        >
          <Menu size={16} />
        </button>
        <h3 className="sidebar-title">
          Projects <span className="count">({projects.filter(p => (p.status || 'active') !== 'archive').length})</span>
        </h3>
      </div>

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
      <div className="project-list-compact" role="listbox" aria-label="Projects">
        {sortedProjects.length === 0 && inboxCount === 0 && !searchQuery ? (
          <EmptyState
            icon={<FolderPlus className="w-12 h-12" />}
            title="No projects yet"
            description="Create your first project to organize your notes"
            actionLabel="Create Project"
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
            />
          )
        })
        )}

        {sortedProjects.length === 0 && searchQuery && (
          <div className="no-results">No projects match "{searchQuery}"</div>
        )}
      </div>

      {/* Add project button */}
      <button
        className="add-project-btn-compact"
        onClick={onCreateProject}
      >
        <Plus size={14} />
        <span>New Project</span>
      </button>

      {/* Settings button */}
      {onOpenSettings && (
        <button
          className="sidebar-settings-btn"
          onClick={onOpenSettings}
          data-testid="sidebar-settings-button"
        >
          <Settings size={14} />
          <span>Settings</span>
          <span className="shortcut">⌘,</span>
        </button>
      )}

      {/* Context Menus */}
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
    </div>
  )
}

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
    onNoteContextMenu
  }, ref) => {
  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight
  const FolderIcon = isExpanded ? FolderOpen : Folder

  // When expanded, show context card + notes list
  if (isExpanded) {
    return (
      <div
        ref={ref}
        className={`compact-project-wrapper expanded ${isFocused ? 'keyboard-focus' : ''}`}
        role="option"
        aria-selected={isExpanded}
        tabIndex={isFocused ? 0 : -1}
      >
        {/* Collapsed header to close */}
        <button
          className="compact-project-item expanded"
          onClick={onClick}
          onContextMenu={onContextMenu}
        >
          <div className="item-row">
            <ChevronIcon size={14} className="chevron open" />
            <FolderIcon size={14} className="folder-icon" />
            <span className="project-name">{project.name}</span>
          </div>
        </button>

        {/* Context card with stats */}
        <ProjectContextCard
          project={project}
          notes={allNotes}
          onNewNote={onQuickAdd}
        />

        {/* Notes list */}
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

  // Collapsed view with activity dots
  return (
    <div
      ref={ref}
      className={`compact-project-wrapper ${isFocused ? 'keyboard-focus' : ''}`}
      role="option"
      aria-selected={false}
      tabIndex={isFocused ? 0 : -1}
    >
      <button
        className="compact-project-item"
        onClick={onClick}
        onContextMenu={onContextMenu}
      >
        <div className="item-row">
          <ChevronIcon size={14} className="chevron" />
          <FolderIcon size={14} className="folder-icon" />
          <span className="project-name">{project.name}</span>
          <ActivityDots projectId={project.id} notes={allNotes} size="sm" />
        </div>
      </button>
    </div>
  )
})

CompactProjectItem.displayName = 'CompactProjectItem'

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

