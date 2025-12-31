import type { RExecutionResult } from '../lib/api'

/**
 * ROutputDisplay - Display R execution results inline
 *
 * Features:
 * - stdout/stderr text output
 * - Base64 plot rendering
 * - Collapsible sections
 * - Error highlighting
 *
 * See: PLAN-HYBRID-EDITOR.md (Week 3: Inline Output Display)
 */

interface ROutputDisplayProps {
  result: RExecutionResult | null
  onClear?: () => void
}

export function ROutputDisplay({ result, onClear }: ROutputDisplayProps) {
  if (!result) {
    return null
  }

  const hasStdout = result.stdout.length > 0
  const hasStderr = result.stderr.length > 0
  const hasPlots = result.plots.length > 0
  const hasError = !result.success || result.error

  return (
    <div className="border-t border-nexus-border bg-nexus-bg-tertiary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-nexus-bg-secondary border-b border-nexus-border">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${hasError ? 'bg-red-500' : 'bg-green-500'}`} />
          <span className="text-xs font-semibold text-nexus-text-primary">
            {hasError ? 'Execution Failed' : 'Output'}
          </span>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="text-xs text-nexus-text-muted hover:text-nexus-text-primary transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-auto p-4 space-y-4">
        {/* Error Message */}
        {result.error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded p-3">
            <div className="text-xs font-semibold text-red-400 mb-1">Error:</div>
            <pre className="text-xs text-red-300 font-mono whitespace-pre-wrap">{result.error}</pre>
          </div>
        )}

        {/* stderr */}
        {hasStderr && (
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3">
            <div className="text-xs font-semibold text-yellow-400 mb-1">Warnings/Messages:</div>
            <pre className="text-xs text-yellow-300 font-mono whitespace-pre-wrap">{result.stderr}</pre>
          </div>
        )}

        {/* stdout */}
        {hasStdout && (
          <div className="bg-nexus-bg-primary border border-nexus-border rounded p-3">
            <div className="text-xs font-semibold text-nexus-text-primary mb-1">Output:</div>
            <pre className="text-xs text-nexus-text-primary font-mono whitespace-pre-wrap">{result.stdout}</pre>
          </div>
        )}

        {/* Plots */}
        {hasPlots && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-nexus-text-primary">
              Plots ({result.plots.length}):
            </div>
            <div className="grid grid-cols-1 gap-4">
              {result.plots.map((plot, index) => (
                <div key={index} className="bg-white rounded p-2">
                  <img
                    src={`data:image/png;base64,${plot}`}
                    alt={`Plot ${index + 1}`}
                    className="w-full h-auto"
                  />
                  <div className="text-xs text-gray-600 mt-1 text-center">
                    Plot {index + 1} of {result.plots.length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasStdout && !hasStderr && !hasPlots && !hasError && (
          <div className="text-center text-nexus-text-muted text-xs py-4">
            No output generated
          </div>
        )}
      </div>
    </div>
  )
}
