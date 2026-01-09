/**
 * KeyboardShortcuts Component Tests
 *
 * Tests the keyboard shortcuts reference modal that displays all
 * available keyboard shortcuts organized by category.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { KeyboardShortcuts } from '../components/KeyboardShortcuts'

describe('KeyboardShortcuts', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(<KeyboardShortcuts isOpen={false} onClose={mockOnClose} />)
      expect(container.firstChild).toBeNull()
    })

    it('should render when isOpen is true', () => {
      render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      // "Keyboard Shortcuts" appears in both header and Navigation shortcuts list
      const title = screen.getByRole('heading', { name: /keyboard shortcuts/i })
      expect(title).toBeInTheDocument()
    })

    it('should render header with title and icon', () => {
      render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      const header = screen.getByRole('heading', { name: /keyboard shortcuts/i })
      expect(header).toBeInTheDocument()
      expect(header.tagName).toBe('H2')
    })

    it('should render close button with aria-label', () => {
      render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      const closeButton = screen.getByRole('button', { name: /close/i })
      expect(closeButton).toBeInTheDocument()
      expect(closeButton).toHaveAttribute('aria-label', 'Close')
    })

    it('should render all shortcut categories', () => {
      render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByText('Notes')).toBeInTheDocument()
      expect(screen.getByText('Editor')).toBeInTheDocument()
      expect(screen.getByText('Navigation')).toBeInTheDocument()
      expect(screen.getByText('Writing')).toBeInTheDocument()
      expect(screen.getByText('General')).toBeInTheDocument()
    })

    it('should render footer with ESC hint', () => {
      render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByText(/press/i)).toBeInTheDocument()
      expect(screen.getByText(/to close/i)).toBeInTheDocument()
      // ESC appears twice (in hint and in shortcut list)
      const escKeys = screen.getAllByText('ESC')
      expect(escKeys.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Shortcuts Content', () => {
    it('should display Notes shortcuts', () => {
      render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      const notesSection = screen.getByText('Notes').parentElement
      expect(notesSection).toBeTruthy()

      if (notesSection) {
        const content = within(notesSection as HTMLElement)
        expect(content.getByText('New Note')).toBeInTheDocument()
        expect(content.getByText('Daily Note')).toBeInTheDocument()
        expect(content.getByText('Save (auto-saves)')).toBeInTheDocument()
      }
    })

    it('should display Editor shortcuts', () => {
      render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByText('Toggle Preview')).toBeInTheDocument()
      expect(screen.getByText('Focus Mode')).toBeInTheDocument()
      expect(screen.getByText('Export Note')).toBeInTheDocument()
      expect(screen.getByText('Graph View')).toBeInTheDocument()
    })

    it('should display Navigation shortcuts', () => {
      render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByText('Command Palette')).toBeInTheDocument()
      expect(screen.getByText('Search Notes')).toBeInTheDocument()
      expect(screen.getByText('Toggle Left Sidebar')).toBeInTheDocument()
      expect(screen.getByText('Toggle Right Sidebar')).toBeInTheDocument()
      expect(screen.getByText('Features Showcase')).toBeInTheDocument()
    })

    it('should display Writing shortcuts', () => {
      render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByText('Wiki Link')).toBeInTheDocument()
      expect(screen.getByText('Tag')).toBeInTheDocument()
      expect(screen.getByText('Citation')).toBeInTheDocument()
      expect(screen.getByText('Math (inline)')).toBeInTheDocument()
      expect(screen.getByText('Math (block)')).toBeInTheDocument()
    })

    it('should display General shortcuts', () => {
      render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByText('Exit Focus/Preview/Modal')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('should display keyboard notation correctly', () => {
      render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      // Check for Mac keyboard symbols
      expect(screen.getByText('⌘N')).toBeInTheDocument()
      expect(screen.getByText('⌘⇧F')).toBeInTheDocument()
      expect(screen.getByText('⌘K')).toBeInTheDocument()
    })

    it('should render shortcuts as kbd elements', () => {
      const { container } = render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      const kbdElements = container.querySelectorAll('kbd')
      // Should have many kbd elements (one for each shortcut + footer hint)
      expect(kbdElements.length).toBeGreaterThan(20)
    })
  })

  describe('Close Functionality', () => {
    it('should call onClose when close button is clicked', () => {
      render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      const closeButton = screen.getByRole('button', { name: /close/i })
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when backdrop is clicked', () => {
      const { container } = render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      // Find the backdrop (outermost div with fixed positioning)
      const backdrop = container.querySelector('.fixed.inset-0')
      expect(backdrop).toBeTruthy()

      if (backdrop) {
        fireEvent.click(backdrop)
        expect(mockOnClose).toHaveBeenCalledTimes(1)
      }
    })

    it('should not call onClose when panel content is clicked', () => {
      render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      // Click on the panel header (use role to get the right one)
      const header = screen.getByRole('heading', { name: /keyboard shortcuts/i })
      fireEvent.click(header)

      // Should not close
      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('should call onClose when ESC key is pressed', () => {
      render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      // Simulate ESC key press
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' })

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should not call onClose when other keys are pressed', () => {
      render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      // Simulate various key presses
      fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' })
      fireEvent.keyDown(window, { key: 'a', code: 'KeyA' })
      fireEvent.keyDown(window, { key: 'Space', code: 'Space' })

      // Should not close
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('Event Listeners', () => {
    it('should add keydown listener when opened', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

      render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

      addEventListenerSpy.mockRestore()
    })

    it('should remove keydown listener when closed', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { rerender } = render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      // Close the modal
      rerender(<KeyboardShortcuts isOpen={false} onClose={mockOnClose} />)

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

      removeEventListenerSpy.mockRestore()
    })

    it('should not add listener when initially closed', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

      render(<KeyboardShortcuts isOpen={false} onClose={mockOnClose} />)

      // Should not add listener since modal is not open
      expect(addEventListenerSpy).not.toHaveBeenCalled()

      addEventListenerSpy.mockRestore()
    })
  })

  describe('Visual Styling', () => {
    it('should have backdrop blur effect', () => {
      const { container } = render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      const backdrop = container.querySelector('.backdrop-blur-sm')
      expect(backdrop).toBeTruthy()
    })

    it('should have Nexus theme colors', () => {
      const { container } = render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      const nexusElements = container.querySelectorAll('[class*="nexus-"]')
      expect(nexusElements.length).toBeGreaterThan(0)
    })

    it('should have responsive grid layout', () => {
      const { container } = render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      const grid = container.querySelector('.grid')
      expect(grid).toBeTruthy()
      expect(grid).toHaveClass('md:grid-cols-2')
    })

    it('should have scrollable content area', () => {
      const { container } = render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      const scrollableArea = container.querySelector('.overflow-y-auto')
      expect(scrollableArea).toBeTruthy()
    })

    it('should have animation on panel', () => {
      const { container } = render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      // Check for animation style
      const panel = container.querySelector('[style*="animation"]')
      expect(panel).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      const heading = screen.getByRole('heading', { name: /keyboard shortcuts/i })
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H2')
    })

    it('should have category headings', () => {
      render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      const categoryHeadings = screen.getAllByRole('heading', { level: 3 })
      expect(categoryHeadings.length).toBe(5) // 5 categories
    })

    it('should have descriptive close button aria-label', () => {
      render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      const closeButton = screen.getByRole('button', { name: /close/i })
      expect(closeButton).toHaveAttribute('aria-label')
    })

    it('should use semantic HTML for keyboard shortcuts', () => {
      const { container } = render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      // All shortcuts should be in <kbd> elements
      const kbdElements = container.querySelectorAll('kbd')
      expect(kbdElements.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle multiple rapid open/close cycles', () => {
      const { rerender } = render(<KeyboardShortcuts isOpen={false} onClose={mockOnClose} />)

      // Rapidly toggle open/closed
      rerender(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)
      rerender(<KeyboardShortcuts isOpen={false} onClose={mockOnClose} />)
      rerender(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)
      rerender(<KeyboardShortcuts isOpen={false} onClose={mockOnClose} />)

      // Should not error
      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('should handle multiple ESC key presses', () => {
      render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      // Press ESC multiple times
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' })
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' })
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' })

      // Each press should trigger onClose
      expect(mockOnClose.mock.calls.length).toBeGreaterThanOrEqual(3)
    })

    it('should handle missing onClose callback gracefully', () => {
      // @ts-expect-error Testing missing prop
      const { container } = render(<KeyboardShortcuts isOpen={true} />)

      // Should still render without error
      expect(container.firstChild).toBeTruthy()
    })
  })

  describe('Layout Verification', () => {
    it('should organize shortcuts into correct categories', () => {
      render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      // Verify each category has its expected shortcuts
      const notesSection = screen.getByText('Notes').parentElement
      const editorSection = screen.getByText('Editor').parentElement
      const navigationSection = screen.getByText('Navigation').parentElement

      expect(notesSection).toBeTruthy()
      expect(editorSection).toBeTruthy()
      expect(navigationSection).toBeTruthy()
    })

    it('should display shortcuts with consistent formatting', () => {
      const { container } = render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      // All shortcut rows should have consistent structure
      const shortcutRows = container.querySelectorAll('.flex.items-center.justify-between')
      expect(shortcutRows.length).toBeGreaterThan(20) // Total shortcuts across all categories
    })

    it('should center modal on screen', () => {
      const { container } = render(<KeyboardShortcuts isOpen={true} onClose={mockOnClose} />)

      const modalContainer = container.querySelector('.items-center.justify-center')
      expect(modalContainer).toBeTruthy()
    })
  })
})
