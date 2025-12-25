import DOMPurify from 'dompurify'

/**
 * HTML Sanitization Utilities
 *
 * Provides secure HTML sanitization using DOMPurify to prevent XSS attacks.
 * All user-generated content should be sanitized before storage or display.
 */

/**
 * Sanitize HTML content for safe storage and display
 *
 * @param dirty - Untrusted HTML string
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHTML(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return ''
  }

  return DOMPurify.sanitize(dirty, {
    // Allow common formatting tags
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'span', 'div'
    ],

    // Allow safe attributes
    ALLOWED_ATTR: [
      'href', 'target', 'rel',
      'src', 'alt', 'title',
      'class', 'style',
      'data-type', 'data-title', 'data-tag-name', 'data-tag-color'
    ],

    // Disallow script-related attributes
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],

    // Keep relative URLs (for local links)
    ALLOW_DATA_ATTR: true,
    ALLOW_UNKNOWN_PROTOCOLS: false,

    // Return a string (not a DOM element)
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false
  })
}

/**
 * Sanitize plain text content
 *
 * @param text - Untrusted text string
 * @returns Sanitized text with HTML entities escaped
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  // Escape HTML entities
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Validate and sanitize URLs
 *
 * @param url - Untrusted URL string
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeURL(url: string): string {
  if (!url || typeof url !== 'string') {
    return ''
  }

  try {
    const parsed = new URL(url)

    // Only allow safe protocols
    const allowedProtocols = ['http:', 'https:', 'mailto:']

    if (!allowedProtocols.includes(parsed.protocol)) {
      console.warn('Blocked unsafe URL protocol:', parsed.protocol)
      return ''
    }

    return parsed.toString()
  } catch {
    // Invalid URL
    return ''
  }
}

/**
 * Strip all HTML tags from content
 *
 * @param html - HTML string
 * @returns Plain text with all tags removed
 */
export function stripHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return ''
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true
  })
}
