import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, Send, X, Loader2 } from 'lucide-react'

interface QuickChatPopoverProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (message: string) => Promise<string>
  anchorRef?: React.RefObject<HTMLElement>
}

/**
 * QuickChatPopover - Minimal AI chat interface for quick questions
 *
 * ADHD-friendly features:
 * - Single input field, no distractions
 * - Keyboard-first (Enter to send, Escape to close)
 * - Stays near status bar, doesn't obscure writing
 * - Auto-focuses input when opened
 */
export function QuickChatPopover({
  isOpen,
  onClose,
  onSubmit,
  anchorRef
}: QuickChatPopoverProps) {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure the popover is rendered
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorRef?.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose, anchorRef])

  // Handle keyboard shortcuts
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

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (!input.trim() || isLoading) return

    setIsLoading(true)
    setError(null)
    setResponse(null)

    try {
      const result = await onSubmit(input.trim())
      setResponse(result)
      setInput('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response')
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, onSubmit])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  if (!isOpen) return null

  return (
    <div
      ref={popoverRef}
      className="quick-chat-popover absolute bottom-full mb-2 right-0 w-80 rounded-lg shadow-lg border overflow-hidden"
      style={{
        backgroundColor: 'var(--nexus-bg-secondary)',
        borderColor: 'var(--nexus-bg-tertiary)',
        zIndex: 100
      }}
      data-testid="quick-chat-popover"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: 'var(--nexus-bg-tertiary)' }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-nexus-accent" />
          <span className="text-xs font-medium" style={{ color: 'var(--nexus-text-primary)' }}>
            Quick Chat
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-nexus-bg-tertiary/50 transition-colors"
          title="Close (Escape)"
        >
          <X className="w-3.5 h-3.5" style={{ color: 'var(--nexus-text-muted)' }} />
        </button>
      </div>

      {/* Response area (if any) */}
      {(response || error || isLoading) && (
        <div
          className="px-3 py-2 max-h-40 overflow-y-auto text-xs border-b"
          style={{ borderColor: 'var(--nexus-bg-tertiary)' }}
        >
          {isLoading && (
            <div className="flex items-center gap-2" style={{ color: 'var(--nexus-text-muted)' }}>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Thinking...</span>
            </div>
          )}
          {error && (
            <div className="text-red-400">{error}</div>
          )}
          {response && !isLoading && (
            <div style={{ color: 'var(--nexus-text-primary)' }} className="whitespace-pre-wrap">
              {response}
            </div>
          )}
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-2">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a quick question..."
            disabled={isLoading}
            className="flex-1 px-3 py-1.5 rounded text-xs outline-none disabled:opacity-50"
            style={{
              backgroundColor: 'var(--nexus-bg-tertiary)',
              color: 'var(--nexus-text-primary)'
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-1.5 rounded transition-colors disabled:opacity-30"
            style={{
              backgroundColor: input.trim() && !isLoading ? 'var(--nexus-accent)' : 'transparent',
              color: input.trim() && !isLoading ? 'white' : 'var(--nexus-text-muted)'
            }}
            title="Send (Enter)"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="mt-1 text-[10px] px-1" style={{ color: 'var(--nexus-text-muted)' }}>
          Enter to send • Escape to close
        </div>
      </form>
    </div>
  )
}

export default QuickChatPopover
