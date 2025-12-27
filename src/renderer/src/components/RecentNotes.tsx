import { Note, Project } from '../types'
import { FileText, Clock } from 'lucide-react'

interface RecentNotesProps {
  notes: Note[]
  projects: Project[]
  onNoteClick: (noteId: string) => void
  limit?: number
}

/**
 * Displays recently modified notes in Mission Control
 */
export function RecentNotes({
  notes,
  projects,
  onNoteClick,
  limit = 5
}: RecentNotesProps) {
  // Get the most recently updated notes
  const recentNotes = [...notes]
    .filter(n => !n.deleted_at)
    .sort((a, b) => b.updated_at - a.updated_at)
    .slice(0, limit)

  if (recentNotes.length === 0) {
    return null
  }

  // Format relative time
  const formatTime = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Get project name by note properties
  const getProjectName = (note: Note): string | null => {
    // Check if note has a project_id property
    const projectId = note.properties?.project_id?.value as string | undefined
    if (projectId) {
      const project = projects.find(p => p.id === projectId)
      return project?.name || null
    }
    return null
  }

  return (
    <section className="mb-8">
      <h2 className="text-sm font-medium text-nexus-text-muted uppercase tracking-wide mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Recent Pages
      </h2>
      <div className="space-y-2">
        {recentNotes.map((note) => {
          const projectName = getProjectName(note)

          return (
            <button
              key={note.id}
              onClick={() => onNoteClick(note.id)}
              className="w-full text-left px-4 py-3 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all group flex items-center gap-3"
            >
              {/* Icon */}
              <span className="p-2 rounded-lg bg-sky-500/10 text-sky-500 group-hover:bg-sky-500/20 transition-colors flex-shrink-0">
                <FileText className="w-4 h-4" />
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-nexus-text-primary truncate group-hover:text-nexus-accent transition-colors">
                  {note.title || 'Untitled'}
                </div>
                <div className="text-xs text-nexus-text-muted flex items-center gap-2">
                  {projectName && (
                    <>
                      <span>{projectName}</span>
                      <span className="opacity-50">•</span>
                    </>
                  )}
                  <span>{formatTime(note.updated_at)}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
