# Live LaTeX Rendering Research

> Research conducted: 2025-12-31
> Purpose: Evaluate open-source approaches for live LaTeX rendering in Scribe's Live Preview mode

---

## Executive Summary

This document analyzes how popular open-source editors implement live LaTeX math rendering. The goal is to add LaTeX support to Scribe's Obsidian-style Live Preview (CodeMirror 6).

**Recommendation**: Start with **Option B** (CodeMirror KaTeX widget) to maintain consistency with the current Live Preview implementation, then consider Milkdown's math plugin for Reading mode.

---

## Editors Analyzed

| Editor/Library | Technology | Rendering Engine | Key Pattern |
|---------------|------------|------------------|-------------|
| **Typora** | Custom | MathJax v3 → SVG | Click-to-edit WYSIWYG |
| **Obsidian** | CodeMirror 6 | KaTeX/MathJax | Live Preview mode |
| **HyperMD** | CodeMirror 5 | KaTeX/MathJax/CodeCogs | FoldMath feature |
| **Milkdown** | ProseMirror | KaTeX | Plugin-based |
| **prosemirror-math** | ProseMirror | KaTeX | NodeView rendering |

---

## Implementation Patterns

### 1. ProseMirror/Milkdown Approach (Best for WYSIWYG)

Uses custom NodeView for math nodes. Treats math as part of the document schema.

**Schema Definition:**
```typescript
// Inline Math Node
mathInline: {
  group: "inline math",
  inline: true,
  atom: true,
  content: "text*",
  parseDOM: [{ tag: "math-inline" }],
  toDOM: () => ["math-inline", 0]
}

// Display Math Node
mathDisplay: {
  group: "block math",
  atom: true,
  content: "text*",
  code: true,
  parseDOM: [{ tag: "math-display" }],
  toDOM: () => ["math-display", 0]
}
```

**NodeView Rendering:**
```typescript
class MathView implements NodeView {
  dom: HTMLElement

  constructor(node: Node) {
    this.dom = document.createElement('span')
    this.dom.className = 'math-node'
    katex.render(node.textContent, this.dom, {
      displayMode: node.type.name === 'mathDisplay',
      throwOnError: false
    })
  }
}
```

**Cursor/Editing Behavior:**
- Cursor enters math nodes directly when positioned inside
- Arrow keys and Backspace behave like regular text
- `Ctrl-Enter` exits display math blocks
- `Ctrl-Backspace` removes entire math nodes

**Pros:**
- True inline editing experience
- Treats math as text, not an atom
- Well-documented implementation

**Cons:**
- Requires schema modification
- More complex setup

**Source:** [prosemirror-math](https://github.com/benrbray/prosemirror-math)

---

### 2. CodeMirror Widget Approach (Best for Live Preview)

Uses `Decoration.replace()` with a custom KaTeX widget. This is the same pattern used for bold/italic syntax hiding.

**Widget Implementation:**
```typescript
import katex from 'katex'
import { WidgetType, Decoration, ViewPlugin, EditorView } from '@codemirror/view'

class MathWidget extends WidgetType {
  constructor(readonly formula: string, readonly displayMode: boolean = false) {
    super()
  }

  eq(other: MathWidget) {
    return other.formula === this.formula && other.displayMode === this.displayMode
  }

  toDOM() {
    const span = document.createElement('span')
    span.className = this.displayMode ? 'cm-math-display' : 'cm-math-inline'
    try {
      katex.render(this.formula, span, {
        displayMode: this.displayMode,
        throwOnError: false,
        output: 'html' // or 'mathml' for accessibility
      })
    } catch (e) {
      span.textContent = this.formula
      span.className += ' cm-math-error'
    }
    return span
  }

  ignoreEvent() { return false }
}
```

**Integration with RichMarkdownPlugin:**
```typescript
// In computeDecorations(), after checking cursor position:

// Match inline math: $...$
const inlineMathRegex = /\$([^$\n]+)\$/g
let match
while ((match = inlineMathRegex.exec(lineText)) !== null) {
  const from = lineStart + match.index
  const to = from + match[0].length

  // Skip if cursor is inside this math
  if (cursor.from >= from && cursor.to <= to) continue

  widgets.push(
    Decoration.replace({
      widget: new MathWidget(match[1], false)
    }).range(from, to)
  )
}

// Match display math: $$...$$
// Note: Multi-line requires StateField, not ViewPlugin
```

**Multi-line Math Challenge:**
CodeMirror 6 throws: "Decorations that replace line breaks may not be specified via plugins"

**Solution:** Use StateField for block math:
```typescript
const mathField = StateField.define<DecorationSet>({
  create(state) { return computeMathDecorations(state) },
  update(decos, tr) {
    if (tr.docChanged) return computeMathDecorations(tr.state)
    return decos.map(tr.changes)
  },
  provide: f => EditorView.decorations.from(f)
})
```

**Source:** [CodeMirror Decoration Example](https://codemirror.net/examples/decoration/), [codemirror-widgets](https://github.com/SamyPesse/codemirror-widgets)

---

### 3. Typora's Approach

Typora uses MathJax v3 rendering to SVG in a seamless WYSIWYG interface.

**Key Behaviors:**
- Math renders immediately after typing `$...$` or `$$...$$`
- Click on rendered math → reveals source LaTeX for editing
- Errors shown under previous correct render (great for live lectures)
- Output format: SVG (better for copy/paste to apps like Evernote)

**Input Methods:**
- **Math Block:** Type `$$` + Return → opens input field
- **Inline Math:** Type `$` + ESC → triggers inline preview

**Version History:**
- v0.11.0: Upgraded to MathJax v3
- Improved error handling for live editing

**Source:** [Typora Math Support](https://support.typora.io/Math/)

---

### 4. HyperMD FoldMath

HyperMD is a CodeMirror 5-based editor that heavily influenced Obsidian's implementation.

**Architecture:**
- Highly modular "PowerPack" system
- FoldMath feature for math rendering
- Default renderer: CodeCogs service (online)
- Optional: KaTeX or MathJax via PowerPacks

**Integration:**
```javascript
// HyperMD with KaTeX PowerPack
import * as HyperMD from 'hypermd'
import 'hypermd/powerpack/fold-math-with-katex'

const editor = HyperMD.fromTextArea(textarea, {
  hmdFoldMath: { renderer: 'katex' }
})
```

**Source:** [HyperMD](https://github.com/laobubu/HyperMD), [hypermd-mathjax](https://hypermd.github.io/hypermd-mathjax/)

---

### 5. Milkdown Math Plugin

Official Milkdown plugin using KaTeX.

**Installation:**
```bash
npm install @milkdown/plugin-math katex
```

**Usage:**
```typescript
import { Editor } from '@milkdown/core'
import { math } from '@milkdown/plugin-math'
import 'katex/dist/katex.min.css'

Editor.make()
  .use(math)
  .create()
```

**Source:** [Milkdown Math Plugin](https://milkdown.dev/plugin-math), [@milkdown/plugin-math](https://www.npmjs.com/package/@milkdown/plugin-math)

---

## Technical Challenges & Solutions

### Challenge 1: Multi-line Math Blocks

**Problem:** CodeMirror 6 error: "Decorations that replace line breaks may not be specified via plugins"

**Solution:** Use StateField instead of ViewPlugin for block math decorations:
```typescript
const blockMathField = StateField.define<DecorationSet>({
  create(state) { return findBlockMath(state) },
  update(decos, tr) {
    if (!tr.docChanged) return decos.map(tr.changes)
    return findBlockMath(tr.state)
  },
  provide: f => EditorView.decorations.from(f)
})
```

### Challenge 2: Cursor Behavior

**Problem:** Need atomic ranges for seamless editing - cursor should skip over rendered math.

**Solution:** Use `EditorView.atomicRanges` facet:
```typescript
const atomicMath = EditorView.atomicRanges.of(view => {
  // Return RangeSet of math ranges
  return mathRanges
})
```

### Challenge 3: Math Syntax Detection

**Problem:** Standard markdown parsers don't recognize `$...$` as math.

**Solutions:**
1. **Regex matching:** `/\$([^$\n]+)\$/g` for inline, `/\$\$([^$]+)\$\$/gs` for block
2. **Extend markdown parser:** Add custom syntax nodes
3. **Use remark-math:** If using unified/remark ecosystem

### Challenge 4: Click-to-Edit

**Problem:** Clicking on rendered math should reveal source.

**Solution:** Already implemented! The element-based cursor detection in our CodeMirrorEditor handles this - when cursor enters the math range, syntax is revealed.

---

## Recommended Implementation for Scribe

### Option A: Milkdown Math Plugin (Reading Mode)

**Pros:**
- Already have Milkdown installed
- Plug-and-play solution
- Well-maintained

**Cons:**
- Only works in Milkdown (Reading mode)
- Doesn't integrate with CodeMirror Live Preview

**Implementation:**
```typescript
// In MilkdownEditor.tsx
import { math } from '@milkdown/plugin-math'
import 'katex/dist/katex.min.css'

// Add to editor setup
.use(math)
```

### Option B: CodeMirror KaTeX Widget (Live Preview Mode)

**Pros:**
- Consistent with current Live Preview implementation
- Same element-based reveal pattern
- Full control over behavior

**Cons:**
- More code to write
- Multi-line math requires StateField

**Implementation Steps:**
1. Install KaTeX: `npm install katex`
2. Create MathWidget class extending WidgetType
3. Add inline math detection to RichMarkdownPlugin
4. Add StateField for block math
5. Add CSS for math styling

### Recommended Approach

**Phase 1:** Add inline math (`$...$`) to CodeMirrorEditor
- Simpler implementation (no line-break issues)
- Uses existing ViewPlugin pattern
- Immediate value for most use cases

**Phase 2:** Add block math (`$$...$$`) via StateField
- More complex but necessary for display equations
- Can be added incrementally

**Phase 3:** Consider Milkdown math for Reading mode
- Richer rendering options
- Better accessibility

---

## KaTeX vs MathJax Comparison

### Environment Support

| Environment | KaTeX | MathJax |
|-------------|-------|---------|
| `align` | ✅ | ✅ |
| `align*` | ✅ | ✅ |
| `aligned` | ✅ | ✅ |
| `equation` | ✅ | ✅ |
| `equation*` | ✅ | ✅ |
| `gather` | ✅ | ✅ |
| `gather*` | ✅ | ✅ |
| `gathered` | ✅ | ✅ |
| `split` | ✅ | ✅ |
| `cases` | ✅ | ✅ |
| `matrix` variants | ✅ | ✅ |
| `eqnarray` | ❌ | ✅ |
| `eqnarray*` | ❌ | ✅ |
| `multline` | ❌ | ✅ |
| `multline*` | ❌ | ✅ |
| `flalign` | ❌ | ✅ |
| `flalign*` | ❌ | ✅ |
| `alignat` | ✅ | ✅ |

**Summary:** KaTeX covers ~95% of academic use cases. MathJax needed for:
- Legacy documents using `eqnarray` (deprecated but common)
- `multline` for long equations
- `flalign` for full-width alignment

---

## MathJax Plugin Research

### Existing Packages

| Package | MathJax Version | Framework | Status |
|---------|-----------------|-----------|--------|
| [better-react-mathjax](https://github.com/fast-reflexes/better-react-mathjax) | 2, 3, 4 | React | ✅ Active, recommended |
| [react-mathjax3](https://github.com/ggunti/react-mathjax3) | 3 | React | Maintained |
| [react-mathjax-component](https://github.com/rhysd/react-mathjax-component) | 3.2+ | React | Maintained |
| [CodeMirror-MathJax](https://github.com/cben/CodeMirror-MathJax) | 2.4 | CM 4/5 | ⚠️ Deprecated |
| [codemirror-widgets](https://github.com/SamyPesse/codemirror-widgets) | N/A (KaTeX) | CM 5 | Recommended by CM-MathJax |

### Key Finding: No CodeMirror 6 + MathJax Package

There is **no dedicated CodeMirror 6 + MathJax integration** available as an npm package. Options:

1. **Build custom widget using MathJax directly**
2. **Use `better-react-mathjax` with custom widget wrapper**
3. **Stick with KaTeX** (simpler, covers most cases)

---

### better-react-mathjax (Recommended for MathJax)

**Best choice if MathJax is needed.** Features:

- **Version support:** MathJax 2, 3, and 4
- **Bundle size:** 6.18 KB (2.3 KB gzipped)
- **Input formats:** LaTeX, AsciiMath, MathML
- **Dynamic content:** `dynamic` flag for content updates
- **Flash prevention:** `hideUntilTypeset` property

**Usage:**
```typescript
import { MathJaxContext, MathJax } from 'better-react-mathjax'

// Wrap app once
<MathJaxContext>
  <MathJax>{"\\(\\frac{10}{4x}\\)"}</MathJax>
</MathJaxContext>
```

**Dynamic updates (for Live Preview):**
```typescript
<MathJax
  dynamic={true}
  hideUntilTypeset="every"
>
  {dynamicMathContent}
</MathJax>
```

**CodeMirror 6 Integration Pattern:**
```typescript
class MathJaxWidget extends WidgetType {
  constructor(readonly formula: string, readonly displayMode: boolean) {
    super()
  }

  toDOM() {
    const container = document.createElement('span')
    container.className = this.displayMode ? 'cm-math-display' : 'cm-math-inline'

    // Use MathJax.tex2svg for synchronous rendering
    const svg = MathJax.tex2svg(this.formula, {
      display: this.displayMode
    })
    container.appendChild(svg)
    return container
  }
}
```

---

### codemirror-widgets (KaTeX, Not MathJax)

Referenced as the "more mature" alternative by CodeMirror-MathJax author.

**Features:**
- Powers GitBook's desktop editor
- Pattern-based widget detection via regex
- Uses KaTeX for math rendering

**Mixins:**
- `re` - Find occurrences using regex
- `menu` - Click-activated menus
- `editParagraph` - Content update handling

**Note:** This is CodeMirror 5, not CM6. Pattern would need adaptation.

---

### MathJax Direct Integration

For full control, use MathJax 3 API directly:

```typescript
// Load MathJax once
await import('mathjax/es5/tex-svg-full.js')

// In widget toDOM():
const container = document.createElement('span')

// For dynamic updates, clear first
MathJax.typesetClear([container])

// Render math
container.innerHTML = `\\(${formula}\\)`
MathJax.typesetPromise([container])

return container
```

**Important:** Call `typesetClear()` before `typeset()` when updating existing rendered math.

---

## Dependencies

### KaTeX (Recommended for 95% of cases)
```bash
npm install katex
npm install @types/katex  # TypeScript types
```

**Pros:** Fast, lightweight, good error handling
**Cons:** Missing `eqnarray`, `multline`, `flalign`

### MathJax (Full LaTeX support)
```bash
npm install mathjax
# OR for React:
npm install better-react-mathjax
```

**Pros:** Full LaTeX support, SVG output, better accessibility
**Cons:** Larger bundle (~500KB), slower initial render

---

## CSS Styling

```css
/* Inline math */
.cm-math-inline {
  font-family: 'KaTeX_Math', serif;
  padding: 0 2px;
}

/* Display math */
.cm-math-display {
  display: block;
  text-align: center;
  margin: 1em 0;
  padding: 0.5em;
}

/* Error state */
.cm-math-error {
  color: var(--nexus-error, #ef4444);
  font-family: monospace;
  background: rgba(239, 68, 68, 0.1);
  padding: 2px 4px;
  border-radius: 2px;
}

/* KaTeX overrides for theme integration */
.katex {
  font-size: 1.1em;
}

.katex .base {
  color: var(--nexus-text-primary);
}
```

---

## References

### Primary Sources
- [prosemirror-math](https://github.com/benrbray/prosemirror-math) - Best reference implementation
- [Typora Math Support](https://support.typora.io/Math/) - UX patterns
- [CodeMirror Decoration Example](https://codemirror.net/examples/decoration/) - Widget patterns
- [Milkdown Math Plugin](https://milkdown.dev/plugin-math) - Plugin integration

### Secondary Sources
- [HyperMD](https://github.com/laobubu/HyperMD) - CodeMirror 5 patterns
- [codemirror-widgets](https://github.com/SamyPesse/codemirror-widgets) - KaTeX widget example
- [obsidian-editor-math](https://github.com/rainsia/obsidian-editor-math) - Obsidian plugin
- [LaTeX Suite](https://github.com/artisticat1/obsidian-latex-suite) - Popup preview

### Documentation
- [KaTeX Documentation](https://katex.org/docs/api.html)
- [MathJax Documentation](https://docs.mathjax.org/)
- [CodeMirror 6 System Guide](https://codemirror.net/docs/guide/)

---

## Next Steps

### Phase 1: Start with KaTeX (Recommended)
1. [ ] Install KaTeX: `npm install katex @types/katex`
2. [ ] Create MathWidget class in CodeMirrorEditor.tsx
3. [ ] Add inline math detection to RichMarkdownPlugin
4. [ ] Add KaTeX CSS imports
5. [ ] Test with various LaTeX expressions

### Phase 2: Block Math Support
6. [ ] Add StateField for block math (`$$...$$`)
7. [ ] Handle multi-line equations properly

### Phase 3: Reading Mode
8. [ ] Add `@milkdown/plugin-math` to MilkdownEditor
9. [ ] Ensure consistent rendering between modes

### Optional: MathJax Upgrade (If Needed)
10. [ ] If users need `eqnarray`/`multline`/`flalign`:
    - Install: `npm install better-react-mathjax`
    - Create MathJaxWidget extending WidgetType
    - Use `MathJax.tex2svg()` in toDOM()

---

## Final Recommendation

**Start with KaTeX** — it covers 95% of use cases, is faster, and has a smaller bundle.

Only consider MathJax if:
- Users specifically request `eqnarray`, `multline`, or `flalign`
- Legacy document compatibility is critical
- Advanced LaTeX packages are needed

The CodeMirror 6 widget pattern we already have for bold/italic syntax hiding is directly applicable to math rendering.
