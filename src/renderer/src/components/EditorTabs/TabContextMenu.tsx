import { Pin, PinOff, X, XCircle, ArrowRight, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { EditorTab, MISSION_CONTROL_TAB_ID, useAppViewStore } from '../../store/useAppViewStore'

interface TabContextMenuProps {
  position: { x: number; y: number }
  tab: EditorTab
  tabIndex: number
  totalTabs: number
  onClose: () => void
}

export function TabContextMenu({
  position,
  tab,
  tabIndex,
  // totalTabs available for future use (e.g., "Close All" behavior)
  totalTabs: _totalTabs,
  onClose
}: TabContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [adjustedPosition, setAdjustedPosition] = useState(position)

  const { openTabs, pinTab, unpinTab, closeTab } = useAppViewStore()

  const isMissionControl = tab.id === MISSION_CONTROL_TAB_ID

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

  const handlePin = () => {
    pinTab(tab.id)
    onClose()
  }

  const handleUnpin = () => {
    unpinTab(tab.id)
    onClose()
  }

  const handleClose = () => {
    closeTab(tab.id)
    onClose()
  }

  const handleCloseOthers = () => {
    // Close all tabs except pinned and current
    openTabs.forEach(t => {
      if (t.id !== tab.id && !t.isPinned) {
        closeTab(t.id)
      }
    })
    onClose()
  }

  const handleCloseToRight = () => {
    // Close tabs after current index, excluding pinned
    openTabs.slice(tabIndex + 1).forEach(t => {
      if (!t.isPinned) {
        closeTab(t.id)
      }
    })
    onClose()
  }

  const handleCopyPath = async () => {
    try {
      // tab.id is the note path for note tabs
      await navigator.clipboard.writeText(tab.id)
    } catch (err) {
      console.error('Failed to copy path:', err)
    }
    onClose()
  }

  // Count closeable tabs for "Close Others" and "Close to Right"
  const closeableOthers = openTabs.filter(t => t.id !== tab.id && !t.isPinned).length
  const closeableToRight = openTabs.slice(tabIndex + 1).filter(t => !t.isPinned).length

  return (
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
        {/* Pin/Unpin - don't show for Mission Control (always pinned) */}
        {!isMissionControl && (
          <>
            {tab.isPinned ? (
              <button className="context-menu-item" onClick={handleUnpin}>
                <PinOff size={14} />
                <span>Unpin Tab</span>
              </button>
            ) : (
              <button className="context-menu-item" onClick={handlePin}>
                <Pin size={14} />
                <span>Pin Tab</span>
              </button>
            )}

            <div className="context-menu-divider" />
          </>
        )}

        {/* Close - disabled for pinned tabs */}
        <button
          className="context-menu-item"
          onClick={handleClose}
          disabled={tab.isPinned}
          style={{ opacity: tab.isPinned ? 0.5 : 1 }}
        >
          <X size={14} />
          <span>Close</span>
          <span className="shortcut">⌘W</span>
        </button>

        {/* Close Others */}
        <button
          className="context-menu-item"
          onClick={handleCloseOthers}
          disabled={closeableOthers === 0}
          style={{ opacity: closeableOthers === 0 ? 0.5 : 1 }}
        >
          <XCircle size={14} />
          <span>Close Others</span>
        </button>

        {/* Close to Right */}
        <button
          className="context-menu-item"
          onClick={handleCloseToRight}
          disabled={closeableToRight === 0}
          style={{ opacity: closeableToRight === 0 ? 0.5 : 1 }}
        >
          <ArrowRight size={14} />
          <span>Close to Right</span>
        </button>

        <div className="context-menu-divider" />

        {/* Copy Path - only makes sense for note tabs */}
        <button
          className="context-menu-item"
          onClick={handleCopyPath}
          disabled={isMissionControl}
          style={{ opacity: isMissionControl ? 0.5 : 1 }}
        >
          <Copy size={14} />
          <span>Copy Path</span>
        </button>
      </div>
    </div>
  )
}

export default TabContextMenu
