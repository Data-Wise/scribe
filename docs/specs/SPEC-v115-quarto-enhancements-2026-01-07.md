# SPEC: v1.15 Quarto Enhancements

> **Formal Specification for Implementation**

**Status:** Draft
**Created:** 2026-01-07
**Target:** Scribe v1.15.0
**From Brainstorm:** `BRAINSTORM-editor-polish-quarto-2026-01-07.md`

---

## Overview

Add first-class Quarto support to Scribe with YAML frontmatter autocomplete, chunk options assistance, cross-reference autocomplete, Quarto callout syntax, and Quarto CLI render integration. These features target academic users writing `.qmd` documents with R, Python, or Julia code chunks.

---

## Primary User Story

**As an** academic researcher using Quarto
**I want** intelligent autocomplete and rendering support
**So that** I can write manuscripts, presentations, and reports efficiently without memorizing syntax

### Acceptance Criteria

- [ ] YAML frontmatter keys autocomplete when typing in `---` blocks
- [ ] Chunk options (#|) autocomplete inside code blocks
- [ ] Cross-references (@fig-, @tbl-, @eq-, @sec-) autocomplete from document labels
- [ ] Quarto callout blocks (`::: {.callout-*}`) render in Live/Reading modes
- [ ] Quarto render works via CLI with format selection
- [ ] All features work in `.md` files with Quarto content (not just `.qmd`)

---

## Secondary User Stories

### Story 2: YAML Power User

**As a** user writing complex Quarto documents
**I want** context-aware YAML completions
**So that** I don't need to reference documentation for format options

**Acceptance Criteria:**
- [ ] `format:` shows all valid output formats
- [ ] `execute:` shows all chunk execution options
- [ ] `bibliography:` scans project for `.bib` files
- [ ] Nested YAML structures autocomplete correctly

### Story 3: Figure/Table Author

**As a** researcher creating figures and tables
**I want** cross-references to autocomplete from my labels
**So that** I avoid typos and maintain consistency

**Acceptance Criteria:**
- [ ] Typing `@fig-` shows all `{#fig-*}` labels in document
- [ ] Typing `@tbl-` shows all `{#tbl-*}` labels in document
- [ ] Typing `@eq-` shows all `{#eq-*}` labels in document
- [ ] Typing `@sec-` shows all `{#sec-*}` labels in document
- [ ] Completions show label + context (caption/title preview)

---

## Technical Requirements

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Autocomplete Extension Points                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  CodeMirrorEditor.tsx (line ~1541)                                  │
│  ├── latexCompletions()        ← existing                          │
│  ├── yamlCompletions()         ← NEW                               │
│  ├── chunkOptionCompletions()  ← NEW                               │
│  └── crossRefCompletions()     ← NEW                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Helper Modules (New Files)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  lib/quarto-completions.ts                                          │
│  ├── YAML_KEYS: Record<string, CompletionOption[]>                 │
│  ├── CHUNK_OPTIONS: CompletionOption[]                             │
│  ├── scanForLabels(doc: Text): CrossRef[]                          │
│  └── isInYamlBlock(context: CompletionContext): boolean            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### API Design

#### New TypeScript Types

```typescript
// lib/quarto-completions.ts

interface YamlCompletionOption {
  label: string           // e.g., "format:"
  type: 'keyword' | 'property'
  detail?: string         // e.g., "Output format"
  info?: string           // Extended description
  children?: YamlCompletionOption[]  // Nested options
}

interface ChunkOption {
  label: string           // e.g., "#| echo:"
  values: string[]        // e.g., ["true", "false", "fenced"]
  description: string
}

interface CrossRef {
  type: 'fig' | 'tbl' | 'eq' | 'sec'
  label: string           // e.g., "fig-scatter"
  context: string         // Caption or section title
  line: number            // Line number in document
}
```

#### Completion Functions

```typescript
// YAML Completions
function yamlCompletions(context: CompletionContext): CompletionResult | null {
  // 1. Check if cursor is between --- delimiters
  if (!isInYamlBlock(context)) return null

  // 2. Determine context (top-level key vs. value)
  const lineText = context.state.doc.lineAt(context.pos).text
  const beforeCursor = lineText.slice(0, context.pos - context.state.doc.lineAt(context.pos).from)

  // 3. If typing key (no colon yet), suggest keys
  // 4. If after colon, suggest values for that key

  return { from, options, validFor }
}

// Chunk Options Completions
function chunkOptionCompletions(context: CompletionContext): CompletionResult | null {
  // 1. Check if inside code block (between ``` delimiters)
  if (!isInCodeBlock(context)) return null

  // 2. Check if line starts with #|
  const word = context.matchBefore(/#\|\s*[a-z-]*/)
  if (!word) return null

  // 3. Return chunk option suggestions
  return { from: word.from, options: CHUNK_OPTIONS }
}

// Cross-Reference Completions
function crossRefCompletions(context: CompletionContext): CompletionResult | null {
  // 1. Check for @prefix pattern
  const word = context.matchBefore(/@[a-z]*-?[a-z0-9_-]*/)
  if (!word) return null

  // 2. Scan document for labels
  const labels = scanForLabels(context.state.doc)

  // 3. Filter by prefix typed
  const prefix = context.state.sliceDoc(word.from + 1, context.pos)
  const filtered = labels.filter(l => `${l.type}-${l.label}`.startsWith(prefix))

  return {
    from: word.from,
    options: filtered.map(l => ({
      label: `@${l.type}-${l.label}`,
      detail: l.context.slice(0, 40),
      type: 'reference'
    }))
  }
}
```

### Data Models

#### YAML Keys Reference

```typescript
const YAML_KEYS: Record<string, YamlCompletionOption> = {
  'format': {
    label: 'format:',
    detail: 'Output format',
    children: [
      { label: 'html', detail: 'HTML document' },
      { label: 'pdf', detail: 'PDF via LaTeX' },
      { label: 'docx', detail: 'Word document' },
      { label: 'revealjs', detail: 'Reveal.js presentation' },
      { label: 'beamer', detail: 'LaTeX Beamer slides' },
      { label: 'typst', detail: 'Typst document' },
    ]
  },
  'execute': {
    label: 'execute:',
    detail: 'Code execution options',
    children: [
      { label: 'echo: true', detail: 'Show code in output' },
      { label: 'echo: false', detail: 'Hide code in output' },
      { label: 'eval: true', detail: 'Execute code' },
      { label: 'eval: false', detail: 'Skip execution' },
      { label: 'warning: false', detail: 'Suppress warnings' },
      { label: 'message: false', detail: 'Suppress messages' },
    ]
  },
  'bibliography': {
    label: 'bibliography:',
    detail: 'BibTeX file path',
    // Dynamic: scan project for .bib files
  },
  'csl': {
    label: 'csl:',
    detail: 'Citation style file',
    // Dynamic: scan project for .csl files
  },
  // ... more keys
}
```

#### Chunk Options Reference

```typescript
const CHUNK_OPTIONS: ChunkOption[] = [
  { label: '#| echo:', values: ['true', 'false', 'fenced'], description: 'Show source code' },
  { label: '#| eval:', values: ['true', 'false'], description: 'Execute code' },
  { label: '#| output:', values: ['true', 'false', 'asis'], description: 'Include output' },
  { label: '#| warning:', values: ['true', 'false'], description: 'Show warnings' },
  { label: '#| message:', values: ['true', 'false'], description: 'Show messages' },
  { label: '#| error:', values: ['true', 'false'], description: 'Continue on error' },
  { label: '#| include:', values: ['true', 'false'], description: 'Include chunk in output' },
  { label: '#| label:', values: [], description: 'Chunk label for cross-refs' },
  { label: '#| fig-cap:', values: [], description: 'Figure caption' },
  { label: '#| fig-width:', values: ['4', '5', '6', '7', '8'], description: 'Figure width (inches)' },
  { label: '#| fig-height:', values: ['3', '4', '5', '6'], description: 'Figure height (inches)' },
  { label: '#| tbl-cap:', values: [], description: 'Table caption' },
  { label: '#| code-fold:', values: ['true', 'false', 'show'], description: 'Fold code block' },
  { label: '#| code-summary:', values: [], description: 'Folded code label' },
]
```

### Dependencies

| Package | Purpose | Size | Status |
|---------|---------|------|--------|
| None | All features use existing CodeMirror | N/A | ✅ No new deps |

---

## UI/UX Specifications

### User Flow: YAML Autocomplete

```
1. User creates/opens document
2. Types `---` to start frontmatter
3. Types `for` and presses Tab or sees dropdown
   ┌────────────────────────┐
   │ format:     Output...  │ ← highlighted
   │ format-links: ...      │
   └────────────────────────┘
4. Selects `format:` → inserted with space
5. Types `ht` → sees `html` suggestion
6. Completes to `format: html`
```

### User Flow: Cross-Reference

```
1. User creates figure with label:
   ```{r}
   #| label: fig-scatter
   #| fig-cap: "Scatter plot of X vs Y"
   plot(x, y)
   ```

2. Later in document, types `@fig-`
   ┌────────────────────────────────┐
   │ @fig-scatter  Scatter plot...  │ ← shows caption
   └────────────────────────────────┘

3. Selects → inserts `@fig-scatter`
```

### Wireframe: Chunk Options

```
┌─────────────────────────────────────────────────────────────────┐
│ ```{r}                                                          │
│ #| ▏                                                            │
│    ┌───────────────────────────────────┐                        │
│    │ #| echo:       Show source code   │                        │
│    │ #| eval:       Execute code       │                        │
│    │ #| warning:    Show warnings      │                        │
│    │ #| fig-cap:    Figure caption     │                        │
│    │ #| label:      Chunk label        │                        │
│    └───────────────────────────────────┘                        │
│ plot(x, y)                                                      │
│ ```                                                             │
└─────────────────────────────────────────────────────────────────┘
```

### Accessibility Checklist

- [x] Keyboard navigable (arrow keys, Enter, Escape)
- [x] Screen reader: completion list announced
- [x] High contrast: completion dropdown uses theme colors
- [x] Focus visible: selected item highlighted
- [x] Dismissable: Escape closes, click outside closes

---

## Implementation Plan

### Phase 1: YAML Autocomplete (Sprint 33, Week 1)

**Files to Create:**
- `src/renderer/src/lib/quarto-completions.ts`

**Files to Modify:**
- `src/renderer/src/components/CodeMirrorEditor.tsx`

**Tasks:**
1. Create `quarto-completions.ts` with YAML_KEYS data
2. Implement `isInYamlBlock()` detection
3. Implement `yamlCompletions()` function
4. Register completion source in CodeMirrorEditor
5. Test with various YAML structures

**Tests:** ~20 new tests

### Phase 2: Chunk Options (Sprint 33, Week 1)

**Files to Modify:**
- `src/renderer/src/lib/quarto-completions.ts`
- `src/renderer/src/components/CodeMirrorEditor.tsx`

**Tasks:**
1. Add CHUNK_OPTIONS data to completions file
2. Implement `isInCodeBlock()` detection
3. Implement `chunkOptionCompletions()` function
4. Register completion source
5. Test with R, Python, Julia code blocks

**Tests:** ~15 new tests

### Phase 3: Cross-References (Sprint 33, Week 2)

**Files to Modify:**
- `src/renderer/src/lib/quarto-completions.ts`
- `src/renderer/src/components/CodeMirrorEditor.tsx`

**Tasks:**
1. Implement `scanForLabels()` document scanner
2. Cache labels with debounced update
3. Implement `crossRefCompletions()` function
4. Add context preview to completions
5. Test with mixed document content

**Tests:** ~20 new tests

### Phase 4: Quarto Callouts (Sprint 34, Week 1)

**Files to Modify:**
- `src/renderer/src/components/HybridEditor.tsx`
- `src/renderer/src/lib/callouts.ts` (new or extend existing)

**Tasks:**
1. Extend callout regex for `::: {.callout-*}` syntax
2. Map Quarto callout types to existing Obsidian rendering
3. Support nested callouts
4. Test in all three modes

**Tests:** ~15 new tests

### Phase 5: Quarto Render (Sprint 34, Week 1-2)

**Files to Create:**
- `src-tauri/src/quarto.rs`

**Files to Modify:**
- `src-tauri/src/commands.rs`
- `src-tauri/src/lib.rs`
- `src/renderer/src/components/ExportDialog.tsx`
- `src/renderer/src/lib/api.ts`

**Tasks:**
1. Create `quarto.rs` with render command
2. Detect Quarto CLI installation
3. Add Tauri command for rendering
4. Add frontend API call
5. Update ExportDialog with Quarto option
6. Parse and display render errors

**Tests:** ~15 new tests

### Phase 6: Project-Wide Cross-References (Sprint 34, Week 2) 🆕

**Files to Create:**
- `src-tauri/src/quarto/crossref.rs`

**Files to Modify:**
- `src-tauri/src/quarto/mod.rs`
- `src-tauri/src/commands.rs`
- `src/renderer/src/lib/api.ts`
- `src/renderer/src/lib/quarto-completions.ts`

**Tasks:**
1. Create `crossref.rs` with `scan_labels()` function
2. Implement in-memory `CrossRefIndex` with HashMap
3. Add `build_crossref_index` Tauri command
4. Add `update_crossref_index` Tauri command
5. Update cross-ref autocomplete to use project-wide index
6. Build index on project open, update on note save

**Tests:** ~20 new tests

### Phase 7: Single Chunk Execution (Sprint 35, Week 1) 🆕

**Files to Create:**
- `src-tauri/src/quarto/chunk.rs`

**Files to Modify:**
- `src-tauri/src/quarto/mod.rs`
- `src-tauri/src/commands.rs`
- `src/renderer/src/lib/api.ts`
- `src/renderer/src/components/CodeMirrorEditor.tsx` (execution UI)

**Tasks:**
1. Create `chunk.rs` with `execute_chunk()` async command
2. Implement timeout enforcement (30s default)
3. Add process tracking for kill functionality
4. Add Tauri command `kill_chunk_execution`
5. Add execution button UI to code blocks
6. Display stdout/stderr inline below chunk
7. Handle errors with jump-to-line

**Tests:** ~25 new tests

### Phase 8: Error Panel (Sprint 35, Week 1-2) 🆕

**Files to Create:**
- `src/renderer/src/components/ErrorPanel.tsx`
- `src-tauri/src/quarto/error.rs`

**Files to Modify:**
- `src/renderer/src/components/StatusBar.tsx`
- `src/renderer/src/store/errorStore.ts` (new)
- `src/renderer/src/App.tsx`

**Tasks:**
1. Create `error.rs` with `parse_quarto_output()` function
2. Create `ErrorPanel.tsx` bottom drawer component
3. Create error state store (Zustand)
4. Add error badge to status bar
5. Implement jump-to-line functionality
6. Add copy error button
7. Add "Ask AI to fix" integration
8. Keyboard shortcuts (Cmd+Shift+E)

**Tests:** ~20 new tests

### Phase 9: Zotero + BibTeX Integration (Sprint 35, Week 2) 🆕

**Files to Modify:**
- `src/renderer/src/lib/quarto-completions.ts`
- `src/renderer/src/lib/api.ts`
- `src-tauri/src/commands.rs` (optional Zotero API)

**Tasks:**
1. Scan project for `.bib` files
2. Parse BibTeX entries for autocomplete
3. Add Zotero Better BibTeX integration (optional)
4. Update citation autocomplete to show source icons
5. Update YAML `bibliography:` autocomplete

**Tests:** ~15 new tests

### Phase 10: Live Slide Preview (Sprint 36) 🆕

**Files to Create:**
- `src/renderer/src/components/SlidePreview.tsx`

**Files to Modify:**
- `src/renderer/src/components/HybridEditor.tsx`
- `src/renderer/src/lib/api.ts`
- `src-tauri/src/quarto/cli.rs`

**Tasks:**
1. Detect `format: revealjs` or `format: beamer` in YAML
2. Add `quarto preview` command integration
3. Create external browser preview (default)
4. Create optional split view component (Settings toggle)
5. Implement cursor ↔ slide sync
6. Add navigation controls ([<] [>] slide indicators)
7. Keyboard shortcuts (Cmd+Shift+P, Cmd+[, Cmd+])

**Tests:** ~20 new tests

---

## Open Questions

1. **YAML Nested Completion:** How deep should we support nested YAML? (e.g., `format: html: theme:`)
   - **Proposed:** Support 2 levels of nesting initially

2. **Cross-Ref Caching:** Should labels be cached globally or per-document?
   - **Proposed:** Per-document with debounced update on text change

3. **Quarto CLI Version:** Minimum Quarto version to support?
   - **Proposed:** Quarto 1.3+ (stable cross-reference syntax)

---

## Review Checklist

- [ ] Technical approach approved
- [ ] UI/UX wireframes reviewed (see `UXUI-quarto-support-2026-01-07.md`)
- [ ] Test coverage adequate (~170 new tests across 10 phases)
- [ ] No new npm dependencies added
- [ ] Rust dependencies: tokio (already included)
- [ ] ADHD principles maintained (autocomplete-first, no forced learning)
- [ ] Sprint scope reasonable (~40-45h across 4 sprints)

---

## Implementation Notes

### Pattern to Follow

Existing LaTeX autocomplete in `CodeMirrorEditor.tsx` (lines 812-930) provides the template:

```typescript
// 1. Trigger pattern
const word = context.matchBefore(/\\[a-zA-Z]*/)

// 2. Guard clause
if (!word || (word.from === word.to && !context.explicit)) return null

// 3. Return completions
return {
  from: word.from,
  options: latexCommands,
  validFor: /^\\[a-zA-Z]*$/
}
```

### CodeMirror Extension Registration

Add new completions to extension array:

```typescript
const extensions = [
  // ... existing
  autocompletion({
    override: [
      latexCompletions,
      yamlCompletions,      // NEW
      chunkOptionCompletions, // NEW
      crossRefCompletions,   // NEW
    ]
  })
]
```

---

## History

| Date | Author | Change |
|------|--------|--------|
| 2026-01-07 | Claude | Initial spec from deep brainstorm |
| 2026-01-07 | Claude | **MAX depth expansion**: Added Phases 6-10 (chunk execution, error panel, cross-refs, slide preview, Zotero) |

---

**Status:** Ready for Review (Expanded)
**Scope:** 10 phases across Sprints 33-36 (~40-45h total)
**Related:**
- UI/UX Design: `UXUI-quarto-support-2026-01-07.md`
- Brainstorm: `BRAINSTORM-editor-polish-quarto-2026-01-07.md`
**Next:** Create v1.15 worktree and begin Phase 1 (YAML autocomplete)
