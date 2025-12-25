import { useEffect, useState } from 'react'
import { TagWithCount } from '../types'

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
        const tags = await window.api.getAllTags()
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
        const tags = await window.api.getNoteTags(noteId)
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
      <div className="h-full bg-nexus-bg-secondary border-l border-gray-700 p-4">
        <div className="text-gray-400 text-sm">Loading tags...</div>
      </div>
    )
  }

  return (
    <div className="h-full bg-nexus-bg-secondary border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Tags</h2>
        <p className="text-xs text-gray-400 mt-1">
          {allTags.length} {allTags.length === 1 ? 'tag' : 'tags'} total
        </p>
      </div>

      {/* Current note tags */}
      {noteId && noteTags.length > 0 && (
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-2">This Note</h3>
          <div className="flex flex-wrap gap-2">
            {noteTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => onTagClick(tag.id)}
                className={`
                  inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                  transition-opacity hover:opacity-80
                  ${selectedTagIds.includes(tag.id) ? 'ring-2 ring-white' : ''}
                `}
                style={{
                  backgroundColor: tag.color || '#999',
                  color: 'white'
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
        <h3 className="text-sm font-medium text-gray-300 mb-3">All Tags</h3>
        {allTags.length === 0 ? (
          <div className="text-gray-500 text-sm">
            No tags yet. Start typing #tag in your notes!
          </div>
        ) : (
          <div className="space-y-1">
            {allTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => onTagClick(tag.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-lg
                  transition-colors text-left
                  ${
                    selectedTagIds.includes(tag.id)
                      ? 'bg-gray-700 ring-2 ring-blue-500'
                      : 'hover:bg-gray-700'
                  }
                `}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span
                    className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color || '#999' }}
                  />
                  <span className="text-sm text-white truncate">#{tag.name}</span>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                  {tag.note_count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Clear filters button */}
      {selectedTagIds.length > 0 && (
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => {
              // Clear all selected tags by clicking each one
              selectedTagIds.forEach(id => onTagClick(id))
            }}
            className="w-full px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}
