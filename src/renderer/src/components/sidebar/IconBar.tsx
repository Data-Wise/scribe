import { useMemo, useState, useEffect } from 'react'
import { Plus, FolderPlus, Folder } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { Project, Note, ExpandedIconType, SmartIconId } from '../../types'
import { StatusDot } from './StatusDot'
import { Tooltip } from './Tooltip'
import { ActivityBar } from './ActivityBar'
import { InboxButton } from './InboxButton'
import { SmartIconButton } from './SmartIconButton'
import { EmptyState } from './EmptyState'
import { RecentNotesDropdown } from './RecentNotesDropdown'
import { ProjectContextMenu } from './ProjectContextMenu'
import { useAppViewStore } from '../../store/useAppViewStore'

/**
 * IconBar - Icon-only sidebar strip (48px wide, always visible)
 *
 * v1.16.0 Icon-Centric Expansion:
 * - Always rendered (no collapse mode)
 * - Icons call onToggleVault/onToggleSmartIcon for expansion
 * - Visual active state based on expandedIcon prop
 */

interface IconBarProps {
  // Data
  projects: Project[]
  notes: Note[]

  // Icon-centric expansion state
  expandedIcon: ExpandedIconType

  // Icon toggle handlers
  onToggleVault: (vaultId: string) => void
  onToggleSmartIcon: (iconId: SmartIconId) => void

  // Activity Bar handlers
  onSearch: () => void
  onDaily: () => void
  onSettings: () => void
  onSelectNote: (noteId: string) => void
  onCreateProject: () => void

  // Project management handlers (for context menu)
  onEditProject?: (projectId: string) => void
  onArchiveProject?: (projectId: string) => void
  onDeleteProject?: (projectId: string) => void
  onPinProject?: (projectId: string) => void
  onUnpinProject?: (projectId: string) => void
  onNewNote?: (projectId?: string) => void

  activeActivityItem?: 'search' | 'daily' | 'recent' | 'settings' | null
}

export function IconBar({
  projects,
  notes,
  expandedIcon,
  onToggleVault,
  onToggleSmartIcon,
  onSearch,
  onDaily,
  onSettings,
  onSelectNote,
  onCreateProject,
  onEditProject,
  onArchiveProject,
  onDeleteProject,
  onPinProject,
  onUnpinProject,
  onNewNote,
  activeActivityItem = null
}: IconBarProps) {
  // Get pinned vaults and smart icons from store
  const pinnedVaults = useAppViewStore(state => state.pinnedVaults)
  const reorderPinnedVaults = useAppViewStore(state => state.reorderPinnedVaults)
  const smartIcons = useAppViewStore(state => state.smartIcons)
  const recentNotes = useAppViewStore(state => state.recentNotes)
  const clearRecentNotes = useAppViewStore(state => state.clearRecentNotes)

  // Drag state for pinned projects
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Recent notes dropdown state
  const [showRecentNotes, setShowRecentNotes] = useState(false)

  // Phase 3: Click pulse animation state
  const [justActivatedId, setJustActivatedId] = useState<string | null>(null)

  // Context menu state
  const [projectContextMenu, setProjectContextMenu] = useState<{ project: Project; position: { x: number; y: number } } | null>(null)

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

  // Check if Inbox is expanded
  const isInboxExpanded = expandedIcon?.type === 'vault' && expandedIcon?.id === 'inbox'

  // Compute project counts per smart icon
  const smartIconProjectCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    smartIcons.forEach(icon => {
      counts[icon.id] = projects.filter(p => p.type === icon.projectType).length
    })
    return counts
  }, [projects, smartIcons])

  // Drag handlers for pinned projects
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

  // Context menu handler
  const handleProjectContextMenu = (e: React.MouseEvent, project: Project) => {
    e.preventDefault()
    setProjectContextMenu({ project, position: { x: e.clientX, y: e.clientY } })
  }

  return (
    <div className="mission-sidebar-icon" style={{ width: 48 }}>
      {/* Inbox button (always at top) */}
      <InboxButton
        unreadCount={inboxCount}
        isActive={isInboxExpanded}
        onClick={() => onToggleVault('inbox')}
      />

      <div className="sidebar-divider" />

      {/* Smart Icons - Permanent folders */}
      {smartIcons
        .filter(icon => icon.isVisible)
        .sort((a, b) => a.order - b.order)
        .map((icon) => {
          const isExpanded = expandedIcon?.type === 'smart' && expandedIcon?.id === icon.id
          return (
            <SmartIconButton
              key={icon.id}
              icon={icon}
              projectCount={smartIconProjectCounts[icon.id] || 0}
              isExpanded={isExpanded}
              onClick={() => onToggleSmartIcon(icon.id)}
            />
          )
        })}

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
            const isExpanded = expandedIcon?.type === 'vault' && expandedIcon?.id === project.id
            const noteCount = noteCounts[project.id] || 0
            const tooltipContent = `${project.name}\n${formatStatus(project.status || 'active')} • ${noteCount} ${noteCount === 1 ? 'note' : 'notes'}`
            const isDragging = draggedIndex === index
            const isDragOver = dragOverIndex === index
            const justActivated = justActivatedId === project.id

            // Phase 3: Click handler with pulse animation
            const handleIconClick = () => {
              // Only trigger pulse when expanding (not collapsing)
              if (!isExpanded) {
                setJustActivatedId(project.id)
                setTimeout(() => setJustActivatedId(null), 400)
              }
              onToggleVault(project.id)
            }

            return (
              <Tooltip key={project.id} content={tooltipContent}>
                <ProjectIconButton
                  project={project}
                  isExpanded={isExpanded}
                  noteCount={noteCount}
                  onClick={handleIconClick}
                  onContextMenu={(e) => handleProjectContextMenu(e, project)}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  isDragging={isDragging}
                  isDragOver={isDragOver}
                  justActivated={justActivated}
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

      {/* Project Context Menu */}
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
        />
      )}
    </div>
  )
}

// ProjectIconButton component
interface ProjectIconButtonProps {
  project: Project
  isExpanded: boolean
  noteCount: number
  onClick: () => void
  onContextMenu?: (e: React.MouseEvent) => void
  onDragStart?: () => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  onDragEnd?: () => void
  isDragging?: boolean
  isDragOver?: boolean
  justActivated?: boolean  // Phase 3: For click pulse animation
}

// Helper to get Lucide icon component by name
function getProjectIcon(iconName?: string) {
  if (!iconName) return Folder

  // Try to get the icon from lucide-react
  const IconComponent = (LucideIcons as any)[iconName]
  return IconComponent || Folder
}

function ProjectIconButton({
  project,
  isExpanded,
  noteCount,
  onClick,
  onContextMenu,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging = false,
  isDragOver = false,
  justActivated = false
}: ProjectIconButtonProps) {
  const status = project.status || 'active'
  const Icon = getProjectIcon(project.icon)

  return (
    <button
      className={`project-icon-btn ${isExpanded ? 'expanded' : ''} ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''} ${justActivated ? 'just-activated' : ''}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      data-status={status}
      data-testid={`project-icon-${project.id}`}
      draggable={true}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      {/* Project icon */}
      <Icon className="project-icon-main" size={18} />

      {/* Status dot overlay (bottom-right corner) */}
      <StatusDot status={status} size="sm" className="project-status-overlay" />

      {/* Note count badge */}
      {noteCount > 0 && (
        <span
          className="icon-badge"
          data-testid={`project-badge-${project.id}`}
        >
          {noteCount > 99 ? '99+' : noteCount}
        </span>
      )}

      {/* Expanded indicator (replaces active indicator) */}
      {isExpanded && <span className="active-indicator" />}
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
