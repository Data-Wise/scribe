import { ProjectStatus } from '../../types'

interface StatusDotProps {
  status?: ProjectStatus
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// Map project status to CSS variable names
const STATUS_CSS_VARS: Record<ProjectStatus, string> = {
  active: 'var(--status-active)',
  planning: 'var(--status-planning)',
  complete: 'var(--status-complete)',
  archive: 'var(--status-archive)',
}

// Human-readable status labels
const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'Active',
  planning: 'Planning',
  complete: 'Complete',
  archive: 'Archive',
}

// Size map for consistent sizing
const SIZE_CLASS: Record<string, string> = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
}

export function StatusDot({ status = 'active', size = 'md', className = '' }: StatusDotProps) {
  const color = STATUS_CSS_VARS[status] || STATUS_CSS_VARS.active
  const label = STATUS_LABELS[status] || STATUS_LABELS.active
  const sizeClass = SIZE_CLASS[size] || SIZE_CLASS.md

  return (
    <span
      className={`inline-block rounded-full transition-colors duration-150 ${sizeClass} ${className}`}
      data-status={status}
      style={{ backgroundColor: color }}
      aria-label={`Status: ${label}`}
      title={label}
    />
  )
}

export function getStatusColor(status: ProjectStatus): string {
  return STATUS_CSS_VARS[status] || STATUS_CSS_VARS.active
}
