import { useEffect, useRef, useCallback } from 'react'

const MIN_EDITOR_WIDTH = 500
const ICON_WIDTH = 48
const DEBOUNCE_MS = 150

interface UseResponsiveLayoutOptions {
  leftWidth: number
  rightWidth: number
  leftCollapsed: boolean
  rightCollapsed: boolean
  onCollapseLeft: () => void
  onCollapseRight: () => void
  onExpandLeft: () => void
  onExpandRight: () => void
}

/**
 * Auto-collapse/expand sidebars based on window width.
 *
 * Collapse priority (when shrinking):
 *   1. Collapse right sidebar to icon bar (48px)
 *   2. Collapse left sidebar to icon bar (48px)
 *
 * Expand priority (when growing):
 *   1. Re-expand left sidebar (if auto-collapsed)
 *   2. Re-expand right sidebar (if auto-collapsed)
 *
 * userOverride: If the user manually toggles a sidebar after we
 * auto-collapsed it, we stop managing it until the next resize cycle.
 */
export function useResponsiveLayout({
  leftWidth,
  rightWidth,
  leftCollapsed,
  rightCollapsed,
  onCollapseLeft,
  onCollapseRight,
  onExpandLeft,
  onExpandRight,
}: UseResponsiveLayoutOptions) {
  // Track which sidebars we auto-collapsed (vs user-collapsed)
  const autoCollapsedLeft = useRef(false)
  const autoCollapsedRight = useRef(false)
  // Track user overrides — if user manually re-expands after auto-collapse,
  // don't re-collapse until window actually resizes again
  const userOverrideLeft = useRef(false)
  const userOverrideRight = useRef(false)
  // Track previous collapsed state to detect user-initiated toggles
  const prevLeftCollapsed = useRef(leftCollapsed)
  const prevRightCollapsed = useRef(rightCollapsed)

  // Detect user-initiated sidebar toggles (not caused by us)
  useEffect(() => {
    // If left sidebar was auto-collapsed and user expanded it manually
    if (autoCollapsedLeft.current && prevLeftCollapsed.current && !leftCollapsed) {
      userOverrideLeft.current = true
      autoCollapsedLeft.current = false
    }
    // If right sidebar was auto-collapsed and user expanded it manually
    if (autoCollapsedRight.current && prevRightCollapsed.current && !rightCollapsed) {
      userOverrideRight.current = true
      autoCollapsedRight.current = false
    }
    prevLeftCollapsed.current = leftCollapsed
    prevRightCollapsed.current = rightCollapsed
  }, [leftCollapsed, rightCollapsed])

  const handleResize = useCallback(() => {
    const windowWidth = window.innerWidth

    // Calculate current sidebar pixel widths
    const leftPx = leftCollapsed ? ICON_WIDTH : leftWidth
    const rightPx = rightCollapsed ? ICON_WIDTH : rightWidth
    const editorWidth = windowWidth - leftPx - rightPx

    // --- Shrinking: collapse sidebars to make room ---
    if (editorWidth < MIN_EDITOR_WIDTH) {
      let currentRightPx = rightPx

      // Step 1: Collapse right sidebar first (if expanded and not user-overridden)
      if (!rightCollapsed && !userOverrideRight.current) {
        autoCollapsedRight.current = true
        onCollapseRight()
        currentRightPx = ICON_WIDTH
      }

      // Step 2: Still too narrow? Collapse left sidebar too
      const projectedEditor = windowWidth - leftPx - currentRightPx
      if (projectedEditor < MIN_EDITOR_WIDTH && !leftCollapsed && !userOverrideLeft.current) {
        autoCollapsedLeft.current = true
        onCollapseLeft()
      }
      return
    }

    // --- Growing: re-expand auto-collapsed sidebars ---
    if (editorWidth >= MIN_EDITOR_WIDTH) {
      // Reset user overrides when there's enough room
      // (user can always manually collapse again)
      if (editorWidth > MIN_EDITOR_WIDTH + 100) {
        userOverrideLeft.current = false
        userOverrideRight.current = false
      }

      // Re-expand left first (if we auto-collapsed it)
      if (autoCollapsedLeft.current && leftCollapsed) {
        const projectedEditor = windowWidth - leftWidth - (rightCollapsed ? ICON_WIDTH : rightWidth)
        if (projectedEditor >= MIN_EDITOR_WIDTH) {
          autoCollapsedLeft.current = false
          onExpandLeft()
          return
        }
      }

      // Re-expand right (if we auto-collapsed it)
      if (autoCollapsedRight.current && rightCollapsed) {
        const projectedEditor = windowWidth - (leftCollapsed ? ICON_WIDTH : leftWidth) - rightWidth
        if (projectedEditor >= MIN_EDITOR_WIDTH) {
          autoCollapsedRight.current = false
          onExpandRight()
          return
        }
      }
    }
  }, [leftWidth, rightWidth, leftCollapsed, rightCollapsed, onCollapseLeft, onCollapseRight, onExpandLeft, onExpandRight])

  useEffect(() => {
    // Evaluate layout on mount (catches initial window size, tiling, snap zones)
    handleResize()

    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const debouncedResize = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(handleResize, DEBOUNCE_MS)
    }

    window.addEventListener('resize', debouncedResize)

    // ResizeObserver catches macOS tiling / split-screen that may skip DOM resize events
    const observer = new ResizeObserver(debouncedResize)
    observer.observe(document.documentElement)

    // Tauri native resize — belt-and-suspenders for Stage Manager, Sequoia snap zones
    let unlistenTauri: (() => void) | null = null
    import('@tauri-apps/api/window').then(({ getCurrentWindow }) => {
      getCurrentWindow().onResized(debouncedResize).then(fn => { unlistenTauri = fn })
    }).catch(() => {}) // Graceful no-op in browser mode

    return () => {
      window.removeEventListener('resize', debouncedResize)
      observer.disconnect()
      unlistenTauri?.()
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [handleResize])
}
