import { useEffect, useState } from 'react'
import { X, Undo2, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react'
import { useToastStore, Toast as ToastType } from '../store/useToastStore'

/**
 * ToastContainer - Renders all active toasts
 *
 * ADHD Principle: Escape hatches - allow quick undo of destructive actions
 */
export function ToastContainer() {
  const { toasts } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: ToastType
}

function ToastItem({ toast }: ToastItemProps) {
  const { removeToast } = useToastStore()
  const duration = toast.duration ?? 5000
  const [progress, setProgress] = useState(100)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-dismiss with progress bar
  useEffect(() => {
    if (isPaused) return

    const startTime = Date.now()
    const remainingTime = (progress / 100) * duration

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.max(0, ((remainingTime - elapsed) / duration) * 100)
      setProgress(newProgress)

      if (newProgress <= 0) {
        clearInterval(interval)
        removeToast(toast.id)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [toast.id, duration, removeToast, isPaused, progress])

  const handleAction = () => {
    toast.action?.onClick()
    removeToast(toast.id)
  }

  const handleDismiss = () => {
    removeToast(toast.id)
  }

  // Icon based on type
  const Icon = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: XCircle,
    undo: Undo2
  }[toast.type]

  // Colors based on type
  const colors = {
    info: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    success: 'bg-green-500/20 border-green-500/30 text-green-400',
    warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    error: 'bg-red-500/20 border-red-500/30 text-red-400',
    undo: 'bg-nexus-accent/20 border-nexus-accent/30 text-nexus-accent'
  }[toast.type]

  const progressColor = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    undo: 'bg-nexus-accent'
  }[toast.type]

  return (
    <div
      className={`relative overflow-hidden rounded-lg border ${colors} backdrop-blur-sm shadow-lg animate-slide-in`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Content */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1 text-sm font-medium text-nexus-text-primary">
          {toast.message}
        </span>

        {/* Action button */}
        {toast.action && (
          <button
            onClick={handleAction}
            className="px-3 py-1 text-xs font-semibold rounded bg-white/10 hover:bg-white/20 transition-colors"
          >
            {toast.action.label}
          </button>
        )}

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="p-1 rounded hover:bg-white/10 transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
        <div
          className={`h-full ${progressColor} transition-all duration-50`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
