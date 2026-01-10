# SPEC: LaTeX Editor with Overleaf Features

> **Deep Brainstorm: Advanced LaTeX Editing for Scribe**

**Generated:** 2026-01-07
**Status:** Proposal
**Priority:** P1 (Academic Users)

---

## Quick Summary

**Vision:** Transform Scribe into a first-class LaTeX editing environment that rivals Overleaf while staying ADHD-friendly and integrated with Markdown/Quarto workflows.

**Three Approaches:**
1. **Embedded Mode** → Enhanced LaTeX within Markdown (Current + Improvements)
2. **Dedicated Mode** → Full LaTeX document editing (New Feature)
3. **Hybrid Mode** → Switch seamlessly between Markdown and LaTeX

---

## Current State: What Scribe Already Has

### Already Implemented ✅

| Feature | Status | Location |
|---------|--------|----------|
| Inline math `$...$` | ✅ Working | KaTeX rendering |
| Display math `$$...$$` | ✅ Working | KaTeX + StateField |
| Multi-line LaTeX blocks | ✅ Working | Sprint 32 |
| Error highlighting | ✅ Working | LaTeXErrorWidget |
| Cursor-based reveal | ✅ Working | Live Preview mode |
| Reading mode render | ✅ Working | ReactMarkdown + MathRenderer |
| **LaTeX autocomplete** | ✅ Working | `\` trigger in math mode |
| **Live inline editing** | ✅ Working | Click equation → edit in place |

### Missing / Needs Improvement ⚠️

| Feature | Status | Priority |
|---------|--------|----------|
| Symbol palette (visual picker) | ❌ Not started | P2 |
| Snippets library (templates) | ❌ Not started | P2 |
| Full document mode (.tex files) | ❌ Not started | P3 |
| PDF preview pane | ❌ Not started | P3 |
| TeX Live compilation | ❌ Not started | P3 |

---

## Option A: Enhanced Embedded Mode

> **Best for:** Users who primarily write Markdown/Quarto with occasional equations

### What's Already Working ✅

| Feature | How It Works |
|---------|--------------|
| **LaTeX Autocomplete** | Type `\` inside `$...$` or `$$...$$` for symbol suggestions |
| **Live Inline Editing** | Click any equation in Live Preview → cursor reveals source |

### Remaining Quick Wins

| Feature | Effort | Impact |
|---------|--------|--------|
| **Snippet Templates** | 1h | High - Insert matrix, fraction, integral templates via ⌘K |
| **Symbol Palette** | 2h | Medium - Visual grid of Greek letters, operators, arrows |

### Implementation: Snippet Templates

**Access:** Command palette (⌘K) → "Insert LaTeX: Matrix/Fraction/Integral"

```
Templates available:
├── Fraction: \frac{▯}{▯}
├── Integral: \int_{▯}^{▯} ▯ \, d▯
├── Sum: \sum_{▯}^{▯} ▯
├── Matrix: \begin{bmatrix} ▯ & ▯ \\ ▯ & ▯ \end{bmatrix}
├── Cases: \begin{cases} ▯ & \text{if } ▯ \\ ▯ & \text{otherwise} \end{cases}
└── Aligned: \begin{aligned} ▯ &= ▯ \\ &= ▯ \end{aligned}
```

### Implementation: Symbol Palette

**Trigger:** ⌘⌥S or toolbar button

```
┌─────────────────────────────────────┐
│ Symbols                         ✕   │
├─────────────────────────────────────┤
│ [Greek] [Operators] [Arrows] [Logic]│
│                                     │
│  α β γ δ ε ζ η θ ι κ λ μ ν ξ π ρ σ  │
│  τ υ φ χ ψ ω Γ Δ Θ Λ Ξ Π Σ Φ Ψ Ω    │
│                                     │
│  Click to insert at cursor          │
└─────────────────────────────────────┘
```

---

## Option B: Dedicated LaTeX Document Mode

> **Best for:** Users writing full LaTeX documents (articles, theses)

### What This Adds

1. **New File Type:** `.tex` files with full LaTeX support
2. **Document Preamble:** `\documentclass`, packages, macros
3. **Compilation:** Run `pdflatex` or `xelatex` via CLI
4. **PDF Preview:** Live PDF output (like Overleaf)
5. **Bibliography:** BibTeX integration

### Overleaf-Inspired Features

| Overleaf Feature | Scribe Implementation | Effort |
|------------------|----------------------|--------|
| Visual + Code editor toggle | Live Preview + Source mode | ✅ Already have |
| Real-time collaboration | ❌ Out of scope (v2.0) | - |
| Template library | Local templates + Import | Medium |
| TeX Live compilation | Shell command via Tauri | Medium |
| PDF preview pane | Split view with PDF.js | High |
| Error log parsing | Parse LaTeX log files | Medium |
| Auto-save + versioning | Already have | ✅ Already have |

### Architecture: Dedicated Mode

```
┌──────────────────────────────────────────────────────────────────┐
│ Scribe - document.tex                                        ─ □ ✕ │
├──────────────────────────────────────────────────────────────────┤
│ [Source] [Preview] [PDF]                        [Compile] [Settings] │
├────────────────────────────────┬─────────────────────────────────┤
│                                │                                 │
│ \documentclass{article}        │   ┌───────────────────────────┐ │
│ \usepackage{amsmath}           │   │                           │ │
│ \begin{document}               │   │   Rendered PDF Preview    │ │
│                                │   │                           │ │
│ \section{Introduction}         │   │   with live updates       │ │
│                                │   │                           │ │
│ The integral:                  │   │                           │ │
│ \[                             │   └───────────────────────────┘ │
│   \int_0^1 x^2 dx = \frac{1}{3}│                                 │
│ \]                             │                                 │
│                                │                                 │
│ \end{document}                 │                                 │
│                                │                                 │
└────────────────────────────────┴─────────────────────────────────┘
```

### VS Code LaTeX Workshop Features to Include

| Feature | Priority | Notes |
|---------|----------|-------|
| **Intellisense/Autocomplete** | P1 | `\cite{}`, `\ref{}`, `\label{}` |
| **Hover preview** | P1 | Show rendered math on hover |
| **SyncTeX** | P2 | Click PDF → Jump to source |
| **Build on save** | P1 | Auto-compile option |
| **Error parsing** | P1 | Show errors inline |
| **Snippets** | P1 | Common environments |
| **Symbol palette** | P2 | Greek, operators, arrows |
| **Multi-file projects** | P3 | `\input{}`, `\include{}` |

---

## Option C: Hybrid Mode (Recommended)

> **Best for:** Academic users who mix Markdown and LaTeX

### Philosophy

Don't force users to choose. Let them:
1. Write Markdown with embedded LaTeX (default)
2. Switch to "LaTeX Mode" for equation-heavy sections
3. Export to full LaTeX when needed

### Feature Matrix

| Capability | Markdown Mode | LaTeX Mode | Quarto Mode |
|------------|---------------|------------|-------------|
| Inline math `$...$` | ✅ | ✅ | ✅ |
| Display math `$$...$$` | ✅ | ✅ | ✅ |
| Environments `\begin{}`| ✅ (in math) | ✅ | ✅ |
| Document preamble | ❌ | ✅ | ✅ (YAML) |
| BibTeX citations | Via @cite | Via \cite{} | Via @cite |
| Sections/chapters | # Markdown | \section{} | # Markdown |
| Compilation | Pandoc | pdflatex | quarto |
| Output format | PDF/HTML/Word | PDF | PDF/HTML/Word |

### Implementation Strategy

**Phase 1: Enhanced Markdown (Immediate)**
- LaTeX autocomplete
- Symbol palette
- Click-to-edit modal
- Snippet templates

**Phase 2: LaTeX Document Support (Future)**
- `.tex` file type recognition
- Basic compilation
- Error parsing
- PDF preview

**Phase 3: Full Overleaf-like (v2.0)**
- Multi-file projects
- Advanced compilation
- Real-time preview
- Template library

---

## Quick Wins - Start Here!

### Already Done ✅

| Feature | Status |
|---------|--------|
| LaTeX Autocomplete | ✅ Type `\` in math mode for suggestions |
| Live Inline Editing | ✅ Click equation → cursor reveals source |

### 1. Snippet Templates (1 hour)

**Access:** Command palette (⌘K) → "Insert LaTeX Template"

```
Templates:
├── Fraction: \frac{▯}{▯}
├── Integral: \int_{▯}^{▯} ▯ \, d▯
├── Sum: \sum_{▯}^{▯} ▯
├── Matrix: \begin{bmatrix} ▯ & ▯ \\ ▯ & ▯ \end{bmatrix}
├── Cases: \begin{cases} ▯ & \text{if } ▯ \\ ▯ & \text{otherwise} \end{cases}
└── Aligned: \begin{aligned} ▯ &= ▯ \\ &= ▯ \end{aligned}
```

### 2. Symbol Palette (2 hours)

**Trigger:** Button in editor toolbar or `⌘⌥S`
**UI:** Grid of clickable symbols by category

```
┌─────────────────────────────────────┐
│ Symbols                         ✕   │
├─────────────────────────────────────┤
│ [Greek] [Operators] [Arrows] [Logic]│
│                                     │
│  α β γ δ ε ζ η θ ι κ λ μ ν ξ π ρ σ  │
│  τ υ φ χ ψ ω Γ Δ Θ Λ Ξ Π Σ Φ Ψ Ω    │
│                                     │
│  Click to insert at cursor          │
└─────────────────────────────────────┘
```

---

## Long-Term Vision: Overleaf-like Experience

### What Makes Overleaf Great

1. **Zero Setup** → Just start typing LaTeX
2. **Live Preview** → See PDF as you type
3. **Templates** → Start from working examples
4. **Collaboration** → Multiple users edit together
5. **Error Feedback** → Clear error messages
6. **Integration** → Zotero, Mendeley, GitHub

### What Scribe Can Do Better

| Overleaf Pain Point | Scribe Solution |
|---------------------|-----------------|
| Internet required | Fully offline |
| Slow compilation | Local TeX Live |
| No markdown support | First-class Markdown |
| Clunky mobile | Focus on desktop UX |
| Subscription cost | Free & open source |
| Complex UI | ADHD-friendly design |

### Architecture for Full LaTeX Mode

```
┌─────────────────────────────────────────────────────────────────┐
│                         Scribe LaTeX Mode                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   CodeMirror Editor                      │    │
│  │   (with LaTeX language mode, syntax highlighting)        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Compilation Engine                      │    │
│  │   Tauri → Shell → pdflatex/xelatex/lualatex              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    PDF.js Viewer                         │    │
│  │   (SyncTeX, zoom, search, print)                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Dependencies Required

| Feature | Dependency | Size | Notes |
|---------|-----------|------|-------|
| PDF preview | PDF.js | ~2MB | Mozilla's PDF renderer |
| LaTeX highlighting | @codemirror/lang-latex | Small | Already in ecosystem |
| Compilation | TeX Live (system) | ~4GB | User installs separately |
| SyncTeX | synctex (system) | Included | Comes with TeX Live |

---

## ADHD-Friendly Design Considerations

### Keep What Works
- ✅ Single note focus (no tabs)
- ✅ Instant start (< 3 seconds)
- ✅ Auto-save (no lost work)
- ✅ Clean, minimal UI
- ✅ Dark mode default

### Avoid Complexity
- ❌ No complex project management
- ❌ No overwhelming settings
- ❌ No mandatory learning curve
- ❌ No cloud dependencies

### Progressive Disclosure
```
Level 1: Just write (Markdown + inline math)
    ↓
Level 2: Use autocomplete (\ triggers suggestions)
    ↓
Level 3: Use templates (Command palette access)
    ↓
Level 4: Full LaTeX documents (Dedicated mode)
```

---

## Recommended Path Forward

### Already Complete ✅

1. **LaTeX Autocomplete** - Type `\` for symbol suggestions
2. **Live Inline Editing** - Click equation to edit in place

### Next Up (Sprint 33)

3. **Snippet Templates** - Quick insert for common patterns (matrix, cases, aligned)
4. **Symbol Palette** - Visual picker for discovery

### Near-Term (Sprint 34-35)

5. **Hover Preview** - Source mode enhancement (preview on hover)
6. **More Templates** - Expand snippet library based on usage

### Future (v2.0)

7. **Dedicated LaTeX Mode** - Full `.tex` document editing
8. **PDF Preview** - Live compilation output via TeX Live
9. **Template Library** - Article, thesis, presentation starters

---

## Decision Points for User

### Question 1: Primary Use Case

**A)** I mostly write Markdown with occasional equations
→ Focus on **Embedded Mode** enhancements

**B)** I write full LaTeX documents (articles, theses)
→ Invest in **Dedicated LaTeX Mode**

**C)** I use Quarto for academic writing
→ Focus on **Quarto integration** (already good)

### Question 2: Compilation Preference

**A)** I want Scribe to compile LaTeX → PDF
→ Need TeX Live detection and shell commands

**B)** I'll use external tools (VS Code, TeXShop, Overleaf)
→ Focus on editing experience only

### Question 3: Feature Priority (Remaining)

**A)** Snippet templates (faster equation writing) ← Recommended next
**B)** Visual symbol picker (discovery-friendly)
**C)** Full document mode (complete LaTeX support) ← v2.0

---

## References

- [Overleaf Features Overview](https://www.overleaf.com/about/features-overview)
- [VS Code LaTeX Workshop](https://github.com/James-Yu/LaTeX-Workshop)
- [KaTeX Supported Functions](https://katex.org/docs/supported.html)
- Scribe Planning: `docs/planning/SPRINT-32-ADVANCED-LATEX.md`
- Current Implementation: `src/renderer/src/components/CodeMirrorEditor.tsx`

---

## Next Steps

1. [x] ~~**LaTeX Autocomplete**~~ - Already implemented
2. [x] ~~**Live Inline Editing**~~ - Already implemented
3. [ ] **Add Snippet Templates** - Command palette integration (~1h)
4. [ ] **Add Symbol Palette** - Visual picker component (~2h)
5. [ ] **Decide on v2.0 scope** - Full LaTeX mode vs enhanced Markdown

---

**Status:** Ready for Review
**Current State:** Core LaTeX editing complete (autocomplete + live editing)
**Recommended:** Add snippet templates, then evaluate need for dedicated mode
