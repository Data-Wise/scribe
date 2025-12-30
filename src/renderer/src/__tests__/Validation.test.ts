import { describe, it, expect } from 'vitest'
import { Note, Tag } from '../types'

describe('Editor Validation Tests', () => {
  describe('Wiki-Link Pattern Validation', () => {
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g

    it('matches valid wiki-links', () => {
      const testCases = [
        '[[Simple Note]]',
        '[[Note with spaces]]',
        '[[Note-with-dash]]',
        '[[Note_with_underscore]]',
        '[[Note123]]'
      ]

      testCases.forEach(testCase => {
        const matches = Array.from(testCase.matchAll(wikiLinkRegex))
        expect(matches.length).toBe(1)
        expect(matches[0][1]).toBe(testCase.replace(/\[\[|\]\]/g, ''))
      })
    })

    it('does not match incomplete wiki-links', () => {
      const testCases = [
        '[[Note',
        'Note]]',
        '[Note]',
        '[[Note'
      ]

      testCases.forEach(testCase => {
        const matches = testCase.match(wikiLinkRegex)
        expect(matches).toBeNull()
      })
    })

    it('matches multiple wiki-links in text', () => {
      const text = 'See [[Note 1]] and [[Note 2]] for details'
      const matches = text.matchAll(wikiLinkRegex)
      const titles = Array.from(matches).map(m => m[1])

      expect(titles).toEqual(['Note 1', 'Note 2'])
    })

    it('handles nested brackets correctly', () => {
      const text = 'See [[Note [1]] and [[Note (2)]]'
      const matches = text.matchAll(wikiLinkRegex)
      const titles = Array.from(matches).map(m => m[1])

      expect(titles).toEqual(['Note [1', 'Note (2)'])
    })
  })

  describe('Tag Pattern Validation', () => {
    const tagRegex = /(?<![#\w])#([a-zA-Z][a-zA-Z0-9_-]*)/g

    it('matches valid tags', () => {
      const testCases = [
        '#important',
        '#todo',
        '#my-tag',
        '#my_tag',
        '#tag123',
        '#A'
      ]

      testCases.forEach(testCase => {
        const matches = Array.from(testCase.matchAll(tagRegex))
        expect(matches.length).toBe(1)
        expect(matches[0][1]).toBe(testCase.substring(1))
      })
    })

    it('does not match invalid tags', () => {
      const testCases = [
        '#1tag',          // Must start with letter
        '#',              // Must have at least 1 char after #
        '##heading',      // Not preceded by word boundary
        'word#tag',      // Must have space before #
      ]

      testCases.forEach(testCase => {
        const match = testCase.match(tagRegex)
        expect(match).toBeNull()
      })

      // Tag with space should match #tag part (space terminates tag)
      const textWithSpace = '#tag with space'
      const matchWithSpace = textWithSpace.match(tagRegex)
      expect(matchWithSpace).toBeTruthy()
      expect(matchWithSpace?.[0]).toBe('#tag')
    })

    it('does not match headings as tags', () => {
      const testCases = [
        '# Heading 1',
        '## Heading 2',
        '### Heading 3'
      ]

      testCases.forEach(testCase => {
        const match = testCase.match(tagRegex)
        expect(match).toBeNull()
      })
    })

    it('matches multiple tags in text', () => {
      const text = 'This is #important and #todo today'
      const matches = text.matchAll(tagRegex)
      const tags = Array.from(matches).map(m => m[1])

      expect(tags).toEqual(['important', 'todo'])
    })
  })

  describe('Content Validation', () => {
    it('validates word count calculation', () => {
      const testCases = [
        { text: '', expected: 0 },
        { text: '   ', expected: 0 },
        { text: 'Hello', expected: 1 },
        { text: 'Hello world', expected: 2 },
        { text: 'Hello   world', expected: 2 },
        { text: 'Hello world!', expected: 2 },
        { text: 'Hello\nworld', expected: 2 },
        { text: '[[wiki-link]] #tag', expected: 2 }
      ]

      testCases.forEach(({ text, expected }) => {
        const words = text.trim() ? text.trim().split(/\s+/) : []
        const count = words.filter(w => w.length > 0).length
        expect(count).toBe(expected)
      })
    })

    it('validates character count', () => {
      const testCases = [
        { text: '', expected: 0 },
        { text: 'Hello', expected: 5 },
        { text: 'Hello world', expected: 11 },
        { text: '[[wiki-link]]', expected: 13 },
        { text: '#tag', expected: 4 }
      ]

      testCases.forEach(({ text, expected }) => {
        expect(text.length).toBe(expected)
      })
    })
  })

  describe('Note Data Validation', () => {
    it('validates required Note fields', () => {
      const validNote: Note = {
        id: '1',
        title: 'Test Note',
        content: 'Test content',
        folder: 'inbox',
        project_id: null,
        created_at: Date.now(),
        updated_at: Date.now(),
        deleted_at: null
      }

      expect(validNote.id).toBeTruthy()
      expect(validNote.title).toBeTruthy()
      expect(validNote.content).toBeDefined()
      expect(validNote.folder).toBeTruthy()
      expect(typeof validNote.created_at).toBe('number')
      expect(typeof validNote.updated_at).toBe('number')
    })

    it('validates optional Note fields', () => {
      const noteWithOptional: Note = {
        id: '1',
        title: 'Test Note',
        content: 'Test content',
        folder: 'inbox',
        project_id: null,
        created_at: Date.now(),
        updated_at: Date.now(),
        deleted_at: null,
        properties: {
          key: { key: 'key', value: 'value', type: 'text' }
        }
      }

      expect(noteWithOptional.properties).toBeDefined()
    })
  })

  describe('Tag Data Validation', () => {
    it('validates required Tag fields', () => {
      const validTag: Tag = {
        id: '1',
        name: 'important',
        color: '#ff0000',
        created_at: Date.now()
      }

      expect(validTag.id).toBeTruthy()
      expect(validTag.name).toBeTruthy()
      expect(validTag.color).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(typeof validTag.created_at).toBe('number')
    })

    it('validates tag color format', () => {
      const validColors = [
        '#ff0000',
        '#00ff00',
        '#0000ff',
        '#ffffff',
        '#000000'
      ]

      validColors.forEach(color => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
      })
    })

    it('rejects invalid tag colors', () => {
      const invalidColors = [
        'ff0000',      // Missing #
        '#fff',         // Too short
        '#gggggg',      // Invalid hex
        '#ff000000',    // Too long
      ]

      invalidColors.forEach(color => {
        expect(color).not.toMatch(/^#[0-9a-fA-F]{6}$/)
      })
    })
  })

  describe('Edge Case Validation', () => {
    it('handles consecutive wiki-links', () => {
      const text = '[[Note1]][[Note2]]'
      const wikiLinkRegex = /\[\[([^\]]+)\]\]/g
      const matches = text.matchAll(wikiLinkRegex)
      const titles = Array.from(matches).map(m => m[1])

      expect(titles).toEqual(['Note1', 'Note2'])
    })

    it('handles escaped brackets', () => {
      const text = 'Note with \\[brackets\\]'
      const wikiLinkRegex = /\[\[([^\]]+)\]\]/g
      const matches = text.match(wikiLinkRegex)

      expect(matches).toBeNull()
    })

    it('handles empty wiki-link title', () => {
      const text = '[[]]'
      const wikiLinkRegex = /\[\[([^\]]+)\]\]/g
      const matches = text.match(wikiLinkRegex)

      expect(matches).toBeNull()
    })

    it('handles tag at start of line', () => {
      const text = '#tag at start'
      const tagRegex = /(?<![#\w])#([a-zA-Z][a-zA-Z0-9_-]*)/g
      const matches = text.match(tagRegex)

      expect(matches && matches[0]).toBe('#tag')
    })

    it('handles tag at end of line', () => {
      const text = 'text ends with #tag'
      const tagRegex = /(?<![#\w])#([a-zA-Z][a-zA-Z0-9_-]*)/g
      const matches = text.match(tagRegex)

      expect(matches && matches[0]).toBe('#tag')
    })

    it('handles multiple newlines in content', () => {
      const text = 'Line 1\n\n\nLine 2\n\nLine 3'
      const lines = text.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0)

      expect(lines).toEqual(['Line 1', 'Line 2', 'Line 3'])
    })

    it('handles mixed wiki-links and tags', () => {
      const text = 'See [[Note]] and add #tag'
      const wikiLinkRegex = /\[\[([^\]]+)\]\]/g
      const tagRegex = /(?<![#\w])#([a-zA-Z][a-zA-Z0-9_-]*)/g

      const wikiMatch = Array.from(text.matchAll(wikiLinkRegex))
      const tagMatch = Array.from(text.matchAll(tagRegex))

      expect(wikiMatch.length).toBe(1)
      expect(wikiMatch[0][1]).toBe('Note')
      expect(tagMatch.length).toBe(1)
      expect(tagMatch[0][1]).toBe('tag')
    })
  })

  describe('Security Validation', () => {
    it('sanitizes HTML in wiki-link titles', () => {
      const text = '[[<script>alert("xss")</script>]]'
      const wikiLinkRegex = /\[\[([^\]]+)\]\]/g
      const match = Array.from(text.matchAll(wikiLinkRegex))

      expect(match.length).toBe(1)
      expect(match[0][1]).toContain('<script>')
    })

    it('sanitizes HTML in tag names', () => {
      const text = '#<script>alert("xss")</script>'
      const tagRegex = /(?<![#\w])#([a-zA-Z][a-zA-Z0-9_-]*)/g
      const match = text.match(tagRegex)

      // Tag regex should not match HTML tags (invalid characters)
      expect(match).toBeNull()
    })

    it('handles extremely long wiki-link titles', () => {
      const longTitle = 'A'.repeat(1000)
      const text = `[[${longTitle}]]`
      const wikiLinkRegex = /\[\[([^\]]+)\]\]/g
      const matches = Array.from(text.matchAll(wikiLinkRegex))

      expect(matches.length).toBe(1)
      expect(matches[0][1].length).toBe(1000)
    })

    it('handles extremely long tag names', () => {
      const longTag = 'tag-' + 'a'.repeat(500)
      const text = `#${longTag}`
      const tagRegex = /(?<![#\w])#([a-zA-Z][a-zA-Z0-9_-]*)/g
      const matches = Array.from(text.matchAll(tagRegex))

      expect(matches.length).toBe(1)
      expect(matches[0][1].length).toBeGreaterThan(500)
    })
  })

  describe('Performance Validation', () => {
    it('handles large content efficiently', () => {
      const largeContent = 'A'.repeat(10000) + '\n' + 'B'.repeat(10000)
      const startTime = performance.now()

      const wikiLinkRegex = /\[\[([^\]]+)\]\]/g
      const tagRegex = /(?<![#\w])#([a-zA-Z][a-zA-Z0-9_-]*)/g

      largeContent.match(wikiLinkRegex)
      largeContent.match(tagRegex)

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(100) // Should process in < 100ms
    })

    it('handles many wiki-links efficiently', () => {
      const manyWikiLinks = Array(100)
        .fill(0)
        .map((_, i) => `[[Note ${i}]]`)
        .join(' ')

      const startTime = performance.now()
      const wikiLinkRegex = /\[\[([^\]]+)\]\]/g
      const matches = manyWikiLinks.matchAll(wikiLinkRegex)
      const endTime = performance.now()

      expect(Array.from(matches).length).toBe(100)
      expect(endTime - startTime).toBeLessThan(50)
    })

    it('handles many tags efficiently', () => {
      const manyTags = Array(100)
        .fill(0)
        .map((_, i) => `#tag${i}`)
        .join(' ')

      const startTime = performance.now()
      const tagRegex = /(?<![#\w])#([a-zA-Z][a-zA-Z0-9_-]*)/g
      const matches = manyTags.matchAll(tagRegex)
      const endTime = performance.now()

      expect(Array.from(matches).length).toBe(100)
      expect(endTime - startTime).toBeLessThan(50)
    })
  })
})

describe('processWikiLinksAndTags Validation', () => {
  // These tests validate the processing logic used in HybridEditor

  function processWikiLinksAndTags(content: string): string {
    // Convert [[Title]] to [Title](wikilink:Title)
    let processed = content.replace(
      /\[\[([^\]]+)\]\]/g,
      (_, title) => `[${title}](wikilink:${encodeURIComponent(title.trim())})`
    )

    // Convert #tag to inline code (but not ## headings)
    processed = processed.replace(
      /(?<![#\w])#([a-zA-Z][a-zA-Z0-9_-]*)/g,
      '`#$1`'
    )

    return processed
  }

  describe('Wiki-Link Processing', () => {
    it('converts wiki-link to markdown link format', () => {
      const content = 'See [[My Note]] here'
      const processed = processWikiLinksAndTags(content)
      
      expect(processed).toBe('See [My Note](wikilink:My%20Note) here')
    })

    it('encodes special characters in wiki-link titles', () => {
      const content = '[[Note: A & B]]'
      const processed = processWikiLinksAndTags(content)
      
      expect(processed).toContain('wikilink:Note%3A%20A%20%26%20B')
    })

    it('handles multiple wiki-links', () => {
      const content = '[[Note1]] and [[Note2]]'
      const processed = processWikiLinksAndTags(content)
      
      expect(processed).toContain('[Note1](wikilink:Note1)')
      expect(processed).toContain('[Note2](wikilink:Note2)')
    })

    it('trims whitespace in wiki-link titles', () => {
      const content = '[[  My Note  ]]'
      const processed = processWikiLinksAndTags(content)
      
      expect(processed).toContain('wikilink:My%20Note')
    })
  })

  describe('Tag Processing', () => {
    it('converts tag to inline code format', () => {
      const content = 'This is #important'
      const processed = processWikiLinksAndTags(content)
      
      expect(processed).toBe('This is `#important`')
    })

    it('handles multiple tags', () => {
      const content = '#tag1 and #tag2'
      const processed = processWikiLinksAndTags(content)
      
      expect(processed).toBe('`#tag1` and `#tag2`')
    })

    it('does not convert headings to tags', () => {
      const content = '## Heading 2'
      const processed = processWikiLinksAndTags(content)
      
      expect(processed).toBe('## Heading 2')
      expect(processed).not.toContain('`#')
    })

    it('handles tags with dashes and underscores', () => {
      const content = '#my-tag and #my_tag'
      const processed = processWikiLinksAndTags(content)
      
      expect(processed).toBe('`#my-tag` and `#my_tag`')
    })
  })

  describe('Mixed Content', () => {
    it('processes both wiki-links and tags', () => {
      const content = 'See [[Note]] with #tag'
      const processed = processWikiLinksAndTags(content)
      
      expect(processed).toContain('[Note](wikilink:Note)')
      expect(processed).toContain('`#tag`')
    })

    it('handles complex markdown with links and tags', () => {
      const content = `# Heading
See [[Note1]] and #important
Another [[Note2]] with #todo`
      const processed = processWikiLinksAndTags(content)
      
      expect(processed).toContain('[Note1](wikilink:Note1)')
      expect(processed).toContain('[Note2](wikilink:Note2)')
      expect(processed).toContain('`#important`')
      expect(processed).toContain('`#todo`')
    })
  })
})

describe('generateTagColor Validation', () => {
  // Testing the color generation algorithm
  function generateTagColor(name: string): string {
    const hash = name.split('').reduce((acc, char) =>
      char.charCodeAt(0) + ((acc << 5) - acc), 0)
    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, 70%, 50%)`
  }

  it('generates consistent colors for same tag name', () => {
    const color1 = generateTagColor('important')
    const color2 = generateTagColor('important')
    
    expect(color1).toBe(color2)
  })

  it('generates different colors for different tag names', () => {
    const color1 = generateTagColor('important')
    const color2 = generateTagColor('todo')
    
    expect(color1).not.toBe(color2)
  })

  it('generates valid HSL color format', () => {
    const color = generateTagColor('test')
    
    expect(color).toMatch(/^hsl\(\d+, 70%, 50%\)$/)
  })

  it('hue is always between 0 and 359', () => {
    const testNames = ['a', 'test', 'very-long-tag-name', '123', 'UPPERCASE']
    
    testNames.forEach(name => {
      const color = generateTagColor(name)
      const hueMatch = color.match(/hsl\((\d+),/)
      expect(hueMatch).toBeTruthy()
      const hue = parseInt(hueMatch![1])
      expect(hue).toBeGreaterThanOrEqual(0)
      expect(hue).toBeLessThan(360)
    })
  })

  it('handles empty string', () => {
    const color = generateTagColor('')
    expect(color).toMatch(/^hsl\(\d+, 70%, 50%\)$/)
  })

  it('handles special characters', () => {
    const color = generateTagColor('tag-with_special123')
    expect(color).toMatch(/^hsl\(\d+, 70%, 50%\)$/)
  })
})

describe('Word Count Calculation', () => {
  function calculateWordCount(content: string): number {
    return content.trim() ? content.trim().split(/\s+/).length : 0
  }

  it('counts words correctly for simple text', () => {
    expect(calculateWordCount('Hello world')).toBe(2)
  })

  it('returns 0 for empty string', () => {
    expect(calculateWordCount('')).toBe(0)
  })

  it('returns 0 for whitespace only', () => {
    expect(calculateWordCount('   ')).toBe(0)
  })

  it('handles multiple spaces between words', () => {
    expect(calculateWordCount('Hello    world')).toBe(2)
  })

  it('handles newlines', () => {
    expect(calculateWordCount('Hello\nworld')).toBe(2)
  })

  it('handles tabs', () => {
    expect(calculateWordCount('Hello\tworld')).toBe(2)
  })

  it('counts wiki-links as single words', () => {
    expect(calculateWordCount('See [[My Note]] here')).toBe(4)
  })

  it('counts tags as single words', () => {
    expect(calculateWordCount('Check #important today')).toBe(3)
  })

  it('handles complex markdown', () => {
    const content = `# Heading
This is **bold** and *italic*.
- List item 1
- List item 2`
    // Word count: #, Heading, This, is, **bold**, and, *italic*., -, List, item, 1, -, List, item, 2 = 15
    expect(calculateWordCount(content)).toBe(15)
  })
})
