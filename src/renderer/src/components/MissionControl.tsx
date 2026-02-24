import { useMemo } from 'react'
import { Project, Note } from '../types'
import { QuickActions } from './QuickActions'
import { ProjectCard } from './ProjectCard'
import { StreakDisplay } from './StreakDisplay'
import { RecentNotes } from './RecentNotes'
import { getStreakInfo } from '../lib/preferences'
import { usePreferences } from '../hooks/usePreferences'
import { useDragRegion } from './DragRegion'
import { Settings, FolderPlus, X } from 'lucide-react'
import { useAppViewStore } from '../store/useAppViewStore'

// Helper to count words in markdown content
function countWords(content: string): number {
  if (!content) return 0
  // Remove markdown syntax and count words
  const text = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '') // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links to text
    .replace(/[#*_~>\-]/g, '') // Remove markdown symbols
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
  return text.split(/\s+/).filter(Boolean).length
}

interface MissionControlProps {
  projects: Project[]
  notes: Note[]
  currentProjectId: string | null
  onSelectProject: (projectId: string) => void
  onSelectNote: (noteId: string) => void
  onCreateNote: () => void
  onDailyNote: () => void
  onQuickCapture: () => void
  onSettings: () => void
  onCreateProject: () => void
}

export function MissionControl({
  projects,
  notes,
  currentProjectId,
  onSelectProject,
  onSelectNote,
  onCreateNote,
  onDailyNote,
  onQuickCapture,
  onSettings,
  onCreateProject,
}: MissionControlProps) {
  const { prefs: preferences } = usePreferences()
  const streakInfo = getStreakInfo()
  const dragRegion = useDragRegion()

  // Get project type filter from store
  const projectTypeFilter = useAppViewStore(state => state.projectTypeFilter)
  const setProjectTypeFilter = useAppViewStore(state => state.setProjectTypeFilter)

  // Filter and sort projects
  const sortedProjects = useMemo(() => {
    // Filter by project type if filter is active
    let filtered = projectTypeFilter
      ? projects.filter(p => p.type === projectTypeFilter)
      : projects

    // Sort: current first, then by updated_at
    return [...filtered].sort((a, b) => {
      if (a.id === currentProjectId) return -1
      if (b.id === currentProjectId) return 1
      return b.updated_at - a.updated_at
    })
  }, [projects, projectTypeFilter, currentProjectId])

  // Compute project stats from notes
  const projectStats = useMemo(() => {
    const stats: Record<string, { noteCount: number; wordCount: number }> = {}

    // Initialize stats for all projects
    projects.forEach(p => {
      stats[p.id] = { noteCount: 0, wordCount: 0 }
    })

    // Compute stats from notes
    notes.filter(n => !n.deleted_at).forEach(note => {
      if (note.project_id && stats[note.project_id]) {
        stats[note.project_id].noteCount++
        stats[note.project_id].wordCount += countWords(note.content)
      }
    })

    return stats
  }, [projects, notes])

  // Total stats for header
  const totalNotes = notes.filter(n => !n.deleted_at).length
  const totalWords = notes.filter(n => !n.deleted_at).reduce((sum, n) => sum + countWords(n.content), 0)

  return (
    <div className="mission-control flex-1 flex flex-col bg-nexus-bg-primary overflow-hidden">
      {/* Header - draggable region for window movement */}
      <header
        className="mission-control-header px-8 py-6 border-b border-white/5 flex items-center justify-between"
        {...dragRegion}
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-nexus-text-primary">
              Mission Control
            </h1>
            {projectTypeFilter && (
              <button
                onClick={() => setProjectTypeFilter(null)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-sm transition-colors"
                title="Clear filter"
              >
                <span className="capitalize">{projectTypeFilter}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className="text-sm text-nexus-text-muted mt-1">
            {sortedProjects.length} {sortedProjects.length === 1 ? 'project' : 'projects'} • {totalNotes} {totalNotes === 1 ? 'page' : 'pages'} • {totalWords.toLocaleString()} words
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSettings}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-nexus-text-muted hover:text-nexus-text-primary"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Quick Actions */}
        <section className="mb-8">
          <QuickActions
            onDailyNote={onDailyNote}
            onNewNote={onCreateNote}
            onQuickCapture={onQuickCapture}
            onNewProject={onCreateProject}
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

        {/* Recent Notes */}
        <RecentNotes
          notes={notes}
          projects={projects}
          onNoteClick={onSelectNote}
          limit={5}
        />

        {/* Projects Grid */}
        <section>
          <h2 className="text-sm font-medium text-nexus-text-muted uppercase tracking-wide mb-4">
            Projects
          </h2>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <FolderPlus className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-medium text-nexus-text-primary mb-2">
                No projects yet
              </h3>
              <p className="text-sm text-nexus-text-muted mb-6 max-w-xs mx-auto">
                Projects help you organize pages by topic, course, or research area
              </p>
              <button
                onClick={onCreateProject}
                className="px-5 py-2.5 bg-nexus-accent text-white font-medium rounded-lg hover:bg-nexus-accent/90 transition-colors"
              >
                Create Your First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedProjects.map((project) => {
                const stats = projectStats[project.id]
                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isActive={project.id === currentProjectId}
                    onClick={() => onSelectProject(project.id)}
                    noteCount={stats?.noteCount}
                    wordCount={stats?.wordCount}
                  />
                )
              })}
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
