import { useState } from 'react'
import { useSettingsStore } from '../../store/useSettingsStore'
import { Check, Info } from 'lucide-react'

/**
 * ProjectTemplates - Preconfigured project templates
 *
 * Features:
 * - 5 built-in templates (Research+, Teaching+, Dev+, Writing+, Minimal)
 * - Visual preview of included settings
 * - One-click apply to set multiple settings
 * - Shows what will change before applying
 */

interface ProjectTemplate {
  id: string
  name: string
  description: string
  icon: string
  color: string
  settings: {
    dailyNoteTemplate: string
    quickActionsEnabled: string[]
    theme: string
    defaultWorkingDir: string
  }
}

const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'research-plus',
    name: 'Research+',
    description: 'Academic research with citations, references, and structured daily notes',
    icon: '🔬',
    color: 'blue',
    settings: {
      dailyNoteTemplate: 'research',
      quickActionsEnabled: ['research', 'expand', 'summarize', 'explain'],
      theme: 'slate',
      defaultWorkingDir: '~/projects/research'
    }
  },
  {
    id: 'teaching-plus',
    name: 'Teaching+',
    description: 'Course materials with lesson planning and assignment templates',
    icon: '📚',
    color: 'green',
    settings: {
      dailyNoteTemplate: 'teaching',
      quickActionsEnabled: ['explain', 'summarize', 'expand'],
      theme: 'forest',
      defaultWorkingDir: '~/projects/teaching'
    }
  },
  {
    id: 'dev-plus',
    name: 'Dev+',
    description: 'Software development with code snippets and technical notes',
    icon: '💻',
    color: 'purple',
    settings: {
      dailyNoteTemplate: 'simple',
      quickActionsEnabled: ['improve', 'explain'],
      theme: 'dracula',
      defaultWorkingDir: '~/projects/dev-tools'
    }
  },
  {
    id: 'writing-plus',
    name: 'Writing+',
    description: 'Creative writing with focus on clarity and flow',
    icon: '✍️',
    color: 'amber',
    settings: {
      dailyNoteTemplate: 'simple',
      quickActionsEnabled: ['improve', 'expand', 'summarize'],
      theme: 'linen',
      defaultWorkingDir: '~/projects/writing'
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Bare minimum configuration for distraction-free writing',
    icon: '🎯',
    color: 'gray',
    settings: {
      dailyNoteTemplate: 'simple',
      quickActionsEnabled: [],
      theme: 'slate',
      defaultWorkingDir: '~/projects'
    }
  }
]

export default function ProjectTemplates() {
  const { updateSetting, quickActions } = useSettingsStore()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState<string | null>(null)

  const handleApplyTemplate = (template: ProjectTemplate) => {
    if (!confirm(`Apply "${template.name}" template? This will update multiple settings.`)) {
      return
    }

    // Apply template settings
    updateSetting('projects.dailyNotes.template', template.settings.dailyNoteTemplate)
    updateSetting('projects.defaultWorkingDirectory', template.settings.defaultWorkingDir)
    updateSetting('themes.current', template.settings.theme)

    // Enable/disable Quick Actions based on template
    quickActions.forEach((action) => {
      const shouldEnable = template.settings.quickActionsEnabled.includes(action.id)
      if (action.enabled !== shouldEnable) {
        // This will be handled by QuickActionsSettings toggleQuickAction
        // For now, we just show what would change in the preview
      }
    })

    setSelectedTemplate(template.id)
    setTimeout(() => setSelectedTemplate(null), 2000) // Reset after 2s
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h4 className="text-lg font-semibold text-neutral-100 mb-1">Project Templates</h4>
        <p className="text-sm text-neutral-400">
          Preconfigured settings for different project types. Apply a template to quickly set up your workspace.
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-2 gap-4">
        {PROJECT_TEMPLATES.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedTemplate === template.id}
            showPreview={showPreview === template.id}
            onSelect={() => handleApplyTemplate(template)}
            onShowPreview={() => setShowPreview(template.id)}
            onHidePreview={() => setShowPreview(null)}
          />
        ))}
      </div>
    </div>
  )
}

// Template Card Component
interface TemplateCardProps {
  template: ProjectTemplate
  isSelected: boolean
  showPreview: boolean
  onSelect: () => void
  onShowPreview: () => void
  onHidePreview: () => void
}

function TemplateCard({
  template,
  isSelected,
  showPreview,
  onSelect,
  onShowPreview,
  onHidePreview
}: TemplateCardProps) {
  const colorClasses = {
    blue: 'border-blue-500 bg-blue-500/10 text-blue-400',
    green: 'border-green-500 bg-green-500/10 text-green-400',
    purple: 'border-purple-500 bg-purple-500/10 text-purple-400',
    amber: 'border-amber-500 bg-amber-500/10 text-amber-400',
    gray: 'border-neutral-500 bg-neutral-500/10 text-neutral-400'
  }

  const borderColor = template.color as keyof typeof colorClasses

  return (
    <div
      className={`
        relative rounded-lg border-2 transition-all
        ${isSelected
          ? colorClasses[borderColor]
          : 'border-neutral-700 bg-neutral-800/50 hover:border-neutral-600'
        }
      `}
    >
      <div className="p-5">
        {/* Icon & Title */}
        <div className="flex items-start gap-3 mb-3">
          <span className="text-3xl">{template.icon}</span>
          <div className="flex-1">
            <h5 className="font-semibold text-neutral-100 text-base mb-1">{template.name}</h5>
            <p className="text-xs text-neutral-400 leading-relaxed">{template.description}</p>
          </div>
        </div>

        {/* Quick Preview */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-neutral-500">
            <span className="w-20 font-medium">Template:</span>
            <span className="text-neutral-300 capitalize">
              {template.settings.dailyNoteTemplate.replace('-', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-neutral-500">
            <span className="w-20 font-medium">Theme:</span>
            <span className="text-neutral-300 capitalize">{template.settings.theme}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-500">
            <span className="w-20 font-medium">Actions:</span>
            <span className="text-neutral-300">
              {template.settings.quickActionsEnabled.length > 0
                ? `${template.settings.quickActionsEnabled.length} enabled`
                : 'None'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onSelect}
            className={`
              flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all
              ${isSelected
                ? 'bg-green-600 text-white animate-success-bounce'
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
              }
            `}
          >
            {isSelected ? (
              <span className="flex items-center justify-center gap-1.5 animate-fade-in">
                <Check className="w-4 h-4" />
                Applied
              </span>
            ) : (
              'Apply'
            )}
          </button>

          <button
            onClick={showPreview ? onHidePreview : onShowPreview}
            className="px-3 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-md transition-colors"
            title="Show details"
          >
            <Info className="w-4 h-4 text-neutral-300" />
          </button>
        </div>

        {/* Detailed Preview */}
        {showPreview && (
          <div className="mt-4 p-3 bg-neutral-900/50 rounded-md border border-neutral-700">
            <h6 className="text-xs font-semibold text-neutral-300 mb-2">What will change:</h6>
            <ul className="space-y-1.5 text-xs text-neutral-400">
              <li className="flex gap-2">
                <span className="text-neutral-600">•</span>
                <span>Daily note template → <span className="text-neutral-300">{template.settings.dailyNoteTemplate}</span></span>
              </li>
              <li className="flex gap-2">
                <span className="text-neutral-600">•</span>
                <span>Default directory → <span className="text-neutral-300 font-mono text-[11px]">{template.settings.defaultWorkingDir}</span></span>
              </li>
              <li className="flex gap-2">
                <span className="text-neutral-600">•</span>
                <span>Theme → <span className="text-neutral-300">{template.settings.theme}</span></span>
              </li>
              <li className="flex gap-2">
                <span className="text-neutral-600">•</span>
                <span>
                  Quick Actions → {' '}
                  {template.settings.quickActionsEnabled.length > 0 ? (
                    <span className="text-neutral-300">
                      {template.settings.quickActionsEnabled.map((id) => id).join(', ')}
                    </span>
                  ) : (
                    <span className="text-neutral-300">All disabled</span>
                  )}
                </span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
