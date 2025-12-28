import { useMemo, useState, useEffect } from 'react'
import { Pin, X } from 'lucide-react'
import { Note, Project } from '../types'
import { getPinnedNoteIds, unpinNote } from '../lib/preferences'

interface PinnedNotesProps {
  notes: Note[]
  projects: Project[]
  onNoteClick: (noteId: string) => void
}

/**
 * PinnedNotes - Quick access to favorite/important notes
 *
 * Shows pinned notes at the top of Mission Control for easy access.
 * Limited to 5 notes to avoid clutter (ADHD-friendly).
 */
export function PinnedNotes({ notes, projects, onNoteClick }: PinnedNotesProps) {
  // Track pinned IDs with state to enable re-render on changes
  const [pinnedIds, setPinnedIds] = useState<string[]>(getPinnedNoteIds)

  // Refresh pinned IDs periodically (in case changed elsewhere)
  useEffect(() => {
    const interval = setInterval(() => {
      setPinnedIds(getPinnedNoteIds())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Get actual note objects for pinned IDs (filter out deleted)
  const pinnedNotes = useMemo(() => {
    return pinnedIds
      .map(id => notes.find(n => n.id === id && !n.deleted_at))
      .filter((n): n is Note => n !== undefined)
  }, [pinnedIds, notes])

  // Get project name for a note
  const getProjectName = (note: Note): string | null => {
    if (note.project_id) {
      const project = projects.find(p => p.id === note.project_id)
      return project?.name || null
    }
    return null
  }

  // Handle unpin
  const handleUnpin = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    unpinNote(noteId)
    setPinnedIds(getPinnedNoteIds())
  }

  // Don't render if no pinned notes
  if (pinnedNotes.length === 0) {
    return null
  }

  return (
    <section className="pinned-notes mb-8">
      {/* Header */}
      <h2 className="text-sm font-medium text-nexus-text-muted uppercase tracking-wide mb-3 flex items-center gap-2">
        <Pin className="w-4 h-4" />
        Pinned
      </h2>

      {/* Pinned notes list */}
      <div className="space-y-2">
        {pinnedNotes.map((note) => {
          const projectName = getProjectName(note)

          return (
            <button
              key={note.id}
              onClick={() => onNoteClick(note.id)}
              className="w-full text-left px-4 py-3 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all group flex items-center gap-3"
            >
              {/* Pin icon */}
              <span className="p-2 rounded-lg bg-amber-500/10 text-amber-500 flex-shrink-0">
                <Pin className="w-4 h-4" />
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-nexus-text-primary truncate group-hover:text-amber-400 transition-colors">
                  {note.title || 'Untitled'}
                </div>
                {projectName && (
                  <div className="text-xs text-nexus-text-muted">
                    {projectName}
                  </div>
                )}
              </div>

              {/* Unpin button */}
              <button
                onClick={(e) => handleUnpin(note.id, e)}
                className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 text-nexus-text-muted hover:text-red-400 transition-all"
                title="Unpin"
              >
                <X className="w-4 h-4" />
              </button>
            </button>
          )
        })}
      </div>

      {/* Hint */}
      <p className="mt-2 text-xs text-nexus-text-muted/70">
        Pin notes from the editor toolbar (max 5)
      </p>
    </section>
  )
}
