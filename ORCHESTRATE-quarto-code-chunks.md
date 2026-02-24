# Quarto Code Chunk Styling — Orchestration Plan

> **Branch:** `feature/quarto-code-chunks`
> **Base:** `dev`
> **Worktree:** `~/.git-worktrees/scribe/feature-quarto-code-chunks`
> **Spec:** `docs/specs/SPEC-quarto-code-chunks-2026-02-24.md`
> **Brainstorm:** `BRAINSTORM-quarto-code-chunks-2026-02-24.md`

## Objective

Add VS Code-style visual treatment to Quarto code chunks: distinct background, monospace code font, language badge, and theme integration across all 10 themes. No IDE features (run buttons, output cells).

## Architecture Overview

```
Settings (EditorSettingsTab.tsx)
  → FontSettings { codeFamily, codeSize }     ← NEW fields
  → applyFontSettings()                        ← sets --code-font-family, --code-font-size-ratio
  → applyTheme()                               ← sets --nexus-code-bg, --nexus-code-border

CodeMirrorEditor.tsx
  → createEditorTheme()                        ← .cm-quarto-* class styles
  → CodeChunkDecorationPlugin (ViewPlugin)     ← NEW: line decorations + badge widget
  → extensions array                           ← register plugin

index.css
  → lines 6231-6276                            ← replace with fallback-only CSS
```

## Phase 1: CSS Variables Foundation (themes.ts) — 30 min

### 1a. Extend `FontSettings` interface

**File:** `src/renderer/src/lib/themes.ts`

```typescript
export interface FontSettings {
  family: string
  size: number
  lineHeight: number
  codeFamily: string    // NEW: mono font key (e.g., 'jetbrains-mono')
  codeSize: number      // NEW: ratio of editor size (0.75-1.0)
}

export const DEFAULT_FONT_SETTINGS: FontSettings = {
  family: 'system',
  size: 15,
  lineHeight: 1.8,
  codeFamily: 'jetbrains-mono',
  codeSize: 0.88,
}
```

**Migration:** Existing localStorage `FontSettings` won't have new fields. Use `{ ...DEFAULT_FONT_SETTINGS, ...stored }` spread pattern (already in use).

### 1b. Add `jetbrains-mono` to `FONT_FAMILIES`

Already referenced in CSS but not in the registry. Add to the `mono` category in `FONT_FAMILIES`.

### 1c. Update `applyFontSettings()`

Set two new CSS variables:
- `--code-font-family`: resolved font stack from `codeFamily` key
- `--code-font-size-ratio`: numeric ratio (e.g., `0.88`)

### 1d. Update `applyTheme()`

Compute and set two new CSS variables:
- `--nexus-code-bg`: `rgba(r, g, b, 0.45)` from theme's `bgTertiary` (dark) or `rgba(r, g, b, 0.50)` (light)
- `--nexus-code-border`: `rgba(r, g, b, 0.25)` from theme's `accent`

Use existing `hexToRgb()` helper (line ~585).

**Commit:** `feat(themes): add code font settings and CSS variables`

## Phase 2: ViewPlugin + LanguageBadgeWidget (CodeMirrorEditor.tsx) — 1-2 hours

### 2a. Create `LanguageBadgeWidget extends WidgetType`

```typescript
class LanguageBadgeWidget extends WidgetType {
  constructor(readonly lang: string) { super() }

  toDOM() {
    const badge = document.createElement('span')
    badge.className = 'cm-quarto-lang-badge'
    badge.textContent = this.lang.toUpperCase()
    badge.setAttribute('aria-hidden', 'true')
    return badge
  }

  eq(other: LanguageBadgeWidget) { return this.lang === other.lang }
}
```

### 2b. Create `CodeChunkDecorationPlugin`

Follow the `RichMarkdownPlugin` pattern (line 440-658):

```typescript
const CodeChunkDecorationPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = this.computeDecorations(view)
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged)
        this.decorations = this.computeDecorations(update.view)
    }

    computeDecorations(view: EditorView): DecorationSet {
      const decorations: Range<Decoration>[] = []

      for (const { from, to } of view.visibleRanges) {
        syntaxTree(view.state).iterate({
          from, to,
          enter(node) {
            if (node.name === 'FencedCode') {
              // Get opening fence line text
              const firstLine = view.state.doc.lineAt(node.from)
              const text = firstLine.text
              const quartoMatch = text.match(/^```\{(\w+)/)

              if (!quartoMatch) return // Not a Quarto chunk, skip

              const lang = quartoMatch[1]

              // Iterate all lines in the fenced code block
              let pos = node.from
              while (pos <= node.to) {
                const line = view.state.doc.lineAt(pos)
                const lineText = line.text

                if (line.from === firstLine.from) {
                  // Opening fence line
                  decorations.push(
                    Decoration.line({ class: 'cm-quarto-fence-line cm-quarto-fence-open' }).range(line.from)
                  )
                  // Badge widget
                  decorations.push(
                    Decoration.widget({ widget: new LanguageBadgeWidget(lang), side: 1 }).range(line.to)
                  )
                } else if (lineText.trimStart() === '```') {
                  // Closing fence line
                  decorations.push(
                    Decoration.line({ class: 'cm-quarto-fence-line cm-quarto-fence-close' }).range(line.from)
                  )
                } else if (lineText.startsWith('#|')) {
                  // Chunk option line
                  decorations.push(
                    Decoration.line({ class: 'cm-quarto-chunk-option' }).range(line.from)
                  )
                } else {
                  // Code content line
                  decorations.push(
                    Decoration.line({ class: 'cm-quarto-code-line' }).range(line.from)
                  )
                }

                pos = line.to + 1
              }
            }
          }
        })
      }

      // CRITICAL: Sort by position before creating set
      decorations.sort((a, b) => a.from - b.from)
      return Decoration.set(decorations)
    }
  },
  { decorations: v => v.decorations }
)
```

### 2c. Register plugin in extensions array

Add `CodeChunkDecorationPlugin` to the extensions array (line ~1606).

**Critical details:**
- `Decoration.line()` takes `range(line.from)` — single point, NOT a range
- Decorations MUST be sorted by `.from` before `Decoration.set()`
- Quarto detection: `/^```\{(\w+)/` — plain `` ```js `` fences are NOT Quarto

**Commit:** `feat(editor): add CodeChunkDecorationPlugin with language badge`

## Phase 3: Theme Styles in createEditorTheme() — 30 min

Add `.cm-quarto-*` class styles in `createEditorTheme()`:

```typescript
'.cm-quarto-fence-line': {
  backgroundColor: 'var(--nexus-code-bg)',
  fontFamily: 'var(--code-font-family)',
  fontSize: 'calc(var(--editor-font-size) * var(--code-font-size-ratio, 0.88))',
  lineHeight: '1.5',
  borderLeft: '3px solid var(--nexus-code-border)',
  paddingLeft: '12px',
  marginLeft: '-3px',
},
'.cm-quarto-fence-open': {
  borderTopLeftRadius: '6px',
  borderTopRightRadius: '6px',
  marginTop: '8px',
},
'.cm-quarto-fence-close': {
  borderBottomLeftRadius: '6px',
  borderBottomRightRadius: '6px',
  marginBottom: '8px',
},
'.cm-quarto-code-line': {
  backgroundColor: 'var(--nexus-code-bg)',
  fontFamily: 'var(--code-font-family)',
  fontSize: 'calc(var(--editor-font-size) * var(--code-font-size-ratio, 0.88))',
  lineHeight: '1.5',
  borderLeft: '3px solid var(--nexus-code-border)',
  paddingLeft: '12px',
  marginLeft: '-3px',
},
'.cm-quarto-chunk-option': {
  backgroundColor: 'var(--nexus-code-bg)',
  fontFamily: 'var(--code-font-family)',
  fontSize: 'calc(var(--editor-font-size) * 0.82)',
  lineHeight: '1.5',
  borderLeft: '3px solid var(--nexus-code-border)',
  paddingLeft: '12px',
  marginLeft: '-3px',
  opacity: '0.75',
  fontStyle: 'italic',
},
'.cm-quarto-lang-badge': {
  display: 'inline-block',
  fontSize: '0.7em',
  fontFamily: 'var(--code-font-family)',
  padding: '1px 6px',
  borderRadius: '3px',
  backgroundColor: 'var(--nexus-code-border)',
  color: 'var(--nexus-text-secondary)',
  marginLeft: '8px',
  verticalAlign: 'middle',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
},
```

**Commit:** `feat(editor): add theme styles for Quarto code chunks`

## Phase 4: CSS Cleanup (index.css) — 15 min

Replace lines 6231-6276 with simplified fallback for non-Quarto fences:

```css
/* === Plain Code Fences (non-Quarto) === */
/* Quarto chunks (```{r}) are styled by CodeChunkDecorationPlugin */
.codemirror-editor-wrapper .cm-line:has(.tok-codeFence) {
  font-family: var(--code-font-family, 'JetBrains Mono', monospace);
  font-size: calc(var(--editor-font-size) * var(--code-font-size-ratio, 0.88));
  line-height: 1.5;
}
```

Remove:
- The `cm-codeblock-line` background/border rules
- The `.dark` class overrides
- The `#|` chunk option CSS rules (now handled by ViewPlugin)

**Commit:** `refactor(css): replace code chunk CSS with ViewPlugin fallback`

## Phase 5: Settings UI — Code Font Picker (EditorSettingsTab.tsx) — 45 min

### Add "Code Font" section to Editor Settings tab

Below the existing Font Family / Font Size / Line Height controls:

```
──────────────────────────────
Code Font
  Font Family: [JetBrains Mono  v]  ← filtered to mono fonts only
  Size Ratio:  [0.88] ========●==   (0.75 - 1.00 slider)
```

**Implementation:**
- Filter `FONT_FAMILIES` to `category: 'mono'` for the picker dropdown
- Size ratio slider: `min=0.75 max=1.0 step=0.01`
- On change: `updatePreferences()` → `applyFontSettings()`
- Use existing `FontSettingsSection` pattern from the prose font controls

**Commit:** `feat(settings): add code font picker in editor settings`

## Phase 6: Testing + Validation — 30 min

### Manual Testing Checklist

- [ ] Code chunks visible in all 10 themes (5 dark + 5 light)
- [ ] Language badge shows correct text ([R], [PY], [JL], etc.)
- [ ] Badge uses `aria-hidden="true"` (decorative)
- [ ] Chunk option `#|` lines have italic + smaller font
- [ ] Plain `` ```js `` fences still styled (CSS fallback)
- [ ] No `Decoration.set()` sort errors in console
- [ ] Cursor on fence line shows raw syntax (no hidden content)
- [ ] Theme switching updates code chunk colors instantly
- [ ] Code font setting change applies immediately
- [ ] Large `.qmd` files (500+ lines) perform well
- [ ] Adjacent code chunks render correctly
- [ ] Nested code (code inside blockquote) doesn't break

### Automated Tests

- [ ] All 2,255 existing tests pass (`npm test`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)

**Commit:** `test: validate Quarto code chunk styling` (if test files added)

## Acceptance Criteria

- [ ] Code chunks have clearly visible background (distinct from prose)
- [ ] Code chunks use monospace font distinct from prose font
- [ ] Background and font adapt to all 10 themes automatically
- [ ] Language badge ([R], [PY]) appears on opening fence line
- [ ] Chunk option lines (#|) have distinct but subtle styling
- [ ] "Code Font" preference exists in Settings > Editor
- [ ] No run buttons, toolbars, or IDE chrome added
- [ ] All existing tests pass
- [ ] Performance not degraded for large documents

## Files Affected

| File | Changes |
|------|---------|
| `src/renderer/src/lib/themes.ts` | `FontSettings` + `DEFAULT_FONT_SETTINGS` + `FONT_FAMILIES` + `applyTheme()` + `applyFontSettings()` |
| `src/renderer/src/components/CodeMirrorEditor.tsx` | `CodeChunkDecorationPlugin` + `LanguageBadgeWidget` + `createEditorTheme()` + extensions array |
| `src/renderer/src/index.css` | Replace lines 6231-6276 with fallback CSS |
| `src/renderer/src/components/Settings/EditorSettingsTab.tsx` | Code Font picker section |

## How to Start

```bash
cd ~/.git-worktrees/scribe/feature-quarto-code-chunks
claude
```

Start with Phase 1 (CSS variables in themes.ts). Commit after each phase.
