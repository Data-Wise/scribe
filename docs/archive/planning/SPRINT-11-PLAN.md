# Sprint 11: Academic Features

> **Status:** Ready to Start
> **Effort:** 9 hours estimated
> **Priority:** P1
> **Target Start:** 2024-12-26
> **Prerequisites:** Sprint 10.6 (Panel Menus) ✅ Complete
> **Tests:** 407 passing

---

## Goal

Add academic writing features: Zotero integration, Pandoc export, citation autocomplete, and **powerful math rendering** with interactive editing.

---

## Success Criteria

- [ ] Zotero integration via Better BibTeX
- [ ] Citation autocomplete (`@cite` triggers suggestion)
- [ ] Pandoc export (LaTeX, PDF, Word)
- [ ] MathJax 3 equation rendering (inline & block)
- [ ] Tests for all new features
- [ ] CHANGELOG updated
- [ ] .STATUS updated

---

## Tasks

### 1. Zotero Integration (3h)

**Goal:** Read bibliography from Better BibTeX export.

**Files:**
- `src-tauri/src/academic/zotero.rs` (NEW)
- `src-tauri/src/academic/mod.rs` (NEW)
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
    pub doi: Option<String>,
}
```

**Tauri Commands:**
- `get_citations` - Return all citations from configured .bib file
- `search_citations` - Filter citations by query
- `get_citation_by_key` - Get single citation details

---

### 2. Citation Autocomplete (2h)

**Goal:** Trigger autocomplete when typing `@`.

**Files:**
- `src/renderer/src/components/CitationAutocomplete.tsx` (NEW)
- `src/renderer/src/components/HybridEditor.tsx` (integrate)

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

**Behavior:**
- Trigger on `@` character
- Show citation key, title, authors, year
- Insert `[@key]` on selection (Pandoc citation format)
- Highlight existing citations in editor

---

### 3. Math Rendering — MathJax 3 (2h)

**Goal:** Full LaTeX math rendering with MathJax 3.

**Why MathJax:**
- Full LaTeX compatibility (amsmath, physics, etc.)
- Single dependency (no hybrid complexity)
- Excellent accessibility (screen readers)
- SVG output (crisp at any scale)
- Active development, widely used in academia

**Architecture:**
```
┌─────────────────────────────────────────────────────────┐
│                    Math Pipeline                        │
├─────────────────────────────────────────────────────────┤
│  Input: $\int_0^\infty$  or  $$\sum_{n=1}^N$$          │
│                         ↓                               │
│                  ┌──────────────┐                       │
│                  │   MathJax 3  │                       │
│                  │  (tex2svg)   │                       │
│                  └──────────────┘                       │
│                         ↓                               │
│              Rendered SVG / Error Message               │
└─────────────────────────────────────────────────────────┘
```

**Files:**
- `src/renderer/src/components/MathRenderer.tsx` (NEW)
- `src/renderer/src/components/MarkdownPreview.tsx` (integrate)
- `src/renderer/src/lib/mathjax.ts` (NEW) - config & render

**Implementation:**

```tsx
// lib/mathjax.ts - MathJax configuration
import { mathjax } from 'mathjax-full/js/mathjax'
import { TeX } from 'mathjax-full/js/input/tex'
import { SVG } from 'mathjax-full/js/output/svg'
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages'

const tex = new TeX({ packages: AllPackages })
const svg = new SVG({ fontCache: 'local' })
const adaptor = liteAdaptor()

export function renderMath(latex: string, display: boolean): string {
  const node = mathjax.document('', { InputJax: tex, OutputJax: svg })
  const html = node.convert(latex, { display })
  return adaptor.outerHTML(html)
}
```

```tsx
// MathRenderer.tsx - Display component
interface MathRendererProps {
  tex: string
  display?: boolean  // inline ($) vs block ($$)
}

export function MathRenderer({ tex, display = false }: MathRendererProps) {
  const [html, setHtml] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const rendered = renderMath(tex, display)
      setHtml(rendered)
      setError(null)
    } catch (e) {
      setError(`Math error: ${e.message}`)
    }
  }, [tex, display])

  if (error) {
    return <span className="math-error">{error}</span>
  }

  return (
    <span
      className={display ? 'math-block' : 'math-inline'}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
```

**Supported Syntax:**
| Syntax | Type | Example |
|--------|------|---------|
| `$...$` | Inline | `$E = mc^2$` |
| `$$...$$` | Block | `$$\int_0^\infty e^{-x^2} dx$$` |
| `\begin{align}` | Multi-line | Aligned equations |
| `\begin{cases}` | Piecewise | Conditional functions |
| `\mathbf`, `\mathrm` | Fonts | Bold, roman text |

**MathJax Packages Included:**
- `amsmath` - Aligned equations, matrices
- `amssymb` - Extended symbols
- `physics` - Physics notation
- `cancel` - Strike-through
- `color` - Colored math

---

### 4. Pandoc Export (2h)

**Goal:** Export notes to LaTeX, PDF, Word with citations.

**Files:**
- `src-tauri/src/academic/pandoc.rs` (NEW)
- `src/renderer/src/components/ExportDialog.tsx` (NEW)

**Implementation:**
```rust
pub async fn export_document(
    input: &str,
    output_format: ExportFormat,
    bibliography: Option<&str>,
    csl: Option<&str>,
) -> Result<PathBuf, Error>

pub enum ExportFormat {
    Latex,
    Pdf,
    Docx,
    Html,
}
```

**Export Dialog UI:**
```
┌─────────────────────────────────────┐
│  Export Note                    ✕   │
├─────────────────────────────────────┤
│  Format:  ○ PDF  ○ Word  ○ LaTeX   │
│                                     │
│  Bibliography: ~/Zotero/library.bib │
│  Citation Style: APA 7th           │
│                                     │
│  [ ] Include metadata               │
│  [ ] Process equations              │
│                                     │
│         [Cancel]  [Export]          │
└─────────────────────────────────────┘
```

---

## Dependencies

### npm packages
```bash
# Math rendering (MathJax 3 - full version)
npm install mathjax-full
```

### User Requirements (optional)
- Zotero + Better BibTeX (for citations)
- Pandoc (`brew install pandoc`)
- LaTeX for PDF export (`brew install --cask mactex-no-gui`)

---

## Testing Plan

### Unit Tests
- `Zotero.test.ts` - BibTeX parsing
- `Citation.test.tsx` - Autocomplete component
- `MathRenderer.test.tsx` - MathJax rendering (inline/block)
- `Export.test.ts` - Pandoc command generation

### Integration Tests
- Citation workflow: type `@` → select → insert
- Math workflow: type `$...$` → renders in preview
- Export workflow: open dialog → select format → export

### Manual Testing
- [ ] Configure .bib path in settings
- [ ] Type `@` → see citation suggestions
- [ ] Select citation → `[@key]` inserted
- [ ] Type `$E=mc^2$` → renders inline in preview
- [ ] Type `$$\int...$$` → renders block in preview
- [ ] Complex LaTeX (`\begin{align}`) renders correctly
- [ ] Math errors show helpful message
- [ ] Export to PDF with citations
- [ ] Export to Word with citations

---

## Definition of Done

- [ ] Zotero .bib file readable
- [ ] Citation autocomplete works (`@` trigger)
- [ ] MathJax renders inline `$...$` equations
- [ ] MathJax renders block `$$...$$` equations
- [ ] Complex LaTeX works (`\begin{align}`, etc.)
- [ ] Math errors display gracefully
- [ ] Pandoc export to LaTeX/PDF/Word
- [ ] 25+ new tests passing
- [ ] Total tests > 430
- [ ] No console errors
- [ ] CHANGELOG updated
- [ ] .STATUS updated

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Pandoc not installed | Graceful error + installation instructions |
| .bib file not found | Settings dialog to configure path |
| Large bibliography slow | Cache parsed entries, debounce search |
| MathJax bundle size (~2MB) | Lazy load on first math render |
| MathJax slow first render | Show loading indicator, cache SVG |
| Invalid LaTeX syntax | Show error message with raw text |

---

## Implementation Order

```
Day 1 (3h):
├── npm install mathjax-full
├── MathRenderer component
├── lib/mathjax.ts configuration
└── Integrate into MarkdownPreview

Day 2 (4h):
├── Zotero BibTeX parsing (Rust)
├── Citation autocomplete (@)
└── Highlight citations in editor

Day 3 (2h):
├── Pandoc export dialog
├── Export to PDF/Word/LaTeX
└── Tests & polish
```

---

## Sprint 10.6 Completed (Panel Menus) ✅

Before Sprint 11, we completed:
- **PanelMenu component** using Radix UI
- **Left sidebar menu**: Sort (Name/Modified/Created), View (Default/Compact)
- **Right sidebar menu**: Context-aware per tab
  - Properties: Add property, Collapse all
  - Backlinks: Sort (Name/Date), Toggle outgoing
  - Tags: Sort (A-Z/Count), Bulk edit
- **All preferences persist in localStorage**

---

## Follow-up (Sprint 12)

After academic features:
- Wire up sorting preferences to BacklinksPanel/TagsPanel
- Obsidian sync improvements
- Project system foundation
- Settings persistence (move from localStorage to SQLite)

---

## Notes

### Better BibTeX Export
1. Zotero → Preferences → Better BibTeX
2. Export → Auto-export to `~/Zotero/library.bib`
3. Configure path in Scribe settings

### Citation Style
Default to APA 7th edition. CSL files from:
https://www.zotero.org/styles

### Math Syntax Support (MathJax 3)
| Syntax | Type | Example |
|--------|------|---------|
| `$x^2$` | Inline | Renders in-line with text |
| `$$\int_0^1$$` | Block | Centered, display mode |
| `\begin{align}` | Multi-line | Aligned equations |
| `\begin{cases}` | Piecewise | Conditional functions |
| `\mathbf{x}` | Bold | Vector notation |
| `\frac{a}{b}` | Fraction | Stacked fraction |

---

## Current State

- **Tests:** 407 passing
- **TypeScript:** 0 errors
- **New packages:** @radix-ui/react-dropdown-menu (for panel menus)
