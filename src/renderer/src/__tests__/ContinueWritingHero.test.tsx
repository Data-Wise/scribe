import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ContinueWritingHero } from '../components/ContinueWritingHero'
import { Note, Project } from '../types'

// ============================================================
// Test Data
// ============================================================

const mockNote: Note = {
  id: 'note-1',
  title: 'Chapter 3 - Methods',
  content: 'This is the methods section with some **markdown** content.\n\nIt has multiple paragraphs and approximately twenty words total.',
  folder: '/research',
  created_at: Date.now() - 86400000, // 1 day ago
  updated_at: Date.now() - 3600000,  // 1 hour ago
  deleted_at: null,
  properties: {
    project_id: { key: 'project_id', value: 'project-1', type: 'text' },
  },
}

const mockProject: Project = {
  id: 'project-1',
  name: 'Mediation Analysis',
  type: 'research',
  color: '#8b5cf6', // Purple
  created_at: Date.now() - 604800000, // 1 week ago
  updated_at: Date.now() - 3600000,
}

// ============================================================
// ContinueWritingHero Component Tests
// ============================================================

describe('ContinueWritingHero Component', () => {
  const mockOnContinue = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders nothing when note is null', () => {
      const { container } = render(
        <ContinueWritingHero
          note={null}
          project={null}
          onContinue={mockOnContinue}
        />
      )
      expect(container.firstChild).toBeNull()
    })

    it('renders hero when note is provided', () => {
      render(
        <ContinueWritingHero
          note={mockNote}
          project={mockProject}
          onContinue={mockOnContinue}
        />
      )
      expect(screen.getByText('Continue Writing')).toBeInTheDocument()
      expect(screen.getByText('Chapter 3 - Methods')).toBeInTheDocument()
    })

    it('displays note title', () => {
      render(
        <ContinueWritingHero
          note={mockNote}
          project={mockProject}
          onContinue={mockOnContinue}
        />
      )
      expect(screen.getByText('Chapter 3 - Methods')).toBeInTheDocument()
    })

    it('displays "Untitled" for notes without title', () => {
      const untitledNote = { ...mockNote, title: '' }
      render(
        <ContinueWritingHero
          note={untitledNote}
          project={mockProject}
          onContinue={mockOnContinue}
        />
      )
      expect(screen.getByText('Untitled')).toBeInTheDocument()
    })

    it('displays project name when project is provided', () => {
      render(
        <ContinueWritingHero
          note={mockNote}
          project={mockProject}
          onContinue={mockOnContinue}
        />
      )
      expect(screen.getByText('Mediation Analysis')).toBeInTheDocument()
    })

    it('does not display project name when project is null', () => {
      render(
        <ContinueWritingHero
          note={mockNote}
          project={null}
          onContinue={mockOnContinue}
        />
      )
      expect(screen.queryByText('Mediation Analysis')).not.toBeInTheDocument()
    })

    it('displays word count', () => {
      render(
        <ContinueWritingHero
          note={mockNote}
          project={mockProject}
          onContinue={mockOnContinue}
        />
      )
      // Word count should be present (actual count may vary based on content parsing)
      expect(screen.getByText(/words$/)).toBeInTheDocument()
    })

    it('displays time ago', () => {
      render(
        <ContinueWritingHero
          note={mockNote}
          project={mockProject}
          onContinue={mockOnContinue}
        />
      )
      // Should show "1h ago" for a note updated 1 hour ago
      expect(screen.getByText('1h ago')).toBeInTheDocument()
    })

    it('displays keyboard hint', () => {
      render(
        <ContinueWritingHero
          note={mockNote}
          project={mockProject}
          onContinue={mockOnContinue}
        />
      )
      expect(screen.getByText('Enter')).toBeInTheDocument()
      expect(screen.getByText(/click to continue/)).toBeInTheDocument()
    })
  })

  describe('Interaction', () => {
    it('calls onContinue when clicked', () => {
      render(
        <ContinueWritingHero
          note={mockNote}
          project={mockProject}
          onContinue={mockOnContinue}
        />
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockOnContinue).toHaveBeenCalledTimes(1)
    })

    it('is keyboard accessible', () => {
      render(
        <ContinueWritingHero
          note={mockNote}
          project={mockProject}
          onContinue={mockOnContinue}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      // Button should be focusable
      button.focus()
      expect(document.activeElement).toBe(button)
    })
  })

  describe('Styling', () => {
    it('uses project color for accent', () => {
      const { container } = render(
        <ContinueWritingHero
          note={mockNote}
          project={mockProject}
          onContinue={mockOnContinue}
        />
      )

      const button = container.querySelector('button')
      expect(button).toHaveStyle({
        borderColor: '#8b5cf640', // Purple with 40% opacity
        backgroundColor: '#8b5cf608', // Purple with 8% opacity
      })
    })

    it('uses default color when project is null', () => {
      const { container } = render(
        <ContinueWritingHero
          note={mockNote}
          project={null}
          onContinue={mockOnContinue}
        />
      )

      const button = container.querySelector('button')
      // Default color is #38bdf8 (sky blue)
      expect(button).toHaveStyle({
        borderColor: '#38bdf840',
        backgroundColor: '#38bdf808',
      })
    })

    it('shows project color dot when project exists', () => {
      const { container } = render(
        <ContinueWritingHero
          note={mockNote}
          project={mockProject}
          onContinue={mockOnContinue}
        />
      )

      const colorDot = container.querySelector('.rounded-full')
      expect(colorDot).toHaveStyle({
        backgroundColor: '#8b5cf6',
      })
    })
  })

  describe('Time Formatting', () => {
    it('shows "just now" for very recent updates', () => {
      const recentNote = { ...mockNote, updated_at: Date.now() - 30000 } // 30 seconds ago
      render(
        <ContinueWritingHero
          note={recentNote}
          project={mockProject}
          onContinue={mockOnContinue}
        />
      )
      expect(screen.getByText('just now')).toBeInTheDocument()
    })

    it('shows minutes for updates < 1 hour', () => {
      const note = { ...mockNote, updated_at: Date.now() - 1800000 } // 30 minutes ago
      render(
        <ContinueWritingHero
          note={note}
          project={mockProject}
          onContinue={mockOnContinue}
        />
      )
      expect(screen.getByText('30m ago')).toBeInTheDocument()
    })

    it('shows hours for updates < 24 hours', () => {
      const note = { ...mockNote, updated_at: Date.now() - 7200000 } // 2 hours ago
      render(
        <ContinueWritingHero
          note={note}
          project={mockProject}
          onContinue={mockOnContinue}
        />
      )
      expect(screen.getByText('2h ago')).toBeInTheDocument()
    })

    it('shows "yesterday" for updates 1 day ago', () => {
      const note = { ...mockNote, updated_at: Date.now() - 86400000 } // 1 day ago
      render(
        <ContinueWritingHero
          note={note}
          project={mockProject}
          onContinue={mockOnContinue}
        />
      )
      expect(screen.getByText('yesterday')).toBeInTheDocument()
    })

    it('shows days for updates < 7 days', () => {
      const note = { ...mockNote, updated_at: Date.now() - 259200000 } // 3 days ago
      render(
        <ContinueWritingHero
          note={note}
          project={mockProject}
          onContinue={mockOnContinue}
        />
      )
      expect(screen.getByText('3d ago')).toBeInTheDocument()
    })
  })

  describe('Word Count', () => {
    it('counts words correctly for simple content', () => {
      const simpleNote = { ...mockNote, content: 'one two three four five' }
      render(
        <ContinueWritingHero
          note={simpleNote}
          project={mockProject}
          onContinue={mockOnContinue}
        />
      )
      expect(screen.getByText('5 words')).toBeInTheDocument()
    })

    it('handles empty content', () => {
      const emptyNote = { ...mockNote, content: '' }
      render(
        <ContinueWritingHero
          note={emptyNote}
          project={mockProject}
          onContinue={mockOnContinue}
        />
      )
      expect(screen.getByText('0 words')).toBeInTheDocument()
    })

    it('strips markdown syntax from word count', () => {
      const markdownNote = {
        ...mockNote,
        content: '# Heading\n\n**bold** and *italic* text here'
      }
      render(
        <ContinueWritingHero
          note={markdownNote}
          project={mockProject}
          onContinue={mockOnContinue}
        />
      )
      // Should count: Heading, bold, and, italic, text, here = 6 words
      expect(screen.getByText('6 words')).toBeInTheDocument()
    })

    it('excludes code blocks from word count', () => {
      const codeNote = {
        ...mockNote,
        content: 'text before\n```\ncode block content\n```\ntext after'
      }
      render(
        <ContinueWritingHero
          note={codeNote}
          project={mockProject}
          onContinue={mockOnContinue}
        />
      )
      // Should only count: text, before, text, after = 4 words
      expect(screen.getByText('4 words')).toBeInTheDocument()
    })

    it('formats large word counts with locale string', () => {
      const longNote = {
        ...mockNote,
        content: Array(1500).fill('word').join(' ')
      }
      render(
        <ContinueWritingHero
          note={longNote}
          project={mockProject}
          onContinue={mockOnContinue}
        />
      )
      expect(screen.getByText('1,500 words')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles note with no properties', () => {
      const noteWithoutProps = { ...mockNote, properties: undefined }
      render(
        <ContinueWritingHero
          note={noteWithoutProps}
          project={null}
          onContinue={mockOnContinue}
        />
      )
      expect(screen.getByText('Chapter 3 - Methods')).toBeInTheDocument()
    })

    it('handles project without color', () => {
      const projectWithoutColor = { ...mockProject, color: undefined }
      const { container } = render(
        <ContinueWritingHero
          note={mockNote}
          project={projectWithoutColor}
          onContinue={mockOnContinue}
        />
      )

      const button = container.querySelector('button')
      // Should fall back to default color #38bdf8
      expect(button).toHaveStyle({
        borderColor: '#38bdf840',
      })
    })

    it('handles very long note titles with truncation', () => {
      const longTitleNote = {
        ...mockNote,
        title: 'This is a very long note title that should be truncated when displayed in the hero component'
      }
      render(
        <ContinueWritingHero
          note={longTitleNote}
          project={mockProject}
          onContinue={mockOnContinue}
        />
      )

      const title = screen.getByText(longTitleNote.title)
      expect(title).toHaveClass('truncate')
    })
  })
})
