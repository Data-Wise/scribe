import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: (error: Error, errorInfo: ErrorInfo, reset: () => void) => ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * ErrorBoundary - Prevents single component errors from crashing the entire app
 *
 * Features:
 * - Catches React rendering errors
 * - Shows user-friendly fallback UI
 * - Provides error details in development
 * - Offers recovery actions (reset, home)
 * - Logs errors for debugging
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error)
    console.error('Component stack:', errorInfo.componentStack)

    // Store error info for display
    this.setState({
      error,
      errorInfo
    })

    // TODO: Send to crash reporting service (Sentry, etc.)
    // if (window.__TAURI__) {
    //   invoke('log_crash', {
    //     error: error.toString(),
    //     stack: error.stack,
    //     componentStack: errorInfo.componentStack
    //   })
    // }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  handleGoHome = () => {
    this.handleReset()
    // Navigate to home (Mission Control)
    window.location.hash = '#/'
  }

  render() {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback } = this.props

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback && errorInfo) {
        return fallback(error, errorInfo, this.handleReset)
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            {/* Error Card */}
            <div className="bg-neutral-800 rounded-lg shadow-2xl border border-neutral-700 overflow-hidden">
              {/* Header */}
              <div className="bg-red-900/20 border-b border-red-700/30 px-6 py-4 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <div>
                  <h1 className="text-xl font-semibold text-red-100">
                    Something went wrong
                  </h1>
                  <p className="text-sm text-red-300 mt-1">
                    An unexpected error occurred in the application
                  </p>
                </div>
              </div>

              {/* Error Details */}
              <div className="px-6 py-6 space-y-4">
                {/* Error Message */}
                <div>
                  <h2 className="text-sm font-medium text-neutral-400 mb-2">
                    Error Message:
                  </h2>
                  <div className="bg-neutral-900 rounded border border-neutral-700 p-3">
                    <code className="text-sm text-red-300 font-mono">
                      {error.message || 'Unknown error'}
                    </code>
                  </div>
                </div>

                {/* Stack Trace (Development Only) */}
                {import.meta.env.DEV && error.stack && (
                  <div>
                    <h2 className="text-sm font-medium text-neutral-400 mb-2">
                      Stack Trace:
                    </h2>
                    <div className="bg-neutral-900 rounded border border-neutral-700 p-3 max-h-64 overflow-auto">
                      <pre className="text-xs text-neutral-400 font-mono whitespace-pre-wrap">
                        {error.stack}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Component Stack (Development Only) */}
                {import.meta.env.DEV && errorInfo?.componentStack && (
                  <div>
                    <h2 className="text-sm font-medium text-neutral-400 mb-2">
                      Component Stack:
                    </h2>
                    <div className="bg-neutral-900 rounded border border-neutral-700 p-3 max-h-64 overflow-auto">
                      <pre className="text-xs text-neutral-400 font-mono whitespace-pre-wrap">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  </div>
                )}

                {/* User Guidance */}
                <div className="bg-blue-900/10 border border-blue-700/30 rounded p-4">
                  <p className="text-sm text-blue-200">
                    <strong>What you can do:</strong>
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-blue-300">
                    <li>• Try refreshing the page to reset the app</li>
                    <li>• Go back to Mission Control (home)</li>
                    <li>• If the problem persists, report this issue on GitHub</li>
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-neutral-800/50 border-t border-neutral-700 flex items-center gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded font-medium transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Go to Home
                </button>
                <a
                  href="https://github.com/Data-Wise/scribe/issues/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-sm text-blue-400 hover:text-blue-300 underline"
                >
                  Report Issue →
                </a>
              </div>
            </div>

            {/* Additional Help (Production) */}
            {!import.meta.env.DEV && (
              <p className="mt-4 text-center text-sm text-neutral-500">
                Error ID: {Date.now().toString(36).toUpperCase()}
              </p>
            )}
          </div>
        </div>
      )
    }

    return children
  }
}
