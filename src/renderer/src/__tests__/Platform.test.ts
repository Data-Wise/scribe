import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// We need to test the platform module which checks for window.__TAURI__
describe('Platform Detection', () => {
  beforeEach(() => {
    // Reset module cache before each test
    vi.resetModules()
    // Clean up Tauri markers
    delete (global.window as any).__TAURI__
    delete (global.window as any).__TAURI_INTERNALS__
  })

  afterEach(() => {
    // Clean up Tauri markers
    delete (global.window as any).__TAURI__
    delete (global.window as any).__TAURI_INTERNALS__
  })

  describe('isTauri', () => {
    it('returns true when __TAURI__ is present', async () => {
      ;(global.window as any).__TAURI__ = {}
      const { isTauri } = await import('../lib/platform')
      expect(isTauri()).toBe(true)
    })

    it('returns true when __TAURI_INTERNALS__ is present', async () => {
      ;(global.window as any).__TAURI_INTERNALS__ = {}
      const { isTauri } = await import('../lib/platform')
      expect(isTauri()).toBe(true)
    })

    it('returns false when neither Tauri marker is present', async () => {
      delete (global.window as any).__TAURI__
      delete (global.window as any).__TAURI_INTERNALS__
      const { isTauri } = await import('../lib/platform')
      expect(isTauri()).toBe(false)
    })
  })

  describe('isBrowser', () => {
    it('returns false when in Tauri mode', async () => {
      ;(global.window as any).__TAURI__ = {}
      const { isBrowser } = await import('../lib/platform')
      expect(isBrowser()).toBe(false)
    })

    it('returns true when not in Tauri mode', async () => {
      delete (global.window as any).__TAURI__
      delete (global.window as any).__TAURI_INTERNALS__
      const { isBrowser } = await import('../lib/platform')
      expect(isBrowser()).toBe(true)
    })
  })
})
