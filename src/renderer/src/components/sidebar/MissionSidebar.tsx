import { useCallback, useState, useMemo } from 'react'
import { Project, Note } from '../../types'
import { useAppViewStore, SIDEBAR_WIDTHS } from '../../store/useAppViewStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { IconBar } from './IconBar'
import { ExpandedIconPanel } from './ExpandedIconPanel'
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
  // v1.16.0: Icon-Centric Expansion State
  const {
    expandedIcon,
    sidebarWidth,
    pinnedVaults,
    smartIcons,
    toggleIcon,
    setIconMode,
    collapseAll,
    setSidebarWidth
  } = useAppViewStore()

  const { settings, updateSetting } = useSettingsStore()
  const [presetDialogState, setPresetDialogState] = useState<{
    currentPreset: string
    currentWidth: number
    suggestedPreset: string
    suggestedWidth: number
  } | null>(null)

  // Compute current mode from expanded icon's preferredMode
  const currentMode = useMemo(() => {
    if (!expandedIcon) return null

    if (expandedIcon.type === 'vault') {
      const vault = pinnedVaults.find(v => v.id === expandedIcon.id)
      return vault?.preferredMode || 'compact'
    }
    const icon = smartIcons.find(i => i.id === expandedIcon.id)
    return icon?.preferredMode || 'compact'
  }, [expandedIcon, pinnedVaults, smartIcons])

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

  // Toggle mode for currently expanded icon
  const handleToggleMode = useCallback(() => {
    if (!expandedIcon || !currentMode) return

    const newMode = currentMode === 'compact' ? 'card' : 'compact'
    setIconMode(expandedIcon.type, expandedIcon.id, newMode)
  }, [expandedIcon, currentMode, setIconMode])

  // Handle double-click reset to default width
  const handleReset = useCallback(() => {
    if (!currentMode) return
    const defaultWidth = currentMode === 'compact'
      ? SIDEBAR_WIDTHS.compact.default
      : SIDEBAR_WIDTHS.card.default
    setSidebarWidth(defaultWidth)
  }, [currentMode, setSidebarWidth])

  // Get current width: 48px when collapsed, sidebarWidth when expanded
  const width = expandedIcon ? sidebarWidth : SIDEBAR_WIDTHS.icon
  const canResize = expandedIcon !== null

  return (
    <aside
      className="mission-sidebar icon-centric-mode"
      style={{ width }}
      data-mode={expandedIcon ? currentMode : 'icon'}
      data-testid="left-sidebar"
    >
      {/* Icon bar - always visible */}
      <IconBar
        projects={projects}
        notes={notes}
        expandedIcon={expandedIcon}
        onToggleVault={(id) => {
          // If this vault is already expanded, we're collapsing — don't update project
          const isCollapsing = expandedIcon?.type === 'vault' && expandedIcon?.id === id
          toggleIcon('vault', id)
          if (!isCollapsing) {
            // Expanding a vault: update currentProjectId so breadcrumb + search scope follow
            onSelectProject(id === 'inbox' ? null : id)
          }
        }}
        onToggleSmartIcon={(id) => toggleIcon('smart', id)}
        onSearch={onSearch}
        onDaily={onDaily}
        onSettings={onOpenSettings}
        onSelectNote={onSelectNote}
        onCreateProject={onCreateProject}
        onEditProject={onEditProject}
        onArchiveProject={onArchiveProject}
        onDeleteProject={onDeleteProject}
        onPinProject={onPinProject}
        onUnpinProject={onUnpinProject}
        onNewNote={onNewNote}
      />

      {/* Expanded panel - conditional */}
      {expandedIcon && currentMode && (
        <ExpandedIconPanel
          projects={projects}
          notes={notes}
          expandedIcon={expandedIcon}
          currentProjectId={currentProjectId}
          mode={currentMode}
          width={width}
          onToggleMode={handleToggleMode}
          onClose={collapseAll}
          onSelectProject={onSelectProject}
          onSelectNote={onSelectNote}
          onNewNote={onNewNote}
          onCreateProject={onCreateProject}
          onEditProject={onEditProject}
          onArchiveProject={onArchiveProject}
          onDeleteProject={onDeleteProject}
          onPinProject={onPinProject}
          onUnpinProject={onUnpinProject}
          onRenameNote={onRenameNote}
          onMoveNoteToProject={onMoveNoteToProject}
          onDuplicateNote={onDuplicateNote}
          onDeleteNote={onDeleteNote}
        />
      )}

      {/* Resize handle - only when expanded */}
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
