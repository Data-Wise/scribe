import { useMemo } from 'react'
import { Project } from '../../types'
import { ProjectAvatar } from './ProjectAvatar'
import { Tooltip } from './Tooltip'

interface ExpandedChildProjectsProps {
  projects: Project[]
  currentProjectId: string | null
  onSelectProject: (id: string) => void
  noteCounts: Record<string, number>
  smartIconColor: string  // Color of the parent smart icon
}

/**
 * ExpandedChildProjects - Shows indented list of projects below a smart icon
 * Displays when smart icon is expanded in accordion mode
 * Shows first-letter icon + project name + metadata (note count, last edited)
 */
export function ExpandedChildProjects({
  projects,
  currentProjectId,
  onSelectProject,
  noteCounts,
  smartIconColor
}: ExpandedChildProjectsProps) {
  // Sort projects alphabetically
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => a.name.localeCompare(b.name))
  }, [projects])

  if (sortedProjects.length === 0) {
    return (
      <div className="expanded-child-projects empty">
        <span className="empty-message">No projects</span>
      </div>
    )
  }

  return (
    <div className="expanded-child-projects">
      {sortedProjects.map((project) => {
        const isActive = project.id === currentProjectId
        const noteCount = noteCounts[project.id] || 0
        const status = project.status || 'active'
        const firstLetter = project.name[0] || '?'
        const truncatedName = truncateProjectName(project.name, 16)
        const lastEdited = formatRelativeTime(project.updated_at || project.created_at)
        const tooltipContent = `${project.name}\n${formatStatus(status)} • ${noteCount} ${noteCount === 1 ? 'note' : 'notes'}`

        return (
          <Tooltip key={project.id} content={tooltipContent}>
            <button
              className={`child-project-btn expanded ${isActive ? 'active' : ''}`}
              onClick={() => onSelectProject(project.id)}
              data-status={status}
              data-testid={`child-project-${project.id}`}
            >
              {/* First letter icon */}
              <ProjectAvatar
                letter={firstLetter}
                color={smartIconColor}
                size="md"
              />

              {/* Project info (2-line layout) */}
              <div className="project-info">
                <span className="project-name">{truncatedName}</span>
                <span className="project-meta">
                  {noteCount} {noteCount === 1 ? 'note' : 'notes'} • {lastEdited}
                </span>
              </div>

              {/* Active indicator */}
              {isActive && <span className="active-indicator" />}
            </button>
          </Tooltip>
        )
      })}
    </div>
  )
}

function formatStatus(status: string): string {
  const labels: Record<string, string> = {
    'active': 'Active',
    'planning': 'Planning',
    'complete': 'Complete',
    'archive': 'Archived'
  }
  return labels[status] || status
}

function truncateProjectName(name: string, maxLength: number): string {
  if (name.length <= maxLength) return name

  // Truncate at word boundary if possible
  const truncated = name.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  // If we have a space in the latter 60% of the string, cut there
  if (lastSpace > maxLength * 0.6) {
    return truncated.slice(0, lastSpace) + '…'
  }

  // Otherwise just truncate and add ellipsis
  return truncated.slice(0, maxLength - 1) + '…'
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
  return `${Math.floor(diffDays / 365)}y ago`
}
