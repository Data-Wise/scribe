import { useMemo } from 'react'
import { Project, Note, ProjectType } from '../types'
import { Beaker, GraduationCap, Package, Code2, Folder, FolderPlus, FileText, LetterText } from 'lucide-react'

interface ProjectsPanelProps {
  projects: Project[]
  notes: Note[]
  currentProjectId: string | null
  onSelectProject: (projectId: string) => void
  onCreateProject: () => void
  width: number
  onStartResize: () => void
}

// Icons for each project type
const TYPE_ICONS: Record<ProjectType, React.ReactNode> = {
  research: <Beaker className="w-3.5 h-3.5" />,
  teaching: <GraduationCap className="w-3.5 h-3.5" />,
  'r-package': <Package className="w-3.5 h-3.5" />,
  'r-dev': <Code2 className="w-3.5 h-3.5" />,
  generic: <Folder className="w-3.5 h-3.5" />,
}

export function ProjectsPanel({
  projects,
  notes,
  currentProjectId,
  onSelectProject,
  onCreateProject,
  width,
  onStartResize,
}: ProjectsPanelProps) {
  // Compute project stats from notes
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

  // Sort projects: current first, then by updated_at
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.id === currentProjectId) return -1
    if (b.id === currentProjectId) return 1
    return b.updated_at - a.updated_at
  })

  return (
    <div
      className="projects-panel flex flex-col border-r border-white/5 bg-nexus-bg-secondary"
      style={{ width: `${width}px`, minWidth: `${width}px` }}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-white/5">
        <h2 className="text-xs font-medium text-nexus-text-muted uppercase tracking-wide">
          Projects
        </h2>
      </div>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {sortedProjects.map((project) => {
          const stats = projectStats[project.id]
          const isActive = project.id === currentProjectId
          const icon = TYPE_ICONS[project.type] || TYPE_ICONS.generic

          return (
            <button
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className={`project-tile w-full text-left p-2 rounded-lg transition-all duration-150 group
                ${isActive
                  ? 'bg-nexus-accent/10 border border-nexus-accent/30'
                  : 'hover:bg-white/5 border border-transparent'
                }`}
            >
              {/* Project header */}
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color || '#38bdf8' }}
                />
                <span className={`text-sm font-medium truncate ${isActive ? 'text-nexus-accent' : 'text-nexus-text-primary'}`}>
                  {project.name}
                </span>
              </div>

              {/* Project stats */}
              <div className="flex items-center gap-3 text-[10px] text-nexus-text-muted pl-4">
                <span className="flex items-center gap-1">
                  {icon}
                </span>
                <span className="flex items-center gap-0.5">
                  <FileText className="w-3 h-3" />
                  {stats?.noteCount || 0}
                </span>
                {(stats?.wordCount || 0) > 0 && (
                  <span className="flex items-center gap-0.5">
                    <LetterText className="w-3 h-3" />
                    {formatWords(stats?.wordCount || 0)}
                  </span>
                )}
              </div>
            </button>
          )
        })}

        {/* Create new project button */}
        <button
          onClick={onCreateProject}
          className="w-full flex items-center gap-2 p-2 rounded-lg text-nexus-text-muted hover:text-nexus-text-primary hover:bg-white/5 transition-colors"
        >
          <FolderPlus className="w-4 h-4" />
          <span className="text-xs">New Project</span>
        </button>
      </div>

      {/* Resize handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-nexus-accent/50 transition-colors"
        onMouseDown={onStartResize}
      />
    </div>
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

function formatWords(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}
