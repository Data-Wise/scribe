import { useMemo, useState, useEffect, useCallback } from 'react'
import { Project, Note } from '../types'
import { QuickActions } from './QuickActions'
import { ProjectCard } from './ProjectCard'
import { StreakDisplay } from './StreakDisplay'
import { ActivityHeatmap } from './ActivityHeatmap'
import { PinnedNotes } from './PinnedNotes'
import { ProjectSpotlight } from './ProjectSpotlight'
import { RecentNotes, getRecentNotes } from './RecentNotes'
import { ContinueWritingHero } from './ContinueWritingHero'
import { WritingGoal } from './WritingGoal'
import { QuickCaptureInbox } from './QuickCaptureInbox'
import { loadPreferences, getStreakInfo } from '../lib/preferences'
import { useDragRegion } from './DragRegion'
import { useAppViewStore } from '../store/useAppViewStore'
import { Settings, FolderPlus } from 'lucide-react'

/**
 * Get time-based greeting with contextual message
 * Returns a greeting appropriate for the current time of day
 */
export function getTimeBasedGreeting(): { greeting: string; subtitle: string } {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 12) {
    return {
      greeting: 'Good morning',
      subtitle: 'Ready to write?'
    }
  } else if (hour >= 12 && hour < 17) {
    return {
      greeting: 'Good afternoon',
      subtitle: 'Keep the momentum'
    }
  } else if (hour >= 17 && hour < 21) {
    return {
      greeting: 'Good evening',
      subtitle: 'Wrapping up?'
    }
  } else {
    return {
      greeting: 'Late night session',
      subtitle: 'Night owl mode'
    }
  }
}

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
  /** Move note out of inbox (mark as processed) */
  onMarkInboxProcessed?: (noteId: string) => void
  /** Delete note */
  onDeleteNote?: (noteId: string) => void
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
  onMarkInboxProcessed,
  onDeleteNote,
}: MissionControlProps) {
  const preferences = loadPreferences()
  const streakInfo = getStreakInfo()
  const dragRegion = useDragRegion()
  const { lastActiveNoteId } = useAppViewStore()

  // Time-based greeting that updates every minute
  const [greeting, setGreeting] = useState(getTimeBasedGreeting)
  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getTimeBasedGreeting())
    }, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  // Get recent notes for keyboard navigation
  const recentNotes = useMemo(() => getRecentNotes(notes, 9), [notes])

  // Keyboard navigation: 1-9 opens recent notes
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Skip if typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }
    // Skip if modifier keys are pressed (except shift)
    if (e.metaKey || e.ctrlKey || e.altKey) {
      return
    }

    // Handle number keys 1-9
    const key = e.key
    if (key >= '1' && key <= '9') {
      const index = parseInt(key, 10) - 1
      if (index < recentNotes.length) {
        e.preventDefault()
        onSelectNote(recentNotes[index].id)
      }
    }
  }, [recentNotes, onSelectNote])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Find the last active note and its project
  const lastActiveNote = useMemo(() => {
    if (!lastActiveNoteId) return null
    return notes.find(n => n.id === lastActiveNoteId && !n.deleted_at) || null
  }, [lastActiveNoteId, notes])

  const lastActiveProject = useMemo(() => {
    if (!lastActiveNote) return null
    const projectId = lastActiveNote.project_id
    if (!projectId) return null
    return projects.find(p => p.id === projectId) || null
  }, [lastActiveNote, projects])

  // Get current active project for spotlight
  const currentProject = useMemo(() => {
    if (!currentProjectId) return null
    return projects.find(p => p.id === currentProjectId) || null
  }, [currentProjectId, projects])

  // Sort projects: current first, then by updated_at
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.id === currentProjectId) return -1
    if (b.id === currentProjectId) return 1
    return b.updated_at - a.updated_at
  })

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
          <h1 className="text-2xl font-display font-bold text-nexus-text-primary">
            {greeting.greeting}
          </h1>
          <p className="text-sm text-nexus-text-muted mt-1">
            {greeting.subtitle} • {projects.length} {projects.length === 1 ? 'project' : 'projects'} • {totalNotes} {totalNotes === 1 ? 'page' : 'pages'} • {totalWords.toLocaleString()} words
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
        {/* Continue Writing Hero - shown when there's a recent note */}
        {lastActiveNote && (
          <section className="mb-8">
            <ContinueWritingHero
              note={lastActiveNote}
              project={lastActiveProject}
              onContinue={() => onSelectNote(lastActiveNote.id)}
            />
          </section>
        )}

        {/* Pinned Notes - only shows when there are pinned notes */}
        <PinnedNotes
          notes={notes}
          projects={projects}
          onNoteClick={onSelectNote}
        />

        {/* Focus Project Spotlight - shown when a project is selected */}
        {currentProject && (
          <section className="mb-8">
            <ProjectSpotlight
              project={currentProject}
              notes={notes}
              onContinue={() => {
                // Open the last edited note in the project
                const projectNotes = notes.filter(n =>
                  !n.deleted_at && n.project_id === currentProject.id
                ).sort((a, b) => b.updated_at - a.updated_at)
                if (projectNotes[0]) {
                  onSelectNote(projectNotes[0].id)
                } else {
                  onCreateNote()
                }
              }}
              onNewNote={onCreateNote}
              onViewAll={() => onSelectProject(currentProject.id)}
            />
          </section>
        )}

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

        {/* Activity Heatmap */}
        <section className="mb-8">
          <ActivityHeatmap notes={notes} weeks={12} />
        </section>

        {/* Daily Writing Goal (opt-in) */}
        <section className="mb-8">
          <WritingGoal onStartWriting={onCreateNote} />
        </section>

        {/* Quick Capture Inbox - only shows when items exist */}
        <section className="mb-8">
          <QuickCaptureInbox
            notes={notes}
            onProcess={onSelectNote}
            onMarkProcessed={onMarkInboxProcessed}
            onDelete={onDeleteNote}
          />
        </section>

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
        <kbd className="px-1.5 py-0.5 bg-white/10 rounded">1-9</kbd> open recent pages
        <span className="mx-2 opacity-50">•</span>
        <kbd className="px-1.5 py-0.5 bg-white/10 rounded">⌘0</kbd> toggle editor
      </footer>
    </div>
  )
}
