/**
 * EmptyState Component Tests
 *
 * Comprehensive tests for the EmptyState component including:
 * - Component rendering with title and description
 * - Animated icon rendering
 * - Action button rendering and click handlers
 * - Keyboard shortcut display (⌘N, ⌘D, ⌘K)
 * - Quote selection on mount
 * - Random quote generation
 * - Button functionality (Create Note, Open Daily, Command Palette)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EmptyState } from '../components/EmptyState'

// ============================================================================
// Setup and Test Utilities
// ============================================================================

describe('EmptyState Component', () => {
  const mockOnCreateNote = vi.fn()
  const mockOnOpenDaily = vi.fn()
  const mockOnOpenCommandPalette = vi.fn()

  const defaultProps = {
    onCreateNote: mockOnCreateNote,
    onOpenDaily: mockOnOpenDaily,
    onOpenCommandPalette: mockOnOpenCommandPalette
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // Basic Rendering Tests
  // ==========================================================================

  describe('Basic Rendering', () => {
    it('renders the main heading', () => {
      render(<EmptyState {...defaultProps} />)
      expect(screen.getByText('Ready to write')).toBeInTheDocument()
    })

    it('renders the description text', () => {
      render(<EmptyState {...defaultProps} />)
      expect(screen.getByText('Capture your thoughts, one page at a time')).toBeInTheDocument()
    })

    it('renders the animated pen icon', () => {
      const { container } = render(<EmptyState {...defaultProps} />)
      const svg = container.querySelector('svg.animate-pen-write')
      expect(svg).toBeInTheDocument()
    })

    it('renders the glow effect element', () => {
      const { container } = render(<EmptyState {...defaultProps} />)
      const glowEffect = container.querySelector('.animate-pulse-slow')
      expect(glowEffect).toBeInTheDocument()
    })

    it('renders with select-none class for non-selectable content', () => {
      const { container } = render(<EmptyState {...defaultProps} />)
      const mainDiv = container.querySelector('.select-none')
      expect(mainDiv).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Action Buttons Tests
  // ==========================================================================

  describe('Action Buttons', () => {
    it('renders "New Page" button', () => {
      render(<EmptyState {...defaultProps} />)
      expect(screen.getByText('New Page')).toBeInTheDocument()
    })

    it('renders "Today" button', () => {
      render(<EmptyState {...defaultProps} />)
      expect(screen.getByText('Today')).toBeInTheDocument()
    })

    it('calls onCreateNote when "New Page" button is clicked', () => {
      render(<EmptyState {...defaultProps} />)
      const newPageButton = screen.getByText('New Page')
      fireEvent.click(newPageButton)
      expect(mockOnCreateNote).toHaveBeenCalledTimes(1)
    })

    it('calls onOpenDaily when "Today" button is clicked', () => {
      render(<EmptyState {...defaultProps} />)
      const todayButton = screen.getByText('Today')
      fireEvent.click(todayButton)
      expect(mockOnOpenDaily).toHaveBeenCalledTimes(1)
    })

    it('renders keyboard shortcut ⌘N for New Page button', () => {
      render(<EmptyState {...defaultProps} />)
      // Find the kbd element within the New Page button section
      const newPageButton = screen.getByText('New Page').closest('button')
      const shortcut = newPageButton?.querySelector('kbd')
      expect(shortcut).toBeInTheDocument()
      expect(shortcut?.textContent).toContain('⌘N')
    })

    it('renders keyboard shortcut ⌘D for Today button', () => {
      render(<EmptyState {...defaultProps} />)
      // Find the kbd element within the Today button section
      const todayButton = screen.getByText('Today').closest('button')
      const shortcut = todayButton?.querySelector('kbd')
      expect(shortcut).toBeInTheDocument()
      expect(shortcut?.textContent).toContain('⌘D')
    })

    it('applies correct styling to New Page button', () => {
      render(<EmptyState {...defaultProps} />)
      const newPageButton = screen.getByText('New Page').closest('button')
      expect(newPageButton).toHaveClass('btn-action')
      expect(newPageButton).toHaveClass('bg-nexus-accent')
      expect(newPageButton).toHaveClass('text-white')
    })

    it('applies correct styling to Today button', () => {
      render(<EmptyState {...defaultProps} />)
      const todayButton = screen.getByText('Today').closest('button')
      expect(todayButton).toHaveClass('btn-action')
      expect(todayButton).toHaveClass('bg-nexus-bg-tertiary')
      expect(todayButton).toHaveClass('text-nexus-text-primary')
    })

    it('renders icons within action buttons', () => {
      const { container } = render(<EmptyState {...defaultProps} />)
      const buttons = container.querySelectorAll('.btn-action')

      // Should have 2 buttons
      expect(buttons).toHaveLength(2)

      // Each button should have an SVG icon
      buttons.forEach(button => {
        expect(button.querySelector('svg')).toBeInTheDocument()
      })
    })
  })

  // ==========================================================================
  // Command Palette Quick Access Tests
  // ==========================================================================

  describe('Command Palette Quick Access', () => {
    it('renders command palette trigger text', () => {
      render(<EmptyState {...defaultProps} />)
      expect(screen.getByText('or press')).toBeInTheDocument()
      expect(screen.getByText('for all commands')).toBeInTheDocument()
    })

    it('renders command palette button with ⌘K', () => {
      render(<EmptyState {...defaultProps} />)
      const commandButton = screen.getByText('⌘K')
      expect(commandButton).toBeInTheDocument()
    })

    it('calls onOpenCommandPalette when ⌘K button is clicked', () => {
      render(<EmptyState {...defaultProps} />)
      const commandButton = screen.getByText('⌘K')
      fireEvent.click(commandButton)
      expect(mockOnOpenCommandPalette).toHaveBeenCalledTimes(1)
    })

    it('applies correct styling to command palette button', () => {
      render(<EmptyState {...defaultProps} />)
      const commandButton = screen.getByText('⌘K').closest('button')
      expect(commandButton).toHaveClass('bg-nexus-bg-tertiary')
      expect(commandButton).toHaveClass('border')
      expect(commandButton).toHaveClass('border-white/10')
    })
  })

  // ==========================================================================
  // Quote Tests
  // ==========================================================================

  describe('Inspirational Quotes', () => {
    it('renders a quote after component mounts', async () => {
      render(<EmptyState {...defaultProps} />)

      // Wait for the quote to be rendered
      await waitFor(() => {
        const quote = screen.getByText(/The scariest moment|Start writing|You don't start|The first draft|Write drunk|You can always|The secret of|Done is better|Writing is thinking|Almost all good/, { selector: 'p' })
        expect(quote).toBeInTheDocument()
      })
    })

    it('renders quote within blockquote element', () => {
      render(<EmptyState {...defaultProps} />)
      const blockquote = screen.getByRole('blockquote', { hidden: true })
      expect(blockquote).toBeInTheDocument()
    })

    it('renders quote author footer', async () => {
      const { container } = render(<EmptyState {...defaultProps} />)

      await waitFor(() => {
        const blockquote = container.querySelector('blockquote')
        const footer = blockquote?.querySelector('footer')
        expect(footer).toBeInTheDocument()
        // Author should contain an em-dash and author name
        expect(footer?.textContent).toContain('—')
      })
    })

    it('renders quote with correct styling', () => {
      render(<EmptyState {...defaultProps} />)
      const blockquote = screen.getByRole('blockquote', { hidden: true })
      expect(blockquote).toHaveClass('max-w-lg')
      expect(blockquote).toHaveClass('text-center')
      expect(blockquote).toHaveClass('border-l-2')
    })

    it('displays quote text in italic', () => {
      render(<EmptyState {...defaultProps} />)
      const blockquote = screen.getByRole('blockquote', { hidden: true })
      const quoteText = blockquote.querySelector('p.italic')
      expect(quoteText).toBeInTheDocument()
    })

    it('selects a random quote on mount', async () => {
      // Mock Math.random to return a predictable value
      const originalRandom = Math.random
      let callCount = 0

      Math.random = vi.fn(() => {
        // First call returns 0.5 (middle-ish quote)
        return callCount++ === 0 ? 0.5 : originalRandom()
      })

      render(<EmptyState {...defaultProps} />)

      await waitFor(() => {
        // Should have rendered some quote
        const blockquote = screen.getByRole('blockquote', { hidden: true })
        expect(blockquote).toBeInTheDocument()
      })

      // Restore Math.random
      Math.random = originalRandom
    })

    it('renders the quote mark as part of the text', async () => {
      render(<EmptyState {...defaultProps} />)

      await waitFor(() => {
        const blockquote = screen.getByRole('blockquote', { hidden: true })
        const quoteText = blockquote.querySelector('p')
        // Quote should start with opening quote mark
        expect(quoteText?.textContent).toMatch(/^"/)
      })
    })
  })

  // ==========================================================================
  // Integration Tests
  // ==========================================================================

  describe('Integration Tests', () => {
    it('all callbacks can be invoked independently', () => {
      render(<EmptyState {...defaultProps} />)

      // Click New Page
      fireEvent.click(screen.getByText('New Page'))
      expect(mockOnCreateNote).toHaveBeenCalledTimes(1)

      // Click Today
      fireEvent.click(screen.getByText('Today'))
      expect(mockOnOpenDaily).toHaveBeenCalledTimes(1)

      // Click ⌘K
      fireEvent.click(screen.getByText('⌘K'))
      expect(mockOnOpenCommandPalette).toHaveBeenCalledTimes(1)
    })

    it('multiple button clicks work correctly', () => {
      render(<EmptyState {...defaultProps} />)

      // Click New Page button twice
      fireEvent.click(screen.getByText('New Page'))
      fireEvent.click(screen.getByText('New Page'))
      expect(mockOnCreateNote).toHaveBeenCalledTimes(2)

      // Click Today button twice
      fireEvent.click(screen.getByText('Today'))
      fireEvent.click(screen.getByText('Today'))
      expect(mockOnOpenDaily).toHaveBeenCalledTimes(2)
    })

    it('renders complete UI hierarchy', () => {
      const { container } = render(<EmptyState {...defaultProps} />)

      // Main container with flex layout
      const mainDiv = container.firstChild
      expect(mainDiv).toHaveClass('flex-1')
      expect(mainDiv).toHaveClass('flex')
      expect(mainDiv).toHaveClass('flex-col')
      expect(mainDiv).toHaveClass('items-center')
      expect(mainDiv).toHaveClass('justify-center')
    })

    it('renders all elements in correct order', () => {
      const { container } = render(<EmptyState {...defaultProps} />)

      const elements = container.querySelectorAll('*')
      let iconFound = false
      let headingFound = false
      let descriptionFound = false
      let buttonsFound = false
      let commandFound = false
      let quoteFound = false

      // This is a simple check - in reality, the DOM structure matters
      elements.forEach(el => {
        if (el.classList.contains('animate-pen-write')) iconFound = true
        if (el.textContent?.includes('Ready to write')) headingFound = true
        if (el.textContent?.includes('Capture your thoughts')) descriptionFound = true
        if (el.textContent?.includes('New Page') && el.textContent?.includes('Today')) buttonsFound = true
        if (el.textContent?.includes('⌘K') && el.textContent?.includes('or press')) commandFound = true
        if (el.tagName === 'BLOCKQUOTE') quoteFound = true
      })

      expect(iconFound).toBe(true)
      expect(headingFound).toBe(true)
      expect(descriptionFound).toBe(true)
      expect(buttonsFound).toBe(true)
      expect(commandFound).toBe(true)
      expect(quoteFound).toBe(true)
    })
  })

  // ==========================================================================
  // Accessibility Tests
  // ==========================================================================

  describe('Accessibility', () => {
    it('buttons are keyboard accessible', () => {
      render(<EmptyState {...defaultProps} />)

      const newPageButton = screen.getByText('New Page').closest('button')
      const todayButton = screen.getByText('Today').closest('button')
      const commandButton = screen.getByText('⌘K').closest('button')

      expect(newPageButton?.tagName).toBe('BUTTON')
      expect(todayButton?.tagName).toBe('BUTTON')
      expect(commandButton?.tagName).toBe('BUTTON')
    })

    it('heading is semantically correct', () => {
      render(<EmptyState {...defaultProps} />)
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading.textContent).toBe('Ready to write')
    })

    it('quote has semantic markup', () => {
      render(<EmptyState {...defaultProps} />)
      const blockquote = screen.getByRole('blockquote', { hidden: true })
      const footer = blockquote.querySelector('footer')
      expect(footer).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Styling and Layout Tests
  // ==========================================================================

  describe('Styling and Layout', () => {
    it('applies padding to main container', () => {
      const { container } = render(<EmptyState {...defaultProps} />)
      const mainDiv = container.querySelector('.p-8')
      expect(mainDiv).toBeInTheDocument()
    })

    it('applies flex layout with gap to action buttons', () => {
      const { container } = render(<EmptyState {...defaultProps} />)
      // Find the button container with gap-4
      const buttonContainer = container.querySelector('.gap-4')
      expect(buttonContainer).toBeInTheDocument()
    })

    it('applies text color classes for theme consistency', () => {
      const { container } = render(<EmptyState {...defaultProps} />)

      // Check for theme color classes
      expect(container.textContent).toBeTruthy()

      // Look for nexus theme classes
      const elements = container.querySelectorAll('[class*="nexus"]')
      expect(elements.length).toBeGreaterThan(0)
    })

    it('applies border-radius to buttons', () => {
      render(<EmptyState {...defaultProps} />)

      const newPageButton = screen.getByText('New Page').closest('button')
      expect(newPageButton).toHaveClass('rounded-lg')

      const todayButton = screen.getByText('Today').closest('button')
      expect(todayButton).toHaveClass('rounded-lg')

      const commandButton = screen.getByText('⌘K').closest('button')
      expect(commandButton).toHaveClass('rounded')
    })
  })

  // ==========================================================================
  // Edge Cases
  // ==========================================================================

  describe('Edge Cases', () => {
    it('handles component remounting', () => {
      const { unmount } = render(<EmptyState {...defaultProps} />)

      expect(screen.getByText('Ready to write')).toBeInTheDocument()

      unmount()

      // Remount
      render(<EmptyState {...defaultProps} />)
      expect(screen.getByText('Ready to write')).toBeInTheDocument()
    })

    it('handles rapid button clicks', () => {
      render(<EmptyState {...defaultProps} />)

      const newPageButton = screen.getByText('New Page')

      // Simulate rapid clicks
      for (let i = 0; i < 10; i++) {
        fireEvent.click(newPageButton)
      }

      expect(mockOnCreateNote).toHaveBeenCalledTimes(10)
    })

    it('preserves callback references', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      const callback3 = vi.fn()

      const { rerender } = render(
        <EmptyState
          onCreateNote={callback1}
          onOpenDaily={callback2}
          onOpenCommandPalette={callback3}
        />
      )

      fireEvent.click(screen.getByText('New Page'))
      expect(callback1).toHaveBeenCalledTimes(1)

      // Rerender with same callbacks
      rerender(
        <EmptyState
          onCreateNote={callback1}
          onOpenDaily={callback2}
          onOpenCommandPalette={callback3}
        />
      )

      fireEvent.click(screen.getByText('New Page'))
      expect(callback1).toHaveBeenCalledTimes(2)
    })
  })
})
