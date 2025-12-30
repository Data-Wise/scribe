import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Sparkles, Send, Loader2, Trash2, User, Bot, FileText, Copy, Check } from 'lucide-react'
import { isBrowser } from '../lib/platform'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface NoteReference {
  id: string
  title: string
  content: string
}

interface ClaudeChatPanelProps {
  /** Optional context about current note to include in prompts */
  noteContext?: {
    title: string
    content: string
  }
  /** Called when user submits a message */
  onSubmit?: (message: string) => Promise<string>
  /** Notes available for @ reference autocomplete */
  availableNotes?: NoteReference[]
}

/**
 * CopyButton - Small button to copy code to clipboard
 */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-white/10 transition-colors"
      title={copied ? 'Copied!' : 'Copy code'}
    >
      {copied ? (
        <Check className="w-3 h-3" style={{ color: 'var(--nexus-accent)' }} />
      ) : (
        <Copy className="w-3 h-3" style={{ color: 'var(--nexus-text-muted)' }} />
      )}
    </button>
  )
}

/**
 * ClaudeChatPanel - Full-height AI chat interface for right sidebar
 *
 * ADHD-friendly features:
 * - Message history persists within session
 * - Keyboard-first (Enter to send)
 * - Clear visual distinction between user/assistant messages
 * - Non-intrusive placement in sidebar
 * - Markdown rendering with syntax highlighting
 *
 * Browser mode: Returns "AI features are only available in the desktop app."
 */
export function ClaudeChatPanel({
  noteContext,
  onSubmit: externalOnSubmit,
  availableNotes = []
}: ClaudeChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showAtMenu, setShowAtMenu] = useState(false)
  const [atQuery, setAtQuery] = useState('')
  const [atMenuIndex, setAtMenuIndex] = useState(0)
  const [referencedNotes, setReferencedNotes] = useState<NoteReference[]>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const atMenuRef = useRef<HTMLDivElement>(null)

  // Filter notes based on @ query
  const filteredNotes = useMemo(() => {
    if (!atQuery) return availableNotes.slice(0, 5)
    const query = atQuery.toLowerCase()
    return availableNotes
      .filter(n => n.title.toLowerCase().includes(query))
      .slice(0, 5)
  }, [availableNotes, atQuery])

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
      // Build context from current note and referenced notes
      let fullPrompt = trimmedInput
      const contexts: string[] = []

      if (noteContext) {
        contexts.push(`Current note: "${noteContext.title}"\n${noteContext.content.slice(0, 800)}${noteContext.content.length > 800 ? '...' : ''}`)
      }

      // Add referenced notes
      referencedNotes.forEach(note => {
        contexts.push(`Referenced note: "${note.title}"\n${note.content.slice(0, 500)}${note.content.length > 500 ? '...' : ''}`)
      })

      if (contexts.length > 0) {
        fullPrompt = `Context:\n${contexts.join('\n\n---\n\n')}\n\nQuestion: ${trimmedInput}`
      }

      const response = await onSubmit(fullPrompt)

      // Clear referenced notes after submit
      setReferencedNotes([])

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
  }, [input, isLoading, onSubmit, noteContext, referencedNotes])

  // Handle @ menu selection
  const handleSelectNote = useCallback((note: NoteReference) => {
    // Add to referenced notes if not already included
    if (!referencedNotes.find(n => n.id === note.id)) {
      setReferencedNotes(prev => [...prev, note])
    }
    // Remove the @query from input
    const cursorPos = inputRef.current?.selectionStart || 0
    const textBefore = input.slice(0, cursorPos)
    const atIndex = textBefore.lastIndexOf('@')
    if (atIndex !== -1) {
      const newInput = input.slice(0, atIndex) + input.slice(cursorPos)
      setInput(newInput)
    }
    setShowAtMenu(false)
    setAtQuery('')
    setAtMenuIndex(0)
    inputRef.current?.focus()
  }, [input, referencedNotes])

  // Handle removing a referenced note
  const handleRemoveReference = useCallback((noteId: string) => {
    setReferencedNotes(prev => prev.filter(n => n.id !== noteId))
  }, [])

  // Handle input change to detect @ trigger
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setInput(newValue)

    // Check for @ trigger
    const cursorPos = e.target.selectionStart
    const textBefore = newValue.slice(0, cursorPos)
    const atIndex = textBefore.lastIndexOf('@')

    if (atIndex !== -1) {
      const charBeforeAt = atIndex > 0 ? textBefore[atIndex - 1] : ' '
      // Only trigger if @ is at start or after whitespace
      if (atIndex === 0 || /\s/.test(charBeforeAt)) {
        const query = textBefore.slice(atIndex + 1)
        // Only show menu if query doesn't contain spaces (still typing the reference)
        if (!query.includes(' ')) {
          setAtQuery(query)
          setShowAtMenu(true)
          setAtMenuIndex(0)
          return
        }
      }
    }
    setShowAtMenu(false)
    setAtQuery('')
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle @ menu navigation
    if (showAtMenu && filteredNotes.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setAtMenuIndex(prev => (prev + 1) % filteredNotes.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setAtMenuIndex(prev => (prev - 1 + filteredNotes.length) % filteredNotes.length)
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        handleSelectNote(filteredNotes[atMenuIndex])
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setShowAtMenu(false)
        setAtQuery('')
        return
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit, showAtMenu, filteredNotes, atMenuIndex, handleSelectNote])

  const handleClearChat = useCallback(() => {
    setMessages([])
    setReferencedNotes([])
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
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                ) : (
                  <div className="claude-markdown prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Code blocks with copy button
                        code({ className, children, ...props }) {
                          const isInline = !className
                          const match = /language-(\w+)/.exec(className || '')
                          const language = match ? match[1] : ''
                          const codeString = String(children).replace(/\n$/, '')

                          if (isInline) {
                            return (
                              <code
                                className="px-1 py-0.5 rounded text-[11px] font-mono"
                                style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
                                {...props}
                              >
                                {children}
                              </code>
                            )
                          }

                          return (
                            <div className="relative group my-2">
                              <div className="flex items-center justify-between px-2 py-1 rounded-t text-[10px]"
                                style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                                <span style={{ color: 'var(--nexus-text-muted)' }}>{language || 'code'}</span>
                                <CopyButton text={codeString} />
                              </div>
                              <pre className="p-2 rounded-b overflow-x-auto text-[11px]"
                                style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                                <code className="font-mono" {...props}>{children}</code>
                              </pre>
                            </div>
                          )
                        },
                        // Style other elements
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                        li: ({ children }) => <li className="mb-0.5">{children}</li>,
                        h1: ({ children }) => <h1 className="text-sm font-bold mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xs font-bold mb-1.5">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-xs font-semibold mb-1">{children}</h3>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        a: ({ href, children }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer"
                            className="underline hover:opacity-80" style={{ color: 'var(--nexus-accent)' }}>
                            {children}
                          </a>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 pl-2 my-2 opacity-80"
                            style={{ borderColor: 'var(--nexus-accent)' }}>
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
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
        {/* Referenced notes chips */}
        {referencedNotes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2" data-testid="referenced-notes">
            {referencedNotes.map(note => (
              <span
                key={note.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px]"
                style={{
                  backgroundColor: 'var(--nexus-accent)',
                  color: 'white',
                  opacity: 0.9
                }}
              >
                <FileText className="w-2.5 h-2.5" />
                <span className="max-w-[100px] truncate">{note.title}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveReference(note.id)}
                  className="ml-0.5 hover:opacity-70"
                  title="Remove reference"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="relative">
          {/* @ mention menu */}
          {showAtMenu && filteredNotes.length > 0 && (
            <div
              ref={atMenuRef}
              className="absolute bottom-full left-0 mb-1 w-full max-h-[150px] overflow-y-auto rounded-lg shadow-lg z-10"
              style={{ backgroundColor: 'var(--nexus-bg-secondary)' }}
              data-testid="at-mention-menu"
            >
              {filteredNotes.map((note, index) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => handleSelectNote(note)}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 transition-colors ${
                    index === atMenuIndex ? 'bg-nexus-accent/20' : 'hover:bg-nexus-bg-tertiary/50'
                  }`}
                  style={{ color: 'var(--nexus-text-primary)' }}
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--nexus-text-muted)' }} />
                  <span className="truncate">{note.title}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
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
        </div>
        <div
          className="mt-1 text-[10px] px-1"
          style={{ color: 'var(--nexus-text-muted)' }}
        >
          Enter to send • Shift+Enter for new line • Type @ to reference notes
        </div>
      </form>
    </div>
  )
}

export default ClaudeChatPanel
