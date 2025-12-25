import { useEffect, useState } from 'react'
import { useNotesStore } from './store/useNotesStore'
import { Editor } from './components/Editor'
import { SearchBar } from './components/SearchBar'
import { SearchResults } from './components/SearchResults'
import { BacklinksPanel } from './components/BacklinksPanel'
import { TagsPanel } from './components/TagsPanel'
import { TagFilter } from './components/TagFilter'
import { Note, Tag } from './types'

const FOLDERS = [
  { path: 'inbox', name: '📥 Inbox', color: '#8b5cf6' },
  { path: 'projects', name: '📁 Projects', color: '#3b82f6' },
  { path: 'areas', name: '🎯 Areas', color: '#10b981' },
  { path: 'resources', name: '📚 Resources', color: '#f59e0b' },
  { path: 'archive', name: '📦 Archive', color: '#6b7280' }
]

function App() {
  const { notes, isLoading, error, loadNotes, createNote, updateNote, selectedNoteId, selectNote } = useNotesStore()
  const [currentFolder, setCurrentFolder] = useState<string | undefined>(undefined)
  const [editingTitle, setEditingTitle] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Note[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  // Tag filtering state
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [isFiltering, setIsFiltering] = useState(false)

  useEffect(() => {
    loadNotes(currentFolder)
  }, [loadNotes, currentFolder])

  const handleCreateNote = async () => {
    await createNote({
      title: `New Note`,
      content: '<p>Start writing...</p>',
      folder: currentFolder || 'inbox'
    })
  }

  const selectedNote = notes.find(n => n.id === selectedNoteId)

  const handleContentChange = (content: string) => {
    if (selectedNote) {
      updateNote(selectedNote.id, { content })
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
      const results = await window.api.searchNotes(query)
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

  // Wiki link handlers
  const handleLinkClick = async (title: string) => {
    // Find note by title
    const allNotes = await window.api.listNotes()
    const targetNote = allNotes.find((n) => n.title === title)

    if (targetNote) {
      selectNote(targetNote.id)
    } else {
      // Note doesn't exist yet, create it
      const newNote = await window.api.createNote({
        title,
        content: '<p></p>',
        folder: selectedNote?.folder || 'inbox'
      })

      // Update links in the current note now that the target exists
      if (selectedNote) {
        await window.api.updateNoteLinks(selectedNote.id, selectedNote.content)
      }

      selectNote(newNote.id)
      loadNotes(currentFolder)
    }
  }

  const handleSearchNotesForAutocomplete = async (query: string): Promise<Note[]> => {
    // Get all notes
    const allNotes = await window.api.listNotes()

    if (query.trim() === '') {
      // Return all notes when no query
      return allNotes
    }

    // Filter by title on client side to avoid FTS5 special character issues
    const lowerQuery = query.toLowerCase()
    return allNotes.filter((note) => note.title.toLowerCase().includes(lowerQuery))
  }

  // Update links when content changes
  useEffect(() => {
    if (selectedNote) {
      // Update note links in database when content changes
      window.api.updateNoteLinks(selectedNote.id, selectedNote.content)
    }
  }, [selectedNote?.content])

  // Update tags when content changes
  useEffect(() => {
    if (selectedNote) {
      // Update note tags in database when content changes
      window.api.updateNoteTags(selectedNote.id, selectedNote.content)
    }
  }, [selectedNote?.content])

  // Tag filtering handlers
  const handleTagClick = async (tagId: string) => {
    const newSelectedIds = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter(id => id !== tagId)
      : [...selectedTagIds, tagId]

    setSelectedTagIds(newSelectedIds)

    if (newSelectedIds.length === 0) {
      // No tags selected, clear filter
      setIsFiltering(false)
      setFilteredNotes([])
      setSelectedTags([])
    } else {
      // Load filtered notes
      setIsFiltering(true)
      try {
        const filtered = await window.api.filterNotesByTags(newSelectedIds, true) // AND logic
        setFilteredNotes(filtered)

        // Load tag details
        const tags = await Promise.all(newSelectedIds.map(id => window.api.getTag(id)))
        setSelectedTags(tags.filter((t): t is Tag => t !== null))
      } catch (error) {
        console.error('Error filtering by tags:', error)
        setFilteredNotes([])
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
    // Get all tags
    const allTags = await window.api.getAllTags()

    if (query.trim() === '') {
      // Return all tags when no query
      return allTags
    }

    // Filter by name on client side
    const lowerQuery = query.toLowerCase()
    return allTags.filter((tag) => tag.name.toLowerCase().includes(lowerQuery))
  }

  const handleTagClickInEditor = async (tagName: string) => {
    // Find tag by name
    const tag = await window.api.getTagByName(tagName)
    if (tag) {
      handleTagClick(tag.id)
    }
  }

  // Determine which notes to display
  const displayNotes = isSearching ? searchResults : isFiltering ? filteredNotes : notes

  return (
    <div className="w-full h-full bg-nexus-bg-primary text-nexus-text-primary flex">
      {/* Sidebar */}
      <div className="w-64 bg-nexus-bg-secondary border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold mb-3">Nexus</h1>

          {/* Search Bar */}
          <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />

          {/* New Note Button */}
          <button
            onClick={handleCreateNote}
            className="w-full bg-nexus-accent hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
            </svg>
            New Note
          </button>
        </div>

        {/* Folder Navigation */}
        <div className="border-b border-gray-700">
          <div className="p-2">
            <button
              onClick={() => setCurrentFolder(undefined)}
              className={`w-full text-left px-3 py-2 rounded transition-colors ${
                currentFolder === undefined
                  ? 'bg-nexus-bg-primary text-white'
                  : 'text-gray-300 hover:bg-nexus-bg-primary hover:text-white'
              }`}
            >
              📝 All Notes
            </button>
          </div>
          {FOLDERS.map((folder) => (
            <div key={folder.path} className="px-2 pb-2">
              <button
                onClick={() => setCurrentFolder(folder.path)}
                className={`w-full text-left px-3 py-2 rounded transition-colors ${
                  currentFolder === folder.path
                    ? 'bg-nexus-bg-primary text-white'
                    : 'text-gray-300 hover:bg-nexus-bg-primary hover:text-white'
                }`}
              >
                {folder.name}
              </button>
            </div>
          ))}
        </div>

        {/* Notes List or Search Results or Filtered Results */}
        {isSearching ? (
          <SearchResults
            results={searchResults}
            query={searchQuery}
            onSelectNote={selectNote}
            selectedNoteId={selectedNoteId}
            isLoading={searchLoading}
          />
        ) : (
          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="p-4 text-gray-400 text-sm">Loading notes...</div>
            )}
            {error && (
              <div className="p-4 text-red-400 text-sm">Error: {error}</div>
            )}
            {displayNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => selectNote(note.id)}
                className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-nexus-bg-primary transition-colors ${
                  selectedNoteId === note.id ? 'bg-nexus-accent/20 border-l-4 border-l-nexus-accent' : ''
                }`}
              >
                <div className="font-medium truncate">{note.title}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(note.updated_at * 1000).toLocaleDateString()}
                </div>
              </div>
            ))}
            {!isLoading && displayNotes.length === 0 && (
              <div className="p-4 text-gray-400 text-sm text-center">
                {isFiltering ? 'No notes with selected tags' : 'No notes yet. Create your first note!'}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
          {isSearching ? (
            <>
              {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
            </>
          ) : isFiltering ? (
            <>
              {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'} with selected tags
            </>
          ) : (
            <>
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
              {currentFolder && ` in ${FOLDERS.find(f => f.path === currentFolder)?.name || currentFolder}`}
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Tag Filter Bar */}
        <TagFilter
          selectedTags={selectedTags}
          onRemoveTag={handleTagClick}
          onClearAll={handleClearTagFilters}
        />

        {selectedNote ? (
          <>
            <div className="p-6 border-b border-gray-700">
              {editingTitle ? (
                <input
                  type="text"
                  defaultValue={selectedNote.title}
                  onBlur={(e) => handleTitleChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleTitleChange(e.currentTarget.value)
                    } else if (e.key === 'Escape') {
                      setEditingTitle(false)
                    }
                  }}
                  autoFocus
                  className="text-3xl font-bold bg-transparent border-b-2 border-nexus-accent outline-none w-full"
                />
              ) : (
                <h2
                  onClick={() => setEditingTitle(true)}
                  className="text-3xl font-bold cursor-pointer hover:text-gray-300"
                >
                  {selectedNote.title}
                </h2>
              )}
              <div className="text-sm text-gray-400 mt-2 flex items-center gap-4">
                <span>Last updated: {new Date(selectedNote.updated_at * 1000).toLocaleString()}</span>
                <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                  {FOLDERS.find(f => f.path === selectedNote.folder)?.name.split(' ')[1] || selectedNote.folder}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-hidden flex">
              <div className="flex-1">
                <Editor
                  content={selectedNote.content}
                  onChange={handleContentChange}
                  editable={true}
                  onLinkClick={handleLinkClick}
                  onSearchNotes={handleSearchNotesForAutocomplete}
                  onSearchTags={handleSearchTagsForAutocomplete}
                  onTagClick={handleTagClickInEditor}
                />
              </div>
              <div className="w-80 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <BacklinksPanel noteId={selectedNoteId} onSelectNote={selectNote} />
                </div>
                <div className="flex-1 overflow-y-auto border-t border-gray-700">
                  <TagsPanel
                    noteId={selectedNoteId}
                    selectedTagIds={selectedTagIds}
                    onTagClick={handleTagClick}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
              </svg>
              <p className="text-xl mb-2">Select a note to view</p>
              <p className="text-sm">or create a new one to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
