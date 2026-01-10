/**
 * EditProjectModal - Modal dialog for editing an existing project
 *
 * Features:
 * - Name, Type (dropdown), Description, Color picker
 * - Pre-filled with existing project data
 * - Project types: research, teaching, r-package, r-dev, generic
 * - 8 preset colors
 *
 * Uses CSS variables: --nexus-bg-*, --nexus-text-*, --nexus-accent
 */

import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, FolderOpen, Check, FolderPlus } from 'lucide-react'
import { Project, ProjectType } from '../types'
import { PROJECT_COLORS } from './ProjectSwitcher'
import { IconPicker, getIconByName } from './IconPicker'

// Project type options with descriptions
const PROJECT_TYPES: { value: ProjectType; label: string; description: string }[] = [
  { value: 'research', label: 'Research', description: 'Academic research papers and manuscripts' },
  { value: 'teaching', label: 'Teaching', description: 'Course materials and lecture notes' },
  { value: 'r-package', label: 'R Package', description: 'R package development project' },
  { value: 'r-dev', label: 'R Development', description: 'R scripts and analysis projects' },
  { value: 'generic', label: 'Generic', description: 'General purpose project' },
]

interface EditProjectModalProps {
  isOpen: boolean
  project: Project | null
  onClose: () => void
  onUpdateProject: (projectId: string, updates: Partial<Pick<Project, 'name' | 'type' | 'description' | 'color' | 'icon'>>) => void
  existingProjectNames?: string[] // For validation (excluding current project)
}

export function EditProjectModal({
  isOpen,
  project,
  onClose,
  onUpdateProject,
  existingProjectNames = [],
}: EditProjectModalProps) {
  // Form state
  const [name, setName] = useState('')
  const [type, setType] = useState<ProjectType>('generic')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(PROJECT_COLORS[0])
  const [icon, setIcon] = useState<string | undefined>(undefined)
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form when project changes
  useEffect(() => {
    if (isOpen && project) {
      setName(project.name)
      setType(project.type)
      setDescription(project.description || '')
      setColor(project.color || PROJECT_COLORS[0])
      setIcon(project.icon)
      setError(null)
    }
  }, [isOpen, project])

  // Validation
  const validateName = (value: string): string | null => {
    if (!value.trim()) {
      return 'Project name is required'
    }
    if (value.length > 50) {
      return 'Project name must be 50 characters or less'
    }
    // Check for duplicates (excluding current project name)
    const otherNames = existingProjectNames.filter(n => n !== project?.name.toLowerCase())
    if (otherNames.includes(value.trim().toLowerCase())) {
      return 'A project with this name already exists'
    }
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!project) return

    const nameError = validateName(name)
    if (nameError) {
      setError(nameError)
      return
    }

    onUpdateProject(project.id, {
      name: name.trim(),
      type,
      description: description.trim() || undefined,
      color,
      icon,
    })

    onClose()
  }

  const selectedType = PROJECT_TYPES.find((t) => t.value === type)

  if (!project) return null

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay
          className="fixed inset-0 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
        />

        {/* Content */}
        <Dialog.Content
          className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-xl shadow-2xl p-6"
          style={{ backgroundColor: 'var(--nexus-bg-secondary)' }}
          data-testid="edit-project-modal"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)` }}
            >
              <FolderOpen className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <Dialog.Title
                className="text-lg font-semibold"
                style={{ color: 'var(--nexus-text-primary)' }}
              >
                Edit Project
              </Dialog.Title>
              <Dialog.Description
                className="text-sm"
                style={{ color: 'var(--nexus-text-muted)' }}
              >
                Update project settings and appearance
              </Dialog.Description>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: 'var(--nexus-text-muted)' }}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Project Name */}
            <div>
              <label
                htmlFor="edit-project-name"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--nexus-text-muted)' }}
              >
                Project Name <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                id="edit-project-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError(null)
                }}
                placeholder="My Research Project"
                className="w-full px-3 py-2.5 rounded-lg text-sm transition-colors"
                style={{
                  backgroundColor: 'var(--nexus-bg-tertiary)',
                  color: 'var(--nexus-text-primary)',
                  border: error ? '1px solid #f87171' : '1px solid transparent',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--nexus-accent)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = error ? '#f87171' : 'transparent'
                }}
                autoFocus
              />
              {error && (
                <p className="mt-1.5 text-xs" style={{ color: '#f87171' }}>
                  {error}
                </p>
              )}
            </div>

            {/* Project Type */}
            <div>
              <label
                htmlFor="edit-project-type"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--nexus-text-muted)' }}
              >
                Project Type
              </label>
              <select
                id="edit-project-type"
                value={type}
                onChange={(e) => setType(e.target.value as ProjectType)}
                className="w-full px-3 py-2.5 rounded-lg text-sm"
                style={{
                  backgroundColor: 'var(--nexus-bg-tertiary)',
                  color: 'var(--nexus-text-primary)',
                  border: 'none',
                  outline: 'none',
                }}
              >
                {PROJECT_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {selectedType && (
                <p className="mt-1.5 text-xs" style={{ color: 'var(--nexus-text-muted)' }}>
                  {selectedType.description}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="edit-project-description"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--nexus-text-muted)' }}
              >
                Description <span style={{ color: 'var(--nexus-text-muted)' }}>(optional)</span>
              </label>
              <textarea
                id="edit-project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the project..."
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg text-sm resize-none"
                style={{
                  backgroundColor: 'var(--nexus-bg-tertiary)',
                  color: 'var(--nexus-text-primary)',
                  border: '1px solid transparent',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--nexus-accent)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'transparent'
                }}
              />
            </div>

            {/* Icon Picker */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--nexus-text-muted)' }}
              >
                Icon <span style={{ color: 'var(--nexus-text-muted)' }}>(optional)</span>
              </label>
              <button
                type="button"
                onClick={() => setIsIconPickerOpen(true)}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-white/5"
                style={{
                  backgroundColor: 'var(--nexus-bg-tertiary)',
                  color: 'var(--nexus-text-primary)',
                  border: '1px solid transparent',
                }}
              >
                {icon ? (
                  <>
                    {(() => {
                      const IconComponent = getIconByName(icon)
                      return <IconComponent size={20} style={{ color }} />
                    })()}
                    <span>{icon}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIcon(undefined)
                      }}
                      className="ml-auto p-1 rounded hover:bg-white/10"
                      aria-label="Remove icon"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <FolderPlus size={20} style={{ color: 'var(--nexus-text-muted)' }} />
                    <span style={{ color: 'var(--nexus-text-muted)' }}>Choose an icon...</span>
                  </>
                )}
              </button>
            </div>

            {/* Color Picker */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--nexus-text-muted)' }}
              >
                Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      boxShadow: color === c ? `0 0 0 2px var(--nexus-bg-secondary), 0 0 0 4px ${c}` : 'none',
                    }}
                    aria-label={`Select color ${c}`}
                    aria-pressed={color === c}
                  >
                    {color === c && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--nexus-bg-tertiary)',
                  color: 'var(--nexus-text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--nexus-bg-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--nexus-bg-tertiary)'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
                style={{
                  backgroundColor: 'var(--nexus-accent)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--nexus-accent-hover)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--nexus-accent)'
                }}
              >
                Save Changes
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>

      {/* Icon Picker Modal */}
      {isIconPickerOpen && (
        <IconPicker
          selectedIcon={icon}
          onSelectIcon={setIcon}
          onClose={() => setIsIconPickerOpen(false)}
        />
      )}
    </Dialog.Root>
  )
}
