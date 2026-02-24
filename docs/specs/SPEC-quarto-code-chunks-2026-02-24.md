# SPEC: VS Code-Style Quarto Code Chunks

> **Status:** draft
> **Created:** 2026-02-24
> **From Brainstorm:** `BRAINSTORM-quarto-code-chunks-2026-02-24.md`

## Overview

Add distinct visual treatment to Quarto code chunks in Scribe's editor, inspired by VS Code's Quarto extension. Code chunks will have a clearly visible background color, separate monospace font, language badge, and proper theme integration across all 10 built-in themes. The goal is to make code regions instantly scannable in long `.qmd` documents without adding IDE complexity that would distract ADHD-focused writers.

## Primary User Story

**As an** academic writer using Scribe for Quarto documents,
**I want** code chunks to be visually distinct from surrounding prose,
**So that** I can quickly scan between text and code sections while writing, without losing focus.

### Acceptance Criteria

- [ ] Code chunks have a clearly visible background color that differs from prose
- [ ] Code chunks use a monospace font distinct from the prose font
- [ ] Background and font adapt automatically to all 10 themes (5 dark + 5 light)
- [ ] Language badge (e.g., `[R]`, `[PY]`) appears on the opening fence line
- [ ] Chunk option lines (`#|`) have distinct but subtle styling
- [ ] A "Code Font" preference exists in Settings > Editor
- [ ] No run buttons, toolbars, or other IDE chrome is added
- [ ] All existing tests pass
- [ ] Performance is not degraded for large documents

## Secondary User Stories

**As a** writer who uses custom themes,
**I want** code chunk backgrounds to auto-derive from my theme colors,
**So that** I don't need to manually configure code block styling.

**As a** writer with visual processing preferences,
**I want** to choose my own code font independently from my prose font,
**So that** I can optimize readability for both writing and code.

## Architecture

### Component Diagram

```
Settings (EditorSettingsTab.tsx)
  |
  v
FontSettings { family, size, lineHeight, codeFamily, codeSize }
  |
  v
applyFontSettings() --- sets --> --code-font-family, --code-font-size-ratio
applyTheme()        --- sets --> --nexus-code-bg, --nexus-code-border
  |
  v
CodeMirrorEditor.tsx
  |-- createEditorTheme() --- reads CSS vars --> .cm-quarto-* class styles
  |-- CodeChunkDecorationPlugin (ViewPlugin)
  |     |-- iterates syntaxTree for FencedCode nodes
  |     |-- emits Decoration.line() per code chunk line
  |     |-- emits Decoration.widget() for LanguageBadgeWidget
  |
  v
index.css (fallback only for plain ```lang fences)
```

### Key Design Decisions

1. **ViewPlugin for Quarto, CSS fallback for plain fences** — The ViewPlugin follows the established callout decoration pattern (CodeMirrorEditor.tsx line 554-597). CSS `:has()` remains only for non-Quarto code fences.

2. **Derived CSS variables, not per-theme config** — `--nexus-code-bg` is computed from existing `bgTertiary` in `applyTheme()`. No new fields on the `Theme` type.

3. **Separate code font from prose font** — New `codeFamily`/`codeSize` fields on `FontSettings`. Default: JetBrains Mono at 88% of editor font size.

4. **No execution features** — Scribe is a writing tool. Run buttons, output cells, and execution status belong in VS Code.

## API Design

N/A - No API changes. This is a UI-only feature within the editor component.

## Data Models

### Modified: `FontSettings` (themes.ts)

```typescript
export interface FontSettings {
  family: string        // Prose font family key
  size: number          // Prose font size (px)
  lineHeight: number    // Prose line height
  codeFamily: string    // NEW: Code font family key (mono category)
  codeSize: number      // NEW: Code font size as ratio of editor size (0.75-1.0)
}

export const DEFAULT_FONT_SETTINGS: FontSettings = {
  family: 'system',
  size: 15,
  lineHeight: 1.8,
  codeFamily: 'jetbrains-mono',  // NEW
  codeSize: 0.88,                 // NEW
}
```

### New CSS Variables

| Variable | Set By | Example Value (Oxford Dark) |
|----------|--------|-----------------------------|
| `--nexus-code-bg` | `applyTheme()` | `rgba(26, 31, 38, 0.45)` |
| `--nexus-code-border` | `applyTheme()` | `rgba(56, 189, 248, 0.25)` |
| `--code-font-family` | `applyFontSettings()` | `"JetBrains Mono", monospace` |
| `--code-font-size-ratio` | `applyFontSettings()` | `0.88` |

### New ViewPlugin Classes

| CSS Class | Applied To | Styling |
|-----------|-----------|---------|
| `cm-quarto-fence-line` | Opening + closing fence lines | Code bg, code font, left border |
| `cm-quarto-fence-open` | Opening fence line (additional) | Top border-radius, top margin |
| `cm-quarto-fence-close` | Closing fence line (additional) | Bottom border-radius, bottom margin |
| `cm-quarto-code-line` | Interior code content lines | Code bg, code font, left border |
| `cm-quarto-chunk-option` | `#\|` option lines | Code bg, smaller font, slight opacity |
| `cm-quarto-lang-badge` | Language badge widget | Accent-tinted pill, 0.7em |

## Dependencies

- No new dependencies. Uses existing CodeMirror 6 APIs (`ViewPlugin`, `Decoration`, `WidgetType`).
- `JetBrains Mono` is already referenced in CSS; needs adding to `FONT_FAMILIES` registry.

## UI/UX Specifications

### Before vs After

```
BEFORE:
┌──────────────────────────────────────────┐
│ This is prose text in the document.      │
│                                          │
│ │```{r}                                  │  <- barely visible border
│ │library(ggplot2)                        │
│ │ggplot(mtcars, aes(x=mpg)) +           │
│ │  geom_histogram()                      │
│ │```                                     │
│                                          │
│ More prose continues here.               │
└──────────────────────────────────────────┘

AFTER:
┌──────────────────────────────────────────┐
│ This is prose text in the document.      │
│                                          │
│ ┌╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶┐ │
│ ┃ ```{r}                          [R]  ┃ │  <- tinted background
│ ┃ library(ggplot2)                     ┃ │     monospace font
│ ┃ ggplot(mtcars, aes(x=mpg)) +        ┃ │     language badge
│ ┃   geom_histogram()                   ┃ │     3px accent border
│ ┃ ```                                  ┃ │
│ └╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶┘ │
│                                          │
│ More prose continues here.               │
└──────────────────────────────────────────┘
```

### Color Recommendations

| Theme Type | Background | Left Border |
|-----------|-----------|-------------|
| Dark themes | `rgba(bgTertiary, 0.45)` — subtle lift from dark bg | `accent` at 25% opacity |
| Light themes | `rgba(bgTertiary, 0.50)` — gentle tint on light bg | `accent` at 25% opacity |

### Font Sizing

| Element | Size | Line Height |
|---------|------|-------------|
| Prose | `var(--editor-font-size)` (15px default) | 1.8 |
| Code content | `calc(editor-size * 0.88)` (~13px) | 1.5 |
| Chunk options | `calc(editor-size * 0.82)` (~12px) | 1.5 |
| Language badge | `0.7em` (~9px) | inline |

### Accessibility Checklist

- [x] Background contrast ratio > 1.1:1 against prose background (subtle but perceptible)
- [x] Code font respects user's font size preference (ratio-based)
- [x] `prefers-reduced-motion` — no animations on chunk styling
- [x] Language badge uses `aria-hidden="true"` (decorative)
- [x] Badge text is uppercase for screen reader clarity
- [x] Focus/cursor on fence line shows raw syntax (no hidden content)

### Settings UI Mockup

```
Editor Settings
├── Font Family: [System Default     v]
├── Font Size: [15]
├── Line Height: [1.8]
├── ─────────────────────────────────
├── Code Font
│   ├── Font Family: [JetBrains Mono  v]  <- filtered to mono fonts only
│   └── Size Ratio: [0.88] ========●==  (0.75 - 1.00)
```

## Open Questions

1. **`color-mix()` vs JS computation?** — `color-mix(in srgb, ...)` is cleaner CSS but requires Safari 16.2+ / Chromium 111+. Tauri's WebKit should support it, but the JS `rgba()` approach in `applyTheme()` is guaranteed to work everywhere.

2. **Language badge cursor-reveal?** — Should the badge hide when cursor is on the fence line (like heading mark hiding), or always show?

3. **Chunk option collapsing?** — Should `#|` lines fold when cursor isn't on them? This adds complexity and could be a follow-up feature.

4. **Inline executable code?** — VS Code also styles `` `{r} expr` `` inline code. Should Scribe?

## Review Checklist

- [ ] Spec reviewed by user
- [ ] Architecture aligns with existing patterns (callout decorations, theme system)
- [ ] No new dependencies introduced
- [ ] Backward compatible (existing preferences unaffected)
- [ ] All 10 themes tested
- [ ] Performance validated with large `.qmd` files

## Implementation Notes

### Critical Implementation Details

1. **Decoration sort order** — `Decoration.set()` requires decorations sorted by `.from`. Copy the sort pattern from `RichMarkdownPlugin` line 654.

2. **`Decoration.line()` takes single point** — `range(line.from)` not `range(line.from, line.to)`. Using a range causes runtime error.

3. **`--nexus-code-bg` must be complete value** — CSS can't do `rgba(var(--hex), 0.7)`. Compute full `rgba(r,g,b,a)` string in `applyTheme()` using existing `hexToRgb()` helper.

4. **Quarto detection regex** — Opening fences matching `/^```\{(\w+)/` are Quarto chunks. Plain `` ```js `` fences are NOT Quarto and should use CSS fallback only.

5. **Font migration** — Existing `FontSettings` in localStorage won't have `codeFamily`/`codeSize`. Use defaults via `{ ...DEFAULT_FONT_SETTINGS, ...stored }` spread pattern.

### Phase Breakdown

| Phase | Scope | Est. Time |
|-------|-------|-----------|
| 1 | CSS variables in `themes.ts` | 30 min |
| 2 | ViewPlugin + LanguageBadgeWidget | 1-2 hours |
| 3 | Theme styles in `createEditorTheme()` | 30 min |
| 4 | CSS cleanup in `index.css` | 15 min |
| 5 | Settings UI (Code Font picker) | 45 min |
| 6 | Testing + validation | 30 min |

## History

| Date | Change |
|------|--------|
| 2026-02-24 | Initial spec from max brainstorm with 2 agents (frontend architect + UX designer) |
