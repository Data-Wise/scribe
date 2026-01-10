import { Inbox } from 'lucide-react'
import { Tooltip } from './Tooltip'

interface InboxButtonProps {
  unreadCount: number
  isActive: boolean
  onClick: () => void
}

/**
 * InboxButton component for IconBarMode
 * Shows inbox icon with unread badge at top of sidebar
 */
export function InboxButton({ unreadCount, isActive, onClick }: InboxButtonProps) {
  const tooltipContent = `Inbox${unreadCount > 0 ? `\n${unreadCount} unassigned ${unreadCount === 1 ? 'note' : 'notes'}` : '\nNo unassigned notes'}`

  return (
    <Tooltip content={tooltipContent}>
      <button
        className={`inbox-icon-btn ${isActive ? 'active' : ''}`}
        onClick={onClick}
        data-testid="inbox-icon-button"
        aria-label={`Inbox${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        {/* Inbox icon */}
        <Inbox size={16} className="inbox-icon" />

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="inbox-badge" data-testid="inbox-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Active indicator */}
        {isActive && <span className="active-indicator" />}
      </button>
    </Tooltip>
  )
}
