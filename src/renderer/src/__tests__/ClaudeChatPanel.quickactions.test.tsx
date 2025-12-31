import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ClaudeChatPanel } from '../components/ClaudeChatPanel'

// Mock platform detection
vi.mock('../lib/platform', () => ({
  isBrowser: vi.fn(() => true),
  isTauri: vi.fn(() => false)
}))

describe('ClaudeChatPanel - Quick Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockNoteContext = {
    title: 'Research Methods',
    content: 'This is a test note about research methodology in statistics.'
  }

  describe('Quick Actions Rendering', () => {
    it('renders quick actions when note context is provided', () => {
      render(<ClaudeChatPanel noteContext={mockNoteContext} />)
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument()
    })

    it('does not render quick actions when no note context', () => {
      render(<ClaudeChatPanel />)
      expect(screen.queryByTestId('quick-actions')).not.toBeInTheDocument()
    })

    it('renders all 5 quick action buttons', () => {
      render(<ClaudeChatPanel noteContext={mockNoteContext} />)
      expect(screen.getByText('Improve')).toBeInTheDocument()
      expect(screen.getByText('Expand')).toBeInTheDocument()
      expect(screen.getByText('Summarize')).toBeInTheDocument()
      expect(screen.getByText('Explain')).toBeInTheDocument()
      expect(screen.getByText('Research')).toBeInTheDocument()
    })

    it('displays emoji icons for each action', () => {
      render(<ClaudeChatPanel noteContext={mockNoteContext} />)
      const quickActions = screen.getByTestId('quick-actions')
      expect(quickActions.textContent).toContain('✨') // Improve
      expect(quickActions.textContent).toContain('📝') // Expand
      expect(quickActions.textContent).toContain('📋') // Summarize
      expect(quickActions.textContent).toContain('💡') // Explain
      expect(quickActions.textContent).toContain('🔍') // Research
    })

    it('buttons have descriptive title attributes', () => {
      render(<ClaudeChatPanel noteContext={mockNoteContext} />)
      const improveBtn = screen.getByTitle('Improve this note')
      const expandBtn = screen.getByTitle('Expand this note')
      const summarizeBtn = screen.getByTitle('Summarize this note')
      const explainBtn = screen.getByTitle('Explain this note')
      const researchBtn = screen.getByTitle('Research this note')

      expect(improveBtn).toBeInTheDocument()
      expect(expandBtn).toBeInTheDocument()
      expect(summarizeBtn).toBeInTheDocument()
      expect(explainBtn).toBeInTheDocument()
      expect(researchBtn).toBeInTheDocument()
    })
  })

  describe('Quick Action Functionality', () => {
    it('clicking Improve sends correct prompt', async () => {
      const mockSubmit = vi.fn().mockResolvedValue('Improved response')
      render(<ClaudeChatPanel noteContext={mockNoteContext} onSubmit={mockSubmit} />)

      const improveBtn = screen.getByText('Improve')
      fireEvent.click(improveBtn)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled()
        const callArg = mockSubmit.mock.calls[0][0]
        expect(callArg).toContain('Improve clarity and flow')
        expect(callArg).toContain('Research Methods')
        expect(callArg).toContain('research methodology in statistics')
      })
    })

    it('clicking Expand sends correct prompt', async () => {
      const mockSubmit = vi.fn().mockResolvedValue('Expanded response')
      render(<ClaudeChatPanel noteContext={mockNoteContext} onSubmit={mockSubmit} />)

      const expandBtn = screen.getByText('Expand')
      fireEvent.click(expandBtn)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled()
        const callArg = mockSubmit.mock.calls[0][0]
        expect(callArg).toContain('Expand on this idea')
      })
    })

    it('clicking Summarize sends correct prompt', async () => {
      const mockSubmit = vi.fn().mockResolvedValue('Summary response')
      render(<ClaudeChatPanel noteContext={mockNoteContext} onSubmit={mockSubmit} />)

      const summarizeBtn = screen.getByText('Summarize')
      fireEvent.click(summarizeBtn)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled()
        const callArg = mockSubmit.mock.calls[0][0]
        expect(callArg).toContain('Summarize in 2-3 sentences')
      })
    })

    it('clicking Explain sends correct prompt', async () => {
      const mockSubmit = vi.fn().mockResolvedValue('Explanation response')
      render(<ClaudeChatPanel noteContext={mockNoteContext} onSubmit={mockSubmit} />)

      const explainBtn = screen.getByText('Explain')
      fireEvent.click(explainBtn)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled()
        const callArg = mockSubmit.mock.calls[0][0]
        expect(callArg).toContain('Explain this simply')
      })
    })

    it('clicking Research sends correct prompt', async () => {
      const mockSubmit = vi.fn().mockResolvedValue('Research response')
      render(<ClaudeChatPanel noteContext={mockNoteContext} onSubmit={mockSubmit} />)

      const researchBtn = screen.getByText('Research')
      fireEvent.click(researchBtn)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled()
        const callArg = mockSubmit.mock.calls[0][0]
        expect(callArg).toContain('What does research say about this?')
      })
    })

    it('includes note content in context', async () => {
      const mockSubmit = vi.fn().mockResolvedValue('Response')
      render(<ClaudeChatPanel noteContext={mockNoteContext} onSubmit={mockSubmit} />)

      fireEvent.click(screen.getByText('Improve'))

      await waitFor(() => {
        const callArg = mockSubmit.mock.calls[0][0]
        expect(callArg).toContain('Context:')
        expect(callArg).toContain('Current note: "Research Methods"')
        expect(callArg).toContain('research methodology in statistics')
      })
    })

    it('truncates long note content to 800 chars', async () => {
      const longContent = 'x'.repeat(1000)
      const longNote = { title: 'Long Note', content: longContent }
      const mockSubmit = vi.fn().mockResolvedValue('Response')

      render(<ClaudeChatPanel noteContext={longNote} onSubmit={mockSubmit} />)
      fireEvent.click(screen.getByText('Improve'))

      await waitFor(() => {
        const callArg = mockSubmit.mock.calls[0][0]
        expect(callArg).toContain('...')
        expect(callArg.length).toBeLessThan(longContent.length + 200)
      })
    })

    it('adds user message to chat history', async () => {
      const mockSubmit = vi.fn().mockResolvedValue('Response')
      render(<ClaudeChatPanel noteContext={mockNoteContext} onSubmit={mockSubmit} />)

      fireEvent.click(screen.getByText('Improve'))

      await waitFor(() => {
        expect(screen.getByText('Improve clarity and flow')).toBeInTheDocument()
      })
    })

    it('adds AI response to chat history', async () => {
      const mockSubmit = vi.fn().mockResolvedValue('Here are improvements...')
      render(<ClaudeChatPanel noteContext={mockNoteContext} onSubmit={mockSubmit} />)

      fireEvent.click(screen.getByText('Improve'))

      await waitFor(() => {
        expect(screen.getByText('Here are improvements...')).toBeInTheDocument()
      })
    })
  })

  describe('Quick Action Edge Cases', () => {
    it('disables buttons while loading', async () => {
      const mockSubmit = vi.fn(() => new Promise(resolve => setTimeout(() => resolve('Response'), 100)))
      render(<ClaudeChatPanel noteContext={mockNoteContext} onSubmit={mockSubmit} />)

      const improveBtn = screen.getByText('Improve').closest('button')
      fireEvent.click(improveBtn!)

      // Should be disabled during loading
      expect(improveBtn).toBeDisabled()

      await waitFor(() => {
        expect(improveBtn).not.toBeDisabled()
      })
    })

    it('handles AI error gracefully', async () => {
      const mockSubmit = vi.fn().mockRejectedValue(new Error('AI unavailable'))
      render(<ClaudeChatPanel noteContext={mockNoteContext} onSubmit={mockSubmit} />)

      fireEvent.click(screen.getByText('Improve'))

      await waitFor(() => {
        expect(screen.getByText(/Error: AI unavailable/)).toBeInTheDocument()
      })
    })

    it('clears input after quick action completes', async () => {
      const mockSubmit = vi.fn().mockResolvedValue('Response')
      render(<ClaudeChatPanel noteContext={mockNoteContext} onSubmit={mockSubmit} />)

      const input = screen.getByTestId('chat-input')
      fireEvent.click(screen.getByText('Improve'))

      await waitFor(() => {
        expect(input).toHaveValue('')
      })
    })

    it('does not trigger when already loading', () => {
      const mockSubmit = vi.fn(() => new Promise(() => {})) // Never resolves
      render(<ClaudeChatPanel noteContext={mockNoteContext} onSubmit={mockSubmit} />)

      const improveBtn = screen.getByText('Improve')
      fireEvent.click(improveBtn)
      fireEvent.click(improveBtn) // Second click while loading

      expect(mockSubmit).toHaveBeenCalledTimes(1) // Only first call
    })
  })

  describe('Quick Actions with Referenced Notes', () => {
    const mockAvailableNotes = [
      { id: '1', title: 'Note 1', content: 'Content 1' },
      { id: '2', title: 'Note 2', content: 'Content 2' }
    ]

    it('includes referenced notes in context', async () => {
      const mockSubmit = vi.fn().mockResolvedValue('Response')
      render(
        <ClaudeChatPanel
          noteContext={mockNoteContext}
          availableNotes={mockAvailableNotes}
          onSubmit={mockSubmit}
        />
      )

      // Reference a note using @
      const input = screen.getByTestId('chat-input')
      fireEvent.change(input, { target: { value: '@' } })

      // Wait for menu to appear
      await waitFor(() => {
        expect(screen.getByTestId('at-mention-menu')).toBeInTheDocument()
      })

      // Select first note
      const firstNote = screen.getByText('Note 1')
      fireEvent.click(firstNote)

      // Now trigger quick action
      fireEvent.click(screen.getByText('Improve'))

      await waitFor(() => {
        const callArg = mockSubmit.mock.calls[0][0]
        expect(callArg).toContain('Referenced note: "Note 1"')
        expect(callArg).toContain('Content 1')
      })
    })

    it('truncates referenced note content to 500 chars', async () => {
      const longReferencedNote = {
        id: '1',
        title: 'Long Referenced Note',
        content: 'y'.repeat(600)
      }
      const mockSubmit = vi.fn().mockResolvedValue('Response')

      render(
        <ClaudeChatPanel
          noteContext={mockNoteContext}
          availableNotes={[longReferencedNote]}
          onSubmit={mockSubmit}
        />
      )

      // Reference the note
      const input = screen.getByTestId('chat-input')
      fireEvent.change(input, { target: { value: '@' } })
      await waitFor(() => screen.getByTestId('at-mention-menu'))
      fireEvent.click(screen.getByText('Long Referenced Note'))

      fireEvent.click(screen.getByText('Improve'))

      await waitFor(() => {
        const callArg = mockSubmit.mock.calls[0][0]
        expect(callArg).toContain('...')
      })
    })
  })

  describe('Quick Actions Accessibility', () => {
    it('buttons are keyboard navigable', () => {
      render(<ClaudeChatPanel noteContext={mockNoteContext} />)
      const improveBtn = screen.getByText('Improve').closest('button')
      expect(improveBtn).not.toHaveAttribute('tabindex', '-1')
    })

    it('buttons have type="button" to prevent form submission', () => {
      render(<ClaudeChatPanel noteContext={mockNoteContext} />)
      const buttons = screen.getByTestId('quick-actions').querySelectorAll('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button')
      })
    })
  })
})
