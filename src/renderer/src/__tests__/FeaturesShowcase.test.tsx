/**
 * FeaturesShowcase Component Tests
 *
 * Tests the Features Showcase modal that displays all Scribe features
 * in an interactive, categorized view.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { FeaturesShowcase } from '../components/FeaturesShowcase'

describe('FeaturesShowcase', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  describe('Rendering', () => {
    it('should render the showcase modal', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)
      expect(screen.getByText('Scribe Features')).toBeInTheDocument()
    })

    it('should render the header with title and description', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)
      const header = screen.getByRole('heading', { name: /scribe features/i })
      expect(header).toBeInTheDocument()
      expect(screen.getByText(/ADHD-friendly, distraction-free writing companion/i)).toBeInTheDocument()
    })

    it('should render close button when onClose is provided', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)
      const closeButton = screen.getByTitle('Close features showcase')
      expect(closeButton).toBeInTheDocument()
    })

    it('should not render close button when onClose is not provided', () => {
      render(<FeaturesShowcase />)
      const closeButton = screen.queryByTitle('Close features showcase')
      expect(closeButton).not.toBeInTheDocument()
    })

    it('should render category filter buttons', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      expect(screen.getByRole('button', { name: /all features \(17\)/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /core features \(4\)/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /editing \(3\)/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /organization \(4\)/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /ai features \(2\)/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /advanced \(4\)/i })).toBeInTheDocument()
    })

    it('should render getting started section', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)
      expect(screen.getByText('Getting Started')).toBeInTheDocument()
      expect(screen.getByText('Essential Shortcuts')).toBeInTheDocument()
      expect(screen.getByText('Quick Tips')).toBeInTheDocument()
    })

    it('should render footer with version and links', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)
      expect(screen.getByText(/scribe v1\.14\.0/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /github/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /documentation/i })).toBeInTheDocument()
    })
  })

  describe('Feature Categories', () => {
    it('should display all 17 features by default', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      // Count feature cards (each has a title)
      // Note: Some feature names appear elsewhere too (e.g., "Keyboard Shortcuts" in footer)
      expect(screen.getByText('Three Editor Modes')).toBeInTheDocument()
      expect(screen.getByText('WikiLinks Navigation')).toBeInTheDocument()
      expect(screen.getByText('Automatic Backlinks')).toBeInTheDocument()
      expect(screen.getByText('Focus Mode')).toBeInTheDocument()
      expect(screen.getByText('LaTeX Math Rendering')).toBeInTheDocument()
      expect(screen.getByText('Smart Autocomplete')).toBeInTheDocument()
      expect(screen.getByText('YAML Properties')).toBeInTheDocument()
      expect(screen.getByText('Project System')).toBeInTheDocument()
      expect(screen.getByText('Hierarchical Tags')).toBeInTheDocument()
      expect(screen.getByText('Daily Notes')).toBeInTheDocument()
      expect(screen.getByText('Full-Text Search')).toBeInTheDocument()
      expect(screen.getByText('Claude Assistant')).toBeInTheDocument()
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
      expect(screen.getByText('Integrated Terminal')).toBeInTheDocument()
      expect(screen.getByText('Command Palette')).toBeInTheDocument()

      // "Keyboard Shortcuts" appears twice (feature card + footer button)
      const keyboardShortcuts = screen.getAllByText('Keyboard Shortcuts')
      expect(keyboardShortcuts.length).toBeGreaterThanOrEqual(1)

      expect(screen.getByText('Quarto Documents')).toBeInTheDocument()
    })

    it('should have 4 core features', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      // Filter to core
      fireEvent.click(screen.getByRole('button', { name: /core features \(4\)/i }))

      // Should show core features
      expect(screen.getByText('Three Editor Modes')).toBeInTheDocument()
      expect(screen.getByText('WikiLinks Navigation')).toBeInTheDocument()
      expect(screen.getByText('Automatic Backlinks')).toBeInTheDocument()
      expect(screen.getByText('Focus Mode')).toBeInTheDocument()
    })

    it('should have 3 editing features', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      fireEvent.click(screen.getByRole('button', { name: /editing \(3\)/i }))

      expect(screen.getByText('LaTeX Math Rendering')).toBeInTheDocument()
      expect(screen.getByText('Smart Autocomplete')).toBeInTheDocument()
      expect(screen.getByText('YAML Properties')).toBeInTheDocument()
    })

    it('should have 4 organization features', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      fireEvent.click(screen.getByRole('button', { name: /organization \(4\)/i }))

      expect(screen.getByText('Project System')).toBeInTheDocument()
      expect(screen.getByText('Hierarchical Tags')).toBeInTheDocument()
      expect(screen.getByText('Daily Notes')).toBeInTheDocument()
      expect(screen.getByText('Full-Text Search')).toBeInTheDocument()
    })

    it('should have 2 AI features', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      fireEvent.click(screen.getByRole('button', { name: /ai features \(2\)/i }))

      expect(screen.getByText('Claude Assistant')).toBeInTheDocument()
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    })

    it('should have 4 advanced features', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      fireEvent.click(screen.getByRole('button', { name: /advanced \(4\)/i }))

      expect(screen.getByText('Integrated Terminal')).toBeInTheDocument()
      expect(screen.getByText('Command Palette')).toBeInTheDocument()

      // "Keyboard Shortcuts" appears in footer too, so check it exists
      const keyboardShortcuts = screen.getAllByText('Keyboard Shortcuts')
      expect(keyboardShortcuts.length).toBeGreaterThanOrEqual(1)

      expect(screen.getByText('Quarto Documents')).toBeInTheDocument()
    })
  })

  describe('Category Filtering', () => {
    it('should filter features when category button is clicked', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      // Initially all features visible
      expect(screen.getByText('Three Editor Modes')).toBeInTheDocument()
      expect(screen.getByText('LaTeX Math Rendering')).toBeInTheDocument()

      // Click Core category
      fireEvent.click(screen.getByRole('button', { name: /core features \(4\)/i }))

      // Core features should still be visible
      expect(screen.getByText('Three Editor Modes')).toBeInTheDocument()

      // Editing features should not be visible
      expect(screen.queryByText('LaTeX Math Rendering')).not.toBeInTheDocument()
    })

    it('should show all features when "All Features" is clicked', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      // Filter to Core first
      fireEvent.click(screen.getByRole('button', { name: /core features \(4\)/i }))
      expect(screen.queryByText('LaTeX Math Rendering')).not.toBeInTheDocument()

      // Click All
      fireEvent.click(screen.getByRole('button', { name: /all features \(17\)/i }))

      // All features should be visible again
      expect(screen.getByText('Three Editor Modes')).toBeInTheDocument()
      expect(screen.getByText('LaTeX Math Rendering')).toBeInTheDocument()
    })

    it('should highlight active category button', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      const coreButton = screen.getByRole('button', { name: /core features \(4\)/i })

      // Click Core
      fireEvent.click(coreButton)

      // Should have active styling (bg-nexus-accent)
      expect(coreButton).toHaveClass('bg-nexus-accent')
    })

    it('should remove highlight from previous category', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      const allButton = screen.getByRole('button', { name: /all features \(17\)/i })
      const coreButton = screen.getByRole('button', { name: /core features \(4\)/i })

      // Initially All is active
      expect(allButton).toHaveClass('bg-nexus-accent')

      // Click Core
      fireEvent.click(coreButton)

      // All should no longer be active
      expect(allButton).not.toHaveClass('bg-nexus-accent')
      expect(coreButton).toHaveClass('bg-nexus-accent')
    })
  })

  describe('Feature Details', () => {
    it('should show feature detail panel when feature is clicked', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      // Click a feature card
      fireEvent.click(screen.getByText('Three Editor Modes'))

      // Detail panel should show with description
      expect(screen.getByText(/source mode for raw markdown editing/i)).toBeInTheDocument()
    })

    it('should display feature shortcut in detail panel', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      // Click Focus Mode feature
      fireEvent.click(screen.getByText('Focus Mode'))

      // Should show shortcut in detail panel (there are 2 instances - card and panel)
      const shortcuts = screen.getAllByText('⌘⇧F')
      expect(shortcuts.length).toBeGreaterThan(1)
    })

    it('should show Available Now status badge', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      // Click a feature with available status
      fireEvent.click(screen.getByText('Three Editor Modes'))

      // Should show "Available Now" badge
      expect(screen.getByText('Available Now')).toBeInTheDocument()
    })

    it('should allow closing feature detail panel', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      // Click a feature
      fireEvent.click(screen.getByText('Three Editor Modes'))
      expect(screen.getByText(/source mode for raw markdown editing/i)).toBeInTheDocument()

      // Click the X button in detail panel
      const detailPanel = screen.getByText(/source mode for raw markdown editing/i).closest('div[class*="w-96"]')
      expect(detailPanel).toBeTruthy()

      if (detailPanel) {
        const closeButton = within(detailPanel as HTMLElement).getByRole('button')
        fireEvent.click(closeButton)

        // Detail panel should close
        expect(screen.queryByText(/source mode for raw markdown editing/i)).not.toBeInTheDocument()
      }
    })
  })

  describe('Keyboard Shortcuts Display', () => {
    it('should display shortcuts on feature cards', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      // These features should show shortcuts on their cards
      expect(screen.getByText('⌘E to cycle')).toBeInTheDocument()

      // Some shortcuts appear multiple times (cards + getting started)
      const focusShortcuts = screen.getAllByText('⌘⇧F')
      expect(focusShortcuts.length).toBeGreaterThanOrEqual(1)

      const dailyShortcuts = screen.getAllByText('⌘D')
      expect(dailyShortcuts.length).toBeGreaterThanOrEqual(1)
    })

    it('should show essential shortcuts in getting started', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      // Check for shortcuts in getting started section
      const gettingStarted = screen.getByText('Getting Started').parentElement
      expect(gettingStarted).toBeTruthy()

      if (gettingStarted) {
        expect(within(gettingStarted as HTMLElement).getByText('⌘N')).toBeInTheDocument()
        expect(within(gettingStarted as HTMLElement).getByText('⌘D')).toBeInTheDocument()
        expect(within(gettingStarted as HTMLElement).getByText('⌘K')).toBeInTheDocument()
      }
    })
  })

  describe('Getting Started Section', () => {
    it('should render getting started tips', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      expect(screen.getByText('Getting Started')).toBeInTheDocument()
      expect(screen.getByText('Essential Shortcuts')).toBeInTheDocument()
      expect(screen.getByText('Quick Tips')).toBeInTheDocument()
    })

    it('should display essential shortcuts', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      expect(screen.getByText('New note')).toBeInTheDocument()
      expect(screen.getByText('Daily note')).toBeInTheDocument()
      expect(screen.getByText('Command palette')).toBeInTheDocument()
      expect(screen.getByText('Search')).toBeInTheDocument()
      expect(screen.getByText('Cycle editor modes')).toBeInTheDocument()
    })

    it('should display quick tips', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      const gettingStarted = screen.getByText('Getting Started').parentElement
      expect(gettingStarted).toBeTruthy()

      if (gettingStarted) {
        const content = within(gettingStarted as HTMLElement)
        expect(content.getByText(/link notes with/i)).toBeInTheDocument()
        expect(content.getByText(/tag with/i)).toBeInTheDocument()
        expect(content.getByText(/reference notes with/i)).toBeInTheDocument()
      }
    })
  })

  describe('Close Functionality', () => {
    it('should call onClose when close button is clicked', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      const closeButton = screen.getByTitle('Close features showcase')
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Footer Links', () => {
    it('should render GitHub link', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      const githubLink = screen.getByRole('link', { name: /github/i })
      expect(githubLink).toBeInTheDocument()
      expect(githubLink).toHaveAttribute('href', 'https://github.com/Data-Wise/scribe')
    })

    it('should render documentation link', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      const docsLink = screen.getByRole('link', { name: /documentation/i })
      expect(docsLink).toBeInTheDocument()
      expect(docsLink).toHaveAttribute('href', 'https://data-wise.github.io/scribe')
    })

    it('should open external links in new tab', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      const githubLink = screen.getByRole('link', { name: /github/i })
      expect(githubLink).toHaveAttribute('target', '_blank')
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should render keyboard shortcuts button in footer', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      // Find all buttons with "Keyboard Shortcuts" text (feature cards + footer button)
      const buttons = screen.getAllByRole('button', { name: /keyboard shortcuts/i })
      // Should have at least 2: one feature card + one footer button
      expect(buttons.length).toBeGreaterThanOrEqual(2)

      // Check that version info is in footer (confirms footer rendered)
      expect(screen.getByText(/scribe v1\.14\.0/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      const mainHeading = screen.getByRole('heading', { name: /scribe features/i })
      expect(mainHeading).toBeInTheDocument()
      expect(mainHeading.tagName).toBe('H1')
    })

    it('should have keyboard navigation support for buttons', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      // Tab through interactive elements
      const allButton = screen.getByRole('button', { name: /all features \(17\)/i })
      allButton.focus()
      expect(document.activeElement).toBe(allButton)
    })
  })

  describe('Responsive Layout', () => {
    it('should render in a grid layout', () => {
      const { container } = render(<FeaturesShowcase onClose={mockOnClose} />)

      // Should have grid classes
      const grid = container.querySelector('.grid')
      expect(grid).toBeTruthy()
    })

    it('should have responsive column classes', () => {
      const { container } = render(<FeaturesShowcase onClose={mockOnClose} />)

      // Should have responsive grid columns (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
      const grid = container.querySelector('[class*="grid-cols"]')
      expect(grid).toBeTruthy()
    })
  })

  describe('Visual Styling', () => {
    it('should use Nexus theme colors', () => {
      const { container } = render(<FeaturesShowcase onClose={mockOnClose} />)

      // Should have nexus- prefixed classes
      const nexusElements = container.querySelectorAll('[class*="nexus-"]')
      expect(nexusElements.length).toBeGreaterThan(0)
    })

    it('should have hover effects on feature cards', () => {
      const { container } = render(<FeaturesShowcase onClose={mockOnClose} />)

      // Feature cards should have hover classes
      const hoverElements = container.querySelectorAll('[class*="hover:"]')
      expect(hoverElements.length).toBeGreaterThan(0)
    })

    it('should show status badge for available features', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      // All features should show available status (green checkmark icons)
      const { container } = render(<FeaturesShowcase onClose={mockOnClose} />)
      const checkIcons = container.querySelectorAll('.text-green-500')
      expect(checkIcons.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid category switching', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      const core = screen.getByRole('button', { name: /core features \(4\)/i })
      const editing = screen.getByRole('button', { name: /editing \(3\)/i })
      const organization = screen.getByRole('button', { name: /organization \(4\)/i })

      // Rapidly switch categories
      fireEvent.click(core)
      fireEvent.click(editing)
      fireEvent.click(organization)

      // Should end on organization
      expect(organization).toHaveClass('bg-nexus-accent')
    })

    it('should handle clicking same feature multiple times', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      const feature = screen.getByText('Three Editor Modes')

      // Click multiple times
      fireEvent.click(feature)
      fireEvent.click(feature)
      fireEvent.click(feature)

      // Should not error
      expect(feature).toBeInTheDocument()
    })

    it('should handle feature selection and deselection', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      // Click feature to select
      fireEvent.click(screen.getByText('Three Editor Modes'))
      expect(screen.getByText('Available Now')).toBeInTheDocument()

      // Click X to deselect
      const detailPanel = screen.getByText('Available Now').closest('div[class*="w-96"]')
      if (detailPanel) {
        const closeButton = within(detailPanel as HTMLElement).getByRole('button')
        fireEvent.click(closeButton)
        expect(screen.queryByText('Available Now')).not.toBeInTheDocument()
      }
    })
  })

  describe('Interactive Demo Content', () => {
    it('should display demo content for features with demos', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      // Click a feature with demo
      fireEvent.click(screen.getByText('WikiLinks Navigation'))

      // Should show demo content
      expect(screen.getByText('Try it')).toBeInTheDocument()
    })

    it('should handle different demo types', () => {
      render(<FeaturesShowcase onClose={mockOnClose} />)

      // Text demo
      fireEvent.click(screen.getByText('Focus Mode'))
      expect(screen.getByText('Details')).toBeInTheDocument()

      // Interactive demo
      fireEvent.click(screen.getByText('WikiLinks Navigation'))
      expect(screen.getByText('Try it')).toBeInTheDocument()
    })
  })
})
