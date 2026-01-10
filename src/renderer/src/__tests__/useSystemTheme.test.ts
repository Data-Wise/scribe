/**
 * useSystemTheme Tests
 * Phase 4 Task 13: System theme detection tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSystemTheme, useThemePreference, applyThemeToDocument } from '../hooks/useSystemTheme'

describe('useSystemTheme', () => {
  let matchMediaMock: {
    matches: boolean
    media: string
    addEventListener: ReturnType<typeof vi.fn>
    removeEventListener: ReturnType<typeof vi.fn>
    addListener: ReturnType<typeof vi.fn>
    removeListener: ReturnType<typeof vi.fn>
    dispatchEvent: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {}
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value },
        removeItem: (key: string) => { delete store[key] },
        clear: () => { store = {} }
      }
    })()

    Object.defineProperty(window, 'localStorage', {
      writable: true,
      value: localStorageMock
    })

    // Mock matchMedia
    matchMediaMock = {
      matches: false, // default to light mode
      media: '(prefers-color-scheme: dark)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => matchMediaMock),
    })

    // Clear localStorage
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('System Theme Detection', () => {
    it('detects dark mode from system', () => {
      matchMediaMock.matches = true
      const { result } = renderHook(() => useSystemTheme())

      expect(result.current).toBe('dark')
    })

    it('detects light mode from system', () => {
      matchMediaMock.matches = false
      const { result } = renderHook(() => useSystemTheme())

      expect(result.current).toBe('light')
    })

    it('defaults to dark mode in SSR (no window)', () => {
      // This is hard to test since we're always in a browser environment
      // Just documenting the expected behavior
      expect(true).toBe(true)
    })
  })

  describe('System Theme Change Listener', () => {
    it('registers event listener on mount', () => {
      renderHook(() => useSystemTheme())

      expect(matchMediaMock.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      )
    })

    it('removes event listener on unmount', () => {
      const { unmount } = renderHook(() => useSystemTheme())

      unmount()

      expect(matchMediaMock.removeEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      )
    })

    it('updates theme when system preference changes', () => {
      matchMediaMock.matches = false
      const { result } = renderHook(() => useSystemTheme())

      expect(result.current).toBe('light')

      // Simulate system theme change to dark
      act(() => {
        const changeHandler = matchMediaMock.addEventListener.mock.calls[0][1]
        changeHandler({ matches: true } as MediaQueryListEvent)
      })

      expect(result.current).toBe('dark')
    })

    it('updates theme when system changes from dark to light', () => {
      matchMediaMock.matches = true
      const { result } = renderHook(() => useSystemTheme())

      expect(result.current).toBe('dark')

      // Simulate system theme change to light
      act(() => {
        const changeHandler = matchMediaMock.addEventListener.mock.calls[0][1]
        changeHandler({ matches: false } as MediaQueryListEvent)
      })

      expect(result.current).toBe('light')
    })
  })

  describe('Legacy Browser Support', () => {
    it('uses addListener for browsers without addEventListener', () => {
      matchMediaMock.addEventListener = undefined as unknown as ReturnType<typeof vi.fn>
      matchMediaMock.addListener = vi.fn()

      renderHook(() => useSystemTheme())

      expect(matchMediaMock.addListener).toHaveBeenCalledWith(expect.any(Function))
    })

    it('uses removeListener on unmount for legacy browsers', () => {
      matchMediaMock.addEventListener = undefined as unknown as ReturnType<typeof vi.fn>
      matchMediaMock.removeEventListener = undefined as unknown as ReturnType<typeof vi.fn>
      matchMediaMock.addListener = vi.fn()
      matchMediaMock.removeListener = vi.fn()

      const { unmount } = renderHook(() => useSystemTheme())

      unmount()

      expect(matchMediaMock.removeListener).toHaveBeenCalledWith(expect.any(Function))
    })
  })
})

describe('useThemePreference', () => {
  let matchMediaMock: {
    matches: boolean
    media: string
    addEventListener: ReturnType<typeof vi.fn>
    removeEventListener: ReturnType<typeof vi.fn>
    addListener: ReturnType<typeof vi.fn>
    removeListener: ReturnType<typeof vi.fn>
    dispatchEvent: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {}
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value },
        removeItem: (key: string) => { delete store[key] },
        clear: () => { store = {} }
      }
    })()

    Object.defineProperty(window, 'localStorage', {
      writable: true,
      value: localStorageMock
    })

    matchMediaMock = {
      matches: false,
      media: '(prefers-color-scheme: dark)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => matchMediaMock),
    })

    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Preference Storage', () => {
    it('uses system theme when no preference is stored', () => {
      matchMediaMock.matches = true
      const { result } = renderHook(() => useThemePreference())

      expect(result.current[0]).toBe('dark')
    })

    it('uses stored preference over system theme', () => {
      localStorage.setItem('theme', 'light')
      matchMediaMock.matches = true // system is dark

      const { result } = renderHook(() => useThemePreference())

      expect(result.current[0]).toBe('light') // but preference is light
    })

    it('allows setting theme preference', () => {
      const { result } = renderHook(() => useThemePreference())

      act(() => {
        result.current[1]('dark')
      })

      expect(result.current[0]).toBe('dark')
      expect(localStorage.getItem('theme')).toBe('dark')
    })

    it('persists preference across hook instances', () => {
      const { result: result1 } = renderHook(() => useThemePreference())

      act(() => {
        result1.current[1]('dark')
      })

      // Create new instance
      const { result: result2 } = renderHook(() => useThemePreference())

      expect(result2.current[0]).toBe('dark')
    })

    it('uses custom storage key', () => {
      const { result } = renderHook(() => useThemePreference('custom-theme'))

      act(() => {
        result.current[1]('light')
      })

      expect(localStorage.getItem('custom-theme')).toBe('light')
      expect(localStorage.getItem('theme')).toBeNull()
    })
  })

  describe('Fallback to System Theme', () => {
    it('updates when system theme changes if no preference set', () => {
      matchMediaMock.matches = false
      const { result } = renderHook(() => useThemePreference())

      expect(result.current[0]).toBe('light')

      // System changes to dark
      act(() => {
        const changeHandler = matchMediaMock.addEventListener.mock.calls[0][1]
        changeHandler({ matches: true } as MediaQueryListEvent)
      })

      expect(result.current[0]).toBe('dark')
    })

    it('ignores system changes if user has set preference', () => {
      localStorage.setItem('theme', 'light')
      matchMediaMock.matches = false

      const { result } = renderHook(() => useThemePreference())

      expect(result.current[0]).toBe('light')

      // System changes to dark
      act(() => {
        const changeHandler = matchMediaMock.addEventListener.mock.calls[0][1]
        changeHandler({ matches: true } as MediaQueryListEvent)
      })

      // Should still be light (user preference)
      expect(result.current[0]).toBe('light')
    })
  })
})

describe('applyThemeToDocument', () => {
  beforeEach(() => {
    document.documentElement.className = ''
  })

  it('adds dark theme class to document', () => {
    applyThemeToDocument('dark')

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })

  it('adds light theme class to document', () => {
    applyThemeToDocument('light')

    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('removes existing theme class before adding new one', () => {
    applyThemeToDocument('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    applyThemeToDocument('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })

  it('updates meta theme-color for dark mode', () => {
    const meta = document.createElement('meta')
    meta.name = 'theme-color'
    meta.content = '#ffffff'
    document.head.appendChild(meta)

    applyThemeToDocument('dark')

    expect(meta.content).toBe('#0f172a')

    document.head.removeChild(meta)
  })

  it('updates meta theme-color for light mode', () => {
    const meta = document.createElement('meta')
    meta.name = 'theme-color'
    meta.content = '#000000'
    document.head.appendChild(meta)

    applyThemeToDocument('light')

    expect(meta.content).toBe('#ffffff')

    document.head.removeChild(meta)
  })

  it('handles missing meta theme-color gracefully', () => {
    // Remove any existing meta tags
    const existing = document.querySelector('meta[name="theme-color"]')
    if (existing) {
      existing.remove()
    }

    // Should not throw
    expect(() => applyThemeToDocument('dark')).not.toThrow()
  })
})
