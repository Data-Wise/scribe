import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePreferences } from '../hooks/usePreferences'

// Mock localStorage
const store: Record<string, string> = {}
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value }),
  removeItem: vi.fn((key: string) => { delete store[key] }),
  clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]) }),
  length: 0,
  key: vi.fn(() => null),
}

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('usePreferences', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('reads preferences on mount', () => {
    const { result } = renderHook(() => usePreferences())
    expect(result.current.prefs).toBeDefined()
    expect(result.current.prefs.defaultWordGoal).toBe(500)
  })

  it('returns cached snapshot without re-reading localStorage', () => {
    const { result } = renderHook(() => usePreferences())
    // Access prefs twice — getItem should only have been called during mount
    const callsBefore = localStorageMock.getItem.mock.calls.length
    void result.current.prefs.editorMode
    void result.current.prefs.focusModeEnabled
    expect(localStorageMock.getItem.mock.calls.length).toBe(callsBefore)
  })

  it('updatePref writes to localStorage and syncs state', () => {
    const { result } = renderHook(() => usePreferences())

    act(() => {
      result.current.updatePref('defaultWordGoal', 1000)
    })

    expect(result.current.prefs.defaultWordGoal).toBe(1000)
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  it('togglePref flips boolean preferences', () => {
    const { result } = renderHook(() => usePreferences())
    const before = result.current.prefs.streakDisplayOptIn

    act(() => {
      result.current.togglePref('streakDisplayOptIn')
    })

    expect(result.current.prefs.streakDisplayOptIn).toBe(!before)
  })

  it('togglePref ignores non-boolean preferences', () => {
    const { result } = renderHook(() => usePreferences())

    act(() => {
      result.current.togglePref('defaultWordGoal')
    })

    // Should remain unchanged
    expect(result.current.prefs.defaultWordGoal).toBe(500)
  })

  it('syncs when preferences-changed event is dispatched externally', () => {
    const { result } = renderHook(() => usePreferences())

    // Simulate external write
    act(() => {
      store['scribe-preferences'] = JSON.stringify({
        ...result.current.prefs,
        celebrateMilestones: false,
      })
      window.dispatchEvent(new CustomEvent('preferences-changed'))
    })

    expect(result.current.prefs.celebrateMilestones).toBe(false)
  })

  it('cleans up event listener on unmount', () => {
    const spy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => usePreferences())

    unmount()

    expect(spy).toHaveBeenCalledWith('preferences-changed', expect.any(Function))
    spy.mockRestore()
  })
})
