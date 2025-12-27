/**
 * ProjectSwitcher - Dropdown in sidebar header for switching between projects
 *
 * Features:
 * - Shows current project name or "All Notes"
 * - Dropdown with list of projects (color dot + name)
 * - "Create New Project" option at bottom
 *
 * Uses CSS variables: --nexus-bg-*, --nexus-text-*, --nexus-accent
 */

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Plus, FolderOpen, Check } from 'lucide-react'

// Project types matching the project system spec
export type ProjectType = 'research' | 'teaching' | 'r-package' | 'r-dev' | 'generic'

export interface Project {
  id: string
  name: string
  type: ProjectType
  description?: string
  color: string
  createdAt: number
  updatedAt: number
}

// Preset colors for projects
export const PROJECT_COLORS = [
  '#38bdf8', // Sky blue (default)
  '#4ade80', // Green
  '#f472b6', // Pink
  '#fb923c', // Orange
  '#a78bfa', // Purple
  '#fbbf24', // Amber
  '#2dd4bf', // Teal
  '#f87171', // Red
]

interface ProjectSwitcherProps {
  projects: Project[]
  currentProjectId: string | null // null = "All Notes"
  onSelectProject: (projectId: string | null) => void
  onCreateProject: () => void
}

export function ProjectSwitcher({
  projects,
  currentProjectId,
  onSelectProject,
  onCreateProject,
}: ProjectSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get current project details
  const currentProject = currentProjectId
    ? projects.find((p) => p.id === currentProjectId)
    : null

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleSelectProject = (projectId: string | null) => {
    onSelectProject(projectId)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
        style={{
          backgroundColor: isOpen ? 'var(--nexus-bg-tertiary)' : 'transparent',
          color: 'var(--nexus-text-primary)',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'var(--nexus-bg-tertiary)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'transparent'
          }
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Project Icon/Color */}
        {currentProject ? (
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: currentProject.color }}
          />
        ) : (
          <FolderOpen className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--nexus-accent)' }} />
        )}

        {/* Project Name */}
        <span className="flex-1 text-left text-sm font-medium truncate">
          {currentProject ? currentProject.name : 'All Notes'}
        </span>

        {/* Chevron */}
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: 'var(--nexus-text-muted)' }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-1 py-1 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          style={{
            backgroundColor: 'var(--nexus-bg-secondary)',
            border: '1px solid var(--nexus-bg-tertiary)',
          }}
          role="listbox"
          aria-label="Select project"
        >
          {/* All Notes Option */}
          <button
            onClick={() => handleSelectProject(null)}
            className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors"
            style={{
              backgroundColor: currentProjectId === null ? 'var(--nexus-bg-tertiary)' : 'transparent',
              color: 'var(--nexus-text-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--nexus-bg-tertiary)'
            }}
            onMouseLeave={(e) => {
              if (currentProjectId !== null) {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
            role="option"
            aria-selected={currentProjectId === null}
          >
            <FolderOpen className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--nexus-accent)' }} />
            <span className="flex-1 text-sm">All Notes</span>
            {currentProjectId === null && (
              <Check className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--nexus-accent)' }} />
            )}
          </button>

          {/* Divider */}
          {projects.length > 0 && (
            <div
              className="my-1 mx-3"
              style={{ height: '1px', backgroundColor: 'var(--nexus-bg-tertiary)' }}
            />
          )}

          {/* Project List */}
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => handleSelectProject(project.id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors"
              style={{
                backgroundColor:
                  currentProjectId === project.id ? 'var(--nexus-bg-tertiary)' : 'transparent',
                color: 'var(--nexus-text-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--nexus-bg-tertiary)'
              }}
              onMouseLeave={(e) => {
                if (currentProjectId !== project.id) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
              role="option"
              aria-selected={currentProjectId === project.id}
            >
              {/* Color dot */}
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.color }}
              />

              {/* Project name and type */}
              <div className="flex-1 min-w-0">
                <span className="text-sm truncate block">{project.name}</span>
                <span
                  className="text-[10px] uppercase tracking-wide"
                  style={{ color: 'var(--nexus-text-muted)' }}
                >
                  {project.type.replace('-', ' ')}
                </span>
              </div>

              {/* Check mark for selected */}
              {currentProjectId === project.id && (
                <Check className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--nexus-accent)' }} />
              )}
            </button>
          ))}

          {/* Create New Project Option */}
          <div
            className="mt-1 pt-1"
            style={{ borderTop: '1px solid var(--nexus-bg-tertiary)' }}
          >
            <button
              onClick={() => {
                setIsOpen(false)
                onCreateProject()
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors"
              style={{ color: 'var(--nexus-accent)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--nexus-bg-tertiary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">Create New Project</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
