# Hybrid Editor Architecture

> **Developer Documentation for Scribe's Dual-Editor System**

---

## Architecture Overview

Scribe uses a **hybrid editor architecture** that routes files to specialized editors based on file extension. This provides optimal editing experience for different content types while maintaining a unified interface.

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│                    (Main Application)                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      EditorRouter                            │
│        File Extension Detection & Editor Selection          │
│              src/renderer/src/components/                    │
│                   EditorRouter.tsx                           │
└─────────────────┬───────────────────────┬───────────────────┘
                  │                       │
      ┌───────────▼──────────┐  ┌────────▼──────────────┐
      │  MilkdownEditor.tsx  │  │ MonacoCodeEditor.tsx  │
      │  (.md, .qmd)         │  │ (.tex, .R, .py)       │
      │                      │  │                       │
      │  - Live preview      │  │  - Syntax highlight   │
      │  - LaTeX math        │  │  - LaTeX compile      │
      │  - Code blocks       │  │  - R execution        │
      │  - Wiki links        │  │  - PDF preview        │
      └──────────────────────┘  └───────────────────────┘
                  │                       │
                  └───────────┬───────────┘
                              ▼
                  ┌───────────────────────┐
                  │    editorStore.ts     │
                  │   (Zustand State)     │
                  │                       │
                  │ - Current file        │
                  │ - Editor instances    │
                  │ - Cursor/scroll pos   │
                  │ - Dirty state         │
                  └───────────┬───────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │    Tauri Backend      │
                  │ src-tauri/src/        │
                  │                       │
                  │ - LaTeX compile       │
                  │ - R execution         │
                  │ - File operations     │
                  └───────────────────────┘
```

---

## Core Components

### 1. EditorRouter

**File:** `src/renderer/src/components/EditorRouter.tsx`

**Purpose:** Routes files to appropriate editor based on extension

**Routing Logic:**
```typescript
export function getEditorTypeForFile(filePath: string | null): EditorType {
  if (!filePath) return 'text'

  const ext = filePath.split('.').pop()?.toLowerCase()

  if (ext === 'md' || ext === 'qmd') return 'milkdown'
  if (ext === 'tex' || ext === 'r' || ext === 'py') return 'monaco'

  return 'text'
}
```

**Key Features:**
- Automatic editor selection
- Unsaved changes protection
- File switch handling
- State synchronization

**Unsaved Changes Flow:**
1. User tries to switch files
2. EditorRouter checks `currentFile.isDirty`
3. If dirty, shows `UnsavedChangesDialog`
4. Waits for user decision (Save/Discard/Cancel)
5. Proceeds or cancels based on choice

---

### 2. MilkdownEditor

**File:** `src/renderer/src/components/MilkdownEditor.tsx`

**Purpose:** Live markdown preview editor using Milkdown

**Plugins:**
- `@milkdown/plugin-math` — LaTeX math rendering (KaTeX)
- `@milkdown/plugin-prism` — Code syntax highlighting
- `@milkdown/plugin-history` — Undo/redo support
- `@milkdown/plugin-clipboard` — Copy/paste handling

**Features:**
- Live preview as you type
- Inline math: `$...$`
- Block math: `$$...$$`
- GitHub-flavored markdown
- Wiki links (future)

**State Management:**
```typescript
interface MilkdownState {
  instance: MilkdownEditor | null
  cursorPosition: number
  scrollPosition: number
}
```

**Future Work:**
- R chunk execution inline
- Quarto output rendering
- Better wiki link support

---

### 3. MonacoCodeEditor

**File:** `src/renderer/src/components/MonacoCodeEditor.tsx`

**Purpose:** Code editor with LaTeX/R execution capabilities

**Languages Supported:**
```typescript
export function getMonacoLanguage(filePath: string | null): string {
  const ext = filePath.split('.').pop()?.toLowerCase()

  switch (ext) {
    case 'tex': return 'latex'
    case 'r': return 'r'
    case 'py': return 'python'
    case 'js': return 'javascript'
    case 'ts': return 'typescript'
    case 'json': return 'json'
    default: return 'plaintext'
  }
}
```

**LaTeX Features:**
- Compilation via `api.compileLatex()`
- Side-by-side PDF preview (`PdfViewer.tsx`)
- Auto-compile with 2.5s debounce
- Error/warning display
- Keyboard shortcut: Cmd+B

**R Features:**
- Execution via `api.executeRChunk()`
- Inline output display (`ROutputDisplay.tsx`)
- Plot rendering (base64 PNG)
- Keyboard shortcut: Cmd+Enter

**State Management:**
```typescript
interface MonacoState {
  instance: MonacoEditor | null
  language: string
  pdfPath: string | null
  isCompiling: boolean
  cursorPosition: { lineNumber: number; column: number } | null
  scrollTop: number
}
```

**Event Listeners:**
- `onDidChangeCursorPosition` → Save cursor position
- `onDidScrollChange` → Save scroll position

---

### 4. ROutputDisplay

**File:** `src/renderer/src/components/ROutputDisplay.tsx`

**Purpose:** Display R execution results

**Input:**
```typescript
interface RExecutionResult {
  success: boolean
  stdout: string
  stderr: string
  plots: string[]  // Base64-encoded PNG images
  error?: string
}
```

**Output Sections:**
- **Success/Error Indicator:** Green/red dot
- **Output:** stdout (console output)
- **Warnings/Messages:** stderr (yellow)
- **Plots:** Grid of base64 images
- **Error:** Error message (red)

**Rendering:**
```typescript
<img
  src={`data:image/png;base64,${plot}`}
  alt={`Plot ${index + 1}`}
  className="w-full h-auto"
/>
```

---

### 5. UnsavedChangesDialog

**File:** `src/renderer/src/components/UnsavedChangesDialog.tsx`

**Purpose:** Modal dialog for unsaved changes warning

**Props:**
```typescript
interface UnsavedChangesDialogProps {
  fileName: string
  onSave: () => void | Promise<void>
  onDiscard: () => void
  onCancel: () => void
}
```

**Actions:**
1. **Save** — Marks file as clean, switches to pending file
2. **Don't Save** — Discards changes, switches to pending file
3. **Cancel** — Closes dialog, stays on current file

**UI:**
- Modal overlay (z-50)
- Filename display
- Warning message
- Three action buttons

---

### 6. PdfViewer

**File:** `src/renderer/src/components/PdfViewer.tsx`

**Purpose:** Display PDF preview for LaTeX compilation

**Library:** `react-pdf` (PDF.js wrapper)

**Features:**
- Page navigation
- Zoom controls
- Full-width display
- Loading states
- Error handling

**Integration:**
```typescript
// In MonacoCodeEditor.tsx
{isLatexFile && showPdfPreview && pdfPath && (
  <div className="w-1/2 border-l border-nexus-border">
    <PdfViewer pdfPath={pdfPath} />
  </div>
)}
```

---

## State Management (Zustand)

### editorStore.ts

**File:** `src/renderer/src/store/editorStore.ts`

**Purpose:** Centralized state for hybrid editor system

**State Structure:**
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
    cursorPosition: { lineNumber: number; column: number } | null
    scrollTop: number
  }
}
```

**Key Actions:**
- `setCurrentFile(file)` — Update current file
- `updateContent(content)` — Mark file as dirty
- `setDirty(isDirty)` — Set dirty flag
- `saveMilkdownState(cursor, scroll)` — Save Milkdown position
- `saveMonacoCursorScroll(cursor, scrollTop)` — Save Monaco position
- `setMonacoInstance(instance)` — Store Monaco instance
- `reset()` — Reset to initial state

**Persistence:**
```typescript
persist(
  (set) => ({ ...state }),
  {
    name: 'scribe-editor-storage',
    partialize: (state) => ({
      // Only persist serializable data
      milkdown: {
        cursorPosition: state.milkdown.cursorPosition,
        scrollPosition: state.milkdown.scrollPosition
      },
      monaco: {
        language: state.monaco.language,
        cursorPosition: state.monaco.cursorPosition,
        scrollTop: state.monaco.scrollTop
      }
    })
  }
)
```

**Why Partialize:**
- Editor instances aren't serializable
- Compilation state is ephemeral
- PDF paths are temporary

---

## Backend Integration (Tauri)

### LaTeX Compilation

**File:** `src-tauri/src/academic.rs`

**Function:** `compile_latex()`

**Process:**
1. Create temp directory
2. Write LaTeX content to file
3. Run `pdflatex` command
4. Capture stdout/stderr
5. Parse errors/warnings
6. Return PDF path on success

**Error Parsing:**
```rust
fn parse_latex_errors(output: &str) -> Vec<LatexError> {
    // Parse lines like:
    // ! Undefined control sequence.
    // l.42 \invalidcommand

    // Returns: Vec<LatexError>
}
```

**Return Type:**
```rust
struct LatexCompileResult {
    success: bool,
    pdf_path: Option<String>,
    errors: Vec<LatexError>,
    warnings: Vec<String>
}
```

---

### R Execution

**File:** `src-tauri/src/academic.rs`

**Function:** `execute_r_chunk()`

**Process:**
1. Create temp directory
2. Inject plot capture code
3. Write R script to file
4. Run `Rscript` command
5. Capture stdout/stderr
6. Extract plot file paths
7. Read plot files as bytes
8. Encode plots as base64
9. Clean up temp files

**Plot Capture Mechanism:**
```r
# Injected at top of script
.scribe_plot_counter <- 0
.scribe_plot_files <- character(0)

# Override png() function
.scribe_original_png <- png
png <- function(...) {
  .scribe_plot_counter <<- .scribe_plot_counter + 1
  plot_file <- tempfile(pattern = paste0("scribe_plot_", .scribe_plot_counter, "_"), fileext = ".png")
  .scribe_plot_files <<- c(.scribe_plot_files, plot_file)
  .scribe_original_png(plot_file, width = 800, height = 600, ...)
}

# Auto-capture base graphics plots
setHook("plot.new", function() {
  if (dev.cur() == 1) {
    png()
  }
}, "replace")

# ... user code ...

# Print plot paths for extraction
cat("\n__SCRIBE_PLOTS__\n")
cat(.scribe_plot_files, sep = "\n")
```

**Plot Extraction:**
```rust
// Extract plot paths from stdout
let plot_marker = "__SCRIBE_PLOTS__";
if let Some(marker_pos) = stdout.find(plot_marker) {
    let plot_section = &stdout[marker_pos + plot_marker.len()..];
    let plot_paths: Vec<&str> = plot_section.lines()
        .filter(|line| !line.trim().is_empty())
        .collect();

    // Read and encode each plot
    for path in plot_paths {
        let plot_data = std::fs::read(path)?;
        let base64_plot = base64::engine::general_purpose::STANDARD.encode(plot_data);
        plots.push(base64_plot);
    }
}
```

**Return Type:**
```rust
struct RExecutionResult {
    success: bool,
    stdout: String,
    stderr: String,
    plots: Vec<String>,  // Base64-encoded PNGs
    error: Option<String>
}
```

---

## API Layer

### api.ts

**File:** `src/renderer/src/lib/api.ts`

**Purpose:** Unified API for Tauri and Browser modes

**Pattern:**
```typescript
// LaTeX compilation
compileLatex: withToast(
  rawApi.compileLatex,
  'Compilation failed',
  'Compiled successfully'
)

// R execution
executeRChunk: withToast(
  rawApi.executeRChunk,
  'R execution failed',
  'R code executed successfully'
)
```

**Toast Wrapper:**
```typescript
function withToast<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorMessage: string,
  successMessage?: string
) {
  return async (...args: T): Promise<R> => {
    try {
      const result = await fn(...args)
      if (successMessage) {
        toast.success(successMessage)
      }
      return result
    } catch (error) {
      toast.error(`${errorMessage}: ${error}`)
      throw error
    }
  }
}
```

---

## Testing Strategy

### Test Files

1. **EditorRouter.test.tsx** (21 tests)
   - File routing (.md/.qmd/.tex/.R/.py)
   - Editor switching
   - Unsaved changes dialog
   - Edge cases

2. **MonacoCodeEditor.test.tsx** (24 tests)
   - Editor initialization
   - LaTeX compilation
   - R execution
   - State management
   - Error handling

### Mocking Strategy

**Monaco Editor:**
```typescript
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange, onMount }: any) => {
    const mockEditor = {
      focus: vi.fn(),
      updateOptions: vi.fn(),
      addCommand: vi.fn(),
      getPosition: vi.fn(() => ({ lineNumber: 1, column: 1 })),
      setPosition: vi.fn(),
      getScrollTop: vi.fn(() => 0),
      setScrollTop: vi.fn(),
      onDidChangeCursorPosition: vi.fn(() => ({ dispose: vi.fn() })),
      onDidScrollChange: vi.fn(() => ({ dispose: vi.fn() }))
    }

    setTimeout(() => onMount(mockEditor, mockMonaco), 0)

    return <textarea data-testid="monaco-textarea" value={value} onChange={...} />
  }
}))
```

**API Calls:**
```typescript
vi.mock('../lib/api', () => ({
  api: {
    compileLatex: vi.fn(),
    executeRChunk: vi.fn()
  }
}))

// In tests:
vi.mocked(api.api.compileLatex).mockResolvedValue({
  success: true,
  pdfPath: '/tmp/output.pdf',
  errors: [],
  warnings: []
})
```

### Test Patterns

**User Interaction:**
```typescript
const user = userEvent.setup()
const button = screen.getByText(/Compile/)
await user.click(button)

await waitFor(() => {
  expect(api.api.compileLatex).toHaveBeenCalled()
})
```

**Async State Updates:**
```typescript
await waitFor(() => {
  expect(screen.getByText(/Compiling.../)).toBeInTheDocument()
})
```

---

## Performance Considerations

### LaTeX Auto-Compile

**Debounce:** 2.5 seconds

**Why:**
- Compilation is slow (1-5 seconds)
- Prevents excessive compilation during rapid typing
- Allows user to finish thoughts before compiling

**Implementation:**
```typescript
useEffect(() => {
  if (!isLatexFile || !autoCompile || !filePath) return

  const timer = setTimeout(() => {
    handleCompileLatex()
  }, 2500)

  return () => clearTimeout(timer)
}, [content, isLatexFile, autoCompile, filePath])
```

### Monaco Cursor Tracking

**Throttling:** None (events already throttled by Monaco)

**Why:**
- Monaco events fire at reasonable intervals
- Zustand state updates are fast
- No performance impact observed

### R Plot Encoding

**Base64 vs File Paths:**
- **Base64:** Inline in result object, no file management
- **File Paths:** Require cleanup, path resolution issues
- **Decision:** Use base64 for simplicity

**Memory Impact:**
- 800x600 PNG ≈ 50-200 KB
- Base64 encoding ≈ +33% size
- Acceptable for typical use cases
- Future: Add option to save plots to disk

---

## Future Enhancements

### Planned Features

1. **Quarto R Chunks**
   - Execute R blocks in .qmd files
   - Inline output below chunks
   - Multiple chunk execution

2. **Python Execution**
   - Similar to R execution
   - Matplotlib plot capture
   - Jupyter-style output

3. **Multi-file LaTeX**
   - Main document + includes
   - BibTeX support
   - Cross-references

4. **Custom Plot Sizes**
   - User-configurable dimensions
   - Per-project settings

### Architecture Improvements

1. **Worker Threads**
   - Move compilation to background
   - Non-blocking UI during compilation

2. **Incremental Compilation**
   - Only recompile changed sections
   - Faster feedback loop

3. **Language Server Protocol**
   - Better autocomplete
   - Real-time diagnostics
   - Go-to-definition

---

## Development Workflow

### Adding a New Language

1. **Update `getMonacoLanguage()`:**
```typescript
case 'jl': return 'julia'
```

2. **Update `getEditorTypeForFile()`:**
```typescript
if (ext === 'jl') return 'monaco'
```

3. **Add language-specific features:**
```typescript
if (language === 'julia') {
  // Add Julia-specific button
}
```

4. **Add backend support:**
```rust
// In src-tauri/src/academic.rs
pub fn execute_julia_code() { ... }
```

5. **Add API method:**
```typescript
// In api.ts
executeJuliaCode: (code: string) => invoke('execute_julia_code', { code })
```

6. **Add tests:**
```typescript
// In MonacoCodeEditor.test.tsx
it('should show Run button for .jl files', () => { ... })
```

### Adding a New Editor Feature

1. **Update state:**
```typescript
// In editorStore.ts
monaco: {
  ...existingState,
  newFeature: initialValue
}
```

2. **Add action:**
```typescript
setNewFeature: (value) => set((state) => ({
  monaco: { ...state.monaco, newFeature: value }
}))
```

3. **Update component:**
```typescript
// In MonacoCodeEditor.tsx
const { newFeature, setNewFeature } = useEditorStore()
```

4. **Add UI:**
```typescript
<button onClick={() => setNewFeature(newValue)}>
  Feature Button
</button>
```

5. **Add tests:**
```typescript
it('should toggle feature when button clicked', async () => { ... })
```

---

## Debugging Tips

### EditorRouter Issues

**Problem:** Wrong editor loading

**Debug:**
```typescript
console.log('[EditorRouter] File:', filePath)
console.log('[EditorRouter] Extension:', filePath.split('.').pop())
console.log('[EditorRouter] Editor type:', editorType)
```

### State Not Persisting

**Check:**
1. Is `partialize` excluding the field?
2. Is the field serializable? (no functions, instances)
3. Is localStorage working? (check browser console)

**Debug:**
```typescript
// In editorStore.ts
persist(
  (set) => ({
    ...state,
    // Add logging
    setCurrentFile: (file) => {
      console.log('[editorStore] Setting file:', file)
      set(...)
    }
  }),
  {
    name: 'scribe-editor-storage',
    onRehydrateStorage: () => (state) => {
      console.log('[editorStore] Rehydrated:', state)
    }
  }
)
```

### LaTeX Compilation Hangs

**Check:**
1. Is pdflatex installed?
2. Does the LaTeX code have infinite loops?
3. Is there a modal dialog blocking?

**Debug:**
```rust
// In src-tauri/src/academic.rs
println!("[LaTeX] Running command: {:?}", command);
println!("[LaTeX] Output: {}", output);
```

### R Execution Not Showing Plots

**Check:**
1. Did the plot command execute? (check stdout)
2. Was the plot file created? (check temp dir)
3. Was base64 encoding successful?

**Debug:**
```rust
// In src-tauri/src/academic.rs
println!("[R] Plot files: {:?}", plot_paths);
println!("[R] Plot data length: {}", plot_data.len());
```

---

## Code Style Guidelines

### TypeScript

- Use functional components
- Prefer hooks over class components
- Use TypeScript types (no `any`)
- Destructure props
- Use const for everything except loops

### React Patterns

```typescript
// ✅ Good
export function MyComponent({ prop1, prop2 }: Props) {
  const [state, setState] = useState(initialState)

  useEffect(() => {
    // effect
  }, [dependencies])

  return <div>...</div>
}

// ❌ Bad
export default function MyComponent(props: Props) {
  let state = useState(initialState)[0]

  useEffect(() => {
    // effect
  }) // missing dependencies

  return <div>...</div>
}
```

### Zustand Store

```typescript
// ✅ Good
const useStore = create<Store>()(
  persist(
    (set) => ({
      value: 0,
      setValue: (value) => set({ value })
    }),
    { name: 'store-name' }
  )
)

// ❌ Bad
const useStore = create((set, get) => ({
  value: 0,
  setValue: (value) => {
    const current = get().value
    set({ value: value + current })
  }
}))
```

### Rust Style

- Follow Rust conventions
- Use `?` for error propagation
- Prefer `match` over `if let` for exhaustiveness
- Add comments for complex logic

---

## Resources

### Documentation
- [Milkdown Docs](https://milkdown.dev/)
- [Monaco Editor Docs](https://microsoft.github.io/monaco-editor/)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [Tauri Docs](https://tauri.app/)

### Related Files
- `PLAN-HYBRID-EDITOR.md` — Implementation plan
- `CLAUDE.md` — AI assistant guidance
- `README.md` — User-facing overview
- `HYBRID-EDITOR-USER-GUIDE.md` — User documentation
