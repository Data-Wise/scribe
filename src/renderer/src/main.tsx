import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Global error logging for debugging blank screen
window.onerror = (message, source, lineno, colno, error) => {
  console.error('GLOBAL ERROR:', { message, source, lineno, colno, error });
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />
)
