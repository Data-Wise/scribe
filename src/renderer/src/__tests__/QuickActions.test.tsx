/**
 * QuickActions Component Tests
 *
 * Tests the quick action buttons that provide one-click access to common
 * note-taking actions (Daily Note, New Note, Quick Capture, New Project).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuickActions } from '../components/QuickActions'

describe('QuickActions', () => {
  const mockOnDailyNote = vi.fn()
  const mockOnNewNote = vi.fn()
  const mockOnQuickCapture = vi.fn()
  const mockOnNewProject = vi.fn()

  const defaultProps = {
    onDailyNote: mockOnDailyNote,
    onNewNote: mockOnNewNote,
    onQuickCapture: mockOnQuickCapture,
    onNewProject: mockOnNewProject
  }

  beforeEach(() => {
    mockOnDailyNote.mockClear()
    mockOnNewNote.mockClear()
    mockOnQuickCapture.mockClear()
    mockOnNewProject.mockClear()
  })

  describe('Rendering', () => {
    it('should render all 4 quick action buttons', () => {
      render(<QuickActions {...defaultProps} />)

      expect(screen.getByText('Today')).toBeInTheDocument()
      expect(screen.getByText('New Page')).toBeInTheDocument()
      expect(screen.getByText('Quick Capture')).toBeInTheDocument()
      expect(screen.getByText('New Project')).toBeInTheDocument()
    })

    it('should display keyboard shortcuts for each action', () => {
      render(<QuickActions {...defaultProps} />)

      expect(screen.getByText('⌘D')).toBeInTheDocument()
      expect(screen.getByText('⌘N')).toBeInTheDocument()
      expect(screen.getByText('⌘⇧C')).toBeInTheDocument()
      expect(screen.getByText('⌘⇧P')).toBeInTheDocument()
    })

    it('should render buttons as semantic button elements', () => {
      render(<QuickActions {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(4)
    })

    it('should have container with quick-actions class', () => {
      const { container } = render(<QuickActions {...defaultProps} />)

      const quickActionsContainer = container.querySelector('.quick-actions')
      expect(quickActionsContainer).toBeTruthy()
    })
  })

  describe('Click Interactions', () => {
    it('should call onDailyNote when Today button is clicked', () => {
      render(<QuickActions {...defaultProps} />)

      const todayButton = screen.getByText('Today').closest('button')
      expect(todayButton).toBeTruthy()

      if (todayButton) {
        fireEvent.click(todayButton)
        expect(mockOnDailyNote).toHaveBeenCalledTimes(1)
      }
    })

    it('should call onNewNote when New Page button is clicked', () => {
      render(<QuickActions {...defaultProps} />)

      const newPageButton = screen.getByText('New Page').closest('button')
      expect(newPageButton).toBeTruthy()

      if (newPageButton) {
        fireEvent.click(newPageButton)
        expect(mockOnNewNote).toHaveBeenCalledTimes(1)
      }
    })

    it('should call onQuickCapture when Quick Capture button is clicked', () => {
      render(<QuickActions {...defaultProps} />)

      const quickCaptureButton = screen.getByText('Quick Capture').closest('button')
      expect(quickCaptureButton).toBeTruthy()

      if (quickCaptureButton) {
        fireEvent.click(quickCaptureButton)
        expect(mockOnQuickCapture).toHaveBeenCalledTimes(1)
      }
    })

    it('should call onNewProject when New Project button is clicked', () => {
      render(<QuickActions {...defaultProps} />)

      const newProjectButton = screen.getByText('New Project').closest('button')
      expect(newProjectButton).toBeTruthy()

      if (newProjectButton) {
        fireEvent.click(newProjectButton)
        expect(mockOnNewProject).toHaveBeenCalledTimes(1)
      }
    })

    it('should not call any handlers initially', () => {
      render(<QuickActions {...defaultProps} />)

      expect(mockOnDailyNote).not.toHaveBeenCalled()
      expect(mockOnNewNote).not.toHaveBeenCalled()
      expect(mockOnQuickCapture).not.toHaveBeenCalled()
      expect(mockOnNewProject).not.toHaveBeenCalled()
    })

    it('should support multiple clicks on same button', () => {
      render(<QuickActions {...defaultProps} />)

      const todayButton = screen.getByText('Today').closest('button')
      if (todayButton) {
        fireEvent.click(todayButton)
        fireEvent.click(todayButton)
        fireEvent.click(todayButton)

        expect(mockOnDailyNote).toHaveBeenCalledTimes(3)
      }
    })
  })

  describe('Visual Styling', () => {
    it('should have color-coded icon containers', () => {
      const { container } = render(<QuickActions {...defaultProps} />)

      // Each action should have its unique color class
      const amberIcon = container.querySelector('.bg-amber-500\\/10')
      const skyIcon = container.querySelector('.bg-sky-500\\/10')
      const purpleIcon = container.querySelector('.bg-purple-500\\/10')
      const emeraldIcon = container.querySelector('.bg-emerald-500\\/10')

      expect(amberIcon).toBeTruthy() // Today
      expect(skyIcon).toBeTruthy() // New Page
      expect(purpleIcon).toBeTruthy() // Quick Capture
      expect(emeraldIcon).toBeTruthy() // New Project
    })

    it('should have hover effects on buttons', () => {
      const { container } = render(<QuickActions {...defaultProps} />)

      const buttonsWithHover = container.querySelectorAll('[class*="hover:"]')
      // Each button has hover classes
      expect(buttonsWithHover.length).toBeGreaterThan(0)
    })

    it('should have Nexus theme colors', () => {
      const { container } = render(<QuickActions {...defaultProps} />)

      const nexusElements = container.querySelectorAll('[class*="nexus-"]')
      expect(nexusElements.length).toBeGreaterThan(0)
    })

    it('should have consistent button styling', () => {
      const { container } = render(<QuickActions {...defaultProps} />)

      const buttons = container.querySelectorAll('.quick-action-btn')
      expect(buttons).toHaveLength(4)

      // All buttons should have same base classes
      buttons.forEach(button => {
        expect(button).toHaveClass('flex', 'items-center', 'gap-3', 'px-4', 'py-3', 'rounded-lg')
      })
    })

    it('should have border and background styling', () => {
      const { container } = render(<QuickActions {...defaultProps} />)

      const buttons = container.querySelectorAll('button')
      buttons.forEach(button => {
        expect(button.className).toContain('border')
        expect(button.className).toContain('bg-white')
      })
    })

    it('should use flexbox layout', () => {
      const { container } = render(<QuickActions {...defaultProps} />)

      const quickActionsContainer = container.querySelector('.quick-actions')
      expect(quickActionsContainer).toHaveClass('flex', 'flex-wrap', 'gap-3')
    })
  })

  describe('Icon Display', () => {
    it('should render icon for each button', () => {
      const { container } = render(<QuickActions {...defaultProps} />)

      const icons = container.querySelectorAll('.quick-action-icon')
      expect(icons).toHaveLength(4)
    })

    it('should have correct icon styling', () => {
      const { container } = render(<QuickActions {...defaultProps} />)

      const icons = container.querySelectorAll('.quick-action-icon')
      icons.forEach(icon => {
        expect(icon).toHaveClass('p-2', 'rounded-lg')
      })
    })

    it('should render SVG icons within icon containers', () => {
      const { container } = render(<QuickActions {...defaultProps} />)

      const svgIcons = container.querySelectorAll('.quick-action-icon svg')
      expect(svgIcons).toHaveLength(4)
    })
  })

  describe('Text Content', () => {
    it('should display action titles with correct formatting', () => {
      render(<QuickActions {...defaultProps} />)

      // Check that titles are present with proper case
      expect(screen.getByText('Today')).toBeInTheDocument()
      expect(screen.getByText('New Page')).toBeInTheDocument()
      expect(screen.getByText('Quick Capture')).toBeInTheDocument()
      expect(screen.getByText('New Project')).toBeInTheDocument()
    })

    it('should display shortcuts with Mac keyboard symbols', () => {
      render(<QuickActions {...defaultProps} />)

      // Check for Mac command symbol (⌘) and shift symbol (⇧)
      const shortcutsText = screen.getByText('⌘⇧C').textContent
      expect(shortcutsText).toContain('⌘')
      expect(shortcutsText).toContain('⇧')
    })

    it('should have proper text hierarchy', () => {
      const { container } = render(<QuickActions {...defaultProps} />)

      // Titles should be medium font
      const titles = container.querySelectorAll('.font-medium')
      expect(titles.length).toBeGreaterThanOrEqual(4)

      // Shortcuts should be extra small text
      const shortcuts = container.querySelectorAll('.text-xs')
      expect(shortcuts.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('Accessibility', () => {
    it('should render buttons with role button', () => {
      render(<QuickActions {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(4)
    })

    it('should have text content for screen readers', () => {
      render(<QuickActions {...defaultProps} />)

      // All buttons should have visible text
      expect(screen.getByText('Today')).toBeVisible()
      expect(screen.getByText('New Page')).toBeVisible()
      expect(screen.getByText('Quick Capture')).toBeVisible()
      expect(screen.getByText('New Project')).toBeVisible()
    })

    it('should be keyboard focusable', () => {
      render(<QuickActions {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        button.focus()
        expect(document.activeElement).toBe(button)
      })
    })
  })

  describe('Layout', () => {
    it('should arrange buttons in a flex container', () => {
      const { container } = render(<QuickActions {...defaultProps} />)

      const quickActionsContainer = container.querySelector('.quick-actions')
      expect(quickActionsContainer).toHaveClass('flex')
    })

    it('should allow buttons to wrap', () => {
      const { container } = render(<QuickActions {...defaultProps} />)

      const quickActionsContainer = container.querySelector('.quick-actions')
      expect(quickActionsContainer).toHaveClass('flex-wrap')
    })

    it('should have consistent gap between buttons', () => {
      const { container } = render(<QuickActions {...defaultProps} />)

      const quickActionsContainer = container.querySelector('.quick-actions')
      expect(quickActionsContainer).toHaveClass('gap-3')
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing callbacks gracefully', () => {
      // @ts-expect-error Testing missing props
      const { container } = render(<QuickActions />)

      // Should still render without error
      expect(container.firstChild).toBeTruthy()
    })

    it('should handle rapid clicking', () => {
      render(<QuickActions {...defaultProps} />)

      const todayButton = screen.getByText('Today').closest('button')
      if (todayButton) {
        // Rapid fire clicks
        for (let i = 0; i < 10; i++) {
          fireEvent.click(todayButton)
        }

        expect(mockOnDailyNote).toHaveBeenCalledTimes(10)
      }
    })

    it('should handle clicking different buttons in sequence', () => {
      render(<QuickActions {...defaultProps} />)

      const todayButton = screen.getByText('Today').closest('button')
      const newPageButton = screen.getByText('New Page').closest('button')
      const captureButton = screen.getByText('Quick Capture').closest('button')
      const projectButton = screen.getByText('New Project').closest('button')

      if (todayButton) fireEvent.click(todayButton)
      if (newPageButton) fireEvent.click(newPageButton)
      if (captureButton) fireEvent.click(captureButton)
      if (projectButton) fireEvent.click(projectButton)

      expect(mockOnDailyNote).toHaveBeenCalledTimes(1)
      expect(mockOnNewNote).toHaveBeenCalledTimes(1)
      expect(mockOnQuickCapture).toHaveBeenCalledTimes(1)
      expect(mockOnNewProject).toHaveBeenCalledTimes(1)
    })
  })
})
