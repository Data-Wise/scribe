import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { MoreHorizontal, Check } from 'lucide-react'

export interface MenuItem {
  id: string
  label: string
  action: () => void
  shortcut?: string
  checked?: boolean
  disabled?: boolean
}

export interface MenuSection {
  title?: string
  items: MenuItem[]
}

interface PanelMenuProps {
  sections: MenuSection[]
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function PanelMenu({ sections, align = 'end', side = 'bottom' }: PanelMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="panel-menu-trigger"
          aria-label="Panel options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="panel-menu-content"
          align={align}
          side={side}
          sideOffset={4}
        >
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {sectionIndex > 0 && <DropdownMenu.Separator className="panel-menu-separator" />}

              {section.title && (
                <DropdownMenu.Label className="panel-menu-label">
                  {section.title}
                </DropdownMenu.Label>
              )}

              {section.items.map((item) => (
                <DropdownMenu.Item
                  key={item.id}
                  className="panel-menu-item"
                  onSelect={item.action}
                  disabled={item.disabled}
                >
                  {item.checked !== undefined && (
                    <span className="panel-menu-check">
                      {item.checked && <Check className="w-3 h-3" />}
                    </span>
                  )}
                  <span className="panel-menu-item-label">{item.label}</span>
                  {item.shortcut && (
                    <span className="panel-menu-shortcut">{item.shortcut}</span>
                  )}
                </DropdownMenu.Item>
              ))}
            </div>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
