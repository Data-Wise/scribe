import { useMemo, useState, useEffect } from 'react'
import { Menu, Plus, FolderPlus } from 'lucide-react'
import { Project, Note } from '../../types'
import { StatusDot } from './StatusDot'
import { Tooltip } from './Tooltip'
import { ActivityBar } from './ActivityBar'
import { InboxButton } from './InboxButton'
import { SmartIconButton } from './SmartIconButton'
import { EmptyState } from './EmptyState'
import { RecentNotesDropdown } from './RecentNotesDropdown'
import { useAppViewStore, MISSION_CONTROL_TAB_ID } from '../../store/useAppViewStore'

interface IconBarModeProps {
  projects: Project[]
  notes: Note[]
  currentProjectId: string | null
  onSelectProject: (id: string | null) => void
  onCreateProject: () => void
  onExpand: () => void
  // Activity Bar handlers
  onSearch: () => void
  onDaily: () => void
  onSettings: () => void
  onSelectNote: (noteId: string) => void
  activeActivityItem?: 'search' | 'daily' | 'recent' | 'settings' | null
}

export function IconBarMode({
  projects,
  notes,
  currentProjectId,
  onSelectProject,
  onCreateProject,
  onExpand,
  onSearch,
  onDaily,
  onSettings,
  onSelectNote,
  activeActivityItem = null
}: IconBarModeProps) {
  // Get pinned vaults and smart icons from store
  const pinnedVaults = useAppViewStore(state => state.pinnedVaults)
  const reorderPinnedVaults = useAppViewStore(state => state.reorderPinnedVaults)
  const smartIcons = useAppViewStore(state => state.smartIcons)
  const setProjectTypeFilter = useAppViewStore(state => state.setProjectTypeFilter)
  const setActiveTab = useAppViewStore(state => state.setActiveTab)
  const recentNotes = useAppViewStore(state => state.recentNotes)
  const clearRecentNotes = useAppViewStore(state => state.clearRecentNotes)

  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Recent notes dropdown state
  const [showRecentNotes, setShowRecentNotes] = useState(false)

  // Keyboard shortcut for Recent Notes (⌘R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'r') {
        e.preventDefault()
        setShowRecentNotes(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Filter projects to show only pinned ones, sorted by vault order
  const sortedProjects = useMemo(() => {
    // Get pinned project IDs (excluding Inbox)
    const pinnedProjectIds = pinnedVaults
      .filter(v => v.id !== 'inbox')
      .map(v => v.id)

    // Filter projects to only pinned ones
    const pinned = projects.filter(p => pinnedProjectIds.includes(p.id))

    // Sort by vault order
    return pinned.sort((a, b) => {
      const aVault = pinnedVaults.find(v => v.id === a.id)
      const bVault = pinnedVaults.find(v => v.id === b.id)
      return (aVault?.order || 0) - (bVault?.order || 0)
    })
  }, [projects, pinnedVaults])

  // Compute note counts per project for tooltips
  const noteCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    projects.forEach(p => { counts[p.id] = 0 })
    notes.filter(n => !n.deleted_at).forEach(note => {
      if (note.project_id && counts[note.project_id] !== undefined) {
        counts[note.project_id]++
      }
    })
    return counts
  }, [projects, notes])

  // Count unassigned notes (inbox)
  const inboxCount = useMemo(() => {
    return notes.filter(n => !n.deleted_at && !n.project_id).length
  }, [notes])

  // Check if Inbox is the "active" view (no project selected)
  const isInboxActive = currentProjectId === null

  // Compute project counts per smart icon
  const smartIconProjectCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    smartIcons.forEach(icon => {
      counts[icon.id] = projects.filter(p => p.type === icon.projectType).length
    })
    return counts
  }, [projects, smartIcons])

  // Icon mode is always 48px (no inline expansion)
  const sidebarWidth = 48

  // Drag handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault() // Necessary to allow drop
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      // Reorder in store (this handles Inbox exclusion)
      reorderPinnedVaults(draggedIndex + 1, dropIndex + 1) // +1 because Inbox is at index 0

      // Add success animation to the drop target
      const target = e.currentTarget as HTMLElement
      target.classList.add('drop-success')
      setTimeout(() => {
        target.classList.remove('drop-success')
      }, 300)
    }

    // Reset drag state
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div
      className="mission-sidebar-icon"
      style={{ width: `${sidebarWidth}px` }}
    >
      {/* Expand button */}
      <button
        className="sidebar-toggle-btn"
        onClick={onExpand}
        title="Expand sidebar (⌘0)"
      >
        <Menu size={18} />
      </button>

      <div className="sidebar-divider" />

      {/* Inbox button (always at top) */}
      <InboxButton
        unreadCount={inboxCount}
        isActive={isInboxActive}
        onClick={() => {
          // Phase 3: Universal expand - expand sidebar and show Inbox
          onExpand()
          onSelectProject(null)
          setProjectTypeFilter(null) // Clear any active filter
          setActiveTab(MISSION_CONTROL_TAB_ID)
        }}
      />

      <div className="sidebar-divider" />

      {/* Smart Icons - Permanent folders */}
      {smartIcons
        .filter(icon => icon.isVisible)
        .sort((a, b) => a.order - b.order)
        .map((icon) => (
          <SmartIconButton
            key={icon.id}
            icon={icon}
            projectCount={smartIconProjectCounts[icon.id] || 0}
            isExpanded={false}
            onClick={() => {
              // Phase 3: Universal expand - expand sidebar and filter projects
              onExpand()
              setProjectTypeFilter(icon.projectType)
              onSelectProject(null) // Clear project selection
              setActiveTab(MISSION_CONTROL_TAB_ID)
            }}
          />
        ))}

      <div className="sidebar-divider" />

      {/* Pinned Project icons */}
      <div className="project-icons">
        {sortedProjects.length === 0 ? (
          <EmptyState
            icon={<FolderPlus className="w-12 h-12" />}
            title="No projects yet"
            description="Create your first project to organize your notes"
            actionLabel="Create Project"
            onAction={onCreateProject}
          />
        ) : (
          sortedProjects.map((project, index) => {
          const isActive = project.id === currentProjectId
          const noteCount = noteCounts[project.id] || 0
          const tooltipContent = `${project.name}\n${formatStatus(project.status || 'active')} • ${noteCount} ${noteCount === 1 ? 'note' : 'notes'}`
          const isDragging = draggedIndex === index
          const isDragOver = dragOverIndex === index

          return (
            <Tooltip key={project.id} content={tooltipContent}>
              <ProjectIconButton
                project={project}
                isActive={isActive}
                noteCount={noteCount}
                onClick={() => onSelectProject(isActive ? null : project.id)}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                isDragging={isDragging}
                isDragOver={isDragOver}
              />
            </Tooltip>
          )
        })
        )}
      </div>

      <div className="sidebar-spacer" />

      {/* Add project button */}
      <button
        className="icon-btn add-project-icon"
        onClick={onCreateProject}
        title="New project (⌘⇧P)"
      >
        <Plus size={16} />
      </button>

      {/* Activity Bar - Search, Recent, Daily, Settings */}
      <ActivityBar
        onSearch={onSearch}
        onRecent={() => setShowRecentNotes(!showRecentNotes)}
        onDaily={onDaily}
        onSettings={onSettings}
        activeItem={activeActivityItem}
        sidebarMode="icon"
      />

      {/* Recent Notes Dropdown */}
      <RecentNotesDropdown
        isOpen={showRecentNotes}
        onClose={() => setShowRecentNotes(false)}
        recentNotes={recentNotes}
        onSelectNote={onSelectNote}
        onClearAll={clearRecentNotes}
      />
    </div>
  )
}

interface ProjectIconButtonProps {
  project: Project
  isActive: boolean
  noteCount: number
  onClick: () => void
  onDragStart?: () => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  onDragEnd?: () => void
  isDragging?: boolean
  isDragOver?: boolean
}

function ProjectIconButton({
  project,
  isActive,
  noteCount,
  onClick,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging = false,
  isDragOver = false
}: ProjectIconButtonProps) {
  const status = project.status || 'active'

  return (
    <button
      className={`project-icon-btn ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
      onClick={onClick}
      data-status={status}
      data-testid={`project-icon-${project.id}`}
      draggable={true}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      {/* Status dot */}
      <StatusDot status={status} size="md" />

      {/* Note count badge */}
      {noteCount > 0 && (
        <span
          className="icon-badge"
          data-testid={`project-badge-${project.id}`}
        >
          {noteCount > 99 ? '99+' : noteCount}
        </span>
      )}

      {/* Active indicator */}
      {isActive && <span className="active-indicator" />}
    </button>
  )
}

function formatStatus(status: string): string {
  const labels: Record<string, string> = {
    'active': 'Active',
    'paused': 'Paused',
    'complete': 'Complete',
    'archive': 'Archived'
  }
  return labels[status] || status
}
