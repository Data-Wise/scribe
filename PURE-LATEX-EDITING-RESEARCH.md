# Pure LaTeX Live Editing in Milkdown: Feasibility Study

**Date:** 2025-12-31
**Question:** Can Milkdown be extended for pure LaTeX document editing?
**Context:** Academic users may want to write .tex files, not just markdown

---

## Executive Summary

**Short Answer: No, Milkdown is NOT suitable for pure LaTeX editing**

**Why:**
- ❌ Milkdown is **markdown-first** - architecture assumes markdown syntax
- ❌ LaTeX has fundamentally different syntax (commands, environments, brackets)
- ❌ No LaTeX parser in ProseMirror/Milkdown ecosystem
- ❌ Live preview would require full TeX engine (pdflatex, xelatex)
- ❌ Would be fighting the framework (like using Quill for markdown)

**Better Options:**
- ✅ **CodeMirror 6** with LaTeX mode (what VSCode uses)
- ✅ **Monaco Editor** (VSCode's editor, used by Overleaf)
- ✅ Hybrid: Markdown in Milkdown, LaTeX in separate CodeMirror panel

**Recommendation: Keep Milkdown for markdown, add CodeMirror panel for .tex files**

---

## What is "Pure LaTeX Editing"?

### Example LaTeX Document

```latex
\documentclass[12pt]{article}
\usepackage{amsmath}
\usepackage{graphicx}
\usepackage{natbib}

\title{Statistical Methods for Causal Inference}
\author{John Doe}
\date{\today}

\begin{document}

\maketitle

\begin{abstract}
This paper investigates...
\end{abstract}

\section{Introduction}

Recent advances in causal inference \citep{pearl2009} have shown...

\subsection{Motivation}

Consider the structural equation model:
\begin{align}
Y &= \alpha + \beta X + \epsilon \\
X &= \gamma Z + \delta
\end{align}

\section{Methods}

We use the following estimator:
\begin{equation}
\hat{\theta} = \frac{\sum_{i=1}^n (Y_i - \bar{Y})(X_i - \bar{X})}{\sum_{i=1}^n (X_i - \bar{X})^2}
\label{eq:estimator}
\end{equation}

See Equation~\ref{eq:estimator} for details.

\begin{figure}[htbp]
\centering
\includegraphics[width=0.8\textwidth]{figures/plot.pdf}
\caption{Scatter plot of results}
\label{fig:scatter}
\end{figure}

\bibliographystyle{apalike}
\bibliography{references}

\end{document}
```

**Key LaTeX Features:**
1. Commands: `\section{}`, `\cite{}`, `\ref{}`
2. Environments: `\begin{equation}...\end{equation}`
3. Packages: `\usepackage{amsmath}`
4. Cross-references: `\label{}`, `\ref{}`
5. Citations: `\cite{}`, `\citep{}`
6. Document structure: preamble, body, bibliography

**These are NOT markdown concepts** - completely different syntax.

---

## Can Milkdown Handle Pure LaTeX?

### Architecture Analysis

**Milkdown's Core Assumption:**
```typescript
// Milkdown expects MARKDOWN input
const editor = Editor.make()
  .use(commonmark)  // ← Markdown parser
  .create()

// Input: Markdown
editor.action((ctx) => {
  ctx.get(editorViewCtx).updateState(
    ctx.get(parserCtx)('# Hello **world**')  // ← Markdown syntax
  )
})
```

**LaTeX would need:**
```typescript
// LaTeX parser (DOES NOT EXIST in Milkdown ecosystem)
const editor = Editor.make()
  .use(latex)  // ← No such plugin exists
  .create()

// Input: LaTeX
editor.action((ctx) => {
  ctx.get(editorViewCtx).updateState(
    ctx.get(latexParserCtx)('\\section{Hello \\textbf{world}}')  // ← LaTeX syntax
  )
})
```

**Problem: No LaTeX parser for ProseMirror/Milkdown**

---

## Fundamental Incompatibilities

### 1. Syntax Paradigm

**Markdown (Milkdown's native):**
```markdown
# Section
**bold** text
[link](url)
![image](path)
```

**LaTeX:**
```latex
\section{Section}
\textbf{bold} text
\href{url}{link}
\includegraphics{path}
```

**Incompatibility:** Completely different command structures

### 2. Document Structure

**Markdown:**
- Flat structure (headers create hierarchy)
- No preamble/setup
- Self-contained

**LaTeX:**
- Explicit structure (`\documentclass`, `\begin{document}`)
- Preamble with packages
- External files (bibliography, figures)

**Incompatibility:** Milkdown has no concept of preamble

### 3. Cross-References

**Markdown:**
```markdown
See [](#section-id) for details
```

**LaTeX:**
```latex
\label{sec:intro}
See Section~\ref{sec:intro} for details
```

**Incompatibility:** LaTeX `\label`/`\ref` requires compilation to resolve

### 4. Math Environments

**Markdown (Milkdown with math plugin):**
```markdown
Inline: $E = mc^2$
Block: $$E = mc^2$$
```

**LaTeX:**
```latex
Inline: $E = mc^2$
Equation: \begin{equation} E = mc^2 \label{eq:einstein} \end{equation}
Aligned: \begin{align} x &= 1 \\ y &= 2 \end{align}
```

**Incompatibility:** LaTeX math environments are richer, require `\label` support

### 5. Live Preview

**Markdown (Milkdown):**
- Parse markdown → ProseMirror document tree → Render instantly
- No external compilation needed

**LaTeX:**
- Parse LaTeX → Run pdflatex/xelatex → Generate PDF → Display
- Requires TeX engine (slow, external dependency)

**Incompatibility:** Can't do instant live preview like markdown

---

## Existing Solutions for LaTeX Editing

### 1. Overleaf (Web-based)

**Architecture:**
```
Monaco Editor (VSCode) ← LaTeX syntax highlighting
       ↓
Node.js Backend
       ↓
TeX Live (pdflatex)
       ↓
PDF Preview (pdfjs)
```

**Features:**
- ✅ Full LaTeX support (all packages)
- ✅ Live PDF preview (~2-5 second compile)
- ✅ Syntax highlighting
- ✅ Auto-completion
- ✅ Error highlighting
- ✅ Collaboration (real-time editing)

**Editor:** Monaco (VSCode's editor, NOT ProseMirror/Milkdown)

### 2. VSCode + LaTeX Workshop

**Architecture:**
```
VSCode (Monaco Editor) ← LaTeX language server
       ↓
LaTeX Workshop Extension
       ↓
TeX Live (pdflatex/latexmk)
       ↓
PDF Preview (built-in)
```

**Features:**
- ✅ Full LaTeX support
- ✅ IntelliSense (auto-complete)
- ✅ Syntax checking (ChkTeX)
- ✅ Live PDF preview
- ✅ Forward/inverse search (SyncTeX)
- ✅ Snippet support

**Editor:** Monaco (NOT ProseMirror/Milkdown)

### 3. TeXstudio (Desktop)

**Architecture:**
```
Custom Qt Editor ← LaTeX syntax highlighting
       ↓
Integrated TeX engine
       ↓
PDF Preview (embedded)
```

**Features:**
- ✅ Full LaTeX support
- ✅ Live preview
- ✅ Structure view
- ✅ Auto-completion
- ✅ Bibliography management

**Editor:** Custom Qt-based (NOT web-based)

### 4. LyX (WYSIWYM)

**Architecture:**
```
Custom Editor (WYSIWYM) ← Visual editing
       ↓
LaTeX Export
       ↓
TeX engine
       ↓
PDF
```

**Features:**
- ✅ Visual editing (not pure LaTeX)
- ✅ Generates LaTeX behind scenes
- ✅ Math editor
- ✅ Table editor

**Editor:** Custom (NOT markdown-based)

**Pattern: None use ProseMirror/Milkdown**

---

## Could Milkdown Be Extended for LaTeX?

### Option A: Write LaTeX Parser for ProseMirror

**What's needed:**
```typescript
import { Schema, Node } from 'prosemirror-model'

// Define LaTeX schema
const latexSchema = new Schema({
  nodes: {
    doc: { content: "preamble body" },

    // Preamble nodes
    preamble: { content: "usepackage* documentclass" },
    documentclass: { attrs: { class: {}, options: {} } },
    usepackage: { attrs: { name: {}, options: {} } },

    // Body nodes
    body: { content: "block+" },
    section: { attrs: { title: {} }, content: "block*" },
    subsection: { attrs: { title: {} }, content: "block*" },
    paragraph: { content: "inline*" },

    // Math nodes
    equation: { attrs: { label: {}, content: {} } },
    align: { attrs: { content: {} } },

    // References
    cite: { attrs: { key: {} } },
    ref: { attrs: { key: {} } },
    label: { attrs: { key: {} } },

    // Figures
    includegraphics: { attrs: { path: {}, width: {}, caption: {}, label: {} } },

    text: { group: "inline" }
  },

  marks: {
    textbf: {},     // \textbf{}
    textit: {},     // \textit{}
    emph: {}        // \emph{}
  }
})
```

**Implementation effort:** 2000-3000 lines (massive undertaking)

**Problems:**
1. ❌ LaTeX syntax is context-dependent (can't parse incrementally)
2. ❌ LaTeX has infinite extensibility (custom commands)
3. ❌ Would need to reimplement TeX parser (extremely complex)
4. ❌ Live preview still requires TeX engine (slow)
5. ❌ Would be unmaintainable

**Verdict: Not feasible**

### Option B: Use CodeMirror for LaTeX, Milkdown for Markdown

**Architecture:**
```
Scribe App
   ├── Milkdown Editor (for .md, .qmd files)
   │   - Markdown editing
   │   - Live preview
   │   - Math with KaTeX
   │
   └── CodeMirror Editor (for .tex files)
       - LaTeX syntax highlighting
       - Auto-completion
       - Error checking
       - PDF preview panel
```

**Implementation:**
```typescript
// File: src/renderer/src/components/EditorSwitch.tsx

export const EditorSwitch = ({ filePath, content, onChange }) => {
  const fileExtension = filePath.split('.').pop()

  if (fileExtension === 'tex') {
    return (
      <LaTeXEditor
        content={content}
        onChange={onChange}
        onCompile={async () => {
          // Call Tauri backend to run pdflatex
          const pdfPath = await invoke('compile_latex', { texPath: filePath })
          return pdfPath
        }}
      />
    )
  }

  if (fileExtension === 'md' || fileExtension === 'qmd') {
    return (
      <MilkdownEditor
        content={content}
        onChange={onChange}
      />
    )
  }

  return <TextEditor content={content} onChange={onChange} />
}
```

**LaTeX Editor Component (CodeMirror 6):**
```typescript
// File: src/renderer/src/components/LaTeXEditor.tsx

import { EditorView, keymap } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { latex } from '@codemirror/lang-latex'  // LaTeX language support
import { autocompletion } from '@codemirror/autocomplete'
import { linter, lintGutter } from '@codemirror/lint'

export const LaTeXEditor = ({ content, onChange, onCompile }) => {
  const editorRef = useRef(null)

  useEffect(() => {
    const state = EditorState.create({
      doc: content,
      extensions: [
        latex(),  // ← LaTeX syntax highlighting
        autocompletion({
          override: [
            // Custom LaTeX completions
            latexCompletions
          ]
        }),
        linter(latexLinter),  // ChkTeX integration
        lintGutter(),
        keymap.of([
          {
            key: 'Cmd-Shift-b',
            run: () => {
              onCompile()
              return true
            }
          }
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString())
          }
        })
      ]
    })

    const view = new EditorView({
      state,
      parent: editorRef.current
    })

    return () => view.destroy()
  }, [])

  return (
    <div className="latex-editor-container">
      <div ref={editorRef} className="latex-editor" />
      <PDFPreview pdfPath={pdfPath} />
    </div>
  )
}
```

**LaTeX Compilation Backend (Tauri):**
```rust
// File: src-tauri/src/latex.rs

use std::process::Command;

#[tauri::command]
pub async fn compile_latex(tex_path: String) -> Result<String, String> {
    // Run pdflatex
    let output = Command::new("pdflatex")
        .args(&[
            "-interaction=nonstopmode",
            "-output-directory=/tmp",
            &tex_path
        ])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    // Return PDF path
    let pdf_path = tex_path.replace(".tex", ".pdf");
    Ok(pdf_path)
}

#[tauri::command]
pub async fn run_chktex(tex_path: String) -> Result<Vec<LatexWarning>, String> {
    // Run ChkTeX for syntax checking
    let output = Command::new("chktex")
        .args(&["-q", "-v0", &tex_path])
        .output()
        .map_err(|e| e.to_string())?;

    // Parse warnings
    let warnings = parse_chktex_output(&output.stdout);
    Ok(warnings)
}
```

**Verdict: This works! Keep editors separate.**

---

## Comparison: Pure LaTeX Editing Options

| Feature | Milkdown + LaTeX Parser | CodeMirror 6 + LaTeX | Monaco (Overleaf-like) |
|---------|------------------------|---------------------|----------------------|
| **Implementation** | | | |
| Effort | 2000-3000 lines (parser) | 200-300 lines | 200-300 lines |
| Complexity | Very High | Low | Low |
| Feasibility | ❌ Not realistic | ✅ Proven | ✅ Proven |
| **Features** | | | |
| Syntax highlighting | Need custom | ✅ `@codemirror/lang-latex` | ✅ Built-in |
| Auto-completion | Need custom | ✅ Available | ✅ Excellent |
| Error checking | Need custom | ✅ ChkTeX integration | ✅ ChkTeX integration |
| Live preview | Need TeX engine | ✅ Call pdflatex | ✅ Call pdflatex |
| **Performance** | | | |
| Edit latency | Unknown (untested) | < 5ms | < 5ms |
| Compile time | 2-10 seconds | 2-10 seconds | 2-10 seconds |
| **Maintenance** | | | |
| Custom code | 2000-3000 lines | 200-300 lines | 200-300 lines |
| Dependencies | Custom parser | CodeMirror 6 | Monaco |
| Updates | DIY | Community | Microsoft |
| **Integration** | | | |
| Works with Milkdown | Yes (same app) | Yes (separate panel) | Yes (separate panel) |
| Shared features | Yes | Some | Some |

**Winner: CodeMirror 6** (proven, low effort, maintainable)

---

## Recommended Architecture for Scribe

### Dual-Editor System

```
┌─────────────────────────────────────────────────────────┐
│                    Scribe Application                    │
├─────────────────────────────────────────────────────────┤
│  File Type Detection                                     │
│  - .md, .qmd  → Milkdown Editor                         │
│  - .tex       → CodeMirror LaTeX Editor                 │
│  - .R         → CodeMirror R Editor                      │
│  - .py        → CodeMirror Python Editor                │
└─────────────────────────────────────────────────────────┘
         ├─────────────────────┬──────────────────────┐
         ▼                     ▼                      ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Milkdown Editor  │  │ CodeMirror Editor│  │ CodeMirror Editor│
│                  │  │                  │  │                  │
│ - Markdown       │  │ - LaTeX          │  │ - R              │
│ - Quarto         │  │ - pdflatex       │  │ - Python         │
│ - Math (KaTeX)   │  │ - ChkTeX         │  │ - Julia          │
│ - Citations      │  │ - BibTeX         │  │                  │
│ - Live Preview   │  │ - PDF Preview    │  │ - Execute chunks │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### Benefits

1. ✅ **Best tool for each job**
   - Milkdown: Markdown/Quarto (its strength)
   - CodeMirror: LaTeX (proven with VSCode)

2. ✅ **No framework fighting**
   - Don't force Milkdown to do LaTeX
   - Use CodeMirror's LaTeX mode (already exists)

3. ✅ **Easier maintenance**
   - 200-300 lines vs 2000-3000 lines
   - Use community plugins

4. ✅ **Better UX**
   - LaTeX users expect LaTeX editor (like VSCode)
   - Markdown users expect live preview (like Obsidian)

5. ✅ **Incremental rollout**
   - Ship Milkdown for markdown first
   - Add LaTeX editor later if needed

---

## Implementation Plan: Dual-Editor System

### Phase 1: Milkdown for Markdown (Week 1-2)

**Already planned:**
- Migrate from CodeMirror to Milkdown
- Add math plugin
- Add R/Quarto support

### Phase 2: CodeMirror for LaTeX (Week 3-4, Optional)

**If users request LaTeX editing:**

```typescript
// src/renderer/src/components/LatexEditor.tsx

import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { latex } from '@codemirror/lang-latex'
import { invoke } from '@tauri-apps/api/tauri'

export const LatexEditor = ({ content, onChange }) => {
  const [pdfPath, setPdfPath] = useState<string | null>(null)
  const [compiling, setCompiling] = useState(false)

  const compileLatex = async () => {
    setCompiling(true)
    try {
      const pdf = await invoke('compile_latex', { content })
      setPdfPath(pdf)
    } catch (error) {
      console.error('LaTeX compilation failed:', error)
    } finally {
      setCompiling(false)
    }
  }

  return (
    <div className="latex-editor-layout">
      <div className="latex-editor-pane">
        <CodeMirrorEditor
          content={content}
          onChange={onChange}
          language={latex()}
        />
        <button onClick={compileLatex} disabled={compiling}>
          {compiling ? 'Compiling...' : 'Compile PDF (Cmd+Shift+B)'}
        </button>
      </div>

      <div className="latex-preview-pane">
        {pdfPath && <PDFViewer pdfPath={pdfPath} />}
      </div>
    </div>
  )
}
```

**Tauri Backend:**
```rust
#[tauri::command]
pub async fn compile_latex(content: String) -> Result<String, String> {
    // Write to temp file
    let temp_dir = std::env::temp_dir();
    let tex_file = temp_dir.join("temp.tex");
    std::fs::write(&tex_file, content).map_err(|e| e.to_string())?;

    // Compile with pdflatex
    let output = Command::new("pdflatex")
        .args(&[
            "-interaction=nonstopmode",
            "-output-directory",
            temp_dir.to_str().unwrap(),
            tex_file.to_str().unwrap()
        ])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    // Return PDF path
    Ok(temp_dir.join("temp.pdf").to_str().unwrap().to_string())
}
```

**Implementation time: 3-5 days**

---

## Research: Existing LaTeX Parsers

### 1. LaTeX.js (Pure JavaScript)

**URL:** https://latex.js.org/
**What it does:** Parses LaTeX and renders to HTML (not PDF)

**Pros:**
- ✅ Pure JavaScript (no pdflatex needed)
- ✅ Fast rendering
- ✅ Works in browser

**Cons:**
- ❌ Limited LaTeX support (subset only)
- ❌ No package support
- ❌ Not a full TeX engine
- ❌ Can't handle complex documents

**Verdict:** Not suitable for academic LaTeX (too limited)

### 2. ProseMirror-LaTeX (Doesn't exist)

**Searched GitHub:** No ProseMirror LaTeX parser exists

**Similar projects:**
- prosemirror-math (inline math only, uses KaTeX)
- prosemirror-tables (not LaTeX tables)

**Verdict:** Would need to build from scratch (2000+ lines)

### 3. SwiftLaTeX (WebAssembly TeX)

**URL:** https://www.swiftlatex.com/
**What it does:** Compiles LaTeX to PDF in browser using WebAssembly

**Architecture:**
```
LaTeX Input
    ↓
XeTeX compiled to WASM
    ↓
PDF Output (in browser)
```

**Pros:**
- ✅ Full LaTeX support (real TeX engine)
- ✅ Works in browser (no backend needed)
- ✅ Fast (1-3 seconds)

**Cons:**
- ⚠️ Large bundle size (~30MB WASM)
- ⚠️ Still needs LaTeX editor (not provided)
- ⚠️ Would still use CodeMirror for editing

**Verdict:** Could use for compilation, but still need CodeMirror editor

---

## Final Recommendation

### Don't Extend Milkdown for LaTeX

**Why:**
1. ❌ Architecture mismatch (markdown ≠ LaTeX)
2. ❌ 2000-3000 lines custom parser (unmaintainable)
3. ❌ No community support (you'd be alone)
4. ❌ Fighting the framework
5. ❌ Better solutions exist (CodeMirror)

### Use Dual-Editor System

**Recommendation:**
- **Milkdown** for markdown/Quarto (.md, .qmd)
- **CodeMirror 6** for LaTeX (.tex)

**Benefits:**
- ✅ 200 lines vs 2000+ lines
- ✅ Proven solutions (VSCode uses this)
- ✅ Community support
- ✅ Easier maintenance
- ✅ Better UX (LaTeX users expect LaTeX editor)

### Implementation Priority

**Phase 1 (Now):** Milkdown for markdown + R/Quarto
**Phase 2 (Later, if requested):** CodeMirror for LaTeX

**Don't build LaTeX editor unless users explicitly request it.**

---

## Appendix: Why Overleaf Uses Monaco, Not ProseMirror

**Overleaf's editor choice:**
- Monaco Editor (VSCode's editor)
- NOT ProseMirror
- NOT Milkdown

**Why Monaco for LaTeX:**
1. ✅ Built for code editing (not rich text)
2. ✅ Excellent syntax highlighting
3. ✅ Language servers (LSP support)
4. ✅ Auto-completion
5. ✅ Error checking
6. ✅ Large file performance

**Why NOT ProseMirror:**
1. ❌ Built for structured documents (markdown, rich text)
2. ❌ Not optimized for code
3. ❌ No LaTeX language support
4. ❌ Would need custom parser

**Lesson: Use the right tool for the job**

---

## Conclusion

**Can Milkdown be extended for pure LaTeX editing?**

**Technical answer:** Yes, but you'd need to write a 2000-3000 line LaTeX parser and fight the framework.

**Practical answer:** No, don't do it. Use CodeMirror 6 with `@codemirror/lang-latex` instead.

**Recommended architecture:**
```
Scribe App
  ├── Milkdown (for .md, .qmd) ← BEST for markdown
  └── CodeMirror (for .tex)    ← BEST for LaTeX
```

**Implementation:**
- Milkdown migration: 5-7 days (already planned)
- LaTeX editor: 3-5 days (optional, add later if users request)

**This gives you the best of both worlds without fighting either framework.**
