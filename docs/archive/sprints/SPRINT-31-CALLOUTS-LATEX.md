# Sprint 31: Callouts & Advanced LaTeX

> **Priority:** Callout boxes in Reading mode + Multi-line math + LaTeX enhancements

**Version:** v1.13.0
**Status:** Planning
**Effort:** 3-4 days
**Started:** TBD

---

## 🎯 Goals

### Primary (P0)
1. **Callout Boxes in Reading Mode** - Render type-specific boxes with icons and colors
2. **Multi-line Math** - Refactor to StateField for `$$...$$` across multiple lines
3. **Math Error Handling** - Better error messages and recovery

### Secondary (P1)
4. **LaTeX Autocomplete** - Common symbols and environments
5. **Math Macros** - User-defined shortcuts
6. **Math Templates** - Quick insertion of common patterns

---

## 📊 Current State

### What Works ✅
- **Live Preview callouts**: Colored borders and backgrounds (11 types)
- **Single-line math**: `$...$` inline and `$$...$$` display
- **Callout detection**: Parser recognizes `> [!type]` syntax
- **Callout config**: Colors, icons, and aliases defined

### What's Broken ❌
- **Reading mode callouts**: Uses generic `<blockquote>` with border only
- **No callout icon** in Reading mode
- **No callout title** rendering
- **No type-specific background colors**

### What's Missing ⚠️
- **Multi-line math**: Throws error "can't replace line breaks"
- **Math autocomplete**: No `\alpha`, `\beta`, etc. suggestions
- **Math templates**: No quick insert for matrices, fractions, etc.
- **LaTeX error feedback**: Generic "parse error" only

---

## 🔧 Implementation Plan

### Phase 1: Callout Boxes in Reading Mode (1 day)

**Goal:** Render beautiful callout boxes with icons, titles, and colors

**Current Reading Mode Rendering:**
```typescript
// src/renderer/src/components/HybridEditor.tsx:750
blockquote: ({ children }) => (
  <blockquote
    className="border-l-4 pl-4 italic my-4"
    style={{
      borderColor: 'var(--nexus-bg-tertiary)',
      color: 'var(--nexus-text-muted)'
    }}
  >
    {children}
  </blockquote>
)
```

**Problem:** Doesn't detect callout type or render differently.

**New Rendering:**
```typescript
blockquote: ({ children }) => {
  // Extract callout type from first paragraph
  const firstChild = React.Children.toArray(children)[0]
  const text = extractText(firstChild)
  const calloutMatch = text?.match(/^\[!(\w+)\](.*)/)

  if (calloutMatch) {
    const type = calloutMatch[1].toLowerCase()
    const title = calloutMatch[2].trim() || capitalizeFirst(type)
    const config = getCalloutConfig(type)

    // Remove [!type] line from children
    const remainingChildren = filterCalloutHeader(children)

    return (
      <div
        className="callout-box rounded-lg p-4 my-4"
        style={{
          borderLeft: `4px solid ${config.color}`,
          backgroundColor: config.bgColor
        }}
      >
        <div className="callout-header flex items-center gap-2 mb-2">
          <span className="callout-icon text-xl">{config.icon}</span>
          <span
            className="callout-title font-semibold"
            style={{ color: config.color }}
          >
            {title}
          </span>
        </div>
        <div className="callout-content">
          {remainingChildren}
        </div>
      </div>
    )
  }

  // Regular blockquote
  return (
    <blockquote className="border-l-4 pl-4 italic my-4">
      {children}
    </blockquote>
  )
}
```

**Helper Functions:**
```typescript
function extractText(element: ReactNode): string | null {
  if (typeof element === 'string') return element
  if (React.isValidElement(element)) {
    return extractText(element.props.children)
  }
  if (Array.isArray(element)) {
    return element.map(extractText).join('')
  }
  return null
}

function filterCalloutHeader(children: ReactNode): ReactNode {
  const childArray = React.Children.toArray(children)
  if (childArray.length === 0) return children

  // Remove first paragraph if it contains [!type]
  const first = childArray[0]
  if (React.isValidElement(first)) {
    const text = extractText(first)
    if (text?.match(/^\[!\w+\]/)) {
      return childArray.slice(1)
    }
  }

  return children
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
```

**CSS:**
```css
/* src/renderer/src/index.css */
.callout-box {
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
}

.callout-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.callout-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.callout-title {
  font-weight: 600;
  font-size: 0.95rem;
  text-transform: capitalize;
}

.callout-content {
  font-style: normal;
}

.callout-content p:last-child {
  margin-bottom: 0;
}
```

**Testing:**
```markdown
> [!note]
> This is a note callout

> [!warning] Custom Title
> This is a warning with custom title

> [!tip]
> This is a tip
> With multiple lines
```

**Expected Output:**
```
┌─────────────────────────────────────┐
│ 📝 Note                             │ (blue border)
│ This is a note callout              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ⚠️ Custom Title                      │ (orange border)
│ This is a warning with custom title │
└─────────────────────────────────────┘
```

**Tasks:**
- [ ] Implement `extractText()` helper
- [ ] Implement `filterCalloutHeader()` helper
- [ ] Update blockquote renderer with callout detection
- [ ] Add CSS for callout boxes
- [ ] Test with all 11 callout types
- [ ] Add E2E tests (5-10 tests)

---

### Phase 2: Multi-line Math (1-2 days)

**Goal:** Support `$$...$$` across multiple lines

**Current Limitation:**
```typescript
// CodeMirrorEditor.tsx:253-273 (ViewPlugin)
// Display math: $$...$$
const displayMathRegex = /\$\$([^$]+)\$\$/g

// Skip if contains newlines (multi-line needs StateField)
if (formula.includes('\n')) continue
```

**Problem:** ViewPlugin can't replace decorations across line breaks.

**Solution:** Create StateField for block math

**New File:** `src/renderer/src/components/CodeMirrorMathField.ts`

```typescript
import { StateField, EditorState, Range } from '@codemirror/state'
import { Decoration, DecorationSet, EditorView } from '@codemirror/view'
import { MathWidget } from './CodeMirrorEditor'

/**
 * StateField for multi-line display math
 *
 * Unlike ViewPlugin, StateField can create decorations that span line breaks.
 * This is required for display math ($$...$$) that spans multiple lines.
 */
export const blockMathField = StateField.define<DecorationSet>({
  create(state) {
    return computeBlockMath(state)
  },

  update(decos, tr) {
    // Only recompute if document changed
    if (!tr.docChanged) {
      return decos.map(tr.changes)
    }
    return computeBlockMath(tr.state)
  },

  provide: f => EditorView.decorations.from(f)
})

function computeBlockMath(state: EditorState): DecorationSet {
  const widgets: Range<Decoration>[] = []
  const doc = state.doc
  const cursor = state.selection.main
  const text = doc.toString()

  // Match $$...$$ across multiple lines
  // Use 's' flag to make . match newlines
  const regex = /\$\$([^$]+)\$\$/gs
  let match

  while ((match = regex.exec(text)) !== null) {
    const from = match.index
    const to = from + match[0].length
    const formula = match[1].trim()

    // Skip if cursor is inside this math block
    if (cursor.from >= from && cursor.to <= to) {
      continue
    }

    // Create replacement decoration with MathWidget
    widgets.push(
      Decoration.replace({
        widget: new MathWidget(formula, true) // displayMode = true
      }).range(from, to)
    )
  }

  // Sort by position (required by DecorationSet)
  widgets.sort((a, b) => a.from - b.from)

  return Decoration.set(widgets)
}
```

**Update CodeMirrorEditor.tsx:**

```typescript
// Remove display math from ViewPlugin (lines 253-273)
// Keep only inline math in RichMarkdownPlugin

// Import blockMathField
import { blockMathField } from './CodeMirrorMathField'

// Add to extensions array
const extensions = [
  markdown({ /* ... */ }),
  syntaxHighlighting(markdownHighlighting),
  richMarkdownPlugin,
  blockMathField,  // NEW: Multi-line math support
  EditorView.lineWrapping,
  // ...
]
```

**Testing:**
```markdown
$$
\begin{align}
x &= a + b \\
y &= c + d
\end{align}
$$

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

**Tasks:**
- [ ] Create `CodeMirrorMathField.ts`
- [ ] Implement `computeBlockMath()`
- [ ] Export `MathWidget` from `CodeMirrorEditor.tsx`
- [ ] Remove display math from `RichMarkdownPlugin`
- [ ] Add `blockMathField` to extensions
- [ ] Test multi-line equations
- [ ] Add E2E tests (3-5 tests)

---

### Phase 3: LaTeX Autocomplete (1 day)

**Goal:** Autocomplete common LaTeX symbols and environments

**Trigger:** Type `\` inside math mode

**Common Symbols:**
```typescript
const LATEX_SYMBOLS = {
  // Greek letters
  'alpha': 'α',
  'beta': 'β',
  'gamma': 'γ',
  'delta': 'δ',
  'epsilon': 'ε',
  'theta': 'θ',
  'lambda': 'λ',
  'mu': 'μ',
  'pi': 'π',
  'sigma': 'σ',
  'phi': 'φ',
  'omega': 'ω',

  // Math operators
  'sum': '∑',
  'prod': '∏',
  'int': '∫',
  'infty': '∞',
  'partial': '∂',
  'nabla': '∇',

  // Relations
  'leq': '≤',
  'geq': '≥',
  'neq': '≠',
  'approx': '≈',
  'equiv': '≡',
  'in': '∈',
  'subset': '⊂',

  // Arrows
  'rightarrow': '→',
  'leftarrow': '←',
  'Rightarrow': '⇒',
  'Leftarrow': '⇐',
}
```

**Autocomplete Component:**

```typescript
// src/renderer/src/components/LatexAutocomplete.tsx
interface LatexAutocompleteProps {
  query: string
  position: { top: number; left: number }
  onSelect: (latex: string) => void
  onClose: () => void
}

export function LatexAutocomplete({
  query,
  position,
  onSelect,
  onClose
}: LatexAutocompleteProps) {
  const matches = Object.entries(LATEX_SYMBOLS)
    .filter(([cmd]) => cmd.startsWith(query.toLowerCase()))
    .slice(0, 10)

  if (matches.length === 0) return null

  return (
    <div
      className="latex-autocomplete"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 1000
      }}
    >
      {matches.map(([cmd, symbol]) => (
        <button
          key={cmd}
          onClick={() => onSelect(`\\${cmd}`)}
          className="autocomplete-item"
        >
          <code>\\{cmd}</code>
          <span className="symbol">{symbol}</span>
        </button>
      ))}
    </div>
  )
}
```

**Integration in HybridEditor:**

```typescript
// Detect \ trigger inside $...$ or $$...$$
const handleInput = useCallback((e) => {
  const text = e.target.value
  const cursorPos = e.target.selectionStart
  const textBefore = text.substring(0, cursorPos)

  // Check if inside math mode
  const inMath = isInsideMath(textBefore)

  if (inMath) {
    // Check for backslash trigger
    const latexMatch = textBefore.match(/\\([a-zA-Z]*)$/)
    if (latexMatch) {
      const query = latexMatch[1]
      setLatexTrigger({ query, position: getCursorPosition() })
      return
    }
  }

  // ... existing autocomplete logic
}, [])

function isInsideMath(text: string): boolean {
  // Count $ characters before cursor
  const dollars = (text.match(/\$/g) || []).length

  // Odd number means inside math
  if (dollars % 2 === 1) return true

  // Check for $$ blocks
  const lastDoubleDollar = text.lastIndexOf('$$')
  if (lastDoubleDollar !== -1) {
    const afterDoubleDollar = text.substring(lastDoubleDollar + 2)
    const hasClosing = afterDoubleDollar.includes('$$')
    return !hasClosing
  }

  return false
}
```

**Tasks:**
- [ ] Create `LATEX_SYMBOLS` dictionary
- [ ] Create `LatexAutocomplete.tsx` component
- [ ] Implement `isInsideMath()` helper
- [ ] Add `\` trigger detection in `handleInput()`
- [ ] Style autocomplete dropdown
- [ ] Add E2E tests (3-5 tests)

---

### Phase 4: Math Templates (Optional - 1 day)

**Goal:** Quick insertion of common LaTeX patterns

**Templates:**
```typescript
const MATH_TEMPLATES = {
  'matrix': '\\begin{bmatrix}\n  a & b \\\\\n  c & d\n\\end{bmatrix}',
  'fraction': '\\frac{numerator}{denominator}',
  'integral': '\\int_{lower}^{upper} f(x) dx',
  'sum': '\\sum_{i=1}^{n} x_i',
  'limit': '\\lim_{x \\to \\infty} f(x)',
  'derivative': '\\frac{d}{dx} f(x)',
  'partial': '\\frac{\\partial f}{\\partial x}',
  'cases': '\\begin{cases}\n  condition_1 & if \\\\\n  condition_2 & otherwise\n\\end{cases}',
  'align': '\\begin{align}\n  equation_1 &= value \\\\\n  equation_2 &= value\n\\end{align}',
}
```

**UI:** Command palette entry or context menu

**Insert with placeholders:**
```typescript
function insertTemplate(template: string, cursorPos: number) {
  const text = localContent
  const newText = text.substring(0, cursorPos) + template + text.substring(cursorPos)

  setLocalContent(newText)
  onChange(newText)

  // Select first placeholder
  const placeholderMatch = template.match(/[a-z_]+/)
  if (placeholderMatch) {
    const start = cursorPos + placeholderMatch.index!
    const end = start + placeholderMatch[0].length

    // Set selection
    textareaRef.current?.setSelectionRange(start, end)
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)
- [ ] Callout type detection
- [ ] Callout config lookup (including aliases)
- [ ] Multi-line math parsing
- [ ] LaTeX symbol autocomplete filtering
- [ ] Math template insertion

**Estimated:** 20-30 new unit tests

### E2E Tests (Playwright)
- [ ] Callout rendering in Reading mode (11 types)
- [ ] Callout with custom title
- [ ] Multi-line math display
- [ ] LaTeX autocomplete trigger and selection
- [ ] Math template insertion

**Estimated:** 15-25 new E2E tests

### Visual Testing
- [ ] All 11 callout types render correctly
- [ ] Icons and colors match design
- [ ] Multi-line equations format properly
- [ ] Autocomplete dropdown positioning

---

## 📊 Success Criteria

### Phase 1: Callouts ✅
- [ ] All 11 callout types render as boxes in Reading mode
- [ ] Icons display correctly
- [ ] Custom titles work
- [ ] Colors match Live Preview
- [ ] E2E tests pass (5-10 tests)

### Phase 2: Multi-line Math ✅
- [ ] `$$...$$` works across multiple lines
- [ ] No "can't replace line breaks" errors
- [ ] Cursor inside reveals source
- [ ] KaTeX errors handled gracefully
- [ ] E2E tests pass (3-5 tests)

### Phase 3: LaTeX Autocomplete ✅
- [ ] `\` trigger works inside math
- [ ] Symbol dropdown appears
- [ ] Selection inserts correct LaTeX
- [ ] 20+ common symbols available
- [ ] E2E tests pass (3-5 tests)

### Phase 4: Math Templates ✅ (Optional)
- [ ] Templates insert with placeholders
- [ ] First placeholder auto-selected
- [ ] 8+ common templates available
- [ ] Works in both Source and Live Preview

---

## 📈 Performance Targets

- **StateField overhead:** < 5ms for 1000-line docs
- **Callout rendering:** < 100ms for 50 callouts
- **Autocomplete latency:** < 50ms from trigger
- **No regression:** All 930 unit tests still pass

---

## 🎨 Design Reference

### Callout Box (Reading Mode)

**Note:**
```
┌─────────────────────────────────────┐
│ 📝 Note                             │ ← Blue (#3B82F6)
│ ─────────────────────────────────── │
│ This is important information       │
└─────────────────────────────────────┘
```

**Warning:**
```
┌─────────────────────────────────────┐
│ ⚠️ Warning                           │ ← Orange (#F59E0B)
│ ─────────────────────────────────── │
│ Be careful with this action         │
└─────────────────────────────────────┘
```

**Tip:**
```
┌─────────────────────────────────────┐
│ 💡 Pro Tip                           │ ← Green (#10B981)
│ ─────────────────────────────────── │
│ Here's a helpful suggestion         │
└─────────────────────────────────────┘
```

### Multi-line Math

**Before (error):**
```
$$
\begin{align}
x &= a \\
y &= b
\end{align}
$$

❌ Error: Decorations that replace line breaks may not be specified via plugins
```

**After (working):**
```
$$
x = a
y = b
$$

✅ Renders as centered math block
```

---

## 🔗 Dependencies

**No new dependencies needed!**
- Callouts: Pure React component logic
- Multi-line math: CodeMirror StateField (already imported)
- Autocomplete: Reuse existing pattern from wiki-links

---

## 📋 File Checklist

### New Files
- [ ] `src/renderer/src/components/CodeMirrorMathField.ts` (100 lines)
- [ ] `src/renderer/src/components/LatexAutocomplete.tsx` (150 lines)
- [ ] `e2e/specs/callouts.spec.ts` (200 lines)
- [ ] `e2e/specs/latex.spec.ts` (150 lines)

### Modified Files
- [ ] `src/renderer/src/components/HybridEditor.tsx` (blockquote renderer)
- [ ] `src/renderer/src/components/CodeMirrorEditor.tsx` (remove single-line display math)
- [ ] `src/renderer/src/index.css` (callout box styles)
- [ ] `package.json` (version bump to 1.13.0)
- [ ] `CHANGELOG.md` (v1.13.0 entry)
- [ ] `CLAUDE.md` (Sprint 31 completion)

---

## 🚀 Release Plan

**Version:** v1.13.0
**Title:** "Callouts & Advanced LaTeX"

**Release Notes:**
```markdown
# v1.13.0 - Callouts & Advanced LaTeX

## New Features

### Beautiful Callout Boxes
- 11 callout types now render as styled boxes in Reading mode
- Icons and colors match Live Preview
- Custom titles supported (`> [!note] My Title`)

### Multi-line Math Support
- Display math ($$...$$) now works across multiple lines
- Perfect for align, matrix, and complex equations
- Click inside to edit source

### LaTeX Autocomplete
- Type `\` inside math mode for symbol suggestions
- 20+ common symbols (Greek letters, operators, arrows)
- Faster equation writing

## Improvements
- Better math error handling
- Improved callout parsing
- Performance optimizations for large documents

## Bug Fixes
- Fixed "can't replace line breaks" error
- Fixed callout rendering in Reading mode

## Testing
- +40 new tests (20 unit + 20 E2E)
- 970 total tests (950 unit + 20 E2E)
- TypeScript: 0 errors
```

---

## 📅 Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1 | 1 day | Callout boxes working |
| Phase 2 | 1-2 days | Multi-line math working |
| Phase 3 | 1 day | LaTeX autocomplete working |
| Phase 4 | 1 day (opt) | Math templates (optional) |
| Testing | 0.5 day | E2E tests passing |
| Polish | 0.5 day | Documentation, release notes |

**Total:** 3-5 days (depending on Phase 4)

---

## 🎯 Next Steps

### Immediate
1. [ ] Review and approve this spec
2. [ ] Create feature branch `feat/callouts-latex`
3. [ ] Set up git worktree
4. [ ] Start Phase 1 (callouts)

### After Sprint 31
- Sprint 32: Tables + Code highlighting
- Sprint 33: Task lists + Images
- v1.15.0: Complete editing feature set

---

**Status:** 📋 Planning - Ready for approval
**Priority:** P0 (User requested)
**Branch:** `feat/callouts-latex` (to be created)
**Worktree:** `~/.git-worktrees/scribe/callouts-latex`
