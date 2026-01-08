import { useMemo } from 'react'
import { Menu, Plus } from 'lucide-react'
import { Project, Note } from '../../types'
import { StatusDot } from './StatusDot'
import { Tooltip } from './Tooltip'
import { ActivityBar } from './ActivityBar'
import { InboxButton } from './InboxButton'
import { useAppViewStore } from '../../store/useAppViewStore'

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
  activeActivityItem?: 'search' | 'daily' | 'settings' | null
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
  activeActivityItem = null
}: IconBarModeProps) {
  // Get pinned vaults from store
  const pinnedVaults = useAppViewStore(state => state.pinnedVaults)

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

  return (
    <div className="mission-sidebar-icon">
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
        onClick={() => onSelectProject(null)}
      />

      <div className="sidebar-divider" />

      {/* Project icons */}
      <div className="project-icons">
        {sortedProjects.map(project => {
          const isActive = project.id === currentProjectId
          const noteCount = noteCounts[project.id] || 0
          const tooltipContent = `${project.name}\n${formatStatus(project.status || 'active')} • ${noteCount} ${noteCount === 1 ? 'note' : 'notes'}`

          return (
            <Tooltip key={project.id} content={tooltipContent}>
              <ProjectIconButton
                project={project}
                isActive={isActive}
                noteCount={noteCount}
                onClick={() => onSelectProject(isActive ? null : project.id)}
              />
            </Tooltip>
          )
        })}
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

      {/* Activity Bar - Search, Daily, Settings */}
      <ActivityBar
        onSearch={onSearch}
        onDaily={onDaily}
        onSettings={onSettings}
        activeItem={activeActivityItem}
      />
    </div>
  )
}

interface ProjectIconButtonProps {
  project: Project
  isActive: boolean
  noteCount: number
  onClick: () => void
}

function ProjectIconButton({ project, isActive, noteCount, onClick }: ProjectIconButtonProps) {
  const status = project.status || 'active'

  return (
    <button
      className={`project-icon-btn ${isActive ? 'active' : ''}`}
      onClick={onClick}
      data-status={status}
      data-testid={`project-icon-${project.id}`}
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
