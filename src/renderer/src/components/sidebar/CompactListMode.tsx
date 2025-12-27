import { useState, useMemo } from 'react'
import { Menu, Plus, Search, Clock, FileText, ChevronRight } from 'lucide-react'
import { Project, Note } from '../../types'
import { StatusDot } from './StatusDot'

interface CompactListModeProps {
  projects: Project[]
  notes: Note[]
  currentProjectId: string | null
  onSelectProject: (id: string) => void
  onSelectNote: (id: string) => void
  onCreateProject: () => void
  onCollapse: () => void
  width: number
}

export function CompactListMode({
  projects,
  notes,
  currentProjectId,
  onSelectProject,
  onSelectNote,
  onCreateProject,
  onCollapse,
  width
}: CompactListModeProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter projects by search (treat undefined status as 'active')
  const filteredProjects = useMemo(() => {
    const activeProjects = projects.filter(p => (p.status || 'active') !== 'archive')
    if (!searchQuery.trim()) return activeProjects

    return activeProjects.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [projects, searchQuery])

  // Sort projects: current first, then by updated_at
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (a.id === currentProjectId) return -1
    if (b.id === currentProjectId) return 1
    return b.updated_at - a.updated_at
  })

  // Get recent notes (last 5)
  const recentNotes = useMemo(() => {
    return [...notes]
      .filter(n => !n.deleted_at)
      .sort((a, b) => b.updated_at - a.updated_at)
      .slice(0, 5)
  }, [notes])

  // Compute project stats
  const projectStats = useMemo(() => {
    const stats: Record<string, { noteCount: number; wordCount: number }> = {}
    projects.forEach(p => {
      stats[p.id] = { noteCount: 0, wordCount: 0 }
    })
    notes.filter(n => !n.deleted_at).forEach(note => {
      const projectId = note.properties?.project_id?.value as string | undefined
      if (projectId && stats[projectId]) {
        stats[projectId].noteCount++
        stats[projectId].wordCount += countWords(note.content)
      }
    })
    return stats
  }, [projects, notes])

  return (
    <div className="mission-sidebar-compact" style={{ width }}>
      {/* Header */}
      <div className="sidebar-header">
        <button
          className="sidebar-toggle-btn"
          onClick={onCollapse}
          title="Collapse sidebar (⌘0)"
        >
          <Menu size={16} />
        </button>
        <h3 className="sidebar-title">
          Projects <span className="count">({projects.filter(p => (p.status || 'active') !== 'archive').length})</span>
        </h3>
      </div>

      {/* Search (if >5 projects) */}
      {projects.length > 5 && (
        <div className="sidebar-search">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Find project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      )}

      {/* Project list */}
      <div className="project-list-compact">
        {sortedProjects.map(project => {
          const stats = projectStats[project.id]
          return (
            <CompactProjectItem
              key={project.id}
              project={project}
              isActive={project.id === currentProjectId}
              noteCount={stats?.noteCount || 0}
              onClick={() => onSelectProject(project.id)}
            />
          )
        })}

        {sortedProjects.length === 0 && searchQuery && (
          <div className="no-results">No projects match "{searchQuery}"</div>
        )}
      </div>

      {/* Recent notes section */}
      {recentNotes.length > 0 && (
        <div className="sidebar-section">
          <h4 className="section-header">
            <Clock size={12} />
            <span>Recent</span>
          </h4>
          <div className="recent-notes-list">
            {recentNotes.map(note => (
              <button
                key={note.id}
                className="recent-note-item"
                onClick={() => onSelectNote(note.id)}
              >
                <FileText size={12} className="note-icon" />
                <span className="note-title">{note.title || 'Untitled'}</span>
                <span className="note-time">{formatTimeAgo(note.updated_at)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add project button */}
      <button
        className="add-project-btn-compact"
        onClick={onCreateProject}
      >
        <Plus size={14} />
        <span>New Project</span>
      </button>
    </div>
  )
}

interface CompactProjectItemProps {
  project: Project
  isActive: boolean
  noteCount: number
  onClick: () => void
}

function CompactProjectItem({ project, isActive, noteCount, onClick }: CompactProjectItemProps) {
  const status = project.status || 'active'
  return (
    <button
      className={`compact-project-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
      data-status={status}
    >
      {/* Top row: status + name + count */}
      <div className="item-row">
        <StatusDot status={status} size="sm" />
        <span className="project-name">{project.name}</span>
        <span className="note-count">{noteCount}</span>
        <ChevronRight size={12} className="chevron" />
      </div>

      {/* Progress bar (if project has progress) */}
      {project.progress !== undefined && project.progress > 0 && (
        <div className="progress-mini" title={`${project.progress}% complete`}>
          <div
            className="progress-fill"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      )}

      {/* Footer: time */}
      <div className="item-footer">
        {formatTimeAgo(project.updated_at)}
      </div>
    </button>
  )
}

// Helper functions
function countWords(content: string): number {
  if (!content) return 0
  const text = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_~>\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.split(/\s+/).filter(Boolean).length
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
