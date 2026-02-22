# Live Editing: Next Evolution

> **Survey of current implementation + planning for Sprint 31+**

**Date:** 2026-01-06
**Current Version:** 1.12.0
**Status:** Planning Phase

---

## 🔍 Current State Survey

### ✅ What's Working Well

**Foundation (Solid):**
- Three-mode editor system with seamless switching
- CodeMirror 6 integration with custom plugins
- KaTeX math rendering (inline + display)
- Obsidian-style syntax hiding with cursor detection
- 930 unit tests + 48 E2E tests passing
- Theme-aware styling with runtime CSS variables
- Local state fix for race condition (no lost characters)

**Features (Complete):**
- Headers, bold, italic, strikethrough, code, links, lists
- Blockquotes with callout support (11 types)
- Wiki-link autocomplete and rendering
- Tag autocomplete and rendering
- Citation autocomplete
- Typewriter scrolling in focus mode
- Quick chat popover (⌘J)

### ⚠️ What's Missing or Incomplete

**Live Preview Gaps:**
1. ❌ **Tables** - Not rendered in Live Preview mode
2. ❌ **Images** - Not rendered inline
3. ❌ **Footnotes** - Not supported
4. ❌ **Task lists** - Checkboxes not rendered (`- [ ]`, `- [x]`)
5. ❌ **Code blocks** - No syntax highlighting
6. ❌ **HTML blocks** - Not rendered
7. ⚠️ **Multi-line math** - Requires StateField refactor

**Reading Mode Gaps:**
1. ❌ **Callout rendering** - Uses generic blockquote (not type-specific boxes)
2. ❌ **Task list checkboxes** - Not interactive
3. ❌ **Code syntax highlighting** - Plain monospace only
4. ❌ **Mermaid diagrams** - Not supported
5. ❌ **Embedded content** - iframes, videos not supported

**Autocomplete Gaps:**
1. ❌ **Math symbols** - No LaTeX autocomplete
2. ❌ **File attachments** - No `![[image.png]]` autocomplete
3. ❌ **Headers** - No `[[Note#Header]]` section links
4. ❌ **Blocks** - No `[[Note^block-id]]` block references

**Performance Concerns:**
1. ⚠️ **Large documents** (>10,000 words) - Potential lag
2. ⚠️ **Heavy math** (many equations) - Render time
3. ⚠️ **Live Preview scroll** - Occasional jank

**UX Polish:**
1. ❌ **Mode persistence per note** - Global mode affects all notes
2. ❌ **Preview pane** - Split view (source + rendered)
3. ❌ **Zen mode** - Distraction-free (hide all UI)
4. ❌ **Word goal progress** - Visual indicator in editor
5. ❌ **Spell check** - Browser spell check disabled in CodeMirror

---

## 📊 Gap Analysis by Priority

### P0 - Critical for Academic Use
| Feature | Impact | Effort | Status |
|---------|--------|--------|--------|
| Tables in Live Preview | High | Medium | ❌ |
| Code syntax highlighting | High | Medium | ❌ |
| Multi-line math | High | Medium | ⚠️ |
| Callout boxes in Reading mode | Medium | Low | ❌ |

### P1 - Important for Daily Use
| Feature | Impact | Effort | Status |
|---------|--------|--------|--------|
| Task list checkboxes | Medium | Low | ❌ |
| Images in Live Preview | Medium | Medium | ❌ |
| File attachment autocomplete | Medium | Low | ❌ |
| Spell check toggle | Medium | Low | ❌ |

### P2 - Nice to Have
| Feature | Impact | Effort | Status |
|---------|--------|--------|--------|
| Mode persistence per note | Low | Low | ❌ |
| Split view (source + preview) | Medium | High | ❌ |
| Footnote rendering | Low | Medium | ❌ |
| Math autocomplete | Low | Medium | ❌ |

### P3 - Future Enhancements
| Feature | Impact | Effort | Status |
|---------|--------|--------|--------|
| Mermaid diagrams | Low | High | ❌ |
| Embedded iframes | Low | Medium | ❌ |
| Real-time collaboration | High | Very High | ❌ |
| Vim mode in Live Preview | Low | High | ❌ |

---

## 🎯 Recommended Roadmap

### Sprint 31: Callouts & Advanced LaTeX (P0) ⭐ PRIORITIZED

**Goal:** Fix callout rendering + advanced math editing

**Phase 1: Callout Boxes in Reading Mode (1 day)**
- [ ] Render type-specific boxes with icons and colors
- [ ] Extract callout type from blockquote content
- [ ] Add callout header with icon + title
- [ ] Style 11 callout types with proper colors
- [ ] Add E2E tests (5-10 tests)

**Phase 2: Multi-line Math (1-2 days)**
- [ ] Refactor to StateField for block math
- [ ] Support `$$...$$` across multiple lines
- [ ] Remove single-line display math from ViewPlugin
- [ ] Better error handling for invalid LaTeX
- [ ] Add E2E tests (3-5 tests)

**Phase 3: LaTeX Autocomplete (1 day)**
- [ ] Implement `\` trigger inside math mode
- [ ] Add 20+ common symbols (Greek, operators, arrows)
- [ ] Create autocomplete dropdown component
- [ ] Insert LaTeX on selection
- [ ] Add E2E tests (3-5 tests)

**Phase 4: Math Templates (Optional, 1 day)**
- [ ] Common patterns (matrix, fraction, integral, etc.)
- [ ] Insert with placeholder selection
- [ ] 8+ templates available

**Estimated Total:** 3-5 days

**Spec:** `docs/planning/SPRINT-31-CALLOUTS-LATEX.md`

---

### Sprint 32: Tables + Code Highlighting (P0)

**Goal:** Complete academic writing essentials

**Phase 1: Tables in Live Preview (1-2 days)**
- [ ] Detect GFM table syntax with StateField
- [ ] Create TableWidget with HTML table rendering
- [ ] Add hover state to show/hide table syntax
- [ ] Style tables to match Reading mode
- [ ] Add E2E tests (5-10 tests)

**Phase 2: Code Syntax Highlighting (1-2 days)**
- [ ] Integrate Prism for syntax highlighting
- [ ] Detect code block languages (```language)
- [ ] Apply syntax highlighting in Live Preview
- [ ] Apply syntax highlighting in Reading mode
- [ ] Support common languages (js, ts, python, r, sql, bash)
- [ ] Add E2E tests (5-10 tests)

**Estimated Total:** 3-4 days

---

### Sprint 33: Task Lists + Images (P1)

**Goal:** Enhance interactive elements

**Phase 1: Task Lists (1 day)**
- [ ] Detect `- [ ]` and `- [x]` in Live Preview
- [ ] Render checkboxes (read-only in Live, interactive in Reading)
- [ ] Toggle task state on click (Reading mode)
- [ ] Persist checkbox state to markdown
- [ ] Add E2E tests (3-5 tests)

**Phase 2: Image Rendering (1-2 days)**
- [ ] Detect `![alt](path)` in Live Preview
- [ ] Create ImageWidget with lazy loading
- [ ] Support local files and URLs
- [ ] Add hover state for image syntax
- [ ] Style images (max-width, centering)
- [ ] Add E2E tests (3-5 tests)

**Estimated Total:** 2-3 days

---

### Sprint 34: UX Polish (P2)

**Goal:** Improve editing UX

**Phase 1: UX Polish (1-2 days)**
- [ ] Mode persistence per note (store in note properties)
- [ ] Spell check toggle in Settings
- [ ] Word goal progress indicator in editor
- [ ] Improve scroll performance for large docs

**Estimated Total:** 2-3 days

---

## 🔬 Technical Deep Dives

### 1. Tables in Live Preview

**Challenge:** GFM tables are multi-line, require StateField

**Syntax:**
```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
```

**Approach:**
```typescript
// Detect table blocks using StateField
const tableField = StateField.define<DecorationSet>({
  create(state) { return findTables(state) },
  update(decos, tr) {
    if (!tr.docChanged) return decos.map(tr.changes)
    return findTables(tr.state)
  },
  provide: f => EditorView.decorations.from(f)
})

// TableWidget renders HTML <table>
class TableWidget extends WidgetType {
  constructor(readonly rows: string[][]) { super() }

  toDOM() {
    const table = document.createElement('table')
    table.className = 'cm-table'
    // Render rows...
    return table
  }
}
```

**CSS:**
```css
.cm-table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.cm-table th,
.cm-table td {
  border: 1px solid var(--nexus-bg-tertiary);
  padding: 0.5em;
  text-align: left;
}

.cm-table th {
  background: var(--nexus-bg-secondary);
  font-weight: 600;
}
```

### 2. Code Syntax Highlighting

**Options:**

| Library | Size | Languages | Themes | Performance |
|---------|------|-----------|--------|-------------|
| **Shiki** | ~1.5 MB | 200+ | 50+ | Slower (WASM) |
| **Prism** | ~100 KB | 200+ | 50+ | Faster (JS) |
| **Highlight.js** | ~500 KB | 190+ | 250+ | Fast (JS) |

**Recommendation:** **Prism** for balance of size and features

**Integration:**
```typescript
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'

class CodeBlockWidget extends WidgetType {
  constructor(readonly code: string, readonly language: string) {
    super()
  }

  toDOM() {
    const pre = document.createElement('pre')
    const codeEl = document.createElement('code')
    codeEl.className = `language-${this.language}`

    if (Prism.languages[this.language]) {
      codeEl.innerHTML = Prism.highlight(
        this.code,
        Prism.languages[this.language],
        this.language
      )
    } else {
      codeEl.textContent = this.code
    }

    pre.appendChild(codeEl)
    return pre
  }
}
```

### 3. Task Lists (Interactive)

**Challenge:** Checkboxes must be interactive in Reading mode

**Approach:**
```typescript
// Custom ReactMarkdown renderer
components={{
  li: ({ children, checked }) => {
    if (checked !== null) {
      return (
        <li className="task-list-item">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => {
              // Update markdown source
              toggleTask(lineNumber, e.target.checked)
            }}
          />
          {children}
        </li>
      )
    }
    return <li>{children}</li>
  }
}}
```

**Markdown update:**
```typescript
function toggleTask(lineNumber: number, checked: boolean) {
  const lines = content.split('\n')
  lines[lineNumber] = lines[lineNumber].replace(
    checked ? /- \[ \]/ : /- \[x\]/,
    checked ? '- [x]' : '- [ ]'
  )
  onChange(lines.join('\n'))
}
```

### 4. Multi-line Math with StateField

**Problem:** ViewPlugin can't replace line breaks

**Solution:**
```typescript
// Use StateField instead of ViewPlugin for block math
const blockMathField = StateField.define<DecorationSet>({
  create(state) {
    return findBlockMath(state)
  },
  update(decos, tr) {
    if (!tr.docChanged) return decos.map(tr.changes)
    return findBlockMath(tr.state)
  },
  provide: f => EditorView.decorations.from(f)
})

function findBlockMath(state: EditorState): DecorationSet {
  const widgets: Range<Decoration>[] = []
  const text = state.doc.toString()

  // Match $$...$$ across multiple lines
  const regex = /\$\$([^$]+)\$\$/gs
  let match

  while ((match = regex.exec(text)) !== null) {
    const from = match.index
    const to = from + match[0].length
    const formula = match[1].trim()

    // Skip if cursor is inside
    const cursor = state.selection.main
    if (cursor.from >= from && cursor.to <= to) continue

    widgets.push(
      Decoration.replace({
        widget: new MathWidget(formula, true)
      }).range(from, to)
    )
  }

  return Decoration.set(widgets)
}
```

### 5. Image Rendering with Lazy Loading

**Approach:**
```typescript
class ImageWidget extends WidgetType {
  constructor(readonly src: string, readonly alt: string) {
    super()
  }

  toDOM() {
    const img = document.createElement('img')
    img.src = this.src
    img.alt = this.alt
    img.loading = 'lazy'
    img.className = 'cm-image'
    img.style.maxWidth = '100%'
    img.style.display = 'block'
    img.style.margin = '1em auto'

    // Error handling
    img.onerror = () => {
      img.style.display = 'none'
      const error = document.createElement('span')
      error.textContent = `[Image not found: ${this.alt}]`
      error.className = 'cm-image-error'
      img.parentElement?.replaceChild(error, img)
    }

    return img
  }
}
```

---

## 📈 Success Metrics

### Sprint 31 (Callouts + LaTeX)
- [ ] Callout boxes render correctly in Reading mode (11 types)
- [ ] Multi-line math works without errors
- [ ] LaTeX autocomplete triggers and inserts symbols
- [ ] No performance regression on large docs
- [ ] All existing tests still pass (930 unit + 48 E2E)

### Sprint 32 (Tables + Code)
- [ ] Tables render correctly in Live Preview (5+ E2E tests passing)
- [ ] Code blocks show syntax highlighting (10+ languages)
- [ ] No performance regression on large docs
- [ ] All existing tests still pass

### Sprint 33 (Tasks + Images)
- [ ] Task checkboxes toggle in Reading mode
- [ ] Images load and display in Live Preview
- [ ] Lazy loading prevents memory issues
- [ ] E2E tests cover edge cases (missing images, etc.)

### Sprint 34 (UX Polish)
- [ ] Mode persistence works per note
- [ ] Spell check toggle available
- [ ] Word goal progress indicator working
- [ ] No character loss during typing (regression test)

---

## 🎨 Design Mockups Needed

### Tables in Live Preview
```
Before (cursor elsewhere):
┌─────────────┬─────────────┐
│ Header 1    │ Header 2    │
├─────────────┼─────────────┤
│ Cell 1      │ Cell 2      │
└─────────────┴─────────────┘

After (cursor inside):
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
```

### Task Lists
```
Reading Mode:
☑ Completed task (interactive)
☐ Incomplete task (interactive)

Live Preview (cursor elsewhere):
☑ Completed task
☐ Incomplete task

Live Preview (cursor inside):
- [x] Completed task
- [ ] Incomplete task
```

### Code Blocks
```
Live Preview (cursor elsewhere):
┌─────────────────────────────┐
│ function greet() {          │ (syntax highlighted)
│   console.log('Hello!')     │
│ }                           │
└─────────────────────────────┘

Live Preview (cursor inside):
```javascript
function greet() {
  console.log('Hello!')
}
``` (raw markdown visible)
```

---

## 🚫 Out of Scope (v2.0+)

The following are explicitly deferred to v2.0:

1. **Real-time collaboration** - Complex, requires WebSocket + CRDT
2. **Vim mode** - Niche use case, high complexity
3. **Custom syntax themes** - Low ROI, themes already work
4. **Mermaid diagrams** - Low priority, complex integration
5. **Transclusion** - Requires advanced linking system
6. **Canvas/drawing** - Out of scope for markdown editor

---

## 💡 Next Steps

### Immediate (This Session)
1. ✅ Create architecture reference card
2. ✅ Survey current implementation
3. ✅ Discuss priorities with user (Callouts + LaTeX prioritized)
4. ✅ Create Sprint 31 spec

### Sprint 31 Kickoff
1. [ ] Review `SPRINT-31-CALLOUTS-LATEX.md` spec
2. [ ] Set up feature branch `feat/callouts-latex` + worktree
3. [ ] Implement Phase 1: Callout boxes in Reading mode
4. [ ] Implement Phase 2: Multi-line math with StateField
5. [ ] Implement Phase 3: LaTeX autocomplete
6. [ ] Implement Phase 4: Math templates (optional)
7. [ ] Write E2E tests (20+ tests)
8. [ ] Release v1.13.0

---

**Status:** ✅ Planning Complete - Sprint 31 prioritized (Callouts + LaTeX)
**Next Step:** Review spec and start implementation
