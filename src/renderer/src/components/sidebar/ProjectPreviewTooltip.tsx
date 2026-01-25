import React from 'react'
import { Project } from '../../types'
import { ContextualTooltip } from './ContextualTooltip'

interface ProjectPreviewTooltipProps {
  children: React.ReactElement
  project: Project
  noteCount: number
  isActive?: boolean
  triggerRef?: React.RefObject<HTMLElement>
}

/**
 * ProjectPreviewTooltip - Hover preview for projects in compact view
 *
 * Shows brief project information on hover:
 * - Project name
 * - Note count
 * - Progress bar (if defined)
 * - Last updated timestamp
 *
 * NO action buttons - this is for preview only.
 * For actions, use right-click context menu.
 */
export function ProjectPreviewTooltip({
  children,
  project,
  noteCount,
  isActive = false
}: ProjectPreviewTooltipProps) {
  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    if (years > 0) return `${years}y ago`
    if (months > 0) return `${months}mo ago`
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'just now'
  }

  // Build subtitle from note count and last updated
  const subtitle = `${noteCount} note${noteCount !== 1 ? 's' : ''} • Updated ${formatTimeAgo(project.updated_at)}`

  return (
    <ContextualTooltip
      title={project.name}
      subtitle={subtitle}
      badge={isActive ? 'Active Project' : undefined}
      actions={[]}  // NO actions - preview only
      delay={0}     // Instant show
      hideDelay={200}  // 200ms grace period
    >
      {children}
    </ContextualTooltip>
  )
}
