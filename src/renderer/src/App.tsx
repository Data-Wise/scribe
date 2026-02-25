import { useEffect, useState, useRef, useCallback } from 'react'
import { useNotesStore } from './store/useNotesStore'
import { useProjectStore } from './store/useProjectStore'
import { useAppViewStore, MISSION_CONTROL_TAB_ID, SIDEBAR_WIDTHS, RIGHT_SIDEBAR_WIDTHS } from './store/useAppViewStore'
import { useSettingsStore } from './store/useSettingsStore'
import { EditorTabs } from './components/EditorTabs'
import { useForestTheme } from './hooks/useForestTheme'
import { useIconGlowEffect } from './hooks/useIconGlowEffect'
import { usePreferences } from './hooks/usePreferences'
import { useResponsiveLayout } from './hooks/useResponsiveLayout'
import { useGlobalZoom } from './hooks/useGlobalZoom'
import { BacklinksPanel } from './components/BacklinksPanel'
import { TagFilter } from './components/TagFilter'
import { PropertiesPanel } from './components/PropertiesPanel'
import { TagsPanel } from './components/TagsPanel'
import { StatsPanel } from './components/StatsPanel'
import { SettingsModal } from './components/SettingsModal'
import { MissionControl } from './components/MissionControl'
import { ExportDialog } from './components/ExportDialog'
import { GraphView } from './components/GraphView'
import { CreateProjectModal } from './components/CreateProjectModal'
import { EditProjectModal } from './components/EditProjectModal'
import { MissionSidebar, IconLegend, ResizeHandle } from './components/sidebar'
import { ClaudeChatPanel } from './components/ClaudeChatPanel'
import { TerminalPanel } from './components/TerminalPanel'
import { SidebarTabContextMenu } from './components/SidebarTabContextMenu'
import { QuickCaptureOverlay } from './components/QuickCaptureOverlay'
import { DragRegion, useDragRegion } from './components/DragRegion'
import { KeyboardShortcutHandler } from './components/KeyboardShortcutHandler'
import { EditorOrchestrator } from './components/EditorOrchestrator'
import { ToastProvider, useToast, setGlobalToast } from './components/Toast'
import { Note, Tag, Property } from './types'
import { Settings2, Link2, Tags, PanelRightOpen, PanelRightClose, BarChart3, Sparkles, Terminal } from 'lucide-react'
import { api, runApiDiagnostics } from './lib/api'
import { dialogs } from './lib/browser-dialogs'
import { CommandPalette } from './components/CommandPalette'
import { KeyboardShortcuts } from './components/KeyboardShortcuts'
import { PanelMenu, MenuSection } from './components/PanelMenu'
import { SearchPanel } from './components/SearchPanel'
import {
  Theme,
  AutoThemeSettings,
  FontSettings,
  ThemeShortcut,
  getAllThemes,
  loadAutoThemeSettings,
  loadSelectedTheme,
  saveSelectedTheme,
  applyTheme,
  getAutoTheme,
  loadFontSettings,
  saveFontSettings,
  applyFontSettings,
  loadThemeShortcuts,
} from './lib/themes'
import {
  updatePreferences,
  updateStreak,
  getStreakInfo,
  EditorMode,
  SidebarTabId,
} from './lib/preferences'
import {
  getDailyNoteContent,
  isContentEmpty,
} from './lib/dailyNoteTemplates'

// Tag extraction regex - supports hierarchical tags (e.g., #research/statistics)
const TAG_REGEX = /#([a-zA-Z0-9_/-]+)/g

/**
 * Extract unique tags from note content
 * Used to sync inline #tags with YAML properties.tags
 */
function extractTagsFromContent(content: string): string[] {
  const tags = new Set<string>()
  let match
  while ((match = TAG_REGEX.exec(content)) !== null) {
    const tag = match[1].toLowerCase().replace(/\/+$/, '') // normalize and trim trailing slashes
    if (tag) tags.add(tag)
  }
  TAG_REGEX.lastIndex = 0 // reset regex state
  return Array.from(tags).sort()
}

function App() {
  const { notes, loadNotes, createNote, updateNote, selectedNoteId, selectNote } = useNotesStore()
  const {
    projects,
    currentProjectId,
    loadProjects,
    setCurrentProject,
    createProject
  } = useProjectStore()

  // Toast notifications
  const { showToast } = useToast()

  // Apply Forest Night theme
  useForestTheme()

  // Apply icon glow effect settings
  useIconGlowEffect()

  // Window dragging hook for editor header
  const dragRegion = useDragRegion()

  // Sidebar and tabs from app view store
  const {
    sidebarWidth,
    setSidebarWidth,
    expandedIcon,
    setLastActiveNote,
    updateSessionTimestamp,
    expandVault,
    expandSmartIcon,
    collapseAll,
    // Tab state
    openTabs,
    activeTabId,
    setActiveTab,
    openNoteTab,
    closeTab,
    reopenLastClosedTab,
    // Pinned vaults
    addPinnedVault,
    removePinnedVault,
    // Recent notes
    addRecentNote
  } = useAppViewStore()
  const [currentFolder] = useState<string | undefined>(undefined)
  const [editingTitle, setEditingTitle] = useState(false)

  // Editor container ref for auto-collapse functionality
  const editorContainerRef = useRef<HTMLDivElement>(null)

  // User preferences with persistence (auto-syncs via preferences-changed events)
  const { prefs: preferences, updatePref } = usePreferences()
  const [streakInfo, setStreakInfo] = useState(() => getStreakInfo())

  // Focus mode state (persisted)
  const [focusMode, setFocusMode] = useState(() => preferences.focusModeEnabled)

  // Persist focus mode changes
  const handleFocusModeChange = (enabled: boolean) => {
    setFocusMode(enabled)
    updatePref('focusModeEnabled', enabled)
  }
  
  // Sidebar collapse state (leftSidebarCollapsed now handled by DashboardShell)
  const [, setLeftSidebarCollapsed] = useState(false)  // Keep setter for potential future use
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('rightSidebarCollapsed')
    return saved === 'true'
  })

  // Right sidebar width state with localStorage persistence
  const [rightSidebarWidth, setRightSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('rightSidebarWidth')
    return saved ? parseInt(saved) : RIGHT_SIDEBAR_WIDTHS.expanded.default
  })
  const [isResizingRight, setIsResizingRight] = useState(false)

  // Responsive layout: auto-collapse sidebars on window resize
  const lastExpandedIcon = useRef(expandedIcon)
  useEffect(() => {
    if (expandedIcon) lastExpandedIcon.current = expandedIcon
  }, [expandedIcon])

  const leftCollapsed = expandedIcon === null
  useResponsiveLayout({
    leftWidth: sidebarWidth || SIDEBAR_WIDTHS.icon,
    rightWidth: rightSidebarWidth,
    leftCollapsed,
    rightCollapsed: rightSidebarCollapsed,
    onCollapseLeft: collapseAll,
    onCollapseRight: useCallback(() => setRightSidebarCollapsed(true), []),
    onExpandLeft: useCallback(() => {
      const last = lastExpandedIcon.current
      if (last) {
        if (last.type === 'vault') expandVault(last.id)
        else expandSmartIcon(last.id as any)
      }
    }, [expandVault, expandSmartIcon]),
    onExpandRight: useCallback(() => setRightSidebarCollapsed(false), []),
  })

  // Global zoom: ⌘+/⌘- to zoom in/out
  const { zoomLevel, resetZoom } = useGlobalZoom()

  // Tab state (leftActiveTab removed - notes list is in DashboardShell now)
  const [rightActiveTab, setRightActiveTab] = useState<'properties' | 'backlinks' | 'tags' | 'stats' | 'claude' | 'terminal'>('properties')

  // Left sidebar sorting is now handled in MissionSidebar

  // Right sidebar preferences (persisted in localStorage)
  const [backlinksSort, setBacklinksSort] = useState<'name' | 'date'>(() => {
    const saved = localStorage.getItem('backlinksSort')
    return (saved as 'name' | 'date') || 'date'
  })
  const [showOutgoingLinks, setShowOutgoingLinks] = useState<boolean>(() => {
    const saved = localStorage.getItem('showOutgoingLinks')
    return saved === null ? true : saved === 'true'
  })
  const [tagsSort, setTagsSort] = useState<'alpha' | 'count'>(() => {
    const saved = localStorage.getItem('tagsSort')
    return (saved as 'alpha' | 'count') || 'alpha'
  })
  const [propertiesCollapsed, setPropertiesCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('propertiesCollapsed')
    return saved === 'true'
  })

  // Right sidebar tab settings (v1.8 - from preferences and Settings store)
  const settings = useSettingsStore((state) => state.settings)
  const sidebarTabSize = (settings['appearance.sidebarTabSize'] || 'compact') as 'compact' | 'full'
  // const showSidebarIcons = settings['appearance.showSidebarIcons'] ?? true // TODO: Implement icon visibility

  const [sidebarTabSettings, setSidebarTabSettings] = useState(() => ({
    tabSize: sidebarTabSize, // Now from Settings store
    tabOrder: preferences.sidebarTabOrder, // Still from preferences (not in Settings store yet)
    hiddenTabs: preferences.sidebarHiddenTabs // Still from preferences (not in Settings store yet)
  }))

  // Sidebar tab drag state (v1.8)
  const [draggedSidebarTab, setDraggedSidebarTab] = useState<SidebarTabId | null>(null)
  const [dragOverSidebarTab, setDragOverSidebarTab] = useState<SidebarTabId | null>(null)

  // Sidebar tab context menu state (v1.8)
  const [sidebarTabContextMenu, setSidebarTabContextMenu] = useState<{
    position: { x: number; y: number }
    tabId: SidebarTabId
  } | null>(null)

  // Search state (used by Search Panel)

  // Tag filtering state
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  
  // Command Palette & Settings state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isGraphViewOpen, setIsGraphViewOpen] = useState(false)
  const [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen] = useState(false)
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false)
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false)

  // Tag filtering - filteredNotes now handled by MissionSidebar

  // Backlinks refresh key - increment to force BacklinksPanel refresh
  const [backlinksRefreshKey, setBacklinksRefreshKey] = useState(0)
  
  // Editor mode - source, live-preview, or reading (persisted in preferences)
  const [editorMode, setEditorMode] = useState<EditorMode>(() => preferences.editorMode || 'source')
  
  // Tags for current note (for PropertiesPanel display)
  const [currentNoteTags, setCurrentNoteTags] = useState<Tag[]>([])

  // Theme state
  const [allThemes, setAllThemes] = useState<Record<string, Theme>>(() => getAllThemes())
  const [theme, setTheme] = useState<string>(() => loadSelectedTheme())
  const [autoThemeSettings, setAutoThemeSettings] = useState<AutoThemeSettings>(() => loadAutoThemeSettings())
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  
  // Apply theme to document root
  useEffect(() => {
    let activeThemeId = theme
    
    // If auto-theme is enabled, determine theme based on time
    if (autoThemeSettings.enabled) {
      activeThemeId = getAutoTheme(autoThemeSettings)
    }
    
    const activeTheme = allThemes[activeThemeId] || allThemes['sage-garden']
    if (activeTheme) {
      applyTheme(activeTheme)
    }
    
    saveSelectedTheme(theme)
  }, [theme, autoThemeSettings, allThemes])
  
  // Auto-theme time check (every minute)
  useEffect(() => {
    if (!autoThemeSettings.enabled) return
    
    const checkTime = () => {
      const newThemeId = getAutoTheme(autoThemeSettings)
      const activeTheme = allThemes[newThemeId]
      if (activeTheme) {
        applyTheme(activeTheme)
      }
    }
    
    const interval = setInterval(checkTime, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [autoThemeSettings, allThemes])
  
  // NOTE: Theme customization handlers moved to Settings Enhancement UI
  // These functions are now handled by the SettingsStore in useSettingsStore.ts

  // Font settings state
  const [fontSettings, setFontSettings] = useState<FontSettings>(() => loadFontSettings())
  
  // Apply font settings on load and change
  useEffect(() => {
    applyFontSettings(fontSettings)
    saveFontSettings(fontSettings)
  }, [fontSettings])
  
  // Theme shortcuts state
  const [themeShortcuts, setThemeShortcuts] = useState<ThemeShortcut[]>(() => loadThemeShortcuts())
  
  // Theme keyboard shortcuts now handled by KeyboardShortcutHandler
  
  // Theme customization handlers
  const handleSaveCustomTheme = (newTheme: Theme) => {
    setAllThemes(prev => ({ ...prev, [newTheme.id]: newTheme }))
  }

  const handleDeleteCustomTheme = (themeId: string) => {
    setAllThemes(prev => {
      const { [themeId]: _, ...rest } = prev
      return rest
    })
    // If deleted theme was active, switch to default
    if (theme === themeId) {
      setTheme('sage-garden')
    }
  }

  const handleAutoThemeChange = (settings: AutoThemeSettings) => {
    setAutoThemeSettings(settings)
    // Save to localStorage
    localStorage.setItem('scribe-auto-theme-settings', JSON.stringify(settings))
  }

  const handleFontSettingsChange = (settings: FontSettings) => {
    setFontSettings(settings)
    saveFontSettings(settings)
    applyFontSettings(settings)
  }

  const handleThemeShortcutsChange = (shortcuts: ThemeShortcut[]) => {
    setThemeShortcuts(shortcuts)
    // Save to localStorage
    localStorage.setItem('scribe-theme-shortcuts', JSON.stringify(shortcuts))
  }

  useEffect(() => {
    loadNotes(currentFolder)
  }, [loadNotes, currentFolder])

  // Load projects on startup and run diagnostics
  useEffect(() => {
    loadProjects()
    // Run API diagnostics in development
    if (import.meta.env.DEV) {
      runApiDiagnostics()
    }
  }, [loadProjects])

  // Auto-pin demo projects on first launch (ADHD-friendly onboarding)
  useEffect(() => {
    const autoPinDemoProjects = async () => {
      // Only run once after projects are loaded
      if (projects.length === 0) return

      const pinnedVaults = useAppViewStore.getState().pinnedVaults
      const addPinnedVault = useAppViewStore.getState().addPinnedVault

      // Find "Getting Started" demo project
      const demoProject = projects.find(p => p.name === 'Getting Started')
      if (!demoProject) return

      // Check if it's already pinned
      const isAlreadyPinned = pinnedVaults.some(v => v.id === demoProject.id)
      if (isAlreadyPinned) return

      // Auto-pin the demo project
      console.log('📌 Auto-pinning demo project:', demoProject.name)
      const success = addPinnedVault(demoProject.id, demoProject.name, demoProject.color)
      if (success) {
        console.log('✅ Demo project pinned successfully')
      } else {
        console.warn('⚠️ Failed to pin demo project (max vaults reached or already pinned)')
      }
    }

    autoPinDemoProjects()
  }, [projects])

  // Project-specific notes are now filtered in MissionSidebar

  // Load tags for the current note
  useEffect(() => {
    const loadCurrentNoteTags = async () => {
      if (!selectedNoteId) {
        setCurrentNoteTags([])
        return
      }
      try {
        const tags = await api.getNoteTags(selectedNoteId)
        setCurrentNoteTags(tags)
      } catch (error) {
        console.error('Failed to load note tags:', error)
        setCurrentNoteTags([])
      }
    }
    loadCurrentNoteTags()
  }, [selectedNoteId, backlinksRefreshKey]) // Refresh when content changes (backlinksRefreshKey)


  const handleCreateNote = async () => {
    // Default properties for new notes
    const defaultProperties: Record<string, Property> = {
      status: { key: 'status', value: ['draft'], type: 'list' },  // List type must be array
      type: { key: 'type', value: ['note'], type: 'list' },  // List type must be array
    }

    const newNote = await createNote({
      title: `New Note`,
      content: '',  // Empty markdown - user starts fresh
      folder: currentFolder || 'inbox',
      properties: defaultProperties,
      project_id: currentProjectId || undefined  // Auto-assign to current project
    })

    // Open the note in a tab (fix for note creation bug)
    if (newNote) {
      openNoteTab(newNote.id, newNote.title)
      selectNote(newNote.id)
    }
  }

  const selectedNote = notes.find(n => n.id === selectedNoteId)

  // Calculate word count for current note
  const wordCount = selectedNote?.content
    ? selectedNote.content.trim().split(/\s+/).filter(word => word.length > 0).length
    : 0

  // Session tracking - words written in current session
  const [sessionStartWords, setSessionStartWords] = useState<Record<string, number>>({})
  const [lastWordCount, setLastWordCount] = useState(0)

  // Track session start words when switching notes
  useEffect(() => {
    if (selectedNoteId && wordCount > 0 && !sessionStartWords[selectedNoteId]) {
      setSessionStartWords(prev => ({ ...prev, [selectedNoteId]: wordCount }))
    }
    setLastWordCount(wordCount)
  }, [selectedNoteId])

  // Update streak when words are written
  useEffect(() => {
    if (wordCount > lastWordCount) {
      const wordsAdded = wordCount - lastWordCount
      if (wordsAdded > 0) {
        const updated = updateStreak(wordsAdded)
        setStreakInfo({ streak: updated.currentStreak, isActiveToday: true })
      }
    }
    setLastWordCount(wordCount)
  }, [wordCount])

  // Pomodoro auto-save + toast when a work session completes
  const handlePomodoroComplete = useCallback(async () => {
    if (selectedNote) {
      try {
        await api.updateNote(selectedNote.id, { content: selectedNote.content })
        showToast('Time for a break! ☕ Note saved.', 'success')
      } catch (e) {
        console.warn('Pomodoro auto-save failed:', e)
        showToast('Time for a break! ☕', 'success')
      }
    } else {
      showToast('Time for a break! ☕', 'success')
    }
  }, [selectedNote, showToast])

  // Toast when a break session completes
  const handleBreakComplete = useCallback(() => {
    showToast("Break's over — ready to write?", 'info')
  }, [showToast])

  const handleContentChange = async (content: string) => {
    if (selectedNote) {
      // Extract tags from content and sync to YAML properties
      const extractedTags = extractTagsFromContent(content)
      const currentProperties = selectedNote.properties || {}

      // Update properties.tags if different (avoid unnecessary updates)
      const currentYamlTags = currentProperties.tags?.value as string[] || []
      const tagsChanged = JSON.stringify(extractedTags) !== JSON.stringify(currentYamlTags.sort())

      if (tagsChanged) {
        const updatedProperties: Record<string, Property> = {
          ...currentProperties,
          tags: { key: 'tags', value: extractedTags, type: 'tags' }
        }
        updateNote(selectedNote.id, { content, properties: updatedProperties })
      } else {
        updateNote(selectedNote.id, { content })
      }

      // Update links and tags in database
      try {
        await api.updateNoteLinks(selectedNote.id, content)
        await api.updateNoteTags(selectedNote.id, content)
        // Trigger BacklinksPanel refresh
        setBacklinksRefreshKey(prev => prev + 1)
      } catch (error) {
        console.error('Failed to update links/tags:', error)
      }
    }
  }

  const handleTitleChange = (title: string) => {
    if (selectedNote && title.trim()) {
      updateNote(selectedNote.id, { title: title.trim() })
      setEditingTitle(false)
    }
  }

  // Wiki link handlers - preserves preview mode when navigating
  const handleLinkClick = async (title: string) => {
    try {
      let targetNote = notes.find((n) => n.title === title)

      if (!targetNote) {
        const allNotes = await api.listNotes()
        targetNote = allNotes.find((n) => n.title === title)
      }

      if (targetNote) {
        // Preserve user's current editor mode when navigating
        selectNote(targetNote.id)
        openNoteTab(targetNote.id, targetNote.title)
      } else {
        const newNote = await api.createNote({
          title,
          content: '',  // Empty markdown
          folder: selectedNote?.folder || 'inbox'
        })

        if (selectedNote) {
          await api.updateNoteLinks(selectedNote.id, selectedNote.content)
        }

        // Preserve user's current editor mode when creating new notes
        selectNote(newNote.id)
        openNoteTab(newNote.id, newNote.title)
        loadNotes(currentFolder)
      }
    } catch (error) {
      console.error('[App] handleLinkClick error:', error)
    }
  }

  const handleDailyNote = async () => {
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0]
    try {
      const dailyNote = await api.getOrCreateDailyNote(dateStr)

      // If note is empty (newly created), apply template
      if (isContentEmpty(dailyNote.content)) {
        const templateContent = getDailyNoteContent(today)
        await api.updateNote(dailyNote.id, { content: templateContent })
        dailyNote.content = templateContent
      }

      // Open the note in a tab and select it
      openNoteTab(dailyNote.id, dailyNote.title)
      selectNote(dailyNote.id)
      loadNotes(currentFolder)
    } catch (error) {
      console.error('[Scribe] Failed to open daily note:', error)
    }
  }

  const handleObsidianSync = async () => {
    try {
      const selected = await dialogs.open({
        directory: true,
        multiple: false,
        title: 'Select Obsidian Vault Folder'
      })

      if (selected && typeof selected === 'string') {
        const result = await api.exportToObsidian(selected)
        await dialogs.message(result, { title: 'Sync Complete', kind: 'info' })
      }
    } catch (error) {
      console.error('Failed to sync with Obsidian:', error)
    }
  }

  const handleRunClaude = async () => {
    if (!selectedNoteId) return
    const note = notes.find(n => n.id === selectedNoteId)
    if (!note) return
    
    try {
      const response = await api.runClaude(`Please refactor and improve this note: \n\n${note.content}`)
      await dialogs.message(response, { title: 'Claude Response', kind: 'info' })
    } catch (error) {
      console.error('Claude error:', error)
    }
  }

  const handleRunGemini = async () => {
    if (!selectedNoteId) return
    const note = notes.find(n => n.id === selectedNoteId)
    if (!note) return

    try {
      const response = await api.runGemini(`Brainstorm ideas based on this note: \n\n${note.content}`)
      await dialogs.message(response, { title: 'Gemini Response', kind: 'info' })
    } catch (error) {
      console.error('Gemini error:', error)
    }
  }

  const handleSearchNotesForAutocomplete = async (query: string): Promise<Note[]> => {
    const allNotes = await api.listNotes()
    if (query.trim() === '') return allNotes
    const lowerQuery = query.toLowerCase()
    return allNotes.filter((note) => note.title.toLowerCase().includes(lowerQuery))
  }

  // Keyboard shortcuts now handled by KeyboardShortcutHandler component

  // Track selected note for smart startup (session context) and recent notes
  useEffect(() => {
    if (selectedNoteId) {
      const note = notes.find(n => n.id === selectedNoteId)
      if (note) {
        setLastActiveNote(selectedNoteId)
        updateSessionTimestamp()
        // Add to recent notes
        addRecentNote(selectedNoteId, note.title, note.project_id)
      }
    }
  }, [selectedNoteId, notes, setLastActiveNote, updateSessionTimestamp, addRecentNote])

  // Sync selected note when active tab changes (for tab clicks)
  useEffect(() => {
    if (activeTabId && activeTabId !== MISSION_CONTROL_TAB_ID) {
      const activeTab = openTabs.find(t => t.id === activeTabId)
      if (activeTab?.type === 'note' && activeTab.noteId) {
        // Only update if different to avoid loops
        if (activeTab.noteId !== selectedNoteId) {
          selectNote(activeTab.noteId)
        }
      }
    }
  }, [activeTabId, openTabs, selectedNoteId, selectNote])

  // Native menu events now handled by KeyboardShortcutHandler component

  // Persist right sidebar collapsed state
  useEffect(() => {
    localStorage.setItem('rightSidebarCollapsed', rightSidebarCollapsed.toString())
  }, [rightSidebarCollapsed])

  // Sync sidebar tab settings when preferences change (hook auto-syncs via preferences-changed)
  useEffect(() => {
    setSidebarTabSettings({
      tabSize: preferences.sidebarTabSize,
      tabOrder: preferences.sidebarTabOrder,
      hiddenTabs: preferences.sidebarHiddenTabs
    })
    // If the active tab is now hidden, switch to the first visible tab
    if (preferences.sidebarHiddenTabs.includes(rightActiveTab)) {
      const firstVisible = preferences.sidebarTabOrder.find(
        (t: SidebarTabId) => !preferences.sidebarHiddenTabs.includes(t)
      )
      if (firstVisible) setRightActiveTab(firstVisible)
    }
  }, [preferences.sidebarTabSize, preferences.sidebarTabOrder, preferences.sidebarHiddenTabs, rightActiveTab])

  // Auto-collapse sidebar when editor is focused
  useEffect(() => {
    const autoCollapseEnabled = settings['appearance.autoCollapseSidebar']
    if (!autoCollapseEnabled || !editorContainerRef.current) return

    const editorContainer = editorContainerRef.current

    const handleFocusIn = () => {
      // Collapse sidebar when editor gains focus
      collapseAll()
    }

    const handleMouseEnter = () => {
      // v1.16.0: No auto-expand on hover (icon-centric - user must click)
      // Icons always visible, expansion controlled by clicks
    }

    const handleMouseLeave = () => {
      // Collapse sidebar when mouse leaves (if editor still has focus)
      if (editorContainer.contains(document.activeElement)) {
        collapseAll()
      }
    }

    // Add focus listener to editor container
    editorContainer.addEventListener('focusin', handleFocusIn)

    // Add hover listeners to sidebar for expand/collapse
    const sidebar = document.querySelector('.mission-sidebar')
    if (sidebar) {
      sidebar.addEventListener('mouseenter', handleMouseEnter)
      sidebar.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      editorContainer.removeEventListener('focusin', handleFocusIn)
      if (sidebar) {
        sidebar.removeEventListener('mouseenter', handleMouseEnter)
        sidebar.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [settings, collapseAll])

  // Apply sidebar width preset from settings
  useEffect(() => {
    const widthPreset = settings['appearance.sidebarWidth'] || 'medium'

    // Map preset values to pixel widths
    const widthMap: Record<string, number> = {
      'narrow': 200,
      'medium': 280,
      'wide': 360
    }

    const targetWidth = widthMap[widthPreset as string] || 280 // Default to medium

    // Only update if different from current width (avoid loops)
    if (sidebarWidth !== targetWidth) {
      setSidebarWidth(targetWidth)
    }
  }, [settings, sidebarWidth, setSidebarWidth])

  const handleTagClick = async (tagId: string) => {
    const newSelectedIds = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter(id => id !== tagId)
      : [...selectedTagIds, tagId]

    setSelectedTagIds(newSelectedIds)

    if (newSelectedIds.length === 0) {
      setSelectedTags([])
    } else {
      try {
        const tags = await Promise.all(newSelectedIds.map(id => api.getTag(id)))
        setSelectedTags(tags.filter((t): t is Tag => t !== null))
      } catch (error) {
        console.error('Error filtering by tags:', error)
      }
    }
  }

  const handleClearTagFilters = () => {
    setSelectedTagIds([])
    setSelectedTags([])
  }

  // Sidebar tab drag handlers (v1.8)
  const handleSidebarTabDragStart = (e: React.DragEvent, tabId: SidebarTabId) => {
    setDraggedSidebarTab(tabId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', tabId)
  }

  const handleSidebarTabDragOver = (e: React.DragEvent, tabId: SidebarTabId) => {
    e.preventDefault()
    if (draggedSidebarTab && draggedSidebarTab !== tabId) {
      setDragOverSidebarTab(tabId)
    }
  }

  const handleSidebarTabDrop = (e: React.DragEvent, toTabId: SidebarTabId) => {
    e.preventDefault()
    if (!draggedSidebarTab || draggedSidebarTab === toTabId) {
      setDraggedSidebarTab(null)
      setDragOverSidebarTab(null)
      return
    }

    // Reorder tabs
    const newOrder = [...sidebarTabSettings.tabOrder]
    const fromIndex = newOrder.indexOf(draggedSidebarTab)
    const toIndex = newOrder.indexOf(toTabId)

    if (fromIndex !== -1 && toIndex !== -1) {
      newOrder.splice(fromIndex, 1)
      newOrder.splice(toIndex, 0, draggedSidebarTab)

      // Update state and persist
      setSidebarTabSettings(prev => ({ ...prev, tabOrder: newOrder }))
      updatePreferences({ sidebarTabOrder: newOrder })
    }

    setDraggedSidebarTab(null)
    setDragOverSidebarTab(null)
  }

  const handleSidebarTabDragEnd = () => {
    setDraggedSidebarTab(null)
    setDragOverSidebarTab(null)
  }

  // Sidebar tab context menu handler (v1.8)
  const handleSidebarTabContextMenu = (e: React.MouseEvent, tabId: SidebarTabId) => {
    e.preventDefault()
    setSidebarTabContextMenu({
      position: { x: e.clientX, y: e.clientY },
      tabId
    })
  }

  const handleSearchTagsForAutocomplete = async (query: string): Promise<Tag[]> => {
    const allTags = await api.getAllTags()
    if (query.trim() === '') return allTags
    const lowerQuery = query.toLowerCase()
    return allTags.filter((tag) => tag.name.toLowerCase().includes(lowerQuery))
  }

  // Quick capture handler - creates a new note with the captured content
  const handleQuickCapture = async (content: string, title?: string) => {
    const defaultProperties: Record<string, Property> = {
      status: { key: 'status', value: ['draft'], type: 'list' },  // List type must be array
      type: { key: 'type', value: ['note'], type: 'list' },  // List type must be array
    }

    await createNote({
      title: title || 'Quick capture',
      content,
      folder: 'inbox',
      properties: defaultProperties
    })
  }

  const handleTagClickInEditor = async (tagName: string) => {
    const tag = await api.getTagByName(tagName)
    if (tag) {
      handleTagClick(tag.id)
    }
  }

  // Left sidebar preference handlers removed - DashboardShell handles its own state

  // Handlers for right sidebar preferences
  const handleBacklinksSortChange = (sortBy: 'name' | 'date') => {
    setBacklinksSort(sortBy)
    localStorage.setItem('backlinksSort', sortBy)
  }

  const handleShowOutgoingLinksChange = () => {
    const newValue = !showOutgoingLinks
    setShowOutgoingLinks(newValue)
    localStorage.setItem('showOutgoingLinks', String(newValue))
  }

  const handleTagsSortChange = (sortBy: 'alpha' | 'count') => {
    setTagsSort(sortBy)
    localStorage.setItem('tagsSort', sortBy)
  }

  const handlePropertiesCollapseAll = () => {
    const newValue = !propertiesCollapsed
    setPropertiesCollapsed(newValue)
    localStorage.setItem('propertiesCollapsed', String(newValue))
  }

  // Notes list sorting is now handled in MissionSidebar

  // Build right sidebar menu sections based on active tab
  const getRightMenuSections = (): MenuSection[] => {
    switch (rightActiveTab) {
      case 'properties':
        return [
          {
            items: [
              { id: 'add-property', label: 'Add property', action: () => { /* placeholder */ }, shortcut: '/' },
              { id: 'collapse-all', label: propertiesCollapsed ? 'Expand all' : 'Collapse all', action: handlePropertiesCollapseAll },
            ]
          }
        ]
      case 'backlinks':
        return [
          {
            title: 'Sort by',
            items: [
              { id: 'backlinks-name', label: 'Name', action: () => handleBacklinksSortChange('name'), checked: backlinksSort === 'name' },
              { id: 'backlinks-date', label: 'Date', action: () => handleBacklinksSortChange('date'), checked: backlinksSort === 'date' },
            ]
          },
          {
            items: [
              { id: 'toggle-outgoing', label: 'Show outgoing links', action: handleShowOutgoingLinksChange, checked: showOutgoingLinks },
            ]
          }
        ]
      case 'tags':
        return [
          {
            title: 'Sort by',
            items: [
              { id: 'tags-alpha', label: 'Alphabetical', action: () => handleTagsSortChange('alpha'), checked: tagsSort === 'alpha' },
              { id: 'tags-count', label: 'By count', action: () => handleTagsSortChange('count'), checked: tagsSort === 'count' },
            ]
          },
          {
            items: [
              { id: 'bulk-edit', label: 'Bulk edit tags...', action: () => { /* placeholder */ }, disabled: true },
            ]
          }
        ]
      default:
        return []
    }
  }

  // Focus mode completely hides the dashboard shell
  if (focusMode) {
    return (
      <div className="w-full h-full bg-nexus-bg-primary text-nexus-text-primary flex flex-col overflow-hidden" style={{ height: '100vh' }}>
        {/* Custom CSS injection */}
        {preferences.customCSSEnabled && preferences.customCSS && (
          <style id="custom-user-css">{preferences.customCSS}</style>
        )}

        {/* Minimal focus mode header */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-white/5">
          <span className="text-sm text-nexus-text-muted">Focus Mode</span>
          <button
            onClick={() => handleFocusModeChange(false)}
            className="text-xs text-nexus-text-muted hover:text-nexus-text-primary"
          >
            Exit (⌘⇧F)
          </button>
        </header>

        {/* Focus mode editor */}
        <EditorOrchestrator
          selectedNote={selectedNote}
          notes={notes}
          editorMode={editorMode}
          onEditorModeChange={setEditorMode}
          editingTitle={editingTitle}
          onEditingTitleChange={setEditingTitle}
          onContentChange={handleContentChange}
          onTitleChange={handleTitleChange}
          onLinkClick={handleLinkClick}
          onTagClick={handleTagClickInEditor}
          onSearchNotes={handleSearchNotesForAutocomplete}
          onSearchTags={handleSearchTagsForAutocomplete}
          wordCount={wordCount}
          sessionStartWords={sessionStartWords}
          streakInfo={streakInfo}
          preferences={preferences}
          onToggleTerminal={() => {
            if (rightActiveTab === 'terminal' && !rightSidebarCollapsed) {
              setRightSidebarCollapsed(true)
            } else {
              setRightActiveTab('terminal')
              if (rightSidebarCollapsed) {
                setRightSidebarCollapsed(false)
              }
            }
          }}
          focusMode={true}
          onFocusModeChange={handleFocusModeChange}
          onCreateNote={handleCreateNote}
          onOpenDaily={handleDailyNote}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          pomodoroEnabled={preferences.pomodoroEnabled}
          onPomodoroComplete={handlePomodoroComplete}
          onBreakComplete={handleBreakComplete}
        />

        {/* Modals */}
        <CommandPalette
          open={isCommandPaletteOpen}
          setOpen={setIsCommandPaletteOpen}
          notes={notes}
          onSelectNote={(noteId) => {
            const note = notes.find(n => n.id === noteId)
            if (note) {
              openNoteTab(noteId, note.title)
              selectNote(noteId)
            }
          }}
          onCreateNote={handleCreateNote}
          onDailyNote={handleDailyNote}
          onToggleFocus={() => handleFocusModeChange(!focusMode)}
          onObsidianSync={handleObsidianSync}
          onRunClaude={handleRunClaude}
          onRunGemini={handleRunGemini}
          onExport={() => setIsExportDialogOpen(true)}
          onOpenGraph={() => setIsGraphViewOpen(true)}
          hasSelectedNote={!!selectedNote}
        />
        <QuickCaptureOverlay
          isOpen={isQuickCaptureOpen}
          onClose={() => setIsQuickCaptureOpen(false)}
          onCapture={handleQuickCapture}
        />
        <KeyboardShortcuts
          isOpen={isKeyboardShortcutsOpen}
          onClose={() => setIsKeyboardShortcutsOpen(false)}
        />
      </div>
    )
  }

  // Normal mode: Three-state collapsible sidebar + main content
  return (
    <div className="w-full h-full bg-nexus-bg-primary text-nexus-text-primary flex overflow-hidden" style={{ height: '100vh' }}>
      {/* Keyboard shortcut handler (headless component) */}
      <KeyboardShortcutHandler
        focusMode={focusMode}
        onFocusModeChange={handleFocusModeChange}
        onCreateNote={handleCreateNote}
        onDailyNote={handleDailyNote}
        selectedNote={selectedNote}
        onExportDialogOpen={() => setIsExportDialogOpen(true)}
        onGraphViewOpen={() => setIsGraphViewOpen(true)}
        onSearchPanelOpen={() => setIsSearchPanelOpen(true)}
        onQuickCaptureOpen={() => setIsQuickCaptureOpen(true)}
        onCreateProjectOpen={() => setIsCreateProjectModalOpen(true)}
        onKeyboardShortcutsOpen={() => setIsKeyboardShortcutsOpen(true)}
        onSettingsOpen={() => setIsSettingsOpen(true)}
        onLeftSidebarToggle={() => setLeftSidebarCollapsed(prev => !prev)}
        onRightSidebarToggle={() => setRightSidebarCollapsed(prev => !prev)}
        onCollapseAll={collapseAll}
        rightSidebarCollapsed={rightSidebarCollapsed}
        openTabs={openTabs}
        activeTabId={activeTabId}
        onSetActiveTab={setActiveTab}
        onCloseTab={closeTab}
        onReopenLastClosedTab={reopenLastClosedTab}
        rightActiveTab={rightActiveTab}
        onRightActiveTabChange={setRightActiveTab}
        sidebarTabSettings={sidebarTabSettings}
        onExpandSmartIcon={expandSmartIcon}
        editorMode={editorMode}
        onEditorModeChange={setEditorMode}
        themeShortcuts={themeShortcuts}
        allThemes={allThemes}
        onThemeChange={setTheme}
      />

      {/* Custom CSS injection from user preferences */}
      {preferences.customCSSEnabled && preferences.customCSS && (
        <style id="custom-user-css">{preferences.customCSS}</style>
      )}

      {/* Titlebar drag region for window moving - uses Tauri API */}
      <DragRegion className="titlebar-drag-region" />

      {/* Three-state collapsible sidebar (icon/compact/card) */}
      <MissionSidebar
        projects={projects}
        notes={notes}
        currentProjectId={currentProjectId}
        onSelectProject={setCurrentProject}
        onSelectNote={(noteId) => {
          const note = notes.find(n => n.id === noteId)
          if (note) {
            openNoteTab(noteId, note.title)
            setEditorMode('source')
            selectNote(noteId)
          }
        }}
        onCreateProject={() => setIsCreateProjectModalOpen(true)}
        onNewNote={async (projectId) => {
          // Create new note directly with project assignment
          const newNote = await createNote({
            title: 'New Note',
            content: '',
            folder: 'inbox',
            project_id: projectId
          })
          // Guard against undefined (createNote may fail)
          if (!newNote) {
            console.error('[Scribe] Failed to create note')
            return
          }
          // Open the note in a tab and select it (fix for note creation bug)
          openNoteTab(newNote.id, newNote.title)
          selectNote(newNote.id)
          setEditorMode('source')
        }}
        // Context menu handlers
        onEditProject={(projectId) => {
          setEditingProjectId(projectId)
        }}
        onArchiveProject={async (projectId) => {
          const project = projects.find(p => p.id === projectId)
          if (!project) return
          const newStatus = project.status === 'archive' ? 'active' : 'archive'
          await api.updateProject(projectId, { status: newStatus })
          await loadProjects()
        }}
        onDeleteProject={async (projectId) => {
          const project = projects.find(p => p.id === projectId)
          if (!project) return
          const confirmed = await dialogs.ask(
            `Are you sure you want to delete "${project.name}"? This cannot be undone.`,
            { title: 'Delete Project' }
          )
          if (confirmed) {
            await api.deleteProject(projectId)
            if (currentProjectId === projectId) {
              setCurrentProject(null)
            }
            await loadProjects()
          }
        }}
        onPinProject={(projectId) => {
          const project = projects.find(p => p.id === projectId)
          if (!project) return
          const success = addPinnedVault(projectId, project.name, project.color)
          if (!success) {
            showToast('Maximum 4 projects can be pinned to the sidebar', 'error')
          }
        }}
        onUnpinProject={(projectId) => {
          removePinnedVault(projectId)
        }}
        onRenameNote={async (noteId) => {
          // Select the note and focus for rename
          selectNote(noteId)
          setEditorMode('source')
          // TODO: trigger inline rename in editor
        }}
        onMoveNoteToProject={async (noteId, projectId) => {
          await api.setNoteProject(noteId, projectId)
          // Refresh notes list
          await loadNotes()
        }}
        onDuplicateNote={async (noteId) => {
          const note = notes.find(n => n.id === noteId)
          if (!note) return
          const newNote = await createNote({
            title: `${note.title || 'Untitled'} (copy)`,
            content: note.content,
            folder: note.folder
          })
          if (!newNote) return
          if (note.project_id) {
            await api.setNoteProject(newNote.id, note.project_id)
          }
          selectNote(newNote.id)
          setEditorMode('source')
        }}
        onDeleteNote={async (noteId) => {
          const note = notes.find(n => n.id === noteId)
          if (!note) return
          const confirmed = await dialogs.ask(
            `Are you sure you want to delete "${note.title || 'Untitled'}"?`,
            { title: 'Delete Note' }
          )
          if (confirmed) {
            await api.deleteNote(noteId)
            if (selectedNoteId === noteId) {
              selectNote(null as unknown as string)
            }
            // Refresh notes list
            await loadNotes()
          }
        }}
        onSearch={() => setIsSearchPanelOpen(true)}
        onDaily={handleDailyNote}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main editor area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor header for visual alignment with sidebar */}
          <div className="editor-header" {...dragRegion}>
            {/* Breadcrumb navigation */}
            <div className="editor-breadcrumb">
              {currentProjectId && projects.find(p => p.id === currentProjectId) && (
                <>
                  <span
                    className="breadcrumb-item clickable"
                    onClick={() => setActiveTab(MISSION_CONTROL_TAB_ID)}
                    title="Go to Mission Control"
                  >
                    {projects.find(p => p.id === currentProjectId)?.name}
                  </span>
                  <span className="breadcrumb-separator">›</span>
                </>
              )}
              {selectedNote && (
                <span className="breadcrumb-item current">{selectedNote.title}</span>
              )}
            </div>

            {/* Zoom indicator — only shown when zoom ≠ 100% */}
            {zoomLevel !== 1.0 && (
              <button
                className="zoom-indicator"
                onClick={resetZoom}
                title="Click to reset zoom to 100%"
                aria-label={`Zoom level ${Math.round(zoomLevel * 100)}%, click to reset`}
              >
                {Math.round(zoomLevel * 100)}%
              </button>
            )}

          </div>

          {/* Editor tabs bar */}
          <EditorTabs
            accentColor={currentProjectId ? projects.find(p => p.id === currentProjectId)?.color : '#3b82f6'}
          />

          <TagFilter selectedTags={selectedTags} onRemoveTag={handleTagClick} onClearAll={handleClearTagFilters} />

          {/* Show content based on active tab */}
          {activeTabId === MISSION_CONTROL_TAB_ID ? (
            <MissionControl
              projects={projects}
              notes={notes}
              currentProjectId={currentProjectId}
              onSelectProject={setCurrentProject}
              onSelectNote={(noteId) => {
                const note = notes.find(n => n.id === noteId)
                if (note) {
                  openNoteTab(noteId, note.title)
                  selectNote(noteId)
                }
              }}
              onCreateNote={handleCreateNote}
              onDailyNote={handleDailyNote}
              onQuickCapture={() => setIsQuickCaptureOpen(true)}
              onSettings={() => setIsSettingsOpen(true)}
              onCreateProject={() => setIsCreateProjectModalOpen(true)}
            />
          ) : selectedNote ? (
            <EditorOrchestrator
              selectedNote={selectedNote}
              notes={notes}
              editorMode={editorMode}
              onEditorModeChange={setEditorMode}
              editingTitle={editingTitle}
              onEditingTitleChange={setEditingTitle}
              onContentChange={handleContentChange}
              onTitleChange={handleTitleChange}
              onLinkClick={handleLinkClick}
              onTagClick={handleTagClickInEditor}
              onSearchNotes={handleSearchNotesForAutocomplete}
              onSearchTags={handleSearchTagsForAutocomplete}
              wordCount={wordCount}
              sessionStartWords={sessionStartWords}
              streakInfo={streakInfo}
              preferences={preferences}
              onToggleTerminal={() => {
                if (rightActiveTab === 'terminal' && !rightSidebarCollapsed) {
                  setRightSidebarCollapsed(true)
                } else {
                  setRightActiveTab('terminal')
                  if (rightSidebarCollapsed) {
                    setRightSidebarCollapsed(false)
                  }
                }
              }}
              focusMode={false}
              onFocusModeChange={handleFocusModeChange}
              onCreateNote={handleCreateNote}
              onOpenDaily={handleDailyNote}
              onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
              editorContainerRef={editorContainerRef}
              pomodoroEnabled={preferences.pomodoroEnabled}
              onPomodoroComplete={handlePomodoroComplete}
              onBreakComplete={handleBreakComplete}
            />
          ) : (
            <MissionControl
              projects={projects}
              notes={notes}
              currentProjectId={currentProjectId}
              onSelectProject={setCurrentProject}
              onSelectNote={selectNote}
              onCreateNote={handleCreateNote}
              onDailyNote={handleDailyNote}
              onQuickCapture={() => setIsQuickCaptureOpen(true)}
              onSettings={() => setIsSettingsOpen(true)}
              onCreateProject={() => setIsCreateProjectModalOpen(true)}
            />
          )}
        </div>

        {/* Right sidebar (properties/backlinks/tags) - shown when a note is selected */}
        {selectedNote && (
          <>
            {!rightSidebarCollapsed && (
              <ResizeHandle
                onResize={(deltaX) => {
                  const newWidth = Math.max(
                    RIGHT_SIDEBAR_WIDTHS.expanded.min,
                    Math.min(RIGHT_SIDEBAR_WIDTHS.expanded.max, rightSidebarWidth - deltaX)
                  )
                  setRightSidebarWidth(newWidth)
                }}
                onResizeEnd={() => localStorage.setItem('rightSidebarWidth', String(rightSidebarWidth))}
                onReset={() => {
                  setRightSidebarWidth(RIGHT_SIDEBAR_WIDTHS.expanded.default)
                  localStorage.setItem('rightSidebarWidth', String(RIGHT_SIDEBAR_WIDTHS.expanded.default))
                }}
                onDragStateChange={setIsResizingRight}
              />
            )}
            <div
              className={`bg-nexus-bg-secondary flex flex-col ${rightSidebarCollapsed ? 'right-sidebar-collapsed' : ''}${isResizingRight ? ' resizing' : ''}`}
              style={{ width: rightSidebarCollapsed ? `${RIGHT_SIDEBAR_WIDTHS.icon}px` : `${rightSidebarWidth}px` }}
              data-testid="right-sidebar"
            >
              {/* Fixed header with toggle button - always in same position */}
              <div className={`sidebar-header ${rightSidebarCollapsed ? 'collapsed' : ''}`}>
                <button
                  className="sidebar-toggle-btn"
                  onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
                  title={rightSidebarCollapsed ? "Expand sidebar (⌘⇧])" : "Collapse sidebar (⌘⇧])"}
                  aria-label={rightSidebarCollapsed ? "Show right sidebar" : "Hide right sidebar"}
                  data-testid="right-sidebar-toggle"
                >
                  {rightSidebarCollapsed ? <PanelRightOpen size={16} /> : <PanelRightClose size={16} />}
                </button>
              </div>

              {/* Icon-only mode when collapsed */}
              {rightSidebarCollapsed ? (
                <div className="flex flex-col items-center pt-2 gap-1">
                  {/* Render icon buttons in configured order, filtering hidden ones */}
                  {sidebarTabSettings.tabOrder
                    .filter((tabId: SidebarTabId) => !sidebarTabSettings.hiddenTabs.includes(tabId))
                    .map((tabId: SidebarTabId) => {
                      const iconConfig: Record<SidebarTabId, { icon: React.ReactNode; label: string; testId?: string }> = {
                        properties: { icon: <Settings2 size={18} />, label: 'Properties', testId: 'properties-tab-icon' },
                        backlinks: { icon: <Link2 size={18} />, label: 'Backlinks', testId: 'backlinks-tab-icon' },
                        tags: { icon: <Tags size={18} />, label: 'Tags', testId: 'tags-tab-icon' },
                        stats: { icon: <BarChart3 size={18} />, label: 'Stats', testId: 'stats-tab-icon' },
                        claude: { icon: <Sparkles size={18} />, label: 'Claude', testId: 'claude-tab-icon' },
                        terminal: { icon: <Terminal size={18} />, label: 'Terminal', testId: 'terminal-tab-icon' }
                      }
                      const config = iconConfig[tabId]
                      return (
                        <button
                          key={tabId}
                          className={`right-sidebar-icon-btn ${rightActiveTab === tabId ? 'active' : ''}`}
                          onClick={() => { setRightActiveTab(tabId); setRightSidebarCollapsed(false) }}
                          title={config.label}
                          data-testid={config.testId}
                        >
                          {config.icon}
                        </button>
                      )
                    })
                  }
                </div>
              ) : (
                <>
                  <div
                    className="sidebar-tabs"
                    data-sidebar-tab-size={sidebarTabSize}
                  >
                    {/* Scrollable tabs area */}
                    <div className="sidebar-tabs-scroll">
                      {/* Render tabs in configured order, filtering out hidden ones */}
                      {sidebarTabSettings.tabOrder
                        .filter((tabId: SidebarTabId) => !sidebarTabSettings.hiddenTabs.includes(tabId))
                        .map((tabId: SidebarTabId) => {
                          const tabConfig: Record<SidebarTabId, { icon: React.ReactNode; label: string; testId?: string }> = {
                            properties: { icon: <Settings2 size={14} className="mr-1.5" />, label: 'Properties' },
                            backlinks: { icon: <Link2 size={14} className="mr-1.5" />, label: 'Backlinks' },
                            tags: { icon: <Tags size={14} className="mr-1.5" />, label: 'Tags' },
                            stats: { icon: <BarChart3 size={14} className="mr-1.5" />, label: 'Stats' },
                            claude: { icon: <Sparkles size={14} className="mr-1.5" />, label: 'Claude', testId: 'claude-tab' },
                            terminal: { icon: <Terminal size={14} className="mr-1.5" />, label: 'Term', testId: 'terminal-tab' }
                          }
                          const config = tabConfig[tabId]
                          const isDragging = draggedSidebarTab === tabId
                          const isDragOver = dragOverSidebarTab === tabId
                          return (
                            <button
                              key={tabId}
                              className={`sidebar-tab ${rightActiveTab === tabId ? 'active' : ''} ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
                              onClick={() => setRightActiveTab(tabId)}
                              onContextMenu={(e) => handleSidebarTabContextMenu(e, tabId)}
                              data-testid={config.testId}
                              draggable
                              onDragStart={(e) => handleSidebarTabDragStart(e, tabId)}
                              onDragOver={(e) => handleSidebarTabDragOver(e, tabId)}
                              onDrop={(e) => handleSidebarTabDrop(e, tabId)}
                              onDragEnd={handleSidebarTabDragEnd}
                            >
                              {config.icon}
                              {config.label}
                            </button>
                          )
                        })
                      }
                    </div>
                    {/* Panel options menu at end of tabs */}
                    <PanelMenu sections={getRightMenuSections()} />
                  </div>
                  <div className="tab-content flex-1">
                    {rightActiveTab === 'properties' ? (
                      <PropertiesPanel
                        properties={selectedNote.properties || {}}
                        onChange={(p) => updateNote(selectedNote.id, { properties: p })}
                        noteTags={currentNoteTags}
                        wordCount={wordCount}
                        wordGoal={selectedNote.properties?.word_goal ? Number(selectedNote.properties.word_goal.value) : undefined}
                        defaultWordGoal={preferences.defaultWordGoal}
                        streak={streakInfo.streak}
                        createdAt={selectedNote.created_at}
                        updatedAt={selectedNote.updated_at}
                      />
                    ) : rightActiveTab === 'backlinks' ? (
                      <BacklinksPanel
                        noteId={selectedNote.id}
                        noteTitle={selectedNote.title}
                        onSelectNote={(noteId) => {
                          const note = notes.find(n => n.id === noteId)
                          if (note) {
                            openNoteTab(noteId, note.title)
                            // Preserve current editor mode when navigating via backlinks
                            selectNote(noteId)
                          }
                        }}
                        refreshKey={backlinksRefreshKey}
                      />
                    ) : rightActiveTab === 'tags' ? (
                      <TagsPanel
                        noteId={selectedNote.id}
                        selectedTagIds={selectedTagIds}
                        onTagClick={handleTagClick}
                      />
                    ) : rightActiveTab === 'stats' ? (
                      <StatsPanel
                        projects={projects}
                        notes={notes}
                        currentProjectId={currentProjectId}
                        wordCount={wordCount}
                        wordGoal={selectedNote.properties?.word_goal ? Number(selectedNote.properties.word_goal.value) : preferences.defaultWordGoal}

                        onSelectProject={setCurrentProject}
                        onSelectNote={(noteId) => {
                          const note = notes.find(n => n.id === noteId)
                          if (note) {
                            openNoteTab(noteId, note.title)
                            selectNote(noteId)
                          }
                        }}
                      />
                    ) : rightActiveTab === 'claude' ? (
                      <ClaudeChatPanel
                        noteContext={selectedNote ? {
                          title: selectedNote.title,
                          content: selectedNote.content
                        } : undefined}
                        availableNotes={notes.map(n => ({
                          id: n.id,
                          title: n.title,
                          content: n.content
                        }))}
                      />
                    ) : (
                      <TerminalPanel />
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}

      </div>

      {/* Claude Tab Toggle Button - Opens Claude tab in right sidebar */}
      <button
        className={`claude-toggle-btn ${rightActiveTab === 'claude' && !rightSidebarCollapsed ? 'active' : ''}`}
        onClick={() => {
          setRightActiveTab('claude')
          setRightSidebarCollapsed(false)
        }}
        title="Open Claude Assistant (in sidebar)"
      >
        <Sparkles size={20} />
      </button>

      {/* Command Palette */}
      <CommandPalette
        open={isCommandPaletteOpen}
        setOpen={setIsCommandPaletteOpen}
        notes={notes}
        onSelectNote={(noteId) => {
          const note = notes.find(n => n.id === noteId)
          if (note) {
            openNoteTab(noteId, note.title)
            selectNote(noteId)
          }
        }}
        onCreateNote={handleCreateNote}
        onDailyNote={handleDailyNote}
        onToggleFocus={() => handleFocusModeChange(!focusMode)}
        onObsidianSync={handleObsidianSync}
        onRunClaude={handleRunClaude}
        onRunGemini={handleRunGemini}
        onExport={() => setIsExportDialogOpen(true)}
        onOpenGraph={() => setIsGraphViewOpen(true)}
        hasSelectedNote={!!selectedNote}
      />

      {/* Settings Modal - Comprehensive Settings UI */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        themes={allThemes}
        currentTheme={theme}
        onThemeChange={setTheme}
        autoThemeSettings={autoThemeSettings}
        onAutoThemeChange={handleAutoThemeChange}
        onSaveCustomTheme={handleSaveCustomTheme}
        onDeleteCustomTheme={handleDeleteCustomTheme}
        fontSettings={fontSettings}
        onFontSettingsChange={handleFontSettingsChange}
        themeShortcuts={themeShortcuts}
        onThemeShortcutsChange={handleThemeShortcutsChange}
      />

      {/* Export Dialog */}
      {selectedNote && (
        <ExportDialog
          isOpen={isExportDialogOpen}
          onClose={() => setIsExportDialogOpen(false)}
          noteId={selectedNote.id}
          noteTitle={selectedNote.title}
          noteContent={selectedNote.content}
          noteProperties={selectedNote.properties}
          noteTags={currentNoteTags.map(t => t.name)}
        />
      )}

      {/* Graph View */}
      <GraphView
        isOpen={isGraphViewOpen}
        onClose={() => setIsGraphViewOpen(false)}
        notes={notes}
        onSelectNote={selectNote}
        currentNoteId={selectedNoteId || undefined}
      />

      {/* Keyboard Shortcuts Cheatsheet */}
      <KeyboardShortcuts
        isOpen={isKeyboardShortcutsOpen}
        onClose={() => setIsKeyboardShortcutsOpen(false)}
      />

      {/* Search Panel (Cmd+F) */}
      <SearchPanel
        isOpen={isSearchPanelOpen}
        onClose={() => setIsSearchPanelOpen(false)}
        onSelectNote={(noteId) => {
          const note = notes.find(n => n.id === noteId)
          if (note) {
            openNoteTab(noteId, note.title)
            setEditorMode('source')
            selectNote(noteId)
          }
        }}
        currentProject={currentProjectId ? projects.find(p => p.id === currentProjectId) : null}
        projects={projects}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onCreateProject={async (projectData) => {
          try {
            const newProject = await createProject(
              projectData.name,
              projectData.type,
              projectData.description,
              projectData.color
            )
            // Auto-pin the new project so it appears in the sidebar
            addPinnedVault(newProject.id, newProject.name, newProject.color)
          } catch (error) {
            console.error('Failed to create project:', error)
          }
        }}
        existingProjectNames={projects.map(p => p.name.toLowerCase())}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={editingProjectId !== null}
        project={projects.find(p => p.id === editingProjectId) || null}
        onClose={() => setEditingProjectId(null)}
        onUpdateProject={async (projectId, updates) => {
          try {
            await api.updateProject(projectId, updates)
            await loadProjects()
          } catch (error) {
            console.error('Failed to update project:', error)
          }
        }}
        existingProjectNames={projects.map(p => p.name.toLowerCase())}
      />

      {/* Quick Capture Overlay (⌘⇧C) */}
      <QuickCaptureOverlay
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
        onCapture={handleQuickCapture}
      />

      {/* Sidebar Tab Context Menu (v1.8) */}
      {sidebarTabContextMenu && (
        <SidebarTabContextMenu
          position={sidebarTabContextMenu.position}
          tabId={sidebarTabContextMenu.tabId}
          tabOrder={sidebarTabSettings.tabOrder}
          hiddenTabs={sidebarTabSettings.hiddenTabs}
          onClose={() => setSidebarTabContextMenu(null)}
          onReorder={(newOrder) => setSidebarTabSettings(prev => ({ ...prev, tabOrder: newOrder }))}
          onHide={(newHidden) => {
            setSidebarTabSettings(prev => ({ ...prev, hiddenTabs: newHidden }))
            // If current tab is now hidden, switch to first visible
            if (newHidden.includes(rightActiveTab)) {
              const firstVisible = sidebarTabSettings.tabOrder.find(t => !newHidden.includes(t))
              if (firstVisible) setRightActiveTab(firstVisible)
            }
          }}
        />
      )}

      {/* Icon Legend - First launch guide */}
      <IconLegend />
    </div>
  )
}

// ============================================================================
// Toast Initializer - Connects global toast function
// ============================================================================

function ToastInitializer() {
  const { showToast } = useToast()

  useEffect(() => {
    setGlobalToast(showToast)
  }, [showToast])

  return null
}

// ============================================================================
// App Wrapper - Provides Toast Context
// ============================================================================

function AppWithToast() {
  return (
    <ToastProvider>
      <ToastInitializer />
      <App />
    </ToastProvider>
  )
}

export default AppWithToast
