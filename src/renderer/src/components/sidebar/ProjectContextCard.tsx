import { FileText, Flame, TrendingUp } from 'lucide-react'
import { Project, Note } from '../../types'
import { ActivityDots, useProjectStats } from './ActivityDots'

interface ProjectContextCardProps {
  project: Project
  notes: Note[]
  onNewNote: () => void
}

/**
 * Expanded context card shown when a project is selected
 * Displays stats, progress, and daily achievements
 */
export function ProjectContextCard({ project, notes, onNewNote }: ProjectContextCardProps) {
  const stats = useProjectStats(project.id, notes)
  const progress = project.progress || 0
  const status = project.status || 'active'

  return (
    <div className="project-context-card" data-status={status}>
      {/* Header with name and activity */}
      <div className="context-header">
        <div className="context-title">
          <span className="project-name">{project.name}</span>
          <ActivityDots projectId={project.id} notes={notes} size="md" />
        </div>
        {project.description && (
          <p className="project-description">{project.description}</p>
        )}
      </div>

      {/* Progress bar */}
      {progress > 0 && (
        <div className="context-progress">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
                backgroundColor: project.color || 'var(--nexus-accent)'
              }}
            />
          </div>
          <span className="progress-label">{progress}%</span>
        </div>
      )}

      {/* Stats row */}
      <div className="context-stats">
        <div className="stat">
          <FileText size={12} />
          <span>{stats.noteCount} {stats.noteCount === 1 ? 'note' : 'notes'}</span>
        </div>
        <div className="stat">
          <TrendingUp size={12} />
          <span>{formatWordCount(stats.totalWords)}</span>
        </div>
      </div>

      {/* Daily achievement - only show if there's activity today */}
      {stats.wordsToday > 0 && (
        <div className="daily-achievement">
          <Flame size={12} className="flame-icon" />
          <span>+{stats.wordsToday.toLocaleString()} words today</span>
        </div>
      )}

      {/* Quick action */}
      <button className="quick-new-note" onClick={onNewNote}>
        + New Note
      </button>
    </div>
  )
}

function formatWordCount(count: number): string {
  if (count === 0) return '0 words'
  if (count < 1000) return `${count} words`
  return `${(count / 1000).toFixed(1)}k words`
}
