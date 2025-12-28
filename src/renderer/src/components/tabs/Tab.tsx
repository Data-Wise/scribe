import { useRef } from 'react'
import { X, Home, FileText } from 'lucide-react'
import { Tab as TabType } from '../../store/useTabStore'

interface TabProps {
  tab: TabType
  isActive: boolean
  onSelect: () => void
  onClose?: () => void
  onMiddleClick?: () => void
}

/**
 * Individual tab component
 * - Home tab: pinned, no close button
 * - Editor tab: closable, shows note title
 */
export function Tab({ tab, isActive, onSelect, onClose, onMiddleClick }: TabProps) {
  const tabRef = useRef<HTMLButtonElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle click to close
    if (e.button === 1 && onMiddleClick) {
      e.preventDefault()
      onMiddleClick()
    }
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose?.()
  }

  const isHome = tab.type === 'home'

  return (
    <button
      ref={tabRef}
      onClick={onSelect}
      onMouseDown={handleMouseDown}
      className={`
        tab group relative flex items-center gap-2 h-8 px-3 rounded-t-lg
        text-sm font-medium transition-colors duration-150
        focus:outline-none focus-visible:ring-2 focus-visible:ring-nexus-accent focus-visible:ring-inset
        ${isActive
          ? 'bg-nexus-bg-primary text-nexus-text-primary'
          : 'text-nexus-text-muted hover:text-nexus-text-primary hover:bg-white/5'
        }
        ${isHome ? 'pl-2.5' : ''}
      `}
      title={tab.title}
      aria-selected={isActive}
      role="tab"
    >
      {/* Icon */}
      {isHome ? (
        <Home className="w-4 h-4 flex-shrink-0" />
      ) : (
        <FileText className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
      )}

      {/* Dirty indicator */}
      {tab.isDirty && !isHome && (
        <span className="w-1.5 h-1.5 rounded-full bg-nexus-accent flex-shrink-0" />
      )}

      {/* Title */}
      <span className="truncate max-w-[140px]">
        {tab.title}
      </span>

      {/* Close button (not for pinned tabs) */}
      {!tab.isPinned && onClose && (
        <span
          onClick={handleClose}
          className={`
            flex-shrink-0 p-0.5 rounded hover:bg-white/10 transition-opacity
            ${isActive ? 'opacity-60 hover:opacity-100' : 'opacity-0 group-hover:opacity-60 hover:!opacity-100'}
          `}
          role="button"
          aria-label={`Close ${tab.title}`}
        >
          <X className="w-3.5 h-3.5" />
        </span>
      )}

      {/* Active indicator line */}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-nexus-accent" />
      )}
    </button>
  )
}
