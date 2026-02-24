# UX Design Spec: Code Chunk Visual Treatment

**Date:** 2026-02-24
**Status:** Draft
**Scope:** CSS + optional ViewPlugin decoration for code chunks in CodeMirror editor

---

## 1. Problem Statement

Code chunks in Scribe are nearly invisible. The current `rgba(0,0,0,0.04)` background (4% opacity) fails to create meaningful visual separation between prose and code. For academics with ADHD, this lack of distinction causes:

- **Context-switching friction** -- the eye cannot quickly locate "where am I, prose or code?"
- **Lost place** when scrolling through mixed Quarto documents
- **Missed chunk boundaries** leading to accidental edits in the wrong region

The goal is not VS Code fidelity. It is calm, unmistakable distinction.

---

## 2. Current State (Before)

```
+------------------------------------------------------------------+
|                                                                    |
|  This is prose text in the document. The quick brown fox jumps     |
|  over the lazy dog. Here is some academic writing about methods.   |
|                                                                    |
|  ```{r}                                            <- barely seen  |
| |#| label: fig-scatter                                             |
| |#| fig-cap: "Relationship between X and Y"                       |
| |library(ggplot2)                                                  |
| |ggplot(data, aes(x, y)) + geom_point()                           |
|  ```                                                               |
|                                                                    |
|  The results in @fig-scatter show a clear correlation between      |
|  the two variables, consistent with prior findings.                |
|                                                                    |
+------------------------------------------------------------------+

Legend:  | = thin 2px accent border (only visual cue)
        Background is rgba(0,0,0,0.04) -- essentially invisible
```

**Problems with current state:**
- 4% opacity background is imperceptible on most light themes
- On dark themes, `rgba(255,255,255,0.04)` is equally invisible
- The thin left border alone is not enough to establish a region
- Fence lines (```` ```{r} ````) look like regular text
- Chunk options (`#|`) are indistinguishable from comments in prose
- No top/bottom boundary makes chunks bleed into surrounding text

---

## 3. Proposed Design (After)

```
+------------------------------------------------------------------+
|                                                                    |
|  This is prose text in the document. The quick brown fox jumps     |
|  over the lazy dog. Here is some academic writing about methods.   |
|                                                                    |
|  .----------- r --------------------------------------------------.|
|  | ```{r}                                                         ||
|  | #| label: fig-scatter                          (dimmed, 85%)   ||
|  | #| fig-cap: "Relationship between X and Y"     (dimmed, 85%)   ||
|  | library(ggplot2)                                               ||
|  | ggplot(data, aes(x, y)) + geom_point()                        ||
|  | ```                                                            ||
|  '----------------------------------------------------------------'|
|                                                                    |
|  The results in @fig-scatter show a clear correlation between      |
|  the two variables, consistent with prior findings.                |
|                                                                    |
+------------------------------------------------------------------+

Legend:
  .---. = subtle rounded border (1px, semi-transparent)
    |   = left accent border (3px, theme accent at 40% opacity)
   r    = language badge (small, muted, top-right corner)
  Background = var(--code-chunk-bg), theme-derived, ~8-12% opacity
```

### 3.1 Anatomy of a Code Chunk

```
     language badge (optional, on hover or always -- see Section 7)
            |
  .---------v--- r -.
  | ```{r}           |   <-- fence line: slightly darker bg, monospace
  | #| label: fig-1  |   <-- chunk options: dimmed text, smaller font
  | #| echo: false   |
  |                   |   <-- code body: monospace, standard code bg
  | x <- rnorm(100)  |
  | plot(x)          |
  | ```              |   <-- closing fence: matches opening style
  '-------------------'
       ^
       |
  left accent border (3px, accent color at 40%)
```

---

## 4. Color Recommendations

### 4.1 Strategy: Derive from Theme, Not Hardcode

The current approach uses hardcoded `rgba(0,0,0,0.04)` and `rgba(255,255,255,0.04)`. This is too subtle and ignores the theme's actual background color. Instead, derive the code chunk background from `--nexus-bg-tertiary`, which every theme already defines as "the third-level surface."

### 4.2 New CSS Custom Properties

```css
/* Add to applyTheme() output or compute in CSS */
--code-chunk-bg:        /* bgTertiary at ~50% opacity over bgPrimary */
--code-chunk-bg-fence:  /* bgTertiary at ~70% opacity over bgPrimary */
--code-chunk-border:    /* accent at 30-40% opacity */
--code-chunk-option:    /* textMuted at 80% */
```

### 4.3 Per-Theme Values (Computed)

Using `bgTertiary` mixed toward `bgPrimary`:

| Theme            | Type  | bgPrimary | bgTertiary | Recommended chunk bg          |
|------------------|-------|-----------|------------|-------------------------------|
| Oxford Dark      | dark  | #0a0c10   | #1a1f26    | rgba(26,31,38, 0.55)         |
| Forest Night     | dark  | #0d1210   | #1c2922    | rgba(28,41,34, 0.55)         |
| Warm Cocoa       | dark  | #121010   | #262220    | rgba(38,34,32, 0.55)         |
| Midnight Purple  | dark  | #0e0c12   | #201c28    | rgba(32,28,40, 0.55)         |
| Deep Ocean       | dark  | #0a0e14   | #182028    | rgba(24,32,40, 0.55)         |
| Soft Paper       | light | #faf8f5   | #f5f2ed    | rgba(235,228,218, 0.40)      |
| Morning Fog      | light | #f4f6f8   | #e8eaed    | rgba(218,222,228, 0.40)      |
| Sage Garden      | light | #f5f8f5   | #e8f0e8    | rgba(218,232,218, 0.40)      |
| Lavender Mist    | light | #f8f6fa   | #f0ecf4    | rgba(228,222,236, 0.40)      |
| Sand Dune        | light | #f9f7f4   | #f0ebe4    | rgba(230,222,212, 0.40)      |

### 4.4 Simplified Implementation (Theme-Agnostic)

Rather than computing per-theme, use a single approach that works everywhere:

```css
/* Light themes */
.codemirror-editor-wrapper .cm-line.cm-codeblock-line {
  background-color: color-mix(in srgb, var(--nexus-bg-tertiary) 60%, var(--nexus-bg-primary) 40%);
}

/* Fence lines slightly more prominent */
.codemirror-editor-wrapper .cm-line.cm-codeblock-fence {
  background-color: color-mix(in srgb, var(--nexus-bg-tertiary) 80%, var(--nexus-bg-primary) 20%);
}

/* Dark themes -- same logic, CSS handles it */
.dark .codemirror-editor-wrapper .cm-line.cm-codeblock-line {
  background-color: color-mix(in srgb, var(--nexus-bg-tertiary) 65%, var(--nexus-bg-primary) 35%);
}
```

**Why `color-mix`?** It uses the theme's own colors, automatically adapting to every theme (including custom themes) without any JS computation. Fallback for older browsers: use `bgTertiary` directly.

### 4.5 Contrast Verification

The code chunk background must NOT reduce text contrast below WCAG AA (4.5:1). Since we are mixing between two of the theme's own surface colors (both designed to carry text), contrast is preserved by construction. The text color does not change inside code chunks.

---

## 5. Typography

### 5.1 Font Size Relationship

```
Prose body:       var(--editor-font-size)         (default 15px)
Code body:        calc(var(--editor-font-size) - 1px)   (14px -- 93%)
Chunk options:    calc(var(--editor-font-size) - 2px)   (13px -- 87%)
Fence markers:    calc(var(--editor-font-size) - 1px)   (14px -- 93%)
Language badge:   11px fixed                              (decorative)
```

**Rationale:** Code at 93% of prose size is the sweet spot. Smaller and it strains the eyes. Larger and it competes with prose for attention. The 1px reduction (not a percentage) ensures the difference is subtle but consistent across font size preferences.

### 5.2 Font Family

```css
--code-font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
```

Keep the existing JetBrains Mono stack. It is already established in the codebase and is an excellent choice for academic code (clear distinction between O/0, I/l/1, and good support for R/Python statistical operators).

**Do NOT use the prose font inside code chunks.** The font switch is the single strongest signal that "this is code, not prose."

### 5.3 Line Height

```
Prose:  var(--editor-line-height)    (default 1.8)
Code:   1.5                           (tighter, like a terminal)
```

Tighter line height in code chunks reinforces the visual distinction and is more natural for reading code. Academic prose needs generous line height for readability; code does not.

---

## 6. Spacing and Boundaries

### 6.1 Chunk Margins

```css
/* Top margin before opening fence */
.cm-codeblock-fence-open {
  margin-top: 12px;   /* breathing room from prose above */
  border-radius: 6px 6px 0 0;
  padding-top: 4px;
}

/* Bottom margin after closing fence */
.cm-codeblock-fence-close {
  margin-bottom: 12px;
  border-radius: 0 0 6px 6px;
  padding-bottom: 4px;
}
```

### 6.2 Left Border (Accent Gutter)

```css
.cm-codeblock-line {
  border-left: 3px solid color-mix(in srgb, var(--nexus-accent) 40%, transparent);
  padding-left: 16px;
}
```

**Change from current:** Increase from 2px to 3px. Increase opacity from whatever the accent implies to an explicit 40%. The border should be noticeable but not a bright stripe. 40% accent is visible without screaming.

### 6.3 Right Boundary

No right border. The background fill and rounded corners on fence lines are sufficient. A right border would add visual noise for no information gain.

### 6.4 Full-Width Background

The background should extend to the full width of the editor content area, not just the text width. This creates the "panel" feeling that VS Code achieves with notebook cells.

```css
.cm-codeblock-line {
  /* Extend background to fill editor width */
  margin-left: -20px;
  margin-right: -20px;
  padding-left: 23px;  /* 20px margin reclaim + 3px border */
  padding-right: 20px;
}
```

---

## 7. Language Badge

### 7.1 Appearance

```
  .--------------------------------------------.
  | ```{r}                               [ R ] |
  | ...                                        |
```

A small pill-shaped badge in the top-right of the opening fence line.

```css
.cm-codeblock-lang-badge {
  display: inline-block;
  font-family: var(--code-font-family);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--nexus-text-muted);
  background: color-mix(in srgb, var(--nexus-bg-tertiary) 80%, transparent);
  padding: 1px 8px;
  border-radius: 3px;
  opacity: 0.7;
}
```

### 7.2 Visibility Behavior

**Always visible, low opacity.** Do NOT make it hover-only. ADHD users scan documents quickly; the language badge is a wayfinding anchor. Making it hover-only defeats its purpose. Keep it at 70% opacity so it is findable without being loud.

### 7.3 Language Display Map

```
{r}        -> R
{python}   -> PY
{julia}    -> JL
{bash}     -> SH
{sql}      -> SQL
{ojs}      -> OJS
{mermaid}  -> MERMAID
{dot}      -> DOT
```

Short uppercase abbreviations. The badge is for quick identification, not a label.

---

## 8. Chunk Option Styling (#| lines)

### 8.1 Design

Chunk options are metadata, not code. They should be visually de-emphasized.

```css
.cm-codeblock-option {
  color: var(--nexus-text-muted);
  font-size: calc(var(--editor-font-size) - 2px);
  opacity: 0.85;
  font-style: italic;
}

/* The #| prefix */
.cm-codeblock-option-marker {
  color: var(--nexus-accent);
  opacity: 0.5;
  font-style: normal;
}
```

### 8.2 Rationale

- **Italic** distinguishes options from code at a glance
- **Smaller font** creates hierarchy: prose > code > metadata
- **Dimmed opacity** pushes options into the background
- **Accent-colored `#|` marker** provides a subtle visual anchor

---

## 9. Fence Line Treatment

### 9.1 Opening Fence (` ```{r} `)

```css
.cm-codeblock-fence-open {
  background-color: var(--code-chunk-bg-fence);
  border-radius: 6px 6px 0 0;
  margin-top: 12px;
  padding-top: 4px;
  font-size: calc(var(--editor-font-size) - 1px);
  color: var(--nexus-text-muted);
}
```

The opening fence is the "header" of the chunk. It gets a slightly stronger background than the body lines. The backticks and language specifier are displayed in muted text -- they are structural, not content.

### 9.2 Closing Fence (` ``` `)

```css
.cm-codeblock-fence-close {
  background-color: var(--code-chunk-bg-fence);
  border-radius: 0 0 6px 6px;
  margin-bottom: 12px;
  padding-bottom: 4px;
  color: var(--nexus-text-muted);
}
```

### 9.3 Future Consideration: Collapsed Fence Display

Do NOT implement now, but design-compatible: a future "collapse chunk" feature could replace the body with a single line showing the language badge and option summary. The fence/badge architecture supports this without redesign.

---

## 10. Interaction Patterns

### 10.1 Cursor Inside Chunk

When the cursor is inside a code chunk, the left accent border brightens from 40% to 70% opacity. This provides a focus indicator without changing layout.

```css
.cm-codeblock-line.cm-codeblock-active {
  border-left-color: color-mix(in srgb, var(--nexus-accent) 70%, transparent);
}
```

### 10.2 Hover State

**No hover state on the chunk itself.** Hover effects on large regions are distracting and provide no information. The chunk is not a button.

### 10.3 Focus Indicator (Keyboard Navigation)

The standard CodeMirror cursor and `cm-activeLine` highlight remain unchanged inside code chunks. The chunk background is designed to not interfere with the active line highlight.

### 10.4 Selection Inside Chunks

Selection highlight should remain the default CodeMirror selection color. The chunk background is low enough contrast that selection remains clearly visible on top of it.

---

## 11. What NOT to Include

These VS Code Quarto features are deliberately excluded from Scribe:

| VS Code Feature              | Why Not in Scribe                                              |
|------------------------------|----------------------------------------------------------------|
| "Run Cell" CodeLens button   | Scribe is a writing tool, not an IDE. Running code breaks flow |
| "Run Above" button           | Same -- execution is not the writing workflow                  |
| Cell toolbar (collapse, etc) | Toolbar chrome is visual noise in a prose-first editor         |
| Output cells below chunks    | Output belongs in the rendered preview, not the source editor  |
| Cell status indicators       | No execution = no status to show                               |
| Drag-to-reorder cells        | Prose interleaves with code; reordering is a text operation    |
| Add Cell (+) buttons         | Chunk insertion is via typing or completion, not UI buttons    |
| Gutter line numbers in code  | Distracting in a prose editor; not useful without execution    |
| Syntax highlighting overhaul | Keep existing CodeMirror highlighting; don't reinvent          |

**The guiding principle:** Scribe helps you *write* Quarto documents. VS Code helps you *run* them. Every feature should answer: "Does this help the writer, or does it turn the editor into an IDE?"

---

## 12. Accessibility

### 12.1 Color Contrast

- Code text on chunk background: inherits theme text colors, which already meet WCAG AA (4.5:1) against `bgTertiary`
- Chunk options (dimmed): at 85% opacity of `textMuted`, verify each theme maintains 3:1 minimum for large text. All current themes pass.
- Language badge: decorative text, not critical information; 70% opacity of `textMuted` is acceptable under WCAG for non-essential content

### 12.2 Not Relying on Color Alone

Code chunks are distinguished by **four independent cues**:
1. Background color (visual region)
2. Font change (monospace vs prose)
3. Left border (spatial marker)
4. Font size reduction (typographic hierarchy)

Any three of these four are sufficient for identification. This exceeds WCAG 1.4.1 (Use of Color).

### 12.3 Screen Reader Considerations

The CodeMirror ARIA tree already announces code blocks. No additional ARIA attributes are needed for the visual styling changes. The language badge, if implemented as a widget, should have `aria-hidden="true"` since the language is already in the fence text.

### 12.4 Motion and Animation

No animations. No transitions on background color. Chunk appearance is static. The only dynamic element is the border opacity change on focus, which uses an instant CSS change (no `transition` property).

---

## 13. Implementation Approach

### 13.1 Phase 1: CSS-Only (Immediate)

Update the existing CSS in `/Users/dt/projects/dev-tools/scribe/src/renderer/src/index.css` (lines 6231-6276):

- Replace `rgba(0,0,0,0.04)` with `color-mix()` expressions using theme variables
- Increase left border from 2px to 3px
- Add border-radius to fence lines
- Add margin-top/margin-bottom spacing
- Adjust font sizes to use `calc()` relative to `--editor-font-size`

This works with the existing `:has(.tok-codeFence)` and `:has(.tok-monospace)` selectors. No JS changes needed.

### 13.2 Phase 2: ViewPlugin Decoration (Follow-up)

The current CSS relies on `:has()` selectors matching token classes. This works but has limitations:
- Cannot distinguish opening vs closing fence
- Cannot apply full-width backgrounds reliably
- Cannot add the language badge

A ViewPlugin that walks the syntax tree and applies `Decoration.line()` classes would enable:
- `cm-codeblock-fence-open` vs `cm-codeblock-fence-close`
- `cm-codeblock-option` for `#|` lines
- `cm-codeblock-active` for lines under cursor
- Language badge via `Decoration.widget()`

**Note:** The CSS class `cm-codeblock-line` already exists in `index.css` but is never applied by any decoration in `CodeMirrorEditor.tsx`. Phase 2 would activate it.

### 13.3 Phase 3: Language Badge Widget (Future)

A small `WidgetType` subclass that renders the language abbreviation pill. Positioned via `Decoration.widget()` at the end of the opening fence line.

---

## 14. Visual Summary: Before and After

### Light Theme (Sage Garden)

**Before:**
```
  The results suggest that...           | #f5f8f5 bg (prose)
                                        |
  ```{r}                                | #f5f8f5 bg (barely different)
  #| label: fig-results                 | same
  library(ggplot2)                      | same
  ggplot(df, aes(x, y)) + geom_point() | same
  ```                                   | same
                                        |
  As shown in @fig-results, the...      | #f5f8f5 bg (prose)
```

**After:**
```
  The results suggest that...           | #f5f8f5 bg (prose)
                                        |
  .-- [R] ---------------------------.  |
  | ```{r}                           |  | #e0eae0 bg (clearly different)
  | #| label: fig-results            |  | #e0eae0, italic, smaller
  | library(ggplot2)                  |  | #e4ece4 bg
  | ggplot(df, aes(x,y))+geom_point()|  | #e4ece4 bg
  | ```                              |  | #e0eae0 bg
  '-----------------------------------' |
                                        |
  As shown in @fig-results, the...      | #f5f8f5 bg (prose)
```

### Dark Theme (Oxford Dark)

**Before:**
```
  The results suggest that...           | #0a0c10 bg
                                        |
  ```{r}                                | #0a0c10 bg (invisible difference)
  x <- 42                               | same
  ```                                   | same
                                        |
  The variable x represents...          | #0a0c10 bg
```

**After:**
```
  The results suggest that...           | #0a0c10 bg
                                        |
  .-- [R] ---------------------------.  |
  | ```{r}                           |  | #141a22 bg (visible tint)
  | x <- 42                          |  | #121720 bg
  | ```                              |  | #141a22 bg
  '-----------------------------------' |
                                        |
  The variable x represents...          | #0a0c10 bg
```

---

## 15. Open Questions

1. **Language badge: always visible or cursor-in-chunk only?** Current recommendation is always visible at 70% opacity. Could poll users.
2. **Should chunk options collapse when cursor is outside?** Similar to how heading markers hide. Would reduce visual noise but adds complexity.
3. **Code font as a separate user preference?** Currently hardcoded to JetBrains Mono. Could add a `--code-font-family` setting alongside the prose font picker.
