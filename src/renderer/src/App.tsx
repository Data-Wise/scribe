import { useEffect, useState } from 'react'
import { useNotesStore } from './store/useNotesStore'
import { useProjectStore } from './store/useProjectStore'
import { useAppViewStore, MISSION_CONTROL_TAB_ID } from './store/useAppViewStore'
import { EditorTabs } from './components/EditorTabs'
import { useForestTheme } from './hooks/useForestTheme'
import { HybridEditor } from './components/HybridEditor'
import { BacklinksPanel } from './components/BacklinksPanel'
import { TagFilter } from './components/TagFilter'
import { PropertiesPanel } from './components/PropertiesPanel'
import { TagsPanel } from './components/TagsPanel'
import { StatsPanel } from './components/StatsPanel'
import { SettingsModal } from './components/SettingsModal'
import { EmptyState } from './components/EmptyState'
import { MissionControl } from './components/MissionControl'
import { ExportDialog } from './components/ExportDialog'
import { GraphView } from './components/GraphView'
import { CreateProjectModal } from './components/CreateProjectModal'
import { EditProjectModal } from './components/EditProjectModal'
import { MissionSidebar } from './components/sidebar'
import { ClaudeChatPanel } from './components/ClaudeChatPanel'
import { TerminalPanel } from './components/TerminalPanel'
import { SidebarTabContextMenu } from './components/SidebarTabContextMenu'
import { QuickCaptureOverlay } from './components/QuickCaptureOverlay'
import { DragRegion } from './components/DragRegion'
import { ToastProvider, useToast, setGlobalToast } from './components/Toast'
import { Note, Tag, Property } from './types'
import { Settings2, Link2, Tags, PanelRightOpen, PanelRightClose, BarChart3, Sparkles, Terminal } from 'lucide-react'
import { api } from './lib/api'
import { isTauri } from './lib/platform'
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
  loadCustomThemes,
  saveCustomThemes,
  loadAutoThemeSettings,
  saveAutoThemeSettings,
  loadSelectedTheme,
  saveSelectedTheme,
  applyTheme,
  getAutoTheme,
  loadFontSettings,
  saveFontSettings,
  applyFontSettings,
  loadThemeShortcuts,
  saveThemeShortcuts,
  getThemeForShortcut,
} from './lib/themes'
import {
  loadPreferences,
  updatePreferences,
  updateStreak,
  getStreakInfo,
  UserPreferences,
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

  // Apply Forest Night theme
  useForestTheme()

  // Sidebar mode and tabs from app view store
  const {
    cycleSidebarMode,
    toggleSidebarCollapsed,
    setLastActiveNote,
    updateSessionTimestamp,
    // Tab state
    openTabs,
    activeTabId,
    setActiveTab,
    openNoteTab,
    closeTab,
    reopenLastClosedTab
  } = useAppViewStore()
  const [currentFolder] = useState<string | undefined>(undefined)
  const [editingTitle, setEditingTitle] = useState(false)

  // User preferences with persistence
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadPreferences())
  const [streakInfo, setStreakInfo] = useState(() => getStreakInfo())

  // Focus mode state (persisted)
  const [focusMode, setFocusMode] = useState(() => preferences.focusModeEnabled)

  // Persist focus mode changes
  const handleFocusModeChange = (enabled: boolean) => {
    setFocusMode(enabled)
    const updated = updatePreferences({ focusModeEnabled: enabled })
    setPreferences(updated)
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
    return saved ? parseInt(saved) : 320
  })
  const [isResizingRight, setIsResizingRight] = useState(false)

  // Session timer for focus tracking (ADHD feature) - persisted to localStorage
  const [sessionStart, setSessionStart] = useState(() => {
    const saved = localStorage.getItem('sessionStart')
    return saved ? parseInt(saved) : Date.now()
  })
  const [sessionDuration, setSessionDuration] = useState(0)
  const [timerPaused, setTimerPaused] = useState(() => {
    return localStorage.getItem('timerPaused') === 'true'
  })
  const [pausedDuration, setPausedDuration] = useState(() => {
    const saved = localStorage.getItem('pausedDuration')
    return saved ? parseInt(saved) : 0
  })

  // Persist session start to localStorage
  useEffect(() => {
    localStorage.setItem('sessionStart', sessionStart.toString())
  }, [sessionStart])

  // Persist paused state
  useEffect(() => {
    localStorage.setItem('timerPaused', timerPaused.toString())
  }, [timerPaused])

  // Persist paused duration
  useEffect(() => {
    localStorage.setItem('pausedDuration', pausedDuration.toString())
  }, [pausedDuration])

  useEffect(() => {
    if (timerPaused) return
    const timer = setInterval(() => {
      setSessionDuration(Math.floor((Date.now() - sessionStart) / 1000) - pausedDuration)
    }, 1000)
    return () => clearInterval(timer)
  }, [sessionStart, timerPaused, pausedDuration])

  const formatSessionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const toggleTimerPause = () => {
    if (timerPaused) {
      // Resuming - calculate how long we were paused and add to pausedDuration
      const pauseStart = parseInt(localStorage.getItem('pauseStart') || '0')
      if (pauseStart) {
        const additionalPause = Math.floor((Date.now() - pauseStart) / 1000)
        setPausedDuration(prev => prev + additionalPause)
      }
      localStorage.removeItem('pauseStart')
    } else {
      // Pausing - record when we paused
      localStorage.setItem('pauseStart', Date.now().toString())
    }
    setTimerPaused(!timerPaused)
  }

  const resetTimer = () => {
    const newStart = Date.now()
    setSessionStart(newStart)
    setSessionDuration(0)
    setPausedDuration(0)
    setTimerPaused(false)
    localStorage.removeItem('pauseStart')
  }
  
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

  // Right sidebar tab settings (v1.8 - from preferences)
  const [sidebarTabSettings, setSidebarTabSettings] = useState(() => {
    const prefs = loadPreferences()
    return {
      tabSize: prefs.sidebarTabSize,
      tabOrder: prefs.sidebarTabOrder,
      hiddenTabs: prefs.sidebarHiddenTabs
    }
  })

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isGraphViewOpen, setIsGraphViewOpen] = useState(false)
  const [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen] = useState(false)
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false)
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false)

  // Tag filtering - filteredNotes now handled by MissionSidebar

  // Session tracking - time when first keystroke occurred
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)
  
  // Backlinks refresh key - increment to force BacklinksPanel refresh
  const [backlinksRefreshKey, setBacklinksRefreshKey] = useState(0)
  
  // Editor mode - source, live-preview, or reading (persisted in preferences)
  const [editorMode, setEditorMode] = useState<EditorMode>(() => {
    const prefs = loadPreferences()
    return prefs.editorMode || 'source'
  })
  
  // Tags for current note (for PropertiesPanel display)
  const [currentNoteTags, setCurrentNoteTags] = useState<Tag[]>([])
  
  // Theme state
  const [allThemes, setAllThemes] = useState<Record<string, Theme>>(() => getAllThemes())
  const [theme, setTheme] = useState<string>(() => loadSelectedTheme())
  const [autoThemeSettings, setAutoThemeSettings] = useState<AutoThemeSettings>(() => loadAutoThemeSettings())
  
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
  
  // Handle auto-theme settings change
  const handleAutoThemeChange = (settings: AutoThemeSettings) => {
    setAutoThemeSettings(settings)
    saveAutoThemeSettings(settings)
  }
  
  // Handle custom theme save
  const handleSaveCustomTheme = (newTheme: Theme) => {
    const customs = loadCustomThemes()
    customs[newTheme.id] = newTheme
    saveCustomThemes(customs)
    setAllThemes(getAllThemes())
  }
  
  // Handle custom theme delete
  const handleDeleteCustomTheme = (themeId: string) => {
    const customs = loadCustomThemes()
    delete customs[themeId]
    saveCustomThemes(customs)
    setAllThemes(getAllThemes())
    // If deleted theme was selected, switch to default
    if (theme === themeId) {
      setTheme('sage-garden')
    }
  }

  // Font settings state
  const [fontSettings, setFontSettings] = useState<FontSettings>(() => loadFontSettings())
  
  // Apply font settings on load and change
  useEffect(() => {
    applyFontSettings(fontSettings)
    saveFontSettings(fontSettings)
  }, [fontSettings])
  
  // Theme shortcuts state
  const [themeShortcuts, setThemeShortcuts] = useState<ThemeShortcut[]>(() => loadThemeShortcuts())
  
  // Theme keyboard shortcuts: Cmd/Ctrl + Alt + [1-0]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd/Ctrl + Alt + number key
      if ((e.metaKey || e.ctrlKey) && e.altKey && /^[0-9]$/.test(e.key)) {
        e.preventDefault()
        const targetTheme = getThemeForShortcut(e.key, themeShortcuts)
        if (targetTheme && allThemes[targetTheme]) {
          setTheme(targetTheme)
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [themeShortcuts, allThemes])
  
  // Handle font settings change
  const handleFontSettingsChange = (settings: FontSettings) => {
    setFontSettings(settings)
  }
  
  // Handle theme shortcuts change
  const handleThemeShortcutsChange = (shortcuts: ThemeShortcut[]) => {
    setThemeShortcuts(shortcuts)
    saveThemeShortcuts(shortcuts)
  }


  // Diagnostic: Test Tauri commands on startup
  useEffect(() => {
    const runDiagnostics = async () => {
      const { isTauri } = await import('./lib/platform')
      console.log('[Scribe Diagnostics] Platform:', isTauri() ? 'TAURI' : 'BROWSER')
      console.log('[Scribe Diagnostics] window.__TAURI__:', !!(window as unknown as { __TAURI__: unknown }).__TAURI__)

      try {
        console.log('[Scribe Diagnostics] Testing listNotes...')
        const notes = await api.listNotes()
        console.log('[Scribe Diagnostics] listNotes returned:', notes.length, 'notes')
        if (notes.length > 0) {
          console.log('[Scribe Diagnostics] First note:', notes[0].title)
        }

        console.log('[Scribe Diagnostics] Testing listProjects...')
        const projects = await api.listProjects()
        console.log('[Scribe Diagnostics] listProjects returned:', projects.length, 'projects')
        if (projects.length > 0) {
          console.log('[Scribe Diagnostics] First project:', projects[0].name)
        }

        console.log('[Scribe Diagnostics] All commands working!')
      } catch (error) {
        console.error('[Scribe Diagnostics] FAILED:', error)
        console.error('[Scribe Diagnostics] Error details:', (error as Error).message, (error as Error).stack)
      }
    }
    runDiagnostics()
  }, [])

  useEffect(() => {
    loadNotes(currentFolder)
  }, [loadNotes, currentFolder])

  // Load projects on startup
  useEffect(() => {
    loadProjects()
  }, [loadProjects])

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
      status: { key: 'status', value: 'draft', type: 'list' },
      type: { key: 'type', value: 'note', type: 'list' },
    }

    await createNote({
      title: `New Note`,
      content: '',  // Empty markdown - user starts fresh
      folder: currentFolder || 'inbox',
      properties: defaultProperties,
      project_id: currentProjectId || undefined  // Auto-assign to current project
    })
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

  const handleContentChange = async (content: string) => {
    if (selectedNote) {
      // Start session timer on first keystroke
      if (!sessionStartTime && content.length > 0) {
        setSessionStartTime(Date.now())
      }

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
    console.log('[App] handleLinkClick called with title:', title)
    try {
      let targetNote = notes.find((n) => n.title === title)

      if (!targetNote) {
        const allNotes = await api.listNotes()
        targetNote = allNotes.find((n) => n.title === title)
      }

      if (targetNote) {
        console.log('[App] Found target note:', targetNote.id)
        // Keep preview mode when navigating via wiki-link click
        setEditorMode('reading')
        selectNote(targetNote.id)
      } else {
        console.log('[App] Creating new note for:', title)
        const newNote = await api.createNote({
          title,
          content: '',  // Empty markdown
          folder: selectedNote?.folder || 'inbox'
        })

        if (selectedNote) {
          await api.updateNoteLinks(selectedNote.id, selectedNote.content)
        }

        // New note opens in write mode
        setEditorMode('source')
        selectNote(newNote.id)
        loadNotes(currentFolder)
      }
    } catch (error) {
      console.error('[App] handleLinkClick error:', error)
    }
  }

  const handleDailyNote = async () => {
    console.log('[Scribe] handleDailyNote called')
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0]
    console.log('[Scribe] Creating/opening daily note for:', dateStr)
    try {
      const dailyNote = await api.getOrCreateDailyNote(dateStr)
      console.log('[Scribe] Daily note received:', dailyNote)

      // If note is empty (newly created), apply template
      if (isContentEmpty(dailyNote.content)) {
        const templateContent = getDailyNoteContent(today)
        await api.updateNote(dailyNote.id, { content: templateContent })
        dailyNote.content = templateContent
      }

      selectNote(dailyNote.id)
      console.log('[Scribe] Note selected:', dailyNote.id)
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        handleFocusModeChange(!focusMode)
      }

      // Export shortcut (Cmd+Shift+E)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault()
        if (selectedNote) {
          setIsExportDialogOpen(true)
        }
      }

      // Graph view shortcut (Cmd+Shift+G)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'G') {
        e.preventDefault()
        setIsGraphViewOpen(true)
      }

      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'b') {
        e.preventDefault()
        setLeftSidebarCollapsed(prev => !prev)
      }
      
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'B') {
        e.preventDefault()
        setRightSidebarCollapsed(prev => !prev)
      }
      
      if (e.key === 'Escape' && focusMode) {
        handleFocusModeChange(false)
      }

      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'n') {
        e.preventDefault()
        handleCreateNote()
      }

      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'd') {
        e.preventDefault()
        handleDailyNote()
      }

      // Keyboard shortcuts panel (⌘? or ⌘/)
      if ((e.metaKey || e.ctrlKey) && (e.key === '?' || e.key === '/')) {
        e.preventDefault()
        setIsKeyboardShortcutsOpen(true)
      }

      // Search panel (⌘F) - note: Cmd+Shift+F is focus mode, Cmd+F is search
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'f') {
        e.preventDefault()
        setIsSearchPanelOpen(true)
      }

      // Sidebar mode cycle (⌘0) - cycles through icon/compact/card
      // Note: ⌘H is macOS system "Hide Window", so we use ⌘0 instead
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === '0') {
        e.preventDefault()
        cycleSidebarMode()
      }

      // Quick Capture (⌘⇧C)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        setIsQuickCaptureOpen(true)
      }

      // New Project (⌘⇧P)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        setIsCreateProjectModalOpen(true)
      }

      // Settings (⌘,) - standard preferences shortcut
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault()
        setIsSettingsOpen(true)
      }

      // Tab switching (⌘1-9) - switch to tab by index
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && /^[1-9]$/.test(e.key)) {
        e.preventDefault()
        const tabIndex = parseInt(e.key) - 1
        if (tabIndex < openTabs.length) {
          setActiveTab(openTabs[tabIndex].id)
        }
      }

      // Close current tab (⌘W) - closes active non-pinned tab
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'w') {
        e.preventDefault()
        // Find the active tab
        const activeTab = openTabs.find(t => t.id === activeTabId)
        // Only close if it's not pinned
        if (activeTab && !activeTab.isPinned) {
          closeTab(activeTabId!)
        }
      }

      // Reopen last closed tab (⌘⇧T)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault()
        reopenLastClosedTab()
        return
      }

      // Right sidebar tab navigation (⌘] / ⌘[)
      // Use visible tabs only (respect hidden tabs from settings)
      const visibleTabs = sidebarTabSettings.tabOrder.filter(
        (t: SidebarTabId) => !sidebarTabSettings.hiddenTabs.includes(t)
      )
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === ']') {
        e.preventDefault()
        const currentIndex = visibleTabs.indexOf(rightActiveTab)
        const nextIndex = (currentIndex + 1) % visibleTabs.length
        setRightActiveTab(visibleTabs[nextIndex])
        // Also ensure right sidebar is visible
        if (rightSidebarCollapsed) {
          setRightSidebarCollapsed(false)
        }
      }
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === '[') {
        e.preventDefault()
        const currentIndex = visibleTabs.indexOf(rightActiveTab)
        const prevIndex = (currentIndex - 1 + visibleTabs.length) % visibleTabs.length
        setRightActiveTab(visibleTabs[prevIndex])
        // Also ensure right sidebar is visible
        if (rightSidebarCollapsed) {
          setRightSidebarCollapsed(false)
        }
      }

      // Terminal tab shortcut (⌘`) - toggle or switch to Terminal
      if ((e.metaKey || e.ctrlKey) && e.key === '`') {
        e.preventDefault()
        // If already on Terminal and sidebar is open, close it
        if (rightActiveTab === 'terminal' && !rightSidebarCollapsed) {
          setRightSidebarCollapsed(true)
        } else {
          // Switch to Terminal and ensure sidebar is visible
          setRightActiveTab('terminal')
          if (rightSidebarCollapsed) {
            setRightSidebarCollapsed(false)
          }
        }
      }

      // Right sidebar toggle (⌘⇧]) - collapse/expand right sidebar
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === ']') {
        e.preventDefault()
        setRightSidebarCollapsed(!rightSidebarCollapsed)
      }

      // Left sidebar toggle (⌘⇧[) - collapse/expand left sidebar
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '[') {
        e.preventDefault()
        toggleSidebarCollapsed()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusMode, handleFocusModeChange, handleCreateNote, handleDailyNote, selectedNote, cycleSidebarMode, toggleSidebarCollapsed, openTabs, activeTabId, setActiveTab, closeTab, reopenLastClosedTab, rightActiveTab, setRightActiveTab, rightSidebarCollapsed, setRightSidebarCollapsed, sidebarTabSettings])

  // Track selected note for smart startup (session context)
  useEffect(() => {
    if (selectedNoteId) {
      setLastActiveNote(selectedNoteId)
      updateSessionTimestamp()
    }
  }, [selectedNoteId, setLastActiveNote, updateSessionTimestamp])

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

  // Handle native menu events from Tauri (skip in browser mode)
  useEffect(() => {
    if (!isTauri()) return // No native menu in browser mode

    let unlisten: (() => void) | null = null

    // Dynamic import to avoid errors in browser mode
    import('@tauri-apps/api/event').then(({ listen }) => {
      listen<string>('menu-event', (event) => {
        const menuId = event.payload

        switch (menuId) {
          // File menu
          case 'new_note':
            handleCreateNote()
            break
          case 'new_project':
            setIsCreateProjectModalOpen(true)
            break
          case 'daily_note':
            handleDailyNote()
            break
          case 'quick_capture':
            setIsQuickCaptureOpen(true)
            break
          case 'search':
            setIsSearchPanelOpen(true)
            break
          case 'export':
            setIsExportDialogOpen(true)
            break

          // View menu
          case 'mission_control':
            cycleSidebarMode()
            break
          case 'focus_mode':
            handleFocusModeChange(!focusMode)
            break
          case 'source_mode':
            setEditorMode('source')
            updatePreferences({ editorMode: 'source' })
            break
          case 'live_preview':
            setEditorMode('live-preview')
            updatePreferences({ editorMode: 'live-preview' })
            break
          case 'reading_mode':
            setEditorMode('reading')
            updatePreferences({ editorMode: 'reading' })
            break
          case 'toggle_sidebar':
            cycleSidebarMode()
            break
          case 'knowledge_graph':
            setIsGraphViewOpen(true)
            break

          // Scribe menu
          case 'preferences':
            setIsSettingsOpen(true)
            break
          case 'shortcuts':
            setIsKeyboardShortcutsOpen(true)
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
    handleCreateNote,
    handleDailyNote,
    handleFocusModeChange,
    focusMode,
    cycleSidebarMode,
  ])

  // Right sidebar resize handler (left sidebar handled by MissionSidebar)
  useEffect(() => {
    if (!isResizingRight) return

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.min(Math.max(window.innerWidth - e.clientX, 250), 600)
      setRightSidebarWidth(newWidth)
      localStorage.setItem('rightSidebarWidth', newWidth.toString())
    }

    const handleMouseUp = () => {
      setIsResizingRight(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizingRight])

  // Persist right sidebar collapsed state
  useEffect(() => {
    localStorage.setItem('rightSidebarCollapsed', rightSidebarCollapsed.toString())
  }, [rightSidebarCollapsed])

  // Listen for sidebar preference changes (from Settings modal)
  useEffect(() => {
    const handlePrefsChanged = () => {
      const prefs = loadPreferences()
      setSidebarTabSettings({
        tabSize: prefs.sidebarTabSize,
        tabOrder: prefs.sidebarTabOrder,
        hiddenTabs: prefs.sidebarHiddenTabs
      })
      // If the active tab is now hidden, switch to the first visible tab
      if (prefs.sidebarHiddenTabs.includes(rightActiveTab)) {
        const firstVisible = prefs.sidebarTabOrder.find(
          (t: SidebarTabId) => !prefs.sidebarHiddenTabs.includes(t)
        )
        if (firstVisible) setRightActiveTab(firstVisible)
      }
    }
    window.addEventListener('preferences-changed', handlePrefsChanged)
    return () => window.removeEventListener('preferences-changed', handlePrefsChanged)
  }, [rightActiveTab])

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
      status: { key: 'status', value: 'draft', type: 'list' },
      type: { key: 'type', value: 'note', type: 'list' },
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
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
          {selectedNote ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="p-6">
                <h2 className="text-3xl font-bold">{selectedNote.title}</h2>
              </div>
              <div className="flex-1 overflow-hidden relative">
                <HybridEditor
                  key={selectedNote.id}
                  content={selectedNote.content}
                  onChange={handleContentChange}
                  onWikiLinkClick={handleLinkClick}
                  onTagClick={handleTagClickInEditor}
                  onSearchNotes={handleSearchNotesForAutocomplete}
                  onSearchTags={handleSearchTagsForAutocomplete}
                  placeholder="Start writing..."
                  editorMode={editorMode}
                  onEditorModeChange={(mode) => {
                    setEditorMode(mode)
                    updatePreferences({ editorMode: mode })
                  }}
                  focusMode={true}
                  wordGoal={selectedNote.properties?.word_goal ? Number(selectedNote.properties.word_goal.value) : preferences.defaultWordGoal}
                  sessionStartWords={sessionStartWords[selectedNote.id] || wordCount}
                  streak={streakInfo.streak}
                  sessionStartTime={sessionStartTime || undefined}
                  onToggleTerminal={() => {
                    // Toggle Terminal: if on Terminal and visible, hide; otherwise show Terminal
                    if (rightActiveTab === 'terminal' && !rightSidebarCollapsed) {
                      setRightSidebarCollapsed(true)
                    } else {
                      setRightActiveTab('terminal')
                      if (rightSidebarCollapsed) {
                        setRightSidebarCollapsed(false)
                      }
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            <EmptyState
              onCreateNote={handleCreateNote}
              onOpenDaily={handleDailyNote}
              onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            />
          )}
        </div>

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
          // Select the new note (already added to state by createNote)
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
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main editor area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor header for visual alignment with sidebar */}
          <div className="editor-header">
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

            {/* Focus timer with controls */}
            <div className="focus-timer">
              <button
                className="timer-btn"
                onClick={toggleTimerPause}
                title={timerPaused ? "Resume timer" : "Pause timer"}
              >
                {timerPaused ? '▶' : '⏸'}
              </button>
              <span className={`timer-value ${timerPaused ? 'paused' : ''}`}>
                {formatSessionTime(sessionDuration)}
              </span>
              <button
                className="timer-btn reset"
                onClick={resetTimer}
                title="Reset timer"
              >
                ↺
              </button>
            </div>
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
            <div className="flex-1 flex flex-col min-h-0">
              <div className="px-6 py-4 border-b border-white/5">
                {editingTitle ? (
                  <input
                    autoFocus
                    className="text-2xl font-bold bg-transparent outline-none w-full border-b border-nexus-accent"
                    defaultValue={selectedNote.title}
                    onBlur={(e) => handleTitleChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTitleChange(e.currentTarget.value)}
                  />
                ) : (
                  <h2 onClick={() => setEditingTitle(true)} className="text-2xl font-bold cursor-pointer">{selectedNote.title}</h2>
                )}
              </div>
              <div className="flex-1 overflow-hidden relative">
                <HybridEditor
                  key={selectedNote.id}
                  content={selectedNote.content}
                  onChange={handleContentChange}
                  onWikiLinkClick={handleLinkClick}
                  onTagClick={handleTagClickInEditor}
                  onSearchNotes={handleSearchNotesForAutocomplete}
                  onSearchTags={handleSearchTagsForAutocomplete}
                  placeholder="Start writing... (Cmd+E to preview)"
                  editorMode={editorMode}
                  onEditorModeChange={(mode) => {
                    setEditorMode(mode)
                    updatePreferences({ editorMode: mode })
                  }}
                  focusMode={false}
                  wordGoal={selectedNote.properties?.word_goal ? Number(selectedNote.properties.word_goal.value) : preferences.defaultWordGoal}
                  sessionStartWords={sessionStartWords[selectedNote.id] || wordCount}
                  streak={streakInfo.streak}
                  sessionStartTime={sessionStartTime || undefined}
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
                />
              </div>
            </div>
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
              <div
                className={`resize-handle ${isResizingRight ? 'resizing' : ''}`}
                onMouseDown={() => setIsResizingRight(true)}
                onDoubleClick={() => setRightSidebarCollapsed(true)}
                title="Drag to resize, double-click to collapse"
              />
            )}
            <div
              className={`bg-nexus-bg-secondary flex flex-col ${rightSidebarCollapsed ? 'right-sidebar-collapsed' : ''}`}
              style={{ width: rightSidebarCollapsed ? '48px' : `${rightSidebarWidth}px` }}
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
                    data-sidebar-tab-size={sidebarTabSettings.tabSize}
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
                            setEditorMode('reading')
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
                        sessionStartTime={sessionStartTime || undefined}
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
            await createProject(
              projectData.name,
              projectData.type,
              projectData.description,
              projectData.color
            )
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
