import { useCallback } from 'react'
import { isTauri } from '../lib/platform'

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
 *
 * In browser mode, this is a no-op (just renders children).
 */
export function DragRegion({ children, className = '', style }: DragRegionProps) {
  const handleMouseDown = useCallback(async (e: React.MouseEvent) => {
    // Skip in browser mode - no window dragging available
    if (!isTauri()) return

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
      // Dynamic import to avoid errors in browser mode
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      await getCurrentWindow().startDragging()
    } catch (err) {
      console.error('Failed to start window drag:', err)
    }
  }, [])

  return (
    <div
      className={`drag-region ${className}`}
      style={{ cursor: isTauri() ? 'grab' : 'default', ...style }}
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
    // Skip in browser mode
    if (!isTauri()) return

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
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      await getCurrentWindow().startDragging()
    } catch (err) {
      console.error('Failed to start window drag:', err)
    }
  }, [])

  return { onMouseDown: handleMouseDown }
}
