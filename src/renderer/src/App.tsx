import { useEffect, useState, useMemo } from 'react'
import { useNotesStore } from './store/useNotesStore'
import { useProjectStore } from './store/useProjectStore'
import { useAppViewStore } from './store/useAppViewStore'
import { useTabStore } from './store/useTabStore'
import { HybridEditor } from './components/HybridEditor'
import { MissionControl } from './components/MissionControl'
import { TabBar } from './components/tabs'
import { BacklinksPanel } from './components/BacklinksPanel'
import { TagFilter } from './components/TagFilter'
import { PropertiesPanel } from './components/PropertiesPanel'
import { TagsPanel } from './components/TagsPanel'
import { SettingsModal } from './components/SettingsModal'
import { EmptyState } from './components/EmptyState'
import { ExportDialog } from './components/ExportDialog'
import { GraphView } from './components/GraphView'
import { CreateProjectModal } from './components/CreateProjectModal'
import { MissionSidebar } from './components/sidebar'
import { QuickCaptureOverlay } from './components/QuickCaptureOverlay'
import { Note, Tag, Property } from './types'
import { api } from './lib/api'
import { CommandPalette } from './components/CommandPalette'
import { open as openDialog, message } from '@tauri-apps/plugin-dialog'
import { listen } from '@tauri-apps/api/event'
import { KeyboardShortcuts } from './components/KeyboardShortcuts'
import { CloseConfirmationDialog } from './components/CloseConfirmationDialog'
import { DeleteConfirmationDialog } from './components/DeleteConfirmationDialog'
import { ToastContainer } from './components/Toast'
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
  const { notes, loadNotes, createNote, updateNote, deleteNote, selectedNoteId, selectNote, requestDeleteNote, cleanupOldTrash } = useNotesStore()
  const {
    projects,
    currentProjectId,
    loadProjects,
    setCurrentProject,
    createProject
  } = useProjectStore()

  // Sidebar mode from app view store (replaces dashboardCollapsed toggle)
  const {
    sidebarMode,
    cycleSidebarMode,
    setLeftSidebarTab,
    setLastActiveNote,
    updateSessionTimestamp
  } = useAppViewStore()

  // Tab store for pinned home + editor tabs
  const {
    tabs,
    activeTabId,
    openTab,
    setActiveTab,
    updateTabTitle,
    reopenLastClosed,
    goToHomeTab,
    requestCloseTab,
    pendingCloseTabId,
  } = useTabStore()

  // Get active tab and determine what content to show
  const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId), [tabs, activeTabId])
  const isHomeTabActive = activeTab?.type === 'home'
  const activeEditorNoteId = activeTab?.type === 'editor' ? activeTab.noteId : null
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
  const [, setRightSidebarCollapsed] = useState(false)  // Keep setter for potential future use
  
  // Right sidebar width state with localStorage persistence
  const [rightSidebarWidth, setRightSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('rightSidebarWidth')
    return saved ? parseInt(saved) : 320
  })
  const [isResizingRight, setIsResizingRight] = useState(false)
  
  // Tab state (leftActiveTab removed - notes list is in DashboardShell now)
  const [rightActiveTab, setRightActiveTab] = useState<'properties' | 'backlinks' | 'tags'>('properties')

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
    
    const activeTheme = allThemes[activeThemeId] || allThemes['oxford-dark']
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
      setTheme('oxford-dark')
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


  useEffect(() => {
    loadNotes(currentFolder)
  }, [loadNotes, currentFolder])

  // Load projects on startup
  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  // Auto-cleanup old trash on startup (notes deleted > 30 days ago)
  useEffect(() => {
    // Run cleanup after notes are loaded
    const timeoutId = setTimeout(() => {
      cleanupOldTrash(30)
    }, 2000) // Delay to ensure notes are loaded first

    return () => clearTimeout(timeoutId)
  }, [cleanupOldTrash])

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


  // Open a note in a new tab (or switch to existing tab)
  const handleOpenNoteInTab = (noteId: string) => {
    const note = notes.find(n => n.id === noteId)
    if (note) {
      openTab(noteId, note.title || 'Untitled')
      selectNote(noteId) // Also update legacy store for compatibility
    }
  }

  const handleCreateNote = async () => {
    // Default properties for new notes
    const defaultProperties: Record<string, Property> = {
      status: { key: 'status', value: 'draft', type: 'list' },
      type: { key: 'type', value: 'note', type: 'list' },
    }

    // Create note via API directly to get the note back
    const newNote = await api.createNote({
      title: `New Note`,
      content: '',  // Empty markdown - user starts fresh
      folder: currentFolder || 'inbox',
      properties: defaultProperties
    })

    // Open the new note in a tab
    openTab(newNote.id, newNote.title || 'Untitled')
    selectNote(newNote.id)
    loadNotes(currentFolder)
  }

  // Selected note is based on active tab (for editor tabs) or legacy selectedNoteId
  const selectedNote = activeEditorNoteId
    ? notes.find(n => n.id === activeEditorNoteId)
    : notes.find(n => n.id === selectedNoteId)

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
      // Update tab title if this note has an open tab
      updateTabTitle(`editor-${selectedNote.id}`, title.trim())
      setEditingTitle(false)
    }
  }

  // Wiki link handlers - opens note in new tab
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
        openTab(targetNote.id, targetNote.title || 'Untitled')
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
        openTab(newNote.id, newNote.title || 'Untitled')
        selectNote(newNote.id)
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

      // Open daily note in a tab
      openTab(dailyNote.id, dailyNote.title || dateStr)
      selectNote(dailyNote.id)
      loadNotes(currentFolder)
    } catch (error) {
      console.error('Failed to open daily note:', error)
    }
  }

  const handleObsidianSync = async () => {
    try {
      const selected = await openDialog({
        directory: true,
        multiple: false,
        title: 'Select Obsidian Vault Folder'
      })

      if (selected && typeof selected === 'string') {
        const result = await api.exportToObsidian(selected)
        await message(result, { title: 'Sync Complete', kind: 'info' })
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
      await message(response, { title: 'Claude Response', kind: 'info' })
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
      await message(response, { title: 'Gemini Response', kind: 'info' })
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

      // Tab navigation shortcuts
      // ⌘1 = Go to Home tab
      if ((e.metaKey || e.ctrlKey) && e.key === '1' && !e.shiftKey && !e.altKey) {
        e.preventDefault()
        goToHomeTab()
      }

      // ⌘2-9 = Go to tab 2-9
      if ((e.metaKey || e.ctrlKey) && /^[2-9]$/.test(e.key) && !e.shiftKey && !e.altKey) {
        e.preventDefault()
        const tabIndex = parseInt(e.key, 10) - 1 // 0-indexed
        if (tabs[tabIndex]) {
          setActiveTab(tabs[tabIndex].id)
        }
      }

      // ⌘W = Close current tab (if editor tab) - uses requestCloseTab for dirty check
      if ((e.metaKey || e.ctrlKey) && e.key === 'w' && !e.shiftKey) {
        e.preventDefault()
        if (activeTab && activeTab.type === 'editor') {
          requestCloseTab(activeTab.id)
        }
      }

      // ⌘⇧T = Reopen last closed tab
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault()
        reopenLastClosed()
      }

      // ⌃Tab = Next tab
      if (e.ctrlKey && e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault()
        const currentIndex = tabs.findIndex(t => t.id === activeTabId)
        const nextIndex = (currentIndex + 1) % tabs.length
        setActiveTab(tabs[nextIndex].id)
      }

      // ⌃⇧Tab = Previous tab
      if (e.ctrlKey && e.shiftKey && e.key === 'Tab') {
        e.preventDefault()
        const currentIndex = tabs.findIndex(t => t.id === activeTabId)
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length
        setActiveTab(tabs[prevIndex].id)
      }

      // ⌥1-5 = Switch sidebar tabs (Projects, Notes, Inbox, Graph, Trash)
      if (e.altKey && !e.metaKey && !e.ctrlKey && !e.shiftKey && /^[1-5]$/.test(e.key)) {
        e.preventDefault()
        const tabMap: Record<string, 'projects' | 'notes' | 'inbox' | 'graph' | 'trash'> = {
          '1': 'projects',
          '2': 'notes',
          '3': 'inbox',
          '4': 'graph',
          '5': 'trash'
        }
        setLeftSidebarTab(tabMap[e.key])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusMode, handleFocusModeChange, handleCreateNote, handleDailyNote, selectedNote, cycleSidebarMode, tabs, activeTabId, activeTab, goToHomeTab, setActiveTab, requestCloseTab, reopenLastClosed, setLeftSidebarTab])

  // Track selected note for smart startup (session context)
  useEffect(() => {
    if (selectedNoteId) {
      setLastActiveNote(selectedNoteId)
      updateSessionTimestamp()
    }
  }, [selectedNoteId, setLastActiveNote, updateSessionTimestamp])

  // Handle native menu events from Tauri
  useEffect(() => {
    const unlisten = listen<string>('menu-event', (event) => {
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
    })

    return () => {
      unlisten.then(fn => fn())
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
          onSelectNote={(noteId) => selectNote(noteId)}
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

  // Normal mode: Tab bar + sidebar + content
  return (
    <div className="w-full h-full bg-nexus-bg-primary text-nexus-text-primary flex overflow-hidden" style={{ height: '100vh' }}>
      {/* Custom CSS injection from user preferences */}
      {preferences.customCSSEnabled && preferences.customCSS && (
        <style id="custom-user-css">{preferences.customCSS}</style>
      )}

      {/* Main layout: sidebar + content with tab bar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Three-state collapsible sidebar (icon/compact/card) */}
        <MissionSidebar
          projects={projects}
          notes={notes}
          currentProjectId={currentProjectId}
          onSelectProject={setCurrentProject}
          onSelectNote={(noteId) => {
            setEditorMode('source')
            handleOpenNoteInTab(noteId)
          }}
          onCreateProject={() => setIsCreateProjectModalOpen(true)}
          onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
          onMarkInboxProcessed={(noteId) => {
            // Move note out of inbox by changing folder
            updateNote(noteId, { folder: 'notes' })
          }}
          onDeleteNote={(noteId) => requestDeleteNote(noteId)}
          onAssignNoteToProject={async (noteId, projectId) => {
            try {
              await api.setNoteProject(noteId, projectId)
              // Update local note state with new project_id
              const note = notes.find(n => n.id === noteId)
              if (note) {
                const updatedProperties = { ...note.properties }
                if (projectId) {
                  updatedProperties.project_id = { key: 'project_id', value: projectId, type: 'text' }
                } else {
                  delete updatedProperties.project_id
                }
                updateNote(noteId, { properties: updatedProperties })
              }
            } catch (error) {
              console.error('Failed to assign note to project:', error)
            }
          }}
          onMoveNoteToInbox={(noteId) => {
            updateNote(noteId, { folder: 'inbox' })
          }}
          onOpenFullGraph={() => setIsGraphViewOpen(true)}
        />

        {/* Main content area with tab bar - switches between Home and Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar - pinned Home tab + editor tabs */}
          <TabBar onCreateNote={handleCreateNote} />

          {/* Content below tab bar */}
          <div className="flex-1 flex overflow-hidden">
          {/* Home tab content: Mission Control */}
          {isHomeTabActive && (
            <MissionControl
              projects={projects}
              notes={notes}
              currentProjectId={currentProjectId}
              onSelectProject={setCurrentProject}
              onSelectNote={(noteId) => {
                setEditorMode('source')
                handleOpenNoteInTab(noteId)
              }}
              onCreateNote={handleCreateNote}
              onDailyNote={handleDailyNote}
              onQuickCapture={() => setIsQuickCaptureOpen(true)}
              onSettings={() => setIsSettingsOpen(true)}
              onCreateProject={() => setIsCreateProjectModalOpen(true)}
              onMarkInboxProcessed={(noteId) => {
                // Move note out of inbox by changing folder
                updateNote(noteId, { folder: 'notes' })
              }}
              onDeleteNote={(noteId) => requestDeleteNote(noteId)}
            />
          )}

          {/* Editor tab content */}
          {!isHomeTabActive && (
            <>
              {/* Main editor area */}
              <div className="flex-1 flex flex-col min-w-0">
                <TagFilter selectedTags={selectedTags} onRemoveTag={handleTagClick} onClearAll={handleClearTagFilters} />

                {selectedNote ? (
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

              {/* Right sidebar (properties/backlinks/tags) - only in compact/card mode with note selected */}
              {sidebarMode !== 'icon' && selectedNote && (
                <>
                  <div className={`resize-handle ${isResizingRight ? 'resizing' : ''}`} onMouseDown={() => setIsResizingRight(true)} />
                  <div
                    className="bg-nexus-bg-secondary flex flex-col"
                    style={{ width: `${rightSidebarWidth}px` }}
                  >
                    <div className="sidebar-tabs pt-10">
                      <button className={`sidebar-tab ${rightActiveTab === 'properties' ? 'active' : ''}`} onClick={() => setRightActiveTab('properties')}>Properties</button>
                      <button className={`sidebar-tab ${rightActiveTab === 'backlinks' ? 'active' : ''}`} onClick={() => setRightActiveTab('backlinks')}>Backlinks</button>
                      <button className={`sidebar-tab ${rightActiveTab === 'tags' ? 'active' : ''}`} onClick={() => setRightActiveTab('tags')}>Tags</button>
                      <div className="flex-1" />
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
                            setEditorMode('reading')
                            handleOpenNoteInTab(noteId)
                          }}
                          refreshKey={backlinksRefreshKey}
                        />
                      ) : (
                        <TagsPanel
                          noteId={selectedNote.id}
                          selectedTagIds={selectedTagIds}
                          onTagClick={handleTagClick}
                        />
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
          </div>
        </div>
      </div>

      {/* Command Palette */}
      <CommandPalette
        open={isCommandPaletteOpen}
        setOpen={setIsCommandPaletteOpen}
        notes={notes}
        onSelectNote={handleOpenNoteInTab}
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
        onSelectNote={handleOpenNoteInTab}
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
          setEditorMode('source')
          handleOpenNoteInTab(noteId)
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

      {/* Quick Capture Overlay (⌘⇧C) */}
      <QuickCaptureOverlay
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
        onCapture={handleQuickCapture}
      />

      {/* Close Confirmation Dialog (shown when closing dirty tabs) */}
      <CloseConfirmationDialog
        onSave={async () => {
          // Find the note being closed and save it
          if (pendingCloseTabId) {
            const tab = tabs.find(t => t.id === pendingCloseTabId)
            if (tab?.noteId) {
              const note = notes.find(n => n.id === tab.noteId)
              if (note) {
                // The note content is already in state, just trigger a save
                // This ensures the latest content is persisted
                await updateNote(note.id, { content: note.content })
              }
            }
          }
        }}
      />

      {/* Delete Confirmation Dialog (ADHD: Escape hatches - prevent accidental data loss) */}
      <DeleteConfirmationDialog />

      {/* Toast notifications (ADHD: Escape hatches - undo actions) */}
      <ToastContainer />
    </div>
  )
}

export default App
