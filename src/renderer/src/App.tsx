import { useEffect, useState } from 'react'
import { useNotesStore } from './store/useNotesStore'
import { useProjectStore } from './store/useProjectStore'
import { useAppViewStore } from './store/useAppViewStore'
import { HybridEditor } from './components/HybridEditor'
import { SearchBar } from './components/SearchBar'
import { BacklinksPanel } from './components/BacklinksPanel'
import { TagFilter } from './components/TagFilter'
import { PropertiesPanel } from './components/PropertiesPanel'
import { TagsPanel } from './components/TagsPanel'
import { Ribbon } from './components/Ribbon'
import { SettingsModal } from './components/SettingsModal'
import { EmptyState } from './components/EmptyState'
import { ExportDialog } from './components/ExportDialog'
import { GraphView } from './components/GraphView'
import { ProjectSwitcher } from './components/ProjectSwitcher'
import { CreateProjectModal } from './components/CreateProjectModal'
import { MissionControl } from './components/MissionControl'
import { QuickCaptureOverlay } from './components/QuickCaptureOverlay'
import { DragRegion } from './components/DragRegion'
import { Note, Tag, Property } from './types'
import { api } from './lib/api'
import { CommandPalette } from './components/CommandPalette'
import { open as openDialog, message } from '@tauri-apps/plugin-dialog'
import { Plus } from 'lucide-react'
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

  // View mode state (dashboard vs editor)
  const { viewMode, toggleViewMode, setLastActiveNote, updateSessionTimestamp } = useAppViewStore()
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
  
  // Sidebar collapse state
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false)
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false)
  
  // Sidebar width state with localStorage persistence
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('leftSidebarWidth')
    return saved ? parseInt(saved) : 256
  })
  const [rightSidebarWidth, setRightSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('rightSidebarWidth')
    return saved ? parseInt(saved) : 320
  })
  const [isResizingLeft, setIsResizingLeft] = useState(false)
  const [isResizingRight, setIsResizingRight] = useState(false)
  
  // Tab state
  const [leftActiveTab, setLeftActiveTab] = useState<'files' | 'search'>('files')
  const [rightActiveTab, setRightActiveTab] = useState<'properties' | 'backlinks' | 'tags'>('properties')

  // Left sidebar preferences (persisted in localStorage)
  const [leftSortBy, setLeftSortBy] = useState<'name' | 'modified' | 'created'>(() => {
    const saved = localStorage.getItem('leftSortBy')
    return (saved as 'name' | 'modified' | 'created') || 'modified'
  })
  const [leftViewMode, setLeftViewMode] = useState<'default' | 'compact'>(() => {
    const saved = localStorage.getItem('leftViewMode')
    return (saved as 'default' | 'compact') || 'default'
  })

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

  // Search state
  const [, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Note[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [, setSearchLoading] = useState(false)

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
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [isFiltering, setIsFiltering] = useState(false)
  const [projectNotes, setProjectNotes] = useState<Note[]>([])

  // Session tracking - time when first keystroke occurred
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)
  
  // Backlinks refresh key - increment to force BacklinksPanel refresh
  const [backlinksRefreshKey, setBacklinksRefreshKey] = useState(0)
  
  // Editor mode - track to preserve mode when navigating via wiki-links
  const [editorMode, setEditorMode] = useState<'write' | 'preview'>('write')
  
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

  // Load project-specific notes when project changes
  useEffect(() => {
    const loadProjectNotes = async () => {
      if (currentProjectId) {
        try {
          const notes = await api.getProjectNotes(currentProjectId)
          setProjectNotes(notes)
        } catch (error) {
          console.error('Failed to load project notes:', error)
          setProjectNotes([])
        }
      } else {
        setProjectNotes([])
      }
    }
    loadProjectNotes()
  }, [currentProjectId])

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
      properties: defaultProperties
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

  // Search handlers
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    setIsSearching(true)
    setSearchLoading(true)

    try {
      const results = await api.searchNotes(query)
      setSearchResults(results)
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setIsSearching(false)
    setSearchLoading(false)
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
        setEditorMode('preview')
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
        setEditorMode('write')
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

      // Mission Control toggle (⌘0) - zero for "home"/dashboard
      // Note: ⌘H is macOS system "Hide Window", so we use ⌘0 instead
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === '0') {
        e.preventDefault()
        toggleViewMode()
      }

      // Quick Capture (⌘⇧C)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        setIsQuickCaptureOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusMode, handleFocusModeChange, handleCreateNote, handleDailyNote, selectedNote, toggleViewMode])

  // Track selected note for smart startup (session context)
  useEffect(() => {
    if (selectedNoteId) {
      setLastActiveNote(selectedNoteId)
      updateSessionTimestamp()
    }
  }, [selectedNoteId, setLastActiveNote, updateSessionTimestamp])

  // Sidebar resize handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingLeft) {
        const newWidth = Math.min(Math.max(e.clientX - 48, 200), 500)
        setLeftSidebarWidth(newWidth)
        localStorage.setItem('leftSidebarWidth', newWidth.toString())
      }
      if (isResizingRight) {
        const newWidth = Math.min(Math.max(window.innerWidth - e.clientX, 250), 600)
        setRightSidebarWidth(newWidth)
        localStorage.setItem('rightSidebarWidth', newWidth.toString())
      }
    }

    const handleMouseUp = () => {
      setIsResizingLeft(false)
      setIsResizingRight(false)
    }

    if (isResizingLeft || isResizingRight) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isResizingLeft, isResizingRight])

  const handleTagClick = async (tagId: string) => {
    const newSelectedIds = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter(id => id !== tagId)
      : [...selectedTagIds, tagId]

    setSelectedTagIds(newSelectedIds)

    if (newSelectedIds.length === 0) {
      setIsFiltering(false)
      setFilteredNotes([])
      setSelectedTags([])
    } else {
      setIsFiltering(true)
      try {
        const filtered = await api.filterNotesByTags(newSelectedIds, true)
        setFilteredNotes(filtered)
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
    setIsFiltering(false)
    setFilteredNotes([])
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

  // Handlers for left sidebar preferences
  const handleLeftSortChange = (sortBy: 'name' | 'modified' | 'created') => {
    setLeftSortBy(sortBy)
    localStorage.setItem('leftSortBy', sortBy)
  }

  const handleLeftViewChange = (viewMode: 'default' | 'compact') => {
    setLeftViewMode(viewMode)
    localStorage.setItem('leftViewMode', viewMode)
  }

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

  // Sort and filter notes based on preferences
  const getSortedNotes = (notesToSort: Note[]) => {
    return [...notesToSort].sort((a, b) => {
      switch (leftSortBy) {
        case 'name':
          return (a.title || '').localeCompare(b.title || '')
        case 'created':
          return b.created_at - a.created_at
        case 'modified':
        default:
          return b.updated_at - a.updated_at
      }
    })
  }

  // Determine which notes to display based on current filters
  const getBaseNotes = () => {
    if (isSearching) return searchResults
    if (isFiltering) return filteredNotes
    if (currentProjectId) return projectNotes
    return notes
  }
  const displayNotes = getSortedNotes(getBaseNotes())

  // Build left sidebar menu sections
  const leftMenuSections: MenuSection[] = [
    {
      title: 'Sort by',
      items: [
        { id: 'sort-name', label: 'Name', action: () => handleLeftSortChange('name'), checked: leftSortBy === 'name' },
        { id: 'sort-modified', label: 'Modified', action: () => handleLeftSortChange('modified'), checked: leftSortBy === 'modified' },
        { id: 'sort-created', label: 'Created', action: () => handleLeftSortChange('created'), checked: leftSortBy === 'created' },
      ]
    },
    {
      title: 'View',
      items: [
        { id: 'view-default', label: 'Default', action: () => handleLeftViewChange('default'), checked: leftViewMode === 'default' },
        { id: 'view-compact', label: 'Compact', action: () => handleLeftViewChange('compact'), checked: leftViewMode === 'compact' },
      ]
    }
  ]

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

  return (
    <div className="w-full h-full bg-nexus-bg-primary text-nexus-text-primary flex overflow-hidden" style={{ height: '100vh' }}>
      {/* Titlebar drag region for window moving - uses Tauri API */}
      <DragRegion className="titlebar-drag-region" />

      {viewMode === 'editor' && !focusMode && (
        <Ribbon
          onToggleLeft={() => setLeftSidebarCollapsed(prev => !prev)}
          onToggleRight={() => setRightSidebarCollapsed(prev => !prev)}
          onSearch={() => setIsCommandPaletteOpen(true)}
          onSettings={() => setIsSettingsOpen(true)}
          leftCollapsed={leftSidebarCollapsed}
          rightCollapsed={rightSidebarCollapsed}
        />
      )}

      <CommandPalette
        open={isCommandPaletteOpen}
        setOpen={setIsCommandPaletteOpen}
        notes={notes}
        onSelectNote={(noteId) => {
          selectNote(noteId)
          // Switch to editor view when selecting a note from command palette
          if (viewMode === 'dashboard') {
            toggleViewMode()
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

      {/* Dashboard Mode: Mission Control */}
      {viewMode === 'dashboard' && (
        <MissionControl
          projects={projects}
          currentProjectId={currentProjectId}
          onSelectProject={(projectId) => {
            setCurrentProject(projectId)
            toggleViewMode()
          }}
          onCreateNote={handleCreateNote}
          onDailyNote={handleDailyNote}
          onQuickCapture={() => setIsQuickCaptureOpen(true)}
          onSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* Editor Mode: Full editor layout */}
      {viewMode === 'editor' && !focusMode && (
        <div
          className={`bg-nexus-bg-secondary flex flex-col ${leftSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}
          style={{ width: leftSidebarCollapsed ? 0 : `${leftSidebarWidth}px` }}
        >
          <div className="sidebar-tabs">
            <button className={`sidebar-tab ${leftActiveTab === 'files' ? 'active' : ''}`} onClick={() => setLeftActiveTab('files')}>Files</button>
            <button className={`sidebar-tab ${leftActiveTab === 'search' ? 'active' : ''}`} onClick={() => setLeftActiveTab('search')}>Search</button>
            <div className="flex-1" />
            <PanelMenu sections={leftMenuSections} />
          </div>

          <div className="tab-content">
            {leftActiveTab === 'files' ? (
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-white/5">
                  {/* Project Switcher */}
                  <div className="mb-3">
                    <ProjectSwitcher
                      projects={projects.map(p => ({
                        id: p.id,
                        name: p.name,
                        type: p.type,
                        description: p.description,
                        color: p.color || '#38bdf8',
                        createdAt: p.created_at,
                        updatedAt: p.updated_at,
                      }))}
                      currentProjectId={currentProjectId}
                      onSelectProject={setCurrentProject}
                      onCreateProject={() => setIsCreateProjectModalOpen(true)}
                    />
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-display font-semibold">
                      {currentProjectId ? projects.find(p => p.id === currentProjectId)?.name || 'Notes' : 'Library'}
                    </h1>
                    <button onClick={handleCreateNote} className="p-1.5 hover:bg-white/5 rounded-md"><Plus className="w-5 h-5" /></button>
                  </div>
                  <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />
                </div>
                <div className="flex-1 overflow-y-auto">
                  {displayNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => {
                        setEditorMode('write')  // Reset to write mode when clicking sidebar
                        selectNote(note.id)
                      }}
                      className={`${leftViewMode === 'compact' ? 'px-4 py-2' : 'px-4 py-3'} border-b border-white/[0.03] cursor-pointer hover:bg-white/[0.02] ${selectedNoteId === note.id ? 'bg-nexus-accent/5 text-nexus-accent' : ''}`}
                    >
                      <div className={`font-medium truncate ${leftViewMode === 'compact' ? 'text-sm' : ''}`}>{note.title || 'Untitled'}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 text-gray-400">Search coming soon...</div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'editor' && !focusMode && !leftSidebarCollapsed && (
        <div className={`resize-handle ${isResizingLeft ? 'resizing' : ''}`} onMouseDown={() => setIsResizingLeft(true)} />
      )}

      {viewMode === 'editor' && (
      <div className={`flex-1 flex flex-col ${focusMode ? 'max-w-4xl mx-auto' : ''}`}>
        <TagFilter selectedTags={selectedTags} onRemoveTag={handleTagClick} onClearAll={handleClearTagFilters} />

        {selectedNote ? (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-6 border-b border-white/5">
              {editingTitle ? (
                <input
                  autoFocus
                  className="text-3xl font-bold bg-transparent outline-none w-full border-b border-nexus-accent"
                  defaultValue={selectedNote.title}
                  onBlur={(e) => handleTitleChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleChange(e.currentTarget.value)}
                />
              ) : (
                <h2 onClick={() => setEditingTitle(true)} className="text-3xl font-bold cursor-pointer">{selectedNote.title}</h2>
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
                initialMode={editorMode}
                focusMode={focusMode}
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
      )}

      {viewMode === 'editor' && !focusMode && !rightSidebarCollapsed && selectedNote && (
        <div className={`resize-handle ${isResizingRight ? 'resizing' : ''}`} onMouseDown={() => setIsResizingRight(true)} />
      )}

      {viewMode === 'editor' && !focusMode && selectedNote && (
        <div
          className={`bg-nexus-bg-secondary flex flex-col ${rightSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}
          style={{ width: rightSidebarCollapsed ? 0 : `${rightSidebarWidth}px` }}
        >
          <div className="sidebar-tabs">
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
                  // Stay in preview mode when clicking backlinks
                  setEditorMode('preview')
                  selectNote(noteId)
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
      )}

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
          setEditorMode('write')
          selectNote(noteId)
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
    </div>
  )
}

export default App
