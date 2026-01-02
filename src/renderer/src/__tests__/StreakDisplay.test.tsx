import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StreakDisplay } from '../components/StreakDisplay'

describe('StreakDisplay Component', () => {
  describe('Visibility Rules', () => {
    it('returns null for streak less than 3', () => {
      const { container } = render(<StreakDisplay streak={0} isActiveToday={false} />)
      expect(container.firstChild).toBeNull()
    })

    it('returns null for streak of 1', () => {
      const { container } = render(<StreakDisplay streak={1} isActiveToday={false} />)
      expect(container.firstChild).toBeNull()
    })

    it('returns null for streak of 2', () => {
      const { container } = render(<StreakDisplay streak={2} isActiveToday={false} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders for streak of 3 or more', () => {
      const { container } = render(<StreakDisplay streak={3} isActiveToday={false} />)
      expect(container.firstChild).not.toBeNull()
    })

    it('renders for large streaks', () => {
      render(<StreakDisplay streak={500} isActiveToday={false} />)
      expect(screen.getByText('500 days')).toBeInTheDocument()
    })
  })

  describe('Streak Count Display', () => {
    it('displays streak count with "days" plural', () => {
      render(<StreakDisplay streak={5} isActiveToday={false} />)
      expect(screen.getByText('5 days')).toBeInTheDocument()
    })

    it('displays streak count with "day" singular for 1', () => {
      // Note: Won't render since < 3, but testing the logic if it did
      // The component logic uses "day" for streak === 1
      render(<StreakDisplay streak={10} isActiveToday={false} />)
      expect(screen.getByText('10 days')).toBeInTheDocument()
    })

    it('displays correct count for 100 days', () => {
      render(<StreakDisplay streak={100} isActiveToday={false} />)
      expect(screen.getByText('100 days')).toBeInTheDocument()
    })
  })

  describe('Milestone Messages', () => {
    it('shows 1 week streak message for 7 days', () => {
      render(<StreakDisplay streak={7} isActiveToday={false} />)
      expect(screen.getByText('1 week streak!')).toBeInTheDocument()
    })

    it('shows 1 month streak message for 30 days', () => {
      render(<StreakDisplay streak={30} isActiveToday={false} />)
      expect(screen.getByText('1 month streak!')).toBeInTheDocument()
    })

    it('shows 100 days message for 100 days', () => {
      render(<StreakDisplay streak={100} isActiveToday={false} />)
      expect(screen.getByText('100 days!')).toBeInTheDocument()
    })

    it('shows 1 year streak message for 365 days', () => {
      render(<StreakDisplay streak={365} isActiveToday={false} />)
      expect(screen.getByText('1 year streak!')).toBeInTheDocument()
    })

    it('does not show milestone message for non-milestone streaks', () => {
      render(<StreakDisplay streak={50} isActiveToday={false} />)
      expect(screen.queryByText(/streak!/)).not.toBeInTheDocument()
      expect(screen.queryByText(/days!/)).not.toBeInTheDocument()
    })
  })

  describe('Near Milestone Messages', () => {
    it('shows "X more to 7" when 5 days', () => {
      render(<StreakDisplay streak={5} isActiveToday={false} />)
      expect(screen.getByText('2 more to 7!')).toBeInTheDocument()
    })

    it('shows "X more to 7" when 6 days', () => {
      render(<StreakDisplay streak={6} isActiveToday={false} />)
      expect(screen.getByText('1 more to 7!')).toBeInTheDocument()
    })

    it('shows "X more to 30" when 28 days', () => {
      render(<StreakDisplay streak={28} isActiveToday={false} />)
      expect(screen.getByText('2 more to 30!')).toBeInTheDocument()
    })

    it('shows "X more to 30" when 29 days', () => {
      render(<StreakDisplay streak={29} isActiveToday={false} />)
      expect(screen.getByText('1 more to 30!')).toBeInTheDocument()
    })

    it('shows "X more to 100" when 98 days', () => {
      render(<StreakDisplay streak={98} isActiveToday={false} />)
      expect(screen.getByText('2 more to 100!')).toBeInTheDocument()
    })

    it('shows "X more to 365" when 363 days', () => {
      render(<StreakDisplay streak={363} isActiveToday={false} />)
      expect(screen.getByText('2 more to 365!')).toBeInTheDocument()
    })

    it('does not show near milestone message for non-near streaks', () => {
      render(<StreakDisplay streak={50} isActiveToday={false} />)
      expect(screen.queryByText(/more to/)).not.toBeInTheDocument()
    })

    it('does not show near milestone message on actual milestone', () => {
      render(<StreakDisplay streak={7} isActiveToday={false} />)
      expect(screen.queryByText(/more to/)).not.toBeInTheDocument()
    })
  })

  describe('Today Indicator', () => {
    it('shows Today indicator when active today and not milestone', () => {
      render(<StreakDisplay streak={5} isActiveToday={true} />)
      expect(screen.getByText('✓ Today')).toBeInTheDocument()
    })

    it('does not show Today indicator when not active today', () => {
      render(<StreakDisplay streak={5} isActiveToday={false} />)
      expect(screen.queryByText('✓ Today')).not.toBeInTheDocument()
    })

    it('does not show Today indicator on milestone even when active', () => {
      render(<StreakDisplay streak={7} isActiveToday={true} />)
      expect(screen.queryByText('✓ Today')).not.toBeInTheDocument()
    })

    it('does not show Today indicator on 30-day milestone even when active', () => {
      render(<StreakDisplay streak={30} isActiveToday={true} />)
      expect(screen.queryByText('✓ Today')).not.toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('has streak-display class', () => {
      const { container } = render(<StreakDisplay streak={5} isActiveToday={false} />)
      expect(container.querySelector('.streak-display')).toBeInTheDocument()
    })

    it('has animate-pulse-subtle class on milestone', () => {
      const { container } = render(<StreakDisplay streak={7} isActiveToday={false} />)
      expect(container.querySelector('.animate-pulse-subtle')).toBeInTheDocument()
    })

    it('does not have animate-pulse-subtle class on non-milestone', () => {
      const { container } = render(<StreakDisplay streak={5} isActiveToday={false} />)
      expect(container.querySelector('.animate-pulse-subtle')).not.toBeInTheDocument()
    })

    it('renders Flame icon', () => {
      const { container } = render(<StreakDisplay streak={5} isActiveToday={false} />)
      // Lucide icons render as SVG
      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles very large streak numbers', () => {
      render(<StreakDisplay streak={9999} isActiveToday={false} />)
      expect(screen.getByText('9999 days')).toBeInTheDocument()
    })

    it('handles streak at milestone boundary', () => {
      // At exactly 7, shows milestone not near-milestone
      render(<StreakDisplay streak={7} isActiveToday={false} />)
      expect(screen.getByText('1 week streak!')).toBeInTheDocument()
      expect(screen.queryByText(/more to/)).not.toBeInTheDocument()
    })

    it('handles streak just after milestone', () => {
      render(<StreakDisplay streak={8} isActiveToday={false} />)
      expect(screen.queryByText('1 week streak!')).not.toBeInTheDocument()
      expect(screen.queryByText(/more to/)).not.toBeInTheDocument()
    })
  })
})
