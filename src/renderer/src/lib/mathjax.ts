/**
 * Math Rendering using KaTeX
 *
 * Provides LaTeX support with HTML output for Scribe.
 * KaTeX is browser-native (no CommonJS/Node.js dependencies).
 *
 * Note: This file was originally named mathjax.ts but now uses KaTeX
 * to avoid CommonJS bundling issues with mathjax-full.
 */

import katex from 'katex'

/**
 * Render LaTeX to HTML string using KaTeX
 *
 * @param latex - The LaTeX string to render
 * @param display - True for block/display mode, false for inline
 * @returns HTML string containing rendered math
 */
export function renderMath(latex: string, display: boolean = false): string {
  try {
    return katex.renderToString(latex, {
      displayMode: display,
      throwOnError: false,  // Return error message instead of throwing
      errorColor: '#ef4444',  // Red color for errors
      trust: false,  // Don't trust user input (security)
      strict: false,  // Lenient parsing
      output: 'html',  // HTML output (lighter than MathML+HTML)
    })
  } catch (error) {
    console.error('[KaTeX] Render error:', error)
    throw error
  }
}

/**
 * Check if a string contains math delimiters
 */
export function containsMath(content: string): boolean {
  // Check for $...$ (inline) or $$...$$ (block)
  return /\$\$[\s\S]+?\$\$|\$[^$\n]+?\$/.test(content)
}

/**
 * Extract math expressions from content
 * Returns array of { tex, display, start, end }
 */
export function extractMathExpressions(content: string): Array<{
  tex: string
  display: boolean
  start: number
  end: number
}> {
  const expressions: Array<{
    tex: string
    display: boolean
    start: number
    end: number
  }> = []

  // Block math $$...$$
  const blockRegex = /\$\$([\s\S]+?)\$\$/g
  let match: RegExpExecArray | null

  while ((match = blockRegex.exec(content)) !== null) {
    expressions.push({
      tex: match[1].trim(),
      display: true,
      start: match.index,
      end: match.index + match[0].length,
    })
  }

  // Inline math $...$ (but not $$)
  const inlineRegex = /(?<!\$)\$(?!\$)([^$\n]+?)\$(?!\$)/g
  while ((match = inlineRegex.exec(content)) !== null) {
    // Make sure this isn't inside a block expression
    const isInsideBlock = expressions.some(
      (e) => match!.index >= e.start && match!.index < e.end
    )
    if (!isInsideBlock) {
      expressions.push({
        tex: match[1].trim(),
        display: false,
        start: match.index,
        end: match.index + match[0].length,
      })
    }
  }

  // Sort by position
  expressions.sort((a, b) => a.start - b.start)

  return expressions
}

/**
 * Process content and render all math expressions
 * Returns content with math replaced by rendered HTML
 */
export function processMathInContent(content: string): string {
  const expressions = extractMathExpressions(content)

  if (expressions.length === 0) {
    return content
  }

  let result = ''
  let lastEnd = 0

  for (const expr of expressions) {
    // Add content before this expression
    result += content.substring(lastEnd, expr.start)

    // Render the math
    try {
      const rendered = renderMath(expr.tex, expr.display)
      const wrapperClass = expr.display ? 'math-block' : 'math-inline'
      result += `<span class="${wrapperClass}">${rendered}</span>`
    } catch (error) {
      // On error, show the original with error styling
      const original = content.substring(expr.start, expr.end)
      result += `<span class="math-error" title="Math error">${escapeHtml(original)}</span>`
    }

    lastEnd = expr.end
  }

  // Add remaining content
  result += content.substring(lastEnd)

  return result
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
