# Plan: Scribe v2.0 - LaTeX Editor Mode

> **Status:** Draft for Review
> **Created:** 2026-01-07
> **Target:** Scribe v2.0

---

## Executive Summary

**Decision: Plan for v2.0 with Overleaf-like features**

User wants full LaTeX editing experience including:
- Live PDF preview
- Full `.tex` document editing
- Templates library
- Enhanced inline LaTeX editing

This is a major feature requiring architecture changes. Plan as v2.0 milestone.

---

## Current LaTeX Support (v1.14.0)

| Feature | Status |
|---------|--------|
| Inline math `$...$` | ✅ KaTeX rendering |
| Display math `$$...$$` | ✅ Multi-line StateField |
| LaTeX autocomplete | ✅ 87 commands |
| LaTeX snippets | ✅ 42 templates |
| Error highlighting | ✅ LaTeXErrorWidget |
| PDF export | ✅ Pandoc md → PDF |

**v2.0 will add:** Full `.tex` file editing, live PDF preview, templates library.

---

## v2.0 LaTeX Mode - Implementation Plan

### Phase 1: Architecture Foundation (Week 1-2)

**Goal:** Enable multi-format support without breaking existing functionality

#### 1.1 Database Schema Changes
```sql
-- Migration 010: Add file format support
ALTER TABLE notes ADD COLUMN file_format TEXT DEFAULT 'md';
-- Values: 'md', 'tex', 'qmd'
```

**Files to modify:**
- `src-tauri/src/database.rs` - Add file_format column + CRUD updates
- `src/renderer/src/types/index.ts` - Add `file_format` to Note type

#### 1.2 API Layer Updates
- `src/renderer/src/lib/api.ts` - Format-aware dispatching
- `src/renderer/src/lib/browser-api.ts` - IndexedDB schema update

#### 1.3 Editor Factory Pattern
```typescript
// New: EditorFactory component
const EditorFactory = ({ note }) => {
  switch (note.file_format) {
    case 'tex': return <LaTeXEditor note={note} />
    case 'qmd': return <QuartoEditor note={note} />
    default: return <HybridEditor note={note} />
  }
}
```

---

### Phase 2: LaTeX Editor Component (Week 2-3)

**Goal:** Build dedicated `.tex` file editor

#### 2.1 LaTeXEditor Component
**New file:** `src/renderer/src/components/LaTeXEditor.tsx`

Features:
- CodeMirror with `@codemirror/lang-latex` (or custom grammar)
- Full LaTeX syntax highlighting (commands, environments, math)
- Document structure outline (sections, subsections)
- No "Live Preview" mode (not applicable to raw LaTeX)
- Two modes: Source (editing) + PDF Preview (compiled)

#### 2.2 LaTeX Language Support
- Install: `@codemirror/legacy-modes` for LaTeX grammar
- Custom syntax highlighting for `\documentclass`, `\usepackage`, etc.
- Extended autocomplete (environments, packages, BibTeX keys)

---

### Phase 3: TeX Live Compilation (Week 3-4)

**Goal:** Compile `.tex` → PDF within Scribe

#### 3.1 TeX Live Detection
```rust
// src-tauri/src/latex.rs
fn detect_tex_live() -> Option<PathBuf> {
    // Check common paths:
    // /Library/TeX/texbin/pdflatex (MacTeX)
    // /usr/local/texlive/*/bin/*/pdflatex
    // which pdflatex
}
```

#### 3.2 Compilation Command
```rust
async fn compile_latex(tex_path: &Path) -> Result<PdfPath> {
    // pdflatex -interaction=nonstopmode -output-directory=... file.tex
    // Parse log for errors/warnings
    // Return PDF path or error details
}
```

#### 3.3 Log Parser
- Parse `.log` file for errors (line numbers, messages)
- Display inline error markers in editor
- Show warnings in sidebar panel

---

### Phase 4: PDF Preview Pane (Week 4-5)

**Goal:** Live PDF preview alongside editor

#### 4.1 PDF.js Integration
- Add dependency: `pdfjs-dist` (~2MB)
- Create `PDFViewer` component with:
  - Page navigation
  - Zoom controls
  - Search in PDF
  - SyncTeX support (click PDF → jump to source)

#### 4.2 Split View Layout
```
┌─────────────────────────────────────────────────────────────┐
│ [Source] [PDF Preview]                    [Compile] [Export] │
├────────────────────────────┬────────────────────────────────┤
│                            │                                │
│ \documentclass{article}    │   ┌──────────────────────────┐ │
│ \begin{document}           │   │                          │ │
│                            │   │   PDF Rendered Output    │ │
│ \section{Introduction}     │   │                          │ │
│                            │   │                          │ │
│ Text here...               │   └──────────────────────────┘ │
│                            │                                │
│ \end{document}             │   Page 1 of 3  [◀] [▶]  100%   │
│                            │                                │
└────────────────────────────┴────────────────────────────────┘
```

#### 4.3 Auto-Compile on Save
- Debounced compilation (500ms after last keystroke)
- Show "Compiling..." indicator
- Incremental update on success
- Error overlay on failure

---

### Phase 5: Templates Library (Week 5-6)

**Goal:** Quick-start templates for common document types

#### 5.1 Built-in Templates
```
templates/
├── article.tex        # Basic article
├── apa-paper.tex      # APA formatted paper
├── beamer.tex         # Presentation slides
├── thesis.tex         # Thesis/dissertation
├── letter.tex         # Formal letter
└── cv.tex             # Curriculum vitae
```

#### 5.2 Template Picker Modal
- Visual gallery with previews
- Category filters (Academic, Presentation, Personal)
- "Use Template" creates new note with content

#### 5.3 Custom Templates
- Save current document as template
- Project-specific templates in `.scribe/templates/`

---

### Phase 6: Enhanced Inline LaTeX (Week 6)

**Goal:** Improve existing markdown+LaTeX experience

#### 6.1 Quick Wins (from existing spec)
- Snippet templates in command palette (⌘K)
- Symbol palette modal (⌘⌥S)

#### 6.2 Advanced Features
- Hover preview in Source mode
- LaTeX syntax highlighting in markdown code blocks
- BibTeX autocomplete from Zotero library

---

## Worktree Strategy

```bash
# Create v2.0 feature branch
git worktree add ~/.git-worktrees/scribe/latex-v2 -b feat/latex-editor-v2 dev

# Work in phases, merge incrementally:
# Phase 1 → PR to dev (foundation)
# Phase 2 → PR to dev (editor)
# etc.

# Final: dev → main for v2.0 release
```

---

## Dependencies to Add

| Package | Purpose | Size |
|---------|---------|------|
| `pdfjs-dist` | PDF rendering | ~2MB |
| `@codemirror/legacy-modes` | LaTeX syntax | Small |
| None (Rust) | TeX Live detection | N/A |

---

## Testing Strategy

| Phase | Tests | Count |
|-------|-------|-------|
| 1. Schema | Migration, API | ~30 |
| 2. Editor | LaTeXEditor component | ~50 |
| 3. Compile | TeX Live integration | ~20 |
| 4. PDF | Viewer, SyncTeX | ~30 |
| 5. Templates | Gallery, creation | ~20 |
| 6. Inline | Snippets, palette | ~20 |
| **Total** | | ~170 new tests |

---

## Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| 1. Foundation | 2 weeks | Multi-format architecture |
| 2. Editor | 1 week | LaTeXEditor component |
| 3. Compile | 1 week | TeX Live integration |
| 4. PDF | 1 week | Live preview pane |
| 5. Templates | 1 week | Template library |
| 6. Inline | 1 week | Enhanced markdown+LaTeX |
| **Total** | **7 weeks** | Scribe v2.0 with LaTeX |

---

## ADHD Considerations

To maintain ADHD-friendliness despite added complexity:

1. **Clear Mode Separation**
   - Markdown notes stay simple (current behavior)
   - LaTeX mode only when explicitly chosen

2. **Progressive Disclosure**
   - Default: Create markdown note
   - Option: "Create LaTeX Document" in project menu

3. **No Forced Decisions**
   - Existing notes unaffected
   - No migration required for markdown

4. **Visual Distinction**
   - Different icon for `.tex` files
   - Different editor chrome (PDF pane)

---

## Files to Modify/Create

### New Files
- `src/renderer/src/components/LaTeXEditor.tsx`
- `src/renderer/src/components/PDFViewer.tsx`
- `src/renderer/src/components/TemplateGallery.tsx`
- `src/renderer/src/components/SymbolPalette.tsx`
- `src-tauri/src/latex.rs`
- `templates/*.tex` (6+ templates)

### Modified Files
- `src-tauri/src/database.rs` - Schema + migrations
- `src/renderer/src/types/index.ts` - Note type
- `src/renderer/src/lib/api.ts` - Format dispatching
- `src/renderer/src/App.tsx` - EditorFactory routing
- `package.json` - New dependencies
- `CLAUDE.md` - v2.0 documentation

---

## Review Checklist

- [ ] Approve 7-week timeline
- [ ] Confirm priority of phases
- [ ] Validate ADHD considerations
- [ ] Decide: Start immediately or defer?
- [ ] Confirm worktree strategy

---

## Next Steps (After Approval)

1. **Create worktree** for v2.0 LaTeX work
2. **Start Phase 1** - Database schema foundation
3. **Parallel**: Enhance inline LaTeX (quick wins from Phase 6)
