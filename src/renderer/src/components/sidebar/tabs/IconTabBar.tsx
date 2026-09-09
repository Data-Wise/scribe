import { LayoutList, LayoutGrid, FolderTree } from 'lucide-react'
import { IconTabType } from '../../../types'

/**
 * IconTabBar - v1.17.0 three-tab pill selector for the expanded icon panel header.
 *
 * Replaces the v1.16.0 two-mode toggle button. Each icon (vault/smart) remembers
 * its own active tab independently via useAppViewStore's switchIconTab action.
 */

interface IconTabBarProps {
  activeTab: IconTabType
  onTabChange: (tab: IconTabType) => void
}

const TABS: Array<{ id: IconTabType; label: string; icon: typeof LayoutList }> = [
  { id: 'compact', label: 'Compact', icon: LayoutList },
  { id: 'card', label: 'Card', icon: LayoutGrid },
  { id: 'explorer', label: 'Explorer', icon: FolderTree }
]

export function IconTabBar({ activeTab, onTabChange }: IconTabBarProps) {
  return (
    <div className="icon-tab-bar" role="tablist" aria-label="Panel view">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          role="tab"
          aria-selected={activeTab === id}
          aria-label={label}
          title={label}
          className={`icon-tab${activeTab === id ? ' active' : ''}`}
          onClick={() => onTabChange(id)}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  )
}
