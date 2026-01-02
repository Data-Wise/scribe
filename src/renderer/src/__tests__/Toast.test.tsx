/**
 * Toast Component Tests
 *
 * Comprehensive tests for the Toast notification system including:
 * - ToastProvider rendering
 * - useToast hook behavior
 * - Toast types (error, success, info)
 * - Auto-dismiss and persistent toasts
 * - Global toast functions
 * - Copy and dismiss functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import {
  ToastProvider,
  useToast,
  setGlobalToast,
  showGlobalToast
} from '../components/Toast'

// ============================================================================
// Setup and Mocks
// ============================================================================

// Mock navigator.clipboard
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined)
}

Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true
})

describe('Toast Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ==========================================================================
  // ToastProvider Tests
  // ==========================================================================

  describe('ToastProvider', () => {
    it('renders children correctly', () => {
      render(
        <ToastProvider>
          <div data-testid="child">Child Content</div>
        </ToastProvider>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
      expect(screen.getByText('Child Content')).toBeInTheDocument()
    })

    it('renders multiple children', () => {
      render(
        <ToastProvider>
          <div data-testid="child1">First</div>
          <div data-testid="child2">Second</div>
        </ToastProvider>
      )

      expect(screen.getByTestId('child1')).toBeInTheDocument()
      expect(screen.getByTestId('child2')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // useToast Hook Tests
  // ==========================================================================

  describe('useToast hook', () => {
    it('returns showToast function when used within provider', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ToastProvider>{children}</ToastProvider>
      )

      const { result } = renderHook(() => useToast(), { wrapper })

      expect(result.current).toHaveProperty('showToast')
      expect(typeof result.current.showToast).toBe('function')
    })

    it('throws error when used outside ToastProvider', () => {
      // Suppress console.error for this test since React will log the error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useToast())
      }).toThrow('useToast must be used within a ToastProvider')

      consoleSpy.mockRestore()
    })
  })

  // ==========================================================================
  // Toast Creation Tests
  // ==========================================================================

  describe('showToast', () => {
    it('creates error toasts that are persistent', async () => {
      const TestComponent = () => {
        const { showToast } = useToast()
        return (
          <button onClick={() => showToast('Error message', 'error')}>
            Show Error
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Show Error'))

      // Error toast should be visible
      expect(screen.getByText('Error message')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveClass('toast-error')
      expect(screen.getByRole('alert')).toHaveClass('toast-persistent')

      // Error toasts should NOT auto-dismiss after 4 seconds
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      // Should still be visible
      expect(screen.getByText('Error message')).toBeInTheDocument()
    })

    it('creates success toasts that auto-dismiss', async () => {
      const TestComponent = () => {
        const { showToast } = useToast()
        return (
          <button onClick={() => showToast('Success message', 'success')}>
            Show Success
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Show Success'))

      // Success toast should be visible
      expect(screen.getByText('Success message')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveClass('toast-success')
      expect(screen.getByRole('alert')).not.toHaveClass('toast-persistent')

      // Should auto-dismiss after 4 seconds
      act(() => {
        vi.advanceTimersByTime(4000)
      })

      // Should be gone
      expect(screen.queryByText('Success message')).not.toBeInTheDocument()
    })

    it('creates info toasts that auto-dismiss', async () => {
      const TestComponent = () => {
        const { showToast } = useToast()
        return (
          <button onClick={() => showToast('Info message', 'info')}>
            Show Info
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Show Info'))

      // Info toast should be visible
      expect(screen.getByText('Info message')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveClass('toast-info')

      // Should auto-dismiss after 4 seconds
      act(() => {
        vi.advanceTimersByTime(4000)
      })

      // Should be gone
      expect(screen.queryByText('Info message')).not.toBeInTheDocument()
    })

    it('defaults to error type when no type specified', () => {
      const TestComponent = () => {
        const { showToast } = useToast()
        return (
          <button onClick={() => showToast('Default message')}>
            Show Default
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Show Default'))

      expect(screen.getByRole('alert')).toHaveClass('toast-error')
      expect(screen.getByRole('alert')).toHaveClass('toast-persistent')
    })
  })

  // ==========================================================================
  // ToastContainer Tests
  // ==========================================================================

  describe('ToastContainer', () => {
    it('renders nothing when there are no toasts', () => {
      const { container } = render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      )

      // No toast container should be rendered
      expect(container.querySelector('.toast-container')).not.toBeInTheDocument()
    })

    it('renders toasts with correct icons', () => {
      const TestComponent = () => {
        const { showToast } = useToast()
        return (
          <>
            <button onClick={() => showToast('Error', 'error')}>Error</button>
            <button onClick={() => showToast('Success', 'success')}>Success</button>
            <button onClick={() => showToast('Info', 'info')}>Info</button>
          </>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      // Create all three toast types
      fireEvent.click(screen.getByText('Error'))
      fireEvent.click(screen.getByText('Success'))
      fireEvent.click(screen.getByText('Info'))

      // Check for icons - they are in separate spans with class toast-icon
      const toasts = screen.getAllByRole('alert')
      expect(toasts).toHaveLength(3)

      // Error toast has warning emoji
      const errorToast = toasts.find(t => t.classList.contains('toast-error'))
      expect(errorToast?.querySelector('.toast-icon')?.textContent).toContain('⚠️')

      // Success toast has checkmark
      const successToast = toasts.find(t => t.classList.contains('toast-success'))
      expect(successToast?.querySelector('.toast-icon')?.textContent).toContain('✓')

      // Info toast has info emoji
      const infoToast = toasts.find(t => t.classList.contains('toast-info'))
      expect(infoToast?.querySelector('.toast-icon')?.textContent).toContain('ℹ️')
    })

    it('renders multiple toasts', () => {
      const TestComponent = () => {
        const { showToast } = useToast()
        return (
          <button onClick={() => {
            showToast('First error', 'error')
            showToast('Second error', 'error')
            showToast('Third error', 'error')
          }}>
            Show Multiple
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Show Multiple'))

      expect(screen.getByText('First error')).toBeInTheDocument()
      expect(screen.getByText('Second error')).toBeInTheDocument()
      expect(screen.getByText('Third error')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Dismiss Button Tests
  // ==========================================================================

  describe('Dismiss button', () => {
    it('removes toast when dismiss button is clicked', () => {
      const TestComponent = () => {
        const { showToast } = useToast()
        return (
          <button onClick={() => showToast('Dismissible message', 'error')}>
            Show Toast
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Show Toast'))
      expect(screen.getByText('Dismissible message')).toBeInTheDocument()

      // Click dismiss button (OK for error toasts)
      fireEvent.click(screen.getByLabelText('Dismiss'))

      expect(screen.queryByText('Dismissible message')).not.toBeInTheDocument()
    })

    it('shows "OK" for persistent (error) toasts', () => {
      const TestComponent = () => {
        const { showToast } = useToast()
        return (
          <button onClick={() => showToast('Error toast', 'error')}>
            Show Error
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Show Error'))

      const dismissButton = screen.getByLabelText('Dismiss')
      expect(dismissButton.textContent).toBe('OK')
    })

    it('shows "x" for non-persistent (success/info) toasts', () => {
      const TestComponent = () => {
        const { showToast } = useToast()
        return (
          <button onClick={() => showToast('Success toast', 'success')}>
            Show Success
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Show Success'))

      const dismissButton = screen.getByLabelText('Dismiss')
      expect(dismissButton.textContent).toBe('×')
    })
  })

  // ==========================================================================
  // Copy Button Tests
  // ==========================================================================

  describe('Copy button', () => {
    it('copies message to clipboard when clicked', async () => {
      // Use real timers for async clipboard operations
      vi.useRealTimers()

      const TestComponent = () => {
        const { showToast } = useToast()
        return (
          <button onClick={() => showToast('Copy this message', 'error')}>
            Show Toast
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Show Toast'))

      // Click copy button
      const copyButton = screen.getByLabelText('Copy error')
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith('Copy this message')
      }, { timeout: 2000 })

      // Restore fake timers
      vi.useFakeTimers()
    })

    it('shows "Copied!" feedback after copying', async () => {
      // Use real timers for async clipboard operations
      vi.useRealTimers()

      const TestComponent = () => {
        const { showToast } = useToast()
        return (
          <button onClick={() => showToast('Test message', 'error')}>
            Show Toast
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Show Toast'))

      const copyButton = screen.getByLabelText('Copy error')
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(copyButton.textContent).toBe('Copied!')
      }, { timeout: 2000 })

      // For testing the revert, wait 1+ second
      await new Promise(resolve => setTimeout(resolve, 1100))

      expect(copyButton.textContent).toBe('Copy')

      // Restore fake timers
      vi.useFakeTimers()
    })

    it('only shows copy button for persistent (error) toasts', () => {
      const TestComponent = () => {
        const { showToast } = useToast()
        return (
          <>
            <button onClick={() => showToast('Error msg', 'error')}>Error</button>
            <button onClick={() => showToast('Success msg', 'success')}>Success</button>
          </>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Error'))
      fireEvent.click(screen.getByText('Success'))

      // Only error toast should have copy button
      const copyButtons = screen.queryAllByLabelText('Copy error')
      expect(copyButtons).toHaveLength(1)
    })

    it('handles clipboard error gracefully', async () => {
      // Use real timers for this async test
      vi.useRealTimers()

      // Mock clipboard to throw error
      mockClipboard.writeText.mockRejectedValueOnce(new Error('Clipboard error'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const TestComponent = () => {
        const { showToast } = useToast()
        return (
          <button onClick={() => showToast('Test message', 'error')}>
            Show Toast
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Show Toast'))

      const copyButton = screen.getByLabelText('Copy error')
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to copy:', expect.any(Error))
      }, { timeout: 2000 })

      consoleSpy.mockRestore()
      // Restore fake timers for other tests
      vi.useFakeTimers()
    })
  })

  // ==========================================================================
  // Global Toast Functions Tests
  // ==========================================================================

  describe('Global toast functions', () => {
    it('setGlobalToast registers the showToast function', () => {
      const mockShowToast = vi.fn()
      setGlobalToast(mockShowToast)

      showGlobalToast('Test message')

      expect(mockShowToast).toHaveBeenCalledWith('Test message', 'error')
    })

    it('showGlobalToast calls registered function with message and type', () => {
      const mockShowToast = vi.fn()
      setGlobalToast(mockShowToast)

      showGlobalToast('Success!', 'success')

      expect(mockShowToast).toHaveBeenCalledWith('Success!', 'success')
    })

    it('showGlobalToast defaults to error type', () => {
      const mockShowToast = vi.fn()
      setGlobalToast(mockShowToast)

      showGlobalToast('Error message')

      expect(mockShowToast).toHaveBeenCalledWith('Error message', 'error')
    })

    it('showGlobalToast falls back to console.error when not initialized', () => {
      // Reset global toast to null by setting a new one and clearing it
      setGlobalToast(null as unknown as (msg: string, type?: 'error' | 'success' | 'info') => void)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      showGlobalToast('Fallback message')

      expect(consoleSpy).toHaveBeenCalledWith('[Toast]', 'Fallback message')

      consoleSpy.mockRestore()
    })
  })

  // ==========================================================================
  // Edge Cases and Integration Tests
  // ==========================================================================

  describe('Edge cases', () => {
    it('handles rapid toast creation', () => {
      const TestComponent = () => {
        const { showToast } = useToast()
        return (
          <button onClick={() => {
            for (let i = 0; i < 5; i++) {
              showToast(`Toast ${i}`, 'error')
            }
          }}>
            Rapid Fire
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Rapid Fire'))

      const toasts = screen.getAllByRole('alert')
      expect(toasts).toHaveLength(5)
    })

    it('handles empty message', () => {
      const TestComponent = () => {
        const { showToast } = useToast()
        return (
          <button onClick={() => showToast('', 'error')}>
            Empty Toast
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Empty Toast'))

      // Toast should still render with empty message
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('handles long messages', () => {
      const longMessage = 'A'.repeat(500)

      const TestComponent = () => {
        const { showToast } = useToast()
        return (
          <button onClick={() => showToast(longMessage, 'error')}>
            Long Toast
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Long Toast'))

      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it('handles special characters in messages', () => {
      const specialMessage = '<script>alert("xss")</script> & "quotes" \'single\''

      const TestComponent = () => {
        const { showToast } = useToast()
        return (
          <button onClick={() => showToast(specialMessage, 'error')}>
            Special Toast
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Special Toast'))

      // React escapes HTML, so it should render as text
      expect(screen.getByText(specialMessage)).toBeInTheDocument()
    })
  })
})
