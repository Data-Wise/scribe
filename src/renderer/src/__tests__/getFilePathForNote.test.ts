import { describe, it, expect } from 'vitest'

/**
 * Extract getFilePathForNote from HybridEditor for testing
 * This function determines file type from note content
 */
function getFilePathForNote(content: string): string | null {
  // Check YAML frontmatter for file_type
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (frontmatterMatch) {
    const yamlContent = frontmatterMatch[1]
    const fileTypeMatch = yamlContent.match(/file_type:\s*['"]?(\w+)['"]?/)
    if (fileTypeMatch) {
      return `note.${fileTypeMatch[1]}`
    }
  }

  // Check first line for filename-like title
  const firstLine = content.split('\n')[0]
  if (firstLine.startsWith('# ')) {
    const title = firstLine.substring(2).trim()
    // Check for file extension in title
    const extMatch = title.match(/\.(tex|R|py|js|ts|json|qmd)$/i)
    if (extMatch) {
      return title
    }
  }

  // Default to markdown
  return 'note.md'
}

describe('getFilePathForNote', () => {
  describe('YAML frontmatter detection', () => {
    it('should detect file_type from frontmatter', () => {
      const content = `---
file_type: tex
title: My Paper
---
\\documentclass{article}`

      expect(getFilePathForNote(content)).toBe('note.tex')
    })

    it('should handle file_type with quotes', () => {
      const content = `---
file_type: "R"
title: Analysis
---
x <- 1`

      expect(getFilePathForNote(content)).toBe('note.R')
    })

    it('should handle file_type with single quotes', () => {
      const content = `---
file_type: 'py'
---
print('hello')`

      expect(getFilePathForNote(content)).toBe('note.py')
    })

    it('should handle file_type without quotes', () => {
      const content = `---
file_type: qmd
---
# Analysis`

      expect(getFilePathForNote(content)).toBe('note.qmd')
    })

    it('should handle frontmatter with multiple properties', () => {
      const content = `---
title: Research Paper
author: John Doe
file_type: tex
date: 2025-12-31
---
Content here`

      expect(getFilePathForNote(content)).toBe('note.tex')
    })

    it('should prioritize frontmatter over title', () => {
      const content = `---
file_type: tex
---
# script.R`

      // Should use frontmatter (tex) not title (R)
      expect(getFilePathForNote(content)).toBe('note.tex')
    })
  })

  describe('Title-based detection', () => {
    it('should detect .tex from title', () => {
      const content = `# paper.tex
\\documentclass{article}`

      expect(getFilePathForNote(content)).toBe('paper.tex')
    })

    it('should detect .R from title', () => {
      const content = `# analysis.R
x <- c(1, 2, 3)`

      expect(getFilePathForNote(content)).toBe('analysis.R')
    })

    it('should detect .py from title', () => {
      const content = `# main.py
def hello():`

      expect(getFilePathForNote(content)).toBe('main.py')
    })

    it('should detect .qmd from title', () => {
      const content = `# report.qmd
---
title: Report
---`

      expect(getFilePathForNote(content)).toBe('report.qmd')
    })

    it('should detect .js from title', () => {
      const content = `# app.js
console.log('hello')`

      expect(getFilePathForNote(content)).toBe('app.js')
    })

    it('should detect .ts from title', () => {
      const content = `# types.ts
interface User {}`

      expect(getFilePathForNote(content)).toBe('types.ts')
    })

    it('should detect .json from title', () => {
      const content = `# package.json
{}`

      expect(getFilePathForNote(content)).toBe('package.json')
    })

    it('should handle mixed case extensions in title', () => {
      const content = `# Script.R
x <- 1`

      expect(getFilePathForNote(content)).toBe('Script.R')
    })

    it('should handle titles with paths', () => {
      const content = `# /path/to/script.R
x <- 1`

      expect(getFilePathForNote(content)).toBe('/path/to/script.R')
    })
  })

  describe('Default behavior', () => {
    it('should default to note.md for plain markdown', () => {
      const content = `# My Note
This is a regular note`

      expect(getFilePathForNote(content)).toBe('note.md')
    })

    it('should default to note.md for empty content', () => {
      expect(getFilePathForNote('')).toBe('note.md')
    })

    it('should default to note.md for content without heading', () => {
      const content = `Just some text without a heading`

      expect(getFilePathForNote(content)).toBe('note.md')
    })

    it('should default to note.md for title without extension', () => {
      const content = `# My Document
Content here`

      expect(getFilePathForNote(content)).toBe('note.md')
    })

    it('should default to note.md for unsupported extension in title', () => {
      const content = `# data.csv
a,b,c`

      expect(getFilePathForNote(content)).toBe('note.md')
    })
  })

  describe('Edge cases', () => {
    it('should handle malformed frontmatter', () => {
      const content = `---
this is not valid yaml
file_type tex
---
Content`

      // Should still try to extract file_type if possible
      // But in this case, won't match the pattern
      expect(getFilePathForNote(content)).toBe('note.md')
    })

    it('should handle frontmatter without closing delimiter', () => {
      const content = `---
file_type: tex
Content without closing ---`

      // Won't match frontmatter pattern
      expect(getFilePathForNote(content)).toBe('note.md')
    })

    it('should handle multiple headings', () => {
      const content = `# First Heading
## script.R
### Another heading`

      // Only checks first line
      expect(getFilePathForNote(content)).toBe('note.md')
    })

    it('should handle heading with multiple dots', () => {
      const content = `# my.report.final.tex
Content`

      expect(getFilePathForNote(content)).toBe('my.report.final.tex')
    })

    it('should handle whitespace in frontmatter', () => {
      const content = `---
  file_type:    tex
  title:  Paper
---
Content`

      expect(getFilePathForNote(content)).toBe('note.tex')
    })

    it('should handle newlines in content', () => {
      const content = `# script.R\n\n\nx <- 1\ny <- 2`

      expect(getFilePathForNote(content)).toBe('script.R')
    })

    it('should handle very long content', () => {
      const content = '# note.md\n' + 'a'.repeat(10000)

      expect(getFilePathForNote(content)).toBe('note.md')
    })

    it('should handle frontmatter with extra whitespace', () => {
      const content = `---


file_type: tex


---
Content`

      expect(getFilePathForNote(content)).toBe('note.tex')
    })

    it('should not match extension in middle of title', () => {
      const content = `# This is a .tex file example
Content`

      // Extension must be at end
      expect(getFilePathForNote(content)).toBe('note.md')
    })

    it('should handle title with special characters', () => {
      const content = `# My-Script_v2.R
x <- 1`

      expect(getFilePathForNote(content)).toBe('My-Script_v2.R')
    })
  })

  describe('Integration scenarios', () => {
    it('should handle typical LaTeX document', () => {
      const content = `---
title: Research Paper
author: John Doe
file_type: tex
---

\\documentclass{article}
\\begin{document}
Content
\\end{document}`

      expect(getFilePathForNote(content)).toBe('note.tex')
    })

    it('should handle typical R script', () => {
      const content = `# analysis.R

# Load libraries
library(ggplot2)

# Analysis code
x <- rnorm(100)`

      expect(getFilePathForNote(content)).toBe('analysis.R')
    })

    it('should handle typical Quarto document', () => {
      const content = `---
title: "My Analysis"
format: html
file_type: qmd
---

# Introduction

\`\`\`{r}
x <- 1
\`\`\``

      expect(getFilePathForNote(content)).toBe('note.qmd')
    })

    it('should handle regular markdown note', () => {
      const content = `# Meeting Notes 2025-12-31

## Attendees
- Alice
- Bob

## Discussion
- Topic 1
- Topic 2`

      expect(getFilePathForNote(content)).toBe('note.md')
    })
  })
})
