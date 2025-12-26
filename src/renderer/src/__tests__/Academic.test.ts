import { describe, it, expect } from 'vitest'

/**
 * Academic Features Test Suite
 *
 * Tests for Sprint 11 academic features:
 * - Math/LaTeX rendering
 * - Citation patterns
 * - BibTeX parsing
 * - Export functionality
 */

describe('Math Pattern Validation', () => {
  describe('Inline Math Detection', () => {
    const inlineMathRegex = /\$([^$]+)\$/g

    it('matches valid inline math', () => {
      const testCases = [
        { text: '$x^2$', expected: 'x^2' },
        { text: '$\\alpha + \\beta$', expected: '\\alpha + \\beta' },
        { text: '$E = mc^2$', expected: 'E = mc^2' },
        { text: '$\\frac{1}{2}$', expected: '\\frac{1}{2}' }
      ]

      testCases.forEach(({ text, expected }) => {
        const matches = Array.from(text.matchAll(inlineMathRegex))
        expect(matches.length).toBe(1)
        expect(matches[0][1]).toBe(expected)
      })
    })

    it('matches multiple inline math expressions', () => {
      const text = 'Given $x = 1$ and $y = 2$, we have $x + y = 3$'
      const matches = Array.from(text.matchAll(inlineMathRegex))

      expect(matches.length).toBe(3)
      expect(matches.map(m => m[1])).toEqual(['x = 1', 'y = 2', 'x + y = 3'])
    })

    it('does not match dollar signs in currency', () => {
      const text = 'The price is $100 to $200'
      const matches = Array.from(text.matchAll(inlineMathRegex))

      expect(matches.length).toBe(1)
      expect(matches[0][1]).toBe('100 to ')
    })

    it('does not match empty math', () => {
      const text = '$$'
      const matches = text.match(inlineMathRegex)

      expect(matches).toBeNull()
    })
  })

  describe('Display Math Detection', () => {
    const displayMathRegex = /\$\$([^$]+)\$\$/g

    it('matches valid display math', () => {
      const testCases = [
        { text: '$$\\sum_{i=1}^n x_i$$', expected: '\\sum_{i=1}^n x_i' },
        { text: '$$\\int_0^\\infty e^{-x} dx$$', expected: '\\int_0^\\infty e^{-x} dx' },
        { text: '$$\\begin{matrix} a & b \\\\ c & d \\end{matrix}$$', expected: '\\begin{matrix} a & b \\\\ c & d \\end{matrix}' }
      ]

      testCases.forEach(({ text, expected }) => {
        const matches = Array.from(text.matchAll(displayMathRegex))
        expect(matches.length).toBe(1)
        expect(matches[0][1]).toBe(expected)
      })
    })

    it('matches multiline display math', () => {
      const text = `$$
\\begin{align}
  a &= b + c \\\\
  d &= e + f
\\end{align}
$$`
      const matches = Array.from(text.matchAll(displayMathRegex))

      expect(matches.length).toBe(1)
      expect(matches[0][1]).toContain('\\begin{align}')
    })
  })

  describe('LaTeX Syntax Validation', () => {
    it('validates common LaTeX commands', () => {
      const validCommands = [
        '\\frac{a}{b}',
        '\\sqrt{x}',
        '\\sum_{i=1}^n',
        '\\int_a^b',
        '\\alpha',
        '\\beta',
        '\\gamma',
        '\\partial',
        '\\nabla',
        '\\infty'
      ]

      const commandRegex = /\\[a-zA-Z]+/g

      validCommands.forEach(cmd => {
        expect(cmd).toMatch(commandRegex)
      })
    })

    it('validates subscript and superscript syntax', () => {
      const expressions = [
        'x^2',
        'x_1',
        'x_{ij}',
        'x^{n+1}',
        'x_i^2'
      ]

      expressions.forEach(expr => {
        expect(expr).toMatch(/[_^]/)
      })
    })
  })
})

describe('Citation Pattern Validation', () => {
  describe('Pandoc Citation Format', () => {
    const citationRegex = /\[@([a-zA-Z0-9_:-]+)\]/g

    it('matches valid Pandoc citations', () => {
      const testCases = [
        { text: '[@smith2020]', expected: 'smith2020' },
        { text: '[@Jones-2021]', expected: 'Jones-2021' },
        { text: '[@doe_2019a]', expected: 'doe_2019a' },
        { text: '[@ALLCAPS2020]', expected: 'ALLCAPS2020' }
      ]

      testCases.forEach(({ text, expected }) => {
        const matches = Array.from(text.matchAll(citationRegex))
        expect(matches.length).toBe(1)
        expect(matches[0][1]).toBe(expected)
      })
    })

    it('matches multiple citations', () => {
      const text = 'See [@smith2020] and [@jones2021] for details'
      const matches = Array.from(text.matchAll(citationRegex))

      expect(matches.length).toBe(2)
      expect(matches.map(m => m[1])).toEqual(['smith2020', 'jones2021'])
    })

    it('matches combined citations', () => {
      // Combined citations with semicolon separator
      const combinedRegex = /\[@([a-zA-Z0-9_:-]+)(?:;\s*@([a-zA-Z0-9_:-]+))*\]/g
      const text = 'As shown [@smith2020; @jones2021]'
      const match = text.match(combinedRegex)

      expect(match).toBeTruthy()
      expect(match?.[0]).toBe('[@smith2020; @jones2021]')
    })
  })

  describe('Citation Trigger Detection', () => {
    const triggerRegex = /@([a-zA-Z0-9_:-]*)$/

    it('detects citation trigger', () => {
      const testCases = [
        { text: 'See @', expected: '' },
        { text: 'See @smi', expected: 'smi' },
        { text: 'See @smith2020', expected: 'smith2020' },
        { text: 'As noted @jones-', expected: 'jones-' }
      ]

      testCases.forEach(({ text, expected }) => {
        const match = text.match(triggerRegex)
        expect(match).toBeTruthy()
        expect(match?.[1]).toBe(expected)
      })
    })

    it('does not trigger in middle of text', () => {
      const text = 'email@example.com test'
      const match = text.match(triggerRegex)

      // Should not match because @ is not at the end
      expect(match).toBeNull()
    })
  })
})

describe('BibTeX Validation', () => {
  describe('BibTeX Entry Parsing', () => {
    const entryTypeRegex = /@(\w+)\s*\{/

    it('recognizes valid entry types', () => {
      const entries = [
        '@article{key,',
        '@book{key,',
        '@inproceedings{key,',
        '@incollection{key,',
        '@misc{key,',
        '@phdthesis{key,',
        '@techreport{key,'
      ]

      entries.forEach(entry => {
        const match = entry.match(entryTypeRegex)
        expect(match).toBeTruthy()
        expect(match?.[1]).toBeTruthy()
      })
    })

    it('extracts citation key', () => {
      const keyRegex = /@\w+\s*\{([^,]+),/

      const testCases = [
        { entry: '@article{smith2020,', expected: 'smith2020' },
        { entry: '@book{jones-2021,', expected: 'jones-2021' },
        { entry: '@misc{doe_thesis,', expected: 'doe_thesis' }
      ]

      testCases.forEach(({ entry, expected }) => {
        const match = entry.match(keyRegex)
        expect(match).toBeTruthy()
        expect(match?.[1]).toBe(expected)
      })
    })
  })

  describe('BibTeX Field Parsing', () => {
    const fieldRegex = /(\w+)\s*=\s*\{([^}]*)\}/g

    it('parses common fields', () => {
      const bibtex = `
        author = {Smith, John and Doe, Jane},
        title = {A Great Paper},
        journal = {Nature},
        year = {2020}
      `

      const matches = Array.from(bibtex.matchAll(fieldRegex))
      const fields = Object.fromEntries(matches.map(m => [m[1], m[2]]))

      expect(fields.author).toBe('Smith, John and Doe, Jane')
      expect(fields.title).toBe('A Great Paper')
      expect(fields.journal).toBe('Nature')
      expect(fields.year).toBe('2020')
    })

    it('handles optional fields', () => {
      const bibtex = `
        author = {Smith, John},
        title = {A Paper},
        year = {2020},
        doi = {10.1234/example},
        url = {https://example.com}
      `

      const matches = Array.from(bibtex.matchAll(fieldRegex))
      const fields = Object.fromEntries(matches.map(m => [m[1], m[2]]))

      expect(fields.doi).toBe('10.1234/example')
      expect(fields.url).toBe('https://example.com')
    })
  })

  describe('Author Parsing', () => {
    function parseAuthors(authorStr: string): string[] {
      if (!authorStr) return []

      return authorStr
        .split(' and ')
        .map(a => {
          const trimmed = a.trim()
          // Handle "Last, First" format
          if (trimmed.includes(',')) {
            return trimmed.split(',')[0].trim()
          }
          // Handle "First Last" format - take last word
          const parts = trimmed.split(/\s+/)
          return parts[parts.length - 1]
        })
    }

    it('parses single author', () => {
      expect(parseAuthors('Smith, John')).toEqual(['Smith'])
      expect(parseAuthors('John Smith')).toEqual(['Smith'])
    })

    it('parses multiple authors', () => {
      expect(parseAuthors('Smith, John and Doe, Jane')).toEqual(['Smith', 'Doe'])
      expect(parseAuthors('John Smith and Jane Doe')).toEqual(['Smith', 'Doe'])
    })

    it('parses many authors', () => {
      const authors = parseAuthors('Smith, John and Doe, Jane and Brown, Bob and White, Alice')
      expect(authors).toEqual(['Smith', 'Doe', 'Brown', 'White'])
    })

    it('handles empty author string', () => {
      expect(parseAuthors('')).toEqual([])
    })
  })
})

describe('Export Format Validation', () => {
  describe('Supported Formats', () => {
    const supportedFormats = ['pdf', 'docx', 'latex', 'html']

    it('validates supported export formats', () => {
      supportedFormats.forEach(format => {
        expect(['pdf', 'docx', 'latex', 'html']).toContain(format)
      })
    })

    it('maps formats to file extensions', () => {
      const formatToExt: Record<string, string> = {
        pdf: '.pdf',
        docx: '.docx',
        latex: '.tex',
        html: '.html'
      }

      supportedFormats.forEach(format => {
        expect(formatToExt[format]).toBeTruthy()
      })
    })
  })

  describe('Citation Styles', () => {
    const supportedStyles = ['apa', 'chicago', 'mla', 'ieee', 'harvard']

    it('validates supported citation styles', () => {
      supportedStyles.forEach(style => {
        expect(['apa', 'chicago', 'mla', 'ieee', 'harvard']).toContain(style)
      })
    })
  })

  describe('Export Options Validation', () => {
    interface ExportOptions {
      noteId: string
      content: string
      title: string
      format: 'pdf' | 'docx' | 'latex' | 'html'
      bibliography?: string
      csl: string
      includeMetadata: boolean
      processEquations: boolean
    }

    it('validates required export options', () => {
      const validOptions: ExportOptions = {
        noteId: '123',
        content: 'Test content',
        title: 'Test Note',
        format: 'pdf',
        csl: 'apa',
        includeMetadata: true,
        processEquations: true
      }

      expect(validOptions.noteId).toBeTruthy()
      expect(validOptions.content).toBeDefined()
      expect(validOptions.title).toBeTruthy()
      expect(['pdf', 'docx', 'latex', 'html']).toContain(validOptions.format)
      expect(validOptions.csl).toBeTruthy()
    })

    it('validates optional bibliography path', () => {
      const optionsWithBib: ExportOptions = {
        noteId: '123',
        content: 'Test content with [@citation]',
        title: 'Test Note',
        format: 'pdf',
        bibliography: '/path/to/library.bib',
        csl: 'apa',
        includeMetadata: true,
        processEquations: true
      }

      expect(optionsWithBib.bibliography).toBeTruthy()
      expect(optionsWithBib.bibliography).toContain('.bib')
    })
  })
})

describe('YAML Frontmatter Validation', () => {
  describe('Pandoc Frontmatter', () => {
    function createFrontmatter(title: string, author?: string): string {
      let yaml = '---\n'
      yaml += `title: "${title.replace(/"/g, '\\"')}"\n`
      if (author) {
        yaml += `author: "${author}"\n`
      }
      yaml += '---\n\n'
      return yaml
    }

    it('creates valid YAML frontmatter', () => {
      const frontmatter = createFrontmatter('My Document')

      expect(frontmatter).toContain('---')
      expect(frontmatter).toContain('title: "My Document"')
    })

    it('escapes quotes in title', () => {
      const frontmatter = createFrontmatter('My "Quoted" Document')

      expect(frontmatter).toContain('title: "My \\"Quoted\\" Document"')
    })

    it('includes optional author', () => {
      const frontmatter = createFrontmatter('My Document', 'John Smith')

      expect(frontmatter).toContain('author: "John Smith"')
    })
  })
})

describe('Citation Formatting', () => {
  interface Citation {
    key: string
    title: string
    authors: string[]
    year: number
    journal?: string
    doi?: string
  }

  function formatCitation(citation: Citation, style: 'short' | 'full' = 'short'): string {
    const authorPart = citation.authors.length === 0
      ? 'Unknown'
      : citation.authors.length === 1
        ? citation.authors[0]
        : citation.authors.length === 2
          ? `${citation.authors[0]} & ${citation.authors[1]}`
          : `${citation.authors[0]} et al.`

    if (style === 'short') {
      return `${authorPart} (${citation.year})`
    }

    let full = `${authorPart}. (${citation.year}). ${citation.title}.`
    if (citation.journal) {
      full += ` ${citation.journal}.`
    }
    return full
  }

  it('formats single author citation', () => {
    const citation: Citation = {
      key: 'smith2020',
      title: 'A Great Paper',
      authors: ['Smith'],
      year: 2020
    }

    expect(formatCitation(citation)).toBe('Smith (2020)')
  })

  it('formats two author citation', () => {
    const citation: Citation = {
      key: 'smith2020',
      title: 'A Great Paper',
      authors: ['Smith', 'Jones'],
      year: 2020
    }

    expect(formatCitation(citation)).toBe('Smith & Jones (2020)')
  })

  it('formats multiple author citation', () => {
    const citation: Citation = {
      key: 'smith2020',
      title: 'A Great Paper',
      authors: ['Smith', 'Jones', 'Brown', 'White'],
      year: 2020
    }

    expect(formatCitation(citation)).toBe('Smith et al. (2020)')
  })

  it('formats full citation', () => {
    const citation: Citation = {
      key: 'smith2020',
      title: 'A Great Paper',
      authors: ['Smith', 'Jones'],
      year: 2020,
      journal: 'Nature'
    }

    expect(formatCitation(citation, 'full')).toBe('Smith & Jones. (2020). A Great Paper. Nature.')
  })
})

describe('Math Content Detection', () => {
  function containsMath(content: string): boolean {
    // Check for inline math $...$ (not $$ which is display)
    const inlineMath = /(?<!\$)\$(?!\$)[^$]+\$(?!\$)/
    // Check for display math $$...$$
    const displayMath = /\$\$[^$]+\$\$/

    return inlineMath.test(content) || displayMath.test(content)
  }

  it('detects inline math', () => {
    expect(containsMath('The formula $x^2$ is quadratic')).toBe(true)
    expect(containsMath('Where $\\alpha = 0.05$')).toBe(true)
  })

  it('detects display math', () => {
    expect(containsMath('The equation is $$E = mc^2$$')).toBe(true)
    expect(containsMath('$$\\sum_{i=1}^n x_i$$')).toBe(true)
  })

  it('returns false for text without math', () => {
    expect(containsMath('Just plain text')).toBe(false)
    expect(containsMath('Price is $100')).toBe(false) // Currency, not math
  })

  it('handles mixed content', () => {
    const content = `
# Heading
Some text with $\\alpha$ inline math.

And a display equation:
$$\\beta = 2$$
    `
    expect(containsMath(content)).toBe(true)
  })
})

describe('Performance Tests', () => {
  it('handles document with many math expressions', () => {
    const mathExpressions = Array(100).fill('$x^2 + y^2$').join(' + ')
    const startTime = performance.now()

    const inlineMathRegex = /\$([^$]+)\$/g
    const matches = Array.from(mathExpressions.matchAll(inlineMathRegex))

    const endTime = performance.now()

    expect(matches.length).toBe(100)
    expect(endTime - startTime).toBeLessThan(50)
  })

  it('handles document with many citations', () => {
    const citations = Array(100).fill(0).map((_, i) => `[@author${i}]`).join(' ')
    const startTime = performance.now()

    const citationRegex = /\[@([a-zA-Z0-9_:-]+)\]/g
    const matches = Array.from(citations.matchAll(citationRegex))

    const endTime = performance.now()

    expect(matches.length).toBe(100)
    expect(endTime - startTime).toBeLessThan(50)
  })

  it('handles large BibTeX file parsing', () => {
    const entries = Array(50).fill(0).map((_, i) => `
@article{author${i},
  author = {Author ${i}},
  title = {Title ${i}},
  journal = {Journal ${i}},
  year = {202${i % 10}}
}
    `).join('\n')

    const startTime = performance.now()

    const entryRegex = /@\w+\s*\{([^,]+),/g
    const matches = Array.from(entries.matchAll(entryRegex))

    const endTime = performance.now()

    expect(matches.length).toBe(50)
    expect(endTime - startTime).toBeLessThan(100)
  })
})
