import React, { useState, useEffect, useRef } from 'react'
import { MoreHorizontal, Pin, FolderOpen } from 'lucide-react'

interface TooltipAction {
  label: string
  icon?: React.ReactNode
  onClick: (e?: React.MouseEvent) => void
  variant?: 'default' | 'primary'
}

interface ContextualTooltipProps {
  children: React.ReactElement
  title: string
  subtitle?: string
  actions?: TooltipAction[]
  delay?: number
}

type Position = 'top' | 'bottom' | 'left' | 'right'

/**
 * ContextualTooltip - VS Code-style tooltip with action buttons
 *
 * Extends the basic Tooltip component to support contextual actions:
 * - Project hover: Open, Pin, More actions
 * - Note hover: Open, Move, Duplicate actions
 * - Smart icons: Quick actions for filtered views
 *
 * Inspired by VS Code's hover tooltips with inline buttons.
 */
export function ContextualTooltip({
  children,
  title,
  subtitle,
  actions = [],
  delay = 500
}: ContextualTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState<Position>('right')
  const timeoutRef = useRef<NodeJS.Timeout>()
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const tooltipId = useRef(`contextual-tooltip-${Math.random().toString(36).substr(2, 9)}`)

  const calculatePosition = (): Position => {
    if (!triggerRef.current || !tooltipRef.current) return 'right'

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    const spacing = 12 // Larger gap for action tooltip

    // Check available space in each direction
    const spaceAbove = triggerRect.top
    const spaceBelow = viewport.height - triggerRect.bottom
    const spaceLeft = triggerRect.left
    const spaceRight = viewport.width - triggerRect.right

    // Special handling for left sidebar (narrow width < 100px from left edge)
    const isInLeftSidebar = triggerRect.left < 100

    if (isInLeftSidebar) {
      // Strongly prefer right position for left sidebar items
      if (spaceRight >= tooltipRect.width + spacing) {
        return 'right'
      }
      // Fallback to vertical if absolutely necessary
      if (spaceBelow >= tooltipRect.height + spacing) {
        return 'bottom'
      }
      if (spaceAbove >= tooltipRect.height + spacing) {
        return 'top'
      }
      // Last resort: right even if cramped
      return 'right'
    }

    // Normal positioning for other elements
    // Prefer right for action tooltips (more space for buttons)
    if (spaceRight >= tooltipRect.width + spacing) {
      return 'right'
    }
    if (spaceBelow >= tooltipRect.height + spacing) {
      return 'bottom'
    }
    if (spaceAbove >= tooltipRect.height + spacing) {
      return 'top'
    }
    if (spaceLeft >= tooltipRect.width + spacing) {
      return 'left'
    }

    // Fallback to position with most space
    return spaceRight > spaceLeft ? 'right' : 'left'
  }

  const getPositionStyles = (): React.CSSProperties => {
    if (!triggerRef.current) return {}

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const spacing = 12

    switch (position) {
      case 'top':
        return {
          left: `${triggerRect.left + triggerRect.width / 2}px`,
          top: `${triggerRect.top - spacing}px`,
          transform: 'translate(-50%, -100%)'
        }
      case 'bottom':
        return {
          left: `${triggerRect.left + triggerRect.width / 2}px`,
          top: `${triggerRect.bottom + spacing}px`,
          transform: 'translateX(-50%)'
        }
      case 'left':
        return {
          left: `${triggerRect.left - spacing}px`,
          top: `${triggerRect.top + triggerRect.height / 2}px`,
          transform: 'translate(-100%, -50%)'
        }
      case 'right':
        return {
          left: `${triggerRect.right + spacing}px`,
          top: `${triggerRect.top + triggerRect.height / 2}px`,
          transform: 'translateY(-50%)'
        }
    }
  }

  const getArrowStyles = (): string => {
    const base = 'absolute w-2 h-2 rotate-45'
    const bgColor = 'bg-gray-800/98 dark:bg-gray-800/98'

    switch (position) {
      case 'top':
        return `${base} ${bgColor} bottom-[-4px] left-1/2 -translate-x-1/2`
      case 'bottom':
        return `${base} ${bgColor} top-[-4px] left-1/2 -translate-x-1/2`
      case 'left':
        return `${base} ${bgColor} right-[-4px] top-1/2 -translate-y-1/2`
      case 'right':
        return `${base} ${bgColor} left-[-4px] top-1/2 -translate-y-1/2`
    }
  }

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
      // Calculate position after tooltip is rendered
      requestAnimationFrame(() => {
        setPosition(calculatePosition())
      })
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Update position on window resize
  useEffect(() => {
    if (!isVisible) return

    const handleResize = () => {
      setPosition(calculatePosition())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isVisible])

  // Clone child element to add event handlers and ref
  const trigger = React.cloneElement(children, {
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter()
      children.props.onMouseEnter?.(e)
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave()
      children.props.onMouseLeave?.(e)
    },
    'aria-describedby': isVisible ? tooltipId.current : undefined
  })

  return (
    <div ref={triggerRef} className="relative inline-block">
      {trigger}
      {isVisible && (
        <div
          ref={tooltipRef}
          id={tooltipId.current}
          role="tooltip"
          className="contextual-tooltip"
          style={getPositionStyles()}
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={handleMouseLeave}
        >
          {/* Content */}
          <div className="contextual-tooltip-content">
            <div className="contextual-tooltip-title">{title}</div>
            {subtitle && (
              <div className="contextual-tooltip-subtitle">{subtitle}</div>
            )}
          </div>

          {/* Actions */}
          {actions.length > 0 && (
            <>
              <div className="contextual-tooltip-divider" />
              <div className="contextual-tooltip-actions">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    className={`contextual-tooltip-action ${action.variant === 'primary' ? 'primary' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      action.onClick()
                      setIsVisible(false)
                    }}
                    title={action.label}
                  >
                    {action.icon && <span className="action-icon">{action.icon}</span>}
                    <span className="action-label">{action.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Arrow */}
          <div className={getArrowStyles()} />
        </div>
      )}
    </div>
  )
}

/**
 * Pre-configured project tooltip with common actions
 */
interface ProjectTooltipProps {
  children: React.ReactElement
  projectName: string
  status: string
  noteCount: number
  onOpen: () => void
  onPin?: () => void
  onMore: (e: React.MouseEvent) => void
  isPinned?: boolean
}

export function ProjectTooltip({
  children,
  projectName,
  status,
  noteCount,
  onOpen,
  onPin,
  onMore,
  isPinned = false
}: ProjectTooltipProps) {
  const actions: TooltipAction[] = [
    {
      label: 'Open',
      icon: <FolderOpen size={14} />,
      onClick: onOpen,
      variant: 'primary'
    }
  ]

  if (onPin) {
    actions.push({
      label: isPinned ? 'Unpin' : 'Pin',
      icon: <Pin size={14} />,
      onClick: onPin
    })
  }

  actions.push({
    label: 'More',
    icon: <MoreHorizontal size={14} />,
    onClick: (e: any) => onMore(e)
  })

  const subtitle = `${status} • ${noteCount} note${noteCount !== 1 ? 's' : ''}`

  return (
    <ContextualTooltip
      title={projectName}
      subtitle={subtitle}
      actions={actions}
    >
      {children}
    </ContextualTooltip>
  )
}
