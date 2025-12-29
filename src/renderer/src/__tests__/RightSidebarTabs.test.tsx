import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RightSidebarTabs, RIGHT_SIDEBAR_TAB_ORDER } from '../components/RightSidebarTabs'

describe('RightSidebarTabs', () => {
  const defaultProps = {
    activeTab: 'properties' as const,
    onTabChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders all four tabs', () => {
      render(<RightSidebarTabs {...defaultProps} />)

      expect(screen.getByRole('tab', { name: /properties/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /backlinks/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /tags/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /ai/i })).toBeInTheDocument()
    })

    it('marks active tab as selected', () => {
      render(<RightSidebarTabs {...defaultProps} activeTab="backlinks" />)

      const backlinksTab = screen.getByRole('tab', { name: /backlinks/i })
      expect(backlinksTab).toHaveAttribute('aria-selected', 'true')
      expect(backlinksTab).toHaveClass('active')
    })

    it('marks non-active tabs as not selected', () => {
      render(<RightSidebarTabs {...defaultProps} activeTab="properties" />)

      const tagsTab = screen.getByRole('tab', { name: /tags/i })
      expect(tagsTab).toHaveAttribute('aria-selected', 'false')
      expect(tagsTab).not.toHaveClass('active')
    })

    it('has proper ARIA tablist role', () => {
      render(<RightSidebarTabs {...defaultProps} />)

      expect(screen.getByRole('tablist', { name: /right sidebar tabs/i })).toBeInTheDocument()
    })
  })

  describe('Tab Switching', () => {
    it('calls onTabChange when clicking a tab', () => {
      const onTabChange = vi.fn()
      render(<RightSidebarTabs {...defaultProps} onTabChange={onTabChange} />)

      fireEvent.click(screen.getByRole('tab', { name: /backlinks/i }))
      expect(onTabChange).toHaveBeenCalledWith('backlinks')
    })

    it('calls onTabChange with correct tab id for each tab', () => {
      const onTabChange = vi.fn()
      render(<RightSidebarTabs {...defaultProps} onTabChange={onTabChange} />)

      fireEvent.click(screen.getByRole('tab', { name: /properties/i }))
      expect(onTabChange).toHaveBeenCalledWith('properties')

      fireEvent.click(screen.getByRole('tab', { name: /tags/i }))
      expect(onTabChange).toHaveBeenCalledWith('tags')

      fireEvent.click(screen.getByRole('tab', { name: /ai/i }))
      expect(onTabChange).toHaveBeenCalledWith('ai')
    })
  })

  describe('Badge Counts', () => {
    it('shows properties count when > 0', () => {
      render(<RightSidebarTabs {...defaultProps} propertiesCount={5} />)

      const badge = screen.getByText('5')
      expect(badge).toHaveClass('tab-badge')
    })

    it('shows backlinks count when > 0', () => {
      render(<RightSidebarTabs {...defaultProps} backlinksCount={12} />)

      expect(screen.getByText('12')).toHaveClass('tab-badge')
    })

    it('shows tags count when > 0', () => {
      render(<RightSidebarTabs {...defaultProps} tagsCount={3} />)

      expect(screen.getByText('3')).toHaveClass('tab-badge')
    })

    it('does not show badge when count is 0', () => {
      render(<RightSidebarTabs {...defaultProps} propertiesCount={0} />)

      // Properties tab should exist but no '0' badge
      expect(screen.getByRole('tab', { name: /properties/i })).toBeInTheDocument()
      expect(screen.queryByText('0')).not.toBeInTheDocument()
    })

    it('does not show badge when count is undefined', () => {
      render(<RightSidebarTabs {...defaultProps} />)

      // No badges should be visible
      const badges = document.querySelectorAll('.tab-badge')
      expect(badges.length).toBe(0)
    })

    it('shows multiple badges simultaneously', () => {
      render(
        <RightSidebarTabs
          {...defaultProps}
          propertiesCount={4}
          backlinksCount={7}
          tagsCount={2}
        />
      )

      expect(screen.getByText('4')).toBeInTheDocument()
      expect(screen.getByText('7')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  describe('Menu Content', () => {
    it('renders menu content when provided', () => {
      const menuContent = <button data-testid="menu-button">Menu</button>
      render(<RightSidebarTabs {...defaultProps} menuContent={menuContent} />)

      expect(screen.getByTestId('menu-button')).toBeInTheDocument()
    })

    it('does not render menu content when not provided', () => {
      render(<RightSidebarTabs {...defaultProps} />)

      expect(screen.queryByTestId('menu-button')).not.toBeInTheDocument()
    })
  })

  describe('Tab Order Export', () => {
    it('exports correct tab order for keyboard shortcuts', () => {
      expect(RIGHT_SIDEBAR_TAB_ORDER).toEqual(['properties', 'backlinks', 'tags', 'ai'])
    })

    it('tab order matches the order of rendered tabs', () => {
      render(<RightSidebarTabs {...defaultProps} />)

      const tabs = screen.getAllByRole('tab')
      expect(tabs[0]).toHaveTextContent(/properties/i)
      expect(tabs[1]).toHaveTextContent(/backlinks/i)
      expect(tabs[2]).toHaveTextContent(/tags/i)
      expect(tabs[3]).toHaveTextContent(/ai/i)
    })
  })

  describe('Accessibility', () => {
    it('has accessible name for each tab with keyboard shortcut in title', () => {
      render(<RightSidebarTabs {...defaultProps} />)

      const propertiesTab = screen.getByRole('tab', { name: /properties/i })
      expect(propertiesTab).toHaveAttribute('title', expect.stringContaining('⌘⌥1'))
    })

    it('badges have accessible labels', () => {
      render(<RightSidebarTabs {...defaultProps} tagsCount={5} />)

      expect(screen.getByLabelText('5 items')).toBeInTheDocument()
    })

    it('icons are hidden from screen readers', () => {
      render(<RightSidebarTabs {...defaultProps} />)

      const icons = document.querySelectorAll('.tab-icon')
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true')
      })
    })
  })

  describe('Active Tab Styling', () => {
    it('active tab has active class', () => {
      render(<RightSidebarTabs {...defaultProps} activeTab="tags" />)

      const tagsTab = screen.getByRole('tab', { name: /tags/i })
      expect(tagsTab).toHaveClass('active')
    })

    it('only one tab is active at a time', () => {
      render(<RightSidebarTabs {...defaultProps} activeTab="ai" />)

      const tabs = screen.getAllByRole('tab')
      const activeTabs = tabs.filter(tab => tab.classList.contains('active'))
      expect(activeTabs.length).toBe(1)
    })
  })

  describe('Icon Mode', () => {
    it('hides tab labels in icon mode', () => {
      render(<RightSidebarTabs {...defaultProps} mode="icon" />)

      // Labels should not be visible (though tabs still work)
      expect(screen.queryByText('Properties')).not.toBeInTheDocument()
      expect(screen.queryByText('Backlinks')).not.toBeInTheDocument()
    })

    it('shows tab labels in expanded mode', () => {
      render(<RightSidebarTabs {...defaultProps} mode="expanded" />)

      expect(screen.getByText('Properties')).toBeInTheDocument()
      expect(screen.getByText('Backlinks')).toBeInTheDocument()
    })

    it('adds icon-mode class when in icon mode', () => {
      render(<RightSidebarTabs {...defaultProps} mode="icon" />)

      const tablist = screen.getByRole('tablist')
      expect(tablist).toHaveClass('icon-mode')
    })

    it('does not add icon-mode class when expanded', () => {
      render(<RightSidebarTabs {...defaultProps} mode="expanded" />)

      const tablist = screen.getByRole('tablist')
      expect(tablist).not.toHaveClass('icon-mode')
    })

    it('shows toggle button when onToggleMode provided', () => {
      const onToggleMode = vi.fn()
      render(<RightSidebarTabs {...defaultProps} onToggleMode={onToggleMode} />)

      expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument()
    })

    it('does not show toggle button when onToggleMode not provided', () => {
      render(<RightSidebarTabs {...defaultProps} />)

      expect(screen.queryByLabelText('Collapse sidebar')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Expand sidebar')).not.toBeInTheDocument()
    })

    it('calls onToggleMode when toggle button clicked', () => {
      const onToggleMode = vi.fn()
      render(<RightSidebarTabs {...defaultProps} onToggleMode={onToggleMode} />)

      fireEvent.click(screen.getByLabelText('Collapse sidebar'))
      expect(onToggleMode).toHaveBeenCalledTimes(1)
    })

    it('shows expand label in icon mode', () => {
      const onToggleMode = vi.fn()
      render(<RightSidebarTabs {...defaultProps} mode="icon" onToggleMode={onToggleMode} />)

      expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument()
    })

    it('still shows badges in icon mode', () => {
      render(<RightSidebarTabs {...defaultProps} mode="icon" backlinksCount={5} />)

      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('hides menu content in icon mode', () => {
      const menuContent = <button data-testid="menu-button">Menu</button>
      render(<RightSidebarTabs {...defaultProps} mode="icon" menuContent={menuContent} />)

      expect(screen.queryByTestId('menu-button')).not.toBeInTheDocument()
    })

    it('shows menu content in expanded mode', () => {
      const menuContent = <button data-testid="menu-button">Menu</button>
      render(<RightSidebarTabs {...defaultProps} mode="expanded" menuContent={menuContent} />)

      expect(screen.getByTestId('menu-button')).toBeInTheDocument()
    })
  })
})
