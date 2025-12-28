import { useCallback } from 'react'
import { Project, Note } from '../../types'
import { useAppViewStore, SIDEBAR_WIDTHS } from '../../store/useAppViewStore'
import { IconBarMode } from './IconBarMode'
import { CompactListMode } from './CompactListMode'
import { CardViewMode } from './CardViewMode'
import { ResizeHandle } from './ResizeHandle'

interface MissionSidebarProps {
  projects: Project[]
  notes: Note[]
  currentProjectId: string | null
  onSelectProject: (id: string | null) => void
  onSelectNote: (id: string) => void
  onCreateProject: () => void
  onOpenQuickCapture?: () => void
  onMarkInboxProcessed?: (noteId: string) => void
  onDeleteNote?: (noteId: string) => void
  onAssignNoteToProject?: (noteId: string, projectId: string | null) => void
  onMoveNoteToInbox?: (noteId: string) => void
  onOpenFullGraph?: () => void
}

export function MissionSidebar({
  projects,
  notes,
  currentProjectId,
  onSelectProject,
  onSelectNote,
  onCreateProject,
  onOpenQuickCapture,
  onMarkInboxProcessed,
  onDeleteNote,
  onAssignNoteToProject,
  onMoveNoteToInbox,
  onOpenFullGraph
}: MissionSidebarProps) {
  const { sidebarMode, sidebarWidth, setSidebarMode, setSidebarWidth } = useAppViewStore()

  // Handle resize drag
  const handleResize = useCallback((deltaX: number) => {
    const newWidth = sidebarWidth + deltaX
    setSidebarWidth(newWidth)
  }, [sidebarWidth, setSidebarWidth])

  const handleResizeEnd = useCallback(() => {
    // Width is already saved in setSidebarWidth
  }, [])

  // Expand from icon to compact
  const handleExpand = useCallback(() => {
    setSidebarMode('compact')
  }, [setSidebarMode])

  // Collapse from compact to icon
  const handleCollapse = useCallback(() => {
    setSidebarMode('icon')
  }, [setSidebarMode])

  // Get current width based on mode
  const getCurrentWidth = (): number => {
    if (sidebarMode === 'icon') {
      return SIDEBAR_WIDTHS.icon
    }
    return sidebarWidth
  }

  const width = getCurrentWidth()
  const canResize = sidebarMode === 'compact' || sidebarMode === 'card'

  return (
    <aside
      className={`mission-sidebar mode-${sidebarMode}`}
      style={{ width }}
      data-mode={sidebarMode}
    >
      {sidebarMode === 'icon' && (
        <IconBarMode
          projects={projects}
          notes={notes}
          currentProjectId={currentProjectId}
          onSelectProject={onSelectProject}
          onCreateProject={onCreateProject}
          onExpand={handleExpand}
        />
      )}

      {sidebarMode === 'compact' && (
        <CompactListMode
          projects={projects}
          notes={notes}
          currentProjectId={currentProjectId}
          onSelectProject={onSelectProject}
          onSelectNote={onSelectNote}
          onCreateProject={onCreateProject}
          onCollapse={handleCollapse}
          onOpenQuickCapture={onOpenQuickCapture}
          onMarkInboxProcessed={onMarkInboxProcessed}
          onDeleteNote={onDeleteNote}
          onAssignNoteToProject={onAssignNoteToProject}
          onMoveNoteToInbox={onMoveNoteToInbox}
          onOpenFullGraph={onOpenFullGraph}
          width={width}
        />
      )}

      {sidebarMode === 'card' && (
        <CardViewMode
          projects={projects}
          notes={notes}
          currentProjectId={currentProjectId}
          onSelectProject={onSelectProject}
          onSelectNote={onSelectNote}
          onCreateProject={onCreateProject}
          onCollapse={handleCollapse}
          onOpenQuickCapture={onOpenQuickCapture}
          onMarkInboxProcessed={onMarkInboxProcessed}
          onDeleteNote={onDeleteNote}
          onAssignNoteToProject={onAssignNoteToProject}
          onMoveNoteToInbox={onMoveNoteToInbox}
          onOpenFullGraph={onOpenFullGraph}
          width={width}
        />
      )}

      {canResize && (
        <ResizeHandle
          onResize={handleResize}
          onResizeEnd={handleResizeEnd}
        />
      )}
    </aside>
  )
}

// Export for keyboard shortcut handler
export function cycleSidebarMode(): void {
  useAppViewStore.getState().cycleSidebarMode()
}
