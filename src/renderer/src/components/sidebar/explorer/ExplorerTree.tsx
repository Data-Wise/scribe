import { useMemo } from 'react'
import { FileText, FolderTree } from 'lucide-react'
import { Project, Note, ProjectStatus } from '../../../types'
import { ProjectTreeNode } from './ProjectTreeNode'
import { NoteTreeNode } from './NoteTreeNode'
import { EmptyState } from '../EmptyState'

/**
 * ExplorerTree - v1.17.0 Explorer tab tree view.
 *
 * Two render modes, matching CompactListView/CardGridView's own
 * showInboxNotes convention:
 * - Inbox vault: flat list of unassigned notes (no project grouping)
 * - Otherwise: projects grouped by status (Active/Planning/Complete),
 *   each expandable to reveal its notes
 *
 * Archived projects are excluded, matching CompactListView's own filter
 * (`(p.status || 'active') !== 'archive'`) - the spec's Active/Paused/
 * Complete mockup groups don't map to this app's actual ProjectStatus
 * enum ('active' | 'planning' | 'complete' | 'archive'), so this uses
 * the real values instead of inventing a 'paused' status.
 */

interface ExplorerTreeProps {
  projects: Project[]
  notes: Note[]
  showInboxNotes: boolean
  currentProjectId: string | null
  expandedNodes: Set<string>
  onToggleNode: (projectId: string) => void
  onSelectProject: (projectId: string) => void
  onSelectNote: (noteId: string) => void
}

const STATUS_GROUPS: Array<{ status: ProjectStatus; label: string }> = [
  { status: 'active', label: 'Active' },
  { status: 'planning', label: 'Planning' },
  { status: 'complete', label: 'Complete' }
]

export function ExplorerTree({
  projects,
  notes,
  showInboxNotes,
  currentProjectId,
  expandedNodes,
  onToggleNode,
  onSelectProject,
  onSelectNote
}: ExplorerTreeProps) {
  const inboxNotes = useMemo(() => {
    return notes
      .filter(n => !n.deleted_at && !n.project_id)
      .sort((a, b) => b.updated_at - a.updated_at)
  }, [notes])

  const groupedProjects = useMemo(() => {
    const visible = projects.filter(p => (p.status || 'active') !== 'archive')
    return STATUS_GROUPS.map(({ status, label }) => ({
      status,
      label,
      projects: visible.filter(p => (p.status || 'active') === status)
    })).filter(group => group.projects.length > 0)
  }, [projects])

  const notesByProject = useMemo(() => {
    const map = new Map<string, Note[]>()
    for (const note of notes) {
      if (note.deleted_at || !note.project_id) continue
      const existing = map.get(note.project_id) || []
      existing.push(note)
      map.set(note.project_id, existing)
    }
    for (const list of map.values()) {
      list.sort((a, b) => b.updated_at - a.updated_at)
    }
    return map
  }, [notes])

  if (showInboxNotes) {
    return (
      <div className="explorer-tree" role="tree" aria-label="Inbox notes">
        {inboxNotes.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-12 h-12" />}
            title="No unassigned notes"
            description="Notes you create without a project will appear here"
          />
        ) : (
          inboxNotes.map(note => (
            <NoteTreeNode key={note.id} note={note} onSelectNote={onSelectNote} />
          ))
        )}
      </div>
    )
  }

  if (groupedProjects.length === 0) {
    return (
      <EmptyState
        icon={<FolderTree className="w-12 h-12" />}
        title="No projects yet"
        description="Projects you create will appear here, grouped by status"
      />
    )
  }

  return (
    <div className="explorer-tree" role="tree" aria-label="Project tree">
      {groupedProjects.map(({ status, label, projects: groupProjects }) => (
        <div key={status} className="explorer-status-group">
          <div className="explorer-status-header">
            {label}
            <span className="explorer-status-count">{groupProjects.length}</span>
          </div>
          {groupProjects.map(project => (
            <ProjectTreeNode
              key={project.id}
              project={project}
              notes={notesByProject.get(project.id) || []}
              isExpanded={expandedNodes.has(project.id)}
              currentProjectId={currentProjectId}
              onToggleNode={onToggleNode}
              onSelectProject={onSelectProject}
              onSelectNote={onSelectNote}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
