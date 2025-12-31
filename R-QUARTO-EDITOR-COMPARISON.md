# R Code & Quarto Live Editing: Editor Comparison

**Date:** 2025-12-31
**Context:** Scribe needs R code rendering + Quarto live editing for academic workflow
**Critical Question:** Can we get RStudio-like experience in the browser?

---

## Executive Summary

**For R + Quarto Live Editing: Neither editor has it built-in, but Milkdown is easier to extend**

**Reality Check:**
- ❌ No markdown editor has true "Quarto live editing" out of box
- ❌ Full Quarto preview requires R execution (backend needed)
- ✅ Code syntax highlighting: Both editors support
- ✅ Static code rendering: Both can do with plugins
- ⚠️ Live R execution: Requires custom architecture (not editor-specific)

**Recommendation:** Milkdown + Custom Quarto Plugin + Tauri R Backend

---

## What is "Quarto Live Editing"?

### Full Quarto Features Needed

```qmd
---
title: "My Analysis"
format: html
execute:
  echo: true
  warning: false
---

## Introduction

This is a Quarto document with R code.

```{r}
#| label: fig-scatter
#| fig-cap: "Scatter plot of mtcars"

library(ggplot2)
ggplot(mtcars, aes(x = wt, y = mpg)) +
  geom_point() +
  theme_minimal()
```

The plot in @fig-scatter shows the relationship between weight and MPG.

See @tbl-summary for summary statistics.

```{r}
#| label: tbl-summary
#| tbl-cap: "Summary statistics"

summary(mtcars[, c("mpg", "wt", "hp")])
```
```

**What's needed:**
1. ✅ Syntax highlighting for R code (both editors can do)
2. ✅ Code block rendering (both editors can do)
3. ⚠️ Execute R code chunks (needs backend)
4. ⚠️ Display R outputs (plots, tables) (needs custom rendering)
5. ⚠️ Cross-references (@fig-, @tbl-) (needs Quarto parser)
6. ⚠️ Live preview as you type (needs full integration)

---

## R Code Rendering Comparison

### 1. Syntax Highlighting

#### ProseMirror

**Using `prosemirror-highlight`:**
```typescript
import { languages } from '@codemirror/language-data'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

// Define R syntax highlighting
const rHighlight = HighlightStyle.define([
  { tag: t.keyword, color: "#cf222e" },        // if, else, function
  { tag: t.string, color: "#0a3069" },         // "text"
  { tag: t.comment, color: "#6e7781" },        // # comments
  { tag: t.function(t.variableName), color: "#8250df" }, // mean(), sum()
  { tag: t.operator, color: "#000000" },       // <-, +, -
  { tag: t.number, color: "#0550ae" }          // 123, 3.14
])

// Apply to code block node view
class CodeBlockView {
  constructor(node, view, getPos) {
    this.dom = document.createElement('pre')
    this.dom.className = 'code-block'

    const code = document.createElement('code')
    code.className = `language-${node.attrs.language}`
    code.textContent = node.textContent

    // Apply syntax highlighting
    highlightCode(code, node.attrs.language)
    this.dom.appendChild(code)
  }
}
```

**Implementation:** 100-150 lines custom code
**Quality:** Good (using CodeMirror's highlighter)

#### Milkdown

**Using `@milkdown/plugin-prism`:**
```typescript
import { Editor } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { prism } from '@milkdown/plugin-prism' // ← Syntax highlighting plugin
import { refractor } from 'refractor/lib/common'
import r from 'refractor/lang/r.js' // ← R language support

// Register R language
refractor.register(r)

const editor = await Editor.make()
  .use(commonmark)
  .use(prism)  // ← Automatically highlights R code blocks
  .create()
```

**Implementation:** ~10 lines with plugin
**Quality:** Excellent (Prism.js)

**Winner: Milkdown** (10 lines vs 100-150 lines)

---

### 2. Code Block Rendering (Static)

#### ProseMirror

```typescript
// Custom node view for code blocks
class CodeBlockView {
  dom: HTMLElement

  constructor(node, view, getPos) {
    this.dom = document.createElement('pre')
    this.dom.className = 'code-block'

    const code = document.createElement('code')
    code.className = `language-${node.attrs.language || 'text'}`
    code.textContent = node.textContent

    // Apply Prism.js highlighting
    if (window.Prism && node.attrs.language) {
      const html = Prism.highlight(
        node.textContent,
        Prism.languages[node.attrs.language],
        node.attrs.language
      )
      code.innerHTML = html
    }

    this.dom.appendChild(code)
  }

  update(node) {
    // Re-highlight on update
    return true
  }
}

// Register node view
const editorView = new EditorView({
  nodeViews: {
    code_block: (node, view, getPos) => new CodeBlockView(node, view, getPos)
  }
})
```

**Implementation:** 150+ lines
**Features:** Basic highlighting, no execution

#### Milkdown

```typescript
import { prism } from '@milkdown/plugin-prism'
import { refractor } from 'refractor/lib/common'
import r from 'refractor/lang/r.js'

refractor.register(r)

editor.use(prism) // Done!
```

**Implementation:** ~10 lines
**Features:** Full syntax highlighting for R

**Winner: Milkdown** (built-in plugin)

---

### 3. Live R Code Execution

**Critical Insight:** This is NOT an editor feature - it's a **backend architecture** decision.

Both editors need the same architecture:

```
┌─────────────────────────────────────────────────────────┐
│                 Editor (Milkdown/ProseMirror)           │
│  - Parse R code blocks from markdown                    │
│  - Display code with syntax highlighting                │
│  - Trigger execution on user action                     │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│              Tauri Backend (Rust)                       │
│  - Receive R code from frontend                         │
│  - Execute via R subprocess                             │
│  - Capture outputs (stdout, plots, errors)              │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│                 R Process                                │
│  - Execute code in R session                            │
│  - Generate plots (save to temp PNG/SVG)                │
│  - Return results as JSON                               │
└─────────────────────────────────────────────────────────┘
```

**Neither editor has advantage here** - both require custom backend.

---

## Quarto Integration Analysis

### Quarto Workflow Options

#### Option 1: Full Quarto Render (External)

**How it works:**
1. User edits .qmd file in Scribe
2. Click "Render" button
3. Tauri calls `quarto render document.qmd`
4. Quarto generates HTML output
5. Display in preview panel

**Pros:**
- ✅ Full Quarto feature support (no custom parser needed)
- ✅ All R packages work (ggplot2, knitr, etc.)
- ✅ Official Quarto output (citations, cross-refs, etc.)

**Cons:**
- ❌ NOT live (requires manual render)
- ❌ Slow (full document rebuild)
- ❌ Separate preview window

**Editor choice:** Doesn't matter (both work the same)

#### Option 2: Live Chunk Execution (Hybrid)

**How it works:**
1. User edits code chunk in editor
2. Click "Run" button (or Cmd+Enter)
3. Tauri executes ONLY that chunk
4. Insert output below chunk (inline)
5. Continue editing

**Pros:**
- ✅ Fast feedback (single chunk execution)
- ✅ Live feel (like RStudio)
- ✅ Iterative development

**Cons:**
- ⚠️ Need chunk parser (extract ```{r} blocks)
- ⚠️ Need R session management (keep state)
- ⚠️ Need output rendering (plots, tables)

**Editor choice:** Milkdown easier (plugin for chunk detection)

#### Option 3: True Live Preview (Complex)

**How it works:**
1. User types in editor
2. On every keystroke (debounced):
   - Parse Quarto document
   - Execute changed chunks
   - Re-render cross-references
   - Update preview pane
3. Show live HTML output

**Pros:**
- ✅ True WYSIWYG experience
- ✅ Instant feedback
- ✅ No "render" step needed

**Cons:**
- ❌ Very complex (full Quarto parser in JS)
- ❌ Performance issues (re-executing R constantly)
- ❌ R session management nightmare
- ❌ 3-6 months development time

**Recommendation:** Don't do this. Use Option 1 or 2.

---

## Detailed Comparison Table

| Feature | ProseMirror | Milkdown | Winner |
|---------|-------------|----------|--------|
| **R Code Features** | | | |
| Syntax highlighting (R) | Prism.js (custom) | ✅ @milkdown/plugin-prism | **Milkdown** |
| Code folding | Custom | Custom | **Tie** |
| Line numbers | Custom | Custom | **Tie** |
| R keyword highlighting | Manual setup | ✅ Refractor R lang | **Milkdown** |
| Tidyverse syntax | Same as R | Same as R | **Tie** |
| **Code Execution** | | | |
| Run chunk (Cmd+Enter) | Custom command | Custom command | **Tie** |
| Execute all chunks | Custom | Custom | **Tie** |
| R session management | Tauri backend | Tauri backend | **Tie** |
| Output rendering | Custom | Custom | **Tie** |
| Plot display (PNG/SVG) | Custom | Custom | **Tie** |
| Table rendering | Custom | ✅ @milkdown/plugin-table | **Milkdown** |
| Error messages | Custom | Custom | **Tie** |
| **Quarto Specific** | | | |
| YAML frontmatter | Custom parser | Custom parser | **Tie** |
| Code chunk options `#\|` | Custom parser | Custom parser | **Tie** |
| Cross-references @fig- | Custom | Custom | **Tie** |
| Citations [@ref] | Custom | ✅ @milkdown/plugin-citation | **Milkdown** |
| Callouts (:::) | Custom | Possible plugin | **Milkdown** |
| Divs and spans | Custom | Custom | **Tie** |
| **Live Preview** | | | |
| Markdown → HTML | Built-in | Built-in | **Tie** |
| Quarto → HTML | External `quarto render` | External `quarto render` | **Tie** |
| Live chunk execution | Custom architecture | Custom architecture | **Tie** |
| **Developer Experience** | | | |
| Setup complexity | High | Medium | **Milkdown** |
| Code to write (R + Quarto) | 500-800 lines | 200-400 lines | **Milkdown** |
| Maintenance burden | High (all custom) | Medium (plugins + custom) | **Milkdown** |

---

## Real-World R + Quarto Workflow

### Scenario: Statistical Analysis Document

**Document:**
```qmd
---
title: "Regression Analysis"
format: html
---

## Data Exploration

```{r}
library(tidyverse)
data <- read_csv("data.csv")
glimpse(data)
```

## Model Fitting

```{r}
model <- lm(mpg ~ wt + hp, data = mtcars)
summary(model)
```

```{r}
#| label: fig-residuals
#| fig-cap: "Residual plot"

plot(model, which = 1)
```

See @fig-residuals for model diagnostics.
```

### Workflow Comparison

#### With ProseMirror + Custom Backend

**Setup (3-5 days):**
1. Create custom code block node view (150 lines)
2. Add R syntax highlighting with Prism.js (100 lines)
3. Add "Run Chunk" button UI (50 lines)
4. Implement Tauri R execution backend (200 lines)
5. Add output rendering (plots, tables, errors) (150 lines)
6. Add cross-reference parser (100 lines)

**Total:** 750+ lines custom code

**User Experience:**
1. Edit code in ProseMirror
2. Click "Run Chunk" button
3. Wait 1-3 seconds
4. See output appear below chunk
5. Edit, run again, repeat

#### With Milkdown + Plugins + Custom Backend

**Setup (2-4 days):**
1. Use `@milkdown/plugin-prism` for R highlighting (10 lines)
2. Use `@milkdown/plugin-table` for table rendering (10 lines)
3. Add "Run Chunk" button UI (50 lines)
4. Implement Tauri R execution backend (200 lines)
5. Add custom output rendering plugin (100 lines)
6. Add cross-reference parser (100 lines)

**Total:** 470 lines (38% less code)

**User Experience:** Identical to ProseMirror

**Winner: Milkdown** (less code, same UX)

---

## Quarto Live Editing: Implementation Architecture

### Recommended Approach: Hybrid Live Execution

```typescript
// File: src/renderer/src/lib/quarto-live.ts

import { invoke } from '@tauri-apps/api/tauri'

interface RChunk {
  id: string           // Unique chunk ID
  code: string         // R code to execute
  options: ChunkOptions // #| label, fig-cap, etc.
  lineStart: number    // Position in document
  lineEnd: number
}

interface ChunkOutput {
  stdout: string       // Text output
  stderr: string       // Error messages
  plots: string[]      // Base64-encoded PNG images
  tables: string       // HTML table
  executionTime: number // ms
}

export class QuartoLiveEditor {
  private rSessionId: string | null = null

  async startRSession() {
    // Initialize R session in Tauri backend
    this.rSessionId = await invoke('r_start_session', {
      workingDir: '/path/to/project'
    })
  }

  async executeChunk(chunk: RChunk): Promise<ChunkOutput> {
    // Send R code to Tauri backend
    const output = await invoke('r_execute_chunk', {
      sessionId: this.rSessionId,
      code: chunk.code,
      options: chunk.options
    })

    return output
  }

  async renderQuarto(qmdPath: string): Promise<string> {
    // Full Quarto render (for final preview)
    const htmlPath = await invoke('quarto_render', {
      inputPath: qmdPath,
      format: 'html'
    })

    return htmlPath
  }

  parseChunks(markdown: string): RChunk[] {
    // Extract R code chunks from markdown
    const chunks: RChunk[] = []
    const regex = /```\{r([^}]*)\}\n([\s\S]*?)```/g

    let match
    while ((match = regex.exec(markdown)) !== null) {
      const options = this.parseChunkOptions(match[1])
      chunks.push({
        id: options.label || `chunk-${chunks.length}`,
        code: match[2],
        options,
        lineStart: markdown.substring(0, match.index).split('\n').length,
        lineEnd: markdown.substring(0, match.index + match[0].length).split('\n').length
      })
    }

    return chunks
  }

  private parseChunkOptions(optionString: string): ChunkOptions {
    // Parse #| label: fig-scatter format
    const lines = optionString.split('\n').filter(l => l.trim().startsWith('#|'))
    const options: ChunkOptions = {}

    for (const line of lines) {
      const [key, value] = line.replace('#|', '').split(':').map(s => s.trim())
      options[key] = value
    }

    return options
  }
}
```

### Tauri Backend (Rust)

```rust
// File: src-tauri/src/r_execution.rs

use std::process::{Command, Stdio};
use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize)]
pub struct RSession {
    id: String,
    working_dir: String,
    environment: HashMap<String, String>,
}

#[derive(Serialize, Deserialize)]
pub struct ChunkOutput {
    stdout: String,
    stderr: String,
    plots: Vec<String>,  // Base64-encoded PNGs
    tables: String,
    execution_time: u64,
}

#[tauri::command]
pub fn r_start_session(working_dir: String) -> Result<String, String> {
    let session_id = Uuid::new_v4().to_string();

    // Initialize R session (keep process alive)
    // Store session in global state

    Ok(session_id)
}

#[tauri::command]
pub async fn r_execute_chunk(
    session_id: String,
    code: String,
    options: HashMap<String, String>
) -> Result<ChunkOutput, String> {
    let start = std::time::Instant::now();

    // Create temp R script
    let temp_dir = std::env::temp_dir();
    let script_path = temp_dir.join(format!("chunk_{}.R", session_id));

    // Wrap code to capture plots
    let wrapped_code = format!(
        r#"
        png(filename = "{}/plot_%03d.png", width = 800, height = 600)
        {}
        dev.off()
        "#,
        temp_dir.display(),
        code
    );

    std::fs::write(&script_path, wrapped_code)
        .map_err(|e| e.to_string())?;

    // Execute R script
    let output = Command::new("Rscript")
        .arg(&script_path)
        .current_dir(&working_dir)
        .output()
        .map_err(|e| e.to_string())?;

    // Collect plot files
    let mut plots = Vec::new();
    for entry in std::fs::read_dir(&temp_dir).unwrap() {
        let entry = entry.unwrap();
        let path = entry.path();
        if path.to_str().unwrap().contains("plot_") {
            let png_data = std::fs::read(&path).unwrap();
            let base64 = base64::encode(&png_data);
            plots.push(base64);

            // Clean up
            std::fs::remove_file(&path).ok();
        }
    }

    Ok(ChunkOutput {
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        plots,
        tables: String::new(), // TODO: Parse from stdout
        execution_time: start.elapsed().as_millis() as u64,
    })
}

#[tauri::command]
pub async fn quarto_render(
    input_path: String,
    format: String
) -> Result<String, String> {
    // Run quarto render
    let output = Command::new("quarto")
        .args(&["render", &input_path, "--to", &format])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    // Return path to generated HTML
    let html_path = input_path.replace(".qmd", ".html");
    Ok(html_path)
}
```

### Milkdown Plugin for Live Execution

```typescript
// File: src/renderer/src/lib/milkdown-r-execution-plugin.ts

import { $prose, $ctx } from '@milkdown/utils'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import { Decoration, DecorationSet } from '@milkdown/prose/view'

const rExecutionKey = new PluginKey('rExecution')

export const rExecutionPlugin = $prose((ctx) => {
  const quartoEditor = new QuartoLiveEditor()

  return new Plugin({
    key: rExecutionKey,

    state: {
      init() {
        return {
          outputs: new Map<string, ChunkOutput>()
        }
      },

      apply(tr, value) {
        // Listen for "run chunk" transactions
        const runChunk = tr.getMeta('runChunk')
        if (runChunk) {
          const { chunkId, code } = runChunk

          // Execute asynchronously
          quartoEditor.executeChunk({ id: chunkId, code }).then(output => {
            value.outputs.set(chunkId, output)
            // Force update to show output
            tr.setMeta('updateOutput', true)
          })
        }

        return value
      }
    },

    props: {
      decorations(state) {
        const { outputs } = this.getState(state)
        const decorations = []

        // Add output decorations below each chunk
        outputs.forEach((output, chunkId) => {
          // Find chunk position in document
          const chunkPos = findChunkPosition(state.doc, chunkId)

          if (chunkPos) {
            // Create widget decoration for output
            const outputWidget = Decoration.widget(chunkPos.end, () => {
              const div = document.createElement('div')
              div.className = 'r-output'

              // Render stdout
              if (output.stdout) {
                const pre = document.createElement('pre')
                pre.textContent = output.stdout
                div.appendChild(pre)
              }

              // Render plots
              output.plots.forEach(base64 => {
                const img = document.createElement('img')
                img.src = `data:image/png;base64,${base64}`
                img.className = 'r-plot'
                div.appendChild(img)
              })

              // Render errors
              if (output.stderr) {
                const err = document.createElement('pre')
                err.className = 'r-error'
                err.textContent = output.stderr
                div.appendChild(err)
              }

              return div
            })

            decorations.push(outputWidget)
          }
        })

        return DecorationSet.create(state.doc, decorations)
      }
    }
  })
})
```

---

## Comparison Summary

### Code Volume Estimate

| Component | ProseMirror | Milkdown |
|-----------|-------------|----------|
| R syntax highlighting | 150 lines | 10 lines (plugin) |
| Code block rendering | 100 lines | 10 lines (plugin) |
| Chunk parser | 100 lines | 100 lines |
| Execute chunk UI | 50 lines | 50 lines |
| Output rendering | 150 lines | 100 lines (plugin helps) |
| Tauri backend | 200 lines | 200 lines |
| Cross-references | 100 lines | 50 lines (citation plugin) |
| **Total** | **850 lines** | **520 lines** |

**Milkdown:** 39% less code to write

---

## Final Recommendation for Scribe

### Use Milkdown + Hybrid Quarto Architecture

**Why:**
1. ✅ **Less code** (520 lines vs 850 lines)
2. ✅ **Built-in R highlighting** (@milkdown/plugin-prism)
3. ✅ **Table rendering plugin** (@milkdown/plugin-table)
4. ✅ **Citation plugin** for [@ref] syntax
5. ✅ **Easier maintenance** (plugins vs custom code)

### Architecture: Three-Tier System

```
┌────────────────────────────────────────────────┐
│  Milkdown Editor (Frontend)                    │
│  - Edit .qmd files                             │
│  - Syntax highlighting (R, Python, Julia)      │
│  - "Run Chunk" button (Cmd+Enter)              │
│  - Display outputs inline                      │
└────────────┬───────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────┐
│  Tauri Backend (Rust)                          │
│  - Manage R sessions                           │
│  - Execute R code chunks                       │
│  - Capture outputs (plots, tables, errors)     │
│  - Call `quarto render` for final preview      │
└────────────┬───────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────┐
│  R / Quarto (External Processes)               │
│  - R session for code execution                │
│  - Quarto CLI for full document rendering      │
└────────────────────────────────────────────────┘
```

### User Experience

**Iterative Development:**
1. Edit R code in chunk
2. Press Cmd+Enter
3. See output below chunk in ~1-2 seconds
4. Repeat

**Final Preview:**
1. Click "Render Quarto"
2. Full quarto render in background (~5-10 seconds)
3. Open HTML in browser or preview panel

**This gives RStudio-like experience without the complexity of true live preview.**

---

## Implementation Timeline

### Week 1: Milkdown Migration (5 days)
- Migrate from CodeMirror to Milkdown
- Add R syntax highlighting plugin
- Add table rendering plugin
- Basic Quarto document editing

### Week 2: R Execution Backend (5 days)
- Tauri R session management
- Execute R chunks
- Capture outputs (stdout, plots, errors)
- Display outputs inline

### Week 3: Quarto Integration (3-5 days)
- Parse Quarto chunk options (#| label, etc.)
- Cross-reference support (@fig-, @tbl-)
- Citation rendering ([@ref])
- Full quarto render command

### Week 4: Polish (2-3 days)
- Error handling
- Performance optimization
- E2E tests
- Documentation

**Total: 15-18 days for full R + Quarto support**

---

## Conclusion

**Milkdown wins for R + Quarto:**
- ✅ 39% less code (520 vs 850 lines)
- ✅ Better plugin ecosystem
- ✅ Easier to extend
- ✅ Same performance for R execution (backend is the bottleneck, not editor)

**Both editors need the same Tauri backend** - the editor choice doesn't affect R execution capabilities.

**Recommendation: Migrate to Milkdown now, add R/Quarto features incrementally.**
