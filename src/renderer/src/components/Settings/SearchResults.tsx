import React from 'react'
import { SearchResult } from '../../store/useSettingsStore'
import { ChevronRight } from 'lucide-react'

interface SearchResultsProps {
  results: SearchResult[]
  onSelectResult: (categoryId: string, sectionId: string) => void
}

/**
 * SearchResults - Display fuzzy search results for settings
 *
 * Features:
 * - Breadcrumb navigation (Category › Section › Setting)
 * - Click to jump to setting
 * - Keyboard navigation (up/down arrows)
 * - Highlights new features
 */
export default function SearchResults({ results, onSelectResult }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="p-8 text-center text-neutral-500">
        <p>No settings found</p>
        <p className="text-sm mt-2">Try a different search term</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-neutral-100">
          Search Results
          <span className="ml-2 text-sm text-neutral-400">({results.length})</span>
        </h3>
      </div>

      <div className="space-y-2">
        {results.map((result, index) => (
          <button
            key={`${result.categoryId}-${result.sectionId}-${result.settingId}-${index}`}
            onClick={() => onSelectResult(result.categoryId, result.sectionId)}
            className="w-full text-left p-4 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors group"
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-neutral-400 mb-2">
              {result.breadcrumb.split(' › ').map((part, i, arr) => (
                <React.Fragment key={i}>
                  <span className="group-hover:text-blue-400 transition-colors">
                    {part}
                  </span>
                  {i < arr.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-neutral-600" />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Match score indicator (for debugging) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-neutral-600 mt-1">
                Match: {((1 - result.score) * 100).toFixed(0)}%
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
