import { useState, useEffect, useCallback } from 'react'

const ZOOM_KEY = 'scribe:zoomLevel'
const ZOOM_MIN = 0.5
const ZOOM_MAX = 2.0
const ZOOM_STEP = 0.1
const ZOOM_DEFAULT = 1.0

function clampZoom(value: number): number {
  return Math.round(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, value)) * 10) / 10
}

function loadZoom(): number {
  try {
    const saved = localStorage.getItem(ZOOM_KEY)
    if (saved) {
      const parsed = parseFloat(saved)
      if (!isNaN(parsed)) return clampZoom(parsed)
    }
  } catch { /* ignore */ }
  return ZOOM_DEFAULT
}

function applyZoom(factor: number) {
  // Use CSS font-size scaling — works in both Tauri and browser
  document.documentElement.style.fontSize = `${factor * 100}%`
}

/**
 * Global UI zoom hook.
 *
 * Listens for ⌘+/⌘- to zoom in/out. Persists to localStorage.
 * Applies zoom via root font-size scaling (compatible with rem units).
 * Range: 50% – 200%, in 10% steps. WCAG 1.4.4 compliant (up to 200%).
 */
export function useGlobalZoom() {
  const [zoomLevel, setZoomLevel] = useState(loadZoom)

  // Apply zoom on mount and changes
  useEffect(() => {
    applyZoom(zoomLevel)
    try {
      localStorage.setItem(ZOOM_KEY, String(zoomLevel))
    } catch { /* ignore */ }
  }, [zoomLevel])

  const zoomIn = useCallback(() => {
    setZoomLevel(prev => clampZoom(prev + ZOOM_STEP))
  }, [])

  const zoomOut = useCallback(() => {
    setZoomLevel(prev => clampZoom(prev - ZOOM_STEP))
  }, [])

  const resetZoom = useCallback(() => {
    setZoomLevel(ZOOM_DEFAULT)
  }, [])

  // Keyboard shortcut listener: ⌘= (zoom in), ⌘- (zoom out), ⌘0 is taken by dashboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey) return

      // ⌘= or ⌘+ (zoom in) — shift not required but allowed (⌘+ requires shift on US keyboards)
      if (e.key === '=' || e.key === '+') {
        e.preventDefault()
        zoomIn()
        return
      }

      // ⌘- (zoom out)
      if (e.key === '-' && !e.shiftKey) {
        e.preventDefault()
        zoomOut()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [zoomIn, zoomOut])

  return { zoomLevel, zoomIn, zoomOut, resetZoom }
}
