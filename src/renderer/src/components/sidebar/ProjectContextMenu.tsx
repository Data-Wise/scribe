import { FileText, Edit3, Archive, Trash2, Pin, PinOff } from 'lucide-react'
import { SHORTCUTS } from '../../lib/shortcuts'
import { useEffect, useRef, useState } from 'react'
import { Project } from '../../types'

interface ProjectContextMenuProps {
  project: Project
  position: { x: number; y: number }
  onClose: () => void
  onNewNote: (projectId: string) => void
  onEditProject: (projectId: string) => void
  onArchiveProject: (projectId: string) => void
  onDeleteProject: (projectId: string) => void
  onPinProject?: (projectId: string) => void
  onUnpinProject?: (projectId: string) => void
  isPinned?: boolean
  isActive?: boolean  // Phase 4: Show active project header
}

export function ProjectContextMenu({
  project,
  position,
  onClose,
  onNewNote,
  onEditProject,
  onArchiveProject,
  onDeleteProject,
  onPinProject,
  onUnpinProject,
  isPinned = false,
  isActive = false
}: ProjectContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [adjustedPosition, setAdjustedPosition] = useState(position)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  // Adjust position to keep menu in viewport
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let { x, y } = position

      if (x + rect.width > viewportWidth) {
        x = viewportWidth - rect.width - 8
      }
      if (y + rect.height > viewportHeight) {
        y = viewportHeight - rect.height - 8
      }

      setAdjustedPosition({ x, y })
    }
  }, [position])

  const handleNewNote = () => {
    onNewNote(project.id)
    onClose()
  }

  const handleEdit = () => {
    onEditProject(project.id)
    onClose()
  }

  const handleArchive = () => {
    onArchiveProject(project.id)
    onClose()
  }

  const handleDelete = () => {
    onDeleteProject(project.id)
    onClose()
  }

  const handlePin = () => {
    if (onPinProject) {
      onPinProject(project.id)
    }
    onClose()
  }

  const handleUnpin = () => {
    if (onUnpinProject) {
      onUnpinProject(project.id)
    }
    onClose()
  }

  const isArchived = project.status === 'archive'

  return (
    <div
      ref={menuRef}
      className={`project-context-menu ${isActive ? 'active-project' : ''}`}
      style={{
        position: 'fixed',
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        zIndex: 9999
      }}
    >
      <div className="context-menu-content">
        {/* Phase 4: Active Project Header */}
        {isActive && (
          <>
            <div className="context-menu-header active-header">
              <span className="active-header-icon">●</span>
              <span>Active Project</span>
            </div>
            <div className="context-menu-divider" />
          </>
        )}

        <button className="context-menu-item" onClick={handleNewNote}>
          <FileText size={14} />
          <span>New Note</span>
          <span className="shortcut">{SHORTCUTS.newNote.label}</span>
        </button>

        <div className="context-menu-divider" />

        <button className="context-menu-item" onClick={handleEdit}>
          <Edit3 size={14} />
          <span>Edit Project</span>
        </button>

        {isPinned ? (
          <button className="context-menu-item" onClick={handleUnpin}>
            <PinOff size={14} />
            <span>Unpin from Sidebar</span>
          </button>
        ) : (
          <button className="context-menu-item" onClick={handlePin}>
            <Pin size={14} />
            <span>Pin to Sidebar</span>
          </button>
        )}

        <button className="context-menu-item" onClick={handleArchive}>
          <Archive size={14} />
          <span>{isArchived ? 'Unarchive' : 'Archive'}</span>
        </button>

        <div className="context-menu-divider" />

        <button className="context-menu-item danger" onClick={handleDelete}>
          <Trash2 size={14} />
          <span>Delete Project</span>
        </button>
      </div>
    </div>
  )
}
