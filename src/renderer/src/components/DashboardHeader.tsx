import { Calendar, FilePlus, Zap, Search, Settings, Minimize2, Target } from 'lucide-react'

interface DashboardHeaderProps {
  totalNotes: number
  totalWords: number
  projectCount: number
  onDailyNote: () => void
  onCreateNote: () => void
  onQuickCapture: () => void
  onSearch: () => void
  onSettings: () => void
  onFocusMode: () => void
  onCollapse: () => void
  dragRegion: Record<string, unknown>
}

export function DashboardHeader({
  totalNotes,
  totalWords,
  projectCount,
  onDailyNote,
  onCreateNote,
  onQuickCapture,
  onSearch,
  onSettings,
  onFocusMode,
  onCollapse,
  dragRegion,
}: DashboardHeaderProps) {
  return (
    <header
      className="dashboard-header border-b border-white/5 bg-nexus-bg-secondary"
      {...dragRegion}
    >
      {/* Top row: Title and controls */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-nexus-text-primary">
            Mission Control
          </h1>
          <div className="flex items-center gap-2 text-xs text-nexus-text-muted">
            <span>{projectCount} projects</span>
            <span className="text-white/20">•</span>
            <span>{totalNotes} pages</span>
            <span className="text-white/20">•</span>
            <span>{totalWords.toLocaleString()} words</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onCollapse}
            className="p-1.5 rounded hover:bg-white/5 text-nexus-text-muted hover:text-nexus-text-primary transition-colors"
            title="Collapse Dashboard (⌘0)"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onFocusMode}
            className="p-1.5 rounded hover:bg-white/5 text-nexus-text-muted hover:text-nexus-text-primary transition-colors"
            title="Focus Mode (⌘⇧F)"
          >
            <Target className="w-4 h-4" />
          </button>
          <button
            onClick={onSettings}
            className="p-1.5 rounded hover:bg-white/5 text-nexus-text-muted hover:text-nexus-text-primary transition-colors"
            title="Settings (⌘,)"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Actions row */}
      <div className="flex items-center gap-2 px-4 py-2 border-t border-white/5">
        <QuickActionButton
          icon={<Calendar className="w-4 h-4" />}
          label="Today"
          shortcut="⌘D"
          onClick={onDailyNote}
          color="blue"
        />
        <QuickActionButton
          icon={<FilePlus className="w-4 h-4" />}
          label="New Page"
          shortcut="⌘N"
          onClick={onCreateNote}
          color="green"
        />
        <QuickActionButton
          icon={<Zap className="w-4 h-4" />}
          label="Quick Capture"
          shortcut="⌘⇧C"
          onClick={onQuickCapture}
          color="yellow"
        />
        <QuickActionButton
          icon={<Search className="w-4 h-4" />}
          label="Search"
          shortcut="⌘F"
          onClick={onSearch}
          color="purple"
        />
      </div>
    </header>
  )
}

interface QuickActionButtonProps {
  icon: React.ReactNode
  label: string
  shortcut: string
  onClick: () => void
  color: 'blue' | 'green' | 'yellow' | 'purple'
}

function QuickActionButton({ icon, label, shortcut, onClick, color }: QuickActionButtonProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20',
    yellow: 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20',
  }

  return (
    <button
      onClick={onClick}
      className={`quick-action-compact flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${colorClasses[color]}`}
      title={`${label} (${shortcut})`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
      <span className="text-[10px] opacity-60">{shortcut}</span>
    </button>
  )
}
