import { useMemo } from 'react'
import { Menu, Plus } from 'lucide-react'
import { Project, Note } from '../../types'
import { StatusDot } from './StatusDot'

interface IconBarModeProps {
  projects: Project[]
  notes: Note[]
  currentProjectId: string | null
  onSelectProject: (id: string | null) => void
  onCreateProject: () => void
  onExpand: () => void
}

const MAX_VISIBLE_PROJECTS = 8

export function IconBarMode({
  projects,
  notes,
  currentProjectId,
  onSelectProject,
  onCreateProject,
  onExpand
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
          return (
            <ProjectIconButton
              key={project.id}
              project={project}
              isActive={isActive}
              noteCount={noteCounts[project.id] || 0}
              onClick={() => onSelectProject(isActive ? null : project.id)}
            />
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
  const statusLabel = formatStatus(status)
  const tooltip = `${project.name}\n${statusLabel} • ${noteCount} ${noteCount === 1 ? 'note' : 'notes'}`

  return (
    <button
      className={`project-icon-btn ${isActive ? 'active' : ''}`}
      onClick={onClick}
      title={tooltip}
      data-status={status}
    >
      {/* Status dot */}
      <StatusDot status={status} size="md" />

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
