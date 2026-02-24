# SPEC: VS Code-Style Quarto Code Chunks

> **Status:** approved
> **Created:** 2026-02-24
> **Reviewed:** 2026-02-24
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
- [ ] Language badge (e.g., `r`, `python`) appears on the opening fence line, always visible
- [ ] Chunk option lines (`#|`) have distinct but subtle styling (italic + smaller font, no folding)
- [ ] A "Code Font" preference exists in Settings > Editor
- [ ] No run buttons, toolbars, or other IDE chrome is added
- [ ] Empty code chunks (fence-open immediately followed by fence-close) render correctly
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

3. **Separate code font from prose font** — New `codeFamily`/`codeSize` fields on `FontSettings`. Default: Fira Code at 88% of editor font size. One `codeFamily` setting controls all code-area fonts (code lines, fence lines, and `#|` option lines).

4. **No execution features** — Scribe is a writing tool. Run buttons, output cells, and execution status belong in VS Code.

### Resolved Decisions

| Question | Decision | Rationale |
|----------|----------|-----------|
| `color-mix()` vs JS `rgba()` | **JS `rgba()` in `applyTheme()`** | Guaranteed compatibility. Uses existing `hexToRgb()` helper (line 585, same file). |
| Language badge visibility | **Always visible** | Simpler implementation. ADHD wayfinding anchor — always answers "what kind?" at a glance. |
| Chunk option folding | **No folding — style only** | Italic + smaller font for visual hierarchy. Folding adds ViewPlugin state complexity. |
| Inline executable code | **Skip for v1** | Inline code already has mono styling. Minimal gain vs regex complexity. Can revisit later. |
| Theme reactivity | **Match existing behavior** | `createEditorTheme()` reads colors once at construction (same as callouts). Editor reconfigure on theme switch handles updates. |
| Chunk option font size | **Hardcoded 0.82 ratio** | Options always slightly smaller than code content. No extra setting needed. |
| Badge text format | **Full lowercase** (`r`, `python`, `julia`) | Matches what user typed in the fence. More explicit than abbreviations. |
| Adjacent chunks | **Visible 8px gap** | Each chunk is a distinct visual unit with its own badge. fence-close bottom-margin + fence-open top-margin create separation. |

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
  codeFamily: 'fira-code',        // NEW
  codeSize: 0.88,                 // NEW
}
```

### New entry in `FONT_FAMILIES` registry

```typescript
'jetbrains-mono': {
  name: 'JetBrains Mono',
  value: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
  description: 'JetBrains coding font - clean & precise',
  category: 'mono'
},
```

**Note:** `fira-code` already exists in the registry (line 948). JetBrains Mono is added as an additional option. Default `codeFamily` is `'fira-code'`.

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
| `cm-quarto-chunk-option` | `#\|` option lines | Code bg, smaller font, slight opacity, italic |
| `cm-quarto-lang-badge` | Language badge widget | Accent-tinted pill, 0.7em, full lowercase |

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
│ ┃ ```{r}                           r   ┃ │  <- tinted background
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
- [x] Badge text matches fence language (lowercase, e.g., `r`, `python`)
- [x] Focus/cursor on fence line shows raw syntax (no hidden content)

### Settings UI Mockup

```
Editor Settings
├── Font Family: [System Default     v]
├── Font Size: [15]
├── Line Height: [1.8]
├── ─────────────────────────────────
├── Code Font
│   ├── Font Family: [Fira Code        v]  <- filtered to mono fonts only
│   └── Size Ratio: [0.88] ========●==  (0.75 - 1.00)
```

## Open Questions

~~All resolved during review (2026-02-24).~~

## Review Checklist

- [x] Spec reviewed by user
- [x] Architecture aligns with existing patterns (callout decorations, theme system)
- [x] No new dependencies introduced
- [x] Backward compatible (existing preferences unaffected)
- [ ] All 10 themes tested
- [ ] Performance validated with large `.qmd` files

## Implementation Notes

### Critical Implementation Details

1. **Decoration sort order** — `Decoration.set()` requires decorations sorted by `.from`. Copy the sort pattern from `RichMarkdownPlugin` line 654.

2. **`Decoration.line()` takes single point** — `range(line.from)` not `range(line.from, line.to)`. Using a range causes runtime error.

3. **`--nexus-code-bg` must be complete value** — CSS can't do `rgba(var(--hex), 0.7)`. Compute full `rgba(r,g,b,a)` string in `applyTheme()` using existing `hexToRgb()` helper (line 585, private function in same file).

4. **Quarto detection regex** — Opening fences matching `/^```\{(\w+)/` are Quarto chunks. Plain `` ```js `` fences are NOT Quarto and should use CSS fallback only.

5. **Font migration** — Existing `FontSettings` in localStorage won't have `codeFamily`/`codeSize`. Use defaults via `{ ...DEFAULT_FONT_SETTINGS, ...stored }` spread pattern (already used in `loadFontSettings()` at line 985).

6. **Badge color** — Use `accent` (not `textSecondary` which doesn't exist on `ThemeColors`). Badge background: `accent` at 20% opacity. Badge text: `accent` color. Available theme colors: `textPrimary`, `textMuted`, `accent`, `accentHover`.

7. **Empty code chunks** — A chunk with no content lines (fence-open immediately followed by fence-close) must render correctly. The ViewPlugin should handle this by emitting fence-open and fence-close on adjacent lines with no code-line decorations between them.

8. **Settings test impact** — `EditorSettingsTab.test.tsx` may query by "Font Family" label text. With Code Font added, this label appears twice. Use role-based selectors or `within()` scoping to distinguish prose vs code font controls.

9. **Adjacent code chunks** — When two chunks appear back-to-back with no prose between them, the 8px gap (fence-close bottom-margin + fence-open top-margin) keeps them visually distinct. Each chunk gets its own badge.

10. **Badge text** — Use the language string as-is from the fence (lowercase): `r`, `python`, `julia`, `bash`, `javascript`. Do NOT uppercase or abbreviate. The `LanguageBadgeWidget` receives the raw language from the regex match.

11. **Chunk option size is fixed** — `#|` lines always use `calc(editor-size * 0.82)` regardless of the user's `codeSize` setting. This keeps options visually subordinate to code content at any code font size.

12. **`getThemeColors()` reads `--nexus-text-secondary`** but `applyTheme()` never sets it — it falls back to `#94a3b8`. This is a pre-existing inconsistency. For badge styling, use `colors.accent` (which is reliably set) rather than `colors.textSecondary`.

### Phase Breakdown

| Phase | Scope | Est. Time |
|-------|-------|-----------|
| 1 | CSS variables in `themes.ts` | 30 min |
| 2 | ViewPlugin + LanguageBadgeWidget | 1-2 hours |
| 3 | Theme styles in `createEditorTheme()` | 30 min |
| 4 | CSS cleanup in `index.css` | 15 min |
| 5 | Settings UI (Code Font picker) | 45 min |
| 6 | Testing + validation | 30 min |

### Explicitly Out of Scope

| Feature | Reason |
|---------|--------|
| Run Cell / CodeLens buttons | Scribe is for writing, not execution |
| Output cells | Quarto renders outputs separately |
| Cell toolbar / drag handles | Adds IDE complexity |
| Chunk option folding | Future enhancement (complexity) |
| Inline executable code styling | Future enhancement (minimal gain) |
| Gutter line numbers in chunks | Future opt-in feature |
| Badge cursor-reveal hiding | Unnecessary complexity; always-visible is better UX |

## History

| Date | Change |
|------|--------|
| 2026-02-24 | Initial spec from max brainstorm with 2 agents (frontend architect + UX designer) |
| 2026-02-24 | Review round 1: resolved 4 open questions, added edge cases (empty chunks, test impact, badge color fix) |
| 2026-02-24 | Review round 2: resolved 4 more (reactivity, option size, badge text format, adjacent chunks) |
| 2026-02-24 | Review round 3: default code font changed to Fira Code, options use same codeFamily setting, status → approved |
