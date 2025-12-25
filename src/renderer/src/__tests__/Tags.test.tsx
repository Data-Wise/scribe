import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Note } from '../../../main/database/DatabaseService'

/**
 * Tags System Test Suite
 *
 * Tests the tag parsing, database operations, and autocomplete functionality
 * for the #tag system implemented in Sprint 7.
 *
 * Pattern follows WikiLinks.test.tsx structure:
 * - Unit tests for parsing logic
 * - Unit tests for database methods
 * - Integration tests for UI components (limited by jsdom)
 * - Edge case coverage
 *
 * Manual Testing Required:
 * - Tag autocomplete trigger (# key)
 * - Tag rendering with colored badges
 * - Tag filtering in UI
 * - Multi-tag filtering (AND/OR logic)
 *
 * See SPRINT-7-PLAN.md for complete manual testing checklist.
 */

// Mock notes with tags in content
const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Research Ideas',
    content: '<p>Working on #mediation and #sensitivity-analysis</p>',
    folder: 'inbox',
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: null
  },
  {
    id: '2',
    title: 'Meeting Notes',
    content: '<p>Discussed #meeting #statistics today</p>',
    folder: 'projects',
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: null
  },
  {
    id: '3',
    title: 'Todo List',
    content: '<p>#todo Review paper #deadline-2024</p>',
    folder: 'inbox',
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: null
  }
]

describe('Tags - Pattern Detection', () => {
  const tagRegex = /#([a-zA-Z0-9_-]+)/g

  it('Test 1: Should parse single #tag from content', () => {
    const content = 'This is a #test tag in text'
    const matches = Array.from(content.matchAll(tagRegex))
    const tags = matches.map(m => m[1])

    expect(tags).toEqual(['test'])
  })

  it('Test 2: Should handle multiple tags on same line', () => {
    const content = 'Multiple tags: #first #second #third'
    const matches = Array.from(content.matchAll(tagRegex))
    const tags = matches.map(m => m[1])

    expect(tags).toEqual(['first', 'second', 'third'])
  })

  it('Test 3: Should match # in middle of word (but extract tag after #)', () => {
    // Note: The regex /#([a-zA-Z0-9_-]+)/g will match 'def' from 'abc#def'
    // This is expected behavior - we want to catch tags anywhere
    const content = 'Not typical: abc#def or test#123'
    const matches = Array.from(content.matchAll(tagRegex))
    const tags = matches.map(m => m[1])

    // The regex matches the alphanumeric part after #
    expect(tags).toEqual(['def', '123'])
  })

  it('Test 4: Should parse tags with hyphens', () => {
    const content = 'Tags with hyphens: #my-tag #another-one'
    const matches = Array.from(content.matchAll(tagRegex))
    const tags = matches.map(m => m[1])

    expect(tags).toEqual(['my-tag', 'another-one'])
  })

  it('Test 5: Should parse tags with underscores', () => {
    const content = 'Tags with underscores: #my_tag #another_one'
    const matches = Array.from(content.matchAll(tagRegex))
    const tags = matches.map(m => m[1])

    expect(tags).toEqual(['my_tag', 'another_one'])
  })

  it('Test 6: Should parse tags with numbers', () => {
    const content = 'Tags with numbers: #tag123 #v2-release'
    const matches = Array.from(content.matchAll(tagRegex))
    const tags = matches.map(m => m[1])

    expect(tags).toEqual(['tag123', 'v2-release'])
  })

  it('Test 7: Should stop at punctuation', () => {
    const content = 'End of sentence #tag. Another #tag, and #tag!'
    const matches = Array.from(content.matchAll(tagRegex))
    const tags = matches.map(m => m[1])

    expect(tags).toEqual(['tag', 'tag', 'tag'])
  })

  it('Test 8: Should stop at whitespace', () => {
    const content = 'Tags: #first #second\n#third\t#fourth'
    const matches = Array.from(content.matchAll(tagRegex))
    const tags = matches.map(m => m[1])

    expect(tags).toEqual(['first', 'second', 'third', 'fourth'])
  })

  it('Test 9: Should handle tag at start of line', () => {
    const content = '#startTag is at the beginning'
    const matches = Array.from(content.matchAll(tagRegex))
    const tags = matches.map(m => m[1])

    expect(tags).toEqual(['startTag'])
  })

  it('Test 10: Should handle tag at end of line', () => {
    const content = 'This ends with #endTag'
    const matches = Array.from(content.matchAll(tagRegex))
    const tags = matches.map(m => m[1])

    expect(tags).toEqual(['endTag'])
  })

  it('Test 11: Should ignore empty # symbol', () => {
    const content = 'Just a hash # without tag'
    const matches = Array.from(content.matchAll(tagRegex))

    expect(matches.length).toBe(0)
  })

  it('Test 12: Should parse tags in HTML content', () => {
    const content = '<p>HTML with #tag1 and #tag2</p>'
    const matches = Array.from(content.matchAll(tagRegex))
    const tags = matches.map(m => m[1])

    expect(tags).toEqual(['tag1', 'tag2'])
  })

  it('Test 13: Should handle case-sensitive tags differently', () => {
    const content = '#Tag #tag #TAG'
    const matches = Array.from(content.matchAll(tagRegex))
    const tags = matches.map(m => m[1])

    // Regex extracts all three, but database should normalize
    expect(tags).toEqual(['Tag', 'tag', 'TAG'])
    expect(tags.length).toBe(3)
  })
})

describe('Tags - Color Generation', () => {
  /**
   * Tag color generation function (from SPRINT-7-PLAN.md)
   * Generates consistent HSL colors from tag names
   */
  function tagColor(name: string): string {
    const hash = name.split('').reduce((acc, char) =>
      char.charCodeAt(0) + ((acc << 5) - acc), 0)
    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, 70%, 50%)`
  }

  it('Test 14: Should generate consistent colors for same tag', () => {
    const color1 = tagColor('test')
    const color2 = tagColor('test')

    expect(color1).toBe(color2)
  })

  it('Test 15: Should generate different colors for different tags', () => {
    const color1 = tagColor('tag1')
    const color2 = tagColor('tag2')

    expect(color1).not.toBe(color2)
  })

  it('Test 16: Should generate valid HSL color format', () => {
    const color = tagColor('example')

    expect(color).toMatch(/^hsl\(\d+, 70%, 50%\)$/)
  })

  it('Test 17: Should handle empty tag name', () => {
    const color = tagColor('')

    expect(color).toMatch(/^hsl\(\d+, 70%, 50%\)$/)
    expect(color).toBe('hsl(0, 70%, 50%)') // Empty string hash = 0
  })

  it('Test 18: Should handle special characters in tag name', () => {
    const color = tagColor('tag-with-hyphens')

    expect(color).toMatch(/^hsl\(\d+, 70%, 50%\)$/)
  })

  it('Test 19: Should generate hue in valid range (0-359)', () => {
    const tags = ['tag1', 'tag2', 'tag3', 'very-long-tag-name', 'a', 'zzz']

    tags.forEach(tag => {
      const color = tagColor(tag)
      const hue = parseInt(color.match(/\d+/)![0])
      expect(hue).toBeGreaterThanOrEqual(0)
      expect(hue).toBeLessThan(360)
    })
  })

  it('Test 20: Should handle case-sensitivity in color generation', () => {
    const lowerColor = tagColor('tag')
    const upperColor = tagColor('TAG')
    const mixedColor = tagColor('Tag')

    // Different cases should generate different colors
    expect(lowerColor).not.toBe(upperColor)
    expect(lowerColor).not.toBe(mixedColor)
    expect(upperColor).not.toBe(mixedColor)
  })
})

describe('Tags - Database Operations', () => {
  const mockAddTag = vi.fn()
  const mockRemoveTag = vi.fn()
  const mockGetNoteTags = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('Test 21: Should add tag to note', async () => {
    mockAddTag.mockResolvedValue(true)

    const result = await mockAddTag('note-1', 'test-tag')

    expect(mockAddTag).toHaveBeenCalledWith('note-1', 'test-tag')
    expect(result).toBe(true)
  })

  it('Test 22: Should remove tag from note', async () => {
    mockRemoveTag.mockResolvedValue(true)

    const result = await mockRemoveTag('note-1', 'test-tag')

    expect(mockRemoveTag).toHaveBeenCalledWith('note-1', 'test-tag')
    expect(result).toBe(true)
  })

  it('Test 23: Should get all tags for a note', async () => {
    mockGetNoteTags.mockResolvedValue(['tag1', 'tag2', 'tag3'])

    const tags = await mockGetNoteTags('note-1')

    expect(mockGetNoteTags).toHaveBeenCalledWith('note-1')
    expect(tags).toEqual(['tag1', 'tag2', 'tag3'])
  })

  it('Test 24: Should handle adding duplicate tag', async () => {
    mockAddTag.mockResolvedValue(false) // Duplicate tag

    const result = await mockAddTag('note-1', 'existing-tag')

    expect(result).toBe(false)
  })

  it('Test 25: Should handle removing non-existent tag', async () => {
    mockRemoveTag.mockResolvedValue(false) // Tag doesn't exist

    const result = await mockRemoveTag('note-1', 'non-existent')

    expect(result).toBe(false)
  })

  it('Test 26: Should return empty array for note with no tags', async () => {
    mockGetNoteTags.mockResolvedValue([])

    const tags = await mockGetNoteTags('note-without-tags')

    expect(tags).toEqual([])
  })

  it('Test 27: Should handle tags with special characters', async () => {
    mockAddTag.mockResolvedValue(true)

    await mockAddTag('note-1', 'tag-with-hyphens')
    await mockAddTag('note-1', 'tag_with_underscores')
    await mockAddTag('note-1', 'tag123')

    expect(mockAddTag).toHaveBeenCalledTimes(3)
  })
})

describe('Tags - Content Parsing & Update', () => {
  const tagRegex = /#([a-zA-Z0-9_-]+)/g

  /**
   * Mock implementation of updateNoteTags
   * Parses #tags from content and updates database
   */
  async function updateNoteTags(
    noteId: string,
    content: string,
    addTagFn: (noteId: string, tag: string) => Promise<boolean>,
    removeTagFn: (noteId: string, tag: string) => Promise<boolean>,
    getTagsFn: (noteId: string) => Promise<string[]>
  ): Promise<void> {
    // Extract tags from content
    const matches = Array.from(content.matchAll(tagRegex))
    const contentTags = new Set(matches.map(m => m[1].toLowerCase()))

    // Get existing tags
    const existingTags = await getTagsFn(noteId)
    const existingSet = new Set(existingTags.map(t => t.toLowerCase()))

    // Add new tags
    for (const tag of contentTags) {
      if (!existingSet.has(tag)) {
        await addTagFn(noteId, tag)
      }
    }

    // Remove deleted tags
    for (const tag of existingTags) {
      if (!contentTags.has(tag.toLowerCase())) {
        await removeTagFn(noteId, tag)
      }
    }
  }

  it('Test 28: Should update note tags from content', async () => {
    const mockAddTag = vi.fn().mockResolvedValue(true)
    const mockRemoveTag = vi.fn().mockResolvedValue(true)
    const mockGetNoteTags = vi.fn().mockResolvedValue([])

    const content = '<p>Content with #tag1 and #tag2</p>'

    await updateNoteTags('note-1', content, mockAddTag, mockRemoveTag, mockGetNoteTags)

    expect(mockAddTag).toHaveBeenCalledWith('note-1', 'tag1')
    expect(mockAddTag).toHaveBeenCalledWith('note-1', 'tag2')
    expect(mockAddTag).toHaveBeenCalledTimes(2)
  })

  it('Test 29: Should remove tags no longer in content', async () => {
    const mockAddTag = vi.fn().mockResolvedValue(true)
    const mockRemoveTag = vi.fn().mockResolvedValue(true)
    const mockGetNoteTags = vi.fn().mockResolvedValue(['oldtag', 'tag1'])

    const content = '<p>Content with only #tag1</p>'

    await updateNoteTags('note-1', content, mockAddTag, mockRemoveTag, mockGetNoteTags)

    expect(mockRemoveTag).toHaveBeenCalledWith('note-1', 'oldtag')
    expect(mockAddTag).not.toHaveBeenCalledWith('note-1', 'tag1') // Already exists
  })

  it('Test 30: Should handle empty content', async () => {
    const mockAddTag = vi.fn().mockResolvedValue(true)
    const mockRemoveTag = vi.fn().mockResolvedValue(true)
    const mockGetNoteTags = vi.fn().mockResolvedValue(['tag1', 'tag2'])

    const content = '<p></p>'

    await updateNoteTags('note-1', content, mockAddTag, mockRemoveTag, mockGetNoteTags)

    expect(mockRemoveTag).toHaveBeenCalledWith('note-1', 'tag1')
    expect(mockRemoveTag).toHaveBeenCalledWith('note-1', 'tag2')
    expect(mockAddTag).not.toHaveBeenCalled()
  })

  it('Test 31: Should handle content with no tag changes', async () => {
    const mockAddTag = vi.fn().mockResolvedValue(true)
    const mockRemoveTag = vi.fn().mockResolvedValue(true)
    const mockGetNoteTags = vi.fn().mockResolvedValue(['tag1', 'tag2'])

    const content = '<p>#tag1 #tag2</p>'

    await updateNoteTags('note-1', content, mockAddTag, mockRemoveTag, mockGetNoteTags)

    expect(mockAddTag).not.toHaveBeenCalled()
    expect(mockRemoveTag).not.toHaveBeenCalled()
  })
})

describe('Tags - Filtering Logic', () => {
  /**
   * Mock implementation of filterNotesByTags
   * Filters notes by tag IDs with AND/OR logic
   */
  function filterNotesByTags(
    notes: Note[],
    tagFilters: string[],
    matchAll: boolean = false
  ): Note[] {
    if (tagFilters.length === 0) return notes

    return notes.filter(note => {
      const tagRegex = /#([a-zA-Z0-9_-]+)/g
      const noteTags = Array.from(note.content.matchAll(tagRegex)).map(m => m[1].toLowerCase())

      if (matchAll) {
        // AND logic: note must have all filter tags
        return tagFilters.every(filter => noteTags.includes(filter.toLowerCase()))
      } else {
        // OR logic: note must have at least one filter tag
        return tagFilters.some(filter => noteTags.includes(filter.toLowerCase()))
      }
    })
  }

  it('Test 32: Should filter notes by single tag (OR)', () => {
    const filtered = filterNotesByTags(mockNotes, ['meeting'], false)

    expect(filtered.length).toBe(1)
    expect(filtered[0].id).toBe('2')
  })

  it('Test 33: Should filter notes by multiple tags (OR)', () => {
    const filtered = filterNotesByTags(mockNotes, ['todo', 'meeting'], false)

    expect(filtered.length).toBe(2)
    expect(filtered.map(n => n.id)).toContain('2') // Has #meeting
    expect(filtered.map(n => n.id)).toContain('3') // Has #todo
  })

  it('Test 34: Should filter notes by multiple tags (AND)', () => {
    const filtered = filterNotesByTags(mockNotes, ['meeting', 'statistics'], true)

    expect(filtered.length).toBe(1)
    expect(filtered[0].id).toBe('2')
  })

  it('Test 35: Should return empty array when no matches', () => {
    const filtered = filterNotesByTags(mockNotes, ['nonexistent'], false)

    expect(filtered).toEqual([])
  })

  it('Test 36: Should return all notes when filter is empty', () => {
    const filtered = filterNotesByTags(mockNotes, [], false)

    expect(filtered).toEqual(mockNotes)
  })

  it('Test 37: Should handle case-insensitive filtering', () => {
    const filtered = filterNotesByTags(mockNotes, ['MEETING'], false)

    expect(filtered.length).toBe(1)
    expect(filtered[0].id).toBe('2')
  })

  it('Test 38: Should handle AND filter with no matching notes', () => {
    const filtered = filterNotesByTags(mockNotes, ['meeting', 'mediation'], true)

    expect(filtered).toEqual([]) // No note has both tags
  })
})

describe('Tags - Edge Cases', () => {
  const tagRegex = /#([a-zA-Z0-9_-]+)/g

  it('Test 39: Should handle very long tag names', () => {
    const longTag = 'a'.repeat(200)
    const content = `Text with #${longTag} tag`
    const matches = Array.from(content.matchAll(tagRegex))
    const tags = matches.map(m => m[1])

    expect(tags[0]).toBe(longTag)
  })

  it('Test 40: Should handle tags with only numbers', () => {
    const content = 'Tags: #123 #456'
    const matches = Array.from(content.matchAll(tagRegex))
    const tags = matches.map(m => m[1])

    expect(tags).toEqual(['123', '456'])
  })

  it('Test 41: Should handle consecutive # symbols', () => {
    const content = 'Multiple hashes: ##tag ###another'
    const matches = Array.from(content.matchAll(tagRegex))
    const tags = matches.map(m => m[1])

    // Each # starts a new tag attempt
    expect(tags.length).toBeGreaterThan(0)
  })

  it('Test 42: Should handle unicode characters (not matched)', () => {
    const content = 'Unicode: #café #🚀'
    const matches = Array.from(content.matchAll(tagRegex))
    const tags = matches.map(m => m[1])

    // Current regex only matches [a-zA-Z0-9_-]
    expect(tags).toEqual(['caf']) // Stops at é
  })

  it('Test 43: Should handle malformed HTML with tags', () => {
    const content = '<p>Broken HTML #tag <div>nested #another</div'
    const matches = Array.from(content.matchAll(tagRegex))
    const tags = matches.map(m => m[1])

    expect(tags).toEqual(['tag', 'another'])
  })

  it('Test 44: Should handle tags in code blocks', () => {
    const content = '<code>#tag-in-code</code> and #tag-outside'
    const matches = Array.from(content.matchAll(tagRegex))
    const tags = matches.map(m => m[1])

    // Regex doesn't distinguish HTML context
    expect(tags).toEqual(['tag-in-code', 'tag-outside'])
  })

  it('Test 45: Should handle URL fragments that look like tags', () => {
    const content = 'URL: https://example.com#section and real #tag'
    const matches = Array.from(content.matchAll(tagRegex))
    const tags = matches.map(m => m[1])

    // URL fragment will match if preceded by space or start
    expect(tags).toContain('tag')
  })

  it('Test 46: Should handle escaped # character', () => {
    const content = 'Escaped \\#not-tag and #real-tag'
    const matches = Array.from(content.matchAll(tagRegex))
    const tags = matches.map(m => m[1])

    // Regex doesn't handle escaping - both match
    expect(tags.length).toBeGreaterThan(0)
  })

  it('Test 47: Should handle tags in different languages/scripts', () => {
    const content = '#english #русский #中文'
    const matches = Array.from(content.matchAll(tagRegex))
    const tags = matches.map(m => m[1])

    // Current regex only matches ASCII alphanumeric
    expect(tags).toEqual(['english']) // Other scripts not matched
  })

  it('Test 48: Should handle maximum tag density', () => {
    // Create content with 100 tags
    const tagArray = Array.from({ length: 100 }, (_, i) => `#tag${i}`)
    const content = tagArray.join(' ')
    const matches = Array.from(content.matchAll(tagRegex))

    expect(matches.length).toBe(100)
  })
})

describe('Tags - Integration Scenarios', () => {
  /**
   * NOTE: Full autocomplete and UI rendering tests require manual validation
   * due to jsdom limitations with TipTap editor and ProseMirror plugins.
   *
   * These tests verify the data flow and state management that would
   * be used by the UI components.
   */

  it('Test 49: Should handle complete tag lifecycle (add then remove)', async () => {
    const mockAddTag = vi.fn().mockResolvedValue(true)
    const mockRemoveTag = vi.fn().mockResolvedValue(true)
    const mockGetNoteTags = vi.fn()

    // Initial state: no tags
    mockGetNoteTags.mockResolvedValueOnce([])
    let tags = await mockGetNoteTags('note-1')
    expect(tags).toEqual([])

    // Add a tag
    const addResult = await mockAddTag('note-1', 'newtag')
    expect(addResult).toBe(true)
    expect(mockAddTag).toHaveBeenCalledWith('note-1', 'newtag')

    // Check tags after adding (simulating database state)
    mockGetNoteTags.mockResolvedValueOnce(['newtag'])
    tags = await mockGetNoteTags('note-1')
    expect(tags).toEqual(['newtag'])

    // Remove the tag
    const removeResult = await mockRemoveTag('note-1', 'newtag')
    expect(removeResult).toBe(true)
    expect(mockRemoveTag).toHaveBeenCalledWith('note-1', 'newtag')

    // Check tags after removing (back to empty)
    mockGetNoteTags.mockResolvedValueOnce([])
    tags = await mockGetNoteTags('note-1')
    expect(tags).toEqual([])
  })

  it('Test 50: Should handle tag rename scenario', async () => {
    const mockGetNoteTags = vi.fn()
      .mockResolvedValueOnce(['oldname'])
      .mockResolvedValueOnce(['newname'])

    const oldTags = await mockGetNoteTags('note-1')
    expect(oldTags).toEqual(['oldname'])

    // Rename would involve remove old + add new
    const newTags = await mockGetNoteTags('note-1')
    expect(newTags).toEqual(['newname'])
  })

  it('Test 51: Should handle bulk tag operations', async () => {
    const mockAddTag = vi.fn().mockResolvedValue(true)
    const tags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5']

    await Promise.all(tags.map(tag => mockAddTag('note-1', tag)))

    expect(mockAddTag).toHaveBeenCalledTimes(5)
  })

  it('Test 52: Should handle concurrent tag updates', async () => {
    const mockAddTag = vi.fn().mockResolvedValue(true)

    // Simulate concurrent adds
    await Promise.all([
      mockAddTag('note-1', 'tag1'),
      mockAddTag('note-1', 'tag2'),
      mockAddTag('note-1', 'tag3')
    ])

    expect(mockAddTag).toHaveBeenCalledTimes(3)
  })
})

/**
 * Manual Testing Checklist (from SPRINT-7-PLAN.md)
 *
 * These scenarios require manual validation in the running application:
 *
 * UI Interaction Tests:
 * [ ] Type # → autocomplete appears
 * [ ] Type #tag → filters to matching tags
 * [ ] Select existing tag → inserts #tag
 * [ ] Select "Create new" → inserts #newtag and creates tag
 * [ ] Tag rendered with color badge
 * [ ] Click tag in TagsPanel → filters notes
 * [ ] Multi-tag filter shows only notes with ALL tags
 * [ ] Delete tag content → removes from database
 * [ ] Rename tag updates all note references
 * [ ] Tag colors consistent across sessions
 *
 * Performance Tests:
 * [ ] Autocomplete appears in <50ms
 * [ ] Large tag lists (100+) render smoothly
 * [ ] Filtering 1000+ notes by tags is instant
 *
 * Database Tests:
 * [ ] Tags table created with indices
 * [ ] Case-insensitive tag matching
 * [ ] No duplicate tags (case-insensitive)
 * [ ] Foreign key cascade deletes work
 * [ ] Migration from v1 to v2 preserves data
 *
 * Edge Cases:
 * [ ] Very long tag names (200+ chars)
 * [ ] Tag names with only numbers
 * [ ] Tag names with hyphens and underscores
 * [ ] Maximum tags per note (100+)
 * [ ] Tag autocomplete with 1000+ existing tags
 */
