import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusDot, getStatusColor } from '../StatusDot'
import type { ProjectStatus } from '../../../types'

describe('StatusDot', () => {
  describe('rendering', () => {
    it('renders with default props', () => {
      render(<StatusDot />)
      const dot = screen.getByLabelText('Status: Active')
      expect(dot).toBeInTheDocument()
      expect(dot).toHaveAttribute('data-status', 'active')
    })

    it('renders with active status', () => {
      render(<StatusDot status="active" />)
      const dot = screen.getByLabelText('Status: Active')
      expect(dot).toBeInTheDocument()
      expect(dot).toHaveAttribute('data-status', 'active')
      // Check that the style attribute contains the CSS variable
      const style = dot.getAttribute('style')
      expect(style).toContain('background-color: var(--status-active)')
    })

    it('renders with planning status', () => {
      render(<StatusDot status="planning" />)
      const dot = screen.getByLabelText('Status: Planning')
      expect(dot).toBeInTheDocument()
      expect(dot).toHaveAttribute('data-status', 'planning')
      const style = dot.getAttribute('style')
      expect(style).toContain('background-color: var(--status-planning)')
    })

    it('renders with complete status', () => {
      render(<StatusDot status="complete" />)
      const dot = screen.getByLabelText('Status: Complete')
      expect(dot).toBeInTheDocument()
      expect(dot).toHaveAttribute('data-status', 'complete')
      const style = dot.getAttribute('style')
      expect(style).toContain('background-color: var(--status-complete)')
    })

    it('renders with archive status', () => {
      render(<StatusDot status="archive" />)
      const dot = screen.getByLabelText('Status: Archive')
      expect(dot).toBeInTheDocument()
      expect(dot).toHaveAttribute('data-status', 'archive')
      const style = dot.getAttribute('style')
      expect(style).toContain('background-color: var(--status-archive)')
    })
  })

  describe('size variants', () => {
    it('renders small size', () => {
      render(<StatusDot size="sm" />)
      const dot = screen.getByLabelText('Status: Active')
      expect(dot).toHaveClass('w-2', 'h-2')
    })

    it('renders medium size (default)', () => {
      render(<StatusDot size="md" />)
      const dot = screen.getByLabelText('Status: Active')
      expect(dot).toHaveClass('w-3', 'h-3')
    })

    it('renders large size', () => {
      render(<StatusDot size="lg" />)
      const dot = screen.getByLabelText('Status: Active')
      expect(dot).toHaveClass('w-4', 'h-4')
    })

    it('uses medium size by default', () => {
      render(<StatusDot />)
      const dot = screen.getByLabelText('Status: Active')
      expect(dot).toHaveClass('w-3', 'h-3')
    })
  })

  describe('styling', () => {
    it('has rounded-full class for circular shape', () => {
      render(<StatusDot />)
      const dot = screen.getByLabelText('Status: Active')
      expect(dot).toHaveClass('rounded-full')
    })

    it('has transition for smooth color changes', () => {
      render(<StatusDot />)
      const dot = screen.getByLabelText('Status: Active')
      expect(dot).toHaveClass('transition-colors', 'duration-150')
    })

    it('applies custom className', () => {
      render(<StatusDot className="custom-class" />)
      const dot = screen.getByLabelText('Status: Active')
      expect(dot).toHaveClass('custom-class')
    })

    it('maintains base classes when custom className is provided', () => {
      render(<StatusDot className="custom-class" />)
      const dot = screen.getByLabelText('Status: Active')
      expect(dot).toHaveClass('inline-block', 'rounded-full', 'custom-class')
    })
  })

  describe('accessibility', () => {
    it('has aria-label for active status', () => {
      render(<StatusDot status="active" />)
      expect(screen.getByLabelText('Status: Active')).toBeInTheDocument()
    })

    it('has aria-label for planning status', () => {
      render(<StatusDot status="planning" />)
      expect(screen.getByLabelText('Status: Planning')).toBeInTheDocument()
    })

    it('has aria-label for complete status', () => {
      render(<StatusDot status="complete" />)
      expect(screen.getByLabelText('Status: Complete')).toBeInTheDocument()
    })

    it('has aria-label for archive status', () => {
      render(<StatusDot status="archive" />)
      expect(screen.getByLabelText('Status: Archive')).toBeInTheDocument()
    })

    it('has title attribute for tooltip', () => {
      render(<StatusDot status="active" />)
      const dot = screen.getByLabelText('Status: Active')
      expect(dot).toHaveAttribute('title', 'Active')
    })
  })

  describe('theme awareness', () => {
    it('uses CSS variables that adapt to theme', () => {
      const statuses: ProjectStatus[] = ['active', 'planning', 'complete', 'archive']

      statuses.forEach((status) => {
        const { container } = render(<StatusDot status={status} />)
        const dot = container.querySelector(`[data-status="${status}"]`)
        expect(dot).toBeInTheDocument()

        // Check that it uses CSS variable (will be resolved by browser)
        const style = dot?.getAttribute('style')
        expect(style).toContain(`var(--status-${status})`)
      })
    })
  })

  describe('fallback behavior', () => {
    it('falls back to active status for invalid status', () => {
      // TypeScript won't allow invalid status, but test runtime fallback
      render(<StatusDot status={'invalid' as ProjectStatus} />)
      const dot = screen.getByLabelText('Status: Active')
      expect(dot).toBeInTheDocument()
      const style = dot.getAttribute('style')
      expect(style).toContain('background-color: var(--status-active)')
    })
  })
})

describe('getStatusColor', () => {
  it('returns correct CSS variable for active status', () => {
    expect(getStatusColor('active')).toBe('var(--status-active)')
  })

  it('returns correct CSS variable for planning status', () => {
    expect(getStatusColor('planning')).toBe('var(--status-planning)')
  })

  it('returns correct CSS variable for complete status', () => {
    expect(getStatusColor('complete')).toBe('var(--status-complete)')
  })

  it('returns correct CSS variable for archive status', () => {
    expect(getStatusColor('archive')).toBe('var(--status-archive)')
  })

  it('falls back to active for invalid status', () => {
    expect(getStatusColor('invalid' as ProjectStatus)).toBe('var(--status-active)')
  })
})
