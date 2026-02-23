/**
 * SHORTCUTS - Single source of truth for keyboard shortcut labels
 *
 * This registry provides display labels for all keyboard shortcuts.
 * When a shortcut keybinding changes, update it here and all UI labels
 * update automatically.
 *
 * NOTE: This file is for LABELS ONLY. The actual keyboard event handlers
 * remain in KeyboardShortcutHandler.tsx and individual components.
 */
export const SHORTCUTS = {
  // Notes
  newNote: { key: 'n', mod: 'cmd', label: '⌘N' },
  dailyNote: { key: 'd', mod: 'cmd', label: '⌘D' },

  // Search & Navigation
  search: { key: 'f', mod: 'cmd', label: '⌘F' },
  commandPalette: { key: 'k', mod: 'cmd', label: '⌘K' },

  // Projects
  newProject: { key: 'p', mod: 'cmd+shift', label: '⌘⇧P' },

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
