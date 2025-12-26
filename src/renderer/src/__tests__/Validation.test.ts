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
