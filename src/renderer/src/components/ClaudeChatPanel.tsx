import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, Send, Loader2, Trash2, User, Bot } from 'lucide-react'
import { isBrowser } from '../lib/platform'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ClaudeChatPanelProps {
  /** Optional context about current note to include in prompts */
  noteContext?: {
    title: string
    content: string
  }
  /** Called when user submits a message */
  onSubmit?: (message: string) => Promise<string>
}

/**
 * ClaudeChatPanel - Full-height AI chat interface for right sidebar
 *
 * ADHD-friendly features:
 * - Message history persists within session
 * - Keyboard-first (Enter to send)
 * - Clear visual distinction between user/assistant messages
 * - Non-intrusive placement in sidebar
 *
 * Browser mode: Returns "AI features are only available in the desktop app."
 */
export function ClaudeChatPanel({
  noteContext,
  onSubmit: externalOnSubmit
}: ClaudeChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Default submit handler for browser mode
  const defaultOnSubmit = useCallback(async (message: string): Promise<string> => {
    if (isBrowser()) {
      return 'AI features are only available in the desktop app. Run `npm run dev` for full Tauri mode.'
    }
    // Placeholder for Tauri mode - will be wired up later
    return `AI response to: "${message}" (Tauri AI integration pending)`
  }, [])

  const onSubmit = externalOnSubmit || defaultOnSubmit

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()

    const trimmedInput = input.trim()
    if (!trimmedInput || isLoading) return

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedInput,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Include note context if available
      let fullPrompt = trimmedInput
      if (noteContext) {
        fullPrompt = `Context: I'm working on a note titled "${noteContext.title}".\n\nNote content:\n${noteContext.content.slice(0, 1000)}${noteContext.content.length > 1000 ? '...' : ''}\n\nQuestion: ${trimmedInput}`
      }

      const response = await onSubmit(fullPrompt)

      // Add assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      // Add error as assistant message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Failed to get response'}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      // Re-focus input after response
      inputRef.current?.focus()
    }
  }, [input, isLoading, onSubmit, noteContext])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  const handleClearChat = useCallback(() => {
    setMessages([])
  }, [])

  return (
    <div
      className="flex flex-col h-full"
      data-testid="claude-chat-panel"
    >
      {/* Header with clear button */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b shrink-0"
        style={{ borderColor: 'var(--nexus-bg-tertiary)' }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-nexus-accent" />
          <span className="text-xs font-medium" style={{ color: 'var(--nexus-text-primary)' }}>
            Claude Assistant
          </span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            className="p-1 rounded hover:bg-nexus-bg-tertiary/50 transition-colors"
            title="Clear chat"
            data-testid="clear-chat-button"
          >
            <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--nexus-text-muted)' }} />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-3"
        data-testid="messages-container"
      >
        {messages.length === 0 ? (
          <div
            className="text-center py-8 text-xs"
            style={{ color: 'var(--nexus-text-muted)' }}
          >
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>Ask Claude anything about your writing.</p>
            {noteContext && (
              <p className="mt-1 opacity-60">
                Context: {noteContext.title}
              </p>
            )}
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              data-testid={`message-${msg.role}`}
            >
              {msg.role === 'assistant' && (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--nexus-accent)', opacity: 0.8 }}
                >
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] px-3 py-2 rounded-lg text-xs ${
                  msg.role === 'user'
                    ? 'rounded-br-sm'
                    : 'rounded-bl-sm'
                }`}
                style={{
                  backgroundColor: msg.role === 'user'
                    ? 'var(--nexus-accent)'
                    : 'var(--nexus-bg-tertiary)',
                  color: msg.role === 'user'
                    ? 'white'
                    : 'var(--nexus-text-primary)'
                }}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
              {msg.role === 'user' && (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--nexus-bg-tertiary)' }}
                >
                  <User className="w-3.5 h-3.5" style={{ color: 'var(--nexus-text-muted)' }} />
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-2 justify-start" data-testid="loading-indicator">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--nexus-accent)', opacity: 0.8 }}
            >
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div
              className="px-3 py-2 rounded-lg rounded-bl-sm text-xs flex items-center gap-2"
              style={{ backgroundColor: 'var(--nexus-bg-tertiary)' }}
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--nexus-text-muted)' }} />
              <span style={{ color: 'var(--nexus-text-muted)' }}>Thinking...</span>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="p-2 border-t shrink-0"
        style={{ borderColor: 'var(--nexus-bg-tertiary)' }}
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Claude..."
            disabled={isLoading}
            rows={1}
            className="flex-1 px-3 py-2 rounded text-xs outline-none resize-none disabled:opacity-50"
            style={{
              backgroundColor: 'var(--nexus-bg-tertiary)',
              color: 'var(--nexus-text-primary)',
              minHeight: '36px',
              maxHeight: '100px'
            }}
            data-testid="chat-input"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 rounded transition-colors disabled:opacity-30 shrink-0"
            style={{
              backgroundColor: input.trim() && !isLoading ? 'var(--nexus-accent)' : 'transparent',
              color: input.trim() && !isLoading ? 'white' : 'var(--nexus-text-muted)'
            }}
            title="Send (Enter)"
            data-testid="send-button"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div
          className="mt-1 text-[10px] px-1"
          style={{ color: 'var(--nexus-text-muted)' }}
        >
          Enter to send • Shift+Enter for new line
        </div>
      </form>
    </div>
  )
}

export default ClaudeChatPanel
