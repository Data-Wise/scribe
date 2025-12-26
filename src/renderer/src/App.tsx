import { useEffect, useState } from 'react'
import { useNotesStore } from './store/useNotesStore'
import { HybridEditor } from './components/HybridEditor'
import { SearchBar } from './components/SearchBar'
import { BacklinksPanel } from './components/BacklinksPanel'
import { TagFilter } from './components/TagFilter'
import { PropertiesPanel } from './components/PropertiesPanel'
import { TagsPanel } from './components/TagsPanel'
import { Ribbon } from './components/Ribbon'
import { SettingsModal } from './components/SettingsModal'
import { Note, Tag, Property } from './types'
import { api } from './lib/api'
import { CommandPalette } from './components/CommandPalette'
import { open as openDialog, message } from '@tauri-apps/plugin-dialog'
import { Plus } from 'lucide-react'

function App() {
  const { notes, loadNotes, createNote, updateNote, selectedNoteId, selectNote } = useNotesStore()
  const [currentFolder] = useState<string | undefined>(undefined)
  const [editingTitle, setEditingTitle] = useState(false)

  // Focus mode state
  const [focusMode, setFocusMode] = useState(false)
  
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
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [isFiltering, setIsFiltering] = useState(false)
  
  // Backlinks refresh key - increment to force BacklinksPanel refresh
  const [backlinksRefreshKey, setBacklinksRefreshKey] = useState(0)
  
  // Editor mode - track to preserve mode when navigating via wiki-links
  const [editorMode, setEditorMode] = useState<'write' | 'preview'>('write')
  
  // Tags for current note (for PropertiesPanel display)
  const [currentNoteTags, setCurrentNoteTags] = useState<Tag[]>([])
  
  // Theme definitions - ADHD-friendly themes
  const THEMES = {
    // Dark themes
    'oxford-dark': { name: 'Oxford Dark', type: 'dark' as const, description: 'Cool academic blues' },
    'forest-night': { name: 'Forest Night', type: 'dark' as const, description: 'Calming deep greens' },
    'warm-cocoa': { name: 'Warm Cocoa', type: 'dark' as const, description: 'Cozy warm browns' },
    'midnight-purple': { name: 'Midnight Purple', type: 'dark' as const, description: 'Dreamy soft purples' },
    'deep-ocean': { name: 'Deep Ocean', type: 'dark' as const, description: 'Stable navy blues' },
    // Light themes
    'soft-paper': { name: 'Soft Paper', type: 'light' as const, description: 'Warm off-white' },
    'morning-fog': { name: 'Morning Fog', type: 'light' as const, description: 'Minimal cool grays' },
    'sage-garden': { name: 'Sage Garden', type: 'light' as const, description: 'Natural calm greens' },
    'lavender-mist': { name: 'Lavender Mist', type: 'light' as const, description: 'Soothing soft purples' },
    'sand-dune': { name: 'Sand Dune', type: 'light' as const, description: 'Grounding warm neutrals' },
  }
  
  type ThemeId = keyof typeof THEMES
  
  // Theme state with localStorage persistence
  const [theme, setTheme] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('scribe-theme')
    return (saved && saved in THEMES ? saved : 'oxford-dark') as ThemeId
  })
  
  // Apply theme to document root
  useEffect(() => {
    // Remove all theme classes
    document.documentElement.className = ''
    // Add the selected theme class
    document.documentElement.classList.add(theme)
    localStorage.setItem('scribe-theme', theme)
  }, [theme])


  useEffect(() => {
    loadNotes(currentFolder)
  }, [loadNotes, currentFolder])

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

  const handleContentChange = async (content: string) => {
    if (selectedNote) {
      updateNote(selectedNote.id, { content })
      
      // Update links when content changes (debounced effect would be better for performance)
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
    const today = new Date().toISOString().split('T')[0]
    try {
      const dailyNote = await api.getOrCreateDailyNote(today)
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
        setFocusMode(prev => !prev)
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
        setFocusMode(false)
      }

      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'n') {
        e.preventDefault()
        handleCreateNote()
      }

      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'd') {
        e.preventDefault()
        handleDailyNote()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusMode, handleCreateNote, handleDailyNote])

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

  const handleTagClickInEditor = async (tagName: string) => {
    const tag = await api.getTagByName(tagName)
    if (tag) {
      handleTagClick(tag.id)
    }
  }

  const displayNotes = isSearching ? searchResults : isFiltering ? filteredNotes : notes

  return (
    <div className="w-full h-full bg-nexus-bg-primary text-nexus-text-primary flex overflow-hidden" style={{ height: '100vh' }}>
      {!focusMode && (
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
        onSelectNote={selectNote}
        onCreateNote={handleCreateNote}
        onDailyNote={handleDailyNote}
        onToggleFocus={() => setFocusMode(prev => !prev)}
        onObsidianSync={handleObsidianSync}
        onRunClaude={handleRunClaude}
        onRunGemini={handleRunGemini}
      />

      {!focusMode && (
        <div 
          className={`bg-nexus-bg-secondary flex flex-col ${leftSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}
          style={{ width: leftSidebarCollapsed ? 0 : `${leftSidebarWidth}px` }}
        >
          <div className="sidebar-tabs">
            <button className={`sidebar-tab ${leftActiveTab === 'files' ? 'active' : ''}`} onClick={() => setLeftActiveTab('files')}>Files</button>
            <button className={`sidebar-tab ${leftActiveTab === 'search' ? 'active' : ''}`} onClick={() => setLeftActiveTab('search')}>Search</button>
          </div>

          <div className="tab-content">
            {leftActiveTab === 'files' ? (
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-display font-semibold">Library</h1>
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
                      className={`px-4 py-3 border-b border-white/[0.03] cursor-pointer hover:bg-white/[0.02] ${selectedNoteId === note.id ? 'bg-nexus-accent/5 text-nexus-accent' : ''}`}
                    >
                      <div className="font-medium truncate">{note.title || 'Untitled'}</div>
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

      {!focusMode && !leftSidebarCollapsed && (
        <div className={`resize-handle ${isResizingLeft ? 'resizing' : ''}`} onMouseDown={() => setIsResizingLeft(true)} />
      )}

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
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">Select a note to begin</div>
        )}
      </div>

      {!focusMode && !rightSidebarCollapsed && selectedNote && (
        <div className={`resize-handle ${isResizingRight ? 'resizing' : ''}`} onMouseDown={() => setIsResizingRight(true)} />
      )}

      {!focusMode && selectedNote && (
        <div 
          className={`bg-nexus-bg-secondary flex flex-col ${rightSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}
          style={{ width: rightSidebarCollapsed ? 0 : `${rightSidebarWidth}px` }}
        >
          <div className="sidebar-tabs">
            <button className={`sidebar-tab ${rightActiveTab === 'properties' ? 'active' : ''}`} onClick={() => setRightActiveTab('properties')}>Properties</button>
            <button className={`sidebar-tab ${rightActiveTab === 'backlinks' ? 'active' : ''}`} onClick={() => setRightActiveTab('backlinks')}>Backlinks</button>
            <button className={`sidebar-tab ${rightActiveTab === 'tags' ? 'active' : ''}`} onClick={() => setRightActiveTab('tags')}>Tags</button>
          </div>
          <div className="tab-content flex-1">
            {rightActiveTab === 'properties' ? (
              <PropertiesPanel 
                properties={selectedNote.properties || {}} 
                onChange={(p) => updateNote(selectedNote.id, { properties: p })}
                noteTags={currentNoteTags}
                wordCount={wordCount}
                wordGoal={selectedNote.properties?.word_goal ? Number(selectedNote.properties.word_goal.value) : undefined}
                createdAt={selectedNote.created_at}
                updatedAt={selectedNote.updated_at}
              />
            ) : rightActiveTab === 'backlinks' ? (
              <BacklinksPanel 
                noteId={selectedNote.id} 
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
        theme={theme}
        onThemeChange={setTheme}
      />
    </div>
  )
}

export default App
