import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { HybridEditor } from '../components/HybridEditor'
import { Note, Tag } from '../types'

// Test utilities
const mockNote: Note = {
  id: '1',
  title: 'Test Note',
  content: 'Test content',
  folder: 'inbox',
  created_at: Date.now(),
  updated_at: Date.now(),
  deleted_at: null
}

const mockTag: Tag = {
  id: '1',
  name: 'important',
  color: '#ff0000',
  created_at: Date.now()
}

describe('HybridEditor Component', () => {
  const defaultProps = {
    content: 'Hello world',
    onChange: vi.fn(),
    onWikiLinkClick: vi.fn(),
    onTagClick: vi.fn(),
    onSearchNotes: vi.fn().mockResolvedValue([mockNote]),
    onSearchTags: vi.fn().mockResolvedValue([mockTag]),
    placeholder: 'Start writing...'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders in write mode by default', () => {
      render(<HybridEditor {...defaultProps} />)
      
      expect(screen.getByText('Writing')).toBeInTheDocument()
      expect(screen.getByText('Preview')).toBeInTheDocument()
    })

    it('displays word count', () => {
      render(<HybridEditor {...defaultProps} content="Hello world test" />)
      
      expect(screen.getByText('3 words')).toBeInTheDocument()
    })

    it('displays 0 words for empty content', () => {
      render(<HybridEditor {...defaultProps} content="" />)
      
      expect(screen.getByText('0 words')).toBeInTheDocument()
    })

    it('renders content in textarea', () => {
      render(<HybridEditor {...defaultProps} />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('Hello world')
    })

    it('shows markdown supported message in status bar', () => {
      render(<HybridEditor {...defaultProps} />)
      
      expect(screen.getByText('Markdown supported')).toBeInTheDocument()
    })

    it('renders textarea in write mode', () => {
      render(<HybridEditor {...defaultProps} />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()
      expect(textarea.tagName).toBe('TEXTAREA')
    })
  })

  describe('Mode Toggling', () => {
    it('toggles to preview mode when clicking Preview button', async () => {
      render(<HybridEditor {...defaultProps} />)
      
      const previewButton = screen.getByText('Preview')
      fireEvent.click(previewButton)
      
      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })
    })

    it('toggles back to write mode when clicking Edit button', async () => {
      render(<HybridEditor {...defaultProps} />)
      
      // Go to preview
      fireEvent.click(screen.getByText('Preview'))
      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })
      
      // Go back to write
      fireEvent.click(screen.getByText('Edit'))
      await waitFor(() => {
        expect(screen.getByText('Preview')).toBeInTheDocument()
      })
    })

    it('shows "Preview" status in preview mode', async () => {
      render(<HybridEditor {...defaultProps} />)
      
      fireEvent.click(screen.getByText('Preview'))
      
      await waitFor(() => {
        expect(screen.getByText(/Preview/)).toBeInTheDocument()
      })
    })

    it('hides textarea in preview mode', async () => {
      render(<HybridEditor {...defaultProps} />)
      
      fireEvent.click(screen.getByText('Preview'))
      
      await waitFor(() => {
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      })
    })
  })

  describe('Wiki-Link and Tag Patterns (Regex Tests)', () => {
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g
    const tagRegex = /(?:^|[^#\w])#([a-zA-Z][a-zA-Z0-9_-]*)$/

    it('matches wiki-link pattern', () => {
      const content = 'See [[My Note]] here'
      const matches = Array.from(content.matchAll(wikiLinkRegex))
      
      expect(matches.length).toBe(1)
      expect(matches[0][1]).toBe('My Note')
    })

    it('matches multiple wiki-links', () => {
      const content = 'Link to [[Note1]] and [[Note2]]'
      const matches = Array.from(content.matchAll(wikiLinkRegex))
      
      expect(matches.length).toBe(2)
      expect(matches[0][1]).toBe('Note1')
      expect(matches[1][1]).toBe('Note2')
    })

    it('matches tag pattern', () => {
      const content = 'This is #important'
      const match = content.match(tagRegex)
      
      expect(match).not.toBeNull()
      expect(match![1]).toBe('important')
    })

    it('matches tag with hyphen', () => {
      const content = '#important-task'
      const match = content.match(tagRegex)
      
      expect(match).not.toBeNull()
      expect(match![1]).toBe('important-task')
    })

    it('does not match heading as tag', () => {
      const content = '## Heading'
      const match = content.match(tagRegex)
      
      expect(match).toBeNull()
    })
  })

  describe('Word Count Calculation', () => {
    it('counts words correctly for simple text', () => {
      render(<HybridEditor {...defaultProps} content="One two three four five" />)
      
      expect(screen.getByText('5 words')).toBeInTheDocument()
    })

    it('counts words correctly with multiple spaces', () => {
      render(<HybridEditor {...defaultProps} content="One   two    three" />)
      
      expect(screen.getByText('3 words')).toBeInTheDocument()
    })

    it('counts words correctly with newlines', () => {
      const content = `One
two
three`
      render(<HybridEditor {...defaultProps} content={content} />)
      
      expect(screen.getByText('3 words')).toBeInTheDocument()
    })

    it('counts wiki-links as words', () => {
      render(<HybridEditor {...defaultProps} content="See [[Note]] here" />)
      
      expect(screen.getByText('3 words')).toBeInTheDocument()
    })

    it('counts tags as words', () => {
      render(<HybridEditor {...defaultProps} content="Check #todo today" />)
      
      expect(screen.getByText('3 words')).toBeInTheDocument()
    })
  })

  describe('Content onChange', () => {
    it('calls onChange when content is modified', () => {
      const onChange = vi.fn()
      render(<HybridEditor {...defaultProps} onChange={onChange} />)
      
      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'New content' } })
      
      expect(onChange).toHaveBeenCalledWith('New content')
    })

    it('updates content on typing', () => {
      const onChange = vi.fn()
      render(<HybridEditor {...defaultProps} content="" onChange={onChange} />)
      
      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'Hello' } })
      
      expect(onChange).toHaveBeenCalledWith('Hello')
    })
  })

  describe('Autocomplete Triggers', () => {
    it('triggers wiki-link autocomplete on [[ input', async () => {
      const onSearchNotes = vi.fn().mockResolvedValue([mockNote])
      render(<HybridEditor {...defaultProps} content="" onSearchNotes={onSearchNotes} />)
      
      const textarea = screen.getByRole('textbox')
      
      // Simulate typing [[ to trigger autocomplete
      fireEvent.change(textarea, { target: { value: '[[', selectionStart: 2 } })
      
      // Give time for async search
      await waitFor(() => {
        expect(onSearchNotes).toHaveBeenCalledWith('')
      })
    })

    it('triggers tag autocomplete on # input', async () => {
      const onSearchTags = vi.fn().mockResolvedValue([mockTag])
      render(<HybridEditor {...defaultProps} content="" onSearchTags={onSearchTags} />)
      
      const textarea = screen.getByRole('textbox')
      
      // Simulate typing #t to trigger autocomplete
      fireEvent.change(textarea, { target: { value: '#t', selectionStart: 2 } })
      
      // Give time for async search
      await waitFor(() => {
        expect(onSearchTags).toHaveBeenCalledWith('t')
      })
    })
  })
})

describe('HybridEditor Wiki-Link Processing', () => {
  describe('processWikiLinksAndTags function logic', () => {
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g
    const tagRegex = /(?<![#\w])#([a-zA-Z][a-zA-Z0-9_-]*)/g

    it('extracts wiki-link titles correctly', () => {
      const content = 'See [[My Note Title]] here'
      const matches = Array.from(content.matchAll(wikiLinkRegex))
      
      expect(matches.length).toBe(1)
      expect(matches[0][1]).toBe('My Note Title')
    })

    it('handles wiki-links with special characters', () => {
      const content = '[[Note: A & B (2024)]]'
      const matches = Array.from(content.matchAll(wikiLinkRegex))
      
      expect(matches.length).toBe(1)
      expect(matches[0][1]).toBe('Note: A & B (2024)')
    })

    it('extracts tag names correctly', () => {
      const content = 'This is #important-task'
      const matches = Array.from(content.matchAll(tagRegex))
      
      expect(matches.length).toBe(1)
      expect(matches[0][1]).toBe('important-task')
    })

    it('handles tags with underscores', () => {
      const content = 'Mark as #work_in_progress'
      const matches = Array.from(content.matchAll(tagRegex))
      
      expect(matches.length).toBe(1)
      expect(matches[0][1]).toBe('work_in_progress')
    })
  })
})

describe('HybridEditor Preview Mode', () => {
  const defaultProps = {
    content: 'Hello world',
    onChange: vi.fn(),
    onWikiLinkClick: vi.fn(),
    onTagClick: vi.fn(),
    onSearchNotes: vi.fn().mockResolvedValue([]),
    onSearchTags: vi.fn().mockResolvedValue([])
  }

  it('renders markdown in preview mode', async () => {
    render(<HybridEditor {...defaultProps} content="# Heading" />)
    
    fireEvent.click(screen.getByText('Preview'))
    
    await waitFor(() => {
      const heading = document.querySelector('h1')
      expect(heading).toBeInTheDocument()
    })
  })

  it('renders bold text in preview mode', async () => {
    render(<HybridEditor {...defaultProps} content="This is **bold**" />)
    
    fireEvent.click(screen.getByText('Preview'))
    
    await waitFor(() => {
      const strong = document.querySelector('strong')
      expect(strong).toBeInTheDocument()
    })
  })

  it('renders lists in preview mode', async () => {
    render(<HybridEditor {...defaultProps} content="- Item 1\n- Item 2" />)
    
    fireEvent.click(screen.getByText('Preview'))
    
    await waitFor(() => {
      const list = document.querySelector('ul')
      expect(list).toBeInTheDocument()
    })
  })

  it('enters preview mode and shows prose container', async () => {
    render(<HybridEditor {...defaultProps} content="See [[My Note]] here" />)
    
    fireEvent.click(screen.getByText('Preview'))
    
    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument()
      const proseDiv = document.querySelector('.prose')
      expect(proseDiv).toBeInTheDocument()
    })
  })

  it('shows Edit button in preview mode', async () => {
    render(<HybridEditor {...defaultProps} content="See [[My Note]]" />)
    
    fireEvent.click(screen.getByText('Preview'))
    
    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument()
    })
  })

  it('renders markdown content in preview mode', async () => {
    render(<HybridEditor {...defaultProps} content="Check #important" />)
    
    fireEvent.click(screen.getByText('Preview'))
    
    await waitFor(() => {
      // Prose container visible means markdown is rendering
      const proseDiv = document.querySelector('.prose')
      expect(proseDiv).toBeInTheDocument()
    })
  })
})

describe('HybridEditor Accessibility', () => {
  const defaultProps = {
    content: '',
    onChange: vi.fn()
  }

  it('has textarea in write mode', () => {
    render(<HybridEditor {...defaultProps} />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
  })

  it('toggle button has meaningful text', () => {
    render(<HybridEditor {...defaultProps} />)
    
    expect(screen.getByText('Preview')).toBeInTheDocument()
  })

  it('textarea has placeholder text', () => {
    render(<HybridEditor {...defaultProps} />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('placeholder')
  })
})
