import { useRef, useState, useEffect, useCallback } from 'react'
import { Home, X, Pin, FileText, ChevronLeft, ChevronRight, PanelRightClose, PanelRightOpen } from 'lucide-react'
import { useAppViewStore, EditorTab, MISSION_CONTROL_TAB_ID } from '../../store/useAppViewStore'
import { loadPreferences, TabBarStyle, BorderStyle, ActiveTabStyle } from '../../lib/preferences'
import { TabContextMenu } from './TabContextMenu'
import './EditorTabs.css'

/**
 * Smart truncation: keeps beginning and end of title visible
 * "Mediation note 1" → "Mediati...ote 1"
 */
function smartTruncate(title: string, maxLen = 18): string {
  if (title.length <= maxLen) return title
  const ellipsis = '...'
  const available = maxLen - ellipsis.length
  const startLen = Math.ceil(available * 0.6) // 60% at start
  const endLen = Math.floor(available * 0.4)  // 40% at end
  return `${title.slice(0, startLen)}${ellipsis}${title.slice(-endLen)}`
}

interface EditorTabsProps {
  /** Optional: Project color for accent (hex) */
  accentColor?: string
  /** Optional: Override tab bar style (for settings preview) */
  tabBarStyle?: TabBarStyle
  /** Optional: Override border style (for settings preview) */
  borderStyle?: BorderStyle
  /** Optional: Override active tab style (for settings preview) */
  activeTabStyle?: ActiveTabStyle
  /** Whether the right sidebar is collapsed */
  rightSidebarCollapsed?: boolean
  /** Callback to toggle the right sidebar */
  onToggleRightSidebar?: () => void
}

export function EditorTabs({
  accentColor = '#3b82f6',
  tabBarStyle: tabBarStyleProp,
  borderStyle: borderStyleProp,
  activeTabStyle: activeTabStyleProp,
  rightSidebarCollapsed,
  onToggleRightSidebar
}: EditorTabsProps) {
  const { openTabs, activeTabId, setActiveTab, closeTab, reorderTabs, updateTabTitle } = useAppViewStore()

  // UI style state - reload on storage change for reactivity
  const [uiStyles, setUiStyles] = useState(() => {
    const prefs = loadPreferences()
    return {
      tabBarStyle: prefs.tabBarStyle,
      borderStyle: prefs.borderStyle,
      activeTabStyle: prefs.activeTabStyle
    }
  })

  // Listen for localStorage changes (from settings modal)
  useEffect(() => {
    const handleStorageChange = () => {
      const prefs = loadPreferences()
      setUiStyles({
        tabBarStyle: prefs.tabBarStyle,
        borderStyle: prefs.borderStyle,
        activeTabStyle: prefs.activeTabStyle
      })
    }

    // Listen for storage events (cross-tab) and custom event (same-tab)
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('preferences-changed', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('preferences-changed', handleStorageChange)
    }
  }, [])

  // Use props if provided (for preview), otherwise use state
  const tabBarStyle = tabBarStyleProp ?? uiStyles.tabBarStyle
  const borderStyle = borderStyleProp ?? uiStyles.borderStyle
  const activeTabStyle = activeTabStyleProp ?? uiStyles.activeTabStyle

  const tabsRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Inline editing state
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    position: { x: number; y: number }
    tab: EditorTab
    index: number
  } | null>(null)

  // Scroll overflow state
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  // Check if scroll arrows are needed
  const checkScrollOverflow = useCallback(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollEl
    setShowLeftArrow(scrollLeft > 0)
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 1)
  }, [])

  // Update scroll state on mount, resize, and tab changes
  useEffect(() => {
    checkScrollOverflow()
    window.addEventListener('resize', checkScrollOverflow)
    return () => window.removeEventListener('resize', checkScrollOverflow)
  }, [checkScrollOverflow, openTabs.length])

  // Scroll handlers
  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -150, behavior: 'smooth' })
  }

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 150, behavior: 'smooth' })
  }

  const handleSaveTitle = () => {
    if (editingTabId && editingTitle.trim()) {
      updateTabTitle(editingTabId, editingTitle.trim())
    }
    setEditingTabId(null)
    setEditingTitle('')
  }

  const handleCancelEdit = () => {
    setEditingTabId(null)
    setEditingTitle('')
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveTitle()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancelEdit()
    }
  }

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

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    // Set a custom drag image (optional, uses default if not set)
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, 50, 18)
    }
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      reorderTabs(draggedIndex, toIndex)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // Context menu handler
  const handleContextMenu = (e: React.MouseEvent, tab: EditorTab, index: number) => {
    e.preventDefault()
    setContextMenu({
      position: { x: e.clientX, y: e.clientY },
      tab,
      index
    })
  }

  return (
    <div
      className="editor-tabs"
      ref={tabsRef}
      data-testid="editor-tabs"
      data-tab-bar-style={tabBarStyle}
      data-border-style={borderStyle}
      data-active-tab-style={activeTabStyle}
    >
      {/* Left scroll arrow */}
      {showLeftArrow && (
        <button
          className="tab-scroll-arrow tab-scroll-left"
          onClick={scrollLeft}
          title="Scroll left"
          aria-label="Scroll tabs left"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      <div
        className="editor-tabs-scroll"
        ref={scrollRef}
        onScroll={checkScrollOverflow}
      >
        {openTabs.map((tab, index) => (
          <TabButton
            key={tab.id}
            tab={tab}
            index={index}
            isActive={tab.id === activeTabId}
            accentColor={accentColor}
            onClick={() => handleTabClick(tab.id)}
            onClose={(e) => handleCloseClick(e, tab.id)}
            onMouseDown={(e) => handleMiddleClick(e, tab)}
            draggable={!tab.isPinned}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleDrop(e, index)}
            isDragging={draggedIndex === index}
            isDragOver={dragOverIndex === index}
            // Inline editing props
            isEditing={editingTabId === tab.id}
            editingTitle={editingTitle}
            onStartEdit={() => { setEditingTabId(tab.id); setEditingTitle(tab.title) }}
            onTitleChange={setEditingTitle}
            onSaveTitle={handleSaveTitle}
            onCancelEdit={handleCancelEdit}
            onTitleKeyDown={handleTitleKeyDown}
            onContextMenu={(e) => handleContextMenu(e, tab, index)}
          />
        ))}
      </div>

      {/* Right scroll arrow */}
      {showRightArrow && (
        <button
          className="tab-scroll-arrow tab-scroll-right"
          onClick={scrollRight}
          title="Scroll right"
          aria-label="Scroll tabs right"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Spacer to push toggle to right */}
      <div className="flex-1" />

      {/* Right sidebar toggle */}
      {onToggleRightSidebar && (
        <button
          className="sidebar-toggle-btn"
          onClick={onToggleRightSidebar}
          title={rightSidebarCollapsed ? "Show sidebar (⌘⇧])" : "Hide sidebar (⌘⇧])"}
          aria-label={rightSidebarCollapsed ? "Show right sidebar" : "Hide right sidebar"}
          data-testid="right-sidebar-toggle"
        >
          {rightSidebarCollapsed ? <PanelRightOpen size={16} /> : <PanelRightClose size={16} />}
        </button>
      )}

      {/* Context menu */}
      {contextMenu && (
        <TabContextMenu
          position={contextMenu.position}
          tab={contextMenu.tab}
          tabIndex={contextMenu.index}
          totalTabs={openTabs.length}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  )
}

interface TabButtonProps {
  tab: EditorTab
  index: number
  isActive: boolean
  accentColor: string
  onClick: () => void
  onClose: (e: React.MouseEvent) => void
  onMouseDown: (e: React.MouseEvent) => void
  // Drag and drop props
  draggable: boolean
  onDragStart: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragEnd: () => void
  onDrop: (e: React.DragEvent) => void
  isDragging: boolean
  isDragOver: boolean
  // Inline editing props
  isEditing: boolean
  editingTitle: string
  onStartEdit: () => void
  onTitleChange: (title: string) => void
  onSaveTitle: () => void
  onCancelEdit: () => void
  onTitleKeyDown: (e: React.KeyboardEvent) => void
  onContextMenu: (e: React.MouseEvent) => void
}

function TabButton({
  tab,
  index,
  isActive,
  accentColor,
  onClick,
  onClose,
  onMouseDown,
  draggable,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  isDragging,
  isDragOver,
  isEditing,
  editingTitle,
  onStartEdit,
  onTitleChange,
  onSaveTitle,
  onTitleKeyDown,
  onContextMenu
}: TabButtonProps) {
  const isMissionControl = tab.id === MISSION_CONTROL_TAB_ID

  const classNames = [
    'editor-tab',
    isActive ? 'active' : '',
    tab.isPinned ? 'pinned' : '',
    isDragging ? 'dragging' : '',
    isDragOver ? 'drag-over' : '',
    isEditing ? 'editing' : ''
  ].filter(Boolean).join(' ')

  // Handle double-click to start editing (not for pinned tabs like Mission Control)
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!tab.isPinned && !isEditing) {
      e.preventDefault()
      e.stopPropagation()
      onStartEdit()
    }
  }

  return (
    <button
      className={classNames}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onDoubleClick={handleDoubleClick}
      onContextMenu={onContextMenu}
      title={isEditing ? undefined : tab.title}
      data-testid={isMissionControl ? 'tab-mission-control' : `tab-${index}`}
      draggable={draggable && !isEditing}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
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

      {/* Title - editable or static with smart truncation */}
      {isEditing ? (
        <input
          className="tab-title-input"
          value={editingTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          onBlur={onSaveTitle}
          onKeyDown={onTitleKeyDown}
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="tab-title">{smartTruncate(tab.title)}</span>
      )}

      {/* Pin indicator or close button */}
      {tab.isPinned ? (
        <span className="tab-pin" title="Pinned" data-testid="tab-pinned">
          <Pin size={10} />
        </span>
      ) : (
        <button
          className="tab-close"
          onClick={onClose}
          title="Close tab (⌘W)"
          data-testid="tab-close"
        >
          <X size={12} />
        </button>
      )}
    </button>
  )
}

export default EditorTabs
