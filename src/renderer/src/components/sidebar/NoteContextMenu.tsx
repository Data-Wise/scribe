import { useState, useEffect, useRef } from 'react'
import { FolderKanban, Trash2, ArrowRightFromLine, Check } from 'lucide-react'
import { Project } from '../../types'

/**
 * NoteContextMenu - Right-click context menu for notes
 *
 * Provides actions like:
 * - Assign to project
 * - Move to inbox/notes
 * - Delete
 */

interface NoteContextMenuProps {
  x: number
  y: number
  noteId: string
  currentProjectId?: string
  projects: Project[]
  onClose: () => void
  onAssignToProject: (noteId: string, projectId: string | null) => void
  onMoveToInbox?: (noteId: string) => void
  onMoveToNotes?: (noteId: string) => void
  onDelete?: (noteId: string) => void
}

export function NoteContextMenu({
  x,
  y,
  noteId,
  currentProjectId,
  projects,
  onClose,
  onAssignToProject,
  onMoveToInbox,
  onMoveToNotes,
  onDelete
}: NoteContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [showProjectSubmenu, setShowProjectSubmenu] = useState(false)
  const [submenuPosition, setSubmenuPosition] = useState<'right' | 'left'>('right')

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  // Adjust position to stay within viewport
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Adjust horizontal position
      if (rect.right > viewportWidth) {
        menuRef.current.style.left = `${x - rect.width}px`
        setSubmenuPosition('left')
      }

      // Adjust vertical position
      if (rect.bottom > viewportHeight) {
        menuRef.current.style.top = `${y - rect.height}px`
      }
    }
  }, [x, y])

  // Filter out archived projects
  const activeProjects = projects.filter(p => p.status !== 'archive')

  return (
    <div
      ref={menuRef}
      className="note-context-menu"
      style={{ left: x, top: y }}
    >
      {/* Assign to Project submenu */}
      <div
        className="context-menu-item has-submenu"
        onMouseEnter={() => setShowProjectSubmenu(true)}
        onMouseLeave={() => setShowProjectSubmenu(false)}
      >
        <FolderKanban size={14} />
        <span>Assign to Project</span>
        <span className="submenu-arrow">▶</span>

        {showProjectSubmenu && (
          <div className={`context-submenu ${submenuPosition}`}>
            {/* None option (remove from project) */}
            <button
              className={`submenu-item ${!currentProjectId ? 'active' : ''}`}
              onClick={() => {
                onAssignToProject(noteId, null)
                onClose()
              }}
            >
              <span className="submenu-check">
                {!currentProjectId && <Check size={12} />}
              </span>
              <span>None</span>
            </button>

            {activeProjects.length > 0 && <div className="submenu-divider" />}

            {/* Project options */}
            {activeProjects.map(project => (
              <button
                key={project.id}
                className={`submenu-item ${currentProjectId === project.id ? 'active' : ''}`}
                onClick={() => {
                  onAssignToProject(noteId, project.id)
                  onClose()
                }}
              >
                <span className="submenu-check">
                  {currentProjectId === project.id && <Check size={12} />}
                </span>
                <span
                  className="project-color-dot"
                  style={{ backgroundColor: project.color || '#8b5cf6' }}
                />
                <span className="project-name">{project.name}</span>
              </button>
            ))}

            {activeProjects.length === 0 && (
              <div className="submenu-empty">No projects</div>
            )}
          </div>
        )}
      </div>

      <div className="context-menu-divider" />

      {/* Move to Inbox */}
      {onMoveToInbox && (
        <button
          className="context-menu-item"
          onClick={() => {
            onMoveToInbox(noteId)
            onClose()
          }}
        >
          <ArrowRightFromLine size={14} />
          <span>Move to Inbox</span>
        </button>
      )}

      {/* Move to Notes */}
      {onMoveToNotes && (
        <button
          className="context-menu-item"
          onClick={() => {
            onMoveToNotes(noteId)
            onClose()
          }}
        >
          <ArrowRightFromLine size={14} />
          <span>Move to Notes</span>
        </button>
      )}

      <div className="context-menu-divider" />

      {/* Delete */}
      {onDelete && (
        <button
          className="context-menu-item danger"
          onClick={() => {
            onDelete(noteId)
            onClose()
          }}
        >
          <Trash2 size={14} />
          <span>Delete</span>
        </button>
      )}
    </div>
  )
}

// Hook for managing context menu state
export function useNoteContextMenu() {
  const [contextMenu, setContextMenu] = useState<{
    noteId: string
    x: number
    y: number
    currentProjectId?: string
  } | null>(null)

  const showContextMenu = (
    e: React.MouseEvent,
    noteId: string,
    currentProjectId?: string
  ) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      noteId,
      x: e.clientX,
      y: e.clientY,
      currentProjectId
    })
  }

  const hideContextMenu = () => {
    setContextMenu(null)
  }

  return { contextMenu, showContextMenu, hideContextMenu }
}
