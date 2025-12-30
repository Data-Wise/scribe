import { ArrowLeft, ArrowRight, EyeOff, Eye, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { SidebarTabId, DEFAULT_SIDEBAR_TAB_ORDER, updatePreferences } from '../lib/preferences'

interface SidebarTabContextMenuProps {
  position: { x: number; y: number }
  tabId: SidebarTabId
  tabOrder: SidebarTabId[]
  hiddenTabs: SidebarTabId[]
  onClose: () => void
  onReorder: (newOrder: SidebarTabId[]) => void
  onHide: (newHidden: SidebarTabId[]) => void
}

const tabLabels: Record<SidebarTabId, string> = {
  properties: 'Properties',
  backlinks: 'Backlinks',
  tags: 'Tags',
  stats: 'Stats',
  claude: 'Claude',
  terminal: 'Terminal'
}

export function SidebarTabContextMenu({
  position,
  tabId,
  tabOrder,
  hiddenTabs,
  onClose,
  onReorder,
  onHide
}: SidebarTabContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [adjustedPosition, setAdjustedPosition] = useState(position)

  // Get visible tabs in order
  const visibleTabs = tabOrder.filter(t => !hiddenTabs.includes(t))
  const tabIndex = visibleTabs.indexOf(tabId)
  const isFirst = tabIndex === 0
  const isLast = tabIndex === visibleTabs.length - 1
  const isOnlyVisible = visibleTabs.length === 1

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  // Adjust position to keep menu in viewport
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let { x, y } = position

      if (x + rect.width > viewportWidth) {
        x = viewportWidth - rect.width - 8
      }
      if (y + rect.height > viewportHeight) {
        y = viewportHeight - rect.height - 8
      }

      setAdjustedPosition({ x, y })
    }
  }, [position])

  const handleMoveLeft = () => {
    if (isFirst) return
    const newOrder = [...tabOrder]
    const currentIdx = newOrder.indexOf(tabId)
    // Find the previous visible tab in full order
    const prevVisibleTab = visibleTabs[tabIndex - 1]
    const prevIdx = newOrder.indexOf(prevVisibleTab)
    // Swap
    newOrder.splice(currentIdx, 1)
    newOrder.splice(prevIdx, 0, tabId)
    onReorder(newOrder)
    updatePreferences({ sidebarTabOrder: newOrder })
    onClose()
  }

  const handleMoveRight = () => {
    if (isLast) return
    const newOrder = [...tabOrder]
    const currentIdx = newOrder.indexOf(tabId)
    // Find the next visible tab in full order
    const nextVisibleTab = visibleTabs[tabIndex + 1]
    const nextIdx = newOrder.indexOf(nextVisibleTab)
    // Swap
    newOrder.splice(currentIdx, 1)
    newOrder.splice(nextIdx, 0, tabId)
    onReorder(newOrder)
    updatePreferences({ sidebarTabOrder: newOrder })
    onClose()
  }

  const handleHideTab = () => {
    if (isOnlyVisible) return // Can't hide the last visible tab
    const newHidden = [...hiddenTabs, tabId]
    onHide(newHidden)
    updatePreferences({ sidebarHiddenTabs: newHidden })
    onClose()
  }

  const handleResetOrder = () => {
    const newOrder = [...DEFAULT_SIDEBAR_TAB_ORDER]
    onReorder(newOrder)
    updatePreferences({ sidebarTabOrder: newOrder })
    onClose()
  }

  const handleShowAllTabs = () => {
    onHide([])
    updatePreferences({ sidebarHiddenTabs: [] })
    onClose()
  }

  const hasHiddenTabs = hiddenTabs.length > 0
  const orderChanged = JSON.stringify(tabOrder) !== JSON.stringify(DEFAULT_SIDEBAR_TAB_ORDER)

  // Use portal to render outside the sidebar's stacking context
  return createPortal(
    <div
      ref={menuRef}
      className="tab-context-menu"
      style={{
        position: 'fixed',
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        zIndex: 9999
      }}
    >
      <div className="context-menu-content">
        {/* Move Left */}
        <button
          className="context-menu-item"
          onClick={handleMoveLeft}
          disabled={isFirst}
          style={{ opacity: isFirst ? 0.5 : 1 }}
        >
          <ArrowLeft size={14} />
          <span>Move Left</span>
        </button>

        {/* Move Right */}
        <button
          className="context-menu-item"
          onClick={handleMoveRight}
          disabled={isLast}
          style={{ opacity: isLast ? 0.5 : 1 }}
        >
          <ArrowRight size={14} />
          <span>Move Right</span>
        </button>

        <div className="context-menu-divider" />

        {/* Hide Tab */}
        <button
          className="context-menu-item"
          onClick={handleHideTab}
          disabled={isOnlyVisible}
          style={{ opacity: isOnlyVisible ? 0.5 : 1 }}
          title={isOnlyVisible ? 'Cannot hide the last visible tab' : `Hide ${tabLabels[tabId]} tab`}
        >
          <EyeOff size={14} />
          <span>Hide Tab</span>
        </button>

        <div className="context-menu-divider" />

        {/* Reset Tab Order */}
        <button
          className="context-menu-item"
          onClick={handleResetOrder}
          disabled={!orderChanged}
          style={{ opacity: !orderChanged ? 0.5 : 1 }}
        >
          <RotateCcw size={14} />
          <span>Reset Tab Order</span>
        </button>

        {/* Show All Tabs */}
        <button
          className="context-menu-item"
          onClick={handleShowAllTabs}
          disabled={!hasHiddenTabs}
          style={{ opacity: !hasHiddenTabs ? 0.5 : 1 }}
        >
          <Eye size={14} />
          <span>Show All Tabs</span>
          {hasHiddenTabs && <span className="shortcut">{hiddenTabs.length}</span>}
        </button>
      </div>
    </div>,
    document.body
  )
}

export default SidebarTabContextMenu
