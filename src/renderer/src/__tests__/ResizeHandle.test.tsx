import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ResizeHandle } from '../components/sidebar/ResizeHandle'

/**
 * ResizeHandle Unit Test Suite
 *
 * Tests resize handle component: drag behavior, double-click reset,
 * accessibility, and cursor management
 */

describe('ResizeHandle Component', () => {
  const mockOnResize = vi.fn()
  const mockOnResizeEnd = vi.fn()
  const mockOnReset = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Reset body styles after each test
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  })

  // ============================================================
  // Rendering Tests
  // ============================================================

  describe('Rendering', () => {
    it('renders resize handle with correct class', () => {
      const { container } = render(
        <ResizeHandle
          onResize={mockOnResize}
          onResizeEnd={mockOnResizeEnd}
        />
      )

      const handle = container.querySelector('.resize-handle')
      expect(handle).toBeInTheDocument()
    })

    it('does not render when disabled', () => {
      const { container } = render(
        <ResizeHandle
          onResize={mockOnResize}
          onResizeEnd={mockOnResizeEnd}
          disabled={true}
        />
      )

      const handle = container.querySelector('.resize-handle')
      expect(handle).not.toBeInTheDocument()
    })

    it('has proper ARIA role and label', () => {
      render(
        <ResizeHandle
          onResize={mockOnResize}
          onResizeEnd={mockOnResizeEnd}
        />
      )

      const handle = screen.getByRole('separator')
      expect(handle).toHaveAttribute('aria-orientation', 'vertical')
      expect(handle).toHaveAttribute('aria-label', 'Resize sidebar (double-click to reset)')
    })

    it('shows tooltip "Double-click to reset width"', () => {
      render(
        <ResizeHandle
          onResize={mockOnResize}
          onResizeEnd={mockOnResizeEnd}
        />
      )

      const handle = screen.getByRole('separator')
      expect(handle).toHaveAttribute('title', 'Double-click to reset width')
    })
  })

  // ============================================================
  // Drag Behavior Tests
  // ============================================================

  describe('Drag Behavior', () => {
    it('calls onResize with deltaX on drag', () => {
      const { container } = render(
        <ResizeHandle
          onResize={mockOnResize}
          onResizeEnd={mockOnResizeEnd}
        />
      )

      const handle = container.querySelector('.resize-handle')!

      // Start drag at x=100
      fireEvent.mouseDown(handle, { clientX: 100 })

      // Move to x=150 (deltaX = 50)
      fireEvent.mouseMove(document, { clientX: 150 })

      expect(mockOnResize).toHaveBeenCalledWith(50)
    })

    it('calculates deltaX correctly for multiple moves', () => {
      const { container } = render(
        <ResizeHandle
          onResize={mockOnResize}
          onResizeEnd={mockOnResizeEnd}
        />
      )

      const handle = container.querySelector('.resize-handle')!

      // Start drag
      fireEvent.mouseDown(handle, { clientX: 100 })

      // First move: 100 → 120 (deltaX = 20)
      fireEvent.mouseMove(document, { clientX: 120 })
      expect(mockOnResize).toHaveBeenCalledWith(20)

      // Second move: 120 → 130 (deltaX = 10)
      fireEvent.mouseMove(document, { clientX: 130 })
      expect(mockOnResize).toHaveBeenCalledWith(10)

      // Third move: 130 → 110 (deltaX = -20, moving left)
      fireEvent.mouseMove(document, { clientX: 110 })
      expect(mockOnResize).toHaveBeenCalledWith(-20)
    })

    it('applies col-resize cursor during drag', () => {
      const { container } = render(
        <ResizeHandle
          onResize={mockOnResize}
          onResizeEnd={mockOnResizeEnd}
        />
      )

      const handle = container.querySelector('.resize-handle')!

      // Before drag - no cursor set
      expect(document.body.style.cursor).toBe('')

      // Start drag
      fireEvent.mouseDown(handle, { clientX: 100 })

      // During drag - cursor should be col-resize
      expect(document.body.style.cursor).toBe('col-resize')

      // End drag
      fireEvent.mouseUp(document)

      // After drag - cursor should be reset
      expect(document.body.style.cursor).toBe('')
    })

    it('prevents text selection during drag (user-select: none)', () => {
      const { container } = render(
        <ResizeHandle
          onResize={mockOnResize}
          onResizeEnd={mockOnResizeEnd}
        />
      )

      const handle = container.querySelector('.resize-handle')!

      // Before drag
      expect(document.body.style.userSelect).toBe('')

      // Start drag
      fireEvent.mouseDown(handle, { clientX: 100 })

      // During drag - should prevent selection
      expect(document.body.style.userSelect).toBe('none')

      // End drag
      fireEvent.mouseUp(document)

      // After drag - should restore selection
      expect(document.body.style.userSelect).toBe('')
    })

    it('adds dragging class during drag', () => {
      const { container } = render(
        <ResizeHandle
          onResize={mockOnResize}
          onResizeEnd={mockOnResizeEnd}
        />
      )

      const handle = container.querySelector('.resize-handle')!

      // Before drag
      expect(handle).not.toHaveClass('dragging')

      // Start drag
      fireEvent.mouseDown(handle, { clientX: 100 })

      // During drag
      expect(handle).toHaveClass('dragging')

      // End drag
      fireEvent.mouseUp(document)

      // After drag
      expect(handle).not.toHaveClass('dragging')
    })
  })

  // ============================================================
  // Double-Click Reset Tests
  // ============================================================

  describe('Double-Click Reset', () => {
    it('calls onReset when double-clicked', () => {
      const { container } = render(
        <ResizeHandle
          onResize={mockOnResize}
          onResizeEnd={mockOnResizeEnd}
          onReset={mockOnReset}
        />
      )

      const handle = container.querySelector('.resize-handle')!

      fireEvent.doubleClick(handle)

      expect(mockOnReset).toHaveBeenCalledTimes(1)
    })

    it('calls onResizeEnd after reset (to save state)', () => {
      const { container } = render(
        <ResizeHandle
          onResize={mockOnResize}
          onResizeEnd={mockOnResizeEnd}
          onReset={mockOnReset}
        />
      )

      const handle = container.querySelector('.resize-handle')!

      fireEvent.doubleClick(handle)

      expect(mockOnReset).toHaveBeenCalledTimes(1)
      expect(mockOnResizeEnd).toHaveBeenCalledTimes(1)

      // onReset should be called before onResizeEnd
      const resetCallOrder = mockOnReset.mock.invocationCallOrder[0]
      const resizeEndCallOrder = mockOnResizeEnd.mock.invocationCallOrder[0]
      expect(resetCallOrder).toBeLessThan(resizeEndCallOrder)
    })

    it('handles double-click when onReset is not provided', () => {
      const { container } = render(
        <ResizeHandle
          onResize={mockOnResize}
          onResizeEnd={mockOnResizeEnd}
          // No onReset prop
        />
      )

      const handle = container.querySelector('.resize-handle')!

      // Should not throw error
      expect(() => {
        fireEvent.doubleClick(handle)
      }).not.toThrow()

      // Should still call onResizeEnd
      expect(mockOnResizeEnd).toHaveBeenCalledTimes(1)
    })
  })

  // ============================================================
  // Drag End Tests
  // ============================================================

  describe('Drag End', () => {
    it('calls onResizeEnd when drag ends', () => {
      const { container } = render(
        <ResizeHandle
          onResize={mockOnResize}
          onResizeEnd={mockOnResizeEnd}
        />
      )

      const handle = container.querySelector('.resize-handle')!

      // Start and drag
      fireEvent.mouseDown(handle, { clientX: 100 })
      fireEvent.mouseMove(document, { clientX: 150 })

      // End drag
      fireEvent.mouseUp(document)

      expect(mockOnResizeEnd).toHaveBeenCalledTimes(1)
    })

    it('does not call onResizeEnd if drag never started', () => {
      render(
        <ResizeHandle
          onResize={mockOnResize}
          onResizeEnd={mockOnResizeEnd}
        />
      )

      // Just mouse up without dragging
      fireEvent.mouseUp(document)

      expect(mockOnResizeEnd).not.toHaveBeenCalled()
    })

    it('cleans up event listeners after drag ends', () => {
      const { container, unmount } = render(
        <ResizeHandle
          onResize={mockOnResize}
          onResizeEnd={mockOnResizeEnd}
        />
      )

      const handle = container.querySelector('.resize-handle')!

      // Start drag
      fireEvent.mouseDown(handle, { clientX: 100 })

      // End drag
      fireEvent.mouseUp(document)

      // Move mouse again (should not call onResize)
      mockOnResize.mockClear()
      fireEvent.mouseMove(document, { clientX: 200 })

      expect(mockOnResize).not.toHaveBeenCalled()

      unmount()
    })
  })

  // ============================================================
  // Disabled State Tests
  // ============================================================

  describe('Disabled State', () => {
    it('does not respond to mouse down when disabled', () => {
      const { container } = render(
        <ResizeHandle
          onResize={mockOnResize}
          onResizeEnd={mockOnResizeEnd}
          disabled={true}
        />
      )

      // Should not render, so no handle to interact with
      const handle = container.querySelector('.resize-handle')
      expect(handle).not.toBeInTheDocument()
    })

    it('does not respond to double-click when disabled', () => {
      render(
        <ResizeHandle
          onResize={mockOnResize}
          onResizeEnd={mockOnResizeEnd}
          onReset={mockOnReset}
          disabled={true}
        />
      )

      // No handle rendered, so nothing to double-click
      expect(mockOnReset).not.toHaveBeenCalled()
    })
  })

  // ============================================================
  // Cleanup Tests
  // ============================================================

  describe('Cleanup', () => {
    it('removes event listeners on unmount', () => {
      const { container, unmount } = render(
        <ResizeHandle
          onResize={mockOnResize}
          onResizeEnd={mockOnResizeEnd}
        />
      )

      const handle = container.querySelector('.resize-handle')!

      // Start drag
      fireEvent.mouseDown(handle, { clientX: 100 })

      // Unmount while dragging
      unmount()

      // Mouse move after unmount should not call onResize
      fireEvent.mouseMove(document, { clientX: 200 })

      // Only the initial drag start should have been registered
      expect(mockOnResize).toHaveBeenCalledTimes(0)
    })

    it('resets body styles on unmount', () => {
      const { container, unmount } = render(
        <ResizeHandle
          onResize={mockOnResize}
          onResizeEnd={mockOnResizeEnd}
        />
      )

      const handle = container.querySelector('.resize-handle')!

      // Start drag
      fireEvent.mouseDown(handle, { clientX: 100 })

      // Verify styles are set
      expect(document.body.style.cursor).toBe('col-resize')
      expect(document.body.style.userSelect).toBe('none')

      // Unmount
      unmount()

      // Styles should be reset
      expect(document.body.style.cursor).toBe('')
      expect(document.body.style.userSelect).toBe('')
    })
  })
})
