import { useCallback, useEffect, useRef, useState } from 'react'

interface ResizeHandleProps {
  onResize: (deltaX: number) => void
  onResizeEnd: () => void
  onReset?: () => void
  onDragStateChange?: (isDragging: boolean) => void
  disabled?: boolean
}

export function ResizeHandle({
  onResize,
  onResizeEnd,
  onReset,
  onDragStateChange,
  disabled = false
}: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false)
  const startXRef = useRef(0)

  // Notify parent of drag state changes (for .resizing class)
  useEffect(() => {
    onDragStateChange?.(isDragging)
  }, [isDragging, onDragStateChange])

  // --- Mouse handlers ---
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(true)
    startXRef.current = e.clientX
  }, [disabled])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (disabled) return
    e.preventDefault()
    if (onReset) onReset()
    onResizeEnd()
  }, [disabled, onReset, onResizeEnd])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - startXRef.current
    startXRef.current = e.clientX
    onResize(deltaX)
  }, [isDragging, onResize])

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      onResizeEnd()
    }
  }, [isDragging, onResizeEnd])

  // --- Touch handlers ---
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(true)
    startXRef.current = e.touches[0].clientX
  }, [disabled])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const deltaX = e.touches[0].clientX - startXRef.current
    startXRef.current = e.touches[0].clientX
    onResize(deltaX)
  }, [isDragging, onResize])

  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      onResizeEnd()
    }
  }, [isDragging, onResizeEnd])

  // Register document-level mouse and touch listeners while dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  if (disabled) return null

  return (
    <div
      className={`resize-handle ${isDragging ? 'dragging' : ''}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDoubleClick={handleDoubleClick}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar (double-click to reset)"
      aria-valuenow={undefined}
      title="Double-click to reset width"
    />
  )
}
