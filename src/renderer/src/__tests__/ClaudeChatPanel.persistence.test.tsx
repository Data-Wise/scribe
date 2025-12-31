import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ClaudeChatPanel } from '../components/ClaudeChatPanel'

// Mock platform detection first
vi.mock('../lib/platform', () => ({
  isBrowser: vi.fn(() => false),
  isTauri: vi.fn(() => true)
}))

// Mock API - must be defined inline to avoid hoisting issues
vi.mock('../lib/api', () => ({
  api: {
    getOrCreateChatSession: vi.fn(),
    saveChatMessage: vi.fn(),
    loadChatSession: vi.fn(),
    clearChatSession: vi.fn(),
    deleteChatSession: vi.fn(),
    runClaude: vi.fn(),
  }
}))

// Import api after mocking to get the mocked version
import { api } from '../lib/api'

describe('ClaudeChatPanel - Persistence Integration', () => {
  const mockNoteContext = {
    title: 'Test Note',
    content: 'Test content for persistence testing'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.getOrCreateChatSession).mockResolvedValue('test-session-123')
    vi.mocked(api.saveChatMessage).mockResolvedValue('msg-id')
    vi.mocked(api.loadChatSession).mockResolvedValue([])
    vi.mocked(api.clearChatSession).mockResolvedValue(undefined)
    vi.mocked(api.deleteChatSession).mockResolvedValue(undefined)
    vi.mocked(api.runClaude).mockResolvedValue('AI response')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Session Management', () => {
    it('creates session when note context is provided', async () => {
      render(<ClaudeChatPanel noteContext={mockNoteContext} />)

      // Should attempt to get or create session
      await waitFor(() => {
        expect(api.getOrCreateChatSession).toHaveBeenCalled()
      })
    })

    it('loads existing messages when session exists', async () => {
      const existingMessages = [
        { id: '1', role: 'user', content: 'Hello', timestamp: 1000 },
        { id: '2', role: 'assistant', content: 'Hi there!', timestamp: 2000 }
      ]

      vi.mocked(api.loadChatSession).mockResolvedValue(existingMessages)

      render(<ClaudeChatPanel noteContext={mockNoteContext} />)

      await waitFor(() => {
        expect(api.loadChatSession).toHaveBeenCalledWith('test-session-123')
      })

      // Messages should be rendered
      await waitFor(() => {
        expect(screen.getByText('Hello')).toBeInTheDocument()
        expect(screen.getByText('Hi there!')).toBeInTheDocument()
      })
    })

    it('does not create session when no note context', () => {
      render(<ClaudeChatPanel />)

      expect(api.getOrCreateChatSession).not.toHaveBeenCalled()
    })
  })

  describe('Message Persistence', () => {
    it('saves user message to database', async () => {
      render(<ClaudeChatPanel noteContext={mockNoteContext} />)

      // Wait for session to be created
      await waitFor(() => {
        expect(api.getOrCreateChatSession).toHaveBeenCalled()
      })

      const input = screen.getByTestId('chat-input')
      const sendButton = screen.getByTestId('send-button')

      fireEvent.change(input, { target: { value: 'Test message' } })
      fireEvent.click(sendButton)

      await waitFor(() => {
        expect(api.saveChatMessage).toHaveBeenCalledWith(
          'test-session-123',
          'user',
          'Test message',
          expect.any(Number)
        )
      })
    })

    it('saves AI response to database', async () => {
      vi.mocked(api.runClaude).mockResolvedValue('AI response here')

      render(<ClaudeChatPanel noteContext={mockNoteContext} />)

      // Wait for session to be created
      await waitFor(() => {
        expect(api.getOrCreateChatSession).toHaveBeenCalled()
      })

      const input = screen.getByTestId('chat-input')
      fireEvent.change(input, { target: { value: 'Question' } })
      fireEvent.submit(input.closest('form')!)

      await waitFor(() => {
        expect(api.saveChatMessage).toHaveBeenCalledWith(
          'test-session-123',
          'assistant',
          'AI response here',
          expect.any(Number)
        )
      })
    })

    it('persists messages with timestamps in order', async () => {
      const startTime = Date.now()

      render(<ClaudeChatPanel noteContext={mockNoteContext} />)

      // Wait for session to be created
      await waitFor(() => {
        expect(api.getOrCreateChatSession).toHaveBeenCalled()
      })

      const input = screen.getByTestId('chat-input')
      fireEvent.change(input, { target: { value: 'Message 1' } })
      fireEvent.submit(input.closest('form')!)

      await waitFor(() => {
        expect(api.saveChatMessage).toHaveBeenCalledTimes(2) // user + assistant
      })

      const calls = vi.mocked(api.saveChatMessage).mock.calls
      const userMessageTimestamp = calls[0][3]
      const assistantMessageTimestamp = calls[1][3]

      expect(userMessageTimestamp).toBeGreaterThanOrEqual(startTime)
      expect(assistantMessageTimestamp).toBeGreaterThanOrEqual(userMessageTimestamp)
    })
  })

  describe('Quick Actions with Persistence', () => {
    it('persists quick action prompts and responses', async () => {
      render(<ClaudeChatPanel noteContext={mockNoteContext} />)

      // Wait for session to be created
      await waitFor(() => {
        expect(api.getOrCreateChatSession).toHaveBeenCalled()
      })

      const improveBtn = screen.getByText('Improve')
      fireEvent.click(improveBtn)

      await waitFor(() => {
        // User message (quick action prompt)
        expect(api.saveChatMessage).toHaveBeenCalledWith(
          'test-session-123',
          'user',
          'Improve clarity and flow',
          expect.any(Number)
        )

        // AI response
        expect(api.saveChatMessage).toHaveBeenCalledWith(
          'test-session-123',
          'assistant',
          'AI response',
          expect.any(Number)
        )
      })
    })
  })

  describe('Clear Chat', () => {
    it('clears messages from database', async () => {
      render(<ClaudeChatPanel noteContext={mockNoteContext} />)

      // Simulate having messages
      const input = screen.getByTestId('chat-input')
      fireEvent.change(input, { target: { value: 'Test' } })
      fireEvent.submit(input.closest('form')!)

      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument()
      })

      // Clear chat
      const clearButton = screen.getByTitle(/clear chat/i)
      fireEvent.click(clearButton)

      await waitFor(() => {
        expect(api.clearChatSession).toHaveBeenCalledWith('test-session-123')
      })
    })

    it('UI updates after clearing chat', async () => {
      api.loadChatSession.mockResolvedValue([
        { id: '1', role: 'user', content: 'Message', timestamp: 1000 }
      ])

      render(<ClaudeChatPanel noteContext={mockNoteContext} />)

      await waitFor(() => {
        expect(screen.getByText('Message')).toBeInTheDocument()
      })

      const clearButton = screen.getByTitle(/clear chat/i)
      fireEvent.click(clearButton)

      await waitFor(() => {
        expect(screen.queryByText('Message')).not.toBeInTheDocument()
        expect(screen.getByText(/Ask Claude anything/)).toBeInTheDocument()
      })
    })
  })

  describe('Session Lifecycle', () => {
    it('reuses session for same note', async () => {
      const { rerender } = render(<ClaudeChatPanel noteContext={mockNoteContext} />)

      await waitFor(() => {
        expect(api.getOrCreateChatSession).toHaveBeenCalledTimes(1)
      })

      // Rerender with same note
      rerender(<ClaudeChatPanel noteContext={mockNoteContext} />)

      // Should not create another session
      expect(api.getOrCreateChatSession).toHaveBeenCalledTimes(1)
    })

    it('creates new session when note changes', async () => {
      const { rerender } = render(<ClaudeChatPanel noteContext={mockNoteContext} />)

      await waitFor(() => {
        expect(api.getOrCreateChatSession).toHaveBeenCalledTimes(1)
      })

      // Change to different note
      const newNote = { title: 'Different Note', content: 'Different content' }
      rerender(<ClaudeChatPanel noteContext={newNote} />)

      await waitFor(() => {
        expect(api.getOrCreateChatSession).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Error Handling', () => {
    it('handles session creation failure gracefully', async () => {
      api.getOrCreateChatSession.mockRejectedValue(new Error('Database error'))

      render(<ClaudeChatPanel noteContext={mockNoteContext} />)

      // Should still render without crashing
      expect(screen.getByTestId('claude-chat-panel')).toBeInTheDocument()
    })

    it('handles message save failure gracefully', async () => {
      api.saveChatMessage.mockRejectedValue(new Error('Save failed'))

      render(<ClaudeChatPanel noteContext={mockNoteContext} />)

      const input = screen.getByTestId('chat-input')
      fireEvent.change(input, { target: { value: 'Test' } })
      fireEvent.submit(input.closest('form')!)

      // Message should still appear in UI even if save fails
      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument()
      })
    })

    it('handles load session failure gracefully', async () => {
      api.loadChatSession.mockRejectedValue(new Error('Load failed'))

      render(<ClaudeChatPanel noteContext={mockNoteContext} />)

      // Should render empty state
      expect(screen.getByText(/Ask Claude anything/)).toBeInTheDocument()
    })
  })

  describe('Message Recovery', () => {
    it('recovers messages after app restart', async () => {
      const savedMessages = [
        { id: '1', role: 'user', content: 'Previous question', timestamp: 1000 },
        { id: '2', role: 'assistant', content: 'Previous answer', timestamp: 2000 }
      ]

      api.loadChatSession.mockResolvedValue(savedMessages)

      // Simulate app restart by rendering fresh component
      render(<ClaudeChatPanel noteContext={mockNoteContext} />)

      await waitFor(() => {
        expect(screen.getByText('Previous question')).toBeInTheDocument()
        expect(screen.getByText('Previous answer')).toBeInTheDocument()
      })
    })

    it('maintains message order from database', async () => {
      const messages = [
        { id: '3', role: 'user', content: 'Third', timestamp: 3000 },
        { id: '1', role: 'user', content: 'First', timestamp: 1000 },
        { id: '2', role: 'assistant', content: 'Second', timestamp: 2000 }
      ]

      // Database returns messages sorted by timestamp
      api.loadChatSession.mockResolvedValue(
        messages.sort((a, b) => a.timestamp - b.timestamp)
      )

      render(<ClaudeChatPanel noteContext={mockNoteContext} />)

      await waitFor(() => {
        const messageElements = screen.getAllByText(/First|Second|Third/)
        expect(messageElements[0]).toHaveTextContent('First')
        expect(messageElements[1]).toHaveTextContent('Second')
        expect(messageElements[2]).toHaveTextContent('Third')
      })
    })
  })
})
