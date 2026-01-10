import { useCallback, useState } from 'react'
import { Project, Note } from '../../types'
import { useAppViewStore, SIDEBAR_WIDTHS } from '../../store/useAppViewStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { IconBarMode } from './IconBarMode'
import { CompactListMode } from './CompactListMode'
import { CardViewMode } from './CardViewMode'
import { ResizeHandle } from './ResizeHandle'
import { PresetUpdateDialog } from '../PresetUpdateDialog'

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
  onPinProject?: (projectId: string) => void
  onUnpinProject?: (projectId: string) => void
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
  onPinProject,
  onUnpinProject,
  onRenameNote,
  onMoveNoteToProject,
  onDuplicateNote,
  onDeleteNote,
  onSearch,
  onDaily,
  onOpenSettings
}: MissionSidebarProps) {
  const { sidebarMode, sidebarWidth, setSidebarMode, setSidebarWidth } = useAppViewStore()
  const { settings, updateSetting } = useSettingsStore()
  const [presetDialogState, setPresetDialogState] = useState<{
    currentPreset: string
    currentWidth: number
    suggestedPreset: string
    suggestedWidth: number
  } | null>(null)

  // Phase 6: Map width to closest preset
  const getPresetFromWidth = useCallback((width: number): string => {
    if (width < 240) return 'narrow'
    if (width < 320) return 'medium'
    return 'wide'
  }, [])

  const getPresetWidth = useCallback((preset: string): number => {
    const widthMap: Record<string, number> = {
      'narrow': 200,
      'medium': 280,
      'wide': 360
    }
    return widthMap[preset] || 280
  }, [])

  // Handle resize drag
  const handleResize = useCallback((deltaX: number) => {
    const newWidth = sidebarWidth + deltaX
    setSidebarWidth(newWidth)
  }, [sidebarWidth, setSidebarWidth])

  // Phase 6: Handle resize end with preset update check
  const handleResizeEnd = useCallback(() => {
    const currentPreset = (settings['appearance.sidebarWidth'] as string) ?? 'medium'
    const suggestedPreset = getPresetFromWidth(sidebarWidth)

    // Check if preset should be updated
    if (currentPreset !== suggestedPreset) {
      // Check localStorage for auto-update preference
      const autoUpdate = localStorage.getItem('scribe:autoUpdatePreset')

      if (autoUpdate === 'true') {
        // Auto-update preset without dialog
        updateSetting('appearance.sidebarWidth', suggestedPreset)
        // Could show a toast notification here (Phase 6 spec)
      } else {
        // Show dialog to prompt user
        setPresetDialogState({
          currentPreset,
          currentWidth: sidebarWidth,
          suggestedPreset,
          suggestedWidth: getPresetWidth(suggestedPreset)
        })
      }
    }
  }, [sidebarWidth, settings, getPresetFromWidth, getPresetWidth, updateSetting])

  // Phase 6: Handle preset update from dialog
  const handlePresetUpdate = useCallback((dontAskAgain: boolean) => {
    if (presetDialogState) {
      // Update preset in Settings
      updateSetting('appearance.sidebarWidth', presetDialogState.suggestedPreset)

      // Save "don't ask again" preference to localStorage
      if (dontAskAgain) {
        localStorage.setItem('scribe:autoUpdatePreset', 'true')
      }

      // Close dialog
      setPresetDialogState(null)
    }
  }, [presetDialogState, updateSetting])

  // Phase 6: Handle skipping preset update
  const handlePresetSkip = useCallback(() => {
    setPresetDialogState(null)
  }, [])

  // Handle double-click reset to default width
  const handleReset = useCallback(() => {
    const defaultWidth = sidebarMode === 'compact'
      ? SIDEBAR_WIDTHS.compact.default
      : SIDEBAR_WIDTHS.card.default
    setSidebarWidth(defaultWidth)
  }, [sidebarMode, setSidebarWidth])

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
          onSelectNote={onSelectNote}
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
          onPinProject={onPinProject}
          onUnpinProject={onUnpinProject}
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
          onPinProject={onPinProject}
          onUnpinProject={onUnpinProject}
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
          onReset={handleReset}
        />
      )}

      {/* Phase 6: Preset Update Dialog */}
      {presetDialogState && (
        <PresetUpdateDialog
          currentPreset={presetDialogState.currentPreset}
          currentWidth={presetDialogState.currentWidth}
          suggestedPreset={presetDialogState.suggestedPreset}
          suggestedWidth={presetDialogState.suggestedWidth}
          onUpdate={handlePresetUpdate}
          onSkip={handlePresetSkip}
        />
      )}
    </aside>
  )
}

// Export for keyboard shortcut handler
export function cycleSidebarMode(): void {
  useAppViewStore.getState().cycleSidebarMode()
}
