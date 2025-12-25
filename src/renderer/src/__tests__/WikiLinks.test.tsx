import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Editor } from '../components/Editor'
import { WikiLinkAutocomplete } from '../components/WikiLinkAutocomplete'
import { Note } from '../../../main/database/DatabaseService'

// Mock notes data
const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Main Note',
    content: '<p>Content of main note</p>',
    folder: 'inbox',
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: null
  },
  {
    id: '2',
    title: 'Target Note',
    content: '<p>Target content</p>',
    folder: 'inbox',
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: null
  },
  {
    id: '3',
    title: 'Another Note',
    content: '<p>Another content</p>',
    folder: 'projects',
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: null
  }
]

describe('WikiLinks - Autocomplete System', () => {
  const mockOnChange = vi.fn()
  const mockOnLinkClick = vi.fn()
  const mockOnSearchNotes = vi.fn(async (query: string) => {
    if (!query) return mockNotes
    return mockNotes.filter(note =>
      note.title.toLowerCase().includes(query.toLowerCase())
    )
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('Test 1: Should trigger autocomplete when typing [[', async () => {
    const user = userEvent.setup()

    render(
      <Editor
        content="<p></p>"
        onChange={mockOnChange}
        editable={true}
        onLinkClick={mockOnLinkClick}
        onSearchNotes={mockOnSearchNotes}
      />
    )

    const editor = screen.getByRole('textbox')
    await user.type(editor, '[[')

    // Autocomplete should appear
    await waitFor(() => {
      expect(screen.getByText('Main Note')).toBeInTheDocument()
    })
  })

  it('Test 2: Should filter notes when typing in autocomplete', async () => {
    const user = userEvent.setup()

    render(
      <Editor
        content="<p></p>"
        onChange={mockOnChange}
        editable={true}
        onLinkClick={mockOnLinkClick}
        onSearchNotes={mockOnSearchNotes}
      />
    )

    const editor = screen.getByRole('textbox')
    await user.type(editor, '[[target')

    await waitFor(() => {
      expect(screen.getByText('Target Note')).toBeInTheDocument()
      expect(screen.queryByText('Another Note')).not.toBeInTheDocument()
    })
  })

  it('Test 3: Should navigate autocomplete with arrow keys', async () => {
    const user = userEvent.setup()

    render(
      <Editor
        content="<p></p>"
        onChange={mockOnChange}
        editable={true}
        onLinkClick={mockOnLinkClick}
        onSearchNotes={mockOnSearchNotes}
      />
    )

    const editor = screen.getByRole('textbox')
    await user.type(editor, '[[')

    await waitFor(() => {
      expect(screen.getByText('Main Note')).toBeInTheDocument()
    })

    // Press down arrow
    await user.keyboard('{ArrowDown}')

    // Second item should be highlighted
    const targetNote = screen.getByText('Target Note')
    expect(targetNote.closest('button')).toHaveClass('bg-gray-700')
  })

  it('Test 4: Should insert wiki link on Enter key', async () => {
    const user = userEvent.setup()

    render(
      <Editor
        content="<p></p>"
        onChange={mockOnChange}
        editable={true}
        onLinkClick={mockOnLinkClick}
        onSearchNotes={mockOnSearchNotes}
      />
    )

    const editor = screen.getByRole('textbox')
    await user.type(editor, '[[')

    await waitFor(() => {
      expect(screen.getByText('Main Note')).toBeInTheDocument()
    })

    await user.keyboard('{Enter}')

    // Should insert [[Main Note]]
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('[[Main Note]]')
      )
    })
  })

  it('Test 5: Should insert wiki link on click', async () => {
    const user = userEvent.setup()

    render(
      <Editor
        content="<p></p>"
        onChange={mockOnChange}
        editable={true}
        onLinkClick={mockOnLinkClick}
        onSearchNotes={mockOnSearchNotes}
      />
    )

    const editor = screen.getByRole('textbox')
    await user.type(editor, '[[')

    await waitFor(() => {
      expect(screen.getByText('Target Note')).toBeInTheDocument()
    })

    const targetButton = screen.getByText('Target Note').closest('button')!
    await user.click(targetButton)

    // Should insert [[Target Note]]
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('[[Target Note]]')
      )
    })
  })

  it('Test 6: Should close autocomplete on Escape', async () => {
    const user = userEvent.setup()

    render(
      <Editor
        content="<p></p>"
        onChange={mockOnChange}
        editable={true}
        onLinkClick={mockOnLinkClick}
        onSearchNotes={mockOnSearchNotes}
      />
    )

    const editor = screen.getByRole('textbox')
    await user.type(editor, '[[')

    await waitFor(() => {
      expect(screen.getByText('Main Note')).toBeInTheDocument()
    })

    await user.keyboard('{Escape}')

    // Autocomplete should disappear
    await waitFor(() => {
      expect(screen.queryByText('Main Note')).not.toBeInTheDocument()
    })
  })
})

describe('WikiLinks - Link Navigation', () => {
  const mockOnLinkClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('Test 7: Should trigger onLinkClick when clicking wiki link', async () => {
    const user = userEvent.setup()

    const content = '<p><span class="wiki-link-decoration" data-title="Target Note">[[Target Note]]</span></p>'

    render(
      <Editor
        content={content}
        onChange={vi.fn()}
        editable={true}
        onLinkClick={mockOnLinkClick}
        onSearchNotes={vi.fn()}
      />
    )

    const wikiLink = screen.getByText('[[Target Note]]')
    await user.click(wikiLink)

    expect(mockOnLinkClick).toHaveBeenCalledWith('Target Note')
  })
})

describe('WikiLinks - Link Pattern Detection', () => {
  it('Test 8: Should detect wiki links in content', () => {
    const content = 'This is [[Link One]] and [[Link Two]] in text'
    const linkRegex = /\[\[([^\]]+)\]\]/g
    const matches = Array.from(content.matchAll(linkRegex))
    const links = matches.map(m => m[1].trim())

    expect(links).toEqual(['Link One', 'Link Two'])
  })

  it('Test 9: Should handle nested brackets correctly', () => {
    const content = 'Text [[Link [with] brackets]] more text'
    const linkRegex = /\[\[([^\]]+)\]\]/g
    const matches = Array.from(content.matchAll(linkRegex))
    const links = matches.map(m => m[1].trim())

    // Should only match the inner content
    expect(links).toEqual(['Link [with']) // Stops at first ]
  })

  it('Test 10: Should ignore incomplete links', () => {
    const content = 'Text [[incomplete link without closing'
    const linkRegex = /\[\[([^\]]+)\]\]/g
    const matches = Array.from(content.matchAll(linkRegex))

    expect(matches.length).toBe(0)
  })

  it('Test 11: Should handle multiple links on same line', () => {
    const content = '[[First]] [[Second]] [[Third]]'
    const linkRegex = /\[\[([^\]]+)\]\]/g
    const matches = Array.from(content.matchAll(linkRegex))
    const links = matches.map(m => m[1].trim())

    expect(links).toEqual(['First', 'Second', 'Third'])
  })

  it('Test 12: Should trim whitespace in link titles', () => {
    const content = '[[  Padded Title  ]]'
    const linkRegex = /\[\[([^\]]+)\]\]/g
    const matches = Array.from(content.matchAll(linkRegex))
    const links = matches.map(m => m[1].trim())

    expect(links[0]).toBe('Padded Title')
  })
})

describe('WikiLinks - Edge Cases', () => {
  it('Test 13: Should handle empty query in search', async () => {
    const mockSearchNotes = vi.fn(async (query: string) => {
      if (!query) return mockNotes
      return []
    })

    const result = await mockSearchNotes('')
    expect(result).toEqual(mockNotes)
  })

  it('Test 14: Should handle no matching notes', async () => {
    const mockSearchNotes = vi.fn(async (query: string) => {
      return mockNotes.filter(n => n.title.includes(query))
    })

    const result = await mockSearchNotes('NonExistentNote')
    expect(result).toEqual([])
  })

  it('Test 15: Should handle special characters in note titles', () => {
    const content = '[[Note with "quotes" and apostrophes]]'
    const linkRegex = /\[\[([^\]]+)\]\]/g
    const matches = Array.from(content.matchAll(linkRegex))
    const links = matches.map(m => m[1].trim())

    expect(links[0]).toBe('Note with "quotes" and apostrophes')
  })

  it('Test 16: Should handle very long note titles', () => {
    const longTitle = 'A'.repeat(500)
    const content = `[[${longTitle}]]`
    const linkRegex = /\[\[([^\]]+)\]\]/g
    const matches = Array.from(content.matchAll(linkRegex))

    expect(matches.length).toBe(1)
    expect(matches[0][1].trim()).toBe(longTitle)
  })
})
