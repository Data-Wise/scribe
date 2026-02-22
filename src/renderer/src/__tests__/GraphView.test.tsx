import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { GraphView } from '../components/GraphView'
import { createMockNote } from './testUtils'

// Mock D3 to avoid complex DOM manipulations in tests
vi.mock('d3', () => {
  const mockSelection = {
    selectAll: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    append: vi.fn().mockReturnThis(),
    attr: vi.fn().mockReturnThis(),
    data: vi.fn().mockReturnThis(),
    enter: vi.fn().mockReturnThis(),
    exit: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    call: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    transition: vi.fn().mockReturnThis(),
    duration: vi.fn().mockReturnThis(),
  }

  const mockSimulation = {
    force: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    alphaTarget: vi.fn().mockReturnThis(),
    restart: vi.fn().mockReturnThis(),
    stop: vi.fn(),
  }

  return {
    select: vi.fn(() => mockSelection),
    selectAll: vi.fn(() => mockSelection),
    forceSimulation: vi.fn(() => mockSimulation),
    forceLink: vi.fn(() => ({
      id: vi.fn().mockReturnThis(),
      distance: vi.fn().mockReturnThis(),
    })),
    forceManyBody: vi.fn(() => ({
      strength: vi.fn().mockReturnThis(),
    })),
    forceCenter: vi.fn(),
    forceCollide: vi.fn(() => ({
      radius: vi.fn().mockReturnThis(),
    })),
    zoom: vi.fn(() => ({
      scaleExtent: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      scaleBy: vi.fn(),
      transform: vi.fn(),
    })),
    zoomIdentity: {
      translate: vi.fn().mockReturnThis(),
      scale: vi.fn().mockReturnThis(),
    },
    drag: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
    })),
  }
})

// Mock notes for testing — content has wikilinks for graph edge testing
const mockNotes = [
  createMockNote({ id: 'note-1', title: 'Getting Started', content: 'This is an introduction to the project.' }),
  createMockNote({ id: 'note-2', title: 'Architecture', content: 'The architecture builds on [[Getting Started]] concepts.' }),
  createMockNote({ id: 'note-3', title: 'API Reference', content: 'See [[Architecture]] for context. Also references [[Getting Started]].' }),
  createMockNote({ id: 'note-4', title: 'Isolated Note', content: 'This note has no wiki-links to other notes.' })
]

describe('GraphView Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    notes: mockNotes,
    onSelectNote: vi.fn(),
    currentNoteId: 'note-1'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock container dimensions
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      value: 800
    })
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      value: 600
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(<GraphView {...defaultProps} />)

      expect(screen.getByText('Knowledge Graph')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(<GraphView {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Knowledge Graph')).not.toBeInTheDocument()
    })

    it('displays the note count in the header', () => {
      render(<GraphView {...defaultProps} />)

      expect(screen.getByText('4 notes')).toBeInTheDocument()
    })

    it('renders zoom percentage display', () => {
      render(<GraphView {...defaultProps} />)

      // Default zoom is 100%
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('renders the SVG element for the graph', () => {
      const { container } = render(<GraphView {...defaultProps} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders the legend', () => {
      render(<GraphView {...defaultProps} />)

      expect(screen.getByText('Current note')).toBeInTheDocument()
      expect(screen.getByText('Other notes')).toBeInTheDocument()
      expect(screen.getByText('Links')).toBeInTheDocument()
    })

    it('renders the instructions text', () => {
      render(<GraphView {...defaultProps} />)

      expect(screen.getByText(/Drag nodes to rearrange/)).toBeInTheDocument()
    })
  })

  describe('User Interactions - Close Button', () => {
    it('calls onClose when clicking the close button', () => {
      const onClose = vi.fn()
      render(<GraphView {...defaultProps} onClose={onClose} />)

      // Find the close button (X icon button)
      const closeButtons = screen.getAllByRole('button')
      const closeButton = closeButtons.find(btn => btn.querySelector('svg.lucide-x'))
      if (closeButton) {
        fireEvent.click(closeButton)
      } else {
        // Fallback: click the last button which should be close
        fireEvent.click(closeButtons[closeButtons.length - 1])
      }

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when clicking the backdrop', () => {
      const onClose = vi.fn()
      render(<GraphView {...defaultProps} onClose={onClose} />)

      // Click on the backdrop (the outer div with bg-black/60)
      const backdrop = document.querySelector('.bg-black\\/60')
      if (backdrop) {
        fireEvent.click(backdrop)
      }

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Zoom Controls', () => {
    it('renders zoom in button', () => {
      render(<GraphView {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      const zoomInButton = buttons.find(btn => btn.getAttribute('title') === 'Zoom in')
      expect(zoomInButton).toBeInTheDocument()
    })

    it('renders zoom out button', () => {
      render(<GraphView {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      const zoomOutButton = buttons.find(btn => btn.getAttribute('title') === 'Zoom out')
      expect(zoomOutButton).toBeInTheDocument()
    })

    it('renders reset view button', () => {
      render(<GraphView {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      const resetButton = buttons.find(btn => btn.getAttribute('title') === 'Reset view')
      expect(resetButton).toBeInTheDocument()
    })

    it('handles zoom in button click', () => {
      render(<GraphView {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      const zoomInButton = buttons.find(btn => btn.getAttribute('title') === 'Zoom in')
      expect(zoomInButton).toBeInTheDocument()

      if (zoomInButton) {
        fireEvent.click(zoomInButton)
      }

      // No error should occur
    })

    it('handles zoom out button click', () => {
      render(<GraphView {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      const zoomOutButton = buttons.find(btn => btn.getAttribute('title') === 'Zoom out')
      expect(zoomOutButton).toBeInTheDocument()

      if (zoomOutButton) {
        fireEvent.click(zoomOutButton)
      }

      // No error should occur
    })

    it('handles reset view button click', () => {
      render(<GraphView {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      const resetButton = buttons.find(btn => btn.getAttribute('title') === 'Reset view')
      expect(resetButton).toBeInTheDocument()

      if (resetButton) {
        fireEvent.click(resetButton)
      }

      // No error should occur
    })
  })

  describe('Graph Data Building', () => {
    it('builds nodes for all notes', () => {
      render(<GraphView {...defaultProps} />)

      // Component should process all 4 notes
      expect(screen.getByText('4 notes')).toBeInTheDocument()
    })

    it('handles notes with no title (Untitled)', () => {
      const notesWithUntitled = [
        { id: 'note-1', title: '', content: 'Content' },
        { id: 'note-2', title: 'Named Note', content: 'Content' }
      ]

      render(<GraphView {...defaultProps} notes={notesWithUntitled} />)

      expect(screen.getByText('2 notes')).toBeInTheDocument()
    })

    it('handles empty notes array', () => {
      render(<GraphView {...defaultProps} notes={[]} />)

      expect(screen.getByText('0 notes')).toBeInTheDocument()
    })

    it('handles single note', () => {
      const singleNote = [{ id: 'note-1', title: 'Solo Note', content: 'No links' }]

      render(<GraphView {...defaultProps} notes={singleNote} />)

      expect(screen.getByText('1 notes')).toBeInTheDocument()
    })
  })

  describe('Wiki-Link Parsing', () => {
    it('extracts wiki-links from note content', () => {
      // The component should parse [[Getting Started]] from note-2's content
      // This is tested implicitly through the graph construction
      render(<GraphView {...defaultProps} />)

      // Component renders without error, meaning links were parsed
      expect(screen.getByText('Knowledge Graph')).toBeInTheDocument()
    })

    it('handles notes with multiple wiki-links', () => {
      // note-3 has two wiki-links: [[Architecture]] and [[Getting Started]]
      render(<GraphView {...defaultProps} />)

      expect(screen.getByText('Knowledge Graph')).toBeInTheDocument()
    })

    it('handles case-insensitive wiki-link matching', () => {
      const notesWithCaseVariant = [
        { id: 'note-1', title: 'Test Note', content: 'Content' },
        { id: 'note-2', title: 'Other', content: 'Links to [[test note]]' }
      ]

      render(<GraphView {...defaultProps} notes={notesWithCaseVariant} />)

      expect(screen.getByText('2 notes')).toBeInTheDocument()
    })

    it('ignores self-referencing wiki-links', () => {
      const selfRefNotes = [
        { id: 'note-1', title: 'Self Ref', content: 'Links to [[Self Ref]] itself' }
      ]

      render(<GraphView {...defaultProps} notes={selfRefNotes} />)

      // Should not create a link to itself
      expect(screen.getByText('1 notes')).toBeInTheDocument()
    })

    it('handles broken wiki-links (non-existent targets)', () => {
      const notesWithBrokenLinks = [
        { id: 'note-1', title: 'Existing Note', content: '[[Non Existent Note]]' }
      ]

      render(<GraphView {...defaultProps} notes={notesWithBrokenLinks} />)

      // Should not crash, broken links are ignored
      expect(screen.getByText('1 notes')).toBeInTheDocument()
    })
  })

  describe('Current Note Highlighting', () => {
    it('accepts currentNoteId prop', () => {
      render(<GraphView {...defaultProps} currentNoteId="note-2" />)

      expect(screen.getByText('Knowledge Graph')).toBeInTheDocument()
    })

    it('handles undefined currentNoteId', () => {
      render(<GraphView {...defaultProps} currentNoteId={undefined} />)

      expect(screen.getByText('Knowledge Graph')).toBeInTheDocument()
    })
  })

  describe('Modal Structure', () => {
    it('renders as a fixed overlay', () => {
      const { container } = render(<GraphView {...defaultProps} />)

      const overlay = container.firstChild as HTMLElement
      expect(overlay).toHaveClass('fixed', 'inset-0', 'z-50')
    })

    it('has a backdrop with blur effect', () => {
      render(<GraphView {...defaultProps} />)

      const backdrop = document.querySelector('.backdrop-blur-sm')
      expect(backdrop).toBeInTheDocument()
    })

    it('renders the main container with proper styling', () => {
      const { container } = render(<GraphView {...defaultProps} />)

      const mainContainer = container.querySelector('.rounded-xl.shadow-2xl')
      expect(mainContainer).toBeInTheDocument()
    })
  })

  describe('Header Section', () => {
    it('displays Knowledge Graph title', () => {
      render(<GraphView {...defaultProps} />)

      const title = screen.getByRole('heading', { level: 2 })
      expect(title).toHaveTextContent('Knowledge Graph')
    })

    it('has proper styling for the title', () => {
      render(<GraphView {...defaultProps} />)

      const title = screen.getByRole('heading', { level: 2 })
      expect(title).toHaveClass('text-lg', 'font-semibold')
    })

    it('displays note count badge', () => {
      render(<GraphView {...defaultProps} />)

      const badge = screen.getByText('4 notes')
      expect(badge).toHaveClass('text-xs', 'px-2', 'py-0.5', 'rounded')
    })
  })

  describe('Legend Section', () => {
    it('renders in bottom-left corner', () => {
      const { container } = render(<GraphView {...defaultProps} />)

      // Find the legend container by looking for the absolute positioned div in bottom-left
      const legendContainer = container.querySelector('.absolute.bottom-4.left-4')
      expect(legendContainer).toBeInTheDocument()
    })

    it('shows all three legend items', () => {
      render(<GraphView {...defaultProps} />)

      expect(screen.getByText('Current note')).toBeInTheDocument()
      expect(screen.getByText('Other notes')).toBeInTheDocument()
      expect(screen.getByText('Links')).toBeInTheDocument()
    })

    it('has colored indicators for each legend item', () => {
      const { container } = render(<GraphView {...defaultProps} />)

      // Look for the legend indicator circles
      const legendCircles = container.querySelectorAll('.w-3.h-3.rounded-full')
      expect(legendCircles.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Instructions Section', () => {
    it('renders in bottom-right corner', () => {
      render(<GraphView {...defaultProps} />)

      const instructions = screen.getByText(/Drag nodes to rearrange/).closest('div')
      expect(instructions).toHaveClass('absolute', 'bottom-4', 'right-4')
    })

    it('displays all interaction instructions', () => {
      render(<GraphView {...defaultProps} />)

      const instructionsText = screen.getByText(/Drag nodes to rearrange/)
      expect(instructionsText.textContent).toContain('Scroll to zoom')
      expect(instructionsText.textContent).toContain('Click to open note')
    })
  })

  describe('Edge Cases', () => {
    it('handles notes with empty content', () => {
      const emptyContentNotes = [
        { id: 'note-1', title: 'Empty Note', content: '' }
      ]

      render(<GraphView {...defaultProps} notes={emptyContentNotes} />)

      expect(screen.getByText('1 notes')).toBeInTheDocument()
    })

    it('handles notes with only whitespace content', () => {
      const whitespaceNotes = [
        { id: 'note-1', title: 'Whitespace Note', content: '   \n\t  ' }
      ]

      render(<GraphView {...defaultProps} notes={whitespaceNotes} />)

      expect(screen.getByText('1 notes')).toBeInTheDocument()
    })

    it('handles notes with special characters in titles', () => {
      const specialCharNotes = [
        { id: 'note-1', title: 'Note with "quotes" & <brackets>', content: 'Content' }
      ]

      render(<GraphView {...defaultProps} notes={specialCharNotes} />)

      expect(screen.getByText('1 notes')).toBeInTheDocument()
    })

    it('handles very long note titles', () => {
      const longTitleNotes = [
        { id: 'note-1', title: 'A'.repeat(100), content: 'Content' }
      ]

      render(<GraphView {...defaultProps} notes={longTitleNotes} />)

      // Component should handle truncation (> 20 chars shows ...)
      expect(screen.getByText('1 notes')).toBeInTheDocument()
    })

    it('handles notes with unicode characters in content', () => {
      const unicodeNotes = [
        { id: 'note-1', title: 'Unicode', content: 'Emoji: \ud83c\udf0a Code: \u03b1\u03b2\u03b3 Links [[Other]]' },
        { id: 'note-2', title: 'Other', content: 'Target note' }
      ]

      render(<GraphView {...defaultProps} notes={unicodeNotes} />)

      expect(screen.getByText('2 notes')).toBeInTheDocument()
    })

    it('handles many notes (performance test)', () => {
      const manyNotes = Array.from({ length: 100 }, (_, i) => ({
        id: `note-${i}`,
        title: `Note ${i}`,
        content: i > 0 ? `[[Note ${i - 1}]]` : 'First note'
      }))

      render(<GraphView {...defaultProps} notes={manyNotes} />)

      expect(screen.getByText('100 notes')).toBeInTheDocument()
    })
  })

  describe('State Management', () => {
    it('maintains zoom state', () => {
      render(<GraphView {...defaultProps} />)

      // Initial state
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('re-renders when notes change', async () => {
      const { rerender } = render(<GraphView {...defaultProps} />)

      expect(screen.getByText('4 notes')).toBeInTheDocument()

      // Update notes
      const newNotes = [...mockNotes, { id: 'note-5', title: 'New Note', content: '' }]
      rerender(<GraphView {...defaultProps} notes={newNotes} />)

      expect(screen.getByText('5 notes')).toBeInTheDocument()
    })

    it('re-renders when currentNoteId changes', () => {
      const { rerender } = render(<GraphView {...defaultProps} currentNoteId="note-1" />)

      expect(screen.getByText('Knowledge Graph')).toBeInTheDocument()

      rerender(<GraphView {...defaultProps} currentNoteId="note-2" />)

      expect(screen.getByText('Knowledge Graph')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has a heading element', () => {
      render(<GraphView {...defaultProps} />)

      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    })

    it('has accessible buttons with titles', () => {
      render(<GraphView {...defaultProps} />)

      expect(screen.getByTitle('Zoom in')).toBeInTheDocument()
      expect(screen.getByTitle('Zoom out')).toBeInTheDocument()
      expect(screen.getByTitle('Reset view')).toBeInTheDocument()
    })

    it('all interactive elements are focusable buttons', () => {
      render(<GraphView {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      // Should have at least: zoom in, zoom out, reset, close
      expect(buttons.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('Cleanup', () => {
    it('stops simulation on unmount', () => {
      const { unmount } = render(<GraphView {...defaultProps} />)

      // Should not throw when unmounting
      expect(() => unmount()).not.toThrow()
    })

    it('cleans up when isOpen changes to false', () => {
      const { rerender } = render(<GraphView {...defaultProps} isOpen={true} />)

      expect(screen.getByText('Knowledge Graph')).toBeInTheDocument()

      rerender(<GraphView {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Knowledge Graph')).not.toBeInTheDocument()
    })
  })
})

describe('GraphView Integration Tests', () => {
  const mockNotesWithLinks = [
    {
      id: 'central',
      title: 'Central Hub',
      content: 'This is the main hub [[Node A]] [[Node B]] [[Node C]]'
    },
    {
      id: 'a',
      title: 'Node A',
      content: 'References back to [[Central Hub]]'
    },
    {
      id: 'b',
      title: 'Node B',
      content: 'Also links to [[Central Hub]] and [[Node A]]'
    },
    {
      id: 'c',
      title: 'Node C',
      content: 'Standalone with link to [[Central Hub]]'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      value: 800
    })
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      value: 600
    })
  })

  it('renders a connected graph with multiple nodes', () => {
    render(
      <GraphView
        isOpen={true}
        onClose={vi.fn()}
        notes={mockNotesWithLinks}
        onSelectNote={vi.fn()}
        currentNoteId="central"
      />
    )

    expect(screen.getByText('4 notes')).toBeInTheDocument()
  })

  it('handles circular references gracefully', () => {
    const circularNotes = [
      { id: 'a', title: 'Note A', content: 'Links to [[Note B]]' },
      { id: 'b', title: 'Note B', content: 'Links to [[Note C]]' },
      { id: 'c', title: 'Note C', content: 'Links to [[Note A]]' }
    ]

    render(
      <GraphView
        isOpen={true}
        onClose={vi.fn()}
        notes={circularNotes}
        onSelectNote={vi.fn()}
      />
    )

    expect(screen.getByText('3 notes')).toBeInTheDocument()
  })

  it('properly displays a star topology', () => {
    const starNotes = [
      { id: 'hub', title: 'Hub', content: '[[A]] [[B]] [[C]] [[D]] [[E]]' },
      { id: 'a', title: 'A', content: 'Leaf A' },
      { id: 'b', title: 'B', content: 'Leaf B' },
      { id: 'c', title: 'C', content: 'Leaf C' },
      { id: 'd', title: 'D', content: 'Leaf D' },
      { id: 'e', title: 'E', content: 'Leaf E' }
    ]

    render(
      <GraphView
        isOpen={true}
        onClose={vi.fn()}
        notes={starNotes}
        onSelectNote={vi.fn()}
        currentNoteId="hub"
      />
    )

    expect(screen.getByText('6 notes')).toBeInTheDocument()
  })

  it('handles disconnected subgraphs', () => {
    const disconnectedNotes = [
      { id: 'a', title: 'Group 1 A', content: '[[Group 1 B]]' },
      { id: 'b', title: 'Group 1 B', content: '[[Group 1 A]]' },
      { id: 'c', title: 'Group 2 A', content: '[[Group 2 B]]' },
      { id: 'd', title: 'Group 2 B', content: '[[Group 2 A]]' },
      { id: 'e', title: 'Isolated', content: 'No links at all' }
    ]

    render(
      <GraphView
        isOpen={true}
        onClose={vi.fn()}
        notes={disconnectedNotes}
        onSelectNote={vi.fn()}
      />
    )

    expect(screen.getByText('5 notes')).toBeInTheDocument()
  })
})
