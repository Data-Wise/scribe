import { useMemo } from 'react'
import { FileText, Type, ArrowRight, Plus } from 'lucide-react'
import { Project, Note } from '../types'

interface ProjectSpotlightProps {
  project: Project
  notes: Note[]
  onContinue: () => void
  onNewNote: () => void
  onViewAll: () => void
}

/**
 * ProjectSpotlight - Prominent display of active project
 *
 * When a project is selected, shows it prominently with:
 * - Progress bar
 * - Stats (notes, words)
 * - Last edited note
 * - Quick actions
 *
 * ADHD-friendly: Clear focus, reduces context switching
 */
export function ProjectSpotlight({
  project,
  notes,
  onContinue,
  onNewNote,
  onViewAll
}: ProjectSpotlightProps) {
  // Calculate project stats
  const stats = useMemo(() => {
    const projectNotes = notes.filter(n =>
      !n.deleted_at &&
      n.project_id === project.id
    )

    const wordCount = projectNotes.reduce((sum, note) => {
      const words = note.content?.split(/\s+/).filter(Boolean).length || 0
      return sum + words
    }, 0)

    const lastNote = projectNotes.sort((a, b) => b.updated_at - a.updated_at)[0]

    return {
      noteCount: projectNotes.length,
      wordCount,
      lastNote
    }
  }, [notes, project.id])

  // Format relative time
  const formatTime = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Get project type icon
  const getTypeIcon = () => {
    switch (project.type) {
      case 'research': return '🔬'
      case 'teaching': return '📚'
      case 'r-package': return '📦'
      case 'r-dev': return '🔧'
      default: return '📁'
    }
  }

  // Calculate progress percentage
  const progress = project.progress

  return (
    <div className="project-spotlight p-5 rounded-xl bg-gradient-to-br from-nexus-accent/10 to-nexus-accent/5 border border-nexus-accent/20">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getTypeIcon()}</span>
          <div>
            <div className="text-xs text-nexus-accent font-medium uppercase tracking-wide">
              Active Project
            </div>
            <h3 className="text-lg font-medium text-nexus-text-primary">
              {project.name}
            </h3>
          </div>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs text-nexus-text-muted hover:text-nexus-accent transition-colors"
        >
          View All →
        </button>
      </div>

      {/* Progress bar (if project has progress) */}
      {progress !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-nexus-text-muted mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-nexus-accent to-nexus-accent/70 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-6 mb-4 text-sm">
        <div className="flex items-center gap-2 text-nexus-text-muted">
          <FileText className="w-4 h-4" />
          <span>{stats.noteCount} {stats.noteCount === 1 ? 'page' : 'pages'}</span>
        </div>
        <div className="flex items-center gap-2 text-nexus-text-muted">
          <Type className="w-4 h-4" />
          <span>{stats.wordCount.toLocaleString()} words</span>
        </div>
      </div>

      {/* Last edited note */}
      {stats.lastNote && (
        <div className="mb-4 px-3 py-2 bg-white/[0.03] rounded-lg border border-white/5">
          <div className="text-xs text-nexus-text-muted mb-1">Last edited</div>
          <div className="text-sm text-nexus-text-primary truncate">
            {stats.lastNote.title || 'Untitled'}{' '}
            <span className="text-nexus-text-muted">• {formatTime(stats.lastNote.updated_at)}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onContinue}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-nexus-accent text-white font-medium rounded-lg hover:bg-nexus-accent/90 transition-colors"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={onNewNote}
          className="px-4 py-2 bg-white/5 text-nexus-text-primary rounded-lg hover:bg-white/10 transition-colors"
          title="New page in project"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
