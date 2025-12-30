import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ClaudeChatPanel } from '../components/ClaudeChatPanel'

// Mock platform detection
vi.mock('../lib/platform', () => ({
  isBrowser: vi.fn(() => true),
  isTauri: vi.fn(() => false)
}))

describe('ClaudeChatPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the chat panel', () => {
      render(<ClaudeChatPanel />)
      expect(screen.getByTestId('claude-chat-panel')).toBeInTheDocument()
    })

    it('renders header with Claude Assistant title', () => {
      render(<ClaudeChatPanel />)
      expect(screen.getByText('Claude Assistant')).toBeInTheDocument()
    })

    it('renders empty state when no messages', () => {
      render(<ClaudeChatPanel />)
      expect(screen.getByText('Ask Claude anything about your writing.')).toBeInTheDocument()
    })

    it('renders input area', () => {
      render(<ClaudeChatPanel />)
      expect(screen.getByTestId('chat-input')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Ask Claude...')).toBeInTheDocument()
    })

    it('renders send button', () => {
      render(<ClaudeChatPanel />)
      expect(screen.getByTestId('send-button')).toBeInTheDocument()
    })

    it('renders keyboard hints', () => {
      render(<ClaudeChatPanel />)
      expect(screen.getByText(/Enter to send/)).toBeInTheDocument()
      expect(screen.getByText(/Shift\+Enter for new line/)).toBeInTheDocument()
    })

    it('shows note context when provided', () => {
      render(<ClaudeChatPanel noteContext={{ title: 'Test Note', content: 'Test content' }} />)
      expect(screen.getByText(/Context: Test Note/)).toBeInTheDocument()
    })
  })

  describe('Input Handling', () => {
    it('updates input value on change', () => {
      render(<ClaudeChatPanel />)
      const input = screen.getByTestId('chat-input')
      fireEvent.change(input, { target: { value: 'test message' } })
      expect(input).toHaveValue('test message')
    })

    it('send button is disabled when input is empty', () => {
      render(<ClaudeChatPanel />)
      const sendButton = screen.getByTestId('send-button')
      expect(sendButton).toBeDisabled()
    })

    it('send button is enabled when input has text', () => {
      render(<ClaudeChatPanel />)
      const input = screen.getByTestId('chat-input')
      fireEvent.change(input, { target: { value: 'test' } })
      const sendButton = screen.getByTestId('send-button')
      expect(sendButton).not.toBeDisabled()
    })
  })

  describe('Message Sending', () => {
    it('adds user message when form is submitted', async () => {
      render(<ClaudeChatPanel />)
      const input = screen.getByTestId('chat-input')

      fireEvent.change(input, { target: { value: 'test question' } })
      fireEvent.submit(input.closest('form')!)

      await waitFor(() => {
        expect(screen.getByTestId('message-user')).toBeInTheDocument()
        expect(screen.getByText('test question')).toBeInTheDocument()
      })
    })

    it('adds user message when Enter is pressed', async () => {
      render(<ClaudeChatPanel />)
      const input = screen.getByTestId('chat-input')

      fireEvent.change(input, { target: { value: 'another question' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      await waitFor(() => {
        expect(screen.getByText('another question')).toBeInTheDocument()
      })
    })

    it('does not submit when Shift+Enter is pressed', () => {
      render(<ClaudeChatPanel />)
      const input = screen.getByTestId('chat-input')

      fireEvent.change(input, { target: { value: 'test' } })
      fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })

      expect(screen.queryByTestId('message-user')).not.toBeInTheDocument()
    })

    it('does not submit when input is empty', () => {
      render(<ClaudeChatPanel />)
      const input = screen.getByTestId('chat-input')

      fireEvent.keyDown(input, { key: 'Enter' })

      expect(screen.queryByTestId('message-user')).not.toBeInTheDocument()
    })

    it('clears input after sending', async () => {
      render(<ClaudeChatPanel />)
      const input = screen.getByTestId('chat-input')

      fireEvent.change(input, { target: { value: 'test' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      await waitFor(() => {
        expect(input).toHaveValue('')
      })
    })

    it('shows loading indicator while waiting for response', async () => {
      const slowSubmit = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('response'), 100))
      )
      render(<ClaudeChatPanel onSubmit={slowSubmit} />)
      const input = screen.getByTestId('chat-input')

      fireEvent.change(input, { target: { value: 'test' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
      expect(screen.getByText('Thinking...')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument()
      })
    })

    it('shows assistant response after submit', async () => {
      const mockSubmit = vi.fn().mockResolvedValue('This is the AI response')
      render(<ClaudeChatPanel onSubmit={mockSubmit} />)
      const input = screen.getByTestId('chat-input')

      fireEvent.change(input, { target: { value: 'test' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      await waitFor(() => {
        expect(screen.getByTestId('message-assistant')).toBeInTheDocument()
        expect(screen.getByText('This is the AI response')).toBeInTheDocument()
      })
    })

    it('shows error message on submit failure', async () => {
      const failingSubmit = vi.fn().mockRejectedValue(new Error('API Error'))
      render(<ClaudeChatPanel onSubmit={failingSubmit} />)
      const input = screen.getByTestId('chat-input')

      fireEvent.change(input, { target: { value: 'test' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      await waitFor(() => {
        expect(screen.getByText('Error: API Error')).toBeInTheDocument()
      })
    })
  })

  describe('Browser Mode', () => {
    it('returns browser mode message when using default handler', async () => {
      render(<ClaudeChatPanel />)
      const input = screen.getByTestId('chat-input')

      fireEvent.change(input, { target: { value: 'test' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      await waitFor(() => {
        expect(screen.getByText(/AI features are only available in the desktop app/)).toBeInTheDocument()
      })
    })
  })

  describe('Chat History', () => {
    it('maintains message history across multiple messages', async () => {
      const mockSubmit = vi.fn()
        .mockResolvedValueOnce('First response')
        .mockResolvedValueOnce('Second response')
      render(<ClaudeChatPanel onSubmit={mockSubmit} />)
      const input = screen.getByTestId('chat-input')

      // First message
      fireEvent.change(input, { target: { value: 'first question' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      await waitFor(() => {
        expect(screen.getByText('First response')).toBeInTheDocument()
      })

      // Second message
      fireEvent.change(input, { target: { value: 'second question' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      await waitFor(() => {
        // All messages should be visible
        expect(screen.getByText('first question')).toBeInTheDocument()
        expect(screen.getByText('First response')).toBeInTheDocument()
        expect(screen.getByText('second question')).toBeInTheDocument()
        expect(screen.getByText('Second response')).toBeInTheDocument()
      })
    })

    it('shows clear button when messages exist', async () => {
      const mockSubmit = vi.fn().mockResolvedValue('response')
      render(<ClaudeChatPanel onSubmit={mockSubmit} />)
      const input = screen.getByTestId('chat-input')

      // Initially no clear button
      expect(screen.queryByTestId('clear-chat-button')).not.toBeInTheDocument()

      // Send a message
      fireEvent.change(input, { target: { value: 'test' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      await waitFor(() => {
        expect(screen.getByTestId('clear-chat-button')).toBeInTheDocument()
      })
    })

    it('clears all messages when clear button is clicked', async () => {
      const mockSubmit = vi.fn().mockResolvedValue('response')
      render(<ClaudeChatPanel onSubmit={mockSubmit} />)
      const input = screen.getByTestId('chat-input')

      // Send a message
      fireEvent.change(input, { target: { value: 'test' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      await waitFor(() => {
        expect(screen.getByText('response')).toBeInTheDocument()
      })

      // Clear chat
      const clearButton = screen.getByTestId('clear-chat-button')
      fireEvent.click(clearButton)

      // Messages should be gone, empty state should return
      expect(screen.queryByText('test')).not.toBeInTheDocument()
      expect(screen.queryByText('response')).not.toBeInTheDocument()
      expect(screen.getByText('Ask Claude anything about your writing.')).toBeInTheDocument()
    })
  })

  describe('Context Awareness', () => {
    it('includes note context in prompt when provided', async () => {
      const mockSubmit = vi.fn().mockResolvedValue('response')
      render(<ClaudeChatPanel
        noteContext={{ title: 'My Note', content: 'Note content here' }}
        onSubmit={mockSubmit}
      />)
      const input = screen.getByTestId('chat-input')

      fireEvent.change(input, { target: { value: 'question' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled()
        const callArg = mockSubmit.mock.calls[0][0]
        expect(callArg).toContain('My Note')
        expect(callArg).toContain('Note content here')
        expect(callArg).toContain('question')
      })
    })
  })

  describe('@ References', () => {
    const mockNotes = [
      { id: 'note-1', title: 'Research Notes', content: 'Research content' },
      { id: 'note-2', title: 'Meeting Notes', content: 'Meeting content' },
      { id: 'note-3', title: 'Daily Journal', content: 'Journal content' }
    ]

    it('shows @ menu when typing @', async () => {
      render(<ClaudeChatPanel availableNotes={mockNotes} />)
      const input = screen.getByTestId('chat-input')

      fireEvent.change(input, { target: { value: '@', selectionStart: 1 } })

      await waitFor(() => {
        expect(screen.getByTestId('at-mention-menu')).toBeInTheDocument()
      })
    })

    it('filters notes based on query after @', async () => {
      render(<ClaudeChatPanel availableNotes={mockNotes} />)
      const input = screen.getByTestId('chat-input')

      fireEvent.change(input, { target: { value: '@Research', selectionStart: 9 } })

      await waitFor(() => {
        expect(screen.getByText('Research Notes')).toBeInTheDocument()
        expect(screen.queryByText('Meeting Notes')).not.toBeInTheDocument()
      })
    })

    it('adds referenced note chip when selecting from menu', async () => {
      render(<ClaudeChatPanel availableNotes={mockNotes} />)
      const input = screen.getByTestId('chat-input')

      // Open menu
      fireEvent.change(input, { target: { value: '@', selectionStart: 1 } })

      await waitFor(() => {
        expect(screen.getByTestId('at-mention-menu')).toBeInTheDocument()
      })

      // Click on a note
      fireEvent.click(screen.getByText('Research Notes'))

      await waitFor(() => {
        expect(screen.getByTestId('referenced-notes')).toBeInTheDocument()
        expect(screen.getByText('Research Notes')).toBeInTheDocument()
      })
    })

    it('includes referenced notes in prompt when submitted', async () => {
      const mockSubmit = vi.fn().mockResolvedValue('response')
      render(<ClaudeChatPanel availableNotes={mockNotes} onSubmit={mockSubmit} />)
      const input = screen.getByTestId('chat-input')

      // Open menu and select note
      fireEvent.change(input, { target: { value: '@', selectionStart: 1 } })
      await waitFor(() => {
        expect(screen.getByTestId('at-mention-menu')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Research Notes'))

      // Type question and submit
      fireEvent.change(input, { target: { value: 'summarize this' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled()
        const callArg = mockSubmit.mock.calls[0][0]
        expect(callArg).toContain('Research Notes')
        expect(callArg).toContain('Research content')
      })
    })

    it('navigates menu with arrow keys', async () => {
      render(<ClaudeChatPanel availableNotes={mockNotes} />)
      const input = screen.getByTestId('chat-input')

      fireEvent.change(input, { target: { value: '@', selectionStart: 1 } })

      await waitFor(() => {
        expect(screen.getByTestId('at-mention-menu')).toBeInTheDocument()
      })

      // Press down arrow to select second item
      fireEvent.keyDown(input, { key: 'ArrowDown' })

      // Second item should be highlighted (Meeting Notes)
      const menuItems = screen.getByTestId('at-mention-menu').querySelectorAll('button')
      expect(menuItems[1].className).toContain('bg-nexus-accent/20')
    })

    it('closes menu with Escape key', async () => {
      render(<ClaudeChatPanel availableNotes={mockNotes} />)
      const input = screen.getByTestId('chat-input')

      fireEvent.change(input, { target: { value: '@', selectionStart: 1 } })

      await waitFor(() => {
        expect(screen.getByTestId('at-mention-menu')).toBeInTheDocument()
      })

      fireEvent.keyDown(input, { key: 'Escape' })

      await waitFor(() => {
        expect(screen.queryByTestId('at-mention-menu')).not.toBeInTheDocument()
      })
    })

    it('shows hint about @ references in footer', () => {
      render(<ClaudeChatPanel />)
      expect(screen.getByText(/Type @ to reference notes/)).toBeInTheDocument()
    })
  })
})
