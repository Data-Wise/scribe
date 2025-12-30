import { useMemo } from 'react'
import { Project, Note } from '../types'
import { Folder, Zap, TrendingUp, Clock, ChevronRight } from 'lucide-react'

interface HudPanelProps {
  isOpen: boolean
  projects: Project[]
  notes: Note[]
  currentProjectId: string | null
  onSelectProject: (projectId: string) => void
  onSelectNote: (noteId: string) => void
  onClose: () => void
  mode?: 'layered' | 'persistent'
}

export function HudPanel({
  isOpen,
  projects,
  notes,
  currentProjectId,
  onSelectProject,
  onSelectNote,
  onClose: _onClose,
  mode = 'layered'
}: HudPanelProps) {
  // Stats calculation
  const stats = useMemo(() => {
    const totalNotes = notes.filter(n => !n.deleted_at).length
    const totalWords = notes.reduce((sum, n) => sum + (n.content?.split(/\s+/).filter(Boolean).length || 0), 0)
    const recentNotes = [...notes]
      .filter(n => !n.deleted_at)
      .sort((a, b) => b.updated_at - a.updated_at)
      .slice(0, 3)

    return { totalNotes, totalWords, recentNotes }
  }, [notes])

  const projectList = useMemo(() => {
    return projects.sort((a, b) => {
      if (a.id === currentProjectId) return -1
      return b.updated_at - a.updated_at
    }).slice(0, 4)
  }, [projects, currentProjectId])

  if (!isOpen && mode === 'layered') return null

  return (
    <div 
      className={`hud-panel h-full transition-all duration-500 ease-in-out overflow-hidden z-40
        ${mode === 'layered' ? 'fixed left-[72px] top-0 shadow-2xl' : 'relative'}
        ${isOpen ? 'w-[360px] opacity-100' : 'w-0 opacity-0'}
      `}
      style={{ 
        backgroundColor: 'rgba(var(--nexus-bg-secondary-rgb), 0.8)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid var(--nexus-bg-tertiary)'
      }}
    >
      <div className="p-6 h-full flex flex-col space-y-8 overflow-y-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-bold text-nexus-text-primary flex items-center gap-2">
            <Zap className="w-5 h-5 text-nexus-accent" fill="currentColor" />
            Mission HQ
          </h2>
        </div>

        {/* Momentum Bento Card */}
        <div className="bg-nexus-bg-tertiary/40 rounded-2xl p-5 border border-nexus-bg-tertiary/60">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-nexus-text-muted">Current Momentum</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex flex-col items-center justify-center space-y-2 py-2">
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* SVG Ring - Progress Visualization */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64" cy="64" r="58"
                  stroke="currentColor" strokeWidth="8" fill="transparent"
                  className="text-nexus-bg-secondary"
                />
                <circle
                  cx="64" cy="64" r="58"
                  stroke="currentColor" strokeWidth="8" fill="transparent"
                  strokeDasharray={364}
                  strokeDashoffset={364 * 0.15} // Example 85% full as in proposal
                  strokeLinecap="round"
                  className="text-nexus-accent"
                  style={{ filter: 'drop-shadow(0 0 8px var(--nexus-accent))' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-nexus-text-primary">85%</span>
                <span className="text-[10px] text-nexus-text-muted uppercase">Complete</span>
              </div>
            </div>
            <p className="text-center text-xs text-nexus-text-muted mt-2">
               Almost hit your goal! <br/> <strong>150 words to go.</strong>
            </p>
          </div>
        </div>

        {/* Project Pulse section */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-nexus-text-muted px-1">Project Pulse</h3>
          <div className="grid grid-cols-2 gap-3">
            {projectList.map(project => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className={`p-3 rounded-xl border transition-all text-left group
                  ${project.id === currentProjectId 
                    ? 'bg-nexus-accent/10 border-nexus-accent/40 ring-1 ring-nexus-accent/20' 
                    : 'bg-nexus-bg-tertiary/20 border-nexus-bg-tertiary/40 hover:bg-nexus-bg-tertiary/40 hover:border-nexus-bg-tertiary/60'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-nexus-bg-primary/50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Folder className="w-4 h-4" style={{ color: project.color || 'var(--nexus-accent)' }} />
                </div>
                <div className="font-medium text-xs text-nexus-text-primary truncate">{project.name}</div>
                <div className="text-[10px] text-nexus-text-muted mt-1 uppercase">Active</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Sparks */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-nexus-text-muted px-1">Recent Sparks</h3>
          <div className="space-y-2">
            {stats.recentNotes.map(note => (
              <button
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className="w-full p-3 rounded-xl bg-nexus-bg-tertiary/20 border border-nexus-bg-tertiary/40 hover:bg-nexus-bg-tertiary/40 transition-all text-left flex items-center gap-3 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-nexus-text-primary truncate">{note.title || 'Untitled'}</div>
                  <div className="text-[10px] text-nexus-text-muted truncate">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-nexus-text-muted/30 group-hover:text-nexus-text-muted/60" />
              </button>
            ))}
          </div>
        </div>

        {/* Session Stats Mini-Widget */}
        <div className="mt-auto pt-6 border-t border-nexus-bg-tertiary flex items-center justify-between text-nexus-text-muted">
           <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-bold tracking-tighter">Session: 45m</span>
           </div>
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
