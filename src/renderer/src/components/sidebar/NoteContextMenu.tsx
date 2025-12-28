import { FileText, Edit3, FolderInput, Copy, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Note, Project } from '../../types'

interface NoteContextMenuProps {
  note: Note
  projects: Project[]
  position: { x: number; y: number }
  onClose: () => void
  onOpenNote: (noteId: string) => void
  onRenameNote: (noteId: string) => void
  onMoveToProject: (noteId: string, projectId: string | null) => void
  onDuplicateNote: (noteId: string) => void
  onDeleteNote: (noteId: string) => void
}

export function NoteContextMenu({
  note,
  projects,
  position,
  onClose,
  onOpenNote,
  onRenameNote,
  onMoveToProject,
  onDuplicateNote,
  onDeleteNote
}: NoteContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [adjustedPosition, setAdjustedPosition] = useState(position)
  const [showMoveSubmenu, setShowMoveSubmenu] = useState(false)

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

  const handleOpen = () => {
    onOpenNote(note.id)
    onClose()
  }

  const handleRename = () => {
    onRenameNote(note.id)
    onClose()
  }

  const handleMoveToProject = (projectId: string | null) => {
    onMoveToProject(note.id, projectId)
    onClose()
  }

  const handleDuplicate = () => {
    onDuplicateNote(note.id)
    onClose()
  }

  const handleDelete = () => {
    onDeleteNote(note.id)
    onClose()
  }

  // Filter out current project from list
  const availableProjects = projects.filter(p =>
    p.id !== note.project_id && (p.status || 'active') !== 'archive'
  )

  return (
    <div
      ref={menuRef}
      className="note-context-menu"
      style={{
        position: 'fixed',
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        zIndex: 9999
      }}
    >
      <div className="context-menu-content">
        <button className="context-menu-item" onClick={handleOpen}>
          <FileText size={14} />
          <span>Open Note</span>
          <span className="shortcut">Enter</span>
        </button>

        <button className="context-menu-item" onClick={handleRename}>
          <Edit3 size={14} />
          <span>Rename</span>
        </button>

        <div className="context-menu-divider" />

        {/* Move to Project submenu */}
        <div
          className="context-menu-item-wrapper"
          onMouseEnter={() => setShowMoveSubmenu(true)}
          onMouseLeave={() => setShowMoveSubmenu(false)}
          style={{ position: 'relative' }}
        >
          <button className="context-menu-item" style={{ width: '100%' }}>
            <FolderInput size={14} />
            <span>Move to Project</span>
            <span style={{ marginLeft: 'auto' }}>▶</span>
          </button>

          {showMoveSubmenu && (
            <div
              className="context-menu-content"
              style={{
                position: 'absolute',
                left: '100%',
                top: 0,
                marginLeft: 4,
                minWidth: 160
              }}
            >
              {/* No Project option */}
              <button
                className="context-menu-item"
                onClick={() => handleMoveToProject(null)}
                style={{ opacity: note.project_id === null ? 0.5 : 1 }}
                disabled={note.project_id === null}
              >
                <span style={{ width: 14 }}>—</span>
                <span>No Project</span>
              </button>

              {availableProjects.length > 0 && <div className="context-menu-divider" />}

              {availableProjects.map(project => (
                <button
                  key={project.id}
                  className="context-menu-item"
                  onClick={() => handleMoveToProject(project.id)}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: project.color || '#3b82f6',
                      flexShrink: 0
                    }}
                  />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {project.name}
                  </span>
                </button>
              ))}

              {availableProjects.length === 0 && note.project_id !== null && (
                <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--nexus-text-muted)' }}>
                  No other projects
                </div>
              )}
            </div>
          )}
        </div>

        <button className="context-menu-item" onClick={handleDuplicate}>
          <Copy size={14} />
          <span>Duplicate</span>
        </button>

        <div className="context-menu-divider" />

        <button className="context-menu-item danger" onClick={handleDelete}>
          <Trash2 size={14} />
          <span>Delete Note</span>
        </button>
      </div>
    </div>
  )
}
