import { Tooltip } from './Tooltip'
import type { SmartIcon } from '../../types'

interface SmartIconButtonProps {
  icon: SmartIcon
  projectCount: number
  isExpanded: boolean
  onClick: () => void
}

/**
 * SmartIconButton component for IconBarMode
 * Shows a permanent smart folder icon that expands to show child projects
 */
export function SmartIconButton({ icon, projectCount, isExpanded, onClick }: SmartIconButtonProps) {
  const tooltipContent = `${icon.label}${projectCount > 0 ? `\n${projectCount} ${projectCount === 1 ? 'project' : 'projects'}` : '\nNo projects'}`

  return (
    <Tooltip content={tooltipContent}>
      <button
        className={`smart-icon-btn ${isExpanded ? 'expanded' : ''}`}
        onClick={onClick}
        data-testid={`smart-icon-${icon.id}`}
        aria-label={`${icon.label}${projectCount > 0 ? ` (${projectCount} projects)` : ''}`}
        style={
          {
            '--smart-icon-color': icon.color
          } as React.CSSProperties
        }
      >
        {/* Smart icon emoji */}
        <span className="smart-icon-emoji">{icon.icon}</span>

        {/* Project count badge (only show if > 0) */}
        {projectCount > 0 && (
          <span className="smart-icon-count" data-testid={`smart-icon-count-${icon.id}`}>
            {projectCount > 99 ? '99+' : projectCount}
          </span>
        )}

        {/* Expanded indicator */}
        {isExpanded && <span className="expanded-indicator" />}
      </button>
    </Tooltip>
  )
}
