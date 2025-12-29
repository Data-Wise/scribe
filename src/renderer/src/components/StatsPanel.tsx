import { useMemo } from 'react'
import { Project, Note } from '../types'
import { TrendingUp, Clock, FileText, Folder, ChevronRight } from 'lucide-react'

interface StatsPanelProps {
  projects: Project[]
  notes: Note[]
  currentProjectId: string | null
  wordCount: number
  wordGoal?: number
  sessionStartTime?: number
  onSelectProject: (projectId: string) => void
  onSelectNote: (noteId: string) => void
}

export function StatsPanel({
  projects,
  notes,
  currentProjectId,
  wordCount,
  wordGoal = 500,
  sessionStartTime,
  onSelectProject,
  onSelectNote
}: StatsPanelProps) {
  // Calculate stats
  const stats = useMemo(() => {
    const totalNotes = notes.filter(n => !n.deleted_at).length
    const totalWords = notes.reduce((sum, n) => sum + (n.content?.split(/\s+/).filter(Boolean).length || 0), 0)
    const recentNotes = [...notes]
      .filter(n => !n.deleted_at)
      .sort((a, b) => b.updated_at - a.updated_at)
      .slice(0, 5)

    return { totalNotes, totalWords, recentNotes }
  }, [notes])

  // Current project stats
  const currentProject = useMemo(() => {
    if (!currentProjectId) return null
    return projects.find(p => p.id === currentProjectId)
  }, [projects, currentProjectId])

  const projectNotes = useMemo(() => {
    if (!currentProjectId) return []
    return notes.filter(n => n.project_id === currentProjectId && !n.deleted_at)
  }, [notes, currentProjectId])

  // Session duration
  const sessionDuration = useMemo(() => {
    if (!sessionStartTime) return null
    const minutes = Math.floor((Date.now() - sessionStartTime) / 60000)
    if (minutes < 1) return 'Just started'
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }, [sessionStartTime])

  // Word goal progress
  const goalProgress = Math.min(100, Math.round((wordCount / wordGoal) * 100))
  const wordsRemaining = Math.max(0, wordGoal - wordCount)

  return (
    <div className="stats-panel p-4 space-y-6 overflow-y-auto h-full" data-testid="stats-panel">
      {/* Session Stats */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-nexus-text-muted">
          Session
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-nexus-bg-tertiary/30 rounded-lg p-3 border border-nexus-bg-tertiary/50">
            <div className="flex items-center gap-2 text-nexus-text-muted mb-1">
              <Clock size={12} />
              <span className="text-[10px] uppercase">Duration</span>
            </div>
            <div className="text-lg font-bold text-nexus-text-primary">
              {sessionDuration || '--'}
            </div>
          </div>
          <div className="bg-nexus-bg-tertiary/30 rounded-lg p-3 border border-nexus-bg-tertiary/50">
            <div className="flex items-center gap-2 text-nexus-text-muted mb-1">
              <FileText size={12} />
              <span className="text-[10px] uppercase">Words</span>
            </div>
            <div className="text-lg font-bold text-nexus-text-primary">
              {wordCount.toLocaleString()}
            </div>
          </div>
        </div>
      </section>

      {/* Word Goal Progress */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-nexus-text-muted">
            Daily Goal
          </h3>
          <span className="text-xs text-nexus-text-muted">{goalProgress}%</span>
        </div>
        <div className="space-y-2">
          <div className="h-2 bg-nexus-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-nexus-accent transition-all duration-300"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
          <p className="text-xs text-nexus-text-muted">
            {goalProgress >= 100 ? (
              <span className="text-emerald-400">Goal reached!</span>
            ) : (
              <>{wordsRemaining.toLocaleString()} words to go</>
            )}
          </p>
        </div>
      </section>

      {/* Current Project Stats */}
      {currentProject && (
        <section className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-nexus-text-muted">
            Current Project
          </h3>
          <div className="bg-nexus-bg-tertiary/30 rounded-lg p-3 border border-nexus-bg-tertiary/50">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: currentProject.color || 'var(--nexus-accent)' }}
              />
              <span className="text-sm font-medium text-nexus-text-primary truncate">
                {currentProject.name}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-nexus-text-muted">
              <span>{projectNotes.length} notes</span>
              <span>
                {projectNotes.reduce((sum, n) => sum + (n.content?.split(/\s+/).filter(Boolean).length || 0), 0).toLocaleString()} words
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Total Stats */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-nexus-text-muted">
          All Notes
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-nexus-bg-tertiary/30 rounded-lg p-3 border border-nexus-bg-tertiary/50">
            <div className="flex items-center gap-2 text-nexus-text-muted mb-1">
              <FileText size={12} />
              <span className="text-[10px] uppercase">Notes</span>
            </div>
            <div className="text-lg font-bold text-nexus-text-primary">
              {stats.totalNotes}
            </div>
          </div>
          <div className="bg-nexus-bg-tertiary/30 rounded-lg p-3 border border-nexus-bg-tertiary/50">
            <div className="flex items-center gap-2 text-nexus-text-muted mb-1">
              <Folder size={12} />
              <span className="text-[10px] uppercase">Projects</span>
            </div>
            <div className="text-lg font-bold text-nexus-text-primary">
              {projects.filter(p => p.status !== 'archive').length}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-nexus-text-muted">
            Recent Activity
          </h3>
          <TrendingUp size={12} className="text-nexus-text-muted" />
        </div>
        <div className="space-y-1">
          {stats.recentNotes.map(note => (
            <button
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className="w-full p-2 rounded-lg hover:bg-nexus-bg-tertiary/30 transition-colors text-left flex items-center gap-2 group"
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-nexus-text-primary truncate">
                  {note.title || 'Untitled'}
                </div>
                <div className="text-[10px] text-nexus-text-muted">
                  {new Date(note.updated_at).toLocaleDateString()}
                </div>
              </div>
              <ChevronRight size={14} className="text-nexus-text-muted/30 group-hover:text-nexus-text-muted/60" />
            </button>
          ))}
        </div>
      </section>

      {/* Quick Project Access */}
      {projects.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-nexus-text-muted">
            Projects
          </h3>
          <div className="space-y-1">
            {projects
              .filter(p => p.status !== 'archive')
              .slice(0, 4)
              .map(project => (
                <button
                  key={project.id}
                  onClick={() => onSelectProject(project.id)}
                  className={`w-full p-2 rounded-lg transition-colors text-left flex items-center gap-2 group
                    ${project.id === currentProjectId
                      ? 'bg-nexus-accent/10 border border-nexus-accent/30'
                      : 'hover:bg-nexus-bg-tertiary/30'
                    }`}
                >
                  <div
                    className="w-2 h-2 rounded"
                    style={{ backgroundColor: project.color || 'var(--nexus-accent)' }}
                  />
                  <span className="text-xs font-medium text-nexus-text-primary truncate flex-1">
                    {project.name}
                  </span>
                  {project.id === currentProjectId && (
                    <span className="text-[10px] text-nexus-accent">Active</span>
                  )}
                </button>
              ))}
          </div>
        </section>
      )}
    </div>
  )
}
