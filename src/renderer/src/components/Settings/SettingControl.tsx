import { useSettingsStore, Setting } from '../../store/useSettingsStore'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

/**
 * SettingControl - Universal control component for all setting types
 *
 * Renders the appropriate UI control based on setting.type:
 * - toggle: On/off switch
 * - select: Dropdown menu
 * - text: Text input
 * - number: Number input with increment/decrement
 * - color: Color picker
 * - gallery: Visual grid selector (themes, templates)
 * - keymap: Keyboard shortcut input
 */

interface SettingControlProps {
  setting: Setting
}

export default function SettingControl({ setting }: SettingControlProps) {
  const { settings, updateSetting } = useSettingsStore()
  const value = settings[setting.id] ?? setting.defaultValue

  switch (setting.type) {
    case 'toggle':
      return <ToggleControl setting={setting} value={value} onChange={(v) => updateSetting(setting.id, v)} />

    case 'select':
      return <SelectControl setting={setting} value={value} onChange={(v) => updateSetting(setting.id, v)} />

    case 'text':
      return <TextControl setting={setting} value={value} onChange={(v) => updateSetting(setting.id, v)} />

    case 'number':
      return <NumberControl setting={setting} value={value} onChange={(v) => updateSetting(setting.id, v)} />

    case 'color':
      return <ColorControl setting={setting} value={value} onChange={(v) => updateSetting(setting.id, v)} />

    case 'gallery':
      return <GalleryControl setting={setting} value={value} onChange={(v) => updateSetting(setting.id, v)} />

    case 'keymap':
      return <KeymapControl setting={setting} value={value} onChange={(v) => updateSetting(setting.id, v)} />

    default:
      console.error('[SettingControl] Unknown setting type:', setting.type, setting)
      return (
        <div className="text-red-400 text-sm">
          Unknown setting type: {setting.type}
        </div>
      )
  }
}

// Toggle Control
function ToggleControl({ setting, value, onChange }: { setting: Setting; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-neutral-200">{setting.label}</label>
          {setting.addedInVersion && (
            <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded">
              New in {setting.addedInVersion}
            </span>
          )}
        </div>
        {setting.description && (
          <p className="text-xs text-neutral-400 mt-1">{setting.description}</p>
        )}
      </div>

      <button
        onClick={() => onChange(!value)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900
          ${value ? 'bg-blue-600' : 'bg-neutral-600'}
        `}
        role="switch"
        aria-checked={value}
        aria-label={setting.label}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${value ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  )
}

// Select Control
function SelectControl({ setting, value, onChange }: { setting: Setting; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-neutral-200">{setting.label}</label>
        {setting.addedInVersion && (
          <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded">
            New in {setting.addedInVersion}
          </span>
        )}
      </div>
      {setting.description && (
        <p className="text-xs text-neutral-400">{setting.description}</p>
      )}

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
        >
          {setting.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
      </div>
    </div>
  )
}

// Text Control
function TextControl({ setting, value, onChange }: { setting: Setting; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-neutral-200">{setting.label}</label>
        {setting.addedInVersion && (
          <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded">
            New in {setting.addedInVersion}
          </span>
        )}
      </div>
      {setting.description && (
        <p className="text-xs text-neutral-400">{setting.description}</p>
      )}

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={setting.defaultValue}
      />
    </div>
  )
}

// Number Control
function NumberControl({ setting, value, onChange }: { setting: Setting; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-neutral-200">{setting.label}</label>
        {setting.addedInVersion && (
          <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded">
            New in {setting.addedInVersion}
          </span>
        )}
      </div>
      {setting.description && (
        <p className="text-xs text-neutral-400">{setting.description}</p>
      )}

      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-24 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-1">
          <button
            onClick={() => onChange(value - 1)}
            className="px-2 py-1 bg-neutral-700 hover:bg-neutral-600 border border-neutral-600 rounded text-neutral-300 text-xs"
          >
            −
          </button>
          <button
            onClick={() => onChange(value + 1)}
            className="px-2 py-1 bg-neutral-700 hover:bg-neutral-600 border border-neutral-600 rounded text-neutral-300 text-xs"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}

// Color Control
function ColorControl({ setting, value, onChange }: { setting: Setting; value: string; onChange: (v: string) => void }) {
  const [showPicker, setShowPicker] = useState(false)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-neutral-200">{setting.label}</label>
        {setting.addedInVersion && (
          <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded">
            New in {setting.addedInVersion}
          </span>
        )}
      </div>
      {setting.description && (
        <p className="text-xs text-neutral-400">{setting.description}</p>
      )}

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="w-12 h-12 rounded-md border-2 border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ backgroundColor: value }}
            aria-label={`${setting.label} color picker`}
          />
          {showPicker && (
            <div className="absolute top-14 left-0 z-10 p-2 bg-neutral-800 border border-neutral-600 rounded-md shadow-lg">
              <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-48 h-32 cursor-pointer"
              />
            </div>
          )}
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-neutral-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="#3b82f6"
        />
      </div>
    </div>
  )
}

// Gallery Control (for themes, templates)
function GalleryControl({ setting, value, onChange }: { setting: Setting; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-neutral-200">{setting.label}</label>
        {setting.addedInVersion && (
          <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded">
            New in {setting.addedInVersion}
          </span>
        )}
      </div>
      {setting.description && (
        <p className="text-xs text-neutral-400">{setting.description}</p>
      )}

      <div className="grid grid-cols-3 gap-3">
        {setting.options?.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              group relative p-4 rounded-lg border-2 transition-all text-left
              ${value === option.value
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-neutral-600 hover:border-neutral-500 bg-neutral-800'
              }
            `}
          >
            {/* Preview area - will be customized per setting */}
            <div className="mb-2 h-16 rounded bg-neutral-700 flex items-center justify-center text-neutral-500 text-xs">
              Preview
            </div>

            <div className="text-sm font-medium text-neutral-200">{option.label}</div>
            {option.description && (
              <div className="text-xs text-neutral-400 mt-1">{option.description}</div>
            )}

            {value === option.value && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// Keymap Control (keyboard shortcuts)
function KeymapControl({ setting, value, onChange }: { setting: Setting; value: string; onChange: (v: string) => void }) {
  const [isRecording, setIsRecording] = useState(false)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isRecording) return

    e.preventDefault()

    // Build shortcut string (e.g., "⌘⌥1")
    const parts: string[] = []
    if (e.metaKey) parts.push('⌘')
    if (e.ctrlKey) parts.push('⌃')
    if (e.altKey) parts.push('⌥')
    if (e.shiftKey) parts.push('⇧')

    // Add key
    if (e.key.length === 1) {
      parts.push(e.key.toUpperCase())
    } else if (e.key !== 'Meta' && e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Shift') {
      parts.push(e.key)
    }

    if (parts.length > 1) { // Must have at least one modifier + key
      onChange(parts.join(''))
      setIsRecording(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-neutral-200">{setting.label}</label>
        {setting.addedInVersion && (
          <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded">
            New in {setting.addedInVersion}
          </span>
        )}
      </div>
      {setting.description && (
        <p className="text-xs text-neutral-400">{setting.description}</p>
      )}

      <div className="flex items-center gap-2">
        <div
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onClick={() => setIsRecording(true)}
          className={`
            flex-1 px-3 py-2 bg-neutral-700 border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer
            ${isRecording ? 'border-blue-500 text-blue-300' : 'border-neutral-600 text-neutral-100'}
          `}
        >
          {isRecording ? 'Press shortcut...' : (value || 'Not set')}
        </div>

        {value && (
          <button
            onClick={() => onChange('')}
            className="px-3 py-2 bg-neutral-700 hover:bg-neutral-600 border border-neutral-600 rounded text-neutral-300 text-xs"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
