import { useMemo, useRef, useEffect } from 'react'
import { GitBranch, ExternalLink, Link2 } from 'lucide-react'
import { Note } from '../../types'

/**
 * GraphPanel - Mini knowledge graph view for sidebar
 *
 * Shows connected notes and link statistics.
 * Compact view that can open full graph modal.
 */

interface GraphPanelProps {
  notes: Note[]
  projects: unknown[]  // Reserved for future project-scoped filtering
  onSelectNote: (id: string) => void
  onOpenFullGraph?: () => void
  variant: 'compact' | 'card'
}

interface GraphStats {
  totalNotes: number
  notesWithLinks: number
  totalLinks: number
  orphanNotes: number
  mostConnected: Array<{ id: string; title: string; linkCount: number }>
}

export function GraphPanel({
  notes,
  projects: _projects,  // eslint-disable-line @typescript-eslint/no-unused-vars
  onSelectNote,
  onOpenFullGraph,
  variant
}: GraphPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Build graph statistics
  const graphStats = useMemo((): GraphStats => {
    const activeNotes = notes.filter(n => !n.deleted_at)
    const linkCounts: Record<string, number> = {}
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g

    // Initialize counts
    activeNotes.forEach(n => {
      linkCounts[n.id] = 0
    })

    // Count outgoing and incoming links
    let totalLinks = 0
    activeNotes.forEach(note => {
      let match
      while ((match = wikiLinkRegex.exec(note.content)) !== null) {
        const targetTitle = match[1]
        const targetNote = activeNotes.find(n =>
          n.title?.toLowerCase() === targetTitle.toLowerCase()
        )
        if (targetNote && targetNote.id !== note.id) {
          linkCounts[note.id]++
          linkCounts[targetNote.id]++
          totalLinks++
        }
      }
    })

    // Calculate stats
    const notesWithLinks = Object.values(linkCounts).filter(c => c > 0).length
    const orphanNotes = activeNotes.length - notesWithLinks

    // Get most connected notes
    const mostConnected = activeNotes
      .map(n => ({
        id: n.id,
        title: n.title || 'Untitled',
        linkCount: linkCounts[n.id] || 0
      }))
      .filter(n => n.linkCount > 0)
      .sort((a, b) => b.linkCount - a.linkCount)
      .slice(0, 5)

    return {
      totalNotes: activeNotes.length,
      notesWithLinks,
      totalLinks,
      orphanNotes,
      mostConnected
    }
  }, [notes])

  // Draw mini graph visualization
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Get active notes with links for visualization
    const activeNotes = notes.filter(n => !n.deleted_at)
    const nodesToDraw = Math.min(activeNotes.length, 20)

    if (nodesToDraw === 0) return

    // Draw connections as lines
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)'
    ctx.lineWidth = 1

    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g
    const nodePositions: Array<{ x: number; y: number; note: Note }> = []

    // Calculate node positions in a circle
    activeNotes.slice(0, nodesToDraw).forEach((note, i) => {
      const angle = (i / nodesToDraw) * Math.PI * 2
      const radius = Math.min(width, height) * 0.35
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      nodePositions.push({ x, y, note })
    })

    // Draw edges
    nodePositions.forEach(({ note, x, y }) => {
      let match
      const content = note.content || ''
      while ((match = wikiLinkRegex.exec(content)) !== null) {
        const targetTitle = match[1]
        const targetPos = nodePositions.find(p =>
          p.note.title?.toLowerCase() === targetTitle.toLowerCase()
        )
        if (targetPos) {
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(targetPos.x, targetPos.y)
          ctx.stroke()
        }
      }
    })

    // Draw nodes
    nodePositions.forEach(({ x, y }) => {
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(139, 92, 246, 0.6)'
      ctx.fill()
    })

    // Draw center node (current context)
    ctx.beginPath()
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(139, 92, 246, 0.9)'
    ctx.fill()

  }, [notes])

  const isCompact = variant === 'compact'

  return (
    <div className="graph-panel">
      {/* Header */}
      <div className="graph-panel-header">
        <div className="graph-header-left">
          <GitBranch size={16} className="graph-icon" />
          <span className="graph-title">Knowledge Graph</span>
        </div>
        {onOpenFullGraph && (
          <button
            className="graph-expand-btn"
            onClick={onOpenFullGraph}
            title="Open full graph (⌘⇧G)"
          >
            <ExternalLink size={14} />
          </button>
        )}
      </div>

      {/* Mini visualization */}
      <div className="graph-preview">
        <canvas
          ref={canvasRef}
          width={isCompact ? 180 : 260}
          height={isCompact ? 120 : 160}
          className="graph-canvas"
        />
      </div>

      {/* Stats */}
      <div className="graph-stats">
        <div className="stat-item">
          <span className="stat-value">{graphStats.totalNotes}</span>
          <span className="stat-label">Notes</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{graphStats.totalLinks}</span>
          <span className="stat-label">Links</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{graphStats.orphanNotes}</span>
          <span className="stat-label">Orphans</span>
        </div>
      </div>

      {/* Most connected notes */}
      {graphStats.mostConnected.length > 0 && (
        <div className="graph-connected">
          <h4 className="connected-header">
            <Link2 size={12} />
            <span>Most Connected</span>
          </h4>
          <div className="connected-list">
            {graphStats.mostConnected.slice(0, isCompact ? 3 : 5).map(note => (
              <button
                key={note.id}
                className="connected-item"
                onClick={() => onSelectNote(note.id)}
              >
                <span className="connected-title">{note.title}</span>
                <span className="connected-count">{note.linkCount}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {graphStats.totalNotes === 0 && (
        <div className="graph-empty">
          <span className="empty-text">No notes yet</span>
        </div>
      )}

      {graphStats.totalNotes > 0 && graphStats.notesWithLinks === 0 && (
        <div className="graph-hint">
          <span>Use [[wiki links]] to connect notes</span>
        </div>
      )}

      {/* Footer */}
      {onOpenFullGraph && graphStats.notesWithLinks > 0 && (
        <button className="graph-open-full" onClick={onOpenFullGraph}>
          <ExternalLink size={12} />
          <span>Open Full Graph</span>
        </button>
      )}
    </div>
  )
}
