# HTML Sanitization Guidelines - Scribe

> **Phase 5 Task 18:** DOMPurify enhanced sanitization

**Status:** ✅ Complete - Comprehensive sanitization with 60 passing tests
**Library:** DOMPurify v3.3.1
**Coverage:** 100% test coverage for all sanitization functions

---

## Overview

Scribe uses [DOMPurify](https://github.com/cure53/DOMPurify) for HTML sanitization to prevent Cross-Site Scripting (XSS) attacks. All user-generated content should be sanitized before storage or display.

---

## Sanitization Functions

### `sanitizeHTML(dirty: string): string`

**Purpose:** Sanitize HTML content for safe rendering

**Use When:**
- Rendering user-generated HTML
- Displaying Markdown-converted HTML
- Rendering AI-generated content
- Storing HTML in database

**Security:**
- Removes `<script>` tags and event handlers
- Blocks `javascript:` and `data:` URLs in links/scripts
- Removes `<iframe>`, `<object>`, `<embed>` tags
- Allows safe formatting tags (p, strong, em, code, etc.)

**Example:**
```typescript
import { sanitizeHTML } from '@/utils/sanitize'

const userInput = '<p>Hello</p><script>alert("XSS")</script>'
const safe = sanitizeHTML(userInput)
// Result: '<p>Hello</p>'

// Render safely
<div dangerouslySetInnerHTML={{ __html: safe }} />
```

**Allowed Tags:**
- Text formatting: `p`, `br`, `strong`, `em`, `u`, `s`, `code`, `pre`
- Headings: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
- Lists: `ul`, `ol`, `li`
- Quotes: `blockquote`
- Links/Images: `a`, `img`
- Tables: `table`, `thead`, `tbody`, `tr`, `th`, `td`
- Containers: `span`, `div`

**Allowed Attributes:**
- Links: `href`, `target`, `rel`
- Images: `src`, `alt`, `title`
- Styling: `class`, `style`
- Data attributes: `data-*` (for app-specific metadata)

**Blocked:**
- Event handlers: `onclick`, `onerror`, `onload`, `onmouseover`
- Dangerous protocols: `javascript:`, `vbscript:`, `data:` (in scripts)
- Embedding: `<iframe>`, `<object>`, `<embed>`

---

### `sanitizeText(text: string): string`

**Purpose:** Escape HTML entities for plain text rendering

**Use When:**
- Displaying user input as plain text
- Preventing HTML injection in text fields
- Converting unsafe input to safe display text

**Security:**
- Escapes all HTML special characters
- Prevents tag injection
- Safe for insertion into HTML without wrapper

**Example:**
```typescript
import { sanitizeText } from '@/utils/sanitize'

const userInput = '<script>alert("XSS")</script>'
const safe = sanitizeText(userInput)
// Result: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'

// Render safely (displays as plain text)
<span>{safe}</span>
```

**Escapes:**
- `&` → `&amp;`
- `<` → `&lt;`
- `>` → `&gt;`
- `"` → `&quot;`
- `'` → `&#x27;`

---

### `sanitizeURL(url: string): string`

**Purpose:** Validate and sanitize URLs for safe use in links/images

**Use When:**
- User-provided URLs in links (`<a href>`)
- User-provided image sources (`<img src>`)
- Redirect URLs
- External resource URLs

**Security:**
- Validates URL format
- Blocks dangerous protocols
- Returns empty string for invalid/unsafe URLs

**Example:**
```typescript
import { sanitizeURL } from '@/utils/sanitize'

const userInput = 'javascript:alert("XSS")'
const safe = sanitizeURL(userInput)
// Result: '' (blocked)

const validInput = 'https://example.com/page'
const safePath = sanitizeURL(validInput)
// Result: 'https://example.com/page'

// Use safely
<a href={safe || '#'}>Link</a>
```

**Allowed Protocols:**
- `https:` - Secure HTTP
- `http:` - HTTP (warn users about insecurity)
- `mailto:` - Email links

**Blocked Protocols:**
- `javascript:` - Script execution
- `data:` - Data URLs (can contain scripts)
- `file:` - Local file access
- `ftp:` - FTP protocol
- `vbscript:` - VBScript execution

---

### `stripHTML(html: string): string`

**Purpose:** Remove HTML tags to extract plain text content

**Use When:**
- Creating search indices
- Generating plain text previews
- Extracting text for character counting
- Creating notifications/summaries

**Note:** For security-critical uses, prefer `sanitizeHTML()`. `stripHTML()` is for text extraction, not security.

**Example:**
```typescript
import { stripHTML } from '@/utils/sanitize'

const html = '<p>Hello <strong>world</strong></p>'
const text = stripHTML(html)
// Result: 'Hello world' (tags removed, text preserved)

// Use for text-only operations
const wordCount = text.split(' ').length
```

---

## When to Use Each Function

### Decision Tree

```
User-generated content?
  ├─ Needs HTML formatting? → sanitizeHTML()
  ├─ Plain text only? → sanitizeText()
  ├─ URL/link? → sanitizeURL()
  └─ Extract text from HTML? → stripHTML()
```

### Common Scenarios

| Scenario | Function | Why |
|----------|----------|-----|
| AI chat response (with Markdown) | `sanitizeHTML()` | Preserves formatting, blocks XSS |
| Note content (user-entered HTML) | `sanitizeHTML()` | Safe HTML rendering |
| User profile name | `sanitizeText()` | Prevents HTML injection |
| Search results preview | `stripHTML()` | Extract text without tags |
| WikiLink URL validation | `sanitizeURL()` | Blocks dangerous protocols |
| Image src from user | `sanitizeURL()` | Validates image URLs |
| Plain text notification | `sanitizeText()` | Safe text display |

---

## Implementation Examples

### AI Chat Panel (Markdown Rendering)

```typescript
import ReactMarkdown from 'react-markdown'
import { sanitizeHTML } from '@/utils/sanitize'

function ChatMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        // Sanitize HTML nodes
        div: ({ node, ...props }) => {
          const html = sanitizeHTML(props.children as string)
          return <div dangerouslySetInnerHTML={{ __html: html }} />
        }
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
```

### User Input Form

```typescript
import { sanitizeText } from '@/utils/sanitize'

function ProjectNameInput({ value, onChange }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sanitize on input
    const safe = sanitizeText(e.target.value)
    onChange(safe)
  }

  return <input value={value} onChange={handleChange} />
}
```

### External Link Component

```typescript
import { sanitizeURL } from '@/utils/sanitize'

function ExternalLink({ href, children }: Props) {
  const safeHref = sanitizeURL(href)

  if (!safeHref) {
    // Invalid URL - render as plain text
    return <span>{children}</span>
  }

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  )
}
```

### Search Index Builder

```typescript
import { stripHTML } from '@/utils/sanitize'

function indexNote(note: Note): SearchIndex {
  // Extract plain text for search
  const plainText = stripHTML(note.content)

  return {
    id: note.id,
    title: note.title,
    content: plainText,
    wordCount: plainText.split(' ').length
  }
}
```

---

## Defense in Depth

### Multiple Layers of Protection

1. **Input Sanitization** - Clean data on entry
2. **Storage Sanitization** - Clean data before database
3. **Output Sanitization** - Clean data before rendering
4. **CSP Headers** - Block inline scripts (see SECURITY_CSP.md)

### Best Practices

**Always Sanitize Before:**
- Storing in database
- Rendering with `dangerouslySetInnerHTML`
- Inserting into DOM
- Using in URLs or links

**Never Trust:**
- User input
- External API responses
- AI-generated content
- URL parameters

**Prefer:**
- React's built-in escaping over `dangerouslySetInnerHTML`
- Text rendering over HTML rendering when possible
- Whitelist approach (allow known-safe tags) over blacklist

---

## Testing

### Test Coverage

```bash
npm run test -- sanitize.test.ts
```

**Coverage:** 60 passing tests
- 23 tests for `sanitizeHTML()`
- 10 tests for `sanitizeText()`
- 13 tests for `sanitizeURL()`
- 10 tests for `stripHTML()`
- 4 integration tests

### Test Categories

1. **XSS Prevention**
   - Script tag removal
   - Event handler blocking
   - Protocol validation

2. **Safe HTML Preservation**
   - Formatting tags
   - Links and images
   - Tables and lists

3. **Edge Cases**
   - Empty/null input
   - Malformed HTML
   - Nested XSS attempts

4. **Integration Tests**
   - Combined sanitizers
   - Defense in depth

---

## DOMPurify Configuration

### Current Settings

```typescript
DOMPurify.sanitize(dirty, {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'span', 'div'
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel',
    'src', 'alt', 'title',
    'class', 'style',
    'data-type', 'data-title', 'data-tag-name', 'data-tag-color'
  ],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  ALLOW_DATA_ATTR: true,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false
})
```

### Why These Settings?

- **Whitelist Approach** - Only allow known-safe tags
- **Data Attributes** - For app-specific metadata (WikiLinks, tags)
- **No Unknown Protocols** - Blocks file:, ftp:, etc.
- **String Return** - Easier to work with in React
- **Explicit Forbid** - Double protection for dangerous attributes

---

## Common Vulnerabilities Prevented

### XSS via Script Tags

```typescript
// Attack
const attack = '<img src=x onerror="alert(\'XSS\')">'

// Protected
sanitizeHTML(attack)
// Result: '<img src="x">' (onerror removed)
```

### XSS via JavaScript Protocol

```typescript
// Attack
const attack = '<a href="javascript:alert(\'XSS\')">Click</a>'

// Protected
sanitizeHTML(attack)
// Result: '<a>Click</a>' (href removed)
```

### XSS via Event Handlers

```typescript
// Attack
const attack = '<div onclick="alert(\'XSS\')">Hover</div>'

// Protected
sanitizeHTML(attack)
// Result: '<div>Hover</div>' (onclick removed)
```

### HTML Injection in Plain Text

```typescript
// Attack
const attack = '<script>alert("XSS")</script>'

// Protected
sanitizeText(attack)
// Result: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
// Displays as plain text: <script>alert("XSS")</script>
```

---

## Limitations

### What Sanitization Does NOT Prevent

1. **SQL Injection** - Use parameterized queries instead
2. **CSRF Attacks** - Use CSRF tokens instead
3. **Authentication Bypass** - Use proper auth checks
4. **Authorization Bypass** - Use proper access control
5. **Server-Side Attacks** - Validate on server too

### When Sanitization is Not Enough

- **API Endpoints** - Also validate on server
- **Database Queries** - Use parameterized queries
- **File Uploads** - Validate file types and content
- **Authentication** - Use secure session management

---

## Performance

### Benchmarks

- `sanitizeHTML()` - ~1-2ms for typical note content
- `sanitizeText()` - ~0.1ms (simple regex)
- `sanitizeURL()` - ~0.2ms (URL parsing)
- `stripHTML()` - ~0.5ms (DOMPurify with no tags)

**Impact:** Negligible for user-facing operations. Safe to use in real-time rendering.

---

## Updates and Maintenance

### Updating DOMPurify

```bash
# Check for updates
npm outdated dompurify

# Update to latest
npm update dompurify @types/dompurify

# Run tests
npm run test -- sanitize.test.ts
```

### Security Advisories

- Monitor: [DOMPurify Releases](https://github.com/cure53/DOMPurify/releases)
- Subscribe: [npm Security Advisories](https://npmjs.com/package/dompurify)

---

## Resources

- [DOMPurify GitHub](https://github.com/cure53/DOMPurify)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [MDN: Sanitizing HTML](https://developer.mozilla.org/en-US/docs/Web/API/Sanitizer_API)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)

---

**Last Updated:** 2026-01-10 (Sprint 34 Phase 5)
**Test Coverage:** 100% (60/60 tests passing)
**DOMPurify Version:** 3.3.1
**Maintained By:** Security & Development Team
