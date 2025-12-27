import { Menu, Plus } from 'lucide-react'
import { Project } from '../../types'
import { StatusDot } from './StatusDot'

interface IconBarModeProps {
  projects: Project[]
  currentProjectId: string | null
  onSelectProject: (id: string) => void
  onCreateProject: () => void
  onExpand: () => void
}

const MAX_VISIBLE_PROJECTS = 8

export function IconBarMode({
  projects,
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
        {sortedProjects.map(project => (
          <ProjectIconButton
            key={project.id}
            project={project}
            isActive={project.id === currentProjectId}
            onClick={() => onSelectProject(project.id)}
          />
        ))}
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
  onClick: () => void
}

function ProjectIconButton({ project, isActive, onClick }: ProjectIconButtonProps) {
  const status = project.status || 'active'
  return (
    <button
      className={`project-icon-btn ${isActive ? 'active' : ''}`}
      onClick={onClick}
      title={`${project.name}`}
      data-status={status}
    >
      {/* Status dot */}
      <StatusDot status={status} size="md" />

      {/* Active indicator */}
      {isActive && <span className="active-indicator" />}
    </button>
  )
}
