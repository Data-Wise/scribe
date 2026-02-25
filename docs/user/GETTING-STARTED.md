# Getting Started with Scribe

A complete guide to using Scribe for ADHD-friendly writing.

---

## Table of Contents

1. [Installation](#installation)
2. [First Launch](#first-launch)
3. [Writing Notes](#writing-notes)
4. [Projects](#projects)
5. [Daily Notes](#daily-notes)
6. [Wiki Links](#wiki-links)
7. [Tags](#tags)
8. [Code Chunks & Quarto](#code-chunks-quarto)
9. [LaTeX Math](#latex-math)
10. [Callouts](#callouts)
11. [AI Integration](#ai-integration)
12. [Export](#export)
13. [Keyboard Shortcuts](#keyboard-shortcuts)

---

## Installation

### Homebrew (Recommended)

```bash
brew tap data-wise/tap
brew install --cask data-wise/tap/scribe
```

### Build from Source

```bash
# Node.js 18+ and Rust required
git clone https://github.com/Data-Wise/scribe
cd scribe
npm install
npm run dev
```

---

## First Launch

1. **App Opens** — Default theme, icon sidebar on left
2. **Create Note** — Click **+ New Note** or press `⌘N`
3. **Start Writing** — No setup needed

### Global Hotkey

**⌘⇧N** — Open Scribe from anywhere (requires Accessibility permissions)

---

## Writing Notes

### Three Editor Modes

| Mode | Shortcut | Description |
|------|----------|-------------|
| **Source** | `⌘1` | Raw markdown with syntax highlighting (CodeMirror 6) |
| **Live Preview** | `⌘2` | Obsidian-style: formatting hides near cursor, LaTeX renders inline |
| **Reading** | `⌘3` | Fully rendered view with clickable links |

Press `⌘E` to cycle between modes.

### Focus Mode

Press **⌘⇧F** to enter distraction-free mode:

- Sidebars collapse
- Editor centers on screen
- Only your words remain

Press **⌘⇧F** or `Escape` to exit.

### Word Count

Always visible in the status bar at the bottom.

### Pomodoro Timer

Click the timer in the status bar to start a 25-minute focus session. Right-click to reset. Configure durations in Settings > General > Focus Timer.

---

## Projects

### Project Types

| Type | Use Case |
|------|----------|
| **Research** | Papers, analysis |
| **Teaching** | Courses, lectures |
| **R-Package** | R package docs |
| **R-Dev** | Dev tools |
| **Generic** | Everything else |

### Creating a Project

1. Press **⌘⇧N** to open the Create Project modal
2. Choose project type
3. Name your project
4. Project is automatically pinned to the sidebar

### Switching Projects

Click a project icon in the sidebar icon bar, or use **⌘⇧1** through **⌘⇧4** for quick-switch to typed project slots.

---

## Daily Notes

### Creating Daily Notes

Press **⌘D** to open/create today's note.

### Built-in Templates

| Template | Use Case |
|----------|----------|
| **Minimal** | Just the date heading |
| **Journaling** | Gratitude, focus, reflections |
| **Research** | Notes, papers, ideas sections |
| **Meeting** | Attendees, agenda, action items |
| **Focus** | Single priority with blockers |

Configure in Settings > Writing > Daily Note Template.

---

## Wiki Links

### Creating Links

Type `[[` to trigger autocomplete:

```
See [[My Other Note]] for more details.
```

### Navigation

Click a wiki link in Live Preview or Reading mode to jump to that note.

### Backlinks

The right sidebar Backlinks panel shows notes that link to the current note.

---

## Tags

### Adding Tags

Type `#` to trigger autocomplete:

```
This is about #research and #causal-inference.
```

### Hierarchical Tags

```markdown
#research/statistics/mediation
#teaching/stat-440
```

### Tag Colors

Tags automatically get consistent colors based on their name.

### Filtering by Tag

Click a tag in the Tags panel (right sidebar) to filter notes.

---

## Code Chunks & Quarto

Scribe has built-in support for [Quarto](https://quarto.org/) documents (`.qmd` files), the publishing system for scientific and technical writing.

### Creating Code Chunks

Type three backticks to trigger autocompletion for executable code blocks:

````
```{r}
library(ggplot2)
ggplot(mtcars, aes(x = mpg, y = hp)) +
  geom_point()
```
````

**Supported languages:** R, Python, Julia, Observable JS, Mermaid, SQL, Bash, and more.

### Chunk Options

Inside a code chunk, type `#|` to trigger autocomplete for chunk options:

````
```{r}
#| label: fig-scatter
#| fig-cap: "Miles per gallon vs horsepower"
#| echo: false
ggplot(mtcars, aes(x = mpg, y = hp)) + geom_point()
```
````

Common chunk options:

| Option | Purpose |
|--------|---------|
| `#| label:` | Name the chunk for cross-references |
| `#| fig-cap:` | Add a figure caption |
| `#| echo: false` | Hide the code in output |
| `#| eval: false` | Show code but don't run it |
| `#| warning: false` | Suppress warning messages |
| `#| tbl-cap:` | Add a table caption |

### Cross-References

Type `@` to trigger cross-reference autocomplete. Scribe scans your document for labels and offers completions:

```markdown
As shown in @fig-scatter, there is a negative relationship.
See @tbl-summary for the full results.
```

| Prefix | References |
|--------|-----------|
| `@fig-` | Figures |
| `@tbl-` | Tables |
| `@eq-` | Equations |
| `@sec-` | Sections |

### YAML Frontmatter

At the top of a `.qmd` file, type inside the `---` block to get Quarto-specific YAML completions:

```yaml
---
title: "My Analysis"
author: "Your Name"
format: html
execute:
  echo: true
  warning: false
bibliography: references.bib
---
```

### Visual Treatment

Code chunks appear with a tinted background and left accent border to distinguish them from prose. This makes it easy to scan between text and code sections in long documents.

---

## LaTeX Math

Scribe renders LaTeX math inline and in display blocks.

### Inline Math

Wrap expressions in single dollar signs:

```markdown
The sample mean is $\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i$.
```

### Display Math

Use double dollar signs for centered equations:

```markdown
$$
\hat{\beta} = (X'X)^{-1}X'y
$$
```

### LaTeX Autocompletion

Type `\` inside math context to trigger LaTeX command completions — Greek letters, operators, environments, and common academic symbols are all available.

### LaTeX Snippets

Common patterns expand automatically in math context:

| Trigger | Expands To |
|---------|-----------|
| `\frac` | `\frac{numerator}{denominator}` |
| `\sum` | `\sum_{i=1}^{n}` |
| `\int` | `\int_{a}^{b}` |
| `\beg` | `\begin{environment}...\end{environment}` |

---

## Callouts

Use Quarto-style callouts for notes, warnings, and tips:

```markdown
> [!note] Important Finding
> The p-value was below the significance threshold.

> [!tip] Writing Tip
> Start with your conclusion, then support it.

> [!warning]
> These results have not been peer-reviewed.
```

### Callout Types

| Type | Color | Use Case |
|------|-------|----------|
| `[!note]` | Blue | General information |
| `[!tip]` | Green | Helpful suggestions |
| `[!warning]` | Orange | Cautions and caveats |
| `[!caution]` | Red | Critical warnings |
| `[!important]` | Purple | Key points |

Callouts render with colored backgrounds and icons in Live Preview and Reading modes.

---

## AI Integration

### Using AI

1. Open the Claude panel in the right sidebar
2. Type your question — it automatically has context from your current note
3. Choose a Quick Action from the Command Palette for common tasks

### Quick Actions

| Action | What it does |
|--------|--------------|
| **Improve** | Enhance clarity and flow |
| **Expand** | Develop the idea further |
| **Summarize** | Condense to key points |
| **Explain** | Simplify complex text |
| **Research** | Find related information |

### Requirements

```bash
# Claude CLI
claude --version

# Gemini CLI
gemini --version
```

No API keys needed — uses your CLI subscriptions.

---

## Export

### Supported Formats

| Format | Extension | Requirements |
|--------|-----------|--------------|
| HTML | .html | None |
| LaTeX | .tex | Pandoc |
| PDF | .pdf | Pandoc + LaTeX |
| Word | .docx | Pandoc |

### Exporting

1. Open a note
2. Press **⌘⇧E** to open the Export dialog
3. Choose format and options
4. Select location

### Citations

If you have Zotero configured:

1. Citations auto-link from `@citekey`
2. Bibliography appended to export
3. Citation style based on project settings

---

## Keyboard Shortcuts

### Essential

| Action | Shortcut |
|--------|----------|
| New note | ⌘N |
| Daily note | ⌘D |
| New project | ⌘⇧N |
| Quick capture | ⌘⇧C |
| Focus mode | ⌘⇧F |
| Command palette | ⌘K |
| Settings | ⌘, |
| Close tab | ⌘W |

### Editor

| Action | Shortcut |
|--------|----------|
| Source mode | ⌘1 |
| Live Preview | ⌘2 |
| Reading mode | ⌘3 |
| Cycle modes | ⌘E |
| Export | ⌘⇧E |

### Navigation

| Action | Shortcut |
|--------|----------|
| Search notes | ⌘F |
| Knowledge graph | ⌘⇧G |
| Left sidebar toggle | ⌘B |
| Right sidebar toggle | ⌘⇧B |
| Terminal | ⌘⌥T |

### Tabs

| Action | Shortcut |
|--------|----------|
| Switch to tab N | ⌘1–⌘9 |
| Close tab | ⌘W |
| Reopen closed tab | ⌘⇧T |

---

## Troubleshooting

### App Won't Start

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm run dev
```

### "App is damaged" Error

```bash
xattr -cr /Applications/Scribe.app
```

### Export Fails

```bash
# Check Pandoc
pandoc --version

# Check LaTeX (for PDF)
pdflatex --version
```

---

## Getting Help

- **Quick Start:** [QUICKSTART.md](QUICKSTART.md)
- **Features Guide:** [Features Overview](../guide/features.md)
- **Changelog:** [CHANGELOG.md](../reference/CHANGELOG.md)
