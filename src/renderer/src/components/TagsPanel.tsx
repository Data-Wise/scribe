import { useEffect, useState, useCallback } from 'react'
import { ChevronRight, ChevronDown, List, Network } from 'lucide-react'
import { TagWithCount } from '../types'
import { api } from '../lib/api'
import { buildTagTree, TagTreeNode, getLeafName } from '../lib/tagHierarchy'

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
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'tree' | 'flat'>(() => {
    const saved = localStorage.getItem('tagsPanelViewMode')
    return (saved as 'tree' | 'flat') || 'tree'
  })
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('tagsPanelExpandedPaths')
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })

  // Save view mode preference
  useEffect(() => {
    localStorage.setItem('tagsPanelViewMode', viewMode)
  }, [viewMode])

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

  // Build tag tree when tags change
  const tagTree = buildTagTree(allTags)

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
        className="p-4"
        style={{ borderBottom: '1px solid var(--nexus-bg-tertiary)' }}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--nexus-text-primary)' }}>Tags</h2>
          <div className="flex items-center gap-1">
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

      {/* Current note tags */}
      {noteId && noteTags.length > 0 && (
        <div
          className="p-4"
          style={{ borderBottom: '1px solid var(--nexus-bg-tertiary)' }}
        >
          <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--nexus-text-muted)' }}>This Note</h3>
          <div className="flex flex-wrap gap-2">
            {noteTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => onTagClick(tag.id)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-opacity hover:opacity-80"
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
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--nexus-text-muted)' }}>
          All Tags {viewMode === 'tree' && tagTree.some(n => n.children.length > 0) && (
            <span className="text-[10px] font-normal ml-1">(hierarchical)</span>
          )}
        </h3>
        {allTags.length === 0 ? (
          <div className="text-sm" style={{ color: 'var(--nexus-text-muted)' }}>
            No tags yet. Start typing #tag in your notes!
            <div className="mt-2 text-xs">
              Use / for nested tags: #project/research
            </div>
          </div>
        ) : viewMode === 'tree' ? (
          /* Tree View */
          <div className="space-y-0.5">
            {tagTree.map((node) => (
              <TagTreeItem
                key={node.fullPath}
                node={node}
                selectedTagIds={selectedTagIds}
                expandedPaths={expandedPaths}
                onTagClick={onTagClick}
                onToggleExpand={handleToggleExpand}
              />
            ))}
          </div>
        ) : (
          /* Flat View */
          <div className="space-y-1">
            {allTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => onTagClick(tag.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left"
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
                    className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color || 'var(--nexus-accent)' }}
                  />
                  <span className="text-sm truncate" style={{ color: 'var(--nexus-text-primary)' }}>#{tag.name}</span>
                </div>
                <span className="text-xs flex-shrink-0 ml-2" style={{ color: 'var(--nexus-text-muted)' }}>
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
          className="p-4"
          style={{ borderTop: '1px solid var(--nexus-bg-tertiary)' }}
        >
          <button
            onClick={() => {
              // Clear all selected tags by clicking each one
              selectedTagIds.forEach(id => onTagClick(id))
            }}
            className="w-full px-3 py-2 text-sm rounded-lg transition-colors"
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
    </div>
  )
}
