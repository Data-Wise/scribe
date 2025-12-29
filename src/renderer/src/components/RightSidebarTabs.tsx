import { FileText, Link2, Tags, Sparkles } from 'lucide-react'

/**
 * RightSidebarTabs - Tab bar for the right sidebar with icons and badge counts
 *
 * Sprint 27: Icons + badge counts for Properties, Backlinks, Tags, AI tabs
 */

export type RightSidebarTab = 'properties' | 'backlinks' | 'tags' | 'ai'

interface TabConfig {
  id: RightSidebarTab
  label: string
  icon: React.ReactNode
  shortcut?: string
}

const TABS: TabConfig[] = [
  { id: 'properties', label: 'Properties', icon: <FileText size={14} />, shortcut: '⌘⌥1' },
  { id: 'backlinks', label: 'Backlinks', icon: <Link2 size={14} />, shortcut: '⌘⌥2' },
  { id: 'tags', label: 'Tags', icon: <Tags size={14} />, shortcut: '⌘⌥3' },
  { id: 'ai', label: 'AI', icon: <Sparkles size={14} />, shortcut: '⌘⌥4' },
]

interface RightSidebarTabsProps {
  activeTab: RightSidebarTab
  onTabChange: (tab: RightSidebarTab) => void
  propertiesCount?: number
  backlinksCount?: number
  tagsCount?: number
  menuContent?: React.ReactNode
}

export function RightSidebarTabs({
  activeTab,
  onTabChange,
  propertiesCount = 0,
  backlinksCount = 0,
  tagsCount = 0,
  menuContent
}: RightSidebarTabsProps) {

  const getCount = (tabId: RightSidebarTab): number | undefined => {
    switch (tabId) {
      case 'properties':
        return propertiesCount > 0 ? propertiesCount : undefined
      case 'backlinks':
        return backlinksCount > 0 ? backlinksCount : undefined
      case 'tags':
        return tagsCount > 0 ? tagsCount : undefined
      default:
        return undefined
    }
  }

  return (
    <div className="right-sidebar-tabs" role="tablist" aria-label="Right sidebar tabs">
      {TABS.map(tab => {
        const count = getCount(tab.id)
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            className={`right-sidebar-tab ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            title={tab.shortcut ? `${tab.label} (${tab.shortcut})` : tab.label}
          >
            <span className="tab-icon" aria-hidden="true">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
            {count !== undefined && (
              <span className="tab-badge" aria-label={`${count} items`}>
                {count}
              </span>
            )}
          </button>
        )
      })}
      <div className="flex-1" />
      {menuContent}
    </div>
  )
}

// Export tab IDs for keyboard shortcut mapping
export const RIGHT_SIDEBAR_TAB_ORDER: RightSidebarTab[] = ['properties', 'backlinks', 'tags', 'ai']
