/**
 * GraphView - Force-directed graph visualization of note connections
 *
 * Shows notes as nodes and wiki-links as edges.
 * Uses D3 force simulation for layout.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { X, ZoomIn, ZoomOut, Maximize2, RefreshCw } from 'lucide-react'

interface GraphNode {
  id: string
  title: string
  linkCount: number
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
}

interface GraphViewProps {
  isOpen: boolean
  onClose: () => void
  notes: Array<{
    id: string
    title: string
    content: string
  }>
  onSelectNote: (id: string) => void
  currentNoteId?: string
}

export function GraphView({
  isOpen,
  onClose,
  notes,
  onSelectNote,
  currentNoteId
}: GraphViewProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)

  // Build graph data from notes
  const buildGraphData = useCallback(() => {
    const nodes: GraphNode[] = []
    const links: GraphLink[] = []
    const nodeMap = new Map<string, GraphNode>()

    // Create nodes for all notes
    notes.forEach(note => {
      const node: GraphNode = {
        id: note.id,
        title: note.title || 'Untitled',
        linkCount: 0
      }
      nodes.push(node)
      nodeMap.set(note.id, node)
    })

    // Extract links from wiki-links in content
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g
    notes.forEach(note => {
      let match
      while ((match = wikiLinkRegex.exec(note.content)) !== null) {
        const targetTitle = match[1]
        // Find target note by title
        const targetNote = notes.find(n =>
          n.title.toLowerCase() === targetTitle.toLowerCase()
        )
        if (targetNote && targetNote.id !== note.id) {
          links.push({
            source: note.id,
            target: targetNote.id
          })
          // Increment link counts
          const sourceNode = nodeMap.get(note.id)
          const targetNode = nodeMap.get(targetNote.id)
          if (sourceNode) sourceNode.linkCount++
          if (targetNode) targetNode.linkCount++
        }
      }
    })

    return { nodes, links }
  }, [notes])

  // Initialize and update the graph
  useEffect(() => {
    if (!isOpen || !svgRef.current || !containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    const { nodes, links } = buildGraphData()

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    // Create a group for zoom/pan
    const g = svg.append('g')

    // Add zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
        setZoom(event.transform.k)
      })

    svg.call(zoomBehavior)

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links)
        .id(d => d.id)
        .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40))

    // Draw links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', 'var(--nexus-text-muted)')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1.5)

    // Draw nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        })
      )
      .on('click', (_, d) => {
        onSelectNote(d.id)
        onClose()
      })

    // Node circles
    node.append('circle')
      .attr('r', d => 8 + Math.min(d.linkCount * 2, 12))
      .attr('fill', d => d.id === currentNoteId ? 'var(--nexus-accent)' : 'var(--nexus-bg-tertiary)')
      .attr('stroke', d => d.id === currentNoteId ? 'var(--nexus-accent)' : 'var(--nexus-text-muted)')
      .attr('stroke-width', 2)

    // Node labels
    node.append('text')
      .text(d => d.title.length > 20 ? d.title.slice(0, 20) + '...' : d.title)
      .attr('x', 0)
      .attr('y', d => -(12 + Math.min(d.linkCount * 2, 12)))
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--nexus-text-primary)')
      .attr('font-size', '11px')
      .attr('font-family', 'var(--font-sans)')

    // Hover effects
    node.on('mouseenter', function() {
      d3.select(this).select('circle')
        .transition()
        .duration(150)
        .attr('stroke', 'var(--nexus-accent)')
        .attr('stroke-width', 3)
    })
    .on('mouseleave', function(_, d) {
      d3.select(this).select('circle')
        .transition()
        .duration(150)
        .attr('stroke', d.id === currentNoteId ? 'var(--nexus-accent)' : 'var(--nexus-text-muted)')
        .attr('stroke-width', 2)
    })

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x || 0)
        .attr('y1', d => (d.source as GraphNode).y || 0)
        .attr('x2', d => (d.target as GraphNode).x || 0)
        .attr('y2', d => (d.target as GraphNode).y || 0)

      node.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`)
    })

    // Cleanup
    return () => {
      simulation.stop()
    }
  }, [isOpen, notes, currentNoteId, buildGraphData, onSelectNote, onClose])

  // Zoom controls
  const handleZoomIn = () => {
    if (svgRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(
          d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
          1.5
        )
    }
  }

  const handleZoomOut = () => {
    if (svgRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(
          d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
          0.67
        )
    }
  }

  const handleResetZoom = () => {
    if (svgRef.current && containerRef.current) {
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      d3.select(svgRef.current)
        .transition()
        .duration(500)
        .call(
          d3.zoom<SVGSVGElement, unknown>().transform as any,
          d3.zoomIdentity.translate(width / 2, height / 2).scale(1).translate(-width / 2, -height / 2)
        )
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Graph container */}
      <div
        className="relative w-[90vw] h-[80vh] max-w-6xl rounded-xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--nexus-bg-primary)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--nexus-text-primary)' }}>
              Knowledge Graph
            </h2>
            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--nexus-bg-tertiary)', color: 'var(--nexus-text-muted)' }}>
              {notes.length} notes
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <div className="flex items-center gap-1 mr-4">
              <button
                onClick={handleZoomOut}
                className="p-1.5 rounded hover:bg-white/10 transition-colors"
                style={{ color: 'var(--nexus-text-muted)' }}
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs w-12 text-center" style={{ color: 'var(--nexus-text-muted)' }}>
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 rounded hover:bg-white/10 transition-colors"
                style={{ color: 'var(--nexus-text-muted)' }}
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1.5 rounded hover:bg-white/10 transition-colors ml-1"
                style={{ color: 'var(--nexus-text-muted)' }}
                title="Reset view"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-white/10 transition-colors"
              style={{ color: 'var(--nexus-text-muted)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Graph */}
        <div
          ref={containerRef}
          className="w-full h-[calc(100%-52px)]"
        >
          <svg ref={svgRef} className="w-full h-full" />
        </div>

        {/* Legend */}
        <div
          className="absolute bottom-4 left-4 p-3 rounded-lg text-xs"
          style={{ backgroundColor: 'var(--nexus-bg-secondary)', color: 'var(--nexus-text-muted)' }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--nexus-accent)' }} />
              <span>Current note</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: 'var(--nexus-text-muted)', backgroundColor: 'var(--nexus-bg-tertiary)' }} />
              <span>Other notes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5" style={{ backgroundColor: 'var(--nexus-text-muted)', opacity: 0.4 }} />
              <span>Links</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div
          className="absolute bottom-4 right-4 p-3 rounded-lg text-xs"
          style={{ backgroundColor: 'var(--nexus-bg-secondary)', color: 'var(--nexus-text-muted)' }}
        >
          Drag nodes to rearrange • Scroll to zoom • Click to open note
        </div>
      </div>
    </div>
  )
}

export default GraphView
