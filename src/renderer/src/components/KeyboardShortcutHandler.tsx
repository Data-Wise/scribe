import { useEffect } from 'react'
import { isTauri } from '../lib/platform'
import { updatePreferences, EditorMode, SidebarTabId } from '../lib/preferences'
import { matchesShortcut } from '../lib/shortcuts'
import { getThemeForShortcut, Theme, ThemeShortcut } from '../lib/themes'
import type { Note, SmartIconId } from '../types'

interface Tab {
  id: string
  isPinned?: boolean
}

interface KeyboardShortcutHandlerProps {
  // Focus mode
  focusMode: boolean
  onFocusModeChange: (enabled: boolean) => void
  
  // Note actions
  onCreateNote: () => void
  onDailyNote: () => void
  selectedNote: Note | undefined
  
  // Modal/panel toggles
  onExportDialogOpen: () => void
  onGraphViewOpen: () => void
  onSearchPanelOpen: () => void
  onQuickCaptureOpen: () => void
  onCreateProjectOpen: () => void
  onKeyboardShortcutsOpen: () => void
  onSettingsOpen: () => void
  
  // Sidebar controls
  onLeftSidebarToggle: () => void
  onRightSidebarToggle: () => void
  onCollapseAll: () => void
  rightSidebarCollapsed: boolean
  
  // Tab management
  openTabs: Tab[]
  activeTabId: string | null
  onSetActiveTab: (id: string) => void
  onCloseTab: (id: string) => void
  onReopenLastClosedTab: () => void
  
  // Right sidebar tabs
  rightActiveTab: SidebarTabId
  onRightActiveTabChange: (tab: SidebarTabId) => void
  sidebarTabSettings: {
    tabOrder: SidebarTabId[]
    hiddenTabs: SidebarTabId[]
  }
  
  // Smart icons
  onExpandSmartIcon: (iconId: SmartIconId) => void
  
  // Editor mode
  editorMode: EditorMode
  onEditorModeChange: (mode: EditorMode) => void
  
  // Theme shortcuts
  themeShortcuts: ThemeShortcut[]
  allThemes: Record<string, Theme>
  onThemeChange: (themeId: string) => void
}

/**
 * KeyboardShortcutHandler
 * 
 * Centralized keyboard shortcut management for the entire application.
 * Handles:
 * - Global keyboard shortcuts (25+ shortcuts)
 * - Native menu events (Tauri)
 * - Theme shortcuts (Cmd+Alt+0-9)
 * 
 * This is a "headless" component - it renders nothing but manages all keyboard interactions.
 */
export function KeyboardShortcutHandler({
  focusMode,
  onFocusModeChange,
  onCreateNote,
  onDailyNote,
  selectedNote,
  onExportDialogOpen,
  onGraphViewOpen,
  onSearchPanelOpen,
  onQuickCaptureOpen,
  onCreateProjectOpen,
  onKeyboardShortcutsOpen,
  onSettingsOpen,
  onLeftSidebarToggle,
  onRightSidebarToggle,
  onCollapseAll,
  rightSidebarCollapsed,
  openTabs,
  activeTabId,
  onSetActiveTab,
  onCloseTab,
  onReopenLastClosedTab,
  rightActiveTab,
  onRightActiveTabChange,
  sidebarTabSettings,
  onExpandSmartIcon,
  editorMode: _editorMode,
  onEditorModeChange,
  themeShortcuts,
  allThemes,
  onThemeChange,
}: KeyboardShortcutHandlerProps) {
  // Unused but kept for potential future use
  void _editorMode

  // Theme keyboard shortcuts: Cmd/Ctrl + Alt + [0-9]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd/Ctrl + Alt + number key
      if ((e.metaKey || e.ctrlKey) && e.altKey && /^[0-9]$/.test(e.key)) {
        e.preventDefault()
        const targetTheme = getThemeForShortcut(e.key, themeShortcuts)
        if (targetTheme && allThemes[targetTheme]) {
          onThemeChange(targetTheme)
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [themeShortcuts, allThemes, onThemeChange])

  // Main keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus mode toggle (⌘⇧F)
      if (matchesShortcut(e, 'focusMode')) {
        e.preventDefault()
        onFocusModeChange(!focusMode)
      }

      // Export shortcut (⌘⇧E)
      if (matchesShortcut(e, 'exportNote')) {
        e.preventDefault()
        if (selectedNote) {
          onExportDialogOpen()
        }
      }

      // Graph view shortcut (⌘⇧G)
      if (matchesShortcut(e, 'graphView')) {
        e.preventDefault()
        onGraphViewOpen()
      }

      // Left sidebar toggle (⌘B)
      if (matchesShortcut(e, 'leftSidebar')) {
        e.preventDefault()
        onLeftSidebarToggle()
      }

      // Right sidebar toggle (⌘⇧B)
      if (matchesShortcut(e, 'rightSidebar')) {
        e.preventDefault()
        onRightSidebarToggle()
      }
      
      // Exit focus mode (Escape)
      if (e.key === 'Escape' && focusMode) {
        onFocusModeChange(false)
      }

      // New note (⌘N)
      if (matchesShortcut(e, 'newNote')) {
        e.preventDefault()
        onCreateNote()
      }

      // Daily note (⌘D)
      if (matchesShortcut(e, 'dailyNote')) {
        e.preventDefault()
        onDailyNote()
      }

      // Keyboard shortcuts panel (⌘? or ⌘/)
      if ((e.metaKey || e.ctrlKey) && (e.key === '?' || e.key === '/')) {
        e.preventDefault()
        onKeyboardShortcutsOpen()
      }

      // Search panel (⌘F)
      if (matchesShortcut(e, 'search')) {
        e.preventDefault()
        onSearchPanelOpen()
      }

      // Quick Capture (⌘⇧C)
      if (matchesShortcut(e, 'quickCapture')) {
        e.preventDefault()
        onQuickCaptureOpen()
      }

      // New Project (⌘⇧N)
      if (matchesShortcut(e, 'newProject')) {
        e.preventDefault()
        onCreateProjectOpen()
      }

      // Smart Icon shortcuts (⌘⇧1-4)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && !e.altKey && /^[1-4]$/.test(e.key)) {
        e.preventDefault()
        const shortcuts: Record<string, SmartIconId> = {
          '1': 'research',
          '2': 'teaching',
          '3': 'r-package',
          '4': 'dev-tools'
        }
        const iconId = shortcuts[e.key]
        if (iconId) {
          onExpandSmartIcon(iconId)
        }
      }

      // Tab switching (⌘1-9)
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && /^[1-9]$/.test(e.key)) {
        e.preventDefault()
        const tabIndex = parseInt(e.key) - 1
        if (tabIndex < openTabs.length) {
          onSetActiveTab(openTabs[tabIndex].id)
        }
      }

      // Close current tab (⌘W)
      if (matchesShortcut(e, 'closeTab')) {
        e.preventDefault()
        const activeTab = openTabs.find(t => t.id === activeTabId)
        if (activeTab && !activeTab.isPinned) {
          onCloseTab(activeTabId!)
        }
      }

      // Reopen last closed tab (⌘⇧T)
      if (matchesShortcut(e, 'reopenTab')) {
        e.preventDefault()
        onReopenLastClosedTab()
        return
      }

      // Right sidebar tab navigation (⌘] / ⌘[)
      const visibleTabs = sidebarTabSettings.tabOrder.filter(
        (t: SidebarTabId) => !sidebarTabSettings.hiddenTabs.includes(t)
      )
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === ']') {
        e.preventDefault()
        const currentIndex = visibleTabs.indexOf(rightActiveTab)
        const nextIndex = (currentIndex + 1) % visibleTabs.length
        onRightActiveTabChange(visibleTabs[nextIndex])
        // Also ensure right sidebar is visible
        if (rightSidebarCollapsed) {
          onRightSidebarToggle()
        }
      }
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === '[') {
        e.preventDefault()
        const currentIndex = visibleTabs.indexOf(rightActiveTab)
        const prevIndex = (currentIndex - 1 + visibleTabs.length) % visibleTabs.length
        onRightActiveTabChange(visibleTabs[prevIndex])
        // Also ensure right sidebar is visible
        if (rightSidebarCollapsed) {
          onRightSidebarToggle()
        }
      }

      // Terminal tab shortcut (⌘⌥T)
      if ((e.metaKey || e.ctrlKey) && e.altKey && !e.shiftKey && e.code === 'KeyT') {
        e.preventDefault()
        if (rightActiveTab === 'terminal' && !rightSidebarCollapsed) {
          onRightSidebarToggle()
        } else {
          onRightActiveTabChange('terminal')
          if (rightSidebarCollapsed) {
            onRightSidebarToggle()
          }
        }
      }

      // Right sidebar toggle (⌘⇧])
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === ']') {
        e.preventDefault()
        onRightSidebarToggle()
      }

      // Left sidebar collapse (⌘⇧[)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '[') {
        e.preventDefault()
        onCollapseAll()
      }

      // Settings shortcut (⌘,)
      if (matchesShortcut(e, 'settings')) {
        e.preventDefault()
        onSettingsOpen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    focusMode,
    onFocusModeChange,
    onCreateNote,
    onDailyNote,
    selectedNote,
    openTabs,
    activeTabId,
    onSetActiveTab,
    onCloseTab,
    onReopenLastClosedTab,
    rightActiveTab,
    onRightActiveTabChange,
    rightSidebarCollapsed,
    onRightSidebarToggle,
    sidebarTabSettings,
    onCollapseAll,
    onExportDialogOpen,
    onGraphViewOpen,
    onSearchPanelOpen,
    onQuickCaptureOpen,
    onCreateProjectOpen,
    onKeyboardShortcutsOpen,
    onSettingsOpen,
    onLeftSidebarToggle,
    onExpandSmartIcon,
  ])

  // Native menu events from Tauri
  useEffect(() => {
    if (!isTauri()) return

    let unlisten: (() => void) | null = null

    import('@tauri-apps/api/event').then(({ listen }) => {
      listen<string>('menu-event', (event) => {
        const menuId = event.payload

        switch (menuId) {
          // File menu
          case 'new_note':
            onCreateNote()
            break
          case 'new_project':
            onCreateProjectOpen()
            break
          case 'daily_note':
            onDailyNote()
            break
          case 'quick_capture':
            onQuickCaptureOpen()
            break
          case 'search':
            onSearchPanelOpen()
            break
          case 'export':
            onExportDialogOpen()
            break

          // View menu
          case 'mission_control':
            // v1.16.0: No-op (deprecated - sidebar always visible)
            break
          case 'focus_mode':
            onFocusModeChange(!focusMode)
            break
          case 'source_mode':
            onEditorModeChange('source')
            updatePreferences({ editorMode: 'source' })
            break
          case 'live_preview':
            onEditorModeChange('live-preview')
            updatePreferences({ editorMode: 'live-preview' })
            break
          case 'reading_mode':
            onEditorModeChange('reading')
            updatePreferences({ editorMode: 'reading' })
            break
          case 'toggle_sidebar':
            onCollapseAll()
            break
          case 'knowledge_graph':
            onGraphViewOpen()
            break

          // Scribe menu
          case 'preferences':
            onSettingsOpen()
            break
          case 'shortcuts':
            onKeyboardShortcutsOpen()
            break
          case 'about':
            // TODO: Show about dialog
            break
        }
      }).then(fn => {
        unlisten = fn
      })
    }).catch(err => {
      console.warn('Tauri event API not available:', err)
    })

    return () => {
      if (unlisten) unlisten()
    }
  }, [
    onCreateNote,
    onDailyNote,
    onFocusModeChange,
    focusMode,
    onEditorModeChange,
    onCollapseAll,
    onGraphViewOpen,
    onSettingsOpen,
    onKeyboardShortcutsOpen,
    onCreateProjectOpen,
    onQuickCaptureOpen,
    onSearchPanelOpen,
    onExportDialogOpen,
  ])

  // This component renders nothing - it only manages keyboard events
  return null
}
