import { ProjectStatus } from '../../types'

interface StatusDotProps {
  status?: ProjectStatus
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const STATUS_COLORS: Record<ProjectStatus, string> = {
  active: '#22c55e',    // Green
  planning: '#3b82f6',  // Blue
  complete: '#8b5cf6',  // Purple
  archive: '#6b7280'    // Gray
}

export function StatusDot({ status = 'active', size = 'md', className = '' }: StatusDotProps) {
  const color = STATUS_COLORS[status] || STATUS_COLORS.active

  return (
    <span
      className={`status-dot ${size} ${className}`}
      data-status={status}
      style={{ backgroundColor: color }}
      aria-label={`Status: ${status}`}
    />
  )
}

export function getStatusColor(status: ProjectStatus): string {
  return STATUS_COLORS[status] || STATUS_COLORS.active
}
