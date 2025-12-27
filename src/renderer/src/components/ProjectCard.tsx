import { Project, ProjectType } from '../types'
import { Beaker, GraduationCap, Package, Code2, Folder, FileText, LetterText } from 'lucide-react'

interface ProjectCardProps {
  project: Project
  isActive: boolean
  onClick: () => void
  noteCount?: number
  wordCount?: number
}

// Icons for each project type (matches ProjectType: research | teaching | r-package | r-dev | generic)
const TYPE_ICONS: Record<ProjectType, React.ReactNode> = {
  research: <Beaker className="w-4 h-4" />,
  teaching: <GraduationCap className="w-4 h-4" />,
  'r-package': <Package className="w-4 h-4" />,
  'r-dev': <Code2 className="w-4 h-4" />,
  generic: <Folder className="w-4 h-4" />,
}

// Labels for each project type
const TYPE_LABELS: Record<ProjectType, string> = {
  research: 'Research',
  teaching: 'Teaching',
  'r-package': 'R Package',
  'r-dev': 'R Dev',
  generic: 'General',
}

export function ProjectCard({ project, isActive, onClick, noteCount, wordCount }: ProjectCardProps) {
  const color = project.color || '#38bdf8'
  const icon = TYPE_ICONS[project.type] || TYPE_ICONS.generic
  const label = TYPE_LABELS[project.type] || 'Project'

  // Format last updated time
  const formatTime = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Format word count (1.2k for thousands)
  const formatWords = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  return (
    <button
      onClick={onClick}
      className={`project-card w-full text-left p-4 rounded-lg border transition-all duration-200 group
        ${isActive
          ? 'border-nexus-accent bg-nexus-accent/5 ring-1 ring-nexus-accent/20'
          : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20'
        }`}
    >
      {/* Header with status dot and type badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Status dot */}
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          {/* Type badge */}
          <span className="text-xs text-nexus-text-muted flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded">
            {icon}
            {label}
          </span>
        </div>
        {isActive && (
          <span className="text-xs text-nexus-accent font-medium">Active</span>
        )}
      </div>

      {/* Project name */}
      <h3 className="font-medium text-nexus-text-primary group-hover:text-nexus-accent transition-colors truncate">
        {project.name}
      </h3>

      {/* Description if present */}
      {project.description && (
        <p className="text-sm text-nexus-text-muted mt-1 line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Footer with stats */}
      <div className="mt-3 pt-2 border-t border-white/5 text-xs text-nexus-text-muted flex items-center justify-between">
        <div className="flex items-center gap-3">
          {noteCount !== undefined && (
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {noteCount}
            </span>
          )}
          {wordCount !== undefined && wordCount > 0 && (
            <span className="flex items-center gap-1">
              <LetterText className="w-3 h-3" />
              {formatWords(wordCount)}
            </span>
          )}
        </div>
        <span>{formatTime(project.updated_at)}</span>
      </div>
    </button>
  )
}
