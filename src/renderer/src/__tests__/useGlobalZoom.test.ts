import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGlobalZoom } from '../hooks/useGlobalZoom'

describe('useGlobalZoom', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.style.fontSize = ''
  })

  afterEach(() => {
    document.documentElement.style.fontSize = ''
    localStorage.clear()
  })

  it('initializes at 1.0 (100%) by default', () => {
    const { result } = renderHook(() => useGlobalZoom())
    expect(result.current.zoomLevel).toBe(1.0)
  })

  it('zoomIn increments by 0.1', () => {
    const { result } = renderHook(() => useGlobalZoom())
    act(() => result.current.zoomIn())
    expect(result.current.zoomLevel).toBe(1.1)
  })

  it('zoomOut decrements by 0.1', () => {
    const { result } = renderHook(() => useGlobalZoom())
    act(() => result.current.zoomOut())
    expect(result.current.zoomLevel).toBe(0.9)
  })

  it('resetZoom returns to 1.0', () => {
    const { result } = renderHook(() => useGlobalZoom())
    act(() => result.current.zoomIn())
    act(() => result.current.zoomIn())
    expect(result.current.zoomLevel).toBe(1.2)
    act(() => result.current.resetZoom())
    expect(result.current.zoomLevel).toBe(1.0)
  })

  it('clamps at maximum 2.0', () => {
    const { result } = renderHook(() => useGlobalZoom())
    // Zoom in many times
    for (let i = 0; i < 15; i++) {
      act(() => result.current.zoomIn())
    }
    expect(result.current.zoomLevel).toBe(2.0)
  })

  it('clamps at minimum 0.5', () => {
    const { result } = renderHook(() => useGlobalZoom())
    // Zoom out many times
    for (let i = 0; i < 15; i++) {
      act(() => result.current.zoomOut())
    }
    expect(result.current.zoomLevel).toBe(0.5)
  })

  it('persists zoom level to localStorage', () => {
    const { result } = renderHook(() => useGlobalZoom())
    act(() => result.current.zoomIn())
    expect(localStorage.getItem('scribe:zoomLevel')).toBe('1.1')
  })

  it('restores zoom level from localStorage', () => {
    localStorage.setItem('scribe:zoomLevel', '1.5')
    const { result } = renderHook(() => useGlobalZoom())
    expect(result.current.zoomLevel).toBe(1.5)
  })

  it('applies zoom via document.documentElement.style.fontSize', () => {
    const { result } = renderHook(() => useGlobalZoom())
    act(() => result.current.zoomIn())
    // Happy-dom may normalize percentage values differently
    const fontSize = document.documentElement.style.fontSize
    expect(fontSize).toContain('110')
  })

  it('responds to ⌘= keyboard shortcut', () => {
    const { result } = renderHook(() => useGlobalZoom())
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', {
        key: '=',
        metaKey: true,
        bubbles: true,
      }))
    })
    expect(result.current.zoomLevel).toBe(1.1)
  })

  it('responds to ⌘- keyboard shortcut', () => {
    const { result } = renderHook(() => useGlobalZoom())
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', {
        key: '-',
        metaKey: true,
        bubbles: true,
      }))
    })
    expect(result.current.zoomLevel).toBe(0.9)
  })
})
