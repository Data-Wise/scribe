/**
 * useSystemTheme - System Theme Detection Hook
 * Phase 4 Task 13: Auto-detect dark/light mode from OS settings
 *
 * Detects user's system color scheme preference and listens for changes.
 * Integrates with Scribe's theme system for seamless dark/light mode switching.
 *
 * Features:
 * - Auto-detects OS theme preference
 * - Listens for system theme changes
 * - Returns 'dark' or 'light' (never null)
 * - Cleanup on unmount
 *
 * Usage:
 * ```typescript
 * const systemTheme = useSystemTheme()
 * // systemTheme is 'dark' or 'light'
 * ```
 */

import { useState, useEffect } from 'react'
import { logger } from '../lib/logger'

export type Theme = 'dark' | 'light'

/**
 * Hook to detect and track system theme preference
 * @returns Current system theme ('dark' or 'light')
 */
export function useSystemTheme(): Theme {
  // Check if we're in a browser environment
  const getSystemTheme = (): Theme => {
    if (typeof window === 'undefined') {
      return 'dark' // Default for SSR
    }

    // Use matchMedia API to detect system preference
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return isDark ? 'dark' : 'light'
  }

  const [theme, setTheme] = useState<Theme>(getSystemTheme)

  useEffect(() => {
    // Bail out if not in browser
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    // Handler for theme changes
    const handleThemeChange = (event: MediaQueryListEvent) => {
      const newTheme: Theme = event.matches ? 'dark' : 'light'
      setTheme(newTheme)
      logger.info('[useSystemTheme] System theme changed:', { theme: newTheme })
    }

    // Modern browsers use addEventListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleThemeChange)

      // Cleanup
      return () => {
        mediaQuery.removeEventListener('change', handleThemeChange)
      }
    }
    // Fallback for older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleThemeChange)

      // Cleanup
      return () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(mediaQuery as any).removeListener(handleThemeChange)
      }
    }
  }, [])

  return theme
}

/**
 * Hook variant that syncs with localStorage preference
 * @param storageKey - localStorage key for theme preference (default: 'theme')
 * @returns [currentTheme, setTheme] tuple
 *
 * Behavior:
 * - If user has set a preference (localStorage), use that
 * - Otherwise, use system theme
 * - Allows user to override system preference
 */
export function useThemePreference(storageKey = 'theme'): [Theme, (theme: Theme) => void] {
  const systemTheme = useSystemTheme()
  const [preference, setPreference] = useState<Theme | null>(() => {
    if (typeof window === 'undefined') {
      return null
    }

    const stored = localStorage.getItem(storageKey)
    return stored === 'dark' || stored === 'light' ? stored : null
  })

  const currentTheme = preference || systemTheme

  const setTheme = (newTheme: Theme) => {
    setPreference(newTheme)
    localStorage.setItem(storageKey, newTheme)
    logger.info('[useThemePreference] User preference set:', { theme: newTheme })
  }

  return [currentTheme, setTheme]
}

/**
 * Helper to apply theme to document root
 * @param theme - Theme to apply
 */
export function applyThemeToDocument(theme: Theme): void {
  if (typeof document === 'undefined') {
    return
  }

  // Remove existing theme classes
  document.documentElement.classList.remove('dark', 'light')

  // Add new theme class
  document.documentElement.classList.add(theme)

  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    // Scribe's theme colors
    const themeColor = theme === 'dark' ? '#0f172a' : '#ffffff'
    metaThemeColor.setAttribute('content', themeColor)
  }

  logger.debug('[applyThemeToDocument] Theme applied:', { theme })
}
