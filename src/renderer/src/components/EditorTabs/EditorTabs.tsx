import { useRef, useState } from 'react'
import { Home, X, Pin, FileText, Globe } from 'lucide-react'
import { useAppViewStore, EditorTab, MISSION_CONTROL_TAB_ID } from '../../store/useAppViewStore'
import { isBrowser } from '../../lib/platform'
import { TabContextMenu } from './TabContextMenu'
import './EditorTabs.css'

interface EditorTabsProps {
  /** Optional: Project color for accent (hex) */
  accentColor?: string
}

export function EditorTabs({ accentColor = '#3b82f6' }: EditorTabsProps) {
  const { openTabs, activeTabId, setActiveTab, closeTab, reorderTabs, updateTabTitle } = useAppViewStore()
  const tabsRef = useRef<HTMLDivElement>(null)

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
    <div className="editor-tabs" ref={tabsRef} data-testid="editor-tabs">
      <div className="editor-tabs-scroll">
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

      {/* Browser mode indicator - subtle badge when running in browser */}
      {isBrowser() && (
        <div className="browser-mode-badge" title="Running in browser mode (IndexedDB)">
          <Globe size={12} />
          <span>Browser</span>
        </div>
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

      {/* Title - editable or static */}
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
        <span className="tab-title">{tab.title}</span>
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
