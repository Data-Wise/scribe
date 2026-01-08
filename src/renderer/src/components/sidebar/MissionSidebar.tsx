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
  onNewNote: (projectId: string) => void
  // Context menu handlers
  onEditProject?: (projectId: string) => void
  onArchiveProject?: (projectId: string) => void
  onDeleteProject?: (projectId: string) => void
  onRenameNote?: (noteId: string) => void
  onMoveNoteToProject?: (noteId: string, projectId: string | null) => void
  onDuplicateNote?: (noteId: string) => void
  onDeleteNote?: (noteId: string) => void
  // Activity Bar handlers
  onSearch: () => void
  onDaily: () => void
  onOpenSettings: () => void
}

export function MissionSidebar({
  projects,
  notes,
  currentProjectId,
  onSelectProject,
  onSelectNote,
  onCreateProject,
  onNewNote,
  onEditProject,
  onArchiveProject,
  onDeleteProject,
  onRenameNote,
  onMoveNoteToProject,
  onDuplicateNote,
  onDeleteNote,
  onSearch,
  onDaily,
  onOpenSettings
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
      data-testid="left-sidebar"
    >
      {sidebarMode === 'icon' && (
        <IconBarMode
          projects={projects}
          notes={notes}
          currentProjectId={currentProjectId}
          onSelectProject={onSelectProject}
          onCreateProject={onCreateProject}
          onExpand={handleExpand}
          onSearch={onSearch}
          onDaily={onDaily}
          onSettings={onOpenSettings}
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
          onNewNote={onNewNote}
          onCollapse={handleCollapse}
          width={width}
          onEditProject={onEditProject}
          onArchiveProject={onArchiveProject}
          onDeleteProject={onDeleteProject}
          onRenameNote={onRenameNote}
          onMoveNoteToProject={onMoveNoteToProject}
          onDuplicateNote={onDuplicateNote}
          onDeleteNote={onDeleteNote}
          onOpenSettings={onOpenSettings}
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
          onNewNote={onNewNote}
          onCollapse={handleCollapse}
          width={width}
          onEditProject={onEditProject}
          onArchiveProject={onArchiveProject}
          onDeleteProject={onDeleteProject}
          onRenameNote={onRenameNote}
          onMoveNoteToProject={onMoveNoteToProject}
          onDuplicateNote={onDuplicateNote}
          onDeleteNote={onDeleteNote}
          onOpenSettings={onOpenSettings}
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
