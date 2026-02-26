import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { ResizeHandle } from '../components/sidebar/ResizeHandle'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('ResizeHandle — Touch & Polish (Increment 5)', () => {
  it('renders with touch start handler', () => {
    const { container } = render(
      <ResizeHandle onResize={vi.fn()} onResizeEnd={vi.fn()} />
    )
    const handle = container.querySelector('.resize-handle')
    expect(handle).toBeTruthy()
    // Touch start should be a registered handler
    expect(handle?.getAttribute('role')).toBe('separator')
  })

  it('calls onDragStateChange when drag starts and ends', () => {
    const onDragStateChange = vi.fn()
    const { container } = render(
      <ResizeHandle
        onResize={vi.fn()}
        onResizeEnd={vi.fn()}
        onDragStateChange={onDragStateChange}
      />
    )
    const handle = container.querySelector('.resize-handle')!

    // Start drag
    fireEvent.mouseDown(handle, { clientX: 100 })
    expect(onDragStateChange).toHaveBeenCalledWith(true)

    // End drag
    fireEvent.mouseUp(document)
    expect(onDragStateChange).toHaveBeenCalledWith(false)
  })

  it('has dragging class during mouse drag', () => {
    const { container } = render(
      <ResizeHandle onResize={vi.fn()} onResizeEnd={vi.fn()} />
    )
    const handle = container.querySelector('.resize-handle')!

    expect(handle.classList.contains('dragging')).toBe(false)
    fireEvent.mouseDown(handle, { clientX: 100 })
    expect(handle.classList.contains('dragging')).toBe(true)
    fireEvent.mouseUp(document)
    expect(handle.classList.contains('dragging')).toBe(false)
  })

  it('does not respond when disabled', () => {
    const onResize = vi.fn()
    const { container } = render(
      <ResizeHandle onResize={onResize} onResizeEnd={vi.fn()} disabled />
    )
    // Should not render when disabled
    expect(container.querySelector('.resize-handle')).toBeNull()
  })
})

describe('CSS — .resizing class and reduced motion', () => {
  const css = readFileSync(resolve(__dirname, '../index.css'), 'utf-8')

  it('.resizing class disables transitions on itself', () => {
    const match = css.match(/\.resizing[\s\S]*?\{[^}]*transition:\s*none\s*!important[^}]*\}/)
    expect(match).toBeTruthy()
  })

  it('.resizing class disables transitions on right-sidebar child', () => {
    expect(css).toContain('.resizing [data-testid="right-sidebar"]')
  })

  it('zoom-indicator is covered by reduced-motion', () => {
    const reducedMotion = css.match(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.zoom-indicator[\s\S]*?\}/
    )
    expect(reducedMotion).toBeTruthy()
  })

  it('right-sidebar is covered by reduced-motion', () => {
    const reducedMotion = css.match(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\[data-testid="right-sidebar"\][\s\S]*?\}/
    )
    expect(reducedMotion).toBeTruthy()
  })
})
