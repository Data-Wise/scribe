/**
 * Browser Dialog Fallbacks
 *
 * Provides browser-native alternatives to Tauri dialog APIs.
 * Uses browser confirm(), alert(), and prompt() as fallbacks.
 */

import { isTauri } from './platform'

/**
 * File picker fallback using HTML input element
 */
export const openFileDialog = async (options?: {
  directory?: boolean
  multiple?: boolean
  title?: string
}): Promise<string | string[] | null> => {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'

    if (options?.directory) {
      input.setAttribute('webkitdirectory', '')
      input.setAttribute('directory', '')
    }

    if (options?.multiple) {
      input.multiple = true
    }

    input.onchange = () => {
      if (input.files && input.files.length > 0) {
        if (options?.multiple) {
          resolve(Array.from(input.files).map(f => f.name))
        } else {
          resolve(input.files[0].name)
        }
      } else {
        resolve(null)
      }
    }

    input.oncancel = () => resolve(null)
    input.click()
  })
}

/**
 * Confirmation dialog
 */
export const askConfirm = async (message: string, options?: { title?: string }): Promise<boolean> => {
  if (options?.title) {
    return confirm(`${options.title}\n\n${message}`)
  }
  return confirm(message)
}

/**
 * Message/alert dialog
 */
export const showMessage = async (
  message: string,
  options?: { title?: string; kind?: 'info' | 'warning' | 'error' }
): Promise<void> => {
  const prefix = options?.kind === 'error' ? 'Error: ' :
                 options?.kind === 'warning' ? 'Warning: ' : ''
  const title = options?.title ? `${options.title}\n\n` : ''
  alert(`${title}${prefix}${message}`)
}

/**
 * Prompt dialog for text input
 */
export const promptInput = async (
  message: string,
  options?: { title?: string; defaultValue?: string }
): Promise<string | null> => {
  const title = options?.title ? `${options.title}\n\n` : ''
  return prompt(`${title}${message}`, options?.defaultValue || '') || null
}

// ============================================================================
// Unified Dialog API
// ============================================================================

/**
 * Dialog API that works in both Tauri and Browser
 *
 * Usage:
 *   import { dialogs } from './browser-dialogs'
 *   const result = await dialogs.ask('Are you sure?')
 */
export const dialogs = {
  open: openFileDialog,
  ask: askConfirm,
  message: showMessage,
  prompt: promptInput
}

// ============================================================================
// Conditional Tauri Dialog Imports
// ============================================================================

/**
 * Get the appropriate dialog functions based on platform
 *
 * Returns Tauri dialogs in native mode, browser fallbacks otherwise.
 */
export const getDialogs = async () => {
  if (isTauri()) {
    const { open, ask, message } = await import('@tauri-apps/plugin-dialog')
    return { open, ask, message }
  }
  return {
    open: openFileDialog,
    ask: askConfirm,
    message: showMessage
  }
}
