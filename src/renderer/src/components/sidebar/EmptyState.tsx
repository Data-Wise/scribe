import React from 'react'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 max-w-[280px] mx-auto">
      <div className="mb-4 text-gray-400" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-400 mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm font-medium"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
