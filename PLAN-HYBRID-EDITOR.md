# Hybrid Editor Plan - PRIORITY 1

**Branch:** `feat/hybrid-editor-milkdown-monaco`
**Created:** 2025-12-31
**Status:** 🎯 ACTIVE - PRIORITY 1
**Type:** Architecture Migration
**Estimated:** 3-4 weeks

---

## 🎯 Strategic Decision

**Supersedes:** Live Editor Enhancements (PLAN-LIVE-EDITOR.md)

**Problem:** CodeMirror Live Preview mode still jerky/buggy after viewport optimization

**Solution:** Migrate to dual-editor architecture:
- **Milkdown** for markdown/Quarto (.md, .qmd) - 10 lines for LaTeX math vs 150 in ProseMirror
- **Monaco** for LaTeX/code (.tex, .R, .py) - proven editor used by Overleaf
- **Automatic routing** by file extension

**Research Completed:**
- ✅ ProseMirror vs Milkdown comparison → Milkdown wins for LaTeX (39% less code)
- ✅ R/Quarto support evaluation → Both need Tauri backend (editor-agnostic)
- ✅ Pure LaTeX in Milkdown → NOT feasible (2000-3000 lines custom parser)
- ✅ Hybrid architecture designed → EditorRouter + dual-editor system

---

## 📋 Related Documents

| Document | Purpose |
|----------|---------|
| `BRAINSTORM-hybrid-editor-2025-12-31.md` | Complete architecture brainstorm |
| `docs/specs/SPEC-hybrid-editor-milkdown-monaco-2025-12-31.md` | Full implementation spec |
| `PROSEMIRROR-VS-MILKDOWN-LATEX.md` | LaTeX editor comparison |
| `R-QUARTO-EDITOR-COMPARISON.md` | R/Quarto capabilities analysis |
| `PURE-LATEX-EDITING-RESEARCH.md` | Why NOT to extend Milkdown for .tex |

---

## 🎯 Primary User Story

> As an academic researcher working on mixed content (papers + code + notes)
> I want files to open in the most appropriate editor automatically
> So that I get:
> - Live markdown preview for notes (.md)
> - R chunk execution for analyses (.qmd)
> - LaTeX PDF preview for papers (.tex)
> - Syntax highlighting for code (.R, .py)
> Without having to configure or switch editors manually.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      EditorRouter                            │
│              (detects file extension)                        │
└─────────────────┬───────────────────────┬───────────────────┘
                  │                       │
      ┌───────────▼──────────┐  ┌────────▼──────────────┐
      │  Milkdown Editor     │  │  Monaco Editor        │
      │  (.md, .qmd)         │  │  (.tex, .R, .py)      │
      └──────────────────────┘  └───────────────────────┘
                  │                       │
      ┌───────────▼──────────┐  ┌────────▼──────────────┐
      │  @milkdown/plugin-   │  │  LaTeX Language       │
      │  math (KaTeX)        │  │  Server (LSP)         │
      │  @milkdown/plugin-   │  │  PDF Preview          │
      │  prism (syntax)      │  │  Auto-compile         │
      └──────────────────────┘  └───────────────────────┘
                  │                       │
                  └───────────┬───────────┘
                              ▼
                  ┌───────────────────────┐
                  │   Tauri Backend       │
                  │   - R execution       │
                  │   - LaTeX compile     │
                  │   - File operations   │
                  └───────────────────────┘
```

---

## ✅ Acceptance Criteria (30+ Checks)

### 1. Automatic Editor Routing
- [ ] Opening .md file loads Milkdown editor
- [ ] Opening .qmd file loads Milkdown editor
- [ ] Opening .tex file loads Monaco editor with LaTeX mode
- [ ] Opening .R file loads Monaco editor with R mode
- [ ] Switching between files switches editors automatically
- [ ] Editor state persists across switches (cursor position, scroll)

### 2. Milkdown Features (.md, .qmd)
- [ ] Live markdown preview with CommonMark support
- [ ] Inline LaTeX math rendering ($...$) via KaTeX
- [ ] Block LaTeX math rendering ($$...$$)
- [ ] Syntax highlighting for code blocks (via Prism)
- [ ] R code chunk execution (Cmd+Enter)
- [ ] Chunk outputs display inline below chunk
- [ ] Wiki links with autocomplete
- [ ] Tag highlighting with autocomplete

### 3. Monaco Features (.tex, .R, .py)
- [ ] Syntax highlighting for LaTeX
- [ ] Syntax highlighting for R
- [ ] Syntax highlighting for Python
- [ ] Code folding
- [ ] Bracket matching
- [ ] Auto-completion
- [ ] Minimap (optional, configurable)
- [ ] Line numbers

### 4. LaTeX PDF Preview (.tex only)
- [ ] PDF preview pane (side-by-side or below)
- [ ] Auto-compile on save (debounced 2-3s)
- [ ] Manual compile button (Cmd+B)
- [ ] Compilation errors displayed inline
- [ ] PDF viewer with zoom controls
- [ ] PDF viewer with page navigation
- [ ] PDF viewer with print button

### 5. State Management
- [ ] Zustand store tracks currentFile (path, content, editorType, isDirty)
- [ ] Milkdown instance persists across file switches
- [ ] Monaco instance persists across file switches
- [ ] Cursor position saved per file
- [ ] Scroll position saved per file
- [ ] Unsaved changes warning on switch

---

## 📦 Dependencies

### Frontend Packages

```json
{
  "@milkdown/core": "^7.x",
  "@milkdown/preset-commonmark": "^7.x",
  "@milkdown/plugin-math": "^7.x",
  "@milkdown/plugin-prism": "^7.x",
  "@milkdown/react": "^7.x",
  "@monaco-editor/react": "^4.6.0",
  "monaco-editor": "^0.45.0",
  "react-pdf": "^7.7.0",
  "katex": "^0.16.0",
  "prismjs": "^1.29.0"
}
```

### Backend (Tauri)

```toml
[dependencies]
# Existing Tauri dependencies
# No new dependencies required for basic implementation
```

### System Requirements

- **LaTeX Distribution:** TeX Live or MacTeX (for pdflatex, xelatex)
- **R:** For R chunk execution (optional, only for .qmd files)

---

## 📅 Implementation Timeline

### Week 1: Foundation (5-7 days)
- [ ] **Day 1-2:** Create EditorRouter component
  - File extension detection
  - Route to appropriate editor
  - Basic state management (Zustand)
- [ ] **Day 3-4:** Integrate Milkdown editor
  - Install dependencies
  - Basic markdown rendering
  - Math plugin (@milkdown/plugin-math)
- [ ] **Day 5-7:** Integrate Monaco editor
  - Install dependencies
  - LaTeX syntax highlighting
  - R syntax highlighting
  - Basic code editing

### Week 2: LaTeX Features (5 days)
- [ ] **Day 8-9:** LaTeX compilation backend
  - Tauri command: `compile_latex`
  - pdflatex/xelatex support
  - Error parsing
- [ ] **Day 10-11:** PDF preview
  - react-pdf integration
  - Side-by-side layout
  - Zoom/page controls
- [ ] **Day 12:** Auto-compile on save
  - Debounced compilation (2-3s)
  - Manual compile button (Cmd+B)

### Week 3: Quarto + R (5 days)
- [ ] **Day 13-14:** R chunk execution
  - Tauri command: `execute_r_chunk`
  - Capture stdout/stderr
  - Capture plots (base64 PNG)
- [ ] **Day 15-16:** Inline output display
  - Output renderer component
  - Plot display
  - Table formatting
- [ ] **Day 17:** Keyboard shortcuts
  - Cmd+Enter: Run chunk
  - Cmd+Shift+Enter: Run all chunks

### Week 4: Polish & Testing (3-5 days)
- [ ] **Day 18-19:** UX improvements
  - Editor state persistence
  - Cursor/scroll restoration
  - Unsaved changes warnings
- [ ] **Day 20-21:** Testing
  - Unit tests for EditorRouter
  - Integration tests for file switching
  - E2E tests for each editor
- [ ] **Day 22:** Documentation
  - User guide for hybrid editor
  - Developer docs for architecture
  - Update CLAUDE.md

**Total: 3-4 weeks to v1.0**

---

## 🚀 Quick Wins (Immediate Value)

1. **EditorRouter (Day 1)** - Core routing logic, file extension detection
2. **Milkdown Math (Day 4)** - LaTeX math rendering in markdown notes
3. **Monaco LaTeX (Day 7)** - Syntax highlighting for .tex files
4. **PDF Preview (Day 11)** - Side-by-side LaTeX editing

---

## 🎨 State Management (Zustand)

```typescript
interface EditorStore {
  currentFile: {
    path: string | null
    content: string
    editorType: 'milkdown' | 'monaco' | 'text'
    isDirty: boolean
    lastSaved: number
  }

  milkdown: {
    instance: MilkdownEditor | null
    cursorPosition: number
    scrollPosition: number
  }

  monaco: {
    instance: MonacoEditor | null
    language: string
    pdfPath: string | null
    isCompiling: boolean
  }

  // Actions
  setCurrentFile: (file: { path: string; content: string }) => void
  updateContent: (content: string) => void
  setDirty: (isDirty: boolean) => void
  saveMilkdownState: (cursor: number, scroll: number) => void
  saveMonacoState: (instance: MonacoEditor) => void
  compileLaTeX: () => Promise<void>
}
```

---

## 🔧 Tauri Commands

```rust
// LaTeX compilation
#[tauri::command]
async fn compile_latex(
    file_path: String,
    engine: String  // "pdflatex" | "xelatex" | "lualatex"
) -> Result<CompilationResult, String>

// R chunk execution
#[tauri::command]
async fn execute_r_chunk(
    code: String,
    working_dir: String
) -> Result<RChunkOutput, String>

// R session management
#[tauri::command]
async fn restart_r_session() -> Result<(), String>
```

---

## 🎯 Success Metrics

1. **Smooth file switching** - < 100ms transition between editors
2. **LaTeX PDF preview** - Compilation + display in < 2 seconds
3. **R chunk execution** - Results appear < 1 second (simple code)
4. **State persistence** - Cursor/scroll restored 100% accurately
5. **No regressions** - All existing markdown editing features work

---

## 📊 Code Reduction

| Task | ProseMirror | Milkdown | Reduction |
|------|-------------|----------|-----------|
| LaTeX Math | 150 lines | 10 lines | **93%** |
| Code Highlighting | 180 lines | 100 lines | **44%** |
| R Chunk Execution | 520 lines | 420 lines | **19%** |
| **Total** | **850 lines** | **520 lines** | **39%** |

---

## ⚠️ Open Questions

1. **Monaco Lazy Loading?**
   - **Q:** Load Monaco only when .tex file opened?
   - **A:** ✅ YES - lazy load to save ~3MB on initial bundle

2. **LaTeX Compilation Frequency?**
   - **Q:** Auto-compile on every keystroke? On save? Manual only?
   - **A:** ✅ Debounced auto-compile (2-3s after last edit) + manual Cmd+B

3. **R Session Management?**
   - **Q:** Persistent session per file? Global session? New session per chunk?
   - **A:** ✅ Persistent session per file + "Restart R Session" button

4. **PDF Viewer Library?**
   - **Q:** Use react-pdf or embed PDF in iframe?
   - **A:** ✅ react-pdf for better UX (zoom, print, page navigation)

5. **Markdown Mode Toggle?**
   - **Q:** Keep Source/Live/Reading modes in Milkdown?
   - **A:** ✅ YES - Milkdown default is "Live Preview", add Source mode toggle

---

## 🔗 Implementation Reference

See full specification: `docs/specs/SPEC-hybrid-editor-milkdown-monaco-2025-12-31.md`

- Complete API design
- Data models
- UI/UX specifications
- User flows
- Accessibility requirements
- Review checklist

---

## 📝 History

- **2025-12-31:** Plan created after comprehensive research
  - Evaluated ProseMirror vs Milkdown for LaTeX
  - Evaluated R/Quarto support
  - Rejected pure LaTeX in Milkdown (too complex)
  - Designed dual-editor hybrid architecture
  - Generated full specification document
  - **Marked PRIORITY 1**
