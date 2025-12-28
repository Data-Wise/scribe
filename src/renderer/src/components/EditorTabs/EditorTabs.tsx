import { useRef } from 'react'
import { Home, X, Pin, FileText } from 'lucide-react'
import { useAppViewStore, EditorTab, MISSION_CONTROL_TAB_ID } from '../../store/useAppViewStore'
import './EditorTabs.css'

interface EditorTabsProps {
  /** Optional: Project color for accent (hex) */
  accentColor?: string
}

export function EditorTabs({ accentColor = '#3b82f6' }: EditorTabsProps) {
  const { openTabs, activeTabId, setActiveTab, closeTab } = useAppViewStore()
  const tabsRef = useRef<HTMLDivElement>(null)

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
  }

  const handleCloseClick = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation()
    closeTab(tabId)
  }

  const handleMiddleClick = (e: React.MouseEvent, tab: EditorTab) => {
    if (e.button === 1 && !tab.isPinned) {
      e.preventDefault()
      closeTab(tab.id)
    }
  }

  return (
    <div className="editor-tabs" ref={tabsRef}>
      <div className="editor-tabs-scroll">
        {openTabs.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            accentColor={accentColor}
            onClick={() => handleTabClick(tab.id)}
            onClose={(e) => handleCloseClick(e, tab.id)}
            onMouseDown={(e) => handleMiddleClick(e, tab)}
          />
        ))}
      </div>
    </div>
  )
}

interface TabButtonProps {
  tab: EditorTab
  isActive: boolean
  accentColor: string
  onClick: () => void
  onClose: (e: React.MouseEvent) => void
  onMouseDown: (e: React.MouseEvent) => void
}

function TabButton({ tab, isActive, accentColor, onClick, onClose, onMouseDown }: TabButtonProps) {
  const isMissionControl = tab.id === MISSION_CONTROL_TAB_ID

  return (
    <button
      className={`editor-tab ${isActive ? 'active' : ''} ${tab.isPinned ? 'pinned' : ''}`}
      onClick={onClick}
      onMouseDown={onMouseDown}
      title={tab.title}
      style={{
        '--tab-accent': isActive ? accentColor : 'transparent'
      } as React.CSSProperties}
    >
      {/* Gradient accent bar (top) */}
      {isActive && <div className="tab-accent-bar" style={{ background: `linear-gradient(to right, ${accentColor}, ${accentColor}88)` }} />}

      {/* Icon */}
      <span className="tab-icon">
        {isMissionControl ? (
          <Home size={14} />
        ) : (
          <FileText size={14} />
        )}
      </span>

      {/* Title */}
      <span className="tab-title">{tab.title}</span>

      {/* Pin indicator or close button */}
      {tab.isPinned ? (
        <span className="tab-pin" title="Pinned">
          <Pin size={10} />
        </span>
      ) : (
        <button
          className="tab-close"
          onClick={onClose}
          title="Close tab (⌘W)"
        >
          <X size={12} />
        </button>
      )}
    </button>
  )
}

export default EditorTabs
