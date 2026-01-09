import ReactDOM from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { isTauri, logPlatformInfo } from './lib/platform'
import 'katex/dist/katex.min.css'  // KaTeX styles for math rendering
import './index.css'

// Add platform class to document for CSS targeting
if (isTauri()) {
  document.documentElement.classList.add('tauri')
} else {
  document.documentElement.classList.add('browser')
}

// Log platform info in development
logPlatformInfo()

// Global error handler for non-React errors
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global error:', { message, source, lineno, colno, error })
}

// Handle unhandled promise rejections
window.onunhandledrejection = (event) => {
  console.error('Unhandled promise rejection:', event.reason)
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
