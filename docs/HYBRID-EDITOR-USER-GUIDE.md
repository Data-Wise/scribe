# Hybrid Editor User Guide

> **Scribe's Intelligent Multi-Editor System**

---

## Overview

Scribe uses a **dual-editor architecture** that automatically selects the best editor for each file type:

- **Markdown/Quarto files** (.md, .qmd) → **Milkdown Editor** with live preview
- **LaTeX files** (.tex) → **Monaco Editor** with compilation and PDF preview
- **R/Python files** (.R, .py) → **Monaco Editor** with code execution
- **Other files** → Plain text editor

**No configuration needed** — just open a file and Scribe picks the right editor automatically.

---

## File Type Support

### Markdown Files (.md)

**Editor:** Milkdown (live preview)

**Features:**
- Live markdown rendering as you type
- GitHub-flavored markdown support
- Inline LaTeX math: `$E = mc^2$`
- Block LaTeX math: `$$\int_0^1 x^2 dx$$`
- Syntax highlighting for code blocks
- Tables, lists, checkboxes
- Wiki-style links: `[[Note Title]]`

**Keyboard Shortcuts:**
- Standard text editing shortcuts work as expected
- See Settings for customizable shortcuts

---

### Quarto Files (.qmd)

**Editor:** Milkdown (live preview)

**Features:**
- Same as markdown files
- **Coming Soon:** R chunk execution inline
- **Coming Soon:** Output display below chunks

**Note:** Full Quarto support (R chunks, plots) will be available in the Monaco editor view.

---

### LaTeX Files (.tex)

**Editor:** Monaco (code editor with LaTeX support)

**Features:**
- Syntax highlighting for LaTeX commands
- Real-time compilation to PDF
- Side-by-side PDF preview
- Error highlighting with line numbers
- Auto-compile on save (optional)

**Keyboard Shortcuts:**
- **Cmd+B** (Mac) / **Ctrl+B** (Windows/Linux): Compile to PDF
- Auto-compile can be toggled in the editor header

**Workflow:**
1. Open a `.tex` file
2. Edit your LaTeX code
3. Press **Cmd+B** to compile
4. PDF preview appears on the right side
5. Errors/warnings shown at the bottom

**Tips:**
- Enable **Auto-compile** checkbox for automatic compilation 2.5 seconds after you stop typing
- Click **Hide Preview** to get more screen space for editing
- Compilation errors show line numbers for quick fixes

---

### R Files (.R)

**Editor:** Monaco (code editor with R support)

**Features:**
- Syntax highlighting for R code
- Run entire file or selected code
- Inline output display (stdout, stderr)
- Plot rendering (PNG images)
- Error highlighting

**Keyboard Shortcuts:**
- **Cmd+Enter** (Mac) / **Ctrl+Enter** (Windows/Linux): Run code

**Workflow:**
1. Open a `.R` file
2. Write your R code
3. Press **Cmd+Enter** to execute
4. Output appears below the editor:
   - Console output (stdout)
   - Warnings/messages (stderr)
   - Plots (rendered as images)
   - Errors (highlighted in red)
5. Click **Clear Output** to remove results

**Example:**
```r
# Simple plot
x <- 1:10
y <- x^2
plot(x, y, type = "l")

# Will display:
# - Console output: [empty]
# - Plot: line graph image
```

**Plot Support:**
- Base R plots: `plot()`, `hist()`, `barplot()`
- ggplot2: `ggplot() + geom_*(...)`
- Multiple plots supported
- Plots rendered at 800x600 pixels

---

### Python Files (.py)

**Editor:** Monaco (code editor with Python support)

**Features:**
- Syntax highlighting for Python code
- **Coming Soon:** Code execution

**Note:** Python execution support is planned for future releases.

---

## Switching Between Files

### Automatic Editor Selection

When you open a file, Scribe automatically:
1. Detects the file extension
2. Routes to the appropriate editor
3. Restores your cursor position and scroll location
4. Loads the file content

**No manual switching needed!**

### Unsaved Changes Protection

If you try to switch files with unsaved changes, Scribe shows a dialog with three options:

1. **Save** — Save changes and switch to the new file
2. **Don't Save** — Discard changes and switch to the new file
3. **Cancel** — Stay on the current file

**Tip:** Scribe auto-saves periodically, but the dialog prevents accidental data loss when switching files quickly.

---

## Editor State Persistence

Scribe remembers your work across sessions:

### What's Saved:
- **Cursor position** — Return to exactly where you left off
- **Scroll position** — View stays at the same location
- **Open files** — Previously open files restore on app restart
- **Editor preferences** — Auto-compile settings, preview visibility

### What's Not Saved:
- Compilation results (regenerated on demand)
- R execution output (re-run code to see results)

---

## LaTeX Compilation

### Supported Engines

- **pdflatex** (default) — Standard LaTeX compiler
- **xelatex** — Unicode and modern fonts
- **lualatex** — Lua scripting support

**Default:** pdflatex (covers 95% of use cases)

### Compilation Process

1. Scribe creates a temporary directory
2. Runs the LaTeX compiler
3. Captures stdout/stderr for errors
4. Generates PDF on success
5. Displays PDF in preview pane
6. Shows errors/warnings at bottom

### Error Handling

**Compilation Errors:**
- Displayed at the bottom of the editor
- Include line numbers for quick navigation
- Error message shows the LaTeX error text

**Example Error:**
```
Line 42: Undefined control sequence
```

**Warnings:**
- Shown in yellow
- First 5 warnings displayed
- Full count shown (e.g., "... and 12 more")

---

## R Code Execution

### How It Works

1. Scribe sends your R code to Rscript
2. Captures stdout (console output)
3. Captures stderr (warnings/messages)
4. Intercepts plot commands
5. Saves plots as PNG images
6. Encodes plots as base64 for display
7. Returns everything to the UI

### Plot Capture

Scribe automatically captures plots from:
- Base R: `plot()`, `hist()`, `barplot()`, etc.
- ggplot2: Any `ggplot()` object
- lattice: `xyplot()`, `bwplot()`, etc.

**No special code needed** — just use normal plotting commands.

### Output Display

**Green Dot (✓):** Execution successful
**Red Dot (✗):** Execution failed

**Output Sections:**
- **Output:** Console output (stdout)
- **Warnings/Messages:** R messages (stderr)
- **Plots:** Rendered images in grid layout
- **Error:** Error message (if execution failed)

### Clearing Output

Click **Clear Output** button to remove all execution results and start fresh.

---

## Keyboard Shortcuts

### Global (All Editors)
- **Cmd/Ctrl+S** — Save file
- **Cmd/Ctrl+W** — Close file
- **Cmd/Ctrl+N** — New note
- **Cmd/Ctrl+F** — Search notes

### LaTeX-Specific
- **Cmd/Ctrl+B** — Compile to PDF

### R-Specific
- **Cmd/Ctrl+Enter** — Run code

### Future Shortcuts
- **Cmd/Ctrl+Shift+Enter** — Run all R chunks (in .qmd files)

---

## Tips & Best Practices

### LaTeX
1. **Enable auto-compile** for live PDF updates while writing
2. **Disable auto-compile** when making many rapid changes (to avoid repeated compilations)
3. **Use the Hide Preview button** when you need more screen space
4. **Check errors at the bottom** if compilation fails

### R Code
1. **Run code frequently** to catch errors early
2. **Clear output** before re-running to avoid confusion
3. **Use comments** to document your analysis
4. **Save plots explicitly** if you need them outside Scribe

### File Organization
1. **Use descriptive filenames** — Scribe uses them in the UI
2. **Organize by project** — Keep related files together
3. **Use wiki links** (`[[Title]]`) to connect notes

---

## Troubleshooting

### LaTeX Won't Compile

**Check:**
1. Is LaTeX installed? (`pdflatex --version` in terminal)
2. Are there syntax errors in your LaTeX code?
3. Check the error message for the line number
4. Try compiling in terminal to see full error output

### R Code Won't Run

**Check:**
1. Is R installed? (`Rscript --version` in terminal)
2. Are there syntax errors in your R code?
3. Check the error message for details
4. Try running in RStudio to isolate the issue

### Unsaved Changes Dialog Keeps Appearing

**This means:**
- You have unsaved changes in the current file
- Scribe is protecting you from data loss

**To fix:**
1. Save your work (Cmd/Ctrl+S)
2. Or click "Don't Save" if you want to discard changes

### Editor Feels Slow

**Try:**
1. Disable auto-compile for LaTeX files
2. Clear R output before re-running code
3. Close unused files
4. Restart the app

---

## FAQ

### Q: Can I use my own LaTeX compiler?

**A:** Scribe uses the system-installed pdflatex/xelatex. Install your preferred compiler system-wide and Scribe will use it.

### Q: Can I change the R plot size?

**A:** Currently, plots are 800x600 pixels. Custom sizing support coming in a future update.

### Q: Does Scribe support Jupyter notebooks?

**A:** Not yet. Quarto (.qmd) files provide similar functionality and will support R chunks soon.

### Q: Can I use multiple editors side-by-side?

**A:** Not currently. Scribe follows the ADHD principle of "one thing at a time." You can switch files quickly though.

### Q: What happens to my cursor position when switching files?

**A:** Scribe saves your exact cursor position and scroll location. When you return to a file, you'll be exactly where you left off.

---

## Advanced Features

### Browser Mode

**What:** Run Scribe in your web browser (Chrome/Firefox/Safari)

**Launch:** `scribe browser` (from terminal CLI)

**Limitations:**
- No LaTeX compilation (requires native Tauri runtime)
- No R execution (requires native Tauri runtime)
- File editing and note-taking work normally
- Uses IndexedDB instead of SQLite

**Use Cases:**
- Quick note editing without launching desktop app
- Testing and demos
- Development

---

## Coming Soon

### Planned Features

1. **Quarto R Chunks** — Execute R code blocks in .qmd files
2. **Python Execution** — Run Python code like R code
3. **Custom Plot Sizes** — Configure plot dimensions
4. **Export to HTML** — Compile Quarto to HTML
5. **Multi-file LaTeX** — Support for projects with multiple .tex files

### Not Planned

- **Jupyter Notebook Support** — Use Quarto instead
- **Multi-editor Tabs** — ADHD principle: one thing at a time
- **Plugin System** — Keep Scribe simple and focused

---

## Getting Help

- **Documentation:** See `README.md` and `CLAUDE.md`
- **GitHub Issues:** https://github.com/Data-Wise/scribe/issues
- **Keyboard Shortcuts:** Cmd/Ctrl+? in the app
