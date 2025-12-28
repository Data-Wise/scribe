import { useState, useMemo } from 'react'
import { Menu, Plus, Search, Clock, FileText, MoreHorizontal } from 'lucide-react'
import { Project, Note } from '../../types'
import { StatusDot } from './StatusDot'

interface CardViewModeProps {
  projects: Project[]
  notes: Note[]
  currentProjectId: string | null
  onSelectProject: (id: string | null) => void
  onSelectNote: (id: string) => void
  onCreateProject: () => void
  onNewNote: (projectId: string) => void  // NEW: Create note in project
  onCollapse: () => void
  width: number
}

export function CardViewMode({
  projects,
  notes,
  currentProjectId,
  onSelectProject,
  onSelectNote,
  onCreateProject,
  onNewNote,
  onCollapse,
  width
}: CardViewModeProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter projects by search (treat undefined status as 'active')
  const filteredProjects = useMemo(() => {
    const activeProjects = projects.filter(p => (p.status || 'active') !== 'archive')
    if (!searchQuery.trim()) return activeProjects

    return activeProjects.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [projects, searchQuery])

  // Sort projects: current first, then by updated_at
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (a.id === currentProjectId) return -1
    if (b.id === currentProjectId) return 1
    return b.updated_at - a.updated_at
  })

  // Get recent notes (last 3 for card view) - filtered by project if one is selected
  const recentNotes = useMemo(() => {
    return [...notes]
      .filter(n => {
        if (n.deleted_at) return false
        // If a project is selected, only show notes from that project
        if (currentProjectId) {
          return n.project_id === currentProjectId
        }
        return true
      })
      .sort((a, b) => b.updated_at - a.updated_at)
      .slice(0, 3)
  }, [notes, currentProjectId])

  // Compute project stats
  const projectStats = useMemo(() => {
    const stats: Record<string, { noteCount: number; wordCount: number }> = {}
    projects.forEach(p => {
      stats[p.id] = { noteCount: 0, wordCount: 0 }
    })
    notes.filter(n => !n.deleted_at).forEach(note => {
      if (note.project_id && stats[note.project_id]) {
        stats[note.project_id].noteCount++
        stats[note.project_id].wordCount += countWords(note.content)
      }
    })
    return stats
  }, [projects, notes])

  return (
    <div className="mission-sidebar-card" style={{ width }}>
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

      {/* Search */}
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

      {/* Project cards */}
      <div className="project-cards-container">
        {sortedProjects.map(project => {
          const stats = projectStats[project.id]
          const isActive = project.id === currentProjectId
          return (
            <ProjectCard
              key={project.id}
              project={project}
              isActive={isActive}
              noteCount={stats?.noteCount || 0}
              wordCount={stats?.wordCount || 0}
              onClick={() => onSelectProject(isActive ? null : project.id)}
              onQuickAdd={() => onNewNote(project.id)}
            />
          )
        })}

        {sortedProjects.length === 0 && searchQuery && (
          <div className="no-results">No projects match "{searchQuery}"</div>
        )}

        {sortedProjects.length === 0 && !searchQuery && (
          <div className="empty-projects">
            <p>No projects yet</p>
            <button onClick={onCreateProject} className="create-first-btn">
              Create your first project
            </button>
          </div>
        )}
      </div>

      {/* Recent notes section */}
      {recentNotes.length > 0 && (
        <div className="sidebar-section">
          <h4 className="section-header">
            <Clock size={12} />
            <span>{currentProjectId ? 'Recent Notes' : 'Recent'}</span>
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
        className="add-project-btn-card"
        onClick={onCreateProject}
      >
        <Plus size={16} />
        <span>New Project</span>
      </button>
    </div>
  )
}

interface ProjectCardProps {
  project: Project
  isActive: boolean
  noteCount: number
  wordCount: number
  onClick: () => void
  onQuickAdd: () => void  // NEW: Quick add note to this project
}

function ProjectCard({ project, isActive, noteCount, wordCount, onClick, onQuickAdd }: ProjectCardProps) {
  const status = project.status || 'active'
  const progress = project.progress || 0
  const color = project.color || '#3b82f6'

  return (
    <button
      className={`project-card ${isActive ? 'active' : ''}`}
      onClick={onClick}
      data-status={status}
      style={{ '--project-color': color } as React.CSSProperties}
    >
      {/* Card header */}
      <div className="card-header">
        <StatusDot status={status} size="md" />
        <span className="card-title">{project.name}</span>
        <div className="card-actions">
          <button
            className="card-quick-add-btn"
            onClick={(e) => {
              e.stopPropagation()
              onQuickAdd()
            }}
            title="New note in this project"
          >
            <Plus size={14} />
          </button>
          <button
            className="card-menu-btn"
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Open project menu
            }}
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Project type badge */}
      {project.type && (
        <div className="card-type-badge">
          {formatProjectType(project.type)}
        </div>
      )}

      {/* Description preview */}
      {project.description && (
        <p className="card-description">{project.description}</p>
      )}

      {/* Stats row */}
      <div className="card-stats">
        <span className={`stat ${noteCount === 0 ? 'zero' : noteCount >= 5 ? 'many' : ''}`}>
          <FileText size={12} />
          {noteCount} {noteCount === 1 ? 'note' : 'notes'}
        </span>
        <span className={`stat ${wordCount === 0 ? 'zero' : wordCount >= 1000 ? 'many' : ''}`}>
          {formatWordCount(wordCount)}
        </span>
      </div>

      {/* Progress bar */}
      {progress > 0 && (
        <div className="card-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%`, backgroundColor: color }}
            />
          </div>
          <span className="progress-label">{progress}%</span>
        </div>
      )}

      {/* Footer */}
      <div className="card-footer">
        <span className="last-updated">
          Updated {formatTimeAgo(project.updated_at)}
        </span>
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
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatWordCount(count: number): string {
  if (count === 0) return '0 words'
  if (count < 1000) return `${count} words`
  return `${(count / 1000).toFixed(1)}k words`
}

function formatProjectType(type: string): string {
  const labels: Record<string, string> = {
    'research': 'Research',
    'manuscript': 'Manuscript',
    'course': 'Course',
    'notes': 'Notes',
    'generic': 'General'
  }
  return labels[type] || type
}
