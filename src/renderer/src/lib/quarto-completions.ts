/**
 * Quarto Completions for Scribe
 *
 * Provides autocomplete for:
 * 1. YAML frontmatter keys and values (format, execute, bibliography, etc.)
 * 2. Chunk options (#| echo, #| eval, etc.)
 * 3. Cross-references (@fig-*, @tbl-*, @eq-*, @sec-*)
 *
 * @version 1.15.0
 * @see docs/specs/SPEC-v115-quarto-enhancements-2026-01-07.md
 */

import { CompletionContext, CompletionResult, Completion } from '@codemirror/autocomplete'
import { Text } from '@codemirror/state'

// =============================================================================
// Types
// =============================================================================

interface YamlCompletionOption {
  label: string
  detail: string
  info?: string
  type: 'keyword' | 'property'
  children?: YamlValueOption[]
}

interface YamlValueOption {
  label: string
  detail: string
}

interface ChunkOption {
  label: string
  values: string[]
  description: string
}

export interface CrossRef {
  type: 'fig' | 'tbl' | 'eq' | 'sec' | 'lst' | 'thm'
  label: string
  context: string
  line: number
}

// =============================================================================
// YAML Frontmatter Data
// =============================================================================

const YAML_KEYS: YamlCompletionOption[] = [
  // Document metadata
  {
    label: 'title:',
    detail: 'Document title',
    type: 'property',
  },
  {
    label: 'author:',
    detail: 'Author name(s)',
    type: 'property',
  },
  {
    label: 'date:',
    detail: 'Document date',
    type: 'property',
    children: [
      { label: 'today', detail: 'Current date' },
      { label: 'last-modified', detail: 'Last modified date' },
    ],
  },
  {
    label: 'abstract:',
    detail: 'Document abstract',
    type: 'property',
  },

  // Output format
  {
    label: 'format:',
    detail: 'Output format',
    type: 'keyword',
    children: [
      { label: 'html', detail: 'HTML document' },
      { label: 'pdf', detail: 'PDF via LaTeX' },
      { label: 'docx', detail: 'Word document' },
      { label: 'revealjs', detail: 'Reveal.js presentation' },
      { label: 'beamer', detail: 'LaTeX Beamer slides' },
      { label: 'typst', detail: 'Typst document' },
      { label: 'gfm', detail: 'GitHub Flavored Markdown' },
      { label: 'epub', detail: 'EPUB ebook' },
    ],
  },

  // Code execution
  {
    label: 'execute:',
    detail: 'Code execution options',
    type: 'keyword',
    children: [
      { label: 'echo: true', detail: 'Show code in output' },
      { label: 'echo: false', detail: 'Hide code in output' },
      { label: 'eval: true', detail: 'Execute code' },
      { label: 'eval: false', detail: 'Skip execution' },
      { label: 'warning: false', detail: 'Suppress warnings' },
      { label: 'message: false', detail: 'Suppress messages' },
      { label: 'output: true', detail: 'Show output' },
      { label: 'output: false', detail: 'Hide output' },
      { label: 'cache: true', detail: 'Cache results' },
      { label: 'freeze: auto', detail: 'Freeze computations' },
    ],
  },

  // Bibliography
  {
    label: 'bibliography:',
    detail: 'BibTeX file path',
    type: 'property',
    info: 'Path to .bib file for citations',
  },
  {
    label: 'csl:',
    detail: 'Citation style file',
    type: 'property',
    info: 'Path to .csl file for citation formatting',
  },
  {
    label: 'cite-method:',
    detail: 'Citation method',
    type: 'property',
    children: [
      { label: 'citeproc', detail: 'Default Pandoc citeproc' },
      { label: 'natbib', detail: 'LaTeX natbib' },
      { label: 'biblatex', detail: 'LaTeX biblatex' },
    ],
  },

  // Table of contents
  {
    label: 'toc:',
    detail: 'Table of contents',
    type: 'property',
    children: [
      { label: 'true', detail: 'Enable TOC' },
      { label: 'false', detail: 'Disable TOC' },
    ],
  },
  {
    label: 'toc-depth:',
    detail: 'TOC heading depth',
    type: 'property',
    children: [
      { label: '2', detail: 'Up to level 2' },
      { label: '3', detail: 'Up to level 3' },
      { label: '4', detail: 'Up to level 4' },
    ],
  },

  // Numbering
  {
    label: 'number-sections:',
    detail: 'Number sections',
    type: 'property',
    children: [
      { label: 'true', detail: 'Enable numbering' },
      { label: 'false', detail: 'Disable numbering' },
    ],
  },

  // Code appearance
  {
    label: 'code-fold:',
    detail: 'Fold code blocks',
    type: 'property',
    children: [
      { label: 'true', detail: 'Fold by default' },
      { label: 'false', detail: 'Expand by default' },
      { label: 'show', detail: 'Show fold button' },
    ],
  },
  {
    label: 'code-tools:',
    detail: 'Code tools menu',
    type: 'property',
    children: [
      { label: 'true', detail: 'Show code tools' },
      { label: 'false', detail: 'Hide code tools' },
    ],
  },
  {
    label: 'highlight-style:',
    detail: 'Syntax highlighting theme',
    type: 'property',
    children: [
      { label: 'github', detail: 'GitHub style' },
      { label: 'zenburn', detail: 'Zenburn dark' },
      { label: 'tango', detail: 'Tango style' },
      { label: 'monokai', detail: 'Monokai dark' },
      { label: 'espresso', detail: 'Espresso style' },
      { label: 'kate', detail: 'Kate style' },
    ],
  },

  // Figure/Table options
  {
    label: 'fig-cap-location:',
    detail: 'Figure caption location',
    type: 'property',
    children: [
      { label: 'bottom', detail: 'Caption below figure' },
      { label: 'top', detail: 'Caption above figure' },
      { label: 'margin', detail: 'Caption in margin' },
    ],
  },
  {
    label: 'tbl-cap-location:',
    detail: 'Table caption location',
    type: 'property',
    children: [
      { label: 'top', detail: 'Caption above table' },
      { label: 'bottom', detail: 'Caption below table' },
      { label: 'margin', detail: 'Caption in margin' },
    ],
  },

  // Cross-reference options
  {
    label: 'crossref:',
    detail: 'Cross-reference options',
    type: 'keyword',
  },

  // PDF-specific
  {
    label: 'pdf-engine:',
    detail: 'PDF engine',
    type: 'property',
    children: [
      { label: 'pdflatex', detail: 'Standard pdfLaTeX' },
      { label: 'xelatex', detail: 'XeLaTeX (Unicode)' },
      { label: 'lualatex', detail: 'LuaLaTeX' },
      { label: 'tectonic', detail: 'Tectonic engine' },
    ],
  },
  {
    label: 'documentclass:',
    detail: 'LaTeX document class',
    type: 'property',
    children: [
      { label: 'article', detail: 'Standard article' },
      { label: 'report', detail: 'Report class' },
      { label: 'book', detail: 'Book class' },
      { label: 'scrartcl', detail: 'KOMA article' },
    ],
  },

  // HTML-specific
  {
    label: 'theme:',
    detail: 'HTML theme',
    type: 'property',
    children: [
      { label: 'default', detail: 'Default theme' },
      { label: 'cosmo', detail: 'Cosmo Bootstrap' },
      { label: 'flatly', detail: 'Flatly Bootstrap' },
      { label: 'darkly', detail: 'Darkly Bootstrap' },
      { label: 'litera', detail: 'Litera Bootstrap' },
      { label: 'lumen', detail: 'Lumen Bootstrap' },
      { label: 'materia', detail: 'Materia Bootstrap' },
      { label: 'minty', detail: 'Minty Bootstrap' },
      { label: 'pulse', detail: 'Pulse Bootstrap' },
      { label: 'sandstone', detail: 'Sandstone Bootstrap' },
      { label: 'simplex', detail: 'Simplex Bootstrap' },
      { label: 'sketchy', detail: 'Sketchy Bootstrap' },
      { label: 'slate', detail: 'Slate Bootstrap' },
      { label: 'solar', detail: 'Solar Bootstrap' },
      { label: 'spacelab', detail: 'Spacelab Bootstrap' },
      { label: 'superhero', detail: 'Superhero Bootstrap' },
      { label: 'united', detail: 'United Bootstrap' },
      { label: 'yeti', detail: 'Yeti Bootstrap' },
    ],
  },

  // Language
  {
    label: 'lang:',
    detail: 'Document language',
    type: 'property',
    children: [
      { label: 'en', detail: 'English' },
      { label: 'es', detail: 'Spanish' },
      { label: 'fr', detail: 'French' },
      { label: 'de', detail: 'German' },
      { label: 'zh', detail: 'Chinese' },
      { label: 'ja', detail: 'Japanese' },
    ],
  },

  // Jupyter/Engine
  {
    label: 'jupyter:',
    detail: 'Jupyter kernel',
    type: 'property',
    children: [
      { label: 'python3', detail: 'Python 3 kernel' },
      { label: 'ir', detail: 'R kernel' },
      { label: 'julia-1.9', detail: 'Julia kernel' },
    ],
  },
  {
    label: 'engine:',
    detail: 'Computation engine',
    type: 'property',
    children: [
      { label: 'knitr', detail: 'R knitr engine' },
      { label: 'jupyter', detail: 'Jupyter engine' },
    ],
  },
]

// =============================================================================
// Chunk Options Data
// =============================================================================

const CHUNK_OPTIONS: ChunkOption[] = [
  // Execution
  { label: '#| echo:', values: ['true', 'false', 'fenced'], description: 'Show source code' },
  { label: '#| eval:', values: ['true', 'false'], description: 'Execute code' },
  { label: '#| output:', values: ['true', 'false', 'asis'], description: 'Include output' },
  { label: '#| warning:', values: ['true', 'false'], description: 'Show warnings' },
  { label: '#| message:', values: ['true', 'false'], description: 'Show messages' },
  { label: '#| error:', values: ['true', 'false'], description: 'Continue on error' },
  { label: '#| include:', values: ['true', 'false'], description: 'Include chunk in output' },
  { label: '#| cache:', values: ['true', 'false'], description: 'Cache results' },

  // Labels & Captions
  { label: '#| label:', values: [], description: 'Chunk label for cross-refs' },
  { label: '#| fig-cap:', values: [], description: 'Figure caption' },
  { label: '#| tbl-cap:', values: [], description: 'Table caption' },

  // Figure dimensions
  { label: '#| fig-width:', values: ['4', '5', '6', '7', '8', '10', '12'], description: 'Figure width (inches)' },
  { label: '#| fig-height:', values: ['3', '4', '5', '6', '8'], description: 'Figure height (inches)' },
  { label: '#| fig-asp:', values: ['0.618', '0.75', '1', '1.5'], description: 'Figure aspect ratio' },
  { label: '#| out-width:', values: ['100%', '80%', '50%', '400px'], description: 'Output width' },
  { label: '#| out-height:', values: ['400px', '300px', '500px'], description: 'Output height' },

  // Figure layout
  { label: '#| fig-align:', values: ['default', 'left', 'center', 'right'], description: 'Figure alignment' },
  { label: '#| fig-pos:', values: ['H', 'h', 't', 'b', 'p'], description: 'LaTeX figure position' },
  { label: '#| layout-ncol:', values: ['1', '2', '3', '4'], description: 'Layout columns' },
  { label: '#| layout-nrow:', values: ['1', '2', '3'], description: 'Layout rows' },

  // Code appearance
  { label: '#| code-fold:', values: ['true', 'false', 'show'], description: 'Fold code block' },
  { label: '#| code-summary:', values: [], description: 'Folded code label' },
  { label: '#| code-line-numbers:', values: ['true', 'false'], description: 'Show line numbers' },
  { label: '#| code-overflow:', values: ['wrap', 'scroll'], description: 'Code overflow handling' },

  // Table options
  { label: '#| tbl-colwidths:', values: ['auto', 'true', 'false'], description: 'Table column widths' },

  // Panel options (for tabsets)
  { label: '#| panel:', values: ['tabset', 'input', 'sidebar'], description: 'Panel type' },

  // Classes and attributes
  { label: '#| classes:', values: [], description: 'CSS classes for output' },
  { label: '#| attr-output:', values: [], description: 'Output attributes' },
]

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if cursor is inside a YAML frontmatter block (between --- delimiters)
 */
export function isInYamlBlock(context: CompletionContext): boolean {
  const { state } = context
  const doc = state.doc
  const pos = context.pos

  // Get all text up to cursor
  const textBefore = doc.sliceString(0, pos)

  // Count --- occurrences before cursor
  const yamlDelimiters = textBefore.match(/^---$/gm)
  if (!yamlDelimiters) return false

  // If we have an odd number of ---, we're inside YAML
  // (First --- opens, second --- closes)
  const delimiterCount = yamlDelimiters.length

  // Also check that first --- is at the very beginning of the document
  const firstDelimiterPos = textBefore.indexOf('---')
  if (firstDelimiterPos > 0) {
    // There's content before first ---, not a valid YAML block
    const beforeFirst = textBefore.slice(0, firstDelimiterPos).trim()
    if (beforeFirst.length > 0) return false
  }

  return delimiterCount === 1 // Inside first YAML block
}

/**
 * Check if cursor is inside a code block (between ``` delimiters)
 */
export function isInCodeBlock(context: CompletionContext): boolean {
  const { state } = context
  const doc = state.doc
  const pos = context.pos

  // Get line at cursor
  const line = doc.lineAt(pos)
  const lineText = line.text

  // Quick check: if line starts with #|, we're definitely in a code block
  if (lineText.trimStart().startsWith('#|')) {
    return true
  }

  // Get all text up to cursor
  const textBefore = doc.sliceString(0, pos)

  // Count all ``` fence lines - odd count means inside, even means outside
  // (First ``` opens, second ``` closes, etc.)
  const fenceLines = textBefore.match(/^```.*$/gm)
  if (!fenceLines) return false

  return fenceLines.length % 2 === 1
}

/**
 * Get the current YAML key context (e.g., after "format:" returns "format")
 */
function getYamlContext(context: CompletionContext): { key: string | null; afterColon: boolean } {
  const line = context.state.doc.lineAt(context.pos)
  const lineText = line.text
  const beforeCursor = lineText.slice(0, context.pos - line.from)

  // Check if we're after a colon (typing a value)
  const colonIndex = beforeCursor.lastIndexOf(':')
  if (colonIndex !== -1) {
    const key = beforeCursor.slice(0, colonIndex).trim()
    return { key, afterColon: true }
  }

  return { key: null, afterColon: false }
}

// =============================================================================
// Completion Functions
// =============================================================================

/**
 * YAML Frontmatter Completions
 *
 * Triggers when typing in YAML block (between --- delimiters)
 * Provides completions for Quarto YAML keys and their values
 */
export function yamlCompletions(context: CompletionContext): CompletionResult | null {
  // Only activate in YAML blocks
  if (!isInYamlBlock(context)) return null

  const yamlContext = getYamlContext(context)

  // After colon: suggest values for the key
  if (yamlContext.afterColon && yamlContext.key) {
    const keyConfig = YAML_KEYS.find(k => k.label.startsWith(yamlContext.key + ':'))
    if (keyConfig?.children) {
      const word = context.matchBefore(/[a-zA-Z0-9-]*/)

      // CRITICAL FIX: Return completions from context.pos if no word match
      const from = word ? word.from : context.pos

      const options: Completion[] = keyConfig.children.map(child => ({
        label: child.label,
        detail: child.detail,
        type: 'constant',
      }))

      return {
        from,
        options,
        validFor: /^[a-zA-Z0-9-]*$/,
      }
    }
    return null
  }

  // At start of line or after whitespace: suggest keys
  const word = context.matchBefore(/[a-zA-Z-]*:?/)

  // CRITICAL FIX: Return completions even with no word match
  // This enables auto-trigger - CodeMirror needs results for non-explicit queries
  const from = word ? word.from : context.pos

  const options: Completion[] = YAML_KEYS.map(key => ({
    label: key.label,
    detail: key.detail,
    info: key.info,
    type: key.type,
  }))

  return {
    from,
    options,
    validFor: /^[a-zA-Z-]*:?$/,
  }
}

/**
 * Chunk Options Completions
 *
 * Triggers when typing #| at start of line inside code block
 * Provides completions for Quarto chunk options
 */
export function chunkOptionCompletions(context: CompletionContext): CompletionResult | null {
  // Must be in a code block
  if (!isInCodeBlock(context)) return null

  // Check if we're after the colon (typing a value)
  const lineText = context.state.doc.lineAt(context.pos).text
  const beforeCursor = lineText.slice(0, context.pos - context.state.doc.lineAt(context.pos).from)

  // Find if we're typing a value after an option (e.g., "#| echo: tr")
  const optionMatch = beforeCursor.match(/#\|\s*([a-zA-Z-]+):\s*([a-zA-Z0-9-]*)$/)
  if (optionMatch) {
    const optionName = optionMatch[1]
    const optionConfig = CHUNK_OPTIONS.find(o => o.label === `#| ${optionName}:`)

    if (optionConfig && optionConfig.values.length > 0) {
      const valueWord = context.matchBefore(/[a-zA-Z0-9-]*/)

      // CRITICAL FIX: Return completions from context.pos if no word match
      const from = valueWord ? valueWord.from : context.pos

      const options: Completion[] = optionConfig.values.map(value => ({
        label: value,
        detail: optionConfig.description,
        type: 'constant',
      }))

      return {
        from,
        options,
        validFor: /^[a-zA-Z0-9-]*$/,
      }
    }
  }

  // Match #| followed by option name (for option key completions)
  const word = context.matchBefore(/#\|\s*[a-zA-Z-]*:?/)

  // Only show chunk options if #| pattern is present
  // Check if the text before cursor contains #|
  if (!word && !beforeCursor.match(/#\|\s*$/)) {
    return null
  }

  // CRITICAL FIX: Return completions from context.pos if no word match
  const from = word ? word.from : context.pos

  // Suggest option names
  const options: Completion[] = CHUNK_OPTIONS.map(opt => ({
    label: opt.label,
    detail: opt.description,
    type: 'property',
    apply: opt.label + ' ',  // Add space after colon
  }))

  return {
    from,
    options,
    validFor: /^#\|\s*[a-zA-Z-]*:?$/,
  }
}

/**
 * Scan document for cross-reference labels
 *
 * Looks for:
 * - {#fig-*} in figure captions
 * - {#tbl-*} in table captions
 * - {#eq-*} in equation environments
 * - {#sec-*} in section headers
 * - #| label: fig-* in code chunks
 */
export function scanForLabels(doc: Text): CrossRef[] {
  const refs: CrossRef[] = []
  const content = doc.toString()
  const lines = content.split('\n')

  // Pattern for {#type-label} syntax
  const bracketPattern = /\{#(fig|tbl|eq|sec|lst|thm)-([a-zA-Z0-9_-]+)\}/g

  // Pattern for #| label: type-label in code chunks
  const chunkLabelPattern = /#\|\s*label:\s*(fig|tbl|eq|sec|lst|thm)-([a-zA-Z0-9_-]+)/g

  lines.forEach((line, index) => {
    // Check bracket syntax
    let match
    while ((match = bracketPattern.exec(line)) !== null) {
      const type = match[1] as CrossRef['type']
      const label = match[2]
      const context = extractContext(lines, index, type)

      refs.push({
        type,
        label: `${type}-${label}`,
        context,
        line: index + 1,
      })
    }

    // Check chunk label syntax
    while ((match = chunkLabelPattern.exec(line)) !== null) {
      const type = match[1] as CrossRef['type']
      const label = match[2]
      const context = extractCaptionContext(lines, index, type)

      refs.push({
        type,
        label: `${type}-${label}`,
        context,
        line: index + 1,
      })
    }

    // Reset lastIndex for global patterns
    bracketPattern.lastIndex = 0
    chunkLabelPattern.lastIndex = 0
  })

  return refs
}

/**
 * Extract context (caption/title) near a label
 */
function extractContext(lines: string[], lineIndex: number, type: string): string {
  // For sections, the header text is the context
  if (type === 'sec') {
    const line = lines[lineIndex]
    const headerMatch = line.match(/^#+\s*(.+?)\s*\{#sec-/)
    if (headerMatch) return headerMatch[1].slice(0, 50)
  }

  // For equations, look for surrounding context
  if (type === 'eq') {
    // Look at previous line for context
    if (lineIndex > 0) {
      const prevLine = lines[lineIndex - 1].trim()
      if (prevLine && !prevLine.startsWith('$$')) {
        return prevLine.slice(0, 50)
      }
    }
  }

  // For figures/tables, look for caption nearby
  return extractCaptionContext(lines, lineIndex, type)
}

/**
 * Extract caption from nearby lines (for fig-cap, tbl-cap)
 */
function extractCaptionContext(lines: string[], lineIndex: number, type: string): string {
  // Look within 5 lines for a caption
  const searchStart = Math.max(0, lineIndex - 2)
  const searchEnd = Math.min(lines.length, lineIndex + 5)

  const capType = type === 'tbl' ? 'tbl-cap' : 'fig-cap'
  const capPattern = new RegExp(`#\\|\\s*${capType}:\\s*["']?(.+?)["']?\\s*$`)

  for (let i = searchStart; i < searchEnd; i++) {
    const match = lines[i].match(capPattern)
    if (match) {
      return match[1].slice(0, 50)
    }
  }

  // No caption found, return generic label
  return `${type} at line ${lineIndex + 1}`
}

/**
 * Cross-Reference Completions
 *
 * Triggers when typing @ in document body
 * Provides completions for @fig-*, @tbl-*, @eq-*, @sec-*
 */
export function crossRefCompletions(context: CompletionContext): CompletionResult | null {
  // Don't trigger in YAML or code blocks for main refs
  if (isInYamlBlock(context)) return null

  // Match @type- or @type-partial
  const word = context.matchBefore(/@[a-zA-Z]*-?[a-zA-Z0-9_-]*/)

  // Only show cross-ref completions if @ is present
  // Check the character before cursor
  const charBefore = context.state.doc.sliceString(context.pos - 1, context.pos)
  if (!word && charBefore !== '@') {
    return null
  }

  // CRITICAL FIX: Return completions from context.pos if no word match
  const from = word ? word.from : context.pos

  // Scan document for labels
  const labels = scanForLabels(context.state.doc)

  if (labels.length === 0) {
    // No labels found, show hint
    return {
      from,
      options: [{
        label: '@fig-',
        detail: 'No labels found. Use #| label: or {#type-id}',
        type: 'text',
      }],
    }
  }

  // Build completion options grouped by type
  const options: Completion[] = labels.map(ref => ({
    label: `@${ref.label}`,
    detail: ref.context,
    info: `Line ${ref.line}`,
    type: 'reference',
    section: ref.type.toUpperCase(),
  }))

  return {
    from,
    options,
    validFor: /^@[a-zA-Z]*-?[a-zA-Z0-9_-]*$/,
  }
}

/**
 * Combined Quarto completions source
 *
 * Use this as a single completion source that handles all Quarto patterns
 */
export function quartoCompletions(context: CompletionContext): CompletionResult | null {
  // Try each completion source in order
  return yamlCompletions(context)
    ?? chunkOptionCompletions(context)
    ?? crossRefCompletions(context)
}
