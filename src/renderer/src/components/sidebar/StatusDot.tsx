import { ProjectStatus } from '../../types'

interface StatusDotProps {
  status?: ProjectStatus
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const STATUS_COLORS: Record<ProjectStatus, string> = {
  active: '#22c55e',    // Green
  planning: '#eab308',  // Yellow
  archive: '#6b7280',   // Gray
  complete: '#3b82f6'   // Blue
}

const SIZE_MAP = {
  sm: 6,
  md: 8,
  lg: 10
}

export function StatusDot({ status = 'active', size = 'md', className = '' }: StatusDotProps) {
  const sizeValue = SIZE_MAP[size]
  const color = STATUS_COLORS[status] || STATUS_COLORS.active

  return (
    <span
      className={`inline-block rounded-full flex-shrink-0 ${className}`}
      style={{
        width: sizeValue,
        height: sizeValue,
        backgroundColor: color
      }}
      aria-label={`Status: ${status}`}
    />
  )
}

export function getStatusColor(status: ProjectStatus): string {
  return STATUS_COLORS[status] || STATUS_COLORS.active
}
