import { Note, Project } from '../types'
import { Clock } from 'lucide-react'

interface DashboardFooterProps {
  recentNotes: Note[]
  projects: Project[]
  onSelectNote: (noteId: string) => void
}

export function DashboardFooter({
  recentNotes,
  projects,
  onSelectNote,
}: DashboardFooterProps) {
  // Create a map of project IDs to names
  const projectMap = new Map(projects.map(p => [p.id, p]))

  return (
    <footer className="dashboard-footer flex items-center gap-2 px-4 py-2 border-t border-white/5 bg-nexus-bg-secondary">
      {/* Recent label */}
      <span className="flex items-center gap-1 text-xs text-nexus-text-muted">
        <Clock className="w-3 h-3" />
        Recent pages:
      </span>

      {/* Recent notes as clickable chips */}
      <div className="flex items-center gap-1 flex-1 overflow-x-auto">
        {recentNotes.length === 0 ? (
          <span className="text-xs text-nexus-text-muted italic">No recent pages</span>
        ) : (
          recentNotes.map((note, index) => {
            const projectId = note.properties?.project_id?.value as string | undefined
            const project = projectId ? projectMap.get(projectId) : null

            return (
              <button
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className="recent-note-chip flex items-center gap-1.5 px-2 py-1 rounded text-xs hover:bg-white/5 transition-colors group"
                title={`${note.title}${project ? ` (${project.name})` : ''} - ${formatTimeAgo(note.updated_at)}`}
              >
                {project && (
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: project.color || '#38bdf8' }}
                  />
                )}
                <span className="text-nexus-text-muted group-hover:text-nexus-text-primary truncate max-w-[120px]">
                  {note.title || 'Untitled'}
                </span>
                {index < recentNotes.length - 1 && (
                  <span className="text-white/20 ml-1">•</span>
                )}
              </button>
            )
          })
        )}
      </div>

      {/* Keyboard hint */}
      <span className="text-[10px] text-nexus-text-muted whitespace-nowrap">
        Press <kbd className="px-1 py-0.5 bg-white/10 rounded text-[9px]">⌘0</kbd> to collapse
      </span>
    </footer>
  )
}

function formatTimeAgo(timestamp: number): string {
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
