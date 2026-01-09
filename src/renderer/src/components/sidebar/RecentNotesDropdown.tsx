import { FileText, Clock, X } from 'lucide-react'
import { RecentNote } from '../../store/useAppViewStore'
import { useEffect, useRef } from 'react'

interface RecentNotesDropdownProps {
  isOpen: boolean
  onClose: () => void
  recentNotes: RecentNote[]
  onSelectNote: (noteId: string) => void
  onClearAll: () => void
}

/**
 * Format relative time for recent notes
 * "Just now", "5m ago", "2h ago", "3d ago"
 */
function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

/**
 * RecentNotesDropdown - Shows last 10 opened notes
 * Appears above ActivityBar when Recent Notes button is clicked
 */
export function RecentNotesDropdown({
  isOpen,
  onClose,
  recentNotes,
  onSelectNote,
  onClearAll
}: RecentNotesDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="recent-notes-dropdown"
      data-testid="recent-notes-dropdown"
    >
      {/* Header */}
      <div className="dropdown-header">
        <div className="flex items-center gap-2">
          <Clock size={14} />
          <h3>Recent Notes</h3>
        </div>
        {recentNotes.length > 0 && (
          <button
            onClick={onClearAll}
            className="clear-btn"
            title="Clear all recent notes"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="dropdown-content">
        {recentNotes.length === 0 ? (
          <div className="empty-state">
            <Clock size={32} className="empty-icon" />
            <p className="empty-text">No recent notes</p>
          </div>
        ) : (
          recentNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => {
                onSelectNote(note.id)
                onClose()
              }}
              className="recent-note-item"
              data-testid={`recent-note-${note.id}`}
            >
              <FileText size={14} className="note-icon" />
              <div className="note-info">
                <div className="note-title">{note.title}</div>
                <div className="note-time">{formatRelativeTime(note.openedAt)}</div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
