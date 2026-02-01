/**
 * Quarto Autocomplete Module
 * 
 * Provides autocompletion for Quarto documents:
 * - YAML frontmatter keys (format, execute, bibliography, etc.)
 * - Chunk options (#| echo, eval, fig-cap, etc.)
 * - Cross-references (@fig-, @tbl-, @eq-, @sec-)
 */

import { CompletionContext, CompletionResult, Completion } from '@codemirror/autocomplete'
import type { Text } from '@codemirror/state'

// ============================================================================
// Types
// ============================================================================

interface YamlCompletionOption {
  label: string
  detail: string
  children?: YamlCompletionOption[]
}

interface CrossRef {
  type: 'fig' | 'tbl' | 'eq' | 'sec'
  label: string
  context: string
  line: number
}

// ============================================================================
// YAML Frontmatter Data
// ============================================================================

const YAML_TOP_LEVEL: Completion[] = [
  // Document metadata
  { label: 'title:', detail: 'Document title', type: 'property' },
  { label: 'author:', detail: 'Author name(s)', type: 'property' },
  { label: 'date:', detail: 'Document date', type: 'property' },
  { label: 'abstract:', detail: 'Document abstract', type: 'property' },
  { label: 'keywords:', detail: 'Document keywords', type: 'property' },
  
  // Output format
  { label: 'format:', detail: 'Output format (html, pdf, docx)', type: 'property' },
  
  // Execution options
  { label: 'execute:', detail: 'Code execution options', type: 'property' },
  
  // Bibliography
  { label: 'bibliography:', detail: 'BibTeX file path', type: 'property' },
  { label: 'csl:', detail: 'Citation style file', type: 'property' },
  
  // Table of contents
  { label: 'toc:', detail: 'Table of contents (true/false)', type: 'property' },
  { label: 'toc-depth:', detail: 'TOC depth (1-6)', type: 'property' },
  { label: 'number-sections:', detail: 'Number sections (true/false)', type: 'property' },
  
  // Code display
  { label: 'code-fold:', detail: 'Fold code blocks (true/false/show)', type: 'property' },
  { label: 'code-tools:', detail: 'Show code tools (true/false)', type: 'property' },
  { label: 'code-line-numbers:', detail: 'Show line numbers (true/false)', type: 'property' },
  
  // Jupyter
  { label: 'jupyter:', detail: 'Jupyter kernel settings', type: 'property' },
  
  // Figure defaults
  { label: 'fig-width:', detail: 'Default figure width', type: 'property' },
  { label: 'fig-height:', detail: 'Default figure height', type: 'property' },
  { label: 'fig-dpi:', detail: 'Figure resolution (DPI)', type: 'property' },
  
  // Theme
  { label: 'theme:', detail: 'Document theme', type: 'property' },
  { label: 'highlight-style:', detail: 'Code highlight style', type: 'property' },
]

const FORMAT_VALUES: Completion[] = [
  { label: 'html', detail: 'HTML document', type: 'value' },
  { label: 'pdf', detail: 'PDF via LaTeX', type: 'value' },
  { label: 'docx', detail: 'Word document', type: 'value' },
  { label: 'revealjs', detail: 'Reveal.js presentation', type: 'value' },
  { label: 'beamer', detail: 'LaTeX Beamer slides', type: 'value' },
  { label: 'typst', detail: 'Typst document', type: 'value' },
  { label: 'gfm', detail: 'GitHub Flavored Markdown', type: 'value' },
  { label: 'epub', detail: 'EPUB ebook', type: 'value' },
]

const EXECUTE_OPTIONS: Completion[] = [
  { label: 'echo: true', detail: 'Show code in output', type: 'value' },
  { label: 'echo: false', detail: 'Hide code in output', type: 'value' },
  { label: 'eval: true', detail: 'Execute code', type: 'value' },
  { label: 'eval: false', detail: 'Skip execution', type: 'value' },
  { label: 'warning: true', detail: 'Show warnings', type: 'value' },
  { label: 'warning: false', detail: 'Suppress warnings', type: 'value' },
  { label: 'message: false', detail: 'Suppress messages', type: 'value' },
  { label: 'output: true', detail: 'Include output', type: 'value' },
  { label: 'output: false', detail: 'Hide output', type: 'value' },
  { label: 'cache: true', detail: 'Cache results', type: 'value' },
  { label: 'freeze: true', detail: 'Freeze computation', type: 'value' },
]

// ============================================================================
// Code Chunk Language Data
// ============================================================================

const CODE_CHUNKS: Completion[] = [
  { 
    label: '```{r}', 
    detail: 'R code chunk', 
    type: 'keyword',
    apply: '```{r}\n\n```'
  },
  { 
    label: '```{python}', 
    detail: 'Python code chunk', 
    type: 'keyword',
    apply: '```{python}\n\n```'
  },
  { 
    label: '```{julia}', 
    detail: 'Julia code chunk', 
    type: 'keyword',
    apply: '```{julia}\n\n```'
  },
  { 
    label: '```{ojs}', 
    detail: 'Observable JS chunk', 
    type: 'keyword',
    apply: '```{ojs}\n\n```'
  },
  { 
    label: '```{mermaid}', 
    detail: 'Mermaid diagram', 
    type: 'keyword',
    apply: '```{mermaid}\n\n```'
  },
  { 
    label: '```{dot}', 
    detail: 'Graphviz diagram', 
    type: 'keyword',
    apply: '```{dot}\n\n```'
  },
]

// ============================================================================
// Chunk Options Data
// ============================================================================

const CHUNK_OPTIONS: Completion[] = [
  // Execution
  { label: '#| echo: true', detail: 'Show source code', type: 'property' },
  { label: '#| echo: false', detail: 'Hide source code', type: 'property' },
  { label: '#| echo: fenced', detail: 'Show fenced code', type: 'property' },
  { label: '#| eval: true', detail: 'Execute code', type: 'property' },
  { label: '#| eval: false', detail: 'Skip execution', type: 'property' },
  { label: '#| output: true', detail: 'Include output', type: 'property' },
  { label: '#| output: false', detail: 'Hide output', type: 'property' },
  { label: '#| output: asis', detail: 'Output as-is (raw)', type: 'property' },
  { label: '#| warning: false', detail: 'Suppress warnings', type: 'property' },
  { label: '#| message: false', detail: 'Suppress messages', type: 'property' },
  { label: '#| error: true', detail: 'Continue on error', type: 'property' },
  { label: '#| include: false', detail: 'Exclude chunk from output', type: 'property' },
  
  // Labels and captions
  { label: '#| label: ', detail: 'Chunk label for cross-refs', type: 'property' },
  { label: '#| fig-cap: ', detail: 'Figure caption', type: 'property' },
  { label: '#| tbl-cap: ', detail: 'Table caption', type: 'property' },
  
  // Figure options
  { label: '#| fig-width: 6', detail: 'Figure width (inches)', type: 'property' },
  { label: '#| fig-height: 4', detail: 'Figure height (inches)', type: 'property' },
  { label: '#| fig-align: center', detail: 'Figure alignment', type: 'property' },
  { label: '#| fig-dpi: 300', detail: 'Figure resolution', type: 'property' },
  
  // Code folding
  { label: '#| code-fold: true', detail: 'Fold code block', type: 'property' },
  { label: '#| code-fold: show', detail: 'Folded but visible', type: 'property' },
  { label: '#| code-summary: "Show code"', detail: 'Folded code label', type: 'property' },
  
  // Layout
  { label: '#| column: margin', detail: 'Place in margin', type: 'property' },
  { label: '#| column: page', detail: 'Full page width', type: 'property' },
  { label: '#| layout-ncol: 2', detail: 'Number of columns', type: 'property' },
]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if cursor is in YAML frontmatter block (between --- delimiters)
 */
export function isInYamlBlock(context: CompletionContext): boolean {
  const doc = context.state.doc
  const pos = context.pos
  const text = doc.toString()
  
  // Find first ---
  const firstDelim = text.indexOf('---')
  if (firstDelim !== 0) return false
  
  // Find second ---
  const secondDelim = text.indexOf('---', 4)
  if (secondDelim === -1) return false
  
  // Check if cursor is between delimiters
  return pos > firstDelim + 3 && pos < secondDelim
}

/**
 * Check for code block at or before position
 */
function getCodeBlockStart(doc: Text, pos: number): number | null {
  const text = doc.toString()
  
  // Look backwards from position for opening ```
  let searchPos = pos
  while (searchPos > 0) {
    const line = doc.lineAt(searchPos)
    if (line.text.startsWith('```')) {
      // Check if this is an opening fence (has language)
      if (/^```\{?\w/.test(line.text)) {
        return line.from
      }
      // It's a closing fence, we're not in a block
      return null
    }
    searchPos = line.from - 1
    if (searchPos < 0) break
  }
  return null
}

/**
 * Check if cursor is in a code block
 */
export function isInCodeBlock(context: CompletionContext): boolean {
  return getCodeBlockStart(context.state.doc, context.pos) !== null
}

/**
 * Scan document for cross-reference labels
 * Finds: #fig-*, #tbl-*, #eq-*, #sec-*
 */
export function scanForLabels(doc: Text): CrossRef[] {
  const labels: CrossRef[] = []
  const text = doc.toString()
  
  // Pattern for chunk labels: #| label: fig-scatter
  const chunkLabelRegex = /#\|\s*label:\s*(\w+)-(\w+)/g
  let match
  
  while ((match = chunkLabelRegex.exec(text)) !== null) {
    const type = match[1] as 'fig' | 'tbl' | 'eq' | 'sec'
    if (['fig', 'tbl', 'eq', 'sec'].includes(type)) {
      const line = doc.lineAt(match.index)
      labels.push({
        type,
        label: `${match[1]}-${match[2]}`,
        context: line.text.trim(),
        line: line.number
      })
    }
  }
  
  // Pattern for span labels: {#fig-scatter} {#tbl-data} {#eq-linear}
  const spanLabelRegex = /\{#(fig|tbl|eq|sec)-([a-z0-9_-]+)\}/gi
  
  while ((match = spanLabelRegex.exec(text)) !== null) {
    const type = match[1].toLowerCase() as 'fig' | 'tbl' | 'eq' | 'sec'
    const line = doc.lineAt(match.index)
    
    // Get context (caption or nearby text)
    let context = line.text.trim()
    // For figures, try to get caption from fig-cap
    if (type === 'fig') {
      const capMatch = text.match(new RegExp(`#\\|\\s*fig-cap:\\s*["']([^"']+)["']`))
      if (capMatch) context = capMatch[1]
    }
    
    labels.push({
      type,
      label: `${type}-${match[2]}`,
      context: context.slice(0, 50),
      line: line.number
    })
  }
  
  // Pattern for section headers: # Section Title {#sec-intro}
  const sectionRegex = /^(#{1,6})\s+(.+?)\s*\{#sec-([a-z0-9_-]+)\}/gim
  
  while ((match = sectionRegex.exec(text)) !== null) {
    const line = doc.lineAt(match.index)
    labels.push({
      type: 'sec',
      label: `sec-${match[3]}`,
      context: match[2].trim(),
      line: line.number
    })
  }
  
  return labels
}

// ============================================================================
// Completion Functions
// ============================================================================

/**
 * YAML frontmatter completions
 * Triggers when typing in YAML block (between --- delimiters)
 */
export function yamlCompletions(context: CompletionContext): CompletionResult | null {
  if (!isInYamlBlock(context)) return null
  
  const line = context.state.doc.lineAt(context.pos)
  const lineText = line.text
  const beforeCursor = lineText.slice(0, context.pos - line.from)
  
  // Check if we're after format: on same line
  if (beforeCursor.match(/format:\s*$/)) {
    return {
      from: context.pos,
      options: FORMAT_VALUES,
      validFor: /^[a-z]*$/
    }
  }
  
  // Check if we're in execute: block (line starts with spaces after execute:)
  const prevLines = context.state.doc.sliceString(0, line.from)
  if (prevLines.includes('execute:') && beforeCursor.match(/^\s+$/)) {
    return {
      from: context.pos,
      options: EXECUTE_OPTIONS,
      validFor: /^[a-z: ]*$/
    }
  }
  
  // Match word at start of line for top-level keys
  const word = context.matchBefore(/^[a-z-]*:?/)
  if (!word && !context.explicit) return null
  
  return {
    from: word?.from ?? context.pos,
    options: YAML_TOP_LEVEL,
    validFor: /^[a-z-]*:?$/
  }
}

/**
 * Chunk option completions
 * Triggers ONLY when typing #| inside code blocks (not # alone, to avoid tag confusion)
 */
export function chunkOptionCompletions(context: CompletionContext): CompletionResult | null {
  if (!isInCodeBlock(context)) return null
  
  const line = context.state.doc.lineAt(context.pos)
  const lineText = line.text.trimStart()
  
  // REQUIRE #| prefix - single # is for tags/comments, not chunk options
  if (!lineText.startsWith('#|')) return null
  
  // Match the #| and any partial option text
  const word = context.matchBefore(/#\|\s*[a-z-]*:?\s*[a-z"']*/i)
  if (!word) return null
  
  return {
    from: line.from + (line.text.length - line.text.trimStart().length),
    options: CHUNK_OPTIONS,
    validFor: /^#\|\s*[a-z-]*:?\s*[a-z"']*$/i
  }
}

/**
 * Code chunk language completions
 * Triggers when typing ``` to offer executable code block options
 * Similar pattern to latexCompletions - uses matchBefore from cursor
 */
export function codeChunkCompletions(context: CompletionContext): CompletionResult | null {
  // Match backticks pattern - must be at start of line (after optional whitespace)
  // The pattern matches 1-3 backticks optionally followed by { and language name
  const word = context.matchBefore(/`{1,3}\{?[a-z]*/)
  
  // If no match and not explicitly triggered, return null
  if (!word || (word.from === word.to && !context.explicit)) {
    return null
  }
  
  // Verify we're at the start of a line (only whitespace before the backticks)
  const line = context.state.doc.lineAt(word.from)
  const textBeforeMatch = line.text.slice(0, word.from - line.from)
  if (textBeforeMatch.trim() !== '') {
    return null  // There's non-whitespace before the backticks
  }
  
  // Don't trigger inside existing code blocks
  if (isInCodeBlock(context)) return null
  
  return {
    from: word.from,
    options: CODE_CHUNKS,
    validFor: /^`{1,3}\{?[a-z]*$/
  }
}

/**
 * Cross-reference completions
 * Triggers when typing @fig-, @tbl-, @eq-, @sec-
 */
export function crossRefCompletions(context: CompletionContext): CompletionResult | null {
  // Match @prefix pattern
  const word = context.matchBefore(/@[a-z]*-?[a-z0-9_-]*/)
  if (!word) return null
  
  // Scan document for labels
  const labels = scanForLabels(context.state.doc)
  
  if (labels.length === 0) return null
  
  // Create completions from labels
  const options: Completion[] = labels.map(l => ({
    label: `@${l.label}`,
    detail: l.context.slice(0, 40),
    type: 'reference',
    info: `Line ${l.line}`
  }))
  
  return {
    from: word.from,
    options,
    validFor: /^@[a-z]*-?[a-z0-9_-]*$/
  }
}
