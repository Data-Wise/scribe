import { FolderKanban, FileText, Inbox, GitBranch, Trash2, type LucideIcon } from 'lucide-react'

/**
 * SidebarTabs - Modern tabbed navigation for left sidebar
 *
 * Hybrid approach:
 * - Icon mode (48px): Vertical icon tabs with underline indicator
 * - Compact/Card mode: Horizontal pill tabs
 */

export type LeftSidebarTab = 'projects' | 'notes' | 'inbox' | 'graph' | 'trash'

export interface TabDefinition {
  id: LeftSidebarTab
  label: string
  icon: LucideIcon
  badge?: number
}

export const LEFT_SIDEBAR_TABS: TabDefinition[] = [
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'graph', label: 'Graph', icon: GitBranch },
  { id: 'trash', label: 'Trash', icon: Trash2 },
]

// =============================================================================
// Pill Tabs (for compact/card modes)
// =============================================================================

interface PillTabsProps {
  tabs: TabDefinition[]
  activeTab: LeftSidebarTab
  onTabChange: (tab: LeftSidebarTab) => void
  size?: 'sm' | 'md' | 'lg'
}

export function PillTabs({ tabs, activeTab, onTabChange, size = 'md' }: PillTabsProps) {
  return (
    <div className="sidebar-tabs-pill" role="tablist" aria-label="Sidebar navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            className={`tab-pill ${isActive ? 'active' : ''} tab-pill-${size}`}
            onClick={() => onTabChange(tab.id)}
          >
            <Icon size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} />
            <span className="tab-label">{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="tab-badge">{tab.badge > 99 ? '99+' : tab.badge}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// =============================================================================
// Icon Tabs (for icon mode - vertical layout)
// =============================================================================

interface IconTabsProps {
  tabs: TabDefinition[]
  activeTab: LeftSidebarTab
  onTabChange: (tab: LeftSidebarTab) => void
}

export function IconTabs({ tabs, activeTab, onTabChange }: IconTabsProps) {
  return (
    <div className="sidebar-tabs-icon" role="tablist" aria-label="Sidebar navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-label={tab.label}
            className={`tab-icon ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            title={tab.label}
          >
            <Icon size={16} />
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="tab-badge-icon">{tab.badge > 9 ? '9+' : tab.badge}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// =============================================================================
// Combined component that switches based on mode
// =============================================================================

interface SidebarTabsProps {
  variant: 'icon' | 'pill'
  tabs?: TabDefinition[]
  activeTab: LeftSidebarTab
  onTabChange: (tab: LeftSidebarTab) => void
  size?: 'sm' | 'md' | 'lg'
}

export function SidebarTabs({
  variant,
  tabs = LEFT_SIDEBAR_TABS,
  activeTab,
  onTabChange,
  size = 'md'
}: SidebarTabsProps) {
  if (variant === 'icon') {
    return <IconTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
  }
  return <PillTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} size={size} />
}
