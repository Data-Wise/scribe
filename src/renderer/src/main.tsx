import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { isTauri, logPlatformInfo } from './lib/platform'
import 'katex/dist/katex.min.css'  // KaTeX styles for math rendering
import 'rehype-callouts/theme/obsidian'  // Callout theme styles
import './index.css'

// Add platform class to document for CSS targeting
if (isTauri()) {
  document.documentElement.classList.add('tauri')
} else {
  document.documentElement.classList.add('browser')
}

// Log platform info in development
logPlatformInfo()

// Global error handler
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global error:', { message, source, lineno, colno, error });
};

// React Error Boundary for catching render errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: '#ef4444', backgroundColor: '#1a1a1a', fontFamily: 'monospace' }}>
          <h1>Something went wrong</h1>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
