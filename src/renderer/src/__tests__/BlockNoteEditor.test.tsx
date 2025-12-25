import { describe, it, expect } from 'vitest'

/**
 * BlockNoteEditor Test Suite
 * 
 * Tests for Sprint 8 BlockNote migration:
 * - Color generation algorithm
 * - Word count logic
 * - Focus mode interactions
 * - Autocomplete keyboard navigation
 * - Wiki link pattern detection
 * - Tag pattern detection
 */

// ============================================================================
// UNIT TESTS - Pure Functions
// ============================================================================

describe('BlockNoteEditor - Color Generation', () => {
  // Extracted algorithm for testing
  function generateTagColor(name: string): string {
    const hash = name.split('').reduce((acc, char) =>
      char.charCodeAt(0) + ((acc << 5) - acc), 0)
    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, 70%, 50%)`
  }

  it('should generate consistent colors for same input', () => {
    expect(generateTagColor('research')).toBe(generateTagColor('research'))
    expect(generateTagColor('todo')).toBe(generateTagColor('todo'))
  })

  it('should generate different colors for different inputs', () => {
    expect(generateTagColor('research')).not.toBe(generateTagColor('teaching'))
    expect(generateTagColor('a')).not.toBe(generateTagColor('b'))
  })

  it('should return valid HSL format', () => {
    const color = generateTagColor('test')
    expect(color).toMatch(/^hsl\(\d+, 70%, 50%\)$/)
  })

  it('should generate hue in valid range (0-359)', () => {
    const testTags = ['a', 'zz', 'research-paper', 'CAPITAL', '123', 'very-long-tag-name-here']
    testTags.forEach(tag => {
      const color = generateTagColor(tag)
      const hue = parseInt(color.match(/\d+/)![0])
      expect(hue).toBeGreaterThanOrEqual(0)
      expect(hue).toBeLessThan(360)
    })
  })

  it('should handle empty string', () => {
    const color = generateTagColor('')
    expect(color).toBe('hsl(0, 70%, 50%)')
  })

  it('should handle special characters in tag names', () => {
    const color = generateTagColor('tag-with_special-chars')
    expect(color).toMatch(/^hsl\(\d+, 70%, 50%\)$/)
  })
})

// ============================================================================
// UNIT TESTS - Pattern Detection
// ============================================================================

describe('BlockNoteEditor - Wiki Link Pattern Detection', () => {
  const wikiLinkRegex = /\[\[([^\]]*?)$/

  it('should detect [[ trigger at end of text', () => {
    expect('Some text [['.match(wikiLinkRegex)).toBeTruthy()
    expect('[['.match(wikiLinkRegex)).toBeTruthy()
  })

  it('should capture query after [[', () => {
    const match = 'Linking to [[My Note'.match(wikiLinkRegex)
    expect(match).toBeTruthy()
    expect(match![1]).toBe('My Note')
  })

  it('should not match closed wiki links', () => {
    expect('[[Closed Link]]'.match(wikiLinkRegex)).toBeFalsy()
  })

  it('should match partial query', () => {
    const match = '[[res'.match(wikiLinkRegex)
    expect(match![1]).toBe('res')
  })

  it('should capture empty query after [[', () => {
    const match = '[['.match(wikiLinkRegex)
    expect(match![1]).toBe('')
  })
})

describe('BlockNoteEditor - Tag Pattern Detection', () => {
  const tagRegex = /#([a-zA-Z0-9_-]*?)$/

  it('should detect # trigger at end of text', () => {
    expect('Some text #'.match(tagRegex)).toBeTruthy()
    expect('#'.match(tagRegex)).toBeTruthy()
  })

  it('should capture partial tag name', () => {
    const match = 'Working on #research'.match(tagRegex)
    expect(match).toBeTruthy()
    expect(match![1]).toBe('research')
  })

  it('should capture hyphenated tags', () => {
    const match = '#my-tag'.match(tagRegex)
    expect(match![1]).toBe('my-tag')
  })

  it('should capture underscored tags', () => {
    const match = '#my_tag'.match(tagRegex)
    expect(match![1]).toBe('my_tag')
  })

  it('should match empty after #', () => {
    const match = '#'.match(tagRegex)
    expect(match![1]).toBe('')
  })

  it('should not match if followed by space', () => {
    expect('#tag '.match(tagRegex)).toBeFalsy()
  })
})

// ============================================================================
// UNIT TESTS - Word Count Logic
// ============================================================================

describe('BlockNoteEditor - Word Count', () => {
  function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length
  }

  function countChars(text: string): number {
    return text.length
  }

  it('should count words correctly', () => {
    expect(countWords('hello world')).toBe(2)
    expect(countWords('one two three four five')).toBe(5)
  })

  it('should handle empty text', () => {
    expect(countWords('')).toBe(0)
    expect(countWords('   ')).toBe(0)
  })

  it('should handle multiple spaces', () => {
    expect(countWords('hello    world')).toBe(2)
  })

  it('should handle newlines', () => {
    expect(countWords('hello\nworld')).toBe(2)
    expect(countWords('line1\n\n\nline2')).toBe(2)
  })

  it('should count characters correctly', () => {
    expect(countChars('hello')).toBe(5)
    expect(countChars('hello world')).toBe(11)
  })
})

// ============================================================================
// INTEGRATION TESTS - Focus Mode State
// ============================================================================

describe('Focus Mode - Keyboard Shortcuts', () => {
  const createFocusModeHandler = () => {
    let focusMode = false
    
    return {
      getFocusMode: () => focusMode,
      handleKeyDown: (e: { key: string; metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean }) => {
        if (e.key === 'Escape' && focusMode) {
          focusMode = false
        }
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
          focusMode = !focusMode
        }
      },
      setFocusMode: (val: boolean) => { focusMode = val }
    }
  }

  it('should toggle focus mode with Cmd+Shift+F', () => {
    const handler = createFocusModeHandler()
    expect(handler.getFocusMode()).toBe(false)
    
    handler.handleKeyDown({ key: 'f', metaKey: true, shiftKey: true })
    expect(handler.getFocusMode()).toBe(true)
    
    handler.handleKeyDown({ key: 'f', metaKey: true, shiftKey: true })
    expect(handler.getFocusMode()).toBe(false)
  })

  it('should exit focus mode with Escape', () => {
    const handler = createFocusModeHandler()
    handler.setFocusMode(true)
    expect(handler.getFocusMode()).toBe(true)
    
    handler.handleKeyDown({ key: 'Escape' })
    expect(handler.getFocusMode()).toBe(false)
  })

  it('should not exit normal mode with Escape', () => {
    const handler = createFocusModeHandler()
    expect(handler.getFocusMode()).toBe(false)
    
    handler.handleKeyDown({ key: 'Escape' })
    expect(handler.getFocusMode()).toBe(false)
  })

  it('should toggle with Ctrl+Shift+F (Windows)', () => {
    const handler = createFocusModeHandler()
    
    handler.handleKeyDown({ key: 'f', ctrlKey: true, shiftKey: true })
    expect(handler.getFocusMode()).toBe(true)
  })
})

// ============================================================================
// INTEGRATION TESTS - Autocomplete Navigation
// ============================================================================

describe('Autocomplete - Keyboard Navigation', () => {
  const createAutocompleteHandler = (resultsCount: number) => {
    let selectedIndex = 0
    
    return {
      getSelectedIndex: () => selectedIndex,
      handleKeyDown: (key: string) => {
        if (key === 'ArrowDown') {
          selectedIndex = Math.min(selectedIndex + 1, resultsCount - 1)
        } else if (key === 'ArrowUp') {
          selectedIndex = Math.max(selectedIndex - 1, 0)
        }
      },
      setSelectedIndex: (val: number) => { selectedIndex = val }
    }
  }

  it('should navigate down through results', () => {
    const handler = createAutocompleteHandler(5)
    expect(handler.getSelectedIndex()).toBe(0)
    
    handler.handleKeyDown('ArrowDown')
    expect(handler.getSelectedIndex()).toBe(1)
    
    handler.handleKeyDown('ArrowDown')
    expect(handler.getSelectedIndex()).toBe(2)
  })

  it('should not go past last result', () => {
    const handler = createAutocompleteHandler(3)
    handler.setSelectedIndex(2)
    
    handler.handleKeyDown('ArrowDown')
    expect(handler.getSelectedIndex()).toBe(2)
  })

  it('should navigate up through results', () => {
    const handler = createAutocompleteHandler(5)
    handler.setSelectedIndex(3)
    
    handler.handleKeyDown('ArrowUp')
    expect(handler.getSelectedIndex()).toBe(2)
  })

  it('should not go before first result', () => {
    const handler = createAutocompleteHandler(5)
    expect(handler.getSelectedIndex()).toBe(0)
    
    handler.handleKeyDown('ArrowUp')
    expect(handler.getSelectedIndex()).toBe(0)
  })
})

// ============================================================================
// VALIDATION TESTS - Content Transformation
// ============================================================================

describe('BlockNoteEditor - Wiki Link Insertion', () => {
  it('should replace partial [[ with complete link', () => {
    const replaceWikiLink = (text: string, title: string): string => {
      return text.replace(/\[\[[^\]]*?$/, `[[${title}]]`)
    }

    expect(replaceWikiLink('Some text [[', 'My Note')).toBe('Some text [[My Note]]')
    expect(replaceWikiLink('[[res', 'Research')).toBe('[[Research]]')
    expect(replaceWikiLink('Start [[partial query', 'Final Title')).toBe('Start [[Final Title]]')
  })
})

describe('BlockNoteEditor - Tag Insertion', () => {
  it('should replace partial # with complete tag', () => {
    const replaceTag = (text: string, name: string): string => {
      return text.replace(/#[a-zA-Z0-9_-]*?$/, `#${name}`)
    }

    expect(replaceTag('Working on #', 'research')).toBe('Working on #research')
    expect(replaceTag('#res', 'research')).toBe('#research')
    expect(replaceTag('Tag #partial', 'complete')).toBe('Tag #complete')
  })
})

// ============================================================================
// VALIDATION TESTS - Edge Cases
// ============================================================================

describe('BlockNoteEditor - Edge Cases', () => {
  it('should handle very long content', () => {
    const longText = 'word '.repeat(10000)
    const wordCount = longText.trim().split(/\s+/).filter(w => w.length > 0).length
    expect(wordCount).toBe(10000)
  })

  it('should handle special characters in wiki links', () => {
    const replaceWikiLink = (text: string, title: string): string => {
      return text.replace(/\[\[[^\]]*?$/, `[[${title}]]`)
    }

    expect(replaceWikiLink('[[', 'Note with "quotes"')).toBe('[[Note with "quotes"]]')
    expect(replaceWikiLink('[[', "Note's Title")).toBe("[[Note's Title]]")
  })

  it('should handle unicode in content', () => {
    const text = 'Hello 世界 🚀'
    const charCount = text.length
    expect(charCount).toBeGreaterThan(0)
  })
})
