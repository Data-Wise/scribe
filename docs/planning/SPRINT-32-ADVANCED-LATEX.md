# Sprint 32: Live Editing Enhancement - Advanced LaTeX

**Status:** Planning
**Priority:** P1
**Started:** 2026-01-06
**Branch:** `feat/sprint-32`
**Worktree:** `~/.git-worktrees/scribe/sprint-32`

---

## Objective

Enhance Live Preview mode with advanced LaTeX editing capabilities, building on the successful callout widget pattern from Sprint 31.

---

## Background

### Current LaTeX Support (v1.10.0)

**Reading Mode:**
- ✅ KaTeX rendering for inline (`$...$`) and display (`$$...$$`) math
- ✅ Full LaTeX typesetting quality
- ✅ Error handling for invalid LaTeX

**Live Mode:**
- ✅ Basic math widgets with cursor-based reveal
- ⚠️ Single-line only
- ⚠️ No error highlighting
- ⚠️ Limited editing experience

**Source Mode:**
- ✅ Raw LaTeX editing in textarea

### Sprint 31 Success: Callout Widgets

Successfully implemented cursor-based widget reveal pattern:
- `CalloutHeaderWidget` class extending `WidgetType`
- `toDOM()` method for DOM generation
- Cursor position detection for syntax reveal
- Type-specific styling and icons

**This pattern can be extended to LaTeX editing!**

---

## Phase 1: LaTeX Widget Improvements

### 1.1 Multi-line LaTeX Support

**Current Limitation:** Math widgets only work for single-line equations.

**Goal:** Support multi-line display math:
```latex
$$
\begin{aligned}
f(x) &= x^2 + 2x + 1 \\
     &= (x + 1)^2
\end{aligned}
$$
```

**Implementation:**
- Extend `MathWidget` to handle block-level LaTeX
- Detect `$$...$$` blocks that span multiple lines
- Replace entire block with rendered output widget
- Reveal syntax when cursor enters any line in the block

### 1.2 LaTeX Error Highlighting

**Goal:** Show errors inline with helpful messages.

**Examples:**
- Missing `$` delimiter → Red underline
- Unknown command `\unknowncommand` → Warning tooltip
- Mismatched braces `{...` → Syntax error indicator

**Implementation:**
- Wrap KaTeX rendering in try-catch
- On error, create `ErrorWidget` with error message
- Style errors with red background + tooltip
- Click error to see full error message

### 1.3 Click-to-Edit Modal Editor

**Goal:** Provide dedicated LaTeX editor modal for complex equations.

**Features:**
- Click math widget → Open modal editor
- Large textarea with syntax highlighting
- Live preview pane (KaTeX render)
- Save/Cancel buttons
- Keyboard shortcut: ⌘Enter to save, Esc to cancel

**UI Mockup:**
```
┌─────────────────────────────────────┐
│ Edit LaTeX                      ✕   │
├─────────────────────────────────────┤
│ $$                                  │
│ \int_0^1 x^2 dx = \frac{1}{3}      │
│ $$                                  │
│                                     │
│ Preview:                            │
│ ∫₀¹ x² dx = ⅓                       │
│                                     │
│         [Cancel]  [Save (⌘Enter)]   │
└─────────────────────────────────────┘
```

### 1.4 LaTeX Preview on Hover

**Goal:** Show rendered preview when hovering over LaTeX syntax in Source mode.

**Implementation:**
- Detect LaTeX regions in Source mode textarea
- On hover, show floating tooltip with KaTeX render
- Position tooltip near cursor

### 1.5 Syntax Highlighting for LaTeX

**Goal:** Color-code LaTeX commands in Source and Live modes.

**Examples:**
- Commands: `\frac`, `\int` (blue)
- Delimiters: `$`, `$$`, `{`, `}` (gray)
- Subscripts/superscripts: `_`, `^` (purple)
- Errors: Unknown commands (red)

**Implementation:**
- Extend CodeMirror decorations for LaTeX syntax
- Use `Decoration.mark()` for inline styles
- Leverage CodeMirror's language support

### 1.6 Auto-completion for LaTeX Commands

**Goal:** Type `\` and see autocomplete menu with common commands.

**Common Commands:**
- `\frac{}{}`
- `\int_{}`
- `\sum_{}`
- `\sqrt{}`
- `\alpha`, `\beta`, `\gamma`
- `\begin{aligned}...\end{aligned}`

**Implementation:**
- Detect `\` trigger in math context
- Show autocomplete dropdown (similar to wiki-link autocomplete)
- Arrow keys to navigate, Enter to insert
- Insert cursor inside braces `{|}`

### 1.7 LaTeX Snippets Library

**Goal:** Pre-built templates for common equation types.

**Snippets:**
- Fraction: `\frac{numerator}{denominator}`
- Integral: `\int_{lower}^{upper} f(x) dx`
- Matrix: `\begin{bmatrix} a & b \\ c & d \end{bmatrix}`
- Aligned equations: `\begin{aligned} ... \end{aligned}`
- Piecewise function: `f(x) = \begin{cases} ... \end{cases}`

**Access:**
- Command palette: "Insert LaTeX snippet"
- Keyboard shortcut: ⌘⌥L
- Modal picker with preview

---

## Phase 2: LaTeX Editor Polish (Future)

### 2.1 Visual Equation Editor

**Goal:** WYSIWYG editor for users unfamiliar with LaTeX syntax.

**Options:**
- MathLive (open source, MIT license)
- Math.js visual editor
- Custom builder using HTML buttons

### 2.2 LaTeX Symbol Palette

**Goal:** Click-to-insert Greek letters, operators, arrows.

**Implementation:**
- Floating toolbar with symbol categories
- Click symbol → Insert LaTeX command
- Categories: Greek, Operators, Arrows, Delimiters, Logic

### 2.3 Real-time Error Checking

**Goal:** Underline errors as you type (like spell check).

**Implementation:**
- Debounced KaTeX validation (300ms)
- Red squiggly underline for errors
- Hover for error message

### 2.4 LaTeX Formatting Toolbar

**Goal:** Quick-access buttons for common operations.

**Buttons:**
- Bold: `\mathbf{x}`
- Italic: `\mathit{x}`
- Subscript: `x_{i}`
- Superscript: `x^{2}`
- Fraction: `\frac{}{}`

---

## Technical Architecture

### Widget Class Hierarchy

```typescript
abstract class WidgetType {
  toDOM(): HTMLElement
  eq(other: WidgetType): boolean
  ignoreEvent(): boolean
}

// Existing (Sprint 31)
class CalloutHeaderWidget extends WidgetType { ... }
class MathWidget extends WidgetType { ... }

// New for Sprint 32
class MathBlockWidget extends WidgetType {
  constructor(latex: string, isValid: boolean)
  toDOM(): HTMLElement // Rendered KaTeX or error message
}

class LaTeXErrorWidget extends WidgetType {
  constructor(error: string)
  toDOM(): HTMLElement // Red background + error icon
}
```

### CodeMirror Extensions

```typescript
// Detect LaTeX blocks and create widgets
const latexWidgetPlugin = ViewPlugin.fromClass(class {
  update(update: ViewUpdate) {
    // Scan for $$...$$ blocks
    // Create MathBlockWidget decorations
    // Handle cursor position for reveal
  }
})

// Syntax highlighting for LaTeX
const latexHighlightPlugin = ViewPlugin.fromClass(class {
  update(update: ViewUpdate) {
    // Apply Decoration.mark() for \commands, {}, $, etc.
  }
})
```

### LaTeX Modal Component

```typescript
interface LaTeXEditorModalProps {
  initialLatex: string
  onSave: (latex: string) => void
  onCancel: () => void
}

const LaTeXEditorModal: React.FC<LaTeXEditorModalProps> = ({
  initialLatex,
  onSave,
  onCancel,
}) => {
  const [latex, setLatex] = useState(initialLatex)
  const [preview, setPreview] = useState<string | Error>()

  useEffect(() => {
    // Debounced KaTeX render
    const timer = setTimeout(() => {
      try {
        setPreview(katex.renderToString(latex))
      } catch (e) {
        setPreview(e as Error)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [latex])

  return (
    <Modal>
      <textarea value={latex} onChange={e => setLatex(e.target.value)} />
      <div className="preview">
        {preview instanceof Error ? (
          <ErrorMessage error={preview} />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: preview }} />
        )}
      </div>
      <Button onClick={() => onSave(latex)}>Save</Button>
      <Button onClick={onCancel}>Cancel</Button>
    </Modal>
  )
}
```

---

## Testing Strategy

### Unit Tests

**Target:** 50+ new tests

- `MathBlockWidget.test.tsx` (15 tests)
  - Multi-line LaTeX rendering
  - Error handling
  - Cursor-based reveal
  - Edge cases (empty blocks, invalid syntax)

- `LaTeXErrorWidget.test.tsx` (10 tests)
  - Error message display
  - Click behavior
  - Styling

- `LaTeXEditorModal.test.tsx` (15 tests)
  - Save/cancel behavior
  - Keyboard shortcuts (⌘Enter, Esc)
  - Live preview updates
  - Error rendering

- `LaTeXAutocomplete.test.tsx` (10 tests)
  - Trigger detection
  - Filtering
  - Insertion with cursor positioning

### E2E Tests

**Target:** 20+ new tests

**File:** `e2e/specs/latex-editing.spec.ts`

```typescript
test.describe('LaTeX Editing', () => {
  test('LAT-01: Multi-line display math renders in Live mode', async ({ page }) => {
    // Create note with multi-line $$...$$ block
    // Switch to Live mode
    // Verify KaTeX rendering
    // Verify widget shows when cursor is away
    // Verify syntax reveals when cursor enters
  })

  test('LAT-02: LaTeX error shows red underline', async ({ page }) => {
    // Type invalid LaTeX: $$\unknowncommand$$
    // Switch to Live mode
    // Verify error widget with red background
    // Hover and verify error tooltip
  })

  test('LAT-03: Click math widget opens modal editor', async ({ page }) => {
    // Create note with inline math
    // Switch to Live mode
    // Click math widget
    // Verify modal appears
    // Verify textarea has LaTeX content
    // Verify preview pane shows rendered output
  })

  test('LAT-04: Save edited LaTeX from modal', async ({ page }) => {
    // Open modal editor
    // Edit LaTeX in textarea
    // Click Save button
    // Verify modal closes
    // Verify math widget updates
  })

  test('LAT-05: LaTeX autocomplete inserts command', async ({ page }) => {
    // Type $ to enter math mode
    // Type \f
    // Verify autocomplete shows \frac, \forall, etc.
    // Press Enter on \frac
    // Verify \frac{}{} inserted with cursor in first brace
  })
})
```

---

## Success Criteria

### Phase 1 Complete When:
- ✅ Multi-line LaTeX renders in Live mode
- ✅ LaTeX errors show inline with helpful messages
- ✅ Click-to-edit modal works for all math widgets
- ✅ Autocomplete suggests common LaTeX commands
- ✅ Syntax highlighting applies to LaTeX code
- ✅ 50+ unit tests passing
- ✅ 20+ E2E tests passing
- ✅ Documentation updated

### Performance Goals:
- LaTeX rendering < 50ms for typical equations
- Autocomplete < 100ms latency
- No lag during typing in math mode

---

## Risks & Mitigations

### Risk 1: Complex Multi-line Parsing
**Mitigation:** Use regex with multiline flag, test extensively

### Risk 2: KaTeX Errors Break Widget
**Mitigation:** Wrap all KaTeX calls in try-catch, show ErrorWidget

### Risk 3: Modal Editor Complexity
**Mitigation:** Start with MVP (textarea + preview), enhance later

---

## Timeline Estimate

| Task | Effort | Priority |
|------|--------|----------|
| 1.1 Multi-line LaTeX | 2-3h | P1 |
| 1.2 Error highlighting | 1-2h | P1 |
| 1.3 Modal editor | 3-4h | P1 |
| 1.4 Hover preview | 1h | P2 |
| 1.5 Syntax highlighting | 2-3h | P1 |
| 1.6 Autocomplete | 2-3h | P1 |
| 1.7 Snippets library | 2h | P2 |
| Testing (unit + E2E) | 3-4h | P1 |
| Documentation | 1-2h | P1 |

**Total Phase 1:** ~18-24 hours

---

## References

- Sprint 31 Callout Implementation: `src/renderer/src/components/CodeMirrorEditor.tsx`
- Current Math Widget: `CodeMirrorEditor.tsx:168-231`
- KaTeX Documentation: https://katex.org/docs/api.html
- CodeMirror 6 Decorations: https://codemirror.net/docs/ref/#view.Decoration

---

## Next Steps

1. **Review & Approve** this planning document
2. **Create tasks** in todo list for Phase 1
3. **Start with 1.1** (Multi-line LaTeX support)
4. **Implement incrementally** with tests
5. **Visual testing** after each feature
6. **Document** as we go
