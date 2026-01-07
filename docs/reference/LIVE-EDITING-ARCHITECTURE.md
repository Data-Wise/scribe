# Live Editing Architecture Reference Card

> **Scribe's Obsidian-Style Live Preview System**
> Complete technical reference for the three-mode editor

**Version:** 1.12.0
**Last Updated:** 2026-01-06
**Sprint:** 28-30 (v1.10.0 → v1.12.0)

---

## 🎯 Overview

Scribe's live editing system provides three editor modes with seamless transitions:

| Mode | Technology | Purpose | Shortcut |
|------|------------|---------|----------|
| **Source** | `<textarea>` | Raw markdown editing | ⌘1 |
| **Live Preview** | CodeMirror 6 | Obsidian-style WYSIWYG | ⌘2 |
| **Reading** | ReactMarkdown | Fully rendered, read-only | ⌘3 |

**Cycle modes:** ⌘E
**Exit Reading mode:** Escape

---

## 📐 Architecture

### Component Hierarchy

```
HybridEditor.tsx (875 lines)
├── Source Mode: <textarea>
│   ├── Wiki-link autocomplete [[...]]
│   ├── Tag autocomplete #...
│   └── Citation autocomplete @...
│
├── Live Preview: CodeMirrorEditor (598 lines)
│   ├── RichMarkdownPlugin (syntax hiding)
│   ├── MathWidget (KaTeX rendering)
│   ├── BulletWidget (• for list markers)
│   └── HiddenWidget (invisible syntax)
│
└── Reading Mode: ReactMarkdown
    ├── Custom renderers (h1-h6, p, ul, ol, code, blockquote)
    ├── Wiki-link handling
    ├── Tag rendering
    └── Callout support (11 types)
```

### Data Flow

```
User Types
    ↓
Local State (localContent)  ← Race condition fix
    ↓
onChange(text)
    ↓
Parent Store (Zustand)
    ↓
Database (SQLite/IndexedDB)
```

**Critical Pattern:** Local state prevents character loss during rapid typing.

---

## 🔧 Core Components

### 1. CodeMirrorEditor.tsx (598 lines)

**Purpose:** Live Preview mode with Obsidian-style syntax hiding

**Key Classes:**

#### RichMarkdownPlugin
```typescript
class RichMarkdownPlugin {
  computeDecorations(view: EditorView): DecorationSet {
    // Element-based detection: hide syntax when cursor is elsewhere
    // Line-based detection: show syntax on cursor's line
  }
}
```

**What it hides:**
- Header marks (`#`, `##`, `###`)
- Emphasis marks (`*`, `_`, `**`, `__`)
- Code marks (`` ` ``)
- List markers (`-`, `*`, `+`) → replaced with `•`
- Link marks (`[`, `]`, `(`, `)`)
- Strikethrough marks (`~~`)
- Quote marks (`>`)

**Cursor-aware reveal:**
- **Formatted elements** (bold, italic, code, links): Show syntax when cursor is inside element
- **Headings**: Show syntax when cursor is on same line
- **Lists**: Show syntax when cursor is on same line
- **Math**: Show syntax when cursor is inside expression

#### MathWidget
```typescript
class MathWidget extends WidgetType {
  constructor(formula: string, displayMode: boolean) { /* ... */ }

  toDOM() {
    // Renders LaTeX using KaTeX
    katex.render(this.formula, span, {
      displayMode: this.displayMode,
      throwOnError: false,
      output: 'html'
    })
  }
}
```

**Math support:**
- Inline: `$E=mc^2$`
- Display: `$$\int_0^1 x^2 dx$$`
- Single-line only (multi-line needs StateField)

**Theme Integration:**
```typescript
function createEditorTheme() {
  const colors = getThemeColors() // Runtime CSS variable reading
  return EditorView.theme({ /* ... */ })
}
```

### 2. HybridEditor.tsx (875 lines)

**Purpose:** Mode orchestration, autocomplete, and rendering

**State Management:**
```typescript
// LOCAL STATE FIX: Prevents race condition during rapid typing
const [localContent, setLocalContent] = useState(content)
const isTypingRef = useRef(false)

// Sync from props only when NOT typing
useEffect(() => {
  if (!isTypingRef.current) {
    setLocalContent(content)
  }
}, [content])
```

**Autocomplete System:**
- **Wiki-links:** `[[` trigger → note search → `[[Title]]`
- **Tags:** `#` trigger → tag search → `#tag-name`
- **Citations:** `@` trigger → BibTeX search → `@citekey`

**Callout Support:**
```typescript
const CALLOUT_TYPES: Record<string, { color, bgColor, icon, aliases }> = {
  note: { color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)', icon: '📝' },
  tip: { color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)', icon: '💡',
         aliases: ['hint', 'important'] },
  // ... 9 more types
}
```

**Syntax:**
```markdown
> [!note]
> This is a note callout

> [!warning]
> This is a warning callout
```

### 3. Reading Mode Renderer

**ReactMarkdown with custom components:**

```typescript
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeRaw]}
  components={{
    h1: ({ children }) => <h1 className="text-3xl font-bold mb-4 mt-6">{children}</h1>,
    a: (props) => /* Wiki-link detection and handling */,
    code: ({ children }) => /* Tag detection and rendering */,
    blockquote: ({ children }) => /* Callout detection and styling */,
    // ... more custom renderers
  }}
>
  {processedContent}
</ReactMarkdown>
```

**Wiki-link processing:**
```typescript
content.replace(
  /\[\[([^\]]+)\]\]/g,
  (_, title) => `[${title}](https://wikilink.internal/${encodeURIComponent(title)})`
)
```

---

## 🎨 Styling System

### CSS Architecture

**Location:** `src/renderer/src/index.css`

**CodeMirror classes:**
```css
.cm-editor { /* Base editor container */ }
.cm-content { /* Content area */ }
.cm-line { /* Individual lines */ }
.cm-hidden-syntax { display: none; } /* Hidden markdown syntax */
.cm-bullet { /* Bullet points (•) */ }
.cm-heading1 { font-size: 2em; }
.cm-strong { font-weight: 700; }
.cm-emphasis { font-style: italic; }
.cm-strikethrough { text-decoration: line-through; }
.cm-monospace { /* Inline code */ }
.cm-link { color: var(--nexus-accent); }
.cm-blockquote-line { border-left: 3px solid; }
.cm-callout-note { border-left: 4px solid #3B82F6; }
.cm-math-inline { padding: 0 2px; }
.cm-math-display { display: block; text-align: center; }
.cm-math-error { color: var(--nexus-error); }
```

**Theme Colors (CSS Variables):**
```css
--nexus-bg-primary: #0d1210
--nexus-bg-secondary: #141e1a
--nexus-bg-tertiary: #1c2922
--nexus-text-primary: #d4e4dc
--nexus-text-secondary: #94a3b8
--nexus-text-muted: #8fa89b
--nexus-accent: #4ade80
--nexus-error: #ef4444
```

**Runtime theme reading:**
```typescript
function getThemeColors() {
  const styles = getComputedStyle(document.documentElement)
  return {
    bgPrimary: styles.getPropertyValue('--nexus-bg-primary').trim(),
    // ... more colors
  }
}
```

### Syntax Highlighting

**Custom HighlightStyle:**
```typescript
const markdownHighlighting = HighlightStyle.define([
  { tag: tags.strikethrough, class: 'cm-strikethrough' },
  { tag: tags.strong, class: 'cm-strong' },
  { tag: tags.emphasis, class: 'cm-emphasis' },
  { tag: tags.heading1, class: 'cm-heading cm-heading1' },
  // ... more tags
])
```

**Applied even when syntax is visible** (e.g., when cursor is inside element).

---

## 🧪 Test Coverage

### Unit Tests (Vitest)
- **Total:** 930 tests across 34 files
- **Editor-specific:** ~50 tests
- **Coverage:** Component rendering, state management, autocomplete

### E2E Tests (Playwright)
- **Total:** 48 tests
- **Editor modes:** 36 tests (EDM-01 to EDM-36)
  - Mode display & indicators (5 tests)
  - Mode switching - UI buttons (3 tests)
  - Mode switching - keyboard shortcuts (4 tests)
  - Content rendering - Source mode (3 tests)
  - Content rendering - Live Preview (7 tests)
  - Content rendering - Reading mode (6 tests)
  - Markdown syntax - Live Preview (8 tests)

**Test file:** `e2e/specs/editor-modes.spec.ts` (667 lines)

**Example test:**
```typescript
test('EDM-16: Live Preview hides bold syntax (**text**)', async ({ basePage }) => {
  await liveBtn.click()
  await textarea.fill('This is **bold** text')

  // Verify CodeMirror rendered the content
  const codemirror = basePage.page.locator('.cm-content')
  await expect(codemirror).toContainText('This is bold text')

  // Verify no visible ** marks in rendered view
  const renderedText = await codemirror.textContent()
  expect(renderedText).not.toContain('**')
})
```

---

## 📦 Dependencies

### CodeMirror 6 Ecosystem
```json
{
  "@codemirror/lang-markdown": "^6.5.0",
  "@codemirror/language-data": "^6.5.2",
  "@codemirror/state": "^6.5.3",
  "@codemirror/view": "^6.39.8",
  "@uiw/react-codemirror": "^4.25.4"
}
```

### Math Rendering
```json
{
  "katex": "^0.16.27",
  "@types/katex": "^0.16.7"
}
```

### Markdown Rendering
```json
{
  "react-markdown": "^10.1.0",
  "remark-gfm": "^4.0.1",
  "remark-math": "^6.0.0",
  "rehype-katex": "^7.0.1",
  "rehype-raw": "^7.0.0"
}
```

### Markdown Extensions
```typescript
import { Strikethrough } from '@lezer/markdown'

markdown({
  codeLanguages: languages,
  extensions: [Strikethrough]  // Enable GFM strikethrough (~~text~~)
})
```

---

## 🔑 Key Patterns

### 1. Element-Based Cursor Detection

```typescript
// Hide syntax when cursor is OUTSIDE element
if (formattedElements.includes(node.name)) {
  const cursorInElement = cursor.from >= node.from && cursor.to <= node.to
  if (cursorInElement) {
    return false // Don't process children - syntax stays visible
  }
}
```

### 2. Line-Based Cursor Detection

```typescript
// Hide syntax when cursor is on DIFFERENT line
if (node.name.startsWith('ATXHeading')) {
  const cursorLine = doc.lineAt(cursor.head).number
  const nodeLine = doc.lineAt(node.from).number
  if (cursorLine === nodeLine) {
    return false // Don't hide header marks when editing heading
  }
}
```

### 3. Decoration Replacement

```typescript
// Replace list markers with bullet widget
widgets.push(
  Decoration.replace({ widget: bulletWidget }).range(node.from, node.to)
)

// Replace math with KaTeX widget
widgets.push(
  Decoration.replace({
    widget: new MathWidget(formula, displayMode)
  }).range(matchFrom, matchTo)
)
```

### 4. Regex-Based Math Detection

```typescript
// Display math: $$...$$
const displayMathRegex = /\$\$([^$]+)\$\$/g

// Inline math: $...$
// Negative lookbehind/ahead to avoid matching $$
const inlineMathRegex = /(?<!\$)\$([^$\n]+)\$(?!\$)/g
```

**Limitation:** Multi-line math requires StateField (not ViewPlugin).

### 5. Local State for Race Condition Fix

```typescript
// Problem: Rapid typing → React re-render delay → lost characters
// Solution: Local state with controlled sync

const [localContent, setLocalContent] = useState(content)
const isTypingRef = useRef(false)

const handleInput = useCallback((e) => {
  isTypingRef.current = true
  setLocalContent(e.target.value)  // Immediate UI update
  onChange(e.target.value)          // Propagate to parent

  setTimeout(() => {
    isTypingRef.current = false     // Allow prop sync after typing
  }, 150)
}, [onChange])
```

---

## 🚀 Performance

### Bundle Size
- **CodeMirror 6:** ~720 KB (gzipped)
- **KaTeX:** ~60 font files + 200 KB JS
- **Total editor bundle:** ~2.36 MB uncompressed

### Rendering Performance
- **Source mode:** Instant (plain textarea)
- **Live Preview:** Real-time with CodeMirror optimizations
- **Reading mode:** ReactMarkdown with memoization
- **No lag during typing** (race condition fixed)

### Build Configuration

**Vite PWA:**
```typescript
// vite.config.ts
VitePWA({
  workbox: {
    maximumFileSizeToCacheInBytes: 3 * 1024 * 1024 // 3MB for CodeMirror
  }
})
```

---

## 📋 Feature Checklist

### ✅ Implemented (v1.10.0 - v1.12.0)

**Three Editor Modes:**
- [x] Source mode (raw markdown)
- [x] Live Preview mode (CodeMirror 6)
- [x] Reading mode (ReactMarkdown)
- [x] Mode switching UI (pill toggle)
- [x] Keyboard shortcuts (⌘1, ⌘2, ⌘3, ⌘E)
- [x] Mode indicator in status bar

**Live Preview Features:**
- [x] Obsidian-style syntax hiding
- [x] Element-based cursor detection
- [x] Line-based cursor detection
- [x] Header rendering (h1-h6 with sizes)
- [x] Bold rendering (`**text**`, `__text__`)
- [x] Italic rendering (`*text*`, `_text_`)
- [x] Strikethrough rendering (`~~text~~`)
- [x] Code rendering (`` `code` ``)
- [x] Link rendering (`[text](url)`)
- [x] List rendering (bullets replace `-`, `*`)
- [x] Blockquote rendering (`>`)
- [x] Callout rendering (11 types)

**Math Rendering:**
- [x] Inline math (`$...$`)
- [x] Display math (`$$...$$`) - single line
- [x] KaTeX integration
- [x] Error handling (invalid LaTeX)
- [x] Click-to-edit (cursor reveals syntax)

**Autocomplete:**
- [x] Wiki-link autocomplete (`[[...]]`)
- [x] Tag autocomplete (`#...`)
- [x] Citation autocomplete (`@...`)

**Theming:**
- [x] Runtime CSS variable reading
- [x] Theme-aware editor colors
- [x] Custom theme support
- [x] Dark/light mode compatibility

**Testing:**
- [x] 930 unit tests (Vitest)
- [x] 48 E2E tests (Playwright)
- [x] 36 editor mode tests
- [x] TypeScript: 0 errors

### ⏳ Partially Implemented

**Math Rendering:**
- [ ] Multi-line display math (requires StateField)
- [ ] Math macros/templates
- [ ] Math autocomplete

**Live Preview:**
- [ ] Table rendering
- [ ] Image rendering
- [ ] Footnote rendering
- [ ] Task list checkboxes (`- [ ]`, `- [x]`)

### 🔮 Not Yet Implemented

**Advanced Editing:**
- [ ] Inline suggestions (AI-powered)
- [ ] Real-time collaboration
- [ ] Vim mode in Live Preview
- [ ] Custom syntax highlighting themes

**Advanced Math:**
- [ ] MathJax fallback for complex LaTeX
- [ ] Chemistry notation (mhchem)
- [ ] Physics notation
- [ ] Diagram support (TikZ)

**Advanced Features:**
- [ ] Code block syntax highlighting
- [ ] Embedded iframes
- [ ] Transclusion
- [ ] Canvas/drawing

---

## 🐛 Known Issues

### PWA Service Worker Cache Limit
**Issue:** Main bundle (2.38 MB) exceeded default 2 MB precache limit
**Fix:** Increased `maximumFileSizeToCacheInBytes` to 3 MB
**Status:** ✅ Resolved in v1.10.0

### Multi-line Math
**Issue:** `$$...$$` across multiple lines throws CodeMirror error
**Cause:** ViewPlugin can't replace line breaks
**Solution:** Use StateField instead of ViewPlugin
**Status:** ⏳ Deferred to v2.0

### E2E Test Browser Backlinks
**Issue:** 7 of 8 browser backlinks tests skipped
**Cause:** Title mismatch in test expectations
**Fix:** Update test expectations to match actual implementation
**Status:** 🔴 Known bug (documented in `BUG-REPORT-E2E-TITLE-MISMATCH.md`)

---

## 📚 Related Documentation

| Document | Purpose |
|----------|---------|
| `SPRINT-22-EDITOR-MODES.md` | Initial planning for mode switching |
| `RELEASE-SUMMARY-v1.10.0.md` | Complete v1.10.0 feature documentation |
| `LIVE-LATEX-RENDERING-RESEARCH.md` | Research on LaTeX implementation approaches |
| `e2e/specs/editor-modes.spec.ts` | E2E test suite (667 lines) |
| `CLAUDE.md` | Project overview and sprint history |

---

## 🔗 Quick Links

- **CodeMirror 6 Docs:** https://codemirror.net/docs/
- **KaTeX Docs:** https://katex.org/docs/api.html
- **ReactMarkdown Docs:** https://remarkjs.github.io/react-markdown/
- **Obsidian Live Preview:** (Proprietary, studied for UX patterns)

---

**Last Updated:** 2026-01-06
**Maintainer:** Data-Wise
**License:** MIT
