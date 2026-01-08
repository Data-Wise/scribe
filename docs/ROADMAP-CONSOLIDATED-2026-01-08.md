# Scribe Development Roadmap - Consolidated

> **Generated:** 2026-01-08
> **Status:** Active Planning Document
> **Current Version:** v1.14.0
> **Next Release:** v1.15.0 (Quarto Enhancements)

---

## Git Workflow Strategy

```
main (protected) ← PR from dev only
  └── dev (planning/merging) ← PR from feature branches
       ├── feat/quarto-v115 (worktree: ~/.git-worktrees/scribe/quarto-v115) ✅ ACTIVE
       └── feat/latex-editor-v2 (worktree: ~/.git-worktrees/scribe/latex-v2) 📋 PLANNED
```

**Principles:**
- Main branch is protected - PRs from dev only
- Dev branch is the integration/planning branch
- Feature branches work in dedicated worktrees
- Merge to dev when phases/sprints complete
- Merge to main for releases only

---

## Current State: v1.14.0 Released ✅

**Released:** 2026-01-07
**Branch:** main (tagged)
**Tests:** 1,984 passing (30 WikiLink E2E)

**Features:**
- Single-click WikiLink Navigation (Live/Reading modes)
- Cmd+Click navigation in Source mode
- Mode preservation in backlinks panel
- Cursor indicator when Cmd held

### Sidebar & AI Features (Complete - PR #5 Merged)

**Status:** ✅ All UI Complete (Dec 28 - Jan 2)
**Details:** See `docs/planning/IMPLEMENTATION-STATUS-2026-01-08.md`

**Right Sidebar - 6 Tabs:**
- [x] Properties, Backlinks, Tags (existing)
- [x] Stats Tab (Option A) - Merged HudPanel ✅
- [x] Claude Tab (Option H) - Full chat + @ references ✅
- [x] Terminal Tab (Option J) - xterm.js, PTY backend v2 ✅

**Quick Chat:**
- [x] Status bar sparkles icon (⌘J) ✅
- [x] Quick Chat popover (Option I) ✅

**Left Sidebar:**
- [x] Phase 1: Editor Tabs with gradient accent ✅
- [ ] Phase 2-4: Vault Sidebar, Status Bar (pending)

**Claude Tab Features (Complete):**
- @ References - Type `@note-name` to include in context
- Markdown rendering - Code blocks with copy button
- Conversation export - Download as markdown
- Chat history persistence - Migration 009 database

**Pending (Quick Wins):**
- [ ] Wire Tauri AI backend (2-3h) - Connect Claude/Gemini CLI
- [ ] Terminal PTY backend (2-3h) - Full shell access
- [ ] Option G: Ambient AI (4-5h) - ⌘K everywhere (future)

---

## Active Development: v1.15 Quarto Enhancements

**Branch:** `feat/quarto-v115`
**Worktree:** `~/.git-worktrees/scribe/quarto-v115`
**Duration:** 4 sprints (~40-45 hours)
**Status:** Sprint 33 COMPLETE ✅, Sprint 34 Next

### Sprint 33: Core Autocomplete Foundation ✅ COMPLETE

**Completed:** 2026-01-08
**Effort:** ~7-9 hours
**Tests:** +32 new tests (2,015 total)

| Feature | Status | Files |
|---------|--------|-------|
| YAML frontmatter autocomplete | ✅ Done | quarto-completions.ts (729 lines) |
| Chunk options autocomplete (#\|) | ✅ Done | 25+ chunk options |
| Cross-reference autocomplete (@fig-, @tbl-) | ✅ Done | Label scanning + caption preview |
| Quarto demo document | ✅ Done | seed-data.ts |

**Commits:**
- `0d863f7` - feat(quarto): Add autocomplete for YAML, chunk options, and cross-refs
- `7b9fb13` - feat(demo): Add Quarto document example to seed data
- `bdcc3bd` - chore: Update package-lock.json

**New/Modified Files:**
- NEW: `src/renderer/src/lib/quarto-completions.ts` (729 lines)
- NEW: `src/renderer/src/__tests__/QuartoCompletions.test.ts` (32 tests)
- MOD: `src/renderer/src/components/CodeMirrorEditor.tsx`
- MOD: `src/renderer/src/lib/seed-data.ts`
- MOD: `src/renderer/src/lib/browser-db.ts`

---

### Sprint 34: Quarto Integration (~10-12 hours) ⏳ NEXT

**Status:** Ready to Start
**Priority:** Project-wide cross-refs (P1) → Render (P2) → Callouts (P2)

| Feature | Effort | Priority | Status |
|---------|--------|----------|--------|
| **Project-wide cross-references** 🎯 | 4-5h | P1 | [ ] Pending |
| Quarto render integration | 4-5h | P2 | [ ] Pending |
| Quarto callout syntax (:::) | 1-2h | P2 | [ ] Pending |

#### Feature 1: Project-Wide Cross-References (P1, 4-5h)

**Why P1:** Enables autocomplete across all notes in a project, not just current document. Essential for academic workflows with figures/tables in separate files.

**Backend Implementation:**

```rust
// NEW: src-tauri/src/quarto/mod.rs
pub mod cli;
pub mod crossref;

use std::collections::HashMap;

pub struct CrossRefIndex {
    project_id: String,
    refs: HashMap<String, CrossRef>,
    updated_at: i64,
}

// NEW: src-tauri/src/quarto/crossref.rs
pub struct CrossRef {
    pub label: String,
    pub ref_type: CrossRefType,  // Fig, Tbl, Eq, Sec
    pub note_id: String,
    pub line_number: usize,
    pub caption: String,
}

pub fn scan_labels(note_id: &str, content: &str) -> Vec<CrossRef> {
    // Scan for:
    // - {#fig-*} in figure captions
    // - {#tbl-*} in table captions
    // - {#eq-*} in equation environments
    // - {#sec-*} in section headers
}

pub fn build_index(project_id: &str, notes: Vec<(String, String)>) -> CrossRefIndex {
    // Build in-memory HashMap for fast autocomplete reads
}
```

**New Tauri Commands:**

```rust
// src-tauri/src/commands.rs
#[tauri::command]
async fn build_crossref_index(project_id: &str) -> Result<(), String> {
    // Called on project open - scans all notes
}

#[tauri::command]
async fn update_crossref_index(project_id: &str, note_id: &str, content: &str) -> Result<(), String> {
    // Called on note save - incremental update
}

#[tauri::command]
async fn get_crossref_index(project_id: &str) -> Result<Vec<CrossRef>, String> {
    // Called by autocomplete - fast read from memory
}
```

**Frontend Integration:**

```typescript
// MOD: src/renderer/src/lib/quarto-completions.ts
async function crossRefCompletions(context: CompletionContext): Promise<CompletionResult | null> {
  const projectId = useProjectStore.getState().selectedProjectId
  const index = await api.getCrossrefIndex(projectId)

  // Filter by @prefix and return completions
}
```

**Storage:** In-memory HashMap (not SQLite) for fast autocomplete reads (~100ms for 100 notes)

**Files to Create:**
- `src-tauri/src/quarto/mod.rs` (module root)
- `src-tauri/src/quarto/crossref.rs` (label scanning)

**Files to Modify:**
- `src-tauri/src/commands.rs` (3 new Tauri commands)
- `src-tauri/src/lib.rs` (register commands)
- `src/renderer/src/lib/api.ts` (3 new API calls)
- `src/renderer/src/lib/quarto-completions.ts` (use project-wide index)

**Tests:** ~20 new tests

---

#### Feature 2: Quarto Render Integration (P2, 4-5h)

**Backend Implementation:**

```rust
// NEW: src-tauri/src/quarto/cli.rs
pub fn detect_quarto() -> Option<PathBuf> {
    // Check: which quarto
}

#[tauri::command]
pub async fn quarto_render(path: &str, format: &str) -> Result<String, String> {
    // Run: quarto render path.qmd --to format
    // Parse output for errors
}

#[tauri::command]
pub fn is_quarto_available() -> bool {
    detect_quarto().is_some()
}
```

**Frontend Integration:**

```typescript
// MOD: src/renderer/src/components/ExportDialog.tsx
// Add "Quarto Render" option with format selector
<select>
  <option value="html">HTML</option>
  <option value="pdf">PDF</option>
  <option value="docx">Word</option>
  <option value="revealjs">Reveal.js Slides</option>
  <option value="beamer">Beamer Slides</option>
</select>
```

**Files to Create:**
- `src-tauri/src/quarto/cli.rs`

**Files to Modify:**
- `src-tauri/src/quarto/mod.rs` (add cli module)
- `src-tauri/src/commands.rs` (2 new commands)
- `src/renderer/src/components/ExportDialog.tsx`
- `src/renderer/src/lib/api.ts`

**Tests:** ~15 new tests

---

#### Feature 3: Quarto Callout Syntax (P2, 1-2h)

**Existing:** Obsidian-style `> [!note]` callouts already work

**Add Quarto Syntax:**

```markdown
::: {.callout-note}
This is a note.
:::

::: {.callout-warning}
Be careful!
:::
```

**Implementation:** Extend callout regex in HybridEditor.tsx

**Files to Modify:**
- `src/renderer/src/components/HybridEditor.tsx` (or lib/callouts.ts if extracted)

**Tests:** ~15 new tests

---

### Sprint 35: Execution & Errors (~15-18 hours) 📋 PLANNED

| Feature | Effort | Priority | Status |
|---------|--------|----------|--------|
| Single chunk execution (R/Python/Bash) | 6-8h | P2 | [ ] Pending |
| Error panel (bottom drawer) | 5-6h | P2 | [ ] Pending |
| Zotero + BibTeX integration | 4-5h | P2 | [ ] Pending |

#### Feature 4: Single Chunk Execution (6-8h)

**Languages:** R (Rscript), Python (python3), Bash (bash)

**Backend:**

```rust
// NEW: src-tauri/src/quarto/chunk.rs
#[tauri::command]
pub async fn execute_chunk(
    language: &str,
    code: &str,
    timeout_ms: u64,  // Default: 30000
) -> Result<ChunkExecutionResult, String> {
    // Execute with timeout
    // Return stdout, stderr, exit_code
}

#[tauri::command]
pub async fn kill_chunk_execution(chunk_id: &str) -> Result<(), String> {
    // Cancel running chunk
}
```

**Frontend:**
- Add "Run" button to code blocks (Live/Reading modes)
- Display output inline below chunk
- Show running indicator

**Tests:** ~25 new tests

---

#### Feature 5: Error Panel (5-6h)

**Design:** Bottom drawer (not sidebar) - preserves writing space

**Components:**
- Error badge in status bar (click to expand)
- Expandable panel with error list
- Jump to line, Copy error, "Ask AI to fix" buttons

**Backend:**

```rust
// NEW: src-tauri/src/quarto/error.rs
pub fn parse_quarto_output(output: &str) -> Vec<QuartoError> {
    // Parse line numbers, messages, categories
}
```

**Frontend:**
- `src/renderer/src/components/ErrorPanel.tsx`
- `src/renderer/src/store/errorStore.ts`

**Keyboard:** Cmd+Shift+E to toggle

**Tests:** ~20 new tests

---

#### Feature 6: Zotero + BibTeX Integration (4-5h)

**Sources:**
1. BibTeX files - scan project for `.bib` files
2. Zotero - Better BibTeX export OR Zotero API

**Enhancements:**
- YAML `bibliography:` autocomplete shows local files + Zotero collections
- Citation autocomplete shows source icons (📄 = BibTeX, 📚 = Zotero)

**Tests:** ~15 new tests

---

### Sprint 36: Preview & Polish (~8-10 hours) 📋 PLANNED

| Feature | Effort | Priority | Status |
|---------|--------|----------|--------|
| Live slide preview | 6-8h | P3 | [ ] Pending |
| Bug fixes & polish | 2-4h | P1 | [ ] Pending |

#### Feature 7: Live Slide Preview (6-8h)

**Detection:** Auto-detect `format: revealjs` or `format: beamer` in YAML

**Default:** External browser preview (simpler) - uses `quarto preview`

**Optional:** Split view for power users (Settings toggle)

**Tests:** ~20 new tests

---

### Sprint 34 Deliverables Summary

**New Backend Modules (3):**
1. `src-tauri/src/quarto/mod.rs` - Module root
2. `src-tauri/src/quarto/crossref.rs` - Label scanning/indexing
3. `src-tauri/src/quarto/cli.rs` - Quarto CLI detection/render

**New Tauri Commands (5):**
1. `build_crossref_index` - Scan all notes on project open
2. `update_crossref_index` - Update on note save
3. `get_crossref_index` - Fast read for autocomplete
4. `is_quarto_available` - Check Quarto installation
5. `quarto_render` - Render document (async)

**Modified Files:**
- `src-tauri/src/commands.rs` - Register new commands
- `src-tauri/src/lib.rs` - Module registration
- `src/renderer/src/lib/api.ts` - API wrappers
- `src/renderer/src/lib/quarto-completions.ts` - Use project-wide index
- `src/renderer/src/components/ExportDialog.tsx` - Quarto render option
- `src/renderer/src/components/HybridEditor.tsx` - Callout rendering

**Tests:** ~50 new tests (20 cross-ref + 15 render + 15 callouts)

---

## Planned: v2.0 LaTeX Editor Mode

**Branch:** `feat/latex-editor-v2` (to be created)
**Worktree:** `~/.git-worktrees/scribe/latex-v2`
**Duration:** 7 weeks (~35-40 hours)
**Status:** Planning Complete, Implementation Pending

### Phase 1: Architecture Foundation (Week 1-2)

**Goal:** Enable multi-format support (markdown, LaTeX, Quarto)

**Database Schema:**
```sql
-- Migration 010: Add file format support
ALTER TABLE notes ADD COLUMN file_format TEXT DEFAULT 'md';
-- Values: 'md', 'tex', 'qmd'
```

**EditorFactory Pattern:**
```typescript
const EditorFactory = ({ note }) => {
  switch (note.file_format) {
    case 'tex': return <LaTeXEditor note={note} />
    case 'qmd': return <QuartoEditor note={note} />
    default: return <HybridEditor note={note} />
  }
}
```

**Files to Modify:**
- `src-tauri/src/database.rs` - Add file_format column
- `src/renderer/src/types/index.ts` - Add to Note type
- `src/renderer/src/lib/api.ts` - Format-aware dispatching
- `src/renderer/src/lib/browser-api.ts` - IndexedDB schema update

**Tests:** ~30 new tests

---

### Phase 2: LaTeX Editor Component (Week 2-3)

**Goal:** Build dedicated `.tex` file editor

**New Component:**
- `src/renderer/src/components/LaTeXEditor.tsx`
- CodeMirror with LaTeX syntax highlighting
- Document structure outline (sections, subsections)
- Two modes: Source (editing) + PDF Preview (compiled)

**Dependencies:**
- `@codemirror/legacy-modes` - LaTeX grammar

**Tests:** ~50 new tests

---

### Phase 3: TeX Live Compilation (Week 3-4)

**Goal:** Compile `.tex` → PDF within Scribe

**Backend:**
```rust
// NEW: src-tauri/src/latex.rs
fn detect_tex_live() -> Option<PathBuf> {
    // Check: /Library/TeX/texbin/pdflatex (MacTeX)
}

async fn compile_latex(tex_path: &Path) -> Result<PdfPath> {
    // pdflatex -interaction=nonstopmode file.tex
    // Parse .log for errors
}
```

**Tests:** ~20 new tests

---

### Phase 4: PDF Preview Pane (Week 4-5)

**Goal:** Live PDF preview alongside editor

**Dependencies:**
- `pdfjs-dist` (~2MB) - PDF rendering

**Layout:**
```
┌─────────────────────────────────────────────┐
│ [Source]          |      [PDF Preview]      │
├───────────────────┼─────────────────────────┤
│ \documentclass{}  │  [Rendered PDF Output]  │
│ \begin{document}  │                         │
│ ...               │  Page 1/3  [◀] [▶] 100% │
└───────────────────┴─────────────────────────┘
```

**Features:**
- SyncTeX support (click PDF → jump to source)
- Auto-compile on save (500ms debounce)

**Tests:** ~30 new tests

---

### Phase 5: Templates Library (Week 5-6)

**Goal:** Quick-start templates

**Built-in Templates:**
- `article.tex` - Basic article
- `apa-paper.tex` - APA formatted paper
- `beamer.tex` - Presentation slides
- `thesis.tex` - Thesis/dissertation
- `letter.tex` - Formal letter
- `cv.tex` - Curriculum vitae

**Component:**
- `src/renderer/src/components/TemplateGallery.tsx`

**Tests:** ~20 new tests

---

### Phase 6: Enhanced Inline LaTeX (Week 6)

**Goal:** Improve existing markdown+LaTeX experience

**Features:**
- Symbol palette modal (⌘⌥S)
- Hover preview in Source mode
- BibTeX autocomplete from Zotero

**Tests:** ~20 new tests

---

### v2.0 Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| 1. Foundation | 2 weeks | Multi-format architecture (database + API) |
| 2. Editor | 1 week | LaTeXEditor component |
| 3. Compile | 1 week | TeX Live integration |
| 4. PDF | 1 week | PDF.js preview pane |
| 5. Templates | 1 week | Template library (6+ templates) |
| 6. Inline | 1 week | Enhanced markdown+LaTeX |
| **Total** | **7 weeks** | Scribe v2.0 with LaTeX |

**Tests:** ~170 new tests across all phases

---

## v2.0 Markdown Polish (Bundled with LaTeX Editor)

**Status:** Planning Complete
**Duration:** ~40 hours (parallel with LaTeX phases)

### Code Block Enhancements

| Feature | Effort | Category |
|---------|--------|----------|
| Language picker dropdown | 3-4h | Code Blocks |
| Source mode syntax highlighting | 4-5h | Code Blocks |
| Copy button for code blocks | 1-2h | Code Blocks |
| Line numbers | 2h | Code Blocks |

### Table Enhancements

| Feature | Effort | Category |
|---------|--------|----------|
| Visual table editor | 8-10h | Tables |
| Tab navigation in tables | 2-3h | Tables |
| Auto-alignment | 3-4h | Tables |
| CSV paste to table | 2-3h | Tables |

### Links/Images Enhancements

| Feature | Effort | Category |
|---------|--------|----------|
| Link preview tooltip | 2h | Links/Images |
| Image preview inline | 3-4h | Links/Images |
| Drag-drop images | 4-5h | Links/Images |
| Link autocomplete | 2-3h | Links/Images |

**Total Effort:** ~40 hours

---

## Release Strategy

### v1.15 Release Checklist

**When Sprint 36 completes:**

1. **Merge to dev:**
   ```bash
   cd ~/.git-worktrees/scribe/quarto-v115
   # Commit any final changes
   git checkout dev
   git merge feat/quarto-v115 --no-ff -m "Merge v1.15 Quarto Enhancements"
   git push origin dev
   ```

2. **Create PR to main:**
   ```bash
   gh pr create --base main --head dev --title "v1.15 Quarto Enhancements"
   ```

3. **After merge to main:**
   ```bash
   git checkout main && git pull
   git tag -a v1.15.0 -m "v1.15.0 - Quarto Enhancements"
   git push origin v1.15.0
   ```

4. **Update Homebrew formula**

---

### v2.0 Release Checklist

**When Phase 6 completes:**

1. **Merge phases incrementally to dev** (after each phase)
2. **Final PR to main** when all phases complete
3. **Tag v2.0.0**
4. **Update documentation site**
5. **Update Homebrew formula**

---

## Documentation References

| Document | Purpose | Status |
|----------|---------|--------|
| `SPEC-v115-quarto-enhancements-2026-01-07.md` | Technical spec | ✅ Complete |
| `BRAINSTORM-editor-polish-quarto-2026-01-07.md` | Feature brainstorm | ✅ Complete |
| `UXUI-quarto-support-2026-01-07.md` | UI/UX design | ✅ Complete |
| `PLAN-v2-latex-editor.md` | v2.0 LaTeX plan | ✅ Complete |
| `ROADMAP-CONSOLIDATED-2026-01-08.md` | This document | ✅ Current |

---

## Next Immediate Action

**START: Sprint 34 Feature 1 - Project-Wide Cross-References**

**Location:** `~/.git-worktrees/scribe/quarto-v115`

**First Steps:**
1. Create Rust module structure (`quarto/mod.rs`, `quarto/crossref.rs`)
2. Implement `scan_labels()` function
3. Implement `CrossRefIndex` with HashMap storage
4. Add 3 Tauri commands (build/update/get index)
5. Update frontend autocomplete to use project-wide index
6. Write tests

**Estimated Duration:** 4-5 hours

---

**Generated:** 2026-01-08
**Next Update:** After Sprint 34 completion
