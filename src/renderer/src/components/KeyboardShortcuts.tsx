import { useEffect, useCallback } from 'react'
import { X, Keyboard } from 'lucide-react'

interface KeyboardShortcutsProps {
  isOpen: boolean
  onClose: () => void
}

// Keyboard shortcuts organized by category
const SHORTCUTS = {
  'Notes': [
    { keys: '⌘N', description: 'New Note' },
    { keys: '⌘D', description: 'Daily Note' },
    { keys: '⌘S', description: 'Save (auto-saves)' },
  ],
  'Editor': [
    { keys: '⌘E', description: 'Toggle Preview' },
    { keys: '⌘⇧F', description: 'Focus Mode' },
    { keys: '⌘⇧E', description: 'Export Note' },
    { keys: '⌘⇧G', description: 'Graph View' },
  ],
  'Navigation': [
    { keys: '⌘K', description: 'Command Palette' },
    { keys: '⌘F', description: 'Search Notes' },
    { keys: '⌘B', description: 'Toggle Left Sidebar' },
    { keys: '⌘⇧B', description: 'Toggle Right Sidebar' },
    { keys: '⌘0', description: 'Cycle Sidebar Mode' },
    { keys: '⌥1-4', description: 'Switch Sidebar Tabs' },
    { keys: '⌘?', description: 'Keyboard Shortcuts' },
  ],
  'Writing': [
    { keys: '[[', description: 'Wiki Link' },
    { keys: '#', description: 'Tag' },
    { keys: '@', description: 'Citation' },
    { keys: '$', description: 'Math (inline)' },
    { keys: '$$', description: 'Math (block)' },
  ],
  'General': [
    { keys: 'ESC', description: 'Exit Focus/Preview/Modal' },
    { keys: '⌘,', description: 'Settings' },
  ],
}

/**
 * KeyboardShortcuts - Floating cheatsheet panel
 *
 * Triggered by ⌘? or ⌘/
 * ADHD-friendly: Quick reference without leaving context
 */
export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  // Close on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative bg-nexus-bg-secondary border border-white/10 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
        style={{ animation: 'panelMenuFadeIn 150ms ease' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-nexus-accent/10 flex items-center justify-center">
              <Keyboard className="w-4 h-4 text-nexus-accent" />
            </div>
            <h2 className="text-lg font-semibold text-nexus-text-primary">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-nexus-text-muted" />
          </button>
        </div>

        {/* Shortcuts grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(SHORTCUTS).map(([category, shortcuts]) => (
              <div key={category}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-nexus-text-muted mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.keys}
                      className="flex items-center justify-between py-1.5"
                    >
                      <span className="text-sm text-nexus-text-primary">
                        {shortcut.description}
                      </span>
                      <kbd className="px-2 py-1 text-xs font-mono bg-nexus-bg-tertiary text-nexus-text-muted rounded border border-white/10">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-nexus-bg-tertiary/50">
          <p className="text-xs text-nexus-text-muted text-center">
            Press <kbd className="px-1.5 py-0.5 bg-nexus-bg-tertiary rounded text-[10px] font-mono">ESC</kbd> to close
          </p>
        </div>
      </div>
    </div>
  )
}

export default KeyboardShortcuts
