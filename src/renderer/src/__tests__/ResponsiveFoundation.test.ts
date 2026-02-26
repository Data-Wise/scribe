import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('Responsive Foundation - Increment 1', () => {
  describe('Tauri config: minimum window size', () => {
    const tauriConfig = JSON.parse(
      readFileSync(resolve(__dirname, '../../../../src-tauri/tauri.conf.json'), 'utf-8')
    )
    const mainWindow = tauriConfig.app.windows[0]

    it('sets minWidth to 350', () => {
      expect(mainWindow.minWidth).toBe(350)
    })

    it('sets minHeight to 350', () => {
      expect(mainWindow.minHeight).toBe(350)
    })

    it('has hiddenTitle enabled', () => {
      expect(mainWindow.hiddenTitle).toBe(true)
    })

    it('keeps titleBarStyle as Overlay', () => {
      expect(mainWindow.titleBarStyle).toBe('Overlay')
    })
  })

  describe('Tauri capabilities: window-state plugin', () => {
    const capabilities = JSON.parse(
      readFileSync(resolve(__dirname, '../../../../src-tauri/capabilities/default.json'), 'utf-8')
    )

    it('includes window-state:default permission', () => {
      expect(capabilities.permissions).toContain('window-state:default')
    })
  })

  describe('CSS transition infrastructure', () => {
    const css = readFileSync(resolve(__dirname, '../index.css'), 'utf-8')

    it('left sidebar (.mission-sidebar) has width transition', () => {
      // Match the transition declaration within the .mission-sidebar block
      const sidebarBlock = css.match(/\.mission-sidebar\s*\{[^}]+\}/)?.[0] ?? ''
      expect(sidebarBlock).toContain('transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1)')
    })

    it('right sidebar has width transition', () => {
      expect(css).toContain('[data-testid="right-sidebar"]')
      // Find the right sidebar transition rule
      const rightSidebarBlock = css.match(/\[data-testid="right-sidebar"\]\s*\{[^}]+\}/)?.[0] ?? ''
      expect(rightSidebarBlock).toContain('transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1)')
    })

    it('has .resizing class that disables transitions', () => {
      expect(css).toContain('.resizing')
      // The resizing rule should set transition: none
      const resizingBlock = css.match(/\.resizing[\s\S]*?\{[^}]*transition:\s*none\s*!important[^}]*\}/)?.[0] ?? ''
      expect(resizingBlock).toBeTruthy()
    })

    it('reduced-motion covers right sidebar', () => {
      // Find the reduced-motion block that includes right-sidebar
      const reducedMotionMatch = css.match(
        /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\[data-testid="right-sidebar"\][\s\S]*?\}/
      )
      expect(reducedMotionMatch).toBeTruthy()
    })
  })
})
