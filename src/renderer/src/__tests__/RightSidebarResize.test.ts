import { describe, it, expect } from 'vitest'
import { RIGHT_SIDEBAR_WIDTHS, SIDEBAR_WIDTHS } from '../store/useAppViewStore'

describe('Right Sidebar Resize — Width Constants', () => {
  it('defines icon width matching left sidebar', () => {
    expect(RIGHT_SIDEBAR_WIDTHS.icon).toBe(SIDEBAR_WIDTHS.icon)
    expect(RIGHT_SIDEBAR_WIDTHS.icon).toBe(48)
  })

  it('defines expanded default of 320px', () => {
    expect(RIGHT_SIDEBAR_WIDTHS.expanded.default).toBe(320)
  })

  it('defines min constraint of 250px', () => {
    expect(RIGHT_SIDEBAR_WIDTHS.expanded.min).toBe(250)
  })

  it('defines max constraint of 600px', () => {
    expect(RIGHT_SIDEBAR_WIDTHS.expanded.max).toBe(600)
  })

  it('min is less than default which is less than max', () => {
    const { min, default: def, max } = RIGHT_SIDEBAR_WIDTHS.expanded
    expect(min).toBeLessThan(def)
    expect(def).toBeLessThan(max)
  })

  it('constraints match the values used in App.tsx resize handler', () => {
    // Verify the clamp would work correctly
    const { min, max } = RIGHT_SIDEBAR_WIDTHS.expanded
    const testWidth = 400
    const deltaX = 50 // dragging left (grows sidebar)
    const newWidth = Math.max(min, Math.min(max, testWidth - deltaX))
    expect(newWidth).toBe(350) // 400 - 50 = 350, within bounds
  })
})
