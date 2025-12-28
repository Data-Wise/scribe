import { useState, useEffect, useRef } from 'react'
import { Edit2, Archive, ArchiveRestore, Trash2, Star, StarOff, FilePlus } from 'lucide-react'
import { Project } from '../../types'

/**
 * ProjectContextMenu - Right-click context menu for projects
 *
 * Provides actions like:
 * - Edit project
 * - Set as active / Remove active
 * - Archive / Unarchive
 * - Delete project
 */

interface ProjectContextMenuProps {
  x: number
  y: number
  project: Project
  isCurrentProject: boolean
  onClose: () => void
  onNewNote?: (projectId: string) => void
  onEdit?: (projectId: string) => void
  onSetActive?: (projectId: string | null) => void
  onArchive?: (projectId: string) => void
  onUnarchive?: (projectId: string) => void
  onDelete?: (projectId: string) => void
}

export function ProjectContextMenu({
  x,
  y,
  project,
  isCurrentProject,
  onClose,
  onNewNote,
  onEdit,
  onSetActive,
  onArchive,
  onUnarchive,
  onDelete
}: ProjectContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const isArchived = project.status === 'archive'

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
      }

      // Adjust vertical position
      if (rect.bottom > viewportHeight) {
        menuRef.current.style.top = `${y - rect.height}px`
      }
    }
  }, [x, y])

  return (
    <div
      ref={menuRef}
      className="project-context-menu"
      style={{ left: x, top: y }}
    >
      {/* New Note in Project */}
      {onNewNote && (
        <button
          className="context-menu-item"
          onClick={() => {
            onNewNote(project.id)
            onClose()
          }}
        >
          <FilePlus size={14} />
          <span>New Note</span>
        </button>
      )}

      {onNewNote && <div className="context-menu-divider" />}

      {/* Edit Project */}
      {onEdit && (
        <button
          className="context-menu-item"
          onClick={() => {
            onEdit(project.id)
            onClose()
          }}
        >
          <Edit2 size={14} />
          <span>Edit Project</span>
        </button>
      )}

      {/* Set as Active / Remove Active */}
      {onSetActive && (
        <button
          className="context-menu-item"
          onClick={() => {
            onSetActive(isCurrentProject ? null : project.id)
            onClose()
          }}
        >
          {isCurrentProject ? (
            <>
              <StarOff size={14} />
              <span>Remove Active</span>
            </>
          ) : (
            <>
              <Star size={14} />
              <span>Set as Active</span>
            </>
          )}
        </button>
      )}

      <div className="context-menu-divider" />

      {/* Archive / Unarchive */}
      {isArchived && onUnarchive && (
        <button
          className="context-menu-item"
          onClick={() => {
            onUnarchive(project.id)
            onClose()
          }}
        >
          <ArchiveRestore size={14} />
          <span>Unarchive</span>
        </button>
      )}

      {!isArchived && onArchive && (
        <button
          className="context-menu-item"
          onClick={() => {
            onArchive(project.id)
            onClose()
          }}
        >
          <Archive size={14} />
          <span>Archive</span>
        </button>
      )}

      <div className="context-menu-divider" />

      {/* Delete */}
      {onDelete && (
        <button
          className="context-menu-item danger"
          onClick={() => {
            onDelete(project.id)
            onClose()
          }}
        >
          <Trash2 size={14} />
          <span>Delete Project</span>
        </button>
      )}
    </div>
  )
}

// Hook for managing project context menu state
export function useProjectContextMenu() {
  const [contextMenu, setContextMenu] = useState<{
    project: Project
    x: number
    y: number
  } | null>(null)

  const showContextMenu = (
    e: React.MouseEvent,
    project: Project
  ) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      project,
      x: e.clientX,
      y: e.clientY
    })
  }

  const hideContextMenu = () => {
    setContextMenu(null)
  }

  return { contextMenu, showContextMenu, hideContextMenu }
}
