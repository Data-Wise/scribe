/**
 * SHORTCUTS - Single source of truth for keyboard shortcuts
 *
 * This registry defines key bindings, modifier keys, and display labels
 * for all keyboard shortcuts. When a shortcut keybinding changes, update
 * it here and both UI labels and event matching update automatically.
 *
 * Use matchesShortcut(event, shortcutId) in handlers to check if a
 * KeyboardEvent matches a registered shortcut.
 */
export const SHORTCUTS = {
  // Notes
  newNote: { key: 'n', mod: 'cmd', label: '⌘N' },
  dailyNote: { key: 'd', mod: 'cmd', label: '⌘D' },

  // Search & Navigation
  search: { key: 'f', mod: 'cmd', label: '⌘F' },
  commandPalette: { key: 'k', mod: 'cmd', label: '⌘K' },

  // Projects
  newProject: { key: 'N', mod: 'cmd+shift', label: '⌘⇧N' },

  // View
  focusMode: { key: 'F', mod: 'cmd+shift', label: '⌘⇧F' },
  graphView: { key: 'G', mod: 'cmd+shift', label: '⌘⇧G' },
  exportNote: { key: 'E', mod: 'cmd+shift', label: '⌘⇧E' },

  // Sidebars
  leftSidebar: { key: 'b', mod: 'cmd', label: '⌘B' },
  rightSidebar: { key: 'B', mod: 'cmd+shift', label: '⌘⇧B' },

  // Tabs
  closeTab: { key: 'w', mod: 'cmd', label: '⌘W' },
  reopenTab: { key: 'T', mod: 'cmd+shift', label: '⌘⇧T' },

  // Capture
  quickCapture: { key: 'C', mod: 'cmd+shift', label: '⌘⇧C' },

  // Settings
  settings: { key: ',', mod: 'cmd', label: '⌘,' },
  keyboardShortcuts: { key: '/', mod: 'cmd', label: '⌘/' },

  // Recent Notes
  recentNotes: { key: 'r', mod: 'cmd', label: '⌘R' },

  // Editor Modes
  sourceMode: { key: '1', mod: 'cmd', label: '⌘1' },
  livePreview: { key: '2', mod: 'cmd', label: '⌘2' },
  readingMode: { key: '3', mod: 'cmd', label: '⌘3' },
  cycleMode: { key: 'e', mod: 'cmd', label: '⌘E' },

  // Terminal
  terminal: { key: 't', mod: 'cmd+alt', label: '⌘⌥T' },

  // Dashboard
  dashboard: { key: '0', mod: 'cmd', label: '⌘0' },

  // Save
  save: { key: 's', mod: 'cmd', label: '⌘S' },

  // Sidebar navigation
  nextTab: { key: ']', mod: 'cmd', label: '⌘]' },
  prevTab: { key: '[', mod: 'cmd', label: '⌘[' },
  toggleRightPanel: { key: ']', mod: 'cmd+shift', label: '⌘⇧]' },
  collapseAll: { key: '[', mod: 'cmd+shift', label: '⌘⇧[' },
} as const

export type ShortcutId = keyof typeof SHORTCUTS

/**
 * Check if a KeyboardEvent matches a shortcut definition.
 * Handles cmd (metaKey/ctrlKey), shift, alt modifiers.
 */
export function matchesShortcut(e: KeyboardEvent, shortcutId: ShortcutId): boolean {
  const shortcut = SHORTCUTS[shortcutId]
  const mods = shortcut.mod.split('+')

  const needsCmd = mods.includes('cmd')
  const needsShift = mods.includes('shift')
  const needsAlt = mods.includes('alt')

  const hasCmd = e.metaKey || e.ctrlKey
  const hasShift = e.shiftKey
  const hasAlt = e.altKey

  if (needsCmd !== hasCmd) return false
  if (needsShift !== hasShift) return false
  if (needsAlt !== hasAlt) return false

  return e.key === shortcut.key
}
