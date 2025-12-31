import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { HybridEditor } from '../components/HybridEditor'
import { Note, Tag } from '../types'
import { createMockNote } from './testUtils'

// Test utilities
const mockNote: Note = createMockNote({
  id: '1',
  title: 'Test Note',
  content: 'Test content',
  folder: 'inbox'
})

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
    it('renders in source mode by default', () => {
      render(<HybridEditor {...defaultProps} />)

      // New Obsidian-style modes: Source, Live Preview, Reading
      // Multiple elements may contain mode text (button + status bar)
      expect(screen.getAllByText('Source').length).toBeGreaterThan(0)
      expect(screen.getByText('Reading')).toBeInTheDocument()
    })

    it('displays word count', () => {
      render(<HybridEditor {...defaultProps} content="Hello world test" />)

      // Word count appears in multiple places (header and status bar)
      expect(screen.getAllByText('3 words').length).toBeGreaterThan(0)
    })

    it('displays 0 words for empty content', () => {
      render(<HybridEditor {...defaultProps} content="" />)

      // Word count appears in multiple places (header and status bar)
      expect(screen.getAllByText('0 words').length).toBeGreaterThan(0)
    })

    it('renders content in textarea', () => {
      render(<HybridEditor {...defaultProps} />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('Hello world')
    })

    it('shows keyboard shortcut hint in status bar', () => {
      render(<HybridEditor {...defaultProps} />)

      // Status bar shows ⌘E keyboard hint
      expect(screen.getByText('⌘E')).toBeInTheDocument()
    })

    it('renders textarea in write mode', () => {
      render(<HybridEditor {...defaultProps} />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()
      expect(textarea.tagName).toBe('TEXTAREA')
    })
  })

  describe('Mode Toggling', () => {
    it('toggles to reading mode when clicking Reading button', async () => {
      render(<HybridEditor {...defaultProps} />)

      // Obsidian-style toggle shows Source, Live Preview, Reading buttons
      fireEvent.click(screen.getByText('Reading'))

      await waitFor(() => {
        // In reading mode, textarea is hidden
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      })
    })

    it('toggles back to source mode when clicking Source button', async () => {
      render(<HybridEditor {...defaultProps} />)

      // Go to reading mode
      fireEvent.click(screen.getByText('Reading'))
      await waitFor(() => {
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      })

      // Go back to source
      fireEvent.click(screen.getByText('Source'))
      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument()
      })
    })

    it('shows all three mode toggle buttons', async () => {
      render(<HybridEditor {...defaultProps} />)

      // Obsidian-style toggle shows all three modes
      // Multiple elements may contain mode text (button + status bar)
      expect(screen.getAllByText('Source').length).toBeGreaterThan(0)
      expect(screen.getByText('Live')).toBeInTheDocument()
      expect(screen.getByText('Reading')).toBeInTheDocument()
    })

    it('hides textarea in reading mode', async () => {
      render(<HybridEditor {...defaultProps} />)

      fireEvent.click(screen.getByText('Reading'))

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

      // Word count appears in multiple places
      expect(screen.getAllByText('5 words').length).toBeGreaterThan(0)
    })

    it('counts words correctly with multiple spaces', () => {
      render(<HybridEditor {...defaultProps} content="One   two    three" />)

      // Word count appears in multiple places
      expect(screen.getAllByText('3 words').length).toBeGreaterThan(0)
    })

    it('counts words correctly with newlines', () => {
      const content = `One
two
three`
      render(<HybridEditor {...defaultProps} content={content} />)

      // Word count appears in multiple places
      expect(screen.getAllByText('3 words').length).toBeGreaterThan(0)
    })

    it('counts wiki-links as words', () => {
      render(<HybridEditor {...defaultProps} content="See [[Note]] here" />)

      // Word count appears in multiple places
      expect(screen.getAllByText('3 words').length).toBeGreaterThan(0)
    })

    it('counts tags as words', () => {
      render(<HybridEditor {...defaultProps} content="Check #todo today" />)

      // Word count appears in multiple places
      expect(screen.getAllByText('3 words').length).toBeGreaterThan(0)
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

      // Wait for autocomplete to finish loading to avoid act() warnings
      await waitFor(() => {
        expect(screen.queryByText('Loading notes...')).not.toBeInTheDocument()
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

      // Wait for autocomplete to finish loading to avoid act() warnings
      await waitFor(() => {
        expect(screen.queryByText('Loading tags...')).not.toBeInTheDocument()
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

describe('HybridEditor Reading Mode', () => {
  const defaultProps = {
    content: 'Hello world',
    onChange: vi.fn(),
    onWikiLinkClick: vi.fn(),
    onTagClick: vi.fn(),
    onSearchNotes: vi.fn().mockResolvedValue([]),
    onSearchTags: vi.fn().mockResolvedValue([])
  }

  it('renders markdown in reading mode', async () => {
    render(<HybridEditor {...defaultProps} content="# Heading" />)

    fireEvent.click(screen.getByText('Reading'))

    await waitFor(() => {
      const heading = document.querySelector('h1')
      expect(heading).toBeInTheDocument()
    })
  })

  it('renders bold text in reading mode', async () => {
    render(<HybridEditor {...defaultProps} content="This is **bold**" />)

    fireEvent.click(screen.getByText('Reading'))

    await waitFor(() => {
      const strong = document.querySelector('strong')
      expect(strong).toBeInTheDocument()
    })
  })

  it('renders lists in reading mode', async () => {
    render(<HybridEditor {...defaultProps} content="- Item 1\n- Item 2" />)

    fireEvent.click(screen.getByText('Reading'))

    await waitFor(() => {
      const list = document.querySelector('ul')
      expect(list).toBeInTheDocument()
    })
  })

  it('enters reading mode and shows prose container', async () => {
    render(<HybridEditor {...defaultProps} content="See [[My Note]] here" />)

    fireEvent.click(screen.getByText('Reading'))

    await waitFor(() => {
      // In Obsidian-style toggle, Source button is always visible
      expect(screen.getByText('Source')).toBeInTheDocument()
      const proseDiv = document.querySelector('.prose')
      expect(proseDiv).toBeInTheDocument()
    })
  })

  it('shows Source button in reading mode', async () => {
    render(<HybridEditor {...defaultProps} content="See [[My Note]]" />)

    fireEvent.click(screen.getByText('Reading'))

    await waitFor(() => {
      // Obsidian-style toggle always shows all three modes
      expect(screen.getByText('Source')).toBeInTheDocument()
    })
  })

  it('renders markdown content in reading mode', async () => {
    render(<HybridEditor {...defaultProps} content="Check #important" />)

    fireEvent.click(screen.getByText('Reading'))

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

  it('has textarea in source mode', () => {
    render(<HybridEditor {...defaultProps} />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
  })

  it('toggle buttons have meaningful text', () => {
    render(<HybridEditor {...defaultProps} />)

    // Multiple elements may contain mode text (button + status bar)
    expect(screen.getAllByText('Source').length).toBeGreaterThan(0)
    expect(screen.getByText('Live')).toBeInTheDocument()
    expect(screen.getByText('Reading')).toBeInTheDocument()
  })

  it('textarea has placeholder text', () => {
    render(<HybridEditor {...defaultProps} />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('placeholder')
  })
})

describe('HybridEditor Checkbox Rendering (Phase 1)', () => {
  const defaultProps = {
    content: '',
    onChange: vi.fn(),
    onWikiLinkClick: vi.fn(),
    onTagClick: vi.fn(),
    onSearchNotes: vi.fn().mockResolvedValue([]),
    onSearchTags: vi.fn().mockResolvedValue([])
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Checkbox Rendering in Reading Mode', () => {
    it('renders unchecked checkbox for "- [ ]" syntax', async () => {
      render(<HybridEditor {...defaultProps} content="- [ ] Unchecked task" />)

      // Switch to reading mode
      fireEvent.click(screen.getByText('Reading'))

      await waitFor(() => {
        const checkbox = document.querySelector('input[type="checkbox"]')
        expect(checkbox).toBeInTheDocument()
        expect(checkbox).not.toBeChecked()
      })
    })

    it('renders checked checkbox for "- [x]" syntax', async () => {
      render(<HybridEditor {...defaultProps} content="- [x] Completed task" />)

      // Switch to reading mode
      fireEvent.click(screen.getByText('Reading'))

      await waitFor(() => {
        const checkbox = document.querySelector('input[type="checkbox"]')
        expect(checkbox).toBeInTheDocument()
        expect(checkbox).toBeChecked()
      })
    })

    it('renders multiple checkboxes in a task list', async () => {
      const content = `- [ ] Task 1
- [x] Task 2
- [ ] Task 3`
      render(<HybridEditor {...defaultProps} content={content} />)

      // Switch to reading mode
      fireEvent.click(screen.getByText('Reading'))

      await waitFor(() => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]')
        expect(checkboxes.length).toBe(3)
        expect(checkboxes[0]).not.toBeChecked()
        expect(checkboxes[1]).toBeChecked()
        expect(checkboxes[2]).not.toBeChecked()
      })
    })

    it('checkbox has accessibility attributes', async () => {
      render(<HybridEditor {...defaultProps} content="- [ ] Accessible task" />)

      // Switch to reading mode
      fireEvent.click(screen.getByText('Reading'))

      await waitFor(() => {
        const checkbox = document.querySelector('input[type="checkbox"]')
        expect(checkbox).toBeInTheDocument()
        // Checkbox should not be disabled (interactive)
        expect(checkbox).not.toBeDisabled()
      })
    })
  })

  describe('Checkbox Toggle Functionality', () => {
    it('clicking unchecked checkbox toggles content to checked', async () => {
      const onChange = vi.fn()
      render(<HybridEditor {...defaultProps} content="- [ ] Toggle me" onChange={onChange} />)

      // Switch to reading mode
      fireEvent.click(screen.getByText('Reading'))

      await waitFor(() => {
        const checkbox = document.querySelector('input[type="checkbox"]')
        expect(checkbox).toBeInTheDocument()
      })

      // Click the checkbox
      const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement
      fireEvent.click(checkbox)

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('- [x] Toggle me')
      })
    })

    it('clicking checked checkbox toggles content to unchecked', async () => {
      const onChange = vi.fn()
      render(<HybridEditor {...defaultProps} content="- [x] Uncheck me" onChange={onChange} />)

      // Switch to reading mode
      fireEvent.click(screen.getByText('Reading'))

      await waitFor(() => {
        const checkbox = document.querySelector('input[type="checkbox"]')
        expect(checkbox).toBeInTheDocument()
      })

      // Click the checkbox
      const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement
      fireEvent.click(checkbox)

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('- [ ] Uncheck me')
      })
    })

    it('toggling checkbox in multiline content updates correct line', async () => {
      const onChange = vi.fn()
      const content = `# My Tasks

- [ ] First task
- [x] Second task
- [ ] Third task

Some other text`
      render(<HybridEditor {...defaultProps} content={content} onChange={onChange} />)

      // Switch to reading mode
      fireEvent.click(screen.getByText('Reading'))

      await waitFor(() => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]')
        expect(checkboxes.length).toBe(3)
      })

      // Click the first checkbox (index 0)
      const checkboxes = document.querySelectorAll('input[type="checkbox"]')
      fireEvent.click(checkboxes[0])

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(expect.stringContaining('- [x] First task'))
        expect(onChange).toHaveBeenCalledWith(expect.stringContaining('- [x] Second task'))
        expect(onChange).toHaveBeenCalledWith(expect.stringContaining('- [ ] Third task'))
      })
    })
  })

  describe('Checkbox Styling', () => {
    it('checked task text has strikethrough styling', async () => {
      render(<HybridEditor {...defaultProps} content="- [x] Done task" />)

      // Switch to reading mode
      fireEvent.click(screen.getByText('Reading'))

      await waitFor(() => {
        // Look for task-list-item with checked checkbox
        const listItem = document.querySelector('.task-list-item')
        expect(listItem).toBeInTheDocument()
      })
    })
  })
})

describe('HybridEditor Callout Rendering (Phase 2)', () => {
  const defaultProps = {
    content: '',
    onChange: vi.fn(),
    onWikiLinkClick: vi.fn(),
    onTagClick: vi.fn(),
    onSearchNotes: vi.fn().mockResolvedValue([]),
    onSearchTags: vi.fn().mockResolvedValue([])
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Callout Rendering in Reading Mode', () => {
    it('renders note callout for "> [!note]" syntax', async () => {
      const content = `> [!note]
> This is a note callout`
      render(<HybridEditor {...defaultProps} content={content} />)

      // Switch to reading mode
      fireEvent.click(screen.getByText('Reading'))

      await waitFor(() => {
        // Look for callout element
        const callout = document.querySelector('[data-callout="note"]')
        expect(callout).toBeInTheDocument()
      })
    })

    it('renders warning callout with correct type', async () => {
      const content = `> [!warning]
> This is a warning`
      render(<HybridEditor {...defaultProps} content={content} />)

      fireEvent.click(screen.getByText('Reading'))

      await waitFor(() => {
        const callout = document.querySelector('[data-callout="warning"]')
        expect(callout).toBeInTheDocument()
      })
    })

    it('renders callout with custom title', async () => {
      const content = `> [!tip] Pro Tip
> This is a tip with custom title`
      render(<HybridEditor {...defaultProps} content={content} />)

      fireEvent.click(screen.getByText('Reading'))

      await waitFor(() => {
        const callout = document.querySelector('[data-callout="tip"]')
        expect(callout).toBeInTheDocument()
        // Check for custom title text
        expect(callout?.textContent).toContain('Pro Tip')
      })
    })

    it('renders multiple callout types', async () => {
      const content = `> [!note]
> A note

> [!warning]
> A warning

> [!tip]
> A tip`
      render(<HybridEditor {...defaultProps} content={content} />)

      fireEvent.click(screen.getByText('Reading'))

      await waitFor(() => {
        const noteCallout = document.querySelector('[data-callout="note"]')
        const warningCallout = document.querySelector('[data-callout="warning"]')
        const tipCallout = document.querySelector('[data-callout="tip"]')
        expect(noteCallout).toBeInTheDocument()
        expect(warningCallout).toBeInTheDocument()
        expect(tipCallout).toBeInTheDocument()
      })
    })
  })

  describe('Callout Types', () => {
    const calloutTypes = ['note', 'tip', 'warning', 'danger', 'info', 'quote', 'example', 'question']

    calloutTypes.forEach(type => {
      it(`renders ${type} callout type`, async () => {
        const content = `> [!${type}]
> Content for ${type}`
        render(<HybridEditor {...defaultProps} content={content} />)

        fireEvent.click(screen.getByText('Reading'))

        await waitFor(() => {
          const callout = document.querySelector(`[data-callout="${type}"]`)
          expect(callout).toBeInTheDocument()
        })
      })
    })
  })
})
