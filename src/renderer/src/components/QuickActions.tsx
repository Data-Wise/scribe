import { Calendar, FilePlus, Zap, FolderPlus } from 'lucide-react'

interface QuickActionsProps {
  onDailyNote: () => void
  onNewNote: () => void
  onQuickCapture: () => void
  onNewProject: () => void
}

export function QuickActions({ onDailyNote, onNewNote, onQuickCapture, onNewProject }: QuickActionsProps) {
  return (
    <div className="quick-actions flex flex-wrap gap-3">
      {/* Daily Note */}
      <button
        onClick={onDailyNote}
        className="quick-action-btn flex items-center gap-3 px-4 py-3 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all group"
      >
        <span className="quick-action-icon p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20 transition-colors">
          <Calendar className="w-5 h-5" />
        </span>
        <div className="text-left">
          <div className="font-medium text-nexus-text-primary">Daily Note</div>
          <div className="text-xs text-nexus-text-muted">⌘D</div>
        </div>
      </button>

      {/* New Note */}
      <button
        onClick={onNewNote}
        className="quick-action-btn flex items-center gap-3 px-4 py-3 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all group"
      >
        <span className="quick-action-icon p-2 rounded-lg bg-sky-500/10 text-sky-500 group-hover:bg-sky-500/20 transition-colors">
          <FilePlus className="w-5 h-5" />
        </span>
        <div className="text-left">
          <div className="font-medium text-nexus-text-primary">New Note</div>
          <div className="text-xs text-nexus-text-muted">⌘N</div>
        </div>
      </button>

      {/* Quick Capture */}
      <button
        onClick={onQuickCapture}
        className="quick-action-btn flex items-center gap-3 px-4 py-3 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all group"
      >
        <span className="quick-action-icon p-2 rounded-lg bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20 transition-colors">
          <Zap className="w-5 h-5" />
        </span>
        <div className="text-left">
          <div className="font-medium text-nexus-text-primary">Quick Capture</div>
          <div className="text-xs text-nexus-text-muted">⌘⇧C</div>
        </div>
      </button>

      {/* New Project */}
      <button
        onClick={onNewProject}
        className="quick-action-btn flex items-center gap-3 px-4 py-3 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all group"
      >
        <span className="quick-action-icon p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20 transition-colors">
          <FolderPlus className="w-5 h-5" />
        </span>
        <div className="text-left">
          <div className="font-medium text-nexus-text-primary">New Project</div>
          <div className="text-xs text-nexus-text-muted">⌘⇧P</div>
        </div>
      </button>
    </div>
  )
}
