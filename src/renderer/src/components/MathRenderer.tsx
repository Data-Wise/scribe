/**
 * MathRenderer - Renders LaTeX equations using MathJax 3
 *
 * Supports inline ($...$) and display ($$...$$) modes.
 * Shows error message for invalid LaTeX.
 */

import { useState, useEffect, useMemo } from 'react'
import { renderMath } from '../lib/mathjax'

interface MathRendererProps {
  tex: string
  display?: boolean
  className?: string
}

export function MathRenderer({ tex, display = false, className = '' }: MathRendererProps) {
  const [error, setError] = useState<string | null>(null)

  // Handle empty/undefined tex gracefully
  const safeTex = tex?.trim() || ''

  const html = useMemo(() => {
    // Don't try to render empty tex
    if (!safeTex) {
      return null
    }

    try {
      const rendered = renderMath(safeTex, display)
      setError(null)
      return rendered
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error'
      console.warn('[MathRenderer] Render error:', message, 'tex:', safeTex)
      setError(message)
      return null
    }
  }, [safeTex, display])

  // Don't render anything for empty tex
  if (!safeTex) {
    return null
  }

  if (error) {
    return (
      <span
        className={`math-error ${className}`}
        title={error}
        style={{
          color: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          padding: '2px 4px',
          borderRadius: '2px',
          fontFamily: 'monospace',
          fontSize: '0.9em',
        }}
      >
        {display ? `$$${safeTex}$$` : `$${safeTex}$`}
      </span>
    )
  }

  return (
    <span
      className={`${display ? 'math-block' : 'math-inline'} ${className}`}
      style={display ? {
        display: 'block',
        textAlign: 'center',
        margin: '1em 0',
      } : {
        display: 'inline',
      }}
      dangerouslySetInnerHTML={{ __html: html || '' }}
    />
  )
}

/**
 * InlineMath - Convenience component for inline math
 */
export function InlineMath({ tex, className }: { tex: string; className?: string }) {
  return <MathRenderer tex={tex} display={false} className={className} />
}

/**
 * BlockMath - Convenience component for display/block math
 */
export function BlockMath({ tex, className }: { tex: string; className?: string }) {
  return <MathRenderer tex={tex} display={true} className={className} />
}

export default MathRenderer
