import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QuickChatPopover } from '../components/QuickChatPopover'

// Mock platform detection
vi.mock('../lib/platform', () => ({
  isBrowser: vi.fn(() => false),
  isTauri: vi.fn(() => true)
}))

describe('QuickChatPopover Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue('AI response')
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(<QuickChatPopover {...defaultProps} />)
      expect(screen.getByTestId('quick-chat-popover')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(<QuickChatPopover {...defaultProps} isOpen={false} />)
      expect(screen.queryByTestId('quick-chat-popover')).not.toBeInTheDocument()
    })

    it('renders header with Quick Chat title', () => {
      render(<QuickChatPopover {...defaultProps} />)
      expect(screen.getByText('Quick Chat')).toBeInTheDocument()
    })

    it('renders close button', () => {
      render(<QuickChatPopover {...defaultProps} />)
      expect(screen.getByTitle('Close (Escape)')).toBeInTheDocument()
    })

    it('renders input field', () => {
      render(<QuickChatPopover {...defaultProps} />)
      expect(screen.getByPlaceholderText('Ask a quick question...')).toBeInTheDocument()
    })

    it('renders keyboard hints', () => {
      render(<QuickChatPopover {...defaultProps} />)
      expect(screen.getByText(/Enter to send/)).toBeInTheDocument()
      expect(screen.getByText(/Escape to close/)).toBeInTheDocument()
    })
  })

  describe('Input Handling', () => {
    it('updates input value on change', () => {
      render(<QuickChatPopover {...defaultProps} />)
      const input = screen.getByPlaceholderText('Ask a quick question...')
      fireEvent.change(input, { target: { value: 'test question' } })
      expect(input).toHaveValue('test question')
    })

    it('auto-focuses input when opened', async () => {
      render(<QuickChatPopover {...defaultProps} />)
      await waitFor(() => {
        const input = screen.getByPlaceholderText('Ask a quick question...')
        expect(document.activeElement).toBe(input)
      }, { timeout: 100 })
    })
  })

  describe('Submit Handling', () => {
    it('calls onSubmit when form is submitted', async () => {
      render(<QuickChatPopover {...defaultProps} />)
      const input = screen.getByPlaceholderText('Ask a quick question...')

      fireEvent.change(input, { target: { value: 'test question' } })
      fireEvent.submit(input.closest('form')!)

      await waitFor(() => {
        expect(defaultProps.onSubmit).toHaveBeenCalledWith('test question')
      })
    })

    it('calls onSubmit when Enter is pressed', async () => {
      render(<QuickChatPopover {...defaultProps} />)
      const input = screen.getByPlaceholderText('Ask a quick question...')

      fireEvent.change(input, { target: { value: 'test question' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      await waitFor(() => {
        expect(defaultProps.onSubmit).toHaveBeenCalledWith('test question')
      })
    })

    it('does not submit when input is empty', () => {
      render(<QuickChatPopover {...defaultProps} />)
      const input = screen.getByPlaceholderText('Ask a quick question...')

      fireEvent.keyDown(input, { key: 'Enter' })

      expect(defaultProps.onSubmit).not.toHaveBeenCalled()
    })

    it('does not submit when input is only whitespace', () => {
      render(<QuickChatPopover {...defaultProps} />)
      const input = screen.getByPlaceholderText('Ask a quick question...')

      fireEvent.change(input, { target: { value: '   ' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(defaultProps.onSubmit).not.toHaveBeenCalled()
    })

    it('clears input after successful submit', async () => {
      render(<QuickChatPopover {...defaultProps} />)
      const input = screen.getByPlaceholderText('Ask a quick question...')

      fireEvent.change(input, { target: { value: 'test question' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      await waitFor(() => {
        expect(input).toHaveValue('')
      })
    })

    it('shows response after successful submit', async () => {
      render(<QuickChatPopover {...defaultProps} />)
      const input = screen.getByPlaceholderText('Ask a quick question...')

      fireEvent.change(input, { target: { value: 'test question' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      await waitFor(() => {
        expect(screen.getByText('AI response')).toBeInTheDocument()
      })
    })

    it('shows loading state during submit', async () => {
      const slowSubmit = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('response'), 100)))
      render(<QuickChatPopover {...defaultProps} onSubmit={slowSubmit} />)
      const input = screen.getByPlaceholderText('Ask a quick question...')

      fireEvent.change(input, { target: { value: 'test question' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(screen.getByText('Thinking...')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByText('Thinking...')).not.toBeInTheDocument()
      })
    })

    it('shows error message on submit failure', async () => {
      const failingSubmit = vi.fn().mockRejectedValue(new Error('API Error'))
      render(<QuickChatPopover {...defaultProps} onSubmit={failingSubmit} />)
      const input = screen.getByPlaceholderText('Ask a quick question...')

      fireEvent.change(input, { target: { value: 'test question' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      await waitFor(() => {
        expect(screen.getByText('API Error')).toBeInTheDocument()
      })
    })
  })

  describe('Close Handling', () => {
    it('calls onClose when close button is clicked', () => {
      render(<QuickChatPopover {...defaultProps} />)
      const closeButton = screen.getByTitle('Close (Escape)')

      fireEvent.click(closeButton)

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('calls onClose when Escape is pressed', () => {
      render(<QuickChatPopover {...defaultProps} />)

      fireEvent.keyDown(window, { key: 'Escape' })

      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('Browser Mode', () => {
    it('shows browser mode message and disables input', async () => {
      // Re-mock for browser mode
      const { isBrowser } = await import('../lib/platform')
      vi.mocked(isBrowser).mockReturnValue(true)

      render(<QuickChatPopover {...defaultProps} />)
      const input = screen.getByPlaceholderText('AI unavailable in browser mode')

      expect(input).toBeDisabled()
    })
  })
})
