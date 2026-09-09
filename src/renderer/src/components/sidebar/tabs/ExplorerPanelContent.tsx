import { Project, Note } from '../../../types'
import { ExplorerTree } from '../explorer/ExplorerTree'
import { useAppViewStore } from '../../../store/useAppViewStore'

/**
 * ExplorerPanelContent - v1.17.0 Explorer tab content. Connects ExplorerTree
 * (presentational) to the store's explorerTreeState + tree actions.
 */

interface ExplorerPanelContentProps {
  projects: Project[]
  notes: Note[]
  showInboxNotes: boolean
  currentProjectId: string | null
  onSelectProject: (projectId: string) => void
  onSelectNote: (noteId: string) => void
}

export function ExplorerPanelContent({
  projects,
  notes,
  showInboxNotes,
  currentProjectId,
  onSelectProject,
  onSelectNote
}: ExplorerPanelContentProps) {
  const expandedNodes = useAppViewStore(state => state.explorerTreeState.expandedNodes)
  const toggleExplorerNode = useAppViewStore(state => state.toggleExplorerNode)

  return (
    <ExplorerTree
      projects={projects}
      notes={notes}
      showInboxNotes={showInboxNotes}
      currentProjectId={currentProjectId}
      expandedNodes={expandedNodes}
      onToggleNode={toggleExplorerNode}
      onSelectProject={onSelectProject}
      onSelectNote={onSelectNote}
    />
  )
}
