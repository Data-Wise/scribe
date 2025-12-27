import { useCallback } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'

interface DragRegionProps {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

/**
 * DragRegion - A component that enables window dragging on mousedown
 *
 * Uses Tauri 2's window.startDragging() API which is more reliable
 * than CSS-based dragging (-webkit-app-region: drag) for Overlay title bars.
 */
export function DragRegion({ children, className = '', style }: DragRegionProps) {
  const handleMouseDown = useCallback(async (e: React.MouseEvent) => {
    // Only start dragging on left mouse button
    if (e.button !== 0) return

    // Don't drag if clicking on interactive elements
    const target = e.target as HTMLElement
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('textarea')
    ) {
      return
    }

    try {
      await getCurrentWindow().startDragging()
    } catch (err) {
      console.error('Failed to start window drag:', err)
    }
  }, [])

  return (
    <div
      className={`drag-region ${className}`}
      style={{ cursor: 'grab', ...style }}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  )
}

/**
 * Hook to add drag functionality to any element
 */
export function useDragRegion() {
  const handleMouseDown = useCallback(async (e: React.MouseEvent) => {
    if (e.button !== 0) return

    const target = e.target as HTMLElement
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('textarea')
    ) {
      return
    }

    try {
      await getCurrentWindow().startDragging()
    } catch (err) {
      console.error('Failed to start window drag:', err)
    }
  }, [])

  return { onMouseDown: handleMouseDown }
}
