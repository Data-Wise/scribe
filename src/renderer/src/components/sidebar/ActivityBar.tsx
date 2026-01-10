import { Search, Calendar, Settings, Clock } from 'lucide-react'
import type { SidebarMode } from '../../types'

interface ActivityBarProps {
  onSearch: () => void
  onDaily: () => void
  onSettings: () => void
  onRecent: () => void
  activeItem?: 'search' | 'daily' | 'recent' | 'settings' | null
  sidebarMode?: SidebarMode // Phase 7: For mode indicator
}

/**
 * ActivityBar component - Fixed bottom section of sidebar
 * Provides quick access to search, daily notes, and settings
 *
 * Phase 7: Displays mode indicator (Compact/Card) below Settings button
 */
export function ActivityBar({
  onSearch,
  onDaily,
  onSettings,
  onRecent,
  activeItem = null,
  sidebarMode = 'compact'
}: ActivityBarProps) {
  return (
    <div className="activity-bar" data-testid="activity-bar">
      {/* Search Button */}
      <button
        className={`activity-bar-btn ${activeItem === 'search' ? 'active' : ''}`}
        onClick={onSearch}
        title="Search (⌘K)"
        data-testid="activity-bar-search"
        aria-label="Search"
      >
        <Search size={16} />
      </button>

      {/* Recent Notes Button */}
      <button
        className={`activity-bar-btn ${activeItem === 'recent' ? 'active' : ''}`}
        onClick={onRecent}
        title="Recent Notes (⌘R)"
        data-testid="activity-bar-recent"
        aria-label="Recent Notes"
      >
        <Clock size={16} />
      </button>

      {/* Daily Note Button */}
      <button
        className={`activity-bar-btn ${activeItem === 'daily' ? 'active' : ''}`}
        onClick={onDaily}
        title="Daily Note (⌘D)"
        data-testid="activity-bar-daily"
        aria-label="Daily Note"
      >
        <Calendar size={16} />
      </button>

      {/* Settings Button */}
      <button
        className={`activity-bar-btn ${activeItem === 'settings' ? 'active' : ''}`}
        onClick={onSettings}
        title="Settings (⌘,)"
        data-testid="activity-bar-settings"
        aria-label="Settings"
      >
        <Settings size={16} />
      </button>

      {/* Phase 7: Mode Indicator - Only show in Compact/Card modes */}
      {sidebarMode !== 'icon' && (
        <div className="mode-indicator" data-testid="mode-indicator">
          {sidebarMode === 'compact' ? 'Compact Mode' : 'Card Mode'}
        </div>
      )}
    </div>
  )
}
