import { Project } from '../types'
import { QuickActions } from './QuickActions'
import { ProjectCard } from './ProjectCard'
import { StreakDisplay } from './StreakDisplay'
import { loadPreferences, getStreakInfo } from '../lib/preferences'
import { useDragRegion } from './DragRegion'
import { Settings } from 'lucide-react'

interface MissionControlProps {
  projects: Project[]
  currentProjectId: string | null
  onSelectProject: (projectId: string) => void
  onCreateNote: () => void
  onDailyNote: () => void
  onQuickCapture: () => void
  onSettings: () => void
}

export function MissionControl({
  projects,
  currentProjectId,
  onSelectProject,
  onCreateNote,
  onDailyNote,
  onQuickCapture,
  onSettings,
}: MissionControlProps) {
  const preferences = loadPreferences()
  const streakInfo = getStreakInfo()
  const dragRegion = useDragRegion()

  // Sort projects: current first, then by updated_at
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.id === currentProjectId) return -1
    if (b.id === currentProjectId) return 1
    return b.updated_at - a.updated_at
  })

  return (
    <div className="mission-control flex-1 flex flex-col bg-nexus-bg-primary overflow-hidden">
      {/* Header - draggable region for window movement */}
      <header
        className="mission-control-header px-8 py-6 border-b border-white/5 flex items-center justify-between"
        {...dragRegion}
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-nexus-text-primary">
            Mission Control
          </h1>
          <p className="text-sm text-nexus-text-muted mt-1">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} • What would you like to work on?
          </p>
        </div>
        <button
          onClick={onSettings}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-nexus-text-muted hover:text-nexus-text-primary"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Quick Actions */}
        <section className="mb-8">
          <QuickActions
            onDailyNote={onDailyNote}
            onNewNote={onCreateNote}
            onQuickCapture={onQuickCapture}
          />
        </section>

        {/* Streak Display (opt-in) */}
        {preferences.streakDisplayOptIn && (
          <section className="mb-8">
            <StreakDisplay
              streak={streakInfo.streak}
              isActiveToday={streakInfo.isActiveToday}
            />
          </section>
        )}

        {/* Projects Grid */}
        <section>
          <h2 className="text-sm font-medium text-nexus-text-muted uppercase tracking-wide mb-4">
            Projects
          </h2>
          {projects.length === 0 ? (
            <div className="text-center py-12 text-nexus-text-muted">
              <p className="mb-2">No projects yet</p>
              <p className="text-sm">Create your first project to organize your notes</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isActive={project.id === currentProjectId}
                  onClick={() => onSelectProject(project.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer hint */}
      <footer className="px-8 py-3 border-t border-white/5 text-xs text-nexus-text-muted text-center">
        Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded">⌘0</kbd> to toggle back to editor
      </footer>
    </div>
  )
}
