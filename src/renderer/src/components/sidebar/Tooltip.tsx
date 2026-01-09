import React, { useState, useEffect, useRef } from 'react'

interface TooltipProps {
  children: React.ReactElement
  content: string
  delay?: number
}

type Position = 'top' | 'bottom' | 'left' | 'right'

export function Tooltip({ children, content, delay = 500 }: TooltipProps) {
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
          bottom: `calc(100% + ${spacing}px)`,
          left: '50%',
          transform: 'translateX(-50%)'
        }
      case 'bottom':
        return {
          top: `calc(100% + ${spacing}px)`,
          left: '50%',
          transform: 'translateX(-50%)'
        }
      case 'left':
        return {
          right: `calc(100% + ${spacing}px)`,
          top: '50%',
          transform: 'translateY(-50%)'
        }
      case 'right':
        return {
          left: `calc(100% + ${spacing}px)`,
          top: '50%',
          transform: 'translateY(-50%)'
        }
    }
  }

  const getArrowStyles = (): string => {
    const base = 'absolute w-2 h-2 bg-gray-900/95 rotate-45'
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
          className="absolute z-[9999] px-2 py-1.5 text-xs text-white bg-gray-900/95 rounded shadow-lg pointer-events-none whitespace-pre-line max-w-[280px] animate-in fade-in duration-150"
          style={getPositionStyles()}
        >
          {content}
          <div className={getArrowStyles()} />
        </div>
      )}
    </div>
  )
}
