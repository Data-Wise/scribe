import { Search, Calendar, Settings } from 'lucide-react'

interface ActivityBarProps {
  onSearch: () => void
  onDaily: () => void
  onSettings: () => void
  activeItem?: 'search' | 'daily' | 'settings' | null
}

/**
 * ActivityBar component - Fixed bottom section of sidebar
 * Provides quick access to search, daily notes, and settings
 */
export function ActivityBar({
  onSearch,
  onDaily,
  onSettings,
  activeItem = null
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
    </div>
  )
}
