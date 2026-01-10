import { useMemo } from 'react'
import { LayoutGrid, LayoutList, X } from 'lucide-react'
import { Project, Note, ExpandedIconType, SmartIconId } from '../../types'
import { CompactListView } from './CompactListView'
import { CardGridView } from './CardGridView'
import { useAppViewStore } from '../../store/useAppViewStore'

/**
 * ExpandedIconPanel - Unified content renderer for icon expansion
 *
 * v1.16.0 Icon-Centric Expansion:
 * - Shows content based on expandedIcon type (vault/smart)
 * - Delegates to CompactListView or CardGridView based on mode
 * - Provides mode toggle and close button
 */

interface ExpandedIconPanelProps {
  // Data
  projects: Project[]
  notes: Note[]

  // Expansion state
  expandedIcon: ExpandedIconType
  mode: 'compact' | 'card'
  width: number

  // Actions
  onToggleMode: () => void
  onClose: () => void
  onSelectProject: (id: string | null) => void
  onSelectNote: (id: string) => void
  onNewNote: (projectId: string) => void
  onCreateProject?: () => void

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
}

export function ExpandedIconPanel({
  projects,
  notes,
  expandedIcon,
  mode,
  width,
  onToggleMode,
  onClose,
  onSelectProject,
  onSelectNote,
  onNewNote,
  onCreateProject,
  onEditProject,
  onArchiveProject,
  onDeleteProject,
  onPinProject,
  onUnpinProject,
  onRenameNote,
  onMoveNoteToProject,
  onDuplicateNote,
  onDeleteNote
}: ExpandedIconPanelProps) {
  const smartIcons = useAppViewStore(state => state.smartIcons)

  // Determine content based on expandedIcon type
  const { label, showInboxNotes, filteredProjects, currentProjectId } = useMemo(() => {
    if (!expandedIcon) {
      return {
        label: '',
        showInboxNotes: false,
        filteredProjects: [],
        currentProjectId: null
      }
    }

    if (expandedIcon.type === 'vault') {
      if (expandedIcon.id === 'inbox') {
        // Inbox: Show unassigned notes
        return {
          label: 'Inbox',
          showInboxNotes: true,
          filteredProjects: [],
          currentProjectId: null
        }
      }
      // Pinned project: Show all projects with this one selected
      return {
        label: projects.find(p => p.id === expandedIcon.id)?.name || 'Project',
        showInboxNotes: false,
        filteredProjects: projects,
        currentProjectId: expandedIcon.id
      }
    }

    // Smart icon: Show filtered projects by type
    const smartIcon = smartIcons.find(i => i.id === expandedIcon.id)
    const filtered = projects.filter(p => p.type === smartIcon?.projectType)
    return {
      label: smartIcon?.label || 'Projects',
      showInboxNotes: false,
      filteredProjects: filtered,
      currentProjectId: null
    }
  }, [expandedIcon, projects, smartIcons])

  if (!expandedIcon) return null

  // Panel width = sidebar width - icon bar width
  const panelWidth = width - 48

  return (
    <div className="expanded-icon-panel" style={{ width: panelWidth }}>
      {/* Header with mode toggle and close */}
      <div className="panel-header">
        <h3 className="panel-title">{label}</h3>
        <div className="panel-header-actions">
          <button
            className="panel-action-btn"
            onClick={onToggleMode}
            title={`Switch to ${mode === 'compact' ? 'card' : 'compact'} view`}
            aria-label={`Switch to ${mode === 'compact' ? 'card' : 'compact'} view`}
          >
            {mode === 'compact' ? <LayoutGrid size={16} /> : <LayoutList size={16} />}
          </button>
          <button
            className="panel-action-btn"
            onClick={onClose}
            title="Collapse"
            aria-label="Collapse panel"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Render based on mode */}
      <div className="panel-content">
        {mode === 'compact' ? (
          <CompactListView
            projects={filteredProjects}
            notes={notes}
            showInboxNotes={showInboxNotes}
            currentProjectId={currentProjectId}
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
        ) : (
          <CardGridView
            projects={filteredProjects}
            notes={notes}
            showInboxNotes={showInboxNotes}
            currentProjectId={currentProjectId}
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
      </div>
    </div>
  )
}
