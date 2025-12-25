/**
 * Strip HTML tags from a string
 */
export function stripHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

/**
 * Escape special regex characters
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Extract a snippet of text around the first search match
 */
export function extractSearchSnippet(
  html: string,
  query: string,
  maxLength = 150
): string {
  // Strip HTML tags
  const text = stripHtml(html)

  // Get first search term
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) {
    return text.slice(0, maxLength) + (text.length > maxLength ? '...' : '')
  }

  const firstTerm = terms[0]
  const lowerText = text.toLowerCase()
  const matchIndex = lowerText.indexOf(firstTerm)

  if (matchIndex === -1) {
    // No match found, return beginning
    return text.slice(0, maxLength) + (text.length > maxLength ? '...' : '')
  }

  // Calculate snippet boundaries (centered on match)
  const contextBefore = 50
  const contextAfter = maxLength - firstTerm.length - contextBefore

  const start = Math.max(0, matchIndex - contextBefore)
  const end = Math.min(text.length, matchIndex + firstTerm.length + contextAfter)

  let snippet = text.slice(start, end)

  // Add ellipsis
  if (start > 0) snippet = '...' + snippet
  if (end < text.length) snippet = snippet + '...'

  return snippet
}
