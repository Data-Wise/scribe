# BRAINSTORM: Editor Polish + Quarto Enhancements

> **Deep Feature Brainstorm for Scribe v1.15 & v2.0**

**Generated:** 2026-01-07
**Mode:** Feature | **Depth:** MAX (Expanded)
**Duration:** ~25 min
**Agent Analysis:** Backend Architect + UX Designer

---

## Executive Summary

**Two-Phase Strategy:**
- **v1.15:** Quarto enhancements (priority per user) - academic users
- **v2.0:** Markdown polish (bundled with LaTeX editor) - all users

**Key Insight:** Quarto support leverages existing infrastructure (autocomplete, syntax highlighting, Pandoc) with targeted extensions.

---

## Requirements Gathered

| Category | Selected Features |
|----------|-------------------|
| **Syntax Pain Points** | Code blocks, Links/Images, Tables |
| **Code Blocks** | Language picker, Syntax highlighting (Source), Copy button, Line numbers |
| **Tables** | Visual editor, Tab navigation, Auto-alignment, CSV paste |
| **Links/Images** | Preview tooltip, Image preview, Drag-drop, Link autocomplete |
| **Quarto Features** | YAML assist, Chunk options, Cross-references, Callout blocks |
| **Quarto Outputs** | HTML, PDF/LaTeX, Revealjs, Manuscripts, Beamer |
| **YAML Focus** | format, bibliography/csl, execute options, project options |
| **Cross-refs** | @fig-*, @tbl-*, @eq-*, @sec-* (all types) |
| **Cross-ref Scope** | Same project (scan all notes) |
| **Code Execution** | Run single chunks (R, Python, Bash) |
| **Error Display** | Dedicated error panel with AI fix suggestions |
| **Slide Preview** | Live slide preview (split view) |
| **Citation Sources** | Both BibTeX files + Zotero integration |
| **Priority** | **Quarto first** |
| **Release** | Quarto → v1.15 / Polish → v2.0 |

---

## Current State Analysis

### What Scribe Already Has

| Feature | Status | Notes |
|---------|--------|-------|
| **Markdown Editing** | ✅ Mature | CodeMirror 6, three modes |
| **LaTeX Math** | ✅ Complete | KaTeX, 87 commands, 42 snippets |
| **Autocomplete System** | ✅ Extensible | Wiki links, tags, citations, LaTeX |
| **Pandoc Export** | ✅ Working | PDF, Word, LaTeX, HTML |
| **Quarto Support** | ❌ Minimal | Mentioned in docs, not implemented |

### Key Files for Extension

| File | Purpose | Extension Point |
|------|---------|-----------------|
| `CodeMirrorEditor.tsx` | Source editor | Add Quarto completions (line 1541) |
| `HybridEditor.tsx` | Three-mode editor | Add Quarto preview (line 638) |
| `ExportDialog.tsx` | Export UI | Add Quarto render option |
| `academic.rs` | Backend export | Add Quarto compile function |

---

## PHASE 1: v1.15 Quarto Enhancements

### 1.1 YAML Frontmatter Autocomplete ⚡ Quick Win

**Effort:** 2-3 hours | **Impact:** High

**Trigger:** Type in YAML block (between `---` delimiters)

**Completions to Add:**

| Key | Suggestions |
|-----|-------------|
| `format:` | `html`, `pdf`, `docx`, `revealjs`, `beamer`, `typst` |
| `execute:` | `echo: true/false`, `eval: true/false`, `warning: false`, `message: false` |
| `bibliography:` | Scan for `.bib` files in project |
| `csl:` | Scan for `.csl` files in project |
| `toc:` | `true`, `false`, `toc-depth: 2/3/4` |
| `author:` | Template with name, affiliation, email |
| `date:` | `today`, `last-modified`, date format |

**Implementation Pattern:**

```typescript
function yamlCompletions(context: CompletionContext) {
  // Detect if cursor is in YAML block (between ---)
  const inYaml = isInYamlBlock(context)
  if (!inYaml) return null

  const word = context.matchBefore(/[a-z-]*:?\s*/)
  // Return format-specific completions
}
```

### 1.2 Chunk Options Autocomplete ⚡ Quick Win

**Effort:** 2 hours | **Impact:** High

**Trigger:** Type `#|` at start of line inside code block

**Completions:**

| Option | Values |
|--------|--------|
| `#| echo:` | `true`, `false`, `fenced` |
| `#| eval:` | `true`, `false` |
| `#| warning:` | `true`, `false` |
| `#| message:` | `true`, `false` |
| `#| output:` | `true`, `false`, `asis` |
| `#| label:` | Auto-generate `fig-`, `tbl-` prefix |
| `#| fig-cap:` | Cursor inside quotes |
| `#| tbl-cap:` | Cursor inside quotes |
| `#| fig-width:` | `6`, `7`, `8` |
| `#| fig-height:` | `4`, `5`, `6` |
| `#| code-fold:` | `true`, `false`, `show` |

### 1.3 Cross-Reference Autocomplete

**Effort:** 3-4 hours | **Impact:** High

**Trigger:** Type `@` followed by letters

**Implementation:**

1. **Scan document for labels:**
   - `{#fig-*}` in figure captions
   - `{#tbl-*}` in table captions
   - `{#eq-*}` in equation environments
   - `{#sec-*}` in section headers

2. **Build completion list:**
   ```typescript
   const refs = scanForLabels(doc)
   // Returns: [@fig-myplot, @tbl-summary, @eq-bayes, @sec-intro]
   ```

3. **Show with context:**
   ```
   @fig-myplot    (Figure: Scatter plot of...)
   @tbl-summary   (Table: Summary statistics)
   @eq-bayes      (Equation: Bayes theorem)
   ```

### 1.4 Quarto Callout Blocks

**Effort:** 1-2 hours | **Impact:** Medium

**Already Have:** Obsidian-style callouts (`> [!note]`)

**Add Quarto Syntax:**

```markdown
::: {.callout-note}
This is a note callout.
:::

::: {.callout-warning}
Be careful!
:::

::: {.callout-tip}
## Pro Tip
Helpful information here.
:::
```

**Callout Types:**
- `.callout-note` (blue)
- `.callout-tip` (green)
- `.callout-warning` (orange)
- `.callout-caution` (orange)
- `.callout-important` (red)

**Implementation:** Extend callout regex in `HybridEditor.tsx`

### 1.5 Quarto Render Integration

**Effort:** 4-5 hours | **Impact:** High

**Backend Command:**

```rust
// src-tauri/src/commands.rs
#[tauri::command]
async fn render_quarto(path: &str, format: &str) -> Result<String, String> {
    // Check if quarto is installed
    let quarto = which("quarto").ok_or("Quarto not found")?;

    // Run: quarto render path.qmd --to format
    let output = Command::new(quarto)
        .args(["render", path, "--to", format])
        .output()?;

    // Parse output for errors/warnings
    parse_quarto_output(output)
}
```

**UI Integration:**
- Add "Quarto Render" button in export dialog
- Format selector: HTML, PDF, Revealjs, Beamer
- Show progress indicator during render
- Display errors inline

### 1.6 Single Chunk Execution 🆕 (MAX Depth Addition)

**Effort:** 6-8 hours | **Impact:** High

**Trigger:** Play button on code chunk OR keyboard shortcut (⌘↩)

**Supported Languages:**
| Language | Command | Notes |
|----------|---------|-------|
| R | `Rscript -e "{code}"` | Requires R installation |
| Python | `python3 -c "{code}"` | Uses system Python |
| Bash/Shell | `bash -c "{code}"` | Direct shell execution |

**Backend Implementation:**

```rust
// src-tauri/src/quarto/chunk.rs
#[tauri::command]
async fn execute_chunk(
    language: &str,
    code: &str,
    timeout_ms: u64,  // Default: 30000
) -> Result<ChunkExecutionResult, String> {
    let cmd = match language {
        "r" => Command::new("Rscript").args(["-e", code]),
        "python" => Command::new("python3").args(["-c", code]),
        "bash" => Command::new("bash").args(["-c", code]),
        _ => return Err("Unsupported language"),
    };

    // Execute with timeout
    let output = tokio::time::timeout(
        Duration::from_millis(timeout_ms),
        cmd.output()
    ).await??;

    Ok(ChunkExecutionResult {
        stdout: String::from_utf8_lossy(&output.stdout),
        stderr: String::from_utf8_lossy(&output.stderr),
        exit_code: output.status.code(),
    })
}
```

**Security:**
- 30 second default timeout
- Optional code pattern blocking (`system()`, `rm -rf`)
- Working directory sandboxed to project root

### 1.7 Error Panel 🆕 (MAX Depth Addition)

**Effort:** 5-6 hours | **Impact:** High

**Design Decision:** Bottom drawer (not sidebar) - preserves writing space

**Features:**
- Error badge in status bar (click to expand)
- Jump to line functionality
- Copy error to clipboard
- "Ask AI to fix" button → opens Claude panel with error context

**UI Wireframe:**

```
+------------------------------------------------------------------+
|                          [Editor Content]                         |
+------------------------------------------------------------------+
| QUARTO ERRORS                                           [_] [X]  |
+------------------------------------------------------------------+
| [!] Line 42: Undefined cross-reference '@fig-missing'            |
|     > Click to jump | Copy | Ask AI to fix                       |
+------------------------------------------------------------------+
| [!] Line 78: Invalid YAML: expected key-value pair               |
|     > Click to jump | Copy | Ask AI to fix                       |
+------------------------------------------------------------------+
| 2 errors | Last render: 2:34 PM                     [Re-render]  |
+------------------------------------------------------------------+
```

**Error Categories:**
| Category | Color | Examples |
|----------|-------|----------|
| Syntax | Yellow | Invalid YAML |
| Reference | Orange | Undefined @fig-* |
| Code | Red | R/Python error |
| LaTeX | Purple | Math compilation |

**Keyboard Shortcuts:**
- `Cmd+Shift+E` - Toggle error panel
- `Enter` - Jump to selected error
- `Arrow Up/Down` - Navigate errors

### 1.8 Project-Wide Cross-References 🆕 (MAX Depth Addition)

**Effort:** 4-5 hours | **Impact:** High

**Scope:** Scan all notes in current project (not just current document)

**Implementation:**

```rust
// src-tauri/src/quarto/crossref.rs
pub struct CrossRefIndex {
    project_id: String,
    refs: HashMap<String, CrossRef>,
    updated_at: i64,
}

pub fn build_index(project_id: &str, notes: &[(String, String)]) -> CrossRefIndex {
    let mut refs = HashMap::new();
    for (note_id, content) in notes {
        for crossref in scan_labels(note_id, content) {
            refs.insert(crossref.label.clone(), crossref);
        }
    }
    CrossRefIndex { project_id, refs, updated_at: now() }
}
```

**Index Updates:**
- Full rebuild on project open (~100ms for 100 notes)
- Incremental update on note save
- In-memory storage (not SQLite - fast read for autocomplete)

### 1.9 Live Slide Preview 🆕 (MAX Depth Addition)

**Effort:** 6-8 hours | **Impact:** Medium

**Detection:** Auto-detect `format: revealjs` or `format: beamer` in YAML

**Default:** External browser preview (simpler, uses Quarto's built-in server)

**Optional:** Split view for power users (Settings toggle)

```
+------------------------------------------------------------------+
| [Source]          |      [Divider]      |       [Preview]        |
+-------------------+----+----------------+------------------------+
|  ---                   |                | +--------------------+ |
|  title: "My Talk"      |                | |                    | |
|  format: revealjs      |                | |    Slide Title     | |
|  ---                   |                | |                    | |
|                        |   cursor sync  | |  - Bullet point 1  | |
|  # Introduction|       |  <-----------> | |  - Bullet point 2  | |
|                        |                | +--------------------+ |
+------------------------+----------------+------------------------+
| [<] Slide 1/12 [>]                      | [Sync: ON] [External] |
+------------------------------------------------------------------+
```

**Keyboard Shortcuts:**
- `Cmd+Shift+P` - Toggle preview panel
- `Cmd+[` / `Cmd+]` - Previous/next slide

### 1.10 Zotero + BibTeX Integration 🆕 (MAX Depth Addition)

**Effort:** 4-5 hours | **Impact:** High

**Sources (both supported):**
1. **BibTeX Files:** Scan project for `.bib` files
2. **Zotero:** Better BibTeX export OR Zotero API

**YAML Autocomplete Enhancement:**

```yaml
bibliography: |
  ┌────────────────────────────────────────┐
  │ references.bib   (Local file)          │ <- highlighted
  │ project.bib      (Local file)          │
  │ ────────────────────────────────────── │
  │ My Library       (Zotero)              │
  │ Research Papers  (Zotero collection)   │
  └────────────────────────────────────────┘
```

**Citation Autocomplete Enhancement:**

When typing `@`, show citations from both sources with visual indicator:
- 📄 = BibTeX file
- 📚 = Zotero library

---

## PHASE 2: v2.0 Markdown Polish

### 2.1 Code Block Enhancements

#### Language Picker Dropdown

**Effort:** 3-4 hours | **Impact:** High

**Current:** Type ` ```python ` manually

**New:** Click language indicator → dropdown with common languages

```
┌─────────────────────────────────┐
│ ```python                    ▼ │
├─────────────────────────────────┤
│  JavaScript                    │
│  Python                        │
│  R                             │
│  TypeScript                    │
│  Rust                          │
│  SQL                           │
│  Bash                          │
│  More...                       │
└─────────────────────────────────┘
```

**Implementation:** Overlay component on code block fence

#### Syntax Highlighting in Source Mode

**Effort:** 4-5 hours | **Impact:** High

**Current:** Code blocks show plain text in Source mode

**New:** Proper syntax colors while editing

**Approach:** Use `@codemirror/language` with mixed parsing:
- Markdown base language
- Nested language for code blocks
- Languages: JavaScript, Python, R, TypeScript, Rust, SQL

#### Copy Button

**Effort:** 1-2 hours | **Impact:** Medium

**Add:** Floating copy button on code blocks (hover to reveal)

```
┌────────────────────────────────────────┐
│ ```python                        [📋] │
│ def hello():                           │
│     print("Hello, World!")             │
│ ```                                    │
└────────────────────────────────────────┘
```

#### Line Numbers

**Effort:** 2 hours | **Impact:** Medium

**Add:** Optional line numbers in code blocks (Reading mode)

**Toggle:** Global setting or per-block via ` ```python {.number-lines} `

### 2.2 Table Enhancements

#### Visual Table Editor

**Effort:** 8-10 hours | **Impact:** High

**Current:** Edit raw markdown pipes manually

**New:** Right-click table → "Edit Table" → Modal editor

```
┌─────────────────────────────────────────┐
│ Table Editor                         ✕ │
├─────────────────────────────────────────┤
│  Name    │  Age  │  City    │  [+Col]  │
├──────────┼───────┼──────────┤          │
│  Alice   │  30   │  NYC     │          │
│  Bob     │  25   │  LA      │          │
│  [+Row]  │       │          │          │
├─────────────────────────────────────────┤
│          [Cancel]  [Apply Changes]      │
└─────────────────────────────────────────┘
```

**Features:**
- Add/remove rows and columns
- Reorder with drag handles
- Cell alignment controls
- Apply → writes markdown back

#### Tab Navigation

**Effort:** 2-3 hours | **Impact:** Medium

**Current:** Tab inserts tab character

**New:** Tab moves to next cell in table context

**Implementation:** Detect cursor in table, override Tab behavior

#### Auto-Alignment

**Effort:** 3-4 hours | **Impact:** Medium

**Current:** Pipes get misaligned as you type

**New:** Auto-format on:
- Leave table row
- Save file
- Manual trigger (⌘⇧F)

```markdown
# Before
| Name | Age |
|---|---|
| Alice | 30 |

# After
| Name  | Age |
|-------|-----|
| Alice | 30  |
```

#### CSV Paste

**Effort:** 2-3 hours | **Impact:** High

**Behavior:** Paste CSV/TSV data → prompt to convert to table

```
Detected spreadsheet data. Convert to table?
[Yes] [No, paste as text]
```

### 2.3 Link & Image Enhancements

#### Link Preview Tooltip

**Effort:** 2 hours | **Impact:** Medium

**Hover over link → Show preview:**
- External: URL + domain
- Wiki link: Note title + first line
- Internal: Section preview

#### Image Preview

**Effort:** 3-4 hours | **Impact:** High

**In Live Preview mode:** Show thumbnail inline

```
![Description](path/to/image.png)
     ↓ transforms to ↓
[Thumbnail Preview] Description
```

**Max height:** 200px, click to expand

#### Drag-Drop Images

**Effort:** 4-5 hours | **Impact:** High

**Behavior:**
1. Drop image onto editor
2. Copy to `assets/` folder (or project attachments)
3. Insert `![](assets/image.png)` at cursor

**Settings:**
- Default folder: `assets/`, `images/`, or custom
- Copy vs. reference original

#### Link Autocomplete

**Effort:** 2-3 hours | **Impact:** Medium

**Trigger:** Type `](` to complete URL

**Sources:**
- Recent URLs from notes
- Wiki link targets
- External clipboard URL

---

## Quick Wins Summary

### v1.15 (Quarto) - Target: 3-4 sprints

| Feature | Effort | Priority | Sprint |
|---------|--------|----------|--------|
| YAML frontmatter autocomplete | 2-3h | P1 | 33 |
| Chunk options autocomplete | 2h | P1 | 33 |
| Cross-reference autocomplete | 3-4h | P1 | 33 |
| Quarto callout syntax | 1-2h | P2 | 34 |
| Quarto render integration | 4-5h | P2 | 34 |
| **Single chunk execution** 🆕 | 6-8h | P2 | 35 |
| **Error panel** 🆕 | 5-6h | P2 | 35 |
| **Project-wide cross-refs** 🆕 | 4-5h | P1 | 34 |
| **Live slide preview** 🆕 | 6-8h | P3 | 36 |
| **Zotero + BibTeX integration** 🆕 | 4-5h | P2 | 35 |

**Total Effort:** ~40-45 hours (expanded from ~15h)

### v2.0 (Markdown Polish) - With LaTeX Editor

| Feature | Effort | Priority |
|---------|--------|----------|
| Language picker dropdown | 3-4h | P1 |
| Source mode syntax highlighting | 4-5h | P1 |
| Copy button for code blocks | 1-2h | P2 |
| Line numbers | 2h | P3 |
| Visual table editor | 8-10h | P1 |
| Tab navigation in tables | 2-3h | P2 |
| Auto-alignment | 3-4h | P2 |
| CSV paste | 2-3h | P2 |
| Link preview tooltip | 2h | P3 |
| Image preview | 3-4h | P2 |
| Drag-drop images | 4-5h | P1 |
| Link autocomplete | 2-3h | P3 |

**Total Effort:** ~40 hours

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Scribe Editor System                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Autocomplete System                       │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │                                                             │    │
│  │  Existing:                    New (v1.15):                  │    │
│  │  ├── Wiki Links [[           ├── YAML Keys (---)           │    │
│  │  ├── Tags #                  ├── Chunk Options (#|)        │    │
│  │  ├── Citations @cite         ├── Cross-refs (@fig-, @tbl-) │    │
│  │  └── LaTeX \                 └── Format Values             │    │
│  │                                                             │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Rendering Pipeline                        │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │                                                             │    │
│  │  Existing:                    New (v1.15):                  │    │
│  │  ├── Obsidian Callouts       ├── Quarto Callouts (:::)     │    │
│  │  ├── KaTeX Math              ├── Cross-ref Links           │    │
│  │  └── Wiki Links              └── Chunk Highlighting        │    │
│  │                                                             │    │
│  │  New (v2.0):                                                │    │
│  │  ├── Image Previews                                        │    │
│  │  ├── Code Block Enhancements                               │    │
│  │  └── Table Editor                                          │    │
│  │                                                             │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Export Pipeline                           │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │                                                             │    │
│  │  Existing:                    New (v1.15):                  │    │
│  │  └── Pandoc                  └── Quarto CLI                 │    │
│  │      ├── PDF                     ├── HTML                   │    │
│  │      ├── Word                    ├── PDF                    │    │
│  │      ├── LaTeX                   ├── Revealjs               │    │
│  │      └── HTML                    └── Beamer                 │    │
│  │                                                             │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ADHD Considerations

### Why This Design Works

1. **Progressive Enhancement**
   - Existing workflow unchanged
   - Quarto features only activate in `.qmd` files or when YAML detected
   - No forced learning curve

2. **Autocomplete-First Approach**
   - Don't memorize syntax → type prefix, see options
   - Consistent trigger patterns (`@`, `#|`, `---`)
   - Fast feedback loop

3. **Minimal UI Addition**
   - No new panels or sidebars
   - Features appear contextually
   - Settings are optional

4. **Quick Wins Visible**
   - YAML autocomplete works immediately
   - Cross-refs show as you type labels
   - No compilation step for editing features

---

## Recommended Path

### Sprint 33: Core Autocomplete Foundation

1. **YAML frontmatter autocomplete** - Highest impact, lowest risk
2. **Chunk options autocomplete** - Same pattern, natural extension
3. **Cross-reference autocomplete** - Document-level scanning

### Sprint 34: Quarto Integration

4. **Project-wide cross-refs** 🆕 - Backend index, frontend picker
5. **Quarto render integration** - CLI detection + async execution
6. **Quarto callout syntax** - Quick win, rendering only

### Sprint 35: Execution & Errors

7. **Single chunk execution** 🆕 - R/Python/Bash subprocess
8. **Error panel** 🆕 - Bottom drawer UI + jump-to-line
9. **Zotero + BibTeX integration** 🆕 - Citation source expansion

### Sprint 36: Preview & Polish

10. **Live slide preview** 🆕 - External browser (default) + optional split view
11. **Bug fixes & polish** - Based on v1.15 beta feedback

### v2.0 (With LaTeX Editor)

12. **Code block language picker** - UI component
13. **Visual table editor** - Major effort, high value
14. **Drag-drop images** - UX polish
15. **Source mode syntax highlighting** - Technical complexity

---

## Agent Analysis Summary

### Backend Architect Recommendations

**New Rust Modules:**
- `src-tauri/src/quarto/mod.rs` - Module root with `QuartoState`
- `src-tauri/src/quarto/cli.rs` - Quarto CLI detection/render
- `src-tauri/src/quarto/chunk.rs` - R/Python/Bash execution
- `src-tauri/src/quarto/crossref.rs` - Label scanning/indexing
- `src-tauri/src/quarto/error.rs` - Error parsing

**New Tauri Commands (7 total):**
1. `is_quarto_available` - Check Quarto installation
2. `quarto_render` - Render document (async)
3. `execute_chunk` - Run single code chunk (async)
4. `kill_chunk_execution` - Cancel running chunk
5. `get_crossref_index` - Get labels for autocomplete
6. `update_crossref_index` - Update on note save
7. `build_crossref_index` - Full rebuild for project

**Cross-Reference Storage:** In-memory HashMap (not SQLite) for fast autocomplete reads.

### UX Designer Recommendations

**ADHD-Friendly Principles Applied:**
- Zero friction: Autocomplete appears instantly
- One thing at a time: Focused dropdowns, no overwhelming lists
- Escape hatches: Esc dismisses any dropdown
- Visible progress: Running indicators, error counts

**Key UI Decisions:**
- Error panel = Bottom drawer (preserves writing space)
- Slide preview = External browser default (simpler)
- Autocomplete delay = 150ms (avoid flickering)

**Design Document:** `docs/specs/UXUI-quarto-support-2026-01-07.md`

---

## Next Steps

1. [x] Review this brainstorm
2. [ ] Approve expanded v1.15 Quarto scope (~40-45h across 4 sprints)
3. [ ] Create worktree for v1.15 development
4. [ ] Start Sprint 33 with YAML autocomplete implementation

---

**Related Files:**
- This brainstorm: `BRAINSTORM-editor-polish-quarto-2026-01-07.md`
- Implementation spec: `SPEC-v115-quarto-enhancements-2026-01-07.md`
- UI/UX design: `UXUI-quarto-support-2026-01-07.md`
- Backend architecture: (embedded in agent analysis above)
