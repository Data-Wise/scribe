import { useEffect, useState } from 'react'
import { X, Info } from 'lucide-react'

const STORAGE_KEY = 'hasSeenSidebarGuide'

/**
 * IconLegend - First-launch guide explaining sidebar icons
 *
 * Shows once on first app launch, dismissible with "Got it" button.
 * Uses localStorage to track if user has seen the guide.
 * ADHD-friendly: Simple, clear, one-button dismiss.
 */
export function IconLegend() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has seen the guide
    const hasSeen = localStorage.getItem(STORAGE_KEY)
    if (hasSeen !== 'true') {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setIsVisible(false)
  }

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleDismiss()
      }
    }

    if (isVisible) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss()
      }}
      data-testid="icon-legend-overlay"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-nexus-bg-secondary border border-white/10 rounded-xl shadow-2xl max-w-md w-full mx-4"
        style={{ animation: 'panelMenuFadeIn 150ms ease' }}
        role="dialog"
        aria-labelledby="icon-legend-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-nexus-accent/10 flex items-center justify-center">
              <Info className="w-4 h-4 text-nexus-accent" />
            </div>
            <h2
              id="icon-legend-title"
              className="text-lg font-semibold text-nexus-text-primary"
            >
              Sidebar Guide
            </h2>
          </div>
          <button
            onClick={handleDismiss}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close guide"
            data-testid="icon-legend-close"
          >
            <X className="w-5 h-5 text-nexus-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-3 text-sm">
            {/* Icon explanations */}
            <div className="flex items-center gap-3">
              <span className="text-lg">🔵</span>
              <span className="text-nexus-text-primary">Active project</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">⚪</span>
              <span className="text-nexus-text-primary">Inactive project</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">📥</span>
              <span className="text-nexus-text-primary">Inbox (quick notes)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">🔍</span>
              <span className="text-nexus-text-primary">Search all notes</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">📅</span>
              <span className="text-nexus-text-primary">Today's daily note</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">⚙️</span>
              <span className="text-nexus-text-primary">Settings</span>
            </div>
          </div>

          {/* Tip */}
          <div className="pt-3 border-t border-white/10">
            <p className="text-sm text-nexus-text-muted">
              <span className="text-nexus-accent font-medium">Tip:</span> Click any dot to expand the sidebar.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10">
          <button
            onClick={handleDismiss}
            className="w-full px-4 py-2.5 bg-nexus-accent hover:bg-nexus-accent-hover text-white rounded-lg transition-colors font-medium"
            data-testid="icon-legend-dismiss"
            autoFocus
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
