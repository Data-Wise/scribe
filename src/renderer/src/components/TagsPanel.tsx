import { useEffect, useState } from 'react'
import { TagWithCount } from '../types'
import { api } from '../lib/api'

export interface TagsPanelProps {
  noteId: string | null
  selectedTagIds: string[]
  onTagClick: (tagId: string) => void
}

export function TagsPanel({ noteId, selectedTagIds, onTagClick }: TagsPanelProps) {
  const [allTags, setAllTags] = useState<TagWithCount[]>([])
  const [noteTags, setNoteTags] = useState<TagWithCount[]>([])
  const [loading, setLoading] = useState(false)

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
        <h2 className="text-lg font-semibold" style={{ color: 'var(--nexus-text-primary)' }}>Tags</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--nexus-text-muted)' }}>
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
        <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--nexus-text-muted)' }}>All Tags</h3>
        {allTags.length === 0 ? (
          <div className="text-sm" style={{ color: 'var(--nexus-text-muted)' }}>
            No tags yet. Start typing #tag in your notes!
          </div>
        ) : (
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
