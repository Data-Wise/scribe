/**
 * Tests for Quarto Completions
 *
 * Tests YAML frontmatter, chunk options, and cross-reference autocomplete
 */

import { describe, it, expect } from 'vitest'
import { EditorState } from '@codemirror/state'
import { CompletionContext } from '@codemirror/autocomplete'
import {
  isInYamlBlock,
  isInCodeBlock,
  yamlCompletions,
  chunkOptionCompletions,
  crossRefCompletions,
  scanForLabels,
  quartoCompletions,
} from '../lib/quarto-completions'

// Helper to create a CompletionContext at a position
function createContext(content: string, pos: number): CompletionContext {
  const state = EditorState.create({ doc: content })
  return new CompletionContext(state, pos, false)
}

// Helper to create explicit completion context
function createExplicitContext(content: string, pos: number): CompletionContext {
  const state = EditorState.create({ doc: content })
  return new CompletionContext(state, pos, true)
}

describe('QuartoCompletions', () => {
  describe('isInYamlBlock', () => {
    it('returns true when cursor is inside YAML frontmatter', () => {
      const content = `---
title: "Test"
for
---
Content here`
      // Position after "for" in YAML block
      const context = createContext(content, 22)
      expect(isInYamlBlock(context)).toBe(true)
    })

    it('returns false when cursor is after YAML frontmatter', () => {
      const content = `---
title: "Test"
---
Content here`
      // Position in "Content here"
      const context = createContext(content, 30)
      expect(isInYamlBlock(context)).toBe(false)
    })

    it('returns false when no YAML block exists', () => {
      const content = `# Just markdown
No YAML here`
      const context = createContext(content, 5)
      expect(isInYamlBlock(context)).toBe(false)
    })

    it('returns false when content precedes first ---', () => {
      const content = `Some text
---
title: "Test"
---`
      const context = createContext(content, 20)
      expect(isInYamlBlock(context)).toBe(false)
    })
  })

  describe('isInCodeBlock', () => {
    it('returns true when cursor is inside code block', () => {
      const content = '```r\n#| echo: true\nplot(x)\n```'
      // Position in the code block
      const context = createContext(content, 10)
      expect(isInCodeBlock(context)).toBe(true)
    })

    it('returns true when line starts with #|', () => {
      const content = '```python\n#| eval: false\nprint("hi")\n```'
      // Position on #| line
      const context = createContext(content, 15)
      expect(isInCodeBlock(context)).toBe(true)
    })

    it('returns false when cursor is outside code block', () => {
      const content = '```r\ncode\n```\nOutside'
      // Position in "Outside"
      const context = createContext(content, 18)
      expect(isInCodeBlock(context)).toBe(false)
    })

    it('returns false when no code block exists', () => {
      const content = '# Just markdown\nNo code here'
      const context = createContext(content, 10)
      expect(isInCodeBlock(context)).toBe(false)
    })
  })

  describe('yamlCompletions', () => {
    it('returns completions when typing in YAML block', () => {
      const content = `---
for
---`
      const context = createExplicitContext(content, 7) // After "for"
      const result = yamlCompletions(context)

      expect(result).not.toBeNull()
      expect(result?.options.length).toBeGreaterThan(0)
      // Should include format: completion
      const formatOption = result?.options.find(o => o.label === 'format:')
      expect(formatOption).toBeDefined()
    })

    it('returns null when not in YAML block', () => {
      const content = `---
title: "Test"
---
format`
      const context = createContext(content, 30) // In body, not YAML
      const result = yamlCompletions(context)

      expect(result).toBeNull()
    })

    it('returns format values when typing after format:', () => {
      const content = `---
format: ht
---`
      const context = createExplicitContext(content, 14) // After "ht"
      const result = yamlCompletions(context)

      // Should return value completions for format
      expect(result).not.toBeNull()
      if (result) {
        const htmlOption = result.options.find(o => o.label === 'html')
        expect(htmlOption).toBeDefined()
      }
    })

    it('includes common YAML keys', () => {
      const content = `---

---`
      const context = createExplicitContext(content, 4)
      const result = yamlCompletions(context)

      expect(result).not.toBeNull()
      const labels = result?.options.map(o => o.label) || []

      expect(labels).toContain('title:')
      expect(labels).toContain('author:')
      expect(labels).toContain('format:')
      expect(labels).toContain('execute:')
      expect(labels).toContain('bibliography:')
    })
  })

  describe('chunkOptionCompletions', () => {
    it('returns completions when typing #| in code block', () => {
      const content = '```r\n#| \n```'
      const context = createExplicitContext(content, 8) // After "#| "
      const result = chunkOptionCompletions(context)

      expect(result).not.toBeNull()
      expect(result?.options.length).toBeGreaterThan(0)
    })

    it('includes common chunk options', () => {
      const content = '```r\n#| \n```'
      const context = createExplicitContext(content, 8)
      const result = chunkOptionCompletions(context)

      const labels = result?.options.map(o => o.label) || []

      expect(labels).toContain('#| echo:')
      expect(labels).toContain('#| eval:')
      expect(labels).toContain('#| fig-cap:')
      expect(labels).toContain('#| label:')
    })

    it('returns null when not in code block', () => {
      const content = 'Just markdown #|'
      const context = createContext(content, 16)
      const result = chunkOptionCompletions(context)

      expect(result).toBeNull()
    })

    it('returns value completions for boolean options', () => {
      const content = '```r\n#| echo: tr\n```'
      const context = createExplicitContext(content, 16) // After "tr"
      const result = chunkOptionCompletions(context)

      expect(result).not.toBeNull()
      if (result) {
        const trueOption = result.options.find(o => o.label === 'true')
        expect(trueOption).toBeDefined()
      }
    })
  })

  describe('scanForLabels', () => {
    it('finds {#fig-*} labels', () => {
      const content = '![Caption](image.png){#fig-myplot}\n\nMore text'
      const state = EditorState.create({ doc: content })
      const labels = scanForLabels(state.doc)

      expect(labels.length).toBe(1)
      expect(labels[0].type).toBe('fig')
      expect(labels[0].label).toBe('fig-myplot')
    })

    it('finds {#tbl-*} labels', () => {
      const content = '| Col1 | Col2 |\n|---|---|\n{#tbl-data}'
      const state = EditorState.create({ doc: content })
      const labels = scanForLabels(state.doc)

      expect(labels.length).toBe(1)
      expect(labels[0].type).toBe('tbl')
      expect(labels[0].label).toBe('tbl-data')
    })

    it('finds {#eq-*} labels', () => {
      const content = '$$\nE = mc^2\n$$' + '{#eq-einstein}'
      const state = EditorState.create({ doc: content })
      const labels = scanForLabels(state.doc)

      expect(labels.length).toBe(1)
      expect(labels[0].type).toBe('eq')
      expect(labels[0].label).toBe('eq-einstein')
    })

    it('finds {#sec-*} labels in headers', () => {
      const content = '## Introduction {#sec-intro}\n\nContent here'
      const state = EditorState.create({ doc: content })
      const labels = scanForLabels(state.doc)

      expect(labels.length).toBe(1)
      expect(labels[0].type).toBe('sec')
      expect(labels[0].label).toBe('sec-intro')
      expect(labels[0].context).toBe('Introduction')
    })

    it('finds #| label: in code chunks', () => {
      const content = '```{r}\n#| label: fig-scatter\n#| fig-cap: "Scatter plot"\nplot(x, y)\n```'
      const state = EditorState.create({ doc: content })
      const labels = scanForLabels(state.doc)

      expect(labels.length).toBe(1)
      expect(labels[0].type).toBe('fig')
      expect(labels[0].label).toBe('fig-scatter')
    })

    it('finds multiple labels in document', () => {
      const content = `# Methods {#sec-methods}

![Figure](img.png){#fig-results}

| Data | Values |
|------|--------|
{#tbl-summary}

$$
y = mx + b
$\${#eq-linear}`
      const state = EditorState.create({ doc: content })
      const labels = scanForLabels(state.doc)

      expect(labels.length).toBe(4)
      const types = labels.map(l => l.type)
      expect(types).toContain('sec')
      expect(types).toContain('fig')
      expect(types).toContain('tbl')
      expect(types).toContain('eq')
    })

    it('returns empty array when no labels exist', () => {
      const content = '# Just markdown\n\nNo labels here'
      const state = EditorState.create({ doc: content })
      const labels = scanForLabels(state.doc)

      expect(labels).toEqual([])
    })
  })

  describe('crossRefCompletions', () => {
    it('returns completions when typing @', () => {
      const content = '![Caption](img.png){#fig-test}\n\nSee @fig'
      const pos = content.length // At end, after "@fig"
      const context = createExplicitContext(content, pos)
      const result = crossRefCompletions(context)

      expect(result).not.toBeNull()
      expect(result?.options.length).toBeGreaterThan(0)
    })

    it('includes all found labels', () => {
      const content = `![](a.png){#fig-one}
![](b.png){#fig-two}

Ref: @fig`
      const pos = content.length
      const context = createExplicitContext(content, pos)
      const result = crossRefCompletions(context)

      expect(result?.options.length).toBe(2)
      const labels = result?.options.map(o => o.label)
      expect(labels).toContain('@fig-one')
      expect(labels).toContain('@fig-two')
    })

    it('returns hint when no labels found', () => {
      const content = 'See @fig'
      const context = createExplicitContext(content, 8)
      const result = crossRefCompletions(context)

      expect(result).not.toBeNull()
      expect(result?.options.length).toBe(1)
      expect(result?.options[0].detail).toContain('No labels found')
    })

    it('returns null when not typing @', () => {
      const content = 'Just normal text'
      const context = createContext(content, 10)
      const result = crossRefCompletions(context)

      expect(result).toBeNull()
    })

    it('returns null when in YAML block', () => {
      const content = `---
title: "@fig"
---`
      const context = createContext(content, 12)
      const result = crossRefCompletions(context)

      expect(result).toBeNull()
    })
  })

  describe('quartoCompletions (combined)', () => {
    it('returns YAML completions in YAML block', () => {
      const content = `---
for
---`
      const context = createExplicitContext(content, 7)
      const result = quartoCompletions(context)

      expect(result).not.toBeNull()
      expect(result?.options.some(o => o.label === 'format:')).toBe(true)
    })

    it('returns chunk completions in code block', () => {
      const content = '```r\n#| \n```'
      const context = createExplicitContext(content, 8)
      const result = quartoCompletions(context)

      expect(result).not.toBeNull()
      expect(result?.options.some(o => o.label === '#| echo:')).toBe(true)
    })

    it('returns cross-ref completions when typing @', () => {
      const content = '![](img.png){#fig-test}\n\n@fig'
      const context = createExplicitContext(content, content.length)
      const result = quartoCompletions(context)

      expect(result).not.toBeNull()
      expect(result?.options.some(o => o.label === '@fig-test')).toBe(true)
    })

    it('returns null for plain text', () => {
      const content = 'Just normal markdown text'
      const context = createContext(content, 10)
      const result = quartoCompletions(context)

      expect(result).toBeNull()
    })
  })
})
