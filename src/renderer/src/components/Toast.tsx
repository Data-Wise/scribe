/**
 * Toast - Simple notification system for API errors
 *
 * Provides a lightweight toast notification without external dependencies.
 * Uses CSS animations for smooth entry/exit.
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

// ============================================================================
// Types
// ============================================================================

type ToastType = 'error' | 'success' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
  persistent?: boolean  // Errors stay until manually dismissed
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

// ============================================================================
// Context
// ============================================================================

const ToastContext = createContext<ToastContextType | null>(null)

let toastId = 0

// ============================================================================
// Provider Component
// ============================================================================

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'error') => {
    const id = ++toastId
    const persistent = type === 'error'  // Errors persist until dismissed
    setToasts(prev => [...prev, { id, message, type, persistent }])

    // Auto-dismiss non-error toasts after 4 seconds
    if (!persistent) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 4000)
    }
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

// ============================================================================
// Hook
// ============================================================================

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// ============================================================================
// Global Toast Function (for use outside React components)
// ============================================================================

let globalShowToast: ((message: string, type?: ToastType) => void) | null = null

export function setGlobalToast(showToast: (message: string, type?: ToastType) => void) {
  globalShowToast = showToast
}

export function showGlobalToast(message: string, type: ToastType = 'error') {
  if (globalShowToast) {
    globalShowToast(message, type)
  } else {
    // Fallback to console if toast not initialized
    console.error('[Toast]', message)
  }
}

// ============================================================================
// Toast Container Component
// ============================================================================

function ToastContainer({
  toasts,
  onDismiss
}: {
  toasts: Toast[]
  onDismiss: (id: number) => void
}) {
  if (toasts.length === 0) return null

  const handleCopy = async (message: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(message)
      // Brief visual feedback - button text changes
      const btn = e.target as HTMLButtonElement
      const originalText = btn.textContent
      btn.textContent = 'Copied!'
      setTimeout(() => { btn.textContent = originalText }, 1000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type} ${toast.persistent ? 'toast-persistent' : ''}`}
          role="alert"
        >
          <span className="toast-icon">
            {toast.type === 'error' && '⚠️'}
            {toast.type === 'success' && '✓'}
            {toast.type === 'info' && 'ℹ️'}
          </span>
          <span className="toast-message">{toast.message}</span>
          <div className="toast-actions">
            {toast.persistent && (
              <button
                className="toast-copy"
                onClick={(e) => handleCopy(toast.message, e)}
                aria-label="Copy error"
              >
                Copy
              </button>
            )}
            <button
              className="toast-dismiss"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss"
            >
              {toast.persistent ? 'OK' : '×'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
