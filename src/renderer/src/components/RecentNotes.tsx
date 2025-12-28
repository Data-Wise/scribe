import { useMemo } from 'react'
import { Note, Project } from '../types'
import { FileText, Clock } from 'lucide-react'

/**
 * Get recent notes sorted by updated_at
 * Exported for keyboard navigation access
 */
export function getRecentNotes(notes: Note[], limit: number = 5): Note[] {
  return [...notes]
    .filter(n => !n.deleted_at)
    .sort((a, b) => b.updated_at - a.updated_at)
    .slice(0, limit)
}

interface RecentNotesProps {
  notes: Note[]
  projects: Project[]
  onNoteClick: (noteId: string) => void
  limit?: number
  /** Show keyboard number hints (1-9) */
  showKeyboardHints?: boolean
}

/**
 * Displays recently modified notes in Mission Control
 */
export function RecentNotes({
  notes,
  projects,
  onNoteClick,
  limit = 5,
  showKeyboardHints = true
}: RecentNotesProps) {
  // Get the most recently updated notes using shared helper
  const recentNotes = useMemo(() => getRecentNotes(notes, limit), [notes, limit])

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
        {recentNotes.map((note, index) => {
          const projectName = getProjectName(note)
          const keyNumber = index + 1 // 1-9 for keyboard navigation

          return (
            <button
              key={note.id}
              onClick={() => onNoteClick(note.id)}
              className="w-full text-left px-4 py-3 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all group flex items-center gap-3"
            >
              {/* Keyboard hint or Icon */}
              {showKeyboardHints && keyNumber <= 9 ? (
                <span className="w-8 h-8 rounded-lg bg-white/5 text-nexus-text-muted group-hover:bg-sky-500/20 group-hover:text-sky-400 transition-colors flex-shrink-0 flex items-center justify-center text-sm font-mono">
                  {keyNumber}
                </span>
              ) : (
                <span className="p-2 rounded-lg bg-sky-500/10 text-sky-500 group-hover:bg-sky-500/20 transition-colors flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </span>
              )}

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
