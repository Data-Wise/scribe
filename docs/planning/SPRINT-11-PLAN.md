# Sprint 11: Academic Features

> **Status:** Ready to Start
> **Effort:** 8 hours estimated
> **Priority:** P1
> **Target Start:** 2024-12-26
> **Prerequisites:** Sprint 10.5 (Theme & Font System) ✅ Complete

---

## Goal

Add academic writing features: Zotero integration, Pandoc export, citation autocomplete, and KaTeX equations.

---

## Success Criteria

- [ ] Zotero integration via Better BibTeX
- [ ] Citation autocomplete (`@cite` triggers suggestion)
- [ ] Pandoc export (LaTeX, PDF, Word)
- [ ] KaTeX equation rendering
- [ ] Tests for all new features
- [ ] CHANGELOG updated
- [ ] .STATUS updated

---

## Tasks

### 1. Zotero Integration (3h)

**Goal:** Read bibliography from Better BibTeX export.

**Files:**
- `src-tauri/src/academic/zotero.rs` (NEW)
- `src-tauri/src/commands.rs` (add Tauri commands)

**Implementation:**
```rust
// Read .bib file from configured path
pub fn read_bibliography(bib_path: &str) -> Result<Vec<Citation>, Error>

// Parse BibTeX entries
pub fn parse_bibtex(content: &str) -> Vec<Citation>

// Citation struct
pub struct Citation {
    pub key: String,      // e.g., "vanderweele2015"
    pub title: String,
    pub authors: Vec<String>,
    pub year: u16,
    pub journal: Option<String>,
}
```

**Tauri Commands:**
- `get_citations` - Return all citations from configured .bib file
- `search_citations` - Filter citations by query

### 2. Citation Autocomplete (2h)

**Goal:** Trigger autocomplete when typing `@`.

**Files:**
- `src/renderer/src/components/CitationAutocomplete.tsx` (NEW)
- `src/renderer/src/components/HybridEditor.tsx` (integrate)

**Implementation:**
```tsx
// Similar to SimpleTagAutocomplete
// Triggers on @ character
// Shows citation key, title, authors, year
// Inserts [@key] on selection
```

**UI:**
```
@vander...
┌─────────────────────────────────────┐
│ vanderweele2015                     │
│   Explanation and Sensitivity       │
│   VanderWeele, Ding (2017)         │
├─────────────────────────────────────┤
│ vanderweele2016                     │
│   Mediation Analysis                │
│   VanderWeele (2016)               │
└─────────────────────────────────────┘
```

### 3. Pandoc Export (2h)

**Goal:** Export notes to LaTeX, PDF, Word.

**Files:**
- `src-tauri/src/academic/pandoc.rs` (NEW)
- `src/renderer/src/components/ExportDialog.tsx` (NEW)

**Implementation:**
```rust
// Execute pandoc command
pub async fn export_document(
    input: &str,
    output_format: ExportFormat,
    bibliography: Option<&str>,
    csl: Option<&str>,
) -> Result<String, Error>

pub enum ExportFormat {
    Latex,
    Pdf,
    Docx,
    Html,
}
```

**Pandoc Command:**
```bash
pandoc input.md -o output.pdf \
  --citeproc \
  --bibliography=refs.bib \
  --csl=apa.csl
```

### 4. KaTeX Equations (1h)

**Goal:** Render LaTeX equations in preview mode.

**Files:**
- `src/renderer/src/components/HybridEditor.tsx` (add KaTeX)

**Implementation:**
```tsx
// Add KaTeX CSS import
import 'katex/dist/katex.min.css';

// Use react-katex for rendering
import { InlineMath, BlockMath } from 'react-katex';

// Detect equation patterns:
// Inline: $...$
// Block: $$...$$
```

**Examples:**
- Inline: `$E = mc^2$` → E = mc²
- Block: `$$\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$`

---

## Dependencies

### npm packages
```bash
npm install katex react-katex
npm install -D @types/katex
```

### User Requirements
- Zotero + Better BibTeX installed
- Pandoc installed (`brew install pandoc`)
- LaTeX for PDF export (`brew install --cask mactex-no-gui`)

---

## Testing Plan

### Unit Tests
- `Zotero.test.ts` - BibTeX parsing
- `Citation.test.tsx` - Autocomplete component
- `Export.test.ts` - Pandoc command generation
- `Equation.test.tsx` - KaTeX rendering

### Integration Tests
- Citation workflow: type `@` → select → insert
- Export workflow: open dialog → select format → export
- Equation rendering in preview mode

### Manual Testing
- [ ] Configure .bib path in settings
- [ ] Type `@` → see citation suggestions
- [ ] Select citation → `[@key]` inserted
- [ ] Export to PDF with citations
- [ ] Export to Word with citations
- [ ] Inline equation renders
- [ ] Block equation renders

---

## Definition of Done

- [ ] Zotero .bib file readable
- [ ] Citation autocomplete works
- [ ] Pandoc export to LaTeX/PDF/Word
- [ ] KaTeX equations render
- [ ] 20+ new tests passing
- [ ] Total tests > 320
- [ ] No console errors
- [ ] CHANGELOG updated
- [ ] .STATUS updated

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Pandoc not installed | Graceful error + installation instructions |
| .bib file not found | Settings dialog to configure path |
| Large bibliography slow | Cache parsed entries |
| KaTeX render errors | Fallback to raw text |

---

## Notes

### Better BibTeX Export
1. Zotero → Preferences → Better BibTeX
2. Export → Auto-export to `~/Zotero/library.bib`
3. Configure path in Scribe settings

### Citation Style
Default to APA 7th edition. CSL files from:
https://www.zotero.org/styles

---

## Follow-up (Sprint 12)

After academic features:
- Obsidian sync
- Project system foundation
- Settings persistence

---

## Related Commits (Sprint 10.5 - Theme & Font System)

```
c1a0313 polish: Category filter tabs, font previews, and 'Use' button
9a8560b polish: Font management UI improvements
3ec70bc feat: Font management with Homebrew installation and ADHD-friendly recommendations
a8557cd feat: Font settings with Homebrew fonts, editable theme shortcuts
bf83a14 feat: URL theme import, font settings, and keyboard shortcuts
b1c5427 feat: Theme import/export with Base16 support and live preview
4ac7aca feat: Add auto-theme by time and custom theme creator
641f5c5 feat: Add 10 ADHD-friendly themes (5 dark, 5 light)
049a16f feat: Default note properties, word goal progress bar, and theme persistence
```

**Current State:**
- 306 tests passing
- TypeScript: 0 errors
- Rust: Compiles (1 dead code warning)
