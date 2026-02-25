# Terminal Integration Tutorial

> **Run commands directly in Scribe with smart working directory**

---

## What You'll Learn

- Open and use the embedded terminal
- Understand smart working directory inference
- Run common development commands
- Customize terminal settings

**Time:** 5 minutes
**Prerequisites:** None

---

## Step 1: Open the Terminal

### Method 1: Keyboard Shortcut

Press **⌘⌥T** (Command + Option + T) from anywhere in Scribe.

### Method 2: Right Sidebar

1. Look at the right sidebar tab bar
2. Click the **Terminal** tab
3. Terminal panel opens

**Result:** You should see a zsh prompt with your project directory.

---

## Step 2: Check Your Working Directory

The terminal automatically opens in your project's directory:

```bash
# You should see something like:
~/projects/research/mediation-planning $
```

### How Smart Directory Works

Scribe infers the working directory based on your project type:

| Project Type | Working Directory |
|--------------|-------------------|
| Research | `~/projects/research/[project-name]` |
| Teaching | `~/projects/teaching/[course-name]` |
| R Package | `~/projects/r-packages/[package-name]` |
| R Dev | `~/projects/dev-tools/[tool-name]` |
| Generic | `~/projects/[project-name]` |
| No Project | `~` (home directory) |

**Example:**

```bash
# Project: "Mediation Planning" (Research type)
# Terminal opens at: ~/projects/research/mediation-planning
```

---

## Step 3: Run Common Commands

### Git Operations

```bash
# Check status
git status

# View recent commits
git log --oneline -5

# Create a branch
git checkout -b feature/new-analysis
```

### R Development

```bash
# Check R package
R CMD check .

# Run tests
Rscript -e "devtools::test()"

# Build documentation
Rscript -e "devtools::document()"
```

### Quarto Rendering

```bash
# Render a manuscript
quarto render manuscript.qmd

# Preview a presentation
quarto preview slides.qmd
```

### Python/Node Projects

```bash
# Install dependencies
npm install
# or
pip install -r requirements.txt

# Run tests
npm test
# or
pytest
```

---

## Step 4: Customize Working Directory

### Per-Project Override

1. Click **Settings** icon in Mission Control
2. Find your project card
3. Set `workingDirectory` in project settings:

```json
{
  "name": "My Project",
  "type": "research",
  "workingDirectory": "/custom/path/to/project"
}
```

### Global Default

1. Open App Settings (⌘,)
2. Navigate to **Terminal** section
3. Set `defaultWorkingDirectory`:

```json
{
  "terminal": {
    "defaultWorkingDirectory": "~/projects"
  }
}
```

---

## Step 5: Terminal Features

### Clickable URLs

```bash
# Open a URL in terminal output
echo "Visit https://github.com"
# Click the URL to open in browser
```

### Copy/Paste

- **Copy:** ⌘C (works like standard terminal)
- **Paste:** ⌘V

### Clear Screen

```bash
# Clear terminal
clear
# or
⌘K (same as iTerm2/Terminal.app)
```

### Resize Terminal

Drag the terminal panel separator up/down to resize.

---

## Common Workflows

### Workflow 1: Research Analysis

```bash
# 1. Navigate to analysis directory
cd analysis

# 2. Run R script
Rscript simulation.R

# 3. Render results
quarto render results.qmd

# 4. Commit changes
git add .
git commit -m "Update simulation results"
```

### Workflow 2: Package Development

```bash
# 1. Check package
R CMD check .

# 2. Run tests
Rscript -e "devtools::test()"

# 3. Build documentation
Rscript -e "devtools::document()"

# 4. Install locally
R CMD INSTALL .
```

### Workflow 3: Teaching Materials

```bash
# 1. Navigate to lecture directory
cd lectures/week-05

# 2. Render slides
quarto render slides.qmd

# 3. Open PDF
open slides.pdf

# 4. Publish to GitHub Pages
quarto publish gh-pages
```

---

## Troubleshooting

### Terminal Opens in Wrong Directory

**Problem:** Terminal opens in `~` instead of project directory

**Solutions:**

1. **Check project type:**
   - Mission Control → Hover over project card
   - Verify type is set correctly

2. **Verify directory exists:**
   ```bash
   ls ~/projects/research/your-project-name
   ```

3. **Set custom path:**
   - Edit project settings
   - Add `workingDirectory` field

### Terminal Doesn't Open

**Problem:** ⌘⌥T doesn't work or terminal icon is grayed out

**Solutions:**

1. **Check PTY support:**
   - Terminal requires portable-pty (Tauri only)
   - Browser mode shows "Terminal unavailable"

2. **Restart Scribe:**
   - Close and reopen the app
   - Check terminal panel appears

### Commands Not Found

**Problem:** `R`, `quarto`, `git` not recognized

**Solutions:**

1. **Check PATH:**
   ```bash
   echo $PATH
   ```

2. **Source shell profile:**
   ```bash
   source ~/.zshrc
   # or
   source ~/.bash_profile
   ```

3. **Install missing tools:**
   ```bash
   # Install R
   brew install r

   # Install Quarto
   brew install quarto
   ```

---

## Advanced Usage

### Running Long Commands

For commands that take > 30 seconds:

```bash
# Run in background
npm run build &

# Or use nohup
nohup python long_simulation.py &
```

### Multiple Commands

```bash
# Sequential (runs if previous succeeds)
git add . && git commit -m "Update" && git push

# Sequential (always runs)
R CMD check . ; echo "Check complete"
```

### Environment Variables

```bash
# Set for session
export MY_VAR="value"

# Persist in ~/.zshrc
echo 'export MY_VAR="value"' >> ~/.zshrc
source ~/.zshrc
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘⌥T | Toggle terminal panel |
| ⌘K | Clear terminal |
| ⌘C | Copy selection |
| ⌘V | Paste |
| Ctrl+C | Interrupt running command |
| Ctrl+D | Exit terminal session |

---

## Next Steps

- **Try it:** Open terminal and run `git status`
- **Customize:** Set your preferred default directory
- **Integrate:** Use terminal for your development workflow
- **Learn more:** [Keyboard Shortcuts](../guide/shortcuts.md)

---

## See Also

- [Project System Tutorial](./projects.md) - Create and manage projects
- [Daily Notes Tutorial](./daily-notes.md) - Use daily notes with Quarto
- [Features Overview](../guide/features.md) - All Scribe features
