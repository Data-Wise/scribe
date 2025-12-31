import { useState } from 'react'
import { useSettingsStore, QuickAction } from '../../store/useSettingsStore'
import { useToast } from '../Toast'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Settings as SettingsIcon, Trash2, Plus, X, Check } from 'lucide-react'

/**
 * QuickActionsSettings - Customization panel for Quick Actions
 *
 * Features:
 * - Drag-to-reorder actions
 * - Toggle visibility per action
 * - Edit prompts (inline or modal)
 * - Assign keyboard shortcuts (⌘⌥1-9)
 * - Choose AI model (Claude vs Gemini)
 * - Add up to 5 custom actions (10 total max)
 * - Delete custom actions (default actions cannot be deleted)
 */
export default function QuickActionsSettings() {
  const {
    quickActions,
    reorderQuickActions,
    toggleQuickAction,
    updateQuickActionPrompt,
    assignShortcut,
    updateQuickActionModel,
    addCustomQuickAction,
    removeQuickAction,
    settings,
    updateSetting
  } = useSettingsStore()

  const [editingAction, setEditingAction] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = quickActions.findIndex((a) => a.id === active.id)
      const newIndex = quickActions.findIndex((a) => a.id === over.id)
      reorderQuickActions(oldIndex, newIndex)
    }
  }

  const canAddCustom = quickActions.length < 10

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-neutral-100">Quick Actions</h4>
          <p className="text-sm text-neutral-400 mt-1">
            Customize one-click AI prompts. Drag to reorder, toggle to show/hide.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          disabled={!canAddCustom}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${canAddCustom
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
            }
          `}
          title={canAddCustom ? 'Add custom Quick Action' : 'Maximum 10 Quick Actions'}
        >
          <Plus className="w-4 h-4" />
          Add Custom ({quickActions.length}/10)
        </button>
      </div>

      {/* Quick Actions List */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={quickActions.map((a) => a.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <QuickActionItem
                key={action.id}
                action={action}
                isEditing={editingAction === action.id}
                onEdit={() => setEditingAction(action.id)}
                onCancelEdit={() => setEditingAction(null)}
                onToggle={(enabled) => toggleQuickAction(action.id, enabled)}
                onUpdatePrompt={(prompt) => updateQuickActionPrompt(action.id, prompt)}
                onUpdateModel={(model) => updateQuickActionModel(action.id, model)}
                onRemove={() => removeQuickAction(action.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Display Options */}
      <div className="pt-4 border-t border-neutral-700">
        <h5 className="text-sm font-semibold text-neutral-200 mb-3">Display Options</h5>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings['ai.quickActions.showInSidebar'] ?? true}
              onChange={(e) => updateSetting('ai.quickActions.showInSidebar', e.target.checked)}
              className="w-4 h-4 rounded border-neutral-600 bg-neutral-700 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-neutral-900"
            />
            <span className="text-sm text-neutral-200">Show in sidebar</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings['ai.quickActions.showInContextMenu'] ?? true}
              onChange={(e) => updateSetting('ai.quickActions.showInContextMenu', e.target.checked)}
              className="w-4 h-4 rounded border-neutral-600 bg-neutral-700 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-neutral-900"
            />
            <span className="text-sm text-neutral-200">Show in context menu (right-click)</span>
          </label>
        </div>
      </div>

      {/* Add Custom Action Modal */}
      {showAddModal && (
        <AddQuickActionModal
          onAdd={(action) => {
            addCustomQuickAction(action)
            setShowAddModal(false)
          }}
          onCancel={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}

// Sortable Quick Action Item
interface QuickActionItemProps {
  action: QuickAction
  isEditing: boolean
  onEdit: () => void
  onCancelEdit: () => void
  onToggle: (enabled: boolean) => void
  onUpdatePrompt: (prompt: string) => void
  onUpdateModel: (model: 'claude' | 'gemini') => void
  onRemove: () => void
}

function QuickActionItem({
  action,
  isEditing,
  onEdit,
  onCancelEdit,
  onToggle,
  onUpdatePrompt,
  onUpdateModel,
  onRemove
}: QuickActionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: action.id
  })

  const [localPrompt, setLocalPrompt] = useState(action.prompt)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const handleSaveEdit = () => {
    onUpdatePrompt(localPrompt)
    onCancelEdit()
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-neutral-800 border rounded-lg transition-all
        ${action.enabled ? 'border-neutral-700' : 'border-neutral-700/50 opacity-60'}
      `}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 text-neutral-500 hover:text-neutral-300 cursor-grab active:cursor-grabbing focus:outline-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={action.enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="mt-1.5 w-4 h-4 rounded border-neutral-600 bg-neutral-700 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-neutral-900"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{action.emoji}</span>
            <span className="font-medium text-neutral-100">{action.label}</span>
            {action.isCustom && (
              <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded">Custom</span>
            )}
          </div>

          {/* Prompt (editable) */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={localPrompt}
                onChange={(e) => setLocalPrompt(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={onCancelEdit}
                  className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-400 mb-3">{action.prompt}</p>
          )}

          {/* Settings Row */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">Shortcut:</span>
              <span className="px-2 py-1 bg-neutral-700 rounded text-neutral-200 font-mono text-xs">
                {action.shortcut || 'None'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-neutral-500">Model:</span>
              <select
                value={action.model}
                onChange={(e) => onUpdateModel(e.target.value as 'claude' | 'gemini')}
                className="px-2 py-1 bg-neutral-700 border border-neutral-600 rounded text-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="claude">Claude Sonnet 4.5</option>
                <option value="gemini">Gemini 2.0 Flash</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          {!isEditing && (
            <button
              onClick={onEdit}
              className="p-2 hover:bg-neutral-700 rounded text-neutral-400 hover:text-neutral-200 transition-colors"
              title="Edit prompt"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          )}

          {action.isCustom && (
            <button
              onClick={onRemove}
              className="p-2 hover:bg-red-500/10 rounded text-neutral-400 hover:text-red-400 transition-colors"
              title="Delete custom action"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Add Custom Quick Action Modal
interface AddQuickActionModalProps {
  onAdd: (action: Omit<QuickAction, 'id' | 'order'>) => void
  onCancel: () => void
}

function AddQuickActionModal({ onAdd, onCancel }: AddQuickActionModalProps) {
  const [emoji, setEmoji] = useState('⚡')
  const [label, setLabel] = useState('')
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState<'claude' | 'gemini'>('claude')
  const { showToast } = useToast()

  const handleSubmit = () => {
    if (!label.trim() || !prompt.trim()) {
      showToast('Label and prompt are required', 'error')
      return
    }

    onAdd({
      emoji,
      label: label.trim(),
      prompt: prompt.trim(),
      enabled: true,
      model,
      isCustom: true
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg bg-neutral-800 rounded-lg shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-100">Add Custom Quick Action</h3>
          <button onClick={onCancel} className="p-1 hover:bg-neutral-700 rounded text-neutral-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-200 mb-1">Emoji</label>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value.slice(0, 2))}
              maxLength={2}
              className="w-20 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-center text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-200 mb-1">Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Simplify"
              className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-200 mb-1">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="Describe what this Quick Action should do..."
              className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-200 mb-1">AI Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as 'claude' | 'gemini')}
              className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="claude">Claude Sonnet 4.5</option>
              <option value="gemini">Gemini 2.0 Flash</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
          >
            Add Action
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
