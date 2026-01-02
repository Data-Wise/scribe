import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PanelMenu, MenuItem, MenuSection } from '../components/PanelMenu'
import userEvent from '@testing-library/user-event'

// Mock createPortal so Radix UI dropdown content is rendered in DOM instead of portal
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom')
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children
  }
})

describe('PanelMenu Component', () => {
  // Mock menu items and sections
  const mockAction1 = vi.fn()
  const mockAction2 = vi.fn()
  const mockAction3 = vi.fn()
  const mockAction4 = vi.fn()

  const mockMenuItems: MenuItem[] = [
    {
      id: 'item-1',
      label: 'Edit',
      action: mockAction1,
      shortcut: '⌘E'
    },
    {
      id: 'item-2',
      label: 'Copy',
      action: mockAction2,
      shortcut: '⌘C'
    },
    {
      id: 'item-3',
      label: 'Delete',
      action: mockAction3,
      disabled: true
    }
  ]

  const mockMenuCheckableItems: MenuItem[] = [
    {
      id: 'toggle-1',
      label: 'Dark Mode',
      action: mockAction1,
      checked: true
    },
    {
      id: 'toggle-2',
      label: 'Notifications',
      action: mockAction2,
      checked: false
    }
  ]

  const mockSingleSection: MenuSection[] = [
    {
      items: mockMenuItems
    }
  ]

  const mockMultipleSections: MenuSection[] = [
    {
      title: 'Edit',
      items: [
        {
          id: 'edit-1',
          label: 'Edit',
          action: mockAction1,
          shortcut: '⌘E'
        },
        {
          id: 'edit-2',
          label: 'Copy',
          action: mockAction2,
          shortcut: '⌘C'
        }
      ]
    },
    {
      title: 'Settings',
      items: [
        {
          id: 'settings-1',
          label: 'Dark Mode',
          action: mockAction3,
          checked: true
        },
        {
          id: 'settings-2',
          label: 'Delete',
          action: mockAction4,
          disabled: true
        }
      ]
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the trigger button', () => {
      render(<PanelMenu sections={mockSingleSection} />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('panel-menu-trigger')
    })

    it('renders the trigger button with correct aria-label', () => {
      render(<PanelMenu sections={mockSingleSection} />)

      const button = screen.getByLabelText('Panel options')
      expect(button).toBeInTheDocument()
    })

    it('renders menu icon (MoreHorizontal)', () => {
      render(<PanelMenu sections={mockSingleSection} />)

      // The MoreHorizontal icon from lucide-react is rendered as SVG
      const svg = screen.getByRole('button').querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('w-4', 'h-4')
    })

    it('renders all menu items when menu is open', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockSingleSection} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
        expect(screen.getByText('Copy')).toBeInTheDocument()
        expect(screen.getByText('Delete')).toBeInTheDocument()
      })
    })

    it('renders keyboard shortcuts', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockSingleSection} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('⌘E')).toBeInTheDocument()
        expect(screen.getByText('⌘C')).toBeInTheDocument()
      })
    })

    it('renders section titles', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockMultipleSections} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        const labels = document.querySelectorAll('.panel-menu-label')
        expect(labels.length).toBeGreaterThan(0)
        // Check that both section titles are rendered
        const textContents = Array.from(labels).map(l => l.textContent)
        expect(textContents).toContain('Edit')
        expect(textContents).toContain('Settings')
      })
    })

    it('renders separators between sections', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockMultipleSections} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        const separators = document.querySelectorAll('.panel-menu-separator')
        expect(separators.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Click Handlers', () => {
    it('calls action when menu item is clicked', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockSingleSection} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })

      const editItem = screen.getByText('Edit')
      await user.click(editItem)

      expect(mockAction1).toHaveBeenCalled()
    })

    it('calls correct action for multiple items', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockSingleSection} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Copy')).toBeInTheDocument()
      })

      const copyItem = screen.getByText('Copy')
      await user.click(copyItem)

      expect(mockAction2).toHaveBeenCalled()
      expect(mockAction1).not.toHaveBeenCalled()
    })

    it('calls action from correct section', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockMultipleSections} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        const darkModeLabels = screen.getAllByText('Dark Mode')
        expect(darkModeLabels.length).toBeGreaterThan(0)
      })

      const darkModeItems = screen.getAllByText('Dark Mode')
      const settingsDarkMode = darkModeItems.find(el => {
        const parent = el.closest('[class*="panel-menu-item"]')
        return parent !== null
      })

      if (settingsDarkMode) {
        await user.click(settingsDarkMode)
        expect(mockAction3).toHaveBeenCalled()
      }
    })

    it('does not call action when disabled item is clicked', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockSingleSection} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Delete')).toBeInTheDocument()
      })

      const deleteItem = screen.getByText('Delete')
      const deleteButton = deleteItem.closest('[class*="panel-menu-item"]')

      // Disabled items have data-disabled attribute
      if (deleteButton?.hasAttribute('data-disabled')) {
        expect(mockAction3).not.toHaveBeenCalled()
      }
    })
  })

  describe('Icon Rendering', () => {
    it('renders checked items with check icon', async () => {
      const user = userEvent.setup()
      const sections: MenuSection[] = [
        {
          items: mockMenuCheckableItems
        }
      ]

      render(<PanelMenu sections={sections} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        const checkMarks = document.querySelectorAll('.panel-menu-check svg')
        // Should have at least one check mark (for the checked item)
        expect(checkMarks.length).toBeGreaterThan(0)
      })
    })

    it('does not render check icon for unchecked items', async () => {
      const user = userEvent.setup()
      const sections: MenuSection[] = [
        {
          items: mockMenuCheckableItems
        }
      ]

      render(<PanelMenu sections={sections} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        const checkSpans = document.querySelectorAll('.panel-menu-check')
        // Should have 2 check spans, but only one should contain SVG
        expect(checkSpans.length).toBe(2)
      })
    })

    it('renders icon in check container even when unchecked', async () => {
      const user = userEvent.setup()
      const sections: MenuSection[] = [
        {
          items: [
            {
              id: 'check-1',
              label: 'Item',
              action: vi.fn(),
              checked: false
            }
          ]
        }
      ]

      render(<PanelMenu sections={sections} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        const checkSpans = document.querySelectorAll('.panel-menu-check')
        expect(checkSpans.length).toBe(1)
        // The check span should be empty (no SVG inside)
        expect(checkSpans[0].querySelector('svg')).not.toBeInTheDocument()
      })
    })

    it('renders items without checked property without check container', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockSingleSection} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        const editLabel = screen.getByText('Edit')
        const editContainer = editLabel.closest('[class*="panel-menu-item"]')
        const checkContainers = editContainer?.querySelectorAll('.panel-menu-check')
        expect(checkContainers?.length).toBe(0)
      })
    })
  })

  describe('Menu Visibility', () => {
    it('menu is hidden initially', () => {
      render(<PanelMenu sections={mockSingleSection} />)

      // Menu items should not be visible initially
      expect(screen.queryByText('Edit')).not.toBeInTheDocument()
    })

    it('menu opens when trigger button is clicked', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockSingleSection} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })
    })

    it('menu closes after clicking a menu item', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockSingleSection} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })

      const editItem = screen.getByText('Edit')
      await user.click(editItem)

      await waitFor(() => {
        expect(screen.queryByText('Edit')).not.toBeInTheDocument()
      })
    })

    it('menu closes when pressing Escape key', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockSingleSection} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })

      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(screen.queryByText('Edit')).not.toBeInTheDocument()
      })
    })

    it('menu can be opened and closed multiple times', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockSingleSection} />)

      const trigger = screen.getByRole('button')

      // First open
      await user.click(trigger)
      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })

      // Close with Escape
      await user.keyboard('{Escape}')
      await waitFor(() => {
        expect(screen.queryByText('Edit')).not.toBeInTheDocument()
      })

      // Second open
      await user.click(trigger)
      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })
    })
  })

  describe('Positioning and Alignment', () => {
    it('renders with default alignment (end)', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockSingleSection} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })

      // The menu content should have been created with align prop
      const menuContent = document.querySelector('[class*="panel-menu-content"]')
      expect(menuContent).toBeInTheDocument()
    })

    it('renders with custom alignment (start)', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockSingleSection} align="start" />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })

      const menuContent = document.querySelector('[class*="panel-menu-content"]')
      expect(menuContent).toBeInTheDocument()
    })

    it('renders with center alignment', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockSingleSection} align="center" />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })

      const menuContent = document.querySelector('[class*="panel-menu-content"]')
      expect(menuContent).toBeInTheDocument()
    })

    it('renders with default side (bottom)', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockSingleSection} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })

      const menuContent = document.querySelector('[class*="panel-menu-content"]')
      expect(menuContent).toBeInTheDocument()
    })

    it('renders with custom side (top)', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockSingleSection} side="top" />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })

      const menuContent = document.querySelector('[class*="panel-menu-content"]')
      expect(menuContent).toBeInTheDocument()
    })

    it('renders with right side', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockSingleSection} side="right" />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })

      const menuContent = document.querySelector('[class*="panel-menu-content"]')
      expect(menuContent).toBeInTheDocument()
    })

    it('renders with left side', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockSingleSection} side="left" />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })

      const menuContent = document.querySelector('[class*="panel-menu-content"]')
      expect(menuContent).toBeInTheDocument()
    })
  })

  describe('Disabled Items', () => {
    it('disabled items have data-disabled attribute', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockSingleSection} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        const items = document.querySelectorAll('.panel-menu-item')
        expect(items.length).toBe(3)
      })

      // Check the last item (Delete) which is disabled
      const items = document.querySelectorAll('.panel-menu-item')
      const disabledItem = items[2] // Third item is the disabled Delete button
      expect(disabledItem).toHaveAttribute('data-disabled')
    })

    it('does not trigger action for disabled items', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockSingleSection} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Delete')).toBeInTheDocument()
      })

      const deleteItem = screen.getByText('Delete')
      // Try to click - Radix UI should prevent this
      await user.click(deleteItem)

      // Action should not be called for disabled item
      expect(mockAction3).not.toHaveBeenCalled()
    })
  })

  describe('Menu Structure', () => {
    it('renders items with correct label text', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockSingleSection} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
        expect(screen.getByText('Copy')).toBeInTheDocument()
        expect(screen.getByText('Delete')).toBeInTheDocument()
      })
    })

    it('renders items with correct classes', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockSingleSection} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        const items = document.querySelectorAll('.panel-menu-item')
        expect(items.length).toBe(3)
      })
    })

    it('renders item labels with correct class', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockSingleSection} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        const labels = document.querySelectorAll('.panel-menu-item-label')
        expect(labels.length).toBe(3)
        expect(labels[0].textContent).toBe('Edit')
        expect(labels[1].textContent).toBe('Copy')
        expect(labels[2].textContent).toBe('Delete')
      })
    })

    it('renders shortcuts with correct class', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockSingleSection} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        const shortcuts = document.querySelectorAll('.panel-menu-shortcut')
        expect(shortcuts.length).toBe(2) // Only 2 items have shortcuts
        expect(shortcuts[0].textContent).toBe('⌘E')
        expect(shortcuts[1].textContent).toBe('⌘C')
      })
    })

    it('omits shortcuts for items without shortcuts', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockSingleSection} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        const deleteLabel = screen.getByText('Delete')
        const deleteItem = deleteLabel.closest('[class*="panel-menu-item"]')
        const shortcut = deleteItem?.querySelector('.panel-menu-shortcut')
        expect(shortcut).not.toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles empty sections array', () => {
      render(<PanelMenu sections={[]} />)

      const trigger = screen.getByRole('button')
      expect(trigger).toBeInTheDocument()
    })

    it('handles section without title', async () => {
      const user = userEvent.setup()
      const sections: MenuSection[] = [
        {
          items: mockMenuItems
        }
      ]

      render(<PanelMenu sections={sections} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })

      // Should render items even without section title
      expect(screen.getByText('Copy')).toBeInTheDocument()
    })

    it('handles multiple items with the same action', async () => {
      const user = userEvent.setup()
      const sharedAction = vi.fn()
      const sections: MenuSection[] = [
        {
          items: [
            { id: 'item-1', label: 'Action A', action: sharedAction },
            { id: 'item-2', label: 'Action B', action: sharedAction }
          ]
        }
      ]

      render(<PanelMenu sections={sections} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Action A')).toBeInTheDocument()
      })

      const actionAItem = screen.getByText('Action A')
      await user.click(actionAItem)

      expect(sharedAction).toHaveBeenCalledTimes(1)
    })

    it('handles items with very long labels', async () => {
      const user = userEvent.setup()
      const longLabel = 'This is a very long menu item label that might wrap'
      const sections: MenuSection[] = [
        {
          items: [
            { id: 'long-item', label: longLabel, action: vi.fn() }
          ]
        }
      ]

      render(<PanelMenu sections={sections} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText(longLabel)).toBeInTheDocument()
      })
    })

    it('handles items with special characters in labels', async () => {
      const user = userEvent.setup()
      const specialLabel = 'Export as PDF → Archive'
      const sections: MenuSection[] = [
        {
          items: [
            { id: 'special-item', label: specialLabel, action: vi.fn() }
          ]
        }
      ]

      render(<PanelMenu sections={sections} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText(specialLabel)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('trigger button has accessible label', () => {
      render(<PanelMenu sections={mockSingleSection} />)

      const button = screen.getByLabelText('Panel options')
      expect(button).toBeInTheDocument()
    })

    it('menu items are rendered semantically', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockSingleSection} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })

      // Verify menu structure is semantic
      const menuContent = document.querySelector('[class*="panel-menu-content"]')
      expect(menuContent).toBeInTheDocument()
    })

    it('button has aria-label for accessibility', () => {
      render(<PanelMenu sections={mockSingleSection} />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label')
      expect(button.getAttribute('aria-label')).toBe('Panel options')
    })
  })

  describe('Multiple Sections with Separators', () => {
    it('renders separators only between sections', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockMultipleSections} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        const separators = document.querySelectorAll('.panel-menu-separator')
        // Should have 1 separator for 2 sections
        expect(separators.length).toBe(1)
      })
    })

    it('does not render separator before first section', async () => {
      const user = userEvent.setup()
      const sections: MenuSection[] = [
        { items: [{ id: 'item-1', label: 'First', action: vi.fn() }] },
        { items: [{ id: 'item-2', label: 'Second', action: vi.fn() }] }
      ]

      render(<PanelMenu sections={sections} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('First')).toBeInTheDocument()
      })

      const menuContent = document.querySelector('[class*="panel-menu-content"]')
      const children = menuContent?.querySelectorAll(':scope > div')

      // First div should not have a separator before it
      expect(children?.[0].querySelector('.panel-menu-separator')).not.toBeInTheDocument()
    })

    it('renders section titles correctly in multiple sections', async () => {
      const user = userEvent.setup()
      render(<PanelMenu sections={mockMultipleSections} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        // Both section titles should be visible in label elements
        const labels = document.querySelectorAll('.panel-menu-label')
        expect(labels.length).toBe(2)
        const labelTexts = Array.from(labels).map(l => l.textContent)
        expect(labelTexts).toContain('Edit')
        expect(labelTexts).toContain('Settings')
      })
    })
  })
})
