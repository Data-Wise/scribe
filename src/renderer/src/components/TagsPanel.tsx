import { useEffect, useState, useCallback, useMemo } from 'react'
import { ChevronRight, ChevronDown, List, Network, Search, X, Clock, Minimize2, Maximize2, AlertTriangle, Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { TagWithCount, Note } from '../types'
import { api } from '../lib/api'
import { buildTagTree, TagTreeNode, getLeafName } from '../lib/tagHierarchy'

// Track recent tags in localStorage
const RECENT_TAGS_KEY = 'tagsPanelRecentTags'
const MAX_RECENT_TAGS = 8

// Extract tags from content (matches backend regex pattern)
// Supports hierarchical tags with /
const TAG_REGEX = /#([a-zA-Z0-9_/-]+)/g

function extractTagsFromContent(content: string): Set<string> {
  const tags = new Set<string>()
  let match
  while ((match = TAG_REGEX.exec(content)) !== null) {
    // Normalize: lowercase, remove trailing slashes
    const tag = match[1].toLowerCase().replace(/\/+$/, '')
    if (tag) tags.add(tag)
  }
  TAG_REGEX.lastIndex = 0 // Reset regex state
  return tags
}

interface UnregisteredTag {
  name: string
  noteCount: number
}

function getRecentTags(): string[] {
  const saved = localStorage.getItem(RECENT_TAGS_KEY)
  return saved ? JSON.parse(saved) : []
}

function addRecentTag(tagId: string) {
  const recent = getRecentTags().filter(id => id !== tagId)
  recent.unshift(tagId)
  localStorage.setItem(RECENT_TAGS_KEY, JSON.stringify(recent.slice(0, MAX_RECENT_TAGS)))
}

export interface TagsPanelProps {
  noteId: string | null
  selectedTagIds: string[]
  onTagClick: (tagId: string) => void
}

// Recursive component for rendering tag tree
function TagTreeItem({
  node,
  selectedTagIds,
  expandedPaths,
  onTagClick,
  onToggleExpand,
  depth = 0
}: {
  node: TagTreeNode
  selectedTagIds: string[]
  expandedPaths: Set<string>
  onTagClick: (tagId: string) => void
  onToggleExpand: (path: string) => void
  depth?: number
}) {
  const hasChildren = node.children.length > 0
  const isExpanded = expandedPaths.has(node.fullPath)
  const isSelected = node.tag && selectedTagIds.includes(node.tag.id)

  return (
    <div>
      <div
        className="flex items-center gap-1 py-1 rounded-lg transition-colors cursor-pointer"
        style={{
          paddingLeft: `${depth * 16 + 8}px`,
          backgroundColor: isSelected ? 'var(--nexus-bg-tertiary)' : 'transparent',
          outline: isSelected ? '1px solid var(--nexus-accent)' : 'none'
        }}
        onClick={() => {
          if (node.tag) {
            onTagClick(node.tag.id)
          } else if (hasChildren) {
            onToggleExpand(node.fullPath)
          }
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'var(--nexus-bg-tertiary)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'transparent'
          }
        }}
      >
        {/* Expand/collapse button */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(node.fullPath)
            }}
            className="p-0.5 rounded hover:bg-white/10"
            style={{ color: 'var(--nexus-text-muted)' }}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {/* Tag color dot */}
        {node.tag && (
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: node.tag.color || 'var(--nexus-accent)' }}
          />
        )}

        {/* Tag name */}
        <span
          className="text-sm flex-1 min-w-0 truncate"
          style={{
            color: node.tag ? 'var(--nexus-text-primary)' : 'var(--nexus-text-muted)',
            fontStyle: node.tag ? 'normal' : 'italic'
          }}
        >
          {node.name}
        </span>

        {/* Count */}
        <span
          className="text-xs mr-2 flex-shrink-0"
          style={{ color: 'var(--nexus-text-muted)' }}
        >
          {node.tag ? node.tag.note_count : node.totalCount}
        </span>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TagTreeItem
              key={child.fullPath}
              node={child}
              selectedTagIds={selectedTagIds}
              expandedPaths={expandedPaths}
              onTagClick={onTagClick}
              onToggleExpand={onToggleExpand}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function TagsPanel({ noteId, selectedTagIds, onTagClick }: TagsPanelProps) {
  const [allTags, setAllTags] = useState<TagWithCount[]>([])
  const [noteTags, setNoteTags] = useState<TagWithCount[]>([])
  const [unregisteredTags, setUnregisteredTags] = useState<UnregisteredTag[]>([])
  const [loading, setLoading] = useState(false)
  const [scanningTags, setScanningTags] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [recentTagIds, setRecentTagIds] = useState<string[]>(() => getRecentTags())
  const [viewMode, setViewMode] = useState<'tree' | 'flat'>(() => {
    const saved = localStorage.getItem('tagsPanelViewMode')
    return (saved as 'tree' | 'flat') || 'tree'
  })
  const [compactMode, setCompactMode] = useState(() => {
    const saved = localStorage.getItem('tagsPanelCompactMode')
    return saved === 'true'
  })
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('tagsPanelExpandedPaths')
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })
  const [contextMenu, setContextMenu] = useState<{ tagId: string; x: number; y: number } | null>(null)

  // Save view mode preference
  useEffect(() => {
    localStorage.setItem('tagsPanelViewMode', viewMode)
  }, [viewMode])

  // Save compact mode preference
  useEffect(() => {
    localStorage.setItem('tagsPanelCompactMode', String(compactMode))
  }, [compactMode])

  // Save expanded paths
  useEffect(() => {
    localStorage.setItem('tagsPanelExpandedPaths', JSON.stringify([...expandedPaths]))
  }, [expandedPaths])

  // Toggle expand/collapse
  const handleToggleExpand = useCallback((path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }, [])

  // Filter tags based on search query
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return allTags
    const query = searchQuery.toLowerCase()
    return allTags.filter(tag =>
      tag.name.toLowerCase().includes(query)
    )
  }, [allTags, searchQuery])

  // Get recent tags (only those that still exist)
  const recentTags = useMemo(() => {
    return recentTagIds
      .map(id => allTags.find(t => t.id === id))
      .filter((t): t is TagWithCount => t !== undefined)
      .slice(0, 5) // Show max 5 recent
  }, [recentTagIds, allTags])

  // Build tag tree when tags change (use filtered tags)
  const tagTree = buildTagTree(filteredTags)

  // Wrap onTagClick to track recent tags
  const handleTagClick = useCallback((tagId: string) => {
    addRecentTag(tagId)
    setRecentTagIds(getRecentTags())
    onTagClick(tagId)
  }, [onTagClick])

  // Load all tags
  useEffect(() => {
    const loadTags = async () => {
      setLoading(true)
      try {
        const tags = await api.getAllTags()
        setAllTags(tags)
      } catch (error) {
        console.error('[TagsPanel] Error loading tags:', error)
        setAllTags([])
      } finally {
        setLoading(false)
      }
    }

    loadTags()
  }, [])

  // Load tags for current note
  useEffect(() => {
    if (!noteId) {
      setNoteTags([])
      return
    }

    const loadNoteTags = async () => {
      try {
        const tags = await api.getNoteTags(noteId)
        // Add note_count from allTags
        const tagsWithCount: TagWithCount[] = tags.map(tag => {
          const fullTag = allTags.find(t => t.id === tag.id)
          return { ...tag, note_count: fullTag?.note_count || 0 }
        })
        setNoteTags(tagsWithCount)
      } catch (error) {
        console.error('[TagsPanel] Error loading note tags:', error)
        setNoteTags([])
      }
    }

    loadNoteTags()
  }, [noteId, allTags])

  // Scan for unregistered tags (tags in notes but not in database)
  const scanForUnregisteredTags = useCallback(async () => {
    setScanningTags(true)
    try {
      // Get all notes
      const notes = await api.listNotes()

      // Extract all tags from all note contents
      const tagCounts = new Map<string, number>()
      for (const note of notes) {
        const tagsInNote = extractTagsFromContent(note.content)
        for (const tag of tagsInNote) {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
        }
      }

      // Find tags not in the registered tags list
      const registeredNames = new Set(allTags.map(t => t.name.toLowerCase()))
      const unregistered: UnregisteredTag[] = []

      for (const [name, count] of tagCounts) {
        if (!registeredNames.has(name)) {
          unregistered.push({ name, noteCount: count })
        }
      }

      // Sort by note count (most used first)
      unregistered.sort((a, b) => b.noteCount - a.noteCount)
      setUnregisteredTags(unregistered)
    } catch (error) {
      console.error('[TagsPanel] Error scanning for unregistered tags:', error)
    } finally {
      setScanningTags(false)
    }
  }, [allTags])

  // Scan for unregistered tags when allTags changes
  useEffect(() => {
    if (allTags.length > 0) {
      scanForUnregisteredTags()
    }
  }, [allTags, scanForUnregisteredTags])

  // Register a single unregistered tag
  const registerTag = async (tagName: string) => {
    try {
      await api.createTag(tagName)
      // Refresh tags list
      const tags = await api.getAllTags()
      setAllTags(tags)
      // Remove from unregistered list
      setUnregisteredTags(prev => prev.filter(t => t.name !== tagName))
    } catch (error) {
      console.error('[TagsPanel] Error registering tag:', error)
    }
  }

  // Register all unregistered tags
  const registerAllTags = async () => {
    try {
      for (const tag of unregisteredTags) {
        await api.createTag(tag.name)
      }
      // Refresh tags list
      const tags = await api.getAllTags()
      setAllTags(tags)
      setUnregisteredTags([])
    } catch (error) {
      console.error('[TagsPanel] Error registering all tags:', error)
    }
  }

  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent, tagId: string) => {
    e.preventDefault()
    setContextMenu({ tagId, x: e.clientX, y: e.clientY })
  }

  const closeContextMenu = () => setContextMenu(null)

  const handleRenameTag = async () => {
    if (!contextMenu) return
    const tag = allTags.find(t => t.id === contextMenu.tagId)
    if (!tag) return

    const newName = prompt('Enter new tag name:', tag.name)
    if (!newName || newName === tag.name) {
      closeContextMenu()
      return
    }

    try {
      await api.renameTag(contextMenu.tagId, newName)
      // Refresh tags list
      const tags = await api.getAllTags()
      setAllTags(tags)
    } catch (error) {
      console.error('[TagsPanel] Error renaming tag:', error)
      alert('Failed to rename tag')
    }
    closeContextMenu()
  }

  const handleDeleteTag = async () => {
    if (!contextMenu) return
    const tag = allTags.find(t => t.id === contextMenu.tagId)
    if (!tag) return

    const confirmed = confirm(`Delete tag "${tag.name}"? This will remove it from all notes.`)
    if (!confirmed) {
      closeContextMenu()
      return
    }

    try {
      await api.deleteTag(contextMenu.tagId)
      // Refresh tags list
      const tags = await api.getAllTags()
      setAllTags(tags)
    } catch (error) {
      console.error('[TagsPanel] Error deleting tag:', error)
      alert('Failed to delete tag')
    }
    closeContextMenu()
  }

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClick = () => closeContextMenu()
    if (contextMenu) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [contextMenu])

  if (loading) {
    return (
      <div
        className="h-full p-4"
        style={{
          backgroundColor: 'var(--nexus-bg-secondary)',
          borderLeft: '1px solid var(--nexus-bg-tertiary)'
        }}
      >
        <div className="text-sm" style={{ color: 'var(--nexus-text-muted)' }}>Loading tags...</div>
      </div>
    )
  }

  return (
    <div
      className="h-full flex flex-col"
      style={{
        backgroundColor: 'var(--nexus-bg-secondary)',
        borderLeft: '1px solid var(--nexus-bg-tertiary)'
      }}
    >
      {/* Header */}
      <div
        className={compactMode ? 'p-2' : 'p-4'}
        style={{ borderBottom: '1px solid var(--nexus-bg-tertiary)' }}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className={`font-semibold ${compactMode ? 'text-sm' : 'text-lg'}`} style={{ color: 'var(--nexus-text-primary)' }}>Tags</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCompactMode(!compactMode)}
              className="p-1.5 rounded transition-colors"
              style={{
                backgroundColor: compactMode ? 'var(--nexus-bg-tertiary)' : 'transparent',
                color: compactMode ? 'var(--nexus-accent)' : 'var(--nexus-text-muted)'
              }}
              title={compactMode ? 'Normal mode' : 'Compact mode'}
            >
              {compactMode ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className="p-1.5 rounded transition-colors"
              style={{
                backgroundColor: viewMode === 'tree' ? 'var(--nexus-bg-tertiary)' : 'transparent',
                color: viewMode === 'tree' ? 'var(--nexus-accent)' : 'var(--nexus-text-muted)'
              }}
              title="Tree view"
            >
              <Network className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('flat')}
              className="p-1.5 rounded transition-colors"
              style={{
                backgroundColor: viewMode === 'flat' ? 'var(--nexus-bg-tertiary)' : 'transparent',
                color: viewMode === 'flat' ? 'var(--nexus-accent)' : 'var(--nexus-text-muted)'
              }}
              title="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <p className="text-xs" style={{ color: 'var(--nexus-text-muted)' }}>
          {allTags.length} {allTags.length === 1 ? 'tag' : 'tags'} total
        </p>
      </div>

      {/* Search Bar */}
      <div
        className={compactMode ? 'px-2 py-1.5' : 'px-4 py-2'}
        style={{ borderBottom: '1px solid var(--nexus-bg-tertiary)' }}
      >
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
            style={{ color: 'var(--nexus-text-muted)' }}
          />
          <input
            type="text"
            placeholder="Filter tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${compactMode ? 'pl-7 pr-7 py-1 text-xs' : 'pl-8 pr-8 py-1.5 text-sm'} rounded-lg border-0 outline-none`}
            style={{
              backgroundColor: 'var(--nexus-bg-tertiary)',
              color: 'var(--nexus-text-primary)',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-white/10"
              style={{ color: 'var(--nexus-text-muted)' }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-[10px] mt-1" style={{ color: 'var(--nexus-text-muted)' }}>
            {filteredTags.length} of {allTags.length} tags
          </p>
        )}
      </div>

      {/* Recent Tags (only show if not searching and has recent tags) */}
      {!searchQuery && recentTags.length > 0 && (
        <div
          className={compactMode ? 'px-2 py-1.5' : 'p-4'}
          style={{ borderBottom: '1px solid var(--nexus-bg-tertiary)' }}
        >
          <h3 className={`font-medium mb-2 flex items-center gap-1.5 ${compactMode ? 'text-xs' : 'text-sm'}`} style={{ color: 'var(--nexus-text-muted)' }}>
            <Clock className="w-3 h-3" />
            Recent
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {recentTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagClick(tag.id)}
                className={`inline-flex items-center gap-1 rounded-full font-medium transition-opacity hover:opacity-80 ${compactMode ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs'}`}
                style={{
                  backgroundColor: `color-mix(in srgb, ${tag.color || 'var(--nexus-accent)'} 20%, transparent)`,
                  color: tag.color || 'var(--nexus-accent)',
                  outline: selectedTagIds.includes(tag.id) ? '1px solid var(--nexus-accent)' : 'none'
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Unregistered Tags (only show if not searching and has unregistered tags) */}
      {!searchQuery && unregisteredTags.length > 0 && (
        <div
          className={compactMode ? 'px-2 py-1.5' : 'p-4'}
          style={{
            borderBottom: '1px solid var(--nexus-bg-tertiary)',
            backgroundColor: 'color-mix(in srgb, var(--nexus-warning) 5%, transparent)'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-medium flex items-center gap-1.5 ${compactMode ? 'text-xs' : 'text-sm'}`} style={{ color: 'var(--nexus-warning, #f59e0b)' }}>
              <AlertTriangle className="w-3 h-3" />
              Unregistered ({unregisteredTags.length})
            </h3>
            <button
              onClick={registerAllTags}
              className={`flex items-center gap-1 rounded transition-colors hover:bg-white/10 ${compactMode ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'}`}
              style={{ color: 'var(--nexus-accent)' }}
              title="Register all tags"
            >
              <Plus className="w-3 h-3" />
              All
            </button>
          </div>
          <div className={`space-y-1 ${compactMode ? 'max-h-24' : 'max-h-32'} overflow-y-auto`}>
            {unregisteredTags.slice(0, 10).map((tag) => (
              <div
                key={tag.name}
                className={`flex items-center justify-between rounded-lg ${compactMode ? 'px-2 py-1' : 'px-3 py-1.5'}`}
                style={{ backgroundColor: 'var(--nexus-bg-tertiary)' }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`rounded-full flex-shrink-0 ${compactMode ? 'w-2 h-2' : 'w-2.5 h-2.5'}`}
                    style={{ backgroundColor: 'var(--nexus-warning, #f59e0b)', opacity: 0.6 }}
                  />
                  <span className={`truncate ${compactMode ? 'text-[10px]' : 'text-xs'}`} style={{ color: 'var(--nexus-text-primary)' }}>
                    #{tag.name}
                  </span>
                  <span className={`flex-shrink-0 ${compactMode ? 'text-[9px]' : 'text-[10px]'}`} style={{ color: 'var(--nexus-text-muted)' }}>
                    ({tag.noteCount})
                  </span>
                </div>
                <button
                  onClick={() => registerTag(tag.name)}
                  className="p-1 rounded transition-colors hover:bg-white/10"
                  style={{ color: 'var(--nexus-accent)' }}
                  title="Register this tag"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ))}
            {unregisteredTags.length > 10 && (
              <p className={`text-center ${compactMode ? 'text-[9px]' : 'text-[10px]'} pt-1`} style={{ color: 'var(--nexus-text-muted)' }}>
                +{unregisteredTags.length - 10} more
              </p>
            )}
          </div>
        </div>
      )}

      {/* Current note tags */}
      {noteId && noteTags.length > 0 && (
        <div
          className={compactMode ? 'px-2 py-1.5' : 'p-4'}
          style={{ borderBottom: '1px solid var(--nexus-bg-tertiary)' }}
        >
          <h3 className={`font-medium mb-2 ${compactMode ? 'text-xs' : 'text-sm'}`} style={{ color: 'var(--nexus-text-muted)' }}>This Note</h3>
          <div className={`flex flex-wrap ${compactMode ? 'gap-1' : 'gap-2'}`}>
            {noteTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagClick(tag.id)}
                className={`inline-flex items-center gap-1 rounded-full font-medium transition-opacity hover:opacity-80 ${compactMode ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'}`}
                style={{
                  backgroundColor: `color-mix(in srgb, ${tag.color || 'var(--nexus-accent)'} 25%, transparent)`,
                  color: tag.color || 'var(--nexus-accent)',
                  outline: selectedTagIds.includes(tag.id) ? '2px solid var(--nexus-accent)' : 'none'
                }}
                title={`${tag.note_count} ${tag.note_count === 1 ? 'note' : 'notes'}`}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* All tags */}
      <div className={`flex-1 overflow-y-auto ${compactMode ? 'p-2' : 'p-4'}`}>
        <h3 className={`font-medium ${compactMode ? 'text-xs mb-2' : 'text-sm mb-3'}`} style={{ color: 'var(--nexus-text-muted)' }}>
          {searchQuery ? 'Results' : 'All Tags'} {viewMode === 'tree' && tagTree.some(n => n.children.length > 0) && (
            <span className="text-[10px] font-normal ml-1">(hierarchical)</span>
          )}
        </h3>
        {allTags.length === 0 ? (
          <div className={compactMode ? 'text-xs' : 'text-sm'} style={{ color: 'var(--nexus-text-muted)' }}>
            No tags yet. Start typing #tag in your notes!
            <div className="mt-2 text-xs">
              Use / for nested tags: #project/research
            </div>
          </div>
        ) : filteredTags.length === 0 ? (
          <div className={compactMode ? 'text-xs' : 'text-sm'} style={{ color: 'var(--nexus-text-muted)' }}>
            No tags match "{searchQuery}"
          </div>
        ) : viewMode === 'tree' ? (
          /* Tree View */
          <div className={compactMode ? 'space-y-0' : 'space-y-0.5'}>
            {tagTree.map((node) => (
              <TagTreeItem
                key={node.fullPath}
                node={node}
                selectedTagIds={selectedTagIds}
                expandedPaths={expandedPaths}
                onTagClick={handleTagClick}
                onToggleExpand={handleToggleExpand}
              />
            ))}
          </div>
        ) : (
          /* Flat View */
          <div className={compactMode ? 'space-y-0.5' : 'space-y-1'}>
            {filteredTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagClick(tag.id)}
                onContextMenu={(e) => handleContextMenu(e, tag.id)}
                className={`w-full flex items-center justify-between rounded-lg transition-colors text-left ${compactMode ? 'px-2 py-1' : 'px-3 py-2'}`}
                style={{
                  backgroundColor: selectedTagIds.includes(tag.id)
                    ? 'var(--nexus-bg-tertiary)'
                    : 'transparent',
                  outline: selectedTagIds.includes(tag.id)
                    ? '2px solid var(--nexus-accent)'
                    : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!selectedTagIds.includes(tag.id)) {
                    e.currentTarget.style.backgroundColor = 'var(--nexus-bg-tertiary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedTagIds.includes(tag.id)) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span
                    className={`inline-block rounded-full flex-shrink-0 ${compactMode ? 'w-2 h-2' : 'w-3 h-3'}`}
                    style={{ backgroundColor: tag.color || 'var(--nexus-accent)' }}
                  />
                  <span className={`truncate ${compactMode ? 'text-xs' : 'text-sm'}`} style={{ color: 'var(--nexus-text-primary)' }}>#{tag.name}</span>
                </div>
                <span className={`flex-shrink-0 ml-2 ${compactMode ? 'text-[10px]' : 'text-xs'}`} style={{ color: 'var(--nexus-text-muted)' }}>
                  {tag.note_count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Clear filters button */}
      {selectedTagIds.length > 0 && (
        <div
          className={compactMode ? 'p-2' : 'p-4'}
          style={{ borderTop: '1px solid var(--nexus-bg-tertiary)' }}
        >
          <button
            onClick={() => {
              // Clear all selected tags by clicking each one
              selectedTagIds.forEach(id => handleTagClick(id))
            }}
            className={`w-full rounded-lg transition-colors ${compactMode ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'}`}
            style={{
              backgroundColor: 'var(--nexus-bg-tertiary)',
              color: 'var(--nexus-text-primary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--nexus-bg-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--nexus-bg-tertiary)'
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 py-1 rounded-lg shadow-lg min-w-[140px]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            backgroundColor: 'var(--nexus-bg-secondary)',
            border: '1px solid var(--nexus-bg-tertiary)',
          }}
        >
          <button
            onClick={handleRenameTag}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/10 transition-colors text-left"
            style={{ color: 'var(--nexus-text-primary)' }}
          >
            <Pencil className="w-3.5 h-3.5" style={{ color: 'var(--nexus-text-muted)' }} />
            Rename
          </button>
          <button
            onClick={handleDeleteTag}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/10 transition-colors text-left"
            style={{ color: '#ef4444' }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
