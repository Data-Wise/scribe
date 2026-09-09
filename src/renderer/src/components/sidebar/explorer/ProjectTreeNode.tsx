import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react'
import { Project, Note } from '../../../types'
import { NoteTreeNode } from './NoteTreeNode'

/**
 * ProjectTreeNode - Expandable project row in the v1.17.0 Explorer tree.
 * Expansion state lives in useAppViewStore's explorerTreeState (keyed by
 * project ID), not local component state, so it persists across collapse/
 * re-expand of the whole panel.
 */

interface ProjectTreeNodeProps {
  project: Project
  notes: Note[]  // Pre-filtered to this project by ExplorerTree
  isExpanded: boolean
  currentProjectId: string | null
  onToggleNode: (projectId: string) => void
  onSelectProject: (projectId: string) => void
  onSelectNote: (noteId: string) => void
}

export function ProjectTreeNode({
  project,
  notes,
  isExpanded,
  currentProjectId,
  onToggleNode,
  onSelectProject,
  onSelectNote
}: ProjectTreeNodeProps) {
  const isActive = currentProjectId === project.id

  return (
    <div className="explorer-project-node">
      <button
        className={`explorer-project-row${isActive ? ' active' : ''}`}
        onClick={() => onSelectProject(project.id)}
        title={project.name}
      >
        <span
          className="explorer-project-toggle"
          role="button"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
          onClick={(e) => {
            e.stopPropagation()
            onToggleNode(project.id)
          }}
        >
          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
        {isExpanded ? <FolderOpen size={14} /> : <Folder size={14} />}
        <span className="explorer-project-name">{project.name}</span>
        {notes.length > 0 && (
          <span className="explorer-project-count">{notes.length}</span>
        )}
      </button>

      {isExpanded && (
        <div className="explorer-note-list">
          {notes.map(note => (
            <NoteTreeNode key={note.id} note={note} onSelectNote={onSelectNote} />
          ))}
        </div>
      )}
    </div>
  )
}
