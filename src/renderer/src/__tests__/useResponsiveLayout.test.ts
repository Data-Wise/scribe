import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useResponsiveLayout } from '../hooks/useResponsiveLayout'

// Helper to fire resize events with a specific window width
function resizeWindow(width: number) {
  Object.defineProperty(window, 'innerWidth', { value: width, writable: true })
  window.dispatchEvent(new Event('resize'))
}

describe('useResponsiveLayout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Start with a wide window
    Object.defineProperty(window, 'innerWidth', { value: 1400, writable: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const defaultOptions = () => ({
    leftWidth: 240,
    rightWidth: 320,
    leftCollapsed: false,
    rightCollapsed: false,
    onCollapseLeft: vi.fn(),
    onCollapseRight: vi.fn(),
    onExpandLeft: vi.fn(),
    onExpandRight: vi.fn(),
  })

  it('collapses right sidebar first when editor space is too narrow', () => {
    const opts = defaultOptions()
    renderHook(() => useResponsiveLayout(opts))

    // Shrink window so editor < 500px: 900 - 240 - 320 = 340 < 500
    resizeWindow(900)
    act(() => { vi.advanceTimersByTime(200) })

    expect(opts.onCollapseRight).toHaveBeenCalled()
    expect(opts.onCollapseLeft).not.toHaveBeenCalled()
  })

  it('collapses left sidebar after right is already collapsed', () => {
    const opts = {
      ...defaultOptions(),
      rightCollapsed: true, // already collapsed
      rightWidth: 320,
    }
    renderHook(() => useResponsiveLayout(opts))

    // With right collapsed (48px): 700 - 240 - 48 = 412 < 500
    resizeWindow(700)
    act(() => { vi.advanceTimersByTime(200) })

    expect(opts.onCollapseLeft).toHaveBeenCalled()
  })

  it('does not collapse anything when editor has enough space', () => {
    const opts = defaultOptions()
    renderHook(() => useResponsiveLayout(opts))

    // 1200 - 240 - 320 = 640 > 500
    resizeWindow(1200)
    act(() => { vi.advanceTimersByTime(200) })

    expect(opts.onCollapseRight).not.toHaveBeenCalled()
    expect(opts.onCollapseLeft).not.toHaveBeenCalled()
  })

  it('re-expands auto-collapsed right sidebar when window grows', () => {
    const onCollapseRight = vi.fn()
    const onExpandRight = vi.fn()

    // Start with both sidebars expanded, wide window
    const initial = {
      ...defaultOptions(),
      onCollapseRight,
      onExpandRight,
    }

    const { rerender } = renderHook(
      (props) => useResponsiveLayout(props),
      { initialProps: initial }
    )

    // Step 1: Shrink window to trigger right sidebar auto-collapse
    resizeWindow(900) // 900 - 240 - 320 = 340 < 500
    act(() => { vi.advanceTimersByTime(200) })
    expect(onCollapseRight).toHaveBeenCalledTimes(1)

    // Step 2: Simulate state update — right is now collapsed
    rerender({ ...initial, rightCollapsed: true })

    // Step 3: Grow window back — should re-expand right
    resizeWindow(1400) // 1400 - 240 - 320 = 840 > 500
    act(() => { vi.advanceTimersByTime(200) })
    expect(onExpandRight).toHaveBeenCalledTimes(1)
  })

  it('respects user override — does not re-collapse after manual expand', () => {
    const opts = defaultOptions()
    const { rerender } = renderHook(
      (props) => useResponsiveLayout(props),
      { initialProps: opts }
    )

    // Step 1: auto-collapse right
    resizeWindow(900)
    act(() => { vi.advanceTimersByTime(200) })
    expect(opts.onCollapseRight).toHaveBeenCalledTimes(1)

    // Step 2: simulate state update — right is now collapsed
    const collapsed = { ...opts, rightCollapsed: true }
    rerender(collapsed)

    // Step 3: user manually re-expands right (simulated by rightCollapsed going false)
    const reexpanded = { ...opts, rightCollapsed: false }
    rerender(reexpanded)

    // Step 4: same narrow width, but should NOT collapse again (user override)
    opts.onCollapseRight.mockClear()
    resizeWindow(901) // trigger resize
    act(() => { vi.advanceTimersByTime(200) })

    expect(opts.onCollapseRight).not.toHaveBeenCalled()
  })

  it('debounces rapid resize events', () => {
    const opts = defaultOptions()
    renderHook(() => useResponsiveLayout(opts))

    // Fire many resize events rapidly
    resizeWindow(900)
    resizeWindow(850)
    resizeWindow(800)
    resizeWindow(750)

    // Before debounce fires, nothing should happen
    act(() => { vi.advanceTimersByTime(100) })
    expect(opts.onCollapseRight).not.toHaveBeenCalled()

    // After debounce, single call
    act(() => { vi.advanceTimersByTime(100) })
    expect(opts.onCollapseRight).toHaveBeenCalledTimes(1)
  })

  it('both sidebars collapsed fills editor space', () => {
    const opts = {
      ...defaultOptions(),
      leftCollapsed: true,
      rightCollapsed: true,
    }
    renderHook(() => useResponsiveLayout(opts))

    // With both collapsed (48 + 48 = 96), even 900px leaves 804px for editor
    resizeWindow(900)
    act(() => { vi.advanceTimersByTime(200) })

    expect(opts.onCollapseLeft).not.toHaveBeenCalled()
    expect(opts.onCollapseRight).not.toHaveBeenCalled()
  })

  it('handles starting at narrow width without errors', () => {
    Object.defineProperty(window, 'innerWidth', { value: 900, writable: true })
    const opts = defaultOptions()

    // Should not throw
    expect(() => {
      renderHook(() => useResponsiveLayout(opts))
    }).not.toThrow()
  })
})
