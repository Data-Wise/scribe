import { useState, useRef, DragEvent } from 'react'
import { Note, Project } from '../../types'

/**
 * Drag-and-drop support for notes in the sidebar
 *
 * Notes can be dragged to:
 * - Projects (assign note to project)
 * - Inbox tab (move to inbox)
 * - Trash area (delete)
 */

export interface DragData {
  type: 'note'
  noteId: string
  noteTitle: string
  currentProjectId?: string
}

// Make data accessible during drag (stored globally for cross-component access)
let currentDragData: DragData | null = null

export function setDragData(data: DragData | null) {
  currentDragData = data
}

export function getDragData(): DragData | null {
  return currentDragData
}

// Hook for making an element draggable
export function useDraggableNote(
  note: Note,
  currentProjectId?: string
) {
  const [isDragging, setIsDragging] = useState(false)
  const dragImageRef = useRef<HTMLDivElement | null>(null)

  const handleDragStart = (e: DragEvent<HTMLElement>) => {
    const data: DragData = {
      type: 'note',
      noteId: note.id,
      noteTitle: note.title || 'Untitled',
      currentProjectId
    }

    // Set data for dataTransfer (for standard drag events)
    e.dataTransfer.setData('application/json', JSON.stringify(data))
    e.dataTransfer.effectAllowed = 'move'

    // Also store globally for cross-component access
    setDragData(data)

    // Create custom drag image
    const dragImage = document.createElement('div')
    dragImage.className = 'note-drag-preview'
    dragImage.textContent = note.title || 'Untitled'
    document.body.appendChild(dragImage)
    dragImageRef.current = dragImage

    e.dataTransfer.setDragImage(dragImage, 10, 10)

    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setDragData(null)

    // Clean up drag image
    if (dragImageRef.current) {
      document.body.removeChild(dragImageRef.current)
      dragImageRef.current = null
    }
  }

  return {
    isDragging,
    dragProps: {
      draggable: true,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
    }
  }
}

// Hook for making an element a drop target
export function useDropTarget(
  onDrop: (noteId: string, data: DragData) => void,
  canDrop?: (data: DragData) => boolean
) {
  const [isOver, setIsOver] = useState(false)
  const [canAccept, setCanAccept] = useState(false)

  const handleDragOver = (e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    const data = getDragData()

    if (data?.type === 'note') {
      const acceptable = canDrop ? canDrop(data) : true
      setCanAccept(acceptable)
      if (acceptable) {
        e.dataTransfer.dropEffect = 'move'
      } else {
        e.dataTransfer.dropEffect = 'none'
      }
    }
  }

  const handleDragEnter = (e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    setIsOver(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    // Only set isOver to false if leaving the actual target
    const relatedTarget = e.relatedTarget as Node | null
    if (!e.currentTarget.contains(relatedTarget)) {
      setIsOver(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    setIsOver(false)

    const data = getDragData()
    if (data?.type === 'note') {
      const acceptable = canDrop ? canDrop(data) : true
      if (acceptable) {
        onDrop(data.noteId, data)
      }
    }
  }

  return {
    isOver,
    canAccept,
    dropProps: {
      onDragOver: handleDragOver,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    }
  }
}

// Wrapper component for project drop targets
interface ProjectDropZoneProps {
  project: Project
  onAssignNote: (noteId: string) => void
  children: React.ReactNode
  className?: string
}

export function ProjectDropZone({
  project,
  onAssignNote,
  children,
  className = ''
}: ProjectDropZoneProps) {
  const { isOver, canAccept, dropProps } = useDropTarget(
    (noteId) => onAssignNote(noteId),
    (data) => data.currentProjectId !== project.id // Can't drop on same project
  )

  const dropClass = isOver
    ? canAccept
      ? 'drop-target-active'
      : 'drop-target-reject'
    : ''

  return (
    <div {...dropProps} className={`${className} ${dropClass}`}>
      {children}
    </div>
  )
}

// Wrapper component for inbox drop target
interface InboxDropZoneProps {
  onMoveToInbox: (noteId: string) => void
  children: React.ReactNode
  className?: string
}

export function InboxDropZone({
  onMoveToInbox,
  children,
  className = ''
}: InboxDropZoneProps) {
  const { isOver, canAccept, dropProps } = useDropTarget(
    (noteId) => onMoveToInbox(noteId),
    () => true // Always accept
  )

  const dropClass = isOver && canAccept ? 'drop-target-active' : ''

  return (
    <div {...dropProps} className={`${className} ${dropClass}`}>
      {children}
    </div>
  )
}
