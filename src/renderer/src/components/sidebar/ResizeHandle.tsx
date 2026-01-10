import { useCallback, useEffect, useState } from 'react'

interface ResizeHandleProps {
  onResize: (deltaX: number) => void
  onResizeEnd: () => void
  onReset?: () => void
  disabled?: boolean
}

export function ResizeHandle({
  onResize,
  onResizeEnd,
  onReset,
  disabled = false
}: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(true)
    setStartX(e.clientX)
  }, [disabled])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (disabled) return
    e.preventDefault()

    // Call onReset callback if provided
    if (onReset) {
      onReset()
    }

    // Call onResizeEnd to save the reset state
    onResizeEnd()
  }, [disabled, onReset, onResizeEnd])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - startX
    setStartX(e.clientX)
    onResize(deltaX)
  }, [isDragging, startX, onResize])

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      onResizeEnd()
    }
  }, [isDragging, onResizeEnd])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  if (disabled) return null

  return (
    <div
      className={`resize-handle ${isDragging ? 'dragging' : ''}`}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar (double-click to reset)"
      title="Double-click to reset width"
    />
  )
}
