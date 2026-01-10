import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PresetUpdateDialog } from '../components/PresetUpdateDialog'

/**
 * PresetUpdateDialog Unit Test Suite
 *
 * Tests Phase 6: Preset Update Dialog component in isolation
 * Covers rendering, checkbox behavior, button actions, and accessibility
 */

describe('PresetUpdateDialog Component', () => {
  const defaultProps = {
    currentPreset: 'medium',
    currentWidth: 280,
    suggestedPreset: 'wide',
    suggestedWidth: 360,
    onUpdate: vi.fn(),
    onSkip: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================================
  // Rendering Tests
  // ============================================================

  describe('Rendering', () => {
    it('renders with correct preset names and widths', () => {
      render(<PresetUpdateDialog {...defaultProps} />)

      // Check for preset labels (use getAllByText since they appear multiple times)
      const mediumElements = screen.getAllByText(/Medium \(280px\)/i)
      const wideElements = screen.getAllByText(/Wide \(360px\)/i)

      expect(mediumElements.length).toBeGreaterThan(0)
      expect(wideElements.length).toBeGreaterThan(0)

      // Check for current width in description (also appears multiple times)
      const widthElements = screen.getAllByText(/280px/i)
      expect(widthElements.length).toBeGreaterThan(0)
    })

    it('shows visual comparison of current vs suggested preset', () => {
      render(<PresetUpdateDialog {...defaultProps} />)

      // Both presets should be visible
      const presetItems = screen.getAllByText(/\((\d+)px\)/i)
      expect(presetItems.length).toBeGreaterThanOrEqual(2)

      // Check for comparison container
      const { container } = render(<PresetUpdateDialog {...defaultProps} />)
      const comparison = container.querySelector('.preset-comparison')
      expect(comparison).toBeInTheDocument()
    })

    it('renders all preset types correctly', () => {
      const presets = [
        { current: 'narrow', suggested: 'medium', currentW: 200, suggestedW: 280 },
        { current: 'medium', suggested: 'wide', currentW: 280, suggestedW: 360 },
        { current: 'wide', suggested: 'medium', currentW: 360, suggestedW: 280 }
      ]

      presets.forEach(({ current, suggested, currentW, suggestedW }) => {
        const { unmount } = render(
          <PresetUpdateDialog
            currentPreset={current}
            currentWidth={currentW}
            suggestedPreset={suggested}
            suggestedWidth={suggestedW}
            onUpdate={vi.fn()}
            onSkip={vi.fn()}
          />
        )

        // Should render without errors
        expect(screen.getByText('Update Width Preset?')).toBeInTheDocument()

        unmount()
      })
    })
  })

  // ============================================================
  // Checkbox Behavior Tests
  // ============================================================

  describe('Checkbox Behavior', () => {
    it('checkbox unchecked by default', () => {
      render(<PresetUpdateDialog {...defaultProps} />)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })

    it('checkbox state toggles on click', () => {
      render(<PresetUpdateDialog {...defaultProps} />)

      const checkbox = screen.getByRole('checkbox')

      // Initially unchecked
      expect(checkbox).not.toBeChecked()

      // Click to check
      fireEvent.click(checkbox)
      expect(checkbox).toBeChecked()

      // Click to uncheck
      fireEvent.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })

    it('passes checkbox state to onUpdate callback', () => {
      const onUpdate = vi.fn()
      render(<PresetUpdateDialog {...defaultProps} onUpdate={onUpdate} />)

      const checkbox = screen.getByRole('checkbox')
      const updateButton = screen.getByRole('button', { name: 'Update Preset' })

      // Check the checkbox
      fireEvent.click(checkbox)

      // Click update button
      fireEvent.click(updateButton)

      // Should pass true to onUpdate
      expect(onUpdate).toHaveBeenCalledWith(true)
    })
  })

  // ============================================================
  // Button Actions Tests
  // ============================================================

  describe('Button Actions', () => {
    it('calls onUpdate with dontAskAgain=false when Update clicked without checkbox', () => {
      const onUpdate = vi.fn()
      render(<PresetUpdateDialog {...defaultProps} onUpdate={onUpdate} />)

      const updateButton = screen.getByRole('button', { name: 'Update Preset' })
      fireEvent.click(updateButton)

      expect(onUpdate).toHaveBeenCalledWith(false)
      expect(onUpdate).toHaveBeenCalledTimes(1)
    })

    it('calls onUpdate with dontAskAgain=true when Update clicked with checkbox', () => {
      const onUpdate = vi.fn()
      render(<PresetUpdateDialog {...defaultProps} onUpdate={onUpdate} />)

      const checkbox = screen.getByRole('checkbox')
      const updateButton = screen.getByRole('button', { name: 'Update Preset' })

      // Check the checkbox first
      fireEvent.click(checkbox)

      // Then click update
      fireEvent.click(updateButton)

      expect(onUpdate).toHaveBeenCalledWith(true)
      expect(onUpdate).toHaveBeenCalledTimes(1)
    })

    it('calls onSkip when Skip button clicked', () => {
      const onSkip = vi.fn()
      render(<PresetUpdateDialog {...defaultProps} onSkip={onSkip} />)

      const skipButton = screen.getByRole('button', { name: 'Skip' })
      fireEvent.click(skipButton)

      expect(onSkip).toHaveBeenCalledTimes(1)
    })

    it('calls onSkip when close button (X) clicked', () => {
      const onSkip = vi.fn()
      render(<PresetUpdateDialog {...defaultProps} onSkip={onSkip} />)

      const closeButton = screen.getByRole('button', { name: 'Close dialog' })
      fireEvent.click(closeButton)

      expect(onSkip).toHaveBeenCalledTimes(1)
    })
  })

  // ============================================================
  // Accessibility Tests
  // ============================================================

  describe('Accessibility', () => {
    it('has proper ARIA labels for all interactive elements', () => {
      render(<PresetUpdateDialog {...defaultProps} />)

      // Close button has aria-label
      const closeButton = screen.getByRole('button', { name: 'Close dialog' })
      expect(closeButton).toHaveAttribute('aria-label', 'Close dialog')

      // Checkbox is accessible
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()

      // All buttons are accessible
      expect(screen.getByRole('button', { name: 'Skip' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Update Preset' })).toBeInTheDocument()
    })

    it('checkbox has descriptive label', () => {
      render(<PresetUpdateDialog {...defaultProps} />)

      expect(screen.getByText(/Don't ask again/i)).toBeInTheDocument()
    })
  })

  // ============================================================
  // Edge Cases Tests
  // ============================================================

  describe('Edge Cases', () => {
    it('handles same currentPreset and suggestedPreset gracefully', () => {
      render(
        <PresetUpdateDialog
          currentPreset="medium"
          currentWidth={280}
          suggestedPreset="medium"
          suggestedWidth={280}
          onUpdate={vi.fn()}
          onSkip={vi.fn()}
        />
      )

      // Should still render without errors
      expect(screen.getByText('Update Width Preset?')).toBeInTheDocument()

      // Both should show Medium
      const mediumElements = screen.getAllByText(/Medium \(280px\)/i)
      expect(mediumElements.length).toBeGreaterThan(0)
    })

    it('handles very large width values without layout breaks', () => {
      const { container } = render(
        <PresetUpdateDialog
          currentPreset="wide"
          currentWidth={9999}
          suggestedPreset="wide"
          suggestedWidth={9999}
          onUpdate={vi.fn()}
          onSkip={vi.fn()}
        />
      )

      // Should render without breaking
      expect(container.querySelector('.preset-update-dialog')).toBeInTheDocument()

      // Width should be displayed
      expect(screen.getByText(/9999px/i)).toBeInTheDocument()
    })

    it('handles all preset combinations', () => {
      const combinations = [
        ['narrow', 'medium'],
        ['narrow', 'wide'],
        ['medium', 'narrow'],
        ['medium', 'wide'],
        ['wide', 'narrow'],
        ['wide', 'medium']
      ]

      combinations.forEach(([current, suggested]) => {
        const { unmount } = render(
          <PresetUpdateDialog
            currentPreset={current}
            currentWidth={280}
            suggestedPreset={suggested}
            suggestedWidth={360}
            onUpdate={vi.fn()}
            onSkip={vi.fn()}
          />
        )

        // Should render without errors
        expect(screen.getByRole('heading', { name: 'Update Width Preset?' })).toBeInTheDocument()

        unmount()
      })
    })

    it('checkbox state persists during re-renders', () => {
      const { rerender } = render(<PresetUpdateDialog {...defaultProps} />)

      const checkbox = screen.getByRole('checkbox')

      // Check the checkbox
      fireEvent.click(checkbox)
      expect(checkbox).toBeChecked()

      // Re-render with same props
      rerender(<PresetUpdateDialog {...defaultProps} />)

      // Checkbox should still be checked
      const updatedCheckbox = screen.getByRole('checkbox')
      expect(updatedCheckbox).toBeChecked()
    })
  })

  // ============================================================
  // Content Validation Tests
  // ============================================================

  describe('Content Validation', () => {
    it('displays helpful hint about preset update effects', () => {
      render(<PresetUpdateDialog {...defaultProps} />)

      expect(screen.getByText(/cycle behavior/i)).toBeInTheDocument()
      expect(screen.getByText(/default widths/i)).toBeInTheDocument()
    })

    it('shows current preset label', () => {
      render(<PresetUpdateDialog {...defaultProps} />)

      expect(screen.getByText('Current Preset:')).toBeInTheDocument()
    })

    it('shows suggested preset label', () => {
      render(<PresetUpdateDialog {...defaultProps} />)

      expect(screen.getByText('Suggested Preset:')).toBeInTheDocument()
    })
  })
})
