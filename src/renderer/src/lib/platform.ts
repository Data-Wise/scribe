/**
 * Platform Detection Utilities
 *
 * Detects whether the app is running in Tauri (native) or browser mode.
 * Used to switch between native Tauri APIs and browser IndexedDB fallbacks.
 */

/**
 * Check if running inside Tauri native shell
 */
export const isTauri = (): boolean => {
  return '__TAURI__' in window || '__TAURI_INTERNALS__' in window
}

/**
 * Check if running in browser (not Tauri)
 */
export const isBrowser = (): boolean => !isTauri()

/**
 * Get platform name for logging/debugging
 */
export const getPlatform = (): 'tauri' | 'browser' => {
  return isTauri() ? 'tauri' : 'browser'
}

/**
 * Log platform info on startup (dev only)
 */
export const logPlatformInfo = (): void => {
  if (import.meta.env.DEV) {
    console.log(`[Scribe] Running in ${getPlatform()} mode`)
    if (isBrowser()) {
      console.log('[Scribe] Using IndexedDB for persistence')
    } else {
      console.log('[Scribe] Using Tauri SQLite backend')
    }
  }
}
