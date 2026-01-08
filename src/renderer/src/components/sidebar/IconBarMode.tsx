import { useMemo } from 'react'
import { Menu, Plus } from 'lucide-react'
import { Project, Note } from '../../types'
import { StatusDot } from './StatusDot'
import { Tooltip } from './Tooltip'
import { ActivityBar } from './ActivityBar'

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

const MAX_VISIBLE_PROJECTS = 8

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
  // Show active projects first, then by updated_at (treat undefined status as 'active')
  const sortedProjects = [...projects]
    .filter(p => (p.status || 'active') !== 'archive')
    .sort((a, b) => {
      if (a.id === currentProjectId) return -1
      if (b.id === currentProjectId) return 1
      return b.updated_at - a.updated_at
    })
    .slice(0, MAX_VISIBLE_PROJECTS)

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
