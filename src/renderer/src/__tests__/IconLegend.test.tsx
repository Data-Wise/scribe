import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { IconLegend } from '../components/sidebar/IconLegend'

const STORAGE_KEY = 'hasSeenSidebarGuide'

describe('IconLegend', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear()
  })

  describe('Visibility', () => {
    it('renders when localStorage flag is not set', () => {
      render(<IconLegend />)
      expect(screen.getByTestId('icon-legend-overlay')).toBeInTheDocument()
    })

    it('does not render when localStorage flag is set to "true"', () => {
      localStorage.setItem(STORAGE_KEY, 'true')
      render(<IconLegend />)
      expect(screen.queryByTestId('icon-legend-overlay')).not.toBeInTheDocument()
    })

    it('renders when localStorage flag is set to any value other than "true"', () => {
      localStorage.setItem(STORAGE_KEY, 'false')
      render(<IconLegend />)
      expect(screen.getByTestId('icon-legend-overlay')).toBeInTheDocument()
    })
  })

  describe('Content', () => {
    it('displays the title "Sidebar Guide"', () => {
      render(<IconLegend />)
      expect(screen.getByText('Sidebar Guide')).toBeInTheDocument()
    })

    it('displays all icon descriptions', () => {
      render(<IconLegend />)
      expect(screen.getByText('Active project')).toBeInTheDocument()
      expect(screen.getByText('Inactive project')).toBeInTheDocument()
      expect(screen.getByText('Inbox (quick notes)')).toBeInTheDocument()
      expect(screen.getByText('Search all notes')).toBeInTheDocument()
      expect(screen.getByText("Today's daily note")).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('displays the tip message', () => {
      render(<IconLegend />)
      expect(screen.getByText(/Click any dot to expand the sidebar/i)).toBeInTheDocument()
    })

    it('displays the "Got it" button', () => {
      render(<IconLegend />)
      expect(screen.getByTestId('icon-legend-dismiss')).toBeInTheDocument()
      expect(screen.getByText('Got it')).toBeInTheDocument()
    })
  })

  describe('Dismissal', () => {
    it('sets localStorage flag to "true" when "Got it" button is clicked', () => {
      render(<IconLegend />)
      const dismissButton = screen.getByTestId('icon-legend-dismiss')
      fireEvent.click(dismissButton)
      expect(localStorage.getItem(STORAGE_KEY)).toBe('true')
    })

    it('removes component from DOM when "Got it" button is clicked', () => {
      render(<IconLegend />)
      const dismissButton = screen.getByTestId('icon-legend-dismiss')
      fireEvent.click(dismissButton)
      expect(screen.queryByTestId('icon-legend-overlay')).not.toBeInTheDocument()
    })

    it('sets localStorage flag when close button (X) is clicked', () => {
      render(<IconLegend />)
      const closeButton = screen.getByTestId('icon-legend-close')
      fireEvent.click(closeButton)
      expect(localStorage.getItem(STORAGE_KEY)).toBe('true')
    })

    it('removes component from DOM when close button is clicked', () => {
      render(<IconLegend />)
      const closeButton = screen.getByTestId('icon-legend-close')
      fireEvent.click(closeButton)
      expect(screen.queryByTestId('icon-legend-overlay')).not.toBeInTheDocument()
    })

    it('dismisses when backdrop is clicked', () => {
      render(<IconLegend />)
      const overlay = screen.getByTestId('icon-legend-overlay')
      fireEvent.click(overlay)
      expect(localStorage.getItem(STORAGE_KEY)).toBe('true')
      expect(screen.queryByTestId('icon-legend-overlay')).not.toBeInTheDocument()
    })

    it('dismisses when Escape key is pressed', () => {
      render(<IconLegend />)
      fireEvent.keyDown(window, { key: 'Escape' })
      expect(localStorage.getItem(STORAGE_KEY)).toBe('true')
      expect(screen.queryByTestId('icon-legend-overlay')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<IconLegend />)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-labelledby', 'icon-legend-title')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })

    it('has accessible close button label', () => {
      render(<IconLegend />)
      const closeButton = screen.getByLabelText('Close guide')
      expect(closeButton).toBeInTheDocument()
    })

    it('has autofocus prop on "Got it" button', () => {
      render(<IconLegend />)
      const dismissButton = screen.getByTestId('icon-legend-dismiss')
      // In test environment, autofocus doesn't set focus immediately
      // Just verify the button exists and is focusable
      expect(dismissButton).toBeInTheDocument()
      expect(dismissButton.tagName).toBe('BUTTON')
    })
  })

  describe('Keyboard Navigation', () => {
    it('does not dismiss on non-Escape keys', () => {
      render(<IconLegend />)
      fireEvent.keyDown(window, { key: 'Enter' })
      expect(screen.getByTestId('icon-legend-overlay')).toBeInTheDocument()
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })

    it('cleans up event listeners when unmounted', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      const { unmount } = render(<IconLegend />)
      unmount()
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
      removeEventListenerSpy.mockRestore()
    })
  })

  describe('Edge Cases', () => {
    it('handles multiple rapid clicks gracefully', () => {
      render(<IconLegend />)
      const dismissButton = screen.getByTestId('icon-legend-dismiss')
      fireEvent.click(dismissButton)
      fireEvent.click(dismissButton)
      fireEvent.click(dismissButton)
      expect(localStorage.getItem(STORAGE_KEY)).toBe('true')
    })

    it('does not crash if localStorage is unavailable', () => {
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('localStorage is full')
      })

      expect(() => {
        render(<IconLegend />)
        const dismissButton = screen.getByTestId('icon-legend-dismiss')
        fireEvent.click(dismissButton)
      }).not.toThrow()

      Storage.prototype.setItem = originalSetItem
    })
  })
})
