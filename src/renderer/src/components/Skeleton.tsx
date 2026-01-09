/**
 * Skeleton Loading Components
 *
 * Provides skeleton loaders for better perceived performance during loading states.
 * Phase 3 Task 8: Skeleton Loaders
 */

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

/**
 * Base Skeleton component
 * Generic skeleton with customizable shape and animation
 */
export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md'
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-wave',
    none: ''
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`bg-gray-700/50 ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}

/**
 * SkeletonNote - Compact note list item
 * Used in sidebars and search results
 */
export function SkeletonNote() {
  return (
    <div className="px-4 py-3 border-b border-gray-700/50">
      <div className="flex items-start gap-3">
        {/* Icon skeleton */}
        <Skeleton variant="circular" width={16} height={16} className="mt-1" />

        <div className="flex-1 min-w-0">
          {/* Title skeleton */}
          <Skeleton height={16} width="75%" className="mb-2" />

          {/* Content preview skeleton */}
          <Skeleton height={12} width="90%" className="mb-1" />
          <Skeleton height={12} width="60%" />
        </div>
      </div>

      {/* Metadata skeleton */}
      <div className="flex items-center gap-2 mt-2 pl-7">
        <Skeleton height={10} width={60} />
        <Skeleton height={10} width={40} />
      </div>
    </div>
  )
}

/**
 * SkeletonProject - Project card
 * Used in Mission Control and project lists
 */
export function SkeletonProject() {
  return (
    <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
      <div className="flex items-start gap-3 mb-3">
        {/* Project color indicator */}
        <Skeleton variant="circular" width={12} height={12} className="mt-1" />

        <div className="flex-1 min-w-0">
          {/* Project name */}
          <Skeleton height={18} width="60%" className="mb-2" />
          {/* Project description */}
          <Skeleton height={14} width="85%" />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-700/30">
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton height={12} width={30} />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton height={12} width={40} />
        </div>
      </div>
    </div>
  )
}

/**
 * SkeletonSearchResult - Search result item
 * Used in search panel
 */
export function SkeletonSearchResult() {
  return (
    <div className="px-4 py-3 border-b border-gray-700/50 hover:bg-gray-800/50">
      <div className="flex items-start gap-3">
        <Skeleton variant="circular" width={20} height={20} className="mt-0.5" />

        <div className="flex-1 min-w-0">
          {/* Title with folder */}
          <div className="flex items-center gap-2 mb-2">
            <Skeleton height={14} width={80} />
            <Skeleton height={10} width={60} />
          </div>

          {/* Highlighted search snippet */}
          <Skeleton height={12} width="95%" className="mb-1" />
          <Skeleton height={12} width="80%" />

          {/* Updated timestamp */}
          <Skeleton height={10} width={100} className="mt-2" />
        </div>
      </div>
    </div>
  )
}

/**
 * SkeletonBacklink - Backlink item
 * Used in backlinks panel
 */
export function SkeletonBacklink() {
  return (
    <div className="px-3 py-2 hover:bg-gray-800/50 cursor-pointer">
      <div className="flex items-center gap-2 mb-1">
        <Skeleton variant="circular" width={16} height={16} />
        <Skeleton height={14} width="70%" />
      </div>
      <Skeleton height={11} width="90%" className="ml-6" />
    </div>
  )
}

/**
 * SkeletonTag - Tag item
 * Used in tags panel
 */
export function SkeletonTag() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-800/50">
      <Skeleton variant="circular" width={8} height={8} />
      <Skeleton height={14} width={80} />
      <Skeleton height={12} width={20} className="ml-auto" />
    </div>
  )
}

/**
 * SkeletonList - Multiple skeleton items
 * Renders a list of skeleton loaders
 */
interface SkeletonListProps {
  count?: number
  component: React.ComponentType
  className?: string
}

export function SkeletonList({ count = 3, component: Component, className = '' }: SkeletonListProps) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  )
}
