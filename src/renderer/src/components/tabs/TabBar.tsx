import { useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { Tab } from './Tab'
import { useTabStore } from '../../store/useTabStore'
import { useDragRegion } from '../DragRegion'

interface TabBarProps {
  onCreateNote?: () => void
}

/**
 * Tab bar component - shows pinned Home tab + editor tabs
 *
 * Features:
 * - Home tab always first and pinned
 * - Editor tabs can be closed, reordered
 * - Scrollable when many tabs
 * - New tab button
 */
export function TabBar({ onCreateNote }: TabBarProps) {
  const { tabs, activeTabId, setActiveTab, requestCloseTab } = useTabStore()
  const tabBarRef = useRef<HTMLDivElement>(null)
  const dragRegion = useDragRegion()

  // Drag state for reordering
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    // Can't drag home tab
    if (index === 0) return
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    // Can't drop on home tab position
    if (index === 0) return
    setDragOverIndex(index)
  }

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      useTabStore.getState().reorderTabs(draggedIndex, dragOverIndex)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div
      ref={tabBarRef}
      className="tab-bar flex items-end h-10 mt-7 bg-nexus-bg-secondary border-b border-white/5 px-3 gap-0.5 overflow-x-auto"
      role="tablist"
      aria-label="Editor tabs"
    >

      {/* Tabs */}
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          draggable={!tab.isPinned}
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`
            flex-shrink-0
            ${dragOverIndex === index ? 'border-l-2 border-nexus-accent' : ''}
            ${draggedIndex === index ? 'opacity-50' : ''}
          `}
        >
          <Tab
            tab={tab}
            isActive={tab.id === activeTabId}
            onSelect={() => setActiveTab(tab.id)}
            onClose={tab.isPinned ? undefined : () => requestCloseTab(tab.id)}
            onMiddleClick={tab.isPinned ? undefined : () => requestCloseTab(tab.id)}
          />
        </div>
      ))}

      {/* New tab button */}
      {onCreateNote && (
        <button
          onClick={onCreateNote}
          className="flex-shrink-0 p-1.5 rounded hover:bg-white/5 text-nexus-text-muted hover:text-nexus-text-primary transition-colors ml-1"
          title="New note (⌘N)"
          aria-label="New note"
        >
          <Plus className="w-4 h-4" />
        </button>
      )}

      {/* Flexible drag region to fill remaining space */}
      <div
        className="flex-1 h-full min-w-[40px]"
        {...dragRegion}
      />
    </div>
  )
}
