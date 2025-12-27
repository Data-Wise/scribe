import { useEffect, useRef, useState } from 'react'
import { X, Zap } from 'lucide-react'

interface QuickCaptureOverlayProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (content: string, title?: string) => Promise<void>
}

export function QuickCaptureOverlay({ isOpen, onClose, onCapture }: QuickCaptureOverlayProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      // Generate a title from the first line or first few words
      const firstLine = content.split('\n')[0].trim()
      const title = firstLine.length > 50
        ? firstLine.slice(0, 50) + '...'
        : firstLine || 'Quick capture'

      await onCapture(content, title)
      setContent('')
      onClose()
    } catch (error) {
      console.error('Failed to capture:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  if (!isOpen) return null

  return (
    <div className="quick-capture-overlay fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-nexus-bg-secondary rounded-xl border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-nexus-text-primary">
            <Zap className="w-5 h-5 text-purple-500" />
            <span className="font-medium">Quick Capture</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-nexus-text-muted hover:text-nexus-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Capture your thought... (Cmd+Enter to save)"
            className="w-full h-32 bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2 text-nexus-text-primary placeholder:text-nexus-text-muted resize-none focus:outline-none focus:border-nexus-accent/50 focus:ring-1 focus:ring-nexus-accent/20"
            autoFocus
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
          <span className="text-xs text-nexus-text-muted">
            Saves to inbox • <kbd className="px-1 py-0.5 bg-white/10 rounded">⌘↵</kbd> to save
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-nexus-text-muted hover:text-nexus-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className="px-3 py-1.5 text-sm bg-nexus-accent text-white rounded-lg hover:bg-nexus-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Capture'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
