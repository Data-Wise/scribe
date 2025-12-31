import { Settings as SettingsIcon } from 'lucide-react'
import { useSettingsStore, SettingsCategory } from '../../store/useSettingsStore'

/**
 * ContextualHint - Inline gear icon that opens settings to specific category
 *
 * Usage:
 * ```tsx
 * <ContextualHint category="ai" tooltip="Configure Quick Actions" />
 * ```
 *
 * Features:
 * - Small gear icon that appears inline
 * - Tooltip on hover
 * - Opens Settings modal to specific category
 * - ADHD-friendly: reduces cognitive load by providing direct access
 */

interface ContextualHintProps {
  /** Settings category to open */
  category: SettingsCategory

  /** Tooltip text (optional) */
  tooltip?: string

  /** Size variant */
  size?: 'sm' | 'md' | 'lg'

  /** Custom className for positioning */
  className?: string
}

export default function ContextualHint({
  category,
  tooltip = 'Settings',
  size = 'sm',
  className = ''
}: ContextualHintProps) {
  const { openSettings } = useSettingsStore()

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event bubbling
    openSettings(category)
  }

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center justify-center
        text-neutral-500 hover:text-blue-400
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900
        rounded
        ${className}
      `}
      title={tooltip}
      aria-label={tooltip}
    >
      <SettingsIcon className={sizeClasses[size]} />
    </button>
  )
}

/**
 * Example Usage Locations:
 *
 * 1. ClaudeChatPanel.tsx - Near Quick Actions buttons
 * ```tsx
 * <div className="flex items-center gap-2">
 *   <h4>Quick Actions</h4>
 *   <ContextualHint category="ai" tooltip="Configure Quick Actions" />
 * </div>
 * ```
 *
 * 2. MissionControl/CreateProjectModal.tsx - In project type selector
 * ```tsx
 * <div className="flex items-center justify-between">
 *   <label>Project Type</label>
 *   <ContextualHint category="projects" tooltip="Configure project defaults" />
 * </div>
 * ```
 *
 * 3. HybridEditor.tsx - Near editor mode toggle
 * ```tsx
 * <div className="flex items-center gap-2">
 *   <EditorModeToggle />
 *   <ContextualHint category="editor" tooltip="Editor settings" />
 * </div>
 * ```
 *
 * 4. ThemeSwitcher - Near theme selector
 * ```tsx
 * <div className="flex items-center gap-2">
 *   <span>Theme: {currentTheme}</span>
 *   <ContextualHint category="themes" tooltip="Browse themes" />
 * </div>
 * ```
 */
