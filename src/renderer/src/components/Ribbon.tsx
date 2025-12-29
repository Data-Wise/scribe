import { Home, Folder, Search, Settings, Compass, Zap, Calendar } from 'lucide-react'
import { useAppViewStore } from '../store/useAppViewStore'

interface RibbonProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onToggleDashboard: () => void
  isDashboardOpen: boolean
}

export function Ribbon({ activeTab, onTabChange, onToggleDashboard, isDashboardOpen }: RibbonProps) {
  const { sidebarMode } = useAppViewStore()
  
  const items = [
    { id: 'mission', icon: Compass, label: 'Mission HQ', color: 'var(--nexus-accent)', glow: 'rgba(56, 189, 248, 0.4)' },
    { id: 'projects', icon: Folder, label: 'Projects', color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
    { id: 'search', icon: Search, label: 'Search', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
    { id: 'daily', icon: Calendar, label: 'Journal', color: '#a78bfa', glow: 'rgba(167, 139, 250, 0.4)' },
  ]

  return (
    <div 
      className="h-full w-[72px] flex flex-col items-center py-6 border-r border-white/5 bg-nexus-bg-secondary/80 backdrop-blur-xl z-50"
      style={{ borderRight: '1px solid var(--nexus-bg-tertiary)' }}
    >
      {/* App Logo / Home */}
      <div className="mb-8">
        <div className="w-10 h-10 rounded-xl bg-nexus-accent flex items-center justify-center shadow-lg shadow-nexus-accent/20">
          <Zap className="w-6 h-6 text-white" fill="currentColor" />
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col gap-4">
        {items.map((item) => {
          const isActive = activeTab === item.id && !isDashboardOpen
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'mission') {
                  onToggleDashboard()
                } else {
                  onTabChange(item.id)
                }
              }}
              className={`group relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-white/10 text-white shadow-inner' 
                  : 'text-nexus-text-muted hover:text-nexus-text-primary hover:bg-white/5'
              }`}
              title={item.label}
            >
              <item.icon 
                className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? 'text-white' : ''
                }`}
                style={{ color: isActive ? item.color : 'inherit' }}
              />
              
              {/* Active Indicator / Glow */}
              {isActive && (
                <div 
                  className="absolute left-0 w-1 h-6 rounded-r-full"
                  style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.glow}` }}
                />
              )}

              {/* Tooltip hint for ADHD accessibility */}
              <div className="absolute left-[80px] px-2 py-1 bg-nexus-bg-tertiary text-white text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-white/10 transition-opacity">
                {item.label}
              </div>
            </button>
          )
        })}
      </nav>

      {/* Settings at bottom */}
      <button
        onClick={() => onTabChange('settings')}
        className="w-12 h-12 flex items-center justify-center rounded-xl text-nexus-text-muted hover:text-nexus-text-primary hover:bg-white/5 transition-all"
        title="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  )
}
