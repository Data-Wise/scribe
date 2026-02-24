# Brainstorm: VS Code-Style Quarto Code Chunks

> **Date:** 2026-02-24
> **Mode:** max | feat | save
> **Duration:** ~12 min (research + 2 agents)
> **Topic:** Implement VS Code Quarto-style code chunks with distinct background and code font

## Problem Statement

Scribe's code chunks (`\`\`\`{r}`, `\`\`\`{python}`) are nearly invisible. The current `rgba(0,0,0,0.04)` background blends into prose, making it hard to scan between text and code in long `.qmd` documents. VS Code's Quarto extension uses clear visual separation — distinct background color, monospace font, language indicators — that lets writers instantly identify code regions while editing.

## Current State (Scribe)

| Aspect | Current Implementation |
|--------|----------------------|
| **Background** | `rgba(0,0,0,0.04)` / `rgba(255,255,255,0.04)` — barely visible |
| **Font** | JetBrains Mono via CSS, hardcoded in `index.css` |
| **Detection** | CSS `:has(.tok-codeFence)` selectors (no ViewPlugin) |
| **Left border** | 2px solid accent color |
| **Theme integration** | `.dark` class override — not wired to theme CSS variables |
| **Settings** | No code font preference (only prose font is configurable) |
| **Chunk options** | `#| lines` styled via `:has(.tok-comment):has(.tok-monospace)` |
| **Language badge** | None |
| **Files** | `index.css:6231-6276`, `CodeMirrorEditor.tsx` (no dedicated plugin) |

## VS Code Quarto Reference

| Aspect | VS Code Implementation |
|--------|----------------------|
| **Background** | `#E1E1E166` light / `#40404066` dark — clearly visible |
| **Font** | Fixed-width from `--vscode-editor-font-family` |
| **Detection** | Markdown engine token parser via `background.ts` |
| **Decoration** | `TextEditorDecorationType` with `isWholeLine: true` |
| **CodeLens** | "Run Cell", "Run Next Cell", "Run Above" buttons above chunks |
| **Theme** | Uses `notebook.selectedCellBackground` / `notebook.cellEditorBackground` |
| **Config** | Background mode: default, theme-based, or off |

Sources:
- [Quarto VS Code Extension](https://marketplace.visualstudio.com/items?itemName=quarto.quarto)
- [Quarto HTML Code Blocks docs](https://quarto.org/docs/output-formats/html-code.html)
- [VS Code Notebook Editor](https://quarto.org/docs/tools/vscode/notebook.html)
- [quarto-dev/quarto GitHub: background.ts](https://github.com/quarto-dev/quarto/blob/main/apps/vscode/src/providers/background.ts)
- [quarto-dev/quarto GitHub: cell/codelens.ts](https://github.com/quarto-dev/quarto/blob/main/apps/vscode/src/providers/cell/codelens.ts)
- [quarto-dev/quarto GitHub: theme.ts](https://github.com/quarto-dev/quarto/blob/main/apps/vscode-editor/src/theme.ts)

## Quick Wins (< 30 min each)

1. **Bump background opacity** — Change `rgba(0,0,0,0.04)` to `rgba(0,0,0,0.08)` in CSS. Zero-risk, immediate improvement.
2. **Increase left border to 3px** — Thicker accent stripe improves scannability.
3. **Add top/bottom margin on fence lines** — 8-12px spacing creates visual "breathing room" around chunks.

## Medium Effort (1-2 hours each)

4. **Add `--nexus-code-bg` CSS variable** — Computed in `applyTheme()` from existing `bgTertiary` values. Auto-adapts to all 10 themes.
5. **Add `--code-font-family` CSS variable** — Separate code font from prose font, applied via `applyFontSettings()`.
6. **Create `CodeChunkDecorationPlugin`** — ViewPlugin using `Decoration.line()` pattern (identical to existing callout system at line 554-597 of CodeMirrorEditor.tsx).

## Long-term (Future sessions)

7. **Language badge widget** — Small `[R]` / `[PY]` pill on fence lines. Uses existing `WidgetType` pattern.
8. **Code font Settings UI** — Picker in Settings > Editor tab, filtered to mono fonts.
9. **Chunk option collapsing** — Fold `#|` lines when cursor isn't on them (like heading mark hiding).
10. **Code chunk line numbers** — Optional gutter numbers inside chunks only.

## Architecture Decision: ViewPlugin vs CSS `:has()`

**Decision: ViewPlugin for Quarto chunks, CSS `:has()` fallback for plain fences.**

| Approach | Pros | Cons |
|----------|------|------|
| CSS `:has()` only | Simple, no JS | Can't extend bg beyond text, no badge widgets, browser compat edge cases |
| ViewPlugin only | Full control, proven pattern in callouts | More code, need sort order discipline |
| **Hybrid (recommended)** | Best of both — ViewPlugin for Quarto, CSS fallback for `\`\`\`js` | Two code paths |

The hybrid approach matches how the codebase already works: callouts use `Decoration.line()` for rich treatment, while basic blockquotes use CSS.

## Color Strategy

**Approach: Derive `--nexus-code-bg` from `bgTertiary` in `applyTheme()`**

For dark themes: `rgba(bgTertiary, 0.45)` — subtle but clearly distinct from `bgPrimary`
For light themes: `rgba(bgTertiary, 0.5)` — visible tint without harsh contrast

This auto-adapts to all 10 themes + custom themes without per-theme configuration.

**Alternative considered:** `color-mix(in srgb, var(--nexus-bg-tertiary) 60%, var(--nexus-bg-primary) 40%)` — cleaner CSS but computed in CSS, not JS. Works in modern browsers but CSS `color-mix()` requires Chromium 111+ / Safari 16.2+.

## Font Strategy

| Element | Font | Size | Line Height |
|---------|------|------|-------------|
| Prose | User's choice (default: system sans, 15px) | `--editor-font-size` | 1.8 |
| Code content | User's choice from mono fonts (default: JetBrains Mono) | `calc(editor-size * 0.88)` → ~13px | 1.5 |
| Chunk options (`#|`) | Same as code, but smaller | `calc(editor-size * 0.82)` → ~12px | 1.5 |
| Fence lines | Same as code | Same as code | 1.5 |

The font size reduction (88%) plus line-height change (1.8→1.5) creates clear visual separation without being jarring.

## What NOT to Include

| VS Code Feature | Why Skip for Scribe |
|----------------|---------------------|
| Run Cell / CodeLens buttons | Scribe is for writing, not execution. VS Code handles running. |
| Output cells | Quarto renders outputs separately. No inline output. |
| Cell toolbar | Adds IDE complexity. Scribe is distraction-free. |
| Gutter line numbers in chunks | Adds visual noise. Maybe as future opt-in. |
| Drag handles | Not applicable to writing flow. |
| Cell execution status | Scribe doesn't execute code. |

## Agent Analysis Summary

### Frontend Architect Agent

Key findings:
- The existing `RichMarkdownPlugin` (line 440-658) is the exact pattern to follow
- `FencedCode` → `CodeInfo` syntax tree nodes provide language detection
- `Decoration.line()` requires `range(line.from)` not a range — critical detail
- Decorations MUST be sorted by `.from` position before `Decoration.set()`
- `createEditorTheme()` is the canonical place for decoration class styles
- `hexToRgb()` already exists at line 585 for color computation
- `--nexus-code-bg` must be a complete `rgba()` string (CSS can't apply alpha to a variable)

### UX Designer Agent

Key findings:
- Current `rgba(0,0,0,0.04)` is invisible — needs 4-8x increase
- `color-mix()` approach auto-adapts to all themes without JS
- Code font should be `--editor-font-size - 1px` (14px at default 15)
- Chunk options (`#|`) should be italic + slightly smaller for hierarchy
- Left border should increase from 2px→3px at 40% accent opacity
- Language badge: `[R]`/`[PY]`/`[JL]` pill, 11px uppercase, always visible at 70% opacity
- ADHD consideration: badge is "wayfinding anchor" for scanning — answers "what kind?" at a glance
- Avoid all IDE chrome (run buttons, toolbars, status indicators)

## Implementation Phases

### Phase 1: CSS Variables Foundation (themes.ts)
- Add `--nexus-code-bg` and `--nexus-code-border` in `applyTheme()`
- Add `codeFamily`/`codeSize` to `FontSettings`
- Add `--code-font-family` and `--code-font-size-ratio` in `applyFontSettings()`
- Add `'jetbrains-mono'` to `FONT_FAMILIES` registry

### Phase 2: ViewPlugin Core (CodeMirrorEditor.tsx)
- Add `LanguageBadgeWidget extends WidgetType`
- Add `CodeChunkDecorationPlugin` with `computeDecorations()`
- Register in extensions array

### Phase 3: Theme Styles (CodeMirrorEditor.tsx)
- Add `.cm-quarto-*` classes in `createEditorTheme()`
- Test across 4+ themes (dark + light)

### Phase 4: CSS Cleanup (index.css)
- Replace lines 6231-6276 with simplified plain-fence fallback
- Remove `.dark` overrides

### Phase 5: Settings UI (EditorSettingsTab.tsx)
- Add Code Font section with mono-filtered picker
- Add size ratio slider (0.75-1.0)

### Phase 6: Validation
- Cursor-on-fence behavior
- Theme switching with visible chunks
- Nested/adjacent chunks
- Full test suite

## Files Affected

| File | Changes |
|------|---------|
| `src/renderer/src/lib/themes.ts` | `FontSettings` interface, `DEFAULT_FONT_SETTINGS`, `FONT_FAMILIES`, `applyTheme()`, `applyFontSettings()` |
| `src/renderer/src/components/CodeMirrorEditor.tsx` | New `CodeChunkDecorationPlugin`, `LanguageBadgeWidget`, `createEditorTheme()` styles, extensions array |
| `src/renderer/src/index.css` | Replace lines 6231-6276 with fallback-only CSS |
| `src/renderer/src/components/Settings/EditorSettingsTab.tsx` | Add Code Font picker section |

## Recommended Path

> Start with Phase 1 (CSS variables) + Phase 4 (CSS cleanup) as a single commit. This alone makes code chunks visibly distinct across all themes with zero new JS. Then Phase 2+3 in a second commit for the ViewPlugin. Phase 5 (settings UI) can be a separate PR.

## Open Questions

1. Should `color-mix()` (CSS-only) or `rgba()` computation (JS in applyTheme) be used? The JS approach is more compatible but requires the `hexToRgb()` helper.
2. Should language badges be cursor-reveal (hide when editing fence line) like heading marks?
3. Should chunk option `#|` lines collapse when cursor isn't on them?
4. What about inline executable code (`\`{r} 1+1\``)? The VS Code extension styles these too.
