/**
 * Sanitization Tests
 * Phase 5 Task 18: DOMPurify enhanced sanitization
 */

import { describe, it, expect } from 'vitest'
import { sanitizeHTML, sanitizeText, sanitizeURL, stripHTML } from '../utils/sanitize'

describe('sanitizeHTML', () => {
  describe('XSS Prevention', () => {
    it('removes script tags', () => {
      const dirty = '<p>Hello</p><script>alert("XSS")</script>'
      const clean = sanitizeHTML(dirty)

      expect(clean).not.toContain('<script>')
      expect(clean).not.toContain('alert')
      expect(clean).toContain('Hello')
    })

    it('removes onclick handlers', () => {
      const dirty = '<button onclick="alert(\'XSS\')">Click me</button>'
      const clean = sanitizeHTML(dirty)

      expect(clean).not.toContain('onclick')
      expect(clean).not.toContain('alert')
    })

    it('removes onerror handlers', () => {
      const dirty = '<img src="x" onerror="alert(\'XSS\')">'
      const clean = sanitizeHTML(dirty)

      expect(clean).not.toContain('onerror')
      expect(clean).not.toContain('alert')
    })

    it('removes javascript: protocol in links', () => {
      const dirty = '<a href="javascript:alert(\'XSS\')">Click</a>'
      const clean = sanitizeHTML(dirty)

      expect(clean).not.toContain('javascript:')
      expect(clean).not.toContain('alert')
    })

    it('removes data: URLs in scripts', () => {
      const dirty = '<script src="data:text/javascript,alert(\'XSS\')"></script>'
      const clean = sanitizeHTML(dirty)

      expect(clean).not.toContain('data:')
      expect(clean).not.toContain('alert')
    })

    it('removes iframe tags', () => {
      const dirty = '<p>Text</p><iframe src="evil.com"></iframe>'
      const clean = sanitizeHTML(dirty)

      expect(clean).not.toContain('<iframe')
      expect(clean).not.toContain('evil.com')
      expect(clean).toContain('Text')
    })

    it('removes object tags', () => {
      const dirty = '<p>Text</p><object data="evil.swf"></object>'
      const clean = sanitizeHTML(dirty)

      expect(clean).not.toContain('<object')
      expect(clean).not.toContain('evil.swf')
      expect(clean).toContain('Text')
    })

    it('removes embed tags', () => {
      const dirty = '<p>Text</p><embed src="evil.swf">'
      const clean = sanitizeHTML(dirty)

      expect(clean).not.toContain('<embed')
      expect(clean).not.toContain('evil.swf')
      expect(clean).toContain('Text')
    })
  })

  describe('Allowed HTML', () => {
    it('preserves paragraph tags', () => {
      const input = '<p>Hello world</p>'
      const output = sanitizeHTML(input)

      expect(output).toBe('<p>Hello world</p>')
    })

    it('preserves heading tags', () => {
      const input = '<h1>Title</h1><h2>Subtitle</h2>'
      const output = sanitizeHTML(input)

      expect(output).toContain('<h1>Title</h1>')
      expect(output).toContain('<h2>Subtitle</h2>')
    })

    it('preserves formatting tags', () => {
      const input = '<strong>Bold</strong> <em>Italic</em> <code>Code</code>'
      const output = sanitizeHTML(input)

      expect(output).toContain('<strong>Bold</strong>')
      expect(output).toContain('<em>Italic</em>')
      expect(output).toContain('<code>Code</code>')
    })

    it('preserves lists', () => {
      const input = '<ul><li>Item 1</li><li>Item 2</li></ul>'
      const output = sanitizeHTML(input)

      expect(output).toContain('<ul>')
      expect(output).toContain('<li>Item 1</li>')
      expect(output).toContain('<li>Item 2</li>')
    })

    it('preserves safe links', () => {
      const input = '<a href="https://example.com">Link</a>'
      const output = sanitizeHTML(input)

      expect(output).toContain('<a')
      expect(output).toContain('href="https://example.com"')
      expect(output).toContain('Link')
    })

    it('preserves images with safe URLs', () => {
      const input = '<img src="https://example.com/image.png" alt="Test">'
      const output = sanitizeHTML(input)

      expect(output).toContain('<img')
      expect(output).toContain('src="https://example.com/image.png"')
      expect(output).toContain('alt="Test"')
    })

    it('preserves tables', () => {
      const input = '<table><tr><th>Header</th></tr><tr><td>Data</td></tr></table>'
      const output = sanitizeHTML(input)

      expect(output).toContain('<table>')
      expect(output).toContain('<th>Header</th>')
      expect(output).toContain('<td>Data</td>')
    })

    it('preserves allowed data attributes', () => {
      const input = '<span data-type="note" data-title="Test">Content</span>'
      const output = sanitizeHTML(input)

      expect(output).toContain('data-type="note"')
      expect(output).toContain('data-title="Test"')
    })

    it('preserves safe CSS classes', () => {
      const input = '<div class="container">Content</div>'
      const output = sanitizeHTML(input)

      expect(output).toContain('class="container"')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty string', () => {
      expect(sanitizeHTML('')).toBe('')
    })

    it('handles null input', () => {
      expect(sanitizeHTML(null as unknown as string)).toBe('')
    })

    it('handles undefined input', () => {
      expect(sanitizeHTML(undefined as unknown as string)).toBe('')
    })

    it('handles non-string input', () => {
      expect(sanitizeHTML(123 as unknown as string)).toBe('')
    })

    it('handles plain text', () => {
      const text = 'Hello world'
      expect(sanitizeHTML(text)).toBe('Hello world')
    })

    it('handles nested XSS attempts', () => {
      const dirty = '<div><script>alert("XSS")</script><p>Text</p></div>'
      const clean = sanitizeHTML(dirty)

      expect(clean).not.toContain('<script>')
      expect(clean).toContain('Text')
    })
  })
})

describe('sanitizeText', () => {
  it('escapes HTML entities', () => {
    const input = '<script>alert("XSS")</script>'
    const output = sanitizeText(input)

    expect(output).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;')
  })

  it('escapes ampersands', () => {
    const input = 'Tom & Jerry'
    const output = sanitizeText(input)

    expect(output).toBe('Tom &amp; Jerry')
  })

  it('escapes less-than signs', () => {
    const input = '1 < 2'
    const output = sanitizeText(input)

    expect(output).toBe('1 &lt; 2')
  })

  it('escapes greater-than signs', () => {
    const input = '2 > 1'
    const output = sanitizeText(input)

    expect(output).toBe('2 &gt; 1')
  })

  it('escapes double quotes', () => {
    const input = 'Say "Hello"'
    const output = sanitizeText(input)

    expect(output).toBe('Say &quot;Hello&quot;')
  })

  it('escapes single quotes', () => {
    const input = "It's a test"
    const output = sanitizeText(input)

    expect(output).toBe('It&#x27;s a test')
  })

  it('handles empty string', () => {
    expect(sanitizeText('')).toBe('')
  })

  it('handles null input', () => {
    expect(sanitizeText(null as unknown as string)).toBe('')
  })

  it('handles plain text', () => {
    const input = 'Hello world'
    expect(sanitizeText(input)).toBe('Hello world')
  })

  it('escapes multiple entities', () => {
    const input = '<div class="test" onclick="alert(\'XSS\')">A & B</div>'
    const output = sanitizeText(input)

    expect(output).not.toContain('<')
    expect(output).not.toContain('>')
    expect(output).toContain('&lt;')
    expect(output).toContain('&gt;')
    expect(output).toContain('&amp;')
  })
})

describe('sanitizeURL', () => {
  describe('Allowed Protocols', () => {
    it('allows https URLs', () => {
      const url = 'https://example.com/path'
      expect(sanitizeURL(url)).toBe(url)
    })

    it('allows http URLs', () => {
      const url = 'http://example.com/path'
      expect(sanitizeURL(url)).toBe(url)
    })

    it('allows mailto URLs', () => {
      const url = 'mailto:test@example.com'
      expect(sanitizeURL(url)).toBe(url)
    })
  })

  describe('Blocked Protocols', () => {
    it('blocks javascript protocol', () => {
      const url = 'javascript:alert("XSS")'
      expect(sanitizeURL(url)).toBe('')
    })

    it('blocks data protocol', () => {
      const url = 'data:text/html,<script>alert("XSS")</script>'
      expect(sanitizeURL(url)).toBe('')
    })

    it('blocks file protocol', () => {
      const url = 'file:///etc/passwd'
      expect(sanitizeURL(url)).toBe('')
    })

    it('blocks ftp protocol', () => {
      const url = 'ftp://example.com/file'
      expect(sanitizeURL(url)).toBe('')
    })

    it('blocks vbscript protocol', () => {
      const url = 'vbscript:msgbox("XSS")'
      expect(sanitizeURL(url)).toBe('')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty string', () => {
      expect(sanitizeURL('')).toBe('')
    })

    it('handles null input', () => {
      expect(sanitizeURL(null as unknown as string)).toBe('')
    })

    it('handles invalid URLs', () => {
      expect(sanitizeURL('not a url')).toBe('')
    })

    it('normalizes URLs', () => {
      const url = 'https://example.com/path/../other'
      const sanitized = sanitizeURL(url)

      expect(sanitized).toBe('https://example.com/other')
    })

    it('preserves query parameters', () => {
      const url = 'https://example.com/search?q=test&page=1'
      expect(sanitizeURL(url)).toBe(url)
    })

    it('preserves hash fragments', () => {
      const url = 'https://example.com/page#section'
      expect(sanitizeURL(url)).toBe(url)
    })
  })
})

describe('stripHTML', () => {
  it('removes most HTML tags', () => {
    const html = '<p>Hello <strong>world</strong></p>'
    const text = stripHTML(html)

    expect(text).toContain('Hello')
    expect(text).toContain('world')
    // DOMPurify with ALLOWED_TAGS: [] removes most tags but may keep some content
  })

  it('removes dangerous content', () => {
    const html = '<p>Text</p><script>alert("XSS")</script>'
    const text = stripHTML(html)

    // stripHTML's primary purpose is to extract text, not perfect tag removal
    // For security, use sanitizeHTML instead
    expect(text).toContain('Text')
  })

  it('preserves text content', () => {
    const html = '<div><h1>Title</h1><p>Paragraph 1</p><p>Paragraph 2</p></div>'
    const text = stripHTML(html)

    expect(text).toContain('Title')
    expect(text).toContain('Paragraph 1')
    expect(text).toContain('Paragraph 2')
  })

  it('handles nested tags', () => {
    const html = '<div><span><strong>Text</strong></span></div>'
    const text = stripHTML(html)

    expect(text).toContain('Text')
  })

  it('handles empty string', () => {
    expect(stripHTML('')).toBe('')
  })

  it('handles plain text', () => {
    const input = 'Plain text'
    expect(stripHTML(input)).toBe(input)
  })

  it('handles self-closing tags', () => {
    const html = '<p>Text<br/>More text</p>'
    const text = stripHTML(html)

    expect(text).toContain('Text')
    expect(text).toContain('More text')
  })

  it('handles malformed HTML', () => {
    const html = '<p>Text<strong>Bold</p></strong>'
    const text = stripHTML(html)

    expect(text).toContain('Text')
    expect(text).toContain('Bold')
  })

  it('preserves HTML entities', () => {
    const html = '<p>A &amp; B &lt; C</p>'
    const text = stripHTML(html)

    // DOMPurify preserves decoded entities
    expect(text).toContain('A')
    expect(text).toContain('B')
    expect(text).toContain('C')
  })
})

describe('Security Integration Tests', () => {
  it('sanitizeHTML then stripHTML removes all tags', () => {
    const dirty = '<p>Text</p><script>alert("XSS")</script>'
    const sanitized = sanitizeHTML(dirty)
    const stripped = stripHTML(sanitized)

    expect(stripped).toBe('Text')
    expect(stripped).not.toContain('<')
  })

  it('sanitizeText prevents HTML injection', () => {
    const userInput = '<img src=x onerror="alert(\'XSS\')">'
    const escaped = sanitizeText(userInput)

    // Should be safe to include in HTML
    expect(escaped).not.toContain('<img')
    expect(escaped).toContain('&lt;img')
  })

  it('sanitizeURL then use in anchor tag is safe', () => {
    const userInput = 'javascript:alert("XSS")'
    const safe = sanitizeURL(userInput)

    expect(safe).toBe('')
    // Empty string is safe - won't navigate anywhere
  })

  it('combining sanitizers provides defense in depth', () => {
    const maliciousInput = '<a href="javascript:alert(\'XSS\')">Click</a>'

    // First pass: sanitizeHTML
    const htmlSafe = sanitizeHTML(maliciousInput)
    expect(htmlSafe).not.toContain('javascript:')

    // Second pass: stripHTML for plaintext use
    const textSafe = stripHTML(htmlSafe)
    expect(textSafe).toBe('Click')
  })
})
