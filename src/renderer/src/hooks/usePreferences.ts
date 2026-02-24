import { useState, useCallback, useEffect } from 'react'
import { loadPreferences, updatePreferences, UserPreferences } from '../lib/preferences'

/**
 * usePreferences — Cached preferences hook
 *
 * Reads from localStorage once on mount, caches in React state.
 * Provides updatePref/togglePref that write-through to localStorage
 * and keep the cache in sync.
 *
 * Listens for 'preferences-changed' events (dispatched by savePreferences)
 * so that multiple components using this hook stay in sync within the same tab.
 */
export function usePreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(() => loadPreferences())

  // Sync when any component (or external code) writes preferences
  useEffect(() => {
    const handleChange = () => setPrefs(loadPreferences())
    window.addEventListener('preferences-changed', handleChange)
    return () => window.removeEventListener('preferences-changed', handleChange)
  }, [])

  const updatePref = useCallback(
    <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      updatePreferences({ [key]: value } as Partial<UserPreferences>)
      // State updates via the 'preferences-changed' event listener above
    },
    []
  )

  const togglePref = useCallback(
    (key: keyof UserPreferences) => {
      // Read from localStorage (not cached state) to ensure we toggle from
      // the latest value, even if React hasn't re-rendered yet. This keeps
      // the callback reference stable (empty deps) while avoiding stale reads.
      const current = loadPreferences()
      const val = current[key]
      if (typeof val !== 'boolean') return
      updatePreferences({ [key]: !val } as Partial<UserPreferences>)
    },
    []
  )

  return { prefs, updatePref, togglePref }
}
