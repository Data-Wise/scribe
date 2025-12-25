import { Tag } from '../types'

export interface TagFilterProps {
  selectedTags: Tag[]
  onRemoveTag: (tagId: string) => void
  onClearAll: () => void
}

export function TagFilter({ selectedTags, onRemoveTag, onClearAll }: TagFilterProps) {
  if (selectedTags.length === 0) {
    return null
  }

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-400">Filtering by:</span>
        {selectedTags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => onRemoveTag(tag.id)}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-opacity hover:opacity-80"
            style={{
              backgroundColor: tag.color || '#999',
              color: 'white'
            }}
            title="Click to remove filter"
          >
            #{tag.name}
            <span className="text-white/80">✕</span>
          </button>
        ))}
        <button
          onClick={onClearAll}
          className="text-xs text-gray-400 hover:text-white transition-colors underline"
        >
          Clear all
        </button>
      </div>
    </div>
  )
}
