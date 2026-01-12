import React, { useState, useEffect, useRef } from 'react'

interface TooltipProps {
  children: React.ReactElement
  content: string
  delay?: number
  hideDelay?: number
}

type Position = 'top' | 'bottom' | 'left' | 'right'

export function Tooltip({ children, content, delay = 0, hideDelay = 200 }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState<Position>('top')
  const timeoutRef = useRef<NodeJS.Timeout>()
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const tooltipId = useRef(`tooltip-${Math.random().toString(36).substr(2, 9)}`)

  const calculatePosition = (): Position => {
    if (!triggerRef.current || !tooltipRef.current) return 'right'

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    const spacing = 8 // Gap between trigger and tooltip

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
    // Prefer top/bottom over left/right
    if (spaceAbove >= tooltipRect.height + spacing) {
      return 'top'
    }
    if (spaceBelow >= tooltipRect.height + spacing) {
      return 'bottom'
    }
    if (spaceRight >= tooltipRect.width + spacing) {
      return 'right'
    }
    if (spaceLeft >= tooltipRect.width + spacing) {
      return 'left'
    }

    // Fallback to position with most space
    return spaceBelow > spaceAbove ? 'bottom' : 'top'
  }

  const getPositionStyles = (): React.CSSProperties => {
    if (!triggerRef.current) return {}

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const spacing = 8

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
    const base = 'tooltip-arrow'
    switch (position) {
      case 'top':
        return `${base} bottom-[-4px] left-1/2 -translate-x-1/2`
      case 'bottom':
        return `${base} top-[-4px] left-1/2 -translate-x-1/2`
      case 'left':
        return `${base} right-[-4px] top-1/2 -translate-y-1/2`
      case 'right':
        return `${base} left-[-4px] top-1/2 -translate-y-1/2`
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
    // Give user time to move mouse to the tooltip (grace period)
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false)
    }, hideDelay)
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
    onContextMenu: (e: React.MouseEvent) => {
      children.props.onContextMenu?.(e)
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
          className="simple-tooltip"
          style={getPositionStyles()}
          onMouseEnter={() => {
            // Cancel hide timeout when mouse enters tooltip
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current)
            }
            setIsVisible(true)
          }}
          onMouseLeave={handleMouseLeave}
        >
          {content}
          <div className={getArrowStyles()} />
        </div>
      )}
    </div>
  )
}
